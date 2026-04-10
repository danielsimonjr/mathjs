export const fullSimplifyDocs = {
  name: 'fullSimplify',
  category: 'Algebra',
  syntax: ['fullSimplify(expr)', 'fullSimplify(expr, options)'],
  description:
    'Aggressively simplify an expression by applying multiple strategies (basic simplify, trig identities, expand, rationalize) and returning the result with the fewest nodes.',
  examples: [
    'fullSimplify("sin(x)^2 + cos(x)^2")',
    'fullSimplify("(x^2 - 1) / (x - 1)")',
    'fullSimplify("2*x + 3*x")'
  ],
  seealso: ['simplify', 'expand', 'rationalize']
}
