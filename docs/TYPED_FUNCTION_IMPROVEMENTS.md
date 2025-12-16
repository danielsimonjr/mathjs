# Suggestions and Improvements for @danielsimonjr/typed-function

This document outlines issues encountered while integrating typed-function with math.js during the TypeScript/WASM refactoring effort, along with suggested improvements.

## Executive Summary

During testing with Vitest/esbuild compilation, we encountered **1,684 failing tests** (27% of the test suite) primarily due to type recognition issues in typed-function. The JavaScript tests (Mocha) pass 100%, indicating these are compilation/bundler-specific issues.

---

## Issue 1: Type Recognition Fails After esbuild Compilation

### Problem
When code is compiled with esbuild (used by Vitest), typed-function fails to recognize class instances, reporting them as `any` type.

### Error Pattern
```
TypeError: Unexpected type of argument in function map (expected: Array or Matrix, actual: any, index: 0)
TypeError: Unexpected type of argument in function lup (expected: Array or DenseMatrix or SparseMatrix, actual: any, index: 0)
TypeError: Unexpected type of argument in function subset (expected: Index, actual: any, index: 1)
```

### Frequency
- **~500+ test failures** exhibit this pattern
- Affects: Matrix, DenseMatrix, SparseMatrix, Index, Range, Complex, and other custom types

### Root Cause Analysis
The type tests in math.js rely on prototype chain inspection:

```typescript
// From src/utils/is.ts
export function isMatrix(x: unknown): x is Matrix {
  return (x && (x as any).constructor.prototype.isMatrix === true) || false
}

export function isDenseMatrix(x: unknown): x is DenseMatrix {
  return (
    (x && (x as any).isDenseMatrix &&
     (x as any).constructor.prototype.isMatrix === true) || false
  )
}
```

When esbuild compiles classes, it may:
1. Rename constructors (e.g., `DenseMatrix` becomes `_DenseMatrix`)
2. Alter prototype chains in ways that break `constructor.prototype` checks
3. Use different class compilation strategies that affect `instanceof` behavior

### Suggested Improvements

#### 1. Symbol-based Type Identification
Use `Symbol.for()` for type identification instead of prototype properties:

```typescript
// In typed-function
const TYPE_SYMBOL = Symbol.for('typed-function:type')

// Type registration
typed.addTypes([
  {
    name: 'DenseMatrix',
    test: (x) => x && x[TYPE_SYMBOL] === 'DenseMatrix'
  }
])

// In class definition
class DenseMatrix {
  [Symbol.for('typed-function:type')] = 'DenseMatrix'
}
```

**Benefits:**
- Symbols survive minification and compilation
- No prototype chain dependency
- Works across module boundaries

#### 2. Brand Checking Pattern
Implement TypeScript-style branded types:

```typescript
interface Branded<T extends string> {
  readonly __brand: T
}

// Type test
function isDenseMatrix(x: unknown): x is DenseMatrix {
  return typeof x === 'object' && x !== null && '__brand' in x && x.__brand === 'DenseMatrix'
}
```

#### 3. Constructor Registry
Maintain an internal WeakMap of known constructors:

```typescript
// In typed-function
const constructorRegistry = new WeakMap<Function, string>()

typed.registerConstructor(DenseMatrix, 'DenseMatrix')

// Type test becomes
function isDenseMatrix(x: unknown): boolean {
  return x != null && constructorRegistry.get(x.constructor) === 'DenseMatrix'
}
```

---

## Issue 2: Class Constructor Invocation Errors

### Problem
```
TypeError: Class constructor _Complex cannot be invoked without 'new'
TypeError: Class constructor Index cannot be invoked without 'new'
```

### Frequency
- **136+ test failures** (83 Complex, 53 Index)

### Root Cause
esbuild compiles ES6 classes to a form where they cannot be called as functions. When typed-function attempts type conversions, it may invoke constructors without `new`.

### Suggested Improvements

#### 1. Explicit `new` in Conversions
Ensure all type conversions use explicit `new`:

```typescript
// Current (may fail)
convert: function(x) {
  return Complex(x, 0)  // Fails if Complex is compiled class
}

// Improved
convert: function(x) {
  return new Complex(x, 0)  // Always works
}
```

#### 2. Factory Function Pattern
Provide a factory function wrapper option:

```typescript
typed.addType({
  name: 'Complex',
  test: isComplex,
  factory: (re, im) => new Complex(re, im)  // Used for conversions
})
```

---

## Issue 3: BigInt Mixing with Other Types

### Problem
```
TypeError: Cannot mix BigInt and other types, use explicit conversions
```

### Frequency
- **93+ test failures**

### Root Cause
JavaScript's BigInt cannot be implicitly mixed with Number in arithmetic operations. The Fraction class in math.js uses BigInt internally, causing issues when typed-function performs automatic conversions.

### Suggested Improvements

#### 1. Explicit BigInt Conversion Chain
Add explicit conversion handling for BigInt:

```typescript
typed.addConversions([
  {
    from: 'Fraction',
    to: 'number',
    convert: (x) => {
      // Fraction uses BigInt internally, convert via valueOf()
      const value = x.valueOf()
      if (typeof value === 'bigint') {
        if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
          throw new TypeError('Fraction value exceeds safe integer range')
        }
        return Number(value)
      }
      return value
    }
  }
])
```

#### 2. Type Coercion Warnings
Add a warning mode that logs when implicit conversions cross BigInt boundaries:

```typescript
typed.config({
  warnOnBigIntCoercion: true
})
```

#### 3. Separate BigInt Type Signatures
Consider requiring explicit signatures for BigInt operations:

```typescript
typed('add', {
  'number, number': (a, b) => a + b,
  'bigint, bigint': (a, b) => a + b,
  // No implicit number <-> bigint conversion
})
```

---

## Issue 4: Function.name Property Issues

### Problem
When esbuild compiles classes, `Function.name` becomes read-only and attempts to override it fail:

```
TypeError: Cannot assign to read only property 'name' of function
```

### Context
Math.js uses a pattern where classes are created in factories with dynamic names:

```typescript
const name = 'DenseMatrix'
class DenseMatrix {
  static name = name  // Fails in esbuild
}
```

### Suggested Improvements

#### 1. Use Object.defineProperty
```typescript
class DenseMatrix { }
Object.defineProperty(DenseMatrix, 'name', {
  value: 'DenseMatrix',
  configurable: true
})
```

#### 2. Don't Rely on Function.name for Type Identification
typed-function should not use `constructor.name` for type matching:

```typescript
// Avoid
function getTypeName(x) {
  return x.constructor.name  // Unreliable after minification
}

// Better
function getTypeName(x) {
  return x[TYPE_SYMBOL] || typeRegistry.get(x.constructor)
}
```

---

## Issue 5: Prototype Chain Breakage

### Problem
Type tests that rely on `constructor.prototype` chains fail when:
- Classes are compiled/transpiled
- Multiple bundle versions exist
- Objects cross iframe/realm boundaries

### Current Pattern (Fragile)
```typescript
function isMatrix(x) {
  return x && x.constructor.prototype.isMatrix === true
}
```

### Suggested Improvements

#### 1. Instance Property Check
```typescript
function isMatrix(x) {
  return x && x.isMatrix === true  // Check instance, not prototype
}
```

#### 2. Duck Typing with Required Methods
```typescript
function isMatrix(x) {
  return x &&
    typeof x.get === 'function' &&
    typeof x.set === 'function' &&
    typeof x.size === 'function' &&
    Array.isArray(x._size)
}
```

#### 3. WeakSet Registration
```typescript
const matrices = new WeakSet()

class DenseMatrix {
  constructor() {
    matrices.add(this)
  }
}

function isMatrix(x) {
  return matrices.has(x)
}
```

---

## Issue 6: Type Resolution Performance

### Observation
With many type signatures and conversions, type resolution can become a bottleneck.

### Suggested Improvements

#### 1. Type Caching
Cache type resolution results for repeated calls with same argument types:

```typescript
const typeCache = new WeakMap()

function resolveType(arg) {
  if (typeCache.has(arg)) return typeCache.get(arg)
  const type = computeType(arg)
  typeCache.set(arg, type)
  return type
}
```

#### 2. Signature Indexing
Build an index for faster signature lookup:

```typescript
// Instead of linear search through all signatures
const signatureIndex = new Map()
signatureIndex.set('number,number', addNumberNumber)
signatureIndex.set('Matrix,Matrix', addMatrixMatrix)
```

#### 3. JIT Type Specialization
For hot paths, generate specialized functions:

```typescript
// For frequently called signature
const addNumbers = typed.specialize('add', ['number', 'number'])
// Returns direct function without type checking overhead
```

---

## Recommended Implementation Priority

1. **High Priority** (Fixes majority of failures)
   - Symbol-based type identification (Issue 1)
   - Explicit `new` in conversions (Issue 2)

2. **Medium Priority** (Improves robustness)
   - Instance property checks instead of prototype chains (Issue 5)
   - BigInt conversion handling (Issue 3)

3. **Low Priority** (Performance/polish)
   - Type caching (Issue 6)
   - Warning modes

---

## Test Compatibility Matrix

| Bundler/Runtime | Current Status | After Fixes |
|-----------------|----------------|-------------|
| Node.js (no bundling) | ✅ 100% pass | ✅ 100% pass |
| Mocha (CommonJS) | ✅ 100% pass | ✅ 100% pass |
| Vitest/esbuild | ❌ 73% pass | ✅ Expected 95%+ |
| Webpack | ⚠️ Untested | ✅ Expected 95%+ |
| Rollup | ⚠️ Untested | ✅ Expected 95%+ |

---

## Appendix: Error Frequency Analysis

| Error Pattern | Count | Affected Functions |
|---------------|-------|-------------------|
| `actual: any, index: 0` | 500+ | map, lup, qr, dot, subset, etc. |
| Class constructor without 'new' | 136 | Complex (83), Index (53) |
| Cannot mix BigInt | 93 | simplify, fraction operations |
| Dimension must be Array/Matrix | 41 | matrix operations |

---

## Contact

For questions about this document or the math.js integration, please open an issue at:
- Math.js: https://github.com/josdejong/mathjs
- Typed-function: https://github.com/josdejong/typed-function

---

*Document generated: December 2025*
*Math.js version: 15.1.0*
*typed-function version: @danielsimonjr/typed-function*
