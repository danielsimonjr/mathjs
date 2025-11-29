# Phase 4: Probability Distributions (Part 2 - Discrete & Additional)

## Overview

This phase implements discrete probability distributions and additional continuous distributions to complement Phase 3. These distributions are essential for statistical computing, hypothesis testing, and stochastic modeling.

**Status**: Not Started
**Dependencies**: Phase 3 (Continuous Distributions), Phase 1 (Special Functions)
**Estimated Complexity**: High
**Performance Target**: 3-8x speedup with WASM

---

## Task 4.1: Poisson Distribution

### Mathematical Formulas

**Probability Mass Function (PMF)**:
```
P(X = k) = (λ^k * e^(-λ)) / k!

where:
- k = 0, 1, 2, ... (non-negative integer)
- λ > 0 (rate parameter)
```

**Cumulative Distribution Function (CDF)**:
```
F(k) = P(X ≤ k) = Σ(i=0 to k) [(λ^i * e^(-λ)) / i!]
     = Γ(⌊k+1⌋, λ) / ⌊k+1⌋!  (using regularized incomplete gamma)
```

**Inverse CDF** (Quantile Function):
```
Q(p) = min{k : F(k) ≥ p}
```

### Algorithms

#### PMF Computation

**Method**: Direct computation with overflow prevention
```
Algorithm: poissonPMF(k, lambda)
Input: k (integer ≥ 0), lambda (rate > 0)
Output: P(X = k)

1. If k < 0: return 0
2. If lambda ≤ 0: error "lambda must be positive"

3. Special cases:
   - If lambda = 0: return (k = 0) ? 1 : 0
   - If k = 0: return exp(-lambda)

4. Use logarithmic computation to prevent overflow:
   log_pmf = k * log(lambda) - lambda - log_gamma(k + 1)

5. Return exp(log_pmf)

Numerical stability:
- For lambda > 700: use Normal approximation
- For very large k: use Stirling's approximation for log(k!)
```

#### CDF Computation

**Method**: Optimized summation with early termination
```
Algorithm: poissonCDF(k, lambda)
Input: k (integer), lambda (rate > 0)
Output: P(X ≤ k)

1. If k < 0: return 0
2. If lambda ≤ 0: error "lambda must be positive"

3. Special cases:
   - If lambda = 0: return 1
   - If k = 0: return exp(-lambda)

4. For large lambda (> 10), use regularized gamma:
   return gamma_inc_upper(floor(k + 1), lambda)

5. Otherwise, use direct summation:
   sum = 0
   term = exp(-lambda)  // P(X = 0)

   for i = 0 to k:
       sum += term
       if i < k:
           term *= lambda / (i + 1)

       // Early termination
       if term < sum * EPSILON:
           break

   return sum

Optimization:
- Start from mode if k > lambda
- Use recurrence: P(k) = P(k-1) * lambda / k
```

#### Inverse CDF (Quantile)

**Method**: Binary search with guided initialization
```
Algorithm: poissonInverseCDF(p, lambda)
Input: p ∈ [0, 1], lambda (rate > 0)
Output: smallest k such that P(X ≤ k) ≥ p

1. Validate:
   - If p < 0 or p > 1: error
   - If p = 0: return 0
   - If p = 1: return Infinity

2. Initial guess using Normal approximation:
   if lambda > 10:
       mu = lambda
       sigma = sqrt(lambda)
       k_init = floor(mu + sigma * norm_inv_cdf(p))
   else:
       k_init = floor(lambda)

3. Refine using binary search:
   k_low = 0
   k_high = max(k_init * 2, lambda + 10 * sqrt(lambda))

   while k_low < k_high:
       k_mid = floor((k_low + k_high) / 2)
       cdf_mid = poissonCDF(k_mid, lambda)

       if cdf_mid < p:
           k_low = k_mid + 1
       else:
           k_high = k_mid

4. Return k_low

Optimization:
- For lambda < 10: linear search from mode
- Cache CDF values during search
```

#### Random Sampling

**Method 1**: Inverse Transform (small λ)
```
Algorithm: poissonRandom_InverseTransform(lambda)
Input: lambda ≤ 10
Output: Random Poisson variate

1. L = exp(-lambda)
2. k = 0
3. p = 1

4. do:
       k = k + 1
       u = uniform(0, 1)
       p = p * u
   while p > L

5. return k - 1
```

**Method 2**: Ratio-of-Uniforms (large λ)
```
Algorithm: poissonRandom_RatioUniforms(lambda)
Input: lambda > 10
Output: Random Poisson variate

// PTRS (Poisson-Transformed Rejection Sampling)
1. Setup constants:
   smu = sqrt(lambda)
   b = 0.931 + 2.53 * smu
   a = -0.059 + 0.02483 * b
   inv_alpha = 1.1239 + 1.1328 / (b - 3.4)
   v_r = 0.9277 - 3.6224 / (b - 2)

2. Loop until acceptance:
   while true:
       u = uniform(0, 1) - 0.5
       v = uniform(0, 1)

       us = 0.5 - abs(u)
       k = floor((2 * a / us + b) * u + lambda + 0.43)

       // Quick acceptance
       if us >= 0.07919 and v <= v_r:
           return k

       if k < 0 or (us < 0.013 and v > us):
           continue

       // Logarithmic acceptance
       log_ratio = (k + 0.5) * log(lambda / k) - lambda - k + log(k)
                   - log(2 * PI * k) / 2

       if log(v * inv_alpha / (a / (us * us) + b)) <= log_ratio:
           return k
```

### Complete Pseudocode

```typescript
class PoissonDistribution {
    constructor(lambda: number) {
        if (lambda <= 0) throw Error("lambda must be positive")
        this.lambda = lambda
        this.useApproximation = lambda > 10
    }

    pmf(k: integer): number {
        if (k < 0) return 0

        if (this.lambda > 700) {
            // Use Normal approximation for extreme lambda
            return normalPDF(k, this.lambda, sqrt(this.lambda))
        }

        // Logarithmic computation
        const logPMF = k * log(this.lambda) - this.lambda - logGamma(k + 1)
        return exp(logPMF)
    }

    cdf(k: integer): number {
        if (k < 0) return 0

        if (this.useApproximation) {
            // Use regularized upper incomplete gamma
            return gammaIncUpper(floor(k + 1), this.lambda)
        }

        // Direct summation with recurrence
        let sum = 0
        let term = exp(-this.lambda)

        for (let i = 0; i <= k; i++) {
            sum += term
            if (i < k) {
                term *= this.lambda / (i + 1)
            }
            if (term < sum * Number.EPSILON) break
        }

        return min(sum, 1.0)
    }

    inverseCDF(p: number): integer {
        if (p < 0 || p > 1) throw Error("p must be in [0,1]")
        if (p === 0) return 0
        if (p === 1) return Infinity

        // Initial guess
        let k_init: integer
        if (this.lambda > 10) {
            const sigma = sqrt(this.lambda)
            k_init = floor(this.lambda + sigma * normalInverseCDF(p))
        } else {
            k_init = floor(this.lambda)
        }

        // Binary search
        let k_low = 0
        let k_high = max(k_init * 2, this.lambda + 10 * sqrt(this.lambda))

        while (k_low < k_high) {
            const k_mid = floor((k_low + k_high) / 2)
            const cdf_mid = this.cdf(k_mid)

            if (cdf_mid < p) {
                k_low = k_mid + 1
            } else {
                k_high = k_mid
            }
        }

        return k_low
    }

    random(): integer {
        if (this.lambda < 10) {
            return this.randomInverseTransform()
        } else {
            return this.randomPTRS()
        }
    }

    private randomInverseTransform(): integer {
        const L = exp(-this.lambda)
        let k = 0
        let p = 1.0

        do {
            k++
            p *= randomUniform()
        } while (p > L)

        return k - 1
    }

    private randomPTRS(): integer {
        const smu = sqrt(this.lambda)
        const b = 0.931 + 2.53 * smu
        const a = -0.059 + 0.02483 * b
        const inv_alpha = 1.1239 + 1.1328 / (b - 3.4)
        const v_r = 0.9277 - 3.6224 / (b - 2)

        while (true) {
            const u = randomUniform() - 0.5
            const v = randomUniform()
            const us = 0.5 - abs(u)
            const k = floor((2 * a / us + b) * u + this.lambda + 0.43)

            if (us >= 0.07919 && v <= v_r) return k
            if (k < 0 || (us < 0.013 && v > us)) continue

            const logRatio = (k + 0.5) * log(this.lambda / k) - this.lambda - k
                           + log(k) - 0.5 * log(2 * PI * k)

            if (log(v * inv_alpha / (a / (us * us) + b)) <= logRatio) {
                return k
            }
        }
    }
}
```

---

## Task 4.2: Binomial Distribution

### Mathematical Formulas

**Probability Mass Function (PMF)**:
```
P(X = k) = C(n, k) * p^k * (1-p)^(n-k)

where:
- n: number of trials (positive integer)
- k: number of successes (0 ≤ k ≤ n)
- p: success probability (0 ≤ p ≤ 1)
- C(n, k) = n! / (k! * (n-k)!)
```

**Cumulative Distribution Function (CDF)**:
```
F(k) = P(X ≤ k) = Σ(i=0 to k) C(n, i) * p^i * (1-p)^(n-i)
     = I_(1-p)(n-k, k+1)  (using regularized incomplete beta)

where I_x(a, b) is the regularized incomplete beta function
```

**Inverse CDF**:
```
Q(p) = min{k : F(k) ≥ p}
```

### Algorithms

#### PMF Computation

**Method**: Logarithmic computation with binomial coefficient
```
Algorithm: binomialPMF(k, n, p)
Input: k (0 ≤ k ≤ n), n (trials), p (probability)
Output: P(X = k)

1. Validate inputs:
   - If k < 0 or k > n: return 0
   - If p < 0 or p > 1: error
   - If n < 0: error

2. Handle edge cases:
   - If p = 0: return (k = 0) ? 1 : 0
   - If p = 1: return (k = n) ? 1 : 0
   - If k = 0: return (1 - p)^n
   - If k = n: return p^n

3. Compute using logarithms:
   log_binom_coeff = log_gamma(n + 1) - log_gamma(k + 1) - log_gamma(n - k + 1)
   log_pmf = log_binom_coeff + k * log(p) + (n - k) * log(1 - p)

4. Return exp(log_pmf)

Optimization:
- Use recurrence for sequential k values:
  P(k) = P(k-1) * ((n - k + 1) / k) * (p / (1 - p))
```

#### CDF Computation

**Method**: Incomplete Beta Function
```
Algorithm: binomialCDF(k, n, p)
Input: k (integer), n (trials), p (probability)
Output: P(X ≤ k)

1. If k < 0: return 0
2. If k >= n: return 1

3. Handle edge cases:
   - If p = 0: return 1
   - If p = 1: return (k = n) ? 1 : 0

4. Use regularized incomplete beta relation:
   F(k) = 1 - I_p(k + 1, n - k)

   where I_p(a, b) = betaInc(p, a, b) / beta(a, b)

5. For numerical stability:
   if p < 0.5:
       return 1 - incompleteBeta(p, k + 1, n - k)
   else:
       return incompleteBeta(1 - p, n - k, k + 1)

Alternative for small n:
- Direct summation with recurrence relation
```

#### Inverse CDF (Quantile)

**Method**: Binary search with smart initialization
```
Algorithm: binomialInverseCDF(prob, n, p)
Input: prob ∈ [0, 1], n (trials), p (success probability)
Output: smallest k such that P(X ≤ k) ≥ prob

1. Validate:
   - If prob < 0 or prob > 1: error
   - If prob = 0: return 0
   - If prob = 1: return n

2. Initial guess using Normal approximation:
   if n * p * (1 - p) > 9:
       mu = n * p
       sigma = sqrt(n * p * (1 - p))
       k_init = floor(mu + sigma * norm_inv_cdf(prob))
       k_init = clamp(k_init, 0, n)
   else:
       k_init = floor(n * p)

3. Binary search:
   k_low = 0
   k_high = n

   while k_low < k_high:
       k_mid = floor((k_low + k_high) / 2)
       cdf_mid = binomialCDF(k_mid, n, p)

       if cdf_mid < prob:
           k_low = k_mid + 1
       else:
           k_high = k_mid

4. Return k_low
```

#### Random Sampling

**Method 1**: Inverse Transform (small n)
```
Algorithm: binomialRandom_InverseTransform(n, p)
Input: n ≤ 20, p ∈ [0, 1]
Output: Random binomial variate

1. sum = 0
2. for i = 0 to n - 1:
       if uniform(0, 1) < p:
           sum++

3. return sum
```

**Method 2**: BTPE Algorithm (large n)
```
Algorithm: binomialRandom_BTPE(n, p)
Input: n > 20, p ∈ [0, 1]
Output: Random binomial variate

// BTPE: Binomial Triangle Parallelogram Exponential
// From "The Computer Generation of Binomial Random Variates"
// by Voratas Kachitvichyanukul and Bruce W. Schmeiser

1. Setup (computed once):
   m = floor((n + 1) * p)
   r = p / (1 - p)
   nr = (n + 1) * r
   npq = n * p * (1 - p)

   // Constants for BTPE
   sqrt_npq = sqrt(npq)
   b = 1.15 + 2.53 * sqrt_npq
   a = -0.0873 + 0.0248 * b + 0.01 * p
   c = n * p + 0.5
   alpha = (2.83 + 5.1 / b) * sqrt_npq
   v_r = 0.92 - 4.2 / b
   u_rv_r = 0.86 * v_r

2. Loop until acceptance:
   while true:
       v = uniform(0, 1)

       if v <= u_rv_r:
           u = v / v_r - 0.43
           return floor((2 * a / (0.5 - abs(u)) + b) * u + c)

       if v >= v_r:
           u = uniform(0, 1) - 0.5
       else:
           u = v / v_r - 0.93
           u = sign(u) * 0.5 - u
           v = uniform(0, 1) * v_r

       us = 0.5 - abs(u)
       k = floor((2 * a / us + b) * u + c)

       if k < 0 or k > n:
           continue

       v = v * alpha / (a / (us * us) + b)

       // Quick acceptance
       km = abs(k - m)
       if km <= 15:
           f = 1.0
           if m < k:
               for i = m + 1 to k:
                   f *= (nr / i - r)
           else if m > k:
               for i = k + 1 to m:
                   f /= (nr / i - r)

           if v <= f:
               return k

       // Squeeze acceptance
       v = log(v)
       rho = (km / npq) * (((km / 3.0 + 0.625) * km + 1.0 / 6.0) / npq + 0.5)
       t = -km * km / (2.0 * npq)

       if v < t - rho:
           return k
       if v > t + rho:
           continue

       // Final acceptance
       nm = n - m + 1
       h = (m + 0.5) * log((m + 1) / (r * nm))
         + stirlingCorrection(m) + stirlingCorrection(n - m)

       nk = n - k + 1
       h_k = (k + 0.5) * log((k + 1) / (r * nk))
           + stirlingCorrection(k) + stirlingCorrection(n - k)

       if v <= h - h_k:
           return k
```

**Stirling Correction Helper**:
```
function stirlingCorrection(n: integer): number {
    // Correction term for Stirling's approximation
    const coeffs = [
        0.08106146679532726,
        -0.000595238095238095238,
        0.000793650793650793651,
        -0.002777777777777777778,
        0.08333333333333333333
    ]

    if (n > 30) {
        const nn = n * n
        return coeffs[4] / n - coeffs[3] / (3 * nn)
    }

    // Precomputed table for n ≤ 30
    const table = [0, 0.0810614667, 0.0413406959, ...]  // Full table
    return table[n]
}
```

### Complete Pseudocode

```typescript
class BinomialDistribution {
    private n: integer
    private p: number
    private q: number  // 1 - p
    private btpe: BTPEContext | null

    constructor(n: integer, p: number) {
        if (n < 0) throw Error("n must be non-negative")
        if (p < 0 || p > 1) throw Error("p must be in [0, 1]")

        this.n = n
        this.p = p
        this.q = 1 - p

        // Precompute BTPE constants for n > 20
        if (n > 20) {
            this.btpe = this.setupBTPE()
        }
    }

    pmf(k: integer): number {
        if (k < 0 || k > this.n) return 0
        if (this.p === 0) return (k === 0) ? 1 : 0
        if (this.p === 1) return (k === this.n) ? 1 : 0

        // Logarithmic computation
        const logBinomCoeff = logGamma(this.n + 1)
                            - logGamma(k + 1)
                            - logGamma(this.n - k + 1)
        const logPMF = logBinomCoeff
                     + k * log(this.p)
                     + (this.n - k) * log(this.q)

        return exp(logPMF)
    }

    cdf(k: integer): number {
        if (k < 0) return 0
        if (k >= this.n) return 1
        if (this.p === 0) return 1
        if (this.p === 1) return (k === this.n) ? 1 : 0

        // Use incomplete beta relation
        if (this.p < 0.5) {
            return 1 - incompleteBetaReg(this.p, k + 1, this.n - k)
        } else {
            return incompleteBetaReg(this.q, this.n - k, k + 1)
        }
    }

    inverseCDF(prob: number): integer {
        if (prob < 0 || prob > 1) throw Error("prob must be in [0, 1]")
        if (prob === 0) return 0
        if (prob === 1) return this.n

        // Initial guess
        let k_init: integer
        const npq = this.n * this.p * this.q

        if (npq > 9) {
            const sigma = sqrt(npq)
            k_init = floor(this.n * this.p + sigma * normalInverseCDF(prob))
            k_init = clamp(k_init, 0, this.n)
        } else {
            k_init = floor(this.n * this.p)
        }

        // Binary search
        let k_low = 0
        let k_high = this.n

        while (k_low < k_high) {
            const k_mid = floor((k_low + k_high) / 2)
            const cdf_mid = this.cdf(k_mid)

            if (cdf_mid < prob) {
                k_low = k_mid + 1
            } else {
                k_high = k_mid
            }
        }

        return k_low
    }

    random(): integer {
        if (this.n <= 20) {
            // Simple method for small n
            let sum = 0
            for (let i = 0; i < this.n; i++) {
                if (randomUniform() < this.p) sum++
            }
            return sum
        } else {
            return this.randomBTPE()
        }
    }

    private setupBTPE(): BTPEContext {
        const m = floor((this.n + 1) * this.p)
        const r = this.p / this.q
        const npq = this.n * this.p * this.q
        const sqrt_npq = sqrt(npq)

        return {
            m,
            r,
            nr: (this.n + 1) * r,
            npq,
            sqrt_npq,
            b: 1.15 + 2.53 * sqrt_npq,
            a: -0.0873 + 0.0248 * (1.15 + 2.53 * sqrt_npq) + 0.01 * this.p,
            c: this.n * this.p + 0.5,
            alpha: (2.83 + 5.1 / (1.15 + 2.53 * sqrt_npq)) * sqrt_npq,
            v_r: 0.92 - 4.2 / (1.15 + 2.53 * sqrt_npq)
        }
    }

    private randomBTPE(): integer {
        const ctx = this.btpe!
        const u_rv_r = 0.86 * ctx.v_r

        while (true) {
            let v = randomUniform()
            let u: number

            if (v <= u_rv_r) {
                u = v / ctx.v_r - 0.43
                return floor((2 * ctx.a / (0.5 - abs(u)) + ctx.b) * u + ctx.c)
            }

            if (v >= ctx.v_r) {
                u = randomUniform() - 0.5
            } else {
                u = v / ctx.v_r - 0.93
                u = sign(u) * 0.5 - u
                v = randomUniform() * ctx.v_r
            }

            const us = 0.5 - abs(u)
            const k = floor((2 * ctx.a / us + ctx.b) * u + ctx.c)

            if (k < 0 || k > this.n) continue

            v = v * ctx.alpha / (ctx.a / (us * us) + ctx.b)

            // Acceptance tests...
            const km = abs(k - ctx.m)

            if (km <= 15) {
                let f = 1.0
                if (ctx.m < k) {
                    for (let i = ctx.m + 1; i <= k; i++) {
                        f *= (ctx.nr / i - ctx.r)
                    }
                } else if (ctx.m > k) {
                    for (let i = k + 1; i <= ctx.m; i++) {
                        f /= (ctx.nr / i - ctx.r)
                    }
                }

                if (v <= f) return k
            }

            v = log(v)
            const rho = (km / ctx.npq) * (((km / 3.0 + 0.625) * km + 1.0/6.0) / ctx.npq + 0.5)
            const t = -km * km / (2.0 * ctx.npq)

            if (v < t - rho) return k
            if (v > t + rho) continue

            const nm = this.n - ctx.m + 1
            const h = (ctx.m + 0.5) * log((ctx.m + 1) / (ctx.r * nm))
                    + stirlingCorrection(ctx.m)
                    + stirlingCorrection(this.n - ctx.m)

            const nk = this.n - k + 1
            const h_k = (k + 0.5) * log((k + 1) / (ctx.r * nk))
                      + stirlingCorrection(k)
                      + stirlingCorrection(this.n - k)

            if (v <= h - h_k) return k
        }
    }
}
```

---

## Task 4.3: Negative Binomial Distribution

### Mathematical Formulas

**Probability Mass Function (PMF)**:
```
P(X = k) = C(k + r - 1, k) * p^r * (1-p)^k

where:
- k = 0, 1, 2, ... (number of failures before r-th success)
- r > 0 (number of successes, can be non-integer)
- p ∈ (0, 1] (success probability)
- C(k + r - 1, k) = Γ(k + r) / (Γ(r) * k!)
```

**Alternative Parameterization** (mean μ, dispersion r):
```
P(X = k) = [Γ(k + r) / (Γ(r) * k!)] * (r/(r+μ))^r * (μ/(r+μ))^k

where μ = r * (1-p) / p
```

**Cumulative Distribution Function (CDF)**:
```
F(k) = P(X ≤ k) = I_p(r, k+1)

where I_p(a, b) is the regularized incomplete beta function
```

**Inverse CDF**:
```
Q(prob) = min{k : F(k) ≥ prob}
```

### Algorithms

#### PMF Computation

```
Algorithm: negativeBinomialPMF(k, r, p)
Input: k ≥ 0 (failures), r > 0 (successes), p ∈ (0, 1]
Output: P(X = k)

1. Validate:
   - If k < 0: return 0
   - If r <= 0: error "r must be positive"
   - If p <= 0 or p > 1: error "p must be in (0, 1]"

2. Special cases:
   - If p = 1: return (k = 0) ? 1 : 0
   - If k = 0: return p^r

3. Compute using logarithms:
   log_binom = log_gamma(k + r) - log_gamma(r) - log_gamma(k + 1)
   log_pmf = log_binom + r * log(p) + k * log(1 - p)

4. Return exp(log_pmf)

Recurrence relation for sequential k:
P(k) = P(k-1) * ((k + r - 1) / k) * (1 - p)
```

#### CDF Computation

```
Algorithm: negativeBinomialCDF(k, r, p)
Input: k ≥ 0, r > 0, p ∈ (0, 1]
Output: P(X ≤ k)

1. If k < 0: return 0
2. If p = 1: return 1

3. Use regularized incomplete beta:
   return incompleteBetaReg(p, r, k + 1)

Alternative for integer r and small k:
- Direct summation using recurrence relation
```

#### Inverse CDF

```
Algorithm: negativeBinomialInverseCDF(prob, r, p)
Input: prob ∈ [0, 1], r > 0, p ∈ (0, 1]
Output: smallest k such that F(k) ≥ prob

1. Validate:
   - If prob < 0 or prob > 1: error
   - If prob = 0: return 0
   - If prob = 1: return Infinity

2. Initial guess using mean/variance:
   mean = r * (1 - p) / p
   variance = r * (1 - p) / (p * p)

   if variance > mean:  // Overdispersed
       k_init = floor(mean + sqrt(variance) * norm_inv_cdf(prob))
   else:
       k_init = floor(mean)

3. Binary search:
   k_low = 0
   k_high = max(k_init * 3, mean + 10 * sqrt(variance))

   while k_low < k_high:
       k_mid = floor((k_low + k_high) / 2)
       if negativeBinomialCDF(k_mid, r, p) < prob:
           k_low = k_mid + 1
       else:
           k_high = k_mid

4. Return k_low
```

#### Random Sampling

**Method 1**: Gamma-Poisson Mixture
```
Algorithm: negativeBinomialRandom_GammaPoisson(r, p)
Input: r > 0, p ∈ (0, 1]
Output: Random negative binomial variate

// Negative binomial is a Poisson-Gamma mixture:
// If λ ~ Gamma(r, (1-p)/p), then X|λ ~ Poisson(λ)

1. theta = (1 - p) / p
2. lambda = gammaRandom(r, theta)  // Gamma(shape=r, scale=theta)
3. return poissonRandom(lambda)
```

**Method 2**: Direct Counting (integer r)
```
Algorithm: negativeBinomialRandom_Counting(r, p)
Input: r (positive integer), p ∈ (0, 1]
Output: Random negative binomial variate

// Count failures until r successes
1. failures = 0
2. successes = 0

3. while successes < r:
       if uniform(0, 1) < p:
           successes++
       else:
           failures++

4. return failures
```

### Complete Pseudocode

```typescript
class NegativeBinomialDistribution {
    private r: number
    private p: number
    private mean: number
    private variance: number

    constructor(r: number, p: number) {
        if (r <= 0) throw Error("r must be positive")
        if (p <= 0 || p > 1) throw Error("p must be in (0, 1]")

        this.r = r
        this.p = p
        this.mean = r * (1 - p) / p
        this.variance = this.mean / p
    }

    pmf(k: integer): number {
        if (k < 0) return 0
        if (this.p === 1) return (k === 0) ? 1 : 0
        if (k === 0) return pow(this.p, this.r)

        const logBinom = logGamma(k + this.r)
                       - logGamma(this.r)
                       - logGamma(k + 1)
        const logPMF = logBinom
                     + this.r * log(this.p)
                     + k * log(1 - this.p)

        return exp(logPMF)
    }

    cdf(k: integer): number {
        if (k < 0) return 0
        if (this.p === 1) return 1

        return incompleteBetaReg(this.p, this.r, k + 1)
    }

    inverseCDF(prob: number): integer {
        if (prob < 0 || prob > 1) throw Error("prob must be in [0, 1]")
        if (prob === 0) return 0
        if (prob === 1) return Infinity

        const sigma = sqrt(this.variance)
        const k_init = floor(this.mean + sigma * normalInverseCDF(prob))

        let k_low = 0
        let k_high = max(k_init * 3, this.mean + 10 * sigma)

        while (k_low < k_high) {
            const k_mid = floor((k_low + k_high) / 2)
            if (this.cdf(k_mid) < prob) {
                k_low = k_mid + 1
            } else {
                k_high = k_mid
            }
        }

        return k_low
    }

    random(): integer {
        // Gamma-Poisson mixture method
        const theta = (1 - this.p) / this.p
        const lambda = randomGamma(this.r, theta)
        return randomPoisson(lambda)
    }
}
```

---

## Task 4.4: Geometric Distribution

### Mathematical Formulas

**Probability Mass Function (PMF)**:
```
P(X = k) = (1-p)^k * p

where:
- k = 0, 1, 2, ... (number of failures before first success)
- p ∈ (0, 1] (success probability)

Alternative parameterization (trials until success):
P(X = k) = (1-p)^(k-1) * p, k = 1, 2, 3, ...
```

**Cumulative Distribution Function (CDF)**:
```
F(k) = P(X ≤ k) = 1 - (1-p)^(k+1)
```

**Inverse CDF**:
```
Q(prob) = ⌈log(1-prob) / log(1-p) - 1⌉
        = ⌈log(1-prob) / log(1-p)⌉ - 1  (failures before success)
```

**Mean**: μ = (1-p) / p
**Variance**: σ² = (1-p) / p²

### Algorithms

#### PMF Computation

```
Algorithm: geometricPMF(k, p)
Input: k ≥ 0 (number of failures), p ∈ (0, 1]
Output: P(X = k)

1. If k < 0: return 0
2. If p <= 0 or p > 1: error
3. If p = 1: return (k = 0) ? 1 : 0

4. Direct computation:
   return pow(1 - p, k) * p

For numerical stability with large k:
   log_pmf = k * log(1 - p) + log(p)
   return exp(log_pmf)
```

#### CDF Computation

```
Algorithm: geometricCDF(k, p)
Input: k ≥ 0, p ∈ (0, 1]
Output: P(X ≤ k)

1. If k < 0: return 0
2. If p = 1: return 1

3. Direct formula:
   return 1 - pow(1 - p, k + 1)

For numerical stability:
   if p > 0.5:
       return 1 - pow(1 - p, k + 1)
   else:
       return 1 - exp((k + 1) * log(1 - p))
```

#### Inverse CDF

```
Algorithm: geometricInverseCDF(prob, p)
Input: prob ∈ [0, 1], p ∈ (0, 1]
Output: smallest k such that F(k) ≥ prob

1. Validate:
   - If prob < 0 or prob > 1: error
   - If prob = 0: return 0
   - If prob = 1: return Infinity

2. Analytical formula:
   if prob = 1:
       return Infinity

   k = ceil(log(1 - prob) / log(1 - p)) - 1

   // Ensure k is non-negative
   return max(k, 0)

Numerical stability:
   if p > 0.5:
       k = ceil(log(1 - prob) / log(1 - p)) - 1
   else:
       k = ceil(log1p(-prob) / log1p(-p)) - 1

   return max(k, 0)
```

#### Random Sampling

**Method 1**: Inverse Transform
```
Algorithm: geometricRandom_InverseTransform(p)
Input: p ∈ (0, 1]
Output: Random geometric variate

1. u = uniform(0, 1)
2. return floor(log(1 - u) / log(1 - p))

Numerical stability:
   return floor(log(uniform(0, 1)) / log1p(-p))
```

**Method 2**: Direct Simulation
```
Algorithm: geometricRandom_Direct(p)
Input: p ∈ (0, 1]
Output: Random geometric variate

1. k = 0
2. while uniform(0, 1) >= p:
       k++
3. return k
```

### Complete Pseudocode

```typescript
class GeometricDistribution {
    private p: number
    private log1mp: number  // log(1 - p)

    constructor(p: number) {
        if (p <= 0 || p > 1) throw Error("p must be in (0, 1]")

        this.p = p
        this.log1mp = log1p(-p)  // Numerically stable log(1-p)
    }

    pmf(k: integer): number {
        if (k < 0) return 0
        if (this.p === 1) return (k === 0) ? 1 : 0

        // Use logarithmic computation for stability
        if (k > 100) {
            return exp(k * this.log1mp + log(this.p))
        }

        return pow(1 - this.p, k) * this.p
    }

    cdf(k: integer): number {
        if (k < 0) return 0
        if (this.p === 1) return 1

        // F(k) = 1 - (1-p)^(k+1)
        return -expm1((k + 1) * this.log1mp)  // 1 - exp((k+1)*log(1-p))
    }

    inverseCDF(prob: number): integer {
        if (prob < 0 || prob > 1) throw Error("prob must be in [0, 1]")
        if (prob === 0) return 0
        if (prob === 1) return Infinity

        // Q(p) = ceil(log(1-prob) / log(1-p)) - 1
        const k = ceil(log1p(-prob) / this.log1mp) - 1

        return max(k, 0)
    }

    random(): integer {
        // Inverse transform method
        const u = randomUniform()
        return floor(log(u) / this.log1mp)
    }

    mean(): number {
        return (1 - this.p) / this.p
    }

    variance(): number {
        return (1 - this.p) / (this.p * this.p)
    }
}
```

---

## Task 4.5: Hypergeometric Distribution

### Mathematical Formulas

**Probability Mass Function (PMF)**:
```
P(X = k) = [C(K, k) * C(N-K, n-k)] / C(N, n)

where:
- N: population size (positive integer)
- K: number of success states in population (0 ≤ K ≤ N)
- n: number of draws (0 ≤ n ≤ N)
- k: number of observed successes (max(0, n-N+K) ≤ k ≤ min(n, K))
- C(a, b) = binomial coefficient = a! / (b! * (a-b)!)
```

**Cumulative Distribution Function (CDF)**:
```
F(k) = P(X ≤ k) = Σ(i=k_min to k) P(X = i)

where k_min = max(0, n - N + K)
```

**Inverse CDF**:
```
Q(prob) = min{k : F(k) ≥ prob}
```

**Mean**: μ = n * K / N
**Variance**: σ² = n * (K/N) * (1 - K/N) * (N-n)/(N-1)

### Algorithms

#### PMF Computation

```
Algorithm: hypergeometricPMF(k, N, K, n)
Input: k (successes), N (population), K (success states), n (draws)
Output: P(X = k)

1. Validate:
   - If N < 0 or K < 0 or n < 0: error
   - If K > N or n > N: error

2. Check support:
   k_min = max(0, n - N + K)
   k_max = min(n, K)

   if k < k_min or k > k_max: return 0

3. Special cases:
   - If n = 0: return (k = 0) ? 1 : 0
   - If K = 0: return (k = 0) ? 1 : 0
   - If K = N: return (k = n) ? 1 : 0

4. Compute using log binomial coefficients:
   log_pmf = log_binom(K, k)
           + log_binom(N - K, n - k)
           - log_binom(N, n)

   return exp(log_pmf)

Helper function:
log_binom(n, k):
    if k < 0 or k > n: return -Infinity
    if k = 0 or k = n: return 0
    return log_gamma(n + 1) - log_gamma(k + 1) - log_gamma(n - k + 1)

Optimization for sequential k (recurrence):
P(k) = P(k-1) * [(K - k + 1) * (n - k + 1)] / [k * (N - K - n + k)]
```

#### CDF Computation

```
Algorithm: hypergeometricCDF(k, N, K, n)
Input: k, N, K, n
Output: P(X ≤ k)

1. k_min = max(0, n - N + K)
2. k_max = min(n, K)

3. If k < k_min: return 0
4. If k >= k_max: return 1

5. Direct summation with recurrence:
   k_start = k_min
   k_end = min(k, k_max)

   sum = 0
   pmf = hypergeometricPMF(k_start, N, K, n)
   sum = pmf

   for i = k_start + 1 to k_end:
       // Use recurrence
       pmf *= [(K - i + 1) * (n - i + 1)] / [i * (N - K - n + i)]
       sum += pmf

       if pmf < sum * EPSILON:
           break

   return min(sum, 1.0)

Optimization:
- Start from mode if k > mode
- Use symmetry: P(X ≤ k) = 1 - P(X > k) when beneficial
```

#### Inverse CDF

```
Algorithm: hypergeometricInverseCDF(prob, N, K, n)
Input: prob ∈ [0, 1], N, K, n
Output: smallest k such that F(k) ≥ prob

1. Validate:
   - If prob < 0 or prob > 1: error

2. k_min = max(0, n - N + K)
3. k_max = min(n, K)

4. If prob = 0: return k_min
5. If prob = 1: return k_max

6. Initial guess:
   mean = n * K / N
   k_init = round(mean)

7. Binary search:
   k_low = k_min
   k_high = k_max

   while k_low < k_high:
       k_mid = floor((k_low + k_high) / 2)
       cdf_mid = hypergeometricCDF(k_mid, N, K, n)

       if cdf_mid < prob:
           k_low = k_mid + 1
       else:
           k_high = k_mid

8. Return k_low
```

#### Random Sampling

**Method 1**: Urn Model (small n)
```
Algorithm: hypergeometricRandom_UrnModel(N, K, n)
Input: N (population), K (successes), n (draws)
Output: Random hypergeometric variate

// Simulate drawing without replacement
1. successes = 0
2. remaining_success = K
3. remaining_total = N

4. for i = 0 to n - 1:
       prob_success = remaining_success / remaining_total

       if uniform(0, 1) < prob_success:
           successes++
           remaining_success--

       remaining_total--

5. return successes
```

**Method 2**: Acceptance-Rejection (large N)
```
Algorithm: hypergeometricRandom_Rejection(N, K, n)
Input: N, K, n
Output: Random hypergeometric variate

// Use binomial approximation with acceptance-rejection
1. p = K / N
2. mode = floor((n + 1) * (K + 1) / (N + 2))
3. max_pmf = hypergeometricPMF(mode, N, K, n)

4. Loop until acceptance:
   while true:
       // Proposal from binomial
       k = binomialRandom(n, p)

       // Acceptance probability
       hyp_pmf = hypergeometricPMF(k, N, K, n)
       bin_pmf = binomialPMF(k, n, p)

       acceptance_prob = hyp_pmf / (max_pmf * bin_pmf / max_pmf)

       if uniform(0, 1) < acceptance_prob:
           return k
```

**Method 3**: Ratio of Uniforms (alternative)
```
Algorithm: hypergeometricRandom_HRUA(N, K, n)
Input: N, K, n
Output: Random hypergeometric variate

// H2PE algorithm (Hypergeometric 2-Point Exact)
// Similar to BTPE for binomial

1. p = K / N
2. m = floor((n + 1) * p)
3. Setup constants based on N, K, n...

4. Loop with acceptance tests:
   [Complex algorithm - see reference implementation]

5. return accepted k
```

### Complete Pseudocode

```typescript
class HypergeometricDistribution {
    private N: integer  // Population size
    private K: integer  // Success states in population
    private n: integer  // Number of draws
    private k_min: integer
    private k_max: integer
    private mean: number
    private variance: number

    constructor(N: integer, K: integer, n: integer) {
        if (N < 0 || K < 0 || n < 0) {
            throw Error("N, K, n must be non-negative")
        }
        if (K > N || n > N) {
            throw Error("Invalid parameters: K > N or n > N")
        }

        this.N = N
        this.K = K
        this.n = n
        this.k_min = max(0, n - N + K)
        this.k_max = min(n, K)

        const p = K / N
        this.mean = n * p
        this.variance = n * p * (1 - p) * (N - n) / (N - 1)
    }

    pmf(k: integer): number {
        if (k < this.k_min || k > this.k_max) return 0

        if (this.n === 0) return (k === 0) ? 1 : 0
        if (this.K === 0) return (k === 0) ? 1 : 0
        if (this.K === this.N) return (k === this.n) ? 1 : 0

        // Logarithmic computation
        const logPMF = this.logBinom(this.K, k)
                     + this.logBinom(this.N - this.K, this.n - k)
                     - this.logBinom(this.N, this.n)

        return exp(logPMF)
    }

    private logBinom(n: integer, k: integer): number {
        if (k < 0 || k > n) return -Infinity
        if (k === 0 || k === n) return 0

        return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1)
    }

    cdf(k: integer): number {
        if (k < this.k_min) return 0
        if (k >= this.k_max) return 1

        let sum = 0
        let pmf = this.pmf(this.k_min)
        sum = pmf

        for (let i = this.k_min + 1; i <= min(k, this.k_max); i++) {
            // Recurrence relation
            pmf *= ((this.K - i + 1) * (this.n - i + 1)) /
                   (i * (this.N - this.K - this.n + i))
            sum += pmf

            if (pmf < sum * Number.EPSILON) break
        }

        return min(sum, 1.0)
    }

    inverseCDF(prob: number): integer {
        if (prob < 0 || prob > 1) throw Error("prob must be in [0, 1]")
        if (prob === 0) return this.k_min
        if (prob === 1) return this.k_max

        let k_low = this.k_min
        let k_high = this.k_max

        while (k_low < k_high) {
            const k_mid = floor((k_low + k_high) / 2)
            const cdf_mid = this.cdf(k_mid)

            if (cdf_mid < prob) {
                k_low = k_mid + 1
            } else {
                k_high = k_mid
            }
        }

        return k_low
    }

    random(): integer {
        if (this.n <= 20) {
            // Urn model for small n
            return this.randomUrnModel()
        } else {
            // Acceptance-rejection for large n
            return this.randomRejection()
        }
    }

    private randomUrnModel(): integer {
        let successes = 0
        let remaining_success = this.K
        let remaining_total = this.N

        for (let i = 0; i < this.n; i++) {
            const prob_success = remaining_success / remaining_total

            if (randomUniform() < prob_success) {
                successes++
                remaining_success--
            }

            remaining_total--
        }

        return successes
    }

    private randomRejection(): integer {
        const p = this.K / this.N
        const mode = floor((this.n + 1) * (this.K + 1) / (this.N + 2))
        const max_pmf = this.pmf(mode)

        while (true) {
            const k = randomBinomial(this.n, p)

            if (k < this.k_min || k > this.k_max) continue

            const hyp_pmf = this.pmf(k)
            const bin_pmf = binomialPMF(k, this.n, p)

            const acceptance_prob = hyp_pmf / (max_pmf * bin_pmf / max_pmf)

            if (randomUniform() < acceptance_prob) {
                return k
            }
        }
    }
}
```

---

## Task 4.6: Uniform Distribution (Continuous)

### Mathematical Formulas

**Probability Density Function (PDF)**:
```
f(x) = 1 / (b - a)  for a ≤ x ≤ b
     = 0            otherwise

where:
- a: lower bound
- b: upper bound (b > a)
```

**Cumulative Distribution Function (CDF)**:
```
F(x) = 0           for x < a
     = (x - a) / (b - a)  for a ≤ x ≤ b
     = 1           for x > b
```

**Inverse CDF** (Quantile Function):
```
Q(p) = a + p * (b - a)  for p ∈ [0, 1]
```

**Mean**: μ = (a + b) / 2
**Variance**: σ² = (b - a)² / 12

### Algorithms

```
Algorithm: uniformPDF(x, a, b)
Input: x, a (lower bound), b (upper bound)
Output: f(x)

1. If b <= a: error "b must be greater than a"
2. If x < a or x > b: return 0
3. Return 1 / (b - a)
```

```
Algorithm: uniformCDF(x, a, b)
Input: x, a, b
Output: F(x)

1. If b <= a: error
2. If x < a: return 0
3. If x > b: return 1
4. Return (x - a) / (b - a)
```

```
Algorithm: uniformInverseCDF(p, a, b)
Input: p ∈ [0, 1], a, b
Output: Q(p)

1. If p < 0 or p > 1: error
2. If b <= a: error
3. Return a + p * (b - a)
```

```
Algorithm: uniformRandom(a, b)
Input: a, b
Output: Random uniform variate in [a, b]

1. u = uniform(0, 1)
2. Return a + u * (b - a)
```

### Complete Pseudocode

```typescript
class UniformDistribution {
    private a: number
    private b: number
    private range: number

    constructor(a: number, b: number) {
        if (b <= a) throw Error("b must be greater than a")

        this.a = a
        this.b = b
        this.range = b - a
    }

    pdf(x: number): number {
        if (x < this.a || x > this.b) return 0
        return 1 / this.range
    }

    cdf(x: number): number {
        if (x < this.a) return 0
        if (x > this.b) return 1
        return (x - this.a) / this.range
    }

    inverseCDF(p: number): number {
        if (p < 0 || p > 1) throw Error("p must be in [0, 1]")
        return this.a + p * this.range
    }

    random(): number {
        return this.a + randomUniform() * this.range
    }

    mean(): number {
        return (this.a + this.b) / 2
    }

    variance(): number {
        return this.range * this.range / 12
    }
}
```

---

## Task 4.7: Cauchy Distribution

### Mathematical Formulas

**Probability Density Function (PDF)**:
```
f(x) = 1 / [π * γ * (1 + ((x - x₀)/γ)²)]

where:
- x₀: location parameter (median)
- γ > 0: scale parameter (half-width at half-maximum)
```

**Cumulative Distribution Function (CDF)**:
```
F(x) = (1/π) * arctan((x - x₀)/γ) + 1/2
```

**Inverse CDF** (Quantile Function):
```
Q(p) = x₀ + γ * tan(π * (p - 1/2))
```

**Note**: Cauchy distribution has no defined mean or variance (heavy tails)

### Algorithms

```
Algorithm: cauchyPDF(x, x0, gamma)
Input: x, x0 (location), gamma (scale > 0)
Output: f(x)

1. If gamma <= 0: error "gamma must be positive"
2. z = (x - x0) / gamma
3. return 1 / (PI * gamma * (1 + z * z))

Numerical stability for large |x|:
   if abs(z) > 1e8:
       return 0  // Effectively zero in floating point
```

```
Algorithm: cauchyCDF(x, x0, gamma)
Input: x, x0, gamma
Output: F(x)

1. If gamma <= 0: error
2. z = (x - x0) / gamma
3. return atan(z) / PI + 0.5

Numerical stability:
   Use atan2 for better precision
   return atan2(x - x0, gamma) / PI + 0.5
```

```
Algorithm: cauchyInverseCDF(p, x0, gamma)
Input: p ∈ [0, 1], x0, gamma
Output: Q(p)

1. If p < 0 or p > 1: error
2. If gamma <= 0: error

3. Special cases:
   - If p = 0: return -Infinity
   - If p = 0.5: return x0
   - If p = 1: return Infinity

4. return x0 + gamma * tan(PI * (p - 0.5))

Numerical stability near p = 0 or p = 1:
   if p < 1e-10: return -Infinity
   if p > 1 - 1e-10: return Infinity
```

```
Algorithm: cauchyRandom(x0, gamma)
Input: x0, gamma
Output: Random Cauchy variate

// Inverse transform method
1. u = uniform(0, 1)
2. return x0 + gamma * tan(PI * (u - 0.5))

Alternative (ratio of normals):
1. u1 = normal(0, 1)
2. u2 = normal(0, 1)
3. return x0 + gamma * (u1 / u2)
```

### Complete Pseudocode

```typescript
class CauchyDistribution {
    private x0: number
    private gamma: number

    constructor(x0: number, gamma: number) {
        if (gamma <= 0) throw Error("gamma must be positive")

        this.x0 = x0
        this.gamma = gamma
    }

    pdf(x: number): number {
        const z = (x - this.x0) / this.gamma

        // Numerical stability
        if (abs(z) > 1e8) return 0

        return 1 / (PI * this.gamma * (1 + z * z))
    }

    cdf(x: number): number {
        // Using atan2 for better numerical stability
        return atan2(x - this.x0, this.gamma) / PI + 0.5
    }

    inverseCDF(p: number): number {
        if (p < 0 || p > 1) throw Error("p must be in [0, 1]")

        // Special cases
        if (p === 0) return -Infinity
        if (p === 0.5) return this.x0
        if (p === 1) return Infinity

        // Numerical stability near extremes
        if (p < 1e-10) return -Infinity
        if (p > 1 - 1e-10) return Infinity

        return this.x0 + this.gamma * tan(PI * (p - 0.5))
    }

    random(): number {
        // Inverse transform method
        const u = randomUniform()
        return this.inverseCDF(u)
    }

    median(): number {
        return this.x0
    }

    // No mean or variance (undefined for Cauchy)
}
```

---

## Task 4.8: Logistic Distribution

### Mathematical Formulas

**Probability Density Function (PDF)**:
```
f(x) = exp(-(x-μ)/s) / [s * (1 + exp(-(x-μ)/s))²]
     = exp((x-μ)/s) / [s * (1 + exp((x-μ)/s))²]  (alternative form)

where:
- μ: location parameter (mean)
- s > 0: scale parameter
```

**Cumulative Distribution Function (CDF)**:
```
F(x) = 1 / (1 + exp(-(x-μ)/s))
     = logistic((x-μ)/s)
```

**Inverse CDF** (Quantile Function):
```
Q(p) = μ + s * log(p / (1-p))
     = μ + s * logit(p)
```

**Mean**: μ
**Variance**: σ² = s² * π² / 3

### Algorithms

```
Algorithm: logisticPDF(x, mu, s)
Input: x, mu (location), s (scale > 0)
Output: f(x)

1. If s <= 0: error "s must be positive"

2. z = (x - mu) / s

3. Numerical stability:
   if z > 0:
       exp_z = exp(-z)
       return exp_z / (s * (1 + exp_z)²)
   else:
       exp_z = exp(z)
       return exp_z / (s * (1 + exp_z)²)

Alternative using expit function:
   p = expit(z)  // 1 / (1 + exp(-z))
   return p * (1 - p) / s
```

```
Algorithm: logisticCDF(x, mu, s)
Input: x, mu, s
Output: F(x)

1. If s <= 0: error

2. z = (x - mu) / s

3. Use expit (numerically stable logistic function):
   return expit(z) = 1 / (1 + exp(-z))

Numerical stability implementation:
   if z >= 0:
       return 1 / (1 + exp(-z))
   else:
       exp_z = exp(z)
       return exp_z / (1 + exp_z)
```

```
Algorithm: logisticInverseCDF(p, mu, s)
Input: p ∈ [0, 1], mu, s
Output: Q(p)

1. If p < 0 or p > 1: error
2. If s <= 0: error

3. Special cases:
   - If p = 0: return -Infinity
   - If p = 0.5: return mu
   - If p = 1: return Infinity

4. Use logit function:
   return mu + s * log(p / (1 - p))

Numerical stability:
   if p < 1e-10: return -Infinity
   if p > 1 - 1e-10: return Infinity

   // Use log1p for better precision near 0 and 1
   return mu + s * (log(p) - log1p(-p))
```

```
Algorithm: logisticRandom(mu, s)
Input: mu, s
Output: Random logistic variate

// Inverse transform method
1. u = uniform(0, 1)
2. return logisticInverseCDF(u, mu, s)

Direct formula:
   return mu + s * log(u / (1 - u))

Numerical stability:
   if u < 0.5:
       return mu + s * (log(u) - log1p(-u))
   else:
       return mu + s * (log(u) - log(1 - u))
```

### Complete Pseudocode

```typescript
class LogisticDistribution {
    private mu: number
    private s: number

    constructor(mu: number, s: number) {
        if (s <= 0) throw Error("s must be positive")

        this.mu = mu
        this.s = s
    }

    pdf(x: number): number {
        const z = (x - this.mu) / this.s

        // Use expit for numerical stability
        const p = this.expit(z)
        return p * (1 - p) / this.s
    }

    cdf(x: number): number {
        const z = (x - this.mu) / this.s
        return this.expit(z)
    }

    private expit(z: number): number {
        // Numerically stable logistic function
        if (z >= 0) {
            return 1 / (1 + exp(-z))
        } else {
            const exp_z = exp(z)
            return exp_z / (1 + exp_z)
        }
    }

    inverseCDF(p: number): number {
        if (p < 0 || p > 1) throw Error("p must be in [0, 1]")

        if (p === 0) return -Infinity
        if (p === 0.5) return this.mu
        if (p === 1) return Infinity

        // Numerical stability near extremes
        if (p < 1e-10) return -Infinity
        if (p > 1 - 1e-10) return Infinity

        // logit(p) = log(p / (1-p))
        return this.mu + this.s * (log(p) - log1p(-p))
    }

    random(): number {
        const u = randomUniform()

        // Avoid exact 0 or 1
        const safe_u = clamp(u, 1e-10, 1 - 1e-10)

        return this.inverseCDF(safe_u)
    }

    mean(): number {
        return this.mu
    }

    variance(): number {
        return this.s * this.s * PI * PI / 3
    }

    median(): number {
        return this.mu
    }
}
```

---

## Task 4.9: Incomplete Beta Function

### Mathematical Formulas

**Incomplete Beta Function**:
```
B(x; a, b) = ∫₀ˣ t^(a-1) * (1-t)^(b-1) dt

Regularized form:
I_x(a, b) = B(x; a, b) / B(a, b)
          = B(x; a, b) / [Γ(a) * Γ(b) / Γ(a+b)]
```

**Symmetry Relation**:
```
I_x(a, b) = 1 - I_(1-x)(b, a)
```

**Continued Fraction Representation** (for I_x(a,b)):
```
I_x(a, b) = [x^a * (1-x)^b] / [a * B(a, b)] * CF

where CF (continued fraction) is computed using Lentz's method
```

### Algorithms

#### Regularized Incomplete Beta - Main Algorithm

```
Algorithm: incompleteBetaReg(x, a, b)
Input: x ∈ [0, 1], a > 0, b > 0
Output: I_x(a, b)

1. Validate:
   - If x < 0 or x > 1: error
   - If a <= 0 or b <= 0: error

2. Boundary cases:
   - If x = 0: return 0
   - If x = 1: return 1

3. Use symmetry for efficiency:
   if x > (a + 1) / (a + b + 2):
       return 1 - incompleteBetaReg(1 - x, b, a)

4. Compute logarithmic prefix:
   log_beta = log_gamma(a) + log_gamma(b) - log_gamma(a + b)
   log_prefix = a * log(x) + b * log(1 - x) - log_beta - log(a)

5. If a > 3000 and b > 3000:
       // Use asymptotic expansion for large a, b
       return incompleteBetaAsymptotic(x, a, b)

6. Choose method based on parameters:
   if x < (a + 1) / (a + b + 2):
       // Use continued fraction
       cf = incompleteBetaCF(x, a, b)
       return exp(log_prefix) * cf
   else:
       // Use series expansion
       series = incompleteBetaSeries(x, a, b)
       return exp(log_prefix) * series
```

#### Continued Fraction Method (Lentz's Algorithm)

```
Algorithm: incompleteBetaCF(x, a, b)
Input: x ∈ [0, 1], a > 0, b > 0
Output: Continued fraction value for I_x(a, b)

// Lentz's method for continued fraction evaluation
// CF = 1 / (1 + d₁ / (1 + d₂ / (1 + d₃ / ...)))
// where d_m are determined by recurrence relations

1. Constants:
   EPSILON = 1e-15
   TINY = 1e-30
   MAX_ITER = 200

2. Initialize:
   qab = a + b
   qap = a + 1
   qam = a - 1

   c = 1.0
   d = 1.0 - qab * x / qap

   if abs(d) < TINY: d = TINY
   d = 1.0 / d
   h = d

3. Iterate:
   for m = 1 to MAX_ITER:
       m2 = 2 * m

       // Even step
       aa = m * (b - m) * x / ((qam + m2) * (a + m2))
       d = 1.0 + aa * d
       if abs(d) < TINY: d = TINY
       c = 1.0 + aa / c
       if abs(c) < TINY: c = TINY
       d = 1.0 / d
       h *= d * c

       // Odd step
       aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
       d = 1.0 + aa * d
       if abs(d) < TINY: d = TINY
       c = 1.0 + aa / c
       if abs(c) < TINY: c = TINY
       d = 1.0 / d
       delta = d * c
       h *= delta

       // Convergence test
       if abs(delta - 1.0) < EPSILON:
           return h

4. If not converged: error "Continued fraction did not converge"
```

#### Series Expansion Method

```
Algorithm: incompleteBetaSeries(x, a, b)
Input: x ∈ [0, 1], a > 0, b > 0
Output: Series expansion for I_x(a, b)

// Use series expansion for small x or when CF is not efficient
// I_x(a,b) = (x^a / a) * Σ[(1-b)_n / (a+n)] * x^n

1. Constants:
   EPSILON = 1e-15
   MAX_ITER = 1000

2. Initialize:
   sum = 1.0 / a
   term = 1.0 / a

   apb = a + b
   ap = a

3. Iterate:
   for n = 1 to MAX_ITER:
       ap += 1
       term *= (n - b) * x / (ap - a)
       sum += term

       if abs(term) < abs(sum) * EPSILON:
           return sum * exp(a * log(x) + b * log(1-x) - logBeta(a, b))

4. If not converged: error "Series did not converge"
```

#### Inverse Incomplete Beta (Quantile)

```
Algorithm: incompleteBetaInverse(p, a, b)
Input: p ∈ [0, 1], a > 0, b > 0
Output: x such that I_x(a, b) = p

1. Validate:
   - If p < 0 or p > 1: error
   - If p = 0: return 0
   - If p = 1: return 1

2. Initial guess:
   // Use various approximations based on a, b

   if a >= 1 and b >= 1:
       // Wilson-Hilferty approximation
       if p < 0.5:
           pp = p
           a1 = a - 0.5
           b1 = b - 0.5
       else:
           pp = 1 - p
           a1 = b - 0.5
           b1 = a - 0.5

       t = sqrt(-2 * log(pp))
       x_init = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481))
       x_init = a1 / (a1 + b1 * exp(x_init))

       if p < 0.5:
           x = x_init
       else:
           x = 1 - x_init

   else:
       // Simpler approximation for a < 1 or b < 1
       lna = log(a / (a + b))
       lnb = log(b / (a + b))
       t = exp(a * lna) / a
       u = exp(b * lnb) / b
       w = t + u

       if p < t / w:
           x = pow(a * w * p, 1 / a)
       else:
           x = 1 - pow(b * w * (1 - p), 1 / b)

3. Refine using Newton-Raphson:
   for iter = 1 to 100:
       // Compute I_x(a, b) and its derivative
       beta_cdf = incompleteBetaReg(x, a, b)
       error = beta_cdf - p

       // Derivative: d/dx I_x(a,b) = x^(a-1) * (1-x)^(b-1) / B(a,b)
       beta_pdf = exp((a - 1) * log(x) + (b - 1) * log(1 - x) - logBeta(a, b))

       // Newton step
       x_new = x - error / beta_pdf

       // Ensure x stays in (0, 1)
       x_new = clamp(x_new, 0.0001, 0.9999)

       if abs(x_new - x) < 1e-10:
           return x_new

       x = x_new

4. Return x (or error if not converged)

Helper - logBeta function:
logBeta(a, b):
    return log_gamma(a) + log_gamma(b) - log_gamma(a + b)
```

#### Asymptotic Expansion (Large a, b)

```
Algorithm: incompleteBetaAsymptotic(x, a, b)
Input: x ∈ [0, 1], a >> 1, b >> 1
Output: I_x(a, b)

// Use Normal approximation for large a, b
1. mu = a / (a + b)
2. sigma = sqrt(a * b / ((a + b)^2 * (a + b + 1)))

3. z = (x - mu) / sigma

4. return normalCDF(z)

Alternative (more accurate):
   Use Edgeworth expansion or saddlepoint approximation
```

### Complete Pseudocode

```typescript
class IncompleteBeta {
    private static readonly EPSILON = 1e-15
    private static readonly TINY = 1e-30
    private static readonly MAX_ITER = 200

    static regularized(x: number, a: number, b: number): number {
        if (x < 0 || x > 1) throw Error("x must be in [0, 1]")
        if (a <= 0 || b <= 0) throw Error("a, b must be positive")

        if (x === 0) return 0
        if (x === 1) return 1

        // Use symmetry
        if (x > (a + 1) / (a + b + 2)) {
            return 1 - this.regularized(1 - x, b, a)
        }

        // Logarithmic prefix
        const logBeta = logGamma(a) + logGamma(b) - logGamma(a + b)
        const logPrefix = a * log(x) + b * log(1 - x) - logBeta - log(a)

        // Choose method
        const cf = this.continuedFraction(x, a, b)
        return exp(logPrefix) * cf
    }

    private static continuedFraction(x: number, a: number, b: number): number {
        const qab = a + b
        const qap = a + 1
        const qam = a - 1

        let c = 1.0
        let d = 1.0 - qab * x / qap

        if (abs(d) < this.TINY) d = this.TINY
        d = 1.0 / d
        let h = d

        for (let m = 1; m <= this.MAX_ITER; m++) {
            const m2 = 2 * m

            // Even step
            let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
            d = 1.0 + aa * d
            if (abs(d) < this.TINY) d = this.TINY
            c = 1.0 + aa / c
            if (abs(c) < this.TINY) c = this.TINY
            d = 1.0 / d
            h *= d * c

            // Odd step
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
            d = 1.0 + aa * d
            if (abs(d) < this.TINY) d = this.TINY
            c = 1.0 + aa / c
            if (abs(c) < this.TINY) c = this.TINY
            d = 1.0 / d
            const delta = d * c
            h *= delta

            if (abs(delta - 1.0) < this.EPSILON) {
                return h
            }
        }

        throw Error("Continued fraction did not converge")
    }

    static inverse(p: number, a: number, b: number): number {
        if (p < 0 || p > 1) throw Error("p must be in [0, 1]")
        if (p === 0) return 0
        if (p === 1) return 1

        // Initial guess
        let x = this.initialGuess(p, a, b)

        // Newton-Raphson refinement
        for (let iter = 0; iter < 100; iter++) {
            const beta_cdf = this.regularized(x, a, b)
            const error = beta_cdf - p

            const logBeta = logGamma(a) + logGamma(b) - logGamma(a + b)
            const beta_pdf = exp((a - 1) * log(x) + (b - 1) * log(1 - x) - logBeta)

            const x_new = x - error / beta_pdf
            const x_clamped = clamp(x_new, 0.0001, 0.9999)

            if (abs(x_clamped - x) < 1e-10) {
                return x_clamped
            }

            x = x_clamped
        }

        return x
    }

    private static initialGuess(p: number, a: number, b: number): number {
        if (a >= 1 && b >= 1) {
            // Wilson-Hilferty approximation
            let pp: number, a1: number, b1: number

            if (p < 0.5) {
                pp = p
                a1 = a - 0.5
                b1 = b - 0.5
            } else {
                pp = 1 - p
                a1 = b - 0.5
                b1 = a - 0.5
            }

            const t = sqrt(-2 * log(pp))
            let x_init = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481))
            x_init = a1 / (a1 + b1 * exp(x_init))

            return (p < 0.5) ? x_init : 1 - x_init
        } else {
            // Simple approximation
            const lna = log(a / (a + b))
            const lnb = log(b / (a + b))
            const t = exp(a * lna) / a
            const u = exp(b * lnb) / b
            const w = t + u

            if (p < t / w) {
                return pow(a * w * p, 1 / a)
            } else {
                return 1 - pow(b * w * (1 - p), 1 / b)
            }
        }
    }
}
```

---

## Task 4.10: Multivariate Normal Distribution

### Mathematical Formulas

**Probability Density Function (PDF)**:
```
f(x) = (2π)^(-k/2) * |Σ|^(-1/2) * exp[-1/2 * (x-μ)ᵀ Σ⁻¹ (x-μ)]

where:
- x ∈ ℝᵏ (random vector)
- μ ∈ ℝᵏ (mean vector)
- Σ ∈ ℝᵏˣᵏ (covariance matrix, positive definite)
- k (dimension)
```

**Mahalanobis Distance**:
```
D² = (x - μ)ᵀ Σ⁻¹ (x - μ)
```

### Algorithms

#### PDF Computation

```
Algorithm: multivariateNormalPDF(x, mu, Sigma)
Input: x (k-vector), mu (k-vector), Sigma (k×k matrix)
Output: f(x)

1. Validate:
   - dim(x) = dim(mu) = k
   - Sigma is k×k, symmetric, positive definite

2. Compute Cholesky decomposition:
   L = cholesky(Sigma)  // Sigma = L * Lᵀ

   If decomposition fails: error "Sigma not positive definite"

3. Compute determinant:
   // det(Sigma) = (det(L))² = (Π L_ii)²
   log_det_Sigma = 2 * Σ log(L_ii)

4. Compute Mahalanobis distance:
   diff = x - mu

   // Solve L * y = diff for y
   y = solve_triangular_lower(L, diff)

   // D² = yᵀy
   mahalanobis_sq = dot(y, y)

5. Compute log PDF:
   k = length(x)
   log_pdf = -0.5 * (k * log(2*PI) + log_det_Sigma + mahalanobis_sq)

6. Return exp(log_pdf)

Optimization:
- Cache Cholesky decomposition if evaluating multiple x values
- Use log PDF directly when possible to avoid overflow
```

#### Random Sampling

**Method**: Cholesky Factorization
```
Algorithm: multivariateNormalRandom(mu, Sigma)
Input: mu (k-vector), Sigma (k×k covariance matrix)
Output: Random k-vector from N(μ, Σ)

1. Validate Sigma (symmetric, positive definite)

2. Compute Cholesky decomposition:
   L = cholesky(Sigma)  // Sigma = L * Lᵀ

3. Generate standard normal vector:
   z = [z₁, z₂, ..., z_k]ᵀ
   where each z_i ~ N(0, 1) independently

4. Transform:
   x = μ + L * z

5. Return x

Explanation:
- If z ~ N(0, I), then L*z ~ N(0, L*Lᵀ) = N(0, Σ)
- Adding μ shifts to N(μ, Σ)
```

**Alternative Method**: Eigendecomposition
```
Algorithm: multivariateNormalRandom_Eigen(mu, Sigma)
Input: mu, Sigma
Output: Random vector

1. Eigendecomposition:
   Sigma = Q * Λ * Qᵀ
   where Q is orthogonal, Λ is diagonal with eigenvalues

2. Generate standard normal:
   z ~ N(0, I)

3. Transform:
   x = μ + Q * √Λ * z

Note: Cholesky is faster; use eigen when Sigma is nearly singular
```

#### Conditional Distribution

```
Algorithm: multivariateNormalConditional(x1, mu, Sigma, indices)
Input:
  - x1: observed values for subset of variables
  - mu: full mean vector
  - Sigma: full covariance matrix
  - indices: which variables are observed
Output: Conditional mean and covariance

// Partition: x = [x₁, x₂]ᵀ where x₁ is observed

1. Partition mu:
   mu1 = mu[indices]
   mu2 = mu[not indices]

2. Partition Sigma:
   Sigma11 = Sigma[indices, indices]
   Sigma12 = Sigma[indices, not indices]
   Sigma21 = Sigma[not indices, indices]
   Sigma22 = Sigma[not indices, not indices]

3. Compute conditional distribution:
   // x₂|x₁ ~ N(μ₂|₁, Σ₂|₁)

   Sigma11_inv = inverse(Sigma11)

   mu_conditional = mu2 + Sigma21 * Sigma11_inv * (x1 - mu1)
   Sigma_conditional = Sigma22 - Sigma21 * Sigma11_inv * Sigma12

4. Return (mu_conditional, Sigma_conditional)
```

### Complete Pseudocode

```typescript
class MultivariateNormalDistribution {
    private k: integer  // Dimension
    private mu: Vector  // Mean vector
    private Sigma: Matrix  // Covariance matrix
    private L: Matrix  // Cholesky decomposition (cached)
    private logDetSigma: number  // Log determinant (cached)

    constructor(mu: Vector, Sigma: Matrix) {
        this.k = mu.length

        if (Sigma.rows !== this.k || Sigma.cols !== this.k) {
            throw Error("Sigma dimensions must match mu")
        }

        if (!isSymmetric(Sigma)) {
            throw Error("Sigma must be symmetric")
        }

        this.mu = mu.clone()
        this.Sigma = Sigma.clone()

        // Precompute Cholesky decomposition
        try {
            this.L = choleskyDecomposition(Sigma)
        } catch (e) {
            throw Error("Sigma must be positive definite")
        }

        // Compute log determinant
        this.logDetSigma = 0
        for (let i = 0; i < this.k; i++) {
            this.logDetSigma += 2 * log(this.L.get(i, i))
        }
    }

    pdf(x: Vector): number {
        if (x.length !== this.k) {
            throw Error("x dimension must match distribution dimension")
        }

        const logPDF = this.logPDF(x)
        return exp(logPDF)
    }

    logPDF(x: Vector): number {
        // Compute (x - mu)
        const diff = x.subtract(this.mu)

        // Solve L * y = diff
        const y = solveTriangularLower(this.L, diff)

        // Mahalanobis distance squared: D² = yᵀy
        const mahalanobisSq = y.dot(y)

        // Log PDF
        const logPDF = -0.5 * (this.k * log(2 * PI)
                              + this.logDetSigma
                              + mahalanobisSq)

        return logPDF
    }

    random(): Vector {
        // Generate standard normal vector
        const z = new Vector(this.k)
        for (let i = 0; i < this.k; i++) {
            z.set(i, randomNormal(0, 1))
        }

        // Transform: x = μ + L * z
        const Lz = this.L.multiply(z)
        return this.mu.add(Lz)
    }

    randomMultiple(n: integer): Matrix {
        // Generate n samples as columns of matrix
        const samples = new Matrix(this.k, n)

        for (let j = 0; j < n; j++) {
            const sample = this.random()
            for (let i = 0; i < this.k; i++) {
                samples.set(i, j, sample.get(i))
            }
        }

        return samples
    }

    mahalanobisDistance(x: Vector): number {
        const diff = x.subtract(this.mu)
        const y = solveTriangularLower(this.L, diff)
        return sqrt(y.dot(y))
    }

    conditional(observed_indices: integer[], observed_values: Vector): {
        mu: Vector,
        Sigma: Matrix
    } {
        // Compute conditional distribution given some variables
        const n_obs = observed_indices.length
        const n_unobs = this.k - n_obs

        if (n_obs === 0 || n_obs === this.k) {
            throw Error("Invalid conditioning")
        }

        const unobserved_indices = Array.from({length: this.k}, (_, i) => i)
            .filter(i => !observed_indices.includes(i))

        // Partition mean
        const mu1 = this.mu.slice(observed_indices)
        const mu2 = this.mu.slice(unobserved_indices)

        // Partition covariance
        const Sigma11 = this.Sigma.slice(observed_indices, observed_indices)
        const Sigma12 = this.Sigma.slice(observed_indices, unobserved_indices)
        const Sigma21 = this.Sigma.slice(unobserved_indices, observed_indices)
        const Sigma22 = this.Sigma.slice(unobserved_indices, unobserved_indices)

        // Compute conditional parameters
        const Sigma11_inv = Sigma11.inverse()
        const diff_obs = observed_values.subtract(mu1)

        const mu_cond = mu2.add(Sigma21.multiply(Sigma11_inv).multiply(diff_obs))
        const Sigma_cond = Sigma22.subtract(
            Sigma21.multiply(Sigma11_inv).multiply(Sigma12)
        )

        return { mu: mu_cond, Sigma: Sigma_cond }
    }

    mean(): Vector {
        return this.mu.clone()
    }

    covariance(): Matrix {
        return this.Sigma.clone()
    }
}

// Helper functions

function choleskyDecomposition(A: Matrix): Matrix {
    // Compute L such that A = L * Lᵀ
    const n = A.rows
    const L = new Matrix(n, n)

    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0

            for (let k = 0; k < j; k++) {
                sum += L.get(i, k) * L.get(j, k)
            }

            if (i === j) {
                const diag = A.get(i, i) - sum
                if (diag <= 0) {
                    throw Error("Matrix not positive definite")
                }
                L.set(i, j, sqrt(diag))
            } else {
                L.set(i, j, (A.get(i, j) - sum) / L.get(j, j))
            }
        }
    }

    return L
}

function solveTriangularLower(L: Matrix, b: Vector): Vector {
    // Solve L * x = b for lower triangular L
    const n = L.rows
    const x = new Vector(n)

    for (let i = 0; i < n; i++) {
        let sum = 0
        for (let j = 0; j < i; j++) {
            sum += L.get(i, j) * x.get(j)
        }
        x.set(i, (b.get(i) - sum) / L.get(i, i))
    }

    return x
}
```

---

## Implementation Strategy

### Phase 1: Core Discrete Distributions (Week 1-2)
1. Implement Poisson distribution (4.1)
2. Implement Binomial distribution (4.2)
3. Implement Geometric distribution (4.4)
4. Write comprehensive tests

### Phase 2: Advanced Discrete Distributions (Week 3)
1. Implement Negative Binomial (4.3)
2. Implement Hypergeometric (4.5)
3. Cross-validate with statistical libraries

### Phase 3: Additional Continuous Distributions (Week 4)
1. Implement Uniform continuous (4.6)
2. Implement Cauchy (4.7)
3. Implement Logistic (4.8)

### Phase 4: Special Functions & Multivariate (Week 5-6)
1. Implement Incomplete Beta (4.9)
   - Continued fraction
   - Series expansion
   - Inverse function
2. Implement Multivariate Normal (4.10)
3. Integration testing with Phase 3 distributions

### Phase 5: WASM Optimization (Week 7-8)
1. Port algorithms to AssemblyScript
2. Benchmark and optimize
3. Implement parallel sampling for multivariate

---

## Testing Requirements

### Unit Tests
- PDF/PMF correctness (compare with known values)
- CDF correctness (boundary cases, monotonicity)
- Inverse CDF (round-trip: Q(F(x)) ≈ x)
- Random sampling (statistical tests: χ² goodness-of-fit, KS test)

### Integration Tests
- Cross-distribution relationships (e.g., Geometric is special case of Negative Binomial)
- Incomplete Beta used in Binomial/Beta CDF
- Multivariate Normal marginals are univariate Normal

### Performance Benchmarks
- PDF/CDF evaluation speed
- Random sampling throughput
- WASM vs JavaScript comparison
- Parallel sampling efficiency (multivariate)

---

## Dependencies

### From Phase 1 (Special Functions)
- `logGamma`: logarithm of gamma function
- `gamma`: gamma function
- `incompleteBeta`: regularized incomplete beta (task 4.9)

### From Phase 3 (Continuous Distributions)
- `normalCDF`, `normalInverseCDF`: for approximations
- `gammaCDF`, `gammaRandom`: for Negative Binomial sampling

### Internal Dependencies
- Random number generator (uniform)
- Matrix operations (Cholesky, solve triangular)
- Numerical constants (PI, EPSILON)

---

## References

1. **Poisson**: Ahrens & Dieter (1982) - "Computer Generation of Poisson Deviates"
2. **Binomial**: Kachitvichyanukul & Schmeiser (1988) - "Binomial Random Variate Generation"
3. **Negative Binomial**: Devroye (1986) - "Non-Uniform Random Variate Generation"
4. **Incomplete Beta**: DiDonato & Morris (1992) - "Algorithm 708"
5. **Multivariate Normal**: Gentle (2003) - "Random Number Generation and Monte Carlo Methods"

---

## Success Criteria

- ✅ All 10 distributions implemented with PDF/PMF, CDF, inverse CDF, and random sampling
- ✅ Numerical accuracy: relative error < 1e-12 for most inputs
- ✅ Random sampling passes KS test at α = 0.01
- ✅ WASM achieves 3-8x speedup for large-scale operations
- ✅ Comprehensive documentation with examples
- ✅ 100% test coverage

---

**End of Phase 4 Breakdown**
