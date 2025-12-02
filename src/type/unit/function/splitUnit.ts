import { factory } from '../../../utils/factory.js'

const name = 'splitUnit'
const dependencies = ['typed']

<<<<<<< HEAD
export const createSplitUnit = /* #__PURE__ */ factory(name, dependencies, ({ typed }: MathJsStatic) => {
=======
export const createSplitUnit = /* #__PURE__ */ factory(name, dependencies, ({ typed }: { typed: any }) => {
>>>>>>> claude/typecheck-and-convert-js-01YLWgcoNb8jFsVbPqer68y8
  /**
   * Split a unit in an array of units whose sum is equal to the original unit.
   *
   * Syntax:
   *
   *     math.splitUnit(unit: Unit, parts: Array.<Unit>)
   *
   * Example:
   *
   *     math.splitUnit(new Unit(1, 'm'), ['feet', 'inch'])
   *     // [ 3 feet, 3.3700787401575 inch ]
   *
   * See also:
   *
   *     unit
   *
   * @param {Array} [parts] An array of strings or valueless units.
   * @return {Array} An array of units.
   */
  return typed(name, {
    'Unit, Array': function (unit: any, parts: any[]) {
      return unit.splitUnit(parts)
    }
  })
})
