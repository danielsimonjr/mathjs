<<<<<<< HEAD
// @ts-nocheck
// test parser

=======
/**
 * Test for Parser - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { approxEqual } from '../../../tools/approx.js'
import math from '../../../src/defaultInstance.ts'
const Parser = math.Parser

<<<<<<< HEAD
describe('parser', function () {
  it('should create a parser', function () {
=======
describe('parser', function (): void {
  it('should create a parser', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()
    assert.ok(parser instanceof Parser)
  })

<<<<<<< HEAD
  it('should have a property isParser', function () {
=======
  it('should have a property isParser', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new Parser()
    assert.strictEqual(a.isParser, true)
  })

<<<<<<< HEAD
  it('should have a property type', function () {
=======
  it('should have a property type', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new Parser()
    assert.strictEqual(a.type, 'Parser')
  })

<<<<<<< HEAD
  it('should evaluate an expression', function () {
=======
  it('should evaluate an expression', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    const result = parser.evaluate('2 + 3')
    assert.strictEqual(result, 5)
  })

<<<<<<< HEAD
  it('should evaluate a list with expressions', function () {
=======
  it('should evaluate a list with expressions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    const result = parser.evaluate(['a = 2', 'a + 3'])
    assert.deepStrictEqual(result, [2, 5])
  })

<<<<<<< HEAD
  it('should get variables from the parsers namespace ', function () {
=======
  it('should get variables from the parsers namespace ', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    parser.evaluate('a = 3')
    parser.evaluate('b = a + 2')
    assert.strictEqual(parser.evaluate('a'), 3)
    assert.strictEqual(parser.evaluate('b'), 5)
    assert.strictEqual(parser.get('a'), 3)
    assert.strictEqual(parser.get('b'), 5)
  })

<<<<<<< HEAD
  it('should get all variables from the parsers namespace ', function () {
=======
  it('should get all variables from the parsers namespace ', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    parser.evaluate('a = 3')
    parser.evaluate('b = a + 2')
    assert.deepStrictEqual(parser.getAll(), { a: 3, b: 5 })

    parser.remove('a')
    assert.deepStrictEqual(parser.getAll(), { b: 5 })
  })

<<<<<<< HEAD
  it('should return undefined when getting a non existing variable', function () {
=======
  it('should return undefined when getting a non existing variable', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    assert.strictEqual(parser.get('non_existing_variable'), undefined)
  })

<<<<<<< HEAD
  it('should set variables in the parsers namespace ', function () {
=======
  it('should set variables in the parsers namespace ', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    assert.strictEqual(parser.set('a', 3), 3)
    assert.strictEqual(parser.evaluate('a'), 3)
    assert.strictEqual(parser.evaluate('a + 2'), 5)

    // adjust variable
    assert.strictEqual(parser.evaluate('a = a + 2'), 5)
    assert.strictEqual(parser.evaluate('a'), 5)
    assert.strictEqual(parser.get('a'), 5)

    assert.strictEqual(parser.set('a', parser.get('a') - 4), 1)
    assert.strictEqual(parser.evaluate('a'), 1)
  })

<<<<<<< HEAD
  it('should remove a variable from the parsers namespace ', function () {
=======
  it('should remove a variable from the parsers namespace ', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    assert.strictEqual(parser.set('qq', 3), 3)
    assert.strictEqual(parser.evaluate('qq'), 3)
    assert.strictEqual(parser.get('qq'), 3)

    parser.remove('qq')
    assert.strictEqual(parser.get('qq'), undefined)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      parser.evaluate('qq')
    })

    assert.strictEqual(parser.evaluate('ww = 5'), 5)
    assert.strictEqual(parser.get('ww'), 5)
    parser.remove('ww')
    assert.strictEqual(parser.get('ww'), undefined)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      parser.evaluate('ww')
    })
  })

<<<<<<< HEAD
  it('should clear the parsers namespace ', function () {
=======
  it('should clear the parsers namespace ', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    assert.strictEqual(parser.evaluate('xx = yy = zz = 5'), 5)

    assert.strictEqual(parser.set('pi', 'oops'), 'oops')

    assert.strictEqual(parser.get('xx'), 5)
    assert.strictEqual(parser.get('yy'), 5)
    assert.strictEqual(parser.get('zz'), 5)
    assert.strictEqual(parser.get('pi'), 'oops')

    assert.strictEqual(parser.evaluate('xx'), 5)
    assert.strictEqual(parser.evaluate('yy'), 5)
    assert.strictEqual(parser.evaluate('zz'), 5)
    assert.strictEqual(parser.evaluate('pi'), 'oops')

    parser.clear()

    assert.strictEqual(parser.get('xx'), undefined)
    assert.strictEqual(parser.get('yy'), undefined)
    assert.strictEqual(parser.get('zz'), undefined)
    approxEqual(parser.get('pi'), undefined)

<<<<<<< HEAD
    assert.throws(function () {
      parser.evaluate('xx')
    })
    assert.throws(function () {
      parser.evaluate('yy')
    })
    assert.throws(function () {
=======
    assert.throws(function (): void {
      parser.evaluate('xx')
    })
    assert.throws(function (): void {
      parser.evaluate('yy')
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      parser.evaluate('zz')
    })
    assert.strictEqual(parser.evaluate('pi'), Math.PI)
  })

<<<<<<< HEAD
  it('should validate variable names', function () {
=======
  it('should validate variable names', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const parser = new Parser()

    // Valid variable names
    assert.strictEqual(parser.set('validVar', 42), 42)
    assert.strictEqual(parser.evaluate('validVar'), 42)
    assert.strictEqual(parser.set('_underscoreVar', 10), 10)
    assert.strictEqual(parser.evaluate('_underscoreVar'), 10)
    assert.strictEqual(parser.set('var123', 100), 100)
    assert.strictEqual(parser.evaluate('var123'), 100)

    // Invalid variable names
    assert.throws(() => parser.set('123var', 5), /Invalid variable name/)
    assert.throws(
      () => parser.set('var-with-hyphen', 5),
      /Invalid variable name/
    )
    assert.throws(
      () => parser.set('var with space', 5),
      /Invalid variable name/
    )
    assert.throws(() => parser.set('@specialChar', 5), /Invalid variable name/)
  })

<<<<<<< HEAD
  describe('security', function () {
    it('should return undefined when accessing what appears to be inherited properties', function () {
=======
  describe('security', function (): void {
    it('should return undefined when accessing what appears to be inherited properties', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      try {
        const parser = new Parser()

        Object.prototype.foo = 'bar' // eslint-disable-line no-extend-native

        parser.clear()
        assert.strictEqual(parser.get('foo'), undefined)
        // No longer uses a Object scope, so this now works!
        // assert.throws(function () { parser.get('foo') }, /No access/)
      } finally {
        delete Object.prototype.foo
      }
    })

<<<<<<< HEAD
    it('should throw an error when assigning an inherited property', function () {
=======
    it('should throw an error when assigning an inherited property', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      try {
        const parser = new Parser()
        // We can safely set within the parser
        assert.strictEqual(parser.set('toString', null), null)
        // But getting it out via getAll() will throw.
<<<<<<< HEAD
        assert.throws(function () {
=======
        assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
          parser.getAll()
        }, /No access/)
      } finally {
        delete Object.prototype.foo
      }
    })
  })

<<<<<<< HEAD
  it('should throw an exception when creating a parser without new', function () {
    assert.throws(function () {
=======
  it('should throw an exception when creating a parser without new', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      Parser()
    }, /Constructor must be called with the new operator/)
  })
})
