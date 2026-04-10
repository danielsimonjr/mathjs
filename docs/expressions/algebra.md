# Algebra (symbolic computation)

math.js has built-in support for symbolic computation ([CAS](https://www.wikiwand.com/en/Computer_algebra_system)). It can parse expressions into an expression tree and do algebraic operations like simplification, derivation, integration, equation solving, and much more.

As of v15.6.0 math.js includes **92 algebra / CAS functions** spanning simplification, calculus, polynomial algebra, transforms, series, optimization, and more. See the [full function reference](https://danielsimonjr.github.io/mathjs/) for complete API documentation.

> It's worth mentioning an excellent extension on math.js here: [mathsteps](https://github.com/socraticorg/mathsteps), a step-by-step math solver library that is focused on pedagogy (how best to teach). The math problems it focuses on are pre-algebra and algebra problems involving simplifying expressions.

## Quick Reference: All CAS Functions

The table below summarises all 92 algebra functions by category. Click the function name for reference docs at [danielsimonjr.github.io/mathjs](https://danielsimonjr.github.io/mathjs/).

### Simplification & Transformation
| Function | Description |
|---|---|
| `simplify` | Simplify an expression using rewriting rules |
| `fullSimplify` | Multi-strategy simplification (tries all approaches, picks shortest) |
| `simplifyCore` | Core simplification step (used internally) |
| `simplifyConstant` | Fold numeric sub-expressions to constants |
| `rationalize` | Transform expression to rational fraction form |
| `expand` | Expand products and powers |
| `combine` | Combine logarithms and power expressions |
| `collect` | Collect like terms in a polynomial |
| `cancel` | Cancel common factors in a rational expression |
| `together` | Combine rational expressions over a common denominator |
| `apart` | Partial-fraction decomposition |
| `normalForm` | Canonical polynomial / rational normal form |
| `powerExpand` | Expand powers (assuming positive real bases) |
| `functionExpand` | Expand special function identities |
| `trigExpand` | Expand trigonometric functions using angle-addition formulas |
| `trigReduce` | Reduce trig products to sums |
| `complexExpand` | Separate expression into real and imaginary parts |
| `expToTrig` | Convert exponentials to trig via Euler's formula |
| `trigToExp` | Convert trig functions to complex exponentials |
| `toRadicals` | Convert algebraic expressions to radical form |
| `leafCount` | Count leaf nodes (measure of expression complexity) |

### Calculus
| Function | Description |
|---|---|
| `derivative` | Symbolic derivative with respect to a variable |
| `integrate` | Rule-based symbolic integration |
| `partialDerivative` | Partial derivative of a multivariate expression |
| `directionalDerivative` | Directional derivative along a vector |
| `gradientSymbolic` | Symbolic gradient vector of a scalar expression |
| `jacobian` | Jacobian matrix of a vector-valued function |
| `curl` | Symbolic curl of a vector field (3D) |
| `divergence` | Symbolic divergence of a vector field |
| `laplacian` | Scalar Laplacian of an expression |
| `limit` | Symbolic limit of an expression as a variable approaches a value |
| `implicitDiff` | Implicit differentiation |
| `tangentLine` | Tangent line at a point |
| `asymptotic` | Leading-term asymptotic analysis |

### Series & Summation
| Function | Description |
|---|---|
| `series` | Symbolic Taylor/Laurent series |
| `taylor` | Taylor polynomial to order _n_ |
| `multivariateTaylor` | Multivariate Taylor series expansion |
| `seriesCoefficient` | _n_-th coefficient in a Taylor series |
| `summation` | Symbolic summation (closed form) |
| `fourierSeries` | Compute Fourier series coefficients |
| `differences` | Finite-difference operator |

### Equations & Solving
| Function | Description |
|---|---|
| `solve` | Symbolic equation solving (linear, quadratic, rational roots) |
| `resolve` | Resolve a symbolic expression against a scope |
| `substitute` | Substitute a sub-expression with another |
| `eliminate` | Variable elimination in a system of equations |
| `reduce` | Solve with domain constraints |
| `symbolicEqual` | Test structural / symbolic equality of two expressions |

### Polynomial Algebra
| Function | Description |
|---|---|
| `factor` | Symbolic polynomial factoring |
| `expand` | Expand a product into a sum |
| `polynomialRoot` | Roots of a polynomial |
| `polynomialGCD` | Greatest common divisor of two polynomials |
| `polynomialLCM` | Least common multiple of two polynomials |
| `polynomialQuotient` | Quotient of polynomial division |
| `polynomialRemainder` | Remainder of polynomial division |
| `groebnerBasis` | Gröbner basis (Buchberger's algorithm, ≤ 2 variables) |
| `resultant` | Resultant of two polynomials (Sylvester matrix determinant) |
| `discriminant` | Polynomial discriminant |
| `coefficientList` | List of polynomial coefficients |
| `degree` | Degree of a polynomial |
| `polyadd` | Add two polynomials |
| `polymul` | Multiply two polynomials |
| `polyder` | Differentiate a polynomial |
| `polyval` | Evaluate a polynomial at a point |
| `minimalPolynomial` | Minimal polynomial for an algebraic number |
| `normalForm` | Canonical form of a polynomial / rational expression |

### Transforms
| Function | Description |
|---|---|
| `laplace` | Symbolic Laplace transform |
| `inverseLaplace` | Inverse Laplace transform (via partial fractions) |
| `inverseLaplaceTransform` | Inverse Laplace transform (alias / extended form) |
| `zTransform` | Z-transform of a sequence |

### Assumptions & Domains
| Function | Description |
|---|---|
| `assume` | Register domain assumptions for a variable (`positive`, `integer`, `real`, etc.) |
| `element` | Assert that a variable belongs to a set/domain |
| `piecewise` | Conditional piecewise expression |
| `variables` | Extract all symbolic variables from an expression |

### Linear Algebra (symbolic)
| Function | Description |
|---|---|
| `sylvester` | Construct or solve the Sylvester equation |
| `lyap` | Solve the Lyapunov equation |
| `rowReduce` | Gauss-Jordan row reduction (RREF) |
| `minimalPolynomial` | Minimal polynomial of a matrix or algebraic number |

### ODE / Series Special
| Function | Description |
|---|---|
| `odeGeneral` | General ODE solver interface |

### Expression Utilities
| Function | Description |
|---|---|
| `parse` | Parse an expression string into a MathNode tree |
| `compile` | Compile an expression for repeated evaluation |
| `evaluate` | Parse and evaluate an expression |
| `symbolicProduct` | Symbolic product of a sequence |


## Simplify

The function [`math.simplify`](../reference/functions/simplify.md) simplifies an expression tree:

```js
// simplify an expression
console.log(math.simplify('3 + 2 / 4').toString())              // '7 / 2'
console.log(math.simplify('2x + 3x').toString())                // '5 * x'
console.log(math.simplify('x^2 + x + 3 + x^2').toString())      // '2 * x ^ 2 + x + 3'
console.log(math.simplify('x * y * -x / (x ^ 2)').toString())   // '-y'
```

The function accepts either a string or an expression tree (`Node`) as input, and outputs a simplified expression tree (`Node`). This node tree can be transformed and evaluated as described in detail on the page [Expression trees](expression_trees.md).

```js
// work with an expression tree, evaluate results
const f = math.parse('2x + x')
const simplified = math.simplify(f)
console.log(simplified.toString())       // '3 * x'
console.log(simplified.evaluate({x: 4})) // 12
```

Among its other actions, calling `simplify()` on an expression will convert
any functions that have operator equivalents to their operator form:
```js
console.log(math.simplify('multiply(x,3)').toString)  // '3 * x'
```

Note that `simplify` has an optional argument `scope` that allows the definitions of variables in the expression (as numeric values, or as further expressions) to be specified and used in the simplification, e.g. continuing the previous example,

```js
console.log(math.simplify(f, {x: 4}).toString()) // 12
console.log(math.simplify(f, {x: math.parse('y+z')}).toString()) // '3*(y+z)'
```

In general, simplification is an inherently dfficult problem; in fact, for certain classes of expressions and algebraic equivalences, it is undecidable whether a given expression is equivalent to zero. Moreover, simplification generally depends on the properties of the operations involved; since multiplication (for example) may have different properties (e.g., it might or might not be commutative) depending on the domain under consideration, different simplifications might be appropriate.

As a result, `simplify()` has an additional optional argument, `options`, which controls its behavior. This argument is an object specifying any of various properties concerning the simplification process. See the [detailed documentation](../reference/functions/simplify.md) for a complete list, but currently the two most important properties are as follows. Note that the `options` argument may only be specified if the `scope` is as well.

- `exactFractions` - a boolean which specifies whether non-integer numerical constants should be simplified to rational numbers when possible (true), or always converted to decimal notation (false).
- `context` - an object whose keys are the names of operations ('add', 'multiply', etc.) and whose values specify algebraic properties of the corresponding operation (currently any of 'total', 'trivial', 'commutative', and 'associative'). Simplifications will only be performed if the properties they rely on are true in the given context. For example,
```js
const expr = math.parse('x*y-y*x')
console.log(math.simplify(expr).toString())  // 0; * is commutative by default
console.log(math.simplify(expr, {}, {context: {multiply: {commutative: false}}}))
  // 'x*y-y*x'; the order of the right multiplication can't be reversed.
```

Note that the default context is very permissive (allows a lot of simplifications) but that there is also a `math.simplify.realContext` that only allows simplifications that are guaranteed to preserve the value of the expression on all real numbers:
```js
const rational = math.parse('(x-1)*x/(x-1)')
console.log(math.simplify(expr, {}, {context: math.simplify.realContext})
  // '(x-1)*x/(x-1)'; canceling the 'x-1' makes the expression defined at 1
```

For more details on the theory of expression simplification, see:

- [Strategies for simplifying math expressions (Stackoverflow)](https://stackoverflow.com/questions/7540227/strategies-for-simplifying-math-expressions)
- [Symbolic computation - Simplification (Wikipedia)](https://en.wikipedia.org/wiki/Symbolic_computation#Simplification)


## Derivative

The function [`math.derivative`](../reference/functions/derivative.md) finds the symbolic derivative of an expression:

```js
// calculate a derivative
console.log(math.derivative('2x^2 + 3x + 4', 'x').toString())   // '4 * x + 3'
console.log(math.derivative('sin(2x)', 'x').toString())         // '2 * cos(2 * x)'
```

Similar to the function `math.simplify`, `math.derivative` accepts either a string or an expression tree (`Node`) as input, and outputs a simplified expression tree (`Node`).

```js
// work with an expression tree, evaluate results
const h = math.parse('x^2 + x')
const x = math.parse('x')
const dh = math.derivative(h, x)
console.log(dh.toString())        // '2 * x + 1'
console.log(dh.evaluate({x: 3}))  // '7'
```

The rules used by `math.derivative` can be found on Wikipedia:

- [Differentiation rules (Wikipedia)](https://en.wikipedia.org/wiki/Differentiation_rules)


## Rationalize

The function [`math.rationalize`](../reference/functions/rationalize.md) transforms a rationalizable expression in a rational fraction.
If rational fraction is one variable polynomial then converts the numerator and denominator in canonical form, with decreasing exponents, returning the coefficients of numerator.

```js

math.rationalize('2x/y - y/(x+1)')
              // (2*x^2-y^2+2*x)/(x*y+y)
math.rationalize('(2x+1)^6')
              // 64*x^6+192*x^5+240*x^4+160*x^3+60*x^2+12*x+1
math.rationalize('2x/( (2x-1) / (3x+2) ) - 5x/ ( (3x+4) / (2x^2-5) ) + 3')
              // -20*x^4+28*x^3+104*x^2+6*x-12)/(6*x^2+5*x-4)

math.rationalize('x+x+x+y',{y:1}) // 3*x+1
math.rationalize('x+x+x+y',{})    // 3*x+y

const ret = math.rationalize('x+x+x+y',{},true)
              // ret.expression=3*x+y, ret.variables = ["x","y"]
const ret = math.rationalize('-2+5x^2',{},true)
              // ret.expression=5*x^2-2, ret.variables = ["x"], ret.coefficients=[-2,0,5]
```


## Integrate (symbolic)

The function `math.integrate` performs rule-based symbolic integration:

```js
// power rule
console.log(math.integrate('x^2', 'x').toString())        // '1/3 * x^3'
// trig rules
console.log(math.integrate('sin(x)', 'x').toString())     // '-cos(x)'
console.log(math.integrate('cos(x)', 'x').toString())     // 'sin(x)'
// polynomial
console.log(math.integrate('3x^2 + 2x + 1', 'x').toString()) // 'x^3 + x^2 + x'
```

`math.integrate` operates on the expression AST and returns a `Node`, so results can be further simplified or evaluated:

```js
const indef = math.integrate('x^2', 'x')
console.log(math.simplify(indef).toString())  // '(x^3) / 3'
```


## Solve (symbolic)

The function `math.solve` solves equations symbolically:

```js
// solve for x: x^2 - 4 = 0
console.log(math.solve('x^2 - 4', 'x'))      // [2, -2]
// solve linear equation
console.log(math.solve('2x + 6', 'x'))        // [-3]
// solve quadratic via quadratic formula
console.log(math.solve('x^2 - 5x + 6', 'x')) // [3, 2]
```


## Factor (symbolic)

The function `math.factor` factors polynomial expressions symbolically:

```js
console.log(math.factor('x^2 - 4').toString())          // '(x - 2) * (x + 2)'
console.log(math.factor('x^2 + 5x + 6').toString())     // '(x + 2) * (x + 3)'
console.log(math.factor('2x^2 - 8').toString())         // '2 * (x - 2) * (x + 2)'
```


## fullSimplify

The function `math.fullSimplify` applies multiple simplification strategies and returns the shortest result:

```js
console.log(math.fullSimplify('sin(x)^2 + cos(x)^2').toString()) // '1'
console.log(math.fullSimplify('(x^2 - 1) / (x - 1)').toString()) // 'x + 1'
```

Internally, `fullSimplify` runs `simplify`, `trigReduce`, `expand` followed by `simplify`, and `rationalize` — then selects the result with the lowest `leafCount`.


## Laplace Transforms

```js
// forward Laplace transform
console.log(math.laplace('t^2', 't', 's').toString())          // '2 / s^3'
console.log(math.laplace('exp(-a*t)', 't', 's').toString())    // '1 / (s + a)'
console.log(math.laplace('sin(w*t)', 't', 's').toString())     // 'w / (s^2 + w^2)'

// inverse Laplace transform
console.log(math.inverseLaplace('1/s', 's', 't').toString())   // '1'
console.log(math.inverseLaplace('1/s^2', 's', 't').toString()) // 't'
```


## Limit (symbolic)

```js
console.log(math.limit('sin(x)/x', 'x', 0).toString())         // '1'
console.log(math.limit('(x^2-1)/(x-1)', 'x', 1).toString())    // '2'
console.log(math.limit('1/x', 'x', Infinity).toString())        // '0'
```


## Series (Taylor)

```js
// Taylor series around x=0 to order n
console.log(math.taylor('sin(x)', 'x', 0, 5).toString())
// 'x - 1/6 * x^3 + 1/120 * x^5'

console.log(math.taylor('exp(x)', 'x', 0, 4).toString())
// '1 + x + 1/2 * x^2 + 1/6 * x^3 + 1/24 * x^4'
```


## Polynomial Algebra

Math.js provides a complete set of polynomial algebra functions:

```js
// GCD and LCM
math.polynomialGCD('x^2 - 1', 'x - 1')       // 'x - 1'
math.polynomialLCM('x^2 - 1', 'x + 1')       // '(x - 1) * (x + 1)^2 / (x + 1)'

// Division
math.polynomialQuotient('x^2 - 1', 'x - 1')  // 'x + 1'
math.polynomialRemainder('x^2 - 1', 'x - 1') // '0'

// Groebner basis (for elimination theory)
math.groebnerBasis(['x^2 + y - 1', 'x + y^2 - 1'], ['x', 'y'])
```


## Gröbner Basis

`math.groebnerBasis` computes a Gröbner basis using Buchberger's algorithm, supporting up to 2 variables. This enables solving polynomial systems and variable elimination:

```js
const basis = math.groebnerBasis(
  ['x^2 + y^2 - 1', 'x - y'],
  ['x', 'y']
)
// basis contains polynomials from which x and y can be eliminated
```


## Assumptions & Domain Constraints

The `assume` and `element` functions let you register variable domain assumptions, which affect simplification results:

```js
math.assume('x', 'positive')
math.assume('n', 'integer')
math.element('z', 'Complex')

// With assumptions, simplify can produce tighter results
console.log(math.simplify('sqrt(x^2)').toString())  // 'x'  (since x > 0)
```

The `piecewise` function creates conditional expressions:

```js
const expr = math.piecewise('x^2', 'x >= 0', '-x^2', 'x < 0')
console.log(expr.evaluate({x: 3}))   // 9
console.log(expr.evaluate({x: -2}))  // -4
```


## Trigonometric Transformations

```js
// Expand using angle-addition formulas
math.trigExpand('sin(x + y)').toString()  // 'sin(x)*cos(y) + cos(x)*sin(y)'

// Reduce products to sums
math.trigReduce('sin(x)*cos(x)').toString()  // '1/2 * sin(2*x)'

// Convert between exponential and trig representations
math.trigToExp('cos(x)').toString()  // '(exp(i*x) + exp(-i*x)) / 2'
math.expToTrig('exp(i*x)').toString() // 'cos(x) + i*sin(x)'
```


## Further Reading

- [Full function reference (444+ functions)](https://danielsimonjr.github.io/mathjs/) — online API docs with types, parameters, and examples
- [Expression trees](expression_trees.md) — how to work with parsed expression ASTs
- [Differentiation rules (Wikipedia)](https://en.wikipedia.org/wiki/Differentiation_rules)
- [Strategies for simplifying math expressions (Stackoverflow)](https://stackoverflow.com/questions/7540227/strategies-for-simplifying-math-expressions)
- [Computer algebra system (Wikipedia)](https://en.wikipedia.org/wiki/Computer_algebra_system)
