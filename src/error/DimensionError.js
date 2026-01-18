/**
 * Create a range error with the message:
 *     'Dimension mismatch (<actual size> != <expected size>)'
 * Or with a custom message when called with a single string argument.
 * @param {number | number[] | string} actual   The actual size or custom message
 * @param {number | number[]} expected          The expected size
 * @param {string} [relation='!=']              Optional relation between actual
 *                                              and expected size: '!=', '<', etc.
 * @extends RangeError
 */
export function DimensionError (actual, expected, relation) {
  if (!(this instanceof DimensionError)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  // Support custom message: new DimensionError('custom message')
  if (typeof actual === 'string' && expected === undefined) {
    this.message = actual
    this.actual = undefined
    this.expected = undefined
    this.relation = undefined
  } else {
    // Standard usage: new DimensionError(actual, expected, relation)
    this.actual = actual
    this.expected = expected
    this.relation = relation

    this.message = 'Dimension mismatch (' +
        (Array.isArray(actual) ? ('[' + actual.join(', ') + ']') : actual) +
        ' ' + (this.relation || '!=') + ' ' +
        (Array.isArray(expected) ? ('[' + expected.join(', ') + ']') : expected) +
        ')'
  }

  this.stack = (new Error()).stack
}

DimensionError.prototype = new RangeError()
DimensionError.prototype.constructor = RangeError
DimensionError.prototype.name = 'DimensionError'
DimensionError.prototype.isDimensionError = true
