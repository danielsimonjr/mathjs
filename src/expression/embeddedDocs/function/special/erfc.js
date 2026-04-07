export const erfcDocs = {
  name: 'erfc',
  category: 'Special',
  syntax: ['erfc(x)'],
  description: 'Compute the complementary error function erfc(x) = 1 - erf(x). Computed directly to avoid cancellation for large x.',
  examples: ['erfc(0)', 'erfc(1)', 'erfc(-1)', 'erfc(Infinity)'],
  seealso: ['erf', 'erfi', 'gamma']
}
