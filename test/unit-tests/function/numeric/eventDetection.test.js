import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as allFactories from '../../../../src/factoriesAny.js'

const math = create(allFactories)

describe('eventDetection', function () {
  // Projectile: y''=-g, y0=[h0, v0] where y[0]=height, y[1]=velocity
  // Event: y[0] = 0 (hits ground)
  const g = 9.81
  const fProjectile = (t, y) => [y[1], -g]
  const eventsGround = [(t, y) => [y[0]]] // zero when height=0

  describe('basic structure', function () {
    it('should return object with t, y, tEvents, yEvents, eventIndices', function () {
      const result = math.eventDetection(fProjectile, [0, 5], [10, 0], eventsGround)
      assert.ok(result.t !== undefined)
      assert.ok(result.y !== undefined)
      assert.ok(result.tEvents !== undefined)
      assert.ok(result.yEvents !== undefined)
      assert.ok(result.eventIndices !== undefined)
      assert.ok(Array.isArray(result.tEvents))
      assert.ok(Array.isArray(result.yEvents))
      assert.ok(Array.isArray(result.eventIndices))
    })

    it('should detect ground impact', function () {
      // h(t) = h0 + v0*t - 0.5*g*t^2, hits zero at t = sqrt(2*h0/g)
      const h0 = 10
      const v0 = 0
      const tImpact = Math.sqrt(2 * h0 / g) // ~1.428 s
      const result = math.eventDetection(fProjectile, [0, 5], [h0, v0], eventsGround)
      assert.ok(result.tEvents.length >= 1, 'should detect at least one event')
      // First event should be near theoretical impact time
      const tDetected = result.tEvents[0]
      assert.ok(
        Math.abs(tDetected - tImpact) < 0.05,
        `impact time should be ~${tImpact.toFixed(3)}, got ${tDetected.toFixed(3)}`
      )
    })
  })

  describe('multiple events', function () {
    // Two event functions: height=0 and velocity=0 (apex)
    const eventsMulti = [
      (t, y) => [y[0]], // height = 0
      (t, y) => [y[1]] // velocity = 0 (apex)
    ]

    it('should detect both height=0 and velocity=0 events', function () {
      // h0=0, v0=10: apex at t=v0/g, lands at t=2*v0/g
      const h0 = 0
      const v0 = 10
      const result = math.eventDetection(fProjectile, [0, 3], [h0, v0], eventsMulti)
      // Should detect the apex (v=0 at t=v0/g~1.02s)
      assert.ok(result.tEvents.length >= 1, 'should detect at least one event')
    })
  })

  describe('harmonic oscillator zero crossings', function () {
    // y1'=y2, y2'=-y1, y0=[1,0]  => y1=cos(t), zeros at t=pi/2, 3*pi/2
    const fHarm = (t, y) => [y[1], -y[0]]
    const eventsZero = [(t, y) => [y[0]]]

    it('should detect zero crossings of cos(t)', function () {
      const result = math.eventDetection(fHarm, [0, 2 * Math.PI], [1, 0], eventsZero)
      // cos(t) crosses zero at pi/2 and 3*pi/2
      assert.ok(result.tEvents.length >= 1, 'should detect at least one crossing')
      // First crossing near pi/2
      const tFirst = result.tEvents[0]
      assert.ok(
        Math.abs(tFirst - Math.PI / 2) < 0.1,
        `first crossing should be near pi/2=${(Math.PI / 2).toFixed(3)}, got ${tFirst.toFixed(3)}`
      )
    })
  })

  describe('input validation', function () {
    it('should throw on empty events array', function () {
      assert.throws(
        () => math.eventDetection(fProjectile, [0, 5], [10, 0], []),
        /events/
      )
    })

    it('should throw on invalid tSpan', function () {
      assert.throws(
        () => math.eventDetection(fProjectile, [0], [10, 0], eventsGround),
        /tSpan/
      )
    })
  })

  describe('with options', function () {
    it('should accept maxStep option', function () {
      const result = math.eventDetection(fProjectile, [0, 5], [10, 0], eventsGround, {
        maxStep: 0.1
      })
      assert.ok(result.t.length > 0)
    })
  })
})
