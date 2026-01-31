import { isBigNumber, isObject } from './is.ts'

/**
 * Clone an object
 *
 *     clone(x)
 *
 * Can clone any primitive type, array, and object.
 * If x has a function clone, this function will be invoked to clone the object.
 *
 * @param {*} x
 * @return {*} clone
 */
export function clone<T>(x: T): T {
  const type = typeof x

  // immutable primitive types
  if (
    type === 'number' ||
    type === 'bigint' ||
    type === 'string' ||
    type === 'boolean' ||
    x === null ||
    x === undefined
  ) {
    return x
  }

  // use clone function of the object when available
  const cloneable = x as { clone?: () => T }
  if (typeof cloneable.clone === 'function') {
    return cloneable.clone()
  }

  // array
  if (Array.isArray(x)) {
    return x.map((value) => clone(value)) as T
  }

  if (x instanceof Date) return new Date(x.valueOf()) as T
  if (isBigNumber(x)) return x as T // bignumbers are immutable

  // object
  if (isObject(x)) {
    return mapObject(x as Record<string, unknown>, clone) as T
  }

  if (type === 'function') {
    // we assume that the function is immutable
    return x
  }

  throw new TypeError(`Cannot clone: unknown type of value (value: ${x})`)
}

/**
 * Apply map to all properties of an object
 * @param {Object} object
 * @param {function} callback
 * @return {Object} Returns a copy of the object with mapped properties
 */
export function mapObject<T, U>(
  object: Record<string, T>,
  callback: (value: T) => U
): Record<string, U> {
  const clone: Record<string, U> = {}

  for (const key in object) {
    if (hasOwnProperty(object, key)) {
      clone[key] = callback(object[key])
    }
  }

  return clone
}

/**
 * Extend object a with the properties of object b
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 */
export function extend<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>
>(a: T, b: U): T & U {
  for (const prop in b) {
    if (hasOwnProperty(b, prop)) {
      ;(a as T & U)[prop as keyof U] = b[prop] as (T & U)[keyof U]
    }
  }
  return a as T & U
}

/**
 * Deep extend an object a with the properties of object b
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
export function deepExtend<T extends Record<string, unknown>>(
  a: T,
  b: Record<string, unknown>
): T {
  // TODO: add support for Arrays to deepExtend
  if (Array.isArray(b)) {
    throw new TypeError('Arrays are not supported by deepExtend')
  }

  for (const prop in b) {
    // We check against prop not being in Object.prototype or Function.prototype
    // to prevent polluting for example Object.__proto__.
    if (
      hasOwnProperty(b, prop) &&
      !(prop in Object.prototype) &&
      !(prop in Function.prototype)
    ) {
      const bValue = b[prop]
      const aValue = (a as Record<string, unknown>)[prop]
      if (bValue && (bValue as object).constructor === Object) {
        if (aValue === undefined) {
          ;(a as Record<string, unknown>)[prop] = {}
        }
        if (aValue && (aValue as object).constructor === Object) {
          deepExtend(aValue as Record<string, unknown>, bValue as Record<string, unknown>)
        } else {
          ;(a as Record<string, unknown>)[prop] = bValue
        }
      } else if (Array.isArray(bValue)) {
        throw new TypeError('Arrays are not supported by deepExtend')
      } else {
        ;(a as Record<string, unknown>)[prop] = bValue
      }
    }
  }
  return a
}

/**
 * Deep test equality of all fields in two pairs of arrays or objects.
 * Compares values and functions strictly (ie. 2 is not the same as '2').
 * @param {Array | Object} a
 * @param {Array | Object} b
 * @returns {boolean}
 */
export function deepStrictEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false
    }

    if (a.length !== b.length) {
      return false
    }

    for (let i = 0, len = a.length; i < len; i++) {
      if (!deepStrictEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  } else if (typeof a === 'function') {
    return a === b
  } else if (a instanceof Object) {
    if (Array.isArray(b) || !(b instanceof Object)) {
      return false
    }

    const objA = a as Record<string, unknown>
    const objB = b as Record<string, unknown>

    for (const prop in objA) {
      // noinspection JSUnfilteredForInLoop
      if (!(prop in objB) || !deepStrictEqual(objA[prop], objB[prop])) {
        return false
      }
    }
    for (const prop in objB) {
      // noinspection JSUnfilteredForInLoop
      if (!(prop in objA)) {
        return false
      }
    }
    return true
  } else {
    return a === b
  }
}

/**
 * Recursively flatten a nested object.
 * @param {Object} nestedObject
 * @return {Object} Returns the flattened object
 */
export function deepFlatten(
  nestedObject: Record<string, unknown>
): Record<string, unknown> {
  const flattenedObject: Record<string, unknown> = {}

  _deepFlatten(nestedObject, flattenedObject)

  return flattenedObject
}

// helper function used by deepFlatten
function _deepFlatten(
  nestedObject: Record<string, unknown>,
  flattenedObject: Record<string, unknown>
): void {
  for (const prop in nestedObject) {
    if (hasOwnProperty(nestedObject, prop)) {
      const value = nestedObject[prop]
      if (typeof value === 'object' && value !== null) {
        _deepFlatten(value as Record<string, unknown>, flattenedObject)
      } else {
        flattenedObject[prop] = value
      }
    }
  }
}

/**
 * Test whether the current JavaScript engine supports Object.defineProperty
 * @returns {boolean} returns true if supported
 */
export function canDefineProperty(): boolean {
  // test needed for broken IE8 implementation
  try {
    if (Object.defineProperty) {
      Object.defineProperty({}, 'x', {
        get: function () {
          return null
        }
      })
      return true
    }
  } catch {}

  return false
}

/**
 * Attach a lazy loading property to a constant.
 * The given function `fn` is called once when the property is first requested.
 *
 * @param {Object} object         Object where to add the property
 * @param {string} prop           Property name
 * @param {Function} valueResolver Function returning the property value. Called
 *                                without arguments.
 */
export function lazy<T>(
  object: Record<string, unknown>,
  prop: string,
  valueResolver: () => T
): void {
  let _uninitialized = true
  let _value: T

  Object.defineProperty(object, prop, {
    get: function () {
      if (_uninitialized) {
        _value = valueResolver()
        _uninitialized = false
      }
      return _value
    },

    set: function (value: T) {
      _value = value
      _uninitialized = false
    },

    configurable: true,
    enumerable: true
  })
}

/**
 * Traverse a path into an object.
 * When a namespace is missing, it will be created
 * @param {Object} object
 * @param {string | string[]} path   A dot separated string like 'name.space'
 * @return {Object} Returns the object at the end of the path
 */
export function traverse(
  object: Record<string, unknown>,
  path: string | string[]
): Record<string, unknown> {
  if (path && typeof path === 'string') {
    return traverse(object, path.split('.'))
  }

  let obj: Record<string, unknown> = object

  if (path) {
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      if (!(key in obj)) {
        obj[key] = {}
      }
      obj = obj[key] as Record<string, unknown>
    }
  }

  return obj
}

/**
 * A safe hasOwnProperty
 * @param {Object} object
 * @param {string} property
 */
export function hasOwnProperty(object: unknown, property: string): boolean {
  return !!object && Object.hasOwnProperty.call(object, property)
}

/**
 * Test whether an object is a factory. a factory has fields:
 *
 * - factory: function (type: Object, config: Object, load: function, typed: function [, math: Object])   (required)
 * - name: string (optional)
 * - path: string    A dot separated path (optional)
 * - math: boolean   If true (false by default), the math namespace is passed
 *                   as fifth argument of the factory function
 *
 * @param {*} object
 * @returns {boolean}
 */
export function isLegacyFactory(object: unknown): boolean {
  if (!object || typeof object !== 'object') return false
  const obj = object as { factory?: unknown }
  return typeof obj.factory === 'function'
}

/**
 * Get a nested property from an object
 * @param {Object} object
 * @param {string | string[]} path
 * @returns {Object}
 */
export function get(object: Record<string, unknown>, path: string | string[]): unknown {
  if (typeof path === 'string') {
    if (isPath(path)) {
      return get(object, path.split('.'))
    } else {
      return object[path]
    }
  }

  let child: unknown = object

  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    child = child ? (child as Record<string, unknown>)[key] : undefined
  }

  return child
}

/**
 * Set a nested property in an object
 * Mutates the object itself
 * If the path doesn't exist, it will be created
 * @param {Object} object
 * @param {string | string[]} path
 * @param {*} value
 * @returns {Object}
 */
export function set<T extends Record<string, unknown>>(
  object: T,
  path: string | string[],
  value: unknown
): T {
  if (typeof path === 'string') {
    if (isPath(path)) {
      return set(object, path.split('.'), value)
    } else {
      ;(object as Record<string, unknown>)[path] = value
      return object
    }
  }

  let child: Record<string, unknown> = object
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (child[key] === undefined) {
      child[key] = {}
    }
    child = child[key] as Record<string, unknown>
  }

  if (path.length > 0) {
    const lastKey = path[path.length - 1]
    child[lastKey] = value
  }

  return object
}

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} properties
 * @param {function} [transform] Optional value to transform a value when picking it
 * @return {Object}
 */
export function pick(
  object: Record<string, unknown>,
  properties: string[],
  transform?: (value: unknown, key: string) => unknown
): Record<string, unknown> {
  const copy: Record<string, unknown> = {}

  for (let i = 0; i < properties.length; i++) {
    const key = properties[i]
    const value = get(object, key)
    if (value !== undefined) {
      set(copy, key, transform ? transform(value, key) : value)
    }
  }

  return copy
}

/**
 * Shallow version of pick, creating an object composed of the picked object properties
 * but not for nested properties
 * @param {Object} object
 * @param {string[]} properties
 * @return {Object}
 */
export function pickShallow(
  object: Record<string, unknown>,
  properties: string[]
): Record<string, unknown> {
  const copy: Record<string, unknown> = {}

  for (let i = 0; i < properties.length; i++) {
    const key = properties[i]
    const value = object[key]
    if (value !== undefined) {
      copy[key] = value
    }
  }

  return copy
}

// helper function to test whether a string contains a path like 'user.name'
function isPath(str: string): boolean {
  return str.includes('.')
}
