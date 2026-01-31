import {
  isAccessorNode,
  isFunctionAssignmentNode,
  isIndexNode,
  isNode,
  isSymbolNode
} from '../../utils/is.ts'
import { escape, format } from '../../utils/string.ts'
import { hasOwnProperty } from '../../utils/object.ts'
import { getSafeProperty, getSafeMethod } from '../../utils/customs.ts'
import { createSubScope } from '../../utils/scope.ts'
import { factory } from '../../utils/factory.ts'
import { defaultTemplate, latexFunctions } from '../../utils/latex.ts'
import type { MathNode, Scope, CompileFunction, StringOptions } from './Node.ts'

const name = 'FunctionNode'
const dependencies = ['math', 'Node', 'SymbolNode']

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
  optionalChaining?: boolean
}

/**
 * Interface for IndexNode with dimension indexing methods
 */
interface IndexNodeLike extends MathNode {
  isObjectProperty: () => boolean
  getObjectProperty: () => string
}

/**
 * Interface for a function that may have rawArgs property
 */
interface RawArgsFunction {
  (...args: unknown[]): unknown
  rawArgs?: boolean
}

/**
 * Interface for a math function with toTex support
 */
interface MathFunctionWithTex {
  toTex?:
    | ((node: FunctionNode, options?: StringOptions) => string)
    | Record<number, string | ((node: FunctionNode, options?: StringOptions) => string)>
    | string
}

/**
 * The math namespace interface for FunctionNode
 */
interface MathNamespace {
  [key: string]: unknown
}

/**
 * LaTeX functions map type
 */
type LatexFunctionsMap = Record<
  string,
  | string
  | ((node: FunctionNode, options?: StringOptions) => string)
  | Record<number, string | ((node: FunctionNode, options?: StringOptions) => string)>
>

/**
 * SymbolNode constructor type
 */
interface SymbolNodeConstructor {
  new (name: string): SymbolNodeLike
}

/**
 * Dependencies for FunctionNode
 */
interface FunctionNodeDependencies {
  math: MathNamespace
  Node: new () => MathNode
  SymbolNode: SymbolNodeConstructor
}

export const createFunctionNode = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ math, Node, SymbolNode }: FunctionNodeDependencies) => {
    /* format to fixed length */
    const strin = (entity: unknown): string => format(entity, { truncate: 78 })

    /*
     * Expand a LaTeX template
     *
     * @param template - The LaTeX template string
     * @param node - The FunctionNode to expand
     * @param options - Formatting options
     * @private
     */
    function expandTemplate(
      template: string,
      node: FunctionNode,
      options?: StringOptions
    ): string {
      let latex = ''

      // Match everything of the form ${identifier} or ${identifier[2]} or $$
      // while submatching identifier and 2 (in the second case)
      const regex = /\$(?:\{([a-z_][a-z_0-9]*)(?:\[([0-9]+)\])?\}|\$)/gi

      let inputPos = 0 // position in the input string
      let match: RegExpExecArray | null
      while ((match = regex.exec(template)) !== null) {
        // go through all matches
        // add everything in front of the match to the LaTeX string
        latex += template.substring(inputPos, match.index)
        inputPos = match.index

        if (match[0] === '$$') {
          // escaped dollar sign
          latex += '$'
          inputPos++
        } else {
          // template parameter
          inputPos += match[0].length
          const propertyName = match[1] as keyof FunctionNode
          const property = node[propertyName] as unknown
          if (!property) {
            throw new ReferenceError(
              'Template: Property ' + match[1] + ' does not exist.'
            )
          }
          if (match[2] === undefined) {
            // no square brackets
            switch (typeof property) {
              case 'string':
                latex += property
                break
              case 'object':
                if (isNode(property)) {
                  latex += (property as MathNode).toTex(options)
                } else if (Array.isArray(property)) {
                  // make array of Nodes into comma separated list
                  latex += property
                    .map(function (arg: unknown, index: number) {
                      if (isNode(arg)) {
                        return (arg as MathNode).toTex(options)
                      }
                      throw new TypeError(
                        'Template: ' +
                          match![1] +
                          '[' +
                          index +
                          '] is not a Node.'
                      )
                    })
                    .join(',')
                } else {
                  throw new TypeError(
                    'Template: ' +
                      match[1] +
                      ' has to be a Node, String or array of Nodes'
                  )
                }
                break
              default:
                throw new TypeError(
                  'Template: ' +
                    match[1] +
                    ' has to be a Node, String or array of Nodes'
                )
            }
          } else {
            // with square brackets
            const arrayProperty = property as MathNode[]
            const indexedNode = arrayProperty[parseInt(match[2], 10)]
            if (isNode(indexedNode)) {
              latex += indexedNode.toTex(options)
            } else {
              throw new TypeError(
                'Template: ' + match[1] + '[' + match[2] + '] is not a Node.'
              )
            }
          }
        }
      }
      latex += template.slice(inputPos) // append rest of the template

      return latex
    }

    class FunctionNode extends Node {
      fn: MathNode
      args: MathNode[]
      optional: boolean

      /**
       * @constructor FunctionNode
       * @extends {./Node}
       * invoke a list with arguments on a node
       * @param {./Node | string} fn
       *     Item resolving to a function on which to invoke
       *     the arguments, typically a SymbolNode or AccessorNode
       * @param {./Node[]} args
       */
      constructor(fn: MathNode | string, args: MathNode[], optional?: boolean) {
        super()
        if (typeof fn === 'string') {
          fn = new SymbolNode(fn)
        }

        // validate input
        if (!isNode(fn)) throw new TypeError('Node expected as parameter "fn"')
        if (!Array.isArray(args) || !args.every(isNode)) {
          throw new TypeError(
            'Array containing Nodes expected for parameter "args"'
          )
        }
        const optionalType = typeof optional
        if (!(optionalType === 'undefined' || optionalType === 'boolean')) {
          throw new TypeError('optional flag, if specified, must be boolean')
        }

        this.fn = fn as MathNode
        this.args = args || []
        this.optional = !!optional
      }

      // readonly property name
      get name(): string {
        return (this.fn as SymbolNodeLike).name || ''
      }

      get type(): string {
        return name
      }
      get isFunctionNode(): boolean {
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
        // compile arguments
        const evalArgs = this.args.map((arg) => arg._compile(math, argNames))
        const fromOptionalChaining =
          this.optional ||
          (isAccessorNode(this.fn) && (this.fn as AccessorNodeLike).optionalChaining)

        if (isSymbolNode(this.fn)) {
          const fnName = (this.fn as SymbolNodeLike).name
          if (!argNames[fnName]) {
            // we can statically determine whether the function
            // has the rawArgs property
            const fn = fnName in math ? getSafeProperty(math, fnName) : undefined
            const isRaw =
              typeof fn === 'function' && (fn as RawArgsFunction).rawArgs === true

            const resolveFn = (scope: Scope): RawArgsFunction | undefined => {
              let value: unknown
              if (scope.has(fnName)) {
                value = scope.get(fnName)
              } else if (fnName in math) {
                value = getSafeProperty(math, fnName)
              } else if (fromOptionalChaining) value = undefined
              else return FunctionNode.onUndefinedFunction(fnName)

              if (
                typeof value === 'function' ||
                (fromOptionalChaining && value === undefined)
              ) {
                return value as RawArgsFunction | undefined
              }

              throw new TypeError(
                `'${fnName}' is not a function; its value is:\n  ${strin(value)}`
              )
            }

            if (isRaw) {
              // pass unevaluated parameters (nodes) to the function
              // "raw" evaluation
              const rawArgs = this.args
              return function evalFunctionNode(
                scope: Scope,
                args: Record<string, unknown>,
                context: unknown
              ): unknown {
                const fn = resolveFn(scope)

                // the original function can be overwritten in the scope with a non-rawArgs function
                if (fn && fn.rawArgs === true) {
                  return fn(rawArgs, math, createSubScope(scope, args))
                } else if (fn) {
                  // "regular" evaluation
                  const values = evalArgs.map((evalArg) =>
                    evalArg(scope, args, context)
                  )
                  return fn(...values)
                }
                return undefined
              }
            } else {
              // "regular" evaluation
              switch (evalArgs.length) {
                case 0:
                  return function evalFunctionNode(
                    scope: Scope,
                    _args: Record<string, unknown>,
                    _context: unknown
                  ): unknown {
                    const fn = resolveFn(scope)
                    if (fromOptionalChaining && fn === undefined)
                      return undefined
                    return fn!()
                  }
                case 1:
                  return function evalFunctionNode(
                    scope: Scope,
                    args: Record<string, unknown>,
                    context: unknown
                  ): unknown {
                    const fn = resolveFn(scope)
                    if (fromOptionalChaining && fn === undefined)
                      return undefined
                    const evalArg0 = evalArgs[0]
                    return fn!(evalArg0(scope, args, context))
                  }
                case 2:
                  return function evalFunctionNode(
                    scope: Scope,
                    args: Record<string, unknown>,
                    context: unknown
                  ): unknown {
                    const fn = resolveFn(scope)
                    if (fromOptionalChaining && fn === undefined)
                      return undefined
                    const evalArg0 = evalArgs[0]
                    const evalArg1 = evalArgs[1]
                    return fn!(
                      evalArg0(scope, args, context),
                      evalArg1(scope, args, context)
                    )
                  }
                default:
                  return function evalFunctionNode(
                    scope: Scope,
                    args: Record<string, unknown>,
                    context: unknown
                  ): unknown {
                    const fn = resolveFn(scope)
                    if (fromOptionalChaining && fn === undefined)
                      return undefined
                    const values = evalArgs.map((evalArg) =>
                      evalArg(scope, args, context)
                    )
                    return fn!(...values)
                  }
              }
            }
          } else {
            // the function symbol is an argName
            const rawArgs = this.args
            return function evalFunctionNode(
              scope: Scope,
              args: Record<string, unknown>,
              context: unknown
            ): unknown {
              const fn = getSafeProperty(args, fnName) as RawArgsFunction | undefined
              if (fromOptionalChaining && fn === undefined) return undefined
              if (typeof fn !== 'function') {
                throw new TypeError(
                  `Argument '${fnName}' was not a function; received: ${strin(fn)}`
                )
              }
              if (fn.rawArgs) {
                // "Raw" evaluation
                return fn(rawArgs, math, createSubScope(scope, args))
              } else {
                const values = evalArgs.map((evalArg) =>
                  evalArg(scope, args, context)
                )
                return fn.apply(fn, values)
              }
            }
          }
        } else if (
          isAccessorNode(this.fn) &&
          isIndexNode((this.fn as AccessorNodeLike).index) &&
          (this.fn as AccessorNodeLike).index.isObjectProperty()
        ) {
          // execute the function with the right context:
          // the object of the AccessorNode

          const accessorFn = this.fn as AccessorNodeLike
          const evalObject = accessorFn.object._compile(math, argNames)
          const prop = accessorFn.index.getObjectProperty()
          const rawArgs = this.args

          return function evalFunctionNode(
            scope: Scope,
            args: Record<string, unknown>,
            context: unknown
          ): unknown {
            const object = evalObject(scope, args, context) as Record<
              string,
              unknown
            >

            // Optional chaining: if the base object is nullish, short-circuit to undefined
            if (
              fromOptionalChaining &&
              (object == null || object[prop] === undefined)
            ) {
              return undefined
            }

            const fn = getSafeMethod(object, prop) as RawArgsFunction

            if (fn?.rawArgs) {
              // "Raw" evaluation
              return fn(rawArgs, math, createSubScope(scope, args))
            } else {
              // "regular" evaluation
              const values = evalArgs.map((evalArg) =>
                evalArg(scope, args, context)
              )
              return fn.apply(object, values)
            }
          }
        } else {
          // (node as AccessorNodeLike).fn.isAccessorNode && !(node as AccessorNodeLike).fn.index.isObjectProperty()
          // we have to dynamically determine whether the function has the
          // rawArgs property
          const fnExpr = this.fn.toString()
          const evalFn = this.fn._compile(math, argNames)
          const rawArgs = this.args

          return function evalFunctionNode(
            scope: Scope,
            args: Record<string, unknown>,
            context: unknown
          ): unknown {
            const fn = evalFn(scope, args, context) as RawArgsFunction | undefined
            if (fromOptionalChaining && fn === undefined) return undefined
            if (typeof fn !== 'function') {
              throw new TypeError(
                `Expression '${fnExpr}' did not evaluate to a function; value is:` +
                  `\n  ${strin(fn)}`
              )
            }
            if (fn.rawArgs) {
              // "Raw" evaluation
              return fn(rawArgs, math, createSubScope(scope, args))
            } else {
              // "regular" evaluation
              const values = evalArgs.map((evalArg) =>
                evalArg(scope, args, context)
              )
              return fn.apply(fn, values)
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
        callback(this.fn, 'fn', this as any)

        for (let i = 0; i < this.args.length; i++) {
          callback(this.args[i], 'args[' + i + ']', this as any)
        }
      }

      /**
       * Create a new FunctionNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {FunctionNode} Returns a transformed copy of the node
       */
      map(
        callback: (child: MathNode, path: string, parent: MathNode) => MathNode
      ): FunctionNode {
        const fn = this._ifNode(callback(this.fn, 'fn', this as any))
        const args: MathNode[] = []
        for (let i = 0; i < this.args.length; i++) {
          args[i] = this._ifNode(
            callback(this.args[i], 'args[' + i + ']', this as any)
          )
        }
        return new FunctionNode(fn, args)
      }

      /**
       * Create a clone of this node, a shallow copy
       * @return {FunctionNode}
       */
      clone(): FunctionNode {
        return new FunctionNode(this.fn, this.args.slice(0))
      }

      /**
       * Throws an error 'Undefined function {name}'
       * @param {string} name
       */
      static onUndefinedFunction = function (name: string): never {
        throw new Error('Undefined function ' + name)
      }

      /**
       * Get string representation. (wrapper function)
       * This overrides parts of Node's toString function.
       * If callback is an object containing callbacks, it
       * calls the correct callback for the current node,
       * otherwise it falls back to calling Node's toString
       * function.
       *
       * @param options - Formatting options
       * @returns The string representation
       * @override
       */
      toString(options?: StringOptions): string {
        let customString: string | undefined
        const fnName = this.fn.toString(options)
        if (
          options &&
          typeof options.handler === 'object' &&
          hasOwnProperty(options.handler, fnName)
        ) {
          // callback is a map of callback functions
          const handler = options.handler as Record<
            string,
            (node: FunctionNode, options?: StringOptions) => string
          >
          customString = handler[fnName](this, options)
        }

        if (typeof customString !== 'undefined') {
          return customString
        }

        // fall back to Node's toString
        return super.toString(options)
      }

      /**
       * Get string representation
       * @param options - Formatting options
       * @returns The string representation
       */
      _toString(options?: StringOptions): string {
        const args = this.args.map(function (arg) {
          return arg.toString(options)
        })

        const fn = isFunctionAssignmentNode(this.fn)
          ? '(' + this.fn.toString(options) + ')'
          : this.fn.toString(options)

        // format the arguments like "add(2, 4.2)"
        return fn + '(' + args.join(', ') + ')'
      }

      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON(): { mathjs: string; fn: MathNode; args: MathNode[] } {
        return {
          mathjs: name,
          fn: this.fn,
          args: this.args
        }
      }

      /**
       * Instantiate an AssignmentNode from its JSON representation
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "FunctionNode", fn: ..., args: ...}`,
       *                       where mathjs is optional
       * @returns {FunctionNode}
       */
      static fromJSON = function (json: {
        fn: MathNode
        args: MathNode[]
      }): FunctionNode {
        return new FunctionNode(json.fn, json.args)
      }

      /**
       * Get HTML representation
       * @param options - Formatting options
       * @returns The HTML representation
       */
      _toHTML(options?: StringOptions): string {
        const args = this.args.map(function (arg) {
          return arg.toHTML(options)
        })

        // format the arguments like "add(2, 4.2)"
        return (
          '<span class="math-function">' +
          escape(this.fn.toString()) +
          '</span><span class="math-paranthesis math-round-parenthesis">(</span>' +
          args.join('<span class="math-separator">,</span>') +
          '<span class="math-paranthesis math-round-parenthesis">)</span>'
        )
      }

      /**
       * Get LaTeX representation. (wrapper function)
       * This overrides parts of Node's toTex function.
       * If callback is an object containing callbacks, it
       * calls the correct callback for the current node,
       * otherwise it falls back to calling Node's toTex
       * function.
       *
       * @param options - Formatting options
       * @returns The LaTeX representation
       */
      toTex(options?: StringOptions): string {
        let customTex: string | undefined
        if (
          options &&
          typeof options.handler === 'object' &&
          hasOwnProperty(options.handler, this.name)
        ) {
          // callback is a map of callback functions
          const handler = options.handler as Record<
            string,
            (node: FunctionNode, options?: StringOptions) => string
          >
          customTex = handler[this.name](this, options)
        }

        if (typeof customTex !== 'undefined') {
          return customTex
        }

        // fall back to Node's toTex
        return super.toTex(options)
      }

      /**
       * Get LaTeX representation
       * @param options - Formatting options
       * @returns The LaTeX representation
       */
      _toTex(options?: StringOptions): string {
        const args = this.args.map(function (arg) {
          // get LaTeX of the arguments
          return arg.toTex(options)
        })

        type LatexConverterType =
          | string
          | ((node: FunctionNode, options?: StringOptions) => string)
          | Record<
              number,
              string | ((node: FunctionNode, options?: StringOptions) => string)
            >
          | undefined

        let latexConverter: LatexConverterType

        const latexFunctionsMap = latexFunctions as LatexFunctionsMap
        if (latexFunctionsMap[this.name]) {
          latexConverter = latexFunctionsMap[this.name]
        }

        // toTex property on the function itself
        const mathFn = math[this.name] as MathFunctionWithTex | undefined
        if (
          mathFn &&
          (typeof mathFn.toTex === 'function' ||
            typeof mathFn.toTex === 'object' ||
            typeof mathFn.toTex === 'string')
        ) {
          // .toTex is a callback function
          latexConverter = mathFn.toTex
        }

        let customToTex: string | undefined
        switch (typeof latexConverter) {
          case 'function': // a callback function
            customToTex = latexConverter(this, options)
            break
          case 'string': // a template string
            customToTex = expandTemplate(latexConverter, this, options)
            break
          case 'object':
            // an object with different "converters" for different
            // numbers of arguments
            {
              const converterMap = latexConverter as Record<
                number,
                | string
                | ((node: FunctionNode, options?: StringOptions) => string)
              >
              const converter = converterMap[args.length]
              switch (typeof converter) {
                case 'function':
                  customToTex = converter(this, options)
                  break
                case 'string':
                  customToTex = expandTemplate(converter, this, options)
                  break
              }
            }
        }

        if (typeof customToTex !== 'undefined') {
          return customToTex
        }

        return expandTemplate(defaultTemplate, this, options)
      }

      /**
       * Get identifier.
       * @return {string}
       */
      getIdentifier(): string {
        return this.type + ':' + this.name
      }
    }

    // Set the class name to match the node type
    // Using Object.defineProperty because Function.name is read-only
    Object.defineProperty(FunctionNode, 'name', {
      value: name,
      configurable: true
    })

    return FunctionNode
  },
  { isClass: true, isNode: true }
)
