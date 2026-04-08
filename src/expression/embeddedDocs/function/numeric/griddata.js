export const griddataDocs = {
  name: 'griddata',
  category: 'Numeric',
  syntax: [
    'griddata(points, values, xi)',
    'griddata(points, values, xi, method)'
  ],
  description: 'Interpolate scattered data at query points using the specified method. Methods: "nearest" (nearest-neighbor), "linear" (inverse distance weighting, IDW), "natural" (IDW with squared distances). Works in any dimension. Returns an array of interpolated values at each query point.',
  examples: [
    'griddata([[0],[1],[2]], [0,1,4], [[0.5],[1.5]])',
    'griddata([[0,0],[1,0],[0,1],[1,1]], [0,1,1,2], [[0.5,0.5]], "nearest")'
  ],
  seealso: ['interpolate', 'rbfInterpolate', 'cspline']
}
