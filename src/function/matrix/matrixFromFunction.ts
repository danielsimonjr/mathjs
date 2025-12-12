import { factory } from '../../utils/factory.ts'

import { TypedFunction, Matrix } from '../../types.ts';

const name = 'matrixFromFunction'
const dependencies = ['typed', 'matrix', 'isZero']

export const createMatrixFromFunction = /* #__PURE__ */ factory(name, dependencies, (
  {
    typed,
    matrix,
    isZero
  }: {
    typed: TypedFunction;
    matrix: any;
    isZero: (value: any) => boolean;
  }
): TypedFunction => {
  /**
   * Create a matrix by evaluating a generating function at each index.
   * The simplest overload returns a multi-dimensional array as long as `size`
   * is an array.
   * Passing `size` as a Matrix or specifying a `format` will result in
   * returning a Matrix.
   *
   * Syntax:
   *
   *    math.matrixFromFunction(size, fn)
   *    math.matrixFromFunction(size, fn, format)
   *    math.matrixFromFunction(size, fn, format, datatype)
   *    math.matrixFromFunction(size, format, fn)
   *    math.matrixFromFunction(size, format, datatype, fn)
   *
   * Where:
   *
   *    - `size: (number[] | Matrix)`
   *      A vector giving the extent of the array to be created in each
   *      dimension. If size has one entry, a vector is created; if it
   *      has two, a rectangular array/Matrix is created; if three, a
   *      three-dimensional array/Matrix is created; and so on.
   *    - `fn: (index: number[]) => MathType`
   *      The callback function that will generate the entries of the
   *      matrix. It is called in turn with the index of each entry of
   *      the matrix. The index is always an ordinary array of numbers
   *      with the same length as _size_. So for vectors, you will get
   *      indices like `[0]` or `[1]`, whereas for matrices, you will
   *      get indices like `[2, 0]` or `[1,3]`. The return value may
   *      be any type that can go in an array or Matrix entry, although
   *      if you supply the _datatype_ argument, you must yourself ensure
   *      the type of the return value matches. Note that currently,
   *      your callback _fn_ will receive 0-based indices for the matrix
   *      entries, regardless of whether matrixFromFunction is invoked
   *      directly from JavaScript or via the mathjs expression language.
   *    - `format: 'dense'|'sparse'`
   *      Specifies the storage format for the resulting Matrix. Note that
   *      if this argument is given, the return value will always be a
   *      Matrix (rather than possibly an Array).
   *    - `datatype: string`
   *      Specifies the data type of entries of the new matrix. If given,
   *      it should be the name of a data type that mathjs supports, as
   *      returned by the math.typeOf function. It is up to the caller
   *      to make certain that all values returned by _fn_ are consistent
   *      with this datatype if specified.
   *
   * Examples:
   *
   *    math.matrixFromFunction([3,3], i => i[0] - i[1]) // an antisymmetric matrix
   *    math.matrixFromFunction([100, 100], 'sparse', i => i[0] - i[1] === 1 ? 4 : 0) // a sparse subdiagonal matrix
   *    math.matrixFromFunction([5], i => math.random()) // a random vector
   *
   * See also:
   *
   *    matrix, typeOf, zeros
   *
   * @param {Array | Matrix} size   The size of the matrix to be created
   * @param {function} fn           Callback function invoked for every entry in the matrix
   * @param {string} [format]       The Matrix storage format, either `'dense'` or `'sparse'`
   * @param {string} [datatype]     Type of the values
   * @return {Array | Matrix} Returns the created matrix
   */
  return typed(name, {
    'Array | Matrix, function, string, string': function (size: any[] | Matrix, fn: Function, format: string, datatype: string) {
      return _create(size, fn, format, datatype)
    },
    'Array | Matrix, function, string': function (size: any[] | Matrix, fn: Function, format: string) {
      return _create(size, fn, format, undefined)
    },
    'Matrix, function': function(size: Matrix, fn: Function): Matrix {
      return _create(size, fn, 'dense', undefined)
    },
    'Array, function': function(size: any[], fn: Function): any[] {
      return _create(size, fn, 'dense', undefined).toArray()
    },
    'Array | Matrix, string, function': function (size: any[] | Matrix, format: string, fn: Function) {
      return _create(size, fn, format, undefined)
    },
    'Array | Matrix, string, string, function': function (size: any[] | Matrix, format: string, datatype: string, fn: Function) {
      return _create(size, fn, format, datatype)
    }
  });

  function _create (size: any, fn: any, format: any, datatype: any) {
    let m
    if (datatype !== undefined) {
      m = matrix(format, datatype)
    } else {
      m = matrix(format)
    }

    m.resize(size)
    m.forEach(function (_: any, index: any) {
      const val = fn(index)
      if (isZero(val)) return
      m.set(index, val)
    })

    return m
  }
})
