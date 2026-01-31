import type Decimal from 'decimal.js'

const signature1 = 'BigNumber'
const signature2 = 'BigNumber, BigNumber'

/**
 * Interface for functions with a signature property
 */
interface SignedFunction<T extends (...args: Decimal[]) => Decimal> extends Function {
  (...args: Parameters<T>): ReturnType<T>
  signature: string
}

/**
 * Returns the absolute value of a BigNumber
 * @param a - The BigNumber value
 * @returns The absolute value
 */
export const absBigNumber: SignedFunction<(a: Decimal) => Decimal> = function absBigNumber(a: Decimal): Decimal {
  return a.abs()
}
absBigNumber.signature = signature1

/**
 * Adds two BigNumber values
 * @param a - First BigNumber
 * @param b - Second BigNumber
 * @returns The sum
 */
export const addBigNumber: SignedFunction<(a: Decimal, b: Decimal) => Decimal> = function addBigNumber(a: Decimal, b: Decimal): Decimal {
  return a.add(b)
}
addBigNumber.signature = signature2

/**
 * Subtracts two BigNumber values
 * @param a - First BigNumber
 * @param b - Second BigNumber
 * @returns The difference
 */
export const subtractBigNumber: SignedFunction<(a: Decimal, b: Decimal) => Decimal> = function subtractBigNumber(a: Decimal, b: Decimal): Decimal {
  return a.sub(b)
}
subtractBigNumber.signature = signature2

/**
 * Multiplies two BigNumber values
 * @param a - First BigNumber
 * @param b - Second BigNumber
 * @returns The product
 */
export const multiplyBigNumber: SignedFunction<(a: Decimal, b: Decimal) => Decimal> = function multiplyBigNumber(a: Decimal, b: Decimal): Decimal {
  return a.mul(b)
}
multiplyBigNumber.signature = signature2

/**
 * Divides two BigNumber values
 * @param a - Dividend
 * @param b - Divisor
 * @returns The quotient
 */
export const divideBigNumber: SignedFunction<(a: Decimal, b: Decimal) => Decimal> = function divideBigNumber(a: Decimal, b: Decimal): Decimal {
  return a.div(b)
}
divideBigNumber.signature = signature2
