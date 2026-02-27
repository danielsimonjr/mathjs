/**
 * Ambient type declarations for AssemblyScript builtins.
 * These types are provided by the AssemblyScript compiler at build time
 * but need declarations for TypeScript type-checking when WASM files
 * are transitively included via imports from src/function/.
 */

// AssemblyScript numeric types
declare type usize = number
declare type i64 = number
declare type u8 = number
declare type u32 = number
declare type f32 = number

// f64: type alias + namespace with constants
declare type f64 = number
declare namespace f64 {
  const NaN: f64
  const POSITIVE_INFINITY: f64
  const NEGATIVE_INFINITY: f64
  const MAX_VALUE: f64
  const MIN_VALUE: f64
}

// i32: type alias + namespace with builtins
declare type i32 = number
declare namespace i32 {
  function clz(value: i32): i32
  function ctz(value: i32): i32
  function rotl(value: i32, shift: i32): i32
  function rotr(value: i32, shift: i32): i32
  const MAX_VALUE: i32
  const MIN_VALUE: i32
}

/** SIMD 128-bit vector type */
declare type v128 = object

/** v128 SIMD intrinsics namespace */
declare namespace v128 {
  function load(ptr: usize, immOffset?: u32, immAlign?: u32): v128
  function store(ptr: usize, value: v128, immOffset?: u32, immAlign?: u32): void
  function splat<T>(value: T): v128
  function extract_lane<T>(vec: v128, idx: u8): T
  function replace_lane<T>(vec: v128, idx: u8, value: T): v128
  function add<T>(a: v128, b: v128): v128
  function sub<T>(a: v128, b: v128): v128
  function mul<T>(a: v128, b: v128): v128
  function div<T>(a: v128, b: v128): v128
  function neg<T>(a: v128): v128
  function abs<T>(a: v128): v128
  function sqrt<T>(a: v128): v128
  function min<T>(a: v128, b: v128): v128
  function max<T>(a: v128, b: v128): v128
  function and(a: v128, b: v128): v128
  function or(a: v128, b: v128): v128
  function xor(a: v128, b: v128): v128
  function not(a: v128): v128
  function shuffle<T>(a: v128, b: v128, ...lanes: u8[]): v128
  function swizzle(a: v128, s: v128): v128
}

/** f64x2 SIMD namespace (2 x f64 packed into v128) */
declare namespace f64x2 {
  function splat(value: f64): v128
  function extract_lane(vec: v128, idx: 0 | 1): f64
  function replace_lane(vec: v128, idx: 0 | 1, value: f64): v128
  function add(a: v128, b: v128): v128
  function sub(a: v128, b: v128): v128
  function mul(a: v128, b: v128): v128
  function div(a: v128, b: v128): v128
  function neg(a: v128): v128
  function abs(a: v128): v128
  function sqrt(a: v128): v128
  function min(a: v128, b: v128): v128
  function max(a: v128, b: v128): v128
}

// AssemblyScript type cast functions (e.g., f64(intValue) converts i32 to f64)
declare function f64(value: number): number
declare function i32(value: number): number
declare function i64(value: number): number
declare function u32(value: number): number

// AssemblyScript builtins
declare function unchecked<T>(expr: T): T
declare function changetype<T>(value: unknown): T
declare function isFinite<T>(value: T): boolean
declare function isNaN<T>(value: T): boolean
declare function sizeof<T>(): usize
declare function assert<T>(value: T, message?: string): T
declare function idof<T>(): u32

// AssemblyScript memory intrinsics
declare function load<T>(ptr: usize, immOffset?: u32): T
declare function store<T>(ptr: usize, value: T, immOffset?: u32): void

declare namespace memory {
  function grow(pages: i32): i32
  function size(): i32
}
