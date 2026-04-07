export const coordinateTransformDocs = {
  name: 'coordinateTransform',
  category: 'Geometry',
  syntax: [
    'coordinateTransform(point, from, to)'
  ],
  description: 'Transforms a point between coordinate systems. Supported systems: "cartesian", "polar", "spherical", "cylindrical". For polar: [r, theta]. For spherical (ISO): [r, theta, phi] where theta is the inclination and phi is the azimuth. For cylindrical: [rho, phi, z].',
  examples: [
    'coordinateTransform([1, 0], "cartesian", "polar")',
    'coordinateTransform([0, 1], "cartesian", "polar")',
    'coordinateTransform([1, 0], "polar", "cartesian")',
    'coordinateTransform([1, 2, 3], "cartesian", "cylindrical")'
  ],
  seealso: ['distance']
}
