export const areaDocs = {
  name: 'area',
  category: 'Geometry',
  syntax: [
    'area(vertices)'
  ],
  description: 'Calculates the area of a polygon given its vertices using the shoelace formula. The vertices should be provided in order (clockwise or counterclockwise) as an array of 2D points.',
  examples: [
    'area([[0,0], [4,0], [4,3], [0,3]])',
    'area([[0,0], [3,0], [0,4]])',
    'area([[0,0], [1,0], [1,1], [0,1]])'
  ],
  seealso: ['distance', 'convexHull']
}
