/**
 * AssemblyScript Type Stubs for Pre-WASM Testing
 *
 * This file provides type definitions and runtime stubs that allow
 * AssemblyScript code to be executed directly in Node.js/TypeScript
 * without WASM compilation.
 *
 * Usage:
 *   1. Import this file before importing AssemblyScript modules
 *   2. The global types and functions become available
 *   3. AssemblyScript code runs as regular TypeScript
 *
 * Limitations:
 *   - Files using @inline decorator won't work (esbuild error)
 *   - Some AS-specific memory operations may not work
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

  // AssemblyScript built-in functions
  function unchecked<T>(value: T): T
  function assert(condition: boolean, message?: string): void
  function changetype<T>(value: unknown): T
  function sizeof<T>(): number
  function alignof<T>(): number
  function offsetof<T>(fieldName?: string): number
  function select<T>(condition: boolean, ifTrue: T, ifFalse: T): T
  function unreachable(): never

  // Type conversion functions (used as f64(x), i32(x), etc.)
  function f64(value: number | bigint): number
  function f32(value: number | bigint): number
  function i32(value: number | bigint): number
  function i64(value: number | bigint): bigint
  function u32(value: number | bigint): number
  function u64(value: number | bigint): bigint
}

// Runtime implementations of AssemblyScript built-ins
// @ts-ignore - defining global function
globalThis.unchecked = function <T>(value: T): T {
  return value
}

// @ts-ignore - defining global function
globalThis.assert = function (condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

// @ts-ignore - defining global function
globalThis.changetype = function <T>(value: unknown): T {
  return value as T
}

// @ts-ignore - defining global function
globalThis.sizeof = function <T>(): number {
  return 8 // Default to 8 bytes (f64)
}

// @ts-ignore - defining global function
globalThis.alignof = function <T>(): number {
  return 8 // Default to 8-byte alignment
}

// @ts-ignore - defining global function
globalThis.offsetof = function <T>(fieldName?: string): number {
  return 0
}

// @ts-ignore - defining global function
globalThis.select = function <T>(condition: boolean, ifTrue: T, ifFalse: T): T {
  return condition ? ifTrue : ifFalse
}

// @ts-ignore - defining global function
globalThis.unreachable = function (): never {
  throw new Error('Unreachable code executed')
}

// Type conversion functions
// @ts-ignore - defining global function
globalThis.f64 = function (value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value
}

// @ts-ignore - defining global function
globalThis.f32 = function (value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value
}

// @ts-ignore - defining global function
globalThis.i32 = function (value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) | 0 : value | 0
}

// @ts-ignore - defining global function
globalThis.i64 = function (value: number | bigint): bigint {
  return typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
}

// @ts-ignore - defining global function
globalThis.u32 = function (value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) >>> 0 : value >>> 0
}

// @ts-ignore - defining global function
globalThis.u64 = function (value: number | bigint): bigint {
  return typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
}

// Export empty object to make this a module
export {}
