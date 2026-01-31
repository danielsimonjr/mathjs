/**
 * @file Shared type definitions for the matrix module
 * @description Central type definitions used across all matrix-related files.
 *
 * Type Philosophy:
 * - Some `any` types are INTENTIONAL for typed-function runtime dispatch
 * - Callback parameters often use `any` because typed-function resolves
 *   the actual types at runtime based on matrix._datatype
 * - We prefer explicit `any` annotations with JSDoc over implicit any
 */

// =============================================================================
// External Type Imports (avoid circular dependencies)
// =============================================================================

/**
 * BigNumber interface - matches decimal.js structure
 * Used to avoid circular dependency with actual BigNumber type
 */
export interface BigNumberLike {
  toNumber(): number
  plus(y: BigNumberLike | number | string): BigNumberLike
  minus(y: BigNumberLike | number | string): BigNumberLike
  times(y: BigNumberLike | number | string): BigNumberLike
  div(y: BigNumberLike | number | string): BigNumberLike
  mul(y: BigNumberLike | number | string): BigNumberLike
}

/**
 * Complex number interface - matches complex.js structure
 */
export interface ComplexLike {
  re: number
  im: number
  add(y: ComplexLike | number): ComplexLike
  sub(y: ComplexLike | number): ComplexLike
  mul(y: ComplexLike | number): ComplexLike
  div(y: ComplexLike | number): ComplexLike
}

/**
 * Fraction interface - matches fraction.js structure
 */
export interface FractionLike {
  n: number
  d: number
  s: number
  add(y: FractionLike | number): FractionLike
  sub(y: FractionLike | number): FractionLike
  mul(y: FractionLike | number): FractionLike
  div(y: FractionLike | number): FractionLike
}

// =============================================================================
// Matrix Value Types
// =============================================================================

/**
 * Core numeric types supported by mathjs matrices.
 * Used for specific operations that only work on numeric values.
 */
export type MathNumericValue =
  | number
  | BigNumberLike
  | ComplexLike
  | FractionLike

/**
 * General matrix element value type.
 *
 * INTENTIONAL ANY: Matrix elements can be any type due to typed-function's
 * runtime type dispatch. The actual type is determined by matrix._datatype
 * at runtime, not at compile time.
 */
export type MatrixValue = any

/**
 * Data type string for matrix elements (e.g., 'number', 'BigNumber', 'Complex')
 */
export type DataType = string | undefined

// =============================================================================
// Nested Array Types
// =============================================================================

/**
 * Recursive nested array type for matrix data
 */
export type NestedArray<T = MatrixValue> = T | NestedArray<T>[]

/**
 * Dense matrix internal data structure
 */
export type DenseMatrixData<T = MatrixValue> = NestedArray<T>

/**
 * 2D array type (for sparse matrix valueOf/toArray results)
 */
export type MatrixArray<T = MatrixValue> = T[][]

// =============================================================================
// Callback Function Types
// =============================================================================

/**
 * Binary callback function for matrix operations (e.g., add, multiply).
 *
 * INTENTIONAL ANY: typed-function dispatches to the correct implementation
 * based on runtime types. The actual signature like (number, number) => number
 * is resolved at runtime via typed.find().
 */
export type MatrixCallback = (a: any, b: any) => any

/**
 * Scalar equality comparison function.
 *
 * INTENTIONAL ANY: Used with typed-function for type-specific comparisons.
 */
export type EqualScalarFunction = (a: any, b: any) => boolean

/**
 * Map callback for matrix.map() operations
 */
export type MapCallback<T = MatrixValue, R = MatrixValue> = (
  value: T,
  index: number[],
  matrix: MatrixInterface<T>
) => R

/**
 * ForEach callback for matrix.forEach() operations
 */
export type ForEachCallback<T = MatrixValue> = (
  value: T,
  index: number[],
  matrix: MatrixInterface<T>
) => void

// =============================================================================
// typed-function Interface
// =============================================================================

/**
 * Interface for typed-function dependency.
 *
 * INTENTIONAL ANY in some methods: typed-function's API uses dynamic types
 * that are resolved at runtime.
 */
export interface TypedFunction {
  /**
   * Find a specific signature of a typed function.
   * Returns the function matching the given type signature.
   */
  find(fn: Function, signature: string[]): Function | null

  /**
   * Convert a value to a specific datatype.
   * @param value - Value to convert (any type)
   * @param datatype - Target datatype string (e.g., 'number', 'BigNumber')
   */
  convert(value: any, datatype: string): any

  /**
   * Create a self-referential typed function.
   * Used when a function needs to recursively call itself with proper typing.
   *
   * INTENTIONAL ANY: The self parameter represents the typed function itself
   * which has dynamic signatures.
   */
  referToSelf<T>(fn: (self: T) => any): any

  /**
   * Signatures of the typed function (optional)
   */
  signatures?: Record<string, Function>
}

// =============================================================================
// Matrix Interfaces
// =============================================================================

/**
 * Index interface for matrix subsetting operations.
 * Represents a multi-dimensional index that can contain ranges, arrays, or scalars.
 */
export interface IndexInterface {
  readonly isIndex: boolean
  readonly type: string

  /** Get the size of each dimension */
  size(): number[]

  /** Get the minimum value for each dimension */
  min(): (number | string | undefined)[]

  /** Get the maximum value for each dimension */
  max(): (number | string | undefined)[]

  /**
   * Get a specific dimension of the index.
   *
   * INTENTIONAL ANY return: A dimension can be a number, Range, or ImmutableDenseMatrix.
   * The actual type depends on how the index was constructed.
   */
  dimension(dim: number): any

  /** Check if the index represents a scalar value */
  isScalar(): boolean

  /** Iterate over dimensions */
  forEach(
    callback: (dimension: any, index: number, indexObject: IndexInterface) => void
  ): void

  /** Clone the index */
  clone(): IndexInterface

  /** Convert to array representation */
  toArray(): any[]

  /** Get primitive value */
  valueOf(): any[]

  /** Check if this is an object property index */
  isObjectProperty?(): boolean

  /** Get object property name if applicable */
  getObjectProperty?(): string | null
}

/**
 * Base Matrix interface defining common operations.
 * @template T - The element type stored in the matrix
 */
export interface MatrixInterface<T = MatrixValue> {
  readonly type: string
  readonly isMatrix: boolean

  /** Get the storage format ('dense' or 'sparse') */
  storage(): string

  /** Get the datatype string of matrix elements */
  datatype(): DataType

  /** Create a new matrix of the same type */
  create(data: NestedArray<T> | object, datatype?: string): MatrixInterface<T>

  /** Get matrix dimensions */
  size(): number[]

  /** Clone the matrix */
  clone(): MatrixInterface<T>

  /** Convert to nested array */
  toArray(): NestedArray<T>

  /** Get primitive value (nested array) */
  valueOf(): NestedArray<T>

  /** Get a single element */
  get(index: number[]): T

  /** Set a single element */
  set(index: number[], value: T, defaultValue?: T): MatrixInterface<T>

  /** Get or set a subset of the matrix */
  subset(
    index: IndexInterface,
    replacement?: NestedArray<T> | MatrixInterface<T> | T,
    defaultValue?: T
  ): MatrixInterface<T> | T

  /** Resize the matrix */
  resize(size: number[], defaultValue?: T, copy?: boolean): MatrixInterface<T>

  /** Reshape the matrix */
  reshape(size: number[], copy?: boolean): MatrixInterface<T>

  /** Map over elements */
  map<R>(callback: MapCallback<T, R>, skipZeros?: boolean): MatrixInterface<R>

  /** Iterate over elements */
  forEach(callback: ForEachCallback<T>, skipZeros?: boolean): void

  /** Format as string */
  format(options?: MatrixFormatOptions | number | ((value: T) => string)): string

  /** Convert to string */
  toString(): string
}

/**
 * DenseMatrix-specific interface
 */
export interface DenseMatrixInterface<T = MatrixValue> extends MatrixInterface<T> {
  readonly isDenseMatrix: boolean
  _data: DenseMatrixData<T>
  _size: number[]
  _datatype?: DataType

  createDenseMatrix(data: DenseMatrixData<T>, datatype?: string): DenseMatrixInterface<T>
  getDataType(): string
  rows?(): DenseMatrixInterface<T>[]
  columns?(): DenseMatrixInterface<T>[]
  diagonal?(k?: number | BigNumberLike): DenseMatrixInterface<T>
  swapRows?(i: number, j: number): DenseMatrixInterface<T>
}

/**
 * SparseMatrix-specific interface
 */
export interface SparseMatrixInterface<T = MatrixValue> extends MatrixInterface<T> {
  readonly isSparseMatrix: boolean
  _values?: T[]
  _index: number[]
  _ptr: number[]
  _size: [number, number]
  _datatype?: DataType

  createSparseMatrix(data?: any, datatype?: string): SparseMatrixInterface<T>
  getDataType(): string
  density(): number
  diagonal?(k?: number | BigNumberLike): SparseMatrixInterface<T>
  swapRows?(i: number, j: number): SparseMatrixInterface<T>
}

// =============================================================================
// Format Options
// =============================================================================

/**
 * Options for formatting matrix output
 */
export interface MatrixFormatOptions {
  /** Number of significant digits */
  precision?: number

  /** Notation style */
  notation?: 'fixed' | 'exponential' | 'engineering' | 'auto'

  /** Lower exponent bound for exponential notation */
  lowerExp?: number

  /** Upper exponent bound for exponential notation */
  upperExp?: number

  /** Allow additional custom properties */
  [key: string]: unknown
}

// =============================================================================
// JSON Serialization Types
// =============================================================================

/**
 * JSON representation of a DenseMatrix
 */
export interface DenseMatrixJSON<T = MatrixValue> {
  mathjs: 'DenseMatrix'
  data: DenseMatrixData<T>
  size: number[]
  datatype?: DataType
}

/**
 * JSON representation of a SparseMatrix
 */
export interface SparseMatrixJSON<T = MatrixValue> {
  mathjs: 'SparseMatrix'
  values?: T[]
  index: number[]
  ptr: number[]
  size: [number, number]
  datatype?: DataType
}

/**
 * JSON representation of an ImmutableDenseMatrix
 */
export interface ImmutableDenseMatrixJSON<T = MatrixValue> {
  mathjs: 'ImmutableDenseMatrix'
  data: DenseMatrixData<T>
  size: number[]
  datatype?: DataType
  min?: T
  max?: T
}

/**
 * JSON representation of a Range
 */
export interface RangeJSON {
  mathjs: 'Range'
  start: number
  end: number
  step: number
}

/**
 * JSON representation of an Index
 */
export interface IndexJSON {
  mathjs: 'Index'
  dimensions: any[]
}

// =============================================================================
// Matrix Entry Type (for iteration)
// =============================================================================

/**
 * Entry yielded when iterating over a matrix
 */
export interface MatrixEntry<T = MatrixValue> {
  value: T
  index: number[]
}

// =============================================================================
// Constructor/Factory Types
// =============================================================================

/**
 * Data structure for DenseMatrix constructor
 */
export interface DenseMatrixConstructorData<T = MatrixValue> {
  data: DenseMatrixData<T>
  size: number[]
  datatype?: DataType
}

/**
 * Data structure for SparseMatrix constructor
 */
export interface SparseMatrixConstructorData<T = MatrixValue> {
  values?: T[]
  index: number[]
  ptr: number[]
  size: [number, number]
  datatype?: DataType
}

/**
 * Data structure for ImmutableDenseMatrix constructor
 */
export interface ImmutableDenseMatrixConstructorData<T = MatrixValue> {
  data: DenseMatrixData<T>
  size: number[]
  datatype?: DataType
  min?: T
  max?: T
}

// =============================================================================
// Algorithm Suite Types
// =============================================================================

/**
 * Elementwise operation function type
 */
export type ElementwiseOperation = ((a: any, b: any) => any) & {
  signatures?: Record<string, Function>
}

/**
 * Algorithm function type (for sparse/dense matrix algorithms)
 */
export type AlgorithmFunction = (...args: any[]) => MatrixInterface

/**
 * Options for matrixAlgorithmSuite
 */
export interface MatrixAlgorithmSuiteOptions {
  /** Elementwise operation to use */
  elop?: ElementwiseOperation

  /** Algorithm for SparseMatrix + SparseMatrix */
  SS?: AlgorithmFunction

  /** Algorithm for DenseMatrix + SparseMatrix */
  DS?: AlgorithmFunction

  /** Algorithm for SparseMatrix + DenseMatrix (defaults to DS flipped) */
  SD?: AlgorithmFunction

  /** Algorithm for SparseMatrix + scalar */
  Ss?: AlgorithmFunction

  /** Algorithm for scalar + SparseMatrix (false means not implemented) */
  sS?: AlgorithmFunction | false

  /** Algorithm for DenseMatrix + scalar */
  Ds?: AlgorithmFunction

  /** typed-function scalar type (defaults to 'any') */
  scalar?: string
}

/**
 * Matrix signatures map for typed-function
 */
export type MatrixSignatures = Record<string, Function>

// =============================================================================
// FibonacciHeap Types
// =============================================================================

/**
 * Node in a Fibonacci heap
 */
export interface FibonacciHeapNode<T = MatrixValue> {
  key: number
  value: T
  degree: number
  left?: FibonacciHeapNode<T>
  right?: FibonacciHeapNode<T>
  parent?: FibonacciHeapNode<T>
  child?: FibonacciHeapNode<T>
  mark?: boolean
}

/**
 * Fibonacci heap interface
 */
export interface FibonacciHeapInterface<T = MatrixValue> {
  insert(key: number, value: T): FibonacciHeapNode<T>
  extractMinimum(): FibonacciHeapNode<T> | null
  remove(node: FibonacciHeapNode<T>): void
  size(): number
  clear(): void
  isEmpty(): boolean
}

// =============================================================================
// Range Types
// =============================================================================

/**
 * Callback for Range forEach operations.
 *
 * INTENTIONAL ANY: The range parameter uses 'any' because the Range class
 * passes 'this' which is the class instance. Using RangeInterface here would
 * create a circular reference since Range implements RangeInterface.
 */
export type RangeForEachCallback = (
  value: number,
  index: [number],
  range: any
) => void

/**
 * Callback for Range map operations.
 *
 * INTENTIONAL ANY: The range parameter uses 'any' because the Range class
 * passes 'this' which is the class instance. Using RangeInterface here would
 * create a circular reference since Range implements RangeInterface.
 */
export type RangeMapCallback<T> = (
  value: number,
  index: [number],
  range: any
) => T

/**
 * Format options for Range display
 */
export interface RangeFormatOptions {
  precision?: number
  notation?: 'fixed' | 'exponential' | 'engineering' | 'auto'
  [key: string]: unknown
}

/**
 * Range interface
 */
export interface RangeInterface {
  readonly type: string
  readonly isRange: boolean
  start: number
  end: number
  step: number

  clone(): RangeInterface
  size(): [number]
  min(): number | undefined
  max(): number | undefined
  forEach(callback: RangeForEachCallback): void
  map<T>(callback: RangeMapCallback<T>): T[]
  toArray(): number[]
  valueOf(): number[]
  format(options?: RangeFormatOptions | number | ((value: number) => string)): string
  toString(): string
  toJSON(): RangeJSON
}
