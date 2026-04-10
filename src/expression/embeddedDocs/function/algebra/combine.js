export const combineDocs = {
  name: 'combine',
  category: 'Algebra',
  syntax: ['combine(expr)'],
  description:
    'Combine like terms and apply logarithm/power product rules. Inverse of expand for patterns like log(a)+log(b)->log(a*b), a^n*a^m->a^(n+m).',
  examples: [
    'combine("log(a) + log(b)")',
    'combine("log(a) - log(b)")',
    'combine("x^2 * x^3")',
    'combine("2 * log(x)")'
  ],
  seealso: ['expand', 'simplify', 'powerExpand']
}
