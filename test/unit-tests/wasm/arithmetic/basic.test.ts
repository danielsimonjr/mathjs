import assert from 'assert'
import {
  unaryMinus,
  unaryPlus,
  cbrt,
  cube,
  square,
  fix,
  fixDecimals,
  ceil,
  ceilDecimals,
  floor,
  floorDecimals,
  round,
  roundDecimals,
  abs,
  sign,
  add,
  subtract,
  multiply,
  divide,
  addInt,
  subtractInt,
  multiplyInt,
  divideInt
  // Array functions using `unchecked` must be tested via compiled WASM:
  // unaryMinusArray, squareArray, cubeArray, absArray, signArray,
  // addArray, subtractArray, multiplyArray, divideArray,
  // addScalarArray, multiplyScalarArray
} from '../../../../src/wasm/arithmetic/basic.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/arithmetic/basic', function () {
  describe('unaryMinus', function () {
    it('should negate positive numbers', function () {
      assert.strictEqual(unaryMinus(5), -5)
    })

    it('should negate negative numbers', function () {
      assert.strictEqual(unaryMinus(-3), 3)
    })

    it('should handle zero', function () {
      assert(unaryMinus(0) === 0) // Use loose check to handle -0
    })

    it('should handle decimals', function () {
      assert.strictEqual(unaryMinus(3.14), -3.14)
    })
  })

  describe('unaryPlus', function () {
    it('should return input unchanged', function () {
      assert.strictEqual(unaryPlus(5), 5)
      assert.strictEqual(unaryPlus(-3), -3)
      assert.strictEqual(unaryPlus(0), 0)
    })
  })

  describe('cbrt', function () {
    it('should compute cubic root of positive numbers', function () {
      assert.strictEqual(cbrt(8), 2)
      assert.strictEqual(cbrt(27), 3)
    })

    it('should compute cubic root of negative numbers', function () {
      assert.strictEqual(cbrt(-8), -2)
      assert.strictEqual(cbrt(-27), -3)
    })

    it('should handle zero', function () {
      assert.strictEqual(cbrt(0), 0)
    })

    it('should handle 1', function () {
      assert.strictEqual(cbrt(1), 1)
    })
  })

  describe('cube', function () {
    it('should compute cube of positive numbers', function () {
      assert.strictEqual(cube(2), 8)
      assert.strictEqual(cube(3), 27)
    })

    it('should compute cube of negative numbers', function () {
      assert.strictEqual(cube(-2), -8)
      assert.strictEqual(cube(-3), -27)
    })

    it('should handle zero', function () {
      assert.strictEqual(cube(0), 0)
    })
  })

  describe('square', function () {
    it('should compute square of positive numbers', function () {
      assert.strictEqual(square(3), 9)
      assert.strictEqual(square(4), 16)
    })

    it('should compute square of negative numbers', function () {
      assert.strictEqual(square(-3), 9)
      assert.strictEqual(square(-4), 16)
    })

    it('should handle zero', function () {
      assert.strictEqual(square(0), 0)
    })
  })

  describe('fix', function () {
    it('should round positive numbers towards zero', function () {
      assert.strictEqual(fix(3.7), 3)
      assert.strictEqual(fix(3.2), 3)
    })

    it('should round negative numbers towards zero', function () {
      assert.strictEqual(fix(-3.7), -3)
      assert.strictEqual(fix(-3.2), -3)
    })

    it('should handle integers', function () {
      assert.strictEqual(fix(5), 5)
      assert.strictEqual(fix(-5), -5)
    })
  })

  describe('fixDecimals', function () {
    it('should round to specified decimals towards zero', function () {
      assert(approxEqual(fixDecimals(3.789, 2), 3.78))
      assert(approxEqual(fixDecimals(-3.789, 2), -3.78))
    })

    it('should handle zero decimals', function () {
      assert.strictEqual(fixDecimals(3.7, 0), 3)
    })
  })

  describe('ceil', function () {
    it('should round up positive numbers', function () {
      assert.strictEqual(ceil(3.1), 4)
      assert.strictEqual(ceil(3.9), 4)
    })

    it('should round up negative numbers', function () {
      assert.strictEqual(ceil(-3.1), -3)
      assert.strictEqual(ceil(-3.9), -3)
    })

    it('should handle integers', function () {
      assert.strictEqual(ceil(5), 5)
    })
  })

  describe('ceilDecimals', function () {
    it('should ceil to specified decimals', function () {
      assert(approxEqual(ceilDecimals(3.141, 2), 3.15))
      assert(approxEqual(ceilDecimals(-3.149, 2), -3.14))
    })
  })

  describe('floor', function () {
    it('should round down positive numbers', function () {
      assert.strictEqual(floor(3.9), 3)
      assert.strictEqual(floor(3.1), 3)
    })

    it('should round down negative numbers', function () {
      assert.strictEqual(floor(-3.1), -4)
      assert.strictEqual(floor(-3.9), -4)
    })

    it('should handle integers', function () {
      assert.strictEqual(floor(5), 5)
    })
  })

  describe('floorDecimals', function () {
    it('should floor to specified decimals', function () {
      assert(approxEqual(floorDecimals(3.149, 2), 3.14))
      assert(approxEqual(floorDecimals(-3.141, 2), -3.15))
    })
  })

  describe('round', function () {
    it('should round to nearest integer', function () {
      assert.strictEqual(round(3.4), 3)
      assert.strictEqual(round(3.5), 4)
      assert.strictEqual(round(3.6), 4)
    })

    it('should handle negative numbers', function () {
      assert.strictEqual(round(-3.4), -3)
      assert.strictEqual(round(-3.5), -3) // Math.round rounds .5 towards +infinity
      assert.strictEqual(round(-3.6), -4)
    })
  })

  describe('roundDecimals', function () {
    it('should round to specified decimals', function () {
      assert(approxEqual(roundDecimals(3.145, 2), 3.15))
      assert(approxEqual(roundDecimals(3.144, 2), 3.14))
    })
  })

  describe('abs', function () {
    it('should return absolute value of positive', function () {
      assert.strictEqual(abs(5), 5)
    })

    it('should return absolute value of negative', function () {
      assert.strictEqual(abs(-5), 5)
    })

    it('should handle zero', function () {
      assert.strictEqual(abs(0), 0)
    })
  })

  describe('sign', function () {
    it('should return 1 for positive', function () {
      assert.strictEqual(sign(5), 1)
      assert.strictEqual(sign(0.001), 1)
    })

    it('should return -1 for negative', function () {
      assert.strictEqual(sign(-5), -1)
      assert.strictEqual(sign(-0.001), -1)
    })

    it('should return 0 for zero', function () {
      assert.strictEqual(sign(0), 0)
    })
  })

  describe('add', function () {
    it('should add two numbers', function () {
      assert.strictEqual(add(2, 3), 5)
      assert.strictEqual(add(-2, 3), 1)
      assert.strictEqual(add(-2, -3), -5)
    })

    it('should handle decimals', function () {
      assert(approxEqual(add(0.1, 0.2), 0.3))
    })
  })

  describe('subtract', function () {
    it('should subtract two numbers', function () {
      assert.strictEqual(subtract(5, 3), 2)
      assert.strictEqual(subtract(3, 5), -2)
      assert.strictEqual(subtract(-3, -5), 2)
    })
  })

  describe('multiply', function () {
    it('should multiply two numbers', function () {
      assert.strictEqual(multiply(3, 4), 12)
      assert.strictEqual(multiply(-3, 4), -12)
      assert.strictEqual(multiply(-3, -4), 12)
    })

    it('should handle zero', function () {
      assert.strictEqual(multiply(5, 0), 0)
    })
  })

  describe('divide', function () {
    it('should divide two numbers', function () {
      assert.strictEqual(divide(12, 4), 3)
      assert.strictEqual(divide(-12, 4), -3)
    })

    it('should handle division resulting in decimal', function () {
      assert.strictEqual(divide(1, 2), 0.5)
    })

    it('should return Infinity when dividing by zero', function () {
      assert.strictEqual(divide(5, 0), Infinity)
      assert.strictEqual(divide(-5, 0), -Infinity)
    })
  })

  describe('addInt', function () {
    it('should add two integers', function () {
      assert.strictEqual(addInt(2, 3), 5)
      assert.strictEqual(addInt(-2, 3), 1)
    })
  })

  describe('subtractInt', function () {
    it('should subtract two integers', function () {
      assert.strictEqual(subtractInt(5, 3), 2)
      assert.strictEqual(subtractInt(3, 5), -2)
    })
  })

  describe('multiplyInt', function () {
    it('should multiply two integers', function () {
      assert.strictEqual(multiplyInt(3, 4), 12)
      assert.strictEqual(multiplyInt(-3, 4), -12)
    })
  })

  describe('divideInt', function () {
    it('should divide two integers', function () {
      assert.strictEqual(divideInt(12, 4), 3)
      // Note: In JS runtime, this is regular division not integer division
      assert(Math.abs(divideInt(10, 3) - 10/3) < 0.0001)
    })
  })

  describe('mathematical properties', function () {
    it('cube(cbrt(x)) should equal x', function () {
      assert(approxEqual(cube(cbrt(8)), 8))
      assert(approxEqual(cube(cbrt(27)), 27))
    })

    it('cbrt(cube(x)) should equal x', function () {
      assert(approxEqual(cbrt(cube(2)), 2))
      assert(approxEqual(cbrt(cube(-3)), -3))
    })

    it('square(sqrt(x)) should equal x for positive x', function () {
      assert(approxEqual(square(Math.sqrt(4)), 4))
      assert(approxEqual(square(Math.sqrt(9)), 9))
    })

    it('add and subtract should be inverses', function () {
      const x = 10
      const y = 3
      assert.strictEqual(subtract(add(x, y), y), x)
    })

    it('multiply and divide should be inverses', function () {
      const x = 10
      const y = 4
      assert.strictEqual(divide(multiply(x, y), y), x)
    })
  })
})
