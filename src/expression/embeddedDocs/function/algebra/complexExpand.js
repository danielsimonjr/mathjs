export const complexExpandDocs = {
  name: 'complexExpand',
  category: 'Algebra',
  syntax: ['complexExpand(expr, variables)'],
  description:
    'Expand an expression treating the listed variables as complex numbers. Substitutes each variable x with x_re + i*x_im, expands, and separates into real and imaginary parts.',
  examples: [
    'complexExpand("z^2", ["z"])',
    'complexExpand("z * w", ["z", "w"])'
  ],
  seealso: ['expand', 'simplify']
}
