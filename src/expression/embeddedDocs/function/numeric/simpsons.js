export const simpsonsDocs = {
  name: 'simpsons',
  category: 'Numeric',
  syntax: [
    'simpsons(f, a, b)',
    'simpsons(f, a, b, n)'
  ],
  description: "Numerically integrate a function using Simpson's rule. n must be even (default 100).",
  examples: [
    'g(x) = x^2',
    'simpsons(g, 0, 1)',
    'simpsons(sin, 0, pi)',
    'simpsons(exp, 0, 1, 200)'
  ],
  seealso: ['nintegrate', 'trapz']
}
