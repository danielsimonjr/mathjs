import { factory } from '../../utils/factory.ts'

const name = 'Matrix'
const dependencies: string[] = []

/**
 * Formatting options for matrix display
 */
export interface MatrixFormatOptions {
  precision?: number
  notation?: 'fixed' | 'exponential' | 'engineering' | 'auto'
  [key: string]: any
}

/**
 * Callback function for matrix forEach operations
 */
export type MatrixForEachCallback<T> = (
  value: T,
  index: number[],
  matrix: any
) => void

/**
 * Callback function for matrix map operations
 */
export type MatrixMapCallback<T, U> = (
  value: T,
  index: number[],
  matrix: any
) => U

/**
 * Index type for matrix subsetting - can be an Index object or array
 */
export interface Index {
  dimension(dim: number): any
  isScalar(): boolean
  size(): number[]
  min(): any[]
  max(): any[]
  valueOf(): any
  clone(): Index
  toArray(): any[]
  isObjectProperty(): boolean
  getObjectProperty(): string | null
}

/**
 * Matrix data can be a nested array structure
 */
export type MatrixData = any[] | any[][] | any[][][] | any[][][][]

export const createMatrixClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  () => {
    /**
     * @constructor Matrix
     *
     * A Matrix is a wrapper around an Array. A matrix can hold a multi dimensional
     * array. A matrix can be constructed as:
     *
     *     let matrix = math.matrix(data)
     *
     * Matrix contains the functions to resize, get and set values, get the size,
     * clone the matrix and to convert the matrix to a vector, array, or scalar.
     * Furthermore, one can iterate over the matrix using map and forEach.
     * The internal Array of the Matrix can be accessed using the function valueOf.
     *
     * Example usage:
     *
     *     let matrix = math.matrix([[1, 2], [3, 4]])
     *     matix.size()              // [2, 2]
     *     matrix.resize([3, 2], 5)
     *     matrix.valueOf()          // [[1, 2], [3, 4], [5, 5]]
     *     matrix.subset([1,2])       // 3 (indexes are zero-based)
     *
     * @template T The type of elements stored in the matrix
     */
    class Matrix<T = any> {
      /**
       * Type identifier
       */
      readonly type: string = 'Matrix'

      /**
       * Matrix type flag
       */
      readonly isMatrix: boolean = true

      constructor() {
        if (!(this instanceof Matrix)) {
          throw new SyntaxError(
            'Constructor must be called with the new operator'
          )
        }
      }

      /**
       * Get the storage format used by the matrix.
       *
       * Usage:
       *     const format = matrix.storage()   // retrieve storage format
       *
       * @return {string} The storage format.
       */
      storage(): string {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke storage on a Matrix interface')
      }

      /**
       * Get the datatype of the data stored in the matrix.
       *
       * Usage:
       *     const format = matrix.datatype()    // retrieve matrix datatype
       *
       * @return {string} The datatype.
       */
      datatype(): string {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke datatype on a Matrix interface')
      }

      /**
       * Create a new Matrix With the type of the current matrix instance
       * @param {Array | Object} data
       * @param {string} [datatype]
       */
      create(_data: MatrixData | object, _datatype?: string): Matrix<T> {
        throw new Error('Cannot invoke create on a Matrix interface')
      }

      /**
       * Get a subset of the matrix, or replace a subset of the matrix.
       *
       * Usage:
       *     const subset = matrix.subset(index)               // retrieve subset
       *     const value = matrix.subset(index, replacement)   // replace subset
       *
       * @param {Index} index
       * @param {Array | Matrix | *} [replacement]
       * @param {*} [defaultValue=0] Default value, filled in on new entries when
       *                             the matrix is resized. If not provided,
       *                             new matrix elements will be filled with zeros.
       */
      subset(
        _index: Index,
        _replacement?: MatrixData | Matrix<T> | T,
        _defaultValue?: T
      ): Matrix<T> | T {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke subset on a Matrix interface')
      }

      /**
       * Get a single element from the matrix.
       * @param {number[]} index Zero-based index
       * @return {*} value
       */
      get(_index: number[]): T {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke get on a Matrix interface')
      }

      /**
       * Replace a single element in the matrix.
       * @param {number[]} index Zero-based index
       * @param {*} value
       * @param {*} [defaultValue] Default value, filled in on new entries when
       *                           the matrix is resized. If not provided,
       *                           new matrix elements will be left undefined.
       * @return {Matrix} self
       */
      set(_index: number[], _value: T, _defaultValue?: T): Matrix<T> {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke set on a Matrix interface')
      }

      /**
       * Resize the matrix to the given size. Returns a copy of the matrix when
       * `copy=true`, otherwise return the matrix itself (resize in place).
       *
       * @param {number[]} size The new size the matrix should have.
       * @param {*} [defaultValue=0] Default value, filled in on new entries.
       *                             If not provided, the matrix elements will
       *                             be filled with zeros.
       * @param {boolean} [copy] Return a resized copy of the matrix
       *
       * @return {Matrix} The resized matrix
       */
      resize(_size: number[], _defaultValue?: T, _copy?: boolean): Matrix<T> {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke resize on a Matrix interface')
      }

      /**
       * Reshape the matrix to the given size. Returns a copy of the matrix when
       * `copy=true`, otherwise return the matrix itself (reshape in place).
       *
       * @param {number[]} size The new size the matrix should have.
       * @param {boolean} [copy] Return a reshaped copy of the matrix
       *
       * @return {Matrix} The reshaped matrix
       */
      reshape(_size: number[], _copy?: boolean): Matrix<T> {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke reshape on a Matrix interface')
      }

      /**
       * Create a clone of the matrix
       * @return {Matrix} clone
       */
      clone(): Matrix<T> {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke clone on a Matrix interface')
      }

      /**
       * Retrieve the size of the matrix.
       * @returns {number[]} size
       */
      size(): number[] {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke size on a Matrix interface')
      }

      /**
       * Create a new matrix with the results of the callback function executed on
       * each entry of the matrix.
       * @param {Function} callback The callback function is invoked with three
       *                            parameters: the value of the element, the index
       *                            of the element, and the Matrix being traversed.
       * @param {boolean} [skipZeros] Invoke callback function for non-zero values only.
       *
       * @return {Matrix} matrix
       */
      map<U>(
        _callback: MatrixMapCallback<T, U>,
        _skipZeros?: boolean
      ): Matrix<U> {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke map on a Matrix interface')
      }

      /**
       * Execute a callback function on each entry of the matrix.
       * @param {Function} callback The callback function is invoked with three
       *                            parameters: the value of the element, the index
       *                            of the element, and the Matrix being traversed.
       */
      forEach(_callback: MatrixForEachCallback<T>): void {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke forEach on a Matrix interface')
      }

      /**
       * Iterate over the matrix elements
       * @return {Iterable<{ value, index: number[] }>}
       */
      [Symbol.iterator](): Iterator<{ value: T; index: number[] }> {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot iterate a Matrix interface')
      }

      /**
       * Create an Array with a copy of the data of the Matrix
       * @returns {Array} array
       */
      toArray(): MatrixData {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke toArray on a Matrix interface')
      }

      /**
       * Get the primitive value of the Matrix: a multidimensional array
       * @returns {Array} array
       */
      valueOf(): MatrixData {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke valueOf on a Matrix interface')
      }

      /**
       * Get a string representation of the matrix, with optional formatting options.
       * @param {Object | number | Function} [options] Formatting options. See
       *                                               lib/utils/number:format for a
       *                                               description of the available
       *                                               options.
       * @returns {string} str
       */
      format(
        _options?: MatrixFormatOptions | number | ((value: T) => string)
      ): string {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke format on a Matrix interface')
      }

      /**
       * Get a string representation of the matrix
       * @returns {string} str
       */
      toString(): string {
        // must be implemented by each of the Matrix implementations
        throw new Error('Cannot invoke toString on a Matrix interface')
      }
    }

    return Matrix
  },
  { isClass: true }
)
