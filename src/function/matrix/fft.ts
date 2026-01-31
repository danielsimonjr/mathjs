import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Minimum array size for WASM to be beneficial
const WASM_FFT_THRESHOLD = 64 // At least 64 elements

/**
 * Check if n is a power of 2
 */
function isPowerOf2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

/**
 * Convert complex array to interleaved Float64Array [re0, im0, re1, im1, ...]
 */
function complexToInterleaved(
  arr: any[],
  complex: (re: number, im?: number) => any
): Float64Array | null {
  const n = arr.length
  const result = new Float64Array(n * 2)
  for (let i = 0; i < n; i++) {
    const val = arr[i]
    if (typeof val === 'number') {
      result[i * 2] = val
      result[i * 2 + 1] = 0
    } else if (val && typeof val.re === 'number' && typeof val.im === 'number') {
      result[i * 2] = val.re
      result[i * 2 + 1] = val.im
    } else {
      // Unsupported type, fall back to JS
      return null
    }
  }
  return result
}

/**
 * Convert interleaved Float64Array back to complex array
 */
function interleavedToComplex(
  data: Float64Array,
  n: number,
  complex: (re: number, im?: number) => any
): any[] {
  const result: any[] = []
  for (let i = 0; i < n; i++) {
    result.push(complex(data[i * 2], data[i * 2 + 1]))
  }
  return result
}

// WASM integration for FFT is complex due to complex number format differences
// See note above dependencies array for details

// Type definitions for FFT operations
type ComplexNumber = { re: number; im: number } | number
type ComplexArray = ComplexNumber[]
type ComplexArrayND = ComplexNumber[] | any[]

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
}

interface _MatrixData {
  data?: any[] | any[][]
  values?: any[]
  index?: number[]
  ptr?: number[]
  size: number[]
  datatype?: string
}

interface Matrix {
  _data?: any[] | any[][]
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  storage(): 'dense' | 'sparse'
  size(): number[]
  getDataType(): string
  create(data: any[], datatype?: string): Matrix
  valueOf(): any[] | any[][]
}

interface Dependencies {
  typed: TypedFunction
  matrix: (data: any[], storage?: 'dense' | 'sparse') => Matrix
  addScalar: TypedFunction
  multiplyScalar: TypedFunction
  divideScalar: TypedFunction
  exp: TypedFunction
  tau: number
  i: ComplexNumber
  dotDivide: TypedFunction
  conj: TypedFunction
  pow: TypedFunction
  ceil: TypedFunction
  log2: TypedFunction
  complex: (re: number, im?: number) => any
}

// FFT WASM integration note:
// The WASM fft function expects interleaved complex numbers [re, im, re, im, ...]
// while mathjs uses Complex objects with {re, im} properties.
// Full WASM acceleration requires format conversion which may negate benefits
// for small arrays. The existing JavaScript implementation with Chirp-Z transform
// is already well-optimized. WASM acceleration is most beneficial for large
// power-of-2 sized arrays with pure number inputs.
// TODO: Add WASM acceleration for large power-of-2 FFTs

const name = 'fft'
const dependencies = [
  'typed',
  'matrix',
  'addScalar',
  'multiplyScalar',
  'divideScalar',
  'exp',
  'tau',
  'i',
  'dotDivide',
  'conj',
  'pow',
  'ceil',
  'log2',
  'complex'
]

export const createFft = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix: _matrix,
    addScalar,
    multiplyScalar,
    divideScalar,
    exp,
    tau,
    i: I,
    dotDivide,
    conj,
    pow,
    ceil,
    log2,
    complex
  }: Dependencies) => {
    /**
     * Calculate N-dimensional Fourier transform
     *
     * Syntax:
     *
     *     math.fft(arr)
     *
     * Examples:
     *
     *    math.fft([[1, 0], [1, 0]]) // returns [[{re:2, im:0}, {re:2, im:0}], [{re:0, im:0}, {re:0, im:0}]]
     *
     *
     * See Also:
     *
     *      ifft
     *
     * @param {Array | Matrix} arr    An array or matrix
     * @return {Array | Matrix}       N-dimensional Fourier transformation of the array
     */
    return typed(name, {
      Array: _ndFft,
      Matrix: function (matrix: Matrix): Matrix {
        return matrix.create(_ndFft(matrix.valueOf()), matrix._datatype)
      }
    })

    /**
     * Perform an N-dimensional Fourier transform
     *
     * @param {Array} arr      The array
     * @return {Array}         resulting array
     */
    function _ndFft(arr: ComplexArrayND): any {
      const size = arraySize(arr)
      if (size.length === 1) return _fft(arr as ComplexArray, size[0])
      // ndFft along dimension 1,...,N-1 then 1dFft along dimension 0
      return _1dFft(
        (arr as any[]).map((slice) => _ndFft(slice)),
        0
      )
    }

    /**
     * Perform an 1-dimensional Fourier transform
     *
     * @param {Array} arr      The array
     * @param {number} dim     dimension of the array to perform on
     * @return {Array}         resulting array
     */
    function _1dFft(arr: ComplexArrayND, dim: number): any {
      const size = arraySize(arr)
      if (dim !== 0) {
        const result: any[] = []
        for (let i = 0; i < size[0]; i++) {
          result.push(_1dFft((arr as any[])[i], dim - 1))
        }
        return result
      }
      if (size.length === 1) return _fft(arr as ComplexArray)

      function _transpose(arr: any[]): any[] {
        // Swap first 2 dimensions
        const size = arraySize(arr)
        const result: any[] = []
        for (let j = 0; j < size[1]; j++) {
          const row: any[] = []
          for (let i = 0; i < size[0]; i++) {
            row.push(arr[i][j])
          }
          result.push(row)
        }
        return result
      }

      return _transpose(_1dFft(_transpose(arr as any[]), 1) as any[])
    }

    /**
     * Perform an 1-dimensional non-power-of-2 Fourier transform using Chirp-Z Transform
     *
     * @param {Array} arr      The array
     * @return {Array}         resulting array
     */
    function _czt(arr: ComplexArray): ComplexArray {
      const n = arr.length
      const w = exp(divideScalar(multiplyScalar(-1, multiplyScalar(I, tau)), n))
      const chirp: ComplexNumber[] = []
      for (let i = 1 - n; i < n; i++) {
        chirp.push(pow(w, divideScalar(pow(i, 2), 2)))
      }
      const N2 = pow(2, ceil(log2(n + n - 1)))
      const xp: ComplexNumber[] = []
      for (let i = 0; i < n; i++) {
        xp.push(multiplyScalar(arr[i], chirp[n - 1 + i]))
      }
      for (let i = 0; i < N2 - n; i++) {
        xp.push(0)
      }
      const ichirp: ComplexNumber[] = []
      for (let i = 0; i < n + n - 1; i++) {
        ichirp.push(divideScalar(1, chirp[i]))
      }
      for (let i = 0; i < N2 - (n + n - 1); i++) {
        ichirp.push(0)
      }
      const fftXp = _fft(xp)
      const fftIchirp = _fft(ichirp)
      const fftProduct: ComplexNumber[] = []
      for (let i = 0; i < N2; i++) {
        fftProduct.push(multiplyScalar(fftXp[i], fftIchirp[i]))
      }
      const ifftProduct = dotDivide(conj(_ndFft(conj(fftProduct))), N2)
      const ret: ComplexNumber[] = []
      for (let i = n - 1; i < n + n - 1; i++) {
        ret.push(multiplyScalar(ifftProduct[i], chirp[i]))
      }
      return ret
    }

    /**
     * Perform an 1-dimensional Fourier transform
     *
     * @param {Array} arr      The array
     * @param {number} len     Optional length override
     * @return {Array}         resulting array
     */
    function _fft(arr: ComplexArray, len?: number): ComplexArray {
      const length = len ?? arr.length
      if (length === 1) return [arr[0]]

      // WASM fast path for power-of-2 sized arrays
      const wasm = wasmLoader.getModule()
      if (
        wasm &&
        length >= WASM_FFT_THRESHOLD &&
        isPowerOf2(length) &&
        len === undefined // Only use WASM for top-level call
      ) {
        const interleaved = complexToInterleaved(arr, complex)
        if (interleaved) {
          try {
            const dataAlloc = wasmLoader.allocateFloat64Array(interleaved)
            try {
              wasm.fft(dataAlloc.ptr, length, 0) // 0 = forward FFT
              return interleavedToComplex(dataAlloc.array, length, complex)
            } finally {
              wasmLoader.free(dataAlloc.ptr)
            }
          } catch (e) {
            // Fall back to JS implementation on WASM error
          }
        }
      }

      // JavaScript fallback
      if (length % 2 === 0) {
        const ret: ComplexNumber[] = [
          ..._fft(
            arr.filter((_, i) => i % 2 === 0),
            length / 2
          ),
          ..._fft(
            arr.filter((_, i) => i % 2 === 1),
            length / 2
          )
        ]
        for (let k = 0; k < length / 2; k++) {
          const p = ret[k]
          const q = multiplyScalar(
            ret[k + length / 2],
            exp(
              multiplyScalar(multiplyScalar(tau, I), divideScalar(-k, length))
            )
          )
          ret[k] = addScalar(p, q)
          ret[k + length / 2] = addScalar(p, multiplyScalar(-1, q))
        }
        return ret
      } else {
        // use chirp-z transform for non-power-of-2 FFT
        return _czt(arr)
      }
      // throw new Error('Can only calculate FFT of power-of-two size')
    }
  }
)
