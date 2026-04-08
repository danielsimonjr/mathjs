export const chebyshevApproxDocs = {
  name: 'chebyshevApprox',
  category: 'Numeric',
  syntax: [
    'chebyshevApprox(f, a, b, n)'
  ],
  description: 'Compute a Chebyshev polynomial approximation of function f on [a, b] using n terms. Samples f at Chebyshev nodes and computes coefficients via the discrete cosine transform. Evaluates using Clenshaw\'s algorithm for numerical stability. Returns an object with a coefficients array and an evaluate(x) method.',
  examples: [
    'chebyshevApprox(sin, 0, pi, 10)'
  ],
  seealso: ['padeApproximant', 'polyfit', 'cspline']
}
