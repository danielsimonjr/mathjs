export const curlDocs = {
  name: 'curl',
  category: 'Algebra',
  syntax: [
    'curl(field, variables)'
  ],
  description: 'Compute the symbolic curl of a 3D vector field. The curl is defined as [dF3/dy - dF2/dz, dF1/dz - dF3/dx, dF2/dx - dF1/dy]. Both field and variables must have exactly 3 elements.',
  examples: [],
  seealso: [
    'divergence', 'gradientSymbolic', 'derivative'
  ]
}
