/**
 * @file Shared type definitions for function modules
 * @description Centralizes interfaces that were duplicated across ~50 function files.
 *
 * Re-exports relevant types from the matrix types module and adds function-specific
 * interfaces (MatrixData, MatrixConstructor, NodeOperations) that are used by
 * factory functions but not defined in the core matrix types.
 */

// =============================================================================
// Re-exports from core matrix types
// =============================================================================

export type {
  TypedFunction,
  MatrixInterface,
  DenseMatrixInterface,
  SparseMatrixInterface,
  MatrixValue,
  DataType,
  NestedArray,
  DenseMatrixData,
  MatrixCallback,
  EqualScalarFunction,
  MapCallback,
  ForEachCallback,
  MatrixFormatOptions,
  IndexInterface,
  BigNumberLike,
  ComplexLike,
  FractionLike,
  MathNumericValue,
  AlgorithmFunction,
  ElementwiseOperation,
  MatrixAlgorithmSuiteOptions,
  MatrixSignatures
} from '../../type/matrix/types.ts'

// =============================================================================
// Function-specific Types (duplicated across ~50 function files)
// =============================================================================

/**
 * Simplified matrix data structure used by function factory constructors.
 * Covers both dense (data array) and sparse (values/index/ptr) representations.
 */
export interface MatrixData {
  data?: any[] | any[][]
  values?: any[]
  index?: number[]
  ptr?: number[]
  size: number[]
  datatype?: string
}

/**
 * Simplified DenseMatrix interface used in function files.
 * A lightweight version of DenseMatrixInterface for factory function contexts.
 */
export interface DenseMatrix {
  _data: any[] | any[][]
  _size: number[]
  _datatype?: string
  storage(): 'dense'
  size(): number[]
  getDataType(): string
  createDenseMatrix(data: MatrixData): DenseMatrix
  valueOf(): any[] | any[][]
}

/**
 * Simplified SparseMatrix interface used in function files.
 * A lightweight version of SparseMatrixInterface for factory function contexts.
 */
export interface SparseMatrix {
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  _data?: any
  storage(): 'sparse'
  size(): number[]
  getDataType(): string
  createSparseMatrix(data: MatrixData): SparseMatrix
  valueOf(): any[] | any[][]
}

/**
 * Union type for either dense or sparse matrix.
 */
export type Matrix = DenseMatrix | SparseMatrix

/**
 * Matrix constructor function used by factory functions.
 * Creates a matrix from data with an optional storage format.
 */
export interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

/**
 * Node operations interface for expression tree manipulation.
 * Used by arithmetic functions that support symbolic computation.
 */
export interface NodeOperations {
  createBinaryNode: (
    op: string,
    fn: string,
    left: unknown,
    right: unknown
  ) => unknown
  hasNodeArg: (...args: unknown[]) => boolean
}
