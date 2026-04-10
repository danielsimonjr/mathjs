# Math.js Architecture Overview

## Introduction

Math.js is an extensive mathematics library for JavaScript and Node.js that provides a flexible expression parser, support for symbolic computation, and a large set of built-in functions and constants. The library is designed with extensibility, type safety, and performance as core principles.

## Design Philosophy

### Core Principles

1. **Extensibility First**: Every function is created through factory functions with explicit dependency injection, enabling users to customize, extend, or replace any part of the library.

2. **Type Flexibility**: The library supports multiple numeric types (Number, BigNumber, Complex, Fraction, BigInt) and automatically dispatches to the correct implementation based on input types.

3. **Immutability**: Operations never mutate inputs; they always return new values, making the library predictable and safe for functional programming.

4. **Backward Compatibility**: New features and optimizations maintain full API compatibility with existing code.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐  │
│  │  Direct API     │    │ Expression API  │    │    Chain API        │  │
│  │  math.add(2,3)  │    │ math.evaluate() │    │ math.chain(5).add() │  │
│  └────────┬────────┘    └────────┬────────┘    └──────────┬──────────┘  │
│           │                      │                        │              │
│           └──────────────────────┼────────────────────────┘              │
│                                  ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    MATH.JS INSTANCE (create())                     │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │  │
│  │  │   Config    │  │    Import    │  │   Event Emitter          │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│                                  ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     FACTORY SYSTEM                                 │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ Dependency Injection Container                                │ │  │
│  │  │ • Topological sorting of factories                            │ │  │
│  │  │ • Lazy instantiation                                          │ │  │
│  │  │ • Memoization                                                  │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│           ┌──────────────────────┼──────────────────────┐               │
│           ▼                      ▼                      ▼               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │  DATA TYPES     │  │   FUNCTIONS     │  │  EXPRESSION SYSTEM      │ │
│  │  • Number       │  │   • Arithmetic  │  │  • Parser               │ │
│  │  • BigNumber    │  │   • Algebra     │  │  • AST Nodes            │ │
│  │  • Complex      │  │   • Matrix      │  │  • Compiler             │ │
│  │  • Fraction     │  │   • Statistics  │  │  • Evaluator            │ │
│  │  • Unit         │  │   • Trigonometry│  │  • Transforms           │ │
│  │  • Matrix       │  │   • etc.        │  │                         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
│           │                      │                                       │
│           └──────────────────────┼───────────────────────────────────┐  │
│                                  ▼                                   │  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    TYPED-FUNCTION DISPATCH                         │  │
│  │  • Multi-type signature matching                                   │  │
│  │  • Automatic type conversion                                       │  │
│  │  • Runtime type validation                                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│           ┌──────────────────────┼──────────────────────┐               │
│           ▼                      ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  PLAIN JS Implementations                                           │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Subsystems

### 1. Core System (`src/core/`)

The foundation that bootstraps the entire library:

| Component | Purpose |
|-----------|---------|
| `create.js` | Main entry point; creates math.js instances with dependency injection |
| `config.js` | Configuration management (precision, matrix type, number type) |
| `function/typed.js` | Integration with typed-function for multi-type dispatch |
| `function/import.js` | Runtime function loading and registration |

### 2. Data Types (`src/type/`)

Fifteen data type classes with consistent interfaces:

| Type | Description | Use Case |
|------|-------------|----------|
| Number | JavaScript native | General arithmetic |
| BigNumber | Arbitrary precision | Financial calculations, high precision |
| Complex | Real + imaginary | Signal processing, physics |
| Fraction | Exact rationals | Avoiding floating-point errors |
| Unit | Physical quantities | Engineering, physics |
| Matrix (Dense) | Multi-dimensional arrays | Linear algebra |
| Matrix (Sparse) | Compressed storage | Large sparse systems |
| BigInt | Arbitrary integers | Cryptography, large integers |

### 3. Function Library (`src/function/`)

545 factory functions implementing 444+ user-facing functions organized into 21 categories:

| Category | Examples | Count |
|----------|----------|-------|
| Algebra / CAS | derivative, simplify, integrate, solve, groebnerBasis, taylor | 92 |
| Matrix | det, inv, eigs, transpose, sqrtm, schur | 50 |
| Numeric | ode, rootFind, interpolate, fit | 39 |
| Statistics | mean, std, median, regression, corr | 38 |
| Special | gamma, erf, bessel, airyAi, zeta | 26 |
| Trigonometry | sin, cos, atan2, sinh, acot | 25 |
| Signal | fft, ifft, dct, dst, dwt, spectrogram, hilbert | 20 |
| Combinatorics | combinations, partitions, stirling, bell, catalan | 20 |
| Utils | format, clone, typeOf, isNaN | 18 |
| Geometry | distance, area, convexHull, voronoi, delaunay | 14 |
| Probability | random, factorial, gamma, distributions | 12 |
| Relational | equal, larger, compare, deepEqual | 12 |
| Operators | add, subtract, multiply, divide, pow | 11 |
| Arithmetic | abs, ceil, floor, gcd, lcm, mod | 11 |
| Set | setUnion, setIntersect, setDiff | 10 |
| Graph | dijkstra, kruskal, tarjan, bfs, dfs | 8 |
| Bitwise | bitAnd, bitOr, bitXor, leftShift | 7 |
| Logical | and, or, not, xor | 5 |
| Complex | arg, conj, im, re | 4 |
| Units | unit, createUnit | 2 |
| Type | type | 1 |

### 4. Expression System (`src/expression/`)

A complete expression language with:

- **Parser**: Recursive descent parser supporting mathematical notation
- **AST**: 16 node types representing expression structure
- **Compiler**: JIT compilation to optimized JavaScript functions
- **Evaluator**: Direct evaluation with scope binding
- **Transforms**: 50+ compile-time optimizations

## Library Variants

### Full Library (`factoriesAny.js`)
- 545 factory functions (444+ user-facing)
- All data types
- Complete functionality
- ~500KB minified

### Lightweight (`factoriesNumber.js`)
- 300+ factories
- Numbers only (no BigNumber, Complex, Fraction, Unit)
- ~200KB minified
- Ideal for embedded/constrained environments

## Instance Creation Flow

```javascript
// 1. Import factories
import * as all from './factoriesAny.js'

// 2. Create instance with dependency injection
const math = create(all, config)

// 3. Instance ready with all functions attached
math.add(2, 3)                    // Direct API
math.evaluate('2 + 3')            // Expression API
math.chain(2).add(3).done()       // Chain API
```

## Extension Points

Math.js is designed for extension at multiple levels:

### 1. Configuration
```javascript
math.config({ number: 'BigNumber', precision: 128 })
```

### 2. Custom Functions
```javascript
math.import({
  myFunc: function(x) { return x * 2 }
})
```

### 3. Custom Types
```javascript
// Extend typed-function with new type
typed.addType({
  name: 'MyType',
  test: (x) => x instanceof MyType
})
```

### 4. Factory Replacement
```javascript
// Create custom instance with modified factory
const customMath = create({
  ...all,
  createAdd: myCustomAddFactory
})
```

## Performance Characteristics

| Operation | Small (n<100) | Medium (100-10K) | Large (>10K) |
|-----------|---------------|------------------|--------------|
| Scalar arithmetic | <1μs | N/A | N/A |
| Vector operations | <10μs | <1ms | 10-100ms |
| Matrix multiply | <100μs | 1-100ms | >100ms |
| Expression parse | <100μs | N/A | N/A |
| Expression evaluate | <10μs | N/A | N/A |

For TypeScript and WASM-accelerated math, see [MathTS](https://github.com/danielsimonjr/MathTS).

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architectural patterns and design decisions
- [COMPONENTS.md](./COMPONENTS.md) - Deep dive into each component
- [DATAFLOW.md](./DATAFLOW.md) - How data flows through the system
- [Function Reference](https://danielsimonjr.github.io/mathjs/) - Full online documentation and function reference
