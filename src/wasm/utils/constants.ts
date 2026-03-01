/**
 * Shared constants for WASM modules
 * Centralizes numeric constants used across AssemblyScript files
 */

/** Size of f64 in bytes */
export const F64_SIZE: usize = 8

/** Size of i32 in bytes */
export const I32_SIZE: usize = 4

/** Default floating point tolerance */
export const EPSILON: f64 = 1e-12

/** Machine epsilon for f64 */
export const F64_EPSILON: f64 = 2.220446049250313e-16

/** Pi */
export const PI: f64 = 3.141592653589793

/** Two Pi */
export const TWO_PI: f64 = 6.283185307179586

/** Natural log of 2 */
export const LN2: f64 = 0.6931471805599453

/** Natural log of 10 */
export const LN10: f64 = 2.302585092994046
