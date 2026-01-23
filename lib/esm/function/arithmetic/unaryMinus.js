import { factory } from '../../utils/factory.js';
import { deepMap } from '../../utils/collection.js';
import { unaryMinusNumber } from '../../plain/number/index.js';
var name = 'unaryMinus';
var dependencies = ['typed', 'config', '?bignumber'];
export var createUnaryMinus = /* #__PURE__ */factory(name, dependencies, _ref => {
  var {
    typed,
    config,
    bignumber
  } = _ref;
  /**
   * Inverse the sign of a value, apply a unary minus operation.
   *
   * For matrices, the function is evaluated element wise. Boolean values and
   * strings will be converted to a number. For complex numbers, both real and
   * complex value are inverted.
   *
   * Syntax:
   *
   *    math.unaryMinus(x)
   *
   * Examples:
   *
   *    math.unaryMinus(3.5)      // returns -3.5
   *    math.unaryMinus(-4.2)     // returns 4.2
   *
   * See also:
   *
   *    add, subtract, unaryPlus
   *
   * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} x Number to be inverted.
   * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} Returns the value with inverted sign.
   */
  return typed(name, {
    number: unaryMinusNumber,
    'Complex | BigNumber | Fraction': x => x.neg(),
    bigint: x => -x,
    Unit: typed.referToSelf(self => x => {
      var res = x.clone();
      res.value = typed.find(self, res.valueType())(x.value);
      return res;
    }),
    boolean: function boolean(x) {
      // Convert boolean to number: true→1, false→0
      var numValue = x ? 1 : 0;
      var negValue = -numValue;

      // Return in configured number type
      var numberType = (config === null || config === void 0 ? void 0 : config.number) || 'number';
      switch (numberType) {
        case 'BigNumber':
          if (!bignumber) {
            throw new Error('BigNumber not available. Configure mathjs with BigNumber support.');
          }
          return bignumber(negValue);
        case 'bigint':
          return BigInt(negValue);
        case 'Fraction':
          // TODO: Add Fraction support when dependency available
          return negValue;
        case 'number':
        default:
          return negValue;
      }
    },
    // deep map collection, skip zeros since unaryMinus(0) = 0
    'Array | Matrix': typed.referToSelf(self => x => deepMap(x, self, true))

    // TODO: add support for string
  });
});