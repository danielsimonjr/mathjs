export const centroidDocs = {
  name: 'centroid',
  category: 'Geometry',
  syntax: [
    'centroid(points)'
  ],
  description: 'Computes the centroid of a polygon or point cloud. For polygons (3+ vertices), uses the signed-area weighted formula. For point clouds, returns the arithmetic mean of all coordinates.',
  examples: [
    'centroid([[0,0],[4,0],[4,3],[0,3]])',
    'centroid([[0,0],[6,0],[3,3]])'
  ],
  seealso: ['area', 'polygonPerimeter', 'convexHull']
}
