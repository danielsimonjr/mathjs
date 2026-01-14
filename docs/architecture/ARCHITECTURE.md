# Math.js Detailed Architecture

This document provides an in-depth technical description of the math.js architecture, design patterns, and implementation details.

## Table of Contents

1. [Factory Pattern & Dependency Injection](#factory-pattern--dependency-injection)
2. [Typed-Function System](#typed-function-system)
3. [Instance Creation & Lifecycle](#instance-creation--lifecycle)
4. [Configuration System](#configuration-system)
5. [Matrix Architecture](#matrix-architecture)
6. [Expression Parser Architecture](#expression-parser-architecture)
7. [WASM Integration Architecture](#wasm-integration-architecture)
8. [Parallel Computing Architecture](#parallel-computing-architecture)
9. [Error Handling Strategy](#error-handling-strategy)
10. [Build System Architecture](#build-system-architecture)

---

## Factory Pattern & Dependency Injection

### Overview

Math.js uses a sophisticated factory pattern combined with dependency injection to achieve:
- Lazy loading of functions
- Tree-shaking support
- Runtime customization
- Testability through dependency mocking

### Factory Function Structure

Every function in math.js is created via the `factory()` utility:

```javascript
// src/utils/factory.js
export function factory(name, dependencies, create, meta) {
  function assertAndCreate(scope) {
    // Extract only requested dependencies
    const deps = pickShallow(scope, dependencies.map(stripOptionalNotation))

    // Validate all required dependencies exist
    assertDependencies(name, dependencies, scope)

    // Create and return the function
    return create(deps)
  }

  // Attach metadata for introspection
  assertAndCreate.isFactory = true
  assertAndCreate.fn = name
  assertAndCreate.dependencies = dependencies.slice().sort()
  if (meta) {
    assertAndCreate.meta = meta
  }

  return assertAndCreate
}
```

### Dependency Declaration

Dependencies are declared as an array of strings:

```javascript
const dependencies = [
  'typed',           // Required dependency
  'config',          // Required dependency
  '?on',             // Optional dependency (prefixed with ?)
  'DenseMatrix',     // Type dependency
  'addScalar'        // Function dependency
]
```

### Factory Metadata

Factories can include metadata for special behaviors:

```javascript
export const createMyFunc = factory(name, dependencies, create, {
  isClass: true,                    // This factory creates a class
  recreateOnConfigChange: true,     // Recreate when config changes
  lazy: false                       // Eagerly instantiate
})
```

### Topological Sorting

Factories are sorted to ensure dependencies are available:

```javascript
// src/utils/factory.js
export function sortFactories(factories) {
  const factoriesByName = {}
  factories.forEach(f => factoriesByName[f.fn] = f)

  function containsDependency(factory, dependency) {
    if (isFactory(factory)) {
      if (factory.dependencies.includes(dependency.fn)) return true
      return factory.dependencies.some(d =>
        containsDependency(factoriesByName[d], dependency)
      )
    }
    return false
  }

  const sorted = []
  factories.filter(isFactory).forEach(factory => {
    let index = 0
    while (index < sorted.length && !containsDependency(sorted[index], factory)) {
      index++
    }
    sorted.splice(index, 0, factory)
  })

  return sorted
}
```

### Memoization

Factory results are memoized to ensure singleton behavior:

```javascript
// Each factory call with same scope returns same instance
const math1 = create(all)
const math2 = create(all)
// math1.add !== math2.add (different instances)

// But within an instance:
math1.add === math1.add  // Same reference (memoized)
```

---

## Typed-Function System

### Overview

Math.js uses the `typed-function` library to enable functions that work with multiple data types automatically.

### Type Registration

The typed-function instance is configured with all math.js types:

```javascript
// src/core/function/typed.ts
typed.types = [
  { name: 'number', test: isNumber },
  { name: 'Complex', test: isComplex },
  { name: 'BigNumber', test: isBigNumber },
  { name: 'Fraction', test: isFraction },
  { name: 'Unit', test: isUnit },
  { name: 'Matrix', test: isMatrix },
  { name: 'DenseMatrix', test: isDenseMatrix },
  { name: 'SparseMatrix', test: isSparseMatrix },
  // ... 23+ types total
]
```

### Multi-Signature Functions

Functions declare multiple type signatures:

```javascript
export const createAdd = factory('add', ['typed', 'addScalar'], ({ typed, addScalar }) => {
  return typed('add', {
    // Scalar signatures
    'number, number': (x, y) => x + y,
    'Complex, Complex': (x, y) => x.add(y),
    'BigNumber, BigNumber': (x, y) => x.plus(y),
    'Fraction, Fraction': (x, y) => x.add(y),

    // Matrix signatures
    'Matrix, Matrix': (x, y) => matrixAdd(x, y),
    'Matrix, any': (x, y) => broadcastAdd(x, y),
    'any, Matrix': (x, y) => broadcastAdd(x, y),

    // Variadic signature
    'any, any, ...any': (x, y, rest) => {
      let result = addScalar(x, y)
      for (const arg of rest) {
        result = addScalar(result, arg)
      }
      return result
    }
  })
})
```

### Type Conversion Chain

Typed-function supports automatic type conversion:

```javascript
typed.conversions = [
  { from: 'number', to: 'BigNumber', convert: x => new BigNumber(x) },
  { from: 'number', to: 'Complex', convert: x => new Complex(x, 0) },
  { from: 'number', to: 'Fraction', convert: x => new Fraction(x) },
  { from: 'Array', to: 'Matrix', convert: x => new DenseMatrix(x) },
  // ...
]
```

### Self-Referential Functions

For recursive or collection operations:

```javascript
typed('sum', {
  'Array | Matrix': typed.referToSelf(self => {
    return function(x) {
      return x.reduce((acc, val) => add(acc, isCollection(val) ? self(val) : val), 0)
    }
  })
})
```

---

## Instance Creation & Lifecycle

### The create() Function

Located in `src/core/create.ts`, this is the main entry point:

```javascript
export function create(factories, config) {
  // 1. Merge configuration with defaults
  const _config = Object.assign({}, DEFAULT_CONFIG, config)

  // 2. Create bare instance with type checkers
  const math = {
    isNumber, isComplex, isBigNumber, isMatrix, /* ... */
  }

  // 3. Create scope for dependency injection
  const scope = { math, config: _config }

  // 4. Initialize core functions
  const configFunc = configFactory({ config: _config })
  const importFunc = importFactory({
    config: _config,
    factories,
    math
  })

  // 5. Initialize event system
  math.on = emitter.on
  math.off = emitter.off
  math.emit = emitter.emit

  // 6. Import all factories
  math.import(factories)

  // 7. Set up config change listener
  math.on('config', () => {
    // Recreate functions marked with recreateOnConfigChange
  })

  return math
}
```

### Instance Structure

```typescript
interface MathJsInstance {
  // Type checking (30+ functions)
  isNumber: (x: any) => boolean
  isComplex: (x: any) => boolean
  isMatrix: (x: any) => boolean
  // ...

  // Configuration
  config: (options?: ConfigOptions) => ConfigOptions

  // Import/Export
  import: (factories: object, options?: ImportOptions) => void
  create: typeof create

  // Event system
  on: (event: string, callback: Function) => void
  off: (event: string, callback: Function) => void
  emit: (event: string, ...args: any[]) => void

  // Error types
  ArgumentsError: typeof ArgumentsError
  DimensionError: typeof DimensionError
  IndexError: typeof IndexError

  // Expression namespace
  expression: {
    transform: object
    mathWithTransform: object
  }

  // All math functions dynamically added
  add: Function
  multiply: Function
  parse: Function
  // ... 350+ functions
}
```

### Lazy Loading

Functions are instantiated on first access:

```javascript
// Internal proxy mechanism (simplified)
Object.defineProperty(math, 'add', {
  get: function() {
    if (!_add) {
      _add = createAdd(scope)
    }
    return _add
  },
  configurable: true
})
```

---

## Configuration System

### Configuration Options

```typescript
// src/core/config.ts
export interface ConfigOptions {
  // Comparison tolerances
  relTol: number           // Default: 1e-12 (relative tolerance)
  absTol: number           // Default: 1e-15 (absolute tolerance)

  // Default output types
  matrix: 'Matrix' | 'Array'        // Default: 'Matrix'
  number: 'number' | 'BigNumber' | 'bigint' | 'Fraction'  // Default: 'number'
  numberFallback: 'number' | 'BigNumber'  // Fallback for bigint overflow

  // Precision
  precision: number        // Default: 64 (BigNumber significant digits)

  // Behavior
  predictable: boolean     // Default: false (deterministic output types)
  randomSeed: string | null  // Default: null (seeded RNG)

  // Legacy
  legacySubset: boolean    // Default: false (matrix subset behavior)
}
```

### Configuration Change Events

```javascript
// Configuration changes trigger events
math.on('config', (newConfig, oldConfig, changedKeys) => {
  // Functions with recreateOnConfigChange meta are recreated
})

// Example: changing precision
math.config({ precision: 128 })
// Triggers recreation of BigNumber-dependent functions
```

### Config-Dependent Behavior

```javascript
// Functions can access config at runtime
const createSqrt = factory('sqrt', ['typed', 'config', 'Complex'],
  ({ typed, config, Complex }) => {
    return typed('sqrt', {
      'number': function(x) {
        if (x >= 0 || config.predictable) {
          return Math.sqrt(x)
        } else {
          // Return Complex for negative numbers
          return new Complex(x, 0).sqrt()
        }
      }
    })
  }
)
```

---

## Matrix Architecture

### Matrix Class Hierarchy

```
                    ┌─────────────┐
                    │   Matrix    │  (Abstract base)
                    │  (base.js)  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│  DenseMatrix    │ │  SparseMatrix   │ │ ImmutableDenseMatrix│
│ (nested arrays) │ │ (CSR format)    │ │ (functional style)  │
└─────────────────┘ └─────────────────┘ └─────────────────────┘
```

### DenseMatrix Storage

```javascript
// src/type/matrix/DenseMatrix.js
class DenseMatrix extends Matrix {
  constructor(data, datatype) {
    this._data = data        // Nested arrays: [[1,2],[3,4]]
    this._size = [rows, cols] // Dimensions
    this._datatype = datatype // Optional type hint
  }

  get(index) {
    // Navigate nested structure
    let data = this._data
    for (const i of index) {
      data = data[i]
    }
    return data
  }

  set(index, value) {
    // Returns new matrix (immutable)
    const newData = clone(this._data)
    // Navigate and set
    return new DenseMatrix(newData, this._datatype)
  }
}
```

### SparseMatrix Storage (CSR)

```javascript
// src/type/matrix/SparseMatrix.js
// Compressed Sparse Row format
class SparseMatrix extends Matrix {
  constructor(data) {
    this._values = []   // Non-zero values
    this._index = []    // Column indices
    this._ptr = []      // Row pointers
    this._size = []     // Dimensions
  }

  // Example: 3x3 matrix with values at (0,0)=5, (1,2)=3, (2,0)=1
  // _values: [5, 3, 1]
  // _index:  [0, 2, 0]
  // _ptr:    [0, 1, 2, 3]  (row 0 starts at 0, row 1 at 1, row 2 at 2, end at 3)
}
```

### Matrix Algorithm Suite

Matrix operations use specialized algorithms based on operand types:

```javascript
// src/type/matrix/utils/matrixAlgorithmSuite.js
export function matrixAlgorithmSuite(options) {
  return {
    'DenseMatrix, DenseMatrix': options.DD,   // Dense-Dense
    'DenseMatrix, SparseMatrix': options.DS,  // Dense-Sparse
    'SparseMatrix, DenseMatrix': options.SD,  // Sparse-Dense
    'SparseMatrix, SparseMatrix': options.SS, // Sparse-Sparse
    'DenseMatrix, any': options.Ds,           // Dense-Scalar
    'any, DenseMatrix': options.sD,           // Scalar-Dense
    'SparseMatrix, any': options.Ss,          // Sparse-Scalar
    'any, SparseMatrix': options.sS           // Scalar-Sparse
  }
}
```

### Algorithm Selection

```javascript
// Example: add function with matrix algorithm suite
return typed('add', {
  'any, any': addScalar,

  ...matrixAlgorithmSuite({
    elop: addScalar,           // Element-wise operation
    SS: matAlgo04xSidSid,      // Sparse-Sparse algorithm
    DS: matAlgo01xDSid,        // Dense-Sparse algorithm
    SD: matAlgo10xSids,        // Sparse-Dense algorithm
    Ss: matAlgo11xS0s,         // Sparse-Scalar algorithm
    sS: matAlgo12xSfs          // Scalar-Sparse algorithm
  })
})
```

---

## Expression Parser Architecture

### Parser Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Expression String                             │
│                    "2 * x + sin(y)"                             │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        TOKENIZER                                 │
│  Converts string to token stream                                │
│  [NUMBER:2, OP:*, SYMBOL:x, OP:+, SYMBOL:sin, DELIM:(, ...]    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RECURSIVE DESCENT PARSER                      │
│  Builds AST respecting operator precedence                      │
│  Handles: operators, functions, indexing, assignments           │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ABSTRACT SYNTAX TREE                         │
│                                                                  │
│                      OperatorNode(+)                            │
│                      /            \                             │
│            OperatorNode(*)    FunctionNode(sin)                │
│            /          \              |                          │
│    ConstantNode(2) SymbolNode(x) SymbolNode(y)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Token Types

```javascript
// src/expression/parse.js
const TOKENTYPE = {
  NULL: 0,
  DELIMITER: 1,    // Operators and punctuation
  NUMBER: 2,       // Numeric literals
  SYMBOL: 3,       // Identifiers
  UNKNOWN: 4
}

const DELIMITERS = {
  // Punctuation
  ',': true, '(': true, ')': true, '[': true, ']': true,
  '{': true, '}': true, ';': true,

  // Operators
  '+': true, '-': true, '*': true, '/': true,
  '%': true, '^': true, '!': true,
  '.*': true, './': true, '.^': true,  // Element-wise
  '&': true, '|': true, '~': true,     // Bitwise
  '==': true, '!=': true, '<': true,   // Comparison
  '>': true, '<=': true, '>=': true,
  // ...
}
```

### Operator Precedence

```javascript
// Precedence levels (higher = binds tighter)
const PRECEDENCE = {
  '=': 1,                    // Assignment
  '?': 2,                    // Conditional
  'or': 3,                   // Logical OR
  'xor': 4,                  // Logical XOR
  'and': 5,                  // Logical AND
  '|': 6,                    // Bitwise OR
  '^|': 7,                   // Bitwise XOR
  '&': 8,                    // Bitwise AND
  '==': 9, '!=': 9,          // Equality
  '<': 10, '>': 10,          // Comparison
  '<<': 11, '>>': 11,        // Shift
  '+': 12, '-': 12,          // Addition
  '*': 13, '/': 13, '%': 13, // Multiplication
  '^': 15,                   // Exponentiation
  '!': 16,                   // Factorial
  // ...
}
```

### AST Node Types

```javascript
// 16 node types in src/expression/node/

// Values
ConstantNode      // Literals: 42, "hello", true
SymbolNode        // Variables: x, pi, myVar

// Structures
ArrayNode         // [1, 2, 3]
ObjectNode        // {a: 1, b: 2}
RangeNode         // 1:10, 1:2:10

// Operations
OperatorNode      // x + y, -x, x!
FunctionNode      // sin(x), max(a, b, c)
ConditionalNode   // cond ? a : b
RelationalNode    // a < b < c (chained)

// Access
AccessorNode      // obj.prop, arr[0]
IndexNode         // a[1:3, 2]

// Assignments
AssignmentNode    // x = 5
FunctionAssignmentNode  // f(x) = x^2

// Control
BlockNode         // a; b; c
ParenthesisNode   // (a + b)
```

### Compilation

AST nodes compile to JavaScript functions:

```javascript
// Node base class method
Node.prototype.compile = function() {
  return {
    evaluate: function(scope) {
      // Execute with given variable bindings
    }
  }
}

// OperatorNode compilation example
OperatorNode.prototype._compile = function(math, argNames) {
  const fn = math[this.fn]  // Get operator function
  const args = this.args.map(arg => arg._compile(math, argNames))

  return function(scope) {
    return fn(...args.map(arg => arg(scope)))
  }
}
```

### Expression Transforms

Transforms modify AST during compilation for optimization:

```javascript
// src/expression/transform/
// 50+ transforms for compile-time optimization

// Example: range transform
// Converts range syntax to Range objects
math.expression.transform.range = function(start, end, step) {
  return new Range(start, end, step)
}

// Example: map transform
// Optimizes map for different collection types
math.expression.transform.map = function(x, callback) {
  if (isMatrix(x)) {
    return x.map(callback)
  }
  return x.map(callback)
}
```

---

## WASM Integration Architecture

### Bridge Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    JavaScript Application                        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MatrixWasmBridge.ts                            │
│  • Size threshold checking                                       │
│  • Strategy selection (JS/WASM/Parallel)                        │
│  • Data marshaling                                               │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │  JavaScript      │ │   WASM Module    │ │  Parallel        │
    │  Implementation  │ │   (fast path)    │ │  Workers         │
    └──────────────────┘ └────────┬─────────┘ └──────────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   WasmLoader.ts  │
                        │  • Module loading │
                        │  • Memory mgmt    │
                        │  • GC             │
                        └────────┬─────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │  WASM Binary     │
                        │ (AssemblyScript) │
                        └──────────────────┘
```

### WasmLoader

```typescript
// src/wasm/WasmLoader.ts
class WasmLoader {
  private wasmModule: WasmModule | null = null

  async load(wasmPath?: string): Promise<WasmModule> {
    if (this.wasmModule) return this.wasmModule

    const wasmBytes = await fetch(wasmPath || defaultPath)
    const { instance } = await WebAssembly.instantiate(wasmBytes, imports)

    this.wasmModule = instance.exports
    return this.wasmModule
  }

  // Memory allocation helpers
  allocateFloat64Array(data: number[]): { ptr: number, array: Float64Array } {
    const ptr = this.wasmModule.__new(data.length * 8, Float64Array_ID)
    const array = new Float64Array(this.wasmModule.memory.buffer, ptr, data.length)
    array.set(data)
    return { ptr, array }
  }

  free(ptr: number): void {
    this.wasmModule.__unpin(ptr)
  }

  collect(): void {
    this.wasmModule.__collect()
  }
}
```

### Strategy Selection

```typescript
// src/wasm/MatrixWasmBridge.ts
class MatrixWasmBridge {
  private static readonly MIN_SIZE_FOR_WASM = 1000
  private static readonly MIN_SIZE_FOR_PARALLEL = 10000

  static async multiply(a: Matrix, b: Matrix): Promise<Matrix> {
    const totalSize = a.size()[0] * b.size()[1]

    if (totalSize >= this.MIN_SIZE_FOR_PARALLEL && ParallelMatrix.isAvailable()) {
      return ParallelMatrix.multiply(a, b)
    }

    if (totalSize >= this.MIN_SIZE_FOR_WASM && WasmLoader.isLoaded()) {
      return this.multiplyWasm(a, b)
    }

    return this.multiplyJS(a, b)
  }
}
```

### WASM Module Structure (AssemblyScript)

```typescript
// src/wasm/matrix/multiply.ts
export function multiplyDense(
  a: Float64Array, aRows: i32, aCols: i32,
  b: Float64Array, bRows: i32, bCols: i32
): Float64Array {
  const result = new Float64Array(aRows * bCols)

  // Block multiplication for cache efficiency (64x64 blocks)
  const blockSize = 64

  for (let i0 = 0; i0 < aRows; i0 += blockSize) {
    for (let j0 = 0; j0 < bCols; j0 += blockSize) {
      for (let k0 = 0; k0 < aCols; k0 += blockSize) {
        // Process block
        const iMax = min(i0 + blockSize, aRows)
        const jMax = min(j0 + blockSize, bCols)
        const kMax = min(k0 + blockSize, aCols)

        for (let i = i0; i < iMax; i++) {
          for (let k = k0; k < kMax; k++) {
            const aik = a[i * aCols + k]
            for (let j = j0; j < jMax; j++) {
              result[i * bCols + j] += aik * b[k * bCols + j]
            }
          }
        }
      }
    }
  }

  return result
}

// SIMD-optimized version
export function multiplyDenseSIMD(/* ... */): Float64Array {
  // Uses v128 operations for 2x f64 at a time
}
```

---

## Parallel Computing Architecture

### WorkerPool

```typescript
// src/parallel/WorkerPool.ts
class WorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private activeTasks: Map<string, WorkerTask> = new Map()
  private maxWorkers: number

  constructor(workerScript: string, maxWorkers?: number) {
    this.maxWorkers = maxWorkers || navigator.hardwareConcurrency || 4
    this.initializeWorkers()
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(this.workerScript)
      worker.onmessage = this.handleWorkerMessage.bind(this)
      this.workers.push(worker)
      this.availableWorkers.push(worker)
    }
  }

  async execute<T, R>(data: T, transferables?: Transferable[]): Promise<R> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: generateId(),
        data,
        transferables,
        resolve,
        reject
      }

      if (this.availableWorkers.length > 0) {
        this.runTask(task, this.availableWorkers.pop()!)
      } else {
        this.taskQueue.push(task)
      }
    })
  }

  async terminate(): Promise<void> {
    await Promise.all(this.workers.map(w => w.terminate()))
  }
}
```

### ParallelMatrix

```typescript
// src/parallel/ParallelMatrix.ts
class ParallelMatrix {
  private static pool: WorkerPool | null = null
  private static readonly CHUNK_SIZE = 1000

  static async multiply(
    aData: number[], aRows: number, aCols: number,
    bData: number[], bRows: number, bCols: number
  ): Promise<number[]> {
    const pool = await this.getPool()
    const numWorkers = pool.size

    // Divide rows among workers
    const rowsPerWorker = Math.ceil(aRows / numWorkers)
    const tasks: Promise<number[]>[] = []

    for (let i = 0; i < numWorkers; i++) {
      const startRow = i * rowsPerWorker
      const endRow = Math.min(startRow + rowsPerWorker, aRows)

      if (startRow >= aRows) break

      tasks.push(pool.execute({
        type: 'multiply',
        aData: aData.slice(startRow * aCols, endRow * aCols),
        aCols,
        bData,
        bCols,
        startRow,
        endRow
      }))
    }

    const results = await Promise.all(tasks)
    return this.mergeResults(results, aRows, bCols)
  }

  static async add(aData: number[], bData: number[]): Promise<number[]> {
    // Divide elements into chunks
    const chunks = Math.ceil(aData.length / this.CHUNK_SIZE)
    // ... parallel execution
  }
}
```

### Worker Script

```javascript
// Worker receives tasks and executes operations
self.onmessage = function(e) {
  const { type, ...data } = e.data

  switch (type) {
    case 'multiply':
      const result = multiplyChunk(data)
      self.postMessage({ result }, [result.buffer])  // Transfer ownership
      break
    case 'add':
      // ...
      break
  }
}

function multiplyChunk({ aData, aCols, bData, bCols, startRow, endRow }) {
  const rows = endRow - startRow
  const result = new Float64Array(rows * bCols)

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0
      for (let k = 0; k < aCols; k++) {
        sum += aData[i * aCols + k] * bData[k * bCols + j]
      }
      result[i * bCols + j] = sum
    }
  }

  return result
}
```

---

## Error Handling Strategy

### Custom Error Types

```javascript
// src/error/

// ArgumentsError - Wrong number of arguments
class ArgumentsError extends Error {
  constructor(fn, count, min, max) {
    const msg = `Wrong number of arguments in function ${fn} ` +
                `(${count} provided, ${min}-${max} expected)`
    super(msg)
    this.name = 'ArgumentsError'
  }
}

// DimensionError - Matrix dimension mismatch
class DimensionError extends Error {
  constructor(actual, expected, relation) {
    const msg = `Dimension mismatch ${relation} ` +
                `(${actual} ${relation} ${expected})`
    super(msg)
    this.name = 'DimensionError'
  }
}

// IndexError - Out of bounds access
class IndexError extends Error {
  constructor(index, min, max) {
    const msg = `Index out of range (${index} not in [${min}, ${max}])`
    super(msg)
    this.name = 'IndexError'
  }
}
```

### Error Propagation

```javascript
// Typed-function provides informative errors
math.add('hello', 'world')
// TypeError: Unexpected type of argument in function add
// (expected: number or Complex or BigNumber or ..., actual: string, index: 0)

// Matrix operations validate dimensions
math.multiply([[1,2]], [[1,2]])
// DimensionError: Dimension mismatch in multiplication
// (columns of A (2) != rows of B (1))
```

---

## Build System Architecture

### Gulp Pipeline

```javascript
// gulpfile.js
const tasks = {
  // Compile ES modules to different formats
  compile: parallel(
    compileESM,      // ES modules → lib/esm/
    compileCJS,      // CommonJS → lib/cjs/
    compileTS        // TypeScript → lib/typescript/
  ),

  // Build browser bundle
  bundle: series(
    compile,
    webpackBundle    // → lib/browser/math.js
  ),

  // Build WASM modules
  wasm: series(
    compileAssemblyScript,  // → lib/wasm/
    optimizeWasm
  ),

  // Generate documentation
  docs: series(
    extractJSDoc,
    generateMarkdown
  ),

  // Full build
  build: series(
    clean,
    parallel(compile, bundle, wasm),
    docs,
    generateEntries
  )
}
```

### Output Structure

```
lib/
├── esm/                    # ES Modules
│   ├── index.js
│   ├── core/
│   ├── function/
│   └── ...
├── cjs/                    # CommonJS
│   ├── index.js
│   ├── package.json        # { "type": "commonjs" }
│   └── ...
├── browser/                # Browser bundle
│   ├── math.js             # UMD bundle
│   └── math.min.js
├── typescript/             # Compiled TypeScript
│   └── ...
└── wasm/                   # WASM modules
    ├── matrix.wasm
    ├── algebra.wasm
    └── ...
```

### Entry Point Generation

```javascript
// tools/entryGenerator.js
// Generates optimized entry points with dependency graphs

function generateEntry(factories) {
  // Build dependency graph
  const graph = buildDependencyGraph(factories)

  // Generate exports with proper ordering
  const exports = topologicalSort(graph).map(factory =>
    `export { ${factory.fn} } from './${factory.path}'`
  )

  return exports.join('\n')
}
```

---

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) - High-level system overview
- [COMPONENTS.md](./COMPONENTS.md) - Component deep dive
- [DATAFLOW.md](./DATAFLOW.md) - Data flow documentation
