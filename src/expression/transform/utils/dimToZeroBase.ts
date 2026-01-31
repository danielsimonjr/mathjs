import { isNumber, isBigNumber } from '../../../utils/is.ts'
import type { BigNumberLike, DimensionValue } from '../types.ts'

/**
 * Change last argument dim from one-based to zero-based.
 * @param dim - The dimension value (number or BigNumber)
 * @returns The zero-based dimension value
 */
export function dimToZeroBase(dim: DimensionValue): number | BigNumberLike {
  if (isNumber(dim)) {
    return dim - 1
  } else if (isBigNumber(dim)) {
    return (dim as BigNumberLike).minus(1)
  } else {
    return dim
  }
}

/**
 * Check if a value is a number or BigNumber
 * @param n - Value to check
 * @returns True if n is a number or BigNumber
 */
export function isNumberOrBigNumber(n: unknown): n is number | BigNumberLike {
  return isNumber(n) || isBigNumber(n)
}
