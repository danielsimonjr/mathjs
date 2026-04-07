export const residueDocs = {
  name: 'residue',
  category: 'Numeric',
  syntax: [
    'residue(num, den)'
  ],
  description: 'Compute the residues and poles of a rational function P(s)/Q(s) given polynomial coefficient arrays (highest power first). For each simple pole p_i: residue = P(p_i) / Q\'(p_i). Returns an object with residues and poles arrays.',
  examples: [
    'residue([1], [1, -3, 2])',
    'residue([1], [1, 0, -1])',
    'residue([2, 1], [1, -1, -2])'
  ],
  seealso: ['zpk2tf', 'freqz', 'polyfit']
}
