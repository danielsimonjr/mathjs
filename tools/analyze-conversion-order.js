#!/usr/bin/env node

/**
 * Dependency Graph Analyzer for TypeScript Conversion
 *
 * Uses the dependency graph to determine optimal conversion order
 * and analyze which files would benefit most from conversion.
 *
 * Usage:
 *   node tools/analyze-conversion-order.js
 *   node tools/analyze-conversion-order.js --category arithmetic
 *   node tools/analyze-conversion-order.js --show-ready
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRAPH_PATH = path.join(__dirname, 'dependency-graph.json');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Load dependency graph
let graph;
try {
  graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
  console.log('📊 Loaded dependency graph\n');
} catch (err) {
  console.error('❌ Error loading dependency graph:', err.message);
  console.error('💡 Run: node tools/generate-dependency-graph.js');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
const showReady = args.includes('--show-ready');

/**
 * Check if a file has been converted to TypeScript
 */
function isConverted(jsFilePath) {
  const tsFilePath = path.join(SRC_DIR, jsFilePath.replace(/\.js$/, '.ts'));
  return fs.existsSync(tsFilePath);
}

/**
 * Calculate conversion readiness score for a file
 * Higher score = more ready to convert
 */
function calculateReadinessScore(filePath, fileInfo) {
  let score = 0;

  // Files with no dependencies are easiest (score: 10)
  if (fileInfo.factoryDependencies.length === 0) {
    score += 10;
  }

  // Count how many dependencies are already converted
  const convertedDeps = fileInfo.factoryDependencies.filter(dep => {
    const depInfo = graph.functions[dep];
    if (!depInfo) return false;
    return isConverted(depInfo.file);
  }).length;

  const totalDeps = fileInfo.factoryDependencies.length;

  if (totalDeps > 0) {
    // Score based on % of dependencies converted (0-10)
    score += (convertedDeps / totalDeps) * 10;

    // Bonus for having all dependencies converted
    if (convertedDeps === totalDeps) {
      score += 5;
    }
  }

  // Files that many others depend on get priority (0-5)
  const dependentCount = (graph.stats.mostDependedOn.find(item => item.file === filePath)?.count || 0);
  score += Math.min(dependentCount / 20, 5);

  return Math.round(score * 10) / 10;
}

/**
 * Categorize files by their conversion status
 */
function analyzeConversionStatus() {
  const converted = [];
  const readyToConvert = [];
  const partiallyReady = [];
  const notReady = [];

  Object.entries(graph.files).forEach(([filePath, fileInfo]) => {
    // Skip non-factory files
    if (!fileInfo.isFactory) return;

    // Skip if category filter is active
    if (category && !filePath.startsWith(`function/${category}`)) {
      return;
    }

    const tsExists = isConverted(filePath);

    if (tsExists) {
      converted.push(filePath);
      return;
    }

    const score = calculateReadinessScore(filePath, fileInfo);
    const totalDeps = fileInfo.factoryDependencies.length;
    const convertedDeps = fileInfo.factoryDependencies.filter(dep => {
      const depInfo = graph.functions[dep];
      return depInfo && isConverted(depInfo.file);
    }).length;

    const entry = {
      file: filePath,
      score,
      deps: totalDeps,
      convertedDeps,
      factoryName: fileInfo.factoryName
    };

    if (totalDeps === 0 || convertedDeps === totalDeps) {
      readyToConvert.push(entry);
    } else if (convertedDeps > 0) {
      partiallyReady.push(entry);
    } else {
      notReady.push(entry);
    }
  });

  // Sort by readiness score (descending)
  readyToConvert.sort((a, b) => b.score - a.score);
  partiallyReady.sort((a, b) => b.score - a.score);
  notReady.sort((a, b) => b.score - a.score);

  return { converted, readyToConvert, partiallyReady, notReady };
}

/**
 * Display conversion recommendations
 */
function displayRecommendations(status) {
  const total = status.converted.length + status.readyToConvert.length +
                status.partiallyReady.length + status.notReady.length;

  console.log('📈 TypeScript Conversion Status\n');
  console.log('=' . repeat(60));
  console.log(`Total Factory Files: ${total}`);
  console.log(`✅ Converted: ${status.converted.length} (${Math.round(status.converted.length / total * 100)}%)`);
  console.log(`🟢 Ready to Convert: ${status.readyToConvert.length}`);
  console.log(`🟡 Partially Ready: ${status.partiallyReady.length}`);
  console.log(`🔴 Not Ready: ${status.notReady.length}`);
  console.log('=' . repeat(60));
  console.log('');

  if (showReady || status.readyToConvert.length <= 20) {
    console.log('🟢 Ready to Convert (all dependencies satisfied):\n');
    status.readyToConvert.slice(0, 20).forEach((entry, idx) => {
      const depText = entry.deps === 0 ? 'no dependencies' : `${entry.deps} deps converted`;
      console.log(`${idx + 1}. ${entry.file}`);
      console.log(`   └─ Score: ${entry.score} | ${depText}`);
    });

    if (status.readyToConvert.length > 20) {
      console.log(`\n   ... and ${status.readyToConvert.length - 20} more files`);
    }
    console.log('');
  }

  console.log('🎯 Top Conversion Priorities (highest impact):\n');

  // Combine ready and partially ready, sort by score
  const priorities = [...status.readyToConvert, ...status.partiallyReady]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  priorities.forEach((entry, idx) => {
    const depProgress = entry.deps > 0
      ? `${entry.convertedDeps}/${entry.deps} deps converted`
      : 'no dependencies';

    console.log(`${idx + 1}. ${entry.file}`);
    console.log(`   └─ Score: ${entry.score} | ${depProgress}`);
  });
  console.log('');

  // Show dependency bottlenecks (unconverted files that many others depend on)
  console.log('🚧 Dependency Bottlenecks (unconverted files blocking others):\n');

  const bottlenecks = graph.stats.mostDependedOn
    .filter(item => !isConverted(item.file))
    .slice(0, 10);

  bottlenecks.forEach((item, idx) => {
    const fileInfo = graph.files[item.file];
    const factoryName = fileInfo?.factoryName || 'N/A';
    console.log(`${idx + 1}. ${item.file} (${item.count} dependents)`);
    console.log(`   └─ Factory: ${factoryName}`);
  });
  console.log('');
}

/**
 * Generate conversion batches
 */
function generateConversionBatches(status) {
  console.log('📦 Suggested Conversion Batches\n');
  console.log('Copy these commands to convert files in optimal order:\n');

  // Batch 1: Zero-dependency files
  const zeroDeps = status.readyToConvert.filter(e => e.deps === 0);
  if (zeroDeps.length > 0) {
    console.log('# Batch 1: Zero-dependency files (easiest)');
    zeroDeps.slice(0, 10).forEach(entry => {
      console.log(`npx jscodeshift -t tools/transform-mathjs-to-ts.js src/${entry.file}`);
    });
    console.log('');
  }

  // Batch 2: All dependencies satisfied
  const allDeps = status.readyToConvert.filter(e => e.deps > 0);
  if (allDeps.length > 0) {
    console.log('# Batch 2: All dependencies already converted');
    allDeps.slice(0, 10).forEach(entry => {
      console.log(`npx jscodeshift -t tools/transform-mathjs-to-ts.js src/${entry.file}`);
    });
    console.log('');
  }

  // Batch 3: High-priority partially ready
  const partialHigh = status.partiallyReady
    .filter(e => e.score >= 10)
    .slice(0, 10);

  if (partialHigh.length > 0) {
    console.log('# Batch 3: High-priority files (convert dependencies first)');
    partialHigh.forEach(entry => {
      console.log(`# ${entry.file} - needs ${entry.deps - entry.convertedDeps} more dependencies`);
    });
    console.log('');
  }
}

// Main execution
const status = analyzeConversionStatus();
displayRecommendations(status);

if (!showReady) {
  generateConversionBatches(status);
}

console.log('💡 Tips:');
console.log('   - Use --show-ready to see all ready-to-convert files');
console.log('   - Use --category=<name> to filter by category (e.g., --category=arithmetic)');
console.log('   - Convert files with score >= 15 first for best type inference');
console.log('');
