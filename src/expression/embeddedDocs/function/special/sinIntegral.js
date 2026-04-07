export const sinIntegralDocs = {
  name: 'sinIntegral',
  category: 'Special',
  syntax: ['sinIntegral(x)'],
  description: 'Compute the sine integral Si(x) = integral from 0 to x of sin(t)/t dt. Approaches pi/2 as x -> Infinity.',
  examples: ['sinIntegral(0)', 'sinIntegral(1)', 'sinIntegral(pi)'],
  seealso: ['cosIntegral', 'expIntegralEi']
}
