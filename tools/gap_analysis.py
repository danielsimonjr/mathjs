import sys, json, re
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\danie\.claude\skills\rlm\scripts")))
from rlm_query import llm_query, llm_query_fast

# Current math.js function inventory
mathjs_functions = """
ALGEBRA (11): derivative, leafCount, lyap, polynomialRoot, rationalize, resolve, simplify, simplifyConstant, simplifyCore, sylvester, symbolicEqual
ARITHMETIC (39): abs, add, addScalar, cbrt, ceil, cube, divide, divideScalar, dotDivide, dotMultiply, dotPow, exp, expm1, fix, floor, gcd, hypot, invmod, lcm, log, log10, log1p, log2, mod, multiply, multiplyScalar, norm, nthRoot, nthRoots, pow, round, sign, sqrt, square, subtract, subtractScalar, unaryMinus, unaryPlus, xgcd
BITWISE (8): bitAnd, bitNot, bitOr, bitXor, leftShift, rightArithShift, rightLogShift
COMBINATORICS (4): bellNumbers, catalan, composition, stirlingS2
COMPLEX (4): arg, conj, im, re
DECOMPOSITION (4): lup, qr, schur, slu
GEOMETRY (2): distance, intersect
LOGICAL (5): and, not, nullish, or, xor
MATRIX (46): column, concat, count, cross, ctranspose, det, diag, diff, dot, eigs, expm, fft, filter, flatten, forEach, getMatrixDataType, identity, ifft, inv, kron, map, mapSlices, matrixFromColumns, matrixFromFunction, matrixFromRows, matrixLog, matrixRank, nullSpace, ones, partitionSelect, pinv, range, reshape, resize, rotate, rotationMatrix, row, size, sort, sqrtm, squeeze, subset, svd, trace, transpose, zeros
NUMERIC (11): cond, curvefit, findRoot, interpolate, linsolve, nintegrate, nullspace, rank, simpsons, solveODE, trapz
PROBABILITY (12): bernoulli, combinations, combinationsWithRep, factorial, gamma, kldivergence, lgamma, multinomial, permutations, pickRandom, random, randomInt
RELATIONAL (13): compare, compareNatural, compareText, compareUnits, deepEqual, equal, equalScalar, equalText, larger, largerEq, smaller, smallerEq, unequal
SET (10): setCartesian, setDifference, setDistinct, setIntersect, setIsSubset, setMultiplicity, setPowerset, setSize, setSymDifference, setUnion
SIGNAL (2): freqz, zpk2tf
SOLVER (5): lsolve, lsolveAll, lusolve, usolve, usolveAll
SPECIAL (14): besselI, besselJ, besselK, besselY, beta, betainc, digamma, erf, erfc, erfi, fresnelS, gammainc, gammaincp, zeta
STATISTICS (23): binomialDist, chiSquaredDist, corr, covariance, cumsum, kurtosis, linreg, mad, max, mean, median, min, mode, movingAverage, normalDist, poissonDist, prod, quantileSeq, skewness, std, sum, tDist, variance
STRING (5): bin, format, hex, oct, print
TRIGONOMETRY (26): acos, acosh, acot, acoth, acsc, acsch, asec, asech, asin, asinh, atan, atan2, atanh, cos, cosh, cot, coth, csc, csch, sec, sech, sin, sinh, tan, tanh
UNIT (2): to, toBest
UTILS (15): clone, hasNumericValue, isBounded, isFinite, isInteger, isNaN, isNegative, isNumeric, isPositive, isPrime, isZero, numeric, typeOf
"""

domains = [
    (
        "Number Theory & Integer Functions",
        "Mathematica: PrimeQ, NextPrime, PrimePi, FactorInteger, EulerPhi, MoebiusMu, DivisorSigma, Divisors, ChineseRemainder, JacobiSymbol, PrimitiveRoot, CarmichaelLambda, Fibonacci, LucasL, BernoulliB, HarmonicNumber, PartitionsP. Mathcad: isprime, Fibonacci, gcd, lcm.",
    ),
    (
        "Special Functions (Extended)",
        "Mathematica: AiryAi, AiryBi, SphericalBesselJ, SphericalBesselY, HankelH1, HankelH2, StruveH, EllipticK, EllipticE, EllipticF, EllipticPi, LegendreP, LegendreQ, ChebyshevT, ChebyshevU, HermiteH, LaguerreL, Hypergeometric2F1, PolyLog, ProductLog(LambertW), FresnelC, ExpIntegralEi, SinIntegral, CosIntegral, LogIntegral. Mathcad: Ai, Bi, Ei, Si, Ci, ellipticK, ellipticE, LambertW.",
    ),
    (
        "Optimization & Fitting",
        "Mathematica: FindMinimum, NMinimize, LinearProgramming, FindFit, NonlinearModelFit. Mathcad: Minimize, Maximize, Find, Minerr, genfit, loess.",
    ),
    (
        "Signal Processing (Extended)",
        "Mathematica: FourierDCT, FourierDST, Convolve, Correlate, Spectrogram, Periodogram, PowerSpectralDensity, WindowFunction(Hamming,Hanning,Blackman,Kaiser), LowpassFilter, HighpassFilter, BandpassFilter. Mathcad: cfft, icfft, corr, ccorr, Blackman, Hamming, Hanning, Kaiser.",
    ),
    (
        "Symbolic Calculus & Polynomials",
        "Mathematica: Integrate(symbolic), Limit, Series, Taylor, Residue, Sum(symbolic), Product(symbolic), Apart, Together, Collect, Expand, Factor, PolynomialRemainder, PolynomialQuotient, PolynomialGCD, CoefficientList. Mathcad: symbolic integrate, limits, Taylor, Laplace/inverseLaplace.",
    ),
    (
        "Interpolation & Approximation",
        "Mathematica: BSplineFunction, BezierFunction, PadeApproximant, Fit, LinearModelFit. Mathcad: cspline, pspline, bspline, interp, expfit, sinfit, pwrfit, logfit, lnfit.",
    ),
    (
        "Graph Theory",
        "Mathematica: Graph, AdjacencyMatrix, ShortestPath, GraphDistance, ConnectedComponents, FindSpanningTree, MinimumSpanningTree, TopologicalSort, StronglyConnectedComponents, PageRankCentrality, BetweennessCentrality.",
    ),
    (
        "Geometry & Transforms",
        "Mathematica: Area, Volume, ArcLength, ConvexHull, CoordinateTransform(Cartesian/Polar/Spherical/Cylindrical), EuclideanDistance, ManhattanDistance. Mathcad: basic vector ops.",
    ),
    (
        "Differential Equations",
        "Mathematica: DSolve, NDSolve, ParametricNDSolve, method control (RungeKutta, Adams, BDF, stiffness). Mathcad: odesolve, Rkadapt, rkfixed, Bulstoer, stiffb, Radau, Adams.",
    ),
    (
        "Statistics (Extended)",
        "Mathematica: HypothesisTest(StudentTTest, ChiSquareTest, KolmogorovSmirnovTest, FTest), ANOVA, LogisticRegression, PrincipalComponents, FindClusters. Mathcad: FDist, WeibullDist, ExponentialDist, UniformDist, GammaDist, BetaDist, LogNormalDist, hist.",
    ),
]

prompt_template = """Given math.js's current functions:
{mathjs}

Reference functions from Mathematica/Mathcad for "{domain}":
{refs}

List the TOP 8 most impactful MISSING functions math.js should add. For each give:
- name (camelCase, math.js style)
- desc (one line)
- priority: HIGH/MEDIUM/LOW
- complexity: SIMPLE/MODERATE/COMPLEX

ONLY functions NOT in math.js. Return JSON array: [{{"name":"x","desc":"y","priority":"HIGH","complexity":"SIMPLE"}}]
JSON array only, no markdown fences:"""

all_results = []
for domain_name, refs in domains:
    prompt = prompt_template.format(
        mathjs=mathjs_functions, domain=domain_name, refs=refs
    )
    result = llm_query_fast(prompt, max_tokens=2000)
    print(f"OK {domain_name}")
    all_results.append({"domain": domain_name, "raw": result})

# Parse and aggregate
all_functions = []
for item in all_results:
    try:
        # Extract JSON from response
        raw = item["raw"].strip()
        # Find JSON array
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start >= 0 and end > start:
            funcs = json.loads(raw[start:end])
            for f in funcs:
                f["domain"] = item["domain"]
            all_functions.extend(funcs)
    except Exception as e:
        print(f"Parse error for {item['domain']}: {e}")
        print(f"Raw: {item['raw'][:200]}")

# Save
Path("/tmp/mathjs_gaps.json").write_text(
    json.dumps(all_functions, indent=2), encoding="utf-8"
)

# Print summary
print(f"\nTotal gap functions identified: {len(all_functions)}")
high = [f for f in all_functions if f.get("priority") == "HIGH"]
med = [f for f in all_functions if f.get("priority") == "MEDIUM"]
low = [f for f in all_functions if f.get("priority") == "LOW"]
print(f"HIGH: {len(high)}, MEDIUM: {len(med)}, LOW: {len(low)}")

print("\n=== HIGH PRIORITY GAPS ===")
for f in high:
    print(f"  {f['name']:25s} [{f.get('complexity', '?'):8s}] {f['desc']}")

print("\n=== MEDIUM PRIORITY GAPS ===")
for f in med:
    print(f"  {f['name']:25s} [{f.get('complexity', '?'):8s}] {f['desc']}")

print("\n=== LOW PRIORITY GAPS ===")
for f in low:
    print(f"  {f['name']:25s} [{f.get('complexity', '?'):8s}] {f['desc']}")
