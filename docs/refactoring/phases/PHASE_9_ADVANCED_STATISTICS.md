# Phase 9: Advanced Statistics

**Complete Implementation Guide with Algorithms, Formulas, and Statistical Tests**

---

## Overview

This document provides detailed mathematical formulas, test statistics, critical value approximations, and complete implementation pseudocode for 10 advanced statistical functions. Each function includes multiple variants (where applicable), numerical stability considerations, and performance optimization strategies for TypeScript/WASM implementation.

**Performance Targets:**
- JavaScript baseline: Current performance
- WASM: 3-10x speedup for matrix-heavy operations (covariance, bootstrap)
- Parallel: Additional 2-4x for resampling methods (bootstrap, permutation tests)

**Numerical Precision:**
- Relative error < 10⁻¹² for test statistics
- P-value accuracy: ±10⁻⁶ for standard distributions
- Bootstrap: 10,000+ resamples for stable confidence intervals

---

## Task 9.1: T-Test

### Mathematical Foundation

The t-test compares means using the t-distribution to account for sample size and variance.

**T-Statistic General Form:**
```
t = (estimate - hypothesis) / SE(estimate)
```

Where SE is the standard error of the estimate.

### 9.1.1: One-Sample T-Test

**Goal**: Test if sample mean differs from population mean μ₀

**Hypotheses:**
- H₀: μ = μ₀
- H₁: μ ≠ μ₀ (two-sided), μ > μ₀ (right), μ < μ₀ (left)

**Test Statistic:**
```
t = (x̄ - μ₀) / (s / √n)
```

Where:
- x̄ = sample mean = (1/n) Σxᵢ
- s = sample standard deviation = √[(1/(n-1)) Σ(xᵢ - x̄)²]
- n = sample size
- df = n - 1 (degrees of freedom)

**P-Value:**
```
Two-sided: p = 2 * P(T > |t|) where T ~ t_{n-1}
Right-sided: p = P(T > t)
Left-sided: p = P(T < t)
```

**Confidence Interval (1-α):**
```
CI = x̄ ± t_{α/2, n-1} * (s / √n)
```

### 9.1.2: Two-Sample T-Test (Independent Samples)

**Goal**: Test if two independent samples have equal means

**Hypotheses:**
- H₀: μ₁ = μ₂
- H₁: μ₁ ≠ μ₂

#### Variant A: Equal Variances (Student's t-test)

**Pooled Standard Deviation:**
```
s_p = √[((n₁-1)s₁² + (n₂-1)s₂²) / (n₁ + n₂ - 2)]
```

**Test Statistic:**
```
t = (x̄₁ - x̄₂) / (s_p * √(1/n₁ + 1/n₂))

df = n₁ + n₂ - 2
```

#### Variant B: Unequal Variances (Welch's t-test)

**Test Statistic:**
```
t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)
```

**Welch-Satterthwaite Degrees of Freedom:**
```
df = (s₁²/n₁ + s₂²/n₂)² /
     [(s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1)]
```

**Confidence Interval:**
```
CI = (x̄₁ - x̄₂) ± t_{α/2, df} * √(s₁²/n₁ + s₂²/n₂)
```

### 9.1.3: Paired T-Test

**Goal**: Test if paired observations have mean difference of zero

**Differences:**
```
dᵢ = x₁ᵢ - x₂ᵢ   for i = 1..n
d̄ = (1/n) Σdᵢ
s_d = √[(1/(n-1)) Σ(dᵢ - d̄)²]
```

**Test Statistic:**
```
t = d̄ / (s_d / √n)

df = n - 1
```

### Algorithm: Complete T-Test Implementation

```typescript
interface TTestResult {
  statistic: number    // t-statistic
  pValue: number       // two-sided p-value
  df: number           // degrees of freedom
  ci: [number, number] // confidence interval
  mean: number         // sample mean or mean difference
  stderr: number       // standard error
}

function tTestOneSample(
  data: number[],
  mu0: number = 0,
  alternative: 'two-sided' | 'less' | 'greater' = 'two-sided',
  alpha: number = 0.05
): TTestResult {
  const n = data.length

  if (n < 2) {
    throw new Error('Sample size must be at least 2')
  }

  // Compute sample mean
  const mean = data.reduce((sum, x) => sum + x, 0) / n

  // Compute sample variance (Welford's algorithm for numerical stability)
  let M2 = 0
  let runningMean = 0

  for (let i = 0; i < n; i++) {
    const delta = data[i] - runningMean
    runningMean += delta / (i + 1)
    const delta2 = data[i] - runningMean
    M2 += delta * delta2
  }

  const variance = M2 / (n - 1)
  const stdDev = Math.sqrt(variance)
  const stderr = stdDev / Math.sqrt(n)

  // Compute t-statistic
  const t = (mean - mu0) / stderr
  const df = n - 1

  // Compute p-value using t-distribution CDF
  let pValue: number
  switch (alternative) {
    case 'two-sided':
      pValue = 2 * tCDF(-Math.abs(t), df)
      break
    case 'less':
      pValue = tCDF(t, df)
      break
    case 'greater':
      pValue = 1 - tCDF(t, df)
      break
  }

  // Confidence interval (two-sided)
  const tCritical = tQuantile(1 - alpha / 2, df)
  const margin = tCritical * stderr
  const ci: [number, number] = [mean - margin, mean + margin]

  return {
    statistic: t,
    pValue,
    df,
    ci,
    mean,
    stderr
  }
}

function tTestTwoSample(
  data1: number[],
  data2: number[],
  equalVariance: boolean = true,
  alternative: 'two-sided' | 'less' | 'greater' = 'two-sided',
  alpha: number = 0.05
): TTestResult {
  const n1 = data1.length
  const n2 = data2.length

  if (n1 < 2 || n2 < 2) {
    throw new Error('Each sample must have at least 2 observations')
  }

  // Compute means and variances
  const stats1 = computeStats(data1)
  const stats2 = computeStats(data2)

  const meanDiff = stats1.mean - stats2.mean

  let t: number, df: number, stderr: number

  if (equalVariance) {
    // Pooled variance t-test
    const pooledVar =
      ((n1 - 1) * stats1.variance + (n2 - 1) * stats2.variance) /
      (n1 + n2 - 2)

    stderr = Math.sqrt(pooledVar * (1/n1 + 1/n2))
    t = meanDiff / stderr
    df = n1 + n2 - 2
  } else {
    // Welch's t-test
    const var1 = stats1.variance / n1
    const var2 = stats2.variance / n2

    stderr = Math.sqrt(var1 + var2)
    t = meanDiff / stderr

    // Welch-Satterthwaite degrees of freedom
    df = Math.pow(var1 + var2, 2) /
         (Math.pow(var1, 2) / (n1 - 1) + Math.pow(var2, 2) / (n2 - 1))
  }

  // Compute p-value
  let pValue: number
  switch (alternative) {
    case 'two-sided':
      pValue = 2 * tCDF(-Math.abs(t), df)
      break
    case 'less':
      pValue = tCDF(t, df)
      break
    case 'greater':
      pValue = 1 - tCDF(t, df)
      break
  }

  // Confidence interval
  const tCritical = tQuantile(1 - alpha / 2, df)
  const margin = tCritical * stderr
  const ci: [number, number] = [meanDiff - margin, meanDiff + margin]

  return {
    statistic: t,
    pValue,
    df,
    ci,
    mean: meanDiff,
    stderr
  }
}

function tTestPaired(
  data1: number[],
  data2: number[],
  alternative: 'two-sided' | 'less' | 'greater' = 'two-sided',
  alpha: number = 0.05
): TTestResult {
  if (data1.length !== data2.length) {
    throw new Error('Paired samples must have equal length')
  }

  // Compute differences
  const differences = data1.map((x, i) => x - data2[i])

  // Perform one-sample t-test on differences
  return tTestOneSample(differences, 0, alternative, alpha)
}

// Helper function for computing sample statistics
function computeStats(data: number[]): {
  mean: number
  variance: number
  stdDev: number
} {
  const n = data.length

  // Welford's algorithm
  let M2 = 0
  let mean = 0

  for (let i = 0; i < n; i++) {
    const delta = data[i] - mean
    mean += delta / (i + 1)
    const delta2 = data[i] - mean
    M2 += delta * delta2
  }

  const variance = n > 1 ? M2 / (n - 1) : 0

  return {
    mean,
    variance,
    stdDev: Math.sqrt(variance)
  }
}
```

### T-Distribution Functions

```typescript
// T-distribution CDF using incomplete beta function
function tCDF(t: number, df: number): number {
  if (df <= 0) throw new Error('df must be positive')

  if (t === 0) return 0.5

  const x = df / (df + t * t)
  const a = df / 2
  const b = 0.5

  let p = 0.5 * incompleteBeta(x, a, b)

  return t > 0 ? 1 - p : p
}

// T-distribution quantile (inverse CDF)
function tQuantile(p: number, df: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('p must be in (0, 1)')
  }

  if (df <= 0) {
    throw new Error('df must be positive')
  }

  // Use Newton-Raphson iteration
  let t: number

  // Initial guess from normal approximation
  if (df > 30) {
    t = normalQuantile(p)
  } else {
    // Better initial guess for small df
    const x = incompleteBetaInv(2 * Math.min(p, 1 - p), df / 2, 0.5)
    t = Math.sqrt(df * (1 - x) / x)
    if (p < 0.5) t = -t
  }

  // Newton-Raphson refinement
  for (let iter = 0; iter < 10; iter++) {
    const F = tCDF(t, df)
    const f = tPDF(t, df)

    const error = F - p
    if (Math.abs(error) < 1e-12) break

    t = t - error / f
  }

  return t
}

// T-distribution PDF
function tPDF(t: number, df: number): number {
  const numerator = gamma((df + 1) / 2)
  const denominator = Math.sqrt(df * Math.PI) * gamma(df / 2)

  return numerator / denominator *
         Math.pow(1 + t * t / df, -(df + 1) / 2)
}
```

### Edge Cases & Numerical Considerations

- **Small samples (n < 30)**: T-distribution critical values differ significantly from normal
- **Large samples (n > 100)**: T-distribution converges to normal; use z-test for speed
- **Outliers**: Consider robust alternatives (Wilcoxon, trimmed mean)
- **Variance check**: Use F-test or Levene's test to verify equal variance assumption
- **Numerical stability**: Use Welford's algorithm for variance computation

**Complexity**: O(n) for sample statistics, O(1) for distribution functions (with iteration)

---

## Task 9.2: Chi-Square Test

### Mathematical Foundation

The chi-square (χ²) test compares observed frequencies to expected frequencies.

### 9.2.1: Goodness of Fit Test

**Goal**: Test if observed data follows a specified distribution

**Test Statistic:**
```
χ² = Σ [(Oᵢ - Eᵢ)² / Eᵢ]   for i = 1..k
```

Where:
- Oᵢ = observed frequency in category i
- Eᵢ = expected frequency in category i
- k = number of categories
- df = k - 1 - p (p = number of estimated parameters)

**P-Value:**
```
p = P(X > χ²) where X ~ χ²_{df}
```

### 9.2.2: Test of Independence (Contingency Tables)

**Goal**: Test if two categorical variables are independent

For r×c contingency table:

**Expected Frequencies:**
```
E_{ij} = (row_total_i × col_total_j) / grand_total
```

**Test Statistic:**
```
χ² = Σᵢ Σⱼ [(O_{ij} - E_{ij})² / E_{ij}]
```

**Degrees of Freedom:**
```
df = (r - 1) × (c - 1)
```

**Yates' Continuity Correction (for 2×2 tables):**
```
χ²_corrected = Σ [(|Oᵢ - Eᵢ| - 0.5)² / Eᵢ]
```

### Algorithm Implementation

```typescript
interface ChiSquareResult {
  statistic: number
  pValue: number
  df: number
  expected: number[] | number[][]
  residuals: number[] | number[][]
}

function chiSquareGOF(
  observed: number[],
  expected?: number[],
  probabilities?: number[]
): ChiSquareResult {
  const k = observed.length

  if (k < 2) {
    throw new Error('Need at least 2 categories')
  }

  // Compute expected frequencies
  let expectedFreq: number[]
  let df: number

  if (expected !== undefined) {
    expectedFreq = expected
    df = k - 1
  } else if (probabilities !== undefined) {
    const total = observed.reduce((sum, x) => sum + x, 0)
    expectedFreq = probabilities.map(p => p * total)
    df = k - 1
  } else {
    // Uniform distribution
    const total = observed.reduce((sum, x) => sum + x, 0)
    expectedFreq = Array(k).fill(total / k)
    df = k - 1
  }

  // Check minimum expected frequency (rule of thumb: ≥ 5)
  const minExpected = Math.min(...expectedFreq)
  if (minExpected < 5) {
    console.warn(`Minimum expected frequency (${minExpected}) < 5. Results may be unreliable.`)
  }

  // Compute chi-square statistic
  let chiSq = 0
  const residuals: number[] = []

  for (let i = 0; i < k; i++) {
    const O = observed[i]
    const E = expectedFreq[i]

    if (E === 0) {
      throw new Error('Expected frequency cannot be zero')
    }

    const diff = O - E
    chiSq += (diff * diff) / E
    residuals.push(diff / Math.sqrt(E))  // Pearson residuals
  }

  // Compute p-value
  const pValue = 1 - chiSquareCDF(chiSq, df)

  return {
    statistic: chiSq,
    pValue,
    df,
    expected: expectedFreq,
    residuals
  }
}

function chiSquareIndependence(
  contingencyTable: number[][],
  yatesCorrection: boolean = false
): ChiSquareResult {
  const r = contingencyTable.length        // rows
  const c = contingencyTable[0].length     // columns

  if (r < 2 || c < 2) {
    throw new Error('Contingency table must be at least 2×2')
  }

  // Compute marginal totals
  const rowTotals = contingencyTable.map(row =>
    row.reduce((sum, x) => sum + x, 0)
  )

  const colTotals: number[] = []
  for (let j = 0; j < c; j++) {
    colTotals[j] = contingencyTable.reduce((sum, row) => sum + row[j], 0)
  }

  const grandTotal = rowTotals.reduce((sum, x) => sum + x, 0)

  // Compute expected frequencies
  const expected: number[][] = []
  for (let i = 0; i < r; i++) {
    expected[i] = []
    for (let j = 0; j < c; j++) {
      expected[i][j] = (rowTotals[i] * colTotals[j]) / grandTotal
    }
  }

  // Check minimum expected frequency
  const minExpected = Math.min(...expected.flat())
  if (minExpected < 5) {
    console.warn(`Minimum expected frequency (${minExpected}) < 5. Consider Fisher's exact test.`)
  }

  // Compute chi-square statistic
  let chiSq = 0
  const residuals: number[][] = []

  for (let i = 0; i < r; i++) {
    residuals[i] = []
    for (let j = 0; j < c; j++) {
      const O = contingencyTable[i][j]
      const E = expected[i][j]

      let diff = O - E

      // Yates' correction for 2×2 tables
      if (yatesCorrection && r === 2 && c === 2) {
        diff = Math.abs(diff) - 0.5
        if (diff < 0) diff = 0
      }

      chiSq += (diff * diff) / E
      residuals[i][j] = diff / Math.sqrt(E)
    }
  }

  const df = (r - 1) * (c - 1)
  const pValue = 1 - chiSquareCDF(chiSq, df)

  return {
    statistic: chiSq,
    pValue,
    df,
    expected,
    residuals
  }
}
```

### Chi-Square Distribution Functions

```typescript
// Chi-square CDF using incomplete gamma function
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0
  if (df <= 0) throw new Error('df must be positive')

  // χ²(k) is Gamma(k/2, 2) distribution
  // P(X ≤ x) = P(Gamma(k/2, 2) ≤ x) = gammaCDF(x, k/2, 2)

  return lowerIncompleteGamma(df / 2, x / 2) / gamma(df / 2)
}

// Chi-square quantile
function chiSquareQuantile(p: number, df: number): number {
  if (p <= 0 || p >= 1) throw new Error('p must be in (0, 1)')
  if (df <= 0) throw new Error('df must be positive')

  // Wilson-Hilferty approximation for initial guess
  const z = normalQuantile(p)
  const x0 = df * Math.pow(1 - 2/(9*df) + z * Math.sqrt(2/(9*df)), 3)

  // Newton-Raphson refinement
  let x = Math.max(x0, 0.001)

  for (let iter = 0; iter < 20; iter++) {
    const F = chiSquareCDF(x, df)
    const f = chiSquarePDF(x, df)

    const error = F - p
    if (Math.abs(error) < 1e-12) break

    x = x - error / f
    x = Math.max(x, 0.001)  // Keep positive
  }

  return x
}

// Chi-square PDF
function chiSquarePDF(x: number, df: number): number {
  if (x <= 0) return 0

  const k = df / 2
  return Math.pow(x, k - 1) * Math.exp(-x / 2) /
         (Math.pow(2, k) * gamma(k))
}
```

### Edge Cases & Numerical Considerations

- **Small expected frequencies**: χ² approximation invalid if any E < 5
- **2×2 tables**: Use Yates' correction or Fisher's exact test
- **Large contingency tables**: Sparse tables may need collapsing categories
- **Goodness of fit**: Reduce df by number of estimated parameters
- **Continuity**: χ² test is for large samples; exact tests preferred for small n

**Complexity**: O(k) for goodness of fit, O(r×c) for independence test

---

## Task 9.3: F-Test

### Mathematical Foundation

The F-test compares two variances using the F-distribution.

**Test Statistic:**
```
F = s₁² / s₂²
```

Where:
- s₁² = variance of sample 1 (larger variance in numerator)
- s₂² = variance of sample 2
- df₁ = n₁ - 1 (numerator degrees of freedom)
- df₂ = n₂ - 1 (denominator degrees of freedom)

**Hypotheses:**
- H₀: σ₁² = σ₂² (equal variances)
- H₁: σ₁² ≠ σ₂² (two-sided)

**P-Value (two-sided):**
```
p = 2 × min(P(F_{df₁,df₂} ≥ F), P(F_{df₁,df₂} ≤ F))
```

### Algorithm Implementation

```typescript
interface FTestResult {
  statistic: number     // F-statistic
  pValue: number        // two-sided p-value
  df1: number          // numerator df
  df2: number          // denominator df
  variance1: number
  variance2: number
}

function fTest(
  data1: number[],
  data2: number[],
  alternative: 'two-sided' | 'greater' | 'less' = 'two-sided'
): FTestResult {
  if (data1.length < 2 || data2.length < 2) {
    throw new Error('Each sample must have at least 2 observations')
  }

  // Compute sample variances
  const stats1 = computeStats(data1)
  const stats2 = computeStats(data2)

  let var1 = stats1.variance
  let var2 = stats2.variance
  let df1 = data1.length - 1
  let df2 = data2.length - 1

  // Always put larger variance in numerator for two-sided test
  if (alternative === 'two-sided' && var2 > var1) {
    [var1, var2] = [var2, var1]
    ;[df1, df2] = [df2, df1]
  }

  const F = var1 / var2

  // Compute p-value
  let pValue: number

  switch (alternative) {
    case 'two-sided':
      // Two-sided: probability in both tails
      const p_upper = 1 - fCDF(F, df1, df2)
      pValue = 2 * Math.min(p_upper, 1 - p_upper)
      break

    case 'greater':
      // Test if var1 > var2
      pValue = 1 - fCDF(F, df1, df2)
      break

    case 'less':
      // Test if var1 < var2
      pValue = fCDF(F, df1, df2)
      break
  }

  return {
    statistic: F,
    pValue,
    df1,
    df2,
    variance1: var1,
    variance2: var2
  }
}
```

### F-Distribution Functions

```typescript
// F-distribution CDF using incomplete beta function
function fCDF(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0

  // F_{df1,df2} relates to Beta distribution via:
  // P(F ≤ x) = I_{df1*x/(df1*x+df2)}(df1/2, df2/2)

  const t = (df1 * x) / (df1 * x + df2)
  return incompleteBeta(t, df1 / 2, df2 / 2)
}

// F-distribution quantile
function fQuantile(p: number, df1: number, df2: number): number {
  if (p <= 0 || p >= 1) throw new Error('p must be in (0, 1)')

  // Use beta quantile relationship
  const betaQuantile = incompleteBetaInv(p, df1 / 2, df2 / 2)

  // Transform back to F distribution
  return (df2 * betaQuantile) / (df1 * (1 - betaQuantile))
}

// F-distribution PDF
function fPDF(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0

  const a = df1 / 2
  const b = df2 / 2

  const numerator = Math.pow(df1 / df2, a) * Math.pow(x, a - 1)
  const denominator = beta(a, b) * Math.pow(1 + (df1 / df2) * x, a + b)

  return numerator / denominator
}
```

### Levene's Test (Robust Alternative)

More robust to non-normality:

```typescript
function leveneTest(
  groups: number[][],
  center: 'mean' | 'median' | 'trimmed' = 'median'
): FTestResult {
  // Compute group centers
  const centers = groups.map(group => {
    switch (center) {
      case 'mean':
        return group.reduce((s, x) => s + x, 0) / group.length
      case 'median':
        return median(group)
      case 'trimmed':
        return trimmedMean(group, 0.1)  // 10% trimming
    }
  })

  // Compute absolute deviations from center
  const deviations = groups.map((group, i) =>
    group.map(x => Math.abs(x - centers[i]))
  )

  // Perform one-way ANOVA on deviations
  return anovaOneWay(deviations)
}
```

### Edge Cases & Numerical Considerations

- **Sensitivity to non-normality**: F-test assumes normal distributions
- **Robust alternatives**: Use Levene's test or Brown-Forsythe test
- **Large sample sizes**: Asymptotically approaches χ² test
- **Variance ratios**: Extreme ratios (F >> 1 or F << 1) may indicate issues

**Complexity**: O(n₁ + n₂)

---

## Task 9.4: ANOVA (Analysis of Variance)

### Mathematical Foundation

ANOVA tests if multiple group means are equal by comparing between-group and within-group variance.

### 9.4.1: One-Way ANOVA

**Goal**: Test if k group means are equal

**Hypotheses:**
- H₀: μ₁ = μ₂ = ... = μₖ
- H₁: At least one mean differs

**Total Sum of Squares (SST):**
```
SST = Σᵢ Σⱼ (yᵢⱼ - ȳ)²
```

**Between-Group Sum of Squares (SSB):**
```
SSB = Σᵢ nᵢ(ȳᵢ - ȳ)²
```

**Within-Group Sum of Squares (SSW):**
```
SSW = Σᵢ Σⱼ (yᵢⱼ - ȳᵢ)²
```

**Relationship:**
```
SST = SSB + SSW
```

**Mean Squares:**
```
MSB = SSB / (k - 1)           (between-group mean square)
MSW = SSW / (N - k)           (within-group mean square)
```

Where:
- k = number of groups
- N = total number of observations
- nᵢ = size of group i

**F-Statistic:**
```
F = MSB / MSW ~ F_{k-1, N-k}
```

### 9.4.2: Two-Way ANOVA

**Goal**: Test effects of two factors and their interaction

**Model:**
```
yᵢⱼₖ = μ + αᵢ + βⱼ + (αβ)ᵢⱼ + εᵢⱼₖ
```

Where:
- αᵢ = effect of factor A (level i)
- βⱼ = effect of factor B (level j)
- (αβ)ᵢⱼ = interaction effect
- εᵢⱼₖ = random error

**Sum of Squares Decomposition:**
```
SST = SSA + SSB + SSAB + SSE
```

Where:
- SSA = sum of squares for factor A
- SSB = sum of squares for factor B
- SSAB = sum of squares for interaction
- SSE = error sum of squares

**SSA (Factor A):**
```
SSA = bn Σᵢ (ȳᵢ.. - ȳ...)²
```

**SSB (Factor B):**
```
SSB = an Σⱼ (ȳ.ⱼ. - ȳ...)²
```

**SSAB (Interaction):**
```
SSAB = n Σᵢ Σⱼ (ȳᵢⱼ. - ȳᵢ.. - ȳ.ⱼ. + ȳ...)²
```

**SSE (Error):**
```
SSE = Σᵢ Σⱼ Σₖ (yᵢⱼₖ - ȳᵢⱼ.)²
```

**F-Statistics:**
```
F_A = MSA / MSE ~ F_{a-1, ab(n-1)}
F_B = MSB / MSE ~ F_{b-1, ab(n-1)}
F_AB = MSAB / MSE ~ F_{(a-1)(b-1), ab(n-1)}
```

### Algorithm Implementation

```typescript
interface ANOVAResult {
  fStatistic: number
  pValue: number
  dfBetween: number
  dfWithin: number
  dfTotal: number
  ssb: number           // between-group sum of squares
  ssw: number           // within-group sum of squares
  sst: number           // total sum of squares
  msb: number           // between-group mean square
  msw: number           // within-group mean square
  etaSquared: number    // effect size (η²)
}

function anovaOneWay(groups: number[][]): ANOVAResult {
  const k = groups.length  // number of groups

  if (k < 2) {
    throw new Error('Need at least 2 groups for ANOVA')
  }

  // Compute group sizes, means, and grand mean
  const n_i = groups.map(g => g.length)
  const N = n_i.reduce((sum, n) => sum + n, 0)

  const means = groups.map(group =>
    group.reduce((sum, x) => sum + x, 0) / group.length
  )

  const grandMean = groups.flat().reduce((sum, x) => sum + x, 0) / N

  // Compute sum of squares
  let SSB = 0  // between-group
  let SSW = 0  // within-group

  for (let i = 0; i < k; i++) {
    // Between-group: nᵢ(ȳᵢ - ȳ)²
    SSB += n_i[i] * Math.pow(means[i] - grandMean, 2)

    // Within-group: Σ(yᵢⱼ - ȳᵢ)²
    for (let j = 0; j < groups[i].length; j++) {
      SSW += Math.pow(groups[i][j] - means[i], 2)
    }
  }

  const SST = SSB + SSW  // Total sum of squares

  // Degrees of freedom
  const dfBetween = k - 1
  const dfWithin = N - k
  const dfTotal = N - 1

  // Mean squares
  const MSB = SSB / dfBetween
  const MSW = SSW / dfWithin

  // F-statistic
  const F = MSB / MSW

  // P-value
  const pValue = 1 - fCDF(F, dfBetween, dfWithin)

  // Effect size (eta-squared)
  const etaSquared = SSB / SST

  return {
    fStatistic: F,
    pValue,
    dfBetween,
    dfWithin,
    dfTotal,
    ssb: SSB,
    ssw: SSW,
    sst: SST,
    msb: MSB,
    msw: MSW,
    etaSquared
  }
}

interface TwoWayANOVAResult {
  factorA: {
    fStatistic: number
    pValue: number
    df: number
    ss: number
    ms: number
  }
  factorB: {
    fStatistic: number
    pValue: number
    df: number
    ss: number
    ms: number
  }
  interaction: {
    fStatistic: number
    pValue: number
    df: number
    ss: number
    ms: number
  }
  error: {
    df: number
    ss: number
    ms: number
  }
  total: {
    df: number
    ss: number
  }
}

function anovaTwoWay(
  data: number[][][],  // data[i][j][k] = observation k in cell (i,j)
  hasReplicates: boolean = true
): TwoWayANOVAResult {
  const a = data.length           // levels of factor A
  const b = data[0].length        // levels of factor B
  const n = data[0][0].length     // replicates per cell

  if (!hasReplicates && n !== 1) {
    throw new Error('For no replicates, n must be 1')
  }

  // Compute cell means and marginal means
  const cellMeans: number[][] = []
  const rowMeans: number[] = []
  const colMeans: number[] = []
  let grandMean = 0
  let grandTotal = 0
  let grandCount = 0

  for (let i = 0; i < a; i++) {
    cellMeans[i] = []
    let rowSum = 0
    let rowCount = 0

    for (let j = 0; j < b; j++) {
      const cellSum = data[i][j].reduce((s, x) => s + x, 0)
      const cellCount = data[i][j].length
      cellMeans[i][j] = cellSum / cellCount

      rowSum += cellSum
      rowCount += cellCount
      grandTotal += cellSum
      grandCount += cellCount
    }

    rowMeans[i] = rowSum / rowCount
  }

  for (let j = 0; j < b; j++) {
    let colSum = 0
    let colCount = 0
    for (let i = 0; i < a; i++) {
      colSum += data[i][j].reduce((s, x) => s + x, 0)
      colCount += data[i][j].length
    }
    colMeans[j] = colSum / colCount
  }

  grandMean = grandTotal / grandCount

  // Compute sum of squares
  let SSA = 0   // Factor A
  let SSB = 0   // Factor B
  let SSAB = 0  // Interaction
  let SSE = 0   // Error

  // SSA: effect of factor A
  for (let i = 0; i < a; i++) {
    SSA += b * n * Math.pow(rowMeans[i] - grandMean, 2)
  }

  // SSB: effect of factor B
  for (let j = 0; j < b; j++) {
    SSB += a * n * Math.pow(colMeans[j] - grandMean, 2)
  }

  // SSAB: interaction
  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      const interaction = cellMeans[i][j] - rowMeans[i] - colMeans[j] + grandMean
      SSAB += n * Math.pow(interaction, 2)
    }
  }

  // SSE: error (within-cell variation)
  if (hasReplicates) {
    for (let i = 0; i < a; i++) {
      for (let j = 0; j < b; j++) {
        for (let k = 0; k < data[i][j].length; k++) {
          SSE += Math.pow(data[i][j][k] - cellMeans[i][j], 2)
        }
      }
    }
  } else {
    // No replicates: use interaction as error
    SSE = SSAB
    SSAB = 0
  }

  const SST = SSA + SSB + SSAB + SSE

  // Degrees of freedom
  const dfA = a - 1
  const dfB = b - 1
  const dfAB = hasReplicates ? (a - 1) * (b - 1) : 0
  const dfE = hasReplicates ? a * b * (n - 1) : (a - 1) * (b - 1)
  const dfTotal = grandCount - 1

  // Mean squares
  const MSA = SSA / dfA
  const MSB = SSB / dfB
  const MSAB = hasReplicates ? SSAB / dfAB : 0
  const MSE = SSE / dfE

  // F-statistics
  const F_A = MSA / MSE
  const F_B = MSB / MSE
  const F_AB = hasReplicates ? MSAB / MSE : 0

  // P-values
  const pValue_A = 1 - fCDF(F_A, dfA, dfE)
  const pValue_B = 1 - fCDF(F_B, dfB, dfE)
  const pValue_AB = hasReplicates ? 1 - fCDF(F_AB, dfAB, dfE) : 1

  return {
    factorA: {
      fStatistic: F_A,
      pValue: pValue_A,
      df: dfA,
      ss: SSA,
      ms: MSA
    },
    factorB: {
      fStatistic: F_B,
      pValue: pValue_B,
      df: dfB,
      ss: SSB,
      ms: MSB
    },
    interaction: {
      fStatistic: F_AB,
      pValue: pValue_AB,
      df: dfAB,
      ss: SSAB,
      ms: MSAB
    },
    error: {
      df: dfE,
      ss: SSE,
      ms: MSE
    },
    total: {
      df: dfTotal,
      ss: SST
    }
  }
}
```

### Post-Hoc Tests

```typescript
// Tukey's Honest Significant Difference (HSD)
function tukeyHSD(
  groups: number[][],
  alpha: number = 0.05
): { comparison: string, meanDiff: number, ci: [number, number], pValue: number }[] {
  const k = groups.length
  const anovaResult = anovaOneWay(groups)
  const MSW = anovaResult.msw

  const means = groups.map(g => g.reduce((s, x) => s + x, 0) / g.length)
  const n = groups.map(g => g.length)

  const results: { comparison: string, meanDiff: number, ci: [number, number], pValue: number }[] = []

  // Compare all pairs
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const diff = Math.abs(means[i] - means[j])
      const se = Math.sqrt(MSW * (1/n[i] + 1/n[j]) / 2)

      // Studentized range statistic
      const q = diff / se

      // Critical value from studentized range distribution
      const q_critical = studentizedRangeQuantile(1 - alpha, k, anovaResult.dfWithin)

      const pValue = 1 - studentizedRangeCDF(q, k, anovaResult.dfWithin)

      const margin = q_critical * se
      const ci: [number, number] = [diff - margin, diff + margin]

      results.push({
        comparison: `Group ${i+1} vs Group ${j+1}`,
        meanDiff: means[i] - means[j],
        ci,
        pValue
      })
    }
  }

  return results
}
```

### Edge Cases & Assumptions

- **Normality**: Each group should be approximately normal (robust to moderate violations)
- **Homogeneity of variance**: Use Levene's test to check
- **Independence**: Observations must be independent
- **Balanced design**: Equal group sizes preferred but not required
- **Sample size**: Each group should have n ≥ 5 for reliable results
- **Multiple comparisons**: Use post-hoc tests (Tukey, Bonferroni) to control family-wise error rate

**Complexity**:
- One-way: O(N) where N = total observations
- Two-way: O(abn) where a, b = factor levels, n = replicates

---

## Task 9.5: Kolmogorov-Smirnov Test

### Mathematical Foundation

The KS test compares empirical distribution functions (EDFs).

### 9.5.1: One-Sample KS Test

**Goal**: Test if sample follows a specified distribution F₀(x)

**Empirical Distribution Function (EDF):**
```
F_n(x) = (1/n) × #{xᵢ ≤ x}
```

**KS Statistic (Maximum Vertical Distance):**
```
D = sup_x |F_n(x) - F₀(x)|
```

**Practical Computation:**
```
D⁺ = max_i [(i/n) - F₀(x_{(i)})]        (from above)
D⁻ = max_i [F₀(x_{(i)}) - (i-1)/n]      (from below)
D = max(D⁺, D⁻)
```

Where x₍ᵢ₎ are the ordered sample values.

### 9.5.2: Two-Sample KS Test

**Goal**: Test if two samples come from the same distribution

**Test Statistic:**
```
D_{n,m} = sup_x |F_n(x) - G_m(x)|
```

Where:
- F_n = EDF of sample 1 (size n)
- G_m = EDF of sample 2 (size m)

**Practical Computation:**
```
# Combine and sort all observations
# Track which sample each observation came from
# Compute maximum vertical distance between EDFs
```

### Asymptotic Distribution

For large n:
```
P(√n · D ≤ t) → K(t) = 1 - 2Σ_{k=1}^∞ (-1)^{k-1} exp(-2k²t²)
```

**Kolmogorov Distribution:**
```
K(t) = √(2π)/t Σ_{k=1}^∞ exp(-(2k-1)²π²/(8t²))
```

### Algorithm Implementation

```typescript
interface KSTestResult {
  statistic: number     // D statistic
  pValue: number
  statisticLocation: number  // x where max difference occurs
}

function ksTestOneSample(
  data: number[],
  cdf: (x: number) => number,  // Theoretical CDF
  alternative: 'two-sided' | 'less' | 'greater' = 'two-sided'
): KSTestResult {
  const n = data.length

  if (n === 0) {
    throw new Error('Sample must be non-empty')
  }

  // Sort data
  const sorted = [...data].sort((a, b) => a - b)

  let D_plus = 0
  let D_minus = 0
  let location = sorted[0]

  for (let i = 0; i < n; i++) {
    const x = sorted[i]
    const F0 = cdf(x)  // Theoretical CDF at x

    // EDF values: (i+1)/n from above, i/n from below
    const F_above = (i + 1) / n
    const F_below = i / n

    // Differences
    const d_plus = F_above - F0
    const d_minus = F0 - F_below

    if (d_plus > D_plus) {
      D_plus = d_plus
      if (alternative === 'two-sided' || alternative === 'greater') {
        location = x
      }
    }

    if (d_minus > D_minus) {
      D_minus = d_minus
      if (alternative === 'less' || (alternative === 'two-sided' && d_minus > D_plus)) {
        location = x
      }
    }
  }

  let D: number
  switch (alternative) {
    case 'two-sided':
      D = Math.max(D_plus, D_minus)
      break
    case 'greater':
      D = D_plus
      break
    case 'less':
      D = D_minus
      break
  }

  // Compute p-value
  const pValue = ksPValue(D, n, alternative)

  return {
    statistic: D,
    pValue,
    statisticLocation: location
  }
}

function ksTestTwoSample(
  data1: number[],
  data2: number[],
  alternative: 'two-sided' | 'less' | 'greater' = 'two-sided'
): KSTestResult {
  const n1 = data1.length
  const n2 = data2.length

  if (n1 === 0 || n2 === 0) {
    throw new Error('Both samples must be non-empty')
  }

  // Combine and sort with labels
  const combined: { value: number, sample: number }[] = [
    ...data1.map(x => ({ value: x, sample: 1 })),
    ...data2.map(x => ({ value: x, sample: 2 }))
  ].sort((a, b) => a.value - b.value)

  let cdf1 = 0  // Running CDF for sample 1
  let cdf2 = 0  // Running CDF for sample 2

  let D_plus = 0
  let D_minus = 0
  let location = combined[0].value

  for (let i = 0; i < combined.length; i++) {
    // Update CDFs
    if (combined[i].sample === 1) {
      cdf1++
    } else {
      cdf2++
    }

    const F1 = cdf1 / n1
    const F2 = cdf2 / n2

    const diff = F1 - F2

    if (diff > D_plus) {
      D_plus = diff
      if (alternative !== 'less') {
        location = combined[i].value
      }
    }

    if (-diff > D_minus) {
      D_minus = -diff
      if (alternative === 'less' || (alternative === 'two-sided' && -diff > D_plus)) {
        location = combined[i].value
      }
    }
  }

  let D: number
  switch (alternative) {
    case 'two-sided':
      D = Math.max(D_plus, D_minus)
      break
    case 'greater':
      D = D_plus
      break
    case 'less':
      D = D_minus
      break
  }

  // Compute p-value for two-sample test
  const pValue = ksTwoSamplePValue(D, n1, n2, alternative)

  return {
    statistic: D,
    pValue,
    statisticLocation: location
  }
}
```

### P-Value Computation

```typescript
// Kolmogorov distribution CDF
function kolmogorovCDF(x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1

  // Marsaglia-Tsang-Wang approximation
  const k_max = Math.ceil(x * Math.sqrt(-0.5 * Math.log(Number.EPSILON)))

  let sum = 0
  for (let k = 1; k <= k_max; k++) {
    sum += Math.exp(-2 * k * k * x * x) * (k % 2 === 1 ? 1 : -1)
  }

  return 1 - 2 * sum
}

function ksPValue(D: number, n: number, alternative: string): number {
  if (alternative === 'two-sided') {
    // Use Kolmogorov distribution for large n
    if (n > 50) {
      const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * D
      return 1 - kolmogorovCDF(lambda)
    } else {
      // Exact computation for small n (expensive)
      return ksExactPValue(D, n)
    }
  } else {
    // One-sided test
    if (n > 50) {
      const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * D
      // One-sided approximation
      return Math.exp(-2 * lambda * lambda)
    } else {
      return ksExactPValue(D, n)
    }
  }
}

function ksTwoSamplePValue(
  D: number,
  n1: number,
  n2: number,
  alternative: string
): number {
  const n = n1 * n2 / (n1 + n2)  // Effective sample size

  if (alternative === 'two-sided') {
    if (n > 30) {
      const lambda = Math.sqrt(n) * D
      return 2 * (1 - kolmogorovCDF(lambda))
    } else {
      // Use exact permutation test or conservative approximation
      return ksApproximatePValue(D, n1, n2)
    }
  } else {
    const lambda = Math.sqrt(n) * D
    return Math.exp(-2 * lambda * lambda)
  }
}

// Exact p-value via dynamic programming (for small n)
function ksExactPValue(D: number, n: number): number {
  // Compute probability by enumerating all possible EDFs
  // This is O(n^n) complexity - use only for small n

  // Simplified: use asymptotic formula even for moderate n
  const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * D
  return 1 - kolmogorovCDF(lambda)
}

function ksApproximatePValue(D: number, n1: number, n2: number): number {
  // Conservative approximation for two-sample test
  const lambda = D * Math.sqrt((n1 * n2) / (n1 + n2))

  // Asymptotic formula with correction
  let pValue = 0
  for (let k = 1; k <= 100; k++) {
    pValue += 2 * Math.pow(-1, k - 1) * Math.exp(-2 * k * k * lambda * lambda)
  }

  return Math.min(1, Math.max(0, pValue))
}
```

### Edge Cases & Numerical Considerations

- **Small samples**: Exact distribution differs from asymptotic; use exact p-values
- **Ties**: KS test not well-defined for discrete distributions
- **Large samples**: Asymptotic approximation accurate for n > 50
- **Two-sample**: Requires careful handling of combined EDF
- **Continuous vs discrete**: KS test designed for continuous distributions

**Complexity**:
- One-sample: O(n log n) for sorting
- Two-sample: O((n+m) log(n+m))

---

## Task 9.6: Skewness and Kurtosis

### Mathematical Foundation

**Central Moments:**
```
μₖ = E[(X - μ)ᵏ] = (1/n) Σᵢ (xᵢ - x̄)ᵏ
```

### Skewness (Third Standardized Moment)

**Population Skewness:**
```
γ₁ = E[(X - μ)³] / σ³ = μ₃ / σ³
```

**Sample Skewness (biased estimator):**
```
g₁ = m₃ / m₂^{3/2} = [(1/n) Σ(xᵢ - x̄)³] / [(1/n) Σ(xᵢ - x̄)²]^{3/2}
```

**Adjusted Fisher-Pearson Coefficient (bias-corrected):**
```
G₁ = √[n(n-1)] / (n-2) · g₁
```

**Alternative: Adjusted Sample Skewness:**
```
G₁ = [n / ((n-1)(n-2))] Σ[(xᵢ - x̄) / s]³
```

Where s is the sample standard deviation with n-1 denominator.

### Kurtosis (Fourth Standardized Moment)

**Population Kurtosis:**
```
γ₂ = E[(X - μ)⁴] / σ⁴ - 3    (excess kurtosis)
```

Note: Normal distribution has γ₂ = 0 (excess kurtosis)

**Sample Kurtosis (biased estimator):**
```
g₂ = m₄ / m₂² - 3 = [(1/n) Σ(xᵢ - x̄)⁴] / [(1/n) Σ(xᵢ - x̄)²]² - 3
```

**Adjusted Sample Kurtosis (bias-corrected):**
```
G₂ = [(n-1) / ((n-2)(n-3))] ×
     [(n+1) × m₄ / m₂² - 3(n-1)] + 3
```

Simplified:
```
G₂ = [n(n+1) / ((n-1)(n-2)(n-3))] Σ[(xᵢ - x̄) / s]⁴ -
     [3(n-1)² / ((n-2)(n-3))]
```

### Algorithm Implementation

```typescript
interface MomentResult {
  skewness: number
  kurtosis: number
  skewnessSE: number    // Standard error
  kurtosisSE: number
  skewnessZ: number     // Z-score for normality test
  kurtosisZ: number
}

function sampleMoments(
  data: number[],
  bias: boolean = false  // If true, use biased estimators
): MomentResult {
  const n = data.length

  if (n < 3) {
    throw new Error('Need at least 3 observations for skewness')
  }

  if (n < 4) {
    throw new Error('Need at least 4 observations for kurtosis')
  }

  // Compute mean
  const mean = data.reduce((sum, x) => sum + x, 0) / n

  // Compute central moments (numerically stable)
  let m2 = 0, m3 = 0, m4 = 0

  for (let i = 0; i < n; i++) {
    const diff = data[i] - mean
    const diff2 = diff * diff

    m2 += diff2
    m3 += diff * diff2
    m4 += diff2 * diff2
  }

  m2 /= n
  m3 /= n
  m4 /= n

  // Compute skewness and kurtosis
  let skewness: number, kurtosis: number

  if (bias) {
    // Biased estimators (classical)
    skewness = m3 / Math.pow(m2, 1.5)
    kurtosis = m4 / (m2 * m2) - 3
  } else {
    // Unbiased estimators (adjusted)
    const variance = m2 * n / (n - 1)  // Unbiased variance
    const stdDev = Math.sqrt(variance)

    // Adjusted skewness (Fisher-Pearson)
    const skewBiased = m3 / Math.pow(m2, 1.5)
    skewness = Math.sqrt(n * (n - 1)) / (n - 2) * skewBiased

    // Adjusted kurtosis
    const kurtBiased = m4 / (m2 * m2)
    kurtosis = ((n - 1) / ((n - 2) * (n - 3))) *
               ((n + 1) * kurtBiased - 3 * (n - 1)) + 3
    kurtosis -= 3  // Convert to excess kurtosis
  }

  // Standard errors (for large samples)
  const skewnessSE = Math.sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3)))
  const kurtosisSE = 2 * skewnessSE * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5)))

  // Z-scores for testing normality (H₀: skewness=0, kurtosis=0)
  const skewnessZ = skewness / skewnessSE
  const kurtosisZ = kurtosis / kurtosisSE

  return {
    skewness,
    kurtosis,
    skewnessSE,
    kurtosisSE,
    skewnessZ,
    kurtosisZ
  }
}

// Efficient computation using single pass
function momentsOnlineAlgorithm(data: number[]): MomentResult {
  const n = data.length

  // Online algorithm for computing higher moments
  let n_obs = 0
  let M1 = 0, M2 = 0, M3 = 0, M4 = 0

  for (let i = 0; i < n; i++) {
    const x = data[i]
    const n1 = n_obs
    n_obs++

    const delta = x - M1
    const delta_n = delta / n_obs
    const delta_n2 = delta_n * delta_n
    const term1 = delta * delta_n * n1

    M1 += delta_n
    M4 += term1 * delta_n2 * (n_obs * n_obs - 3 * n_obs + 3) +
          6 * delta_n2 * M2 - 4 * delta_n * M3
    M3 += term1 * delta_n * (n_obs - 2) - 3 * delta_n * M2
    M2 += term1
  }

  // Convert to sample moments
  const variance = M2 / (n - 1)
  const stdDev = Math.sqrt(variance)

  const m2 = M2 / n
  const m3 = M3 / n
  const m4 = M4 / n

  const skewness = Math.sqrt(n * (n - 1)) / (n - 2) * (m3 / Math.pow(m2, 1.5))

  const kurtBiased = m4 / (m2 * m2)
  const kurtosis = ((n - 1) / ((n - 2) * (n - 3))) *
                   ((n + 1) * kurtBiased - 3 * (n - 1)) + 3 - 3

  const skewnessSE = Math.sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3)))
  const kurtosisSE = 2 * skewnessSE * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5)))

  return {
    skewness,
    kurtosis,
    skewnessSE,
    kurtosisSE,
    skewnessZ: skewness / skewnessSE,
    kurtosisZ: kurtosis / kurtosisSE
  }
}
```

### Jarque-Bera Test for Normality

Combines skewness and kurtosis:

```typescript
function jarqueBeraTest(data: number[]): {
  statistic: number
  pValue: number
  skewness: number
  kurtosis: number
} {
  const n = data.length
  const moments = sampleMoments(data, false)

  // Jarque-Bera statistic
  const JB = (n / 6) * (
    Math.pow(moments.skewness, 2) +
    Math.pow(moments.kurtosis, 2) / 4
  )

  // JB ~ χ²(2) under normality
  const pValue = 1 - chiSquareCDF(JB, 2)

  return {
    statistic: JB,
    pValue,
    skewness: moments.skewness,
    kurtosis: moments.kurtosis
  }
}
```

### Interpretation

**Skewness:**
- γ₁ = 0: Symmetric distribution
- γ₁ > 0: Right-skewed (positive skew, long right tail)
- γ₁ < 0: Left-skewed (negative skew, long left tail)
- |γ₁| > 1: Highly skewed

**Kurtosis (excess):**
- γ₂ = 0: Normal (mesokurtic)
- γ₂ > 0: Heavy-tailed (leptokurtic) - more outliers than normal
- γ₂ < 0: Light-tailed (platykurtic) - fewer outliers than normal
- |γ₂| > 1: Significant departure from normality

### Edge Cases & Numerical Considerations

- **Small samples**: Bias-corrected formulas essential for n < 30
- **Outliers**: Moments highly sensitive to extreme values
- **Zero variance**: Undefined if all values identical
- **Numerical stability**: Use online algorithms for large datasets
- **Heavy tails**: Kurtosis can be very large or ill-defined

**Complexity**: O(n) with online algorithm, O(n) with two-pass

---

## Task 9.7: Covariance Matrix

### Mathematical Foundation

**Population Covariance:**
```
Cov(X, Y) = E[(X - μ_X)(Y - μ_Y)]
```

**Sample Covariance:**
```
s_{XY} = (1/(n-1)) Σᵢ (xᵢ - x̄)(yᵢ - ȳ)
```

**Covariance Matrix (p variables):**
```
Σ = [s_{ij}]  where s_{ij} = Cov(Xᵢ, Xⱼ)
```

Properties:
- Symmetric: s_{ij} = s_{ji}
- Diagonal: s_{ii} = Var(Xᵢ)
- Positive semi-definite

**Correlation Matrix:**
```
R = [ρ_{ij}]  where ρ_{ij} = s_{ij} / (s_i × s_j)
```

Where s_i = √s_{ii} is the standard deviation of variable i.

**Pearson Correlation:**
```
r = Σ(xᵢ - x̄)(yᵢ - ȳ) / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]
```

Range: -1 ≤ r ≤ 1

### Algorithm Implementation

```typescript
interface CovarianceResult {
  covariance: number[][]      // Covariance matrix
  correlation: number[][]     // Correlation matrix
  means: number[]             // Variable means
  stdDevs: number[]           // Variable standard deviations
}

function covarianceMatrix(
  data: number[][],           // data[i][j] = observation i, variable j
  bias: boolean = false       // If true, use n instead of n-1
): CovarianceResult {
  const n = data.length       // Number of observations
  const p = data[0].length    // Number of variables

  if (n < 2) {
    throw new Error('Need at least 2 observations')
  }

  // Compute means for each variable
  const means: number[] = Array(p).fill(0)

  for (let j = 0; j < p; j++) {
    for (let i = 0; i < n; i++) {
      means[j] += data[i][j]
    }
    means[j] /= n
  }

  // Compute covariance matrix
  const denominator = bias ? n : n - 1
  const covariance: number[][] = Array(p).fill(null).map(() => Array(p).fill(0))

  for (let j1 = 0; j1 < p; j1++) {
    for (let j2 = j1; j2 < p; j2++) {  // Only upper triangle
      let sum = 0

      for (let i = 0; i < n; i++) {
        sum += (data[i][j1] - means[j1]) * (data[i][j2] - means[j2])
      }

      const cov = sum / denominator
      covariance[j1][j2] = cov
      covariance[j2][j1] = cov  // Symmetric
    }
  }

  // Extract standard deviations from diagonal
  const stdDevs = covariance.map((row, i) => Math.sqrt(row[i]))

  // Compute correlation matrix
  const correlation: number[][] = Array(p).fill(null).map(() => Array(p).fill(0))

  for (let j1 = 0; j1 < p; j1++) {
    for (let j2 = 0; j2 < p; j2++) {
      if (stdDevs[j1] === 0 || stdDevs[j2] === 0) {
        correlation[j1][j2] = j1 === j2 ? 1 : 0  // Handle zero variance
      } else {
        correlation[j1][j2] = covariance[j1][j2] / (stdDevs[j1] * stdDevs[j2])
      }
    }
  }

  return {
    covariance,
    correlation,
    means,
    stdDevs
  }
}

// Efficient single-pass algorithm (Welford-like)
function covarianceMatrixOnline(data: number[][]): CovarianceResult {
  const n = data.length
  const p = data[0].length

  // Initialize accumulators
  const means: number[] = Array(p).fill(0)
  const M2: number[][] = Array(p).fill(null).map(() => Array(p).fill(0))

  // Online computation
  for (let i = 0; i < n; i++) {
    const delta_pre: number[] = Array(p)
    const delta_post: number[] = Array(p)

    // Update means and compute deltas
    for (let j = 0; j < p; j++) {
      delta_pre[j] = data[i][j] - means[j]
      means[j] += delta_pre[j] / (i + 1)
      delta_post[j] = data[i][j] - means[j]
    }

    // Update M2 (sum of outer products of deltas)
    for (let j1 = 0; j1 < p; j1++) {
      for (let j2 = 0; j2 < p; j2++) {
        M2[j1][j2] += delta_pre[j1] * delta_post[j2]
      }
    }
  }

  // Convert to covariance
  const covariance = M2.map(row => row.map(val => val / (n - 1)))
  const stdDevs = covariance.map((row, i) => Math.sqrt(row[i]))

  // Correlation matrix
  const correlation: number[][] = Array(p).fill(null).map(() => Array(p).fill(0))

  for (let j1 = 0; j1 < p; j1++) {
    for (let j2 = 0; j2 < p; j2++) {
      if (stdDevs[j1] === 0 || stdDevs[j2] === 0) {
        correlation[j1][j2] = j1 === j2 ? 1 : 0
      } else {
        correlation[j1][j2] = covariance[j1][j2] / (stdDevs[j1] * stdDevs[j2])
      }
    }
  }

  return { covariance, correlation, means, stdDevs }
}

// Pearson correlation for two variables
function pearsonCorrelation(x: number[], y: number[]): {
  r: number
  rSquared: number
  pValue: number
  ci: [number, number]
} {
  if (x.length !== y.length) {
    throw new Error('Arrays must have equal length')
  }

  const n = x.length

  if (n < 3) {
    throw new Error('Need at least 3 observations')
  }

  // Compute means
  const meanX = x.reduce((s, v) => s + v, 0) / n
  const meanY = y.reduce((s, v) => s + v, 0) / n

  // Compute correlation using numerically stable formula
  let sumXY = 0, sumX2 = 0, sumY2 = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY

    sumXY += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }

  const r = sumXY / Math.sqrt(sumX2 * sumY2)
  const rSquared = r * r

  // Test statistic: t = r√(n-2) / √(1-r²)
  const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - rSquared)
  const pValue = 2 * tCDF(-Math.abs(t), n - 2)

  // Fisher z-transformation for confidence interval
  const z = 0.5 * Math.log((1 + r) / (1 - r))  // Fisher's z
  const se_z = 1 / Math.sqrt(n - 3)
  const z_critical = normalQuantile(0.975)  // 95% CI

  const z_lower = z - z_critical * se_z
  const z_upper = z + z_critical * se_z

  // Transform back to correlation scale
  const r_lower = (Math.exp(2 * z_lower) - 1) / (Math.exp(2 * z_lower) + 1)
  const r_upper = (Math.exp(2 * z_upper) - 1) / (Math.exp(2 * z_upper) + 1)

  return {
    r,
    rSquared,
    pValue,
    ci: [r_lower, r_upper]
  }
}
```

### Spearman Rank Correlation

Non-parametric alternative:

```typescript
function spearmanCorrelation(x: number[], y: number[]): number {
  const n = x.length

  // Convert to ranks
  const rankX = getRanks(x)
  const rankY = getRanks(y)

  // Compute Pearson correlation on ranks
  return pearsonCorrelation(rankX, rankY).r
}

function getRanks(data: number[]): number[] {
  const n = data.length
  const indexed = data.map((val, idx) => ({ val, idx }))

  // Sort by value
  indexed.sort((a, b) => a.val - b.val)

  // Assign ranks (average rank for ties)
  const ranks: number[] = Array(n)
  let i = 0

  while (i < n) {
    let j = i

    // Find extent of ties
    while (j < n && indexed[j].val === indexed[i].val) {
      j++
    }

    // Average rank for tied values
    const avgRank = (i + j + 1) / 2  // Ranks are 1-indexed

    for (let k = i; k < j; k++) {
      ranks[indexed[k].idx] = avgRank
    }

    i = j
  }

  return ranks
}
```

### Edge Cases & Numerical Considerations

- **Multicollinearity**: Perfect correlation → singular covariance matrix
- **Zero variance**: Handle division by zero in correlation
- **Numerical stability**: Use two-pass or online algorithms
- **Missing data**: Require complete cases or use pairwise deletion
- **Large p**: Consider sparse covariance estimation or regularization

**Complexity**:
- Standard: O(np²)
- Online: O(np²) but single pass
- Correlation test: O(n)

---

## Task 9.8: Bootstrap Methods

### Mathematical Foundation

Bootstrap resampling estimates sampling distributions by repeatedly sampling with replacement from the observed data.

**Basic Bootstrap:**
1. Draw B bootstrap samples of size n (with replacement)
2. Compute statistic θ̂* for each sample
3. Use empirical distribution of {θ̂₁*, ..., θ̂_B*} to estimate properties of θ̂

### 9.8.1: Percentile Bootstrap Confidence Interval

**Algorithm:**
```
1. For b = 1 to B:
   - Draw sample X* of size n with replacement
   - Compute θ̂_b* = statistic(X*)
2. Sort {θ̂₁*, ..., θ̂_B*}
3. CI = [θ̂_{α/2}*, θ̂_{1-α/2}*]
```

Where θ̂_p* is the p-th quantile of bootstrap distribution.

### 9.8.2: BCa (Bias-Corrected and Accelerated) Bootstrap

**More accurate** confidence intervals accounting for bias and skewness.

**Bias Correction:**
```
z₀ = Φ⁻¹(#{θ̂_b* < θ̂} / B)
```

**Acceleration (Jackknife):**
```
â = Σᵢ (θ̂₍.₎ - θ̂₍ᵢ₎)³ / [6 (Σᵢ (θ̂₍.₎ - θ̂₍ᵢ₎)²)^{3/2}]
```

Where:
- θ̂₍ᵢ₎ = jackknife estimate with i-th observation deleted
- θ̂₍.₎ = mean of jackknife estimates

**Adjusted Percentiles:**
```
α₁ = Φ(z₀ + (z₀ + z_{α/2}) / (1 - â(z₀ + z_{α/2})))
α₂ = Φ(z₀ + (z₀ + z_{1-α/2}) / (1 - â(z₀ + z_{1-α/2})))

CI = [θ̂_{α₁}*, θ̂_{α₂}*]
```

### Algorithm Implementation

```typescript
interface BootstrapResult {
  estimate: number              // Original estimate
  mean: number                  // Mean of bootstrap estimates
  bias: number                  // Bootstrap bias estimate
  stdError: number              // Bootstrap standard error
  ciPercentile: [number, number]  // Percentile CI
  ciBCa: [number, number]       // BCa CI
  bootstrapSamples: number[]    // All bootstrap estimates (optional)
}

function bootstrap(
  data: number[],
  statistic: (sample: number[]) => number,
  B: number = 10000,
  alpha: number = 0.05,
  returnSamples: boolean = false
): BootstrapResult {
  const n = data.length

  if (n === 0) {
    throw new Error('Data must be non-empty')
  }

  // Original estimate
  const theta_hat = statistic(data)

  // Bootstrap resampling
  const bootstrapEstimates: number[] = []

  for (let b = 0; b < B; b++) {
    // Resample with replacement
    const sample: number[] = []
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * n)
      sample.push(data[idx])
    }

    // Compute statistic on bootstrap sample
    const theta_b = statistic(sample)
    bootstrapEstimates.push(theta_b)
  }

  // Sort bootstrap estimates
  bootstrapEstimates.sort((a, b) => a - b)

  // Bootstrap mean and standard error
  const mean = bootstrapEstimates.reduce((s, x) => s + x, 0) / B
  const bias = mean - theta_hat

  const variance = bootstrapEstimates.reduce((s, x) =>
    s + Math.pow(x - mean, 2), 0
  ) / (B - 1)
  const stdError = Math.sqrt(variance)

  // Percentile CI
  const idx_lower = Math.floor(B * alpha / 2)
  const idx_upper = Math.floor(B * (1 - alpha / 2))

  const ciPercentile: [number, number] = [
    bootstrapEstimates[idx_lower],
    bootstrapEstimates[idx_upper]
  ]

  // BCa CI
  const ciBCa = bootstrapBCa(
    data,
    statistic,
    theta_hat,
    bootstrapEstimates,
    alpha
  )

  return {
    estimate: theta_hat,
    mean,
    bias,
    stdError,
    ciPercentile,
    ciBCa,
    bootstrapSamples: returnSamples ? bootstrapEstimates : []
  }
}

function bootstrapBCa(
  data: number[],
  statistic: (sample: number[]) => number,
  theta_hat: number,
  bootstrapEstimates: number[],
  alpha: number
): [number, number] {
  const n = data.length
  const B = bootstrapEstimates.length

  // Compute bias correction factor z₀
  const count = bootstrapEstimates.filter(x => x < theta_hat).length
  const z0 = normalQuantile(count / B)

  // Compute acceleration factor using jackknife
  const jackknife: number[] = []

  for (let i = 0; i < n; i++) {
    // Delete i-th observation
    const sample = [...data.slice(0, i), ...data.slice(i + 1)]
    jackknife.push(statistic(sample))
  }

  const jack_mean = jackknife.reduce((s, x) => s + x, 0) / n

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    const diff = jack_mean - jackknife[i]
    numerator += Math.pow(diff, 3)
    denominator += Math.pow(diff, 2)
  }

  const a = numerator / (6 * Math.pow(denominator, 1.5))

  // Compute adjusted percentiles
  const z_alpha_2 = normalQuantile(alpha / 2)
  const z_1_alpha_2 = normalQuantile(1 - alpha / 2)

  const alpha1 = normalCDF(z0 + (z0 + z_alpha_2) / (1 - a * (z0 + z_alpha_2)))
  const alpha2 = normalCDF(z0 + (z0 + z_1_alpha_2) / (1 - a * (z0 + z_1_alpha_2)))

  // Clamp to valid range
  const idx1 = Math.max(0, Math.min(B - 1, Math.floor(B * alpha1)))
  const idx2 = Math.max(0, Math.min(B - 1, Math.floor(B * alpha2)))

  return [bootstrapEstimates[idx1], bootstrapEstimates[idx2]]
}

// Helper: Normal CDF
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2))
}

// Example statistics
function bootstrapMean(data: number[]): BootstrapResult {
  const statistic = (sample: number[]) =>
    sample.reduce((s, x) => s + x, 0) / sample.length

  return bootstrap(data, statistic)
}

function bootstrapMedian(data: number[]): BootstrapResult {
  const statistic = (sample: number[]) => {
    const sorted = [...sample].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  return bootstrap(data, statistic)
}

function bootstrapCorrelation(x: number[], y: number[]): BootstrapResult {
  if (x.length !== y.length) {
    throw new Error('Arrays must have equal length')
  }

  const statistic = (indices: number[]) => {
    const xSample = indices.map(i => x[i])
    const ySample = indices.map(i => y[i])
    return pearsonCorrelation(xSample, ySample).r
  }

  // Bootstrap indices instead of values
  const indices = Array.from({ length: x.length }, (_, i) => i)

  return bootstrap(indices, statistic)
}
```

### Stratified Bootstrap

For unbalanced data:

```typescript
function bootstrapStratified(
  data: number[][],  // data[stratum][observation]
  statistic: (sample: number[]) => number,
  B: number = 10000
): BootstrapResult {
  const K = data.length  // Number of strata
  const n_k = data.map(stratum => stratum.length)

  const bootstrapEstimates: number[] = []

  for (let b = 0; b < B; b++) {
    let sample: number[] = []

    // Sample from each stratum proportionally
    for (let k = 0; k < K; k++) {
      for (let i = 0; i < n_k[k]; i++) {
        const idx = Math.floor(Math.random() * n_k[k])
        sample.push(data[k][idx])
      }
    }

    bootstrapEstimates.push(statistic(sample))
  }

  // ... rest of bootstrap computation
  return null as any  // Placeholder
}
```

### Edge Cases & Numerical Considerations

- **Sample size**: Bootstrap valid for n ≥ 20; smaller samples less reliable
- **Number of resamples**: B = 10,000 typical; BCa may need B = 50,000+
- **Smooth vs non-smooth**: Bootstrap works better for smooth statistics (mean vs median)
- **Extreme values**: Rare events may not appear in bootstrap samples
- **Computational cost**: O(B × n × C) where C = cost of statistic

**Complexity**: O(B × n) for basic bootstrap, O(B × n + n²) for BCa

---

## Task 9.9: Kernel Density Estimation

### Mathematical Foundation

**Kernel Density Estimate:**
```
f̂(x) = (1/(nh)) Σᵢ K((x - xᵢ)/h)
```

Where:
- K = kernel function (satisfies ∫K(u)du = 1)
- h = bandwidth (smoothing parameter)
- n = sample size

**Gaussian Kernel (most common):**
```
K(u) = (1/√(2π)) exp(-u²/2)
```

**Epanechnikov Kernel (optimal in MSE sense):**
```
K(u) = (3/4)(1 - u²) if |u| ≤ 1, else 0
```

### Bandwidth Selection

**Silverman's Rule of Thumb:**
```
h = 1.06 × σ̂ × n^{-1/5}
```

Where σ̂ is the sample standard deviation.

**Scott's Rule:**
```
h = σ̂ × n^{-1/(d+4)}
```

For d dimensions (d=1 for univariate).

**Improved: IQR-based (robust to outliers):**
```
h = 0.9 × min(σ̂, IQR/1.34) × n^{-1/5}
```

**Cross-Validation (optimal but expensive):**

Minimize leave-one-out cross-validation score:
```
CV(h) = ∫f̂²(x)dx - (2/n)Σᵢ f̂₍₋ᵢ₎(xᵢ)
```

### Algorithm Implementation

```typescript
interface KDEResult {
  x: number[]              // Evaluation points
  density: number[]        // Estimated density values
  bandwidth: number        // Selected bandwidth
  kernel: string           // Kernel name
}

function kernelDensityEstimation(
  data: number[],
  bandwidth?: number,
  kernel: 'gaussian' | 'epanechnikov' | 'uniform' | 'triangular' = 'gaussian',
  gridPoints: number = 512
): KDEResult {
  const n = data.length

  if (n < 2) {
    throw new Error('Need at least 2 observations')
  }

  // Select bandwidth if not provided
  let h: number
  if (bandwidth !== undefined) {
    h = bandwidth
  } else {
    h = silvermanBandwidth(data)
  }

  // Create evaluation grid
  const dataMin = Math.min(...data)
  const dataMax = Math.max(...data)
  const range = dataMax - dataMin
  const gridMin = dataMin - 0.2 * range
  const gridMax = dataMax + 0.2 * range

  const x: number[] = []
  const density: number[] = []

  for (let i = 0; i < gridPoints; i++) {
    const xi = gridMin + (i / (gridPoints - 1)) * (gridMax - gridMin)
    x.push(xi)

    // Compute density at xi
    let sum = 0
    for (let j = 0; j < n; j++) {
      const u = (xi - data[j]) / h
      sum += kernelFunction(u, kernel)
    }

    density.push(sum / (n * h))
  }

  return { x, density, bandwidth: h, kernel }
}

function kernelFunction(u: number, kernel: string): number {
  switch (kernel) {
    case 'gaussian':
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-u * u / 2)

    case 'epanechnikov':
      return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0

    case 'uniform':
      return Math.abs(u) <= 1 ? 0.5 : 0

    case 'triangular':
      return Math.abs(u) <= 1 ? (1 - Math.abs(u)) : 0

    default:
      throw new Error(`Unknown kernel: ${kernel}`)
  }
}

function silvermanBandwidth(data: number[]): number {
  const n = data.length

  // Compute standard deviation
  const mean = data.reduce((s, x) => s + x, 0) / n
  const variance = data.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (n - 1)
  const sigma = Math.sqrt(variance)

  // Compute IQR
  const sorted = [...data].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const iqr = q3 - q1

  // Robust estimate
  const scale = Math.min(sigma, iqr / 1.34)

  // Silverman's rule
  return 0.9 * scale * Math.pow(n, -0.2)
}

function scottsRule(data: number[]): number {
  const n = data.length
  const mean = data.reduce((s, x) => s + x, 0) / n
  const variance = data.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (n - 1)
  const sigma = Math.sqrt(variance)

  return sigma * Math.pow(n, -1 / 5)
}

function bandwidthCrossValidation(
  data: number[],
  kernel: string = 'gaussian'
): number {
  const n = data.length

  // Initial guess from Silverman
  const h0 = silvermanBandwidth(data)

  // Search for optimal bandwidth using golden section search
  let a = h0 * 0.5
  let b = h0 * 2.0
  const phi = (1 + Math.sqrt(5)) / 2
  const tol = 1e-4

  while (Math.abs(b - a) > tol) {
    const h1 = b - (b - a) / phi
    const h2 = a + (b - a) / phi

    const cv1 = crossValidationScore(data, h1, kernel)
    const cv2 = crossValidationScore(data, h2, kernel)

    if (cv1 < cv2) {
      b = h2
    } else {
      a = h1
    }
  }

  return (a + b) / 2
}

function crossValidationScore(
  data: number[],
  h: number,
  kernel: string
): number {
  const n = data.length

  // Leave-one-out score
  let score = 0

  for (let i = 0; i < n; i++) {
    // Density at data[i] excluding data[i]
    let f_minus_i = 0

    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const u = (data[i] - data[j]) / h
        f_minus_i += kernelFunction(u, kernel)
      }
    }

    f_minus_i /= ((n - 1) * h)
    score += f_minus_i
  }

  return -2 * score / n
}

// Evaluate KDE at specific points
function kdeEvaluate(
  data: number[],
  points: number[],
  bandwidth?: number,
  kernel: string = 'gaussian'
): number[] {
  const n = data.length
  const h = bandwidth ?? silvermanBandwidth(data)

  return points.map(x => {
    let sum = 0
    for (let i = 0; i < n; i++) {
      const u = (x - data[i]) / h
      sum += kernelFunction(u, kernel)
    }
    return sum / (n * h)
  })
}
```

### Fast KDE using Binning (for large datasets)

```typescript
function kdeFast(
  data: number[],
  gridPoints: number = 512,
  bandwidth?: number
): KDEResult {
  const n = data.length
  const h = bandwidth ?? silvermanBandwidth(data)

  // Determine range
  const dataMin = Math.min(...data)
  const dataMax = Math.max(...data)
  const range = dataMax - dataMin
  const gridMin = dataMin - 0.2 * range
  const gridMax = dataMax + 0.2 * range
  const delta = (gridMax - gridMin) / (gridPoints - 1)

  // Bin data onto grid (linear binning)
  const counts: number[] = Array(gridPoints).fill(0)

  for (let i = 0; i < n; i++) {
    const position = (data[i] - gridMin) / delta
    const idx = Math.floor(position)
    const frac = position - idx

    if (idx >= 0 && idx < gridPoints - 1) {
      counts[idx] += (1 - frac)
      counts[idx + 1] += frac
    }
  }

  // Convolve with kernel using FFT (for Gaussian kernel)
  // This is O(m log m) instead of O(nm)
  const density = convolveGaussianKernel(counts, h / delta)

  // Normalize
  const normalization = n * delta
  const densityNormalized = density.map(d => d / normalization)

  // Create x values
  const x = Array.from({ length: gridPoints }, (_, i) =>
    gridMin + i * delta
  )

  return {
    x,
    density: densityNormalized,
    bandwidth: h,
    kernel: 'gaussian'
  }
}

function convolveGaussianKernel(data: number[], sigma: number): number[] {
  // Simple discrete convolution with Gaussian kernel
  const n = data.length
  const result: number[] = Array(n).fill(0)

  // Kernel width (truncate at 3 sigma)
  const width = Math.ceil(3 * sigma)

  for (let i = 0; i < n; i++) {
    for (let j = Math.max(0, i - width); j < Math.min(n, i + width + 1); j++) {
      const u = (i - j) / sigma
      const weight = Math.exp(-u * u / 2) / (sigma * Math.sqrt(2 * Math.PI))
      result[i] += data[j] * weight
    }
  }

  return result
}
```

### Edge Cases & Numerical Considerations

- **Bandwidth selection**: Critical; too small = undersmoothing, too large = oversmoothing
- **Boundary bias**: KDE biased near edges; use boundary correction methods
- **Multimodality**: Gaussian kernel may smooth out modes; consider adaptive bandwidth
- **Sample size**: Requires n ≥ 50 for reliable estimation
- **Heavy tails**: May need larger bandwidth or robust kernel

**Complexity**:
- Standard: O(nm) for n data points, m grid points
- Fast (binned): O(m log m) using FFT

---

## Task 9.10: Quantile/Percentile

### Mathematical Foundation

**Population Quantile:**
```
Q(p) = F⁻¹(p) = inf{x : F(x) ≥ p}
```

Where F is the CDF and p ∈ [0, 1].

**Sample Quantile:** Multiple methods exist (R has 9 types!)

**Empirical CDF (ECDF):**
```
F_n(x) = (1/n) Σᵢ I(xᵢ ≤ x)
```

### R Quantile Types (Hyndman & Fan, 1996)

Let:
- x₍ᵢ₎ = i-th order statistic (sorted data)
- h = (n-1)p + 1 for most types
- j = floor(h)
- g = h - j (fractional part)

**Type 1: Inverted empirical CDF (no interpolation)**
```
Q(p) = x₍ₖ₎ where k = ceiling(np)
```

**Type 2: Similar to Type 1, with averaging**
```
Q(p) = (x₍ₖ₎ + x₍ₖ₊₁₎) / 2 where k = ceiling(np)
```

**Type 3: Nearest even order statistic**
```
Q(p) = x₍ₖ₎ where k = round(np)
```

**Type 4: Linear interpolation (California method)**
```
h = np
j = floor(h)
g = h - j
Q(p) = x₍ⱼ₎ + g(x₍ⱼ₊₁₎ - x₍ⱼ₎)
```

**Type 5: Hydrologist method**
```
h = np + 0.5
j = floor(h)
g = h - j
Q(p) = x₍ⱼ₎ + g(x₍ⱼ₊₁₎ - x₍ⱼ₎)
```

**Type 6: Weibull quantile (SPSS)**
```
h = (n+1)p
j = floor(h)
g = h - j
Q(p) = x₍ⱼ₎ + g(x₍ⱼ₊₁₎ - x₍ⱼ₊₁₎)
```

**Type 7: Linear interpolation (Excel, default in R)**
```
h = (n-1)p + 1
j = floor(h)
g = h - j
Q(p) = x₍ⱼ₎ + g(x₍ⱼ₊₁₎ - x₍ⱼ₎)
```

**Type 8: Median-unbiased**
```
h = (n + 1/3)p + 1/3
j = floor(h)
g = h - j
Q(p) = x₍ⱼ₎ + g(x₍ⱼ₊₁₎ - x₍ⱼ₎)
```

**Type 9: Approximately unbiased (recommended)**
```
h = (n + 1/4)p + 3/8
j = floor(h)
g = h - j
Q(p) = x₍ⱼ₎ + g(x₍ⱼ₊₁₎ - x₍ⱼ₎)
```

### Algorithm Implementation

```typescript
interface QuantileResult {
  value: number
  method: number      // R type (1-9)
  p: number          // Probability
  lowerIndex: number // Lower order statistic index
  upperIndex: number // Upper order statistic index
  weight: number     // Interpolation weight
}

function quantile(
  data: number[],
  p: number | number[],
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 = 7
): number | number[] {
  const isArray = Array.isArray(p)
  const probs = isArray ? p : [p]

  // Validate probabilities
  for (const prob of probs) {
    if (prob < 0 || prob > 1) {
      throw new Error('Probabilities must be in [0, 1]')
    }
  }

  if (data.length === 0) {
    throw new Error('Data must be non-empty')
  }

  // Sort data
  const sorted = [...data].sort((a, b) => a - b)
  const n = sorted.length

  // Compute quantiles
  const results = probs.map(prob => computeQuantile(sorted, n, prob, type))

  return isArray ? results : results[0]
}

function computeQuantile(
  sorted: number[],
  n: number,
  p: number,
  type: number
): number {
  // Handle edge cases
  if (p === 0) return sorted[0]
  if (p === 1) return sorted[n - 1]

  let h: number, j: number, g: number

  switch (type) {
    case 1:
      // Inverted empirical CDF
      j = Math.ceil(n * p) - 1
      return sorted[Math.max(0, j)]

    case 2:
      // Similar to Type 1 with averaging
      j = Math.ceil(n * p) - 1
      if (j < n - 1 && n * p === j + 1) {
        return (sorted[j] + sorted[j + 1]) / 2
      }
      return sorted[Math.max(0, j)]

    case 3:
      // Nearest even order statistic
      j = Math.round(n * p) - 1
      return sorted[Math.max(0, Math.min(n - 1, j))]

    case 4:
      // Linear interpolation (California)
      h = n * p
      j = Math.floor(h)
      g = h - j

      if (j === 0) return sorted[0]
      if (j >= n) return sorted[n - 1]

      return sorted[j - 1] + g * (sorted[j] - sorted[j - 1])

    case 5:
      // Hydrologist method
      h = n * p + 0.5
      j = Math.floor(h)
      g = h - j

      if (j === 0) return sorted[0]
      if (j >= n) return sorted[n - 1]

      return sorted[j - 1] + g * (sorted[j] - sorted[j - 1])

    case 6:
      // Weibull
      h = (n + 1) * p
      j = Math.floor(h)
      g = h - j

      if (j === 0) return sorted[0]
      if (j >= n) return sorted[n - 1]

      return sorted[j - 1] + g * (sorted[j] - sorted[j - 1])

    case 7:
      // Linear interpolation (Excel, R default)
      h = (n - 1) * p + 1
      j = Math.floor(h)
      g = h - j

      if (j === 0) return sorted[0]
      if (j >= n) return sorted[n - 1]

      return sorted[j - 1] + g * (sorted[j] - sorted[j - 1])

    case 8:
      // Median-unbiased
      h = (n + 1/3) * p + 1/3
      j = Math.floor(h)
      g = h - j

      if (j === 0) return sorted[0]
      if (j >= n) return sorted[n - 1]

      return sorted[j - 1] + g * (sorted[j] - sorted[j - 1])

    case 9:
      // Approximately unbiased (recommended)
      h = (n + 1/4) * p + 3/8
      j = Math.floor(h)
      g = h - j

      if (j === 0) return sorted[0]
      if (j >= n) return sorted[n - 1]

      return sorted[j - 1] + g * (sorted[j] - sorted[j - 1])

    default:
      throw new Error(`Invalid quantile type: ${type}`)
  }
}

// Helper functions
function median(data: number[], type: number = 7): number {
  return quantile(data, 0.5, type) as number
}

function quartiles(data: number[], type: number = 7): {
  q1: number
  q2: number
  q3: number
  iqr: number
} {
  const [q1, q2, q3] = quantile(data, [0.25, 0.5, 0.75], type) as number[]

  return {
    q1,
    q2,
    q3,
    iqr: q3 - q1
  }
}

function percentile(data: number[], p: number, type: number = 7): number {
  return quantile(data, p / 100, type) as number
}

function iqr(data: number[], type: number = 7): number {
  const [q1, q3] = quantile(data, [0.25, 0.75], type) as number[]
  return q3 - q1
}

function quantileRange(
  data: number[],
  lower: number = 0.25,
  upper: number = 0.75,
  type: number = 7
): number {
  const [qLower, qUpper] = quantile(data, [lower, upper], type) as number[]
  return qUpper - qLower
}

// Five-number summary (min, Q1, median, Q3, max)
function fiveNumberSummary(data: number[], type: number = 7): {
  min: number
  q1: number
  median: number
  q3: number
  max: number
} {
  const sorted = [...data].sort((a, b) => a - b)
  const [q1, q2, q3] = quantile(data, [0.25, 0.5, 0.75], type) as number[]

  return {
    min: sorted[0],
    q1,
    median: q2,
    q3,
    max: sorted[sorted.length - 1]
  }
}
```

### Weighted Quantiles

```typescript
function weightedQuantile(
  data: number[],
  weights: number[],
  p: number
): number {
  if (data.length !== weights.length) {
    throw new Error('Data and weights must have same length')
  }

  const n = data.length

  // Sort by data values, keeping weights aligned
  const indexed = data.map((val, idx) => ({ val, weight: weights[idx] }))
  indexed.sort((a, b) => a.val - b.val)

  // Compute cumulative weights
  let cumWeight = 0
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const targetWeight = p * totalWeight

  for (let i = 0; i < n; i++) {
    cumWeight += indexed[i].weight

    if (cumWeight >= targetWeight) {
      // Linear interpolation between this and previous value
      if (i === 0) return indexed[0].val

      const prevCumWeight = cumWeight - indexed[i].weight
      const frac = (targetWeight - prevCumWeight) / indexed[i].weight

      return indexed[i - 1].val + frac * (indexed[i].val - indexed[i - 1].val)
    }
  }

  return indexed[n - 1].val
}
```

### Edge Cases & Numerical Considerations

- **Small samples**: Different types can give very different results for n < 10
- **Type selection**: Type 7 (R default) or Type 9 (unbiased) recommended
- **Ties**: All methods handle ties naturally via sorting
- **Interpolation**: Types 4-9 use linear interpolation between order statistics
- **Computational**: Type 1-3 are exact (no interpolation), Types 4-9 interpolate

**Complexity**: O(n log n) for sorting, O(1) for each quantile after sorting

---

## Implementation Checklist

### For Each Statistical Function

- [ ] TypeScript interface with proper types
- [ ] Input validation (sample size, parameter ranges)
- [ ] Edge case handling (zero variance, singular matrices, etc.)
- [ ] Multiple variants where applicable (e.g., Welch's t-test)
- [ ] Distribution functions (CDF, quantile) with numerical accuracy
- [ ] Unit tests with known results from R/SciPy/MATLAB
- [ ] Numerical stability tests (ill-conditioned cases)
- [ ] Performance benchmarks vs reference implementations
- [ ] WASM optimization for matrix operations (covariance, ANOVA)
- [ ] Parallel processing for resampling methods (bootstrap)
- [ ] Documentation with formulas, assumptions, and examples

### Testing Strategy

```typescript
function statisticalTestSuite() {
  // Test 1: Known distributions (t, χ², F with table values)
  // Test 2: Simulated data with known properties
  // Test 3: Edge cases (n=2, n=3, singular data)
  // Test 4: Comparison with R/SciPy outputs
  // Test 5: Numerical stability (high condition number)
  // Test 6: Large samples (n > 10,000) for performance
  // Test 7: Bootstrap convergence (different B values)
  // Test 8: KDE accuracy vs true density (simulated)
  // Test 9: Quantile consistency across types
  // Test 10: ANOVA with known factorial designs
}
```

---

## References

### Books
- **Wasserman**: *All of Statistics*, Springer (2004)
- **Casella & Berger**: *Statistical Inference*, 2nd ed. (2002)
- **Efron & Tibshirani**: *An Introduction to the Bootstrap* (1993)
- **Silverman**: *Density Estimation for Statistics and Data Analysis* (1986)
- **Hyndman & Fan**: "Sample Quantiles in Statistical Packages", *American Statistician* (1996)

### Algorithms
- **Student's t-test**: Gosset (1908)
- **Welch's t-test**: Welch (1947), Satterthwaite (1946)
- **Kolmogorov-Smirnov**: Kolmogorov (1933), Smirnov (1948)
- **BCa Bootstrap**: Efron (1987)
- **Kernel Density**: Parzen (1962), Rosenblatt (1956)

### Software References
- **R stats package**: Reference implementations
- **SciPy**: Python scientific computing (scipy.stats)
- **NumPy**: Percentile/quantile implementations
- **StatsModels**: Advanced statistical models

---

## Performance Targets (WASM)

| Operation              | Size      | JS Time  | WASM Time | Speedup |
|------------------------|-----------|----------|-----------|---------|
| T-test (two-sample)    | n=10,000  | ~5ms     | ~2ms      | 2.5x    |
| Chi-square (10×10)     | 100 cells | ~2ms     | ~1ms      | 2x      |
| ANOVA (5 groups)       | n=5,000   | ~8ms     | ~3ms      | 2.7x    |
| KS test                | n=10,000  | ~15ms    | ~5ms      | 3x      |
| Covariance (50 vars)   | n=1,000   | ~40ms    | ~5ms      | 8x      |
| Bootstrap (10k reps)   | n=100     | ~500ms   | ~150ms    | 3.3x    |
| KDE (512 grid)         | n=10,000  | ~80ms    | ~25ms     | 3.2x    |
| Quantiles (100 vals)   | n=10,000  | ~12ms    | ~4ms      | 3x      |

*Estimated on modern CPU; actual performance depends on implementation*

---

## Appendix: Distribution Functions Reference

### Standard Normal (Z) Distribution
```typescript
function normalPDF(x: number): number
function normalCDF(x: number): number
function normalQuantile(p: number): number
```

### Student's t-Distribution
```typescript
function tPDF(x: number, df: number): number
function tCDF(x: number, df: number): number
function tQuantile(p: number, df: number): number
```

### Chi-Square Distribution
```typescript
function chiSquarePDF(x: number, df: number): number
function chiSquareCDF(x: number, df: number): number
function chiSquareQuantile(p: number, df: number): number
```

### F-Distribution
```typescript
function fPDF(x: number, df1: number, df2: number): number
function fCDF(x: number, df1: number, df2: number): number
function fQuantile(p: number, df1: number, df2: number): number
```

### Special Functions
```typescript
function gamma(x: number): number
function lowerIncompleteGamma(s: number, x: number): number
function incompleteBeta(x: number, a: number, b: number): number
function incompleteBetaInv(p: number, a: number, b: number): number
function erf(x: number): number
function beta(a: number, b: number): number
```

---

**End of Phase 9 Advanced Statistics Implementation Guide**
