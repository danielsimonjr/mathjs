export const interpolateDocs = {
  name: 'interpolate',
  category: 'Numeric',
  syntax: [
    'interpolate(points, x)',
    'interpolate(points, x, method)'
  ],
  description: "Interpolate a value at x using data points. Methods: 'linear' (default), 'lagrange', 'cubic' (natural cubic spline).",
  examples: [
    'interpolate([[0,0],[1,1],[2,4]], 0.5)',
    "interpolate([[0,0],[1,1],[2,4]], 1.5, 'lagrange')",
    "interpolate([[0,0],[1,1],[2,4]], 1.5, 'cubic')"
  ],
  seealso: ['curvefit', 'nintegrate']
}
