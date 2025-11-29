/**
 * Create a range error with the message:
 *     'Dimension mismatch (<actual size> != <expected size>)'
 */
export class DimensionError extends RangeError {
  actual: number | number[]
  expected: number | number[]
  relation?: string
  isDimensionError: boolean = true

  /**
   * @param actual - The actual size
   * @param expected - The expected size
   * @param relation - Optional relation between actual and expected size: '!=', '<', etc.
   */
  constructor(actual: number | number[], expected: number | number[], relation?: string) {
    const message = 'Dimension mismatch (' +
      (Array.isArray(actual) ? ('[' + actual.join(', ') + ']') : actual) +
      ' ' + (relation || '!=') + ' ' +
      (Array.isArray(expected) ? ('[' + expected.join(', ') + ']') : expected) +
      ')'

    super(message)

    this.name = 'DimensionError'
    this.actual = actual
    this.expected = expected
    this.relation = relation

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, DimensionError)
    }
  }
}
