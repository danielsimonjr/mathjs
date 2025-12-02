import FractionLib from 'fraction.js'
import { factory } from '../../utils/factory.js'
<<<<<<< HEAD
import type { FactoryFunctionMap } from '../../../types/index.js'
=======
import type { FactoryFunctionMap } from '../../types.js'
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

// Cast to any to work around TypeScript's namespace limitations
const Fraction = FractionLib as any

const name = 'Fraction'
const dependencies: [] = []

export const createFractionClass = /* #__PURE__ */ factory(name, dependencies, (): any => {
  /**
   * Attach type information
   */
  Object.defineProperty(Fraction, 'name', { value: 'Fraction' })
  Fraction.prototype.constructor = Fraction
  Fraction.prototype.type = 'Fraction'
  Fraction.prototype.isFraction = true

  /**
   * Get a JSON representation of a Fraction containing type information
   * @returns {Object} Returns a JSON object structured as:
   *                   `{"mathjs": "Fraction", "n": "3", "d": "8"}`
   */
  Fraction.prototype.toJSON = function (this: any): { mathjs: string; n: string; d: string } {
    return {
      mathjs: 'Fraction',
      n: String(this.s * this.n),
      d: String(this.d)
    }
  }

  /**
   * Instantiate a Fraction from a JSON object
   * @param {Object} json  a JSON object structured as:
   *                       `{"mathjs": "Fraction", "n": "3", "d": "8"}`
   * @return {BigNumber}
   */
  Fraction.fromJSON = function (json: { mathjs: string; n: string; d: string }): any {
    return new Fraction(json)
  }

  return Fraction
}, { isClass: true })

declare module '../../types.js' {
  interface FactoryFunctionMap {
    Fraction: typeof createFractionClass
  }
}
