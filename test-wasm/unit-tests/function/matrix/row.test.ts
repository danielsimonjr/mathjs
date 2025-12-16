<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for row - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import sinon from 'sinon'

const row = math.row
const matrix = math.matrix

<<<<<<< HEAD
describe('row', function () {
=======
describe('row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
  const a = [
    [0, 2, 0, 0, 0],
    [0, 1, 0, 2, 4],
    [0, 0, 0, 0, 0],
    [8, 4, 0, 3, 0],
    [0, 0, 0, 6, 0]
  ]
  const m = matrix(a)

<<<<<<< HEAD
  it('should throw an error if the row is out of range', function () {
    assert.throws(function () {
=======
  it('should throw an error if the row is out of range', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = row(m, 9)
      assert.deepStrictEqual(r.valueOf(), [[0], [0], [0], [0], [0]])
    }, /IndexError: Index out of range \(9 > 4\)/)
  })

<<<<<<< HEAD
  it('should throw an error if the row is not an integer', function () {
    assert.throws(function () {
=======
  it('should throw an error if the row is not an integer', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = row(m, 'x')
      assert.deepStrictEqual(r.valueOf(), [[0], [0], [0], [0], [0]])
    }, /Error: Cannot convert "x" to a number/)
  })

<<<<<<< HEAD
  it('should throw an error if the matrix does not have two dimensions', function () {
    assert.throws(function () {
=======
  it('should throw an error if the matrix does not have two dimensions', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = matrix([[[1, 2, 3]]])
      const r = row(m, 0)
      assert.deepStrictEqual(r.valueOf(), [[0], [0], [0], [0], [0]])
    }, /Error: Only two dimensional matrix is supported/)
  })

<<<<<<< HEAD
  it('should return the first matrix row', function () {
=======
  it('should return the first matrix row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(m, 0)
    assert.deepStrictEqual(r.valueOf(), [[0, 2, 0, 0, 0]])
  })

<<<<<<< HEAD
  it('should return the first array row', function () {
=======
  it('should return the first array row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(a, 0)
    assert.deepStrictEqual(r.valueOf(), [[0, 2, 0, 0, 0]])
  })

<<<<<<< HEAD
  it('should return the last matrix row', function () {
=======
  it('should return the last matrix row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(m, 4)
    assert.deepStrictEqual(r.valueOf(), [[0, 0, 0, 6, 0]])
  })

<<<<<<< HEAD
  it('should return the last array row', function () {
=======
  it('should return the last array row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(a, 4)
    assert.deepStrictEqual(r.valueOf(), [[0, 0, 0, 6, 0]])
  })

<<<<<<< HEAD
  it('should return an intermediate matrix row', function () {
=======
  it('should return an intermediate matrix row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(m, 1)
    assert.deepStrictEqual(r.valueOf(), [[0, 1, 0, 2, 4]])
  })

<<<<<<< HEAD
  it('should return an intermediate array row', function () {
=======
  it('should return an intermediate array row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(a, 1)
    assert.deepStrictEqual(r.valueOf(), [[0, 1, 0, 2, 4]])
  })

<<<<<<< HEAD
  it('should return the row of an 1x1 array', function () {
=======
  it('should return the row of an 1x1 array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(row([[5]], 0), [[5]])
    assert.deepStrictEqual(row([[5], [6], [7]], 0), [[5]])
  })

<<<<<<< HEAD
  it('should return the row of an 1x1 matrix', function () {
=======
  it('should return the row of an 1x1 matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(row(matrix([[5]]), 0), matrix([[5]]))
    assert.deepStrictEqual(row(matrix([[5], [6], [7]]), 0), matrix([[5]]))
  })

<<<<<<< HEAD
  it('should return an empty matrix row', function () {
=======
  it('should return an empty matrix row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(m, 2)
    assert.deepStrictEqual(r.valueOf(), [[0, 0, 0, 0, 0]])
  })

<<<<<<< HEAD
  it('should return an empty array row', function () {
=======
  it('should return an empty array row', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const r = row(a, 2)
    assert.deepStrictEqual(r.valueOf(), [[0, 0, 0, 0, 0]])
  })

<<<<<<< HEAD
  it('should work with config legacySubset during deprecation', function () {
=======
  it('should work with config legacySubset during deprecation', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const math2 = math.create()
    // Add a spy to temporarily disable console.warn
    const warnStub = sinon.stub(console, 'warn')

    math2.config({ legacySubset: true })

    const a = [
      [0, 2, 0, 0, 0],
      [0, 1, 0, 2, 4],
      [0, 0, 0, 0, 0],
      [8, 4, 0, 3, 0],
      [0, 0, 0, 6, 0]
    ]

    // Test row with legacySubset syntax
    // This is not strictly necessary and should be removed after the deprecation period
    assert.deepStrictEqual(math2.row(a, 3).valueOf(), [[8, 4, 0, 3, 0]])

    // Test row without legacySubset syntax
    math2.config({ legacySubset: false })

    assert.deepStrictEqual(math2.row(a, 3).valueOf(), [[8, 4, 0, 3, 0]])

    // Restore console.warn
    warnStub.restore()
  })
})
