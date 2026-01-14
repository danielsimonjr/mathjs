import typedFunction from '@danielsimonjr/typed-function'
import { ArgumentsError } from '../error/ArgumentsError.ts'
import { DimensionError } from '../error/DimensionError.ts'
import { IndexError } from '../error/IndexError.ts'
import { factory, isFactory } from '../utils/factory.ts'
import type { FactoryFunction, LegacyFactory } from '../utils/factory.ts'
import {
  isAccessorNode,
  isArray,
  isArrayNode,
  isAssignmentNode,
  isBigInt,
  isBigNumber,
  isBlockNode,
  isBoolean,
  isChain,
  isCollection,
  isComplex,
  isConditionalNode,
  isConstantNode,
  isDate,
  isDenseMatrix,
  isFraction,
  isFunction,
  isFunctionAssignmentNode,
  isFunctionNode,
  isHelp,
  isIndex,
  isIndexNode,
  isMap,
  isMatrix,
  isNode,
  isNull,
  isNumber,
  isObject,
  isObjectNode,
  isObjectWrappingMap,
  isOperatorNode,
  isParenthesisNode,
  isPartitionedMap,
  isRange,
  isRangeNode,
  isRegExp,
  isRelationalNode,
  isResultSet,
  isSparseMatrix,
  isString,
  isSymbolNode,
  isUndefined,
  isUnit
} from '../utils/is.ts'
import { deepFlatten, isLegacyFactory } from '../utils/object.ts'
import * as emitter from './../utils/emitter.ts'
import { DEFAULT_CONFIG } from './config.ts'
import type { ConfigOptions, MathJsConfig } from './config.ts'

// Re-export MathJsConfig for backward compatibility
export type { MathJsConfig }
import { configFactory } from './function/config.ts'
import { importFactory } from './function/import.ts'

/**
 * Type for the mathjs instance
 */
export interface MathJsInstance {
  // Type checking functions
  isNumber: typeof isNumber
  isComplex: typeof isComplex
  isBigNumber: typeof isBigNumber
  isBigInt: typeof isBigInt
  isFraction: typeof isFraction
  isUnit: typeof isUnit
  isString: typeof isString
  isArray: typeof isArray
  isMatrix: typeof isMatrix
  isCollection: typeof isCollection
  isDenseMatrix: typeof isDenseMatrix
  isSparseMatrix: typeof isSparseMatrix
  isRange: typeof isRange
  isIndex: typeof isIndex
  isBoolean: typeof isBoolean
  isResultSet: typeof isResultSet
  isHelp: typeof isHelp
  isFunction: typeof isFunction
  isDate: typeof isDate
  isRegExp: typeof isRegExp
  isObject: typeof isObject
  isMap: typeof isMap
  isPartitionedMap: typeof isPartitionedMap
  isObjectWrappingMap: typeof isObjectWrappingMap
  isNull: typeof isNull
  isUndefined: typeof isUndefined
  isAccessorNode: typeof isAccessorNode
  isArrayNode: typeof isArrayNode
  isAssignmentNode: typeof isAssignmentNode
  isBlockNode: typeof isBlockNode
  isConditionalNode: typeof isConditionalNode
  isConstantNode: typeof isConstantNode
  isFunctionAssignmentNode: typeof isFunctionAssignmentNode
  isFunctionNode: typeof isFunctionNode
  isIndexNode: typeof isIndexNode
  isNode: typeof isNode
  isObjectNode: typeof isObjectNode
  isOperatorNode: typeof isOperatorNode
  isParenthesisNode: typeof isParenthesisNode
  isRangeNode: typeof isRangeNode
  isRelationalNode: typeof isRelationalNode
  isSymbolNode: typeof isSymbolNode
  isChain: typeof isChain

  // Core functions
  config: (config?: Partial<ConfigOptions>) => ConfigOptions
  import: (factories: any, options?: ImportOptions) => void
  create: (
    factories?: FactoriesInput,
    config?: Partial<ConfigOptions>
  ) => MathJsInstance
  factory: typeof factory
  typed: typeof typedFunction & { isTypedFunction?: (value: any) => boolean }

  // Error types
  ArgumentsError: typeof ArgumentsError
  DimensionError: typeof DimensionError
  IndexError: typeof IndexError

  // Expression namespace
  expression: {
    transform: Record<string, any>
    mathWithTransform: {
      config: (config?: Partial<ConfigOptions>) => ConfigOptions
      [key: string]: any
    }
  }

  // Type namespace
  type?: Record<string, any>

  // Event emitter methods
  on: (event: string, callback: (...args: any[]) => void) => MathJsInstance
  off: (event: string, callback: (...args: any[]) => void) => MathJsInstance
  once: (event: string, callback: (...args: any[]) => void) => MathJsInstance
  emit: (event: string, ...args: any[]) => MathJsInstance

  // Additional dynamically added functions
  [key: string]: any
}

/**
 * Input type for factories
 */
export type FactoriesInput =
  | Record<string, FactoryFunction | LegacyFactory>
  | Array<FactoryFunction | LegacyFactory>
  | FactoryFunction
  | LegacyFactory

/**
 * Options for the import function
 */
export interface ImportOptions {
  override?: boolean
  silent?: boolean
  wrap?: boolean
}

/**
 * Type for lazy typed function
 */
interface LazyTyped extends Function {
  (...args: any[]): any
  isTypedFunction?: (value: any) => boolean
}

/**
 * Create a mathjs instance from given factory functions and optionally config
 *
 * Usage:
 *
 *     const mathjs1 = create({ createAdd, createMultiply, ...})
 *     const config = { number: 'BigNumber' }
 *     const mathjs2 = create(all, config)
 *
 * @param factories An object with factory functions.
 *                  The object can contain nested objects,
 *                  all nested objects will be flattened.
 * @param config    Available options:
 *                  {number} relTol
 *                    Minimum relative difference between two
 *                    compared values, used by all comparison functions.
 *                  {number} absTol
 *                    Minimum absolute difference between two
 *                    compared values, used by all comparison functions.
 *                  {string} matrix
 *                    A string 'Matrix' (default) or 'Array'.
 *                  {string} number
 *                    A string 'number' (default), 'BigNumber', or 'Fraction'
 *                  {number} precision
 *                    The number of significant digits for BigNumbers.
 *                    Not applicable for Numbers.
 *                  {boolean} predictable
 *                    Predictable output type of functions. When true,
 *                    output type depends only on the input types. When
 *                    false (default), output type can vary depending
 *                    on input values. For example `math.sqrt(-4)`
 *                    returns `complex('2i')` when predictable is false, and
 *                    returns `NaN` when true.
 *                  {string} randomSeed
 *                    Random seed for seeded pseudo random number generator.
 *                    Set to null to randomly seed.
 * @returns Returns a bare-bone math.js instance containing
 *          functions:
 *          - `import` to add new functions
 *          - `config` to change configuration
 *          - `on`, `off`, `once`, `emit` for events
 */
export function create(
  factories?: FactoriesInput,
  config?: Partial<ConfigOptions>
): MathJsInstance {
  const configInternal: ConfigOptions = Object.assign(
    {},
    DEFAULT_CONFIG,
    config
  )

  // simple test for ES5 support
  if (typeof Object.create !== 'function') {
    throw new Error(
      'ES5 not supported by this JavaScript engine. ' +
        'Please load the es5-shim and es5-sham library for compatibility.'
    )
  }

  // create the mathjs instance
  const math = emitter.mixin({
    // only here for backward compatibility for legacy factory functions
    isNumber,
    isComplex,
    isBigNumber,
    isBigInt,
    isFraction,
    isUnit,
    isString,
    isArray,
    isMatrix,
    isCollection,
    isDenseMatrix,
    isSparseMatrix,
    isRange,
    isIndex,
    isBoolean,
    isResultSet,
    isHelp,
    isFunction,
    isDate,
    isRegExp,
    isObject,
    isMap,
    isPartitionedMap,
    isObjectWrappingMap,
    isNull,
    isUndefined,

    isAccessorNode,
    isArrayNode,
    isAssignmentNode,
    isBlockNode,
    isConditionalNode,
    isConstantNode,
    isFunctionAssignmentNode,
    isFunctionNode,
    isIndexNode,
    isNode,
    isObjectNode,
    isOperatorNode,
    isParenthesisNode,
    isRangeNode,
    isRelationalNode,
    isSymbolNode,

    isChain
  }) as MathJsInstance

  // load config function and apply provided config
  math.config = configFactory(configInternal, math.emit)

  math.expression = {
    transform: {},
    mathWithTransform: {
      config: math.config
    }
  }

  // cached factories and instances used by function load
  const legacyFactories: LegacyFactory[] = []
  const legacyInstances: any[] = []

  /**
   * Load a function or data type from a factory.
   * If the function or data type already exists, the existing instance is
   * returned.
   * @param factory The factory function or object
   * @returns The created instance
   */
  function load(factory: FactoryFunction | LegacyFactory | any): any {
    if (isFactory(factory)) {
      return factory(math)
    }

    const firstProperty = factory[Object.keys(factory)[0]]
    if (isFactory(firstProperty)) {
      return firstProperty(math)
    }

    if (!isLegacyFactory(factory)) {
      console.warn(
        'Factory object with properties `type`, `name`, and `factory` expected',
        factory
      )
      throw new Error(
        'Factory object with properties `type`, `name`, and `factory` expected'
      )
    }

    const index = legacyFactories.indexOf(factory)
    let instance: any
    if (index === -1) {
      // doesn't yet exist
      if (factory.math === true) {
        // pass with math namespace
        instance = factory.factory(
          math.type,
          configInternal,
          load,
          math.typed,
          math
        )
      } else {
        instance = factory.factory(math.type, configInternal, load, math.typed)
      }

      // append to the cache
      legacyFactories.push(factory)
      legacyInstances.push(instance)
    } else {
      // already existing function, return the cached instance
      instance = legacyInstances[index]
    }

    return instance
  }

  const importedFactories: Record<string, FactoryFunction | LegacyFactory> = {}

  // load the import function
  function lazyTyped(...args: any[]): any {
    return math.typed.apply(math.typed, args)
  }
  ;(lazyTyped as LazyTyped).isTypedFunction = (
    typedFunction as any
  ).isTypedFunction

  const internalImport = importFactory(
    lazyTyped as any,
    load,
    math,
    importedFactories
  )
  math.import = internalImport

  // listen for changes in config, import all functions again when changed
  // TODO: move this listener into the import function?
  math.on('config', () => {
    Object.values(importedFactories).forEach((factory) => {
      if (factory && factory.meta && factory.meta.recreateOnConfigChange) {
        // FIXME: only re-create when the current instance is the same as was initially created
        // FIXME: delete the functions/constants before importing them again?
        internalImport(factory, { override: true })
      }
    })
  })

  // the create function exposed on the mathjs instance is bound to
  // the factory functions passed before
  math.create = create.bind(null, factories)

  // export factory function
  math.factory = factory

  // import the factory functions like createAdd as an array instead of object,
  // else they will get a different naming (`createAdd` instead of `add`).
  if (factories) {
    math.import(Object.values(deepFlatten(factories)))
  }

  math.ArgumentsError = ArgumentsError
  math.DimensionError = DimensionError
  math.IndexError = IndexError

  return math
}
