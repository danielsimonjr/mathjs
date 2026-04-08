export const rbfInterpolateDocs = {
  name: 'rbfInterpolate',
  category: 'Numeric',
  syntax: [
    'rbfInterpolate(points, values, kernel)'
  ],
  description: 'Radial Basis Function (RBF) interpolation for scattered data in any dimension. Fits weights by solving a linear system, then evaluates f(x) = sum_i w_i * phi(||x - x_i||). Available kernels: "gaussian", "multiquadric", "inverseMultiquadric", "thinPlateSpline". Returns an object with an evaluate(point) method.',
  examples: [
    'rbfInterpolate([[0],[1],[2]], [0,1,4], "gaussian")',
    'rbfInterpolate([[0,0],[1,0],[0,1],[1,1]], [0,1,1,2], "multiquadric")'
  ],
  seealso: ['interpolate', 'cspline', 'griddata']
}
