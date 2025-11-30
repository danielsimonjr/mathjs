import { isBigNumber, isComplex, isNode, isUnit, typeOf } from '../../utils/is.js'
import { factory } from '../../utils/factory.js'
import { getPrecedence } from '../operators.js'

type MathNode = any

const name = 'ConditionalNode'
const dependencies = [
  'Node'
]

export const createConditionalNode = /* #__PURE__ */ factory(name, dependencies, ({ Node }: {
  Node: any
}) => {
  /**
   * Test whether a condition is met
   * @param {*} condition
   * @returns {boolean} true if condition is true or non-zero, else false
   */
  function testCondition (condition: any): boolean {
    if (typeof condition === 'number' ||
        typeof condition === 'boolean' ||
        typeof condition === 'string') {
      return !!condition
    }

    if (condition) {
      if (isBigNumber(condition)) {
        return !(condition as any).isZero()
      }

      if (isComplex(condition)) {
        return !!((condition.re || condition.im))
      }

      if (isUnit(condition)) {
        return !!condition.value
      }
    }

    if (condition === null || condition === undefined) {
      return false
    }

    throw new TypeError('Unsupported type of condition "' + typeOf(condition) + '"')
  }

  class ConditionalNode extends Node {
    condition: MathNode
    trueExpr: MathNode
    falseExpr: MathNode

    /**
     * A lazy evaluating conditional operator: 'condition ? trueExpr : falseExpr'
     *
     * @param {Node} condition   Condition, must result in a boolean
     * @param {Node} trueExpr    Expression evaluated when condition is true
     * @param {Node} falseExpr   Expression evaluated when condition is true
     *
     * @constructor ConditionalNode
     * @extends {Node}
     */
    constructor (condition: MathNode, trueExpr: MathNode, falseExpr: MathNode) {
      super()
      if (!isNode(condition)) { throw new TypeError('Parameter condition must be a Node') }
      if (!isNode(trueExpr)) { throw new TypeError('Parameter trueExpr must be a Node') }
      if (!isNode(falseExpr)) { throw new TypeError('Parameter falseExpr must be a Node') }

      this.condition = condition
      this.trueExpr = trueExpr
      this.falseExpr = falseExpr
    }

    // @ts-expect-error - intentionally override Function.name
    static readonly name = name
    get type (): string { return name }
    get isConditionalNode (): boolean { return true }

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
    _compile (math: any, argNames: Record<string, boolean>): (scope: any, args: any, context: any) => any {
      const evalCondition = this.condition._compile(math, argNames)
      const evalTrueExpr = this.trueExpr._compile(math, argNames)
      const evalFalseExpr = this.falseExpr._compile(math, argNames)

      return function evalConditionalNode (scope: any, args: any, context: any) {
        return testCondition(evalCondition(scope, args, context))
          ? evalTrueExpr(scope, args, context)
          : evalFalseExpr(scope, args, context)
      }
    }

    /**
     * Execute a callback for each of the child nodes of this node
     * @param {function(child: Node, path: string, parent: Node)} callback
     */
    forEach (callback: (child: MathNode, path: string, parent: MathNode) => void): void {
      callback(this.condition, 'condition', this as any)
      callback(this.trueExpr, 'trueExpr', this as any)
      callback(this.falseExpr, 'falseExpr', this as any)
    }

    /**
     * Create a new ConditionalNode whose children are the results of calling
     * the provided callback function for each child of the original node.
     * @param {function(child: Node, path: string, parent: Node): Node} callback
     * @returns {ConditionalNode} Returns a transformed copy of the node
     */
    map (callback: (child: MathNode, path: string, parent: MathNode) => MathNode): ConditionalNode {
      return new ConditionalNode(
        (this as any)._ifNode(callback(this.condition, 'condition', this as any)),
        (this as any)._ifNode(callback(this.trueExpr, 'trueExpr', this as any)),
        (this as any)._ifNode(callback(this.falseExpr, 'falseExpr', this as any))
      )
    }

    /**
     * Create a clone of this node, a shallow copy
     * @return {ConditionalNode}
     */
    clone (): ConditionalNode {
      return new ConditionalNode(this.condition, this.trueExpr, this.falseExpr)
    }

    /**
     * Get string representation
     * @param {Object} options
     * @return {string} str
     */
    _toString (options?: any): string {
      const parenthesis =
          (options && options.parenthesis) ? options.parenthesis : 'keep'
      const precedence =
          getPrecedence(this, parenthesis, options && options.implicit, undefined)

      // Enclose Arguments in parentheses if they are an OperatorNode
      // or have lower or equal precedence
      // NOTE: enclosing all OperatorNodes in parentheses is a decision
      // purely based on aesthetics and readability
      let condition = this.condition.toString(options)
      const conditionPrecedence =
          getPrecedence(this.condition, parenthesis, options && options.implicit, undefined)
      if ((parenthesis === 'all') ||
          (this.condition.type === 'OperatorNode') ||
          ((conditionPrecedence !== null) &&
              (conditionPrecedence <= precedence))) {
        condition = '(' + condition + ')'
      }

      let trueExpr = this.trueExpr.toString(options)
      const truePrecedence =
          getPrecedence(this.trueExpr, parenthesis, options && options.implicit, undefined)
      if ((parenthesis === 'all') ||
          (this.trueExpr.type === 'OperatorNode') ||
          ((truePrecedence !== null) && (truePrecedence <= precedence))) {
        trueExpr = '(' + trueExpr + ')'
      }

      let falseExpr = this.falseExpr.toString(options)
      const falsePrecedence =
          getPrecedence(this.falseExpr, parenthesis, options && options.implicit, undefined)
      if ((parenthesis === 'all') ||
          (this.falseExpr.type === 'OperatorNode') ||
          ((falsePrecedence !== null) && (falsePrecedence <= precedence))) {
        falseExpr = '(' + falseExpr + ')'
      }
      return condition + ' ? ' + trueExpr + ' : ' + falseExpr
    }

    /**
     * Get a JSON representation of the node
     * @returns {Object}
     */
    toJSON (): { mathjs: string; condition: MathNode; trueExpr: MathNode; falseExpr: MathNode } {
      return {
        mathjs: name,
        condition: this.condition,
        trueExpr: this.trueExpr,
        falseExpr: this.falseExpr
      }
    }

    /**
     * Instantiate an ConditionalNode from its JSON representation
     * @param {Object} json
     *     An object structured like
     *     ```
     *     {"mathjs": "ConditionalNode",
     *      "condition": ...,
     *      "trueExpr": ...,
     *      "falseExpr": ...}
     *     ```
     *     where mathjs is optional
     * @returns {ConditionalNode}
     */
    static fromJSON (json: { condition: MathNode; trueExpr: MathNode; falseExpr: MathNode }): ConditionalNode {
      return new ConditionalNode(json.condition, json.trueExpr, json.falseExpr)
    }

    /**
     * Get HTML representation
     * @param {Object} options
     * @return {string} str
     */
    _toHTML (options?: any): string {
      const parenthesis =
          (options && options.parenthesis) ? options.parenthesis : 'keep'
      const precedence =
          getPrecedence(this, parenthesis, options && options.implicit, undefined)

      // Enclose Arguments in parentheses if they are an OperatorNode
      // or have lower or equal precedence
      // NOTE: enclosing all OperatorNodes in parentheses is a decision
      // purely based on aesthetics and readability
      let condition = this.condition.toHTML(options)
      const conditionPrecedence =
          getPrecedence(this.condition, parenthesis, options && options.implicit, undefined)
      if ((parenthesis === 'all') ||
          (this.condition.type === 'OperatorNode') ||
          ((conditionPrecedence !== null) &&
              (conditionPrecedence <= precedence))) {
        condition =
          '<span class="math-parenthesis math-round-parenthesis">(</span>' +
          condition +
          '<span class="math-parenthesis math-round-parenthesis">)</span>'
      }

      let trueExpr = this.trueExpr.toHTML(options)
      const truePrecedence =
          getPrecedence(this.trueExpr, parenthesis, options && options.implicit, undefined)
      if ((parenthesis === 'all') ||
          (this.trueExpr.type === 'OperatorNode') ||
          ((truePrecedence !== null) && (truePrecedence <= precedence))) {
        trueExpr =
          '<span class="math-parenthesis math-round-parenthesis">(</span>' +
          trueExpr +
          '<span class="math-parenthesis math-round-parenthesis">)</span>'
      }

      let falseExpr = this.falseExpr.toHTML(options)
      const falsePrecedence =
          getPrecedence(this.falseExpr, parenthesis, options && options.implicit, undefined)
      if ((parenthesis === 'all') ||
          (this.falseExpr.type === 'OperatorNode') ||
          ((falsePrecedence !== null) && (falsePrecedence <= precedence))) {
        falseExpr =
          '<span class="math-parenthesis math-round-parenthesis">(</span>' +
          falseExpr +
          '<span class="math-parenthesis math-round-parenthesis">)</span>'
      }
      return condition +
        '<span class="math-operator math-conditional-operator">?</span>' +
        trueExpr +
        '<span class="math-operator math-conditional-operator">:</span>' +
        falseExpr
    }

    /**
     * Get LaTeX representation
     * @param {Object} options
     * @return {string} str
     */
    _toTex (options?: any): string {
      return '\\begin{cases} {' +
        this.trueExpr.toTex(options) + '}, &\\quad{\\text{if }\\;' +
        this.condition.toTex(options) +
        '}\\\\{' + this.falseExpr.toTex(options) +
        '}, &\\quad{\\text{otherwise}}\\end{cases}'
    }
  }

  return ConditionalNode
}, { isClass: true, isNode: true })
