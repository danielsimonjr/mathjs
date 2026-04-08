import { factory } from '../../utils/factory.js'

const name = 'fft2d'
const dependencies = ['typed']

export const createFft2d = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the 2D Discrete Fourier Transform (2D-DFT) of a matrix.
   *
   * The 2D-DFT is computed as a sequence of 1D DFTs:
   *   1. Apply a 1D DFT to each row of the input matrix
   *   2. Apply a 1D DFT to each column of the intermediate result
   *
   * For an M x N input matrix, the output is an M x N matrix of complex numbers
   * where each element has the form { re: number, im: number }.
   *
   * The DC component (zero frequency) is at position [0][0].
   *
   * Syntax:
   *
   *    math.fft2d(matrix)
   *
   * Examples:
   *
   *    math.fft2d([[1, 1], [1, 1]])
   *    math.fft2d([[1, 0], [0, 0]])
   *
   * See also:
   *
   *    fft, ifft, fourier
   *
   * @param {Array} matrix  2D array of real numbers (array of arrays)
   * @return {Array}        2D array of complex numbers { re, im }
   */
  return typed(name, {
    Array: function (matrix) {
      return _fft2d(matrix)
    }
  })

  /**
   * Compute 1D DFT of a complex signal given as separate re/im arrays.
   * @param {Array<number>} re  Real parts
   * @param {Array<number>} im  Imaginary parts
   * @return {{ re: Array<number>, im: Array<number> }}
   */
  function _dft1d (re, im) {
    const N = re.length
    const outRe = new Array(N).fill(0)
    const outIm = new Array(N).fill(0)

    for (let k = 0; k < N; k++) {
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        outRe[k] += re[n] * cosA + im[n] * sinA
        outIm[k] += -re[n] * sinA + im[n] * cosA
      }
    }

    return { re: outRe, im: outIm }
  }

  function _fft2d (matrix) {
    const M = matrix.length
    if (M === 0) return []

    const N = matrix[0].length
    if (N === 0) return matrix.map(() => [])

    // Step 1: DFT each row
    // Store intermediate results as 2D arrays of complex numbers
    const rowTransformed = new Array(M)
    for (let r = 0; r < M; r++) {
      const rowRe = matrix[r].map(v => (typeof v === 'number' ? v : v.re || 0))
      const rowIm = matrix[r].map(v => (typeof v === 'number' ? 0 : v.im || 0))
      const { re, im } = _dft1d(rowRe, rowIm)
      rowTransformed[r] = re.map((v, i) => ({ re: v, im: im[i] }))
    }

    // Step 2: DFT each column of the row-transformed result
    const result = Array.from({ length: M }, () => new Array(N))

    for (let c = 0; c < N; c++) {
      const colRe = rowTransformed.map(row => row[c].re)
      const colIm = rowTransformed.map(row => row[c].im)
      const { re, im } = _dft1d(colRe, colIm)
      for (let r = 0; r < M; r++) {
        result[r][c] = { re: re[r], im: im[r] }
      }
    }

    return result
  }
})
