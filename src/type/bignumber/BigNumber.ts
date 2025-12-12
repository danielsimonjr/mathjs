import { Decimal } from '../local/Decimal.ts'
import type { Decimal as DecimalType } from '../local/Decimal.ts'
import { factory } from '../../utils/factory.ts'

const name = 'BigNumber'
const dependencies = ['?on', 'config']

export interface BigNumberJSON {
  mathjs: 'BigNumber'
  value: string
}

export interface BigNumberClass {
  new(value: any): BigNumberInstance
  fromJSON(json: BigNumberJSON): BigNumberInstance
}

export interface BigNumberInstance {
  type: 'BigNumber'
  isBigNumber: true
  toJSON(): BigNumberJSON
}

// Type alias for convenience
export type BigNumber = BigNumberInstance

export const createBigNumberClass = /* #__PURE__ */ factory(name, dependencies, ({ on, config }: {
  on?: (event: string, callback: (curr: any, prev: any) => void) => void
  config: { precision: number }
}) => {
  const BigNumber = (Decimal as any).clone({ precision: config.precision, modulo: (Decimal as any).EUCLID }) as BigNumberClass
  ;(BigNumber as any).prototype = Object.create((BigNumber as any).prototype)

  /**
   * Attach type information
   */
  ;(BigNumber as any).prototype.type = 'BigNumber'
  ;(BigNumber as any).prototype.isBigNumber = true

  /**
   * Get a JSON representation of a BigNumber containing
   * type information
   * @returns {Object} Returns a JSON object structured as:
   *                   `{"mathjs": "BigNumber", "value": "0.2"}`
   */
  ;(BigNumber as any).prototype.toJSON = function (this: DecimalType): BigNumberJSON {
    return {
      mathjs: 'BigNumber',
      value: this.toString()
    }
  }

  /**
   * Instantiate a BigNumber from a JSON object
   * @param {Object} json  a JSON object structured as:
   *                       `{"mathjs": "BigNumber", "value": "0.2"}`
   * @return {BigNumber}
   */
  ;(BigNumber as any).fromJSON = function (json: BigNumberJSON): DecimalType {
    return new (BigNumber as any)(json.value)
  }

  if (on) {
    // listen for changed in the configuration, automatically apply changed precision
    on('config', function (curr, prev) {
      if (curr.precision !== prev.precision) {
        ;(BigNumber as any).config({ precision: curr.precision })
      }
    })
  }

  return BigNumber
}, { isClass: true })
