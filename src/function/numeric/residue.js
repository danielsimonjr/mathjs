import { factory } from '../../utils/factory.js'

const name = 'residue'
const dependencies = ['typed']

export const createResidue = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the residues and poles of a rational function P(s)/Q(s)
   * given as polynomial coefficient arrays (highest power first).
   *
   * For a simple pole p_i:  residue = P(p_i) / Q'(p_i)
   *
   * Poles are found analytically for denominator degree <= 2, and by the
   * companion matrix / QR eigenvalue method for higher degrees.
   *
   * Syntax:
   *
   *    math.residue(num, den)
   *
   * Examples:
   *
   *    math.residue([1], [1, -3, 2])
   *    // 1/((s-1)(s-2)) => { residues: [-1, 1], poles: [1, 2] }
   *
   *    math.residue([1], [1, 0, -1])
   *    // 1/(s^2-1) => { residues: [-0.5, 0.5], poles: [-1, 1] }
   *
   * See also:
   *
   *    zpk2tf, freqz, polyfit
   *
   * @param {Array} num  Numerator polynomial coefficients [highest power first]
   * @param {Array} den  Denominator polynomial coefficients [highest power first]
   * @return {Object}    { residues: Array, poles: Array }
   */
  return typed(name, {
    'Array, Array': function (num, den) {
      return _residue(num, den)
    }
  })

  /**
   * Evaluate polynomial with coefficients c (highest power first) at point x.
   * Supports real or complex x ({re, im} objects).
   */
  function _polyEval (c, x) {
    if (typeof x === 'number') {
      let result = 0
      for (let i = 0; i < c.length; i++) {
        result = result * x + (c[i] || 0)
      }
      return result
    }
    // Complex x
    let re = 0
    let im = 0
    for (let i = 0; i < c.length; i++) {
      const newRe = re * x.re - im * x.im + (c[i] || 0)
      const newIm = re * x.im + im * x.re
      re = newRe
      im = newIm
    }
    return { re, im }
  }

  /**
   * Compute derivative polynomial coefficients.
   * d/ds [a_n s^n + ... + a_0] = [n*a_n, (n-1)*a_{n-1}, ..., a_1]
   */
  function _polyDeriv (c) {
    const deg = c.length - 1
    const d = []
    for (let i = 0; i < deg; i++) {
      d.push(c[i] * (deg - i))
    }
    return d
  }

  /**
   * Find roots of a polynomial with real coefficients using:
   * - degree 1: direct
   * - degree 2: quadratic formula
   * - higher: companion matrix + Francis QR iteration
   */
  function _polyRoots (c) {
    // Strip leading zeros
    let start = 0
    while (start < c.length - 1 && Math.abs(c[start]) < 1e-14) start++
    const a = c.slice(start)
    const deg = a.length - 1

    if (deg === 0) return []

    if (deg === 1) {
      return [-a[1] / a[0]]
    }

    if (deg === 2) {
      const A = a[0]; const B = a[1]; const C = a[2]
      const disc = B * B - 4 * A * C
      if (disc >= 0) {
        const sqrtD = Math.sqrt(disc)
        return [(-B + sqrtD) / (2 * A), (-B - sqrtD) / (2 * A)]
      } else {
        const sqrtD = Math.sqrt(-disc)
        return [
          { re: -B / (2 * A), im: sqrtD / (2 * A) },
          { re: -B / (2 * A), im: -sqrtD / (2 * A) }
        ]
      }
    }

    // General case: companion matrix eigenvalues via Francis QR
    return _companionRoots(a)
  }

  /**
   * Find eigenvalues of the companion matrix using Francis double-shift QR.
   * Returns array of numbers or {re, im} objects.
   */
  function _companionRoots (a) {
    const n = a.length - 1
    const lead = a[0]

    // Build companion matrix (n x n) stored as flat row-major array
    // C[i][j]: last row = -a[n..1]/a[0], C[i][i+1] = 1 for i < n-1
    const C = []
    for (let i = 0; i < n; i++) {
      C.push(new Array(n).fill(0))
    }
    for (let j = 0; j < n; j++) {
      C[n - 1][j] = -a[n - j] / lead
    }
    for (let i = 0; i < n - 1; i++) {
      C[i][i + 1] = 1
    }

    // Francis QR iteration (implicit double shift) on upper Hessenberg form
    // First balance and reduce to Hessenberg
    _balanceMatrix(C, n)
    _toHessenberg(C, n)

    const roots = _francisQR(C, n)
    return roots
  }

  function _balanceMatrix (H, n) {
    // Radix-2 balancing
    const RADIX = 2
    const MAX_BALANCE_ITER = 1000
    let converged = false
    let balanceIter = 0
    while (!converged && balanceIter < MAX_BALANCE_ITER) {
      balanceIter++
      converged = true
      for (let i = 0; i < n; i++) {
        let r = 0; let c = 0
        for (let j = 0; j < n; j++) {
          if (j !== i) {
            c += Math.abs(H[j][i])
            r += Math.abs(H[i][j])
          }
        }
        if (c === 0 || r === 0) continue
        let g = r / RADIX
        let f = 1
        const s = c + r
        while (c < g) { f *= RADIX; c *= RADIX * RADIX }
        g = r * RADIX
        while (c > g) { f /= RADIX; c /= RADIX * RADIX }
        if ((c + r) / f < 0.95 * s) {
          converged = false
          const invF = 1 / f
          for (let j = 0; j < n; j++) H[i][j] *= invF
          for (let j = 0; j < n; j++) H[j][i] *= f
        }
      }
    }
  }

  function _toHessenberg (H, n) {
    for (let k = 0; k < n - 2; k++) {
      // Find pivot
      let maxVal = 0; let maxIdx = k + 1
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(H[i][k]) > maxVal) { maxVal = Math.abs(H[i][k]); maxIdx = i }
      }
      if (maxVal < 1e-14) continue
      if (maxIdx !== k + 1) {
        // Swap rows k+1 and maxIdx
        const tmp = H[k + 1]; H[k + 1] = H[maxIdx]; H[maxIdx] = tmp
        // Swap cols k+1 and maxIdx
        for (let i = 0; i < n; i++) {
          const t = H[i][k + 1]; H[i][k + 1] = H[i][maxIdx]; H[i][maxIdx] = t
        }
      }
      for (let i = k + 2; i < n; i++) {
        const tau = H[i][k] / H[k + 1][k]
        if (Math.abs(tau) < 1e-14) continue
        for (let j = k; j < n; j++) H[i][j] -= tau * H[k + 1][j]
        for (let j = 0; j < n; j++) H[j][k + 1] += tau * H[j][i]
      }
    }
  }

  function _francisQR (H, n) {
    const MAX_ITER = 100 * n
    const roots = []
    let size = n

    for (let iter = 0; iter < MAX_ITER && size > 0; iter++) {
      // Check for converged eigenvalue at bottom
      if (size === 1) {
        roots.push(H[0][0])
        break
      }

      // Check subdiagonal for deflation
      let deflated = false
      for (let i = size - 1; i >= 1; i--) {
        if (Math.abs(H[i][i - 1]) < 1e-10 * (Math.abs(H[i - 1][i - 1]) + Math.abs(H[i][i]))) {
          H[i][i - 1] = 0
          if (i === size - 1) {
            roots.push(H[size - 1][size - 1])
            size--
            deflated = true
            break
          }
        }
      }
      if (deflated) { iter = 0; continue }

      // Check for 2x2 block at bottom
      if (size >= 2 && Math.abs(H[size - 1][size - 2]) < 1e-10 * (Math.abs(H[size - 2][size - 2]) + Math.abs(H[size - 1][size - 1]))) {
        H[size - 1][size - 2] = 0
        roots.push(H[size - 1][size - 1])
        size--
        iter = 0
        continue
      }

      // Francis double-shift QR step
      const s = H[size - 2][size - 2] + H[size - 1][size - 1]
      const t = H[size - 2][size - 2] * H[size - 1][size - 1] - H[size - 2][size - 1] * H[size - 1][size - 2]

      let x = H[0][0] * H[0][0] + H[0][1] * H[1][0] - s * H[0][0] + t
      let y = H[1][0] * (H[0][0] + H[1][1] - s)
      let z = size >= 3 ? H[2][1] * H[1][0] : 0

      for (let k = 0; k < size - 2; k++) {
        // Householder reflector for [x, y, z]
        const norm = Math.sqrt(x * x + y * y + z * z)
        if (norm < 1e-14) break
        const sign = x >= 0 ? 1 : -1
        const u1 = x + sign * norm
        const u2 = y; const u3 = z
        const r = Math.sqrt(u1 * u1 + u2 * u2 + u3 * u3)
        if (r < 1e-14) break
        const v1 = u1 / r; const v2 = u2 / r; const v3 = u3 / r

        // Apply from left
        const q = k > 0 ? k - 1 : 0
        for (let j = q; j < size; j++) {
          const dot = v1 * H[k][j] + v2 * H[k + 1][j] + (k + 2 < size ? v3 * H[k + 2][j] : 0)
          H[k][j] -= 2 * v1 * dot
          H[k + 1][j] -= 2 * v2 * dot
          if (k + 2 < size) H[k + 2][j] -= 2 * v3 * dot
        }
        // Apply from right
        const r2 = Math.min(k + 4, size)
        for (let i = 0; i < r2; i++) {
          const dot = v1 * H[i][k] + v2 * H[i][k + 1] + (k + 2 < size ? v3 * H[i][k + 2] : 0)
          H[i][k] -= 2 * v1 * dot
          H[i][k + 1] -= 2 * v2 * dot
          if (k + 2 < size) H[i][k + 2] -= 2 * v3 * dot
        }

        x = H[k + 1][k]
        y = H[k + 2][k]
        z = k + 3 < size ? H[k + 3][k] : 0
      }

      // Last 2x2 Givens rotation
      const norm2 = Math.sqrt(x * x + y * y)
      if (norm2 > 1e-14) {
        const c = x / norm2; const s2 = -y / norm2
        for (let j = size - 3; j < size; j++) {
          const tmp = c * H[size - 2][j] - s2 * H[size - 1][j]
          H[size - 1][j] = s2 * H[size - 2][j] + c * H[size - 1][j]
          H[size - 2][j] = tmp
        }
        for (let i = 0; i < size; i++) {
          const tmp = c * H[i][size - 2] - s2 * H[i][size - 1]
          H[i][size - 1] = s2 * H[i][size - 2] + c * H[i][size - 1]
          H[i][size - 2] = tmp
        }
      }
    }

    // Remaining eigenvalues: check 2x2 blocks
    for (let i = 0; i < size - 1; i += 2) {
      const a11 = H[i][i]; const a12 = H[i][i + 1]
      const a21 = H[i + 1][i]; const a22 = H[i + 1][i + 1]
      if (Math.abs(a21) < 1e-10) {
        roots.push(a11); roots.push(a22)
      } else {
        const tr = a11 + a22
        const det = a11 * a22 - a12 * a21
        const disc = tr * tr - 4 * det
        if (disc >= 0) {
          roots.push((tr + Math.sqrt(disc)) / 2)
          roots.push((tr - Math.sqrt(disc)) / 2)
        } else {
          roots.push({ re: tr / 2, im: Math.sqrt(-disc) / 2 })
          roots.push({ re: tr / 2, im: -Math.sqrt(-disc) / 2 })
        }
      }
    }
    if (size % 2 === 1) roots.push(H[size - 1][size - 1])

    return roots
  }

  function _complexDiv (a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a / b
    const are = typeof a === 'number' ? a : a.re
    const aim = typeof a === 'number' ? 0 : a.im
    const bre = typeof b === 'number' ? b : b.re
    const bim = typeof b === 'number' ? 0 : b.im
    const denom = bre * bre + bim * bim
    return { re: (are * bre + aim * bim) / denom, im: (aim * bre - are * bim) / denom }
  }

  function _residue (num, den) {
    const poles = _polyRoots(den)
    const denDeriv = _polyDeriv(den)
    const residues = poles.map(p => {
      const numVal = _polyEval(num, p)
      const denVal = _polyEval(denDeriv, p)
      const res = _complexDiv(numVal, denVal)
      // Return real number if imaginary part is negligible
      if (typeof res === 'object' && Math.abs(res.im) < 1e-9 * (Math.abs(res.re) + 1)) {
        return res.re
      }
      return res
    })
    return { residues, poles }
  }
})
