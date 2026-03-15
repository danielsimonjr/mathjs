import { isCollection } from '../../../utils/is.ts'
import { dimToZeroBase, isNumberOrBigNumber } from './dimToZeroBase.ts'
import type { VariadicArgs } from '../types.ts'

/**
 * Change last argument dim from one-based to zero-based.
 * Only applies when there are exactly 2 arguments and the first is a collection.
 * @param args - The arguments array
 * @returns A copy of args with the dimension converted, or the original args
 */
export function lastDimToZeroBase(args: VariadicArgs): VariadicArgs {
  if (args.length === 2 && isCollection(args[0])) {
    args = args.slice()
    const dim = args[1]
    if (isNumberOrBigNumber(dim)) {
      args[1] = dimToZeroBase(dim)
    }
  }
  return args
}
