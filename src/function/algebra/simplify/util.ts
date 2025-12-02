import { isFunctionNode, isOperatorNode, isParenthesisNode } from '../../../utils/is.js'
import { factory } from '../../../utils/factory.js'
import { hasOwnProperty } from '../../../utils/object.js'
import type { MathNode, FunctionNode, OperatorNode, SymbolNode } from '../../../utils/node.js'

const name = 'simplifyUtil'
const dependencies = [
  'FunctionNode',
  'OperatorNode',
  'SymbolNode'
]

type OperatorContext = Record<string, Record<string, boolean>>

<<<<<<< HEAD
<<<<<<< HEAD
export const createUtil = /* #__PURE__ */ factory(name, dependencies as string[], ({ FunctionNode, OperatorNode, SymbolNode }: {
=======
export const createUtil = /* #__PURE__ */ factory(name, dependencies, ({ FunctionNode, OperatorNode, SymbolNode }: {
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
=======
export const createUtil = /* #__PURE__ */ factory(name, dependencies, ({ FunctionNode, OperatorNode, SymbolNode }: {
>>>>>>> claude/typecheck-and-convert-js-01YLWgcoNb8jFsVbPqer68y8
  FunctionNode: any
  OperatorNode: any
  SymbolNode: any
}) => {
  // TODO commutative/associative properties rely on the arguments
  // e.g. multiply is not commutative for matrices
  // The properties should be calculated from an argument to simplify, or possibly something in math.config
  // the other option is for typed() to specify a return type so that we can evaluate the type of arguments

  /* So that properties of an operator fit on one line: */
  const T = true
  const F = false

  const defaultName = 'defaultF'
  const defaultContext: OperatorContext = {
    /*      */ add: { trivial: T, total: T, commutative: T, associative: T },
    /**/ unaryPlus: { trivial: T, total: T, commutative: T, associative: T },
    /* */ subtract: { trivial: F, total: T, commutative: F, associative: F },
    /* */ multiply: { trivial: T, total: T, commutative: T, associative: T },
    /*   */ divide: { trivial: F, total: T, commutative: F, associative: F },
    /*    */ paren: { trivial: T, total: T, commutative: T, associative: F },
    /* */ defaultF: { trivial: F, total: T, commutative: F, associative: F }
  }
  const realContext: OperatorContext = { divide: { total: F }, log: { total: F } }
  const positiveContext: OperatorContext = {
    subtract: { total: F },
    abs: { trivial: T },
    log: { total: T }
  }

  function hasProperty (nodeOrName: string | MathNode, property: string, context: OperatorContext = defaultContext): boolean {
    let name = defaultName
    if (typeof nodeOrName === 'string') {
      name = nodeOrName
    } else if (isOperatorNode(nodeOrName)) {
      name = nodeOrName.fn.toString()
    } else if (isFunctionNode(nodeOrName)) {
      name = nodeOrName.name
    } else if (isParenthesisNode(nodeOrName)) {
      name = 'paren'
    }
    if (hasOwnProperty(context, name)) {
      const properties = context[name]
      if (hasOwnProperty(properties, property)) {
        return properties[property]
      }
      if (hasOwnProperty(defaultContext, name)) {
        return defaultContext[name][property]
      }
    }
    if (hasOwnProperty(context, defaultName)) {
      const properties = context[defaultName]
      if (hasOwnProperty(properties, property)) {
        return properties[property]
      }
      return defaultContext[defaultName][property]
    }
    /* name not found in context and context has no global default */
    /* So use default context. */
    if (hasOwnProperty(defaultContext, name)) {
      const properties = defaultContext[name]
      if (hasOwnProperty(properties, property)) {
        return properties[property]
      }
    }
    return defaultContext[defaultName][property]
  }

  function isCommutative (node: string | MathNode, context: OperatorContext = defaultContext): boolean {
    return hasProperty(node, 'commutative', context)
  }

  function isAssociative (node: string | MathNode, context: OperatorContext = defaultContext): boolean {
    return hasProperty(node, 'associative', context)
  }

  /**
   * Merge the given contexts, with primary overriding secondary
   * wherever they might conflict
   */
  function mergeContext (primary: OperatorContext | undefined, secondary: OperatorContext | undefined): OperatorContext {
    const merged: OperatorContext = { ...primary }
    for (const prop in secondary) {
      if (hasOwnProperty(primary, prop)) {
        merged[prop] = { ...secondary[prop], ...primary![prop] }
      } else {
        merged[prop] = secondary[prop]
      }
    }
    return merged
  }

  /**
   * Flatten all associative operators in an expression tree.
   * Assumes parentheses have already been removed.
   */
  function flatten (node: MathNode & { args?: MathNode[] }, context: OperatorContext): void {
    if (!node.args || node.args.length === 0) {
      return
    }
    node.args = allChildren(node, context)
    for (let i = 0; i < node.args.length; i++) {
      flatten(node.args[i] as any, context)
    }
  }

  /**
   * Get the children of a node as if it has been flattened.
   * TODO implement for FunctionNodes
   */
  function allChildren (node: MathNode & { args?: MathNode[]; op?: string }, context: OperatorContext): MathNode[] {
    let op: string | undefined
    const children: MathNode[] = []
    const findChildren = function (node: MathNode & { args?: MathNode[]; op?: string }): void {
      for (let i = 0; i < (node.args?.length ?? 0); i++) {
        const child = node.args![i] as any
        if (isOperatorNode(child) && op === (child as any).op) {
          findChildren(child as any)
        } else {
          children.push(child)
        }
      }
    }

    if (isAssociative(node, context)) {
      op = node.op
      findChildren(node)
      return children
    } else {
      return node.args ?? []
    }
  }

  /**
   *  Unflatten all flattened operators to a right-heavy binary tree.
   */
  function unflattenr (node: MathNode & { args?: MathNode[] }, context: OperatorContext): void {
    if (!node.args || node.args.length === 0) {
      return
    }
    const makeNode = createMakeNodeFunction(node as any)
    const l = node.args.length
    for (let i = 0; i < l; i++) {
      unflattenr(node.args[i] as any, context)
    }
    if (l > 2 && isAssociative(node, context)) {
      let curnode = node.args.pop()!
      while (node.args.length > 0) {
        curnode = makeNode([node.args.pop()!, curnode])
      }
      node.args = (curnode as any).args
    }
  }

  /**
   *  Unflatten all flattened operators to a left-heavy binary tree.
   */
  function unflattenl (node: MathNode & { args?: MathNode[] }, context: OperatorContext): void {
    if (!node.args || node.args.length === 0) {
      return
    }
    const makeNode = createMakeNodeFunction(node as any)
    const l = node.args.length
    for (let i = 0; i < l; i++) {
      unflattenl(node.args[i] as any, context)
    }
    if (l > 2 && isAssociative(node, context)) {
      let curnode = node.args.shift()!
      while (node.args.length > 0) {
        curnode = makeNode([curnode, node.args.shift()!])
      }
      node.args = (curnode as any).args
    }
  }

  function createMakeNodeFunction (node: (OperatorNode & { implicit?: boolean }) | (FunctionNode & { name: string })): (args: MathNode[]) => MathNode {
    if (isOperatorNode(node)) {
      return function (args: MathNode[]): MathNode {
        try {
<<<<<<< HEAD
          return new OperatorNode(node.op, (node as any).fn, args, (node as any).implicit)
=======
          return new OperatorNode(node.op, node.fn, args, node.implicit)
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
        } catch (err) {
          console.error(err)
          return [] as any
        }
      }
    } else {
      return function (args: MathNode[]): MathNode {
        return new FunctionNode(new SymbolNode((node as any).name), args)
      }
    }
  }

  return {
    createMakeNodeFunction,
    hasProperty,
    isCommutative,
    isAssociative,
    mergeContext,
    flatten,
    allChildren,
    unflattenr,
    unflattenl,
    defaultContext,
    realContext,
    positiveContext
  }
})
