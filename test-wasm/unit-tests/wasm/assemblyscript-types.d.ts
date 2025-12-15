/**
 * Type definitions to allow testing AssemblyScript files with TypeScript/Node
 * These stub the AssemblyScript-specific types
 */

// AssemblyScript primitive types
declare type i32 = number
declare type i64 = bigint
declare type u32 = number
declare type u64 = bigint
declare type f32 = number
declare type f64 = number
declare type bool = boolean

// AssemblyScript static array (maps to regular array for testing)
declare class StaticArray<T> extends Array<T> {
  static fromArray<T>(arr: T[]): StaticArray<T>
}
