import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('curvefit', function () {
  it('should fit a linear model y = a*x + b', function () {
    const model = (x, p) => p[0] * x + p[1]
    const xdata = [0, 1, 2, 3, 4]
    const ydata = [1, 3, 5, 7, 9] // y = 2x + 1
    const result = math.curvefit(model, [1, 0], xdata, ydata)
    assert(Math.abs(result.params[0] - 2) < 1e-5)
    assert(Math.abs(result.params[1] - 1) < 1e-5)
  })

  it('should fit an exponential model y = a * exp(b*x)', function () {
    const model = (x, p) => p[0] * Math.exp(p[1] * x)
    const xdata = [0, 1, 2]
    const ydata = [1, Math.E, Math.E * Math.E] // y = exp(x), a=1, b=1
    const result = math.curvefit(model, [1, 0.5], xdata, ydata)
    assert(Math.abs(result.params[0] - 1) < 1e-4)
    assert(Math.abs(result.params[1] - 1) < 1e-4)
  })

  it('should return residuals', function () {
    const model = (x, p) => p[0] * x
    const xdata = [1, 2, 3]
    const ydata = [2, 4, 6]
    const result = math.curvefit(model, [1], xdata, ydata)
    assert(Array.isArray(result.residuals))
    assert.strictEqual(result.residuals.length, 3)
    for (const r of result.residuals) {
      assert(Math.abs(r) < 1e-5)
    }
  })

  it('should return iteration count', function () {
    const model = (x, p) => p[0] * x + p[1]
    const result = math.curvefit(model, [1, 0], [0, 1], [0, 1])
    assert(typeof result.iterations === 'number')
    assert(result.iterations >= 1)
  })

  it('should accept options', function () {
    const model = (x, p) => p[0] * x + p[1]
    const xdata = [0, 1, 2, 3]
    const ydata = [1, 3, 5, 7]
    const result = math.curvefit(model, [1, 0], xdata, ydata, { tol: 1e-10, maxIter: 500 })
    assert(Math.abs(result.params[0] - 2) < 1e-5)
  })

  it('should throw for mismatched xdata/ydata lengths', function () {
    const model = (x, p) => p[0] * x
    assert.throws(function () {
      math.curvefit(model, [1], [1, 2, 3], [1, 2])
    }, /same length/)
  })
})
