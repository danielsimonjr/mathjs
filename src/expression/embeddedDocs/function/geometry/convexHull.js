export const convexHullDocs = {
  name: 'convexHull',
  category: 'Geometry',
  syntax: [
    'convexHull(points)'
  ],
  description: 'Computes the convex hull of a set of 2D points using Andrew\'s monotone chain algorithm. Returns the points forming the convex hull in counterclockwise order.',
  examples: [
    'convexHull([[0,0],[1,1],[2,0],[1,2]])',
    'convexHull([[0,0],[1,0],[1,1],[0,1]])'
  ],
  seealso: ['area', 'distance']
}
