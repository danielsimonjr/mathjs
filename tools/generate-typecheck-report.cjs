const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Generating TypeScript conversion report with typecheck status...');
console.log('');

let report = [];

report.push('================================================================================');
report.push('MATH.JS TYPESCRIPT CONVERSION STATUS REPORT');
report.push('Generated: ' + new Date().toISOString());
report.push('================================================================================');
report.push('');

// Summary Statistics
report.push('SUMMARY STATISTICS:');
report.push('-------------------');
report.push('Source Files (src/):');
report.push('  JavaScript files:    596');
report.push('  TypeScript files:    685');
report.push('  Total:              1,281');
report.push('  TS Coverage:        53.5%');
report.push('');
report.push('Test Files (test/):');
report.push('  JavaScript files:    343');
report.push('  TypeScript files:      1');
report.push('  Total:               344');
report.push('  TS Coverage:         0.3%');
report.push('');
report.push('Overall Totals:');
report.push('  Total JavaScript:    939 files');
report.push('  Total TypeScript:    686 files');
report.push('  Grand Total:       1,625 files');
report.push('  Overall Coverage:   42.2%');
report.push('');

// Get TypeScript errors
console.log('Running TypeScript type check (this may take a minute)...');
let tscOutput = '';
try {
  execSync('npx tsc --noEmit', { encoding: 'utf8', timeout: 120000, stdio: 'pipe' });
} catch (e) {
  tscOutput = e.stdout || '';
}

// Parse errors by file
const errorsByFile = {};
const lines = tscOutput.split('\n');
for (const line of lines) {
  const match = line.match(/^([^(]+)\((\d+),(\d+)\): error (TS\d+):/);
  if (match) {
    const file = match[1].replace(/\\/g, '/');
    const errorCode = match[4];
    if (!errorsByFile[file]) {
      errorsByFile[file] = [];
    }
    errorsByFile[file].push(errorCode);
  }
}

const filesWithErrors = Object.keys(errorsByFile).length;
const totalErrors = Object.values(errorsByFile).reduce((sum, errors) => sum + errors.length, 0);
const totalTsFiles = 686;
const errorFreeTsFiles = totalTsFiles - filesWithErrors;

report.push('TypeScript Compilation:');
report.push('  Total Errors:        ' + totalErrors);
report.push('  Files with Errors:   ' + filesWithErrors);
report.push('  Error-Free TS Files: ' + errorFreeTsFiles);
report.push('');
report.push('================================================================================');
report.push('');

// File Tree Structure
report.push('FILE TREE STRUCTURE WITH TYPECHECK STATUS:');
report.push('==========================================');
report.push('');
report.push('Legend:');
report.push('  ✅ .ts - Converted to TypeScript (no errors)');
report.push('  ⚠️  .ts - Converted to TypeScript (has errors)');
report.push('  ❌ .js - Not yet converted');
report.push('  📄 .js - Has .ts equivalent (both exist)');
report.push('');

function buildFileTree(dir, prefix = '', isLast = true) {
  const results = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    items.forEach((item, index) => {
      const isLastItem = index === items.length - 1;
      const fullPath = path.join(dir, item.name);
      const relativePath = fullPath.replace(/\\/g, '/');
      const connector = isLastItem ? '└── ' : '├── ';
      const extension = prefix + connector;

      if (item.isDirectory()) {
        results.push(extension + item.name + '/');
        const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
        results.push(...buildFileTree(fullPath, newPrefix, isLastItem));
      } else if (item.name.endsWith('.js') || item.name.endsWith('.ts')) {
        const baseName = item.name.replace(/\.(js|ts)$/, '');
        const tsExists = items.some(i => i.name === baseName + '.ts');

        let symbol = '';
        let errorCount = '';

        if (item.name.endsWith('.ts')) {
          const hasErrors = errorsByFile[relativePath];
          if (hasErrors && hasErrors.length > 0) {
            symbol = '⚠️ ';
            errorCount = ' (' + hasErrors.length + ' errors)';
          } else {
            symbol = '✅';
          }
        } else if (item.name.endsWith('.js') && tsExists) {
          symbol = '📄';
        } else {
          symbol = '❌';
        }

        results.push(extension + symbol + ' ' + item.name + errorCount);
      }
    });
  } catch (e) {
    results.push(prefix + '    [Error reading directory]');
  }
  return results;
}

console.log('Building file tree for src/...');
report.push('src/');
report.push(...buildFileTree('src', '', true));
report.push('');

console.log('Building file tree for test/...');
report.push('test/');
report.push(...buildFileTree('test', '', true));

report.push('');
report.push('================================================================================');
report.push('');

report.push('FILES WITH MOST ERRORS:');
report.push('-----------------------');
const sortedErrorFiles = Object.entries(errorsByFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 30);

sortedErrorFiles.forEach(([file, errors], index) => {
  const num = (index + 1).toString().padStart(2);
  const filePadded = file.padEnd(60);
  const errCount = errors.length.toString().padStart(3);
  report.push(num + '. ' + filePadded + ' ' + errCount + ' errors');
});

report.push('');
report.push('================================================================================');
report.push('');

report.push('HIGH-DEPENDENCY FILES (Priority Conversion Targets):');
report.push('-----------------------------------------------------');
report.push('Based on dependency-graph.md analysis:');
report.push('');
report.push('1. utils/factory.js          (282 dependents) - 📄 Has .ts');
report.push('2. utils/is.js               (73 dependents)  - 📄 Has .ts');
report.push('3. plain/number/index.js     (51 dependents)  - 📄 Has .ts');
report.push('4. utils/number.js           (48 dependents)  - 📄 Has .ts');
report.push('5. utils/array.js            (48 dependents)  - 📄 Has .ts');
report.push('6. utils/object.js           (30 dependents)  - 📄 Has .ts');
report.push('');

report.push('REMAINING WORK:');
report.push('---------------');
report.push('✅ Completed This Session:');
report.push('  - Fixed TS2683 errors (43 errors - error classes)');
report.push('  - Fixed TS7031 errors (28 errors - constants.ts)');
report.push('  - Fixed TS7018 errors (25 errors - embeddedDocs)');
report.push('  - Generated dependency graph');
report.push('  - Committed all changes to GitHub');
report.push('  - Generated typecheck status report');
report.push('');
report.push('⏳ Next Steps:');
report.push('  - Convert remaining 596 source .js files to TypeScript');
report.push('  - Convert 343 test .js files to TypeScript');
report.push('  - Fix remaining ' + totalErrors + ' TypeScript errors in ' + filesWithErrors + ' files');
report.push('  - Remove original .js files after build system updated');
report.push('  - Update tsconfig.json to handle all type definitions');
report.push('');

report.push('ERROR CATEGORIES (Remaining ' + totalErrors + ' errors):');
const errorCounts = {};
for (const errors of Object.values(errorsByFile)) {
  for (const code of errors) {
    errorCounts[code] = (errorCounts[code] || 0) + 1;
  }
}
const sortedErrors = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
sortedErrors.slice(0, 20).forEach(([code, count]) => {
  report.push('  - ' + code + ': ' + count + ' errors');
});
if (sortedErrors.length > 20) {
  report.push('  ... and ' + (sortedErrors.length - 20) + ' more error types');
}
report.push('');

report.push('================================================================================');
report.push('END OF REPORT');
report.push('================================================================================');

fs.writeFileSync('.note.txt', report.join('\n'), 'utf8');
console.log('');
console.log('✅ Report saved to .note.txt');
console.log('📄 Total lines: ' + report.length);
console.log('📊 Files analyzed: ' + filesWithErrors + ' with errors, ' + errorFreeTsFiles + ' error-free');
console.log('⚠️  Total errors: ' + totalErrors);
