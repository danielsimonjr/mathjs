# Automated TypeScript Conversion Guide

This guide explains how to use codemods and AST transformations to automate the conversion of Math.js JavaScript files to TypeScript.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Tools Available](#tools-available)
4. [Workflow](#workflow)
5. [Advanced Techniques](#advanced-techniques)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Converting 612 JavaScript files to TypeScript manually would take months. Automation using **codemods** (code modifications via AST transformations) can reduce this to weeks.

### What Gets Automated

✅ **Automated**:
- Import path updates (`.js` → `.ts`)
- Factory function parameter type annotations
- typed-function signature type annotations
- JSDoc → TypeScript type conversion
- Common type inference (number, string, boolean, Matrix, etc.)
- Adding type imports

⚠️ **Semi-Automated** (requires review):
- Complex type inference (generics, conditional types)
- Return type annotations for complex functions
- Type guards and narrowing
- Edge cases in typed-function signatures

❌ **Manual**:
- Business logic changes
- Algorithm refactoring
- Documentation updates
- Test writing
- WASM implementation

---

## Prerequisites

### Install Tools

```bash
# Install jscodeshift (codemod runner)
npm install -g jscodeshift

# Install ast-types (AST node definitions)
npm install --save-dev ast-types @types/jscodeshift

# Install parser plugins
npm install --save-dev @babel/parser @babel/traverse
```

### Verify Installation

```bash
jscodeshift --version
# Should output: 0.15.x or higher
```

---

## Tools Available

### 1. `transform-to-ts.js`

**Basic transformation** for generic JavaScript → TypeScript conversion.

**Features**:
- Import path updates
- JSDoc type conversion
- Basic type inference

**Usage**:
```bash
npx jscodeshift -t tools/transform-to-ts.js src/function/arithmetic/add.js
```

### 2. `transform-mathjs-to-ts.js`

**Advanced transformation** specifically for Math.js patterns.

**Features**:
- Factory function dependency typing
- typed-function signature analysis
- Math.js-specific type inference (Matrix, BigNumber, Complex, etc.)
- Sparse matrix algorithm detection
- Type import management

**Usage**:
```bash
# Dry run (preview without modifying)
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  src/function/arithmetic/add.js \
  --dry --print

# Convert single file
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  src/function/arithmetic/add.js

# Convert entire category
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  'src/function/arithmetic/*.js'

# Convert with custom options
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  'src/function/arithmetic/*.js' \
  --extensions=js \
  --parser=babel \
  --run-in-band
```

### 3. `ast-grep` (Alternative Tool)

**ast-grep** is a faster alternative for pattern-based transformations.

**Installation**:
```bash
npm install -g @ast-grep/cli
```

**Usage**:
```bash
# Find all factory functions
ast-grep --pattern 'export const $NAME = factory($$$)' src/

# Replace pattern
ast-grep --pattern 'import { $$ } from "./file.js"' \
         --rewrite 'import { $$ } from "./file.ts"' \
         --update
```

---

## Workflow

### Step 1: Choose Files to Convert

Prioritize based on refactoring plan:

```bash
# Phase 2: High-performance functions (WASM-ready)
FILES=(
  "src/function/arithmetic/multiply.js"
  "src/function/matrix/dot.js"
  "src/function/algebra/lup.js"
  "src/function/statistics/mean.js"
)
```

### Step 2: Dry Run (Preview Changes)

Always preview before modifying:

```bash
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  src/function/arithmetic/multiply.js \
  --dry --print > preview.diff

# Review preview.diff
cat preview.diff
```

### Step 3: Run Transformation

```bash
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  src/function/arithmetic/multiply.js

# Rename .js to .ts
mv src/function/arithmetic/multiply.js src/function/arithmetic/multiply.ts
```

### Step 4: Manual Review & Refinement

The codemod gets you 70-80% there. Manual steps:

1. **Review type annotations**:
   ```typescript
   // Codemod might generate:
   function add(a: any, b: any): any { ... }

   // Refine to:
   function add(a: number | Matrix, b: number | Matrix): number | Matrix { ... }
   ```

2. **Add missing types**:
   ```typescript
   // Add generic constraints
   function map<T>(arr: T[], callback: (item: T) => T): T[] { ... }
   ```

3. **Fix import paths**:
   ```typescript
   // Codemod uses relative imports
   import { typed } from '../../core/typed.ts';

   // You might prefer:
   import type { TypedFunction } from '../../types.ts';
   import { typed } from '../../core/typed.ts';
   ```

### Step 5: Compile & Test

```bash
# Compile TypeScript
npm run compile:ts

# Run tests
npm test -- --grep "multiply"

# Run type tests
npm run test:types
```

### Step 6: Update Factory Indexes

```bash
# Add to factoriesAny.ts
export { createMultiply } from './function/arithmetic/multiply.ts'

# Add to factoriesNumber.ts (if applicable)
export { createMultiply } from './function/arithmetic/multiply.ts'
```

### Step 7: Update Type Definitions

Edit `types/index.d.ts`:

```typescript
// Add to MathJsInstance interface
interface MathJsInstance {
  multiply(x: number, y: number): number
  multiply(x: Matrix, y: Matrix): Matrix
  // ... more overloads
}

// Add to dependencies
export const multiplyDependencies: FactoryFunctionMap
```

---

## Advanced Techniques

### Batch Conversion

Convert multiple files at once:

```bash
# Create a file list
cat > files-to-convert.txt <<EOF
src/function/arithmetic/add.js
src/function/arithmetic/subtract.js
src/function/arithmetic/multiply.js
src/function/arithmetic/divide.js
EOF

# Convert all
cat files-to-convert.txt | xargs -I {} npx jscodeshift -t tools/transform-mathjs-to-ts.js {}

# Rename all .js → .ts
cat files-to-convert.txt | sed 's/\.js$//' | xargs -I {} mv {}.js {}.ts
```

### Custom Type Mappings

Extend the transform with project-specific types:

```javascript
// In transform-mathjs-to-ts.js, update inferDependencyType()

function inferDependencyType(depName) {
  const customTypes = {
    'myCustomDep': 'MyCustomType',
    'specialAlgorithm': '(matrix: Matrix) => Matrix',
  };

  return customTypes[depName] || knownTypes[depName] || 'any';
}
```

### Incremental Type Refinement

Use TypeScript's `// @ts-expect-error` for gradual refinement:

```typescript
// First pass: Get it compiling
function complex(re: any, im: any): any {
  // @ts-expect-error - TODO: Add proper Complex type
  return new Complex(re, im);
}

// Second pass: Refine types
function complex(re: number, im: number): Complex {
  return new Complex(re, im);
}
```

### AST Explorer for Pattern Development

Use [AST Explorer](https://astexplorer.net/) to develop transform patterns:

1. Go to https://astexplorer.net/
2. Select **JavaScript** language
3. Select **@babel/parser** parser
4. Select **jscodeshift** transform
5. Paste Math.js code in left pane
6. Write transform in bottom pane
7. See result in right pane

### Type Inference from Tests

Extract types from existing unit tests:

```bash
# Find test file
TEST_FILE="test/unit-tests/function/arithmetic/add.test.js"

# Extract test cases
grep -E "math\.add\(" $TEST_FILE

# Example output:
# assert.strictEqual(math.add(2, 3), 5)
# assert.deepStrictEqual(math.add(matrix([1,2]), matrix([3,4])), matrix([4,6]))

# Infer signatures:
# add(number, number): number
# add(Matrix, Matrix): Matrix
```

---

## Troubleshooting

### Issue: Transform Fails with Parse Error

**Problem**: `SyntaxError: Unexpected token`

**Solution**: Specify correct parser

```bash
npx jscodeshift -t tools/transform-mathjs-to-ts.js \
  src/file.js \
  --parser=babel \
  --extensions=js,jsx
```

### Issue: Types Not Inferred Correctly

**Problem**: Generated types are `any` everywhere

**Solution**: Enhance type inference in transform

```javascript
// Add more patterns to inferDependencyType()
// Add more heuristics to inferReturnTypeFromSignature()
```

### Issue: Transform Modifies Unintended Files

**Problem**: Codemod changes files it shouldn't

**Solution**: Use `--dry` flag and review carefully

```bash
# Always dry run first
npx jscodeshift -t transform.js 'src/**/*.js' --dry --print | less

# Only proceed if output looks correct
npx jscodeshift -t transform.js 'src/**/*.js'
```

### Issue: Import Paths Break

**Problem**: Relative imports become incorrect after conversion

**Solution**: Use path mapping in `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@types/*": ["types/*"]
    }
  }
}
```

### Issue: Circular Dependencies

**Problem**: TypeScript complains about circular imports

**Solution**: Use `import type` for type-only imports

```typescript
// Before (value import)
import { Matrix } from './Matrix.ts';

// After (type-only import)
import type { Matrix } from './Matrix.ts';
```

### Issue: Performance Slow on Large Codebases

**Problem**: jscodeshift takes forever on 600+ files

**Solution**: Use parallel execution

```bash
# Run in parallel (4 workers)
npx jscodeshift -t transform.js 'src/**/*.js' --run-in-band=false

# Or use GNU parallel
find src -name "*.js" | parallel -j 8 npx jscodeshift -t transform.js {}
```

---

## Performance Benchmarks

Expected conversion times:

| Files | Manual (hours) | Codemod (minutes) | Speedup |
|-------|----------------|-------------------|---------|
| 1     | 0.5            | 0.5               | 1x      |
| 10    | 5              | 2                 | 2.5x    |
| 50    | 25             | 5                 | 5x      |
| 170   | 85             | 15                | 5.7x    |
| 612   | 306            | 45                | 6.8x    |

**Note**: Manual refinement after codemod still required (estimate 30% of manual time).

**Total savings**: ~70% time reduction

---

## Example: Complete Conversion of `add.js`

### Original File (`src/function/arithmetic/add.js`)

```javascript
import { factory } from '../../utils/factory.js'

export const createAdd = /* #__PURE__ */ factory('add', ['typed', 'matrix', 'addScalar'], ({ typed, matrix, addScalar }) => {
  return typed('add', {
    'number, number': (x, y) => x + y,
    'Matrix, Matrix': (x, y) => matrix(x).add(y)
  })
})
```

### After Codemod (`add.ts` - 80% complete)

```typescript
import { factory } from '../../utils/factory.ts'

export const createAdd = /* #__PURE__ */ factory('add', ['typed', 'matrix', 'addScalar'], ({ typed, matrix, addScalar }: {
  typed: TypedFunction,
  matrix: MatrixConstructor,
  addScalar: (a: number, b: number) => number
}) => {
  return typed('add', {
    'number, number': (x: number, y: number): number => x + y,
    'Matrix, Matrix': (x: Matrix, y: Matrix): Matrix => matrix(x).add(y)
  })
})
```

### After Manual Refinement (100% complete)

```typescript
import { factory } from '../../utils/factory.ts'
import type { TypedFunction, MatrixConstructor, Matrix } from '../../types.ts'

export const createAdd = /* #__PURE__ */ factory(
  'add',
  ['typed', 'matrix', 'addScalar'],
  ({ typed, matrix, addScalar }: {
    typed: TypedFunction
    matrix: MatrixConstructor
    addScalar: (a: number, b: number) => number
  }): TypedFunction => {
    return typed('add', {
      'number, number': (x: number, y: number): number => x + y,

      'Matrix, Matrix': (x: Matrix, y: Matrix): Matrix => {
        return matrix(x).add(y)
      },

      'BigNumber, BigNumber': (x: BigNumber, y: BigNumber): BigNumber => {
        return x.plus(y)
      },

      'Complex, Complex': (x: Complex, y: Complex): Complex => {
        return x.add(y)
      }
    })
  }
)
```

---

## Next Steps

1. **Start Small**: Convert 5-10 files to test the workflow
2. **Iterate**: Refine the transform based on edge cases
3. **Batch Convert**: Once confident, convert entire categories
4. **Integrate**: Update build system, type definitions, tests
5. **Document**: Record learnings, update this guide

---

## Resources

- [jscodeshift Documentation](https://github.com/facebook/jscodeshift)
- [AST Explorer](https://astexplorer.net/) - Interactive AST playground
- [ast-grep](https://ast-grep.github.io/) - Alternative pattern-based tool
- [TypeScript Deep Dive - Type Inference](https://basarat.gitbook.io/typescript/type-system/type-inference)
- [Effective TypeScript](https://effectivetypescript.com/) - Best practices
