import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { isMatrix } from '../../utils/is.ts'

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
}

const name = 'ifft'
const dependencies = ['typed', 'fft', 'dotDivide', 'conj']

export const createIfft = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, fft, dotDivide, conj }: Dependencies) => {
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
        return dotDivide(conj(fft(conj(arr))), totalSize)
      }
    })
  }
)
