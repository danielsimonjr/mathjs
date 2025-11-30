# Phase 8: Elliptic & Hypergeometric Functions

**Status**: Planning Phase
**Priority**: High (scientific computing completeness)
**Estimated Complexity**: Very High
**Dependencies**: Phase 1 (core numeric), Phase 3 (special functions)

## Overview

This phase implements advanced special functions critical for physics, engineering, and mathematical analysis:
- **Elliptic integrals**: Complete and incomplete forms (K, E, Π, F)
- **Jacobi elliptic functions**: sn, cn, dn (and potentially others)
- **Hypergeometric functions**: 1F1 (Kummer), 2F1 (Gauss), generalized pFq
- **Carlson symmetric forms**: RF, RD, RJ, RC (modern approach to elliptic integrals)

These functions are essential for:
- Electromagnetic field calculations
- Orbital mechanics and celestial mechanics
- Quantum mechanics and statistical physics
- Differential equation solutions
- Geodesy and cartography

## Mathematical Background

### Arithmetic-Geometric Mean (AGM)

The AGM is fundamental to fast computation of complete elliptic integrals.

**Definition**: For a₀ > 0, b₀ > 0:
```
aₙ₊₁ = (aₙ + bₙ) / 2        (arithmetic mean)
bₙ₊₁ = √(aₙ · bₙ)           (geometric mean)
```

**Convergence**: aₙ and bₙ converge to the same limit M(a₀, b₀) quadratically.

**Key Property**:
```
K(k) = π / (2 · M(1, √(1-k²)))
```

### Elliptic Integral Classification

**Legendre Form** (classical):
- K(k): Complete elliptic integral of the first kind
- E(k): Complete elliptic integral of the second kind
- Π(n, k): Complete elliptic integral of the third kind
- F(φ, k): Incomplete elliptic integral of the first kind
- E(φ, k): Incomplete elliptic integral of the second kind

**Carlson Form** (symmetric, numerically superior):
- RF(x, y, z): Symmetric elliptic integral of the first kind
- RD(x, y, z): Symmetric elliptic integral of the second kind
- RJ(x, y, z, p): Symmetric elliptic integral of the third kind
- RC(x, y): Degenerate case

**Conversion**: Legendre ↔ Carlson via algebraic formulas.

---

## Task 1: Elliptic K - Complete Elliptic Integral of the First Kind

### Definition

```
K(k) = ∫₀^(π/2) dθ / √(1 - k²sin²θ)
     = ∫₀¹ dt / √[(1-t²)(1-k²t²)]
```

**Parameter**: k is the elliptic modulus, 0 ≤ k < 1
**Complementary modulus**: k' = √(1-k²)

### Algorithm 1: AGM Method (Fastest)

**Principle**: K(k) = π / (2 · M(1, k'))

**Pseudocode**:
```typescript
function ellipticK(k: number): number {
  if (k < 0 || k >= 1) throw new Error('k must be in [0, 1)')
  if (k === 0) return Math.PI / 2

  const EPS = 2.220446049250313e-16  // machine epsilon
  const k_prime = Math.sqrt(1 - k * k)

  let a = 1.0
  let b = k_prime

  // AGM iteration
  while (Math.abs(a - b) > EPS * a) {
    const a_new = (a + b) / 2
    const b_new = Math.sqrt(a * b)
    a = a_new
    b = b_new
  }

  return Math.PI / (2 * a)
}
```

**Convergence**: Quadratic (doubles digits per iteration)
**Iterations**: Typically 4-5 for double precision

### Algorithm 2: Arithmetic-Geometric Mean with Tracking

For derivative computation and related integrals:

```typescript
interface AGMResult {
  K: number
  E: number  // Can compute E simultaneously
  iterations: number
}

function ellipticKE_AGM(k: number): AGMResult {
  const EPS = 2.220446049250313e-16
  const k_prime = Math.sqrt(1 - k * k)

  let a = 1.0
  let b = k_prime
  let c = k
  let sum = k * k
  let pow2 = 1

  for (let iter = 0; iter < 20; iter++) {
    if (Math.abs(c) < EPS) break

    const a_new = (a + b) / 2
    const b_new = Math.sqrt(a * b)
    c = (a - b) / 2

    pow2 *= 2
    sum += pow2 * c * c

    a = a_new
    b = b_new
  }

  const K = Math.PI / (2 * a)
  const E = K * (1 - sum / 2)

  return { K, E, iterations: Math.ceil(Math.log2(pow2)) }
}
```

### Special Values

```typescript
// Special cases for optimization
if (k === 0) return Math.PI / 2
if (k === 1) return Infinity
if (k < 1e-8) return Math.PI / 2 * (1 + k*k/4 + 9*k*k*k*k/64)  // series
```

### Series Expansion (for small k)

```
K(k) = π/2 · [1 + (1/2)²k² + (1·3/2·4)²k⁴ + (1·3·5/2·4·6)²k⁶ + ...]
     = π/2 · ₂F₁(1/2, 1/2; 1; k²)
```

---

## Task 2: Elliptic E - Complete Elliptic Integral of the Second Kind

### Definition

```
E(k) = ∫₀^(π/2) √(1 - k²sin²θ) dθ
     = ∫₀¹ √(1-k²t²) / √(1-t²) dt
```

### Algorithm: AGM with E Computation

**Principle**: E(k) computed simultaneously with K(k) using modified AGM.

**Pseudocode**:
```typescript
function ellipticE(k: number): number {
  if (k < 0 || k >= 1) throw new Error('k must be in [0, 1)')
  if (k === 0) return Math.PI / 2
  if (k === 1) return 1.0

  const EPS = 2.220446049250313e-16
  const k_prime = Math.sqrt(1 - k * k)

  let a = 1.0
  let b = k_prime
  let c = k
  let sum = k * k
  let pow_of_2 = 1

  while (Math.abs(c) > EPS) {
    const a_new = (a + b) / 2
    const b_new = Math.sqrt(a * b)
    c = (a - b) / 2

    pow_of_2 *= 2
    sum += pow_of_2 * c * c

    a = a_new
    b = b_new
  }

  const K = Math.PI / (2 * a)
  const E = K * (1 - sum / 2)

  return E
}
```

### Key Formula (Legendre Relation)

```
E(k)·K(k') + E(k')·K(k) - K(k)·K(k') = π/2

where k' = √(1-k²)
```

### Series Expansion (for small k)

```
E(k) = π/2 · [1 - (1/2)²k²/1 - (1·3/2·4)²k⁴/3 - (1·3·5/2·4·6)²k⁶/5 - ...]
```

### Asymptotic Expansion (k → 1)

```
E(k) ≈ 1 + k'/2 · [ln(4/k') - 1/2] + O(k'² ln k')
where k' = √(1-k²)
```

---

## Task 3: Incomplete Elliptic Integrals F, E

### Incomplete Elliptic Integral F (First Kind)

**Definition**:
```
F(φ, k) = ∫₀^φ dθ / √(1 - k²sin²θ)
```

**Parameters**:
- φ: amplitude (argument), 0 ≤ φ ≤ π/2
- k: modulus, 0 ≤ k < 1

### Algorithm 1: Carlson RF Method (Preferred)

**Conversion to Carlson form**:
```
F(φ, k) = sin(φ) · RF(cos²φ, 1-k²sin²φ, 1)
```

**Pseudocode**:
```typescript
function ellipticF(phi: number, k: number): number {
  // Handle special cases
  if (phi === 0) return 0
  if (Math.abs(phi) >= Math.PI / 2) {
    // Use periodicity: F(π/2, k) = K(k)
    const n = Math.floor(phi / (Math.PI / 2) + 0.5)
    const phi_reduced = phi - n * Math.PI / 2
    return n * ellipticK(k) + ellipticF(phi_reduced, k)
  }

  const sin_phi = Math.sin(phi)
  const cos_phi = Math.cos(phi)

  const x = cos_phi * cos_phi
  const y = 1 - k * k * sin_phi * sin_phi
  const z = 1.0

  return sin_phi * carlsonRF(x, y, z)
}
```

### Algorithm 2: Arithmetic-Geometric Mean (Classical)

**Landen Transformation** (iterative reduction):

```typescript
function ellipticF_Landen(phi: number, k: number): number {
  const MAX_ITER = 20
  const EPS = 2.220446049250313e-16

  let a = 1.0
  let b = Math.sqrt(1 - k * k)
  let c = k
  let phi_n = phi
  const multipliers: number[] = []

  for (let n = 0; n < MAX_ITER; n++) {
    if (Math.abs(c) < EPS) break

    const a_new = (a + b) / 2
    const b_new = Math.sqrt(a * b)
    const c_new = (a - b) / 2

    const sin_phi = Math.sin(phi_n)
    const denom = 1 - c_new * c_new * sin_phi * sin_phi / (a_new * a_new)
    phi_n = (phi_n + Math.asin(c_new * sin_phi / a_new)) / 2
    multipliers.push(2 * a_new / denom)

    a = a_new
    b = b_new
    c = c_new
  }

  let result = phi_n / a
  for (let i = multipliers.length - 1; i >= 0; i--) {
    result *= multipliers[i]
  }

  return result
}
```

### Incomplete Elliptic Integral E (Second Kind)

**Definition**:
```
E(φ, k) = ∫₀^φ √(1 - k²sin²θ) dθ
```

### Algorithm: Carlson RD Method

**Conversion**:
```
E(φ, k) = sin(φ)·RF(cos²φ, 1-k²sin²φ, 1)
          - k²sin³φ·RD(cos²φ, 1-k²sin²φ, 1) / 3
```

**Pseudocode**:
```typescript
function ellipticE_incomplete(phi: number, k: number): number {
  if (phi === 0) return 0
  if (Math.abs(phi) >= Math.PI / 2) {
    const n = Math.floor(phi / (Math.PI / 2) + 0.5)
    const phi_reduced = phi - n * Math.PI / 2
    return n * ellipticE(k) + ellipticE_incomplete(phi_reduced, k)
  }

  const sin_phi = Math.sin(phi)
  const cos_phi = Math.cos(phi)
  const k2 = k * k

  const x = cos_phi * cos_phi
  const y = 1 - k2 * sin_phi * sin_phi
  const z = 1.0

  const RF_val = carlsonRF(x, y, z)
  const RD_val = carlsonRD(x, y, z)

  return sin_phi * RF_val - k2 * sin_phi * sin_phi * sin_phi * RD_val / 3
}
```

---

## Task 4: Elliptic Π - Complete Elliptic Integral of the Third Kind

### Definition

```
Π(n, k) = ∫₀^(π/2) dθ / [(1 - n·sin²θ)·√(1 - k²sin²θ)]
```

**Parameters**:
- n: characteristic (can be negative, positive, > 1)
- k: modulus, 0 ≤ k < 1

### Algorithm: Carlson RJ Method

**Conversion to Carlson form**:
```
Π(n, k) = RF(0, 1-k², 1) + n·RJ(0, 1-k², 1, 1-n) / 3
```

**Pseudocode**:
```typescript
function ellipticPi(n: number, k: number): number {
  if (k < 0 || k >= 1) throw new Error('k must be in [0, 1)')

  const k2 = k * k
  const k_prime2 = 1 - k2

  // Special cases
  if (n === 0) return ellipticK(k)
  if (n === 1) return Infinity
  if (k === 0) return Math.PI / (2 * Math.sqrt(1 - n))

  const x = 0.0
  const y = k_prime2
  const z = 1.0
  const p = 1 - n

  const RF_val = carlsonRF(x, y, z)
  const RJ_val = carlsonRJ(x, y, z, p)

  return RF_val + n * RJ_val / 3
}
```

### Incomplete Form

```
Π(n; φ, k) = ∫₀^φ dθ / [(1 - n·sin²θ)·√(1 - k²sin²θ)]
```

**Carlson form**:
```typescript
function ellipticPi_incomplete(n: number, phi: number, k: number): number {
  const sin_phi = Math.sin(phi)
  const cos_phi = Math.cos(phi)
  const sin2 = sin_phi * sin_phi
  const cos2 = cos_phi * cos_phi
  const k2 = k * k

  const x = cos2
  const y = 1 - k2 * sin2
  const z = 1.0
  const p = 1 - n * sin2

  const RF_val = carlsonRF(x, y, z)
  const RJ_val = carlsonRJ(x, y, z, p)

  return sin_phi * (RF_val + n * sin2 * RJ_val / 3)
}
```

---

## Task 5: Jacobi Elliptic Functions sn, cn, dn

### Definitions

```
sn(u, k) = sin(φ)   where u = F(φ, k)
cn(u, k) = cos(φ)   where u = F(φ, k)
dn(u, k) = √(1 - k²sin²φ) = √(1 - k²sn²(u,k))
```

**Properties**:
```
sn²(u,k) + cn²(u,k) = 1
dn²(u,k) + k²sn²(u,k) = 1
```

### Algorithm 1: AGM Descent (Fastest)

**Principle**: Use descending Landen transformation to reduce to sin/cos.

**Pseudocode**:
```typescript
interface JacobiResult {
  sn: number
  cn: number
  dn: number
}

function jacobiElliptic(u: number, k: number): JacobiResult {
  const MAX_ITER = 20
  const EPS = 2.220446049250313e-16

  // Special cases
  if (k === 0) {
    return { sn: Math.sin(u), cn: Math.cos(u), dn: 1.0 }
  }
  if (k === 1) {
    const tanh_u = Math.tanh(u)
    const sech_u = 1 / Math.cosh(u)
    return { sn: tanh_u, cn: sech_u, dn: sech_u }
  }

  // AGM descent
  const a: number[] = [1.0]
  const b: number[] = [Math.sqrt(1 - k * k)]
  const c: number[] = [k]

  let n = 0
  while (n < MAX_ITER && Math.abs(c[n]) > EPS) {
    a.push((a[n] + b[n]) / 2)
    b.push(Math.sqrt(a[n] * b[n]))
    c.push((a[n] - b[n]) / 2)
    n++
  }

  // Backward recursion
  let phi = Math.pow(2, n) * a[n] * u

  for (let i = n; i >= 0; i--) {
    phi = (Math.asin(c[i] * Math.sin(phi) / a[i]) + phi) / 2
  }

  const sn = Math.sin(phi)
  const cn = Math.cos(phi)
  const dn = Math.sqrt(1 - k * k * sn * sn)

  return { sn, cn, dn }
}
```

### Algorithm 2: Arithmetic-Geometric Mean (with periodicity)

**Handle large u** using period 4K(k):

```typescript
function jacobiElliptic_normalized(u: number, k: number): JacobiResult {
  const K = ellipticK(k)
  const period = 4 * K

  // Reduce to fundamental domain [0, 4K)
  const u_mod = ((u % period) + period) % period

  // Use symmetries to reduce to [0, K]
  let u_reduced = u_mod
  let sign_sn = 1, sign_cn = 1, sign_dn = 1

  if (u_reduced > 2 * K) {
    u_reduced = u_reduced - 2 * K
    sign_sn = -sign_sn
  }
  if (u_reduced > K) {
    u_reduced = 2 * K - u_reduced
    sign_cn = -sign_cn
  }

  // Compute in [0, K]
  const result = jacobiElliptic(u_reduced, k)

  return {
    sn: sign_sn * result.sn,
    cn: sign_cn * result.cn,
    dn: sign_dn * result.dn
  }
}
```

### Derivatives

```
d/du sn(u,k) = cn(u,k) · dn(u,k)
d/du cn(u,k) = -sn(u,k) · dn(u,k)
d/du dn(u,k) = -k² · sn(u,k) · cn(u,k)
```

### Addition Theorems

```
sn(u+v) = [sn(u)cn(v)dn(v) + sn(v)cn(u)dn(u)] / [1 - k²sn²(u)sn²(v)]
cn(u+v) = [cn(u)cn(v) - sn(u)sn(v)dn(u)dn(v)] / [1 - k²sn²(u)sn²(v)]
```

---

## Task 6: Hypergeometric 1F1 - Kummer's Confluent Function

### Definition

```
₁F₁(a; b; z) = M(a, b, z) = Σ (a)ₙ zⁿ / [(b)ₙ n!]   (n=0 to ∞)

where (a)ₙ = a(a+1)(a+2)...(a+n-1) is the Pochhammer symbol
```

**Domain**: Entire complex plane (entire function in z for fixed a, b)

### Algorithm 1: Power Series (|z| small)

**Convergence**: Always converges, but slowly for |z| > 10.

**Pseudocode**:
```typescript
function hyperg1F1_series(a: number, b: number, z: number): number {
  if (b === 0 || b === Math.floor(b) && b <= 0) {
    throw new Error('b must not be zero or negative integer')
  }

  const MAX_ITER = 1000
  const EPS = 1e-15

  let sum = 1.0
  let term = 1.0

  for (let n = 1; n < MAX_ITER; n++) {
    term *= (a + n - 1) * z / ((b + n - 1) * n)
    sum += term

    if (Math.abs(term) < EPS * Math.abs(sum)) break
  }

  return sum
}
```

### Algorithm 2: Asymptotic Expansion (|z| large, Re(z) > 0)

**Formula** (Kummer's transformation):
```
₁F₁(a; b; z) ≈ e^z · Γ(b)/Γ(b-a) · z^(a-b) · [1 + O(1/z)]   (|arg(z)| < π)
```

**More precise**:
```
₁F₁(a; b; z) ~ e^z · z^(a-b) · Γ(b)/Γ(a) · Σ (b-a)ₙ(1-a)ₙ / (n! z^n)
```

**Pseudocode**:
```typescript
function hyperg1F1_asymptotic(a: number, b: number, z: number): number {
  const MAX_TERMS = 50
  const EPS = 1e-15

  // Asymptotic series
  let sum = 1.0
  let term = 1.0

  for (let n = 1; n < MAX_TERMS; n++) {
    term *= (b - a + n - 1) * (1 - a + n - 1) / (n * z)
    sum += term

    if (Math.abs(term) < EPS * Math.abs(sum)) break
  }

  const lngamma_b = logGamma(b)
  const lngamma_a = logGamma(a)
  const log_prefactor = z + (a - b) * Math.log(z) + lngamma_b - lngamma_a

  return Math.exp(log_prefactor) * sum
}
```

### Algorithm 3: Recurrence Relations

**Three-term recurrence** (for varying a):
```
(b-a)·M(a-1,b,z) + (2a-b+z)·M(a,b,z) - a·M(a+1,b,z) = 0
```

**Use Miller's algorithm** (backward recurrence) for stability.

### Algorithm 4: Combined Method (Adaptive)

```typescript
function hyperg1F1(a: number, b: number, z: number): number {
  // Handle special cases
  if (z === 0) return 1.0
  if (a === 0) return 1.0
  if (a === b) return Math.exp(z)
  if (a === 1 && b === 2) return (Math.exp(z) - 1) / z

  // Choose method based on |z|
  if (Math.abs(z) < 10) {
    return hyperg1F1_series(a, b, z)
  } else if (z > 0) {
    return hyperg1F1_asymptotic(a, b, z)
  } else {
    // For z < 0, use Kummer's transformation
    // ₁F₁(a; b; z) = e^z · ₁F₁(b-a; b; -z)
    return Math.exp(z) * hyperg1F1_series(b - a, b, -z)
  }
}
```

### Connection to Other Functions

```
erf(z) = 2z/√π · ₁F₁(1/2; 3/2; -z²)
Iᵥ(z) = (z/2)^v / Γ(v+1) · ₁F₁(v+1/2; 2v+1; 2z)  (modified Bessel)
Lₙ^(α)(z) = (n+α choose n) · ₁F₁(-n; α+1; z)     (Laguerre polynomials)
```

---

## Task 7: Hypergeometric 2F1 - Gauss Hypergeometric Function

### Definition

```
₂F₁(a, b; c; z) = Σ (a)ₙ(b)ₙ zⁿ / [(c)ₙ n!]   (n=0 to ∞)
```

**Convergence**: |z| < 1 (unit disk)

### Algorithm 1: Power Series (|z| < 0.9)

**Pseudocode**:
```typescript
function hyperg2F1_series(a: number, b: number, c: number, z: number): number {
  if (c === 0 || c === Math.floor(c) && c <= 0) {
    throw new Error('c must not be zero or negative integer')
  }
  if (Math.abs(z) >= 1) {
    throw new Error('Series diverges for |z| >= 1')
  }

  const MAX_ITER = 1000
  const EPS = 1e-15

  let sum = 1.0
  let term = 1.0

  for (let n = 1; n < MAX_ITER; n++) {
    term *= (a + n - 1) * (b + n - 1) * z / ((c + n - 1) * n)
    sum += term

    if (Math.abs(term) < EPS * Math.abs(sum)) break
    if (n === MAX_ITER - 1) {
      console.warn('2F1 series may not have converged')
    }
  }

  return sum
}
```

### Algorithm 2: Linear Transformations (for |z| > 0.5)

**Euler transformation** (|1-z| < 1):
```
₂F₁(a,b;c;z) = (1-z)^(-a) · ₂F₁(a, c-b; c; z/(z-1))
```

**For z near 1**:
```
₂F₁(a,b;c;z) = Γ(c)Γ(c-a-b) / [Γ(c-a)Γ(c-b)] · ₂F₁(a, b; a+b-c+1; 1-z)
              + (1-z)^(c-a-b) · Γ(c)Γ(a+b-c) / [Γ(a)Γ(b)]
                · ₂F₁(c-a, c-b; c-a-b+1; 1-z)
```

**Pseudocode**:
```typescript
function hyperg2F1_transform(a: number, b: number, c: number, z: number): number {
  // Choose transformation based on z

  if (Math.abs(z) < 0.5) {
    // Direct series
    return hyperg2F1_series(a, b, c, z)
  }
  else if (Math.abs(1 - z) < 0.5) {
    // Transform to 1-z
    const c_minus_a_minus_b = c - a - b

    if (Math.abs(c_minus_a_minus_b) < 1e-10) {
      // Use limiting form
      return hyperg2F1_at_unity(a, b, c)
    }

    const gamma_c = gamma(c)
    const gamma_diff = gamma(c_minus_a_minus_b)
    const gamma_c_minus_a = gamma(c - a)
    const gamma_c_minus_b = gamma(c - b)

    const term1 = gamma_c * gamma_diff / (gamma_c_minus_a * gamma_c_minus_b)
                * hyperg2F1_series(a, b, a + b - c + 1, 1 - z)

    const prefactor2 = Math.pow(1 - z, c_minus_a_minus_b)
    const term2 = prefactor2 * gamma_c * gamma(-c_minus_a_minus_b)
                / (gamma(a) * gamma(b))
                * hyperg2F1_series(c - a, c - b, c_minus_a_minus_b + 1, 1 - z)

    return term1 + term2
  }
  else if (z < 0) {
    // Transform z → z/(z-1)
    const prefactor = Math.pow(1 - z, -a)
    return prefactor * hyperg2F1_series(a, c - b, c, z / (z - 1))
  }
  else {
    // Use continued fraction or other method
    return hyperg2F1_continued_fraction(a, b, c, z)
  }
}
```

### Algorithm 3: Continued Fraction (for z near 1)

**Gauss continued fraction**:
```
₂F₁(a,b;c;z) / ₂F₁(a,b+1;c+1;z) = 1 / (1 + d₁z / (1 + d₂z / (1 + ...)))
```

where dₙ are specific coefficients.

### Special Values

```
₂F₁(a,b;c;0) = 1
₂F₁(a,b;c;1) = Γ(c)Γ(c-a-b) / [Γ(c-a)Γ(c-b)]   if Re(c-a-b) > 0
₂F₁(a,b;a;z) = (1-z)^(-b)
₂F₁(a,b;b;z) = (1-z)^(-a)
```

### Connection to Other Functions

```
(1-z)^(-a) = ₂F₁(a, 1; 1; z)                    (binomial)
arcsin(z) = z · ₂F₁(1/2, 1/2; 3/2; z²)          (arcsin)
Pₙ(z) = ₂F₁(-n, n+1; 1; (1-z)/2)               (Legendre)
Tₙ(z) = ₂F₁(-n, n; 1/2; (1-z)/2)               (Chebyshev)
```

---

## Task 8: Tricomi U - Confluent Hypergeometric Function

### Definition

**Tricomi function**:
```
U(a, b, z) = Γ(1-b) / Γ(a-b+1) · ₁F₁(a; b; z)
           + Γ(b-1) / Γ(a) · z^(1-b) · ₁F₁(a-b+1; 2-b; z)
```

**Alternative definition** (Kummer's second solution):
```
U(a, b, z) = π / [sin(πb) Γ(a-b+1) Γ(b)]
           · [₁F₁(a;b;z) / Γ(a) - z^(1-b) ₁F₁(a-b+1;2-b;z) / Γ(a-b+1)]
```

### Properties

- Independent solution to Kummer's equation (with ₁F₁)
- **Asymptotic behavior**: U(a,b,z) ~ z^(-a) as z → ∞
- **Connection**: For integer b, limit must be taken carefully

### Algorithm 1: Series Representation (small z)

```typescript
function tricomiU_series(a: number, b: number, z: number): number {
  if (z < 0) throw new Error('z must be non-negative')
  if (z === 0) {
    if (b > 1) return Infinity
    return gamma(1 - b) / gamma(a - b + 1)
  }

  // Use Tricomi's definition
  const gamma1_minus_b = gamma(1 - b)
  const gamma_a_minus_b_plus_1 = gamma(a - b + 1)
  const gamma_b_minus_1 = gamma(b - 1)
  const gamma_a = gamma(a)

  const term1 = gamma1_minus_b / gamma_a_minus_b_plus_1
              * hyperg1F1(a, b, z)

  const term2 = gamma_b_minus_1 / gamma_a
              * Math.pow(z, 1 - b)
              * hyperg1F1(a - b + 1, 2 - b, z)

  return term1 + term2
}
```

### Algorithm 2: Asymptotic Expansion (large z)

**Formula**:
```
U(a, b, z) ~ z^(-a) · Σ (a)ₙ(a-b+1)ₙ / (n! · (-z)^n)   (n=0 to ∞)
```

**Pseudocode**:
```typescript
function tricomiU_asymptotic(a: number, b: number, z: number): number {
  const MAX_TERMS = 50
  const EPS = 1e-15

  let sum = 1.0
  let term = 1.0

  for (let n = 1; n < MAX_TERMS; n++) {
    term *= (a + n - 1) * (a - b + 1 + n - 1) / (n * (-z))
    sum += term

    if (Math.abs(term) < EPS * Math.abs(sum)) break
  }

  return Math.pow(z, -a) * sum
}
```

### Algorithm 3: Recurrence Relations

**Forward recurrence** (in a):
```
U(a+1,b,z) = [(a-b+1)/a] · U(a,b,z) - (1/a) · z · U'(a,b,z)
```

**Contiguous relations**:
```
(b-1)U(a,b-1,z) = z·U(a,b+1,z) + (a-b+1)U(a,b,z)
```

### Algorithm 4: Combined Method

```typescript
function tricomiU(a: number, b: number, z: number): number {
  if (z < 0) throw new Error('z must be non-negative')

  // Special cases
  if (z === 0) {
    if (b > 1) return Infinity
    return gamma(1 - b) / gamma(a - b + 1)
  }

  // Choose method based on z
  const threshold = 10 + Math.abs(a) + Math.abs(b)

  if (z < threshold) {
    return tricomiU_series(a, b, z)
  } else {
    return tricomiU_asymptotic(a, b, z)
  }
}
```

### Connection to Other Functions

```
U(a, a+1, z) = z^(-a)
U(1/2, 1/2, z²) = e^(z²) · erfc(z)
Kᵥ(z) = √π (z/2)^v e^(-z) U(v+1/2, 2v+1, 2z)  (modified Bessel K)
```

---

## Task 9: Generalized pFq - Generalized Hypergeometric Function

### Definition

```
ₚFᵧ([a₁,...,aₚ]; [b₁,...,bᵧ]; z) = Σ (a₁)ₙ···(aₚ)ₙ zⁿ / [(b₁)ₙ···(bᵧ)ₙ n!]
```

**Convergence**:
- p ≤ q: Converges for all z (entire function)
- p = q+1: Converges for |z| < 1
- p > q+1: Diverges for all z ≠ 0 (unless terminates)

### Algorithm 1: Direct Series Summation

**Pseudocode**:
```typescript
function hypergPFQ(
  a_params: number[],
  b_params: number[],
  z: number
): number {
  const p = a_params.length
  const q = b_params.length

  // Check for zero or negative integer b parameters
  for (const b of b_params) {
    if (b <= 0 && b === Math.floor(b)) {
      throw new Error('b parameters must not be zero or negative integers')
    }
  }

  // Convergence check
  if (p > q + 1 && z !== 0) {
    // Check if series terminates (one a parameter is negative integer)
    const terminates = a_params.some(a => a <= 0 && a === Math.floor(a))
    if (!terminates) {
      throw new Error('Series diverges for p > q+1 unless it terminates')
    }
  }

  const MAX_ITER = 1000
  const EPS = 1e-15

  let sum = 1.0
  let term = 1.0

  for (let n = 1; n < MAX_ITER; n++) {
    // Update term: multiply by (a₁)ₙ···(aₚ)ₙ z / [(b₁)ₙ···(bᵧ)ₙ n]
    let numerator = 1.0
    for (const a of a_params) {
      numerator *= (a + n - 1)
    }

    let denominator = n
    for (const b of b_params) {
      denominator *= (b + n - 1)
    }

    term *= numerator * z / denominator
    sum += term

    // Convergence test
    if (Math.abs(term) < EPS * Math.abs(sum)) break

    // Termination test (for polynomial cases)
    if (term === 0) break
  }

  return sum
}
```

### Algorithm 2: Ratio Test for Termination

**Early termination** when series becomes polynomial:

```typescript
function hypergPFQ_withRatioTest(
  a_params: number[],
  b_params: number[],
  z: number
): number {
  const p = a_params.length
  const q = b_params.length

  const MAX_ITER = 1000
  const EPS = 1e-15
  const RATIO_THRESHOLD = 0.99  // for p=q+1, |z|<1

  let sum = 1.0
  let term = 1.0
  let prev_abs_term = 1.0

  for (let n = 1; n < MAX_ITER; n++) {
    let ratio = z / n

    for (const a of a_params) {
      ratio *= (a + n - 1)
    }
    for (const b of b_params) {
      ratio /= (b + n - 1)
    }

    term *= ratio
    sum += term

    const abs_term = Math.abs(term)

    // Convergence
    if (abs_term < EPS * Math.abs(sum)) break

    // Divergence detection (for p=q+1 near |z|=1)
    if (p === q + 1 && n > 50) {
      const term_ratio = abs_term / prev_abs_term
      if (term_ratio > RATIO_THRESHOLD) {
        console.warn('pFq may be diverging or converging slowly')
      }
    }

    prev_abs_term = abs_term

    // Exact termination
    if (term === 0) break
  }

  return sum
}
```

### Special Cases

```
₀F₀(;;z) = e^z
₀F₁(;b;z) = Γ(b) · (z/4)^((1-b)/2) · Iᵦ₋₁(2√z)  (Bessel I)
₁F₀(a;;z) = (1-z)^(-a)
₁F₁(a;b;z) = Kummer M function
₂F₁(a,b;c;z) = Gauss hypergeometric
₃F₂ = used in quantum mechanics, atomic physics
```

### Connection to Other Functions

```
Bessel J: Jᵥ(z) = (z/2)^v / Γ(v+1) · ₀F₁(; v+1; -z²/4)
Bessel I: Iᵥ(z) = (z/2)^v / Γ(v+1) · ₀F₁(; v+1; z²/4)
Error function: erf(z) = 2z/√π · ₁F₁(1/2; 3/2; -z²)
```

---

## Task 10: Carlson Symmetric Elliptic Integrals

### Overview

**Carlson's symmetric forms** are numerically superior to classical Legendre forms:
- No singularities in parameter space
- Symmetric in arguments
- Efficient duplication algorithm
- Better numerical stability

### RF - Symmetric Integral of the First Kind

**Definition**:
```
RF(x, y, z) = (1/2) ∫₀^∞ dt / √[(t+x)(t+y)(t+z)]
```

**Duplication Theorem**:
```
RF(x,y,z) = RF((x+λ)/4, (y+λ)/4, (z+λ)/4)
where λ = √x·√y + √y·√z + √z·√x
```

**Algorithm**:
```typescript
function carlsonRF(x: number, y: number, z: number): number {
  const EPS = 1e-15
  const ERRTOL = 0.001  // error tolerance for Taylor series
  const C1 = 1.0 / 24.0
  const C2 = 0.1
  const C3 = 3.0 / 44.0
  const C4 = 1.0 / 14.0

  // Handle special cases
  if (x < 0 || y < 0 || z < 0) {
    throw new Error('Arguments must be non-negative')
  }
  if (x + y === 0 || y + z === 0 || z + x === 0) {
    throw new Error('At most one argument can be zero')
  }

  let xn = x, yn = y, zn = z
  let A0 = (x + y + z) / 3
  let An = A0
  let Q = Math.pow(3 * EPS, -1/6)
        * Math.max(Math.abs(A0 - x), Math.abs(A0 - y), Math.abs(A0 - z))
  let pow4 = 1.0

  // Duplication iteration
  while (true) {
    const sqrt_x = Math.sqrt(xn)
    const sqrt_y = Math.sqrt(yn)
    const sqrt_z = Math.sqrt(zn)
    const lambda = sqrt_x * sqrt_y + sqrt_y * sqrt_z + sqrt_z * sqrt_x

    An = (An + lambda) / 4
    xn = (xn + lambda) / 4
    yn = (yn + lambda) / 4
    zn = (zn + lambda) / 4
    pow4 *= 4

    if (pow4 * Q < Math.abs(An)) break
  }

  // Taylor series for small deviations
  const X = (A0 - x) / (An * pow4)
  const Y = (A0 - y) / (An * pow4)
  const Z = -(X + Y)

  const E2 = X * Y - Z * Z
  const E3 = X * Y * Z

  return (1 + (C1 * E2 - C2 - C3 * E3) * E2 + C4 * E3) / Math.sqrt(An)
}
```

**Convergence**: Quadratic, typically 3-5 iterations.

### RD - Symmetric Integral of the Second Kind

**Definition**:
```
RD(x, y, z) = (3/2) ∫₀^∞ dt / [(t+z)·√[(t+x)(t+y)(t+z)]]
```

**Duplication Theorem**:
```
RD(x,y,z) = 4·RD((x+λ)/4, (y+λ)/4, (z+λ)/4) + 6/(√z·(z+λ))
```

**Algorithm**:
```typescript
function carlsonRD(x: number, y: number, z: number): number {
  const EPS = 1e-15
  const ERRTOL = 0.001
  const C1 = 3.0 / 14.0
  const C2 = 1.0 / 6.0
  const C3 = 9.0 / 22.0
  const C4 = 3.0 / 26.0

  if (x < 0 || y < 0 || z <= 0) {
    throw new Error('x, y must be non-negative; z must be positive')
  }
  if (x + y === 0 || x + z === 0 || y + z === 0) {
    throw new Error('At most one of x, y can be zero')
  }

  let xn = x, yn = y, zn = z
  let A0 = (x + y + 3 * z) / 5
  let An = A0
  let sum = 0.0
  let pow4 = 1.0
  let Q = Math.pow(0.25 * EPS, -1/6)
        * Math.max(Math.abs(A0 - x), Math.abs(A0 - y), Math.abs(A0 - z))

  // Duplication iteration
  while (true) {
    const sqrt_x = Math.sqrt(xn)
    const sqrt_y = Math.sqrt(yn)
    const sqrt_z = Math.sqrt(zn)
    const lambda = sqrt_x * sqrt_y + sqrt_y * sqrt_z + sqrt_z * sqrt_x

    sum += 1 / (pow4 * sqrt_z * (zn + lambda))

    An = (An + lambda) / 4
    xn = (xn + lambda) / 4
    yn = (yn + lambda) / 4
    zn = (zn + lambda) / 4
    pow4 *= 4

    if (pow4 * Q < Math.abs(An)) break
  }

  // Taylor series
  const X = (A0 - x) / (An * pow4)
  const Y = (A0 - y) / (An * pow4)
  const Z = -(X + Y) / 3

  const E2 = X * Y - 6 * Z * Z
  const E3 = (3 * X * Y - 8 * Z * Z) * Z
  const E4 = 3 * (X * Y - Z * Z) * Z * Z
  const E5 = X * Y * Z * Z * Z

  return (1 - C1 * E2 + C2 * E3 + C3 * E2 * E2
         - C4 * (E4 + E5 - E2 * E3)) / (Math.pow(An, 1.5) * pow4)
         + 3 * sum
}
```

### RJ - Symmetric Integral of the Third Kind

**Definition**:
```
RJ(x, y, z, p) = (3/2) ∫₀^∞ dt / [(t+p)·√[(t+x)(t+y)(t+z)]]
```

**Duplication Theorem**:
```
RJ(x,y,z,p) = 4·RJ((x+λ)/4, (y+λ)/4, (z+λ)/4, (p+λ)/4)
            + 6·RC(1, 1 + δ/d²) / d
where λ = √x·√y + √y·√z + √z·√x
      δ = (√p + √x)(√p + √y)(√p + √z)
      d = √p
```

**Algorithm**:
```typescript
function carlsonRJ(x: number, y: number, z: number, p: number): number {
  const EPS = 1e-15
  const ERRTOL = 0.001
  const C1 = 3.0 / 14.0
  const C2 = 1.0 / 3.0
  const C3 = 3.0 / 22.0
  const C4 = 3.0 / 26.0

  if (x < 0 || y < 0 || z < 0) {
    throw new Error('x, y, z must be non-negative')
  }
  if (p === 0) {
    throw new Error('p must be non-zero')
  }

  let xn = x, yn = y, zn = z, pn = p
  let A0 = (x + y + z + 2 * p) / 5
  let An = A0
  let delta = (p - x) * (p - y) * (p - z)
  let sum = 0.0
  let pow4 = 1.0
  let Q = Math.pow(0.25 * EPS, -1/6)
        * Math.max(Math.abs(A0 - x), Math.abs(A0 - y),
                   Math.abs(A0 - z), Math.abs(A0 - p))

  // Duplication iteration
  while (true) {
    const sqrt_x = Math.sqrt(xn)
    const sqrt_y = Math.sqrt(yn)
    const sqrt_z = Math.sqrt(zn)
    const sqrt_p = Math.sqrt(pn)
    const lambda = sqrt_x * sqrt_y + sqrt_y * sqrt_z + sqrt_z * sqrt_x

    const d = (sqrt_p + sqrt_x) * (sqrt_p + sqrt_y) * (sqrt_p + sqrt_z)
    const e = delta / (pow4 * pow4 * d * d)

    sum += carlsonRC(1, 1 + e) / (pow4 * d)

    An = (An + lambda) / 4
    xn = (xn + lambda) / 4
    yn = (yn + lambda) / 4
    zn = (zn + lambda) / 4
    pn = (pn + lambda) / 4
    pow4 *= 4

    if (pow4 * Q < Math.abs(An)) break
  }

  // Taylor series
  const X = (A0 - x) / (An * pow4)
  const Y = (A0 - y) / (An * pow4)
  const Z = (A0 - z) / (An * pow4)
  const P = -(X + Y + Z) / 2

  const E2 = X * Y + X * Z + Y * Z - 3 * P * P
  const E3 = X * Y * Z + 2 * P * (X * Y + X * Z + Y * Z) + 4 * P * P * P
  const E4 = (X * Y * Z + P * (X * Y + X * Z + Y * Z) + 2 * P * P * P) * P
  const E5 = X * Y * Z * P * P

  return (1 - C1 * E2 + C2 * E3 + C3 * E2 * E2
         - C4 * (E4 + E5 - E2 * E3)) / (Math.pow(An, 1.5) * pow4)
         + 6 * sum
}
```

### RC - Degenerate Case (Arctangent/Logarithm)

**Definition**:
```
RC(x, y) = (1/2) ∫₀^∞ dt / [(t+y)·√(t+x)]
```

**Closed forms**:
```
RC(x, y) = arctan(√[(x-y)/y]) / √(x-y)           if x > y > 0
RC(x, y) = arccos(√[y/x]) / √(x-y)               if x > y > 0
RC(x, y) = arctanh(√[(y-x)/y]) / √(y-x)          if y > x > 0
RC(x, x) = 1 / √x
```

**Algorithm**:
```typescript
function carlsonRC(x: number, y: number): number {
  if (x < 0 || y === 0) {
    throw new Error('Invalid arguments for RC')
  }

  // Handle special cases
  if (x === y) return 1 / Math.sqrt(x)

  const EPS = 1e-15
  const ERRTOL = 0.001

  if (Math.abs(x - y) < EPS * x) {
    // Use series for x ≈ y
    return 1 / Math.sqrt(x) * (1 + (x - y) / (2 * x) + ...)
  }

  let xn = x, yn = y
  let An = (x + 2 * y) / 3
  let Q = Math.pow(3 * EPS, -1/6) * Math.abs(An - x)
  let pow4 = 1.0

  // Duplication iteration
  while (pow4 * Q >= Math.abs(An)) {
    const sqrt_x = Math.sqrt(xn)
    const sqrt_y = Math.sqrt(yn)
    const lambda = 2 * sqrt_x * sqrt_y + yn

    An = (An + lambda) / 4
    xn = (xn + lambda) / 4
    yn = (yn + lambda) / 4
    pow4 *= 4
  }

  // Taylor series
  const s = (y - x) / (3 * An * pow4)
  const s2 = s * s

  return (1 + s2 * (3 / 10 + s * (1 / 7 + s2 * (3 / 8 + s * 9 / 22))))
         / Math.sqrt(An)
}
```

### Conversions: Legendre ↔ Carlson

```typescript
// Complete elliptic integrals
function K_from_RF(k: number): number {
  return carlsonRF(0, 1 - k*k, 1)
}

function E_from_RF_RD(k: number): number {
  const k2 = k * k
  return carlsonRF(0, 1-k2, 1) - k2 * carlsonRD(0, 1-k2, 1) / 3
}

function Pi_from_RJ(n: number, k: number): number {
  const k2 = k * k
  return carlsonRF(0, 1-k2, 1) + n * carlsonRJ(0, 1-k2, 1, 1-n) / 3
}

// Incomplete elliptic integrals
function F_from_RF(phi: number, k: number): number {
  const s = Math.sin(phi)
  const c = Math.cos(phi)
  return s * carlsonRF(c*c, 1 - k*k*s*s, 1)
}

function E_incomplete_from_RF_RD(phi: number, k: number): number {
  const s = Math.sin(phi)
  const c = Math.cos(phi)
  const k2 = k * k
  const c2 = c * c
  const y = 1 - k2 * s * s

  return s * (carlsonRF(c2, y, 1) - k2 * s * s * carlsonRD(c2, y, 1) / 3)
}
```

---

## Implementation Guidelines

### Numerical Considerations

1. **Precision Management**:
   - Use `EPS = 2.220446049250313e-16` (machine epsilon for double)
   - Adaptive tolerance based on argument magnitudes
   - Watch for cancellation in series (use Kahan summation if needed)

2. **Convergence Criteria**:
   - AGM: |aₙ - bₙ| < ε·aₙ
   - Series: |term| < ε·|sum|
   - Carlson: Use error bounds from DLMF or Carlson (1995)

3. **Range Reduction**:
   - Use periodicity for Jacobi elliptic functions
   - Use transformations for 2F1 when |z| > 0.5
   - Use Kummer transformation for 1F1 when z < 0

4. **Special Values**:
   - Hardcode common special values (k=0, k=1, z=0, etc.)
   - Use asymptotic expansions for extreme arguments

### Error Handling

```typescript
// Example error handling strategy
function validateEllipticModulus(k: number, functionName: string): void {
  if (!isFinite(k)) {
    throw new Error(`${functionName}: k must be finite`)
  }
  if (k < 0 || k >= 1) {
    throw new Error(`${functionName}: k must be in [0, 1)`)
  }
}

function validateComplexArgument(z: number, functionName: string): void {
  if (!isFinite(z)) {
    throw new Error(`${functionName}: argument must be finite`)
  }
}
```

### Testing Strategy

1. **Special values**: k=0, k=1, z=0, integer parameters
2. **Known relations**: Legendre relation, addition theorems
3. **Numerical stability**: Near singularities, large arguments
4. **Cross-validation**: Compare Legendre vs Carlson forms
5. **Reference implementations**: GSL, SciPy, Boost, DLMF

### Performance Optimization

1. **Method selection**:
   ```typescript
   function selectHypergeometricMethod(a, b, c, z) {
     if (Math.abs(z) < 0.5) return 'series'
     if (Math.abs(1-z) < 0.5) return 'transform_near_1'
     if (z < 0) return 'euler_transform'
     return 'continued_fraction'
   }
   ```

2. **Caching**: For repeated calls with same modulus
3. **SIMD/WASM**: Vectorize AGM iterations, series summations
4. **Parallelization**: Independent function evaluations

### References

**Key Papers**:
1. Carlson, B.C. (1995). "Numerical computation of real or complex elliptic integrals." *Numerical Algorithms* 10, 13-26.
2. Fukushima, T. (2011). "Fast computation of complete elliptic integrals and Jacobian elliptic functions." *Celestial Mechanics* 105, 305-328.
3. Pearson, J.W. et al. (2017). "Numerical methods for the computation of the confluent and Gauss hypergeometric functions." *Numerical Algorithms* 74, 821-866.

**Standard References**:
- DLMF: https://dlmf.nist.gov/ (Chapters 19, 15, 13)
- Abramowitz & Stegun, *Handbook of Mathematical Functions*
- Gradshteyn & Ryzhik, *Table of Integrals, Series, and Products*

---

## WASM Integration Strategy

### TypeScript Implementation Pattern

```typescript
// src-wasm/elliptic/ellipticK.ts
export function ellipticK(k: f64): f64 {
  if (k < 0 || k >= 1) return NaN
  if (k === 0) return Math.PI / 2

  const EPS: f64 = 2.220446049250313e-16
  const k_prime = Math.sqrt(1 - k * k)

  let a: f64 = 1.0
  let b: f64 = k_prime

  while (Math.abs(a - b) > EPS * a) {
    const a_new = (a + b) / 2
    const b_new = Math.sqrt(a * b)
    a = a_new
    b = b_new
  }

  return Math.PI / (2 * a)
}

// Export for WASM
export { ellipticK, ellipticE, ellipticF }
```

### JavaScript Wrapper

```javascript
// src/function/elliptic/ellipticK.js
import { factory } from '../../utils/factory.js'
import { isNumber } from '../../utils/is.js'

export const createEllipticK = factory('ellipticK', ['typed', 'config'],
({ typed, config }) => {
  // Try to load WASM version
  let wasmEllipticK = null
  if (config.wasm && config.wasm.enabled) {
    try {
      wasmEllipticK = loadWasmFunction('ellipticK')
    } catch (e) {
      console.warn('WASM ellipticK not available, using JS fallback')
    }
  }

  return typed('ellipticK', {
    'number': (k) => {
      if (wasmEllipticK && k >= 0 && k < 1) {
        return wasmEllipticK(k)
      }
      return ellipticK_js(k)  // JS fallback
    }
  })
})

// Pure JS implementation
function ellipticK_js(k) {
  // ... implementation as shown above
}
```

---

## Task Prioritization

### Phase 8.1 (High Priority)
1. **Carlson RF, RD, RC** - Foundation for all elliptic integrals
2. **Elliptic K, E** (complete) - Most commonly used
3. **Hypergeometric 1F1** - Used in many special functions

### Phase 8.2 (Medium Priority)
4. **Incomplete F, E** - Engineering applications
5. **Jacobi sn, cn, dn** - Physics simulations
6. **Carlson RJ** - For Π computation

### Phase 8.3 (Lower Priority)
7. **Hypergeometric 2F1** - Complex but essential
8. **Tricomi U** - Quantum mechanics
9. **Elliptic Π** - Specialized applications
10. **Generalized pFq** - Research/advanced use

---

## Testing and Validation

### Test Cases for Elliptic K

```typescript
describe('ellipticK', () => {
  it('special values', () => {
    expect(ellipticK(0)).toBeCloseTo(Math.PI / 2, 15)
    expect(ellipticK(1)).toBe(Infinity)
    expect(ellipticK(0.5)).toBeCloseTo(1.8540746773013719, 14)
  })

  it('Legendre relation', () => {
    const k = 0.7
    const k_prime = Math.sqrt(1 - k*k)
    const K = ellipticK(k)
    const Kp = ellipticK(k_prime)
    const E = ellipticE(k)
    const Ep = ellipticE(k_prime)

    // E·K' + E'·K - K·K' = π/2
    expect(E*Kp + Ep*K - K*Kp).toBeCloseTo(Math.PI/2, 12)
  })

  it('agrees with Carlson RF', () => {
    const k = 0.6
    const K1 = ellipticK(k)
    const K2 = carlsonRF(0, 1-k*k, 1)
    expect(K1).toBeCloseTo(K2, 14)
  })
})
```

### Benchmark Targets

- **Elliptic K, E**: < 100 ns (AGM, 4-5 iterations)
- **Jacobi sn, cn, dn**: < 200 ns (AGM descent)
- **Carlson RF, RD**: < 150 ns (duplication algorithm)
- **Hypergeometric 1F1**: 100-1000 ns (depends on arguments)
- **Hypergeometric 2F1**: 500-5000 ns (depends on convergence)

---

## Summary

This phase implements 10 critical special function families spanning:
- Complete and incomplete elliptic integrals (classical and modern forms)
- Jacobi elliptic functions with AGM-based evaluation
- Confluent and Gauss hypergeometric functions
- Generalized hypergeometric series
- Carlson's symmetric elliptic integrals (numerically superior)

**Key Algorithms**:
- Arithmetic-Geometric Mean (AGM) for elliptic integrals
- Landen transformations for Jacobi functions
- Duplication theorem for Carlson functions
- Series, asymptotic, and recurrence methods for hypergeometric functions

**Expected Performance**: 2-10x speedup with WASM, up to 25x with parallel evaluation for arrays.

**Completion Criteria**:
- [ ] All 10 function families implemented in TypeScript
- [ ] WASM compilation successful
- [ ] JavaScript fallbacks functional
- [ ] Test coverage > 95%
- [ ] Numerical accuracy within 1e-14 relative error
- [ ] Documentation complete with examples
- [ ] Integration with existing mathjs factory system
