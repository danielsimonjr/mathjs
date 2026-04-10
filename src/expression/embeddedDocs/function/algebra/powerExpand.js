export const powerExpandDocs = {
  name: 'powerExpand',
  category: 'Algebra',
  syntax: ['powerExpand(expr)'],
  description:
    'Expand powers and logarithms assuming arguments are positive real numbers. Distributes (a*b)^n->a^n*b^n, (a^m)^n->a^(m*n), log(a*b)->log(a)+log(b), and similar rules.',
  examples: [
    'powerExpand("(x * y)^3")',
    'powerExpand("(a^2)^3")',
    'powerExpand("log(x * y)")',
    'powerExpand("log(x / y)")'
  ],
  seealso: ['expand', 'simplify', 'combine']
}
