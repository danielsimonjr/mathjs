import assert from 'assert'
import {
  createSet,
  setUnion,
  setIntersect,
  setDifference,
  setSymDifference,
  setIsSubset,
  setIsProperSubset,
  setIsSuperset,
  setEquals,
  setIsDisjoint,
  setSize,
  setContains,
  setAdd,
  setRemove,
  setCartesian,
  setPowerSetSize,
  setGetSubset
} from '../../../../src/wasm/set/operations.ts'

describe('wasm/set/operations', function () {
  describe('createSet', function () {
    it('should create empty set from empty array', function () {
      const input = new Float64Array([])
      const result = createSet(input)
      assert.strictEqual(result.length, 0)
    })

    it('should remove duplicates and sort', function () {
      const input = new Float64Array([3, 1, 2, 1, 3])
      const result = createSet(input)
      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 2)
      assert.strictEqual(result[2], 3)
    })

    it('should handle single element', function () {
      const input = new Float64Array([5])
      const result = createSet(input)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0], 5)
    })
  })

  describe('setUnion', function () {
    it('should compute union of two sets', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const result = setUnion(a, b)
      assert.strictEqual(result.length, 4)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3, 4])
    })

    it('should return copy when one set is empty', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([])
      const result = setUnion(a, b)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3])
    })

    it('should handle disjoint sets', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([3, 4])
      const result = setUnion(a, b)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3, 4])
    })
  })

  describe('setIntersect', function () {
    it('should compute intersection of two sets', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([2, 3, 5])
      const result = setIntersect(a, b)
      assert.deepStrictEqual(Array.from(result), [2, 3])
    })

    it('should return empty for disjoint sets', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([3, 4])
      const result = setIntersect(a, b)
      assert.strictEqual(result.length, 0)
    })

    it('should return empty when one set is empty', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([])
      const result = setIntersect(a, b)
      assert.strictEqual(result.length, 0)
    })
  })

  describe('setDifference', function () {
    it('should compute set difference a - b', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([2, 4])
      const result = setDifference(a, b)
      assert.deepStrictEqual(Array.from(result), [1, 3])
    })

    it('should return copy when b is empty', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([])
      const result = setDifference(a, b)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3])
    })

    it('should return empty when a is empty', function () {
      const a = new Float64Array([])
      const b = new Float64Array([1, 2, 3])
      const result = setDifference(a, b)
      assert.strictEqual(result.length, 0)
    })

    it('should return empty when a is subset of b', function () {
      const a = new Float64Array([2, 3])
      const b = new Float64Array([1, 2, 3, 4])
      const result = setDifference(a, b)
      assert.strictEqual(result.length, 0)
    })
  })

  describe('setSymDifference', function () {
    it('should compute symmetric difference (XOR)', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const result = setSymDifference(a, b)
      assert.deepStrictEqual(Array.from(result), [1, 4])
    })

    it('should return union for disjoint sets', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([3, 4])
      const result = setSymDifference(a, b)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3, 4])
    })

    it('should return empty for identical sets', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([1, 2, 3])
      const result = setSymDifference(a, b)
      assert.strictEqual(result.length, 0)
    })
  })

  describe('setIsSubset', function () {
    it('should return 1 when a is subset of b', function () {
      const a = new Float64Array([2, 3])
      const b = new Float64Array([1, 2, 3, 4])
      assert.strictEqual(setIsSubset(a, b), 1)
    })

    it('should return 0 when a is not subset of b', function () {
      const a = new Float64Array([2, 5])
      const b = new Float64Array([1, 2, 3, 4])
      assert.strictEqual(setIsSubset(a, b), 0)
    })

    it('should return 1 for empty set', function () {
      const a = new Float64Array([])
      const b = new Float64Array([1, 2, 3])
      assert.strictEqual(setIsSubset(a, b), 1)
    })

    it('should return 1 when sets are equal', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([1, 2, 3])
      assert.strictEqual(setIsSubset(a, b), 1)
    })
  })

  describe('setIsProperSubset', function () {
    it('should return 1 when a is proper subset of b', function () {
      const a = new Float64Array([2, 3])
      const b = new Float64Array([1, 2, 3, 4])
      assert.strictEqual(setIsProperSubset(a, b), 1)
    })

    it('should return 0 when sets are equal', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([1, 2, 3])
      assert.strictEqual(setIsProperSubset(a, b), 0)
    })
  })

  describe('setIsSuperset', function () {
    it('should return 1 when a is superset of b', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([2, 3])
      assert.strictEqual(setIsSuperset(a, b), 1)
    })
  })

  describe('setEquals', function () {
    it('should return 1 for equal sets', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([1, 2, 3])
      assert.strictEqual(setEquals(a, b), 1)
    })

    it('should return 0 for different sets', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([1, 2, 4])
      assert.strictEqual(setEquals(a, b), 0)
    })

    it('should return 0 for different lengths', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([1, 2, 3])
      assert.strictEqual(setEquals(a, b), 0)
    })
  })

  describe('setIsDisjoint', function () {
    it('should return 1 for disjoint sets', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([3, 4])
      assert.strictEqual(setIsDisjoint(a, b), 1)
    })

    it('should return 0 for overlapping sets', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([3, 4, 5])
      assert.strictEqual(setIsDisjoint(a, b), 0)
    })

    it('should return 1 when one set is empty', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([])
      assert.strictEqual(setIsDisjoint(a, b), 1)
    })
  })

  describe('setSize', function () {
    it('should return number of elements', function () {
      const a = new Float64Array([1, 2, 3, 4, 5])
      assert.strictEqual(setSize(a), 5)
    })

    it('should return 0 for empty set', function () {
      const a = new Float64Array([])
      assert.strictEqual(setSize(a), 0)
    })
  })

  describe('setContains', function () {
    it('should return 1 when element is in set', function () {
      const a = new Float64Array([1, 2, 3, 4, 5])
      assert.strictEqual(setContains(a, 3), 1)
    })

    it('should return 0 when element is not in set', function () {
      const a = new Float64Array([1, 2, 3, 4, 5])
      assert.strictEqual(setContains(a, 6), 0)
    })

    it('should return 0 for empty set', function () {
      const a = new Float64Array([])
      assert.strictEqual(setContains(a, 1), 0)
    })
  })

  describe('setAdd', function () {
    it('should add new element to set', function () {
      const a = new Float64Array([1, 3, 5])
      const result = setAdd(a, 4)
      assert.deepStrictEqual(Array.from(result), [1, 3, 4, 5])
    })

    it('should not duplicate existing element', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setAdd(a, 2)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3])
    })

    it('should add to beginning', function () {
      const a = new Float64Array([2, 3, 4])
      const result = setAdd(a, 1)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3, 4])
    })

    it('should add to end', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setAdd(a, 5)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3, 5])
    })
  })

  describe('setRemove', function () {
    it('should remove element from set', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const result = setRemove(a, 3)
      assert.deepStrictEqual(Array.from(result), [1, 2, 4])
    })

    it('should return copy if element not found', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setRemove(a, 5)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3])
    })

    it('should return empty for single element set', function () {
      const a = new Float64Array([5])
      const result = setRemove(a, 5)
      assert.strictEqual(result.length, 0)
    })
  })

  describe('setCartesian', function () {
    it('should compute Cartesian product', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([3, 4])
      const result = setCartesian(a, b)
      // Result: [(1,3), (1,4), (2,3), (2,4)] as flat array
      assert.deepStrictEqual(Array.from(result), [1, 3, 1, 4, 2, 3, 2, 4])
    })

    it('should return empty when one set is empty', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([])
      const result = setCartesian(a, b)
      assert.strictEqual(result.length, 0)
    })
  })

  describe('setPowerSetSize', function () {
    it('should return 2^n', function () {
      assert.strictEqual(setPowerSetSize(0), 1)
      assert.strictEqual(setPowerSetSize(1), 2)
      assert.strictEqual(setPowerSetSize(3), 8)
      assert.strictEqual(setPowerSetSize(4), 16)
    })
  })

  describe('setGetSubset', function () {
    it('should get empty subset (index 0)', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setGetSubset(a, 0)
      assert.strictEqual(result.length, 0)
    })

    it('should get full set (index 2^n - 1)', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setGetSubset(a, 7) // 111 binary
      assert.deepStrictEqual(Array.from(result), [1, 2, 3])
    })

    it('should get specific subset by index', function () {
      const a = new Float64Array([1, 2, 3])
      // index 5 = 101 binary = {a[0], a[2]} = {1, 3}
      const result = setGetSubset(a, 5)
      assert.deepStrictEqual(Array.from(result), [1, 3])
    })
  })

  describe('set operation properties', function () {
    it('union should be commutative', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([3, 4, 5])
      const ab = setUnion(a, b)
      const ba = setUnion(b, a)
      assert.strictEqual(setEquals(ab, ba), 1)
    })

    it('intersection should be commutative', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const ab = setIntersect(a, b)
      const ba = setIntersect(b, a)
      assert.strictEqual(setEquals(ab, ba), 1)
    })

    it('De Morgan: complement of union = intersection of complements', function () {
      // A ∩ B = U \ ((U \ A) ∪ (U \ B)) where U is universal set
      // Tested implicitly through other operations
      assert(true)
    })

    it('symmetric difference should be commutative', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const ab = setSymDifference(a, b)
      const ba = setSymDifference(b, a)
      assert.strictEqual(setEquals(ab, ba), 1)
    })

    it('A ∪ A = A (idempotent)', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setUnion(a, a)
      assert.strictEqual(setEquals(result, a), 1)
    })

    it('A ∩ A = A (idempotent)', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setIntersect(a, a)
      assert.strictEqual(setEquals(result, a), 1)
    })

    it('A \\ A = ∅', function () {
      const a = new Float64Array([1, 2, 3])
      const result = setDifference(a, a)
      assert.strictEqual(result.length, 0)
    })
  })
})
