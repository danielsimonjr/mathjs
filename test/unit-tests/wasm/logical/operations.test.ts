import assert from 'assert'
import {
  and,
  andArray,
  or,
  orArray,
  not,
  notArray,
  xor,
  xorArray,
  nand,
  nor,
  xnor,
  countTrue,
  all,
  any,
  findFirst,
  findLast,
  findAll,
  select,
  selectArray
} from '../../../../src/wasm/logical/operations.ts'

describe('wasm/logical/operations', function () {
  describe('and', function () {
    it('should return 1 when both true', function () {
      assert.strictEqual(and(1, 1), 1)
      assert.strictEqual(and(5, 3), 1)
    })

    it('should return 0 when either false', function () {
      assert.strictEqual(and(1, 0), 0)
      assert.strictEqual(and(0, 1), 0)
      assert.strictEqual(and(0, 0), 0)
    })
  })

  describe('andArray', function () {
    it('should AND arrays element-wise', function () {
      const a = new Int32Array([1, 1, 0, 0])
      const b = new Int32Array([1, 0, 1, 0])
      const result = andArray(a, b)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 0)
      assert.strictEqual(result[2], 0)
      assert.strictEqual(result[3], 0)
    })
  })

  describe('or', function () {
    it('should return 1 when either true', function () {
      assert.strictEqual(or(1, 1), 1)
      assert.strictEqual(or(1, 0), 1)
      assert.strictEqual(or(0, 1), 1)
    })

    it('should return 0 when both false', function () {
      assert.strictEqual(or(0, 0), 0)
    })
  })

  describe('orArray', function () {
    it('should OR arrays element-wise', function () {
      const a = new Int32Array([1, 1, 0, 0])
      const b = new Int32Array([1, 0, 1, 0])
      const result = orArray(a, b)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 1)
      assert.strictEqual(result[2], 1)
      assert.strictEqual(result[3], 0)
    })
  })

  describe('not', function () {
    it('should return 1 for false', function () {
      assert.strictEqual(not(0), 1)
    })

    it('should return 0 for true', function () {
      assert.strictEqual(not(1), 0)
      assert.strictEqual(not(5), 0)
    })
  })

  describe('notArray', function () {
    it('should NOT array element-wise', function () {
      const a = new Int32Array([1, 0, 5, 0])
      const result = notArray(a)

      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], 1)
      assert.strictEqual(result[2], 0)
      assert.strictEqual(result[3], 1)
    })
  })

  describe('xor', function () {
    it('should return 1 when exactly one is true', function () {
      assert.strictEqual(xor(1, 0), 1)
      assert.strictEqual(xor(0, 1), 1)
    })

    it('should return 0 when both same', function () {
      assert.strictEqual(xor(0, 0), 0)
      assert.strictEqual(xor(1, 1), 0)
    })
  })

  describe('xorArray', function () {
    it('should XOR arrays element-wise', function () {
      const a = new Int32Array([1, 1, 0, 0])
      const b = new Int32Array([1, 0, 1, 0])
      const result = xorArray(a, b)

      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], 1)
      assert.strictEqual(result[2], 1)
      assert.strictEqual(result[3], 0)
    })
  })

  describe('nand', function () {
    it('should return 0 when both true', function () {
      assert.strictEqual(nand(1, 1), 0)
    })

    it('should return 1 when either false', function () {
      assert.strictEqual(nand(1, 0), 1)
      assert.strictEqual(nand(0, 1), 1)
      assert.strictEqual(nand(0, 0), 1)
    })
  })

  describe('nor', function () {
    it('should return 1 when both false', function () {
      assert.strictEqual(nor(0, 0), 1)
    })

    it('should return 0 when either true', function () {
      assert.strictEqual(nor(1, 0), 0)
      assert.strictEqual(nor(0, 1), 0)
      assert.strictEqual(nor(1, 1), 0)
    })
  })

  describe('xnor', function () {
    it('should return 1 when both same', function () {
      assert.strictEqual(xnor(0, 0), 1)
      assert.strictEqual(xnor(1, 1), 1)
    })

    it('should return 0 when different', function () {
      assert.strictEqual(xnor(1, 0), 0)
      assert.strictEqual(xnor(0, 1), 0)
    })
  })

  describe('countTrue', function () {
    it('should count non-zero values', function () {
      const a = new Int32Array([1, 0, 1, 0, 1])
      assert.strictEqual(countTrue(a), 3)
    })

    it('should return 0 for all zeros', function () {
      const a = new Int32Array([0, 0, 0])
      assert.strictEqual(countTrue(a), 0)
    })

    it('should count all for non-zero array', function () {
      const a = new Int32Array([1, 2, 3])
      assert.strictEqual(countTrue(a), 3)
    })
  })

  describe('all', function () {
    it('should return 1 when all true', function () {
      const a = new Int32Array([1, 2, 3])
      assert.strictEqual(all(a), 1)
    })

    it('should return 0 when any false', function () {
      const a = new Int32Array([1, 0, 1])
      assert.strictEqual(all(a), 0)
    })

    it('should return 1 for empty array', function () {
      const a = new Int32Array([])
      assert.strictEqual(all(a), 1)
    })
  })

  describe('any', function () {
    it('should return 1 when any true', function () {
      const a = new Int32Array([0, 1, 0])
      assert.strictEqual(any(a), 1)
    })

    it('should return 0 when all false', function () {
      const a = new Int32Array([0, 0, 0])
      assert.strictEqual(any(a), 0)
    })

    it('should return 0 for empty array', function () {
      const a = new Int32Array([])
      assert.strictEqual(any(a), 0)
    })
  })

  describe('findFirst', function () {
    it('should find index of first true', function () {
      const a = new Int32Array([0, 0, 1, 0])
      assert.strictEqual(findFirst(a), 2)
    })

    it('should return -1 when none found', function () {
      const a = new Int32Array([0, 0, 0])
      assert.strictEqual(findFirst(a), -1)
    })

    it('should return 0 when first is true', function () {
      const a = new Int32Array([1, 0, 0])
      assert.strictEqual(findFirst(a), 0)
    })
  })

  describe('findLast', function () {
    it('should find index of last true', function () {
      const a = new Int32Array([0, 1, 0, 1, 0])
      assert.strictEqual(findLast(a), 3)
    })

    it('should return -1 when none found', function () {
      const a = new Int32Array([0, 0, 0])
      assert.strictEqual(findLast(a), -1)
    })

    it('should return last index when last is true', function () {
      const a = new Int32Array([0, 0, 1])
      assert.strictEqual(findLast(a), 2)
    })
  })

  describe('findAll', function () {
    it('should find all indices of true values', function () {
      const a = new Int32Array([1, 0, 1, 0, 1])
      const result = findAll(a)

      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], 2)
      assert.strictEqual(result[2], 4)
    })

    it('should return empty array when none found', function () {
      const a = new Int32Array([0, 0, 0])
      const result = findAll(a)
      assert.strictEqual(result.length, 0)
    })
  })

  describe('select', function () {
    it('should return a when condition is true', function () {
      assert.strictEqual(select(1, 10, 20), 10)
    })

    it('should return b when condition is false', function () {
      assert.strictEqual(select(0, 10, 20), 20)
    })
  })

  describe('selectArray', function () {
    it('should select from arrays based on condition', function () {
      const condition = new Int32Array([1, 0, 1, 0])
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([10, 20, 30, 40])
      const result = selectArray(condition, a, b)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 20)
      assert.strictEqual(result[2], 3)
      assert.strictEqual(result[3], 40)
    })
  })
})
