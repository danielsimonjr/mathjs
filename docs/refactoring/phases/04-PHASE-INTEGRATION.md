# Phase 4: Integration

**Duration:** 2-3 days
**Risk Level:** Medium
**Prerequisites:** Phases 1-3 complete

---

## Phase Objectives

1. Verify integration with `simplify` function
2. Enable the pending test that motivated this feature
3. Update TypeScript definitions
4. Update documentation
5. Final validation and cleanup

---

## Sprint 4.1: Simplify Integration

**Duration:** 1 day
**Risk:** Medium

### Objective
Verify and ensure that the `simplify` function works correctly with the new Node-aware arithmetic operators.

### Background

The original motivation for this feature:
```javascript
// This test was failing:
math.evaluate('simplify(5 + derivative(5/(3x), x))')
// Because: add(5, Node) threw "Unexpected type of argument"
```

### Tasks

#### Task 4.1.1: Analyze Simplify Integration Points

**File:** `src/function/algebra/simplify.ts`

Key integration points:
```typescript
// simplify internally uses arithmetic operations:
// - When evaluating constant expressions
// - When applying transformation rules
// - When combining like terms

// Example flow:
// simplify('5 + derivative(x^2, x)')
// 1. derivative(x^2, x) → OperatorNode('2 * x')
// 2. evaluate('5 + ...') calls add(5, OperatorNode)
// 3. With our changes: add(5, Node) → OperatorNode('5 + 2 * x')
// 4. simplify can then work with the full expression
```

#### Task 4.1.2: Create Integration Test Suite

**File:** `test/unit-tests/function/algebra/simplifyNodeIntegration.test.ts`

```typescript
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const { parse, simplify, derivative, ConstantNode, SymbolNode, OperatorNode } = math

describe('simplify integration with Node operators', function () {

  // =========================================================================
  // BASIC INTEGRATION
  // =========================================================================

  describe('basic integration', function () {

    it('should simplify expression with add(number, Node)', function () {
      const x = new SymbolNode('x')
      const expr = math.add(5, x)  // Creates: 5 + x

      const result = simplify(expr)

      assert.ok(result && result.isNode)
      // May simplify to 'x + 5' or stay as '5 + x'
      assert.ok(result.toString().includes('x'))
      assert.ok(result.toString().includes('5'))
    })

    it('should simplify expression with multiply(number, Node)', function () {
      const x = new SymbolNode('x')
      const expr = math.multiply(2, x)  // Creates: 2 * x

      const result = simplify(expr)

      assert.ok(result && result.isNode)
      assert.strictEqual(result.toString(), '2 * x')
    })

    it('should simplify combined operations', function () {
      const x = new SymbolNode('x')
      const step1 = math.multiply(2, x)     // 2 * x
      const step2 = math.add(step1, 3)      // 2 * x + 3

      const result = simplify(step2)

      assert.ok(result && result.isNode)
      // Should contain both terms
      const str = result.toString()
      assert.ok(str.includes('x'))
      assert.ok(str.includes('2') || str.includes('3'))
    })

  })

  // =========================================================================
  // DERIVATIVE INTEGRATION (Original use case)
  // =========================================================================

  describe('derivative integration', function () {

    it('should handle add(number, derivative(...))', function () {
      // This is the original failing test case
      const expr = parse('x^2')
      const deriv = derivative(expr, 'x')  // Returns: 2 * x

      // Now this should work!
      const combined = math.add(5, deriv)

      assert.ok(combined instanceof OperatorNode)
      assert.strictEqual(combined.op, '+')

      // Simplify should work
      const simplified = simplify(combined)
      assert.ok(simplified && simplified.isNode)
    })

    it('should handle subtract(number, derivative(...))', function () {
      const expr = parse('x^3')
      const deriv = derivative(expr, 'x')  // Returns: 3 * x^2

      const combined = math.subtract(10, deriv)

      assert.ok(combined instanceof OperatorNode)
      const simplified = simplify(combined)
      assert.ok(simplified && simplified.isNode)
    })

    it('should handle multiply(number, derivative(...))', function () {
      const expr = parse('x^2')
      const deriv = derivative(expr, 'x')  // Returns: 2 * x

      const combined = math.multiply(3, deriv)  // 3 * (2 * x)

      assert.ok(combined instanceof OperatorNode)
      const simplified = simplify(combined)

      // Should simplify to 6 * x
      assert.ok(simplified.toString().includes('6') ||
                simplified.toString().includes('x'))
    })

    it('should handle divide(derivative(...), number)', function () {
      const expr = parse('x^2')
      const deriv = derivative(expr, 'x')  // Returns: 2 * x

      const combined = math.divide(deriv, 2)  // (2 * x) / 2

      assert.ok(combined instanceof OperatorNode)
      const simplified = simplify(combined)

      // Should simplify to x
      assert.strictEqual(simplified.toString(), 'x')
    })

  })

  // =========================================================================
  // COMPLEX EXPRESSIONS
  // =========================================================================

  describe('complex expressions', function () {

    it('should handle nested derivative expressions', function () {
      // f(x) = x^3, f\'(x) = 3x^2
      // g(x) = x^2, g\'(x) = 2x
      // Combined: f\'(x) + g\'(x) = 3x^2 + 2x

      const deriv1 = derivative(parse('x^3'), 'x')
      const deriv2 = derivative(parse('x^2'), 'x')

      const combined = math.add(deriv1, deriv2)

      assert.ok(combined instanceof OperatorNode)
      const simplified = simplify(combined)
      assert.ok(simplified && simplified.isNode)
    })

    it('should handle expression building with multiple operations', function () {
      const x = new SymbolNode('x')

      // Build: 2*x + 3*x = 5*x
      const term1 = math.multiply(2, x)
      const term2 = math.multiply(3, x)
      const sum = math.add(term1, term2)

      const simplified = simplify(sum)

      // Should simplify to 5 * x
      assert.strictEqual(simplified.toString(), '5 * x')
    })

    it('should handle constant folding', function () {
      const x = new SymbolNode('x')

      // Build: (2 + 3) * x should simplify to 5 * x
      const constant = math.add(2, 3)  // This is still numeric: 5
      const expr = math.multiply(constant, x)

      // Since 2+3=5 (numbers), multiply(5, Node) creates 5 * x
      const simplified = simplify(expr)
      assert.strictEqual(simplified.toString(), '5 * x')
    })

  })

  // =========================================================================
  // EVALUATE INTEGRATION
  // =========================================================================

  describe('evaluate integration', function () {

    it('should work with math.evaluate for combined expressions', function () {
      // This should now work:
      const result = math.evaluate('simplify(x + 5)', { x: parse('2 * y') })

      assert.ok(result && result.isNode)
    })

    it('should handle derivative in evaluate context', function () {
      // The original failing test case from PENDING_TESTS_TODO.md
      const result = math.evaluate('simplify(5 + derivative(x^2, x))')

      assert.ok(result && result.isNode)
      // Should be: 5 + 2*x or equivalent
      const str = result.toString()
      assert.ok(str.includes('5'))
      assert.ok(str.includes('x'))
    })

  })

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('edge cases', function () {

    it('should handle zero addition', function () {
      const x = new SymbolNode('x')
      const expr = math.add(0, x)
      const simplified = simplify(expr)

      // 0 + x should simplify to x
      assert.strictEqual(simplified.toString(), 'x')
    })

    it('should handle multiplication by one', function () {
      const x = new SymbolNode('x')
      const expr = math.multiply(1, x)
      const simplified = simplify(expr)

      // 1 * x should simplify to x
      assert.strictEqual(simplified.toString(), 'x')
    })

    it('should handle multiplication by zero', function () {
      const x = new SymbolNode('x')
      const expr = math.multiply(0, x)
      const simplified = simplify(expr)

      // 0 * x should simplify to 0
      assert.strictEqual(simplified.toString(), '0')
    })

    it('should handle division by one', function () {
      const x = new SymbolNode('x')
      const expr = math.divide(x, 1)
      const simplified = simplify(expr)

      // x / 1 should simplify to x
      assert.strictEqual(simplified.toString(), 'x')
    })

  })

})
```

#### Task 4.1.3: Verify resolve() Integration

**File:** Test within existing simplify tests or new file

```typescript
describe('resolve integration with Node operators', function () {
  it('should resolve variables in Node expressions', function () {
    const x = new SymbolNode('x')
    const expr = math.add(5, x)

    // Resolve x=10
    const resolved = math.resolve(expr, { x: 10 })

    // After resolution, expression should be evaluable
    const result = resolved.compile().evaluate()
    assert.strictEqual(result, 15)
  })
})
```

### Acceptance Criteria

- [ ] All simplify integration tests pass
- [ ] Derivative + arithmetic combinations work
- [ ] evaluate() context works
- [ ] Edge cases handled correctly

### Definition of Done

- [ ] Integration tests created and passing
- [ ] No regressions in existing simplify tests
- [ ] Committed to feature branch

---

## Sprint 4.2: Enable Pending Tests

**Duration:** 0.5 days
**Risk:** Low

### Objective
Enable the originally pending test that motivated this entire feature.

### Tasks

#### Task 4.2.1: Locate Pending Tests

**Files:**
- `test/unit-tests/function/algebra/simplify.test.js:608-622`
- `test/unit-tests/function/algebra/simplify.test.ts:747-761`

Current state:
```typescript
it.skip('should compute and simplify derivatives (3)', function () {
  const res = math.evaluate('simplify(5+derivative(5/(3x), x))')
  assert.ok(res && res.isNode)
  assert.strictEqual(res.toString(), '5 - 15 / (3 * x) ^ 2')
})
```

#### Task 4.2.2: Enable the Test

Change `it.skip` to `it`:

**File:** `test/unit-tests/function/algebra/simplify.test.ts:747`
```typescript
// BEFORE
it.skip('should compute and simplify derivatives (3)', function () {

// AFTER
it('should compute and simplify derivatives (3)', function () {
```

**File:** `test/unit-tests/function/algebra/simplify.test.js:608`
```typescript
// BEFORE
it.skip('should compute and simplify derivatives (3)', function () {

// AFTER
it('should compute and simplify derivatives (3)', function () {
```

#### Task 4.2.3: Run and Verify

```bash
# Run the specific test
npm run test:src -- --grep "should compute and simplify derivatives"

# Expected output:
# ✓ should compute and simplify derivatives (3)
```

#### Task 4.2.4: Update PENDING_TESTS_TODO.md

**File:** `docs/refactoring/PENDING_TESTS_TODO.md`

Update the status:
```markdown
## Completed

### 6. Simplify with Node objects ✅ COMPLETED
- **Test**: `simplify.test.ts:747` - `should compute and simplify derivatives (3)`
- **Issue**: Arithmetic operators now support Node operands
- **Resolution**: Added Node signatures to add, subtract, multiply, divide
- **Commit**: [commit hash]
- **Date**: 2026-01-XX
```

### Acceptance Criteria

- [ ] Pending test enabled
- [ ] Test passes
- [ ] PENDING_TESTS_TODO.md updated

### Definition of Done

- [ ] No more skipped tests related to this feature
- [ ] Documentation updated
- [ ] Committed to feature branch

---

## Sprint 4.3: Documentation & Types

**Duration:** 1-1.5 days
**Risk:** Low

### Objective
Update TypeScript definitions and documentation to reflect the new capabilities.

### Tasks

#### Task 4.3.1: Update TypeScript Definitions

**File:** `types/index.d.ts`

Add Node type signatures to arithmetic functions:

```typescript
// Find the add function definition and add Node overloads:

interface MathJsInstance {
  // ... existing definitions ...

  /**
   * Add two or more values.
   * For Node operands, returns an OperatorNode.
   */
  add(x: MathNode, y: MathNode): OperatorNode;
  add(x: MathNode, y: MathNumericType): OperatorNode;
  add(x: MathNumericType, y: MathNode): OperatorNode;
  add(x: MathType, y: MathType, ...rest: MathType[]): MathType;

  /**
   * Subtract two values.
   * For Node operands, returns an OperatorNode.
   */
  subtract(x: MathNode, y: MathNode): OperatorNode;
  subtract(x: MathNode, y: MathNumericType): OperatorNode;
  subtract(x: MathNumericType, y: MathNode): OperatorNode;
  subtract(x: MathType, y: MathType): MathType;

  /**
   * Multiply two or more values.
   * For Node operands, returns an OperatorNode.
   */
  multiply(x: MathNode, y: MathNode): OperatorNode;
  multiply(x: MathNode, y: MathNumericType): OperatorNode;
  multiply(x: MathNumericType, y: MathNode): OperatorNode;
  multiply(x: MathType, y: MathType, ...rest: MathType[]): MathType;

  /**
   * Divide two values.
   * For Node operands, returns an OperatorNode.
   */
  divide(x: MathNode, y: MathNode): OperatorNode;
  divide(x: MathNode, y: MathNumericType): OperatorNode;
  divide(x: MathNumericType, y: MathNode): OperatorNode;
  divide(x: MathType, y: MathType): MathType;
}
```

Add to chain interface:

```typescript
interface MathJsChain<TValue> {
  // Add Node support to chain methods
  add(y: MathNode): MathJsChain<OperatorNode>;
  add(y: MathType): MathJsChain<MathType>;

  subtract(y: MathNode): MathJsChain<OperatorNode>;
  subtract(y: MathType): MathJsChain<MathType>;

  multiply(y: MathNode): MathJsChain<OperatorNode>;
  multiply(y: MathType): MathJsChain<MathType>;

  divide(y: MathNode): MathJsChain<OperatorNode>;
  divide(y: MathType): MathJsChain<MathType>;
}
```

#### Task 4.3.2: Add Type Tests

**File:** `test/typescript-tests/testTypes.ts`

Add tests for new type signatures:

```typescript
// Test Node arithmetic operations
{
  const x: SymbolNode = new math.SymbolNode('x')
  const y: SymbolNode = new math.SymbolNode('y')
  const c: ConstantNode = new math.ConstantNode(5)

  // add with Nodes
  const addNodeNode: OperatorNode = math.add(x, y)
  const addNumNode: OperatorNode = math.add(5, x)
  const addNodeNum: OperatorNode = math.add(x, 5)

  // subtract with Nodes
  const subNodeNode: OperatorNode = math.subtract(x, y)
  const subNumNode: OperatorNode = math.subtract(10, x)
  const subNodeNum: OperatorNode = math.subtract(x, 10)

  // multiply with Nodes
  const mulNodeNode: OperatorNode = math.multiply(x, y)
  const mulNumNode: OperatorNode = math.multiply(3, x)
  const mulNodeNum: OperatorNode = math.multiply(x, 3)

  // divide with Nodes
  const divNodeNode: OperatorNode = math.divide(x, y)
  const divNumNode: OperatorNode = math.divide(10, x)
  const divNodeNum: OperatorNode = math.divide(x, 2)

  // Verify still works with regular types
  const addNums: number = math.add(5, 3)
  const mulMatrix: Matrix = math.multiply([[1, 2]], [[3], [4]])
}
```

#### Task 4.3.3: Run Type Tests

```bash
npm run test:types

# Expected: All type tests pass
```

#### Task 4.3.4: Update Embedded Documentation

**Files in `src/expression/embeddedDocs/function/arithmetic/`:**

Update the embedded docs to mention Node support:

**File:** `src/expression/embeddedDocs/function/arithmetic/add.js`

```javascript
export const addDocs = {
  name: 'add',
  category: 'Arithmetic',
  syntax: [
    'x + y',
    'add(x, y)',
    'add(x, y, z, ...)'
  ],
  description: 'Add two or more values. When one or more operands are ' +
    'expression Nodes, returns an OperatorNode for symbolic computation.',
  examples: [
    'add(2, 3)',
    '2 + 3',
    'add(2, 3, 4)',
    // NEW examples:
    'x = parse("a")',
    'add(5, x)  // Returns OperatorNode: 5 + a',
    'simplify(add(x, x))  // Returns: 2 * a'
  ],
  seealso: [
    'subtract', 'multiply', 'divide', 'simplify', 'derivative'
  ]
}
```

Similar updates for subtract, multiply, divide.

#### Task 4.3.5: Update README/CHANGELOG

**File:** `HISTORY.md` (or CHANGELOG.md)

Add entry for this feature:

```markdown
## [Unreleased]

### Added
- Arithmetic operators (add, subtract, multiply, divide) now support
  expression Node objects as operands, returning OperatorNode results
  for symbolic computation. This enables patterns like:
  ```javascript
  math.add(5, math.parse('x'))  // Returns: OperatorNode representing "5 + x"
  math.simplify('5 + derivative(x^2, x)')  // Now works correctly
  ```
```

### Acceptance Criteria

- [ ] TypeScript definitions updated
- [ ] Type tests pass
- [ ] Embedded documentation updated
- [ ] CHANGELOG updated

### Definition of Done

- [ ] All documentation complete
- [ ] Type tests pass: `npm run test:types`
- [ ] Committed to feature branch

---

## Sprint 4.4: Final Validation

**Duration:** 0.5 days
**Risk:** Low

### Objective
Final comprehensive validation before merging.

### Tasks

#### Task 4.4.1: Full Test Suite

```bash
# Run complete test suite
npm run test:all

# Expected: All tests pass (14,606+ tests)
```

#### Task 4.4.2: Build Verification

```bash
# Full build
npm run build

# Verify outputs exist
ls -la lib/esm/
ls -la lib/cjs/
ls -la lib/browser/
```

#### Task 4.4.3: TypeScript Compilation

```bash
# TypeScript check
npx tsc --noEmit

# Expected: No errors
```

#### Task 4.4.4: Create Final Summary

**File:** `docs/refactoring/phases/COMPLETION_REPORT.md`

```markdown
# Node Operators Feature - Completion Report

## Summary
Implemented support for expression Node objects as operands in arithmetic
operators (add, subtract, multiply, divide).

## Changes Made

### Source Files Modified
- `src/function/arithmetic/add.ts` - Added 12 Node signatures
- `src/function/arithmetic/subtract.ts` - Added 12 Node signatures
- `src/function/arithmetic/multiply.ts` - Added 12 Node signatures
- `src/function/arithmetic/divide.ts` - Added 12 Node signatures
- `src/function/arithmetic/utils/nodeOperations.ts` - NEW: Shared utilities

### Test Files Added/Modified
- `test/unit-tests/function/arithmetic/utils/nodeOperations.test.ts` - NEW
- `test/unit-tests/function/arithmetic/add.test.ts` - Added Node tests
- `test/unit-tests/function/arithmetic/subtract.test.ts` - Added Node tests
- `test/unit-tests/function/arithmetic/multiply.test.ts` - Added Node tests
- `test/unit-tests/function/arithmetic/divide.test.ts` - Added Node tests
- `test/unit-tests/function/algebra/simplifyNodeIntegration.test.ts` - NEW
- `test/unit-tests/function/algebra/simplify.test.ts` - Enabled pending test

### Documentation Updated
- `types/index.d.ts` - Added Node type signatures
- `test/typescript-tests/testTypes.ts` - Added type tests
- Embedded docs for add, subtract, multiply, divide
- HISTORY.md - Added changelog entry

## Test Results
- Total tests: 14,XXX passing
- New tests added: ~100
- Previously pending tests enabled: 1

## Performance Impact
- Scalar operations: No regression
- Matrix operations: No regression
- Node operations: ~XXX ops/sec (new capability)

## Backwards Compatibility
- All existing functionality preserved
- No breaking changes
- New capability is additive only

## Known Limitations
- Matrix + Node combinations not supported (by design)
- Sparse matrix + Node combinations not supported (by design)

## Future Enhancements (Optional)
- Could add pow(number, Node) support
- Could add mod(number, Node) support
- Could optimize Node creation for repeated operations
```

#### Task 4.4.5: Code Review Checklist

- [ ] All code follows existing patterns
- [ ] No unnecessary complexity added
- [ ] Comments explain non-obvious logic
- [ ] Error messages are helpful
- [ ] No debug code left in
- [ ] No console.log statements
- [ ] TypeScript types are accurate
- [ ] Tests cover edge cases

### Acceptance Criteria

- [ ] Full test suite passes
- [ ] Build completes successfully
- [ ] TypeScript compiles without errors
- [ ] Completion report created
- [ ] Code review checklist completed

### Definition of Done

- [ ] Feature complete
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Ready to merge

---

## Phase 4 Deliverables

| Deliverable | Status |
|-------------|--------|
| `test/unit-tests/function/algebra/simplifyNodeIntegration.test.ts` | [ ] |
| Pending test enabled in simplify.test.ts | [ ] |
| Pending test enabled in simplify.test.js | [ ] |
| `PENDING_TESTS_TODO.md` updated | [ ] |
| `types/index.d.ts` updated | [ ] |
| `test/typescript-tests/testTypes.ts` updated | [ ] |
| Embedded docs updated | [ ] |
| `HISTORY.md` updated | [ ] |
| `docs/refactoring/phases/COMPLETION_REPORT.md` | [ ] |

---

## Merge Checklist

Before merging to main branch:

1. [ ] All 4 phases complete
2. [ ] Full test suite passes (14,606+ tests)
3. [ ] TypeScript compiles without errors
4. [ ] Build completes successfully
5. [ ] Code reviewed and approved
6. [ ] Documentation complete
7. [ ] CHANGELOG updated
8. [ ] Feature branch rebased on latest main
9. [ ] CI/CD pipeline passes
10. [ ] Completion report approved

---

## Post-Merge Tasks

After merging:

1. [ ] Tag release (if applicable)
2. [ ] Update any external documentation
3. [ ] Announce feature (if applicable)
4. [ ] Monitor for issues
5. [ ] Close related GitHub issues

---

## Conclusion

This concludes the implementation plan for "Simplify with Node Objects" feature.

**Total Estimated Duration:** 12-18 days
**Risk Level:** Medium-High (primarily due to multiply.ts complexity)
**Key Success Factor:** Careful signature ordering and thorough matrix testing

The phased approach minimizes risk by:
1. Building infrastructure first
2. Starting with simpler operators
3. Tackling complex operators with established patterns
4. Comprehensive testing at each phase

Good luck with the implementation!
