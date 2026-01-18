/**
 * Create a range error with the message:
 *     'Dimension mismatch (<actual size> != <expected size>)'
 * Or with a custom message when called with a single string argument.
 */
export class DimensionError extends RangeError {
  actual?: number | number[]
  expected?: number | number[]
  relation?: string
  isDimensionError: boolean = true

  /**
   * @param actual - The actual size or custom error message
   * @param expected - The expected size (optional if actual is a custom message)
   * @param relation - Optional relation between actual and expected size: '!=', '<', etc.
   */
  constructor(
    actual: number | number[] | string,
    expected?: number | number[],
    relation?: string
  ) {
    let message: string

    // Support custom message: new DimensionError('custom message')
    if (typeof actual === 'string' && expected === undefined) {
      message = actual
    } else {
      // Standard usage: new DimensionError(actual, expected, relation)
      message =
        'Dimension mismatch (' +
        (Array.isArray(actual) ? '[' + actual.join(', ') + ']' : actual) +
        ' ' +
        (relation || '!=') +
        ' ' +
        (Array.isArray(expected) ? '[' + expected.join(', ') + ']' : expected) +
        ')'
    }

    super(message)

    this.name = 'DimensionError'

    // Only set actual/expected/relation if not using custom message
    if (typeof actual === 'string' && expected === undefined) {
      this.actual = undefined
      this.expected = undefined
      this.relation = undefined
    } else {
      this.actual = actual as number | number[]
      this.expected = expected
      this.relation = relation
    }

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      ;(Error as any).captureStackTrace(this, DimensionError)
    }
  }
}
