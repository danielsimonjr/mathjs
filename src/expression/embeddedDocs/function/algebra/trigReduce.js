export const trigReduceDocs = {
  name: 'trigReduce',
  category: 'Algebra',
  syntax: ['trigReduce(expr)'],
  description:
    'Reduce products of trigonometric functions to sums using product-to-sum identities. Inverse of trigExpand. Applies sin^2, cos^2 half-angle and product formulas.',
  examples: [
    'trigReduce("sin(x)^2")',
    'trigReduce("cos(x)^2")',
    'trigReduce("sin(x) * cos(x)")',
    'trigReduce("sin(a) * sin(b)")'
  ],
  seealso: ['trigExpand', 'simplify']
}
