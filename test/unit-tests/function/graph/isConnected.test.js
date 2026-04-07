import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createIsConnected } from '../../../../src/function/graph/isConnected.js'

const math = create({ ...all, createIsConnected })

describe('isConnected', function () {
  it('should return true for a simple connected graph', function () {
    assert.strictEqual(math.isConnected({ 0: [1], 1: [0] }), true)
  })

  it('should return false for a disconnected graph (two isolated nodes)', function () {
    assert.strictEqual(math.isConnected({ 0: [], 1: [] }), false)
  })

  it('should return true for an empty graph', function () {
    assert.strictEqual(math.isConnected({}), true)
  })

  it('should return true for a single-node graph', function () {
    assert.strictEqual(math.isConnected({ 0: [] }), true)
  })

  it('should return true for a fully connected triangle', function () {
    assert.strictEqual(math.isConnected({ 0: [1, 2], 1: [0, 2], 2: [0, 1] }), true)
  })

  it('should return false when one component is isolated', function () {
    const graph = { 0: [1], 1: [0], 2: [3], 3: [2] }
    assert.strictEqual(math.isConnected(graph), false)
  })

  it('should work with string node keys', function () {
    assert.strictEqual(math.isConnected({ A: ['B'], B: ['A'] }), true)
  })

  it('should return false for string keys with isolated node', function () {
    assert.strictEqual(math.isConnected({ A: ['B'], B: ['A'], C: [] }), false)
  })

  it('should return true for a chain graph', function () {
    // 0-1-2-3-4
    assert.strictEqual(math.isConnected({ 0: [1], 1: [0, 2], 2: [1, 3], 3: [2, 4], 4: [3] }), true)
  })
})
