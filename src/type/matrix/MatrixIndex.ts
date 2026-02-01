import {
  isArray,
  isMatrix,
  isRange,
  isNumber,
  isString
} from '../../utils/is.ts'
import { clone } from '../../utils/object.ts'
import { isInteger } from '../../utils/number.ts'
import { factory } from '../../utils/factory.ts'
import type { IndexJSON, RangeInterface, MatrixValue } from './types.ts'

const name = 'Index'
const dependencies = ['ImmutableDenseMatrix', 'getMatrixDataType']

/**
 * Type representing a single dimension in an Index.
 * Can be a number, string (for object properties), Range, or ImmutableDenseMatrix.
 *
 * INTENTIONAL structural type: Range is defined as a structural type rather than
 * importing RangeInterface to avoid circular dependencies. The Range class is created
 * in a separate factory and its interface matches this structural definition.
 */
export type IndexDimension =
  | number
  | string
  | ImmutableDenseMatrix
  | {
      size(): number[]
      min(): number | undefined
      max(): number | undefined
      toArray(): number[]
      toString(): string
    }

// Forward declaration for Index class (used in callback type)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IndexClass {
  _dimensions: IndexDimension[]
  _sourceSize: (number | null)[]
  _isScalar: boolean
}

/**
 * Callback function for Index forEach operations
 */
export type IndexForEachCallback = (
  dimension: IndexDimension,
  index: number,
  indexObject: IndexClass
) => void

// Re-export types for backward compatibility
export type { IndexJSON }

/**
 * Interface for ImmutableDenseMatrix (used internally)
 */
interface ImmutableDenseMatrix {
  _data: MatrixValue[]
  _size: number[]
  valueOf(): MatrixValue[]
  size(): number[]
  toArray(): MatrixValue[]
}

export const createIndexClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ ImmutableDenseMatrix, getMatrixDataType }) => {
    /**
     * Helper function to create ImmutableDenseMatrix from array
     */
    function _createImmutableMatrix(arg: number[]): ImmutableDenseMatrix {
      // loop array elements
      for (let i = 0, l = arg.length; i < l; i++) {
        if (!isNumber(arg[i]) || !isInteger(arg[i])) {
          throw new TypeError(
            'Index parameters must be positive integer numbers'
          )
        }
      }
      // create matrix
      const matrix = new ImmutableDenseMatrix() as ImmutableDenseMatrix
      matrix._data = arg
      matrix._size = [arg.length]
      return matrix
    }

    /**
     * Create an index. An Index can store ranges and sets for multiple dimensions.
     * Matrix.get, Matrix.set, and math.subset accept an Index as input.
     *
     * Usage:
     *     const index = new Index(range1, range2, matrix1, array1, ...)
     *
     * Where each parameter can be any of:
     *     A number
     *     A string (containing a name of an object property)
     *     An instance of Range
     *     An Array with the Set values
     *     An Array with Booleans
     *     A Matrix with the Set values
     *     A Matrix with Booleans
     *
     * The parameters start, end, and step must be integer numbers.
     *
     * @class Index
     * @Constructor Index
     * @param {...*} ranges
     */
    class Index {
      /**
       * Type identifier
       */
      readonly type: string = 'Index'

      /**
       * Index type flag
       */
      readonly isIndex: boolean = true

      /**
       * Internal array of dimensions
       * @internal
       */
      _dimensions: IndexDimension[]

      /**
       * Source sizes for boolean array conversions
       * @internal
       */
      _sourceSize: (number | null)[]

      /**
       * Flag indicating if this index represents a scalar value
       * @internal
       */
      _isScalar: boolean

      constructor(...ranges: any[]) {
        if (!(this instanceof Index)) {
          throw new SyntaxError(
            'Constructor must be called with the new operator'
          )
        }

        this._dimensions = []
        this._sourceSize = []
        this._isScalar = true

        for (let i = 0, ii = ranges.length; i < ii; i++) {
          const arg = ranges[i]
          const argIsArray = isArray(arg)
          const argIsMatrix = isMatrix(arg)
          const argType = typeof arg
          let sourceSize: number | null = null
          if (isRange(arg)) {
            // Cast to IndexDimension since isRange confirms it has the required properties
            this._dimensions.push(arg as unknown as IndexDimension)
            this._isScalar = false
          } else if (argIsArray || argIsMatrix) {
            // create matrix
            let m: ImmutableDenseMatrix
            this._isScalar = false

            if (getMatrixDataType(arg) === 'boolean') {
              if (argIsArray)
                m = _createImmutableMatrix(
                  _booleansArrayToNumbersForIndex(arg as any)
                )
              if (argIsMatrix)
                m = _createImmutableMatrix(
                  _booleansArrayToNumbersForIndex((arg as any)._data)
                )
              sourceSize = (arg.valueOf() as any).length
            } else {
              m = _createImmutableMatrix(arg.valueOf() as any)
            }

            this._dimensions.push(m!)
          } else if (argType === 'number') {
            this._dimensions.push(arg as number)
          } else if (argType === 'bigint') {
            this._dimensions.push(Number(arg))
          } else if (argType === 'string') {
            // object property (arguments.count should be 1)
            this._dimensions.push(arg as string)
          } else {
            throw new TypeError(
              'Dimension must be an Array, Matrix, number, bigint, string, or Range'
            )
          }
          this._sourceSize.push(sourceSize)
          // TODO: implement support for wildcard '*'
        }
      }

      /**
       * Create a clone of the index
       * @memberof Index
       * @return {Index} clone
       */
      clone(): Index {
        const index = new Index()
        index._dimensions = clone(this._dimensions)
        index._isScalar = this._isScalar
        index._sourceSize = this._sourceSize
        return index
      }

      /**
       * Create an index from an array with ranges/numbers
       * @memberof Index
       * @param {Array.<Array | number>} ranges
       * @return {Index} index
       * @private
       */
      static create(ranges: any[]): Index {
        return new Index(...ranges)
      }

      /**
       * Retrieve the size of the index, the number of elements for each dimension.
       * @memberof Index
       * @returns {number[]} size
       */
      size(): number[] {
        const size: number[] = []

        for (let i = 0, ii = this._dimensions.length; i < ii; i++) {
          const d = this._dimensions[i]
          size[i] =
            isString(d) || isNumber(d)
              ? 1
              : (d as RangeInterface | ImmutableDenseMatrix).size()[0]
        }

        return size
      }

      /**
       * Get the maximum value for each of the indexes ranges.
       * @memberof Index
       * @returns {number[]} max
       */
      max(): (number | string | undefined)[] {
        const values: (number | string | undefined)[] = []

        for (let i = 0, ii = this._dimensions.length; i < ii; i++) {
          const range = this._dimensions[i]
          values[i] =
            isString(range) || isNumber(range)
              ? (range as number | string)
              : (range as RangeInterface).max()
        }

        return values
      }

      /**
       * Get the minimum value for each of the indexes ranges.
       * @memberof Index
       * @returns {number[]} min
       */
      min(): (number | string | undefined)[] {
        const values: (number | string | undefined)[] = []

        for (let i = 0, ii = this._dimensions.length; i < ii; i++) {
          const range = this._dimensions[i]
          values[i] =
            isString(range) || isNumber(range)
              ? (range as number | string)
              : (range as RangeInterface).min()
        }

        return values
      }

      /**
       * Loop over each of the ranges of the index
       * @memberof Index
       * @param {Function} callback Called for each range with a Range as first
       *                            argument, the dimension as second, and the
       *                            index object as third.
       */
      forEach(callback: IndexForEachCallback): void {
        for (let i = 0, ii = this._dimensions.length; i < ii; i++) {
          callback(this._dimensions[i], i, this)
        }
      }

      /**
       * Retrieve the dimension for the given index
       * @memberof Index
       * @param {Number} dim Number of the dimension
       * @returns {Range | null} range
       */
      dimension(dim: number): IndexDimension | null {
        if (!isNumber(dim)) {
          return null
        }

        return this._dimensions[dim] ?? null
      }

      /**
       * Test whether this index contains an object property
       * @returns {boolean} Returns true if the index is an object property
       */
      isObjectProperty(): boolean {
        return this._dimensions.length === 1 && isString(this._dimensions[0])
      }

      /**
       * Returns the object property name when the Index holds a single object property,
       * else returns null
       * @returns {string | null}
       */
      getObjectProperty(): string | null {
        return this.isObjectProperty() ? (this._dimensions[0] as string) : null
      }

      /**
       * Test whether this index contains only a single value.
       *
       * This is the case when the index is created with only scalar values as ranges,
       * not for ranges resolving into a single value.
       * @memberof Index
       * @return {boolean} isScalar
       */
      isScalar(): boolean {
        return this._isScalar
      }

      /**
       * Expand the Index into an array.
       * For example new Index([0,3], [2,7]) returns [[0,1,2], [2,3,4,5,6]]
       * @memberof Index
       * @returns {Array} array
       */
      toArray(): any[] {
        const array: any[] = []
        for (let i = 0, ii = this._dimensions.length; i < ii; i++) {
          const dimension = this._dimensions[i]
          array.push(
            isString(dimension) || isNumber(dimension)
              ? dimension
              : (dimension as RangeInterface | ImmutableDenseMatrix).toArray()
          )
        }
        return array
      }

      /**
       * Get the primitive value of the Index, a two dimensional array.
       * Equivalent to Index.toArray().
       * @memberof Index
       * @returns {Array} array
       */
      valueOf(): any[] {
        return this.toArray()
      }

      /**
       * Get the string representation of the index, for example '[2:6]' or '[0:2:10, 4:7, [1,2,3]]'
       * @memberof Index
       * @returns {String} str
       */
      toString(): string {
        const strings: string[] = []

        for (let i = 0, ii = this._dimensions.length; i < ii; i++) {
          const dimension = this._dimensions[i]
          if (isString(dimension)) {
            strings.push(JSON.stringify(dimension))
          } else {
            strings.push((dimension as any).toString())
          }
        }

        return '[' + strings.join(', ') + ']'
      }

      /**
       * Get a JSON representation of the Index
       * @memberof Index
       * @returns {Object} Returns a JSON object structured as:
       *                   `{"mathjs": "Index", "ranges": [{"mathjs": "Range", start: 0, end: 10, step:1}, ...]}`
       */
      toJSON(): IndexJSON {
        return {
          mathjs: 'Index',
          dimensions: this._dimensions
        }
      }

      /**
       * Instantiate an Index from a JSON object
       * @memberof Index
       * @param {Object} json A JSON object structured as:
       *                     `{"mathjs": "Index", "dimensions": [{"mathjs": "Range", start: 0, end: 10, step:1}, ...]}`
       * @return {Index}
       */
      static fromJSON(json: IndexJSON): Index {
        return Index.create(json.dimensions)
      }
    }

    // Set prototype properties for type checking (duck typing)
    // These are needed because is.ts checks constructor.prototype.isIndex
    ;(Index.prototype as any).type = 'Index'
    ;(Index.prototype as any).isIndex = true

    return Index
  },
  { isClass: true }
)

/**
 * Receives an array of booleans and returns an array of Numbers for Index
 * @param {Array} booleanArrayIndex An array of booleans
 * @return {Array} A set of numbers ready for index
 */
function _booleansArrayToNumbersForIndex(
  booleanArrayIndex: boolean[]
): number[] {
  // gets an array of booleans and returns an array of numbers
  const indexOfNumbers: number[] = []
  booleanArrayIndex.forEach((bool, idx) => {
    if (bool) {
      indexOfNumbers.push(idx)
    }
  })
  return indexOfNumbers
}
