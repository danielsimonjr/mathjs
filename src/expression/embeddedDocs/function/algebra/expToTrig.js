export const expToTrigDocs = {
  name: 'expToTrig',
  category: 'Algebra',
  syntax: ['expToTrig(expr)'],
  description:
    'Convert exponential expressions to trigonometric or hyperbolic form using Euler\'s formula: exp(i*x) -> cos(x) + i*sin(x), and hyperbolic identities.',
  examples: [
    'expToTrig("exp(i * x)")',
    'expToTrig("(exp(x) + exp(-x)) / 2")',
    'expToTrig("(exp(x) - exp(-x)) / 2")'
  ],
  seealso: ['trigToExp', 'simplify']
}
