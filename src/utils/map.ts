import { getSafeProperty, isSafeProperty, setSafeProperty } from './customs.js'
import { isMap, isObject } from './is.js'

/**
 * A map facade on a bare object.
 *
 * The small number of methods needed to implement a scope,
 * forwarding on to the SafeProperty functions. Over time, the codebase
 * will stop using this method, as all objects will be Maps, rather than
 * more security prone objects.
 */
export class ObjectWrappingMap<K = string, V = any> implements Map<K, V> {
  wrappedObject: Record<string, V>
  readonly [Symbol.toStringTag]: string = 'ObjectWrappingMap'

  constructor(object: Record<string, V>) {
    this.wrappedObject = object
    this[Symbol.iterator] = this.entries
  }

  keys(): IterableIterator<K> {
    return Object.keys(this.wrappedObject)
      .filter(key => this.has(key as K))
      .values() as IterableIterator<K>
  }

  get(key: K): V | undefined {
    return getSafeProperty(this.wrappedObject, key as string)
  }

  set(key: K, value: V): this {
    setSafeProperty(this.wrappedObject, key as string, value)
    return this
  }

  has(key: K): boolean {
    return isSafeProperty(this.wrappedObject, key as string) && (key as string) in this.wrappedObject
  }

  entries(): IterableIterator<[K, V]> {
    return mapIterator(this.keys(), key => [key, this.get(key)!]) as IterableIterator<[K, V]>
  }

  *values(): IterableIterator<V> {
    for (const key of this.keys()) {
      yield this.get(key)!
    }
  }

  forEach(callback: (value: V, key: K, map: Map<K, V>) => void): void {
    for (const key of this.keys()) {
      callback(this.get(key)!, key, this)
    }
  }

  delete(key: K): boolean {
    if (isSafeProperty(this.wrappedObject, key as string)) {
      delete this.wrappedObject[key as string]
      return true
    }
    return false
  }

  clear(): void {
    for (const key of this.keys()) {
      this.delete(key)
    }
  }

  get size(): number {
    return Object.keys(this.wrappedObject).length
  }
}

/**
 * Create a map with two partitions: a and b.
 * The set with bKeys determines which keys/values are read/written to map b,
 * all other values are read/written to map a
 *
 * For example:
 *
 *   const a = new Map()
 *   const b = new Map()
 *   const p = new PartitionedMap(a, b, new Set(['x', 'y']))
 *
 * In this case, values `x` and `y` are read/written to map `b`,
 * all other values are read/written to map `a`.
 */
export class PartitionedMap<K = any, V = any> implements Map<K, V> {
  a: Map<K, V>
  b: Map<K, V>
  bKeys: Set<K>
  readonly [Symbol.toStringTag]: string = 'PartitionedMap'

  /**
   * @param a - Primary map
   * @param b - Secondary map
   * @param bKeys - Set of keys that should be read/written to map b
   */
  constructor(a: Map<K, V>, b: Map<K, V>, bKeys: Set<K>) {
    this.a = a
    this.b = b
    this.bKeys = bKeys

    this[Symbol.iterator] = this.entries
  }

  get(key: K): V | undefined {
    return this.bKeys.has(key)
      ? this.b.get(key)
      : this.a.get(key)
  }

  set(key: K, value: V): this {
    if (this.bKeys.has(key)) {
      this.b.set(key, value)
    } else {
      this.a.set(key, value)
    }
    return this
  }

  has(key: K): boolean {
    return this.b.has(key) || this.a.has(key)
  }

  keys(): IterableIterator<K> {
    return new Set([
      ...this.a.keys(),
      ...this.b.keys()
    ])[Symbol.iterator]()
  }

  *values(): IterableIterator<V> {
    for (const key of this.keys()) {
      yield this.get(key)!
    }
  }

  entries(): IterableIterator<[K, V]> {
    return mapIterator(this.keys(), key => [key, this.get(key)!]) as IterableIterator<[K, V]>
  }

  forEach(callback: (value: V, key: K, map: Map<K, V>) => void): void {
    for (const key of this.keys()) {
      callback(this.get(key)!, key, this)
    }
  }

  delete(key: K): boolean {
    return this.bKeys.has(key)
      ? this.b.delete(key)
      : this.a.delete(key)
  }

  clear(): void {
    this.a.clear()
    this.b.clear()
  }

  get size(): number {
    return [...this.keys()].length
  }
}

/**
 * Create a new iterator that maps over the provided iterator, applying a mapping function to each item
 */
function mapIterator<T, U>(it: Iterator<T>, callback: (value: T) => U): Iterator<U> {
  return {
    next: (): IteratorResult<U> => {
      const n = it.next()
      return n.done
        ? n as IteratorResult<U>
        : {
            value: callback(n.value),
            done: false
          }
    }
  }
}

/**
 * Creates an empty map, or whatever your platform's polyfill is.
 *
 * @returns an empty Map or Map like object.
 */
export function createEmptyMap<K = any, V = any>(): Map<K, V> {
  return new Map<K, V>()
}

/**
 * Creates a Map from the given object.
 *
 * @param mapOrObject - Map or object to convert
 * @returns Map instance
 */
export function createMap<K = any, V = any>(mapOrObject?: Map<K, V> | Record<string, V> | null): Map<K, V> {
  if (!mapOrObject) {
    return createEmptyMap<K, V>()
  }
  if (isMap(mapOrObject)) {
    return mapOrObject as Map<K, V>
  }
  if (isObject(mapOrObject)) {
    return new ObjectWrappingMap(mapOrObject as Record<string, V>) as unknown as Map<K, V>
  }

  throw new Error('createMap can create maps from objects or Maps')
}

/**
 * Unwraps a map into an object.
 *
 * @param map - Map to convert to object
 * @returns Plain object
 */
export function toObject<V = any>(map: Map<any, V>): Record<string, V> {
  if (map instanceof ObjectWrappingMap) {
    return map.wrappedObject
  }
  const object: Record<string, V> = {}
  for (const key of map.keys()) {
    const value = map.get(key)!
    setSafeProperty(object, key, value)
  }
  return object
}

/**
 * Copies the contents of key-value pairs from each `objects` in to `map`.
 *
 * Object is `objects` can be a `Map` or object.
 *
 * This is the `Map` analog to `Object.assign`.
 */
export function assign<K = any, V = any>(
  map: Map<K, V>,
  ...objects: (Map<K, V> | Record<string, V> | null | undefined)[]
): Map<K, V> {
  for (const args of objects) {
    if (!args) {
      continue
    }
    if (isMap(args)) {
      for (const key of (args as Map<K, V>).keys()) {
        map.set(key, (args as Map<K, V>).get(key)!)
      }
    } else if (isObject(args)) {
      for (const key of Object.keys(args)) {
        map.set(key as K, (args as Record<string, V>)[key])
      }
    }
  }
  return map
}
