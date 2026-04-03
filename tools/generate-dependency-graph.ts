#!/usr/bin/env node
// @ts-nocheck

/**
 * Dependency Graph Generator for Math.js
 *
 * Analyzes the codebase and generates a comprehensive dependency graph showing:
 * - File-level imports (which files import which)
 * - Function-level dependencies (factory dependencies)
 * - Folder-level aggregated dependencies
 *
 * Outputs:
 * - dependency-graph.json (machine-readable)
 * - dependency-graph.md (human-readable markdown)
 * - dependency-graph.mermaid (visualization diagram)
 *
 * Scans: .js, .ts (source), .rs (Rust WASM)
 */

import fs from 'fs';
import path from 'path';
import { parseSync } from '@babel/core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');
const WASM_RUST_DIR = path.join(__dirname, '..', 'src', 'wasm-rust', 'crates', 'mathjs-wasm', 'src');
const OUTPUT_DIR = __dirname; // Output to tools/ folder

// Graph data structure
const graph = {
  files: {},
  folders: {},
  functions: {},
  rustExports: {},
  stats: {
    totalFiles: 0,
    jsFiles: 0,
    tsFiles: 0,
    rsFiles: 0,
    totalFunctions: 0,
    totalRustExports: 0,
    totalDependencies: 0,
    avgDependenciesPerFile: 0,
    mostDependedOn: [],
    circularDependencies: []
  }
};

/**
 * Parse a JavaScript file and extract dependencies
 */
function parseFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath).replace(/\\/g, '/');

  const fileInfo = {
    path: relativePath,
    imports: [],
    exports: [],
    factoryDependencies: [],
    factoryName: null,
    isFactory: false
  };

  try {
    const isTS = filePath.endsWith('.ts');
    const ast = parseSync(code, {
      sourceType: 'module',
      filename: filePath,
      presets: isTS ? [['@babel/preset-typescript', { allExtensions: true }]] : [],
      plugins: isTS ? [] : []
    });

    // Extract imports
    ast.program.body.forEach(node => {
      if (node.type === 'ImportDeclaration') {
        fileInfo.imports.push({
          source: node.source.value,
          specifiers: node.specifiers.map(s => ({
            imported: s.imported?.name || s.local.name,
            local: s.local.name
          }))
        });
      }

      // Extract exports
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach(decl => {
              fileInfo.exports.push(decl.id.name);
            });
          } else if (node.declaration.type === 'FunctionDeclaration') {
            fileInfo.exports.push(node.declaration.id.name);
          }
        }
      }

      // Extract factory dependencies
      if (node.type === 'ExportNamedDeclaration' &&
          node.declaration?.type === 'VariableDeclaration') {
        const decl = node.declaration.declarations[0];
        if (decl?.init?.type === 'CallExpression' &&
            decl.init.callee.name === 'factory') {
          fileInfo.isFactory = true;
          fileInfo.factoryName = decl.id.name;

          // Get factory name (first argument)
          const nameArg = decl.init.arguments[0];
          if (nameArg?.type === 'Literal') {
            fileInfo.factoryName = nameArg.value;
          } else if (nameArg?.type === 'Identifier') {
            // Look for const name = 'xxx' earlier in file
            ast.program.body.forEach(n => {
              if (n.type === 'VariableDeclaration') {
                const nameDecl = n.declarations.find(d => d.id.name === nameArg.name);
                if (nameDecl?.init?.type === 'Literal') {
                  fileInfo.factoryName = nameDecl.init.value;
                }
              }
            });
          }

          // Get dependencies array (second argument)
          const depsArg = decl.init.arguments[1];
          if (depsArg?.type === 'ArrayExpression') {
            fileInfo.factoryDependencies = depsArg.elements
              .filter(el => el?.type === 'Literal')
              .map(el => el.value.replace(/^\?/, '')); // Remove optional prefix
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error parsing ${relativePath}:`, error.message);
  }

  return fileInfo;
}

/**
 * Recursively find all source files (.js, .ts) in a directory
 * Excludes: node_modules, conflicted copies, wasm-rust (scanned separately)
 */
function findSourceFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'wasm-rust' || entry.name === 'target') continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        if (entry.name.includes('conflicted')) continue;
        if (entry.name.endsWith('.d.ts')) continue;
        if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Find all Rust source files in the wasm-rust crate
 */
function findRustFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && entry.name !== 'target') {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.rs') && !entry.name.includes('conflicted')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Parse a Rust file and extract extern "C" fn exports
 */
function parseRustFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(
    path.join(SRC_DIR, 'wasm-rust', 'crates', 'mathjs-wasm', 'src'), filePath
  ).replace(/\\/g, '/');

  const exports = [];
  const fnPattern = /(?:#\[export_name\s*=\s*"(\w+)"\]|#\[no_mangle\])\s*pub\s+unsafe\s+extern\s+"C"\s+fn\s+(\w+)\s*\(/g;
  let match;
  while ((match = fnPattern.exec(code)) !== null) {
    const exportName = match[1] || match[2];
    exports.push(exportName);
  }

  return { path: 'wasm-rust/' + relativePath, exports, lines: code.split('\n').length };
}

/**
 * Build the dependency graph
 */
function buildGraph() {
  // Scan JS/TS source files
  console.log('Scanning source files (.js + .ts)...');
  const files = findSourceFiles(SRC_DIR);

  const jsCount = files.filter(f => f.endsWith('.js')).length;
  const tsCount = files.filter(f => f.endsWith('.ts')).length;
  console.log(`Found ${files.length} source files (${jsCount} JS, ${tsCount} TS)`);

  graph.stats.totalFiles = files.length;
  graph.stats.jsFiles = jsCount;
  graph.stats.tsFiles = tsCount;

  // Parse all JS/TS files
  files.forEach((filePath, index) => {
    if ((index + 1) % 100 === 0) {
      console.log(`   Parsed ${index + 1}/${files.length} files...`);
    }

    const fileInfo = parseFile(filePath);
    graph.files[fileInfo.path] = fileInfo;

    if (fileInfo.isFactory) {
      graph.stats.totalFunctions++;
      graph.functions[fileInfo.factoryName] = {
        file: fileInfo.path,
        dependencies: fileInfo.factoryDependencies
      };
    }
  });

  console.log(`Parsed ${files.length} source files`);
  console.log(`Found ${graph.stats.totalFunctions} factory functions`);

  // Scan Rust WASM files
  console.log('\nScanning Rust WASM files (.rs)...');
  const rustFiles = findRustFiles(WASM_RUST_DIR);
  graph.stats.rsFiles = rustFiles.length;

  rustFiles.forEach(filePath => {
    const info = parseRustFile(filePath);
    graph.rustExports[info.path] = info;
    graph.stats.totalRustExports += info.exports.length;
  });

  console.log(`Found ${rustFiles.length} Rust files with ${graph.stats.totalRustExports} exports`);

  // Build folder-level dependencies
  buildFolderDependencies();

  // Calculate statistics
  calculateStatistics();
}

/**
 * Build folder-level dependencies by aggregating file-level dependencies
 */
function buildFolderDependencies() {
  const folderDeps = {};

  Object.values(graph.files).forEach(file => {
    const folder = path.dirname(file.path);

    if (!folderDeps[folder]) {
      folderDeps[folder] = new Set();
    }

    file.imports.forEach(imp => {
      // Resolve relative import to absolute path
      const resolvedPath = resolveImport(file.path, imp.source);
      if (resolvedPath) {
        const depFolder = path.dirname(resolvedPath);
        if (depFolder !== folder) {
          folderDeps[folder].add(depFolder);
        }
      }
    });
  });

  // Convert Sets to Arrays
  Object.entries(folderDeps).forEach(([folder, deps]) => {
    graph.folders[folder] = Array.from(deps).sort();
  });
}

/**
 * Resolve a relative import to an absolute path within src/
 */
function resolveImport(fromFile, importPath) {
  if (importPath.startsWith('.')) {
    const fromDir = path.dirname(fromFile);
    const resolved = path.join(fromDir, importPath).replace(/\\/g, '/');

    // Try multiple extension resolutions:
    // 1. As-is (exact path)
    // 2. .js → .js (original behavior)
    // 3. .ts → .ts (TS files importing .ts)
    // 4. .js → .ts (math.js convention: TS files import with .js extension)
    const base = resolved.replace(/\.(js|ts)$/, '');
    const candidates = [
      resolved,
      base + '.js',
      base + '.ts',
    ];

    for (const candidate of candidates) {
      if (graph.files[candidate]) return candidate;
    }

    return null;
  }
  return null; // External import
}

/**
 * Calculate statistics
 */
function calculateStatistics() {
  const depCounts = Object.values(graph.files).map(f =>
    f.imports.length + f.factoryDependencies.length
  );

  graph.stats.totalDependencies = depCounts.reduce((a, b) => a + b, 0);
  graph.stats.avgDependenciesPerFile = (graph.stats.totalDependencies / graph.stats.totalFiles).toFixed(2);

  // Find most depended-on files
  const dependedOn = {};
  Object.values(graph.files).forEach(file => {
    file.imports.forEach(imp => {
      const resolved = resolveImport(file.path, imp.source);
      if (resolved) {
        dependedOn[resolved] = (dependedOn[resolved] || 0) + 1;
      }
    });
  });

  graph.stats.mostDependedOn = Object.entries(dependedOn)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([file, count]) => ({ file, count }));
}

/**
 * Generate JSON output
 */
function generateJSON() {
  const outputPath = path.join(OUTPUT_DIR, 'dependency-graph.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
  console.log(`✅ Generated: dependency-graph.json`);
}

/**
 * Generate Markdown documentation
 */
function generateMarkdown() {
  let md = '# Math.js Dependency Graph\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += '## Statistics\n\n';
  md += `- **Total Source Files**: ${graph.stats.totalFiles} (${graph.stats.jsFiles} JS, ${graph.stats.tsFiles} TS)\n`;
  md += `- **Rust WASM Files**: ${graph.stats.rsFiles} (.rs files, ${graph.stats.totalRustExports} exports)\n`;
  md += `- **Total Factory Functions**: ${graph.stats.totalFunctions}\n`;
  md += `- **Total Dependencies**: ${graph.stats.totalDependencies}\n`;
  md += `- **Average Dependencies per File**: ${graph.stats.avgDependenciesPerFile}\n\n`;

  // Rust WASM exports summary
  if (Object.keys(graph.rustExports).length > 0) {
    md += '## Rust WASM Exports\n\n';
    md += '| Module | Exports | Lines |\n';
    md += '|--------|---------|-------|\n';
    Object.entries(graph.rustExports)
      .sort((a, b) => b[1].exports.length - a[1].exports.length)
      .forEach(([, info]) => {
        md += `| ${info.path} | ${info.exports.length} | ${info.lines} |\n`;
      });
    md += '\n';
  }

  md += '## Most Depended-On Files\n\n';
  md += '| Rank | File | Dependents |\n';
  md += '|------|------|------------|\n';
  graph.stats.mostDependedOn.forEach((item, index) => {
    md += `| ${index + 1} | ${item.file} | ${item.count} |\n`;
  });
  md += '\n';

  md += '## Folder Dependencies\n\n';
  Object.entries(graph.folders)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([folder, deps]) => {
      if (deps.length > 0) {
        md += `### \`${folder}/\`\n\n`;
        md += 'Depends on:\n';
        deps.forEach(dep => {
          md += `- \`${dep}/\`\n`;
        });
        md += '\n';
      }
    });

  const outputPath = path.join(OUTPUT_DIR, 'dependency-graph.md');
  fs.writeFileSync(outputPath, md);
  console.log(`✅ Generated: dependency-graph.md`);
}

/**
 * Generate Mermaid diagram
 */
function generateMermaid() {
  let mermaid = 'graph TD\n';

  // Add top-level folder relationships (simplified)
  const topFolders = new Set();
  Object.keys(graph.folders).forEach(folder => {
    const parts = folder.split('/');
    if (parts.length >= 2) {
      topFolders.add(parts[0] + '/' + parts[1]);
    }
  });

  const folderDeps = {};
  Array.from(topFolders).forEach(folder => {
    folderDeps[folder] = new Set();
  });

  Object.entries(graph.folders).forEach(([folder, deps]) => {
    const parts = folder.split('/');
    if (parts.length >= 2) {
      const topFolder = parts[0] + '/' + parts[1];
      deps.forEach(dep => {
        const depParts = dep.split('/');
        if (depParts.length >= 2) {
          const depTopFolder = depParts[0] + '/' + depParts[1];
          if (topFolder !== depTopFolder) {
            folderDeps[topFolder].add(depTopFolder);
          }
        }
      });
    }
  });

  // Generate diagram
  Object.entries(folderDeps).forEach(([folder, deps]) => {
    const safeFolder = folder.replace(/[/.-]/g, '_');
    mermaid += `  ${safeFolder}["${folder}"]\n`;
    Array.from(deps).forEach(dep => {
      const safeDep = dep.replace(/[/.-]/g, '_');
      mermaid += `  ${safeFolder} --> ${safeDep}\n`;
    });
  });

  const outputPath = path.join(OUTPUT_DIR, 'dependency-graph.mermaid');
  fs.writeFileSync(outputPath, mermaid);
  console.log(`✅ Generated: dependency-graph.mermaid`);
}

// Main execution
console.log('🚀 Math.js Dependency Graph Generator\n');

buildGraph();
console.log('\n📝 Generating outputs...\n');
generateJSON();
generateMarkdown();
generateMermaid();

console.log('\n✅ All outputs generated successfully!\n');
console.log('Files created:');
console.log('  - dependency-graph.json (detailed data)');
console.log('  - dependency-graph.md (human-readable documentation)');
console.log('  - dependency-graph.mermaid (visual diagram)');
