/**
 * Type definitions for typed-function
 * This is a minimal declaration file for the typed-function library
 */

declare module 'typed-function' {
  interface TypedFunction<T = unknown> {
    (...args: any[]): T
    signatures: Record<string, (...args: any[]) => any>
  }

  interface TypedFunctionOptions {
    name?: string
    typed?: any
  }

  interface TypedFunctionConstructor {
    <T = any>(name: string, signatures: Record<string, (...args: any[]) => any>): TypedFunction<T>
    <T = any>(signatures: Record<string, (...args: any[]) => any>): TypedFunction<T>
    create(): TypedFunctionConstructor
    convert(value: unknown, type: string): unknown
    find(fn: TypedFunction, signature: string | any[]): ((...args: any[]) => any) | null
    types: any[]
  }

  const typed: TypedFunctionConstructor
  export default typed
}
