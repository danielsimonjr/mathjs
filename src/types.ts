// Type definitions for internal use
// These types are used throughout the mathjs source code

// TypedFunction is a callable that supports multiple type signatures
export type TypedFunction<T = any> = ((...args: any[]) => T) & {
  name?: string
  signatures?: Record<string, (...args: any[]) => any>
  referToSelf?: (callback: (self: any) => any) => any
  referTo?: (...args: any[]) => any
  find?: (...args: any[]) => any
}

// TypedFunctionConstructor for creating typed functions
export interface TypedFunctionConstructor {
  (...args: any[]): TypedFunction
  create(): TypedFunction
  resolve?: (...args: any[]) => any
}

// Re-export other types from the main types definitions
export type BigNumber = any
export type Complex = any
export type Matrix = any
export type Unit = any
export type Fraction = any
export type MathCollection = any[] | Matrix
export type MathNumericType = number | BigNumber | Fraction | Complex
