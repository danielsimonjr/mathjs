#!/usr/bin/env node
/**
 * Script to revert test file imports:
 * Change .ts imports back to .js imports for src/ imports
 */

import fs from 'fs'
import { glob } from 'glob'

async function revertTestImports() {
  // Find all test files
  const files = await glob('test/**/*.{js,mjs,cjs}', {
    cwd: process.cwd()
  })

  console.log(`Found ${files.length} test files to process`)

  let modifiedCount = 0

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    let modified = content

    // Change imports from src/ that end in .ts back to .js
    modified = modified.replace(
      /from\s+(['"])(\.\.?\/)*src\/([^'"]+)\.ts\1/g,
      (match, quote, dots, path) => {
        const prefix = match.match(/(\.\.?\/)*src\//)[0]
        return `from ${quote}${prefix}${path}.js${quote}`
      }
    )

    // Also handle dynamic imports
    modified = modified.replace(
      /import\s*\(\s*(['"])(\.\.?\/)*src\/([^'"]+)\.ts\1\s*\)/g,
      (match, quote, dots, path) => {
        const prefix = match.match(/(\.\.?\/)*src\//)[0]
        return `import(${quote}${prefix}${path}.js${quote})`
      }
    )

    if (modified !== content) {
      fs.writeFileSync(file, modified, 'utf8')
      modifiedCount++
      console.log(`Reverted: ${file}`)
    }
  }

  console.log(`\nReverted ${modifiedCount} files`)
}

revertTestImports().catch(console.error)
