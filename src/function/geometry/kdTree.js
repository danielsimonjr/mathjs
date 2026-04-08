import { factory } from '../../utils/factory.js'

const name = 'kdTree'
const dependencies = ['typed']

export const createKdTree = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Builds a k-d tree from a set of points for efficient nearest-neighbor
   * and range queries. The tree alternates split dimensions at each level
   * and splits on the median point for balance.
   *
   * Returns an object with two query methods:
   *  - nearest(point, k): returns the k nearest neighbors as [[point, dist], ...]
   *  - rangeSearch(point, radius): returns all points within the given radius
   *
   * Syntax:
   *
   *    math.kdTree(points)
   *
   * Examples:
   *
   *    const tree = math.kdTree([[0,0],[1,0],[0,1],[1,1],[0.5,0.5]])
   *    tree.nearest([0.4, 0.4], 1)
   *    // Returns [[[0.5, 0.5], ...]]
   *
   *    tree.rangeSearch([0, 0], 1.1)
   *    // Returns points within radius 1.1 of [0, 0]
   *
   * @param {Array} points    Array of 2D points [[x0,y0],[x1,y1],...]
   * @return {Object}         Object with nearest(point, k) and rangeSearch(point, radius)
   */
  return typed(name, {
    Array: function (points) {
      if (!Array.isArray(points) || points.length === 0) {
        throw new TypeError('Argument must be a non-empty array of points')
      }
      for (let i = 0; i < points.length; i++) {
        if (!Array.isArray(points[i]) || points[i].length < 1) {
          throw new TypeError('Each point must be an array of coordinates')
        }
        for (let d = 0; d < points[i].length; d++) {
          if (typeof points[i][d] !== 'number') {
            throw new TypeError('Point coordinates must be numbers')
          }
        }
      }

      const dim = points[0].length

      // KD-tree node: {point, left, right, depth}
      const buildTree = function (pts, depth) {
        if (pts.length === 0) return null
        const axis = depth % dim
        // Sort by current axis and pick median
        const sorted = pts.slice().sort(function (a, b) { return a[0][axis] - b[0][axis] })
        const mid = Math.floor(sorted.length / 2)
        return {
          point: sorted[mid][0],
          index: sorted[mid][1],
          axis,
          left: buildTree(sorted.slice(0, mid), depth + 1),
          right: buildTree(sorted.slice(mid + 1), depth + 1)
        }
      }

      const indexed = points.map(function (p, i) { return [p, i] })
      const root = buildTree(indexed, 0)

      const distSq = function (a, b) {
        let s = 0
        for (let d = 0; d < a.length; d++) {
          const dd = a[d] - b[d]
          s += dd * dd
        }
        return s
      }

      // Nearest neighbor search: returns k nearest as [{point, dist}]
      const nearestSearch = function (node, target, k, heap) {
        if (node === null) return
        const d2 = distSq(node.point, target)
        // heap is a max-heap array of {d2, point}
        if (heap.length < k || d2 < heap[0].d2) {
          heap.push({ d2, point: node.point, index: node.index })
          // Sort descending so heap[0] is the worst
          heap.sort(function (a, b) { return b.d2 - a.d2 })
          if (heap.length > k) heap.shift()
        }
        const axis = node.axis
        const diff = target[axis] - node.point[axis]
        const near = diff <= 0 ? node.left : node.right
        const far = diff <= 0 ? node.right : node.left
        nearestSearch(near, target, k, heap)
        // Only explore far side if it could have closer points
        const worstD2 = heap.length < k ? Infinity : heap[0].d2
        if (diff * diff < worstD2) {
          nearestSearch(far, target, k, heap)
        }
      }

      // Range search
      const rangeSearchNode = function (node, target, r2, result) {
        if (node === null) return
        const d2 = distSq(node.point, target)
        if (d2 <= r2) {
          result.push({ point: node.point, dist: Math.sqrt(d2), index: node.index })
        }
        const axis = node.axis
        const diff = target[axis] - node.point[axis]
        if (diff * diff <= r2) {
          rangeSearchNode(node.left, target, r2, result)
          rangeSearchNode(node.right, target, r2, result)
        } else if (diff <= 0) {
          rangeSearchNode(node.left, target, r2, result)
        } else {
          rangeSearchNode(node.right, target, r2, result)
        }
      }

      return {
        nearest: function (point, k) {
          if (!Array.isArray(point) || point.length !== dim) {
            throw new TypeError('query point must match the dimension of the tree points')
          }
          const kk = k === undefined ? 1 : k
          const heap = []
          nearestSearch(root, point, kk, heap)
          heap.sort(function (a, b) { return a.d2 - b.d2 })
          return heap.map(function (h) { return [h.point, Math.sqrt(h.d2)] })
        },
        rangeSearch: function (point, radius) {
          if (!Array.isArray(point) || point.length !== dim) {
            throw new TypeError('query point must match the dimension of the tree points')
          }
          if (typeof radius !== 'number' || radius < 0) {
            throw new TypeError('radius must be a non-negative number')
          }
          const result = []
          rangeSearchNode(root, point, radius * radius, result)
          result.sort(function (a, b) { return a.dist - b.dist })
          return result.map(function (r) { return r.point })
        }
      }
    }
  })
})
