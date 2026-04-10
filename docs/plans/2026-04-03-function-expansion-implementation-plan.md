# Mathematical Function Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Deploy teams of Sonnet agents for parallel implementation, with Opus review gates between phases.

**Goal:** Double math.js's function count from 228 to ~430 core mathematical functions across 9 domains, using the established factory pattern with full test coverage.

> **Historical Note:** This plan was written when the project included WASM/Rust support. TypeScript and WASM acceleration has since been extracted to [MathTS](https://github.com/danielsimonjr/MathTS). This is now a pure JavaScript library. References to WASM, Rust, `src/wasm-rust/`, and `types/index.d.ts` below are historical only.

**Architecture:** Each function is a factory function using `typed-function` for multi-type dispatch. Functions are registered in `src/factoriesAny.js`, embedded docs in `src/expression/embeddedDocs/`, tests in `test/unit-tests/`.

**Tech Stack:** JavaScript (ES modules), typed-function dispatch, mocha test framework, math.js factory pattern

**Design doc:** `docs/plans/2026-04-03-mathematical-function-expansion-roadmap.md`

---

## Multi-Agent Execution Strategy

This plan is designed for **parallel multi-agent execution**. Each domain is independent and can be implemented by a separate Sonnet agent. Opus agents serve as reviewers between phases.

### Agent Assignment

| Agent | Domain | Tasks | Est. Functions |
|-------|--------|-------|---------------|
| Sonnet Agent 1 | Special Functions (Phase 1B) | Tasks 1-6 | 17 |
| Sonnet Agent 2 | Numerical Methods (Phase 1C) | Tasks 7-12 | 20 |
| Sonnet Agent 3 | Linear Algebra (Phase 1C) | Tasks 13-16 | 8 |
| Sonnet Agent 4 | Statistics & Probability (Phase 1D) | Tasks 17-23 | 20 |
| Sonnet Agent 5 | Number Theory (Phase 2F) | Tasks 24-29 | 15 |
| Sonnet Agent 6 | Signal Processing (Phase 2G) | Tasks 30-34 | 10 |
| Sonnet Agent 7 | Optimization (Phase 2H) | Tasks 35-38 | 8 |
| Sonnet Agent 8 | Symbolic Calculus (Phase 2I) | Tasks 39-42 | 8 |
| Opus Reviewer | All | Review gates after each phase | — |

### Review Gates

- **After Phase 1:** Opus reviews all Phase 1 functions for correctness, test coverage, and API consistency
- **After Phase 2:** Same review before merging to master
- **After each agent completes:** Run `npm run test:src` to verify 0 regressions

---

## File Patterns (Read This First)

Every new function requires these files:

### 1. Function Implementation

**Path:** `src/function/<category>/<functionName>.js`

```javascript
import { factory } from '../../utils/factory.js'

const name = 'besselJ'
const dependencies = ['typed']

export const createBesselJ = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Bessel function of the first kind J_n(x).
     *
     * Syntax:
     *
     *    math.besselJ(n, x)
     *
     * Examples:
     *
     *    math.besselJ(0, 1)    // returns 0.7651976865579666
     *    math.besselJ(1, 2.5)  // returns 0.4970941024642743
     *
     * See also:
     *
     *    besselY, besselI, besselK, gamma
     *
     * @param {number} n   The order (integer)
     * @param {number} x   The argument
     * @return {number}    The Bessel function value J_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        return _besselJ(n, x)
      }
    })

    function _besselJ(n, x) {
      // Implementation here
    }
  }
)
```

### 2. Factory Registration

**File:** `src/factoriesAny.js` — Add one line:
```javascript
export { createBesselJ } from './function/special/besselJ.js'
```

### 3. Embedded Docs

**Path:** `src/expression/embeddedDocs/function/<category>/<functionName>.js`

```javascript
export const besselJDocs = {
  name: 'besselJ',
  category: 'Special',
  syntax: ['besselJ(n, x)'],
  description: 'Compute the Bessel function of the first kind J_n(x).',
  examples: ['besselJ(0, 1)', 'besselJ(1, 2.5)'],
  seealso: ['besselY', 'besselI', 'besselK', 'gamma']
}
```

**File:** `src/expression/embeddedDocs/embeddedDocs.js` — Add import and register.

### 4. Test File

**Path:** `test/unit-tests/function/<category>/<functionName>.test.js`

```javascript
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'
const approx = math // for approx.equal

describe('besselJ', function () {
  it('should compute besselJ(0, 0)', function () {
    assert.strictEqual(math.besselJ(0, 0), 1)
  })

  it('should compute besselJ(0, 1)', function () {
    approx.equal(math.besselJ(0, 1), 0.7651976865579666)
  })

  it('should throw for non-integer order', function () {
    assert.throws(function () { math.besselJ(0.5, 1) }, /integer/)
  })

  it('should be evaluated element-wise for matrices', function () {
    // If supported
  })
})
```

### 5. TypeScript Definitions

**File:** `types/index.d.ts` — Add to `MathJsInstance` and `MathJsChain` interfaces.

---

## Phase 1A: Expose Existing WASM Functions (0 new algorithms)

> These functions already exist as Rust WASM exports. We just need JS factory wrappers + tests.

### Task 1: Numerical Integration (3 functions)

**Files:**
- Create: `src/function/numeric/nintegrate.js`
- Create: `src/expression/embeddedDocs/function/numeric/nintegrate.js`
- Create: `test/unit-tests/function/numeric/nintegrate.test.js`
- Modify: `src/factoriesAny.js`
- Modify: `src/expression/embeddedDocs/embeddedDocs.js`

**Functions:** `nintegrate(f, a, b)`, `trapz(y, x)`, `simpsons(f, a, b, n)`

- [ ] **Step 1: Write failing test for nintegrate**

```javascript
// test/unit-tests/function/numeric/nintegrate.test.js
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('nintegrate', function () {
  it('should integrate x^2 from 0 to 1', function () {
    const result = math.nintegrate(function (x) { return x * x }, 0, 1)
    assert(Math.abs(result - 1 / 3) < 1e-10)
  })

  it('should integrate sin(x) from 0 to pi', function () {
    const result = math.nintegrate(Math.sin, 0, Math.PI)
    assert(Math.abs(result - 2) < 1e-10)
  })

  it('should integrate exp(x) from 0 to 1', function () {
    const result = math.nintegrate(Math.exp, 0, 1)
    assert(Math.abs(result - (Math.E - 1)) < 1e-10)
  })

  it('should handle negative intervals', function () {
    const result = math.nintegrate(function (x) { return x }, -1, 1)
    assert(Math.abs(result) < 1e-10)
  })

  it('should throw for non-function first argument', function () {
    assert.throws(function () { math.nintegrate(5, 0, 1) }, /TypeError/)
  })

  it('should integrate with specified tolerance', function () {
    const result = math.nintegrate(Math.sin, 0, Math.PI, { tol: 1e-14 })
    assert(Math.abs(result - 2) < 1e-13)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx mocha test/unit-tests/function/numeric/nintegrate.test.js
```
Expected: FAIL with "math.nintegrate is not a function"

- [ ] **Step 3: Implement nintegrate using adaptive Gauss-Kronrod quadrature**

```javascript
// src/function/numeric/nintegrate.js
import { factory } from '../../utils/factory.js'

const name = 'nintegrate'
const dependencies = ['typed']

export const createNintegrate = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Numerically integrate a function over an interval [a, b]
     * using adaptive Gauss-Kronrod quadrature (7-15 point rule).
     *
     * Syntax:
     *
     *    math.nintegrate(f, a, b)
     *    math.nintegrate(f, a, b, options)
     *
     * Examples:
     *
     *    math.nintegrate(x => x*x, 0, 1)           // 0.3333333333...
     *    math.nintegrate(Math.sin, 0, Math.PI)      // 2
     *    math.nintegrate(Math.exp, 0, 1, {tol: 1e-14})
     *
     * See also:
     *
     *    derivative, solveODE
     *
     * @param {Function} f   The function to integrate
     * @param {number} a     Lower bound
     * @param {number} b     Upper bound
     * @param {Object} [options]  Options: tol (default 1e-10), maxDepth (default 50)
     * @return {number}      The numerical integral
     */
    return typed(name, {
      'function, number, number': function (f, a, b) {
        return _adaptiveQuad(f, a, b, 1e-10, 50, 0)
      },
      'function, number, number, Object': function (f, a, b, options) {
        const tol = options.tol || 1e-10
        const maxDepth = options.maxDepth || 50
        return _adaptiveQuad(f, a, b, tol, maxDepth, 0)
      }
    })

    // Gauss-Kronrod 7-15 point quadrature nodes and weights
    const gkNodes = [
      0.0, 0.20778495500789848, 0.40584515137739717,
      0.58608723546769113, 0.74153118559939444,
      0.86486442335976907, 0.94910791234275852, 0.99145537112081264
    ]
    const gkWeights15 = [
      0.20948214108472783, 0.20443294007529889, 0.19035057806478541,
      0.16900472663926790, 0.14065325971552592, 0.10479001032225018,
      0.06309209262997855, 0.02293532201052922
    ]
    const gkWeights7 = [
      0.41795918367346939, 0.0, 0.38183005050511894,
      0.0, 0.27970539148927664, 0.0,
      0.12948496616886969, 0.0
    ]

    function _gaussKronrod(f, a, b) {
      const mid = (a + b) / 2
      const halfLen = (b - a) / 2
      let result15 = 0
      let result7 = 0

      for (let i = 0; i < gkNodes.length; i++) {
        const x1 = mid + halfLen * gkNodes[i]
        const x2 = mid - halfLen * gkNodes[i]
        const fx1 = f(x1)
        const fx2 = i === 0 ? fx1 : f(x2)
        const fsum = i === 0 ? fx1 : fx1 + fx2

        result15 += gkWeights15[i] * fsum
        result7 += gkWeights7[i] * fsum
      }

      result15 *= halfLen
      result7 *= halfLen

      return { result: result15, error: Math.abs(result15 - result7) }
    }

    function _adaptiveQuad(f, a, b, tol, maxDepth, depth) {
      const { result, error } = _gaussKronrod(f, a, b)

      if (error < tol || depth >= maxDepth) {
        return result
      }

      const mid = (a + b) / 2
      return _adaptiveQuad(f, a, mid, tol / 2, maxDepth, depth + 1) +
             _adaptiveQuad(f, mid, b, tol / 2, maxDepth, depth + 1)
    }
  }
)
```

- [ ] **Step 4: Register in factoriesAny.js**

Add to `src/factoriesAny.js`:
```javascript
export { createNintegrate } from './function/numeric/nintegrate.js'
```

- [ ] **Step 5: Create embedded docs**

```javascript
// src/expression/embeddedDocs/function/numeric/nintegrate.js
export const nintegrateDocs = {
  name: 'nintegrate',
  category: 'Numeric',
  syntax: ['nintegrate(f, a, b)', 'nintegrate(f, a, b, options)'],
  description: 'Numerically integrate a function over an interval using adaptive Gauss-Kronrod quadrature.',
  examples: [
    'f = (x) => x*x',
    'nintegrate(f, 0, 1)',
    'nintegrate(sin, 0, pi)'
  ],
  seealso: ['derivative', 'solveODE']
}
```

Register in `src/expression/embeddedDocs/embeddedDocs.js`:
```javascript
import { nintegrateDocs } from './function/numeric/nintegrate.js'
// ... in the export object:
  nintegrate: nintegrateDocs,
```

- [ ] **Step 6: Run tests to verify all pass**

```bash
npx mocha test/unit-tests/function/numeric/nintegrate.test.js
```
Expected: 6 passing

- [ ] **Step 7: Run full test suite for regressions**

```bash
npx mocha --config .mocharc.js.json test/unit-tests
```
Expected: 6643+ passing, 0 failing

- [ ] **Step 8: Commit**

```bash
git add src/function/numeric/nintegrate.js src/factoriesAny.js \
  src/expression/embeddedDocs/function/numeric/nintegrate.js \
  src/expression/embeddedDocs/embeddedDocs.js \
  test/unit-tests/function/numeric/nintegrate.test.js
git commit -m "feat(numeric): add nintegrate — adaptive Gauss-Kronrod numerical integration"
```

---

### Task 2: Root Finding (2 functions)

**Files:**
- Create: `src/function/numeric/findRoot.js`
- Create: `src/expression/embeddedDocs/function/numeric/findRoot.js`
- Create: `test/unit-tests/function/numeric/findRoot.test.js`
- Modify: `src/factoriesAny.js`
- Modify: `src/expression/embeddedDocs/embeddedDocs.js`

**Functions:** `findRoot(f, x0)`, `findRoot(f, a, b)`

- [ ] **Step 1: Write failing test**

```javascript
// test/unit-tests/function/numeric/findRoot.test.js
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('findRoot', function () {
  it('should find root of x^2 - 4 near x=1', function () {
    const root = math.findRoot(function (x) { return x * x - 4 }, 1)
    assert(Math.abs(root - 2) < 1e-10)
  })

  it('should find root of cos(x) near x=1', function () {
    const root = math.findRoot(Math.cos, 1)
    assert(Math.abs(root - Math.PI / 2) < 1e-10)
  })

  it('should find root in bracket [0, 3] for x^2 - 4', function () {
    const root = math.findRoot(function (x) { return x * x - 4 }, 0, 3)
    assert(Math.abs(root - 2) < 1e-10)
  })

  it('should find root of sin(x) in [3, 4]', function () {
    const root = math.findRoot(Math.sin, 3, 4)
    assert(Math.abs(root - Math.PI) < 1e-10)
  })

  it('should throw when no bracket and diverges', function () {
    assert.throws(function () {
      math.findRoot(function (x) { return x * x + 1 }, 0)
    }, /converge/)
  })

  it('should accept tolerance option', function () {
    const root = math.findRoot(function (x) { return x * x - 2 }, 1, { tol: 1e-14 })
    assert(Math.abs(root - Math.SQRT2) < 1e-13)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx mocha test/unit-tests/function/numeric/findRoot.test.js
```

- [ ] **Step 3: Implement findRoot using Brent's method (bracketed) and Newton's method (unbracketed)**

```javascript
// src/function/numeric/findRoot.js
import { factory } from '../../utils/factory.js'

const name = 'findRoot'
const dependencies = ['typed']

export const createFindRoot = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find a root of a function f(x) = 0.
     *
     * When given two numbers (a, b), uses Brent's method (guaranteed convergence).
     * When given one number (x0), uses Newton's method with numerical derivative.
     *
     * Syntax:
     *
     *    math.findRoot(f, x0)
     *    math.findRoot(f, a, b)
     *    math.findRoot(f, x0, options)
     *
     * Examples:
     *
     *    math.findRoot(x => x*x - 4, 1)        // 2
     *    math.findRoot(Math.cos, 1, 2)          // pi/2
     *
     * See also:
     *
     *    nintegrate, solveODE, derivative
     *
     * @param {Function} f    The function to find the root of
     * @param {number} x0     Initial guess (Newton) or lower bound (Brent)
     * @param {number} [x1]   Upper bound (Brent only)
     * @param {Object} [options]  Options: tol (1e-12), maxIter (100)
     * @return {number}       The root x where f(x) ≈ 0
     */
    return typed(name, {
      'function, number': function (f, x0) {
        return _newton(f, x0, 1e-12, 100)
      },
      'function, number, number': function (f, a, b) {
        return _brent(f, a, b, 1e-12, 100)
      },
      'function, number, Object': function (f, x0, options) {
        return _newton(f, x0, options.tol || 1e-12, options.maxIter || 100)
      }
    })

    function _newton(f, x0, tol, maxIter) {
      let x = x0
      const h = 1e-8
      for (let i = 0; i < maxIter; i++) {
        const fx = f(x)
        if (Math.abs(fx) < tol) return x
        const fpx = (f(x + h) - f(x - h)) / (2 * h)
        if (Math.abs(fpx) < 1e-15) {
          throw new Error('findRoot: derivative near zero, cannot converge')
        }
        x = x - fx / fpx
      }
      throw new Error('findRoot: did not converge after ' + maxIter + ' iterations')
    }

    function _brent(f, a, b, tol, maxIter) {
      let fa = f(a)
      let fb = f(b)
      if (fa * fb > 0) {
        throw new Error('findRoot: f(a) and f(b) must have opposite signs')
      }
      if (Math.abs(fa) < Math.abs(fb)) {
        let tmp = a; a = b; b = tmp
        tmp = fa; fa = fb; fb = tmp
      }
      let c = a, fc = fa, d = b - a, e = d
      for (let i = 0; i < maxIter; i++) {
        if (Math.abs(fb) < tol) return b
        if (Math.abs(b - a) < tol) return b

        let s
        if (fa !== fc && fb !== fc) {
          // Inverse quadratic interpolation
          s = a * fb * fc / ((fa - fb) * (fa - fc)) +
              b * fa * fc / ((fb - fa) * (fb - fc)) +
              c * fa * fb / ((fc - fa) * (fc - fb))
        } else {
          // Secant method
          s = b - fb * (b - a) / (fb - fa)
        }

        // Bisection fallback conditions
        const cond1 = (s - b) * (s - (3 * a + b) / 4) > 0
        const cond2 = Math.abs(s - b) >= Math.abs(e) / 2
        if (cond1 || cond2) {
          s = (a + b) / 2
          e = b - a
        } else {
          e = d
        }

        d = b - s
        c = b; fc = fb
        const fs = f(s)
        if (fa * fs < 0) { b = s; fb = fs }
        else { a = s; fa = fs }

        if (Math.abs(fa) < Math.abs(fb)) {
          let tmp = a; a = b; b = tmp
          tmp = fa; fa = fb; fb = tmp
        }
      }
      return b
    }
  }
)
```

- [ ] **Step 4: Register, create docs, run tests, commit**

Same pattern as Task 1. Register in `factoriesAny.js`, create embedded docs, run tests.

```bash
git commit -m "feat(numeric): add findRoot — Brent's method and Newton's method root finding"
```

---

### Task 3: Interpolation (3 functions)

**Files:**
- Create: `src/function/numeric/interpolate.js`
- Create: `test/unit-tests/function/numeric/interpolate.test.js`
- Modify: `src/factoriesAny.js`

**Functions:** `interpolate(points, x, method)` with methods: 'linear', 'cubic', 'lagrange'

- [ ] **Step 1: Write failing test**

```javascript
// test/unit-tests/function/numeric/interpolate.test.js
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('interpolate', function () {
  const points = [[0, 0], [1, 1], [2, 4], [3, 9]]

  it('should do linear interpolation', function () {
    const result = math.interpolate(points, 1.5, 'linear')
    assert.strictEqual(result, 2.5)
  })

  it('should do lagrange interpolation', function () {
    const result = math.interpolate(points, 1.5, 'lagrange')
    assert(Math.abs(result - 2.25) < 1e-10) // exact for x^2
  })

  it('should default to linear', function () {
    const result = math.interpolate(points, 0.5)
    assert.strictEqual(result, 0.5)
  })

  it('should handle exact data points', function () {
    assert.strictEqual(math.interpolate(points, 2), 4)
  })

  it('should throw for x outside range with linear', function () {
    assert.throws(function () { math.interpolate(points, -1) }, /range/)
  })

  it('should extrapolate with lagrange', function () {
    const result = math.interpolate(points, 4, 'lagrange')
    assert(Math.abs(result - 16) < 1e-10)
  })
})
```

- [ ] **Steps 2-8:** Same pattern — implement, register, docs, test, commit.

```bash
git commit -m "feat(numeric): add interpolate — linear and Lagrange interpolation"
```

---

### Task 4: Bessel Functions (4 functions)

**Files:**
- Create: `src/function/special/besselJ.js`
- Create: `src/function/special/besselY.js`
- Create: `src/function/special/besselI.js`
- Create: `src/function/special/besselK.js`
- Create: `test/unit-tests/function/special/besselJ.test.js`
- Create: `test/unit-tests/function/special/besselY.test.js`
- Create: `test/unit-tests/function/special/besselI.test.js`
- Create: `test/unit-tests/function/special/besselK.test.js`
- Modify: `src/factoriesAny.js`

- [ ] **Step 1: Write failing tests for besselJ**

```javascript
// test/unit-tests/function/special/besselJ.test.js
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('besselJ', function () {
  it('should compute J_0(0) = 1', function () {
    assert.strictEqual(math.besselJ(0, 0), 1)
  })

  it('should compute J_0(1)', function () {
    assert(Math.abs(math.besselJ(0, 1) - 0.7651976865579666) < 1e-12)
  })

  it('should compute J_1(1)', function () {
    assert(Math.abs(math.besselJ(1, 1) - 0.44005058574493355) < 1e-12)
  })

  it('should compute J_0(5)', function () {
    assert(Math.abs(math.besselJ(0, 5) - (-0.17759677131433830)) < 1e-12)
  })

  it('should compute J_2(3)', function () {
    assert(Math.abs(math.besselJ(2, 3) - 0.48609126058589108) < 1e-12)
  })

  it('should compute J_n(0) = 0 for n > 0', function () {
    assert.strictEqual(math.besselJ(1, 0), 0)
    assert.strictEqual(math.besselJ(5, 0), 0)
  })

  it('should handle negative x with J_n(-x) = (-1)^n * J_n(x)', function () {
    const j0pos = math.besselJ(0, 3)
    const j0neg = math.besselJ(0, -3)
    assert(Math.abs(j0pos - j0neg) < 1e-12)
  })

  it('should handle large order', function () {
    const result = math.besselJ(10, 10)
    assert(Math.abs(result - 0.20748610663335885) < 1e-10)
  })

  it('should throw for non-integer order', function () {
    // For now, only integer orders supported
    assert.throws(function () { math.besselJ(0.5, 1) }, /integer/)
  })
})
```

- [ ] **Step 2: Implement besselJ using Miller's backward recurrence**

```javascript
// src/function/special/besselJ.js
import { factory } from '../../utils/factory.js'

const name = 'besselJ'
const dependencies = ['typed']

export const createBesselJ = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n)) {
          throw new TypeError('besselJ: order n must be an integer')
        }
        n = Math.abs(n)
        if (x === 0) return n === 0 ? 1 : 0
        if (n === 0) return _besselJ0(x)
        if (n === 1) return _besselJ1(x)
        return _besselJn(n, x)
      }
    })

    // Rational approximation for J0(x) — Abramowitz & Stegun
    function _besselJ0(x) {
      x = Math.abs(x)
      if (x < 8) {
        const y = x * x
        const r1 = 57568490574.0 + y * (-13362590354.0 + y * (651619640.7 +
          y * (-11214424.18 + y * (77392.33017 + y * (-184.9052456)))))
        const r2 = 57568490411.0 + y * (1029532985.0 + y * (9494680.718 +
          y * (59272.64853 + y * (267.8532712 + y * 1.0))))
        return r1 / r2
      }
      const z = 8.0 / x
      const y = z * z
      const xx = x - 0.785398164
      const p0 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 +
        y * (-0.2073370639e-5 + y * 0.2093887211e-6)))
      const q0 = -0.1562499995e-1 + y * (0.1430488765e-3 +
        y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)))
      return Math.sqrt(0.636619772 / x) * (p0 * Math.cos(xx) - z * q0 * Math.sin(xx))
    }

    // Rational approximation for J1(x)
    function _besselJ1(x) {
      const sign = x < 0 ? -1 : 1
      x = Math.abs(x)
      if (x < 8) {
        const y = x * x
        const r1 = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 +
          y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))))
        const r2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 +
          y * (99447.43394 + y * (376.9991397 + y * 1.0))))
        return sign * r1 / r2
      }
      const z = 8.0 / x
      const y = z * z
      const xx = x - 2.356194491
      const p1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 +
        y * (0.2457520174e-5 + y * (-0.240337019e-6))))
      const q1 = 0.04687499995 + y * (-0.2002690873e-3 +
        y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)))
      return sign * Math.sqrt(0.636619772 / x) * (p1 * Math.cos(xx) - z * q1 * Math.sin(xx))
    }

    // Miller's backward recurrence for J_n(x), n >= 2
    function _besselJn(n, x) {
      const ACC = 160
      const BIGNO = 1e10
      const BIGNI = 1e-10
      const sign = (n < 0 && n % 2 !== 0) ? -1 : 1

      const ax = Math.abs(x)
      if (ax === 0) return 0

      if (ax > n) {
        // Forward recurrence
        let bjm = _besselJ0(ax)
        let bj = _besselJ1(ax)
        for (let j = 1; j < n; j++) {
          const bjp = (2 * j / ax) * bj - bjm
          bjm = bj
          bj = bjp
        }
        return sign * (x < 0 && n % 2 !== 0 ? -bj : bj)
      }

      // Backward recurrence (Miller's algorithm)
      const m = 2 * Math.floor((n + Math.floor(Math.sqrt(ACC * n))) / 2)
      let jsum = false
      let bjp = 0
      let bj = 1
      let sum = 0
      let ans = 0

      for (let j = m; j > 0; j--) {
        const bjm = (2 * j / ax) * bj - bjp
        bjp = bj
        bj = bjm
        if (Math.abs(bj) > BIGNO) {
          bj *= BIGNI
          bjp *= BIGNI
          ans *= BIGNI
          sum *= BIGNI
        }
        if (jsum) sum += bj
        jsum = !jsum
        if (j === n) ans = bjp
      }

      sum = 2 * sum - bj
      ans /= sum
      return sign * (x < 0 && n % 2 !== 0 ? -ans : ans)
    }
  }
)
```

- [ ] **Steps 3-8:** Register, docs, test, commit. Then repeat for besselY, besselI, besselK (similar pattern with different rational approximations).

```bash
git commit -m "feat(special): add besselJ — Bessel function of the first kind"
```

---

### Task 5: Beta Function and Incomplete Gamma (4 functions)

**Files:**
- Create: `src/function/special/beta.js`
- Create: `src/function/special/betainc.js`
- Create: `src/function/special/gammainc.js`
- Create: `test/unit-tests/function/special/beta.test.js`
- Create: `test/unit-tests/function/special/gammainc.test.js`
- Modify: `src/factoriesAny.js`

**Functions:** `beta(a, b)`, `betainc(x, a, b)`, `gammainc(a, x)`, `gammaincp(a, x)`

- [ ] **Step 1: Write failing tests**

```javascript
// test/unit-tests/function/special/beta.test.js
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('beta', function () {
  it('should compute beta(1, 1) = 1', function () {
    assert.strictEqual(math.beta(1, 1), 1)
  })

  it('should compute beta(2, 3) = 1/12', function () {
    assert(Math.abs(math.beta(2, 3) - 1 / 12) < 1e-12)
  })

  it('should satisfy beta(a,b) = gamma(a)*gamma(b)/gamma(a+b)', function () {
    const a = 3, b = 4
    const expected = math.gamma(a) * math.gamma(b) / math.gamma(a + b)
    assert(Math.abs(math.beta(a, b) - expected) < 1e-10)
  })

  it('should compute beta(0.5, 0.5) = pi', function () {
    assert(Math.abs(math.beta(0.5, 0.5) - Math.PI) < 1e-10)
  })
})
```

- [ ] **Steps 2-8:** Implement using `beta(a,b) = exp(lgamma(a) + lgamma(b) - lgamma(a+b))`, register, test, commit.

---

### Task 6: Digamma and Error Function Variants (4 functions)

**Functions:** `digamma(x)`, `erfc(x)`, `erfi(x)`, `fresnelS(x)`

Same pattern — one file per function, full test coverage, factory registration.

---

### Task 7: SVD Decomposition

**Files:**
- Create: `src/function/matrix/svd.js`
- Create: `test/unit-tests/function/matrix/svd.test.js`
- Modify: `src/factoriesAny.js`

- [ ] **Step 1: Write failing test**

```javascript
// test/unit-tests/function/matrix/svd.test.js
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('svd', function () {
  it('should compute SVD of a 2x2 matrix', function () {
    const A = [[3, 2], [2, 3]]
    const { U, S, V } = math.svd(A)
    // Verify A = U * diag(S) * V^T
    const reconstructed = math.multiply(math.multiply(U, math.diag(S)), math.transpose(V))
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        assert(Math.abs(reconstructed[i][j] - A[i][j]) < 1e-10)
      }
    }
  })

  it('should return singular values in descending order', function () {
    const A = [[1, 2], [3, 4], [5, 6]]
    const { S } = math.svd(A)
    assert(S[0] >= S[1])
  })

  it('should handle identity matrix', function () {
    const { S } = math.svd([[1, 0], [0, 1]])
    assert(Math.abs(S[0] - 1) < 1e-10)
    assert(Math.abs(S[1] - 1) < 1e-10)
  })

  it('should compute rank from SVD', function () {
    const { S } = math.svd([[1, 2], [2, 4]]) // rank 1
    assert(S[1] < 1e-10) // second singular value near 0
  })
})
```

- [ ] **Steps 2-8:** Implement using Golub-Kahan bidiagonalization, register, test, commit.

---

### Tasks 8-12: More Numerical Methods

Same pattern for: `curvefit`, `linsolve`, `rank`, `nullspace`, `cond`

---

### Tasks 13-16: Linear Algebra Additions

Same pattern for: `svd`, `rank`, `nullspace`, `matrixLog`

---

### Tasks 17-23: Statistics & Probability

**Key design decision:** Distribution objects return objects with `pdf`, `cdf`, `icdf` methods:

```javascript
const dist = math.normalDist(0, 1)
dist.pdf(0)     // 0.3989...
dist.cdf(1.96)  // 0.975
dist.icdf(0.975) // 1.96
```

**Functions:** `normalDist`, `tDist`, `chiSquaredDist`, `poissonDist`, `binomialDist`, `skewness`, `kurtosis`, `covariance`, `linreg`, `movingAverage`

---

### Tasks 24-29: Number Theory (Phase 2F)

**Functions:** `nextPrime`, `nthPrime`, `factorInteger`, `eulerPhi`, `fibonacci`, `divisors`, `chineseRemainder`

---

### Tasks 30-34: Signal Processing (Phase 2G)

**Functions:** `convolve`, `correlate`, `spectrogram`, `windowFunction`, `powerSpectralDensity`

---

### Tasks 35-38: Optimization (Phase 2H)

**Functions:** `minimize`, `linearProgram`, `leastSquares`, `quadraticProgram`

---

### Tasks 39-42: Symbolic Calculus (Phase 2I)

**Functions:** `integrate` (symbolic), `limit`, `taylor`, `partialFractions`

---

## Verification Checklist

After all tasks complete, verify:

- [ ] `npx mocha --config .mocharc.js.json test/unit-tests` — 0 failing
- [ ] Every new function has: implementation, factory registration, embedded docs, test file
- [ ] Every test file has: positive cases, edge cases, error cases, type checking
- [ ] `types/index.d.ts` updated for all new functions
- [ ] No circular dependencies introduced
- [ ] All functions work in expression parser: `math.evaluate('besselJ(0, 1)')`

---

## Summary

| Phase | Tasks | Functions | Agent Strategy |
|-------|-------|----------|---------------|
| 1A: Expose WASM | 1-3 | 8 | 1 Sonnet agent |
| 1B: Special functions | 4-6 | 17 | 1 Sonnet agent |
| 1C: Numerical + LA | 7-16 | 28 | 2 Sonnet agents |
| 1D: Statistics | 17-23 | 20 | 1 Sonnet agent |
| 2F: Number theory | 24-29 | 15 | 1 Sonnet agent |
| 2G: Signal processing | 30-34 | 10 | 1 Sonnet agent |
| 2H: Optimization | 35-38 | 8 | 1 Sonnet agent |
| 2I: Symbolic calculus | 39-42 | 8 | 1 Sonnet agent |
| **Total** | **42 tasks** | **~114 functions** | **8 Sonnet + 1 Opus** |

**Note:** This plan covers the first ~114 highest-priority functions. The remaining ~90 (Phase 3: graph theory, exotic special functions, advanced numerical methods) should be planned separately when Phase 2 is complete.
