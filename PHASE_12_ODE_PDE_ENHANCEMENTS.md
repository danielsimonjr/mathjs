# Phase 12: ODE/PDE Enhancements

**Technical Implementation Guide**

This document provides detailed algorithms, pseudocode, and numerical considerations for implementing advanced ODE/PDE solvers in TypeScript/WASM, including stiff systems, differential-algebraic equations, boundary value problems, and partial differential equations.

---

## 1. BDF Methods (Backward Differentiation Formulas)

**Goal**: Solve stiff ODEs y' = f(t, y) using implicit multistep methods with order 1-6
- A-stable for orders 1-2, A(α)-stable for orders 3-6
- Optimal for stiff problems where explicit methods require tiny time steps

### BDF Coefficients

BDF-k approximates y'(t_n) using k+1 points: y_n, y_{n-1}, ..., y_{n-k}

```
y'(t_n) ≈ (1/h) Σᵢ₌₀ᵏ αᵢ y_{n-i} = f(t_n, y_n)
```

**Coefficient Table**:
```typescript
const BDF_COEFFICIENTS = {
  1: { alpha: [1, -1], beta: 1 },              // α₀y_n - α₁y_{n-1} = h·f_n
  2: { alpha: [3/2, -2, 1/2], beta: 2/3 },     // Trapezoidal-like
  3: { alpha: [11/6, -3, 3/2, -1/3], beta: 6/11 },
  4: { alpha: [25/12, -4, 3, -4/3, 1/4], beta: 12/25 },
  5: { alpha: [137/60, -5, 5, -10/3, 5/4, -1/5], beta: 60/137 },
  6: { alpha: [147/60, -6, 15/2, -20/3, 15/4, -6/5, 1/6], beta: 60/147 }
}
```

### Algorithm: Variable-Order Variable-Step BDF

```typescript
interface BDFState {
  t: number           // Current time
  y: Vector           // Current solution
  h: number           // Step size
  order: number       // Current order (1-6)
  history: Vector[]   // [y_n, y_{n-1}, ..., y_{n-k}]
}

function bdfSolve(
  f: (t: number, y: Vector) => Vector,
  tspan: [number, number],
  y0: Vector,
  options: {
    order?: number        // Fixed order (1-6) or adaptive
    rtol?: number        // Relative tolerance (default: 1e-3)
    atol?: number        // Absolute tolerance (default: 1e-6)
    maxStep?: number
    jacobian?: (t: number, y: Vector) => Matrix  // Optional Jacobian
  } = {}
): { t: number[], y: Vector[] } {

  const { order = 2, rtol = 1e-3, atol = 1e-6 } = options
  const [t0, tf] = tspan

  // Initialize with lower-order method
  const state = initializeBDF(f, t0, y0, order)
  const solution = { t: [t0], y: [y0.clone()] }

  while (state.t < tf) {
    // Predict step size and order
    const { h, k } = selectStepAndOrder(state, rtol, atol)

    // Solve implicit BDF equation via Newton iteration
    const result = bdfStep(f, state, h, k, options)

    if (result.success) {
      // Accept step
      state.t += h
      state.y = result.y
      state.h = h
      state.order = k
      updateHistory(state, result.y)

      solution.t.push(state.t)
      solution.y.push(result.y.clone())

      // Adapt step size for next iteration
      state.h = result.suggestedStep
    } else {
      // Reject step, reduce h
      state.h *= 0.5
    }
  }

  return solution
}

function bdfStep(
  f: (t: number, y: Vector) => Vector,
  state: BDFState,
  h: number,
  order: number,
  options: { jacobian?, rtol, atol, maxIter?: number }
): { success: boolean, y?: Vector, suggestedStep: number } {

  const { alpha, beta } = BDF_COEFFICIENTS[order]
  const { rtol, atol, maxIter = 10 } = options

  // BDF equation: α₀·y_n - Σᵢ₌₁ᵏ αᵢ·y_{n-i} = h·β·f(t_n, y_n)
  // Rearranged: G(y_n) = y_n - h·β·f(t_n, y_n) - (1/α₀)·Σᵢ₌₁ᵏ αᵢ·y_{n-i} = 0

  const t_new = state.t + h
  const invAlpha0 = 1 / alpha[0]

  // Compute predictor (explicit extrapolation)
  let y_pred = predictorStep(state, h, order)

  // Newton iteration: solve G(y_n) = 0
  let y_curr = y_pred.clone()

  for (let iter = 0; iter < maxIter; iter++) {
    // Evaluate residual: G(y) = y - h·β·f(t, y) - Σ terms
    const f_val = f(t_new, y_curr)

    let sumHistory = Vector.zeros(y_curr.size)
    for (let i = 1; i <= order; i++) {
      sumHistory = sumHistory.add(state.history[i-1].scale(alpha[i]))
    }

    const G = y_curr
      .subtract(f_val.scale(h * beta))
      .subtract(sumHistory.scale(invAlpha0))

    // Check convergence
    const error = computeError(G, y_curr, rtol, atol)
    if (error < 1.0) {
      // Converged
      return {
        success: true,
        y: y_curr,
        suggestedStep: adaptStepSize(h, error, order)
      }
    }

    // Compute Jacobian: J = I - h·β·∂f/∂y
    const J = computeJacobian(f, t_new, y_curr, h * beta, options.jacobian)

    // Newton update: J·Δy = -G
    const delta = J.solve(G.scale(-1))
    y_curr = y_curr.add(delta)

    // Check for divergence
    if (delta.norm() > 10 * y_curr.norm()) {
      return { success: false, suggestedStep: h * 0.5 }
    }
  }

  // Failed to converge
  return { success: false, suggestedStep: h * 0.5 }
}

function computeJacobian(
  f: (t: number, y: Vector) => Vector,
  t: number,
  y: Vector,
  factor: number,  // h·β
  jacobianFn?: (t: number, y: Vector) => Matrix
): Matrix {
  const n = y.size

  if (jacobianFn) {
    // Use provided analytical Jacobian
    const J_f = jacobianFn(t, y)
    return Matrix.identity(n).subtract(J_f.scale(factor))
  } else {
    // Finite difference approximation
    const eps = Math.sqrt(Number.EPSILON)
    const J = Matrix.zeros(n, n)
    const f0 = f(t, y)

    for (let j = 0; j < n; j++) {
      const y_pert = y.clone()
      const h = eps * Math.max(Math.abs(y.get(j)), 1.0)
      y_pert.set(j, y.get(j) + h)

      const f_pert = f(t, y_pert)
      const df = f_pert.subtract(f0).scale(1 / h)

      for (let i = 0; i < n; i++) {
        J.set(i, j, -factor * df.get(i))
      }
    }

    // Add identity
    for (let i = 0; i < n; i++) {
      J.set(i, i, J.get(i, i) + 1)
    }

    return J
  }
}

function predictorStep(state: BDFState, h: number, order: number): Vector {
  // Explicit extrapolation using previous points
  // Simple predictor: linear extrapolation
  if (order === 1 || state.history.length < 2) {
    return state.history[0]  // Use previous value
  }

  // Polynomial extrapolation through previous points
  const dy = state.history[0].subtract(state.history[1]).scale(1 / state.h)
  return state.history[0].add(dy.scale(h))
}

function computeError(
  residual: Vector,
  y: Vector,
  rtol: number,
  atol: number
): number {
  // Weighted error norm
  let error = 0
  for (let i = 0; i < y.size; i++) {
    const scale = atol + rtol * Math.abs(y.get(i))
    const e = residual.get(i) / scale
    error += e * e
  }
  return Math.sqrt(error / y.size)
}

function adaptStepSize(h: number, error: number, order: number): number {
  // PI controller for step size
  const safety = 0.9
  const factor = safety * Math.pow(1 / error, 1 / (order + 1))
  const maxFactor = 2.0
  const minFactor = 0.5

  return h * Math.max(minFactor, Math.min(maxFactor, factor))
}

function initializeBDF(
  f: (t: number, y: Vector) => Vector,
  t0: number,
  y0: Vector,
  targetOrder: number
): BDFState {
  // Bootstrap with RK4 or lower-order BDF
  const h0 = 0.01  // Initial small step
  const history = [y0]

  // Generate k-1 starting values using RK4
  let t = t0
  let y = y0.clone()

  for (let i = 0; i < targetOrder - 1; i++) {
    y = rk4Step(f, t, y, h0)
    t += h0
    history.unshift(y.clone())
  }

  return {
    t: t0,
    y: y0,
    h: h0,
    order: 1,
    history
  }
}
```

### Numerical Stability

- **BDF-1 (Backward Euler)**: A-stable, strongly damped, order 1
- **BDF-2**: A-stable, optimal for moderately stiff problems, order 2
- **BDF-3 to BDF-6**: A(α)-stable, best for highly stiff systems
- **Order > 6**: Unstable (zero-stability violated)

**Stiffness Ratio**: If max|λ|·h >> 1 (eigenvalues of Jacobian), use BDF

---

## 2. Adams-Bashforth-Moulton (ABM) Predictor-Corrector

**Goal**: Solve non-stiff ODEs y' = f(t, y) using explicit-implicit pair
- Adams-Bashforth (AB): Explicit predictor, efficient
- Adams-Moulton (AM): Implicit corrector, more accurate

### Adams Coefficients

**Adams-Bashforth (Explicit)**:
```
y_{n+1} = y_n + h·Σᵢ₌₀ᵏ⁻¹ βᵢ·f_{n-i}
```

```typescript
const AB_COEFFICIENTS = {
  1: [1],                                    // Forward Euler
  2: [3/2, -1/2],                           // AB2
  3: [23/12, -16/12, 5/12],                 // AB3
  4: [55/24, -59/24, 37/24, -9/24],         // AB4
  5: [1901/720, -2774/720, 2616/720, -1274/720, 251/720]  // AB5
}
```

**Adams-Moulton (Implicit)**:
```
y_{n+1} = y_n + h·Σᵢ₌₀ᵏ γᵢ·f_{n+1-i}
```

```typescript
const AM_COEFFICIENTS = {
  1: [1/2, 1/2],                            // Trapezoidal
  2: [5/12, 8/12, -1/12],                   // AM2
  3: [9/24, 19/24, -5/24, 1/24],            // AM3
  4: [251/720, 646/720, -264/720, 106/720, -19/720]  // AM4
}
```

### Algorithm: ABM PECE (Predict-Evaluate-Correct-Evaluate)

```typescript
interface ABMState {
  t: number
  y: Vector
  h: number
  fHistory: Vector[]  // [f_n, f_{n-1}, ..., f_{n-k+1}]
  order: number
}

function abmSolve(
  f: (t: number, y: Vector) => Vector,
  tspan: [number, number],
  y0: Vector,
  options: {
    order?: number       // Order (1-5)
    rtol?: number
    atol?: number
    maxStep?: number
  } = {}
): { t: number[], y: Vector[] } {

  const { order = 4, rtol = 1e-6, atol = 1e-8 } = options
  const [t0, tf] = tspan

  // Initialize with RK4
  const state = initializeABM(f, t0, y0, order)
  const solution = { t: [t0], y: [y0.clone()] }

  while (state.t < tf) {
    const result = abmStep(f, state, rtol, atol)

    if (result.success) {
      state.t += state.h
      state.y = result.y
      updateFHistory(state, f(state.t, state.y))

      solution.t.push(state.t)
      solution.y.push(result.y.clone())

      state.h = result.suggestedStep
    } else {
      state.h *= 0.5
    }
  }

  return solution
}

function abmStep(
  f: (t: number, y: Vector) => Vector,
  state: ABMState,
  rtol: number,
  atol: number
): { success: boolean, y?: Vector, suggestedStep: number } {

  const { order, h, y, t, fHistory } = state
  const beta = AB_COEFFICIENTS[order]
  const gamma = AM_COEFFICIENTS[order]

  // PREDICT: Adams-Bashforth (explicit)
  let sum_ab = Vector.zeros(y.size)
  for (let i = 0; i < order; i++) {
    sum_ab = sum_ab.add(fHistory[i].scale(beta[i]))
  }
  const y_pred = y.add(sum_ab.scale(h))

  // EVALUATE: f at predicted point
  const f_pred = f(t + h, y_pred)

  // CORRECT: Adams-Moulton (implicit), using predicted f value
  let sum_am = f_pred.scale(gamma[0])
  for (let i = 0; i < order; i++) {
    sum_am = sum_am.add(fHistory[i].scale(gamma[i + 1]))
  }
  const y_corr = y.add(sum_am.scale(h))

  // EVALUATE: f at corrected point
  const f_corr = f(t + h, y_corr)

  // Estimate local truncation error (predictor-corrector difference)
  const error_est = y_corr.subtract(y_pred)
  const error = computeError(error_est, y_corr, rtol, atol)

  if (error < 1.0) {
    // Accept step
    return {
      success: true,
      y: y_corr,
      suggestedStep: adaptStepSize(h, error, order)
    }
  } else {
    // Reject step
    return {
      success: false,
      suggestedStep: h * Math.max(0.1, 0.9 / Math.pow(error, 1 / order))
    }
  }
}

function initializeABM(
  f: (t: number, y: Vector) => Vector,
  t0: number,
  y0: Vector,
  order: number
): ABMState {
  // Bootstrap with RK4
  const h0 = 0.01
  const fHistory: Vector[] = [f(t0, y0)]

  let t = t0
  let y = y0.clone()

  for (let i = 0; i < order - 1; i++) {
    y = rk4Step(f, t, y, h0)
    t += h0
    fHistory.unshift(f(t, y))
  }

  return { t: t0, y: y0, h: h0, fHistory, order }
}
```

### Error Estimation

**Milne's Device**: Difference between predictor and corrector estimates local error
```
LTE ≈ C·(y_corr - y_pred)
```

Where C depends on order:
- Order 4: C ≈ 19/270 ≈ 0.07

### Stability

- **AB methods**: Conditionally stable (not A-stable)
- **AM methods**: More stable than AB, but not A-stable for all orders
- **ABM**: Use for non-stiff or mildly stiff problems
- **Stiff problems**: Switch to BDF

---

## 3. Event Detection (Zero-Crossing)

**Goal**: Detect when g(t, y) = 0 during ODE integration
- Applications: Ball bouncing, switches, discontinuities

### Algorithm: Bisection-Based Event Location

```typescript
interface EventFunction {
  g: (t: number, y: Vector) => number  // Event function
  direction?: 'rising' | 'falling' | 'both'  // Zero-crossing direction
  terminal?: boolean                    // Stop integration at event
  isterminal?: boolean
  action?: (t: number, y: Vector) => Vector  // Apply discontinuous change
}

interface EventResult {
  tEvent: number
  yEvent: Vector
  eventIndex: number
}

function solveWithEvents(
  f: (t: number, y: Vector) => Vector,
  tspan: [number, number],
  y0: Vector,
  events: EventFunction[],
  options: {
    solver?: 'rk45' | 'bdf' | 'abm'
    rtol?: number
    atol?: number
    eventTol?: number  // Tolerance for event location
  } = {}
): {
  t: number[],
  y: Vector[],
  events: EventResult[]
} {

  const { eventTol = 1e-8 } = options
  const solution = { t: [tspan[0]], y: [y0.clone()], events: [] }

  let state = initializeSolver(f, tspan[0], y0, options)
  let g_prev = events.map(e => e.g(state.t, state.y))

  while (state.t < tspan[1]) {
    // Take ODE step
    const result = solverStep(f, state, options)

    if (!result.success) {
      state.h *= 0.5
      continue
    }

    // Evaluate event functions
    const g_curr = events.map(e => e.g(result.t, result.y))

    // Check for sign changes (zero-crossings)
    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      const crossed = checkCrossing(g_prev[i], g_curr[i], event.direction)

      if (crossed) {
        // Locate exact event time via bisection
        const eventData = locateEvent(
          f,
          state.t,
          state.y,
          result.t,
          result.y,
          event,
          eventTol
        )

        solution.events.push({
          tEvent: eventData.t,
          yEvent: eventData.y,
          eventIndex: i
        })

        // Apply action if defined (e.g., velocity reversal)
        if (event.action) {
          result.y = event.action(eventData.t, eventData.y)
        }

        // Check if terminal
        if (event.terminal || event.isterminal) {
          solution.t.push(eventData.t)
          solution.y.push(eventData.y)
          return solution
        }
      }
    }

    // Accept step
    state.t = result.t
    state.y = result.y
    g_prev = g_curr

    solution.t.push(state.t)
    solution.y.push(state.y.clone())
  }

  return solution
}

function checkCrossing(
  g_prev: number,
  g_curr: number,
  direction: 'rising' | 'falling' | 'both' = 'both'
): boolean {
  const crossed = g_prev * g_curr < 0  // Sign change

  if (!crossed) return false

  if (direction === 'rising') {
    return g_curr > g_prev  // Crossing from negative to positive
  } else if (direction === 'falling') {
    return g_curr < g_prev  // Crossing from positive to negative
  } else {
    return true  // Any crossing
  }
}

function locateEvent(
  f: (t: number, y: Vector) => Vector,
  t_left: number,
  y_left: Vector,
  t_right: number,
  y_right: Vector,
  event: EventFunction,
  tol: number
): { t: number, y: Vector } {

  // Bisection to find t* where g(t*, y(t*)) = 0
  let tL = t_left, tR = t_right
  let yL = y_left, yR = y_right
  let gL = event.g(tL, yL), gR = event.g(tR, yR)

  while (tR - tL > tol) {
    const tMid = (tL + tR) / 2

    // Interpolate solution at tMid (dense output)
    const yMid = interpolateSolution(f, tL, yL, tR, yR, tMid)
    const gMid = event.g(tMid, yMid)

    if (Math.abs(gMid) < tol) {
      return { t: tMid, y: yMid }
    }

    // Bisection update
    if (gL * gMid < 0) {
      tR = tMid
      yR = yMid
      gR = gMid
    } else {
      tL = tMid
      yL = yMid
      gL = gMid
    }
  }

  return { t: (tL + tR) / 2, y: interpolateSolution(f, tL, yL, tR, yR, (tL + tR) / 2) }
}

function interpolateSolution(
  f: (t: number, y: Vector) => Vector,
  t0: number,
  y0: Vector,
  t1: number,
  y1: Vector,
  t: number
): Vector {
  // Hermite interpolation using y and y' = f(t, y)
  const h = t1 - t0
  const theta = (t - t0) / h
  const f0 = f(t0, y0)
  const f1 = f(t1, y1)

  // Cubic Hermite: y(t) = (1-θ)·y0 + θ·y1 + θ(1-θ)·[(1-θ)h·f0 - θ·h·f1]
  const term1 = y0.scale(1 - theta)
  const term2 = y1.scale(theta)
  const term3 = f0.scale(h * theta * (1 - theta) * (1 - theta))
  const term4 = f1.scale(-h * theta * theta * (1 - theta))

  return term1.add(term2).add(term3).add(term4)
}
```

### Example: Bouncing Ball

```typescript
function bouncingBall() {
  // y' = [v, -g]  where y = [position, velocity]
  const g = 9.81
  const f = (t: number, y: Vector) => {
    return new Vector([y.get(1), -g])
  }

  // Event: ball hits ground (position = 0)
  const groundEvent: EventFunction = {
    g: (t, y) => y.get(0),  // position
    direction: 'falling',
    terminal: false,
    action: (t, y) => {
      // Reverse velocity with coefficient of restitution
      const restitution = 0.8
      return new Vector([0, -restitution * y.get(1)])
    }
  }

  const y0 = new Vector([10, 0])  // Drop from 10m with 0 velocity
  const tspan: [number, number] = [0, 10]

  return solveWithEvents(f, tspan, y0, [groundEvent])
}
```

---

## 4. DAE Solver (Differential-Algebraic Equations)

**Goal**: Solve semi-explicit index-1 DAEs:
```
y' = f(t, y, z)     (Differential equations)
0 = g(t, y, z)      (Algebraic constraints)
```

### Algorithm: BDF-Based DAE Solver with Consistent Initialization

```typescript
interface DAESystem {
  f: (t: number, y: Vector, z: Vector) => Vector  // ODEs
  g: (t: number, y: Vector, z: Vector) => Vector  // Constraints
  dfdy?: Matrix  // Jacobian ∂f/∂y (optional)
  dfdz?: Matrix  // Jacobian ∂f/∂z (optional)
  dgdy?: Matrix  // Jacobian ∂g/∂y (optional)
  dgdz?: Matrix  // Jacobian ∂g/∂z (required for index-1)
}

function daeSolve(
  system: DAESystem,
  tspan: [number, number],
  y0: Vector,
  z0: Vector,
  options: {
    order?: number
    rtol?: number
    atol?: number
  } = {}
): { t: number[], y: Vector[], z: Vector[] } {

  const { order = 2, rtol = 1e-3, atol = 1e-6 } = options

  // Step 1: Consistent initialization (ensure g(t0, y0, z0) = 0)
  const { y_init, z_init } = consistentInitialization(
    system,
    tspan[0],
    y0,
    z0,
    atol
  )

  // Step 2: Integrate using BDF on augmented system
  const state = {
    t: tspan[0],
    y: y_init,
    z: z_init,
    h: 0.01,
    order,
    history: { y: [y_init], z: [z_init] }
  }

  const solution = {
    t: [tspan[0]],
    y: [y_init.clone()],
    z: [z_init.clone()]
  }

  while (state.t < tspan[1]) {
    const result = daeStep(system, state, rtol, atol)

    if (result.success) {
      state.t += state.h
      state.y = result.y
      state.z = result.z
      updateDAEHistory(state, result.y, result.z)

      solution.t.push(state.t)
      solution.y.push(result.y.clone())
      solution.z.push(result.z.clone())

      state.h = result.suggestedStep
    } else {
      state.h *= 0.5
    }
  }

  return solution
}

function consistentInitialization(
  system: DAESystem,
  t0: number,
  y0: Vector,
  z0: Vector,
  tol: number
): { y_init: Vector, z_init: Vector } {

  // Solve: g(t0, y0, z) = 0 for z, keeping y = y0 fixed
  // Newton iteration on z

  let z = z0.clone()
  const maxIter = 20

  for (let iter = 0; iter < maxIter; iter++) {
    const g_val = system.g(t0, y0, z)

    if (g_val.norm() < tol) {
      return { y_init: y0, z_init: z }
    }

    // Compute ∂g/∂z
    const dgdz = system.dgdz || finiteDiffJacobian(
      (z_) => system.g(t0, y0, z_),
      z
    )

    // Solve: (∂g/∂z)·Δz = -g
    const delta = dgdz.solve(g_val.scale(-1))
    z = z.add(delta)
  }

  throw new Error('Consistent initialization failed to converge')
}

function daeStep(
  system: DAESystem,
  state: any,
  rtol: number,
  atol: number
): { success: boolean, y?: Vector, z?: Vector, suggestedStep: number } {

  const { f, g } = system
  const { t, y, z, h, order } = state
  const { alpha, beta } = BDF_COEFFICIENTS[order]

  // BDF for differential part: α₀·y_n - Σαᵢ·y_{n-i} = h·β·f(t_n, y_n, z_n)
  // Algebraic constraint: g(t_n, y_n, z_n) = 0

  const t_new = t + h
  const invAlpha0 = 1 / alpha[0]

  // Predictor
  let y_curr = state.history.y[0].clone()
  let z_curr = state.history.z[0].clone()

  // Newton iteration on [y, z]
  const maxIter = 10

  for (let iter = 0; iter < maxIter; iter++) {
    // Residuals
    const f_val = f(t_new, y_curr, z_curr)
    const g_val = g(t_new, y_curr, z_curr)

    // R_y = y - h·β·f - (1/α₀)·Σαᵢ·y_{n-i}
    let sumY = Vector.zeros(y.size)
    for (let i = 1; i <= order; i++) {
      sumY = sumY.add(state.history.y[i - 1].scale(alpha[i]))
    }
    const R_y = y_curr.subtract(f_val.scale(h * beta)).subtract(sumY.scale(invAlpha0))

    // R_z = g
    const R_z = g_val

    // Check convergence
    const error_y = computeError(R_y, y_curr, rtol, atol)
    const error_z = R_z.norm() / (atol + rtol * z_curr.norm())

    if (error_y < 1.0 && error_z < 1.0) {
      return {
        success: true,
        y: y_curr,
        z: z_curr,
        suggestedStep: adaptStepSize(h, Math.max(error_y, error_z), order)
      }
    }

    // Jacobian of augmented system
    // [I - h·β·∂f/∂y,  -h·β·∂f/∂z] [Δy]   [-R_y]
    // [    ∂g/∂y    ,      ∂g/∂z  ] [Δz] = [-R_z]

    const J = computeDAEJacobian(system, t_new, y_curr, z_curr, h * beta)
    const rhs = new Vector([...R_y.toArray(), ...R_z.toArray()]).scale(-1)

    const delta = J.solve(rhs)

    // Split delta into [Δy, Δz]
    const delta_y = new Vector(delta.toArray().slice(0, y.size))
    const delta_z = new Vector(delta.toArray().slice(y.size))

    y_curr = y_curr.add(delta_y)
    z_curr = z_curr.add(delta_z)
  }

  return { success: false, suggestedStep: h * 0.5 }
}

function computeDAEJacobian(
  system: DAESystem,
  t: number,
  y: Vector,
  z: Vector,
  factor: number
): Matrix {
  const ny = y.size
  const nz = z.size
  const n = ny + nz

  // Compute blocks
  const dfdy = system.dfdy || finiteDiffJacobian((y_) => system.f(t, y_, z), y)
  const dfdz = system.dfdz || finiteDiffJacobian((z_) => system.f(t, y, z_), z)
  const dgdy = system.dgdy || finiteDiffJacobian((y_) => system.g(t, y_, z), y)
  const dgdz = system.dgdz || finiteDiffJacobian((z_) => system.g(t, y, z_), z)

  // Assemble augmented Jacobian
  const J = Matrix.zeros(n, n)

  // Top-left: I - h·β·∂f/∂y
  for (let i = 0; i < ny; i++) {
    for (let j = 0; j < ny; j++) {
      const val = (i === j ? 1 : 0) - factor * dfdy.get(i, j)
      J.set(i, j, val)
    }
  }

  // Top-right: -h·β·∂f/∂z
  for (let i = 0; i < ny; i++) {
    for (let j = 0; j < nz; j++) {
      J.set(i, ny + j, -factor * dfdz.get(i, j))
    }
  }

  // Bottom-left: ∂g/∂y
  for (let i = 0; i < nz; i++) {
    for (let j = 0; j < ny; j++) {
      J.set(ny + i, j, dgdy.get(i, j))
    }
  }

  // Bottom-right: ∂g/∂z
  for (let i = 0; i < nz; i++) {
    for (let j = 0; j < nz; j++) {
      J.set(ny + i, ny + j, dgdz.get(i, j))
    }
  }

  return J
}
```

### Index-1 DAE Condition

For index-1 DAEs, ∂g/∂z must be non-singular:
```
det(∂g/∂z) ≠ 0
```

This ensures z can be solved algebraically from y.

### Example: Pendulum on Moving Cart

```typescript
// Pendulum with algebraic constraint ||r|| = L
const pendulumDAE: DAESystem = {
  // y = [x, v_x]  (cart position and velocity)
  // z = [λ]       (Lagrange multiplier)
  f: (t, y, z) => {
    const [x, vx] = y.toArray()
    const [lambda] = z.toArray()
    return new Vector([vx, -lambda * x])
  },

  // Constraint: x² = L²
  g: (t, y, z) => {
    const [x, vx] = y.toArray()
    const L = 1.0
    return new Vector([x * x - L * L])
  },

  dgdz: Matrix.zeros(1, 1)  // ∂g/∂λ = 0 (not directly dependent)
}
```

---

## 5. BVP Solver (Boundary Value Problems)

**Goal**: Solve two-point BVP:
```
y'' = f(x, y, y')   for x ∈ [a, b]
BC: g_a(y(a), y'(a)) = 0
    g_b(y(b), y'(b)) = 0
```

### Algorithm: Collocation with Finite Differences

```typescript
interface BVPProblem {
  f: (x: number, y: number, yp: number) => number  // y'' = f(x, y, y')
  bc: {
    a: (y: number, yp: number) => number  // Boundary condition at x=a
    b: (y: number, yp: number) => number  // Boundary condition at x=b
  }
  domain: [number, number]  // [a, b]
}

function bvpSolve(
  problem: BVPProblem,
  options: {
    nPoints?: number      // Number of mesh points
    initialGuess?: (x: number) => [number, number]  // [y, y']
    tol?: number
  } = {}
): { x: number[], y: number[], yp: number[] } {

  const { nPoints = 50, tol = 1e-6 } = options
  const [a, b] = problem.domain

  // Create mesh
  const x = linspace(a, b, nPoints)
  const h = (b - a) / (nPoints - 1)

  // Initial guess
  const initialGuess = options.initialGuess || ((x_) => [0, 0])
  let y = x.map(xi => initialGuess(xi)[0])
  let yp = x.map(xi => initialGuess(xi)[1])

  // Newton iteration
  const maxIter = 50

  for (let iter = 0; iter < maxIter; iter++) {
    // Compute residual
    const residual = computeBVPResidual(problem, x, y, yp, h)

    if (residual.norm() < tol) {
      return { x, y, yp }
    }

    // Compute Jacobian (sparse tridiagonal + boundary rows)
    const J = computeBVPJacobian(problem, x, y, yp, h)

    // Solve: J·δ = -residual
    const delta = J.solve(residual.scale(-1))

    // Update: [y, yp] += δ
    const n = nPoints
    for (let i = 0; i < n; i++) {
      y[i] += delta.get(i)
      yp[i] += delta.get(n + i)
    }
  }

  throw new Error('BVP solver failed to converge')
}

function computeBVPResidual(
  problem: BVPProblem,
  x: number[],
  y: number[],
  yp: number[],
  h: number
): Vector {
  const n = x.length
  const residual: number[] = []

  // Boundary condition at x = a (first point)
  residual.push(problem.bc.a(y[0], yp[0]))

  // Collocation equations at interior points
  for (let i = 1; i < n - 1; i++) {
    // Finite difference: y'' ≈ (y[i+1] - 2·y[i] + y[i-1]) / h²
    const ypp_fd = (y[i + 1] - 2 * y[i] + y[i - 1]) / (h * h)

    // Residual: y'' - f(x, y, y') = 0
    const f_val = problem.f(x[i], y[i], yp[i])
    residual.push(ypp_fd - f_val)

    // Consistency: y' ≈ (y[i+1] - y[i-1]) / (2h)
    const yp_fd = (y[i + 1] - y[i - 1]) / (2 * h)
    residual.push(yp_fd - yp[i])
  }

  // Boundary condition at x = b (last point)
  residual.push(problem.bc.b(y[n - 1], yp[n - 1]))

  // Consistency at last point
  const yp_fd_last = (y[n - 1] - y[n - 2]) / h
  residual.push(yp_fd_last - yp[n - 1])

  return new Vector(residual)
}

function computeBVPJacobian(
  problem: BVPProblem,
  x: number[],
  y: number[],
  yp: number[],
  h: number
): Matrix {
  const n = x.length
  const size = 2 * n  // [y₀, ..., y_{n-1}, y'₀, ..., y'_{n-1}]
  const J = Matrix.zeros(size, size)

  // Row 0: ∂(bc_a)/∂[y₀, y'₀]
  const eps = 1e-8
  const dbc_a_dy = (problem.bc.a(y[0] + eps, yp[0]) - problem.bc.a(y[0], yp[0])) / eps
  const dbc_a_dyp = (problem.bc.a(y[0], yp[0] + eps) - problem.bc.a(y[0], yp[0])) / eps
  J.set(0, 0, dbc_a_dy)
  J.set(0, n, dbc_a_dyp)

  // Interior collocation equations
  let row = 1
  for (let i = 1; i < n - 1; i++) {
    // Residual 1: y'' - f(x, y, y') = 0
    // ∂/∂y_{i-1} = 1/h²
    J.set(row, i - 1, 1 / (h * h))
    // ∂/∂y_i = -2/h² - ∂f/∂y
    const dfdy = (problem.f(x[i], y[i] + eps, yp[i]) - problem.f(x[i], y[i], yp[i])) / eps
    J.set(row, i, -2 / (h * h) - dfdy)
    // ∂/∂y_{i+1} = 1/h²
    J.set(row, i + 1, 1 / (h * h))
    // ∂/∂y'_i = -∂f/∂y'
    const dfdyp = (problem.f(x[i], y[i], yp[i] + eps) - problem.f(x[i], y[i], yp[i])) / eps
    J.set(row, n + i, -dfdyp)
    row++

    // Residual 2: y' - (y[i+1] - y[i-1])/(2h) = 0
    J.set(row, i - 1, -1 / (2 * h))
    J.set(row, i + 1, 1 / (2 * h))
    J.set(row, n + i, -1)
    row++
  }

  // Row n-1: ∂(bc_b)/∂[y_{n-1}, y'_{n-1}]
  const dbc_b_dy = (problem.bc.b(y[n - 1] + eps, yp[n - 1]) - problem.bc.b(y[n - 1], yp[n - 1])) / eps
  const dbc_b_dyp = (problem.bc.b(y[n - 1], yp[n - 1] + eps) - problem.bc.b(y[n - 1], yp[n - 1])) / eps
  J.set(row, n - 1, dbc_b_dy)
  J.set(row, 2 * n - 1, dbc_b_dyp)
  row++

  // Last row: y'_{n-1} - (y_{n-1} - y_{n-2})/h = 0
  J.set(row, n - 2, -1 / h)
  J.set(row, n - 1, 1 / h)
  J.set(row, 2 * n - 1, -1)

  return J
}
```

### Example: Beam Deflection

```typescript
// y'' = -M(x)/EI  (bending moment)
const beamBVP: BVPProblem = {
  f: (x, y, yp) => -Math.sin(Math.PI * x),  // Distributed load
  bc: {
    a: (y, yp) => y,        // Fixed at x=0: y(0) = 0
    b: (y, yp) => y         // Fixed at x=1: y(1) = 0
  },
  domain: [0, 1]
}
```

---

## 6. Parabolic PDE (Heat Equation via Method of Lines)

**Goal**: Solve 1D heat equation:
```
∂u/∂t = α·∂²u/∂x²   for x ∈ [0, L], t > 0
BC: u(0, t) = g₀(t), u(L, t) = g_L(t)
IC: u(x, 0) = u₀(x)
```

### Algorithm: Method of Lines + BDF

```typescript
interface ParabolicPDE {
  alpha: number                          // Diffusion coefficient
  domain: { x: [number, number], t: [number, number] }
  bc: {
    left: (t: number) => number          // u(0, t)
    right: (t: number) => number         // u(L, t)
  }
  ic: (x: number) => number              // u(x, 0)
}

function solveParabolicPDE(
  pde: ParabolicPDE,
  options: {
    nx?: number      // Spatial grid points
    method?: 'bdf' | 'cn'  // Crank-Nicolson or BDF
  } = {}
): { x: number[], t: number[], u: number[][] } {

  const { nx = 100, method = 'cn' } = options
  const { x: [x0, xL], t: [t0, tf] } = pde.domain

  // Spatial discretization
  const x = linspace(x0, xL, nx)
  const dx = (xL - x0) / (nx - 1)

  // Initial condition
  let u = x.map(xi => pde.ic(xi))

  // Spatial derivative matrix: ∂²u/∂x² using finite differences
  const D2 = secondDerivativeMatrix(nx, dx)

  // ODE system: du/dt = α·D2·u + boundary_terms
  const f = (t: number, u_int: Vector) => {
    // u_int: interior points only (exclude boundaries)
    const rhs = D2.multiply(u_int).scale(pde.alpha)

    // Add boundary forcing
    rhs.set(0, rhs.get(0) + pde.alpha * pde.bc.left(t) / (dx * dx))
    rhs.set(nx - 3, rhs.get(nx - 3) + pde.alpha * pde.bc.right(t) / (dx * dx))

    return rhs
  }

  // Time integration
  const u_interior = new Vector(u.slice(1, nx - 1))  // Exclude boundaries
  const result = method === 'cn'
    ? crankNicolson(f, [t0, tf], u_interior, pde, dx)
    : bdfSolve(f, [t0, tf], u_interior)

  // Reconstruct full solution with boundaries
  const solution = {
    x,
    t: result.t,
    u: result.y.map((u_int, i) => {
      const t_curr = result.t[i]
      return [
        pde.bc.left(t_curr),
        ...u_int.toArray(),
        pde.bc.right(t_curr)
      ]
    })
  }

  return solution
}

function secondDerivativeMatrix(n: number, dx: number): Matrix {
  // Finite difference matrix for d²u/dx²
  // Using central differences: u''_i ≈ (u_{i+1} - 2u_i + u_{i-1})/dx²

  const nInterior = n - 2  // Exclude boundary points
  const D2 = Matrix.zeros(nInterior, nInterior)
  const coeff = 1 / (dx * dx)

  for (let i = 0; i < nInterior; i++) {
    D2.set(i, i, -2 * coeff)
    if (i > 0) D2.set(i, i - 1, coeff)
    if (i < nInterior - 1) D2.set(i, i + 1, coeff)
  }

  return D2
}

function crankNicolson(
  f: (t: number, u: Vector) => Vector,
  tspan: [number, number],
  u0: Vector,
  pde: ParabolicPDE,
  dx: number
): { t: number[], y: Vector[] } {

  // Crank-Nicolson: (I - dt/2·A)·u_{n+1} = (I + dt/2·A)·u_n
  const [t0, tf] = tspan
  const dt = 0.01  // Time step
  const n = u0.size

  const D2 = secondDerivativeMatrix(n + 2, dx)
  const A = D2.scale(pde.alpha)

  const I = Matrix.identity(n)
  const LHS = I.subtract(A.scale(dt / 2))
  const RHS_matrix = I.add(A.scale(dt / 2))

  const solution = { t: [t0], y: [u0.clone()] }
  let u = u0.clone()
  let t = t0

  while (t < tf) {
    const rhs = RHS_matrix.multiply(u)
    u = LHS.solve(rhs)
    t += dt

    solution.t.push(t)
    solution.y.push(u.clone())
  }

  return solution
}
```

### Stability Analysis

**CFL Condition** (for explicit methods):
```
Δt ≤ Δx² / (2α)
```

**Crank-Nicolson**: Unconditionally stable (implicit)
**BDF**: A-stable, suitable for stiff PDEs

---

## 7. Method of Lines (MOL) - General Framework

**Goal**: Convert PDE into system of ODEs via spatial discretization

### Finite Difference Stencils

```typescript
class FiniteDifferenceStencils {

  // First derivative: central difference (2nd order)
  static firstDerivativeCentral(u: number[], i: number, dx: number): number {
    return (u[i + 1] - u[i - 1]) / (2 * dx)
  }

  // First derivative: forward difference (1st order)
  static firstDerivativeForward(u: number[], i: number, dx: number): number {
    return (u[i + 1] - u[i]) / dx
  }

  // First derivative: backward difference (1st order)
  static firstDerivativeBackward(u: number[], i: number, dx: number): number {
    return (u[i] - u[i - 1]) / dx
  }

  // Second derivative: central difference (2nd order)
  static secondDerivativeCentral(u: number[], i: number, dx: number): number {
    return (u[i + 1] - 2 * u[i] + u[i - 1]) / (dx * dx)
  }

  // Fourth derivative (for beam equation)
  static fourthDerivative(u: number[], i: number, dx: number): number {
    // u''''_i ≈ (u_{i+2} - 4u_{i+1} + 6u_i - 4u_{i-1} + u_{i-2}) / dx⁴
    return (u[i + 2] - 4 * u[i + 1] + 6 * u[i] - 4 * u[i - 1] + u[i - 2]) /
           Math.pow(dx, 4)
  }

  // Upwind scheme (for advection)
  static upwind(u: number[], i: number, dx: number, velocity: number): number {
    if (velocity > 0) {
      // Backward difference
      return velocity * (u[i] - u[i - 1]) / dx
    } else {
      // Forward difference
      return velocity * (u[i + 1] - u[i]) / dx
    }
  }
}
```

### Example: Wave Equation

```typescript
// ∂²u/∂t² = c²·∂²u/∂x²
function waveEquationMOL(
  c: number,                    // Wave speed
  domain: [number, number],     // [x_min, x_max]
  ic: {
    u: (x: number) => number,   // u(x, 0)
    ut: (x: number) => number   // ∂u/∂t(x, 0)
  },
  bc: 'dirichlet' | 'neumann' | 'periodic',
  nx: number = 100
): ODESystem {

  const [xMin, xMax] = domain
  const x = linspace(xMin, xMax, nx)
  const dx = (xMax - xMin) / (nx - 1)

  // Convert to first-order system: [u, v] where v = ∂u/∂t
  // du/dt = v
  // dv/dt = c²·∂²u/∂x²

  const f = (t: number, state: Vector) => {
    const n = state.size / 2
    const u = state.slice(0, n)
    const v = state.slice(n, 2 * n)

    const dudt = v  // du/dt = v
    const dvdt = Vector.zeros(n)

    // Interior points
    for (let i = 1; i < n - 1; i++) {
      const uxx = FiniteDifferenceStencils.secondDerivativeCentral(
        u.toArray(), i, dx
      )
      dvdt.set(i, c * c * uxx)
    }

    // Boundary conditions
    if (bc === 'dirichlet') {
      dvdt.set(0, 0)       // Fixed at boundaries
      dvdt.set(n - 1, 0)
    } else if (bc === 'periodic') {
      const uxx_left = (u.get(1) - 2 * u.get(0) + u.get(n - 1)) / (dx * dx)
      const uxx_right = (u.get(0) - 2 * u.get(n - 1) + u.get(n - 2)) / (dx * dx)
      dvdt.set(0, c * c * uxx_left)
      dvdt.set(n - 1, c * c * uxx_right)
    }

    return new Vector([...dudt.toArray(), ...dvdt.toArray()])
  }

  // Initial conditions
  const u0 = x.map(xi => ic.u(xi))
  const v0 = x.map(xi => ic.ut(xi))
  const y0 = new Vector([...u0, ...v0])

  return { f, y0, x, dx }
}
```

---

## 8. DDE Solver (Delay Differential Equations)

**Goal**: Solve DDEs with constant delays:
```
y'(t) = f(t, y(t), y(t - τ₁), ..., y(t - τₖ))
```

### Algorithm: RK4 with History Interpolation

```typescript
interface DDEProblem {
  f: (t: number, y: Vector, yDelayed: Vector[]) => Vector
  delays: number[]                      // [τ₁, τ₂, ..., τₖ]
  history: (t: number) => Vector        // y(t) for t ≤ t₀
  tspan: [number, number]
}

function ddeSolve(
  problem: DDEProblem,
  y0: Vector,
  options: {
    dt?: number
    method?: 'rk4' | 'dopri5'
  } = {}
): { t: number[], y: Vector[] } {

  const { dt = 0.01, method = 'rk4' } = options
  const { f, delays, history, tspan } = problem
  const [t0, tf] = tspan

  const maxDelay = Math.max(...delays)

  // Solution storage (including history)
  const solution = {
    t: [t0],
    y: [y0.clone()]
  }

  let t = t0
  let y = y0.clone()

  while (t < tf) {
    // Evaluate y at delayed times: y(t - τᵢ)
    const yDelayed = delays.map(tau =>
      interpolateHistory(solution, history, t - tau, t0)
    )

    // RK4 step
    const k1 = f(t, y, yDelayed)

    const yDelayed2 = delays.map(tau =>
      interpolateHistory(solution, history, t + dt/2 - tau, t0)
    )
    const k2 = f(t + dt/2, y.add(k1.scale(dt/2)), yDelayed2)

    const yDelayed3 = delays.map(tau =>
      interpolateHistory(solution, history, t + dt/2 - tau, t0)
    )
    const k3 = f(t + dt/2, y.add(k2.scale(dt/2)), yDelayed3)

    const yDelayed4 = delays.map(tau =>
      interpolateHistory(solution, history, t + dt - tau, t0)
    )
    const k4 = f(t + dt, y.add(k3.scale(dt)), yDelayed4)

    // Update
    y = y.add(
      k1.add(k2.scale(2)).add(k3.scale(2)).add(k4).scale(dt / 6)
    )
    t += dt

    solution.t.push(t)
    solution.y.push(y.clone())
  }

  return solution
}

function interpolateHistory(
  solution: { t: number[], y: Vector[] },
  history: (t: number) => Vector,
  t_delayed: number,
  t0: number
): Vector {

  if (t_delayed < t0) {
    // Use provided history function
    return history(t_delayed)
  }

  // Find bracketing points in solution
  const { t, y } = solution
  let i = 0
  while (i < t.length - 1 && t[i + 1] < t_delayed) {
    i++
  }

  if (i === t.length - 1) {
    return y[i]  // Endpoint
  }

  // Hermite interpolation
  const t0_interp = t[i]
  const t1_interp = t[i + 1]
  const y0 = y[i]
  const y1 = y[i + 1]

  const theta = (t_delayed - t0_interp) / (t1_interp - t0_interp)

  // Linear interpolation (can upgrade to cubic Hermite)
  return y0.scale(1 - theta).add(y1.scale(theta))
}
```

### Example: Delayed Logistic Growth

```typescript
// y'(t) = r·y(t)·(1 - y(t-τ)/K)
const delayedLogistic: DDEProblem = {
  f: (t, y, yDelayed) => {
    const r = 1.0      // Growth rate
    const K = 10.0     // Carrying capacity
    const yLag = yDelayed[0].get(0)
    return new Vector([r * y.get(0) * (1 - yLag / K)])
  },
  delays: [1.0],       // τ = 1
  history: (t) => new Vector([0.5]),  // y(t) = 0.5 for t ≤ 0
  tspan: [0, 50]
}
```

### Stability Considerations

**Critical delay**: For linear DDEs y'(t) = -a·y(t-τ), stability requires:
```
a·τ < π/2
```

**Adaptive stepping**: Use error control, especially near t = t₀ + τᵢ (delay transitions)

---

## Implementation Checklist

### For Each Solver

- [ ] TypeScript interfaces for problem specification
- [ ] Input validation (delays > 0, consistent dimensions, BCs)
- [ ] Adaptive time stepping with error control
- [ ] Event detection integration (where applicable)
- [ ] Jacobian computation (analytical + finite difference fallback)
- [ ] Sparse matrix exploitation for large systems
- [ ] Unit tests with analytical solutions
- [ ] Convergence studies (order verification)
- [ ] Stiffness detection and method switching
- [ ] WASM acceleration for large PDEs (nx > 1000)
- [ ] Comprehensive documentation with examples

### Numerical Verification

```typescript
function testSuiteODEPDE() {
  // Test 1: Van der Pol (stiff, BDF)
  // Test 2: Oregonator (moderately stiff, ABM)
  // Test 3: Bouncing ball (event detection)
  // Test 4: Pendulum DAE (index-1)
  // Test 5: Nonlinear BVP with known solution
  // Test 6: Heat equation 1D (parabolic PDE)
  // Test 7: Wave equation (hyperbolic PDE, MOL)
  // Test 8: Mackey-Glass DDE (chaotic)
}
```

---

## References

- **Hairer & Wanner**: *Solving Ordinary Differential Equations II* (Stiff and DAE)
- **Ascher & Petzold**: *Computer Methods for ODEs and DAEs*
- **Shampine et al.**: *Solving DDEs in MATLAB* (DDE solvers)
- **Trefethen**: *Spectral Methods in MATLAB* (PDE discretization)
- **LeVeque**: *Finite Difference Methods for ODEs and PDEs*
- **MATLAB**: ode15s (BDF), ode113 (Adams), bvp4c, pdepe, dde23
- **SciPy**: solve_ivp, solve_bvp

---

## Performance Targets (WASM)

| Operation          | Problem Size    | JS Time  | WASM Time | Speedup |
|--------------------|-----------------|----------|-----------|---------|
| BDF solver         | 1000 ODEs, 100 steps | ~500ms   | ~50ms     | 10x     |
| ABM solver         | 100 ODEs, 1000 steps | ~200ms   | ~25ms     | 8x      |
| DAE solver         | 500+100 vars    | ~800ms   | ~100ms    | 8x      |
| BVP collocation    | 1000 points     | ~400ms   | ~60ms     | 7x      |
| Heat PDE (MOL)     | 1000 spatial pts| ~1200ms  | ~120ms    | 10x     |
| DDE solver         | 100 vars, 10 delays | ~600ms | ~80ms     | 7x      |

*Estimated on modern CPU; WASM provides significant speedup for large systems*
