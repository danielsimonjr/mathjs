import { factory } from './utils/factory.js'
import { version } from './version.js'
import {
  createBigNumberE,
  createBigNumberPhi,
  createBigNumberPi,
  createBigNumberTau
} from './utils/bignumber/constants.js'
import { pi, tau, e, phi } from './plain/number/index.js'

export const createTrue = /* #__PURE__ */ factory('true', [], () => true)
export const createFalse = /* #__PURE__ */ factory('false', [], () => false)
export const createNull = /* #__PURE__ */ factory('null', [], (): null => null)

export const createInfinity = /* #__PURE__ */ recreateFactory(
  'Infinity',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(Infinity)
    : Infinity
)

export const createNaN = /* #__PURE__ */ recreateFactory(
  'NaN',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(NaN)
    : NaN
)

export const createPi = /* #__PURE__ */ recreateFactory(
  'pi',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? (createBigNumberPi as any)(BigNumber)
    : pi
)

export const createTau = /* #__PURE__ */ recreateFactory(
  'tau',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? (createBigNumberTau as any)(BigNumber)
    : tau
)

export const createE = /* #__PURE__ */ recreateFactory(
  'e',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? (createBigNumberE as any)(BigNumber)
    : e
)

// golden ratio, (1+sqrt(5))/2
export const createPhi = /* #__PURE__ */ recreateFactory(
  'phi',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? (createBigNumberPhi as any)(BigNumber)
    : phi
)

export const createLN2 = /* #__PURE__ */ recreateFactory(
  'LN2',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(2).ln()
    : Math.LN2
)

export const createLN10 = /* #__PURE__ */ recreateFactory(
  'LN10',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(10).ln()
    : Math.LN10
)

export const createLOG2E = /* #__PURE__ */ recreateFactory(
  'LOG2E',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(1).div(new (BigNumber as any)(2).ln())
    : Math.LOG2E
)

export const createLOG10E = /* #__PURE__ */ recreateFactory(
  'LOG10E',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(1).div(new (BigNumber as any)(10).ln())
    : Math.LOG10E
)

export const createSQRT1_2 = /* #__PURE__ */ recreateFactory( // eslint-disable-line camelcase
  'SQRT1_2',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)('0.5').sqrt()
    : Math.SQRT1_2
)

export const createSQRT2 = /* #__PURE__ */ recreateFactory(
  'SQRT2',
  ['config', '?BigNumber'],
  ({ config, BigNumber }: any) => (config.number === 'BigNumber')
    ? new (BigNumber as any)(2).sqrt()
    : Math.SQRT2
)

export const createI = /* #__PURE__ */ recreateFactory(
  'i',
  ['Complex'],
  ({ Complex }: any) => Complex.I
)

// for backward compatibility with v5
export const createUppercasePi = /* #__PURE__ */ factory('PI', ['pi'], ({
  pi
}: {
  pi: any;
}) => pi)
export const createUppercaseE = /* #__PURE__ */ factory('E', ['e'], ({
  e
}: {
  e: any;
}) => e)

export const createVersion = /* #__PURE__ */ factory('version', [], () => version)

// helper function to create a factory with a flag recreateOnConfigChange
// idea: allow passing optional properties to be attached to the factory function as 4th argument?
function recreateFactory (name: any, dependencies: any, create: any): any {
  return factory(name, dependencies, create, {
    recreateOnConfigChange: true
  })
}
