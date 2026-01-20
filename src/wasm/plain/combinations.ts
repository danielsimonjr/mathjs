/**
 * Plain Number Combinatorics - AssemblyScript
 *
 * Combinatorial functions for WebAssembly compilation.
 * Converted from src/plain/number/combinations.js
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.5
 */

/**
 * Helper: Check if a number is an integer
 */
function isIntegerNumber(x: f64): bool {
  return x === Math.floor(x) && isFinite(x)
}

/**
 * Helper: Calculate product of integers from start to end (inclusive)
 */
function product(start: f64, end: f64): f64 {
  let result: f64 = 1
  for (let i = start; i <= end; i++) {
    result *= i
  }
  return result
}

/**
 * Calculate combinations (n choose k) - binomial coefficient
 * @param n - Total number of items
 * @param k - Number of items to choose
 * @returns Number of combinations (or NaN on error)
 */
export function combinationsNumber(n: f64, k: f64): f64 {
  if (!isIntegerNumber(n) || n < 0) {
    return f64.NaN
  }
  if (!isIntegerNumber(k) || k < 0) {
    return f64.NaN
  }
  if (k > n) {
    return f64.NaN
  }

  const nMinusk = n - k

  let answer: f64 = 1
  const firstnumerator = k < nMinusk ? nMinusk + 1 : k + 1
  let nextdivisor: f64 = 2
  const lastdivisor = k < nMinusk ? k : nMinusk

  // Balance multiplications and divisions to try to keep intermediate values
  // in exact-integer range as long as possible
  for (
    let nextnumerator = firstnumerator;
    nextnumerator <= n;
    nextnumerator++
  ) {
    answer *= nextnumerator
    while (nextdivisor <= lastdivisor && answer % nextdivisor === 0) {
      answer /= nextdivisor
      nextdivisor++
    }
  }

  // For big n, k, floating point may have caused weirdness in remainder
  if (nextdivisor <= lastdivisor) {
    answer /= product(nextdivisor, lastdivisor)
  }

  return answer
}
