import { escape } from '../../utils/string.js'
import { getSafeProperty } from '../../utils/customs.js'
import { factory } from '../../utils/factory.js'
import { toSymbol } from '../../utils/latex.js'

// Type definitions
interface Node {
  clone: () => Node
}

type CompileFunction = (scope: any, args: Record<string, any>, context: any) => any

interface StringOptions {
  [key: string]: any
}

interface Unit {
  new (value: null, unit: string): Unit
}

interface UnitConstructor {
  isValuelessUnit: (name: string) => boolean
}

interface Dependencies {
  math: Record<string, any>
  Unit?: UnitConstructor
  Node: new (...args: any[]) => Node
}

const name = 'SymbolNode'
const dependencies = [
  'math',
  '?Unit',
  'Node'
]

export const createSymbolNode = /* #__PURE__ */ factory(name, dependencies, ({ math, Unit, Node }: Dependencies) => {
  /**
   * Check whether some name is a valueless unit like "inch".
   * @param {string} name
   * @return {boolean}
   */
  function isValuelessUnit (name: string): boolean {
    return Unit ? Unit.isValuelessUnit(name) : false
  }

  class SymbolNode extends Node {
    name: string

    /**
     * @constructor SymbolNode
     * @extends {Node}
     * A symbol node can hold and resolve a symbol
     * @param {string} name
     * @extends {Node}
     */
    constructor (name: string) {
      super()
      // validate input
      if (typeof name !== 'string') {
        throw new TypeError('String expected for parameter "name"')
      }

      this.name = name
    }

    get type (): string { return 'SymbolNode' }
    get isSymbolNode (): boolean { return true }

    /**
     * Compile a node into a JavaScript function.
     * This basically pre-calculates as much as possible and only leaves open
     * calculations which depend on a dynamic scope with variables.
     * @param {Object} math     Math.js namespace with functions and constants.
     * @param {Object} argNames An object with argument names as key and `true`
     *                          as value. Used in the SymbolNode to optimize
     *                          for arguments from user assigned functions
     *                          (see FunctionAssignmentNode) or special symbols
     *                          like `end` (see IndexNode).
     * @return {function} Returns a function which can be called like:
     *                        evalNode(scope: Object, args: Object, context: *)
     */
    _compile (math: Record<string, any>, argNames: Record<string, boolean>): CompileFunction {
      const name = this.name

      if (argNames[name] === true) {
        // this is a FunctionAssignment argument
        // (like an x when inside the expression of a function
        // assignment `f(x) = ...`)
        return function (scope: any, args: Record<string, any>, context: any): any {
          return getSafeProperty(args, name)
        }
      } else if (name in math) {
        return function (scope: any, args: Record<string, any>, context: any): any {
          return scope.has(name)
            ? scope.get(name)
            : getSafeProperty(math, name)
        }
      } else {
        const isUnit = isValuelessUnit(name)

        return function (scope: any, args: Record<string, any>, context: any): any {
          return scope.has(name)
            ? scope.get(name)
            : isUnit
              ? new (Unit as any)(null, name)
              : SymbolNode.onUndefinedSymbol(name)
        }
      }
    }

    /**
     * Execute a callback for each of the child nodes of this node
     * @param {function(child: Node, path: string, parent: Node)} callback
     */
    forEach (callback: (child: Node, path: string, parent: SymbolNode) => void): void {
      // nothing to do, we don't have any children
    }

    /**
     * Create a new SymbolNode with children produced by the given callback.
     * Trivial since a SymbolNode has no children
     * @param {function(child: Node, path: string, parent: Node) : Node} callback
     * @returns {SymbolNode} Returns a clone of the node
     */
    map (callback: (child: Node, path: string, parent: SymbolNode) => Node): SymbolNode {
      return this.clone()
    }

    /**
     * Throws an error 'Undefined symbol {name}'
     * @param {string} name
     */
    static onUndefinedSymbol (name: string): never {
      throw new Error('Undefined symbol ' + name)
    }

    /**
     * Create a clone of this node, a shallow copy
     * @return {SymbolNode}
     */
    // @ts-expect-error: clone returns SymbolNode which is compatible with MathNode
    clone (): SymbolNode {
      return new SymbolNode(this.name)
    }

    /**
     * Get string representation
     * @param {Object} options
     * @return {string} str
     * @override
     */
    _toString (options?: StringOptions): string {
      return this.name
    }

    /**
     * Get HTML representation
     * @param {Object} options
     * @return {string} str
     * @override
     */
    _toHTML (options?: StringOptions): string {
      const name = escape(this.name)

      if (name === 'true' || name === 'false') {
        return '<span class="math-symbol math-boolean">' + name + '</span>'
      } else if (name === 'i') {
        return '<span class="math-symbol math-imaginary-symbol">' +
          name + '</span>'
      } else if (name === 'Infinity') {
        return '<span class="math-symbol math-infinity-symbol">' +
          name + '</span>'
      } else if (name === 'NaN') {
        return '<span class="math-symbol math-nan-symbol">' + name + '</span>'
      } else if (name === 'null') {
        return '<span class="math-symbol math-null-symbol">' + name + '</span>'
      } else if (name === 'undefined') {
        return '<span class="math-symbol math-undefined-symbol">' +
          name + '</span>'
      }

      return '<span class="math-symbol">' + name + '</span>'
    }

    /**
     * Get a JSON representation of the node
     * @returns {Object}
     */
    toJSON (): Record<string, any> {
      return {
        mathjs: 'SymbolNode',
        name: this.name
      }
    }

    /**
     * Instantiate a SymbolNode from its JSON representation
     * @param {Object} json  An object structured like
     *                       `{"mathjs": "SymbolNode", name: "x"}`,
     *                       where mathjs is optional
     * @returns {SymbolNode}
     */
    static fromJSON (json: { name: string }): SymbolNode {
      return new SymbolNode(json.name)
    }

    /**
     * Get LaTeX representation
     * @param {Object} options
     * @return {string} str
     * @override
     */
    _toTex (options?: StringOptions): string {
      let isUnit = false
      if ((typeof math[this.name] === 'undefined') &&
          isValuelessUnit(this.name)) {
        isUnit = true
      }
      const symbol = toSymbol(this.name, isUnit)
      if (symbol[0] === '\\') {
        // no space needed if the symbol starts with '\'
        return symbol
      }
      // the space prevents symbols from breaking stuff like '\cdot'
      // if it's written right before the symbol
      return ' ' + symbol
    }
  }

  return SymbolNode
}, { isClass: true, isNode: true })
