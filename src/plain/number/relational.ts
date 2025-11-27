// Relational operations for plain numbers

const n2 = 'number, number'

export function equalNumber(x: number, y: number): boolean {
  return x === y
}
equalNumber.signature = n2

export function unequalNumber(x: number, y: number): boolean {
  return x !== y
}
unequalNumber.signature = n2

export function smallerNumber(x: number, y: number): boolean {
  return x < y
}
smallerNumber.signature = n2

export function smallerEqNumber(x: number, y: number): boolean {
  return x <= y
}
smallerEqNumber.signature = n2

export function largerNumber(x: number, y: number): boolean {
  return x > y
}
largerNumber.signature = n2

export function largerEqNumber(x: number, y: number): boolean {
  return x >= y
}
largerEqNumber.signature = n2

export function compareNumber(x: number, y: number): number {
  if (x === y) return 0
  if (x < y) return -1
  return 1
}
compareNumber.signature = n2
