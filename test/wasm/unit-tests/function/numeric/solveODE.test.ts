/**
 * Test for solveODE - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import { approxDeepEqual } from '../../../../tools/approx.js'

const solveODE = math.solveODE
const matrix = math.matrix
const add = math.add
const subtract = math.subtract
const exp = math.exp
const min = math.min
const max = math.max
const tol = 1e-3
const smallerEq = math.smallerEq
const largerEq = math.largerEq
const multiply = math.multiply
const dotMultiply = math.dotMultiply
const divide = math.divide
const diff = math.diff
const unit = math.unit
const map = math.map
const transpose = math.transpose
const isMatrix = math.isMatrix
const bignumber = math.bignumber
const number = math.number

describe('solveODE', function (): void {
  function f(t, y) {
    return subtract(y, t)
  }
  function exactSol(T, y0) {
    return add(
      dotMultiply(subtract(y0, 1), map(transpose([T]), exp)),
      transpose([T]),
      1
    )
  } // this is only valid for y' = y - t
  const tspan = [0, 4]
  const y0 = [1.5, 2]

  it('should throw an error if the first argument is not a function', function (): void {
    assert.throws(function (): void {
      solveODE('notAFunction', tspan, y0)
    }, /TypeError: Unexpected type of argument in function solveODE \(expected: function.*/)
  })

  it('should throw an error if the second argument is not an array like', function (): void {
    assert.throws(function (): void {
      solveODE(f, 'NotAnArrayLike', y0)
    }, /TypeError: Unexpected type of argument in function solveODE \(expected: Array or Matrix,.*/)
  })

  it('should throw an error if the second argument does not have a second member', function (): void {
    assert.throws(function (): void {
      const wrongTSpan = [tspan[0]]
      solveODE(f, wrongTSpan, y0)
    }, /Error: "tspan" must be an Array of two numeric values.*/)
  })

  it('should throw an error if the name of the method is wrong', function (): void {
    assert.throws(function (): void {
      const method = 'wrongMethodName'
      solveODE(f, tspan, y0, { method })
    }, /Unavailable method.*/)
  })

  it('should throw an error if the maximum number of iterations is reached', function (): void {
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { maxIter: 1 })
    }, /Maximum number of iterations reached.*/)
  })

  it('should throw an error if the firstStep is not positive', function (): void {
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { firstStep: -1 })
    }, /"firstStep" must be positive/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { firstStep: 0 })
    }, /"firstStep" must be positive/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { firstStep: unit(-1, 's') })
    }, /"firstStep" must be positive/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { firstStep: unit(0, 's') })
    }, /"firstStep" must be positive/)
  })

  it('should throw an error if the minStep is not positive or zero', function (): void {
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { minStep: -1 })
    }, /"minStep" must be positive or zero/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { minStep: unit(-1, 's') })
    }, /"minStep" must be positive or zero/)
  })

  it('should solve when minStep is zero', function (): void {
    const sol = solveODE(f, tspan, y0, { minStep: 0 })
    approxDeepEqual(sol.y, exactSol(sol.t, y0), tol)
    const seconds = unit('s')
    const meters = unit('m')
    function fWithUnits(t, y) {
      return subtract(
        divide(y, seconds),
        multiply(t, divide(meters, multiply(seconds, seconds)))
      )
    }
    const tspanWithUnits = multiply(tspan, seconds)
    const y0withUnits = multiply(y0, meters)
    const solU = solveODE(fWithUnits, tspanWithUnits, y0withUnits, {
      minStep: unit(0, 's')
    })
    approxDeepEqual(
      divide(solU.y, meters),
      exactSol(divide(solU.t, seconds), y0),
      tol
    )
  })

  it('should throw an error if the maxStep is not positive', function (): void {
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { maxStep: -1 })
    }, /"maxStep" must be positive/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { maxStep: 0 })
    }, /"maxStep" must be positive/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { maxStep: unit(-1, 's') })
    }, /"maxStep" must be positive/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { maxStep: unit(0, 's') })
    }, /"maxStep" must be positive/)
  })

  it('should throw an error if the time dependant variables do not match', function (): void {
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { firstStep: unit(1, 's') })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, [unit(tspan[0], 's'), unit(tspan[1], 's')], y0, {
        maxStep: unit(2, 's'),
        firstStep: 1
      })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { firstStep: unit(1, 's') })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, [unit(tspan[0], 's'), unit(tspan[1], 's')], y0, {
        firstStep: 1
      })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { maxStep: unit(1, 's') })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, [unit(tspan[0], 's'), unit(tspan[1], 's')], y0, {
        maxStep: 1
      })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, tspan, y0, { minStep: unit(1, 's') })
    }, /Inconsistent type of "t" dependant variables/)
    assert.throws(function (): void {
      solveODE(f, [unit(tspan[0], 's'), unit(tspan[1], 's')], y0, {
        minStep: 1
      })
    }, /Inconsistent type of "t" dependant variables/)
  })

  it('should solve close to the analytical solution', function (): void {
    const sol = solveODE(f, tspan, y0)
    approxDeepEqual(sol.y, exactSol(sol.t, y0), tol)
  })

  it('should solve backwards', function (): void {
    const exactSolEnd = exactSol([4], y0)[0]
    const sol = solveODE(f, [tspan[1], tspan[0]], exactSolEnd)
    approxDeepEqual(sol.y, exactSol(sol.t, sol.y[sol.y.length - 1]), tol)
  })

  it('should solve if the arguments are matrices', function (): void {
    const sol = solveODE(f, matrix(tspan), matrix(y0))
    approxDeepEqual(sol.y, matrix(exactSol(sol.t, y0)), tol)
    assert.deepStrictEqual(isMatrix(sol.t) && isMatrix(sol.y), true)
  })

  it('should solve if the arguments have bignumbers', function (): void {
    const sol = solveODE(f, bignumber(tspan), bignumber(y0))
    approxDeepEqual(number(sol.y), exactSol(number(sol.t), y0), tol)
  })

  it('should solve with options even if they are empty', function (): void {
    const options = {}
    const sol = solveODE(f, tspan, y0, options)
    approxDeepEqual(sol.y, exactSol(sol.t, y0), tol)
  })

  it('should solve when y0 is a scalar', function (): void {
    const sol = solveODE(f, tspan, y0[0])
    approxDeepEqual(
      sol.y,
      exactSol(sol.t, [y0[0]]).map((x) => x[0]),
      tol
    )
  })

  it('should solve with units', function (): void {
    const seconds = unit('s')
    const meters = unit('m')
    function fWithUnits(t, y) {
      return subtract(
        divide(y, seconds),
        multiply(t, divide(meters, multiply(seconds, seconds)))
      )
    }
    const tspanWithUnits = multiply(tspan, seconds)
    const y0withUnits = multiply(y0, meters)
    const sol = solveODE(fWithUnits, tspanWithUnits, y0withUnits)
    approxDeepEqual(
      divide(sol.y, meters),
      exactSol(divide(sol.t, seconds), y0),
      tol
    )
  })

  it('should solve close to the analytical solution with RK23 method', function (): void {
    const sol = solveODE(f, tspan, y0, { method: 'RK23' })
    approxDeepEqual(sol.y, exactSol(sol.t, y0), tol)
  })

  it('should solve close to the analytical solution with RK45 method', function (): void {
    const sol = solveODE(f, tspan, y0, { method: 'RK45' })
    approxDeepEqual(sol.y, exactSol(sol.t, y0), tol)
  })

  it('should solve with method name in lower case', function (): void {
    const sol = solveODE(f, tspan, y0, { method: 'rk45' })
    approxDeepEqual(sol.y, exactSol(sol.t, y0), tol)
  })

  it('should solve with few steps if a higher tolerance is specified', function (): void {
    const sol = solveODE(f, tspan, y0, { method: 'RK45', tol: 1e-2 })
    assert.deepStrictEqual(smallerEq(sol.y.length, 6), true)
  })

  it('should respect maxStep', function (): void {
    const maxStep = 0.4
    const sol = solveODE(f, tspan, y0, { maxStep })
    assert.deepStrictEqual(smallerEq(max(diff(sol.t)), maxStep), true)
  })

  it('should respect minStep', function (): void {
    const minStep = 0.1
    const sol = solveODE(f, tspan, y0, { minStep })
    assert.deepStrictEqual(
      // slicing to exclude the last step
      largerEq(min(diff(sol.t.slice(0, sol.t.length - 1))), minStep),
      true
    )
  })

  it('should respect first step', function (): void {
    const firstStep = 0.1
    const sol = solveODE(f, tspan, y0, { firstStep })
    assert.deepStrictEqual(subtract(sol.t[1], sol.t[0]), firstStep)
  })
})
