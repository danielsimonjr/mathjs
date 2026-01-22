/**
 * WASM-optimized selection algorithms
 *
 * Implements QuickSelect and related algorithms for finding
 * k-th smallest/largest elements in O(n) average time.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Partition array around pivot (Lomuto scheme)
 * @param arrPtr - Pointer to array (f64, modified in place)
 * @param left - Left bound
 * @param right - Right bound
 * @returns Index of pivot after partitioning
 */
function partition(arrPtr: usize, left: i32, right: i32): i32 {
  const pivot: f64 = load<f64>(arrPtr + ((<usize>right) << 3))
  let i: i32 = left

  for (let j: i32 = left; j < right; j++) {
    const jOffset: usize = (<usize>j) << 3
    if (load<f64>(arrPtr + jOffset) <= pivot) {
      const iOffset: usize = (<usize>i) << 3
      const temp: f64 = load<f64>(arrPtr + iOffset)
      store<f64>(arrPtr + iOffset, load<f64>(arrPtr + jOffset))
      store<f64>(arrPtr + jOffset, temp)
      i++
    }
  }

  const iOffset: usize = (<usize>i) << 3
  const rightOffset: usize = (<usize>right) << 3
  const temp: f64 = load<f64>(arrPtr + iOffset)
  store<f64>(arrPtr + iOffset, load<f64>(arrPtr + rightOffset))
  store<f64>(arrPtr + rightOffset, temp)

  return i
}

/**
 * QuickSelect algorithm - find k-th smallest element
 *
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param k - Index to select (0-based, so k=0 is minimum)
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns k-th smallest element
 */
export function partitionSelect(
  dataPtr: usize,
  n: i32,
  k: i32,
  workPtr: usize
): f64 {
  if (n === 0 || k < 0 || k >= n) {
    return f64.NaN
  }

  // Copy to working memory
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(workPtr + offset, load<f64>(dataPtr + offset))
  }

  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIndex: i32 = partition(workPtr, left, right)

    if (pivotIndex === k) {
      return load<f64>(workPtr + ((<usize>k) << 3))
    } else if (pivotIndex < k) {
      left = pivotIndex + 1
    } else {
      right = pivotIndex - 1
    }
  }

  return load<f64>(workPtr + ((<usize>k) << 3))
}

/**
 * Select median value
 * For even n, returns lower median
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns Median value
 */
export function selectMedian(dataPtr: usize, n: i32, workPtr: usize): f64 {
  if (n === 0) {
    return f64.NaN
  }
  const k: i32 = <i32>Math.floor(<f64>n / 2.0)
  return partitionSelect(dataPtr, n, k, workPtr)
}

/**
 * Select minimum value
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns Minimum value
 */
export function selectMin(dataPtr: usize, n: i32, workPtr: usize): f64 {
  return partitionSelect(dataPtr, n, 0, workPtr)
}

/**
 * Select maximum value
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns Maximum value
 */
export function selectMax(dataPtr: usize, n: i32, workPtr: usize): f64 {
  return partitionSelect(dataPtr, n, n - 1, workPtr)
}

/**
 * Select k smallest elements (unsorted)
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param k - Number of smallest elements to return
 * @param resultPtr - Pointer to output array (f64, at least k elements)
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns Number of elements written to result
 */
export function selectKSmallest(
  dataPtr: usize,
  n: i32,
  k: i32,
  resultPtr: usize,
  workPtr: usize
): i32 {
  if (k <= 0 || n === 0) {
    return 0
  }
  if (k >= n) {
    for (let i: i32 = 0; i < n; i++) {
      const offset: usize = (<usize>i) << 3
      store<f64>(resultPtr + offset, load<f64>(dataPtr + offset))
    }
    return n
  }

  // Copy to working memory
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(workPtr + offset, load<f64>(dataPtr + offset))
  }

  // Partition around k-th element
  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIndex: i32 = partition(workPtr, left, right)

    if (pivotIndex === k - 1) {
      break
    } else if (pivotIndex < k - 1) {
      left = pivotIndex + 1
    } else {
      right = pivotIndex - 1
    }
  }

  // Copy k smallest elements
  for (let i: i32 = 0; i < k; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(resultPtr + offset, load<f64>(workPtr + offset))
  }

  return k
}

/**
 * Select k largest elements (unsorted)
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param k - Number of largest elements to return
 * @param resultPtr - Pointer to output array (f64, at least k elements)
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns Number of elements written to result
 */
export function selectKLargest(
  dataPtr: usize,
  n: i32,
  k: i32,
  resultPtr: usize,
  workPtr: usize
): i32 {
  if (k <= 0 || n === 0) {
    return 0
  }
  if (k >= n) {
    for (let i: i32 = 0; i < n; i++) {
      const offset: usize = (<usize>i) << 3
      store<f64>(resultPtr + offset, load<f64>(dataPtr + offset))
    }
    return n
  }

  // Copy to working memory
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(workPtr + offset, load<f64>(dataPtr + offset))
  }

  // Partition around (n-k)-th element
  const target: i32 = n - k
  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIndex: i32 = partition(workPtr, left, right)

    if (pivotIndex === target) {
      break
    } else if (pivotIndex < target) {
      left = pivotIndex + 1
    } else {
      right = pivotIndex - 1
    }
  }

  // Copy k largest elements
  for (let i: i32 = 0; i < k; i++) {
    const offset: usize = (<usize>(target + i)) << 3
    const outOffset: usize = (<usize>i) << 3
    store<f64>(resultPtr + outOffset, load<f64>(workPtr + offset))
  }

  return k
}

/**
 * Select quantile value
 * @param dataPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param q - Quantile (0 to 1)
 * @param workPtr - Pointer to working memory (f64, n elements)
 * @returns Quantile value
 */
export function selectQuantile(
  dataPtr: usize,
  n: i32,
  q: f64,
  workPtr: usize
): f64 {
  if (n === 0 || q < 0.0 || q > 1.0) {
    return f64.NaN
  }

  const k: i32 = <i32>Math.floor(q * <f64>(n - 1))
  return partitionSelect(dataPtr, n, k, workPtr)
}

/**
 * Find index of k-th smallest element in original array
 * @param dataPtr - Pointer to input array (f64, not modified)
 * @param n - Array length
 * @param k - Index to find
 * @param indicesPtr - Pointer to index working memory (i32, n elements)
 * @returns Original index of k-th smallest element
 */
export function partitionSelectIndex(
  dataPtr: usize,
  n: i32,
  k: i32,
  indicesPtr: usize
): i32 {
  if (n === 0 || k < 0 || k >= n) {
    return -1
  }

  // Initialize index array
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(indicesPtr + ((<usize>i) << 2), i)
  }

  // Modified partition that moves indices with values
  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIdx: i32 = load<i32>(indicesPtr + ((<usize>right) << 2))
    const pivot: f64 = load<f64>(dataPtr + ((<usize>pivotIdx) << 3))
    let i: i32 = left

    for (let j: i32 = left; j < right; j++) {
      const jIdx: i32 = load<i32>(indicesPtr + ((<usize>j) << 2))
      if (load<f64>(dataPtr + ((<usize>jIdx) << 3)) <= pivot) {
        const iOffset: usize = (<usize>i) << 2
        const jOffset: usize = (<usize>j) << 2
        const temp: i32 = load<i32>(indicesPtr + iOffset)
        store<i32>(indicesPtr + iOffset, load<i32>(indicesPtr + jOffset))
        store<i32>(indicesPtr + jOffset, temp)
        i++
      }
    }

    const iOffset: usize = (<usize>i) << 2
    const rightOffset: usize = (<usize>right) << 2
    const temp: i32 = load<i32>(indicesPtr + iOffset)
    store<i32>(indicesPtr + iOffset, load<i32>(indicesPtr + rightOffset))
    store<i32>(indicesPtr + rightOffset, temp)

    if (i === k) {
      return load<i32>(indicesPtr + ((<usize>k) << 2))
    } else if (i < k) {
      left = i + 1
    } else {
      right = i - 1
    }
  }

  return load<i32>(indicesPtr + ((<usize>k) << 2))
}
