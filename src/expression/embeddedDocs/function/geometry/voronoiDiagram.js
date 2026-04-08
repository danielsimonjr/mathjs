export const voronoiDiagramDocs = {
  name: 'voronoiDiagram',
  category: 'Geometry',
  syntax: [
    'voronoiDiagram(points)',
    'voronoiDiagram(points, bounds)'
  ],
  description: 'Computes the Voronoi diagram of a set of 2D points as the dual of the Delaunay triangulation. Returns an object with vertices (circumcenters) and cells (ordered polygon vertex lists per input point).',
  examples: [
    'voronoiDiagram([[0,0],[1,0],[0.5,1]])',
    'voronoiDiagram([[0,0],[1,0],[1,1],[0,1]])'
  ],
  seealso: ['delaunayTriangulation', 'convexHull']
}
