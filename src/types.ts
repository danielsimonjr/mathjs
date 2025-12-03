// Type definitions re-exported for internal use
// This file provides types needed by various source files

// Re-export from local TypeScript definitions
export type { TypedFunction } from './core/function/typed.js'
export type { MathJsConfig, ConfigOptions } from './core/config.js'
export type { MathJsInstance } from './core/create.js'

// Re-export from the types declaration file for external types
export type {
  Matrix,
  MathCollection,
  MathNumericType,
  MathScalarType,
  MathArray
} from '../types/index.js'

// Type aliases for common types used internally
export type BigNumber = import('decimal.js').Decimal
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
