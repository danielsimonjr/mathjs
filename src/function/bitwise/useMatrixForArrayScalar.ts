import { factory } from '../../utils/factory.js'

import { TypedFunction, MatrixConstructor } from '../../types.js';

export const createUseMatrixForArrayScalar = /* #__PURE__ */ factory('useMatrixForArrayScalar', ['typed', 'matrix'], ({
  typed,
  matrix
}: {
  typed: TypedFunction;
  matrix: MatrixConstructor;
}) => ({
  'Array, number': (typed as any).referTo('DenseMatrix, number',
    (selfDn: any) => (x: any, y: any) => selfDn((matrix as any)(x), y).valueOf()),

  'Array, BigNumber': (typed as any).referTo('DenseMatrix, BigNumber',
    (selfDB: any) => (x: any, y: any) => selfDB((matrix as any)(x), y).valueOf()),

  'number, Array': (typed as any).referTo('number, DenseMatrix',
    (selfnD: any) => (x: any, y: any) => selfnD(x, (matrix as any)(y)).valueOf()),

  'BigNumber, Array': (typed as any).referTo('BigNumber, DenseMatrix',
    (selfBD: any) => (x: any, y: any) => selfBD(x, (matrix as any)(y)).valueOf())
}))
