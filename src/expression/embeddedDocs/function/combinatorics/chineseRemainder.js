export const chineseRemainderDocs = {
  name: 'chineseRemainder',
  category: 'Combinatorics',
  syntax: [
    'chineseRemainder(remainders, moduli)'
  ],
  description:
    'Solve a system of congruences using the Chinese Remainder Theorem. ' +
    'Given pairwise coprime moduli [m0, m1, ...] and remainders [r0, r1, ...], ' +
    'finds the unique x in [0, m0*m1*...) such that x mod mi = ri for all i.',
  examples: [
    'chineseRemainder([2, 3, 2], [3, 5, 7])',
    'chineseRemainder([1, 2], [3, 5])',
    'chineseRemainder([0], [7])'
  ],
  seealso: ['gcd', 'lcm', 'mod']
}
