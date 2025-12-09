import { arraySize } from '../../utils/array.js'
import { factory } from '../../utils/factory.js'
import { noMatrix } from '../../utils/noop.js'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface MatrixConstructor {
  (data: any[], storage?: 'dense' | 'sparse', datatype?: string): Matrix
}

interface Matrix {
  size(): number[]
  create(data: number[], datatype?: string): Matrix
}

interface Config {
  matrix: 'Array' | 'Matrix'
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  matrix?: MatrixConstructor
}

const name = 'size'
const dependencies = ['typed', 'config', '?matrix']

export const createSize = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, matrix }: Dependencies) => {
  /**
   * Calculate the size of a matrix or scalar.
   *
   * Syntax:
   *
   *     math.size(x)
   *
   * Examples:
   *
   *     math.size(2.3)                       // returns []
   *     math.size('hello world')             // returns [11]
   *
   *     const A = [[1, 2, 3], [4, 5, 6]]
   *     math.size(A)                         // returns [2, 3]
   *     math.size(math.range(1,6).toArray()) // returns [5]
   *
   * See also:
   *
   *     count, resize, squeeze, subset
   *
   * @param {boolean | number | Complex | Unit | string | Array | Matrix} x  A matrix
   * @return {Array | Matrix} A vector with size of `x`.
   */
  return typed(name, {
    Matrix: function (x: Matrix): Matrix {
      return x.create(x.size(), 'number')
    },

    Array: arraySize,

    string: function (x: string): number[] | Matrix {
      return (config.matrix === 'Array') ? [x.length] : matrix!([x.length], 'dense', 'number')
    },

    'number | Complex | BigNumber | Unit | boolean | null': function (x: any): any[] | Matrix {
      // scalar
      return (config.matrix === 'Array')
        ? []
        : matrix ? matrix([], 'dense', 'number') as any[] | Matrix : noMatrix()
    }
  })
})
