// Type definitions for expression module
// Re-export from internal types

export type { TypedFunction } from '../core/function/typed.ts'

// TypedFunctionConstructor can be defined inline if needed
export type TypedFunctionConstructor = {
  (...args: any[]): any
  create: () => TypedFunctionConstructor
  isTypedFunction: (fn: unknown) => boolean
}
