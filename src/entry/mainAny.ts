// configuration
export { config } from './configReadonly.ts'

// functions and constants
// @ts-ignore - generated file
export * from './pureFunctionsAny.generated.js'
// @ts-ignore - generated file
export * from './impureFunctionsAny.generated.js'
export * from './typeChecks.ts'

// error classes
export { IndexError } from '../error/IndexError.ts'
export { DimensionError } from '../error/DimensionError.ts'
export { ArgumentsError } from '../error/ArgumentsError.ts'

// dependency groups
// @ts-ignore - generated file
export * from './dependenciesAny.generated.js'

// factory functions
export * from '../factoriesAny.ts'

// core
export { create } from '../core/create.ts'
export { factory } from '../utils/factory.ts'
