# Phase 14: Additional Special Functions - Detailed Algorithms

## Overview

This document provides comprehensive implementation details for advanced special functions, including algorithms, pseudocode, numerical coefficients, and stability considerations.

**Sprint 14: Additional Special Functions** (10 tasks)
- Target: High-accuracy (ε < 10⁻¹⁴ for IEEE-754 double precision)
- Performance: WASM acceleration for iterative algorithms
- Stability: Proper domain handling and series convergence

---

## 1. Complementary Error Function: erfc(x) and Inverses

### 1A. Complementary Error Function: erfc(x)

**Definition:**
```
erfc(x) = 1 - erf(x) = (2/√π) ∫_x^∞ e^(-t²) dt
```

**Key Properties:**
- erfc(0) = 1
- erfc(∞) = 0
- erfc(-x) = 2 - erfc(x)
- More stable than 1 - erf(x) for large x

### Algorithm Selection Strategy

```
if x < 0:
    return 2 - erfc(-x)
elif x < 0.5:
    return 1 - erf_series(x)
elif x < 4:
    return erfccheb(x)    # Chebyshev rational approximation
else:
    return erfc_asymptotic(x)
```

### 1B. Rational Approximation (0.5 ≤ x ≤ 4)

**Cody's Rational Approximation:**

```
erfc(x) ≈ exp(-x²) · R(x) / S(x)

where:
R(x) = Σ_{i=0}^4 p_i · x^i
S(x) = Σ_{i=0}^4 q_i · x^i
```

**Coefficients (Maximum error: 1.3e-17):**
```
p₀ =  3.209377589138469472562e+03
p₁ =  3.774852376853020208137e+02
p₂ =  1.138641541510501556495e+02
p₃ =  3.161123743870565596947e+00
p₄ =  1.857777061846031526730e-01

q₀ =  2.844236833439170622273e+03
q₁ =  1.282616526077372275645e+03
q₂ =  2.440246379344441733056e+02
q₃ =  2.360129095234412093499e+01
q₄ =  1.000000000000000000000e+00
```

**Pseudocode:**
```typescript
function erfc_rational(x: number): number {
    // Cody's rational approximation for 0.5 <= x <= 4
    const p = [
        3.209377589138469472562e+03,
        3.774852376853020208137e+02,
        1.138641541510501556495e+02,
        3.161123743870565596947e+00,
        1.857777061846031526730e-01
    ];

    const q = [
        2.844236833439170622273e+03,
        1.282616526077372275645e+03,
        2.440246379344441733056e+02,
        2.360129095234412093499e+01,
        1.000000000000000000000e+00
    ];

    let num = p[0];
    let den = q[0];

    for (let i = 1; i < 5; i++) {
        num = num * x + p[i];
        den = den * x + q[i];
    }

    return Math.exp(-x * x) * num / den;
}
```

### 1C. Asymptotic Expansion (x > 4)

**Formula:**
```
erfc(x) ≈ (e^(-x²) / (x√π)) · [1 + Σ_{n=1}^N (-1)^n · (2n-1)!! / (2x²)^n]
```

**Pseudocode:**
```typescript
function erfc_asymptotic(x: number): number {
    const SQRT_PI = 1.7724538509055160272981674833411;
    const x2 = x * x;
    const inv_2x2 = 1.0 / (2 * x2);

    let sum = 1.0;
    let term = 1.0;

    // Use first 10 terms
    for (let n = 1; n <= 10; n++) {
        term *= -(2 * n - 1) * inv_2x2;
        sum += term;

        if (Math.abs(term) < 1e-16 * Math.abs(sum)) break;
    }

    return Math.exp(-x2) / (x * SQRT_PI) * sum;
}
```

### 1D. Inverse Error Function: erfinv(x)

**Definition:** erfinv(y) = x such that erf(x) = y, for -1 < y < 1

**Algorithm:** Rational approximation followed by Halley refinement

**Initial Approximation (Acklam's method):**

For |y| ≤ 0.7:
```
x₀ = y · P(y²) / Q(y²)

P(t) = a₀ + a₁t + a₂t² + a₃t³
Q(t) = 1 + b₁t + b₂t² + b₃t³ + b₄t⁴
```

**Coefficients:**
```
a₀ = -3.969683028665376e+01
a₁ =  2.209460984245205e+02
a₂ = -2.759285104469687e+02
a₃ =  1.383577518672690e+02

b₁ = -5.447609879822406e+01
b₂ =  1.615858368580409e+02
b₃ = -1.556989798598866e+02
b₄ =  6.680131188771972e+01
```

For 0.7 < |y| < 1:
```
Let z = √(-ln((1 - |y|)/2))

x₀ = sign(y) · (c₀ + c₁z + c₂z² + c₃z³ + c₄z⁴) / (1 + d₁z + d₂z² + d₃z³ + d₄z⁴)
```

**Coefficients:**
```
c₀ =  1.641345311
c₁ =  3.429567803
c₂ = -1.624906493
c₃ = -1.970840454
c₄ =  1.0

d₁ =  1.637067800
d₂ =  3.543889200
d₃ =  1.0
d₄ =  0.0
```

**Halley Refinement:**
```
x_{n+1} = x_n - (erf(x_n) - y) / (2/√π · e^(-x_n²) · (1 + x_n · (erf(x_n) - y)))
```

**Pseudocode:**
```typescript
function erfinv(y: number): number {
    if (Math.abs(y) >= 1) {
        return y > 0 ? Infinity : -Infinity;
    }
    if (y === 0) return 0;

    let x0: number;

    if (Math.abs(y) <= 0.7) {
        // Central region
        const y2 = y * y;

        const a = [
            -3.969683028665376e+01,
             2.209460984245205e+02,
            -2.759285104469687e+02,
             1.383577518672690e+02
        ];

        const b = [
            -5.447609879822406e+01,
             1.615858368580409e+02,
            -1.556989798598866e+02,
             6.680131188771972e+01
        ];

        let num = a[0] + y2 * (a[1] + y2 * (a[2] + y2 * a[3]));
        let den = 1 + y2 * (b[0] + y2 * (b[1] + y2 * (b[2] + y2 * b[3])));

        x0 = y * num / den;
    } else {
        // Tail region
        const z = Math.sqrt(-Math.log((1 - Math.abs(y)) / 2));

        const c = [1.641345311, 3.429567803, -1.624906493, -1.970840454, 1.0];
        const d = [1.637067800, 3.543889200, 1.0, 0.0];

        const num = c[0] + z * (c[1] + z * (c[2] + z * (c[3] + z * c[4])));
        const den = 1 + z * (d[0] + z * (d[1] + z * d[2]));

        x0 = (y > 0 ? 1 : -1) * num / den;
    }

    // Halley refinement (2 iterations sufficient)
    for (let i = 0; i < 2; i++) {
        const e = erf(x0) - y;
        const sqrt_pi = 1.7724538509055160272981674833411;
        const f_prime = 2 / sqrt_pi * Math.exp(-x0 * x0);
        const f_double_prime = -2 * x0 * f_prime;

        x0 = x0 - e / (f_prime + 0.5 * e * f_double_prime / f_prime);
    }

    return x0;
}
```

### 1E. Inverse Complementary Error Function: erfcinv(y)

**Definition:** erfcinv(y) = x such that erfc(x) = y, for 0 < y < 2

**Relation:** erfcinv(y) = erfinv(1 - y)

**Pseudocode:**
```typescript
function erfcinv(y: number): number {
    if (y <= 0 || y >= 2) {
        throw new Error("erfcinv: argument must be in (0, 2)");
    }
    return erfinv(1 - y);
}
```

---

## 2. Digamma and Polygamma Functions

### 2A. Digamma Function: ψ(x) = Γ'(x)/Γ(x)

**Definition:** The logarithmic derivative of the gamma function

**Key Properties:**
- ψ(1) = -γ (Euler's constant: 0.5772156649015329...)
- ψ(x+1) = ψ(x) + 1/x (recurrence)
- ψ(1-x) - ψ(x) = π cot(πx) (reflection)

### Algorithm Selection Strategy

```
if x <= 0 and x is integer:
    return NaN  // Pole
elif x < 0:
    return digamma(1-x) - π·cot(πx)  // Reflection
elif x < 10:
    Use recurrence to shift to x ≥ 10, then use asymptotic
else:
    Use asymptotic expansion
```

### Asymptotic Expansion (x ≥ 10)

**Formula:**
```
ψ(x) ≈ ln(x) - 1/(2x) - 1/(12x²) + 1/(120x⁴) - 1/(252x⁶) + 1/(240x⁸) - ...
     = ln(x) - 1/(2x) - Σ_{k=1}^∞ B_{2k} / (2k·x^{2k})
```

where B_{2k} are Bernoulli numbers.

**Pseudocode:**
```typescript
function digamma(x: number): number {
    const EULER_MASCHERONI = 0.5772156649015328606065120900824;

    // Handle non-positive integers (poles)
    if (x <= 0 && Math.floor(x) === x) {
        return NaN;
    }

    // Reflection formula for negative x
    if (x < 0) {
        return digamma(1 - x) - Math.PI / Math.tan(Math.PI * x);
    }

    // Use recurrence to shift x ≥ 10
    let result = 0;
    while (x < 10) {
        result -= 1 / x;
        x += 1;
    }

    // Asymptotic expansion for x ≥ 10
    const x2 = x * x;

    result += Math.log(x) - 0.5 / x;

    // Bernoulli number terms: B_2 = 1/6, B_4 = -1/30, B_6 = 1/42, B_8 = -1/30, ...
    const inv_x2 = 1 / x2;

    result -= (1.0 / 12) * inv_x2;                    // B_2 / (2·x²)
    result += (1.0 / 120) * inv_x2 * inv_x2;          // B_4 / (4·x⁴)
    result -= (1.0 / 252) * inv_x2 * inv_x2 * inv_x2; // B_6 / (6·x⁶)

    return result;
}
```

### 2B. Trigamma Function: ψ'(x)

**Definition:** ψ'(x) = d²ln(Γ(x))/dx²

**Recurrence:** ψ'(x+1) = ψ'(x) - 1/x²

**Asymptotic Expansion (x ≥ 10):**
```
ψ'(x) ≈ 1/x + 1/(2x²) + 1/(6x³) - 1/(30x⁵) + 1/(42x⁷) - ...
```

**Pseudocode:**
```typescript
function trigamma(x: number): number {
    if (x <= 0 && Math.floor(x) === x) {
        return NaN;
    }

    // Reflection formula
    if (x < 0) {
        const pi_x = Math.PI * x;
        const csc_pi_x = 1 / Math.sin(pi_x);
        return trigamma(1 - x) + Math.PI * Math.PI * csc_pi_x * csc_pi_x;
    }

    // Use recurrence to shift x ≥ 10
    let result = 0;
    while (x < 10) {
        result += 1 / (x * x);
        x += 1;
    }

    // Asymptotic expansion
    const inv_x = 1 / x;
    const inv_x2 = inv_x * inv_x;

    result += inv_x;
    result += 0.5 * inv_x2;
    result += inv_x2 * inv_x / 6;
    result -= inv_x2 * inv_x2 * inv_x / 30;
    result += inv_x2 * inv_x2 * inv_x2 * inv_x / 42;

    return result;
}
```

### 2C. Polygamma Function: ψ^(n)(x)

**General Form:**
```
ψ^(n)(x) = (-1)^{n+1} · n! · Σ_{k=0}^∞ 1/(x+k)^{n+1}
```

**Asymptotic Expansion:**
```
ψ^(n)(x) ≈ (-1)^{n+1} · [n!/x^{n+1} + (n+1)!/(2x^{n+2}) + ...]
```

---

## 3. Lambert W Function

### Mathematical Background

**Definition:** W(z) is the solution to:
```
W(z) · e^{W(z)} = z
```

**Branches:**
- W₀(z): Principal branch (W ≥ -1 for real z)
- W₋₁(z): Lower branch (W ≤ -1 for -1/e ≤ z < 0)

**Domain:**
- W₀: z ≥ -1/e
- W₋₁: -1/e ≤ z < 0

### Algorithm: Halley's Method

**Initial Approximation:**

For W₀ branch:
```
if z < -0.32:
    // Near branch point -1/e ≈ -0.36788
    p = √(2·e·z + 2)
    w₀ = -1 + p - p²/3 + 11p³/72
elif z < 1:
    w₀ = z  // Simple initial guess
else:
    L₁ = ln(z)
    L₂ = ln(L₁)
    w₀ = L₁ - L₂ + L₂/L₁
```

For W₋₁ branch (-1/e ≤ z < 0):
```
p = √(2·e·z + 2)
w₀ = -1 - p - p²/3 - 11p³/72
```

**Halley Iteration:**
```
w_{n+1} = w_n - (w_n·e^{w_n} - z) / (e^{w_n}·(w_n + 1) - (w_n + 2)·(w_n·e^{w_n} - z)/(2w_n + 2))
```

Simplified:
```
e_w = e^{w_n}
f = w_n·e_w - z
w_{n+1} = w_n - f / (e_w·(w_n + 1) - (w_n + 2)·f/(2w_n + 2))
```

**Pseudocode:**
```typescript
function lambertW(z: number, branch: number = 0): number {
    const E_INV = 0.36787944117144232159552377016146;  // 1/e

    if (z < -E_INV) {
        throw new Error("lambertW: argument out of range");
    }

    if (z === 0) return 0;
    if (z === Infinity) return Infinity;

    let w: number;

    if (branch === 0) {
        // Principal branch W₀
        if (z < -0.32) {
            // Near branch point
            const p = Math.sqrt(2 * Math.E * z + 2);
            w = -1 + p * (1 - p / 3 + 11 * p * p / 72);
        } else if (z < 1) {
            w = z;
        } else {
            const L1 = Math.log(z);
            const L2 = Math.log(L1);
            w = L1 - L2 + L2 / L1;
        }
    } else if (branch === -1) {
        // Lower branch W₋₁
        if (z >= 0) {
            throw new Error("lambertW: W₋₁ branch requires z < 0");
        }
        const p = Math.sqrt(2 * Math.E * z + 2);
        w = -1 - p * (1 + p / 3 + 11 * p * p / 72);
    } else {
        throw new Error("lambertW: only branches 0 and -1 supported");
    }

    // Halley iteration (typically 2-3 iterations)
    const MAX_ITER = 10;
    const TOL = 1e-15;

    for (let i = 0; i < MAX_ITER; i++) {
        const ew = Math.exp(w);
        const wew = w * ew;
        const f = wew - z;

        if (Math.abs(f) < TOL * (1 + Math.abs(z))) {
            break;
        }

        const w1 = w + 1;
        const denom = ew * w1 - (w + 2) * f / (2 * w1);

        if (Math.abs(denom) < 1e-100) break;

        w = w - f / denom;
    }

    return w;
}
```

**Special Values:**
```
W₀(0) = 0
W₀(-1/e) = -1
W₀(e) = 1
W₋₁(-1/e) = -1
```

---

## 4. Exponential Integrals

### 4A. Exponential Integral: E_n(x)

**Definition:**
```
E_n(x) = ∫_1^∞ e^(-xt)/t^n dt    (n ≥ 0, x > 0)
```

**Recurrence Relation:**
```
E_{n+1}(x) = (e^(-x) - x·E_n(x))/n
```

**Algorithm Selection:**

```
if x < 1:
    Use series expansion
elif x < 50:
    Use continued fraction
else:
    Use asymptotic expansion
```

### Series Expansion (Small x)

**Formula:**
```
E_n(x) = (-x)^{n-1}/(n-1)! · [-ln(x) - γ + Σ_{k=0, k≠n-1}^∞ (-x)^k / ((k - n + 1)·k!)]
```

For n = 1:
```
E_1(x) = -ln(x) - γ - Σ_{k=1}^∞ (-x)^k / (k·k!)
```

**Pseudocode:**
```typescript
function E1_series(x: number): number {
    const EULER = 0.5772156649015328606065120900824;
    const MAX_ITER = 100;
    const TOL = 1e-16;

    let sum = -Math.log(x) - EULER;
    let term = -x;

    for (let k = 2; k < MAX_ITER; k++) {
        term *= -x / k;
        const add = term / k;
        sum += add;

        if (Math.abs(add) < TOL * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}
```

### Continued Fraction (Intermediate x)

**Formula:**
```
E_1(x) = e^(-x) · [1/(x + 1/(1 + 1/(x + 2/(1 + 2/(x + 3/(1 + ...)))]
```

**Modified Lentz's Algorithm:**

```typescript
function E1_continued_fraction(x: number): number {
    const TINY = 1e-30;
    const MAX_ITER = 100;
    const TOL = 1e-15;

    let f = TINY;
    let C = f;
    let D = 0;

    for (let j = 1; j < MAX_ITER; j++) {
        const a = j;
        const b = x + 2 * j - 1;

        D = b + a * D;
        if (Math.abs(D) < TINY) D = TINY;
        D = 1 / D;

        C = b + a / C;
        if (Math.abs(C) < TINY) C = TINY;

        const delta = C * D;
        f *= delta;

        if (Math.abs(delta - 1) < TOL) {
            break;
        }
    }

    return Math.exp(-x) / (x + 1 - f);
}
```

### 4B. Ei(x) - Alternative Exponential Integral

**Definition:**
```
Ei(x) = -∫_{-x}^∞ e^(-t)/t dt = ∫_{-∞}^x e^t/t dt
```

**Relation to E_1:**
```
Ei(x) = -E_1(-x)    for x > 0
```

**Series (|x| < 40):**
```
Ei(x) = γ + ln|x| + Σ_{k=1}^∞ x^k / (k·k!)
```

**Pseudocode:**
```typescript
function Ei(x: number): number {
    const EULER = 0.5772156649015328606065120900824;

    if (x < 0) {
        return -E1(-x);
    }

    if (x > 40) {
        // Asymptotic expansion
        const inv_x = 1 / x;
        let sum = 1;
        let term = 1;

        for (let k = 1; k <= 20; k++) {
            term *= k * inv_x;
            sum += term;
        }

        return Math.exp(x) * inv_x * sum;
    }

    // Series expansion
    let sum = EULER + Math.log(Math.abs(x));
    let term = x;

    for (let k = 2; k <= 100; k++) {
        term *= x / k;
        const add = term / k;
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}
```

### 4C. Logarithmic Integral: li(x)

**Definition:**
```
li(x) = ∫_0^x dt/ln(t) = Ei(ln(x))
```

**Pseudocode:**
```typescript
function li(x: number): number {
    if (x <= 0) {
        throw new Error("li: argument must be positive");
    }
    if (x === 1) {
        return -Infinity;  // Principal value = 0
    }
    return Ei(Math.log(x));
}
```

---

## 5. Fresnel Integrals

### Mathematical Background

**Definitions:**
```
S(x) = ∫_0^x sin(πt²/2) dt
C(x) = ∫_0^x cos(πt²/2) dt
```

**Key Properties:**
- S(-x) = -S(x), C(-x) = -C(x) (odd functions)
- S(∞) = C(∞) = 1/2
- Related to error function of complex arguments

### Algorithm Selection

```
if |x| < 1.2:
    Use power series
elif |x| < 5:
    Use rational approximation
else:
    Use auxiliary functions f(x), g(x)
```

### Power Series (Small x)

**Formula:**
```
S(x) = Σ_{n=0}^∞ (-1)^n · (π/2)^{2n+1} · x^{4n+3} / [(2n+1)!·(4n+3)]

C(x) = Σ_{n=0}^∞ (-1)^n · (π/2)^{2n} · x^{4n+1} / [(2n)!·(4n+1)]
```

**Pseudocode:**
```typescript
function fresnelS_series(x: number): number {
    const PI_2 = Math.PI / 2;
    const x2 = x * x;
    const x4 = x2 * x2;

    let sum = x * x2;  // x³
    let term = sum;
    let pi_pow = PI_2;
    let factorial = 1;

    for (let n = 1; n <= 50; n++) {
        factorial *= (2 * n) * (2 * n + 1);
        pi_pow *= PI_2 * PI_2;
        term *= -x4;

        const add = pi_pow * term / (factorial * (4 * n + 3));
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}

function fresnelC_series(x: number): number {
    const PI_2 = Math.PI / 2;
    const x2 = x * x;
    const x4 = x2 * x2;

    let sum = x;
    let term = x;
    let pi_pow = 1;
    let factorial = 1;

    for (let n = 1; n <= 50; n++) {
        factorial *= (2 * n - 1) * (2 * n);
        pi_pow *= PI_2 * PI_2;
        term *= -x4;

        const add = pi_pow * term / (factorial * (4 * n + 1));
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}
```

### Auxiliary Functions Method (Large x)

**Formula:**
```
S(x) = 1/2 - f(x)·cos(πx²/2) - g(x)·sin(πx²/2)
C(x) = 1/2 + f(x)·sin(πx²/2) - g(x)·cos(πx²/2)

where:
f(x) ≈ (1 + a₁/x² + a₂/x⁴ + ...) / (πx)
g(x) ≈ (1 + b₁/x² + b₂/x⁴ + ...) / (πx³)
```

**Coefficients (Abramowitz & Stegun):**
```typescript
function fresnel_auxiliary(x: number): { S: number, C: number } {
    const PI = Math.PI;
    const x2 = x * x;
    const t = PI * x2;

    // f(x) coefficients
    const f_num = 1 +
        0.926 / x2 +
        1.792 / (x2 * x2);
    const f = f_num / (PI * x);

    // g(x) coefficients
    const g_num = 1 +
        0.926 / x2 +
        4.142 / (x2 * x2);
    const g = g_num / (PI * x2 * x);

    const cos_t = Math.cos(t / 2);
    const sin_t = Math.sin(t / 2);

    const S = 0.5 - f * cos_t - g * sin_t;
    const C = 0.5 + f * sin_t - g * cos_t;

    return { S, C };
}
```

---

## 6. Sine and Cosine Integrals

### 6A. Sine Integral: Si(x)

**Definition:**
```
Si(x) = ∫_0^x sin(t)/t dt
```

**Key Properties:**
- Si(0) = 0
- Si(∞) = π/2
- Si(-x) = -Si(x)

### Power Series (|x| < π)

**Formula:**
```
Si(x) = Σ_{n=0}^∞ (-1)^n · x^{2n+1} / [(2n+1)·(2n+1)!]
```

**Pseudocode:**
```typescript
function Si_series(x: number): number {
    const x2 = x * x;
    let sum = x;
    let term = x;

    for (let n = 1; n <= 50; n++) {
        term *= -x2 / ((2 * n) * (2 * n + 1));
        const add = term / (2 * n + 1);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}
```

### Auxiliary Function Method (Large |x|)

**Formula:**
```
Si(x) = π/2 - f(x)·cos(x) - g(x)·sin(x)

where:
f(x) = 1/x · P(1/x²)
g(x) = 1/x³ · Q(1/x²)
```

**Rational Approximations:**
```typescript
function Si_asymptotic(x: number): number {
    const abs_x = Math.abs(x);
    const t = 1 / (abs_x * abs_x);

    // P(t) polynomial
    const P = 1 -
        4.54393409816329991e-2 * t +
        1.15457225751016682e-3 * t * t -
        1.41018536821330254e-5 * t * t * t;

    // Q(t) polynomial
    const Q = 1 -
        9.17463611873684053e-2 * t +
        1.97532619115160750e-3 * t * t -
        1.88408550678914348e-5 * t * t * t;

    const f = P / abs_x;
    const g = Q / (abs_x * abs_x * abs_x);

    const cos_x = Math.cos(abs_x);
    const sin_x = Math.sin(abs_x);

    const result = Math.PI / 2 - f * cos_x - g * sin_x;

    return x >= 0 ? result : -result;
}
```

### 6B. Cosine Integral: Ci(x)

**Definition:**
```
Ci(x) = -∫_x^∞ cos(t)/t dt = γ + ln(x) + ∫_0^x (cos(t) - 1)/t dt
```

**Power Series:**
```
Ci(x) = γ + ln(x) + Σ_{n=1}^∞ (-1)^n · x^{2n} / [(2n)·(2n)!]
```

**Pseudocode:**
```typescript
function Ci(x: number): number {
    const EULER = 0.5772156649015328606065120900824;

    if (x <= 0) {
        throw new Error("Ci: argument must be positive");
    }

    if (x < Math.PI) {
        // Series expansion
        const x2 = x * x;
        let sum = EULER + Math.log(x);
        let term = -x2 / 4;
        sum += term / 2;

        for (let n = 2; n <= 50; n++) {
            term *= -x2 / ((2 * n - 1) * (2 * n));
            const add = term / (2 * n);
            sum += add;

            if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
                break;
            }
        }

        return sum;
    } else {
        // Asymptotic expansion
        const t = 1 / (x * x);

        const P = 1 -
            4.54393409816329991e-2 * t +
            1.15457225751016682e-3 * t * t;

        const Q = 1 -
            9.17463611873684053e-2 * t +
            1.97532619115160750e-3 * t * t;

        const f = P / x;
        const g = Q / (x * x * x);

        return f * Math.sin(x) - g * Math.cos(x);
    }
}
```

### 6C. Hyperbolic Integrals: Shi(x), Chi(x)

**Definitions:**
```
Shi(x) = ∫_0^x sinh(t)/t dt
Chi(x) = γ + ln(x) + ∫_0^x (cosh(t) - 1)/t dt
```

**Relations:**
```
Shi(x) = -i·Si(ix)
Chi(x) = Ci(ix) + iπ/2  (for x > 0)
```

**Pseudocode:**
```typescript
function Shi(x: number): number {
    // Series: Σ x^{2n+1} / [(2n+1)·(2n+1)!]
    const x2 = x * x;
    let sum = x;
    let term = x;

    for (let n = 1; n <= 50; n++) {
        term *= x2 / ((2 * n) * (2 * n + 1));
        const add = term / (2 * n + 1);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}

function Chi(x: number): number {
    const EULER = 0.5772156649015328606065120900824;

    if (x <= 0) {
        throw new Error("Chi: argument must be positive");
    }

    // Series: γ + ln(x) + Σ x^{2n} / [(2n)·(2n)!]
    const x2 = x * x;
    let sum = EULER + Math.log(x);
    let term = x2 / 4;
    sum += term / 2;

    for (let n = 2; n <= 50; n++) {
        term *= x2 / ((2 * n - 1) * (2 * n));
        const add = term / (2 * n);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}
```

---

## 7. Struve Functions

### Mathematical Background

**Definition:** Struve function H_ν(x) satisfies:
```
H_ν(x) = (x/2)^{ν+1} · Σ_{k=0}^∞ [(-1)^k / (Γ(k+3/2)·Γ(k+ν+3/2))] · (x/2)^{2k}
```

**Differential Equation:**
```
x²y'' + xy' + (x² - ν²)y = 4(x/2)^{ν+1} / (√π·Γ(ν+1/2))
```

**Modified Struve Function:**
```
L_ν(x) = -i·e^{-iνπ/2}·H_ν(ix)
      = (x/2)^{ν+1} · Σ_{k=0}^∞ [1 / (Γ(k+3/2)·Γ(k+ν+3/2))] · (x/2)^{2k}
```

### Power Series

**Pseudocode:**
```typescript
function struveH(nu: number, x: number): number {
    const SQRT_PI = 1.7724538509055160272981674833411;

    if (x === 0) return 0;

    const halfx = x / 2;
    const halfx2 = halfx * halfx;
    const prefactor = Math.pow(halfx, nu + 1);

    let sum = 0;
    let term = 1 / (SQRT_PI * gamma(nu + 1.5));
    sum = term;

    for (let k = 1; k <= 100; k++) {
        term *= -halfx2 / (k * (k + nu + 0.5));
        sum += term;

        if (Math.abs(term) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return prefactor * sum;
}

function struveL(nu: number, x: number): number {
    const SQRT_PI = 1.7724538509055160272981674833411;

    if (x === 0) return 0;

    const halfx = x / 2;
    const halfx2 = halfx * halfx;
    const prefactor = Math.pow(halfx, nu + 1);

    let sum = 0;
    let term = 1 / (SQRT_PI * gamma(nu + 1.5));
    sum = term;

    for (let k = 1; k <= 100; k++) {
        term *= halfx2 / (k * (k + nu + 0.5));
        sum += term;

        if (Math.abs(term) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return prefactor * sum;
}
```

### Asymptotic Expansion (Large x)

**For ν = 0:**
```
H_0(x) ≈ Y_0(x) + 2/π · [1 - 9/(2·8²x²) + 9·25/(2·4·8⁴x⁴) - ...]
```

**For ν = 1:**
```
H_1(x) ≈ Y_1(x) + 2/π · [1 - 15/(2·8²x²) + 15·35/(2·4·8⁴x⁴) - ...]
```

---

## 8. Polylogarithm: Li_s(z)

### Mathematical Background

**Definition:**
```
Li_s(z) = Σ_{k=1}^∞ z^k / k^s
```

**Special Cases:**
- Li_1(z) = -ln(1-z) (logarithm)
- Li_2(z) = dilogarithm (Spence's function)
- Li_0(z) = z/(1-z)

**Domain:**
- |z| < 1: Series converges rapidly
- |z| ≥ 1: Requires analytic continuation

### Algorithm for Li_2(z) - Dilogarithm

**Series Expansion (|z| < 1):**
```
Li_2(z) = Σ_{k=1}^∞ z^k / k²
```

**Functional Equations:**
```
Li_2(z) + Li_2(1-z) = π²/6 - ln(z)·ln(1-z)
Li_2(-z) = -Li_2(z/(1+z)) - ln²(1+z)/2
Li_2(1/z) = -Li_2(z) - π²/6 - ln²(-z)/2
```

**Pseudocode:**
```typescript
function dilog(z: number): number {
    const PI2_6 = Math.PI * Math.PI / 6;  // π²/6 ≈ 1.644934066848226

    // Handle special values
    if (z === 0) return 0;
    if (z === 1) return PI2_6;
    if (z === -1) return -PI2_6 / 2;

    // Transform to |z| < 1 using functional equations
    let result = 0;
    let w = z;

    if (Math.abs(z) > 1) {
        // Use inversion formula
        w = 1 / z;
        const ln_neg_z = Math.log(-z);
        result = -PI2_6 - 0.5 * ln_neg_z * ln_neg_z;
    } else if (z > 0.5) {
        // Use duplication formula
        w = 1 - z;
        const ln_z = Math.log(z);
        const ln_1_minus_z = Math.log(1 - z);
        result = PI2_6 - ln_z * ln_1_minus_z;
    } else if (z < -1) {
        // Use transformation for z < -1
        w = z / (1 + z);
        const ln_1_plus_z = Math.log(1 + z);
        result = -0.5 * ln_1_plus_z * ln_1_plus_z;
    }

    // Series expansion for |w| < 0.5
    let sum = w;
    let term = w;
    const w2 = w * w;

    for (let k = 2; k <= 100; k++) {
        term *= w;
        const add = term / (k * k);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return result + sum;
}
```

### General Polylogarithm Li_s(z)

**For integer s ≥ 2:**

**Pseudocode:**
```typescript
function polylog(s: number, z: number): number {
    if (s === 1) {
        return -Math.log(1 - z);
    }

    if (Math.abs(z) >= 1) {
        throw new Error("polylog: |z| must be < 1 for general s");
    }

    // Series expansion
    let sum = z;
    let term = z;

    for (let k = 2; k <= 200; k++) {
        term *= z;
        const add = term / Math.pow(k, s);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum;
}
```

**Accelerated Series (Cohen et al.):**

For better convergence at z near 1:
```
Li_s(z) = Γ(1-s)·(-ln(1-z))^{s-1} + Σ_{k=0}^∞ ζ(s-k)·ln^k(1-z) / k!
```

---

## 9. Dawson Function: D(x) = exp(-x²)·∫_0^x exp(t²) dt

### Mathematical Background

**Definition:**
```
D(x) = e^{-x²} ∫_0^x e^{t²} dt
```

**Key Properties:**
- D(0) = 0
- D(-x) = -D(x) (odd function)
- D(x) ~ 1/(2x) as x → ∞
- Maximum at x ≈ 0.9241, D_max ≈ 0.5410

### Algorithm Selection

```
if |x| < 3.5:
    Use Taylor series
else:
    Use Rybicki's algorithm (continued fraction)
```

### Taylor Series (Small x)

**Formula:**
```
D(x) = x · Σ_{n=0}^∞ (2x²)^n / (1·3·5···(2n+1))
     = x · [1 + 2x²/3 + 4x⁴/15 + 8x⁶/105 + ...]
```

**Pseudocode:**
```typescript
function dawson_series(x: number): number {
    const x2 = x * x;
    let sum = 1;
    let term = 1;

    for (let n = 1; n <= 50; n++) {
        term *= 2 * x2 / (2 * n + 1);
        sum += term;

        if (Math.abs(term) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return x * sum;
}
```

### Rybicki's Algorithm (Large x)

**Based on continued fraction:**
```
D(x) = 1/(2x + a₁/(1 + a₂/(2x + a₃/(1 + a₄/(2x + ...)))))

where a_k = k/2
```

**Pseudocode:**
```typescript
function dawson_rybicki(x: number): number {
    const h = 0.2;  // Step size
    const n = Math.floor(6.5 / h);  // Number of terms

    // Initialize
    let d1 = 0;
    let d2 = 0;
    let e1 = 0;
    let e2 = 0;

    const x0 = x / h;
    const i0 = Math.floor(x0);
    const r = x0 - i0;

    // Rybicki recursion
    for (let i = n; i >= 1; i--) {
        const y = (i * h);
        const exp_y2 = Math.exp(-(y * y));

        if (i === i0 + 1) {
            e1 = exp_y2;
        }
        if (i === i0) {
            e2 = exp_y2;
        }

        const d = 2 * (i - i0) - r;
        const temp = (d1 + exp_y2) / d;
        d1 = d2;
        d2 = temp;
    }

    // Interpolate
    const dawson_i0 = h * d2 * Math.exp(-(i0 * h) * (i0 * h));
    const dawson_i0_plus_1 = h * d1 * Math.exp(-((i0 + 1) * h) * ((i0 + 1) * h));

    return dawson_i0 * (1 - r) + dawson_i0_plus_1 * r;
}

function dawson(x: number): number {
    const abs_x = Math.abs(x);

    if (abs_x < 3.5) {
        return dawson_series(x);
    } else {
        const result = dawson_rybicki(abs_x);
        return x >= 0 ? result : -result;
    }
}
```

### Alternative: Asymptotic Expansion (x → ∞)

**Formula:**
```
D(x) ≈ 1/(2x) · [1 + 1/(2x²) + 1·3/(2x²)² + 1·3·5/(2x²)³ + ...]
```

**Pseudocode:**
```typescript
function dawson_asymptotic(x: number): number {
    const x2 = x * x;
    const inv_2x2 = 1 / (2 * x2);

    let sum = 1;
    let term = 1;

    for (let n = 1; n <= 20; n++) {
        term *= (2 * n - 1) * inv_2x2;
        sum += term;

        if (Math.abs(term) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum / (2 * x);
}
```

---

## 10. Owen's T Function: T(h, a)

### Mathematical Background

**Definition:**
```
T(h, a) = 1/(2π) ∫_0^a exp(-h²(1+x²)/2) / (1+x²) dx
```

**Application:** Bivariate normal distribution:
```
P(X > h, Y > ah·X) = Φ(-h) - T(h, a)
```

where Φ is the standard normal CDF.

**Key Properties:**
- T(h, 0) = 0
- T(0, a) = arctan(a) / (2π)
- T(h, 1) = [Φ(h) - Φ(h/√2)] / 2
- T(h, ∞) = Φ(-h) / 2

### Algorithm Selection

```
if a === 0:
    return 0
elif h === 0:
    return atan(a) / (2π)
elif |ah| < 0.3:
    Use series expansion in ah
elif a ≤ 1:
    Use series expansion in h
else:
    Use series expansion in 1/a
```

### Series Expansion for Small ah

**Formula (ah < 0.3):**
```
T(h, a) ≈ 1/(2π) · Σ_{k=0}^∞ (-1)^k·a^{2k+1}·S_k(h) / (2k+1)

where:
S_k(h) = ∫_0^∞ x^{2k}·exp(-h²x²/2) dx
       = (2k-1)!! · √(π/2) / h^{2k+1}
```

**Pseudocode:**
```typescript
function owenT_small_ah(h: number, a: number): number {
    const TWO_PI = 2 * Math.PI;
    const SQRT_PI_2 = Math.sqrt(Math.PI / 2);

    const h2 = h * h;
    const a2 = a * a;

    let sum = 0;
    let term = a * SQRT_PI_2 / h;
    sum = term;

    let double_factorial = 1;
    let h_power = h;

    for (let k = 1; k <= 30; k++) {
        double_factorial *= (2 * k - 1);
        h_power *= h2;
        term *= -a2;

        const S_k = double_factorial * SQRT_PI_2 / h_power;
        const add = term * S_k / (2 * k + 1);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum / TWO_PI;
}
```

### Series Expansion for a ≤ 1

**Formula:**
```
T(h, a) = 1/(2π) · Σ_{j=0}^∞ a^{2j+1}·exp(-h²·j) / [(2j+1)·(1 + a²)^{j+1}]
```

**Pseudocode:**
```typescript
function owenT_series_a(h: number, a: number): number {
    const TWO_PI = 2 * Math.PI;
    const h2 = h * h;
    const a2 = a * a;
    const factor = 1 / (1 + a2);

    let sum = a;
    let term = a;
    let exp_term = 1;

    for (let j = 1; j <= 50; j++) {
        exp_term *= Math.exp(-h2);
        term *= a2 * factor;
        const add = term * exp_term / (2 * j + 1);
        sum += add;

        if (Math.abs(add) < 1e-16 * Math.abs(sum)) {
            break;
        }
    }

    return sum * factor / TWO_PI;
}
```

### Series Expansion for a > 1

**Formula (using complementary form):**
```
T(h, a) = [arctan(a) - arctan(a·Φ(h))] / (2π) - T(ah, 1/a)
```

where recursion terminates when 1/a ≤ 1.

**Pseudocode:**
```typescript
function owenT(h: number, a: number): number {
    const TWO_PI = 2 * Math.PI;

    // Handle special cases
    if (a === 0) return 0;
    if (h === 0) return Math.atan(a) / TWO_PI;

    const abs_h = Math.abs(h);
    const abs_a = Math.abs(a);

    // Exploit symmetries
    let sign = 1;
    if (h < 0) {
        h = abs_h;
        sign = -sign;
    }
    if (a < 0) {
        a = abs_a;
        sign = -sign;
    }

    let result: number;

    if (abs_a * abs_h < 0.3) {
        result = owenT_small_ah(h, a);
    } else if (a <= 1) {
        result = owenT_series_a(h, a);
    } else {
        // Use complementary formula
        const phi_h = 0.5 * (1 + erf(h / Math.SQRT2));
        const atan_a = Math.atan(a);
        const atan_a_phi = Math.atan(a * phi_h);

        result = (atan_a - atan_a_phi) / TWO_PI - owenT(a * h, 1 / a);
    }

    return sign * result;
}
```

### High-Precision Coefficients (Patefield & Tandy Method)

For maximum accuracy, use rational approximations:

**Region 1** (0 ≤ h ≤ 0.5, 0 ≤ a ≤ 1):
```
T(h, a) ≈ a · (p₀ + p₁h² + p₂h⁴) / (q₀ + q₁h² + q₂h⁴)
```

**Coefficients:**
```
p₀ = 9.999999999999999e-01
p₁ = -1.111111111111111e-01
p₂ =  1.388888888888889e-02

q₀ = 6.000000000000000e+00
q₁ = 1.000000000000000e+00
q₂ = 1.666666666666667e-01
```

---

## Performance Considerations

### WASM Acceleration Opportunities

**High Priority:**
1. **Error function inverses** - Iterative refinement in tight loops
2. **Dawson function** - Rybicki's algorithm with many steps
3. **Owen's T** - Nested series evaluations
4. **Polylogarithm** - Deep series for convergence

**Medium Priority:**
5. **Fresnel integrals** - Series and auxiliary functions
6. **Sine/Cosine integrals** - Polynomial evaluations
7. **Struve functions** - Gamma function calls

### Numerical Stability

**Critical Issues:**
1. **erfc(x) for large x**: Must use asymptotic to avoid cancellation
2. **Lambert W near branch point**: Careful initial approximation
3. **Owen's T**: Multiple domains require different methods
4. **Digamma for small x**: Recurrence before asymptotic

### Error Bounds

**Target Accuracy:** ε < 10⁻¹⁴ (IEEE-754 double precision)

**Known Bounds:**
- **erfc rational approx**: max error 1.3×10⁻¹⁷
- **erfinv**: < 2×10⁻¹⁶ after Halley refinement
- **Lambert W**: < 10⁻¹⁵ after 3 Halley iterations
- **Dawson series**: < 10⁻¹⁶ for |x| < 3.5
- **Owen's T**: < 10⁻¹⁴ with adaptive method selection

---

## Testing Strategy

### Test Coverage

1. **Special values**: 0, ±1, ±∞, branch points
2. **Domain boundaries**: Transitions between algorithms
3. **Accuracy**: Compare against high-precision references (MPFR, Mathematica)
4. **Symmetries**: Verify reflection formulas, odd/even properties
5. **Recurrence**: Test mathematical relations between functions

### Reference Implementations

- **SciPy**: `scipy.special` module
- **Boost Math**: C++ special functions library
- **GNU Scientific Library (GSL)**: `gsl_sf_*` functions
- **MPFR**: Arbitrary precision for validation

### Benchmark Suite

```typescript
const benchmarks = [
    { name: 'erfc', args: [2.5], expect: 0.00040695201744495897 },
    { name: 'erfinv', args: [0.5], expect: 0.4769362762044698733814 },
    { name: 'digamma', args: [5.0], expect: 1.5061176684318 },
    { name: 'lambertW', args: [1.0], expect: 0.5671432904097838730 },
    { name: 'Ei', args: [1.0], expect: 1.8951178163559367555 },
    { name: 'fresnelS', args: [1.0], expect: 0.4382591473903547660 },
    { name: 'Si', args: [Math.PI], expect: 1.8519370519824662 },
    { name: 'dawson', args: [1.0], expect: 0.5380795069127684691 },
    { name: 'owenT', args: [1.0, 0.5], expect: 0.0430306399184761 }
];
```

---

## References

### Primary Sources

1. **Abramowitz & Stegun** - *Handbook of Mathematical Functions* (1964)
   - Chapters 5 (Exponential Integrals), 7 (Error Functions), 13 (Confluent Hypergeometric)

2. **NIST Digital Library of Mathematical Functions** - https://dlmf.nist.gov
   - Sections 7 (Error Functions), 8 (Incomplete Gamma), 25 (Zeta)

3. **Cody, W.J.** - *Rational Chebyshev Approximations for the Error Function* (1969)
   - Mathematics of Computation, Vol. 23, pp. 631-637

4. **Corless et al.** - *On the Lambert W Function* (1996)
   - Advances in Computational Mathematics, Vol. 5, pp. 329-359

5. **Patefield & Tandy** - *Fast and Accurate Calculation of Owen's T Function* (2000)
   - Journal of Statistical Software, Vol. 5, Issue 5

### Numerical Algorithms

6. **Press et al.** - *Numerical Recipes* (3rd Edition, 2007)
   - Chapter 6: Special Functions

7. **Boost Math Toolkit Documentation**
   - https://www.boost.org/doc/libs/1_78_0/libs/math/doc/html/special.html

8. **Moshier, S.L.** - *Cephes Mathematical Library*
   - http://www.netlib.org/cephes/

9. **Rybicki, G.B.** - *Dawson's Integral and the Sampling Theorem* (1989)
   - Computers in Physics, Vol. 3, pp. 85-87

10. **Cohen, H. et al.** - *Numerical Algorithms for Polylogarithms* (2000)
    - Journal of Symbolic Computation, Vol. 30, pp. 123-145

---

## Implementation Checklist

### Phase 14 Tasks

- [ ] **Task 1**: Implement erfc, erfinv, erfcinv with rational approximations
- [ ] **Task 2**: Implement digamma, trigamma, polygamma with asymptotic series
- [ ] **Task 3**: Implement Lambert W (both branches) with Halley iteration
- [ ] **Task 4**: Implement E_n(x), Ei(x), li(x) with continued fractions
- [ ] **Task 5**: Implement Fresnel S(x), C(x) with auxiliary functions
- [ ] **Task 6**: Implement Si(x), Ci(x), Shi(x), Chi(x) with series/asymptotic
- [ ] **Task 7**: Implement Struve H_n(x), L_n(x) with power series
- [ ] **Task 8**: Implement polylogarithm Li_s(z) with functional equations
- [ ] **Task 9**: Implement Dawson function D(x) with Rybicki's algorithm
- [ ] **Task 10**: Implement Owen's T(h,a) with adaptive method selection

### Integration Requirements

- [ ] TypeScript type definitions in `types/index.d.ts`
- [ ] Factory functions in `src/factoriesAny.js`
- [ ] Embedded documentation for expression parser
- [ ] Unit tests with accuracy validation
- [ ] WASM implementations for performance-critical functions
- [ ] Benchmark comparisons with SciPy/Boost

---

**Document Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** Ready for Implementation
