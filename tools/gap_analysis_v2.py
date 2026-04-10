"""RLM gap analysis v2: Compare current math.js (post-expansion) against Mathematica/Mathcad/MATLAB/scipy."""

import sys, json, re
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\danie\.claude\skills\rlm\scripts")))
from rlm_query import llm_query, llm_query_fast

mathjs_inventory = """CURRENT MATH.JS INVENTORY (406 factory exports, 359 function files):

ALGEBRA (18): apart, coefficientList, derivative, expand, leafCount, lyap, polyadd, polyder, polymul, polynomialRoot, polyval, rationalize, resolve, simplify, simplifyConstant, simplifyCore, sylvester, symbolicEqual
ARITHMETIC (39): abs, add, cbrt, ceil, cube, divide, dotDivide, dotMultiply, dotPow, exp, expm1, fix, floor, gcd, hypot, invmod, lcm, log, log10, log1p, log2, mod, multiply, norm, nthRoot, nthRoots, pow, round, sign, sqrt, square, subtract, unaryMinus, unaryPlus, xgcd
COMBINATORICS (14): bellNumbers, catalan, chineseRemainder, composition, divisors, eulerPhi, fibonacci, harmonicNumber, lucasL, moebiusMu, nextPrime, partitions, primeFactors, stirlingS2
GEOMETRY (8): area, chebyshevDistance, convexHull, coordinateTransform, distance, intersect, manhattanDistance, minkowskiDistance
GRAPH (8): adjacencyMatrix, connectedComponents, graphDistance, isConnected, minimumSpanningTree, shortestPath, stronglyConnectedComponents, topologicalSort
MATRIX (46): column, concat, count, cross, ctranspose, det, diag, diff, dot, eigs, expm, fft, filter, flatten, forEach, identity, ifft, inv, kron, map, mapSlices, matrixFromColumns, matrixFromFunction, matrixFromRows, matrixLog, matrixRank, nullSpace, ones, partitionSelect, pinv, range, reshape, resize, rotate, rotationMatrix, row, size, sort, sqrtm, squeeze, subset, svd, trace, transpose, zeros
NUMERIC (21): bezierCurve, cond, cspline, curvefit, expfit, findRoot, gradient, hessian, interpolate, linsolve, loess, logfit, nintegrate, nullspace, polyfit, powerfit, rank, residue, simpsons, solveODE, trapz
PROBABILITY (12): bernoulli, combinations, combinationsWithRep, factorial, gamma, kldivergence, lgamma, multinomial, permutations, pickRandom, random, randomInt
SET (10): setCartesian, setDifference, setDistinct, setIntersect, setIsSubset, setMultiplicity, setPowerset, setSize, setSymDifference, setUnion
SIGNAL (10): bandpassFilter, convolve, correlate, fourier, freqz, highpassFilter, invFourier, lowpassFilter, windowFunction, zpk2tf
SOLVER (5): lsolve, lsolveAll, lusolve, usolve, usolveAll
SPECIAL (26): besselI, besselJ, besselK, besselY, beta, betainc, chebyshevT, cosIntegral, digamma, ellipticE, ellipticK, erf, erfc, erfi, expIntegralEi, fresnelC, fresnelS, gammainc, gammaincp, hermiteH, laguerreL, lambertW, legendreP, logIntegral, sinIntegral, zeta
STATISTICS (32): betaDist, binomialDist, chiSquaredDist, corr, covariance, cumsum, exponentialDist, fDist, gammaDist, histogram, kurtosis, linreg, logNormalDist, mad, max, mean, median, min, mode, movingAverage, normalDist, poissonDist, prod, quantileSeq, skewness, std, studentTTest, sum, tDist, uniformDist, variance, weibullDist
TRIGONOMETRY (26): acos, acosh, acot, acoth, acsc, acsch, asec, asech, asin, asinh, atan, atan2, atanh, cos, cosh, cot, coth, csc, csch, sec, sech, sin, sinh, tan, tanh
"""

domains = [
    (
        "Symbolic CAS & Calculus",
        "Mathematica: Integrate (symbolic), D (partial), Limit, Series, Taylor, Sum (symbolic), Product (symbolic), Factor, Together, Cancel, Collect, Apart (HAVE), Expand (HAVE), CoefficientList (HAVE), PolynomialRemainder, PolynomialQuotient, PolynomialGCD, GroebnerBasis, Reduce, Solve (symbolic), DSolve, Laplace, InverseLaplace, FourierTransform (symbolic), Residue (symbolic). MATLAB: int, diff, limit, taylor, factor, solve, dsolve, laplace, ilaplace. scipy: none (numeric only).",
    ),
    (
        "Optimization & Minimization",
        "Mathematica: FindMinimum, FindMaximum, NMinimize, NMaximize, FindArgMin, FindArgMax, LinearProgramming, FindFit (HAVE curvefit), Minimize (symbolic), Maximize (symbolic), FindRoot (HAVE), RegionMinimize. MATLAB: fminunc, fmincon, fminsearch, linprog, quadprog, fsolve, lsqcurvefit (HAVE curvefit), lsqnonlin, optimoptions. scipy: minimize, minimize_scalar, linprog, curve_fit (HAVE), root (HAVE findRoot), least_squares, differential_evolution, dual_annealing, basinhopping.",
    ),
    (
        "Differential Equations (Extended)",
        "Mathematica: DSolve, NDSolve (multi-method), ParametricNDSolve, WhenEvent, DEigensystem, AsymptoticDSolveValue, BoundaryMeshRegion. MATLAB: ode45, ode23, ode113, ode15s, ode23s, ode23t, ode23tb, bvp4c, pdepe, deval. scipy: solve_ivp (RK45, RK23, DOP853, Radau, BDF, LSODA), odeint, solve_bvp. Math.js has: solveODE.",
    ),
    (
        "Advanced Linear Algebra",
        "Mathematica: Eigenvalues, Eigenvectors (HAVE eigs), SingularValueDecomposition (HAVE svd), MatrixRank (HAVE), NullSpace (HAVE), RowReduce, MatrixExp (HAVE expm), MatrixLog (HAVE), MatrixPower, JordanDecomposition, CharacteristicPolynomial, MinimalPolynomial, PseudoInverse (HAVE pinv), KroneckerProduct (HAVE kron), MatrixFunction, LyapunovSolve (HAVE lyap), SylvesterSolve (HAVE sylvester). MATLAB: chol, ldl, ilu, qz, hess, balance, ordschur, cdf2rdf, gsvd, cholupdate. scipy: cho_factor, ldl, qz, hessenberg, polar, matrix_power, funm.",
    ),
    (
        "Statistics: Hypothesis Testing & ML",
        "Mathematica: HypothesisTest (StudentTTest HAVE, ChiSquareTest, KolmogorovSmirnovTest, FTest, MannWhitneyTest, WilcoxonTest, AndersonDarlingTest, ShapiroWilkTest), ANOVA, LinearModelFit (HAVE linreg), LogisticModelFit, PrincipalComponents, SingularValueDecomposition, ClusteringComponents, FindClusters, Classify, NearestFunction, CrossValidation. MATLAB: ttest (HAVE), ttest2, chi2test, kstest, anova1, anova2, fitlm, fitglm, pca, kmeans, fitcsvm. scipy: ttest_ind (HAVE), chi2_contingency, kstest, f_oneway, mannwhitneyu, wilcoxon, shapiro, normaltest, pearsonr (HAVE corr), spearmanr, kendalltau.",
    ),
    (
        "Signal Processing (Advanced)",
        "Mathematica: FourierDCT, FourierDST, WaveletTransform, ContinuousWaveletTransform, GaborFilter, WienerFilter, MeanFilter, MedianFilter, GaussianFilter, BilateralFilter, TotalVariationFilter, Spectrogram, Periodogram, PowerSpectralDensity, TransferFunctionModel, BodePlot, NyquistPlot. MATLAB: dct, dst, cwt, dwt, idwt, spectrogram, periodogram, pwelch, butter, cheby1, ellip, fir1, filtfilt, resample, decimate, upsample. scipy: cwt, morlet, spectrogram, periodogram, welch, firwin, iirfilter, sosfilt, resample, decimate, medfilt, wiener.",
    ),
    (
        "Interpolation & Approximation (Advanced)",
        "Mathematica: BSplineFunction, BSplineBasis, InterpolatingPolynomial (HAVE interpolate), PadeApproximant, MiniMaxApproximation, Fit (HAVE polyfit/curvefit), FindFormula, Rationalize, ChebyshevT (HAVE). MATLAB: spline (HAVE cspline), pchip, ppval, mkpp, interp1 (HAVE interpolate), interp2, interp3, griddedInterpolant, scatteredInterpolant, ndgrid, meshgrid. scipy: BSpline, make_interp_spline, PchipInterpolator, Akima1DInterpolator, RBFInterpolator, griddata, RegularGridInterpolator.",
    ),
    (
        "Number Theory (Advanced)",
        "Mathematica: PrimePi, Prime, PrimeQ (HAVE isPrime), FactorInteger (HAVE primeFactors), EulerPhi (HAVE), MoebiusMu (HAVE), DivisorSigma, Divisors (HAVE), ChineseRemainder (HAVE), JacobiSymbol, KroneckerSymbol, PrimitiveRoot, MultiplicativeOrder, CarmichaelLambda, Totient (HAVE eulerPhi), DigitCount, IntegerDigits, FromDigits, Fibonacci (HAVE), LucasL (HAVE), BernoulliB (HAVE bernoulli), EulerE, HarmonicNumber (HAVE), PartitionsP (HAVE), PartitionsQ, StirlingS1, StirlingS2 (HAVE), BellB (HAVE bellNumbers), CatalanNumber (HAVE catalan). MATLAB: isprime, primes, factor, gcd (HAVE), lcm (HAVE), nchoosek (HAVE combinations).",
    ),
    (
        "Geometry & Computational Geometry (Advanced)",
        "Mathematica: ConvexHullMesh (HAVE convexHull), VoronoiMesh, DelaunayMesh, NearestMeshCells, RegionMeasure (HAVE area), ArcLength, Volume, Perimeter, BoundingRegion, RegionCentroid, RegionDistance, RegionNearest, TriangulateMesh, BooleanRegion. MATLAB: convhull (HAVE), delaunay, voronoi, inpolygon, polyarea (HAVE area), boundary, alphaShape. scipy: ConvexHull (HAVE), Delaunay, Voronoi, distance.cdist, distance.pdist, KDTree.",
    ),
    (
        "Transforms & Integral Transforms",
        "Mathematica: FourierTransform (symbolic), InverseFourierTransform, LaplaceTransform, InverseLaplaceTransform, ZTransform, InverseZTransform, HilbertTransform, MellinTransform, HankelTransform, AbelTransform. MATLAB: fft (HAVE), ifft (HAVE), fft2, ifft2, fftn, dct, dst, hilbert, laplace, ilaplace, ztrans, iztrans. scipy: fft (HAVE), ifft (HAVE), fft2, ifft2, fftn, dct, dst, hilbert.",
    ),
]

prompt_template = """Given math.js's current inventory (406 exports):
{mathjs}

Reference functions from Mathematica/MATLAB/scipy for "{domain}":
{refs}

List the TOP 6 most impactful MISSING functions math.js should add. For each:
- name (camelCase)
- desc (one line)
- priority: HIGH/MEDIUM/LOW
- complexity: SIMPLE/MODERATE/COMPLEX

ONLY functions NOT already in math.js. Return JSON array only, no markdown:"""

all_results = []
for domain_name, refs in domains:
    prompt = prompt_template.format(
        mathjs=mathjs_inventory, domain=domain_name, refs=refs
    )
    result = llm_query_fast(prompt, max_tokens=1500)
    print(f"OK {domain_name}")
    all_results.append({"domain": domain_name, "raw": result})

# Parse
all_functions = []
for item in all_results:
    try:
        raw = item["raw"].strip()
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start >= 0 and end > start:
            funcs = json.loads(raw[start:end])
            for f in funcs:
                f["domain"] = item["domain"]
            all_functions.extend(funcs)
    except Exception as e:
        print(f"Parse error for {item['domain']}: {e}")

# Deduplicate
seen = set()
unique = []
for f in all_functions:
    name = f["name"]
    if name not in seen:
        seen.add(name)
        unique.append(f)

print(f"\nTotal unique gaps: {len(unique)}")
high = [f for f in unique if f.get("priority") == "HIGH"]
med = [f for f in unique if f.get("priority") == "MEDIUM"]
low = [f for f in unique if f.get("priority") == "LOW"]
print(f"HIGH: {len(high)}, MEDIUM: {len(med)}, LOW: {len(low)}")

# Group by complexity
simple = [f for f in unique if f.get("complexity") == "SIMPLE"]
moderate = [f for f in unique if f.get("complexity") == "MODERATE"]
complex_ = [f for f in unique if f.get("complexity") == "COMPLEX"]
print(f"SIMPLE: {len(simple)}, MODERATE: {len(moderate)}, COMPLEX: {len(complex_)}")

# Print by domain
for domain_name, _ in domains:
    funcs = [f for f in unique if f.get("domain") == domain_name]
    if funcs:
        print(f"\n## {domain_name} ({len(funcs)})")
        for f in funcs:
            pri = f.get("priority", "?")
            cpx = f.get("complexity", "?")
            print(f"  [{pri:6s}/{cpx:8s}] {f['name']:30s} {f['desc']}")

Path("C:/tmp/mathjs_gaps_v2.json").write_text(
    json.dumps(unique, indent=2), encoding="utf-8"
)
