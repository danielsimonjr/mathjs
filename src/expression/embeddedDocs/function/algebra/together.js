export const togetherDocs = {
  name: 'together',
  category: 'Algebra',
  syntax: ['together(expr)'],
  description:
    'Combine fractions over a common denominator. This is the inverse of apart: it takes a sum of fractions and combines them into a single rational expression.',
  examples: [
    'together("1/(x-1) + 1/(x+1)")',
    'together("1/x + 1/y")',
    'together("a/b + c/d")'
  ],
  seealso: ['apart', 'simplify', 'rationalize']
}
