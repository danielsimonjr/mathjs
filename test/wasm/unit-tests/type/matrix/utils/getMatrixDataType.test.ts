/**
 * Test for getMatrixDataType - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
const DenseMatrix = math.DenseMatrix
const SparseMatrix = math.SparseMatrix
const getMatrixDataType = math.getMatrixDataType

describe('getMatrixDataType', function (): void {
  describe('array', function (): void {
    it('should return number for pure numbers', function (): void {
      const result = getMatrixDataType([
        [1, 2, 3],
        [4, 5, 6],
        [1, 8, 9]
      ])
      assert.strictEqual('number', result)
    })

    it('should return number for pure numbers with NaN', function (): void {
      const result = getMatrixDataType([
        [1, 2, NaN],
        [4, 5, 6],
        [1, 8, 9]
      ])
      assert.strictEqual('number', result)
    })

    it('should return string', function (): void {
      const result = getMatrixDataType([['string'], ['test']])
      assert.strictEqual('string', result)
    })

    it('should return boolean', function (): void {
      const result = getMatrixDataType([[true], [false]])
      assert.strictEqual('boolean', result)
    })

    it('should return undefined', function (): void {
      const result = getMatrixDataType([[undefined], [undefined]])
      assert.strictEqual('undefined', result)
    })

    it('should return null', function (): void {
      const result = getMatrixDataType([[null], [null]])
      assert.strictEqual('null', result)
    })

    it('should return mixed when number and null are given', function (): void {
      const result = getMatrixDataType([[1], [null]])
      assert.strictEqual('mixed', result)
    })

    it('should return mixed when number and string are given', function (): void {
      const result = getMatrixDataType([[1], ['string']])
      assert.strictEqual('mixed', result)
    })

    it('should return undefined if the input is not a matrix', function (): void {
      // Not equal in size and one is an empty array
      const result1 = getMatrixDataType([[1], []])
      // Not equal in size
      const result2 = getMatrixDataType([
        [1, 2, 3],
        [1, 2]
      ])
      // Empty array as an input
      const result3 = getMatrixDataType([])

      assert.strictEqual(undefined, result1)
      assert.strictEqual(undefined, result2)
      assert.strictEqual(undefined, result3)
    })
  })

  describe('extra type BigNumber', function (): void {
    it('should return BigNumber', function (): void {
      const zero = math.bignumber(0)
      const bignumberMatrix = getMatrixDataType([[zero], [zero]])
      assert.strictEqual(bignumberMatrix, 'BigNumber')
    })

    it('should return mixed', function (): void {
      const zero = math.bignumber(0)
      const bignumberMatrix = getMatrixDataType([[zero], [2]])
      assert.strictEqual(bignumberMatrix, 'mixed')
    })

    it('should return undefined', function (): void {
      const zero = math.bignumber(0)
      const bignumberMatrix = getMatrixDataType([[zero], []])
      assert.strictEqual(bignumberMatrix, undefined)
    })
  })

  describe('extra type Unit', function (): void {
    it('should return Unit', function (): void {
      const x = math.unit('5cm')
      const unitMatrix = getMatrixDataType([[x], [x]])
      assert.strictEqual(unitMatrix, 'Unit')
    })

    it('should return mixed', function (): void {
      const x = math.unit('5cm')
      const unitMatrix = getMatrixDataType([[x], [2]])
      assert.strictEqual(unitMatrix, 'mixed')
    })

    it('should return undefined', function (): void {
      const x = math.unit('5cm')
      const unitMatrix = getMatrixDataType([[x], []])
      assert.strictEqual(unitMatrix, undefined)
    })
  })

  describe('extra type Fraction', function (): void {
    it('should return Fraction', function (): void {
      const x = math.fraction(1, 3)
      const fractionMatrix = getMatrixDataType([[x], [x]])
      assert.strictEqual(fractionMatrix, 'Fraction')
    })

    it('should return mixed', function (): void {
      const x = math.fraction(1, 3)
      const fractionMatrix = getMatrixDataType([[x], [2]])
      assert.strictEqual(fractionMatrix, 'mixed')
    })

    it('should return undefined', function (): void {
      const x = math.fraction(1, 3)
      const fractionMatrix = getMatrixDataType([[x], []])
      assert.strictEqual(fractionMatrix, undefined)
    })
  })

  describe('SparseMatrix', function (): void {
    it('should return number for pure numbers', function (): void {
      const matrix = new SparseMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [1, 8, 9]
      ])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('number', result1)
      assert.strictEqual('number', result2)
    })

    it('should return number for pure numbers with NaN', function (): void {
      const matrix = new SparseMatrix([
        [1, 2, NaN],
        [4, 5, 6],
        [1, 8, 9]
      ])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('number', result1)
      assert.strictEqual('number', result2)
    })
  })

  describe('DenseMatrix', function (): void {
    it('should return number for pure numbers', function (): void {
      const matrix = new DenseMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [1, 8, 9]
      ])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('number', result1)
      assert.strictEqual('number', result2)
    })

    it('should return number for pure numbers with NaN', function (): void {
      const matrix = new DenseMatrix([
        [1, 2, NaN],
        [4, 5, 6],
        [1, 8, 9]
      ])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('number', result1)
      assert.strictEqual('number', result2)
    })

    it('should return string', function (): void {
      const matrix = new DenseMatrix([['string'], ['test']])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('string', result1)
      assert.strictEqual('string', result2)
    })

    it('should return boolean', function (): void {
      const matrix = new DenseMatrix([[true], [false]])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('boolean', result1)
      assert.strictEqual('boolean', result2)
    })

    it('should return undefined', function (): void {
      const matrix = new DenseMatrix([[undefined], [undefined]])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('undefined', result1)
      assert.strictEqual('undefined', result2)
    })

    it('should return null', function (): void {
      const matrix = new DenseMatrix([[null], [null]])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('null', result1)
      assert.strictEqual('null', result2)
    })

    it('should return mixed when number and null are given', function (): void {
      const matrix = new DenseMatrix([[1], [null]])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('mixed', result1)
      assert.strictEqual('mixed', result2)
    })

    it('should return mixed when number and string are given', function (): void {
      const matrix = new DenseMatrix([[1], ['string']])
      const result1 = getMatrixDataType(matrix)
      const result2 = matrix.getDataType()
      assert.strictEqual('mixed', result1)
      assert.strictEqual('mixed', result2)
    })
  })
})
