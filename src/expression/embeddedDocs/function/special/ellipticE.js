export const ellipticEDocs = {
  name: 'ellipticE',
  category: 'Special',
  syntax: [
    'ellipticE(m)'
  ],
  description: 'Compute the complete elliptic integral of the second kind E(m), where m is the parameter (m = k^2). Uses the Arithmetic-Geometric Mean algorithm.',
  examples: [
    'ellipticE(0)',
    'ellipticE(0.5)',
    'ellipticE(1)'
  ],
  seealso: ['ellipticK']
}
