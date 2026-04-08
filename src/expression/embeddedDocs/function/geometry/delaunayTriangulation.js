export const delaunayTriangulationDocs = {
  name: 'delaunayTriangulation',
  category: 'Geometry',
  syntax: [
    'delaunayTriangulation(points)'
  ],
  description: 'Computes the Delaunay triangulation of a set of 2D points using the Bowyer-Watson algorithm. Returns an array of triangles, each represented as three indices into the original points array.',
  examples: [
    'delaunayTriangulation([[0,0],[1,0],[1,1],[0,1]])',
    'delaunayTriangulation([[0,0],[2,0],[1,2]])'
  ],
  seealso: ['convexHull', 'voronoiDiagram', 'area']
}
