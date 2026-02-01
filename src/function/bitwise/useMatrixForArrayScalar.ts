import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for useMatrixForArrayScalar
interface BigNumberType {
  // BigNumber placeholder
}

interface Matrix {
  valueOf(): unknown[][]
}

interface MatrixConstructor {
  (data: unknown[]): Matrix
}

interface UseMatrixDependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
}

export const createUseMatrixForArrayScalar = /* #__PURE__ */ factory(
  'useMatrixForArrayScalar',
  ['typed', 'matrix'],
  ({ typed, matrix }: UseMatrixDependencies) => ({
    'Array, number': typed.referTo(
      'DenseMatrix, number',
      (selfDn: TypedFunction) =>
        (x: unknown[], y: number): unknown[] =>
          selfDn(matrix(x), y).valueOf()
    ),

    'Array, BigNumber': typed.referTo(
      'DenseMatrix, BigNumber',
      (selfDB: TypedFunction) =>
        (x: unknown[], y: BigNumberType): unknown[] =>
          selfDB(matrix(x), y).valueOf()
    ),

    'number, Array': typed.referTo(
      'number, DenseMatrix',
      (selfnD: TypedFunction) =>
        (x: number, y: unknown[]): unknown[] =>
          selfnD(x, matrix(y)).valueOf()
    ),

    'BigNumber, Array': typed.referTo(
      'BigNumber, DenseMatrix',
      (selfBD: TypedFunction) =>
        (x: BigNumberType, y: unknown[]): unknown[] =>
          selfBD(x, matrix(y)).valueOf()
    )
  })
)
