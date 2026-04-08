import { factory } from '../../utils/factory.js'

const name = 'delaunayTriangulation'
const dependencies = ['typed']

export const createDelaunayTriangulation = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Computes the Delaunay triangulation of a set of 2D points using the
   * Bowyer-Watson incremental insertion algorithm. Returns an array of triangles,
   * where each triangle is represented as an array of three indices into the
   * original points array.
   *
   * Syntax:
   *
   *    math.delaunayTriangulation(points)
   *
   * Examples:
   *
   *    math.delaunayTriangulation([[0,0],[1,0],[1,1],[0,1]])
   *    // Returns two triangles, e.g. [[0,1,2],[0,2,3]]
   *
   * @param {Array} points    Array of 2D points [[x0,y0],[x1,y1],...]
   * @return {Array}          Array of triangles [[i,j,k],...] with indices into points
   */
  return typed(name, {
    Array: function (points) {
      if (!Array.isArray(points) || points.length < 3) {
        throw new TypeError('Argument must be an array of at least 3 points')
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

      // Compute circumcircle of triangle (ax,ay),(bx,by),(cx,cy)
      // Returns {cx, cy, r2} where r2 = radius squared
      const circumcircle = function (ax, ay, bx, by, cx, cy) {
        const dx = bx - ax
        const dy = by - ay
        const ex = cx - ax
        const ey = cy - ay
        const bl = dx * dx + dy * dy
        const cl = ex * ex + ey * ey
        const d = 0.5 / (dx * ey - dy * ex)
        const x = ax + (ey * bl - dy * cl) * d
        const y = ay + (dx * cl - ex * bl) * d
        const r2 = (ax - x) * (ax - x) + (ay - y) * (ay - y)
        return { cx: x, cy: y, r2 }
      }

      // Check if point (px,py) is inside circumcircle
      const inCircumcircle = function (circ, px, py) {
        const dx = px - circ.cx
        const dy = py - circ.cy
        return dx * dx + dy * dy < circ.r2 - 1e-10
      }

      // Find bounding box
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

      const dx = maxX - minX
      const dy = maxY - minY
      const deltaMax = dx > dy ? dx : dy
      const midX = (minX + maxX) / 2
      const midY = (minY + maxY) / 2

      // Super-triangle vertices (appended after real points)
      const st0 = [midX - 20 * deltaMax, midY - deltaMax]
      const st1 = [midX, midY + 20 * deltaMax]
      const st2 = [midX + 20 * deltaMax, midY - deltaMax]

      // Working points: real points + 3 super-triangle vertices
      const pts = points.slice()
      const si = n // super-triangle vertex indices
      const sj = n + 1
      const sk = n + 2
      pts.push(st0, st1, st2)

      // Each triangle: [i, j, k, circumcircle]
      const circ0 = circumcircle(st0[0], st0[1], st1[0], st1[1], st2[0], st2[1])
      let triangles = [{ v: [si, sj, sk], circ: circ0 }]

      for (let p = 0; p < n; p++) {
        const px = pts[p][0]
        const py = pts[p][1]

        // Find all triangles whose circumcircle contains point p
        const bad = []
        const keep = []
        for (let t = 0; t < triangles.length; t++) {
          if (inCircumcircle(triangles[t].circ, px, py)) {
            bad.push(triangles[t])
          } else {
            keep.push(triangles[t])
          }
        }

        // Find the boundary polygon of the bad triangles (edges not shared)
        const polygon = []
        for (let b = 0; b < bad.length; b++) {
          const tv = bad[b].v
          const edges = [
            [tv[0], tv[1]],
            [tv[1], tv[2]],
            [tv[2], tv[0]]
          ]
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

        // Re-triangulate with point p
        triangles = keep
        for (let e = 0; e < polygon.length; e++) {
          const ei = polygon[e][0]
          const ej = polygon[e][1]
          const ax = pts[ei][0]
          const ay = pts[ei][1]
          const bx = pts[ej][0]
          const by = pts[ej][1]
          const circ = circumcircle(ax, ay, bx, by, px, py)
          triangles.push({ v: [ei, ej, p], circ })
        }
      }

      // Remove triangles that share a vertex with the super-triangle
      const result = []
      for (let t = 0; t < triangles.length; t++) {
        const tv = triangles[t].v
        if (tv[0] >= n || tv[1] >= n || tv[2] >= n) continue
        result.push([tv[0], tv[1], tv[2]])
      }

      return result
    }
  })
})
