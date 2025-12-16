<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for mode - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const mode = math.mode
const DenseMatrix = math.DenseMatrix

<<<<<<< HEAD
describe('mode', function () {
  it('should return the mode accurately for one dimensional array', function () {
=======
describe('mode', function (): void {
  it('should return the mode accurately for one dimensional array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mode([1, 2.7, 3.2, 4, 2.7]), [2.7])
    assert.deepStrictEqual(mode([13, 24, 35, 46, 13]), [13])
    assert.deepStrictEqual(mode([1, 5, -5, 1]), [1])
  })

<<<<<<< HEAD
  it('should return the correct mode when there are more than one values of mode', function () {
=======
  it('should return the correct mode when there are more than one values of mode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mode([1, 2.7, 3.2, 3.2, 4, 2.7]), [3.2, 2.7])
    assert.deepStrictEqual(mode([13, 24, 35, 46]), [13, 24, 35, 46])
    assert.deepStrictEqual(mode(['boston', 'delhi', 'cape town']), [
      'boston',
      'delhi',
      'cape town'
    ])
  })

<<<<<<< HEAD
  it('should return the mode accurately for loose arguments', function () {
=======
  it('should return the mode accurately for loose arguments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mode(2, 1, 4, 3, 1), [1])
    assert.deepStrictEqual(mode('a', 'b', 'c', 'b'), ['b'])
  })

<<<<<<< HEAD
  it('should return the mode of booleans', function () {
=======
  it('should return the mode of booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mode(true, true, false), [true])
    assert.deepStrictEqual(mode(true, [false, false]), [false])
  })

<<<<<<< HEAD
  it('should return the mode correctly for different datatypes', function () {
=======
  it('should return the mode correctly for different datatypes', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mode(2, 1, 'f', 3.5, 1.0), [1])
    assert.deepStrictEqual(mode('a', 'b', 4, 'b'), ['b'])
  })

<<<<<<< HEAD
  it('should not throw an error if the input contains mixture of array and non-array values', function () {
=======
  it('should not throw an error if the input contains mixture of array and non-array values', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mode(1, [3], [1, 2, 3, 7], 3, [8]), [3])
    assert.deepStrictEqual(mode([1], 3, [3]), [3])
    assert.deepStrictEqual(mode([13, 24], [35, 46]), [13, 24, 35, 46])
    assert.deepStrictEqual(mode([], 0), [0])
  })

<<<<<<< HEAD
  it('should return NaN if any of the inputs contains NaN', function () {
    assert.throws(function () {
      mode(NaN)
    }, /Cannot calculate mode/)
    assert.throws(function () {
      mode([NaN])
    }, /Cannot calculate mode/)
    assert.throws(function () {
=======
  it('should return NaN if any of the inputs contains NaN', function (): void {
    assert.throws(function (): void {
      mode(NaN)
    }, /Cannot calculate mode/)
    assert.throws(function (): void {
      mode([NaN])
    }, /Cannot calculate mode/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      mode([1, NaN])
    }, /Cannot calculate mode/)
  })

<<<<<<< HEAD
  it('should throw appropriate error if no parameters are assigned', function () {
    assert.throws(function () {
      mode([])
    })
    assert.throws(function () {
=======
  it('should throw appropriate error if no parameters are assigned', function (): void {
    assert.throws(function (): void {
      mode([])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      mode()
    })
  })

  /* TODO :
  it('should throw appropriate error if parameters contain array of arrays or nested arrays', function(){
    assert.throws(function() {mode([1][3][3])})
    assert.throws(function() {mode([a[b, a]])})
  })
  */

<<<<<<< HEAD
  it('should return the mode of a 1D matrix', function () {
    assert.deepStrictEqual(mode(new DenseMatrix([1, 3, 5, 2, -5, 3])), [3])
  })

  it('should return the mode of a 2D matrix', function () {
=======
  it('should return the mode of a 1D matrix', function (): void {
    assert.deepStrictEqual(mode(new DenseMatrix([1, 3, 5, 2, -5, 3])), [3])
  })

  it('should return the mode of a 2D matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      mode(
        new DenseMatrix([
          [1, 4, 0],
          [3, 0, 5]
        ])
      ),
      [0]
    )
  })
})
