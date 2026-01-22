/**
 * WASM-optimized logical operations using AssemblyScript
 * Uses i32 for boolean values (0 = false, non-zero = true)
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * Logical AND of two values
 * @param a - First value (0 = false, non-zero = true)
 * @param b - Second value (0 = false, non-zero = true)
 * @returns 1 if both true, 0 otherwise
 */
export function and(a: i32, b: i32): i32 {
  return a !== 0 && b !== 0 ? 1 : 0
}

/**
 * Logical AND for arrays (element-wise)
 * @param aPtr - Pointer to first array (i32)
 * @param bPtr - Pointer to second array (i32)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32)
 */
export function andArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 2
    const a: i32 = load<i32>(aPtr + offset)
    const b: i32 = load<i32>(bPtr + offset)
    store<i32>(resultPtr + offset, a !== 0 && b !== 0 ? 1 : 0)
  }
}

/**
 * Logical OR of two values
 * @param a - First value
 * @param b - Second value
 * @returns 1 if either true, 0 otherwise
 */
export function or(a: i32, b: i32): i32 {
  return a !== 0 || b !== 0 ? 1 : 0
}

/**
 * Logical OR for arrays (element-wise)
 * @param aPtr - Pointer to first array (i32)
 * @param bPtr - Pointer to second array (i32)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32)
 */
export function orArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 2
    const a: i32 = load<i32>(aPtr + offset)
    const b: i32 = load<i32>(bPtr + offset)
    store<i32>(resultPtr + offset, a !== 0 || b !== 0 ? 1 : 0)
  }
}

/**
 * Logical NOT of a value
 * @param a - Input value
 * @returns 1 if input is false, 0 if input is true
 */
export function not(a: i32): i32 {
  return a === 0 ? 1 : 0
}

/**
 * Logical NOT for arrays (element-wise)
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32)
 */
export function notArray(aPtr: usize, n: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 2
    store<i32>(resultPtr + offset, load<i32>(aPtr + offset) === 0 ? 1 : 0)
  }
}

/**
 * Logical XOR of two values
 * @param a - First value
 * @param b - Second value
 * @returns 1 if exactly one is true, 0 otherwise
 */
export function xor(a: i32, b: i32): i32 {
  const aBool: bool = a !== 0
  const bBool: bool = b !== 0
  return (aBool && !bBool) || (!aBool && bBool) ? 1 : 0
}

/**
 * Logical XOR for arrays (element-wise)
 * @param aPtr - Pointer to first array (i32)
 * @param bPtr - Pointer to second array (i32)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32)
 */
export function xorArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 2
    const aBool: bool = load<i32>(aPtr + offset) !== 0
    const bBool: bool = load<i32>(bPtr + offset) !== 0
    store<i32>(resultPtr + offset, (aBool && !bBool) || (!aBool && bBool) ? 1 : 0)
  }
}

/**
 * Logical NAND of two values
 * @param a - First value
 * @param b - Second value
 * @returns 0 if both true, 1 otherwise
 */
export function nand(a: i32, b: i32): i32 {
  return a !== 0 && b !== 0 ? 0 : 1
}

/**
 * Logical NOR of two values
 * @param a - First value
 * @param b - Second value
 * @returns 1 if both false, 0 otherwise
 */
export function nor(a: i32, b: i32): i32 {
  return a === 0 && b === 0 ? 1 : 0
}

/**
 * Logical XNOR (equivalence) of two values
 * @param a - First value
 * @param b - Second value
 * @returns 1 if both same, 0 otherwise
 */
export function xnor(a: i32, b: i32): i32 {
  const aBool: bool = a !== 0
  const bBool: bool = b !== 0
  return aBool === bBool ? 1 : 0
}

/**
 * Count number of true values in array
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @returns Count of non-zero values
 */
export function countTrue(aPtr: usize, n: i32): i32 {
  let count: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (load<i32>(aPtr + (<usize>i << 2)) !== 0) count++
  }
  return count
}

/**
 * Check if all values are true
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @returns 1 if all non-zero, 0 otherwise
 */
export function all(aPtr: usize, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (load<i32>(aPtr + (<usize>i << 2)) === 0) return 0
  }
  return 1
}

/**
 * Check if any value is true
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @returns 1 if any non-zero, 0 otherwise
 */
export function any(aPtr: usize, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (load<i32>(aPtr + (<usize>i << 2)) !== 0) return 1
  }
  return 0
}

/**
 * Find index of first true value
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @returns Index of first non-zero value, or -1 if none
 */
export function findFirst(aPtr: usize, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (load<i32>(aPtr + (<usize>i << 2)) !== 0) return i
  }
  return -1
}

/**
 * Find index of last true value
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @returns Index of last non-zero value, or -1 if none
 */
export function findLast(aPtr: usize, n: i32): i32 {
  for (let i: i32 = n - 1; i >= 0; i--) {
    if (load<i32>(aPtr + (<usize>i << 2)) !== 0) return i
  }
  return -1
}

/**
 * Get indices of all true values
 * @param aPtr - Pointer to input array (i32)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, must have space for up to n values)
 * @returns Number of true values found
 */
export function findAll(aPtr: usize, n: i32, resultPtr: usize): i32 {
  let j: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (load<i32>(aPtr + (<usize>i << 2)) !== 0) {
      store<i32>(resultPtr + (<usize>j << 2), i)
      j++
    }
  }
  return j
}

/**
 * Conditional select: return a if condition is true, b otherwise
 * @param condition - Condition value (0 = false)
 * @param a - Value if true
 * @param b - Value if false
 * @returns Selected value
 */
export function select(condition: i32, a: f64, b: f64): f64 {
  return condition !== 0 ? a : b
}

/**
 * Element-wise conditional select for arrays
 * @param conditionPtr - Pointer to condition array (i32)
 * @param aPtr - Pointer to values if true (f64)
 * @param bPtr - Pointer to values if false (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (f64)
 */
export function selectArray(
  conditionPtr: usize,
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const condOffset: usize = <usize>i << 2
    const valOffset: usize = <usize>i << 3
    const condition: i32 = load<i32>(conditionPtr + condOffset)
    const aVal: f64 = load<f64>(aPtr + valOffset)
    const bVal: f64 = load<f64>(bPtr + valOffset)
    store<f64>(resultPtr + valOffset, condition !== 0 ? aVal : bVal)
  }
}
