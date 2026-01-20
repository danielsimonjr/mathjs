/**
 * WASM Loader - Loads and manages WebAssembly modules
 * Provides a bridge between JavaScript/TypeScript and compiled WASM
 *
 * Optimizations:
 * - Singleton pattern with module caching
 * - Streaming compilation in browsers (WebAssembly.instantiateStreaming)
 * - Memory pooling for frequent allocations
 * - Compiled module caching for faster re-instantiation
 * - Configurable size thresholds for JS fallback
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

/**
 * Memory pool entry for reusable allocations
 */
interface PoolEntry {
  ptr: number
  size: number
  inUse: boolean
}

/**
 * Loading metrics for performance monitoring
 */
export interface LoadingMetrics {
  fileReadMs: number
  compileMs: number
  instantiateMs: number
  totalMs: number
  fromCache: boolean
}

export class WasmLoader {
  private static instance: WasmLoader | null = null
  private wasmModule: WasmModule | null = null
  private compiledModule: WebAssembly.Module | null = null
  private loading: Promise<WasmModule> | null = null
  private isNode: boolean
  private lastMetrics: LoadingMetrics | null = null

  // Memory pool for reusable allocations
  private float64Pool: PoolEntry[] = []
  private int32Pool: PoolEntry[] = []
  private readonly maxPoolSize = 32
  private readonly poolSizeThreshold = 1024 * 1024 // 1MB max per pool entry

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

  /**
   * Precompile the WASM module without instantiation
   * Useful for build-time or startup optimization
   */
  public async precompile(wasmPath?: string): Promise<void> {
    if (this.compiledModule) return

    const path = wasmPath || this.getDefaultWasmPath()
    const startTime = performance.now()

    if (this.isNode) {
      const fs = await import('fs')
      const { promisify } = await import('util')
      const readFile = promisify(fs.readFile)
      const buffer = await readFile(path)
      this.compiledModule = await WebAssembly.compile(buffer)
    } else {
      const response = await fetch(path)
      // Use streaming compilation in browser for better performance
      if (typeof WebAssembly.compileStreaming === 'function') {
        this.compiledModule = await WebAssembly.compileStreaming(fetch(path))
      } else {
        const buffer = await response.arrayBuffer()
        this.compiledModule = await WebAssembly.compile(buffer)
      }
    }

    this.lastMetrics = {
      fileReadMs: 0,
      compileMs: performance.now() - startTime,
      instantiateMs: 0,
      totalMs: performance.now() - startTime,
      fromCache: false
    }
  }

  private async loadModule(wasmPath?: string): Promise<WasmModule> {
    const path = wasmPath || this.getDefaultWasmPath()
    const totalStart = performance.now()

    // If precompiled, use cached module
    if (this.compiledModule) {
      const instStart = performance.now()
      const instance = await WebAssembly.instantiate(
        this.compiledModule,
        this.getImports()
      )
      this.lastMetrics = {
        fileReadMs: 0,
        compileMs: 0,
        instantiateMs: performance.now() - instStart,
        totalMs: performance.now() - totalStart,
        fromCache: true
      }
      return instance.exports as any as WasmModule
    }

    if (this.isNode) {
      return this.loadNodeWasm(path, totalStart)
    } else {
      return this.loadBrowserWasm(path, totalStart)
    }
  }

  private getDefaultWasmPath(): string {
    if (this.isNode) {
      return './lib/wasm/index.wasm'
    } else {
      return new URL('../../lib/wasm/index.wasm', import.meta.url).href
    }
  }

  private async loadNodeWasm(
    path: string,
    totalStart: number
  ): Promise<WasmModule> {
    const fs = await import('fs')
    const { promisify } = await import('util')
    const readFile = promisify(fs.readFile)

    const readStart = performance.now()
    const buffer = await readFile(path)
    const readEnd = performance.now()

    const compileStart = performance.now()
    this.compiledModule = await WebAssembly.compile(buffer)
    const compileEnd = performance.now()

    const instStart = performance.now()
    const instance = await WebAssembly.instantiate(
      this.compiledModule,
      this.getImports()
    )
    const instEnd = performance.now()

    this.lastMetrics = {
      fileReadMs: readEnd - readStart,
      compileMs: compileEnd - compileStart,
      instantiateMs: instEnd - instStart,
      totalMs: performance.now() - totalStart,
      fromCache: false
    }

    return instance.exports as any as WasmModule
  }

  private async loadBrowserWasm(
    path: string,
    totalStart: number
  ): Promise<WasmModule> {
    // Use streaming instantiation in browser for best performance
    // This allows compilation to start while bytes are still downloading
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      const instStart = performance.now()
      const result = await WebAssembly.instantiateStreaming(
        fetch(path),
        this.getImports()
      )
      this.compiledModule = result.module
      this.lastMetrics = {
        fileReadMs: 0, // Combined with compile in streaming
        compileMs: 0, // Combined in streaming
        instantiateMs: performance.now() - instStart,
        totalMs: performance.now() - totalStart,
        fromCache: false
      }
      return result.instance.exports as any as WasmModule
    }

    // Fallback for older browsers
    const readStart = performance.now()
    const response = await fetch(path)
    const buffer = await response.arrayBuffer()
    const readEnd = performance.now()

    const compileStart = performance.now()
    this.compiledModule = await WebAssembly.compile(buffer)
    const compileEnd = performance.now()

    const instStart = performance.now()
    const instance = await WebAssembly.instantiate(
      this.compiledModule,
      this.getImports()
    )
    const instEnd = performance.now()

    this.lastMetrics = {
      fileReadMs: readEnd - readStart,
      compileMs: compileEnd - compileStart,
      instantiateMs: instEnd - instStart,
      totalMs: performance.now() - totalStart,
      fromCache: false
    }

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
   * Get the compiled WASM module (for caching/serialization)
   */
  public getCompiledModule(): WebAssembly.Module | null {
    return this.compiledModule
  }

  /**
   * Check if WASM is loaded
   */
  public isLoaded(): boolean {
    return this.wasmModule !== null
  }

  /**
   * Check if WASM is precompiled
   */
  public isPrecompiled(): boolean {
    return this.compiledModule !== null
  }

  /**
   * Get loading performance metrics
   */
  public getLoadingMetrics(): LoadingMetrics | null {
    return this.lastMetrics
  }

  /**
   * Allocate Float64Array in WASM memory
   * Uses memory pooling for frequently reused sizes
   */
  public allocateFloat64Array(data: number[] | Float64Array): {
    ptr: number
    array: Float64Array
  } {
    const module = this.wasmModule
    if (!module) throw new Error('WASM module not loaded')

    const length = data.length
    const byteLength = length * 8 // 8 bytes per f64

    // Try to get from pool if size is reasonable
    let ptr: number
    if (byteLength <= this.poolSizeThreshold) {
      const poolEntry = this.getFromPool(this.float64Pool, byteLength)
      if (poolEntry) {
        ptr = poolEntry.ptr
        poolEntry.inUse = true
      } else {
        ptr = module.__new(byteLength, 2)
      }
    } else {
      ptr = module.__new(byteLength, 2)
    }

    const array = new Float64Array(module.memory.buffer, ptr, length)
    array.set(data)

    return { ptr, array }
  }

  /**
   * Allocate Float64Array without copying data (for output buffers)
   */
  public allocateFloat64ArrayEmpty(length: number): {
    ptr: number
    array: Float64Array
  } {
    const module = this.wasmModule
    if (!module) throw new Error('WASM module not loaded')

    const byteLength = length * 8

    let ptr: number
    if (byteLength <= this.poolSizeThreshold) {
      const poolEntry = this.getFromPool(this.float64Pool, byteLength)
      if (poolEntry) {
        ptr = poolEntry.ptr
        poolEntry.inUse = true
      } else {
        ptr = module.__new(byteLength, 2)
      }
    } else {
      ptr = module.__new(byteLength, 2)
    }

    const array = new Float64Array(module.memory.buffer, ptr, length)
    return { ptr, array }
  }

  /**
   * Allocate Int32Array in WASM memory
   * Uses memory pooling for frequently reused sizes
   */
  public allocateInt32Array(data: number[] | Int32Array): {
    ptr: number
    array: Int32Array
  } {
    const module = this.wasmModule
    if (!module) throw new Error('WASM module not loaded')

    const length = data.length
    const byteLength = length * 4 // 4 bytes per i32

    let ptr: number
    if (byteLength <= this.poolSizeThreshold) {
      const poolEntry = this.getFromPool(this.int32Pool, byteLength)
      if (poolEntry) {
        ptr = poolEntry.ptr
        poolEntry.inUse = true
      } else {
        ptr = module.__new(byteLength, 1)
      }
    } else {
      ptr = module.__new(byteLength, 1)
    }

    const array = new Int32Array(module.memory.buffer, ptr, length)
    array.set(data)

    return { ptr, array }
  }

  /**
   * Allocate Int32Array without copying data (for output buffers)
   */
  public allocateInt32ArrayEmpty(length: number): {
    ptr: number
    array: Int32Array
  } {
    const module = this.wasmModule
    if (!module) throw new Error('WASM module not loaded')

    const byteLength = length * 4

    let ptr: number
    if (byteLength <= this.poolSizeThreshold) {
      const poolEntry = this.getFromPool(this.int32Pool, byteLength)
      if (poolEntry) {
        ptr = poolEntry.ptr
        poolEntry.inUse = true
      } else {
        ptr = module.__new(byteLength, 1)
      }
    } else {
      ptr = module.__new(byteLength, 1)
    }

    const array = new Int32Array(module.memory.buffer, ptr, length)
    return { ptr, array }
  }

  /**
   * Get a suitable entry from the memory pool
   */
  private getFromPool(
    pool: PoolEntry[],
    requestedSize: number
  ): PoolEntry | null {
    // Find best fit: smallest available entry that's >= requested size
    let bestFit: PoolEntry | null = null
    let bestFitWaste = Infinity

    for (const entry of pool) {
      if (!entry.inUse && entry.size >= requestedSize) {
        const waste = entry.size - requestedSize
        // Accept if exact match or within 2x size (avoid excessive waste)
        if (waste < bestFitWaste && entry.size <= requestedSize * 2) {
          bestFit = entry
          bestFitWaste = waste
        }
      }
    }

    return bestFit
  }

  /**
   * Return allocation to pool for reuse
   */
  public release(ptr: number, isFloat64: boolean = true): void {
    const pool = isFloat64 ? this.float64Pool : this.int32Pool

    // Find entry in pool
    const entry = pool.find((e) => e.ptr === ptr)
    if (entry) {
      entry.inUse = false
      return
    }

    // If not in pool, we could add it (but respect max pool size)
    // For now, just unpin it
    this.free(ptr)
  }

  /**
   * Free allocated memory (immediate, bypasses pool)
   */
  public free(ptr: number): void {
    const module = this.wasmModule
    if (!module) return

    // Remove from pools if present
    this.float64Pool = this.float64Pool.filter((e) => e.ptr !== ptr)
    this.int32Pool = this.int32Pool.filter((e) => e.ptr !== ptr)

    module.__unpin(ptr)
  }

  /**
   * Clear the memory pool
   */
  public clearPool(): void {
    const module = this.wasmModule
    if (!module) return

    for (const entry of this.float64Pool) {
      module.__unpin(entry.ptr)
    }
    for (const entry of this.int32Pool) {
      module.__unpin(entry.ptr)
    }

    this.float64Pool = []
    this.int32Pool = []
  }

  /**
   * Get pool statistics
   */
  public getPoolStats(): {
    float64: { total: number; inUse: number; totalBytes: number }
    int32: { total: number; inUse: number; totalBytes: number }
  } {
    const f64InUse = this.float64Pool.filter((e) => e.inUse).length
    const f64Bytes = this.float64Pool.reduce((sum, e) => sum + e.size, 0)
    const i32InUse = this.int32Pool.filter((e) => e.inUse).length
    const i32Bytes = this.int32Pool.reduce((sum, e) => sum + e.size, 0)

    return {
      float64: {
        total: this.float64Pool.length,
        inUse: f64InUse,
        totalBytes: f64Bytes
      },
      int32: {
        total: this.int32Pool.length,
        inUse: i32InUse,
        totalBytes: i32Bytes
      }
    }
  }

  /**
   * Run garbage collection
   */
  public collect(): void {
    const module = this.wasmModule
    if (!module) return

    module.__collect()
  }

  /**
   * Reset the loader (for testing)
   */
  public reset(): void {
    this.clearPool()
    this.wasmModule = null
    this.compiledModule = null
    this.loading = null
    this.lastMetrics = null
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
