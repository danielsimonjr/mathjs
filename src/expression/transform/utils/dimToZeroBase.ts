import { isNumber, isBigNumber } from '../../../utils/is.js'
/**
 * Change last argument dim from one-based to zero-based.
 */
export function dimToZeroBase (dim: any) {
  if (isNumber(dim)) {
    return dim - 1
  } else if (isBigNumber(dim)) {
    return (dim as any).minus(1)
  } else {
    return dim
  }
}

export function isNumberOrBigNumber (n: any) {
  return isNumber(n) || isBigNumber(n)
}
