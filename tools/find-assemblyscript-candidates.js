#!/usr/bin/env node

/**
 * AssemblyScript Candidate Finder
 *
 * Analyzes src/ directory to find TypeScript files that could
 * potentially be converted to AssemblyScript for WASM compilation.
 *
 * Usage: node tools/find-assemblyscript-candidates.js [--verbose] [--json]
 *
 * Outputs: docs/architecture/candidates_for_assemblyscript.md
 *
 * Criteria for AS compatibility:
 * - Pure numeric functions (no string manipulation)
 * - No dynamic typing or any types
 * - No closures over mutable state
 * - No JavaScript objects/classes with methods
 * - No arbitrary precision (BigNumber, Fraction as objects)
 * - No parser/expression dependencies
 * - No complex inheritance hierarchies
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const srcDir = path.join(rootDir, 'src')
const wasmDir = path.join(srcDir, 'wasm')
const outputDir = path.join(rootDir, 'docs', 'architecture')
const outputFile = path.join(outputDir, 'candidates_for_assemblyscript.md')

// Command line args
const verbose = process.argv.includes('--verbose')
const jsonOutput = process.argv.includes('--json')

// Patterns that indicate AS incompatibility
const INCOMPATIBLE_PATTERNS = [
  // Dynamic typing
  { pattern: /\bany\b(?!\s*\])/, reason: 'Uses "any" type', weight: 10 },
  { pattern: /typeof\s+\w+\s*===?\s*['"]/, reason: 'Runtime type checking', weight: 5 },
  { pattern: /instanceof\s+/, reason: 'Uses instanceof', weight: 8 },

  // String manipulation
  { pattern: /\.toString\s*\(/, reason: 'Uses toString()', weight: 3 },
  { pattern: /\.split\s*\(/, reason: 'String split', weight: 8 },
  { pattern: /\.join\s*\(/, reason: 'Array join to string', weight: 5 },
  { pattern: /\.replace\s*\(/, reason: 'String replace', weight: 8 },
  { pattern: /\.match\s*\(/, reason: 'String/regex match', weight: 8 },
  { pattern: /RegExp|\/.*\/[gimsuy]*/, reason: 'Uses RegExp', weight: 10 },
  { pattern: /`\$\{/, reason: 'Template literals with interpolation', weight: 5 },

  // Object-oriented patterns
  { pattern: /class\s+\w+\s*(extends|implements)/, reason: 'Class inheritance', weight: 10 },
  { pattern: /new\s+Map\s*\(/, reason: 'Uses Map', weight: 8 },
  { pattern: /new\s+Set\s*\(/, reason: 'Uses Set (JS)', weight: 5 },
  { pattern: /new\s+WeakMap/, reason: 'Uses WeakMap', weight: 10 },
  { pattern: /Object\.(keys|values|entries|assign|freeze)/, reason: 'Object methods', weight: 7 },
  { pattern: /\.prototype\./, reason: 'Prototype manipulation', weight: 8 },

  // Dynamic features
  { pattern: /eval\s*\(/, reason: 'Uses eval', weight: 10 },
  { pattern: /Function\s*\(/, reason: 'Dynamic Function constructor', weight: 10 },
  { pattern: /\[\s*\w+\s*\]\s*[:=]/, reason: 'Computed property names', weight: 5 },
  { pattern: /Proxy\s*\(/, reason: 'Uses Proxy', weight: 10 },
  { pattern: /Reflect\./, reason: 'Uses Reflect', weight: 10 },

  // Async/Promise
  { pattern: /async\s+function|async\s*\(/, reason: 'Async function', weight: 10 },
  { pattern: /\bawait\s+/, reason: 'Uses await', weight: 10 },
  { pattern: /new\s+Promise/, reason: 'Uses Promise', weight: 10 },
  { pattern: /\.then\s*\(/, reason: 'Promise then', weight: 8 },

  // Parser/Expression dependencies
  { pattern: /import.*from\s*['"].*expression/, reason: 'Expression system dependency', weight: 10 },
  { pattern: /import.*from\s*['"].*parse/, reason: 'Parser dependency', weight: 10 },
  { pattern: /import.*Node\b/, reason: 'AST Node dependency', weight: 10 },
  { pattern: /SymbolNode|ConstantNode|OperatorNode|FunctionNode/, reason: 'AST Node types', weight: 10 },

  // Complex types
  { pattern: /import.*BigNumber/, reason: 'BigNumber dependency', weight: 8 },
  { pattern: /import.*Fraction(?!\.ts)/, reason: 'Fraction class dependency', weight: 6 },
  { pattern: /import.*Unit\b/, reason: 'Unit class dependency', weight: 6 },
  { pattern: /import.*Chain/, reason: 'Chain dependency', weight: 10 },

  // Error handling that's complex
  { pattern: /throw\s+new\s+\w+Error/, reason: 'Custom error types', weight: 3 },

  // Closures over mutable state
  { pattern: /let\s+\w+\s*=.*\n.*function.*\n.*\1/, reason: 'Potential closure over mutable state', weight: 4 },
]

// Patterns that indicate AS compatibility
const COMPATIBLE_PATTERNS = [
  { pattern: /Float64Array|Float32Array|Int32Array|Int64Array|Uint8Array/, reason: 'Uses TypedArrays', weight: 5 },
  { pattern: /:\s*(number|f64|f32|i32|i64|boolean|bool)\b/, reason: 'Explicit numeric types', weight: 3 },
  { pattern: /Math\.(sin|cos|tan|sqrt|pow|abs|floor|ceil|round|min|max|log|exp)/, reason: 'Math functions', weight: 2 },
  { pattern: /for\s*\(\s*(let|const)\s+\w+\s*(:\s*\w+)?\s*=\s*\d+/, reason: 'Numeric for loops', weight: 2 },
  { pattern: /function\s+\w+\s*\([^)]*:\s*(number|f64)/, reason: 'Typed function parameters', weight: 3 },
  { pattern: /:\s*(number|f64|f32)\s*\[\]/, reason: 'Numeric arrays', weight: 3 },
  { pattern: /export\s+function\s+\w+/, reason: 'Exported functions', weight: 1 },
]

// Directories/files to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.test\.(js|ts)$/,
  /\.spec\.(js|ts)$/,
  /\/expression\//,
  /\/entry\//,
  /[\/\\]wasm[\/\\]/,  // Already in wasm (handles both / and \)
  /embeddedDocs/,
  /\/type\/(matrix|bignumber|fraction|unit|chain|complex)\//i,
  /factoriesAny/,
  /factoriesNumber/,
  /defaultInstance/,
  /reviver/,
  /ResultSet/,
  /Help/,
  /[\/\\]parallel[\/\\]/,  // Parallel workers use dynamic features
]

// Already implemented in WASM (from the plan doc)
const ALREADY_IN_WASM = new Set([
  // Arithmetic
  'abs', 'add', 'subtract', 'multiply', 'divide', 'mod', 'pow', 'sqrt', 'square', 'cube', 'cbrt',
  'ceil', 'floor', 'round', 'sign', 'exp', 'expm1', 'log', 'log2', 'log10', 'log1p',
  'gcd', 'lcm', 'xgcd', 'invmod', 'hypot', 'nthRoot', 'nthRoots', 'norm',
  // Trig
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh',
  'asinh', 'acosh', 'atanh', 'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
  'sech', 'csch', 'coth', 'asech', 'acsch', 'acoth',
  // Bitwise
  'bitAnd', 'bitOr', 'bitXor', 'bitNot', 'leftShift', 'rightArithShift', 'rightLogShift',
  // Statistics
  'sum', 'mean', 'median', 'mode', 'min', 'max', 'variance', 'std', 'prod',
  'quantileSeq', 'mad', 'range', 'corr', 'cumsum',
  // Matrix
  'det', 'inv', 'transpose', 'trace', 'dot', 'cross', 'kron', 'zeros', 'ones', 'identity',
  'diag', 'flatten', 'reshape', 'dotMultiply', 'dotDivide', 'dotPow', 'pinv', 'sqrtm', 'expm',
  'rotate', 'rotationMatrix',
  // Algebra
  'lup', 'qr', 'lusolve', 'lsolve', 'usolve', 'lsolveAll', 'usolveAll', 'cholesky', 'schur',
  // Sparse
  'csAmd', 'csChol', 'csLu', 'csQr', 'csDfs', 'csReach', 'csEtree', 'csPost',
  'csPermute', 'csSpsolve', 'csTranspose', 'csMult', 'csCumsum', 'csFlip', 'csUnflip',
  'csMark', 'csMarked', 'csLeaf', 'csTdfs', 'csIpvec', 'csFkeep', 'csEreach', 'csCounts',
  // Combinatorics
  'factorial', 'permutations', 'combinations', 'combinationsWithRep', 'stirlingS2',
  'bellNumbers', 'catalan', 'composition',
  // Probability
  'random', 'randomInt', 'gamma', 'lgamma',
  // Special
  'erf', 'zeta',
  // Signal
  'fft', 'ifft', 'freqz', 'zpk2tf',
  // Set
  'setUnion', 'setIntersect', 'setDifference', 'setSymDifference', 'setSize',
  'setIsSubset', 'setPowerset', 'setMultiplicity', 'setDistinct', 'setCartesian',
  // Geometry
  'distance', 'intersect',
  // Complex
  'arg', 'conj', 're', 'im',
  // Utils
  'isNaN', 'isFinite', 'isInteger', 'isPositive', 'isNegative', 'isZero', 'isPrime',
  'isNumeric', 'hasNumericValue', 'clone', 'numeric', 'typeOf',
  // Relational
  'compare', 'equal', 'unequal', 'larger', 'largerEq', 'smaller', 'smallerEq',
  'equalScalar', 'compareNatural',
  // Logical
  'and', 'or', 'not', 'xor',
  // Plain number operations (these are JS typed-function wrappers, WASM equivalents exist)
  'logical', 'bitwise', 'relational', 'arithmetic', 'trigonometry', 'constants',
  'probability', 'combinations', 'utils',
  // Noop stubs (cannot be converted - error throwing)
  'noop',
])

/**
 * Analyze a single file for AS compatibility
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const relativePath = path.relative(srcDir, filePath)
  const fileName = path.basename(filePath, path.extname(filePath))

  // Check if already in WASM
  const baseName = fileName.replace(/\.(js|ts)$/, '')
  if (ALREADY_IN_WASM.has(baseName)) {
    return {
      file: relativePath,
      status: 'already_implemented',
      reason: 'Already implemented in src/wasm/',
      score: 0,
      issues: [],
      positives: []
    }
  }

  let incompatibilityScore = 0
  let compatibilityScore = 0
  const issues = []
  const positives = []

  // Check incompatible patterns
  for (const { pattern, reason, weight } of INCOMPATIBLE_PATTERNS) {
    const matches = content.match(new RegExp(pattern, 'g'))
    if (matches) {
      incompatibilityScore += weight * Math.min(matches.length, 5)
      issues.push({ reason, count: matches.length, weight })
    }
  }

  // Check compatible patterns
  for (const { pattern, reason, weight } of COMPATIBLE_PATTERNS) {
    const matches = content.match(new RegExp(pattern, 'g'))
    if (matches) {
      compatibilityScore += weight * Math.min(matches.length, 10)
      positives.push({ reason, count: matches.length, weight })
    }
  }

  // Calculate final score (positive = more compatible)
  const score = compatibilityScore - incompatibilityScore

  // Determine status
  let status
  if (incompatibilityScore === 0 && compatibilityScore > 5) {
    status = 'highly_compatible'
  } else if (incompatibilityScore < 10 && compatibilityScore > incompatibilityScore) {
    status = 'likely_compatible'
  } else if (incompatibilityScore < 20) {
    status = 'needs_refactoring'
  } else {
    status = 'not_compatible'
  }

  return {
    file: relativePath,
    status,
    score,
    incompatibilityScore,
    compatibilityScore,
    issues: issues.sort((a, b) => b.weight - a.weight),
    positives: positives.sort((a, b) => b.weight - a.weight),
    lines: content.split('\n').length
  }
}

/**
 * Recursively find all TypeScript files (excluding .js)
 */
function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(rootDir, fullPath)

    // Check skip patterns
    if (SKIP_PATTERNS.some(p => p.test(relativePath))) {
      continue
    }

    if (entry.isDirectory()) {
      findFiles(fullPath, files)
    } else if (/\.ts$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      // Only TypeScript files
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(categories, totalFiles) {
  const now = new Date().toISOString().split('T')[0]

  let md = `# AssemblyScript Conversion Candidates

> **Generated**: ${now}
>
> This report identifies TypeScript files in \`src/\` that could potentially be
> converted to AssemblyScript for WASM compilation.

## Summary

| Category | Count | Description |
|----------|-------|-------------|
| Highly Compatible | ${categories.highly_compatible.length} | Ready for conversion with minimal changes |
| Likely Compatible | ${categories.likely_compatible.length} | Minor refactoring needed |
| Needs Refactoring | ${categories.needs_refactoring.length} | Significant changes required |
| Not Compatible | ${categories.not_compatible.length} | Cannot convert (symbolic math, parsers, etc.) |
| Already in WASM | ${categories.already_implemented.length} | Already implemented in \`src/wasm/\` |
| **Total Analyzed** | **${totalFiles}** | TypeScript files in \`src/\` |

**Conversion Candidates**: ${categories.highly_compatible.length + categories.likely_compatible.length} files

---

## Highly Compatible

These files are ready for AssemblyScript conversion with minimal or no changes.

`

  if (categories.highly_compatible.length === 0) {
    md += `*None found*\n\n`
  } else {
    md += `| File | Score | Positive Indicators |\n`
    md += `|------|-------|--------------------|\n`
    for (const r of categories.highly_compatible) {
      const positives = r.positives.slice(0, 3).map(p => p.reason).join(', ') || '-'
      md += `| \`${r.file}\` | ${r.score} | ${positives} |\n`
    }
    md += `\n`
  }

  md += `---

## Likely Compatible

These files need minor refactoring to be AssemblyScript-compatible.

`

  if (categories.likely_compatible.length === 0) {
    md += `*None found*\n\n`
  } else {
    md += `| File | Score | Issues to Address |\n`
    md += `|------|-------|------------------|\n`
    for (const r of categories.likely_compatible) {
      const issues = r.issues.slice(0, 3).map(i => i.reason).join(', ') || '-'
      md += `| \`${r.file}\` | ${r.score} | ${issues} |\n`
    }
    md += `\n`
  }

  md += `---

## Needs Refactoring

These files require significant changes before conversion. Showing top 30 by score.

`

  if (categories.needs_refactoring.length === 0) {
    md += `*None found*\n\n`
  } else {
    md += `| File | Score | Main Issues |\n`
    md += `|------|-------|-------------|\n`
    for (const r of categories.needs_refactoring.slice(0, 30)) {
      const issues = r.issues.slice(0, 2).map(i => i.reason).join(', ') || '-'
      md += `| \`${r.file}\` | ${r.score} | ${issues} |\n`
    }
    if (categories.needs_refactoring.length > 30) {
      md += `\n*... and ${categories.needs_refactoring.length - 30} more files*\n`
    }
    md += `\n`
  }

  md += `---

## Not Compatible

These ${categories.not_compatible.length} files cannot be converted due to fundamental incompatibilities:

- Expression parser and AST manipulation
- Symbolic mathematics (derivative, simplify, etc.)
- Type classes (BigNumber, Fraction, Unit, Complex class)
- Dynamic typing and runtime type checking
- String manipulation and regex operations
- Async/Promise patterns

<details>
<summary>Click to expand full list</summary>

`

  for (const r of categories.not_compatible) {
    md += `- \`${r.file}\`\n`
  }

  md += `
</details>

---

## Already Implemented in WASM

These ${categories.already_implemented.length} files already have equivalent implementations in \`src/wasm/\`.

<details>
<summary>Click to expand full list</summary>

`

  for (const r of categories.already_implemented) {
    md += `- \`${r.file}\`\n`
  }

  md += `
</details>

---

## Scoring Criteria

### Incompatibility Indicators (Negative Score)

| Pattern | Weight | Reason |
|---------|--------|--------|
| \`any\` type | 10 | No dynamic typing in AS |
| \`instanceof\` | 8 | No runtime type checking |
| RegExp | 10 | No regex support |
| String methods | 5-8 | Limited string support |
| Map/Set/WeakMap | 5-10 | Use typed arrays instead |
| async/await/Promise | 10 | No async in AS |
| Expression imports | 10 | Parser not convertible |
| BigNumber/Fraction | 6-8 | Use numeric alternatives |

### Compatibility Indicators (Positive Score)

| Pattern | Weight | Reason |
|---------|--------|--------|
| TypedArrays | 5 | Native AS support |
| Explicit numeric types | 3 | Clean conversion |
| Math.* functions | 2 | Direct AS equivalents |
| Numeric for loops | 2 | Efficient AS code |

---

## Recommendations

1. **Focus on high-value targets**: Files with numeric algorithms that would benefit from WASM acceleration
2. **Skip utility files**: Small helper functions may not justify conversion overhead
3. **Check existing WASM**: Many functions are already implemented in \`src/wasm/\`
4. **Consider numerical alternatives**: For symbolic operations, use numerical methods instead

## References

- [AssemblyScript Documentation](https://www.assemblyscript.org/)
- [WASM Implementation Plan](../REFACTORING_TO_ASSEMBLYSCRIPT_PLAN.md)
- [Existing WASM Modules](../../src/wasm/)
`

  return md
}

/**
 * Main analysis
 */
function main() {
  console.log('AssemblyScript Candidate Finder')
  console.log('=' .repeat(50))
  console.log(`\nAnalyzing TypeScript files in: ${srcDir}\n`)

  const files = findFiles(srcDir)
  console.log(`Found ${files.length} TypeScript files to analyze\n`)

  const results = files.map(f => analyzeFile(f))

  // Categorize results
  const categories = {
    highly_compatible: [],
    likely_compatible: [],
    needs_refactoring: [],
    not_compatible: [],
    already_implemented: []
  }

  for (const result of results) {
    categories[result.status].push(result)
  }

  // Sort each category by score (descending)
  for (const cat of Object.keys(categories)) {
    categories[cat].sort((a, b) => b.score - a.score)
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ categories, summary: {
      total: files.length,
      highly_compatible: categories.highly_compatible.length,
      likely_compatible: categories.likely_compatible.length,
      needs_refactoring: categories.needs_refactoring.length,
      not_compatible: categories.not_compatible.length,
      already_implemented: categories.already_implemented.length
    }}, null, 2))
    return
  }

  // Generate markdown report
  const report = generateMarkdownReport(categories, files.length)

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write report
  fs.writeFileSync(outputFile, report)
  console.log(`Report written to: ${outputFile}\n`)

  // Print summary to console
  console.log('Summary:')
  console.log('-'.repeat(50))
  console.log(`  Highly compatible:    ${categories.highly_compatible.length.toString().padStart(4)}`)
  console.log(`  Likely compatible:    ${categories.likely_compatible.length.toString().padStart(4)}`)
  console.log(`  Needs refactoring:    ${categories.needs_refactoring.length.toString().padStart(4)}`)
  console.log(`  Not compatible:       ${categories.not_compatible.length.toString().padStart(4)}`)
  console.log(`  Already in WASM:      ${categories.already_implemented.length.toString().padStart(4)}`)
  console.log('-'.repeat(50))
  console.log(`  Total analyzed:       ${files.length.toString().padStart(4)}`)
  console.log(`  Conversion candidates:${(categories.highly_compatible.length + categories.likely_compatible.length).toString().padStart(4)}`)

  if (verbose) {
    console.log('\nTop Candidates:')
    const topCandidates = [
      ...categories.highly_compatible,
      ...categories.likely_compatible
    ].slice(0, 10)

    for (const r of topCandidates) {
      const status = r.status === 'highly_compatible' ? '★' : '○'
      console.log(`  ${status} ${r.file} (score: ${r.score})`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('Done!')
}

main()
