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

import { ObjectWrappingMap } from './map.ts'

// Type interfaces for math.js types
export interface BigNumber {
  isBigNumber: boolean
  constructor: {
    prototype: { isBigNumber: boolean }
    isDecimal?: (x: unknown) => boolean
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

export interface IndexDimension {
  _data?: unknown[]
  _size: number[]
  isRange?: boolean
  start?: number
  end?: number
}

export interface Index {
  _dimensions: (IndexDimension | string)[]
  _sourceSize?: (number | null)[]
  constructor: {
    prototype: { isIndex: boolean }
  }
}

export interface ResultSet<T = unknown> {
  entries: T[]
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
export interface PartitionedMap<K = unknown, V = unknown> {
  a: Map<K, V>
  b: Map<K, V>
}

// Type guard functions
export function isNumber(x: unknown): x is number {
  return typeof x === 'number'
}

export function isBigNumber(x: unknown): x is BigNumber {
  if (
    !x ||
    typeof x !== 'object' ||
    typeof (x as { constructor?: unknown }).constructor !== 'function'
  ) {
    return false
  }

  const obj = x as {
    isBigNumber?: boolean
    constructor: {
      prototype?: { isBigNumber?: boolean }
      isDecimal?: (v: unknown) => boolean
    }
  }

  if (
    obj.isBigNumber === true &&
    typeof obj.constructor.prototype === 'object' &&
    obj.constructor.prototype?.isBigNumber === true
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
  return (
    (x &&
      typeof x === 'object' &&
      Object.getPrototypeOf(x).isComplex === true) ||
    false
  )
}

export function isFraction(x: unknown): x is Fraction {
  return (
    (x &&
      typeof x === 'object' &&
      Object.getPrototypeOf(x).isFraction === true) ||
    false
  )
}

export function isUnit(x: unknown): x is Unit {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isUnit?: boolean } } }
  return obj.constructor?.prototype?.isUnit === true
}

export function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export const isArray = Array.isArray

export function isMatrix(x: unknown): x is Matrix {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isMatrix?: boolean } } }
  return obj.constructor?.prototype?.isMatrix === true
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
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isDenseMatrix?: boolean
    constructor?: { prototype?: { isMatrix?: boolean } }
  }
  return (
    obj.isDenseMatrix === true && obj.constructor?.prototype?.isMatrix === true
  )
}

export function isSparseMatrix(x: unknown): x is SparseMatrix {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isSparseMatrix?: boolean
    constructor?: { prototype?: { isMatrix?: boolean } }
  }
  return (
    obj.isSparseMatrix === true && obj.constructor?.prototype?.isMatrix === true
  )
}

export function isRange(x: unknown): x is Range {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isRange?: boolean } } }
  return obj.constructor?.prototype?.isRange === true
}

export function isIndex(x: unknown): x is Index {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isIndex?: boolean } } }
  return obj.constructor?.prototype?.isIndex === true
}

export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean'
}

export function isResultSet(x: unknown): x is ResultSet {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isResultSet?: boolean } } }
  return obj.constructor?.prototype?.isResultSet === true
}

export function isHelp(x: unknown): x is Help {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isHelp?: boolean } } }
  return obj.constructor?.prototype?.isHelp === true
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

export function isObject(x: unknown): x is Record<string, unknown> {
  return !!(
    x &&
    typeof x === 'object' &&
    (x as { constructor?: unknown }).constructor === Object &&
    !isComplex(x) &&
    !isFraction(x)
  )
}

/**
 * Returns `true` if the passed object appears to be a Map (i.e. duck typing).
 *
 * Methods looked for are `get`, `set`, `keys` and `has`.
 *
 * @param {Map | object} object
 * @returns
 */
export function isMap(object: unknown): object is Map<unknown, unknown> {
  // We can use the fast instanceof, or a slower duck typing check.
  // The duck typing method needs to cover enough methods to not be confused with DenseMatrix.
  if (!object) {
    return false
  }
  if (object instanceof Map || object instanceof ObjectWrappingMap) {
    return true
  }
  // Duck typing check for Map-like objects
  const mapLike = object as {
    set?: unknown
    get?: unknown
    keys?: unknown
    has?: unknown
  }
  return (
    typeof mapLike.set === 'function' &&
    typeof mapLike.get === 'function' &&
    typeof mapLike.keys === 'function' &&
    typeof mapLike.has === 'function'
  )
}

export function isPartitionedMap(object: unknown): object is PartitionedMap {
  if (!isMap(object)) return false
  const partitioned = object as { a?: unknown; b?: unknown }
  return isMap(partitioned.a) && isMap(partitioned.b)
}

export function isObjectWrappingMap(
  object: unknown
): object is ObjectWrappingMap {
  if (!isMap(object)) return false
  const wrapper = object as { wrappedObject?: unknown }
  return isObject(wrapper.wrappedObject)
}

export function isNull(x: unknown): x is null {
  return x === null
}

export function isUndefined(x: unknown): x is undefined {
  return x === undefined
}

export function isAccessorNode(x: unknown): x is AccessorNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isAccessorNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isAccessorNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isArrayNode(x: unknown): x is ArrayNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isArrayNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return obj.isArrayNode === true && obj.constructor?.prototype?.isNode === true
}

export function isAssignmentNode(x: unknown): x is AssignmentNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isAssignmentNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isAssignmentNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isBlockNode(x: unknown): x is BlockNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isBlockNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return obj.isBlockNode === true && obj.constructor?.prototype?.isNode === true
}

export function isConditionalNode(x: unknown): x is ConditionalNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isConditionalNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isConditionalNode === true &&
    obj.constructor?.prototype?.isNode === true
  )
}

export function isConstantNode(x: unknown): x is ConstantNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isConstantNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isConstantNode === true && obj.constructor?.prototype?.isNode === true
  )
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
  return (
    isConstantNode(node) ||
    (isOperatorNode(node) &&
      node.args.length === 1 &&
      isConstantNode(node.args[0]) &&
      '-+~'.includes(node.op))
  )
}

export function isFunctionAssignmentNode(
  x: unknown
): x is FunctionAssignmentNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isFunctionAssignmentNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isFunctionAssignmentNode === true &&
    obj.constructor?.prototype?.isNode === true
  )
}

export function isFunctionNode(x: unknown): x is FunctionNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isFunctionNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isFunctionNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isIndexNode(x: unknown): x is IndexNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isIndexNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return obj.isIndexNode === true && obj.constructor?.prototype?.isNode === true
}

export function isNode(x: unknown): x is Node {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return obj.isNode === true && obj.constructor?.prototype?.isNode === true
}

export function isObjectNode(x: unknown): x is ObjectNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isObjectNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isObjectNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isOperatorNode(x: unknown): x is OperatorNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isOperatorNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isOperatorNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isParenthesisNode(x: unknown): x is ParenthesisNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isParenthesisNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isParenthesisNode === true &&
    obj.constructor?.prototype?.isNode === true
  )
}

export function isRangeNode(x: unknown): x is RangeNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isRangeNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return obj.isRangeNode === true && obj.constructor?.prototype?.isNode === true
}

export function isRelationalNode(x: unknown): x is RelationalNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isRelationalNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isRelationalNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isSymbolNode(x: unknown): x is SymbolNode {
  if (!x || typeof x !== 'object') return false
  const obj = x as {
    isSymbolNode?: boolean
    constructor?: { prototype?: { isNode?: boolean } }
  }
  return (
    obj.isSymbolNode === true && obj.constructor?.prototype?.isNode === true
  )
}

export function isChain(x: unknown): x is Chain {
  if (!x || typeof x !== 'object') return false
  const obj = x as { constructor?: { prototype?: { isChain?: boolean } } }
  return obj.constructor?.prototype?.isChain === true
}

export function typeOf(x: unknown): string {
  const t = typeof x

  if (t === 'object') {
    if (x === null) return 'null'
    if (isBigNumber(x)) return 'BigNumber' // Special: weird mashup with Decimal
    const obj = x as { constructor?: { name?: string } }
    if (obj.constructor && obj.constructor.name) return obj.constructor.name

    return 'Object' // just in case
  }

  return t // can be 'string', 'number', 'boolean', 'function', 'bigint', ...
}
