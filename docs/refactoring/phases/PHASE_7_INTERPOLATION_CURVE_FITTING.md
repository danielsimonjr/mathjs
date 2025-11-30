# Phase 7: Interpolation & Curve Fitting

**Status**: Planning
**Priority**: High
**Estimated Complexity**: High
**Dependencies**: Phase 2 (Matrix Operations), Phase 4 (Linear Algebra)

## Overview

This phase implements advanced interpolation and curve fitting algorithms essential for data analysis, scientific computing, and engineering applications. These algorithms enable:

- **Data interpolation** at arbitrary points
- **Curve fitting** to experimental data
- **Polynomial approximation** and root finding
- **Regression analysis** with statistical metrics

All implementations will be optimized with WASM acceleration for performance-critical operations.

---

## Performance Targets

| Algorithm | JavaScript | WASM | Parallel |
|-----------|-----------|------|----------|
| Linear Interpolation (1000 points) | Baseline | 3-5x | N/A |
| Cubic Spline (1000 points) | Baseline | 5-8x | N/A |
| PCHIP (1000 points) | Baseline | 4-7x | N/A |
| 2D Interpolation (100×100) | Baseline | 6-10x | 2-3x |
| Polyfit (degree 10, 1000 points) | Baseline | 8-12x | N/A |
| Curve Fitting (LM, 1000 points) | Baseline | 10-15x | N/A |
| Linear Regression (10000 points) | Baseline | 5-8x | 2-3x |
| Polynomial Roots (degree 50) | Baseline | 12-18x | N/A |

---

## Task 1: Linear Interpolation (interp1)

### Algorithm Description

Linear interpolation (lerp) finds values at arbitrary points by linear approximation between known data points. Supports multiple methods:

1. **Linear** - Piecewise linear interpolation
2. **Nearest** - Nearest neighbor
3. **Next** - Next higher value
4. **Previous** - Previous lower value
5. **Spline** - Cubic spline (delegates to Task 2)
6. **PCHIP** - Shape-preserving (delegates to Task 3)

### Mathematical Formulation

Given data points `(x₀, y₀), (x₁, y₁), ..., (xₙ, yₙ)` where `x` is sorted, find `y(x*)` for query point `x*`.

**Linear method:**
```
Find interval: xᵢ ≤ x* ≤ xᵢ₊₁
Compute weight: t = (x* - xᵢ) / (xᵢ₊₁ - xᵢ)
Interpolate: y(x*) = (1 - t) · yᵢ + t · yᵢ₊₁
           = yᵢ + t · (yᵢ₊₁ - yᵢ)
```

**Extrapolation handling:**
- `x* < x₀`: Use slope from first interval or constant extrapolation
- `x* > xₙ`: Use slope from last interval or constant extrapolation

### Algorithm: Binary Search for Interval

```
FUNCTION find_interval(x, x_query):
    INPUT:
        x: sorted array of x-coordinates [n]
        x_query: query point
    OUTPUT:
        i: index such that x[i] ≤ x_query ≤ x[i+1]

    # Handle boundary cases
    IF x_query < x[0]:
        RETURN -1  # Left extrapolation
    IF x_query > x[n-1]:
        RETURN n-1  # Right extrapolation
    IF x_query == x[n-1]:
        RETURN n-2  # Edge case: exact match at end

    # Binary search
    left = 0
    right = n - 1

    WHILE right - left > 1:
        mid = (left + right) / 2
        IF x_query < x[mid]:
            right = mid
        ELSE:
            left = mid

    RETURN left
END FUNCTION
```

### Pseudocode: Linear Interpolation

```
FUNCTION interp1(x, y, x_query, method='linear', extrap='const'):
    INPUT:
        x: array of x-coordinates [n], must be sorted
        y: array of y-values [n]
        x_query: query points [m]
        method: interpolation method
        extrap: extrapolation strategy ('const', 'linear', 'extrap', NaN)
    OUTPUT:
        y_interp: interpolated values [m]

    # Validate inputs
    ASSERT length(x) == length(y)
    ASSERT length(x) >= 2
    ASSERT is_sorted(x)

    # Allocate output
    y_interp = new Array[length(x_query)]

    # Process each query point
    FOR k = 0 TO length(x_query) - 1:
        xq = x_query[k]
        i = find_interval(x, xq)

        # Handle extrapolation
        IF i == -1:  # Left extrapolation
            IF extrap == 'const':
                y_interp[k] = y[0]
            ELSE IF extrap == 'linear':
                slope = (y[1] - y[0]) / (x[1] - x[0])
                y_interp[k] = y[0] + slope * (xq - x[0])
            ELSE IF extrap == 'extrap':
                # Use first interval
                t = (xq - x[0]) / (x[1] - x[0])
                y_interp[k] = y[0] + t * (y[1] - y[0])
            ELSE:
                y_interp[k] = NaN
            CONTINUE

        IF i == n - 1:  # Right extrapolation
            IF extrap == 'const':
                y_interp[k] = y[n-1]
            ELSE IF extrap == 'linear':
                slope = (y[n-1] - y[n-2]) / (x[n-1] - x[n-2])
                y_interp[k] = y[n-1] + slope * (xq - x[n-1])
            ELSE IF extrap == 'extrap':
                # Use last interval
                t = (xq - x[n-2]) / (x[n-1] - x[n-2])
                y_interp[k] = y[n-2] + t * (y[n-1] - y[n-2])
            ELSE:
                y_interp[k] = NaN
            CONTINUE

        # Interpolation
        IF method == 'linear':
            t = (xq - x[i]) / (x[i+1] - x[i])
            y_interp[k] = y[i] + t * (y[i+1] - y[i])

        ELSE IF method == 'nearest':
            mid = 0.5 * (x[i] + x[i+1])
            y_interp[k] = (xq < mid) ? y[i] : y[i+1]

        ELSE IF method == 'next':
            y_interp[k] = y[i+1]

        ELSE IF method == 'previous':
            y_interp[k] = y[i]

    RETURN y_interp
END FUNCTION
```

### WASM Optimization Strategy

1. **Vectorize search**: SIMD binary search for multiple queries
2. **Cache locality**: Process queries in sorted order
3. **Branchless interpolation**: Use multiplication instead of conditionals
4. **Prefetch**: Prefetch next interval data

---

## Task 2: Cubic Spline Interpolation

### Algorithm Description

Cubic splines provide smooth interpolation using piecewise cubic polynomials with continuous first and second derivatives. Each interval `[xᵢ, xᵢ₊₁]` has a cubic polynomial:

```
Sᵢ(x) = aᵢ + bᵢ(x - xᵢ) + cᵢ(x - xᵢ)² + dᵢ(x - xᵢ)³
```

### Mathematical Formulation

**Continuity conditions:**
- `Sᵢ(xᵢ) = yᵢ` (value continuity)
- `Sᵢ(xᵢ₊₁) = yᵢ₊₁` (value continuity)
- `S'ᵢ(xᵢ₊₁) = S'ᵢ₊₁(xᵢ₊₁)` (first derivative continuity)
- `S''ᵢ(xᵢ₊₁) = S''ᵢ₊₁(xᵢ₊₁)` (second derivative continuity)

**Simplified form using second derivatives:**

Let `Mᵢ = S''(xᵢ)` be the second derivative at each point. Then:

```
hᵢ = xᵢ₊₁ - xᵢ

Sᵢ(x) = Mᵢ/(6hᵢ) · (xᵢ₊₁ - x)³ + Mᵢ₊₁/(6hᵢ) · (x - xᵢ)³
      + [yᵢ/hᵢ - Mᵢhᵢ/6] · (xᵢ₊₁ - x)
      + [yᵢ₊₁/hᵢ - Mᵢ₊₁hᵢ/6] · (x - xᵢ)
```

**Tridiagonal system for M:**

The continuity of first derivatives leads to a tridiagonal system:

```
hᵢ₋₁·Mᵢ₋₁ + 2(hᵢ₋₁ + hᵢ)·Mᵢ + hᵢ·Mᵢ₊₁ = 6(Δᵢ - Δᵢ₋₁)

where: Δᵢ = (yᵢ₊₁ - yᵢ) / hᵢ
```

In matrix form:

```
┌                                    ┐ ┌    ┐   ┌         ┐
│ [BC]                               │ │ M₀ │   │  [BC]   │
│ h₀  2(h₀+h₁)  h₁                   │ │ M₁ │   │ 6(Δ₁-Δ₀)│
│     h₁  2(h₁+h₂)  h₂               │ │ M₂ │ = │ 6(Δ₂-Δ₁)│
│         ...                        │ │... │   │   ...   │
│              hₙ₋₂  2(hₙ₋₂+hₙ₋₁) hₙ₋₁│ │Mₙ₋₁│   │6(Δₙ₋₁-Δₙ₋₂)│
│                               [BC] │ │ Mₙ │   │  [BC]   │
└                                    ┘ └    ┘   └         ┘
```

**Boundary conditions:**

1. **Natural spline**: `M₀ = Mₙ = 0` (zero second derivative at endpoints)
2. **Clamped spline**: Specify `S'(x₀) = f'₀` and `S'(xₙ) = f'ₙ`
   ```
   2h₀·M₀ + h₀·M₁ = 6(Δ₀ - f'₀)
   hₙ₋₁·Mₙ₋₁ + 2hₙ₋₁·Mₙ = 6(f'ₙ - Δₙ₋₁)
   ```
3. **Not-a-knot**: Force third derivative continuity at `x₁` and `xₙ₋₁`
4. **Periodic**: `S'(x₀) = S'(xₙ)` and `S''(x₀) = S''(xₙ)`

### Pseudocode: Cubic Spline

```
FUNCTION cubic_spline(x, y, bc_type='natural', bc_left=0, bc_right=0):
    INPUT:
        x: array of x-coordinates [n], sorted
        y: array of y-values [n]
        bc_type: 'natural', 'clamped', 'not-a-knot', 'periodic'
        bc_left, bc_right: boundary condition values for clamped
    OUTPUT:
        spline: object containing {x, y, M, h}

    n = length(x)
    h = new Array[n-1]
    delta = new Array[n-1]

    # Compute intervals and slopes
    FOR i = 0 TO n-2:
        h[i] = x[i+1] - x[i]
        delta[i] = (y[i+1] - y[i]) / h[i]

    # Build tridiagonal system: A·M = b
    A_diag = new Array[n]      # Diagonal
    A_upper = new Array[n-1]   # Upper diagonal
    A_lower = new Array[n-1]   # Lower diagonal
    b = new Array[n]           # Right-hand side

    # Interior equations
    FOR i = 1 TO n-2:
        A_lower[i-1] = h[i-1]
        A_diag[i] = 2 * (h[i-1] + h[i])
        A_upper[i] = h[i]
        b[i] = 6 * (delta[i] - delta[i-1])

    # Boundary conditions
    IF bc_type == 'natural':
        A_diag[0] = 1
        A_upper[0] = 0
        b[0] = 0
        A_lower[n-2] = 0
        A_diag[n-1] = 1
        b[n-1] = 0

    ELSE IF bc_type == 'clamped':
        A_diag[0] = 2 * h[0]
        A_upper[0] = h[0]
        b[0] = 6 * (delta[0] - bc_left)

        A_lower[n-2] = h[n-2]
        A_diag[n-1] = 2 * h[n-2]
        b[n-1] = 6 * (bc_right - delta[n-2])

    ELSE IF bc_type == 'not-a-knot':
        # Force S'''(x₁⁻) = S'''(x₁⁺)
        A_diag[0] = h[1]
        A_upper[0] = -(h[0] + h[1])
        b[0] = 0

        # Force S'''(xₙ₋₁⁻) = S'''(xₙ₋₁⁺)
        A_lower[n-2] = -(h[n-3] + h[n-2])
        A_diag[n-1] = h[n-3]
        b[n-1] = 0

    ELSE IF bc_type == 'periodic':
        # This requires special handling - circular tridiagonal
        # (Implementation omitted for brevity)
        PASS

    # Solve tridiagonal system
    M = solve_tridiagonal(A_lower, A_diag, A_upper, b)

    RETURN {x, y, M, h}
END FUNCTION
```

### Pseudocode: Spline Evaluation

```
FUNCTION evaluate_spline(spline, x_query):
    INPUT:
        spline: {x, y, M, h}
        x_query: query points [m]
    OUTPUT:
        y_interp: interpolated values [m]

    y_interp = new Array[length(x_query)]

    FOR k = 0 TO length(x_query) - 1:
        xq = x_query[k]
        i = find_interval(spline.x, xq)

        # Handle extrapolation (use linear)
        IF i < 0 OR i >= n-1:
            y_interp[k] = linear_extrapolate(...)
            CONTINUE

        # Evaluate cubic on interval [xᵢ, xᵢ₊₁]
        dx = xq - spline.x[i]
        dx_right = spline.x[i+1] - xq
        h = spline.h[i]

        # Cubic formula
        term1 = spline.M[i] * dx_right^3 / (6 * h)
        term2 = spline.M[i+1] * dx^3 / (6 * h)
        term3 = (spline.y[i] - spline.M[i] * h^2 / 6) * dx_right / h
        term4 = (spline.y[i+1] - spline.M[i+1] * h^2 / 6) * dx / h

        y_interp[k] = term1 + term2 + term3 + term4

    RETURN y_interp
END FUNCTION
```

### Algorithm: Tridiagonal Solver (Thomas Algorithm)

```
FUNCTION solve_tridiagonal(a, b, c, d):
    INPUT:
        a: lower diagonal [n-1]
        b: main diagonal [n]
        c: upper diagonal [n-1]
        d: right-hand side [n]
    OUTPUT:
        x: solution [n]

    n = length(b)
    c_prime = new Array[n-1]
    d_prime = new Array[n]
    x = new Array[n]

    # Forward sweep
    c_prime[0] = c[0] / b[0]
    d_prime[0] = d[0] / b[0]

    FOR i = 1 TO n-2:
        denom = b[i] - a[i-1] * c_prime[i-1]
        c_prime[i] = c[i] / denom
        d_prime[i] = (d[i] - a[i-1] * d_prime[i-1]) / denom

    d_prime[n-1] = (d[n-1] - a[n-2] * d_prime[n-2]) /
                   (b[n-1] - a[n-2] * c_prime[n-2])

    # Back substitution
    x[n-1] = d_prime[n-1]
    FOR i = n-2 DOWN TO 0:
        x[i] = d_prime[i] - c_prime[i] * x[i+1]

    RETURN x
END FUNCTION
```

### WASM Optimization Strategy

1. **In-place tridiagonal solve**: Minimize memory allocation
2. **Vectorized evaluation**: SIMD for cubic polynomial evaluation
3. **Cache spline coefficients**: Precompute `aᵢ, bᵢ, cᵢ, dᵢ` for fast evaluation

---

## Task 3: PCHIP (Piecewise Cubic Hermite Interpolating Polynomial)

### Algorithm Description

PCHIP is a shape-preserving interpolation method that ensures:
- **Monotonicity preservation**: If data is monotonic, interpolant is too
- **No overshoot**: Interpolant stays within data range
- **C¹ continuity**: First derivatives are continuous

Uses the Fritsch-Carlson algorithm to compute slopes at each point.

### Mathematical Formulation

**Hermite cubic on each interval:**

```
Hᵢ(x) = yᵢ·h₀₀(t) + yᵢ₊₁·h₁₀(t) + mᵢ·hᵢ·h₀₁(t) + mᵢ₊₁·hᵢ·h₁₁(t)

where:
    t = (x - xᵢ) / hᵢ
    h₀₀(t) = (1 + 2t)(1 - t)²      # Hermite basis
    h₁₀(t) = t²(3 - 2t)
    h₀₁(t) = t(1 - t)²
    h₁₁(t) = t²(t - 1)
    mᵢ = derivative at xᵢ
```

**Slope calculation (Fritsch-Carlson):**

Step 1: Compute secant slopes
```
δᵢ = (yᵢ₊₁ - yᵢ) / hᵢ
```

Step 2: Initialize slopes at interior points
```
IF δᵢ₋₁ and δᵢ have opposite signs:
    mᵢ = 0  # Local extremum
ELSE:
    # Weighted harmonic mean
    w₁ = 2hᵢ + hᵢ₋₁
    w₂ = hᵢ + 2hᵢ₋₁
    mᵢ = (w₁ + w₂) / (w₁/δᵢ₋₁ + w₂/δᵢ)
```

Step 3: Adjust slopes to preserve monotonicity
```
FOR each interval i:
    IF δᵢ == 0:  # Flat segment
        mᵢ = 0
        mᵢ₊₁ = 0
    ELSE:
        # Check Fritsch-Carlson condition
        α = mᵢ / δᵢ
        β = mᵢ₊₁ / δᵢ

        IF α² + β² > 9:
            τ = 3 / sqrt(α² + β²)
            mᵢ = τ · α · δᵢ
            mᵢ₊₁ = τ · β · δᵢ
```

Step 4: Boundary slopes (one-sided differences)
```
# Left boundary
m₀ = ((2h₀ + h₁)δ₀ - h₀·δ₁) / (h₀ + h₁)
IF sign(m₀) ≠ sign(δ₀):
    m₀ = 0
ELSE IF sign(δ₀) ≠ sign(δ₁) AND |m₀| > 3|δ₀|:
    m₀ = 3δ₀

# Right boundary (similar)
```

### Pseudocode: PCHIP

```
FUNCTION pchip(x, y):
    INPUT:
        x: array of x-coordinates [n], sorted
        y: array of y-values [n]
    OUTPUT:
        pchip: object {x, y, m, h}

    n = length(x)
    h = new Array[n-1]
    delta = new Array[n-1]
    m = new Array[n]  # Slopes

    # Step 1: Compute secant slopes
    FOR i = 0 TO n-2:
        h[i] = x[i+1] - x[i]
        delta[i] = (y[i+1] - y[i]) / h[i]

    # Step 2: Interior slopes
    FOR i = 1 TO n-2:
        IF sign(delta[i-1]) != sign(delta[i]):
            m[i] = 0  # Local extremum
        ELSE IF delta[i-1] == 0 OR delta[i] == 0:
            m[i] = 0
        ELSE:
            # Weighted harmonic mean
            w1 = 2*h[i] + h[i-1]
            w2 = h[i] + 2*h[i-1]
            m[i] = (w1 + w2) / (w1/delta[i-1] + w2/delta[i])

    # Step 3: Boundary slopes
    # Left boundary
    m[0] = ((2*h[0] + h[1])*delta[0] - h[0]*delta[1]) / (h[0] + h[1])
    IF sign(m[0]) != sign(delta[0]):
        m[0] = 0
    ELSE IF sign(delta[0]) != sign(delta[1]) AND abs(m[0]) > 3*abs(delta[0]):
        m[0] = 3 * delta[0]

    # Right boundary
    m[n-1] = ((2*h[n-2] + h[n-3])*delta[n-2] - h[n-2]*delta[n-3]) / (h[n-2] + h[n-3])
    IF sign(m[n-1]) != sign(delta[n-2]):
        m[n-1] = 0
    ELSE IF sign(delta[n-3]) != sign(delta[n-2]) AND abs(m[n-1]) > 3*abs(delta[n-2]):
        m[n-1] = 3 * delta[n-2]

    # Step 4: Monotonicity enforcement
    FOR i = 0 TO n-2:
        IF delta[i] == 0:
            m[i] = 0
            m[i+1] = 0
        ELSE:
            alpha = m[i] / delta[i]
            beta = m[i+1] / delta[i]

            IF alpha*alpha + beta*beta > 9:
                tau = 3 / sqrt(alpha*alpha + beta*beta)
                m[i] = tau * alpha * delta[i]
                m[i+1] = tau * beta * delta[i]

    RETURN {x, y, m, h}
END FUNCTION
```

### Pseudocode: PCHIP Evaluation

```
FUNCTION evaluate_pchip(pchip, x_query):
    INPUT:
        pchip: {x, y, m, h}
        x_query: query points [k]
    OUTPUT:
        y_interp: interpolated values [k]

    y_interp = new Array[length(x_query)]

    FOR k = 0 TO length(x_query) - 1:
        xq = x_query[k]
        i = find_interval(pchip.x, xq)

        # Handle extrapolation
        IF i < 0 OR i >= n-1:
            y_interp[k] = linear_extrapolate(...)
            CONTINUE

        # Compute normalized parameter
        t = (xq - pchip.x[i]) / pchip.h[i]

        # Hermite basis functions
        h00 = (1 + 2*t) * (1 - t)^2
        h10 = t^2 * (3 - 2*t)
        h01 = t * (1 - t)^2
        h11 = t^2 * (t - 1)

        # Evaluate
        y_interp[k] = pchip.y[i] * h00 +
                      pchip.y[i+1] * h10 +
                      pchip.m[i] * pchip.h[i] * h01 +
                      pchip.m[i+1] * pchip.h[i] * h11

    RETURN y_interp
END FUNCTION
```

### WASM Optimization Strategy

1. **Vectorized slope calculation**: SIMD for harmonic mean
2. **Horner's method**: Evaluate Hermite basis efficiently
3. **Fused multiply-add**: Use FMA instructions for polynomial evaluation

---

## Task 4: 2D Interpolation (interp2)

### Algorithm Description

Extends 1D interpolation to 2D grids. Supports:
1. **Bilinear**: Linear interpolation in both directions
2. **Bicubic**: Cubic interpolation in both directions
3. **Nearest**: Nearest grid point
4. **Spline**: 2D cubic spline

### Mathematical Formulation

**Bilinear interpolation:**

Given grid points `(x₀, y₀), (x₁, y₀), (x₀, y₁), (x₁, y₁)` with values `Q₀₀, Q₁₀, Q₀₁, Q₁₁`, interpolate at `(x, y)`:

```
t = (x - x₀) / (x₁ - x₀)
u = (y - y₀) / (y₁ - y₀)

# Interpolate in x-direction first
R₀ = (1-t)·Q₀₀ + t·Q₁₀
R₁ = (1-t)·Q₀₁ + t·Q₁₁

# Then in y-direction
P = (1-u)·R₀ + u·R₁
  = (1-t)(1-u)·Q₀₀ + t(1-u)·Q₁₀ + (1-t)u·Q₀₁ + tu·Q₁₁
```

**Bicubic interpolation:**

Uses 16 surrounding grid points. For interval `[xᵢ, xᵢ₊₁] × [yⱼ, yⱼ₊₁]`, evaluate:

```
P(x, y) = Σ(k=0 to 3) Σ(l=0 to 3) aₖₗ · tᵏ · uˡ

where:
    t = (x - xᵢ) / (xᵢ₊₁ - xᵢ)
    u = (y - yⱼ) / (yⱼ₊₁ - yⱼ)
```

The 16 coefficients `aₖₗ` are determined by:
- Function values at 4 corners
- x-derivatives at 4 corners
- y-derivatives at 4 corners
- Cross-derivatives at 4 corners

**Coefficient matrix equation:**

```
┌ a₀₀ a₀₁ a₀₂ a₀₃ ┐       ┌ f(i,j)   f(i,j+1)   ∂f/∂y(i,j)   ∂f/∂y(i,j+1)   ┐
│ a₁₀ a₁₁ a₁₂ a₁₃ │   -1  │ f(i+1,j) f(i+1,j+1) ∂f/∂y(i+1,j) ∂f/∂y(i+1,j+1) │
│ a₂₀ a₂₁ a₂₂ a₂₃ │ = M · │ ∂f/∂x(i,j) ...                                    │
└ a₃₀ a₃₁ a₃₂ a₃₃ ┘       └ ∂²f/∂x∂y(i,j) ...                                 ┘

where M is the basis transformation matrix.
```

### Pseudocode: Bilinear Interpolation

```
FUNCTION interp2_bilinear(x, y, Z, x_query, y_query):
    INPUT:
        x: x-coordinates [nx], sorted
        y: y-coordinates [ny], sorted
        Z: grid values [ny × nx]
        x_query: query x-points [m]
        y_query: query y-points [m]
    OUTPUT:
        Z_interp: interpolated values [m]

    Z_interp = new Array[length(x_query)]

    FOR k = 0 TO length(x_query) - 1:
        xq = x_query[k]
        yq = y_query[k]

        # Find grid cell
        i = find_interval(x, xq)
        j = find_interval(y, yq)

        # Handle extrapolation
        IF i < 0 OR i >= nx-1 OR j < 0 OR j >= ny-1:
            Z_interp[k] = extrapolate_2d(...)
            CONTINUE

        # Compute normalized coordinates
        t = (xq - x[i]) / (x[i+1] - x[i])
        u = (yq - y[j]) / (y[j+1] - y[j])

        # Bilinear formula
        Q00 = Z[j, i]
        Q10 = Z[j, i+1]
        Q01 = Z[j+1, i]
        Q11 = Z[j+1, i+1]

        Z_interp[k] = (1-t)*(1-u)*Q00 + t*(1-u)*Q10 +
                      (1-t)*u*Q01 + t*u*Q11

    RETURN Z_interp
END FUNCTION
```

### Pseudocode: Bicubic Interpolation

```
FUNCTION interp2_bicubic(x, y, Z, x_query, y_query):
    INPUT:
        x: x-coordinates [nx], sorted
        y: y-coordinates [ny], sorted
        Z: grid values [ny × nx]
        x_query: query x-points [m]
        y_query: query y-points [m]
    OUTPUT:
        Z_interp: interpolated values [m]

    # Precompute derivatives (central differences)
    dZ_dx = compute_gradient_x(Z, x)  # [ny × nx]
    dZ_dy = compute_gradient_y(Z, y)  # [ny × nx]
    d2Z_dxdy = compute_gradient_x(dZ_dy, x)  # [ny × nx]

    Z_interp = new Array[length(x_query)]

    FOR k = 0 TO length(x_query) - 1:
        xq = x_query[k]
        yq = y_query[k]

        # Find grid cell
        i = find_interval(x, xq)
        j = find_interval(y, yq)

        # Handle extrapolation
        IF i < 0 OR i >= nx-1 OR j < 0 OR j >= ny-1:
            Z_interp[k] = extrapolate_2d(...)
            CONTINUE

        # Get 16 values
        f = [Z[j:j+2, i:i+2],          # 4 function values
             dZ_dx[j:j+2, i:i+2],      # 4 x-derivatives
             dZ_dy[j:j+2, i:i+2],      # 4 y-derivatives
             d2Z_dxdy[j:j+2, i:i+2]]   # 4 cross-derivatives

        # Compute coefficients (use precomputed matrix)
        a = bicubic_matrix · f.flatten()

        # Evaluate polynomial
        t = (xq - x[i]) / (x[i+1] - x[i])
        u = (yq - y[j]) / (y[j+1] - y[j])

        result = 0
        FOR p = 0 TO 3:
            FOR q = 0 TO 3:
                result += a[p,q] * t^p * u^q

        Z_interp[k] = result

    RETURN Z_interp
END FUNCTION
```

### Algorithm: Gradient Computation

```
FUNCTION compute_gradient_x(Z, x):
    INPUT:
        Z: grid values [ny × nx]
        x: x-coordinates [nx]
    OUTPUT:
        dZ_dx: x-gradient [ny × nx]

    dZ_dx = new Array[ny, nx]

    FOR j = 0 TO ny-1:
        # Left boundary (forward difference)
        dZ_dx[j, 0] = (Z[j, 1] - Z[j, 0]) / (x[1] - x[0])

        # Interior (central difference)
        FOR i = 1 TO nx-2:
            dZ_dx[j, i] = (Z[j, i+1] - Z[j, i-1]) / (x[i+1] - x[i-1])

        # Right boundary (backward difference)
        dZ_dx[j, nx-1] = (Z[j, nx-1] - Z[j, nx-2]) / (x[nx-1] - x[nx-2])

    RETURN dZ_dx
END FUNCTION
```

### WASM Optimization Strategy

1. **Parallel grid search**: Multi-threaded for large query sets
2. **SIMD bilinear**: 4 queries simultaneously
3. **Cache blocking**: Tile grid for better cache utilization
4. **Precompute gradients**: Store derivatives for bicubic

---

## Task 5: Polynomial Fitting (polyfit)

### Algorithm Description

Fits a polynomial of degree `n` to data points using least squares:

```
p(x) = c₀ + c₁x + c₂x² + ... + cₙxⁿ
```

Minimizes: `Σᵢ [yᵢ - p(xᵢ)]²`

### Mathematical Formulation

**Vandermonde matrix approach:**

The problem is:
```
min ‖Vc - y‖²

where V is the Vandermonde matrix:
┌               ┐
│ 1  x₀  x₀²  ...  x₀ⁿ │
│ 1  x₁  x₁²  ...  x₁ⁿ │
│ ...                   │
│ 1  xₘ  xₘ²  ...  xₘⁿ │
└               ┘
```

**Normal equations:**
```
VᵀVc = Vᵀy

This is ill-conditioned! Don't use directly.
```

**QR decomposition (preferred):**

Compute `V = QR` where `Q` is orthogonal and `R` is upper triangular:
```
‖Vc - y‖² = ‖QRc - y‖² = ‖Rc - Qᵀy‖²

Solve: Rc = Qᵀy (triangular system)
```

**Weighted least squares:**

For weights `wᵢ`:
```
min Σᵢ wᵢ[yᵢ - p(xᵢ)]²

Form: W^(1/2) V c = W^(1/2) y

where W = diag(w₁, w₂, ..., wₘ)
```

### Pseudocode: Polynomial Fit

```
FUNCTION polyfit(x, y, degree, weights=None):
    INPUT:
        x: x-coordinates [m]
        y: y-values [m]
        degree: polynomial degree n
        weights: optional weights [m]
    OUTPUT:
        coeffs: polynomial coefficients [n+1], from c₀ to cₙ
        residual: sum of squared residuals
        rank: rank of Vandermonde matrix

    m = length(x)
    n = degree + 1

    # Check for valid input
    ASSERT m >= n, "Need at least n+1 points for degree n"

    # Build Vandermonde matrix
    V = new Array[m, n]
    FOR i = 0 TO m-1:
        V[i, 0] = 1
        FOR j = 1 TO n-1:
            V[i, j] = V[i, j-1] * x[i]  # x[i]^j

    # Apply weights if provided
    IF weights != None:
        FOR i = 0 TO m-1:
            w_sqrt = sqrt(weights[i])
            FOR j = 0 TO n-1:
                V[i, j] *= w_sqrt
            y[i] *= w_sqrt

    # Solve via QR decomposition
    Q, R = qr_decomposition(V)

    # Check rank
    rank = 0
    eps = 1e-10 * abs(R[0, 0])
    FOR i = 0 TO n-1:
        IF abs(R[i, i]) > eps:
            rank += 1

    IF rank < n:
        WARN "Rank-deficient fit"

    # Solve Rc = Qᵀy
    rhs = Q.transpose() · y
    coeffs = back_substitution(R, rhs)

    # Compute residual
    y_fit = V · coeffs
    residual = sum((y - y_fit)^2)

    RETURN {coeffs, residual, rank}
END FUNCTION
```

### Algorithm: Back Substitution

```
FUNCTION back_substitution(R, b):
    INPUT:
        R: upper triangular matrix [n × n]
        b: right-hand side [n]
    OUTPUT:
        x: solution [n]

    n = length(b)
    x = new Array[n]

    FOR i = n-1 DOWN TO 0:
        sum = b[i]
        FOR j = i+1 TO n-1:
            sum -= R[i, j] * x[j]
        x[i] = sum / R[i, i]

    RETURN x
END FUNCTION
```

### Pseudocode: Polynomial Evaluation (Horner's Method)

```
FUNCTION polyval(coeffs, x):
    INPUT:
        coeffs: polynomial coefficients [n+1], from c₀ to cₙ
        x: evaluation points [m]
    OUTPUT:
        y: polynomial values [m]

    n = length(coeffs) - 1
    y = new Array[length(x)]

    FOR k = 0 TO length(x) - 1:
        # Horner's method: p(x) = c₀ + x(c₁ + x(c₂ + ... + x·cₙ))
        result = coeffs[n]
        FOR i = n-1 DOWN TO 0:
            result = result * x[k] + coeffs[i]
        y[k] = result

    RETURN y
END FUNCTION
```

### WASM Optimization Strategy

1. **Blocked QR**: Cache-friendly QR for large Vandermonde matrices
2. **SIMD Horner**: Vectorized polynomial evaluation
3. **Fused operations**: FMA for accumulation in Horner's method

---

## Task 6: Nonlinear Curve Fitting (Levenberg-Marquardt)

### Algorithm Description

Fits a nonlinear model `f(x; θ)` to data by minimizing:

```
S(θ) = Σᵢ [yᵢ - f(xᵢ; θ)]²
```

Levenberg-Marquardt (LM) is a hybrid between:
- **Gradient descent**: For far from minimum
- **Gauss-Newton**: For near minimum

### Mathematical Formulation

**Gauss-Newton iteration:**

Linearize around current estimate `θₖ`:
```
f(x; θₖ + δ) ≈ f(x; θₖ) + J(θₖ)·δ

where J is the Jacobian matrix:
J[i,j] = ∂f(xᵢ; θ)/∂θⱼ
```

Minimize:
```
min ‖r + Jδ‖²

where r = y - f(x; θₖ) is the residual vector
```

Solution:
```
(JᵀJ)δ = Jᵀr
```

**Levenberg-Marquardt modification:**

Add damping term:
```
(JᵀJ + λI)δ = Jᵀr

where:
- λ > 0 is the damping parameter
- λ → 0: Gauss-Newton (fast near minimum)
- λ → ∞: Gradient descent (stable far from minimum)
```

**Adaptive damping:**
```
ρ = [S(θₖ) - S(θₖ + δ)] / [L(0) - L(δ)]

where L(δ) = ‖r + Jδ‖² is the linear approximation

IF ρ > 0:  # Good step
    Accept: θₖ₊₁ = θₖ + δ
    Decrease: λ = λ / ν
ELSE:      # Bad step
    Reject: θₖ₊₁ = θₖ
    Increase: λ = λ · ν

Typical: ν = 10
```

### Pseudocode: Levenberg-Marquardt

```
FUNCTION levenberg_marquardt(f, jacobian, x_data, y_data, theta0, options):
    INPUT:
        f: model function f(x, theta)
        jacobian: Jacobian function J(x, theta) -> [m × n]
        x_data: independent variable [m]
        y_data: dependent variable [m]
        theta0: initial parameters [n]
        options: {max_iter, tol_f, tol_x, tol_grad, lambda0, nu}
    OUTPUT:
        theta: fitted parameters [n]
        info: {iterations, residual, jacobian, exitflag}

    # Initialize
    theta = theta0
    lambda = options.lambda0  # e.g., 0.01
    nu = options.nu           # e.g., 10
    m = length(x_data)
    n = length(theta)

    # Initial residual and cost
    r = y_data - f(x_data, theta)
    S = 0.5 * sum(r^2)

    FOR iter = 1 TO options.max_iter:
        # Compute Jacobian
        J = jacobian(x_data, theta)

        # Gradient
        g = -J.transpose() · r

        # Check gradient convergence
        IF norm(g, inf) < options.tol_grad:
            exitflag = "gradient"
            BREAK

        # Solve (JᵀJ + λI)δ = Jᵀr
        A = J.transpose() · J
        FOR i = 0 TO n-1:
            A[i, i] += lambda

        delta = solve_linear(A, g)

        # Check step size
        IF norm(delta) < options.tol_x * (norm(theta) + options.tol_x):
            exitflag = "step_size"
            BREAK

        # Try new parameters
        theta_new = theta + delta
        r_new = y_data - f(x_data, theta_new)
        S_new = 0.5 * sum(r_new^2)

        # Predicted reduction
        L_delta = 0.5 * norm(r + J · delta)^2
        predicted_reduction = S - L_delta
        actual_reduction = S - S_new

        # Gain ratio
        rho = actual_reduction / predicted_reduction

        # Update lambda and accept/reject
        IF rho > 0:  # Good step
            theta = theta_new
            r = r_new
            S = S_new
            lambda = lambda * max(1/3, 1 - (2*rho - 1)^3)
            nu = 2

            # Check function convergence
            IF actual_reduction < options.tol_f:
                exitflag = "function"
                BREAK
        ELSE:  # Bad step
            lambda = lambda * nu
            nu = 2 * nu

        # Safety: prevent lambda from becoming too large
        lambda = min(lambda, 1e10)

    IF iter == options.max_iter:
        exitflag = "max_iter"

    RETURN {theta, iter, S, J, exitflag}
END FUNCTION
```

### Pseudocode: Numerical Jacobian

```
FUNCTION numerical_jacobian(f, x_data, theta):
    INPUT:
        f: model function f(x, theta)
        x_data: independent variable [m]
        theta: parameters [n]
    OUTPUT:
        J: Jacobian matrix [m × n]

    m = length(x_data)
    n = length(theta)
    J = new Array[m, n]

    f0 = f(x_data, theta)

    FOR j = 0 TO n-1:
        # Finite difference step
        h = sqrt(eps) * max(abs(theta[j]), 1)

        theta_plus = copy(theta)
        theta_plus[j] += h

        f_plus = f(x_data, theta_plus)

        # Central difference (more accurate)
        theta_minus = copy(theta)
        theta_minus[j] -= h
        f_minus = f(x_data, theta_minus)

        J[:, j] = (f_plus - f_minus) / (2*h)

    RETURN J
END FUNCTION
```

### Convergence Criteria

```
1. Gradient: ‖∇S‖ < tol_grad (e.g., 1e-6)
2. Step size: ‖δ‖ < tol_x·(‖θ‖ + tol_x) (e.g., tol_x = 1e-6)
3. Function: ΔS < tol_f (e.g., 1e-8)
4. Max iterations: iter > max_iter (e.g., 100)
```

### WASM Optimization Strategy

1. **Parallel Jacobian**: Compute columns in parallel
2. **Sparse Jacobian**: Exploit sparsity for large parameter spaces
3. **Cached factorization**: Reuse Cholesky for similar λ values
4. **SIMD residuals**: Vectorize residual computation

---

## Task 7: Linear Regression with Statistics

### Algorithm Description

Fits linear model `y = Xβ + ε` and computes:
- Coefficients `β`
- Standard errors
- t-statistics and p-values
- R², adjusted R²
- F-statistic
- Confidence intervals

### Mathematical Formulation

**Ordinary least squares solution:**

```
β̂ = (XᵀX)⁻¹Xᵀy
```

**Residuals and variance:**

```
r = y - Xβ̂
s² = ‖r‖² / (n - p)  # Residual variance

where:
- n = number of observations
- p = number of parameters (including intercept)
```

**Coefficient covariance:**

```
Cov(β̂) = s² · (XᵀX)⁻¹
```

**Standard errors:**

```
SE(β̂ⱼ) = sqrt(Cov(β̂)[j,j])
```

**t-statistics:**

```
t_j = β̂ⱼ / SE(β̂ⱼ)

Under H₀: βⱼ = 0, tⱼ ~ t(n-p)
```

**p-values:**

```
p_j = 2·P(|T| > |tⱼ|) where T ~ t(n-p)
```

**R² (coefficient of determination):**

```
SST = Σ(yᵢ - ȳ)²         # Total sum of squares
SSE = Σ(yᵢ - ŷᵢ)²         # Error sum of squares
SSR = Σ(ŷᵢ - ȳ)²         # Regression sum of squares

R² = 1 - SSE/SST = SSR/SST
```

**Adjusted R²:**

```
R²_adj = 1 - (1 - R²)·(n - 1)/(n - p)
```

**F-statistic:**

```
F = (SSR / (p-1)) / (SSE / (n-p))

Under H₀: β₁ = β₂ = ... = βₚ₋₁ = 0, F ~ F(p-1, n-p)
```

### Pseudocode: Linear Regression

```
FUNCTION linear_regression(X, y, options):
    INPUT:
        X: design matrix [n × p]
        y: response vector [n]
        options: {intercept=true, alpha=0.05}
    OUTPUT:
        result: {beta, se, t, p, R2, R2_adj, F, F_p, residuals, fitted}

    n = nrows(X)
    p = ncols(X)

    # Add intercept column if requested
    IF options.intercept:
        X = [ones(n, 1), X]
        p += 1

    # Solve via QR decomposition (more stable than normal equations)
    Q, R = qr_decomposition(X)

    # β̂ = R⁻¹Qᵀy
    Qty = Q.transpose() · y
    beta = back_substitution(R, Qty)

    # Fitted values and residuals
    y_fitted = X · beta
    residuals = y - y_fitted

    # Residual variance
    SSE = sum(residuals^2)
    df_error = n - p
    s2 = SSE / df_error

    # Coefficient covariance: (XᵀX)⁻¹ = (RᵀR)⁻¹ = R⁻¹(R⁻¹)ᵀ
    Rinv = invert_upper_triangular(R)
    cov_beta = s2 * (Rinv · Rinv.transpose())

    # Standard errors
    se = new Array[p]
    FOR j = 0 TO p-1:
        se[j] = sqrt(cov_beta[j, j])

    # t-statistics and p-values
    t_stats = new Array[p]
    p_values = new Array[p]
    FOR j = 0 TO p-1:
        t_stats[j] = beta[j] / se[j]
        p_values[j] = 2 * (1 - tcdf(abs(t_stats[j]), df_error))

    # R² and adjusted R²
    y_mean = mean(y)
    SST = sum((y - y_mean)^2)
    R2 = 1 - SSE / SST
    R2_adj = 1 - (1 - R2) * (n - 1) / df_error

    # F-statistic
    df_model = p - 1  # Excluding intercept
    SSR = SST - SSE
    MSR = SSR / df_model
    MSE = SSE / df_error
    F_stat = MSR / MSE
    F_pvalue = 1 - fcdf(F_stat, df_model, df_error)

    # Confidence intervals
    t_crit = tinv(1 - options.alpha/2, df_error)
    ci_lower = beta - t_crit * se
    ci_upper = beta + t_crit * se

    RETURN {
        beta, se, t_stats, p_values,
        R2, R2_adj,
        F_stat, F_pvalue,
        residuals, y_fitted,
        ci_lower, ci_upper,
        cov_beta
    }
END FUNCTION
```

### Algorithm: Invert Upper Triangular Matrix

```
FUNCTION invert_upper_triangular(R):
    INPUT:
        R: upper triangular matrix [n × n]
    OUTPUT:
        Rinv: inverse [n × n]

    n = nrows(R)
    Rinv = identity(n)

    # Back substitution for each column
    FOR j = 0 TO n-1:
        FOR i = n-1 DOWN TO 0:
            sum = Rinv[i, j]
            FOR k = i+1 TO n-1:
                sum -= R[i, k] * Rinv[k, j]
            Rinv[i, j] = sum / R[i, i]

    RETURN Rinv
END FUNCTION
```

### Pseudocode: Diagnostic Statistics

```
FUNCTION regression_diagnostics(result, X, y):
    INPUT:
        result: output from linear_regression
        X: design matrix [n × p]
        y: response vector [n]
    OUTPUT:
        diagnostics: {leverage, cooks_d, dffits, vif}

    n = nrows(X)
    p = ncols(X)

    # Leverage (hat values): H = X(XᵀX)⁻¹Xᵀ
    # Diagonal: h_i = X[i,:]ᵀ · (XᵀX)⁻¹ · X[i,:]
    leverage = new Array[n]
    XtX_inv = result.cov_beta / (result.SSE / (n - p))
    FOR i = 0 TO n-1:
        leverage[i] = X[i,:] · XtX_inv · X[i,:].transpose()

    # Studentized residuals
    r_student = new Array[n]
    s = sqrt(result.SSE / (n - p))
    FOR i = 0 TO n-1:
        r_student[i] = result.residuals[i] / (s * sqrt(1 - leverage[i]))

    # Cook's distance
    cooks_d = new Array[n]
    FOR i = 0 TO n-1:
        cooks_d[i] = (r_student[i]^2 / p) * (leverage[i] / (1 - leverage[i]))

    # DFFITS
    dffits = new Array[n]
    FOR i = 0 TO n-1:
        dffits[i] = r_student[i] * sqrt(leverage[i] / (1 - leverage[i]))

    # Variance Inflation Factors (VIF)
    # VIF_j = 1 / (1 - R²_j)
    # where R²_j is R² from regressing X[:,j] on other columns
    vif = new Array[p]
    FOR j = 0 TO p-1:
        X_reduced = [X[:, 0:j], X[:, j+1:p]]
        result_j = linear_regression(X_reduced, X[:,j], {intercept: false})
        vif[j] = 1 / (1 - result_j.R2)

    RETURN {leverage, cooks_d, dffits, vif, r_student}
END FUNCTION
```

### WASM Optimization Strategy

1. **Blocked QR**: Cache-efficient for large design matrices
2. **Parallel statistics**: Compute diagnostics in parallel
3. **Incremental updates**: Fast updating when adding/removing predictors
4. **SIMD predictions**: Vectorized matrix-vector products

---

## Task 8: Polynomial Roots (Companion Matrix Method)

### Algorithm Description

Find all roots (real and complex) of polynomial:

```
p(x) = c₀ + c₁x + c₂x² + ... + cₙxⁿ
```

**Companion matrix method:**
- Convert polynomial to eigenvalue problem
- Roots = eigenvalues of companion matrix
- Robust and finds all roots simultaneously

### Mathematical Formulation

**Companion matrix:**

For monic polynomial `p(x) = xⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀`:

```
    ┌                           ┐
    │ 0   0   0  ...  0   -a₀  │
    │ 1   0   0  ...  0   -a₁  │
C = │ 0   1   0  ...  0   -a₂  │
    │ ...                      │
    │ 0   0   0  ...  1  -aₙ₋₁ │
    └                           ┘
```

**Key property:**

The eigenvalues of C are exactly the roots of p(x).

**Proof sketch:**
```
If λ is a root, then p(λ) = 0
Define v = [1, λ, λ², ..., λⁿ⁻¹]ᵀ
Then Cv = λv (verify by direct multiplication)
```

### Pseudocode: Polynomial Roots

```
FUNCTION polyroots(coeffs):
    INPUT:
        coeffs: polynomial coefficients [n+1], from c₀ to cₙ
    OUTPUT:
        roots: complex roots [n]

    n = length(coeffs) - 1

    # Handle special cases
    IF n == 0:
        RETURN []  # Constant polynomial

    IF n == 1:
        # Linear: c₀ + c₁x = 0 => x = -c₀/c₁
        RETURN [-coeffs[0] / coeffs[1]]

    IF n == 2:
        # Quadratic formula (more accurate than eigenvalue)
        RETURN quadratic_formula(coeffs)

    # Normalize to monic polynomial
    a = coeffs / coeffs[n]  # Now a[n] = 1

    # Build companion matrix
    C = zeros(n, n)

    # First row: [0, 0, ..., 0, -a₀]
    C[0, n-1] = -a[0]

    # Sub-diagonal: identity
    FOR i = 1 TO n-1:
        C[i, i-1] = 1
        C[i, n-1] = -a[i]

    # Compute eigenvalues
    eigenvalues = eig(C)

    # Sort by imaginary part (put real roots first)
    roots = sort(eigenvalues, key=imag)

    RETURN roots
END FUNCTION
```

### Algorithm: Quadratic Formula (Numerically Stable)

```
FUNCTION quadratic_formula(coeffs):
    INPUT:
        coeffs: [c₀, c₁, c₂] where c₂x² + c₁x + c₀ = 0
    OUTPUT:
        roots: [r₁, r₂]

    a = coeffs[2]
    b = coeffs[1]
    c = coeffs[0]

    # Discriminant
    disc = b*b - 4*a*c

    IF disc >= 0:
        # Real roots - use numerically stable formula
        IF b >= 0:
            q = -0.5 * (b + sqrt(disc))
        ELSE:
            q = -0.5 * (b - sqrt(disc))

        r1 = q / a
        r2 = c / q
    ELSE:
        # Complex roots
        real_part = -b / (2*a)
        imag_part = sqrt(-disc) / (2*a)
        r1 = complex(real_part, imag_part)
        r2 = complex(real_part, -imag_part)

    RETURN [r1, r2]
END FUNCTION
```

### Algorithm: Cubic Roots (Analytical)

```
FUNCTION cubic_roots(coeffs):
    INPUT:
        coeffs: [c₀, c₁, c₂, c₃] where c₃x³ + c₂x² + c₁x + c₀ = 0
    OUTPUT:
        roots: [r₁, r₂, r₃]

    # Normalize: x³ + ax² + bx + c = 0
    a = coeffs[2] / coeffs[3]
    b = coeffs[1] / coeffs[3]
    c = coeffs[0] / coeffs[3]

    # Depress: substitute x = t - a/3 to eliminate x² term
    # t³ + pt + q = 0
    p = b - a*a / 3
    q = 2*a^3/27 - a*b/3 + c

    # Discriminant
    disc = -(4*p^3 + 27*q^2)

    IF disc > 0:
        # Three distinct real roots (Vieta's formula)
        m = 2 * sqrt(-p/3)
        theta = acos(3*q / (p*m)) / 3

        t1 = m * cos(theta)
        t2 = m * cos(theta - 2*pi/3)
        t3 = m * cos(theta - 4*pi/3)
    ELSE:
        # One real root and two complex conjugates (Cardano's formula)
        u = cbrt(-q/2 + sqrt(-disc/108))
        v = cbrt(-q/2 - sqrt(-disc/108))

        t1 = u + v
        t2 = -(u + v)/2 + i * sqrt(3) * (u - v) / 2
        t3 = -(u + v)/2 - i * sqrt(3) * (u - v) / 2

    # Reverse substitution
    r1 = t1 - a/3
    r2 = t2 - a/3
    r3 = t3 - a/3

    RETURN [r1, r2, r3]
END FUNCTION
```

### Pseudocode: Root Polishing (Newton-Raphson)

```
FUNCTION polish_roots(coeffs, roots_approx):
    INPUT:
        coeffs: polynomial coefficients [n+1]
        roots_approx: approximate roots [n]
    OUTPUT:
        roots_refined: refined roots [n]

    roots_refined = copy(roots_approx)
    max_iter = 10
    tol = 1e-12

    FOR i = 0 TO length(roots) - 1:
        r = roots_approx[i]

        # Newton-Raphson iteration
        FOR iter = 1 TO max_iter:
            # Evaluate p(r) and p'(r) using Horner
            p = coeffs[n]
            dp = 0
            FOR j = n-1 DOWN TO 0:
                dp = dp * r + p
                p = p * r + coeffs[j]

            # Newton step
            IF abs(dp) < 1e-20:
                BREAK  # Avoid division by zero

            delta = p / dp
            r = r - delta

            IF abs(delta) < tol * max(abs(r), 1):
                BREAK

        roots_refined[i] = r

    RETURN roots_refined
END FUNCTION
```

### Algorithm: Deflation for Sequential Root Finding

```
FUNCTION deflate_polynomial(coeffs, root):
    INPUT:
        coeffs: polynomial coefficients [n+1]
        root: known root
    OUTPUT:
        coeffs_deflated: reduced polynomial [n]

    n = length(coeffs) - 1
    coeffs_deflated = new Array[n]

    # Synthetic division
    coeffs_deflated[n-1] = coeffs[n]
    FOR i = n-2 DOWN TO 0:
        coeffs_deflated[i] = coeffs[i+1] + root * coeffs_deflated[i+1]

    # coeffs[0] should be ≈ 0 (residual)
    residual = coeffs[0] + root * coeffs_deflated[0]

    RETURN coeffs_deflated
END FUNCTION
```

### WASM Optimization Strategy

1. **Fast eigenvalue solver**: QR algorithm with implicit shifts
2. **Parallel polishing**: Refine roots independently
3. **SIMD Horner**: Vectorized polynomial evaluation
4. **Analytical formulas**: Quadratic/cubic for low degrees

---

## Implementation Priority

### Phase 1: Core Interpolation (Weeks 1-2)
1. Linear interpolation (interp1)
2. Cubic spline
3. PCHIP

### Phase 2: Advanced Interpolation (Week 3)
4. 2D interpolation (interp2)

### Phase 3: Fitting Algorithms (Weeks 4-5)
5. Polynomial fitting (polyfit)
6. Nonlinear curve fitting (LM)
7. Linear regression with statistics

### Phase 4: Root Finding (Week 6)
8. Polynomial roots

---

## Testing Strategy

### Unit Tests

```javascript
// Linear interpolation
test('interp1 - linear method', () => {
  const x = [0, 1, 2, 3]
  const y = [0, 1, 4, 9]
  const xq = [0.5, 1.5, 2.5]
  const yq = interp1(x, y, xq, 'linear')

  assert.closeTo(yq, [0.5, 2.5, 6.5], 1e-10)
})

// Cubic spline
test('cubic_spline - natural boundary', () => {
  const x = [0, 1, 2, 3]
  const y = [0, 1, 0, 1]
  const spline = cubic_spline(x, y, 'natural')
  const yq = evaluate_spline(spline, [0.5, 1.5, 2.5])

  // Should be smooth with zero second derivative at ends
  assert.closeTo(spline.M[0], 0, 1e-10)
  assert.closeTo(spline.M[3], 0, 1e-10)
})

// PCHIP
test('pchip - monotonicity preservation', () => {
  const x = [0, 1, 2, 3]
  const y = [0, 1, 2, 3]  // Monotonic
  const pchip = pchip_fit(x, y)
  const xq = linspace(0, 3, 100)
  const yq = evaluate_pchip(pchip, xq)

  // Check monotonicity
  for (let i = 1; i < 100; i++) {
    assert.isTrue(yq[i] >= yq[i-1])
  }
})

// Polynomial fit
test('polyfit - exact fit for polynomial', () => {
  // Generate exact polynomial: y = 2 + 3x - x²
  const x = [0, 1, 2, 3, 4]
  const y = x.map(xi => 2 + 3*xi - xi*xi)

  const result = polyfit(x, y, 2)

  assert.closeTo(result.coeffs, [2, 3, -1], 1e-10)
  assert.closeTo(result.residual, 0, 1e-10)
})

// Levenberg-Marquardt
test('curve_fit - exponential decay', () => {
  // Data: y = a * exp(-b*x)
  const x = [0, 1, 2, 3, 4]
  const y = [5, 3.03, 1.84, 1.12, 0.68]

  const f = (x, theta) => theta[0] * Math.exp(-theta[1] * x)
  const result = curve_fit(f, x, y, [4, 0.5])

  assert.closeTo(result.theta[0], 5, 0.1)
  assert.closeTo(result.theta[1], 0.5, 0.05)
})

// Linear regression
test('linear_regression - known result', () => {
  const X = [[1], [2], [3], [4], [5]]
  const y = [2, 4, 6, 8, 10]  // y = 2x

  const result = linear_regression(X, y)

  assert.closeTo(result.beta[0], 0, 1e-10)  // Intercept
  assert.closeTo(result.beta[1], 2, 1e-10)  // Slope
  assert.closeTo(result.R2, 1, 1e-10)
})

// Polynomial roots
test('polyroots - quadratic', () => {
  // x² - 5x + 6 = (x-2)(x-3)
  const coeffs = [6, -5, 1]
  const roots = polyroots(coeffs)

  roots.sort((a, b) => a - b)
  assert.closeTo(roots, [2, 3], 1e-10)
})

test('polyroots - complex roots', () => {
  // x² + 1 = 0 => x = ±i
  const coeffs = [1, 0, 1]
  const roots = polyroots(coeffs)

  assert.closeTo(Math.abs(roots[0]), 1, 1e-10)
  assert.closeTo(Math.abs(roots[1]), 1, 1e-10)
})
```

### Performance Benchmarks

```javascript
// Benchmark suite
benchmark('Linear interpolation', {
  'JavaScript (1000 points, 10000 queries)': () => {
    interp1_js(x_1000, y_1000, xq_10000)
  },
  'WASM (1000 points, 10000 queries)': () => {
    interp1_wasm(x_1000, y_1000, xq_10000)
  }
})

benchmark('Cubic spline', {
  'JavaScript (1000 points)': () => {
    cubic_spline_js(x_1000, y_1000)
  },
  'WASM (1000 points)': () => {
    cubic_spline_wasm(x_1000, y_1000)
  }
})

benchmark('Polynomial fit', {
  'JavaScript (degree 10, 1000 points)': () => {
    polyfit_js(x_1000, y_1000, 10)
  },
  'WASM (degree 10, 1000 points)': () => {
    polyfit_wasm(x_1000, y_1000, 10)
  }
})
```

---

## References

### Interpolation
- de Boor, C. (2001). *A Practical Guide to Splines*
- Fritsch, F. N., & Carlson, R. E. (1980). "Monotone Piecewise Cubic Interpolation"

### Curve Fitting
- Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization*
- Moré, J. J. (1978). "The Levenberg-Marquardt Algorithm"

### Linear Regression
- Draper, N. R., & Smith, H. (1998). *Applied Regression Analysis*
- Belsley, D. A., Kuh, E., & Welsch, R. E. (2005). *Regression Diagnostics*

### Polynomial Roots
- Edelman, A., & Murakami, H. (1995). "Polynomial Roots from Companion Matrix Eigenvalues"
- Press, W. H., et al. (2007). *Numerical Recipes* (Chapter 9)

---

## WASM Interface Design

### Module: `interpolation.wasm`

```typescript
// Linear interpolation
export function interp1_linear(
  x: Float64Array,
  y: Float64Array,
  x_query: Float64Array,
  y_out: Float64Array
): void

// Cubic spline construction
export function cubic_spline_natural(
  x: Float64Array,
  y: Float64Array,
  M_out: Float64Array
): void

// Spline evaluation
export function evaluate_spline(
  x: Float64Array,
  y: Float64Array,
  M: Float64Array,
  h: Float64Array,
  x_query: Float64Array,
  y_out: Float64Array
): void

// PCHIP
export function pchip_slopes(
  x: Float64Array,
  y: Float64Array,
  m_out: Float64Array
): void

// 2D bilinear
export function interp2_bilinear(
  x: Float64Array,
  y: Float64Array,
  Z: Float64Array,
  x_query: Float64Array,
  y_query: Float64Array,
  Z_out: Float64Array
): void
```

### Module: `fitting.wasm`

```typescript
// Polynomial fit
export function polyfit(
  x: Float64Array,
  y: Float64Array,
  degree: i32,
  coeffs_out: Float64Array
): f64  // Returns residual

// Levenberg-Marquardt
export function lm_fit(
  x: Float64Array,
  y: Float64Array,
  f_ptr: i32,  // Function pointer
  jacobian_ptr: i32,
  theta0: Float64Array,
  theta_out: Float64Array,
  max_iter: i32
): i32  // Returns exit flag

// Linear regression
export function linear_regression(
  X: Float64Array,
  y: Float64Array,
  beta_out: Float64Array,
  se_out: Float64Array,
  t_out: Float64Array,
  p_out: Float64Array
): void

// Polynomial roots
export function polyroots(
  coeffs: Float64Array,
  roots_real: Float64Array,
  roots_imag: Float64Array
): void
```

---

## Validation and Edge Cases

### Input Validation

```javascript
function validate_interp_inputs(x, y, x_query) {
  if (x.length !== y.length) {
    throw new Error('x and y must have same length')
  }

  if (x.length < 2) {
    throw new Error('Need at least 2 points for interpolation')
  }

  if (!is_sorted(x)) {
    throw new Error('x must be sorted')
  }

  if (has_duplicates(x)) {
    throw new Error('x must not have duplicate values')
  }
}
```

### Edge Cases

1. **Extrapolation**: Handle queries outside data range
2. **Duplicate x-values**: Reject or average
3. **NaN/Inf in data**: Propagate or reject
4. **Rank-deficient matrices**: Warn and use pseudo-inverse
5. **Nearly flat data**: Handle numerical issues
6. **Very large/small values**: Use scaling for stability

---

This document provides complete algorithmic specifications for Phase 7. Each task includes detailed mathematical formulations, pseudocode, and optimization strategies for WASM implementation.
