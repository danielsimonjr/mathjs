import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { isMatrix } from '../../utils/is.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Minimum array size for WASM to be beneficial
const WASM_IFFT_THRESHOLD = 64 // At least 64 elements

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
  _complex: (re: number, im?: number) => any
): Float64Array | null {
  const n = arr.length
  const result = new Float64Array(n * 2)
  for (let i = 0; i < n; i++) {
    const val = arr[i]
    if (typeof val === 'number') {
      result[i * 2] = val
      result[i * 2 + 1] = 0
    } else if (
      val &&
      typeof val.re === 'number' &&
      typeof val.im === 'number'
    ) {
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

// Type definitions for FFT operations
type ComplexNumber = { re: number; im: number } | number
type ComplexArrayND = ComplexNumber[] | ComplexArrayND[]

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
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
  fft: TypedFunction<ComplexArrayND | Matrix>
  dotDivide: TypedFunction
  conj: TypedFunction
  complex: (re: number, im?: number) => any
}

const name = 'ifft'
const dependencies = ['typed', 'fft', 'dotDivide', 'conj', 'complex']

export const createIfft = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, fft, dotDivide, conj, complex }: Dependencies) => {
    /**
     * Calculate N-dimensional inverse Fourier transform
     *
     * Syntax:
     *
     *     math.ifft(arr)
     *
     * Examples:
     *
     *    math.ifft([[2, 2], [0, 0]]) // returns [[{re:1, im:0}, {re:0, im:0}], [{re:1, im:0}, {re:0, im:0}]]
     *
     * See Also:
     *
     *      fft
     *
     * @param {Array | Matrix} arr    An array or matrix
     * @return {Array | Matrix}       N-dimensional inverse Fourier transformation of the array
     */
    return typed(name, {
      'Array | Matrix': function (
        arr: ComplexArrayND | Matrix
      ): ComplexArrayND | Matrix {
        const size = isMatrix(arr) ? (arr as Matrix).size() : arraySize(arr)
        const totalSize = size.reduce(
          (acc: number, curr: number) => acc * curr,
          1
        )

        // WASM fast path for 1D power-of-2 sized arrays
        if (size.length === 1) {
          const length = size[0]
          const wasm = wasmLoader.getModule()
          if (wasm && length >= WASM_IFFT_THRESHOLD && isPowerOf2(length)) {
            const arrData = isMatrix(arr) ? (arr as Matrix).valueOf() : arr
            const interleaved = complexToInterleaved(arrData as any[], complex)
            if (interleaved) {
              try {
                const dataAlloc = wasmLoader.allocateFloat64Array(interleaved)
                try {
                  wasm.fft(dataAlloc.ptr, length, 1) // 1 = inverse FFT
                  const result = interleavedToComplex(
                    dataAlloc.array,
                    length,
                    complex
                  )
                  // WASM fft with inverse=1 already divides by N
                  if (isMatrix(arr)) {
                    return (arr as Matrix).create(result)
                  }
                  return result
                } finally {
                  wasmLoader.free(dataAlloc.ptr)
                }
              } catch {
                // Fall back to JS implementation on WASM error
              }
            }
          }
        }

        // JavaScript fallback
        return dotDivide(conj(fft(conj(arr))), totalSize)
      }
    })
  }
)
