import assert from 'assert'
import {
  arg,
  argArray,
  conj,
  conjArray,
  re,
  reArray,
  im,
  imArray,
  abs,
  absArray,
  addComplex,
  subComplex,
  mulComplex,
  divComplex,
  sqrtComplex,
  expComplex,
  logComplex,
  sinComplex,
  cosComplex,
  tanComplex,
  powComplexReal
} from '../../../../src/wasm/complex/operations.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/complex/operations', function () {
  describe('arg', function () {
    it('should compute argument of positive real', function () {
      assert(approxEqual(arg(1, 0), 0))
    })

    it('should compute argument of positive imaginary', function () {
      assert(approxEqual(arg(0, 1), Math.PI / 2))
    })

    it('should compute argument of negative real', function () {
      assert(approxEqual(arg(-1, 0), Math.PI))
    })

    it('should compute argument of negative imaginary', function () {
      assert(approxEqual(arg(0, -1), -Math.PI / 2))
    })

    it('should compute argument of 1+i', function () {
      assert(approxEqual(arg(1, 1), Math.PI / 4))
    })
  })

  describe('argArray', function () {
    it('should compute arguments for array of complex numbers', function () {
      // [1+0i, 0+1i, -1+0i]
      const data = new Float64Array([1, 0, 0, 1, -1, 0])
      const result = argArray(data)

      assert.strictEqual(result.length, 3)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], Math.PI / 2))
      assert(approxEqual(result[2], Math.PI))
    })
  })

  describe('conj', function () {
    it('should compute conjugate of real number', function () {
      const result = conj(3, 0)
      assert.strictEqual(result[0], 3)
      assert(result[1] === 0) // Use loose equality to handle -0
    })

    it('should compute conjugate of pure imaginary', function () {
      const result = conj(0, 5)
      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], -5)
    })

    it('should compute conjugate of complex number', function () {
      const result = conj(3, 4)
      assert.strictEqual(result[0], 3)
      assert.strictEqual(result[1], -4)
    })
  })

  describe('conjArray', function () {
    it('should compute conjugates for array', function () {
      const data = new Float64Array([1, 2, 3, 4])
      const result = conjArray(data)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], -2)
      assert.strictEqual(result[2], 3)
      assert.strictEqual(result[3], -4)
    })
  })

  describe('re', function () {
    it('should return real part', function () {
      assert.strictEqual(re(3, 4), 3)
    })
  })

  describe('reArray', function () {
    it('should extract real parts from array', function () {
      const data = new Float64Array([1, 2, 3, 4, 5, 6])
      const result = reArray(data)

      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 3)
      assert.strictEqual(result[2], 5)
    })
  })

  describe('im', function () {
    it('should return imaginary part', function () {
      assert.strictEqual(im(3, 4), 4)
    })
  })

  describe('imArray', function () {
    it('should extract imaginary parts from array', function () {
      const data = new Float64Array([1, 2, 3, 4, 5, 6])
      const result = imArray(data)

      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0], 2)
      assert.strictEqual(result[1], 4)
      assert.strictEqual(result[2], 6)
    })
  })

  describe('abs', function () {
    it('should compute magnitude of real number', function () {
      assert.strictEqual(abs(3, 0), 3)
      assert.strictEqual(abs(-4, 0), 4)
    })

    it('should compute magnitude of pure imaginary', function () {
      assert.strictEqual(abs(0, 5), 5)
    })

    it('should compute magnitude of 3+4i', function () {
      assert.strictEqual(abs(3, 4), 5)
    })
  })

  describe('absArray', function () {
    it('should compute magnitudes for array', function () {
      // [3+0i, 0+4i, 3+4i]
      const data = new Float64Array([3, 0, 0, 4, 3, 4])
      const result = absArray(data)

      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0], 3)
      assert.strictEqual(result[1], 4)
      assert.strictEqual(result[2], 5)
    })
  })

  describe('addComplex', function () {
    it('should add two complex numbers', function () {
      // (1+2i) + (3+4i) = 4+6i
      const result = addComplex(1, 2, 3, 4)
      assert.strictEqual(result[0], 4)
      assert.strictEqual(result[1], 6)
    })

    it('should add real to complex', function () {
      const result = addComplex(5, 0, 3, 4)
      assert.strictEqual(result[0], 8)
      assert.strictEqual(result[1], 4)
    })
  })

  describe('subComplex', function () {
    it('should subtract two complex numbers', function () {
      // (5+7i) - (3+4i) = 2+3i
      const result = subComplex(5, 7, 3, 4)
      assert.strictEqual(result[0], 2)
      assert.strictEqual(result[1], 3)
    })
  })

  describe('mulComplex', function () {
    it('should multiply two complex numbers', function () {
      // (1+2i)(3+4i) = 3 + 4i + 6i + 8i^2 = 3 + 10i - 8 = -5 + 10i
      const result = mulComplex(1, 2, 3, 4)
      assert.strictEqual(result[0], -5)
      assert.strictEqual(result[1], 10)
    })

    it('should multiply by i', function () {
      // (3+4i) * i = 3i + 4i^2 = -4 + 3i
      const result = mulComplex(3, 4, 0, 1)
      assert.strictEqual(result[0], -4)
      assert.strictEqual(result[1], 3)
    })

    it('should multiply by real', function () {
      // (3+4i) * 2 = 6 + 8i
      const result = mulComplex(3, 4, 2, 0)
      assert.strictEqual(result[0], 6)
      assert.strictEqual(result[1], 8)
    })
  })

  describe('divComplex', function () {
    it('should divide two complex numbers', function () {
      // (1+2i)/(3+4i) = (1+2i)(3-4i)/25 = (3 - 4i + 6i - 8i^2)/25 = (11 + 2i)/25
      const result = divComplex(1, 2, 3, 4)
      assert(approxEqual(result[0], 11 / 25))
      assert(approxEqual(result[1], 2 / 25))
    })

    it('should divide by real', function () {
      // (6+8i)/2 = 3+4i
      const result = divComplex(6, 8, 2, 0)
      assert.strictEqual(result[0], 3)
      assert.strictEqual(result[1], 4)
    })

    it('should divide by i', function () {
      // (3+4i)/i = (3+4i)(-i)/1 = -3i - 4i^2 = 4 - 3i
      const result = divComplex(3, 4, 0, 1)
      assert(approxEqual(result[0], 4))
      assert(approxEqual(result[1], -3))
    })
  })

  describe('sqrtComplex', function () {
    it('should compute sqrt of positive real', function () {
      const result = sqrtComplex(4, 0)
      assert.strictEqual(result[0], 2)
      assert.strictEqual(result[1], 0)
    })

    it('should compute sqrt of negative real', function () {
      // sqrt(-4) = 2i
      const result = sqrtComplex(-4, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 2))
    })

    it('should compute sqrt of i', function () {
      // sqrt(i) = (1+i)/sqrt(2)
      const result = sqrtComplex(0, 1)
      const expected = 1 / Math.sqrt(2)
      assert(approxEqual(result[0], expected))
      assert(approxEqual(result[1], expected))
    })

    it('should compute sqrt of 3+4i', function () {
      // sqrt(3+4i) = 2+i (since (2+i)^2 = 4 + 4i - 1 = 3+4i)
      const result = sqrtComplex(3, 4)
      assert(approxEqual(result[0], 2))
      assert(approxEqual(result[1], 1))
    })
  })

  describe('expComplex', function () {
    it('should compute e^0', function () {
      const result = expComplex(0, 0)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute e^1', function () {
      const result = expComplex(1, 0)
      assert(approxEqual(result[0], Math.E))
      assert(approxEqual(result[1], 0))
    })

    it('should compute e^(i*pi)', function () {
      // e^(i*pi) = -1
      const result = expComplex(0, Math.PI)
      assert(approxEqual(result[0], -1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute e^(i*pi/2)', function () {
      // e^(i*pi/2) = i
      const result = expComplex(0, Math.PI / 2)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 1))
    })
  })

  describe('logComplex', function () {
    it('should compute log(1)', function () {
      const result = logComplex(1, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 0))
    })

    it('should compute log(e)', function () {
      const result = logComplex(Math.E, 0)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute log(i)', function () {
      // log(i) = i*pi/2
      const result = logComplex(0, 1)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], Math.PI / 2))
    })

    it('should compute log(-1)', function () {
      // log(-1) = i*pi
      const result = logComplex(-1, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], Math.PI))
    })
  })

  describe('sinComplex', function () {
    it('should compute sin(0)', function () {
      const result = sinComplex(0, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 0))
    })

    it('should compute sin(pi/2)', function () {
      const result = sinComplex(Math.PI / 2, 0)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute sin(i)', function () {
      // sin(i) = i*sinh(1)
      const result = sinComplex(0, 1)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], Math.sinh(1)))
    })
  })

  describe('cosComplex', function () {
    it('should compute cos(0)', function () {
      const result = cosComplex(0, 0)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute cos(pi/2)', function () {
      const result = cosComplex(Math.PI / 2, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 0))
    })

    it('should compute cos(i)', function () {
      // cos(i) = cosh(1)
      const result = cosComplex(0, 1)
      assert(approxEqual(result[0], Math.cosh(1)))
      assert(approxEqual(result[1], 0))
    })
  })

  describe('tanComplex', function () {
    it('should compute tan(0)', function () {
      const result = tanComplex(0, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 0))
    })

    it('should compute tan(pi/4)', function () {
      const result = tanComplex(Math.PI / 4, 0)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute tan(i)', function () {
      // tan(i) = i*tanh(1)
      const result = tanComplex(0, 1)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], Math.tanh(1)))
    })
  })

  describe('powComplexReal', function () {
    it('should compute z^0 = 1', function () {
      const result = powComplexReal(3, 4, 0)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute z^1 = z', function () {
      const result = powComplexReal(3, 4, 1)
      assert(approxEqual(result[0], 3))
      assert(approxEqual(result[1], 4))
    })

    it('should compute i^2 = -1', function () {
      const result = powComplexReal(0, 1, 2)
      assert(approxEqual(result[0], -1))
      assert(approxEqual(result[1], 0))
    })

    it('should compute (1+i)^2 = 2i', function () {
      const result = powComplexReal(1, 1, 2)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 2))
    })

    it('should compute 2^0.5', function () {
      const result = powComplexReal(2, 0, 0.5)
      assert(approxEqual(result[0], Math.sqrt(2)))
      assert(approxEqual(result[1], 0))
    })
  })
})
