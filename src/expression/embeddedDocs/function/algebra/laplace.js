export const laplaceDocs = {
  name: 'laplace',
  category: 'Algebra',
  syntax: [
    'laplace(expr, tVar, sVar)'
  ],
  description: 'Compute the Laplace transform of an expression using a table-based approach. Supports: constants (1 -> 1/s), powers (t^n -> n!/s^(n+1)), exponentials (e^(at) -> 1/(s-a)), sine (sin(bt) -> b/(s^2+b^2)), cosine (cos(bt) -> s/(s^2+b^2)), and linearity for sums and scalar multiples.',
  examples: [
    'laplace("1", "t", "s")',
    'laplace("t^2", "t", "s")',
    'laplace("sin(t)", "t", "s")',
    'laplace("exp(2*t)", "t", "s")',
    'laplace("cos(3*t)", "t", "s")'
  ],
  seealso: [
    'derivative', 'simplify'
  ]
}
