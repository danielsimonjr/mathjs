export const fresnelSDocs = {
  name: 'fresnelS',
  category: 'Special',
  syntax: ['fresnelS(x)'],
  description: 'Compute the Fresnel sine integral S(x) = integral from 0 to x of sin(pi * t^2 / 2) dt. Approaches 0.5 as x -> Infinity.',
  examples: ['fresnelS(0)', 'fresnelS(1)', 'fresnelS(-1)', 'fresnelS(Infinity)'],
  seealso: ['erf', 'erfi', 'erfc']
}
