/**
 * Test for json/replacer - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../src/defaultInstance.ts'
const replacer = math.replacer

describe('replacer', function (): void {
  it('should stringify generic JSON', function (): void {
    const data = { foo: [1, 2, 3], bar: null, baz: 'str' }
    const json = '{"foo":[1,2,3],"bar":null,"baz":"str"}'
    assert.deepStrictEqual(JSON.stringify(data), json)
    assert.deepStrictEqual(JSON.stringify(data, replacer), json)
  })

  it('should stringify a number with special values like Infinity', function (): void {
    assert.deepStrictEqual(JSON.stringify(2.3, replacer), '2.3')
    assert.deepStrictEqual(
      JSON.stringify(Infinity, replacer),
      '{"mathjs":"number","value":"Infinity"}'
    )
    assert.deepStrictEqual(
      JSON.stringify(-Infinity, replacer),
      '{"mathjs":"number","value":"-Infinity"}'
    )
    assert.deepStrictEqual(
      JSON.stringify(NaN, replacer),
      '{"mathjs":"number","value":"NaN"}'
    )
  })

  it('should stringify a Complex number', function (): void {
    const c = new math.Complex(2, 4)
    const json = '{"mathjs":"Complex","re":2,"im":4}'

    assert.deepStrictEqual(JSON.stringify(c), json)
    assert.deepStrictEqual(JSON.stringify(c, replacer), json)
  })

  it('should stringify a BigNumber', function (): void {
    const b = new math.BigNumber(5)
    const json = '{"mathjs":"BigNumber","value":"5"}'

    assert.deepStrictEqual(JSON.stringify(b), json)
    assert.deepStrictEqual(JSON.stringify(b, replacer), json)
  })

  it('should stringify a bigint', function (): void {
    const b = 12345678901234567890n
    const json = '{"mathjs":"bigint","value":"12345678901234567890"}'

    assert.deepStrictEqual(JSON.stringify(b, replacer), json)
  })

  it('should stringify a Fraction', function (): void {
    const b = new math.Fraction(0.375)
    const json = '{"mathjs":"Fraction","n":"3","d":"8"}'

    assert.deepStrictEqual(JSON.stringify(b), json)
    assert.deepStrictEqual(JSON.stringify(b, replacer), json)
  })

  it('should stringify a Range', function (): void {
    const r = new math.Range(2, 10)
    const json = '{"mathjs":"Range","start":2,"end":10,"step":1}'
    assert.deepStrictEqual(JSON.stringify(r), json)
    assert.deepStrictEqual(JSON.stringify(r, replacer), json)
  })

  it('should stringify an Index', function (): void {
    const i = new math.Index(new math.Range(0, 10), 2)
    const json =
      '{"mathjs":"Index","dimensions":[' +
      '{"mathjs":"Range","start":0,"end":10,"step":1},' +
      '2' +
      ']}'
    assert.deepStrictEqual(JSON.stringify(i), json)
    assert.deepStrictEqual(JSON.stringify(i, replacer), json)
  })

  it('should stringify a Range (2)', function (): void {
    const r = new math.Range(2, 10, 2)
    const json = '{"mathjs":"Range","start":2,"end":10,"step":2}'
    assert.deepStrictEqual(JSON.stringify(r), json)
    assert.deepStrictEqual(JSON.stringify(r, replacer), json)
  })

  it('should stringify a Unit', function (): void {
    const u = new math.Unit(5, 'cm')
    const json =
      '{"mathjs":"Unit","value":5,"unit":"cm","fixPrefix":false,"skipSimp":true}'
    assert.deepStrictEqual(JSON.stringify(u), json)
    assert.deepStrictEqual(JSON.stringify(u, replacer), json)
  })

  it('should stringify a Unit with a value only', function (): void {
    const u = new math.Unit(5)
    const json =
      '{"mathjs":"Unit","value":5,"unit":null,"fixPrefix":false,"skipSimp":true}'
    assert.deepStrictEqual(JSON.stringify(u), json)
    assert.deepStrictEqual(JSON.stringify(u, replacer), json)
  })

  it('should stringify a Unit without a value', function (): void {
    const u = new math.Unit(null, 'cm')
    const json =
      '{"mathjs":"Unit","value":null,"unit":"cm","fixPrefix":false,"skipSimp":true}'
    assert.deepStrictEqual(JSON.stringify(u), json)
    assert.deepStrictEqual(JSON.stringify(u, replacer), json)
  })

  it('should stringify a Matrix, dense', function (): void {
    const m = math.matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'dense'
    )
    const json = '{"mathjs":"DenseMatrix","data":[[1,2],[3,4]],"size":[2,2]}'

    assert.deepStrictEqual(JSON.stringify(m), json)
    assert.deepStrictEqual(JSON.stringify(m, replacer), json)
  })

  it('should stringify a Matrix, sparse', function (): void {
    const m = math.matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'sparse'
    )
    const json =
      '{"mathjs":"SparseMatrix","values":[1,3,2,4],"index":[0,1,0,1],"ptr":[0,2,4],"size":[2,2]}'

    assert.deepStrictEqual(JSON.stringify(m), json)
    assert.deepStrictEqual(JSON.stringify(m, replacer), json)
  })

  it('should stringify a ResultSet', function (): void {
    const r = new math.ResultSet([1, 2, new math.Complex(3, 4)])
    const json =
      '{"mathjs":"ResultSet","entries":[1,2,{"mathjs":"Complex","re":3,"im":4}]}'
    assert.deepStrictEqual(JSON.stringify(r), json)
    assert.deepStrictEqual(JSON.stringify(r, replacer), json)
  })

  it('should stringify a Matrix containing a complex number, dense', function (): void {
    const c = new math.Complex(4, 5)
    const m = math.matrix(
      [
        [1, 2],
        [3, c]
      ],
      'dense'
    )
    const json =
      '{"mathjs":"DenseMatrix","data":[[1,2],[3,{"mathjs":"Complex","re":4,"im":5}]],"size":[2,2]}'

    assert.deepStrictEqual(JSON.stringify(m), json)
    assert.deepStrictEqual(JSON.stringify(m, replacer), json)
  })

  it('should stringify a Matrix containing a complex number, sparse', function (): void {
    const c = new math.Complex(4, 5)
    const m = math.matrix(
      [
        [1, 2],
        [3, c]
      ],
      'sparse'
    )
    const json =
      '{"mathjs":"SparseMatrix","values":[1,3,2,{"mathjs":"Complex","re":4,"im":5}],"index":[0,1,0,1],"ptr":[0,2,4],"size":[2,2]}'

    assert.deepStrictEqual(JSON.stringify(m), json)
    assert.deepStrictEqual(JSON.stringify(m, replacer), json)
  })

  it('should stringify a Chain', function (): void {
    const c = math.chain(2.3)
    const json = '{"mathjs":"Chain","value":2.3}'
    assert.deepStrictEqual(JSON.stringify(c), json)
    assert.deepStrictEqual(JSON.stringify(c, replacer), json)
  })

  it('should stringify a node tree', function (): void {
    const node = math.parse('2 + sin(3 x)')
    const json = {
      mathjs: 'OperatorNode',
      op: '+',
      fn: 'add',
      args: [
        {
          mathjs: 'ConstantNode',
          value: 2
        },
        {
          mathjs: 'FunctionNode',
          fn: {
            mathjs: 'SymbolNode',
            name: 'sin'
          },
          args: [
            {
              mathjs: 'OperatorNode',
              op: '*',
              fn: 'multiply',
              args: [
                {
                  mathjs: 'ConstantNode',
                  value: 3
                },
                {
                  mathjs: 'SymbolNode',
                  name: 'x'
                }
              ],
              implicit: true,
              isPercentage: false
            }
          ]
        }
      ],
      implicit: false,
      isPercentage: false
    }

    assert.deepStrictEqual(JSON.parse(JSON.stringify(node)), json)
    assert.deepStrictEqual(JSON.parse(JSON.stringify(node, replacer)), json)
  })

  it('should stringify a Parser', function (): void {
    const parser = new math.Parser()
    parser.evaluate('a = 42')
    parser.evaluate('w = bignumber(2)')
    parser.evaluate('f(x) = w * x')
    parser.evaluate('c = f(3)')

    const json = {
      mathjs: 'Parser',
      variables: {
        a: 42,
        c: { mathjs: 'BigNumber', value: '6' },
        w: { mathjs: 'BigNumber', value: '2' }
      },
      functions: {
        f: 'f(x) = w * x'
      }
    }

    assert.deepStrictEqual(JSON.parse(JSON.stringify(parser)), json)
    assert.deepStrictEqual(JSON.parse(JSON.stringify(parser, replacer)), json)
  })

  it('should throw when stringifying a Parser containing external functions', function (): void {
    const parser = new math.Parser()
    parser.set('f', (x) => 2 * x)

    assert.throws(
      () => JSON.stringify(parser),
      /Cannot serialize external function f/
    )
  })

  it('should stringify Help', function (): void {
    const h = new math.Help({ name: 'foo', description: 'bar' })
    const json = '{"mathjs":"Help","name":"foo","description":"bar"}'
    assert.deepStrictEqual(JSON.parse(JSON.stringify(h)), JSON.parse(json))
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(h, replacer)),
      JSON.parse(json)
    )
  })
})
