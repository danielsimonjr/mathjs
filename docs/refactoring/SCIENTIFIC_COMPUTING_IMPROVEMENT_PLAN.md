# MathJS Scientific Computing Improvement Plan

## Executive Summary

This document outlines a comprehensive plan to transform mathjs into a full-featured scientific computing library comparable to NumPy/SciPy, MATLAB, and Mathematica. The plan is organized into 15 sprints with 5-10 tasks each, designed for parallel agent implementation.

### Current State Analysis
- **Total Functions Implemented**: ~214 functions across 18 categories
- **TypeScript Conversion**: 9% complete (61/673 files)
- **WASM Integration**: Established infrastructure with matrix operations, FFT, and basic numeric functions
- **Overall Scientific Computing Completeness**: ~35%

### Target State
- **Goal**: 95%+ scientific computing capability parity with SciPy
- **New Functions to Add**: ~200+ functions across all domains
- **Performance**: WASM-accelerated for computationally intensive operations

---

## Sprint Organization

| Sprint | Focus Area | Tasks | Priority | Complexity |
|--------|-----------|-------|----------|------------|
| 1 | SVD & Core Linear Algebra | 8 | CRITICAL | High |
| 2 | Bessel & Airy Functions | 10 | CRITICAL | Medium |
| 3 | Probability Distributions (Part 1) | 10 | CRITICAL | Medium |
| 4 | Probability Distributions (Part 2) | 10 | CRITICAL | Medium |
| 5 | Root Finding & Optimization | 8 | CRITICAL | High |
| 6 | Numerical Integration | 8 | HIGH | Medium |
| 7 | Interpolation & Curve Fitting | 8 | HIGH | Medium |
| 8 | Elliptic & Hypergeometric Functions | 10 | HIGH | High |
| 9 | Advanced Statistics | 10 | HIGH | Medium |
| 10 | Signal Processing Filters | 10 | MEDIUM-HIGH | Medium |
| 11 | Window Functions & Spectral | 8 | MEDIUM-HIGH | Low |
| 12 | ODE/PDE Enhancements | 8 | MEDIUM | High |
| 13 | Orthogonal Polynomials | 8 | MEDIUM | Medium |
| 14 | Additional Special Functions | 10 | MEDIUM | Medium |
| 15 | Symbolic Computation Enhancements | 8 | MEDIUM | High |

---

## Sprint 1: SVD & Core Linear Algebra Decompositions
**Priority**: CRITICAL
**Estimated Complexity**: High
**Dependencies**: None (foundational)

### Background
SVD (Singular Value Decomposition) is the most critical missing function. It's fundamental for:
- Least squares solutions
- Matrix rank computation
- Principal Component Analysis (PCA)
- Image compression
- Solving ill-conditioned systems
- Pseudoinverse computation (current pinv.ts has TODO: "Use SVD instead")

### Tasks

#### Task 1.1: Implement SVD (Singular Value Decomposition)
**File**: `src/function/algebra/decomposition/svd.ts`
**Description**: Implement full SVD decomposition A = U * S * V^T
**Algorithms**:
- Golub-Kahan bidiagonalization
- QR iteration for singular values
- Option for thin vs full SVD
**Interface**:
```typescript
svd(A: Matrix): { U: Matrix, S: Vector, V: Matrix }
svd(A: Matrix, full: boolean): { U: Matrix, S: Matrix, V: Matrix }
```
**Tests**: Reconstruct A from U*S*V^T, orthogonality of U and V, singular values ordering
**WASM**: Yes - implement in `src-wasm/algebra/svd.ts`

#### Task 1.2: Implement Cholesky Decomposition
**File**: `src/function/algebra/decomposition/cholesky.ts`
**Description**: Decompose symmetric positive definite matrix A = L * L^T
**Interface**:
```typescript
cholesky(A: Matrix): Matrix  // Returns lower triangular L
cholesky(A: Matrix, 'upper'): Matrix  // Returns upper triangular U
```
**Tests**: Symmetry check, positive definiteness check, reconstruction
**WASM**: Yes - often 2x faster than LU for symmetric systems

#### Task 1.3: Implement Matrix Rank via SVD
**File**: `src/function/matrix/rank.ts`
**Description**: Compute numerical rank using SVD singular value thresholding
**Interface**:
```typescript
rank(A: Matrix): number
rank(A: Matrix, tol: number): number  // Custom tolerance
```
**Tests**: Full rank, rank deficient, numerical tolerance

#### Task 1.4: Implement Null Space (Kernel)
**File**: `src/function/matrix/nullspace.ts`
**Description**: Compute orthonormal basis for null space using SVD
**Interface**:
```typescript
nullspace(A: Matrix): Matrix  // Columns are null space basis vectors
nullspace(A: Matrix, tol: number): Matrix
```
**Tests**: A * nullspace(A) ≈ 0, orthonormality of result

#### Task 1.5: Implement Column Space (Range)
**File**: `src/function/matrix/orth.ts`
**Description**: Compute orthonormal basis for column space using SVD
**Interface**:
```typescript
orth(A: Matrix): Matrix  // Orthonormal basis for range(A)
```
**Tests**: Orthonormality, span verification

#### Task 1.6: Implement Least Squares Solver (lstsq)
**File**: `src/function/algebra/solver/lstsq.ts`
**Description**: Solve overdetermined systems using SVD
**Interface**:
```typescript
lstsq(A: Matrix, b: Vector): { x: Vector, residuals: Vector, rank: number, s: Vector }
```
**Tests**: Exact solutions, overdetermined, underdetermined, rank-deficient

#### Task 1.7: Implement Polar Decomposition
**File**: `src/function/algebra/decomposition/polar.ts`
**Description**: Decompose A = U * P where U is unitary and P is positive semidefinite
**Interface**:
```typescript
polar(A: Matrix): { U: Matrix, P: Matrix }
```
**Tests**: Reconstruction, U unitary, P positive semidefinite

#### Task 1.8: Update pinv to Use SVD
**File**: `src/function/matrix/pinv.ts` (modification)
**Description**: Refactor pseudoinverse to use SVD implementation
**Current Issue**: Line 20 has TODO: "Use SVD instead (may improve precision)"
**Tests**: Compare with current implementation, precision improvement verification

---

## Sprint 2: Bessel & Airy Functions
**Priority**: CRITICAL
**Estimated Complexity**: Medium
**Dependencies**: None

### Background
Bessel functions are essential for physics and engineering applications:
- Wave propagation in cylindrical coordinates
- Heat conduction
- Electromagnetic theory
- Quantum mechanics
- Vibration analysis

### Tasks

#### Task 2.1: Implement Bessel J (First Kind)
**File**: `src/function/special/besselj.ts`
**Description**: Bessel functions of the first kind J_n(x)
**Algorithms**:
- Miller's backward recurrence for integer orders
- Series expansion for small x
- Asymptotic expansion for large x
**Interface**:
```typescript
besselj(n: number, x: number): number  // J_n(x)
besselj(n: number, x: Matrix): Matrix  // Vectorized
```
**Special cases**: j0, j1 optimized implementations
**Tests**: Known values, recurrence relations, limiting behaviors

#### Task 2.2: Implement Bessel Y (Second Kind)
**File**: `src/function/special/bessely.ts`
**Description**: Bessel functions of the second kind Y_n(x) (Neumann functions)
**Interface**:
```typescript
bessely(n: number, x: number): number  // Y_n(x)
```
**Tests**: Wronskian relation with J, singularity at x=0

#### Task 2.3: Implement Modified Bessel I
**File**: `src/function/special/besseli.ts`
**Description**: Modified Bessel functions of the first kind I_n(x)
**Interface**:
```typescript
besseli(n: number, x: number): number  // I_n(x)
```
**Tests**: Exponential growth, relation to J

#### Task 2.4: Implement Modified Bessel K
**File**: `src/function/special/besselk.ts`
**Description**: Modified Bessel functions of the second kind K_n(x)
**Interface**:
```typescript
besselk(n: number, x: number): number  // K_n(x)
```
**Tests**: Exponential decay, Wronskian with I

#### Task 2.5: Implement Spherical Bessel j
**File**: `src/function/special/sphericalbesselj.ts`
**Description**: Spherical Bessel functions j_n(x)
**Relation**: j_n(x) = sqrt(π/2x) * J_{n+1/2}(x)
**Interface**:
```typescript
sphericalbesselj(n: number, x: number): number
```
**Tests**: Known values, recurrence relations

#### Task 2.6: Implement Spherical Bessel y
**File**: `src/function/special/sphericalbessely.ts`
**Description**: Spherical Bessel functions y_n(x)
**Interface**:
```typescript
sphericalbessely(n: number, x: number): number
```

#### Task 2.7: Implement Hankel Functions
**File**: `src/function/special/hankel.ts`
**Description**: Hankel functions H1_n(x) and H2_n(x)
**Interface**:
```typescript
hankel1(n: number, x: number): Complex  // H1_n(x) = J_n(x) + i*Y_n(x)
hankel2(n: number, x: number): Complex  // H2_n(x) = J_n(x) - i*Y_n(x)
```

#### Task 2.8: Implement Airy Ai Function
**File**: `src/function/special/airy.ts`
**Description**: Airy function Ai(x) and derivative Ai'(x)
**Interface**:
```typescript
airy(x: number): { ai: number, aip: number, bi: number, bip: number }
airyai(x: number): number
airyaip(x: number): number  // Derivative
```
**Tests**: Differential equation, asymptotic behavior

#### Task 2.9: Implement Airy Bi Function
**File**: `src/function/special/airy.ts` (extension)
**Description**: Airy function Bi(x) and derivative Bi'(x)
**Interface**:
```typescript
airybi(x: number): number
airybip(x: number): number  // Derivative
```

#### Task 2.10: WASM Acceleration for Bessel Functions
**File**: `src-wasm/special/bessel.ts`
**Description**: High-performance WASM implementations of Bessel functions
**Focus**: j0, j1, y0, y1, i0, i1, k0, k1 (most commonly used)
**Expected speedup**: 3-5x for large arrays

---

## Sprint 3: Probability Distributions (Part 1 - Continuous)
**Priority**: CRITICAL
**Estimated Complexity**: Medium
**Dependencies**: erf (exists), gamma (exists)

### Background
Probability distributions are fundamental for statistics, Monte Carlo methods, and data science. Each distribution needs: pdf, cdf, quantile (ppf/icdf), and random sampling.

### Tasks

#### Task 3.1: Implement Normal Distribution
**File**: `src/function/probability/distributions/normal.ts`
**Description**: Gaussian/Normal distribution N(μ, σ²)
**Interface**:
```typescript
normalPdf(x: number, mu?: number, sigma?: number): number
normalCdf(x: number, mu?: number, sigma?: number): number
normalInv(p: number, mu?: number, sigma?: number): number  // Quantile
normalRandom(mu?: number, sigma?: number): number
normalRandom(mu?: number, sigma?: number, size: number[]): Matrix
```
**Algorithms**:
- PDF: Gaussian formula
- CDF: Uses existing erf
- Inverse CDF: Rational approximation (Abramowitz & Stegun)
- Random: Box-Muller or Ziggurat algorithm
**Tests**: Mean/variance of samples, CDF(quantile(p)) = p

#### Task 3.2: Implement Student's t Distribution
**File**: `src/function/probability/distributions/studentt.ts`
**Description**: Student's t distribution for small sample statistics
**Interface**:
```typescript
tPdf(x: number, df: number): number
tCdf(x: number, df: number): number
tInv(p: number, df: number): number
tRandom(df: number, size?: number[]): number | Matrix
```
**Tests**: Approaches normal as df → ∞

#### Task 3.3: Implement Chi-Square Distribution
**File**: `src/function/probability/distributions/chi2.ts`
**Description**: Chi-square distribution for variance estimation and hypothesis testing
**Interface**:
```typescript
chi2Pdf(x: number, df: number): number
chi2Cdf(x: number, df: number): number
chi2Inv(p: number, df: number): number
chi2Random(df: number, size?: number[]): number | Matrix
```
**Relation**: Uses gamma distribution (χ² = Gamma(df/2, 2))

#### Task 3.4: Implement F Distribution
**File**: `src/function/probability/distributions/fdist.ts`
**Description**: F distribution for ANOVA and variance ratio tests
**Interface**:
```typescript
fPdf(x: number, df1: number, df2: number): number
fCdf(x: number, df1: number, df2: number): number
fInv(p: number, df1: number, df2: number): number
fRandom(df1: number, df2: number, size?: number[]): number | Matrix
```

#### Task 3.5: Implement Beta Distribution
**File**: `src/function/probability/distributions/beta.ts`
**Description**: Beta distribution for proportions and Bayesian analysis
**Interface**:
```typescript
betaPdf(x: number, alpha: number, beta: number): number
betaCdf(x: number, alpha: number, beta: number): number
betaInv(p: number, alpha: number, beta: number): number
betaRandom(alpha: number, beta: number, size?: number[]): number | Matrix
```
**Requires**: Beta function and incomplete beta function

#### Task 3.6: Implement Exponential Distribution
**File**: `src/function/probability/distributions/exponential.ts`
**Description**: Exponential distribution for waiting times
**Interface**:
```typescript
exponentialPdf(x: number, lambda: number): number
exponentialCdf(x: number, lambda: number): number
exponentialInv(p: number, lambda: number): number
exponentialRandom(lambda: number, size?: number[]): number | Matrix
```

#### Task 3.7: Implement Gamma Distribution
**File**: `src/function/probability/distributions/gammadist.ts`
**Description**: Full gamma distribution (extends existing gamma function)
**Interface**:
```typescript
gammaPdf(x: number, shape: number, scale: number): number
gammaCdf(x: number, shape: number, scale: number): number
gammaInv(p: number, shape: number, scale: number): number
gammaRandom(shape: number, scale: number, size?: number[]): number | Matrix
```
**Requires**: Incomplete gamma function (gammainc)

#### Task 3.8: Implement Incomplete Gamma Function
**File**: `src/function/special/gammainc.ts`
**Description**: Lower and upper incomplete gamma functions
**Interface**:
```typescript
gammainc(a: number, x: number): number  // P(a, x) = γ(a,x)/Γ(a)
gammaincc(a: number, x: number): number  // Q(a, x) = Γ(a,x)/Γ(a)
```
**Algorithms**: Series expansion, continued fraction

#### Task 3.9: Implement Weibull Distribution
**File**: `src/function/probability/distributions/weibull.ts`
**Description**: Weibull distribution for reliability analysis
**Interface**:
```typescript
weibullPdf(x: number, shape: number, scale: number): number
weibullCdf(x: number, shape: number, scale: number): number
weibullInv(p: number, shape: number, scale: number): number
weibullRandom(shape: number, scale: number, size?: number[]): number | Matrix
```

#### Task 3.10: Implement Lognormal Distribution
**File**: `src/function/probability/distributions/lognormal.ts`
**Description**: Lognormal distribution for multiplicative processes
**Interface**:
```typescript
lognormalPdf(x: number, mu: number, sigma: number): number
lognormalCdf(x: number, mu: number, sigma: number): number
lognormalInv(p: number, mu: number, sigma: number): number
lognormalRandom(mu: number, sigma: number, size?: number[]): number | Matrix
```

---

## Sprint 4: Probability Distributions (Part 2 - Discrete & Additional)
**Priority**: CRITICAL
**Estimated Complexity**: Medium
**Dependencies**: Sprint 3 (some shared utilities)

### Tasks

#### Task 4.1: Implement Poisson Distribution
**File**: `src/function/probability/distributions/poisson.ts`
**Description**: Poisson distribution for count data
**Interface**:
```typescript
poissonPmf(k: number, lambda: number): number  // P(X = k)
poissonCdf(k: number, lambda: number): number  // P(X ≤ k)
poissonInv(p: number, lambda: number): number
poissonRandom(lambda: number, size?: number[]): number | Matrix
```

#### Task 4.2: Implement Binomial Distribution
**File**: `src/function/probability/distributions/binomial.ts`
**Description**: Binomial distribution for success/failure trials
**Interface**:
```typescript
binomialPmf(k: number, n: number, p: number): number
binomialCdf(k: number, n: number, p: number): number
binomialInv(q: number, n: number, p: number): number
binomialRandom(n: number, p: number, size?: number[]): number | Matrix
```

#### Task 4.3: Implement Negative Binomial Distribution
**File**: `src/function/probability/distributions/negativebinomial.ts`
**Description**: Negative binomial for number of trials until r successes
**Interface**:
```typescript
negativeBinomialPmf(k: number, r: number, p: number): number
negativeBinomialCdf(k: number, r: number, p: number): number
negativeBinomialRandom(r: number, p: number, size?: number[]): number | Matrix
```

#### Task 4.4: Implement Geometric Distribution
**File**: `src/function/probability/distributions/geometric.ts`
**Description**: Geometric distribution for waiting time to first success
**Interface**:
```typescript
geometricPmf(k: number, p: number): number
geometricCdf(k: number, p: number): number
geometricRandom(p: number, size?: number[]): number | Matrix
```

#### Task 4.5: Implement Hypergeometric Distribution
**File**: `src/function/probability/distributions/hypergeometric.ts`
**Description**: Hypergeometric for sampling without replacement
**Interface**:
```typescript
hypergeometricPmf(k: number, N: number, K: number, n: number): number
hypergeometricCdf(k: number, N: number, K: number, n: number): number
hypergeometricRandom(N: number, K: number, n: number, size?: number[]): number | Matrix
```

#### Task 4.6: Implement Uniform Distribution (Continuous)
**File**: `src/function/probability/distributions/uniform.ts`
**Description**: Continuous uniform distribution
**Interface**:
```typescript
uniformPdf(x: number, a: number, b: number): number
uniformCdf(x: number, a: number, b: number): number
uniformInv(p: number, a: number, b: number): number
uniformRandom(a: number, b: number, size?: number[]): number | Matrix
```

#### Task 4.7: Implement Cauchy Distribution
**File**: `src/function/probability/distributions/cauchy.ts`
**Description**: Cauchy/Lorentz distribution (heavy tails)
**Interface**:
```typescript
cauchyPdf(x: number, x0: number, gamma: number): number
cauchyCdf(x: number, x0: number, gamma: number): number
cauchyInv(p: number, x0: number, gamma: number): number
cauchyRandom(x0: number, gamma: number, size?: number[]): number | Matrix
```

#### Task 4.8: Implement Logistic Distribution
**File**: `src/function/probability/distributions/logistic.ts`
**Description**: Logistic distribution for growth modeling
**Interface**:
```typescript
logisticPdf(x: number, mu: number, s: number): number
logisticCdf(x: number, mu: number, s: number): number
logisticInv(p: number, mu: number, s: number): number
logisticRandom(mu: number, s: number, size?: number[]): number | Matrix
```

#### Task 4.9: Implement Incomplete Beta Function
**File**: `src/function/special/betainc.ts`
**Description**: Regularized incomplete beta function (needed for many distributions)
**Interface**:
```typescript
betainc(a: number, b: number, x: number): number  // I_x(a, b)
betaincinv(a: number, b: number, y: number): number  // Inverse
```
**Algorithms**: Continued fraction, series expansion

#### Task 4.10: Implement Multivariate Normal Distribution
**File**: `src/function/probability/distributions/mvnormal.ts`
**Description**: Multivariate normal distribution for correlated random vectors
**Interface**:
```typescript
mvnormalPdf(x: Vector, mean: Vector, cov: Matrix): number
mvnormalRandom(mean: Vector, cov: Matrix, size?: number): Matrix
```
**Requires**: Cholesky decomposition (Sprint 1)

---

## Sprint 5: Root Finding & Optimization
**Priority**: CRITICAL
**Estimated Complexity**: High
**Dependencies**: Sprint 1 (linear algebra for some methods)

### Background
Root finding and optimization are fundamental to scientific computing - used in solving equations, parameter estimation, machine learning, and engineering design.

### Tasks

#### Task 5.1: Implement Brent's Method (Root Finding)
**File**: `src/function/numeric/roots/brentq.ts`
**Description**: Brent's method for scalar root finding (bracketed)
**Interface**:
```typescript
brentq(f: Function, a: number, b: number, options?: { tol?: number, maxIter?: number }): number
```
**Algorithm**: Combines bisection, secant, and inverse quadratic interpolation
**Tests**: Polynomial roots, transcendental equations

#### Task 5.2: Implement Newton-Raphson Method
**File**: `src/function/numeric/roots/newton.ts`
**Description**: Newton's method for root finding
**Interface**:
```typescript
newton(f: Function, x0: number, options?: { fprime?: Function, tol?: number }): number
```
**Features**: Automatic differentiation if fprime not provided
**Tests**: Convergence rate, starting point sensitivity

#### Task 5.3: Implement fzero (General Root Finder)
**File**: `src/function/numeric/fzero.ts`
**Description**: General-purpose scalar root finding (like MATLAB's fzero)
**Interface**:
```typescript
fzero(f: Function, x0: number | [number, number]): number
```
**Strategy**: Bracketing if interval given, otherwise combination of methods

#### Task 5.4: Implement fsolve (Nonlinear System Solver)
**File**: `src/function/numeric/fsolve.ts`
**Description**: Solve system of nonlinear equations F(x) = 0
**Interface**:
```typescript
fsolve(F: Function, x0: Vector, options?: { jacobian?: Function, tol?: number }): Vector
```
**Algorithms**: Newton-Raphson with line search, Broyden's method
**Requires**: Linear system solver (lusolve)

#### Task 5.5: Implement Golden Section Search
**File**: `src/function/numeric/optimize/golden.ts`
**Description**: Golden section search for 1D minimization (no derivatives)
**Interface**:
```typescript
goldenSection(f: Function, a: number, b: number, options?: { tol?: number }): number
```

#### Task 5.6: Implement fminbnd (Bounded 1D Optimization)
**File**: `src/function/numeric/fminbnd.ts`
**Description**: Find minimum of single-variable function on bounded interval
**Interface**:
```typescript
fminbnd(f: Function, a: number, b: number, options?: { tol?: number }): { x: number, fval: number }
```
**Algorithm**: Brent's method for optimization

#### Task 5.7: Implement Nelder-Mead Simplex
**File**: `src/function/numeric/optimize/neldermead.ts`
**Description**: Derivative-free multidimensional optimization
**Interface**:
```typescript
nelderMead(f: Function, x0: Vector, options?: NelderMeadOptions): OptimizeResult
```
**Tests**: Rosenbrock function, quadratic functions

#### Task 5.8: Implement BFGS (Quasi-Newton)
**File**: `src/function/numeric/optimize/bfgs.ts`
**Description**: BFGS quasi-Newton method for unconstrained optimization
**Interface**:
```typescript
bfgs(f: Function, x0: Vector, options?: { grad?: Function, tol?: number }): OptimizeResult
```
**Features**: Numerical gradient if not provided
**Tests**: Quadratic convergence rate

---

## Sprint 6: Numerical Integration (Quadrature)
**Priority**: HIGH
**Estimated Complexity**: Medium
**Dependencies**: None

### Background
Numerical integration is essential for computing areas, expected values, solving differential equations, and many scientific applications.

### Tasks

#### Task 6.1: Implement Trapezoidal Rule
**File**: `src/function/numeric/integration/trapz.ts`
**Description**: Trapezoidal rule for numerical integration
**Interface**:
```typescript
trapz(y: Vector, x?: Vector): number  // Integrate y over x
trapz(y: Matrix, dim?: number): Vector  // Along dimension
cumtrapz(y: Vector, x?: Vector): Vector  // Cumulative
```
**Tests**: Compare with analytical integrals

#### Task 6.2: Implement Simpson's Rule
**File**: `src/function/numeric/integration/simps.ts`
**Description**: Simpson's rule (higher accuracy than trapezoidal)
**Interface**:
```typescript
simps(y: Vector, x?: Vector): number
```
**Requires**: Odd number of points (uses composite rule)

#### Task 6.3: Implement Adaptive Quadrature (quad)
**File**: `src/function/numeric/integration/quad.ts`
**Description**: Adaptive quadrature for definite integrals
**Interface**:
```typescript
quad(f: Function, a: number, b: number, options?: QuadOptions): { result: number, error: number }
```
**Algorithm**: Gauss-Kronrod adaptive
**Features**: Error estimation, subdivision

#### Task 6.4: Implement Gauss-Legendre Quadrature
**File**: `src/function/numeric/integration/gausslegendre.ts`
**Description**: Fixed-order Gauss-Legendre quadrature
**Interface**:
```typescript
gausslegendre(f: Function, a: number, b: number, n?: number): number
gausslegendreNodes(n: number): { nodes: Vector, weights: Vector }
```
**Tests**: Exact for polynomials up to degree 2n-1

#### Task 6.5: Implement Romberg Integration
**File**: `src/function/numeric/integration/romberg.ts`
**Description**: Romberg integration using Richardson extrapolation
**Interface**:
```typescript
romberg(f: Function, a: number, b: number, options?: { tol?: number }): number
```

#### Task 6.6: Implement Infinite Interval Integration
**File**: `src/function/numeric/integration/quadinf.ts`
**Description**: Integration over infinite intervals
**Interface**:
```typescript
quadinf(f: Function, a: number, b: number): number  // a or b can be ±Infinity
```
**Algorithm**: Variable transformation + adaptive quadrature

#### Task 6.7: Implement 2D Integration (dblquad)
**File**: `src/function/numeric/integration/dblquad.ts`
**Description**: Double integration over rectangular or general regions
**Interface**:
```typescript
dblquad(f: Function, ax: number, bx: number, ay: number | Function, by: number | Function): number
```

#### Task 6.8: Implement Monte Carlo Integration
**File**: `src/function/numeric/integration/montecarlo.ts`
**Description**: Monte Carlo integration for high-dimensional integrals
**Interface**:
```typescript
montecarloIntegrate(f: Function, bounds: Array<[number, number]>, n?: number): { result: number, error: number }
```

---

## Sprint 7: Interpolation & Curve Fitting
**Priority**: HIGH
**Estimated Complexity**: Medium
**Dependencies**: Sprint 1 (linear algebra for splines)

### Tasks

#### Task 7.1: Implement Linear Interpolation (interp1)
**File**: `src/function/numeric/interpolate/interp1.ts`
**Description**: 1D interpolation with multiple methods
**Interface**:
```typescript
interp1(x: Vector, y: Vector, xq: number | Vector, method?: 'linear' | 'nearest' | 'spline' | 'pchip'): number | Vector
```
**Tests**: Exact at data points, boundary behavior

#### Task 7.2: Implement Cubic Spline Interpolation
**File**: `src/function/numeric/interpolate/spline.ts`
**Description**: Natural cubic spline interpolation
**Interface**:
```typescript
spline(x: Vector, y: Vector): SplineFunction
// SplineFunction.evaluate(xq: number): number
// SplineFunction.derivative(xq: number): number
// SplineFunction.integral(a: number, b: number): number
```
**Algorithm**: Tridiagonal system for spline coefficients

#### Task 7.3: Implement PCHIP (Monotonic Interpolation)
**File**: `src/function/numeric/interpolate/pchip.ts`
**Description**: Piecewise Cubic Hermite Interpolating Polynomial
**Interface**:
```typescript
pchip(x: Vector, y: Vector): PchipFunction
```
**Advantage**: Preserves monotonicity, no overshooting

#### Task 7.4: Implement 2D Interpolation (interp2)
**File**: `src/function/numeric/interpolate/interp2.ts`
**Description**: Bilinear and bicubic interpolation
**Interface**:
```typescript
interp2(x: Vector, y: Vector, z: Matrix, xq: number, yq: number, method?: 'linear' | 'cubic'): number
```

#### Task 7.5: Implement Polynomial Fitting (polyfit)
**File**: `src/function/numeric/fitting/polyfit.ts`
**Description**: Least squares polynomial fitting
**Interface**:
```typescript
polyfit(x: Vector, y: Vector, n: number): Vector  // Coefficients [a_n, ..., a_1, a_0]
polyval(p: Vector, x: number | Vector): number | Vector  // Evaluate polynomial
```
**Uses**: Linear least squares

#### Task 7.6: Implement General Curve Fitting
**File**: `src/function/numeric/fitting/curvefit.ts`
**Description**: Nonlinear least squares curve fitting
**Interface**:
```typescript
curvefit(f: Function, x: Vector, y: Vector, p0: Vector, options?: CurveFitOptions): { params: Vector, residuals: Vector }
```
**Algorithm**: Levenberg-Marquardt

#### Task 7.7: Implement Regression (Linear)
**File**: `src/function/statistics/regression/linearRegression.ts`
**Description**: Linear regression with statistics
**Interface**:
```typescript
linearRegression(x: Vector | Matrix, y: Vector): {
  coefficients: Vector,
  rSquared: number,
  standardErrors: Vector,
  pValues: Vector
}
```

#### Task 7.8: Implement Polynomial Root Finding (roots)
**File**: `src/function/algebra/roots.ts`
**Description**: Find all roots of a polynomial (companion matrix method)
**Interface**:
```typescript
roots(coefficients: Vector): Vector<Complex>  // All roots including complex
```
**Algorithm**: Eigenvalues of companion matrix
**Extends**: Existing polynomialRoot (limited to degree 3)

---

## Sprint 8: Elliptic & Hypergeometric Functions
**Priority**: HIGH
**Estimated Complexity**: High
**Dependencies**: None (but builds on Sprint 2 patterns)

### Background
Elliptic functions are essential for:
- Pendulum motion
- Elliptical orbits
- Electromagnetic field calculations
- Cryptography (elliptic curves)

Hypergeometric functions generalize many special functions.

### Tasks

#### Task 8.1: Implement Complete Elliptic Integral K
**File**: `src/function/special/elliptic.ts`
**Description**: Complete elliptic integral of the first kind K(m)
**Interface**:
```typescript
ellipk(m: number): number  // K(m), m = k²
```
**Algorithm**: Arithmetic-geometric mean (AGM)
**Tests**: Known values, limiting behaviors

#### Task 8.2: Implement Complete Elliptic Integral E
**File**: `src/function/special/elliptic.ts` (extension)
**Description**: Complete elliptic integral of the second kind E(m)
**Interface**:
```typescript
ellipe(m: number): number  // E(m)
```

#### Task 8.3: Implement Incomplete Elliptic Integrals
**File**: `src/function/special/elliptic.ts` (extension)
**Description**: Incomplete elliptic integrals F(φ, m) and E(φ, m)
**Interface**:
```typescript
ellipkinc(phi: number, m: number): number  // F(φ, m)
ellipeinc(phi: number, m: number): number  // E(φ, m)
```
**Algorithm**: Carlson's forms or Legendre reduction

#### Task 8.4: Implement Elliptic Integral of Third Kind
**File**: `src/function/special/elliptic.ts` (extension)
**Description**: Π(n, φ, m) - third kind
**Interface**:
```typescript
ellippi(n: number, phi: number, m: number): number
```

#### Task 8.5: Implement Jacobi Elliptic Functions
**File**: `src/function/special/jacobi.ts`
**Description**: Jacobi elliptic functions sn, cn, dn
**Interface**:
```typescript
ellipj(u: number, m: number): { sn: number, cn: number, dn: number }
jacobisn(u: number, m: number): number
jacobicn(u: number, m: number): number
jacobidn(u: number, m: number): number
```
**Algorithm**: Arithmetic-geometric mean descent

#### Task 8.6: Implement Confluent Hypergeometric 1F1
**File**: `src/function/special/hypergeometric.ts`
**Description**: Kummer's confluent hypergeometric function M(a, b, z)
**Interface**:
```typescript
hyp1f1(a: number, b: number, z: number): number  // ₁F₁(a; b; z)
```
**Algorithm**: Series expansion, asymptotic expansion, connection formulas

#### Task 8.7: Implement Gauss Hypergeometric 2F1
**File**: `src/function/special/hypergeometric.ts` (extension)
**Description**: Gauss hypergeometric function F(a, b; c; z)
**Interface**:
```typescript
hyp2f1(a: number, b: number, c: number, z: number): number  // ₂F₁(a, b; c; z)
```
**Algorithm**: Series for |z| < 1, analytic continuation otherwise
**Importance**: Generalizes many special functions

#### Task 8.8: Implement Tricomi's Function U
**File**: `src/function/special/hypergeometric.ts` (extension)
**Description**: Tricomi's confluent hypergeometric U(a, b, z)
**Interface**:
```typescript
hypU(a: number, b: number, z: number): number
```

#### Task 8.9: Implement Generalized Hypergeometric pFq
**File**: `src/function/special/hypergeometric.ts` (extension)
**Description**: Generalized hypergeometric function
**Interface**:
```typescript
hyppfq(a: number[], b: number[], z: number): number  // pFq
```

#### Task 8.10: Implement Carlson Elliptic Integrals
**File**: `src/function/special/carlson.ts`
**Description**: Carlson symmetric forms RF, RD, RJ, RC
**Interface**:
```typescript
carlsonRF(x: number, y: number, z: number): number
carlsonRD(x: number, y: number, z: number): number
carlsonRJ(x: number, y: number, z: number, p: number): number
carlsonRC(x: number, y: number): number
```
**Use**: More numerically stable for elliptic integrals

---

## Sprint 9: Advanced Statistics
**Priority**: HIGH
**Estimated Complexity**: Medium
**Dependencies**: Sprint 3-4 (probability distributions)

### Tasks

#### Task 9.1: Implement T-Test
**File**: `src/function/statistics/hypothesis/ttest.ts`
**Description**: Student's t-test for hypothesis testing
**Interface**:
```typescript
ttest(x: Vector, mu?: number): { t: number, pValue: number, ci: [number, number] }  // One-sample
ttest2(x: Vector, y: Vector, options?: { paired?: boolean }): TTestResult  // Two-sample
```

#### Task 9.2: Implement Chi-Square Test
**File**: `src/function/statistics/hypothesis/chi2test.ts`
**Description**: Chi-square goodness of fit and independence tests
**Interface**:
```typescript
chi2gof(observed: Vector, expected?: Vector): { chi2: number, pValue: number, df: number }
chi2test(contingencyTable: Matrix): { chi2: number, pValue: number }
```

#### Task 9.3: Implement F-Test
**File**: `src/function/statistics/hypothesis/ftest.ts`
**Description**: F-test for variance equality
**Interface**:
```typescript
ftest(x: Vector, y: Vector): { f: number, pValue: number }
```

#### Task 9.4: Implement ANOVA
**File**: `src/function/statistics/anova.ts`
**Description**: One-way and two-way ANOVA
**Interface**:
```typescript
anova1(groups: Vector[]): AnovaResult
anova2(data: Matrix, factorA: Vector, factorB: Vector): Anova2Result
```

#### Task 9.5: Implement Kolmogorov-Smirnov Test
**File**: `src/function/statistics/hypothesis/kstest.ts`
**Description**: KS test for distribution comparison
**Interface**:
```typescript
kstest(x: Vector, cdf: Function): { d: number, pValue: number }
kstest2(x: Vector, y: Vector): { d: number, pValue: number }  // Two-sample
```

#### Task 9.6: Implement Skewness and Kurtosis
**File**: `src/function/statistics/moments.ts`
**Description**: Higher-order moments
**Interface**:
```typescript
skewness(x: Vector): number
kurtosis(x: Vector): number
moment(x: Vector, n: number): number  // nth central moment
```

#### Task 9.7: Implement Covariance Matrix
**File**: `src/function/statistics/cov.ts`
**Description**: Covariance and correlation matrices
**Interface**:
```typescript
cov(X: Matrix): Matrix  // Sample covariance
corrcoef(X: Matrix): Matrix  // Correlation matrix
```

#### Task 9.8: Implement Bootstrap Methods
**File**: `src/function/statistics/bootstrap.ts`
**Description**: Bootstrap confidence intervals and standard errors
**Interface**:
```typescript
bootstrap(data: Vector, statistic: Function, n?: number): BootstrapResult
```

#### Task 9.9: Implement Kernel Density Estimation
**File**: `src/function/statistics/kde.ts`
**Description**: Nonparametric density estimation
**Interface**:
```typescript
kde(data: Vector, bandwidth?: number): KDEFunction
// KDEFunction.evaluate(x: number): number
// KDEFunction.pdf(x: Vector): Vector
```

#### Task 9.10: Implement Quantile and Percentile
**File**: `src/function/statistics/quantile.ts`
**Description**: Enhanced quantile computation (extend quantileSeq)
**Interface**:
```typescript
quantile(data: Vector, q: number | Vector, method?: number): number | Vector
percentile(data: Vector, p: number | Vector): number | Vector
iqr(data: Vector): number  // Interquartile range
```

---

## Sprint 10: Signal Processing Filters
**Priority**: MEDIUM-HIGH
**Estimated Complexity**: Medium
**Dependencies**: Sprint 1 (linear algebra), existing fft/ifft

### Tasks

#### Task 10.1: Implement Butterworth Filter Design
**File**: `src/function/signal/filters/butter.ts`
**Description**: Butterworth IIR filter design
**Interface**:
```typescript
butter(n: number, Wn: number | [number, number], btype?: 'low' | 'high' | 'band' | 'stop'): { b: Vector, a: Vector }
```
**Tests**: Maximally flat passband

#### Task 10.2: Implement Chebyshev Type I Filter
**File**: `src/function/signal/filters/cheby1.ts`
**Description**: Chebyshev Type I filter design
**Interface**:
```typescript
cheby1(n: number, rp: number, Wn: number | [number, number], btype?: string): { b: Vector, a: Vector }
```
**rp**: Passband ripple in dB

#### Task 10.3: Implement Chebyshev Type II Filter
**File**: `src/function/signal/filters/cheby2.ts`
**Description**: Chebyshev Type II filter design
**Interface**:
```typescript
cheby2(n: number, rs: number, Wn: number | [number, number], btype?: string): { b: Vector, a: Vector }
```
**rs**: Stopband attenuation in dB

#### Task 10.4: Implement Elliptic Filter
**File**: `src/function/signal/filters/ellip.ts`
**Description**: Elliptic (Cauer) filter design
**Interface**:
```typescript
ellip(n: number, rp: number, rs: number, Wn: number | [number, number], btype?: string): { b: Vector, a: Vector }
```
**Dependencies**: Elliptic functions (Sprint 8)

#### Task 10.5: Implement FIR Filter Design (fir1)
**File**: `src/function/signal/filters/fir1.ts`
**Description**: Window-based FIR filter design
**Interface**:
```typescript
fir1(n: number, Wn: number | [number, number], ftype?: string, window?: string | Vector): Vector
```

#### Task 10.6: Implement filter Function
**File**: `src/function/signal/filter.ts`
**Description**: Apply digital filter to data
**Interface**:
```typescript
filter(b: Vector, a: Vector, x: Vector): Vector
filtfilt(b: Vector, a: Vector, x: Vector): Vector  // Zero-phase filtering
```

#### Task 10.7: Implement Convolution
**File**: `src/function/signal/conv.ts`
**Description**: 1D and 2D convolution
**Interface**:
```typescript
conv(u: Vector, v: Vector, shape?: 'full' | 'same' | 'valid'): Vector
conv2(A: Matrix, K: Matrix, shape?: 'full' | 'same' | 'valid'): Matrix
```
**WASM**: Yes - use FFT-based convolution for large arrays

#### Task 10.8: Implement Correlation
**File**: `src/function/signal/xcorr.ts`
**Description**: Cross-correlation
**Interface**:
```typescript
xcorr(x: Vector, y?: Vector, maxlag?: number): { c: Vector, lags: Vector }
```

#### Task 10.9: Implement Second-Order Sections
**File**: `src/function/signal/sos.ts`
**Description**: Second-order sections filter representation
**Interface**:
```typescript
tf2sos(b: Vector, a: Vector): Matrix  // Convert to SOS
sos2tf(sos: Matrix): { b: Vector, a: Vector }
sosfilt(sos: Matrix, x: Vector): Vector  // Filter using SOS
```
**Advantage**: Better numerical stability than tf

#### Task 10.10: Implement Transfer Function Conversions
**File**: `src/function/signal/tfconvert.ts`
**Description**: Convert between filter representations
**Interface**:
```typescript
tf2ss(b: Vector, a: Vector): { A: Matrix, B: Matrix, C: Matrix, D: Matrix }
ss2tf(A: Matrix, B: Matrix, C: Matrix, D: Matrix): { b: Vector, a: Vector }
zpk2sos(z: Vector, p: Vector, k: number): Matrix
```

---

## Sprint 11: Window Functions & Spectral Analysis
**Priority**: MEDIUM-HIGH
**Estimated Complexity**: Low
**Dependencies**: Sprint 10

### Tasks

#### Task 11.1: Implement Hamming Window
**File**: `src/function/signal/windows/hamming.ts`
**Description**: Hamming window function
**Interface**:
```typescript
hamming(n: number, symmetric?: boolean): Vector
```

#### Task 11.2: Implement Hanning Window
**File**: `src/function/signal/windows/hanning.ts`
**Description**: Hanning (Hann) window function
**Interface**:
```typescript
hanning(n: number, symmetric?: boolean): Vector
```

#### Task 11.3: Implement Blackman Window
**File**: `src/function/signal/windows/blackman.ts`
**Description**: Blackman window function
**Interface**:
```typescript
blackman(n: number, symmetric?: boolean): Vector
```

#### Task 11.4: Implement Kaiser Window
**File**: `src/function/signal/windows/kaiser.ts`
**Description**: Kaiser window with adjustable parameter
**Interface**:
```typescript
kaiser(n: number, beta: number): Vector
```
**Dependencies**: Bessel I0 (Sprint 2)

#### Task 11.5: Implement Additional Windows
**File**: `src/function/signal/windows/windows.ts`
**Description**: Collection of additional windows
**Interface**:
```typescript
bartlett(n: number): Vector
triang(n: number): Vector
boxcar(n: number): Vector
tukey(n: number, alpha?: number): Vector
parzen(n: number): Vector
```

#### Task 11.6: Implement Periodogram
**File**: `src/function/signal/spectral/periodogram.ts`
**Description**: Power spectral density estimation
**Interface**:
```typescript
periodogram(x: Vector, fs?: number, window?: Vector): { psd: Vector, f: Vector }
```

#### Task 11.7: Implement Welch's Method
**File**: `src/function/signal/spectral/pwelch.ts`
**Description**: Welch's method for PSD estimation
**Interface**:
```typescript
pwelch(x: Vector, window?: number | Vector, noverlap?: number, nfft?: number, fs?: number): { psd: Vector, f: Vector }
```

#### Task 11.8: Implement Short-Time Fourier Transform
**File**: `src/function/signal/spectral/stft.ts`
**Description**: STFT for time-frequency analysis
**Interface**:
```typescript
stft(x: Vector, window: number | Vector, noverlap?: number, nfft?: number): { S: Matrix, f: Vector, t: Vector }
istft(S: Matrix, window: number | Vector, noverlap?: number): Vector
```

---

## Sprint 12: ODE/PDE Enhancements
**Priority**: MEDIUM
**Estimated Complexity**: High
**Dependencies**: Sprint 1 (linear algebra)

### Tasks

#### Task 12.1: Implement Backward Differentiation Formula (BDF)
**File**: `src/function/numeric/ode/bdf.ts`
**Description**: BDF method for stiff ODEs
**Interface**:
```typescript
solveBDF(odefun: Function, tspan: [number, number], y0: Vector, options?: BDFOptions): ODESolution
```
**Use**: Stiff systems where RK methods fail

#### Task 12.2: Implement Adams-Bashforth-Moulton
**File**: `src/function/numeric/ode/adams.ts`
**Description**: Adams-Bashforth-Moulton predictor-corrector
**Interface**:
```typescript
solveABM(odefun: Function, tspan: [number, number], y0: Vector, options?: ABMOptions): ODESolution
```

#### Task 12.3: Implement Event Detection
**File**: `src/function/numeric/ode/events.ts`
**Description**: Event detection and handling for ODEs
**Interface**:
```typescript
// Extended solveODE options
{
  events: (t: number, y: Vector) => number[],  // Zero-crossing functions
  terminal: boolean[],  // Stop on event?
  direction: number[]   // Direction of crossing
}
```

#### Task 12.4: Implement DAE Solver
**File**: `src/function/numeric/dae/solveDAE.ts`
**Description**: Differential-algebraic equation solver
**Interface**:
```typescript
solveDAE(F: Function, tspan: [number, number], y0: Vector, yp0: Vector): DAESolution
```
**Algorithm**: BDF-based method

#### Task 12.5: Implement Boundary Value Problem Solver
**File**: `src/function/numeric/bvp/bvp4c.ts`
**Description**: Solve two-point BVPs
**Interface**:
```typescript
bvp4c(odefun: Function, bcfun: Function, solinit: BVPInit): BVPSolution
```
**Algorithm**: Collocation method

#### Task 12.6: Implement Finite Difference PDE Solver
**File**: `src/function/numeric/pde/parabolic.ts`
**Description**: Solve parabolic PDEs (heat equation type)
**Interface**:
```typescript
pdepe(m: number, pdefun: Function, icfun: Function, bcfun: Function, xmesh: Vector, tspan: Vector): PDESolution
```

#### Task 12.7: Implement Method of Lines
**File**: `src/function/numeric/pde/mol.ts`
**Description**: Method of lines for PDE → ODE conversion
**Interface**:
```typescript
methodOfLines(pde: PDESpec, xmesh: Vector): (t: number, y: Vector) => Vector  // Returns ODE function
```

#### Task 12.8: Implement Delay Differential Equations
**File**: `src/function/numeric/dde/solveDDE.ts`
**Description**: Solve DDEs with constant delays
**Interface**:
```typescript
solveDDE(ddefun: Function, delays: Vector, tspan: [number, number], history: Function): DDESolution
```

---

## Sprint 13: Orthogonal Polynomials
**Priority**: MEDIUM
**Estimated Complexity**: Medium
**Dependencies**: None

### Tasks

#### Task 13.1: Implement Legendre Polynomials
**File**: `src/function/special/polynomials/legendre.ts`
**Description**: Legendre polynomials P_n(x)
**Interface**:
```typescript
legendre(n: number, x: number): number  // P_n(x)
legendreP(n: number, x: number): number  // Same as legendre
assocLegendre(l: number, m: number, x: number): number  // Associated P_l^m(x)
```
**Tests**: Orthogonality, recurrence relations

#### Task 13.2: Implement Hermite Polynomials
**File**: `src/function/special/polynomials/hermite.ts`
**Description**: Hermite polynomials (physicist's and probabilist's)
**Interface**:
```typescript
hermite(n: number, x: number): number  // Physicist's H_n(x)
hermiteProb(n: number, x: number): number  // Probabilist's He_n(x)
```
**Use**: Quantum harmonic oscillator, Gaussian quadrature

#### Task 13.3: Implement Laguerre Polynomials
**File**: `src/function/special/polynomials/laguerre.ts`
**Description**: Laguerre polynomials L_n(x)
**Interface**:
```typescript
laguerre(n: number, x: number): number  // L_n(x)
assocLaguerre(n: number, alpha: number, x: number): number  // L_n^α(x)
```
**Use**: Hydrogen atom wavefunctions

#### Task 13.4: Implement Chebyshev Polynomials
**File**: `src/function/special/polynomials/chebyshev.ts`
**Description**: Chebyshev polynomials T_n(x) and U_n(x)
**Interface**:
```typescript
chebyshevT(n: number, x: number): number  // First kind
chebyshevU(n: number, x: number): number  // Second kind
```
**Use**: Numerical approximation, spectral methods

#### Task 13.5: Implement Jacobi Polynomials
**File**: `src/function/special/polynomials/jacobi.ts`
**Description**: Jacobi polynomials P_n^(α,β)(x)
**Interface**:
```typescript
jacobi(n: number, alpha: number, beta: number, x: number): number
```
**Note**: Generalizes Legendre, Chebyshev, Gegenbauer

#### Task 13.6: Implement Gegenbauer Polynomials
**File**: `src/function/special/polynomials/gegenbauer.ts`
**Description**: Gegenbauer (ultraspherical) polynomials
**Interface**:
```typescript
gegenbauer(n: number, alpha: number, x: number): number  // C_n^α(x)
```

#### Task 13.7: Implement Spherical Harmonics
**File**: `src/function/special/sphericalharmonics.ts`
**Description**: Spherical harmonics Y_l^m(θ, φ)
**Interface**:
```typescript
sphericalHarmonic(l: number, m: number, theta: number, phi: number): Complex
sphericalHarmonicReal(l: number, m: number, theta: number, phi: number): number
```
**Dependencies**: Associated Legendre (Task 13.1)

#### Task 13.8: Implement Polynomial Roots and Weights
**File**: `src/function/special/polynomials/quadrature.ts`
**Description**: Compute quadrature nodes and weights from orthogonal polynomials
**Interface**:
```typescript
legendreRoots(n: number): { roots: Vector, weights: Vector }
hermiteRoots(n: number): { roots: Vector, weights: Vector }
laguerreRoots(n: number): { roots: Vector, weights: Vector }
chebyshevRoots(n: number): { roots: Vector, weights: Vector }
```
**Use**: Gaussian quadrature

---

## Sprint 14: Additional Special Functions
**Priority**: MEDIUM
**Estimated Complexity**: Medium
**Dependencies**: Sprints 2, 8

### Tasks

#### Task 14.1: Implement erfc, erfinv, erfcinv
**File**: `src/function/special/erf.ts` (extension)
**Description**: Complementary error function and inverses
**Interface**:
```typescript
erfc(x: number): number  // 1 - erf(x)
erfinv(y: number): number  // Inverse of erf
erfcinv(y: number): number  // Inverse of erfc
```
**Algorithm**: Rational approximation for inverses

#### Task 14.2: Implement Digamma and Polygamma
**File**: `src/function/special/digamma.ts`
**Description**: Psi function and derivatives
**Interface**:
```typescript
digamma(x: number): number  // ψ(x) = Γ'(x)/Γ(x)
trigamma(x: number): number  // ψ'(x)
polygamma(n: number, x: number): number  // ψ^(n)(x)
```

#### Task 14.3: Implement Lambert W Function
**File**: `src/function/special/lambertw.ts`
**Description**: Lambert W function W(z) where W(z)*e^W(z) = z
**Interface**:
```typescript
lambertw(z: number, k?: number): number  // Branch k (default 0)
```
**Algorithm**: Halley's method

#### Task 14.4: Implement Exponential Integrals
**File**: `src/function/special/expint.ts`
**Description**: Exponential integral functions
**Interface**:
```typescript
expint(n: number, x: number): number  // E_n(x)
ei(x: number): number  // Ei(x)
li(x: number): number  // Logarithmic integral
```

#### Task 14.5: Implement Fresnel Integrals
**File**: `src/function/special/fresnel.ts`
**Description**: Fresnel S and C integrals
**Interface**:
```typescript
fresnelS(x: number): number  // S(x) = ∫sin(πt²/2)dt
fresnelC(x: number): number  // C(x) = ∫cos(πt²/2)dt
fresnel(x: number): { S: number, C: number }
```

#### Task 14.6: Implement Sine and Cosine Integrals
**File**: `src/function/special/trig_integrals.ts`
**Description**: Si, Ci, Shi, Chi integrals
**Interface**:
```typescript
si(x: number): number  // Sine integral
ci(x: number): number  // Cosine integral
shi(x: number): number  // Hyperbolic sine integral
chi(x: number): number  // Hyperbolic cosine integral
```

#### Task 14.7: Implement Struve Functions
**File**: `src/function/special/struve.ts`
**Description**: Struve functions H_n(x) and L_n(x)
**Interface**:
```typescript
struve(n: number, x: number): number  // H_n(x)
struveL(n: number, x: number): number  // Modified L_n(x)
```

#### Task 14.8: Implement Polylogarithm
**File**: `src/function/special/polylog.ts`
**Description**: Polylogarithm function Li_s(z)
**Interface**:
```typescript
polylog(s: number, z: number): number  // Li_s(z)
```

#### Task 14.9: Implement Dawson Function
**File**: `src/function/special/dawson.ts`
**Description**: Dawson's integral D(x)
**Interface**:
```typescript
dawson(x: number): number  // D(x) = e^(-x²) ∫₀ˣ e^(t²) dt
```

#### Task 14.10: Implement Owen's T Function
**File**: `src/function/special/owent.ts`
**Description**: Owen's T function for bivariate normal
**Interface**:
```typescript
owenT(h: number, a: number): number
```

---

## Sprint 15: Symbolic Computation Enhancements
**Priority**: MEDIUM
**Estimated Complexity**: High
**Dependencies**: Existing expression system

### Tasks

#### Task 15.1: Implement Symbolic Integration
**File**: `src/function/algebra/integrate.ts`
**Description**: Symbolic integration (antiderivatives)
**Interface**:
```typescript
integrate(expr: Node | string, variable: string): Node
```
**Scope**: Polynomials, basic trig, exponentials, logarithms
**Algorithm**: Pattern matching, Risch algorithm subset

#### Task 15.2: Implement Limits
**File**: `src/function/algebra/limit.ts`
**Description**: Compute limits symbolically
**Interface**:
```typescript
limit(expr: Node | string, variable: string, value: number | string, direction?: '+' | '-'): Node
```
**Handles**: L'Hôpital's rule, indeterminate forms

#### Task 15.3: Implement Taylor/Maclaurin Series
**File**: `src/function/algebra/taylor.ts`
**Description**: Taylor series expansion
**Interface**:
```typescript
taylor(expr: Node | string, variable: string, point: number, order: number): Node
```
**Output**: Polynomial approximation

#### Task 15.4: Implement Symbolic Summation
**File**: `src/function/algebra/symbolicSum.ts`
**Description**: Simplify symbolic sums
**Interface**:
```typescript
symbolicSum(expr: Node | string, variable: string, lower: number, upper: number | string): Node
```
**Handles**: Arithmetic/geometric series, common summation identities

#### Task 15.5: Implement Equation Solver (solve)
**File**: `src/function/algebra/solve.ts`
**Description**: Solve equations symbolically
**Interface**:
```typescript
solve(equation: Node | string, variable: string): Node[]  // All solutions
solveSystem(equations: Array<Node | string>, variables: string[]): Object[]
```
**Scope**: Linear, quadratic, polynomial, some transcendental

#### Task 15.6: Implement Polynomial Factorization
**File**: `src/function/algebra/factor.ts`
**Description**: Factor polynomials
**Interface**:
```typescript
factor(expr: Node | string): Node
factorList(expr: Node | string): Array<{ factor: Node, exponent: number }>
```
**Algorithm**: Integer factorization, rational root theorem

#### Task 15.7: Implement Partial Fractions
**File**: `src/function/algebra/partialFractions.ts`
**Description**: Partial fraction decomposition
**Interface**:
```typescript
partialFractions(expr: Node | string, variable: string): Node
```
**Use**: Integration of rational functions

#### Task 15.8: Implement Expression Expansion
**File**: `src/function/algebra/expand.ts`
**Description**: Expand expressions (opposite of factor)
**Interface**:
```typescript
expand(expr: Node | string): Node
expandAll(expr: Node | string): Node  // Recursive expansion
```

---

## Implementation Guidelines

### Code Standards

1. **TypeScript First**: All new code should be in TypeScript
2. **Factory Pattern**: Use mathjs factory pattern for all functions
3. **Typed Functions**: Support multiple numeric types (number, BigNumber, Complex, Matrix)
4. **Pure Functions**: Implement core algorithms as pure functions in `src/plain/`
5. **WASM**: Add WASM implementations for computationally intensive functions

### File Structure Template

```typescript
// src/function/category/functionName.ts

import { factory } from '../../utils/factory.js'
import { functionNameNumber } from '../../plain/number/functionName.js'

const name = 'functionName'
const dependencies = ['typed', 'config', /* other deps */]

export const createFunctionName = factory(name, dependencies, ({ typed, config }) => {
  /**
   * Description of the function.
   *
   * Syntax:
   *    math.functionName(param1, param2)
   *
   * Examples:
   *    math.functionName(1, 2)  // returns X
   *
   * @param {number | BigNumber | Complex | Matrix} param1  Description
   * @param {number} param2  Description
   * @return {number | BigNumber | Complex | Matrix} Description
   */
  return typed(name, {
    'number': functionNameNumber,
    'BigNumber': (x) => /* BigNumber implementation */,
    'Complex': (x) => /* Complex implementation */,
    'Array | Matrix': typed.referToSelf(self => (x) => deepMap(x, self, true))
  })
})
```

### Testing Template

```javascript
// test/unit-tests/function/category/functionName.test.js

import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const { functionName, matrix, complex, bignumber } = math

describe('functionName', function () {
  it('should compute correct result for numbers', function () {
    assert.strictEqual(functionName(1, 2), expectedResult)
  })

  it('should work with matrices', function () {
    const result = functionName(matrix([[1, 2], [3, 4]]))
    assert.deepStrictEqual(result.toArray(), [[...], [...]])
  })

  it('should throw for invalid input', function () {
    assert.throws(function () { functionName('invalid') }, /TypeError/)
  })
})
```

### WASM Template

```typescript
// src-wasm/category/functionName.ts

export function functionName(x: f64): f64 {
  // High-performance implementation
  return result
}

// For array operations
export function functionNameArray(
  input: Float64Array,
  output: Float64Array,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    output[i] = functionName(input[i])
  }
}
```

---

## Priority Matrix

| Sprint | Functions Added | Cumulative | Scientific Computing % |
|--------|----------------|------------|------------------------|
| Current | 214 | 214 | 35% |
| Sprint 1 | 8 | 222 | 40% |
| Sprint 2 | 10 | 232 | 45% |
| Sprint 3 | 10 | 242 | 50% |
| Sprint 4 | 10 | 252 | 55% |
| Sprint 5 | 8 | 260 | 60% |
| Sprint 6 | 8 | 268 | 65% |
| Sprint 7 | 8 | 276 | 70% |
| Sprint 8 | 10 | 286 | 75% |
| Sprint 9 | 10 | 296 | 80% |
| Sprint 10 | 10 | 306 | 83% |
| Sprint 11 | 8 | 314 | 86% |
| Sprint 12 | 8 | 322 | 89% |
| Sprint 13 | 8 | 330 | 92% |
| Sprint 14 | 10 | 340 | 95% |
| Sprint 15 | 8 | 348 | 97% |

---

## Success Criteria

### Per-Sprint Completion Requirements

1. **All tasks implemented** with TypeScript source files
2. **Unit tests** achieving >90% code coverage
3. **Documentation** in JSDoc format
4. **Type definitions** updated in `types/index.d.ts`
5. **Factory registration** in `src/factoriesAny.js`
6. **Performance benchmarks** for WASM-accelerated functions

### Overall Project Success

1. **Scientific Computing Parity**: 95%+ feature coverage vs SciPy
2. **Performance**: WASM acceleration for matrix operations and special functions
3. **Type Safety**: Full TypeScript coverage
4. **Test Coverage**: 90%+ overall
5. **Documentation**: Complete API documentation for all new functions

---

## Appendix: Function Reference by Domain

### A. Linear Algebra (Sprint 1, 12)
- SVD, Cholesky, polar, rank, nullspace, orth, lstsq
- BVP solvers, DAE solvers

### B. Special Functions (Sprints 2, 8, 13, 14)
- Bessel: j0, j1, jn, y0, y1, yn, i0, i1, in, k0, k1, kn, hankel1, hankel2
- Airy: ai, aip, bi, bip
- Elliptic: ellipk, ellipe, ellipkinc, ellipeinc, ellippi, jacobi sn/cn/dn
- Hypergeometric: hyp1f1, hyp2f1, hypU, hyppfq
- Orthogonal: legendre, hermite, laguerre, chebyshev, jacobi, gegenbauer
- Other: digamma, polygamma, lambertw, expint, fresnel, struve, polylog

### C. Probability & Statistics (Sprints 3, 4, 9)
- Distributions: normal, t, chi2, F, beta, gamma, exponential, weibull, lognormal, poisson, binomial, etc.
- Tests: ttest, chi2test, ftest, kstest, anova
- Descriptive: skewness, kurtosis, cov, corrcoef, kde, bootstrap

### D. Numerical Methods (Sprints 5, 6, 7)
- Root finding: brentq, newton, fzero, fsolve
- Optimization: goldenSection, fminbnd, nelderMead, bfgs
- Integration: trapz, simps, quad, romberg, gausslegendre, dblquad
- Interpolation: interp1, spline, pchip, interp2, polyfit, curvefit

### E. Signal Processing (Sprints 10, 11)
- Filters: butter, cheby1, cheby2, ellip, fir1, filter, filtfilt
- Windows: hamming, hanning, blackman, kaiser, bartlett
- Spectral: periodogram, pwelch, stft, conv, xcorr

### F. Differential Equations (Sprint 12)
- ODE: BDF, Adams-Bashforth, event detection
- DAE, BVP, DDE solvers
- PDE: pdepe, method of lines

### G. Symbolic (Sprint 15)
- integrate, limit, taylor, symbolicSum, solve, factor, partialFractions, expand

---

*Document Version: 1.0*
*Created: 2025-11-28*
*Target Completion: 15 sprints (150 days with 10 days/sprint)*
