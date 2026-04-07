export const erfiDocs = {
  name: 'erfi',
  category: 'Special',
  syntax: ['erfi(x)'],
  description: 'Compute the imaginary error function erfi(x) = -i * erf(ix) = (2/sqrt(pi)) * integral from 0 to x of exp(t^2) dt. Unlike erf, erfi is unbounded.',
  examples: ['erfi(0)', 'erfi(1)', 'erfi(-1)', 'erfi(0.5)'],
  seealso: ['erf', 'erfc', 'fresnelS']
}
