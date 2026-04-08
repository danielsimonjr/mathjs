export const polygonPerimeterDocs = {
  name: 'polygonPerimeter',
  category: 'Geometry',
  syntax: [
    'polygonPerimeter(vertices)'
  ],
  description: 'Calculates the perimeter of a polygon by summing the Euclidean distances between consecutive vertices, including the closing edge from the last vertex back to the first.',
  examples: [
    'polygonPerimeter([[0,0],[3,0],[3,4],[0,4]])',
    'polygonPerimeter([[0,0],[1,0],[0.5,0.866]])'
  ],
  seealso: ['area', 'centroid', 'convexHull']
}
