import { factory } from '../../utils/factory.js'

const name = 'coordinateTransform'
const dependencies = ['typed']

export const createCoordinateTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Transforms a point from one coordinate system to another.
   *
   * Supported coordinate systems:
   *   - 'cartesian': [x, y] for 2D, [x, y, z] for 3D
   *   - 'polar': [r, theta] where r >= 0 and theta is in radians
   *   - 'cylindrical': [rho, phi, z] where rho >= 0 and phi is in radians
   *   - 'spherical': [r, theta, phi] using ISO convention where theta is the
   *     polar angle (inclination from z-axis) and phi is the azimuthal angle
   *
   * Syntax:
   *
   *    math.coordinateTransform(point, from, to)
   *
   * Examples:
   *
   *    math.coordinateTransform([1, 0], 'cartesian', 'polar')
   *    // Returns [1, 0]
   *
   *    math.coordinateTransform([0, 1], 'cartesian', 'polar')
   *    // Returns [1, 1.5707963267948966]
   *
   *    math.coordinateTransform([1, 0], 'polar', 'cartesian')
   *    // Returns [1, 0]
   *
   *    math.coordinateTransform([1, 2, 3], 'cartesian', 'spherical')
   *    // Returns [r, theta, phi]
   *
   * @param {Array}  point   The point to transform
   * @param {string} from    Source coordinate system
   * @param {string} to      Target coordinate system
   * @return {Array}         The transformed point
   */
  return typed(name, {
    'Array, string, string': function (point, from, to) {
      if (from === to) {
        return point.slice()
      }

      const key = from + '->' + to

      switch (key) {
        // 2D: cartesian <-> polar
        case 'cartesian->polar': {
          if (point.length !== 2) {
            throw new TypeError('cartesian->polar requires a 2D point [x, y]')
          }
          const x = point[0]
          const y = point[1]
          const r = Math.sqrt(x * x + y * y)
          const theta = Math.atan2(y, x)
          return [r, theta]
        }

        case 'polar->cartesian': {
          if (point.length !== 2) {
            throw new TypeError('polar->cartesian requires a 2D point [r, theta]')
          }
          const r = point[0]
          const theta = point[1]
          return [r * Math.cos(theta), r * Math.sin(theta)]
        }

        // 3D: cartesian <-> spherical (ISO: r, theta=inclination, phi=azimuth)
        case 'cartesian->spherical': {
          if (point.length !== 3) {
            throw new TypeError('cartesian->spherical requires a 3D point [x, y, z]')
          }
          const x = point[0]
          const y = point[1]
          const z = point[2]
          const r = Math.sqrt(x * x + y * y + z * z)
          const theta = r === 0 ? 0 : Math.acos(z / r)
          const phi = Math.atan2(y, x)
          return [r, theta, phi]
        }

        case 'spherical->cartesian': {
          if (point.length !== 3) {
            throw new TypeError('spherical->cartesian requires a 3D point [r, theta, phi]')
          }
          const r = point[0]
          const theta = point[1]
          const phi = point[2]
          return [
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(theta)
          ]
        }

        // 3D: cartesian <-> cylindrical
        case 'cartesian->cylindrical': {
          if (point.length !== 3) {
            throw new TypeError('cartesian->cylindrical requires a 3D point [x, y, z]')
          }
          const x = point[0]
          const y = point[1]
          const z = point[2]
          const rho = Math.sqrt(x * x + y * y)
          const phi = Math.atan2(y, x)
          return [rho, phi, z]
        }

        case 'cylindrical->cartesian': {
          if (point.length !== 3) {
            throw new TypeError('cylindrical->cartesian requires a 3D point [rho, phi, z]')
          }
          const rho = point[0]
          const phi = point[1]
          const z = point[2]
          return [rho * Math.cos(phi), rho * Math.sin(phi), z]
        }

        // cylindrical <-> spherical (via cartesian)
        case 'cylindrical->spherical': {
          if (point.length !== 3) {
            throw new TypeError('cylindrical->spherical requires a 3D point [rho, phi, z]')
          }
          const cartesian = [point[0] * Math.cos(point[1]), point[0] * Math.sin(point[1]), point[2]]
          const r = Math.sqrt(cartesian[0] * cartesian[0] + cartesian[1] * cartesian[1] + cartesian[2] * cartesian[2])
          const theta = r === 0 ? 0 : Math.acos(cartesian[2] / r)
          return [r, theta, point[1]]
        }

        case 'spherical->cylindrical': {
          if (point.length !== 3) {
            throw new TypeError('spherical->cylindrical requires a 3D point [r, theta, phi]')
          }
          const r = point[0]
          const theta = point[1]
          const phi = point[2]
          const rho = r * Math.sin(theta)
          const z = r * Math.cos(theta)
          return [rho, phi, z]
        }

        default:
          throw new TypeError('Unsupported coordinate system conversion: ' + from + ' to ' + to + '. Supported systems: cartesian, polar, spherical, cylindrical')
      }
    }
  })
})
