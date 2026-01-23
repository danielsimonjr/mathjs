import { factory } from './factory.js';
var name = 'parseNumberWithConfig';
var dependencies = ['config', '?bignumber'];
export var createParseNumberWithConfig = /* #__PURE__ */factory(name, dependencies, _ref => {
  var {
    config,
    bignumber
  } = _ref;
  /**
   * Parse a string to a number type based on the config.number setting.
   *
   * Respects the configured number type:
   * - config.number = 'number': JavaScript number
   * - config.number = 'BigNumber': BigNumber instance
   * - config.number = 'bigint': bigint (fallback to number for decimals)
   * - config.number = 'Fraction': Fraction instance
   *
   * @param {string} str - String representation of a number
   * @returns {number|BigNumber|bigint|Fraction} Parsed number in configured type
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
  function parseNumberWithConfig(str) {
    if (typeof str !== 'string') {
      throw new TypeError("parseNumberWithConfig expects string, got ".concat(typeof str));
    }
    var numberType = config.number || 'number';
    switch (numberType) {
      case 'BigNumber':
        if (!bignumber) {
          throw new Error('BigNumber not available. Configure mathjs with BigNumber support.');
        }
        return bignumber(str);
      case 'bigint':
        // bigint doesn't support decimals - fallback to number
        if (str.includes('.') || str.includes('e') || str.includes('E')) {
          var num = Number(str);
          if (isNaN(num)) {
            throw new SyntaxError("String \"".concat(str, "\" is not a valid number"));
          }
          return num;
        }
        try {
          return BigInt(str);
        } catch (e) {
          throw new SyntaxError("String \"".concat(str, "\" is not a valid number"));
        }
      case 'Fraction':
        {
          // TODO: Add fraction dependency when Fraction support needed
          var fracNum = Number(str);
          if (isNaN(fracNum)) {
            throw new SyntaxError("String \"".concat(str, "\" is not a valid number"));
          }
          return fracNum;
        }
      case 'number':
      default:
        {
          var _num = Number(str);
          if (isNaN(_num)) {
            throw new SyntaxError("String \"".concat(str, "\" is not a valid number"));
          }
          return _num;
        }
    }
  }
  return parseNumberWithConfig;
});