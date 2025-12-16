/**
 * WASM-optimized basic matrix operations using AssemblyScript
 *
 * All matrices are represented as flat Float64Array in row-major order.
 * Element at (i, j) in a matrix with `cols` columns is at index: i * cols + j
 */

// ============================================
// MATRIX CREATION
// ============================================

/**
 * Create a zero matrix of given dimensions
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Zero matrix (row-major)
 */
export function zeros(rows: i32, cols: i32): Float64Array {
  return new Float64Array(rows * cols)
}

/**
 * Create a ones matrix of given dimensions
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Matrix filled with ones (row-major)
 */
export function ones(rows: i32, cols: i32): Float64Array {
  const size: i32 = rows * cols
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = 1.0
  }

  return result
}

/**
 * Create an identity matrix of given size
 * @param n - Size of the square matrix (n x n)
 * @returns Identity matrix (row-major)
 */
export function identity(n: i32): Float64Array {
  const result = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    result[i * n + i] = 1.0
  }

  return result
}

/**
 * Create a matrix filled with a constant value
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param value - Fill value
 * @returns Matrix filled with value (row-major)
 */
export function fill(rows: i32, cols: i32, value: f64): Float64Array {
  const size: i32 = rows * cols
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = value
  }

  return result
}

/**
 * Create a diagonal matrix from a vector
 * @param diag - Diagonal elements
 * @param n - Size of the diagonal
 * @returns Square matrix with diagonal (row-major)
 */
export function diagFromVector(diag: Float64Array, n: i32): Float64Array {
  const result = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    result[i * n + i] = diag[i]
  }

  return result
}

/**
 * Create a matrix with ones on specified diagonal
 * @param n - Size of the square matrix
 * @param k - Diagonal offset (0 = main, positive = above, negative = below)
 * @returns Matrix with ones on diagonal k (row-major)
 */
export function eye(n: i32, k: i32): Float64Array {
  const result = new Float64Array(n * n)

  if (k >= 0) {
    // Upper diagonal
    const count: i32 = n - k
    for (let i: i32 = 0; i < count; i++) {
      result[i * n + (i + k)] = 1.0
    }
  } else {
    // Lower diagonal
    const count: i32 = n + k
    for (let i: i32 = 0; i < count; i++) {
      result[(i - k) * n + i] = 1.0
    }
  }

  return result
}

// ============================================
// DIAGONAL OPERATIONS
// ============================================

/**
 * Extract the main diagonal from a matrix
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Diagonal elements
 */
export function diag(a: Float64Array, rows: i32, cols: i32): Float64Array {
  const n: i32 = rows < cols ? rows : cols
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i * cols + i]
  }

  return result
}

/**
 * Extract a specified diagonal from a matrix
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param k - Diagonal offset (0 = main, positive = above, negative = below)
 * @returns Diagonal elements
 */
export function diagK(
  a: Float64Array,
  rows: i32,
  cols: i32,
  k: i32
): Float64Array {
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
    return new Float64Array(0)
  }

  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[(startRow + i) * cols + (startCol + i)]
  }

  return result
}

/**
 * Compute the trace (sum of diagonal elements)
 * @param a - Input square matrix (row-major)
 * @param n - Size of the matrix (n x n)
 * @returns Sum of diagonal elements
 */
export function trace(a: Float64Array, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += a[i * n + i]
  }

  return sum
}

/**
 * Compute trace for a rectangular matrix (min(rows, cols) diagonal elements)
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Sum of diagonal elements
 */
export function traceRect(a: Float64Array, rows: i32, cols: i32): f64 {
  const n: i32 = rows < cols ? rows : cols
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += a[i * cols + i]
  }

  return sum
}

// ============================================
// RESHAPE AND FLATTEN
// ============================================

/**
 * Flatten a matrix to a 1D array (already flat, just copy)
 * @param a - Input matrix (row-major)
 * @param size - Total number of elements
 * @returns Copy of the flat array
 */
export function flatten(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i]
  }

  return result
}

/**
 * Reshape a matrix (reinterpret dimensions, data unchanged)
 * This is essentially a no-op for flat arrays, just validates dimensions
 * @param a - Input matrix (row-major)
 * @param oldRows - Original rows
 * @param oldCols - Original columns
 * @param newRows - New rows
 * @param newCols - New columns
 * @returns Reshaped matrix (same data, new interpretation)
 */
export function reshape(
  a: Float64Array,
  oldRows: i32,
  oldCols: i32,
  newRows: i32,
  newCols: i32
): Float64Array {
  const oldSize: i32 = oldRows * oldCols
  const newSize: i32 = newRows * newCols

  // Sizes must match
  if (oldSize !== newSize) {
    // Return empty array to indicate error
    return new Float64Array(0)
  }

  // Copy the data (same layout, different interpretation)
  const result = new Float64Array(newSize)

  for (let i: i32 = 0; i < newSize; i++) {
    result[i] = a[i]
  }

  return result
}

/**
 * Squeeze removes singleton dimensions (not applicable for flat arrays)
 * For flat arrays, this just copies the data
 * @param a - Input array
 * @param size - Number of elements
 * @returns Copy of the array
 */
export function squeeze(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i]
  }

  return result
}

// ============================================
// MATRIX PROPERTIES
// ============================================

/**
 * Count non-zero elements in a matrix
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Count of non-zero elements
 */
export function countNonZero(a: Float64Array, size: i32): i32 {
  let count: i32 = 0

  for (let i: i32 = 0; i < size; i++) {
    if (a[i] !== 0.0) {
      count++
    }
  }

  return count
}

/**
 * Find minimum value in a matrix
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Minimum value
 */
export function min(a: Float64Array, size: i32): f64 {
  if (size === 0) return f64.NaN

  let minVal: f64 = a[0]

  for (let i: i32 = 1; i < size; i++) {
    if (a[i] < minVal) {
      minVal = a[i]
    }
  }

  return minVal
}

/**
 * Find maximum value in a matrix
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Maximum value
 */
export function max(a: Float64Array, size: i32): f64 {
  if (size === 0) return f64.NaN

  let maxVal: f64 = a[0]

  for (let i: i32 = 1; i < size; i++) {
    if (a[i] > maxVal) {
      maxVal = a[i]
    }
  }

  return maxVal
}

/**
 * Find index of minimum value
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Index of minimum value
 */
export function argmin(a: Float64Array, size: i32): i32 {
  if (size === 0) return -1

  let minIdx: i32 = 0
  let minVal: f64 = a[0]

  for (let i: i32 = 1; i < size; i++) {
    if (a[i] < minVal) {
      minVal = a[i]
      minIdx = i
    }
  }

  return minIdx
}

/**
 * Find index of maximum value
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Index of maximum value
 */
export function argmax(a: Float64Array, size: i32): i32 {
  if (size === 0) return -1

  let maxIdx: i32 = 0
  let maxVal: f64 = a[0]

  for (let i: i32 = 1; i < size; i++) {
    if (a[i] > maxVal) {
      maxVal = a[i]
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
 * @param a - Input matrix (row-major)
 * @param cols - Number of columns
 * @param row - Row index to extract
 * @returns Row as a 1D array
 */
export function getRow(a: Float64Array, cols: i32, row: i32): Float64Array {
  const result = new Float64Array(cols)
  const offset: i32 = row * cols

  for (let j: i32 = 0; j < cols; j++) {
    result[j] = a[offset + j]
  }

  return result
}

/**
 * Extract a column from a matrix
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param col - Column index to extract
 * @returns Column as a 1D array
 */
export function getColumn(
  a: Float64Array,
  rows: i32,
  cols: i32,
  col: i32
): Float64Array {
  const result = new Float64Array(rows)

  for (let i: i32 = 0; i < rows; i++) {
    result[i] = a[i * cols + col]
  }

  return result
}

/**
 * Set a row in a matrix (in-place)
 * @param a - Matrix to modify (row-major)
 * @param cols - Number of columns
 * @param row - Row index
 * @param values - New row values
 */
export function setRow(
  a: Float64Array,
  cols: i32,
  row: i32,
  values: Float64Array
): void {
  const offset: i32 = row * cols

  for (let j: i32 = 0; j < cols; j++) {
    a[offset + j] = values[j]
  }
}

/**
 * Set a column in a matrix (in-place)
 * @param a - Matrix to modify (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param col - Column index
 * @param values - New column values
 */
export function setColumn(
  a: Float64Array,
  rows: i32,
  cols: i32,
  col: i32,
  values: Float64Array
): void {
  for (let i: i32 = 0; i < rows; i++) {
    a[i * cols + col] = values[i]
  }
}

/**
 * Swap two rows in a matrix (in-place)
 * @param a - Matrix to modify (row-major)
 * @param cols - Number of columns
 * @param row1 - First row index
 * @param row2 - Second row index
 */
export function swapRows(
  a: Float64Array,
  cols: i32,
  row1: i32,
  row2: i32
): void {
  const offset1: i32 = row1 * cols
  const offset2: i32 = row2 * cols

  for (let j: i32 = 0; j < cols; j++) {
    const temp: f64 = a[offset1 + j]
    a[offset1 + j] = a[offset2 + j]
    a[offset2 + j] = temp
  }
}

/**
 * Swap two columns in a matrix (in-place)
 * @param a - Matrix to modify (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param col1 - First column index
 * @param col2 - Second column index
 */
export function swapColumns(
  a: Float64Array,
  rows: i32,
  cols: i32,
  col1: i32,
  col2: i32
): void {
  for (let i: i32 = 0; i < rows; i++) {
    const idx1: i32 = i * cols + col1
    const idx2: i32 = i * cols + col2
    const temp: f64 = a[idx1]
    a[idx1] = a[idx2]
    a[idx2] = temp
  }
}

// ============================================
// ELEMENT-WISE OPERATIONS
// ============================================

/**
 * Element-wise multiplication (Hadamard product)
 * @param a - First matrix
 * @param b - Second matrix
 * @param size - Number of elements
 * @returns Element-wise product
 */
export function dotMultiply(
  a: Float64Array,
  b: Float64Array,
  size: i32
): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] * b[i]
  }

  return result
}

/**
 * Element-wise division
 * @param a - Numerator matrix
 * @param b - Denominator matrix
 * @param size - Number of elements
 * @returns Element-wise quotient
 */
export function dotDivide(
  a: Float64Array,
  b: Float64Array,
  size: i32
): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] / b[i]
  }

  return result
}

/**
 * Element-wise power
 * @param a - Base matrix
 * @param b - Exponent matrix
 * @param size - Number of elements
 * @returns Element-wise power
 */
export function dotPow(
  a: Float64Array,
  b: Float64Array,
  size: i32
): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = Math.pow(a[i], b[i])
  }

  return result
}

/**
 * Element-wise absolute value
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Matrix of absolute values
 */
export function abs(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] >= 0.0 ? a[i] : -a[i]
  }

  return result
}

/**
 * Element-wise square root
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Matrix of square roots
 */
export function sqrt(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = Math.sqrt(a[i])
  }

  return result
}

/**
 * Element-wise square
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Matrix of squares
 */
export function square(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] * a[i]
  }

  return result
}

// ============================================
// REDUCTION OPERATIONS
// ============================================

/**
 * Sum of all elements
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Sum
 */
export function sum(a: Float64Array, size: i32): f64 {
  let total: f64 = 0.0

  for (let i: i32 = 0; i < size; i++) {
    total += a[i]
  }

  return total
}

/**
 * Product of all elements
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Product
 */
export function prod(a: Float64Array, size: i32): f64 {
  let total: f64 = 1.0

  for (let i: i32 = 0; i < size; i++) {
    total *= a[i]
  }

  return total
}

/**
 * Sum along rows (result is a column vector stored as 1D)
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Sum of each row
 */
export function sumRows(a: Float64Array, rows: i32, cols: i32): Float64Array {
  const result = new Float64Array(rows)

  for (let i: i32 = 0; i < rows; i++) {
    let rowSum: f64 = 0.0
    const offset: i32 = i * cols

    for (let j: i32 = 0; j < cols; j++) {
      rowSum += a[offset + j]
    }

    result[i] = rowSum
  }

  return result
}

/**
 * Sum along columns (result is a row vector stored as 1D)
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Sum of each column
 */
export function sumCols(a: Float64Array, rows: i32, cols: i32): Float64Array {
  const result = new Float64Array(cols)

  for (let j: i32 = 0; j < cols; j++) {
    let colSum: f64 = 0.0

    for (let i: i32 = 0; i < rows; i++) {
      colSum += a[i * cols + j]
    }

    result[j] = colSum
  }

  return result
}

// ============================================
// COPY AND CLONE
// ============================================

/**
 * Create a copy of a matrix
 * @param a - Input matrix
 * @param size - Number of elements
 * @returns Copy of the matrix
 */
export function clone(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)

  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i]
  }

  return result
}

/**
 * Copy values from source to destination
 * @param src - Source matrix
 * @param dst - Destination matrix
 * @param size - Number of elements
 */
export function copy(src: Float64Array, dst: Float64Array, size: i32): void {
  for (let i: i32 = 0; i < size; i++) {
    dst[i] = src[i]
  }
}

/**
 * Fill a matrix with a value (in-place)
 * @param a - Matrix to fill
 * @param size - Number of elements
 * @param value - Fill value
 */
export function fillInPlace(a: Float64Array, size: i32, value: f64): void {
  for (let i: i32 = 0; i < size; i++) {
    a[i] = value
  }
}

// ============================================
// CONCATENATION
// ============================================

/**
 * Concatenate two matrices horizontally (same number of rows)
 * @param a - First matrix (row-major)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param b - Second matrix (row-major)
 * @param bCols - Columns in B
 * @returns Concatenated matrix [A | B]
 */
export function concatHorizontal(
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  b: Float64Array,
  bCols: i32
): Float64Array {
  const newCols: i32 = aCols + bCols
  const result = new Float64Array(aRows * newCols)

  for (let i: i32 = 0; i < aRows; i++) {
    // Copy row from A
    for (let j: i32 = 0; j < aCols; j++) {
      result[i * newCols + j] = a[i * aCols + j]
    }
    // Copy row from B
    for (let j: i32 = 0; j < bCols; j++) {
      result[i * newCols + aCols + j] = b[i * bCols + j]
    }
  }

  return result
}

/**
 * Concatenate two matrices vertically (same number of columns)
 * @param a - First matrix (row-major)
 * @param aRows - Rows in A
 * @param cols - Columns (same for both)
 * @param b - Second matrix (row-major)
 * @param bRows - Rows in B
 * @returns Concatenated matrix [A; B]
 */
export function concatVertical(
  a: Float64Array,
  aRows: i32,
  cols: i32,
  b: Float64Array,
  bRows: i32
): Float64Array {
  const newRows: i32 = aRows + bRows
  const aSize: i32 = aRows * cols
  const bSize: i32 = bRows * cols
  const result = new Float64Array(newRows * cols)

  // Copy A
  for (let i: i32 = 0; i < aSize; i++) {
    result[i] = a[i]
  }

  // Copy B
  for (let i: i32 = 0; i < bSize; i++) {
    result[aSize + i] = b[i]
  }

  return result
}
