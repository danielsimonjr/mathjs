export const bsplineDocs = {
  name: 'bspline',
  category: 'Numeric',
  syntax: [
    'bspline(knots, controlPoints, degree, t)'
  ],
  description: 'Evaluate a B-spline curve at parameter t using De Boor\'s algorithm. The knot vector must be non-decreasing with length equal to controlPoints.length + degree + 1. Returns the point on the curve (a number for scalar control points, or an array for vector control points).',
  examples: [
    'bspline([0,0,0,1,1,1], [[0,0],[1,1],[2,0]], 2, 0.5)',
    'bspline([0,0,1,2,3,3], [[0],[1],[2],[3]], 1, 1.5)'
  ],
  seealso: ['interpolate', 'cspline', 'bezierCurve']
}
