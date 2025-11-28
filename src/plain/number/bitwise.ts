import { isInteger } from '../../utils/number.js'

const n1 = 'number'
const n2 = 'number, number'

export function bitAndNumber(x: number, y: number): number {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error('Integers expected in function bitAnd')
  }

  return x & y
}
bitAndNumber.signature = n2

export function bitNotNumber(x: number): number {
  if (!isInteger(x)) {
    throw new Error('Integer expected in function bitNot')
  }

  return ~x
}
bitNotNumber.signature = n1

export function bitOrNumber(x: number, y: number): number {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error('Integers expected in function bitOr')
  }

  return x | y
}
bitOrNumber.signature = n2

export function bitXorNumber(x: number, y: number): number {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error('Integers expected in function bitXor')
  }

  return x ^ y
}
bitXorNumber.signature = n2

export function leftShiftNumber(x: number, y: number): number {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error('Integers expected in function leftShift')
  }

  return x << y
}
leftShiftNumber.signature = n2

export function rightArithShiftNumber(x: number, y: number): number {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error('Integers expected in function rightArithShift')
  }

  return x >> y
}
rightArithShiftNumber.signature = n2

export function rightLogShiftNumber(x: number, y: number): number {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error('Integers expected in function rightLogShift')
  }

  return x >>> y
}
rightLogShiftNumber.signature = n2
