/**
 * WASM-optimized set operations using AssemblyScript
 * Sets are represented as sorted Float64 arrays with unique values
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * Sort an array in ascending order (in-place)
 * Uses quicksort algorithm
 * @param arrPtr - Pointer to array (f64)
 * @param left - Left index
 * @param right - Right index
 */
function quicksort(arrPtr: usize, left: i32, right: i32): void {
  if (left >= right) return

  const pivot: f64 = load<f64>(arrPtr + (<usize>((left + right) >> 1) << 3))
  let i: i32 = left
  let j: i32 = right

  while (i <= j) {
    while (load<f64>(arrPtr + (<usize>i << 3)) < pivot) i++
    while (load<f64>(arrPtr + (<usize>j << 3)) > pivot) j--

    if (i <= j) {
      const iOffset: usize = <usize>i << 3
      const jOffset: usize = <usize>j << 3
      const temp: f64 = load<f64>(arrPtr + iOffset)
      store<f64>(arrPtr + iOffset, load<f64>(arrPtr + jOffset))
      store<f64>(arrPtr + jOffset, temp)
      i++
      j--
    }
  }

  if (left < j) quicksort(arrPtr, left, j)
  if (i < right) quicksort(arrPtr, i, right)
}

/**
 * Create a set from an array (remove duplicates and sort)
 * @param arrPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output sorted unique array (f64, must have space for n elements)
 * @returns Number of unique elements
 */
export function createSet(arrPtr: usize, n: i32, resultPtr: usize): i32 {
  if (n === 0) return 0

  // Copy to result
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(arrPtr + offset))
  }

  // Sort
  quicksort(resultPtr, 0, n - 1)

  // Remove duplicates in place
  let uniqueCount: i32 = 1
  for (let i: i32 = 1; i < n; i++) {
    const currOffset: usize = <usize>i << 3
    const prevOffset: usize = <usize>(uniqueCount - 1) << 3
    if (load<f64>(resultPtr + currOffset) !== load<f64>(resultPtr + prevOffset)) {
      store<f64>(resultPtr + (<usize>uniqueCount << 3), load<f64>(resultPtr + currOffset))
      uniqueCount++
    }
  }

  return uniqueCount
}

/**
 * Compute the union of two sets
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @param resultPtr - Pointer to output array (f64, must have space for na+nb elements)
 * @returns Number of elements in union
 */
export function setUnion(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  resultPtr: usize
): i32 {
  if (na === 0 && nb === 0) return 0
  if (na === 0) {
    for (let i: i32 = 0; i < nb; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(resultPtr + offset, load<f64>(bPtr + offset))
    }
    return nb
  }
  if (nb === 0) {
    for (let i: i32 = 0; i < na; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
    }
    return na
  }

  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))

    if (aVal < bVal) {
      store<f64>(resultPtr + (<usize>k << 3), aVal)
      i++
      k++
    } else if (aVal > bVal) {
      store<f64>(resultPtr + (<usize>k << 3), bVal)
      j++
      k++
    } else {
      // Equal, add once
      store<f64>(resultPtr + (<usize>k << 3), aVal)
      i++
      j++
      k++
    }
  }

  // Add remaining elements from a
  while (i < na) {
    store<f64>(resultPtr + (<usize>k << 3), load<f64>(aPtr + (<usize>i << 3)))
    i++
    k++
  }

  // Add remaining elements from b
  while (j < nb) {
    store<f64>(resultPtr + (<usize>k << 3), load<f64>(bPtr + (<usize>j << 3)))
    j++
    k++
  }

  return k
}

/**
 * Compute the intersection of two sets
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @param resultPtr - Pointer to output array (f64, must have space for min(na,nb) elements)
 * @returns Number of elements in intersection
 */
export function setIntersect(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  resultPtr: usize
): i32 {
  if (na === 0 || nb === 0) return 0

  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))

    if (aVal < bVal) {
      i++
    } else if (aVal > bVal) {
      j++
    } else {
      // Equal, add to result
      store<f64>(resultPtr + (<usize>k << 3), aVal)
      i++
      j++
      k++
    }
  }

  return k
}

/**
 * Compute the difference of two sets (a - b)
 * Elements in a that are not in b
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @param resultPtr - Pointer to output array (f64, must have space for na elements)
 * @returns Number of elements in difference
 */
export function setDifference(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  resultPtr: usize
): i32 {
  if (na === 0) return 0
  if (nb === 0) {
    for (let i: i32 = 0; i < na; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
    }
    return na
  }

  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))

    if (aVal < bVal) {
      // a[i] is not in b
      store<f64>(resultPtr + (<usize>k << 3), aVal)
      i++
      k++
    } else if (aVal > bVal) {
      j++
    } else {
      // Equal, skip (don't add to result)
      i++
      j++
    }
  }

  // Add remaining elements from a (they're not in b)
  while (i < na) {
    store<f64>(resultPtr + (<usize>k << 3), load<f64>(aPtr + (<usize>i << 3)))
    i++
    k++
  }

  return k
}

/**
 * Compute the symmetric difference of two sets
 * Elements in exactly one of the sets (XOR)
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @param resultPtr - Pointer to output array (f64, must have space for na+nb elements)
 * @returns Number of elements in symmetric difference
 */
export function setSymDifference(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  resultPtr: usize
): i32 {
  if (na === 0 && nb === 0) return 0
  if (na === 0) {
    for (let i: i32 = 0; i < nb; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(resultPtr + offset, load<f64>(bPtr + offset))
    }
    return nb
  }
  if (nb === 0) {
    for (let i: i32 = 0; i < na; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
    }
    return na
  }

  let i: i32 = 0
  let j: i32 = 0
  let k: i32 = 0

  while (i < na && j < nb) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))

    if (aVal < bVal) {
      store<f64>(resultPtr + (<usize>k << 3), aVal)
      i++
      k++
    } else if (aVal > bVal) {
      store<f64>(resultPtr + (<usize>k << 3), bVal)
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
    store<f64>(resultPtr + (<usize>k << 3), load<f64>(aPtr + (<usize>i << 3)))
    i++
    k++
  }

  // Add remaining elements from b
  while (j < nb) {
    store<f64>(resultPtr + (<usize>k << 3), load<f64>(bPtr + (<usize>j << 3)))
    j++
    k++
  }

  return k
}

/**
 * Check if set a is a subset of set b
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @returns 1 if a is subset of b, 0 otherwise
 */
export function setIsSubset(aPtr: usize, na: i32, bPtr: usize, nb: i32): i32 {
  // Empty set is subset of any set
  if (na === 0) return 1

  // Non-empty set cannot be subset of empty set
  if (nb === 0) return 0

  // If a has more elements than b, it cannot be a subset
  if (na > nb) return 0

  let i: i32 = 0
  let j: i32 = 0

  while (i < na && j < nb) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))

    if (aVal < bVal) {
      // Element in a not found in b
      return 0
    } else if (aVal > bVal) {
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
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @returns 1 if a is proper subset of b, 0 otherwise
 */
export function setIsProperSubset(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32
): i32 {
  // Must be a subset and have fewer elements
  return setIsSubset(aPtr, na, bPtr, nb) === 1 && na < nb ? 1 : 0
}

/**
 * Check if set a is a superset of set b
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @returns 1 if a is superset of b, 0 otherwise
 */
export function setIsSuperset(aPtr: usize, na: i32, bPtr: usize, nb: i32): i32 {
  return setIsSubset(bPtr, nb, aPtr, na)
}

/**
 * Check if set a is a proper superset of set b
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @returns 1 if a is proper superset of b, 0 otherwise
 */
export function setIsProperSuperset(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32
): i32 {
  return setIsProperSubset(bPtr, nb, aPtr, na)
}

/**
 * Check if two sets are equal
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @returns 1 if sets are equal, 0 otherwise
 */
export function setEquals(aPtr: usize, na: i32, bPtr: usize, nb: i32): i32 {
  if (na !== nb) return 0

  for (let i: i32 = 0; i < na; i++) {
    const offset: usize = <usize>i << 3
    if (load<f64>(aPtr + offset) !== load<f64>(bPtr + offset)) return 0
  }

  return 1
}

/**
 * Check if two sets are disjoint (no common elements)
 * @param aPtr - Pointer to first set (f64, sorted, unique)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64, sorted, unique)
 * @param nb - Length of second set
 * @returns 1 if sets are disjoint, 0 otherwise
 */
export function setIsDisjoint(aPtr: usize, na: i32, bPtr: usize, nb: i32): i32 {
  if (na === 0 || nb === 0) return 1

  let i: i32 = 0
  let j: i32 = 0

  while (i < na && j < nb) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))

    if (aVal < bVal) {
      i++
    } else if (aVal > bVal) {
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
 * @param n - Length of set
 * @returns Number of elements
 */
export function setSize(n: i32): i32 {
  return n
}

/**
 * Check if element is in set
 * Uses binary search
 * @param aPtr - Pointer to set (f64, sorted, unique)
 * @param n - Length of set
 * @param value - Value to search for
 * @returns 1 if value is in set, 0 otherwise
 */
export function setContains(aPtr: usize, n: i32, value: f64): i32 {
  if (n === 0) return 0

  let left: i32 = 0
  let right: i32 = n - 1

  while (left <= right) {
    const mid: i32 = (left + right) >> 1
    const midVal: f64 = load<f64>(aPtr + (<usize>mid << 3))
    if (midVal === value) {
      return 1
    } else if (midVal < value) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return 0
}

/**
 * Add an element to a set
 * @param aPtr - Pointer to set (f64, sorted, unique)
 * @param n - Length of set
 * @param value - Value to add
 * @param resultPtr - Pointer to output array (f64, must have space for n+1 elements)
 * @returns New length of set
 */
export function setAdd(
  aPtr: usize,
  n: i32,
  value: f64,
  resultPtr: usize
): i32 {
  if (n === 0) {
    store<f64>(resultPtr, value)
    return 1
  }

  // Find insertion position using binary search
  let left: i32 = 0
  let right: i32 = n

  while (left < right) {
    const mid: i32 = (left + right) >> 1
    if (load<f64>(aPtr + (<usize>mid << 3)) < value) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  // Check if value already exists
  if (left < n && load<f64>(aPtr + (<usize>left << 3)) === value) {
    // Value already in set, just copy
    for (let i: i32 = 0; i < n; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
    }
    return n
  }

  // Insert at position left
  for (let i: i32 = 0; i < left; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
  }
  store<f64>(resultPtr + (<usize>left << 3), value)
  for (let i: i32 = left; i < n; i++) {
    const srcOffset: usize = <usize>i << 3
    const dstOffset: usize = <usize>(i + 1) << 3
    store<f64>(resultPtr + dstOffset, load<f64>(aPtr + srcOffset))
  }

  return n + 1
}

/**
 * Remove an element from a set
 * @param aPtr - Pointer to set (f64, sorted, unique)
 * @param n - Length of set
 * @param value - Value to remove
 * @param resultPtr - Pointer to output array (f64, must have space for n elements)
 * @returns New length of set
 */
export function setRemove(
  aPtr: usize,
  n: i32,
  value: f64,
  resultPtr: usize
): i32 {
  if (n === 0) return 0

  // Find element using binary search
  let left: i32 = 0
  let right: i32 = n - 1

  while (left <= right) {
    const mid: i32 = (left + right) >> 1
    const midVal: f64 = load<f64>(aPtr + (<usize>mid << 3))
    if (midVal === value) {
      // Found, remove it
      for (let i: i32 = 0; i < mid; i++) {
        const offset: usize = <usize>i << 3
        store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
      }
      for (let i: i32 = mid + 1; i < n; i++) {
        const srcOffset: usize = <usize>i << 3
        const dstOffset: usize = <usize>(i - 1) << 3
        store<f64>(resultPtr + dstOffset, load<f64>(aPtr + srcOffset))
      }
      return n - 1
    } else if (midVal < value) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  // Value not found, just copy
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset))
  }
  return n
}

/**
 * Compute the Cartesian product of two sets
 * Returns pairs as interleaved array [a0,b0, a0,b1, a1,b0, ...]
 * @param aPtr - Pointer to first set (f64)
 * @param na - Length of first set
 * @param bPtr - Pointer to second set (f64)
 * @param nb - Length of second set
 * @param resultPtr - Pointer to output array (f64, must have space for na*nb*2 elements)
 * @returns Number of pairs (na * nb)
 */
export function setCartesian(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  resultPtr: usize
): i32 {
  if (na === 0 || nb === 0) return 0

  let k: i32 = 0
  for (let i: i32 = 0; i < na; i++) {
    const aVal: f64 = load<f64>(aPtr + (<usize>i << 3))
    for (let j: i32 = 0; j < nb; j++) {
      const bVal: f64 = load<f64>(bPtr + (<usize>j << 3))
      store<f64>(resultPtr + (<usize>k << 3), aVal)
      store<f64>(resultPtr + (<usize>(k + 1) << 3), bVal)
      k += 2
    }
  }

  return na * nb
}

/**
 * Compute the power set size
 * @param n - Set size (max 30 elements due to 2^n growth)
 * @returns 2^n
 */
export function setPowerSetSize(n: i32): i32 {
  return 1 << n
}

/**
 * Get a specific subset from power set by index
 * @param aPtr - Pointer to original set (f64)
 * @param n - Set size
 * @param index - Subset index (0 to 2^n - 1)
 * @param resultPtr - Pointer to output array (f64, must have space for n elements)
 * @returns Number of elements in the subset
 */
export function setGetSubset(
  aPtr: usize,
  n: i32,
  index: i32,
  resultPtr: usize
): i32 {
  let k: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if ((index & (1 << i)) !== 0) {
      store<f64>(resultPtr + (<usize>k << 3), load<f64>(aPtr + (<usize>i << 3)))
      k++
    }
  }

  return k
}
