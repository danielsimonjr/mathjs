export const partitionsDocs = {
  name: 'partitions',
  category: 'Combinatorics',
  syntax: [
    'partitions(n)'
  ],
  description:
    'Count the number of integer partitions of n (P(n)). ' +
    'P(n) is the number of ways to write n as an unordered sum of positive integers. ' +
    'Uses Euler\'s pentagonal number theorem recurrence.',
  examples: [
    'partitions(0)',
    'partitions(1)',
    'partitions(4)',
    'partitions(10)'
  ],
  seealso: ['combinations', 'bellNumbers', 'stirlingS2']
}
