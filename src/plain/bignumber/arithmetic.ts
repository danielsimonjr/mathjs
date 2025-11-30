const signature1 = 'BigNumber'
const signature2 = 'BigNumber, BigNumber'

export const absBigNumber: any = function (a: any): any {
  return a.abs()
}
absBigNumber.signature = signature1

export const addBigNumber: any = function (a: any, b: any): any {
  return a.add(b)
}
addBigNumber.signature = signature2

export const subtractBigNumber: any = function (a: any, b: any): any {
  return a.sub(b)
}
subtractBigNumber.signature = signature2

export const multiplyBigNumber: any = function (a: any, b: any): any {
  return a.mul(b)
}
multiplyBigNumber.signature = signature2

export const divideBigNumber: any = function (a: any, b: any): any {
  return a.div(b)
}
divideBigNumber.signature = signature2
