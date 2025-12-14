/**
 * WASM Loader - Loads and manages WebAssembly modules
 * Provides a bridge between JavaScript/TypeScript and compiled WASM
 */

export interface WasmModule {
  // Matrix operations
  multiplyDense: (
    aPtr: number,
    aRows: number,
    aCols: number,
    bPtr: number,
    bRows: number,
    bCols: number,
    resultPtr: number
  ) => void
  multiplyDenseSIMD: (
    aPtr: number,
    aRows: number,
    aCols: number,
    bPtr: number,
    bRows: number,
    bCols: number,
    resultPtr: number
  ) => void
  multiplyVector: (
    aPtr: number,
    aRows: number,
    aCols: number,
    xPtr: number,
    resultPtr: number
  ) => void
  transpose: (
    dataPtr: number,
    rows: number,
    cols: number,
    resultPtr: number
  ) => void
  add: (aPtr: number, bPtr: number, size: number, resultPtr: number) => void
  subtract: (
    aPtr: number,
    bPtr: number,
    size: number,
    resultPtr: number
  ) => void
  scalarMultiply: (
    aPtr: number,
    scalar: number,
    size: number,
    resultPtr: number
  ) => void
  dotProduct: (aPtr: number, bPtr: number, size: number) => number

  // Linear algebra
  luDecomposition: (aPtr: number, n: number, permPtr: number) => number
  qrDecomposition: (
    aPtr: number,
    m: number,
    n: number,
    qPtr: number,
    rPtr: number
  ) => void
  choleskyDecomposition: (aPtr: number, n: number, lPtr: number) => number
  luSolve: (
    luPtr: number,
    n: number,
    permPtr: number,
    bPtr: number,
    xPtr: number
  ) => void
  luDeterminant: (luPtr: number, n: number, permPtr: number) => number

  // Signal processing
  fft: (dataPtr: number, n: number, inverse: number) => void
  fft2d: (dataPtr: number, rows: number, cols: number, inverse: number) => void
  convolve: (
    signalPtr: number,
    n: number,
    kernelPtr: number,
    m: number,
    resultPtr: number
  ) => void
  rfft: (dataPtr: number, n: number, resultPtr: number) => void
  irfft: (dataPtr: number, n: number, resultPtr: number) => void
  isPowerOf2: (n: number) => number

  // Memory management
  __new: (size: number, id: number) => number
  __pin: (ptr: number) => number
  __unpin: (ptr: number) => void
  __collect: () => void
  memory: WebAssembly.Memory
}

export class WasmLoader {
  private static instance: WasmLoader | null = null
  private wasmModule: WasmModule | null = null
  private loading: Promise<WasmModule> | null = null
  private isNode: boolean

  private constructor() {
    this.isNode =
      typeof process !== 'undefined' && process.versions?.node !== undefined
  }

  public static getInstance(): WasmLoader {
    if (!WasmLoader.instance) {
      WasmLoader.instance = new WasmLoader()
    }
    return WasmLoader.instance
  }

  /**
   * Load the WASM module
   */
  public async load(wasmPath?: string): Promise<WasmModule> {
    if (this.wasmModule) {
      return this.wasmModule
    }

    if (this.loading) {
      return this.loading
    }

    this.loading = this.loadModule(wasmPath)
    this.wasmModule = await this.loading
    return this.wasmModule
  }

  private async loadModule(wasmPath?: string): Promise<WasmModule> {
    const path = wasmPath || this.getDefaultWasmPath()

    if (this.isNode) {
      return this.loadNodeWasm(path)
    } else {
      return this.loadBrowserWasm(path)
    }
  }

  private getDefaultWasmPath(): string {
    if (this.isNode) {
      return './lib/wasm/index.wasm'
    } else {
      return new URL('../../lib/wasm/index.wasm', import.meta.url).href
    }
  }

  private async loadNodeWasm(path: string): Promise<WasmModule> {
    const fs = await import('fs')
    const { promisify } = await import('util')
    const readFile = promisify(fs.readFile)

    const buffer = await readFile(path)
    const module = await WebAssembly.compile(buffer)
    const instance = await WebAssembly.instantiate(module, this.getImports())

    return instance.exports as any as WasmModule
  }

  private async loadBrowserWasm(path: string): Promise<WasmModule> {
    const response = await fetch(path)
    const buffer = await response.arrayBuffer()
    const module = await WebAssembly.compile(buffer)
    const instance = await WebAssembly.instantiate(module, this.getImports())

    return instance.exports as any as WasmModule
  }

  private getImports(): WebAssembly.Imports {
    return {
      env: {
        abort: (msg: number, file: number, line: number, column: number) => {
          console.error('WASM abort', { msg, file, line, column })
          throw new Error('WASM abort')
        },
        seed: () => Date.now()
      },
      Math: Math as any,
      Date: Date as any
    }
  }

  /**
   * Get the loaded WASM module
   */
  public getModule(): WasmModule | null {
    return this.wasmModule
  }

  /**
   * Check if WASM is loaded
   */
  public isLoaded(): boolean {
    return this.wasmModule !== null
  }

  /**
   * Allocate Float64Array in WASM memory
   */
  public allocateFloat64Array(data: number[] | Float64Array): {
    ptr: number
    array: Float64Array
  } {
    const module = this.wasmModule
    if (!module) throw new Error('WASM module not loaded')

    const length = data.length
    const byteLength = length * 8 // 8 bytes per f64

    // Allocate memory (id=2 for Float64Array in AssemblyScript)
    const ptr = module.__new(byteLength, 2)
    const array = new Float64Array(module.memory.buffer, ptr, length)

    // Copy data
    array.set(data)

    return { ptr, array }
  }

  /**
   * Allocate Int32Array in WASM memory
   */
  public allocateInt32Array(data: number[] | Int32Array): {
    ptr: number
    array: Int32Array
  } {
    const module = this.wasmModule
    if (!module) throw new Error('WASM module not loaded')

    const length = data.length
    const byteLength = length * 4 // 4 bytes per i32

    // Allocate memory (id=1 for Int32Array in AssemblyScript)
    const ptr = module.__new(byteLength, 1)
    const array = new Int32Array(module.memory.buffer, ptr, length)

    // Copy data
    array.set(data)

    return { ptr, array }
  }

  /**
   * Free allocated memory
   */
  public free(ptr: number): void {
    const module = this.wasmModule
    if (!module) return

    module.__unpin(ptr)
  }

  /**
   * Run garbage collection
   */
  public collect(): void {
    const module = this.wasmModule
    if (!module) return

    module.__collect()
  }
}

/**
 * Global WASM loader instance
 */
export const wasmLoader = WasmLoader.getInstance()

/**
 * Initialize WASM module (call once at startup)
 */
export async function initWasm(wasmPath?: string): Promise<WasmModule> {
  return wasmLoader.load(wasmPath)
}
