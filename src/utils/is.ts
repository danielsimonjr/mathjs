// type checks for all known types
//
// note that:
//
// - check by duck-typing on a property like `isUnit`, instead of checking instanceof.
//   instanceof cannot be used because that would not allow to pass data from
//   one instance of math.js to another since each has it's own instance of Unit.
// - check the `isUnit` property via the constructor, so there will be no
//   matches for "fake" instances like plain objects with a property `isUnit`.
//   That is important for security reasons.
// - It must not be possible to override the type checks used internally,
//   for security reasons, so these functions are not exposed in the expression
//   parser.

import { ObjectWrappingMap } from './map.js'

// Type interfaces for math.js types
export interface BigNumber {
  isBigNumber: boolean
  constructor: {
    prototype: { isBigNumber: boolean }
    isDecimal?: (x: any) => boolean
  }
}

export interface Complex {
  re: number
  im: number
}

export interface Fraction {
  n: number
  d: number
}

export interface Unit {
  constructor: {
    prototype: { isUnit: boolean }
  }
  fixPrefix: boolean
  skipAutomaticSimplification: boolean
  units: any[]
  dimensions: number[]
  value: any
  _normalize(value: any): any
  clone(): Unit
  [key: string]: any
}

export interface Matrix {
  isMatrix?: boolean
  _size?: number[]
  constructor: {
    prototype: { isMatrix: boolean }
  }
}

export interface DenseMatrix extends Matrix {
  isDenseMatrix: boolean
}

export interface SparseMatrix extends Matrix {
  isSparseMatrix: boolean
}

export interface Range {
  start: number
  end: number
  step: number
  constructor: {
    prototype: { isRange: boolean }
  }
}

export interface Index {
  _dimensions: any[]
  _sourceSize?: (number | null)[]
  constructor: {
    prototype: { isIndex: boolean }
  }
}

export interface ResultSet {
  entries: any[]
  constructor: {
    prototype: { isResultSet: boolean }
  }
}

export interface Help {
  constructor: {
    prototype: { isHelp: boolean }
  }
}

export interface Chain {
  constructor: {
    prototype: { isChain: boolean }
  }
}

// AST Node types
export interface Node {
  isNode: boolean
  constructor: {
    prototype: { isNode: boolean }
  }
}

export interface AccessorNode extends Node {
  isAccessorNode: boolean
}

export interface ArrayNode extends Node {
  isArrayNode: boolean
}

export interface AssignmentNode extends Node {
  isAssignmentNode: boolean
}

export interface BlockNode extends Node {
  isBlockNode: boolean
}

export interface ConditionalNode extends Node {
  isConditionalNode: boolean
}

export interface ConstantNode extends Node {
  isConstantNode: boolean
}

export interface FunctionAssignmentNode extends Node {
  isFunctionAssignmentNode: boolean
}

export interface FunctionNode extends Node {
  isFunctionNode: boolean
}

export interface IndexNode extends Node {
  isIndexNode: boolean
}

export interface ObjectNode extends Node {
  isObjectNode: boolean
}

export interface OperatorNode extends Node {
  isOperatorNode: boolean
  op: string
  args: Node[]
}

export interface ParenthesisNode extends Node {
  isParenthesisNode: boolean
}

export interface RangeNode extends Node {
  isRangeNode: boolean
}

export interface RelationalNode extends Node {
  isRelationalNode: boolean
}

export interface SymbolNode extends Node {
  isSymbolNode: boolean
}

// Map types
export interface PartitionedMap {
  a: Map<any, any>
  b: Map<any, any>
}

// Type guard functions
export function isNumber(x: unknown): x is number {
  return typeof x === 'number'
}

export function isBigNumber(x: unknown): x is BigNumber {
  if (
    !x || typeof x !== 'object' ||
    typeof (x as any).constructor !== 'function'
  ) {
    return false
  }

  const obj = x as any

  if (
    obj.isBigNumber === true &&
    typeof obj.constructor.prototype === 'object' &&
    obj.constructor.prototype.isBigNumber === true
  ) {
    return true
  }

  if (
    typeof obj.constructor.isDecimal === 'function' &&
    obj.constructor.isDecimal(obj) === true
  ) {
    return true
  }

  return false
}

export function isBigInt(x: unknown): x is bigint {
  return typeof x === 'bigint'
}

export function isComplex(x: unknown): x is Complex {
  return !!(x && typeof x === 'object' && Object.getPrototypeOf(x).isComplex === true)
}

export function isFraction(x: unknown): x is Fraction {
  return !!(x && typeof x === 'object' && Object.getPrototypeOf(x).isFraction === true)
}

export function isUnit(x: unknown): x is Unit {
  return !!(x && (x as any).constructor.prototype.isUnit === true)
}

export function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export const isArray = Array.isArray

export function isMatrix(x: unknown): x is Matrix {
  return !!(x && (x as any).constructor.prototype.isMatrix === true)
}

/**
 * Test whether a value is a collection: an Array or Matrix
 * @param {*} x
 * @returns {boolean} isCollection
 */
export function isCollection(x: unknown): x is any[] | Matrix {
  return Array.isArray(x) || isMatrix(x)
}

export function isDenseMatrix(x: unknown): x is DenseMatrix {
  return !!(x && (x as any).isDenseMatrix && (x as any).constructor.prototype.isMatrix === true)
}

export function isSparseMatrix(x: unknown): x is SparseMatrix {
  return !!(x && (x as any).isSparseMatrix && (x as any).constructor.prototype.isMatrix === true)
}

export function isRange(x: unknown): x is Range {
  return !!(x && (x as any).constructor.prototype.isRange === true)
}

export function isIndex(x: unknown): x is Index {
  return !!(x && (x as any).constructor.prototype.isIndex === true)
}

export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean'
}

export function isResultSet(x: unknown): x is ResultSet {
  return !!(x && (x as any).constructor.prototype.isResultSet === true)
}

export function isHelp(x: unknown): x is Help {
  return !!(x && (x as any).constructor.prototype.isHelp === true)
}

export function isFunction(x: unknown): x is Function {
  return typeof x === 'function'
}

export function isDate(x: unknown): x is Date {
  return x instanceof Date
}

export function isRegExp(x: unknown): x is RegExp {
  return x instanceof RegExp
}

export function isObject(x: unknown): x is Record<string, any> {
  return !!(x &&
    typeof x === 'object' &&
    (x as any).constructor === Object &&
    !isComplex(x) &&
    !isFraction(x))
}

/**
 * Returns `true` if the passed object appears to be a Map (i.e. duck typing).
 *
 * Methods looked for are `get`, `set`, `keys` and `has`.
 *
 * @param {Map | object} object
 * @returns
 */
export function isMap(object: unknown): object is Map<any, any> {
  // We can use the fast instanceof, or a slower duck typing check.
  // The duck typing method needs to cover enough methods to not be confused with DenseMatrix.
  if (!object) {
    return false
  }
  return object instanceof Map ||
    object instanceof ObjectWrappingMap ||
    (
      typeof (object as any).set === 'function' &&
      typeof (object as any).get === 'function' &&
      typeof (object as any).keys === 'function' &&
      typeof (object as any).has === 'function'
    )
}

export function isPartitionedMap(object: unknown): object is PartitionedMap {
  return isMap(object) && isMap((object as any).a) && isMap((object as any).b)
}

export function isObjectWrappingMap(object: unknown): object is ObjectWrappingMap {
  return isMap(object) && isObject((object as any).wrappedObject)
}

export function isNull(x: unknown): x is null {
  return x === null
}

export function isUndefined(x: unknown): x is undefined {
  return x === undefined
}

export function isAccessorNode(x: unknown): x is AccessorNode {
  return !!(x && (x as any).isAccessorNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isArrayNode(x: unknown): x is ArrayNode {
  return !!(x && (x as any).isArrayNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isAssignmentNode(x: unknown): x is AssignmentNode {
  return !!(x && (x as any).isAssignmentNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isBlockNode(x: unknown): x is BlockNode {
  return !!(x && (x as any).isBlockNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isConditionalNode(x: unknown): x is ConditionalNode {
  return !!(x && (x as any).isConditionalNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isConstantNode(x: unknown): x is ConstantNode {
  return !!(x && (x as any).isConstantNode === true && (x as any).constructor.prototype.isNode === true)
}

/* Very specialized: returns true for those nodes which in the numerator of
   a fraction means that the division in that fraction has precedence over implicit
   multiplication, e.g. -2/3 x parses as (-2/3) x and 3/4 x parses as (3/4) x but
   6!/8 x parses as 6! / (8x). It is located here because it is shared between
   parse.js and OperatorNode.js (for parsing and printing, respectively).

   This should *not* be exported from mathjs, unlike most of the tests here.
   Its name does not start with 'is' to prevent utils/snapshot.js from thinking
   it should be exported.
*/
export function rule2Node(node: Node): boolean {
  return isConstantNode(node) ||
    (isOperatorNode(node) &&
     node.args.length === 1 &&
     isConstantNode(node.args[0]) &&
     '-+~'.includes(node.op))
}

export function isFunctionAssignmentNode(x: unknown): x is FunctionAssignmentNode {
  return !!(x && (x as any).isFunctionAssignmentNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isFunctionNode(x: unknown): x is FunctionNode {
  return !!(x && (x as any).isFunctionNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isIndexNode(x: unknown): x is IndexNode {
  return !!(x && (x as any).isIndexNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isNode(x: unknown): x is Node {
  return !!(x && (x as any).isNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isObjectNode(x: unknown): x is ObjectNode {
  return !!(x && (x as any).isObjectNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isOperatorNode(x: unknown): x is OperatorNode {
  return !!(x && (x as any).isOperatorNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isParenthesisNode(x: unknown): x is ParenthesisNode {
  return !!(x && (x as any).isParenthesisNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isRangeNode(x: unknown): x is RangeNode {
  return !!(x && (x as any).isRangeNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isRelationalNode(x: unknown): x is RelationalNode {
  return !!(x && (x as any).isRelationalNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isSymbolNode(x: unknown): x is SymbolNode {
  return !!(x && (x as any).isSymbolNode === true && (x as any).constructor.prototype.isNode === true)
}

export function isChain(x: unknown): x is Chain {
  return !!(x && (x as any).constructor.prototype.isChain === true)
}

export function typeOf(x: unknown): string {
  const t = typeof x

  if (t === 'object') {
    if (x === null) return 'null'
    if (isBigNumber(x)) return 'BigNumber' // Special: weird mashup with Decimal
    if ((x as any).constructor && (x as any).constructor.name) return (x as any).constructor.name

    return 'Object' // just in case
  }

  return t // can be 'string', 'number', 'boolean', 'function', 'bigint', ...
}
