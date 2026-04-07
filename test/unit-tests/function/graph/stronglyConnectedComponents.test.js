import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createStronglyConnectedComponents } from '../../../../src/function/graph/stronglyConnectedComponents.js'

const math = create({ ...all, createStronglyConnectedComponents })

describe('stronglyConnectedComponents', function () {
  it('should find a 3-cycle SCC and two singleton SCCs', function () {
    // 0→1→2→0 forms a cycle; 3→4 has no back edges
    const graph = { 0: [1], 1: [2], 2: [0], 3: [4], 4: [] }
    const result = math.stronglyConnectedComponents(graph)

    assert.strictEqual(result.length, 3)

    // Find the large SCC (the cycle)
    const large = result.find(function (c) { return c.length === 3 })
    assert.ok(large, 'Should have one SCC of size 3')

    const largeNums = large.map(Number).sort(function (a, b) { return a - b })
    assert.deepStrictEqual(largeNums, [0, 1, 2])

    // Check there are two singleton SCCs
    const singletons = result.filter(function (c) { return c.length === 1 })
    assert.strictEqual(singletons.length, 2)
    const singletonVals = singletons.map(function (c) { return Number(c[0]) }).sort(function (a, b) { return a - b })
    assert.deepStrictEqual(singletonVals, [3, 4])
  })

  it('should return each node as its own SCC in a DAG', function () {
    const graph = { 0: [1], 1: [2], 2: [] }
    const result = math.stronglyConnectedComponents(graph)
    assert.strictEqual(result.length, 3)
    result.forEach(function (c) { assert.strictEqual(c.length, 1) })
  })

  it('should find one large SCC when all nodes form a cycle', function () {
    const graph = { 0: [1], 1: [2], 2: [3], 3: [0] }
    const result = math.stronglyConnectedComponents(graph)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 4)
  })

  it('should handle string node labels', function () {
    const graph = { A: ['B'], B: ['C'], C: ['A'], D: ['E'], E: [] }
    const result = math.stronglyConnectedComponents(graph)
    assert.strictEqual(result.length, 3)

    const large = result.find(function (c) { return c.length === 3 })
    assert.ok(large, 'Should have one SCC of size 3')
    assert.ok(large.includes('A'))
    assert.ok(large.includes('B'))
    assert.ok(large.includes('C'))
  })

  it('should handle isolated nodes', function () {
    const graph = { 0: [], 1: [], 2: [] }
    const result = math.stronglyConnectedComponents(graph)
    assert.strictEqual(result.length, 3)
    result.forEach(function (c) { assert.strictEqual(c.length, 1) })
  })

  it('should handle a single node', function () {
    const graph = { 0: [] }
    const result = math.stronglyConnectedComponents(graph)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 1)
  })

  it('should handle a self-loop as its own SCC', function () {
    const graph = { 0: [0], 1: [] }
    const result = math.stronglyConnectedComponents(graph)
    assert.strictEqual(result.length, 2)
    const selfLoop = result.find(function (c) { return c.length === 1 && String(c[0]) === '0' })
    assert.ok(selfLoop)
  })
})
