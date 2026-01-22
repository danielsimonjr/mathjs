/**
 * WASM-optimized matrix algorithm implementations
 * AssemblyScript implementations for high-performance matrix operations
 *
 * These algorithms implement the same logic as the TypeScript versions but with
 * WASM optimizations for better performance on large matrices.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Dense-Sparse Identity (Algorithm 01)
 * Processes only the nonzero elements of sparse matrix
 * Result: Dense matrix where C(i,j) = f(D(i,j), S(i,j)) for S(i,j) !== 0, else D(i,j)
 *
 * @param denseDataPtr - Pointer to dense matrix data (f64, flat array, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param sparseValuesPtr - Pointer to sparse matrix values (f64)
 * @param sparseIndexPtr - Pointer to sparse matrix row indices (i32)
 * @param sparsePtrPtr - Pointer to sparse matrix column pointers (i32)
 * @param resultPtr - Pointer to result dense matrix (f64, pre-allocated)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 */
export function algo01DenseSparseDensity(
  denseDataPtr: usize,
  rows: i32,
  cols: i32,
  sparseValuesPtr: usize,
  sparseIndexPtr: usize,
  sparsePtrPtr: usize,
  resultPtr: usize,
  operation: i32
): void {
  const size: i32 = rows * cols

  // Copy dense matrix to result first
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(denseDataPtr + (<usize>i << 3)))
  }

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    const pStart: i32 = load<i32>(sparsePtrPtr + (<usize>j << 2))
    const pEnd: i32 = load<i32>(sparsePtrPtr + (<usize>(j + 1) << 2))

    // Process nonzero elements in column j
    for (let k: i32 = pStart; k < pEnd; k++) {
      const i: i32 = load<i32>(sparseIndexPtr + (<usize>k << 2))
      const idx: usize = <usize>(i * cols + j) << 3
      const denseValue: f64 = load<f64>(denseDataPtr + idx)
      const sparseValue: f64 = load<f64>(sparseValuesPtr + (<usize>k << 3))

      // Apply operation
      store<f64>(resultPtr + idx, applyOperation(denseValue, sparseValue, operation))
    }
  }
}

/**
 * Dense-Sparse Zero (Algorithm 02)
 * Result is sparse, only computing where S(i,j) !== 0
 * C(i,j) = f(D(i,j), S(i,j)) for S(i,j) !== 0, else 0
 *
 * @param denseDataPtr - Pointer to dense matrix data (f64)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param sparseValuesPtr - Pointer to sparse matrix values (f64)
 * @param sparseIndexPtr - Pointer to sparse matrix row indices (i32)
 * @param sparsePtrPtr - Pointer to sparse matrix column pointers (i32)
 * @param resultValuesPtr - Pointer to result sparse values (f64)
 * @param resultIndexPtr - Pointer to result row indices (i32)
 * @param resultPtrPtr - Pointer to result column pointers (i32)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @returns Number of nonzeros in result
 */
export function algo02DenseSparseZero(
  denseDataPtr: usize,
  rows: i32,
  cols: i32,
  sparseValuesPtr: usize,
  sparseIndexPtr: usize,
  sparsePtrPtr: usize,
  resultValuesPtr: usize,
  resultIndexPtr: usize,
  resultPtrPtr: usize,
  operation: i32
): i32 {
  let nnz: i32 = 0

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    store<i32>(resultPtrPtr + (<usize>j << 2), nnz)
    const pStart: i32 = load<i32>(sparsePtrPtr + (<usize>j << 2))
    const pEnd: i32 = load<i32>(sparsePtrPtr + (<usize>(j + 1) << 2))

    // Process nonzero elements in column j
    for (let k: i32 = pStart; k < pEnd; k++) {
      const i: i32 = load<i32>(sparseIndexPtr + (<usize>k << 2))
      const denseValue: f64 = load<f64>(denseDataPtr + (<usize>(i * cols + j) << 3))
      const sparseValue: f64 = load<f64>(sparseValuesPtr + (<usize>k << 3))

      const value: f64 = applyOperation(denseValue, sparseValue, operation)

      // Only store nonzero values
      if (value !== 0.0) {
        store<f64>(resultValuesPtr + (<usize>nnz << 3), value)
        store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
        nnz++
      }
    }
  }

  store<i32>(resultPtrPtr + (<usize>cols << 2), nnz)
  return nnz
}

/**
 * Dense-Sparse Function (Algorithm 03)
 * Processes all elements, calling f(D(i,j), S(i,j)) or f(D(i,j), 0)
 * Result: Dense matrix
 *
 * @param denseDataPtr - Pointer to dense matrix data (f64)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param sparseValuesPtr - Pointer to sparse matrix values (f64)
 * @param sparseIndexPtr - Pointer to sparse matrix row indices (i32)
 * @param sparsePtrPtr - Pointer to sparse matrix column pointers (i32)
 * @param resultPtr - Pointer to result dense matrix (f64)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @param workPtr - Working memory (f64 size rows for workspace, i32 size rows for marks)
 */
export function algo03DenseSparseFunction(
  denseDataPtr: usize,
  rows: i32,
  cols: i32,
  sparseValuesPtr: usize,
  sparseIndexPtr: usize,
  sparsePtrPtr: usize,
  resultPtr: usize,
  operation: i32,
  workPtr: usize
): void {
  // Workspace layout: [0, rows*8): workspace (f64), [rows*8, rows*8+rows*4): marks (i32)
  const workspacePtr: usize = workPtr
  const marksPtr: usize = workPtr + (<usize>rows << 3)

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    const mark: i32 = j + 1
    const pStart: i32 = load<i32>(sparsePtrPtr + (<usize>j << 2))
    const pEnd: i32 = load<i32>(sparsePtrPtr + (<usize>(j + 1) << 2))

    // Process nonzero elements in sparse matrix column j
    for (let k: i32 = pStart; k < pEnd; k++) {
      const i: i32 = load<i32>(sparseIndexPtr + (<usize>k << 2))
      const denseValue: f64 = load<f64>(denseDataPtr + (<usize>(i * cols + j) << 3))
      const sparseValue: f64 = load<f64>(sparseValuesPtr + (<usize>k << 3))

      store<f64>(workspacePtr + (<usize>i << 3), applyOperation(denseValue, sparseValue, operation))
      store<i32>(marksPtr + (<usize>i << 2), mark)
    }

    // Process all rows
    for (let i: i32 = 0; i < rows; i++) {
      const idx: usize = <usize>(i * cols + j) << 3
      if (load<i32>(marksPtr + (<usize>i << 2)) === mark) {
        store<f64>(resultPtr + idx, load<f64>(workspacePtr + (<usize>i << 3)))
      } else {
        // Sparse element is zero
        store<f64>(resultPtr + idx, applyOperation(load<f64>(denseDataPtr + idx), 0.0, operation))
      }
    }
  }
}

/**
 * Sparse-Sparse Identity-Identity (Algorithm 04)
 * Result includes union of nonzeros from both matrices
 * C(i,j) = f(A(i,j), B(i,j)) if both nonzero, else A(i,j) or B(i,j)
 *
 * @param aValuesPtr - Pointer to A values (f64)
 * @param aIndexPtr - Pointer to A row indices (i32)
 * @param aPtrPtr - Pointer to A column pointers (i32)
 * @param bValuesPtr - Pointer to B values (f64)
 * @param bIndexPtr - Pointer to B row indices (i32)
 * @param bPtrPtr - Pointer to B column pointers (i32)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultValuesPtr - Pointer to result values (f64)
 * @param resultIndexPtr - Pointer to result row indices (i32)
 * @param resultPtrPtr - Pointer to result column pointers (i32)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @param workPtr - Working memory: xa (f64, rows), xb (f64, rows), wa (i32, rows), wb (i32, rows)
 * @returns Number of nonzeros in result
 */
export function algo04SparseIdentity(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  rows: i32,
  cols: i32,
  resultValuesPtr: usize,
  resultIndexPtr: usize,
  resultPtrPtr: usize,
  operation: i32,
  workPtr: usize
): i32 {
  // Work layout: xa (f64, rows), xb (f64, rows), wa (i32, rows), wb (i32, rows)
  const xaPtr: usize = workPtr
  const xbPtr: usize = workPtr + (<usize>rows << 3)
  const waPtr: usize = workPtr + (<usize>(2 * rows) << 3)
  const wbPtr: usize = waPtr + (<usize>rows << 2)

  let nnz: i32 = 0

  // Process each column
  for (let j: i32 = 0; j < cols; j++) {
    store<i32>(resultPtrPtr + (<usize>j << 2), nnz)
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>j << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = aStart; k < aEnd; k++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>k << 2))
      store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
      nnz++
      store<i32>(waPtr + (<usize>i << 2), mark)
      store<f64>(xaPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>k << 3)))
    }

    // Scatter B(:,j) and merge
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = bStart; k < bEnd; k++) {
      const i: i32 = load<i32>(bIndexPtr + (<usize>k << 2))
      if (load<i32>(waPtr + (<usize>i << 2)) === mark) {
        // Both A and B have values
        store<f64>(xaPtr + (<usize>i << 3), applyOperation(load<f64>(xaPtr + (<usize>i << 3)), load<f64>(bValuesPtr + (<usize>k << 3)), operation))
      } else {
        // Only B has value
        store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
        nnz++
        store<i32>(wbPtr + (<usize>i << 2), mark)
        store<f64>(xbPtr + (<usize>i << 3), load<f64>(bValuesPtr + (<usize>k << 3)))
      }
    }

    // Gather values
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = load<i32>(resultIndexPtr + (<usize>p << 2))
      if (load<i32>(waPtr + (<usize>i << 2)) === mark) {
        store<f64>(resultValuesPtr + (<usize>p << 3), load<f64>(xaPtr + (<usize>i << 3)))
        p++
      } else if (load<i32>(wbPtr + (<usize>i << 2)) === mark) {
        store<f64>(resultValuesPtr + (<usize>p << 3), load<f64>(xbPtr + (<usize>i << 3)))
        p++
      } else {
        // Remove zero element
        for (let q: i32 = p; q < nnz - 1; q++) {
          store<i32>(resultIndexPtr + (<usize>q << 2), load<i32>(resultIndexPtr + (<usize>(q + 1) << 2)))
        }
        nnz--
      }
    }
  }

  store<i32>(resultPtrPtr + (<usize>cols << 2), nnz)
  return nnz
}

/**
 * Sparse-Sparse Function-Function (Algorithm 05)
 * Result only includes elements where at least one matrix has nonzero
 * C(i,j) = f(A(i,j), B(i,j)) where either is nonzero, treating missing as 0
 *
 * @param aValuesPtr - Pointer to A values (f64)
 * @param aIndexPtr - Pointer to A row indices (i32)
 * @param aPtrPtr - Pointer to A column pointers (i32)
 * @param bValuesPtr - Pointer to B values (f64)
 * @param bIndexPtr - Pointer to B row indices (i32)
 * @param bPtrPtr - Pointer to B column pointers (i32)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultValuesPtr - Pointer to result values (f64)
 * @param resultIndexPtr - Pointer to result row indices (i32)
 * @param resultPtrPtr - Pointer to result column pointers (i32)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @param workPtr - Working memory: xa (f64, rows), xb (f64, rows), wa (i32, rows), wb (i32, rows)
 * @returns Number of nonzeros in result
 */
export function algo05SparseFunctionFunction(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  rows: i32,
  cols: i32,
  resultValuesPtr: usize,
  resultIndexPtr: usize,
  resultPtrPtr: usize,
  operation: i32,
  workPtr: usize
): i32 {
  const xaPtr: usize = workPtr
  const xbPtr: usize = workPtr + (<usize>rows << 3)
  const waPtr: usize = workPtr + (<usize>(2 * rows) << 3)
  const wbPtr: usize = waPtr + (<usize>rows << 2)

  let nnz: i32 = 0

  for (let j: i32 = 0; j < cols; j++) {
    store<i32>(resultPtrPtr + (<usize>j << 2), nnz)
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>j << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = aStart; k < aEnd; k++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>k << 2))
      store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
      nnz++
      store<i32>(waPtr + (<usize>i << 2), mark)
      store<f64>(xaPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>k << 3)))
    }

    // Scatter B(:,j)
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = bStart; k < bEnd; k++) {
      const i: i32 = load<i32>(bIndexPtr + (<usize>k << 2))
      if (load<i32>(waPtr + (<usize>i << 2)) !== mark) {
        store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
        nnz++
      }
      store<i32>(wbPtr + (<usize>i << 2), mark)
      store<f64>(xbPtr + (<usize>i << 3), load<f64>(bValuesPtr + (<usize>k << 3)))
    }

    // Compute and gather
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = load<i32>(resultIndexPtr + (<usize>p << 2))
      const va: f64 = load<i32>(waPtr + (<usize>i << 2)) === mark ? load<f64>(xaPtr + (<usize>i << 3)) : 0.0
      const vb: f64 = load<i32>(wbPtr + (<usize>i << 2)) === mark ? load<f64>(xbPtr + (<usize>i << 3)) : 0.0
      const vc: f64 = applyOperation(va, vb, operation)

      if (vc !== 0.0) {
        store<f64>(resultValuesPtr + (<usize>p << 3), vc)
        p++
      } else {
        // Remove zero
        for (let q: i32 = p; q < nnz - 1; q++) {
          store<i32>(resultIndexPtr + (<usize>q << 2), load<i32>(resultIndexPtr + (<usize>(q + 1) << 2)))
        }
        nnz--
      }
    }
  }

  store<i32>(resultPtrPtr + (<usize>cols << 2), nnz)
  return nnz
}

/**
 * Sparse-Sparse Zero-Zero (Algorithm 06)
 * Result only includes intersection (both matrices have nonzero)
 * C(i,j) = f(A(i,j), B(i,j)) only where both are nonzero
 *
 * @param aValuesPtr - Pointer to A values (f64)
 * @param aIndexPtr - Pointer to A row indices (i32)
 * @param aPtrPtr - Pointer to A column pointers (i32)
 * @param bValuesPtr - Pointer to B values (f64)
 * @param bIndexPtr - Pointer to B row indices (i32)
 * @param bPtrPtr - Pointer to B column pointers (i32)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultValuesPtr - Pointer to result values (f64)
 * @param resultIndexPtr - Pointer to result row indices (i32)
 * @param resultPtrPtr - Pointer to result column pointers (i32)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @param workPtr - Working memory: workspace (f64, rows), wa (i32, rows), updated (i32, rows)
 * @returns Number of nonzeros in result
 */
export function algo06SparseZeroZero(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  rows: i32,
  cols: i32,
  resultValuesPtr: usize,
  resultIndexPtr: usize,
  resultPtrPtr: usize,
  operation: i32,
  workPtr: usize
): i32 {
  const workspacePtr: usize = workPtr
  const waPtr: usize = workPtr + (<usize>rows << 3)
  const updatedPtr: usize = waPtr + (<usize>rows << 2)

  let nnz: i32 = 0

  for (let j: i32 = 0; j < cols; j++) {
    store<i32>(resultPtrPtr + (<usize>j << 2), nnz)
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>j << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = aStart; k < aEnd; k++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>k << 2))
      store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
      nnz++
      store<i32>(waPtr + (<usize>i << 2), mark)
      store<f64>(workspacePtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>k << 3)))
    }

    // Process B(:,j) and compute where both exist
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = bStart; k < bEnd; k++) {
      const i: i32 = load<i32>(bIndexPtr + (<usize>k << 2))
      if (load<i32>(waPtr + (<usize>i << 2)) === mark) {
        store<f64>(workspacePtr + (<usize>i << 3), applyOperation(load<f64>(workspacePtr + (<usize>i << 3)), load<f64>(bValuesPtr + (<usize>k << 3)), operation))
        store<i32>(updatedPtr + (<usize>i << 2), mark)
      }
    }

    // Keep only elements where both matrices had values
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = load<i32>(resultIndexPtr + (<usize>p << 2))
      if (load<i32>(updatedPtr + (<usize>i << 2)) === mark) {
        const val: f64 = load<f64>(workspacePtr + (<usize>i << 3))
        if (val !== 0.0) {
          store<f64>(resultValuesPtr + (<usize>p << 3), val)
          p++
        } else {
          // Remove zero
          for (let q: i32 = p; q < nnz - 1; q++) {
            store<i32>(resultIndexPtr + (<usize>q << 2), load<i32>(resultIndexPtr + (<usize>(q + 1) << 2)))
          }
          nnz--
        }
      } else {
        // Remove - only in A, not in B
        for (let q: i32 = p; q < nnz - 1; q++) {
          store<i32>(resultIndexPtr + (<usize>q << 2), load<i32>(resultIndexPtr + (<usize>(q + 1) << 2)))
        }
        nnz--
      }
    }
  }

  store<i32>(resultPtrPtr + (<usize>cols << 2), nnz)
  return nnz
}

/**
 * Sparse-Sparse Full (Algorithm 07)
 * Processes ALL elements (dense result)
 * C(i,j) = f(A(i,j), B(i,j)) for all i,j, treating missing as 0
 *
 * @param aValuesPtr - Pointer to A values (f64)
 * @param aIndexPtr - Pointer to A row indices (i32)
 * @param aPtrPtr - Pointer to A column pointers (i32)
 * @param bValuesPtr - Pointer to B values (f64)
 * @param bIndexPtr - Pointer to B row indices (i32)
 * @param bPtrPtr - Pointer to B column pointers (i32)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultValuesPtr - Pointer to result values (f64)
 * @param resultIndexPtr - Pointer to result row indices (i32)
 * @param resultPtrPtr - Pointer to result column pointers (i32)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @param workPtr - Working memory: xa (f64, rows), xb (f64, rows), wa (i32, rows), wb (i32, rows)
 * @returns Number of nonzeros in result
 */
export function algo07SparseSparseFull(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  rows: i32,
  cols: i32,
  resultValuesPtr: usize,
  resultIndexPtr: usize,
  resultPtrPtr: usize,
  operation: i32,
  workPtr: usize
): i32 {
  const xaPtr: usize = workPtr
  const xbPtr: usize = workPtr + (<usize>rows << 3)
  const waPtr: usize = workPtr + (<usize>(2 * rows) << 3)
  const wbPtr: usize = waPtr + (<usize>rows << 2)

  let nnz: i32 = 0

  for (let j: i32 = 0; j < cols; j++) {
    store<i32>(resultPtrPtr + (<usize>j << 2), nnz)
    const mark: i32 = j + 1

    // Scatter A(:,j)
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>j << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = aStart; k < aEnd; k++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>k << 2))
      store<i32>(waPtr + (<usize>i << 2), mark)
      store<f64>(xaPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>k << 3)))
    }

    // Scatter B(:,j)
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = bStart; k < bEnd; k++) {
      const i: i32 = load<i32>(bIndexPtr + (<usize>k << 2))
      store<i32>(wbPtr + (<usize>i << 2), mark)
      store<f64>(xbPtr + (<usize>i << 3), load<f64>(bValuesPtr + (<usize>k << 3)))
    }

    // Process all rows
    for (let i: i32 = 0; i < rows; i++) {
      const va: f64 = load<i32>(waPtr + (<usize>i << 2)) === mark ? load<f64>(xaPtr + (<usize>i << 3)) : 0.0
      const vb: f64 = load<i32>(wbPtr + (<usize>i << 2)) === mark ? load<f64>(xbPtr + (<usize>i << 3)) : 0.0
      const vc: f64 = applyOperation(va, vb, operation)

      if (vc !== 0.0) {
        store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
        store<f64>(resultValuesPtr + (<usize>nnz << 3), vc)
        nnz++
      }
    }
  }

  store<i32>(resultPtrPtr + (<usize>cols << 2), nnz)
  return nnz
}

/**
 * Sparse-Sparse Zero-Identity (Algorithm 08)
 * Result includes A's nonzeros, computing f where both exist
 * C(i,j) = f(A(i,j), B(i,j)) where both nonzero, else A(i,j) if nonzero, else 0
 *
 * @param aValuesPtr - Pointer to A values (f64)
 * @param aIndexPtr - Pointer to A row indices (i32)
 * @param aPtrPtr - Pointer to A column pointers (i32)
 * @param bValuesPtr - Pointer to B values (f64)
 * @param bIndexPtr - Pointer to B row indices (i32)
 * @param bPtrPtr - Pointer to B column pointers (i32)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultValuesPtr - Pointer to result values (f64)
 * @param resultIndexPtr - Pointer to result row indices (i32)
 * @param resultPtrPtr - Pointer to result column pointers (i32)
 * @param operation - Operation type: 0=add, 1=sub, 2=mul, 3=div
 * @param workPtr - Working memory: workspace (f64, rows), marks (i32, rows)
 * @returns Number of nonzeros in result
 */
export function algo08SparseZeroIdentity(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  rows: i32,
  cols: i32,
  resultValuesPtr: usize,
  resultIndexPtr: usize,
  resultPtrPtr: usize,
  operation: i32,
  workPtr: usize
): i32 {
  const workspacePtr: usize = workPtr
  const marksPtr: usize = workPtr + (<usize>rows << 3)

  let nnz: i32 = 0

  for (let j: i32 = 0; j < cols; j++) {
    store<i32>(resultPtrPtr + (<usize>j << 2), nnz)
    const mark: i32 = j + 1
    const colStart: i32 = nnz

    // Scatter A(:,j)
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>j << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = aStart; k < aEnd; k++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>k << 2))
      store<i32>(marksPtr + (<usize>i << 2), mark)
      store<f64>(workspacePtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>k << 3)))
      store<i32>(resultIndexPtr + (<usize>nnz << 2), i)
      nnz++
    }

    // Update where B also has values
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))
    for (let k: i32 = bStart; k < bEnd; k++) {
      const i: i32 = load<i32>(bIndexPtr + (<usize>k << 2))
      if (load<i32>(marksPtr + (<usize>i << 2)) === mark) {
        store<f64>(workspacePtr + (<usize>i << 3), applyOperation(load<f64>(workspacePtr + (<usize>i << 3)), load<f64>(bValuesPtr + (<usize>k << 3)), operation))
      }
    }

    // Gather non-zero values
    let p: i32 = colStart
    while (p < nnz) {
      const i: i32 = load<i32>(resultIndexPtr + (<usize>p << 2))
      const v: f64 = load<f64>(workspacePtr + (<usize>i << 3))

      if (v !== 0.0) {
        store<f64>(resultValuesPtr + (<usize>p << 3), v)
        p++
      } else {
        // Remove zero
        for (let q: i32 = p; q < nnz - 1; q++) {
          store<i32>(resultIndexPtr + (<usize>q << 2), load<i32>(resultIndexPtr + (<usize>(q + 1) << 2)))
        }
        nnz--
      }
    }
  }

  store<i32>(resultPtrPtr + (<usize>cols << 2), nnz)
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
