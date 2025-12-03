import { factory } from '../../utils/factory.js'

import { TypedFunction, MatrixConstructor } from '../../types.js';

export const createUseMatrixForArrayScalar = /* #__PURE__ */ factory('useMatrixForArrayScalar', ['typed', 'matrix'], ({
  typed,
  matrix
}: {
  typed: TypedFunction;
  matrix: MatrixConstructor;
}) => ({
  'Array, number': typed.referTo('DenseMatrix, number',
    (selfDn: any) => (x: any, y: any) => selfDn(matrix(x), y).valueOf()),

  'Array, BigNumber': typed.referTo('DenseMatrix, BigNumber',
    (selfDB: any) => (x: any, y: any) => selfDB(matrix(x), y).valueOf()),

  'number, Array': typed.referTo('number, DenseMatrix',
    (selfnD: any) => (x: any, y: any) => selfnD(x, matrix(y)).valueOf()),

  'BigNumber, Array': typed.referTo('BigNumber, DenseMatrix',
    (selfBD: any) => (x: any, y: any) => selfBD(x, matrix(y)).valueOf())
}))
