export const integerDigitsDocs = {
  name: 'integerDigits',
  category: 'Combinatorics',
  syntax: [
    'integerDigits(n)',
    'integerDigits(n, base)'
  ],
  description: 'Return the digits of a non-negative integer in a given base (default 10), most significant digit first.',
  examples: [
    'integerDigits(123)',
    'integerDigits(255, 16)',
    'integerDigits(10, 2)',
    'integerDigits(0)'
  ],
  seealso: ['primePi', 'prime', 'primeFactors']
}
