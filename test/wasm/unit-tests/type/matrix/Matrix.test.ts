/**
 * Test for Matrix - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
const Matrix = math.Matrix

describe('matrix', function (): void {
  describe('constructor', function (): void {
    it('should create a matrix', function (): void {
      const m = new Matrix()
      assert(m instanceof Matrix)
    })

    it('should throw an error when called without new keyword', function (): void {
      assert.throws(function (): void {
        Matrix()
      }, /Constructor must be called with the new operator/)
    })

    it('should have a property isMatrix', function (): void {
      const a = new Matrix()
      assert.strictEqual(a.isMatrix, true)
    })

    it('should have a property type', function (): void {
      const a = new Matrix()
      assert.strictEqual(a.type, 'Matrix')
    })
  })

  describe('size', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.size()
      }, /Cannot invoke size on a Matrix interface/)
    })
  })

  describe('create', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.create([])
      }, /Cannot invoke create on a Matrix interface/)
    })
  })

  describe('toString', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.toString()
      }, /Cannot invoke toString on a Matrix interface/)
    })
  })

  describe('format', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.format()
      }, /Cannot invoke format on a Matrix interface/)
    })
  })

  describe('resize', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.resize()
      }, /Cannot invoke resize on a Matrix interface/)
    })
  })

  describe('reshape', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.reshape()
      }, /Cannot invoke reshape on a Matrix interface/)
    })
  })

  describe('get', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.get()
      }, /Cannot invoke get on a Matrix interface/)
    })
  })

  describe('set', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.set()
      }, /Cannot invoke set on a Matrix interface/)
    })
  })

  describe('subset', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.subset()
      }, /Cannot invoke subset on a Matrix interface/)
    })
  })

  describe('map', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.map()
      }, /Cannot invoke map on a Matrix interface/)
    })
  })

  describe('forEach', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.forEach()
      }, /Cannot invoke forEach on a Matrix interface/)
    })
  })

  describe('clone', function (): void {
    it('should throw exception', function (): void {
      const m = new Matrix()
      assert.throws(function (): void {
        m.clone()
      }, /Cannot invoke clone on a Matrix interface/)
    })
  })
})
