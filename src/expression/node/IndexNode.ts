import { map } from '../../utils/array.ts'
import { getSafeProperty } from '../../utils/customs.ts'
import { factory } from '../../utils/factory.ts'
import { isArray, isConstantNode, isMatrix, isNode, isString, typeOf } from '../../utils/is.ts'
import { escape } from '../../utils/string.ts'

// Type definitions
interface Node {
  _compile: (math: Record<string, any>, argNames: Record<string, boolean>) => CompileFunction
  _ifNode: (node: any) => Node
  filter: (callback: (node: Node) => boolean) => Node[]
  isSymbolNode?: boolean
  name?: string
  value?: any
  toHTML: (options?: StringOptions) => string
  toTex: (options?: StringOptions) => string
  toString: (options?: StringOptions) => string
}

type CompileFunction = (scope: any, args: Record<string, any>, context: any) => any

interface StringOptions {
  [key: string]: any
}

interface Dependencies {
  Node: new (...args: any[]) => Node
  size: (value: any) => number[]
}

const name = 'IndexNode'
const dependencies = [
  'Node',
  'size'
]

export const createIndexNode = /* #__PURE__ */ factory(name, dependencies, ({ Node, size }: Dependencies) => {
  class IndexNode extends Node {
    dimensions: Node[]
    dotNotation: boolean

    /**
     * @constructor IndexNode
     * @extends Node
     *
     * Describes a subset of a matrix or an object property.
     * Cannot be used on its own, needs to be used within an AccessorNode or
     * AssignmentNode.
     *
     * @param {Node[]} dimensions
     * @param {boolean} [dotNotation=false]
     *     Optional property describing whether this index was written using dot
     *     notation like `a.b`, or using bracket notation like `a["b"]`
     *     (which is the default). This property is used for string conversion.
     */
    constructor (dimensions: Node[], dotNotation?: boolean) {
      super()
      this.dimensions = dimensions
      this.dotNotation = dotNotation || false

      // validate input
      if (!Array.isArray(dimensions) || !dimensions.every(isNode)) {
        throw new TypeError(
          'Array containing Nodes expected for parameter "dimensions"')
      }
      if (this.dotNotation && !this.isObjectProperty()) {
        throw new Error('dotNotation only applicable for object properties')
      }
    }

    // @ts-expect-error: intentionally overriding Function.name
    static name = name
    get type (): string { return name }
    get isIndexNode (): boolean { return true }

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
    // @ts-expect-error: method signature matches MathNode interface
    _compile (math: Record<string, any>, argNames: Record<string, boolean>): CompileFunction {
      // TODO: implement support for bignumber (currently bignumbers are silently
      //       reduced to numbers when changing the value to zero-based)

      // TODO: Optimization: when the range values are ConstantNodes,
      //       we can beforehand resolve the zero-based value

      // optimization for a simple object property
      const evalDimensions = map(this.dimensions, function (dimension: Node, i: number): CompileFunction {
        const needsEnd = dimension
          .filter((node: Node) => node.isSymbolNode && node.name === 'end')
          .length > 0

        if (needsEnd) {
          // SymbolNode 'end' is used inside the index,
          // like in `A[end]` or `A[end - 2]`
          const childArgNames = Object.create(argNames)
          childArgNames.end = true

          const _evalDimension = dimension._compile(math, childArgNames)

          return function evalDimension (scope: any, args: Record<string, any>, context: any): any {
            if (!isMatrix(context) && !isArray(context) && !isString(context)) {
              throw new TypeError(
                'Cannot resolve "end": ' +
                  'context must be a Matrix, Array, or string but is ' +
                  typeOf(context))
            }

            const s = size(context)
            const childArgs = Object.create(args)
            childArgs.end = s[i]

            return _evalDimension(scope, childArgs, context)
          }
        } else {
          // SymbolNode `end` not used
          return dimension._compile(math, argNames)
        }
      })

      const index = getSafeProperty(math, 'index')

      return function evalIndexNode (scope: any, args: Record<string, any>, context: any): any {
        const dimensions = map(evalDimensions, function (evalDimension: CompileFunction): any {
          return evalDimension(scope, args, context)
        })

        return index(...dimensions)
      }
    }

    /**
     * Execute a callback for each of the child nodes of this node
     * @param {function(child: Node, path: string, parent: Node)} callback
     */
    forEach (callback: (child: Node, path: string, parent: IndexNode) => void): void {
      for (let i = 0; i < this.dimensions.length; i++) {
        callback(this.dimensions[i], 'dimensions[' + i + ']', this)
      }
    }

    /**
     * Create a new IndexNode whose children are the results of calling
     * the provided callback function for each child of the original node.
     * @param {function(child: Node, path: string, parent: Node): Node} callback
     * @returns {IndexNode} Returns a transformed copy of the node
     */
    map (callback: (child: Node, path: string, parent: IndexNode) => Node): IndexNode {
      const dimensions: Node[] = []
      for (let i = 0; i < this.dimensions.length; i++) {
        dimensions[i] = this._ifNode(
          callback(this.dimensions[i], 'dimensions[' + i + ']', this))
      }

      return new IndexNode(dimensions, this.dotNotation)
    }

    /**
     * Create a clone of this node, a shallow copy
     * @return {IndexNode}
     */
    clone (): IndexNode {
      return new IndexNode(this.dimensions.slice(0), this.dotNotation)
    }

    /**
     * Test whether this IndexNode contains a single property name
     * @return {boolean}
     */
    isObjectProperty (): boolean {
      return this.dimensions.length === 1 &&
        isConstantNode(this.dimensions[0]) &&
        typeof this.dimensions[0].value === 'string'
    }

    /**
     * Returns the property name if IndexNode contains a property.
     * If not, returns null.
     * @return {string | null}
     */
    getObjectProperty (): string | null {
      return this.isObjectProperty() ? this.dimensions[0].value : null
    }

    /**
     * Get string representation
     * @param {Object} options
     * @return {string} str
     */
    _toString (options?: StringOptions): string {
      // format the parameters like "[1, 0:5]"
      return this.dotNotation
        ? ('.' + this.getObjectProperty())
        : ('[' + this.dimensions.join(', ') + ']')
    }

    /**
     * Get a JSON representation of the node
     * @returns {Object}
     */
    toJSON (): Record<string, any> {
      return {
        mathjs: name,
        dimensions: this.dimensions,
        dotNotation: this.dotNotation
      }
    }

    /**
     * Instantiate an IndexNode from its JSON representation
     * @param {Object} json
     *     An object structured like
     *     `{"mathjs": "IndexNode", dimensions: [...], dotNotation: false}`,
     *     where mathjs is optional
     * @returns {IndexNode}
     */
    static fromJSON (json: { dimensions: Node[], dotNotation: boolean }): IndexNode {
      return new IndexNode(json.dimensions, json.dotNotation)
    }

    /**
     * Get HTML representation
     * @param {Object} options
     * @return {string} str
     */
    _toHTML (options?: StringOptions): string {
      // format the parameters like "[1, 0:5]"
      const dimensions: string[] = []
      for (let i = 0; i < this.dimensions.length; i++) {
        dimensions[i] = this.dimensions[i].toHTML()
      }
      if (this.dotNotation) {
        return '<span class="math-operator math-accessor-operator">.</span>' +
          '<span class="math-symbol math-property">' +
          escape(this.getObjectProperty() as string) + '</span>'
      } else {
        return '<span class="math-parenthesis math-square-parenthesis">[</span>' +
          dimensions.join('<span class="math-separator">,</span>') +
          '<span class="math-parenthesis math-square-parenthesis">]</span>'
      }
    }

    /**
     * Get LaTeX representation
     * @param {Object} options
     * @return {string} str
     */
    _toTex (options?: StringOptions): string {
      const dimensions = this.dimensions.map(function (range: Node): string {
        return range.toTex(options)
      })

      return this.dotNotation
        ? ('.' + this.getObjectProperty() + '')
        : ('_{' + dimensions.join(',') + '}')
    }
  }

  return IndexNode
}, { isClass: true, isNode: true })
