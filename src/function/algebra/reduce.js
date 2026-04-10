import { factory } from '../../utils/factory.js'
import { getAssumption, assumptionRegistry } from './assume.js'

const name = 'reduce'
const dependencies = ['typed', 'parse', 'solve']

// Domain filter predicates
const DOMAIN_FILTERS = {
  positive: x => x > 0,
  negative: x => x < 0,
  nonnegative: x => x >= 0,
  nonzero: x => Math.abs(x) > 1e-12,
  integer: x => Math.abs(x - Math.round(x)) < 1e-9,
  real: x => isFinite(x),
  complex: () => true
}

// Normalize domain string to internal key
const DOMAIN_ALIASES = {
  positive: 'positive',
  negative: 'negative',
  nonnegative: 'nonnegative',
  nonpositive: 'negative', // approximate alias
  nonzero: 'nonzero',
  integer: 'integer',
  real: 'real',
  complex: 'complex',
  rational: 'real'
}

export const createReduce = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  solve
}) => {
  /**
   * Solve an equation with domain constraints.
   *
   * Similar to solve() but filters solutions by a specified domain or
   * by stored assumptions (set via assume()).
   *
   * Syntax:
   *
   *     math.reduce(expr, variable)
   *     math.reduce(expr, variable, domain)
   *
   * Examples:
   *
   *     math.reduce("x^2 - 1", "x", "Positive")
   *     math.reduce("x^2 - 4", "x", "Negative")
   *     math.reduce("x^2 - 9", "x", "Integer")
   *
   * See also:
   *
   *     solve, assume, element
   *
   * @param {string|Node} expr     The equation or expression
   * @param {string}      variable The variable to solve for
   * @param {string}      [domain] Domain constraint (optional)
   * @return {number[]}            Solutions filtered by domain
   */
  return typed(name, {
    'string, string': function (expr, variable) {
      const assumed = getAssumption(variable) || assumptionRegistry.get(variable)
      return reduceWithDomain(expr, variable, assumed || null)
    },
    'Node, string': function (expr, variable) {
      const assumed = getAssumption(variable) || assumptionRegistry.get(variable)
      return reduceWithDomain(expr.toString(), variable, assumed || null)
    },
    'string, string, string': function (expr, variable, domain) {
      return reduceWithDomain(expr, variable, domain)
    },
    'Node, string, string': function (expr, variable, domain) {
      return reduceWithDomain(expr.toString(), variable, domain)
    }
  })

  function reduceWithDomain (expr, variable, domain) {
    const solutions = solve(expr, variable)

    if (!domain) return solutions

    const key = domain.toLowerCase()
    const filterKey = DOMAIN_ALIASES[key]

    if (!filterKey) {
      throw new Error(
        'reduce: unknown domain "' + domain + '". Valid domains: ' +
        Object.keys(DOMAIN_ALIASES).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
      )
    }

    const pred = DOMAIN_FILTERS[filterKey]
    return solutions.filter(pred)
  }
})
