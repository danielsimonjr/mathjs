import { factory } from '../../utils/factory.js'
import { assumptionRegistry } from './assume.js'

const name = 'element'
const dependencies = ['typed']

// Map domain names to internal assumption property names
const DOMAIN_MAP = {
  integer: 'integer',
  real: 'real',
  rational: 'real',
  complex: 'complex',
  positive: 'positive',
  negative: 'negative'
}

export const createElement = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Assert or test that a variable belongs to a mathematical domain.
   *
   * Records the domain membership as an assumption (same registry as assume())
   * and returns true. Domains: 'Integer', 'Real', 'Rational', 'Complex',
   * 'Positive', 'Negative'.
   *
   * Syntax:
   *
   *     math.element(variable, domain)
   *
   * Examples:
   *
   *     math.element("x", "Integer")
   *     math.element("y", "Real")
   *     math.element("z", "Positive")
   *
   * See also:
   *
   *     assume, reduce
   *
   * @param {string} variable    The variable name
   * @param {string} domain      The domain name (case-insensitive)
   * @return {boolean}           true when the assumption is recorded
   */
  return typed(name, {
    'string, string': function (variable, domain) {
      const key = domain.toLowerCase()
      if (!Object.prototype.hasOwnProperty.call(DOMAIN_MAP, key)) {
        throw new Error(
          'element: unknown domain "' + domain + '". Valid domains: ' +
          Object.keys(DOMAIN_MAP).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
        )
      }
      const prop = DOMAIN_MAP[key]
      assumptionRegistry.set(variable, prop)
      return true
    }
  })
})
