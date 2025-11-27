import { ObjectWrappingMap, PartitionedMap } from './map.js'

/**
 * Create a new scope which can access the parent scope,
 * but does not affect it when written. This is suitable for variable definitions
 * within a block node, or function definition.
 *
 * If parent scope has a createSubScope method, it delegates to that. Otherwise,
 * creates an empty map, and copies the parent scope to it, adding in
 * the remaining `args`.
 *
 * @param parentScope - Parent scope
 * @param args - Arguments to add to the new scope
 * @returns PartitionedMap with parent and args
 */
export function createSubScope<K = any, V = any>(
  parentScope: Map<K, V>,
  args: Record<string, V>
): PartitionedMap<K, V> {
  return new PartitionedMap(
    parentScope,
    new ObjectWrappingMap(args) as unknown as Map<K, V>,
    new Set(Object.keys(args) as K[])
  )
}
