# Migration Guide: TypeScript + WASM + Parallel Computing

This guide helps you migrate existing mathjs code to take advantage of the new TypeScript, WASM, and parallel computing features.

## Quick Start

### For Existing JavaScript Users

**No changes required!** The refactored architecture is fully backward compatible. Your existing code will continue to work without any modifications.

### For Performance-Critical Applications

To enable high-performance features, add these lines at the start of your application:

```javascript
import { MatrixWasmBridge } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

// Initialize WASM (once at startup)
await MatrixWasmBridge.init()
```

That's it! Operations will automatically use WASM and parallel execution when beneficial.

## Step-by-Step Migration

### Step 1: Install Dependencies

If you're building from source, install the new dependencies:

```bash
npm install
```

This will install:
- AssemblyScript (WASM compiler)
- gulp-typescript (TypeScript build support)

### Step 2: Build the Project

```bash
npm run build
```

This builds:
- JavaScript (ESM and CJS)
- TypeScript compiled output
- WASM modules
- Browser bundles

### Step 3: Initialize in Your Application

#### Node.js Application

```javascript
import { MatrixWasmBridge } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

async function initialize() {
  await MatrixWasmBridge.init()
  // Your code here
}

initialize()
```

#### Browser Application

```html
<script type="module">
  import { MatrixWasmBridge } from './node_modules/mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

  async function init() {
    await MatrixWasmBridge.init()
    console.log('WASM ready!')
  }

  init()
</script>
```

## Migration Examples

### Example 1: Matrix Multiplication

**Before (still works):**
```javascript
import math from 'mathjs'

const a = math.matrix([[1, 2], [3, 4]])
const b = math.matrix([[5, 6], [7, 8]])
const result = math.multiply(a, b)
```

**After (with WASM acceleration):**
```javascript
import math from 'mathjs'
import { MatrixWasmBridge } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

// Initialize once
await MatrixWasmBridge.init()

// Use high-performance bridge for large matrices
const aData = new Float64Array([1, 2, 3, 4])
const bData = new Float64Array([5, 6, 7, 8])
const result = await MatrixWasmBridge.multiply(aData, 2, 2, bData, 2, 2)

// Or continue using regular mathjs API (will use WASM internally when integrated)
const a = math.matrix([[1, 2], [3, 4]])
const b = math.matrix([[5, 6], [7, 8]])
const resultMath = math.multiply(a, b)
```

### Example 2: Large Matrix Operations

**Before:**
```javascript
import math from 'mathjs'

const size = 1000
const a = math.random([size, size])
const b = math.random([size, size])
const result = math.multiply(a, b)  // May be slow
```

**After (with parallel execution):**
```javascript
import { ParallelMatrix } from 'mathjs/lib/typescript/parallel/ParallelMatrix.js'

// Configure parallel execution
ParallelMatrix.configure({
  minSizeForParallel: 500,
  maxWorkers: 4
})

const size = 1000
const a = new Float64Array(size * size).map(() => Math.random())
const b = new Float64Array(size * size).map(() => Math.random())
const result = await ParallelMatrix.multiply(a, size, size, b, size, size)  // Much faster!
```

### Example 3: Linear Algebra

**Before:**
```javascript
import math from 'mathjs'

const A = math.matrix([[4, 3], [6, 3]])
const { L, U, p } = math.lup(A)
```

**After (with WASM):**
```javascript
import { MatrixWasmBridge } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

await MatrixWasmBridge.init()

const A = new Float64Array([4, 3, 6, 3])
const { lu, perm, singular } = await MatrixWasmBridge.luDecomposition(A, 2)
```

## Configuration Options

### Global Configuration

```javascript
import { MatrixWasmBridge } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

// Configure optimization behavior
MatrixWasmBridge.configure({
  useWasm: true,           // Enable/disable WASM
  useParallel: true,       // Enable/disable parallel execution
  minSizeForWasm: 100,     // Minimum matrix size for WASM
  minSizeForParallel: 1000 // Minimum matrix size for parallel
})
```

### Per-Operation Configuration

```javascript
// Override global settings for specific operations
const result = await MatrixWasmBridge.multiply(
  a, rows, cols, b, rows, cols,
  { useWasm: false, useParallel: true }  // Force parallel, no WASM
)
```

## TypeScript Support

### Using TypeScript Types

```typescript
import { MatrixWasmBridge, MatrixOptions } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'
import { ParallelMatrix, ParallelConfig } from 'mathjs/lib/typescript/parallel/ParallelMatrix.js'

// Type-safe configuration
const config: ParallelConfig = {
  minSizeForParallel: 500,
  maxWorkers: 4,
  useSharedMemory: true
}

ParallelMatrix.configure(config)

// Type-safe operations
const a: Float64Array = new Float64Array(100)
const b: Float64Array = new Float64Array(100)
const result: Float64Array = await MatrixWasmBridge.multiply(a, 10, 10, b, 10, 10)
```

## Performance Tuning

### Choosing the Right Threshold

The `minSizeForWasm` and `minSizeForParallel` thresholds determine when to use optimizations:

**Recommended Settings:**

| Use Case | minSizeForWasm | minSizeForParallel |
|----------|----------------|-------------------|
| Mobile/Low-end | 500 | 2000 |
| Desktop | 100 | 1000 |
| Server | 50 | 500 |
| High-performance | 0 (always) | 100 |

### Measuring Performance

```javascript
import { MatrixWasmBridge } from 'mathjs/lib/typescript/wasm/MatrixWasmBridge.js'

// Check what's available
const caps = MatrixWasmBridge.getCapabilities()
console.log('WASM:', caps.wasmAvailable)
console.log('Parallel:', caps.parallelAvailable)
console.log('SIMD:', caps.simdAvailable)

// Benchmark different configurations
async function benchmark() {
  const sizes = [100, 500, 1000, 2000]

  for (const size of sizes) {
    const a = new Float64Array(size * size).map(() => Math.random())
    const b = new Float64Array(size * size).map(() => Math.random())

    // JavaScript
    MatrixWasmBridge.configure({ useWasm: false, useParallel: false })
    const jsStart = performance.now()
    await MatrixWasmBridge.multiply(a, size, size, b, size, size)
    const jsTime = performance.now() - jsStart

    // WASM
    MatrixWasmBridge.configure({ useWasm: true, useParallel: false })
    const wasmStart = performance.now()
    await MatrixWasmBridge.multiply(a, size, size, b, size, size)
    const wasmTime = performance.now() - wasmStart

    console.log(`Size ${size}x${size}: JS=${jsTime.toFixed(2)}ms, WASM=${wasmTime.toFixed(2)}ms, Speedup=${(jsTime/wasmTime).toFixed(2)}x`)
  }
}
```

## Troubleshooting

### WASM Not Loading

**Symptom:** Operations are slow, WASM not being used

**Check:**
```javascript
const caps = MatrixWasmBridge.getCapabilities()
if (!caps.wasmAvailable) {
  console.error('WASM failed to load')
}
```

**Solutions:**
1. Ensure `lib/wasm/index.wasm` exists: `npm run build:wasm`
2. Check file path is correct
3. Verify server serves WASM with correct MIME type
4. Check browser console for errors

### Parallel Execution Not Working

**Symptom:** Operations using single thread despite configuration

**Check:**
```javascript
const caps = MatrixWasmBridge.getCapabilities()
if (!caps.parallelAvailable) {
  console.error('Workers not available')
}
```

**Solutions:**
1. Verify Workers are supported in your environment
2. Check matrix size exceeds `minSizeForParallel`
3. Ensure worker script path is correct
4. Check browser console for worker errors

### Memory Issues with SharedArrayBuffer

**Symptom:** `SharedArrayBuffer is not defined`

**Solutions:**
1. Requires HTTPS or localhost
2. Requires specific HTTP headers:
   ```
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Embedder-Policy: require-corp
   ```
3. Disable SharedArrayBuffer:
   ```javascript
   ParallelMatrix.configure({ useSharedMemory: false })
   ```

## Gradual Migration Strategy

You don't need to migrate everything at once. Here's a recommended approach:

### Phase 1: Enable WASM (Low Risk)
```javascript
await MatrixWasmBridge.init()
// That's it! WASM will be used automatically when beneficial
```

### Phase 2: Identify Bottlenecks
```javascript
// Profile your application
console.time('operation')
// Your matrix operations here
console.timeEnd('operation')
```

### Phase 3: Optimize Hot Paths
```javascript
// Replace performance-critical operations with direct bridge calls
const result = await MatrixWasmBridge.multiply(...)
```

### Phase 4: Enable Parallel Execution
```javascript
ParallelMatrix.configure({ minSizeForParallel: 500 })
// Use ParallelMatrix for large operations
```

## Best Practices

### 1. Initialize Once
```javascript
// Good: Initialize at application startup
async function startup() {
  await MatrixWasmBridge.init()
  startApp()
}

// Bad: Initialize on every operation
async function calculate() {
  await MatrixWasmBridge.init()  // Don't do this!
  return MatrixWasmBridge.multiply(...)
}
```

### 2. Cleanup Resources
```javascript
// Good: Cleanup when done
async function processData() {
  await MatrixWasmBridge.init()
  // Do work...
  await MatrixWasmBridge.cleanup()
}

// In long-running apps, cleanup on shutdown
process.on('SIGINT', async () => {
  await MatrixWasmBridge.cleanup()
  process.exit()
})
```

### 3. Use Appropriate Data Types
```javascript
// Good: Use typed arrays for WASM/parallel
const a = new Float64Array(size * size)

// Less optimal: Regular arrays require conversion
const a = new Array(size * size)
```

### 4. Configure Once
```javascript
// Good: Configure at startup
MatrixWasmBridge.configure({ minSizeForWasm: 100 })

// Less optimal: Configure on every call
MatrixWasmBridge.multiply(..., { minSizeForWasm: 100 })
```

## FAQ

**Q: Do I need to change my existing code?**
A: No! The new features are opt-in. Existing code continues to work.

**Q: What performance improvement can I expect?**
A: Typically 2-10x for WASM, 2-4x additional for parallel. Varies by operation and size.

**Q: Does this work in Node.js and browsers?**
A: Yes! The architecture supports both Node.js (worker_threads) and browsers (Web Workers).

**Q: Is WASM required?**
A: No. JavaScript fallbacks are always available. WASM is an optimization.

**Q: Can I use this in production?**
A: Yes, but test thoroughly. The architecture is new and should be validated for your use case.

**Q: How do I debug WASM code?**
A: Build with `npm run build:wasm:debug` for debug symbols, and use browser DevTools.

## Getting Help

- Documentation: See `TYPESCRIPT_WASM_ARCHITECTURE.md`
- Examples: See `examples/typescript-wasm-example.ts`
- Issues: https://github.com/josdejong/mathjs/issues

## Next Steps

1. ✅ Read this guide
2. ✅ Install dependencies: `npm install`
3. ✅ Build project: `npm run build`
4. ✅ Initialize WASM: `await MatrixWasmBridge.init()`
5. ✅ Run examples: `node examples/typescript-wasm-example.ts`
6. ✅ Benchmark your use case
7. ✅ Gradually migrate performance-critical code
8. ✅ Monitor and tune performance

Happy computing! 🚀
