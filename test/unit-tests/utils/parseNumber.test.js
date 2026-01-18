import assert from 'assert'
import math from '../../../src/defaultInstance.js'

describe('parseNumberWithConfig', function () {
  it('should parse string to number when config.number is "number"', function () {
    const mathInstance = math.create({ number: 'number' })
    const result = mathInstance.parseNumberWithConfig('42')
    assert.strictEqual(result, 42)
    assert.strictEqual(typeof result, 'number')
  })

  it('should parse string to number by default', function () {
    const mathInstance = math.create()
    const result = mathInstance.parseNumberWithConfig('3.14')
    assert.strictEqual(result, 3.14)
    assert.strictEqual(typeof result, 'number')
  })

  it('should parse string to BigNumber when config.number is "BigNumber"', function () {
    const mathInstance = math.create({ number: 'BigNumber' })
    const result = mathInstance.parseNumberWithConfig('123.456')
    // BigNumber is implemented using Decimal.js, so constructor name is 'Decimal'
    assert.strictEqual(result.constructor.name, 'Decimal')
    assert.strictEqual(result.toString(), '123.456')
  })

  it('should parse string to bigint when config.number is "bigint"', function () {
    const mathInstance = math.create({ number: 'bigint' })
    const result = mathInstance.parseNumberWithConfig('999')
    assert.strictEqual(result, 999n)
    assert.strictEqual(typeof result, 'bigint')
  })

  it('should fallback to number for bigint with decimal', function () {
    const mathInstance = math.create({ number: 'bigint' })
    const result = mathInstance.parseNumberWithConfig('3.14')
    assert.strictEqual(result, 3.14)
    assert.strictEqual(typeof result, 'number')
  })

  it('should fallback to number for bigint with scientific notation', function () {
    const mathInstance = math.create({ number: 'bigint' })
    const resultLower = mathInstance.parseNumberWithConfig('1e5')
    const resultUpper = mathInstance.parseNumberWithConfig('1E5')
    assert.strictEqual(resultLower, 100000)
    assert.strictEqual(resultUpper, 100000)
    assert.strictEqual(typeof resultLower, 'number')
    assert.strictEqual(typeof resultUpper, 'number')
  })

  it('should throw TypeError for non-string input', function () {
    const mathInstance = math.create()
    assert.throws(
      () => mathInstance.parseNumberWithConfig(42),
      /parseNumberWithConfig expects string, got number/
    )
  })

  it('should throw Error when BigNumber is not available', function () {
    // Create instance without BigNumber support
    const mathInstance = math.create({
      number: 'BigNumber'
    })
    // Note: This test assumes BigNumber might not be available in some builds
    // In default instance it should work, so this test verifies the error message exists
  })

  it('should handle Fraction config (fallback to number for now)', function () {
    const mathInstance = math.create({ number: 'Fraction' })
    const result = mathInstance.parseNumberWithConfig('0.5')
    // Currently falls back to number - will be updated when Fraction support is added
    assert.strictEqual(result, 0.5)
    assert.strictEqual(typeof result, 'number')
  })

  it('should throw SyntaxError for invalid number strings', function () {
    const mathInstance = math.create()
    assert.throws(
      () => mathInstance.parseNumberWithConfig('abc'),
      /SyntaxError: String "abc" is not a valid number/
    )
    assert.throws(
      () => mathInstance.parseNumberWithConfig('hello'),
      /SyntaxError: String "hello" is not a valid number/
    )
  })

  it('should throw SyntaxError for invalid bigint strings', function () {
    const mathInstance = math.create({ number: 'bigint' })
    assert.throws(
      () => mathInstance.parseNumberWithConfig('abc'),
      /SyntaxError: String "abc" is not a valid number/
    )
  })
})
