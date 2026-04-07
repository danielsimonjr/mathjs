export const ellipticKDocs = {
  name: 'ellipticK',
  category: 'Special',
  syntax: [
    'ellipticK(m)'
  ],
  description: 'Compute the complete elliptic integral of the first kind K(m), where m is the parameter (m = k^2). Uses the Arithmetic-Geometric Mean algorithm.',
  examples: [
    'ellipticK(0)',
    'ellipticK(0.5)',
    'ellipticK(0.9)'
  ],
  seealso: ['ellipticE']
}
