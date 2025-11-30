# Phase 5: Root Finding & Optimization - Detailed Breakdown

**Phase**: 5 of 8
**Category**: Scientific Computing - Numerical Analysis
**Complexity**: High
**Estimated Effort**: 4-6 weeks
**Dependencies**: Phase 1 (Core Infrastructure), Phase 2 (Linear Algebra), Phase 4 (Numerical Integration)

---

## Overview

Phase 5 implements robust root-finding and optimization algorithms with automatic method selection, numerical differentiation, and sophisticated convergence strategies. These algorithms are essential for solving equations, minimizing functions, and finding equilibrium points in scientific and engineering applications.

### Performance Goals
- **Root finding**: 2-5x faster than pure JavaScript (via WASM)
- **Optimization**: 3-8x faster for gradient-based methods
- **System solving**: 5-15x faster for large nonlinear systems
- **Memory efficiency**: Minimize function evaluations through intelligent caching

### Key Innovations
1. Hybrid algorithms combining multiple strategies
2. Automatic numerical differentiation with error estimation
3. Intelligent bracket detection for root finding
4. Adaptive line search with backtracking
5. BFGS Hessian approximation for quasi-Newton methods

---

## Task 5.1: Brent's Method (Root Finding)

### Overview

Brent's method is a hybrid root-finding algorithm that combines the reliability of bisection with the speed of the secant method and inverse quadratic interpolation. It's considered one of the best general-purpose root-finding algorithms.

### Mathematical Foundation

**Problem**: Find x such that f(x) = 0

**Requirements**:
- Function f must be continuous on [a, b]
- f(a) and f(b) must have opposite signs: f(a) · f(b) < 0
- Guarantees convergence to a root

**Convergence Rate**:
- **Superlinear**: Order ~1.618 (golden ratio) in best case
- **Linear**: Falls back to bisection if necessary
- **Theorem**: Brent's method never requires more function evaluations than bisection

### Algorithm Components

#### 1. Inverse Quadratic Interpolation (IQI)

When we have three points (a, fa), (b, fb), (c, fc), fit inverse quadratic through points and solve for f(x) = 0:

```
x = (fa·fb / ((fc-fa)·(fc-fb))) · c
  + (fa·fc / ((fb-fa)·(fb-fc))) · b
  + (fb·fc / ((fa-fb)·(fa-fc))) · a
```

**When to use**: When points are distinct and not collinear

#### 2. Secant Method

When IQI is not applicable, use linear interpolation:

```
x = b - fb · (b - a) / (fb - fa)
```

**When to use**: When only two points available or IQI unstable

#### 3. Bisection Method

Fallback when other methods produce unreliable results:

```
x = (a + b) / 2
```

**When to use**: When interpolation step is too small or outside bracket

### State Machine Pseudocode

```
State: INIT, IQI_TRY, SECANT_TRY, BISECT, CONVERGED, MAX_ITER

function brent_state_machine(f, a, b, tol, max_iter):
    // Initialization
    state = INIT
    fa = f(a), fb = f(b)

    if sign(fa) == sign(fb):
        error("Root not bracketed")

    // Ensure |f(a)| ≥ |f(b)|
    if |fa| < |fb|:
        swap(a, b)
        swap(fa, fb)

    c = a, fc = fa
    mflag = true  // Method flag: true = used bisection last time

    iter = 0

    while state != CONVERGED and state != MAX_ITER:
        switch state:
            case INIT:
                state = IQI_TRY

            case IQI_TRY:
                // Check if we can use IQI
                if fa != fc and fb != fc:
                    // Try inverse quadratic interpolation
                    s = compute_iqi(a, b, c, fa, fb, fc)
                    state = CHECK_ACCEPTANCE
                else:
                    state = SECANT_TRY

            case SECANT_TRY:
                // Use secant method
                s = b - fb * (b - a) / (fb - fa)
                state = CHECK_ACCEPTANCE

            case CHECK_ACCEPTANCE:
                // Acceptance criteria for s
                accept = true

                // Condition 1: s must be between (3a+b)/4 and b
                bound = (3*a + b) / 4
                if not (s between min(bound, b) and max(bound, b)):
                    accept = false

                // Condition 2: If bisection was used last time
                if mflag and |s - b| >= |b - c| / 2:
                    accept = false

                // Condition 3: If bisection was not used last time
                if not mflag and |s - b| >= |c - d| / 2:
                    accept = false

                // Condition 4: If bisection was used last time
                if mflag and |b - c| < tol:
                    accept = false

                // Condition 5: If bisection was not used last time
                if not mflag and |c - d| < tol:
                    accept = false

                if accept:
                    mflag = false
                    state = UPDATE_BRACKET
                else:
                    state = BISECT

            case BISECT:
                s = (a + b) / 2
                mflag = true
                state = UPDATE_BRACKET

            case UPDATE_BRACKET:
                fs = f(s)
                d = c  // Save for condition checking
                c = b, fc = fb

                // Update bracket
                if sign(fa) == sign(fs):
                    a = s, fa = fs
                else:
                    b = s, fb = fs

                // Ensure |f(a)| ≥ |f(b)|
                if |fa| < |fb|:
                    swap(a, b)
                    swap(fa, fb)

                // Check convergence
                iter++
                if |fb| < tol or |b - a| < tol:
                    state = CONVERGED
                else if iter >= max_iter:
                    state = MAX_ITER
                else:
                    state = IQI_TRY

    if state == CONVERGED:
        return b, fb, iter, "success"
    else:
        return b, fb, iter, "max_iterations_reached"
```

### Complete Implementation Pseudocode

```typescript
function brent(
    f: (x: number) => number,
    a: number,
    b: number,
    options: {
        tol?: number = 1e-10,
        maxIter?: number = 100,
        relTol?: number = 2.220446049250313e-16  // machine epsilon
    }
): { root: number, fval: number, iterations: number, status: string } {

    const { tol, maxIter, relTol } = options

    // Step 1: Initial evaluation
    let fa = f(a)
    let fb = f(b)

    // Step 2: Check bracketing
    if (sign(fa) === sign(fb)) {
        throw new Error(`Root not bracketed: f(${a}) = ${fa}, f(${b}) = ${fb}`)
    }

    // Step 3: Ensure |f(a)| ≥ |f(b)|
    if (Math.abs(fa) < Math.abs(fb)) {
        [a, b] = [b, a]
        [fa, fb] = [fb, fa]
    }

    // Step 4: Initialize
    let c = a
    let fc = fa
    let d = c  // Previous iteration's c value
    let mflag = true  // Method flag
    let s: number  // New estimate
    let fs: number

    let iter = 0

    // Step 5: Main iteration loop
    while (iter < maxIter) {
        // Convergence check
        const converged = Math.abs(fb) < tol || Math.abs(b - a) < tol

        if (converged) {
            return {
                root: b,
                fval: fb,
                iterations: iter,
                status: 'success'
            }
        }

        // Step 6: Choose method
        if (fa !== fc && fb !== fc) {
            // Inverse quadratic interpolation
            const L0 = (a * fb * fc) / ((fa - fb) * (fa - fc))
            const L1 = (b * fa * fc) / ((fb - fa) * (fb - fc))
            const L2 = (c * fa * fb) / ((fc - fa) * (fc - fb))
            s = L0 + L1 + L2
        } else {
            // Secant method
            s = b - fb * (b - a) / (fb - fa)
        }

        // Step 7: Check acceptance criteria
        const bound = (3 * a + b) / 4
        const minBound = Math.min(bound, b)
        const maxBound = Math.max(bound, b)

        const condition1 = !(s > minBound && s < maxBound)
        const condition2 = mflag && Math.abs(s - b) >= Math.abs(b - c) / 2
        const condition3 = !mflag && Math.abs(s - b) >= Math.abs(c - d) / 2
        const condition4 = mflag && Math.abs(b - c) < tol
        const condition5 = !mflag && Math.abs(c - d) < tol

        if (condition1 || condition2 || condition3 || condition4 || condition5) {
            // Use bisection
            s = (a + b) / 2
            mflag = true
        } else {
            mflag = false
        }

        // Step 8: Evaluate at new point
        fs = f(s)

        // Step 9: Update
        d = c
        c = b
        fc = fb

        // Step 10: Update bracket
        if (sign(fa) === sign(fs)) {
            a = s
            fa = fs
        } else {
            b = s
            fb = fs
        }

        // Step 11: Ensure |f(a)| ≥ |f(b)|
        if (Math.abs(fa) < Math.abs(fb)) {
            [a, b] = [b, a]
            [fa, fb] = [fb, fa]
        }

        iter++
    }

    // Maximum iterations reached
    return {
        root: b,
        fval: fb,
        iterations: iter,
        status: 'max_iterations_reached'
    }
}

// Helper function
function sign(x: number): number {
    return x >= 0 ? 1 : -1
}
```

### Edge Cases and Error Handling

```typescript
// Edge case 1: Exact root at boundary
if (fa === 0) return { root: a, fval: 0, iterations: 0, status: 'success' }
if (fb === 0) return { root: b, fval: 0, iterations: 0, status: 'success' }

// Edge case 2: Very narrow bracket
if (Math.abs(b - a) < tol) {
    return { root: (a + b) / 2, fval: f((a + b) / 2), iterations: 0, status: 'success' }
}

// Edge case 3: NaN or Inf values
if (!isFinite(fa) || !isFinite(fb)) {
    throw new Error('Function returned non-finite value')
}

// Edge case 4: Flat function (both values very close to zero)
if (Math.abs(fa) < tol && Math.abs(fb) < tol) {
    return { root: (a + b) / 2, fval: 0, iterations: 0, status: 'success' }
}
```

### Convergence Analysis

**Theorem 1** (Brent, 1973): If f is continuous on [a, b] and f(a)·f(b) < 0, then Brent's method:
1. Always converges to a root
2. Never requires more evaluations than bisection
3. Usually requires fewer evaluations than bisection

**Convergence Order**:
- Best case: ~1.618 (superlinear, golden ratio)
- Average case: ~1.3-1.5
- Worst case: 1 (linear, same as bisection)

**Error Bound**: After n iterations with initial bracket [a₀, b₀]:
```
|xₙ - x*| ≤ (b₀ - a₀) / 2ⁿ
```

---

## Task 5.2: Newton-Raphson Method

### Overview

Newton-Raphson is a powerful root-finding method that uses the derivative to achieve quadratic convergence near the root. We implement both analytical and numerical derivative versions, plus line search for robustness.

### Mathematical Foundation

**Basic Algorithm**:
```
xₙ₊₁ = xₙ - f(xₙ) / f'(xₙ)
```

**Geometric Interpretation**: At each iteration, we:
1. Compute the tangent line at (xₙ, f(xₙ))
2. Find where the tangent intersects the x-axis
3. Use that intersection as the next estimate

**Convergence Theorem**: If f ∈ C²[a,b], f(x*) = 0, f'(x*) ≠ 0, and x₀ is sufficiently close to x*, then Newton-Raphson converges quadratically:
```
|eₙ₊₁| ≈ M|eₙ|²    where M = |f''(x*)| / (2|f'(x*)|)
```

### Automatic Numerical Differentiation

When analytical derivative is not available:

**Central Difference Formula** (4th order accurate):
```
f'(x) ≈ (-f(x+2h) + 8f(x+h) - 8f(x-h) + f(x-2h)) / (12h)
```

**Optimal Step Size**:
```
h = ∛(3ε|x|)    where ε = machine epsilon ≈ 2.22e-16
```

For x = 0, use h = ∛(3ε)

**Error Estimation**:
```
Error ≈ h⁴|f⁽⁵⁾(x)| / 30
```

### Line Search Algorithm

To ensure global convergence, we use backtracking line search with Armijo condition:

```
xₙ₊₁ = xₙ - α · (f(xₙ) / f'(xₙ))
```

where α ∈ (0, 1] satisfies:
```
|f(xₙ - α·δ)| ≤ |f(xₙ)| - c₁·α·δ·f'(xₙ)
```

Typically c₁ = 1e-4.

### Complete Implementation Pseudocode

```typescript
interface NewtonOptions {
    tol?: number          // Absolute tolerance (default: 1e-10)
    relTol?: number       // Relative tolerance (default: 1e-10)
    maxIter?: number      // Maximum iterations (default: 100)
    derivative?: (x: number) => number  // Analytical derivative
    useLineSearch?: boolean  // Enable line search (default: true)
    dampingFactor?: number   // Initial damping (default: 1.0)
}

function newton(
    f: (x: number) => number,
    x0: number,
    options: NewtonOptions = {}
): { root: number, fval: number, iterations: number, status: string } {

    const {
        tol = 1e-10,
        relTol = 1e-10,
        maxIter = 100,
        derivative,
        useLineSearch = true,
        dampingFactor = 1.0
    } = options

    const eps = 2.220446049250313e-16  // Machine epsilon

    // Step 1: Initialize
    let x = x0
    let fx = f(x)
    let iter = 0

    // Check if already at root
    if (Math.abs(fx) < tol) {
        return { root: x, fval: fx, iterations: 0, status: 'success' }
    }

    // Derivative function (analytical or numerical)
    const fprime = derivative || ((x: number) => numericalDerivative(f, x, eps))

    // Step 2: Main iteration loop
    while (iter < maxIter) {
        // Compute derivative
        const dfx = fprime(x)

        // Check for zero derivative
        if (Math.abs(dfx) < eps) {
            return {
                root: x,
                fval: fx,
                iterations: iter,
                status: 'derivative_zero'
            }
        }

        // Compute Newton step
        const delta = fx / dfx

        // Line search
        let alpha = dampingFactor
        let xNew: number
        let fxNew: number

        if (useLineSearch) {
            // Backtracking line search
            const c1 = 1e-4  // Armijo constant
            const rho = 0.5  // Backtracking factor
            const maxLineSearchIter = 20

            let lsIter = 0
            let accepted = false

            while (lsIter < maxLineSearchIter && !accepted) {
                xNew = x - alpha * delta
                fxNew = f(xNew)

                // Armijo condition (sufficient decrease)
                if (Math.abs(fxNew) <= Math.abs(fx) - c1 * alpha * Math.abs(delta * dfx)) {
                    accepted = true
                } else {
                    alpha *= rho
                    lsIter++
                }
            }

            if (!accepted) {
                // Line search failed, use bisection-like step
                alpha = 0.5
                xNew = x - alpha * delta
                fxNew = f(xNew)
            }
        } else {
            // No line search
            xNew = x - alpha * delta
            fxNew = f(xNew)
        }

        // Convergence checks
        const absChange = Math.abs(xNew - x)
        const relChange = absChange / (Math.abs(x) + eps)
        const absValue = Math.abs(fxNew)

        iter++

        // Update for next iteration
        x = xNew
        fx = fxNew

        // Check convergence
        if (absValue < tol) {
            return { root: x, fval: fx, iterations: iter, status: 'success' }
        }

        if (absChange < tol || relChange < relTol) {
            return { root: x, fval: fx, iterations: iter, status: 'success' }
        }

        // Detect divergence
        if (!isFinite(x) || !isFinite(fx)) {
            return { root: x, fval: fx, iterations: iter, status: 'diverged' }
        }
    }

    // Maximum iterations reached
    return {
        root: x,
        fval: fx,
        iterations: iter,
        status: 'max_iterations_reached'
    }
}

// Numerical derivative using central difference
function numericalDerivative(
    f: (x: number) => number,
    x: number,
    eps: number
): number {
    // Optimal step size for central difference
    const h = Math.cbrt(3 * eps * Math.max(Math.abs(x), 1.0))

    // 4th order central difference
    const fp2h = f(x + 2 * h)
    const fp1h = f(x + h)
    const fm1h = f(x - h)
    const fm2h = f(x - 2 * h)

    const derivative = (-fp2h + 8 * fp1h - 8 * fm1h + fm2h) / (12 * h)

    return derivative
}
```

### Safeguards and Edge Cases

```typescript
// Safeguard 1: Derivative too small
if (Math.abs(dfx) < sqrt(eps)) {
    // Switch to secant method or bisection
    return fallbackToSecant(f, x, fx, options)
}

// Safeguard 2: Step too large
const maxStep = 100 * Math.max(Math.abs(x), 1.0)
if (Math.abs(delta) > maxStep) {
    delta = Math.sign(delta) * maxStep
}

// Safeguard 3: Oscillation detection
const history = []  // Keep last 5 iterates
if (detectOscillation(history)) {
    return fallbackToBisection(f, history, options)
}

// Safeguard 4: Slow convergence
if (iter > 10 && Math.abs(fxNew) > 0.9 * Math.abs(fx)) {
    // Not making progress, enable/strengthen line search
    dampingFactor *= 0.5
}
```

### Convergence Analysis

**Quadratic Convergence** (near root):
```
eₙ₊₁ ≈ (f''(x*) / (2f'(x*))) · eₙ²
```

Number of correct digits approximately doubles each iteration.

**Basin of Attraction**: Region around root where Newton converges depends on:
```
|x₀ - x*| < 2|f'(x*)| / ||f''||
```

**Failure Modes**:
1. Zero derivative: f'(x) = 0
2. Poor initial guess: divergence or convergence to wrong root
3. Flat regions: slow convergence
4. Discontinuous derivative: unpredictable behavior

---

## Task 5.3: fzero (General Root Finder)

### Overview

`fzero` is a robust general-purpose root finder that:
1. Automatically detects brackets when single point given
2. Selects optimal method (Brent's or Newton's) based on situation
3. Handles multiple roots and provides diagnostic information

### Bracket Detection Algorithm

When user provides single starting point x₀, we need to find [a, b] such that f(a)·f(b) < 0.

**Strategy**: Exponential search outward from x₀

```
Step 1: Evaluate f(x₀)
Step 2: Search in both directions with exponentially increasing steps
Step 3: Stop when bracket found or maximum search radius reached
```

### Bracket Detection Pseudocode

```typescript
function findBracket(
    f: (x: number) => number,
    x0: number,
    options: { maxRadius?: number, maxIter?: number }
): { a: number, b: number, fa: number, fb: number } | null {

    const maxRadius = options.maxRadius || 1e6
    const maxIter = options.maxIter || 50

    // Initial evaluation
    const f0 = f(x0)

    if (Math.abs(f0) < 1e-14) {
        // Already at root
        return { a: x0, b: x0, fa: f0, fb: f0 }
    }

    // Initial step size
    let step = Math.max(0.1 * Math.abs(x0), 0.1)

    // Search in both directions
    let iter = 0

    while (iter < maxIter && step < maxRadius) {
        // Try positive direction
        const xp = x0 + step
        const fp = f(xp)

        if (sign(f0) !== sign(fp)) {
            return { a: x0, b: xp, fa: f0, fb: fp }
        }

        // Try negative direction
        const xn = x0 - step
        const fn = f(xn)

        if (sign(f0) !== sign(fn)) {
            return { a: xn, b: x0, fa: fn, fb: f0 }
        }

        // Also check if we found bracket on opposite side
        if (sign(fp) !== sign(fn)) {
            return { a: xn, b: xp, fa: fn, fb: fp }
        }

        // Increase step size exponentially
        step *= 2
        iter++
    }

    // No bracket found
    return null
}

function sign(x: number): number {
    return x >= 0 ? 1 : -1
}
```

### Method Selection Logic

```typescript
enum RootFindingMethod {
    BRENT,      // Bracketing method (reliable)
    NEWTON,     // Derivative-based (fast)
    SECANT,     // Derivative-free (moderate speed)
    BISECTION   // Fallback (always works if bracketed)
}

function selectMethod(
    hasBracket: boolean,
    hasDerivative: boolean,
    tolerance: number
): RootFindingMethod {

    if (!hasBracket && !hasDerivative) {
        // Need to find bracket first
        return RootFindingMethod.BRENT
    }

    if (hasDerivative) {
        // Use Newton if derivative available and we're close enough
        return RootFindingMethod.NEWTON
    }

    if (hasBracket) {
        // Use Brent's method for bracketed problem without derivative
        return RootFindingMethod.BRENT
    }

    // Default: secant method
    return RootFindingMethod.SECANT
}
```

### Complete fzero Implementation

```typescript
interface FzeroOptions {
    tol?: number
    maxIter?: number
    derivative?: (x: number) => number
    method?: 'auto' | 'brent' | 'newton' | 'secant' | 'bisection'
    display?: boolean  // Show iteration progress
}

interface FzeroResult {
    root: number
    fval: number
    iterations: number
    method: string
    status: string
    bracket?: [number, number]
}

function fzero(
    f: (x: number) => number,
    x0: number | [number, number],
    options: FzeroOptions = {}
): FzeroResult {

    const {
        tol = 1e-10,
        maxIter = 100,
        derivative,
        method = 'auto',
        display = false
    } = options

    // Step 1: Determine if we have a bracket
    let bracket: { a: number, b: number, fa: number, fb: number } | null = null
    let hasBracket = false

    if (Array.isArray(x0)) {
        // User provided bracket
        const [a, b] = x0
        const fa = f(a)
        const fb = f(b)

        if (sign(fa) !== sign(fb)) {
            bracket = { a, b, fa, fb }
            hasBracket = true
        } else {
            // Not a valid bracket, try to expand
            bracket = findBracket(f, (a + b) / 2, { maxRadius: Math.abs(b - a) * 10 })
            hasBracket = bracket !== null
        }
    } else {
        // Single starting point - try to find bracket
        bracket = findBracket(f, x0, {})
        hasBracket = bracket !== null

        if (!hasBracket && !derivative) {
            throw new Error(
                'Could not find bracket and no derivative provided. ' +
                'Please provide either a valid bracket [a,b] or a derivative function.'
            )
        }
    }

    // Step 2: Select method
    let selectedMethod: string

    if (method === 'auto') {
        if (hasBracket && !derivative) {
            selectedMethod = 'brent'
        } else if (derivative) {
            selectedMethod = 'newton'
        } else {
            selectedMethod = 'secant'
        }
    } else {
        selectedMethod = method
    }

    // Validate method compatibility
    if (selectedMethod === 'brent' && !hasBracket) {
        throw new Error('Brent method requires a bracket')
    }

    if (selectedMethod === 'newton' && !derivative && !hasBracket) {
        throw new Error('Newton method requires derivative or bracket for numerical differentiation')
    }

    // Step 3: Call appropriate solver
    let result: any

    switch (selectedMethod) {
        case 'brent':
            if (!bracket) throw new Error('Bracket required for Brent method')
            result = brent(f, bracket.a, bracket.b, { tol, maxIter })
            result.bracket = [bracket.a, bracket.b]
            break

        case 'newton':
            const startX = hasBracket ? (bracket!.a + bracket!.b) / 2 : (x0 as number)
            result = newton(f, startX, {
                tol,
                maxIter,
                derivative,
                useLineSearch: true
            })
            if (hasBracket) {
                result.bracket = [bracket!.a, bracket!.b]
            }
            break

        case 'secant':
            const x0Sec = hasBracket ? bracket!.a : (x0 as number)
            const x1Sec = hasBracket ? bracket!.b : (x0 as number) * 1.1 + 0.1
            result = secant(f, x0Sec, x1Sec, { tol, maxIter })
            break

        case 'bisection':
            if (!bracket) throw new Error('Bracket required for bisection')
            result = bisection(f, bracket.a, bracket.b, { tol, maxIter })
            result.bracket = [bracket.a, bracket.b]
            break

        default:
            throw new Error(`Unknown method: ${selectedMethod}`)
    }

    // Step 4: Add method info to result
    result.method = selectedMethod

    // Step 5: Display if requested
    if (display) {
        console.log(`fzero: ${selectedMethod} method`)
        console.log(`  Root: ${result.root}`)
        console.log(`  f(root): ${result.fval}`)
        console.log(`  Iterations: ${result.iterations}`)
        console.log(`  Status: ${result.status}`)
        if (result.bracket) {
            console.log(`  Bracket: [${result.bracket[0]}, ${result.bracket[1]}]`)
        }
    }

    return result
}

// Secant method implementation
function secant(
    f: (x: number) => number,
    x0: number,
    x1: number,
    options: { tol: number, maxIter: number }
): { root: number, fval: number, iterations: number, status: string } {

    const { tol, maxIter } = options

    let xPrev = x0
    let x = x1
    let fPrev = f(xPrev)
    let fx = f(x)

    for (let iter = 0; iter < maxIter; iter++) {
        // Check convergence
        if (Math.abs(fx) < tol) {
            return { root: x, fval: fx, iterations: iter, status: 'success' }
        }

        // Secant update
        const denominator = fx - fPrev

        if (Math.abs(denominator) < 1e-14) {
            return { root: x, fval: fx, iterations: iter, status: 'derivative_zero' }
        }

        const xNew = x - fx * (x - xPrev) / denominator

        // Update for next iteration
        xPrev = x
        fPrev = fx
        x = xNew
        fx = f(x)
    }

    return { root: x, fval: fx, iterations: maxIter, status: 'max_iterations_reached' }
}

// Bisection method implementation
function bisection(
    f: (x: number) => number,
    a: number,
    b: number,
    options: { tol: number, maxIter: number }
): { root: number, fval: number, iterations: number, status: string } {

    const { tol, maxIter } = options

    let fa = f(a)
    let fb = f(b)

    if (sign(fa) === sign(fb)) {
        throw new Error('Bisection requires f(a) and f(b) to have opposite signs')
    }

    for (let iter = 0; iter < maxIter; iter++) {
        const c = (a + b) / 2
        const fc = f(c)

        if (Math.abs(fc) < tol || Math.abs(b - a) < tol) {
            return { root: c, fval: fc, iterations: iter, status: 'success' }
        }

        if (sign(fa) === sign(fc)) {
            a = c
            fa = fc
        } else {
            b = c
            fb = fc
        }
    }

    const root = (a + b) / 2
    return { root, fval: f(root), iterations: maxIter, status: 'max_iterations_reached' }
}
```

### Multiple Root Handling

```typescript
function fzeroMultiple(
    f: (x: number) => number,
    searchInterval: [number, number],
    options: FzeroOptions & { numRoots?: number } = {}
): FzeroResult[] {

    const { numRoots = Infinity } = options
    const [a, b] = searchInterval
    const roots: FzeroResult[] = []

    // Step 1: Sample function to detect sign changes
    const numSamples = 1000
    const dx = (b - a) / numSamples
    const samples: { x: number, fx: number }[] = []

    for (let i = 0; i <= numSamples; i++) {
        const x = a + i * dx
        samples.push({ x, fx: f(x) })
    }

    // Step 2: Find all brackets
    const brackets: [number, number][] = []

    for (let i = 0; i < samples.length - 1; i++) {
        if (sign(samples[i].fx) !== sign(samples[i + 1].fx)) {
            brackets.push([samples[i].x, samples[i + 1].x])
        }
    }

    // Step 3: Refine each bracket
    for (const bracket of brackets) {
        if (roots.length >= numRoots) break

        try {
            const result = fzero(f, bracket, options)

            // Check if this is a new root (not duplicate)
            const isDuplicate = roots.some(r => Math.abs(r.root - result.root) < options.tol!)

            if (!isDuplicate) {
                roots.push(result)
            }
        } catch (e) {
            // Skip this bracket if solving fails
            continue
        }
    }

    return roots
}
```

---

## Task 5.4: fsolve (Nonlinear System Solver)

### Overview

`fsolve` solves systems of nonlinear equations:
```
F(x) = 0    where F: ℝⁿ → ℝⁿ
```

Implements:
1. Multivariate Newton-Raphson with Jacobian
2. Broyden's method for Jacobian-free solving
3. Line search for global convergence
4. Trust region methods

### Multivariate Newton-Raphson Algorithm

**Update Formula**:
```
x_{k+1} = x_k - J(x_k)⁻¹ F(x_k)
```

where J(x) is the Jacobian matrix:
```
J_{ij} = ∂F_i / ∂x_j
```

**Practical Implementation**: Solve linear system instead of inverting:
```
J(x_k) · Δx = -F(x_k)
x_{k+1} = x_k + Δx
```

### Jacobian Computation

#### Analytical Jacobian

```typescript
type JacobianFunction = (x: number[]) => number[][]

// User provides analytical Jacobian
const jacobian: JacobianFunction = (x) => [
    [∂F₁/∂x₁, ∂F₁/∂x₂, ..., ∂F₁/∂xₙ],
    [∂F₂/∂x₁, ∂F₂/∂x₂, ..., ∂F₂/∂xₙ],
    ...
    [∂Fₙ/∂x₁, ∂Fₙ/∂x₂, ..., ∂Fₙ/∂xₙ]
]
```

#### Numerical Jacobian (Forward Difference)

```typescript
function numericalJacobian(
    F: (x: number[]) => number[],
    x: number[],
    eps: number = 2.22e-16
): number[][] {

    const n = x.length
    const F0 = F(x)
    const J: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))

    for (let j = 0; j < n; j++) {
        // Optimal step size for j-th variable
        const h = Math.sqrt(eps) * Math.max(Math.abs(x[j]), 1.0)

        // Perturb j-th component
        const xPerturbed = [...x]
        xPerturbed[j] += h

        const FPerturbed = F(xPerturbed)

        // Compute j-th column of Jacobian
        for (let i = 0; i < n; i++) {
            J[i][j] = (FPerturbed[i] - F0[i]) / h
        }
    }

    return J
}
```

#### Numerical Jacobian (Central Difference - More Accurate)

```typescript
function numericalJacobianCentral(
    F: (x: number[]) => number[],
    x: number[],
    eps: number = 2.22e-16
): number[][] {

    const n = x.length
    const J: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))

    for (let j = 0; j < n; j++) {
        // Optimal step size for central difference
        const h = Math.cbrt(eps) * Math.max(Math.abs(x[j]), 1.0)

        // Forward and backward perturbations
        const xForward = [...x]
        const xBackward = [...x]
        xForward[j] += h
        xBackward[j] -= h

        const FForward = F(xForward)
        const FBackward = F(xBackward)

        // Compute j-th column using central difference
        for (let i = 0; i < n; i++) {
            J[i][j] = (FForward[i] - FBackward[i]) / (2 * h)
        }
    }

    return J
}
```

### Broyden's Method

**Idea**: Update Jacobian approximation instead of recomputing:

```
J_{k+1} = J_k + ((F(x_{k+1}) - F(x_k) - J_k·Δx) ⊗ Δx^T) / (Δx^T·Δx)
```

where ⊗ denotes outer product.

**Good Broyden Update** (rank-1):
```
B_{k+1} = B_k + ((Δx - B_k·ΔF) ⊗ ΔF^T) / (ΔF^T·ΔF)
```

where B ≈ J⁻¹, ΔF = F(x_{k+1}) - F(x_k)

### Line Search for Nonlinear Systems

**Merit Function**: Use L2 norm as scalar measure of progress:
```
φ(x) = ½||F(x)||₂²
```

**Armijo Condition**:
```
φ(x_k + α·Δx) ≤ φ(x_k) + c₁·α·∇φ(x_k)^T·Δx
```

where ∇φ(x) = J(x)^T·F(x)

### Complete fsolve Implementation

```typescript
interface FsolveOptions {
    tol?: number              // Function tolerance
    xTol?: number             // Solution tolerance
    maxIter?: number          // Maximum iterations
    jacobian?: (x: number[]) => number[][]  // Analytical Jacobian
    method?: 'newton' | 'broyden'  // Solution method
    useLineSearch?: boolean   // Enable line search
    display?: boolean         // Show progress
}

interface FsolveResult {
    solution: number[]
    fval: number[]           // F(solution)
    norm: number             // ||F(solution)||
    iterations: number
    jacobianEvals: number    // Number of Jacobian evaluations
    functionEvals: number    // Number of function evaluations
    status: string
}

function fsolve(
    F: (x: number[]) => number[],
    x0: number[],
    options: FsolveOptions = {}
): FsolveResult {

    const {
        tol = 1e-10,
        xTol = 1e-10,
        maxIter = 100,
        jacobian,
        method = 'newton',
        useLineSearch = true,
        display = false
    } = options

    const n = x0.length
    let x = [...x0]
    let Fx = F(x)
    let normFx = norm2(Fx)

    let iter = 0
    let jacEvals = 0
    let funcEvals = 1

    // For Broyden's method
    let B: number[][] | null = null  // Approximate inverse Jacobian

    // Initial Jacobian (for both methods)
    let J = jacobian ? jacobian(x) : numericalJacobianCentral(F, x)
    jacEvals++

    while (iter < maxIter) {
        // Convergence check
        if (normFx < tol) {
            return {
                solution: x,
                fval: Fx,
                norm: normFx,
                iterations: iter,
                jacobianEvals: jacEvals,
                functionEvals: funcEvals,
                status: 'success'
            }
        }

        // Compute search direction
        let dx: number[]

        if (method === 'newton' || iter === 0) {
            // Solve J·dx = -F for Newton step
            dx = solveLU(J, scalarMultiply(Fx, -1))
        } else if (method === 'broyden') {
            // Use Broyden update
            if (B === null) {
                // Initialize B ≈ J⁻¹
                B = invertMatrix(J)
            }

            // dx = -B·F
            dx = matrixVectorMultiply(B, scalarMultiply(Fx, -1))
        } else {
            throw new Error(`Unknown method: ${method}`)
        }

        // Line search
        let alpha = 1.0
        let xNew: number[]
        let FxNew: number[]
        let normFxNew: number

        if (useLineSearch) {
            const c1 = 1e-4
            const rho = 0.5
            const maxLsIter = 20

            const phi0 = 0.5 * normFx * normFx
            const Jdx = matrixVectorMultiply(J, dx)
            const gradPhi0_dot_dx = dotProduct(Fx, Jdx)

            let lsIter = 0
            let accepted = false

            while (lsIter < maxLsIter && !accepted) {
                xNew = vectorAdd(x, scalarMultiply(dx, alpha))
                FxNew = F(xNew)
                funcEvals++
                normFxNew = norm2(FxNew)

                const phi = 0.5 * normFxNew * normFxNew

                // Armijo condition
                if (phi <= phi0 + c1 * alpha * gradPhi0_dot_dx) {
                    accepted = true
                } else {
                    alpha *= rho
                    lsIter++
                }
            }

            if (!accepted) {
                // Line search failed, take small step
                alpha = 0.01
                xNew = vectorAdd(x, scalarMultiply(dx, alpha))
                FxNew = F(xNew)
                funcEvals++
                normFxNew = norm2(FxNew)
            }
        } else {
            xNew = vectorAdd(x, dx)
            FxNew = F(xNew)
            funcEvals++
            normFxNew = norm2(FxNew)
        }

        // Update Jacobian or Broyden approximation
        if (method === 'broyden' && iter > 0 && B !== null) {
            // Broyden update: B_{k+1} = B_k + ((Δx - B_k·ΔF) ⊗ ΔF^T) / (ΔF^T·ΔF)
            const deltaF = vectorSubtract(FxNew, Fx)
            const deltaX = vectorSubtract(xNew, x)

            const BdeltaF = matrixVectorMultiply(B, deltaF)
            const numerator = vectorSubtract(deltaX, BdeltaF)
            const denominator = dotProduct(deltaF, deltaF)

            if (Math.abs(denominator) > 1e-14) {
                // Rank-1 update
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        B[i][j] += (numerator[i] * deltaF[j]) / denominator
                    }
                }
            }
        } else if (method === 'newton') {
            // Recompute Jacobian every iteration (or every few iterations)
            const recomputeFreq = Math.min(n, 5)
            if (iter % recomputeFreq === 0) {
                J = jacobian ? jacobian(xNew) : numericalJacobianCentral(F, xNew)
                jacEvals++
            }
        }

        // Check step size convergence
        const stepNorm = norm2(vectorSubtract(xNew, x))
        const relStepNorm = stepNorm / (norm2(x) + 1e-14)

        // Update for next iteration
        x = xNew
        Fx = FxNew
        normFx = normFxNew
        iter++

        if (display) {
            console.log(`Iteration ${iter}: ||F|| = ${normFx.toExponential(4)}, step = ${stepNorm.toExponential(4)}`)
        }

        // Check step convergence
        if (stepNorm < xTol || relStepNorm < xTol) {
            return {
                solution: x,
                fval: Fx,
                norm: normFx,
                iterations: iter,
                jacobianEvals: jacEvals,
                functionEvals: funcEvals,
                status: normFx < tol ? 'success' : 'step_too_small'
            }
        }

        // Detect stagnation
        if (normFxNew > 0.99 * normFx && iter > 10) {
            return {
                solution: x,
                fval: Fx,
                norm: normFx,
                iterations: iter,
                jacobianEvals: jacEvals,
                functionEvals: funcEvals,
                status: 'stagnated'
            }
        }
    }

    return {
        solution: x,
        fval: Fx,
        norm: normFx,
        iterations: iter,
        jacobianEvals: jacEvals,
        functionEvals: funcEvals,
        status: 'max_iterations_reached'
    }
}

// Helper: Solve linear system using LU decomposition
function solveLU(A: number[][], b: number[]): number[] {
    // Implement LU decomposition and forward/backward substitution
    // (Use implementation from Phase 2 linear algebra)
    const n = A.length
    const { L, U, P } = luDecomposition(A)

    // Solve Ly = Pb
    const Pb = permute(b, P)
    const y = forwardSubstitution(L, Pb)

    // Solve Ux = y
    const x = backwardSubstitution(U, y)

    return x
}

// Helper functions
function norm2(v: number[]): number {
    return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))
}

function dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, ai, i) => sum + ai * b[i], 0)
}

function vectorAdd(a: number[], b: number[]): number[] {
    return a.map((ai, i) => ai + b[i])
}

function vectorSubtract(a: number[], b: number[]): number[] {
    return a.map((ai, i) => ai - b[i])
}

function scalarMultiply(v: number[], s: number): number[] {
    return v.map(x => x * s)
}

function matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map(row => dotProduct(row, v))
}

function invertMatrix(A: number[][]): number[][] {
    // Use Gauss-Jordan elimination or LU decomposition
    // (Implementation from Phase 2)
    const n = A.length
    const augmented = A.map((row, i) => [
        ...row,
        ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
    ])

    // Gauss-Jordan elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k
            }
        }

        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]

        // Scale pivot row
        const pivot = augmented[i][i]
        for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot
        }

        // Eliminate column
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = augmented[k][i]
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j]
                }
            }
        }
    }

    // Extract inverse from augmented matrix
    return augmented.map(row => row.slice(n))
}
```

### Trust Region Method (Alternative)

Instead of line search, use trust region:

```typescript
function trustRegionNewton(
    F: (x: number[]) => number[],
    x0: number[],
    options: FsolveOptions & { initialRadius?: number } = {}
): FsolveResult {

    const { initialRadius = 1.0 } = options
    let radius = initialRadius

    // ... (setup similar to fsolve)

    while (iter < maxIter) {
        // Solve trust region subproblem:
        // min_p { m(p) = F + J·p + ½p^T·H·p }  subject to ||p|| ≤ radius

        // Simplified: use Cauchy point (steepest descent within trust region)
        const gradPhi = matrixVectorMultiply(transposeMatrix(J), Fx)
        const Hg = matrixVectorMultiply(J, gradPhi)  // Gauss-Newton approx: H ≈ J^T·J

        let tau = 1.0
        const normGrad = norm2(gradPhi)
        const gHg = dotProduct(gradPhi, Hg)

        if (gHg > 0) {
            tau = Math.min(1.0, normGrad ** 3 / (radius * gHg))
        }

        const p = scalarMultiply(gradPhi, -tau * radius / normGrad)

        // Evaluate actual vs predicted reduction
        const xNew = vectorAdd(x, p)
        const FxNew = F(xNew)

        const actualReduction = 0.5 * (normFx ** 2 - norm2(FxNew) ** 2)
        const predictedReduction = -dotProduct(gradPhi, p) - 0.5 * dotProduct(p, Hg)

        const rho = actualReduction / predictedReduction

        // Update trust region radius
        if (rho < 0.25) {
            radius *= 0.25
        } else if (rho > 0.75 && Math.abs(norm2(p) - radius) < 1e-10) {
            radius *= 2.0
        }

        // Accept or reject step
        if (rho > 0.1) {
            x = xNew
            Fx = FxNew
            normFx = norm2(FxNew)
        }

        // ... (convergence check)
    }
}
```

---

## Task 5.5: Golden Section Search

### Overview

Golden section search is a technique for finding extrema of unimodal functions on an interval. It uses the golden ratio to iteratively reduce the search interval.

### Mathematical Foundation

**Golden Ratio**:
```
φ = (1 + √5) / 2 ≈ 1.618034
```

**Key Property**:
```
1/φ = φ - 1 ≈ 0.618034
```

**Unimodal Function**: f has single minimum on [a, b]:
```
x₁ < x₂ < x₃  ⟹  f(x₁) > f(x₂) < f(x₃)
```

### Algorithm

```
Given: [a, b] bracket with minimum inside

Step 1: Choose interior points using golden ratio:
    c = b - (b - a) / φ
    d = a + (b - a) / φ

Step 2: Evaluate f(c) and f(d)

Step 3: Reduce interval:
    If f(c) < f(d):
        new interval = [a, d]
        next evaluation at: new_c = new_b - (new_b - new_a) / φ
    Else:
        new interval = [c, b]
        next evaluation at: new_d = new_a + (new_b - new_a) / φ

Step 4: Repeat until |b - a| < tolerance
```

### Interval Reduction Pseudocode

```typescript
const PHI = (1 + Math.sqrt(5)) / 2  // Golden ratio
const RESPHI = 2 - PHI              // 1/φ = 0.618...

function goldenSectionSearch(
    f: (x: number) => number,
    a: number,
    b: number,
    options: {
        tol?: number,
        maxIter?: number,
        minimize?: boolean  // true = find minimum, false = find maximum
    } = {}
): { x: number, fx: number, iterations: number } {

    const {
        tol = 1e-8,
        maxIter = 100,
        minimize = true
    } = options

    // Comparison function
    const compare = minimize
        ? (f1: number, f2: number) => f1 < f2
        : (f1: number, f2: number) => f1 > f2

    // Step 1: Initialize interior points
    let c = b - (b - a) * RESPHI
    let d = a + (b - a) * RESPHI

    let fc = f(c)
    let fd = f(d)
    let funcEvals = 2

    // Main iteration loop
    for (let iter = 0; iter < maxIter; iter++) {
        // Convergence check
        if (Math.abs(b - a) < tol) {
            const xMin = (a + b) / 2
            return {
                x: xMin,
                fx: f(xMin),
                iterations: iter
            }
        }

        // Reduce interval based on function values
        if (compare(fc, fd)) {
            // Minimum in [a, d]
            b = d
            d = c
            fd = fc

            c = b - (b - a) * RESPHI
            fc = f(c)
            funcEvals++
        } else {
            // Minimum in [c, b]
            a = c
            c = d
            fc = fd

            d = a + (b - a) * RESPHI
            fd = f(d)
            funcEvals++
        }
    }

    // Return midpoint
    const xMin = (a + b) / 2
    return {
        x: xMin,
        fx: f(xMin),
        iterations: maxIter
    }
}
```

### Convergence Analysis

**Reduction Factor**: Each iteration reduces interval by factor of φ:
```
(bₙ₊₁ - aₙ₊₁) = (bₙ - aₙ) / φ
```

**After n iterations**:
```
(bₙ - aₙ) = (b₀ - a₀) / φⁿ
```

**Number of iterations** to achieve tolerance ε:
```
n = ⌈log((b₀ - a₀) / ε) / log(φ)⌉ ≈ 2.078 · log((b₀ - a₀) / ε)
```

**Optimality**: Golden section search is optimal in the sense that it minimizes the worst-case number of function evaluations for unimodal functions.

**Convergence Rate**: Linear with ratio 1/φ ≈ 0.618

---

## Task 5.6: fminbnd (Bounded 1D Optimization)

### Overview

`fminbnd` finds minimum of single-variable function on bounded interval [a, b]. Uses Brent's method for optimization, which combines parabolic interpolation with golden section search.

### Brent's Method for Optimization

**Idea**: Similar to Brent's root-finding, but for optimization:
1. Try parabolic interpolation through three points
2. Fall back to golden section if parabolic step is unreliable
3. Maintains bracket around minimum

### Parabolic Interpolation

Given three points (x₁, f₁), (x₂, f₂), (x₃, f₃), fit parabola:
```
p(x) = A(x - x₂)² + B(x - x₂) + C
```

Minimum of parabola at:
```
x_min = x₂ - ½ · (x₂ - x₁)²(f₂ - f₃) - (x₂ - x₃)²(f₂ - f₁)
              ─────────────────────────────────────────────
              (x₂ - x₁)(f₂ - f₃) - (x₂ - x₃)(f₂ - f₁)
```

### Complete Implementation Pseudocode

```typescript
interface FminbndOptions {
    tol?: number
    maxIter?: number
    display?: boolean
}

interface FminbndResult {
    x: number              // Location of minimum
    fx: number             // Function value at minimum
    iterations: number
    funcEvals: number
    status: string
}

function fminbnd(
    f: (x: number) => number,
    a: number,
    b: number,
    options: FminbndOptions = {}
): FminbndResult {

    const {
        tol = 1e-8,
        maxIter = 100,
        display = false
    } = options

    const PHI = (1 + Math.sqrt(5)) / 2
    const RESPHI = 2 - PHI
    const SQRT_EPS = Math.sqrt(2.220446049250313e-16)

    // Step 1: Initialize
    // Start with golden section points
    let x = a + RESPHI * (b - a)  // Current best estimate
    let w = x                      // Second best point
    let v = x                      // Previous value of w

    let fx = f(x)
    let fw = fx
    let fv = fx

    let funcEvals = 1
    let iter = 0

    // For parabolic interpolation
    let d = 0  // Step size
    let e = 0  // Step size from iteration before last

    // Main iteration loop
    while (iter < maxIter) {
        const xm = 0.5 * (a + b)  // Midpoint
        const tol1 = SQRT_EPS * Math.abs(x) + tol / 3
        const tol2 = 2 * tol1

        // Convergence check
        if (Math.abs(x - xm) <= tol2 - 0.5 * (b - a)) {
            return {
                x,
                fx,
                iterations: iter,
                funcEvals,
                status: 'success'
            }
        }

        let u: number  // New trial point
        let useGolden = false

        // Try parabolic interpolation
        if (Math.abs(e) > tol1) {
            // Fit parabola through x, w, v
            const r = (x - w) * (fx - fv)
            const q = (x - v) * (fx - fw)
            let p = (x - v) * q - (x - w) * r
            let qDenom = 2 * (q - r)

            if (qDenom > 0) {
                p = -p
            } else {
                qDenom = -qDenom
            }

            // Check if parabolic step is acceptable
            const eOld = e
            e = d

            const condition1 = Math.abs(p) < Math.abs(0.5 * qDenom * eOld)
            const condition2 = p > qDenom * (a - x)
            const condition3 = p < qDenom * (b - x)

            if (condition1 && condition2 && condition3) {
                // Take parabolic step
                d = p / qDenom
                u = x + d

                // f must not be evaluated too close to a or b
                if (u - a < tol2 || b - u < tol2) {
                    d = x < xm ? tol1 : -tol1
                }
            } else {
                useGolden = true
            }
        } else {
            useGolden = true
        }

        // Take golden section step if parabolic step not taken
        if (useGolden) {
            e = x < xm ? b - x : a - x
            d = RESPHI * e
        }

        // f must not be evaluated too close to x
        if (Math.abs(d) >= tol1) {
            u = x + d
        } else {
            u = x + (d > 0 ? tol1 : -tol1)
        }

        // Evaluate function at new point
        const fu = f(u)
        funcEvals++

        // Update points
        if (fu <= fx) {
            // u is new best point
            if (u < x) {
                b = x
            } else {
                a = x
            }

            v = w
            fv = fw
            w = x
            fw = fx
            x = u
            fx = fu
        } else {
            // u is not better than x
            if (u < x) {
                a = u
            } else {
                b = u
            }

            if (fu <= fw || w === x) {
                v = w
                fv = fw
                w = u
                fw = fu
            } else if (fu <= fv || v === x || v === w) {
                v = u
                fv = fu
            }
        }

        iter++

        if (display) {
            console.log(`Iteration ${iter}: x = ${x}, f(x) = ${fx}`)
        }
    }

    return {
        x,
        fx,
        iterations: iter,
        funcEvals,
        status: 'max_iterations_reached'
    }
}
```

### Edge Cases

```typescript
// Edge case 1: Minimum at boundary
if (a === b) {
    return { x: a, fx: f(a), iterations: 0, funcEvals: 1, status: 'success' }
}

// Edge case 2: Very narrow interval
if (Math.abs(b - a) < tol) {
    const x = (a + b) / 2
    return { x, fx: f(x), iterations: 0, funcEvals: 1, status: 'success' }
}

// Edge case 3: Check boundaries
const fa = f(a)
const fb = f(b)
if (fa < fx) return { x: a, fx: fa, iterations: iter, funcEvals, status: 'minimum_at_lower_bound' }
if (fb < fx) return { x: b, fx: fb, iterations: iter, funcEvals, status: 'minimum_at_upper_bound' }
```

---

## Task 5.7: Nelder-Mead Simplex

### Overview

Nelder-Mead is a derivative-free optimization method for multivariable functions. It uses a simplex (n+1 points in n dimensions) and geometric transformations.

### Algorithm Operations

**Four Operations**:
1. **Reflection**: Reflect worst point through centroid
2. **Expansion**: Extend reflection if it's promising
3. **Contraction**: Pull worst point toward centroid
4. **Shrink**: Contract entire simplex toward best point

**Standard Coefficients**:
```
α = 1    (reflection)
β = 2    (expansion)
γ = 0.5  (contraction)
δ = 0.5  (shrink)
```

### Simplex Initialization

For n-dimensional problem, create n+1 points:

```typescript
function initializeSimplex(
    x0: number[],
    stepSize: number = 0.05
): number[][] {

    const n = x0.length
    const simplex: number[][] = [x0]  // First vertex is initial point

    // Create n additional vertices
    for (let i = 0; i < n; i++) {
        const vertex = [...x0]

        // Perturb i-th coordinate
        if (x0[i] !== 0) {
            vertex[i] = (1 + stepSize) * x0[i]
        } else {
            vertex[i] = stepSize
        }

        simplex.push(vertex)
    }

    return simplex
}
```

### Complete Algorithm Pseudocode

```typescript
interface NelderMeadOptions {
    tol?: number           // Function value tolerance
    xTol?: number          // Coordinate tolerance
    maxIter?: number
    maxFunEvals?: number
    initialSimplex?: number[][]  // Custom initial simplex
    alpha?: number         // Reflection coefficient
    beta?: number          // Expansion coefficient
    gamma?: number         // Contraction coefficient
    delta?: number         // Shrink coefficient
    display?: boolean
}

interface NelderMeadResult {
    x: number[]
    fx: number
    iterations: number
    funcEvals: number
    status: string
}

function nelderMead(
    f: (x: number[]) => number,
    x0: number[],
    options: NelderMeadOptions = {}
): NelderMeadResult {

    const {
        tol = 1e-8,
        xTol = 1e-8,
        maxIter = 200 * x0.length,
        maxFunEvals = 200 * x0.length,
        initialSimplex,
        alpha = 1.0,    // reflection
        beta = 2.0,     // expansion
        gamma = 0.5,    // contraction
        delta = 0.5,    // shrink
        display = false
    } = options

    const n = x0.length

    // Step 1: Initialize simplex
    let simplex = initialSimplex || initializeSimplex(x0)

    // Evaluate at all vertices
    let fValues = simplex.map(v => f(v))
    let funcEvals = simplex.length

    let iter = 0

    // Main loop
    while (iter < maxIter && funcEvals < maxFunEvals) {
        // Step 2: Sort simplex by function values
        const indices = Array.from({ length: n + 1 }, (_, i) => i)
        indices.sort((i, j) => fValues[i] - fValues[j])

        simplex = indices.map(i => simplex[i])
        fValues = indices.map(i => fValues[i])

        const xBest = simplex[0]
        const fBest = fValues[0]
        const xWorst = simplex[n]
        const fWorst = fValues[n]
        const xSecondWorst = simplex[n - 1]
        const fSecondWorst = fValues[n - 1]

        // Step 3: Check convergence
        // Convergence criterion 1: function value spread
        const fSpread = fWorst - fBest
        if (fSpread < tol) {
            return {
                x: xBest,
                fx: fBest,
                iterations: iter,
                funcEvals,
                status: 'success'
            }
        }

        // Convergence criterion 2: simplex size
        const simplexSize = Math.max(
            ...simplex.slice(1).map(x =>
                norm2(vectorSubtract(x, xBest))
            )
        )
        if (simplexSize < xTol) {
            return {
                x: xBest,
                fx: fBest,
                iterations: iter,
                funcEvals,
                status: 'success'
            }
        }

        // Step 4: Compute centroid (excluding worst point)
        const centroid = Array(n).fill(0)
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                centroid[j] += simplex[i][j]
            }
        }
        for (let j = 0; j < n; j++) {
            centroid[j] /= n
        }

        // Step 5: Reflection
        const xReflected = Array(n)
        for (let j = 0; j < n; j++) {
            xReflected[j] = centroid[j] + alpha * (centroid[j] - xWorst[j])
        }
        const fReflected = f(xReflected)
        funcEvals++

        if (fReflected < fSecondWorst && fReflected >= fBest) {
            // Accept reflection
            simplex[n] = xReflected
            fValues[n] = fReflected

            if (display) {
                console.log(`Iter ${iter}: Reflection, f = ${fBest}`)
            }
        } else if (fReflected < fBest) {
            // Step 6: Expansion
            const xExpanded = Array(n)
            for (let j = 0; j < n; j++) {
                xExpanded[j] = centroid[j] + beta * (xReflected[j] - centroid[j])
            }
            const fExpanded = f(xExpanded)
            funcEvals++

            if (fExpanded < fReflected) {
                simplex[n] = xExpanded
                fValues[n] = fExpanded

                if (display) {
                    console.log(`Iter ${iter}: Expansion, f = ${fBest}`)
                }
            } else {
                simplex[n] = xReflected
                fValues[n] = fReflected

                if (display) {
                    console.log(`Iter ${iter}: Reflection, f = ${fBest}`)
                }
            }
        } else {
            // Step 7: Contraction
            let xContracted: number[]
            let fContracted: number

            if (fReflected < fWorst) {
                // Outside contraction
                xContracted = Array(n)
                for (let j = 0; j < n; j++) {
                    xContracted[j] = centroid[j] + gamma * (xReflected[j] - centroid[j])
                }
                fContracted = f(xContracted)
                funcEvals++

                if (fContracted <= fReflected) {
                    simplex[n] = xContracted
                    fValues[n] = fContracted

                    if (display) {
                        console.log(`Iter ${iter}: Outside contraction, f = ${fBest}`)
                    }
                } else {
                    // Shrink
                    performShrink()
                }
            } else {
                // Inside contraction
                xContracted = Array(n)
                for (let j = 0; j < n; j++) {
                    xContracted[j] = centroid[j] - gamma * (centroid[j] - xWorst[j])
                }
                fContracted = f(xContracted)
                funcEvals++

                if (fContracted < fWorst) {
                    simplex[n] = xContracted
                    fValues[n] = fContracted

                    if (display) {
                        console.log(`Iter ${iter}: Inside contraction, f = ${fBest}`)
                    }
                } else {
                    // Shrink
                    performShrink()
                }
            }
        }

        // Helper function for shrinking
        function performShrink() {
            for (let i = 1; i <= n; i++) {
                for (let j = 0; j < n; j++) {
                    simplex[i][j] = xBest[j] + delta * (simplex[i][j] - xBest[j])
                }
                fValues[i] = f(simplex[i])
                funcEvals++
            }

            if (display) {
                console.log(`Iter ${iter}: Shrink, f = ${fBest}`)
            }
        }

        iter++
    }

    // Find best point in final simplex
    let bestIdx = 0
    for (let i = 1; i <= n; i++) {
        if (fValues[i] < fValues[bestIdx]) {
            bestIdx = i
        }
    }

    const status = funcEvals >= maxFunEvals
        ? 'max_fun_evals_reached'
        : 'max_iterations_reached'

    return {
        x: simplex[bestIdx],
        fx: fValues[bestIdx],
        iterations: iter,
        funcEvals,
        status
    }
}
```

### Termination Criteria

```typescript
// Criterion 1: Function value standard deviation
const fMean = fValues.reduce((sum, f) => sum + f, 0) / (n + 1)
const fStd = Math.sqrt(
    fValues.reduce((sum, f) => sum + (f - fMean) ** 2, 0) / (n + 1)
)
if (fStd < tol) {
    // Converged
}

// Criterion 2: Coordinate standard deviation
for (let j = 0; j < n; j++) {
    const xj = simplex.map(v => v[j])
    const xjMean = xj.reduce((sum, x) => sum + x, 0) / (n + 1)
    const xjStd = Math.sqrt(
        xj.reduce((sum, x) => sum + (x - xjMean) ** 2, 0) / (n + 1)
    )
    if (xjStd < xTol) {
        // Converged in dimension j
    }
}

// Criterion 3: Simplex diameter
const diameter = Math.max(
    ...simplex.flatMap((v1, i) =>
        simplex.slice(i + 1).map(v2 =>
            norm2(vectorSubtract(v1, v2))
        )
    )
)
if (diameter < xTol) {
    // Converged
}
```

### Restart Strategy for Robustness

```typescript
function nelderMeadWithRestart(
    f: (x: number[]) => number,
    x0: number[],
    options: NelderMeadOptions & { maxRestarts?: number } = {}
): NelderMeadResult {

    const { maxRestarts = 3 } = options
    let bestResult: NelderMeadResult | null = null

    for (let restart = 0; restart <= maxRestarts; restart++) {
        // Perturb starting point for restarts
        const x0Perturbed = restart === 0
            ? x0
            : x0.map(x => x + (Math.random() - 0.5) * Math.abs(x) * 0.1)

        const result = nelderMead(f, x0Perturbed, options)

        if (!bestResult || result.fx < bestResult.fx) {
            bestResult = result
        }

        if (bestResult.status === 'success') {
            break
        }
    }

    return bestResult!
}
```

---

## Task 5.8: BFGS (Quasi-Newton)

### Overview

BFGS (Broyden-Fletcher-Goldfarb-Shanno) is a quasi-Newton method that approximates the Hessian matrix using gradient information. It's one of the most effective methods for unconstrained optimization.

### Mathematical Foundation

**Newton's Method**:
```
x_{k+1} = x_k - H_k^{-1} ∇f(x_k)
```
where H is the Hessian matrix.

**BFGS Approximation**: Maintain approximate inverse Hessian B_k ≈ H_k^{-1}

**Search Direction**:
```
p_k = -B_k ∇f(x_k)
```

### BFGS Update Formula

```
s_k = x_{k+1} - x_k
y_k = ∇f(x_{k+1}) - ∇f(x_k)

B_{k+1} = B_k + (1 + (y_k^T B_k y_k)/(y_k^T s_k)) · (s_k s_k^T)/(y_k^T s_k)
             - (B_k y_k s_k^T + s_k y_k^T B_k)/(y_k^T s_k)
```

**Simplified form**:
```
ρ_k = 1 / (y_k^T s_k)

B_{k+1} = (I - ρ_k s_k y_k^T) B_k (I - ρ_k y_k s_k^T) + ρ_k s_k s_k^T
```

### Line Search (Wolfe Conditions)

**Strong Wolfe Conditions**:
```
1. Sufficient decrease (Armijo):
   f(x_k + α p_k) ≤ f(x_k) + c_1 α ∇f(x_k)^T p_k

2. Curvature condition:
   |∇f(x_k + α p_k)^T p_k| ≤ c_2 |∇f(x_k)^T p_k|
```

Typically: c_1 = 1e-4, c_2 = 0.9

### Numerical Gradient Computation

```typescript
function numericalGradient(
    f: (x: number[]) => number,
    x: number[],
    eps: number = 2.22e-16
): number[] {

    const n = x.length
    const grad = Array(n)
    const fx = f(x)

    for (let i = 0; i < n; i++) {
        // Optimal step size
        const h = Math.sqrt(eps) * Math.max(Math.abs(x[i]), 1.0)

        // Forward difference
        const xPerturbed = [...x]
        xPerturbed[i] += h
        const fPerturbed = f(xPerturbed)

        grad[i] = (fPerturbed - fx) / h
    }

    return grad
}

// More accurate: central difference
function numericalGradientCentral(
    f: (x: number[]) => number,
    x: number[],
    eps: number = 2.22e-16
): number[] {

    const n = x.length
    const grad = Array(n)

    for (let i = 0; i < n; i++) {
        const h = Math.cbrt(eps) * Math.max(Math.abs(x[i]), 1.0)

        const xForward = [...x]
        const xBackward = [...x]
        xForward[i] += h
        xBackward[i] -= h

        const fForward = f(xForward)
        const fBackward = f(xBackward)

        grad[i] = (fForward - fBackward) / (2 * h)
    }

    return grad
}
```

### Complete BFGS Implementation

```typescript
interface BFGSOptions {
    tol?: number              // Gradient tolerance
    xTol?: number             // Step tolerance
    maxIter?: number
    gradient?: (x: number[]) => number[]  // Analytical gradient
    c1?: number               // Armijo constant
    c2?: number               // Curvature constant
    maxLineSearchIter?: number
    display?: boolean
}

interface BFGSResult {
    x: number[]
    fx: number
    gradient: number[]
    iterations: number
    funcEvals: number
    gradEvals: number
    status: string
}

function bfgs(
    f: (x: number[]) => number,
    x0: number[],
    options: BFGSOptions = {}
): BFGSResult {

    const {
        tol = 1e-8,
        xTol = 1e-8,
        maxIter = 200,
        gradient,
        c1 = 1e-4,
        c2 = 0.9,
        maxLineSearchIter = 20,
        display = false
    } = options

    const n = x0.length
    const eps = 2.220446049250313e-16

    // Gradient function (analytical or numerical)
    const grad = gradient || ((x: number[]) => numericalGradientCentral(f, x, eps))

    // Step 1: Initialize
    let x = [...x0]
    let fx = f(x)
    let gx = grad(x)

    let funcEvals = 1
    let gradEvals = 1
    let iter = 0

    // Initialize inverse Hessian approximation as identity
    let B = Array(n).fill(0).map((_, i) =>
        Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
    )

    // Main iteration loop
    while (iter < maxIter) {
        // Step 2: Check convergence
        const gradNorm = norm2(gx)

        if (gradNorm < tol) {
            return {
                x,
                fx,
                gradient: gx,
                iterations: iter,
                funcEvals,
                gradEvals,
                status: 'success'
            }
        }

        // Step 3: Compute search direction
        const p = matrixVectorMultiply(B, scalarMultiply(gx, -1))

        // Ensure descent direction
        const gpDot = dotProduct(gx, p)
        if (gpDot >= 0) {
            // Not a descent direction, reset to steepest descent
            console.warn('BFGS: Not a descent direction, resetting to steepest descent')
            for (let i = 0; i < n; i++) {
                p[i] = -gx[i]
            }
            // Reset B to identity
            B = Array(n).fill(0).map((_, i) =>
                Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
            )
        }

        // Step 4: Line search satisfying Wolfe conditions
        const lineSearchResult = lineSearchWolfe(
            f,
            grad,
            x,
            fx,
            gx,
            p,
            { c1, c2, maxIter: maxLineSearchIter }
        )

        const alpha = lineSearchResult.alpha
        const xNew = lineSearchResult.x
        const fxNew = lineSearchResult.fx
        const gxNew = lineSearchResult.gx

        funcEvals += lineSearchResult.funcEvals
        gradEvals += lineSearchResult.gradEvals

        if (alpha === 0) {
            return {
                x,
                fx,
                gradient: gx,
                iterations: iter,
                funcEvals,
                gradEvals,
                status: 'line_search_failed'
            }
        }

        // Step 5: Compute s_k and y_k
        const s = vectorSubtract(xNew, x)
        const y = vectorSubtract(gxNew, gx)

        const sTy = dotProduct(s, y)

        // Step 6: BFGS update (only if curvature condition satisfied)
        if (sTy > 1e-10 * norm2(s) * norm2(y)) {
            // Compute ρ_k
            const rho = 1 / sTy

            // Compute I - ρ s y^T
            const I = Array(n).fill(0).map((_, i) =>
                Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
            )

            const sy_T = outerProduct(s, y)
            const ys_T = outerProduct(y, s)

            const left = matrixSubtract(I, scalarMatrixMultiply(sy_T, rho))
            const right = matrixSubtract(I, scalarMatrixMultiply(ys_T, rho))

            // B_{k+1} = left * B_k * right + rho * s * s^T
            const ss_T = outerProduct(s, s)
            const term1 = matrixMultiply(matrixMultiply(left, B), right)
            const term2 = scalarMatrixMultiply(ss_T, rho)

            B = matrixAdd(term1, term2)
        } else {
            // Curvature condition not satisfied, skip update
            if (display) {
                console.warn(`BFGS: Skipping update (curvature condition violated)`)
            }
        }

        // Step 7: Check step size convergence
        const stepNorm = norm2(s)
        const relStepNorm = stepNorm / (norm2(x) + 1e-14)

        // Update for next iteration
        x = xNew
        fx = fxNew
        gx = gxNew
        iter++

        if (display) {
            console.log(
                `Iter ${iter}: f = ${fx.toExponential(6)}, ` +
                `||g|| = ${gradNorm.toExponential(4)}, ` +
                `α = ${alpha.toExponential(4)}`
            )
        }

        if (stepNorm < xTol || relStepNorm < xTol) {
            return {
                x,
                fx,
                gradient: gx,
                iterations: iter,
                funcEvals,
                gradEvals,
                status: 'step_too_small'
            }
        }
    }

    return {
        x,
        fx,
        gradient: gx,
        iterations: iter,
        funcEvals,
        gradEvals,
        status: 'max_iterations_reached'
    }
}

// Line search satisfying Wolfe conditions
function lineSearchWolfe(
    f: (x: number[]) => number,
    grad: (x: number[]) => number[],
    x: number[],
    fx: number,
    gx: number[],
    p: number[],
    options: {
        c1: number,
        c2: number,
        maxIter: number,
        alphaMax?: number
    }
): {
    alpha: number,
    x: number[],
    fx: number,
    gx: number[],
    funcEvals: number,
    gradEvals: number
} {

    const { c1, c2, maxIter, alphaMax = 10.0 } = options

    let alpha = 1.0  // Initial step size
    const phi0 = fx
    const dphi0 = dotProduct(gx, p)

    let funcEvals = 0
    let gradEvals = 0

    // Check if p is descent direction
    if (dphi0 >= 0) {
        return {
            alpha: 0,
            x,
            fx,
            gx,
            funcEvals,
            gradEvals
        }
    }

    let alphaLow = 0
    let alphaHigh = alphaMax

    for (let iter = 0; iter < maxIter; iter++) {
        const xNew = vectorAdd(x, scalarMultiply(p, alpha))
        const fxNew = f(xNew)
        funcEvals++

        const phi = fxNew

        // Check Armijo condition (sufficient decrease)
        if (phi > phi0 + c1 * alpha * dphi0) {
            // Armijo violated, reduce step size
            alphaHigh = alpha
            alpha = (alphaLow + alphaHigh) / 2
            continue
        }

        // Compute gradient at new point
        const gxNew = grad(xNew)
        gradEvals++

        const dphi = dotProduct(gxNew, p)

        // Check curvature condition
        if (Math.abs(dphi) <= -c2 * dphi0) {
            // Both Wolfe conditions satisfied
            return {
                alpha,
                x: xNew,
                fx: fxNew,
                gx: gxNew,
                funcEvals,
                gradEvals
            }
        }

        // Curvature condition violated
        if (dphi >= 0) {
            // Slope changed sign, reduce step
            alphaHigh = alpha
            alpha = (alphaLow + alphaHigh) / 2
        } else {
            // Slope still negative, increase step
            alphaLow = alpha
            if (alphaHigh >= alphaMax) {
                alpha = 2 * alpha
            } else {
                alpha = (alphaLow + alphaHigh) / 2
            }
        }
    }

    // Line search failed to satisfy Wolfe conditions
    // Return best point found
    const xBest = vectorAdd(x, scalarMultiply(p, alpha))
    return {
        alpha,
        x: xBest,
        fx: f(xBest),
        gx: grad(xBest),
        funcEvals: funcEvals + 1,
        gradEvals: gradEvals + 1
    }
}

// Helper: outer product
function outerProduct(a: number[], b: number[]): number[][] {
    return a.map(ai => b.map(bj => ai * bj))
}

// Helper: matrix operations
function matrixAdd(A: number[][], B: number[][]): number[][] {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]))
}

function matrixSubtract(A: number[][], B: number[][]): number[][] {
    return A.map((row, i) => row.map((val, j) => val - B[i][j]))
}

function scalarMatrixMultiply(A: number[][], s: number): number[][] {
    return A.map(row => row.map(val => val * s))
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
    const m = A.length
    const n = B[0].length
    const p = B.length

    const C = Array(m).fill(0).map(() => Array(n).fill(0))

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < p; k++) {
                C[i][j] += A[i][k] * B[k][j]
            }
        }
    }

    return C
}
```

### Limited-Memory BFGS (L-BFGS)

For large-scale problems, store only recent updates:

```typescript
interface LBFGSOptions extends BFGSOptions {
    m?: number  // Number of corrections to store (default: 10)
}

function lbfgs(
    f: (x: number[]) => number,
    x0: number[],
    options: LBFGSOptions = {}
): BFGSResult {

    const { m = 10 } = options

    // Store recent s and y vectors
    const sHistory: number[][] = []
    const yHistory: number[][] = []
    const rhoHistory: number[] = []

    // ... (main loop similar to BFGS)

    // Instead of storing full B matrix, use two-loop recursion
    function computeSearchDirection(g: number[]): number[] {
        const q = [...g]
        const n = g.length
        const k = sHistory.length
        const alpha = Array(k)

        // First loop (backward)
        for (let i = k - 1; i >= 0; i--) {
            alpha[i] = rhoHistory[i] * dotProduct(sHistory[i], q)
            for (let j = 0; j < n; j++) {
                q[j] -= alpha[i] * yHistory[i][j]
            }
        }

        // Scale by initial Hessian estimate
        let gamma = 1.0
        if (k > 0) {
            gamma = dotProduct(sHistory[k - 1], yHistory[k - 1]) /
                    dotProduct(yHistory[k - 1], yHistory[k - 1])
        }

        const r = q.map(qi => gamma * qi)

        // Second loop (forward)
        for (let i = 0; i < k; i++) {
            const beta = rhoHistory[i] * dotProduct(yHistory[i], r)
            for (let j = 0; j < n; j++) {
                r[j] += sHistory[i][j] * (alpha[i] - beta)
            }
        }

        return r.map(ri => -ri)  // Negative for descent direction
    }

    // After line search, update history
    function updateHistory(s: number[], y: number[]) {
        const sTy = dotProduct(s, y)

        if (sTy > 1e-10) {
            sHistory.push(s)
            yHistory.push(y)
            rhoHistory.push(1 / sTy)

            // Remove oldest if exceeds memory limit
            if (sHistory.length > m) {
                sHistory.shift()
                yHistory.shift()
                rhoHistory.shift()
            }
        }
    }
}
```

---

## Integration and Testing Strategy

### Unit Tests

```typescript
// Test 1: Brent's method on polynomial
test('brent: finds root of x^3 - 2x - 5', () => {
    const f = (x: number) => x ** 3 - 2 * x - 5
    const result = brent(f, 2, 3)
    assert(Math.abs(result.root - 2.0945514815) < 1e-8)
})

// Test 2: Newton-Raphson with analytical derivative
test('newton: square root', () => {
    const f = (x: number) => x * x - 2
    const fp = (x: number) => 2 * x
    const result = newton(f, 1.5, { derivative: fp })
    assert(Math.abs(result.root - Math.sqrt(2)) < 1e-10)
})

// Test 3: fsolve on 2D system
test('fsolve: 2D nonlinear system', () => {
    const F = (x: number[]) => [
        x[0] ** 2 + x[1] ** 2 - 1,
        x[0] - x[1]
    ]
    const result = fsolve(F, [0.5, 0.5])
    assert(Math.abs(result.solution[0] - Math.sqrt(0.5)) < 1e-8)
})

// Test 4: BFGS on Rosenbrock
test('bfgs: Rosenbrock function', () => {
    const f = (x: number[]) => (1 - x[0]) ** 2 + 100 * (x[1] - x[0] ** 2) ** 2
    const result = bfgs(f, [-1.2, 1])
    assert(Math.abs(result.x[0] - 1) < 1e-4)
    assert(Math.abs(result.x[1] - 1) < 1e-4)
})
```

### Performance Benchmarks

Measure against:
- SciPy (Python)
- GNU Scientific Library (GSL)
- Numerical Recipes

Target: Within 2x of C implementations for pure JavaScript, match or beat for WASM.

---

## WASM Acceleration Opportunities

### High-Priority Functions for WASM

1. **Matrix operations in fsolve**: Jacobian computation, LU decomposition
2. **Line search loops**: Tight iteration loops benefit from WASM
3. **BFGS matrix updates**: Dense matrix operations
4. **Numerical differentiation**: Repeated function evaluations

### Memory Layout for WASM

```wat
;; Store simplex vertices contiguously
(memory $vertices (;..;))

;; Store function values
(memory $fvalues (;..;))

;; Centroid computation in WASM
(func $compute_centroid (param $n i32) (result f64)
  ;; Efficient SIMD operations
)
```

---

## Success Criteria

- [ ] All 8 functions implemented in TypeScript
- [ ] Comprehensive test coverage (>95%)
- [ ] Benchmarks show 2-5x speedup with WASM
- [ ] Documentation with examples
- [ ] Integration with existing math.js API
- [ ] Backward compatible with current interface

---

## References

1. **Brent, R. P.** (1973). *Algorithms for Minimization Without Derivatives*. Prentice-Hall.
2. **Nocedal, J., & Wright, S. J.** (2006). *Numerical Optimization* (2nd ed.). Springer.
3. **Press, W. H., et al.** (2007). *Numerical Recipes: The Art of Scientific Computing* (3rd ed.). Cambridge University Press.
4. **Powell, M. J. D.** (1970). "A hybrid method for nonlinear equations." *Numerical Methods for Nonlinear Algebraic Equations*, 87-114.
5. **Broyden, C. G.** (1965). "A class of methods for solving nonlinear simultaneous equations." *Mathematics of Computation*, 19(92), 577-593.
6. **Nelder, J. A., & Mead, R.** (1965). "A simplex method for function minimization." *The Computer Journal*, 7(4), 308-313.
7. **Moré, J. J., & Thuente, D. J.** (1994). "Line search algorithms with guaranteed sufficient decrease." *ACM Transactions on Mathematical Software*, 20(3), 286-307.
