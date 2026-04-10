export const trigExpandDocs = {
  name: 'trigExpand',
  category: 'Algebra',
  syntax: ['trigExpand(expr)'],
  description:
    'Expand trigonometric expressions using angle addition formulas: sin(a+b), cos(a+b), tan(a+b), and double-angle identities like sin(2*x).',
  examples: [
    'trigExpand("sin(a + b)")',
    'trigExpand("cos(a + b)")',
    'trigExpand("sin(2 * x)")',
    'trigExpand("tan(a + b)")'
  ],
  seealso: ['trigReduce', 'simplify']
}
