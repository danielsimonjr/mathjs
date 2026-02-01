import Decimal from 'decimal.js'

export * from './arithmetic.ts'

/**
 * Extended BigNumber interface with mathjs-specific properties
 */
export interface PlainBigNumber extends Decimal {
  isBigNumber: true
}

/**
 * BigNumber constructor interface
 */
export interface PlainBigNumberConstructor {
  new (value: Decimal.Value): PlainBigNumber
  prototype: PlainBigNumber
}

// TODO: this is ugly. Instead, be able to pass your own isBigNumber function to typed?
const BigNumber = (
  Decimal as unknown as { clone: () => PlainBigNumberConstructor }
).clone()
BigNumber.prototype.isBigNumber = true

/**
 * Create a BigNumber from a value
 * @param x - The value to convert to BigNumber (number, string, or Decimal)
 * @returns A new BigNumber instance
 */
export function bignumber(x: Decimal.Value): PlainBigNumber {
  return new BigNumber(x)
}
