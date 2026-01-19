/**
 * Plain Number Utility Functions - AssemblyScript
 *
 * Utility functions for number type checking and validation.
 * Converted from src/plain/number/utils.js
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.5
 *
 * Note: Returns f64 (1 for true, 0 for false) for compatibility
 */

/**
 * Check if a number is an integer
 * @param x - Number to check
 * @returns 1 if x is an integer, 0 otherwise
 */
export function isIntegerNumber(x: f64): f64 {
  return (x === Math.floor(x) && isFinite(x)) ? 1 : 0
}

/**
 * Check if a number is negative
 * @param x - Number to check
 * @returns 1 if x < 0, 0 otherwise
 */
export function isNegativeNumber(x: f64): f64 {
  return x < 0 ? 1 : 0
}

/**
 * Check if a number is positive
 * @param x - Number to check
 * @returns 1 if x > 0, 0 otherwise
 */
export function isPositiveNumber(x: f64): f64 {
  return x > 0 ? 1 : 0
}

/**
 * Check if a number is zero
 * @param x - Number to check
 * @returns 1 if x === 0, 0 otherwise
 */
export function isZeroNumber(x: f64): f64 {
  return x === 0 ? 1 : 0
}

/**
 * Check if a number is NaN
 * @param x - Number to check
 * @returns 1 if x is NaN, 0 otherwise
 */
export function isNaNNumber(x: f64): f64 {
  return isNaN(x) ? 1 : 0
}
