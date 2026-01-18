# Simplify with Node Objects - Implementation Plan

**Feature:** Enable arithmetic operators to work with Node objects
**Status:** Planning
**Complexity:** Very High
**Estimated Duration:** 2-4 weeks
**Created:** 2026-01-16

---

## Executive Summary

This implementation plan details the architectural changes required to enable math.js arithmetic operators (`add`, `subtract`, `multiply`, `divide`) to accept expression Node objects as operands, returning symbolic OperatorNode results instead of only numeric values.

### Current Behavior (Broken)
```javascript
math.add(5, math.parse('2'))  // ERROR: "Unexpected type of argument"
math.multiply(3, math.parse('x'))  // ERROR: "Unexpected type of argument"
```

### Target Behavior
```javascript
math.add(5, math.parse('2'))
// Returns: OperatorNode('+', 'add', [ConstantNode(5), ConstantNode(2)])

math.multiply(3, math.parse('x'))
// Returns: OperatorNode('*', 'multiply', [ConstantNode(3), SymbolNode('x')])

// Integration with simplify:
math.simplify('5 + derivative(x^2, x)')  // Returns: "5 + 2 * x"
```

---

## Phase Overview

| Phase | Name | Duration | Risk | Files Changed |
|-------|------|----------|------|---------------|
| 1 | Infrastructure | 2-3 days | Low | 2-3 files |
| 2 | Simple Operators | 3-5 days | Medium | 2 files + tests |
| 3 | Complex Operators | 5-7 days | High | 2 files + tests |
| 4 | Integration | 2-3 days | Medium | Tests + docs |

**Total Estimated Duration:** 12-18 days (2-4 weeks with buffer)

---

## Phase Breakdown

### [Phase 1: Infrastructure](./01-PHASE-INFRASTRUCTURE.md)
- Sprint 1.1: Node Utility Module
- Sprint 1.2: Type System Preparation
- Sprint 1.3: Test Infrastructure

### [Phase 2: Simple Operators](./02-PHASE-SIMPLE-OPERATORS.md)
- Sprint 2.1: Add Operator Node Support
- Sprint 2.2: Subtract Operator Node Support
- Sprint 2.3: Comprehensive Testing

### [Phase 3: Complex Operators](./03-PHASE-COMPLEX-OPERATORS.md)
- Sprint 3.1: Divide Operator Node Support
- Sprint 3.2: Multiply Operator Node Support
- Sprint 3.3: Matrix Integration Verification

### [Phase 4: Integration](./04-PHASE-INTEGRATION.md)
- Sprint 4.1: Simplify Integration
- Sprint 4.2: Enable Pending Tests
- Sprint 4.3: Documentation & Types
- Sprint 4.4: Final Validation

---

## Architecture Overview

### Current Arithmetic Operator Flow
```
math.add(a, b)
    │
    ▼
typed-function dispatch
    │
    ├── 'number, number' → addScalar → numeric result
    ├── 'BigNumber, BigNumber' → addScalar → BigNumber result
    ├── 'Complex, Complex' → addScalar → Complex result
    ├── 'Matrix, Matrix' → matrixAlgorithmSuite → Matrix result
    └── 'any, any' → addScalar → ERROR if Node
```

### Target Arithmetic Operator Flow
```
math.add(a, b)
    │
    ▼
typed-function dispatch
    │
    ├── 'Node, Node' → createOperatorNode → OperatorNode result     ◄── NEW
    ├── 'Node, number' → createOperatorNode → OperatorNode result   ◄── NEW
    ├── 'number, Node' → createOperatorNode → OperatorNode result   ◄── NEW
    ├── 'Node, BigNumber' → createOperatorNode → OperatorNode result◄── NEW
    │   ... (other Node combinations)
    ├── 'number, number' → addScalar → numeric result
    ├── 'BigNumber, BigNumber' → addScalar → BigNumber result
    ├── 'Matrix, Matrix' → matrixAlgorithmSuite → Matrix result
    └── 'any, any' → addScalar → numeric result
```

### Key Design Decisions

1. **Signature Priority**: Node signatures MUST appear BEFORE 'any, any' in typed-function to ensure correct dispatch

2. **Return Type Consistency**: Always return OperatorNode, let simplify handle optimization

3. **Type Coverage**: Support all numeric types that can be wrapped in ConstantNode:
   - `number`
   - `BigNumber`
   - `Complex`
   - `Fraction`
   - `string` (symbolic)

4. **Matrix Exclusion**: Initial implementation excludes Matrix + Node combinations

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Type dispatch conflicts | Medium | High | Careful signature ordering, extensive testing |
| Matrix algorithm interference | Medium | High | Isolate Node signatures, test matrix ops |
| Backwards compatibility break | Low | Critical | Full regression test suite |
| Variadic signature issues | Medium | Medium | Special handling for ...rest args |
| Performance degradation | Low | Medium | Benchmark before/after |

---

## Success Criteria

### Functional Requirements
- [ ] `math.add(number, Node)` returns OperatorNode
- [ ] `math.add(Node, number)` returns OperatorNode
- [ ] `math.add(Node, Node)` returns OperatorNode
- [ ] Same for subtract, multiply, divide
- [ ] Variadic operations work: `math.add(1, parse('x'), parse('y'))`
- [ ] All existing tests pass (14,606+ tests)
- [ ] Pending simplify test passes

### Non-Functional Requirements
- [ ] No performance regression for scalar operations
- [ ] TypeScript definitions updated
- [ ] Documentation updated
- [ ] Code follows existing patterns

---

## File Inventory

### Files to Create
| File | Purpose |
|------|---------|
| `src/function/arithmetic/utils/nodeOperations.ts` | Shared Node utilities |
| `test/unit-tests/function/arithmetic/nodeOperations.test.ts` | Node operation tests |

### Files to Modify
| File | Lines | Changes |
|------|-------|---------|
| `src/function/arithmetic/add.ts` | 162 | +40-60 lines |
| `src/function/arithmetic/subtract.ts` | 154 | +40-60 lines |
| `src/function/arithmetic/multiply.ts` | 1,127 | +50-80 lines |
| `src/function/arithmetic/divide.ts` | 161 | +40-60 lines |
| `types/index.d.ts` | ~6000 | +100-150 lines |

### Test Files to Update
| File | Changes |
|------|---------|
| `test/unit-tests/function/algebra/simplify.test.ts` | Enable skipped test |
| `test/unit-tests/function/algebra/simplify.test.js` | Enable skipped test |
| `test/unit-tests/function/arithmetic/add.test.ts` | Add Node tests |
| `test/unit-tests/function/arithmetic/subtract.test.ts` | Add Node tests |
| `test/unit-tests/function/arithmetic/multiply.test.ts` | Add Node tests |
| `test/unit-tests/function/arithmetic/divide.test.ts` | Add Node tests |

---

## Dependencies

### Internal Dependencies
- `src/expression/node/ConstantNode.js` - For wrapping values
- `src/expression/node/OperatorNode.js` - For creating operations
- `src/expression/node/SymbolNode.js` - For variable handling
- `src/utils/is.ts` - Type checking functions

### External Dependencies
- `typed-function` - Type dispatch system (already in use)

---

## Rollback Strategy

If implementation causes issues:

1. **Phase-level rollback**: Each phase is independently revertible
2. **Feature flag**: Can add `config.enableNodeOperators` if needed
3. **Git revert**: Each phase committed separately for easy revert

---

## Next Steps

1. Review this overview with stakeholders
2. Begin [Phase 1: Infrastructure](./01-PHASE-INFRASTRUCTURE.md)
3. Track progress in `docs/refactoring/TODO.md`

---

## References

- [Pending Test](../../test/unit-tests/function/algebra/simplify.test.ts:747)
- [PENDING_TESTS_TODO.md](../PENDING_TESTS_TODO.md)
- [typed-function documentation](https://github.com/josdejong/typed-function)
- [Node Architecture](../../src/expression/node/)
