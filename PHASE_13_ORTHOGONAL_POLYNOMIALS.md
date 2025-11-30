# Phase 13: Orthogonal Polynomials - Detailed Implementation Guide

**Status**: Planning Phase
**Priority**: High (Critical for numerical integration, approximation theory, quantum mechanics)
**Estimated Effort**: 8-10 weeks
**Dependencies**: Phase 2 (arithmetic), Phase 5 (special functions), Phase 10 (linear algebra eigenvalue solvers)

## Overview

Orthogonal polynomials form a cornerstone of numerical analysis, appearing in:
- **Numerical Integration**: Gaussian quadrature rules
- **Approximation Theory**: Function approximation, polynomial interpolation
- **Quantum Mechanics**: Wave functions, angular momentum
- **Signal Processing**: Filter design, spectral methods
- **PDEs**: Spectral methods, finite element basis functions

This phase implements eight families of classical orthogonal polynomials with:
- Efficient recurrence-based evaluation (O(n) time)
- Accurate normalization and weight functions
- Associated/generalized variants
- Quadrature node/weight generation via eigenvalue methods

---

## Mathematical Foundation

### Orthogonality Relation

Polynomials {φ₀, φ₁, φ₂, ...} are orthogonal with respect to weight function w(x) on interval [a,b] if:

```
∫ₐᵇ φₘ(x) φₙ(x) w(x) dx = hₙ δₘₙ
```

where:
- δₘₙ = Kronecker delta (1 if m=n, 0 otherwise)
- hₙ = normalization constant (squared norm)

**Orthonormal**: hₙ = 1 for all n

### Three-Term Recurrence Relation

All classical orthogonal polynomials satisfy:

```
φₙ₊₁(x) = (Aₙx + Bₙ)φₙ(x) - Cₙφₙ₋₁(x)
```

with initial conditions φ₋₁(x) = 0, φ₀(x) = constant.

This allows O(n) evaluation and is numerically stable.

---

## Task 1: Legendre Polynomials

### Mathematical Definition

**Standard Form**: Solutions to Legendre's differential equation
```
(1 - x²)y'' - 2xy' + n(n+1)y = 0
```

**Rodrigues' Formula**:
```
Pₙ(x) = (1/(2ⁿ n!)) dⁿ/dxⁿ [(x² - 1)ⁿ]
```

### Orthogonality Relation

**Weight Function**: w(x) = 1
**Interval**: [-1, 1]

```
∫₋₁¹ Pₘ(x) Pₙ(x) dx = (2/(2n+1)) δₘₙ
```

**Normalization**: Pₙ(1) = 1, Pₙ(-1) = (-1)ⁿ

### Three-Term Recurrence

```
(n+1) Pₙ₊₁(x) = (2n+1) x Pₙ(x) - n Pₙ₋₁(x)

Initial conditions:
P₀(x) = 1
P₁(x) = x
```

### Associated Legendre Polynomials

**Definition**: For 0 ≤ m ≤ l
```
Pₗᵐ(x) = (-1)ᵐ (1 - x²)^(m/2) dᵐ/dxᵐ [Pₗ(x)]
```

**Recurrence** (for fixed m, varying l):
```
(l - m + 1) Pₗ₊₁ᵐ(x) = (2l+1) x Pₗᵐ(x) - (l + m) Pₗ₋₁ᵐ(x)

Starting values (for fixed m):
Pₘᵐ(x) = (-1)ᵐ (2m-1)!! (1 - x²)^(m/2)
Pₘ₊₁ᵐ(x) = x (2m+1) Pₘᵐ(x)
```

**Double Factorial**: (2m-1)!! = 1·3·5···(2m-1)

### Pseudocode

```typescript
function legendreP(n: number, x: number): number {
  if (n === 0) return 1.0;
  if (n === 1) return x;

  let P_prev = 1.0;  // P₀
  let P_curr = x;     // P₁

  for (let k = 1; k < n; k++) {
    const P_next = ((2*k + 1) * x * P_curr - k * P_prev) / (k + 1);
    P_prev = P_curr;
    P_curr = P_next;
  }

  return P_curr;
}

function associatedLegendreP(l: number, m: number, x: number): number {
  // Validate inputs
  if (m < 0 || m > l) throw new Error("Invalid m: must have 0 ≤ m ≤ l");
  if (Math.abs(x) > 1) throw new Error("Invalid x: must have |x| ≤ 1");

  // Compute starting values P_m^m(x)
  let P_mm = 1.0;
  if (m > 0) {
    const somx2 = Math.sqrt((1 - x) * (1 + x)); // sqrt(1 - x²)
    let fact = 1.0;
    for (let i = 1; i <= m; i++) {
      P_mm *= -fact * somx2;
      fact += 2.0;
    }
  }

  if (l === m) return P_mm;

  // Compute P_{m+1}^m(x)
  let P_mp1m = x * (2 * m + 1) * P_mm;

  if (l === m + 1) return P_mp1m;

  // Use recurrence for l > m+1
  let P_lm = 0.0;
  for (let ll = m + 2; ll <= l; ll++) {
    P_lm = (x * (2*ll - 1) * P_mp1m - (ll + m - 1) * P_mm) / (ll - m);
    P_mm = P_mp1m;
    P_mp1m = P_lm;
  }

  return P_lm;
}
```

### WASM Optimization Strategy

- **Vectorization**: Evaluate multiple n values simultaneously
- **Cache-friendly**: Store coefficients for batch evaluation
- **SIMD**: Use f64x2 for parallel recurrence iterations

### Test Cases

```typescript
// Standard Legendre
P₀(x) = 1
P₁(x) = x
P₂(x) = (3x² - 1)/2
P₃(x) = (5x³ - 3x)/2
P₄(x) = (35x⁴ - 30x² + 3)/8

// Properties
P₃(1) = 1
P₃(-1) = -1
P₄(0) = 3/8

// Associated Legendre
P₂¹(x) = -3x√(1-x²)
P₂²(x) = 3(1-x²)
```

---

## Task 2: Hermite Polynomials

### Two Conventions

**Physicist's Hermite** Hₙ(x):
- Weight: w(x) = exp(-x²)
- Orthogonality on (-∞, ∞)

**Probabilist's Hermite** Heₙ(x):
- Weight: w(x) = exp(-x²/2) / √(2π)
- Orthogonality on (-∞, ∞)
- Relation: Heₙ(x) = 2^(-n/2) Hₙ(x/√2)

### Physicist's Hermite Polynomials

**Differential Equation**:
```
y'' - 2xy' + 2ny = 0
```

**Rodrigues' Formula**:
```
Hₙ(x) = (-1)ⁿ exp(x²) dⁿ/dxⁿ [exp(-x²)]
```

### Orthogonality Relation

```
∫₋∞^∞ Hₘ(x) Hₙ(x) exp(-x²) dx = √π 2ⁿ n! δₘₙ
```

### Three-Term Recurrence

```
Hₙ₊₁(x) = 2x Hₙ(x) - 2n Hₙ₋₁(x)

Initial conditions:
H₀(x) = 1
H₁(x) = 2x
```

### Probabilist's Hermite Polynomials

**Orthogonality**:
```
∫₋∞^∞ Heₘ(x) Heₙ(x) exp(-x²/2)/√(2π) dx = n! δₘₙ
```

**Recurrence**:
```
Heₙ₊₁(x) = x Heₙ(x) - n Heₙ₋₁(x)

Initial conditions:
He₀(x) = 1
He₁(x) = x
```

### Pseudocode

```typescript
function hermitePhysicist(n: number, x: number): number {
  if (n === 0) return 1.0;
  if (n === 1) return 2.0 * x;

  let H_prev = 1.0;      // H₀
  let H_curr = 2.0 * x;  // H₁

  for (let k = 1; k < n; k++) {
    const H_next = 2.0 * x * H_curr - 2.0 * k * H_prev;
    H_prev = H_curr;
    H_curr = H_next;
  }

  return H_curr;
}

function hermiteProbabilist(n: number, x: number): number {
  if (n === 0) return 1.0;
  if (n === 1) return x;

  let He_prev = 1.0;  // He₀
  let He_curr = x;    // He₁

  for (let k = 1; k < n; k++) {
    const He_next = x * He_curr - k * He_prev;
    He_prev = He_curr;
    He_curr = He_next;
  }

  return He_curr;
}

// Normalized Hermite for quantum harmonic oscillator
function hermiteNormalized(n: number, x: number): number {
  const Hn = hermitePhysicist(n, x);
  const normalization = 1.0 / Math.sqrt(Math.pow(2, n) * factorial(n) * Math.sqrt(Math.PI));
  return normalization * Math.exp(-x * x / 2.0) * Hn;
}
```

### Applications

**Quantum Harmonic Oscillator**: Wave functions
```
ψₙ(x) = (1/√(2ⁿ n! √π)) exp(-x²/2) Hₙ(x)
```

**Probability Theory**: Moments of normal distribution
```
E[Xⁿ] related to Heₙ(x)
```

### Test Cases

```typescript
// Physicist's Hermite
H₀(x) = 1
H₁(x) = 2x
H₂(x) = 4x² - 2
H₃(x) = 8x³ - 12x
H₄(x) = 16x⁴ - 48x² + 12

// Probabilist's Hermite
He₀(x) = 1
He₁(x) = x
He₂(x) = x² - 1
He₃(x) = x³ - 3x
He₄(x) = x⁴ - 6x² + 3
```

---

## Task 3: Laguerre Polynomials

### Mathematical Definition

**Standard Laguerre**: Solutions to
```
xy'' + (1 - x)y' + ny = 0
```

**Rodrigues' Formula**:
```
Lₙ(x) = (exp(x)/n!) dⁿ/dxⁿ [xⁿ exp(-x)]
```

### Orthogonality Relation

**Weight Function**: w(x) = exp(-x)
**Interval**: [0, ∞)

```
∫₀^∞ Lₘ(x) Lₙ(x) exp(-x) dx = δₘₙ
```

### Three-Term Recurrence

```
(n+1) Lₙ₊₁(x) = (2n + 1 - x) Lₙ(x) - n Lₙ₋₁(x)

Initial conditions:
L₀(x) = 1
L₁(x) = 1 - x
```

### Associated (Generalized) Laguerre Polynomials

**Definition**: Lₙ^α(x) with parameter α > -1
```
Differential equation:
x y'' + (α + 1 - x) y' + n y = 0
```

**Orthogonality**:
```
∫₀^∞ Lₘ^α(x) Lₙ^α(x) x^α exp(-x) dx = Γ(n + α + 1) / n! δₘₙ
```

**Recurrence**:
```
(n+1) Lₙ₊₁^α(x) = (2n + α + 1 - x) Lₙ^α(x) - (n + α) Lₙ₋₁^α(x)

Initial conditions:
L₀^α(x) = 1
L₁^α(x) = α + 1 - x
```

**Relation to Standard**: Lₙ(x) = Lₙ^0(x)

### Pseudocode

```typescript
function laguerreL(n: number, x: number): number {
  if (n === 0) return 1.0;
  if (n === 1) return 1.0 - x;

  let L_prev = 1.0;      // L₀
  let L_curr = 1.0 - x;  // L₁

  for (let k = 1; k < n; k++) {
    const L_next = ((2*k + 1 - x) * L_curr - k * L_prev) / (k + 1);
    L_prev = L_curr;
    L_curr = L_next;
  }

  return L_curr;
}

function associatedLaguerreL(n: number, alpha: number, x: number): number {
  if (alpha <= -1.0) throw new Error("alpha must be > -1");
  if (x < 0.0) throw new Error("x must be >= 0 for Laguerre polynomials");

  if (n === 0) return 1.0;
  if (n === 1) return alpha + 1.0 - x;

  let L_prev = 1.0;                    // L₀^α
  let L_curr = alpha + 1.0 - x;        // L₁^α

  for (let k = 1; k < n; k++) {
    const numerator = (2*k + alpha + 1 - x) * L_curr - (k + alpha) * L_prev;
    const L_next = numerator / (k + 1);
    L_prev = L_curr;
    L_curr = L_next;
  }

  return L_curr;
}
```

### Applications

**Quantum Mechanics**: Hydrogen atom radial wave functions
```
R_nl(r) ∝ r^l exp(-r/n) L_{n-l-1}^{2l+1}(2r/n)
```

**Mathematical Physics**: Heat equation, quantum field theory

### Test Cases

```typescript
// Standard Laguerre
L₀(x) = 1
L₁(x) = 1 - x
L₂(x) = (2 - 4x + x²)/2
L₃(x) = (6 - 18x + 9x² - x³)/6
L₄(x) = (24 - 96x + 72x² - 16x³ + x⁴)/24

// Associated Laguerre (α = 1)
L₀¹(x) = 1
L₁¹(x) = 2 - x
L₂¹(x) = (6 - 6x + x²)/2

// Hydrogen atom: n=2, l=1
L₀³(x) = 1  // for 2p orbital
```

---

## Task 4: Chebyshev Polynomials

### First Kind: Tₙ(x)

**Trigonometric Definition**:
```
Tₙ(cos θ) = cos(nθ)
```

**Differential Equation**:
```
(1 - x²) y'' - x y' + n² y = 0
```

### Orthogonality Relation (First Kind)

**Weight Function**: w(x) = 1/√(1 - x²)
**Interval**: [-1, 1]

```
∫₋₁¹ Tₘ(x) Tₙ(x) / √(1 - x²) dx = {
  π       if m = n = 0
  π/2     if m = n ≠ 0
  0       if m ≠ n
}
```

### Three-Term Recurrence (First Kind)

```
Tₙ₊₁(x) = 2x Tₙ(x) - Tₙ₋₁(x)

Initial conditions:
T₀(x) = 1
T₁(x) = x
```

### Second Kind: Uₙ(x)

**Trigonometric Definition**:
```
Uₙ(cos θ) = sin((n+1)θ) / sin(θ)
```

### Orthogonality Relation (Second Kind)

**Weight Function**: w(x) = √(1 - x²)
**Interval**: [-1, 1]

```
∫₋₁¹ Uₘ(x) Uₙ(x) √(1 - x²) dx = (π/2) δₘₙ
```

### Three-Term Recurrence (Second Kind)

```
Uₙ₊₁(x) = 2x Uₙ(x) - Uₙ₋₁(x)

Initial conditions:
U₀(x) = 1
U₁(x) = 2x
```

### Relations Between T and U

```
Uₙ₋₁(x) = (1/n) dTₙ/dx
Tₙ(x) = Uₙ(x) - x Uₙ₋₁(x)
(1 - x²) Uₙ₋₁(x) = x Tₙ(x) - Tₙ₊₁(x)
```

### Pseudocode

```typescript
function chebyshevT(n: number, x: number): number {
  // For |x| > 1, use trigonometric form for numerical stability
  if (Math.abs(x) > 1.0) {
    if (x > 0) {
      return Math.cosh(n * Math.acosh(x));
    } else {
      const val = Math.cosh(n * Math.acosh(-x));
      return (n % 2 === 0) ? val : -val;
    }
  }

  if (n === 0) return 1.0;
  if (n === 1) return x;

  let T_prev = 1.0;  // T₀
  let T_curr = x;    // T₁

  for (let k = 1; k < n; k++) {
    const T_next = 2.0 * x * T_curr - T_prev;
    T_prev = T_curr;
    T_curr = T_next;
  }

  return T_curr;
}

function chebyshevU(n: number, x: number): number {
  // For |x| > 1, use hyperbolic form
  if (Math.abs(x) > 1.0) {
    const acosh_x = Math.acosh(Math.abs(x));
    const val = Math.sinh((n + 1) * acosh_x) / Math.sinh(acosh_x);
    return (x < 0 && n % 2 === 1) ? -val : val;
  }

  if (n === 0) return 1.0;
  if (n === 1) return 2.0 * x;

  let U_prev = 1.0;      // U₀
  let U_curr = 2.0 * x;  // U₁

  for (let k = 1; k < n; k++) {
    const U_next = 2.0 * x * U_curr - U_prev;
    U_prev = U_curr;
    U_curr = U_next;
  }

  return U_curr;
}

// Efficient evaluation at Chebyshev nodes
function chebyshevNodes(n: number): number[] {
  const nodes = new Array(n);
  for (let k = 0; k < n; k++) {
    nodes[k] = Math.cos(Math.PI * (2*k + 1) / (2*n));
  }
  return nodes;
}
```

### Properties

**Extrema of Tₙ(x)**:
```
x_k = cos(πk/n),  k = 0, 1, ..., n
Tₙ(x_k) = (-1)^k
```

**Zeros of Tₙ(x)**:
```
x_k = cos((2k + 1)π / (2n)),  k = 0, 1, ..., n-1
```

**Minimax Property**: Among all monic polynomials of degree n, 2^(1-n) Tₙ(x) has smallest maximum absolute value on [-1,1].

### Applications

- **Approximation Theory**: Chebyshev series, economization of power series
- **Spectral Methods**: Chebyshev collocation for PDEs
- **Numerical Integration**: Clenshaw-Curtis quadrature
- **Filter Design**: Optimal filters with equal ripple

### Test Cases

```typescript
// First kind
T₀(x) = 1
T₁(x) = x
T₂(x) = 2x² - 1
T₃(x) = 4x³ - 3x
T₄(x) = 8x⁴ - 8x² + 1

// Second kind
U₀(x) = 1
U₁(x) = 2x
U₂(x) = 4x² - 1
U₃(x) = 8x³ - 4x
U₄(x) = 16x⁴ - 12x² + 1

// Properties
T₄(cos(π/4)) = cos(π) = -1
U₃(1/2) = sin(4·π/3) / sin(π/3) = -√3/(√3/2) = -2
```

---

## Task 5: Jacobi Polynomials

### Mathematical Definition

**Differential Equation**:
```
(1 - x²) y'' + [β - α - (α + β + 2)x] y' + n(n + α + β + 1) y = 0
```

**Parameters**: α, β > -1

**Rodrigues' Formula**:
```
Pₙ^(α,β)(x) = ((-1)ⁿ / (2ⁿ n!)) (1-x)^(-α) (1+x)^(-β) dⁿ/dxⁿ [(1-x)^(n+α) (1+x)^(n+β)]
```

### Orthogonality Relation

**Weight Function**: w(x) = (1-x)^α (1+x)^β
**Interval**: [-1, 1]

```
∫₋₁¹ Pₘ^(α,β)(x) Pₙ^(α,β)(x) (1-x)^α (1+x)^β dx = hₙ δₘₙ

where:
hₙ = (2^(α+β+1) / (2n + α + β + 1)) · [Γ(n+α+1) Γ(n+β+1)] / [n! Γ(n+α+β+1)]
```

### Three-Term Recurrence

```
2(n+1)(n+α+β+1)(2n+α+β) Pₙ₊₁^(α,β)(x) =
  (2n+α+β+1)[(2n+α+β)(2n+α+β+2)x + α²-β²] Pₙ^(α,β)(x)
  - 2(n+α)(n+β)(2n+α+β+2) Pₙ₋₁^(α,β)(x)

Initial conditions:
P₀^(α,β)(x) = 1
P₁^(α,β)(x) = (α+β+2)x/2 + (α-β)/2
```

### Normalized Form

Often use normalized version:
```
P̃ₙ^(α,β)(x) = Pₙ^(α,β)(x) / Pₙ^(α,β)(1)

where:
Pₙ^(α,β)(1) = Γ(n+α+1) / [n! Γ(α+1)] = (n+α choose n)
```

### Pseudocode

```typescript
interface JacobiParams {
  alpha: number;  // > -1
  beta: number;   // > -1
}

function jacobiP(n: number, params: JacobiParams, x: number): number {
  const { alpha, beta } = params;

  if (alpha <= -1.0 || beta <= -1.0) {
    throw new Error("Jacobi parameters must be > -1");
  }
  if (Math.abs(x) > 1.0) {
    throw new Error("x must be in [-1, 1]");
  }

  if (n === 0) return 1.0;

  // P₁^(α,β)(x)
  if (n === 1) {
    return ((alpha + beta + 2.0) * x + (alpha - beta)) / 2.0;
  }

  let P_prev = 1.0;
  let P_curr = ((alpha + beta + 2.0) * x + (alpha - beta)) / 2.0;

  for (let k = 1; k < n; k++) {
    const a1 = 2 * (k + 1) * (k + alpha + beta + 1) * (2*k + alpha + beta);
    const a2 = (2*k + alpha + beta + 1);
    const a3 = (2*k + alpha + beta) * (2*k + alpha + beta + 2);
    const a4 = alpha * alpha - beta * beta;
    const a5 = 2 * (k + alpha) * (k + beta) * (2*k + alpha + beta + 2);

    const P_next = (a2 * (a3 * x + a4) * P_curr - a5 * P_prev) / a1;

    P_prev = P_curr;
    P_curr = P_next;
  }

  return P_curr;
}

// Compute normalization constant P_n^(α,β)(1)
function jacobiNormalization(n: number, params: JacobiParams): number {
  const { alpha } = params;

  // P_n^(α,β)(1) = Γ(n+α+1) / [n! Γ(α+1)]
  // For integer n, use binomial coefficient
  let result = 1.0;
  for (let k = 1; k <= n; k++) {
    result *= (k + alpha) / k;
  }

  return result;
}
```

### Special Cases

**Legendre**: α = β = 0
```
Pₙ(x) = Pₙ^(0,0)(x)
```

**Chebyshev (First Kind)**: α = β = -1/2
```
Tₙ(x) = (n! / (2n)!) √π Γ(n+1/2) Pₙ^(-1/2,-1/2)(x)
```

**Chebyshev (Second Kind)**: α = β = 1/2
```
Uₙ(x) = (n+1) Pₙ^(1/2,1/2)(x)
```

**Gegenbauer**: α = β = λ - 1/2
```
Cₙ^λ(x) ∝ Pₙ^(λ-1/2,λ-1/2)(x)
```

### Applications

- **Approximation on Weighted Intervals**: Custom weight functions
- **Gauss-Jacobi Quadrature**: Numerical integration with weights
- **Orthogonal Polynomials Theory**: General framework

### Test Cases

```typescript
// α = 0, β = 0 (Legendre)
P₀^(0,0)(x) = 1
P₁^(0,0)(x) = x
P₂^(0,0)(x) = (3x² - 1)/2

// α = 1, β = 0
P₀^(1,0)(x) = 1
P₁^(1,0)(x) = (3x + 1)/2
P₂^(1,0)(x) = (15x² + 10x - 1)/8

// α = 1/2, β = 1/2 (Chebyshev U)
P₁^(1/2,1/2)(x) = 2x
P₂^(1/2,1/2)(x) = (4x² - 1)/3
```

---

## Task 6: Gegenbauer (Ultraspherical) Polynomials

### Mathematical Definition

**Differential Equation**:
```
(1 - x²) y'' - (2λ + 1)x y' + n(n + 2λ) y = 0
```

**Parameter**: λ > -1/2 (except λ = 0 requires special handling)

**Relation to Jacobi**:
```
Cₙ^λ(x) = (Γ(λ + 1/2) Γ(n + 2λ)) / (Γ(2λ) Γ(n + λ + 1/2)) · Pₙ^(λ-1/2,λ-1/2)(x)
```

### Orthogonality Relation

**Weight Function**: w(x) = (1 - x²)^(λ - 1/2)
**Interval**: [-1, 1]

```
∫₋₁¹ Cₘ^λ(x) Cₙ^λ(x) (1 - x²)^(λ - 1/2) dx = hₙ δₘₙ

where:
hₙ = (π 2^(1-2λ) Γ(n + 2λ)) / (n! (n + λ) Γ²(λ))  for λ > 0
```

### Three-Term Recurrence

```
(n + 1) Cₙ₊₁^λ(x) = 2(n + λ) x Cₙ^λ(x) - (n + 2λ - 1) Cₙ₋₁^λ(x)

Initial conditions:
C₀^λ(x) = 1
C₁^λ(x) = 2λ x
```

### Normalized Form

**Convention**: Cₙ^λ(1) = (2λ)_n / n! where (a)_n = Pochhammer symbol

### Special Cases

**Legendre**: λ = 1/2
```
Pₙ(x) = Cₙ^(1/2)(x)
```

**Chebyshev (First Kind)**: λ → 0 (limit)
```
Tₙ(x) = lim_{λ→0} Cₙ^λ(x) / Cₙ^λ(1)
```

**Chebyshev (Second Kind)**: λ = 1
```
Uₙ(x) = Cₙ^1(x)
```

### Pseudocode

```typescript
function gegenbauerC(n: number, lambda: number, x: number): number {
  if (lambda <= -0.5 && lambda !== 0) {
    throw new Error("lambda must be > -1/2 or equal to 0");
  }
  if (Math.abs(x) > 1.0) {
    throw new Error("x must be in [-1, 1]");
  }

  // Special case: λ = 0 (Chebyshev T)
  if (Math.abs(lambda) < 1e-10) {
    return chebyshevT(n, x);
  }

  if (n === 0) return 1.0;
  if (n === 1) return 2.0 * lambda * x;

  let C_prev = 1.0;              // C₀^λ
  let C_curr = 2.0 * lambda * x; // C₁^λ

  for (let k = 1; k < n; k++) {
    const numerator = 2.0 * (k + lambda) * x * C_curr - (k + 2.0*lambda - 1.0) * C_prev;
    const C_next = numerator / (k + 1.0);
    C_prev = C_curr;
    C_curr = C_next;
  }

  return C_curr;
}

// Normalized form: C_n^λ(x) / C_n^λ(1)
function gegenbauerCNormalized(n: number, lambda: number, x: number): number {
  const C_n_x = gegenbauerC(n, lambda, x);
  const C_n_1 = gegenbauerC(n, lambda, 1.0);
  return C_n_x / C_n_1;
}

// Direct normalization constant: C_n^λ(1)
function gegenbauerNormalization(n: number, lambda: number): number {
  // C_n^λ(1) = Γ(n + 2λ) / [n! Γ(2λ)]
  //          = (2λ)_n / n!
  //          = 2λ(2λ+1)...(2λ+n-1) / n!

  if (n === 0) return 1.0;

  let result = 1.0;
  for (let k = 0; k < n; k++) {
    result *= (2.0 * lambda + k) / (k + 1.0);
  }

  return result;
}
```

### Applications

- **Harmonic Analysis**: Multidimensional harmonic analysis
- **Representation Theory**: Special functions on spheres
- **Physics**: Quantum mechanics, scattering theory

### Test Cases

```typescript
// λ = 1/2 (Legendre)
C₀^(1/2)(x) = 1
C₁^(1/2)(x) = x
C₂^(1/2)(x) = (3x² - 1)/2

// λ = 1 (Chebyshev U)
C₀^1(x) = 1
C₁^1(x) = 2x
C₂^1(x) = 4x² - 1
C₃^1(x) = 8x³ - 4x

// λ = 3/2
C₀^(3/2)(x) = 1
C₁^(3/2)(x) = 3x
C₂^(3/2)(x) = (15x² - 3)/2
```

---

## Task 7: Spherical Harmonics

### Mathematical Definition

**Complex Form**:
```
Yₗᵐ(θ, φ) = √[(2l+1)/(4π) · (l-m)!/(l+m)!] · Pₗᵐ(cos θ) · exp(imφ)
```

where:
- l = 0, 1, 2, ... (degree)
- m = -l, -l+1, ..., l-1, l (order)
- θ ∈ [0, π] (polar/colatitude angle)
- φ ∈ [0, 2π) (azimuthal angle)
- Pₗᵐ = associated Legendre polynomial

### Orthonormality

```
∫₀^π ∫₀^(2π) Yₗᵐ(θ,φ)* Yₗ'ᵐ'(θ,φ) sin θ dθ dφ = δₗₗ' δₘₘ'
```

where * denotes complex conjugate.

### Real Spherical Harmonics

**Definition**: Real-valued basis functions
```
Yₗₘ(θ, φ) = {
  √2 · Re(Yₗᵐ(θ,φ))           if m > 0
  Yₗ⁰(θ,φ)                     if m = 0
  √2 · Im(Yₗ⁻ᵐ(θ,φ))          if m < 0
}

Equivalently:
Yₗₘ(θ, φ) = {
  √2 Nₗᵐ Pₗᵐ(cos θ) cos(mφ)   if m > 0
  Nₗ⁰ Pₗ⁰(cos θ)               if m = 0
  √2 Nₗᵐ Pₗᵐ(cos θ) sin(mφ)   if m < 0 (use |m|)
}

where Nₗᵐ = √[(2l+1)/(4π) · (l-m)!/(l+m)!]
```

### Normalization Constants

**Complex Form**:
```
Nₗᵐ = √[(2l+1)/(4π) · (l-|m|)!/(l+|m|)!]
```

**Condon-Shortley Phase**: Included in associated Legendre definition
```
Pₗᵐ(x) includes factor (-1)ᵐ
```

### Recurrence Relations

**For fixed l, varying m** (not commonly used):
```
√[(l-m)(l+m+1)] Yₗᵐ⁺¹ = x Yₗᵐ - √[(l+m)(l-m+1)] / 2 · Yₗᵐ⁻¹
```

**Ladder operators**: Angular momentum algebra (used in quantum mechanics)

### Pseudocode

```typescript
interface SphericalCoords {
  theta: number;  // [0, π]
  phi: number;    // [0, 2π)
}

// Complex spherical harmonic
function sphericalHarmonicComplex(
  l: number,
  m: number,
  coords: SphericalCoords
): { real: number; imag: number } {
  if (l < 0) throw new Error("l must be >= 0");
  if (Math.abs(m) > l) throw new Error("|m| must be <= l");

  const { theta, phi } = coords;

  // Compute normalization
  const l_m_factorial = factorial(l - Math.abs(m));
  const l_p_m_factorial = factorial(l + Math.abs(m));
  const norm = Math.sqrt((2*l + 1) / (4 * Math.PI) * l_m_factorial / l_p_m_factorial);

  // Compute associated Legendre polynomial
  const P_lm = associatedLegendreP(l, Math.abs(m), Math.cos(theta));

  // Handle negative m
  const sign = (m < 0 && Math.abs(m) % 2 === 1) ? -1 : 1;
  const amplitude = norm * P_lm * sign;

  // Compute exp(i m φ) = cos(mφ) + i sin(mφ)
  const real_part = amplitude * Math.cos(m * phi);
  const imag_part = amplitude * Math.sin(m * phi);

  return { real: real_part, imag: imag_part };
}

// Real spherical harmonic
function sphericalHarmonicReal(
  l: number,
  m: number,
  coords: SphericalCoords
): number {
  if (l < 0) throw new Error("l must be >= 0");
  if (Math.abs(m) > l) throw new Error("|m| must be <= l");

  const { theta, phi } = coords;
  const abs_m = Math.abs(m);

  // Compute normalization
  const l_m_factorial = factorial(l - abs_m);
  const l_p_m_factorial = factorial(l + abs_m);
  const norm = Math.sqrt((2*l + 1) / (4 * Math.PI) * l_m_factorial / l_p_m_factorial);

  // Compute associated Legendre polynomial
  const P_lm = associatedLegendreP(l, abs_m, Math.cos(theta));

  if (m > 0) {
    // √2 N_l^m P_l^m(cos θ) cos(mφ)
    return Math.SQRT2 * norm * P_lm * Math.cos(m * phi);
  } else if (m < 0) {
    // √2 N_l^|m| P_l^|m|(cos θ) sin(|m|φ)
    return Math.SQRT2 * norm * P_lm * Math.sin(abs_m * phi);
  } else {
    // N_l^0 P_l^0(cos θ)
    return norm * P_lm;
  }
}

// Batch evaluation at multiple points (for 3D visualization)
function sphericalHarmonicGrid(
  l: number,
  m: number,
  theta_grid: number[],
  phi_grid: number[]
): number[][] {
  const n_theta = theta_grid.length;
  const n_phi = phi_grid.length;
  const result = new Array(n_theta);

  for (let i = 0; i < n_theta; i++) {
    result[i] = new Array(n_phi);
    for (let j = 0; j < n_phi; j++) {
      result[i][j] = sphericalHarmonicReal(l, m, {
        theta: theta_grid[i],
        phi: phi_grid[j]
      });
    }
  }

  return result;
}
```

### Low-Degree Formulas (Cartesian Coordinates)

Convert (x, y, z) to spherical harmonics (r² = x² + y² + z²):

```typescript
// l = 0
Y₀₀ = 1/(2√π)

// l = 1
Y₁₋₁ = √(3/4π) · y/r
Y₁₀  = √(3/4π) · z/r
Y₁₁  = √(3/4π) · x/r

// l = 2
Y₂₋₂ = √(15/16π) · xy/r²
Y₂₋₁ = √(15/4π) · yz/r²
Y₂₀  = √(5/16π) · (2z² - x² - y²)/r²
Y₂₁  = √(15/4π) · xz/r²
Y₂₂  = √(15/16π) · (x² - y²)/r²
```

### Applications

- **Quantum Mechanics**: Atomic orbitals, angular momentum eigenstates
- **Computer Graphics**: Environment mapping, lighting
- **Geophysics**: Earth's gravitational/magnetic field expansion
- **Signal Processing**: Spherical data analysis

### Test Cases

```typescript
// Y₀₀ is constant
Y₀₀(any θ, any φ) = 1/(2√π) ≈ 0.282095

// At north pole (θ=0, φ=any)
Y₁₀(0, φ) = √(3/4π) ≈ 0.488603
Yₗₘ(0, φ) = 0 for m ≠ 0

// Normalization check
∫∫ |Yₗᵐ|² sin θ dθ dφ = 1

// Orthogonality
∫∫ Y₁₀* Y₂₀ sin θ dθ dφ = 0
```

---

## Task 8: Quadrature Nodes and Weights

### Gaussian Quadrature Framework

**Goal**: Approximate integral
```
I[f] = ∫ₐᵇ f(x) w(x) dx ≈ Qₙ[f] = Σᵢ₌₁ⁿ wᵢ f(xᵢ)
```

where:
- {x₁, x₂, ..., xₙ} = quadrature nodes
- {w₁, w₂, ..., wₙ} = quadrature weights
- w(x) = weight function

**Exactness**: Gaussian quadrature with n points is exact for polynomials up to degree 2n-1.

### Golub-Welsch Algorithm

**Key Insight**: Nodes are eigenvalues of Jacobi matrix.

For orthogonal polynomials {φₙ} with recurrence:
```
φₙ₊₁(x) = (x - αₙ) φₙ(x) - βₙ φₙ₋₁(x)
```

**Jacobi Matrix**:
```
J = [
  α₀   √β₁   0     ...   0
  √β₁  α₁    √β₂   ...   0
  0    √β₂   α₂    ...   0
  ...
  0    ...   ...  √βₙ₋₁
  0    ...   0   √βₙ₋₁  αₙ₋₁
]
```

**Algorithm**:
1. Construct n×n Jacobi matrix from recurrence coefficients
2. Compute eigenvalues λᵢ and eigenvectors vᵢ
3. Nodes: xᵢ = λᵢ
4. Weights: wᵢ = μ₀ · (v₁⁽ⁱ⁾)² where μ₀ = ∫ w(x) dx and v₁⁽ⁱ⁾ is first component of eigenvector vᵢ

### Gauss-Legendre Quadrature

**Interval**: [-1, 1]
**Weight**: w(x) = 1

**Recurrence coefficients**:
```
αₙ = 0  for all n
βₙ = n² / (4n² - 1)
```

**Normalization**: μ₀ = ∫₋₁¹ 1 dx = 2

### Pseudocode (Golub-Welsch)

```typescript
interface QuadratureRule {
  nodes: number[];
  weights: number[];
}

function golubWelsch(
  alpha: number[],  // Recurrence coefficients αₙ
  beta: number[],   // Recurrence coefficients βₙ
  mu0: number       // ∫ w(x) dx
): QuadratureRule {
  const n = alpha.length;

  // Construct symmetric tridiagonal Jacobi matrix
  const diagonal = alpha.slice();
  const offDiagonal = beta.slice(1).map(b => Math.sqrt(b));

  // Compute eigenvalues and eigenvectors using symmetric tridiagonal solver
  const eigen = symmetricTridiagonalEigen(diagonal, offDiagonal);

  // Extract nodes (eigenvalues)
  const nodes = eigen.values;

  // Extract weights from first component of eigenvectors
  const weights = new Array(n);
  for (let i = 0; i < n; i++) {
    const v1 = eigen.vectors[0][i];  // First component of i-th eigenvector
    weights[i] = mu0 * v1 * v1;
  }

  return { nodes, weights };
}

// Gauss-Legendre quadrature
function gaussLegendreQuadrature(n: number): QuadratureRule {
  const alpha = new Array(n).fill(0);
  const beta = new Array(n);
  beta[0] = 2.0;  // μ₀ = ∫₋₁¹ 1 dx = 2

  for (let k = 1; k < n; k++) {
    beta[k] = (k * k) / (4.0 * k * k - 1.0);
  }

  return golubWelsch(alpha, beta, 2.0);
}

// Gauss-Hermite quadrature (physicist's convention)
function gaussHermiteQuadrature(n: number): QuadratureRule {
  const alpha = new Array(n).fill(0);
  const beta = new Array(n);
  beta[0] = Math.sqrt(Math.PI);  // μ₀ = ∫₋∞^∞ exp(-x²) dx = √π

  for (let k = 1; k < n; k++) {
    beta[k] = k / 2.0;
  }

  return golubWelsch(alpha, beta, Math.sqrt(Math.PI));
}

// Gauss-Laguerre quadrature
function gaussLaguerreQuadrature(n: number, alpha_param: number = 0): QuadratureRule {
  const alpha = new Array(n);
  const beta = new Array(n);

  for (let k = 0; k < n; k++) {
    alpha[k] = 2 * k + alpha_param + 1;
    beta[k] = k * (k + alpha_param);
  }
  beta[0] = gamma(alpha_param + 1);  // μ₀ = Γ(α+1)

  return golubWelsch(alpha, beta, gamma(alpha_param + 1));
}

// Gauss-Jacobi quadrature
function gaussJacobiQuadrature(
  n: number,
  alpha_param: number,
  beta_param: number
): QuadratureRule {
  const alpha = new Array(n);
  const beta = new Array(n);

  const apb = alpha_param + beta_param;

  alpha[0] = (beta_param - alpha_param) / (apb + 2);
  beta[0] = Math.pow(2, apb + 1) *
            gamma(alpha_param + 1) *
            gamma(beta_param + 1) /
            gamma(apb + 2);

  for (let k = 1; k < n; k++) {
    const k2 = 2 * k;
    const k2apb = k2 + apb;

    alpha[k] = (beta_param * beta_param - alpha_param * alpha_param) /
               (k2apb * (k2apb + 2));

    beta[k] = 4 * k * (k + alpha_param) * (k + beta_param) * (k + apb) /
              ((k2apb * k2apb) * (k2apb + 1) * (k2apb - 1));
  }

  const mu0 = beta[0];
  return golubWelsch(alpha, beta, mu0);
}
```

### Alternative: Newton's Method for Roots

For high-precision applications, use Newton-Raphson on polynomial itself:

```typescript
function legendreRootsNewton(n: number, tolerance: number = 1e-15): number[] {
  const roots = new Array(n);

  // Use asymptotic formula for initial guesses
  for (let i = 0; i < n; i++) {
    const theta = Math.PI * (i + 0.75) / (n + 0.5);
    let x = Math.cos(theta);  // Initial guess

    // Newton-Raphson iterations
    for (let iter = 0; iter < 20; iter++) {
      const P_n = legendreP(n, x);
      const P_n_minus_1 = legendreP(n - 1, x);

      // Derivative: P'ₙ(x) = n [P_{n-1}(x) - x Pₙ(x)] / (1 - x²)
      const P_n_prime = n * (P_n_minus_1 - x * P_n) / (1 - x * x);

      const delta = P_n / P_n_prime;
      x -= delta;

      if (Math.abs(delta) < tolerance) break;
    }

    roots[i] = x;
  }

  return roots;
}

function legendreWeights(nodes: number[], n: number): number[] {
  const weights = new Array(n);

  for (let i = 0; i < n; i++) {
    const x = nodes[i];
    const P_n_minus_1 = legendreP(n - 1, x);

    // Weight formula: wᵢ = 2 / [(1 - xᵢ²) (P'ₙ(xᵢ))²]
    //                    = 2 / [(1 - xᵢ²) (P_{n-1}(xᵢ))²]  (using derivative relation)
    weights[i] = 2.0 / ((1 - x * x) * P_n_minus_1 * P_n_minus_1);
  }

  return weights;
}
```

### Quadrature Rules Summary

| Type | Interval | Weight w(x) | Exact for deg ≤ | Use Case |
|------|----------|-------------|-----------------|----------|
| Gauss-Legendre | [-1,1] | 1 | 2n-1 | General integration |
| Gauss-Chebyshev (T) | [-1,1] | 1/√(1-x²) | 2n-1 | Oscillatory functions |
| Gauss-Chebyshev (U) | [-1,1] | √(1-x²) | 2n-1 | Smoothness near endpoints |
| Gauss-Hermite | (-∞,∞) | e^(-x²) | 2n-1 | Normal distributions |
| Gauss-Laguerre | [0,∞) | e^(-x) | 2n-1 | Exponential decay |
| Gauss-Jacobi | [-1,1] | (1-x)^α(1+x)^β | 2n-1 | Custom endpoint behavior |

### Applications

- **Numerical Integration**: High-precision quadrature
- **Spectral Methods**: Pseudospectral collocation points
- **Uncertainty Quantification**: Polynomial chaos expansions
- **Statistics**: Numerical computation of expectations

### Test Cases

```typescript
// Gauss-Legendre n=2 (exact for cubics)
nodes:   [-1/√3, 1/√3] ≈ [-0.577350, 0.577350]
weights: [1, 1]

// Verify exactness for x³
∫₋₁¹ x³ dx = 0
Q₂[x³] = 1·(-1/√3)³ + 1·(1/√3)³ = 0 ✓

// Gauss-Legendre n=3 (exact for degree 5)
nodes:   [-√(3/5), 0, √(3/5)] ≈ [-0.774597, 0, 0.774597]
weights: [5/9, 8/9, 5/9]

// Gauss-Hermite n=2
nodes:   [-1/√2, 1/√2] ≈ [-0.707107, 0.707107]
weights: [√π/2, √π/2]
```

---

## Implementation Strategy

### Phase 1: Core Polynomial Evaluation (Weeks 1-3)

1. **Implement recurrence evaluators**:
   - Legendre P_n(x)
   - Hermite H_n(x) and He_n(x)
   - Laguerre L_n(x)
   - Chebyshev T_n(x) and U_n(x)

2. **Associated forms**:
   - Associated Legendre P_l^m(x)
   - Associated Laguerre L_n^α(x)

3. **Unit tests**: Verify against analytical formulas

### Phase 2: General Families (Weeks 4-5)

1. **Jacobi polynomials**: P_n^(α,β)(x)
2. **Gegenbauer polynomials**: C_n^λ(x)
3. **Verify special case relationships**

### Phase 3: Spherical Harmonics (Week 6)

1. **Complex spherical harmonics**: Y_l^m(θ,φ)
2. **Real spherical harmonics**: Cartesian form
3. **Normalization and orthogonality tests**

### Phase 4: Quadrature (Weeks 7-8)

1. **Golub-Welsch algorithm**: Eigenvalue approach
2. **Specialized quadrature rules**:
   - Gauss-Legendre
   - Gauss-Hermite
   - Gauss-Laguerre
   - Gauss-Jacobi
3. **Newton-Raphson refinement** (optional high-precision)

### Phase 5: WASM Optimization (Weeks 9-10)

1. **Batch evaluation**: Vectorize recurrence loops
2. **SIMD operations**: f64x2 for paired computations
3. **Precomputed tables**: Factorials, binomial coefficients
4. **Benchmarking**: Compare JS vs WASM performance

---

## Performance Targets

| Operation | Input Size | Target (JS) | Target (WASM) | Speedup |
|-----------|------------|-------------|---------------|---------|
| P_n(x) eval | n=100 | 5 μs | 1 μs | 5x |
| P_l^m(x) eval | l=50, m=25 | 15 μs | 3 μs | 5x |
| Y_l^m(θ,φ) eval | l=50 | 20 μs | 4 μs | 5x |
| Gauss quad nodes | n=100 | 500 μs | 100 μs | 5x |
| Batch Y_l^m grid | 100×100 points | 200 ms | 40 ms | 5x |

---

## Testing Strategy

### Unit Tests

```typescript
describe('Orthogonal Polynomials', () => {
  describe('Legendre', () => {
    it('should compute P_0(x) = 1', () => {
      expect(legendreP(0, 0.5)).toBeCloseTo(1.0);
    });

    it('should satisfy recurrence relation', () => {
      const x = 0.3;
      for (let n = 1; n < 10; n++) {
        const lhs = (n+1) * legendreP(n+1, x);
        const rhs = (2*n+1) * x * legendreP(n, x) - n * legendreP(n-1, x);
        expect(lhs).toBeCloseTo(rhs);
      }
    });

    it('should be normalized: P_n(1) = 1', () => {
      for (let n = 0; n <= 10; n++) {
        expect(legendreP(n, 1)).toBeCloseTo(1.0);
      }
    });
  });

  describe('Spherical Harmonics', () => {
    it('should be normalized', () => {
      // Numerical integration over sphere
      const integral = numericalIntegrateSphere((theta, phi) => {
        const Y = sphericalHarmonicReal(2, 1, {theta, phi});
        return Y * Y;
      });
      expect(integral).toBeCloseTo(1.0, 5);
    });

    it('should be orthogonal', () => {
      const integral = numericalIntegrateSphere((theta, phi) => {
        const Y21 = sphericalHarmonicReal(2, 1, {theta, phi});
        const Y32 = sphericalHarmonicReal(3, 2, {theta, phi});
        return Y21 * Y32;
      });
      expect(integral).toBeCloseTo(0.0, 5);
    });
  });

  describe('Quadrature', () => {
    it('should integrate polynomials exactly', () => {
      const {nodes, weights} = gaussLegendreQuadrature(5);

      // Should be exact for polynomials up to degree 2n-1 = 9
      const f = (x: number) => x**8 + 2*x**6 - 3*x**4 + x**2 + 5;
      const exact = 4024 / 315;  // Analytical integral

      let numerical = 0;
      for (let i = 0; i < nodes.length; i++) {
        numerical += weights[i] * f(nodes[i]);
      }

      expect(numerical).toBeCloseTo(exact);
    });
  });
});
```

### Numerical Accuracy Tests

```typescript
// Test against reference implementations (e.g., scipy, GSL)
const referenceValues = {
  legendreP: {
    n: 10, x: 0.7, expected: -0.3831907669
  },
  hermiteH: {
    n: 5, x: 1.5, expected: -59.0
  },
  sphericalY: {
    l: 3, m: 2, theta: Math.PI/4, phi: Math.PI/3,
    expected_real: 0.127801,
    expected_imag: -0.221332
  }
};
```

---

## API Design

### TypeScript Interfaces

```typescript
// Core polynomial evaluation
export function legendreP(n: number, x: number): number;
export function associatedLegendreP(l: number, m: number, x: number): number;
export function hermiteH(n: number, x: number): number;
export function hermiteHe(n: number, x: number): number;
export function laguerreL(n: number, x: number): number;
export function associatedLaguerreL(n: number, alpha: number, x: number): number;
export function chebyshevT(n: number, x: number): number;
export function chebyshevU(n: number, x: number): number;
export function jacobiP(n: number, alpha: number, beta: number, x: number): number;
export function gegenbauerC(n: number, lambda: number, x: number): number;

// Spherical harmonics
export function sphericalHarmonicY(
  l: number,
  m: number,
  theta: number,
  phi: number
): Complex;

export function sphericalHarmonicYReal(
  l: number,
  m: number,
  theta: number,
  phi: number
): number;

// Quadrature
export interface QuadratureRule {
  nodes: number[];
  weights: number[];
}

export function gaussLegendre(n: number): QuadratureRule;
export function gaussHermite(n: number): QuadratureRule;
export function gaussLaguerre(n: number, alpha?: number): QuadratureRule;
export function gaussJacobi(n: number, alpha: number, beta: number): QuadratureRule;
export function gaussChebyshev(n: number, kind: 1 | 2): QuadratureRule;
```

### Math.js Integration

```javascript
// Factory functions
export const createLegendreP = factory('legendreP', [], () => legendreP);
export const createSphericalHarmonicY = factory('sphericalHarmonicY', ['complex'],
  ({ complex }) => sphericalHarmonicY);

// Usage
import { create, all } from 'mathjs';
const math = create(all);

const P5 = math.legendreP(5, 0.8);
const Y32 = math.sphericalHarmonicY(3, 2, Math.PI/4, Math.PI/3);
const quad = math.gaussLegendre(10);
```

---

## Documentation Requirements

### User-Facing Documentation

1. **Concept guide**: Overview of orthogonal polynomials
2. **Function reference**: All API functions with examples
3. **Tutorial**: Gaussian quadrature from scratch
4. **Application examples**:
   - Polynomial approximation
   - Solving PDEs with spectral methods
   - Quantum mechanics wave functions

### Developer Documentation

1. **Algorithm descriptions**: Recurrence relations, normalization
2. **Numerical stability notes**: When to use which method
3. **WASM implementation guide**: Optimization techniques
4. **Benchmarking results**: Performance comparisons

---

## Dependencies

### Required from Other Phases

- **Phase 2**: Arithmetic operations, factorial, gamma function
- **Phase 5**: Special functions (error function for testing)
- **Phase 10**: Eigenvalue solvers (symmetric tridiagonal)

### External Libraries (for testing/validation)

- Reference values from scipy.special
- GSL (GNU Scientific Library) for cross-validation

---

## Acceptance Criteria

- [ ] All 8 orthogonal polynomial families implemented
- [ ] Recurrence-based evaluation with O(n) complexity
- [ ] Associated/generalized forms working correctly
- [ ] Spherical harmonics (complex and real forms)
- [ ] Golub-Welsch quadrature algorithm implemented
- [ ] All quadrature rules (Legendre, Hermite, Laguerre, Jacobi) working
- [ ] Unit tests passing with >95% coverage
- [ ] Numerical accuracy tests against reference implementations
- [ ] WASM versions with 5x+ speedup for n > 50
- [ ] Documentation complete with examples
- [ ] TypeScript definitions in types/index.d.ts
- [ ] Integration tests with math.js factory system

---

## Future Enhancements

1. **Additional polynomial families**:
   - Zernike polynomials (optics)
   - Krawtchouk polynomials (discrete orthogonal)
   - q-orthogonal polynomials

2. **Advanced quadrature**:
   - Clenshaw-Curtis (Chebyshev-based)
   - Gauss-Kronrod (adaptive)
   - Tanh-sinh quadrature (doubly-exponential)

3. **Applications**:
   - Fast polynomial transforms (O(n log n))
   - Spherical harmonic transforms for 3D data
   - Spectral element methods for PDEs

4. **Optimization**:
   - GPU acceleration for spherical harmonic grids
   - Multi-threaded batch evaluation
   - Compressed storage for precomputed values

---

## References

### Key Papers

1. Golub & Welsch (1969): "Calculation of Gauss Quadrature Rules"
2. Press et al., *Numerical Recipes*: Orthogonal polynomials and quadrature
3. Abramowitz & Stegun: *Handbook of Mathematical Functions*

### Software References

- **scipy.special**: Python implementation
- **GSL**: GNU Scientific Library (C)
- **Boost Math**: C++ special functions
- **NIST DLMF**: Digital Library of Mathematical Functions

### Online Resources

- NIST DLMF: https://dlmf.nist.gov/ (Chapters 18, 14)
- Wolfram MathWorld: Orthogonal polynomials
- Wikipedia: Detailed recurrence relations and properties
