/**
 * Create a range error with the message:
 *     'Index out of range (index < min)'
 *     'Index out of range (index < max)'
 *
 * @param {number} index     The actual index
 * @param {number} [min=0]   Minimum index (included)
 * @param {number} [max]     Maximum index (excluded)
 * @extends RangeError
 */
export class IndexError extends RangeError {
  index: any
  min: any
  max: any

  constructor (index: any, min?: any, max?: any) {
    // Handle 2 or 3 argument forms
    let actualMin: any
    let actualMax: any

    if (arguments.length < 3) {
      actualMin = 0
      actualMax = min
    } else {
      actualMin = min
      actualMax = max
    }

    // Generate message
    let message: string
    if (actualMin !== undefined && index < actualMin) {
      message = 'Index out of range (' + index + ' < ' + actualMin + ')'
    } else if (actualMax !== undefined && index >= actualMax) {
      message = 'Index out of range (' + index + ' > ' + (actualMax - 1) + ')'
    } else {
      message = 'Index out of range (' + index + ')'
    }

    super(message)

    this.index = index
    this.min = actualMin
    this.max = actualMax
    this.name = 'IndexError'

    if (Error.captureStackTrace) {
      (Error as any).captureStackTrace(this, IndexError)
    }
  }
}

// Add static property for type checking
(IndexError.prototype as any).isIndexError = true
