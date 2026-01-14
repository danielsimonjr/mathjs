/**
 * WASM-optimized selection algorithms
 *
 * Implements QuickSelect and related algorithms for finding
 * k-th smallest/largest elements in O(n) average time.
 */

/**
 * Partition array around pivot (Lomuto scheme)
 * @param arr - Array to partition (modified in place)
 * @param left - Left bound
 * @param right - Right bound
 * @returns Index of pivot after partitioning
 */
function partition(arr: Float64Array, left: i32, right: i32): i32 {
  const pivot: f64 = arr[right]
  let i: i32 = left

  for (let j: i32 = left; j < right; j++) {
    if (arr[j] <= pivot) {
      const temp: f64 = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
      i++
    }
  }

  const temp: f64 = arr[i]
  arr[i] = arr[right]
  arr[right] = temp

  return i
}

/**
 * Partition using median-of-three pivot selection
 */
function partitionMedianOfThree(arr: Float64Array, left: i32, right: i32): i32 {
  const mid: i32 = left + Math.floor(f64(right - left) / 2.0) as i32

  // Sort left, mid, right
  if (arr[left] > arr[mid]) {
    const t: f64 = arr[left]
    arr[left] = arr[mid]
    arr[mid] = t
  }
  if (arr[left] > arr[right]) {
    const t: f64 = arr[left]
    arr[left] = arr[right]
    arr[right] = t
  }
  if (arr[mid] > arr[right]) {
    const t: f64 = arr[mid]
    arr[mid] = arr[right]
    arr[right] = t
  }

  // Move median to right-1 position
  const t: f64 = arr[mid]
  arr[mid] = arr[right - 1]
  arr[right - 1] = t

  return partitionAroundPivot(arr, left + 1, right - 1)
}

/**
 * Partition with pivot at right position
 */
function partitionAroundPivot(arr: Float64Array, left: i32, right: i32): i32 {
  const pivot: f64 = arr[right]
  let i: i32 = left

  for (let j: i32 = left; j < right; j++) {
    if (arr[j] <= pivot) {
      const temp: f64 = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
      i++
    }
  }

  const temp: f64 = arr[i]
  arr[i] = arr[right]
  arr[right] = temp

  return i
}

/**
 * QuickSelect algorithm - find k-th smallest element
 *
 * @param data - Input array (will be modified)
 * @param k - Index to select (0-based, so k=0 is minimum)
 * @returns k-th smallest element
 */
export function partitionSelect(data: Float64Array, k: i32): f64 {
  const n: i32 = data.length
  if (n === 0 || k < 0 || k >= n) {
    return NaN
  }

  // Make a copy to avoid modifying original
  const arr = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    arr[i] = data[i]
  }

  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIndex: i32 = partition(arr, left, right)

    if (pivotIndex === k) {
      return arr[k]
    } else if (pivotIndex < k) {
      left = pivotIndex + 1
    } else {
      right = pivotIndex - 1
    }
  }

  return arr[k]
}

/**
 * QuickSelect with median-of-three pivot
 * Better performance on sorted/nearly sorted data
 */
export function partitionSelectMoT(data: Float64Array, k: i32): f64 {
  const n: i32 = data.length
  if (n === 0 || k < 0 || k >= n) {
    return NaN
  }

  const arr = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    arr[i] = data[i]
  }

  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    if (right - left < 3) {
      // Use simple partition for small ranges
      const pivotIndex: i32 = partition(arr, left, right)
      if (pivotIndex === k) {
        return arr[k]
      } else if (pivotIndex < k) {
        left = pivotIndex + 1
      } else {
        right = pivotIndex - 1
      }
    } else {
      const pivotIndex: i32 = partitionMedianOfThree(arr, left, right)
      if (pivotIndex === k) {
        return arr[k]
      } else if (pivotIndex < k) {
        left = pivotIndex + 1
      } else {
        right = pivotIndex - 1
      }
    }
  }

  return arr[k]
}

/**
 * Select median value
 * For even n, returns lower median
 */
export function selectMedian(data: Float64Array): f64 {
  const n: i32 = data.length
  if (n === 0) {
    return NaN
  }
  const k: i32 = Math.floor(f64(n) / 2.0) as i32
  return partitionSelect(data, k)
}

/**
 * Select minimum value
 */
export function selectMin(data: Float64Array): f64 {
  return partitionSelect(data, 0)
}

/**
 * Select maximum value
 */
export function selectMax(data: Float64Array): f64 {
  const n: i32 = data.length
  return partitionSelect(data, n - 1)
}

/**
 * Select k smallest elements (unsorted)
 * @param data - Input array
 * @param k - Number of smallest elements to return
 * @returns Array of k smallest elements
 */
export function selectKSmallest(data: Float64Array, k: i32): Float64Array {
  const n: i32 = data.length
  if (k <= 0 || n === 0) {
    return new Float64Array(0)
  }
  if (k >= n) {
    const result = new Float64Array(n)
    for (let i: i32 = 0; i < n; i++) {
      result[i] = data[i]
    }
    return result
  }

  const arr = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    arr[i] = data[i]
  }

  // Partition around k-th element
  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIndex: i32 = partition(arr, left, right)

    if (pivotIndex === k - 1) {
      break
    } else if (pivotIndex < k - 1) {
      left = pivotIndex + 1
    } else {
      right = pivotIndex - 1
    }
  }

  // Copy k smallest elements
  const result = new Float64Array(k)
  for (let i: i32 = 0; i < k; i++) {
    result[i] = arr[i]
  }

  return result
}

/**
 * Select k largest elements (unsorted)
 * @param data - Input array
 * @param k - Number of largest elements to return
 * @returns Array of k largest elements
 */
export function selectKLargest(data: Float64Array, k: i32): Float64Array {
  const n: i32 = data.length
  if (k <= 0 || n === 0) {
    return new Float64Array(0)
  }
  if (k >= n) {
    const result = new Float64Array(n)
    for (let i: i32 = 0; i < n; i++) {
      result[i] = data[i]
    }
    return result
  }

  const arr = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    arr[i] = data[i]
  }

  // Partition around (n-k)-th element
  const target: i32 = n - k
  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivotIndex: i32 = partition(arr, left, right)

    if (pivotIndex === target) {
      break
    } else if (pivotIndex < target) {
      left = pivotIndex + 1
    } else {
      right = pivotIndex - 1
    }
  }

  // Copy k largest elements
  const result = new Float64Array(k)
  for (let i: i32 = 0; i < k; i++) {
    result[i] = arr[target + i]
  }

  return result
}

/**
 * Introselect - hybrid algorithm with guaranteed O(n) worst case
 * Falls back to median-of-medians after too many recursions
 */
export function introSelect(data: Float64Array, k: i32): f64 {
  const n: i32 = data.length
  if (n === 0 || k < 0 || k >= n) {
    return NaN
  }

  const arr = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    arr[i] = data[i]
  }

  // Max recursion depth before switching to median-of-medians
  const maxDepth: i32 = 2 * (Math.floor(Math.log(f64(n)) / Math.log(2.0)) as i32)

  return introSelectHelper(arr, 0, n - 1, k, maxDepth)
}

/**
 * Helper for introselect with depth tracking
 */
function introSelectHelper(
  arr: Float64Array,
  left: i32,
  right: i32,
  k: i32,
  depth: i32
): f64 {
  if (left === right) {
    return arr[left]
  }

  if (depth === 0) {
    // Fall back to median-of-medians
    return medianOfMediansSelect(arr, left, right, k)
  }

  const pivotIndex: i32 = partition(arr, left, right)

  if (pivotIndex === k) {
    return arr[k]
  } else if (pivotIndex < k) {
    return introSelectHelper(arr, pivotIndex + 1, right, k, depth - 1)
  } else {
    return introSelectHelper(arr, left, pivotIndex - 1, k, depth - 1)
  }
}

/**
 * Median of medians selection (guaranteed O(n))
 */
function medianOfMediansSelect(
  arr: Float64Array,
  left: i32,
  right: i32,
  k: i32
): f64 {
  const n: i32 = right - left + 1

  if (n <= 5) {
    // Use insertion sort for small arrays
    for (let i: i32 = left + 1; i <= right; i++) {
      const key: f64 = arr[i]
      let j: i32 = i - 1
      while (j >= left && arr[j] > key) {
        arr[j + 1] = arr[j]
        j--
      }
      arr[j + 1] = key
    }
    return arr[k]
  }

  // Divide into groups of 5 and find medians
  const numGroups: i32 = Math.ceil(f64(n) / 5.0) as i32
  const medians = new Float64Array(numGroups)

  for (let i: i32 = 0; i < numGroups; i++) {
    const groupStart: i32 = left + i * 5
    let groupEnd: i32 = groupStart + 4
    if (groupEnd > right) {
      groupEnd = right
    }

    // Sort group with insertion sort
    for (let j: i32 = groupStart + 1; j <= groupEnd; j++) {
      const key: f64 = arr[j]
      let m: i32 = j - 1
      while (m >= groupStart && arr[m] > key) {
        arr[m + 1] = arr[m]
        m--
      }
      arr[m + 1] = key
    }

    // Get median of group
    const groupSize: i32 = groupEnd - groupStart + 1
    medians[i] = arr[groupStart + Math.floor(f64(groupSize) / 2.0) as i32]
  }

  // Recursively find median of medians
  let pivot: f64
  if (numGroups <= 5) {
    // Sort medians directly
    for (let i: i32 = 1; i < numGroups; i++) {
      const key: f64 = medians[i]
      let j: i32 = i - 1
      while (j >= 0 && medians[j] > key) {
        medians[j + 1] = medians[j]
        j--
      }
      medians[j + 1] = key
    }
    pivot = medians[Math.floor(f64(numGroups) / 2.0) as i32]
  } else {
    pivot = medianOfMediansSelect(medians, 0, numGroups - 1, Math.floor(f64(numGroups) / 2.0) as i32)
  }

  // Partition around pivot
  let pivotIndex: i32 = left
  for (let i: i32 = left; i <= right; i++) {
    if (arr[i] === pivot) {
      pivotIndex = i
      break
    }
  }

  // Move pivot to end
  const temp: f64 = arr[pivotIndex]
  arr[pivotIndex] = arr[right]
  arr[right] = temp

  // Partition
  const finalPivot: i32 = partition(arr, left, right)

  if (finalPivot === k) {
    return arr[k]
  } else if (finalPivot < k) {
    return medianOfMediansSelect(arr, finalPivot + 1, right, k)
  } else {
    return medianOfMediansSelect(arr, left, finalPivot - 1, k)
  }
}

/**
 * Select quantile value
 * @param data - Input array
 * @param q - Quantile (0 to 1)
 * @returns Quantile value
 */
export function selectQuantile(data: Float64Array, q: f64): f64 {
  const n: i32 = data.length
  if (n === 0 || q < 0.0 || q > 1.0) {
    return NaN
  }

  const k: i32 = Math.floor(q * f64(n - 1)) as i32
  return partitionSelect(data, k)
}

/**
 * Find index of k-th smallest element in original array
 * @param data - Input array (not modified)
 * @param k - Index to find
 * @returns Original index of k-th smallest element
 */
export function partitionSelectIndex(data: Float64Array, k: i32): i32 {
  const n: i32 = data.length
  if (n === 0 || k < 0 || k >= n) {
    return -1
  }

  // Create index array
  const indices = new Int32Array(n)
  for (let i: i32 = 0; i < n; i++) {
    indices[i] = i
  }

  // Modified partition that moves indices with values
  let left: i32 = 0
  let right: i32 = n - 1

  while (left < right) {
    const pivot: f64 = data[indices[right]]
    let i: i32 = left

    for (let j: i32 = left; j < right; j++) {
      if (data[indices[j]] <= pivot) {
        const temp: i32 = indices[i]
        indices[i] = indices[j]
        indices[j] = temp
        i++
      }
    }

    const temp: i32 = indices[i]
    indices[i] = indices[right]
    indices[right] = temp

    if (i === k) {
      return indices[k]
    } else if (i < k) {
      left = i + 1
    } else {
      right = i - 1
    }
  }

  return indices[k]
}
