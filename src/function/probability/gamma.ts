import { factory } from '../../utils/factory.ts'
import { gammaG, gammaNumber, gammaP } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for gamma
interface ComplexType {
  re: number
  im: number
  add(n: number | ComplexType): ComplexType
  sub(n: number): ComplexType
  div(n: ComplexType): ComplexType
  mul(n: number | ComplexType): ComplexType
  neg(): ComplexType
  exp(): ComplexType
  sin(): ComplexType
  pow(n: ComplexType): ComplexType
}

interface ComplexConstructor {
  new (re: number, im?: number): ComplexType
}

interface BigNumberType {
  isInteger(): boolean
  isNegative(): boolean
  isZero(): boolean
  isFinite(): boolean
  minus(n: number | BigNumberType): BigNumberType
  times(n: BigNumberType): BigNumberType
  toNumber(): number
  toPrecision(n: number): string
}

interface BigNumberConstructor {
  new (value: number | string | BigNumberType): BigNumberType
  precision: number
  clone(config: { precision: number }): BigNumberConstructor
}

interface GammaDependencies {
  typed: TypedFunction
  config: ConfigOptions
  multiplyScalar: TypedFunction
  pow: TypedFunction
  BigNumber: BigNumberConstructor
  Complex: ComplexConstructor
}

const name = 'gamma'
const dependencies = [
  'typed',
  'config',
  'multiplyScalar',
  'pow',
  'BigNumber',
  'Complex'
]

export const createGamma = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    multiplyScalar: _multiplyScalar,
    pow: _pow,
    BigNumber,
    Complex
  }: GammaDependencies) => {
    /**
     * Compute the gamma function of a value using Lanczos approximation for
     * small values, and an extended Stirling approximation for large values.
     *
     * To avoid confusion with the matrix Gamma function, this function does
     * not apply to matrices.
     *
     * Syntax:
     *
     *    math.gamma(n)
     *
     * Examples:
     *
     *    math.gamma(5)       // returns 24
     *    math.gamma(-0.5)    // returns -3.5449077018110335
     *    math.gamma(math.i)  // returns -0.15494982830180973 - 0.49801566811835596i
     *
     * See also:
     *
     *    combinations, factorial, permutations
     *
     * @param {number | BigNumber | Complex} n   A real or complex number
     * @return {number | BigNumber | Complex}    The gamma of `n`
     */

    function gammaComplex(n: ComplexType): number | ComplexType {
      if (n.im === 0) {
        return gammaNumber(n.re)
      }

      // Lanczos approximation doesn't work well with real part lower than 0.5
      // So reflection formula is required
      if (n.re < 0.5) {
        // Euler's reflection formula
        // gamma(1-z) * gamma(z) = PI / sin(PI * z)
        // real part of Z should not be integer [sin(PI) == 0 -> 1/0 - undefined]
        // thanks to imperfect sin implementation sin(PI * n) != 0
        // we can safely use it anyway
        const t = new Complex(1 - n.re, -n.im)
        const r = new Complex(Math.PI * n.re, Math.PI * n.im)

        const gammaT = gammaComplex(t)
        return new Complex(Math.PI).div(r.sin()).div(gammaT as ComplexType)
      }

      // Lanczos approximation
      // z -= 1
      let z = new Complex(n.re - 1, n.im)

      // x = gammaPval[0]
      let x: ComplexType = new Complex(gammaP[0], 0)
      // for (i, gammaPval) in enumerate(gammaP):
      for (let i = 1; i < gammaP.length; ++i) {
        // x += gammaPval / (z + i)
        const gammaPval = new Complex(gammaP[i], 0)
        x = x.add(gammaPval.div(z.add(i)))
      }
      // t = z + gammaG + 0.5
      const t = new Complex(z.re + gammaG + 0.5, z.im)

      // y = sqrt(2 * pi) * t ** (z + 0.5) * exp(-t) * x
      const twoPiSqrt = Math.sqrt(2 * Math.PI)
      const tpow = t.pow(z.add(0.5))
      const expt = t.neg().exp()

      // y = [x] * [sqrt(2 * pi)] * [t ** (z + 0.5)] * [exp(-t)]
      return x.mul(twoPiSqrt).mul(tpow).mul(expt)
    }

    return typed(name, {
      number: gammaNumber,
      Complex: gammaComplex,
      BigNumber: function (n: BigNumberType): BigNumberType {
        if (n.isInteger()) {
          return n.isNegative() || n.isZero()
            ? new BigNumber(Infinity)
            : bigFactorial(n.minus(1))
        }

        if (!n.isFinite()) {
          return new BigNumber(n.isNegative() ? NaN : Infinity)
        }

        throw new Error('Integer BigNumber expected')
      }
    })

    /**
     * Calculate factorial for a BigNumber
     * @param {BigNumber} n
     * @returns {BigNumber} Returns the factorial of n
     */
    function bigFactorial(n: BigNumberType): BigNumberType {
      const nNum = n.toNumber()
      if (nNum < 8) {
        return new BigNumber([1, 1, 2, 6, 24, 120, 720, 5040][nNum])
      }

      const precision = config.precision + (Math.log(nNum) | 0)
      const Big = BigNumber.clone({ precision })

      if (nNum % 2 === 1) {
        return n.times(bigFactorial(n.minus(1)))
      }

      let p = nNum
      let prod = new Big(nNum)
      let sum = nNum

      while (p > 2) {
        p -= 2
        sum += p
        prod = prod.times(new BigNumber(sum))
      }

      return new BigNumber(prod.toPrecision(BigNumber.precision))
    }
  }
)
