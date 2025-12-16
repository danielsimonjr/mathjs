<<<<<<< HEAD
// @ts-nocheck
// test nthRoots
=======
/**
 * Test for nthRoots - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
import { approxDeepEqual } from '../../../../tools/approx.js'

const complex = math.complex
const nthRoots = math.nthRoots

<<<<<<< HEAD
describe('nthRoots', function () {
  it('should return an array of Complex roots', function () {
=======
describe('nthRoots', function (): void {
  it('should return an array of Complex roots', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const roots = nthRoots(complex('-1'), 6)
    const roots1 = [
      complex({ r: 1, phi: Math.PI / 6 }),
      complex(0, 1),
      complex({ r: 1, phi: (5 * Math.PI) / 6 }),
      complex({ r: 1, phi: (7 * Math.PI) / 6 }),
      complex(0, -1),
      complex({ r: 1, phi: (11 * Math.PI) / 6 })
    ]

    roots.forEach(function (value, index, _array) {
      assert.deepStrictEqual(value, roots1[index])
    })
  })

<<<<<<< HEAD
  it('should return the correct answer for Complex values', function () {
=======
  it('should return the correct answer for Complex values', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const roots = nthRoots(complex(3, 4), 2)

    approxDeepEqual(roots, [
      complex(2, 1),
      complex(-2.0000000000000004, -0.9999999999999999)
    ])
  })

  const twos = [complex(2, 0), complex(0, 2), complex(-2, 0), complex(0, -2)]

<<<<<<< HEAD
  it('should return pure roots without artifacts', function () {
=======
  it('should return pure roots without artifacts', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const roots = nthRoots(complex('16'), 4)

    roots.forEach(function (value, index, _array) {
      assert.deepStrictEqual(value, twos[index])
    })
  })

<<<<<<< HEAD
  it('should return roots for numeric arguments', function () {
=======
  it('should return roots for numeric arguments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const roots = nthRoots(16, 4)

    roots.forEach(function (value, index, _array) {
      assert.deepStrictEqual(value, twos[index])
    })
  })

<<<<<<< HEAD
  it('should return roots for string arguments', function () {
=======
  it('should return roots for string arguments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const roots = nthRoots('16', 4)

    roots.forEach(function (value, index, _array) {
      assert.deepStrictEqual(value, twos[index])
    })
  })

<<<<<<< HEAD
  it('should return zero exactly once', function () {
=======
  it('should return zero exactly once', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const roots2 = nthRoots(0)
    const roots4 = nthRoots(0, 4)
    const roots8 = nthRoots(0, 8)
    assert.deepStrictEqual(roots2, [complex(0)])
    assert.deepStrictEqual(roots4, [complex(0)])
    assert.deepStrictEqual(roots8, [complex(0)])
  })
})
