/**
 * Test for latex - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import { toSymbol } from '../../../src/utils/latex.js'

describe('util.latex', function (): void {
  it('should convert symbols with underscores', function (): void {
    assert.strictEqual(toSymbol('alpha_1'), 'alpha\\_1')
  })

  it('should convert special units', function (): void {
    assert.strictEqual(toSymbol('deg', true), '^\\circ')
  })

  it('should convert normal units', function (): void {
    assert.strictEqual(toSymbol('cm', true), '\\mathrm{cm}')
  })

  it('should escape strings', function (): void {
    const string = 'space tab\tunderscore_bla$/'

    assert.strictEqual(
      toSymbol(string),
      'space~tab\\qquad{}underscore\\_bla\\$/'
    )
  })
})
