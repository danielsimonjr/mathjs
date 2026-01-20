/**
 * Plain Number Logical Operations - AssemblyScript
 *
 * Logical operations for WebAssembly compilation.
 * Converted from src/plain/number/logical.js
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.5
 *
 * Note: Returns f64 (1 for true, 0 for false) for compatibility
 */

/**
 * Logical NOT operation
 * @param x - Value to negate
 * @returns 1 if x is falsy, 0 if x is truthy
 */
export function notNumber(x: f64): f64 {
  return !x ? 1 : 0
}

/**
 * Logical OR operation
 * @param x - First value
 * @param y - Second value
 * @returns 1 if x or y is truthy, 0 otherwise
 */
export function orNumber(x: f64, y: f64): f64 {
  return x || y ? 1 : 0
}

/**
 * Logical XOR operation
 * @param x - First value
 * @param y - Second value
 * @returns 1 if exactly one of x or y is truthy, 0 otherwise
 */
export function xorNumber(x: f64, y: f64): f64 {
  return !!x !== !!y ? 1 : 0
}

/**
 * Logical AND operation
 * @param x - First value
 * @param y - Second value
 * @returns 1 if both x and y are truthy, 0 otherwise
 */
export function andNumber(x: f64, y: f64): f64 {
  return x && y ? 1 : 0
}
