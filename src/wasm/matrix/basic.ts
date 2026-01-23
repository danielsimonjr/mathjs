// @ts-nocheck
/**
 * WASM-optimized basic matrix operations using AssemblyScript
 *
 * All matrices are represented as flat arrays in row-major order.
 * Element at (i, j) in a matrix with `cols` columns is at index: i * cols + j
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// ============================================
// MATRIX CREATION
// ============================================

/**
 * Create a zero matrix of given dimensions
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to output matrix (f64, rows * cols elements)
 */
export function zeros(rows: i32, cols: i32, resultPtr: usize): void {
  const size: i32 = rows * cols
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
  }
}

/**
 * Create a ones matrix of given dimensions
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to output matrix (f64, rows * cols elements)
 */
export function ones(rows: i32, cols: i32, resultPtr: usize): void {
  const size: i32 = rows * cols
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 1.0)
  }
}

/**
 * Create an identity matrix of given size
 * @param n - Size of the square matrix (n x n)
 * @param resultPtr - Pointer to output matrix (f64, n * n elements)
 */
export function identity(n: i32, resultPtr: usize): void {
  const size: i32 = n * n
  // First zero out the matrix
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
  }
  // Set diagonal to 1
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(resultPtr + ((<usize>(i * n + i)) << 3), 1.0)
  }
}

/**
 * Create a matrix filled with a constant value
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param value - Fill value
 * @param resultPtr - Pointer to output matrix (f64, rows * cols elements)
 */
export function fill(rows: i32, cols: i32, value: f64, resultPtr: usize): void {
  const size: i32 = rows * cols
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), value)
  }
}

/**
 * Create a diagonal matrix from a vector
 * @param diagPtr - Pointer to diagonal elements (f64, n elements)
 * @param n - Size of the diagonal
 * @param resultPtr - Pointer to output square matrix (f64, n * n elements)
 */
export function diagFromVector(diagPtr: usize, n: i32, resultPtr: usize): void {
  const size: i32 = n * n
  // First zero out the matrix
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
  }
  // Set diagonal
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(
      resultPtr + ((<usize>(i * n + i)) << 3),
      load<f64>(diagPtr + ((<usize>i) << 3))
    )
  }
}

/**
 * Create a matrix with ones on specified diagonal
 * @param n - Size of the square matrix
 * @param k - Diagonal offset (0 = main, positive = above, negative = below)
 * @param resultPtr - Pointer to output matrix (f64, n * n elements)
 */
export function eye(n: i32, k: i32, resultPtr: usize): void {
  const size: i32 = n * n
  // First zero out the matrix
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
  }

  if (k >= 0) {
    // Upper diagonal
    const count: i32 = n - k
    for (let i: i32 = 0; i < count; i++) {
      store<f64>(resultPtr + ((<usize>(i * n + (i + k))) << 3), 1.0)
    }
  } else {
    // Lower diagonal
    const count: i32 = n + k
    for (let i: i32 = 0; i < count; i++) {
      store<f64>(resultPtr + ((<usize>((i - k) * n + i)) << 3), 1.0)
    }
  }
}

// ============================================
// DIAGONAL OPERATIONS
// ============================================

/**
 * Extract the main diagonal from a matrix
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to diagonal output (f64, min(rows, cols) elements)
 * @returns Number of diagonal elements extracted
 */
export function diag(aPtr: usize, rows: i32, cols: i32, resultPtr: usize): i32 {
  const n: i32 = rows < cols ? rows : cols
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>(i * cols + i)) << 3))
    )
  }
  return n
}

/**
 * Extract a specified diagonal from a matrix
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param k - Diagonal offset (0 = main, positive = above, negative = below)
 * @param resultPtr - Pointer to diagonal output (f64)
 * @returns Number of diagonal elements extracted
 */
export function diagK(
  aPtr: usize,
  rows: i32,
  cols: i32,
  k: i32,
  resultPtr: usize
): i32 {
  let n: i32
  let startRow: i32
  let startCol: i32

  if (k >= 0) {
    // Upper diagonal
    n = rows < cols - k ? rows : cols - k
    startRow = 0
    startCol = k
  } else {
    // Lower diagonal
    n = rows + k < cols ? rows + k : cols
    startRow = -k
    startCol = 0
  }

  if (n <= 0) {
    return 0
  }

  for (let i: i32 = 0; i < n; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>((startRow + i) * cols + (startCol + i))) << 3))
    )
  }

  return n
}

/**
 * Compute the trace (sum of diagonal elements)
 * @param aPtr - Pointer to input square matrix (f64, row-major)
 * @param n - Size of the matrix (n x n)
 * @returns Sum of diagonal elements
 */
export function trace(aPtr: usize, n: i32): f64 {
  let sum: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    sum += load<f64>(aPtr + ((<usize>(i * n + i)) << 3))
  }
  return sum
}

/**
 * Compute trace for a rectangular matrix (min(rows, cols) diagonal elements)
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Sum of diagonal elements
 */
export function traceRect(aPtr: usize, rows: i32, cols: i32): f64 {
  const n: i32 = rows < cols ? rows : cols
  let sum: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    sum += load<f64>(aPtr + ((<usize>(i * cols + i)) << 3))
  }
  return sum
}

// ============================================
// RESHAPE AND FLATTEN
// ============================================

/**
 * Flatten a matrix to a 1D array (copy)
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param size - Total number of elements
 * @param resultPtr - Pointer to output array (f64, size elements)
 */
export function flatten(aPtr: usize, size: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>i) << 3))
    )
  }
}

/**
 * Reshape a matrix (reinterpret dimensions, data unchanged)
 * This is essentially a copy for flat arrays, just validates dimensions
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param oldRows - Original rows
 * @param oldCols - Original columns
 * @param newRows - New rows
 * @param newCols - New columns
 * @param resultPtr - Pointer to reshaped output (f64)
 * @returns 1 if successful, 0 if dimensions don't match
 */
export function reshape(
  aPtr: usize,
  oldRows: i32,
  oldCols: i32,
  newRows: i32,
  newCols: i32,
  resultPtr: usize
): i32 {
  const oldSize: i32 = oldRows * oldCols
  const newSize: i32 = newRows * newCols

  // Sizes must match
  if (oldSize !== newSize) {
    return 0
  }

  // Copy the data (same layout, different interpretation)
  for (let i: i32 = 0; i < newSize; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>i) << 3))
    )
  }

  return 1
}

/**
 * Squeeze removes singleton dimensions (not applicable for flat arrays)
 * For flat arrays, this just copies the data
 * @param aPtr - Pointer to input array (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to output array (f64)
 */
export function squeeze(aPtr: usize, size: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>i) << 3))
    )
  }
}

// ============================================
// MATRIX PROPERTIES
// ============================================

/**
 * Count non-zero elements in a matrix
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Count of non-zero elements
 */
export function countNonZero(aPtr: usize, size: i32): i32 {
  let count: i32 = 0
  for (let i: i32 = 0; i < size; i++) {
    if (load<f64>(aPtr + ((<usize>i) << 3)) !== 0.0) {
      count++
    }
  }
  return count
}

/**
 * Find minimum value in a matrix
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Minimum value
 */
export function min(aPtr: usize, size: i32): f64 {
  if (size === 0) return f64.NaN

  let minVal: f64 = load<f64>(aPtr)
  for (let i: i32 = 1; i < size; i++) {
    const val: f64 = load<f64>(aPtr + ((<usize>i) << 3))
    if (val < minVal) {
      minVal = val
    }
  }
  return minVal
}

/**
 * Find maximum value in a matrix
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Maximum value
 */
export function max(aPtr: usize, size: i32): f64 {
  if (size === 0) return f64.NaN

  let maxVal: f64 = load<f64>(aPtr)
  for (let i: i32 = 1; i < size; i++) {
    const val: f64 = load<f64>(aPtr + ((<usize>i) << 3))
    if (val > maxVal) {
      maxVal = val
    }
  }
  return maxVal
}

/**
 * Find index of minimum value
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Index of minimum value
 */
export function argmin(aPtr: usize, size: i32): i32 {
  if (size === 0) return -1

  let minIdx: i32 = 0
  let minVal: f64 = load<f64>(aPtr)

  for (let i: i32 = 1; i < size; i++) {
    const val: f64 = load<f64>(aPtr + ((<usize>i) << 3))
    if (val < minVal) {
      minVal = val
      minIdx = i
    }
  }

  return minIdx
}

/**
 * Find index of maximum value
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Index of maximum value
 */
export function argmax(aPtr: usize, size: i32): i32 {
  if (size === 0) return -1

  let maxIdx: i32 = 0
  let maxVal: f64 = load<f64>(aPtr)

  for (let i: i32 = 1; i < size; i++) {
    const val: f64 = load<f64>(aPtr + ((<usize>i) << 3))
    if (val > maxVal) {
      maxVal = val
      maxIdx = i
    }
  }

  return maxIdx
}

// ============================================
// ROW AND COLUMN OPERATIONS
// ============================================

/**
 * Extract a row from a matrix
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param cols - Number of columns
 * @param row - Row index to extract
 * @param resultPtr - Pointer to row output (f64, cols elements)
 */
export function getRow(
  aPtr: usize,
  cols: i32,
  row: i32,
  resultPtr: usize
): void {
  const offset: i32 = row * cols
  for (let j: i32 = 0; j < cols; j++) {
    store<f64>(
      resultPtr + ((<usize>j) << 3),
      load<f64>(aPtr + ((<usize>(offset + j)) << 3))
    )
  }
}

/**
 * Extract a column from a matrix
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param col - Column index to extract
 * @param resultPtr - Pointer to column output (f64, rows elements)
 */
export function getColumn(
  aPtr: usize,
  rows: i32,
  cols: i32,
  col: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < rows; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>(i * cols + col)) << 3))
    )
  }
}

/**
 * Set a row in a matrix (in-place)
 * @param aPtr - Pointer to matrix to modify (f64, row-major)
 * @param cols - Number of columns
 * @param row - Row index
 * @param valuesPtr - Pointer to new row values (f64, cols elements)
 */
export function setRow(
  aPtr: usize,
  cols: i32,
  row: i32,
  valuesPtr: usize
): void {
  const offset: i32 = row * cols
  for (let j: i32 = 0; j < cols; j++) {
    store<f64>(
      aPtr + ((<usize>(offset + j)) << 3),
      load<f64>(valuesPtr + ((<usize>j) << 3))
    )
  }
}

/**
 * Set a column in a matrix (in-place)
 * @param aPtr - Pointer to matrix to modify (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param col - Column index
 * @param valuesPtr - Pointer to new column values (f64, rows elements)
 */
export function setColumn(
  aPtr: usize,
  rows: i32,
  cols: i32,
  col: i32,
  valuesPtr: usize
): void {
  for (let i: i32 = 0; i < rows; i++) {
    store<f64>(
      aPtr + ((<usize>(i * cols + col)) << 3),
      load<f64>(valuesPtr + ((<usize>i) << 3))
    )
  }
}

/**
 * Swap two rows in a matrix (in-place)
 * @param aPtr - Pointer to matrix to modify (f64, row-major)
 * @param cols - Number of columns
 * @param row1 - First row index
 * @param row2 - Second row index
 */
export function swapRows(aPtr: usize, cols: i32, row1: i32, row2: i32): void {
  const offset1: i32 = row1 * cols
  const offset2: i32 = row2 * cols

  for (let j: i32 = 0; j < cols; j++) {
    const idx1: usize = (<usize>(offset1 + j)) << 3
    const idx2: usize = (<usize>(offset2 + j)) << 3
    const temp: f64 = load<f64>(aPtr + idx1)
    store<f64>(aPtr + idx1, load<f64>(aPtr + idx2))
    store<f64>(aPtr + idx2, temp)
  }
}

/**
 * Swap two columns in a matrix (in-place)
 * @param aPtr - Pointer to matrix to modify (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param col1 - First column index
 * @param col2 - Second column index
 */
export function swapColumns(
  aPtr: usize,
  rows: i32,
  cols: i32,
  col1: i32,
  col2: i32
): void {
  for (let i: i32 = 0; i < rows; i++) {
    const idx1: usize = (<usize>(i * cols + col1)) << 3
    const idx2: usize = (<usize>(i * cols + col2)) << 3
    const temp: f64 = load<f64>(aPtr + idx1)
    store<f64>(aPtr + idx1, load<f64>(aPtr + idx2))
    store<f64>(aPtr + idx2, temp)
  }
}

// ============================================
// ELEMENT-WISE OPERATIONS
// ============================================

/**
 * Element-wise multiplication (Hadamard product)
 * @param aPtr - Pointer to first matrix (f64)
 * @param bPtr - Pointer to second matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to element-wise product output (f64)
 */
export function dotMultiply(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      resultPtr + offset,
      load<f64>(aPtr + offset) * load<f64>(bPtr + offset)
    )
  }
}

/**
 * Element-wise division
 * @param aPtr - Pointer to numerator matrix (f64)
 * @param bPtr - Pointer to denominator matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to element-wise quotient output (f64)
 */
export function dotDivide(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      resultPtr + offset,
      load<f64>(aPtr + offset) / load<f64>(bPtr + offset)
    )
  }
}

/**
 * Element-wise power
 * @param aPtr - Pointer to base matrix (f64)
 * @param bPtr - Pointer to exponent matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to element-wise power output (f64)
 */
export function dotPow(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      resultPtr + offset,
      Math.pow(load<f64>(aPtr + offset), load<f64>(bPtr + offset))
    )
  }
}

/**
 * Element-wise absolute value
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to matrix of absolute values (f64)
 */
export function abs(aPtr: usize, size: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    const val: f64 = load<f64>(aPtr + offset)
    store<f64>(resultPtr + offset, val >= 0.0 ? val : -val)
  }
}

/**
 * Element-wise square root
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to matrix of square roots (f64)
 */
export function sqrt(aPtr: usize, size: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(resultPtr + offset, Math.sqrt(load<f64>(aPtr + offset)))
  }
}

/**
 * Element-wise square
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to matrix of squares (f64)
 */
export function square(aPtr: usize, size: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    const val: f64 = load<f64>(aPtr + offset)
    store<f64>(resultPtr + offset, val * val)
  }
}

// ============================================
// REDUCTION OPERATIONS
// ============================================

/**
 * Sum of all elements
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Sum
 */
export function sum(aPtr: usize, size: i32): f64 {
  let total: f64 = 0.0
  for (let i: i32 = 0; i < size; i++) {
    total += load<f64>(aPtr + ((<usize>i) << 3))
  }
  return total
}

/**
 * Product of all elements
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @returns Product
 */
export function prod(aPtr: usize, size: i32): f64 {
  let total: f64 = 1.0
  for (let i: i32 = 0; i < size; i++) {
    total *= load<f64>(aPtr + ((<usize>i) << 3))
  }
  return total
}

/**
 * Sum along rows (result is a column vector stored as 1D)
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to sum of each row (f64, rows elements)
 */
export function sumRows(
  aPtr: usize,
  rows: i32,
  cols: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < rows; i++) {
    let rowSum: f64 = 0.0
    const offset: i32 = i * cols

    for (let j: i32 = 0; j < cols; j++) {
      rowSum += load<f64>(aPtr + ((<usize>(offset + j)) << 3))
    }

    store<f64>(resultPtr + ((<usize>i) << 3), rowSum)
  }
}

/**
 * Sum along columns (result is a row vector stored as 1D)
 * @param aPtr - Pointer to input matrix (f64, row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to sum of each column (f64, cols elements)
 */
export function sumCols(
  aPtr: usize,
  rows: i32,
  cols: i32,
  resultPtr: usize
): void {
  // Initialize to zero
  for (let j: i32 = 0; j < cols; j++) {
    store<f64>(resultPtr + ((<usize>j) << 3), 0.0)
  }

  for (let i: i32 = 0; i < rows; i++) {
    for (let j: i32 = 0; j < cols; j++) {
      const jOffset: usize = (<usize>j) << 3
      store<f64>(
        resultPtr + jOffset,
        load<f64>(resultPtr + jOffset) +
          load<f64>(aPtr + ((<usize>(i * cols + j)) << 3))
      )
    }
  }
}

// ============================================
// COPY AND CLONE
// ============================================

/**
 * Create a copy of a matrix
 * @param aPtr - Pointer to input matrix (f64)
 * @param size - Number of elements
 * @param resultPtr - Pointer to copy of the matrix (f64)
 */
export function clone(aPtr: usize, size: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
  }
}

/**
 * Copy values from source to destination
 * @param srcPtr - Pointer to source matrix (f64)
 * @param dstPtr - Pointer to destination matrix (f64)
 * @param size - Number of elements
 */
export function copy(srcPtr: usize, dstPtr: usize, size: i32): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(dstPtr + offset, load<f64>(srcPtr + offset))
  }
}

/**
 * Fill a matrix with a value (in-place)
 * @param aPtr - Pointer to matrix to fill (f64)
 * @param size - Number of elements
 * @param value - Fill value
 */
export function fillInPlace(aPtr: usize, size: i32, value: f64): void {
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(aPtr + ((<usize>i) << 3), value)
  }
}

// ============================================
// CONCATENATION
// ============================================

/**
 * Concatenate two matrices horizontally (same number of rows)
 * @param aPtr - Pointer to first matrix (f64, row-major)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param bPtr - Pointer to second matrix (f64, row-major)
 * @param bCols - Columns in B
 * @param resultPtr - Pointer to concatenated matrix [A | B] (f64)
 */
export function concatHorizontal(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  bPtr: usize,
  bCols: i32,
  resultPtr: usize
): void {
  const newCols: i32 = aCols + bCols

  for (let i: i32 = 0; i < aRows; i++) {
    // Copy row from A
    for (let j: i32 = 0; j < aCols; j++) {
      store<f64>(
        resultPtr + ((<usize>(i * newCols + j)) << 3),
        load<f64>(aPtr + ((<usize>(i * aCols + j)) << 3))
      )
    }
    // Copy row from B
    for (let j: i32 = 0; j < bCols; j++) {
      store<f64>(
        resultPtr + ((<usize>(i * newCols + aCols + j)) << 3),
        load<f64>(bPtr + ((<usize>(i * bCols + j)) << 3))
      )
    }
  }
}

/**
 * Concatenate two matrices vertically (same number of columns)
 * @param aPtr - Pointer to first matrix (f64, row-major)
 * @param aRows - Rows in A
 * @param cols - Columns (same for both)
 * @param bPtr - Pointer to second matrix (f64, row-major)
 * @param bRows - Rows in B
 * @param resultPtr - Pointer to concatenated matrix [A; B] (f64)
 */
export function concatVertical(
  aPtr: usize,
  aRows: i32,
  cols: i32,
  bPtr: usize,
  bRows: i32,
  resultPtr: usize
): void {
  const aSize: i32 = aRows * cols
  const bSize: i32 = bRows * cols

  // Copy A
  for (let i: i32 = 0; i < aSize; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>i) << 3))
    )
  }

  // Copy B
  for (let i: i32 = 0; i < bSize; i++) {
    store<f64>(
      resultPtr + ((<usize>(aSize + i)) << 3),
      load<f64>(bPtr + ((<usize>i) << 3))
    )
  }
}
