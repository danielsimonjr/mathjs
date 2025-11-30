import { isBigNumber } from '../../utils/is.js'
import { resize } from '../../utils/array.js'
import { isInteger } from '../../utils/number.js'
import { factory } from '../../utils/factory.js'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface BigNumberConstructor {
  new (value: number | string): BigNumber
  (value: number | string): BigNumber
}

interface BigNumber {
  isBigNumber: boolean
  toNumber(): number
  constructor: BigNumberConstructor
}

interface MatrixConstructor {
  (data?: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
  (storage?: 'dense' | 'sparse'): Matrix
}

interface Matrix {
  _size: number[]
  storage(): 'dense' | 'sparse'
  valueOf(): any[] | any[][]
}

interface DenseMatrixConstructor {
  diagonal(size: number[], value: any, k: number, defaultValue: any): Matrix
}

interface SparseMatrixConstructor {
  diagonal(size: number[], value: any, k: number, defaultValue: any): Matrix
}

interface Config {
  matrix: 'Array' | 'Matrix'
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  matrix: MatrixConstructor
  BigNumber: BigNumberConstructor
  DenseMatrix: DenseMatrixConstructor
  SparseMatrix: SparseMatrixConstructor
}

const name = 'identity'
const dependencies = [
  'typed',
  'config',
  'matrix',
  'BigNumber',
  'DenseMatrix',
  'SparseMatrix'
]

export const createIdentity = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, matrix, BigNumber, DenseMatrix, SparseMatrix }: Dependencies) => {
  /**
   * Create a 2-dimensional identity matrix with size m x n or n x n.
   * The matrix has ones on the diagonal and zeros elsewhere.
   *
   * Syntax:
   *
   *    math.identity(n)
   *    math.identity(n, format)
   *    math.identity(m, n)
   *    math.identity(m, n, format)
   *    math.identity([m, n])
   *    math.identity([m, n], format)
   *
   * Examples:
   *
   *    math.identity(3)                    // returns [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
   *    math.identity(3, 2)                 // returns [[1, 0], [0, 1], [0, 0]]
   *
   *    const A = [[1, 2, 3], [4, 5, 6]]
   *    math.identity(math.size(A))         // returns [[1, 0, 0], [0, 1, 0]]
   *
   * See also:
   *
   *    diag, ones, zeros, size, range
   *
   * @param {...number | Matrix | Array} size   The size for the matrix
   * @param {string} [format]                   The Matrix storage format
   *
   * @return {Matrix | Array | number} A matrix with ones on the diagonal.
   */
  return typed(name, {
    '': function (): any[] | Matrix {
      return (config.matrix === 'Matrix') ? matrix([]) : []
    },

    string: function (format: string): any {
      return (matrix as any)(format)
    },

    'number | BigNumber': function (rows: number | BigNumber): any[][] | Matrix {
      return _identity(rows, rows, config.matrix === 'Matrix' ? 'dense' : undefined)
    },

    'number | BigNumber, string': function (rows: number | BigNumber, format: string): Matrix {
      return _identity(rows, rows, format) as Matrix
    },

    'number | BigNumber, number | BigNumber': function (rows: number | BigNumber, cols: number | BigNumber): any[][] | Matrix {
      return _identity(rows, cols, config.matrix === 'Matrix' ? 'dense' : undefined)
    },

    'number | BigNumber, number | BigNumber, string': function (rows: number | BigNumber, cols: number | BigNumber, format: string): Matrix {
      return _identity(rows, cols, format) as Matrix
    },

    Array: function (size: number[]): any[] | any[][] | Matrix {
      return _identityVector(size)
    },

    'Array, string': function (size: number[], format: string): Matrix {
      return _identityVector(size, format) as Matrix
    },

    Matrix: function (size: Matrix): Matrix {
      return _identityVector(size.valueOf() as number[], size.storage()) as Matrix
    },

    'Matrix, string': function (size: Matrix, format: string): Matrix {
      return _identityVector(size.valueOf() as number[], format) as Matrix
    }
  })

  function _identityVector(size: number[], format?: string): any {
    switch (size.length) {
      case 0: return format ? matrix(format as any) : []
      case 1: return _identity(size[0], size[0], format)
      case 2: return _identity(size[0], size[1], format)
      default: throw new Error('Vector containing two values expected')
    }
  }

  /**
   * Create an identity matrix
   * @param {number | BigNumber} rows
   * @param {number | BigNumber} cols
   * @param {string} [format]
   * @returns {Matrix | Array}
   * @private
   */
  function _identity(rows: number | BigNumber, cols: number | BigNumber, format?: string): any[][] | Matrix {
    // BigNumber constructor with the right precision
    const Big = (isBigNumber(rows) || isBigNumber(cols))
      ? BigNumber
      : null

    if (isBigNumber(rows)) rows = (rows as any).toNumber()
    if (isBigNumber(cols)) cols = (cols as any).toNumber()

    if (!isInteger(rows as number) || (rows as number) < 1) {
      throw new Error('Parameters in function identity must be positive integers')
    }
    if (!isInteger(cols as number) || (cols as number) < 1) {
      throw new Error('Parameters in function identity must be positive integers')
    }

    const one = Big ? new BigNumber(1) : 1
    const defaultValue = Big ? new Big(0) : 0
    const size = [rows as number, cols as number]

    // check we need to return a matrix
    if (format) {
      // create diagonal matrix (use optimized implementation for storage format)
      if (format === 'sparse') {
        return SparseMatrix.diagonal(size, one, 0, defaultValue)
      }
      if (format === 'dense') {
        return DenseMatrix.diagonal(size, one, 0, defaultValue)
      }
      throw new TypeError(`Unknown matrix type "${format}"`)
    }

    // create and resize array
    const res = resize([], size, defaultValue)
    // fill in ones on the diagonal
    const minimum = (rows as number) < (cols as number) ? (rows as number) : (cols as number)
    // fill diagonal
    for (let d = 0; d < minimum; d++) {
      (res as any[][])[d][d] = one
    }
    return res as any[][]
  }
})
