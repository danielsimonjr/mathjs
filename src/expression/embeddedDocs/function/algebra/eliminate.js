export const eliminateDocs = {
  name: 'eliminate',
  category: 'Algebra',
  syntax: ['eliminate(equations, variablesToEliminate)'],
  description:
    'Eliminate specified variables from a system of polynomial equations using resultants. For each variable to eliminate, computes resultants between pairs of equations to produce equations in the remaining variables.',
  examples: [
    'eliminate(["x + y - 1", "x - y"], ["x"])',
    'eliminate(["x^2 + y^2 - 1", "x - y"], ["x"])'
  ],
  seealso: ['resultant', 'groebnerBasis', 'solve']
}
