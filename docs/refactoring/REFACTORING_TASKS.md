# TypeScript + WASM Refactoring Tasks

## Document Purpose

This document tracks the TypeScript + WASM refactoring progress. **All JavaScript files have been converted to TypeScript.** The original JS files are retained for benchmarking purposes.

Current focus areas:
- Type quality improvements (reducing `any` usage)
- WASM integration verification
- Performance benchmarking

---

## Table of Contents

1. [Task Summary](#task-summary)
2. [Phase 2: High-Performance Functions](#phase-2-high-performance-functions)
3. [Phase 3: Type System Completion](#phase-3-type-system-completion)
4. [Phase 4: Utility Completion](#phase-4-utility-completion)
5. [Phase 5: Relational & Logical Operations](#phase-5-relational--logical-operations)
6. [Phase 6: Specialized Functions](#phase-6-specialized-functions)
7. [Phase 7: Plain Number Implementations](#phase-7-plain-number-implementations)
8. [Phase 8: Expression System](#phase-8-expression-system)
9. [Phase 9: Entry Points & Integration](#phase-9-entry-points--integration)
10. [Phase 10: Finalization](#phase-10-finalization)

---

## Task Summary

### Overall Progress

| Category | TS Files | Status | Notes |
|----------|----------|--------|-------|
| **Functions** | 254 | ✅ Complete | All function categories converted |
| **Expression** | 313 | ✅ Complete | Parser, nodes, transforms converted |
| **Types** | 49 | ✅ Complete | Complex, Fraction, BigNumber, Unit, Matrix |
| **Utils** | 32 | ✅ Complete | All utilities converted |
| **Plain** | 12 | ✅ Complete | Plain number implementations |
| **Entry** | 589 | ✅ Complete | Entry points and embedded docs |
| **Core** | 5 | ✅ Complete | Core system files |
| **Error** | 3 | ✅ Complete | Error classes |
| **JSON** | 2 | ✅ Complete | JSON utilities |
| **WASM** | 55 | ✅ Complete | 21 module directories |
| **TOTAL** | **1331** | ✅ **100%** | TypeScript errors: 0 |

### WASM Implementation Status

| Category | Module | Status | Tests |
|----------|--------|--------|-------|
| **Arithmetic** | basic, logarithmic, advanced | ✅ Complete | ✅ |
| **Algebra** | decomposition, sparse, solver | ✅ Complete | ✅ |
| **Matrix** | multiply, linalg, basic, rotation | ✅ Complete | ✅ |
| **Trigonometry** | basic | ✅ Complete | ✅ |
| **Statistics** | basic, select | ✅ Complete | ✅ |
| **Combinatorics** | basic | ✅ Complete | ✅ |
| **Probability** | distributions | ✅ Complete | ✅ |
| **Signal** | fft, processing | ✅ Complete | ✅ |
| **Numeric** | calculus, interpolation, ode, rootfinding | ✅ Complete | ✅ |

### Legend

**Complexity**:
- 🟢 **Low**: Simple conversion, minimal types
- 🟡 **Medium**: Moderate types, some complexity
- 🔴 **High**: Complex types, algorithms, dependencies

**WASM Priority**:
- 🔥 **Very High**: Must have WASM
- ⚡ **High**: Should have WASM
- 💡 **Medium**: Could have WASM
- 🌙 **Low**: Optional WASM
- ⛔ **None**: No WASM

### Legend

**Complexity**:
- 🟢 **Low**: Simple conversion, minimal types
- 🟡 **Medium**: Moderate types, some complexity
- 🔴 **High**: Complex types, algorithms, dependencies

**WASM Priority**:
- 🔥 **Very High**: Must have WASM
- ⚡ **High**: Should have WASM
- 💡 **Medium**: Could have WASM
- 🌙 **Low**: Optional WASM
- ⛔ **None**: No WASM

**Effort** (in hours):
- Small: 1-2 hours
- Medium: 2-4 hours
- Large: 4-8 hours
- XLarge: 8+ hours

---

## Phase 2: High-Performance Functions

**Total**: 170 files
**Duration**: 6-8 weeks
**WASM Priority**: High

### Batch 2.1: Remaining Arithmetic (33 files)

**Duration**: 2 weeks
**WASM Priority**: ⚡ High

#### 2.1.1: Basic Arithmetic (13 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `arithmetic/unaryMinus.js` | 🟢 Low | ⚡ High | Small | typed |
| 2 | `arithmetic/unaryPlus.js` | 🟢 Low | ⚡ High | Small | typed |
| 3 | `arithmetic/cbrt.js` | 🟢 Low | ⚡ High | Small | Complex |
| 4 | `arithmetic/cube.js` | 🟢 Low | ⚡ High | Small | multiply |
| 5 | `arithmetic/square.js` | 🟢 Low | ⚡ High | Small | multiply |
| 6 | `arithmetic/fix.js` | 🟢 Low | ⚡ High | Small | ceil, floor |
| 7 | `arithmetic/ceil.js` | 🟢 Low | ⚡ High | Small | round |
| 8 | `arithmetic/floor.js` | 🟢 Low | ⚡ High | Small | round |
| 9 | `arithmetic/round.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 10 | `arithmetic/addScalar.js` | 🟢 Low | ⚡ High | Small | typed |
| 11 | `arithmetic/subtractScalar.js` | 🟢 Low | ⚡ High | Small | typed |
| 12 | `arithmetic/multiplyScalar.js` | 🟢 Low | ⚡ High | Small | typed |
| 13 | `arithmetic/divideScalar.js` | 🟢 Low | ⚡ High | Small | typed |

**WASM Opportunity**: Create `src/wasm/arithmetic/basic.ts` with all basic operations

#### 2.1.2: Logarithmic & Exponential (8 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 14 | `arithmetic/exp.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 15 | `arithmetic/expm1.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 16 | `arithmetic/log.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 17 | `arithmetic/log10.js` | 🟡 Medium | ⚡ High | Medium | log |
| 18 | `arithmetic/log2.js` | 🟡 Medium | ⚡ High | Medium | log |
| 19 | `arithmetic/log1p.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 20 | `arithmetic/nthRoot.js` | 🟡 Medium | ⚡ High | Medium | pow |
| 21 | `arithmetic/nthRoots.js` | 🔴 High | ⚡ High | Large | Complex, nthRoot |

**WASM Opportunity**: `src/wasm/arithmetic/logarithmic.ts`

#### 2.1.3: Advanced Arithmetic (6 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 22 | `arithmetic/gcd.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 23 | `arithmetic/lcm.js` | 🟡 Medium | ⚡ High | Medium | gcd |
| 24 | `arithmetic/xgcd.js` | 🔴 High | ⚡ High | Large | BigNumber |
| 25 | `arithmetic/invmod.js` | 🟡 Medium | ⚡ High | Medium | xgcd |
| 26 | `arithmetic/hypot.js` | 🟡 Medium | ⚡ High | Medium | abs, sqrt |
| 27 | `arithmetic/norm.js` | 🟡 Medium | ⚡ High | Medium | abs, sqrt |

**WASM Opportunity**: `src/wasm/arithmetic/advanced.ts`

#### 2.1.4: Dot Operations (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 28 | `arithmetic/dotMultiply.js` | 🟡 Medium | ⚡ High | Medium | multiply, Matrix |
| 29 | `arithmetic/dotDivide.js` | 🟡 Medium | ⚡ High | Medium | divide, Matrix |
| 30 | `arithmetic/dotPow.js` | 🟡 Medium | ⚡ High | Medium | pow, Matrix |

#### 2.1.5: Arithmetic Utilities (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 31 | `arithmetic/divide.js` (*) | 🟢 Low | ⛔ None | Small | Already converted |
| 32 | `arithmetic/mod.js` (*) | 🟢 Low | ⛔ None | Small | Already converted |
| 33 | `arithmetic/pow.js` (*) | 🟢 Low | ⛔ None | Small | Already converted |

**Note**: Items marked (*) are already converted

### Batch 2.2: Remaining Trigonometry (19 files)

**Duration**: 1 week
**WASM Priority**: ⚡ High

#### 2.2.1: Hyperbolic Functions (6 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `trigonometry/sinh.js` | 🟡 Medium | ⚡ High | Medium | exp, Complex |
| 2 | `trigonometry/cosh.js` | 🟡 Medium | ⚡ High | Medium | exp, Complex |
| 3 | `trigonometry/tanh.js` | 🟡 Medium | ⚡ High | Medium | sinh, cosh |
| 4 | `trigonometry/asinh.js` | 🟡 Medium | ⚡ High | Medium | log, sqrt |
| 5 | `trigonometry/acosh.js` | 🟡 Medium | ⚡ High | Medium | log, sqrt |
| 6 | `trigonometry/atanh.js` | 🟡 Medium | ⚡ High | Medium | log |

**WASM Opportunity**: `src/wasm/trigonometry/hyperbolic.ts`

#### 2.2.2: Reciprocal Functions (6 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 7 | `trigonometry/sec.js` | 🟢 Low | ⚡ High | Small | cos |
| 8 | `trigonometry/csc.js` | 🟢 Low | ⚡ High | Small | sin |
| 9 | `trigonometry/cot.js` | 🟢 Low | ⚡ High | Small | tan |
| 10 | `trigonometry/asec.js` | 🟡 Medium | ⚡ High | Medium | acos |
| 11 | `trigonometry/acsc.js` | 🟡 Medium | ⚡ High | Medium | asin |
| 12 | `trigonometry/acot.js` | 🟡 Medium | ⚡ High | Medium | atan |

#### 2.2.3: Hyperbolic Reciprocal (6 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 13 | `trigonometry/sech.js` | 🟢 Low | ⚡ High | Small | cosh |
| 14 | `trigonometry/csch.js` | 🟢 Low | ⚡ High | Small | sinh |
| 15 | `trigonometry/coth.js` | 🟢 Low | ⚡ High | Small | tanh |
| 16 | `trigonometry/asech.js` | 🟡 Medium | ⚡ High | Medium | acosh |
| 17 | `trigonometry/acsch.js` | 🟡 Medium | ⚡ High | Medium | asinh |
| 18 | `trigonometry/acoth.js` | 🟡 Medium | ⚡ High | Medium | atanh |

#### 2.2.4: Trigonometry Utilities (1 file)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 19 | `trigonometry/trigUnit.js` | 🟢 Low | 🌙 Low | Small | config |

**WASM Opportunity**: `src/wasm/trigonometry/complete.ts` (all trig functions)

### Batch 2.3: Remaining Algebra (33 files)

**Duration**: 3 weeks
**WASM Priority**: ⚡ High (sparse algorithms)

#### 2.3.1: Sparse Matrix Algorithms - Part 1 (12 files)

**Week 1 of Batch 2.3**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `algebra/sparse/csFlip.js` | 🟢 Low | 🔥 Very High | Small | None |
| 2 | `algebra/sparse/csUnflip.js` | 🟢 Low | 🔥 Very High | Small | None |
| 3 | `algebra/sparse/csMarked.js` | 🟢 Low | 🔥 Very High | Small | None |
| 4 | `algebra/sparse/csMark.js` | 🟢 Low | 🔥 Very High | Small | None |
| 5 | `algebra/sparse/csCumsum.js` | 🟢 Low | 🔥 Very High | Small | None |
| 6 | `algebra/sparse/csIpvec.js` | 🟡 Medium | 🔥 Very High | Medium | SparseMatrix |
| 7 | `algebra/sparse/csPermute.js` | 🟡 Medium | 🔥 Very High | Medium | SparseMatrix |
| 8 | `algebra/sparse/csSymperm.js` | 🟡 Medium | 🔥 Very High | Medium | csPermute |
| 9 | `algebra/sparse/csFkeep.js` | 🟡 Medium | 🔥 Very High | Medium | SparseMatrix |
| 10 | `algebra/sparse/csLeaf.js` | 🟡 Medium | 🔥 Very High | Medium | csMarked |
| 11 | `algebra/sparse/csEtree.js` | 🟡 Medium | 🔥 Very High | Medium | csLeaf |
| 12 | `algebra/sparse/csCounts.js` | 🔴 High | 🔥 Very High | Large | csEtree, csPost |

**WASM Opportunity**: `src/wasm/algebra/sparse/utilities.ts`

#### 2.3.2: Sparse Matrix Algorithms - Part 2 (12 files)

**Week 2 of Batch 2.3**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 13 | `algebra/sparse/csPost.js` | 🟡 Medium | 🔥 Very High | Medium | csTdfs |
| 14 | `algebra/sparse/csTdfs.js` | 🟡 Medium | 🔥 Very High | Medium | csMarked |
| 15 | `algebra/sparse/csDfs.js` | 🟡 Medium | 🔥 Very High | Medium | csMarked |
| 16 | `algebra/sparse/csReach.js` | 🟡 Medium | 🔥 Very High | Medium | csDfs |
| 17 | `algebra/sparse/csEreach.js` | 🟡 Medium | 🔥 Very High | Medium | csMark |
| 18 | `algebra/sparse/csSpsolve.js` | 🔴 High | 🔥 Very High | Large | csReach |
| 19 | `algebra/sparse/csAmd.js` | 🔴 High | 🔥 Very High | Large | csCumsum |
| 20 | `algebra/sparse/csSqr.js` | 🔴 High | 🔥 Very High | XLarge | csCounts, csPost |
| 21 | `algebra/sparse/csChol.js` | 🔴 High | 🔥 Very High | XLarge | csSqr, csIpvec |
| 22 | `algebra/sparse/csLu.js` | 🔴 High | 🔥 Very High | XLarge | csSqr, csSpsolve |
| 23 | `algebra/sparse/lup.js` (*) | 🔴 High | ⛔ None | XLarge | Already converted |
| 24 | `algebra/sparse/slu.js` (*) | 🔴 High | ⛔ None | XLarge | Already converted |

**WASM Opportunity**: `src/wasm/algebra/sparse/algorithms.ts`

#### 2.3.3: Algebra Functions (9 files)

**Week 3 of Batch 2.3**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 25 | `algebra/derivative.js` | 🔴 High | 🌙 Low | XLarge | Expression |
| 26 | `algebra/simplify.js` | 🔴 High | 🌙 Low | XLarge | Expression |
| 27 | `algebra/simplifyCore.js` | 🔴 High | 🌙 Low | XLarge | Expression |
| 28 | `algebra/simplifyConstant.js` | 🟡 Medium | 🌙 Low | Medium | Expression |
| 29 | `algebra/rationalize.js` | 🔴 High | 🌙 Low | Large | Expression |
| 30 | `algebra/resolve.js` | 🟡 Medium | 🌙 Low | Medium | Expression |
| 31 | `algebra/symbolicEqual.js` | 🟡 Medium | 🌙 Low | Medium | simplify |
| 32 | `algebra/leafCount.js` | 🟡 Medium | 🌙 Low | Medium | Expression |
| 33 | `algebra/polynomialRoot.js` | 🔴 High | ⚡ High | Large | Complex |

#### 2.3.4: Additional Algebra (5 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 34 | `algebra/lyap.js` | 🔴 High | ⚡ High | XLarge | Matrix, solve |
| 35 | `algebra/sylvester.js` | 🔴 High | ⚡ High | XLarge | Matrix, solve |
| 36 | `algebra/solver/lsolveAll.js` | 🟡 Medium | 🌙 Low | Medium | lsolve |
| 37 | `algebra/solver/usolveAll.js` | 🟡 Medium | 🌙 Low | Medium | usolve |
| 38 | `algebra/solver/utils/solveValidation.js` | 🟢 Low | ⛔ None | Small | validation |

#### 2.3.5: Algebra Utilities (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 39 | `algebra/simplify/util.js` | 🟡 Medium | ⛔ None | Medium | Expression |
| 40 | `algebra/simplify/wildcards.js` | 🟡 Medium | ⛔ None | Medium | Expression |

### Batch 2.4: Remaining Matrix Operations (32 files)

**Duration**: 2 weeks
**WASM Priority**: 💡 Medium

#### 2.4.1: Matrix Algorithm Suite (14 files)

**Week 1 of Batch 2.4**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `matrix/count.js` | 🟢 Low | 🌙 Low | Small | Matrix |
| 2 | `matrix/concat.js` | 🟡 Medium | 💡 Medium | Medium | Matrix |
| 3 | `matrix/cross.js` | 🟡 Medium | ⚡ High | Medium | Matrix, multiply |
| 4 | `matrix/squeeze.js` | 🟢 Low | 🌙 Low | Small | Matrix |
| 5 | `matrix/flatten.js` | 🟢 Low | 🌙 Low | Small | Matrix |
| 6 | `matrix/forEach.js` | 🟡 Medium | ⛔ None | Medium | Matrix |
| 7 | `matrix/map.js` | 🟡 Medium | ⛔ None | Medium | Matrix |
| 8 | `matrix/filter.js` | 🟡 Medium | ⛔ None | Medium | Matrix |
| 9 | `matrix/mapSlices.js` | 🔴 High | ⛔ None | Large | Matrix |
| 10 | `matrix/sort.js` | 🟡 Medium | 💡 Medium | Medium | Matrix, compare |
| 11 | `matrix/partitionSelect.js` | 🔴 High | ⚡ High | Large | Matrix, compare |
| 12 | `matrix/ctranspose.js` | 🟡 Medium | ⚡ High | Medium | transpose, conj |
| 13 | `matrix/kron.js` | 🟡 Medium | ⚡ High | Medium | Matrix, multiply |
| 14 | `matrix/column.js` | 🟡 Medium | 🌙 Low | Medium | Matrix, subset |

#### 2.4.2: Matrix Creation & Manipulation (11 files)

**Week 2 of Batch 2.4**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 15 | `matrix/row.js` | 🟡 Medium | 🌙 Low | Medium | Matrix, subset |
| 16 | `matrix/resize.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 17 | `matrix/subset.js` | 🟡 Medium | 🌙 Low | Medium | Matrix, Index |
| 18 | `matrix/range.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 19 | `matrix/matrixFromRows.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 20 | `matrix/matrixFromColumns.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 21 | `matrix/matrixFromFunction.js` | 🟡 Medium | ⛔ None | Medium | Matrix |
| 22 | `matrix/getMatrixDataType.js` | 🟢 Low | ⛔ None | Small | Matrix |
| 23 | `matrix/diff.js` | 🟡 Medium | 💡 Medium | Medium | Matrix, subtract |
| 24 | `matrix/rotate.js` | 🟡 Medium | 💡 Medium | Medium | Matrix |
| 25 | `matrix/rotationMatrix.js` | 🟡 Medium | ⚡ High | Medium | Matrix, trig |

#### 2.4.3: Advanced Matrix Operations (7 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 26 | `matrix/expm.js` | 🔴 High | ⚡ High | XLarge | Matrix, decomp |
| 27 | `matrix/sqrtm.js` | 🔴 High | ⚡ High | XLarge | Matrix, eigs |
| 28 | `matrix/pinv.js` | 🔴 High | ⚡ High | Large | Matrix, lup, qr |
| 29 | `matrix/eigs.js` | 🔴 High | ⚡ High | XLarge | Matrix |
| 30 | `matrix/eigs/complexEigs.js` | 🔴 High | ⚡ High | XLarge | Matrix, Complex |
| 31 | `matrix/eigs/realSymmetric.js` | 🔴 High | ⚡ High | XLarge | Matrix |
| 32 | `algebra/decomposition/schur.js` | 🔴 High | ⚡ High | XLarge | Matrix |

### Batch 2.5: Remaining Statistics (8 files)

**Duration**: 1 week
**WASM Priority**: 💡 Medium

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `statistics/mode.js` | 🟡 Medium | 💡 Medium | Medium | compare, count |
| 2 | `statistics/quantileSeq.js` | 🔴 High | ⚡ High | Large | partitionSelect |
| 3 | `statistics/mad.js` | 🟡 Medium | 💡 Medium | Medium | median, abs |
| 4 | `statistics/prod.js` | 🟡 Medium | ⚡ High | Medium | multiply, reduce |
| 5 | `statistics/cumsum.js` | 🟡 Medium | ⚡ High | Medium | add |
| 6 | `statistics/sum.js` | 🟡 Medium | ⚡ High | Medium | add, reduce |
| 7 | `statistics/corr.js` | 🔴 High | ⚡ High | Large | mean, std, multiply |
| 8 | `statistics/utils/improveErrorMessage.js` | 🟢 Low | ⛔ None | Small | error handling |

**WASM Opportunity**: `src/wasm/statistics/aggregations.ts`

### Batch 2.6: Probability & Combinatorics (18 files)

**Duration**: 1 week
**WASM Priority**: ⚡ High (combinatorics)

#### 2.6.1: Combinatorics (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `combinatorics/bellNumbers.js` | 🟡 Medium | 🔥 Very High | Medium | stirlingS2 |
| 2 | `combinatorics/catalan.js` | 🟡 Medium | 🔥 Very High | Medium | factorial |
| 3 | `combinatorics/stirlingS2.js` | 🟡 Medium | 🔥 Very High | Medium | combinations |
| 4 | `combinatorics/composition.js` | 🟡 Medium | 🔥 Very High | Medium | combinations |

**WASM Opportunity**: `src/wasm/combinatorics/functions.ts`

#### 2.6.2: Probability Distributions (10 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `probability/factorial.js` | 🟡 Medium | 🔥 Very High | Medium | gamma |
| 6 | `probability/gamma.js` | 🔴 High | 🔥 Very High | Large | exp, log |
| 7 | `probability/lgamma.js` | 🔴 High | 🔥 Very High | Large | gamma |
| 8 | `probability/combinations.js` | 🟡 Medium | 🔥 Very High | Medium | factorial |
| 9 | `probability/combinationsWithRep.js` | 🟡 Medium | 🔥 Very High | Medium | combinations |
| 10 | `probability/permutations.js` | 🟡 Medium | 🔥 Very High | Medium | factorial |
| 11 | `probability/multinomial.js` | 🟡 Medium | 💡 Medium | Medium | factorial |
| 12 | `probability/bernoulli.js` | 🟡 Medium | 💡 Medium | Medium | random |
| 13 | `probability/kldivergence.js` | 🟡 Medium | 💡 Medium | Medium | log, sum |
| 14 | `probability/pickRandom.js` | 🟡 Medium | 🌙 Low | Medium | random |

#### 2.6.3: Random Number Generation (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 15 | `probability/random.js` | 🟡 Medium | 💡 Medium | Medium | typed |
| 16 | `probability/randomInt.js` | 🟡 Medium | 💡 Medium | Medium | random |
| 17 | `probability/util/randomMatrix.js` | 🟡 Medium | 💡 Medium | Medium | Matrix, random |
| 18 | `probability/util/seededRNG.js` | 🔴 High | 💡 Medium | Large | seedrandom lib |

---

## Phase 3: Type System Completion

**Total**: 43 files
**Duration**: 2-3 weeks
**WASM Priority**: 🌙 Low (mostly JavaScript types)

### Batch 3.1: Core Types (11 files)

**Duration**: 1 week
**WASM Priority**: ⛔ None

#### 3.1.1: Complex Number (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `type/complex/Complex.js` | 🔴 High | ⛔ None | XLarge | None |
| 2 | `type/complex/function/complex.js` | 🟡 Medium | ⛔ None | Medium | Complex |

#### 3.1.2: Fraction (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 3 | `type/fraction/Fraction.js` | 🔴 High | ⛔ None | XLarge | fraction.js lib |
| 4 | `type/fraction/function/fraction.js` | 🟡 Medium | ⛔ None | Medium | Fraction |

#### 3.1.3: BigNumber (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `type/bignumber/BigNumber.js` | 🔴 High | ⛔ None | XLarge | decimal.js lib |
| 6 | `type/bignumber/function/bignumber.js` | 🟡 Medium | ⛔ None | Medium | BigNumber |

#### 3.1.4: Unit (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 7 | `type/unit/Unit.js` | 🔴 High | ⛔ None | XLarge | None |
| 8 | `type/unit/function/unit.js` | 🟡 Medium | ⛔ None | Medium | Unit |
| 9 | `type/unit/function/createUnit.js` | 🟡 Medium | ⛔ None | Medium | Unit |
| 10 | `type/unit/function/splitUnit.js` | 🟡 Medium | ⛔ None | Medium | Unit |
| 11 | `type/unit/physicalConstants.js` | 🟢 Low | ⛔ None | Small | Unit |

### Batch 3.2: Matrix Infrastructure (10 files)

**Duration**: 1 week
**WASM Priority**: 💡 Medium (some utilities)

#### 3.2.1: Matrix Base Classes (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `type/matrix/Matrix.js` | 🔴 High | ⛔ None | XLarge | None |
| 2 | `type/matrix/ImmutableDenseMatrix.js` | 🔴 High | ⛔ None | Large | DenseMatrix |
| 3 | `type/matrix/Range.js` | 🟡 Medium | ⛔ None | Medium | None |
| 4 | `type/matrix/MatrixIndex.js` | 🟡 Medium | ⛔ None | Medium | Range |

#### 3.2.2: Matrix Utilities (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `type/matrix/Spa.js` | 🟡 Medium | 💡 Medium | Medium | None |
| 6 | `type/matrix/FibonacciHeap.js` | 🔴 High | 💡 Medium | Large | None |
| 7 | `type/matrix/function/matrix.js` | 🟡 Medium | ⛔ None | Medium | Matrix |
| 8 | `type/matrix/function/sparse.js` | 🟡 Medium | ⛔ None | Medium | SparseMatrix |

#### 3.2.3: Matrix Functions (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 9 | `type/matrix/function/index.js` | 🟡 Medium | ⛔ None | Medium | Matrix, Range |
| 10 | `type/matrix/utils/broadcast.js` | 🟡 Medium | ⛔ None | Medium | Matrix |

### Batch 3.3: Matrix Algorithm Suite (15 files)

**Duration**: 1 week
**WASM Priority**: ⚡ High

All files in `type/matrix/utils/matAlgo*.js`:

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `matAlgo01xDSid.js` | 🟡 Medium | ⚡ High | Medium | DenseMatrix, SparseMatrix |
| 2 | `matAlgo02xDS0.js` | 🟡 Medium | ⚡ High | Medium | DenseMatrix, SparseMatrix |
| 3 | `matAlgo03xDSf.js` | 🟡 Medium | ⚡ High | Medium | DenseMatrix, SparseMatrix |
| 4 | `matAlgo04xSidSid.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 5 | `matAlgo05xSfSf.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 6 | `matAlgo06xS0S0.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 7 | `matAlgo07xSSf.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 8 | `matAlgo08xS0Sid.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 9 | `matAlgo09xS0Sf.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 10 | `matAlgo10xSids.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 11 | `matAlgo11xS0s.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 12 | `matAlgo12xSfs.js` | 🟡 Medium | ⚡ High | Medium | SparseMatrix |
| 13 | `matAlgo13xDD.js` | 🟡 Medium | ⚡ High | Medium | DenseMatrix |
| 14 | `matAlgo14xDs.js` | 🟡 Medium | ⚡ High | Medium | DenseMatrix |
| 15 | `matrixAlgorithmSuite.js` | 🔴 High | ⛔ None | Large | All matAlgo files |

**WASM Opportunity**: `src/wasm/matrix/algorithms.ts`

### Batch 3.4: Primitive & Other Types (7 files)

**Duration**: 2 days
**WASM Priority**: ⛔ None

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `type/number.js` | 🟢 Low | ⛔ None | Small | None |
| 2 | `type/string.js` | 🟢 Low | ⛔ None | Small | None |
| 3 | `type/boolean.js` | 🟢 Low | ⛔ None | Small | None |
| 4 | `type/bigint.js` | 🟢 Low | ⛔ None | Small | None |
| 5 | `type/chain/Chain.js` | 🔴 High | ⛔ None | Large | All functions |
| 6 | `type/chain/function/chain.js` | 🟡 Medium | ⛔ None | Medium | Chain |
| 7 | `type/resultset/ResultSet.js` | 🟡 Medium | ⛔ None | Medium | None |

---

## Phase 4: Utility Completion

**Total**: 22 files
**Duration**: 1-2 weeks
**WASM Priority**: 🌙 Low

### Batch 4.1: Core Utilities (13 files)

**Duration**: 1 week
**WASM Priority**: 🌙 Low

#### 4.1.1: String Utilities (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `utils/string.js` | 🟡 Medium | ⛔ None | Medium | None |
| 2 | `utils/latex.js` | 🔴 High | ⛔ None | Large | string |
| 3 | `utils/tex.js` | 🟡 Medium | ⛔ None | Medium | latex |
| 4 | `utils/digits.js` | 🟡 Medium | ⛔ None | Medium | None |

#### 4.1.2: Comparison Utilities (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `utils/compare.js` | 🟡 Medium | 🌙 Low | Medium | is |
| 6 | `utils/compareNatural.js` | 🟡 Medium | 🌙 Low | Medium | compare |
| 7 | `utils/compareText.js` | 🟡 Medium | 🌙 Low | Medium | compare |

#### 4.1.3: Numeric Utilities (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 8 | `utils/numeric.js` | 🟡 Medium | 💡 Medium | Medium | bignumber |
| 9 | `utils/bignumber/constants.js` | 🟢 Low | ⛔ None | Small | None |
| 10 | `utils/bignumber/formatter.js` | 🟡 Medium | ⛔ None | Medium | number |

#### 4.1.4: Other Utilities (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 11 | `utils/customs.js` | 🟡 Medium | ⛔ None | Medium | factory |
| 12 | `utils/emitter.js` | 🟡 Medium | ⛔ None | Medium | tiny-emitter |
| 13 | `utils/snapshot.js` | 🟡 Medium | ⛔ None | Medium | object |

### Batch 4.2: Advanced Utilities (9 files)

**Duration**: 3 days
**WASM Priority**: ⛔ None

#### 4.2.1: Collection Utilities (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `utils/map.js` | 🟡 Medium | ⛔ None | Medium | None |
| 2 | `utils/PartitionedMap.js` | 🟡 Medium | ⛔ None | Medium | map |
| 3 | `utils/set.js` | 🟡 Medium | ⛔ None | Medium | None |
| 4 | `utils/collection.js` | 🟡 Medium | ⛔ None | Medium | is |

#### 4.2.2: Scope & Context (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `utils/scope.js` | 🟡 Medium | ⛔ None | Medium | map |
| 6 | `utils/scopeUtils.js` | 🟡 Medium | ⛔ None | Medium | scope |
| 7 | `utils/optimizeCallback.js` | 🟡 Medium | ⛔ None | Medium | None |

#### 4.2.3: Other Advanced Utilities (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 8 | `utils/DimensionError.js` | 🟢 Low | ⛔ None | Small | error |
| 9 | `utils/log.js` | 🟢 Low | ⛔ None | Small | None |

---

## Phase 5: Relational & Logical Operations

**Total**: 36 files
**Duration**: 2 weeks
**WASM Priority**: 💡 Medium (bitwise)

### Batch 5.1: Relational Operations (13 files)

**Duration**: 1 week
**WASM Priority**: 🌙 Low

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `relational/equal.js` | 🟡 Medium | 🌙 Low | Medium | equalScalar |
| 2 | `relational/equalScalar.js` | 🟡 Medium | 💡 Medium | Medium | typed |
| 3 | `relational/unequal.js` | 🟡 Medium | 🌙 Low | Medium | equal |
| 4 | `relational/larger.js` | 🟡 Medium | 🌙 Low | Medium | config |
| 5 | `relational/largerEq.js` | 🟡 Medium | 🌙 Low | Medium | larger, equal |
| 6 | `relational/smaller.js` | 🟡 Medium | 🌙 Low | Medium | config |
| 7 | `relational/smallerEq.js` | 🟡 Medium | 🌙 Low | Medium | smaller, equal |
| 8 | `relational/compare.js` | 🟡 Medium | 🌙 Low | Medium | typed |
| 9 | `relational/compareNatural.js` | 🟡 Medium | ⛔ None | Medium | compare |
| 10 | `relational/compareText.js` | 🟡 Medium | ⛔ None | Medium | compare |
| 11 | `relational/compareUnits.js` | 🟡 Medium | ⛔ None | Medium | Unit |
| 12 | `relational/deepEqual.js` | 🔴 High | ⛔ None | Large | equal |
| 13 | `relational/equalText.js` | 🟡 Medium | ⛔ None | Medium | compareText |

### Batch 5.2: Logical & Bitwise (13 files)

**Duration**: 1 week

#### Logical Operations (5 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `logical/and.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 2 | `logical/or.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 3 | `logical/not.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 4 | `logical/xor.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |
| 5 | `logical/nullish.js` | 🟡 Medium | 🌙 Low | Medium | Matrix |

#### Bitwise Operations (8 files)

**WASM Priority**: ⚡ High

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 6 | `bitwise/bitAnd.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 7 | `bitwise/bitOr.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 8 | `bitwise/bitXor.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 9 | `bitwise/bitNot.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 10 | `bitwise/leftShift.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 11 | `bitwise/rightArithShift.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 12 | `bitwise/rightLogShift.js` | 🟡 Medium | ⚡ High | Medium | BigNumber |
| 13 | `bitwise/useMatrixForArrayScalar.js` | 🟢 Low | ⛔ None | Small | Matrix |

**WASM Opportunity**: `src/wasm/bitwise/operations.ts`

### Batch 5.3: Set Operations (10 files)

**Duration**: 2 days
**WASM Priority**: 🌙 Low

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `set/setCartesian.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 2 | `set/setDifference.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 3 | `set/setDistinct.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 4 | `set/setIntersect.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 5 | `set/setIsSubset.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 6 | `set/setMultiplicity.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 7 | `set/setPowerset.js` | 🟡 Medium | 💡 Medium | Medium | DenseMatrix |
| 8 | `set/setSize.js` | 🟢 Low | 🌙 Low | Small | DenseMatrix |
| 9 | `set/setSymDifference.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |
| 10 | `set/setUnion.js` | 🟡 Medium | 🌙 Low | Medium | DenseMatrix |

---

## Phase 6: Specialized Functions

**Total**: 19 files
**Duration**: 1 week
**WASM Priority**: Mixed

### Batch 6.1: String & Complex (9 files)

**Duration**: 2 days

#### String Functions (5 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `string/format.js` | 🟡 Medium | ⛔ None | Medium | number utils |
| 2 | `string/print.js` | 🟡 Medium | ⛔ None | Medium | format |
| 3 | `string/hex.js` | 🟡 Medium | 💡 Medium | Medium | format |
| 4 | `string/bin.js` | 🟡 Medium | 💡 Medium | Medium | format |
| 5 | `string/oct.js` | 🟡 Medium | 💡 Medium | Medium | format |

#### Complex Functions (4 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 6 | `complex/arg.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 7 | `complex/conj.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 8 | `complex/im.js` | 🟡 Medium | ⚡ High | Medium | Complex |
| 9 | `complex/re.js` | 🟡 Medium | ⚡ High | Medium | Complex |

### Batch 6.2: Unit, Geometry, Special (6 files)

**Duration**: 2 days

#### Unit Functions (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `unit/to.js` | 🔴 High | ⛔ None | Large | Unit |
| 2 | `unit/toBest.js` | 🟡 Medium | ⛔ None | Medium | Unit, to |

#### Geometry Functions (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 3 | `geometry/distance.js` | 🟡 Medium | ⚡ High | Medium | sqrt, subtract |
| 4 | `geometry/intersect.js` | 🟡 Medium | ⚡ High | Medium | Matrix, abs |

#### Special Functions (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `special/erf.js` | 🔴 High | 🔥 Very High | Large | exp, sqrt |
| 6 | `special/zeta.js` | 🔴 High | ⚡ High | Large | gamma, pow |

**WASM Opportunity**: `src/wasm/special/functions.ts`

### Batch 6.3: Numeric & Signal (4 files)

**Duration**: 3 days

#### Numeric Solvers (1 file)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `numeric/solveODE.js` | 🔴 High | 🔥 Very High | XLarge | Matrix, arithmetic |

**WASM Opportunity**: `src/wasm/numeric/ode.ts` - Critical for WASM!

#### Signal Processing (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 2 | `signal/freqz.js` | 🟡 Medium | ⚡ High | Medium | Complex, exp |
| 3 | `signal/zpk2tf.js` | 🟡 Medium | ⚡ High | Medium | Complex, polynomial |

#### Function Utilities (13 files)

**Type Checking Utilities**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 4 | `utils/clone.js` | 🟡 Medium | ⛔ None | Medium | object.clone |
| 5 | `utils/hasNumericValue.js` | 🟢 Low | ⛔ None | Small | is |
| 6 | `utils/isFinite.js` | 🟢 Low | ⛔ None | Small | is |
| 7 | `utils/isInteger.js` | 🟢 Low | ⛔ None | Small | is |
| 8 | `utils/isNaN.js` | 🟢 Low | ⛔ None | Small | is |
| 9 | `utils/isNegative.js` | 🟢 Low | ⛔ None | Small | is |
| 10 | `utils/isNumeric.js` | 🟢 Low | ⛔ None | Small | is |
| 11 | `utils/isPositive.js` | 🟢 Low | ⛔ None | Small | is |
| 12 | `utils/isZero.js` | 🟢 Low | ⛔ None | Small | is |
| 13 | `utils/isPrime.js` | 🟡 Medium | ⚡ High | Medium | sqrt |
| 14 | `utils/isBounded.js` | 🟡 Medium | ⛔ None | Medium | is |
| 15 | `utils/typeOf.js` | 🟢 Low | ⛔ None | Small | is |
| 16 | `utils/numeric.js` | 🟡 Medium | ⛔ None | Medium | bignumber |

---

## Phase 7: Plain Number Implementations

**Total**: 12 files
**Duration**: 1 week
**WASM Priority**: 🔥 Very High - **CRITICAL FOR WASM**

**Location**: `src/plain/number/`

### All Plain Files (12 files)

**HIGHEST PRIORITY FOR WASM COMPILATION**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `plain/number/arithmetic.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 2 | `plain/number/bitwise.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 3 | `plain/number/combinatorics.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 4 | `plain/number/complex.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 5 | `plain/number/constants.js` | 🟢 Low | 🔥 Very High | Small | None |
| 6 | `plain/number/logical.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 7 | `plain/number/matrix.js` | 🔴 High | 🔥 Very High | Large | None |
| 8 | `plain/number/probability.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 9 | `plain/number/relational.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 10 | `plain/number/statistics.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 11 | `plain/number/trigonometry.js` | 🟡 Medium | 🔥 Very High | Medium | None |
| 12 | `plain/number/utils.js` | 🟡 Medium | 🔥 Very High | Medium | None |

**WASM Implementation**:
- Create `src/wasm/plain/` directory
- Directly compile these to WASM
- Pure numeric code, ideal for AssemblyScript
- No dependencies on mathjs types
- Target for maximum performance gain

**Strategy**:
1. Convert to TypeScript first
2. Create identical WASM versions in src/wasm/plain/
3. Use WasmBridge for automatic selection
4. Benchmark: expect 5-10x improvement

---

## Phase 8: Expression System

**Total**: 312 files
**Duration**: 8-10 weeks
**WASM Priority**: 🌙 Low (mostly unsuitable for WASM)

### Batch 8.1: AST Node Types (43 files)

**Duration**: 3 weeks
**WASM Priority**: ⛔ None

#### Week 1: Core Nodes (15 files)

**Basic Nodes**

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `expression/node/Node.js` | 🔴 High | ⛔ None | XLarge | None (base class) |
| 2 | `expression/node/SymbolNode.js` | 🔴 High | ⛔ None | Large | Node |
| 3 | `expression/node/ConstantNode.js` | 🔴 High | ⛔ None | Large | Node |
| 4 | `expression/node/ArrayNode.js` | 🔴 High | ⛔ None | Large | Node |
| 5 | `expression/node/ObjectNode.js` | 🔴 High | ⛔ None | Large | Node |
| 6 | `expression/node/RangeNode.js` | 🔴 High | ⛔ None | Large | Node |
| 7 | `expression/node/IndexNode.js` | 🔴 High | ⛔ None | Large | Node |
| 8 | `expression/node/BlockNode.js` | 🔴 High | ⛔ None | XLarge | Node |
| 9 | `expression/node/ConditionalNode.js` | 🔴 High | ⛔ None | Large | Node |
| 10 | `expression/node/ParenthesisNode.js` | 🟡 Medium | ⛔ None | Medium | Node |
| 11 | `expression/node/UpdateNode.js` | 🔴 High | ⛔ None | Large | Node |
| 12 | `expression/node/ChainNode.js` | 🔴 High | ⛔ None | Large | Node |
| 13 | `expression/node/help/isNode.js` | 🟢 Low | ⛔ None | Small | None |
| 14 | `expression/node/help/isSymbolNode.js` | 🟢 Low | ⛔ None | Small | None |
| 15 | `expression/node/help/validate.js` | 🟡 Medium | ⛔ None | Medium | None |

#### Week 2: Operation Nodes (14 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 16 | `expression/node/OperatorNode.js` | 🔴 High | ⛔ None | XLarge | Node |
| 17 | `expression/node/FunctionNode.js` | 🔴 High | ⛔ None | XLarge | Node |
| 18 | `expression/node/AssignmentNode.js` | 🔴 High | ⛔ None | XLarge | Node |
| 19 | `expression/node/FunctionAssignmentNode.js` | 🔴 High | ⛔ None | XLarge | Node, AssignmentNode |
| 20 | `expression/node/AccessorNode.js` | 🔴 High | ⛔ None | XLarge | Node |
| 21 | `expression/node/RelationalNode.js` | 🔴 High | ⛔ None | Large | Node |
| 22-29 | Additional operation nodes | 🔴 High | ⛔ None | Large | Node |

#### Week 3: Advanced Nodes & Utils (14 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 30-43 | Advanced nodes and utilities | 🔴 High | ⛔ None | Large-XLarge | Various |

### Batch 8.2: Parser & Compilation (23 files)

**Duration**: 2 weeks
**WASM Priority**: ⛔ None

#### Parser Files (15 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `expression/parse.js` | 🔴 High | ⛔ None | XLarge | Parser |
| 2-15 | Parser utilities and helpers | 🔴 High | ⛔ None | Large-XLarge | Various |

#### Compiler Files (8 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 16 | `expression/compile.js` | 🔴 High | ⛔ None | XLarge | Nodes |
| 17-23 | Compilation utilities | 🔴 High | ⛔ None | Large | Various |

### Batch 8.3: Transform Functions (28 files)

**Duration**: 2 weeks
**WASM Priority**: ⛔ None

#### Matrix Transforms (10 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `expression/transform/concat.transform.js` | 🔴 High | ⛔ None | Large | Matrix |
| 2 | `expression/transform/filter.transform.js` | 🔴 High | ⛔ None | Large | Matrix |
| 3 | `expression/transform/forEach.transform.js` | 🔴 High | ⛔ None | Large | Matrix |
| 4 | `expression/transform/map.transform.js` | 🔴 High | ⛔ None | Large | Matrix |
| 5 | `expression/transform/mapSlices.transform.js` | 🔴 High | ⛔ None | XLarge | Matrix |
| 6 | `expression/transform/row.transform.js` | 🔴 High | ⛔ None | Large | Matrix |
| 7 | `expression/transform/column.transform.js` | 🔴 High | ⛔ None | Large | Matrix |
| 8 | `expression/transform/subset.transform.js` | 🔴 High | ⛔ None | XLarge | Index |
| 9 | `expression/transform/range.transform.js` | 🔴 High | ⛔ None | Large | Range |
| 10 | `expression/transform/index.transform.js` | 🔴 High | ⛔ None | Large | Index |

#### Statistical Transforms (7 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 11 | `expression/transform/mean.transform.js` | 🟡 Medium | ⛔ None | Medium | mean |
| 12 | `expression/transform/std.transform.js` | 🟡 Medium | ⛔ None | Medium | std |
| 13 | `expression/transform/variance.transform.js` | 🟡 Medium | ⛔ None | Medium | variance |
| 14 | `expression/transform/max.transform.js` | 🟡 Medium | ⛔ None | Medium | max |
| 15 | `expression/transform/min.transform.js` | 🟡 Medium | ⛔ None | Medium | min |
| 16 | `expression/transform/sum.transform.js` | 🟡 Medium | ⛔ None | Medium | sum |
| 17 | `expression/transform/quantileSeq.transform.js` | 🔴 High | ⛔ None | Large | quantile |

#### Other Transforms (11 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 18 | `expression/transform/and.transform.js` | 🟡 Medium | ⛔ None | Medium | and |
| 19 | `expression/transform/or.transform.js` | 🟡 Medium | ⛔ None | Medium | or |
| 20 | `expression/transform/bitAnd.transform.js` | 🟡 Medium | ⛔ None | Medium | bitAnd |
| 21 | `expression/transform/bitOr.transform.js` | 🟡 Medium | ⛔ None | Medium | bitOr |
| 22 | `expression/transform/nullish.transform.js` | 🟡 Medium | ⛔ None | Medium | nullish |
| 23 | `expression/transform/print.transform.js` | 🟡 Medium | ⛔ None | Medium | print |
| 24 | `expression/transform/cumsum.transform.js` | 🟡 Medium | ⛔ None | Medium | cumsum |
| 25 | `expression/transform/diff.transform.js` | 🟡 Medium | ⛔ None | Medium | diff |
| 26-28 | Transform utilities | 🟡 Medium | ⛔ None | Medium | Various |

### Batch 8.4: Expression Functions (10 files)

**Duration**: 1 week
**WASM Priority**: ⛔ None

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `expression/function/parse.js` | 🟡 Medium | ⛔ None | Medium | Parser |
| 2 | `expression/function/compile.js` | 🟡 Medium | ⛔ None | Medium | Compiler |
| 3 | `expression/function/evaluate.js` | 🟡 Medium | ⛔ None | Medium | Parser |
| 4 | `expression/function/help.js` | 🔴 High | ⛔ None | Large | embedded docs |
| 5 | `expression/function/parser.js` | 🔴 High | ⛔ None | Large | Parser class |
| 6 | `expression/function/simplify.js` | 🔴 High | ⛔ None | XLarge | simplify |
| 7 | `expression/function/derivative.js` | 🔴 High | ⛔ None | XLarge | derivative |
| 8 | `expression/function/rationalize.js` | 🟡 Medium | ⛔ None | Medium | rationalize |
| 9 | `expression/function/resolve.js` | 🟡 Medium | ⛔ None | Medium | resolve |
| 10 | `expression/function/symbolicEqual.js` | 🟡 Medium | ⛔ None | Medium | simplify |

### Batch 8.5: Embedded Documentation (200+ files)

**Duration**: 2 weeks
**Strategy**: Automated conversion

**Files**: All `*.js` files in:
- `expression/embeddedDocs/`
- Function documentation
- Examples
- Usage descriptions

**Approach**:
- Create automated script for bulk conversion
- These files are primarily documentation
- Low complexity, high volume
- Template-based conversion

---

## Phase 9: Entry Points & Integration

**Total**: 11 files
**Duration**: 2 weeks
**WASM Priority**: ⛔ None

### Batch 9.1: Entry Points (6 files)

**Duration**: 1 week
**WASM Priority**: ⛔ None

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `entry/mainAny.js` | 🔴 High | ⛔ None | XLarge | All factories |
| 2 | `entry/mainNumber.js` | 🔴 High | ⛔ None | XLarge | Number factories |
| 3 | `entry/typeChecks.js` | 🟡 Medium | ⛔ None | Medium | Type checking |
| 4 | `entry/configReadonly.js` | 🟡 Medium | ⛔ None | Medium | Config |
| 5 | `entry/allFactoriesAny.js` | 🔴 High | ⛔ None | Large | All factories |
| 6 | `entry/allFactoriesNumber.js` | 🔴 High | ⛔ None | Large | Number factories |

### Batch 9.2: Final Core (5 files)

**Duration**: 1 week
**WASM Priority**: ⛔ None

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `core/config.js` | 🟡 Medium | ⛔ None | Medium | None |
| 2 | `core/import.js` | 🔴 High | ⛔ None | XLarge | factory |
| 3 | `core/function/*.js` | 🟡 Medium | ⛔ None | Medium | Various |

---

## Phase 10: Finalization

**Total**: 9+ files + tasks
**Duration**: 1-2 weeks
**WASM Priority**: Mixed

### Batch 10.1: Error & JSON (5 files)

**Duration**: 1 day
**WASM Priority**: ⛔ None

#### Error Classes (3 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `error/ArgumentsError.js` | 🟢 Low | ⛔ None | Small | None |
| 2 | `error/IndexError.js` | 🟢 Low | ⛔ None | Small | None |
| 3 | `error/DimensionError.js` | 🟢 Low | ⛔ None | Small | None |

#### JSON Utilities (2 files)

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 4 | `json/reviver.js` | 🟡 Medium | ⛔ None | Medium | Types |
| 5 | `json/replacer.js` | 🟡 Medium | ⛔ None | Medium | Types |

### Batch 10.2: Root Files (4 files)

**Duration**: 1 day
**WASM Priority**: ⛔ None

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 1 | `constants.js` | 🟢 Low | ⛔ None | Small | None |
| 2 | `version.js` | 🟢 Low | ⛔ None | Small | Auto-generated |
| 3 | `defaultInstance.js` | 🟡 Medium | ⛔ None | Medium | mainAny |
| 4 | `index.js` | 🟡 Medium | ⛔ None | Medium | defaultInstance |

### Additional Files

| # | File | Complexity | WASM | Effort | Dependencies |
|---|------|------------|------|--------|--------------|
| 5 | `header.js` | 🟢 Low | ⛔ None | Small | None |
| 6 | `factoriesAny.js` | 🔴 High | ⛔ None | Large | All factories |
| 7 | `factoriesNumber.js` | 🔴 High | ⛔ None | Large | Number factories |
| 8 | `number.js` | 🟡 Medium | ⛔ None | Medium | mainNumber |

### Batch 10.3: Final Tasks

**Duration**: 1-2 weeks

#### Build System Finalization (2 days)
- [ ] Remove JavaScript fallbacks
- [ ] Optimize TypeScript compilation
- [ ] Complete WASM build integration
- [ ] Update webpack configuration
- [ ] Test all build outputs
- [ ] Verify bundle sizes

#### Testing Suite (3 days)
- [ ] Convert all tests to TypeScript
- [ ] Add type-specific tests
- [ ] WASM integration tests
- [ ] Performance regression tests
- [ ] Browser compatibility tests
- [ ] E2E testing
- [ ] Coverage reports

#### Documentation (3 days)
- [ ] Update all API documentation
- [ ] Complete TypeScript examples
- [ ] Finish migration guide
- [ ] API reference auto-generation
- [ ] WASM usage guide
- [ ] Performance tuning guide
- [ ] Troubleshooting guide

#### Cleanup & Optimization (2 days)
- [ ] Remove all .js files
- [ ] Update package.json
- [ ] Final lint and format
- [ ] Bundle size optimization
- [ ] Tree-shaking verification
- [ ] Code splitting optimization
- [ ] Source map generation

#### Release Preparation (3 days)
- [ ] Version bump
- [ ] Changelog generation
- [ ] Release notes
- [ ] Migration guides
- [ ] Breaking changes documentation
- [ ] Deprecation notices
- [ ] Community communication

---

## Task Tracking

### Progress Dashboard

Use this template to track progress:

```markdown
## Phase N: [Name]

**Week**: X
**Date**: YYYY-MM-DD

### Completed This Week
- [ ] File 1 (✅ Tests pass, 📝 Docs updated)
- [ ] File 2 (✅ Tests pass, 📝 Docs updated)

### In Progress
- [ ] File 3 (🔄 Types added, ⏳ Tests pending)

### Blocked
- [ ] File 4 (🚫 Dependency not ready: File X)

### Next Week
- [ ] File 5
- [ ] File 6

### Metrics
- Files converted: X/Y
- Tests passing: X/Y
- WASM modules: X/Y
- Coverage: XX%
```

### File Conversion Checklist

For each file, complete:

```markdown
## [Filename].ts

- [ ] Create TypeScript file
- [ ] Add type imports
- [ ] Define interfaces
- [ ] Add parameter types
- [ ] Add return types
- [ ] Add generic types
- [ ] Update JSDoc
- [ ] Type check passes
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] WASM candidate evaluated
- [ ] WASM module created (if applicable)
- [ ] Performance benchmark
- [ ] Documentation updated
- [ ] Code review complete
- [ ] Commit and push
```

---

## Summary Statistics

### Total Effort Estimation

| Phase | Files | Weeks | Developer-Weeks |
|-------|-------|-------|-----------------|
| Phase 2 | 170 | 6-8 | 6-8 |
| Phase 3 | 43 | 2-3 | 2-3 |
| Phase 4 | 22 | 1-2 | 1-2 |
| Phase 5-7 | 67 | 4 | 4 |
| Phase 8 | 312 | 8-10 | 8-10 |
| Phase 9 | 11 | 2 | 2 |
| Phase 10 | 9+ | 1-2 | 1-2 |
| **Total** | **612** | **22-29** | **24-31** |

### WASM Opportunities

| Priority | Files | Estimated Speedup |
|----------|-------|------------------|
| Very High (🔥) | 36 | 5-10x |
| High (⚡) | 85 | 2-5x |
| Medium (💡) | 45 | 1.5-2x |
| Low (🌙) | 30 | <1.5x |
| None (⛔) | 416 | N/A |

### Resource Allocation

**Optimal Team** (5-6 people):
- 1 Senior TypeScript Architect (Lead)
- 2 TypeScript Developers (Functions, Types)
- 1 WASM Specialist (WASM modules)
- 1 Testing Engineer (QA, automation)
- 1 Documentation Writer (part-time)

**Timeline**: 5-6 months with optimal team

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Status**: Ready for Execution
**Next Action**: Begin Phase 2, Batch 2.1
