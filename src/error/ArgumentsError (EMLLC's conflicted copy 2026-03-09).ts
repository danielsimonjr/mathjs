/**
 * Custom error type for wrong number of arguments
 * @extends Error
 */
export class ArgumentsError extends Error {
  fn: string
  count: number
  min: number
  max: number | undefined
  isArgumentsError = true as const

  /**
   * Create an ArgumentsError
   * @param fn     Function name
   * @param count  Actual argument count
   * @param min    Minimum required argument count
   * @param max    Maximum required argument count (optional)
   */
  constructor(fn: string, count: number, min: number, max?: number) {
    const message =
      'Wrong number of arguments in function ' +
      fn +
      ' (' +
      count +
      ' provided, ' +
      min +
      (max !== undefined && max !== null ? '-' + max : '') +
      ' expected)'

    super(message)

    this.fn = fn
    this.count = count
    this.min = min
    this.max = max
    this.name = 'ArgumentsError'

    // Maintains proper stack trace for where error was thrown (V8)
    if ((Error as any).captureStackTrace) {
      ;(Error as any).captureStackTrace(this, ArgumentsError)
    }
  }
}

// Backward compatibility - allow calling as a function (with new operator)
export function createArgumentsError(
  fn: string,
  count: number,
  min: number,
  max?: number
): ArgumentsError {
  return new ArgumentsError(fn, count, min, max)
}
