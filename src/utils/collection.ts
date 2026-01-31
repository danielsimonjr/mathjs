import { isCollection, isMatrix } from './is.ts'
import { IndexError } from '../error/IndexError.ts'
import {
  arraySize,
  deepMap as arrayDeepMap,
  deepForEach as arrayDeepForEach
} from './array.ts'
import { _switch } from './switch.ts'

// Type definitions for Matrix interface
interface Matrix<T = unknown> {
  forEach(
    callback: (value: T) => void,
    skipZeros: boolean,
    recurse: boolean
  ): void
  map<U>(
    callback: (value: T) => U,
    skipZeros: boolean,
    recurse: boolean
  ): Matrix<U>
  size(): number[]
  valueOf(): T[]
  create(data: T[], datatype?: string): Matrix<T>
  datatype(): string | undefined
}

interface SparseMatrix<T = unknown> {
  _values: T[]
  _index: number[]
  _ptr: number[]
}

/**
 * Test whether an array contains collections
 * @param array - Array to test
 * @returns Returns true when the array contains one or multiple
 *          collections (Arrays or Matrices). Returns false otherwise.
 */
export function containsCollections(array: unknown[]): boolean {
  for (let i = 0; i < array.length; i++) {
    if (isCollection(array[i])) {
      return true
    }
  }
  return false
}

/**
 * Recursively loop over all elements in a given multi dimensional array
 * and invoke the callback on each of the elements.
 * @param array - Array or Matrix to iterate over
 * @param callback - The callback method is invoked with one parameter: the current element in the array
 */
export function deepForEach<T>(
  array: T[] | Matrix<T>,
  callback: (value: T) => void
): void {
  if (isMatrix(array)) {
    ;(array as Matrix<T>).forEach((x) => callback(x), false, true)
  } else {
    arrayDeepForEach(array as T[], callback, true)
  }
}

/**
 * Execute the callback function element wise for each element in array and any
 * nested array
 * Returns an array with the results
 * @param array - Array or Matrix to map over
 * @param callback - The callback is called with two parameters:
 *                   value1 and value2, which contain the current
 *                   element of both arrays.
 * @param skipZeros - Invoke callback function for non-zero values only.
 *
 * @return Mapped result
 */
export function deepMap<T, U>(
  array: T[] | Matrix<T>,
  callback: (value: T) => U,
  skipZeros?: boolean
): U[] | Matrix<U> {
  if (!skipZeros) {
    if (isMatrix(array)) {
      return (array as Matrix<T>).map((x) => callback(x), false, true)
    } else {
      return arrayDeepMap(array as T[], callback, true) as U[]
    }
  }
  const skipZerosCallback = (x: T): T | U => (x === 0 ? x : callback(x))
  if (isMatrix(array)) {
    return (array as Matrix<T>).map((x) => skipZerosCallback(x), false, true) as Matrix<U>
  } else {
    return arrayDeepMap(array as T[], skipZerosCallback, true) as U[]
  }
}

/**
 * Reduce a given matrix or array to a new matrix or
 * array with one less dimension, applying the given
 * callback in the selected dimension.
 * @param mat - Array or Matrix to reduce
 * @param dim - Dimension to reduce
 * @param callback - Callback function
 * @return Reduced result
 */
export function reduce<T, U>(
  mat: T[] | Matrix<T>,
  dim: number,
  callback: (acc: U | T, val: T) => U
): U[] | Matrix<U> {
  const size = Array.isArray(mat) ? arraySize(mat) : (mat as Matrix<T>).size()
  if (dim < 0 || dim >= size.length) {
    // TODO: would be more clear when throwing a DimensionError here
    throw new IndexError(dim, 0, size.length)
  }

  if (isMatrix(mat)) {
    const reduced = _reduce((mat as Matrix<T>).valueOf(), dim, callback)
    return (mat as Matrix<T>).create(
      reduced as unknown as T[],
      (mat as Matrix<T>).datatype()
    ) as unknown as Matrix<U>
  } else {
    return _reduce(mat as T[], dim, callback) as U[]
  }
}

/**
 * Recursively reduce a matrix
 * @param mat - Array to reduce
 * @param dim - Dimension to reduce
 * @param callback - Callback function
 * @returns Reduced result
 * @private
 */
function _reduce<T, U>(
  mat: T[],
  dim: number,
  callback: (acc: U | T, val: T) => U
): U | U[] {
  let i: number
  let ret: U[]
  let val: U | T
  let tran: T[][]

  if (dim <= 0) {
    if (!Array.isArray(mat[0])) {
      val = mat[0]
      for (i = 1; i < mat.length; i++) {
        val = callback(val, mat[i])
      }
      return val as U
    } else {
      tran = _switch(mat as unknown as T[][])
      ret = []
      for (i = 0; i < tran.length; i++) {
        ret[i] = _reduce(tran[i], dim - 1, callback) as U
      }
      return ret
    }
  } else {
    ret = []
    for (i = 0; i < mat.length; i++) {
      ret[i] = _reduce(mat[i] as unknown as T[], dim - 1, callback) as U
    }
    return ret
  }
}

/**
 * Scatter function for sparse matrix operations
 * @param a - Sparse matrix
 * @param j - Column index
 * @param w - Work array for marking visited rows
 * @param x - Work array for storing values
 * @param u - Work array for marking updated rows
 * @param mark - Current mark value
 * @param cindex - Column index array to update
 * @param f - Binary function to apply
 * @param inverse - Whether to inverse the function arguments
 * @param update - Whether to update existing values
 * @param value - Value to use in binary function
 */
export function scatter<T>(
  a: SparseMatrix<T>,
  j: number,
  w: number[],
  x: T[] | null,
  u: number[],
  mark: number,
  cindex: number[],
  f?: (a: T, b: T) => T,
  inverse?: boolean,
  update?: boolean,
  value?: T
): void {
  // a arrays
  const avalues = a._values
  const aindex = a._index
  const aptr = a._ptr

  // vars
  let k: number
  let k0: number
  let k1: number
  let i: number

  // check we need to process values (pattern matrix)
  if (x) {
    // values in j
    for (k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
      // row
      i = aindex[k]
      // check value exists in current j
      if (w[i] !== mark) {
        // i is new entry in j
        w[i] = mark
        // add i to pattern of C
        cindex.push(i)
        // x(i) = A, check we need to call function this time
        if (update && f) {
          // copy value to workspace calling callback function
          x[i] = inverse ? f(avalues[k], value) : f(value, avalues[k])
          // function was called on current row
          u[i] = mark
        } else {
          // copy value to workspace
          x[i] = avalues[k]
        }
      } else {
        // i exists in C already
        if (f) {
          x[i] = inverse ? f(avalues[k], x[i]) : f(x[i], avalues[k])
        }
        // function was called on current row
        u[i] = mark
      }
    }
  } else {
    // values in j
    for (k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
      // row
      i = aindex[k]
      // check value exists in current j
      if (w[i] !== mark) {
        // i is new entry in j
        w[i] = mark
        // add i to pattern of C
        cindex.push(i)
      } else {
        // indicate function was called on current row
        u[i] = mark
      }
    }
  }
}
