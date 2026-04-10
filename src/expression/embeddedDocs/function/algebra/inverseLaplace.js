export const inverseLaplaceDocs = {
  name: 'inverseLaplace',
  category: 'Algebra',
  syntax: [
    'inverseLaplace(expr, sVar, tVar)'
  ],
  description: 'Convenience alias for inverseLaplaceTransform. Compute the inverse Laplace transform using a lookup table of known transform pairs. Supported: 1/s → 1, 1/s^2 → t, c/s^n → c*t^(n-1)/(n-1)!, 1/(s-a) → e^(at), s/(s^2+b^2) → cos(bt), b/(s^2+b^2) → sin(bt), and more.',
  examples: [
    'inverseLaplace("1/s", "s", "t")',
    'inverseLaplace("1/s^2", "s", "t")',
    'inverseLaplace("1/(s - 2)", "s", "t")',
    'inverseLaplace("s/(s^2 + 4)", "s", "t")'
  ],
  seealso: [
    'inverseLaplaceTransform', 'laplace', 'apart'
  ]
}
