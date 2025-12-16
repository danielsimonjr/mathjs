<<<<<<< HEAD
// @ts-nocheck
// test Help
=======
/**
 * Test for Help - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../src/defaultInstance.ts'
import { embeddedDocs } from '../../../src/expression/embeddedDocs/embeddedDocs.js'
const Help = math.Help

<<<<<<< HEAD
describe('help', function () {
=======
describe('help', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
  const doc = {
    name: 'add',
    category: 'Operators',
    syntax: ['x + y', 'add(x, y)'],
    description: 'Add two values.',
    examples: ['a = 2.1 + 3.6', 'a - 3.6'],
    seealso: ['subtract']
  }

<<<<<<< HEAD
  it('should generate the help for a function', function () {
=======
  it('should generate the help for a function', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help(doc)

    assert(help instanceof Help)
    assert.deepStrictEqual(help.doc.name, 'add')
    assert.deepStrictEqual(help.doc, doc)
  })

<<<<<<< HEAD
  it('should throw an error when constructed without new operator', function () {
    assert.throws(function () {
=======
  it('should throw an error when constructed without new operator', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(Help(embeddedDocs.sin))
    }, /Constructor must be called with the new operator/)
  })

<<<<<<< HEAD
  it('should throw an error when constructed without doc argument', function () {
    assert.throws(function () {
=======
  it('should throw an error when constructed without doc argument', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new Help())
    }, /Argument "doc" missing/)
  })

<<<<<<< HEAD
  it('should have a property isHelp', function () {
=======
  it('should have a property isHelp', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new Help(doc)
    assert.strictEqual(a.isHelp, true)
  })

<<<<<<< HEAD
  it('should have a property type', function () {
=======
  it('should have a property type', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new Help(doc)
    assert.strictEqual(a.type, 'Help')
  })

<<<<<<< HEAD
  it('should stringify a help', function () {
=======
  it('should stringify a help', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help(doc)
    assert.strictEqual(
      help.toString(),
      '\nName: add\n' +
        '\n' +
        'Category: Operators\n' +
        '\n' +
        'Description:\n' +
        '    Add two values.\n' +
        '\n' +
        'Syntax:\n' +
        '    x + y\n' +
        '    add(x, y)\n' +
        '\n' +
        'Examples:\n' +
        '    a = 2.1 + 3.6\n' +
        '        5.7\n' +
        '    a - 3.6\n' +
        '        2.1\n' +
        '\n' +
        'See also: subtract\n'
    )
  })

<<<<<<< HEAD
  it('should stringify a help with empty doc', function () {
=======
  it('should stringify a help with empty doc', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help({})
    assert.strictEqual(help.toString(), '\n')
  })

<<<<<<< HEAD
  it('should stringify a doc with empty example', function () {
=======
  it('should stringify a doc with empty example', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help({
      name: 'add',
      examples: ['2 + 3', '']
    })

    assert.strictEqual(
      help.toString(),
      '\nName: add\n' +
        '\n' +
        'Examples:\n' +
        '    2 + 3\n' +
        '        5\n' +
        '    \n' +
        '\n'
    )
  })

<<<<<<< HEAD
  it('should stringify a doc with example throwing an error', function () {
=======
  it('should stringify a doc with example throwing an error', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help({
      name: 'add',
      examples: ['2 ^^ 3']
    })

    assert.strictEqual(
      help.toString(),
      '\nName: add\n' +
        '\n' +
        'Examples:\n' +
        '    2 ^^ 3\n' +
        '        SyntaxError: Value expected (char 4)\n' +
        '\n'
    )
  })

<<<<<<< HEAD
  it('should return string representation on valueOf', function () {
=======
  it('should return string representation on valueOf', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help({
      name: 'add',
      examples: ['2 ^^ 3']
    })

    assert.strictEqual(
      help.valueOf(),
      '\nName: add\n' +
        '\n' +
        'Examples:\n' +
        '    2 ^^ 3\n' +
        '        SyntaxError: Value expected (char 4)\n' +
        '\n'
    )
  })

<<<<<<< HEAD
  it('should export doc to JSON', function () {
=======
  it('should export doc to JSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const help = new Help(doc)
    const json = help.toJSON()
    assert.deepStrictEqual(json, {
      mathjs: 'Help',
      name: 'add',
      category: 'Operators',
      syntax: ['x + y', 'add(x, y)'],
      description: 'Add two values.',
      examples: ['a = 2.1 + 3.6', 'a - 3.6'],
      seealso: ['subtract']
    })
    json.name = 'foo' // this should not alter the original doc
    json.examples.push('2 + 3') // this should not alter the original doc
    assert.strictEqual(doc.name, 'add')
    assert.notStrictEqual(json.examples.length, doc.examples.length)
  })

<<<<<<< HEAD
  it('should instantiate Help from json using fromJSON', function () {
=======
  it('should instantiate Help from json using fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const json = {
      mathjs: 'Help',
      name: 'add',
      category: 'Operators',
      syntax: ['x + y', 'add(x, y)'],
      description: 'Add two values.',
      examples: ['a = 2.1 + 3.6', 'a - 3.6'],
      seealso: ['subtract']
    }

    const help = Help.fromJSON(json)
    assert(help instanceof Help)
    assert.deepStrictEqual(doc, help.doc)
  })
})
