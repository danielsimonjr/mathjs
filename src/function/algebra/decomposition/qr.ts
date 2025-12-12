import { factory } from '../../../utils/factory.ts'

// Type definitions
type NestedArray<T = any> = T | NestedArray<T>[]
type MatrixData = NestedArray<any>

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
}

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): DenseMatrix | SparseMatrix
}

interface DenseMatrix {
  type: 'DenseMatrix'
  isDenseMatrix: true
  _data: any[][] | any[]
  _size: number[]
  _datatype?: string
  storage(): 'dense'
  size(): number[]
  valueOf(): any[][] | any[]
  clone(): DenseMatrix
}

interface SparseMatrix {
  type: 'SparseMatrix'
  isSparseMatrix: true
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  _data?: any
  storage(): 'sparse'
  size(): number[]
  valueOf(): any[][]
}

interface ZerosFunction {
  (size: number[], format?: string): DenseMatrix
}

interface IdentityFunction {
  (size: number[], format?: string): DenseMatrix
}

interface ComplexFunction {
  (re: number, im?: number): any
}

interface QRResult {
  Q: DenseMatrix | SparseMatrix
  R: DenseMatrix | SparseMatrix
  toString(): string
}

interface QRArrayResult {
  Q: any[][]
  R: any[][]
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  zeros: ZerosFunction
  identity: IdentityFunction
  isZero: TypedFunction<boolean>
  equal: TypedFunction<boolean>
  sign: TypedFunction
  sqrt: TypedFunction
  conj: TypedFunction
  unaryMinus: TypedFunction
  addScalar: TypedFunction
  divideScalar: TypedFunction
  multiplyScalar: TypedFunction
  subtractScalar: TypedFunction
  complex: ComplexFunction
}

const name = 'qr'
const dependencies = [
  'typed',
  'matrix',
  'zeros',
  'identity',
  'isZero',
  'equal',
  'sign',
  'sqrt',
  'conj',
  'unaryMinus',
  'addScalar',
  'divideScalar',
  'multiplyScalar',
  'subtractScalar',
  'complex'
]

export const createQr = /* #__PURE__ */ factory(name, dependencies, (
  {
    typed,
    matrix,
    zeros,
    identity,
    isZero,
    equal,
    sign,
    sqrt,
    conj,
    unaryMinus,
    addScalar,
    divideScalar,
    multiplyScalar,
    subtractScalar,
    complex
  }: Dependencies
) => {
  /**
   * Calculate the Matrix QR decomposition. Matrix `A` is decomposed in
   * two matrices (`Q`, `R`) where `Q` is an
   * orthogonal matrix and `R` is an upper triangular matrix.
   *
   * Syntax:
   *
   *    math.qr(A)
   *
   * Example:
   *
   *    const m = [
   *      [1, -1,  4],
   *      [1,  4, -2],
   *      [1,  4,  2],
   *      [1,  -1, 0]
   *    ]
   *    const result = math.qr(m)
   *    // r = {
   *    //   Q: [
   *    //     [0.5, -0.5,   0.5],
   *    //     [0.5,  0.5,  -0.5],
   *    //     [0.5,  0.5,   0.5],
   *    //     [0.5, -0.5,  -0.5],
   *    //   ],
   *    //   R: [
   *    //     [2, 3,  2],
   *    //     [0, 5, -2],
   *    //     [0, 0,  4],
   *    //     [0, 0,  0]
   *    //   ]
   *    // }
   *
   * See also:
   *
   *    lup, lusolve
   *
   * @param {Matrix | Array} A    A two dimensional matrix or array
   * for which to get the QR decomposition.
   *
   * @return {{Q: Array | Matrix, R: Array | Matrix}} Q: the orthogonal
   * matrix and R: the upper triangular matrix
   */
  const qrTyped = typed(name, {

    DenseMatrix: function (m: DenseMatrix): QRResult {
      return _denseQR(m)
    },

    SparseMatrix: function (m: SparseMatrix): QRResult {
      return _sparseQR(m)
    },

    Array: function (a: any[][]): QRArrayResult {
      // create dense matrix from array
      const m = matrix(a) as DenseMatrix
      // lup, use matrix implementation
      const r = _denseQR(m)
      // result
      return {
        Q: r.Q.valueOf() as any[][],
        R: r.R.valueOf() as any[][]
      }
    }
  })

  // Attach _denseQRimpl to the typed function
  ;(qrTyped as any)._denseQRimpl = _denseQRimpl

  return qrTyped

  function _denseQRimpl (m: DenseMatrix): QRResult {
    // rows & columns (m x n)
    const rows = m._size[0] // m
    const cols = m._size[1] // n

    const Q = identity([rows], 'dense')
    const Qdata = Q._data as any[][]

    const R = m.clone()
    const Rdata = R._data as any[][]

    // vars
    let i: number, j: number, k: number

    const w = zeros([rows], '') as any

    for (k = 0; k < Math.min(cols, rows); ++k) {
      /*
       * **k-th Household matrix**
       *
       * The matrix I - 2*v*transpose(v)
       * x     = first column of A
       * x1    = first element of x
       * alpha = x1 / |x1| * |x|
       * e1    = tranpose([1, 0, 0, ...])
       * u     = x - alpha * e1
       * v     = u / |u|
       *
       * Household matrix = I - 2 * v * tranpose(v)
       *
       *  * Initially Q = I and R = A.
       *  * Household matrix is a reflection in a plane normal to v which
       *    will zero out all but the top right element in R.
       *  * Appplying reflection to both Q and R will not change product.
       *  * Repeat this process on the (1,1) minor to get R as an upper
       *    triangular matrix.
       *  * Reflections leave the magnitude of the columns of Q unchanged
       *    so Q remains othoganal.
       *
       */

      const pivot = Rdata[k][k]
      const sgn = unaryMinus(equal(pivot, 0) ? 1 : sign(pivot))
      const conjSgn = conj(sgn)

      let alphaSquared: any = 0

      for (i = k; i < rows; i++) {
        alphaSquared = addScalar(alphaSquared, multiplyScalar(Rdata[i][k], conj(Rdata[i][k])))
      }

      const alpha = multiplyScalar(sgn, sqrt(alphaSquared))

      if (!isZero(alpha)) {
        // first element in vector u
        const u1 = subtractScalar(pivot, alpha)

        // w = v * u1 / |u|    (only elements k to (rows-1) are used)
        w[k] = 1

        for (i = k + 1; i < rows; i++) {
          w[i] = divideScalar(Rdata[i][k], u1)
        }

        // tau = - conj(u1 / alpha)
        const tau = unaryMinus(conj(divideScalar(u1, alpha)))

        let s: any

        /*
         * tau and w have been choosen so that
         *
         * 2 * v * tranpose(v) = tau * w * tranpose(w)
         */

        /*
         * -- calculate R = R - tau * w * tranpose(w) * R --
         * Only do calculation with rows k to (rows-1)
         * Additionally columns 0 to (k-1) will not be changed by this
         *   multiplication so do not bother recalculating them
         */
        for (j = k; j < cols; j++) {
          s = 0.0

          // calculate jth element of [tranpose(w) * R]
          for (i = k; i < rows; i++) {
            s = addScalar(s, multiplyScalar(conj(w[i]), Rdata[i][j]))
          }

          // calculate the jth element of [tau * transpose(w) * R]
          s = multiplyScalar(s, tau)

          for (i = k; i < rows; i++) {
            Rdata[i][j] = multiplyScalar(
              subtractScalar(Rdata[i][j], multiplyScalar(w[i], s)),
              conjSgn
            )
          }
        }
        /*
         * -- calculate Q = Q - tau * Q * w * transpose(w) --
         * Q is a square matrix (rows x rows)
         * Only do calculation with columns k to (rows-1)
         * Additionally rows 0 to (k-1) will not be changed by this
         *   multiplication so do not bother recalculating them
         */
        for (i = 0; i < rows; i++) {
          s = 0.0

          // calculate ith element of [Q * w]
          for (j = k; j < rows; j++) {
            s = addScalar(s, multiplyScalar(Qdata[i][j], w[j]))
          }

          // calculate the ith element of [tau * Q * w]
          s = multiplyScalar(s, tau)

          for (j = k; j < rows; ++j) {
            Qdata[i][j] = divideScalar(
              subtractScalar(Qdata[i][j], multiplyScalar(s, conj(w[j]))),
              conjSgn
            )
          }
        }
      }
    }

    // return matrices
    return {
      Q,
      R,
      toString: function () {
        return 'Q: ' + this.Q.toString() + '\nR: ' + this.R.toString()
      }
    }
  }

  function _denseQR (m: DenseMatrix): QRResult {
    const ret = _denseQRimpl(m)
    const Rdata = ret.R._data as any[][]
    if ((m._data as any[][]).length > 0) {
      const zero = Rdata[0][0].type === 'Complex' ? complex(0) : 0

      for (let i = 0; i < Rdata.length; ++i) {
        for (let j = 0; j < i && j < (Rdata[0] || []).length; ++j) {
          Rdata[i][j] = zero
        }
      }
    }

    return ret
  }

  function _sparseQR (m: SparseMatrix): QRResult {
    throw new Error('qr not implemented for sparse matrices yet')
  }
})
