import { factory } from '../../utils/factory.ts'
import type { MathNumericType } from '../../types.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for intersect
interface Matrix {
  valueOf(): MathNumericType[] | MathNumericType[][]
}

interface IntersectDependencies {
  typed: TypedFunction
  config: ConfigOptions
  abs: (x: MathNumericType) => MathNumericType
  add: (
    a: MathNumericType | MathNumericType[],
    b: MathNumericType | MathNumericType[]
  ) => MathNumericType | MathNumericType[]
  addScalar: (a: MathNumericType, b: MathNumericType) => MathNumericType
  matrix: (arr: MathNumericType[]) => Matrix
  multiply: (
    a: MathNumericType | MathNumericType[],
    b: MathNumericType | MathNumericType[]
  ) => MathNumericType | MathNumericType[]
  multiplyScalar: (a: MathNumericType, b: MathNumericType) => MathNumericType
  divideScalar: (a: MathNumericType, b: MathNumericType) => MathNumericType
  subtract: (
    a: MathNumericType | MathNumericType[],
    b: MathNumericType | MathNumericType[]
  ) => MathNumericType | MathNumericType[]
  smaller: (a: MathNumericType, b: number) => boolean
  equalScalar: (a: MathNumericType, b: MathNumericType) => boolean
  flatten: (arr: MathNumericType[][]) => MathNumericType[]
  isZero: (x: MathNumericType) => boolean
  isNumeric: (x: unknown) => boolean
}

const name = 'intersect'
const dependencies = [
  'typed',
  'config',
  'abs',
  'add',
  'addScalar',
  'matrix',
  'multiply',
  'multiplyScalar',
  'divideScalar',
  'subtract',
  'smaller',
  'equalScalar',
  'flatten',
  'isZero',
  'isNumeric'
]

export const createIntersect = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    abs,
    add,
    addScalar,
    matrix,
    multiply,
    multiplyScalar,
    divideScalar,
    subtract,
    smaller,
    equalScalar,
    flatten,
    isZero,
    isNumeric
  }: IntersectDependencies) => {
    /**
     * Calculates the point of intersection of two lines in two or three dimensions
     * and of a line and a plane in three dimensions. The inputs are in the form of
     * arrays or 1 dimensional matrices. The line intersection functions return null
     * if the lines do not meet.
     *
     * Note: Fill the plane coefficients as `x + y + z = c` and not as `x + y + z + c = 0`.
     *
     * Syntax:
     *
     *    math.intersect(endPoint1Line1, endPoint2Line1, endPoint1Line2, endPoint2Line2)
     *    math.intersect(endPoint1, endPoint2, planeCoefficients)
     *
     * Examples:
     *
     *    math.intersect([0, 0], [10, 10], [10, 0], [0, 10])              // Returns [5, 5]
     *    math.intersect([0, 0, 0], [10, 10, 0], [10, 0, 0], [0, 10, 0])  // Returns [5, 5, 0]
     *    math.intersect([1, 0, 1],  [4, -2, 2], [1, 1, 1, 6])            // Returns [7, -4, 3]
     *
     * @param  {Array | Matrix} w   Co-ordinates of first end-point of first line
     * @param  {Array | Matrix} x   Co-ordinates of second end-point of first line
     * @param  {Array | Matrix} y   Co-ordinates of first end-point of second line
     *                              OR Co-efficients of the plane's equation
     * @param  {Array | Matrix} z   Co-ordinates of second end-point of second line
     *                              OR undefined if the calculation is for line and plane
     * @return {Array}              Returns the point of intersection of lines/lines-planes
     */
    return typed('intersect', {
      'Array, Array, Array': _AAA,

      'Array, Array, Array, Array': _AAAA,

      'Matrix, Matrix, Matrix': function (
        x: Matrix,
        y: Matrix,
        plane: Matrix
      ): Matrix | null {
        const arr = _AAA(
          x.valueOf() as MathNumericType[],
          y.valueOf() as MathNumericType[],
          plane.valueOf() as MathNumericType[]
        )
        return arr === null ? null : matrix(arr)
      },

      'Matrix, Matrix, Matrix, Matrix': function (
        w: Matrix,
        x: Matrix,
        y: Matrix,
        z: Matrix
      ): Matrix | null {
        // TODO: output matrix type should match input matrix type
        const arr = _AAAA(
          w.valueOf() as MathNumericType[],
          x.valueOf() as MathNumericType[],
          y.valueOf() as MathNumericType[],
          z.valueOf() as MathNumericType[]
        )
        return arr === null ? null : matrix(arr)
      }
    })

    function _AAA(
      x: MathNumericType[],
      y: MathNumericType[],
      plane: MathNumericType[]
    ): MathNumericType[] | null {
      x = _coerceArr(x)
      y = _coerceArr(y)
      plane = _coerceArr(plane)

      if (!_3d(x)) {
        throw new TypeError(
          'Array with 3 numbers or BigNumbers expected for first argument'
        )
      }
      if (!_3d(y)) {
        throw new TypeError(
          'Array with 3 numbers or BigNumbers expected for second argument'
        )
      }
      if (!_4d(plane)) {
        throw new TypeError('Array with 4 numbers expected as third argument')
      }

      return _intersectLinePlane(
        x[0],
        x[1],
        x[2],
        y[0],
        y[1],
        y[2],
        plane[0],
        plane[1],
        plane[2],
        plane[3]
      )
    }

    function _AAAA(
      w: MathNumericType[],
      x: MathNumericType[],
      y: MathNumericType[],
      z: MathNumericType[]
    ): MathNumericType[] | null {
      w = _coerceArr(w)
      x = _coerceArr(x)
      y = _coerceArr(y)
      z = _coerceArr(z)

      if (w.length === 2) {
        if (!_2d(w)) {
          throw new TypeError(
            'Array with 2 numbers or BigNumbers expected for first argument'
          )
        }
        if (!_2d(x)) {
          throw new TypeError(
            'Array with 2 numbers or BigNumbers expected for second argument'
          )
        }
        if (!_2d(y)) {
          throw new TypeError(
            'Array with 2 numbers or BigNumbers expected for third argument'
          )
        }
        if (!_2d(z)) {
          throw new TypeError(
            'Array with 2 numbers or BigNumbers expected for fourth argument'
          )
        }

        return _intersect2d(w, x, y, z)
      } else if (w.length === 3) {
        if (!_3d(w)) {
          throw new TypeError(
            'Array with 3 numbers or BigNumbers expected for first argument'
          )
        }
        if (!_3d(x)) {
          throw new TypeError(
            'Array with 3 numbers or BigNumbers expected for second argument'
          )
        }
        if (!_3d(y)) {
          throw new TypeError(
            'Array with 3 numbers or BigNumbers expected for third argument'
          )
        }
        if (!_3d(z)) {
          throw new TypeError(
            'Array with 3 numbers or BigNumbers expected for fourth argument'
          )
        }

        return _intersect3d(
          w[0],
          w[1],
          w[2],
          x[0],
          x[1],
          x[2],
          y[0],
          y[1],
          y[2],
          z[0],
          z[1],
          z[2]
        )
      } else {
        throw new TypeError(
          'Arrays with two or thee dimensional points expected'
        )
      }
    }

    /** Coerce row and column 2-dim arrays to 1-dim array */
    function _coerceArr(
      arr: MathNumericType[] | MathNumericType[][]
    ): MathNumericType[] {
      // row matrix
      if (arr.length === 1 && Array.isArray(arr[0]))
        return arr[0] as MathNumericType[]

      // column matrix
      if (arr.length > 1 && Array.isArray(arr[0])) {
        if (
          (arr as MathNumericType[][]).every(
            (el) => Array.isArray(el) && el.length === 1
          )
        )
          return flatten(arr as MathNumericType[][])
      }

      return arr as MathNumericType[]
    }

    function _2d(x: MathNumericType[]): boolean {
      return x.length === 2 && isNumeric(x[0]) && isNumeric(x[1])
    }

    function _3d(x: MathNumericType[]): boolean {
      return (
        x.length === 3 && isNumeric(x[0]) && isNumeric(x[1]) && isNumeric(x[2])
      )
    }

    function _4d(x: MathNumericType[]): boolean {
      return (
        x.length === 4 &&
        isNumeric(x[0]) &&
        isNumeric(x[1]) &&
        isNumeric(x[2]) &&
        isNumeric(x[3])
      )
    }

    function _intersect2d(
      p1a: MathNumericType[],
      p1b: MathNumericType[],
      p2a: MathNumericType[],
      p2b: MathNumericType[]
    ): MathNumericType[] | null {
      const o1 = p1a
      const o2 = p2a
      const d1 = subtract(o1, p1b) as MathNumericType[]
      const d2 = subtract(o2, p2b) as MathNumericType[]
      const det = subtract(
        multiplyScalar(d1[0], d2[1]),
        multiplyScalar(d2[0], d1[1])
      ) as MathNumericType
      if (isZero(det)) return null
      if (smaller(abs(det), config.relTol)) {
        return null
      }
      const d20o11 = multiplyScalar(d2[0], o1[1])
      const d21o10 = multiplyScalar(d2[1], o1[0])
      const d20o21 = multiplyScalar(d2[0], o2[1])
      const d21o20 = multiplyScalar(d2[1], o2[0])
      const t = divideScalar(
        addScalar(
          subtract(
            subtract(d20o11, d21o10) as MathNumericType,
            d20o21
          ) as MathNumericType,
          d21o20
        ),
        det
      )
      return add(multiply(d1, t), o1) as MathNumericType[]
    }

    function _intersect3dHelper(
      a: MathNumericType,
      b: MathNumericType,
      c: MathNumericType,
      d: MathNumericType,
      e: MathNumericType,
      f: MathNumericType,
      g: MathNumericType,
      h: MathNumericType,
      i: MathNumericType,
      j: MathNumericType,
      k: MathNumericType,
      l: MathNumericType
    ): MathNumericType {
      // (a - b)*(c - d) + (e - f)*(g - h) + (i - j)*(k - l)
      const add1 = multiplyScalar(
        subtract(a, b) as MathNumericType,
        subtract(c, d) as MathNumericType
      )
      const add2 = multiplyScalar(
        subtract(e, f) as MathNumericType,
        subtract(g, h) as MathNumericType
      )
      const add3 = multiplyScalar(
        subtract(i, j) as MathNumericType,
        subtract(k, l) as MathNumericType
      )
      return addScalar(addScalar(add1, add2), add3)
    }

    function _intersect3d(
      x1: MathNumericType,
      y1: MathNumericType,
      z1: MathNumericType,
      x2: MathNumericType,
      y2: MathNumericType,
      z2: MathNumericType,
      x3: MathNumericType,
      y3: MathNumericType,
      z3: MathNumericType,
      x4: MathNumericType,
      y4: MathNumericType,
      z4: MathNumericType
    ): MathNumericType[] | null {
      const d1343 = _intersect3dHelper(
        x1,
        x3,
        x4,
        x3,
        y1,
        y3,
        y4,
        y3,
        z1,
        z3,
        z4,
        z3
      )
      const d4321 = _intersect3dHelper(
        x4,
        x3,
        x2,
        x1,
        y4,
        y3,
        y2,
        y1,
        z4,
        z3,
        z2,
        z1
      )
      const d1321 = _intersect3dHelper(
        x1,
        x3,
        x2,
        x1,
        y1,
        y3,
        y2,
        y1,
        z1,
        z3,
        z2,
        z1
      )
      const d4343 = _intersect3dHelper(
        x4,
        x3,
        x4,
        x3,
        y4,
        y3,
        y4,
        y3,
        z4,
        z3,
        z4,
        z3
      )
      const d2121 = _intersect3dHelper(
        x2,
        x1,
        x2,
        x1,
        y2,
        y1,
        y2,
        y1,
        z2,
        z1,
        z2,
        z1
      )
      const numerator = subtract(
        multiplyScalar(d1343, d4321),
        multiplyScalar(d1321, d4343)
      ) as MathNumericType
      const denominator = subtract(
        multiplyScalar(d2121, d4343),
        multiplyScalar(d4321, d4321)
      ) as MathNumericType
      if (isZero(denominator)) return null
      const ta = divideScalar(numerator, denominator)
      const tb = divideScalar(
        addScalar(d1343, multiplyScalar(ta, d4321)),
        d4343
      )

      const pax = addScalar(
        x1,
        multiplyScalar(ta, subtract(x2, x1) as MathNumericType)
      )
      const pay = addScalar(
        y1,
        multiplyScalar(ta, subtract(y2, y1) as MathNumericType)
      )
      const paz = addScalar(
        z1,
        multiplyScalar(ta, subtract(z2, z1) as MathNumericType)
      )
      const pbx = addScalar(
        x3,
        multiplyScalar(tb, subtract(x4, x3) as MathNumericType)
      )
      const pby = addScalar(
        y3,
        multiplyScalar(tb, subtract(y4, y3) as MathNumericType)
      )
      const pbz = addScalar(
        z3,
        multiplyScalar(tb, subtract(z4, z3) as MathNumericType)
      )
      if (
        equalScalar(pax, pbx) &&
        equalScalar(pay, pby) &&
        equalScalar(paz, pbz)
      ) {
        return [pax, pay, paz]
      } else {
        return null
      }
    }

    function _intersectLinePlane(
      x1: MathNumericType,
      y1: MathNumericType,
      z1: MathNumericType,
      x2: MathNumericType,
      y2: MathNumericType,
      z2: MathNumericType,
      x: MathNumericType,
      y: MathNumericType,
      z: MathNumericType,
      c: MathNumericType
    ): MathNumericType[] {
      const x1x = multiplyScalar(x1, x)
      const x2x = multiplyScalar(x2, x)
      const y1y = multiplyScalar(y1, y)
      const y2y = multiplyScalar(y2, y)
      const z1z = multiplyScalar(z1, z)
      const z2z = multiplyScalar(z2, z)

      const numerator = subtract(
        subtract(subtract(c, x1x) as MathNumericType, y1y) as MathNumericType,
        z1z
      ) as MathNumericType
      const denominator = subtract(
        subtract(
          subtract(addScalar(addScalar(x2x, y2y), z2z), x1x) as MathNumericType,
          y1y
        ) as MathNumericType,
        z1z
      ) as MathNumericType

      const t = divideScalar(numerator, denominator)

      const px = addScalar(
        x1,
        multiplyScalar(t, subtract(x2, x1) as MathNumericType)
      )
      const py = addScalar(
        y1,
        multiplyScalar(t, subtract(y2, y1) as MathNumericType)
      )
      const pz = addScalar(
        z1,
        multiplyScalar(t, subtract(z2, z1) as MathNumericType)
      )
      return [px, py, pz]
      // TODO: Add cases when line is parallel to the plane:
      //       (a) no intersection,
      //       (b) line contained in plane
    }
  }
)
