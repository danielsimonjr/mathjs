export const variablesDocs = {
  name: 'variables',
  category: 'Algebra',
  syntax: ['variables(expr)'],
  description:
    'Extract all symbolic variable names from an expression. Walks the AST and collects SymbolNode names, excluding known mathematical constants (pi, e, i) and built-in function names. Returns a sorted array of unique variable names.',
  examples: [
    'variables("x^2 + y*z + pi")',
    'variables("a*sin(b) + c")',
    'variables("3*x + 2")'
  ],
  seealso: ['parse', 'simplify', 'derivative']
}
