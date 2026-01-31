import { factory } from '../../../utils/factory.ts'
import type { TypedFunction, CallbackFunction } from '../types.ts'

/**
 * Typed-function signatures record type
 */
type SignaturesRecord = Record<string, CallbackFunction>

/**
 * Extended typed function with signatures property
 */
interface TypedFunctionWithSignatures extends CallbackFunction {
  signatures: SignaturesRecord
  name?: string
}

/**
 * Extended typed function interface with isTypedFunction method
 */
interface TypedWithChecker extends TypedFunction {
  isTypedFunction(fn: unknown): fn is TypedFunctionWithSignatures
}

interface TransformCallbackDependencies {
  typed: TypedFunction
}

const name = 'transformCallback'
const dependencies = ['typed']

export const createTransformCallback = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: TransformCallbackDependencies): (callback: CallbackFunction, numberOfArrays: number) => CallbackFunction => {
    const typedChecker = typed as TypedWithChecker

    /**
     * Transforms the given callback function based on its type and number of arrays.
     *
     * @param callback - The callback function to transform.
     * @param numberOfArrays - The number of arrays to pass to the callback function.
     * @returns The transformed callback function.
     */
    return function (callback: CallbackFunction, numberOfArrays: number): CallbackFunction {
      if (typedChecker.isTypedFunction(callback)) {
        return _transformTypedCallbackFunction(callback, numberOfArrays)
      } else {
        return _transformCallbackFunction(
          callback,
          callback.length,
          numberOfArrays
        )
      }
    }

    /**
     * Transforms the given typed callback function based on the number of arrays.
     *
     * @param typedFunction - The typed callback function to transform.
     * @param numberOfArrays - The number of arrays to pass to the callback function.
     * @returns The transformed callback function.
     */
    function _transformTypedCallbackFunction(
      typedFunction: TypedFunctionWithSignatures,
      numberOfArrays: number
    ): CallbackFunction {
      const signatures: SignaturesRecord = Object.fromEntries(
        Object.entries(typedFunction.signatures).map(
          ([signature, callbackFunction]): [string, CallbackFunction] => {
            const numberOfCallbackInputs = signature.split(',').length
            if (typedChecker.isTypedFunction(callbackFunction)) {
              return [
                signature,
                _transformTypedCallbackFunction(
                  callbackFunction,
                  numberOfArrays
                )
              ]
            } else {
              return [
                signature,
                _transformCallbackFunction(
                  callbackFunction,
                  numberOfCallbackInputs,
                  numberOfArrays
                )
              ]
            }
          }
        )
      )

      if (typeof typedFunction.name === 'string') {
        return typed(typedFunction.name, signatures) as CallbackFunction
      } else {
        return typed(signatures) as CallbackFunction
      }
    }
  }
)

/**
 * Transforms the callback function based on the number of callback inputs and arrays.
 * There are three cases:
 * 1. The callback function has N arguments.
 * 2. The callback function has N+1 arguments.
 * 3. The callback function has 2N+1 arguments.
 *
 * @param callbackFunction - The callback function to transform.
 * @param numberOfCallbackInputs - The number of callback inputs.
 * @param numberOfArrays - The number of arrays.
 * @returns The transformed callback function.
 */
function _transformCallbackFunction(
  callbackFunction: CallbackFunction,
  numberOfCallbackInputs: number,
  numberOfArrays: number
): CallbackFunction {
  if (numberOfCallbackInputs === numberOfArrays) {
    return callbackFunction
  } else if (numberOfCallbackInputs === numberOfArrays + 1) {
    return function (...args: unknown[]): unknown {
      const vals = args.slice(0, numberOfArrays)
      const idx = _transformDims(args[numberOfArrays] as number[])
      return callbackFunction(...vals, idx)
    }
  } else if (numberOfCallbackInputs > numberOfArrays + 1) {
    return function (...args: unknown[]): unknown {
      const vals = args.slice(0, numberOfArrays)
      const idx = _transformDims(args[numberOfArrays] as number[])
      const rest = args.slice(numberOfArrays + 1)
      return callbackFunction(...vals, idx, ...rest)
    }
  } else {
    return callbackFunction
  }
}

/**
 * Transforms the dimensions by adding 1 to each dimension.
 *
 * @param dims - The dimensions to transform.
 * @returns The transformed dimensions.
 */
function _transformDims(dims: number[]): number[] {
  return dims.map((dim: number) => dim + 1)
}
