import { factory } from '../../../utils/factory.ts'
import { extend } from '../../../utils/object.ts'
import { createMatAlgo13xDD } from './matAlgo13xDD.ts'
import { createMatAlgo14xDs } from './matAlgo14xDs.ts'
import { broadcast } from './broadcast.ts'

// Type definitions
interface Matrix {
  _data?: any
  _size?: number[]
  _datatype?: string
}

interface TypedFunction {
  find(fn: Function, signature: string[]): Function
  referToSelf<T>(fn: (self: T) => any): any
  signatures?: Record<string, Function>
}

interface MatrixConstructor {
  (data: any): Matrix
}

type AlgorithmFunction = (...args: any[]) => Matrix
type ElementwiseOperation = (a: any, b: any) => any

interface MatrixAlgorithmSuiteOptions {
  elop?: ElementwiseOperation & { signatures?: Record<string, Function> }
  SS?: AlgorithmFunction
  DS?: AlgorithmFunction
  SD?: AlgorithmFunction
  Ss?: AlgorithmFunction
  sS?: AlgorithmFunction | false  // false means not implemented
  Ds?: AlgorithmFunction
  scalar?: string
}

type MatrixSignatures = Record<string, Function>

const name = 'matrixAlgorithmSuite'
const dependencies = ['typed', 'matrix']

export const createMatrixAlgorithmSuite = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix }: { typed: TypedFunction; matrix: MatrixConstructor }) => {
    const matAlgo13xDD = createMatAlgo13xDD({ typed })
    const matAlgo14xDs = createMatAlgo14xDs({ typed })

    /**
     * Return a signatures object with the usual boilerplate of
     * matrix algorithms, based on a plain options object with the
     * following properties:
     *   elop: function -- the elementwise operation to use, defaults to self
     *   SS: function -- the algorithm to apply for two sparse matrices
     *   DS: function -- the algorithm to apply for a dense and a sparse matrix
     *   SD: function -- algo for a sparse and a dense; defaults to SD flipped
     *   Ss: function -- the algorithm to apply for a sparse matrix and scalar
     *   sS: function -- algo for scalar and sparse; defaults to Ss flipped
     *   scalar: string -- typed-function type for scalars, defaults to 'any'
     *
     * If Ss is not specified, no matrix-scalar signatures are generated.
     *
     * @param {object} options
     * @return {Object<string, function>} signatures
     */
    return function matrixAlgorithmSuite(
      options: MatrixAlgorithmSuiteOptions
    ): MatrixSignatures {
      const elop = options.elop
      const SD = options.SD || options.DS
      let matrixSignatures: MatrixSignatures

      if (elop) {
        // First the dense ones
        matrixSignatures = {
          'DenseMatrix, DenseMatrix': (x: any, y: any) =>
            matAlgo13xDD(...(broadcast(x, y) as [any, any]), elop),
          'Array, Array': (x: any[], y: any[]) =>
            matAlgo13xDD(
              ...(broadcast(matrix(x) as any, matrix(y) as any) as [any, any]),
              elop
            ).valueOf(),
          'Array, DenseMatrix': (x: any[], y: any) =>
            matAlgo13xDD(
              ...(broadcast(matrix(x) as any, y) as [any, any]),
              elop
            ),
          'DenseMatrix, Array': (x: any, y: any[]) =>
            matAlgo13xDD(
              ...(broadcast(x, matrix(y) as any) as [any, any]),
              elop
            )
        }
        // Now incorporate sparse matrices
        if (options.SS) {
          matrixSignatures['SparseMatrix, SparseMatrix'] = (x: any, y: any) =>
            options.SS!(...(broadcast(x, y) as any), elop, false)
        }
        if (options.DS) {
          matrixSignatures['DenseMatrix, SparseMatrix'] = (x: any, y: any) =>
            options.DS!(...(broadcast(x, y) as any), elop, false)
          matrixSignatures['Array, SparseMatrix'] = (x: any[], y: any) =>
            options.DS!(...(broadcast(matrix(x) as any, y) as any), elop, false)
        }
        if (SD) {
          matrixSignatures['SparseMatrix, DenseMatrix'] = (x: any, y: any) =>
            SD(...(broadcast(y, x) as any), elop, true)
          matrixSignatures['SparseMatrix, Array'] = (x: any, y: any[]) =>
            SD(...(broadcast(matrix(y) as any, x) as any), elop, true)
        }
      } else {
        // No elop, use this
        // First the dense ones
        matrixSignatures = {
          'DenseMatrix, DenseMatrix': typed.referToSelf(
            (self: any) => (x: any, y: any) => {
              return matAlgo13xDD(...(broadcast(x, y) as [any, any]), self)
            }
          ),
          'Array, Array': typed.referToSelf(
            (self: any) => (x: any[], y: any[]) => {
              return matAlgo13xDD(
                ...(broadcast(matrix(x) as any, matrix(y) as any) as [
                  any,
                  any
                ]),
                self
              ).valueOf()
            }
          ),
          'Array, DenseMatrix': typed.referToSelf(
            (self: any) => (x: any[], y: any) => {
              return matAlgo13xDD(
                ...(broadcast(matrix(x) as any, y) as [any, any]),
                self
              )
            }
          ),
          'DenseMatrix, Array': typed.referToSelf(
            (self: any) => (x: any, y: any[]) => {
              return matAlgo13xDD(
                ...(broadcast(x, matrix(y) as any) as [any, any]),
                self
              )
            }
          )
        }
        // Now incorporate sparse matrices
        if (options.SS) {
          matrixSignatures['SparseMatrix, SparseMatrix'] = typed.referToSelf(
            (self: any) => (x: any, y: any) => {
              return options.SS!(...(broadcast(x, y) as any), self, false)
            }
          )
        }
        if (options.DS) {
          matrixSignatures['DenseMatrix, SparseMatrix'] = typed.referToSelf(
            (self: any) => (x: any, y: any) => {
              return options.DS!(...(broadcast(x, y) as any), self, false)
            }
          )
          matrixSignatures['Array, SparseMatrix'] = typed.referToSelf(
            (self: any) => (x: any[], y: any) => {
              return options.DS!(
                ...(broadcast(matrix(x) as any, y) as any),
                self,
                false
              )
            }
          )
        }
        if (SD) {
          matrixSignatures['SparseMatrix, DenseMatrix'] = typed.referToSelf(
            (self: any) => (x: any, y: any) => {
              return SD(...(broadcast(y, x) as any), self, true)
            }
          )
          matrixSignatures['SparseMatrix, Array'] = typed.referToSelf(
            (self: any) => (x: any, y: any[]) => {
              return SD(...(broadcast(matrix(y) as any, x) as any), self, true)
            }
          )
        }
      }

      // Now add the scalars
      const scalar = options.scalar || 'any'
      const Ds = options.Ds || options.Ss
      if (Ds) {
        if (elop) {
          matrixSignatures['DenseMatrix,' + scalar] = (x: any, y: any) =>
            matAlgo14xDs(x, y, elop, false)
          matrixSignatures[scalar + ', DenseMatrix'] = (x: any, y: any) =>
            matAlgo14xDs(y, x, elop, true)
          matrixSignatures['Array,' + scalar] = (x: any[], y: any) =>
            matAlgo14xDs(matrix(x) as any, y, elop, false).valueOf()
          matrixSignatures[scalar + ', Array'] = (x: any, y: any[]) =>
            matAlgo14xDs(matrix(y) as any, x, elop, true).valueOf()
        } else {
          matrixSignatures['DenseMatrix,' + scalar] = typed.referToSelf(
            (self: any) => (x: any, y: any) => {
              return matAlgo14xDs(x, y, self, false)
            }
          )
          matrixSignatures[scalar + ', DenseMatrix'] = typed.referToSelf(
            (self: any) => (x: any, y: any) => {
              return matAlgo14xDs(y, x, self, true)
            }
          )
          matrixSignatures['Array,' + scalar] = typed.referToSelf(
            (self: any) => (x: any[], y: any) => {
              return matAlgo14xDs(matrix(x) as any, y, self, false).valueOf()
            }
          )
          matrixSignatures[scalar + ', Array'] = typed.referToSelf(
            (self: any) => (x: any, y: any[]) => {
              return matAlgo14xDs(matrix(y) as any, x, self, true).valueOf()
            }
          )
        }
      }
      const sS = options.sS !== undefined ? options.sS : options.Ss
      if (elop) {
        if (options.Ss) {
          matrixSignatures['SparseMatrix,' + scalar] = (x: Matrix, y: any) =>
            options.Ss!(x, y, elop, false)
        }
        if (sS) {
          matrixSignatures[scalar + ', SparseMatrix'] = (x: any, y: Matrix) =>
            sS(y, x, elop, true)
        }
      } else {
        if (options.Ss) {
          matrixSignatures['SparseMatrix,' + scalar] = typed.referToSelf(
            (self: any) => (x: Matrix, y: any) => {
              return options.Ss!(x, y, self, false)
            }
          )
        }
        if (sS) {
          matrixSignatures[scalar + ', SparseMatrix'] = typed.referToSelf(
            (self: any) => (x: any, y: Matrix) => {
              return sS(y, x, self, true)
            }
          )
        }
      }
      // Also pull in the scalar signatures if the operator is a typed function
      if (elop && elop.signatures) {
        extend(matrixSignatures, elop.signatures)
      }
      return matrixSignatures
    }
  }
)
