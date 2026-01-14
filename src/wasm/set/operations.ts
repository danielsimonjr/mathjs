/**
 * WASM-optimized set operations using AssemblyScript
 * Sets are represented as sorted Float64Arrays with unique values
 */

/**
 * Sort an array in ascending order (in-place)
 * Uses quicksort algorithm
 * @param arr - Array to sort
 * @param left - Left index
 * @param right - Right index
 */
function quicksort(arr: Float64Array, left: i32, right: i32): void {
  if (left >= right) return

  const pivot: f64 = arr[(left + right) >> 1]
  let i: i32 = left
  let j: i32 = right

  while (i <= j) {
    while (arr[i] < pivot) i++
    while (arr[j] > pivot) j--

    if (i <= j) {
      const temp: f64 = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
      i++
      j--
    }
  }

  if (left < j) quicksort(arr, left, j)
  if (i < right) quicksort(arr, i, right)
}

/**
 * Create a set from an array (remove duplicates and sort)
 * @param arr - Input array
 * @returns Sorted array with unique values
 */
export function createSet(arr: Float64Array): Float64Array {
  const n: i32 = arr.length
  if (n === 0) return new Float64Array(0)

  // Copy and sort
  const sorted = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    sorted[i] = arr[i]
  }
  quicksort(sorted, 0, n - 1)

  // Count unique elements
  let uniqueCount: i32 = 1
  for (let i: i32 = 1; i < n; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      uniqueCount++
    }
  }

  // Create result with unique values
  const result = new Float64Array(uniqueCount)
  result[0] = sorted[0]
  let j: i32 = 1

  for (let i: i32 = 1; i < n; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      result[j] = sorted[i]
      j++
    }
  }

  return result
}

/**
 * Compute the union of two sets
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns Union of a and b
 */
export function setUnion(a: Float64Array, b: Float64Array): Float64Array {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na === 0) return createSet(b)
  if (nb === 0) return createSet(a)

  // Maximum possible size
  const result = new Float64Array(na + nb)
  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    if (a[i] < b[j]) {
      result[k] = a[i]
      i++
      k++
    } else if (a[i] > b[j]) {
      result[k] = b[j]
      j++
      k++
    } else {
      // Equal, add once
      result[k] = a[i]
      i++
      j++
      k++
    }
  }

  // Add remaining elements from a
  while (i < na) {
    result[k] = a[i]
    i++
    k++
  }

  // Add remaining elements from b
  while (j < nb) {
    result[k] = b[j]
    j++
    k++
  }

  // Trim to actual size
  const trimmed = new Float64Array(k)
  for (let m: i32 = 0; m < k; m++) {
    trimmed[m] = result[m]
  }

  return trimmed
}

/**
 * Compute the intersection of two sets
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns Intersection of a and b
 */
export function setIntersect(a: Float64Array, b: Float64Array): Float64Array {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na === 0 || nb === 0) return new Float64Array(0)

  // Maximum possible size is min(na, nb)
  const maxSize: i32 = na < nb ? na : nb
  const result = new Float64Array(maxSize)
  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    if (a[i] < b[j]) {
      i++
    } else if (a[i] > b[j]) {
      j++
    } else {
      // Equal, add to result
      result[k] = a[i]
      i++
      j++
      k++
    }
  }

  // Trim to actual size
  const trimmed = new Float64Array(k)
  for (let m: i32 = 0; m < k; m++) {
    trimmed[m] = result[m]
  }

  return trimmed
}

/**
 * Compute the difference of two sets (a - b)
 * Elements in a that are not in b
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns Difference a - b
 */
export function setDifference(a: Float64Array, b: Float64Array): Float64Array {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na === 0) return new Float64Array(0)
  if (nb === 0) return createSet(a)

  const result = new Float64Array(na)
  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    if (a[i] < b[j]) {
      // a[i] is not in b
      result[k] = a[i]
      i++
      k++
    } else if (a[i] > b[j]) {
      j++
    } else {
      // Equal, skip (don't add to result)
      i++
      j++
    }
  }

  // Add remaining elements from a (they're not in b)
  while (i < na) {
    result[k] = a[i]
    i++
    k++
  }

  // Trim to actual size
  const trimmed = new Float64Array(k)
  for (let m: i32 = 0; m < k; m++) {
    trimmed[m] = result[m]
  }

  return trimmed
}

/**
 * Compute the symmetric difference of two sets
 * Elements in exactly one of the sets (XOR)
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns Symmetric difference
 */
export function setSymDifference(a: Float64Array, b: Float64Array): Float64Array {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na === 0) return createSet(b)
  if (nb === 0) return createSet(a)

  const result = new Float64Array(na + nb)
  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    if (a[i] < b[j]) {
      result[k] = a[i]
      i++
      k++
    } else if (a[i] > b[j]) {
      result[k] = b[j]
      j++
      k++
    } else {
      // Equal, skip both
      i++
      j++
    }
  }

  // Add remaining elements from a
  while (i < na) {
    result[k] = a[i]
    i++
    k++
  }

  // Add remaining elements from b
  while (j < nb) {
    result[k] = b[j]
    j++
    k++
  }

  // Trim to actual size
  const trimmed = new Float64Array(k)
  for (let m: i32 = 0; m < k; m++) {
    trimmed[m] = result[m]
  }

  return trimmed
}

/**
 * Check if set a is a subset of set b
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns 1 if a is subset of b, 0 otherwise
 */
export function setIsSubset(a: Float64Array, b: Float64Array): i32 {
  const na: i32 = a.length
  const nb: i32 = b.length

  // Empty set is subset of any set
  if (na === 0) return 1

  // Non-empty set cannot be subset of empty set
  if (nb === 0) return 0

  // If a has more elements than b, it cannot be a subset
  if (na > nb) return 0

  let i: i32 = 0
  let j: i32 = 0

  while (i < na && j < nb) {
    if (a[i] < b[j]) {
      // Element in a not found in b
      return 0
    } else if (a[i] > b[j]) {
      j++
    } else {
      // Found match
      i++
      j++
    }
  }

  // All elements in a were found in b
  return i === na ? 1 : 0
}

/**
 * Check if set a is a proper subset of set b
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns 1 if a is proper subset of b, 0 otherwise
 */
export function setIsProperSubset(a: Float64Array, b: Float64Array): i32 {
  // Must be a subset and have fewer elements
  return setIsSubset(a, b) === 1 && a.length < b.length ? 1 : 0
}

/**
 * Check if set a is a superset of set b
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns 1 if a is superset of b, 0 otherwise
 */
export function setIsSuperset(a: Float64Array, b: Float64Array): i32 {
  return setIsSubset(b, a)
}

/**
 * Check if set a is a proper superset of set b
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns 1 if a is proper superset of b, 0 otherwise
 */
export function setIsProperSuperset(a: Float64Array, b: Float64Array): i32 {
  return setIsProperSubset(b, a)
}

/**
 * Check if two sets are equal
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns 1 if sets are equal, 0 otherwise
 */
export function setEquals(a: Float64Array, b: Float64Array): i32 {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na !== nb) return 0

  for (let i: i32 = 0; i < na; i++) {
    if (a[i] !== b[i]) return 0
  }

  return 1
}

/**
 * Check if two sets are disjoint (no common elements)
 * @param a - First set (sorted, unique)
 * @param b - Second set (sorted, unique)
 * @returns 1 if sets are disjoint, 0 otherwise
 */
export function setIsDisjoint(a: Float64Array, b: Float64Array): i32 {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na === 0 || nb === 0) return 1

  let i: i32 = 0
  let j: i32 = 0

  while (i < na && j < nb) {
    if (a[i] < b[j]) {
      i++
    } else if (a[i] > b[j]) {
      j++
    } else {
      // Found common element
      return 0
    }
  }

  return 1
}

/**
 * Get the cardinality (size) of a set
 * @param a - Set (sorted, unique)
 * @returns Number of elements
 */
export function setSize(a: Float64Array): i32 {
  return a.length
}

/**
 * Check if element is in set
 * Uses binary search
 * @param a - Set (sorted, unique)
 * @param value - Value to search for
 * @returns 1 if value is in set, 0 otherwise
 */
export function setContains(a: Float64Array, value: f64): i32 {
  const n: i32 = a.length
  if (n === 0) return 0

  let left: i32 = 0
  let right: i32 = n - 1

  while (left <= right) {
    const mid: i32 = (left + right) >> 1
    if (a[mid] === value) {
      return 1
    } else if (a[mid] < value) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return 0
}

/**
 * Add an element to a set
 * @param a - Set (sorted, unique)
 * @param value - Value to add
 * @returns New set with element added
 */
export function setAdd(a: Float64Array, value: f64): Float64Array {
  const n: i32 = a.length

  // Find insertion position using binary search
  let left: i32 = 0
  let right: i32 = n

  while (left < right) {
    const mid: i32 = (left + right) >> 1
    if (a[mid] < value) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  // Check if value already exists
  if (left < n && a[left] === value) {
    // Value already in set, return copy
    const result = new Float64Array(n)
    for (let i: i32 = 0; i < n; i++) {
      result[i] = a[i]
    }
    return result
  }

  // Insert at position left
  const result = new Float64Array(n + 1)
  for (let i: i32 = 0; i < left; i++) {
    result[i] = a[i]
  }
  result[left] = value
  for (let i: i32 = left; i < n; i++) {
    result[i + 1] = a[i]
  }

  return result
}

/**
 * Remove an element from a set
 * @param a - Set (sorted, unique)
 * @param value - Value to remove
 * @returns New set with element removed
 */
export function setRemove(a: Float64Array, value: f64): Float64Array {
  const n: i32 = a.length
  if (n === 0) return new Float64Array(0)

  // Find element using binary search
  let left: i32 = 0
  let right: i32 = n - 1

  while (left <= right) {
    const mid: i32 = (left + right) >> 1
    if (a[mid] === value) {
      // Found, remove it
      const result = new Float64Array(n - 1)
      for (let i: i32 = 0; i < mid; i++) {
        result[i] = a[i]
      }
      for (let i: i32 = mid + 1; i < n; i++) {
        result[i - 1] = a[i]
      }
      return result
    } else if (a[mid] < value) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  // Value not found, return copy
  const result = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i]
  }
  return result
}

/**
 * Compute the Cartesian product of two sets
 * Returns pairs as interleaved array [a0,b0, a0,b1, a1,b0, ...]
 * @param a - First set
 * @param b - Second set
 * @returns Cartesian product as interleaved pairs
 */
export function setCartesian(a: Float64Array, b: Float64Array): Float64Array {
  const na: i32 = a.length
  const nb: i32 = b.length

  if (na === 0 || nb === 0) return new Float64Array(0)

  const result = new Float64Array(na * nb * 2)
  let k: i32 = 0

  for (let i: i32 = 0; i < na; i++) {
    for (let j: i32 = 0; j < nb; j++) {
      result[k] = a[i]
      result[k + 1] = b[j]
      k += 2
    }
  }

  return result
}

/**
 * Compute the power set of a set
 * Returns all subsets encoded as bit patterns
 * @param a - Input set (max 30 elements due to 2^n growth)
 * @returns Array where each element is a subset encoded by bitmask
 */
export function setPowerSetSize(n: i32): i32 {
  // Returns 2^n
  return 1 << n
}

/**
 * Get a specific subset from power set by index
 * @param a - Original set
 * @param index - Subset index (0 to 2^n - 1)
 * @returns The subset corresponding to the index
 */
export function setGetSubset(a: Float64Array, index: i32): Float64Array {
  const n: i32 = a.length

  // Count bits in index to determine subset size
  let count: i32 = 0
  let temp: i32 = index
  while (temp > 0) {
    count += temp & 1
    temp >>= 1
  }

  const result = new Float64Array(count)
  let k: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if ((index & (1 << i)) !== 0) {
      result[k] = a[i]
      k++
    }
  }

  return result
}
