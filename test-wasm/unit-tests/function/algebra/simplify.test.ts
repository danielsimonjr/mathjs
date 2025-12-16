<<<<<<< HEAD
// @ts-nocheck
// test simplify
=======
/**
 * Test for simplify - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
const expLibrary = []
// eslint-disable-next-line mocha/no-exports
export function simplifyAndCompare(left, right, rules, scope, opt, stringOpt) {
=======
interface MathNode {
  type: string
  toTex(): string
}

const expLibrary: string[] = []
// eslint-disable-next-line mocha/no-exports
export function simplifyAndCompare(left: string, right: string, rules?: any, scope?: any, opt?: any, stringOpt?: any): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
  expLibrary.push(left)
  let simpLeft
  try {
    if (Array.isArray(rules)) {
      if (opt) {
        simpLeft = math.simplify(left, rules, scope, opt)
      } else if (scope) {
        simpLeft = math.simplify(left, rules, scope)
      } else {
        simpLeft = math.simplify(left, rules)
      }
    } else {
      if (opt) stringOpt = opt
      if (scope) opt = scope
      if (rules) scope = rules
      if (opt) {
        simpLeft = math.simplify(left, scope, opt)
      } else if (scope) {
        simpLeft = math.simplify(left, scope)
      } else {
        simpLeft = math.simplify(left)
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.stack)
    } else {
      console.log(new Error(err))
    }
    throw err
  }
  assert.strictEqual(
    simpLeft.toString(stringOpt),
    math.parse(right).toString(stringOpt)
  )
}

<<<<<<< HEAD
describe('simplify', function () {
  function simplifyAndCompareEval(left, right, scope) {
=======
describe('simplify', function (): void {
  function simplifyAndCompareEval(left: string, right: string, scope?: any): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    expLibrary.push(left)
    scope = scope || {}
    assert.strictEqual(
      math.simplify(left).evaluate(scope),
      math.parse(right).evaluate(scope)
    )
  }

<<<<<<< HEAD
  describe('wildcard types', function () {
    it("should match constants ('c' and 'cl') correctly", function () {
=======
  describe('wildcard types', function (): void {
    it("should match constants ('c' and 'cl') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // c, cl - ConstantNode
      simplifyAndCompare('1', '5', [{ l: 'c', r: '5' }])
      simplifyAndCompare('-1', '-5', [{ l: 'c', r: '5' }])
      simplifyAndCompare('a', 'a', [{ l: 'c', r: '5' }])
      simplifyAndCompare('2 * a', '5 * a', [{ l: 'c', r: '5' }])

      simplifyAndCompare('1', '5', [{ l: 'cl', r: '5' }])
      simplifyAndCompare('-1', '-5', [{ l: 'cl', r: '5' }])
      simplifyAndCompare('a', 'a', [{ l: 'cl', r: '5' }])
      simplifyAndCompare('2 * a', '5 * a', [{ l: 'cl', r: '5' }])
    })

<<<<<<< HEAD
    it("should match variables ('v') correctly", function () {
=======
    it("should match variables ('v') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // v - Non-ConstantNode
      simplifyAndCompare('1', '1', [{ l: 'v', r: '5' }])
      simplifyAndCompare('-1', '5', [{ l: 'v', r: '5' }])
      simplifyAndCompare('a', '5', [{ l: 'v', r: '5' }])
      simplifyAndCompare('2 * a', '5', [{ l: 'v', r: '5' }])
    })

<<<<<<< HEAD
    it("should match variable literals ('vl') correctly", function () {
=======
    it("should match variable literals ('vl') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // vl - Variable
      simplifyAndCompare('1', '1', [{ l: 'vl', r: '5' }])
      simplifyAndCompare('-1', '-1', [{ l: 'vl', r: '5' }])
      simplifyAndCompare('a', '5', [{ l: 'vl', r: '5' }])
      simplifyAndCompare('2 * a', '2 * 5', [{ l: 'vl', r: '5' }])
    })

<<<<<<< HEAD
    it("should match decimal literals ('cd') correctly", function () {
=======
    it("should match decimal literals ('cd') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // cd - Number
      simplifyAndCompare('1', '5', [{ l: 'cd', r: '5' }])
      simplifyAndCompare('-1', '5', [{ l: 'cd', r: '5' }])
      simplifyAndCompare('a', 'a', [{ l: 'cd', r: '5' }])
      simplifyAndCompare('2 * a', '5 * a', [{ l: 'cd', r: '5' }])
    })

<<<<<<< HEAD
    it("should match non-decimals ('vd') correctly", function () {
=======
    it("should match non-decimals ('vd') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // vd - Non-number
      simplifyAndCompare('1', '1', [{ l: 'vd', r: '5' }])
      simplifyAndCompare('-1', '-1', [{ l: 'vd', r: '5' }])
      simplifyAndCompare('a', '5', [{ l: 'vd', r: '5' }])
      simplifyAndCompare('2 * a', '5', [{ l: 'vd', r: '5' }])
    })

<<<<<<< HEAD
    it("should match constant expressions ('ce') correctly", function () {
=======
    it("should match constant expressions ('ce') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // ce - Constant Expression
      simplifyAndCompare('1', '5', [{ l: 'ce', r: '5' }])
      simplifyAndCompare('-1', '5', [{ l: 'ce', r: '5' }])
      simplifyAndCompare('a', 'a', [{ l: 'ce', r: '5' }])
      simplifyAndCompare('2 * a', '5 * a', [{ l: 'ce', r: '5' }])
      simplifyAndCompare('2 ^ 32 + 3', '5', [{ l: 'ce', r: '5' }])
      simplifyAndCompare('2 ^ 32 + x', '5 + x', [{ l: 'ce', r: '5' }])
      simplifyAndCompare('2 ^ 32 + pi', '5', [{ l: 'ce', r: '5' }], {
        pi: math.pi
      })
    })

<<<<<<< HEAD
    it("should match variable expressions ('ve') correctly", function () {
=======
    it("should match variable expressions ('ve') correctly", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // ve - Variable Expression
      simplifyAndCompare('1', '1', [{ l: 've', r: '5' }])
      simplifyAndCompare('-1', '-1', [{ l: 've', r: '5' }])
      simplifyAndCompare('a', '5', [{ l: 've', r: '5' }])
      simplifyAndCompare('2 * a', '2 * 5', [{ l: 've', r: '5' }])
      simplifyAndCompare('2 ^ 32 + 3', '2 ^ 32 + 3', [{ l: 've', r: '5' }])
      simplifyAndCompare('2 ^ 32 + x', '2 ^ 32 + 5', [{ l: 've', r: '5' }])
      simplifyAndCompare(
        '2 ^ 32 + pi',
        '2 ^ 32 + 3.141592653589793',
        [{ l: 've', r: '5' }],
        { pi: math.pi }
      )
    })

<<<<<<< HEAD
    it('should correctly separate constant and variable expressions', function () {
=======
    it('should correctly separate constant and variable expressions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      simplifyAndCompare('2 * a ^ 5 * 8', '5', [{ l: 'ce * ve', r: '5' }])
      simplifyAndCompare('2 * a ^ 5 * 8 + 3', '5 + 3', [
        { l: 'ce * ve', r: '5' }
      ])
    })
  })

<<<<<<< HEAD
  it('should not change the value of the function', function () {
=======
  it('should not change the value of the function', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompareEval('3+2/4+2*8', '39/2')
    simplifyAndCompareEval('x+1+x', '2x+1', { x: 7 })
    simplifyAndCompareEval('x+1+2x', '3x+1', { x: 7 })
    simplifyAndCompareEval('x^2+x-3+x^2', '2x^2+x-3', { x: 7 })
  })

<<<<<<< HEAD
  it('should place constants at the end of expressions unless subtraction takes priority', function () {
=======
  it('should place constants at the end of expressions unless subtraction takes priority', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('2 + x', 'x + 2')
    simplifyAndCompare('-2 + x', 'x - 2')
    simplifyAndCompare('-2 + -x', '-x - 2')
    simplifyAndCompare('2 + -x', '2 - x')
  })

<<<<<<< HEAD
  it('should simplify exponents', function () {
=======
  it('should simplify exponents', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // power rule
    simplifyAndCompare('(x^2)^3', 'x^6')
    simplifyAndCompare('2*(x^2)^3', '2*x^6')

    // simplify exponent
    simplifyAndCompare('x^(2+3)', 'x^5')

    // right associative
    simplifyAndCompare('x^2^3', 'x^8')
  })

<<<<<<< HEAD
  it('should simplify rational expressions with no symbols to fraction', function () {
=======
  it('should simplify rational expressions with no symbols to fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('3*4', '12')
    simplifyAndCompare('3+2/4', '7/2')
  })

<<<<<<< HEAD
  it('handles string constants', function () {
=======
  it('handles string constants', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('"a"', '"a"')
    simplifyAndCompare('foo("0xffff")', 'foo("0xffff")')
    simplifyAndCompare('"1234"', '"1234"')
    simplifyAndCompare('concat("a","b")', '"ab"')
    simplifyAndCompare('matrix(size(concat("A","4/2")))', '[4]')
    simplifyAndCompare('string(4/2)', '"2"')
    simplifyAndCompare('2+number("2")', '4')
  })

<<<<<<< HEAD
  it('should simplify equations with different variables', function () {
=======
  it('should simplify equations with different variables', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('-(x+y)', '-(x + y)')
    simplifyAndCompare('-(x*y)', '-(x * y)')
    simplifyAndCompare('-(x+y+x+y)', '-(2 * (y + x))')
    simplifyAndCompare('(x-y)', 'x - y')
    simplifyAndCompare('0+(x-y)', 'x - y')
    simplifyAndCompare('-(x-y)', 'y - x')
    simplifyAndCompare('-1 * (x-y)', 'y - x')
    simplifyAndCompare('x + y + x + 2y', '3 * y + 2 * x')
  })

<<<<<<< HEAD
  it('should simplify (-1)*n', function () {
=======
  it('should simplify (-1)*n', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('(-1)*4', '-4')
    simplifyAndCompare('(-1)*x', '-x')
  })

<<<<<<< HEAD
  it('should handle function assignments', function () {
=======
  it('should handle function assignments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const f = new math.FunctionAssignmentNode(
      'sigma',
      ['x'],
      math.parse('1 / (1 + exp(-x))')
    )
    assert.strictEqual(f.toString(), 'sigma(x) = 1 / (1 + exp(-x))')
    assert.strictEqual(f.evaluate()(5), 0.9933071490757153)
    const fsimplified = math.simplifyCore(f)
    assert.strictEqual(fsimplified.toString(), 'sigma(x) = 1 / (1 + exp(-x))')
    assert.strictEqual(fsimplified.evaluate()(5), 0.9933071490757153)
  })

<<<<<<< HEAD
  it('should simplify convert minus and unary minus', function () {
=======
  it('should simplify convert minus and unary minus', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompareEval('--2', '2')
    // see https://github.com/josdejong/mathjs/issues/1013
    assert.strictEqual(math.simplify('0 - -1', {}).toString(), '1')
    assert.strictEqual(math.simplify('0 - -x', {}).toString(), 'x')
    assert.strictEqual(math.simplify('0----x', {}).toString(), 'x')
    assert.strictEqual(math.simplify('1 - -x', {}).toString(), 'x + 1')
    assert.strictEqual(math.simplify('0 - (-x)', {}).toString(), 'x')
    assert.strictEqual(math.simplify('-(-x)', {}).toString(), 'x')
    assert.strictEqual(math.simplify('0 - (x - y)', {}).toString(), 'y - x')
  })

<<<<<<< HEAD
  it('should simplify inside arrays and indexing', function () {
=======
  it('should simplify inside arrays and indexing', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('[3x+0]', '[3x]')
    simplifyAndCompare('[3x+5x]', '[8*x]')
    simplifyAndCompare('[2*3,6+2]', '[6,8]')
    simplifyAndCompare('[x^0,y*0,z*1,w-0][2+n*1]', '[1,0,z,w][n+2]')
    simplifyAndCompare('[x,y-2y,z,w+w][(3-2)*n+2]', '[x,-y,z,2*w][n+2]')
  })

<<<<<<< HEAD
  it('should simplify inside objects', function () {
    simplifyAndCompare('{a:(x^2+x*x), b:2+6, c:n+0}', '{a:2*x^2, b:8, c:n}')
  })

  it('should index an array or object with a constant', function () {
=======
  it('should simplify inside objects', function (): void {
    simplifyAndCompare('{a:(x^2+x*x), b:2+6, c:n+0}', '{a:2*x^2, b:8, c:n}')
  })

  it('should index an array or object with a constant', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('[x,y,z][2]', 'y')
    simplifyAndCompare('5+[6*2,3-3][2-1]', '17')
    simplifyAndCompare('[1,2,1,2;3,4,3,4][2,y+2]', '[3,4,3,4][y+2]')
    simplifyAndCompare('[1,2;3,4;5,6;7,8][y+2,2]', '[2,4,6,8][y+2]')
    simplifyAndCompare('{a:3,b:2}.b', '2')
    simplifyAndCompare('{a:3,b:2}.c', 'undefined')
  })

<<<<<<< HEAD
  it('should compute with literal constant matrices', function () {
=======
  it('should compute with literal constant matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('[1,2]+[3,4]', '[4,6]')
    simplifyAndCompare('[0,1;2,3]*[3,2;1,0]', '[1,0;9,4]')
    simplifyAndCompare('3*[0,1,2;3,4,5]', '[0,3,6;9,12,15]')
    simplifyAndCompare('zeros(2,1)', '[0;0]')
    simplifyAndCompare('ones(3)', '[1,1,1]')
    simplifyAndCompare('identity(2)', '[1,0;0,1]')
    simplifyAndCompare('floor([1.1,4.4,9.9])', '[1,4,9]')
    simplifyAndCompare('det([2,1;-1,3])', '7')
    simplifyAndCompare("[1,2;3,4]'", '[1,3;2,4]')
  })

<<<<<<< HEAD
  it('should recognize array size does not depend on entries', function () {
    simplifyAndCompare('size([x,y;z,w])', '[2,2]')
  })

  it('should handle custom functions', function () {
=======
  it('should recognize array size does not depend on entries', function (): void {
    simplifyAndCompare('size([x,y;z,w])', '[2,2]')
  })

  it('should handle custom functions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    function doubleIt(x) {
      return x + x
    }
    const f = new math.FunctionNode(new math.SymbolNode('doubleIt'), [
      new math.SymbolNode('value')
    ])
    assert.strictEqual(f.toString(), 'doubleIt(value)')
    assert.strictEqual(f.evaluate({ doubleIt, value: 4 }), 8)
    const fsimplified = math.simplifyCore(f)
    assert.strictEqual(fsimplified.toString(), 'doubleIt(value)')
    assert.strictEqual(fsimplified.evaluate({ doubleIt, value: 4 }), 8)
  })

<<<<<<< HEAD
  it('should handle immediately invoked function assignments', function () {
=======
  it('should handle immediately invoked function assignments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const s = new math.FunctionAssignmentNode(
      'sigma',
      ['x'],
      math.parse('1 / (1 + exp(-x))')
    )
    const f = new math.FunctionNode(s, [new math.SymbolNode('x')])
    assert.strictEqual(f.toString(), '(sigma(x) = 1 / (1 + exp(-x)))(x)')
    assert.strictEqual(f.evaluate({ x: 5 }), 0.9933071490757153)
    const fsimplified = math.simplifyCore(f)
    assert.strictEqual(
      fsimplified.toString(),
      '(sigma(x) = 1 / (1 + exp(-x)))(x)'
    )
    assert.strictEqual(fsimplified.evaluate({ x: 5 }), 0.9933071490757153)
  })

<<<<<<< HEAD
  it('should simplify (n- -n1)', function () {
=======
  it('should simplify (n- -n1)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('2 + -3', '-1')
    simplifyAndCompare('2 - 3', '-1')
    simplifyAndCompare('2 - -3', '5')
    let e = math.parse('2 - -3')
    e = math.simplifyCore(e)
    assert.strictEqual(e.toString(), '2 + 3') // simplifyCore
    simplifyAndCompare('x - -x', '2*x')
    e = math.parse('x - -x')
    e = math.simplifyCore(e)
    assert.strictEqual(e.toString(), 'x + x') // not a core simplification since + is cheaper than *
  })

<<<<<<< HEAD
  it('should preserve the value of BigNumbers', function () {
=======
  it('should preserve the value of BigNumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ number: 'BigNumber', precision: 64 })
    assert.deepStrictEqual(
      bigmath.simplify('111111111111111111 + 111111111111111111').evaluate(),
      bigmath.evaluate('222222222222222222')
    )
    assert.deepStrictEqual(
      bigmath.simplify('1 + 111111111111111111').evaluate(),
      bigmath.evaluate('111111111111111112')
    )
    assert.deepStrictEqual(
      bigmath.simplify('1/2 + 11111111111111111111').evaluate(),
      bigmath.evaluate('11111111111111111111.5')
    )
    assert.deepStrictEqual(
      bigmath.simplify('1/3 + 11111111111111111111').evaluate(),
      bigmath.evaluate(
        '11111111111111111111.33333333333333333333333333333333333333333333'
      )
    )
    assert.deepStrictEqual(
      bigmath.simplify('3 + 1 / 11111111111111111111').evaluate(),
      bigmath.evaluate('3 + 1 / 11111111111111111111')
    )
  })

<<<<<<< HEAD
  it('should preserve the value of bigints', function () {
=======
  it('should preserve the value of bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ number: 'bigint' })
    assert.deepStrictEqual(
      bigmath.simplify('70000000000000000123 + 1').evaluate(),
      70000000000000000124n
    )
    assert.deepStrictEqual(
      bigmath.simplify('70000000000000000123 + 5e3').evaluate(),
      70000000000000010000
    )
    assert.deepStrictEqual(
      bigmath.simplify('70000000000000000123 + bigint(5000)').evaluate(),
      70000000000000005123n
    )
  })

<<<<<<< HEAD
  it('should not change the value of numbers when converting to fractions (1)', function () {
    simplifyAndCompareEval('1e-10', '1e-10')
  })

  it('should not change the value of numbers when converting to fractions (2)', function () {
    simplifyAndCompareEval('0.2 * 1e-14', '2e-15')
  })

  it('should not change the value of numbers when converting to fractions (3)', function () {
=======
  it('should not change the value of numbers when converting to fractions (1)', function (): void {
    simplifyAndCompareEval('1e-10', '1e-10')
  })

  it('should not change the value of numbers when converting to fractions (2)', function (): void {
    simplifyAndCompareEval('0.2 * 1e-14', '2e-15')
  })

  it('should not change the value of numbers when converting to fractions (3)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // TODO this requires that all operators and functions have the correct logic in their 'Fraction' typed-functions.
    //      Ideally they should convert parameters to Fractions if they can all be expressed exactly,
    //      otherwise convert all parameters to the 'number' type.
    simplifyAndCompareEval('1 - 1e-10', '1 - 1e-10')
    simplifyAndCompareEval('1 + 1e-10', '1 + 1e-10')
    simplifyAndCompareEval('1e-10 / 2', '1e-10 / 2')
    simplifyAndCompareEval('(1e-5)^2', '1e-10')
    simplifyAndCompareEval('min(1, -1e-10)', '-1e-10')
    simplifyAndCompareEval('max(1e-10, -1)', '1e-10')
  })

<<<<<<< HEAD
  it('should simplify non-rational expressions with no symbols to number', function () {
    simplifyAndCompare('3+sin(4)', '2.2431975046920716')
  })

  it('should collect like terms', function () {
=======
  it('should simplify non-rational expressions with no symbols to number', function (): void {
    simplifyAndCompare('3+sin(4)', '2.2431975046920716')
  })

  it('should collect like terms', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('x+x', '2*x')
    simplifyAndCompare('2x+x', '3*x')
    simplifyAndCompare('2(x+1)+(x+1)', '3*(x + 1)')
    simplifyAndCompare('2(x+1)+x+1', '3*(x + 1)')
    simplifyAndCompare('y*x^2+2*x^2', 'x^2*(y+2)')
    simplifyAndCompare('x*y + y*x', '2*x*y')
    simplifyAndCompare('x*y - y*x', '0')
    simplifyAndCompare('x^2*y^3*z - y*z*y*x^2*y', '0')
    simplifyAndCompare('x^2*y^3*z - y*z*x^2*y', 'x^2*z*(y^3-y^2)')
  })

<<<<<<< HEAD
  it('can simplify with functions as well as operators', function () {
=======
  it('can simplify with functions as well as operators', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('add(x,x)', '2*x')
    simplifyAndCompare('multiply(x,2)+x', '3*x')
    simplifyAndCompare('add(2*add(x,1), x+1)', '3*(x + 1)')
    simplifyAndCompare('multiply(2, x+1) + add(x,1)', '3*(x + 1)')
    simplifyAndCompare('add(y*pow(x,2), multiply(2,x^2))', 'x^2*(y+2)')
    simplifyAndCompare('add(x*y, multiply(y,x))', '2*x*y')
    simplifyAndCompare('subtract(multiply(x,y), multiply(y,x))', '0')
    simplifyAndCompare('pow(x,2)*multiply(y^3, z) - multiply(y,z,y,x^2,y)', '0')
    simplifyAndCompare(
      'subtract(multiply(x^2, pow(y,3))*z, y*multiply(z,x^2)*y)',
      'x^2*z*(y^3-y^2)'
    )
  })

<<<<<<< HEAD
  it('should collect separated like terms', function () {
=======
  it('should collect separated like terms', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('x+1+x', '2*x+1')
    simplifyAndCompare('x^2+x+3+x^2', '2*x^2+x+3')
    simplifyAndCompare('x+1+2x', '3*x+1')
    simplifyAndCompare('x-1+x', '2*x-1')
    simplifyAndCompare('2-(x+1)', '1-x') // #2393
    simplifyAndCompare('x-1-2x+2', '1-x')
  })

<<<<<<< HEAD
  it('should collect like terms that are embedded in other terms', function () {
=======
  it('should collect like terms that are embedded in other terms', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('10 - (x - 2)', '12 - x')
    simplifyAndCompare('x - (y + x)', '-y')
    simplifyAndCompare('x - (y - y + x)', '0')
    simplifyAndCompare('x - (y - (y - x))', '0')
    simplifyAndCompare('5 + (5 * x) - (3 * x) + 2', '2*x+7')
    simplifyAndCompare('x^2*y^2 - (x*y)^2', '0')
    simplifyAndCompare('(x*z^2 + y*z)/z^4', '(y + z*x)/z^3') // #1423
    simplifyAndCompare('(x^2*y + z*y)/y^4', '(x^2 + z)/y^3')
    simplifyAndCompare('6x/3x', '2') // Additional cases from PR review
    simplifyAndCompare('-28y/-4y', '7')
    simplifyAndCompare('-28*(z/-4z)', '7')
    simplifyAndCompare('(x^2 + 2x)*x', '2*x^2 + x^3')
    simplifyAndCompare('x + y/z', 'x + y/z') // avoid overzealous '(x+y*z)/z'
  })

<<<<<<< HEAD
  it('should collect separated like factors', function () {
=======
  it('should collect separated like factors', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('x*y*-x/(x^2)', '-y')
    simplifyAndCompare('x/2*x', 'x^2/2')
    simplifyAndCompare('x*2*x', '2*x^2')
  })

<<<<<<< HEAD
  it('should preserve seperated numerical factors', function () {
=======
  it('should preserve seperated numerical factors', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('2 * (2 * x + y)', '2 * (2 * x + y)')
    simplifyAndCompare('-2 * (-2 * x + y)', '-(2 * (y - 2 * x))') // Failed before introduction of vd in #1915
  })

<<<<<<< HEAD
  it('should handle nested exponentiation', function () {
=======
  it('should handle nested exponentiation', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('(x^2)^3', 'x^6')
    simplifyAndCompare('(x^y)^z', 'x^(y*z)')
    simplifyAndCompare('8 * x ^ 9 + 2 * (x ^ 3) ^ 3', '10 * x ^ 9')
  })

<<<<<<< HEAD
  it('should not run into an infinite recursive loop', function () {
=======
  it('should not run into an infinite recursive loop', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('2n - 1', '2 n - 1')
    simplifyAndCompare('16n - 1', '16 n - 1')
    simplifyAndCompare('16n / 1', '16 n')
    simplifyAndCompare('8 / 5n', 'n * 8 / 5')
    simplifyAndCompare('8n - 4n', '4 * n')
    simplifyAndCompare('8 - 4n', '8 - 4 * n')
    simplifyAndCompare('8 - n', '8 - n')
  })

<<<<<<< HEAD
  it('should handle non-existing functions like a pro', function () {
=======
  it('should handle non-existing functions like a pro', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('foo(x)', 'foo(x)')
    simplifyAndCompare('foo(1)', 'foo(1)')
    simplifyAndCompare('myMultiArg(x, y, z, w)', 'myMultiArg(x, y, z, w)')
  })

<<<<<<< HEAD
  it('should simplify a/(b/c)', function () {
=======
  it('should simplify a/(b/c)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('x/(x/y)', 'y')
    simplifyAndCompare('x/(y/z)', 'x * z/y')
    simplifyAndCompare('(x + 1)/((x + 1)/(z + 3))', 'z + 3')
    simplifyAndCompare('(x + 1)/((y + 2)/(z + 3))', '(x + 1) * (z + 3)/(y + 2)')
  })

<<<<<<< HEAD
  it('should support custom rules', function () {
=======
  it('should support custom rules', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = math.simplify('y+x', [{ l: 'n1-n2', r: '-n2+n1' }], { x: 5 })
    assert.strictEqual(node.toString(), 'y + 5')
  })

<<<<<<< HEAD
  it('should handle valid built-in constant symbols in rules', function () {
=======
  it('should handle valid built-in constant symbols in rules', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.simplify('true', ['true -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('false', ['false -> 0']).toString(), '0')
    assert.strictEqual(math.simplify('log(e)', ['log(e) -> 1']).toString(), '1')
    assert.strictEqual(
      math.simplify('sin(pi * x)', ['sin(pi * n) -> 0']).toString(),
      '0'
    )
    assert.strictEqual(math.simplify('i', ['i -> 1']).toString(), '1')
    assert.strictEqual(
      math.simplify('Infinity', ['Infinity -> 1']).toString(),
      '1'
    )
    assert.strictEqual(math.simplify('LN2', ['LN2 -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('LN10', ['LN10 -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('LOG2E', ['LOG2E -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('LOG10E', ['LOG10E -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('null', ['null -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('phi', ['phi -> 1']).toString(), '1')
    assert.strictEqual(
      math.simplify('SQRT1_2', ['SQRT1_2 -> 1']).toString(),
      '1'
    )
    assert.strictEqual(math.simplify('SQRT2', ['SQRT2 -> 1']).toString(), '1')
    assert.strictEqual(math.simplify('tau', ['tau -> 1']).toString(), '1')

    // note that NaN is a special case, we can't compare two values both NaN.
  })

<<<<<<< HEAD
  it('should remove addition of 0', function () {
=======
  it('should remove addition of 0', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('x+0', 'x')
    simplifyAndCompare('x-0', 'x')
  })

<<<<<<< HEAD
  it('should remove + before -', function () {
=======
  it('should remove + before -', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      math.simplify('y + (-x*b) + a * -5').toString(),
      'y - 5 * a - x * b'
    )
    assert.strictEqual(
      math.simplify('+3y + (-2z) + x * (-3)').toString(),
      '3 y - 3 * x - 2 * z'
    )
  })

<<<<<<< HEAD
  it('options parameters', function () {
=======
  it('options parameters', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompare('0.1*x', 'x/10')
    simplifyAndCompare(
      '0.1*x',
      'x/10',
      math.simplify.rules,
      {},
      { exactFractions: true }
    )
    simplifyAndCompare(
      '0.1*x',
      '0.1*x',
      math.simplify.rules,
      {},
      { exactFractions: false }
    )
    simplifyAndCompare('y+0.1*x', 'x/10+1', { y: 1 })
    simplifyAndCompare('y+0.1*x', 'x/10+1', { y: 1 }, { exactFractions: true })
    simplifyAndCompare(
      'y+0.1*x',
      '0.1*x+1',
      { y: 1 },
      { exactFractions: false }
    )

    simplifyAndCompare(
      '0.00125',
      '1 / 800',
      math.simplify.rules,
      {},
      { exactFractions: true }
    )
    simplifyAndCompare(
      '0.00125',
      '0.00125',
      math.simplify.rules,
      {},
      { exactFractions: true, fractionsLimit: 100 }
    )
    simplifyAndCompare(
      '0.4',
      '2 / 5',
      math.simplify.rules,
      {},
      { exactFractions: true, fractionsLimit: 100 }
    )
    simplifyAndCompare(
      '100.8',
      '504 / 5',
      math.simplify.rules,
      {},
      { exactFractions: true }
    )
    simplifyAndCompare(
      '100.8',
      '100.8',
      math.simplify.rules,
      {},
      { exactFractions: true, fractionsLimit: 100 }
    )
  })

<<<<<<< HEAD
  describe('should respect context changes to operator properties', function () {
    const optsNCM = { context: { multiply: { commutative: false } } }
    const optsNCA = { context: { add: { commutative: false } } }

    it('should not apply typically applicable rules (for non-commutative contexts)', function () {
=======
  describe('should respect context changes to operator properties', function (): void {
    const optsNCM = { context: { multiply: { commutative: false } } }
    const optsNCA = { context: { add: { commutative: false } } }

    it('should not apply typically applicable rules (for non-commutative contexts)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // i.e. rule 'n3*n1+n3*n2-> n3*(n1+n2)' cannot apply (in this context operands cannot be rearranged)
      simplifyAndCompare('x*y+y*x', 'x*y+y*x', {}, optsNCM)
      // i.e. initial temporary/re-arrangement rules 'n-n1->n+-n1','-v->v*-1' do not apply -
      // resulting in this expr. not being simplified to '0'
      simplifyAndCompare('x*y-y*x', 'x*y-y*x', {}, optsNCM)
      // Constants not shifted to left..
      simplifyAndCompare('x*5', 'x*5', {}, optsNCM)
      // i.e. 'x*x^-1' not permitted to ultimately cancel-out via 'n*n^n1->n^(n1+1)'
      simplifyAndCompare('x*y*x^(-1)', 'x*y*x^(-1)', {}, optsNCM)
      simplifyAndCompare('x*y/x', 'x*y*x^(-1)', {}, optsNCM)
      simplifyAndCompare('x*y*(1/x)', 'x*y*x^(-1)', {}, optsNCM)
      // 'n+n->2*n' & 'n1*n3+n2*n3 -> (n1+n2)*n3' cannot apply for NCA
      simplifyAndCompare('z+2+z', 'z+2+z', {}, optsNCA)
      simplifyAndCompare('2*z+3+2*z', '2*z+3+2*z', {}, optsNCA)
    })

<<<<<<< HEAD
    it('should still validly apply (term factoring and collection) rules', function () {
=======
    it('should still validly apply (term factoring and collection) rules', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // exponent-factorings
      simplifyAndCompare('x*x', 'x^2', {}, optsNCM)
      simplifyAndCompare('x^2*x', 'x^3', {}, optsNCM)
      simplifyAndCompare('x*x^2', 'x^3', {}, optsNCM)
      simplifyAndCompare('x^3*x^2', 'x^5', {}, optsNCM)
      simplifyAndCompare('x^(2y)*x^(3z)', 'x^(2y+3z)', {}, optsNCM)
      // term collection
      simplifyAndCompare('y+y', '2*y', {}, optsNCA)
      simplifyAndCompare('y+2*y', '3*y', {}, optsNCM)
      simplifyAndCompare('2*y+y', '3*y', {}, optsNCM)
      simplifyAndCompare('2*y+4*y', '6*y', {}, optsNCM)

      // other factorings
      const optsNCANCM = {
        context: {
          add: { commutative: false },
          multiply: { commutative: false }
        }
      }
      simplifyAndCompare('4+4*b', '4*(1+b)', {}, optsNCANCM)
      simplifyAndCompare('4*b+4', '4*(b+1)', {}, optsNCANCM)
    })

<<<<<<< HEAD
    it("rules still apply for non-commutative 'multi-arg.' expressions", function () {
=======
    it("rules still apply for non-commutative 'multi-arg.' expressions", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // ('n*n->n^2')
      simplifyAndCompare('n*n*3', 'n^2*3', {}, optsNCM)
      simplifyAndCompare('3*n*n', '3*n^2', {}, optsNCM)
      simplifyAndCompare('3*n*n*3', '3*n^2*3', {}, optsNCM)
      // (the following two also subsequently apply 'n^n1*n->n^(n1+1)')
      simplifyAndCompare('3*n*n*n*3', '3*n^3*3', {}, optsNCM)
      simplifyAndCompare('3*3*n*n*n*3', '9*n^3*3', {}, optsNCM)
      simplifyAndCompare('(w*z)*n*n*3', 'w*z*n^2*3', {}, optsNCM)
      simplifyAndCompare('2*n*n*3*n*n*4', '2*n^2*3*n^2*4', {}, optsNCM) // 'double wedged', +applied >1x
      // ('v*(v*n1+n2) ->  v^2*n1+v*n2')
      simplifyAndCompare('w*x*(x*y+z)', 'w*(x^2*y+x*z)', {}, optsNCM)
      simplifyAndCompare('w*x*(x*y+z)*w', 'w*(x^2*y+x*z)*w', {}, optsNCM)
      //  'n+n -> 2*n'
      simplifyAndCompare('x+x+3', '2*x+3', {}, optsNCA)
      simplifyAndCompare('3+x+x', '3+2*x', {}, optsNCA)
      simplifyAndCompare('4+x+x+4', '4+2*x+4', {}, optsNCA)
      simplifyAndCompare('4+x+x+5+x+x+6', '4+2*x+5+2*x+6', {}, optsNCA) // 'double wedged', +applied >1x
      // 'n+n -> 2*n'  &  'n3*n1 + n3*n2 -> n3*(n1+n2)'
      simplifyAndCompare('5+x+x+x+x+5', '5+4*x+5', {}, optsNCA)
    })

<<<<<<< HEAD
    it('should respect absence of associativity', function () {
=======
    it('should respect absence of associativity', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const optsNAA = { context: { add: { associative: false } } }
      simplifyAndCompare('x + (-x+y)', 'x + (y-x)', {}, optsNAA, {
        parenthesis: 'all'
      })
    })
  })

<<<<<<< HEAD
  it('performs other simplifications in unrelated contexts', function () {
=======
  it('performs other simplifications in unrelated contexts', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const optsNCM = { context: { multiply: { commutative: false } } }
    simplifyAndCompare('x-(y-y+x)', '0', {}, optsNCM)

    const optsNAA = { context: { add: { associative: false } } }
    simplifyAndCompare('3+x', 'x+3', {}, optsNAA)
    simplifyAndCompare('x*y - y*x', '0', {}, optsNAA)
    simplifyAndCompare('x-(y-y+x)', '0', {}, optsNAA)

    const optsNAANCM = {
      context: {
<<<<<<< HEAD
        add: { associative: false },
=======
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply: { commutative: false }
      }
    }
    simplifyAndCompare('x-(y-y+x)', '0', {}, optsNAANCM)
  })

<<<<<<< HEAD
  it('should keep implicit multiplication implicit', function () {
=======
  it('should keep implicit multiplication implicit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const f = math.parse('2x')
    assert.strictEqual(f.toString({ implicit: 'hide' }), '2 x')
    const simplified = math.simplify(f)
    assert.strictEqual(simplified.toString({ implicit: 'hide' }), '2 x')
  })

<<<<<<< HEAD
  it('should offer differentiation for constants of either sign', function () {
=======
  it('should offer differentiation for constants of either sign', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Mostly just an alternative formatting preference
    // Allows for basic constant fractions to be kept separate from a variable expressions
    // see https://github.com/josdejong/mathjs/issues/1406
    const rules = math.simplify.rules.slice()
    const index = rules.findIndex(
      (rule) => (rule.s ? rule.s.split('->')[0].trim() : rule.l) === 'n*(n1/n2)'
    )
    rules.splice(
      index,
      1,
      {
        s: 'cd*(cd1/cd2) -> (cd*cd1)/cd2',
<<<<<<< HEAD
        assuming: { multiply: { associative: true } }
      },
      {
        s: 'n*(n1/vd2) -> (n*n1)/vd2',
        assuming: { multiply: { associative: true } }
      },
      {
        s: 'n*(vd1/n2) -> (n*vd1)/n2',
        assuming: { multiply: { associative: true } }
=======
      },
      {
        s: 'n*(n1/vd2) -> (n*n1)/vd2',
      },
      {
        s: 'n*(vd1/n2) -> (n*vd1)/n2',
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      }
    )
    assert.strictEqual(
      math.simplify('(1 / 2) * a', rules).toString({ parenthesis: 'all' }),
      '(1 / 2) * a'
    )
    assert.strictEqual(
      math.simplify('-(1 / 2) * a', rules).toString({ parenthesis: 'all' }),
      '((-1) / 2) * a'
    )
    assert.strictEqual(
      math.simplify('(1 / 2) * 3', rules).toString({ parenthesis: 'all' }),
      '3 / 2'
    )
    assert.strictEqual(
      math.simplify('(1 / x) * a', rules).toString({ parenthesis: 'all' }),
      'a / x'
    )
    assert.strictEqual(
      math.simplify('-(1 / x) * a', rules).toString({ parenthesis: 'all' }),
      '-(a / x)'
    )
  })

<<<<<<< HEAD
  describe('expression parser', function () {
    it('should evaluate simplify containing string value', function () {
=======
  describe('expression parser', function (): void {
    it('should evaluate simplify containing string value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const res = math.evaluate('simplify("2x + 3x")')
      assert.ok(res && res.isNode)
      assert.strictEqual(res.toString(), '5 * x')
    })

<<<<<<< HEAD
    it('should evaluate simplify containing nodes', function () {
=======
    it('should evaluate simplify containing nodes', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const res = math.evaluate('simplify(parse("2x + 3x"))')
      assert.ok(res && res.isNode)
      assert.strictEqual(res.toString(), '5 * x')
    })

<<<<<<< HEAD
    it('should compute and simplify derivatives', function () {
=======
    it('should compute and simplify derivatives', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const res = math.evaluate('derivative("5x*3x", "x")')
      assert.ok(res && res.isNode)
      assert.strictEqual(res.toString(), '30 * x')
    })

<<<<<<< HEAD
    it('should compute and simplify derivatives (2)', function () {
=======
    it('should compute and simplify derivatives (2)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const scope = {}
      math.evaluate('a = derivative("5x*3x", "x")', scope)
      const res = math.evaluate('simplify(a)', scope)
      assert.ok(res && res.isNode)
      assert.strictEqual(res.toString(), '30 * x')
    })

    // eslint-disable-next-line mocha/no-skipped-tests
<<<<<<< HEAD
    it.skip('should compute and simplify derivatives (3)', function () {
=======
    it.skip('should compute and simplify derivatives (3)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      // TODO: this requires the + operator to support Nodes,
      //       i.e.   math.add(5, math.parse('2')) => return an OperatorNode
      const res = math.evaluate('simplify(5+derivative(5/(3x), x))')
      assert.ok(res && res.isNode)
      assert.strictEqual(res.toString(), '5 - 15 / (3 * x) ^ 2')
    })
  })

<<<<<<< HEAD
  it('should respect log arguments', function () {
=======
  it('should respect log arguments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    simplifyAndCompareEval('log(e)', '1')
    simplifyAndCompareEval('log(e,e)', '1')
    simplifyAndCompareEval('log(3,5)', 'log(3,5)')
    simplifyAndCompareEval('log(e,9)', 'log(e,9)')
  })

<<<<<<< HEAD
  describe('should simplify fraction where denominator has a minus', function () {
    it('unary numerator and unary denominator', function () {
=======
  describe('should simplify fraction where denominator has a minus', function (): void {
    it('unary numerator and unary denominator', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      simplifyAndCompare('1/(-y)', '-(1/y)')
      simplifyAndCompare('x/(-y)', '-(x/y)')
      simplifyAndCompare('(-1)/(-y)', '1/y')
      simplifyAndCompare('(-x)/(-y)', 'x/y')
    })

<<<<<<< HEAD
    it('binary numerator and unary denominator', function () {
=======
    it('binary numerator and unary denominator', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      simplifyAndCompare('(1+x)/(-y)', '-((x+1)/y)')
      simplifyAndCompare('(w+x)/(-y)', '-((w+x)/y)')
      simplifyAndCompare('(1-x)/(-y)', '(x-1)/y')
      simplifyAndCompare('(w-x)/(-y)', '(x-w)/y')
    })

<<<<<<< HEAD
    it('unary numerator and binary denominator', function () {
=======
    it('unary numerator and binary denominator', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      simplifyAndCompare('1/(-(y+z))', '-(1/(y+z))')
      simplifyAndCompare('x/(-(y+z))', '-(x/(y+z))')
      simplifyAndCompare('(-1)/(-(y+z))', '1/(y+z)')
      simplifyAndCompare('(-x)/(-(y+z))', 'x/(y+z)')

      simplifyAndCompare('1/(-(y-z))', '1/(z-y)')
      simplifyAndCompare('x/(-(y-z))', 'x/(z-y)')
      simplifyAndCompare('(-1)/(-(y-z))', '-(1/(z-y))')
      simplifyAndCompare('(-x)/(-(y-z))', '-(x/(z-y))')
    })

<<<<<<< HEAD
    it('binary numerator and binary denominator', function () {
=======
    it('binary numerator and binary denominator', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      simplifyAndCompare('(1+x)/(-(y+z))', '-((x+1)/(y+z))')
      simplifyAndCompare('(w+x)/(-(y+z))', '-((w+x)/(y+z))')
      simplifyAndCompare('(1-x)/(-(y+z))', '(x-1)/(y+z)')
      simplifyAndCompare('(w-x)/(-(y+z))', '(x-w)/(y+z)')

      simplifyAndCompare('(1+x)/(-(y-z))', '(x+1)/(z-y)')
      simplifyAndCompare('(w+x)/(-(y-z))', '(w+x)/(z-y)')
      simplifyAndCompare('(1-x)/(-(y-z))', '(1-x)/(z-y)')
      simplifyAndCompare('(w-x)/(-(y-z))', '(w-x)/(z-y)')
    })
  })

<<<<<<< HEAD
  function assertAlike(a, b) {
=======
  function assertAlike(a: any, b: any): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // OK if both NaN or deepEqual
    if (isNaN(a)) {
      assert(isNaN(b))
    } else {
      assert.deepEqual(a, b)
    }
  }

<<<<<<< HEAD
  it('should preserve values according to context', function () {
=======
  it('should preserve values according to context', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const realContext = { context: math.simplify.realContext }
    const positiveContext = { context: math.simplify.positiveContext }
    simplifyAndCompare('x/x', 'x/x', {}, realContext)
    simplifyAndCompare('x/x', '1', {}, positiveContext)
    simplifyAndCompare('x-x', '0', {}, positiveContext)
    simplifyAndCompare('x-2*x', 'x-2*x', {}, positiveContext)
    simplifyAndCompare('+x+abs(x)', '2*x', {}, positiveContext)

    const id = (x) => x
    const sel = (_x, _y, z, _w) => z
    const zeroes = { x: 0, y: 0, z: 0, w: 0, n: 0, foo: id, myMultiArg: sel }
    const negones = {}
    const ones = {}
    const twos = {}
    for (const vr in zeroes) {
      if (typeof zeroes[vr] === 'number') {
        negones[vr] = -1
        ones[vr] = 1
        twos[vr] = 2
      } else {
        negones[vr] = zeroes[vr]
        ones[vr] = zeroes[vr]
        twos[vr] = zeroes[vr]
      }
    }

    // Simplify actually increases accuracy when it uses fractions, so we
    // disable that to get equality in these tests:
    realContext.exactFractions = false
    positiveContext.exactFractions = false
    for (const textExpr of expLibrary) {
      const expr = math.parse(textExpr)
      const realex = math.simplify(expr, {}, realContext)
      const posex = math.simplify(expr, {}, positiveContext)
      assertAlike(realex.evaluate(zeroes), expr.evaluate(zeroes))
      assertAlike(realex.evaluate(negones), expr.evaluate(negones))
      assertAlike(realex.evaluate(ones), expr.evaluate(ones))
      assertAlike(realex.evaluate(twos), expr.evaluate(twos))
      assertAlike(posex.evaluate(ones), expr.evaluate(ones))
      assertAlike(posex.evaluate(twos), expr.evaluate(twos))
    }
    // Make sure at least something is not equal
    const expr = math.parse('x/x')
    const posex = math.simplify(expr, {}, positiveContext)
    assert(!isNaN(posex.evaluate(zeroes)))
    assert.notEqual(expr.evaluate(zeroes), posex.evaluate(zeroes))
  })
})
