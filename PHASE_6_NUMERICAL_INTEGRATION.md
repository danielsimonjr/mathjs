# Phase 6: Numerical Integration (Quadrature)

## Overview

Numerical integration (quadrature) approximates the definite integral:

```
∫ₐᵇ f(x) dx ≈ Σᵢ wᵢ f(xᵢ)
```

where `xᵢ` are quadrature nodes and `wᵢ` are weights.

**Key Concepts:**
- **Order of accuracy**: O(hⁿ) where h is step size
- **Adaptive methods**: Refine where needed based on error estimates
- **Composite rules**: Apply simple rules over subintervals
- **Gauss quadrature**: Optimal node placement for polynomial accuracy

**Performance Targets:**
- **WASM**: 3-8x speedup for function evaluation loops
- **Parallel**: 2-3x additional speedup for adaptive/Monte Carlo methods
- **Accuracy**: Machine precision for smooth functions

---

## Task 1: Trapezoidal Rule (trapz)

### Mathematical Background

The trapezoidal rule approximates the integral by linear interpolation:

**Single interval:**
```
∫ₐᵇ f(x) dx ≈ (b-a)/2 · [f(a) + f(b)]
```

**Composite rule** (n subintervals):
```
∫ₐᵇ f(x) dx ≈ h/2 · [f(x₀) + 2f(x₁) + 2f(x₂) + ... + 2f(xₙ₋₁) + f(xₙ)]
```
where `h = (b-a)/n` and `xᵢ = a + ih`.

**Cumulative integration** (running integral):
```
Tᵢ = ∫ₐˣⁱ f(x) dx ≈ h/2 · [f(x₀) + 2(f(x₁) + ... + f(xᵢ₋₁)) + f(xᵢ)]
```

### Error Analysis

**Local truncation error** (single interval):
```
E = -(b-a)³/12 · f''(ξ)  for some ξ ∈ [a,b]
```

**Global error** (composite rule):
```
E = -(b-a)h²/12 · f''(ξ) = O(h²)
```

**Requirements:**
- f must be continuous on [a,b]
- f'' bounded for error estimate
- Error decreases quadratically with h

### Algorithm: Composite Trapezoidal Rule

```
Input: f (function), a, b (bounds), n (intervals)
Output: I (integral approximation)

1. h ← (b - a) / n
2. sum ← f(a) + f(b)
3. for i = 1 to n-1:
4.     xᵢ ← a + i·h
5.     sum ← sum + 2·f(xᵢ)
6. I ← h/2 · sum
7. return I
```

**Complexity:** O(n) function evaluations

### Algorithm: Cumulative Trapezoidal Integration

```
Input: x (array of points), y (array of values)
Output: T (array of cumulative integrals)

Precondition: x is sorted, |x| = |y| = n

1. T ← array of size n, T[0] ← 0
2. for i = 1 to n-1:
3.     h ← x[i] - x[i-1]
4.     T[i] ← T[i-1] + h/2 · (y[i-1] + y[i])
5. return T
```

**For unevenly spaced points:**
```
∫ₐᵇ f(x) dx ≈ Σᵢ₌₁ⁿ (xᵢ - xᵢ₋₁)/2 · [f(xᵢ₋₁) + f(xᵢ)]
```

### Pseudocode: TypeScript Implementation

```typescript
export function trapz(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 100
): number {
  const h = (b - a) / n
  let sum = f(a) + f(b)

  for (let i = 1; i < n; i++) {
    sum += 2 * f(a + i * h)
  }

  return (h / 2) * sum
}

// For tabulated data
export function trapzData(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) {
    throw new Error('Invalid input arrays')
  }

  let sum = 0
  for (let i = 1; i < x.length; i++) {
    const h = x[i] - x[i-1]
    sum += (h / 2) * (y[i-1] + y[i])
  }

  return sum
}

// Cumulative integration
export function cumtrapz(x: number[], y: number[]): number[] {
  const T = new Array(x.length)
  T[0] = 0

  for (let i = 1; i < x.length; i++) {
    const h = x[i] - x[i-1]
    T[i] = T[i-1] + (h / 2) * (y[i-1] + y[i])
  }

  return T
}
```

### WASM Optimization Notes

```typescript
// WASM kernel for uniform grid
export function trapz_wasm(
  f_values: Float64Array,  // Pre-computed f(xᵢ)
  h: number
): f64 {
  let sum = f_values[0] + f_values[f_values.length - 1]

  for (let i = 1; i < f_values.length - 1; i++) {
    sum += 2 * f_values[i]
  }

  return (h / 2) * sum
}
```

**SIMD optimization**: Vectorize the summation loop.

---

## Task 2: Simpson's Rule (simps)

### Mathematical Background

Simpson's 1/3 rule uses quadratic interpolation:

**Single interval** (3 points):
```
∫ₐᵇ f(x) dx ≈ h/3 · [f(a) + 4f((a+b)/2) + f(b)]
```
where `h = (b-a)/2`.

**Composite Simpson's rule** (n intervals, n must be even):
```
∫ₐᵇ f(x) dx ≈ h/3 · [f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ... + 4f(xₙ₋₁) + f(xₙ)]
```

Pattern: 1, 4, 2, 4, 2, ..., 4, 2, 4, 1

### Error Analysis

**Local error** (single interval):
```
E = -(b-a)⁵/2880 · f⁽⁴⁾(ξ)
```

**Global error** (composite rule):
```
E = -(b-a)h⁴/180 · f⁽⁴⁾(ξ) = O(h⁴)
```

**Key properties:**
- Exact for polynomials up to degree 3
- Requires even number of intervals
- 4th order convergence (better than trapezoidal)

### Algorithm: Composite Simpson's Rule

```
Input: f (function), a, b (bounds), n (even intervals)
Output: I (integral approximation)

Precondition: n is even

1. if n is odd: n ← n + 1
2. h ← (b - a) / n
3. sum_odd ← 0   // Coefficients of 4
4. sum_even ← 0  // Coefficients of 2
5.
6. for i = 1 to n-1 by 2:
7.     sum_odd ← sum_odd + f(a + i·h)
8.
9. for i = 2 to n-2 by 2:
10.    sum_even ← sum_even + f(a + i·h)
11.
12. I ← h/3 · [f(a) + 4·sum_odd + 2·sum_even + f(b)]
13. return I
```

**Complexity:** O(n) function evaluations

### Handling Odd Number of Points

**Simpson's 3/8 rule** (4 points):
```
∫ₐᵇ f(x) dx ≈ 3h/8 · [f(x₀) + 3f(x₁) + 3f(x₂) + f(x₃)]
```

**Strategy for odd n:**
1. Apply Simpson's 1/3 rule to first n-3 points (even number)
2. Apply Simpson's 3/8 rule to last 4 points
3. Sum the results

### Pseudocode: TypeScript Implementation

```typescript
export function simps(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 100
): number {
  // Ensure even number of intervals
  if (n % 2 !== 0) n += 1

  const h = (b - a) / n
  let sum_odd = 0
  let sum_even = 0

  // Odd indices (coefficient 4)
  for (let i = 1; i < n; i += 2) {
    sum_odd += f(a + i * h)
  }

  // Even indices (coefficient 2)
  for (let i = 2; i < n; i += 2) {
    sum_even += f(a + i * h)
  }

  return (h / 3) * (f(a) + 4 * sum_odd + 2 * sum_even + f(b))
}

// For tabulated data
export function simpsData(x: number[], y: number[]): number {
  const n = y.length - 1

  if (n < 2) {
    throw new Error('Need at least 3 points')
  }

  // Check for uniform spacing
  const h = x[1] - x[0]
  const is_uniform = x.every((xi, i) =>
    i === 0 || Math.abs((xi - x[i-1]) - h) < 1e-10
  )

  if (!is_uniform) {
    // Fall back to trapezoidal for non-uniform
    return trapzData(x, y)
  }

  if (n % 2 === 0) {
    // Even number of intervals - use Simpson's 1/3
    let sum_odd = 0
    let sum_even = 0

    for (let i = 1; i < n; i += 2) {
      sum_odd += y[i]
    }
    for (let i = 2; i < n; i += 2) {
      sum_even += y[i]
    }

    return (h / 3) * (y[0] + 4 * sum_odd + 2 * sum_even + y[n])
  } else {
    // Odd number of intervals - use 1/3 + 3/8
    let sum_odd = 0
    let sum_even = 0

    // Simpson's 1/3 for first n-3 intervals
    for (let i = 1; i < n - 3; i += 2) {
      sum_odd += y[i]
    }
    for (let i = 2; i < n - 3; i += 2) {
      sum_even += y[i]
    }

    const I_13 = (h / 3) * (y[0] + 4 * sum_odd + 2 * sum_even + y[n-3])

    // Simpson's 3/8 for last 3 intervals (4 points)
    const I_38 = (3 * h / 8) * (y[n-3] + 3 * y[n-2] + 3 * y[n-1] + y[n])

    return I_13 + I_38 - y[n-3] * h  // Adjust for overlap
  }
}
```

### WASM Optimization

```typescript
// WASM kernel for uniform grid
export function simps_wasm(
  f_values: Float64Array,
  h: number
): f64 {
  const n = f_values.length - 1

  let sum_odd: f64 = 0
  let sum_even: f64 = 0

  for (let i = 1; i < n; i += 2) {
    sum_odd += f_values[i]
  }

  for (let i = 2; i < n; i += 2) {
    sum_even += f_values[i]
  }

  return (h / 3) * (f_values[0] + 4 * sum_odd + 2 * sum_even + f_values[n])
}
```

---

## Task 3: Adaptive Quadrature (quad)

### Mathematical Background

Adaptive quadrature automatically refines the integration based on error estimates:

**Gauss-Kronrod G7K15**:
- 7-point Gauss rule (for integral estimate)
- 15-point Kronrod extension (for error estimate)
- Reuses the 7 Gauss points + adds 8 new points

**Error estimation:**
```
E ≈ |I_K15 - I_G7|
```

**Refinement strategy:**
- If E > tolerance: subdivide interval and recurse
- If E ≤ tolerance: accept I_K15

### Gauss-Kronrod G7K15 Nodes and Weights

**7-point Gauss nodes** (on [-1, 1]):
```
x_G7 = [
  ±0.9491079123427585,
  ±0.7415311855993945,
  ±0.4058451513773972,
  0.0
]
```

**7-point Gauss weights:**
```
w_G7 = [
  0.1294849661688697,
  0.2797053914892767,
  0.3818300505051189,
  0.4179591836734694
]
```

**15-point Kronrod nodes** (includes G7 + 8 new):
```
x_K15 = [
  ±0.9914553711208126,  // New
  ±0.9491079123427585,  // Gauss
  ±0.8648644233597691,  // New
  ±0.7415311855993945,  // Gauss
  ±0.5860872354676911,  // New
  ±0.4058451513773972,  // Gauss
  ±0.2077849550078985,  // New
  0.0                    // Gauss
]
```

**15-point Kronrod weights:**
```
w_K15 = [
  0.0229353220105292,
  0.0630920926299786,
  0.1047900103222502,
  0.1406532597155259,
  0.1690047266392679,
  0.1903505780647854,
  0.2044329400752989,
  0.2094821410847278
]
```

### Algorithm: Adaptive Gauss-Kronrod Quadrature

```
Input: f (function), a, b (bounds), tol (tolerance), max_depth
Output: I (integral), error estimate

1. function quad_adaptive(f, a, b, tol, depth):
2.     // Transform to [-1, 1]
3.     mid ← (a + b) / 2
4.     half_length ← (b - a) / 2
5.
6.     // Compute G7 and K15 estimates
7.     I_G7 ← gauss_7_point(f, a, b)
8.     I_K15 ← kronrod_15_point(f, a, b)
9.
10.    error ← |I_K15 - I_G7|
11.
12.    // Check convergence
13.    if error < tol or depth > max_depth:
14.        return (I_K15, error)
15.
16.    // Subdivide
17.    (I_left, e_left) ← quad_adaptive(f, a, mid, tol/2, depth+1)
18.    (I_right, e_right) ← quad_adaptive(f, mid, b, tol/2, depth+1)
19.
20.    return (I_left + I_right, e_left + e_right)
```

**Complexity:** O(n) evaluations, n depends on function smoothness

### Pseudocode: TypeScript Implementation

```typescript
interface QuadResult {
  value: number
  error: number
  evaluations: number
}

// Gauss-Kronrod nodes and weights (scaled to [-1, 1])
const G7_NODES = [
  0.0,
  0.4058451513773972,
  -0.4058451513773972,
  0.7415311855993945,
  -0.7415311855993945,
  0.9491079123427585,
  -0.9491079123427585
]

const G7_WEIGHTS = [
  0.4179591836734694,
  0.3818300505051189,
  0.3818300505051189,
  0.2797053914892767,
  0.2797053914892767,
  0.1294849661688697,
  0.1294849661688697
]

const K15_NODES = [
  0.0,
  0.2077849550078985,
  -0.2077849550078985,
  0.4058451513773972,
  -0.4058451513773972,
  0.5860872354676911,
  -0.5860872354676911,
  0.7415311855993945,
  -0.7415311855993945,
  0.8648644233597691,
  -0.8648644233597691,
  0.9491079123427585,
  -0.9491079123427585,
  0.9914553711208126,
  -0.9914553711208126
]

const K15_WEIGHTS = [
  0.2094821410847278,
  0.2044329400752989,
  0.2044329400752989,
  0.1903505780647854,
  0.1903505780647854,
  0.1690047266392679,
  0.1690047266392679,
  0.1406532597155259,
  0.1406532597155259,
  0.1047900103222502,
  0.1047900103222502,
  0.0630920926299786,
  0.0630920926299786,
  0.0229353220105292,
  0.0229353220105292
]

function gaussKronrod(
  f: (x: number) => number,
  a: number,
  b: number
): { g7: number; k15: number; evals: number } {
  const mid = (a + b) / 2
  const half_length = (b - a) / 2

  let g7_sum = 0
  let k15_sum = 0
  let evals = 0

  // Evaluate at all K15 nodes
  const f_values = new Map<number, number>()

  for (let i = 0; i < K15_NODES.length; i++) {
    const x = mid + half_length * K15_NODES[i]
    const fx = f(x)
    f_values.set(K15_NODES[i], fx)
    k15_sum += K15_WEIGHTS[i] * fx
    evals++
  }

  // Reuse values for G7
  for (let i = 0; i < G7_NODES.length; i++) {
    const fx = f_values.get(G7_NODES[i])!
    g7_sum += G7_WEIGHTS[i] * fx
  }

  return {
    g7: half_length * g7_sum,
    k15: half_length * k15_sum,
    evals
  }
}

export function quad(
  f: (x: number) => number,
  a: number,
  b: number,
  options: {
    tol?: number
    max_depth?: number
  } = {}
): QuadResult {
  const tol = options.tol ?? 1e-10
  const max_depth = options.max_depth ?? 50

  function adaptiveQuad(
    a: number,
    b: number,
    tol: number,
    depth: number
  ): QuadResult {
    const { g7, k15, evals } = gaussKronrod(f, a, b)
    const error = Math.abs(k15 - g7)

    // Base case: error acceptable or max depth reached
    if (error < tol || depth >= max_depth) {
      return { value: k15, error, evaluations: evals }
    }

    // Recursive case: subdivide
    const mid = (a + b) / 2
    const left = adaptiveQuad(a, mid, tol / 2, depth + 1)
    const right = adaptiveQuad(mid, b, tol / 2, depth + 1)

    return {
      value: left.value + right.value,
      error: left.error + right.error,
      evaluations: evals + left.evaluations + right.evaluations
    }
  }

  return adaptiveQuad(a, b, tol, 0)
}
```

### Error Analysis

**Error estimate quality:**
```
True error ≈ c · |I_K15 - I_G7|
```
where c ≈ 1-2 for smooth functions.

**Advantages:**
- Automatically handles difficult regions
- Efficient for smooth functions
- Reliable error estimates

**Disadvantages:**
- Many function evaluations for singular/oscillatory functions
- Recursive overhead
- May struggle with discontinuities

### WASM Optimization

```typescript
// WASM helper for Gauss-Kronrod evaluation
export function gauss_kronrod_wasm(
  f_callback: (x: f64) => f64,
  a: f64,
  b: f64
): { g7: f64, k15: f64 } {
  const mid = (a + b) / 2
  const half_length = (b - a) / 2

  let g7_sum: f64 = 0
  let k15_sum: f64 = 0

  // Store function values to reuse
  const f_values = new StaticArray<f64>(15)

  for (let i = 0; i < 15; i++) {
    const x = mid + half_length * K15_NODES[i]
    f_values[i] = f_callback(x)
    k15_sum += K15_WEIGHTS[i] * f_values[i]
  }

  // Compute G7 using subset of points
  const g7_indices = [0, 3, 4, 7, 8, 11, 12]
  for (let i = 0; i < 7; i++) {
    g7_sum += G7_WEIGHTS[i] * f_values[g7_indices[i]]
  }

  return { g7: half_length * g7_sum, k15: half_length * k15_sum }
}
```

**Parallel optimization**: Subdivide interval into chunks and integrate in parallel.

---

## Task 4: Gauss-Legendre Quadrature

### Mathematical Background

Gauss-Legendre quadrature achieves exact integration for polynomials of degree ≤ 2n-1 using n points:

```
∫₋₁¹ f(x) dx ≈ Σᵢ₌₁ⁿ wᵢ f(xᵢ)
```

**Nodes**: Roots of Legendre polynomial Pₙ(x)
**Weights**: Computed from nodes

**Transform to [a, b]:**
```
∫ₐᵇ f(x) dx = (b-a)/2 · ∫₋₁¹ f((b-a)/2 · t + (a+b)/2) dt
```

### Computing Nodes and Weights

**Method 1: Eigenvalue approach** (Golub-Welsch algorithm)

Legendre polynomials satisfy:
```
x·Pₙ(x) = (n+1)/(2n+1)·Pₙ₊₁(x) + n/(2n+1)·Pₙ₋₁(x)
```

This gives a tridiagonal Jacobi matrix J where:
- Eigenvalues = Gauss nodes
- Weights = 2 · (first component of eigenvector)²

```
J = [
  0    β₁   0    0   ...
  β₁   0    β₂   0   ...
  0    β₂   0    β₃  ...
  ...
]

where βᵢ = i / √(4i² - 1)
```

**Method 2: Newton-Raphson** (faster for high n)

Roots of Pₙ(x) via Newton iteration:
```
xₖ₊₁ = xₖ - Pₙ(xₖ) / P'ₙ(xₖ)
```

Use recurrence relation for evaluation.

### Algorithm: Gauss-Legendre Nodes/Weights (Golub-Welsch)

```
Input: n (number of points)
Output: x (nodes), w (weights)

1. // Build tridiagonal Jacobi matrix
2. J ← zeros(n, n)
3. for i = 1 to n-1:
4.     βᵢ ← i / √(4i² - 1)
5.     J[i, i+1] ← βᵢ
6.     J[i+1, i] ← βᵢ
7.
8. // Compute eigendecomposition
9. (eigenvalues, eigenvectors) ← eig(J)
10.
11. // Sort eigenvalues (nodes)
12. x ← sort(eigenvalues)
13.
14. // Compute weights from eigenvectors
15. for i = 1 to n:
16.     w[i] ← 2 · (first component of eigenvector[i])²
17.
18. return (x, w)
```

**Complexity:** O(n²) for eigendecomposition

### Algorithm: Newton-Raphson Method

```
Input: n (number of points)
Output: x (nodes), w (weights)

1. function legendre_polynomial(n, x):
2.     // Compute Pₙ(x) and P'ₙ(x) using recurrence
3.     P[0] ← 1
4.     P[1] ← x
5.     for k = 2 to n:
6.         P[k] ← ((2k-1)·x·P[k-1] - (k-1)·P[k-2]) / k
7.
8.     // Derivative: (n+1)·Pₙ₊₁(x) = x·P'ₙ(x) - P'ₙ₋₁(x)
9.     P'ₙ ← n·(x·P[n] - P[n-1]) / (x² - 1)
10.    return (P[n], P'ₙ)
11.
12. // Find roots via Newton-Raphson
13. x ← zeros(n)
14. for i = 1 to n:
15.     // Initial guess (Chebyshev approximation)
16.     x[i] ← cos(π·(i - 0.25) / (n + 0.5))
17.
18.     // Newton iteration
19.     for iter = 1 to max_iter:
20.         (p, dp) ← legendre_polynomial(n, x[i])
21.         x[i] ← x[i] - p / dp
22.         if |p| < tol: break
23.
24. // Compute weights
25. w ← zeros(n)
26. for i = 1 to n:
27.     (_, dp) ← legendre_polynomial(n, x[i])
28.     w[i] ← 2 / ((1 - x[i]²) · dp²)
29.
30. return (x, w)
```

**Complexity:** O(n² · k) where k is Newton iterations (typically 3-5)

### Pseudocode: TypeScript Implementation

```typescript
export function gaussLegendre(n: number): { nodes: number[]; weights: number[] } {
  const nodes = new Array(n)
  const weights = new Array(n)

  // Helper: Evaluate Legendre polynomial and derivative
  function legendrePolynomial(n: number, x: number): { p: number; dp: number } {
    const P = new Array(n + 1)
    P[0] = 1
    P[1] = x

    for (let k = 2; k <= n; k++) {
      P[k] = ((2 * k - 1) * x * P[k - 1] - (k - 1) * P[k - 2]) / k
    }

    // Derivative formula: (x² - 1) P'ₙ(x) = n[x Pₙ(x) - Pₙ₋₁(x)]
    const dp = (n * (x * P[n] - P[n - 1])) / (x * x - 1)

    return { p: P[n], dp }
  }

  // Find roots via Newton-Raphson
  for (let i = 0; i < n; i++) {
    // Initial guess (Chebyshev nodes)
    let x = Math.cos(Math.PI * (i + 0.75) / (n + 0.5))

    // Newton iteration
    const maxIter = 10
    const tol = 1e-15

    for (let iter = 0; iter < maxIter; iter++) {
      const { p, dp } = legendrePolynomial(n, x)
      const dx = p / dp
      x -= dx

      if (Math.abs(dx) < tol) break
    }

    nodes[i] = x

    // Compute weight
    const { dp } = legendrePolynomial(n, x)
    weights[i] = 2 / ((1 - x * x) * dp * dp)
  }

  return { nodes, weights }
}

export function quadGauss(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 10
): number {
  const { nodes, weights } = gaussLegendre(n)

  // Transform from [-1, 1] to [a, b]
  const mid = (a + b) / 2
  const half_length = (b - a) / 2

  let sum = 0
  for (let i = 0; i < n; i++) {
    const x = mid + half_length * nodes[i]
    sum += weights[i] * f(x)
  }

  return half_length * sum
}
```

### Precomputed Nodes and Weights

**n = 5:**
```
nodes = [
  -0.9061798459386640,
  -0.5384693101056831,
   0.0,
   0.5384693101056831,
   0.9061798459386640
]

weights = [
  0.2369268850561891,
  0.4786286704993665,
  0.5688888888888889,
  0.4786286704993665,
  0.2369268850561891
]
```

**n = 10:**
```
nodes = [
  -0.9739065285171717,
  -0.8650633666889845,
  -0.6794095682990244,
  -0.4333953941292472,
  -0.1488743389816312,
   0.1488743389816312,
   0.4333953941292472,
   0.6794095682990244,
   0.8650633666889845,
   0.9739065285171717
]

weights = [
  0.0666713443086881,
  0.1494513491505806,
  0.2190863625159820,
  0.2692667193099963,
  0.2955242247147529,
  0.2955242247147529,
  0.2692667193099963,
  0.2190863625159820,
  0.1494513491505806,
  0.0666713443086881
]
```

### Error Analysis

**Error for smooth functions:**
```
E = (2^(2n+1) · (n!)^4) / ((2n+1) · ((2n)!)^3) · f^(2n)(ξ)
```

**Properties:**
- Exact for polynomials of degree ≤ 2n-1
- Exponential convergence for analytic functions
- Error ≈ O(e^(-cn)) for some c > 0

**Optimal for smooth functions:**
- Fewest evaluations for given accuracy
- But: nodes must be recomputed if n changes

---

## Task 5: Romberg Integration

### Mathematical Background

Romberg integration uses Richardson extrapolation on the trapezoidal rule:

**Trapezoidal estimates** with h = (b-a)/2^k:
```
T(h) = h/2 · [f(a) + 2∑f(xᵢ) + f(b)]
```

**Richardson extrapolation:**
```
R(k, m) = (4^m · R(k, m-1) - R(k-1, m-1)) / (4^m - 1)
```

where:
- R(k, 0) = T(h_k) with h_k = (b-a)/2^k
- R(k, m) has error O(h^(2m+2))

**Romberg table:**
```
R(0,0)
R(1,0)  R(1,1)
R(2,0)  R(2,1)  R(2,2)
R(3,0)  R(3,1)  R(3,2)  R(3,3)
...
```

Each column improves accuracy by 2 orders.

### Algorithm: Romberg Integration

```
Input: f (function), a, b (bounds), tol (tolerance), max_iter
Output: I (integral estimate), error

1. R ← matrix of zeros
2. h ← b - a
3.
4. // First trapezoidal estimate
5. R[0, 0] ← h/2 · (f(a) + f(b))
6.
7. for k = 1 to max_iter:
8.     // Compute T(h/2^k) using previous values
9.     sum ← 0
10.    for i = 1 to 2^(k-1):
11.        x ← a + (2i - 1) · h / 2^k
12.        sum ← sum + f(x)
13.    R[k, 0] ← R[k-1, 0]/2 + h/2^k · sum
14.
15.    // Richardson extrapolation
16.    for m = 1 to k:
17.        R[k, m] ← (4^m · R[k, m-1] - R[k-1, m-1]) / (4^m - 1)
18.
19.    // Check convergence
20.    if k > 0 and |R[k, k] - R[k-1, k-1]| < tol:
21.        return (R[k, k], |R[k, k] - R[k-1, k-1]|)
22.
23. return (R[max_iter, max_iter], error_estimate)
```

**Complexity:** O(2^n) function evaluations for n iterations

### Pseudocode: TypeScript Implementation

```typescript
interface RombergResult {
  value: number
  error: number
  iterations: number
  table: number[][]
}

export function romberg(
  f: (x: number) => number,
  a: number,
  b: number,
  options: {
    tol?: number
    max_iter?: number
  } = {}
): RombergResult {
  const tol = options.tol ?? 1e-10
  const max_iter = options.max_iter ?? 20

  const R: number[][] = []
  const h = b - a

  // Initialize first row
  R[0] = [0]
  R[0][0] = (h / 2) * (f(a) + f(b))

  for (let k = 1; k <= max_iter; k++) {
    R[k] = new Array(k + 1)

    // Compute trapezoidal estimate with h/2^k
    let sum = 0
    const step = h / Math.pow(2, k)
    const num_new_points = Math.pow(2, k - 1)

    for (let i = 1; i <= num_new_points; i++) {
      const x = a + (2 * i - 1) * step
      sum += f(x)
    }

    R[k][0] = R[k - 1][0] / 2 + step * sum

    // Richardson extrapolation
    for (let m = 1; m <= k; m++) {
      const power = Math.pow(4, m)
      R[k][m] = (power * R[k][m - 1] - R[k - 1][m - 1]) / (power - 1)
    }

    // Check convergence
    if (k > 0) {
      const error = Math.abs(R[k][k] - R[k - 1][k - 1])
      if (error < tol) {
        return {
          value: R[k][k],
          error,
          iterations: k,
          table: R
        }
      }
    }
  }

  const error = Math.abs(R[max_iter][max_iter] - R[max_iter - 1][max_iter - 1])

  return {
    value: R[max_iter][max_iter],
    error,
    iterations: max_iter,
    table: R
  }
}
```

### Interpretation of Romberg Table

**Column meanings:**
- Column 0: Trapezoidal rule with decreasing h
- Column 1: Simpson's rule equivalent
- Column 2: Boole's rule equivalent
- Column m: Order O(h^(2m+2)) accuracy

**Example table:**
```
1.0000000
0.7500000  0.6666667
0.7083333  0.6944444  0.6931746
0.6970833  0.6933594  0.6931488  0.6931473
```

Diagonal elements converge to true value.

### Error Analysis

**Error in R(k, m):**
```
E ≈ c · h^(2m+2)
```

**Convergence:**
- Each extrapolation step gains 2 orders of magnitude
- Very efficient for smooth functions
- May fail for non-smooth functions

---

## Task 6: Infinite Interval Integration (quadinf)

### Mathematical Background

For infinite intervals, use variable transformations:

**Type 1: [a, ∞)**
```
∫ₐ^∞ f(x) dx = ∫₀¹ f(a + (1-t)/t) / t² dt
```
Substitution: x = a + (1-t)/t

**Type 2: (-∞, b]**
```
∫₋∞ᵇ f(x) dx = ∫₀¹ f(b - t/(1-t)) / (1-t)² dt
```
Substitution: x = b - t/(1-t)

**Type 3: (-∞, ∞)**
```
∫₋∞^∞ f(x) dx = ∫₋₁¹ f(sinh(πx/2)) · cosh(πx/2) · π/2 dx
```
Tanh-sinh transformation (double exponential)

**Type 4: Exponentially decaying**
```
∫ₐ^∞ f(x) e^(-x) dx
```
Use Gauss-Laguerre quadrature

### Tanh-Sinh Transformation (Double Exponential)

**Best for smooth, rapidly decaying functions:**

```
x = sinh(π/2 · sinh(t))
dx = π/2 · cosh(π/2 · sinh(t)) · cosh(t) dt

∫₋∞^∞ f(x) dx = ∫₋∞^∞ f(sinh(π/2 · sinh(t))) · g(t) dt
```

where g(t) = π/2 · cosh(π/2 · sinh(t)) · cosh(t)

**Properties:**
- Integrand decays double-exponentially at endpoints
- Excellent for smooth functions
- Truncate to finite interval [-M, M]

### Algorithm: Infinite Interval Integration

```
Input: f (function), a, b (bounds, may be ±∞), tol
Output: I (integral estimate)

1. if a = -∞ and b = ∞:
2.     // Tanh-sinh transformation
3.     g(t) ← f(sinh(π/2 · sinh(t))) · π/2 · cosh(π/2·sinh(t)) · cosh(t)
4.     return quad_adaptive(g, -M, M, tol)  // M ≈ 3-4
5.
6. else if a is finite and b = ∞:
7.     // Transform [a, ∞) → (0, 1]
8.     g(t) ← f(a + (1-t)/t) / t²
9.     return quad_adaptive(g, 0+ε, 1, tol)  // ε ≈ 1e-10
10.
11. else if a = -∞ and b is finite:
12.    // Transform (-∞, b] → [0, 1)
13.    g(t) ← f(b - t/(1-t)) / (1-t)²
14.    return quad_adaptive(g, 0, 1-ε, tol)
15.
16. else:
17.    // Both finite
18.    return quad_adaptive(f, a, b, tol)
```

### Pseudocode: TypeScript Implementation

```typescript
export function quadinf(
  f: (x: number) => number,
  a: number,
  b: number,
  options: { tol?: number } = {}
): QuadResult {
  const tol = options.tol ?? 1e-10
  const eps = 1e-10

  // Case 1: (-∞, ∞)
  if (a === -Infinity && b === Infinity) {
    // Tanh-sinh transformation
    const g = (t: number) => {
      const sinh_t = Math.sinh(t)
      const arg = (Math.PI / 2) * sinh_t
      const x = Math.sinh(arg)
      const weight = (Math.PI / 2) * Math.cosh(arg) * Math.cosh(t)
      return f(x) * weight
    }

    // Integrate over [-M, M] where tanh-sinh decays to ~0
    const M = 3.5
    return quad(g, -M, M, { tol })
  }

  // Case 2: [a, ∞)
  if (a !== -Infinity && b === Infinity) {
    const g = (t: number) => {
      const x = a + (1 - t) / t
      const weight = 1 / (t * t)
      return f(x) * weight
    }

    return quad(g, eps, 1, { tol })
  }

  // Case 3: (-∞, b]
  if (a === -Infinity && b !== Infinity) {
    const g = (t: number) => {
      const x = b - t / (1 - t)
      const weight = 1 / ((1 - t) * (1 - t))
      return f(x) * weight
    }

    return quad(g, 0, 1 - eps, { tol })
  }

  // Case 4: [a, b] (both finite)
  return quad(f, a, b, { tol })
}

// Alternative: Gauss-Laguerre for exp(-x) weight
export function quadLaguerre(
  f: (x: number) => number,
  n: number = 10
): number {
  // Integrate ∫₀^∞ f(x) e^(-x) dx
  const { nodes, weights } = gaussLaguerre(n)

  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += weights[i] * f(nodes[i])
  }

  return sum
}
```

### Gauss-Laguerre Nodes and Weights

For ∫₀^∞ f(x) e^(-x) dx:

**n = 5:**
```
nodes = [
  0.26356031971814109,
  1.41340305910651679,
  3.59642577104072208,
  7.08581000585883755,
  12.6408008442757826
]

weights = [
  0.52175561058280865,
  0.39866681108317592,
  0.07594244968170744,
  0.00361175867992205,
  0.00002336997238577
]
```

### Error Analysis

**Tanh-sinh method:**
- Error decays like O(e^(-c·n)) (double exponential)
- Excellent for smooth functions
- May struggle with singularities at finite points

**Transformation methods:**
- Accuracy depends on integrand behavior at infinity
- Singularity at t=0 or t=1 if f doesn't decay fast enough
- Use adaptive quadrature to handle singularities

---

## Task 7: 2D Integration (dblquad)

### Mathematical Background

Double integral over rectangle [a,b] × [c,d]:

```
∫ₐᵇ ∫_c^d f(x, y) dy dx
```

**Method 1: Iterated 1D quadrature**
```
I = ∫ₐᵇ [∫_c^d f(x, y) dy] dx
  = ∫ₐᵇ g(x) dx

where g(x) = ∫_c^d f(x, y) dy
```

**Method 2: Product rules**

For tensor-product grids:
```
∫∫ f(x,y) dx dy ≈ Σᵢ Σⱼ wᵢ wⱼ f(xᵢ, yⱼ)
```

### Variable Limits

For y limits depending on x:
```
∫ₐᵇ ∫_{c(x)}^{d(x)} f(x, y) dy dx
```

Inner integral limits change with x.

### Algorithm: Double Integration (Iterated)

```
Input: f(x, y), a, b, c(x), d(x), tol
Output: I (integral estimate)

1. function inner_integral(x):
2.     // Integrate over y for fixed x
3.     c_x ← c(x)
4.     d_x ← d(x)
5.     return quad(λy. f(x, y), c_x, d_x, tol/√2)
6.
7. // Outer integral over x
8. I ← quad(inner_integral, a, b, tol/√2)
9. return I
```

**Complexity:** O(n²) if using n points for each integral

### Algorithm: Product Gauss Quadrature

```
Input: f(x, y), a, b, c, d, n_x, n_y
Output: I (integral estimate)

1. (x_nodes, x_weights) ← gaussLegendre(n_x)
2. (y_nodes, y_weights) ← gaussLegendre(n_y)
3.
4. // Transform nodes to [a, b] and [c, d]
5. mid_x ← (a + b) / 2
6. half_x ← (b - a) / 2
7. mid_y ← (c + d) / 2
8. half_y ← (d - c) / 2
9.
10. sum ← 0
11. for i = 1 to n_x:
12.     x ← mid_x + half_x · x_nodes[i]
13.     for j = 1 to n_y:
14.         y ← mid_y + half_y · y_nodes[j]
15.         sum ← sum + x_weights[i] · y_weights[j] · f(x, y)
16.
17. I ← half_x · half_y · sum
18. return I
```

### Pseudocode: TypeScript Implementation

```typescript
export function dblquad(
  f: (x: number, y: number) => number,
  a: number,
  b: number,
  c: number | ((x: number) => number),
  d: number | ((x: number) => number),
  options: { tol?: number } = {}
): QuadResult {
  const tol = options.tol ?? 1e-8

  // Inner tolerance: distribute error budget
  const tol_inner = tol / Math.sqrt(2)
  const tol_outer = tol / Math.sqrt(2)

  // Handle variable limits
  const c_func = typeof c === 'function' ? c : () => c
  const d_func = typeof d === 'function' ? d : () => d

  // Define inner integral as function of x
  const innerIntegral = (x: number): number => {
    const c_x = c_func(x)
    const d_x = d_func(x)

    const result = quad(
      (y: number) => f(x, y),
      c_x,
      d_x,
      { tol: tol_inner }
    )

    return result.value
  }

  // Outer integral
  return quad(innerIntegral, a, b, { tol: tol_outer })
}

// Product quadrature (fixed rectangular domain)
export function dblquadProduct(
  f: (x: number, y: number) => number,
  a: number,
  b: number,
  c: number,
  d: number,
  n_x: number = 10,
  n_y: number = 10
): number {
  const { nodes: x_nodes, weights: x_weights } = gaussLegendre(n_x)
  const { nodes: y_nodes, weights: y_weights } = gaussLegendre(n_y)

  // Transform to [a, b] × [c, d]
  const mid_x = (a + b) / 2
  const half_x = (b - a) / 2
  const mid_y = (c + d) / 2
  const half_y = (d - c) / 2

  let sum = 0

  for (let i = 0; i < n_x; i++) {
    const x = mid_x + half_x * x_nodes[i]

    for (let j = 0; j < n_y; j++) {
      const y = mid_y + half_y * y_nodes[j]
      sum += x_weights[i] * y_weights[j] * f(x, y)
    }
  }

  return half_x * half_y * sum
}
```

### Error Analysis

**Iterated quadrature:**
```
E_total ≈ √(E_x² + E_y²)
```

Distribute tolerance: use tol/√2 for each dimension.

**Product Gauss:**
- Exact for f(x,y) = p(x) · q(y) where p, q are polynomials
- Error: O(e^(-c·min(n_x, n_y))) for smooth functions

### WASM Optimization

```typescript
// WASM kernel for product quadrature
export function dblquad_product_wasm(
  f_callback: (x: f64, y: f64) => f64,
  a: f64,
  b: f64,
  c: f64,
  d: f64,
  n_x: i32,
  n_y: i32
): f64 {
  const x_nodes = gaussLegendreNodes(n_x)
  const x_weights = gaussLegendreWeights(n_x)
  const y_nodes = gaussLegendreNodes(n_y)
  const y_weights = gaussLegendreWeights(n_y)

  const mid_x = (a + b) / 2
  const half_x = (b - a) / 2
  const mid_y = (c + d) / 2
  const half_y = (d - c) / 2

  let sum: f64 = 0

  for (let i = 0; i < n_x; i++) {
    const x = mid_x + half_x * x_nodes[i]

    for (let j = 0; j < n_y; j++) {
      const y = mid_y + half_y * y_nodes[j]
      sum += x_weights[i] * y_weights[j] * f_callback(x, y)
    }
  }

  return half_x * half_y * sum
}
```

**Parallel optimization**: Divide x domain into chunks and integrate in parallel.

---

## Task 8: Monte Carlo Integration

### Mathematical Background

Use random sampling to estimate integral:

```
∫ₐᵇ f(x) dx ≈ (b-a)/n · Σᵢ₌₁ⁿ f(Xᵢ)
```

where Xᵢ ~ Uniform[a, b]

**Variance:**
```
Var[I] = (b-a)² / n · Var[f(X)]
```

**Standard error:**
```
σ = (b-a)/√n · √(1/(n-1) Σ(f(Xᵢ) - μ)²)
```

**Confidence interval (95%):**
```
I ± 1.96 · σ
```

### Importance Sampling

Use proposal distribution p(x) to reduce variance:

```
∫ₐᵇ f(x) dx = ∫ₐᵇ f(x)/p(x) · p(x) dx ≈ 1/n Σᵢ f(Xᵢ)/p(Xᵢ)
```

where Xᵢ ~ p(x)

**Optimal p(x):**
```
p(x) = |f(x)| / ∫|f(t)| dt
```

Minimizes variance but requires knowing the integral!

**Practical approach:**
- Use normal distribution centered at peak
- Use exponential for monotonic functions
- Adaptive: estimate p(x) from initial samples

### Algorithm: Simple Monte Carlo

```
Input: f (function), a, b (bounds), n (samples)
Output: I (estimate), σ (error)

1. sum ← 0
2. sum_sq ← 0
3.
4. for i = 1 to n:
5.     x ← a + (b-a) · random()  // Uniform [a, b]
6.     f_x ← f(x)
7.     sum ← sum + f_x
8.     sum_sq ← sum_sq + f_x²
9.
10. mean ← sum / n
11. variance ← (sum_sq - n · mean²) / (n - 1)
12.
13. I ← (b - a) · mean
14. σ ← (b - a) / √n · √variance
15.
16. return (I, σ)
```

**Complexity:** O(n) function evaluations

### Algorithm: Importance Sampling

```
Input: f, a, b, p (proposal density), p_sample (sampler), n
Output: I (estimate), σ (error)

1. sum ← 0
2. sum_sq ← 0
3.
4. for i = 1 to n:
5.     x ← p_sample()  // Sample from p(x)
6.     if x < a or x > b: continue
7.
8.     ratio ← f(x) / p(x)
9.     sum ← sum + ratio
10.    sum_sq ← sum_sq + ratio²
11.
12. mean ← sum / n
13. variance ← (sum_sq - n · mean²) / (n - 1)
14.
15. I ← mean
16. σ ← √variance / √n
17.
18. return (I, σ)
```

### Pseudocode: TypeScript Implementation

```typescript
interface MonteCarloResult {
  value: number
  error: number
  confidence_interval: [number, number]
  samples: number
}

export function montecarlo(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 10000
): MonteCarloResult {
  let sum = 0
  let sum_sq = 0

  for (let i = 0; i < n; i++) {
    const x = a + (b - a) * Math.random()
    const fx = f(x)
    sum += fx
    sum_sq += fx * fx
  }

  const mean = sum / n
  const variance = (sum_sq - n * mean * mean) / (n - 1)

  const I = (b - a) * mean
  const sigma = (b - a) * Math.sqrt(variance / n)

  // 95% confidence interval
  const z = 1.96
  const ci: [number, number] = [I - z * sigma, I + z * sigma]

  return {
    value: I,
    error: sigma,
    confidence_interval: ci,
    samples: n
  }
}

// Adaptive Monte Carlo (stop when error < tol)
export function montecarloAdaptive(
  f: (x: number) => number,
  a: number,
  b: number,
  options: {
    tol?: number
    max_samples?: number
    batch_size?: number
  } = {}
): MonteCarloResult {
  const tol = options.tol ?? 1e-4
  const max_samples = options.max_samples ?? 1e6
  const batch_size = options.batch_size ?? 1000

  let sum = 0
  let sum_sq = 0
  let n = 0

  while (n < max_samples) {
    // Evaluate batch
    for (let i = 0; i < batch_size; i++) {
      const x = a + (b - a) * Math.random()
      const fx = f(x)
      sum += fx
      sum_sq += fx * fx
      n++
    }

    // Check convergence
    if (n >= 2 * batch_size) {
      const mean = sum / n
      const variance = (sum_sq - n * mean * mean) / (n - 1)
      const sigma = (b - a) * Math.sqrt(variance / n)

      if (sigma < tol) {
        const I = (b - a) * mean
        return {
          value: I,
          error: sigma,
          confidence_interval: [I - 1.96 * sigma, I + 1.96 * sigma],
          samples: n
        }
      }
    }
  }

  // Max samples reached
  const mean = sum / n
  const variance = (sum_sq - n * mean * mean) / (n - 1)
  const I = (b - a) * mean
  const sigma = (b - a) * Math.sqrt(variance / n)

  return {
    value: I,
    error: sigma,
    confidence_interval: [I - 1.96 * sigma, I + 1.96 * sigma],
    samples: n
  }
}

// Importance sampling with normal proposal
export function montecarloImportance(
  f: (x: number) => number,
  a: number,
  b: number,
  options: {
    n?: number
    center?: number
    std?: number
  } = {}
): MonteCarloResult {
  const n = options.n ?? 10000
  const center = options.center ?? (a + b) / 2
  const std = options.std ?? (b - a) / 6

  // Normal PDF
  const normalPDF = (x: number): number => {
    const z = (x - center) / std
    return Math.exp(-z * z / 2) / (std * Math.sqrt(2 * Math.PI))
  }

  // Box-Muller for normal sampling
  const normalSample = (): number => {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return center + std * z
  }

  let sum = 0
  let sum_sq = 0
  let valid_samples = 0

  for (let i = 0; i < n; i++) {
    const x = normalSample()

    // Only count samples in [a, b]
    if (x >= a && x <= b) {
      const ratio = f(x) / normalPDF(x)
      sum += ratio
      sum_sq += ratio * ratio
      valid_samples++
    }
  }

  const mean = sum / valid_samples
  const variance = (sum_sq - valid_samples * mean * mean) / (valid_samples - 1)
  const sigma = Math.sqrt(variance / valid_samples)

  return {
    value: mean,
    error: sigma,
    confidence_interval: [mean - 1.96 * sigma, mean + 1.96 * sigma],
    samples: valid_samples
  }
}
```

### Multi-dimensional Monte Carlo

For d-dimensional integrals:

```typescript
export function montecarloND(
  f: (x: number[]) => number,
  bounds: [number, number][],  // [[a₁, b₁], [a₂, b₂], ...]
  n: number = 10000
): MonteCarloResult {
  const d = bounds.length
  let sum = 0
  let sum_sq = 0

  // Compute volume
  let volume = 1
  for (const [a, b] of bounds) {
    volume *= (b - a)
  }

  for (let i = 0; i < n; i++) {
    const x = bounds.map(([a, b]) => a + (b - a) * Math.random())
    const fx = f(x)
    sum += fx
    sum_sq += fx * fx
  }

  const mean = sum / n
  const variance = (sum_sq - n * mean * mean) / (n - 1)

  const I = volume * mean
  const sigma = volume * Math.sqrt(variance / n)

  return {
    value: I,
    error: sigma,
    confidence_interval: [I - 1.96 * sigma, I + 1.96 * sigma],
    samples: n
  }
}
```

### Error Analysis

**Convergence rate:**
```
Error = O(1/√n)
```

Independent of dimension! (Curse of dimensionality doesn't apply)

**Advantages:**
- Simple to implement
- Works in high dimensions
- Easy to parallelize
- Error estimate included

**Disadvantages:**
- Slow convergence (need 100x samples for 10x accuracy)
- Not suitable for high-precision requirements
- Variance depends on function smoothness

### WASM Parallelization

```typescript
// Parallel Monte Carlo using Web Workers
export async function montecarloParallel(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number,
  num_workers: number = 4
): Promise<MonteCarloResult> {
  const samples_per_worker = Math.floor(n / num_workers)

  // Create workers
  const workers = Array(num_workers).fill(null).map(() =>
    new Worker('montecarlo-worker.js')
  )

  // Distribute work
  const promises = workers.map((worker, i) =>
    new Promise<{ sum: number; sum_sq: number }>((resolve) => {
      worker.postMessage({
        f: f.toString(),
        a,
        b,
        n: samples_per_worker,
        seed: i  // Different seed per worker
      })

      worker.onmessage = (e) => resolve(e.data)
    })
  )

  // Aggregate results
  const results = await Promise.all(promises)

  let total_sum = 0
  let total_sum_sq = 0

  for (const { sum, sum_sq } of results) {
    total_sum += sum
    total_sum_sq += sum_sq
  }

  const total_n = num_workers * samples_per_worker
  const mean = total_sum / total_n
  const variance = (total_sum_sq - total_n * mean * mean) / (total_n - 1)

  const I = (b - a) * mean
  const sigma = (b - a) * Math.sqrt(variance / total_n)

  // Cleanup
  workers.forEach(w => w.terminate())

  return {
    value: I,
    error: sigma,
    confidence_interval: [I - 1.96 * sigma, I + 1.96 * sigma],
    samples: total_n
  }
}
```

---

## Summary Table

| Method | Order | Best For | Evaluations | Adaptivity |
|--------|-------|----------|-------------|------------|
| Trapezoidal | O(h²) | Quick estimates, tabulated data | n | No |
| Simpson's | O(h⁴) | Smooth functions, better accuracy | n | No |
| Gauss-Kronrod | O(h⁷) | High accuracy, adaptive | Variable | Yes |
| Gauss-Legendre | O(e^(-cn)) | Smooth functions, fixed n | n | No |
| Romberg | O(h^(2m)) | Very smooth functions | 2^m | No |
| Tanh-sinh | O(e^(-e^n)) | Infinite intervals, smooth | Variable | Yes |
| Product quad | O(e^(-c·min(n_x,n_y))) | 2D rectangular domains | n_x · n_y | No |
| Monte Carlo | O(1/√n) | High dimensions, complex domains | n | Yes |

## Performance Optimization Guidelines

### WASM Strategies

1. **Pre-compute nodes/weights**: Store Gauss tables in WASM memory
2. **Vectorize summation loops**: Use SIMD for weight × value products
3. **Batch function evaluations**: Reduce callback overhead
4. **Inline transformations**: Compute coordinate transforms in WASM

### Parallel Strategies

1. **Domain decomposition**: Divide integral into independent chunks
2. **Adaptive subdivision**: Parallelize over difficult subintervals
3. **Monte Carlo**: Embarrassingly parallel (different seeds per thread)
4. **Pipeline**: Evaluate function in parallel, accumulate serially

### Accuracy Recommendations

- **Low precision (1e-3)**: Trapezoidal or Simpson's
- **Medium precision (1e-8)**: Gauss-Kronrod adaptive
- **High precision (1e-12)**: Romberg or high-order Gauss
- **Very high (1e-15)**: Tanh-sinh or arbitrary precision library

### When to Use Each Method

**Trapezoidal:**
- Tabulated data (unevenly spaced)
- Quick rough estimates
- Cumulative integration needed

**Simpson's:**
- Smooth functions
- Better than trapezoidal, same cost
- Tabulated data (evenly spaced)

**Adaptive Gauss-Kronrod:**
- Default choice for general integration
- Unknown smoothness
- Automatic error control

**Gauss-Legendre:**
- Very smooth functions
- Fixed computational budget
- Maximum accuracy per evaluation

**Romberg:**
- Very smooth functions
- Can afford doubling sample sizes
- Want to see convergence table

**Infinite interval:**
- Integral over unbounded domain
- Use tanh-sinh if smooth
- Use Gauss-Laguerre if exponential weight

**2D Integration:**
- Product quadrature for rectangles
- Iterated quadrature for variable limits
- Monte Carlo for complex domains

**Monte Carlo:**
- Dimensions > 4
- Complex integration domains
- Don't need high precision
- Easy to parallelize

## Testing Strategy

### Unit Tests

```typescript
// Test against known integrals
test('polynomial integral', () => {
  // ∫₀¹ x² dx = 1/3
  const f = (x: number) => x * x
  const result = quad(f, 0, 1)
  expect(result.value).toBeCloseTo(1/3, 10)
})

test('exponential integral', () => {
  // ∫₀¹ e^x dx = e - 1
  const f = (x: number) => Math.exp(x)
  const result = simps(f, 0, 1, 1000)
  expect(result).toBeCloseTo(Math.E - 1, 8)
})

test('infinite interval', () => {
  // ∫₀^∞ e^(-x) dx = 1
  const f = (x: number) => Math.exp(-x)
  const result = quadinf(f, 0, Infinity)
  expect(result.value).toBeCloseTo(1, 6)
})
```

### Performance Benchmarks

```typescript
benchmark('integration methods', () => {
  const f = (x: number) => Math.sin(x) * Math.exp(-x * x)

  bench('trapezoidal', () => trapz(f, 0, 10, 1000))
  bench('simpson', () => simps(f, 0, 10, 1000))
  bench('gauss-legendre', () => quadGauss(f, 0, 10, 50))
  bench('adaptive', () => quad(f, 0, 10))
  bench('romberg', () => romberg(f, 0, 10))
})
```

## References

1. **Numerical Recipes** (Press et al.) - Comprehensive coverage
2. **Abramowitz & Stegun** - Tables of nodes and weights
3. **QUADPACK** - Fortran library (gold standard)
4. **SciPy** - Python reference implementation
5. **GSL** - GNU Scientific Library

## Implementation Checklist

- [ ] Trapezoidal rule (uniform and non-uniform grids)
- [ ] Simpson's 1/3 and 3/8 rules
- [ ] Gauss-Kronrod G7K15 adaptive quadrature
- [ ] Gauss-Legendre node/weight computation
- [ ] Romberg integration with table output
- [ ] Infinite interval transformations (tanh-sinh)
- [ ] 2D integration (iterated and product)
- [ ] Monte Carlo (simple, adaptive, importance sampling)
- [ ] WASM kernels for all methods
- [ ] Parallel implementations for adaptive/MC
- [ ] Comprehensive test suite
- [ ] Performance benchmarks
- [ ] Documentation and examples
