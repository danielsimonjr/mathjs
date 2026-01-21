/**
 * Test for filter - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

describe('filter', function (): void {
  it('should filter an array with a filter function', function (): void {
    function isPositive(x) {
      return x > 0
    }
    assert.deepStrictEqual(
      math.filter([6, -2, -1, 4, 3], isPositive),
      [6, 4, 3]
    )
  })

  it('should filter a Matrix with a filter function', function (): void {
    function isPositive(x) {
      return x > 0
    }
    assert.deepStrictEqual(
      math.filter(math.matrix([6, -2, -1, 4, 3]), isPositive),
      math.matrix([6, 4, 3])
    )
  })

  it('should invoke callback with parameters value, index, obj', function (): void {
    const arr = [1, 2, 3]
    const log = []

    math
      .filter(arr, function (value, index, obj) {
        log.push([value, index, obj === arr])
        return true
      })
      .valueOf()

    assert.deepStrictEqual(log, [
      [1, [0], true],
      [2, [1], true],
      [3, [2], true]
    ])
  })

  it('should invoke a typed function with correct number of arguments (1)', function (): void {
    const output = []
    math.filter(
      [1, 2, 3],
      math.typed('callback', {
        number: function (value) {
          output.push(value + 2)
        }
      })
    )
    assert.deepStrictEqual(output, [3, 4, 5])
  })

  it('should invoke a typed function with correct number of arguments (2)', function (): void {
    const output = []
    math.filter(
      [1, 2, 3],
      math.typed('callback', {
        'number, Array': function (value, _index) {
          output.push(value + 2)
        }
      })
    )
    assert.deepStrictEqual(output, [3, 4, 5])
  })

  it('should invoke a typed function with correct number of arguments (3)', function (): void {
    const output = []
    math.filter(
      [1, 2, 3],
      math.typed('callback', {
        'number, Array, Array': function (value, _index, _array) {
          output.push(value + 2)
        }
      })
    )
    assert.deepStrictEqual(output, [3, 4, 5])
  })

  it('should filter an array with a regexp', function (): void {
    assert.deepStrictEqual(
      math.filter(['23', 'foo', '100', '55', 'bar'], /[0-9]+/),
      ['23', '100', '55']
    )
  })

  it('should filter a Matrix with a regexp', function (): void {
    assert.deepStrictEqual(
      math.filter(math.matrix(['23', 'foo', '100', '55', 'bar']), /[0-9]+/),
      math.matrix(['23', '100', '55'])
    )
  })

  it('should return an empty array when called with an empty array and a typed callback', function (): void {
    assert.deepStrictEqual(math.filter([], math.square), [])
  })

  it('should return an empty matrix when called with an empty matrix and a typed callback', function (): void {
    assert.deepStrictEqual(
      math.filter(math.matrix([]), math.square),
      math.matrix([])
    )
  })

  it('should throw an error if called with a multi dimensional matrix', function (): void {
    function isPositive(x) {
      return x > 0
    }
    assert.throws(function (): void {
      math.filter(
        math.matrix([
          [6, -2],
          [-1, 4]
        ]),
        isPositive
      )
    }, /Only one dimensional matrices supported/)
  })

  it('should throw an error if called with unsupported type', function (): void {
    assert.throws(function (): void {
      math.filter(2, /regexp/)
    })
    assert.throws(function (): void {
      math.filter('string', /regexp/)
    })
    assert.throws(function (): void {
      math.filter([], 'string')
    })
    assert.throws(function (): void {
      math.filter([], {})
    })
  })

  it('should throw an error if called with invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.filter([], /reg/, 'foo')
    })
    assert.throws(function (): void {
      math.filter([])
    })
  })

  it('should LaTeX filter', function (): void {
    const expression = math.parse('filter(1,test)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{filter}\\left(1, test\\right)'
    )
  })
})
