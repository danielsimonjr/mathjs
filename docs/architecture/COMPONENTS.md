# Math.js Component Reference

This document provides a comprehensive reference for all major components in the math.js library, including their purpose, interfaces, and usage patterns.

## Table of Contents

1. [Core Components](#core-components)
2. [Data Type Components](#data-type-components)
3. [Function Categories](#function-categories)
4. [Expression System Components](#expression-system-components)
5. [Matrix Components](#matrix-components)
6. [WASM Components](#wasm-components)
7. [Parallel Computing Components](#parallel-computing-components)
8. [Utility Components](#utility-components)

---

## Core Components

### `create.ts`

**Location:** `src/core/create.ts`

**Purpose:** Main entry point for creating math.js instances with dependency injection.

**Exports:**
```typescript
export function create(
  factories: FactoryFunctionMap,
  config?: ConfigOptions
): MathJsInstance
```

**Key Responsibilities:**
- Initialize configuration with defaults
- Set up type checking functions (30+)
- Create dependency injection scope
- Import and instantiate factories
- Set up event emission system
- Handle configuration change events

**Usage:**
```javascript
import { create, all } from 'mathjs'

// Create full instance
const math = create(all)

// Create with custom config
const math = create(all, {
  number: 'BigNumber',
  precision: 128
})

// Create minimal instance
import { createAdd, createMultiply } from 'mathjs'
const math = create({ createAdd, createMultiply })
```

---

### `config.ts`

**Location:** `src/core/config.ts`

**Purpose:** Configuration management and defaults.

**Exports:**
```typescript
export interface ConfigOptions {
  relTol: number           // Relative tolerance (default: 1e-12)
  absTol: number           // Absolute tolerance (default: 1e-15)
  matrix: 'Matrix' | 'Array'
  number: 'number' | 'BigNumber' | 'bigint' | 'Fraction'
  numberFallback: 'number' | 'BigNumber'
  precision: number        // BigNumber precision (default: 64)
  predictable: boolean     // Deterministic output (default: false)
  randomSeed: string | null
  legacySubset: boolean
}

export const DEFAULT_CONFIG: ConfigOptions
```

**Configuration Effects:**

| Option | Effect |
|--------|--------|
| `matrix` | Default output type for matrix operations |
| `number` | Default numeric type for parsing expressions |
| `precision` | Significant digits for BigNumber operations |
| `predictable` | Forces deterministic output types |
| `randomSeed` | Enables reproducible random numbers |

---

### `typed.ts`

**Location:** `src/core/function/typed.ts`

**Purpose:** Integration with typed-function library for multi-type dispatch.

**Key Features:**
- Registers 30+ custom types
- Configures type conversion chains
- Provides typed function creation

**Type Hierarchy:**
```
any
├── number
├── BigNumber
├── bigint
├── Complex
├── Fraction
├── string
├── boolean
├── null
├── undefined
├── Array
├── Matrix
│   ├── DenseMatrix
│   └── SparseMatrix
├── Unit
├── Range
├── Index
├── ResultSet
├── Chain
├── Help
├── Function
├── Date
├── RegExp
├── Object
│   ├── Map
│   ├── PartitionedMap
│   └── ObjectWrappingMap
└── Node (expression nodes)
    ├── AccessorNode
    ├── ArrayNode
    ├── AssignmentNode
    ├── BlockNode
    ├── ConditionalNode
    ├── ConstantNode
    ├── FunctionAssignmentNode
    ├── FunctionNode
    ├── IndexNode
    ├── ObjectNode
    ├── OperatorNode
    ├── ParenthesisNode
    ├── RangeNode
    ├── RelationalNode
    └── SymbolNode
```

---

### `factory.js`

**Location:** `src/utils/factory.js`

**Purpose:** Factory function creation and dependency management.

**Exports:**
```javascript
export function factory(name, dependencies, create, meta)
export function sortFactories(factories)
export function isFactory(obj)
export function assertDependencies(name, dependencies, scope)
export function isOptionalDependency(dependency)
export function stripOptionalNotation(dependency)
```

**Factory Metadata Options:**
```javascript
{
  isClass: boolean,              // Factory creates a class
  recreateOnConfigChange: boolean,  // Recreate on config update
  lazy: boolean                  // Lazy vs eager instantiation
}
```

---

### `import.js`

**Location:** `src/core/function/import.js`

**Purpose:** Runtime import and registration of functions.

**Interface:**
```javascript
math.import(functions, options)
```

**Options:**
```javascript
{
  override: false,      // Allow overriding existing functions
  silent: false,        // Suppress warnings
  wrap: true           // Wrap in typed-function
}
```

**Import Scenarios:**
```javascript
// Import single function
math.import({ myFunc: (x) => x * 2 })

// Import factory function
math.import({ createMyFunc: factory(...) })

// Import from object
math.import(require('./my-extensions'))

// Override existing
math.import({ add: myAdd }, { override: true })
```

---

## Data Type Components

### `Complex.ts`

**Location:** `src/type/complex/Complex.ts`

**Purpose:** Complex number representation and operations.

**Structure:**
```typescript
class Complex {
  re: number      // Real part
  im: number      // Imaginary part

  // Construction
  constructor(re: number, im: number)
  static fromPolar(r: number, phi: number): Complex

  // Arithmetic
  add(other: Complex): Complex
  sub(other: Complex): Complex
  mul(other: Complex): Complex
  div(other: Complex): Complex
  neg(): Complex
  conjugate(): Complex

  // Functions
  sqrt(): Complex
  exp(): Complex
  log(): Complex
  pow(n: Complex): Complex
  sin(): Complex
  cos(): Complex

  // Conversion
  abs(): number           // Magnitude
  arg(): number           // Angle
  toPolar(): { r: number, phi: number }
  toString(): string
  toJSON(): { mathjs: 'Complex', re: number, im: number }
}
```

**Type Identity:**
```javascript
Complex.prototype.type = 'Complex'
Complex.prototype.isComplex = true
```

---

### `BigNumber.ts`

**Location:** `src/type/bignumber/BigNumber.ts`

**Purpose:** Arbitrary precision decimal numbers.

**Key Features:**
- Configurable precision (significant digits)
- All arithmetic operations
- Comparison with tolerance
- Conversion to/from other types

**Configuration:**
```javascript
math.config({ precision: 128 })  // 128 significant digits
```

**Operations:**
```javascript
const a = math.bignumber('0.1')
const b = math.bignumber('0.2')
const c = math.add(a, b)  // Exactly 0.3, no floating-point error
```

---

### `Fraction.ts`

**Location:** `src/type/fraction/Fraction.ts`

**Purpose:** Exact rational number representation.

**Structure:**
```typescript
class Fraction {
  n: bigint     // Numerator
  d: bigint     // Denominator (always positive)
  s: number     // Sign (-1, 0, 1)

  // Arithmetic preserves exactness
  add(other: Fraction): Fraction
  sub(other: Fraction): Fraction
  mul(other: Fraction): Fraction
  div(other: Fraction): Fraction

  // Conversion
  valueOf(): number
  toString(): string
  toLatex(): string
}
```

**Usage:**
```javascript
const half = math.fraction(1, 2)
const third = math.fraction(1, 3)
const sum = math.add(half, third)  // 5/6 (exact)
```

---

### `Unit.ts`

**Location:** `src/type/unit/Unit.ts`

**Purpose:** Physical quantities with units.

**Structure:**
```typescript
class Unit {
  value: number | BigNumber | Fraction | Complex | null
  units: UnitComponent[]
  fixPrefix: boolean

  // Conversion
  to(targetUnit: string | Unit): Unit
  toNumber(targetUnit?: string): number
  toSI(): Unit

  // Arithmetic
  add(other: Unit): Unit      // Requires compatible units
  multiply(other: Unit): Unit  // Creates compound unit
  divide(other: Unit): Unit

  // Query
  equalBase(other: Unit): boolean
  equals(other: Unit): boolean
}
```

**Built-in Units:**
```
Length: m, cm, mm, km, inch, ft, yard, mile, ...
Mass: kg, g, mg, lb, oz, ton, ...
Time: s, ms, min, hour, day, week, year, ...
Electric: A, V, W, Ohm, F, H, ...
Temperature: K, degC, degF, degR
And many more...
```

**Custom Units:**
```javascript
math.createUnit('furlong', '201.168 m')
math.createUnit('fortnight', '14 day')
```

---

### `DenseMatrix.js`

**Location:** `src/type/matrix/DenseMatrix.js`

**Purpose:** Multi-dimensional dense array storage.

**Structure:**
```javascript
class DenseMatrix extends Matrix {
  _data: any[][]        // Nested arrays
  _size: number[]       // Dimensions [rows, cols, ...]
  _datatype: string     // Optional type hint

  // Access
  get(index: number[]): any
  set(index: number[], value: any): DenseMatrix

  // Iteration
  forEach(callback: (value, index, matrix) => void): void
  map(callback: (value, index, matrix) => any): DenseMatrix

  // Manipulation
  resize(size: number[], defaultValue?: any): DenseMatrix
  reshape(size: number[]): DenseMatrix
  transpose(): DenseMatrix
  clone(): DenseMatrix

  // Conversion
  toArray(): any[][]
  valueOf(): any[][]
  toJSON(): object
}
```

---

### `SparseMatrix.js`

**Location:** `src/type/matrix/SparseMatrix.js`

**Purpose:** Compressed Sparse Row (CSR) matrix storage.

**Structure:**
```javascript
class SparseMatrix extends Matrix {
  _values: any[]     // Non-zero values
  _index: number[]   // Column indices
  _ptr: number[]     // Row pointers
  _size: number[]    // [rows, cols]
  _datatype: string

  // Same interface as DenseMatrix
  get(index: number[]): any
  set(index: number[], value: any): SparseMatrix
  // ...
}
```

**Memory Efficiency:**
```
Dense 1000x1000 with 1% non-zero:
  - Dense: 8 MB (1M × 8 bytes)
  - Sparse: ~160 KB (10K values + indices)
```

**CSR Format Example:**
```javascript
// Matrix:
// [5, 0, 0]
// [0, 8, 0]
// [0, 0, 3]

_values: [5, 8, 3]     // Non-zero values
_index:  [0, 1, 2]     // Column indices
_ptr:    [0, 1, 2, 3]  // Row i starts at _ptr[i]
```

---

### `Chain.ts`

**Location:** `src/type/chain/Chain.ts`

**Purpose:** Fluent chaining API.

**Interface:**
```typescript
class Chain<T> {
  private value: T

  constructor(value: T)

  // All math functions are available as methods
  add(y: any): Chain<T>
  multiply(y: any): Chain<T>
  sqrt(): Chain<T>
  // ... 350+ methods

  // Extraction
  done(): T
  valueOf(): T
  toString(): string
}
```

**Usage:**
```javascript
const result = math.chain(3)
  .add(4)
  .multiply(2)
  .sqrt()
  .done()  // 3.7416...

// Equivalent to:
math.sqrt(math.multiply(math.add(3, 4), 2))
```

---

## Function Categories

### Arithmetic (`src/function/arithmetic/`)

**81 functions** for basic mathematical operations.

| Function | Description | Signatures |
|----------|-------------|------------|
| `add` | Addition | `(x, y, ...rest)` |
| `subtract` | Subtraction | `(x, y)` |
| `multiply` | Multiplication | `(x, y, ...rest)` |
| `divide` | Division | `(x, y)` |
| `mod` | Modulus | `(x, y)` |
| `pow` | Exponentiation | `(x, y)` |
| `sqrt` | Square root | `(x)` |
| `cbrt` | Cube root | `(x)` |
| `nthRoot` | Nth root | `(x, n)` |
| `abs` | Absolute value | `(x)` |
| `sign` | Sign function | `(x)` |
| `ceil` | Ceiling | `(x)` |
| `floor` | Floor | `(x)` |
| `round` | Rounding | `(x, n?)` |
| `fix` | Truncation | `(x)` |
| `exp` | Exponential | `(x)` |
| `log` | Natural log | `(x)` |
| `log10` | Base-10 log | `(x)` |
| `log2` | Base-2 log | `(x)` |
| `gcd` | GCD | `(a, b, ...rest)` |
| `lcm` | LCM | `(a, b, ...rest)` |
| ... | | |

---

### Algebra (`src/function/algebra/`)

**20+ functions** for symbolic and algebraic operations.

| Function | Description |
|----------|-------------|
| `derivative` | Symbolic differentiation |
| `simplify` | Expression simplification |
| `simplifyCore` | Core simplification rules |
| `simplifyConstant` | Constant folding |
| `rationalize` | Rationalize expression |
| `resolve` | Resolve symbolic references |
| `lup` | LU decomposition with pivoting |
| `qr` | QR decomposition |
| `slu` | Sparse LU decomposition |
| `lsolve` | Lower triangular solve |
| `usolve` | Upper triangular solve |
| `lsolveAll` | All solutions to Lx=b |
| `usolveAll` | All solutions to Ux=b |
| `polynomialRoot` | Polynomial roots |
| `leafCount` | Expression complexity |

**Simplification Rules:**
```javascript
// Built-in rules
math.simplify('x + x')        // '2 * x'
math.simplify('x * 1')        // 'x'
math.simplify('x^0')          // '1'
math.simplify('log(e^x)')     // 'x'

// Custom rules
math.simplify('x + x', [
  { l: 'n1 + n2', r: 'n1 * 2' }
])
```

---

### Matrix (`src/function/matrix/`)

**50+ functions** for matrix and array operations.

| Function | Description |
|----------|-------------|
| `matrix` | Create matrix |
| `zeros` | Zero matrix |
| `ones` | Ones matrix |
| `eye`/`identity` | Identity matrix |
| `diag` | Diagonal matrix |
| `sparse` | Create sparse matrix |
| `det` | Determinant |
| `inv` | Inverse |
| `pinv` | Pseudoinverse |
| `transpose` | Transpose |
| `ctranspose` | Conjugate transpose |
| `trace` | Matrix trace |
| `eigs` | Eigenvalues/vectors |
| `svd` | SVD (future) |
| `concat` | Concatenation |
| `subset` | Submatrix extraction |
| `reshape` | Change dimensions |
| `flatten` | Flatten to 1D |
| `squeeze` | Remove size-1 dims |
| `size` | Get dimensions |
| `dot` | Dot product |
| `cross` | Cross product |
| `kron` | Kronecker product |
| `expm` | Matrix exponential |
| `sqrtm` | Matrix square root |
| `sylvester` | Sylvester equation |
| `schur` | Schur decomposition |
| `lyap` | Lyapunov equation |

---

### Trigonometry (`src/function/trigonometry/`)

**25+ functions** for trigonometric operations.

| Function | Description |
|----------|-------------|
| `sin`, `cos`, `tan` | Basic trig |
| `sec`, `csc`, `cot` | Reciprocal trig |
| `asin`, `acos`, `atan` | Inverse trig |
| `asec`, `acsc`, `acot` | Inverse reciprocal |
| `atan2` | Two-argument arctangent |
| `sinh`, `cosh`, `tanh` | Hyperbolic |
| `sech`, `csch`, `coth` | Hyperbolic reciprocal |
| `asinh`, `acosh`, `atanh` | Inverse hyperbolic |

**Angle Units:**
```javascript
math.sin(math.unit(90, 'deg'))  // 1
math.sin(math.pi / 2)           // 1
```

---

### Statistics (`src/function/statistics/`)

**30+ functions** for statistical analysis.

| Function | Description |
|----------|-------------|
| `mean` | Arithmetic mean |
| `median` | Median value |
| `mode` | Mode(s) |
| `std` | Standard deviation |
| `variance` | Variance |
| `sum` | Sum of values |
| `prod` | Product of values |
| `min`, `max` | Extrema |
| `quantileSeq` | Quantiles |
| `mad` | Median absolute deviation |
| `corr` | Correlation |
| `zeta` | Riemann zeta |
| `cumsum` | Cumulative sum |
| `count` | Element count |

**Normalization Options:**
```javascript
// Sample vs population
math.std([1, 2, 3], 'uncorrected')  // Population std
math.std([1, 2, 3], 'biased')       // Biased
math.std([1, 2, 3])                 // Sample (default)
```

---

### Probability (`src/function/probability/`)

**Random number generation and distributions.**

| Function | Description |
|----------|-------------|
| `random` | Uniform random |
| `randomInt` | Random integer |
| `pickRandom` | Random selection |
| `permutations` | Permutation count |
| `combinations` | Combination count |
| `combinationsWithRep` | With replacement |
| `factorial` | Factorial |
| `gamma` | Gamma function |
| `lgamma` | Log gamma |
| `multinomial` | Multinomial coefficient |

**Seeded Random:**
```javascript
math.config({ randomSeed: 'seed123' })
math.random()  // Reproducible
```

---

### Special Functions (`src/function/special/`)

**15+ special mathematical functions.**

| Function | Description |
|----------|-------------|
| `erf` | Error function |
| `zeta` | Riemann zeta |
| `gamma` | Gamma function |
| `lgamma` | Log gamma |
| `beta` | Beta function |
| `besselJ` | Bessel J |
| `besselY` | Bessel Y |
| `besselI` | Modified Bessel I |
| `besselK` | Modified Bessel K |
| `airyAi` | Airy Ai |
| `airyBi` | Airy Bi |

---

## Expression System Components

### `Parser.js`

**Location:** `src/expression/Parser.js`

**Purpose:** Stateful expression parser with scope.

**Interface:**
```javascript
class Parser {
  constructor()

  // Parsing and evaluation
  parse(expr: string): Node
  evaluate(expr: string): any
  compile(expr: string): { evaluate: Function }

  // Scope management
  get(name: string): any
  set(name: string, value: any): void
  getAll(): object
  remove(name: string): void
  clear(): void
}
```

**Usage:**
```javascript
const parser = math.parser()

parser.evaluate('x = 5')
parser.evaluate('y = x * 2')
parser.evaluate('y')  // 10

parser.set('z', 15)
parser.evaluate('x + y + z')  // 30
```

---

### `parse.js`

**Location:** `src/expression/parse.js`

**Purpose:** Stateless expression parsing to AST.

**Interface:**
```javascript
math.parse(expr: string, options?: ParseOptions): Node
math.parse(exprs: string[]): Node[]
```

**Parse Options:**
```javascript
{
  nodes: {
    // Custom node definitions
    myNode: MyNodeClass
  }
}
```

---

### AST Node Classes

**Location:** `src/expression/node/`

#### `Node.js` (Base Class)

```javascript
class Node {
  // Compilation
  compile(): { evaluate: (scope) => any }
  _compile(math, argNames): Function

  // Evaluation
  evaluate(scope?: object): any

  // String conversion
  toString(options?: object): string
  toTex(options?: object): string
  toHTML(options?: object): string

  // Tree operations
  forEach(callback: (node, path, parent) => void): void
  map(callback: (node, path, parent) => Node): Node
  traverse(callback: (node, path, parent) => void): void
  transform(callback: (node, path, parent) => Node): Node
  filter(callback: (node) => boolean): Node[]
  find(callback: (node) => boolean): Node[]
  clone(): Node
  cloneDeep(): Node
  equals(other: Node): boolean

  // Type info
  type: string
  isNode: true
}
```

#### `ConstantNode.js`

```javascript
class ConstantNode extends Node {
  value: number | string | boolean | null | undefined
  valueType: 'number' | 'string' | 'boolean' | ...

  constructor(value: any)
}
```

#### `SymbolNode.js`

```javascript
class SymbolNode extends Node {
  name: string

  constructor(name: string)
}
```

#### `OperatorNode.js`

```javascript
class OperatorNode extends Node {
  op: string           // '+', '-', '*', etc.
  fn: string           // 'add', 'subtract', 'multiply', etc.
  args: Node[]         // Operands
  implicit: boolean    // Implicit multiplication

  constructor(op: string, fn: string, args: Node[], implicit?: boolean)
}
```

#### `FunctionNode.js`

```javascript
class FunctionNode extends Node {
  fn: Node             // Function reference (SymbolNode or AccessorNode)
  args: Node[]         // Arguments

  constructor(fn: Node | string, args: Node[])
}
```

#### `ArrayNode.js`

```javascript
class ArrayNode extends Node {
  items: Node[]

  constructor(items: Node[])
}
```

#### `ObjectNode.js`

```javascript
class ObjectNode extends Node {
  properties: { [key: string]: Node }

  constructor(properties: object)
}
```

#### `AssignmentNode.js`

```javascript
class AssignmentNode extends Node {
  object: SymbolNode | AccessorNode
  index: IndexNode | null
  value: Node

  constructor(object: Node, index: Node | null, value: Node)
}
```

#### `FunctionAssignmentNode.js`

```javascript
class FunctionAssignmentNode extends Node {
  name: string
  params: string[]
  expr: Node

  constructor(name: string, params: string[], expr: Node)
}
```

#### `ConditionalNode.js`

```javascript
class ConditionalNode extends Node {
  condition: Node
  trueExpr: Node
  falseExpr: Node

  constructor(condition: Node, trueExpr: Node, falseExpr: Node)
}
```

#### `RangeNode.js`

```javascript
class RangeNode extends Node {
  start: Node
  end: Node
  step: Node | null

  constructor(start: Node, end: Node, step?: Node)
}
```

---

## WASM Components

### `WasmLoader.ts`

**Location:** `src/wasm/WasmLoader.ts`

**Purpose:** WASM module loading and memory management.

**Interface:**
```typescript
class WasmLoader {
  // Loading
  async load(path?: string): Promise<WasmModule>
  isLoaded(): boolean

  // Memory management
  allocateFloat64Array(data: number[]): { ptr: number, array: Float64Array }
  allocateInt32Array(data: number[]): { ptr: number, array: Int32Array }
  free(ptr: number): void
  collect(): void

  // Available operations
  multiplyDense(...): Float64Array
  multiplyDenseSIMD(...): Float64Array
  transpose(...): Float64Array
  add(...): Float64Array
  luDecomposition(...): object
  qrDecomposition(...): object
  fft(...): Float64Array
  // ...
}
```

---

### `MatrixWasmBridge.ts`

**Location:** `src/wasm/MatrixWasmBridge.ts`

**Purpose:** Strategy selection for matrix operations.

**Interface:**
```typescript
class MatrixWasmBridge {
  static readonly MIN_SIZE_FOR_WASM: number
  static readonly MIN_SIZE_FOR_PARALLEL: number

  // Operations with automatic strategy selection
  static async multiply(a: Matrix, b: Matrix): Promise<Matrix>
  static async add(a: Matrix, b: Matrix): Promise<Matrix>
  static async transpose(a: Matrix): Promise<Matrix>
  static async lu(a: Matrix): Promise<LUResult>
  static async qr(a: Matrix): Promise<QRResult>

  // Force specific backend
  static multiplyJS(a: Matrix, b: Matrix): Matrix
  static multiplyWasm(a: Matrix, b: Matrix): Matrix
  static multiplyParallel(a: Matrix, b: Matrix): Promise<Matrix>
}
```

---

### WASM Modules (`src/wasm/`)

**Built with AssemblyScript, compiled to WebAssembly.**

| Module | Operations |
|--------|------------|
| `matrix/multiply.ts` | Dense multiply, SIMD multiply, transpose |
| `algebra/decomposition.ts` | LU, QR, Cholesky, determinant |
| `signal/fft.ts` | FFT, IFFT, 2D FFT, convolution |
| `numeric/ode.ts` | RK45, RK23 ODE solvers |
| `arithmetic/basic.ts` | Add, subtract, multiply, divide |
| `arithmetic/advanced.ts` | Pow, sqrt, cbrt, nthRoot |
| `arithmetic/logarithmic.ts` | Log, log10, log2, exp |
| `trigonometry/basic.ts` | Sin, cos, tan, atan2 |
| `statistics/basic.ts` | Mean, std, variance, sum |
| `bitwise/operations.ts` | AND, OR, XOR, shifts |
| `combinatorics/basic.ts` | Factorial, permutations |

---

## Parallel Computing Components

### `WorkerPool.ts`

**Location:** `src/parallel/WorkerPool.ts`

**Purpose:** Web Worker pool management.

**Interface:**
```typescript
class WorkerPool {
  constructor(workerScript: string, maxWorkers?: number)

  // Task execution
  async execute<T, R>(data: T, transferables?: Transferable[]): Promise<R>

  // Pool management
  get size(): number
  get busy(): number
  get idle(): number
  async terminate(): Promise<void>
  async resize(newSize: number): Promise<void>
}
```

---

### `ParallelMatrix.ts`

**Location:** `src/parallel/ParallelMatrix.ts`

**Purpose:** Parallel matrix operations.

**Interface:**
```typescript
class ParallelMatrix {
  static isAvailable(): boolean

  // Parallel operations
  static async multiply(
    aData: number[], aRows: number, aCols: number,
    bData: number[], bRows: number, bCols: number
  ): Promise<number[]>

  static async add(
    aData: number[],
    bData: number[],
    size: number
  ): Promise<number[]>

  static async transpose(
    data: number[],
    rows: number,
    cols: number
  ): Promise<number[]>

  // Configuration
  static setWorkerCount(count: number): void
  static getWorkerCount(): number
}
```

---

## Utility Components

### `is.js`

**Location:** `src/utils/is.js`

**Purpose:** Type checking utilities.

**Exports:**
```javascript
// Primitive types
export function isNumber(x): boolean
export function isString(x): boolean
export function isBoolean(x): boolean
export function isBigInt(x): boolean

// Math.js types
export function isComplex(x): boolean
export function isBigNumber(x): boolean
export function isFraction(x): boolean
export function isUnit(x): boolean
export function isMatrix(x): boolean
export function isDenseMatrix(x): boolean
export function isSparseMatrix(x): boolean
export function isRange(x): boolean
export function isIndex(x): boolean
export function isChain(x): boolean
export function isResultSet(x): boolean

// Collections
export function isArray(x): boolean
export function isCollection(x): boolean  // Array or Matrix

// Expression nodes
export function isNode(x): boolean
export function isConstantNode(x): boolean
export function isSymbolNode(x): boolean
export function isOperatorNode(x): boolean
export function isFunctionNode(x): boolean
// ... 16 node type checks

// Utilities
export function typeOf(x): string
```

---

### `object.js`

**Location:** `src/utils/object.js`

**Purpose:** Object manipulation utilities.

**Exports:**
```javascript
export function clone(x): any
export function deepStrictEqual(a, b): boolean
export function hasOwnProperty(obj, key): boolean
export function pickShallow(obj, keys): object
export function deepFlatten(obj): Array
export function isLegacyFactory(obj): boolean
export function lazy(obj, prop, factory): void
export function get(obj, path): any
export function set(obj, path, value): void
```

---

### `array.js`

**Location:** `src/utils/array.js`

**Purpose:** Array manipulation utilities.

**Exports:**
```javascript
export function arraySize(x): number[]
export function validate(array, size): void
export function validateIndex(index, length): void
export function resize(array, size, defaultValue): Array
export function reshape(array, sizes): Array
export function squeeze(array): Array
export function unsqueeze(array, dims): Array
export function flatten(array): Array
export function broadcastTo(array, targetSize): Array
export function broadcastSizes(...sizes): number[]
export function get(array, index): any
export function set(array, index, value): void
export function getArrayDataType(array, typeOf): string
```

---

### `collection.js`

**Location:** `src/utils/collection.js`

**Purpose:** Collection iteration utilities.

**Exports:**
```javascript
export function deepMap(array, callback): Array
export function deepForEach(array, callback): void
export function containsCollections(array): boolean
export function reduce(array, callback, initial): any
export function filter(array, callback): Array
```

---

### `string.js`

**Location:** `src/utils/string.js`

**Purpose:** String formatting utilities.

**Exports:**
```javascript
export function format(value, options): string
export function stringify(value): string
export function escape(value): string
export function endsWith(str, suffix): boolean
export function formatNumberToBase(value, base, size): string
```

**Format Options:**
```javascript
{
  notation: 'auto' | 'fixed' | 'exponential' | 'engineering',
  precision: number,
  lowerExp: number,
  upperExp: number,
  fraction: 'ratio' | 'decimal'
}
```

---

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) - High-level architecture
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed design patterns
- [DATAFLOW.md](./DATAFLOW.md) - Data flow through the system
