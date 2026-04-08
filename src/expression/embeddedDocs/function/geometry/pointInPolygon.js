export const pointInPolygonDocs = {
  name: 'pointInPolygon',
  category: 'Geometry',
  syntax: [
    'pointInPolygon(point, polygon)'
  ],
  description: 'Tests whether a 2D point lies inside a polygon using the ray casting algorithm. Returns true if the point is inside the polygon, false otherwise.',
  examples: [
    'pointInPolygon([0.5, 0.5], [[0,0],[1,0],[1,1],[0,1]])',
    'pointInPolygon([2, 2], [[0,0],[1,0],[1,1],[0,1]])'
  ],
  seealso: ['area', 'convexHull', 'polygonPerimeter']
}
