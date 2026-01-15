/**
 * WASM-optimized Schur decomposition
 *
 * Computes the real Schur form A = Q * T * Q^T where:
 * - Q is orthogonal
 * - T is quasi-upper triangular (block upper triangular with 1x1 and 2x2 blocks)
 *
 * Based on Francis double-shift QR algorithm
 */

/**
 * Compute the real Schur decomposition of a square matrix
 * A = Q * T * Q^T
 *
 * @param A - Input matrix (n x n, row-major)
 * @param n - Size of the matrix
 * @param maxIter - Maximum iterations per eigenvalue
 * @param tol - Convergence tolerance
 * @returns Packed result [Q...(n*n), T...(n*n)] or empty if failed
 */
export function schur(
  A: Float64Array,
  n: i32,
  maxIter: i32,
  tol: f64
): Float64Array {
  if (n <= 0) {
    return new Float64Array(0)
  }

  // Initialize Q as identity
  const Q = new Float64Array(n * n)
  for (let i: i32 = 0; i < n; i++) {
    Q[i * n + i] = 1.0
  }

  // Copy A to T (will be transformed to upper triangular)
  const T = new Float64Array(n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    T[i] = A[i]
  }

  // First reduce to upper Hessenberg form
  hessenberg(T, Q, n)

  // Apply Francis QR iteration
  let p: i32 = n - 1 // Current deflation point

  while (p > 0) {
    // Check for deflation
    const q: i32 = p - 1
    let deflated: boolean = false

    // Check if T[p, p-1] is small enough
    const scale: f64 = Math.abs(T[p * n + p]) + Math.abs(T[q * n + q])
    if (
      Math.abs(T[p * n + q]) < tol * scale ||
      Math.abs(T[p * n + q]) < 1e-14
    ) {
      T[p * n + q] = 0.0
      p--
      deflated = true
    }

    if (!deflated) {
      // Find start of active block
      let l: i32 = 0
      for (let i: i32 = q; i > 0; i--) {
        const scaleI: f64 =
          Math.abs(T[i * n + i]) + Math.abs(T[(i - 1) * n + (i - 1)])
        if (
          Math.abs(T[i * n + (i - 1)]) < tol * scaleI ||
          Math.abs(T[i * n + (i - 1)]) < 1e-14
        ) {
          T[i * n + (i - 1)] = 0.0
          l = i
          break
        }
      }

      // Apply Francis double-shift QR step
      let converged: boolean = false
      for (let iter: i32 = 0; iter < maxIter && !converged; iter++) {
        // Wilkinson shift using 2x2 block at bottom
        const a11: f64 = T[q * n + q]
        const a12: f64 = T[q * n + p]
        const a21: f64 = T[p * n + q]
        const a22: f64 = T[p * n + p]

        // Eigenvalues of 2x2 block
        const trace: f64 = a11 + a22
        const det: f64 = a11 * a22 - a12 * a21

        // First column of (A - s1*I)(A - s2*I) = A^2 - trace*A + det*I
        let x: f64 =
          T[l * n + l] * T[l * n + l] +
          T[l * n + (l + 1)] * T[(l + 1) * n + l] -
          trace * T[l * n + l] +
          det
        let y: f64 =
          T[(l + 1) * n + l] * (T[l * n + l] + T[(l + 1) * n + (l + 1)] - trace)
        let z: f64 =
          l + 2 <= p ? T[(l + 2) * n + (l + 1)] * T[(l + 1) * n + l] : 0.0

        // Apply Householder transformations
        for (let k: i32 = l; k < p; k++) {
          // Create Householder reflector for [x, y, z]
          const size: i32 = k < p - 1 ? 3 : 2

          let norm: f64 = 0.0
          if (size === 3) {
            norm = Math.sqrt(x * x + y * y + z * z)
          } else {
            norm = Math.sqrt(x * x + y * y)
          }

          if (norm > 1e-14) {
            const sign: f64 = x >= 0 ? 1.0 : -1.0
            const u1: f64 = x + sign * norm

            // Apply from left: T = H * T
            for (let j: i32 = k; j < n; j++) {
              let dot: f64 = u1 * T[k * n + j] + y * T[(k + 1) * n + j]
              if (size === 3) {
                dot += z * T[(k + 2) * n + j]
              }
              const tau: f64 =
                (2.0 * dot) / (u1 * u1 + y * y + (size === 3 ? z * z : 0.0))
              T[k * n + j] -= tau * u1
              T[(k + 1) * n + j] -= tau * y
              if (size === 3) {
                T[(k + 2) * n + j] -= tau * z
              }
            }

            // Apply from right: T = T * H
            const jEnd: i32 = k + size < p + 1 ? k + size + 1 : p + 1
            for (let i: i32 = 0; i < jEnd; i++) {
              let dot: f64 = u1 * T[i * n + k] + y * T[i * n + (k + 1)]
              if (size === 3) {
                dot += z * T[i * n + (k + 2)]
              }
              const tau: f64 =
                (2.0 * dot) / (u1 * u1 + y * y + (size === 3 ? z * z : 0.0))
              T[i * n + k] -= tau * u1
              T[i * n + (k + 1)] -= tau * y
              if (size === 3) {
                T[i * n + (k + 2)] -= tau * z
              }
            }

            // Accumulate Q: Q = Q * H
            for (let i: i32 = 0; i < n; i++) {
              let dot: f64 = u1 * Q[i * n + k] + y * Q[i * n + (k + 1)]
              if (size === 3) {
                dot += z * Q[i * n + (k + 2)]
              }
              const tau: f64 =
                (2.0 * dot) / (u1 * u1 + y * y + (size === 3 ? z * z : 0.0))
              Q[i * n + k] -= tau * u1
              Q[i * n + (k + 1)] -= tau * y
              if (size === 3) {
                Q[i * n + (k + 2)] -= tau * z
              }
            }
          }

          // Set up for next iteration
          if (k < p - 1) {
            x = T[(k + 1) * n + k]
            y = T[(k + 2) * n + k]
            z = k + 3 <= p ? T[(k + 3) * n + k] : 0.0
          }
        }

        // Check convergence
        const scaleCheck: f64 = Math.abs(T[p * n + p]) + Math.abs(T[q * n + q])
        if (
          Math.abs(T[p * n + q]) < tol * scaleCheck ||
          Math.abs(T[p * n + q]) < 1e-14
        ) {
          T[p * n + q] = 0.0
          converged = true
        }
      }

      // Deflate
      p--
    }
  }

  // Clean up small subdiagonal elements
  for (let i: i32 = 1; i < n; i++) {
    const scale: f64 =
      Math.abs(T[i * n + i]) + Math.abs(T[(i - 1) * n + (i - 1)])
    if (Math.abs(T[i * n + (i - 1)]) < tol * scale) {
      T[i * n + (i - 1)] = 0.0
    }
  }

  // Pack result
  const result = new Float64Array(2 * n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    result[i] = Q[i]
    result[n * n + i] = T[i]
  }

  return result
}

/**
 * Reduce matrix to upper Hessenberg form using Householder reflections
 */
function hessenberg(A: Float64Array, Q: Float64Array, n: i32): void {
  for (let k: i32 = 0; k < n - 2; k++) {
    let norm: f64 = 0.0
    for (let i: i32 = k + 1; i < n; i++) {
      norm += A[i * n + k] * A[i * n + k]
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-14) continue

    const sign: f64 = A[(k + 1) * n + k] >= 0 ? 1.0 : -1.0
    const u1: f64 = A[(k + 1) * n + k] + sign * norm

    const v = new Float64Array(n - k - 1)
    v[0] = 1.0
    for (let i: i32 = 1; i < n - k - 1; i++) {
      v[i] = A[(k + 1 + i) * n + k] / u1
    }

    let vDotV: f64 = 0.0
    for (let i: i32 = 0; i < n - k - 1; i++) {
      vDotV += v[i] * v[i]
    }
    const tau: f64 = 2.0 / vDotV

    for (let j: i32 = k; j < n; j++) {
      let dot: f64 = 0.0
      for (let i: i32 = 0; i < n - k - 1; i++) {
        dot += v[i] * A[(k + 1 + i) * n + j]
      }
      dot *= tau
      for (let i: i32 = 0; i < n - k - 1; i++) {
        A[(k + 1 + i) * n + j] -= dot * v[i]
      }
    }

    for (let i: i32 = 0; i < n; i++) {
      let dot: f64 = 0.0
      for (let j: i32 = 0; j < n - k - 1; j++) {
        dot += v[j] * A[i * n + (k + 1 + j)]
      }
      dot *= tau
      for (let j: i32 = 0; j < n - k - 1; j++) {
        A[i * n + (k + 1 + j)] -= dot * v[j]
      }
    }

    for (let i: i32 = 0; i < n; i++) {
      let dot: f64 = 0.0
      for (let j: i32 = 0; j < n - k - 1; j++) {
        dot += v[j] * Q[i * n + (k + 1 + j)]
      }
      dot *= tau
      for (let j: i32 = 0; j < n - k - 1; j++) {
        Q[i * n + (k + 1 + j)] -= dot * v[j]
      }
    }
  }
}

export function getSchurQ(result: Float64Array, n: i32): Float64Array {
  const Q = new Float64Array(n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    Q[i] = result[i]
  }
  return Q
}

export function getSchurT(result: Float64Array, n: i32): Float64Array {
  const T = new Float64Array(n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    T[i] = result[n * n + i]
  }
  return T
}

export function schurEigenvalues(T: Float64Array, n: i32): Float64Array {
  const real = new Float64Array(n)
  const imag = new Float64Array(n)

  let i: i32 = 0
  while (i < n) {
    if (i === n - 1 || Math.abs(T[(i + 1) * n + i]) < 1e-14) {
      real[i] = T[i * n + i]
      imag[i] = 0.0
      i++
    } else {
      const a: f64 = T[i * n + i]
      const b: f64 = T[i * n + (i + 1)]
      const c: f64 = T[(i + 1) * n + i]
      const d: f64 = T[(i + 1) * n + (i + 1)]

      const trace: f64 = a + d
      const det: f64 = a * d - b * c
      const disc: f64 = trace * trace - 4.0 * det

      if (disc >= 0) {
        const sqrtDisc: f64 = Math.sqrt(disc)
        real[i] = (trace + sqrtDisc) / 2.0
        real[i + 1] = (trace - sqrtDisc) / 2.0
        imag[i] = 0.0
        imag[i + 1] = 0.0
      } else {
        const sqrtNegDisc: f64 = Math.sqrt(-disc)
        real[i] = trace / 2.0
        real[i + 1] = trace / 2.0
        imag[i] = sqrtNegDisc / 2.0
        imag[i + 1] = -sqrtNegDisc / 2.0
      }
      i += 2
    }
  }

  const result = new Float64Array(2 * n)
  for (let j: i32 = 0; j < n; j++) {
    result[j] = real[j]
    result[n + j] = imag[j]
  }

  return result
}

export function schurResidual(
  A: Float64Array,
  Q: Float64Array,
  T: Float64Array,
  n: i32
): f64 {
  const QT = new Float64Array(n * n)
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += Q[i * n + k] * T[k * n + j]
      }
      QT[i * n + j] = sum
    }
  }

  let residual: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += QT[i * n + k] * Q[j * n + k]
      }
      const diff: f64 = sum - A[i * n + j]
      residual += diff * diff
    }
  }

  return Math.sqrt(residual)
}

export function schurOrthogonalityError(Q: Float64Array, n: i32): f64 {
  let error: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let dot: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        dot += Q[k * n + i] * Q[k * n + j]
      }
      const expected: f64 = i === j ? 1.0 : 0.0
      const diff: f64 = dot - expected
      error += diff * diff
    }
  }

  return Math.sqrt(error)
}
