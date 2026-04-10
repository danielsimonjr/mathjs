export const differencesDocs = {
  name: 'differences',
  category: 'Algebra',
  syntax: [
    'differences(sequence)',
    'differences(sequence, order)'
  ],
  description: 'Compute finite differences of a numeric sequence. First differences give the discrete analog of the derivative: Δa[i] = a[i+1] - a[i]. Higher-order differences are computed by applying the operator repeatedly.',
  examples: [
    'differences([1, 4, 9, 16, 25])',
    'differences([1, 4, 9, 16, 25], 2)',
    'differences([1, 2, 4, 8, 16], 1)'
  ],
  seealso: [
    'derivative', 'taylor', 'cumsum'
  ]
}
