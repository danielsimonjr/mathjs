# Phase 2: Bessel & Airy Functions - Detailed Algorithms

## Overview

This document provides comprehensive implementation details for Bessel and Airy functions, including algorithms, pseudocode, numerical coefficients, and stability considerations.

**Sprint 2: Bessel & Airy Functions** (10 tasks)
- Target: High-accuracy (ε < 10⁻¹⁴ for IEEE-754 double precision)
- Performance: WASM acceleration for critical path functions
- Stability: Proper scaling and recurrence direction selection

---

## 1. Bessel Function of the First Kind: J_ν(x)

### Mathematical Background

The Bessel function J_ν(x) satisfies:
```
x²y'' + xy' + (x² - ν²)y = 0
```

**Key Properties:**
- J_ν(x) is oscillatory for x > ν
- J_ν(x) decays exponentially for x < ν (evanescent region)
- Symmetry: J_{-n}(x) = (-1)ⁿ J_n(x) for integer n

### Algorithm Selection Strategy

```
if |x| < 8:
    Use series expansion
elif |x| < 50:
    Use backward recurrence (Miller's algorithm)
else:
    Use asymptotic expansion
```

### 1A. Series Expansion (Small x)

**Formula:**
```
J_ν(x) = (x/2)^ν Σ_{k=0}^∞ [(-1)^k / (k! Γ(k+ν+1))] (x/2)^{2k}
```

**Pseudocode:**
```typescript
function besselJ_series(nu: number, x: number): number {
    const EPSILON = 1e-16;
    const MAX_ITER = 100;

    const halfx = x / 2;
    const halfx_sq = halfx * halfx;
    const x_nu = Math.pow(halfx, nu);

    let sum = 1.0;
    let term = 1.0;

    for (let k = 1; k < MAX_ITER; k++) {
        term *= -halfx_sq / (k * (k + nu));
        sum += term;

        if (Math.abs(term) < EPSILON * Math.abs(sum)) {
            break;
        }
    }

    return x_nu * sum / gamma(nu + 1);
}
```

**Convergence:** Rapid for x < ν, but slow for x > ν.

### 1B. Miller's Backward Recurrence (Intermediate x)

**Recurrence Relation:**
```
J_{ν-1}(x) + J_{ν+1}(x) = (2ν/x) J_ν(x)
```

**Algorithm (Backward Recurrence):**
1. Choose starting order N > ν (typically N ≈ ν + √(40ν))
2. Set arbitrary starting values: f_{N+1} = 0, f_N = 1
3. Recurse downward to compute f_{ν}, f_{ν-1}, ..., f_0
4. Normalize using: J_0(x) + 2J_2(x) + 2J_4(x) + ... = 1

**Pseudocode:**
```typescript
function besselJ_recurrence(nu: number, x: number): number {
    const n = Math.floor(nu);

    // Determine starting point for backward recurrence
    const N_start = Math.max(n + 20, Math.floor(n + 1.5 * Math.sqrt(40 * n)));

    // Initialize backward recurrence
    let f_next = 0.0;    // f_{N+1}
    let f_curr = 1.0;    // f_N
    let f_prev: number;

    // Store values we need
    const f_values: number[] = new Array(n + 1);

    // Backward recurrence from N down to 0
    for (let k = N_start; k >= 0; k--) {
        f_prev = (2 * k + 2) / x * f_curr - f_next;
        f_next = f_curr;
        f_curr = f_prev;

        if (k <= n) {
            f_values[k] = f_prev;
        }
    }

    // Normalize using sum formula: J_0 + 2J_2 + 2J_4 + ... = 1
    let sum = f_values[0];
    for (let k = 2; k <= n; k += 2) {
        sum += 2 * f_values[k];
    }

    // Apply normalization
    const scale = 1.0 / sum;

    // Handle non-integer orders via interpolation
    if (nu === n) {
        return f_values[n] * scale;
    } else {
        // Linear interpolation for non-integer orders
        const alpha = nu - n;
        return (f_values[n] * (1 - alpha) + f_values[n + 1] * alpha) * scale;
    }
}
```

**Stability:** Backward recurrence is numerically stable for J_ν.

### 1C. Asymptotic Expansion (Large x)

**Formula:**
```
J_ν(x) ≈ √(2/πx) [P_ν(x) cos(θ) - Q_ν(x) sin(θ)]

where θ = x - πν/2 - π/4

P_ν(x) = 1 - [(μ-1)(μ-9)] / (2!(8x)²) + [(μ-1)(μ-9)(μ-25)(μ-49)] / (4!(8x)⁴) - ...
Q_ν(x) = [(μ-1)] / (1!(8x)) - [(μ-1)(μ-9)(μ-25)] / (3!(8x)³) + ...

μ = 4ν²
```

**Numerical Coefficients for J_0(x) and J_1(x):**

For J_0(x), x > 8:
```
P_0(t) = 1 + c₁t² + c₂t⁴ + c₃t⁶ + c₄t⁸    where t = 8/x
Q_0(t) = d₁t + d₂t³ + d₃t⁵ + d₄t⁷

c₁ = -0.001098628627e-2
c₂ =  0.002734510407e-4
c₃ = -0.002073370639e-5
c₄ =  0.002093887211e-6

d₁ = -0.01562499995
d₂ =  0.0001430488765
d₃ = -0.6911147651e-5
d₄ =  0.7621095161e-6
```

**Pseudocode:**
```typescript
function besselJ0_asymptotic(x: number): number {
    const t = 8 / x;
    const t2 = t * t;

    // P_0(t) coefficients
    const P = 1.0
        - 0.001098628627e-2 * t2
        + 0.002734510407e-4 * t2 * t2
        - 0.002073370639e-5 * t2 * t2 * t2
        + 0.002093887211e-6 * t2 * t2 * t2 * t2;

    // Q_0(t) coefficients
    const Q = t * (
        -0.01562499995
        + 0.0001430488765 * t2
        - 0.6911147651e-5 * t2 * t2
        + 0.7621095161e-6 * t2 * t2 * t2
    );

    const theta = x - Math.PI / 4;
    const sqrt_factor = Math.sqrt(2 / (Math.PI * x));

    return sqrt_factor * (P * Math.cos(theta) - Q * Math.sin(theta));
}

function besselJ1_asymptotic(x: number): number {
    const t = 8 / x;
    const t2 = t * t;

    // P_1(t) coefficients (μ = 4*1² = 4)
    const P = 1.0
        + 0.00183105e-2 * t2
        - 0.003516396496e-4 * t2 * t2
        + 0.002457520174e-5 * t2 * t2 * t2
        - 0.00240337019e-6 * t2 * t2 * t2 * t2;

    // Q_1(t) coefficients
    const Q = t * (
        0.04687499995
        - 0.0002002690873 * t2
        + 0.8449199096e-5 * t2 * t2
        - 0.88228987e-6 * t2 * t2 * t2
    );

    const theta = x - 3 * Math.PI / 4;
    const sqrt_factor = Math.sqrt(2 / (Math.PI * x));

    return sqrt_factor * (P * Math.cos(theta) - Q * Math.sin(theta));
}
```

### 1D. Optimized J_0(x) and J_1(x)

**Complete Implementation:**
```typescript
export function besselJ0(x: number): number {
    const ABS_X = Math.abs(x);

    if (ABS_X < 8.0) {
        // Series expansion for small x
        const y = x * x;
        const ans1 = 57568490574.0 + y * (-13362590354.0
            + y * (651619640.7 + y * (-11214424.18
            + y * (77392.33017 + y * (-184.9052456)))));
        const ans2 = 57568490411.0 + y * (1029532985.0
            + y * (9494680.718 + y * (59272.64853
            + y * (267.8532712 + y))));
        return ans1 / ans2;
    } else {
        return besselJ0_asymptotic(ABS_X);
    }
}

export function besselJ1(x: number): number {
    const ABS_X = Math.abs(x);

    if (ABS_X < 8.0) {
        // Series expansion for small x
        const y = x * x;
        const ans1 = x * (72362614232.0 + y * (-7895059235.0
            + y * (242396853.1 + y * (-2972611.439
            + y * (15704.48260 + y * (-30.16036606))))));
        const ans2 = 144725228442.0 + y * (2300535178.0
            + y * (18583304.74 + y * (99447.43394
            + y * (376.9991397 + y))));
        return ans1 / ans2;
    } else {
        const z = besselJ1_asymptotic(ABS_X);
        return x > 0 ? z : -z;
    }
}
```

---

## 2. Bessel Function of the Second Kind: Y_ν(x)

### Mathematical Background

**Definition (for integer n):**
```
Y_n(x) = lim_{ν→n} [J_ν(x)cos(νπ) - J_{-ν}(x)] / sin(νπ)
```

**Key Properties:**
- Y_n(x) → -∞ as x → 0⁺ (logarithmic singularity)
- Y_n(x) is oscillatory for large x
- Symmetry: Y_{-n}(x) = (-1)ⁿ Y_n(x)

### Algorithm Selection

```
if x ≤ 0:
    return NaN  // Undefined
elif x < 8:
    Use series expansion with logarithmic term
else:
    Use asymptotic expansion
```

### 2A. Series Expansion (Small x)

**Formula for Y_0(x):**
```
Y_0(x) = (2/π)[ln(x/2) + γ]J_0(x) + (2/π) Σ_{k=1}^∞ [(-1)^{k-1} h_k (x/2)^{2k}] / (k!)²

where h_k = 1 + 1/2 + 1/3 + ... + 1/k (harmonic number)
      γ = 0.5772156649015329 (Euler's constant)
```

**Formula for Y_1(x):**
```
Y_1(x) = -(2/πx) + (2/π)[ln(x/2) + γ]J_1(x)
         + (x/2π) Σ_{k=0}^∞ [(-1)^k (h_k + h_{k+1}) (x/2)^{2k}] / [k!(k+1)!]
```

**Pseudocode:**
```typescript
const EULER_GAMMA = 0.5772156649015329;

function besselY0_series(x: number): number {
    const EPSILON = 1e-16;
    const MAX_ITER = 50;

    const j0 = besselJ0(x);
    const log_term = (2 / Math.PI) * (Math.log(x / 2) + EULER_GAMMA) * j0;

    const halfx = x / 2;
    const halfx_sq = halfx * halfx;

    let sum = 0.0;
    let term = 1.0;
    let h_k = 0.0;  // Harmonic number

    for (let k = 1; k < MAX_ITER; k++) {
        h_k += 1.0 / k;
        term *= -halfx_sq / (k * k);
        const addend = term * h_k;
        sum += addend;

        if (Math.abs(addend) < EPSILON * Math.abs(sum)) {
            break;
        }
    }

    return log_term + (2 / Math.PI) * sum;
}

function besselY1_series(x: number): number {
    const EPSILON = 1e-16;
    const MAX_ITER = 50;

    const j1 = besselJ1(x);
    const log_term = (2 / Math.PI) * (Math.log(x / 2) + EULER_GAMMA) * j1;
    const singular_term = -2 / (Math.PI * x);

    const halfx = x / 2;
    const halfx_sq = halfx * halfx;

    let sum = 0.0;
    let term = 1.0;
    let h_k = 0.0;
    let h_k_plus_1 = 1.0;

    for (let k = 0; k < MAX_ITER; k++) {
        if (k > 0) {
            h_k += 1.0 / k;
            h_k_plus_1 = h_k + 1.0 / (k + 1);
            term *= -halfx_sq / (k * (k + 1));
        }

        const addend = term * (h_k + h_k_plus_1);
        sum += addend;

        if (k > 0 && Math.abs(addend) < EPSILON * Math.abs(sum)) {
            break;
        }
    }

    return singular_term + log_term + (halfx / Math.PI) * sum;
}
```

### 2B. Asymptotic Expansion (Large x)

**Formula:**
```
Y_ν(x) ≈ √(2/πx) [P_ν(x) sin(θ) + Q_ν(x) cos(θ)]

where θ = x - πν/2 - π/4
```

**Pseudocode (using same P, Q as J):**
```typescript
function besselY0_asymptotic(x: number): number {
    const t = 8 / x;
    const t2 = t * t;

    // Same P_0 and Q_0 as J_0
    const P = 1.0
        - 0.001098628627e-2 * t2
        + 0.002734510407e-4 * t2 * t2
        - 0.002073370639e-5 * t2 * t2 * t2
        + 0.002093887211e-6 * t2 * t2 * t2 * t2;

    const Q = t * (
        -0.01562499995
        + 0.0001430488765 * t2
        - 0.6911147651e-5 * t2 * t2
        + 0.7621095161e-6 * t2 * t2 * t2
    );

    const theta = x - Math.PI / 4;
    const sqrt_factor = Math.sqrt(2 / (Math.PI * x));

    // Note: sin/cos swapped compared to J_0
    return sqrt_factor * (P * Math.sin(theta) + Q * Math.cos(theta));
}
```

---

## 3. Modified Bessel Function of the First Kind: I_ν(x)

### Mathematical Background

**Relation to J_ν:**
```
I_ν(x) = i^{-ν} J_ν(ix)
```

**Differential Equation:**
```
x²y'' + xy' - (x² + ν²)y = 0
```

**Key Properties:**
- I_ν(x) grows exponentially for large x
- I_ν(x) > 0 for x > 0, ν ≥ 0
- No zeros for x > 0

### Algorithm Selection

```
if x < 15:
    Use series expansion
elif x < 50:
    Use forward recurrence
else:
    Use asymptotic expansion with exponential scaling
```

### 3A. Series Expansion

**Formula:**
```
I_ν(x) = (x/2)^ν Σ_{k=0}^∞ [(x/2)^{2k}] / [k! Γ(k+ν+1)]
```

**Pseudocode:**
```typescript
function besselI_series(nu: number, x: number): number {
    const EPSILON = 1e-16;
    const MAX_ITER = 100;

    const halfx = x / 2;
    const halfx_sq = halfx * halfx;
    const x_nu = Math.pow(halfx, nu);

    let sum = 1.0;
    let term = 1.0;

    for (let k = 1; k < MAX_ITER; k++) {
        term *= halfx_sq / (k * (k + nu));
        sum += term;

        if (term < EPSILON * sum) {
            break;
        }
    }

    return x_nu * sum / gamma(nu + 1);
}
```

### 3B. Exponential Scaling for Stability

For large x, compute the scaled function:
```
Ĩ_ν(x) = e^{-x} I_ν(x)
```

**Asymptotic Formula:**
```
Ĩ_ν(x) ≈ 1/√(2πx) [1 + Σ_{k=1}^N u_k / x^k]

where u_k = [(4ν²-1²)(4ν²-3²)...(4ν²-(2k-1)²)] / (k! 8^k)
```

**Pseudocode:**
```typescript
function besselI_scaled_asymptotic(nu: number, x: number): number {
    const mu = 4 * nu * nu;
    const inv_x = 1.0 / x;

    let sum = 1.0;
    let term = 1.0;

    for (let k = 1; k <= 10; k++) {
        const m2 = (2 * k - 1) * (2 * k - 1);
        term *= -(mu - m2) / (8 * k) * inv_x;
        sum += term;

        if (Math.abs(term) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum / Math.sqrt(2 * Math.PI * x);
}

function besselI(nu: number, x: number): number {
    if (x < 15) {
        return besselI_series(nu, x);
    } else {
        const scaled = besselI_scaled_asymptotic(nu, x);
        return scaled * Math.exp(x);
    }
}
```

### 3C. Optimized I_0(x) and I_1(x)

**Chebyshev Approximation for I_0:**
```typescript
export function besselI0(x: number): number {
    const ABS_X = Math.abs(x);

    if (ABS_X < 3.75) {
        const t = (x / 3.75);
        const y = t * t;
        return 1.0 + y * (3.5156229 + y * (3.0899424
            + y * (1.2067492 + y * (0.2659732
            + y * (0.360768e-1 + y * 0.45813e-2)))));
    } else {
        const t = 3.75 / ABS_X;
        const result = (Math.exp(ABS_X) / Math.sqrt(ABS_X))
            * (0.39894228 + t * (0.1328592e-1 + t * (0.225319e-2
            + t * (-0.157565e-2 + t * (0.916281e-2 + t * (-0.2057706e-1
            + t * (0.2635537e-1 + t * (-0.1647633e-1 + t * 0.392377e-2))))))));
        return result;
    }
}

export function besselI1(x: number): number {
    const ABS_X = Math.abs(x);

    if (ABS_X < 3.75) {
        const t = x / 3.75;
        const y = t * t;
        const result = ABS_X * (0.5 + y * (0.87890594 + y * (0.51498869
            + y * (0.15084934 + y * (0.2658733e-1 + y * (0.301532e-2
            + y * 0.32411e-3))))));
        return x > 0 ? result : -result;
    } else {
        const t = 3.75 / ABS_X;
        const result = (Math.exp(ABS_X) / Math.sqrt(ABS_X))
            * (0.39894228 + t * (-0.3988024e-1 + t * (-0.362018e-2
            + t * (0.163801e-2 + t * (-0.1031555e-1 + t * (0.2282967e-1
            + t * (-0.2895312e-1 + t * (0.1787654e-1 - t * 0.420059e-2))))))));
        return x > 0 ? result : -result;
    }
}
```

---

## 4. Modified Bessel Function of the Second Kind: K_ν(x)

### Mathematical Background

**Definition:**
```
K_ν(x) = (π/2) [I_{-ν}(x) - I_ν(x)] / sin(νπ)
```

**Key Properties:**
- K_ν(x) → +∞ as x → 0⁺
- K_ν(x) decays exponentially for large x
- K_ν(x) = K_{-ν}(x) (even in ν)

### Algorithm Selection (Temme's Algorithm)

```
if x < 1:
    Use series expansion with logarithmic terms
elif x < 5:
    Use Temme's uniform expansion
else:
    Use asymptotic expansion with exponential scaling
```

### 4A. Series Expansion (Small x)

**Formula for K_0(x):**
```
K_0(x) = -[ln(x/2) + γ]I_0(x) + Σ_{k=1}^∞ [(x/2)^{2k} ψ(k)] / (k!)²

where ψ(k) = 1 + 1/2 + 1/3 + ... + 1/k
```

**Pseudocode:**
```typescript
function besselK0_series(x: number): number {
    const i0 = besselI0(x);
    const log_term = -(Math.log(x / 2) + EULER_GAMMA) * i0;

    const halfx = x / 2;
    const halfx_sq = halfx * halfx;

    let sum = 0.0;
    let term = 1.0;
    let psi_k = 0.0;

    for (let k = 1; k < 50; k++) {
        psi_k += 1.0 / k;
        term *= halfx_sq / (k * k);
        sum += term * psi_k;
    }

    return log_term + sum;
}
```

### 4B. Temme's Uniform Expansion

**Algorithm for general ν:**
```typescript
function besselK_temme(nu: number, x: number): number {
    // Temme's algorithm for K_ν(x)
    // Reference: N.M. Temme, "On the numerical evaluation of the modified
    // Bessel function of the third kind", J. Comput. Phys. 19 (1975)

    const EPSILON = 1e-15;
    const xi = nu * nu;
    const eta = Math.sqrt(1 + x * x / xi);
    const z = nu * (eta - Math.log((1 + eta) / (x / nu)));

    // Compute f_k and g_k series
    let f = 1.0;
    let g = 0.0;

    const rho = x / nu;
    const rho_sq = rho * rho;

    // First few terms of the expansion
    const u1 = (3 - 5 * rho_sq) / 24;
    const u2 = rho_sq * (81 - 462 * rho_sq + 385 * rho_sq * rho_sq) / 1152;

    f = 1 + u1 / nu + u2 / (nu * nu);

    const result = Math.sqrt(Math.PI / (2 * z)) * Math.exp(-z) * f;

    return result;
}
```

### 4C. Scaled Asymptotic Expansion

**Formula:**
```
K̃_ν(x) = e^x K_ν(x) ≈ √(π/2x) [1 + Σ_{k=1}^N v_k / x^k]

where v_k = [(4ν²-1²)(4ν²-3²)...(4ν²-(2k-1)²)] / (k! (-8)^k)
```

**Optimized K_0(x) and K_1(x):**
```typescript
export function besselK0(x: number): number {
    if (x <= 0) {
        return NaN;
    }

    if (x <= 2.0) {
        const i0 = besselI0(x);
        const y = x * x / 4;
        return -Math.log(x / 2) * i0 + (-0.57721566
            + y * (0.42278420 + y * (0.23069756 + y * (0.3488590e-1
            + y * (0.262698e-2 + y * (0.10750e-3 + y * 0.74e-5))))));
    } else {
        const y = 2 / x;
        return (Math.exp(-x) / Math.sqrt(x))
            * (1.25331414 + y * (-0.7832358e-1 + y * (0.2189568e-1
            + y * (-0.1062446e-1 + y * (0.587872e-2 + y * (-0.251540e-2
            + y * 0.53208e-3))))));
    }
}

export function besselK1(x: number): number {
    if (x <= 0) {
        return NaN;
    }

    if (x <= 2.0) {
        const i1 = besselI1(x);
        const y = x * x / 4;
        return Math.log(x / 2) * i1 + (1 / x)
            * (1.0 + y * (0.15443144 + y * (-0.67278579 + y * (-0.18156897
            + y * (-0.1919402e-1 + y * (-0.110404e-2 + y * (-0.4686e-4)))))));
    } else {
        const y = 2 / x;
        return (Math.exp(-x) / Math.sqrt(x))
            * (1.25331414 + y * (0.23498619 + y * (-0.3655620e-1
            + y * (0.1504268e-1 + y * (-0.780353e-2 + y * (0.325614e-2
            + y * (-0.68245e-3)))))));
    }
}
```

---

## 5. Spherical Bessel Functions of the First Kind: j_n(x)

### Mathematical Background

**Definition:**
```
j_n(x) = √(π/2x) J_{n+1/2}(x)
```

**Recurrence Relation:**
```
j_{n+1}(x) = [(2n+1)/x] j_n(x) - j_{n-1}(x)
```

**Starting Values:**
```
j_0(x) = sin(x) / x
j_1(x) = sin(x) / x² - cos(x) / x
```

### Algorithm

**Pseudocode:**
```typescript
export function sphericalBesselJ(n: number, x: number): number {
    if (n < 0) {
        throw new Error('Order must be non-negative');
    }

    if (x === 0) {
        return n === 0 ? 1.0 : 0.0;
    }

    const ABS_X = Math.abs(x);

    // Direct formulas for n = 0, 1
    if (n === 0) {
        return Math.sin(ABS_X) / ABS_X;
    }

    if (n === 1) {
        return Math.sin(ABS_X) / (ABS_X * ABS_X) - Math.cos(ABS_X) / ABS_X;
    }

    // For small x, use series expansion to avoid cancellation
    if (ABS_X < 0.1) {
        return sphericalBesselJ_series(n, ABS_X);
    }

    // Forward recurrence for n >= 2
    let j_prev = Math.sin(ABS_X) / ABS_X;
    let j_curr = Math.sin(ABS_X) / (ABS_X * ABS_X) - Math.cos(ABS_X) / ABS_X;

    for (let k = 1; k < n; k++) {
        const j_next = (2 * k + 1) / ABS_X * j_curr - j_prev;
        j_prev = j_curr;
        j_curr = j_next;
    }

    return j_curr;
}

function sphericalBesselJ_series(n: number, x: number): number {
    // Series: j_n(x) = x^n / (2n+1)!! [1 - x²/(2(2n+3)) + x⁴/(2·4·(2n+3)(2n+5)) - ...]
    const EPSILON = 1e-16;
    const double_factorial = doubleFactorial(2 * n + 1);
    const x_n = Math.pow(x, n);
    const x_sq = x * x;

    let sum = 1.0;
    let term = 1.0;

    for (let k = 1; k < 50; k++) {
        term *= -x_sq / (2 * k * (2 * n + 2 * k + 1));
        sum += term;

        if (Math.abs(term) < EPSILON) {
            break;
        }
    }

    return x_n * sum / double_factorial;
}

function doubleFactorial(n: number): number {
    // n!! = n(n-2)(n-4)...
    let result = 1;
    for (let i = n; i > 0; i -= 2) {
        result *= i;
    }
    return result;
}
```

---

## 6. Spherical Bessel Functions of the Second Kind: y_n(x)

### Mathematical Background

**Definition:**
```
y_n(x) = √(π/2x) Y_{n+1/2}(x)
```

**Starting Values:**
```
y_0(x) = -cos(x) / x
y_1(x) = -cos(x) / x² - sin(x) / x
```

**Recurrence:** Same as j_n(x)

### Algorithm

**Pseudocode:**
```typescript
export function sphericalBesselY(n: number, x: number): number {
    if (n < 0) {
        throw new Error('Order must be non-negative');
    }

    if (x <= 0) {
        return NaN;  // Undefined for x ≤ 0
    }

    // Direct formulas for n = 0, 1
    if (n === 0) {
        return -Math.cos(x) / x;
    }

    if (n === 1) {
        return -Math.cos(x) / (x * x) - Math.sin(x) / x;
    }

    // Forward recurrence for n >= 2
    let y_prev = -Math.cos(x) / x;
    let y_curr = -Math.cos(x) / (x * x) - Math.sin(x) / x;

    for (let k = 1; k < n; k++) {
        const y_next = (2 * k + 1) / x * y_curr - y_prev;
        y_prev = y_curr;
        y_curr = y_next;
    }

    return y_curr;
}
```

---

## 7. Hankel Functions: H_ν^{(1)}(x) and H_ν^{(2)}(x)

### Mathematical Background

**Definitions:**
```
H_ν^{(1)}(x) = J_ν(x) + i Y_ν(x)  (Hankel function of the first kind)
H_ν^{(2)}(x) = J_ν(x) - i Y_ν(x)  (Hankel function of the second kind)
```

**Key Properties:**
- H^{(1)} represents outgoing waves
- H^{(2)} represents incoming waves
- Wronskian: J_ν H_ν^{(1)}' - J_ν' H_ν^{(1)} = 2i/(πx)

### Asymptotic Behavior (Large x)

**Formula:**
```
H_ν^{(1)}(x) ≈ √(2/πx) exp[i(x - νπ/2 - π/4)] [1 + O(1/x)]
H_ν^{(2)}(x) ≈ √(2/πx) exp[-i(x - νπ/2 - π/4)] [1 + O(1/x)]
```

### Algorithm

**Pseudocode:**
```typescript
interface Complex {
    re: number;
    im: number;
}

export function hankelH1(nu: number, x: number): Complex {
    if (x <= 0) {
        return { re: NaN, im: NaN };
    }

    const j_nu = besselJ(nu, x);
    const y_nu = besselY(nu, x);

    return {
        re: j_nu,
        im: y_nu
    };
}

export function hankelH2(nu: number, x: number): Complex {
    if (x <= 0) {
        return { re: NaN, im: NaN };
    }

    const j_nu = besselJ(nu, x);
    const y_nu = besselY(nu, x);

    return {
        re: j_nu,
        im: -y_nu
    };
}

// Asymptotic approximation for large x
function hankelH1_asymptotic(nu: number, x: number): Complex {
    const theta = x - nu * Math.PI / 2 - Math.PI / 4;
    const amplitude = Math.sqrt(2 / (Math.PI * x));

    return {
        re: amplitude * Math.cos(theta),
        im: amplitude * Math.sin(theta)
    };
}
```

---

## 8. Airy Function Ai(x)

### Mathematical Background

**Differential Equation:**
```
y'' - xy = 0
```

**Integral Representation:**
```
Ai(x) = (1/π) ∫₀^∞ cos(t³/3 + xt) dt
```

### Algorithm Selection

```
if x < -10:
    Use oscillatory expansion
elif x < 2:
    Use Taylor series around x = 0
else:
    Use exponentially decaying expansion
```

### 8A. Series Expansion (x ≈ 0)

**Formula:**
```
Ai(x) = c₁ f(x) - c₂ g(x)

where:
f(x) = 1 + x³/(2·3) + x⁶/(2·3·5·6) + x⁹/(2·3·5·6·8·9) + ...
g(x) = x + x⁴/(3·4) + x⁷/(3·4·6·7) + x¹⁰/(3·4·6·7·9·10) + ...

c₁ = 1 / [3^{2/3} Γ(2/3)] ≈ 0.355028053887817
c₂ = 1 / [3^{1/3} Γ(1/3)] ≈ 0.258819403792807
```

**Pseudocode:**
```typescript
const AIRY_C1 = 0.355028053887817;  // 1 / [3^(2/3) * Γ(2/3)]
const AIRY_C2 = 0.258819403792807;  // 1 / [3^(1/3) * Γ(1/3)]

function airyAi_series(x: number): number {
    const EPSILON = 1e-16;
    const x3 = x * x * x;

    // Compute f(x)
    let f = 1.0;
    let term_f = 1.0;
    for (let k = 1; k < 50; k++) {
        term_f *= x3 / ((3 * k - 1) * (3 * k));
        f += term_f;
        if (Math.abs(term_f) < EPSILON) break;
    }

    // Compute g(x)
    let g = x;
    let term_g = x;
    for (let k = 1; k < 50; k++) {
        term_g *= x3 / ((3 * k) * (3 * k + 1));
        g += term_g;
        if (Math.abs(term_g) < EPSILON) break;
    }

    return AIRY_C1 * f - AIRY_C2 * g;
}
```

### 8B. Asymptotic Expansion (x > 0, large)

**Formula:**
```
Ai(x) ≈ [1 / (2√π x^{1/4})] exp(-ζ) [1 - 5/(72ζ²) + 385/(6220ζ⁴) - ...]

where ζ = (2/3) x^{3/2}
```

**Pseudocode:**
```typescript
function airyAi_positive_asymptotic(x: number): number {
    const zeta = (2.0 / 3.0) * Math.pow(x, 1.5);
    const zeta2 = zeta * zeta;

    const series = 1.0
        - 5.0 / (72.0 * zeta2)
        + 385.0 / (6220.0 * zeta2 * zeta2)
        - 85085.0 / (6652800.0 * Math.pow(zeta2, 3));

    const prefactor = 1.0 / (2.0 * Math.sqrt(Math.PI) * Math.pow(x, 0.25));

    return prefactor * Math.exp(-zeta) * series;
}
```

### 8C. Oscillatory Expansion (x < 0, large |x|)

**Formula:**
```
Ai(x) ≈ [1 / (√π |x|^{1/4})] sin(ζ + π/4) [1 + 5/(72ζ²) - ...]

where ζ = (2/3) |x|^{3/2}
```

**Pseudocode:**
```typescript
function airyAi_negative_asymptotic(x: number): number {
    const abs_x = Math.abs(x);
    const zeta = (2.0 / 3.0) * Math.pow(abs_x, 1.5);
    const zeta2 = zeta * zeta;

    const series = 1.0
        + 5.0 / (72.0 * zeta2)
        - 385.0 / (6220.0 * zeta2 * zeta2);

    const prefactor = 1.0 / (Math.sqrt(Math.PI) * Math.pow(abs_x, 0.25));

    return prefactor * Math.sin(zeta + Math.PI / 4) * series;
}
```

### 8D. Complete Implementation

```typescript
export function airyAi(x: number): number {
    if (x < -10) {
        return airyAi_negative_asymptotic(x);
    } else if (x < 2) {
        return airyAi_series(x);
    } else {
        return airyAi_positive_asymptotic(x);
    }
}
```

---

## 9. Airy Function Bi(x)

### Mathematical Background

**Relation to Ai:**
```
Bi(x) = (1/√3)[e^{iπ/6} Ai(xe^{-2πi/3}) + e^{-iπ/6} Ai(xe^{2πi/3})]
```

### Series Expansion

**Formula:**
```
Bi(x) = c₃ f(x) + c₄ g(x)

where:
c₃ = 1 / [3^{1/6} Γ(2/3)] ≈ 0.614926627446001
c₄ = 3^{1/6} / Γ(1/3) ≈ 0.448288357353826
```

### Algorithm

**Pseudocode:**
```typescript
const AIRY_C3 = 0.614926627446001;  // 1 / [3^(1/6) * Γ(2/3)]
const AIRY_C4 = 0.448288357353826;  // 3^(1/6) / Γ(1/3)

function airyBi_series(x: number): number {
    const EPSILON = 1e-16;
    const x3 = x * x * x;

    // Compute f(x) - same as for Ai
    let f = 1.0;
    let term_f = 1.0;
    for (let k = 1; k < 50; k++) {
        term_f *= x3 / ((3 * k - 1) * (3 * k));
        f += term_f;
        if (Math.abs(term_f) < EPSILON) break;
    }

    // Compute g(x) - same as for Ai
    let g = x;
    let term_g = x;
    for (let k = 1; k < 50; k++) {
        term_g *= x3 / ((3 * k) * (3 * k + 1));
        g += term_g;
        if (Math.abs(term_g) < EPSILON) break;
    }

    return AIRY_C3 * f + AIRY_C4 * g;  // Note: + instead of -
}

function airyBi_positive_asymptotic(x: number): number {
    const zeta = (2.0 / 3.0) * Math.pow(x, 1.5);
    const zeta2 = zeta * zeta;

    const series = 1.0
        + 5.0 / (72.0 * zeta2)
        + 385.0 / (6220.0 * zeta2 * zeta2);

    const prefactor = 1.0 / (Math.sqrt(Math.PI) * Math.pow(x, 0.25));

    return prefactor * Math.exp(zeta) * series;
}

function airyBi_negative_asymptotic(x: number): number {
    const abs_x = Math.abs(x);
    const zeta = (2.0 / 3.0) * Math.pow(abs_x, 1.5);
    const zeta2 = zeta * zeta;

    const series = 1.0
        - 5.0 / (72.0 * zeta2)
        - 385.0 / (6220.0 * zeta2 * zeta2);

    const prefactor = 1.0 / (Math.sqrt(Math.PI) * Math.pow(abs_x, 0.25));

    return prefactor * Math.cos(zeta + Math.PI / 4) * series;
}

export function airyBi(x: number): number {
    if (x < -10) {
        return airyBi_negative_asymptotic(x);
    } else if (x < 2) {
        return airyBi_series(x);
    } else {
        return airyBi_positive_asymptotic(x);
    }
}
```

---

## 10. WASM Acceleration

### Overview

Target functions for WASM implementation:
- `besselJ0`, `besselJ1` (highest priority)
- `besselY0`, `besselY1`
- `besselI0`, `besselI1`
- `besselK0`, `besselK1`

### AssemblyScript Implementation Strategy

**File Structure:**
```
src/wasm/
├── special/
│   ├── bessel-j.ts      # J_0 and J_1
│   ├── bessel-y.ts      # Y_0 and Y_1
│   ├── bessel-i.ts      # I_0 and I_1
│   ├── bessel-k.ts      # K_0 and K_1
│   ├── airy.ts          # Ai and Bi
│   └── index.ts         # Exports
```

### Example: WASM Implementation of J_0

**File: `src/wasm/special/bessel-j.ts`**
```typescript
// AssemblyScript implementation of Bessel J_0

@inline
function besselJ0_series(x: f64): f64 {
    const y = x * x;
    const ans1 = 57568490574.0 + y * (-13362590354.0
        + y * (651619640.7 + y * (-11214424.18
        + y * (77392.33017 + y * (-184.9052456)))));
    const ans2 = 57568490411.0 + y * (1029532985.0
        + y * (9494680.718 + y * (59272.64853
        + y * (267.8532712 + y))));
    return ans1 / ans2;
}

@inline
function besselJ0_asymptotic(x: f64): f64 {
    const t = 8.0 / x;
    const t2 = t * t;

    const P = 1.0
        - 0.001098628627e-2 * t2
        + 0.002734510407e-4 * t2 * t2
        - 0.002073370639e-5 * t2 * t2 * t2
        + 0.002093887211e-6 * t2 * t2 * t2 * t2;

    const Q = t * (
        -0.01562499995
        + 0.0001430488765 * t2
        - 0.6911147651e-5 * t2 * t2
        + 0.7621095161e-6 * t2 * t2 * t2
    );

    const theta = x - 0.785398163397448;  // π/4
    const sqrt_factor = Math.sqrt(0.6366197723675814 / x);  // sqrt(2/π) / sqrt(x)

    return sqrt_factor * (P * Math.cos(theta) - Q * Math.sin(theta));
}

export function besselJ0(x: f64): f64 {
    const abs_x = Math.abs(x);

    if (abs_x < 8.0) {
        return besselJ0_series(x);
    } else {
        return besselJ0_asymptotic(abs_x);
    }
}

export function besselJ1(x: f64): f64 {
    const abs_x = Math.abs(x);

    if (abs_x < 8.0) {
        const y = x * x;
        const ans1 = x * (72362614232.0 + y * (-7895059235.0
            + y * (242396853.1 + y * (-2972611.439
            + y * (15704.48260 + y * (-30.16036606))))));
        const ans2 = 144725228442.0 + y * (2300535178.0
            + y * (18583304.74 + y * (99447.43394
            + y * (376.9991397 + y))));
        return ans1 / ans2;
    } else {
        const t = 8.0 / abs_x;
        const t2 = t * t;

        const P = 1.0
            + 0.00183105e-2 * t2
            - 0.003516396496e-4 * t2 * t2
            + 0.002457520174e-5 * t2 * t2 * t2
            - 0.00240337019e-6 * t2 * t2 * t2 * t2;

        const Q = t * (
            0.04687499995
            - 0.0002002690873 * t2
            + 0.8449199096e-5 * t2 * t2
            - 0.88228987e-6 * t2 * t2 * t2
        );

        const theta = abs_x - 2.356194490192345;  // 3π/4
        const sqrt_factor = Math.sqrt(0.6366197723675814 / abs_x);

        const result = sqrt_factor * (P * Math.cos(theta) - Q * Math.sin(theta));
        return x > 0 ? result : -result;
    }
}
```

### JavaScript Bridge

**File: `src/wasm/besselBridge.js`**
```javascript
import { WasmLoader } from './WasmLoader.js'

export class BesselWasmBridge {
  constructor() {
    this.wasmModule = null;
    this.useWasm = false;
  }

  async initialize() {
    try {
      this.wasmModule = await WasmLoader.load('special');
      this.useWasm = true;
    } catch (e) {
      console.warn('WASM Bessel functions unavailable, using JavaScript fallback');
      this.useWasm = false;
    }
  }

  besselJ0(x) {
    if (this.useWasm && this.wasmModule) {
      return this.wasmModule.besselJ0(x);
    }
    return null;  // Fall back to JS implementation
  }

  besselJ1(x) {
    if (this.useWasm && this.wasmModule) {
      return this.wasmModule.besselJ1(x);
    }
    return null;
  }
}
```

### Integration with Factory Functions

**File: `src/function/special/besselJ.js`**
```javascript
import { factory } from '../../utils/factory.js'
import { BesselWasmBridge } from '../../wasm/besselBridge.js'

let wasmBridge = null;

export const createBesselJ = factory('besselJ', ['typed'], ({ typed }) => {
  // Initialize WASM bridge lazily
  if (!wasmBridge) {
    wasmBridge = new BesselWasmBridge();
    wasmBridge.initialize().catch(() => {});
  }

  return typed('besselJ', {
    'number, number': function(order, x) {
      // Try WASM first for orders 0 and 1
      if (wasmBridge?.useWasm) {
        if (order === 0) {
          const result = wasmBridge.besselJ0(x);
          if (result !== null) return result;
        } else if (order === 1) {
          const result = wasmBridge.besselJ1(x);
          if (result !== null) return result;
        }
      }

      // JavaScript fallback
      return besselJ_js(order, x);
    }
  });
});

function besselJ_js(order, x) {
  // ... JavaScript implementation as described above
}
```

### Performance Benchmarks

**Expected Speedups:**
- J_0, J_1: 2-3x faster in WASM
- Y_0, Y_1: 2-3x faster in WASM
- I_0, I_1: 3-5x faster in WASM (fewer transcendental calls)
- K_0, K_1: 2-3x faster in WASM
- Airy functions: 2-4x faster in WASM

**Benchmark Code:**
```javascript
import { bench, run } from 'tinybench';

const suite = new bench.Suite();

suite
  .add('BesselJ0 JavaScript', () => {
    besselJ0_js(5.2);
  })
  .add('BesselJ0 WASM', () => {
    wasmModule.besselJ0(5.2);
  });

await run();
```

---

## Numerical Accuracy Targets

| Function | Relative Error Target | Notes |
|----------|----------------------|-------|
| J_ν(x) | < 10⁻¹⁴ | All x, ν ≥ 0 |
| Y_ν(x) | < 10⁻¹³ | x > 0.1, avoid singularity |
| I_ν(x) | < 10⁻¹⁴ | Use scaled version for x > 50 |
| K_ν(x) | < 10⁻¹³ | Use scaled version for x > 10 |
| j_n(x) | < 10⁻¹⁴ | Integer n, x > 0 |
| y_n(x) | < 10⁻¹³ | Integer n, x > 0.1 |
| Ai(x) | < 10⁻¹⁴ | All x |
| Bi(x) | < 10⁻¹⁴ | All x |

---

## Testing Strategy

### Unit Tests

**Test Coverage:**
1. **Special values:** x = 0, small x, x = 1, large x
2. **Integer orders:** n = 0, 1, 2, 5, 10, 50
3. **Non-integer orders:** ν = 0.5, 1.5, 2.3, π
4. **Negative arguments:** x < 0 (where defined)
5. **Boundary cases:** Transitions between algorithms
6. **Known values:** From DLMF or Abramowitz & Stegun tables

**Example Test:**
```javascript
describe('besselJ0', function() {
  it('should compute J_0(0) = 1', function() {
    approxEqual(besselJ0(0), 1.0, 1e-14);
  });

  it('should compute J_0(1) accurately', function() {
    // DLMF reference value
    approxEqual(besselJ0(1), 0.7651976865579666, 1e-14);
  });

  it('should handle large arguments', function() {
    approxEqual(besselJ0(100), -0.005063656411097588, 1e-13);
  });

  it('should match series and asymptotic at transition', function() {
    const x = 8.0;
    const series = besselJ0_series(x);
    const asymptotic = besselJ0_asymptotic(x);
    approxEqual(series, asymptotic, 1e-10);
  });
});
```

### Reference Values

**Sources:**
1. **DLMF** (Digital Library of Mathematical Functions): https://dlmf.nist.gov/
2. **Abramowitz & Stegun**: Handbook of Mathematical Functions
3. **Boost C++ Libraries**: Test data
4. **GNU Scientific Library (GSL)**: Test suite
5. **SciPy/mpmath**: High-precision reference

---

## References

1. **Abramowitz, M. and Stegun, I.A.** (1972). *Handbook of Mathematical Functions*. Dover.
   - Chapter 9: Bessel Functions
   - Chapter 10: Bessel Functions of Fractional Order

2. **Press, W.H., et al.** (2007). *Numerical Recipes*, 3rd Edition. Cambridge University Press.
   - Section 6.5: Bessel Functions
   - Section 6.6: Modified Bessel Functions
   - Section 6.7: Airy Functions

3. **Temme, N.M.** (1975). "On the numerical evaluation of the modified Bessel function of the third kind." *J. Comput. Phys.* 19:324-337.

4. **Olver, F.W.J., et al.** (2010). *NIST Handbook of Mathematical Functions*. Cambridge University Press.
   - Chapter 9: Airy and Related Functions
   - Chapter 10: Bessel Functions

5. **Boost C++ Libraries**: Special Functions Documentation
   - https://www.boost.org/doc/libs/release/libs/math/doc/html/special.html

6. **Digital Library of Mathematical Functions (DLMF)**
   - https://dlmf.nist.gov/

---

## Implementation Checklist

### Phase 2 Sprint 2 Tasks

- [ ] **Task 1**: Implement `besselJ(nu, x)` with Miller's algorithm
  - [ ] Series expansion for small x
  - [ ] Backward recurrence for intermediate x
  - [ ] Asymptotic expansion for large x
  - [ ] Optimized `besselJ0` and `besselJ1`
  - [ ] Unit tests with DLMF reference values

- [ ] **Task 2**: Implement `besselY(nu, x)`
  - [ ] Series with logarithmic terms
  - [ ] Asymptotic expansion
  - [ ] Singularity handling at x = 0
  - [ ] Unit tests

- [ ] **Task 3**: Implement `besselI(nu, x)`
  - [ ] Series expansion
  - [ ] Exponential scaling for stability
  - [ ] Optimized `besselI0` and `besselI1`
  - [ ] Unit tests

- [ ] **Task 4**: Implement `besselK(nu, x)`
  - [ ] Series with logarithmic terms
  - [ ] Temme's uniform expansion
  - [ ] Scaled asymptotic expansion
  - [ ] Optimized `besselK0` and `besselK1`
  - [ ] Unit tests

- [ ] **Task 5**: Implement spherical Bessel `j_n(x)`
  - [ ] Direct formulas for n = 0, 1
  - [ ] Forward recurrence
  - [ ] Series for small x
  - [ ] Unit tests

- [ ] **Task 6**: Implement spherical Bessel `y_n(x)`
  - [ ] Direct formulas
  - [ ] Forward recurrence
  - [ ] Unit tests

- [ ] **Task 7**: Implement Hankel functions
  - [ ] `hankelH1(nu, x)` = J + iY
  - [ ] `hankelH2(nu, x)` = J - iY
  - [ ] Complex number support
  - [ ] Unit tests

- [ ] **Task 8**: Implement Airy Ai(x)
  - [ ] Series expansion
  - [ ] Positive asymptotic
  - [ ] Negative asymptotic (oscillatory)
  - [ ] Unit tests

- [ ] **Task 9**: Implement Airy Bi(x)
  - [ ] Series expansion
  - [ ] Asymptotic expansions
  - [ ] Unit tests

- [ ] **Task 10**: WASM acceleration
  - [ ] AssemblyScript implementations
  - [ ] JavaScript bridge
  - [ ] Factory integration
  - [ ] Performance benchmarks
  - [ ] Verify 2-5x speedup

---

**Document Version:** 1.0
**Last Updated:** 2025-11-29
**Status:** Ready for Implementation
