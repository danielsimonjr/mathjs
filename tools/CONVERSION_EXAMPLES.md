# TypeScript Conversion Examples

This document provides real-world examples of converting Math.js JavaScript files to TypeScript using automated codemods and manual refinement.

## Table of Contents

1. [Simple Arithmetic Function](#example-1-simple-arithmetic-function)
2. [Matrix Operation with Multiple Signatures](#example-2-matrix-operation)
3. [Complex Function with Dependencies](#example-3-complex-dependencies)
4. [Utility Function with Type Guards](#example-4-utility-function)
5. [Sparse Matrix Algorithm](#example-5-sparse-matrix-algorithm)

---

## Example 1: Simple Arithmetic Function

### Original: `src/function/arithmetic/add.js`

```javascript
import { factory } from '../../utils/factory.js'
import { deepMap } from '../../utils/collection.js'

export const createAdd = /* #__PURE__ */ factory('add', ['typed', 'matrix', 'addScalar'], ({ typed, matrix, addScalar }) => {
  /**
   * Add two or more values
   * @param {number|BigNumber|Fraction|Complex|Unit|Array|Matrix} x
   * @param {number|BigNumber|Fraction|Complex|Unit|Array|Matrix} y
   * @returns {number|BigNumber|Fraction|Complex|Unit|Array|Matrix}
   */
  return typed('add', {
    'number, number': (x, y) => x + y,

    'Complex, Complex': (x, y) => x.add(y),

    'BigNumber, BigNumber': (x, y) => x.plus(y),

    'Fraction, Fraction': (x, y) => x.add(y),

    'Unit, Unit': (x, y) => x.add(y),

    'Matrix, Matrix': (x, y) => {
      return matrix(x).add(y)
    },

    'Array, Array': (x, y) => {
      return matrix(x).add(y).toArray()
    }
  })
})
```

### Step 1: Run Codemod

```bash
npx jscodeshift -t tools/transform-mathjs-to-ts.js src/function/arithmetic/add.js --dry --print
```

### Step 2: After Codemod (80% complete)

```typescript
import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'

export const createAdd = /* #__PURE__ */ factory('add', ['typed', 'matrix', 'addScalar'], ({ typed, matrix, addScalar }: {
  typed: TypedFunction,
  matrix: MatrixConstructor,
  addScalar: (a: number, b: number) => number
}) => {
  return typed('add', {
    'number, number': (x: number, y: number): number => x + y,

    'Complex, Complex': (x: Complex, y: Complex): Complex => x.add(y),

    'BigNumber, BigNumber': (x: BigNumber, y: BigNumber): BigNumber => x.plus(y),

    'Fraction, Fraction': (x: Fraction, y: Fraction): Fraction => x.add(y),

    'Unit, Unit': (x: Unit, y: Unit): Unit => x.add(y),

    'Matrix, Matrix': (x: Matrix, y: Matrix): Matrix => {
      return matrix(x).add(y)
    },

    'Array, Array': (x: any[], y: any[]): any[] => {
      return matrix(x).add(y).toArray()
    }
  })
})
```

### Step 3: Manual Refinement (100% complete)

```typescript
import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import type {
  TypedFunction,
  MatrixConstructor,
  Matrix,
  Complex,
  BigNumber,
  Fraction,
  Unit,
  MaybeBigNumber,
  MaybeComplex
} from '../../types.ts'

export const createAdd = /* #__PURE__ */ factory(
  'add',
  ['typed', 'matrix', 'addScalar'],
  ({
    typed,
    matrix,
    addScalar
  }: {
    typed: TypedFunction
    matrix: MatrixConstructor
    addScalar: (a: number, b: number) => number
  }): TypedFunction => {
    /**
     * Add two or more values, x + y
     *
     * For matrices, the function is evaluated element wise.
     *
     * @param {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} x  First value to add
     * @param {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} y  Second value to add
     * @return {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} Sum of x and y
     */
    return typed('add', {
      'number, number': (x: number, y: number): number => {
        return x + y
      },

      'Complex, Complex': (x: Complex, y: Complex): Complex => {
        return x.add(y)
      },

      'BigNumber, BigNumber': (x: BigNumber, y: BigNumber): BigNumber => {
        return x.plus(y)
      },

      'Fraction, Fraction': (x: Fraction, y: Fraction): Fraction => {
        return x.add(y)
      },

      'Unit, Unit': (x: Unit, y: Unit): Unit => {
        return x.add(y)
      },

      'Matrix, Matrix': (x: Matrix, y: Matrix): Matrix => {
        return matrix(x).add(y)
      },

      'Array, Array': (x: number[], y: number[]): number[] => {
        return matrix(x).add(y).toArray() as number[]
      }
    })
  }
)
```

---

## Example 2: Matrix Operation

### Original: `src/function/matrix/transpose.js`

```javascript
import { factory } from '../../utils/factory.js'
import { format } from '../../utils/string.js'

export const createTranspose = /* #__PURE__ */ factory('transpose', ['typed', 'matrix'], ({ typed, matrix }) => {
  return typed('transpose', {
    'Matrix': function (x) {
      return x.transpose()
    },

    'Array': function (x) {
      return transpose(matrix(x)).toArray()
    }
  })
})
```

### After Codemod + Manual Refinement

```typescript
import { factory } from '../../utils/factory.ts'
import { format } from '../../utils/string.ts'
import type { TypedFunction, MatrixConstructor, Matrix } from '../../types.ts'

export const createTranspose = /* #__PURE__ */ factory(
  'transpose',
  ['typed', 'matrix'],
  ({
    typed,
    matrix
  }: {
    typed: TypedFunction
    matrix: MatrixConstructor
  }): TypedFunction => {
    /**
     * Transpose a matrix. All values of the matrix are reflected
     * over the main diagonal. Values on the diagonal itself are not changed.
     * Supports Arrays and Matrix types.
     *
     * @param {Array | Matrix} x  Matrix to be transposed
     * @return {Array | Matrix}   Transposed matrix
     */
    return typed('transpose', {
      Matrix: function (x: Matrix): Matrix {
        return x.transpose()
      },

      Array: function <T>(x: T[][]): T[][] {
        // Create matrix, transpose, convert back to array
        const result = matrix(x).transpose()
        return result.toArray() as T[][]
      }
    })
  }
)
```

**Key improvements**:
- Added generic `<T>` to Array signature for type preservation
- Proper return type annotations
- JSDoc comments preserved and enhanced

---

## Example 3: Complex Dependencies

### Original: `src/function/algebra/lup.js`

```javascript
import { factory } from '../../utils/factory.js'
import { csFlip } from '../../function/algebra/sparse/csFlip.js'

export const createLup = /* #__PURE__ */ factory('lup', [
  'typed',
  'matrix',
  'abs',
  'addScalar',
  'divideScalar',
  'multiplyScalar',
  'subtractScalar',
  'larger',
  'equalScalar',
  'unaryMinus',
  'DenseMatrix',
  'SparseMatrix',
  'Spa'
], ({
  typed,
  matrix,
  abs,
  addScalar,
  divideScalar,
  multiplyScalar,
  subtractScalar,
  larger,
  equalScalar,
  unaryMinus,
  DenseMatrix,
  SparseMatrix,
  Spa
}) => {
  return typed('lup', {
    'Matrix': function (m) {
      return _lup(m)
    },

    'Array': function (a) {
      const m = matrix(a)
      const r = _lup(m)
      return {
        L: r.L.toArray(),
        U: r.U.toArray(),
        p: r.p,
        toString: function () {
          return 'L: ' + format(r.L.toArray()) + '\nU: ' + format(r.U.toArray()) + '\nP: ' + r.p
        }
      }
    }
  })

  function _lup(m) {
    // Implementation...
  }
})
```

### After Conversion

```typescript
import { factory } from '../../utils/factory.ts'
import { csFlip } from '../../function/algebra/sparse/csFlip.ts'
import type {
  TypedFunction,
  MatrixConstructor,
  Matrix,
  DenseMatrixCtor,
  SparseMatrixCtor,
  SpaCtor,
  LUDecomposition
} from '../../types.ts'

export const createLup = /* #__PURE__ */ factory(
  'lup',
  [
    'typed',
    'matrix',
    'abs',
    'addScalar',
    'divideScalar',
    'multiplyScalar',
    'subtractScalar',
    'larger',
    'equalScalar',
    'unaryMinus',
    'DenseMatrix',
    'SparseMatrix',
    'Spa'
  ],
  ({
    typed,
    matrix,
    abs,
    addScalar,
    divideScalar,
    multiplyScalar,
    subtractScalar,
    larger,
    equalScalar,
    unaryMinus,
    DenseMatrix,
    SparseMatrix,
    Spa
  }: {
    typed: TypedFunction
    matrix: MatrixConstructor
    abs: (x: number) => number
    addScalar: (a: number, b: number) => number
    divideScalar: (a: number, b: number) => number
    multiplyScalar: (a: number, b: number) => number
    subtractScalar: (a: number, b: number) => number
    larger: (a: number, b: number) => boolean
    equalScalar: (a: any, b: any) => boolean
    unaryMinus: (x: number) => number
    DenseMatrix: DenseMatrixCtor
    SparseMatrix: SparseMatrixCtor
    Spa: SpaCtor
  }): TypedFunction => {
    /**
     * Calculate the LUP decomposition of a square matrix m.
     * The LUP decomposition is represented as an object {L, U, P} where:
     * - P*A = L*U
     * - L is lower triangular with ones on the diagonal
     * - U is upper triangular
     * - P is a permutation matrix
     *
     * @param {Matrix | Array} m  A square matrix
     * @return {LUDecomposition} LUP decomposition
     */
    return typed('lup', {
      Matrix: function (m: Matrix): LUDecomposition {
        return _lup(m)
      },

      Array: function (a: number[][]): LUDecomposition & {
        L: number[][]
        U: number[][]
        toString: () => string
      } {
        const m = matrix(a)
        const r = _lup(m)

        return {
          L: r.L.toArray() as number[][],
          U: r.U.toArray() as number[][],
          p: r.p,
          toString: function (): string {
            return `L: ${format(r.L.toArray())}\nU: ${format(r.U.toArray())}\nP: ${r.p}`
          }
        }
      }
    })

    function _lup(m: Matrix): LUDecomposition {
      // Implementation with type annotations...
      const rows = m.size()[0]
      const columns = m.size()[1]

      // Type-safe implementation
      // ...
    }
  }
)
```

**Key improvements**:
- All 13 dependencies properly typed
- Custom return type `LUDecomposition` interface
- Internal `_lup` function typed
- Template literal in `toString()`

---

## Example 4: Utility Function

### Original: `src/utils/is.js`

```javascript
export function isInteger(value) {
  if (typeof value === 'boolean') {
    return true
  }

  return (typeof value === 'number') && isFinite(value) && (Math.floor(value) === value)
}

export function isNumber(value) {
  return typeof value === 'number'
}

export function isBigNumber(value) {
  return value && value.constructor.prototype.isBigNumber || false
}

export function isComplex(value) {
  return value && value.constructor.prototype.isComplex || false
}
```

### After Conversion with Type Guards

```typescript
import type { BigNumber, Complex, Fraction, Matrix, Unit } from '../types.ts'

/**
 * Test whether a value is an integer number
 * @param {*} value
 * @return {boolean} isInteger
 */
export function isInteger(value: unknown): value is number {
  if (typeof value === 'boolean') {
    return true
  }

  return (
    typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value
  )
}

/**
 * Test whether a value is a number (primitive or Number object)
 * @param {*} value
 * @return {boolean} isNumber
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

/**
 * Test whether a value is a BigNumber
 * @param {*} value
 * @return {boolean} isBigNumber
 */
export function isBigNumber(value: unknown): value is BigNumber {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'constructor' in value &&
    'prototype' in (value.constructor as any) &&
    (value.constructor as any).prototype.isBigNumber
  )
}

/**
 * Test whether a value is a Complex number
 * @param {*} value
 * @return {boolean} isComplex
 */
export function isComplex(value: unknown): value is Complex {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'constructor' in value &&
    'prototype' in (value.constructor as any) &&
    (value.constructor as any).prototype.isComplex
  )
}

/**
 * Test whether a value is a Fraction
 * @param {*} value
 * @return {boolean} isFraction
 */
export function isFraction(value: unknown): value is Fraction {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'constructor' in value &&
    'prototype' in (value.constructor as any) &&
    (value.constructor as any).prototype.isFraction
  )
}

/**
 * Test whether a value is a Matrix
 * @param {*} value
 * @return {boolean} isMatrix
 */
export function isMatrix(value: unknown): value is Matrix {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'constructor' in value &&
    'prototype' in (value.constructor as any) &&
    (value.constructor as any).prototype.isMatrix
  )
}

/**
 * Test whether a value is a Unit
 * @param {*} value
 * @return {boolean} isUnit
 */
export function isUnit(value: unknown): value is Unit {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'constructor' in value &&
    'prototype' in (value.constructor as any) &&
    (value.constructor as any).prototype.isUnit
  )
}
```

**Key improvements**:
- `value is Type` type predicates (type guards)
- TypeScript will narrow types after these checks
- Safer property access with `in` operator
- Explicit `Boolean()` conversions

---

## Example 5: Sparse Matrix Algorithm

### Original: `src/function/algebra/sparse/csFlip.js`

```javascript
/**
 * Flip the value of x[i]
 */
export function csFlip (i, x) {
  return x[i] === 0 ? 1 : 0
}
```

### After Conversion (Simple but Important)

```typescript
/**
 * Flip the value of x[i]
 * Used in sparse matrix algorithms for marking visited nodes
 *
 * @param {number} i - Index to flip
 * @param {number[]} x - Array of binary values (0 or 1)
 * @return {number} Flipped value (0 or 1)
 */
export function csFlip(i: number, x: number[]): 0 | 1 {
  return x[i] === 0 ? 1 : 0
}
```

**Key improvements**:
- Precise return type: `0 | 1` (literal union type)
- Parameter types explicit
- Enhanced documentation

---

## Conversion Checklist

After running the codemod, manually verify:

- [ ] All imports have `.ts` extensions
- [ ] All function parameters are typed
- [ ] All return types are explicit
- [ ] Type guards use `value is Type` syntax
- [ ] Generic types are used where appropriate
- [ ] Complex types use interfaces/types from `types.ts`
- [ ] JSDoc comments are preserved
- [ ] No `any` types unless truly necessary
- [ ] File compiles without errors (`npm run compile:ts`)
- [ ] Tests pass (`npm test`)
- [ ] Factory indexes updated (`factoriesAny.ts`, `factoriesNumber.ts`)
- [ ] Type definitions added to `types/index.d.ts`

---

## Common Patterns

### Pattern 1: typed-function with overloads

```typescript
return typed('functionName', {
  'Type1, Type2': (a: Type1, b: Type2): ReturnType => { ... },
  'Type3, Type4': (a: Type3, b: Type4): ReturnType => { ... }
})
```

### Pattern 2: Matrix/Array duality

```typescript
'Matrix': (x: Matrix): Matrix => x.operation(),
'Array': (x: number[][]): number[][] => matrix(x).operation().toArray() as number[][]
```

### Pattern 3: Type guards

```typescript
if (isMatrix(x)) {
  // TypeScript knows x is Matrix here
  return x.transpose()
}
```

### Pattern 4: Generic functions

```typescript
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}
```

---

## Next Steps

1. Pick 5 simple files (utilities, type checkers)
2. Run codemod + manual refinement
3. Document edge cases you encounter
4. Update this guide with new patterns
5. Gradually tackle more complex files
