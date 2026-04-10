export const trigToExpDocs = {
  name: 'trigToExp',
  category: 'Algebra',
  syntax: ['trigToExp(expr)'],
  description:
    'Convert trigonometric and hyperbolic functions to exponential form. Applies sin(x)->(exp(i*x)-exp(-i*x))/(2*i), cos(x)->(exp(i*x)+exp(-i*x))/2, and hyperbolic equivalents.',
  examples: [
    'trigToExp("cos(x)")',
    'trigToExp("sin(x)")',
    'trigToExp("sinh(x)")',
    'trigToExp("cosh(x)")'
  ],
  seealso: ['expToTrig', 'simplify']
}
