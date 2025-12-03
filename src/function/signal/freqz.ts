import { factory } from '../../utils/factory.js'
import type { Matrix, Complex } from '../../types.js'

const name = 'freqz'

const dependencies = [
  'typed',
  'add',
  'multiply',
  'Complex',
  'divide',
  'matrix'
]

/**
 * Frequency response result
 */
interface FrequencyResponse {
  h: Complex[] | Matrix
  w: number[] | Matrix
}

export const createFreqz = /* #__PURE__ */ factory(name, dependencies, ({ typed, add, multiply, Complex, divide, matrix }) => {
  /**
   * Calculates the frequency response of a filter given its numerator and denominator coefficients.
   *
   * Syntax:
   *    math.freqz(b, a)
   *    math.freqz(b, a, w)
   *
   * Examples:
   *   math.freqz([1, 2], [1, 2, 3], 4) // returns { h: [0.5 + 0i, 0.4768589245763655 + 0.2861153547458193i, 0.25000000000000006 + 0.75i, -0.770976571635189 + 0.4625859429811135i], w: [0, 0.7853981633974483, 1.5707963267948966, 2.356194490192345 ] }
   *   math.freqz([1, 2], [1, 2, 3], [0, 1]) // returns { h: [0.5 + 0i, 0.45436781 + 0.38598051i], w: [0, 1] }
   *
   * See also:
   *  zpk2tf
   *
   * @param {Array.<number>} b The numerator coefficients of the filter.
   * @param {Array.<number>} a The denominator coefficients of the filter.
   * @param {Array.<number>} [w] A vector of frequencies (in radians/sample) at which the frequency response is to be computed or the number of points to compute (if a number is not provided, the default is 512 points)
   * @returns {Object} An object with two properties: h, a vector containing the complex frequency response, and w, a vector containing the normalized frequencies (in radians/sample) at which the response was computed.
   *
   *
   */
  return typed(name, {
    'Array, Array': function (b: number[], a: number[]): FrequencyResponse {
      const w = createBins(512)
      return _freqz(b, a, w)
    },
    'Array, Array, Array': function (b: number[], a: number[], w: number[]): FrequencyResponse {
      return _freqz(b, a, w)
    },
    'Array, Array, number': function (b: number[], a: number[], w: number): FrequencyResponse {
      if (w < 0) {
        throw new Error('w must be a positive number')
      }
      const w2 = createBins(w)
      return _freqz(b, a, w2)
    },
    'Matrix, Matrix': function (b: Matrix, a: Matrix): FrequencyResponse {
      const _w = createBins(512)
      const { w, h } = _freqz(b.valueOf() as number[], a.valueOf() as number[], _w)
      return {
        w: matrix(w),
        h: matrix(h)
      }
    },
    'Matrix, Matrix, Matrix': function (b: Matrix, a: Matrix, w: Matrix): FrequencyResponse {
      const { h } = _freqz(b.valueOf() as number[], a.valueOf() as number[], w.valueOf() as number[])
      return {
        h: matrix(h),
        w: matrix(w)
      }
    },
    'Matrix, Matrix, number': function (b: Matrix, a: Matrix, w: number): FrequencyResponse {
      if (w < 0) {
        throw new Error('w must be a positive number')
      }
      const _w = createBins(w)
      const { h } = _freqz(b.valueOf() as number[], a.valueOf() as number[], _w)
      return {
        h: matrix(h),
        w: matrix(_w)
      }
    }
  })

  /**
   * Internal frequency response calculation
   * @param b - Numerator coefficients
   * @param a - Denominator coefficients
   * @param w - Frequency bins (radians/sample)
   * @returns Frequency response with h (complex) and w (frequencies)
   */
  function _freqz(b: number[], a: number[], w: number[]): { h: Complex[]; w: number[] } {
    const num: Complex[] = []
    const den: Complex[] = []

    // Compute numerator and denominator at each frequency
    for (let i = 0; i < w.length; i++) {
      let sumNum: Complex = Complex(0, 0) as Complex
      let sumDen: Complex = Complex(0, 0) as Complex

      // Sum b[j] * exp(-j*w[i]*1i) for numerator
      for (let j = 0; j < b.length; j++) {
        sumNum = add(sumNum, multiply(b[j], Complex(Math.cos(-j * w[i]), Math.sin(-j * w[i])))) as Complex
      }

      // Sum a[j] * exp(-j*w[i]*1i) for denominator
      for (let j = 0; j < a.length; j++) {
        sumDen = add(sumDen, multiply(a[j], Complex(Math.cos(-j * w[i]), Math.sin(-j * w[i])))) as Complex
      }

      num.push(sumNum)
      den.push(sumDen)
    }

    // Compute frequency response H(w) = Num(w) / Den(w)
    const h: Complex[] = []
    for (let i = 0; i < num.length; i++) {
      h.push(divide(num[i], den[i]) as Complex)
    }

    return { h, w }
  }

  /**
   * Create frequency bins from 0 to PI
   * @param n - Number of frequency bins
   * @returns Array of frequencies in radians/sample
   */
  function createBins(n: number): number[] {
    const bins: number[] = []
    for (let i = 0; i < n; i++) {
      bins.push(i / n * Math.PI)
    }
    return bins
  }
})
