# Phase 3: Probability Distributions (Part 1 - Continuous)

**Complete Implementation Guide with Algorithms, Formulas, and Pseudocode**

---

## Overview

This document provides detailed mathematical formulas, numerical algorithms, approximation coefficients, and complete implementation pseudocode for 10 continuous probability distributions. Each distribution includes PDF, CDF, inverse CDF (quantile function), and random sampling methods optimized for numerical stability and performance.

**Performance Targets:**
- JavaScript baseline: Current performance
- WASM: 3-8x speedup for complex distributions
- Parallel: Additional 2-3x for batch operations

**Numerical Precision:**
- Relative error < 10⁻¹² for double precision
- Special handling for extreme parameter values
- Graceful degradation for edge cases

---

## Task 3.1: Normal Distribution

### Mathematical Foundation

**Probability Density Function (PDF):**
```
φ(x; μ, σ) = (1 / (σ√(2π))) * exp(-(x - μ)² / (2σ²))
```

Where:
- μ = mean (location parameter)
- σ = standard deviation (scale parameter, σ > 0)
- Standard normal: μ = 0, σ = 1

**Cumulative Distribution Function (CDF):**
```
Φ(x; μ, σ) = (1/2) * [1 + erf((x - μ) / (σ√2))]
```

Standard normal CDF:
```
Φ(z) = (1/2) * [1 + erf(z / √2)]
```

### Inverse CDF (Quantile Function)

**Rational Approximation Method (Abramowitz & Stegun 26.2.23)**

For 0 < p < 1, compute Φ⁻¹(p):

**Algorithm:**
1. If p > 0.5, use symmetry: Φ⁻¹(p) = -Φ⁻¹(1 - p)
2. For 0 < p ≤ 0.5:

```
t = sqrt(-2 * ln(p))

numerator = c₀ + c₁*t + c₂*t²
denominator = 1 + d₁*t + d₂*t² + d₃*t³

x = t - numerator / denominator
```

**Coefficients (Abramowitz & Stegun):**
```
c₀ = 2.515517
c₁ = 0.802853
c₂ = 0.010328

d₁ = 1.432788
d₂ = 0.189269
d₃ = 0.001308
```

**Refined Method (Acklam's Algorithm for higher precision):**

For p ∈ (0.02425, 0.97575):
```
q = p - 0.5
r = q²

x = q * (a₀ + a₁*r + a₂*r² + a₃*r³ + a₄*r⁴ + a₅*r⁵) /
        (1 + b₁*r + b₂*r² + b₃*r³ + b₄*r⁴ + b₅*r⁵)
```

**Acklam Coefficients:**
```
a₀ = -3.969683028665376e+01
a₁ =  2.209460984245205e+02
a₂ = -2.759285104469687e+02
a₃ =  1.383577518672690e+02
a₄ = -3.066479806614716e+01
a₅ =  2.506628277459239e+00

b₁ = -5.447609879822406e+01
b₂ =  1.615858368580409e+02
b₃ = -1.556989798598866e+02
b₄ =  6.680131188771972e+01
b₅ = -1.328068155288572e+01
```

For tails (p < 0.02425 or p > 0.97575):
```
if p < 0.5:
    q = sqrt(-2 * ln(p))
else:
    q = sqrt(-2 * ln(1 - p))

x = (c₀ + c₁*q + c₂*q² + c₃*q³ + c₄*q⁴ + c₅*q⁵ + c₆*q⁶) /
    (1 + d₁*q + d₂*q² + d₃*q³ + d₄*q⁴ + d₅*q⁵ + d₆*q⁶)

if p > 0.5: x = -x
```

**Tail Coefficients:**
```
c₀ = -7.784894002430293e-03
c₁ = -3.223964580411365e-01
c₂ = -2.400758277161838e+00
c₃ = -2.549732539343734e+00
c₄ =  4.374664141464968e+00
c₅ =  2.938163982698783e+00
c₆ =  0.0

d₁ =  7.784695709041462e-03
d₂ =  3.224671290700398e-01
d₃ =  2.445134137142996e+00
d₄ =  3.754408661907416e+00
d₅ =  0.0
d₆ =  0.0
```

### Random Sampling

**Method 1: Box-Muller Transform**

Generates two independent standard normal variates from two uniform variates.

```
Input: U₁, U₂ ~ Uniform(0, 1)
Output: Z₁, Z₂ ~ Normal(0, 1)

Algorithm:
    R = sqrt(-2 * ln(U₁))
    θ = 2π * U₂

    Z₁ = R * cos(θ)
    Z₂ = R * sin(θ)

    # Transform to N(μ, σ²):
    X₁ = μ + σ * Z₁
    X₂ = μ + σ * Z₂
```

**Method 2: Marsaglia Polar Method (improved Box-Muller)**

Avoids trigonometric functions:

```
Algorithm:
    repeat:
        U₁ = Uniform(-1, 1)
        U₂ = Uniform(-1, 1)
        S = U₁² + U₂²
    until S < 1 and S > 0

    multiplier = sqrt(-2 * ln(S) / S)
    Z₁ = U₁ * multiplier
    Z₂ = U₂ * multiplier

    X₁ = μ + σ * Z₁
    X₂ = μ + σ * Z₂
```

**Method 3: Ziggurat Algorithm (fastest)**

Rejection sampling with optimized rectangular layers.

```
Constants:
    R = 3.442619855899  // Right tail start
    V = 0.00991256303526217  // Area under each rectangle
    N = 128  // Number of layers

    // Precomputed tables (x[], y[], k[])
    x[0] = 3.7130862467403632609
    x[i] = sqrt(-2 * ln(V / x[i-1] + exp(-x[i-1]² / 2)))  for i = 1..N-1

    y[i] = exp(-x[i]² / 2)

    k[i] = floor((x[i-1] / x[i]) * 2³²)

Algorithm ziggurat_normal():
    loop:
        # Generate random 32-bit integer
        j = random_uint32()

        # Extract index (7 bits) and sign
        i = j & 0x7F  # Low 7 bits
        sign = j & 0x80  # 8th bit

        # Generate U in [0, 1)
        U = 0.5 + (j >> 8) * (1.0 / 2²⁴)

        # Generate candidate x
        x = U * x[i]

        # Fast acceptance test
        if j < k[i]:
            return sign ? -x : x

        # Layer 0: tail
        if i == 0:
            loop:
                x = -ln(uniform()) / R
                y = -ln(uniform())
                if 2*y > x²:
                    return sign ? -(R + x) : (R + x)

        # Slow acceptance test
        if y[i+1] + uniform() * (y[i] - y[i+1]) < exp(-x² / 2):
            return sign ? -x : x
```

**Ziggurat Precomputed Tables (N=128):**

```c
// x values (layer boundaries)
static const double x[129] = {
    3.7130862467403632609, 3.4426198558099, 3.2230849845786997,
    3.0832976611832, 2.9776639359279, 2.8919132923036,
    2.8195413982051, 2.7571960119204, 2.7025010004547,
    2.6539306039671, 2.6104503380391, 2.5712321208367,
    2.5356671247124, 2.5032889159989, 2.4736903611401,
    2.4465249987369, 2.4215024758456, 2.3983742193382,
    // ... (complete table omitted for brevity)
    0.0
};

// y values (exp(-x²/2))
static const double y[129] = {
    0.0, 0.00099125630352622177, 0.0019798283941624038,
    // ... (complete table)
};

// k values (floor((x[i-1]/x[i]) * 2^32))
static const uint32_t k[128] = {
    0, 12590644, 14272753, 14988545, 15384333,
    // ... (complete table)
};
```

### Complete Pseudocode

```javascript
class NormalDistribution {
    constructor(mu = 0, sigma = 1) {
        this.mu = mu
        this.sigma = sigma
        this.spare = null  // For Box-Muller
    }

    pdf(x) {
        const z = (x - this.mu) / this.sigma
        return (1 / (this.sigma * sqrt(2 * PI))) *
               exp(-z * z / 2)
    }

    cdf(x) {
        const z = (x - this.mu) / (this.sigma * SQRT2)
        return 0.5 * (1 + erf(z))
    }

    quantile(p) {
        if (p <= 0 || p >= 1) {
            throw new Error("p must be in (0, 1)")
        }

        let x

        // Acklam's algorithm
        if (p >= 0.02425 && p <= 0.97575) {
            // Central region
            const q = p - 0.5
            const r = q * q
            x = q * this.rational(r, ACKLAM_A, ACKLAM_B)
        } else {
            // Tails
            const q = p < 0.5 ? sqrt(-2 * ln(p)) : sqrt(-2 * ln(1 - p))
            x = this.rational(q, ACKLAM_C, ACKLAM_D)
            if (p > 0.5) x = -x
        }

        // Refine with one Newton iteration
        const e = this.cdf(x) - p
        const u = e * sqrt(2 * PI) * exp(x * x / 2)
        x = x - u

        return this.mu + this.sigma * x
    }

    rational(t, num_coeffs, den_coeffs) {
        let num = num_coeffs[0]
        let den = 1

        for (let i = 1; i < num_coeffs.length; i++) {
            num = num * t + num_coeffs[i]
        }

        for (let i = 0; i < den_coeffs.length; i++) {
            den = den * t + den_coeffs[i]
        }

        return num / den
    }

    random() {
        // Box-Muller with spare value caching
        if (this.spare !== null) {
            const val = this.spare
            this.spare = null
            return this.mu + this.sigma * val
        }

        let u, v, s
        do {
            u = 2 * Math.random() - 1
            v = 2 * Math.random() - 1
            s = u * u + v * v
        } while (s >= 1 || s === 0)

        const multiplier = sqrt(-2 * ln(s) / s)
        this.spare = v * multiplier
        return this.mu + this.sigma * u * multiplier
    }
}
```

---

## Task 3.2: Student's t Distribution

### Mathematical Foundation

**Probability Density Function:**
```
f(x; ν) = [Γ((ν+1)/2) / (√(νπ) * Γ(ν/2))] * (1 + x²/ν)^(-(ν+1)/2)
```

Where:
- ν = degrees of freedom (ν > 0)
- Γ = gamma function

**Cumulative Distribution Function:**

Using incomplete beta function:
```
For x ≥ 0:
    F(x; ν) = 1 - (1/2) * I(ν/(ν+x²); ν/2, 1/2)

For x < 0:
    F(x; ν) = (1/2) * I(ν/(ν+x²); ν/2, 1/2)
```

Where I(z; a, b) is the regularized incomplete beta function.

**Alternative CDF formulation:**
```
F(x; ν) = 1/2 + x * Γ((ν+1)/2) / (√(νπ) * Γ(ν/2)) *
          ₂F₁(1/2, (ν+1)/2; 3/2; -x²/ν)
```

### Inverse CDF (Quantile Function)

**Hill's Algorithm (1970) with Newton refinement:**

```
Input: p ∈ (0, 1), ν > 0
Output: t such that F(t; ν) = p

Algorithm:
    # Use normal approximation for large ν
    if ν > 1000:
        return normal_quantile(p)

    # Initial approximation
    if ν == 1:  # Cauchy distribution
        return tan(π * (p - 0.5))

    if ν == 2:
        return sqrt(2) * (2*p - 1) / sqrt(2*p*(1-p))

    # For general ν, use Wilson-Hilferty approximation
    a = 1 / (ν - 0.5)
    b = 48 / (a * a)
    c = ((20700 * a / b - 98) * a - 16) * a + 96.36
    d = ((94.5 / (b + c) - 3) / b + 1) * sqrt(a * PI / 2) * ν

    z = normal_quantile(p)
    y = z^(2/ν)

    if y > 0.05 + a:
        # Large y
        x = normal_quantile(0.5 * (1 + sign(p - 0.5)))
        y = x * x

        if ν < 5:
            c = c + 0.3 * (ν - 4.5) * (x + 0.6)

        c = (((0.05 * d * x - 5) * x - 7) * x - 2) * x + b + c
        y = (((((0.4 * y + 6.3) * y + 36) * y + 94.5) / c - y - 3) / b + 1) * x
        y = a * y * y

        if y > 0.002:
            y = exp(y) - 1
        else:
            y = 0.5 * y * y + y
    else:
        # Small y
        y = ((1 / (((ν + 6) / (ν * y) - 0.089 * d - 0.822) *
             (ν + 2) * 3) + 0.5 / (ν + 4)) * y - 1) *
             (ν + 1) / (ν + 2) + 1 / y

    t = sqrt(ν * y)
    if p < 0.5:
        t = -t

    # Newton refinement (1-2 iterations)
    for iter in 1..2:
        error = cdf(t, ν) - p
        if abs(error) < 1e-14:
            break
        derivative = pdf(t, ν)
        t = t - error / derivative

    return t
```

**Alternative: Beta approximation for small ν:**

```
For ν ≤ 20:
    if p > 0.5:
        q = 2 * (1 - p)
        sign = 1
    else:
        q = 2 * p
        sign = -1

    # Solve using incomplete beta inverse
    beta_val = inverse_beta(q, ν/2, 0.5)
    t = sign * sqrt(ν * (1 - beta_val) / beta_val)

    return t
```

### Random Sampling

**Method 1: Ratio of Normal and Chi-Square**

Based on the definition: T = Z / sqrt(V/ν), where Z ~ N(0,1) and V ~ χ²(ν)

```
Algorithm t_random(ν):
    Z = standard_normal()
    V = chi_square(ν)

    return Z / sqrt(V / ν)
```

**Method 2: Direct via Chi-Square (more efficient)**

```
Algorithm t_random(ν):
    Z = standard_normal()

    # Generate χ² using gamma
    U = gamma(ν/2, 2)  # χ²(ν) = Gamma(ν/2, 2)

    return Z * sqrt(ν / U)
```

**Method 3: Kinderman-Monahan-Ramage (1977) - fastest**

Optimized rejection sampling for ν ≥ 3:

```
Algorithm KMR_t_random(ν):
    c = sqrt((ν + 1) / ν)

    loop:
        U = uniform(0, 1)
        V = uniform(0, 1)

        W = (2*U - 1) / V

        if W² ≤ (ν + 1) * (1 - V) / (ν + W² * V):
            return c * W
```

### Complete Pseudocode

```javascript
class StudentTDistribution {
    constructor(degreesOfFreedom) {
        if (degreesOfFreedom <= 0) {
            throw new Error("Degrees of freedom must be positive")
        }
        this.nu = degreesOfFreedom
        this.normalDist = new NormalDistribution(0, 1)
    }

    pdf(x) {
        const nu = this.nu
        const coefficient = gamma((nu + 1) / 2) /
                          (sqrt(nu * PI) * gamma(nu / 2))
        return coefficient * pow(1 + x*x / nu, -(nu + 1) / 2)
    }

    cdf(x) {
        const nu = this.nu

        if (nu === 1) {
            // Cauchy distribution
            return 0.5 + atan(x) / PI
        }

        if (nu === 2) {
            return 0.5 * (1 + x / sqrt(2 + x*x))
        }

        // General case using incomplete beta
        const t2 = x * x
        const beta_arg = nu / (nu + t2)
        const I_val = incompleteBeta(beta_arg, nu/2, 0.5)

        if (x >= 0) {
            return 1 - 0.5 * I_val
        } else {
            return 0.5 * I_val
        }
    }

    quantile(p) {
        if (p <= 0 || p >= 1) {
            throw new Error("p must be in (0, 1)")
        }

        const nu = this.nu

        // Use symmetry
        const sign = p < 0.5 ? -1 : 1
        const p_adj = p < 0.5 ? 2*p : 2*(1-p)

        // Special cases
        if (nu === 1) {
            return tan(PI * (p - 0.5))
        }

        if (nu === 2) {
            return sqrt(2) * (2*p - 1) / sqrt(2*p*(1-p))
        }

        // Large nu: use normal approximation
        if (nu > 1000) {
            return this.normalDist.quantile(p)
        }

        // Hill's algorithm (implemented above)
        let t = this.hillAlgorithm(p, nu)

        // Newton refinement
        for (let i = 0; i < 2; i++) {
            const err = this.cdf(t) - p
            if (Math.abs(err) < 1e-14) break
            t = t - err / this.pdf(t)
        }

        return t
    }

    random() {
        if (this.nu >= 3) {
            // KMR method
            const c = sqrt((this.nu + 1) / this.nu)

            while (true) {
                const U = Math.random()
                const V = Math.random()
                const W = (2*U - 1) / V

                if (W*W <= (this.nu + 1) * (1 - V) / (this.nu + W*W*V)) {
                    return c * W
                }
            }
        } else {
            // Ratio method
            const Z = this.normalDist.random()
            const U = gamma_random(this.nu / 2, 2)
            return Z * sqrt(this.nu / U)
        }
    }
}
```

---

## Task 3.3: Chi-Square Distribution

### Mathematical Foundation

The chi-square distribution is a special case of the gamma distribution:
```
χ²(k) = Gamma(k/2, 2)
```

**Probability Density Function:**
```
f(x; k) = (1 / (2^(k/2) * Γ(k/2))) * x^(k/2 - 1) * exp(-x/2)
```

For x > 0, where k = degrees of freedom (k > 0).

**Standard form:**
```
f(x; k) = x^(k/2 - 1) * exp(-x/2) / (2^(k/2) * Γ(k/2))
```

**Cumulative Distribution Function:**
```
F(x; k) = γ(k/2, x/2) / Γ(k/2) = P(k/2, x/2)
```

Where:
- γ(a, x) = lower incomplete gamma function
- P(a, x) = regularized lower incomplete gamma function

### Inverse CDF (Quantile Function)

**Wilson-Hilferty Approximation (initial guess):**

```
For k ≥ 1:
    z = normal_quantile(p)
    x₀ = k * (1 - 2/(9*k) + z * sqrt(2/(9*k)))³
```

**Newton-Raphson Refinement:**

```
Algorithm chi_square_quantile(p, k):
    # Initial guess
    z = normal_quantile(p)

    if k == 1:
        # Special case: χ²(1) = Z²
        return z * z

    if k == 2:
        # Special case: χ²(2) = -2*ln(1-p)
        return -2 * ln(1 - p)

    # Wilson-Hilferty approximation
    h = 2 / (9 * k)
    x = k * pow(1 - h + z * sqrt(h), 3)

    # Ensure x > 0
    if x <= 0:
        x = 0.001

    # Newton-Raphson iterations
    max_iter = 10
    for i in 1..max_iter:
        # Current CDF value
        F_x = lower_incomplete_gamma(k/2, x/2) / gamma(k/2)

        # Error
        error = F_x - p

        if abs(error) < 1e-12:
            break

        # Derivative (PDF)
        f_x = pow(x, k/2 - 1) * exp(-x/2) / (pow(2, k/2) * gamma(k/2))

        # Newton update
        x = x - error / f_x

        # Keep x positive
        if x <= 0:
            x = 0.001

    return x
```

**Alternative: Direct incomplete gamma inversion**

```
Algorithm chi_square_quantile_gamma(p, k):
    # Use incomplete gamma inverse
    y = inverse_incomplete_gamma(k/2, p)
    return 2 * y
```

### Random Sampling

**Method 1: Sum of Squared Normals (for small k)**

By definition: If Z₁, ..., Zₖ ~ N(0,1) independent, then Σᵢ Zᵢ² ~ χ²(k)

```
Algorithm chi_square_random_small(k):
    if k is not integer:
        use gamma method

    sum = 0
    for i in 1..k:
        Z = standard_normal()
        sum += Z * Z

    return sum
```

**Method 2: Gamma Distribution (general, most efficient)**

```
Algorithm chi_square_random(k):
    # χ²(k) = Gamma(k/2, 2)
    return gamma_random(k/2, 2)
```

**Method 3: For k = 1 (optimized)**

```
Algorithm chi_square_1():
    Z = standard_normal()
    return Z * Z
```

**Method 4: For k = 2 (exponential)**

```
Algorithm chi_square_2():
    # χ²(2) = Exponential(1/2)
    return -2 * ln(uniform(0, 1))
```

**Method 5: Non-integer k using gamma**

For non-integer degrees of freedom:

```
Algorithm chi_square_random_nonint(k):
    # Use Marsaglia-Tsang gamma
    return 2 * gamma_random(k/2, 1)
```

### Complete Pseudocode

```javascript
class ChiSquareDistribution {
    constructor(degreesOfFreedom) {
        if (degreesOfFreedom <= 0) {
            throw new Error("Degrees of freedom must be positive")
        }
        this.k = degreesOfFreedom
        this.gammaShape = degreesOfFreedom / 2
        this.gammaScale = 2
    }

    pdf(x) {
        if (x <= 0) return 0

        const k = this.k
        const coeff = 1 / (pow(2, k/2) * gamma(k/2))
        return coeff * pow(x, k/2 - 1) * exp(-x/2)
    }

    cdf(x) {
        if (x <= 0) return 0

        // P(k/2, x/2) = regularized lower incomplete gamma
        return regularizedGammaP(this.k/2, x/2)
    }

    quantile(p) {
        if (p <= 0 || p >= 1) {
            throw new Error("p must be in (0, 1)")
        }

        const k = this.k

        // Special cases
        if (k === 1) {
            const z = normal_quantile(p)
            return z * z
        }

        if (k === 2) {
            return -2 * ln(1 - p)
        }

        // Wilson-Hilferty approximation as initial guess
        const z = normal_quantile(p)
        const h = 2 / (9 * k)
        let x = k * pow(1 - h + z * sqrt(h), 3)

        if (x <= 0) x = 0.01

        // Newton-Raphson refinement
        for (let iter = 0; iter < 10; iter++) {
            const F_x = this.cdf(x)
            const error = F_x - p

            if (Math.abs(error) < 1e-12) break

            const f_x = this.pdf(x)
            if (f_x > 0) {
                x = x - error / f_x
                if (x <= 0) x = 0.01
            }
        }

        return x
    }

    random() {
        // Optimized for special cases
        if (this.k === 1) {
            const z = standard_normal()
            return z * z
        }

        if (this.k === 2) {
            return -2 * Math.log(1 - Math.random())
        }

        // For small integer k, sum of squared normals
        if (this.k <= 10 && Number.isInteger(this.k)) {
            let sum = 0
            for (let i = 0; i < this.k; i++) {
                const z = standard_normal()
                sum += z * z
            }
            return sum
        }

        // General case: use gamma distribution
        return gamma_random(this.gammaShape, this.gammaScale)
    }
}
```

**Relationship to Other Distributions:**

```
1. Sum property: χ²(k₁) + χ²(k₂) = χ²(k₁ + k₂) (independent)

2. Relation to normal: If Z ~ N(0,1), then Z² ~ χ²(1)

3. Relation to gamma: χ²(k) = Gamma(k/2, 2)

4. Relation to exponential: χ²(2) = Exponential(1/2)

5. Central limit theorem:
   (χ²(k) - k) / sqrt(2k) → N(0,1) as k → ∞
```

---

## Task 3.4: F Distribution

### Mathematical Foundation

**Probability Density Function:**

The F distribution is the ratio of two independent chi-square variables divided by their degrees of freedom:

```
f(x; d₁, d₂) = [Γ((d₁+d₂)/2) / (Γ(d₁/2) * Γ(d₂/2))] *
               (d₁/d₂)^(d₁/2) * x^(d₁/2 - 1) *
               (1 + (d₁/d₂)*x)^(-(d₁+d₂)/2)
```

For x > 0, where:
- d₁ = numerator degrees of freedom (d₁ > 0)
- d₂ = denominator degrees of freedom (d₂ > 0)

**Simplified form:**
```
f(x; d₁, d₂) = sqrt[(d₁*x)^d₁ * d₂^d₂ / (d₁*x + d₂)^(d₁+d₂)] / (x * B(d₁/2, d₂/2))
```

Where B(a,b) is the beta function.

**Cumulative Distribution Function:**

Using the incomplete beta function:

```
F(x; d₁, d₂) = I(d₁*x / (d₁*x + d₂); d₁/2, d₂/2)
```

Where I(z; a, b) is the regularized incomplete beta function.

### Inverse CDF (Quantile Function)

The F quantile can be found by inverting the incomplete beta relationship:

```
Algorithm f_quantile(p, d1, d2):
    # Special case: d1 = 1, d2 = 1 (special F(1,1))
    if d1 == 1 and d2 == 1:
        return tan(PI * p / 2)²

    # Use incomplete beta inverse
    # F(x) = I(d1*x/(d1*x+d2); d1/2, d2/2) = p
    # Let w = d1*x/(d1*x+d2), then solve I(w; d1/2, d2/2) = p

    w = inverse_incomplete_beta(p, d1/2, d2/2)

    # Solve for x: w = d1*x/(d1*x+d2)
    # w*(d1*x + d2) = d1*x
    # w*d1*x + w*d2 = d1*x
    # w*d2 = d1*x - w*d1*x = d1*x*(1-w)
    # x = w*d2 / (d1*(1-w))

    if w >= 1:
        return Infinity

    x = (w * d2) / (d1 * (1 - w))

    return x
```

**Alternative Newton-Raphson approach:**

```
Algorithm f_quantile_newton(p, d1, d2):
    # Initial guess using Wilson-Hilferty
    z = normal_quantile(p)

    # Approximation for initial guess
    A = 2 / (9 * d1)
    B = 2 / (9 * d2)

    w = (1 - B + z * sqrt(B))³ / (1 - A + z * sqrt(A))³

    if d2 > 2:
        x = w
    else:
        x = max(0.01, w)

    # Newton iterations
    for iter in 1..10:
        F_x = cdf(x, d1, d2)
        error = F_x - p

        if abs(error) < 1e-12:
            break

        f_x = pdf(x, d1, d2)
        if f_x > 0:
            x = x - error / f_x
            x = max(0.001, x)  # Keep positive

    return x
```

### Random Sampling

**Method 1: Ratio of Chi-Squares (definition-based)**

By definition: F(d₁, d₂) = (U₁/d₁) / (U₂/d₂), where U₁ ~ χ²(d₁), U₂ ~ χ²(d₂)

```
Algorithm f_random(d1, d2):
    U1 = chi_square_random(d1)
    U2 = chi_square_random(d2)

    return (U1 / d1) / (U2 / d2)
```

**Method 2: Via Gamma (more efficient)**

Since χ²(k) = Gamma(k/2, 2):

```
Algorithm f_random_gamma(d1, d2):
    G1 = gamma_random(d1/2, 2)
    G2 = gamma_random(d2/2, 2)

    return (G1 / d1) / (G2 / d2)
```

**Method 3: Via Beta Distribution**

Relationship: If X ~ F(d₁, d₂), then Y = d₁X/(d₁X + d₂) ~ Beta(d₁/2, d₂/2)

```
Algorithm f_random_beta(d1, d2):
    B = beta_random(d1/2, d2/2)

    # Solve for X: B = d1*X/(d1*X + d2)
    # B*(d1*X + d2) = d1*X
    # B*d1*X + B*d2 = d1*X
    # B*d2 = d1*X*(1 - B)
    # X = B*d2 / (d1*(1-B))

    if B >= 1:
        return Infinity

    return (B * d2) / (d1 * (1 - B))
```

### Special Cases

**F(1, d₂) - Relation to t distribution:**
```
If T ~ t(d₂), then T² ~ F(1, d₂)
```

**F(d₁, d₂) reciprocal property:**
```
If X ~ F(d₁, d₂), then 1/X ~ F(d₂, d₁)
```

### Complete Pseudocode

```javascript
class FDistribution {
    constructor(d1, d2) {
        if (d1 <= 0 || d2 <= 0) {
            throw new Error("Degrees of freedom must be positive")
        }
        this.d1 = d1
        this.d2 = d2
    }

    pdf(x) {
        if (x <= 0) return 0

        const d1 = this.d1
        const d2 = this.d2

        const logNumerator = lgamma((d1 + d2) / 2) +
                            (d1/2) * log(d1/d2) +
                            (d1/2 - 1) * log(x)

        const logDenominator = lgamma(d1/2) + lgamma(d2/2) +
                              ((d1 + d2) / 2) * log(1 + d1*x/d2)

        return exp(logNumerator - logDenominator)
    }

    cdf(x) {
        if (x <= 0) return 0

        const d1 = this.d1
        const d2 = this.d2

        // Transform to beta
        const w = (d1 * x) / (d1 * x + d2)

        return regularizedIncompleteBeta(w, d1/2, d2/2)
    }

    quantile(p) {
        if (p <= 0 || p >= 1) {
            throw new Error("p must be in (0, 1)")
        }

        // Special cases
        if (this.d1 === 1 && this.d2 === 1) {
            return pow(tan(PI * p / 2), 2)
        }

        // Use beta inverse
        const w = inverseIncompleteBeta(p, this.d1/2, this.d2/2)

        if (w >= 1 - 1e-15) {
            return Infinity
        }

        const x = (w * this.d2) / (this.d1 * (1 - w))

        // Optional: Newton refinement for extreme accuracy
        let refined = x
        for (let i = 0; i < 2; i++) {
            const err = this.cdf(refined) - p
            if (Math.abs(err) < 1e-14) break

            const deriv = this.pdf(refined)
            if (deriv > 0) {
                refined = refined - err / deriv
                if (refined <= 0) refined = x
            }
        }

        return refined
    }

    random() {
        // Method: ratio of gammas (most efficient)
        const G1 = gamma_random(this.d1 / 2, 2)
        const G2 = gamma_random(this.d2 / 2, 2)

        return (G1 / this.d1) / (G2 / this.d2)
    }
}
```

**Numerical Stability Notes:**

```
1. For very large d1 or d2 (> 10^6):
   - Use asymptotic approximations
   - F(d1, ∞) → χ²(d1) / d1
   - F(∞, d2) → d2 / χ²(d2)

2. For x very large:
   - CDF → 1
   - Use complementary formulation for precision

3. For x very small:
   - CDF → 0
   - Direct series expansion may be more accurate
```

---

## Task 3.5: Beta Distribution

### Mathematical Foundation

**Probability Density Function:**
```
f(x; α, β) = [Γ(α+β) / (Γ(α) * Γ(β))] * x^(α-1) * (1-x)^(β-1)
           = x^(α-1) * (1-x)^(β-1) / B(α, β)
```

For 0 < x < 1, where:
- α > 0 (shape parameter)
- β > 0 (shape parameter)
- B(α, β) = Γ(α)Γ(β)/Γ(α+β) (beta function)

**Log PDF (for numerical stability):**
```
ln f(x; α, β) = (α-1)*ln(x) + (β-1)*ln(1-x) - ln B(α,β)
              = (α-1)*ln(x) + (β-1)*ln(1-x) +
                lgamma(α+β) - lgamma(α) - lgamma(β)
```

**Cumulative Distribution Function:**
```
F(x; α, β) = I_x(α, β) = B_x(α, β) / B(α, β)
```

Where:
- I_x(α, β) = regularized incomplete beta function
- B_x(α, β) = incomplete beta function

### Inverse CDF (Quantile Function)

**Newton-Raphson with Initial Guess:**

```
Algorithm beta_quantile(p, alpha, beta):
    if p <= 0: return 0
    if p >= 1: return 1

    # Initial guess using moment matching
    x0 = initial_guess(p, alpha, beta)

    x = x0
    max_iter = 20

    for iter in 1..max_iter:
        # Current CDF value
        F_x = incomplete_beta_reg(x, alpha, beta)

        # Error
        error = F_x - p

        if abs(error) < 1e-14 or abs(error) < 1e-10 * p:
            break

        # PDF value (derivative)
        f_x = pow(x, alpha-1) * pow(1-x, beta-1) / beta_function(alpha, beta)

        # Newton update
        dx = -error / f_x
        x = x + dx

        # Constrain to (0, 1)
        if x <= 0:
            x = x0 / 2
        elif x >= 1:
            x = (1 + x0) / 2

    # Final bounds check
    if x < 0: x = 0
    if x > 1: x = 1

    return x

Function initial_guess(p, alpha, beta):
    # Method 1: Normal approximation for large alpha, beta
    if alpha > 1 and beta > 1:
        mu = alpha / (alpha + beta)
        variance = (alpha * beta) / ((alpha + beta)² * (alpha + beta + 1))

        z = normal_quantile(p)
        x = mu + z * sqrt(variance)

        # Constrain
        if x < 0.01: x = 0.01
        if x > 0.99: x = 0.99

        return x

    # Method 2: Simple linear for uniform-like
    if abs(alpha - 1) < 0.1 and abs(beta - 1) < 0.1:
        return p

    # Method 3: Power function approximation
    if alpha < 1 and beta >= 1:
        return pow(p * beta_function(alpha, beta), 1/alpha)

    if beta < 1 and alpha >= 1:
        return 1 - pow((1-p) * beta_function(alpha, beta), 1/beta)

    # Default: use mean
    return alpha / (alpha + beta)
```

**Halley's Method (faster convergence):**

Uses second derivative for cubic convergence:

```
Algorithm beta_quantile_halley(p, alpha, beta):
    x = initial_guess(p, alpha, beta)

    for iter in 1..10:
        # CDF and PDF
        F = incomplete_beta_reg(x, alpha, beta)
        f = pow(x, alpha-1) * pow(1-x, beta-1) / beta_function(alpha, beta)

        error = F - p

        if abs(error) < 1e-14:
            break

        # Second derivative (derivative of PDF)
        f_prime = f * ((alpha-1)/x - (beta-1)/(1-x))

        # Halley update
        dx = -error / (f - 0.5 * error * f_prime / f)

        x = x + dx

        # Keep in bounds
        x = max(0.001, min(0.999, x))

    return max(0, min(1, x))
```

### Random Sampling

**Method 1: Johnk's Algorithm (for α + β < 1)**

Efficient rejection sampling for small shape parameters:

```
Algorithm johnk_beta(alpha, beta):
    # Only valid for alpha + beta < 1
    if alpha + beta >= 1:
        use different method

    loop:
        U = uniform(0, 1)
        V = uniform(0, 1)

        X = pow(U, 1/alpha)
        Y = pow(V, 1/beta)

        if X + Y <= 1:
            return X / (X + Y)
```

**Method 2: Cheng's Algorithm (general, most efficient)**

For α, β > 1 (the most common case):

```
Algorithm cheng_beta(alpha, beta):
    # Preprocessing
    a = min(alpha, beta)
    b = max(alpha, beta)
    A = a + b
    B = sqrt((A - 2) / (2*a*b - A))
    C = a + 1/B

    loop:
        U1 = uniform(0, 1)
        U2 = uniform(0, 1)

        V = B * ln(U1 / (1 - U1))
        W = a * exp(V)

        # Acceptance test
        z = U1² * U2
        r = C*V - ln(4)
        s = a + r - W

        if s + 1 + ln(5) >= 5*z:
            # Quick accept
            X = W / (b + W)
            if alpha == a:
                return X
            else:
                return 1 - X

        if s >= ln(z):
            # Final accept
            X = W / (b + W)
            if alpha == a:
                return X
            else:
                return 1 - X
```

**Method 3: Ratio of Gammas (always works)**

Based on the relationship: If X ~ Gamma(α, 1) and Y ~ Gamma(β, 1), then X/(X+Y) ~ Beta(α, β)

```
Algorithm beta_random_gamma(alpha, beta):
    X = gamma_random(alpha, 1)
    Y = gamma_random(beta, 1)

    return X / (X + Y)
```

**Method 4: For special cases**

```
# Beta(1, 1) = Uniform(0, 1)
if alpha == 1 and beta == 1:
    return uniform(0, 1)

# Beta(0.5, 0.5) - arcsine distribution
if alpha == 0.5 and beta == 0.5:
    return sin²(PI * uniform(0, 1) / 2)

# Beta(a, 1) - power function
if beta == 1:
    return pow(uniform(0, 1), 1/alpha)

# Beta(1, b) - complementary power
if alpha == 1:
    return 1 - pow(uniform(0, 1), 1/beta)
```

**Algorithm Selection:**

```
Function beta_random(alpha, beta):
    # Special cases
    if alpha == 1 and beta == 1:
        return uniform(0, 1)

    if alpha == 1:
        return 1 - pow(uniform(0, 1), 1/beta)

    if beta == 1:
        return pow(uniform(0, 1), 1/alpha)

    # Johnk for small parameters
    if alpha < 1 and beta < 1 and alpha + beta < 1:
        return johnk_beta(alpha, beta)

    # Cheng for large parameters
    if alpha > 1 and beta > 1:
        return cheng_beta(alpha, beta)

    # Gamma ratio (general method)
    return beta_random_gamma(alpha, beta)
```

### Complete Pseudocode

```javascript
class BetaDistribution {
    constructor(alpha, beta) {
        if (alpha <= 0 || beta <= 0) {
            throw new Error("Shape parameters must be positive")
        }
        this.alpha = alpha
        this.beta = beta
    }

    pdf(x) {
        if (x <= 0 || x >= 1) return 0

        const a = this.alpha
        const b = this.beta

        // Use log for numerical stability
        const logPdf = (a - 1) * Math.log(x) +
                       (b - 1) * Math.log(1 - x) +
                       lgamma(a + b) - lgamma(a) - lgamma(b)

        return Math.exp(logPdf)
    }

    cdf(x) {
        if (x <= 0) return 0
        if (x >= 1) return 1

        return regularizedIncompleteBeta(x, this.alpha, this.beta)
    }

    quantile(p) {
        if (p <= 0) return 0
        if (p >= 1) return 1

        // Initial guess
        let x = this.initialGuess(p)

        // Newton-Raphson
        const maxIter = 20
        for (let iter = 0; iter < maxIter; iter++) {
            const F = this.cdf(x)
            const error = F - p

            if (Math.abs(error) < 1e-14) break

            const f = this.pdf(x)
            if (f > 0) {
                x = x - error / f

                // Keep in bounds
                if (x <= 0) x = 0.001
                if (x >= 1) x = 0.999
            }
        }

        return Math.max(0, Math.min(1, x))
    }

    initialGuess(p) {
        const a = this.alpha
        const b = this.beta

        // Large parameters: normal approximation
        if (a > 1 && b > 1) {
            const mu = a / (a + b)
            const variance = (a * b) / ((a + b) * (a + b) * (a + b + 1))
            const z = normal_quantile(p)
            let x = mu + z * Math.sqrt(variance)
            return Math.max(0.01, Math.min(0.99, x))
        }

        // Use mean
        return a / (a + b)
    }

    random() {
        const a = this.alpha
        const b = this.beta

        // Special cases
        if (a === 1 && b === 1) {
            return Math.random()
        }

        if (a === 1) {
            return 1 - Math.pow(Math.random(), 1/b)
        }

        if (b === 1) {
            return Math.pow(Math.random(), 1/a)
        }

        // Johnk for small parameters
        if (a < 1 && b < 1 && a + b < 1) {
            while (true) {
                const U = Math.random()
                const V = Math.random()
                const X = Math.pow(U, 1/a)
                const Y = Math.pow(V, 1/b)

                if (X + Y <= 1) {
                    return X / (X + Y)
                }
            }
        }

        // Cheng for large parameters
        if (a > 1 && b > 1) {
            return this.chengBeta()
        }

        // Gamma ratio (general)
        const X = gamma_random(a, 1)
        const Y = gamma_random(b, 1)
        return X / (X + Y)
    }

    chengBeta() {
        const alpha = this.alpha
        const beta = this.beta

        const a = Math.min(alpha, beta)
        const b = Math.max(alpha, beta)
        const A = a + b
        const B = Math.sqrt((A - 2) / (2*a*b - A))
        const C = a + 1/B

        while (true) {
            const U1 = Math.random()
            const U2 = Math.random()

            const V = B * Math.log(U1 / (1 - U1))
            const W = a * Math.exp(V)

            const z = U1 * U1 * U2
            const r = C * V - Math.log(4)
            const s = a + r - W

            if (s + 1 + Math.log(5) >= 5*z) {
                const X = W / (b + W)
                return alpha === a ? X : 1 - X
            }

            if (s >= Math.log(z)) {
                const X = W / (b + W)
                return alpha === a ? X : 1 - X
            }
        }
    }
}
```

**Mean and Variance:**
```
Mean: μ = α / (α + β)
Variance: σ² = αβ / [(α + β)² (α + β + 1)]
Mode (for α, β > 1): (α - 1) / (α + β - 2)
```

---

## Task 3.6: Exponential Distribution

### Mathematical Foundation

The exponential distribution is the simplest continuous distribution with "memoryless" property.

**Probability Density Function:**
```
f(x; λ) = λ * exp(-λx)    for x ≥ 0
```

Where λ > 0 is the rate parameter.

**Alternative parameterization (scale parameter β = 1/λ):**
```
f(x; β) = (1/β) * exp(-x/β)    for x ≥ 0
```

**Cumulative Distribution Function:**
```
F(x; λ) = 1 - exp(-λx)    for x ≥ 0
         = 0              for x < 0
```

**Survival function:**
```
S(x; λ) = 1 - F(x; λ) = exp(-λx)
```

### Inverse CDF (Quantile Function)

The exponential distribution has a closed-form inverse:

```
F⁻¹(p; λ) = -(1/λ) * ln(1 - p)    for 0 < p < 1
```

**Algorithm:**
```
Algorithm exponential_quantile(p, lambda):
    if p <= 0:
        return 0

    if p >= 1:
        return Infinity

    return -ln(1 - p) / lambda
```

**Alternative formulation (numerically equivalent):**
```
# Since 1-U ~ U for U ~ Uniform(0,1):
F⁻¹(p; λ) = -ln(p) / λ
```

This is actually preferred for random number generation as it avoids the subtraction.

### Random Sampling

**Method 1: Inverse Transform (optimal)**

Direct application of the inverse CDF:

```
Algorithm exponential_random(lambda):
    U = uniform(0, 1)
    return -ln(U) / lambda
```

**Why this is optimal:**
- Exact transformation
- No rejection
- Very fast (one logarithm)
- Numerically stable

**Method 2: Using (1-U) for numerical reasons**

```
Algorithm exponential_random_alt(lambda):
    U = uniform(0, 1)
    return -ln(1 - U) / lambda
```

Both methods are equivalent since U and 1-U have the same distribution.

**Method 3: Ziggurat (for high-performance applications)**

Similar to normal ziggurat, optimized for exponential:

```
Constants:
    r = 7.69711747013104972  // Right tail start
    v = 0.003949659822581572  // Area
    n = 256  // Number of layers

Algorithm ziggurat_exponential(lambda):
    loop:
        j = random_uint32()
        i = j & 0xFF  # Low 8 bits for layer

        x = j * x[i]  # Candidate value

        if j < k[i]:  # Fast acceptance
            return x / lambda

        if i == 0:  # Tail region
            return (r + exponential_random_slow(1)) / lambda

        # Slow acceptance test
        if y[i+1] + uniform() * (y[i] - y[i+1]) < exp(-x):
            return x / lambda
```

### Properties and Special Cases

**Memoryless Property:**
```
P(X > s + t | X > s) = P(X > t)

In other words:
exp(-λ(s+t)) / exp(-λs) = exp(-λt)
```

**Relation to Other Distributions:**

1. **Gamma**: Exponential(λ) = Gamma(1, 1/λ)
2. **Weibull**: Exponential(λ) = Weibull(1, 1/λ)
3. **Chi-square**: Exponential(1/2) = χ²(2)
4. **Minimum of exponentials**:
   ```
   If X₁, ..., Xₙ ~ Exp(λᵢ) independent, then
   min(X₁, ..., Xₙ) ~ Exp(Σᵢ λᵢ)
   ```

### Complete Pseudocode

```javascript
class ExponentialDistribution {
    constructor(rate = 1) {
        if (rate <= 0) {
            throw new Error("Rate parameter must be positive")
        }
        this.lambda = rate
    }

    pdf(x) {
        if (x < 0) return 0
        return this.lambda * Math.exp(-this.lambda * x)
    }

    cdf(x) {
        if (x < 0) return 0
        return 1 - Math.exp(-this.lambda * x)
    }

    quantile(p) {
        if (p <= 0) return 0
        if (p >= 1) return Infinity

        // Exact closed form
        return -Math.log(1 - p) / this.lambda
    }

    random() {
        // Inverse transform method
        // Use -log(U) instead of -log(1-U) to save one subtraction
        return -Math.log(Math.random()) / this.lambda
    }

    // Statistics
    mean() {
        return 1 / this.lambda
    }

    variance() {
        return 1 / (this.lambda * this.lambda)
    }

    standardDeviation() {
        return 1 / this.lambda
    }

    // Survival function (1 - CDF)
    survival(x) {
        if (x < 0) return 1
        return Math.exp(-this.lambda * x)
    }

    // Hazard function (constant for exponential)
    hazard(x) {
        if (x < 0) return 0
        return this.lambda
    }
}
```

**Alternative Parameterization (scale β = 1/λ):**

```javascript
class ExponentialDistributionScale {
    constructor(scale = 1) {
        if (scale <= 0) {
            throw new Error("Scale parameter must be positive")
        }
        this.beta = scale
    }

    pdf(x) {
        if (x < 0) return 0
        return (1 / this.beta) * Math.exp(-x / this.beta)
    }

    cdf(x) {
        if (x < 0) return 0
        return 1 - Math.exp(-x / this.beta)
    }

    quantile(p) {
        if (p <= 0) return 0
        if (p >= 1) return Infinity

        return -this.beta * Math.log(1 - p)
    }

    random() {
        return -this.beta * Math.log(Math.random())
    }

    mean() {
        return this.beta
    }

    variance() {
        return this.beta * this.beta
    }
}
```

**Numerical Notes:**

```
1. For very small λ (large mean):
   - exp(-λx) may underflow for large x
   - Use log-space computations if needed

2. For very large λ (small mean):
   - PDF may be huge at x=0
   - Ensure proper normalization

3. For p very close to 1:
   - ln(1-p) loses precision
   - Use ln1p(-p) if available: -ln1p(-p) / lambda

4. For p very close to 0:
   - -ln(p) is well-behaved
   - No special handling needed
```

---

## Task 3.7: Gamma Distribution

### Mathematical Foundation

**Probability Density Function:**
```
f(x; α, β) = (1 / (Γ(α) * β^α)) * x^(α-1) * exp(-x/β)
```

For x > 0, where:
- α > 0 (shape parameter)
- β > 0 (scale parameter)
- Γ(α) is the gamma function

**Alternative parameterization (rate θ = 1/β):**
```
f(x; α, θ) = (θ^α / Γ(α)) * x^(α-1) * exp(-θx)
```

**Log PDF (numerically stable):**
```
ln f(x; α, β) = (α-1)*ln(x) - x/β - α*ln(β) - ln(Γ(α))
```

**Cumulative Distribution Function:**
```
F(x; α, β) = γ(α, x/β) / Γ(α) = P(α, x/β)
```

Where:
- γ(α, x) = lower incomplete gamma function
- P(α, x) = regularized lower incomplete gamma function

### Inverse CDF (Quantile Function)

**Newton-Raphson with Wilson-Hilferty Initial Guess:**

```
Algorithm gamma_quantile(p, alpha, beta):
    if p <= 0: return 0
    if p >= 1: return Infinity

    # Special cases
    if alpha == 1:
        # Exponential distribution
        return -beta * ln(1 - p)

    # Wilson-Hilferty approximation for initial guess
    x0 = wilson_hilferty_guess(p, alpha, beta)

    x = x0
    max_iter = 20

    for iter in 1..max_iter:
        # Compute CDF using incomplete gamma
        F_x = regularized_gamma_P(alpha, x/beta)

        error = F_x - p

        if abs(error) < 1e-14:
            break

        # PDF (derivative)
        f_x = pow(x, alpha-1) * exp(-x/beta) / (gamma(alpha) * pow(beta, alpha))

        if f_x > 0:
            dx = -error / f_x
            x = x + dx

            if x <= 0:
                x = x0 / 2

    return max(0, x)

Function wilson_hilferty_guess(p, alpha, beta):
    # For alpha > 0, use Wilson-Hilferty transformation
    # Gamma(alpha, beta) ≈ beta * alpha * (1 - 1/(9*alpha) + z/(3*sqrt(alpha)))³

    if alpha < 0.1:
        # For very small alpha, use power approximation
        return beta * pow(-ln(1 - p), 1/alpha)

    z = normal_quantile(p)
    h = 1 / (9 * alpha)
    x = alpha * pow(1 - h + z * sqrt(h), 3)

    return beta * x

Function best_guess(p, alpha, beta):
    if alpha >= 1:
        return wilson_hilferty_guess(p, alpha, beta)
    else:
        # For alpha < 1, use improved approximation
        if p < 0.01:
            return beta * pow(p * gamma(alpha+1), 1/alpha)
        else:
            return wilson_hilferty_guess(p, alpha, beta)
```

### Random Sampling

**Algorithm Selection by Shape Parameter:**

```
Function gamma_random(alpha, beta):
    if alpha < 1:
        return gamma_small_shape(alpha, beta)
    elif alpha == 1:
        return exponential_random(beta)
    else:  # alpha > 1
        return marsaglia_tsang(alpha, beta)
```

**Method 1: Marsaglia-Tsang (2000) - For α > 1**

Most efficient general-purpose algorithm:

```
Algorithm marsaglia_tsang(alpha, beta):
    # Preprocessing
    d = alpha - 1/3
    c = 1 / sqrt(9 * d)

    loop:
        # Generate Z ~ N(0,1) and U ~ Uniform(0,1)
        Z = standard_normal()
        U = uniform(0, 1)

        V = (1 + c*Z)³

        # Quick rejection
        if V <= 0:
            continue

        # Acceptance test
        if ln(U) < 0.5*Z² + d - d*V + d*ln(V):
            return beta * d * V
```

**Detailed Marsaglia-Tsang with optimizations:**

```
Algorithm marsaglia_tsang_optimized(alpha, beta):
    d = alpha - 1/3
    c = 1 / sqrt(9 * d)
    c2 = c * c

    loop:
        # Generate proposals
        loop:
            Z = standard_normal()
            V = 1 + c * Z
            if V > 0:
                break

        V = V * V * V
        U = uniform(0, 1)
        Z2 = Z * Z

        # Fast acceptance (squeeze)
        if U < 1 - 0.0331 * Z2 * Z2:
            return beta * d * V

        # Log acceptance test
        if ln(U) < 0.5*Z2 + d*(1 - V + ln(V)):
            return beta * d * V
```

**Method 2: Ahrens-Dieter (1974) - For α < 1**

Efficient for small shape parameters:

```
Algorithm ahrens_dieter(alpha, beta):
    # Only for 0 < alpha < 1
    b = (E + alpha) / E  # E = exp(1) ≈ 2.71828

    loop:
        U1 = uniform(0, 1)
        P = b * U1

        if P <= 1:
            X = pow(P, 1/alpha)
            U2 = uniform(0, 1)

            if U2 <= exp(-X):
                return beta * X
        else:
            X = -ln((b - P) / alpha)
            U2 = uniform(0, 1)

            if U2 <= pow(X, alpha - 1):
                return beta * X
```

**Method 3: Johnk (1964) - For α + α' < 1**

When generating Gamma(α) and need Gamma(α'):

```
Algorithm johnk_gamma(alpha, beta):
    # Works when alpha < 1
    loop:
        U = uniform(0, 1)
        V = uniform(0, 1)

        X = pow(U, 1/alpha)
        Y = pow(V, 1/(1-alpha))

        if X + Y <= 1:
            E = exponential_random(1)
            return beta * X * E / (X + Y)
```

**Method 4: For Integer α (Erlang distribution)**

Sum of exponentials:

```
Algorithm gamma_integer_shape(k, beta):
    # For alpha = k (integer)
    # Gamma(k, beta) = sum of k independent Exp(1/beta)

    product = 1.0
    for i in 1..k:
        product *= uniform(0, 1)

    return -beta * ln(product)
```

### Special Cases and Optimizations

**α = 1: Exponential**
```
Gamma(1, β) = Exponential(β)
X = -β * ln(U)
```

**α = k/2 (integer k): Chi-Square**
```
Gamma(k/2, 2) = χ²(k)
```

**α = n (integer): Erlang**
```
Gamma(n, β) = Erlang(n, β) = sum of n Exp(β)
X = -β * ln(∏ᵢ Uᵢ)
```

### Complete Pseudocode

```javascript
class GammaDistribution {
    constructor(shape, scale = 1) {
        if (shape <= 0 || scale <= 0) {
            throw new Error("Shape and scale must be positive")
        }
        this.alpha = shape
        this.beta = scale
    }

    pdf(x) {
        if (x <= 0) return 0

        const a = this.alpha
        const b = this.beta

        // Log-space for numerical stability
        const logPdf = (a - 1) * Math.log(x) - x/b -
                       a * Math.log(b) - lgamma(a)

        return Math.exp(logPdf)
    }

    cdf(x) {
        if (x <= 0) return 0

        // P(alpha, x/beta)
        return regularizedGammaP(this.alpha, x / this.beta)
    }

    quantile(p) {
        if (p <= 0) return 0
        if (p >= 1) return Infinity

        const a = this.alpha
        const b = this.beta

        // Special case: Exponential
        if (a === 1) {
            return -b * Math.log(1 - p)
        }

        // Initial guess
        let x = this.wilsonHilfertyGuess(p)

        // Newton-Raphson
        for (let iter = 0; iter < 20; iter++) {
            const F = this.cdf(x)
            const error = F - p

            if (Math.abs(error) < 1e-14) break

            const f = this.pdf(x)
            if (f > 0) {
                x = x - error / f
                if (x <= 0) x = 0.001
            }
        }

        return Math.max(0, x)
    }

    wilsonHilfertyGuess(p) {
        const a = this.alpha
        const b = this.beta

        if (a < 0.1) {
            return b * Math.pow(-Math.log(1 - p), 1/a)
        }

        const z = normal_quantile(p)
        const h = 1 / (9 * a)
        const x = a * Math.pow(1 - h + z * Math.sqrt(h), 3)

        return b * Math.max(0.001, x)
    }

    random() {
        const a = this.alpha
        const b = this.beta

        // Special cases
        if (a === 1) {
            return -b * Math.log(Math.random())
        }

        if (Number.isInteger(a) && a <= 20) {
            // Erlang: sum of exponentials
            let product = 1
            for (let i = 0; i < a; i++) {
                product *= Math.random()
            }
            return -b * Math.log(product)
        }

        if (a < 1) {
            return this.ahrensDieter(a, b)
        }

        // General case: Marsaglia-Tsang
        return this.marsagliaTsang(a, b)
    }

    marsagliaTsang(alpha, beta) {
        const d = alpha - 1/3
        const c = 1 / Math.sqrt(9 * d)

        while (true) {
            let Z, V

            // Generate V = (1 + c*Z)³ > 0
            do {
                Z = standard_normal()
                V = 1 + c * Z
            } while (V <= 0)

            V = V * V * V
            const U = Math.random()
            const Z2 = Z * Z

            // Fast acceptance
            if (U < 1 - 0.0331 * Z2 * Z2) {
                return beta * d * V
            }

            // Log acceptance
            if (Math.log(U) < 0.5*Z2 + d*(1 - V + Math.log(V))) {
                return beta * d * V
            }
        }
    }

    ahrensDieter(alpha, beta) {
        const E = Math.E
        const b = (E + alpha) / E

        while (true) {
            const U1 = Math.random()
            const P = b * U1

            if (P <= 1) {
                const X = Math.pow(P, 1/alpha)
                const U2 = Math.random()

                if (U2 <= Math.exp(-X)) {
                    return beta * X
                }
            } else {
                const X = -Math.log((b - P) / alpha)
                const U2 = Math.random()

                if (U2 <= Math.pow(X, alpha - 1)) {
                    return beta * X
                }
            }
        }
    }

    // Statistics
    mean() {
        return this.alpha * this.beta
    }

    variance() {
        return this.alpha * this.beta * this.beta
    }

    mode() {
        if (this.alpha >= 1) {
            return (this.alpha - 1) * this.beta
        }
        return 0
    }
}
```

**Key Performance Notes:**

```
1. Marsaglia-Tsang is fastest for α > 1
   - Average: 1.3-1.5 iterations
   - No tables needed
   - Very efficient

2. Ahrens-Dieter works well for α < 1
   - Average: ~2 iterations
   - Simple implementation

3. For integer α, sum of exponentials is exact
   - Use log of product for numerical stability

4. For very large α (> 1000):
   - Use normal approximation
   - Gamma(α, β) ≈ N(αβ, αβ²)
```

---

## Task 3.8: Incomplete Gamma Function

The incomplete gamma functions are essential for computing CDFs of gamma, chi-square, and Poisson distributions.

### Definitions

**Lower Incomplete Gamma:**
```
γ(a, x) = ∫₀ˣ t^(a-1) e^(-t) dt
```

**Upper Incomplete Gamma:**
```
Γ(a, x) = ∫ₓ^∞ t^(a-1) e^(-t) dt
```

**Relationship:**
```
γ(a, x) + Γ(a, x) = Γ(a)
```

**Regularized Forms:**
```
P(a, x) = γ(a, x) / Γ(a)    # Regularized lower
Q(a, x) = Γ(a, x) / Γ(a)    # Regularized upper

P(a, x) + Q(a, x) = 1
```

### Series Expansion (for x < a + 1)

**For Lower Incomplete Gamma γ(a, x):**

```
γ(a, x) = e^(-x) * x^a * Σ(n=0 to ∞) [Γ(a) / Γ(a + n + 1)] * x^n
        = e^(-x) * x^a * [1/a + x/(a+1) + x²/(a+1)(a+2) + ...]
```

**Regularized form P(a, x):**
```
P(a, x) = [e^(-x) * x^a / Γ(a)] * Σ(n=0 to ∞) [x^n / (a)_(n+1)]

where (a)_n = a(a+1)(a+2)...(a+n-1) is the Pochhammer symbol
```

**Algorithm:**

```
Algorithm incomplete_gamma_series(a, x):
    # Only use for x < a + 1
    if x >= a + 1:
        return "use continued fraction"

    if x <= 0:
        return 0

    # Log of initial term: -x + a*ln(x) - ln(Γ(a))
    log_term = -x + a * ln(x) - lgamma(a)

    # Series computation
    sum = 1.0
    term = 1.0
    ap = a

    max_iter = 1000
    epsilon = 1e-15

    for n in 1..max_iter:
        ap += 1
        term *= x / ap
        sum += term

        if abs(term) < abs(sum) * epsilon:
            break

    # Return γ(a,x)
    return exp(log_term) * sum

Algorithm regularized_gamma_P_series(a, x):
    # Returns P(a, x) = γ(a, x) / Γ(a)

    if x <= 0:
        return 0

    # log(-x + a*ln(x) - ln(Γ(a))) = log(x^a * e^(-x) / Γ(a))
    log_prefix = -x + a * ln(x) - lgamma(a)

    sum = 1.0
    term = 1.0
    ap = a

    for n in 1..1000:
        ap += 1
        term *= x / ap
        sum += term

        if abs(term / sum) < 1e-15:
            break

    return exp(log_prefix) * sum
```

### Continued Fraction (for x > a + 1)

**For Upper Incomplete Gamma Γ(a, x):**

Using Lentz's method for continued fraction evaluation:

```
Γ(a, x) / Γ(a) = e^(-x) * x^a * 1 / [x + 1-a - 1(1-a)/(x+3-a-) 2(2-a)/(x+5-a-)...]
```

**Standard continued fraction form:**
```
e^(-x) * x^a / [x + (1-a)/1 + 1/x + (2-a)/1 + 2/x + (3-a)/1 + ...]
```

**More precisely:**
```
Q(a, x) = [e^(-x) * x^a] / CF(a, x)

where CF(a, x) = x + 1-a - (1)(1-a)/(x+3-a-) (2)(2-a)/(x+5-a-) ...
```

**Lentz's Algorithm:**

```
Algorithm incomplete_gamma_continued_fraction(a, x):
    # Only use for x >= a + 1
    if x < a + 1:
        return "use series"

    # Log of coefficient: -x + a*ln(x) - ln(Γ(a))
    log_coeff = -x + a * ln(x) - lgamma(a)

    # Lentz's method for continued fraction
    # CF = b₀ + a₁/(b₁ + a₂/(b₂ + a₃/(b₃ + ...)))

    # Modified Lentz algorithm
    tiny = 1e-30

    # Initial values for continued fraction
    # CF = x + (1-a) - 1*(1-a)/(x+3-a-) 2*(2-a)/(x+5-a-)...
    # Rewrite as: b₀ + a₁/b₁ + a₂/b₂ + ...
    # where aₙ = -n*(n-a), bₙ = x + 2n + 1 - a

    b = x + 1 - a
    c = 1 / tiny
    d = 1 / b
    h = d

    max_iter = 1000
    epsilon = 1e-15

    for i in 1..max_iter:
        an = -i * (i - a)
        b += 2

        d = an * d + b
        if abs(d) < tiny:
            d = tiny

        c = b + an / c
        if abs(c) < tiny:
            c = tiny

        d = 1 / d
        delta = c * d
        h *= delta

        if abs(delta - 1) < epsilon:
            break

    # Return Q(a, x) = Γ(a, x) / Γ(a)
    return exp(log_coeff) / h

Algorithm regularized_gamma_Q_cf(a, x):
    # Same as above, returns Q(a, x)
    return incomplete_gamma_continued_fraction(a, x)
```

### Combined Algorithm (automatic selection)

```
Algorithm regularized_incomplete_gamma_P(a, x):
    # Returns P(a, x) = γ(a, x) / Γ(a)

    if x < 0 or a <= 0:
        throw error

    if x == 0:
        return 0

    if x >= a + 1:
        # Use continued fraction for Q, then P = 1 - Q
        return 1 - regularized_gamma_Q_cf(a, x)
    else:
        # Use series for P
        return regularized_gamma_P_series(a, x)

Algorithm regularized_incomplete_gamma_Q(a, x):
    # Returns Q(a, x) = Γ(a, x) / Γ(a)

    if x < 0 or a <= 0:
        throw error

    if x == 0:
        return 1

    if x >= a + 1:
        # Use continued fraction for Q
        return regularized_gamma_Q_cf(a, x)
    else:
        # Use series for P, then Q = 1 - P
        return 1 - regularized_gamma_P_series(a, x)
```

### Inverse Incomplete Gamma

For finding x such that P(a, x) = p:

```
Algorithm inverse_regularized_gamma_P(a, p):
    # Find x such that P(a, x) = p

    if p <= 0:
        return 0
    if p >= 1:
        return Infinity

    # Initial guess
    if a > 1:
        # Use Wilson-Hilferty
        t = normal_quantile(p)
        s = 1 / (9 * a)
        x = a * pow(1 - s + t * sqrt(s), 3)
    else:
        # For small a
        t = pow(p * gamma(a + 1), 1/a)
        x = t

    # Halley's method (uses second derivative)
    for iter in 1..10:
        # Current P and error
        Px = regularized_incomplete_gamma_P(a, x)
        error = Px - p

        if abs(error) < 1e-12:
            break

        # First derivative: d/dx P(a,x) = x^(a-1) * e^(-x) / Γ(a)
        t = pow(x, a-1) * exp(-x) / gamma(a)

        if t == 0:
            break

        # Second derivative
        u = (a - 1) / x - 1

        # Halley update
        dx = -error / (t * (1 - 0.5 * error * u / t))
        x = x + dx

        if x <= 0:
            x = 0.5 * (x - dx)

    return max(0, x)
```

### Complete Pseudocode

```javascript
class IncompleteGamma {
    // Regularized lower incomplete gamma P(a, x)
    static P(a, x) {
        if (x < 0 || a <= 0) {
            throw new Error("Invalid parameters")
        }

        if (x === 0) return 0
        if (x === Infinity) return 1

        // Choose method based on x vs a
        if (x < a + 1) {
            return this.P_series(a, x)
        } else {
            return 1 - this.Q_continued_fraction(a, x)
        }
    }

    // Regularized upper incomplete gamma Q(a, x)
    static Q(a, x) {
        if (x < 0 || a <= 0) {
            throw new Error("Invalid parameters")
        }

        if (x === 0) return 1
        if (x === Infinity) return 0

        if (x >= a + 1) {
            return this.Q_continued_fraction(a, x)
        } else {
            return 1 - this.P_series(a, x)
        }
    }

    // Series expansion for P
    static P_series(a, x) {
        const logPrefix = -x + a * Math.log(x) - lgamma(a)

        let sum = 1.0
        let term = 1.0
        let ap = a

        for (let n = 1; n <= 1000; n++) {
            ap += 1
            term *= x / ap
            sum += term

            if (Math.abs(term / sum) < 1e-15) {
                break
            }
        }

        return Math.exp(logPrefix) * sum
    }

    // Continued fraction for Q (Lentz's method)
    static Q_continued_fraction(a, x) {
        const logCoeff = -x + a * Math.log(x) - lgamma(a)
        const tiny = 1e-30

        let b = x + 1 - a
        let c = 1 / tiny
        let d = 1 / b
        let h = d

        for (let i = 1; i <= 1000; i++) {
            const an = -i * (i - a)
            b += 2

            d = an * d + b
            if (Math.abs(d) < tiny) d = tiny

            c = b + an / c
            if (Math.abs(c) < tiny) c = tiny

            d = 1 / d
            const delta = c * d
            h *= delta

            if (Math.abs(delta - 1) < 1e-15) {
                break
            }
        }

        return Math.exp(logCoeff) / h
    }

    // Inverse: find x such that P(a, x) = p
    static inverseP(a, p) {
        if (p <= 0) return 0
        if (p >= 1) return Infinity

        // Initial guess
        let x
        if (a > 1) {
            const t = normal_quantile(p)
            const s = 1 / (9 * a)
            x = a * Math.pow(1 - s + t * Math.sqrt(s), 3)
        } else {
            x = Math.pow(p * gamma(a + 1), 1/a)
        }

        if (x <= 0) x = 0.001

        // Halley's method
        for (let iter = 0; iter < 10; iter++) {
            const Px = this.P(a, x)
            const error = Px - p

            if (Math.abs(error) < 1e-12) break

            const t = Math.pow(x, a-1) * Math.exp(-x) / gamma(a)
            if (t === 0) break

            const u = (a - 1) / x - 1
            const dx = -error / (t * (1 - 0.5 * error * u / t))

            x = x + dx
            if (x <= 0) x = 0.5 * (x - dx)
        }

        return Math.max(0, x)
    }
}
```

**Selection Criteria Summary:**

```
For P(a, x):
    if x < a + 1:
        Use series expansion (converges quickly)
    else:
        Compute Q(a, x) via continued fraction, return 1 - Q

For Q(a, x):
    if x >= a + 1:
        Use continued fraction (converges quickly)
    else:
        Compute P(a, x) via series, return 1 - P

Why this works:
    - Series converges fast when x < a + 1
    - Continued fraction converges fast when x >= a + 1
    - Using the complementary form avoids catastrophic cancellation
```

---

## Task 3.9: Weibull Distribution

### Mathematical Foundation

**Probability Density Function:**
```
f(x; λ, k) = (k/λ) * (x/λ)^(k-1) * exp(-(x/λ)^k)
```

For x ≥ 0, where:
- λ > 0 (scale parameter)
- k > 0 (shape parameter, also called Weibull modulus)

**Cumulative Distribution Function:**
```
F(x; λ, k) = 1 - exp(-(x/λ)^k)
```

For x ≥ 0.

**Survival Function:**
```
S(x; λ, k) = exp(-(x/λ)^k)
```

### Inverse CDF (Quantile Function)

The Weibull distribution has a **closed-form inverse**:

```
F⁻¹(p; λ, k) = λ * (-ln(1 - p))^(1/k)
```

**Algorithm:**
```
Algorithm weibull_quantile(p, lambda, k):
    if p <= 0:
        return 0

    if p >= 1:
        return Infinity

    return lambda * pow(-ln(1 - p), 1/k)
```

**Alternative formulation (numerically equivalent):**
```
# Using -ln(U) ~ Exp(1) for U ~ Uniform(0,1)
F⁻¹(p; λ, k) = λ * (-ln(p))^(1/k)
```

This avoids the subtraction and is preferred.

### Random Sampling

**Method 1: Inverse Transform (optimal)**

Direct application of inverse CDF:

```
Algorithm weibull_random(lambda, k):
    U = uniform(0, 1)
    return lambda * pow(-ln(U), 1/k)
```

**Why this is optimal:**
- Exact transformation
- No rejection
- Single logarithm and power operation
- Numerically stable

**Method 2: Alternative (using 1-U)**

```
Algorithm weibull_random_alt(lambda, k):
    U = uniform(0, 1)
    return lambda * pow(-ln(1 - U), 1/k)
```

Both are equivalent since U and 1-U have the same distribution.

### Special Cases

**k = 1: Exponential Distribution**
```
Weibull(λ, 1) = Exponential(1/λ)

f(x; λ, 1) = (1/λ) * exp(-x/λ)
X = λ * (-ln(U)) = -λ * ln(U)
```

**k = 2: Rayleigh Distribution**
```
Weibull(λ, 2) = Rayleigh(λ/√2)

f(x; λ, 2) = (2x/λ²) * exp(-(x/λ)²)
X = λ * sqrt(-ln(U))
```

**k = 3.5: Approximates Normal**
```
For k ≈ 3.5, Weibull approximates normal distribution
```

### Properties

**Hazard Function (failure rate):**
```
h(x; λ, k) = (k/λ) * (x/λ)^(k-1)
```

Behavior:
- k < 1: Decreasing failure rate
- k = 1: Constant failure rate (exponential)
- k > 1: Increasing failure rate

**Mean:**
```
μ = λ * Γ(1 + 1/k)
```

**Variance:**
```
σ² = λ² * [Γ(1 + 2/k) - Γ²(1 + 1/k)]
```

**Mode:**
```
For k > 1:
    mode = λ * ((k-1)/k)^(1/k)

For k ≤ 1:
    mode = 0
```

**Median:**
```
median = λ * (ln 2)^(1/k)
```

### Complete Pseudocode

```javascript
class WeibullDistribution {
    constructor(scale, shape) {
        if (scale <= 0 || shape <= 0) {
            throw new Error("Scale and shape must be positive")
        }
        this.lambda = scale
        this.k = shape
    }

    pdf(x) {
        if (x < 0) return 0
        if (x === 0 && this.k < 1) return Infinity
        if (x === 0 && this.k === 1) return 1 / this.lambda
        if (x === 0) return 0

        const z = x / this.lambda

        // For numerical stability, use log-space
        const logPdf = Math.log(this.k) - Math.log(this.lambda) +
                       (this.k - 1) * Math.log(z) -
                       Math.pow(z, this.k)

        return Math.exp(logPdf)
    }

    cdf(x) {
        if (x < 0) return 0

        const z = x / this.lambda
        return 1 - Math.exp(-Math.pow(z, this.k))
    }

    quantile(p) {
        if (p <= 0) return 0
        if (p >= 1) return Infinity

        // Closed form inverse
        return this.lambda * Math.pow(-Math.log(1 - p), 1 / this.k)
    }

    random() {
        // Inverse transform method (optimal for Weibull)
        const U = Math.random()
        return this.lambda * Math.pow(-Math.log(U), 1 / this.k)
    }

    // Survival function
    survival(x) {
        if (x < 0) return 1

        const z = x / this.lambda
        return Math.exp(-Math.pow(z, this.k))
    }

    // Hazard function
    hazard(x) {
        if (x < 0) return 0
        if (x === 0) {
            if (this.k < 1) return Infinity
            if (this.k === 1) return 1 / this.lambda
            return 0
        }

        const z = x / this.lambda
        return (this.k / this.lambda) * Math.pow(z, this.k - 1)
    }

    // Statistics
    mean() {
        return this.lambda * gamma(1 + 1/this.k)
    }

    variance() {
        const g1 = gamma(1 + 1/this.k)
        const g2 = gamma(1 + 2/this.k)
        return this.lambda * this.lambda * (g2 - g1 * g1)
    }

    standardDeviation() {
        return Math.sqrt(this.variance())
    }

    median() {
        return this.lambda * Math.pow(Math.log(2), 1/this.k)
    }

    mode() {
        if (this.k <= 1) {
            return 0
        }
        return this.lambda * Math.pow((this.k - 1) / this.k, 1/this.k)
    }
}
```

**Numerical Considerations:**

```
1. For very small x and k > 1:
   - PDF → 0
   - Use log-space to avoid underflow

2. For very large x:
   - CDF → 1
   - exp(-(x/λ)^k) underflows to 0
   - Survival function loses precision

3. For k very large:
   - Distribution becomes very peaked
   - pow() operation may overflow
   - Use log-space computations

4. For k very small (< 0.1):
   - Distribution heavily skewed
   - Use high-precision arithmetic if available

5. For numerical stability in CDF:
   - For small p: use CDF directly
   - For large p: use survival function
```

**Relationship to Other Distributions:**

```
1. Exponential: Weibull(λ, 1) = Exp(1/λ)

2. Rayleigh: Weibull(λ, 2) = Rayleigh(λ/√2)

3. Maximum of Gumbels:
   min(X₁, ..., Xₙ) for Xᵢ ~ Weibull → Gumbel

4. Power transform of exponential:
   If E ~ Exp(1), then (λE)^(1/k) ~ Weibull(λ, k)
```

---

## Task 3.10: Lognormal Distribution

### Mathematical Foundation

The lognormal distribution arises when ln(X) ~ Normal(μ, σ²).

**Probability Density Function:**
```
f(x; μ, σ) = (1 / (x σ √(2π))) * exp(-(ln(x) - μ)² / (2σ²))
```

For x > 0, where:
- μ = mean of ln(X) (location parameter, -∞ < μ < ∞)
- σ = standard deviation of ln(X) (scale parameter, σ > 0)

**Log PDF (numerically stable):**
```
ln f(x; μ, σ) = -ln(x) - ln(σ) - ½ln(2π) - (ln(x) - μ)² / (2σ²)
```

**Cumulative Distribution Function:**

Since ln(X) ~ N(μ, σ²):

```
F(x; μ, σ) = Φ((ln(x) - μ) / σ)
           = ½ * [1 + erf((ln(x) - μ) / (σ√2))]
```

Where Φ is the standard normal CDF.

### Inverse CDF (Quantile Function)

**Closed-form using normal quantile:**

```
F⁻¹(p; μ, σ) = exp(μ + σ * Φ⁻¹(p))
```

Where Φ⁻¹ is the standard normal quantile function.

**Algorithm:**
```
Algorithm lognormal_quantile(p, mu, sigma):
    if p <= 0:
        return 0

    if p >= 1:
        return Infinity

    # Get standard normal quantile
    z = normal_quantile(p)

    # Transform to lognormal
    return exp(mu + sigma * z)
```

This is **exact** - no iteration needed!

### Random Sampling

**Method 1: Exponential Transform of Normal (optimal)**

Direct transformation:

```
Algorithm lognormal_random(mu, sigma):
    Z = standard_normal()
    return exp(mu + sigma * Z)
```

**Why this is optimal:**
- Exact transformation
- No rejection
- Single normal sample + exp
- Numerically stable

**Method 2: Using general normal**

```
Algorithm lognormal_random_alt(mu, sigma):
    X = normal_random(mu, sigma)
    return exp(X)
```

**Method 3: Using Box-Muller for two samples**

Generate two lognormals simultaneously:

```
Algorithm lognormal_random_pair(mu, sigma):
    U1 = uniform(0, 1)
    U2 = uniform(0, 1)

    R = sqrt(-2 * ln(U1))
    theta = 2 * PI * U2

    Z1 = R * cos(theta)
    Z2 = R * sin(theta)

    X1 = exp(mu + sigma * Z1)
    X2 = exp(mu + sigma * Z2)

    return (X1, X2)
```

### Statistics and Properties

**Mean of Lognormal(μ, σ²):**
```
E[X] = exp(μ + σ²/2)
```

**Variance:**
```
Var(X) = [exp(σ²) - 1] * exp(2μ + σ²)
        = exp(2μ + σ²) * [exp(σ²) - 1]
```

**Median:**
```
median = exp(μ)
```

**Mode:**
```
mode = exp(μ - σ²)
```

**Geometric Mean:**
```
GM = exp(μ)
```

**Standard Deviation:**
```
SD = sqrt(Var(X)) = exp(μ + σ²/2) * sqrt(exp(σ²) - 1)
```

**Coefficient of Variation:**
```
CV = sqrt(exp(σ²) - 1)
```

### Parameter Estimation from Moments

If we know E[X] = m and Var(X) = v:

```
σ² = ln(1 + v/m²)
μ = ln(m) - σ²/2
```

**Algorithm:**
```
Algorithm fit_lognormal_from_moments(mean, variance):
    m = mean
    v = variance

    sigma_sq = ln(1 + v / (m * m))
    mu = ln(m) - sigma_sq / 2

    return (mu, sqrt(sigma_sq))
```

### Complete Pseudocode

```javascript
class LognormalDistribution {
    constructor(mu, sigma) {
        if (sigma <= 0) {
            throw new Error("Sigma must be positive")
        }
        this.mu = mu
        this.sigma = sigma
        this.normalDist = new NormalDistribution(mu, sigma)
    }

    pdf(x) {
        if (x <= 0) return 0

        const lnx = Math.log(x)
        const z = (lnx - this.mu) / this.sigma

        // For numerical stability
        const logPdf = -lnx - Math.log(this.sigma) -
                       0.5 * Math.log(2 * Math.PI) -
                       0.5 * z * z

        return Math.exp(logPdf)
    }

    cdf(x) {
        if (x <= 0) return 0

        const z = (Math.log(x) - this.mu) / this.sigma

        // Use standard normal CDF
        return 0.5 * (1 + erf(z / Math.SQRT2))
    }

    quantile(p) {
        if (p <= 0) return 0
        if (p >= 1) return Infinity

        // Exact: exp(μ + σ * Φ⁻¹(p))
        const z = normal_quantile(p)
        return Math.exp(this.mu + this.sigma * z)
    }

    random() {
        // Exact transformation
        const Z = standard_normal()
        return Math.exp(this.mu + this.sigma * Z)
    }

    // Statistics
    mean() {
        return Math.exp(this.mu + this.sigma * this.sigma / 2)
    }

    variance() {
        const s2 = this.sigma * this.sigma
        return (Math.exp(s2) - 1) * Math.exp(2*this.mu + s2)
    }

    standardDeviation() {
        return Math.sqrt(this.variance())
    }

    median() {
        return Math.exp(this.mu)
    }

    mode() {
        return Math.exp(this.mu - this.sigma * this.sigma)
    }

    geometricMean() {
        return Math.exp(this.mu)
    }

    coefficientOfVariation() {
        const s2 = this.sigma * this.sigma
        return Math.sqrt(Math.exp(s2) - 1)
    }

    // Fit from sample moments
    static fromMoments(mean, variance) {
        const m = mean
        const v = variance

        const sigma_sq = Math.log(1 + v / (m * m))
        const mu = Math.log(m) - sigma_sq / 2

        return new LognormalDistribution(mu, Math.sqrt(sigma_sq))
    }

    // Fit from sample data
    static fromData(data) {
        // Take log of all values
        const logData = data.map(x => Math.log(x))

        // Compute mean and variance of log data
        const n = logData.length
        const mu = logData.reduce((a, b) => a + b) / n

        const variance = logData.reduce((sum, x) =>
            sum + (x - mu) * (x - mu), 0) / (n - 1)

        const sigma = Math.sqrt(variance)

        return new LognormalDistribution(mu, sigma)
    }
}
```

### Multiplicative Central Limit Theorem

The lognormal arises naturally:

```
If X = X₁ * X₂ * ... * Xₙ where Xᵢ are positive i.i.d.,
then ln(X) = ln(X₁) + ln(X₂) + ... + ln(Xₙ)

By CLT: ln(X) → Normal
Therefore: X → Lognormal
```

### Numerical Considerations

```
1. For very small x:
   - ln(x) → -∞
   - PDF → 0
   - Use log-space to avoid underflow

2. For very large x:
   - ln(x) is large
   - CDF → 1
   - Use complementary normal CDF for precision

3. For σ very large:
   - Distribution very spread out
   - Mean >> median
   - Heavy right tail

4. For σ very small:
   - Distribution concentrated near exp(μ)
   - Approaches delta function at exp(μ)

5. Numerical stability for CDF:
   For x >> exp(μ):
       Use: 1 - Φ(-(ln(x) - μ)/σ)
       Instead of: Φ((ln(x) - μ)/σ)
```

### Applications

```
1. Finance: Stock prices, returns
2. Reliability: Time to failure
3. Biology: Cell sizes, reaction times
4. Environmental: Pollutant concentrations
5. Economics: Income distributions
```

### Relationship to Normal

```
If X ~ Lognormal(μ, σ²), then:
    ln(X) ~ Normal(μ, σ²)

If Y ~ Normal(μ, σ²), then:
    exp(Y) ~ Lognormal(μ, σ²)

This makes all computations reducible to normal distribution!
```

---

## Implementation Strategy for Math.js

### File Organization

```
src/function/probability/
├── distributions/
│   ├── normal.js              # Task 3.1
│   ├── studentt.js            # Task 3.2
│   ├── chisquare.js          # Task 3.3
│   ├── fdist.js              # Task 3.4
│   ├── beta.js               # Task 3.5
│   ├── exponential.js        # Task 3.6
│   ├── gamma.js              # Task 3.7
│   ├── weibull.js            # Task 3.8
│   └── lognormal.js          # Task 3.9
└── special/
    └── incompleteGamma.js    # Task 3.10 (helper)
```

### Shared Dependencies

All distributions need:

```javascript
// Common special functions
import { erf, erfc } from '../special/erf.js'
import { gamma, lgamma } from '../special/gamma.js'
import { incompleteBeta } from '../special/incompleteBeta.js'
import { incompleteGamma } from '../special/incompleteGamma.js'

// Normal distribution (used by many)
import { normalPdf, normalCdf, normalQuantile } from './distributions/normal.js'

// Random number generation
import { randomUniform } from '../../random/randomUniform.js'
import { randomNormal } from '../../random/randomNormal.js'
```

### Testing Requirements

For each distribution, test:

```javascript
describe('Distribution Tests', () => {
    // 1. PDF properties
    test('PDF integrates to 1')
    test('PDF non-negative')
    test('PDF matches known values')

    // 2. CDF properties
    test('CDF monotonic increasing')
    test('CDF(−∞) = 0, CDF(∞) = 1')
    test('CDF matches known values')

    // 3. Quantile properties
    test('Quantile inverts CDF')
    test('Quantile(0.5) = median')
    test('Quantile matches tables')

    // 4. Random sampling
    test('Sample mean converges')
    test('Sample variance converges')
    test('K-S test for distribution')

    // 5. Edge cases
    test('Extreme parameter values')
    test('Numerical stability')
    test('Special cases')
})
```

### Performance Benchmarks

```javascript
// Benchmark targets (WASM vs JS)
const benchmarks = {
    normal: {
        pdf: { js: '10M/s', wasm: '50M/s' },
        cdf: { js: '5M/s', wasm: '25M/s' },
        quantile: { js: '2M/s', wasm: '10M/s' },
        random: { js: '20M/s', wasm: '100M/s' }
    },
    // ... similar for other distributions
}
```

### WASM Implementation Priority

1. **High priority** (hot path, heavy compute):
   - Normal: Ziggurat random, erf-based CDF
   - Gamma: Marsaglia-Tsang, incomplete gamma
   - Beta: Cheng's algorithm, incomplete beta
   - Incomplete gamma/beta functions

2. **Medium priority**:
   - Student's t, Chi-square, F distribution
   - Numerical inversions (Newton-Raphson)

3. **Low priority** (already fast):
   - Exponential (closed form)
   - Weibull (closed form)
   - Lognormal (delegates to normal)

---

## References and Further Reading

1. **Abramowitz & Stegun** (1964). *Handbook of Mathematical Functions*
   - Standard reference for approximations

2. **Press et al.** (2007). *Numerical Recipes* (3rd ed.)
   - Practical algorithms and implementations

3. **Marsaglia & Tsang** (2000). "A Simple Method for Generating Gamma Variables"
   - Modern gamma sampling

4. **Acklam, P.J.** (2010). "An algorithm for computing the inverse normal CDF"
   - High-precision normal quantile

5. **Cheng, R.C.H.** (1978). "Generating Beta Variates with Nonintegral Shape Parameters"
   - Efficient beta sampling

6. **DiDonato & Morris** (1992). "Algorithm 708: Significant Digit Computation of the Incomplete Beta"
   - Accurate incomplete beta

7. **Boost C++ Libraries** - Math Toolkit
   - Reference implementation for validation

8. **NIST Digital Library of Mathematical Functions**
   - https://dlmf.nist.gov/
   - Comprehensive mathematical reference

---

## Document Metadata

- **Version**: 1.0
- **Date**: 2025-11-29
- **Status**: Implementation Ready
- **Target**: Math.js Phase 3 Refactoring
- **Dependencies**: Phase 1 (Special Functions), Phase 2 (Matrix Operations)
- **Estimated Effort**: 40-60 hours for all 10 tasks
- **Performance Target**: 3-8x speedup with WASM

---

**END OF DOCUMENT**
