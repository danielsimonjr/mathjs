# Phase 2: Function Expansion — 47 Functions (Hybrid Strategy)

**Date:** 2026-04-03
**Status:** In Progress
**Depends on:** Phase 1 (36 functions, complete, 7087 tests passing)

## Goal

Add 47 SIMPLE+MODERATE functions across 8 domains, bringing math.js from ~264 to ~311 core functions. Defer 29 COMPLEX functions to Phase 3.

## Team Structure

Each domain gets a **CS Engineer** (Sonnet agent) that implements functions + tests. After all 8 domains complete, three cross-cutting review passes:

1. **Test Engineer** (Opus) — verifies test coverage, edge cases, mathematical correctness
2. **QA & Security Engineer** (Opus) — checks input validation, error handling, no injection vectors
3. **Optimization Engineer** (Opus) — reviews algorithmic efficiency, identifies O(n^2) where O(n log n) exists

## Agent Assignments

### A1: Number Theory (5 functions)
- `fibonacci(n)` — nth Fibonacci number via matrix exponentiation O(log n)
- `primeFactors(n)` — trial division + Pollard's rho for large n
- `nextPrime(n)` — Miller-Rabin probabilistic primality
- `divisors(n)` — all divisors from prime factorization
- `eulerPhi(n)` — Euler's totient from prime factorization

### A2: Special Functions (5 functions)
- `lambertW(x)` — Halley's iteration, W0 branch (x >= -1/e)
- `ellipticK(m)` — complete elliptic integral K(m), arithmetic-geometric mean
- `ellipticE(m)` — complete elliptic integral E(m), AGM variant
- `expIntegralEi(x)` — exponential integral, series + continued fraction
- `legendreP(n, x)` — Legendre polynomial via Bonnet recurrence

### A3: Signal Processing (6 functions)
- `convolve(a, b)` — discrete linear convolution
- `correlate(a, b)` — cross-correlation via convolution
- `windowFunction(n, type)` — Hamming, Hanning, Blackman, Kaiser windows
- `lowpassFilter(signal, cutoff, sampleRate)` — Butterworth IIR
- `highpassFilter(signal, cutoff, sampleRate)` — Butterworth IIR
- `bandpassFilter(signal, low, high, sampleRate)` — Butterworth IIR

### A4: Graph Theory (6 functions)
- `adjacencyMatrix(edges, n)` — edge list to matrix
- `shortestPath(graph, start, end)` — Dijkstra's algorithm
- `connectedComponents(graph)` — BFS/DFS component labeling
- `minimumSpanningTree(graph)` — Kruskal's with union-find
- `topologicalSort(graph)` — Kahn's algorithm
- `stronglyConnectedComponents(graph)` — Tarjan's algorithm

### A5: Geometry (6 functions)
- `manhattanDistance(a, b)` — L1 distance
- `chebyshevDistance(a, b)` — L-infinity distance
- `minkowskiDistance(a, b, p)` — Lp distance
- `area(vertices)` — shoelace formula for polygons
- `convexHull(points)` — Graham scan or Andrew's monotone chain
- `coordinateTransform(point, from, to)` — cartesian/polar/spherical/cylindrical

### A6: Interpolation & Fitting (6 functions)
- `polyfit(x, y, degree)` — Vandermonde least squares
- `cspline(x, y)` — natural cubic spline returning evaluator
- `bezierCurve(controlPoints, t)` — De Casteljau's algorithm
- `expfit(x, y)` — fit y = a*exp(b*x) via log-linear regression
- `powerfit(x, y)` — fit y = a*x^b via log-log regression
- `logfit(x, y)` — fit y = a + b*ln(x) via substitution

### A7: Statistics + Symbolic (7 functions)
- `exponentialDist(lambda)` — pdf, cdf, icdf for exponential distribution
- `weibullDist(k, lambda)` — pdf, cdf for Weibull distribution
- `histogram(data, bins)` — frequency counts and bin edges
- `studentTTest(sample1, sample2)` — two-sample t-test with p-value
- `coefficientList(expr, var)` — extract polynomial coefficients from expression
- `expand(expr)` — expand products/powers in algebraic expression
- `apart(expr, var)` — partial fraction decomposition

### A8: Optimization + Transforms (6 functions)
- `gradient(f, x)` — numerical gradient via central differences
- `hessian(f, x)` — numerical Hessian matrix
- `loess(x, y, span)` — locally weighted regression
- `fourier(signal)` — continuous Fourier transform (numeric, wraps fft)
- `invFourier(spectrum)` — inverse Fourier transform (wraps ifft)
- `residue(num, den)` — partial fraction residues of rational function

## File Pattern (same as Phase 1)

Per function: implementation `.js`, embedded docs `.js`, test `.test.js`.
Registration: `src/factoriesAny.js` + `src/expression/embeddedDocs/embeddedDocs.js` (done centrally after agents complete).

## Review Gates

1. All 8 CS Engineers complete -> run `npm run test:src` (must be 0 regressions)
2. Test Engineer reviews all 47 test files for coverage gaps
3. QA/Security Engineer scans implementations for input validation
4. Optimization Engineer reviews algorithmic complexity
5. Fix any issues found -> final `npm run test:src` -> commit

## Phase 3 (Deferred — 29 COMPLEX functions)

Symbolic CAS: integrate, limit, series, factor, dsolve
Optimization: minimize, maximize, linearProgram, constrainedOptimize
Advanced stats: anova, logisticRegression, PCA
Exotic special: airyAi, airyBi, hankelH1, padeApproximant, bspline
Other: arcLength, volume, ndsolve, invLaplace, spectrogram, powerSpectralDensity, pageRank, betweennessCentrality
