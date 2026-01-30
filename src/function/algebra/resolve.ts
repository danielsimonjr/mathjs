import { createMap } from '../../utils/map.ts'
import {
  isFunctionNode,
  isNode,
  isOperatorNode,
  isParenthesisNode,
  isSymbolNode
} from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import type { MathNode } from '../../utils/node.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for resolve
interface SymbolNodeType extends MathNode {
  name: string
}

interface OperatorNodeType extends MathNode {
  op: string
  fn: string
  args: MathNode[]
  implicit: boolean
}

interface ParenthesisNodeType extends MathNode {
  content: MathNode
}

interface FunctionNodeType extends MathNode {
  name: string
  args: MathNode[]
}

interface ConstantNodeConstructor {
  new (value: unknown): MathNode
}

interface FunctionNodeConstructor {
  new (name: string, args: MathNode[]): MathNode
}

interface OperatorNodeConstructor {
  new (op: string, fn: string, args: MathNode[], implicit: boolean): MathNode
}

interface ParenthesisNodeConstructor {
  new (content: MathNode): MathNode
}

interface ResolveDependencies {
  typed: TypedFunction
  parse: (expr: string) => MathNode
  ConstantNode: ConstantNodeConstructor
  FunctionNode: FunctionNodeConstructor
  OperatorNode: OperatorNodeConstructor
  ParenthesisNode: ParenthesisNodeConstructor
}

const name = 'resolve'
const dependencies = [
  'typed',
  'parse',
  'ConstantNode',
  'FunctionNode',
  'OperatorNode',
  'ParenthesisNode'
]

export const createResolve = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    parse,
    ConstantNode,
    FunctionNode,
    OperatorNode,
    ParenthesisNode
  }: ResolveDependencies) => {
    /**
     * resolve(expr, scope) replaces variable nodes with their scoped values
     *
     * Syntax:
     *
     *     math.resolve(expr, scope)
     *
     * Examples:
     *
     *     math.resolve('x + y', {x:1, y:2})           // Node '1 + 2'
     *     math.resolve(math.parse('x+y'), {x:1, y:2}) // Node '1 + 2'
     *     math.simplify('x+y', {x:2, y: math.parse('x+x')}).toString() // "6"
     *
     * See also:
     *
     *     simplify, evaluate
     *
     * @param {Node | Node[]} node
     *     The expression tree (or trees) to be simplified
     * @param {Object} scope
     *     Scope specifying variables to be resolved
     * @return {Node | Node[]} Returns `node` with variables recursively substituted.
     * @throws {ReferenceError}
     *     If there is a cyclic dependency among the variables in `scope`,
     *     resolution is impossible and a ReferenceError is thrown.
     */
    function _resolve(
      node: MathNode,
      scope?: Map<string, unknown> | null | undefined,
      within: Set<string> = new Set()
    ): MathNode {
      // note `within`:
      // `within` is not documented, since it is for internal cycle
      // detection only
      if (!scope) {
        return node
      }
      if (isSymbolNode(node)) {
        const symbolNode = node as SymbolNodeType
        if (within.has(symbolNode.name)) {
          const variables = Array.from(within).join(', ')
          throw new ReferenceError(
            `recursive loop of variable definitions among {${variables}}`
          )
        }
        const value = scope.get(symbolNode.name)
        if (isNode(value)) {
          const nextWithin = new Set(within)
          nextWithin.add(symbolNode.name)
          return _resolve(value as MathNode, scope, nextWithin)
        } else if (typeof value === 'number') {
          return parse(String(value))
        } else if (value !== undefined) {
          return new ConstantNode(value)
        } else {
          return node
        }
      } else if (isOperatorNode(node)) {
        const opNode = node as OperatorNodeType
        const args = opNode.args.map(function (arg: MathNode) {
          return _resolve(arg, scope, within)
        })
        return new OperatorNode(
          opNode.op,
          opNode.fn,
          args,
          opNode.implicit
        )
      } else if (isParenthesisNode(node)) {
        const parenNode = node as ParenthesisNodeType
        return new ParenthesisNode(
          _resolve(parenNode.content, scope, within)
        )
      } else if (isFunctionNode(node)) {
        const funcNode = node as FunctionNodeType
        const args = funcNode.args.map(function (arg: MathNode) {
          return _resolve(arg, scope, within)
        })
        return new FunctionNode(funcNode.name, args)
      }

      // Otherwise just recursively resolve any children (might also work
      // for some of the above special cases)
      return node.map((child: MathNode) => _resolve(child, scope, within))
    }

    return typed('resolve', {
      Node: _resolve,
      'Node, Map | null | undefined': _resolve,
      'Node, Object': (n: MathNode, scope: Record<string, unknown>) =>
        _resolve(n, createMap(scope)),
      // For arrays and matrices, we map `self` rather than `_resolve`
      // because resolve is fairly expensive anyway, and this way
      // we get nice error messages if one entry in the array has wrong type.
      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) => (A: { map: (fn: (n: MathNode) => MathNode) => unknown }) => A.map((n: MathNode) => self(n))
      ),
      'Array | Matrix, null | undefined': typed.referToSelf(
        (self: TypedFunction) => (A: { map: (fn: (n: MathNode) => MathNode) => unknown }) => A.map((n: MathNode) => self(n))
      ),
      'Array, Object': typed.referTo(
        'Array,Map',
        (selfAM: TypedFunction) => (A: unknown[], scope: Record<string, unknown>) => selfAM(A, createMap(scope))
      ),
      'Matrix, Object': typed.referTo(
        'Matrix,Map',
        (selfMM: TypedFunction) => (A: { map: (fn: (n: MathNode) => MathNode) => unknown }, scope: Record<string, unknown>) => selfMM(A, createMap(scope))
      ),
      'Array | Matrix, Map': typed.referToSelf(
        (self: TypedFunction) => (A: { map: (fn: (n: MathNode) => MathNode) => unknown }, scope: Map<string, unknown>) =>
          A.map((n: MathNode) => self(n, scope))
      )
    })
  }
)
