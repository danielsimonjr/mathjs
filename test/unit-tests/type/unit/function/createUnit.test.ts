// @ts-nocheck
import assert from 'assert'
import math from '../../../../../src/defaultInstance.js'

// Use unique suffix to avoid conflicts when running both JS and TS tests
const suffix = 'Ts' + Date.now()

describe('createUnit', function () {
  // Use isolated math instance to avoid polluting global state for JS tests
  const math2 = math.create()
  const createUnit = math2.createUnit

  it('should create a unit', function () {
    createUnit('flibbity' + suffix, '4 hogshead')
    assert.strictEqual(
      math2.evaluate(`2 flibbity${suffix} to hogshead`).toString(),
      '8 hogshead'
    )
  })

  it('should accept a unit as second parameter', function () {
    assert.strictEqual(
      math2
        .evaluate(`50 in^2 to createUnit("bingo${suffix}", 25 in^2)`)
        .toString(),
      `2 bingo${suffix}`
    )
  })

  it('should accept a string as second parameter', function () {
    assert.strictEqual(
      math2
        .evaluate(`50 in^2 to createUnit("zingo${suffix}", "25 in^2")`)
        .toString(),
      `2 zingo${suffix}`
    )
  })

  it('should return the created unit', function () {
    assert.strictEqual(
      math2
        .evaluate(`createUnit("giblet${suffix}", "6 flibbity${suffix}")`)
        .toString(),
      `giblet${suffix}`
    )
    assert.strictEqual(
      math2
        .evaluate(
          `120 hogshead to createUnit("fliblet${suffix}", "0.25 giblet${suffix}")`
        )
        .format(4),
      `20 fliblet${suffix}`
    )
  })

  it('should accept options', function () {
    math2.evaluate(
      `createUnit("whosit${suffix}", { definition: 3.14 kN, prefixes:"long"})`
    )
    assert.strictEqual(
      math2.evaluate(`1e-9 whosit${suffix}`).toString(),
      `1 nanowhosit${suffix}`
    )

    math2.evaluate(
      `createUnit("wheresit${suffix}", { definition: 3.14 kN, offset:2})`
    )
    assert.strictEqual(
      math2.evaluate(`1 wheresit${suffix} to kN`).toString(),
      '9.42 kN'
    )
  })

  it('should create multiple units', function () {
    math2.evaluate(
      `createUnit({"xfoo${suffix}":{}, "xbar${suffix}":{}, "xfoobar${suffix}":"1 xfoo${suffix} xbar${suffix}"})`
    )
    assert.strictEqual(
      math2.evaluate(`5 xfoo${suffix}`).toString(),
      `5 xfoo${suffix}`
    )
  })

  it('should simplify created units', function () {
    // TODO: New units do not have base units set, therefore simplifying is impossible. Figure out a way to create base units for created units.
    assert.strictEqual(
      math2.evaluate(`5 xfoo${suffix} * 5 xbar${suffix}`).toString(),
      `25 xfoobar${suffix}`
    )
  })

  it('should override units', function () {
    const math3 = math.create()
    math3.evaluate('createUnit({"bar": 1e12 Pa}, {"override":true})')
    assert.strictEqual(math3.evaluate('1 bar to Pa').toString(), '1e+12 Pa')
  })
})
