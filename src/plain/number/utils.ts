import { isInteger } from '../../utils/number.ts'

const n1 = 'number'

export function isIntegerNumber(x: number): boolean {
  return isInteger(x)
}
isIntegerNumber.signature = n1

export function isNegativeNumber(x: number): boolean {
  return x < 0
}
isNegativeNumber.signature = n1

export function isPositiveNumber(x: number): boolean {
  return x > 0
}
isPositiveNumber.signature = n1

export function isZeroNumber(x: number): boolean {
  return x === 0
}
isZeroNumber.signature = n1

export function isNaNNumber(x: number): boolean {
  return Number.isNaN(x)
}
isNaNNumber.signature = n1
