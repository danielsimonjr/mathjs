<<<<<<< HEAD
// @ts-nocheck
// test keywords
=======
/**
 * Test for keywords - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { keywords } from '../../../src/expression/keywords.js'

<<<<<<< HEAD
describe('keywords', function () {
  it('should return a map with reserved keywords', function () {
=======
describe('keywords', function (): void {
  it('should return a map with reserved keywords', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual([...keywords].sort(), ['end'].sort())
  })
})
