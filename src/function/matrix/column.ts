import { factory } from '../../utils/factory.js'
import { isMatrix } from '../../utils/is.js'
import { clone } from '../../utils/object.js'
import { validateIndex } from '../../utils/array.js'

// Type definitions
interface Matrix {
  size(): number[]
  subset(index: any): any
}

interface Index {
<<<<<<< HEAD
  new (...ranges: any[]): Index
=======
  new (ranges: any[]): Index
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
}

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface MatrixConstructor {
  (data: any[]): Matrix
}

interface Dependencies {
  typed: TypedFunction
  Index: Index
  matrix: MatrixConstructor
  range: TypedFunction
}

const name = 'column'
const dependencies = ['typed', 'Index', 'matrix', 'range']

export const createColumn = /* #__PURE__ */ factory(name, dependencies, ({ typed, Index, matrix, range }: Dependencies) => {
  /**
   * Return a column from a Matrix.
   *
   * Syntax:
   *
   *     math.column(value, index)
   *
   * Example:
   *
   *     // get a column
   *     const d = [[1, 2], [3, 4]]
   *     math.column(d, 1) // returns [[2], [4]]
   *
   * See also:
   *
   *     row
   *
   * @param {Array | Matrix } value   An array or matrix
   * @param {number} column           The index of the column
   * @return {Array | Matrix}         The retrieved column
   */
  return typed(name, {
    'Matrix, number': _column,

    'Array, number': function (value: any[], column: number): any[] {
      return (_column(matrix(clone(value)) as any, column) as any).valueOf()
    }
  })

  /**
   * Retrieve a column of a matrix
   * @param {Matrix } value  A matrix
   * @param {number} column  The index of the column
   * @return {Matrix}        The retrieved column
   */
  function _column (value: Matrix, column: number): Matrix {
    // check dimensions
    if (value.size().length !== 2) {
      throw new Error('Only two dimensional matrix is supported')
    }

    validateIndex(column, value.size()[1])

    const rowRange = range(0, value.size()[0])
    const index = new Index(rowRange, [column])
    const result = value.subset(index)
    // once config.legacySubset just return result
    return isMatrix(result)
      ? result as any
      : matrix([[result]]) as any
  }
})
