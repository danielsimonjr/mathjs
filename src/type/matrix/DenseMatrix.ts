// deno-lint-ignore-file no-this-alias
import {
  isArray,
  isBigNumber,
  isCollection,
  isIndex,
  isMatrix,
  isNumber,
  isString,
  typeOf
} from '../../utils/is.ts'
import {
  arraySize,
  getArrayDataType,
  processSizesWildcard,
  reshape,
  resize,
  unsqueeze,
  validate,
  validateIndex,
  broadcastTo,
  get
} from '../../utils/array.ts'
import { format } from '../../utils/string.ts'
import { isInteger } from '../../utils/number.ts'
import { clone, deepStrictEqual } from '../../utils/object.ts'
import { DimensionError } from '../../error/DimensionError.ts'
import { factory } from '../../utils/factory.ts'
import { optimizeCallback } from '../../utils/optimizeCallback.ts'

// Type definitions
type NestedArray<T = any> = T | NestedArray<T>[]
type MatrixData = NestedArray<any>

interface Index {
  isIndex: true
  size(): number[]
  min(): number[]
  max(): number[]
  dimension(dim: number): any
  isScalar(): boolean
  forEach(callback: (value: number, index: number[]) => void): void
  map(callback: (value: number) => any): any
  valueOf(): number[][]
}

interface Matrix {
  type: string
  storage(): string
  datatype(): string | undefined
  create(data: MatrixData, datatype?: string): Matrix
  size(): number[]
  clone(): Matrix
  toArray(): MatrixData
  valueOf(): MatrixData
  _data?: MatrixData
  _size?: number[]
  _datatype?: string
  isDenseMatrix?: boolean
  get(index: number[]): any
  set(index: number[], value: any, defaultValue?: any): Matrix
  subset(index: Index, replacement?: any, defaultValue?: any): any
  resize(size: number[] | Matrix, defaultValue?: any, copy?: boolean): Matrix
  reshape(size: number[], copy?: boolean): Matrix
  map(callback: MapCallback, skipZeros?: boolean, isUnary?: boolean): Matrix
  forEach(
    callback: ForEachCallback,
    skipZeros?: boolean,
    isUnary?: boolean
  ): void
  rows?(): Matrix[]
  columns?(): Matrix[]
  format?(options?: any): string
  toString?(): string
  toJSON?(): MatrixJSON
  diagonal?(k?: number | any): Matrix
  swapRows?(i: number, j: number): Matrix
  [Symbol.iterator]?(): IterableIterator<MatrixEntry>
}

interface MatrixJSON {
  mathjs: string
  data: MatrixData
  size: number[]
  datatype?: string
}

interface MatrixEntry {
  value: any
  index: number[]
}

type MapCallback = (value: any, index?: number[], matrix?: any) => any
type ForEachCallback = (value: any, index?: number[], matrix?: any) => void

interface DenseMatrixConstructorData {
  data: MatrixData
  size: number[]
  datatype?: string
}

interface OptimizedCallback {
  fn: Function
  isUnary: boolean
}

const name = 'DenseMatrix'
const dependencies = ['Matrix']

export const createDenseMatrixClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ Matrix }: { Matrix: any }) => {
    /**
     * Dense Matrix implementation. A regular, dense matrix, supporting multi-dimensional matrices. This is the default matrix type.
     * @class DenseMatrix
     * @enum {{ value, index: number[] }}
     */
    class DenseMatrix implements Matrix {
      type: string = 'DenseMatrix'
      isDenseMatrix: boolean = true
      _data: MatrixData
      _size: number[]
      _datatype?: string

      constructor(
        data?: MatrixData | Matrix | DenseMatrixConstructorData | null,
        datatype?: string
      ) {
        if (!(this instanceof DenseMatrix)) {
          throw new SyntaxError(
            'Constructor must be called with the new operator'
          )
        }
        if (datatype && !isString(datatype)) {
          throw new Error('Invalid datatype: ' + datatype)
        }

        if (isMatrix(data)) {
          // check data is a DenseMatrix
          if ((data as any).type === 'DenseMatrix') {
            // clone data & size
            this._data = clone((data as any)._data!)
            this._size = clone((data as any)._size!)
            this._datatype = datatype || (data as any)._datatype
          } else {
            // build data from existing matrix
            this._data = (data as any).toArray()
            this._size = (data as any).size()
            this._datatype = datatype || (data as any)._datatype
          }
        } else if (
          data &&
          isArray((data as DenseMatrixConstructorData).data) &&
          isArray((data as DenseMatrixConstructorData).size)
        ) {
          // initialize fields from JSON representation
          const constructorData = data as DenseMatrixConstructorData
          this._data = constructorData.data
          this._size = constructorData.size
          // verify the dimensions of the array
          validate(this._data, this._size)
          this._datatype = datatype || constructorData.datatype
        } else if (isArray(data)) {
          // replace nested Matrices with Arrays
          this._data = preprocess(data as MatrixData)
          // get the dimensions of the array
          this._size = arraySize(this._data)
          // verify the dimensions of the array, TODO: compute size while processing array
          validate(this._data, this._size)
          // data type unknown
          this._datatype = datatype
        } else if (data) {
          // unsupported type
          throw new TypeError('Unsupported type of data (' + typeOf(data) + ')')
        } else {
          // nothing provided
          this._data = []
          this._size = [0]
          this._datatype = datatype
        }
      }

      /**
       * Create a new DenseMatrix
       */
      createDenseMatrix(data?: MatrixData, datatype?: string): DenseMatrix {
        return new DenseMatrix(data, datatype)
      }

      /**
       * Get the matrix type
       *
       * Usage:
       *    const matrixType = matrix.getDataType()  // retrieves the matrix type
       *
       * @memberOf DenseMatrix
       * @return {string}   type information; if multiple types are found from the Matrix, it will return "mixed"
       */
      getDataType(): string {
        return getArrayDataType(this._data, typeOf)
      }

      /**
       * Get the storage format used by the matrix.
       *
       * Usage:
       *     const format = matrix.storage()  // retrieve storage format
       *
       * @memberof DenseMatrix
       * @return {string}           The storage format.
       */
      storage(): string {
        return 'dense'
      }

      /**
       * Get the datatype of the data stored in the matrix.
       *
       * Usage:
       *     const format = matrix.datatype()   // retrieve matrix datatype
       *
       * @memberof DenseMatrix
       * @return {string}           The datatype.
       */
      datatype(): string | undefined {
        return this._datatype
      }

      /**
       * Create a new DenseMatrix
       * @memberof DenseMatrix
       * @param {Array} data
       * @param {string} [datatype]
       */
      create(data?: MatrixData, datatype?: string): DenseMatrix {
        return new DenseMatrix(data, datatype)
      }

      /**
       * Get a subset of the matrix, or replace a subset of the matrix.
       *
       * Usage:
       *     const subset = matrix.subset(index)               // retrieve subset
       *     const value = matrix.subset(index, replacement)   // replace subset
       *
       * @memberof DenseMatrix
       * @param {Index} index
       * @param {Array | Matrix | *} [replacement]
       * @param {*} [defaultValue=0]      Default value, filled in on new entries when
       *                                  the matrix is resized. If not provided,
       *                                  new matrix elements will be filled with zeros.
       */
      subset(index: Index, replacement?: any, defaultValue?: any): any {
        switch (arguments.length) {
          case 1:
            return _get(this, index)

          // intentional fall through
          case 2:
          case 3:
            return _set(this, index, replacement, defaultValue)

          default:
            throw new SyntaxError('Wrong number of arguments')
        }
      }

      /**
       * Get a single element from the matrix.
       * @memberof DenseMatrix
       * @param {number[]} index   Zero-based index
       * @return {*} value
       */
      get(index: number[]): any {
        return get(this._data, index)
      }

      /**
       * Replace a single element in the matrix.
       * @memberof DenseMatrix
       * @param {number[]} index   Zero-based index
       * @param {*} value
       * @param {*} [defaultValue]        Default value, filled in on new entries when
       *                                  the matrix is resized. If not provided,
       *                                  new matrix elements will be left undefined.
       * @return {DenseMatrix} self
       */
      set(index: number[], value: any, defaultValue?: any): DenseMatrix {
        if (!isArray(index)) {
          throw new TypeError('Array expected')
        }
        if (index.length < this._size.length) {
          throw new DimensionError(index.length, this._size.length, '<')
        }

        let i: number, ii: number, indexI: number

        // enlarge matrix when needed
        const size = index.map(function (i) {
          return i + 1
        })
        _fit(this, size, defaultValue)

        // traverse over the dimensions
        let data: any = this._data
        for (i = 0, ii = index.length - 1; i < ii; i++) {
          indexI = index[i]
          validateIndex(indexI, data.length)
          data = data[indexI]
        }

        // set new value
        indexI = index[index.length - 1]
        validateIndex(indexI, data.length)
        data[indexI] = value

        return this
      }

      /**
       * Resize the matrix to the given size. Returns a copy of the matrix when
       * `copy=true`, otherwise return the matrix itself (resize in place).
       *
       * @memberof DenseMatrix
       * @param {number[] || Matrix} size The new size the matrix should have.
       * @param {*} [defaultValue=0]      Default value, filled in on new entries.
       *                                  If not provided, the matrix elements will
       *                                  be filled with zeros.
       * @param {boolean} [copy]          Return a resized copy of the matrix
       *
       * @return {Matrix}                 The resized matrix
       */
      resize(
        size: number[] | Matrix,
        defaultValue?: any,
        copy?: boolean
      ): DenseMatrix | any {
        // validate arguments
        if (!isCollection(size)) {
          throw new TypeError('Array or Matrix expected')
        }

        // SparseMatrix input is always 2d, flatten this into 1d if it's indeed a vector
        const sizeArray = (size as any).valueOf().map((value: any) => {
          return Array.isArray(value) && value.length === 1 ? value[0] : value
        })

        // matrix to resize
        const m = copy ? this.clone() : this
        // resize matrix
        return _resize(m, sizeArray, defaultValue)
      }

      /**
       * Reshape the matrix to the given size. Returns a copy of the matrix when
       * `copy=true`, otherwise return the matrix itself (reshape in place).
       *
       * NOTE: This might be better suited to copy by default, instead of modifying
       *       in place. For now, it operates in place to remain consistent with
       *       resize().
       *
       * @memberof DenseMatrix
       * @param {number[]} size           The new size the matrix should have.
       * @param {boolean} [copy]          Return a reshaped copy of the matrix
       *
       * @return {Matrix}                 The reshaped matrix
       */
      reshape(size: number[], copy?: boolean): DenseMatrix {
        const m = copy ? this.clone() : this

        m._data = reshape(m._data, size)
        const currentLength = m._size.reduce((length, size) => length * size)
        m._size = processSizesWildcard(size, currentLength)
        return m
      }

      /**
       * Create a clone of the matrix
       * @memberof DenseMatrix
       * @return {DenseMatrix} clone
       */
      clone(): DenseMatrix {
        const m = new DenseMatrix({
          data: clone(this._data),
          size: clone(this._size),
          datatype: this._datatype
        })
        return m
      }

      /**
       * Retrieve the size of the matrix.
       * @memberof DenseMatrix
       * @returns {number[]} size
       */
      size(): number[] {
        return this._size.slice(0) // return a clone of _size
      }

      /**
       * Create a new matrix with the results of the callback function executed on
       * each entry of the matrix.
       * @memberof DenseMatrix
       * @param {Function} callback   The callback function is invoked with three
       *                              parameters: the value of the element, the index
       *                              of the element, and the Matrix being traversed.
       * @param {boolean} skipZeros   If true, the callback function is invoked only for non-zero entries
       * @param {boolean} isUnary     If true, the callback function is invoked with one parameter
       *
       * @return {DenseMatrix} matrix
       */
      map(
        callback: MapCallback,
        _skipZeros: boolean = false,
        isUnary: boolean = false
      ): DenseMatrix {
        const me = this
        const maxDepth = me._size.length - 1

        if (maxDepth < 0) return me.clone()

        const fastCallback: OptimizedCallback = optimizeCallback(
          callback,
          me as any,
          'map',
          isUnary
        ) as OptimizedCallback
        const fastCallbackFn = fastCallback.fn

        const result = me.create(undefined, me._datatype)
        result._size = me._size
        if (isUnary || fastCallback.isUnary) {
          result._data = iterateUnary(me._data)
          return result
        }
        if (maxDepth === 0) {
          const inputData: any[] = me.valueOf() as any[]
          const data = Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            data[i] = fastCallbackFn(inputData[i], [i], me)
          }
          result._data = data
          return result
        }

        const index: number[] = []
        result._data = iterate(me._data)
        return result

        function iterate(data: any, depth: number = 0): any[] {
          const result = Array(data.length)
          if (depth < maxDepth) {
            for (let i = 0; i < data.length; i++) {
              index[depth] = i
              result[i] = iterate(data[i], depth + 1)
            }
          } else {
            for (let i = 0; i < data.length; i++) {
              index[depth] = i
              result[i] = fastCallbackFn(data[i], index.slice(), me)
            }
          }
          return result
        }

        function iterateUnary(data: any, depth: number = 0): any[] {
          const result = Array(data.length)
          if (depth < maxDepth) {
            for (let i = 0; i < data.length; i++) {
              result[i] = iterateUnary(data[i], depth + 1)
            }
          } else {
            for (let i = 0; i < data.length; i++) {
              result[i] = fastCallbackFn(data[i])
            }
          }
          return result
        }
      }

      /**
       * Execute a callback function on each entry of the matrix.
       * @memberof DenseMatrix
       * @param {Function} callback   The callback function is invoked with three
       *                              parameters: the value of the element, the index
       *                              of the element, and the Matrix being traversed.
       * @param {boolean} skipZeros   If true, the callback function is invoked only for non-zero entries
       * @param {boolean} isUnary     If true, the callback function is invoked with one parameter
       */
      forEach(
        callback: ForEachCallback,
        _skipZeros: boolean = false,
        isUnary: boolean = false
      ): void {
        const me = this
        const maxDepth = me._size.length - 1

        if (maxDepth < 0) return

        const fastCallback: OptimizedCallback = optimizeCallback(
          callback,
          me as any,
          'map',
          isUnary
        ) as OptimizedCallback
        const fastCallbackFn = fastCallback.fn
        if (isUnary || fastCallback.isUnary) {
          iterateUnary(me._data)
          return
        }
        if (maxDepth === 0) {
          for (let i = 0; i < (me._data as any[]).length; i++) {
            fastCallbackFn((me._data as any[])[i], [i], me)
          }
          return
        }
        const index: number[] = []
        iterate(me._data)

        function iterate(data: any, depth: number = 0): void {
          if (depth < maxDepth) {
            for (let i = 0; i < data.length; i++) {
              index[depth] = i
              iterate(data[i], depth + 1)
            }
          } else {
            for (let i = 0; i < data.length; i++) {
              index[depth] = i
              fastCallbackFn(data[i], index.slice(), me)
            }
          }
        }

        function iterateUnary(data: any, depth: number = 0): void {
          if (depth < maxDepth) {
            for (let i = 0; i < data.length; i++) {
              iterateUnary(data[i], depth + 1)
            }
          } else {
            for (let i = 0; i < data.length; i++) {
              fastCallbackFn(data[i])
            }
          }
        }
      }

      /**
       * Iterate over the matrix elements
       * @return {Iterable<{ value, index: number[] }>}
       */
      *[Symbol.iterator](): IterableIterator<MatrixEntry> {
        const maxDepth = this._size.length - 1

        if (maxDepth < 0) {
          return
        }

        if (maxDepth === 0) {
          for (let i = 0; i < (this._data as any[]).length; i++) {
            yield { value: (this._data as any[])[i], index: [i] }
          }
          return
        }

        const index: number[] = []
        const recurse = function* (
          value: any,
          depth: number
        ): IterableIterator<MatrixEntry> {
          if (depth < maxDepth) {
            for (let i = 0; i < value.length; i++) {
              index[depth] = i
              yield* recurse(value[i], depth + 1)
            }
          } else {
            for (let i = 0; i < value.length; i++) {
              index[depth] = i
              yield { value: value[i], index: index.slice() }
            }
          }
        }
        yield* recurse(this._data, 0)
      }

      /**
       * Returns an array containing the rows of a 2D matrix
       * @returns {Array<Matrix>}
       */
      rows(): DenseMatrix[] {
        const result: DenseMatrix[] = []

        const s = this.size()
        if (s.length !== 2) {
          throw new TypeError('Rows can only be returned for a 2D matrix.')
        }

        const data = this._data as any[][]
        for (const row of data) {
          result.push(new DenseMatrix([row], this._datatype))
        }

        return result
      }

      /**
       * Returns an array containing the columns of a 2D matrix
       * @returns {Array<Matrix>}
       */
      columns(): DenseMatrix[] {
        const result: DenseMatrix[] = []

        const s = this.size()
        if (s.length !== 2) {
          throw new TypeError('Rows can only be returned for a 2D matrix.')
        }

        const data = this._data as any[][]
        for (let i = 0; i < s[1]; i++) {
          const col = data.map((row) => [row[i]])
          result.push(new DenseMatrix(col, this._datatype))
        }

        return result
      }

      /**
       * Create an Array with a copy of the data of the DenseMatrix
       * @memberof DenseMatrix
       * @returns {Array} array
       */
      toArray(): MatrixData {
        return clone(this._data)
      }

      /**
       * Get the primitive value of the DenseMatrix: a multidimensional array
       * @memberof DenseMatrix
       * @returns {Array} array
       */
      valueOf(): MatrixData {
        return this._data
      }

      /**
       * Get a string representation of the matrix, with optional formatting options.
       * @memberof DenseMatrix
       * @param {Object | number | Function} [options]  Formatting options. See
       *                                                lib/utils/number:format for a
       *                                                description of the available
       *                                                options.
       * @returns {string} str
       */
      format(options?: any): string {
        return format(this._data, options)
      }

      /**
       * Get a string representation of the matrix
       * @memberof DenseMatrix
       * @returns {string} str
       */
      toString(): string {
        return format(this._data, {})
      }

      /**
       * Get a JSON representation of the matrix
       * @memberof DenseMatrix
       * @returns {Object}
       */
      toJSON(): MatrixJSON {
        return {
          mathjs: 'DenseMatrix',
          data: this._data,
          size: this._size,
          datatype: this._datatype
        }
      }

      /**
       * Get the kth Matrix diagonal.
       *
       * @memberof DenseMatrix
       * @param {number | BigNumber} [k=0]     The kth diagonal where the vector will retrieved.
       *
       * @returns {Matrix}                     The matrix with the diagonal values.
       */
      diagonal(k?: number | any): DenseMatrix {
        // validate k if any
        if (k) {
          // convert BigNumber to a number
          if (isBigNumber(k)) {
            k = (k as any).toNumber()
          }
          // is must be an integer
          if (!isNumber(k) || !isInteger(k)) {
            throw new TypeError('The parameter k must be an integer number')
          }
        } else {
          // default value
          k = 0
        }

        const kSuper = k > 0 ? k : 0
        const kSub = k < 0 ? -k : 0

        // rows & columns
        const rows = this._size[0]
        const columns = this._size[1]

        // number diagonal values
        const n = Math.min(rows - kSub, columns - kSuper)

        // x is a matrix get diagonal from matrix
        const data: any[] = []

        // loop rows
        for (let i = 0; i < n; i++) {
          data[i] = (this._data as any[][])[i + kSub][i + kSuper]
        }

        // create DenseMatrix
        return new DenseMatrix({
          data,
          size: [n],
          datatype: this._datatype
        })
      }

      /**
       * Swap rows i and j in Matrix.
       *
       * @memberof DenseMatrix
       * @param {number} i       Matrix row index 1
       * @param {number} j       Matrix row index 2
       *
       * @return {Matrix}        The matrix reference
       */
      swapRows(i: number, j: number): DenseMatrix {
        // check index
        if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
          throw new Error('Row index must be positive integers')
        }
        // check dimensions
        if (this._size.length !== 2) {
          throw new Error('Only two dimensional matrix is supported')
        }
        // validate index
        validateIndex(i, this._size[0])
        validateIndex(j, this._size[0])

        // swap rows
        DenseMatrix._swapRows(i, j, this._data as any[][])
        // return current instance
        return this
      }

      /**
       * Create a diagonal matrix.
       *
       * @memberof DenseMatrix
       * @param {Array} size                     The matrix size.
       * @param {number | Matrix | Array } value The values for the diagonal.
       * @param {number | BigNumber} [k=0]       The kth diagonal where the vector will be filled in.
       * @param {number} [defaultValue]          The default value for non-diagonal
       * @param {string} [datatype]              The datatype for the diagonal
       *
       * @returns {DenseMatrix}
       */
      static diagonal(
        size: number[],
        value: number | Matrix | any[],
        k?: number | any,
        defaultValue?: any
      ): DenseMatrix {
        if (!isArray(size)) {
          throw new TypeError('Array expected, size parameter')
        }
        if (size.length !== 2) {
          throw new Error('Only two dimensions matrix are supported')
        }

        // map size & validate
        const mappedSize = size.map(function (s: any) {
          // check it is a big number
          if (isBigNumber(s)) {
            // convert it
            s = (s as any).toNumber()
          }
          // validate arguments
          if (!isNumber(s) || !isInteger(s) || s < 1) {
            throw new Error('Size values must be positive integers')
          }
          return s
        })

        // validate k if any
        if (k) {
          // convert BigNumber to a number
          if (isBigNumber(k)) {
            k = (k as any).toNumber()
          }
          // is must be an integer
          if (!isNumber(k) || !isInteger(k)) {
            throw new TypeError('The parameter k must be an integer number')
          }
        } else {
          // default value
          k = 0
        }

        const kSuper = k > 0 ? k : 0
        const kSub = k < 0 ? -k : 0

        // rows and columns
        const rows = mappedSize[0]
        const columns = mappedSize[1]

        // number of non-zero items
        const n = Math.min(rows - kSub, columns - kSuper)

        // value extraction function
        let _value: (i: number) => any

        // check value
        if (isArray(value)) {
          // validate array
          if ((value as any[]).length !== n) {
            // number of values in array must be n
            throw new Error('Invalid value array length')
          }
          // define function
          _value = function (i: number) {
            // return value @ i
            return (value as any[])[i]
          }
        } else if (isMatrix(value)) {
          // matrix size
          const ms = (value as any).size()
          // validate matrix
          if (ms.length !== 1 || ms[0] !== n) {
            // number of values in array must be n
            throw new Error('Invalid matrix length')
          }
          // define function
          _value = function (i: number) {
            // return value @ i
            return (value as any).get([i])
          }
        } else {
          // define function
          _value = function () {
            // return value
            return value
          }
        }

        // discover default value if needed
        if (!defaultValue) {
          // check first value in array
          defaultValue = isBigNumber(_value(0))
            ? _value(0).mul(0) // trick to create a BigNumber with value zero
            : 0
        }

        // empty array
        let data: any[] = []

        // check we need to resize array
        if (mappedSize.length > 0) {
          // resize array
          data = resize(data, mappedSize, defaultValue)
          // fill diagonal
          for (let d = 0; d < n; d++) {
            data[d + kSub][d + kSuper] = _value(d)
          }
        }

        // create DenseMatrix
        return new DenseMatrix({
          data,
          size: [rows, columns]
        })
      }

      /**
       * Generate a matrix from a JSON object
       * @memberof DenseMatrix
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "DenseMatrix", data: [], size: []}`,
       *                       where mathjs is optional
       * @returns {DenseMatrix}
       */
      static fromJSON(
        json: MatrixJSON | DenseMatrixConstructorData
      ): DenseMatrix {
        return new DenseMatrix(json)
      }

      /**
       * Swap rows i and j in Dense Matrix data structure.
       *
       * @param {number} i       Matrix row index 1
       * @param {number} j       Matrix row index 2
       * @param {Array} data     Matrix data
       */
      static _swapRows(i: number, j: number, data: any[][]): void {
        // swap values i <-> j
        const vi = data[i]
        data[i] = data[j]
        data[j] = vi
      }
    }

    // Set up prototype inheritance
    const MatrixPrototype = Matrix.prototype || Matrix
    Object.setPrototypeOf(DenseMatrix.prototype, MatrixPrototype)

    /**
     * Attach type information
     */
    Object.defineProperty(DenseMatrix, 'name', { value: 'DenseMatrix' })
    Object.defineProperty(DenseMatrix.prototype, 'constructor', {
      value: DenseMatrix,
      writable: true,
      configurable: true
    })

    /**
     * Get a submatrix of this matrix
     * @memberof DenseMatrix
     * @param {DenseMatrix} matrix
     * @param {Index} index   Zero-based index
     * @private
     */
    function _get(matrix: DenseMatrix, index: Index): any {
      if (!isIndex(index)) {
        throw new TypeError('Invalid index')
      }

      const isScalar = index.isScalar()
      if (isScalar) {
        // return a scalar
        return matrix.get(index.min())
      } else {
        // validate dimensions
        const size = index.size()
        if (size.length !== matrix._size.length) {
          throw new DimensionError(size.length, matrix._size.length)
        }

        // validate if any of the ranges in the index is out of range
        const min = index.min()
        const max = index.max()
        for (let i = 0, ii = matrix._size.length; i < ii; i++) {
          validateIndex(min[i], matrix._size[i])
          validateIndex(max[i], matrix._size[i])
        }

        // retrieve submatrix
        const returnMatrix = new DenseMatrix([])
        const submatrix = _getSubmatrix(matrix._data, index)
        returnMatrix._size = submatrix.size
        returnMatrix._datatype = matrix._datatype
        returnMatrix._data = submatrix.data
        return returnMatrix
      }
    }

    /**
     * Get a submatrix of a multi dimensional matrix.
     * Index is not checked for correct number or length of dimensions.
     * @memberof DenseMatrix
     * @param {Array} data
     * @param {Index} index
     * @return {Array} submatrix
     * @private
     */
    function _getSubmatrix(
      data: MatrixData,
      index: Index
    ): { data: MatrixData; size: number[] } {
      const maxDepth = index.size().length - 1
      const size = Array(maxDepth)
      return { data: getSubmatrixRecursive(data), size }

      function getSubmatrixRecursive(data: any, depth: number = 0): any {
        const ranges = index.dimension(depth)
        size[depth] = ranges.size()[0]
        if (depth < maxDepth) {
          return ranges
            .map((rangeIndex: number) => {
              validateIndex(rangeIndex, data.length)
              return getSubmatrixRecursive(data[rangeIndex], depth + 1)
            })
            .valueOf()
        } else {
          return ranges
            .map((rangeIndex: number) => {
              validateIndex(rangeIndex, data.length)
              return data[rangeIndex]
            })
            .valueOf()
        }
      }
    }

    /**
     * Replace a submatrix in this matrix
     * Indexes are zero-based.
     * @memberof DenseMatrix
     * @param {DenseMatrix} matrix
     * @param {Index} index
     * @param {DenseMatrix | Array | *} submatrix
     * @param {*} defaultValue          Default value, filled in on new entries when
     *                                  the matrix is resized.
     * @return {DenseMatrix} matrix
     * @private
     */
    function _set(
      matrix: DenseMatrix,
      index: Index,
      submatrix: any,
      defaultValue?: any
    ): DenseMatrix {
      if (!index || index.isIndex !== true) {
        throw new TypeError('Invalid index')
      }

      // get index size and check whether the index contains a single value
      const iSize = index.size()
      const isScalar = index.isScalar()

      // calculate the size of the submatrix, and convert it into an Array if needed
      let sSize: number[]
      if (isMatrix(submatrix)) {
        sSize = (submatrix as any).size()
        submatrix = (submatrix as any).valueOf()
      } else {
        sSize = arraySize(submatrix)
      }

      if (isScalar) {
        // set a scalar

        // check whether submatrix is a scalar
        if (sSize.length !== 0) {
          throw new TypeError('Scalar expected')
        }
        matrix.set(index.min(), submatrix, defaultValue)
      } else {
        // set a submatrix

        // broadcast submatrix
        if (!deepStrictEqual(sSize, iSize)) {
          try {
            if (sSize.length === 0) {
              submatrix = broadcastTo([submatrix], iSize)
            } else {
              submatrix = broadcastTo(submatrix, iSize)
            }
            sSize = arraySize(submatrix)
          } catch {}
        }

        // validate dimensions
        if (iSize.length < matrix._size.length) {
          throw new DimensionError(iSize.length, matrix._size.length, '<')
        }

        if (sSize.length < iSize.length) {
          // calculate number of missing outer dimensions
          let i = 0
          let outer = 0
          while (iSize[i] === 1 && sSize[i] === 1) {
            i++
          }
          while (iSize[i] === 1) {
            outer++
            i++
          }

          // unsqueeze both outer and inner dimensions
          submatrix = unsqueeze(submatrix, iSize.length, outer, sSize)
        }

        // check whether the size of the submatrix matches the index size
        if (!deepStrictEqual(iSize, sSize)) {
          throw new DimensionError(iSize, sSize, '>')
        }

        // enlarge matrix when needed
        const size = index.max().map(function (i) {
          return i + 1
        })
        _fit(matrix, size, defaultValue)

        // insert the sub matrix
        _setSubmatrix(matrix._data, index, submatrix)
      }

      return matrix
    }

    /**
     * Replace a submatrix of a multi dimensional matrix.
     * @memberof DenseMatrix
     * @param {Array} data
     * @param {Index} index
     * @param {Array} submatrix
     * @private
     */
    function _setSubmatrix(
      data: MatrixData,
      index: Index,
      submatrix: any
    ): void {
      const maxDepth = index.size().length - 1

      setSubmatrixRecursive(data, submatrix)

      function setSubmatrixRecursive(
        data: any,
        submatrix: any,
        depth: number = 0
      ): void {
        const range = index.dimension(depth)
        if (depth < maxDepth) {
          range.forEach((rangeIndex: number, i: number[]) => {
            validateIndex(rangeIndex, data.length)
            setSubmatrixRecursive(data[rangeIndex], submatrix[i[0]], depth + 1)
          })
        } else {
          range.forEach((rangeIndex: number, i: number[]) => {
            validateIndex(rangeIndex, data.length)
            data[rangeIndex] = submatrix[i[0]]
          })
        }
      }
    }

    /**
     * Resize the matrix to the given size. Returns the matrix.
     * @memberof DenseMatrix
     * @param {DenseMatrix} matrix
     * @param {number[]} size
     * @param {*} defaultValue
     * @return {DenseMatrix | any} matrix or scalar value
     * @private
     */
    function _resize(
      matrix: DenseMatrix,
      size: number[],
      defaultValue?: any
    ): DenseMatrix | any {
      // check size
      if (size.length === 0) {
        // first value in matrix
        let v: any = matrix._data
        // go deep
        while (isArray(v)) {
          v = v[0]
        }
        return v
      }
      // resize matrix
      matrix._size = size.slice(0) // copy the array
      matrix._data = resize(matrix._data, matrix._size, defaultValue)
      // return matrix
      return matrix
    }

    /**
     * Enlarge the matrix when it is smaller than given size.
     * If the matrix is larger or equal sized, nothing is done.
     * @memberof DenseMatrix
     * @param {DenseMatrix} matrix           The matrix to be resized
     * @param {number[]} size
     * @param {*} defaultValue          Default value, filled in on new entries.
     * @private
     */
    function _fit(
      matrix: DenseMatrix,
      size: number[],
      defaultValue?: any
    ): void {
      const // copy the array
        newSize = matrix._size.slice(0)

      let changed = false

      // add dimensions when needed
      while (newSize.length < size.length) {
        newSize.push(0)
        changed = true
      }

      // enlarge size when needed
      for (let i = 0, ii = size.length; i < ii; i++) {
        if (size[i] > newSize[i]) {
          newSize[i] = size[i]
          changed = true
        }
      }

      if (changed) {
        // resize only when size is changed
        _resize(matrix, newSize, defaultValue)
      }
    }

    /**
     * Preprocess data, which can be an Array or DenseMatrix with nested Arrays and
     * Matrices. Clones all (nested) Arrays, and replaces all nested Matrices with Arrays
     * @memberof DenseMatrix
     * @param {Array | Matrix} data
     * @return {Array} data
     */
    function preprocess(data: MatrixData | Matrix): MatrixData {
      if (isMatrix(data)) {
        return preprocess(data.valueOf())
      }

      if (isArray(data)) {
        return (data as any[]).map(preprocess)
      }

      return data
    }

    return DenseMatrix
  },
  { isClass: true }
)
