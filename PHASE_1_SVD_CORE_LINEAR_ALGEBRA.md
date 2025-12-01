# Phase 1: SVD & Core Linear Algebra

**Technical Implementation Guide**

This document provides detailed algorithms, pseudocode, and numerical considerations for implementing SVD-based linear algebra operations in TypeScript/WASM.

---

## 1. SVD - Singular Value Decomposition

**Goal**: Decompose matrix A (m×n) into A = U·Σ·V^T where:
- U (m×m or m×k): Left singular vectors (orthogonal)
- Σ (m×n or k×k): Diagonal matrix of singular values σ₁ ≥ σ₂ ≥ ... ≥ σₖ ≥ 0
- V (n×n or n×k): Right singular vectors (orthogonal)
- k = min(m, n) for thin SVD

### Algorithm: Two-Phase Golub-Kahan SVD

**Phase 1: Bidiagonalization** (Reduce A to bidiagonal form B)
**Phase 2: QR Iteration** (Compute SVD of B)

#### Phase 1: Golub-Kahan Bidiagonalization

```typescript
function bidiagonalize(A: Matrix): { U: Matrix, B: Matrix, V: Matrix } {
  const m = A.rows, n = A.cols
  const U = Matrix.identity(m)
  const V = Matrix.identity(n)
  const B = A.clone()

  for (let k = 0; k < n; k++) {
    // Left Householder: zero column k below diagonal
    if (k < m) {
      const x = B.getColumn(k, k, m)  // from row k to m
      const v = householder(x)
      applyHouseholderLeft(B, v, k, m, k, n)
      updateU(U, v, k, m)
    }

    // Right Householder: zero row k to the right of superdiagonal
    if (k < n - 2) {
      const x = B.getRow(k, k + 1, n)  // from col k+1 to n
      const v = householder(x)
      applyHouseholderRight(B, v, k + 1, n, k, m)
      updateV(V, v, k + 1, n)
    }
  }

  return { U, B: extractBidiagonal(B), V }
}

function householder(x: Vector): Vector {
  // Return Householder vector v such that (I - 2vv^T)x = ±||x||·e₁
  const n = x.length
  const norm = x.norm2()

  if (norm === 0) return Vector.zeros(n)

  const v = x.clone()
  v[0] += sign(x[0]) * norm  // Sign for numerical stability
  v.normalize()

  return v
}

function sign(x: number): number {
  return x >= 0 ? 1 : -1
}
```

#### Phase 2: QR Iteration on Bidiagonal Matrix

```typescript
function bidiagonalSVD(
  B: BidiagonalMatrix,
  U: Matrix,
  V: Matrix,
  options: { maxIter: 1000, tol: 1e-15 }
): { U: Matrix, sigma: Vector, V: Matrix } {

  const n = B.size
  const sigma = Vector.zeros(n)

  // Iteratively diagonalize B using implicit QR with Wilkinson shift
  let p = 0  // Number of converged singular values (from bottom)
  let q = 0  // Number of negligible superdiagonal elements

  for (let iter = 0; iter < options.maxIter; iter++) {
    // Check for convergence: split into subproblems
    const { split, idx } = findSplit(B, p, q, options.tol)

    if (split) {
      // Process upper block recursively
      q = n - idx
      continue
    }

    if (n - p - q === 0) break  // All converged

    // Apply implicit QR step with Wilkinson shift
    const shift = wilkinsonShift(B, n - p - 1)
    implicitQRStep(B, U, V, shift, p, n - q)

    // Check for convergence of bottom-right element
    if (Math.abs(B.super[n - p - 2]) < options.tol *
        (Math.abs(B.diag[n - p - 2]) + Math.abs(B.diag[n - p - 1]))) {
      p++
    }
  }

  // Extract and sort singular values
  for (let i = 0; i < n; i++) {
    sigma[i] = Math.abs(B.diag[i])
  }

  sortSingularValues(sigma, U, V)

  return { U, sigma, V }
}

function wilkinsonShift(B: BidiagonalMatrix, k: number): number {
  // Compute trailing 2×2 submatrix of B^T·B
  const d = B.diag[k]
  const e = B.super[k - 1]
  const dNext = B.diag[k - 1]
  const ePrev = k > 1 ? B.super[k - 2] : 0

  const a11 = dNext * dNext + ePrev * ePrev
  const a22 = d * d + e * e
  const a12 = dNext * e

  // Eigenvalue of [[a11, a12], [a12, a22]] closer to a22
  const delta = (a11 - a22) / 2
  const shift = a22 - (a12 * a12) / (delta + sign(delta) * Math.sqrt(delta * delta + a12 * a12))

  return shift
}

function implicitQRStep(
  B: BidiagonalMatrix,
  U: Matrix,
  V: Matrix,
  shift: number,
  p: number,
  q: number
) {
  // Golub-Kahan SVD step: chase the bulge
  const n = q - p

  // Initial Givens rotation (from B^T·B - shift·I)
  let c = B.diag[p] * B.diag[p] - shift
  let s = B.diag[p] * B.super[p]

  for (let k = p; k < q - 1; k++) {
    // Right Givens rotation (affects V)
    const [cNew, sNew, r] = givens(c, s)
    applyGivensRight(B, cNew, sNew, k, k + 1)
    updateV(V, cNew, sNew, k, k + 1)

    // Chase bulge: left Givens rotation (affects U)
    c = B.diag[k]
    s = k < n - 1 ? B.createBulge(k) : 0

    const [cLeft, sLeft, rLeft] = givens(c, s)
    applyGivensLeft(B, cLeft, sLeft, k, k + 1)
    updateU(U, cLeft, sLeft, k, k + 1)

    // Setup next iteration
    if (k < q - 2) {
      c = B.super[k]
      s = B.getBulge(k + 1)
    }
  }
}

function givens(a: number, b: number): [number, number, number] {
  // Compute c, s such that [c s; -s c]^T [a; b] = [r; 0]
  if (b === 0) return [1, 0, a]
  if (a === 0) return [0, 1, b]

  if (Math.abs(b) > Math.abs(a)) {
    const tau = -a / b
    const s = 1 / Math.sqrt(1 + tau * tau)
    const c = s * tau
    return [c, s, b / s]
  } else {
    const tau = -b / a
    const c = 1 / Math.sqrt(1 + tau * tau)
    const s = c * tau
    return [c, s, a / c]
  }
}
```

### Thin vs Full SVD

```typescript
function svd(A: Matrix, mode: 'full' | 'thin' = 'thin'): SVDResult {
  const m = A.rows, n = A.cols
  const k = Math.min(m, n)

  // Always compute thin SVD first
  const { U: U_full, B, V: V_full } = bidiagonalize(A)
  const { U: U_bi, sigma, V: V_bi } = bidiagonalSVD(B, U_full, V_full)

  if (mode === 'thin') {
    return {
      U: U_bi.slice(0, m, 0, k),      // m × k
      sigma: sigma.slice(0, k),        // k
      V: V_bi.slice(0, n, 0, k)        // n × k
    }
  } else {  // full
    // Pad sigma with zeros
    const sigmaFull = Vector.zeros(Math.max(m, n))
    sigmaFull.set(0, k, sigma)

    return {
      U: U_bi,                          // m × m
      sigma: sigmaFull,                 // max(m, n)
      V: V_bi                           // n × n
    }
  }
}
```

### Edge Cases & Numerical Stability

- **Zero matrix**: Returns U=I, Σ=0, V=I
- **Rank deficiency**: Some σᵢ ≈ 0 (detect with tolerance σᵢ < ε·σ₁)
- **Near-zero superdiagonal**: Split into independent subproblems
- **Tiny singular values**: Can cause underflow; threshold with ε = max(m,n)·σ₁·machineEpsilon
- **Non-convergence**: Rare with Wilkinson shift; fall back to QR with explicit shifts after 30n iterations

**Complexity**: O(mn² + n³) for m ≥ n, or O(m²n + m³) for m < n

---

## 2. Cholesky Decomposition

**Goal**: Factor symmetric positive definite matrix A = L·L^T
- L: Lower triangular matrix with positive diagonal

### Algorithm: Cholesky-Banachiewicz

```typescript
function cholesky(A: Matrix): Matrix {
  const n = A.rows

  if (A.rows !== A.cols) {
    throw new Error('Cholesky requires square matrix')
  }

  // Check symmetry (optional, can be expensive)
  if (!isSymmetric(A, 1e-10)) {
    throw new Error('Cholesky requires symmetric matrix')
  }

  const L = Matrix.zeros(n, n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = A.get(i, j)

      // Subtract L[i,k] * L[j,k] for k = 0..j-1
      for (let k = 0; k < j; k++) {
        sum -= L.get(i, k) * L.get(j, k)
      }

      if (i === j) {
        // Diagonal element
        if (sum <= 0) {
          throw new Error(
            `Matrix is not positive definite (failed at diagonal ${i})`
          )
        }
        L.set(i, i, Math.sqrt(sum))
      } else {
        // Off-diagonal element
        L.set(i, j, sum / L.get(j, j))
      }
    }
  }

  return L
}

function isSymmetric(A: Matrix, tol: number = 1e-10): boolean {
  const n = A.rows
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A.get(i, j) - A.get(j, i)) > tol) {
        return false
      }
    }
  }
  return true
}
```

### Alternative: Outer Product Form (Better Cache Locality)

```typescript
function choleskyOuter(A: Matrix): Matrix {
  const n = A.rows
  const L = A.clone()  // Work in-place on lower triangle

  for (let k = 0; k < n; k++) {
    // Update diagonal
    const Lkk = L.get(k, k)
    if (Lkk <= 0) {
      throw new Error(`Matrix is not positive definite at column ${k}`)
    }

    L.set(k, k, Math.sqrt(Lkk))
    const invLkk = 1 / L.get(k, k)

    // Scale column k below diagonal
    for (let i = k + 1; i < n; i++) {
      L.set(i, k, L.get(i, k) * invLkk)
    }

    // Rank-1 update of trailing submatrix
    for (let j = k + 1; j < n; j++) {
      const Ljk = L.get(j, k)
      for (let i = j; i < n; i++) {
        L.set(i, j, L.get(i, j) - L.get(i, k) * Ljk)
      }
    }
  }

  // Zero out upper triangle
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      L.set(i, j, 0)
    }
  }

  return L
}
```

### Edge Cases & Numerical Stability

- **Not positive definite**: Throws error when diagonal becomes ≤ 0
- **Ill-conditioned**: Small pivots can amplify errors; check cond(A)
- **Nearly singular**: Machine epsilon can cause false negatives
- **Sparse matrices**: Use specialized sparse Cholesky algorithms
- **Numerical check**: Verify ||A - L·L^T||_F / ||A||_F < ε after factorization

**Complexity**: O(n³/3) operations, O(n²) storage

**Applications**: Solving A·x = b via L·y = b, then L^T·x = y (forward/backward substitution)

---

## 3. Matrix Rank

**Goal**: Compute numerical rank of A using SVD with tolerance-based thresholding

### Algorithm: SVD-Based Rank

```typescript
function rank(A: Matrix, tol?: number): number {
  const { sigma } = svd(A, 'thin')
  const m = A.rows, n = A.cols

  // Default tolerance: max(m,n) * σ_max * machine_epsilon
  if (tol === undefined) {
    const sigma_max = sigma[0]
    tol = Math.max(m, n) * sigma_max * Number.EPSILON
  }

  // Count singular values above tolerance
  let r = 0
  for (let i = 0; i < sigma.length; i++) {
    if (sigma[i] > tol) {
      r++
    } else {
      break  // sigma is sorted in descending order
    }
  }

  return r
}
```

### Alternative: Rank-Revealing QR (Faster for Tall Matrices)

```typescript
function rankQR(A: Matrix, tol?: number): number {
  // QR with column pivoting: A·P = Q·R
  const { R, perm } = qrColPivot(A)
  const n = Math.min(A.rows, A.cols)

  if (tol === undefined) {
    tol = Math.max(A.rows, A.cols) * Math.abs(R.get(0, 0)) * Number.EPSILON
  }

  // Count diagonal elements of R above tolerance
  let r = 0
  for (let i = 0; i < n; i++) {
    if (Math.abs(R.get(i, i)) > tol) {
      r++
    } else {
      break
    }
  }

  return r
}
```

### Edge Cases

- **Zero matrix**: rank = 0
- **Full rank**: rank = min(m, n)
- **User tolerance**: Should be ≥ machine epsilon to avoid spurious ranks
- **Scaled matrices**: Consider relative tolerance σᵢ/σ₁ < tol
- **Exact vs numerical rank**: Theory vs floating-point reality

**Complexity**:
- SVD: O(mn·min(m,n))
- QR: O(mn² - n³/3) with pivoting

---

## 4. Null Space

**Goal**: Find orthonormal basis for null(A) = {x : A·x = 0}

### Algorithm: SVD-Based Null Space

```typescript
function null(A: Matrix, tol?: number): Matrix {
  const { V, sigma } = svd(A, 'thin')
  const n = A.cols
  const r = rank(A, tol)  // Numerical rank

  if (r === n) {
    // Full column rank: trivial null space
    return Matrix.zeros(n, 0)  // Empty matrix (no null vectors)
  }

  // Null space = span of last (n - r) columns of V
  // These correspond to zero/negligible singular values
  const nullBasis = V.slice(0, n, r, n)

  return nullBasis  // n × (n - r) matrix
}
```

### With Explicit Tolerance Handling

```typescript
function nullWithTolerance(A: Matrix, tol?: number): Matrix {
  const { V, sigma } = svd(A, 'full')  // Need full V
  const n = A.cols

  // Default tolerance
  if (tol === undefined) {
    const sigma_max = sigma[0]
    tol = Math.max(A.rows, A.cols) * sigma_max * Number.EPSILON
  }

  // Find indices of negligible singular values
  const nullIndices: number[] = []
  for (let i = 0; i < sigma.length; i++) {
    if (sigma[i] <= tol) {
      nullIndices.push(i)
    }
  }

  if (nullIndices.length === 0) {
    return Matrix.zeros(n, 0)
  }

  // Extract corresponding columns from V
  const nullBasis = Matrix.zeros(n, nullIndices.length)
  for (let j = 0; j < nullIndices.length; j++) {
    for (let i = 0; i < n; i++) {
      nullBasis.set(i, j, V.get(i, nullIndices[j]))
    }
  }

  return nullBasis
}
```

### Verification

```typescript
function verifyNullSpace(A: Matrix, N: Matrix, tol: number = 1e-10): boolean {
  // Check: ||A·N||_F ≈ 0
  const AN = A.multiply(N)
  const residual = AN.norm('fro')
  const scale = A.norm('fro') * N.norm('fro')

  return residual <= tol * scale
}
```

### Edge Cases

- **Full rank**: Returns empty matrix (n × 0)
- **Zero matrix**: Returns I_n (entire space is null space)
- **Underdetermined**: dim(null) = n - rank
- **Numerical noise**: Small σᵢ ≠ 0 but effectively zero

**Complexity**: O(mn²) dominated by SVD

---

## 5. Column Space (orth/range)

**Goal**: Find orthonormal basis for range(A) = {A·x : x ∈ ℝⁿ}

### Algorithm: SVD-Based Range

```typescript
function orth(A: Matrix, tol?: number): Matrix {
  const { U, sigma } = svd(A, 'thin')
  const r = rank(A, tol)

  if (r === 0) {
    // Zero matrix: empty column space
    return Matrix.zeros(A.rows, 0)
  }

  // Range = span of first r columns of U
  // These correspond to non-negligible singular values
  const rangeBasis = U.slice(0, A.rows, 0, r)

  return rangeBasis  // m × r matrix
}
```

### QR-Based Alternative (Faster)

```typescript
function orthQR(A: Matrix, tol?: number): Matrix {
  // QR decomposition with column pivoting
  const { Q, R, rank: r } = qrColPivot(A, tol)

  if (r === 0) {
    return Matrix.zeros(A.rows, 0)
  }

  // First r columns of Q form orthonormal basis
  return Q.slice(0, A.rows, 0, r)
}
```

### Verification

```typescript
function verifyColumnSpace(A: Matrix, Q: Matrix, tol: number = 1e-10): boolean {
  // Check: A = Q·Q^T·A (range(A) ⊆ range(Q))
  // And: Q is orthonormal

  const QTQ = Q.transpose().multiply(Q)
  const I = Matrix.identity(Q.cols)

  const orthoError = QTQ.subtract(I).norm('fro')
  if (orthoError > tol) return false

  const projA = Q.multiply(Q.transpose()).multiply(A)
  const residual = projA.subtract(A).norm('fro')
  const scale = A.norm('fro')

  return residual <= tol * scale
}
```

### Edge Cases

- **Zero matrix**: Returns empty matrix (m × 0)
- **Full rank**: Returns Q from QR (m × n for m ≥ n)
- **Rank deficient**: Returns only first r columns
- **Redundant columns**: Automatically removed via SVD

**Complexity**:
- SVD: O(mn·min(m,n))
- QR: O(mn² - n³/3)

---

## 6. Least Squares (lstsq)

**Goal**: Solve min ||A·x - b||₂ for overdetermined/underdetermined systems

### Algorithm: SVD-Based Least Squares

```typescript
function lstsq(
  A: Matrix,
  b: Vector | Matrix,
  tol?: number
): { x: Vector | Matrix, residual: number, rank: number, singularValues: Vector } {

  const { U, sigma, V } = svd(A, 'thin')
  const m = A.rows, n = A.cols
  const k = Math.min(m, n)

  // Compute numerical rank
  if (tol === undefined) {
    tol = Math.max(m, n) * sigma[0] * Number.EPSILON
  }

  const r = rank(A, tol)

  // Solution: x = V·Σ^+·U^T·b
  // where Σ^+ has entries 1/σᵢ for σᵢ > tol, else 0

  const isVector = b instanceof Vector
  const B = isVector ? b.toMatrix() : b  // Ensure matrix

  // Compute U^T·b
  const UTb = U.transpose().multiply(B)

  // Multiply by Σ^+
  const SigmaInvUTb = Matrix.zeros(n, B.cols)
  for (let i = 0; i < r; i++) {
    const invSigma = 1 / sigma[i]
    for (let j = 0; j < B.cols; j++) {
      SigmaInvUTb.set(i, j, UTb.get(i, j) * invSigma)
    }
  }

  // x = V·Σ^+·U^T·b
  const X = V.multiply(SigmaInvUTb)

  // Compute residual: ||A·x - b||₂
  const residualVec = A.multiply(X).subtract(B)
  const residual = residualVec.norm('fro')

  return {
    x: isVector ? X.getColumn(0) : X,
    residual,
    rank: r,
    singularValues: sigma
  }
}
```

### Case Analysis

```typescript
function lstsqCases(A: Matrix, b: Vector): Vector {
  const m = A.rows, n = A.cols
  const r = rank(A)

  if (m === n && r === n) {
    // Case 1: Square, full rank → unique solution
    // Solve A·x = b via LU or QR
    return A.solve(b)
  } else if (m > n && r === n) {
    // Case 2: Overdetermined, full column rank → unique least squares solution
    // x = (A^T·A)^{-1}·A^T·b (normal equations, or use QR)
    return normalEquations(A, b)
  } else if (m < n && r === m) {
    // Case 3: Underdetermined, full row rank → minimum norm solution
    // x = A^T·(A·A^T)^{-1}·b
    return minimumNorm(A, b)
  } else {
    // Case 4: Rank deficient → minimum norm least squares via SVD
    return lstsq(A, b).x
  }
}

function normalEquations(A: Matrix, b: Vector): Vector {
  // Solve (A^T·A)·x = A^T·b
  // WARNING: Can be numerically unstable if cond(A) is large
  const ATA = A.transpose().multiply(A)
  const ATb = A.transpose().multiply(b)
  return ATA.solve(ATb)
}

function minimumNorm(A: Matrix, b: Vector): Vector {
  // Solve x = A^T·(A·A^T)^{-1}·b
  const AAT = A.multiply(A.transpose())
  const y = AAT.solve(b)
  return A.transpose().multiply(y)
}
```

### Numerical Stability Notes

- **SVD method**: Most stable, handles rank deficiency automatically
- **Normal equations**: Fast but squares condition number: cond(A^T·A) = cond(A)²
- **QR method**: Good stability, O(mn²) cost
- **Regularization**: For ill-conditioned problems, use lstsq with truncated SVD (zero small σᵢ)

### Edge Cases

- **Rank deficient**: Returns minimum norm solution
- **Multiple RHS**: b can be a matrix (solve for each column)
- **Exact solution exists**: residual ≈ 0
- **Underdetermined**: Infinitely many solutions; returns minimum norm

**Complexity**: O(mn²) for m ≥ n (dominated by SVD)

---

## 7. Polar Decomposition

**Goal**: Decompose A = U·P where U is orthogonal/unitary and P is positive semi-definite
- Analogous to complex polar form: z = r·e^(iθ)

### Algorithm: SVD-Based Polar Decomposition

```typescript
function polar(A: Matrix): { U: Matrix, P: Matrix } {
  const { U: U_svd, sigma, V } = svd(A, 'full')

  // Unitary factor: U = U_svd · V^T
  const U = U_svd.multiply(V.transpose())

  // Hermitian positive semi-definite factor: P = V · Σ · V^T
  const Sigma = Matrix.diag(sigma)
  const P = V.multiply(Sigma).multiply(V.transpose())

  return { U, P }
}
```

### Right vs Left Polar Decomposition

```typescript
function polarLeft(A: Matrix): { P: Matrix, U: Matrix } {
  // Left polar: A = P·U
  const { U: U_svd, sigma, V } = svd(A, 'full')

  const U = U_svd.multiply(V.transpose())
  const Sigma = Matrix.diag(sigma)
  const P = U_svd.multiply(Sigma).multiply(U_svd.transpose())

  return { P, U }
}

function polarRight(A: Matrix): { U: Matrix, P: Matrix } {
  // Right polar: A = U·P (standard form)
  return polar(A)
}
```

### Verification

```typescript
function verifyPolar(A: Matrix, U: Matrix, P: Matrix, tol: number = 1e-10): boolean {
  // Check 1: A = U·P
  const UP = U.multiply(P)
  const reconstructionError = UP.subtract(A).norm('fro') / A.norm('fro')

  if (reconstructionError > tol) return false

  // Check 2: U is orthogonal (U^T·U = I)
  const UTU = U.transpose().multiply(U)
  const I = Matrix.identity(U.cols)
  const orthoError = UTU.subtract(I).norm('fro')

  if (orthoError > tol) return false

  // Check 3: P is positive semi-definite and symmetric
  if (!isSymmetric(P, tol)) return false

  const { sigma } = svd(P, 'thin')
  const minEigenvalue = sigma[sigma.length - 1]

  return minEigenvalue >= -tol
}
```

### Edge Cases

- **Singular matrix**: P has zero eigenvalues; still well-defined
- **Rectangular matrix**: Need to pad to square for standard polar
- **Negative determinant**: U is orthogonal but not rotation (det(U) = ±1)
- **Complex matrices**: Use Hermitian transpose (conjugate transpose)

### Applications

- **Procrustes problem**: Find optimal rotation between point sets
- **Continuum mechanics**: Strain decomposition (rotation + stretch)
- **Computer graphics**: Decompose deformation into rotation + scaling

**Complexity**: O(mn·min(m,n)) dominated by SVD

---

## 8. Moore-Penrose Pseudoinverse (pinv)

**Goal**: Compute A^+ satisfying:
1. A·A^+·A = A
2. A^+·A·A^+ = A^+
3. (A·A^+)^T = A·A^+
4. (A^+·A)^T = A^+·A

### Algorithm: SVD-Based Pseudoinverse

```typescript
function pinv(A: Matrix, tol?: number): Matrix {
  const { U, sigma, V } = svd(A, 'thin')
  const m = A.rows, n = A.cols
  const k = sigma.length

  // Default tolerance
  if (tol === undefined) {
    tol = Math.max(m, n) * sigma[0] * Number.EPSILON
  }

  // Compute Σ^+: invert non-zero singular values
  const sigmaInv = Vector.zeros(k)
  for (let i = 0; i < k; i++) {
    if (sigma[i] > tol) {
      sigmaInv[i] = 1 / sigma[i]
    }
    // else: leave as 0
  }

  // A^+ = V · Σ^+ · U^T
  const SigmaInv = Matrix.diag(sigmaInv)
  const Apinv = V.multiply(SigmaInv).multiply(U.transpose())

  return Apinv  // n × m matrix
}
```

### Optimized Version (Avoid Full Matrix Multiplication)

```typescript
function pinvOptimized(A: Matrix, tol?: number): Matrix {
  const { U, sigma, V } = svd(A, 'thin')
  const m = A.rows, n = A.cols
  const k = sigma.length

  if (tol === undefined) {
    tol = Math.max(m, n) * sigma[0] * Number.EPSILON
  }

  // A^+ = Σᵢ (1/σᵢ) vᵢ uᵢ^T for σᵢ > tol
  const Apinv = Matrix.zeros(n, m)

  for (let i = 0; i < k; i++) {
    if (sigma[i] > tol) {
      const weight = 1 / sigma[i]

      // Outer product: Apinv += weight * V[:,i] * U[:,i]^T
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < m; col++) {
          Apinv.set(
            row,
            col,
            Apinv.get(row, col) + weight * V.get(row, i) * U.get(col, i)
          )
        }
      }
    }
  }

  return Apinv
}
```

### Special Cases

```typescript
function pinvSpecialCases(A: Matrix): Matrix {
  const m = A.rows, n = A.cols
  const r = rank(A)

  if (r === 0) {
    // Zero matrix: A^+ = 0
    return Matrix.zeros(n, m)
  } else if (m === n && r === n) {
    // Square, full rank: A^+ = A^{-1}
    return A.inverse()
  } else if (m >= n && r === n) {
    // Full column rank: A^+ = (A^T·A)^{-1}·A^T (left inverse)
    const ATA = A.transpose().multiply(A)
    return ATA.inverse().multiply(A.transpose())
  } else if (m <= n && r === m) {
    // Full row rank: A^+ = A^T·(A·A^T)^{-1} (right inverse)
    const AAT = A.multiply(A.transpose())
    return A.transpose().multiply(AAT.inverse())
  } else {
    // Rank deficient: use SVD
    return pinv(A)
  }
}
```

### Verification

```typescript
function verifyPseudoinverse(A: Matrix, Apinv: Matrix, tol: number = 1e-10): boolean {
  // Check Moore-Penrose conditions

  // 1. A·A^+·A = A
  const AApinvA = A.multiply(Apinv).multiply(A)
  const error1 = AApinvA.subtract(A).norm('fro') / A.norm('fro')

  // 2. A^+·A·A^+ = A^+
  const ApinvAApinv = Apinv.multiply(A).multiply(Apinv)
  const error2 = ApinvAApinv.subtract(Apinv).norm('fro') / Apinv.norm('fro')

  // 3. (A·A^+)^T = A·A^+
  const AApinv = A.multiply(Apinv)
  const error3 = AApinv.subtract(AApinv.transpose()).norm('fro') / AApinv.norm('fro')

  // 4. (A^+·A)^T = A^+·A
  const ApinvA = Apinv.multiply(A)
  const error4 = ApinvA.subtract(ApinvA.transpose()).norm('fro') / ApinvA.norm('fro')

  return error1 <= tol && error2 <= tol && error3 <= tol && error4 <= tol
}
```

### Applications

```typescript
// Solve least squares: x = A^+·b
function solveLeastSquares(A: Matrix, b: Vector): Vector {
  const Apinv = pinv(A)
  return Apinv.multiply(b)
}

// Project onto column space: P = A·A^+
function projectColumnSpace(A: Matrix): Matrix {
  const Apinv = pinv(A)
  return A.multiply(Apinv)
}

// Project onto null space: Q = I - A^+·A
function projectNullSpace(A: Matrix): Matrix {
  const Apinv = pinv(A)
  const ApinvA = Apinv.multiply(A)
  const I = Matrix.identity(A.cols)
  return I.subtract(ApinvA)
}
```

### Edge Cases

- **Zero matrix**: A^+ = 0
- **Rank deficient**: Automatically handled via thresholding
- **Ill-conditioned**: Small σᵢ can cause numerical instability
- **Tolerance selection**: Too small → false rank, too large → loss of precision

**Complexity**: O(mn·min(m,n)) dominated by SVD

---

## Implementation Checklist

### For Each Function

- [ ] TypeScript interface with generic matrix types
- [ ] Input validation (dimensions, symmetry, etc.)
- [ ] Default tolerance: max(m,n)·σ_max·ε_machine
- [ ] Edge case handling (zero, singular, rank deficient)
- [ ] Unit tests with known solutions
- [ ] Numerical stability tests (condition number, residuals)
- [ ] Performance benchmarks vs reference implementations (NumPy, MATLAB)
- [ ] WASM optimization for large matrices (n > 100)
- [ ] Sparse matrix variants (where applicable)
- [ ] Documentation with mathematical notation and examples

### Numerical Verification

```typescript
function testSuite() {
  // Test 1: Identity matrix (should be trivial)
  // Test 2: Random well-conditioned matrix
  // Test 3: Rank-deficient matrix (explicit construction)
  // Test 4: Nearly singular matrix (cond(A) ≈ 1/ε)
  // Test 5: Hilbert matrix (notoriously ill-conditioned)
  // Test 6: Large sparse matrix (performance)
  // Test 7: Rectangular matrices (m ≠ n)
  // Test 8: Complex matrices (if supported)
}
```

---

## References

- **Golub & Van Loan**: *Matrix Computations* (4th ed.), Algorithm 8.6.2 (SVD)
- **Trefethen & Bau**: *Numerical Linear Algebra*, Lectures 4-5 (SVD), 11 (Least Squares)
- **Demmel**: *Applied Numerical Linear Algebra*, Chapter 3 (Linear Least Squares)
- **LAPACK**: Reference implementations (dgesvd, dpotrf, dgelsd, etc.)
- **NumPy/SciPy**: API design patterns for linear algebra

---

## Performance Targets (WASM)

| Operation       | Size      | JS Time  | WASM Time | Speedup |
|-----------------|-----------|----------|-----------|---------|
| SVD (thin)      | 1000×1000 | ~800ms   | ~80ms     | 10x     |
| Cholesky        | 1000×1000 | ~60ms    | ~6ms      | 10x     |
| Rank (SVD)      | 1000×1000 | ~800ms   | ~80ms     | 10x     |
| Null space      | 1000×500  | ~400ms   | ~50ms     | 8x      |
| Least squares   | 1000×500  | ~400ms   | ~50ms     | 8x      |
| Pseudoinverse   | 1000×1000 | ~850ms   | ~85ms     | 10x     |

*Estimated on modern CPU; actual performance depends on BLAS/LAPACK backend*
