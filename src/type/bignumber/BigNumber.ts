import Decimal from 'decimal.js'
import { factory } from '../../utils/factory.ts'

// EUCLID constant for modulo rounding mode
const EUCLID = 9

const name = 'BigNumber'
const dependencies = ['?on', 'config']

/**
 * JSON representation of a BigNumber
 */
export interface BigNumberJSON {
  mathjs: 'BigNumber'
  value: string
}

/**
 * Configuration change event data
 */
export interface ConfigChangeEvent {
  precision: number
  [key: string]: unknown
}

/**
 * BigNumber class constructor interface
 */
export interface BigNumberClass {
  new (value: Decimal.Value): BigNumberInstance
  fromJSON(json: BigNumberJSON): BigNumberInstance
  config(options: Decimal.Config): BigNumberClass
}

/**
 * BigNumber instance interface with mathjs-specific properties
 * Extends Omit<Decimal, 'toJSON'> to avoid conflict with Decimal's toJSON() signature
 */
export interface BigNumberInstance extends Omit<Decimal, 'toJSON'> {
  type: 'BigNumber'
  isBigNumber: true
  toJSON(): BigNumberJSON
}

/** Type alias for convenience */
export type BigNumber = BigNumberInstance

/**
 * Factory dependencies interface
 */
interface BigNumberDependencies {
  on?: (
    event: string,
    callback: (curr: ConfigChangeEvent, prev: ConfigChangeEvent) => void
  ) => void
  config: { precision: number }
}

export const createBigNumberClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ on, config }: BigNumberDependencies) => {
    const BigNumber = (
      Decimal as unknown as {
        clone: (config: Decimal.Config) => BigNumberClass
      }
    ).clone({
      precision: config.precision,
      modulo: EUCLID
    })

    // Create new prototype to break instanceof chain with original Decimal
    const prototype = BigNumber.prototype as BigNumberInstance
    ;(BigNumber as { prototype: object }).prototype = Object.create(prototype)

    /**
     * Attach type information
     */
    ;(BigNumber.prototype as BigNumberInstance).type = 'BigNumber'
    ;(BigNumber.prototype as BigNumberInstance).isBigNumber = true

    /**
     * Get a JSON representation of a BigNumber containing
     * type information
     * @returns {Object} Returns a JSON object structured as:
     *                   `{"mathjs": "BigNumber", "value": "0.2"}`
     */
    ;(BigNumber.prototype as BigNumberInstance).toJSON = function (
      this: BigNumberInstance
    ): BigNumberJSON {
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
    ;(BigNumber as BigNumberClass).fromJSON = function (
      json: BigNumberJSON
    ): BigNumberInstance {
      return new BigNumber(json.value)
    }

    if (on) {
      // listen for changed in the configuration, automatically apply changed precision
      on('config', function (curr: ConfigChangeEvent, prev: ConfigChangeEvent) {
        if (curr.precision !== prev.precision) {
          BigNumber.config({ precision: curr.precision })
        }
      })
    }

    return BigNumber
  },
  { isClass: true }
)
