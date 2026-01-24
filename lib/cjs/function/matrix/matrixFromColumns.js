"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMatrixFromColumns = void 0;
var _factory = require("../../utils/factory.js");
const name = 'matrixFromColumns';
const dependencies = ['typed', 'matrix', 'flatten', 'size'];
const createMatrixFromColumns = exports.createMatrixFromColumns = /* #__PURE__ */(0, _factory.factory)(name, dependencies, _ref => {
  let {
    typed,
    matrix,
    flatten,
    size
  } = _ref;
  /**
   * Create a dense matrix from vectors as individual columns.
   * If you pass row vectors, they will be transposed (but not conjugated!)
   *
   * Syntax:
   *
   *    math.matrixFromColumns(...arr)
   *    math.matrixFromColumns(col1, col2)
   *    math.matrixFromColumns(col1, col2, col3)
   *
   * Examples:
   *
   *    math.matrixFromColumns([1, 2, 3], [[4],[5],[6]])
   *    math.matrixFromColumns(...vectors)
   *
   * See also:
   *
   *    matrix, matrixFromRows, matrixFromFunction, zeros
   *
   * @param {... Array | Matrix} cols Multiple columns
   * @return { number[][] | Matrix } if at least one of the arguments is an array, an array will be returned
   */
  return typed(name, {
    // Single variadic handler for arrays, matrices, and mixed types
    '...': function (arr) {
      if (arr.length === 0) {
        throw new TypeError('At least one column is needed to construct a matrix.');
      }

      // Check if all arguments are Matrix (none are plain arrays)
      const allMatrix = arr.every(item => typeof item.toArray === 'function');
      // Check if any argument is a plain array
      const hasArray = arr.some(item => Array.isArray(item));

      // Convert all to arrays for processing
      const arrays = arr.map(item => typeof item.toArray === 'function' ? item.toArray() : item);
      const result = _createArray(arrays);

      // Return Matrix only if all inputs were Matrix, otherwise return array
      if (allMatrix && !hasArray) {
        return matrix(result);
      }
      return result;
    }

    // TODO implement this properly for SparseMatrix
  });
  function _createArray(arr) {
    if (arr.length === 0) throw new TypeError('At least one column is needed to construct a matrix.');
    const N = checkVectorTypeAndReturnLength(arr[0]);

    // create an array with empty rows
    const result = [];
    for (let i = 0; i < N; i++) {
      result[i] = [];
    }

    // loop columns
    for (const col of arr) {
      const colLength = checkVectorTypeAndReturnLength(col);
      if (colLength !== N) {
        throw new TypeError('The vectors had different length: ' + (N | 0) + ' ≠ ' + (colLength | 0));
      }
      const f = flatten(col);

      // push a value to each row
      for (let i = 0; i < N; i++) {
        result[i].push(f[i]);
      }
    }
    return result;
  }
  function checkVectorTypeAndReturnLength(vec) {
    const s = size(vec);
    if (s.length === 1) {
      // 1D vector
      return s[0];
    } else if (s.length === 2) {
      // 2D vector
      if (s[0] === 1) {
        // row vector
        return s[1];
      } else if (s[1] === 1) {
        // col vector
        return s[0];
      } else {
        throw new TypeError('At least one of the arguments is not a vector.');
      }
    } else {
      throw new TypeError('Only one- or two-dimensional vectors are supported.');
    }
  }
});