"""RLM gap analysis: math.js CAS vs Mathematica vs Maple symbolic functions."""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(r"C:\Users\danie\.claude\skills\rlm\scripts")))
from rlm_query import llm_query_fast

# Current math.js symbolic CAS inventory (46 algebra functions)
mathjs_cas = """CURRENT MATH.JS SYMBOLIC CAS (46 algebra functions):

apart, cancel, coefficientList, collect, curl, derivative, divergence,
expand, factor, fourierSeries, gradientSymbolic, implicitDiff, integrate,
inverseLaplace, inverseLaplaceTransform, jacobian, laplace, leafCount,
limit, lyap, odeGeneral, partialDerivative, polyadd, polyder, polymul,
polynomialGCD, polynomialQuotient, polynomialRemainder, polynomialRoot,
polyval, rationalize, resolve, series, simplify, simplifyConstant,
simplifyCore, solve, substitute, summation, sylvester, symbolicEqual,
symbolicProduct, tangentLine, taylor, together, zTransform

RELATED NUMERIC: findRoot, nintegrate, solveODE, solveODESystem, solveBVP,
gradient, hessian, bezierCurve, curvefit, interpolate, trapz, simpsons

TRANSFORMS (signal/): fourier, invFourier, fft, ifft, fft2d, dct, dst,
hilbertTransform
"""

# Domain-by-domain reference of Mathematica + Maple CAS functions
domains = [
    (
        "Symbolic Simplification & Transformation",
        "Mathematica: Simplify (HAVE), FullSimplify, ComplexExpand, PowerExpand, TrigExpand, TrigReduce, TrigFactor, TrigToExp, ExpToTrig, Refine, Assuming, Assumptions, FunctionExpand, PiecewiseExpand, Together (HAVE), Apart (HAVE), Cancel (HAVE), Collect (HAVE), Expand (HAVE), Factor (HAVE). "
        "Maple: simplify (HAVE), normal, combine, expand (HAVE), factor (HAVE), collect (HAVE), convert, radnormal, rationalize (HAVE), content, primpart, sort, indets, op, subs (HAVE substitute), eval, evalf, identify.",
    ),
    (
        "Symbolic Equation Solving",
        "Mathematica: Solve (HAVE), NSolve, Reduce, Eliminate, FindInstance, Resolve (HAVE), SolveAlways, DSolve, NDSolve, RSolve (recurrences), FindRoot (HAVE), LinearSolve, GroebnerBasis, PolynomialReduce, Roots. "
        "Maple: solve (HAVE), fsolve, RootOf, allvalues, dsolve, rsolve, isolve (integer solve), msolve (modular), PolynomialSystems, Groebner:-Basis, LinearAlgebra:-LinearSolve, eliminate, identify.",
    ),
    (
        "Differential Calculus (Symbolic)",
        "Mathematica: D (HAVE derivative), Dt (total derivative), Derivative, Grad (HAVE gradientSymbolic), Div (HAVE divergence), Curl (HAVE curl), Laplacian, Hessian, Jacobian (HAVE), ImplicitD (HAVE implicitDiff), VectorCalculus package. "
        "Maple: diff (HAVE), Diff (inert), D (operator), Physics:-d_, VectorCalculus:-Gradient, Divergence, Curl, Hessian, Jacobian, Laplacian, implicitdiff (HAVE), DEtools, PDEtools.",
    ),
    (
        "Integral Calculus (Symbolic)",
        "Mathematica: Integrate (HAVE), NIntegrate (HAVE nintegrate), Limit (HAVE), Series (HAVE), Asymptotic, ResourceFunction['AsymptoticEquivalent'], Residue, PrincipalValue, GeneratingFunction, InverseZTransform, Convolve, FourierTransform, InverseFourierTransform, MellinTransform. "
        "Maple: int (HAVE integrate), Int (inert), limit (HAVE), series (HAVE), taylor (HAVE), mtaylor (multivariate Taylor), asympt, residue, convert/FormalPowerSeries, inttrans package (fourier, laplace (HAVE), invlaplace (HAVE), mellin, hilbert, hankel).",
    ),
    (
        "Differential Equations (Symbolic)",
        "Mathematica: DSolve, DSolveValue, AsymptoticDSolveValue, NDSolve (HAVE solveODE), DEigensystem, GreenFunction, BoundaryValueProblem, WhenEvent. "
        "Maple: dsolve (HAVE odeGeneral for some), DEtools package: odeadvisor, convertAlg, buildsol, DEplot, phaseportrait, diff_table, PDEtools package: pdsolve, casesplit, build.",
    ),
    (
        "Polynomial Algebra & Number Theory",
        "Mathematica: PolynomialGCD (HAVE), PolynomialLCM, PolynomialMod, PolynomialQuotient (HAVE), PolynomialRemainder (HAVE), PolynomialExpressionQ, Resultant, Discriminant, SubresultantPolynomials, CoefficientRules, MonomialList, Variables, FromCoefficientRules, InterpolatingPolynomial, RootReduce. "
        "Maple: gcd, lcm, Content, primpart, Resultant, Discrim, CoefficientRing, degree, lcoeff, tcoeff, indets, coeffs, PolynomialTools:-Split, Hurwitz, Minimize, Interpolate.",
    ),
    (
        "Series, Sums, Products, Limits",
        "Mathematica: Sum (HAVE summation), Product (HAVE symbolicProduct), Limit (HAVE), Series (HAVE), SeriesCoefficient, Normal, Asymptotic, O, HoldForm, Dt, Accumulate, Differences, Fold. "
        "Maple: sum, Sum (inert), product, Product (inert), limit (HAVE), series (HAVE), mtaylor, asympt, Order, convert/FormalPowerSeries, convert/sum, SumTools, SumTools:-Hypergeometric:-Gosper, Wilf-Zeilberger.",
    ),
    (
        "Integral Transforms (Symbolic)",
        "Mathematica: LaplaceTransform (HAVE laplace), InverseLaplaceTransform (HAVE), FourierTransform, InverseFourierTransform, ZTransform (HAVE), InverseZTransform, MellinTransform, HankelTransform, RadonTransform. "
        "Maple: inttrans package: laplace (HAVE), invlaplace (HAVE), fourier, invfourier, mellin, invmellin, hilbert, hankel, ztrans (HAVE zTransform), invztrans, fouriersin, fouriercos, addtable.",
    ),
    (
        "Assumptions, Piecewise, Symbolic Logic",
        "Mathematica: Assuming, Assumptions, Element, NotElement, Positive, Negative, Integer, Real, Rational, Complex, ForAll, Exists, Implies, And, Or, Not, BooleanTable, BooleanMinimize, Reduce, Resolve. "
        "Maple: assume, additionally, is, coulditbe, about, type, piecewise, `if`, Logic package, quantifier-free solutions.",
    ),
    (
        "Special Functions & Manipulation",
        "Mathematica: FunctionExpand, FullForm, MinimalPolynomial, RootReduce, ToRadicals, ContinuedFraction, FromContinuedFraction, Rationalize (HAVE rationalize), FunctionDomain, FunctionRange. "
        "Maple: convert/radical, convert/RootOf, minpoly, MinimalPolynomial, allvalues, convert/confrac, Numrical:-rationalize, FunctionAdvisor.",
    ),
    (
        "Symbolic Linear Algebra",
        "Mathematica: Inverse, Det, Eigenvalues, Eigenvectors, Eigensystem, CharacteristicPolynomial (HAVE in matrix/), MatrixRank (HAVE), NullSpace (HAVE), RowReduce, LUDecomposition, QRDecomposition (HAVE qr), JordanDecomposition (HAVE jordanForm), SingularValueDecomposition (HAVE svd), MatrixFunction, MatrixLog (HAVE), MatrixExp (HAVE expm), MatrixPower (HAVE). "
        "Maple: LinearAlgebra package: Determinant, Inverse, Eigenvalues, Eigenvectors, CharacteristicPolynomial, NullSpace, RowReduce, LUDecomposition, QRDecomposition, SingularValues, JordanForm, MatrixExponential, MatrixFunction, MinimalPolynomial.",
    ),
]

prompt_template = """Given math.js's current symbolic CAS inventory:
{mathjs}

Reference functions from Mathematica AND Maple for "{domain}":
{refs}

List the TOP 8 most impactful MISSING functions math.js should add to close the gap with Mathematica/Maple. For each:
- name (camelCase, math.js style)
- desc (one line)
- system: "Mathematica", "Maple", or "Both"
- priority: HIGH/MEDIUM/LOW (HIGH if fundamental CAS feature, MEDIUM if specialized, LOW if exotic)
- complexity: SIMPLE/MODERATE/COMPLEX

ONLY functions NOT already in math.js (the HAVE markers show what exists). Return JSON array only, no markdown fences:"""

all_results = []
for domain_name, refs in domains:
    prompt = prompt_template.format(mathjs=mathjs_cas, domain=domain_name, refs=refs)
    result = llm_query_fast(prompt, max_tokens=2000)
    print(f"OK {domain_name}")
    all_results.append({"domain": domain_name, "raw": result})

# Parse and deduplicate
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
        print(f"Raw: {item['raw'][:200]}")

# Deduplicate by name
seen = set()
unique = []
for f in all_functions:
    name = f.get("name", "")
    if name and name not in seen:
        seen.add(name)
        unique.append(f)

# Summary
print(f"\n{'=' * 70}")
print(f"Total unique gap functions: {len(unique)}")
high = [f for f in unique if f.get("priority") == "HIGH"]
med = [f for f in unique if f.get("priority") == "MEDIUM"]
low = [f for f in unique if f.get("priority") == "LOW"]
print(f"HIGH: {len(high)}, MEDIUM: {len(med)}, LOW: {len(low)}")

simple = [f for f in unique if f.get("complexity") == "SIMPLE"]
moderate = [f for f in unique if f.get("complexity") == "MODERATE"]
complex_ = [f for f in unique if f.get("complexity") == "COMPLEX"]
print(f"SIMPLE: {len(simple)}, MODERATE: {len(moderate)}, COMPLEX: {len(complex_)}")

# Save JSON
Path("C:/tmp/cas_gaps.json").write_text(json.dumps(unique, indent=2), encoding="utf-8")

# Print grouped by domain
print(f"\n{'=' * 70}")
print("GAP ANALYSIS BY DOMAIN")
print("=" * 70)
for domain_name, _ in domains:
    funcs = [f for f in unique if f.get("domain") == domain_name]
    if funcs:
        print(f"\n## {domain_name} ({len(funcs)})")
        for f in sorted(
            funcs, key=lambda x: (x.get("priority", "Z"), x.get("name", ""))
        ):
            pri = f.get("priority", "?")
            cpx = f.get("complexity", "?")
            sys_ = f.get("system", "?")
            name = f.get("name", "?")
            desc = f.get("desc", "")
            print(f"  [{pri:6s}/{cpx:8s}/{sys_:11s}] {name:28s} {desc}")

print(f"\nResults saved to C:/tmp/cas_gaps.json")
