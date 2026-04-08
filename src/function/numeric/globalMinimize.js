import { factory } from '../../utils/factory.js'

const name = 'globalMinimize'
const dependencies = ['typed']

export const createGlobalMinimize = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find the global minimum of a function using differential evolution,
     * a population-based stochastic optimization algorithm that does not
     * require derivatives.
     *
     * Syntax:
     *
     *    math.globalMinimize(f, bounds)
     *    math.globalMinimize(f, bounds, options)
     *
     * Examples:
     *
     *    f(x, y) = (x - 3)^2 + (y + 1)^2
     *    globalMinimize(f, [[-10, 10], [-10, 10]])
     *    globalMinimize(f, [[-10, 10], [-10, 10]], {populationSize: 30, maxIter: 500})
     *
     * See also:
     *
     *    minimize, maximize
     *
     * @param {Function} f         Objective function taking an array of numbers, returning a number
     * @param {Array}    bounds    Array of [lo, hi] pairs for each dimension
     * @param {Object}   [options] Options: populationSize (50), maxIter (1000), tol (1e-8), mutation (0.8), crossover (0.7)
     * @return {Object}  Result with properties: x (array), fval (number), iterations (number)
     */
    return typed(name, {
      'function, Array': function (f, bounds) {
        return _differentialEvolution(f, bounds, 50, 1000, 1e-8, 0.8, 0.7)
      },
      'function, Array, Object': function (f, bounds, options) {
        const popSize = options.populationSize !== undefined ? options.populationSize : 50
        const maxIter = options.maxIter !== undefined ? options.maxIter : 1000
        const tol = options.tol !== undefined ? options.tol : 1e-8
        const F = options.mutation !== undefined ? options.mutation : 0.8
        const CR = options.crossover !== undefined ? options.crossover : 0.7
        return _differentialEvolution(f, bounds, popSize, maxIter, tol, F, CR)
      }
    })

    function _differentialEvolution (f, bounds, popSize, maxIter, tol, F, CR) {
      const n = bounds.length
      const lo = bounds.map(b => b[0])
      const hi = bounds.map(b => b[1])

      // Initialize population
      const pop = []
      for (let i = 0; i < popSize; i++) {
        const ind = new Array(n)
        for (let j = 0; j < n; j++) {
          ind[j] = lo[j] + Math.random() * (hi[j] - lo[j])
        }
        pop.push({ x: ind, f: f(ind) })
      }

      let bestIdx = 0
      for (let i = 1; i < popSize; i++) {
        if (pop[i].f < pop[bestIdx].f) bestIdx = i
      }

      let iter = 0
      for (iter = 0; iter < maxIter; iter++) {
        let improved = false

        for (let i = 0; i < popSize; i++) {
          // Select three distinct indices != i
          let a
          let b
          let c
          do { a = Math.floor(Math.random() * popSize) } while (a === i)
          do { b = Math.floor(Math.random() * popSize) } while (b === i || b === a)
          do { c = Math.floor(Math.random() * popSize) } while (c === i || c === a || c === b)

          // Mutation: v = pop[a] + F * (pop[b] - pop[c])
          const v = new Array(n)
          for (let j = 0; j < n; j++) {
            v[j] = pop[a].x[j] + F * (pop[b].x[j] - pop[c].x[j])
            // Clip to bounds
            v[j] = Math.max(lo[j], Math.min(hi[j], v[j]))
          }

          // Crossover: trial vector
          const jRand = Math.floor(Math.random() * n)
          const trial = pop[i].x.slice()
          for (let j = 0; j < n; j++) {
            if (Math.random() < CR || j === jRand) {
              trial[j] = v[j]
            }
          }

          // Selection
          const fTrial = f(trial)
          if (fTrial <= pop[i].f) {
            pop[i] = { x: trial, f: fTrial }
            improved = true
            if (fTrial < pop[bestIdx].f) bestIdx = i
          }
        }

        // Convergence: check spread of population
        if (!improved) {
          let spread = 0
          for (let j = 0; j < n; j++) {
            let minJ = Infinity
            let maxJ = -Infinity
            for (let i = 0; i < popSize; i++) {
              if (pop[i].x[j] < minJ) minJ = pop[i].x[j]
              if (pop[i].x[j] > maxJ) maxJ = pop[i].x[j]
            }
            spread = Math.max(spread, maxJ - minJ)
          }
          if (spread < tol) break
        }
      }

      return {
        x: pop[bestIdx].x,
        fval: pop[bestIdx].f,
        iterations: iter
      }
    }
  }
)
