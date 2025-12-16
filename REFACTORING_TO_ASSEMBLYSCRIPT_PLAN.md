# AssemblyScript Conversion Plan for Math.js

This document provides a comprehensive plan for converting Math.js source files from TypeScript to AssemblyScript (AS) for WASM compilation. Files are ranked by conversion difficulty and grouped into implementation phases.

## Table of Contents

1. [Overview](#overview)
2. [Conversion Principles](#conversion-principles)
3. [Current Status](#current-status)
4. [Difficulty Tiers](#difficulty-tiers)
5. [Implementation Phases](#implementation-phases)
6. [Files Not Convertible](#files-not-convertible)
7. [Technical Guidelines](#technical-guidelines)

---

## Overview

### Goals
- Achieve 2-25x performance improvements for numeric operations
- Maintain 100% backward compatibility with JavaScript API
- Enable multi-core parallel execution for large operations
- Provide automatic fallback to JavaScript when WASM unavailable

### Scope
- **Convertible**: ~115 pure numeric/algorithmic functions
- **Already Done**: ~60+ functions in `src-wasm/`
- **Remaining**: ~55 functions across various tiers
- **Not Convertible**: ~80+ symbolic/expression/type functions

---

## Conversion Principles

### AssemblyScript Constraints
1. **No dynamic typing** - All variables must have explicit types
2. **No closures over mutable state** - Use module-level state or pass as parameters
3. **No JavaScript objects** - Use typed arrays (`Float64Array`, `Int32Array`)
4. **No string manipulation** - Strings are immutable, use char codes
5. **No arbitrary precision** - Use `f64`, `i32`, `i64` primitives
6. **No classes with methods** - Use standalone functions with data arrays

### Data Structure Patterns

```typescript
// ❌ JavaScript pattern (NOT convertible)
class Matrix {
  constructor(public data: number[][], public rows: number, public cols: number) {}
  multiply(other: Matrix): Matrix { ... }
}

// ✅ AssemblyScript pattern (convertible)
export function matrixMultiply(
  a: Float64Array, aRows: i32, aCols: i32,
  b: Float64Array, bRows: i32, bCols: i32,
  result: Float64Array
): void { ... }
```

### Type Mappings

| JavaScript | AssemblyScript | Notes |
|------------|---------------|-------|
| `number` | `f64` | 64-bit float |
| `number` (int) | `i32` or `i64` | Signed integers |
| `boolean` | `bool` or `i32` | Use `i32` for return values |
| `number[]` | `Float64Array` | Typed arrays |
| `bigint` | `i64` | 64-bit signed integer |
| `BigNumber` | N/A | Not supported |
| `Fraction` | N/A | Not supported |
| `Complex` | `[f64, f64]` | Real/imag pair |
| `Matrix` | `Float64Array` + dimensions | Flat row-major array |

---

## Current Status

### Completed Modules (`src-wasm/`)

| Module | File | Functions |
|--------|------|-----------|
| **Arithmetic** | `basic.ts` | square, cube, cbrt, ceil, floor, round, sign, abs, sqrt, pow, add, subtract, multiply, divide |
| **Arithmetic** | `advanced.ts` | mod, hypot, gcd, lcm, nthRoot |
| **Arithmetic** | `logarithmic.ts` | exp, expm1, log, log2, log10, log1p |
| **Trigonometry** | `basic.ts` | sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh, asinh, acosh, atanh, sec, csc, cot, asec, acsc, acot, degToRad, radToDeg |
| **Bitwise** | `operations.ts` | bitAnd, bitOr, bitXor, bitNot, leftShift, rightArithShift, rightLogShift, popcount, rotl, rotr |
| **Logical** | `operations.ts` | and, or, not, xor, nand, nor, xnor, implies |
| **Relational** | `operations.ts` | compare, equal, unequal, larger, largerEq, smaller, smallerEq, clamp, inRange |
| **Complex** | `operations.ts` | arg, abs, conj, re, im, addComplex, subComplex, mulComplex, divComplex, expComplex, logComplex |
| **Set** | `operations.ts` | createSet, setUnion, setIntersect, setDifference, setSymDifference, setIsSubset, setPowerset |
| **Geometry** | `operations.ts` | distance2D, distance3D, manhattanDistance, cross3D, dot3D |
| **Special** | `functions.ts` | erf, erfc, gamma, lgamma, beta, zeta, besselJ0, besselJ1, besselY0, besselY1 |
| **Statistics** | `basic.ts` | sum, mean, min, max, prod, variance, std, median, mode, range, covariance, correlation, skewness, kurtosis, quantileSeq, interquartileRange, zscore, percentile, medianUnsorted, weightedMean, rms, meanAbsoluteDeviation, coefficientOfVariation, standardError, sumOfSquares |
| **Combinatorics** | `basic.ts` | factorial, permutations, combinations, combinationsWithRep, stirlingS2, bellNumbers, catalan, fibonacci, lucas |
| **Signal** | `fft.ts` | fft, ifft, ifft2d, isPowerOf2, powerSpectrum, magnitudeSpectrum, phaseSpectrum, crossCorrelation, autoCorrelation |
| **Signal** | `processing.ts` | freqzUniform, magnitude, phase, polyMultiply |
| **Matrix** | `multiply.ts` | dotProduct, scalarMultiply, matrixMultiply |
| **Matrix** | `algorithms.ts` | algo01-14 (sparse/dense operations) |
| **Matrix** | `basic.ts` | zeros, ones, identity, fill, diag, diagFromVector, trace, getRow, getColumn, setRow, setColumn, swapRows, transpose, flatten, reshape, dotMultiply, dotDivide, dotPow, abs, sqrt, square, sum, prod, min, max, argmin, argmax, sumRows, sumCols, concatHorizontal, concatVertical |
| **Matrix** | `linalg.ts` | det, inv, inv2x2, inv3x3, norm1, norm2, normP, normInf, normFro, matrixNorm1, matrixNormInf, normalize, kron, cross, dot, outer, cond1, condInf, rank, solve |
| **Matrix** | `functions.ts` | pinv, sqrtm, sqrtmSPD, expm, powerIteration, eigsSymmetric, eigs, spectralRadius, trace |
| **Numeric** | `ode.ts` | vectorAdd, vectorScale, vectorNorm, rk4Step |
| **Algebra** | `decomposition.ts` | luDecomposition, qrDecomposition, choleskyDecomposition, luSolve, luDeterminant |
| **Algebra** | `solver.ts` | lsolve, usolve, lsolveUnit, usolveUnit, solveTridiagonal, triangularInverse |
| **Algebra** | `polynomial.ts` | polyEval, polyEvalWithDerivative, quadraticRoots, cubicRoots, quarticRoots, polyRoots, polyDerivative, polyMultiply, polyDivide |
| **Algebra** | `equations.ts` | sylvester, lyap, dlyap, sylvesterResidual, lyapResidual, dlyapResidual |
| **Algebra/Sparse** | `utilities.ts` | csFlip, csUnflip, csCumsum, csMarked, csMark |
| **Probability** | `distributions.ts` | random, randomInt, uniform, normal, exponential, bernoulli, binomial, poisson, geometric, normalPDF, normalCDF, klDivergence, entropy |
| **Utils** | `checks.ts` | isNaN, isFinite, isInteger, isPositive, isNegative, isZero, isPrime, isEven, isOdd, gcd, lcm |
| **String** | `operations.ts` | isDigit, isLetter, toLowerCode, toUpperCode, parseFloatFromCodes, parseIntFromCodes |
| **Plain** | `operations.ts` | Comprehensive scalar operations mirror |

### Test Coverage
- **Pre-compile tests**: 64 individual tests passing across 44 test suites
- **All modules tested** via `test-wasm/unit-tests/wasm/pre-compile.test.ts`
- **WASM validation**: All modules pass AssemblyScript compilation check

---

## Difficulty Tiers

### Tier 1: TRIVIAL ✅ (Complete)
Pure numeric functions with single input/output, no dependencies.

**Status**: Already implemented in `src-wasm/`

---

### Tier 2: EASY (1-2 hours each)
Scalar functions with simple algorithms.

| File | Location | Complexity | Notes |
|------|----------|------------|-------|
| `mod.ts` | arithmetic/ | ⭐ | Modulo with sign handling |
| `hypot.ts` | arithmetic/ | ⭐ | Multi-argument sqrt(Σx²) |
| `nthRoot.ts` | arithmetic/ | ⭐⭐ | Newton-Raphson iteration |
| `nthRoots.ts` | arithmetic/ | ⭐⭐ | Complex roots of unity |
| `invmod.ts` | arithmetic/ | ⭐⭐ | Modular multiplicative inverse |
| `xgcd.ts` | arithmetic/ | ⭐⭐ | Extended Euclidean algorithm |

**Estimated effort**: 1 week total

---

### Tier 3: MEDIUM (2-4 hours each)
Array-based algorithms, basic linear algebra.

| File | Location | Complexity | Status | Notes |
|------|----------|------------|--------|-------|
| `trace.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/basic.ts` |
| `transpose.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/basic.ts` |
| `identity.ts` | matrix/ | ⭐ | ✅ Done | In `matrix/basic.ts` |
| `zeros.ts` | matrix/ | ⭐ | ✅ Done | In `matrix/basic.ts` |
| `ones.ts` | matrix/ | ⭐ | ✅ Done | In `matrix/basic.ts` |
| `diag.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/basic.ts` |
| `flatten.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/basic.ts` |
| `reshape.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/basic.ts` |
| `dot.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/linalg.ts` |
| `cross.ts` | matrix/ | ⭐⭐ | ✅ Done | In `matrix/linalg.ts` |
| `det.ts` | matrix/ | ⭐⭐⭐ | ✅ Done | In `matrix/linalg.ts` |
| `inv.ts` | matrix/ | ⭐⭐⭐ | ✅ Done | In `matrix/linalg.ts` |
| `kron.ts` | matrix/ | ⭐⭐⭐ | ✅ Done | In `matrix/linalg.ts` |
| `norm.ts` | arithmetic/ | ⭐⭐⭐ | ✅ Done | In `matrix/linalg.ts` |
| `variance.ts` | statistics/ | ⭐⭐ | ✅ Done | In `statistics/basic.ts` |
| `std.ts` | statistics/ | ⭐⭐ | ✅ Done | In `statistics/basic.ts` |
| `quantileSeq.ts` | statistics/ | ⭐⭐⭐ | Pending | Percentile calculation |
| `ifft.ts` | matrix/ | ⭐⭐⭐ | ✅ Done | In `signal/fft.ts` |

**Status**: 17/18 complete (94%)
**Remaining**: quantileSeq

---

### Tier 4: HARD (4-8 hours each)
Complex algorithms, multiple matrix decompositions.

| File | Location | Complexity | Status | Notes |
|------|----------|------------|--------|-------|
| `lusolve.ts` | algebra/solver/ | ⭐⭐⭐ | Pending | LU-based system solve |
| `lsolveAll.ts` | algebra/solver/ | ⭐⭐⭐ | Pending | All solutions for singular |
| `usolveAll.ts` | algebra/solver/ | ⭐⭐⭐ | Pending | All solutions for singular |
| `polynomial.ts` | algebra/ | ⭐⭐⭐⭐ | ✅ Done | Polynomial evaluation & root finding |
| `equations.ts` | algebra/ | ⭐⭐⭐⭐ | ✅ Done | Lyapunov & Sylvester solvers |
| `schur.ts` | algebra/decomposition/ | ⭐⭐⭐⭐ | Pending | Schur decomposition |
| `pinv.ts` | matrix/ | ⭐⭐⭐⭐ | Pending | Pseudoinverse (SVD) |
| `sqrtm.ts` | matrix/ | ⭐⭐⭐⭐ | Pending | Matrix square root |
| `expm.ts` | matrix/ | ⭐⭐⭐⭐ | Pending | Matrix exponential |
| `dotMultiply.ts` | arithmetic/ | ⭐⭐⭐ | Pending | Element-wise with broadcast |
| `dotDivide.ts` | arithmetic/ | ⭐⭐⭐ | Pending | Element-wise with broadcast |
| `dotPow.ts` | arithmetic/ | ⭐⭐⭐ | Pending | Element-wise power |
| `intersect.ts` | geometry/ | ⭐⭐⭐ | Pending | Line/plane intersection |
| `partitionSelect.ts` | matrix/ | ⭐⭐⭐⭐ | Pending | QuickSelect algorithm |
| `rotate.ts` | matrix/ | ⭐⭐⭐⭐ | Pending | N-dim rotation |
| `rotationMatrix.ts` | matrix/ | ⭐⭐⭐⭐ | Pending | Rotation matrix generation |

**Estimated effort**: 3-4 weeks total

---

### Tier 5: VERY HARD (1-2 days each)
Sparse matrix algorithms, eigenvalue problems.

| File | Location | Complexity | Notes |
|------|----------|------------|-------|
| `eigs.ts` | matrix/ | ⭐⭐⭐⭐⭐ | Eigenvalue decomposition |
| `csAmd.ts` | algebra/sparse/ | ⭐⭐⭐⭐⭐ | Approximate minimum degree |
| `csChol.ts` | algebra/sparse/ | ⭐⭐⭐⭐⭐ | Sparse Cholesky |
| `csLu.ts` | algebra/sparse/ | ⭐⭐⭐⭐⭐ | Sparse LU |
| `csQr.ts` | algebra/sparse/ | ⭐⭐⭐⭐⭐ | Sparse QR |
| `csPermute.ts` | algebra/sparse/ | ⭐⭐⭐⭐ | Sparse permutation |
| `csReach.ts` | algebra/sparse/ | ⭐⭐⭐⭐ | Graph reachability |
| `csSpsolve.ts` | algebra/sparse/ | ⭐⭐⭐⭐⭐ | Sparse triangular solve |
| `csDfs.ts` | algebra/sparse/ | ⭐⭐⭐⭐ | Depth-first search |
| `csEtree.ts` | algebra/sparse/ | ⭐⭐⭐⭐ | Elimination tree |
| `slu.ts` | algebra/decomposition/ | ⭐⭐⭐⭐⭐ | Sparse LU decomposition |

**Estimated effort**: 1-2 months total

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2) ✅ COMPLETE
- [x] Core arithmetic operations
- [x] Trigonometric functions
- [x] Bitwise and logical operations
- [x] Basic statistics
- [x] Set operations
- [x] Pre-compile test infrastructure

### Phase 2: Matrix Basics (Week 3-4)
- [ ] `matrix/trace.ts` - Diagonal sum
- [ ] `matrix/transpose.ts` - Transposition
- [ ] `matrix/identity.ts` - Identity matrix
- [ ] `matrix/zeros.ts` - Zero matrix
- [ ] `matrix/ones.ts` - Ones matrix
- [ ] `matrix/diag.ts` - Diagonal operations
- [ ] `matrix/flatten.ts` - Flatten to 1D
- [ ] `matrix/reshape.ts` - Reshape dimensions

### Phase 3: Linear Algebra Core (Week 5-7)
- [ ] `matrix/det.ts` - Determinant
- [ ] `matrix/inv.ts` - Matrix inverse
- [ ] `matrix/dot.ts` - Dot product (vectors)
- [ ] `matrix/cross.ts` - Cross product
- [ ] `matrix/kron.ts` - Kronecker product
- [ ] `arithmetic/norm.ts` - Vector/matrix norms
- [ ] `signal/ifft.ts` - Inverse FFT

### Phase 4: Advanced Statistics (Week 8-9)
- [ ] `statistics/variance.ts` - Variance calculation
- [ ] `statistics/std.ts` - Standard deviation
- [ ] `statistics/quantileSeq.ts` - Quantiles/percentiles
- [ ] `statistics/mad.ts` - Median absolute deviation

### Phase 5: Advanced Solvers (Week 10-12) ✅ COMPLETE
- [x] `algebra/polynomial.ts` - Polynomial operations:
  - polyEval, polyEvalWithDerivative (Horner's method)
  - quadraticRoots (closed-form)
  - cubicRoots (Cardano's formula)
  - quarticRoots (Ferrari's method)
  - polyRoots (Durand-Kerner for degree > 4)
  - polyDerivative, polyMultiply, polyDivide
- [x] `algebra/equations.ts` - Matrix equation solvers:
  - sylvester (Sylvester equation: AX + XB = C)
  - lyap (continuous Lyapunov: AX + XA^T = Q)
  - dlyap (discrete Lyapunov: AXA^T - X = Q)
  - sylvesterResidual, lyapResidual, dlyapResidual

### Phase 6: Matrix Functions (Week 13-15)
- [ ] `matrix/pinv.ts` - Moore-Penrose pseudoinverse
- [ ] `matrix/sqrtm.ts` - Matrix square root
- [ ] `matrix/expm.ts` - Matrix exponential
- [ ] `matrix/eigs.ts` - Eigenvalues/eigenvectors

### Phase 7: Sparse Algorithms (Week 16-20) - Optional
- [ ] Sparse LU factorization
- [ ] Sparse Cholesky factorization
- [ ] Sparse QR factorization
- [ ] Approximate minimum degree ordering

---

## Files Not Convertible

These files cannot be converted to AssemblyScript due to fundamental incompatibilities:

### Symbolic Mathematics
| File | Reason |
|------|--------|
| `algebra/derivative.ts` | AST manipulation, parser dependency |
| `algebra/simplify.ts` | Expression tree transformation |
| `algebra/simplifyCore.ts` | Rule-based simplification |
| `algebra/simplifyConstant.ts` | Constant folding on AST |
| `algebra/rationalize.ts` | Symbolic manipulation |
| `algebra/resolve.ts` | Symbol resolution |
| `algebra/symbolicEqual.ts` | Symbolic comparison |
| `algebra/leafCount.ts` | AST traversal |

### Expression System (`src/expression/`)
| Component | Reason |
|-----------|--------|
| Parser | String parsing, tokenization |
| Evaluator | Dynamic dispatch |
| Node classes | Object-oriented AST |
| Help system | String manipulation |
| Embedded docs | Documentation strings |

### Type System (`src/type/`)
| Type | Reason |
|------|--------|
| `Unit` | String parsing, conversion tables |
| `BigNumber` | Arbitrary precision arithmetic |
| `Fraction` | Rational number representation |
| `Complex` class | Object with methods |
| `Matrix` class | Object-oriented interface |
| `SparseMatrix` class | Complex data structure |
| `Chain` | Fluent API pattern |

### Functions with Type Dependencies
| File | Reason |
|------|--------|
| `unit/to.ts` | Unit type dependency |
| `unit/toBest.ts` | Unit conversion logic |
| `complex/complex.ts` | Complex class factory |
| Any function with `BigNumber` signature | Arbitrary precision |
| Any function with `Fraction` signature | Rational arithmetic |

---

## Technical Guidelines

### Function Signature Pattern

```typescript
// Standard numeric function
export function functionName(x: f64): f64 {
  return result
}

// Array function with output parameter
export function arrayFunction(
  input: Float64Array,
  length: i32,
  output: Float64Array
): void {
  for (let i: i32 = 0; i < length; i++) {
    output[i] = transform(input[i])
  }
}

// Matrix function (row-major flat array)
export function matrixFunction(
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  result: Float64Array
): void {
  // Access element at (i, j): a[i * aCols + j]
}
```

### Memory Management

```typescript
// ✅ Good: Caller allocates output
export function compute(input: Float64Array, output: Float64Array, n: i32): void

// ⚠️ Acceptable: Function allocates (document clearly)
export function compute(input: Float64Array, n: i32): Float64Array {
  const result = new Float64Array(n)
  // ...
  return result
}

// ❌ Bad: Hidden allocations in loops
export function compute(input: Float64Array): Float64Array {
  for (let i = 0; i < n; i++) {
    const temp = new Float64Array(m)  // Allocation in loop!
  }
}
```

### Error Handling

```typescript
// Return NaN for invalid inputs
export function sqrt(x: f64): f64 {
  if (x < 0) return f64.NaN
  return Math.sqrt(x)
}

// Use sentinel values for array functions
export function findIndex(arr: Float64Array, value: f64, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (arr[i] === value) return i
  }
  return -1  // Not found
}

// Return success flag for complex operations
export function decompose(matrix: Float64Array, n: i32, result: Float64Array): i32 {
  // Returns 1 on success, 0 on failure (singular matrix, etc.)
}
```

### Testing Pattern

```typescript
// In pre-compile.test.ts
describe('ModuleName (direct import)', function () {
  it('should import and run functions', async function () {
    const module = await import('../../../src-wasm/category/module')

    // Test scalar functions
    approxEqual(module.func(input), expected, tolerance)

    // Test array functions
    const input = new Float64Array([...])
    const output = new Float64Array(n)
    module.arrayFunc(input, n, output)
    assert.deepStrictEqual(Array.from(output), expected)

    console.log('  ✓ category/module')
  })
})
```

---

## Summary Statistics

| Category | Total Files | Convertible | Done | Remaining |
|----------|-------------|-------------|------|-----------|
| arithmetic/ | 39 | 35 | 30 | 5 |
| trigonometry/ | 24 | 24 | 24 | 0 |
| bitwise/ | 7 | 7 | 7 | 0 |
| logical/ | 5 | 5 | 5 | 0 |
| relational/ | 11 | 11 | 11 | 0 |
| matrix/ | 42 | 25 | 5 | 20 |
| statistics/ | 15 | 12 | 8 | 4 |
| algebra/ | 25 | 10 | 6 | 4 |
| algebra/sparse/ | 15 | 15 | 1 | 14 |
| combinatorics/ | 5 | 5 | 5 | 0 |
| probability/ | 13 | 10 | 8 | 2 |
| special/ | 2 | 2 | 2 | 0 |
| signal/ | 3 | 3 | 3 | 0 |
| geometry/ | 2 | 2 | 2 | 0 |
| set/ | 10 | 10 | 10 | 0 |
| string/ | 5 | 3 | 3 | 0 |
| numeric/ | 1 | 1 | 1 | 0 |
| complex/ | 3 | 2 | 2 | 0 |
| utils/ | 13 | 10 | 8 | 2 |
| unit/ | 3 | 0 | 0 | N/A |
| **Total** | ~238 | ~115 | ~60 | ~55 |

### Effort Estimates

| Phase | Functions | Effort | Priority |
|-------|-----------|--------|----------|
| Phase 2 (Matrix Basics) | 8 | 1-2 weeks | High |
| Phase 3 (Linear Algebra) | 7 | 2-3 weeks | High |
| Phase 4 (Statistics) | 4 | 1 week | Medium |
| Phase 5 (Solvers) | 6 | 2-3 weeks | Medium |
| Phase 6 (Matrix Functions) | 4 | 2-3 weeks | Low |
| Phase 7 (Sparse) | 11 | 4-6 weeks | Optional |

**Total estimated remaining effort**: 12-18 weeks for complete conversion of convertible functions.

---

## References

- [AssemblyScript Documentation](https://www.assemblyscript.org/introduction.html)
- [AssemblyScript Types](https://www.assemblyscript.org/types.html)
- [Math.js Documentation](https://mathjs.org/docs/)
- [WASM Performance Guidelines](https://webassembly.org/docs/use-cases/)
