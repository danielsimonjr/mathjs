import { Decimal } from '../../type/local/Decimal.ts'

export * from './arithmetic.ts'

// TODO: this is ugly. Instead, be able to pass your own isBigNumber function to typed?
const BigNumber = (Decimal as any).clone()
BigNumber.prototype.isBigNumber = true

export function bignumber (x: any) {
  return new BigNumber(x)
}
