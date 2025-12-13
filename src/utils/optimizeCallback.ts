import typed from '@danielsimonjr/typed-function'
import { get, arraySize } from './array.ts'
import { typeOf as _typeOf } from './is.ts'

// Type definitions
interface Matrix {
  isMatrix: boolean
  size(): number[]
  get(index: number[]): any
  dataType?: string
}

interface TypedFunction {
  (...args: any[]): any
  signatures: Record<string, Function>
  name: string
}

interface OptimizedCallback {
  isUnary: boolean
  fn: (...args: any[]) => any
}

/**
 * Simplifies a callback function by reducing its complexity and potentially improving its performance.
 *
 * @param callback - The original callback function to simplify.
 * @param array - The array that will be used with the callback function.
 * @param name - The name of the function that is using the callback.
 * @param isUnary - If true, the callback function is unary and will be optimized as such.
 * @returns Returns a simplified version of the callback function.
 */
export function optimizeCallback(
  callback: Function,
  array: any[] | Matrix,
  name: string,
  isUnary?: boolean
): OptimizedCallback {
  if ((typed as any).isTypedFunction(callback)) {
    let numberOfArguments: number | undefined
    if (isUnary) {
      numberOfArguments = 1
    } else {
      const size = (array as Matrix).isMatrix ? (array as Matrix).size() : arraySize(array as any[])

      // Check the size of the last dimension to see if the array/matrix is empty
      const isEmpty = size.length ? size[size.length - 1] === 0 : true
      if (isEmpty) {
        // don't optimize callbacks for empty arrays/matrix, as they will never be called
        // and in fact will throw an exception when we try to access the first element below
        return { isUnary: false, fn: callback as (...args: any[]) => any }
      }

      const firstIndex = size.map(() => 0)
      const firstValue = (array as Matrix).isMatrix ? (array as Matrix).get(firstIndex) : get(array as any[], firstIndex)
      numberOfArguments = _findNumberOfArgumentsTyped(callback as TypedFunction, firstValue, firstIndex, array)
    }
    let fastCallback: Function
    if ((array as Matrix).isMatrix && ((array as Matrix).dataType !== 'mixed' && (array as Matrix).dataType !== undefined)) {
      const singleSignature = _findSingleSignatureWithArity(callback as TypedFunction, numberOfArguments!)
      fastCallback = (singleSignature !== undefined) ? singleSignature : callback
    } else {
      fastCallback = callback
    }
    if (numberOfArguments! >= 1 && numberOfArguments! <= 3) {
      return {
        isUnary: numberOfArguments === 1,
        fn: (...args: any[]) => _tryFunctionWithArgs(fastCallback, args.slice(0, numberOfArguments), name, (callback as TypedFunction).name)
      }
    }
    return { isUnary: false, fn: (...args: any[]) => _tryFunctionWithArgs(fastCallback, args, name, (callback as TypedFunction).name) }
  }
  if (isUnary === undefined) {
    return { isUnary: _findIfCallbackIsUnary(callback), fn: callback as (...args: any[]) => any }
  } else {
    return { isUnary, fn: callback as (...args: any[]) => any }
  }
}

function _findSingleSignatureWithArity(callback: TypedFunction, arity: number): Function | undefined {
  const matchingFunctions: Function[] = []
  Object.entries(callback.signatures).forEach(([signature, func]) => {
    if (signature.split(',').length === arity) {
      matchingFunctions.push(func)
    }
  })
  if (matchingFunctions.length === 1) {
    return matchingFunctions[0]
  }
  return undefined
}

/**
 * Determines if a given callback function is unary (i.e., takes exactly one argument).
 *
 * This function checks the following conditions to determine if the callback is unary:
 * 1. The callback function should have exactly one parameter.
 * 2. The callback function should not use the `arguments` object.
 * 3. The callback function should not use rest parameters (`...`).
 * If in doubt, this function shall return `false` to be safe
 *
 * @param callback - The callback function to be checked.
 * @returns Returns `true` if the callback is unary, otherwise `false`.
 */
function _findIfCallbackIsUnary(callback: Function): boolean {
  if (callback.length !== 1) return false

  const callbackStr = callback.toString()
  // Check if the callback function uses `arguments`
  if (/arguments/.test(callbackStr)) return false

  // Extract the parameters of the callback function
  const paramsStr = callbackStr.match(/\(.*?\)/)
  // Check if the callback function uses rest parameters
  if (paramsStr && /\.\.\./.test(paramsStr[0])) return false
  return true
}

function _findNumberOfArgumentsTyped(
  callback: TypedFunction,
  value: any,
  index: number[],
  array: any[] | Matrix
): number | undefined {
  const testArgs = [value, index, array]
  for (let i = 3; i > 0; i--) {
    const args = testArgs.slice(0, i)
    if ((typed as any).resolve(callback, args) !== null) {
      return i
    }
  }
  return undefined
}

/**
 * @param func - The selected function taken from one of the signatures of the callback function
 * @param args - List with arguments to apply to the selected signature
 * @param mappingFnName - the name of the function that is using the callback
 * @param callbackName - the name of the callback function
 * @returns Returns the return value of the invoked signature
 * @throws Throws an error when no matching signature was found
 */
function _tryFunctionWithArgs(func: Function, args: any[], mappingFnName: string, callbackName: string): any {
  try {
    return func(...args)
  } catch (err) {
    _createCallbackError(err as Error, args, mappingFnName, callbackName)
  }
}

/**
 * Creates and throws a detailed TypeError when a callback function fails.
 *
 * @param err - The original error thrown by the callback function.
 * @param args - The arguments that were passed to the callback function.
 * @param mappingFnName - The name of the function that is using the callback.
 * @param callbackName - The name of the callback function.
 * @throws Throws a detailed TypeError with enriched error message.
 */
function _createCallbackError(err: Error, args: any[], mappingFnName: string, callbackName: string): never {
  // Enrich the error message so the user understands that it took place inside the callback function
  if (err instanceof TypeError && (err as any).data?.category === 'wrongType') {
    const argsDesc: string[] = []
    argsDesc.push(`value: ${_typeOf(args[0])}`)
    if (args.length >= 2) { argsDesc.push(`index: ${_typeOf(args[1])}`) }
    if (args.length >= 3) { argsDesc.push(`array: ${_typeOf(args[2])}`) }

    throw new TypeError(`Function ${mappingFnName} cannot apply callback arguments ` +
      `${callbackName}(${argsDesc.join(', ')}) at index ${JSON.stringify(args[1])}`)
  } else {
    throw new TypeError(`Function ${mappingFnName} cannot apply callback arguments ` +
      `to function ${callbackName}: ${err.message}`)
  }
}
