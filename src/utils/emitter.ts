import Emitter from 'tiny-emitter'

export interface EmitterMixin {
  on: (event: string, callback: (...args: any[]) => void, context?: any) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
  once: (
    event: string,
    callback: (...args: any[]) => void,
    context?: any
  ) => void
  emit: (event: string, ...args: any[]) => void
}

/**
 * Extend given object with emitter functions `on`, `off`, `once`, `emit`
 * @param obj - Object to extend with emitter functions
 * @return The object with emitter methods
 */
export function mixin<T extends object>(obj: T): T & EmitterMixin {
  // create event emitter
  const emitter = new (Emitter as any)()

  // bind methods to obj (we don't want to expose the emitter.e Array...)
  const extendedObj = obj as T & EmitterMixin
  extendedObj.on = emitter.on.bind(emitter)
  extendedObj.off = emitter.off.bind(emitter)
  extendedObj.once = emitter.once.bind(emitter)
  extendedObj.emit = emitter.emit.bind(emitter)

  return extendedObj
}
