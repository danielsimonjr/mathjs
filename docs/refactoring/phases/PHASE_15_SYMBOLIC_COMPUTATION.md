# Phase 15: Symbolic Computation - Detailed Breakdown

**Phase**: 15 of 20
**Category**: Computer Algebra System (CAS)
**Complexity**: Very High
**Estimated Effort**: 8-12 weeks
**Dependencies**: Phase 1 (Core Linear Algebra), Phase 2 (Special Functions), Phase 5 (Root Finding)

---

## Overview

Phase 15 implements symbolic computation capabilities transforming Math.js into a full Computer Algebra System (CAS). These algorithms operate on expression trees (AST nodes) to perform algebraic manipulation, calculus operations, and equation solving symbolically rather than numerically.

### Performance Goals
- **Pattern matching**: 5-10x faster via WASM-optimized tree traversal
- **Simplification**: 3-5x faster for large expression trees
- **Integration**: 2-4x faster pattern-based integration
- **Memory efficiency**: Minimize AST node allocation through structural sharing

### Key Innovations
1. Pattern-based rewrite engine with extensible rule sets
2. AST normalization for canonical forms
3. Hybrid symbolic-numeric algorithms
4. Memoization of expensive symbolic operations
5. Expression complexity metrics for strategy selection

---

## Task 15.1: Symbolic Integration

### Overview

Symbolic integration uses pattern matching against a library of known integral forms, combined with transformation rules (substitution, integration by parts, partial fractions).

### Mathematical Foundation

**Goal**: Compute ∫f(x)dx symbolically

**Strategy Hierarchy**:
1. **Table lookup**: Match against known integral forms
2. **Linearity**: ∫(af + bg)dx = a∫f dx + b∫g dx
3. **Substitution**: u-substitution for composite functions
4. **By parts**: ∫u dv = uv - ∫v du
5. **Partial fractions**: For rational functions
6. **Risch algorithm**: Complete decision procedure (complex)

### AST Pattern Matching

```typescript
// AST Node Types
type ASTNode = ConstantNode | SymbolNode | OperatorNode | FunctionNode

interface IntegralPattern {
  pattern: ASTNode          // Pattern to match
  template: ASTNode         // Result template
  condition?: (node) => boolean  // Additional constraints
}

// Example patterns
const integralTable: IntegralPattern[] = [
  // Power rule: ∫x^n dx = x^(n+1)/(n+1) + C  (n ≠ -1)
  {
    pattern: parse('x^n'),
    template: parse('x^(n+1)/(n+1)'),
    condition: (match) => match.n !== -1
  },

  // Logarithm: ∫1/x dx = ln|x| + C
  {
    pattern: parse('1/x'),
    template: parse('ln(abs(x))')
  },

  // Exponential: ∫e^x dx = e^x + C
  {
    pattern: parse('exp(x)'),
    template: parse('exp(x)')
  },

  // Exponential general: ∫a^x dx = a^x / ln(a) + C
  {
    pattern: parse('a^x'),
    template: parse('a^x / ln(a)'),
    condition: (match) => match.a !== 'e'
  },

  // Sin: ∫sin(x) dx = -cos(x) + C
  {
    pattern: parse('sin(x)'),
    template: parse('-cos(x)')
  },

  // Cos: ∫cos(x) dx = sin(x) + C
  {
    pattern: parse('cos(x)'),
    template: parse('sin(x)')
  },

  // Tan: ∫tan(x) dx = -ln|cos(x)| + C
  {
    pattern: parse('tan(x)'),
    template: parse('-ln(abs(cos(x)))')
  },

  // Arctan: ∫1/(1+x^2) dx = arctan(x) + C
  {
    pattern: parse('1/(1+x^2)'),
    template: parse('atan(x)')
  },

  // Chain rule: ∫f'(g(x))·g'(x) dx = f(g(x)) + C
  {
    pattern: parse('f_prime(g(x)) * g_prime(x)'),
    template: parse('f(g(x))'),
    condition: detectChainRule
  }
]
```

### Algorithm: Multi-Strategy Integration

```typescript
function integrate(expr: ASTNode, variable: string): ASTNode {
  // Step 1: Simplify expression
  expr = simplify(expr)

  // Step 2: Check if variable appears in expression
  if (!contains(expr, variable)) {
    // ∫c dx = c·x
    return multiply(expr, symbol(variable))
  }

  // Step 3: Handle constant
  if (isConstant(expr, variable)) {
    return multiply(expr, symbol(variable))
  }

  // Step 4: Apply linearity (sum/difference)
  if (expr.type === 'OperatorNode' && (expr.op === '+' || expr.op === '-')) {
    const left = integrate(expr.args[0], variable)
    const right = integrate(expr.args[1], variable)
    return operator(expr.op, [left, right])
  }

  // Step 5: Factor out constants (c·f(x))
  const [constant, rest] = factorConstant(expr, variable)
  if (constant !== 1) {
    return multiply(constant, integrate(rest, variable))
  }

  // Step 6: Table lookup (pattern matching)
  const tableResult = matchIntegralTable(expr, variable)
  if (tableResult) {
    return tableResult
  }

  // Step 7: Try u-substitution
  const substResult = trySubstitution(expr, variable)
  if (substResult) {
    return substResult
  }

  // Step 8: Try integration by parts
  const byPartsResult = tryIntegrationByParts(expr, variable)
  if (byPartsResult) {
    return byPartsResult
  }

  // Step 9: Rational function → partial fractions
  if (isRationalFunction(expr, variable)) {
    const partial = partialFractions(expr, variable)
    return integrate(partial, variable)
  }

  // Step 10: Trigonometric substitution
  const trigSubst = tryTrigSubstitution(expr, variable)
  if (trigSubst) {
    return trigSubst
  }

  // Failed: return unevaluated integral
  return functionNode('integral', [expr, symbol(variable)])
}

function matchIntegralTable(expr: ASTNode, variable: string): ASTNode | null {
  for (const rule of integralTable) {
    const match = patternMatch(expr, rule.pattern, variable)
    if (match && (!rule.condition || rule.condition(match))) {
      return substitutePattern(rule.template, match)
    }
  }
  return null
}

function trySubstitution(expr: ASTNode, variable: string): ASTNode | null {
  // Look for composite functions f(g(x))
  // Try u = g(x), du = g'(x) dx

  const candidates = findSubstitutionCandidates(expr, variable)

  for (const u of candidates) {
    const du = derivative(u, variable)

    // Check if expr can be written as h(u) · du
    const transformed = rewrite(expr, u, du, variable)
    if (transformed && !contains(transformed.integrand, variable)) {
      // ∫f(g(x))·g'(x) dx = ∫f(u) du
      const integral_u = integrate(transformed.integrand, 'u')
      // Substitute back: replace u with g(x)
      return substitute(integral_u, 'u', u)
    }
  }

  return null
}

function tryIntegrationByParts(expr: ASTNode, variable: string): ASTNode | null {
  // ∫u dv = uv - ∫v du
  // Strategy: LIATE (Logarithmic, Inverse trig, Algebraic, Trig, Exponential)

  if (expr.type !== 'OperatorNode' || expr.op !== '*') {
    return null
  }

  const factors = getMultiplicativeFactors(expr)

  // Choose u based on LIATE priority
  let u: ASTNode, dv: ASTNode
  const scores = factors.map(f => getLIATEScore(f, variable))
  const maxScore = Math.max(...scores)
  const uIndex = scores.indexOf(maxScore)

  u = factors[uIndex]
  dv = divide(expr, u)

  const du = derivative(u, variable)
  const v = integrate(dv, variable)

  if (!v || v.type === 'FunctionNode' && v.name === 'integral') {
    return null  // Integration of dv failed
  }

  // uv - ∫v du
  const term1 = multiply(u, v)
  const term2 = integrate(multiply(v, du), variable)

  if (!term2 || term2.type === 'FunctionNode' && term2.name === 'integral') {
    return null  // Second integral failed
  }

  return subtract(term1, term2)
}

function getLIATEScore(expr: ASTNode, variable: string): number {
  // LIATE priority scoring
  if (isFunctionType(expr, 'log', 'ln')) return 5
  if (isFunctionType(expr, 'asin', 'acos', 'atan')) return 4
  if (isPolynomial(expr, variable)) return 3
  if (isFunctionType(expr, 'sin', 'cos', 'tan')) return 2
  if (isFunctionType(expr, 'exp') || isExponential(expr)) return 1
  return 0
}
```

### Edge Cases

- **Non-elementary integrals**: ∫e^(-x²) dx (return unevaluated)
- **Divergent integrals**: Detected and flagged
- **Definite integrals**: Apply fundamental theorem after symbolic integration
- **Piecewise functions**: Split domain and integrate each piece

**Complexity**: O(n·k) where n = AST size, k = number of patterns

---

## Task 15.2: Limits

### Overview

Compute symbolic limits using algebraic simplification, L'Hôpital's rule, series expansion, and special limit theorems.

### Mathematical Foundation

**Goal**: Compute lim(x→a) f(x)

**Strategy**:
1. **Direct substitution**: Try evaluating f(a)
2. **Factorization**: Cancel common factors
3. **Rationalization**: Multiply by conjugate
4. **L'Hôpital's rule**: For indeterminate forms 0/0, ∞/∞
5. **Series expansion**: Taylor/Laurent series at x=a
6. **Special limits**: lim(x→0) sin(x)/x = 1, etc.

### Indeterminate Forms Detection

```typescript
enum IndeterminateForm {
  ZERO_OVER_ZERO = '0/0',
  INF_OVER_INF = '∞/∞',
  ZERO_TIMES_INF = '0·∞',
  INF_MINUS_INF = '∞-∞',
  ZERO_POW_ZERO = '0^0',
  INF_POW_ZERO = '∞^0',
  ONE_POW_INF = '1^∞',
  DETERMINATE = 'none'
}

function detectIndeterminateForm(
  expr: ASTNode,
  variable: string,
  approach: number  // value we're approaching
): IndeterminateForm {
  const limitValue = evaluateAtPoint(expr, variable, approach)

  if (expr.type === 'OperatorNode' && expr.op === '/') {
    const numLimit = evaluateAtPoint(expr.args[0], variable, approach)
    const denLimit = evaluateAtPoint(expr.args[1], variable, approach)

    if (numLimit === 0 && denLimit === 0) return IndeterminateForm.ZERO_OVER_ZERO
    if (isInfinity(numLimit) && isInfinity(denLimit)) return IndeterminateForm.INF_OVER_INF
  }

  if (expr.type === 'OperatorNode' && expr.op === '*') {
    const left = evaluateAtPoint(expr.args[0], variable, approach)
    const right = evaluateAtPoint(expr.args[1], variable, approach)
    if ((left === 0 && isInfinity(right)) || (isInfinity(left) && right === 0)) {
      return IndeterminateForm.ZERO_TIMES_INF
    }
  }

  if (expr.type === 'OperatorNode' && expr.op === '^') {
    const base = evaluateAtPoint(expr.args[0], variable, approach)
    const exp = evaluateAtPoint(expr.args[1], variable, approach)
    if (base === 0 && exp === 0) return IndeterminateForm.ZERO_POW_ZERO
    if (isInfinity(base) && exp === 0) return IndeterminateForm.INF_POW_ZERO
    if (base === 1 && isInfinity(exp)) return IndeterminateForm.ONE_POW_INF
  }

  return IndeterminateForm.DETERMINATE
}
```

### Algorithm: Multi-Strategy Limit Computation

```typescript
function limit(
  expr: ASTNode,
  variable: string,
  approach: number | 'inf' | '-inf',
  options: { side?: 'left' | 'right' | 'both' } = {}
): ASTNode {
  // Step 1: Simplify expression
  expr = simplify(expr)

  // Step 2: Check if variable appears
  if (!contains(expr, variable)) {
    return expr  // Constant function
  }

  // Step 3: Try direct substitution
  try {
    const directValue = evaluateAtPoint(expr, variable, approach)
    if (isFinite(directValue)) {
      return constant(directValue)
    }
  } catch (e) {
    // Continue with other strategies
  }

  // Step 4: Detect indeterminate form
  const form = detectIndeterminateForm(expr, variable, approach)

  // Step 5: Apply appropriate strategy
  switch (form) {
    case IndeterminateForm.ZERO_OVER_ZERO:
    case IndeterminateForm.INF_OVER_INF:
      return applyLHopital(expr, variable, approach)

    case IndeterminateForm.ZERO_TIMES_INF:
      // Rewrite as 0/0 or ∞/∞
      return limit(rewriteProduct(expr), variable, approach)

    case IndeterminateForm.INF_MINUS_INF:
      // Combine fractions or factor
      return limit(combineTerms(expr), variable, approach)

    case IndeterminateForm.ZERO_POW_ZERO:
    case IndeterminateForm.INF_POW_ZERO:
    case IndeterminateForm.ONE_POW_INF:
      // Rewrite using logarithm: lim f^g = exp(lim g·ln(f))
      return exponentialForm(expr, variable, approach)

    default:
      // Try other strategies
      return tryAlgebraicSimplification(expr, variable, approach)
  }
}

function applyLHopital(
  expr: ASTNode,
  variable: string,
  approach: number,
  depth: number = 0,
  maxDepth: number = 5
): ASTNode {
  // L'Hôpital's Rule: lim f/g = lim f'/g' (when applicable)

  if (depth >= maxDepth) {
    throw new Error('L\'Hôpital\'s rule did not converge')
  }

  if (expr.type !== 'OperatorNode' || expr.op !== '/') {
    throw new Error('L\'Hôpital\'s rule requires quotient')
  }

  const numerator = expr.args[0]
  const denominator = expr.args[1]

  // Verify we have 0/0 or ∞/∞
  const form = detectIndeterminateForm(expr, variable, approach)
  if (form !== IndeterminateForm.ZERO_OVER_ZERO &&
      form !== IndeterminateForm.INF_OVER_INF) {
    throw new Error('L\'Hôpital\'s rule not applicable')
  }

  // Differentiate numerator and denominator
  const numPrime = derivative(numerator, variable)
  const denPrime = derivative(denominator, variable)

  const newExpr = divide(numPrime, denPrime)

  // Try direct evaluation
  try {
    const value = evaluateAtPoint(newExpr, variable, approach)
    if (isFinite(value)) {
      return constant(value)
    }
  } catch (e) {
    // Continue recursively
  }

  // Check if still indeterminate
  const newForm = detectIndeterminateForm(newExpr, variable, approach)
  if (newForm === IndeterminateForm.ZERO_OVER_ZERO ||
      newForm === IndeterminateForm.INF_OVER_INF) {
    // Apply L'Hôpital again
    return applyLHopital(newExpr, variable, approach, depth + 1, maxDepth)
  }

  // Evaluate the new expression
  return limit(newExpr, variable, approach)
}

function exponentialForm(
  expr: ASTNode,
  variable: string,
  approach: number
): ASTNode {
  // For f(x)^g(x), rewrite as exp(g(x) · ln(f(x)))

  if (expr.type !== 'OperatorNode' || expr.op !== '^') {
    throw new Error('Exponential form requires power expression')
  }

  const base = expr.args[0]
  const exponent = expr.args[1]

  // lim f^g = exp(lim g·ln(f))
  const logExpr = multiply(exponent, functionNode('log', [base]))
  const innerLimit = limit(logExpr, variable, approach)

  // Return e^(innerLimit)
  return functionNode('exp', [innerLimit])
}

function tryAlgebraicSimplification(
  expr: ASTNode,
  variable: string,
  approach: number
): ASTNode {
  // Try various algebraic techniques

  // 1. Factorization (cancel common factors)
  const factored = factor(expr, variable)
  if (!equals(factored, expr)) {
    return limit(factored, variable, approach)
  }

  // 2. Rationalization (multiply by conjugate)
  const rationalized = rationalize(expr, variable)
  if (!equals(rationalized, expr)) {
    return limit(rationalized, variable, approach)
  }

  // 3. Series expansion (Taylor series)
  if (approach !== Infinity && approach !== -Infinity) {
    const series = taylorSeries(expr, variable, approach, 5)
    const seriesLimit = evaluateAtPoint(series, variable, approach)
    if (isFinite(seriesLimit)) {
      return constant(seriesLimit)
    }
  }

  // 4. Special limit rules
  const specialLimit = checkSpecialLimits(expr, variable, approach)
  if (specialLimit !== null) {
    return specialLimit
  }

  // Give up: return unevaluated limit
  return functionNode('limit', [expr, symbol(variable), constant(approach)])
}

function checkSpecialLimits(
  expr: ASTNode,
  variable: string,
  approach: number
): ASTNode | null {
  // lim(x→0) sin(x)/x = 1
  const sinOverX = patternMatch(expr, parse('sin(a*x) / (b*x)'), variable)
  if (sinOverX && approach === 0) {
    return constant(sinOverX.a / sinOverX.b)
  }

  // lim(x→0) (1-cos(x))/x^2 = 1/2
  const cosLimit = patternMatch(expr, parse('(1-cos(a*x)) / (b*x^2)'), variable)
  if (cosLimit && approach === 0) {
    return constant((cosLimit.a ** 2) / (2 * cosLimit.b))
  }

  // lim(x→∞) (1 + a/x)^x = e^a
  const expLimit = patternMatch(expr, parse('(1 + a/x)^x'), variable)
  if (expLimit && approach === Infinity) {
    return functionNode('exp', [expLimit.a])
  }

  return null
}
```

### Edge Cases

- **One-sided limits**: Check left/right limits separately
- **Oscillating limits**: sin(1/x) as x→0 does not exist
- **Jump discontinuities**: Return different left/right values
- **Essential singularities**: e^(1/x) as x→0

**Complexity**: O(n·d) where n = AST size, d = differentiation depth

---

## Task 15.3: Taylor Series Expansion

### Overview

Compute Taylor series expansion of f(x) around point a using repeated differentiation.

### Mathematical Foundation

**Taylor Series**:
```
f(x) = Σ(n=0 to ∞) [f^(n)(a) / n!] · (x-a)^n
     = f(a) + f'(a)(x-a) + f''(a)(x-a)²/2! + f'''(a)(x-a)³/3! + ...
```

**Maclaurin Series** (special case, a=0):
```
f(x) = Σ(n=0 to ∞) [f^(n)(0) / n!] · x^n
```

### Algorithm: Taylor Series via Differentiation

```typescript
function taylorSeries(
  expr: ASTNode,
  variable: string,
  point: number = 0,
  order: number = 5
): ASTNode {
  const terms: ASTNode[] = []

  let currentDerivative = expr
  let factorial = 1

  for (let n = 0; n <= order; n++) {
    // Evaluate n-th derivative at point
    const coeffValue = evaluateAtPoint(currentDerivative, variable, point)

    if (!isFinite(coeffValue)) {
      throw new Error(`Taylor series: derivative ${n} is not finite at x=${point}`)
    }

    // Compute coefficient: f^(n)(a) / n!
    const coeff = coeffValue / factorial

    if (Math.abs(coeff) > Number.EPSILON) {  // Skip near-zero terms
      // Term: coeff · (x - a)^n
      let term: ASTNode

      if (point === 0) {
        // Maclaurin: coeff · x^n
        if (n === 0) {
          term = constant(coeff)
        } else if (n === 1) {
          term = multiply(constant(coeff), symbol(variable))
        } else {
          term = multiply(constant(coeff), power(symbol(variable), constant(n)))
        }
      } else {
        // Taylor: coeff · (x - a)^n
        const shift = subtract(symbol(variable), constant(point))
        if (n === 0) {
          term = constant(coeff)
        } else {
          term = multiply(constant(coeff), power(shift, constant(n)))
        }
      }

      terms.push(term)
    }

    // Prepare for next iteration
    if (n < order) {
      currentDerivative = derivative(currentDerivative, variable)
      factorial *= (n + 1)
    }
  }

  // Sum all terms
  if (terms.length === 0) return constant(0)
  return terms.reduce((sum, term) => add(sum, term))
}
```

### Optimized: Coefficient Extraction (Avoid Repeated Evaluation)

```typescript
function taylorSeriesOptimized(
  expr: ASTNode,
  variable: string,
  point: number = 0,
  order: number = 5
): { series: ASTNode, coefficients: number[], error: ASTNode } {

  const coefficients: number[] = []
  const derivatives: ASTNode[] = [expr]

  // Step 1: Compute all derivatives symbolically
  let currentDerivative = expr
  for (let n = 1; n <= order; n++) {
    currentDerivative = derivative(currentDerivative, variable)
    derivatives.push(simplify(currentDerivative))
  }

  // Step 2: Evaluate derivatives at point (single pass)
  let factorial = 1
  const terms: ASTNode[] = []

  for (let n = 0; n <= order; n++) {
    const derivValue = evaluateAtPoint(derivatives[n], variable, point)
    const coeff = derivValue / factorial
    coefficients.push(coeff)

    if (Math.abs(coeff) > Number.EPSILON) {
      const xTerm = point === 0
        ? power(symbol(variable), constant(n))
        : power(subtract(symbol(variable), constant(point)), constant(n))

      terms.push(multiply(constant(coeff), xTerm))
    }

    factorial *= (n + 1)
  }

  const series = terms.length > 0
    ? terms.reduce((sum, term) => add(sum, term))
    : constant(0)

  // Step 3: Error term (Lagrange form)
  // R_n(x) = f^(n+1)(ξ) / (n+1)! · (x-a)^(n+1) for some ξ between a and x
  const errorTerm = divide(
    multiply(
      derivatives[order],  // Approximate with f^(n) instead of f^(n+1)
      power(subtract(symbol(variable), constant(point)), constant(order + 1))
    ),
    constant(factorial * (order + 1))
  )

  return { series, coefficients, error: errorTerm }
}
```

### Common Series (Built-in Patterns)

```typescript
const commonSeries: Record<string, (x: string, order: number) => ASTNode> = {
  // e^x = 1 + x + x²/2! + x³/3! + ...
  exp: (x, order) => {
    let factorial = 1
    const terms = [constant(1)]
    for (let n = 1; n <= order; n++) {
      factorial *= n
      terms.push(divide(power(symbol(x), constant(n)), constant(factorial)))
    }
    return terms.reduce((s, t) => add(s, t))
  },

  // sin(x) = x - x³/3! + x⁵/5! - x⁷/7! + ...
  sin: (x, order) => {
    const terms: ASTNode[] = []
    let factorial = 1
    let sign = 1
    for (let n = 1; n <= order; n += 2) {
      factorial *= n * (n > 1 ? n - 1 : 1)
      terms.push(multiply(
        constant(sign),
        divide(power(symbol(x), constant(n)), constant(factorial))
      ))
      sign *= -1
    }
    return terms.reduce((s, t) => add(s, t))
  },

  // cos(x) = 1 - x²/2! + x⁴/4! - x⁶/6! + ...
  cos: (x, order) => {
    const terms: ASTNode[] = [constant(1)]
    let factorial = 1
    let sign = -1
    for (let n = 2; n <= order; n += 2) {
      factorial *= n * (n - 1)
      terms.push(multiply(
        constant(sign),
        divide(power(symbol(x), constant(n)), constant(factorial))
      ))
      sign *= -1
    }
    return terms.reduce((s, t) => add(s, t))
  },

  // ln(1+x) = x - x²/2 + x³/3 - x⁴/4 + ... (|x| < 1)
  log1p: (x, order) => {
    const terms: ASTNode[] = []
    let sign = 1
    for (let n = 1; n <= order; n++) {
      terms.push(multiply(
        constant(sign),
        divide(power(symbol(x), constant(n)), constant(n))
      ))
      sign *= -1
    }
    return terms.reduce((s, t) => add(s, t))
  },

  // (1+x)^a = 1 + ax + a(a-1)x²/2! + a(a-1)(a-2)x³/3! + ...
  binomial: (x, order, alpha = 'a') => {
    const terms: ASTNode[] = [constant(1)]
    let coeff = 1
    let factorial = 1
    for (let n = 1; n <= order; n++) {
      coeff *= (alpha - (n - 1))
      factorial *= n
      terms.push(multiply(
        constant(coeff / factorial),
        power(symbol(x), constant(n))
      ))
    }
    return terms.reduce((s, t) => add(s, t))
  }
}
```

### Edge Cases

- **Singularities**: Series diverges if expanded at singularity
- **Convergence radius**: Series may not converge for all x
- **Analytic functions**: Only analytic functions have valid Taylor series
- **Order selection**: Higher order ≠ better approximation outside convergence radius

**Complexity**: O(n·order) where n = AST size

---

## Task 15.4: Symbolic Summation

### Overview

Evaluate symbolic sums using closed-form formulas for common series patterns.

### Mathematical Foundation

**Goal**: Compute Σ(k=a to b) f(k) symbolically

**Common Formulas**:
```
Arithmetic:  Σ(k=1 to n) k = n(n+1)/2
Power sum:   Σ(k=1 to n) k² = n(n+1)(2n+1)/6
             Σ(k=1 to n) k³ = [n(n+1)/2]²
Geometric:   Σ(k=0 to n) r^k = (1 - r^(n+1)) / (1 - r)  (r ≠ 1)
Infinite:    Σ(k=0 to ∞) r^k = 1/(1-r)  (|r| < 1)
```

### Algorithm: Pattern-Based Summation

```typescript
function summation(
  expr: ASTNode,
  variable: string,
  lower: number | ASTNode,
  upper: number | ASTNode | 'inf'
): ASTNode {

  // Step 1: Check for constant (no dependence on variable)
  if (!contains(expr, variable)) {
    const n = subtract(upper, lower)
    return multiply(expr, add(n, constant(1)))  // expr · (upper - lower + 1)
  }

  // Step 2: Linearity: Σ(af + bg) = aΣf + bΣg
  if (expr.type === 'OperatorNode' && (expr.op === '+' || expr.op === '-')) {
    const left = summation(expr.args[0], variable, lower, upper)
    const right = summation(expr.args[1], variable, lower, upper)
    return operator(expr.op, [left, right])
  }

  // Step 3: Factor out constants
  const [constant, rest] = factorConstant(expr, variable)
  if (constant !== 1) {
    return multiply(constant, summation(rest, variable, lower, upper))
  }

  // Step 4: Pattern matching for known sums
  const pattern = detectSummationPattern(expr, variable)

  switch (pattern.type) {
    case 'arithmetic':
      return arithmeticSum(lower, upper, pattern)

    case 'power':
      return powerSum(lower, upper, pattern.exponent)

    case 'geometric':
      return geometricSum(lower, upper, pattern.ratio)

    case 'polynomial':
      return polynomialSum(expr, variable, lower, upper)

    case 'telescoping':
      return telescopingSum(expr, variable, lower, upper)

    default:
      // Return unevaluated sum
      return functionNode('sum', [expr, symbol(variable), lower, upper])
  }
}

function arithmeticSum(
  lower: ASTNode | number,
  upper: ASTNode | number,
  pattern: { a: number, d: number }  // a + d·k
): ASTNode {
  // Σ(k=lower to upper) (a + d·k)
  // = (upper - lower + 1) · [2a + d(upper + lower)] / 2

  const n = add(subtract(upper, lower), constant(1))  // Number of terms
  const firstTerm = add(constant(pattern.a), multiply(constant(pattern.d), lower))
  const lastTerm = add(constant(pattern.a), multiply(constant(pattern.d), upper))

  // Sum = n · (first + last) / 2
  return divide(
    multiply(n, add(firstTerm, lastTerm)),
    constant(2)
  )
}

function geometricSum(
  lower: ASTNode | number,
  upper: ASTNode | number | 'inf',
  ratio: ASTNode
): ASTNode {
  // Σ(k=lower to upper) a·r^k

  if (upper === 'inf') {
    // Infinite geometric series: a / (1 - r)  if |r| < 1
    // We assume convergence; numerical check needed
    return divide(
      power(ratio, lower),
      subtract(constant(1), ratio)
    )
  }

  // Finite geometric series: a · r^lower · (1 - r^(n)) / (1 - r)
  // where n = upper - lower + 1
  const n = add(subtract(upper, lower), constant(1))

  return divide(
    multiply(
      power(ratio, lower),
      subtract(constant(1), power(ratio, n))
    ),
    subtract(constant(1), ratio)
  )
}

function powerSum(
  lower: ASTNode | number,
  upper: ASTNode | number,
  exponent: number
): ASTNode {
  // Σ(k=lower to upper) k^p
  // Use Faulhaber's formulas or Bernoulli numbers

  if (lower !== 1) {
    // Σ(k=lower to upper) k^p = Σ(k=1 to upper) k^p - Σ(k=1 to lower-1) k^p
    const fullSum = powerSum(1, upper, exponent)
    const partialSum = powerSum(1, subtract(lower, constant(1)), exponent)
    return subtract(fullSum, partialSum)
  }

  // Known formulas for small exponents
  const n = upper

  switch (exponent) {
    case 1:
      // Σk = n(n+1)/2
      return divide(
        multiply(n, add(n, constant(1))),
        constant(2)
      )

    case 2:
      // Σk² = n(n+1)(2n+1)/6
      return divide(
        multiply(
          multiply(n, add(n, constant(1))),
          add(multiply(constant(2), n), constant(1))
        ),
        constant(6)
      )

    case 3:
      // Σk³ = [n(n+1)/2]²
      const linearSum = divide(multiply(n, add(n, constant(1))), constant(2))
      return power(linearSum, constant(2))

    case 4:
      // Σk⁴ = n(n+1)(2n+1)(3n²+3n-1)/30
      return divide(
        multiply(
          multiply(
            multiply(n, add(n, constant(1))),
            add(multiply(constant(2), n), constant(1))
          ),
          subtract(
            add(multiply(constant(3), power(n, constant(2))), multiply(constant(3), n)),
            constant(1)
          )
        ),
        constant(30)
      )

    default:
      // Use Faulhaber's formula (requires Bernoulli numbers)
      return faulhaberFormula(n, exponent)
  }
}

function telescopingSum(
  expr: ASTNode,
  variable: string,
  lower: ASTNode | number,
  upper: ASTNode | number
): ASTNode {
  // Detect if expr = f(k+1) - f(k)
  // Then Σ(k=a to b) [f(k+1) - f(k)] = f(b+1) - f(a)

  if (expr.type !== 'OperatorNode' || expr.op !== '-') {
    return null
  }

  const left = expr.args[0]
  const right = expr.args[1]

  // Check if left = f(k+1) and right = f(k)
  const shifted = substitute(right, variable, add(symbol(variable), constant(1)))

  if (equals(left, shifted)) {
    // Telescoping: f(upper+1) - f(lower)
    const fUpper = substitute(right, variable, add(upper, constant(1)))
    const fLower = substitute(right, variable, lower)
    return subtract(fUpper, fLower)
  }

  return null
}
```

### Edge Cases

- **Infinite sums**: Check convergence conditions
- **Empty sums**: upper < lower → 0
- **Unknown patterns**: Return unevaluated
- **Oscillating sums**: May not converge

**Complexity**: O(n) where n = AST size

---

## Task 15.5: Equation Solver

### Overview

Solve equations symbolically using algebraic manipulation, factorization, and specialized algorithms.

### Mathematical Foundation

**Goal**: Solve f(x) = 0 for x

**Strategies**:
1. **Linear**: ax + b = 0 → x = -b/a
2. **Quadratic**: ax² + bx + c = 0 → x = (-b ± √(b²-4ac)) / 2a
3. **Polynomial**: Factorization, rational root theorem
4. **Rational**: Clear denominators, solve numerator = 0
5. **Transcendental**: Numerical methods + symbolic simplification

### Algorithm: Multi-Level Equation Solver

```typescript
function solve(
  equation: ASTNode,
  variable: string
): ASTNode[] {

  // Step 1: Convert to f(x) = 0 form
  let expr: ASTNode
  if (equation.type === 'OperatorNode' && equation.op === '=') {
    expr = subtract(equation.args[0], equation.args[1])
  } else {
    expr = equation
  }

  expr = simplify(expr)

  // Step 2: Check degree and type
  if (!contains(expr, variable)) {
    // No solution or all values are solutions
    return isZero(expr) ? [symbol(variable)] : []
  }

  const degree = polynomialDegree(expr, variable)

  if (degree !== null) {
    // Polynomial equation
    return solvePolynomial(expr, variable, degree)
  }

  // Step 3: Rational equation
  if (isRationalFunction(expr, variable)) {
    return solveRational(expr, variable)
  }

  // Step 4: Try factorization
  const factored = factor(expr, variable)
  if (factored.type === 'OperatorNode' && factored.op === '*') {
    // Product = 0 → solve each factor = 0
    const solutions: ASTNode[] = []
    for (const factor of getFactors(factored)) {
      solutions.push(...solve(factor, variable))
    }
    return uniqueSolutions(solutions)
  }

  // Step 5: Try isolating variable
  const isolated = isolateVariable(expr, variable)
  if (isolated) {
    return [isolated]
  }

  // Step 6: Transcendental → numerical + symbolic hints
  return solveTranscendental(expr, variable)
}

function solvePolynomial(
  expr: ASTNode,
  variable: string,
  degree: number
): ASTNode[] {

  const coeffs = polynomialCoefficients(expr, variable)

  switch (degree) {
    case 0:
      // Constant: no solution
      return []

    case 1:
      // Linear: ax + b = 0 → x = -b/a
      return [divide(negate(coeffs[0]), coeffs[1])]

    case 2:
      // Quadratic: ax² + bx + c = 0
      return solveQuadratic(coeffs[0], coeffs[1], coeffs[2])

    case 3:
      // Cubic: use Cardano's formula
      return solveCubic(coeffs[0], coeffs[1], coeffs[2], coeffs[3])

    case 4:
      // Quartic: use Ferrari's method
      return solveQuartic(coeffs[0], coeffs[1], coeffs[2], coeffs[3], coeffs[4])

    default:
      // Degree ≥ 5: try rational root theorem, then numerical
      return solveHighDegree(expr, variable, coeffs)
  }
}

function solveQuadratic(c: ASTNode, b: ASTNode, a: ASTNode): ASTNode[] {
  // ax² + bx + c = 0
  // x = (-b ± √(b² - 4ac)) / 2a

  const discriminant = subtract(
    power(b, constant(2)),
    multiply(constant(4), multiply(a, c))
  )

  const sqrtDisc = functionNode('sqrt', [discriminant])
  const twoA = multiply(constant(2), a)

  const x1 = divide(add(negate(b), sqrtDisc), twoA)
  const x2 = divide(subtract(negate(b), sqrtDisc), twoA)

  return [simplify(x1), simplify(x2)]
}

function solveCubic(d: ASTNode, c: ASTNode, b: ASTNode, a: ASTNode): ASTNode[] {
  // ax³ + bx² + cx + d = 0
  // Use Cardano's formula (depressed cubic method)

  // Step 1: Depress cubic via substitution x = t - b/(3a)
  // Gives: t³ + pt + q = 0

  const p = divide(
    subtract(
      multiply(constant(3), multiply(a, c)),
      power(b, constant(2))
    ),
    multiply(constant(3), power(a, constant(2)))
  )

  const q = divide(
    add(
      multiply(constant(2), power(b, constant(3))),
      subtract(
        multiply(constant(-9), multiply(multiply(a, b), c)),
        multiply(constant(27), multiply(power(a, constant(2)), d))
      )
    ),
    multiply(constant(27), power(a, constant(3)))
  )

  // Discriminant: Δ = -4p³ - 27q²
  const discriminant = add(
    multiply(constant(-4), power(p, constant(3))),
    multiply(constant(-27), power(q, constant(2)))
  )

  // [Implementation of Cardano's formula omitted for brevity]
  // Returns 1 real or 3 real roots depending on discriminant

  // Then back-substitute: x = t - b/(3a)
  return cardanoFormula(p, q, discriminant, a, b)
}

function solveRational(expr: ASTNode, variable: string): ASTNode[] {
  // Rational equation: P(x)/Q(x) = 0
  // Solve P(x) = 0 and exclude zeros of Q(x)

  const [numerator, denominator] = extractRationalParts(expr, variable)

  const numSolutions = solve(numerator, variable)
  const denZeros = solve(denominator, variable)

  // Filter out solutions where denominator is zero
  return numSolutions.filter(sol => {
    return !denZeros.some(zero => equals(sol, zero))
  })
}

function isolateVariable(expr: ASTNode, variable: string): ASTNode | null {
  // Try to algebraically isolate variable
  // e.g., 2x + 5 = 0 → x = -5/2

  // This is a complex symbolic manipulation task
  // Simplified implementation:

  if (expr.type === 'OperatorNode') {
    switch (expr.op) {
      case '+':
        // x + a = 0 → x = -a
        if (equals(expr.args[0], symbol(variable))) {
          return negate(expr.args[1])
        }
        if (equals(expr.args[1], symbol(variable))) {
          return negate(expr.args[0])
        }
        break

      case '*':
        // a·x = 0 → x = 0 (if a ≠ 0)
        if (contains(expr.args[0], variable) && !contains(expr.args[1], variable)) {
          return solve(expr.args[0], variable)[0]
        }
        if (contains(expr.args[1], variable) && !contains(expr.args[0], variable)) {
          return solve(expr.args[1], variable)[0]
        }
        break

      case '/':
        // x/a = 0 → x = 0
        if (equals(expr.args[0], symbol(variable))) {
          return constant(0)
        }
        break

      case '^':
        // x^n = 0 → x = 0
        if (equals(expr.args[0], symbol(variable))) {
          return constant(0)
        }
        break
    }
  }

  return null
}
```

### Rational Root Theorem (High-Degree Polynomials)

```typescript
function solveHighDegree(
  expr: ASTNode,
  variable: string,
  coeffs: ASTNode[]
): ASTNode[] {
  // For polynomials with integer coefficients
  // Use rational root theorem: p/q where p|a₀ and q|aₙ

  const a0 = evaluateConstant(coeffs[0])
  const an = evaluateConstant(coeffs[coeffs.length - 1])

  if (!Number.isInteger(a0) || !Number.isInteger(an)) {
    return []  // Rational root theorem requires integers
  }

  const pDivisors = divisors(Math.abs(a0))
  const qDivisors = divisors(Math.abs(an))

  const candidates: number[] = []
  for (const p of pDivisors) {
    for (const q of qDivisors) {
      candidates.push(p / q)
      candidates.push(-p / q)
    }
  }

  const solutions: ASTNode[] = []
  let remaining = expr

  for (const candidate of uniqueValues(candidates)) {
    const value = evaluateAtPoint(remaining, variable, candidate)
    if (Math.abs(value) < 1e-10) {
      // Found a root
      solutions.push(constant(candidate))

      // Divide out factor (x - candidate)
      const factor = subtract(symbol(variable), constant(candidate))
      remaining = polynomialDivision(remaining, factor, variable).quotient
    }
  }

  // If remaining is not constant, try solving it
  if (polynomialDegree(remaining, variable) > 0) {
    solutions.push(...solve(remaining, variable))
  }

  return solutions
}
```

### Edge Cases

- **No real solutions**: Return complex solutions or empty array
- **Infinite solutions**: Identity equation (e.g., x = x)
- **Extraneous solutions**: Verify solutions in original equation
- **Domain restrictions**: Exclude solutions outside domain

**Complexity**: O(n) for linear, O(1) for quadratic, exponential for high-degree

---

## Task 15.6: Polynomial Factorization

### Overview

Factor polynomials over integers/rationals using various algorithms.

### Mathematical Foundation

**Goal**: Express P(x) as product of irreducible factors

**Methods**:
1. **GCD extraction**: Factor out common terms
2. **Difference of squares**: a² - b² = (a+b)(a-b)
3. **Grouping**: Factor by grouping terms
4. **Rational root theorem**: Find linear factors
5. **Kronecker's algorithm**: Systematic factorization

### Algorithm: Multi-Strategy Factorization

```typescript
function factor(expr: ASTNode, variable?: string): ASTNode {

  expr = simplify(expr)

  // Step 1: Factor out numerical GCD
  const gcd = extractGCD(expr)
  let remaining = divide(expr, gcd)

  // Step 2: Detect polynomial in single variable
  if (!variable) {
    variable = detectPrimaryVariable(remaining)
  }

  if (!variable || !isPolynomial(remaining, variable)) {
    return expr  // Cannot factor
  }

  // Step 3: Get polynomial degree and coefficients
  const degree = polynomialDegree(remaining, variable)
  const coeffs = polynomialCoefficients(remaining, variable)

  // Step 4: Apply appropriate factorization method
  let factors: ASTNode[]

  switch (degree) {
    case 0:
    case 1:
      factors = [remaining]  // Already factored
      break

    case 2:
      factors = factorQuadratic(coeffs, variable)
      break

    case 3:
    case 4:
      factors = factorLowDegree(remaining, variable, coeffs)
      break

    default:
      factors = factorHighDegree(remaining, variable, coeffs)
  }

  // Step 5: Multiply GCD back if needed
  if (gcd !== 1) {
    factors.unshift(constant(gcd))
  }

  // Step 6: Return product of factors
  if (factors.length === 1) {
    return factors[0]
  }

  return factors.reduce((prod, f) => multiply(prod, f))
}

function factorQuadratic(coeffs: ASTNode[], variable: string): ASTNode[] {
  // ax² + bx + c
  const [c, b, a] = coeffs

  // Try factoring as (px + q)(rx + s)
  // where pr = a, qs = c, ps + qr = b

  const aVal = evaluateConstant(a)
  const bVal = evaluateConstant(b)
  const cVal = evaluateConstant(c)

  if (!Number.isInteger(aVal) || !Number.isInteger(bVal) || !Number.isInteger(cVal)) {
    return [createPolynomial(coeffs, variable)]  // Cannot factor over integers
  }

  // Find factor pairs of a and c
  const aPairs = factorPairs(aVal)
  const cPairs = factorPairs(cVal)

  for (const [p, r] of aPairs) {
    for (const [q, s] of cPairs) {
      if (p * s + q * r === bVal) {
        // Found factorization
        const factor1 = add(
          multiply(constant(p), symbol(variable)),
          constant(q)
        )
        const factor2 = add(
          multiply(constant(r), symbol(variable)),
          constant(s)
        )
        return [factor1, factor2]
      }
    }
  }

  // No integer factorization
  return [createPolynomial(coeffs, variable)]
}

function factorHighDegree(
  expr: ASTNode,
  variable: string,
  coeffs: ASTNode[]
): ASTNode[] {
  const factors: ASTNode[] = []
  let remaining = expr

  // Step 1: Try rational root theorem
  const roots = findRationalRoots(coeffs)

  for (const root of roots) {
    // Factor out (x - root)
    const linearFactor = subtract(symbol(variable), constant(root))
    factors.push(linearFactor)

    // Polynomial division
    const { quotient } = polynomialDivision(remaining, linearFactor, variable)
    remaining = quotient
  }

  // Step 2: Check remaining degree
  const remainingDegree = polynomialDegree(remaining, variable)

  if (remainingDegree === 0) {
    // Fully factored
    return factors
  } else if (remainingDegree === 2) {
    // Factor remaining quadratic
    const quadCoeffs = polynomialCoefficients(remaining, variable)
    factors.push(...factorQuadratic(quadCoeffs, variable))
  } else {
    // Cannot factor further (or irreducible)
    factors.push(remaining)
  }

  return factors
}

function findRationalRoots(coeffs: ASTNode[]): number[] {
  // Rational root theorem
  const a0 = evaluateConstant(coeffs[0])
  const an = evaluateConstant(coeffs[coeffs.length - 1])

  if (!Number.isInteger(a0) || !Number.isInteger(an)) {
    return []
  }

  const pDivisors = divisors(Math.abs(a0))
  const qDivisors = divisors(Math.abs(an))

  const candidates: number[] = []
  for (const p of pDivisors) {
    for (const q of qDivisors) {
      candidates.push(p / q)
      candidates.push(-p / q)
    }
  }

  // Test each candidate
  const roots: number[] = []
  for (const candidate of uniqueValues(candidates)) {
    let value = 0
    for (let i = 0; i < coeffs.length; i++) {
      value += evaluateConstant(coeffs[i]) * Math.pow(candidate, i)
    }
    if (Math.abs(value) < 1e-10) {
      roots.push(candidate)
    }
  }

  return roots
}

function factorByGrouping(expr: ASTNode, variable: string): ASTNode | null {
  // Try factoring by grouping
  // Example: ax + ay + bx + by = a(x+y) + b(x+y) = (a+b)(x+y)

  if (expr.type !== 'OperatorNode' || expr.op !== '+') {
    return null
  }

  const terms = getAdditiveTerms(expr)
  if (terms.length !== 4) {
    return null  // Grouping typically works with 4 terms
  }

  // Try grouping (terms[0] + terms[1]) and (terms[2] + terms[3])
  const group1 = add(terms[0], terms[1])
  const group2 = add(terms[2], terms[3])

  const factor1_1 = extractCommonFactor(group1, variable)
  const factor1_2 = extractCommonFactor(group2, variable)

  if (equals(factor1_1.remaining, factor1_2.remaining)) {
    // Common factor found
    const commonPart = factor1_1.remaining
    const otherPart = add(factor1_1.factor, factor1_2.factor)
    return multiply(commonPart, otherPart)
  }

  return null
}
```

### Special Patterns

```typescript
const factorizationPatterns = [
  // Difference of squares: a² - b² = (a+b)(a-b)
  {
    pattern: parse('a^2 - b^2'),
    factors: (match) => [
      add(match.a, match.b),
      subtract(match.a, match.b)
    ]
  },

  // Difference of cubes: a³ - b³ = (a-b)(a²+ab+b²)
  {
    pattern: parse('a^3 - b^3'),
    factors: (match) => [
      subtract(match.a, match.b),
      add(
        add(power(match.a, constant(2)), multiply(match.a, match.b)),
        power(match.b, constant(2))
      )
    ]
  },

  // Sum of cubes: a³ + b³ = (a+b)(a²-ab+b²)
  {
    pattern: parse('a^3 + b^3'),
    factors: (match) => [
      add(match.a, match.b),
      subtract(
        add(power(match.a, constant(2)), power(match.b, constant(2))),
        multiply(match.a, match.b)
      )
    ]
  },

  // Perfect square: a² + 2ab + b² = (a+b)²
  {
    pattern: parse('a^2 + 2*a*b + b^2'),
    factors: (match) => [power(add(match.a, match.b), constant(2))]
  }
]
```

### Edge Cases

- **Irreducible polynomials**: Cannot be factored over rationals
- **Complex factors**: May require extension to complex numbers
- **Multivariate**: Factorization becomes much harder
- **Numerical coefficients**: Limited to rational factorization

**Complexity**: Polynomial time for low degree, exponential for general case

---

## Task 15.7: Partial Fraction Decomposition

### Overview

Decompose rational functions into sum of simpler fractions using Heaviside cover-up method.

### Mathematical Foundation

**Goal**: Express P(x)/Q(x) as sum of partial fractions

**Forms**:
```
Distinct linear:    A/(x-a) + B/(x-b)
Repeated linear:    A/(x-a) + B/(x-a)² + C/(x-a)³
Irreducible quad:   (Ax+B)/(x²+px+q)
```

### Algorithm: Heaviside Cover-Up Method

```typescript
function partialFractions(
  expr: ASTNode,
  variable: string
): ASTNode {

  // Step 1: Verify it's a rational function
  if (!isRationalFunction(expr, variable)) {
    throw new Error('Expression must be a rational function')
  }

  const [numerator, denominator] = extractRationalParts(expr, variable)

  // Step 2: Check if proper (degree(num) < degree(den))
  const numDegree = polynomialDegree(numerator, variable)
  const denDegree = polynomialDegree(denominator, variable)

  let polynomial: ASTNode = constant(0)
  let remainder = numerator

  if (numDegree >= denDegree) {
    // Improper: perform polynomial division first
    const division = polynomialDivision(numerator, denominator, variable)
    polynomial = division.quotient
    remainder = division.remainder
  }

  // Step 3: Factor denominator
  const denFactors = factor(denominator, variable)
  const factorList = extractFactors(denFactors)

  // Step 4: Classify factors (linear, repeated, quadratic)
  const { linear, repeated, quadratic } = classifyFactors(factorList, variable)

  // Step 5: Set up partial fraction decomposition
  const terms: ASTNode[] = []

  // Handle distinct linear factors
  for (const factor of linear) {
    const coeff = heavisideCoverUp(remainder, denominator, factor, variable)
    terms.push(divide(coeff, factor))
  }

  // Handle repeated linear factors
  for (const { factor, multiplicity } of repeated) {
    const coeffs = repeatedFactorCoeffs(remainder, denominator, factor, multiplicity, variable)
    for (let k = 1; k <= multiplicity; k++) {
      terms.push(divide(coeffs[k - 1], power(factor, constant(k))))
    }
  }

  // Handle irreducible quadratic factors
  for (const factor of quadratic) {
    const [A, B] = quadraticCoeffs(remainder, denominator, factor, variable)
    terms.push(divide(add(multiply(A, symbol(variable)), B), factor))
  }

  // Step 6: Combine terms
  let result = terms.reduce((sum, term) => add(sum, term))

  if (numDegree >= denDegree) {
    result = add(polynomial, result)
  }

  return simplify(result)
}

function heavisideCoverUp(
  numerator: ASTNode,
  denominator: ASTNode,
  factor: ASTNode,  // (x - a)
  variable: string
): ASTNode {
  // Heaviside cover-up method for A/(x-a)
  // A = lim(x→a) [(x-a) · P(x)/Q(x)]
  //   = P(a) / Q'(a) where Q = (x-a)·R(x)

  // Extract root: x - a = 0 → x = a
  const root = solveLinear(factor, variable)

  // Remove this factor from denominator
  const remainingDen = polynomialDivision(denominator, factor, variable).quotient

  // Evaluate numerator at root
  const numValue = evaluateAtPoint(numerator, variable, root)

  // Evaluate remaining denominator at root
  const denValue = evaluateAtPoint(remainingDen, variable, root)

  return divide(constant(numValue), constant(denValue))
}

function repeatedFactorCoeffs(
  numerator: ASTNode,
  denominator: ASTNode,
  factor: ASTNode,  // (x - a)
  multiplicity: number,
  variable: string
): ASTNode[] {
  // For A₁/(x-a) + A₂/(x-a)² + ... + Aₙ/(x-a)ⁿ
  // Use repeated differentiation

  const root = solveLinear(factor, variable)
  const remainingDen = polynomialDivision(
    denominator,
    power(factor, constant(multiplicity)),
    variable
  ).quotient

  // G(x) = P(x) / R(x) where Q(x) = (x-a)ⁿ · R(x)
  const G = divide(numerator, remainingDen)

  const coeffs: ASTNode[] = []
  let currentDeriv = G
  let factorial = 1

  for (let k = multiplicity; k >= 1; k--) {
    // Aₖ = G^(n-k)(a) / (n-k)!
    const derivOrder = multiplicity - k

    if (derivOrder > 0) {
      currentDeriv = derivative(currentDeriv, variable)
      factorial *= derivOrder
    }

    const value = evaluateAtPoint(currentDeriv, variable, root)
    coeffs[k - 1] = divide(constant(value), constant(factorial))
  }

  return coeffs
}

function quadraticCoeffs(
  numerator: ASTNode,
  denominator: ASTNode,
  quadFactor: ASTNode,  // ax² + bx + c
  variable: string
): [ASTNode, ASTNode] {
  // For (Ax + B) / (ax² + bx + c)
  // Set up system of equations by clearing denominators

  const remainingDen = polynomialDivision(denominator, quadFactor, variable).quotient

  // P(x) = (Ax + B) · R(x) + ... (other terms)
  // Solve for A and B by comparing coefficients

  // Simplified: evaluate at two points
  const x1 = 0
  const x2 = 1

  const lhs1 = evaluateAtPoint(numerator, variable, x1)
  const lhs2 = evaluateAtPoint(numerator, variable, x2)

  const rhs1_factor = evaluateAtPoint(remainingDen, variable, x1)
  const rhs2_factor = evaluateAtPoint(remainingDen, variable, x2)

  // Solve system:
  // B · rhs1 = lhs1
  // (A + B) · rhs2 = lhs2

  const B = lhs1 / rhs1_factor
  const A = (lhs2 / rhs2_factor) - B

  return [constant(A), constant(B)]
}

function classifyFactors(
  factors: ASTNode[],
  variable: string
): { linear: ASTNode[], repeated: Array<{ factor: ASTNode, multiplicity: number }>, quadratic: ASTNode[] } {

  const linear: ASTNode[] = []
  const repeated: Array<{ factor: ASTNode, multiplicity: number }> = []
  const quadratic: ASTNode[] = []

  const factorCounts = new Map<string, { factor: ASTNode, count: number }>()

  for (const factor of factors) {
    const degree = polynomialDegree(factor, variable)
    const key = factor.toString()

    if (degree === 1) {
      if (factorCounts.has(key)) {
        factorCounts.get(key).count++
      } else {
        factorCounts.set(key, { factor, count: 1 })
      }
    } else if (degree === 2 && !hasRealRoots(factor, variable)) {
      quadratic.push(factor)
    }
  }

  for (const { factor, count } of factorCounts.values()) {
    if (count === 1) {
      linear.push(factor)
    } else {
      repeated.push({ factor, multiplicity: count })
    }
  }

  return { linear, repeated, quadratic }
}
```

### Edge Cases

- **Improper fractions**: Perform polynomial division first
- **Repeated factors**: Require differentiation method
- **Irreducible quadratics**: Need (Ax+B) numerator
- **Numerical stability**: Watch for near-zero denominators

**Complexity**: O(n³) where n = degree of denominator

---

## Task 15.8: Expression Expansion

### Overview

Expand algebraic expressions using distributive property and multinomial theorem.

### Mathematical Foundation

**Goal**: Expand products and powers into sum of terms

**Rules**:
```
Distributive:        a(b + c) = ab + ac
FOIL:                (a+b)(c+d) = ac + ad + bc + bd
Binomial:            (a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ
Multinomial:         (a+b+c)ⁿ = Σ [n!/(k₁!k₂!k₃!)] aᵏ¹ bᵏ² cᵏ³
```

### Algorithm: Recursive Expansion

```typescript
function expand(expr: ASTNode, options: { deep?: boolean } = {}): ASTNode {

  // Step 1: Handle different node types
  switch (expr.type) {
    case 'ConstantNode':
    case 'SymbolNode':
      return expr  // Already expanded

    case 'OperatorNode':
      return expandOperator(expr, options)

    case 'FunctionNode':
      return expandFunction(expr, options)

    case 'ParenthesisNode':
      return expand(expr.content, options)

    default:
      return expr
  }
}

function expandOperator(expr: OperatorNode, options: { deep?: boolean }): ASTNode {

  switch (expr.op) {
    case '+':
    case '-':
      // Recursively expand operands
      const left = expand(expr.args[0], options)
      const right = expand(expr.args[1], options)
      return operator(expr.op, [left, right])

    case '*':
      return expandMultiplication(expr.args[0], expr.args[1], options)

    case '/':
      // Expand numerator and denominator separately
      const num = expand(expr.args[0], options)
      const den = expand(expr.args[1], options)
      return divide(num, den)

    case '^':
      return expandPower(expr.args[0], expr.args[1], options)

    default:
      return expr
  }
}

function expandMultiplication(
  left: ASTNode,
  right: ASTNode,
  options: { deep?: boolean }
): ASTNode {

  // Recursively expand operands first
  left = expand(left, options)
  right = expand(right, options)

  // Get additive terms from each operand
  const leftTerms = getAdditiveTerms(left)
  const rightTerms = getAdditiveTerms(right)

  // Distributive property: (a+b)(c+d) = ac + ad + bc + bd
  const terms: ASTNode[] = []

  for (const lTerm of leftTerms) {
    for (const rTerm of rightTerms) {
      const product = multiply(lTerm, rTerm)
      terms.push(options.deep ? expand(product, options) : product)
    }
  }

  // Sum all terms
  return terms.reduce((sum, term) => add(sum, term))
}

function expandPower(
  base: ASTNode,
  exponent: ASTNode,
  options: { deep?: boolean }
): ASTNode {

  // Expand base
  base = expand(base, options)

  // Check if exponent is a positive integer
  if (exponent.type !== 'ConstantNode' || !Number.isInteger(exponent.value) || exponent.value < 0) {
    return power(base, exponent)  // Cannot expand
  }

  const n = exponent.value

  if (n === 0) {
    return constant(1)
  }

  if (n === 1) {
    return base
  }

  // Check if base is a sum (binomial/multinomial expansion)
  const terms = getAdditiveTerms(base)

  if (terms.length === 1) {
    // Single term: no expansion needed
    return power(base, exponent)
  }

  if (terms.length === 2) {
    // Binomial expansion: (a+b)ⁿ
    return expandBinomial(terms[0], terms[1], n, options)
  }

  // Multinomial expansion: (a+b+c+...)ⁿ
  return expandMultinomial(terms, n, options)
}

function expandBinomial(
  a: ASTNode,
  b: ASTNode,
  n: number,
  options: { deep?: boolean }
): ASTNode {
  // (a+b)ⁿ = Σ(k=0 to n) C(n,k) · aⁿ⁻ᵏ · bᵏ

  const terms: ASTNode[] = []

  for (let k = 0; k <= n; k++) {
    const binomCoeff = binomial(n, k)

    // C(n,k) · aⁿ⁻ᵏ · bᵏ
    let term: ASTNode = constant(binomCoeff)

    const aPower = n - k
    const bPower = k

    if (aPower > 0) {
      const aTerm = aPower === 1 ? a : power(a, constant(aPower))
      term = multiply(term, options.deep ? expand(aTerm, options) : aTerm)
    }

    if (bPower > 0) {
      const bTerm = bPower === 1 ? b : power(b, constant(bPower))
      term = multiply(term, options.deep ? expand(bTerm, options) : bTerm)
    }

    terms.push(term)
  }

  return terms.reduce((sum, term) => add(sum, term))
}

function expandMultinomial(
  terms: ASTNode[],
  n: number,
  options: { deep?: boolean }
): ASTNode {
  // (a₁+a₂+...+aₘ)ⁿ = Σ [n!/(k₁!k₂!...kₘ!)] · a₁ᵏ¹ · a₂ᵏ² · ... · aₘᵏᵐ
  // where k₁+k₂+...+kₘ = n

  const m = terms.length
  const expandedTerms: ASTNode[] = []

  // Generate all partitions of n into m parts
  const partitions = generatePartitions(n, m)

  for (const partition of partitions) {
    // Compute multinomial coefficient
    const coeff = multinomialCoeff(n, partition)

    // Compute product a₁ᵏ¹ · a₂ᵏ² · ... · aₘᵏᵐ
    let term: ASTNode = constant(coeff)

    for (let i = 0; i < m; i++) {
      if (partition[i] > 0) {
        const factor = partition[i] === 1
          ? terms[i]
          : power(terms[i], constant(partition[i]))

        term = multiply(term, options.deep ? expand(factor, options) : factor)
      }
    }

    expandedTerms.push(term)
  }

  return expandedTerms.reduce((sum, term) => add(sum, term))
}

function multinomialCoeff(n: number, partition: number[]): number {
  // n! / (k₁! · k₂! · ... · kₘ!)

  let numerator = factorial(n)
  let denominator = 1

  for (const k of partition) {
    denominator *= factorial(k)
  }

  return numerator / denominator
}

function generatePartitions(n: number, m: number): number[][] {
  // Generate all ways to partition n into m non-negative integers

  if (m === 1) {
    return [[n]]
  }

  const partitions: number[][] = []

  for (let k = 0; k <= n; k++) {
    const subPartitions = generatePartitions(n - k, m - 1)
    for (const subPart of subPartitions) {
      partitions.push([k, ...subPart])
    }
  }

  return partitions
}

function getAdditiveTerms(expr: ASTNode): ASTNode[] {
  // Extract terms from a + b + c - d = [a, b, c, -d]

  if (expr.type !== 'OperatorNode') {
    return [expr]
  }

  if (expr.op === '+') {
    return [
      ...getAdditiveTerms(expr.args[0]),
      ...getAdditiveTerms(expr.args[1])
    ]
  }

  if (expr.op === '-') {
    return [
      ...getAdditiveTerms(expr.args[0]),
      negate(expr.args[1])
    ]
  }

  return [expr]
}
```

### Special Cases

```typescript
function expandTrigonometric(expr: ASTNode): ASTNode {
  // sin(a+b) = sin(a)cos(b) + cos(a)sin(b)
  // cos(a+b) = cos(a)cos(b) - sin(a)sin(b)
  // tan(a+b) = (tan(a)+tan(b)) / (1-tan(a)tan(b))

  if (expr.type !== 'FunctionNode') {
    return expr
  }

  const arg = expr.args[0]

  if (arg.type === 'OperatorNode' && arg.op === '+') {
    const a = arg.args[0]
    const b = arg.args[1]

    switch (expr.name) {
      case 'sin':
        return add(
          multiply(functionNode('sin', [a]), functionNode('cos', [b])),
          multiply(functionNode('cos', [a]), functionNode('sin', [b]))
        )

      case 'cos':
        return subtract(
          multiply(functionNode('cos', [a]), functionNode('cos', [b])),
          multiply(functionNode('sin', [a]), functionNode('sin', [b]))
        )

      case 'tan':
        return divide(
          add(functionNode('tan', [a]), functionNode('tan', [b])),
          subtract(
            constant(1),
            multiply(functionNode('tan', [a]), functionNode('tan', [b]))
          )
        )
    }
  }

  return expr
}
```

### Edge Cases

- **Negative exponents**: Cannot expand
- **Non-integer exponents**: Cannot use binomial theorem
- **Very large exponents**: Combinatorial explosion (e.g., (a+b)¹⁰⁰)
- **Nested expressions**: Deep expansion can be expensive

**Complexity**: O(nᵐ) where n = exponent, m = number of terms

---

## Implementation Checklist

### For Each Symbolic Operation

- [ ] AST pattern matching engine with variable binding
- [ ] Expression simplification (normalize before/after operations)
- [ ] Caching/memoization for expensive operations
- [ ] Graceful degradation (return unevaluated when impossible)
- [ ] Unit tests with symbolic and numeric verification
- [ ] Integration with existing mathjs expression parser
- [ ] TypeScript type definitions for AST nodes
- [ ] Performance benchmarks vs SymPy, Mathematica

### AST Infrastructure

- [ ] Unified AST node types (ConstantNode, SymbolNode, etc.)
- [ ] Pattern matching with wildcards and constraints
- [ ] Tree traversal utilities (map, reduce, filter)
- [ ] Structural equality checking
- [ ] Pretty printing (LaTeX, ASCII)
- [ ] Serialization/deserialization

### Symbolic-Numeric Hybrid

- [ ] Automatic fallback to numeric methods when symbolic fails
- [ ] Precision tracking for mixed symbolic-numeric computation
- [ ] Validation: verify symbolic result numerically

---

## Performance Targets (WASM)

| Operation              | Expression Size | JS Time  | WASM Time | Speedup |
|------------------------|-----------------|----------|-----------|---------|
| Pattern matching       | 100 nodes       | ~5ms     | ~0.8ms    | 6x      |
| Integration (table)    | Simple expr     | ~2ms     | ~0.5ms    | 4x      |
| Differentiation        | Nested expr     | ~3ms     | ~0.6ms    | 5x      |
| Expansion (binomial)   | (a+b)^10        | ~15ms    | ~3ms      | 5x      |
| Factorization          | Degree 4 poly   | ~8ms     | ~2ms      | 4x      |
| Simplification         | Complex expr    | ~10ms    | ~2.5ms    | 4x      |

*Estimates based on tree traversal and algebraic manipulation*

---

## References

- **Geddes, Czapor, Labahn**: *Algorithms for Computer Algebra* (Comprehensive CAS textbook)
- **Bronstein**: *Symbolic Integration I* (Risch algorithm)
- **Fateman**: *Essays in Algebraic Simplification* (Pattern matching, simplification)
- **SymPy Documentation**: Modern open-source CAS reference
- **Mathematica**: Industry-standard CAS
- **Maxima**: Lisp-based CAS with extensive symbolic capabilities

---

## Notes

- **Risch algorithm**: Complete integration algorithm (very complex, Phase 16+)
- **Gröbner bases**: Multivariate polynomial systems (Phase 17+)
- **Cylindrical algebraic decomposition**: General quantifier elimination (Phase 18+)
- **Series acceleration**: Richardson extrapolation, Padé approximants
- **Expression complexity**: Measure size to avoid exponential blowup in simplification
