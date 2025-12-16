<<<<<<< HEAD
// @ts-nocheck
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

function assertFalse(val) {
  assert(!val)
}

describe('symbolicEqual', function () {
  it('relates anything to itself', function () {
=======
/**
 * Test for symbolicEqual - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

function assertFalse(val: boolean): void {
  assert(!val)
}

describe('symbolicEqual', function (): void {
  it('relates anything to itself', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert(math.symbolicEqual('x', 'x'))
    assert(math.symbolicEqual('foo(x)', 'foo(x)'))
  })

<<<<<<< HEAD
  it('does not relate different variables', function () {
=======
  it('does not relate different variables', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assertFalse(math.symbolicEqual('x', 'y'))
    assertFalse(math.symbolicEqual('foo(x)+bar(x)', 'foo(x)+bar(y)'))
  })

<<<<<<< HEAD
  it('handles various manipulations', function () {
=======
  it('handles various manipulations', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert(math.symbolicEqual('3x', 'x*3'))
    assert(math.symbolicEqual('x*y', 'y*x'))
    assert(math.symbolicEqual('x*y^2', 'y*x*y'))
    assert(math.symbolicEqual('x*(2y - y -y)', '0*z'))
  })

<<<<<<< HEAD
  it('responds to context', function () {
=======
  it('responds to context', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assertFalse(
      math.symbolicEqual('x*y', 'y*x', {
        context: { multiply: { commutative: false } }
      })
    )
    assert(
      math.symbolicEqual('abs(x)', 'x', {
        context: math.simplify.positiveContext
      })
    )
  })
})
