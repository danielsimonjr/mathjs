#!/usr/bin/env node
/**
 * Script to fix TypeScript imports:
 * 1. Change .js imports to .ts imports in .ts files
 * 2. Add 'import type' for type-only imports
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

// Known type-only exports (interfaces, types that don't exist at runtime)
const TYPE_ONLY_EXPORTS = new Set([
  'MathJsConfig',
  'ConfigOptions',
  'MathJsInstance',
  'TypedFunction',
  'FactoryFunction',
  'LegacyFactory',
  'Matrix',
  'Index',
  'BigNumber',
  'Complex',
  'Fraction',
  'Unit',
  'MathNode',
  'OperatorNode',
  'SymbolNode',
  'ConstantNode',
  'FunctionNode',
  'ParenthesisNode',
  'AccessorNode',
  'ArrayNode',
  'AssignmentNode',
  'BlockNode',
  'ConditionalNode',
  'FunctionAssignmentNode',
  'IndexNode',
  'ObjectNode',
  'RangeNode',
  'RelationalNode',
  'OptimizedCallback',
  'NestedArray',
  'ArrayOrScalar',
  'IdentifiedValue'
])

async function fixImports() {
  // Find all .ts files in src/
  const files = await glob('src/**/*.ts', {
    ignore: ['src/wasm/**/*.ts'], // Skip WASM files (AssemblyScript)
    cwd: process.cwd()
  })

  console.log(`Found ${files.length} TypeScript files to process`)

  let modifiedCount = 0

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    let modified = content

    // 1. Change .js imports to .ts imports (for local imports only)
    // Match: from './path.js' or from '../path.js'
    modified = modified.replace(
      /from\s+(['"])(\.[^'"]+)\.js\1/g,
      "from $1$2.ts$1"
    )

    // 2. Also handle dynamic imports
    modified = modified.replace(
      /import\s*\(\s*(['"])(\.[^'"]+)\.js\1\s*\)/g,
      "import($1$2.ts$1)"
    )

    if (modified !== content) {
      fs.writeFileSync(file, modified, 'utf8')
      modifiedCount++
      console.log(`Modified: ${file}`)
    }
  }

  console.log(`\nModified ${modifiedCount} files`)
}

fixImports().catch(console.error)
