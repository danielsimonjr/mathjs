#!/usr/bin/env node
/**
 * Script to fix test file imports:
 * Change .js imports to .ts imports for src/ imports
 */

import fs from 'fs'
import { glob } from 'glob'

async function fixTestImports() {
  // Find all test files
  const files = await glob('test/**/*.{js,mjs,cjs}', {
    cwd: process.cwd()
  })

  console.log(`Found ${files.length} test files to process`)

  let modifiedCount = 0

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    let modified = content

    // Change imports from src/ that end in .js to .ts
    // Match: from '../../src/path.js' or from '../src/path.js'
    modified = modified.replace(
      /from\s+(['"])(\.\.?\/)*src\/([^'"]+)\.js\1/g,
      (match, quote, dots, path) => {
        const prefix = match.match(/(\.\.?\/)*src\//)[0]
        return `from ${quote}${prefix}${path}.ts${quote}`
      }
    )

    // Also handle dynamic imports
    modified = modified.replace(
      /import\s*\(\s*(['"])(\.\.?\/)*src\/([^'"]+)\.js\1\s*\)/g,
      (match, quote, dots, path) => {
        const prefix = match.match(/(\.\.?\/)*src\//)[0]
        return `import(${quote}${prefix}${path}.ts${quote})`
      }
    )

    if (modified !== content) {
      fs.writeFileSync(file, modified, 'utf8')
      modifiedCount++
      console.log(`Modified: ${file}`)
    }
  }

  console.log(`\nModified ${modifiedCount} files`)
}

fixTestImports().catch(console.error)
