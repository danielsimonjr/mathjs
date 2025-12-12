import { isInteger } from './number.ts'
import { isNumber, isBigNumber, isArray, isString, BigNumber, Index, Matrix } from './is.ts'
import { format } from './string.ts'
import { DimensionError } from '../error/DimensionError.ts'
import { IndexError } from '../error/IndexError.ts'
import { deepStrictEqual } from './object.ts'

// Type definitions
export type NestedArray<T> = T | NestedArray<T>[]
export type ArrayOrScalar<T> = T | T[] | NestedArray<T>

// Type for objects with value and identifier properties
export interface IdentifiedValue<T> {
  value: T
  identifier: number
}

/**
 * Calculate the size of a multi dimensional array.
 * This function checks the size of the first entry, it does not validate
 * whether all dimensions match. (use function `validate` for that)
 * @param {Array} x
 * @return {number[]} size
 */
export function arraySize(x: any): number[] {
  const s: number[] = []

  while (Array.isArray(x)) {
    s.push(x.length)
    x = x[0]
  }

  return s
}

/**
 * Recursively validate whether each element in a multi dimensional array
 * has a size corresponding to the provided size array.
 * @param {Array} array    Array to be validated
 * @param {number[]} size  Array with the size of each dimension
 * @param {number} dim     Current dimension
 * @throws DimensionError
 * @private
 */
function _validate(array: any[], size: number[], dim: number): void {
  let i: number
  const len = array.length

  if (len !== size[dim]) {
    throw new DimensionError(len, size[dim])
  }

  if (dim < size.length - 1) {
    // recursively validate each child array
    const dimNext = dim + 1
    for (i = 0; i < len; i++) {
      const child = array[i]
      if (!Array.isArray(child)) {
        throw new DimensionError(size.length - 1, size.length, '<')
      }
      _validate(array[i], size, dimNext)
    }
  } else {
    // last dimension. none of the children may be an array
    for (i = 0; i < len; i++) {
      if (Array.isArray(array[i])) {
        throw new DimensionError(size.length + 1, size.length, '>')
      }
    }
  }
}

/**
 * Validate whether each element in a multi dimensional array has
 * a size corresponding to the provided size array.
 * @param {Array} array    Array to be validated
 * @param {number[]} size  Array with the size of each dimension
 * @throws DimensionError
 */
export function validate(array: any, size: number[]): void {
  const isScalar = (size.length === 0)
  if (isScalar) {
    // scalar
    if (Array.isArray(array)) {
      throw new DimensionError(array.length, 0)
    }
  } else {
    // array
    _validate(array, size, 0)
  }
}

/**
 * Validate whether the source of the index matches the size of the Array
 * @param {Array | Matrix} value    Array to be validated
 * @param {Index} index  Index with the source information to validate
 * @throws DimensionError
 */
export function validateIndexSourceSize(value: any[] | Matrix, index: Index): void {
  const valueSize = (value as Matrix).isMatrix ? (value as Matrix)._size! : arraySize(value)
  const sourceSize = index._sourceSize!
  // checks if the source size is not null and matches the valueSize
  sourceSize.forEach((sourceDim, i) => {
    if (sourceDim !== null && sourceDim !== valueSize[i]) { throw new DimensionError(sourceDim, valueSize[i]) }
  })
}

/**
 * Test whether index is an integer number with index >= 0 and index < length
 * when length is provided
 * @param {number} index    Zero-based index
 * @param {number} [length] Length of the array
 */
export function validateIndex(index: number | undefined, length?: number): void {
  if (index !== undefined) {
    if (!isNumber(index) || !isInteger(index)) {
      throw new TypeError('Index must be an integer (value: ' + index + ')')
    }
    if (index < 0 || (typeof length === 'number' && index >= length)) {
      throw new IndexError(index, 0, length) as any
    }
  }
}

/**
 * Test if an index has empty values
 * @param {Index} index    Zero-based index
 */
export function isEmptyIndex(index: Index): boolean {
  for (let i = 0; i < index._dimensions.length; ++i) {
    const dimension = index._dimensions[i]
    if (dimension._data && isArray(dimension._data)) {
      if (dimension._size[0] === 0) {
        return true
      }
    } else if (dimension.isRange) {
      if (dimension.start === dimension.end) {
        return true
      }
    } else if (isString(dimension)) {
      if (dimension.length === 0) {
        return true
      }
    }
  }
  return false
}

/**
 * Resize a multi dimensional array. The resized array is returned.
 * @param {Array | number} array         Array to be resized
 * @param {number[]} size Array with the size of each dimension
 * @param {*} [defaultValue=0]  Value to be filled in new entries,
 *                              zero by default. Specify for example `null`,
 *                              to clearly see entries that are not explicitly
 *                              set.
 * @return {Array} array         The resized array
 */
export function resize<T = any>(
  array: T | T[] | NestedArray<T>,
  size: number[],
  defaultValue?: T
): NestedArray<T> {
  // check the type of the arguments
  if (!Array.isArray(size)) {
    throw new TypeError('Array expected')
  }
  if (size.length === 0) {
    throw new Error('Resizing to scalar is not supported')
  }

  // check whether size contains positive integers
  size.forEach(function (value) {
    if (!isNumber(value) || !isInteger(value) || value < 0) {
      throw new TypeError('Invalid size, must contain positive integers ' +
        '(size: ' + format(size, {}) + ')')
    }
  })

  // convert number to an array
  let arr: any = array
  if (isNumber(array) || isBigNumber(array)) {
    arr = [array]
  }

  // recursively resize the array
  const _defaultValue = (defaultValue !== undefined) ? defaultValue : 0
  _resize(arr, size, 0, _defaultValue)

  return arr
}

/**
 * Recursively resize a multi dimensional array
 * @param {Array} array         Array to be resized
 * @param {number[]} size       Array with the size of each dimension
 * @param {number} dim          Current dimension
 * @param {*} [defaultValue]    Value to be filled in new entries,
 *                              undefined by default.
 * @private
 */
function _resize(array: any[], size: number[], dim: number, defaultValue: any): void {
  let i: number
  let elem: any
  const oldLen = array.length
  const newLen = size[dim]
  const minLen = Math.min(oldLen, newLen)

  // apply new length
  array.length = newLen

  if (dim < size.length - 1) {
    // non-last dimension
    const dimNext = dim + 1

    // resize existing child arrays
    for (i = 0; i < minLen; i++) {
      // resize child array
      elem = array[i]
      if (!Array.isArray(elem)) {
        elem = [elem] // add a dimension
        array[i] = elem
      }
      _resize(elem, size, dimNext, defaultValue)
    }

    // create new child arrays
    for (i = minLen; i < newLen; i++) {
      // get child array
      elem = []
      array[i] = elem

      // resize new child array
      _resize(elem, size, dimNext, defaultValue)
    }
  } else {
    // last dimension

    // remove dimensions of existing values
    for (i = 0; i < minLen; i++) {
      while (Array.isArray(array[i])) {
        array[i] = array[i][0]
      }
    }

    // fill new elements with the default value
    for (i = minLen; i < newLen; i++) {
      array[i] = defaultValue
    }
  }
}

/**
 * Re-shape a multi dimensional array to fit the specified dimensions
 * @param {Array} array           Array to be reshaped
 * @param {number[]} sizes        List of sizes for each dimension
 * @returns {Array}               Array whose data has been formatted to fit the
 *                                specified dimensions
 *
 * @throws {DimensionError}       If the product of the new dimension sizes does
 *                                not equal that of the old ones
 */
export function reshape<T = any>(array: NestedArray<T>, sizes: number[]): NestedArray<T> {
  const flatArray = flatten(array, true) // since it has rectangular
  const currentLength = flatArray.length

  if (!Array.isArray(array) || !Array.isArray(sizes)) {
    throw new TypeError('Array expected')
  }

  if (sizes.length === 0) {
    throw new DimensionError(0, currentLength, '!=')
  }

  const processedSizes = processSizesWildcard(sizes, currentLength)
  const newLength = product(processedSizes)
  if (currentLength !== newLength) {
    throw new DimensionError(
      newLength,
      currentLength,
      '!='
    )
  }

  try {
    return _reshape(flatArray, processedSizes)
  } catch (e) {
    if (e instanceof DimensionError) {
      throw new DimensionError(
        newLength,
        currentLength,
        '!='
      )
    }
    throw e
  }
}

/**
 * Replaces the wildcard -1 in the sizes array.
 * @param {number[]} sizes  List of sizes for each dimension. At most one wildcard.
 * @param {number} currentLength  Number of elements in the array.
 * @throws {Error}                If more than one wildcard or unable to replace it.
 * @returns {number[]}      The sizes array with wildcard replaced.
 */
export function processSizesWildcard(sizes: number[], currentLength: number): number[] {
  const newLength = product(sizes)
  const processedSizes = sizes.slice()
  const WILDCARD = -1
  const wildCardIndex = sizes.indexOf(WILDCARD)

  const isMoreThanOneWildcard = sizes.indexOf(WILDCARD, wildCardIndex + 1) >= 0
  if (isMoreThanOneWildcard) {
    throw new Error('More than one wildcard in sizes')
  }

  const hasWildcard = wildCardIndex >= 0
  const canReplaceWildcard = currentLength % newLength === 0

  if (hasWildcard) {
    if (canReplaceWildcard) {
      processedSizes[wildCardIndex] = -currentLength / newLength
    } else {
      throw new Error('Could not replace wildcard, since ' + currentLength + ' is no multiple of ' + (-newLength))
    }
  }
  return processedSizes
}

/**
 * Computes the product of all array elements.
 * @param {number[]} array Array of factors
 * @returns {number}            Product of all elements
 */
function product(array: number[]): number {
  return array.reduce((prev, curr) => prev * curr, 1)
}

/**
 * Iteratively re-shape a multi dimensional array to fit the specified dimensions
 * @param {Array} array           Array to be reshaped
 * @param {number[]} sizes  List of sizes for each dimension
 * @returns {Array}               Array whose data has been formatted to fit the
 *                                specified dimensions
 */

function _reshape<T>(array: T[], sizes: number[]): NestedArray<T> {
  // testing if there are enough elements for the requested shape
  let tmpArray: any = array
  let tmpArray2: any

  // for each dimension starting by the last one and ignoring the first one
  for (let sizeIndex = sizes.length - 1; sizeIndex > 0; sizeIndex--) {
    const size = sizes[sizeIndex]
    tmpArray2 = []

    // aggregate the elements of the current tmpArray in elements of the requested size
    const length = tmpArray.length / size
    for (let i = 0; i < length; i++) {
      tmpArray2.push(tmpArray.slice(i * size, (i + 1) * size))
    }
    // set it as the new tmpArray for the next loop turn or for return
    tmpArray = tmpArray2
  }

  return tmpArray
}

/**
 * Squeeze a multi dimensional array
 * @param {Array} array
 * @param {Array} [size]
 * @returns {Array} returns the array itself
 */
export function squeeze<T>(array: NestedArray<T>, size?: number[]): T | NestedArray<T> {
  const s = size || arraySize(array)

  let arr: any = array

  // squeeze outer dimensions
  while (Array.isArray(arr) && arr.length === 1) {
    arr = arr[0]
    s.shift()
  }

  // find the first dimension to be squeezed
  let dims = s.length
  while (s[dims - 1] === 1) {
    dims--
  }

  // squeeze inner dimensions
  if (dims < s.length) {
    arr = _squeeze(arr, dims, 0)
    s.length = dims
  }

  return arr
}

/**
 * Recursively squeeze a multi dimensional array
 * @param {Array} array
 * @param {number} dims Required number of dimensions
 * @param {number} dim  Current dimension
 * @returns {Array | *} Returns the squeezed array
 * @private
 */
function _squeeze(array: any, dims: number, dim: number): any {
  let i: number
  let ii: number

  if (dim < dims) {
    const next = dim + 1
    for (i = 0, ii = array.length; i < ii; i++) {
      array[i] = _squeeze(array[i], dims, next)
    }
  } else {
    while (Array.isArray(array)) {
      array = array[0]
    }
  }

  return array
}

/**
 * Unsqueeze a multi dimensional array: add dimensions when missing
 *
 * Parameter `size` will be mutated to match the new, unsqueezed matrix size.
 *
 * @param {Array} array
 * @param {number} dims       Desired number of dimensions of the array
 * @param {number} [outer]    Number of outer dimensions to be added
 * @param {Array} [size] Current size of array.
 * @returns {Array} returns the array itself
 * @private
 */
export function unsqueeze<T>(
  array: NestedArray<T>,
  dims: number,
  outer?: number,
  size?: number[]
): NestedArray<T> {
  const s = size || arraySize(array)

  let arr: any = array

  // unsqueeze outer dimensions
  if (outer) {
    for (let i = 0; i < outer; i++) {
      arr = [arr]
      s.unshift(1)
    }
  }

  // unsqueeze inner dimensions
  arr = _unsqueeze(arr, dims, 0)
  while (s.length < dims) {
    s.push(1)
  }

  return arr
}

/**
 * Recursively unsqueeze a multi dimensional array
 * @param {Array} array
 * @param {number} dims Required number of dimensions
 * @param {number} dim  Current dimension
 * @returns {Array | *} Returns the unsqueezed array
 * @private
 */
function _unsqueeze(array: any, dims: number, dim: number): any {
  let i: number
  let ii: number

  if (Array.isArray(array)) {
    const next = dim + 1
    for (i = 0, ii = array.length; i < ii; i++) {
      array[i] = _unsqueeze(array[i], dims, next)
    }
  } else {
    for (let d = dim; d < dims; d++) {
      array = [array]
    }
  }

  return array
}

/**
 * Flatten a multi dimensional array, put all elements in a one dimensional
 * array
 * @param {Array} array   A multi dimensional array
 * @param {boolean} isRectangular Optional. If the array is rectangular (not jagged)
 * @return {Array}        The flattened array (1 dimensional)
 */
export function flatten<T>(array: NestedArray<T>, isRectangular: boolean = false): T[] {
  if (!Array.isArray(array)) {
    // if not an array, return as is
    return array as any
  }
  if (typeof isRectangular !== 'boolean') {
    throw new TypeError('Boolean expected for second argument of flatten')
  }
  const flat: T[] = []

  if (isRectangular) {
    _flattenRectangular(array)
  } else {
    _flatten(array)
  }

  return flat

  function _flatten(arr: any): void {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (Array.isArray(item)) {
        _flatten(item)
      } else {
        flat.push(item)
      }
    }
  }

  function _flattenRectangular(arr: any): void {
    if (Array.isArray(arr[0])) {
      for (let i = 0; i < arr.length; i++) {
        _flattenRectangular(arr[i])
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        flat.push(arr[i])
      }
    }
  }
}

/**
 * A safe map
 * @param {Array} array
 * @param {function} callback
 */
export function map<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => U): U[] {
  return Array.prototype.map.call(array, callback)
}

/**
 * A safe forEach
 * @param {Array} array
 * @param {function} callback
 */
export function forEach<T>(array: T[], callback: (value: T, index: number, array: T[]) => void): void {
  Array.prototype.forEach.call(array, callback)
}

/**
 * A safe filter
 * @param {Array} array
 * @param {function} callback
 */
export function filter<T>(array: T[], callback: (value: T, index: number, array: T[]) => boolean): T[] {
  if (arraySize(array).length !== 1) {
    throw new Error('Only one dimensional matrices supported')
  }

  return Array.prototype.filter.call(array, callback)
}

/**
 * Filter values in an array given a regular expression
 * @param {Array} array
 * @param {RegExp} regexp
 * @return {Array} Returns the filtered array
 * @private
 */
export function filterRegExp(array: string[], regexp: RegExp): string[] {
  if (arraySize(array).length !== 1) {
    throw new Error('Only one dimensional matrices supported')
  }

  return Array.prototype.filter.call(array, (entry: string) => regexp.test(entry))
}

/**
 * A safe join
 * @param {Array} array
 * @param {string} separator
 */
export function join<T>(array: T[], separator: string): string {
  return Array.prototype.join.call(array, separator)
}

/**
 * Assign a numeric identifier to every element of a sorted array
 * @param {Array} a  An array
 * @return {Array} An array of objects containing the original value and its identifier
 */
export function identify<T>(a: T[]): IdentifiedValue<T>[] {
  if (!Array.isArray(a)) {
    throw new TypeError('Array input expected')
  }

  if (a.length === 0) {
    return a as any
  }

  const b: IdentifiedValue<T>[] = []
  let count = 0
  b[0] = { value: a[0], identifier: 0 }
  for (let i = 1; i < a.length; i++) {
    if (a[i] === a[i - 1]) {
      count++
    } else {
      count = 0
    }
    b.push({ value: a[i], identifier: count })
  }
  return b
}

/**
 * Remove the numeric identifier from the elements
 * @param {array} a  An array
 * @return {array} An array of values without identifiers
 */
export function generalize<T>(a: IdentifiedValue<T>[]): T[] {
  if (!Array.isArray(a)) {
    throw new TypeError('Array input expected')
  }

  if (a.length === 0) {
    return a as any
  }

  const b: T[] = []
  for (let i = 0; i < a.length; i++) {
    b.push(a[i].value)
  }
  return b
}

/**
 * Check the datatype of a given object
 * This is a low level implementation that should only be used by
 * parent Matrix classes such as SparseMatrix or DenseMatrix
 * This method does not validate Array Matrix shape
 * @param {Array} array
 * @param {function} typeOf   Callback function to use to determine the type of a value
 * @return {string}
 */
export function getArrayDataType(
  array: any[],
  typeOf: (value: any) => string
): string | undefined {
  let type: string | undefined // to hold type info
  let length = 0 // to hold length value to ensure it has consistent sizes

  for (let i = 0; i < array.length; i++) {
    const item = array[i]
    const isArray = Array.isArray(item)

    // Saving the target matrix row size
    if (i === 0 && isArray) {
      length = item.length
    }

    // If the current item is an array but the length does not equal the targetVectorSize
    if (isArray && item.length !== length) {
      return undefined
    }

    const itemType = isArray
      ? getArrayDataType(item, typeOf) // recurse into a nested array
      : typeOf(item)

    if (type === undefined) {
      type = itemType // first item
    } else if (type !== itemType) {
      return 'mixed'
    } else {
      // we're good, everything has the same type so far
    }
  }

  return type
}

/**
 * Return the last item from an array
 * @param {Array} array
 * @returns {*}
 */
export function last<T>(array: T[]): T {
  return array[array.length - 1]
}

/**
 * Get all but the last element of array.
 * @param {Array} array
 * @returns {Array}
 */
export function initial<T>(array: T[]): T[] {
  return array.slice(0, array.length - 1)
}

/**
 * Recursively concatenate two matrices.
 * The contents of the matrices are not cloned.
 * @param {Array} a             Multi dimensional array
 * @param {Array} b             Multi dimensional array
 * @param {number} concatDim    The dimension on which to concatenate (zero-based)
 * @param {number} dim          The current dim (zero-based)
 * @return {Array} c            The concatenated matrix
 * @private
 */
function concatRecursive(a: any[], b: any[], concatDim: number, dim: number): any[] {
  if (dim < concatDim) {
    // recurse into next dimension
    if (a.length !== b.length) {
      throw new DimensionError(a.length, b.length)
    }

    const c: any[] = []
    for (let i = 0; i < a.length; i++) {
      c[i] = concatRecursive(a[i], b[i], concatDim, dim + 1)
    }
    return c
  } else {
    // concatenate this dimension
    return a.concat(b)
  }
}

/**
 * Concatenates many arrays in the specified direction
 * @param {...Array} arrays All the arrays to concatenate
 * @param {number} concatDim The dimension on which to concatenate (zero-based)
 * @returns {Array}
 */
export function concat(...args: any[]): any[] {
  const arrays = Array.prototype.slice.call(args, 0, -1)
  const concatDim = Array.prototype.slice.call(args, -1)[0]

  if (arrays.length === 1) {
    return arrays[0]
  }
  if (arrays.length > 1) {
    return arrays.slice(1).reduce(function (A: any, B: any) { return concatRecursive(A, B, concatDim, 0) }, arrays[0])
  } else {
    throw new Error('Wrong number of arguments in function concat')
  }
}

/**
 * Receives two or more sizes and gets the broadcasted size for both.
 * @param  {...number[]} sizes Sizes to broadcast together
 * @returns {number[]} The broadcasted size
 */
export function broadcastSizes(...sizes: number[][]): number[] {
  const dimensions = sizes.map((s) => s.length)
  const N = Math.max(...dimensions)
  const sizeMax = new Array(N).fill(null)
  // check for every size
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    const dim = dimensions[i]
    for (let j = 0; j < dim; j++) {
      const n = N - dim + j
      if (size[j] > sizeMax[n]) {
        sizeMax[n] = size[j]
      }
    }
  }
  for (let i = 0; i < sizes.length; i++) {
    checkBroadcastingRules(sizes[i], sizeMax)
  }
  return sizeMax
}

/**
 * Checks if it's possible to broadcast a size to another size
 * @param {number[]} size The size of the array to check
 * @param {number[]} toSize The size of the array to validate if it can be broadcasted to
 */
export function checkBroadcastingRules(size: number[], toSize: number[]): void {
  const N = toSize.length
  const dim = size.length
  for (let j = 0; j < dim; j++) {
    const n = N - dim + j
    if ((size[j] < toSize[n] && size[j] > 1) || (size[j] > toSize[n])) {
      throw new Error(
        `shape mismatch: mismatch is found in arg with shape (${size}) not possible to broadcast dimension ${dim} with size ${size[j]} to size ${toSize[n]}`
      )
    }
  }
}

/**
 * Broadcasts a single array to a certain size
 * @param {Array} array Array to be broadcasted
 * @param {number[]} toSize Size to broadcast the array
 * @returns {Array} The broadcasted array
 */
export function broadcastTo<T>(array: NestedArray<T>, toSize: number[]): NestedArray<T> {
  let Asize = arraySize(array)
  if (deepStrictEqual(Asize, toSize)) {
    return array
  }
  checkBroadcastingRules(Asize, toSize)
  const broadcastedSize = broadcastSizes(Asize, toSize)
  const N = broadcastedSize.length
  const paddedSize = [...Array(N - Asize.length).fill(1), ...Asize]

  let A: any = clone(array as any)
  // reshape A if needed to make it ready for concat
  if (Asize.length < N) {
    A = reshape(A, paddedSize)
    Asize = arraySize(A)
  }

  // stretches the array on each dimension to make it the same size as index
  for (let dim = 0; dim < N; dim++) {
    if (Asize[dim] < broadcastedSize[dim]) {
      A = stretch(A, broadcastedSize[dim], dim)
      Asize = arraySize(A)
    }
  }
  return A
}

/**
 * Broadcasts arrays and returns the broadcasted arrays in an array
 * @param  {...Array | any} arrays
 * @returns {Array[]} The broadcasted arrays
 */
export function broadcastArrays<T>(...arrays: NestedArray<T>[]): NestedArray<T>[] {
  if (arrays.length === 0) {
    throw new Error('Insufficient number of arguments in function broadcastArrays')
  }
  if (arrays.length === 1) {
    return arrays as any
  }
  const sizes = arrays.map(function (array) { return arraySize(array) })
  const broadcastedSize = broadcastSizes(...sizes)
  const broadcastedArrays: NestedArray<T>[] = []
  arrays.forEach(function (array) { broadcastedArrays.push(broadcastTo(array, broadcastedSize)) })
  return broadcastedArrays
}

/**
 * Stretches a matrix up to a certain size in a certain dimension
 * @param {Array} arrayToStretch
 * @param {number[]} sizeToStretch
 * @param {number} dimToStretch
 * @returns {Array} The stretched array
 */
export function stretch<T>(
  arrayToStretch: NestedArray<T>,
  sizeToStretch: number,
  dimToStretch: number
): NestedArray<T> {
  return concat(...Array(sizeToStretch).fill(arrayToStretch), dimToStretch)
}

/**
* Retrieves a single element from an array given an index.
*
* @param {Array} array - The array from which to retrieve the value.
* @param {Array<number>} index - An array of indices specifying the position of the desired element in each dimension.
* @returns {*} - The value at the specified position in the array.
*
* @example
* const arr = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
* const index = [1, 0, 1];
* console.log(get(arr, index)); // 6
*/
export function get<T>(array: NestedArray<T>, index: number[]): T {
  if (!Array.isArray(array)) { throw new Error('Array expected') }
  const size = arraySize(array)
  if (index.length !== size.length) { throw new DimensionError(index.length, size.length) }
  for (let x = 0; x < index.length; x++) { validateIndex(index[x], size[x]) }
  return index.reduce((acc: any, curr) => acc[curr], array)
}

/**
 * Recursively maps over each element of nested array using a provided callback function.
 *
 * @param {Array} array - The array to be mapped.
 * @param {Function} callback - The function to execute on each element, taking three arguments:
 *   - `value` (any): The current element being processed in the array.
 *   - `index` (Array<number>): The index of the current element being processed in the array.
 *   - `array` (Array): The array `deepMap` was called upon.
 * @param {boolean} [skipIndex=false] - If true, the callback function is called with only the value.
 * @returns {Array} A new array with each element being the result of the callback function.
 */
export function deepMap<T, U>(
  array: NestedArray<T>,
  callback: ((value: T, index: number[], array: NestedArray<T>) => U) | ((value: T) => U),
  skipIndex: boolean = false
): NestedArray<U> {
  if ((array as any).length === 0) {
    return [] as any
  }

  if (skipIndex) {
    return recursiveMap(array) as NestedArray<U>
  }
  const index: number[] = []

  return recursiveMapWithIndex(array, 0) as NestedArray<U>

  function recursiveMapWithIndex(value: any, depth: number): any {
    if (Array.isArray(value)) {
      const N = value.length
      const result = Array(N)
      for (let i = 0; i < N; i++) {
        index[depth] = i
        result[i] = recursiveMapWithIndex(value[i], depth + 1)
      }
      return result
    } else {
      return (callback as any)(value, index.slice(0, depth), array)
    }
  }

  function recursiveMap(value: any): any {
    if (Array.isArray(value)) {
      const N = value.length
      const result = Array(N)
      for (let i = 0; i < N; i++) {
        result[i] = recursiveMap(value[i])
      }
      return result
    } else {
      return (callback as any)(value)
    }
  }
}

/**
 * Recursively iterates over each element in a multi-dimensional array and applies a callback function.
 *
 * @param {Array} array - The multi-dimensional array to iterate over.
 * @param {Function} callback - The function to execute for each element. It receives three arguments:
 *   - {any} value: The current element being processed in the array.
 *   - {Array<number>} index: The index of the current element in each dimension.
 *   - {Array} array: The original array being processed.
 * @param {boolean} [skipIndex=false] - If true, the callback function is called with only the value.
 */
export function deepForEach<T>(
  array: NestedArray<T>,
  callback: ((value: T, index: number[], array: NestedArray<T>) => void) | ((value: T) => void),
  skipIndex: boolean = false
): void {
  if ((array as any).length === 0) {
    return
  }

  if (skipIndex) {
    recursiveForEach(array)
    return
  }
  const index: number[] = []
  recursiveForEachWithIndex(array, 0)

  function recursiveForEachWithIndex(value: any, depth: number): void {
    if (Array.isArray(value)) {
      const N = value.length
      for (let i = 0; i < N; i++) {
        index[depth] = i
        recursiveForEachWithIndex(value[i], depth + 1)
      }
    } else {
      (callback as any)(value, index.slice(0, depth), array)
    }
  }

  function recursiveForEach(value: any): void {
    if (Array.isArray(value)) {
      const N = value.length
      for (let i = 0; i < N; i++) {
        recursiveForEach(value[i])
      }
    } else {
      (callback as any)(value)
    }
  }
}

/**
 * Deep clones a multidimensional array
 * @param {Array} array
 * @returns {Array} cloned array
 */
export function clone<T>(array: T[]): T[] {
  return Object.assign([], array)
}
