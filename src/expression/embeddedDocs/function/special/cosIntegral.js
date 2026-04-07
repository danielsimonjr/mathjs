export const cosIntegralDocs = {
  name: 'cosIntegral',
  category: 'Special',
  syntax: ['cosIntegral(x)'],
  description: 'Compute the cosine integral Ci(x) = gamma + ln(x) + integral from 0 to x of (cos(t)-1)/t dt, where gamma is the Euler-Mascheroni constant. Defined for x > 0.',
  examples: ['cosIntegral(1)', 'cosIntegral(2)', 'cosIntegral(pi)'],
  seealso: ['sinIntegral', 'expIntegralEi']
}
