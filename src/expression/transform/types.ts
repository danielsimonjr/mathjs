/**
 * Shared type definitions for transform functions
 * These types provide proper typing for the expression transform system
 */

import type { TypedFunction } from '../../core/function/typed.ts'

// Re-export TypedFunction for convenience
export type { TypedFunction }

/**
 * Represents a mathjs value that could be various numeric types
 */
export type MathValue =
  | number
  | bigint
  | BigNumberLike
  | ComplexLike
  | FractionLike

/**
 * BigNumber-like interface (minimal for transform operations)
 */
export interface BigNumberLike {
  minus(n: number | BigNumberLike): BigNumberLike
  plus(n: number | BigNumberLike): BigNumberLike
  toNumber(): number
  valueOf(): number
  isBigNumber?: boolean
}

/**
 * Complex number-like interface
 */
export interface ComplexLike {
  re: number
  im: number
  isComplex?: boolean
}

/**
 * Fraction-like interface
 */
export interface FractionLike {
  n: number
  d: number
  isFraction?: boolean
  valueOf(): number
}

/**
 * Represents a scope for expression evaluation
 * Can be a Map, PartitionedMap, or similar structure
 */
export interface EvaluationScope {
  get(key: string): unknown
  set(key: string, value: unknown): void
  has(key: string): boolean
  keys?(): Iterable<string>
}

/**
 * Compiled expression that can be evaluated
 */
export interface CompiledExpression {
  evaluate(scope: EvaluationScope | Map<string, unknown>): unknown
}

/**
 * AST Node interface for expression parsing
 */
export interface ExpressionNode {
  type: string
  compile(): CompiledExpression
  filter?(predicate: (node: ExpressionNode) => boolean): ExpressionNode[]
  name?: string
  isNode?: boolean
  isSymbolNode?: boolean
  isFunctionAssignmentNode?: boolean
}

/**
 * Raw args transform function signature
 * Used for transforms that need access to unevaluated AST nodes
 */
export interface RawArgsTransformFunction {
  (
    args: ExpressionNode[],
    math: MathJsLike,
    scope: EvaluationScope | Map<string, unknown>
  ): unknown
  rawArgs: true
}

/**
 * Minimal MathJs instance interface for transforms
 */
export interface MathJsLike {
  [key: string]: unknown
}

/**
 * Index class constructor interface
 */
export interface IndexConstructor {
  new (...args: unknown[]): IndexInstance
}

/**
 * Index instance interface
 */
export interface IndexInstance {
  valueOf(): unknown[]
  size(): number[]
  max(): number[]
  min(): number[]
  isIndex?: boolean
}

/**
 * DenseMatrix constructor interface
 */
export interface DenseMatrixConstructor {
  new (data?: unknown, datatype?: string): MatrixLike
}

/**
 * Matrix-like interface for transform operations
 */
export interface MatrixLike {
  valueOf(): unknown[][]
  toArray(): unknown[][]
  size(): number[]
  map<T>(
    callback: (value: unknown, index: number[], matrix: MatrixLike) => T
  ): MatrixLike
  forEach(
    callback: (value: unknown, index: number[], matrix: MatrixLike) => void
  ): void
  isMatrix?: boolean
}

/**
 * Range-like interface
 */
export interface RangeLike {
  start: number
  end: number
  step: number
  isRange?: boolean
}

/**
 * Set-like interface for index transforms
 */
export interface SetLike {
  isSet: true
  map<T>(callback: (value: unknown) => T): SetLike
}

/**
 * MathJS configuration object
 */
export interface MathJsConfig {
  epsilon: number
  matrix: 'Matrix' | 'Array'
  number: 'number' | 'BigNumber' | 'Fraction'
  precision: number
  predictable: boolean
  randomSeed: string | null
}

/**
 * Error with index information
 */
export interface IndexError extends Error {
  isIndexError: true
  index: number
  min: number
  max?: number
}

// ============================================================================
// Dependency type definitions for factory functions
// ============================================================================

/**
 * Common math function type - accepts various inputs and returns a value
 */
export type MathFunction<TReturn = unknown> = (...args: unknown[]) => TReturn

/**
 * Predicate function type
 */
export type PredicateFunction = (x: unknown) => boolean

/**
 * Callback function type for map/filter/forEach operations
 */
export type CallbackFunction = (...args: unknown[]) => unknown

/**
 * Typed callback - could be a regular function or typed-function
 */
export type TypedCallback = CallbackFunction | TypedFunction

/**
 * Arguments array type - used in '...any' typed-function signatures
 * The typed-function library passes variadic args as an array
 */
export type VariadicArgs = unknown[]

/**
 * Dimension value - can be number or BigNumber for one-based to zero-based conversion
 */
export type DimensionValue = number | BigNumberLike
