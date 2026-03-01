/**
 * Test for symbolicEqual - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

function assertFalse(val: boolean): void {
  assert(!val)
}

describe('symbolicEqual', function (): void {
  it('relates anything to itself', function (): void {
    assert(math.symbolicEqual('x', 'x'))
    assert(math.symbolicEqual('foo(x)', 'foo(x)'))
  })

  it('does not relate different variables', function (): void {
    assertFalse(math.symbolicEqual('x', 'y'))
    assertFalse(math.symbolicEqual('foo(x)+bar(x)', 'foo(x)+bar(y)'))
  })

  it('handles various manipulations', function (): void {
    assert(math.symbolicEqual('3x', 'x*3'))
    assert(math.symbolicEqual('x*y', 'y*x'))
    assert(math.symbolicEqual('x*y^2', 'y*x*y'))
    assert(math.symbolicEqual('x*(2y - y -y)', '0*z'))
  })

  it('responds to context', function (): void {
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
