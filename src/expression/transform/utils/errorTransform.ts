import { IndexError } from '../../../error/IndexError.ts'
import type { IndexError as IndexErrorType } from '../types.ts'

/**
 * Transform zero-based indices to one-based indices in errors
 * @param err - The error to transform
 * @returns The transformed error (IndexError with adjusted indices) or original error
 */
export function errorTransform(err: Error | IndexErrorType): Error | IndexError {
  if (err && (err as IndexErrorType).isIndexError) {
    const indexErr = err as IndexErrorType
    return new IndexError(
      indexErr.index + 1,
      indexErr.min + 1,
      indexErr.max !== undefined ? indexErr.max + 1 : undefined
    )
  }

  return err
}
