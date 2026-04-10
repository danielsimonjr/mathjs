export const reduceDocs = {
  name: 'reduce',
  category: 'Algebra',
  syntax: [
    'reduce(expr, variable)',
    'reduce(expr, variable, domain)'
  ],
  description:
    'Solve an equation with domain constraints. Calls solve() and filters solutions by the specified domain or by assumptions stored via assume(). Valid domains: Positive, Negative, Nonnegative, Nonzero, Integer, Real, Complex, Rational.',
  examples: [
    'reduce("x^2 - 1", "x", "Positive")',
    'reduce("x^2 - 4", "x", "Negative")',
    'reduce("x^2 - 9", "x", "Integer")'
  ],
  seealso: ['solve', 'assume', 'element']
}
