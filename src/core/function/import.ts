import {
  isBigNumber,
  isComplex,
  isFraction,
  isMatrix,
  isObject,
  isUnit
} from '../../utils/is.ts'
import {
  isFactory,
  stripOptionalNotation,
  FactoryFunction,
  FactoryMeta
} from '../../utils/factory.ts'
import { hasOwnProperty, lazy } from '../../utils/object.ts'
import { ArgumentsError } from '../../error/ArgumentsError.ts'
import type { TypedFunction } from './typed.ts'

/**
 * Options for the import function
 */
export interface ImportOptions {
  /** If true, existing functions will be overwritten. False by default. */
  override?: boolean
  /** If true, the function will not throw errors on duplicates or invalid types. False by default. */
  silent?: boolean
  /** If true, the functions will be wrapped in a wrapper function which converts data types. */
  wrap?: boolean
}

/**
 * A function with an optional typed-function signature
 */
interface FunctionWithSignature extends Function {
  signature?: string
  transform?: Function
}

/**
 * The math namespace object that functions are imported into
 */
interface MathNamespace {
  [key: string]: unknown
  expression: {
    transform: Record<string, unknown>
    mathWithTransform: Record<string, unknown>
  }
  Unit?: {
    isValuelessUnit: (name: string) => boolean
  }
  emit: (event: string, name: string, resolver: () => unknown) => void
}

/**
 * A value that can be imported into the math namespace
 */
type ImportableValue =
  | Function
  | number
  | string
  | boolean
  | null
  | object
  | unknown[]

export function importFactory(
  typed: TypedFunction,
  load: (factory: FactoryFunction) => unknown,
  math: MathNamespace,
  importedFactories: Record<string, FactoryFunction>
): (functions: unknown, options?: ImportOptions) => void {
  /**
   * Import functions from an object or a module.
   *
   * This function is only available on a mathjs instance created using `create`.
   *
   * Syntax:
   *
   *    math.import(functions)
   *    math.import(functions, options)
   *
   * Where:
   *
   * - `functions: Object`
   *   An object with functions or factories to be imported.
   * - `options: Object` An object with import options. Available options:
   *   - `override: boolean`
   *     If true, existing functions will be overwritten. False by default.
   *   - `silent: boolean`
   *     If true, the function will not throw errors on duplicates or invalid
   *     types. False by default.
   *   - `wrap: boolean`
   *     If true, the functions will be wrapped in a wrapper function
   *     which converts data types like Matrix to primitive data types like Array.
   *     The wrapper is needed when extending math.js with libraries which do not
   *     support these data type. False by default.
   *
   * Examples:
   *
   *    import { create, all } from 'mathjs'
   *    import * as numbers from 'numbers'
   *
   *    // create a mathjs instance
   *    const math = create(all)
   *
   *    // define new functions and variables
   *    math.import({
   *      myvalue: 42,
   *      hello: function (name) {
   *        return 'hello, ' + name + '!'
   *      }
   *    })
   *
   *    // use the imported function and variable
   *    math.myvalue * 2               // 84
   *    math.hello('user')             // 'hello, user!'
   *
   *    // import the npm module 'numbers'
   *    // (must be installed first with `npm install numbers`)
   *    math.import(numbers, {wrap: true})
   *
   *    math.fibonacci(7) // returns 13
   *
   * @param {Object | Array} functions  Object with functions to be imported.
   * @param {Object} [options]          Import options.
   */
  function mathImport(
    functions: unknown,
    options?: ImportOptions
  ): void {
    const num = arguments.length
    if (num !== 1 && num !== 2) {
      throw new ArgumentsError('import', num, 1, 2)
    }

    const opts: ImportOptions = options || {}

    function flattenImports(
      flatValues: Record<string, unknown>,
      value: unknown,
      name: string | undefined
    ): void {
      if (Array.isArray(value)) {
        value.forEach((item) => flattenImports(flatValues, item, undefined))
      } else if (isObject(value) || isModule(value)) {
        const objValue = value as Record<string, unknown>
        for (const propName in objValue) {
          if (hasOwnProperty(objValue, propName)) {
            flattenImports(flatValues, objValue[propName], propName)
          }
        }
      } else if (isFactory(value) || name !== undefined) {
        const flatName = isFactory(value)
          ? isTransformFunctionFactory(value)
            ? value.fn + '.transform' // TODO: this is ugly
            : value.fn
          : (name as string)

        // we allow importing the same function twice if it points to the same implementation
        if (
          hasOwnProperty(flatValues, flatName) &&
          flatValues[flatName] !== value &&
          !opts.silent
        ) {
          throw new Error('Cannot import "' + flatName + '" twice')
        }

        flatValues[flatName] = value
      } else {
        if (!opts.silent) {
          throw new TypeError('Factory, Object, or Array expected')
        }
      }
    }

    const flatValues: Record<string, unknown> = {}
    flattenImports(flatValues, functions, undefined)

    for (const name in flatValues) {
      if (hasOwnProperty(flatValues, name)) {
        // console.log('import', name)
        const value = flatValues[name]

        if (isFactory(value)) {
          // we ignore name here and enforce the name of the factory
          // maybe at some point we do want to allow overriding it
          // in that case we can implement an option overrideFactoryNames: true
          _importFactory(value, opts)
        } else if (isSupportedType(value)) {
          _import(name, value as ImportableValue, opts)
        } else {
          if (!opts.silent) {
            throw new TypeError('Factory, Object, or Array expected')
          }
        }
      }
    }
  }

  /**
   * Add a property to the math namespace
   * @param name - The name of the property to add
   * @param value - The value to add
   * @param options - Import options
   * @private
   */
  function _import(
    name: string,
    value: ImportableValue,
    options: ImportOptions
  ): void {
    // TODO: refactor this function, it's to complicated and contains duplicate code
    let importValue: unknown = value
    if (options.wrap && typeof importValue === 'function') {
      // create a wrapper around the function
      importValue = _wrap(importValue)
    }

    // turn a plain function with a typed-function signature into a typed-function
    if (hasTypedFunctionSignature(importValue)) {
      const fnWithSig = importValue as FunctionWithSignature
      importValue = typed(name, {
        [fnWithSig.signature as string]: fnWithSig
      })
    }

    const existingValue = math[name]
    if (typed.isTypedFunction(existingValue) && typed.isTypedFunction(importValue)) {
      const typedImportValue = importValue as TypedFunction
      if (options.override) {
        // give the typed function the right name
        importValue = typed(name, typedImportValue.signatures)
      } else {
        // merge the existing and typed function
        importValue = typed(existingValue as TypedFunction, typedImportValue)
      }

      math[name] = importValue
      delete importedFactories[name]

      _importTransform(name, importValue)
      math.emit('import', name, function resolver() {
        return importValue
      })
      return
    }

    const isDefined = math[name] !== undefined
    const isValuelessUnit = math.Unit?.isValuelessUnit(name)
    if ((!isDefined && !isValuelessUnit) || options.override) {
      math[name] = importValue
      delete importedFactories[name]

      _importTransform(name, importValue)
      math.emit('import', name, function resolver() {
        return importValue
      })
      return
    }

    if (!options.silent) {
      throw new Error('Cannot import "' + name + '": already exists')
    }
  }

  function _importTransform(name: string, value: unknown): void {
    const valueWithTransform = value as { transform?: Function }
    if (valueWithTransform && typeof valueWithTransform.transform === 'function') {
      math.expression.transform[name] = valueWithTransform.transform
      if (allowedInExpressions(name)) {
        math.expression.mathWithTransform[name] = valueWithTransform.transform
      }
    } else {
      // remove existing transform
      delete math.expression.transform[name]
      if (allowedInExpressions(name)) {
        math.expression.mathWithTransform[name] = value
      }
    }
  }

  function _deleteTransform(name: string): void {
    delete math.expression.transform[name]
    if (allowedInExpressions(name)) {
      math.expression.mathWithTransform[name] = math[name]
    } else {
      delete math.expression.mathWithTransform[name]
    }
  }

  /**
   * Create a wrapper around a function which converts the arguments
   * to their primitive values (like convert a Matrix to Array)
   * @param fn - The function to wrap
   * @returns The wrapped function
   * @private
   */
  function _wrap(fn: FunctionWithSignature): FunctionWithSignature {
    const wrapper = function wrapper(
      this: unknown,
      ...fnArgs: unknown[]
    ): unknown {
      const args: unknown[] = []
      for (let i = 0, len = fnArgs.length; i < len; i++) {
        const arg = fnArgs[i] as { valueOf?: () => unknown }
        args[i] = arg && arg.valueOf ? arg.valueOf() : arg
      }
      return fn.apply(math, args)
    }

    if (fn.transform) {
      wrapper.transform = fn.transform
    }

    return wrapper
  }

  /**
   * Import an instance of a factory into math.js
   * @param factory - The factory function to import
   * @param options - Import options
   * @param name - Optional custom name (defaults to factory.fn)
   * @private
   */
  function _importFactory(
    factory: FactoryFunction,
    options: ImportOptions,
    name: string = factory.fn
  ): void {
    if (name.includes('.')) {
      throw new Error(
        'Factory name should not contain a nested path. ' +
          'Name: ' +
          JSON.stringify(name)
      )
    }

    const namespace: Record<string, unknown> = isTransformFunctionFactory(
      factory
    )
      ? math.expression.transform
      : math

    const existingTransform = name in math.expression.transform
    const existing = hasOwnProperty(namespace, name) ? namespace[name] : undefined

    const resolver = function (): unknown {
      // collect all dependencies, handle finding both functions and classes and other special cases
      const dependencies: Record<string, unknown> = {}
      factory.dependencies.map(stripOptionalNotation).forEach((dependency) => {
        if (dependency.includes('.')) {
          throw new Error(
            'Factory dependency should not contain a nested path. ' +
              'Name: ' +
              JSON.stringify(dependency)
          )
        }

        if (dependency === 'math') {
          dependencies.math = math
        } else if (dependency === 'mathWithTransform') {
          dependencies.mathWithTransform = math.expression.mathWithTransform
        } else if (dependency === 'classes') {
          // special case for json reviver
          dependencies.classes = math
        } else {
          dependencies[dependency] = math[dependency]
        }
      })

      const instance = /* #__PURE__ */ factory(dependencies)

      const instanceWithTransform = instance as { transform?: Function }
      if (
        instanceWithTransform &&
        typeof instanceWithTransform.transform === 'function'
      ) {
        throw new Error(
          'Transforms cannot be attached to factory functions. ' +
            'Please create a separate function for it with export const path = "expression.transform"'
        )
      }

      if (existing === undefined || options.override) {
        return instance
      }

      if (typed.isTypedFunction(existing) && typed.isTypedFunction(instance)) {
        // merge the existing and new typed function
        return typed(existing as TypedFunction, instance as TypedFunction)
      }

      if (options.silent) {
        // keep existing, ignore imported function
        return existing
      } else {
        throw new Error('Cannot import "' + name + '": already exists')
      }
    }

    const meta = factory.meta as FactoryMeta | undefined
    const former = meta?.formerly ?? ''
    const needsTransform =
      isTransformFunctionFactory(factory) || factoryAllowedInExpressions(factory)
    const withTransform = math.expression.mathWithTransform

    // TODO: add unit test with non-lazy factory
    if (!meta || meta.lazy !== false) {
      lazy(namespace, name, resolver)
      if (former) lazy(namespace, former, resolver)

      // FIXME: remove the `if (existing &&` condition again. Can we make sure subset is loaded before subset.transform? (Name collision, and no dependencies between the two)
      if (existing && existingTransform) {
        _deleteTransform(name)
        if (former) _deleteTransform(former)
      } else {
        if (needsTransform) {
          lazy(withTransform, name, () => namespace[name])
          if (former) lazy(withTransform, former, () => namespace[name])
        }
      }
    } else {
      namespace[name] = resolver()
      if (former) namespace[former] = namespace[name]

      // FIXME: remove the `if (existing &&` condition again. Can we make sure subset is loaded before subset.transform? (Name collision, and no dependencies between the two)
      if (existing && existingTransform) {
        _deleteTransform(name)
        if (former) _deleteTransform(former)
      } else {
        if (needsTransform) {
          lazy(withTransform, name, () => namespace[name])
          if (former) lazy(withTransform, former, () => namespace[name])
        }
      }
    }

    // TODO: improve factories, store a list with imports instead which can be re-played
    importedFactories[name] = factory

    math.emit('import', name, resolver)
  }

  /**
   * Check whether given object is a type which can be imported
   * @param object - The object to check
   * @returns true if the object can be imported
   * @private
   */
  function isSupportedType(object: unknown): object is ImportableValue {
    return (
      typeof object === 'function' ||
      typeof object === 'number' ||
      typeof object === 'string' ||
      typeof object === 'boolean' ||
      object === null ||
      isUnit(object) ||
      isComplex(object) ||
      isBigNumber(object) ||
      isFraction(object) ||
      isMatrix(object) ||
      Array.isArray(object)
    )
  }

  function isModule(object: unknown): object is Record<string, unknown> {
    return (
      typeof object === 'object' &&
      object !== null &&
      (object as Record<symbol, unknown>)[Symbol.toStringTag] === 'Module'
    )
  }

  function hasTypedFunctionSignature(fn: unknown): fn is FunctionWithSignature {
    return typeof fn === 'function' && typeof (fn as FunctionWithSignature).signature === 'string'
  }

  function allowedInExpressions(name: string): boolean {
    return !hasOwnProperty(unsafe, name)
  }

  function factoryAllowedInExpressions(factory: FactoryFunction): boolean {
    const meta = factory.meta as FactoryMeta | undefined
    return (
      !factory.fn.includes('.') && // FIXME: make checking on path redundant, check on meta data instead
      !hasOwnProperty(unsafe, factory.fn) &&
      (!meta || !meta.isClass)
    )
  }

  function isTransformFunctionFactory(factory: FactoryFunction): boolean {
    const meta = factory.meta as FactoryMeta | undefined
    return meta?.isTransformFunction === true
  }

  // namespaces and functions not available in the parser for safety reasons
  const unsafe = {
    expression: true,
    type: true,
    docs: true,
    error: true,
    json: true,
    chain: true // chain method not supported. Note that there is a unit chain too.
  }

  return mathImport
}
