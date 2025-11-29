#!/usr/bin/env node

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
 */

import fs from 'fs';
import path from 'path';
import { parseSync } from '@babel/core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUTPUT_DIR = __dirname; // Output to tools/ folder

// Graph data structure
const graph = {
  files: {},
  folders: {},
  functions: {},
  stats: {
    totalFiles: 0,
    totalFunctions: 0,
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
    const ast = parseSync(code, {
      sourceType: 'module'
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
 * Recursively find all .js files in a directory
 */
function findJSFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Build the dependency graph
 */
function buildGraph() {
  console.log('🔍 Scanning JavaScript files...');
  const files = findJSFiles(SRC_DIR);

  console.log(`📊 Found ${files.length} JavaScript files`);
  graph.stats.totalFiles = files.length;

  // Parse all files
  files.forEach((filePath, index) => {
    if ((index + 1) % 50 === 0) {
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

  console.log(`✅ Parsed ${files.length} files`);
  console.log(`📦 Found ${graph.stats.totalFunctions} factory functions`);

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

    // Remove .js extension if present, then add it back
    const normalized = resolved.replace(/\.js$/, '') + '.js';

    return graph.files[normalized] ? normalized : null;
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
  md += `- **Total Files**: ${graph.stats.totalFiles}\n`;
  md += `- **Total Factory Functions**: ${graph.stats.totalFunctions}\n`;
  md += `- **Total Dependencies**: ${graph.stats.totalDependencies}\n`;
  md += `- **Average Dependencies per File**: ${graph.stats.avgDependenciesPerFile}\n\n`;

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
