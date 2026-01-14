#!/usr/bin/env node
/**
 * Find JavaScript files to convert to TypeScript
 * Provides full breakdown of all JS files
 */

import fs from 'fs';
import path from 'path';

function countFiles(dir, results = { jsOnly: [], jsWithTs: [], embeddedDocs: [] }) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !full.includes('node_modules')) {
      countFiles(full, results);
    } else if (item.endsWith('.js')) {
      const tsFile = full.replace('.js', '.ts');
      const hasTs = fs.existsSync(tsFile);
      const content = fs.readFileSync(full, 'utf-8');
      const lines = content.split('\n').length;
      const relativePath = path.relative('src', full).split(path.sep).join('/');
      const isEmbeddedDoc = full.includes('embeddedDocs');

      const fileInfo = { path: relativePath, lines, hasTs };

      if (isEmbeddedDoc) {
        results.embeddedDocs.push(fileInfo);
      } else if (hasTs) {
        results.jsWithTs.push(fileInfo);
      } else {
        results.jsOnly.push(fileInfo);
      }
    }
  }
  return results;
}

const results = countFiles('src');

// Sort by line count
results.jsOnly.sort((a, b) => a.lines - b.lines);
results.jsWithTs.sort((a, b) => a.lines - b.lines);
results.embeddedDocs.sort((a, b) => a.lines - b.lines);

const total = results.embeddedDocs.length + results.jsWithTs.length + results.jsOnly.length;

console.log('=== BREAKDOWN OF', total, 'JAVASCRIPT FILES ===\n');
console.log('1. embeddedDocs (skipping):', results.embeddedDocs.length, 'files');
console.log('2. JS with TS equivalent (keeping for benchmarks):', results.jsWithTs.length, 'files');
console.log('3. JS WITHOUT TS equivalent (NEED CONVERSION):', results.jsOnly.length, 'files');

if (results.jsOnly.length > 0) {
  console.log('\n=== FILES NEEDING CONVERSION (sorted by complexity) ===');
  results.jsOnly.forEach((f, i) => console.log(`${i + 1}. ${f.path} (${f.lines} lines)`));
} else {
  console.log('\n✅ All non-embeddedDocs JS files have TypeScript equivalents!');
}
