#!/usr/bin/env node

/**
 * Script to fix @typescript-eslint/no-unused-vars errors in TypeScript files
 *
 * Fixes two types of issues:
 * 1. Unused type imports - converts to type-only imports
 * 2. Unused function parameters - prefixes with underscore
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get lint errors
console.log('Running linter to find errors...');
const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

// Parse lint errors
const errors = [];
const lines = lintOutput.split('\n');
let currentFile = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Check if this is a file path
  if (line.startsWith('/home/user/mathjs/src/') && line.endsWith('.ts')) {
    currentFile = line;
  }
  // Check if this is an error line
  else if (currentFile && line.includes('@typescript-eslint/no-unused-vars')) {
    const match = line.match(/^\s*(\d+):(\d+)\s+error\s+'([^']+)' is defined but never used/);
    if (match) {
      const [, lineNum, col, varName] = match;
      const isTypeImport = line.includes('Allowed unused vars must match');
      const isArg = line.includes('Allowed unused args must match');

      errors.push({
        file: currentFile,
        line: parseInt(lineNum),
        col: parseInt(col),
        varName,
        isTypeImport,
        isArg
      });
    }
  }
}

// Filter to only src/ files, exclude test files
const srcErrors = errors.filter(e =>
  e.file.includes('/src/') &&
  !e.file.includes('/test/')
);

console.log(`Found ${srcErrors.length} errors in src/ directory`);

// Group errors by file
const errorsByFile = {};
for (const error of srcErrors) {
  if (!errorsByFile[error.file]) {
    errorsByFile[error.file] = [];
  }
  errorsByFile[error.file].push(error);
}

console.log(`Files to fix: ${Object.keys(errorsByFile).length}`);

let filesFixed = 0;
let totalFixes = 0;

// Process each file
for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const lines = content.split('\n');

    // Sort errors by line number descending to avoid line number shifts
    fileErrors.sort((a, b) => b.line - a.line);

    for (const error of fileErrors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= lines.length) continue;

      const originalLine = lines[lineIndex];
      let newLine = originalLine;

      // Handle type imports
      if (error.isTypeImport && !error.isArg) {
        // Convert regular import to type-only import
        // Pattern: import { TypeName } from '...'
        // Convert to: import type { TypeName } from '...'

        if (originalLine.includes(`import { ${error.varName}`) &&
            !originalLine.includes('import type {')) {
          // Check if it's a single import
          const singleImportMatch = originalLine.match(/^(\s*)import\s+{\s*([^}]+)\s*}\s+from\s+(['"][^'"]+['"])/);
          if (singleImportMatch) {
            const [, indent, imports, fromPath] = singleImportMatch;
            const importList = imports.split(',').map(s => s.trim());

            if (importList.length === 1 && importList[0] === error.varName) {
              // Single import - convert to type import
              newLine = `${indent}import type { ${error.varName} } from ${fromPath}`;
            } else if (importList.includes(error.varName)) {
              // Multiple imports - need to split
              const typeImports = [error.varName];
              const valueImports = importList.filter(imp => imp !== error.varName);

              if (valueImports.length > 0) {
                newLine = `${indent}import { ${valueImports.join(', ')} } from ${fromPath}\n${indent}import type { ${typeImports.join(', ')} } from ${fromPath}`;
              } else {
                newLine = `${indent}import type { ${typeImports.join(', ')} } from ${fromPath}`;
              }
            }
          }
        }
      }

      // Handle unused function parameters/variables
      if (error.isArg || (!error.isTypeImport && originalLine.includes(error.varName))) {
        // Prefix with underscore
        // Use word boundary to avoid partial replacements
        const regex = new RegExp(`\\b${error.varName}\\b`, 'g');

        // Only replace if it's a parameter declaration, not usage
        if (originalLine.match(/^\s*(function|const|let|var|\([^)]*|,\s*|{\s*)/) ||
            originalLine.includes(`:`) || // Type annotation
            originalLine.includes(`${error.varName},`) ||
            originalLine.includes(`${error.varName}:`) ||
            originalLine.includes(`${error.varName})`) ||
            originalLine.includes(`${error.varName} =`)) {
          newLine = originalLine.replace(regex, `_${error.varName}`);
        }
      }

      if (newLine !== originalLine) {
        lines[lineIndex] = newLine;
        modified = true;
        totalFixes++;
      }
    }

    if (modified) {
      const newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesFixed++;
      console.log(`Fixed ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

console.log(`\nSummary:`);
console.log(`Files fixed: ${filesFixed}`);
console.log(`Total fixes applied: ${totalFixes}`);
