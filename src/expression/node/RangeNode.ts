import { isNode, isSymbolNode } from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import { getPrecedence } from '../operators.ts'

// Type definitions
interface Node {
  _compile: (math: Record<string, any>, argNames: Record<string, boolean>) => CompileFunction
  _ifNode: (node: any) => Node
  filter: (callback: (node: Node) => boolean) => Node[]
  toString: (options?: StringOptions) => string
  toHTML: (options?: StringOptions) => string
  toTex: (options?: StringOptions) => string
  isSymbolNode?: boolean
  name?: string
}

type CompileFunction = (scope: any, args: Record<string, any>, context: any) => any

interface StringOptions {
  parenthesis?: 'keep' | 'auto' | 'all'
  implicit?: 'hide' | 'show'
  [key: string]: any
}

interface Parens {
  start: boolean
  step?: boolean
  end: boolean
}

interface Dependencies {
  Node: new (...args: any[]) => Node
}

const name = 'RangeNode'
const dependencies = [
  'Node'
]

export const createRangeNode = /* #__PURE__ */ factory(name, dependencies, ({ Node }: Dependencies) => {
  /**
   * Calculate the necessary parentheses
   * @param {Node} node
   * @param {string} parenthesis
   * @param {string} implicit
   * @return {Object} parentheses
   * @private
   */
  function calculateNecessaryParentheses (node: RangeNode, parenthesis: string, implicit: string): Parens {
    const precedence = getPrecedence(node as any, parenthesis, implicit, undefined)
    const parens: Parens = { start: false, end: false }

    const startPrecedence = getPrecedence(node.start as any, parenthesis, implicit, undefined)
    parens.start = ((startPrecedence !== null) && (startPrecedence <= precedence)) ||
      (parenthesis === 'all')

    if (node.step) {
      const stepPrecedence = getPrecedence(node.step as any, parenthesis, implicit, undefined)
      parens.step = ((stepPrecedence !== null) && (stepPrecedence <= precedence)) ||
        (parenthesis === 'all')
    }

    const endPrecedence = getPrecedence(node.end as any, parenthesis, implicit, undefined)
    parens.end = ((endPrecedence !== null) && (endPrecedence <= precedence)) ||
      (parenthesis === 'all')

    return parens
  }

  class RangeNode extends Node {
    start: Node
    end: Node
    step: Node | null

    /**
     * @constructor RangeNode
     * @extends {Node}
     * create a range
     * @param {Node} start  included lower-bound
     * @param {Node} end    included upper-bound
     * @param {Node} [step] optional step
     */
    constructor (start: Node, end: Node, step?: Node) {
      super()
      // validate inputs
      if (!isNode(start)) throw new TypeError('Node expected')
      if (!isNode(end)) throw new TypeError('Node expected')
      if (step && !isNode(step)) throw new TypeError('Node expected')
      if (arguments.length > 3) throw new Error('Too many arguments')

      this.start = start // included lower-bound
      this.end = end // included upper-bound
      this.step = step || null // optional step
    }

    // @ts-expect-error: intentionally overriding Function.name
    static name = name
    get type (): string { return name }
    get isRangeNode (): boolean { return true }

    /**
     * Check whether the RangeNode needs the `end` symbol to be defined.
     * This end is the size of the Matrix in current dimension.
     * @return {boolean}
     */
    needsEnd (): boolean {
      // find all `end` symbols in this RangeNode
      const endSymbols = this.filter(function (node: Node): boolean {
        return isSymbolNode(node) && (node.name === 'end')
      })

      return endSymbols.length > 0
    }

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
      const range = math.range
      const evalStart = this.start._compile(math, argNames)
      const evalEnd = this.end._compile(math, argNames)

      if (this.step) {
        const evalStep = this.step._compile(math, argNames)

        return function evalRangeNode (scope: any, args: Record<string, any>, context: any): any {
          return range(
            evalStart(scope, args, context),
            evalEnd(scope, args, context),
            evalStep(scope, args, context)
          )
        }
      } else {
        return function evalRangeNode (scope: any, args: Record<string, any>, context: any): any {
          return range(
            evalStart(scope, args, context),
            evalEnd(scope, args, context)
          )
        }
      }
    }

    /**
     * Execute a callback for each of the child nodes of this node
     * @param {function(child: Node, path: string, parent: Node)} callback
     */
    forEach (callback: (child: Node, path: string, parent: RangeNode) => void): void {
      callback(this.start, 'start', this)
      callback(this.end, 'end', this)
      if (this.step) {
        callback(this.step, 'step', this)
      }
    }

    /**
     * Create a new RangeNode whose children are the results of calling
     * the provided callback function for each child of the original node.
     * @param {function(child: Node, path: string, parent: Node): Node} callback
     * @returns {RangeNode} Returns a transformed copy of the node
     */
    map (callback: (child: Node, path: string, parent: RangeNode) => Node): RangeNode {
      return new RangeNode(
        this._ifNode(callback(this.start, 'start', this)),
        this._ifNode(callback(this.end, 'end', this)),
        this.step ? this._ifNode(callback(this.step, 'step', this)) : undefined
      )
    }

    /**
     * Create a clone of this node, a shallow copy
     * @return {RangeNode}
     */
    clone (): RangeNode {
      return new RangeNode(this.start, this.end, this.step || undefined)
    }

    /**
     * Get string representation
     * @param {Object} options
     * @return {string} str
     */
    _toString (options?: StringOptions): string {
      const parenthesis =
          (options && options.parenthesis) ? options.parenthesis : 'keep'
      const parens =
          calculateNecessaryParentheses(
            this, parenthesis, options && options.implicit || 'hide')

      // format string as start:step:stop
      let str: string

      let start = this.start.toString(options)
      if (parens.start) {
        start = '(' + start + ')'
      }
      str = start

      if (this.step) {
        let step = this.step.toString(options)
        if (parens.step) {
          step = '(' + step + ')'
        }
        str += ':' + step
      }

      let end = this.end.toString(options)
      if (parens.end) {
        end = '(' + end + ')'
      }
      str += ':' + end

      return str
    }

    /**
     * Get a JSON representation of the node
     * @returns {Object}
     */
    toJSON (): Record<string, any> {
      return {
        mathjs: name,
        start: this.start,
        end: this.end,
        step: this.step
      }
    }

    /**
     * Instantiate an RangeNode from its JSON representation
     * @param {Object} json
     *     An object structured like
     *     `{"mathjs": "RangeNode", "start": ..., "end": ..., "step": ...}`,
     *     where mathjs is optional
     * @returns {RangeNode}
     */
    static fromJSON (json: { start: Node, end: Node, step?: Node }): RangeNode {
      return new RangeNode(json.start, json.end, json.step)
    }

    /**
     * Get HTML representation
     * @param {Object} options
     * @return {string} str
     */
    _toHTML (options?: StringOptions): string {
      const parenthesis =
          (options && options.parenthesis) ? options.parenthesis : 'keep'
      const parens =
          calculateNecessaryParentheses(
            this, parenthesis, options && options.implicit || 'hide')

      // format string as start:step:stop
      let str: string

      let start = this.start.toHTML(options)
      if (parens.start) {
        start = '<span class="math-parenthesis math-round-parenthesis">(</span>' +
          start +
          '<span class="math-parenthesis math-round-parenthesis">)</span>'
      }
      str = start

      if (this.step) {
        let step = this.step.toHTML(options)
        if (parens.step) {
          step = '<span class="math-parenthesis math-round-parenthesis">(</span>' +
            step +
            '<span class="math-parenthesis math-round-parenthesis">)</span>'
        }
        str += '<span class="math-operator math-range-operator">:</span>' + step
      }

      let end = this.end.toHTML(options)
      if (parens.end) {
        end = '<span class="math-parenthesis math-round-parenthesis">(</span>' +
          end +
          '<span class="math-parenthesis math-round-parenthesis">)</span>'
      }
      str += '<span class="math-operator math-range-operator">:</span>' + end

      return str
    }

    /**
     * Get LaTeX representation
     * @params {Object} options
     * @return {string} str
     */
    _toTex (options?: StringOptions): string {
      const parenthesis =
          (options && options.parenthesis) ? options.parenthesis : 'keep'
      const parens =
          calculateNecessaryParentheses(
            this, parenthesis, options && options.implicit || 'hide')

      let str = this.start.toTex(options)
      if (parens.start) {
        str = `\\left(${str}\\right)`
      }

      if (this.step) {
        let step = this.step.toTex(options)
        if (parens.step) {
          step = `\\left(${step}\\right)`
        }
        str += ':' + step
      }

      let end = this.end.toTex(options)
      if (parens.end) {
        end = `\\left(${end}\\right)`
      }
      str += ':' + end

      return str
    }
  }

  return RangeNode
}, { isClass: true, isNode: true })
