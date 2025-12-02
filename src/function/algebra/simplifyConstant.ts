import { isFraction, isMatrix, isNode, isArrayNode, isConstantNode, isIndexNode, isObjectNode, isOperatorNode } from '../../utils/is.js'
import { factory } from '../../utils/factory.js'
import { safeNumberType } from '../../utils/number.js'
import { createUtil } from './simplify/util.js'
import { noBignumber, noFraction } from '../../utils/noop.js'
import type { MathNode, ConstantNode, ArrayNode, AccessorNode, IndexNode, ObjectNode, OperatorNode, FunctionNode, ParenthesisNode } from '../../utils/node.js'

const name = 'simplifyConstant'
const dependencies = [
  'typed',
  'config',
  'mathWithTransform',
  'matrix',
  'isBounded',
  '?fraction',
  '?bignumber',
  'AccessorNode',
  'ArrayNode',
  'ConstantNode',
  'FunctionNode',
  'IndexNode',
  'ObjectNode',
  'OperatorNode',
  'SymbolNode'
<<<<<<< HEAD
]
=======
] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createSimplifyConstant = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  config,
  mathWithTransform,
  matrix,
  isBounded,
  fraction,
  bignumber,
  AccessorNode,
  ArrayNode,
  ConstantNode,
  FunctionNode,
  IndexNode,
  ObjectNode,
  OperatorNode,
  SymbolNode
}: {
  typed: any
  config: any
  mathWithTransform: any
  matrix: any
  isBounded: any
  fraction: any
  bignumber: any
  AccessorNode: any
  ArrayNode: any
  ConstantNode: any
  FunctionNode: any
  IndexNode: any
  ObjectNode: any
  OperatorNode: any
  SymbolNode: any
}) => {
  const { isCommutative, isAssociative, allChildren, createMakeNodeFunction } =
    createUtil({ FunctionNode, OperatorNode, SymbolNode })

  /**
   * simplifyConstant() takes a mathjs expression (either a Node representing
   * a parse tree or a string which it parses to produce a node), and replaces
   * any subexpression of it consisting entirely of constants with the computed
   * value of that subexpression.
   *
   * Syntax:
   *
   *     math.simplifyConstant(expr)
   *     math.simplifyConstant(expr, options)
   *
   * Examples:
   *
   *     math.simplifyConstant('x + 4*3/6')  // Node "x + 2"
   *     math.simplifyConstant('z cos(0)')   // Node "z 1"
   *     math.simplifyConstant('(5.2 + 1.08)t', {exactFractions: false})  // Node "6.28 t"
   *
   * See also:
   *
   *     simplify, simplifyCore, resolve, derivative
   *
   * @param {Node | string} node
   *     The expression to be simplified
   * @param {Object} options
   *     Simplification options, as per simplify()
   * @return {Node} Returns expression with constant subexpressions evaluated
   */
  const simplifyConstant = typed('simplifyConstant', {
    Node: (node: MathNode) => _ensureNode(foldFraction(node, {})),

    'Node, Object': function (expr: MathNode, options: any) {
      return _ensureNode(foldFraction(expr, options))
    }
  })

  function _removeFractions (thing: any): any {
    if (isFraction(thing)) {
      return thing.valueOf()
    }
    if (thing instanceof Array) {
      return thing.map(_removeFractions)
    }
    if (isMatrix(thing)) {
      return matrix(_removeFractions(thing.valueOf()))
    }
    return thing
  }

  function _eval (fnname: string, args: any[], options: any): any {
    try {
      return mathWithTransform[fnname].apply(null, args)
    } catch (ignore) {
      // sometimes the implicit type conversion causes the evaluation to fail, so we'll try again after removing Fractions
      args = args.map(_removeFractions)
      return _toNumber(mathWithTransform[fnname].apply(null, args), options)
    }
  }

  const _toNode = typed({
    Fraction: _fractionToNode,
    number: function (n: number): MathNode {
      if (n < 0) {
        return unaryMinusNode(new ConstantNode(-n))
      }
      return new ConstantNode(n)
    },
    BigNumber: function (n: any): MathNode {
      if (n < 0) {
        return unaryMinusNode(new ConstantNode(-n))
      }
      return new ConstantNode(n) // old parameters: (n.toString(), 'number')
    },
    bigint: function (n: bigint): MathNode {
      if (n < 0n) {
        return unaryMinusNode(new ConstantNode(-n))
      }
      return new ConstantNode(n)
    },
    Complex: function (s: any): never {
      throw new Error('Cannot convert Complex number to Node')
    },
    string: function (s: string): ConstantNode {
      return new ConstantNode(s)
    },
    Matrix: function (m: any): ArrayNode {
      return new ArrayNode(m.valueOf().map((e: any) => _toNode(e)))
    }
  })

  function _ensureNode (thing: any): MathNode {
    if (isNode(thing)) {
      return thing
    }
    return _toNode(thing)
  }

  // convert a number to a fraction only if it can be expressed exactly,
  // and when both numerator and denominator are small enough
  function _exactFraction (n: any, options: any): any {
    const exactFractions = (options && options.exactFractions !== false)
    if (exactFractions && isBounded(n) && fraction) {
      const f = fraction(n)
      const fractionsLimit = (options && typeof options.fractionsLimit === 'number')
        ? options.fractionsLimit
        : Infinity // no limit by default

      if (f.valueOf() === n && f.n < fractionsLimit && f.d < fractionsLimit) {
        return f
      }
    }
    return n
  }

  // Convert numbers to a preferred number type in preference order: Fraction, number, Complex
  // BigNumbers are left alone
  const _toNumber = typed({
    'string, Object': function (s: string, options: any): any {
      const numericType = safeNumberType(s, config)

      if (numericType === 'BigNumber') {
        if (bignumber === undefined) {
          noBignumber()
        }
        return bignumber(s)
      } else if (numericType === 'bigint') {
        return BigInt(s)
      } else if (numericType === 'Fraction') {
        if (fraction === undefined) {
          noFraction()
        }
        return fraction(s)
      } else {
        const n = parseFloat(s)
        return _exactFraction(n, options)
      }
    },

    'Fraction, Object': function (s: any, options: any): any { return s }, // we don't need options here

    'BigNumber, Object': function (s: any, options: any): any { return s }, // we don't need options here

    'number, Object': function (s: number, options: any): any {
      return _exactFraction(s, options)
    },

    'bigint, Object': function (s: bigint, options: any): bigint {
      return s
    },

    'Complex, Object': function (s: any, options: any): any {
      if (s.im !== 0) {
        return s
      }
      return _exactFraction(s.re, options)
    },

    'Matrix, Object': function (s: any, options: any): any {
<<<<<<< HEAD
      return matrix(_exactFraction(s.valueOf(), options))
    },

    'Array, Object': function (s: any[], options: any): any {
      return s.map((item) => _exactFraction(item, options))
=======
      return matrix(_exactFraction(s.valueOf()))
    },

    'Array, Object': function (s: any[], options: any): any {
      return s.map(_exactFraction)
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
    }
  })

  function unaryMinusNode (n: MathNode): OperatorNode {
    return new OperatorNode('-', 'unaryMinus', [n])
  }

  function _fractionToNode (f: any): MathNode {
    // note: we convert await from bigint values, because bigint values gives issues with divisions: 1n/2n=0n and not 0.5
    const fromBigInt = (value: bigint): any => config.number === 'BigNumber' && bignumber ? bignumber(value) : Number(value)

    const numeratorValue = f.s * f.n
    const numeratorNode = (numeratorValue < 0n)
      ? new OperatorNode('-', 'unaryMinus', [new ConstantNode(-fromBigInt(numeratorValue))])
      : new ConstantNode(fromBigInt(numeratorValue))

    return (f.d === 1n)
      ? numeratorNode
      : new OperatorNode('/', 'divide', [numeratorNode, new ConstantNode(fromBigInt(f.d))])
  }

  /* Handles constant indexing of ArrayNodes, matrices, and ObjectNodes */
  function _foldAccessor (obj: any, index: any, options: any): MathNode {
    if (!isIndexNode(index)) { // don't know what to do with that...
      return new AccessorNode(_ensureNode(obj), _ensureNode(index))
    }
    if (isArrayNode(obj) || isMatrix(obj)) {
      const remainingDims = Array.from(index.dimensions)
      /* We will resolve constant indices one at a time, looking
       * just in the first or second dimensions because (a) arrays
       * of more than two dimensions are likely rare, and (b) pulling
       * out the third or higher dimension would be pretty intricate.
       * The price is that we miss simplifying [..3d array][x,y,1]
       */
      while (remainingDims.length > 0) {
        if (isConstantNode(remainingDims[0]) &&
            typeof remainingDims[0].value !== 'string') {
          const first = _toNumber(remainingDims.shift()!.value, options)
          if (isArrayNode(obj)) {
            obj = obj.items[first - 1]
          } else { // matrix
            obj = obj.valueOf()[first - 1]
            if (obj instanceof Array) {
              obj = matrix(obj)
            }
          }
        } else if (remainingDims.length > 1 &&
                   isConstantNode(remainingDims[1]) &&
                   typeof remainingDims[1].value !== 'string') {
          const second = _toNumber(remainingDims[1].value, options)
          const tryItems: any[] = []
          const fromItems = isArrayNode(obj) ? obj.items : obj.valueOf()
          for (const item of fromItems) {
            if (isArrayNode(item)) {
              tryItems.push(item.items[second - 1])
            } else if (isMatrix(obj)) {
              tryItems.push(item[second - 1])
            } else {
              break
            }
          }
          if (tryItems.length === fromItems.length) {
            if (isArrayNode(obj)) {
              obj = new ArrayNode(tryItems)
            } else { // matrix
              obj = matrix(tryItems)
            }
            remainingDims.splice(1, 1)
          } else { // extracting slice along 2nd dimension failed, give up
            break
          }
        } else { // neither 1st or 2nd dimension is constant, give up
          break
        }
      }
      if (remainingDims.length === index.dimensions.length) {
        /* No successful constant indexing */
        return new AccessorNode(_ensureNode(obj), index)
      }
      if (remainingDims.length > 0) {
        /* Indexed some but not all dimensions */
        index = new IndexNode(remainingDims)
        return new AccessorNode(_ensureNode(obj), index)
      }
      /* All dimensions were constant, access completely resolved */
      return obj
    }
    if (isObjectNode(obj) &&
        index.dimensions.length === 1 &&
        isConstantNode(index.dimensions[0])) {
      const key = index.dimensions[0].value
      if (key in obj.properties) {
        return obj.properties[key]
      }
      return new ConstantNode() // undefined
    }
    /* Don't know how to index this sort of obj, at least not with this index */
    return new AccessorNode(_ensureNode(obj), index)
  }

  /*
   * Create a binary tree from a list of Fractions and Nodes.
   * Tries to fold Fractions by evaluating them until the first Node in the list is hit, so
   * `args` should be sorted to have the Fractions at the start (if the operator is commutative).
   * @param args - list of Fractions and Nodes
   * @param fn - evaluator for the binary operation evaluator that accepts two Fractions
   * @param makeNode - creates a binary OperatorNode/FunctionNode from a list of child Nodes
   * if args.length is 1, returns args[0]
   * @return - Either a Node representing a binary expression or Fraction
   */
  function foldOp (fn: string, args: any[], makeNode: any, options: any): any {
    const first = args.shift()

    // In the following reduction, sofar always has one of the three following
    // forms: [NODE], [CONSTANT], or [NODE, CONSTANT]
    const reduction = args.reduce((sofar: any[], next: any) => {
      if (!isNode(next)) {
        const last = sofar.pop()

        if (isNode(last)) {
          return [last, next]
        }
        // Two constants in a row, try to fold them into one
        try {
          sofar.push(_eval(fn, [last, next], options))
          return sofar
        } catch (ignoreandcontinue) {
          sofar.push(last)
          // fall through to Node case
        }
      }

      // Encountered a Node, or failed folding --
      // collapse everything so far into a single tree:
      sofar.push(_ensureNode(sofar.pop()))
      const newtree = (sofar.length === 1) ? sofar[0] : makeNode(sofar)
      return [makeNode([newtree, _ensureNode(next)])]
    }, [first])

    if (reduction.length === 1) {
      return reduction[0]
    }
    // Might end up with a tree and a constant at the end:
    return makeNode([reduction[0], _toNode(reduction[1])])
  }

  // destroys the original node and returns a folded one
  function foldFraction (node: MathNode, options: any): any {
    switch (node.type) {
      case 'SymbolNode':
        return node
      case 'ConstantNode':
        switch (typeof (node as ConstantNode).value) {
          case 'number': return _toNumber((node as ConstantNode).value, options)
          case 'bigint': return _toNumber((node as ConstantNode).value, options)
          case 'string': return (node as ConstantNode).value
          default:
            if (!isNaN((node as ConstantNode).value)) return _toNumber((node as ConstantNode).value, options)
        }
        return node
      case 'FunctionNode':
        if (mathWithTransform[(node as FunctionNode).name] && mathWithTransform[(node as FunctionNode).name].rawArgs) {
          return node
        }
        {
          // Process operators as OperatorNode
          const operatorFunctions = ['add', 'multiply']
          if (!operatorFunctions.includes((node as FunctionNode).name)) {
            const args = (node as FunctionNode).args.map((arg: MathNode) => foldFraction(arg, options))

            // If all args are numbers
            if (!args.some(isNode)) {
              try {
                return _eval((node as FunctionNode).name, args, options)
              } catch (ignoreandcontinue) { }
            }

            // Size of a matrix does not depend on entries
            if ((node as FunctionNode).name === 'size' &&
                args.length === 1 &&
                isArrayNode(args[0])) {
              const sz: number[] = []
              let section = args[0]
              while (isArrayNode(section)) {
                sz.push(section.items.length)
                section = section.items[0]
              }
              return matrix(sz)
            }

            // Convert all args to nodes and construct a symbolic function call
            return new FunctionNode((node as FunctionNode).name, args.map(_ensureNode))
          } else {
            // treat as operator
          }
        }
        /* falls through */
      case 'OperatorNode':
      {
        const fn = (node as OperatorNode).fn.toString()
        let args: any[]
        let res: any
        const makeNode = createMakeNodeFunction(node as any)
        if (isOperatorNode(node) && node.isUnary()) {
          args = [foldFraction(node.args[0], options)]
          if (!isNode(args[0])) {
            res = _eval(fn, args, options)
          } else {
            res = makeNode(args)
          }
        } else if (isAssociative(node, options.context)) {
          args = allChildren(node as any, options.context)
          args = args.map((arg: MathNode) => foldFraction(arg, options))

          if (isCommutative(fn, options.context)) {
            // commutative binary operator
            const consts: any[] = []
            const vars: any[] = []

            for (let i = 0; i < args.length; i++) {
              if (!isNode(args[i])) {
                consts.push(args[i])
              } else {
                vars.push(args[i])
              }
            }

            if (consts.length > 1) {
              res = foldOp(fn, consts, makeNode, options)
              vars.unshift(res)
              res = foldOp(fn, vars, makeNode, options)
            } else {
              // we won't change the children order since it's not neccessary
              res = foldOp(fn, args, makeNode, options)
            }
          } else {
            // non-commutative binary operator
            res = foldOp(fn, args, makeNode, options)
          }
        } else {
          // non-associative binary operator
          args = (node as OperatorNode).args.map((arg: MathNode) => foldFraction(arg, options))
          res = foldOp(fn, args, makeNode, options)
        }
        return res
      }
      case 'ParenthesisNode':
        // remove the uneccessary parenthesis
        return foldFraction((node as ParenthesisNode).content, options)
      case 'AccessorNode':
        return _foldAccessor(
          foldFraction((node as AccessorNode).object, options),
          foldFraction((node as AccessorNode).index, options),
          options)
      case 'ArrayNode': {
        const foldItems = (node as ArrayNode).items.map((item: MathNode) => foldFraction(item, options))
        if (foldItems.some(isNode)) {
          return new ArrayNode(foldItems.map(_ensureNode))
        }
        /* All literals -- return a Matrix so we can operate on it */
        return matrix(foldItems)
      }
      case 'IndexNode': {
        return new IndexNode(
          (node as IndexNode).dimensions.map((n: MathNode) => simplifyConstant(n, options)))
      }
      case 'ObjectNode': {
        const foldProps: Record<string, MathNode> = {}
        for (const prop in (node as ObjectNode).properties) {
          foldProps[prop] = simplifyConstant((node as ObjectNode).properties[prop], options)
        }
        return new ObjectNode(foldProps)
      }
      case 'AssignmentNode':
        /* falls through */
      case 'BlockNode':
        /* falls through */
      case 'FunctionAssignmentNode':
        /* falls through */
      case 'RangeNode':
        /* falls through */
      case 'ConditionalNode':
        /* falls through */
      default:
        throw new Error(`Unimplemented node type in simplifyConstant: ${node.type}`)
    }
  }

  return simplifyConstant
})
