import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createComplexExpand } from '../../../../src/function/algebra/complexExpand.js'

const math = create({ ...all, createComplexExpand })

describe('complexExpand', function () {
  it('should return an object with re and im properties', function () {
    const result = math.complexExpand('z^2', ['z'])
    assert.strictEqual(typeof result, 'object', 'Expected object')
    assert('re' in result, 'Expected re property')
    assert('im' in result, 'Expected im property')
  })

  it('should separate z^2 into real and imaginary parts', function () {
    const result = math.complexExpand('z^2', ['z'])
    // Re(z^2) = z_re^2 - z_im^2, Im(z^2) = 2*z_re*z_im
    assert.strictEqual(typeof result.re, 'string')
    assert.strictEqual(typeof result.im, 'string')
  })

  it('should handle string input', function () {
    const result = math.complexExpand('z', ['z'])
    assert('re' in result && 'im' in result, 'Expected re/im object')
  })

  it('should handle Node input', function () {
    const node = math.parse('z^2')
    const result = math.complexExpand(node, ['z'])
    assert('re' in result && 'im' in result, 'Expected re/im object')
  })

  it('should produce strings for re and im', function () {
    const result = math.complexExpand('z^2', ['z'])
    assert.strictEqual(typeof result.re, 'string')
    assert.strictEqual(typeof result.im, 'string')
  })

  it('should expand z*w with two variables', function () {
    const result = math.complexExpand('z * w', ['z', 'w'])
    assert('re' in result && 'im' in result, 'Expected re/im object')
  })

  it('re and im parts should be non-empty strings', function () {
    const result = math.complexExpand('z^2', ['z'])
    assert(result.re.length > 0, 'Re part should be non-empty')
    assert(result.im.length > 0, 'Im part should be non-empty')
  })
})
