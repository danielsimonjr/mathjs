/**
 * WASM-optimized Schur decomposition
 *
 * Computes the real Schur form A = Q * T * Q^T where:
 * - Q is orthogonal
 * - T is quasi-upper triangular (block upper triangular with 1x1 and 2x2 blocks)
 *
 * Based on Francis double-shift QR algorithm
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Compute the real Schur decomposition of a square matrix
 * A = Q * T * Q^T
 *
 * @param APtr - Pointer to input matrix (n x n, row-major, f64)
 * @param n - Size of the matrix
 * @param maxIter - Maximum iterations per eigenvalue
 * @param tol - Convergence tolerance
 * @param QPtr - Pointer to output orthogonal matrix Q (n x n, f64)
 * @param TPtr - Pointer to output quasi-triangular matrix T (n x n, f64)
 * @param workPtr - Pointer to work buffer (at least n * n f64 values)
 * @returns 1 if successful, 0 if failed
 */
export function schur(
  APtr: usize,
  n: i32,
  maxIter: i32,
  tol: f64,
  QPtr: usize,
  TPtr: usize,
  workPtr: usize
): i32 {
  if (n <= 0) {
    return 0
  }

  const n2: i32 = n * n

  // Initialize Q as identity
  for (let i: i32 = 0; i < n2; i++) {
    store<f64>(QPtr + ((<usize>i) << 3), 0.0)
  }
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(QPtr + ((<usize>(i * n + i)) << 3), 1.0)
  }

  // Copy A to T (will be transformed to upper triangular)
  for (let i: i32 = 0; i < n2; i++) {
    store<f64>(TPtr + ((<usize>i) << 3), load<f64>(APtr + ((<usize>i) << 3)))
  }

  // First reduce to upper Hessenberg form
  hessenberg(TPtr, QPtr, n, workPtr)

  // Apply Francis QR iteration
  let p: i32 = n - 1 // Current deflation point

  while (p > 0) {
    // Check for deflation
    const q: i32 = p - 1
    let deflated: boolean = false

    // Check if T[p, p-1] is small enough
    const Tpp = load<f64>(TPtr + ((<usize>(p * n + p)) << 3))
    const Tqq = load<f64>(TPtr + ((<usize>(q * n + q)) << 3))
    const Tpq = load<f64>(TPtr + ((<usize>(p * n + q)) << 3))
    const scale: f64 = Math.abs(Tpp) + Math.abs(Tqq)
    if (Math.abs(Tpq) < tol * scale || Math.abs(Tpq) < 1e-14) {
      store<f64>(TPtr + ((<usize>(p * n + q)) << 3), 0.0)
      p--
      deflated = true
    }

    if (!deflated) {
      // Find start of active block
      let l: i32 = 0
      for (let i: i32 = q; i > 0; i--) {
        const Tii = load<f64>(TPtr + ((<usize>(i * n + i)) << 3))
        const Tim1 = load<f64>(TPtr + ((<usize>((i - 1) * n + (i - 1))) << 3))
        const TiIm1 = load<f64>(TPtr + ((<usize>(i * n + (i - 1))) << 3))
        const scaleI: f64 = Math.abs(Tii) + Math.abs(Tim1)
        if (Math.abs(TiIm1) < tol * scaleI || Math.abs(TiIm1) < 1e-14) {
          store<f64>(TPtr + ((<usize>(i * n + (i - 1))) << 3), 0.0)
          l = i
          break
        }
      }

      // Apply Francis double-shift QR step
      let converged: boolean = false
      for (let iter: i32 = 0; iter < maxIter && !converged; iter++) {
        // Wilkinson shift using 2x2 block at bottom
        const a11 = load<f64>(TPtr + ((<usize>(q * n + q)) << 3))
        const a12 = load<f64>(TPtr + ((<usize>(q * n + p)) << 3))
        const a21 = load<f64>(TPtr + ((<usize>(p * n + q)) << 3))
        const a22 = load<f64>(TPtr + ((<usize>(p * n + p)) << 3))

        // Eigenvalues of 2x2 block
        const trace: f64 = a11 + a22
        const det: f64 = a11 * a22 - a12 * a21

        // First column of (A - s1*I)(A - s2*I) = A^2 - trace*A + det*I
        const Tll = load<f64>(TPtr + ((<usize>(l * n + l)) << 3))
        const TlLp1 = load<f64>(TPtr + ((<usize>(l * n + (l + 1))) << 3))
        const TLp1l = load<f64>(TPtr + ((<usize>((l + 1) * n + l)) << 3))
        const TLp1Lp1 = load<f64>(
          TPtr + ((<usize>((l + 1) * n + (l + 1))) << 3)
        )

        let x: f64 = Tll * Tll + TlLp1 * TLp1l - trace * Tll + det
        let y: f64 = TLp1l * (Tll + TLp1Lp1 - trace)
        let z: f64 =
          l + 2 <= p
            ? load<f64>(TPtr + ((<usize>((l + 2) * n + (l + 1))) << 3)) * TLp1l
            : 0.0

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
              let dot: f64 =
                u1 * load<f64>(TPtr + ((<usize>(k * n + j)) << 3)) +
                y * load<f64>(TPtr + ((<usize>((k + 1) * n + j)) << 3))
              if (size === 3) {
                dot += z * load<f64>(TPtr + ((<usize>((k + 2) * n + j)) << 3))
              }
              const tau: f64 =
                (2.0 * dot) / (u1 * u1 + y * y + (size === 3 ? z * z : 0.0))
              store<f64>(
                TPtr + ((<usize>(k * n + j)) << 3),
                load<f64>(TPtr + ((<usize>(k * n + j)) << 3)) - tau * u1
              )
              store<f64>(
                TPtr + ((<usize>((k + 1) * n + j)) << 3),
                load<f64>(TPtr + ((<usize>((k + 1) * n + j)) << 3)) - tau * y
              )
              if (size === 3) {
                store<f64>(
                  TPtr + ((<usize>((k + 2) * n + j)) << 3),
                  load<f64>(TPtr + ((<usize>((k + 2) * n + j)) << 3)) - tau * z
                )
              }
            }

            // Apply from right: T = T * H
            const jEnd: i32 = k + size < p + 1 ? k + size + 1 : p + 1
            for (let i: i32 = 0; i < jEnd; i++) {
              let dot: f64 =
                u1 * load<f64>(TPtr + ((<usize>(i * n + k)) << 3)) +
                y * load<f64>(TPtr + ((<usize>(i * n + (k + 1))) << 3))
              if (size === 3) {
                dot += z * load<f64>(TPtr + ((<usize>(i * n + (k + 2))) << 3))
              }
              const tau: f64 =
                (2.0 * dot) / (u1 * u1 + y * y + (size === 3 ? z * z : 0.0))
              store<f64>(
                TPtr + ((<usize>(i * n + k)) << 3),
                load<f64>(TPtr + ((<usize>(i * n + k)) << 3)) - tau * u1
              )
              store<f64>(
                TPtr + ((<usize>(i * n + (k + 1))) << 3),
                load<f64>(TPtr + ((<usize>(i * n + (k + 1))) << 3)) - tau * y
              )
              if (size === 3) {
                store<f64>(
                  TPtr + ((<usize>(i * n + (k + 2))) << 3),
                  load<f64>(TPtr + ((<usize>(i * n + (k + 2))) << 3)) - tau * z
                )
              }
            }

            // Accumulate Q: Q = Q * H
            for (let i: i32 = 0; i < n; i++) {
              let dot: f64 =
                u1 * load<f64>(QPtr + ((<usize>(i * n + k)) << 3)) +
                y * load<f64>(QPtr + ((<usize>(i * n + (k + 1))) << 3))
              if (size === 3) {
                dot += z * load<f64>(QPtr + ((<usize>(i * n + (k + 2))) << 3))
              }
              const tau: f64 =
                (2.0 * dot) / (u1 * u1 + y * y + (size === 3 ? z * z : 0.0))
              store<f64>(
                QPtr + ((<usize>(i * n + k)) << 3),
                load<f64>(QPtr + ((<usize>(i * n + k)) << 3)) - tau * u1
              )
              store<f64>(
                QPtr + ((<usize>(i * n + (k + 1))) << 3),
                load<f64>(QPtr + ((<usize>(i * n + (k + 1))) << 3)) - tau * y
              )
              if (size === 3) {
                store<f64>(
                  QPtr + ((<usize>(i * n + (k + 2))) << 3),
                  load<f64>(QPtr + ((<usize>(i * n + (k + 2))) << 3)) - tau * z
                )
              }
            }
          }

          // Set up for next iteration
          if (k < p - 1) {
            x = load<f64>(TPtr + ((<usize>((k + 1) * n + k)) << 3))
            y = load<f64>(TPtr + ((<usize>((k + 2) * n + k)) << 3))
            z =
              k + 3 <= p
                ? load<f64>(TPtr + ((<usize>((k + 3) * n + k)) << 3))
                : 0.0
          }
        }

        // Check convergence
        const TppCheck = load<f64>(TPtr + ((<usize>(p * n + p)) << 3))
        const TqqCheck = load<f64>(TPtr + ((<usize>(q * n + q)) << 3))
        const TpqCheck = load<f64>(TPtr + ((<usize>(p * n + q)) << 3))
        const scaleCheck: f64 = Math.abs(TppCheck) + Math.abs(TqqCheck)
        if (
          Math.abs(TpqCheck) < tol * scaleCheck ||
          Math.abs(TpqCheck) < 1e-14
        ) {
          store<f64>(TPtr + ((<usize>(p * n + q)) << 3), 0.0)
          converged = true
        }
      }

      // Deflate
      p--
    }
  }

  // Clean up small subdiagonal elements
  for (let i: i32 = 1; i < n; i++) {
    const Tii = load<f64>(TPtr + ((<usize>(i * n + i)) << 3))
    const Tim1 = load<f64>(TPtr + ((<usize>((i - 1) * n + (i - 1))) << 3))
    const TiIm1 = load<f64>(TPtr + ((<usize>(i * n + (i - 1))) << 3))
    const scale: f64 = Math.abs(Tii) + Math.abs(Tim1)
    if (Math.abs(TiIm1) < tol * scale) {
      store<f64>(TPtr + ((<usize>(i * n + (i - 1))) << 3), 0.0)
    }
  }

  return 1
}

/**
 * Reduce matrix to upper Hessenberg form using Householder reflections
 */
function hessenberg(APtr: usize, QPtr: usize, n: i32, workPtr: usize): void {
  for (let k: i32 = 0; k < n - 2; k++) {
    let norm: f64 = 0.0
    for (let i: i32 = k + 1; i < n; i++) {
      const val = load<f64>(APtr + ((<usize>(i * n + k)) << 3))
      norm += val * val
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-14) continue

    const AKp1K = load<f64>(APtr + ((<usize>((k + 1) * n + k)) << 3))
    const sign: f64 = AKp1K >= 0 ? 1.0 : -1.0
    const u1: f64 = AKp1K + sign * norm

    // Store v in work buffer
    const vPtr = workPtr
    store<f64>(vPtr, 1.0)
    for (let i: i32 = 1; i < n - k - 1; i++) {
      store<f64>(
        vPtr + ((<usize>i) << 3),
        load<f64>(APtr + ((<usize>((k + 1 + i) * n + k)) << 3)) / u1
      )
    }

    let vDotV: f64 = 0.0
    for (let i: i32 = 0; i < n - k - 1; i++) {
      const vi = load<f64>(vPtr + ((<usize>i) << 3))
      vDotV += vi * vi
    }
    const tau: f64 = 2.0 / vDotV

    for (let j: i32 = k; j < n; j++) {
      let dot: f64 = 0.0
      for (let i: i32 = 0; i < n - k - 1; i++) {
        dot +=
          load<f64>(vPtr + ((<usize>i) << 3)) *
          load<f64>(APtr + ((<usize>((k + 1 + i) * n + j)) << 3))
      }
      dot *= tau
      for (let i: i32 = 0; i < n - k - 1; i++) {
        const idx = (<usize>((k + 1 + i) * n + j)) << 3
        store<f64>(
          APtr + idx,
          load<f64>(APtr + idx) - dot * load<f64>(vPtr + ((<usize>i) << 3))
        )
      }
    }

    for (let i: i32 = 0; i < n; i++) {
      let dot: f64 = 0.0
      for (let j: i32 = 0; j < n - k - 1; j++) {
        dot +=
          load<f64>(vPtr + ((<usize>j) << 3)) *
          load<f64>(APtr + ((<usize>(i * n + (k + 1 + j))) << 3))
      }
      dot *= tau
      for (let j: i32 = 0; j < n - k - 1; j++) {
        const idx = (<usize>(i * n + (k + 1 + j))) << 3
        store<f64>(
          APtr + idx,
          load<f64>(APtr + idx) - dot * load<f64>(vPtr + ((<usize>j) << 3))
        )
      }
    }

    for (let i: i32 = 0; i < n; i++) {
      let dot: f64 = 0.0
      for (let j: i32 = 0; j < n - k - 1; j++) {
        dot +=
          load<f64>(vPtr + ((<usize>j) << 3)) *
          load<f64>(QPtr + ((<usize>(i * n + (k + 1 + j))) << 3))
      }
      dot *= tau
      for (let j: i32 = 0; j < n - k - 1; j++) {
        const idx = (<usize>(i * n + (k + 1 + j))) << 3
        store<f64>(
          QPtr + idx,
          load<f64>(QPtr + idx) - dot * load<f64>(vPtr + ((<usize>j) << 3))
        )
      }
    }
  }
}

/**
 * Extract Q from Schur result
 * @param resultPtr - Pointer to packed result
 * @param n - Matrix size
 * @param QPtr - Pointer to output Q matrix (n x n)
 */
export function getSchurQ(resultPtr: usize, n: i32, QPtr: usize): void {
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(
      QPtr + ((<usize>i) << 3),
      load<f64>(resultPtr + ((<usize>i) << 3))
    )
  }
}

/**
 * Extract T from Schur result
 * @param resultPtr - Pointer to packed result
 * @param n - Matrix size
 * @param TPtr - Pointer to output T matrix (n x n)
 */
export function getSchurT(resultPtr: usize, n: i32, TPtr: usize): void {
  const offset: usize = (<usize>(n * n)) << 3
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(
      TPtr + ((<usize>i) << 3),
      load<f64>(resultPtr + offset + ((<usize>i) << 3))
    )
  }
}

/**
 * Compute eigenvalues from Schur form T
 * @param TPtr - Pointer to quasi-triangular T matrix (n x n)
 * @param n - Matrix size
 * @param realPtr - Pointer to real parts output (n values)
 * @param imagPtr - Pointer to imaginary parts output (n values)
 */
export function schurEigenvalues(
  TPtr: usize,
  n: i32,
  realPtr: usize,
  imagPtr: usize
): void {
  let i: i32 = 0
  while (i < n) {
    if (
      i === n - 1 ||
      Math.abs(load<f64>(TPtr + ((<usize>((i + 1) * n + i)) << 3))) < 1e-14
    ) {
      store<f64>(
        realPtr + ((<usize>i) << 3),
        load<f64>(TPtr + ((<usize>(i * n + i)) << 3))
      )
      store<f64>(imagPtr + ((<usize>i) << 3), 0.0)
      i++
    } else {
      const a = load<f64>(TPtr + ((<usize>(i * n + i)) << 3))
      const b = load<f64>(TPtr + ((<usize>(i * n + (i + 1))) << 3))
      const c = load<f64>(TPtr + ((<usize>((i + 1) * n + i)) << 3))
      const d = load<f64>(TPtr + ((<usize>((i + 1) * n + (i + 1))) << 3))

      const trace: f64 = a + d
      const det: f64 = a * d - b * c
      const disc: f64 = trace * trace - 4.0 * det

      if (disc >= 0) {
        const sqrtDisc: f64 = Math.sqrt(disc)
        store<f64>(realPtr + ((<usize>i) << 3), (trace + sqrtDisc) / 2.0)
        store<f64>(realPtr + ((<usize>(i + 1)) << 3), (trace - sqrtDisc) / 2.0)
        store<f64>(imagPtr + ((<usize>i) << 3), 0.0)
        store<f64>(imagPtr + ((<usize>(i + 1)) << 3), 0.0)
      } else {
        const sqrtNegDisc: f64 = Math.sqrt(-disc)
        store<f64>(realPtr + ((<usize>i) << 3), trace / 2.0)
        store<f64>(realPtr + ((<usize>(i + 1)) << 3), trace / 2.0)
        store<f64>(imagPtr + ((<usize>i) << 3), sqrtNegDisc / 2.0)
        store<f64>(imagPtr + ((<usize>(i + 1)) << 3), -sqrtNegDisc / 2.0)
      }
      i += 2
    }
  }
}

/**
 * Compute Schur decomposition residual ||A - Q*T*Q^T||
 * @param APtr - Original matrix (n x n)
 * @param QPtr - Orthogonal matrix Q (n x n)
 * @param TPtr - Quasi-triangular matrix T (n x n)
 * @param n - Matrix size
 * @param workPtr - Work buffer (at least n * n f64 values)
 * @returns Frobenius norm of residual
 */
export function schurResidual(
  APtr: usize,
  QPtr: usize,
  TPtr: usize,
  n: i32,
  workPtr: usize
): f64 {
  // Compute QT
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(QPtr + ((<usize>(i * n + k)) << 3)) *
          load<f64>(TPtr + ((<usize>(k * n + j)) << 3))
      }
      store<f64>(workPtr + ((<usize>(i * n + j)) << 3), sum)
    }
  }

  // Compute ||QT * Q^T - A||
  let residual: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(workPtr + ((<usize>(i * n + k)) << 3)) *
          load<f64>(QPtr + ((<usize>(j * n + k)) << 3))
      }
      const diff: f64 = sum - load<f64>(APtr + ((<usize>(i * n + j)) << 3))
      residual += diff * diff
    }
  }

  return Math.sqrt(residual)
}

/**
 * Compute orthogonality error ||Q^T * Q - I||
 * @param QPtr - Orthogonal matrix Q (n x n)
 * @param n - Matrix size
 * @returns Frobenius norm of error
 */
export function schurOrthogonalityError(QPtr: usize, n: i32): f64 {
  let error: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let dot: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        dot +=
          load<f64>(QPtr + ((<usize>(k * n + i)) << 3)) *
          load<f64>(QPtr + ((<usize>(k * n + j)) << 3))
      }
      const expected: f64 = i === j ? 1.0 : 0.0
      const diff: f64 = dot - expected
      error += diff * diff
    }
  }

  return Math.sqrt(error)
}
