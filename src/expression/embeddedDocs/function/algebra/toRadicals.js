export const toRadicalsDocs = {
  name: 'toRadicals',
  category: 'Algebra',
  syntax: [
    'toRadicals(expr)'
  ],
  description: 'Convert expressions containing fractional powers to explicit radical form. x^(1/2) becomes sqrt(x), x^(1/3) becomes cbrt(x), x^(p/q) becomes nthRoot(x^p, q). Numeric values are simplified where possible.',
  examples: [
    'toRadicals("x^(1/2)")',
    'toRadicals("x^(1/3)")',
    'toRadicals("x^(2/3)")',
    'toRadicals("4^(1/2)")'
  ],
  seealso: [
    'simplify', 'parse', 'minimalPolynomial'
  ]
}
