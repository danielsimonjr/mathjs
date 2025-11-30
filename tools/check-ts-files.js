#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graph = JSON.parse(fs.readFileSync(path.join(__dirname, 'dependency-graph.json'), 'utf-8'));

console.log('Top 20 Most Depended-On Files:\n');
graph.stats.mostDependedOn.slice(0, 20).forEach((item, i) => {
  const tsPath = path.join(__dirname, '..', 'src', item.file.replace('.js', '.ts'));
  const tsExists = fs.existsSync(tsPath);
  console.log(`${i+1}. ${item.file} (${item.count} dependents) - ${tsExists ? '✅ .ts' : '❌ .js'}`);
});
