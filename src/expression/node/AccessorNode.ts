import {
  isAccessorNode,
  isArrayNode,
  isConstantNode,
  isFunctionNode,
  isIndexNode,
  isNode,
  isObjectNode,
  isParenthesisNode,
  isSymbolNode
} from '../../utils/is.ts'
import { getSafeProperty } from '../../utils/customs.ts'
import { factory } from '../../utils/factory.ts'
import { accessFactory } from './utils/access.ts'
import type { MathNode } from './Node.ts'

const name = 'AccessorNode'
const dependencies = ['subset', 'Node']

export const createAccessorNode = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    subset,
    Node
  }: {
    subset: any
    Node: new (...args: any[]) => MathNode
  }) => {
    const access = accessFactory({ subset })

    /**
     * Are parenthesis needed?
     * @private
     */
    function needParenthesis(node: MathNode): boolean {
      // TODO: maybe make a method on the nodes which tells whether they need parenthesis?
      return !(
        isAccessorNode(node) ||
        isArrayNode(node) ||
        isConstantNode(node) ||
        isFunctionNode(node) ||
        isObjectNode(node) ||
        isParenthesisNode(node) ||
        isSymbolNode(node)
      )
    }

    class AccessorNode extends Node {
      object: MathNode
      index: any // IndexNode
      optionalChaining: boolean

      /**
       * @constructor AccessorNode
       * @extends {Node}
       * Access an object property or get a matrix subset
       *
       * @param {Node} object                 The object from which to retrieve
       *                                      a property or subset.
       * @param {IndexNode} index             IndexNode containing ranges
       * @param {boolean} [optionalChaining=false]
       *     Optional property, if the accessor was written as optional-chaining
       *     using `a?.b`, or `a?.["b"] with bracket notation.
       *     Forces evaluate to undefined if the given object is undefined or null.
       */
      constructor(
        object: MathNode,
        index: any,
        optionalChaining: boolean = false
      ) {
        super()
        if (!isNode(object)) {
          throw new TypeError('Node expected for parameter "object"')
        }
        if (!isIndexNode(index)) {
          throw new TypeError('IndexNode expected for parameter "index"')
        }

        this.object = object
        this.index = index
        this.optionalChaining = optionalChaining
      }

      // readonly property name
      get name(): string {
        if (this.index) {
          return this.index.isObjectProperty()
            ? this.index.getObjectProperty()
            : ''
        } else {
          return (this.object as any).name || ''
        }
      }

      // @ts-expect-error: intentionally overriding Function.name
      static name = name
      get type(): string {
        return name
      }
      get isAccessorNode(): boolean {
        return true
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
      _compile(
        math: any,
        argNames: Record<string, boolean>
      ): (scope: any, args: any, context: any) => any {
        const evalObject = this.object._compile(math, argNames)
        const evalIndex = this.index._compile(math, argNames)

        const optionalChaining = this.optionalChaining
        const prevOptionalChaining =
          isAccessorNode(this.object) && (this.object as any).optionalChaining

        if (this.index.isObjectProperty()) {
          const prop = this.index.getObjectProperty()
          return function evalAccessorNode(
            scope: any,
            args: any,
            context: any
          ) {
            const ctx = context || {}
            const object = evalObject(scope, args, ctx)

            if (optionalChaining && object == null) {
              ctx.optionalShortCircuit = true
              return undefined
            }

            if (prevOptionalChaining && ctx?.optionalShortCircuit) {
              return undefined
            }

            // get a property from an object evaluated using the scope.
            return getSafeProperty(object, prop)
          }
        } else {
          return function evalAccessorNode(
            scope: any,
            args: any,
            context: any
          ) {
            const ctx = context || {}
            const object = evalObject(scope, args, ctx)

            if (optionalChaining && object == null) {
              ctx.optionalShortCircuit = true
              return undefined
            }

            if (prevOptionalChaining && ctx?.optionalShortCircuit) {
              return undefined
            }

            // we pass just object here instead of context:
            const index = evalIndex(scope, args, object)
            return access(object, index)
          }
        }
      }

      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(
        callback: (child: MathNode, path: string, parent: MathNode) => void
      ): void {
        callback(this.object, 'object', this as any)
        callback(this.index, 'index', this as any)
      }

      /**
       * Create a new AccessorNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {AccessorNode} Returns a transformed copy of the node
       */
      map(
        callback: (child: MathNode, path: string, parent: MathNode) => MathNode
      ): AccessorNode {
        return new AccessorNode(
          this._ifNode(callback(this.object, 'object', this as any)),
          this._ifNode(callback(this.index, 'index', this as any)),
          this.optionalChaining
        )
      }

      /**
       * Create a clone of this node, a shallow copy
       * @return {AccessorNode}
       */
      clone(): AccessorNode {
        return new AccessorNode(this.object, this.index, this.optionalChaining)
      }

      /**
       * Get string representation
       * @param {Object} options
       * @return {string}
       */
      _toString(options?: any): string {
        let object = this.object.toString(options)
        if (needParenthesis(this.object)) {
          object = '(' + object + ')'
        }
        const optionalChaining = this.optionalChaining
          ? this.index.dotNotation
            ? '?'
            : '?.'
          : ''
        return object + optionalChaining + this.index.toString(options)
      }

      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string}
       */
      _toHTML(options?: any): string {
        let object = this.object.toHTML(options)
        if (needParenthesis(this.object)) {
          object =
            '<span class="math-parenthesis math-round-parenthesis">(</span>' +
            object +
            '<span class="math-parenthesis math-round-parenthesis">)</span>'
        }

        return object + this.index.toHTML(options)
      }

      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string}
       */
      _toTex(options?: any): string {
        let object = this.object.toTex(options)
        if (needParenthesis(this.object)) {
          object = "\\left(' + object + '\\right)"
        }

        return object + this.index.toTex(options)
      }

      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON(): {
        mathjs: string
        object: MathNode
        index: any
        optionalChaining: boolean
      } {
        return {
          mathjs: name,
          object: this.object,
          index: this.index,
          optionalChaining: this.optionalChaining
        }
      }

      /**
       * Instantiate an AccessorNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "AccessorNode", object: ..., index: ...}`,
       *     where mathjs is optional
       * @returns {AccessorNode}
       */
      static fromJSON(json: {
        object: MathNode
        index: any
        optionalChaining?: boolean
      }): AccessorNode {
        return new AccessorNode(json.object, json.index, json.optionalChaining)
      }
    }

    return AccessorNode
  },
  { isClass: true, isNode: true }
)
