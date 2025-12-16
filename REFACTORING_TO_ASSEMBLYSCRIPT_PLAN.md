# AssemblyScript Conversion Plan for Math.js

> **✅ STATUS: CONVERSION COMPLETE** (December 2025)
>
> All 8 implementation phases have been completed. The `src-wasm/` directory now contains
> 43 TypeScript/AssemblyScript modules with 200+ high-performance functions ready for
> WASM compilation. See [Current Status](#current-status) for details.

This document provides a comprehensive plan for converting Math.js source files from TypeScript to AssemblyScript (AS) for WASM compilation. Files are ranked by conversion difficulty and grouped into implementation phases.

## Table of Contents

1. [Overview](#overview)
2. [Conversion Principles](#conversion-principles)
3. [Current Status](#current-status)
4. [Difficulty Tiers](#difficulty-tiers)
5. [Implementation Phases](#implementation-phases)
6. [Files Not Convertible](#files-not-convertible)
7. [Numerical Alternatives](#numerical-alternatives)
8. [Technical Guidelines](#technical-guidelines)
9. [Completion Summary](#completion-summary)

---

## Overview

### Goals
- Achieve 2-25x performance improvements for numeric operations
- Maintain 100% backward compatibility with JavaScript API
- Enable multi-core parallel execution for large operations
- Provide automatic fallback to JavaScript when WASM unavailable

### Scope
- **Convertible**: ~115 pure numeric/algorithmic functions
- **Implemented**: ~200+ functions in `src-wasm/` (43 module files)
- **Remaining**: 0 functions - ALL PHASES COMPLETE
- **Not Convertible**: ~80+ symbolic/expression/type functions (numerical alternatives provided)

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
| `Fraction` | N/A | Use `numeric/rational.ts` alternative |
| `Complex` | `[f64, f64]` | Real/imag pair |
| `Matrix` | `Float64Array` + dimensions | Flat row-major array |

---

## Current Status

### Completed Modules (`src-wasm/`)

| Module | File | Functions |
|--------|------|-----------|
| **Arithmetic** | `basic.ts` | square, cube, cbrt, ceil, floor, round, sign, abs, sqrt, pow, add, subtract, multiply, divide, unaryMinus |
| **Arithmetic** | `advanced.ts` | mod, hypot, gcd, lcm, xgcd, invmod, nthRoot, nthRootsOfUnity, nthRootsReal, nthRootsComplex, nthRootSigned, norm1, norm2, normInf, normP, hypot2, hypot3, hypotArray, modArray, gcdArray, lcmArray |
| **Arithmetic** | `logarithmic.ts` | exp, expm1, log, log2, log10, log1p |
| **Trigonometry** | `basic.ts` | sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh, asinh, acosh, atanh, sec, csc, cot, asec, acsc, acot, degToRad, radToDeg |
| **Bitwise** | `operations.ts` | bitAnd, bitOr, bitXor, bitNot, leftShift, rightArithShift, rightLogShift, popcount, rotl, rotr |
| **Logical** | `operations.ts` | and, or, not, xor, nand, nor, xnor, implies |
| **Relational** | `operations.ts` | compare, equal, unequal, larger, largerEq, smaller, smallerEq, clamp, inRange |
| **Complex** | `operations.ts` | arg, abs, conj, re, im, addComplex, subComplex, mulComplex, divComplex, expComplex, logComplex |
| **Set** | `operations.ts` | createSet, setUnion, setIntersect, setDifference, setSymDifference, setIsSubset, setPowerset |
| **Geometry** | `operations.ts` | distance2D, distance3D, manhattanDistance, cross3D, dot3D, intersectLineCircle, intersectLineSphere, intersectCircles, projectPointOnLine2D, distancePointToLine2D, distancePointToPlane, polygonCentroid2D, polygonArea2D, pointInConvexPolygon2D |
| **Special** | `functions.ts` | erf, erfc, gamma, lgamma, beta, zeta, besselJ0, besselJ1, besselY0, besselY1 |
| **Statistics** | `basic.ts` | sum, mean, min, max, prod, variance, std, median, mode, range, covariance, correlation, skewness, kurtosis, quantileSeq, interquartileRange, zscore, percentile, medianUnsorted, weightedMean, rms, meanAbsoluteDeviation, coefficientOfVariation, standardError, sumOfSquares |
| **Statistics** | `select.ts` | partitionSelect, partitionSelectMoT, selectMedian, selectMin, selectMax, selectKSmallest, selectKLargest, introSelect, selectQuantile, partitionSelectIndex |
| **Combinatorics** | `basic.ts` | factorial, permutations, combinations, combinationsWithRep, stirlingS2, bellNumbers, catalan, fibonacci, lucas |
| **Signal** | `fft.ts` | fft, ifft, fft2d, ifft2d, isPowerOf2, powerSpectrum, magnitudeSpectrum, phaseSpectrum, crossCorrelation, autoCorrelation |
| **Signal** | `processing.ts` | freqzUniform, magnitude, phase, polyMultiply |
| **Matrix** | `multiply.ts` | dotProduct, scalarMultiply, matrixMultiply |
| **Matrix** | `algorithms.ts` | algo01-14 (sparse/dense operations) |
| **Matrix** | `basic.ts` | zeros, ones, identity, fill, diag, diagFromVector, trace, getRow, getColumn, setRow, setColumn, swapRows, transpose, flatten, reshape, dotMultiply, dotDivide, dotPow, abs, sqrt, square, sum, prod, min, max, argmin, argmax, sumRows, sumCols, concatHorizontal, concatVertical |
| **Matrix** | `linalg.ts` | det, inv, inv2x2, inv3x3, norm1, norm2, normP, normInf, normFro, matrixNorm1, matrixNormInf, normalize, kron, cross, dot, outer, cond1, condInf, rank, solve |
| **Matrix** | `functions.ts` | pinv, sqrtm, sqrtmSPD, expm, powerIteration, eigsSymmetric, eigs, spectralRadius, trace |
| **Matrix** | `broadcast.ts` | broadcastMultiply, broadcastAdd, broadcastSubtract, broadcastDivide, broadcastPow, broadcastMin, broadcastMax, broadcastMod, broadcastEqual, broadcastLess, broadcastGreater, broadcastShape, canBroadcast, broadcastScalarMultiply, broadcastScalarAdd |
| **Matrix** | `rotation.ts` | rotationMatrix2D, rotate2D, rotate2DAroundPoint, rotationMatrixX/Y/Z, rotationMatrixAxisAngle, rotationMatrixEulerZYX/XYZ, rotationMatrixFromQuaternion, quaternionFromRotationMatrix, quaternionMultiply, quaternionSlerp, quaternionFromAxisAngle, rotateByQuaternion, rotateByMatrix, isRotationMatrix |
| **Numeric** | `ode.ts` | vectorAdd, vectorScale, vectorNorm, rk4Step |
| **Numeric** | `calculus.ts` | forwardDifference, backwardDifference, centralDifference, secondDerivative, fivePointStencil, richardsonExtrapolation, trapezoidalRule, simpsonsRule, simpsons38Rule, gaussLegendre, romberg, jacobian, hessianDiagonal, gradient |
| **Numeric** | `rootfinding.ts` | bisectionSetup, bisectionStep, newtonSetup, newtonStep, secantSetup, secantStep, secantUpdate, brentSetup, brentStep, fixedPointStep, illinoisStep, mullerStep, steffensenStep, halleyStep |
| **Numeric** | `interpolation.ts` | linearInterp, linearInterpTable, bilinearInterp, lagrangeInterp, lagrangeBasis, dividedDifferences, newtonInterp, newtonInterpFull, barycentricWeights, barycentricInterp, naturalCubicSplineCoeffs, clampedCubicSplineCoeffs, cubicSplineEval, cubicSplineDerivative, hermiteInterp, pchipInterp, akimaInterp, polyEval, polyDerivEval, polyFit, batchInterpolate |
| **Numeric** | `rational.ts` | gcd, lcm, reduce, add, subtract, multiply, divide, negate, abs, reciprocal, compare, equals, isZero, isPositive, isNegative, isInteger, toFloat, fromFloat, fromInteger, pow, isqrt, isPerfectSquare, simplifySqrt, modInverse, mod, sumArray, productArray, toContinuedFraction, fromContinuedFraction, mediant, bestApproximation |
| **Algebra** | `decomposition.ts` | luDecomposition, qrDecomposition, choleskyDecomposition, luSolve, luDeterminant |
| **Algebra** | `solver.ts` | lsolve, usolve, lsolveUnit, usolveUnit, lsolveAll, usolveAll, lowerTriangularRank, upperTriangularRank, solveTridiagonal, triangularInverse |
| **Algebra** | `polynomial.ts` | polyEval, polyEvalWithDerivative, quadraticRoots, cubicRoots, quarticRoots, polyRoots, polyDerivative, polyMultiply, polyDivide |
| **Algebra** | `equations.ts` | sylvester, lyap, dlyap, sylvesterResidual, lyapResidual, dlyapResidual |
| **Algebra** | `schur.ts` | schurDecomposition, francisQRStep, householderVector, applyHouseholder, hessenberg, schurResidual |
| **Algebra/Sparse** | `utilities.ts` | csFlip, csUnflip, csCumsum, csMarked, csMark |
| **Algebra/Sparse** | `operations.ts` | csGaxpy, csScatter, csSplice, csLeaf, csTdfs, csPost |
| **Algebra/Sparse** | `amd.ts` | amd, amdAggressive, rcm, inversePerm, permuteVector, permuteMatrix, symbolicCholeskyNnz, bandwidth, findPeripheralNode |
| **Matrix** | `sparse.ts` | csDfs, csReach, csEtree, csPost, csPermute, csSpsolve, csChol, csCholSymbolic, csLu, csQr, csQmult, csAmd, csRcm, csInvPerm, csTranspose, csMult, csMultNnzEstimate |
| **Probability** | `distributions.ts` | random, randomInt, uniform, normal, exponential, bernoulli, binomial, poisson, geometric, normalPDF, normalCDF, klDivergence, entropy |
| **Utils** | `checks.ts` | isNaN, isFinite, isInteger, isPositive, isNegative, isZero, isPrime, isEven, isOdd, gcd, lcm |
| **String** | `operations.ts` | isDigit, isLetter, toLowerCode, toUpperCode, parseFloatFromCodes, parseIntFromCodes |
| **Plain** | `operations.ts` | Comprehensive scalar operations mirror |
| **Unit** | `conversion.ts` | convert, convertArray, toSI, fromSI, getConversionFactor, getTemperatureOffset, isTemperatureUnit, getDimensions, areCompatible, multiplyDimensions, divideDimensions, powerDimensions, isDimensionless, getPrefixMultiplier, applyPrefix, removePrefix |

### Test Coverage
- **Pre-compile tests**: 150 tests (144 passing, 6 skipped)
- **All modules tested** via `test-wasm/unit-tests/wasm/pre-compile.test.ts`
- **WASM validation**: All modules pass AssemblyScript compilation check (`npm run test:wasm`)
- **Note**: 6 skipped tests use AS-specific types (i64/BigInt) that require full WASM build

---

## Difficulty Tiers

### Tier 1: TRIVIAL ✅ COMPLETE
Pure numeric functions with single input/output, no dependencies.

**Status**: Fully implemented in `src-wasm/`

---

### Tier 2: EASY ✅ COMPLETE

| File | Status | Notes |
|------|--------|-------|
| `mod.ts` | ✅ Done | In `arithmetic/advanced.ts` |
| `hypot.ts` | ✅ Done | In `arithmetic/advanced.ts` |
| `nthRoot.ts` | ✅ Done | In `arithmetic/advanced.ts` |
| `nthRoots.ts` | ✅ Done | In `arithmetic/advanced.ts` (nthRootsOfUnity, nthRootsReal, nthRootsComplex) |
| `invmod.ts` | ✅ Done | In `arithmetic/advanced.ts` |
| `xgcd.ts` | ✅ Done | In `arithmetic/advanced.ts` |

---

### Tier 3: MEDIUM ✅ COMPLETE

| File | Status | Location |
|------|--------|----------|
| `trace.ts` | ✅ Done | `matrix/basic.ts` |
| `transpose.ts` | ✅ Done | `matrix/basic.ts` |
| `identity.ts` | ✅ Done | `matrix/basic.ts` |
| `zeros.ts` | ✅ Done | `matrix/basic.ts` |
| `ones.ts` | ✅ Done | `matrix/basic.ts` |
| `diag.ts` | ✅ Done | `matrix/basic.ts` |
| `flatten.ts` | ✅ Done | `matrix/basic.ts` |
| `reshape.ts` | ✅ Done | `matrix/basic.ts` |
| `dot.ts` | ✅ Done | `matrix/linalg.ts` |
| `cross.ts` | ✅ Done | `matrix/linalg.ts` |
| `det.ts` | ✅ Done | `matrix/linalg.ts` |
| `inv.ts` | ✅ Done | `matrix/linalg.ts` |
| `kron.ts` | ✅ Done | `matrix/linalg.ts` |
| `norm.ts` | ✅ Done | `matrix/linalg.ts` |
| `variance.ts` | ✅ Done | `statistics/basic.ts` |
| `std.ts` | ✅ Done | `statistics/basic.ts` |
| `quantileSeq.ts` | ✅ Done | `statistics/basic.ts` |
| `ifft.ts` | ✅ Done | `signal/fft.ts` |

---

### Tier 4: HARD ✅ COMPLETE

| File | Status | Location |
|------|--------|----------|
| `lusolve.ts` | ✅ Done | `algebra/solver.ts` |
| `lsolveAll.ts` | ✅ Done | `algebra/solver.ts` (singular systems with free variables) |
| `usolveAll.ts` | ✅ Done | `algebra/solver.ts` (singular systems with free variables) |
| `polynomial.ts` | ✅ Done | `algebra/polynomial.ts` |
| `equations.ts` | ✅ Done | `algebra/equations.ts` |
| `schur.ts` | ✅ Done | `algebra/schur.ts` |
| `pinv.ts` | ✅ Done | `matrix/functions.ts` |
| `sqrtm.ts` | ✅ Done | `matrix/functions.ts` |
| `expm.ts` | ✅ Done | `matrix/functions.ts` |
| `dotMultiply.ts` | ✅ Done | `matrix/basic.ts` |
| `dotDivide.ts` | ✅ Done | `matrix/basic.ts` |
| `dotPow.ts` | ✅ Done | `matrix/basic.ts` |
| `intersect.ts` | ✅ Done | `geometry/operations.ts` |
| `partitionSelect.ts` | ✅ Done | `statistics/select.ts` |
| `rotate.ts` | ✅ Done | `matrix/rotation.ts` |
| `rotationMatrix.ts` | ✅ Done | `matrix/rotation.ts` |
| `broadcast.ts` | ✅ Done | `matrix/broadcast.ts` |

---

### Tier 5: VERY HARD ✅ COMPLETE (Sparse Algorithms)

| File | Status | Location | Notes |
|------|--------|----------|-------|
| `eigs.ts` | ✅ Done | `matrix/functions.ts` | Power iteration + symmetric QR |
| `csAmd.ts` | ✅ Done | `algebra/sparse/amd.ts`, `matrix/sparse.ts` | AMD ordering |
| `csRcm.ts` | ✅ Done | `algebra/sparse/amd.ts`, `matrix/sparse.ts` | RCM ordering |
| `csChol.ts` | ✅ Done | `matrix/sparse.ts` | Sparse Cholesky (csChol, csCholSymbolic) |
| `csLu.ts` | ✅ Done | `matrix/sparse.ts` | Sparse LU with partial pivoting |
| `csQr.ts` | ✅ Done | `matrix/sparse.ts` | Sparse QR via Householder (csQr, csQmult) |
| `csPermute.ts` | ✅ Done | `matrix/sparse.ts` | Sparse permutation (csPermute) |
| `csReach.ts` | ✅ Done | `matrix/sparse.ts` | Graph reachability (csReach) |
| `csSpsolve.ts` | ✅ Done | `matrix/sparse.ts` | Sparse triangular solve (csSpsolve) |
| `csDfs.ts` | ✅ Done | `matrix/sparse.ts` | Depth-first search (csDfs) |
| `csEtree.ts` | ✅ Done | `matrix/sparse.ts` | Elimination tree (csEtree, csPost) |
| `csTranspose.ts` | ✅ Done | `matrix/sparse.ts` | Sparse transpose |
| `csMult.ts` | ✅ Done | `matrix/sparse.ts` | Sparse matrix multiplication |

---

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Core arithmetic operations
- [x] Trigonometric functions
- [x] Bitwise and logical operations
- [x] Basic statistics
- [x] Set operations
- [x] Pre-compile test infrastructure

### Phase 2: Matrix Basics ✅ COMPLETE
- [x] `matrix/trace.ts` - Diagonal sum
- [x] `matrix/transpose.ts` - Transposition
- [x] `matrix/identity.ts` - Identity matrix
- [x] `matrix/zeros.ts` - Zero matrix
- [x] `matrix/ones.ts` - Ones matrix
- [x] `matrix/diag.ts` - Diagonal operations
- [x] `matrix/flatten.ts` - Flatten to 1D
- [x] `matrix/reshape.ts` - Reshape dimensions

### Phase 3: Linear Algebra Core ✅ COMPLETE
- [x] `matrix/det.ts` - Determinant
- [x] `matrix/inv.ts` - Matrix inverse
- [x] `matrix/dot.ts` - Dot product (vectors)
- [x] `matrix/cross.ts` - Cross product
- [x] `matrix/kron.ts` - Kronecker product
- [x] `arithmetic/norm.ts` - Vector/matrix norms
- [x] `signal/ifft.ts` - Inverse FFT

### Phase 4: Advanced Statistics ✅ COMPLETE
- [x] `statistics/variance.ts` - Variance calculation
- [x] `statistics/std.ts` - Standard deviation
- [x] `statistics/quantileSeq.ts` - Quantiles/percentiles
- [x] `statistics/select.ts` - QuickSelect, partition select

### Phase 5: Advanced Solvers ✅ COMPLETE
- [x] `algebra/polynomial.ts` - Polynomial operations
- [x] `algebra/equations.ts` - Matrix equation solvers
- [x] `algebra/schur.ts` - Schur decomposition

### Phase 6: Matrix Functions ✅ COMPLETE
- [x] `matrix/pinv.ts` - Moore-Penrose pseudoinverse
- [x] `matrix/sqrtm.ts` - Matrix square root
- [x] `matrix/expm.ts` - Matrix exponential
- [x] `matrix/eigs.ts` - Eigenvalues/eigenvectors
- [x] `matrix/rotation.ts` - Rotation matrices & quaternions
- [x] `matrix/broadcast.ts` - NumPy-style broadcasting

### Phase 7: Sparse Algorithms ✅ COMPLETE
- [x] Sparse utilities (csFlip, csCumsum, etc.)
- [x] AMD and RCM ordering
- [x] Basic sparse operations
- [x] Sparse Cholesky factorization (csChol, csCholSymbolic)
- [x] Sparse LU factorization (csLu with partial pivoting)
- [x] Sparse QR factorization (csQr, csQmult)
- [x] Graph algorithms (csDfs, csReach, csEtree, csPost)
- [x] Sparse permutation (csPermute, csInvPerm)
- [x] Sparse triangular solve (csSpsolve)
- [x] Sparse transpose and multiply (csTranspose, csMult)

### Phase 8: Numerical Alternatives ✅ COMPLETE
- [x] `numeric/calculus.ts` - Numerical differentiation/integration
- [x] `numeric/rootfinding.ts` - Root finding algorithms
- [x] `numeric/interpolation.ts` - Interpolation methods
- [x] `numeric/rational.ts` - Rational arithmetic (i64)
- [x] `unit/conversion.ts` - Numeric unit conversion

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
| Type | Reason | Alternative |
|------|--------|-------------|
| `Unit` | String parsing, conversion tables | `unit/conversion.ts` |
| `BigNumber` | Arbitrary precision arithmetic | None |
| `Fraction` | Rational number representation | `numeric/rational.ts` |
| `Complex` class | Object with methods | `complex/operations.ts` |
| `Matrix` class | Object-oriented interface | `matrix/*.ts` functions |
| `SparseMatrix` class | Complex data structure | `algebra/sparse/*.ts` |
| `Chain` | Fluent API pattern | None |

---

## Numerical Alternatives

For files that cannot be directly converted, numerical alternatives have been implemented:

| Original Functionality | Alternative Module | Key Functions |
|-----------------------|-------------------|---------------|
| Symbolic derivative | `numeric/calculus.ts` | centralDifference, fivePointStencil, richardsonExtrapolation |
| Symbolic integration | `numeric/calculus.ts` | simpsonsRule, gaussLegendre, romberg |
| Symbolic equation solving | `numeric/rootfinding.ts` | newtonStep, bisectionStep, brentStep, halleyStep |
| Fraction class | `numeric/rational.ts` | add, multiply, divide, gcd, fromFloat, toContinuedFraction |
| Unit class | `unit/conversion.ts` | convert, convertArray, getDimensions, areCompatible |
| Expression interpolation | `numeric/interpolation.ts` | cubicSplineEval, lagrangeInterp, pchipInterp |

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
| arithmetic/ | 39 | 35 | 35 | 0 ✅ |
| trigonometry/ | 24 | 24 | 24 | 0 ✅ |
| bitwise/ | 7 | 7 | 7 | 0 ✅ |
| logical/ | 5 | 5 | 5 | 0 ✅ |
| relational/ | 11 | 11 | 11 | 0 ✅ |
| matrix/ | 42 | 30 | 30 | 0 ✅ |
| statistics/ | 15 | 12 | 12 | 0 ✅ |
| algebra/ | 25 | 15 | 15 | 0 ✅ |
| algebra/sparse/ | 15 | 15 | 15 | 0 ✅ |
| combinatorics/ | 5 | 5 | 5 | 0 ✅ |
| probability/ | 13 | 10 | 10 | 0 ✅ |
| special/ | 2 | 2 | 2 | 0 ✅ |
| signal/ | 3 | 3 | 3 | 0 ✅ |
| geometry/ | 2 | 2 | 2 | 0 ✅ |
| set/ | 10 | 10 | 10 | 0 ✅ |
| string/ | 5 | 3 | 3 | 0 ✅ |
| numeric/ | 5 | 5 | 5 | 0 ✅ |
| complex/ | 3 | 2 | 2 | 0 ✅ |
| utils/ | 13 | 10 | 10 | 0 ✅ |
| unit/ | 3 | 1 | 1 | 0 ✅ |
| **Total** | ~242 | ~200+ | ~200+ | **0** ✅ |

---

## Completion Summary

**All AssemblyScript conversion tasks have been completed (December 2025).**

### Final Implementation Stats

| Metric | Value |
|--------|-------|
| Total AS modules | 43 files |
| Total functions | 200+ |
| Pre-compile tests | 150 (144 passing, 6 skipped) |
| WASM compilation tests | 36 passing |
| Lines of AS code | ~15,000+ |

### Key Accomplishments

1. **Core Mathematics** - All arithmetic, trigonometry, logical, bitwise, and relational operations
2. **Linear Algebra** - Matrix operations, decompositions (LU, QR, Cholesky, Schur), eigenvalues, solvers
3. **Sparse Matrices** - Complete sparse algorithm suite (AMD, RCM, Cholesky, LU, QR, graph algorithms)
4. **Statistics** - Descriptive stats, selection algorithms, probability distributions
5. **Signal Processing** - FFT/IFFT, 2D FFT, spectral analysis, correlation
6. **Numerical Methods** - ODE solvers, root finding, interpolation, calculus, rational arithmetic
7. **Geometry** - 2D/3D operations, intersections, transformations, rotations, quaternions
8. **Numerical Alternatives** - Replacements for non-convertible symbolic code

### Performance Expectations

| Operation | Expected Speedup | Use Case |
|-----------|------------------|----------|
| Large matrix multiply | 5-25x | Matrices > 100×100 |
| FFT | 3-10x | Signal processing |
| Eigenvalues | 2-8x | Large symmetric matrices |
| Statistical operations | 2-5x | Large datasets |
| Sparse decompositions | 3-15x | Sparse matrices > 1000 elements |

### Next Steps (Optional Enhancements)

- [ ] Performance benchmarking vs JavaScript
- [ ] SIMD optimizations for supported operations
- [ ] Multi-threaded parallel execution integration
- [ ] Browser bundle with WASM auto-detection

---

## References

- [AssemblyScript Documentation](https://www.assemblyscript.org/introduction.html)
- [AssemblyScript Types](https://www.assemblyscript.org/types.html)
- [Math.js Documentation](https://mathjs.org/docs/)
- [WASM Performance Guidelines](https://webassembly.org/docs/use-cases/)
