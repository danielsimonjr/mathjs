/**
 * Test for keywords - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import { keywords } from '../../../src/expression/keywords.js'

describe('keywords', function (): void {
  it('should return a map with reserved keywords', function (): void {
    assert.deepStrictEqual([...keywords].sort(), ['end'].sort())
  })
})
