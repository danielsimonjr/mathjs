import { isArray, isMatrix, isString, typeOf } from '../../utils/is.ts'
import { clone } from '../../utils/object.ts'
import { factory } from '../../utils/factory.ts'

const name = 'ImmutableDenseMatrix'
const dependencies = [
  'smaller',
  'DenseMatrix'
]

/**
 * Type for nested array data structures
 */
type NestedArray<T = any> = T | NestedArray<T>[]
type MatrixData = NestedArray<any>

/**
 * Interface for Index objects
 */
interface Index {
  isIndex: true
  size(): number[]
  min(): number[]
  max(): number[]
  dimension(dim: number): any
  isScalar(): boolean
  forEach(callback: (value: number, index: number[]) => void): void
  valueOf(): number[][]
}

/**
 * Interface for DenseMatrix
 */
interface DenseMatrix {
  type: string
  isDenseMatrix: boolean
  _data: MatrixData
  _size: number[]
  _datatype?: string
  storage(): string
  datatype(): string | undefined
  size(): number[]
  clone(): DenseMatrix
  toArray(): MatrixData
  valueOf(): MatrixData
  subset(index: Index, replacement?: any, defaultValue?: any): any
  forEach(callback: (value: any, index?: number[], matrix?: any) => void): void
}

/**
 * JSON representation of ImmutableDenseMatrix
 */
export interface ImmutableDenseMatrixJSON {
  mathjs: 'ImmutableDenseMatrix'
  data: MatrixData
  size: number[]
  datatype?: string
  min?: any
  max?: any
}

/**
 * Internal constructor data for ImmutableDenseMatrix
 */
interface ImmutableDenseMatrixData {
  data: MatrixData
  size: number[]
  datatype?: string
  min?: any
  max?: any
}

export const createImmutableDenseMatrixClass = /* #__PURE__ */ factory(name, dependencies, ({ smaller, DenseMatrix }) => {
  /**
   * An immutable dense matrix implementation. This is a read-only wrapper around DenseMatrix.
   * Any mutating operations will throw an error.
   *
   * @class ImmutableDenseMatrix
   * @extends DenseMatrix
   */
  class ImmutableDenseMatrix {
    /**
     * Type identifier
     */
    readonly type: string = 'ImmutableDenseMatrix'

    /**
     * ImmutableDenseMatrix type flag
     */
    readonly isImmutableDenseMatrix: boolean = true

    /**
     * Internal matrix data storage
     */
    _data: MatrixData

    /**
     * Size of the matrix
     */
    _size: number[]

    /**
     * Data type of matrix elements
     */
    _datatype?: string

    /**
     * Cached minimum value
     * @internal
     */
    _min: any

    /**
     * Cached maximum value
     * @internal
     */
    _max: any

    constructor(data?: MatrixData | ImmutableDenseMatrixData | any, datatype?: string) {
      if (!(this instanceof ImmutableDenseMatrix)) {
        throw new SyntaxError('Constructor must be called with the new operator')
      }
      if (datatype && !isString(datatype)) {
        throw new Error('Invalid datatype: ' + datatype)
      }

      if (isMatrix(data) || isArray(data)) {
        // use DenseMatrix implementation
        const matrix = new DenseMatrix(data, datatype)
        // internal structures
        this._data = matrix._data
        this._size = matrix._size
        this._datatype = matrix._datatype
        this._min = null
        this._max = null
      } else if (data && isArray((data as ImmutableDenseMatrixData).data) && isArray((data as ImmutableDenseMatrixData).size)) {
        // initialize fields from JSON representation
        const matrixData = data as ImmutableDenseMatrixData
        this._data = matrixData.data
        this._size = matrixData.size
        this._datatype = matrixData.datatype
        this._min = typeof matrixData.min !== 'undefined' ? matrixData.min : null
        this._max = typeof matrixData.max !== 'undefined' ? matrixData.max : null
      } else if (data) {
        // unsupported type
        throw new TypeError('Unsupported type of data (' + typeOf(data) + ')')
      } else {
        // nothing provided
        this._data = []
        this._size = [0]
        this._datatype = datatype
        this._min = null
        this._max = null
      }
    }

    /**
     * Get a subset of the matrix, or replace a subset of the matrix.
     *
     * Usage:
     *     const subset = matrix.subset(index)               // retrieve subset
     *     const value = matrix.subset(index, replacement)   // replace subset
     *
     * @param {Index} index
     * @param {Array | ImmutableDenseMatrix | *} [replacement]
     * @param {*} [defaultValue=0] Default value, filled in on new entries when
     *                             the matrix is resized. If not provided,
     *                             new matrix elements will be filled with zeros.
     */
    subset(index: Index, replacement?: any, defaultValue?: any): ImmutableDenseMatrix | any {
      switch (arguments.length) {
        case 1:
        {
          // use base implementation
          const m = (DenseMatrix.prototype as any).subset.call(this, index)
          // check result is a matrix
          if (isMatrix(m)) {
            // return immutable matrix
            return new ImmutableDenseMatrix({
              data: (m as any)._data,
              size: (m as any)._size,
              datatype: (m as any)._datatype
            })
          }
          return m
        }
        // intentional fall through
        case 2:
        case 3:
          throw new Error('Cannot invoke set subset on an Immutable Matrix instance')

        default:
          throw new SyntaxError('Wrong number of arguments')
      }
    }

    /**
     * Replace a single element in the matrix.
     * @param {Number[]} index Zero-based index
     * @param {*} value
     * @param {*} [defaultValue] Default value, filled in on new entries when
     *                           the matrix is resized. If not provided,
     *                           new matrix elements will be left undefined.
     * @return {ImmutableDenseMatrix} self
     */
    set(index: number[], value: any, defaultValue?: any): ImmutableDenseMatrix {
      throw new Error('Cannot invoke set on an Immutable Matrix instance')
    }

    /**
     * Resize the matrix to the given size. Returns a copy of the matrix when
     * `copy=true`, otherwise return the matrix itself (resize in place).
     *
     * @param {Number[]} size The new size the matrix should have.
     * @param {*} [defaultValue=0] Default value, filled in on new entries.
     *                             If not provided, the matrix elements will
     *                             be filled with zeros.
     * @param {boolean} [copy] Return a resized copy of the matrix
     *
     * @return {Matrix} The resized matrix
     */
    resize(size: number[], defaultValue?: any, copy?: boolean): ImmutableDenseMatrix {
      throw new Error('Cannot invoke resize on an Immutable Matrix instance')
    }

    /**
     * Disallows reshaping in favor of immutability.
     *
     * @throws {Error} Operation not allowed
     */
    reshape(size: number[], copy?: boolean): ImmutableDenseMatrix {
      throw new Error('Cannot invoke reshape on an Immutable Matrix instance')
    }

    /**
     * Create a clone of the matrix
     * @return {ImmutableDenseMatrix} clone
     */
    clone(): ImmutableDenseMatrix {
      return new ImmutableDenseMatrix({
        data: clone(this._data),
        size: clone(this._size),
        datatype: this._datatype
      })
    }

    /**
     * Get a JSON representation of the matrix
     * @returns {Object}
     */
    toJSON(): ImmutableDenseMatrixJSON {
      return {
        mathjs: 'ImmutableDenseMatrix',
        data: this._data,
        size: this._size,
        datatype: this._datatype
      }
    }

    /**
     * Generate a matrix from a JSON object
     * @param {Object} json An object structured like
     *                      `{"mathjs": "ImmutableDenseMatrix", data: [], size: []}`,
     *                      where mathjs is optional
     * @returns {ImmutableDenseMatrix}
     */
    static fromJSON(json: ImmutableDenseMatrixJSON): ImmutableDenseMatrix {
      return new ImmutableDenseMatrix(json)
    }

    /**
     * Swap rows i and j in Matrix.
     *
     * @param {Number} i Matrix row index 1
     * @param {Number} j Matrix row index 2
     *
     * @return {Matrix} The matrix reference
     */
    swapRows(i: number, j: number): ImmutableDenseMatrix {
      throw new Error('Cannot invoke swapRows on an Immutable Matrix instance')
    }

    /**
     * Calculate the minimum value in the set
     * @return {Number | undefined} min
     */
    min(): any {
      // check min has been calculated before
      if (this._min === null) {
        // minimum
        let m: any = null
        // compute min
        const smallerFn = smaller as any
        ;(DenseMatrix.prototype as any).forEach.call(this, function (v: any) {
          if (m === null || smallerFn(v, m)) { m = v }
        })
        this._min = m !== null ? m : undefined
      }
      return this._min
    }

    /**
     * Calculate the maximum value in the set
     * @return {Number | undefined} max
     */
    max(): any {
      // check max has been calculated before
      if (this._max === null) {
        // maximum
        let m: any = null
        // compute max
        const smallerFn = smaller as any
        ;(DenseMatrix.prototype as any).forEach.call(this, function (v: any) {
          if (m === null || smallerFn(m, v)) { m = v }
        })
        this._max = m !== null ? m : undefined
      }
      return this._max
    }
  }

  // Set up prototype chain to inherit from DenseMatrix
  Object.setPrototypeOf(ImmutableDenseMatrix.prototype, DenseMatrix.prototype)
  ;(ImmutableDenseMatrix.prototype as any).constructor = ImmutableDenseMatrix

  // Override type information
  ;(ImmutableDenseMatrix.prototype as any).type = 'ImmutableDenseMatrix'
  ;(ImmutableDenseMatrix.prototype as any).isImmutableDenseMatrix = true

  return ImmutableDenseMatrix
}, { isClass: true })
