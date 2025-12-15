/**
 * Test for FibonacciHeap - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const FibonacciHeap = math.FibonacciHeap

describe('FibonacciHeap', function (): void {
  describe('constructor', function (): void {
    it('should create heap', function (): void {
      const h = new FibonacciHeap()
      assert.strictEqual(h._size, 0)
      assert(h._minimum === null)
    })

    it('should have a property isFibonacciHeap', function (): void {
      const a = new FibonacciHeap()
      assert.strictEqual(a.isFibonacciHeap, true)
    })

    it('should have a property type', function (): void {
      const a = new FibonacciHeap()
      assert.strictEqual(a.type, 'FibonacciHeap')
    })

    it('should throw an error when called without new keyword', function (): void {
      assert.throws(function (): void {
        FibonacciHeap()
      }, /Constructor must be called with the new operator/)
    })
  })

  describe('insert', function (): void {
    it('should insert node when heap is empty', function (): void {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      assert.strictEqual(h._size, 1)
      assert(h._minimum !== null)
      assert.strictEqual(h._minimum.key, 1)
      assert.strictEqual(h._minimum.value, 'v1')
    })

    it('should insert two nodes when heap is empty', function (): void {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      h.insert(10, 'v10')
      assert.strictEqual(h._size, 2)
      assert(h._minimum !== null)
      assert.strictEqual(h._minimum.key, 1)
      assert.strictEqual(h._minimum.value, 'v1')
    })

    it('should insert two nodes when heap is empty, reverse order', function (): void {
      const h = new FibonacciHeap()
      h.insert(10, 'v10')
      h.insert(1, 'v1')
      assert.strictEqual(h._size, 2)
      assert(h._minimum !== null)
      assert.strictEqual(h._minimum.key, 1)
      assert.strictEqual(h._minimum.value, 'v1')
    })
  })

  describe('extractMinimum', function (): void {
    it('should extract node from heap, one node', function (): void {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      const n = h.extractMinimum()
      assert.strictEqual(n.key, 1)
      assert.strictEqual(n.value, 'v1')
      assert.strictEqual(h._size, 0)
      assert(h._minimum === null)
    })

    it('should extract node from heap, two nodes', function (): void {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      h.insert(10, 'v10')
      const n = h.extractMinimum()
      assert.strictEqual(n.key, 1)
      assert.strictEqual(n.value, 'v1')
      assert.strictEqual(h._size, 1)
      assert.strictEqual(h._minimum.key, 10)
      assert.strictEqual(h._minimum.value, 'v10')
    })

    it('should extract nodes in ascending order', function (): void {
      const h = new FibonacciHeap()
      h.insert(5, 'v5')
      h.insert(4, 'v4')
      h.insert(1, 'v1')
      h.insert(3, 'v3')
      h.insert(2, 'v2')
      // extract all nodes
      let n
      let l = h.extractMinimum()
      let s = h._size
      while (true) {
        n = h.extractMinimum()
        if (!n) {
          break
        }
        assert(n.key > l.key)
        assert.strictEqual(h._size, --s)
        l = n
      }
      assert.strictEqual(h._size, 0)
      assert(h._minimum === null)
    })
  })

  describe('remove', function (): void {
    it('should remove node, one node', function (): void {
      const h = new FibonacciHeap()
      const n = h.insert(1, 'v1')
      h.remove(n)
      assert.strictEqual(h._size, 0)
      assert(h._minimum === null)
    })

    it('should remove node with smaller key', function (): void {
      const h = new FibonacciHeap()
      h.insert(20, 'v20')
      const n = h.insert(1, 'v1')
      h.insert(10, 'v10')
      h.insert(5, 'v5')
      h.insert(4, 'v4')
      h.remove(n)
      assert.strictEqual(h._size, 4)
    })

    it('should remove node with largest key', function (): void {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      h.insert(10, 'v10')
      const n = h.insert(20, 'v20')
      h.insert(5, 'v5')
      h.insert(4, 'v4')
      h.remove(n)
      assert.strictEqual(h._size, 4)
    })
  })

  it('should check whether emtpy', function (): void {
    const h = new FibonacciHeap()
    assert.strictEqual(h.isEmpty(), true)
    assert.strictEqual(h.size(), 0)

    h.insert(1, 'v1')
    h.insert(10, 'v10')
    assert.strictEqual(h.isEmpty(), false)
    assert.strictEqual(h.size(), 2)

    h.clear()
    assert.strictEqual(h.isEmpty(), true)
    assert.strictEqual(h.size(), 0)
  })
})
