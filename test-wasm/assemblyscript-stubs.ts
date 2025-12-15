/**
 * AssemblyScript Type Stubs for Pre-WASM Testing
 *
 * This file provides type definitions that allow AssemblyScript code
 * to be executed directly in Node.js/TypeScript without WASM compilation.
 *
 * Usage:
 *   1. Import this file before importing AssemblyScript modules
 *   2. The global types (i32, f64, etc.) become available
 *   3. AssemblyScript code runs as regular TypeScript
 */

// Declare AssemblyScript primitive types as globals
declare global {
  // Signed integers
  type i8 = number
  type i16 = number
  type i32 = number
  type i64 = bigint

  // Unsigned integers
  type u8 = number
  type u16 = number
  type u32 = number
  type u64 = bigint

  // Floating point
  type f32 = number
  type f64 = number

  // Boolean (AssemblyScript uses 'bool' not 'boolean')
  type bool = boolean

  // Size types
  type isize = number
  type usize = number
}

// Export empty object to make this a module
export {}
