#!/usr/bin/env node
// @ts-nocheck

/**
 * Review TypeScript files one by one based on dependency graph ranking
 * Type-checks each file individually and reports issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graph = JSON.parse(fs.readFileSync(path.join(__dirname, 'dependency-graph.json'), 'utf-8'));
const srcDir = path.join(__dirname, '..', 'src');

// Get top TypeScript files by dependent count
const tsFiles = graph.stats.mostDependedOn
  .filter(item => fs.existsSync(path.join(srcDir, item.file.replace('.js', '.ts'))))
  .slice(0, 30); // Top 30

console.log('📋 Reviewing TypeScript Files by Dependency Rank\n');
console.log('=' . repeat(70));

const results = [];

for (let i = 0; i < tsFiles.length; i++) {
  const item = tsFiles[i];
  const tsFile = item.file.replace('.js', '.ts');
  const fullPath = path.join(srcDir, tsFile);

  console.log(`\n${i+1}. ${tsFile} (${item.count} dependents)`);
  console.log('-'.repeat(70));

  try {
    // Type-check the file in isolation (skip lib check to be faster)
    const output = execSync(
      `npx tsc --noEmit --skipLibCheck --isolatedModules ${fullPath}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    console.log('✅ No type errors');
    results.push({ file: tsFile, rank: i+1, dependents: item.count, status: 'pass', errors: 0 });

  } catch (error) {
    const errorOutput = error.stdout || error.stderr || '';
    const errorLines = errorOutput.split('\n').filter(line =>
      line.includes('error TS') && !line.includes('node_modules')
    );

    const errorCount = errorLines.length;
    console.log(`❌ ${errorCount} type error(s):`);

    // Show first 5 errors
    errorLines.slice(0, 5).forEach(line => {
      const match = line.match(/error (TS\d+): (.+)/);
      if (match) {
        console.log(`   ${match[1]}: ${match[2]}`);
      }
    });

    if (errorCount > 5) {
      console.log(`   ... and ${errorCount - 5} more errors`);
    }

    results.push({ file: tsFile, rank: i+1, dependents: item.count, status: 'fail', errors: errorCount });
  }
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 Summary\n');

const passing = results.filter(r => r.status === 'pass');
const failing = results.filter(r => r.status === 'fail');

console.log(`✅ Passing: ${passing.length}/${results.length}`);
console.log(`❌ Failing: ${failing.length}/${results.length}`);

if (failing.length > 0) {
  console.log('\n🔴 Files with errors (ordered by impact):');
  failing
    .sort((a, b) => b.dependents - a.dependents)
    .forEach(r => {
      console.log(`   ${r.rank}. ${r.file} (${r.dependents} deps) - ${r.errors} errors`);
    });
}

console.log('\n💡 Recommendation: Fix files in dependency order (top to bottom)');
console.log('   Files with more dependents have higher impact when fixed.\n');
