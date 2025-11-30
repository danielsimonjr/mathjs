const signature1 = 'BigNumber'
const signature2 = 'BigNumber, BigNumber'

interface BigNumberFunc extends Function {
  signature: string
}

export function absBigNumber (a: any): any {
  return a.abs()
}
(absBigNumber as BigNumberFunc).signature = signature1

export function addBigNumber (a: any, b: any): any {
  return a.add(b)
}
(addBigNumber as BigNumberFunc).signature = signature2

export function subtractBigNumber (a: any, b: any): any {
  return a.sub(b)
}
(subtractBigNumber as BigNumberFunc).signature = signature2

export function multiplyBigNumber (a: any, b: any): any {
  return a.mul(b)
}
(multiplyBigNumber as BigNumberFunc).signature = signature2

export function divideBigNumber (a: any, b: any): any {
  return a.div(b)
}
(divideBigNumber as BigNumberFunc).signature = signature2
