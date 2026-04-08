export const inverseLaplaceTransformDocs = {
  name: 'inverseLaplaceTransform',
  category: 'Algebra',
  syntax: [
    'inverseLaplaceTransform(expr, sVar, tVar)'
  ],
  description: 'Compute the inverse Laplace transform using a lookup table of known transform pairs. Supported patterns include: 1/s → 1, 1/s^2 → t, c/s^n → c*t^(n-1)/(n-1)!, 1/(s-a) → e^(at), s/(s^2+b^2) → cos(bt), b/(s^2+b^2) → sin(bt), s/(s^2-a^2) → cosh(at), a/(s^2-a^2) → sinh(at). Sums are handled term by term.',
  examples: [
    'inverseLaplaceTransform("1/s", "s", "t")',
    'inverseLaplaceTransform("1/s^2", "s", "t")',
    'inverseLaplaceTransform("1/(s - 2)", "s", "t")',
    'inverseLaplaceTransform("s/(s^2 + 4)", "s", "t")',
    'inverseLaplaceTransform("2/(s^2 + 4)", "s", "t")'
  ],
  seealso: ['apart', 'simplify']
}
