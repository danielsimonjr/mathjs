import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as allFactories from '../../../../src/factoriesAny.js'

const math = create(allFactories)

describe('solvePDE', function () {
  // Heat equation: du/dt = d²u/dx², u(0,t)=0, u(1,t)=0, u(x,0)=sin(pi*x)
  // Exact solution: u(x,t) = exp(-pi^2 * t) * sin(pi*x)
  const heatRHS = (t, u, x, dx) => {
    const n = u.length
    const dudt = new Array(n).fill(0)
    // Interior points: second-order finite difference
    for (let i = 1; i < n - 1; i++) {
      dudt[i] = (u[i + 1] - 2 * u[i] + u[i - 1]) / (dx * dx)
    }
    // Boundary conditions: dudt[0] = dudt[n-1] = 0 (Dirichlet, already zero)
    return dudt
  }

  const u0Fn = (x) => Math.sin(Math.PI * x)

  describe('basic structure', function () {
    it('should return object with x, t, u', function () {
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.01], u0Fn, { nx: 10, nSteps: 10 })
      assert.ok(result.x, 'should have x')
      assert.ok(result.t, 'should have t')
      assert.ok(result.u, 'should have u')
      assert.ok(Array.isArray(result.x))
      assert.ok(Array.isArray(result.t))
      assert.ok(Array.isArray(result.u))
    })

    it('should have correct spatial grid size', function () {
      const nx = 15
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.01], u0Fn, { nx, nSteps: 5 })
      assert.strictEqual(result.x.length, nx)
    })

    it('should start at x0=0 and end at xf=1', function () {
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.01], u0Fn, { nx: 10, nSteps: 5 })
      assert.ok(Math.abs(result.x[0] - 0) < 1e-10)
      assert.ok(Math.abs(result.x[result.x.length - 1] - 1) < 1e-10)
    })

    it('should have nSteps+1 time snapshots', function () {
      const nSteps = 20
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.01], u0Fn, { nx: 10, nSteps })
      assert.strictEqual(result.t.length, nSteps + 1)
      assert.strictEqual(result.u.length, nSteps + 1)
    })
  })

  describe('heat equation accuracy', function () {
    it('should satisfy initial condition', function () {
      const nx = 20
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.01], u0Fn, { nx, nSteps: 10 })
      const u_init = result.u[0]
      for (let i = 0; i < nx; i++) {
        const expected = u0Fn(result.x[i])
        assert.ok(
          Math.abs(u_init[i] - expected) < 1e-10,
          `u(x[${i}],0) = ${u_init[i]}, expected ${expected}`
        )
      }
    })

    it('should respect Dirichlet boundary conditions (u=0 at boundaries)', function () {
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.05], u0Fn, { nx: 20, nSteps: 50 })
      for (const u_t of result.u) {
        assert.ok(Math.abs(u_t[0]) < 1e-10, `u(0,t) should be 0, got ${u_t[0]}`)
        assert.ok(Math.abs(u_t[u_t.length - 1]) < 1e-10,
          `u(1,t) should be 0, got ${u_t[u_t.length - 1]}`)
      }
    })

    it('should decay as solution evolves', function () {
      // At t=0 max is ~1, at t=0.1 max should be less (exp(-pi^2*0.1) ~ 0.372)
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.1], u0Fn, { nx: 30, nSteps: 200 })
      const maxInit = Math.max(...result.u[0].map(Math.abs))
      const maxFinal = Math.max(...result.u[result.u.length - 1].map(Math.abs))
      assert.ok(maxFinal < maxInit, `solution should decay: max went from ${maxInit} to ${maxFinal}`)
      // Check decay rate is approximately correct
      const expectedDecay = Math.exp(-Math.PI * Math.PI * 0.1)
      assert.ok(
        Math.abs(maxFinal / maxInit - expectedDecay) < 0.05,
        `decay rate should be ~${expectedDecay.toFixed(4)}, got ${(maxFinal / maxInit).toFixed(4)}`
      )
    })
  })

  describe('array initial condition', function () {
    it('should accept array u0', function () {
      const nx = 10
      const u0Arr = Array.from({ length: nx }, (_, i) => Math.sin(Math.PI * i / (nx - 1)))
      const result = math.solvePDE(heatRHS, [0, 1], [0, 0.01], u0Arr, { nx, nSteps: 5 })
      assert.ok(result.u.length > 0)
    })

    it('should throw when array u0 length mismatches nx', function () {
      assert.throws(
        () => math.solvePDE(heatRHS, [0, 1], [0, 0.01], [1, 2, 3], { nx: 10, nSteps: 5 }),
        /u0.*nx|nx.*u0/i
      )
    })
  })
})
