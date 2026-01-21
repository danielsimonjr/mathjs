/**
 * Test for Range - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'
const Range = math.Range

describe('range', function (): void {
  describe('create', function (): void {
    it('should create a range', function (): void {
      const r = new Range(2, 6)
      assert.deepStrictEqual(r.toArray(), [2, 3, 4, 5])
      assert.deepStrictEqual(r.size(), [4])
    })

    it('should create a range with custom step', function (): void {
      const r = new Range(10, 4, -1)
      assert.deepStrictEqual(r.toArray(), [10, 9, 8, 7, 6, 5])
      assert.deepStrictEqual(r.size(), [6])
    })

    it('should create a range with floating points', function (): void {
      const r = new Range(1, 5.5, 1.5)
      assert.deepStrictEqual(r.toArray(), [1, 2.5, 4])
      assert.deepStrictEqual(r.size(), [3])
    })

    it('should create an empty range', function (): void {
      const r = new Range()
      assert.deepStrictEqual(r.toArray(), [])
    })

    it('should create a range with only one value', function (): void {
      const r = new Range(0, 1)
      assert.deepStrictEqual(r.toArray(), [0])
      assert.deepStrictEqual(r.size(), [1])
    })

    it('should create an empty range because of wrong step size', function (): void {
      const r = new Range(0, 10, -1)
      assert.deepStrictEqual(r.toArray(), [])
      assert.deepStrictEqual(r.size(), [0])
    })

    it('should throw an error when created without new keyword', function (): void {
      assert.throws(function (): void {
        Range(0, 10)
      }, /Constructor must be called with the new operator/)
    })

    it('should throw an error for wrong type of arguments', function (): void {
      assert.throws(function (): void {
        console.log(new Range('str', 10, 1))
      }, /Parameter start must be a number/)
      assert.throws(function (): void {
        console.log(new Range(0, 'str', 1))
      }, /Parameter end must be a number/)
      assert.throws(function (): void {
        console.log(new Range(0, 10, 'str'))
      }, /Parameter step must be a number/)
    })

    it('should throw an error for step size zero', function (): void {
      assert.throws(function (): void {
        console.log(new Range(0, 0, 0))
      }, /Step must not be zero/)
      assert.throws(function (): void {
        console.log(new Range(10, 10, 0))
      }, /Step must not be zero/)
      assert.throws(function (): void {
        console.log(new Range(0, 10, math.bignumber(0)))
      }, /Step must not be zero/)
      assert.throws(function (): void {
        console.log(new Range(0, 10, math.bigint(0)))
      }, /Step must not be zero/)
    })
  })

  describe('parse', function (): void {
    it('should create a range from a string', function (): void {
      let r = Range.parse('10:-1:4')
      assert.deepStrictEqual(r.toArray(), [10, 9, 8, 7, 6, 5])
      assert.deepStrictEqual(r.size(), [6])

      r = Range.parse('2 : 6')
      assert.deepStrictEqual(r.toArray(), [2, 3, 4, 5])
      assert.deepStrictEqual(r.size(), [4])
    })

    it('should return null when parsing an invalid string', function (): void {
      assert.strictEqual(Range.parse('a:4'), null)
      assert.strictEqual(Range.parse('3'), null)
      assert.strictEqual(Range.parse(''), null)
      assert.strictEqual(Range.parse(2), null)
    })
  })

  describe('size', function (): void {
    it('should calculate the size of a range', function (): void {
      assert.deepStrictEqual(new Range(0, 0).size(), [0])
      assert.deepStrictEqual(new Range(0, 0, -1).size(), [0])
      assert.deepStrictEqual(new Range(0, 4).size(), [4])
      assert.deepStrictEqual(new Range(2, 4).size(), [2])
      assert.deepStrictEqual(new Range(0, 8, 2).size(), [4])
      assert.deepStrictEqual(new Range(0, 8.1, 2).size(), [5])
      assert.deepStrictEqual(new Range(0, 7.9, 2).size(), [4])
      assert.deepStrictEqual(new Range(0, 7, 2).size(), [4])

      assert.deepStrictEqual(new Range(3, -1, -1).size(), [4])
      assert.deepStrictEqual(new Range(3, -1.1, -1).size(), [5])
      assert.deepStrictEqual(new Range(3, -0.9, -1).size(), [4])
      assert.deepStrictEqual(new Range(3, -1, -2).size(), [2])
      assert.deepStrictEqual(new Range(3, -0.9, -2).size(), [2])
      assert.deepStrictEqual(new Range(3, -1.1, -2).size(), [3])
      assert.deepStrictEqual(new Range(3, 0.1, -2).size(), [2])
    })
  })

  describe('min', function (): void {
    it('should calculate the minimum value of a range', function (): void {
      assert.strictEqual(new Range(0, 0).min(), undefined)
      assert.strictEqual(new Range(0, 0, -1).min(), undefined)

      assert.strictEqual(new Range(0, 4).min(), 0)
      assert.strictEqual(new Range(2, 4).min(), 2)
      assert.strictEqual(new Range(0, 8, 2).min(), 0)
      assert.strictEqual(new Range(0, 8.1, 2).min(), 0)
      assert.strictEqual(new Range(0, 7.9, 2).min(), 0)
      assert.strictEqual(new Range(0, 7, 2).min(), 0)

      assert.strictEqual(new Range(3, -1, -1).min(), 0)
      assert.strictEqual(new Range(3, -1.1, -1).min(), -1)
      assert.strictEqual(new Range(3, -0.9, -1).min(), 0)
      assert.strictEqual(new Range(3, -1, -2).min(), 1)
      assert.strictEqual(new Range(3, -0.9, -2).min(), 1)
      assert.strictEqual(new Range(3, -1.1, -2).min(), -1)
      assert.strictEqual(new Range(3, 0.1, -2).min(), 1)
    })
  })

  describe('max', function (): void {
    it('should calculate the maximum value of a range', function (): void {
      assert.strictEqual(new Range(0, 0).max(), undefined)
      assert.strictEqual(new Range(0, 0, -1).max(), undefined)

      assert.strictEqual(new Range(2, 4).max(), 3)
      assert.strictEqual(new Range(0, 8, 2).max(), 6)
      assert.strictEqual(new Range(0, 8.1, 2).max(), 8)
      assert.strictEqual(new Range(0, 7.9, 2).max(), 6)
      assert.strictEqual(new Range(0, 7, 2).max(), 6)

      assert.strictEqual(new Range(3, -1, -1).max(), 3)
      assert.strictEqual(new Range(3, -1.1, -1).max(), 3)
      assert.strictEqual(new Range(3, -0.9, -1).max(), 3)
      assert.strictEqual(new Range(3, -1, -2).max(), 3)
      assert.strictEqual(new Range(3, -0.9, -2).max(), 3)
      assert.strictEqual(new Range(3, -1.1, -2).max(), 3)
      assert.strictEqual(new Range(3, 0.1, -2).max(), 3)
    })
  })

  describe('toString', function (): void {
    it('should stringify a range to format start:step:end', function (): void {
      assert.strictEqual(new math.Range(0, 10).toString(), '0:10')
      assert.strictEqual(new math.Range(0, 10, 2).toString(), '0:2:10')
    })

    it('should stringify a range to format start:step:end with given precision', function (): void {
      assert.strictEqual(
        new math.Range(1 / 3, 4 / 3, 2 / 3).format(3),
        '0.333:0.667:1.33'
      )
      assert.strictEqual(
        new math.Range(1 / 3, 4 / 3, 2 / 3).format(4),
        '0.3333:0.6667:1.333'
      )
      assert.strictEqual(
        new math.Range(1 / 3, 4 / 3, 2 / 3).format(14),
        '0.33333333333333:0.66666666666667:1.3333333333333'
      )
    })
  })

  describe('clone', function (): void {
    it('should clone a Range', function (): void {
      const r1 = new Range(0, 10, 2)
      const r2 = r1.clone()

      assert.deepStrictEqual(r1, r2)
      assert.notStrictEqual(r1, r2)

      // changes in r1 should not affect r2
      r1.start = 2
      r1.end = 8
      r1.step = 1

      assert.strictEqual(r1.start, 2)
      assert.strictEqual(r1.end, 8)
      assert.strictEqual(r1.step, 1)
      assert.strictEqual(r2.start, 0)
      assert.strictEqual(r2.end, 10)
      assert.strictEqual(r2.step, 2)
    })
  })

  describe('type', function (): void {
    it('should have a property isRange', function (): void {
      const a = new math.Range(0, 10)
      assert.strictEqual(a.isRange, true)
    })

    it('should have a property type', function (): void {
      const a = new math.Range(0, 10)
      assert.strictEqual(a.type, 'Range')
    })
  })

  describe('map', function (): void {
    it('should perform a transformation on all values in the range', function (): void {
      const r = new Range(2, 6)
      assert.deepStrictEqual(
        r.map(function (value, index, range) {
          assert.strictEqual(range, r)
          return 'range[' + index[0] + ']=' + value
        }),
        ['range[0]=2', 'range[1]=3', 'range[2]=4', 'range[3]=5']
      )
    })
  })

  describe('forEach', function (): void {
    it('should perform a given callback on all values in the range', function (): void {
      const r = new Range(2, 6)
      const log = []
      r.forEach(function (value, index, range) {
        assert.strictEqual(range, r)
        log.push('range[' + index[0] + ']=' + value)
      })

      assert.deepStrictEqual(log, [
        'range[0]=2',
        'range[1]=3',
        'range[2]=4',
        'range[3]=5'
      ])
    })
  })

  describe('format', function (): void {
    it('should format a range as string', function (): void {
      assert.strictEqual(new Range(0, 4).format(), '0:4')
      assert.strictEqual(new Range(0, 4, 2).format(), '0:2:4')

      assert.strictEqual(new Range(0.01, 0.09, 0.02).format(), '0.01:0.02:0.09')

      assert.strictEqual(
        new Range(0.01, 0.09, 0.02).format({
          notation: 'exponential'
        }),
        '1e-2:2e-2:9e-2'
      )
    })
  })

  describe('toArray', function (): void {
    it('should expand a Range into an Array', function (): void {
      assert.deepStrictEqual(new Range(0, 4).toArray(), [0, 1, 2, 3])
      assert.deepStrictEqual(new Range(4, 0, -1).toArray(), [4, 3, 2, 1])
    })
  })

  describe('valueOf', function (): void {
    it('valueOf should return the Range expanded as Array', function (): void {
      assert.deepStrictEqual(new Range(0, 4).valueOf(), [0, 1, 2, 3])
      assert.deepStrictEqual(new Range(4, 0, -1).valueOf(), [4, 3, 2, 1])
    })
  })

  it('toJSON', function (): void {
    assert.deepStrictEqual(new Range(2, 4).toJSON(), {
      mathjs: 'Range',
      start: 2,
      end: 4,
      step: 1
    })
    assert.deepStrictEqual(new Range(0, 10, 2).toJSON(), {
      mathjs: 'Range',
      start: 0,
      end: 10,
      step: 2
    })
  })

  it('fromJSON', function (): void {
    const r1 = Range.fromJSON({ start: 2, end: 4 })
    assert.ok(r1 instanceof Range)
    assert.strictEqual(r1.start, 2)
    assert.strictEqual(r1.end, 4)
    assert.strictEqual(r1.step, 1)

    const r2 = Range.fromJSON({ start: 0, end: 10, step: 2 })
    assert.ok(r2 instanceof Range)
    assert.strictEqual(r2.start, 0)
    assert.strictEqual(r2.end, 10)
    assert.strictEqual(r2.step, 2)
  })
})
