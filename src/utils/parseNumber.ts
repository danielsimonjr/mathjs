import { factory } from './factory.js'

const name = 'parseNumberWithConfig'
const dependencies = ['config', '?bignumber']

export const createParseNumberWithConfig = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ config, bignumber }) => {
    /**
     * Parse a string to a number type based on the config.number setting.
     *
     * Respects the configured number type:
     * - config.number = 'number': JavaScript number
     * - config.number = 'BigNumber': BigNumber instance
     * - config.number = 'bigint': bigint (fallback to number for decimals)
     * - config.number = 'Fraction': Fraction instance
     *
     * @param str - String representation of a number
     * @returns Parsed number in configured type
     *
     * @example
     * // With config.number = 'BigNumber'
     * parseNumberWithConfig('10')  // Returns: BigNumber(10)
     *
     * @example
     * // With config.number = 'bigint'
     * parseNumberWithConfig('5')    // Returns: 5n
     * parseNumberWithConfig('3.14') // Returns: 3.14 (number fallback)
     */
    function parseNumberWithConfig(str: string): number | any {
      if (typeof str !== 'string') {
        throw new TypeError(
          `parseNumberWithConfig expects string, got ${typeof str}`
        )
      }

      const numberType = config.number || 'number'

      switch (numberType) {
        case 'BigNumber':
          if (!bignumber) {
            throw new Error(
              'BigNumber not available. Configure mathjs with BigNumber support.'
            )
          }
          return bignumber(str)

        case 'bigint':
          // bigint doesn't support decimals - fallback to number
          if (str.includes('.') || str.includes('e') || str.includes('E')) {
            const num = Number(str)
            if (isNaN(num)) {
              throw new SyntaxError(`String "${str}" is not a valid number`)
            }
            return num
          }
          try {
            return BigInt(str)
          } catch (e) {
            throw new SyntaxError(`String "${str}" is not a valid number`)
          }

        case 'Fraction':
          // TODO: Add fraction dependency when Fraction support needed
          const fracNum = Number(str)
          if (isNaN(fracNum)) {
            throw new SyntaxError(`String "${str}" is not a valid number`)
          }
          return fracNum

        case 'number':
        default:
          const num = Number(str)
          if (isNaN(num)) {
            throw new SyntaxError(`String "${str}" is not a valid number`)
          }
          return num
      }
    }

    return parseNumberWithConfig
  }
)
