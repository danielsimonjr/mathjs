import { typeOf } from '../../../utils/is.ts'

// Error with additional data property
interface TypedError extends Error {
  data?: { actual: string }
}

/**
 * Improve error messages for statistics functions. Errors are typically
 * thrown in an internally used function like larger, causing the error
 * not to mention the function (like max) which is actually used by the user.
 *
 * @param {Error} err
 * @param {String} fnName
 * @param {*} [value]
 * @return {Error}
 */
export function improveErrorMessage(
  err: TypedError,
  fnName: string,
  value?: unknown
): Error {
  // TODO: add information with the index (also needs transform in expression parser)
  let details

  if (String(err).includes('Unexpected type')) {
    details =
      value !== undefined
        ? ' (type: ' + typeOf(value) + ', value: ' + JSON.stringify(value) + ')'
        : ' (type: ' + (err.data?.actual ?? 'unknown') + ')'

    return new TypeError(
      'Cannot calculate ' + fnName + ', unexpected type of argument' + details
    )
  }

  if (String(err).includes('complex numbers')) {
    details =
      value !== undefined
        ? ' (type: ' + typeOf(value) + ', value: ' + JSON.stringify(value) + ')'
        : ''

    return new TypeError(
      'Cannot calculate ' +
        fnName +
        ', no ordering relation is defined for complex numbers' +
        details
    )
  }

  return err
}
