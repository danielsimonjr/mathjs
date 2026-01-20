/**
 * WASM-optimized matrix algorithm implementations
 * AssemblyScript implementations for high-performance matrix operations
 *
 * These algorithms implement the same logic as the TypeScript versions but with
 * WASM optimizations for better performance on large matrices.
 */

/**
 * Dense-Sparse Identity (Algorithm 01)
 * Processes only the nonzero elements of sparse matrix
 * Result: Dense matrix where C(i,j) = f(D(i,j), S(i,j)) for S(i,j) !== 0, else D(i,j)
 *
 * @param denseData - Dense matrix data (flat array, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param sparseValues - Sparse matrix values
 * @param sparseIndex - Sparse matrix row indices
 * @param sparsePtr - Sparse matrix column pointers
 * @param result - Result dense matrix (pre-allocated)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 */
export function algo01DenseSparseDensity(
  denseData: Float64Array,
  rows: i32,
  cols: i32,
  sparseValues: Float64Array,
  sparseIndex: Int32Array,
  sparsePtr: Int32Array,
  result: Float64Array,
  operation: i32
): void {
  // Copy dense matrix to result first
  for (let i: i32 = 0; i < rows * cols; i++) {
    result[i] = denseData[i]
  }

  // Workspace for marking processed elements
  const workspace: Int32Array = new Int32Array(rows)
  const mark: i32 = 1

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    // Clear workspace marks
    for (let i: i32 = 0; i < rows; i++) {
      workspace[i] = 0
    }

    // Process nonzero elements in column j
    for (let k: i32 = sparsePtr[j]; k < sparsePtr[j + 1]; k++) {
      const i: i32 = sparseIndex[k]
      const denseValue: f64 = denseData[i * cols + j]
      const sparseValue: f64 = sparseValues[k]

      // Apply operation
      result[i * cols + j] = applyOperation(denseValue, sparseValue, operation)
      workspace[i] = mark
    }
  }
}

/**
 * Dense-Sparse Zero (Algorithm 02)
 * Result is sparse, only computing where S(i,j) !== 0
 * C(i,j) = f(D(i,j), S(i,j)) for S(i,j) !== 0, else 0
 */
export function algo02DenseSparseZero(
  denseData: Float64Array,
  rows: i32,
  cols: i32,
  sparseValues: Float64Array,
  sparseIndex: Int32Array,
  sparsePtr: Int32Array,
  resultValues: Float64Array,
  resultIndex: Int32Array,
  resultPtr: Int32Array,
  operation: i32
): i32 {
  let nnz: i32 = 0

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    resultPtr[j] = nnz

    // Process nonzero elements in column j
    for (let k: i32 = sparsePtr[j]; k < sparsePtr[j + 1]; k++) {
      const i: i32 = sparseIndex[k]
      const denseValue: f64 = denseData[i * cols + j]
      const sparseValue: f64 = sparseValues[k]

      const value: f64 = applyOperation(denseValue, sparseValue, operation)

      // Only store nonzero values
      if (value !== 0.0) {
        resultValues[nnz] = value
        resultIndex[nnz] = i
        nnz++
      }
    }
  }

  resultPtr[cols] = nnz
  return nnz
}

/**
 * Dense-Sparse Function (Algorithm 03)
 * Processes all elements, calling f(D(i,j), S(i,j)) or f(D(i,j), 0)
 * Result: Dense matrix
 */
export function algo03DenseSparseFunction(
  denseData: Float64Array,
  rows: i32,
  cols: i32,
  sparseValues: Float64Array,
  sparseIndex: Int32Array,
  sparsePtr: Int32Array,
  result: Float64Array,
  operation: i32
): void {
  // Workspace to cache computed values
  const workspace: Float64Array = new Float64Array(rows)
  const marks: Int32Array = new Int32Array(rows)

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    const mark: i32 = j + 1

    // Process nonzero elements in sparse matrix column j
    for (let k: i32 = sparsePtr[j]; k < sparsePtr[j + 1]; k++) {
      const i: i32 = sparseIndex[k]
      const denseValue: f64 = denseData[i * cols + j]
      const sparseValue: f64 = sparseValues[k]

      workspace[i] = applyOperation(denseValue, sparseValue, operation)
      marks[i] = mark
    }

    // Process all rows
    for (let i: i32 = 0; i < rows; i++) {
      if (marks[i] === mark) {
        result[i * cols + j] = workspace[i]
      } else {
        // Sparse element is zero
        result[i * cols + j] = applyOperation(
          denseData[i * cols + j],
          0.0,
          operation
        )
      }
    }
  }
}

/**
 * Sparse-Sparse Identity-Identity (Algorithm 04)
 * Result includes union of nonzeros from both matrices
 * C(i,j) = f(A(i,j), B(i,j)) if both nonzero, else A(i,j) or B(i,j)
 */
export function algo04SparseIdentity(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  rows: i32,
  cols: i32,
  resultValues: Float64Array,
  resultIndex: Int32Array,
  resultPtr: Int32Array,
  operation: i32
): i32 {
  let nnz: i32 = 0
  const xa: Float64Array = new Float64Array(rows)
  const xb: Float64Array = new Float64Array(rows)
  const wa: Int32Array = new Int32Array(rows)
  const wb: Int32Array = new Int32Array(rows)

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    resultPtr[j] = nnz
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    for (let k: i32 = aPtr[j]; k < aPtr[j + 1]; k++) {
      const i: i32 = aIndex[k]
      resultIndex[nnz++] = i
      wa[i] = mark
      xa[i] = aValues[k]
    }

    // Scatter B(:,j) and merge
    for (let k: i32 = bPtr[j]; k < bPtr[j + 1]; k++) {
      const i: i32 = bIndex[k]
      if (wa[i] === mark) {
        // Both A and B have values
        xa[i] = applyOperation(xa[i], bValues[k], operation)
      } else {
        // Only B has value
        resultIndex[nnz++] = i
        wb[i] = mark
        xb[i] = bValues[k]
      }
    }

    // Gather values
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = resultIndex[p]
      if (wa[i] === mark) {
        resultValues[p] = xa[i]
        p++
      } else if (wb[i] === mark) {
        resultValues[p] = xb[i]
        p++
      } else {
        // Remove zero element
        for (let q: i32 = p; q < nnz - 1; q++) {
          resultIndex[q] = resultIndex[q + 1]
        }
        nnz--
      }
    }
  }

  resultPtr[cols] = nnz
  return nnz
}

/**
 * Sparse-Sparse Function-Function (Algorithm 05)
 * Result only includes elements where at least one matrix has nonzero
 * C(i,j) = f(A(i,j), B(i,j)) where either is nonzero, treating missing as 0
 */
export function algo05SparseFunctionFunction(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  rows: i32,
  cols: i32,
  resultValues: Float64Array,
  resultIndex: Int32Array,
  resultPtr: Int32Array,
  operation: i32
): i32 {
  let nnz: i32 = 0
  const xa: Float64Array = new Float64Array(rows)
  const xb: Float64Array = new Float64Array(rows)
  const wa: Int32Array = new Int32Array(rows)
  const wb: Int32Array = new Int32Array(rows)

  for (let j: i32 = 0; j < cols; j++) {
    resultPtr[j] = nnz
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    for (let k: i32 = aPtr[j]; k < aPtr[j + 1]; k++) {
      const i: i32 = aIndex[k]
      resultIndex[nnz++] = i
      wa[i] = mark
      xa[i] = aValues[k]
    }

    // Scatter B(:,j)
    for (let k: i32 = bPtr[j]; k < bPtr[j + 1]; k++) {
      const i: i32 = bIndex[k]
      if (wa[i] !== mark) {
        resultIndex[nnz++] = i
      }
      wb[i] = mark
      xb[i] = bValues[k]
    }

    // Compute and gather
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = resultIndex[p]
      const va: f64 = wa[i] === mark ? xa[i] : 0.0
      const vb: f64 = wb[i] === mark ? xb[i] : 0.0
      const vc: f64 = applyOperation(va, vb, operation)

      if (vc !== 0.0) {
        resultValues[p] = vc
        p++
      } else {
        // Remove zero
        for (let q: i32 = p; q < nnz - 1; q++) {
          resultIndex[q] = resultIndex[q + 1]
        }
        nnz--
      }
    }
  }

  resultPtr[cols] = nnz
  return nnz
}

/**
 * Sparse-Sparse Zero-Zero (Algorithm 06)
 * Result only includes intersection (both matrices have nonzero)
 * C(i,j) = f(A(i,j), B(i,j)) only where both are nonzero
 */
export function algo06SparseZeroZero(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  rows: i32,
  cols: i32,
  resultValues: Float64Array,
  resultIndex: Int32Array,
  resultPtr: Int32Array,
  operation: i32
): i32 {
  let nnz: i32 = 0
  const workspace: Float64Array = new Float64Array(rows)
  const wa: Int32Array = new Int32Array(rows)
  const updated: Int32Array = new Int32Array(rows)

  for (let j: i32 = 0; j < cols; j++) {
    resultPtr[j] = nnz
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    for (let k: i32 = aPtr[j]; k < aPtr[j + 1]; k++) {
      const i: i32 = aIndex[k]
      resultIndex[nnz++] = i
      wa[i] = mark
      workspace[i] = aValues[k]
    }

    // Process B(:,j) and compute where both exist
    for (let k: i32 = bPtr[j]; k < bPtr[j + 1]; k++) {
      const i: i32 = bIndex[k]
      if (wa[i] === mark) {
        workspace[i] = applyOperation(workspace[i], bValues[k], operation)
        updated[i] = mark
      }
    }

    // Keep only elements where both matrices had values
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = resultIndex[p]
      if (updated[i] === mark) {
        resultValues[p] = workspace[i]
        if (workspace[i] !== 0.0) {
          p++
        } else {
          // Remove zero
          for (let q: i32 = p; q < nnz - 1; q++) {
            resultIndex[q] = resultIndex[q + 1]
          }
          nnz--
        }
      } else {
        // Remove - only in A, not in B
        for (let q: i32 = p; q < nnz - 1; q++) {
          resultIndex[q] = resultIndex[q + 1]
        }
        nnz--
      }
    }
  }

  resultPtr[cols] = nnz
  return nnz
}

/**
 * Sparse-Sparse Full (Algorithm 07)
 * Processes ALL elements (dense result)
 * C(i,j) = f(A(i,j), B(i,j)) for all i,j, treating missing as 0
 */
export function algo07SparseSparseFull(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  rows: i32,
  cols: i32,
  resultValues: Float64Array,
  resultIndex: Int32Array,
  resultPtr: Int32Array,
  operation: i32
): i32 {
  let nnz: i32 = 0
  const xa: Float64Array = new Float64Array(rows)
  const xb: Float64Array = new Float64Array(rows)
  const wa: Int32Array = new Int32Array(rows)
  const wb: Int32Array = new Int32Array(rows)

  for (let j: i32 = 0; j < cols; j++) {
    resultPtr[j] = nnz
    const mark: i32 = j + 1

    // Scatter A(:,j)
    for (let k: i32 = aPtr[j]; k < aPtr[j + 1]; k++) {
      const i: i32 = aIndex[k]
      wa[i] = mark
      xa[i] = aValues[k]
    }

    // Scatter B(:,j)
    for (let k: i32 = bPtr[j]; k < bPtr[j + 1]; k++) {
      const i: i32 = bIndex[k]
      wb[i] = mark
      xb[i] = bValues[k]
    }

    // Process all rows
    for (let i: i32 = 0; i < rows; i++) {
      const va: f64 = wa[i] === mark ? xa[i] : 0.0
      const vb: f64 = wb[i] === mark ? xb[i] : 0.0
      const vc: f64 = applyOperation(va, vb, operation)

      if (vc !== 0.0) {
        resultIndex[nnz] = i
        resultValues[nnz] = vc
        nnz++
      }
    }
  }

  resultPtr[cols] = nnz
  return nnz
}

/**
 * Sparse-Sparse Zero-Identity (Algorithm 08)
 * Result includes A's nonzeros, computing f where both exist
 * C(i,j) = f(A(i,j), B(i,j)) where both nonzero, else A(i,j) if nonzero, else 0
 */
export function algo08SparseZeroIdentity(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  rows: i32,
  cols: i32,
  resultValues: Float64Array,
  resultIndex: Int32Array,
  resultPtr: Int32Array,
  operation: i32
): i32 {
  let nnz: i32 = 0
  const workspace: Float64Array = new Float64Array(rows)
  const marks: Int32Array = new Int32Array(rows)

  for (let j: i32 = 0; j < cols; j++) {
    resultPtr[j] = nnz
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    for (let k: i32 = aPtr[j]; k < aPtr[j + 1]; k++) {
      const i: i32 = aIndex[k]
      marks[i] = mark
      workspace[i] = aValues[k]
      resultIndex[nnz++] = i
    }

    // Update where B also has values
    for (let k: i32 = bPtr[j]; k < bPtr[j + 1]; k++) {
      const i: i32 = bIndex[k]
      if (marks[i] === mark) {
        workspace[i] = applyOperation(workspace[i], bValues[k], operation)
      }
    }

    // Gather non-zero values
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = resultIndex[p]
      const v: f64 = workspace[i]

      if (v !== 0.0) {
        resultValues[p] = v
        p++
      } else {
        // Remove zero
        for (let q: i32 = p; q < nnz - 1; q++) {
          resultIndex[q] = resultIndex[q + 1]
        }
        nnz--
      }
    }
  }

  resultPtr[cols] = nnz
  return nnz
}

/**
 * Helper function to apply operations
 * @param a - First operand
 * @param b - Second operand
 * @param operation - 0=add, 1=subtract, 2=multiply, 3=divide
 */
function applyOperation(a: f64, b: f64, operation: i32): f64 {
  if (operation === 0) {
    return a + b
  } else if (operation === 1) {
    return a - b
  } else if (operation === 2) {
    return a * b
  } else if (operation === 3) {
    return a / b
  }
  return 0.0
}

/**
 * Helper min function
 */
function min(a: i32, b: i32): i32 {
  return a < b ? a : b
}

/**
 * Helper max function
 */
function max(a: i32, b: i32): i32 {
  return a > b ? a : b
}
