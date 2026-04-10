export const piecewiseDocs = {
  name: 'piecewise',
  category: 'Algebra',
  syntax: [
    'piecewise(pairs, defaultValue)',
    'piecewise(pairs, defaultValue, scope)'
  ],
  description:
    'Build and evaluate a piecewise-defined expression. Given an array of [condition, value] pairs and a default value, evaluates each condition in order and returns the value of the first matching condition, or the default if none match.',
  examples: [
    'piecewise([["x > 0", "x"], ["x < 0", "-x"]], "0", {x: 5})',
    'piecewise([["x > 0", "x"], ["x < 0", "-x"]], "0", {x: -3})',
    'piecewise([["x > 0", "x"], ["x < 0", "-x"]], "0", {x: 0})'
  ],
  seealso: ['evaluate', 'parse', 'simplify']
}
