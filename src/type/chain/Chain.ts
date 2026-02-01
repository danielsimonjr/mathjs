import { isChain } from '../../utils/is.ts'
import { format } from '../../utils/string.ts'
import { hasOwnProperty, lazy } from '../../utils/object.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

/**
 * JSON representation of a Chain
 */
export interface ChainJSON {
  mathjs: 'Chain'
  value: unknown
}

/**
 * Chain instance interface
 */
export interface ChainInstance {
  type: 'Chain'
  isChain: true
  value: unknown
  done(): unknown
  valueOf(): unknown
  toString(): string
  toJSON(): ChainJSON
  [key: string]: unknown
}

/**
 * Chain constructor interface
 */
export interface ChainConstructor {
  new (value?: unknown): ChainInstance
  fromJSON(json: ChainJSON): ChainInstance
  createProxy(arg0: string | Record<string, unknown>, arg1?: unknown): void
  prototype: ChainInstance
}

/**
 * Import event callback type
 */
type ImportEventCallback = (
  name: string,
  resolver: () => unknown,
  path: string | undefined
) => void

/**
 * On function interface for event subscription
 */
interface OnFunction {
  (event: 'import', callback: ImportEventCallback): void
  (event: string, callback: (...args: unknown[]) => void): void
}

/**
 * Math instance interface with dynamic method access
 */
interface MathInstance {
  [key: string]: unknown
}

/**
 * Dependencies for Chain factory
 */
interface ChainDependencies {
  on?: OnFunction
  math: MathInstance
  typed: TypedFunction
}

const name = 'Chain'
const dependencies = ['?on', 'math', 'typed']

export const createChainClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ on, math, typed }: ChainDependencies): ChainConstructor => {
    /**
     * @constructor Chain
     * Wrap any value in a chain, allowing to perform chained operations on
     * the value.
     *
     * All methods available in the math.js library can be called upon the chain,
     * and then will be evaluated with the value itself as first argument.
     * The chain can be closed by executing chain.done(), which will return
     * the final value.
     *
     * The Chain has a number of special functions:
     * - done()             Finalize the chained operation and return the
     *                      chain's value.
     * - valueOf()          The same as done()
     * - toString()         Returns a string representation of the chain's value.
     *
     * @param {*} [value]
     */
    function Chain(this: ChainInstance, value?: unknown): void {
      if (!(this instanceof Chain)) {
        throw new SyntaxError(
          'Constructor must be called with the new operator'
        )
      }

      if (isChain(value)) {
        this.value = (value as ChainInstance).value
      } else {
        this.value = value
      }
    }

    /**
     * Attach type information
     */
    Chain.prototype.type = 'Chain'
    Chain.prototype.isChain = true

    /**
     * Close the chain. Returns the final value.
     * Does the same as method valueOf()
     * @returns {*} value
     */
    Chain.prototype.done = function (this: ChainInstance): unknown {
      return this.value
    }

    /**
     * Close the chain. Returns the final value.
     * Does the same as method done()
     * @returns {*} value
     */
    Chain.prototype.valueOf = function (this: ChainInstance): unknown {
      return this.value
    }

    /**
     * Get a string representation of the value in the chain
     * @returns {string}
     */
    Chain.prototype.toString = function (this: ChainInstance): string {
      return format(this.value, {})
    }

    /**
     * Get a JSON representation of the chain
     * @returns {Object}
     */
    Chain.prototype.toJSON = function (this: ChainInstance): ChainJSON {
      return {
        mathjs: 'Chain',
        value: this.value
      }
    }

    /**
     * Instantiate a Chain from its JSON representation
     * @param {Object} json  An object structured like
     *                       `{"mathjs": "Chain", value: ...}`,
     *                       where mathjs is optional
     * @returns {Chain}
     */
    ;(Chain as unknown as ChainConstructor).fromJSON = function (
      json: ChainJSON
    ): ChainInstance {
      return new (Chain as unknown as ChainConstructor)(json.value)
    }

    /**
     * Create a proxy method for the chain
     * @param {string} name
     * @param {Function} fn      The function to be proxied
     *                           If fn is no function, it is silently ignored.
     * @private
     */
    function createProxy(name: string, fn: unknown): void {
      if (typeof fn === 'function') {
        ;(Chain.prototype as Record<string, unknown>)[name] = chainify(
          fn as (...args: unknown[]) => unknown
        )
      }
    }

    /**
     * Create a proxy method for the chain
     * @param {string} name
     * @param {function} resolver   The function resolving with the
     *                              function to be proxied
     * @private
     */
    function createLazyProxy(name: string, resolver: () => unknown): void {
      lazy(
        Chain.prototype as Record<string, unknown>,
        name,
        function outerResolver() {
          const fn = resolver()
          if (typeof fn === 'function') {
            return chainify(fn as (...args: unknown[]) => unknown)
          }

          return undefined // if not a function, ignore
        }
      )
    }

    /**
     * Make a function chainable
     * @param {function} fn
     * @return {Function} chain function
     * @private
     */
    function chainify(
      fn: ((...args: unknown[]) => unknown) & { name?: string }
    ): (this: ChainInstance, ...args: unknown[]) => ChainInstance {
      return function (this: ChainInstance, ...rest: unknown[]): ChainInstance {
        // Here, `this` will be the context of a Chain instance
        if (rest.length === 0) {
          return new (Chain as unknown as ChainConstructor)(fn(this.value))
        }
        const args: unknown[] = [this.value]
        for (let i = 0; i < rest.length; i++) {
          args[i + 1] = rest[i]
        }
        if (typed.isTypedFunction(fn as TypedFunction)) {
          const sigObject = typed.resolve(fn as TypedFunction, args)
          // We want to detect if a rest parameter has matched across the
          // value in the chain and the current arguments of this call.
          // That is the case if and only if the matching signature has
          // exactly one parameter (which then must be a rest parameter
          // as it is matching at least two actual arguments).
          if (sigObject && sigObject.params.length === 1) {
            throw new Error(
              'chain function ' +
                fn.name +
                ' cannot match rest parameter between chain value and additional arguments.'
            )
          }
          if (sigObject) {
            return new (Chain as unknown as ChainConstructor)(
              sigObject.implementation.apply(fn, args)
            )
          }
        }
        return new (Chain as unknown as ChainConstructor)(fn.apply(fn, args))
      }
    }

    /**
     * Create a proxy for a single method, or an object with multiple methods.
     * Example usage:
     *
     *   Chain.createProxy('add', function add (x, y) {...})
     *   Chain.createProxy({
     *     add:      function add (x, y) {...},
     *     subtract: function subtract (x, y) {...}
     *   }
     *
     * @param {string | Object} arg0   A name (string), or an object with
     *                                 functions
     * @param {*} [arg1]               A function, when arg0 is a name
     */
    ;(Chain as unknown as ChainConstructor).createProxy = function (
      arg0: string | Record<string, unknown>,
      arg1?: unknown
    ): void {
      if (typeof arg0 === 'string') {
        // createProxy(name, value)
        createProxy(arg0, arg1)
      } else {
        // createProxy(values)
        for (const name in arg0) {
          if (hasOwnProperty(arg0, name) && excludedNames[name] === undefined) {
            createLazyProxy(name, () => arg0[name])
          }
        }
      }
    }

    const excludedNames: Record<string, boolean> = {
      expression: true,
      docs: true,
      type: true,
      classes: true,
      json: true,
      error: true,
      isChain: true // conflicts with the property isChain of a Chain instance
    }

    // create proxy for everything that is in math.js
    ;(Chain as unknown as ChainConstructor).createProxy(math)

    // register on the import event, automatically add a proxy for every imported function.
    if (on) {
      on(
        'import',
        function (
          name: string,
          resolver: () => unknown,
          path: string | undefined
        ) {
          if (!path) {
            // an imported function (not a data type or something special)
            createLazyProxy(name, resolver)
          }
        }
      )
    }

    return Chain as unknown as ChainConstructor
  },
  { isClass: true }
)
