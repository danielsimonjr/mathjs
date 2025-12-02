/**
 * Custom error type for index out of range errors
 * @extends RangeError
 */
export class IndexError extends RangeError {
  index: number
  min: number | undefined
  max: number | undefined
  isIndexError: true = true

  /**
   * Create an IndexError
   *
   * Can be called in two ways:
   * - IndexError(index, max) - assumes min=0
   * - IndexError(index, min, max)
   *
   * @param index  The actual index
   * @param min    Minimum index (included), or max if only 2 args provided
   * @param max    Maximum index (excluded)
   */
  constructor(index: number, min?: number, max?: number) {
    let actualMin: number | undefined
    let actualMax: number | undefined

    if (max === undefined) {
      // Called with 2 args: IndexError(index, max)
      actualMin = 0
      actualMax = min
    } else {
      // Called with 3 args: IndexError(index, min, max)
      actualMin = min
      actualMax = max
    }

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

    // Maintains proper stack trace for where error was thrown (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IndexError)
    }
  }
}

// Backward compatibility - allow calling as a function (with new operator)
export function createIndexError(index: number, min?: number, max?: number): IndexError {
  return new IndexError(index, min, max)
}
