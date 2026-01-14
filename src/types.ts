// Type definitions re-exported for internal use
// This file provides types needed by various source files

// Re-export from local TypeScript definitions
export type { TypedFunction } from './core/function/typed.ts'
export type { MathJsConfig, ConfigOptions } from './core/config.ts'
export type { MathJsInstance } from './core/create.ts'

// Re-export from the types declaration file for external types
export type {
  Matrix,
  MathCollection,
  MathNumericType,
  MathScalarType,
  MathArray
} from '../types/index.ts'

// Type aliases for common types used internally
export type BigNumber = import('./type/local/Decimal.ts').Decimal
export type Complex = import('complex.js').default
export type Fraction = import('fraction.js').default

// Matrix-related types
export interface SparseMatrix {
  type: 'SparseMatrix'
  [key: string]: any
}

export interface Unit {
  type: 'Unit'
  [key: string]: any
}

// Constructor types
export interface MatrixConstructor {
  new (...args: any[]): any
  [key: string]: any
}
