# Mathematical Function Expansion Roadmap

**Date:** 2026-04-03
**Purpose:** Gap analysis of math.js vs Mathematica/Wolfram and Mathcad, with a phased implementation roadmap for expanding the function library.

> **Historical Note:** This roadmap was written when the project included WASM/Rust support. TypeScript and WASM acceleration has since been extracted to [MathTS](https://github.com/danielsimonjr/MathTS). This is now a pure JavaScript library. References to WASM, Rust, and `src/wasm-rust/` below are historical only.

---

## Current State

| Library | Core Math Functions | Special Functions | Total Built-in |
|---------|-------------------|-------------------|---------------|
| **Wolfram Mathematica** | ~800 | ~300 | ~6,600 (incl. non-math) |
| **PTC Mathcad Prime** | ~400 | ~100 | ~700 |
| **math.js** | **228** | ~10 | ~400 (incl. factories) |

math.js covers the fundamentals well (arithmetic, trigonometry, linear algebra, basic statistics) but has significant gaps in special functions, numerical methods, optimization, and advanced algebra.

---

## Gap Analysis by Domain

### 1. Special Functions (CRITICAL GAP)

math.js has: `erf`, `gamma`, `lgamma`, `zeta`, `bellNumbers`, `catalan`, `stirlingS2`, `bernoulli`

**Missing from Mathematica/Mathcad core:**

| Function Family | Mathematica | Mathcad | math.js | Priority |
|----------------|-------------|---------|---------|----------|
| **Bessel functions** | BesselJ, BesselY, BesselI, BesselK | J0, J1, Y0, Y1 | None | HIGH |
| **Airy functions** | AiryAi, AiryBi, AiryAiPrime, AiryBiPrime | None | None | MEDIUM |
| **Elliptic integrals** | EllipticK, EllipticF, EllipticE, EllipticPi | None | None | MEDIUM |
| **Elliptic functions** | JacobiSN, JacobiCN, JacobiDN, WeierstrassP | None | None | LOW |
| **Hypergeometric** | Hypergeometric2F1, HypergeometricPFQ, HypergeometricU | None | None | MEDIUM |
| **Orthogonal polynomials** | LegendreP, ChebyshevT, HermiteH, LaguerreL | None | None | MEDIUM |
| **Beta function** | Beta, BetaRegularized, InverseBetaRegularized | None | None | HIGH |
| **Incomplete gamma** | GammaRegularized, InverseGammaRegularized | None | None | HIGH |
| **Digamma/Polygamma** | PolyGamma (digamma, trigamma, etc.) | None | None | MEDIUM |
| **Error function variants** | Erfc, Erfi, FresnelS, FresnelC, DawsonF | erfc | None | MEDIUM |
| **Riemann/zeta variants** | RiemannSiegelZ, StieltjesGamma, PolyLog, LerchPhi | None | `zeta` only | LOW |
| **Spherical Bessel** | SphericalBesselJ, SphericalBesselY | None | None | LOW |
| **Kelvin functions** | KelvinBer, KelvinBei, KelvinKer, KelvinKei | None | None | LOW |
| **Struve functions** | StruveH, StruveL | None | None | LOW |
| **Mathieu functions** | MathieuS, MathieuC, MathieuCharacteristicA | None | None | LOW |

**Estimated new functions: ~60-80**

### 2. Numerical Methods (SIGNIFICANT GAP)

math.js has: `solveODE` (RK23/RK45), basic `derivative`, `simplify`

**Missing:**

| Category | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Numerical integration** | NIntegrate (adaptive, multi-dim) | None built-in | None | HIGH |
| **Root finding** | FindRoot (Newton, secant, Brent) | root, polyroots | None (WASM has it, not exposed) | HIGH |
| **Interpolation** | Interpolation (linear, cubic, spline) | linterp, cspline | None (WASM has it, not exposed) | HIGH |
| **Curve fitting** | FindFit, LinearModelFit, NonlinearModelFit | genfit, linfit | None | HIGH |
| **Minimization** | FindMinimum, NMinimize, LinearProgramming | Minimize | None | HIGH |
| **Numerical differentiation** | ND (numerical derivative) | None | `derivative` (symbolic only) | MEDIUM |
| **Boundary value problems** | NDSolve (BVP) | None | None | LOW |
| **PDE solving** | NDSolve (PDE) | None | None | LOW |
| **Integral transforms** | LaplaceTransform, InverseLaplaceTransform | None | None | MEDIUM |
| **Z-transform** | ZTransform, InverseZTransform | None | None | LOW |

**Estimated new functions: ~30-40**

### 3. Linear Algebra (MODERATE GAP)

math.js has: `det`, `inv`, `eigs`, `lup`, `qr`, `slu`, `pinv`, `sqrtm`, `expm`, `schur`, `kron`, `cross`, `dot`, `norm`, `trace`, `transpose`

**Missing:**

| Function | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **SVD** | SingularValueDecomposition | svd, svds | None | HIGH |
| **Null space** | NullSpace | None | None | HIGH |
| **Column space** | MatrixRank (implicit) | None | None | MEDIUM |
| **Matrix rank** | MatrixRank | rank | None (WASM has it) | HIGH |
| **Condition number** | Norm + Inverse | cond | `norm` (partial) | MEDIUM |
| **Matrix exponential series** | MatrixExp, MatrixLog, MatrixPower | None | `expm` only | MEDIUM |
| **Tensor operations** | TensorProduct, TensorContract | None | None | LOW |
| **Sparse eigenvalues** | Eigenvalues (sparse) | None | None | MEDIUM |
| **Generalized eigenvalues** | Eigenvalues[{A, B}] | eigenvals | None | MEDIUM |
| **Matrix functions** | MatrixFunction | None | None | LOW |
| **Pseudoinverse** | PseudoInverse | None | `pinv` | Done |

**Estimated new functions: ~15-20**

### 4. Statistics & Probability (MODERATE GAP)

math.js has: `mean`, `median`, `std`, `variance`, `mad`, `quantileSeq`, `corr`, `sum`, `prod`, `min`, `max`, `mode`, `cumsum`, `kldivergence`

**Missing:**

| Category | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Distribution objects** | NormalDistribution, PoissonDistribution (~100 distributions) | dnorm, dpois (~20) | None (just random sampling) | HIGH |
| **PDF/CDF/InverseCDF** | PDF, CDF, InverseCDF, Quantile | dnorm, cnorm, qnorm | None | HIGH |
| **Distribution fitting** | FindDistribution, FindDistributionParameters | None | None | MEDIUM |
| **Hypothesis testing** | HypothesisTestData, TTest, ChiSquareTest | None | None | MEDIUM |
| **Confidence intervals** | MeanCI, VarianceCI | None | None | MEDIUM |
| **Regression** | LinearModelFit, NonlinearModelFit | linfit, genfit | None | HIGH |
| **Covariance matrix** | CovarianceMatrix | None | `corr` only | MEDIUM |
| **Skewness/Kurtosis** | Skewness, Kurtosis | None | None | MEDIUM |
| **Weighted statistics** | WeightedData, Mean | None | None | LOW |
| **Moving average** | MovingAverage, ExponentialMovingAverage | None | None | MEDIUM |
| **Random processes** | WienerProcess, PoissonProcess, MarkovProcess | None | None | LOW |

**Estimated new functions: ~40-60**

### 5. Number Theory (MODERATE GAP)

math.js has: `gcd`, `lcm`, `xgcd`, `invmod`, `isPrime`, `bellNumbers`, `catalan`, `stirlingS2`, `combinations`, `permutations`, `factorial`, `multinomial`

**Missing:**

| Function | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Prime functions** | Prime, PrimePi, NextPrime, PrimeQ, FactorInteger | None | `isPrime` only | HIGH |
| **Euler totient** | EulerPhi | None | None | MEDIUM |
| **Mobius function** | MoebiusMu | None | None | LOW |
| **Jacobi/Kronecker** | JacobiSymbol, KroneckerSymbol | None | None | LOW |
| **Chinese remainder** | ChineseRemainder | None | None | MEDIUM |
| **Modular exponent** | PowerMod | None | None | MEDIUM |
| **Divisor functions** | DivisorSigma, Divisors, DivisorCount | None | None | MEDIUM |
| **Partition function** | PartitionsP, IntegerPartitions | None | None | LOW |
| **Fibonacci/Lucas** | Fibonacci, LucasL | None | None | MEDIUM |
| **Binomial coefficients** | Binomial (already in combinations) | None | `combinations` | Done |

**Estimated new functions: ~15-20**

### 6. Signal Processing (SMALL GAP)

math.js has: `fft`, `ifft`, `freqz`, `zpk2tf`

**Missing:**

| Function | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Wavelet transforms** | ContinuousWaveletTransform, DiscreteWaveletTransform | None | None | MEDIUM |
| **Spectrogram** | Spectrogram, ShortTimeFourier | None | None | MEDIUM |
| **Filter design** | ButterworthFilterModel, ChebyshevFilterModel | None | None | MEDIUM |
| **Convolution** | ListConvolve, ListCorrelate | None | None (WASM has it) | HIGH |
| **Window functions** | HannWindow, HammingWindow, BlackmanWindow | None | None | MEDIUM |
| **2D FFT** | Fourier (multi-dim) | None | None (WASM has fft2d) | MEDIUM |
| **Hilbert transform** | HilbertTransform | None | None | LOW |
| **Power spectral density** | PowerSpectralDensity | None | None (WASM has it) | MEDIUM |

**Estimated new functions: ~15-20**

### 7. Calculus — Symbolic (SMALL GAP for basics, LARGE for advanced)

math.js has: `derivative`, `simplify`, `rationalize`, `resolve`, `symbolicEqual`

**Missing:**

| Function | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Symbolic integration** | Integrate | Symbolic eval | None | HIGH |
| **Limits** | Limit | None | None | HIGH |
| **Series expansion** | Series, Taylor, O[] | None | None | HIGH |
| **Partial fractions** | Apart | None | None | MEDIUM |
| **Summation** | Sum (symbolic) | None | None | MEDIUM |
| **Product** | Product (symbolic) | None | None | LOW |
| **Differential equations** | DSolve (symbolic ODE) | None | None | LOW |

**Estimated new functions: ~10-15**

### 8. Optimization (COMPLETE GAP)

math.js has: None

**Missing:**

| Function | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Linear programming** | LinearProgramming, LinearOptimization | Minimize | None | HIGH |
| **Nonlinear minimization** | FindMinimum, NMinimize | None | None | HIGH |
| **Constrained optimization** | FindMinimum with constraints | None | None | MEDIUM |
| **Least squares** | LeastSquares, FindFit | None | None | HIGH |
| **Convex optimization** | ConvexOptimization | None | None | LOW |
| **Integer programming** | LinearProgramming (integer) | None | None | LOW |

**Estimated new functions: ~8-12**

### 9. Graph Theory (COMPLETE GAP)

math.js has: None

**Missing:**

| Function | Mathematica | Mathcad | math.js | Priority |
|----------|-------------|---------|---------|----------|
| **Graph construction** | Graph, AdjacencyGraph, CompleteGraph | None | None | MEDIUM |
| **Shortest path** | FindShortestPath, GraphDistance | None | None | MEDIUM |
| **Connectivity** | ConnectedComponents, VertexConnectivity | None | None | MEDIUM |
| **Minimum spanning tree** | FindSpanningTree | None | None | LOW |
| **Graph properties** | VertexDegree, EdgeCount, GraphDiameter | None | None | LOW |
| **Matching** | FindIndependentEdgeSet | None | None | LOW |

**Estimated new functions: ~15-20**

---

## Summary — Total Gap

| Domain | math.js Has | Missing (est.) | Priority |
|--------|------------|----------------|----------|
| Special Functions | ~10 | ~60-80 | HIGH |
| Statistics & Probability | ~15 | ~40-60 | HIGH |
| Numerical Methods | ~5 | ~30-40 | HIGH |
| Linear Algebra | ~16 | ~15-20 | MEDIUM |
| Number Theory | ~12 | ~15-20 | MEDIUM |
| Signal Processing | ~4 | ~15-20 | MEDIUM |
| Symbolic Calculus | ~5 | ~10-15 | HIGH |
| Optimization | 0 | ~8-12 | HIGH |
| Graph Theory | 0 | ~15-20 | MEDIUM |
| **Total** | **~228** | **~210-290** | |

**Target: ~450-520 core mathematical functions** (roughly doubling math.js)

---

## Implementation Roadmap

### Phase 1: Foundation (HIGH priority, ~80 functions)

**Iteration A — Expose existing WASM functions (0 new algorithms)**
Wire the 110 numeric WASM exports that already exist but aren't exposed to JS:
- `interpolation`: linearInterp, cubicSpline, lagrangeInterp, etc. (21 functions)
- `rootfinding`: bisection, newton, brent, etc. (20 functions)
- `calculus`: numericalDerivative, trapezoidalRule, simpsonsRule, etc. (21 functions)

**Iteration B — Core special functions (~20 new)**
- `besselJ(n, x)`, `besselY(n, x)`, `besselI(n, x)`, `besselK(n, x)` — Bessel functions
- `beta(a, b)`, `betainc(x, a, b)` — Beta function and regularized incomplete beta
- `gammainc(a, x)`, `gammaincp(a, x)` — Incomplete gamma (lower and upper)
- `digamma(x)`, `polygamma(n, x)` — Digamma and polygamma
- `erfc(x)`, `erfi(x)` — Complementary and imaginary error functions
- `fresnelS(x)`, `fresnelC(x)` — Fresnel integrals
- `dawsonF(x)` — Dawson function

**Iteration C — Core numerical methods (~20 new)**
- `nintegrate(f, a, b)` — Adaptive numerical integration (Gauss-Kronrod)
- `findRoot(f, x0)` — Numerical root finding (Newton-Raphson with fallbacks)
- `interpolate(points, x)` — Interpolation (linear, cubic spline)
- `curvefit(model, data)` — Least squares curve fitting
- `linsolve(A, b)` — Direct linear system solver
- `svd(A)` — Singular value decomposition
- `nullspace(A)` — Null space of a matrix
- `rank(A)` — Matrix rank

**Iteration D — Core statistics (~20 new)**
- `normalDist(mu, sigma)` — Distribution object with `pdf`, `cdf`, `icdf`
- `tDist(df)`, `chiSquaredDist(df)`, `fDist(df1, df2)` — Common distributions
- `poissonDist(lambda)`, `binomialDist(n, p)` — Discrete distributions
- `skewness(data)`, `kurtosis(data)` — Shape statistics
- `covariance(x, y)` — Covariance
- `linreg(x, y)` — Linear regression with R-squared
- `movingAverage(data, window)` — Moving average

### Phase 2: Expansion (MEDIUM priority, ~80 functions)

**Iteration E — Advanced special functions (~25 new)**
- Elliptic integrals: `ellipticK(m)`, `ellipticE(m)`, `ellipticF(phi, m)`, `ellipticPi(n, m)`
- Hypergeometric: `hypergeometric2F1(a, b, c, z)`, `hypergeometricPFQ([a], [b], z)`
- Orthogonal polynomials: `legendreP(n, x)`, `chebyshevT(n, x)`, `hermiteH(n, x)`, `laguerreL(n, x)`
- Airy functions: `airyAi(x)`, `airyBi(x)`

**Iteration F — Number theory + combinatorics (~20 new)**
- `nextPrime(n)`, `prevPrime(n)`, `nthPrime(n)`, `primePi(n)` — Prime functions
- `factorInteger(n)` — Prime factorization
- `eulerPhi(n)` — Euler totient
- `fibonacci(n)`, `lucas(n)` — Fibonacci and Lucas numbers
- `partition(n)` — Integer partition count
- `divisors(n)`, `divisorCount(n)`, `divisorSum(n)` — Divisor functions
- `chineseRemainder(residues, moduli)` — Chinese remainder theorem

**Iteration G — Signal processing (~15 new)**
- `convolve(a, b)` — Discrete convolution (expose WASM)
- `correlate(a, b)` — Cross-correlation
- `spectrogram(signal, windowSize)` — Short-time Fourier
- `windowFunction(type, n)` — Hann, Hamming, Blackman, etc.
- `butterworthFilter(order, cutoff)` — Filter design
- `powerSpectralDensity(signal)` — PSD
- `waveletTransform(signal, wavelet)` — Basic wavelet support

**Iteration H — Optimization (~10 new)**
- `minimize(f, x0)` — Unconstrained minimization (Nelder-Mead)
- `minimize(f, x0, constraints)` — Constrained optimization
- `linearProgram(c, A, b)` — Linear programming (simplex)
- `leastSquares(A, b)` — Least squares solver
- `quadraticProgram(H, f, A, b)` — Quadratic programming

**Iteration I — Symbolic calculus (~10 new)**
- `integrate(expr, var)` — Symbolic integration (basic rules)
- `limit(expr, var, val)` — Symbolic limits
- `taylor(expr, var, point, order)` — Taylor series expansion
- `partialFractions(expr, var)` — Partial fraction decomposition
- `summation(expr, var, start, end)` — Symbolic summation

### Phase 3: Advanced (LOW priority, ~40 functions)

**Iteration J — Graph theory (~15 new)**
- Graph construction, shortest path, connectivity, spanning tree

**Iteration K — Advanced numerical methods (~15 new)**
- BVP solvers, PDE solvers, integral transforms, Z-transform

**Iteration L — Exotic special functions (~10 new)**
- Mathieu, spheroidal, Heun, Meijer G, Fox H functions

---

## Implementation Strategy

### Using the math.js Factory Pattern

Each new function follows the established factory pattern:

```javascript
export const createBesselJ = factory('besselJ', ['typed'], ({ typed }) => {
  return typed('besselJ', {
    'number, number': (n, x) => besselJNumber(n, x),
    'BigNumber, BigNumber': (n, x) => besselJBigNumber(n, x)
  })
})
```

### WASM Acceleration

For compute-intensive functions (Bessel, hypergeometric, optimization), implement in Rust WASM first, then wire the JS bridge:

1. Add to `src/wasm-rust/crates/mathjs-wasm/src/special/` (or new category)
2. Add export to `WasmModule` interface
3. Add threshold-based WASM bridge in the JS factory function
4. JS fallback for small inputs / non-number types

### Rust Crate Leverage

| Domain | Rust Crate | Already in wasm-rust? |
|--------|-----------|----------------------|
| Special functions | `statrs` | Yes |
| Linear algebra | `faer` | Yes |
| FFT/signal | `rustfft` | Yes |
| Optimization | `argmin` | No — add |
| Graph theory | `petgraph` | No — add |

### Estimated Effort

| Phase | Functions | Est. Weeks | WASM Benefit |
|-------|----------|------------|-------------|
| Phase 1 (Foundation) | ~80 | 6-8 | HIGH (expose existing WASM) |
| Phase 2 (Expansion) | ~80 | 8-12 | MEDIUM (new Rust implementations) |
| Phase 3 (Advanced) | ~40 | 6-8 | LOW (exotic, niche use cases) |
| **Total** | **~200** | **20-28 weeks** | |

---

## Key Metrics

| Metric | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|--------|---------|--------------|--------------|--------------|
| Core functions | 228 | ~310 | ~390 | ~430 |
| Special functions | ~10 | ~30 | ~55 | ~65 |
| vs Mathcad coverage | ~55% | ~75% | ~90% | ~95% |
| vs Mathematica core | ~15% | ~20% | ~25% | ~30% |

Note: 100% Mathematica coverage is neither realistic nor desirable — many Mathematica functions are for its notebook UI, graphics, and Wolfram Language features that don't apply to a JavaScript math library. The target is covering the **mathematical core** that engineers and scientists actually use.

---

## References

Sources:
- [Wolfram Mathematical Functions Guide](https://reference.wolfram.com/language/guide/MathematicalFunctions.html)
- [Wolfram Special Functions](https://reference.wolfram.com/language/guide/SpecialFunctions.html)
- [Wolfram Number Theory](https://reference.wolfram.com/language/guide/NumberTheory.html)
- [Wolfram Signal Processing](https://reference.wolfram.com/language/guide/SignalProcessing.html)
- [Wolfram Probability & Statistics](https://reference.wolfram.com/language/guide/ProbabilityAndStatistics.html)
- [Wolfram Linear Algebra](https://reference.wolfram.com/language/tutorial/LinearAlgebra.html)
- [The Mathematical Functions Site](https://functions.wolfram.com/)
- [PTC Mathcad Built-In Functions](https://support.ptc.com/help/mathcad/r8.0/en/PTC_Mathcad_Help/about_built-in_functions.html)
- [PTC Mathcad Prime Features](https://www.mathcad.com/en/capabilities)
