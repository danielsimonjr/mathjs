export const bezierCurveDocs = {
  name: 'bezierCurve',
  category: 'Numeric',
  syntax: [
    'bezierCurve(controlPoints, t)'
  ],
  description: "Evaluate a Bezier curve at parameter t using De Casteljau's algorithm. controlPoints is an array of [x,y] or [x,y,z] points. t must be in [0, 1]. Returns the point on the curve at parameter t.",
  examples: [
    'bezierCurve([[0,0],[1,1],[2,0]], 0.5)',
    'bezierCurve([[0,0],[0,1],[1,1],[1,0]], 0.5)'
  ],
  seealso: ['interpolate', 'cspline']
}
