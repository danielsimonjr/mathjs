/**
 * Test for typeOf function - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

// Type definitions for Math.js constructors
interface MathNode {
  type: string
  toTex(): string
}

// Get constructors from math instance with proper typing
const Index = math.Index as new (ranges: unknown[]) => object
const Range = math.Range as new (start: number, end: number, step?: number) => object
const Help = math.Help as new (doc: object, mathInstance: object) => object
const Unit = math.Unit as new (value: number, unit: string) => object
const Complex = math.Complex as new (re: number, im: number) => object
const Fraction = math.Fraction as new (n: number, d: number) => object

describe('typeOf', function (): void {
  it('should return number type for a number', function (): void {
    assert.strictEqual(math.typeOf(2), 'number')
    assert.strictEqual(math.typeOf(Number(2)), 'number')
    assert.strictEqual(math.typeOf(Number(2.3)), 'number')
    assert.strictEqual(math.typeOf(NaN), 'number')
  })

  it('should return bignumber type for a bigint', function (): void {
    assert.strictEqual(math.typeOf(42n), 'bigint')
    assert.strictEqual(math.typeOf(math.bigint('42')), 'bigint')
  })

  it('should return bignumber type for a bignumber', function (): void {
    assert.strictEqual(math.typeOf(math.bignumber(0.1)), 'BigNumber')
    const BigNumber = math.BigNumber as new (value: string) => object
    assert.strictEqual(math.typeOf(new BigNumber('0.2')), 'BigNumber')
  })

  it('should return string type for a string', function (): void {
    assert.strictEqual(math.typeOf('hello there'), 'string')
    assert.strictEqual(math.typeOf(String('hello there')), 'string')
  })

  it('should return complex type for a complex number', function (): void {
    assert.strictEqual(math.typeOf(new Complex(2, 3)), 'Complex')
    assert.strictEqual(math.typeOf(math.complex(2, 3)), 'Complex')
  })

  it('should return complex type for a fraction', function (): void {
    assert.strictEqual(math.typeOf(new Fraction(2, 3)), 'Fraction')
    assert.strictEqual(math.typeOf(math.fraction(2, 3)), 'Fraction')
  })

  it('should return array type for an array', function (): void {
    assert.strictEqual(math.typeOf([1, 2, 3]), 'Array')
  })

  it('should return array type for an array (duplicate)', function (): void {
    assert.strictEqual(math.typeOf([1, 2, 3]), 'Array')
  })

  it('should return matrix type for a matrix', function (): void {
    assert.strictEqual(math.typeOf(math.matrix()), 'DenseMatrix')
    assert.strictEqual(math.typeOf(math.matrix([], 'sparse')), 'SparseMatrix')
  })

  it('should return unit type for a unit', function (): void {
    assert.strictEqual(math.typeOf(new Unit(5, 'cm')), 'Unit')
    assert.strictEqual(math.typeOf(math.unit('5cm')), 'Unit')
  })

  it('should return boolean type for a boolean', function (): void {
    assert.strictEqual(math.typeOf(true), 'boolean')
    assert.strictEqual(math.typeOf(false), 'boolean')
    assert.strictEqual(math.typeOf(Boolean(true)), 'boolean')
  })

  it('should return null type for null', function (): void {
    assert.strictEqual(math.typeOf(null), 'null')
  })

  it('should return undefined type for undefined', function (): void {
    assert.strictEqual(math.typeOf(undefined), 'undefined')
  })

  it('should return date type for a Date', function (): void {
    assert.strictEqual(math.typeOf(new Date()), 'Date')
  })

  it('should return the type of a regexp', function (): void {
    assert.strictEqual(math.typeOf(/regexp/), 'RegExp')
  })

  it('should return function type for a function', function (): void {
    function f1(): void {
      /* empty function for testing */
    }
    assert.strictEqual(math.typeOf(f1), 'function')
  })

  it('should return function type for a chain', function (): void {
    assert.strictEqual(math.typeOf(math.chain(3)), 'Chain')
  })

  it('should return function type for a ResultSet', function (): void {
    assert.strictEqual(math.typeOf(math.evaluate('a=2\nb=3')), 'ResultSet')
    const ResultSet = math.ResultSet as new (entries: unknown[]) => object
    assert.strictEqual(math.typeOf(new ResultSet([2, 3])), 'ResultSet')
  })

  it('should return function type for nodes', function (): void {
    const ConstantNode = math.ConstantNode as new (value: unknown) => MathNode
    const SymbolNode = math.SymbolNode as new (name: string) => MathNode
    const IndexNode = math.IndexNode as new (dimensions: unknown[]) => MathNode
    const AccessorNode = math.AccessorNode as new (object: MathNode, index: MathNode) => MathNode
    const ArrayNode = math.ArrayNode as new (items: unknown[]) => MathNode
    const AssignmentNode = math.AssignmentNode as new (object: MathNode, value: MathNode) => MathNode
    const BlockNode = math.BlockNode as new (blocks: unknown[]) => MathNode
    const ConditionalNode = math.ConditionalNode as new (
      condition: MathNode,
      trueExpr: MathNode,
      falseExpr: MathNode
    ) => MathNode
    const FunctionAssignmentNode = math.FunctionAssignmentNode as new (
      name: string,
      params: string[],
      expr: MathNode
    ) => MathNode
    const FunctionNode = math.FunctionNode as new (fn: string, args: unknown[]) => MathNode
    const ObjectNode = math.ObjectNode as new (properties: object) => MathNode
    const ParenthesisNode = math.ParenthesisNode as new (content: MathNode) => MathNode
    const RangeNode = math.RangeNode as new (start: MathNode, end: MathNode) => MathNode

    const constantNode = new ConstantNode(2)
    const symbolNode = new SymbolNode('x')
    const indexNode = new IndexNode([])

    assert.strictEqual(
      math.typeOf(new AccessorNode(symbolNode, indexNode)),
      'AccessorNode'
    )
    assert.strictEqual(math.typeOf(new ArrayNode([])), 'ArrayNode')
    assert.strictEqual(
      math.typeOf(new AssignmentNode(symbolNode, constantNode)),
      'AssignmentNode'
    )
    assert.strictEqual(math.typeOf(new BlockNode([])), 'BlockNode')
    assert.strictEqual(
      math.typeOf(new ConditionalNode(symbolNode, constantNode, constantNode)),
      'ConditionalNode'
    )
    assert.strictEqual(math.typeOf(constantNode), 'ConstantNode')
    assert.strictEqual(
      math.typeOf(new FunctionAssignmentNode('f', [], constantNode)),
      'FunctionAssignmentNode'
    )
    assert.strictEqual(math.typeOf(new FunctionNode('f', [])), 'FunctionNode')
    assert.strictEqual(math.typeOf(indexNode), 'IndexNode')
    assert.strictEqual(math.typeOf(new ObjectNode({})), 'ObjectNode')
    assert.strictEqual(math.typeOf(math.parse('a+b')), 'OperatorNode')
    assert.strictEqual(
      math.typeOf(new ParenthesisNode(constantNode)),
      'ParenthesisNode'
    )
    assert.strictEqual(
      math.typeOf(new RangeNode(constantNode, constantNode)),
      'RangeNode'
    )
    assert.strictEqual(math.typeOf(math.parse('a<b<c')), 'RelationalNode')
    assert.strictEqual(math.typeOf(symbolNode), 'SymbolNode')
  })

  it('should return function type for an index', function (): void {
    assert.strictEqual(math.typeOf(new Index([0, 10])), 'Index')
  })

  it('should return function type for a range', function (): void {
    assert.strictEqual(math.typeOf(new Range(0, 10)), 'Range')
  })

  it('should return function type for a help object', function (): void {
    assert.strictEqual(math.typeOf(new Help({}, {})), 'Help')
  })

  it('should return object type for an object', function (): void {
    assert.strictEqual(math.typeOf({}), 'Object')
  })

  it('should throw an error if called with a wrong number of arguments', function (): void {
    const typeOfFn = math.typeOf as (...args: unknown[]) => string
    assert.throws(function (): void {
      typeOfFn()
    })
    assert.throws(function (): void {
      typeOfFn(1, 2)
    })
  })

  it('should LaTeX typeOf', function (): void {
    const expression = math.parse('typeOf(1)') as MathNode
    assert.strictEqual(expression.toTex(), '\\mathrm{typeOf}\\left(1\\right)')
  })

  it('should throw an error in case of wrong number of arguments', function (): void {
    const typeOfFn = math.typeOf as (...args: unknown[]) => string
    assert.throws(function (): void {
      typeOfFn()
    }, /Too few arguments in function typeOf/)
    assert.throws(function (): void {
      typeOfFn(1, 2, 3)
    }, /Too many arguments in function typeOf/)
  })
})
