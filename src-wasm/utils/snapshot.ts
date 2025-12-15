/**
 * This file contains helper methods to create expected snapshot structures
 * of both instance and ES6 exports.
 *
 * The files are located here and not under /test or /tools so it's transpiled
 * into ES5 code under /lib and can be used straight by node.js
 */
import assert from 'assert'
import * as allIsFunctions from './is.ts'
import { create } from '../core/create.ts'
import { endsWith } from './string.ts'

type TypeName = string

interface BundleStructure {
  [key: string]: TypeName | BundleStructure
}

interface ValidationIssue {
  actualType: TypeName
  expectedType: TypeName
  message: string
}

interface Factory {
  fn: string
  meta?: {
    isTransformFunction?: boolean
    formerly?: string
  }
}

interface Factories {
  [key: string]: Factory
}

interface SnapshotResult {
  expectedInstanceStructure: BundleStructure
  expectedES6Structure: BundleStructure
}

export const validateTypeOf = allIsFunctions.typeOf

export function validateBundle(
  expectedBundleStructure: BundleStructure,
  bundle: any
): void {
  const originalWarn = console.warn

  console.warn = function (...args: any[]): void {
    if (
      args.join(' ').includes('is moved to') &&
      args.join(' ').includes('Please use the new location instead')
    ) {
      // Ignore warnings like:
      // Warning: math.type.isNumber is moved to math.isNumber in v6.0.0. Please use the new location instead.
      return
    }

    originalWarn.apply(console, args)
  }

  try {
    const issues: ValidationIssue[] = []

    // see whether all expected functions and objects are there
    traverse(
      expectedBundleStructure,
      (expectedType: TypeName, path: (string | number)[]) => {
        const actualValue = get(bundle, path)
        const actualType = validateTypeOf(actualValue)

        const message =
          actualType === 'undefined'
            ? 'Missing entry in bundle. ' +
              `Path: ${JSON.stringify(path)}, expected type: ${expectedType}, actual type: ${actualType}`
            : 'Unexpected entry type in bundle. ' +
              `Path: ${JSON.stringify(path)}, expected type: ${expectedType}, actual type: ${actualType}`

        if (actualType !== expectedType) {
          issues.push({ actualType, expectedType, message })

          console.warn(message)
        }
      }
    )

    // see whether there are any functions or objects that shouldn't be there
    traverse(bundle, (actualValue: any, path: (string | number)[]) => {
      const actualType = validateTypeOf(actualValue)
      const expectedType = get(expectedBundleStructure, path) || 'undefined'

      // FIXME: ugly to have these special cases
      if (path.join('.').includes('docs.')) {
        // ignore the contents of docs
        return
      }
      if (path.join('.').includes('all.')) {
        // ignore the contents of all dependencies
        return
      }

      const message =
        expectedType === 'undefined'
          ? 'Unknown entry in bundle. ' +
            'Is there a new function added which is missing in this snapshot test? ' +
            `Path: ${JSON.stringify(path)}, expected type: ${expectedType}, actual type: ${actualType}`
          : 'Unexpected entry type in bundle. ' +
            `Path: ${JSON.stringify(path)}, expected type: ${expectedType}, actual type: ${actualType}`

      if (actualType !== expectedType) {
        issues.push({ actualType, expectedType, message })

        console.warn(message)
      }
    })

    // assert on the first issue (if any)
    if (issues.length > 0) {
      const { actualType, expectedType, message } = issues[0]

      console.warn(`${issues.length} bundle issues found`)

      assert.strictEqual(actualType, expectedType, message)
    }
  } finally {
    console.warn = originalWarn
  }
}

/**
 * Based on an object with factory functions, create the expected
 * structures for ES6 export and a mathjs instance.
 * @param factories - Object containing factory functions
 * @return Object with expectedInstanceStructure and expectedES6Structure
 */
export function createSnapshotFromFactories(
  factories: Factories
): SnapshotResult {
  const math = create(factories as any)

  const allFactoryFunctions: BundleStructure = {}
  const allFunctionsConstantsClasses: BundleStructure = {}
  const allFunctionsConstants: BundleStructure = {}
  const allTransformFunctions: BundleStructure = {}
  const allDependencyCollections: BundleStructure = {}
  const allClasses: BundleStructure = {}
  const allNodeClasses: BundleStructure = {}

  Object.keys(factories).forEach((factoryName) => {
    const factory = factories[factoryName]
    const name = factory.fn
    const isTransformFunction = factory.meta && factory.meta.isTransformFunction
    const isClass =
      !isLowerCase(name[0]) && validateTypeOf(math[name]) === 'function'
    const dependenciesName =
      factory.fn + (isTransformFunction ? 'Transform' : '') + 'Dependencies'
    const former = factory.meta?.formerly ?? ''

    allFactoryFunctions[factoryName] = 'function'
    allFunctionsConstantsClasses[name] = validateTypeOf(math[name])
    if (former) {
      allFunctionsConstantsClasses[former] = allFunctionsConstantsClasses[name]
    }
    allDependencyCollections[dependenciesName] = 'Object'

    if (isTransformFunction) {
      allTransformFunctions[name] = 'function'
      if (former) allTransformFunctions[former] = 'function'
    }

    if (isClass) {
      if (endsWith(name, 'Node')) {
        allNodeClasses[name] = 'function'
      } else {
        allClasses[name] = 'function'
      }
    } else {
      allFunctionsConstants[name] = validateTypeOf(math[name])
      if (former) allFunctionsConstants[former] = allFunctionsConstants[name]
    }
  })

  let embeddedDocs: BundleStructure = {}
  Object.keys(factories).forEach((factoryName) => {
    const factory = factories[factoryName]
    const name = factory.fn

    if (isLowerCase(factory.fn[0])) {
      // ignore class names starting with upper case
      embeddedDocs[name] = 'Object'
    }
  })
  embeddedDocs = exclude(embeddedDocs, [
    'equalScalar',
    'addScalar',
    'subtractScalar',
    'multiplyScalar',
    'print',
    'divideScalar',
    'parse',
    'compile',
    'parser',
    'chain',
    'coulomb',
    'reviver',
    'replacer'
  ])

  const allTypeChecks: BundleStructure = {}
  Object.keys(allIsFunctions).forEach((name) => {
    if (name.indexOf('is') === 0) {
      allTypeChecks[name] = 'function'
    }
  })

  const allErrorClasses: BundleStructure = {
    ArgumentsError: 'function',
    DimensionError: 'function',
    IndexError: 'function'
  }

  const expectedInstanceStructure: BundleStructure = {
    ...allFunctionsConstantsClasses,

    on: 'function',
    off: 'function',
    once: 'function',
    emit: 'function',
    import: 'function',
    config: 'function',
    create: 'function',
    factory: 'function',

    ...allTypeChecks,
    ...allErrorClasses,

    expression: {
      transform: {
        ...allTransformFunctions
      },
      mathWithTransform: {
        // note that we don't have classes here,
        // only functions and constants are allowed in the editor
        ...exclude(allFunctionsConstants, ['chain']),
        config: 'function'
      }
    }
  }

  const expectedES6Structure: BundleStructure = {
    // functions
    ...exclude(allFunctionsConstantsClasses, [
      'E',
      'false',
      'Infinity',
      'NaN',
      'null',
      'PI',
      'true'
    ]),
    create: 'function',
    config: 'function',
    factory: 'function',
    _true: 'boolean',
    _false: 'boolean',
    _null: 'null',
    _Infinity: 'number',
    _NaN: 'number',

    ...allTypeChecks,
    ...allErrorClasses,
    ...allDependencyCollections,
    ...allFactoryFunctions,

    docs: embeddedDocs
  }

  return {
    expectedInstanceStructure,
    expectedES6Structure
  }
}

function traverse(
  obj: any,
  callback: (value: any, path: (string | number)[]) => void = () => {},
  path: (string | number)[] = []
): void {
  // FIXME: ugly to have these special cases
  if (path.length > 0 && path[0].toString().includes('Dependencies')) {
    // special case for objects holding a collection of dependencies
    callback(obj, path)
  } else if (validateTypeOf(obj) === 'Array') {
    obj.map((item: any, index: number) =>
      traverse(item, callback, path.concat(index))
    )
  } else if (validateTypeOf(obj) === 'Object') {
    Object.keys(obj).forEach((key) => {
      // FIXME: ugly to have these special cases
      // ignore special case of deprecated docs
      if (key === 'docs' && path.join('.') === 'expression') {
        return
      }

      traverse(obj[key], callback, path.concat(key))
    })
  } else {
    callback(obj, path)
  }
}

function get(object: any, path: (string | number)[]): any {
  let child = object

  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    child = child ? child[key] : undefined
  }

  return child
}

/**
 * Create a copy of the provided `object` and delete
 * all properties listed in `excludedProperties`
 * @param object - Object to filter
 * @param excludedProperties - Array of property names to exclude
 * @return Filtered object
 */
function exclude(
  object: BundleStructure,
  excludedProperties: string[]
): BundleStructure {
  const strippedObject = Object.assign({}, object)

  excludedProperties.forEach((excludedProperty) => {
    delete strippedObject[excludedProperty]
  })

  return strippedObject
}

function isLowerCase(text: string): boolean {
  return typeof text === 'string' && text.toLowerCase() === text
}
