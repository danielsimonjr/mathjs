export const logIntegralDocs = {
  name: 'logIntegral',
  category: 'Special',
  syntax: ['logIntegral(x)'],
  description: 'Compute the logarithmic integral li(x) = integral from 0 to x of 1/ln(t) dt. Computed via li(x) = Ei(ln(x)). Returns -Infinity at x=1. Defined for x > 0.',
  examples: ['logIntegral(2)', 'logIntegral(10)', 'logIntegral(100)'],
  seealso: ['expIntegralEi']
}
