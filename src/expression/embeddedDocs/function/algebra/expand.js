export const expandDocs = {
  name: 'expand',
  category: 'Algebra',
  syntax: ['expand(expr)'],
  description:
    'Expand an algebraic expression by distributing multiplication over addition and expanding integer powers. Returns the expanded form of the expression.',
  examples: [
    'expand("(x + 1)^2")',
    'expand("(x + 1) * (x - 1)")',
    'expand("2 * (x + y)")'
  ],
  seealso: ['simplify', 'rationalize']
}
