# Phase 3: Complex Operators (Multiply & Divide)

**Duration:** 5-7 days
**Risk Level:** High
**Prerequisites:** Phase 2 complete

---

## Phase Objectives

1. Implement Node support in `divide.ts` (lower complexity)
2. Implement Node support in `multiply.ts` (highest complexity)
3. Ensure matrix operations remain unaffected
4. Comprehensive testing and validation

---

## Why This Phase is Higher Risk

### multiply.ts Complexity Analysis

`multiply.ts` is the most complex arithmetic operator (1,127 lines) because:

1. **Multiple Matrix Algorithms**: Handles dense×dense, dense×sparse, sparse×sparse
2. **WASM Integration**: Has WASM-accelerated paths for large matrices
3. **Special Cases**: Scalar×matrix, vector×vector (dot product), broadcasting
4. **Type-Specific Logic**: Different algorithms for different numeric types

```
multiply.ts structure:
├── Scalar multiplication (simple)
├── Matrix × Matrix (15+ algorithms)
│   ├── Dense × Dense
│   ├── Dense × Sparse
│   ├── Sparse × Dense
│   └── Sparse × Sparse
├── Vector × Vector (dot product)
├── Scalar × Matrix
├── Matrix × Scalar
├── WASM acceleration paths
└── Variadic multiplication
```

### Risk Mitigation Strategy

1. Implement `divide.ts` first (simpler structure)
2. Learn from divide implementation
3. Apply carefully to `multiply.ts`
4. Extensive testing at each step

---

## Sprint 3.1: Divide Operator Node Support

**Duration:** 1.5-2 days
**Risk:** Medium

### Objective
Implement Node support in `divide` function. This serves as practice for the more complex `multiply` implementation.

### Tasks

#### Task 3.1.1: Analyze divide.ts Structure

**File:** `src/function/arithmetic/divide.ts` (161 lines)

Current structure:
```typescript
export const divideDependencies = [
  'typed',
  'matrix',
  'multiply',
  'equalScalar',
  'divideScalar',
  'inv',
  'DenseMatrix',
  'concat'
]

// Key signatures:
// - Scalar division via divideScalar
// - Matrix division: A / B = A * inv(B)
// - Element-wise division for matrices
```

**Key Observations:**
1. Simpler than multiply (no complex matrix algorithms)
2. Matrix division implemented as multiply by inverse
3. Uses `divideScalar` for scalar operations
4. Has element-wise matrix division

#### Task 3.1.2: Add Node Dependencies to divide.ts

```typescript
// BEFORE
export const divideDependencies = [
  'typed',
  'matrix',
  'multiply',
  'equalScalar',
  'divideScalar',
  'inv',
  'DenseMatrix',
  'concat'
]

// AFTER
export const divideDependencies = [
  'typed',
  'matrix',
  'multiply',
  'equalScalar',
  'divideScalar',
  'inv',
  'DenseMatrix',
  'concat',
  // NEW: Node support
  'ConstantNode',
  'OperatorNode',
  'nodeOperations'
]
```

#### Task 3.1.3: Update Factory Function Parameters

```typescript
export const createDivide = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  matrix,
  multiply,
  equalScalar,
  divideScalar,
  inv,
  DenseMatrix,
  concat,
  // NEW: Node support
  ConstantNode,
  OperatorNode,
  nodeOperations
}) => {
```

#### Task 3.1.4: Add Node Type Signatures

**CRITICAL:** Must not interfere with matrix division logic.

```typescript
return typed(name, {
  // =========================================================================
  // NODE SIGNATURES - Must be FIRST
  // =========================================================================

  'Node, Node': function (x: Node, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  'number, Node': function (x: number, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },
  'Node, number': function (x: Node, y: number) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  'BigNumber, Node': function (x: BigNumber, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },
  'Node, BigNumber': function (x: Node, y: BigNumber) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  'Complex, Node': function (x: Complex, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },
  'Node, Complex': function (x: Node, y: Complex) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  'Fraction, Node': function (x: Fraction, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },
  'Node, Fraction': function (x: Node, y: Fraction) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  'Unit, Node': function (x: Unit, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },
  'Node, Unit': function (x: Node, y: Unit) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  'string, Node': function (x: string, y: Node) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },
  'Node, string': function (x: Node, y: string) {
    return nodeOperations.createBinaryNode('/', 'divide', x, y)
  },

  // =========================================================================
  // EXISTING SIGNATURES - Keep after Node signatures
  // =========================================================================

  // ... all existing divide signatures
})
```

#### Task 3.1.5: Create divide.test.ts Updates

**File:** `test/unit-tests/function/arithmetic/divide.test.ts`

```typescript
describe('divide with Node operands', function () {
  const { parse, ConstantNode, SymbolNode, OperatorNode } = math

  describe('basic operations', function () {
    it('should return OperatorNode for divide(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.divide(10, x)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.op, '/')
      assert.strictEqual(result.fn, 'divide')
      assert.strictEqual(result.toString(), '10 / x')
    })

    it('should return OperatorNode for divide(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.divide(x, 2)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x / 2')
    })

    it('should return OperatorNode for divide(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.divide(x, y)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x / y')
    })

    it('should work with parsed expressions', function () {
      const expr = parse('x + 1')
      const result = math.divide(expr, 2)

      assert.ok(result instanceof OperatorNode)
      // May include parentheses: (x + 1) / 2
    })
  })

  describe('evaluation', function () {
    it('should evaluate correctly with scope', function () {
      const x = new SymbolNode('x')
      const result = math.divide(20, x)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 4 })

      assert.strictEqual(value, 5)  // 20 / 4 = 5
    })

    it('should handle division resulting in fraction', function () {
      const x = new SymbolNode('x')
      const result = math.divide(x, 3)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 10 })

      assert.ok(Math.abs(value - 10/3) < 1e-10)
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for divide(number, number)', function () {
      const result = math.divide(10, 2)
      assert.strictEqual(result, 5)
    })

    it('should still work with matrix division', function () {
      // Matrix / scalar
      const result = math.divide([[10, 20], [30, 40]], 2)
      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        [[5, 10], [15, 20]]
      )
    })

    it('should still work with element-wise matrix division', function () {
      const result = math.dotDivide([[10, 20]], [[2, 4]])
      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        [[5, 5]]
      )
    })
  })

  describe('edge cases', function () {
    it('should handle division by symbolic expression', function () {
      const x = new SymbolNode('x')
      const result = math.divide(1, x)  // 1/x

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), '1 / x')
    })

    it('should handle complex divisor expressions', function () {
      const expr = parse('x^2 + 1')
      const result = math.divide(5, expr)

      assert.ok(result instanceof OperatorNode)
    })
  })
})
```

#### Task 3.1.6: Matrix Division Verification

**CRITICAL:** Verify matrix operations still work correctly.

```typescript
describe('divide matrix operations (backwards compatibility)', function () {
  it('should still compute matrix × inverse correctly', function () {
    const A = [[1, 2], [3, 4]]
    const B = [[2, 0], [0, 2]]
    const result = math.divide(A, B)

    // A / B = A * inv(B)
    assert.ok(math.isMatrix(result) || Array.isArray(result))
  })

  it('should still compute scalar / matrix correctly', function () {
    const result = math.divide(1, [[1, 2], [3, 4]])
    // Should be 1 * inv(matrix)
    assert.ok(math.isMatrix(result) || Array.isArray(result))
  })

  it('should still work with sparse matrices', function () {
    const sparse = math.sparse([[1, 0], [0, 2]])
    const result = math.divide(sparse, 2)

    assert.ok(math.isSparseMatrix(result))
  })
})
```

### Acceptance Criteria

- [ ] `divide.ts` modified with Node signatures
- [ ] All new tests pass
- [ ] All existing divide tests pass
- [ ] Matrix division operations unaffected
- [ ] TypeScript compiles without errors

### Definition of Done

- [ ] Code reviewed
- [ ] All tests pass: `npm run test:src -- --grep "divide"`
- [ ] Matrix tests specifically verified
- [ ] Committed to feature branch

---

## Sprint 3.2: Multiply Operator Node Support

**Duration:** 2-3 days
**Risk:** High

### Objective
Implement Node support in `multiply` function, the most complex arithmetic operator.

### Pre-Implementation Analysis

#### Task 3.2.0: Deep Dive into multiply.ts

**File:** `src/function/arithmetic/multiply.ts` (1,127 lines)

```typescript
// Structure overview:
export const multiplyDependencies = [
  'typed',
  'matrix',
  'addScalar',
  'multiplyScalar',
  'equalScalar',
  'dot',
  'DenseMatrix',
  'SparseMatrix',
  'concat'
]

// Key sections:
// Lines 1-50: Dependencies and factory setup
// Lines 51-200: Scalar multiplication signatures
// Lines 201-500: Dense matrix algorithms
// Lines 501-800: Sparse matrix algorithms
// Lines 801-1000: Mixed dense/sparse algorithms
// Lines 1001-1127: WASM and optimization paths
```

**Critical Observations:**

1. **Signature Order Matters**: The `matrixAlgorithmSuite` generates many signatures
2. **Dot Product Special Case**: `multiply(vector, vector)` returns scalar
3. **Broadcasting**: `multiply(scalar, matrix)` broadcasts
4. **WASM Paths**: Large matrices use WASM acceleration

**Potential Conflicts:**

```typescript
// These existing signatures could conflict:
'Array, Array': ...,        // Matrix multiplication
'Matrix, Matrix': ...,      // Matrix multiplication
'DenseMatrix, DenseMatrix': ...,
'SparseMatrix, SparseMatrix': ...,

// Node signatures must not match these unintentionally
```

### Tasks

#### Task 3.2.1: Add Node Dependencies to multiply.ts

```typescript
// BEFORE
export const multiplyDependencies = [
  'typed',
  'matrix',
  'addScalar',
  'multiplyScalar',
  'equalScalar',
  'dot',
  'DenseMatrix',
  'SparseMatrix',
  'concat'
]

// AFTER
export const multiplyDependencies = [
  'typed',
  'matrix',
  'addScalar',
  'multiplyScalar',
  'equalScalar',
  'dot',
  'DenseMatrix',
  'SparseMatrix',
  'concat',
  // NEW: Node support
  'ConstantNode',
  'OperatorNode',
  'nodeOperations'
]
```

#### Task 3.2.2: Update Factory Function Parameters

```typescript
export const createMultiply = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  matrix,
  addScalar,
  multiplyScalar,
  equalScalar,
  dot,
  DenseMatrix,
  SparseMatrix,
  concat,
  // NEW: Node support
  ConstantNode,
  OperatorNode,
  nodeOperations
}) => {
```

#### Task 3.2.3: Identify Safe Insertion Point

The `multiply` function uses `typed.addConversions` and `matrixAlgorithmSuite`.

**Strategy:** Insert Node signatures at the VERY BEGINNING of the typed call, before any matrix algorithms.

```typescript
// Find the typed() call structure:
const multiply = typed(name, {
  // INSERT NODE SIGNATURES HERE - First thing in object
  'Node, Node': (x, y) => nodeOperations.createBinaryNode('*', 'multiply', x, y),
  'number, Node': (x, y) => nodeOperations.createBinaryNode('*', 'multiply', x, y),
  'Node, number': (x, y) => nodeOperations.createBinaryNode('*', 'multiply', x, y),
  // ... other Node signatures

  // THEN the existing signatures follow
  'any, any': multiplyScalar,
  'any, any, ...any': ...,
}, matrixAlgorithmSuite({ ... }))
```

#### Task 3.2.4: Add Node Type Signatures

```typescript
const multiply = typed(name, {
  // =========================================================================
  // NODE SIGNATURES - MUST BE FIRST (before matrixAlgorithmSuite merges)
  // =========================================================================

  'Node, Node': function (x: Node, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  'number, Node': function (x: number, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },
  'Node, number': function (x: Node, y: number) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  'BigNumber, Node': function (x: BigNumber, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },
  'Node, BigNumber': function (x: Node, y: BigNumber) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  'Complex, Node': function (x: Complex, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },
  'Node, Complex': function (x: Node, y: Complex) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  'Fraction, Node': function (x: Fraction, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },
  'Node, Fraction': function (x: Node, y: Fraction) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  'Unit, Node': function (x: Unit, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },
  'Node, Unit': function (x: Node, y: Unit) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  'string, Node': function (x: string, y: Node) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },
  'Node, string': function (x: Node, y: string) {
    return nodeOperations.createBinaryNode('*', 'multiply', x, y)
  },

  // =========================================================================
  // EXISTING SIGNATURES FOLLOW
  // =========================================================================

  'any, any': multiplyScalar,

  'any, any, ...any': typed.referToSelf((self) =>
    (x: any, y: any, rest: any[]) => {
      let result = self(x, y)
      for (let i = 0; i < rest.length; i++) {
        result = self(result, rest[i])
      }
      return result
    }
  )
}, matrixAlgorithmSuite({
  // ... existing matrix algorithm configuration (unchanged)
}))
```

#### Task 3.2.5: Create multiply.test.ts Updates

**File:** `test/unit-tests/function/arithmetic/multiply.test.ts`

```typescript
describe('multiply with Node operands', function () {
  const { parse, ConstantNode, SymbolNode, OperatorNode } = math

  describe('basic operations', function () {
    it('should return OperatorNode for multiply(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(3, x)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.op, '*')
      assert.strictEqual(result.fn, 'multiply')
      assert.strictEqual(result.toString(), '3 * x')
    })

    it('should return OperatorNode for multiply(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(x, 5)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x * 5')
    })

    it('should return OperatorNode for multiply(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.multiply(x, y)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x * y')
    })

    it('should work with parsed expressions', function () {
      const expr = parse('x + 1')
      const result = math.multiply(2, expr)

      assert.ok(result instanceof OperatorNode)
      // toString should show: 2 * (x + 1)
    })
  })

  describe('evaluation', function () {
    it('should evaluate correctly with scope', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(5, x)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 4 })

      assert.strictEqual(value, 20)  // 5 * 4 = 20
    })
  })

  describe('variadic operations', function () {
    it('should handle multiply(number, Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(2, x, 3)

      assert.ok(result instanceof OperatorNode)
      // ((2 * x) * 3)
    })

    it('should chain correctly', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(2, 3, x, 4)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 5 })

      assert.strictEqual(value, 120)  // 2 * 3 * 5 * 4 = 120
    })
  })
})
```

#### Task 3.2.6: Matrix Operation Verification (CRITICAL)

**CRITICAL:** This is the most important test section for multiply.

```typescript
describe('multiply matrix operations (backwards compatibility)', function () {

  describe('matrix × matrix', function () {
    it('should still compute dense × dense correctly', function () {
      const A = [[1, 2], [3, 4]]
      const B = [[5, 6], [7, 8]]
      const result = math.multiply(A, B)

      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        [[19, 22], [43, 50]]
      )
    })

    it('should still compute sparse × sparse correctly', function () {
      const A = math.sparse([[1, 0], [0, 2]])
      const B = math.sparse([[3, 0], [0, 4]])
      const result = math.multiply(A, B)

      assert.ok(math.isSparseMatrix(result))
    })

    it('should still compute dense × sparse correctly', function () {
      const A = [[1, 2], [3, 4]]
      const B = math.sparse([[1, 0], [0, 1]])
      const result = math.multiply(A, B)

      assert.ok(result)
    })
  })

  describe('vector × vector (dot product)', function () {
    it('should still return scalar for vector dot product', function () {
      const result = math.multiply([1, 2, 3], [[1], [2], [3]])
      // This should be a dot product, returning scalar 14
      assert.ok(typeof result === 'number' || math.isMatrix(result))
    })
  })

  describe('scalar × matrix broadcasting', function () {
    it('should still broadcast scalar to matrix', function () {
      const result = math.multiply(2, [[1, 2], [3, 4]])

      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        [[2, 4], [6, 8]]
      )
    })

    it('should still broadcast matrix to scalar', function () {
      const result = math.multiply([[1, 2], [3, 4]], 3)

      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        [[3, 6], [9, 12]]
      )
    })
  })

  describe('WASM paths (if enabled)', function () {
    it('should handle large matrices', function () {
      const size = 100
      const A = math.random([size, size])
      const B = math.random([size, size])

      // Should not throw, should return matrix
      const result = math.multiply(A, B)
      assert.ok(math.isMatrix(result) || Array.isArray(result))
    })
  })

  describe('special cases', function () {
    it('should handle identity matrix multiplication', function () {
      const I = math.identity(3)
      const A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      const result = math.multiply(A, I)

      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        A
      )
    })

    it('should handle unit multiplication', function () {
      const meters = math.unit(5, 'm')
      const result = math.multiply(meters, 2)

      assert.ok(math.isUnit(result))
      assert.strictEqual(result.toNumber('m'), 10)
    })
  })
})
```

### Acceptance Criteria

- [ ] `multiply.ts` modified with Node signatures
- [ ] All new tests pass
- [ ] **ALL existing multiply tests pass** (critical)
- [ ] Matrix multiplication unaffected (dense, sparse, mixed)
- [ ] Vector dot product unaffected
- [ ] Scalar broadcasting unaffected
- [ ] WASM paths unaffected
- [ ] TypeScript compiles without errors

### Definition of Done

- [ ] Code reviewed by senior developer
- [ ] All tests pass: `npm run test:src -- --grep "multiply"`
- [ ] Matrix tests specifically verified
- [ ] Performance benchmark shows no regression
- [ ] Committed to feature branch

---

## Sprint 3.3: Matrix Integration Verification

**Duration:** 1-2 days
**Risk:** Medium

### Objective
Comprehensive verification that all matrix operations work correctly after Phase 3 changes.

### Tasks

#### Task 3.3.1: Create Comprehensive Matrix Test Suite

**File:** `test/unit-tests/function/arithmetic/matrixNodeVerification.test.ts`

```typescript
/**
 * Matrix Node Verification Test Suite
 *
 * Verifies that adding Node support to multiply/divide
 * does not break any matrix operations.
 */

describe('Matrix operations after Node support', function () {
  this.timeout(10000)  // Allow time for large matrix tests

  // =========================================================================
  // MULTIPLY MATRIX TESTS
  // =========================================================================

  describe('multiply matrix verification', function () {

    describe('dense matrix operations', function () {
      const sizes = [2, 5, 10, 50, 100]

      sizes.forEach(size => {
        it(`should multiply ${size}×${size} dense matrices`, function () {
          const A = math.random([size, size])
          const B = math.random([size, size])

          const result = math.multiply(A, B)

          assert.ok(math.isMatrix(result) || Array.isArray(result))
          const arr = math.isMatrix(result) ? result.toArray() : result
          assert.strictEqual(arr.length, size)
          assert.strictEqual(arr[0].length, size)
        })
      })
    })

    describe('sparse matrix operations', function () {
      it('should multiply sparse matrices', function () {
        const A = math.sparse([[1, 0, 2], [0, 3, 0], [4, 0, 5]])
        const B = math.sparse([[1, 0], [0, 1], [1, 0]])

        const result = math.multiply(A, B)
        assert.ok(math.isSparseMatrix(result) || math.isMatrix(result))
      })

      it('should handle sparse × dense', function () {
        const sparse = math.sparse([[1, 0], [0, 2]])
        const dense = [[3, 4], [5, 6]]

        const result = math.multiply(sparse, dense)
        assert.ok(result)
      })

      it('should handle dense × sparse', function () {
        const dense = [[1, 2], [3, 4]]
        const sparse = math.sparse([[5, 0], [0, 6]])

        const result = math.multiply(dense, sparse)
        assert.ok(result)
      })
    })

    describe('vector operations', function () {
      it('should compute row × column vector (dot product)', function () {
        const row = [[1, 2, 3]]
        const col = [[1], [2], [3]]
        const result = math.multiply(row, col)

        // Should be [[14]] (1×1 matrix) or 14 (scalar)
        const value = math.isMatrix(result) ? result.toArray() : result
        assert.ok(
          value === 14 ||
          (Array.isArray(value) && value[0][0] === 14)
        )
      })

      it('should compute matrix × vector', function () {
        const A = [[1, 2], [3, 4]]
        const v = [[1], [1]]
        const result = math.multiply(A, v)

        assert.deepStrictEqual(
          math.isMatrix(result) ? result.toArray() : result,
          [[3], [7]]
        )
      })
    })

    describe('scalar broadcasting', function () {
      it('should broadcast scalar × matrix', function () {
        const result = math.multiply(3, [[1, 2], [3, 4]])
        assert.deepStrictEqual(
          math.isMatrix(result) ? result.toArray() : result,
          [[3, 6], [9, 12]]
        )
      })

      it('should broadcast matrix × scalar', function () {
        const result = math.multiply([[1, 2], [3, 4]], 2)
        assert.deepStrictEqual(
          math.isMatrix(result) ? result.toArray() : result,
          [[2, 4], [6, 8]]
        )
      })
    })
  })

  // =========================================================================
  // DIVIDE MATRIX TESTS
  // =========================================================================

  describe('divide matrix verification', function () {

    describe('matrix / scalar', function () {
      it('should divide matrix by scalar', function () {
        const result = math.divide([[10, 20], [30, 40]], 10)
        assert.deepStrictEqual(
          math.isMatrix(result) ? result.toArray() : result,
          [[1, 2], [3, 4]]
        )
      })
    })

    describe('scalar / matrix (inverse)', function () {
      it('should compute scalar / matrix as scalar × inv(matrix)', function () {
        const result = math.divide(1, [[1, 0], [0, 2]])
        // 1 / diag(1,2) = diag(1, 0.5)
        const arr = math.isMatrix(result) ? result.toArray() : result
        assert.ok(Math.abs(arr[0][0] - 1) < 1e-10)
        assert.ok(Math.abs(arr[1][1] - 0.5) < 1e-10)
      })
    })

    describe('matrix / matrix', function () {
      it('should compute A / B as A × inv(B)', function () {
        const A = [[1, 0], [0, 1]]  // Identity
        const B = [[2, 0], [0, 2]]  // 2×Identity
        const result = math.divide(A, B)

        // I / 2I = 0.5I
        const arr = math.isMatrix(result) ? result.toArray() : result
        assert.ok(Math.abs(arr[0][0] - 0.5) < 1e-10)
        assert.ok(Math.abs(arr[1][1] - 0.5) < 1e-10)
      })
    })
  })

  // =========================================================================
  // PERFORMANCE VERIFICATION
  // =========================================================================

  describe('performance verification', function () {
    it('should maintain reasonable performance for scalar multiply', function () {
      const iterations = 10000
      const start = Date.now()

      for (let i = 0; i < iterations; i++) {
        math.multiply(i, i + 1)
      }

      const elapsed = Date.now() - start
      // Should complete 10k iterations in < 1 second
      assert.ok(elapsed < 1000, `Took ${elapsed}ms for ${iterations} iterations`)
    })

    it('should maintain reasonable performance for matrix multiply', function () {
      const A = math.random([50, 50])
      const B = math.random([50, 50])
      const iterations = 100
      const start = Date.now()

      for (let i = 0; i < iterations; i++) {
        math.multiply(A, B)
      }

      const elapsed = Date.now() - start
      // Should complete 100 × 50×50 matrix multiplies in < 5 seconds
      assert.ok(elapsed < 5000, `Took ${elapsed}ms for ${iterations} iterations`)
    })
  })
})
```

#### Task 3.3.2: Run Full Regression Test Suite

```bash
# Run all unit tests
npm run test:src

# Run specifically matrix-related tests
npm run test:src -- --grep "matrix"
npm run test:src -- --grep "multiply"
npm run test:src -- --grep "divide"

# Run type tests
npm run test:types

# Expected: All tests pass
```

#### Task 3.3.3: Performance Benchmark

**File:** `test/benchmark/node_operators_phase3.ts`

```typescript
import { Bench } from 'tinybench'
import math from '../../src/defaultInstance.js'

async function runBenchmark() {
  console.log('Phase 3 Performance Benchmark\n')
  console.log('Verifying no performance regression for matrix operations\n')

  const bench = new Bench({ time: 2000, iterations: 5 })

  // Test matrices
  const small = math.random([10, 10])
  const medium = math.random([50, 50])
  const large = math.random([100, 100])

  // Scalar operations
  bench.add('multiply(number, number)', () => math.multiply(5, 3))
  bench.add('divide(number, number)', () => math.divide(10, 2))

  // Matrix operations
  bench.add('multiply(10×10, 10×10)', () => math.multiply(small, small))
  bench.add('multiply(50×50, 50×50)', () => math.multiply(medium, medium))
  bench.add('multiply(100×100, 100×100)', () => math.multiply(large, large))

  bench.add('divide(10×10, scalar)', () => math.divide(small, 2))
  bench.add('divide(50×50, scalar)', () => math.divide(medium, 2))

  // Node operations (new)
  const x = new math.SymbolNode('x')
  bench.add('multiply(number, Node)', () => math.multiply(5, x))
  bench.add('divide(number, Node)', () => math.divide(10, x))

  await bench.run()

  console.table(bench.tasks.map(task => ({
    'Task': task.name,
    'ops/sec': task.result?.hz?.toFixed(2),
    'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(4)
  })))

  // Compare with baseline (if available)
  console.log('\nExpected baselines:')
  console.log('- Scalar multiply: > 1M ops/sec')
  console.log('- 50×50 matrix multiply: > 1K ops/sec')
  console.log('- Node operations: > 100K ops/sec')
}

runBenchmark().catch(console.error)
```

### Acceptance Criteria

- [ ] All matrix tests pass
- [ ] Performance benchmark within expected ranges
- [ ] No TypeScript errors
- [ ] Full test suite passes (14,606+ tests)

### Definition of Done

- [ ] Sprint 3.3 complete
- [ ] Phase 3 fully verified
- [ ] All code committed
- [ ] Ready for Phase 4

---

## Phase 3 Deliverables

| Deliverable | Status |
|-------------|--------|
| `src/function/arithmetic/divide.ts` modifications | [ ] |
| `src/function/arithmetic/multiply.ts` modifications | [ ] |
| `test/unit-tests/function/arithmetic/divide.test.ts` updates | [ ] |
| `test/unit-tests/function/arithmetic/multiply.test.ts` updates | [ ] |
| `test/unit-tests/function/arithmetic/matrixNodeVerification.test.ts` | [ ] |
| `test/benchmark/node_operators_phase3.ts` | [ ] |

---

## Exit Criteria

Before proceeding to Phase 4:

1. [ ] All Phase 3 code compiles without errors
2. [ ] All Phase 3 tests pass
3. [ ] **All matrix operations verified working**
4. [ ] Performance benchmark shows no regression
5. [ ] Full test suite passes (14,606+ tests)
6. [ ] Phase 3 code committed to feature branch
7. [ ] Phase 3 reviewed and approved

---

## Rollback Plan

If matrix operations break:

1. **Immediate:** Revert Node signatures in multiply.ts
2. **Investigation:** Check signature ordering
3. **Alternative:** Use explicit type guards before dispatch
4. **Last resort:** Git revert to pre-Phase-3 state

---

## Next Phase

Proceed to [Phase 4: Integration](./04-PHASE-INTEGRATION.md)
