# Skipped Tests Analysis - Complete Report

**Analysis Date:** 2026-01-17
**Total Skipped Tests:** 29 (21 unique issues + 8 JS/TS duplicates)
**Analyzer:** Claude Sonnet 4.5

---

## Overview

This document provides a comprehensive analysis of all skipped tests in the mathjs codebase, identifying root causes and categorizing issues for systematic resolution.

---

## Test Inventory by File

| File | Skipped Tests | Category | Priority |
|------|--------------|----------|----------|
| `core/import.test.ts` | 5 | Factory System | LOW |
| `utils/factory.test.ts` | 2 | Factory System | MEDIUM |
| `function/arithmetic/mod.test.ts` | 1 (×2 JS/TS) | BigNumber Precision | MEDIUM |
| `function/arithmetic/multiply.test.ts` | 2 (×2 JS/TS) | BigNumber Precision | HIGH |
| `function/arithmetic/unaryMinus.test.ts` | 1 (×2 JS/TS) | Config Propagation | HIGH |
| `function/statistics/prod.test.ts` | 2 (×2 JS/TS) | Config Propagation | HIGH |
| `function/statistics/quantileSeq.test.ts` | 1 (×2 JS/TS) | BigNumber Precision | MEDIUM |
| `function/statistics/sum.test.ts` | 2 (×2 JS/TS) | Config Propagation | HIGH |
| `type/matrix/SparseMatrix.test.ts` | 2 | Input Validation | HIGH |
| `type/matrix/utils/deepMap.test.ts` | 1 | Feature Decision | HIGH |
| `type/unit/Unit.test.ts` | 1 (×2 JS/TS) | Unimplemented | MEDIUM |
| `function/algebra/rationalize.test.ts` | 1 (×2 JS/TS) | Performance | LOW |

**Total:** 12 test files, 29 test cases

---

## Root Cause Analysis

### Category 1: Configuration/Type Conversion Architecture
**Tests Affected:** 8 (4 unique × 2 files JS/TS)
**Priority:** HIGH
**Complexity:** Medium
**Risk:** Low

#### Issue Description
String-to-number conversion functions don't respect the global `config.number` setting. When users configure mathjs for BigNumber or bigint arithmetic, string inputs should be converted to the configured type, but currently default to regular numbers.

#### Affected Tests
1. **prod.test.ts/js (lines 43, 54)**
   - `prod('10', '3', '4', '2')` with BigNumber config
   - `prod('10', '3', '4', '2')` with bigint config
   - **Expected:** Returns BigNumber(240) or bigint(240)
   - **Actual:** Returns number 240

2. **sum.test.ts/js (lines 45, 56)**
   - `sum('10', '3', '4', '2')` with BigNumber config
   - `sum('10', '3', '4', '2')` with bigint config
   - **Expected:** Returns BigNumber(19) or bigint(19)
   - **Actual:** Returns number 19

3. **unaryMinus.test.ts/js (line 18)**
   - `unaryMinus(true)` with BigNumber config
   - **Expected:** Returns BigNumber(-1)
   - **Actual:** Returns number -1

#### Root Cause
The architecture doesn't pass `config.number` through the function call chain. String conversion happens in utility functions that don't have access to the config object.

#### Current Code Flow
```javascript
prod(['10', '3', '4'])
  → typed-function dispatches to Array handler
  → Array.reduce((a, b) => multiply(a, b))
  → multiply('10', '3')
  → String converted to number (hardcoded)
  → Returns number, not BigNumber
```

#### Solution Approach
Create `parseNumberWithConfig(str, config)` utility that:
- Checks `config.number` setting
- Returns appropriate type: number, BigNumber, bigint, Fraction
- Handles edge cases (decimals with bigint → fallback to number)

#### Code Changes Required
1. **New file:** `src/utils/parseNumber.js`
2. **Update:** `src/function/statistics/prod.js`
3. **Update:** `src/function/statistics/sum.js`
4. **Update:** `src/function/arithmetic/unaryMinus.js`

#### Estimated Effort
- Design: 4 hours
- Implementation: 12 hours
- Testing: 4 hours
- **Total: 20 hours**

---

### Category 2: Factory System Incompleteness
**Tests Affected:** 7
**Priority:** LOW (defer to future)
**Complexity:** High
**Risk:** High

#### Issue Description
The factory import system is incomplete. Several planned features for importing factories dynamically are not implemented.

#### Affected Tests (all in core/import.test.ts)
1. **Line 402:** "should import a factory with name"
   - Import factory with explicit name override

2. **Line 407:** "should import a factory with path"
   - Import using dotted path notation (e.g., `math.utils.factory`)

3. **Line 412:** "should import a factory without name"
   - Auto-naming for unnamed factories

4. **Line 417:** "should pass the namespace to a factory function"
   - Namespace context injection

5. **Line 422:** "should import an Array"
   - Batch import of multiple factories

#### Affected Tests (utils/factory.test.ts)
6. **Line 40:** "should order functions by their dependencies (1)"
   - Topological sort of factory dependencies
   - Note: "FIXME: this doesn't work on IE"

7. **Line 96:** "should not go crazy with circular dependencies"
   - Circular dependency detection
   - Note: "TODO: throw an error in case of circular dependencies"

#### Root Cause
These are planned features that were never completed. The basic factory system works, but advanced import capabilities are missing.

#### Recommendation
**DEFER** - This is a major feature addition requiring:
- Clear use case definition
- API design
- Breaking change consideration
- Extensive testing

#### If Implemented (Estimated Effort)
- Design: 8 hours
- Implementation: 40-60 hours
- Testing: 12 hours
- **Total: 60-80 hours**

---

### Category 3: BigNumber Type Precision
**Tests Affected:** 6 (3 unique × 2 files JS/TS)
**Priority:** MEDIUM
**Complexity:** Medium
**Risk:** Medium (potential breaking change)

#### Issue Description
Operations involving BigNumber lose precision by converting to regular numbers. This affects BigNumber-Unit multiplication, BigNumber modulo with fractions, and mixed-type operations.

#### Affected Tests

##### 3.1: BigNumber × Unit Multiplication (4 tests)
**Files:** multiply.test.ts/js (lines 328, 346)

**Test 1 (line 328):** "should multiply a bignumber and a unit correctly"
```javascript
multiply(bignumber(2), unit('5 mm'))
// Expected: Unit with BigNumber value
// Actual: Unit with number value (precision lost)
```

**Test 2 (line 346):** "should multiply a bignumber and a unit without value correctly"
```javascript
multiply(bignumber(2), unit('mm'))
// Expected: Unit(BigNumber(2), 'mm')
// Actual: Unit(number(2), 'mm')
```

**TODO Comment:** "TODO: cleanup once decided to not downgrade BigNumber to number"

**Root Cause:** Multiply function converts BigNumber to number when operating with Units to avoid type complexity. This loses precision for large numbers.

**Solution:** Add explicit `BigNumber × Unit` signatures to preserve type:
```javascript
'BigNumber, Unit': (x, y) => {
  if (y.value === null) {
    return new Unit(x.clone(), y.unit)
  }
  return new Unit(x.times(y.value), y.unit)
}
```

**Effort:** 6 hours

---

##### 3.2: BigNumber Modulo with Fractions (2 tests)
**Files:** mod.test.ts/js (line 95)

**Test:** "should calculate the modulus of bignumbers for fractions"
```javascript
mod(bignumber(7).div(3), bignumber(1).div(3))
// Expected: BigNumber result (0.333... or error)
// Actual: Currently skipped - behavior undefined
```

**Root Cause:** Mathematical definition of modulo for non-integer operands is ambiguous. BigNumber.js may not support fractional modulo.

**Solution Options:**
1. Implement if BigNumber.js supports it
2. Throw clear error: "Modulo not defined for fractional BigNumbers"
3. Document limitation

**Effort:** 4 hours (research + implement/document)

---

##### 3.3: quantileSeq Type Consistency (2 tests)
**Files:** quantileSeq.test.ts/js (line 119)

**Test:** "should return the quantileSeq of an array of bignumbers with number probability"
```javascript
quantileSeq([bignumber(1), bignumber(2), bignumber(3)], 0.5)
// Expected: BigNumber result (input array type preserved)
// Actual: May return number (type inconsistency)
```

**Root Cause:** Type coercion between BigNumber array and number probability parameter. Return type doesn't match input array type.

**Solution:** Auto-convert probability to BigNumber when array contains BigNumbers:
```javascript
if (isBigNumber(arr[0]) && !isBigNumber(prob)) {
  prob = new BigNumber(prob)
}
```

**Note:** This may already be fixed in recent commits - needs verification.

**Effort:** 4 hours (verify + fix if needed)

---

### Category 4: Input Validation Missing
**Tests Affected:** 4
**Priority:** HIGH (prevents invalid states)
**Complexity:** Low
**Risk:** Low

#### Issue Description
Constructor functions lack input validation, allowing invalid data structures that cause runtime errors later.

#### Affected Tests

##### 4.1: SparseMatrix Dimension Validation (2 tests)
**Files:** SparseMatrix.test.ts (lines 184, 195)

**Test 1 (line 184):** "should throw an error when input array does not have two dimensions"
```javascript
// Should reject 1D array
new SparseMatrix([1, 2, 3])
// Expected: DimensionError
// Actual: Accepts and creates invalid matrix

// Should reject 3D array
new SparseMatrix([[[1]]])
// Expected: DimensionError
// Actual: Accepts and creates invalid matrix
```

**Test 2 (line 195):** "should throw an error when the dimensions of the input array are invalid"
```javascript
// Should reject jagged array (inconsistent row lengths)
new SparseMatrix([[1, 2], [4, 5, 6]])
// Expected: DimensionError
// Actual: Accepts and creates malformed matrix
```

**TODO Comment:** "TODO: add some more input validations to SparseMatrix"

**Root Cause:** Constructor doesn't validate array structure. Assumes input is well-formed 2D array.

**Solution:** Add validation checks:
```javascript
constructor(data, datatype) {
  // Check if 1D
  if (!Array.isArray(data[0])) {
    throw new DimensionError('SparseMatrix requires 2D array, got 1D')
  }

  // Check if 3D+
  if (Array.isArray(data[0][0])) {
    throw new DimensionError('SparseMatrix requires 2D array, got 3D or higher')
  }

  // Check for jagged array
  const expectedCols = data[0].length
  for (let i = 1; i < data.length; i++) {
    if (data[i].length !== expectedCols) {
      throw new DimensionError(`Row ${i} has ${data[i].length} columns, expected ${expectedCols}`)
    }
  }

  // ... continue with existing logic
}
```

**Effort:** 4 hours

---

##### 4.2: deepMap skipZeros Feature (1 test)
**Files:** deepMap.test.ts (line 98)

**Test:** "should skip zero values if skipZeros is true"
```javascript
deepMap([1, 0, 2], callback, true)
// Expected: callback not called for zero values
// Actual: skipZeros parameter exists but doesn't work
```

**TODO Comment:** "TODO: either deprecate the skipZeros option, or implement it for real"

**Root Cause:** `skipZeros` parameter was planned but never implemented. Parameter exists in signature but is ignored.

**Solution Options:**
1. **Remove parameter (RECOMMENDED):**
   - Delete from function signature
   - Remove from all call sites
   - Delete the test
   - **Effort:** 4 hours

2. **Implement feature:**
   - Add zero-checking logic
   - Write comprehensive tests
   - **Effort:** 8 hours

**Recommendation:** Remove - feature appears unused and adds complexity.

**Effort:** 4 hours (removal)

---

##### 4.3: rationalize Performance (1 test - may already be fixed)
**Files:** rationalize.test.ts/js (line 201)

**Test:** "processes a really complex expression"
```javascript
rationalize(veryComplexNestedExpression)
// Note: "this test passes but takes forever to complete"
```

**Root Cause:** Algorithm has exponential complexity for deeply nested expressions. Test is correct but too slow for CI.

**Recent Work:** Iteration limit was added in recent commits (see git history):
```javascript
// From recent commit
if (iterations > maxIterations) {
  throw new Error('Expression too complex for rationalize')
}
```

**Action Required:**
1. Verify iteration limit is working
2. Try enabling test with timeout
3. If still too slow, document performance limitation

**Effort:** 2 hours (verification + documentation)

---

### Category 5: Unimplemented Algebra
**Tests Affected:** 3 (2 unique, considering JS/TS duplicates)
**Priority:** MEDIUM
**Complexity:** High
**Risk:** Medium

#### Issue Description
Complex algebraic simplification features are not fully implemented.

#### Affected Tests

##### 5.1: Unit Cancellation (2 tests)
**Files:** Unit.test.ts/js (line 1440)

**Test:** "should cancel units in numerator and denominator"
```javascript
multiply(unit('2 J/K/g'), unit('2 g'))
// Expected: unit('4 J/K') - grams cancel
// Actual: unit('4 J*g/K/g') - no cancellation
```

**Root Cause:** Unit multiplication doesn't simplify compound units. Missing algebraic simplification.

**Required Algorithm:**
```javascript
class Unit {
  simplify() {
    // 1. Parse numerator and denominator units
    // 2. Find matching units with powers
    // 3. Cancel matching units: J/K/g * g → J/K
    // 4. Reduce powers: m^2 / m → m^1
    // 5. Remove units with power 0
  }
}
```

**Challenges:**
- Unit power tracking
- Fractional units (1/m vs m^-1)
- Unit aliases (meter vs m)

**Effort:** 12 hours (complex algebra)

---

##### 5.2: Circular Dependency Detection (1 test)
**Files:** factory.test.ts (line 96)

**Test:** "should not go crazy with circular dependencies"
```javascript
// Create factories with circular dependencies: A→B→C→A
math.import([factoryA, factoryB, factoryC])
// Expected: Throws error "Circular dependency detected: A → B → C → A"
// Actual: May infinite loop or behave unexpectedly
```

**TODO Comment:** "TODO: throw an error in case of circular dependencies"

**Root Cause:** Dependency resolution doesn't detect cycles. Can cause infinite loops during factory initialization.

**Required Algorithm:**
```javascript
function detectCircularDependencies(factories) {
  const visited = new Set()
  const stack = new Set()

  function dfs(factoryName) {
    if (stack.has(factoryName)) {
      // Found cycle!
      const cycle = Array.from(stack)
      cycle.push(factoryName)
      throw new Error(`Circular dependency: ${cycle.join(' → ')}`)
    }

    if (visited.has(factoryName)) return

    visited.add(factoryName)
    stack.add(factoryName)

    for (const dep of getDependencies(factoryName)) {
      dfs(dep)
    }

    stack.delete(factoryName)
  }

  // Check all factories
  for (const factory of factories) {
    dfs(factory.name)
  }
}
```

**Effort:** 6 hours

---

## Issue Categories Summary

| Category | Tests | Priority | Effort | Risk |
|----------|-------|----------|--------|------|
| Config Propagation | 8 | HIGH | 20h | Low |
| Factory System | 7 | LOW | 60-80h | High |
| BigNumber Precision | 6 | MEDIUM | 14h | Medium |
| Input Validation | 4 | HIGH | 10h | Low |
| Unimplemented Algebra | 3 | MEDIUM | 18h | Medium |
| Performance | 1 | LOW | 2h | Low |
| **TOTAL** | **29** | - | **124-144h** | - |

---

## Dependencies Between Issues

### No Dependencies (Can Be Done in Parallel)
- Input Validation (Category 4)
- Performance fix (Category 5)
- BigNumber precision (Category 3)

### Architectural Dependencies
- **Config Propagation** (Category 1) could inform BigNumber approach
- **Factory System** (Category 2) affects circular dependency detection (Category 5.2)

### Recommended Order
1. **Phase 1:** Input Validation + Performance (12 hours) - Low risk, quick wins
2. **Phase 2:** Config Propagation (20 hours) - Fixes architectural issue
3. **Phase 3:** BigNumber Precision (14 hours) - Builds on config system
4. **Phase 4:** Unimplemented Algebra (18 hours) - Complex features
5. **Phase 5:** Factory System (60-80 hours) - Defer, requires design

---

## Breaking Change Analysis

### Likely Breaking Changes
1. **BigNumber × Unit precision** - May change return types
   - Mitigation: Document in HISTORY.md, add to migration guide

2. **SparseMatrix validation** - May reject previously "accepted" invalid inputs
   - Mitigation: These were always bugs; rejection is correct behavior

### No Breaking Changes
- Config propagation - Fixes bugs, doesn't change valid behavior
- Circular dependency detection - Prevents errors
- Input validation - Rejects invalid inputs (good!)

---

## Testing Strategy

### Test Enablement Process
1. Remove `it.skip` → `it`
2. Run test to verify it passes
3. Run full test suite to check for regressions
4. Update HISTORY.md if breaking change

### Regression Testing
- Run full test suite after each fix
- Pay special attention to related functions
- Example: Fixing `prod` → test `sum`, `multiply`, etc.

### Performance Testing
- Benchmark BigNumber operations before/after
- Ensure no performance degradation
- Document any tradeoffs

---

## Documentation Updates Required

### For Each Fix
- Update HISTORY.md with change description
- Add migration notes if breaking change
- Update embedded docs if API changes

### Overall Documentation
- Create architecture doc for config propagation
- Document BigNumber precision policy
- Update type definitions in types/index.d.ts

---

## Success Metrics

### Quantitative
- **Tests enabled:** 29 → 0 skipped
- **Test coverage:** Maintains >95%
- **TypeScript errors:** Remains at 0
- **Performance:** No regression >5%

### Qualitative
- Clear error messages for invalid inputs
- Consistent type handling across functions
- Documented design decisions

---

## Next Steps

1. **Review this analysis** with project stakeholders
2. **Approve resolution plan** (see SKIPPED_TESTS_RESOLUTION_PLAN.md)
3. **Create sprint TODO files** for approved phases
4. **Begin implementation** with Phase 1 (Input Validation)

---

## References

- **Resolution Plan:** `docs/refactoring/SKIPPED_TESTS_RESOLUTION_PLAN.md`
- **Test Files:** `test/unit-tests/` (various locations)
- **Source Files:** `src/` (various locations)
- **Issue Tracking:** This document serves as the master issue tracker

---

**Document Status:** Complete
**Last Updated:** 2026-01-17
**Next Review:** After Phase 1 completion
