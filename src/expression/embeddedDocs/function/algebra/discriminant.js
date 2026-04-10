export const discriminantDocs = {
  name: 'discriminant',
  category: 'Algebra',
  syntax: ['discriminant(polynomial, variable)'],
  description:
    'Compute the discriminant of a polynomial. For quadratic ax^2+bx+c: disc = b^2-4ac. For cubic: disc = 18abcd-4b^3d+b^2c^2-4ac^3-27a^2d^2. For higher degrees, uses the resultant of p and its derivative.',
  examples: [
    'discriminant("x^2 + 2*x + 1", "x")',
    'discriminant("x^2 - 4", "x")',
    'discriminant("x^2 - x - 6", "x")'
  ],
  seealso: ['coefficientList', 'solve', 'resultant']
}
