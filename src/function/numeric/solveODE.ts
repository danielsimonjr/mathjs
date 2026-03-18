import { isUnit, isNumber, isBigNumber } from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'
import type {
  MathNumericType,
  MathArray,
  Matrix,
  Unit,
  BigNumber
} from '../../types.ts'

// Minimum y0 vector size for WASM acceleration to be beneficial
const WASM_ODE_THRESHOLD = 10

const name = 'solveODE'
const dependencies = [
  'typed',
  'add',
  'subtract',
  'multiply',
  'divide',
  'max',
  'map',
  'abs',
  'isPositive',
  'isNegative',
  'larger',
  'smaller',
  'matrix',
  'bignumber',
  'unaryMinus'
] as const

/**
 * Butcher Tableau structure for Runge-Kutta methods
 */
interface ButcherTableau {
  a: number[][] | BigNumber[][]
  c: (number | null)[] | (BigNumber | null)[]
  b: number[] | BigNumber[]
  bp: number[] | BigNumber[]
}

/**
 * Options for ODE solver
 */
interface ODEOptions {
  method?: 'RK23' | 'RK45'
  tol?: number
  firstStep?: number | Unit
  minStep?: number | Unit
  maxStep?: number | Unit
  minDelta?: number
  maxDelta?: number
  maxIter?: number
}

/**
 * Solution result from ODE solver
 */
interface ODESolution<T = any> {
  t: T[]
  y: T[]
}

/**
 * Forcing function type for ODE
 */
type ForcingFunction = (
  t: MathNumericType,
  y: MathNumericType | MathArray
) => MathNumericType | MathArray

export const createSolveODE = /* #__PURE__ */ factory(
  name,
  dependencies as unknown as string[],
  ({
    typed,
    add,
    subtract,
    multiply,
    divide,
    max,
    map,
    abs,
    isPositive,
    isNegative,
    larger,
    smaller,
    matrix,
    bignumber,
    unaryMinus
  }) => {
    /**
     * Numerical Integration of Ordinary Differential Equations
     *
     * Two variable step methods are provided:
     * - "RK23": Bogacki–Shampine method
     * - "RK45": Dormand-Prince method RK5(4)7M (default)
     *
     * The arguments are expected as follows.
     *
     * - `func` should be the forcing function `f(t, y)`
     * - `tspan` should be a vector of two numbers or units `[tStart, tEnd]`
     * - `y0` the initial state values, should be a scalar or a flat array
     * - `options` should be an object with the following information:
     *   - `method` ('RK45'): ['RK23', 'RK45']
     *   - `tol` (1e-3): Numeric tolerance of the method, the solver keeps the error estimates less than this value
     *   - `firstStep`: Initial step size
     *   - `minStep`: minimum step size of the method
     *   - `maxStep`: maximum step size of the method
     *   - `minDelta` (0.2): minimum ratio of change for the step
     *   - `maxDelta` (5): maximum ratio of change for the step
     *   - `maxIter` (1e4): maximum number of iterations
     *
     * The returned value is an object with `{t, y}` please note that even though `t` means time, it can represent any other independant variable like `x`:
     * - `t` an array of size `[n]`
     * - `y` the states array can be in two ways
     *   - **if `y0` is a scalar:** returns an array-like of size `[n]`
     *   - **if `y0` is a flat array-like of size [m]:** returns an array like of size `[n, m]`
     *
     * Syntax:
     *
     *     math.solveODE(func, tspan, y0)
     *     math.solveODE(func, tspan, y0, options)
     *
     * Examples:
     *
     *     function func(t, y) {return y}
     *     const tspan = [0, 4]
     *     const y0 = 1
     *     math.solveODE(func, tspan, y0)
     *     math.solveODE(func, tspan, [1, 2])
     *     math.solveODE(func, tspan, y0, { method:"RK23", maxStep:0.1 })
     *
     * See also:
     *
     *     derivative, simplifyCore
     *
     * @param {function} func The forcing function f(t,y)
     * @param {Array | Matrix} tspan The time span
     * @param {number | BigNumber | Unit | Array | Matrix} y0 The initial value
     * @param {Object} [options] Optional configuration options
     * @return {Object} Return an object with t and y values as arrays
     */

    /**
     * Check if y0 is a plain number array suitable for WASM acceleration
     */
    function _isPlainNumberArray(y0: any[]): boolean {
      if (!Array.isArray(y0) || y0.length < WASM_ODE_THRESHOLD) return false
      for (let i = 0; i < y0.length; i++) {
        if (typeof y0[i] !== 'number') return false
      }
      return true
    }

    /**
     * WASM-accelerated Runge-Kutta inner loop for plain number vector ODEs.
     *
     * Accelerates the vector arithmetic (weighted sums for stage computation,
     * solution update, and error estimation) while still calling the JS
     * callback f(t, y) for each stage evaluation.
     *
     * Returns null if WASM is unavailable, signaling fallback to JS path.
     */
    function _rkWasmLoop(
      f: ForcingFunction,
      tspan: any[],
      y0: number[],
      options: ODEOptions,
      butcherTableau: ButcherTableau
    ): ODESolution | null {
      const wasm = wasmLoader.getModule()
      if (!wasm) return null

      const dim = y0.length // dimension of state vector
      const a = butcherTableau.a as number[][]
      const c = butcherTableau.c as (number | null)[]
      const b = butcherTableau.b as number[]
      const bp = butcherTableau.bp as number[]
      const numStages = c.length

      const t0 = tspan[0] as number
      const tf = tspan[1] as number
      const isForwards = tf > t0
      const steps = 1
      const tol = options.tol ? options.tol : 1e-4
      const minDelta = options.minDelta ? options.minDelta : 0.2
      const maxDelta = options.maxDelta ? options.maxDelta : 5
      const maxIter = options.maxIter ? options.maxIter : 10_000

      let h = options.firstStep
        ? isForwards
          ? (options.firstStep as number)
          : -(options.firstStep as number)
        : (tf - t0) / steps

      const maxStepVal = options.maxStep as number | undefined
      const minStepVal = options.minStep as number | undefined

      // Compute deltaB = b - bp
      const deltaB = new Float64Array(numStages)
      for (let i = 0; i < numStages; i++) {
        deltaB[i] = b[i] - bp[i]
      }

      // Allocate WASM buffers:
      // - yPtr: current state (dim)
      // - yNewPtr: next state (dim)
      // - errorPtr: error vector (dim)
      // - tempPtr: temporary for weighted sums (dim)
      // - stagePtr: k values for all stages (numStages * dim)
      const yAlloc = wasmLoader.allocateFloat64Array(y0)
      const yNewAlloc = wasmLoader.allocateFloat64ArrayEmpty(dim)
      const errorAlloc = wasmLoader.allocateFloat64ArrayEmpty(dim)
      const tempAlloc = wasmLoader.allocateFloat64ArrayEmpty(dim)
      const stageAlloc = wasmLoader.allocateFloat64ArrayEmpty(numStages * dim)

      try {
        const t: number[] = [t0]
        const y: number[][] = [y0.slice()]

        let n = 0
        let iter = 0

        // Helper to read back a vector from WASM memory
        function readVec(alloc: { ptr: number; array: Float64Array }): number[] {
          // Re-create view in case memory grew
          const arr = new Float64Array(wasm!.memory.buffer, alloc.ptr, dim)
          const result: number[] = new Array(dim)
          for (let i = 0; i < dim; i++) {
            result[i] = arr[i]
          }
          return result
        }

        // Helper to write a JS array into a WASM allocation
        function writeVec(alloc: { ptr: number; array: Float64Array }, data: number[]): void {
          const arr = new Float64Array(wasm!.memory.buffer, alloc.ptr, dim)
          for (let i = 0; i < dim; i++) {
            arr[i] = data[i]
          }
        }

        // Helper to write k[stageIdx] into the stage buffer
        function writeStage(stageIdx: number, data: number[]): void {
          const offset = stageIdx * dim
          const arr = new Float64Array(wasm!.memory.buffer, stageAlloc.ptr, numStages * dim)
          for (let i = 0; i < dim; i++) {
            arr[offset + i] = data[i]
          }
        }

        // Helper to read stage from WASM
        function readStage(stageIdx: number): number[] {
          const offset = stageIdx * dim
          const arr = new Float64Array(wasm!.memory.buffer, stageAlloc.ptr, numStages * dim)
          const result: number[] = new Array(dim)
          for (let i = 0; i < dim; i++) {
            result[i] = arr[offset + i]
          }
          return result
        }

        // Trim step to not overshoot
        function trimStepNum(tn: number, tfn: number, hn: number): number {
          const next = tn + hn
          if (isForwards ? next > tfn : next < tfn) {
            return tfn - tn
          }
          return hn
        }

        // Ongoing check
        function ongoing(tn: number, tfn: number): boolean {
          return isForwards ? tn < tfn : tn > tfn
        }

        while (ongoing(t[n], tf)) {
          // Trim step
          h = trimStepNum(t[n], tf, h)

          // Write current y[n] into WASM
          writeVec(yAlloc, y[n])

          // Stage 0: k[0] = f(t[n], y[n])
          const k0 = f(t[n], y[n]) as number[]
          writeStage(0, k0)

          // Stages 1..numStages-1
          for (let s = 1; s < numStages; s++) {
            // Compute y_stage = y[n] + h * sum(a[s][j] * k[j], j=0..s-1)
            // Start with a copy of y[n]
            wasm.vectorCopy(yAlloc.ptr, dim, tempAlloc.ptr)

            // Accumulate weighted k contributions using WASM vectorScale + vectorAdd
            for (let j = 0; j < a[s].length; j++) {
              const aCoeff = a[s][j]
              if (aCoeff === 0) continue

              // Get pointer to k[j] within stageAlloc (offset j*dim)
              const kjPtr = stageAlloc.ptr + j * dim * 8

              // temp = temp + h * a[s][j] * k[j]
              // Use yNewAlloc as scratch for scaled k
              wasm.vectorScale(kjPtr, h * aCoeff, dim, yNewAlloc.ptr)
              wasm.vectorAdd(tempAlloc.ptr, yNewAlloc.ptr, dim, tempAlloc.ptr)
            }

            // Call JS callback with the computed stage state
            const tStage = t[n] + (c[s] as number) * h
            const yStage = readVec(tempAlloc)
            const ks = f(tStage, yStage) as number[]
            writeStage(s, ks)
          }

          // Compute yNew = y[n] + h * sum(b[i] * k[i])
          // and error = sum(deltaB[i] * k[i]) (then take abs max)
          wasm.vectorCopy(yAlloc.ptr, dim, yNewAlloc.ptr)

          // Zero out errorAlloc (create fresh view each iteration since WASM memory growth can detach)
          new Float64Array(wasm.memory.buffer, errorAlloc.ptr, dim).fill(0)

          for (let s = 0; s < numStages; s++) {
            const ksPtr = stageAlloc.ptr + s * dim * 8

            if (b[s] !== 0) {
              // yNew += h * b[s] * k[s]
              wasm.vectorScale(ksPtr, h * b[s], dim, tempAlloc.ptr)
              wasm.vectorAdd(yNewAlloc.ptr, tempAlloc.ptr, dim, yNewAlloc.ptr)
            }

            if (deltaB[s] !== 0) {
              // error += deltaB[s] * k[s]  (will take max(abs()) after)
              wasm.vectorScale(ksPtr, deltaB[s], dim, tempAlloc.ptr)
              wasm.vectorAdd(errorAlloc.ptr, tempAlloc.ptr, dim, errorAlloc.ptr)
            }
          }

          // Compute max absolute error using WASM
          // First scale error by h (since multiply(deltaB, k) in JS path is then
          // used as-is, but the JS path computes multiply(deltaB, k) which is
          // the raw difference, not multiplied by h — let's match JS behavior)
          // Looking at the JS code: TE = max(abs(map(multiply(deltaB, k), ...)))
          // multiply(deltaB, k) is a matrix multiply of [numStages] x [numStages, dim]
          // which gives a [dim] vector. This is exactly what we accumulated above.
          // So we take abs-max of errorAlloc directly.

          // But we need abs values. Compute maxError via WASM.
          const TE = wasm.maxError(errorAlloc.ptr, dim)

          if (TE < tol && tol / TE > 1 / 4) {
            // Accept step
            t.push(t[n] + h)
            y.push(readVec(yNewAlloc))
            n++
          }

          // Step size adjustment
          let delta = wasm.computeStepAdjustment(TE, tol, 5, minDelta, maxDelta)

          h = h * delta

          if (maxStepVal !== undefined && Math.abs(h) > maxStepVal) {
            h = isForwards ? maxStepVal : -maxStepVal
          } else if (minStepVal !== undefined && Math.abs(h) < minStepVal) {
            h = isForwards ? minStepVal : -minStepVal
          }

          iter++
          if (iter > maxIter) {
            throw new Error(
              'Maximum number of iterations reached, try changing options'
            )
          }
        }

        return { t, y }
      } finally {
        wasmLoader.free(yAlloc.ptr)
        wasmLoader.free(yNewAlloc.ptr)
        wasmLoader.free(errorAlloc.ptr)
        wasmLoader.free(tempAlloc.ptr)
        wasmLoader.free(stageAlloc.ptr)
      }
    }

    function _rk(butcherTableau: ButcherTableau) {
      // generates an adaptive runge kutta method from it's butcher tableau

      return function (
        f: ForcingFunction,
        tspan: any[],
        y0: any[],
        options: ODEOptions
      ): ODESolution {
        // adaptive runge kutta methods
        const wrongTSpan = !(
          tspan.length === 2 &&
          (tspan.every(isNumOrBig) || tspan.every(isUnit))
        )
        if (wrongTSpan) {
          throw new Error(
            '"tspan" must be an Array of two numeric values or two units [tStart, tEnd]'
          )
        }
        const t0 = tspan[0] // initial time
        const tf = tspan[1] // final time
        const isForwards = larger(tf, t0)
        const firstStep = options.firstStep
        if (firstStep !== undefined && !isPositive(firstStep)) {
          throw new Error('"firstStep" must be positive')
        }
        const maxStep = options.maxStep
        if (maxStep !== undefined && !isPositive(maxStep)) {
          throw new Error('"maxStep" must be positive')
        }
        const minStep = options.minStep
        if (minStep && isNegative(minStep)) {
          throw new Error('"minStep" must be positive or zero')
        }
        const timeVars = [t0, tf, firstStep, minStep, maxStep].filter(
          (x) => x !== undefined
        )
        if (!(timeVars.every(isNumOrBig) || timeVars.every(isUnit))) {
          throw new Error('Inconsistent type of "t" dependant variables')
        }

        // Try WASM-accelerated path for plain number arrays above threshold
        const hasBigNumbers = [t0, tf, ...y0, maxStep, minStep].some(
          isBigNumber
        )
        if (
          !hasBigNumbers &&
          !tspan.some(isUnit) &&
          _isPlainNumberArray(y0)
        ) {
          try {
            const wasmResult = _rkWasmLoop(f, tspan, y0 as number[], options, butcherTableau)
            if (wasmResult !== null) return wasmResult
          } catch {
            // Fall through to JS implementation
          }
        }

        // --- JS fallback path (original implementation) ---
        const steps = 1 // divide time in this number of steps
        const tol = options.tol ? options.tol : 1e-4 // define a tolerance (must be an option)
        const minDelta = options.minDelta ? options.minDelta : 0.2
        const maxDelta = options.maxDelta ? options.maxDelta : 5
        const maxIter = options.maxIter ? options.maxIter : 10_000 // stop inifite evaluation if something goes wrong
        const [a, c, b, bp] = hasBigNumbers
          ? [
              bignumber(butcherTableau.a),
              bignumber(butcherTableau.c),
              bignumber(butcherTableau.b),
              bignumber(butcherTableau.bp)
            ]
          : [
              butcherTableau.a,
              butcherTableau.c,
              butcherTableau.b,
              butcherTableau.bp
            ]

        let h = firstStep
          ? isForwards
            ? firstStep
            : unaryMinus(firstStep)
          : divide(subtract(tf, t0), steps) // define the first step size
        const t: any[] = [t0] // start the time array
        const y: any[] = [y0] // start the solution array

        const deltaB = subtract(b, bp) // b - bp

        let n = 0
        let iter = 0
        const ongoing = _createOngoing(isForwards)
        const trimStep = _createTrimStep(isForwards)
        // iterate unitil it reaches either the final time or maximum iterations
        while (ongoing(t[n], tf)) {
          const k: any[] = []

          // trim the time step so that it doesn't overshoot
          h = trimStep(t[n], tf, h)

          // calculate the first value of k
          k.push(f(t[n], y[n]))

          // calculate the rest of the values of k
          for (let i = 1; i < (c as any[]).length; ++i) {
            k.push(
              f(add(t[n], multiply(c[i], h)), add(y[n], multiply(h, a[i], k)))
            )
          }

          // estimate the error by comparing solutions of different orders
          const TE = max(
            abs(
              map(multiply(deltaB, k), (X: any) =>
                isUnit(X) ? (X as any).value : X
              )
            )
          )

          if (TE < tol && tol / TE > 1 / 4) {
            // push solution if within tol
            t.push(add(t[n], h))
            y.push(add(y[n], multiply(h, b, k)))
            n++
          }

          // estimate the delta value that will affect the step size
          let delta = 0.84 * (tol / TE) ** (1 / 5)

          if (smaller(delta, minDelta)) {
            delta = minDelta
          } else if (larger(delta, maxDelta)) {
            delta = maxDelta
          }

          delta = hasBigNumbers ? bignumber(delta) : delta
          h = multiply(h, delta)

          if (maxStep && larger(abs(h), maxStep)) {
            h = isForwards ? maxStep : unaryMinus(maxStep)
          } else if (minStep && smaller(abs(h), minStep)) {
            h = isForwards ? minStep : unaryMinus(minStep)
          }
          iter++
          if (iter > maxIter) {
            throw new Error(
              'Maximum number of iterations reached, try changing options'
            )
          }
        }
        return { t, y }
      }
    }

    function _rk23(
      f: ForcingFunction,
      tspan: any[],
      y0: any[],
      options: ODEOptions
    ): ODESolution {
      // Bogacki–Shampine method

      // Define the butcher table
      const a: number[][] = [[], [1 / 2], [0, 3 / 4], [2 / 9, 1 / 3, 4 / 9]]

      const c: (number | null)[] = [null, 1 / 2, 3 / 4, 1]
      const b: number[] = [2 / 9, 1 / 3, 4 / 9, 0]
      const bp: number[] = [7 / 24, 1 / 4, 1 / 3, 1 / 8]

      const butcherTableau: ButcherTableau = { a, c, b, bp }

      // Solve an adaptive step size rk method
      return _rk(butcherTableau)(f, tspan, y0, options)
    }

    function _rk45(
      f: ForcingFunction,
      tspan: any[],
      y0: any[],
      options: ODEOptions
    ): ODESolution {
      // Dormand Prince method

      // Define the butcher tableau
      const a: number[][] = [
        [],
        [1 / 5],
        [3 / 40, 9 / 40],
        [44 / 45, -56 / 15, 32 / 9],
        [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
        [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656],
        [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]
      ]

      const c: (number | null)[] = [null, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1]
      const b: number[] = [
        35 / 384,
        0,
        500 / 1113,
        125 / 192,
        -2187 / 6784,
        11 / 84,
        0
      ]
      const bp: number[] = [
        5179 / 57600,
        0,
        7571 / 16695,
        393 / 640,
        -92097 / 339200,
        187 / 2100,
        1 / 40
      ]

      const butcherTableau: ButcherTableau = { a, c, b, bp }

      // Solve an adaptive step size rk method
      return _rk(butcherTableau)(f, tspan, y0, options)
    }

    function _solveODE(
      f: ForcingFunction,
      tspan: any[],
      y0: any[],
      opt: ODEOptions
    ): ODESolution {
      const method = opt.method ? opt.method : 'RK45'
      const methods: Record<string, typeof _rk23 | typeof _rk45> = {
        RK23: _rk23,
        RK45: _rk45
      }
      if (method.toUpperCase() in methods) {
        const methodOptions = { ...opt } // clone the options object
        delete methodOptions.method // delete the method as it won't be needed
        return methods[method.toUpperCase() as keyof typeof methods](
          f,
          tspan,
          y0,
          methodOptions
        )
      } else {
        // throw an error indicating there is no such method
        const methodsWithQuotes = Object.keys(methods).map((x) => `"${x}"`)
        // generates a string of methods like: "BDF", "RK23" and "RK45"
        const availableMethodsString = `${methodsWithQuotes.slice(0, -1).join(', ')} and ${methodsWithQuotes.slice(-1)}`
        throw new Error(
          `Unavailable method "${method}". Available methods are ${availableMethodsString}`
        )
      }
    }

    function _createOngoing(isForwards: any): typeof smaller | typeof larger {
      // returns the correct function to test if it's still iterating
      return isForwards ? smaller : larger
    }

    function _createTrimStep(isForwards: any) {
      const outOfBounds = isForwards ? larger : smaller
      return function (t: any, tf: any, h: any): any {
        const next = add(t, h)
        return outOfBounds(next, tf) ? subtract(tf, t) : h
      }
    }

    function isNumOrBig(x: any): boolean {
      // checks if it's a number or bignumber
      return isBigNumber(x) || isNumber(x)
    }

    function _matrixSolveODE(
      f: ForcingFunction,
      T: Matrix,
      y0: Matrix,
      options: ODEOptions
    ): { t: Matrix; y: Matrix } {
      // receives matrices and returns matrices
      const sol = _solveODE(f, T.toArray(), y0.toArray(), options)
      return { t: matrix(sol.t), y: matrix(sol.y) }
    }

    return typed('solveODE', {
      'function, Array, Array, Object': _solveODE,
      'function, Matrix, Matrix, Object': _matrixSolveODE,
      'function, Array, Array': (f: ForcingFunction, T: any[], y0: any[]) =>
        _solveODE(f, T, y0, {}),
      'function, Matrix, Matrix': (f: ForcingFunction, T: Matrix, y0: Matrix) =>
        _matrixSolveODE(f, T, y0, {}),
      'function, Array, number | BigNumber | Unit': (
        f: ForcingFunction,
        T: any[],
        y0: number | BigNumber | Unit
      ) => {
        const sol = _solveODE(f, T, [y0], {})
        return { t: sol.t, y: sol.y.map((Y: any) => Y[0]) }
      },
      'function, Matrix, number | BigNumber | Unit': (
        f: ForcingFunction,
        T: Matrix,
        y0: number | BigNumber | Unit
      ) => {
        const sol = _solveODE(f, T.toArray(), [y0], {})
        return { t: matrix(sol.t), y: matrix(sol.y.map((Y: any) => Y[0])) }
      },
      'function, Array, number | BigNumber | Unit, Object': (
        f: ForcingFunction,
        T: any[],
        y0: number | BigNumber | Unit,
        options: ODEOptions
      ) => {
        const sol = _solveODE(f, T, [y0], options)
        return { t: sol.t, y: sol.y.map((Y: any) => Y[0]) }
      },
      'function, Matrix, number | BigNumber | Unit, Object': (
        f: ForcingFunction,
        T: Matrix,
        y0: number | BigNumber | Unit,
        options: ODEOptions
      ) => {
        const sol = _solveODE(f, T.toArray(), [y0], options)
        return { t: matrix(sol.t), y: matrix(sol.y.map((Y: any) => Y[0])) }
      }
    })
  }
)
