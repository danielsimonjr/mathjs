export const assumeDocs = {
  name: 'assume',
  category: 'Algebra',
  syntax: ['assume(variable, property)'],
  description:
    'Declare an assumption about a symbolic variable. Valid properties: positive, negative, integer, real, complex, nonnegative, nonzero. Assumptions are stored globally and can be used by reduce().',
  examples: [
    'assume("x", "positive")',
    'assume("n", "integer")',
    'assume("z", "complex")'
  ],
  seealso: ['element', 'reduce', 'simplify']
}
