// configuration
export { config } from './configReadonly.ts'

// functions and constants
// @ts-ignore - generated file
export * from './pureFunctionsNumber.generated.js'
// @ts-ignore - generated file
export * from './impureFunctionsNumber.generated.js'
export * from './typeChecks.ts'

// error classes
export { IndexError } from '../error/IndexError.ts'
export { DimensionError } from '../error/DimensionError.ts'
export { ArgumentsError } from '../error/ArgumentsError.ts'

// dependency groups
// @ts-ignore - generated file
export * from './dependenciesNumber.generated.js'

// factory functions
export * from '../factoriesNumber.ts'

// core
export { create } from '../core/create.ts'
export { factory } from '../utils/factory.ts'
