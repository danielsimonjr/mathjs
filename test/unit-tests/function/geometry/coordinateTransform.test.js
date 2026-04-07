import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createCoordinateTransform } from '../../../../src/function/geometry/coordinateTransform.js'

const math = create({ ...all, createCoordinateTransform })

const EPSILON = 1e-10

function approxEqual (a, b) {
  return Math.abs(a - b) < EPSILON
}

function approxEqualArray (a, b) {
  return a.length === b.length && a.every((v, i) => approxEqual(v, b[i]))
}

describe('coordinateTransform', function () {
  describe('cartesian <-> polar (2D)', function () {
    it('should convert [1, 0] from cartesian to polar', function () {
      const result = math.coordinateTransform([1, 0], 'cartesian', 'polar')
      assert.ok(approxEqualArray(result, [1, 0]))
    })

    it('should convert [0, 1] from cartesian to polar', function () {
      const result = math.coordinateTransform([0, 1], 'cartesian', 'polar')
      assert.ok(approxEqualArray(result, [1, Math.PI / 2]))
    })

    it('should convert [-1, 0] from cartesian to polar', function () {
      const result = math.coordinateTransform([-1, 0], 'cartesian', 'polar')
      assert.ok(approxEqualArray(result, [1, Math.PI]))
    })

    it('should convert [0, 0] from cartesian to polar', function () {
      const result = math.coordinateTransform([0, 0], 'cartesian', 'polar')
      assert.ok(approxEqual(result[0], 0))
    })

    it('should convert from polar to cartesian', function () {
      const result = math.coordinateTransform([1, 0], 'polar', 'cartesian')
      assert.ok(approxEqualArray(result, [1, 0]))
    })

    it('should convert [1, pi/2] from polar to cartesian', function () {
      const result = math.coordinateTransform([1, Math.PI / 2], 'polar', 'cartesian')
      assert.ok(approxEqualArray(result, [0, 1]))
    })

    it('should round-trip cartesian -> polar -> cartesian', function () {
      const original = [3, 4]
      const polar = math.coordinateTransform(original, 'cartesian', 'polar')
      const back = math.coordinateTransform(polar, 'polar', 'cartesian')
      assert.ok(approxEqualArray(back, original))
    })
  })

  describe('cartesian <-> spherical (3D)', function () {
    it('should convert [1, 0, 0] from cartesian to spherical', function () {
      const result = math.coordinateTransform([1, 0, 0], 'cartesian', 'spherical')
      assert.ok(approxEqual(result[0], 1))
      assert.ok(approxEqual(result[1], Math.PI / 2)) // theta = inclination from z-axis
      assert.ok(approxEqual(result[2], 0)) // phi = azimuth
    })

    it('should convert [0, 0, 1] from cartesian to spherical', function () {
      const result = math.coordinateTransform([0, 0, 1], 'cartesian', 'spherical')
      assert.ok(approxEqual(result[0], 1))
      assert.ok(approxEqual(result[1], 0)) // theta = 0 (pointing along z-axis)
    })

    it('should round-trip cartesian -> spherical -> cartesian', function () {
      const original = [1, 2, 3]
      const spherical = math.coordinateTransform(original, 'cartesian', 'spherical')
      const back = math.coordinateTransform(spherical, 'spherical', 'cartesian')
      assert.ok(approxEqualArray(back, original))
    })
  })

  describe('cartesian <-> cylindrical (3D)', function () {
    it('should convert [1, 0, 5] from cartesian to cylindrical', function () {
      const result = math.coordinateTransform([1, 0, 5], 'cartesian', 'cylindrical')
      assert.ok(approxEqualArray(result, [1, 0, 5]))
    })

    it('should convert [0, 1, 3] from cartesian to cylindrical', function () {
      const result = math.coordinateTransform([0, 1, 3], 'cartesian', 'cylindrical')
      assert.ok(approxEqual(result[0], 1))
      assert.ok(approxEqual(result[1], Math.PI / 2))
      assert.ok(approxEqual(result[2], 3))
    })

    it('should round-trip cartesian -> cylindrical -> cartesian', function () {
      const original = [3, 4, 5]
      const cylindrical = math.coordinateTransform(original, 'cartesian', 'cylindrical')
      const back = math.coordinateTransform(cylindrical, 'cylindrical', 'cartesian')
      assert.ok(approxEqualArray(back, original))
    })
  })

  describe('cylindrical <-> spherical', function () {
    it('should convert cylindrical to spherical', function () {
      const cartesian = [1, 0, 0]
      const expectedSpherical = math.coordinateTransform(cartesian, 'cartesian', 'spherical')
      const cylindrical = math.coordinateTransform(cartesian, 'cartesian', 'cylindrical')
      const result = math.coordinateTransform(cylindrical, 'cylindrical', 'spherical')
      assert.ok(approxEqual(result[0], expectedSpherical[0]))
      assert.ok(approxEqual(result[1], expectedSpherical[1]))
    })

    it('should round-trip cylindrical -> spherical -> cylindrical', function () {
      const original = [3, Math.PI / 4, 5]
      const spherical = math.coordinateTransform(original, 'cylindrical', 'spherical')
      const back = math.coordinateTransform(spherical, 'spherical', 'cylindrical')
      assert.ok(approxEqualArray(back, original))
    })
  })

  describe('same coordinate system', function () {
    it('should return a copy when from === to', function () {
      const point = [1, 2, 3]
      const result = math.coordinateTransform(point, 'cartesian', 'cartesian')
      assert.deepStrictEqual(result, point)
    })
  })

  describe('error handling', function () {
    it('should throw an error for unsupported coordinate system', function () {
      assert.throws(function () { math.coordinateTransform([1, 0], 'cartesian', 'barycentric') }, TypeError)
    })

    it('should throw an error for wrong dimension in cartesian->polar', function () {
      assert.throws(function () { math.coordinateTransform([1, 2, 3], 'cartesian', 'polar') }, TypeError)
    })

    it('should throw an error for wrong dimension in cartesian->spherical', function () {
      assert.throws(function () { math.coordinateTransform([1, 2], 'cartesian', 'spherical') }, TypeError)
    })

    it('should throw an error for non-array input', function () {
      assert.throws(function () { math.coordinateTransform(42, 'cartesian', 'polar') }, TypeError)
    })
  })
})
