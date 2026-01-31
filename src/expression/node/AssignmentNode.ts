import {
  isAccessorNode,
  isIndexNode,
  isNode,
  isSymbolNode
} from '../../utils/is.ts'
import { getSafeProperty, setSafeProperty } from '../../utils/customs.ts'
import { factory } from '../../utils/factory.ts'
import { accessFactory } from './utils/access.ts'
import { assignFactory } from './utils/assign.ts'
import { getPrecedence } from '../operators.ts'
import type { MathNode, Scope, CompileFunction, StringOptions } from './Node.ts'

const name = 'AssignmentNode'
const dependencies = [
  'subset',
  '?matrix', // FIXME: should not be needed at all, should be handled by subset
  'Node'
]

/**
 * Interface for SymbolNode with name property
 */
interface SymbolNodeLike extends MathNode {
  name: string
}

/**
 * Interface for AccessorNode with object and index properties
 */
interface AccessorNodeLike extends MathNode {
  object: MathNode
  index: IndexNodeLike
}

/**
 * Interface for IndexNode with dimension indexing methods
 */
interface IndexNodeLike extends MathNode {
  isObjectProperty: () => boolean
  getObjectProperty: () => string
  _compile: (
    math: MathNamespace,
    argNames: Record<string, boolean>
  ) => CompileFunction
}

/**
 * The math namespace interface
 */
interface MathNamespace {
  [key: string]: unknown
}

/**
 * Subset function type for getting/setting subsets of matrices
 */
type SubsetFunction = (
  value: unknown,
  index: unknown,
  replacement?: unknown
) => unknown

/**
 * Matrix function type for creating matrices
 */
type MatrixFunction = (data: unknown) => unknown

/**
 * Dependencies for AssignmentNode
 */
interface AssignmentNodeDependencies {
  subset: SubsetFunction
  matrix?: MatrixFunction
  Node: new () => MathNode
}

export const createAssignmentNode = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ subset, matrix, Node }: AssignmentNodeDependencies) => {
    const access = accessFactory({ subset })
    const assign = assignFactory({ subset, matrix })

    /*
     * Is parenthesis needed?
     * @param {node} node
     * @param {string} [parenthesis='keep']
     * @param {string} implicit
     * @private
     */
    function needParenthesis(
      node: AssignmentNode,
      parenthesis?: string,
      implicit?: string
    ): boolean {
      if (!parenthesis) {
        parenthesis = 'keep'
      }

      const precedence = getPrecedence(node, parenthesis, implicit, undefined)
      const exprPrecedence = getPrecedence(
        node.value,
        parenthesis,
        implicit,
        undefined
      )
      return (
        parenthesis === 'all' ||
        (exprPrecedence !== null && exprPrecedence <= precedence)
      )
    }

    class AssignmentNode extends Node {
      object: MathNode
      index: IndexNodeLike | null
      value: MathNode

      /**
       * @constructor AssignmentNode
       * @extends {Node}
       *
       * Define a symbol, like `a=3.2`, update a property like `a.b=3.2`, or
       * replace a subset of a matrix like `A[2,2]=42`.
       *
       * Syntax:
       *
       *     new AssignmentNode(symbol, value)
       *     new AssignmentNode(object, index, value)
       *
       * Usage:
       *
       *    new AssignmentNode(new SymbolNode('a'), new ConstantNode(2))  // a=2
       *    new AssignmentNode(new SymbolNode('a'),
       *                       new IndexNode('b'),
       *                       new ConstantNode(2))   // a.b=2
       *    new AssignmentNode(new SymbolNode('a'),
       *                       new IndexNode(1, 2),
       *                       new ConstantNode(3))  // a[1,2]=3
       *
       * @param {SymbolNode | AccessorNode} object
       *     Object on which to assign a value
       * @param {IndexNode} [index=null]
       *     Index, property name or matrix index. Optional. If not provided
       *     and `object` is a SymbolNode, the property is assigned to the
       *     global scope.
       * @param {Node} value
       *     The value to be assigned
       */
      constructor(
        object: MathNode,
        index: IndexNodeLike | MathNode | null,
        value?: MathNode
      ) {
        super()
        this.object = object
        this.index = value ? (index as IndexNodeLike | null) : null
        this.value = value || (index as MathNode)

        // validate input
        if (!isSymbolNode(object) && !isAccessorNode(object)) {
          throw new TypeError('SymbolNode or AccessorNode expected as "object"')
        }
        if (isSymbolNode(object) && (object as SymbolNodeLike).name === 'end') {
          throw new Error('Cannot assign to symbol "end"')
        }
        if (this.index && !isIndexNode(this.index)) {
          // index is optional
          throw new TypeError('IndexNode expected as "index"')
        }
        if (!isNode(this.value)) {
          throw new TypeError('Node expected as "value"')
        }
      }

      // readonly property name
      get name(): string {
        if (this.index) {
          return this.index.isObjectProperty()
            ? this.index.getObjectProperty()
            : ''
        } else {
          return (this.object as SymbolNodeLike).name || ''
        }
      }

      get type(): string {
        return name
      }
      get isAssignmentNode(): boolean {
        return true
      }

      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param math - Math.js namespace with functions and constants.
       * @param argNames - An object with argument names as key and `true`
       *                   as value. Used in the SymbolNode to optimize
       *                   for arguments from user assigned functions
       *                   (see FunctionAssignmentNode) or special symbols
       *                   like `end` (see IndexNode).
       * @returns A function which can be called like:
       *          evalNode(scope: Scope, args: Record<string, unknown>, context: unknown)
       */
      _compile(
        math: MathNamespace,
        argNames: Record<string, boolean>
      ): CompileFunction {
        const evalObject = this.object._compile(math, argNames)
        const evalIndex = this.index ? this.index._compile(math, argNames) : null
        const evalValue = this.value._compile(math, argNames)
        const symbolName = (this.object as SymbolNodeLike).name

        if (!this.index) {
          // apply a variable to the scope, for example `a=2`
          if (!isSymbolNode(this.object)) {
            throw new TypeError('SymbolNode expected as object')
          }

          return function evalAssignmentNode(
            scope: Scope,
            args: Record<string, unknown>,
            context: unknown
          ): unknown {
            const value = evalValue(scope, args, context)
            scope.set(symbolName, value)
            return value
          }
        } else if (this.index.isObjectProperty()) {
          // apply an object property for example `a.b=2`
          const prop = this.index.getObjectProperty()

          return function evalAssignmentNode(
            scope: Scope,
            args: Record<string, unknown>,
            context: unknown
          ): unknown {
            const object = evalObject(scope, args, context)
            const value = evalValue(scope, args, context)
            setSafeProperty(object as Record<string, unknown>, prop, value)
            return value
          }
        } else if (isSymbolNode(this.object)) {
          // update a matrix subset, for example `a[2]=3`
          return function evalAssignmentNode(
            scope: Scope,
            args: Record<string, unknown>,
            context: unknown
          ): unknown {
            const childObject = evalObject(scope, args, context)
            const value = evalValue(scope, args, context)
            // Important:  we pass childObject instead of context:
            const index = (evalIndex as CompileFunction)(scope, args, childObject)
            scope.set(symbolName, assign(childObject, index, value))
            return value
          }
        } else {
          // isAccessorNode(node.object) === true
          // update a matrix subset, for example `a.b[2]=3`

          // we will not use the compile function of the AccessorNode, but
          // compile it ourselves here as we need the parent object of the
          // AccessorNode:
          // we need to apply the updated object to parent object
          const accessorObject = this.object as AccessorNodeLike
          const evalParentObject = accessorObject.object._compile(math, argNames)

          if (accessorObject.index.isObjectProperty()) {
            const parentProp = accessorObject.index.getObjectProperty()

            return function evalAssignmentNode(
              scope: Scope,
              args: Record<string, unknown>,
              context: unknown
            ): unknown {
              const parent = evalParentObject(scope, args, context)
              const childObject = getSafeProperty(
                parent as Record<string, unknown>,
                parentProp
              )
              // Important: we pass childObject instead of context:
              const index = (evalIndex as CompileFunction)(scope, args, childObject)
              const value = evalValue(scope, args, context)
              setSafeProperty(
                parent as Record<string, unknown>,
                parentProp,
                assign(childObject, index, value)
              )
              return value
            }
          } else {
            // if some parameters use the 'end' parameter, we need to calculate
            // the size
            const evalParentIndex = accessorObject.index._compile(math, argNames)

            return function evalAssignmentNode(
              scope: Scope,
              args: Record<string, unknown>,
              context: unknown
            ): unknown {
              const parent = evalParentObject(scope, args, context)
              // Important: we pass parent instead of context:
              const parentIndex = evalParentIndex(scope, args, parent)
              const childObject = access(parent, parentIndex)
              // Important:  we pass childObject instead of context
              const index = (evalIndex as CompileFunction)(scope, args, childObject)
              const value = evalValue(scope, args, context)

              assign(parent, parentIndex, assign(childObject, index, value))

              return value
            }
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
        if (this.index) {
          callback(this.index, 'index', this as any)
        }
        callback(this.value, 'value', this as any)
      }

      /**
       * Create a new AssignmentNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {AssignmentNode} Returns a transformed copy of the node
       */
      map(
        callback: (child: MathNode, path: string, parent: MathNode) => MathNode
      ): AssignmentNode {
        const object = this._ifNode(
          callback(this.object, 'object', this as any)
        )
        const index = this.index
          ? this._ifNode(callback(this.index, 'index', this as any))
          : null
        const value = this._ifNode(callback(this.value, 'value', this as any))

        return new AssignmentNode(object, index, value)
      }

      /**
       * Create a clone of this node, a shallow copy
       * @return {AssignmentNode}
       */
      clone(): AssignmentNode {
        return new AssignmentNode(this.object, this.index, this.value)
      }

      /**
       * Get string representation
       * @param options - Formatting options
       * @returns The string representation
       */
      _toString(options?: StringOptions): string {
        const object = this.object.toString(options)
        const index = this.index ? this.index.toString(options) : ''
        let value = this.value.toString(options)
        if (
          needParenthesis(
            this,
            options && options.parenthesis,
            options && options.implicit
          )
        ) {
          value = '(' + value + ')'
        }

        return object + index + ' = ' + value
      }

      /**
       * Get a JSON representation of the node
       * @returns The JSON representation
       */
      toJSON(): {
        mathjs: string
        object: MathNode
        index: IndexNodeLike | null
        value: MathNode
      } {
        return {
          mathjs: name,
          object: this.object,
          index: this.index,
          value: this.value
        }
      }

      /**
       * Instantiate an AssignmentNode from its JSON representation
       * @param json - An object structured like
       *     `{"mathjs": "AssignmentNode", object: ..., index: ..., value: ...}`,
       *     where mathjs is optional
       * @returns The AssignmentNode instance
       */
      static fromJSON(json: {
        object: MathNode
        index: IndexNodeLike | null
        value: MathNode
      }): AssignmentNode {
        return new AssignmentNode(json.object, json.index, json.value)
      }

      /**
       * Get HTML representation
       * @param options - Formatting options
       * @returns The HTML representation
       */
      _toHTML(options?: StringOptions): string {
        const object = this.object.toHTML(options)
        const index = this.index ? this.index.toHTML(options) : ''
        let value = this.value.toHTML(options)
        if (
          needParenthesis(
            this,
            options && options.parenthesis,
            options && options.implicit
          )
        ) {
          value =
            '<span class="math-paranthesis math-round-parenthesis">(</span>' +
            value +
            '<span class="math-paranthesis math-round-parenthesis">)</span>'
        }

        return (
          object +
          index +
          '<span class="math-operator math-assignment-operator ' +
          'math-variable-assignment-operator math-binary-operator">=</span>' +
          value
        )
      }

      /**
       * Get LaTeX representation
       * @param options - Formatting options
       * @returns The LaTeX representation
       */
      _toTex(options?: StringOptions): string {
        const object = this.object.toTex(options)
        const index = this.index ? this.index.toTex(options) : ''
        let value = this.value.toTex(options)
        if (
          needParenthesis(
            this,
            options && options.parenthesis,
            options && options.implicit
          )
        ) {
          value = `\\left(${value}\\right)`
        }

        return object + index + '=' + value
      }
    }

    // Set the class name to match the node type
    // Using Object.defineProperty because Function.name is read-only
    Object.defineProperty(AssignmentNode, 'name', {
      value: name,
      configurable: true
    })

    return AssignmentNode
  },
  { isClass: true, isNode: true }
)
