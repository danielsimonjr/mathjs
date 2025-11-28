const n1 = 'number'
const n2 = 'number, number'

export function notNumber(x: number): boolean {
  return !x
}
notNumber.signature = n1

export function orNumber(x: number, y: number): boolean {
  return !!(x || y)
}
orNumber.signature = n2

export function xorNumber(x: number, y: number): boolean {
  return !!x !== !!y
}
xorNumber.signature = n2

export function andNumber(x: number, y: number): boolean {
  return !!(x && y)
}
andNumber.signature = n2
