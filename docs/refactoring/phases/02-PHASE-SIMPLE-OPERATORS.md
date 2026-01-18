# Phase 2: Simple Operators (Add & Subtract)

**Duration:** 3-5 days
**Risk Level:** Medium
**Prerequisites:** Phase 1 complete

---

## Phase Objectives

1. Implement Node support in `add.ts`
2. Implement Node support in `subtract.ts`
3. Comprehensive testing for both operators
4. Validate backwards compatibility

---

## Sprint 2.1: Add Operator Node Support

**Duration:** 1.5-2 days
**Risk:** Medium

### Objective
Modify the `add` function to accept Node objects as operands, returning OperatorNode results for symbolic expressions.

### Pre-Implementation Checklist

- [ ] Phase 1 complete and merged
- [ ] `nodeOperations` module available
- [ ] Test infrastructure in place
- [ ] Current `add.ts` code reviewed

### Tasks

#### Task 2.1.1: Analyze Current add.ts Structure

**File:** `src/function/arithmetic/add.ts`

Current structure analysis:
```typescript
// Current dependencies
const dependencies = [
  'typed',
  'matrix',
  'addScalar',
  'equalScalar',
  'DenseMatrix',
  'SparseMatrix',
  'concat'
]

// Current signature structure
return typed(name, {
  // Scalar operations delegated to addScalar
  'any, any': addScalar,

  // Variadic
  'any, any, ...any': typed.referToSelf((self) =>
    (x, y, rest) => {
      let result = self(x, y)
      for (let i = 0; i < rest.length; i++) {
        result = self(result, rest[i])
      }
      return result
    }
  )
}, matrixAlgorithmSuite({ /* matrix algorithms */ }))
```

**Key Observations:**
1. `'any, any'` catches all non-matrix operations
2. `matrixAlgorithmSuite` adds matrix-specific signatures
3. Variadic uses `typed.referToSelf` for recursion
4. No explicit Node signatures exist

#### Task 2.1.2: Add Node Dependencies

**File:** `src/function/arithmetic/add.ts`

```typescript
// BEFORE
export const addDependencies = [
  'typed',
  'matrix',
  'addScalar',
  'equalScalar',
  'DenseMatrix',
  'SparseMatrix',
  'concat'
]

// AFTER
export const addDependencies = [
  'typed',
  'matrix',
  'addScalar',
  'equalScalar',
  'DenseMatrix',
  'SparseMatrix',
  'concat',
  // NEW: Node support
  'ConstantNode',
  'OperatorNode',
  'nodeOperations'
]
```

#### Task 2.1.3: Update Factory Function Parameters

```typescript
// BEFORE
export const createAdd = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  matrix,
  addScalar,
  equalScalar,
  DenseMatrix,
  SparseMatrix,
  concat
}) => {

// AFTER
export const createAdd = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  matrix,
  addScalar,
  equalScalar,
  DenseMatrix,
  SparseMatrix,
  concat,
  // NEW: Node support
  ConstantNode,
  OperatorNode,
  nodeOperations
}) => {
```

#### Task 2.1.4: Add Node Type Signatures

**CRITICAL:** Node signatures MUST appear BEFORE 'any, any' in the typed function.

```typescript
return typed(name, {
  // =========================================================================
  // NODE SIGNATURES - Must be FIRST (before 'any, any')
  // =========================================================================

  // Node + Node
  'Node, Node': function (x: Node, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // number + Node combinations
  'number, Node': function (x: number, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },
  'Node, number': function (x: Node, y: number) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // BigNumber + Node combinations
  'BigNumber, Node': function (x: BigNumber, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },
  'Node, BigNumber': function (x: Node, y: BigNumber) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // Complex + Node combinations
  'Complex, Node': function (x: Complex, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },
  'Node, Complex': function (x: Node, y: Complex) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // Fraction + Node combinations
  'Fraction, Node': function (x: Fraction, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },
  'Node, Fraction': function (x: Node, y: Fraction) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // Unit + Node combinations (for symbolic unit expressions)
  'Unit, Node': function (x: Unit, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },
  'Node, Unit': function (x: Node, y: Unit) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // string + Node (symbolic string expressions)
  'string, Node': function (x: string, y: Node) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },
  'Node, string': function (x: Node, y: string) {
    return nodeOperations.createBinaryNode('+', 'add', x, y)
  },

  // =========================================================================
  // EXISTING SIGNATURES - Keep these AFTER Node signatures
  // =========================================================================

  'any, any': addScalar,

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
  // ... existing matrix algorithm configuration
}))
```

#### Task 2.1.5: Handle Variadic with Nodes

The existing variadic signature `'any, any, ...any'` should work because:
1. First call: `self(x, y)` dispatches to Node signature if either is Node
2. Returns OperatorNode
3. Next call: `self(OperatorNode, z)` dispatches to `'Node, ...'` signature
4. Chaining works correctly

**Verification Test:**
```typescript
it('should handle variadic with Nodes', function () {
  const x = new SymbolNode('x')
  const result = math.add(1, x, 2, 3)
  // Expected: (((1 + x) + 2) + 3)
  assert.ok(result instanceof OperatorNode)
  assert.strictEqual(result.toString(), '1 + x + 2 + 3')
})
```

#### Task 2.1.6: Create add.test.ts Updates

**File:** `test/unit-tests/function/arithmetic/add.test.ts`

Add new test section:
```typescript
describe('add with Node operands', function () {
  const { parse, ConstantNode, SymbolNode, OperatorNode } = math

  describe('basic operations', function () {
    it('should return OperatorNode for add(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.add(5, x)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.op, '+')
      assert.strictEqual(result.fn, 'add')
      assert.strictEqual(result.args.length, 2)
      assert.ok(result.args[0] instanceof ConstantNode)
      assert.strictEqual(result.args[0].value, 5)
      assert.strictEqual(result.args[1], x)
    })

    it('should return OperatorNode for add(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.add(x, 5)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.args[0], x)
      assert.ok(result.args[1] instanceof ConstantNode)
    })

    it('should return OperatorNode for add(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.add(x, y)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.args[0], x)
      assert.strictEqual(result.args[1], y)
      assert.strictEqual(result.toString(), 'x + y')
    })

    it('should work with parsed expressions', function () {
      const expr = parse('x^2')
      const result = math.add(1, expr)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), '1 + x ^ 2')
    })
  })

  describe('type combinations', function () {
    it('should work with BigNumber + Node', function () {
      const big = math.bignumber(100)
      const x = new SymbolNode('x')
      const result = math.add(big, x)

      assert.ok(result instanceof OperatorNode)
      assert.ok(result.args[0] instanceof ConstantNode)
      assert.deepStrictEqual(result.args[0].value, big)
    })

    it('should work with Complex + Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = math.add(c, x)

      assert.ok(result instanceof OperatorNode)
    })

    it('should work with Fraction + Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = math.add(f, x)

      assert.ok(result instanceof OperatorNode)
    })
  })

  describe('variadic operations', function () {
    it('should handle add(number, Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.add(1, x, 2)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), '1 + x + 2')
    })

    it('should handle add(Node, Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const z = new SymbolNode('z')
      const result = math.add(x, y, z)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x + y + z')
    })

    it('should handle many arguments', function () {
      const x = new SymbolNode('x')
      const result = math.add(1, 2, x, 3, 4)

      assert.ok(result instanceof OperatorNode)
    })
  })

  describe('evaluation', function () {
    it('should evaluate correctly with scope', function () {
      const x = new SymbolNode('x')
      const result = math.add(5, x)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 3 })

      assert.strictEqual(value, 8)
    })

    it('should evaluate complex expressions', function () {
      const expr = parse('x * 2')
      const result = math.add(10, expr)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 5 })

      assert.strictEqual(value, 20)  // 10 + (5 * 2) = 20
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for add(number, number)', function () {
      const result = math.add(5, 3)
      assert.strictEqual(result, 8)
      assert.strictEqual(typeof result, 'number')
    })

    it('should still return BigNumber for add(BigNumber, BigNumber)', function () {
      const result = math.add(math.bignumber(5), math.bignumber(3))
      assert.ok(math.isBigNumber(result))
      assert.strictEqual(result.toNumber(), 8)
    })

    it('should still return Complex for add(Complex, Complex)', function () {
      const result = math.add(math.complex(1, 2), math.complex(3, 4))
      assert.ok(math.isComplex(result))
      assert.strictEqual(result.re, 4)
      assert.strictEqual(result.im, 6)
    })

    it('should still return Matrix for add(Matrix, Matrix)', function () {
      const result = math.add([[1, 2], [3, 4]], [[5, 6], [7, 8]])
      assert.deepStrictEqual(math.isMatrix(result) ? result.toArray() : result,
        [[6, 8], [10, 12]])
    })

    it('should still work with variadic numbers', function () {
      const result = math.add(1, 2, 3, 4, 5)
      assert.strictEqual(result, 15)
    })
  })

  describe('edge cases', function () {
    it('should handle ConstantNode input', function () {
      const c = new ConstantNode(5)
      const result = math.add(c, 3)

      assert.ok(result instanceof OperatorNode)
    })

    it('should handle zero', function () {
      const x = new SymbolNode('x')
      const result = math.add(0, x)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), '0 + x')
    })

    it('should handle negative numbers', function () {
      const x = new SymbolNode('x')
      const result = math.add(-5, x)

      assert.ok(result instanceof OperatorNode)
    })

    it('should handle nested OperatorNodes', function () {
      const innerExpr = parse('a + b')
      const result = math.add(innerExpr, parse('c'))

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'a + b + c')
    })
  })
})
```

### Acceptance Criteria

- [ ] `add.ts` modified with Node signatures
- [ ] All new tests pass
- [ ] All existing add tests pass (backwards compatibility)
- [ ] TypeScript compiles without errors
- [ ] No performance regression for scalar operations

### Definition of Done

- [ ] Code reviewed
- [ ] All tests pass: `npm run test:src -- --grep "add"`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Performance verified: `npm run benchmark -- add`
- [ ] Committed to feature branch

---

## Sprint 2.2: Subtract Operator Node Support

**Duration:** 1 day
**Risk:** Medium (similar to add, slightly faster due to established pattern)

### Objective
Implement Node support in `subtract` function following the same pattern as `add`.

### Tasks

#### Task 2.2.1: Add Node Dependencies to subtract.ts

**File:** `src/function/arithmetic/subtract.ts`

```typescript
// BEFORE
export const subtractDependencies = [
  'typed',
  'matrix',
  'equalScalar',
  'addScalar',
  'unaryMinus',
  'DenseMatrix',
  'concat'
]

// AFTER
export const subtractDependencies = [
  'typed',
  'matrix',
  'equalScalar',
  'addScalar',
  'unaryMinus',
  'DenseMatrix',
  'concat',
  // NEW: Node support
  'ConstantNode',
  'OperatorNode',
  'nodeOperations'
]
```

#### Task 2.2.2: Update Factory Function Parameters

```typescript
export const createSubtract = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  matrix,
  equalScalar,
  addScalar,
  unaryMinus,
  DenseMatrix,
  concat,
  // NEW: Node support
  ConstantNode,
  OperatorNode,
  nodeOperations
}) => {
```

#### Task 2.2.3: Add Node Type Signatures

```typescript
return typed(name, {
  // =========================================================================
  // NODE SIGNATURES - Must be FIRST
  // =========================================================================

  'Node, Node': function (x: Node, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  'number, Node': function (x: number, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },
  'Node, number': function (x: Node, y: number) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  'BigNumber, Node': function (x: BigNumber, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },
  'Node, BigNumber': function (x: Node, y: BigNumber) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  'Complex, Node': function (x: Complex, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },
  'Node, Complex': function (x: Node, y: Complex) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  'Fraction, Node': function (x: Fraction, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },
  'Node, Fraction': function (x: Node, y: Fraction) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  'Unit, Node': function (x: Unit, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },
  'Node, Unit': function (x: Node, y: Unit) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  'string, Node': function (x: string, y: Node) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },
  'Node, string': function (x: Node, y: string) {
    return nodeOperations.createBinaryNode('-', 'subtract', x, y)
  },

  // =========================================================================
  // EXISTING SIGNATURES
  // =========================================================================

  // ... keep existing signatures
})
```

#### Task 2.2.4: Create subtract.test.ts Updates

**File:** `test/unit-tests/function/arithmetic/subtract.test.ts`

Add test section (similar structure to add tests):
```typescript
describe('subtract with Node operands', function () {
  const { parse, ConstantNode, SymbolNode, OperatorNode } = math

  describe('basic operations', function () {
    it('should return OperatorNode for subtract(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(10, x)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.op, '-')
      assert.strictEqual(result.fn, 'subtract')
      assert.strictEqual(result.toString(), '10 - x')
    })

    it('should return OperatorNode for subtract(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(x, 5)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x - 5')
    })

    it('should return OperatorNode for subtract(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.subtract(x, y)

      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), 'x - y')
    })
  })

  describe('evaluation', function () {
    it('should evaluate correctly with scope', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(10, x)
      const compiled = result.compile()
      const value = compiled.evaluate({ x: 3 })

      assert.strictEqual(value, 7)  // 10 - 3 = 7
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for subtract(number, number)', function () {
      const result = math.subtract(10, 3)
      assert.strictEqual(result, 7)
    })

    it('should still work with matrices', function () {
      const result = math.subtract([[5, 6]], [[1, 2]])
      assert.deepStrictEqual(
        math.isMatrix(result) ? result.toArray() : result,
        [[4, 4]]
      )
    })
  })

  // Add type combinations, variadic, edge cases similar to add tests
})
```

### Acceptance Criteria

- [ ] `subtract.ts` modified with Node signatures
- [ ] All new tests pass
- [ ] All existing subtract tests pass
- [ ] Same code pattern as add.ts

### Definition of Done

- [ ] Code reviewed
- [ ] All tests pass: `npm run test:src -- --grep "subtract"`
- [ ] No TypeScript errors
- [ ] Committed to feature branch

---

## Sprint 2.3: Comprehensive Testing

**Duration:** 0.5-1 day
**Risk:** Low

### Objective
Perform comprehensive testing of add and subtract Node implementations before proceeding to Phase 3.

### Tasks

#### Task 2.3.1: Integration Tests

Create integration tests that verify add and subtract work together:

**File:** `test/unit-tests/function/arithmetic/nodeIntegration.test.ts`

```typescript
describe('add/subtract Node integration', function () {
  const { parse, SymbolNode, OperatorNode } = math

  it('should chain add and subtract operations', function () {
    const x = new SymbolNode('x')
    const step1 = math.add(5, x)      // 5 + x
    const step2 = math.subtract(step1, 3)  // (5 + x) - 3

    assert.ok(step2 instanceof OperatorNode)
    assert.strictEqual(step2.op, '-')

    // Evaluate
    const value = step2.compile().evaluate({ x: 10 })
    assert.strictEqual(value, 12)  // (5 + 10) - 3 = 12
  })

  it('should work with simplify', function () {
    const x = new SymbolNode('x')
    const expr = math.add(5, x)
    const simplified = math.simplify(expr)

    // Should be simplifiable (though may not change much)
    assert.ok(simplified && simplified.isNode)
  })

  it('should work with derivative', function () {
    const x = new SymbolNode('x')
    const expr = math.add(5, x)

    // derivative of (5 + x) with respect to x should be 1
    const deriv = math.derivative(expr, x)
    assert.ok(deriv && deriv.isNode)
  })
})
```

#### Task 2.3.2: Performance Regression Tests

Create benchmark to verify no performance regression:

**File:** `test/benchmark/node_operators_perf.ts`

```typescript
import { Bench } from 'tinybench'
import math from '../../src/defaultInstance.js'

const { SymbolNode, parse } = math

async function runBenchmark() {
  console.log('Node Operators Performance Benchmark\n')

  const bench = new Bench({ time: 1000, iterations: 5 })

  // Test data
  const x = new SymbolNode('x')

  // Scalar operations (should not regress)
  bench.add('add(number, number)', () => {
    math.add(5, 3)
  })

  bench.add('subtract(number, number)', () => {
    math.subtract(5, 3)
  })

  // Node operations (new functionality)
  bench.add('add(number, Node)', () => {
    math.add(5, x)
  })

  bench.add('subtract(number, Node)', () => {
    math.subtract(5, x)
  })

  bench.add('add(Node, Node)', () => {
    math.add(x, x)
  })

  // Variadic
  bench.add('add(1, 2, 3, 4, 5) - scalar', () => {
    math.add(1, 2, 3, 4, 5)
  })

  bench.add('add(1, x, 2, x, 3) - mixed', () => {
    math.add(1, x, 2, x, 3)
  })

  await bench.run()

  console.table(bench.tasks.map(task => ({
    'Task': task.name,
    'ops/sec': task.result?.hz?.toFixed(2),
    'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(4)
  })))
}

runBenchmark().catch(console.error)
```

#### Task 2.3.3: Full Test Suite Execution

Run the complete test suite to ensure no regressions:

```bash
# Run all unit tests
npm run test:src

# Run type tests
npm run test:types

# Run generated code tests
npm run test:generated

# Expected: All 14,606+ tests passing
```

#### Task 2.3.4: Document Known Limitations

Create documentation for any discovered limitations:

**File:** `docs/refactoring/phases/node-operators-limitations.md`

```markdown
# Node Operators - Known Limitations

## Supported Operations
- add(scalar, Node) ✓
- add(Node, scalar) ✓
- add(Node, Node) ✓
- subtract(scalar, Node) ✓
- subtract(Node, scalar) ✓
- subtract(Node, Node) ✓

## Not Yet Supported
- Matrix + Node combinations (Phase 3+)
- Sparse matrix operations with Nodes

## Edge Cases
- Document any discovered edge cases
- Document workarounds if applicable

## Performance Notes
- Scalar operations maintain original performance
- Node operations add ~X overhead (measured)
```

### Acceptance Criteria

- [ ] Integration tests pass
- [ ] Performance benchmark shows no regression for scalar ops
- [ ] Full test suite passes (14,606+ tests)
- [ ] Limitations documented

### Definition of Done

- [ ] All Sprint 2.3 tasks complete
- [ ] Phase 2 fully tested
- [ ] Documentation updated
- [ ] Ready to proceed to Phase 3

---

## Phase 2 Deliverables

| Deliverable | Status |
|-------------|--------|
| `src/function/arithmetic/add.ts` modifications | [ ] |
| `src/function/arithmetic/subtract.ts` modifications | [ ] |
| `test/unit-tests/function/arithmetic/add.test.ts` updates | [ ] |
| `test/unit-tests/function/arithmetic/subtract.test.ts` updates | [ ] |
| `test/unit-tests/function/arithmetic/nodeIntegration.test.ts` | [ ] |
| `test/benchmark/node_operators_perf.ts` | [ ] |
| `docs/refactoring/phases/node-operators-limitations.md` | [ ] |

---

## Exit Criteria

Before proceeding to Phase 3:

1. [ ] All Phase 2 code compiles without errors
2. [ ] All Phase 2 tests pass
3. [ ] All existing tests pass (14,606+)
4. [ ] Performance benchmark shows no regression
5. [ ] Phase 2 code committed to feature branch
6. [ ] Phase 2 reviewed and approved

---

## Rollback Plan

If issues are discovered:

1. Node signatures can be removed without affecting existing functionality
2. Dependencies can be reverted to original list
3. Tests can be skipped while investigating
4. Git revert to pre-Phase-2 state if necessary

---

## Next Phase

Proceed to [Phase 3: Complex Operators](./03-PHASE-COMPLEX-OPERATORS.md)
