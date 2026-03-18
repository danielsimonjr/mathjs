import { isBigNumber } from '../../utils/is.ts'
import { isInteger } from '../../utils/number.ts'
import { resize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'

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
}

interface MatrixConstructor {
  (data?: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
  (storage?: 'dense' | 'sparse'): Matrix
}

interface Matrix {
  _size: number[]
  storage(): 'dense' | 'sparse'
  valueOf(): any[] | any[][]
  resize(size: number[], defaultValue: any): Matrix
}

interface Config {
  matrix: 'Array' | 'Matrix'
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  matrix: MatrixConstructor
  BigNumber: BigNumberConstructor
}

const name = 'zeros'
const dependencies = ['typed', 'config', 'matrix', 'BigNumber']

export const createZeros = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, matrix, BigNumber }: Dependencies) => {
    /**
     * Create a matrix filled with zeros. The created matrix can have one or
     * multiple dimensions.
     *
     * Syntax:
     *
     *    math.zeros(m)
     *    math.zeros(m, format)
     *    math.zeros(m, n)
     *    math.zeros(m, n, format)
     *    math.zeros([m, n])
     *    math.zeros([m, n], format)
     *
     * Examples:
     *
     *    math.zeros()                   // returns []
     *    math.zeros(3)                  // returns [0, 0, 0]
     *    math.zeros(3, 2)               // returns [[0, 0], [0, 0], [0, 0]]
     *    math.zeros(3, 'dense')         // returns [0, 0, 0]
     *
     *    const A = [[1, 2, 3], [4, 5, 6]]
     *    math.zeros(math.size(A))       // returns [[0, 0, 0], [0, 0, 0]]
     *
     * See also:
     *
     *    ones, identity, size, range
     *
     * @param {...(number|BigNumber) | Array} size    The size of each dimension of the matrix
     * @param {string} [format]           The Matrix storage format
     *
     * @return {Array | Matrix}           A matrix filled with zeros
     */
    return typed(name, {
      '': function (): any[] | Matrix {
        return config.matrix === 'Array' ? _zeros([]) : _zeros([], 'default')
      },

      // math.zeros(m, n, p, ..., format)
      // TODO: more accurate signature '...number | BigNumber, string' as soon as typed-function supports this
      '...number | BigNumber | string': function (
        size: (number | BigNumber | string)[]
      ): any[] | Matrix {
        const last = size[size.length - 1]
        if (typeof last === 'string') {
          const format = size.pop() as string
          return _zeros(size as (number | BigNumber)[], format)
        } else if (config.matrix === 'Array') {
          return _zeros(size as (number | BigNumber)[])
        } else {
          return _zeros(size as (number | BigNumber)[], 'default')
        }
      },

      Array: _zeros,

      Matrix: function (size: Matrix): Matrix {
        const format = size.storage()
        return _zeros(size.valueOf() as number[], format) as Matrix
      },

      'Array | Matrix, string': function (
        size: any[] | Matrix,
        format: string
      ): Matrix {
        const sizeArray = Array.isArray(size)
          ? size
          : (size as Matrix).valueOf()
        return _zeros(sizeArray as number[], format) as Matrix
      }
    })

    /**
     * Create an Array or Matrix with zeros
     * @param {Array} size
     * @param {string} [format='default']
     * @return {Array | Matrix}
     * @private
     */
    function _zeros(
      size: any[] | (number | BigNumber)[],
      format?: string
    ): any[] | Matrix {
      const hasBigNumbers = _normalize(size as number[])
      const defaultValue = hasBigNumbers ? new BigNumber(0) : 0
      _validate(size as number[])

      if (format) {
        // return a matrix
        const m = (matrix as any)(format)
        if ((size as number[]).length > 0) {
          return m.resize(size as number[], defaultValue)
        }
        return m
      } else {
        // return an Array
        const arr: any[] = []
        if ((size as number[]).length > 0) {
          return resize(arr, size as number[], defaultValue)
        }
        return arr
      }
    }

    // replace BigNumbers with numbers, returns true if size contained BigNumbers
    function _normalize(size: number[]): boolean {
      let hasBigNumbers = false
      size.forEach(function (value: any, index: number, arr: any[]) {
        if (isBigNumber(value)) {
          hasBigNumbers = true
          arr[index] = (value as any).toNumber()
        }
      })
      return hasBigNumbers
    }

    // validate arguments
    function _validate(size: number[]): void {
      size.forEach(function (value: any) {
        if (typeof value !== 'number' || !isInteger(value) || value < 0) {
          throw new Error(
            'Parameters in function zeros must be positive integers'
          )
        }
      })
    }
  }
)

// TODO: zeros contains almost the same code as ones. Reuse this?
