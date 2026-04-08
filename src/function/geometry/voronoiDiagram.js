import { factory } from '../../utils/factory.js'

const name = 'voronoiDiagram'
const dependencies = ['typed']

export const createVoronoiDiagram = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Computes the Voronoi diagram of a set of 2D points as the dual of the
   * Delaunay triangulation. Each Voronoi cell is the region of the plane
   * closer to that input point than any other. Returns an object with
   * `vertices` (the circumcenters of Delaunay triangles) and `cells`
   * (ordered polygon vertex-index lists per input point).
   *
   * Syntax:
   *
   *    math.voronoiDiagram(points)
   *    math.voronoiDiagram(points, bounds)
   *
   * Examples:
   *
   *    math.voronoiDiagram([[0,0],[1,0],[0.5,1]])
   *    // Returns {vertices: [...], cells: [...]}
   *
   * @param {Array} points    Array of 2D points [[x0,y0],[x1,y1],...]
   * @param {Array} [bounds]  Optional bounding box [minX, minY, maxX, maxY]
   * @return {Object}         {vertices: number[][], cells: number[][][]}
   */
  return typed(name, {
    Array: function (points) {
      return _voronoi(points, null)
    },
    'Array, Array': function (points, bounds) {
      return _voronoi(points, bounds)
    }
  })

  function _voronoi (points, bounds) {
    if (!Array.isArray(points) || points.length < 2) {
      throw new TypeError('Argument must be an array of at least 2 points')
    }
    for (let i = 0; i < points.length; i++) {
      if (!Array.isArray(points[i]) || points[i].length !== 2) {
        throw new TypeError('Each point must be a 2D coordinate [x, y]')
      }
      if (typeof points[i][0] !== 'number' || typeof points[i][1] !== 'number') {
        throw new TypeError('Point coordinates must be numbers')
      }
    }

    const n = points.length

    // Compute circumcircle center of triangle with vertices at pts[a], pts[b], pts[c]
    const circumcenter = function (pts, a, b, c) {
      const ax = pts[a][0]
      const ay = pts[a][1]
      const bx = pts[b][0]
      const by = pts[b][1]
      const cx = pts[c][0]
      const cy = pts[c][1]
      const dx = bx - ax
      const dy = by - ay
      const ex = cx - ax
      const ey = cy - ay
      const bl = dx * dx + dy * dy
      const cl = ex * ex + ey * ey
      const d = 0.5 / (dx * ey - dy * ex)
      return [ax + (ey * bl - dy * cl) * d, ay + (dx * cl - ex * bl) * d]
    }

    // Delaunay triangulation (Bowyer-Watson, inline)
    const inCircumcircle = function (ax, ay, bx, by, cx, cy, px, py) {
      const dx = bx - ax
      const dy = by - ay
      const ex = cx - ax
      const ey = cy - ay
      const bl = dx * dx + dy * dy
      const cl = ex * ex + ey * ey
      const d = 0.5 / (dx * ey - dy * ex)
      const ox = ax + (ey * bl - dy * cl) * d
      const oy = ay + (dx * cl - ex * bl) * d
      const r2 = (ax - ox) * (ax - ox) + (ay - oy) * (ay - oy)
      const dpx = px - ox
      const dpy = py - oy
      return dpx * dpx + dpy * dpy < r2 - 1e-10
    }

    let minX = points[0][0]
    let minY = points[0][1]
    let maxX = minX
    let maxY = minY
    for (let i = 1; i < n; i++) {
      if (points[i][0] < minX) minX = points[i][0]
      if (points[i][1] < minY) minY = points[i][1]
      if (points[i][0] > maxX) maxX = points[i][0]
      if (points[i][1] > maxY) maxY = points[i][1]
    }

    if (bounds) {
      if (!Array.isArray(bounds) || bounds.length !== 4) {
        throw new TypeError('bounds must be an array [minX, minY, maxX, maxY]')
      }
      minX = bounds[0]
      minY = bounds[1]
      maxX = bounds[2]
      maxY = bounds[3]
    }

    const deltaMax = Math.max(maxX - minX, maxY - minY)
    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2

    const si = n
    const sj = n + 1
    const sk = n + 2
    const allPts = points.slice()
    allPts.push(
      [midX - 20 * deltaMax, midY - deltaMax],
      [midX, midY + 20 * deltaMax],
      [midX + 20 * deltaMax, midY - deltaMax]
    )

    const getCirc = function (tv) {
      return inCircumcircle
        ? { v: tv }
        : null
    }

    // triangle list: each entry {v: [i,j,k]}
    let tris = [{ v: [si, sj, sk] }]

    for (let p = 0; p < n; p++) {
      const px = allPts[p][0]
      const py = allPts[p][1]

      const bad = []
      const keep = []
      for (let t = 0; t < tris.length; t++) {
        const tv = tris[t].v
        const ax = allPts[tv[0]][0]
        const ay = allPts[tv[0]][1]
        const bx = allPts[tv[1]][0]
        const by = allPts[tv[1]][1]
        const cx = allPts[tv[2]][0]
        const cy = allPts[tv[2]][1]
        if (inCircumcircle(ax, ay, bx, by, cx, cy, px, py)) {
          bad.push(tris[t])
        } else {
          keep.push(tris[t])
        }
      }

      const polygon = []
      for (let b = 0; b < bad.length; b++) {
        const tv = bad[b].v
        const edges = [[tv[0], tv[1]], [tv[1], tv[2]], [tv[2], tv[0]]]
        for (let e = 0; e < 3; e++) {
          const edge = edges[e]
          let shared = false
          for (let b2 = 0; b2 < bad.length; b2++) {
            if (b2 === b) continue
            const tv2 = bad[b2].v
            if (
              (tv2[0] === edge[0] && tv2[1] === edge[1]) ||
              (tv2[1] === edge[0] && tv2[0] === edge[1]) ||
              (tv2[0] === edge[0] && tv2[2] === edge[1]) ||
              (tv2[2] === edge[0] && tv2[0] === edge[1]) ||
              (tv2[1] === edge[0] && tv2[2] === edge[1]) ||
              (tv2[2] === edge[0] && tv2[1] === edge[1])
            ) {
              shared = true
              break
            }
          }
          if (!shared) polygon.push(edge)
        }
      }

      tris = keep
      for (let e = 0; e < polygon.length; e++) {
        tris.push({ v: [polygon[e][0], polygon[e][1], p] })
      }
    }

    // Remove super-triangle triangles
    const delaunayTris = []
    for (let t = 0; t < tris.length; t++) {
      const tv = tris[t].v
      if (tv[0] >= n || tv[1] >= n || tv[2] >= n) continue
      delaunayTris.push(tv)
    }

    // Voronoi vertices = circumcenters of Delaunay triangles
    const voronoiVerts = []
    for (let t = 0; t < delaunayTris.length; t++) {
      const tv = delaunayTris[t]
      voronoiVerts.push(circumcenter(points, tv[0], tv[1], tv[2]))
    }

    // Build adjacency: for each input point, which triangle indices contain it?
    const pointToTris = []
    for (let i = 0; i < n; i++) pointToTris.push([])
    for (let t = 0; t < delaunayTris.length; t++) {
      const tv = delaunayTris[t]
      pointToTris[tv[0]].push(t)
      pointToTris[tv[1]].push(t)
      pointToTris[tv[2]].push(t)
    }

    // Order the triangles around each input point (CCW)
    const cells = []
    for (let p = 0; p < n; p++) {
      const tIndices = pointToTris[p]
      if (tIndices.length === 0) {
        cells.push([])
        continue
      }

      // Sort triangle indices by angle of circumcenter around point p
      const px = points[p][0]
      const py = points[p][1]
      const sorted = tIndices.slice().sort(function (a, b) {
        const va = voronoiVerts[a]
        const vb = voronoiVerts[b]
        const angA = Math.atan2(va[1] - py, va[0] - px)
        const angB = Math.atan2(vb[1] - py, vb[0] - px)
        return angA - angB
      })

      cells.push(sorted.map(function (ti) { return voronoiVerts[ti].slice() }))
    }

    return { vertices: voronoiVerts, cells }
  }
})
