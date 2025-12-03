const signature1 = 'BigNumber'
const signature2 = 'BigNumber, BigNumber'

export function absBigNumber (a: any) {
  return a.abs()
}
absBigNumber.signature = signature1

export function addBigNumber (a: any, b: any) {
  return a.add(b)
}
addBigNumber.signature = signature2

export function subtractBigNumber (a: any, b: any) {
  return a.sub(b)
}
subtractBigNumber.signature = signature2

export function multiplyBigNumber (a: any, b: any) {
  return a.mul(b)
}
multiplyBigNumber.signature = signature2

export function divideBigNumber (a: any, b: any) {
  return a.div(b)
}
divideBigNumber.signature = signature2
