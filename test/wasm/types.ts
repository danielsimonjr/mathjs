/**
 * Type definitions for Math.js test suite
 * These types are designed to be AssemblyScript-friendly where possible
 */

// Re-export assert for convenience
export { default as assert } from 'assert'

// Import the math instance
import mathInstance from '../../src/defaultInstance.js'

// Export the math instance with a typed interface
export const math = mathInstance

// Type aliases for common Math.js types
export type MathJsInstance = typeof mathInstance

// Matrix types
export interface Matrix {
  _data: unknown[][]
  _size: number[]
  _datatype?: string
  valueOf(): unknown[][]
  toArray(): unknown[][]
  size(): number[]
  get(index: number[]): unknown
  set(index: number[], value: unknown, defaultValue?: unknown): Matrix
  clone(): Matrix
  map(callback: (value: unknown, index: number[], matrix: Matrix) => unknown): Matrix
  forEach(callback: (value: unknown, index: number[], matrix: Matrix) => void): void
  toString(): string
}

export interface DenseMatrix extends Matrix {
  storage(): 'dense'
}

export interface SparseMatrix extends Matrix {
  storage(): 'sparse'
  _values?: unknown[]
  _index?: number[]
  _ptr?: number[]
}

// Complex number type
export interface ComplexNumber {
  re: number
  im: number
  add(other: ComplexNumber | number): ComplexNumber
  sub(other: ComplexNumber | number): ComplexNumber
  mul(other: ComplexNumber | number): ComplexNumber
  div(other: ComplexNumber | number): ComplexNumber
  abs(): number
  arg(): number
  conjugate(): ComplexNumber
  toString(): string
}

// Fraction type
export interface FractionNumber {
  n: number  // numerator
  d: number  // denominator
  s: number  // sign
  add(other: FractionNumber | number): FractionNumber
  sub(other: FractionNumber | number): FractionNumber
  mul(other: FractionNumber | number): FractionNumber
  div(other: FractionNumber | number): FractionNumber
  toString(): string
}

// BigNumber type
export interface BigNumber {
  plus(other: BigNumber | number | string): BigNumber
  minus(other: BigNumber | number | string): BigNumber
  times(other: BigNumber | number | string): BigNumber
  div(other: BigNumber | number | string): BigNumber
  toString(): string
  toNumber(): number
}

// Unit type
export interface Unit {
  value: number | null
  units: unknown[]
  to(unit: string): Unit
  toNumber(unit?: string): number
  toString(): string
  equalBase(other: Unit): boolean
  clone(): Unit
}

// Node types for expression parsing
export interface MathNode {
  type: string
  isNode: boolean
  comment?: string
  toString(options?: object): string
  toTex(options?: object): string
  toHTML(options?: object): string
  clone(): MathNode
  cloneDeep(): MathNode
  equals(other: MathNode): boolean
  _compile(math: MathJsInstance, argNames: Record<string, boolean>): (scope: object, args: object, context: object) => unknown
  compile(): { evaluate(scope?: object): unknown }
  evaluate(scope?: object): unknown
  forEach(callback: (node: MathNode, path: string, parent: MathNode) => void): void
  map(callback: (node: MathNode, path: string, parent: MathNode) => MathNode): MathNode
  transform(callback: (node: MathNode, path: string, parent: MathNode) => MathNode): MathNode
  traverse(callback: (node: MathNode, path: string, parent: MathNode) => void): void
  filter(callback: (node: MathNode, path: string, parent: MathNode) => boolean): MathNode[]
}

export interface ConstantNode extends MathNode {
  value: unknown
}

export interface SymbolNode extends MathNode {
  name: string
}

export interface OperatorNode extends MathNode {
  op: string
  fn: string
  args: MathNode[]
  implicit: boolean
}

export interface FunctionNode extends MathNode {
  fn: MathNode
  args: MathNode[]
}

export interface ParenthesisNode extends MathNode {
  content: MathNode
}

export interface ArrayNode extends MathNode {
  items: MathNode[]
}

export interface ObjectNode extends MathNode {
  properties: Record<string, MathNode>
}

export interface AccessorNode extends MathNode {
  object: MathNode
  index: IndexNode
  name: string
}

export interface IndexNode extends MathNode {
  dimensions: MathNode[]
  dotNotation: boolean
  isObjectProperty(): boolean
  getObjectProperty(): string
}

export interface RangeNode extends MathNode {
  start: MathNode
  end: MathNode
  step?: MathNode
}

export interface ConditionalNode extends MathNode {
  condition: MathNode
  trueExpr: MathNode
  falseExpr: MathNode
}

export interface AssignmentNode extends MathNode {
  object: MathNode
  index?: IndexNode
  value: MathNode
  name: string
}

export interface BlockNode extends MathNode {
  blocks: Array<{ node: MathNode; visible: boolean }>
}

export interface FunctionAssignmentNode extends MathNode {
  name: string
  params: string[]
  expr: MathNode
}

export interface RelationalNode extends MathNode {
  conditionals: string[]
  params: MathNode[]
}

// Index type
export interface Index {
  valueOf(): unknown[]
  size(): number[]
  min(): number[]
  max(): number[]
  forEach(callback: (value: unknown) => void): void
  dimension(dim: number): unknown
  isScalar(): boolean
  clone(): Index
}

// Range type
export interface Range {
  start: number
  end: number
  step: number
  valueOf(): number[]
  size(): number[]
  min(): number | undefined
  max(): number | undefined
  forEach(callback: (value: number) => void): void
  map(callback: (value: number) => unknown): unknown[]
  toArray(): number[]
  clone(): Range
  toString(): string
}

// Help type
export interface Help {
  doc: object
  math: MathJsInstance
  toString(): string
  toJSON(): object
}

// Chain type
export interface Chain {
  value: unknown
  done(): unknown
}

// ResultSet type
export interface ResultSet {
  entries: unknown[]
  valueOf(): unknown[]
}

// Parser type
export interface Parser {
  evaluate(expr: string): unknown
  get(name: string): unknown
  getAll(): Record<string, unknown>
  getAllAsMap(): Map<string, unknown>
  set(name: string, value: unknown): void
  remove(name: string): void
  clear(): void
}

// Utility type for test assertions
export type AssertFunction = typeof import('assert').strict

// Helper function to create typed test suites
export function describeTyped(name: string, fn: () => void): void {
  describe(name, fn)
}

export function itTyped(name: string, fn: () => void | Promise<void>): void {
  it(name, fn)
}
