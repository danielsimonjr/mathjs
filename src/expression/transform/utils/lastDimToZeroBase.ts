import { isCollection } from '../../../utils/is.ts'
import { dimToZeroBase, isNumberOrBigNumber } from './dimToZeroBase.ts'
/**
 * Change last argument dim from one-based to zero-based.
 */
export function lastDimToZeroBase (args: any) {
  if (args.length === 2 && isCollection(args[0])) {
    args = args.slice()
    const dim = args[1]
    if (isNumberOrBigNumber(dim)) {
      args[1] = dimToZeroBase(dim)
    }
  }
  return args
}
