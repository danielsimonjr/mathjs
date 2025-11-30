/**
 * Create a syntax error with the message:
 *     'Wrong number of arguments in function <fn> (<count> provided, <min>-<max> expected)'
 * @param {string} fn     Function name
 * @param {number} count  Actual argument count
 * @param {number} min    Minimum required argument count
 * @param {number} [max]  Maximum required argument count
 * @extends Error
 */
export class ArgumentsError extends Error {
  fn: any
  count: any
  min: any
  max: any

  constructor (fn: any, count: any, min: any, max?: any) {
    const message = 'Wrong number of arguments in function ' + fn +
        ' (' + count + ' provided, ' +
        min + ((max !== undefined && max !== null) ? ('-' + max) : '') + ' expected)'

    super(message)

    this.fn = fn
    this.count = count
    this.min = min
    this.max = max
    this.name = 'ArgumentsError'

    if (Error.captureStackTrace) {
      (Error as any).captureStackTrace(this, ArgumentsError)
    }
  }
}

// Add static property for type checking
(ArgumentsError.prototype as any).isArgumentsError = true
