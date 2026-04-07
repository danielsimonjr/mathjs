import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const residue = math.residue

function approxEqual (a, b, tol = 1e-6) {
  return Math.abs(a - b) < tol
}

describe('residue', function () {
  it('should compute residues of 1/((s-1)(s-2))', function () {
    // 1/(s^2 - 3s + 2) => poles at s=1, s=2
    // residue at s=1: 1/(1-2) = -1
    // residue at s=2: 1/(2-1) = 1
    const result = residue([1], [1, -3, 2])
    assert.strictEqual(result.poles.length, 2)
    assert.strictEqual(result.residues.length, 2)

    const pairs = result.poles.map((p, i) => ({ p, r: result.residues[i] }))
    pairs.sort((a, b) => a.p - b.p)

    assert(approxEqual(pairs[0].p, 1))
    assert(approxEqual(pairs[1].p, 2))
    assert(approxEqual(pairs[0].r, -1))
    assert(approxEqual(pairs[1].r, 1))
  })

  it('should compute residues of 1/(s^2 - 1)', function () {
    // poles at s=1 (residue=0.5) and s=-1 (residue=-0.5)
    const result = residue([1], [1, 0, -1])
    assert.strictEqual(result.poles.length, 2)

    const pairs = result.poles.map((p, i) => ({ p, r: result.residues[i] }))
    pairs.sort((a, b) => a.p - b.p)

    assert(approxEqual(pairs[0].p, -1))
    assert(approxEqual(pairs[1].p, 1))
    assert(approxEqual(pairs[0].r, -0.5))
    assert(approxEqual(pairs[1].r, 0.5))
  })

  it('should compute residues for a first-order denominator', function () {
    // 1/(s - 3) => pole at 3, residue = 1
    const result = residue([1], [1, -3])
    assert.strictEqual(result.poles.length, 1)
    assert(approxEqual(result.poles[0], 3))
    assert(approxEqual(result.residues[0], 1))
  })

  it('should return an object with residues and poles arrays', function () {
    const result = residue([1], [1, -3, 2])
    assert(Array.isArray(result.residues))
    assert(Array.isArray(result.poles))
  })

  it('should handle numerator with degree 1', function () {
    // (2s + 1) / (s^2 - 3s + 2)
    const result = residue([2, 1], [1, -3, 2])
    assert.strictEqual(result.poles.length, 2)

    const pairs = result.poles.map((p, i) => ({ p, r: result.residues[i] }))
    pairs.sort((a, b) => a.p - b.p)

    // At s=1: (2+1)/(1-2) = 3/(-1) = -3
    // At s=2: (4+1)/(2-1) = 5/1 = 5
    assert(approxEqual(pairs[0].p, 1))
    assert(approxEqual(pairs[1].p, 2))
    assert(approxEqual(pairs[0].r, -3))
    assert(approxEqual(pairs[1].r, 5))
  })
})
