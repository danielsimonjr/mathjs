import { factory } from '../../utils/factory.ts'
import { isMatrix } from '../../utils/is.ts'

// Type definitions for better WASM integration and type safety
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(
    signature: string,
    fn: (ref: TypedFunction<U>) => TypedFunction<U>
  ): TypedFunction<U>
  referToSelf<U>(
    fn: (self: TypedFunction<U>) => TypedFunction<U>
  ): TypedFunction<U>
}

interface DenseMatrix {
  _data: any[] | any[][]
  _size: number[]
  _datatype?: string
  storage(): 'dense'
  size(): number[]
  getDataType(): string
  valueOf(): any[] | any[][]
}

interface SparseMatrix {
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  _data?: any
  storage(): 'sparse'
  size(): number[]
  getDataType(): string
  valueOf(): any[] | any[][]
}

type Matrix = DenseMatrix | SparseMatrix

interface Dependencies {
  typed: TypedFunction
  addScalar: TypedFunction
  multiplyScalar: TypedFunction
  conj: TypedFunction
  size: TypedFunction
}

const name = 'dot'
const dependencies = ['typed', 'addScalar', 'multiplyScalar', 'conj', 'size']

export const createDot = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, addScalar, multiplyScalar, conj, size }: Dependencies) => {
    /**
     * Calculate the dot product of two vectors. The dot product of
     * `A = [a1, a2, ..., an]` and `B = [b1, b2, ..., bn]` is defined as:
     *
     *    dot(A, B) = conj(a1) * b1 + conj(a2) * b2 + ... + conj(an) * bn
     *
     * Syntax:
     *
     *    math.dot(x, y)
     *
     * Examples:
     *
     *    math.dot([2, 4, 1], [2, 2, 3])       // returns number 15
     *    math.multiply([2, 4, 1], [2, 2, 3])  // returns number 15
     *
     * See also:
     *
     *    multiply, cross
     *
     * @param  {Array | Matrix} x     First vector
     * @param  {Array | Matrix} y     Second vector
     * @return {number}               Returns the dot product of `x` and `y`
     */
    return typed(name, {
      'Array | DenseMatrix, Array | DenseMatrix': _denseDot,
      'SparseMatrix, SparseMatrix': _sparseDot
    })

    /**
     * Validate dimensions of vectors for dot product
     * @param x - First vector
     * @param y - Second vector
     * @returns Length of vectors
     */
    function _validateDim(x: any[] | Matrix, y: any[] | Matrix): number {
      const xSize = _size(x)
      const ySize = _size(y)
      let xLen: number, yLen: number

      if (xSize.length === 1) {
        xLen = xSize[0]
      } else if (xSize.length === 2 && xSize[1] === 1) {
        xLen = xSize[0]
      } else {
        throw new RangeError(
          'Expected a column vector, instead got a matrix of size (' +
            xSize.join(', ') +
            ')'
        )
      }

      if (ySize.length === 1) {
        yLen = ySize[0]
      } else if (ySize.length === 2 && ySize[1] === 1) {
        yLen = ySize[0]
      } else {
        throw new RangeError(
          'Expected a column vector, instead got a matrix of size (' +
            ySize.join(', ') +
            ')'
        )
      }

      if (xLen !== yLen)
        throw new RangeError(
          'Vectors must have equal length (' + xLen + ' != ' + yLen + ')'
        )
      if (xLen === 0)
        throw new RangeError(
          'Cannot calculate the dot product of empty vectors'
        )

      return xLen
    }

    /**
     * Calculate dot product for dense matrices/arrays
     * @param a - First dense matrix or array
     * @param b - Second dense matrix or array
     * @returns Dot product result
     */
    function _denseDot(a: any[] | DenseMatrix, b: any[] | DenseMatrix): any {
      const N = _validateDim(a, b)

      const adata = isMatrix(a) ? (a as DenseMatrix)._data : a
      const adt = isMatrix(a)
        ? (a as DenseMatrix)._datatype || (a as DenseMatrix).getDataType()
        : undefined

      const bdata = isMatrix(b) ? (b as DenseMatrix)._data : b
      const bdt = isMatrix(b)
        ? (b as DenseMatrix)._datatype || (b as DenseMatrix).getDataType()
        : undefined

      // are these 2-dimensional column vectors? (as opposed to 1-dimensional vectors)
      const aIsColumn = _size(a).length === 2
      const bIsColumn = _size(b).length === 2

      let add: TypedFunction = addScalar
      let mul: TypedFunction = multiplyScalar

      // process data types
      if (
        adt &&
        bdt &&
        adt === bdt &&
        typeof adt === 'string' &&
        adt !== 'mixed'
      ) {
        const dt = adt
        // find signatures that matches (dt, dt)
        add = typed.find(addScalar, [dt, dt])
        mul = typed.find(multiplyScalar, [dt, dt])
      }

      // both vectors 1-dimensional
      if (!aIsColumn && !bIsColumn) {
        let c = mul(conj((adata as any[])[0]), (bdata as any[])[0])
        for (let i = 1; i < N; i++) {
          c = add(c, mul(conj((adata as any[])[i]), (bdata as any[])[i]))
        }
        return c
      }

      // a is 1-dim, b is column
      if (!aIsColumn && bIsColumn) {
        let c = mul(conj((adata as any[])[0]), (bdata as any[][])[0][0])
        for (let i = 1; i < N; i++) {
          c = add(c, mul(conj((adata as any[])[i]), (bdata as any[][])[i][0]))
        }
        return c
      }

      // a is column, b is 1-dim
      if (aIsColumn && !bIsColumn) {
        let c = mul(conj((adata as any[][])[0][0]), (bdata as any[])[0])
        for (let i = 1; i < N; i++) {
          c = add(c, mul(conj((adata as any[][])[i][0]), (bdata as any[])[i]))
        }
        return c
      }

      // both vectors are column
      if (aIsColumn && bIsColumn) {
        let c = mul(conj((adata as any[][])[0][0]), (bdata as any[][])[0][0])
        for (let i = 1; i < N; i++) {
          c = add(
            c,
            mul(conj((adata as any[][])[i][0]), (bdata as any[][])[i][0])
          )
        }
        return c
      }
    }

    /**
     * Calculate dot product for sparse matrices
     * @param x - First sparse matrix
     * @param y - Second sparse matrix
     * @returns Dot product result
     */
    function _sparseDot(x: SparseMatrix, y: SparseMatrix): any {
      _validateDim(x, y)

      const xindex = x._index!
      const xvalues = x._values!

      const yindex = y._index!
      const yvalues = y._values!

      // TODO optimize add & mul using datatype
      let c: any = 0
      const add: TypedFunction = addScalar
      const mul: TypedFunction = multiplyScalar

      let i = 0
      let j = 0
      while (i < xindex.length && j < yindex.length) {
        const I = xindex[i]
        const J = yindex[j]

        if (I < J) {
          i++
          continue
        }
        if (I > J) {
          j++
          continue
        }
        if (I === J) {
          c = add(c, mul(xvalues[i], yvalues[j]))
          i++
          j++
        }
      }

      return c
    }

    // TODO remove this once #1771 is fixed
    /**
     * Get size of matrix or array
     * @param x - Matrix or array
     * @returns Size array
     */
    function _size(x: any[] | Matrix): number[] {
      return isMatrix(x) ? (x as Matrix).size() : size(x)
    }
  }
)
