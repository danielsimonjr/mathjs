# AssemblyScript Style Guide for Math.js

> **Version**: 1.0.0
> **Last Updated**: 2026-01-29
> **Applies to**: All `.ts` files in `src/wasm/`

This style guide establishes conventions for writing AssemblyScript code in the Math.js codebase. Following these guidelines ensures consistent, performant, and maintainable WASM modules.

## Table of Contents

1. [File Organization](#file-organization)
2. [Naming Conventions](#naming-conventions)
3. [Type System](#type-system)
4. [Memory Management](#memory-management)
5. [Performance Optimization](#performance-optimization)
6. [JavaScript Interop](#javascript-interop)
7. [Documentation](#documentation)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Common Patterns](#common-patterns)
11. [What to Avoid](#what-to-avoid)

---

## File Organization

### Directory Structure

```
src/wasm/
├── algebra/           # Algebraic operations (polynomial, decomposition)
├── arithmetic/        # Basic arithmetic operations
├── bitwise/           # Bitwise operations
├── combinatorics/     # Combinatorial functions
├── geometry/          # Geometric calculations
├── matrix/            # Matrix operations
├── signal/            # Signal processing (FFT, etc.)
├── statistics/        # Statistical functions
├── trigonometry/      # Trigonometric functions
└── index.ts           # Main entry point, re-exports all modules
```

### File Structure

Each module file should follow this structure:

```typescript
/**
 * Module-level documentation
 *
 * Describes the purpose and contents of this module.
 * Include any important notes about memory layout or usage.
 */

// ============================================
// SECTION NAME (use for logical grouping)
// ============================================

/**
 * Function documentation
 */
export function functionName(...): ... {
  // Implementation
}

// Repeat for each section
```

### Imports

- Import from AssemblyScript stdlib using direct paths
- Group imports by source (stdlib, local modules)
- Avoid circular dependencies

```typescript
// Good
import { Math } from "math"

// Avoid - circular dependency risk
import { helperFromOtherModule } from "../other/module"
```

---

## Naming Conventions

### Functions

| Type | Convention | Example |
|------|------------|---------|
| Public functions | `camelCase` | `polyEval`, `matrixMultiply` |
| Internal helpers | `_camelCase` | `_normalizeCoeffs` |
| Predicates | `is/has` prefix | `isPositive`, `hasConverged` |

### Variables

| Type | Convention | Example |
|------|------------|---------|
| Local variables | `camelCase` | `result`, `coeffPtr` |
| Loop indices | Single letters | `i`, `j`, `k` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_ITERATIONS`, `EPSILON` |
| Pointer parameters | `Ptr` suffix | `coeffsPtr`, `resultPtr`, `workPtr` |

### Types

| Type | Convention | Example |
|------|------------|---------|
| Custom types | `PascalCase` | `ComplexNumber`, `MatrixView` |
| Type aliases | `PascalCase` | `Float64Ptr` |

### File Names

- Use `kebab-case.ts` for file names
- Match the primary function/concept: `polynomial.ts`, `matrix-multiply.ts`

---

## Type System

### Preferred Types

Always use explicit WebAssembly-aligned types:

```typescript
// Integer types (use these)
i8, i16, i32, i64     // Signed integers
u8, u16, u32, u64     // Unsigned integers
isize, usize          // Pointer-sized integers

// Floating point (use these)
f32                   // 32-bit float (when precision allows)
f64                   // 64-bit float (default for math)

// Special
bool                  // Boolean (stored as i32)
void                  // No return value
```

### Type Annotations

**Always annotate**:
- Function parameters
- Function return types
- Variable declarations without initializers

```typescript
// Good - fully annotated
export function add(a: f64, b: f64): f64 {
  return a + b
}

// Good - type inferred from initializer
let result: f64 = 0.0
let count = 0  // Inferred as i32

// Bad - missing return type
export function add(a: f64, b: f64) {  // Missing return type!
  return a + b
}
```

### Type Conversions

Use explicit conversions, never rely on implicit coercion:

```typescript
// Good - explicit conversion
const floatValue: f64 = f64(intValue)
const index: i32 = <i32>usizeValue

// Good - using portable built-ins
const i: i32 = i32(someValue)
const f: f64 = f64(someInt)

// Bad - implicit conversion
const floatValue: f64 = intValue  // May cause issues
```

### Pointer Arithmetic

For f64 arrays, use bit shifting for offset calculation:

```typescript
// Access f64 at index i (f64 = 8 bytes = 2^3)
const value = load<f64>(ptr + ((<usize>i) << 3))

// Access f32 at index i (f32 = 4 bytes = 2^2)
const value = load<f32>(ptr + ((<usize>i) << 2))

// Access i32 at index i (i32 = 4 bytes = 2^2)
const value = load<i32>(ptr + ((<usize>i) << 2))
```

---

## Memory Management

### Memory Access Patterns

Use `load<T>` and `store<T>` for direct memory access:

```typescript
// Reading from memory
const value: f64 = load<f64>(ptr)
const valueAtOffset: f64 = load<f64>(ptr + 8)
const valueAtIndex: f64 = load<f64>(ptr + ((<usize>i) << 3))

// Writing to memory
store<f64>(ptr, value)
store<f64>(ptr + 8, anotherValue)
store<f64>(ptr + ((<usize>i) << 3), indexedValue)
```

### Working Memory Pattern

For functions that need temporary storage, accept a `workPtr` parameter:

```typescript
/**
 * @param workPtr - Pointer to working memory (f64, N elements required)
 */
export function complexOperation(
  inputPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize  // Caller provides working memory
): void {
  // Use workPtr for temporary calculations
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(workPtr + ((<usize>i) << 3), /* temp value */)
  }
  // ...
}
```

### Memory Layout Documentation

Document memory requirements in function JSDoc:

```typescript
/**
 * Find polynomial roots
 * @param coeffsPtr - Pointer to coefficients (f64, n elements)
 * @param n - Number of coefficients
 * @param rootsPtr - Output: roots as [real1, imag1, ...] (f64, 2*(n-1) elements)
 * @param workPtr - Working memory (f64, n elements required)
 */
```

### Avoid Allocations in Hot Paths

- Never use `new` in performance-critical loops
- Pre-allocate all needed memory via `workPtr`
- Use `StaticArray` when array size is known at compile time

```typescript
// Bad - allocates in loop
for (let i = 0; i < n; i++) {
  const temp = new StaticArray<f64>(10)  // Allocation every iteration!
}

// Good - pre-allocated
export function process(inputPtr: usize, n: i32, workPtr: usize): void {
  // workPtr already allocated by caller
}
```

---

## Performance Optimization

### Compiler Flags

Use appropriate optimization levels in `asconfig.json`:

```json
{
  "targets": {
    "release": {
      "optimizeLevel": 3,
      "shrinkLevel": 1,
      "noAssert": false
    },
    "debug": {
      "debug": true,
      "optimizeLevel": 0
    }
  }
}
```

### Optimization Guidelines

#### 1. Use `unchecked()` for Validated Access

```typescript
// When bounds are already validated
for (let i: i32 = 0; i < n; i++) {
  // We know i is in bounds, skip bounds check
  const val = unchecked(array[i])
}
```

#### 2. Prefer `StaticArray` Over `Array`

```typescript
// Good - no indirection overhead
const fixed = new StaticArray<f64>(100)

// Slower - has backing buffer indirection
const dynamic = new Array<f64>(100)
```

#### 3. Avoid `Math.pow()` for Small Exponents

```typescript
// Bad - function call overhead
const squared = Math.pow(x, 2)
const cubed = Math.pow(x, 3)

// Good - direct multiplication
const squared = x * x
const cubed = x * x * x
```

#### 4. Use Horner's Method for Polynomial Evaluation

```typescript
// Bad - naive evaluation with pow
let result = a0 + a1*x + a2*x*x + a3*x*x*x

// Good - Horner's method
let result = a3
result = result * x + a2
result = result * x + a1
result = result * x + a0
```

#### 5. Minimize Memory Access in Loops

```typescript
// Bad - repeated memory access
for (let i: i32 = 0; i < n; i++) {
  result += load<f64>(ptr + ((<usize>i) << 3)) * load<f64>(ptr + ((<usize>i) << 3))
}

// Good - load once, use multiple times
for (let i: i32 = 0; i < n; i++) {
  const val: f64 = load<f64>(ptr + ((<usize>i) << 3))
  result += val * val
}
```

#### 6. Use SIMD for Parallel Operations (When Available)

```typescript
// Enable SIMD in asconfig.json: "enable": ["simd"]

// SIMD vector operations
const a = v128.load(ptrA)
const b = v128.load(ptrB)
const sum = f64x2.add(a, b)
v128.store(ptrResult, sum)
```

### Loop Optimizations

```typescript
// Good - count down when possible (comparison to 0 is faster)
for (let i: i32 = n - 1; i >= 0; i--) {
  // ...
}

// Good - cache loop bound
const len: i32 = n
for (let i: i32 = 0; i < len; i++) {
  // ...
}

// Good - unroll small fixed loops
// Instead of loop for 4 elements:
store<f64>(ptr, v0)
store<f64>(ptr + 8, v1)
store<f64>(ptr + 16, v2)
store<f64>(ptr + 24, v3)
```

---

## JavaScript Interop

### Function Signatures

Design functions for easy JavaScript interop:

```typescript
// Good - primitive types, pointer for arrays
export function compute(
  inputPtr: usize,   // JS passes pointer to typed array
  n: i32,            // Array length
  resultPtr: usize   // Output pointer
): i32 {             // Return status or count
  // ...
  return n
}

// Avoid - complex return types
export function compute(): Float64Array {  // Hard to interop
  // ...
}
```

### Bindings Configuration

In `asconfig.json`:

```json
{
  "options": {
    "bindings": "esm",
    "exportRuntime": true,
    "exportMemory": true
  }
}
```

### JavaScript Usage Pattern

```javascript
// JavaScript side
import { compute, __pin, __unpin, __new } from './module.js'

// Allocate memory for input
const inputPtr = __pin(__new(n * 8, 0))  // n f64 values
const resultPtr = __pin(__new(m * 8, 0))

// Copy data to WASM memory
const inputView = new Float64Array(memory.buffer, inputPtr, n)
inputView.set(jsInputArray)

// Call WASM function
const count = compute(inputPtr, n, resultPtr)

// Read results
const resultView = new Float64Array(memory.buffer, resultPtr, m)
const results = Array.from(resultView)

// Free memory
__unpin(inputPtr)
__unpin(resultPtr)
```

---

## Documentation

### Module Documentation

```typescript
/**
 * WASM-optimized [module name] operations
 *
 * [Description of what this module provides]
 *
 * Memory Layout:
 * - [Describe any specific memory layout requirements]
 *
 * Usage:
 * - [Brief usage notes]
 *
 * @module
 */
```

### Function Documentation

Use JSDoc format with specific annotations:

```typescript
/**
 * [Brief description of what the function does]
 *
 * [Optional: Longer description, algorithm notes, references]
 *
 * @param paramName - Description (type, size if array)
 * @param resultPtr - Pointer to output (type, N elements)
 * @param workPtr - Working memory required (type, N elements)
 * @returns Description of return value
 *
 * @example
 * // Optional usage example
 * polyEval(coeffsPtr, 5, 2.0)  // Evaluate degree-4 polynomial at x=2
 */
export function functionName(
  paramName: type,
  resultPtr: usize,
  workPtr: usize
): returnType {
  // ...
}
```

### Section Headers

Use consistent section separators:

```typescript
// ============================================
// SECTION NAME
// ============================================
```

### Inline Comments

```typescript
// Explain WHY, not WHAT (the code shows what)

// Good - explains reasoning
// Use Horner's method to avoid numerical instability with large exponents
let result: f64 = coeffs[n - 1]

// Bad - just restates the code
// Set result to the last coefficient
let result: f64 = coeffs[n - 1]
```

---

## Error Handling

### Return Values for Errors

Use return values to indicate success/failure:

```typescript
/**
 * @returns Number of results, or 0 if error
 */
export function compute(inputPtr: usize, n: i32, resultPtr: usize): i32 {
  if (n <= 0) {
    return 0  // Indicate error via return value
  }
  // ...
  return resultCount
}
```

### Edge Cases

Handle edge cases explicitly at function start:

```typescript
export function polyEval(coeffsPtr: usize, n: i32, x: f64): f64 {
  // Handle edge cases first
  if (n === 0) return 0.0
  if (n === 1) return load<f64>(coeffsPtr)

  // Main algorithm
  // ...
}
```

### NaN for Invalid Results

Use `NaN` to indicate mathematically undefined results:

```typescript
if (Math.abs(denominator) < 1e-14) {
  store<f64>(resultPtr, f64.NaN)
  return
}
```

### Assertions (Debug Only)

Use `assert()` for invariant checking in debug builds:

```typescript
// These are stripped in release builds with --noAssert
assert(n > 0, "Array length must be positive")
assert(ptr != 0, "Null pointer")
```

---

## Testing

### Test File Organization

```
test/wasm/
├── unit-tests/
│   └── [module-name].test.ts
└── integration/
    └── [feature].test.ts
```

### Test Patterns

```typescript
import { describe, it, expect } from 'vitest'

describe('polyEval', () => {
  it('evaluates constant polynomial', () => {
    // Setup
    const coeffs = new Float64Array([5.0])
    // ... allocate and copy to WASM memory

    // Execute
    const result = polyEval(coeffsPtr, 1, 10.0)

    // Assert
    expect(result).toBe(5.0)
  })

  it('handles edge case: empty polynomial', () => {
    const result = polyEval(0, 0, 1.0)
    expect(result).toBe(0.0)
  })
})
```

### Numerical Tolerance

Use appropriate tolerances for floating-point comparisons:

```typescript
const EPSILON = 1e-10

expect(Math.abs(result - expected)).toBeLessThan(EPSILON)

// Or use a relative tolerance
expect(Math.abs(result - expected) / Math.abs(expected)).toBeLessThan(1e-12)
```

---

## Common Patterns

### Complex Number Results

Return complex numbers as interleaved real/imaginary pairs:

```typescript
// Output layout: [real1, imag1, real2, imag2, ...]
store<f64>(resultPtr, realPart)
store<f64>(resultPtr + 8, imagPart)
```

### Iterative Algorithms

```typescript
export function iterativeSolve(
  inputPtr: usize,
  n: i32,
  maxIter: i32,
  tol: f64,
  resultPtr: usize
): i32 {
  for (let iter: i32 = 0; iter < maxIter; iter++) {
    // Compute iteration
    // ...

    // Check convergence
    if (error < tol) {
      return iter + 1  // Return iteration count
    }
  }
  return -1  // Did not converge
}
```

### Numerical Constants

```typescript
// Use typed constants
const PI: f64 = 3.141592653589793
const TWO_PI: f64 = 6.283185307179586
const EPSILON: f64 = 1e-14

// Or use Math constants
const pi = Math.PI  // f64
```

### Matrix Indexing (Row-Major)

```typescript
// Access element at row i, col j in matrix with numCols columns
const index: i32 = i * numCols + j
const value = load<f64>(matrixPtr + ((<usize>index) << 3))
```

---

## What to Avoid

### Never Use

| Feature | Reason | Alternative |
|---------|--------|-------------|
| `any` type | No dynamic typing in AS | Use explicit types |
| `undefined` | Not available | Use `null` for references, `0`/`NaN` for numbers |
| `instanceof` | No runtime type checking | Use compile-time generics |
| `RegExp` | Not supported | Implement parsing manually |
| `async`/`await` | Not supported | Use synchronous code |
| `Map`/`Set` | High overhead | Use `StaticArray` or raw memory |
| `Object` literals | Not supported | Use `class` or raw memory |
| `JSON` | Not available | Pass primitives or raw memory |
| String operations | Limited support, slow | Minimize string usage |

### Performance Anti-Patterns

```typescript
// Bad - allocation in loop
for (let i = 0; i < n; i++) {
  const temp = new StaticArray<f64>(10)
}

// Bad - repeated memory access
for (let i = 0; i < n; i++) {
  result += arr[i] * arr[i]  // Two loads per iteration
}

// Bad - using Math.pow for small exponents
const x2 = Math.pow(x, 2)
const x3 = Math.pow(x, 3)

// Bad - unnecessary type conversions in loop
for (let i: i32 = 0; i < n; i++) {
  const f: f64 = <f64>i  // Convert every iteration
}
```

### Interop Anti-Patterns

```typescript
// Bad - returning objects
export function getResult(): { x: f64, y: f64 } {
  // Objects require complex serialization
}

// Good - use output pointers
export function getResult(resultPtr: usize): void {
  store<f64>(resultPtr, x)
  store<f64>(resultPtr + 8, y)
}
```

---

## References

- [AssemblyScript Documentation](https://www.assemblyscript.org/)
- [AssemblyScript Types](https://www.assemblyscript.org/types.html)
- [AssemblyScript Concepts](https://www.assemblyscript.org/concepts.html)
- [AssemblyScript Compiler Options](https://www.assemblyscript.org/compiler.html)
- [AssemblyScript Runtime](https://www.assemblyscript.org/runtime.html)
- [WebAssembly Linear Memory](https://wasmbyexample.dev/examples/webassembly-linear-memory/webassembly-linear-memory.assemblyscript.en-us.html)
- [AssemblyScript Performance Tips](https://www.assemblyscript.org/frequently-asked-questions.html)
- [Porting JavaScript to AssemblyScript (Fastly)](https://www.fastly.com/blog/porting-javascript-or-typescript-to-assemblyscript)
- [AssemblyScript Performance Analysis (Surma)](https://surma.dev/things/js-to-asc/)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial version |
