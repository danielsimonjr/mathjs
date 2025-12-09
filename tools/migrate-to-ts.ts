#!/usr/bin/env node
// @ts-nocheck
/**
 * JavaScript to TypeScript Migration Script
 * Helps convert mathjs source files from .js to .ts
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.join(__dirname, '../src')

// Priority files for conversion (performance-critical)
const PRIORITY_FILES = [
  'type/matrix/DenseMatrix.js',
  'type/matrix/SparseMatrix.js',
  'function/arithmetic/multiply.js',
  'function/matrix/det.js',
  'function/matrix/inv.js',
  'function/matrix/dot.js',
  'function/matrix/transpose.js',
  'function/algebra/decomposition/lup.js',
  'function/algebra/decomposition/qr.js',
  'function/matrix/fft.js',
  'function/matrix/ifft.js',
  'utils/array.js',
  'utils/is.js',
  'utils/object.js',
  'core/create.js'
]

/**
 * Convert a single JavaScript file to TypeScript
 */
async function convertFile(jsPath) {
  const content = await fs.readFile(jsPath, 'utf-8')
  const tsPath = jsPath.replace(/\.js$/, '.ts')

  // Basic conversions
  let tsContent = content

  // Add type annotations for common patterns
  tsContent = addTypeAnnotations(tsContent)

  // Convert .js imports to .ts (will be handled by build system)
  // Keep .js extension for now (TypeScript can handle it)

  console.log(`Converting: ${path.relative(SRC_DIR, jsPath)} -> ${path.basename(tsPath)}`)

  await fs.writeFile(tsPath, tsContent, 'utf-8')

  return tsPath
}

/**
 * Add basic type annotations
 */
function addTypeAnnotations(content) {
  let result = content

  // Add type annotations for function parameters where obvious
  // This is a basic implementation - manual review needed

  // Add @ts-check directive at top
  if (!result.includes('@ts-check') && !result.includes('// deno-lint')) {
    result = '// @ts-check\n' + result
  }

  return result
}

/**
 * Get all JavaScript files in src directory
 */
async function getAllJsFiles(dir = SRC_DIR) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...await getAllJsFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Main conversion process
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
JavaScript to TypeScript Migration Script

Usage:
  node migrate-to-ts.js [options]

Options:
  --priority    Convert priority files only (recommended)
  --all         Convert all files (use with caution)
  --file <path> Convert a specific file
  --help        Show this help

Examples:
  node migrate-to-ts.js --priority
  node migrate-to-ts.js --file src/type/matrix/DenseMatrix.js
    `)
    return
  }

  if (args.includes('--priority')) {
    console.log('Converting priority files...\n')

    for (const relPath of PRIORITY_FILES) {
      const fullPath = path.join(SRC_DIR, relPath)

      try {
        await convertFile(fullPath)
      } catch (error) {
        console.error(`Error converting ${relPath}:`, error.message)
      }
    }

    console.log('\nPriority files converted!')
    console.log('Note: Manual review and type refinement recommended.')

  } else if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file')
    const filePath = args[fileIndex + 1]

    if (!filePath) {
      console.error('Error: --file requires a path argument')
      return
    }

    await convertFile(filePath)
    console.log('File converted!')

  } else if (args.includes('--all')) {
    console.log('WARNING: Converting all 662 files...\n')
    console.log('This will take a while and requires manual review.')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    const allFiles = await getAllJsFiles()
    console.log(`Found ${allFiles.length} JavaScript files\n`)

    for (const filePath of allFiles) {
      try {
        await convertFile(filePath)
      } catch (error) {
        console.error(`Error converting ${filePath}:`, error.message)
      }
    }

    console.log('\nAll files converted!')
    console.log('IMPORTANT: Manual review required for all files.')

  } else {
    console.log('Please specify an option. Use --help for usage information.')
  }
}

main().catch(console.error)
