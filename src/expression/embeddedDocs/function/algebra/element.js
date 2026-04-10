export const elementDocs = {
  name: 'element',
  category: 'Algebra',
  syntax: ['element(variable, domain)'],
  description:
    'Assert that a variable belongs to a mathematical domain and record the assumption. Valid domains: Integer, Real, Rational, Complex, Positive, Negative. Returns true when the assumption is stored.',
  examples: [
    'element("x", "Integer")',
    'element("y", "Real")',
    'element("z", "Positive")'
  ],
  seealso: ['assume', 'reduce', 'simplify']
}
