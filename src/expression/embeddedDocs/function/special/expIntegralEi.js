export const expIntegralEiDocs = {
  name: 'expIntegralEi',
  category: 'Special',
  syntax: [
    'expIntegralEi(x)'
  ],
  description: 'Compute the exponential integral Ei(x) = -P.V. integral from -x to infinity of e^(-t)/t dt.',
  examples: [
    'expIntegralEi(1)',
    'expIntegralEi(2)',
    'expIntegralEi(-1)'
  ],
  seealso: ['erf']
}
