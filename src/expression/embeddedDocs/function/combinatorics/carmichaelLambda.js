export const carmichaelLambdaDocs = {
  name: 'carmichaelLambda',
  category: 'Combinatorics',
  syntax: [
    'carmichaelLambda(n)'
  ],
  description: "Compute the Carmichael function lambda(n): the smallest positive m such that a^m is congruent to 1 mod n for all a coprime to n.",
  examples: [
    'carmichaelLambda(1)',
    'carmichaelLambda(8)',
    'carmichaelLambda(12)',
    'carmichaelLambda(15)'
  ],
  seealso: ['eulerPhi', 'moebiusMu', 'primeFactors']
}
