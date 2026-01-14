/**
 * WASM-optimized logical operations using AssemblyScript
 * Uses i32 for boolean values (0 = false, non-zero = true)
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
 * @param a - First array
 * @param b - Second array
 * @returns Element-wise AND result
 */
export function andArray(a: Int32Array, b: Int32Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] !== 0 && b[i] !== 0 ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Element-wise OR result
 */
export function orArray(a: Int32Array, b: Int32Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] !== 0 || b[i] !== 0 ? 1 : 0
  }

  return result
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
 * @param a - Input array
 * @returns Element-wise NOT result
 */
export function notArray(a: Int32Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] === 0 ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Element-wise XOR result
 */
export function xorArray(a: Int32Array, b: Int32Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const aBool: bool = a[i] !== 0
    const bBool: bool = b[i] !== 0
    result[i] = (aBool && !bBool) || (!aBool && bBool) ? 1 : 0
  }

  return result
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
 * @param a - Input array
 * @returns Count of non-zero values
 */
export function countTrue(a: Int32Array): i32 {
  const n: i32 = a.length
  let count: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if (a[i] !== 0) count++
  }

  return count
}

/**
 * Check if all values are true
 * @param a - Input array
 * @returns 1 if all non-zero, 0 otherwise
 */
export function all(a: Int32Array): i32 {
  const n: i32 = a.length

  for (let i: i32 = 0; i < n; i++) {
    if (a[i] === 0) return 0
  }

  return 1
}

/**
 * Check if any value is true
 * @param a - Input array
 * @returns 1 if any non-zero, 0 otherwise
 */
export function any(a: Int32Array): i32 {
  const n: i32 = a.length

  for (let i: i32 = 0; i < n; i++) {
    if (a[i] !== 0) return 1
  }

  return 0
}

/**
 * Find index of first true value
 * @param a - Input array
 * @returns Index of first non-zero value, or -1 if none
 */
export function findFirst(a: Int32Array): i32 {
  const n: i32 = a.length

  for (let i: i32 = 0; i < n; i++) {
    if (a[i] !== 0) return i
  }

  return -1
}

/**
 * Find index of last true value
 * @param a - Input array
 * @returns Index of last non-zero value, or -1 if none
 */
export function findLast(a: Int32Array): i32 {
  const n: i32 = a.length

  for (let i: i32 = n - 1; i >= 0; i--) {
    if (a[i] !== 0) return i
  }

  return -1
}

/**
 * Get indices of all true values
 * @param a - Input array
 * @returns Array of indices where values are non-zero
 */
export function findAll(a: Int32Array): Int32Array {
  const n: i32 = a.length

  // First pass: count non-zero values
  let count: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (a[i] !== 0) count++
  }

  // Second pass: collect indices
  const result = new Int32Array(count)
  let j: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (a[i] !== 0) {
      result[j] = i
      j++
    }
  }

  return result
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
 * @param condition - Condition array
 * @param a - Values if true
 * @param b - Values if false
 * @returns Selected values
 */
export function selectArray(
  condition: Int32Array,
  a: Float64Array,
  b: Float64Array
): Float64Array {
  const n: i32 = condition.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = condition[i] !== 0 ? a[i] : b[i]
  }

  return result
}
