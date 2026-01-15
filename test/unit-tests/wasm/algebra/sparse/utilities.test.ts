import assert from 'assert'
import {
  csFlip,
  csUnflip
  // Functions using AssemblyScript's `unchecked` built-in must be tested via compiled WASM:
  // csMarked, csMark, csCumsum, csPermute, csLeaf, csEtree, csDfs, csSpsolve
} from '../../../../../src/wasm/algebra/sparse/utilities.ts'

describe('wasm/algebra/sparse/utilities', function () {
  describe('csFlip', function () {
    it('should flip 0 to -2', function () {
      assert.strictEqual(csFlip(0), -2)
    })

    it('should flip 1 to -3', function () {
      assert.strictEqual(csFlip(1), -3)
    })

    it('should flip -1 to -1', function () {
      assert.strictEqual(csFlip(-1), -1)
    })

    it('should flip positive values', function () {
      assert.strictEqual(csFlip(5), -7)
      assert.strictEqual(csFlip(10), -12)
    })

    it('should flip negative values', function () {
      assert.strictEqual(csFlip(-5), 3)
      assert.strictEqual(csFlip(-10), 8)
    })
  })

  describe('csUnflip', function () {
    it('should unflip -2 to 0', function () {
      assert.strictEqual(Object.is(csUnflip(-2), 0) || csUnflip(-2) === 0, true)
    })

    it('should unflip -3 to 1', function () {
      assert.strictEqual(csUnflip(-3), 1)
    })

    it('should leave positive values unchanged', function () {
      assert.strictEqual(csUnflip(0), 0)
      assert.strictEqual(csUnflip(1), 1)
      assert.strictEqual(csUnflip(5), 5)
    })

    it('should unflip -7 to 5', function () {
      assert.strictEqual(csUnflip(-7), 5)
    })

    it('should be inverse of csFlip for non-negative values', function () {
      for (let i = 1; i < 20; i++) {
        // Start from 1 to avoid -0 issue
        assert.strictEqual(csUnflip(csFlip(i)), i)
      }
      // Special case for 0
      assert(csUnflip(csFlip(0)) === 0 || Object.is(csUnflip(csFlip(0)), -0))
    })
  })

  describe('csFlip and csUnflip relationship', function () {
    it('csFlip(csUnflip(x)) should be identity for negative x', function () {
      for (let i = -20; i < 0; i++) {
        const unflipped = csUnflip(i)
        const reflipped = csFlip(unflipped)
        assert.strictEqual(reflipped, i)
      }
    })

    it('csFlip always produces negative output for non-negative input', function () {
      for (let i = 0; i < 100; i++) {
        assert(csFlip(i) < 0)
      }
    })

    it('csUnflip(csFlip(i)) === i for non-negative i', function () {
      for (let i = 1; i < 100; i++) {
        // Start from 1 to avoid -0 issue
        assert.strictEqual(csUnflip(csFlip(i)), i)
      }
      // Special case for 0: result may be -0 which equals 0
      const result = csUnflip(csFlip(0))
      assert(result === 0)
    })
  })

  // Note: csMarked, csMark, csCumsum, csPermute, csLeaf, csEtree, csDfs, csSpsolve
  // use AssemblyScript's `unchecked` built-in and must be tested via compiled WASM modules.
})
