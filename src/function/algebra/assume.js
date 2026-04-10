import { factory } from '../../utils/factory.js'

const name = 'assume'
const dependencies = ['typed']

// Module-level registry for variable assumptions (exported for use by element, reduce)
export const assumptionRegistry = new Map()

/**
 * Get the stored assumption for a variable.
 * @param {string} variable
 * @return {string|undefined}
 */
export function getAssumption (variable) {
  return assumptionRegistry.get(variable)
}

/**
 * Clear all stored assumptions.
 */
export function clearAssumptions () {
  assumptionRegistry.clear()
}

export const createAssume = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Declare an assumption about a symbolic variable.
   *
   * Stores the assumption in a module-level registry. Valid properties:
   * 'positive', 'negative', 'integer', 'real', 'complex', 'nonnegative', 'nonzero'.
   *
   * **WARNING: Assumptions are stored in a module-level (global) registry.**
   * This means assumptions are shared across all math.js instances created in
   * the same JavaScript module context. If you create multiple math instances
   * (e.g. via `math.create()`), they will all share the same assumption state.
   * Call `clearAssumptions()` to reset the registry when switching contexts.
   *
   * Syntax:
   *
   *     math.assume(variable, property)
   *
   * Examples:
   *
   *     math.assume("x", "positive")
   *     math.assume("n", "integer")
   *
   * See also:
   *
   *     element, reduce, simplify
   *
   * @param {string} variable    The variable name
   * @param {string} property    The assumption property
   * @return {boolean}           true if the assumption was recorded
   */
  const VALID_PROPERTIES = new Set([
    'positive', 'negative', 'integer', 'real', 'complex', 'nonnegative', 'nonzero'
  ])

  return typed(name, {
    'string, string': function (variable, property) {
      const prop = property.toLowerCase()
      if (!VALID_PROPERTIES.has(prop)) {
        throw new Error(
          'assume: unknown property "' + property + '". Valid properties: ' +
          Array.from(VALID_PROPERTIES).join(', ')
        )
      }
      assumptionRegistry.set(variable, prop)
      return true
    }
  })
})
