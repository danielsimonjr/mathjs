import FractionJs, { Fraction as FractionClass, NumeratorDenominator } from 'fraction.js'
import { factory } from '../../utils/factory.ts'

/**
 * JSON representation of a Fraction
 */
export interface FractionJSON {
  mathjs: 'Fraction'
  n: string
  d: string
}

/**
 * Extended Fraction type with mathjs additions
 */
export interface Fraction extends FractionClass {
  type: 'Fraction'
  isFraction: true
  toJSON(): FractionJSON
}

/**
 * Valid input types for Fraction constructor
 */
export type FractionValue = number | string | bigint | NumeratorDenominator | FractionJSON

/**
 * Fraction constructor interface with static methods
 */
export interface FractionConstructor {
  new (value?: FractionValue, denominator?: number | bigint): Fraction
  (value?: FractionValue, denominator?: number | bigint): Fraction
  prototype: Fraction
  fromJSON: (json: FractionJSON) => Fraction
}

// Cast to allow prototype access and static method additions
const Fraction = FractionJs as unknown as FractionConstructor

const name = 'Fraction'
const dependencies: string[] = []

export const createFractionClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  () => {
    /**
     * Attach type information
     */
    Object.defineProperty(Fraction, 'name', { value: 'Fraction' })
    Fraction.prototype.constructor = Fraction as any
    Fraction.prototype.type = 'Fraction'
    Fraction.prototype.isFraction = true

    /**
     * Get a JSON representation of a Fraction containing type information
     * @returns {Object} Returns a JSON object structured as:
     *                   `{"mathjs": "Fraction", "n": "3", "d": "8"}`
     */
    Fraction.prototype.toJSON = function (this: Fraction): FractionJSON {
      // Convert sign to BigInt to avoid "Cannot mix BigInt and other types" error
      // when n is a BigInt (as in local Fraction implementation)
      const signedNumerator =
        typeof this.n === 'bigint' ? BigInt(this.s) * this.n : this.s * this.n
      return {
        mathjs: 'Fraction',
        n: String(signedNumerator),
        d: String(this.d)
      }
    }

    /**
     * Instantiate a Fraction from a JSON object
     * @param {Object} json  a JSON object structured as:
     *                       `{"mathjs": "Fraction", "n": "3", "d": "8"}`
     * @return {Fraction}
     */
    Fraction.fromJSON = function (json: FractionJSON): Fraction {
      return new Fraction(json)
    }

    return Fraction
  },
  { isClass: true }
)

declare module '../../types.js' {
  interface FactoryFunctionMap {
    Fraction: typeof createFractionClass
  }
}
