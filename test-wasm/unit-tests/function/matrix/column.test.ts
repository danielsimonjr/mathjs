<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for column - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import sinon from 'sinon'

const column = math.column
const matrix = math.matrix

<<<<<<< HEAD
describe('column', function () {
=======
describe('column', function (): void {
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
  it('should throw an error if the column is out of range', function () {
    assert.throws(function () {
=======
  it('should throw an error if the column is out of range', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = column(m, 9)
      assert.deepStrictEqual(r.valueOf(), [[0], [0], [0], [0], [0]])
    }, /IndexError: Index out of range \(9 > 4\)/)
  })

<<<<<<< HEAD
  it('should throw an error if the column is not an integer', function () {
    assert.throws(function () {
=======
  it('should throw an error if the column is not an integer', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = column(m, 'x')
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
      const r = column(m, 0)
      assert.deepStrictEqual(r.valueOf(), [[0], [0], [0], [0], [0]])
    }, /Error: Only two dimensional matrix is supported/)
  })

<<<<<<< HEAD
  it('should return the first matrix column', function () {
=======
  it('should return the first matrix column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(m, 0)
    assert.deepStrictEqual(c.valueOf(), [[0], [0], [0], [8], [0]])
  })

<<<<<<< HEAD
  it('should return the first array column', function () {
=======
  it('should return the first array column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(a, 0)
    assert.deepStrictEqual(c.valueOf(), [[0], [0], [0], [8], [0]])
  })

<<<<<<< HEAD
  it('should return the last matrix column', function () {
=======
  it('should return the last matrix column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(m, 4)
    assert.deepStrictEqual(c.valueOf(), [[0], [4], [0], [0], [0]])
  })

<<<<<<< HEAD
  it('should return the last array column', function () {
=======
  it('should return the last array column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(a, 4)
    assert.deepStrictEqual(c.valueOf(), [[0], [4], [0], [0], [0]])
  })

<<<<<<< HEAD
  it('should return an intermediate matrix column', function () {
=======
  it('should return an intermediate matrix column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(m, 1)
    assert.deepStrictEqual(c.valueOf(), [[2], [1], [0], [4], [0]])
  })

<<<<<<< HEAD
  it('should return an intermediate array column', function () {
=======
  it('should return an intermediate array column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(a, 1)
    assert.deepStrictEqual(c.valueOf(), [[2], [1], [0], [4], [0]])
  })

<<<<<<< HEAD
  it('should return the column of an 1x1 array', function () {
=======
  it('should return the column of an 1x1 array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(column([[5]], 0), [[5]])
    assert.deepStrictEqual(column([[5, 6, 7]], 0), [[5]])
  })

<<<<<<< HEAD
  it('should return the column of an 1x1 matrix', function () {
=======
  it('should return the column of an 1x1 matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(column(matrix([[5]]), 0), matrix([[5]]))
    assert.deepStrictEqual(column(matrix([[5, 6, 7]]), 0), matrix([[5]]))
  })

<<<<<<< HEAD
  it('should return an empty matrix column', function () {
=======
  it('should return an empty matrix column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(m, 2)
    assert.deepStrictEqual(c.valueOf(), [[0], [0], [0], [0], [0]])
  })

<<<<<<< HEAD
  it('should return an empty array column', function () {
=======
  it('should return an empty array column', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = column(a, 2)
    assert.deepStrictEqual(c.valueOf(), [[0], [0], [0], [0], [0]])
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
    // Test column with legacySubset syntax
    // This is not strictly necessary and shoudl be removed after the deprecation period

    assert.deepStrictEqual(math2.column(a, 4).valueOf(), [
      [0],
      [4],
      [0],
      [0],
      [0]
    ])

    // Test column with legacySubset syntax
    math2.config({ legacySubset: false })

    // Test column without legacySubset syntax
    assert.deepStrictEqual(math2.column(a, 4).valueOf(), [
      [0],
      [4],
      [0],
      [0],
      [0]
    ])

    // Restore console.warn
    warnStub.restore()
  })
})
