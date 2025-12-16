<<<<<<< HEAD
// @ts-nocheck
// test FunctionAssignmentNode
=======
/**
 * Test for FunctionAssignmentNode - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import { toObject } from '../../../../src/utils/map.js'
import math from '../../../../src/defaultInstance.ts'
const Node = math.Node
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode
const AssignmentNode = math.AssignmentNode
const ConditionalNode = math.ConditionalNode
const OperatorNode = math.OperatorNode
const FunctionNode = math.FunctionNode
const FunctionAssignmentNode = math.FunctionAssignmentNode
const RangeNode = math.RangeNode

<<<<<<< HEAD
describe('FunctionAssignmentNode', function () {
  it('should create a FunctionAssignmentNode', function () {
=======
describe('FunctionAssignmentNode', function (): void {
  it('should create a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new FunctionAssignmentNode('f', ['x'], new ConstantNode(2))
    assert(n instanceof FunctionAssignmentNode)
    assert(n instanceof Node)
    assert.strictEqual(n.type, 'FunctionAssignmentNode')
  })

<<<<<<< HEAD
  it('should have isFunctionAssignmentNode', function () {
=======
  it('should have isFunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = new FunctionAssignmentNode('f', ['x'], new ConstantNode(2))
    assert(node.isFunctionAssignmentNode)
  })

<<<<<<< HEAD
  it('should throw an error when calling without new operator', function () {
=======
  it('should throw an error when calling without new operator', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(
      () => FunctionAssignmentNode('f', ['x'], new ConstantNode(2)),
      TypeError
    )
  })

<<<<<<< HEAD
  it('should throw an error on wrong constructor arguments', function () {
    assert.throws(function () {
      console.log(new FunctionAssignmentNode())
    }, TypeError)
    assert.throws(function () {
      console.log(new FunctionAssignmentNode('a'))
    }, TypeError)
    assert.throws(function () {
      console.log(new FunctionAssignmentNode('a', ['x']))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error on wrong constructor arguments', function (): void {
    assert.throws(function (): void {
      console.log(new FunctionAssignmentNode())
    }, TypeError)
    assert.throws(function (): void {
      console.log(new FunctionAssignmentNode('a'))
    }, TypeError)
    assert.throws(function (): void {
      console.log(new FunctionAssignmentNode('a', ['x']))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new FunctionAssignmentNode(null, ['x'], new ConstantNode(2)))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should compile a FunctionAssignmentNode', function () {
=======
  it('should compile a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const o = new OperatorNode('+', 'add', [a, x])
    const n = new FunctionAssignmentNode('f', ['x'], o)

    const expr = n.compile()
    const scope = {}
    expr.evaluate(scope)
    assert.strictEqual(typeof scope.f, 'function')
    assert.strictEqual(scope.f(3), 5)
    assert.strictEqual(scope.f(5), 7)
  })

<<<<<<< HEAD
  it('should compile a typed FunctionAssignmentNode', function () {
=======
  it('should compile a typed FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const o = new OperatorNode('+', 'add', [a, x])
    const n = new FunctionAssignmentNode(
      'f',
      [{ name: 'x', type: 'number' }],
      o
    )

    const expr = n.compile()
    const scope = {}
    expr.evaluate(scope)
    assert.strictEqual(typeof scope.f, 'function')
    assert.strictEqual(scope.f(3), 5)
    assert.strictEqual(scope.f(5), 7)
<<<<<<< HEAD
    assert.throws(function () {
      scope.f(new Date())
    }, /Unexpected type of argument in function f/)
    assert.throws(function () {
      scope.f(2, 2)
    }, /Too many arguments in function f/)
    assert.throws(function () {
=======
    assert.throws(function (): void {
      scope.f(new Date())
    }, /Unexpected type of argument in function f/)
    assert.throws(function (): void {
      scope.f(2, 2)
    }, /Too many arguments in function f/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      scope.f()
    }, /Too few arguments in function f/)
  })

<<<<<<< HEAD
  it('should evaluate a recursive FunctionAssignmentNode', function () {
=======
  it('should evaluate a recursive FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const x = new SymbolNode('x')
    const one = new ConstantNode(1)
    const condition = new OperatorNode('<=', 'smallerEq', [x, one])
    const truePart = one
    const falsePart = new OperatorNode('*', 'multiply', [
      x,
      new FunctionNode(new SymbolNode('factorial'), [
        new OperatorNode('-', 'subtract', [x, one])
      ])
    ])
    const n1 = new ConditionalNode(condition, truePart, falsePart)

    const n2 = new FunctionAssignmentNode('factorial', ['x'], n1)

    const expr = n2.compile()
    const scope = {}
    const factorial = expr.evaluate(scope)
    assert.strictEqual(typeof scope.factorial, 'function')
    assert.strictEqual(factorial(3), 6)
    assert.strictEqual(factorial(5), 120)
  })

<<<<<<< HEAD
  it('should evaluate a recursive FunctionAssignmentNode with two recursive calls', function () {
=======
  it('should evaluate a recursive FunctionAssignmentNode with two recursive calls', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const x = new SymbolNode('x')
    const zero = new ConstantNode(0)
    const one = new ConstantNode(1)
    const two = new ConstantNode(2)

    const n1 = new ConditionalNode(
      new OperatorNode('<=', 'smallerEq', [x, zero]),
      zero,
      new ConditionalNode(
        new OperatorNode('<=', 'smallerEq', [x, two]),
        one,
        new OperatorNode('+', 'add', [
          new FunctionNode(new SymbolNode('fib'), [
            new OperatorNode('-', 'subtract', [x, one])
          ]),
          new FunctionNode(new SymbolNode('fib'), [
            new OperatorNode('-', 'subtract', [x, two])
          ])
        ])
      )
    )

    const n2 = new FunctionAssignmentNode('fib', ['x'], n1)
    // const n2 = math.parse('fib(x) = (x <= 0) ? 0 : ((x <= 2) ? 1 : (fib(x - 1) + f(fib - 2)))');

    const expr = n2.compile()
    const scope = {}
    const fib = expr.evaluate(scope)

    assert.strictEqual(typeof fib, 'function')
    assert.strictEqual(fib(0), 0)
    assert.strictEqual(fib(1), 1)
    assert.strictEqual(fib(2), 1)
    assert.strictEqual(fib(3), 2)
    assert.strictEqual(fib(4), 3)
    assert.strictEqual(fib(5), 5)
    assert.strictEqual(fib(6), 8)
    assert.strictEqual(fib(7), 13)
    assert.strictEqual(fib(8), 21)
  })

<<<<<<< HEAD
  it('should pass function arguments in scope to functions with rawArgs', function () {
=======
  it('should pass function arguments in scope to functions with rawArgs', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const outputScope = function (args, math, scope) {
      return toObject(scope)
    }
    outputScope.rawArgs = true
    math.import({ outputScope }, { override: true })

    // f(x) = outputScope(x)
    const x = new SymbolNode('x')
    const o = new FunctionNode('outputScope', [x])
    const n = new FunctionAssignmentNode('f', ['x'], o)

    const scope = { a: 2 }
    const f = n.evaluate(scope)
    assert.deepStrictEqual(f(3), { a: 2, f, x: 3 })
  })

<<<<<<< HEAD
  it('should pass function arguments in scope to functions with rawArgs returned by another function', function () {
=======
  it('should pass function arguments in scope to functions with rawArgs returned by another function', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const outputScope = function (args, math, scope) {
      return toObject(scope)
    }

    outputScope.rawArgs = true
    const returnOutputScope = function () {
      return outputScope
    }

    math.import(
      {
        outputScope,
        returnOutputScope
      },
      { override: true }
    )

    // f(x, y) = returnOutputScope(x)(y)
    const a = new FunctionNode('returnOutputScope', [new SymbolNode('x')])
    const b = new FunctionNode(a, [new SymbolNode('y')])
    const n = new FunctionAssignmentNode('f', ['x', 'y'], b)

    const scope = { a: 2 }
    const f = n.evaluate(scope)
    assert.deepStrictEqual(f(3, 4), { a: 2, f, x: 3, y: 4 })
  })

<<<<<<< HEAD
  it('should pass function arguments in scope to functions with rawArgs and transform', function () {
=======
  it('should pass function arguments in scope to functions with rawArgs and transform', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const outputScope = function (_x) {
      return 'should not occur'
    }
    outputScope.transform = function (args, math, scope) {
      return toObject(scope)
    }
    outputScope.transform.rawArgs = true
    math.import({ outputScope }, { override: true })

    // f(x) = outputScope(x)
    const x = new SymbolNode('x')
    const o = new FunctionNode('outputScope', [x])
    const n = new FunctionAssignmentNode('f', ['x'], o)

    const scope = { a: 2 }
    const f = n.evaluate(scope)
    assert.deepStrictEqual(f(3), { a: 2, f, x: 3 })
  })

<<<<<<< HEAD
  it('should pass function arguments via scope to rawArgs function', function () {
=======
  it('should pass function arguments via scope to rawArgs function', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const math2 = math.create()
    const f = function (args, _math, _scope) {
      return args[0].compile().evaluate(_scope)
    }
    f.rawArgs = true

    math2.import({ f })

    const g = math2.evaluate('g(arr) = f(arr)')
    assert.deepStrictEqual(g([1, 2, 3]), [1, 2, 3])
  })

<<<<<<< HEAD
  it('should pass function arguments via scope to an inner function', function () {
=======
  it('should pass function arguments via scope to an inner function', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const myFunc = math.evaluate(
      'myFunc(arr, val) = arr.map(f(x,i,a) = x * val)'
    )

    assert.deepStrictEqual(myFunc([1, 2, 3], 10), [10, 20, 30])
  })

<<<<<<< HEAD
  it('should evaluate a function passed as a parameter', function () {
=======
  it('should evaluate a function passed as a parameter', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const applicator = math.evaluate('applicator(f,x) = f(x)')
    assert.strictEqual(applicator(math.exp, 1), math.e)
    const repeater = math.evaluate('repeater(f,x) = f(f(x))')
    assert.strictEqual(
      repeater((x) => 2 * x, 3),
      12
    )
    const nd = math.evaluate('nd(f,x) = (f(x+1e-10)-f(x-1e-10))/2e-10')
    assert(nd(math.square, 2) - 4 < 1e-6)
  })

<<<<<<< HEAD
  it('should filter a FunctionAssignmentNode', function () {
=======
  it('should filter a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const o = new OperatorNode('+', 'add', [a, x])
    const n = new FunctionAssignmentNode('f', ['x'], o)

    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof FunctionAssignmentNode
      }),
      [n]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof SymbolNode
      }),
      [x]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof RangeNode
      }),
      []
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode
      }),
      [a]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode && node.value === 2
      }),
      [a]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode && node.value === 4
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should throw an error when creating a FunctionAssignmentNode with a reserved keyword', function () {
    assert.throws(function () {
=======
  it('should throw an error when creating a FunctionAssignmentNode with a reserved keyword', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new FunctionAssignmentNode('end', ['x'], new ConstantNode(2)))
    }, /Illegal function name/)
  })

<<<<<<< HEAD
  it('should filter a FunctionAssignmentNode without expression', function () {
=======
  it('should filter a FunctionAssignmentNode without expression', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const e = new FunctionAssignmentNode('f', ['x'], new ConstantNode(2))

    assert.deepStrictEqual(
      e.filter(function (node) {
        return node instanceof FunctionAssignmentNode
      }),
      [e]
    )
    assert.deepStrictEqual(
      e.filter(function (node) {
        return node instanceof SymbolNode
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should run forEach on a FunctionAssignmentNode', function () {
=======
  it('should run forEach on a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const n = new FunctionAssignmentNode('f', ['x'], a)

    const nodes = []
    const paths = []
    n.forEach(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)
    })

    assert.strictEqual(nodes.length, 1)
    assert.strictEqual(nodes[0], a)
    assert.deepStrictEqual(paths, ['expr'])
  })

<<<<<<< HEAD
  it('should map a FunctionAssignmentNode', function () {
=======
  it('should map a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const n = new FunctionAssignmentNode('f', ['x'], a)

    const nodes = []
    const paths = []
    const e = new ConstantNode(3)
    const f = n.map(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)

      return node instanceof SymbolNode && node.name === 'x' ? e : node
    })

    assert.strictEqual(nodes.length, 1)
    assert.strictEqual(nodes[0], a)
    assert.deepStrictEqual(paths, ['expr'])

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.expr, a)
  })

<<<<<<< HEAD
  it('should throw an error when the map callback does not return a node', function () {
    const a = new ConstantNode(2)
    const n = new FunctionAssignmentNode('f', ['x'], a)

    assert.throws(function () {
=======
  it('should throw an error when the map callback does not return a node', function (): void {
    const a = new ConstantNode(2)
    const n = new FunctionAssignmentNode('f', ['x'], a)

    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      n.map(function () {
        return undefined
      })
    }, /Callback function must return a Node/)
  })

<<<<<<< HEAD
  it('should throw an error when having duplicate variables', function () {
    assert.throws(function () {
=======
  it('should throw an error when having duplicate variables', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(
        new FunctionAssignmentNode('f', ['x', 'x'], new ConstantNode(2))
      )
    }, new Error('Duplicate parameter name "x"'))

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(
        new FunctionAssignmentNode('f', ['x', 'y', 'x'], new ConstantNode(2))
      )
    }, new Error('Duplicate parameter name "x"'))

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(
        new FunctionAssignmentNode('f', ['y', 'x', 'x'], new ConstantNode(2))
      )
    }, new Error('Duplicate parameter name "x"'))

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(
        new FunctionAssignmentNode(
          'f',
          ['x', { name: 'x' }],
          new ConstantNode(2)
        )
      )
    }, new Error('Duplicate parameter name "x"'))
  })

<<<<<<< HEAD
  it('should transform a FunctionAssignmentNodes (nested) parameters', function () {
=======
  it('should transform a FunctionAssignmentNodes (nested) parameters', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // f(x) = 2 + x
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const c = new OperatorNode('+', 'add', [a, x])
    const n = new FunctionAssignmentNode('f', ['x'], c)

    const e = new ConstantNode(3)
    const f = n.transform(function (node) {
      return node instanceof SymbolNode && node.name === 'x' ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.expr.args[0], a)
    assert.deepStrictEqual(f.expr.args[1], e)
  })

<<<<<<< HEAD
  it('should transform a FunctionAssignmentNode itself', function () {
=======
  it('should transform a FunctionAssignmentNode itself', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // f(x) = 2 + x
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const c = new OperatorNode('+', 'add', [a, x])
    const n = new FunctionAssignmentNode('f', ['x'], c)

    const e = new ConstantNode(5)
    const f = n.transform(function (node) {
      return node instanceof FunctionAssignmentNode ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f, e)
  })

<<<<<<< HEAD
  it('should clone a FunctionAssignmentNode', function () {
=======
  it('should clone a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // f(x) = 2 + x
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const c = new OperatorNode('+', 'add', [a, x])
    const d = new FunctionAssignmentNode('f', ['x'], c)

    const e = d.clone()
    assert(e instanceof FunctionAssignmentNode)
    assert.deepStrictEqual(e, d)
    assert.notStrictEqual(e, d)
    assert.strictEqual(e.expr, d.expr)
  })

<<<<<<< HEAD
  it('test equality another Node', function () {
=======
  it('test equality another Node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new FunctionAssignmentNode(
      'f',
      ['x'],
      new OperatorNode('+', 'add', [new ConstantNode(2), new SymbolNode('x')])
    )
    const b = new FunctionAssignmentNode(
      'f',
      ['x'],
      new OperatorNode('+', 'add', [new ConstantNode(2), new SymbolNode('x')])
    )
    const c = new FunctionAssignmentNode(
      'g',
      ['x'],
      new OperatorNode('+', 'add', [new ConstantNode(2), new SymbolNode('x')])
    )
    const d = new FunctionAssignmentNode(
      'f',
      ['y'],
      new OperatorNode('+', 'add', [new ConstantNode(2), new SymbolNode('x')])
    )
    const e = new FunctionAssignmentNode(
      'f',
      ['x'],
      new OperatorNode('+', 'add', [new ConstantNode(3), new SymbolNode('x')])
    )
    const f = new SymbolNode('add')

    assert.strictEqual(a.equals(null), false)
    assert.strictEqual(a.equals(undefined), false)
    assert.strictEqual(a.equals(b), true)
    assert.strictEqual(a.equals(c), false)
    assert.strictEqual(a.equals(d), false)
    assert.strictEqual(a.equals(e), false)
    assert.strictEqual(a.equals(f), false)
  })

<<<<<<< HEAD
  it("should respect the 'all' parenthesis option", function () {
=======
  it("should respect the 'all' parenthesis option", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expr = math.parse('f(x)=x+1')
    assert.strictEqual(expr.toString({ parenthesis: 'all' }), 'f(x) = (x + 1)')
    assert.strictEqual(
      expr.toTex({ parenthesis: 'all' }),
      '\\mathrm{f}\\left(x\\right)=\\left( x+1\\right)'
    )
  })

<<<<<<< HEAD
  it('should stringify a FunctionAssignmentNode', function () {
=======
  it('should stringify a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const o = new OperatorNode('+', 'add', [a, x])
    const n = new FunctionAssignmentNode('f', ['x'], o)

    assert.strictEqual(n.toString(), 'f(x) = 2 + x')
  })

<<<<<<< HEAD
  it('should stringify a FunctionAssignmentNode containing an AssignmentNode', function () {
=======
  it('should stringify a FunctionAssignmentNode containing an AssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)

    const n1 = new AssignmentNode(new SymbolNode('a'), a)
    const n = new FunctionAssignmentNode('f', ['x'], n1)

    assert.strictEqual(n.toString(), 'f(x) = (a = 2)')
  })

<<<<<<< HEAD
  it('should stringify a FunctionAssignmentNode with custom toString', function () {
=======
  it('should stringify a FunctionAssignmentNode with custom toString', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'FunctionAssignmentNode') {
        let string = '[' + node.name + ']('
        node.params.forEach(function (param) {
          string += param + ', '
        })

        string += ')=' + node.expr.toString(options)
        return string
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const a = new ConstantNode(1)

    const n = new FunctionAssignmentNode('func', ['x'], a)

    assert.strictEqual(
      n.toString({ handler: customFunction }),
      '[func](x, )=const(1, number)'
    )
  })

<<<<<<< HEAD
  it('should stringify a FunctionAssignmentNode with custom toHTML', function () {
=======
  it('should stringify a FunctionAssignmentNode with custom toHTML', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'FunctionAssignmentNode') {
        let string = '[' + node.name + ']('
        node.params.forEach(function (param) {
          string += param + ', '
        })

        string += ')=' + node.expr.toHTML(options)
        return string
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const a = new ConstantNode(1)

    const n = new FunctionAssignmentNode('func', ['x'], a)

    assert.strictEqual(
      n.toHTML({ handler: customFunction }),
      '[func](x, )=const(1, number)'
    )
  })

<<<<<<< HEAD
  it('toJSON and fromJSON', function () {
=======
  it('toJSON and fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expr = new SymbolNode('add')
    const node = new FunctionAssignmentNode(
      'f',
      [{ name: 'x', type: 'number' }, 'y'],
      expr
    )

    const json = node.toJSON()

    assert.deepStrictEqual(json, {
      mathjs: 'FunctionAssignmentNode',
      name: 'f',
      params: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'any' }
      ],
      expr
    })

    const parsed = FunctionAssignmentNode.fromJSON(json)
    assert.deepStrictEqual(parsed, node)
  })

<<<<<<< HEAD
  it('should LaTeX a FunctionAssignmentNode', function () {
=======
  it('should LaTeX a FunctionAssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const x = new SymbolNode('x')
    const o = new OperatorNode('/', 'divide', [x, a])
    const p = new OperatorNode('^', 'pow', [o, a])
    const n = new FunctionAssignmentNode('f', ['x'], p)

    assert.strictEqual(
      n.toTex(),
      '\\mathrm{f}\\left(x\\right)=\\left({\\frac{ x}{2}}\\right)^{2}'
    )
  })

<<<<<<< HEAD
  it('should LaTeX a FunctionAssignmentNode containing an AssignmentNode', function () {
=======
  it('should LaTeX a FunctionAssignmentNode containing an AssignmentNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)

    const n1 = new AssignmentNode(new SymbolNode('a'), a)
    const n = new FunctionAssignmentNode('f', ['x'], n1)

    assert.strictEqual(
      n.toTex(),
      '\\mathrm{f}\\left(x\\right)=\\left( a=2\\right)'
    )
  })

<<<<<<< HEAD
  it('should LaTeX a FunctionAssignmentNode with custom toTex', function () {
=======
  it('should LaTeX a FunctionAssignmentNode with custom toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'FunctionAssignmentNode') {
        let latex = '\\mbox{' + node.name + '}\\left('
        node.params.forEach(function (param) {
          latex += param + ', '
        })

        latex += '\\right)=' + node.expr.toTex(options)
        return latex
      } else if (node.type === 'ConstantNode') {
        return (
          'const\\left(' +
          node.value +
          ', ' +
          math.typeOf(node.value) +
          '\\right)'
        )
      }
    }

    const a = new ConstantNode(1)

    const n = new FunctionAssignmentNode('func', ['x'], a)

    assert.strictEqual(
      n.toTex({ handler: customFunction }),
      '\\mbox{func}\\left(x, \\right)=const\\left(1, number\\right)'
    )
  })
})
