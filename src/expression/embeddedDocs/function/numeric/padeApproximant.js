export const padeApproximantDocs = {
  name: 'padeApproximant',
  category: 'Numeric',
  syntax: [
    'padeApproximant(coeffs, m, n)'
  ],
  description: 'Compute the [m/n] Pade approximant from Taylor series coefficients. Given coefficients c[0], c[1], ... of a Taylor series, returns the rational function P(x)/Q(x) where P has degree m and Q has degree n. Often converges faster than Taylor series, especially near poles. Returns an object with numerator, denominator arrays and an evaluate(x) method.',
  examples: [
    'padeApproximant([1, 1, 0.5, 1/6, 1/24], 2, 2)'
  ],
  seealso: ['chebyshevApprox', 'polyfit']
}
