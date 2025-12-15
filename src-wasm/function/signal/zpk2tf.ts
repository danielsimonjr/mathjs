import { factory } from '../../utils/factory.ts'
import type { Matrix, Complex } from '../../types.ts'

const name = 'zpk2tf'

const dependencies = ['typed', 'add', 'multiply', 'Complex', 'number']

/**
 * Transfer function representation [numerator, denominator]
 */
type TransferFunction = [Complex[], Complex[]]

/**
 * Zero, pole, or gain value (can be number, Complex, or BigNumber)
 */
type ZPKValue = number | Complex | { type: string; re?: number; im?: number }

export const createZpk2tf = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, add, multiply, Complex, number }) => {
    /**
     * Compute the transfer function of a zero-pole-gain model.
     *
     * Syntax:
     *      math.zpk2tf(z, p, k)
     *
     * Examples:
     *    math.zpk2tf([1, 2], [-1, -2], 1)    // returns [[1, -3, 2], [1, 3, 2]]
     *
     * See also:
     *   freqz
     *
     * @param {Array} z Array of zeros values
     * @param {Array} p Array of poles values
     * @param {number} k Gain value
     * @return {Array} Two dimensional array containing the numerator (first row) and denominator (second row) polynomials
     *
     */
    return typed(name, {
      'Array,Array,number': function (
        z: ZPKValue[],
        p: ZPKValue[],
        k: number
      ): TransferFunction {
        return _zpk2tf(z, p, k)
      },
      'Array,Array': function (z: ZPKValue[], p: ZPKValue[]): TransferFunction {
        return _zpk2tf(z, p, 1)
      },
      'Matrix,Matrix,number': function (
        z: Matrix,
        p: Matrix,
        k: number
      ): TransferFunction {
        return _zpk2tf(z.valueOf() as ZPKValue[], p.valueOf() as ZPKValue[], k)
      },
      'Matrix,Matrix': function (z: Matrix, p: Matrix): TransferFunction {
        return _zpk2tf(z.valueOf() as ZPKValue[], p.valueOf() as ZPKValue[], 1)
      }
    })

    /**
     * Internal implementation of zpk2tf conversion
     * @param z - Array of zeros
     * @param p - Array of poles
     * @param k - Gain
     * @returns Transfer function [numerator, denominator]
     */
    function _zpk2tf(
      z: ZPKValue[],
      p: ZPKValue[],
      k: number
    ): TransferFunction {
      // Convert bignumbers to numbers if present
      if (z.some((el: any) => el.type === 'BigNumber')) {
        z = z.map((el) => number(el))
      }
      if (p.some((el: any) => el.type === 'BigNumber')) {
        p = p.map((el) => number(el))
      }

      let num: Complex[] = [Complex(1, 0) as Complex]
      let den: Complex[] = [Complex(1, 0) as Complex]

      // Build numerator polynomial from zeros
      // Each zero contributes a factor (s - zero) to the polynomial
      for (let i = 0; i < z.length; i++) {
        let zero: Complex = z[i] as Complex
        if (typeof zero === 'number') zero = Complex(zero, 0) as Complex
        num = _multiply(num, [
          Complex(1, 0) as Complex,
          Complex(-zero.re, -zero.im) as Complex
        ])
      }

      // Build denominator polynomial from poles
      // Each pole contributes a factor (s - pole) to the polynomial
      for (let i = 0; i < p.length; i++) {
        let pole: Complex = p[i] as Complex
        if (typeof pole === 'number') pole = Complex(pole, 0) as Complex
        den = _multiply(den, [
          Complex(1, 0) as Complex,
          Complex(-pole.re, -pole.im) as Complex
        ])
      }

      // Apply gain to numerator
      for (let i = 0; i < num.length; i++) {
        num[i] = multiply(num[i], k) as Complex
      }

      return [num, den]
    }

    /**
     * Multiply two polynomials represented as coefficient arrays
     * @param a - First polynomial coefficients
     * @param b - Second polynomial coefficients
     * @returns Product polynomial coefficients
     */
    function _multiply(a: Complex[], b: Complex[]): Complex[] {
      const c: Complex[] = []

      // Polynomial multiplication using convolution
      for (let i = 0; i < a.length + b.length - 1; i++) {
        c[i] = Complex(0, 0) as Complex
        for (let j = 0; j < a.length; j++) {
          if (i - j >= 0 && i - j < b.length) {
            c[i] = add(c[i], multiply(a[j], b[i - j])) as Complex
          }
        }
      }
      return c
    }
  }
)
