import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createPrincipalComponentAnalysis } from '../../../../src/function/statistics/principalComponentAnalysis.js'

const math = create({ ...all, createPrincipalComponentAnalysis })

describe('principalComponentAnalysis', function () {
  it('should return components, eigenvalues, scores, explainedVariance', function () {
    const result = math.principalComponentAnalysis([[1, 2], [3, 4], [5, 6]])
    assert(Array.isArray(result.components), 'components should be an array')
    assert(Array.isArray(result.eigenvalues), 'eigenvalues should be an array')
    assert(Array.isArray(result.scores), 'scores should be an array')
    assert(Array.isArray(result.explainedVariance), 'explainedVariance should be an array')
  })

  it('should return correct dimensions', function () {
    const data = [[1, 2], [3, 4], [5, 6]]
    const result = math.principalComponentAnalysis(data)
    assert.strictEqual(result.components.length, 2)        // p components
    assert.strictEqual(result.components[0].length, 2)    // p-dimensional
    assert.strictEqual(result.eigenvalues.length, 2)
    assert.strictEqual(result.scores.length, 3)            // n rows
    assert.strictEqual(result.scores[0].length, 2)
    assert.strictEqual(result.explainedVariance.length, 2)
  })

  it('should sort eigenvalues in descending order', function () {
    const data = [[2, 0, 0], [0, 3, 4], [0, 4, 3], [1, 1, 1], [2, 2, 2]]
    const result = math.principalComponentAnalysis(data)
    for (let i = 0; i < result.eigenvalues.length - 1; i++) {
      assert(result.eigenvalues[i] >= result.eigenvalues[i + 1],
        `eigenvalues not sorted at index ${i}`)
    }
  })

  it('should have explainedVariance summing to 1', function () {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [2, 3, 1]]
    const result = math.principalComponentAnalysis(data)
    const sum = result.explainedVariance.reduce((s, v) => s + v, 0)
    assert(Math.abs(sum - 1) < 1e-10, `explainedVariance should sum to 1, got ${sum}`)
  })

  it('should have first component explain most variance', function () {
    // Highly correlated data: first PC should explain most variance
    const data = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
    const result = math.principalComponentAnalysis(data)
    assert(result.explainedVariance[0] > 0.9,
      `first PC should explain >90% variance, got ${result.explainedVariance[0]}`)
  })

  it('should have orthogonal components', function () {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [2, 4, 1]]
    const result = math.principalComponentAnalysis(data)
    // Dot product of any two components should be ~0
    for (let i = 0; i < result.components.length; i++) {
      for (let j = i + 1; j < result.components.length; j++) {
        let dot = 0
        for (let k = 0; k < result.components[i].length; k++) {
          dot += result.components[i][k] * result.components[j][k]
        }
        assert(Math.abs(dot) < 1e-10, `components ${i} and ${j} are not orthogonal, dot=${dot}`)
      }
    }
  })

  it('should have unit-length components', function () {
    const data = [[1, 2], [3, 4], [5, 6]]
    const result = math.principalComponentAnalysis(data)
    for (let i = 0; i < result.components.length; i++) {
      const norm = Math.sqrt(result.components[i].reduce((s, v) => s + v * v, 0))
      assert(Math.abs(norm - 1) < 1e-10, `component ${i} norm=${norm}, expected 1`)
    }
  })

  it('should throw for fewer than 2 rows', function () {
    assert.throws(() => math.principalComponentAnalysis([[1, 2]]), /at least 2 rows/)
  })

  it('should throw for inconsistent row lengths', function () {
    assert.throws(() => math.principalComponentAnalysis([[1, 2], [3, 4, 5]]), /same length/)
  })

  it('should handle 3D data', function () {
    const data = [
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
      [1, 2, 3],
      [2, 1, 1]
    ]
    const result = math.principalComponentAnalysis(data)
    assert.strictEqual(result.components.length, 3)
    assert.strictEqual(result.eigenvalues.length, 3)
  })
})
