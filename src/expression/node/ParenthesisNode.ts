import { isNode } from '../../utils/is.js'
import { factory } from '../../utils/factory.js'

type MathNode = any
type CompileFunction = (scope: any, args: Record<string, any>, context: any) => any

interface StringOptions {
  parenthesis?: 'keep' | 'auto' | 'all'
  [key: string]: any
}

const name = 'ParenthesisNode'
const dependencies = [
  'Node'
]

export const createParenthesisNode = /* #__PURE__ */ factory(name, dependencies, ({ Node }: { Node: any }) => {
  class ParenthesisNode extends Node {
    content: MathNode

    /**
     * @constructor ParenthesisNode
     * @extends {Node}
     * A parenthesis node describes manual parenthesis from the user input
     * @param {Node} content
     * @extends {Node}
     */
    constructor (content: MathNode) {
      super()
      // validate input
      if (!isNode(content)) {
        throw new TypeError('Node expected for parameter "content"')
      }

      this.content = content
    }

    static readonly name = name
    get type (): string { return name }
    get isParenthesisNode (): boolean { return true }

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
      return this.content._compile(math, argNames)
    }

    /**
     * Get the content of the current Node.
     * @return {Node} content
     * @override
     **/
    getContent (): MathNode {
      return this.content.getContent()
    }

    /**
     * Execute a callback for each of the child nodes of this node
     * @param {function(child: Node, path: string, parent: Node)} callback
     */
    forEach (callback: (child: MathNode, path: string, parent: ParenthesisNode) => void): void {
      callback(this.content, 'content', this)
    }

    /**
     * Create a new ParenthesisNode whose child is the result of calling
     * the provided callback function on the child of this node.
     * @param {function(child: Node, path: string, parent: Node) : Node} callback
     * @returns {ParenthesisNode} Returns a clone of the node
     */
    map (callback: (child: MathNode, path: string, parent: ParenthesisNode) => MathNode): ParenthesisNode {
      const content = callback(this.content, 'content', this)
      return new ParenthesisNode(content)
    }

    /**
     * Create a clone of this node, a shallow copy
     * @return {ParenthesisNode}
     */
    clone (): ParenthesisNode {
      return new ParenthesisNode(this.content)
    }

    /**
     * Get string representation
     * @param {Object} options
     * @return {string} str
     * @override
     */
    _toString (options?: StringOptions): string {
      if ((!options) ||
          (options && !options.parenthesis) ||
          (options && options.parenthesis === 'keep')) {
        return '(' + this.content.toString(options) + ')'
      }
      return this.content.toString(options)
    }

    /**
     * Get a JSON representation of the node
     * @returns {Object}
     */
    toJSON (): Record<string, any> {
      return { mathjs: name, content: this.content }
    }

    /**
     * Instantiate an ParenthesisNode from its JSON representation
     * @param {Object} json  An object structured like
     *                       `{"mathjs": "ParenthesisNode", "content": ...}`,
     *                       where mathjs is optional
     * @returns {ParenthesisNode}
     */
    static fromJSON (json: { content: MathNode }): ParenthesisNode {
      return new ParenthesisNode(json.content)
    }

    /**
     * Get HTML representation
     * @param {Object} options
     * @return {string} str
     * @override
     */
    _toHTML (options?: StringOptions): string {
      if ((!options) ||
          (options && !options.parenthesis) ||
          (options && options.parenthesis === 'keep')) {
        return '<span class="math-parenthesis math-round-parenthesis">(</span>' +
          this.content.toHTML(options) +
          '<span class="math-parenthesis math-round-parenthesis">)</span>'
      }
      return this.content.toHTML(options)
    }

    /**
     * Get LaTeX representation
     * @param {Object} options
     * @return {string} str
     * @override
     */
    _toTex (options?: StringOptions): string {
      if ((!options) ||
          (options && !options.parenthesis) ||
          (options && options.parenthesis === 'keep')) {
        return `\\left(${this.content.toTex(options)}\\right)`
      }
      return this.content.toTex(options)
    }
  }

  return ParenthesisNode
}, { isClass: true, isNode: true })
