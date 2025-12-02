import Decimal from 'decimal.js'
import { factory } from '../../utils/factory.js'

// Export BigNumber type for use in other modules
export type BigNumber = any

const name = 'BigNumber'
const dependencies = ['?on', 'config']

export interface BigNumberJSON {
  mathjs: 'BigNumber'
  value: string
}

// Cast Decimal to any for extending with custom properties
const DecimalClass = Decimal as any

export const createBigNumberClass = /* #__PURE__ */ factory(name, dependencies, ({ on, config }: {
  on?: (event: string, callback: (curr: any, prev: any) => void) => void
  config: { precision: number }
}) => {
  const BigNumber = DecimalClass.clone({ precision: config.precision, modulo: DecimalClass.EUCLID }) as any
  BigNumber.prototype = Object.create(BigNumber.prototype)

  /**
   * Attach type information
   */
  BigNumber.prototype.type = 'BigNumber'
  BigNumber.prototype.isBigNumber = true

  /**
   * Get a JSON representation of a BigNumber containing
   * type information
   * @returns {Object} Returns a JSON object structured as:
   *                   `{"mathjs": "BigNumber", "value": "0.2"}`
   */
  BigNumber.prototype.toJSON = function (this: any): BigNumberJSON {
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
  BigNumber.fromJSON = function (json: BigNumberJSON): any {
    return new BigNumber(json.value)
  }

  if (on) {
    // listen for changed in the configuration, automatically apply changed precision
    on('config', function (curr, prev) {
      if (curr.precision !== prev.precision) {
        BigNumber.config({ precision: curr.precision })
      }
    })
  }

  return BigNumber
}, { isClass: true })
