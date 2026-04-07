export const fresnelCDocs = {
  name: 'fresnelC',
  category: 'Special',
  syntax: ['fresnelC(x)'],
  description: 'Compute the Fresnel cosine integral C(x) = integral from 0 to x of cos(pi * t^2 / 2) dt. Approaches 0.5 as x -> Infinity.',
  examples: ['fresnelC(0)', 'fresnelC(1)', 'fresnelC(-1)', 'fresnelC(Infinity)'],
  seealso: ['fresnelS', 'erf', 'erfi', 'erfc']
}
