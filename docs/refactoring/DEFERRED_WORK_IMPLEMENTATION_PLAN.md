# Deferred Work Implementation Plan

This document provides detailed implementation plans for the two deferred work items from the skipped tests resolution effort.

## Overview

Two complex features were deferred during the sprint implementation session due to their high complexity and architectural impact:

1. **Phase 4 Sprint 1: Unit Cancellation Algebra** (8 hours, 2 tests)
2. **Phase 2: Config Propagation** (12-16 hours total, 8 tests)

Both features require dedicated design and implementation sessions with careful architectural consideration.

---

## Feature 1: Unit Cancellation Algebra

### Summary

**Goal**: Implement algebraic simplification for compound units, enabling automatic cancellation of matching units in numerator and denominator.

**Impact**: Fixes 2 skipped tests and significantly improves Unit usability for complex calculations.

**Effort**: ~8 hours

**Priority**: MEDIUM (UX improvement, not critical functionality)

### Current Behavior vs. Expected Behavior

**Current (Unsimplified)**:
```javascript
math.evaluate('2 J/K/g * 2 g')
// Returns: '4 J*g / K / g'  ← No cancellation, redundant units
```

**Expected (Simplified)**:
```javascript
math.evaluate('2 J/K/g * 2 g')
// Returns: '4 J / K'  ← Grams cancel automatically

math.evaluate('2 J/K/g * 2 K')
// Returns: '4 J / g'  ← Kelvins cancel
```

### Architecture Overview

The implementation requires three main components:

1. **Unit Simplification Algorithm**: Core logic to identify and cancel matching units
2. **Auto-Simplification Integration**: Call simplification after multiply/divide operations
3. **Comprehensive Testing**: Edge cases like power reduction, dimensionless results, aliases

### Detailed Implementation Plan

#### Task 1: Design Unit Cancellation Algorithm (2 hours)

**Objective**: Create a clear algorithm specification before implementation.

**Steps**:

1. **Analyze Current Unit Structure**
   - Read `src/type/unit/Unit.js` and `src/type/unit/Unit.ts`
   - Understand internal representation of compound units
   - Document how units like `J/K/g` are stored internally
   - **CRITICAL**: The structure below is an ASSUMPTION - you MUST verify the actual structure before proceeding
   - Expected structure (VERIFY THIS):
     ```javascript
     {
       units: [
         { unit: { name: 'J' }, prefix: { name: '' }, power: 1 },
         { unit: { name: 'K' }, prefix: { name: '' }, power: -1 },
         { unit: { name: 'g' }, prefix: { name: '' }, power: -1 }
       ]
     }
     ```

2. **Define Simplification Algorithm**
   ```
   Algorithm: simplifyUnit(unit)
   Input: Unit with potentially redundant units in numerator/denominator
   Output: Simplified Unit with canceled units

   1. Parse unit structure into numerator and denominator lists
      - Numerator: units with power > 0
      - Denominator: units with power < 0 (convert to positive power)

   2. For each unit in numerator:
      a. Search for matching unit in denominator
      b. If match found:
         - Calculate cancel amount = min(num_power, den_power)
         - Reduce both powers by cancel amount
         - Remove unit if power becomes 0

   3. Reconstruct unit from simplified lists

   4. Return new Unit with simplified unit string
   ```

3. **Define Unit Matching Logic**
   ```javascript
   function unitsMatch(unit1, unit2):
     // Step 1: Normalize unit names (handle aliases)
     name1 = normalizeUnitName(unit1.name)
     name2 = normalizeUnitName(unit2.name)

     // Step 2: Compare normalized names
     if (name1 !== name2):
       return false

     // Step 3: Check prefixes must match
     // IMPORTANT: km ≠ m (different magnitudes)
     if (unit1.prefix.name !== unit2.prefix.name):
       return false

     return true
   ```

4. **Handle Edge Cases**
   - **Power Reduction**: `m^2 / m = m^(2-1) = m`
   - **Dimensionless Result**: `m / m = 1` (empty unit)
   - **Unit Aliases**: `meter` should match `m` (if supported)
   - **Prefix Handling**: `km` should NOT cancel with `m`
   - **Partial Cancellation**: `m^3 / m^2 = m`

5. **Decide Simplification Timing**
   - **Recommendation**: Auto-simplify after multiply/divide
   - **Rationale**: Matches mathematical convention and user expectations
   - **Alternative**: Manual `simplify()` method (less intuitive)

6. **Create Design Document**
   - File: `docs/architecture/UNIT_SIMPLIFICATION_DESIGN.md`
   - Contents: Algorithm pseudocode, edge cases, examples, decisions

**Deliverables**:
- Design document with complete algorithm specification
- Edge case inventory with expected behaviors
- Decision rationale for auto-simplification

**Acceptance Criteria**:
- [ ] Unit internal structure documented
- [ ] Simplification algorithm fully specified
- [ ] Unit matching logic defined with alias handling
- [ ] All edge cases identified and solutions designed
- [ ] Auto-simplification strategy decided
- [ ] Design document created

---

#### Task 2: Implement Unit Simplification (4 hours)

**Objective**: Implement the `simplify()` method in Unit class with auto-simplification.

**Files to Modify**:
- `src/type/unit/Unit.js`
- `src/type/unit/Unit.ts`

**Implementation Steps**:

**CRITICAL PREREQUISITES**:
- MUST verify Unit has `clone()` method (if not, use `new Unit(this.value, this.units)`)
- MUST verify how Unit reconstructs unit strings (may need to use existing methods)
- MUST verify actual unit structure before implementing (see Task 1)

1. **Add `simplify()` Method to Unit Class**

```javascript
// In src/type/unit/Unit.js (and .ts)

/**
 * Simplify this unit by canceling matching units in numerator and denominator.
 *
 * Performs algebraic cancellation on compound units. For example:
 * - J/K/g * g → J/K (grams cancel)
 * - m^2 / m → m (power reduction)
 * - m / m → 1 (dimensionless)
 *
 * @returns {Unit} A new simplified Unit
 *
 * @example
 * const energy = unit('2 J/K/g')
 * const mass = unit('2 g')
 * const result = energy.multiply(mass) // Auto-simplified to J/K
 *
 * @example
 * const area = unit('10 m^2')
 * const length = unit('2 m')
 * const result = area.divide(length) // Returns: 5 m
 */
Unit.prototype.simplify = function() {
  // Handle simple units (no simplification needed)
  if (!this.units || this.units.length <= 1) {
    return this.clone()
  }

  // Separate into numerator (power > 0) and denominator (power < 0)
  const numerator = []
  const denominator = []

  for (const unitObj of this.units) {
    if (unitObj.power > 0) {
      numerator.push({ ...unitObj })
    } else if (unitObj.power < 0) {
      denominator.push({
        ...unitObj,
        power: Math.abs(unitObj.power)
      })
    }
  }

  // Cancel matching units
  for (let i = numerator.length - 1; i >= 0; i--) {
    for (let j = denominator.length - 1; j >= 0; j--) {
      if (this._unitsEqual(numerator[i], denominator[j])) {
        // Calculate how much to cancel
        const cancelAmount = Math.min(
          numerator[i].power,
          denominator[j].power
        )

        // Reduce powers
        numerator[i].power -= cancelAmount
        denominator[j].power -= cancelAmount

        // Remove if power becomes 0
        if (numerator[i].power === 0) {
          numerator.splice(i, 1)
        }
        if (denominator[j].power === 0) {
          denominator.splice(j, 1)
        }

        break // Move to next numerator unit
      }
    }
  }

  // Reconstruct simplified unit array
  const simplifiedUnits = [
    ...numerator,
    ...denominator.map(u => ({ ...u, power: -u.power }))
  ]

  // Create new Unit with simplified structure
  if (simplifiedUnits.length === 0) {
    // All units canceled - dimensionless result
    return new Unit(this.value, null)
  }

  return new Unit(this.value, this._reconstructUnitString(simplifiedUnits))
}
```

2. **Add Helper Method: `_unitsEqual()`**

```javascript
/**
 * Check if two unit objects represent the same physical unit.
 * Handles unit aliases and requires matching prefixes.
 *
 * @param {Object} unit1 - First unit object
 * @param {Object} unit2 - Second unit object
 * @returns {boolean} True if units match
 * @private
 */
Unit.prototype._unitsEqual = function(unit1, unit2) {
  // Normalize unit names to handle aliases
  const name1 = this._normalizeUnitName(unit1.unit.name)
  const name2 = this._normalizeUnitName(unit2.unit.name)

  // Names must match
  if (name1 !== name2) {
    return false
  }

  // Prefixes must match (km ≠ m)
  if (unit1.prefix.name !== unit2.prefix.name) {
    return false
  }

  return true
}
```

3. **Add Helper Method: `_normalizeUnitName()`**

```javascript
/**
 * Normalize unit names to handle aliases.
 *
 * @param {string} name - Unit name
 * @returns {string} Normalized name
 * @private
 */
Unit.prototype._normalizeUnitName = function(name) {
  // Check if Unit class already has alias support
  // If not, implement basic normalization

  const normalized = name.toLowerCase()

  // Common aliases (add more as needed)
  const aliasMap = {
    'meter': 'm',
    'meters': 'm',
    'metre': 'm',
    'metres': 'm',
    'second': 's',
    'seconds': 's',
    'gram': 'g',
    'grams': 'g',
    // Add more as discovered in testing
  }

  return aliasMap[normalized] || normalized
}
```

4. **Add Helper Method: `_reconstructUnitString()`**

```javascript
/**
 * Reconstruct unit string from simplified unit array.
 *
 * @param {Array} units - Simplified unit objects
 * @returns {string} Unit string representation
 * @private
 */
Unit.prototype._reconstructUnitString = function(units) {
  // This method likely already exists in Unit class
  // If not, implement based on Unit's internal format

  // Example implementation:
  const numerator = units.filter(u => u.power > 0)
  const denominator = units.filter(u => u.power < 0)

  let str = numerator
    .map(u => this._formatUnitPart(u))
    .join(' ')

  if (denominator.length > 0) {
    str += ' / ' + denominator
      .map(u => this._formatUnitPart({ ...u, power: Math.abs(u.power) }))
      .join(' / ')
  }

  return str
}
```

5. **Integrate Auto-Simplification in `multiply()`**

```javascript
// In Unit.prototype.multiply
Unit.prototype.multiply = function(other) {
  // ... existing multiplication logic ...

  const result = new Unit(newValue, newUnits)

  // Auto-simplify after multiplication
  return result.simplify()
}
```

6. **Integrate Auto-Simplification in `divide()`**

```javascript
// In Unit.prototype.divide
Unit.prototype.divide = function(other) {
  // ... existing division logic ...

  const result = new Unit(newValue, newUnits)

  // Auto-simplify after division
  return result.simplify()
}
```

**Dual Codebase Reminder**:
- Implement in BOTH `Unit.js` and `Unit.ts`
- TypeScript version needs proper type annotations
- Keep implementations functionally identical

**Testing During Implementation**:
```javascript
// Quick manual test
const unit1 = unit('2 J/K/g')
const unit2 = unit('2 g')
const result = unit1.multiply(unit2)
console.log(result.toString()) // Should print: "4 J / K"
```

**Deliverables**:
- `simplify()` method implemented
- Helper methods: `_unitsEqual()`, `_normalizeUnitName()`, `_reconstructUnitString()`
- Auto-simplification in `multiply()` and `divide()`
- Both .js and .ts versions updated

**Acceptance Criteria**:
- [ ] simplify() method implemented in Unit class
- [ ] Matching units canceled correctly
- [ ] Power reduction works (m^2/m = m)
- [ ] Dimensionless results handled (m/m = empty)
- [ ] Unit names normalized for alias matching
- [ ] Prefixes respected (km ≠ m)
- [ ] Auto-simplification in multiply() and divide()
- [ ] Both JS and TS implementations complete
- [ ] Manual testing confirms basic cancellation works

---

#### Task 3: Testing and Validation (2 hours)

**Objective**: Enable skipped tests and add comprehensive edge case coverage.

**Files to Modify**:
- `test/unit-tests/type/unit/Unit.test.ts`
- `test/unit-tests/type/unit/Unit.test.js`

**Implementation Steps**:

1. **Enable Main Cancellation Test**

```javascript
// Line 1440 in Unit.test.ts and Unit.test.js
// BEFORE:
it.skip('should cancel units in numerator and denominator', function () {

// AFTER:
it('should cancel units in numerator and denominator', function () {
  // Test case 1: J/K/g * g = J/K
  assert.strictEqual(
    mathTs.evaluate('2 J/K/g * 2 g').toString(),
    '4 J / K'
  )

  // Test case 2: J/K/g * K = J/g
  assert.strictEqual(
    mathTs.evaluate('2 J/K/g * 2 K').toString(),
    '4 J / g'
  )
})
```

2. **Add Power Reduction Test**

```javascript
it('should reduce unit powers when simplifying', function () {
  // m^2 / m = m
  const area = mathTs.unit('10 m^2')
  const length = mathTs.unit('2 m')
  const result = mathTs.divide(area, length)

  assert.strictEqual(result.toString(), '5 m')
  assert(!result.toString().includes('m^2'))

  // m^3 / m^2 = m
  const volume = mathTs.unit('8 m^3')
  const area2 = mathTs.unit('2 m^2')
  const result2 = mathTs.divide(volume, area2)

  assert.strictEqual(result2.toString(), '4 m')
})
```

3. **Add Dimensionless Result Test**

```javascript
it('should produce dimensionless unit when all units cancel', function () {
  // m / m = 1 (dimensionless)
  const length1 = mathTs.unit('10 m')
  const length2 = mathTs.unit('5 m')
  const result = mathTs.divide(length1, length2)

  assert.strictEqual(result.value, 2)
  assert.strictEqual(result.toString(), '2') // No unit

  // More complex: J / (N*m) = 1 (since J = N*m)
  // This test depends on unit conversion capabilities
})
```

4. **Add Prefix Handling Test**

```javascript
it('should not cancel units with different prefixes', function () {
  // km and m should NOT cancel (different magnitudes)
  const dist1 = mathTs.unit('10 km')
  const dist2 = mathTs.unit('2 m')
  const result = mathTs.divide(dist1, dist2)

  // Should preserve both units or convert to same base
  // The exact behavior depends on Unit implementation
  // Expected: conversion to common base, then cancel
  assert.strictEqual(result.value, 5000) // 10000m / 2m
  assert.strictEqual(result.toString(), '5000')
})
```

5. **Add Complex Cancellation Test**

```javascript
it('should handle complex multi-unit cancellation', function () {
  // J*m/m = J (meters cancel)
  const result1 = mathTs.evaluate('20 J * 4 m / 4 m')
  assert.strictEqual(result1.toString(), '20 J')

  // kg*m^2/s^2 / m = kg*m/s^2 (one m cancels)
  const result2 = mathTs.evaluate('10 kg*m^2/s^2 / 2 m')
  assert.strictEqual(result2.toString(), '5 kg m / s^2')
})
```

6. **Add Non-Matching Units Test**

```javascript
it('should not cancel non-matching units', function () {
  // m and s should not cancel (different dimensions)
  const result1 = mathTs.evaluate('10 m / 2 s')
  assert.strictEqual(result1.toString(), '5 m / s')

  // Verify both units preserved
  assert(result1.toString().includes('m'))
  assert(result1.toString().includes('s'))
})
```

7. **Run Test Suite**
```bash
# Run only Unit tests
npm test -- --grep "Unit"

# Run full test suite
npm run test:src

# Verify no regressions
npm test
```

**Deliverables**:
- 2 skipped tests enabled (JS and TS)
- 5+ new tests for edge cases
- All tests passing
- No regressions in existing tests

**Acceptance Criteria**:
- [ ] Main cancellation test enabled (it.skip → it)
- [ ] Test verifies 'J/K/g * g = J/K'
- [ ] Test verifies 'J/K/g * K = J/g'
- [ ] Power reduction test passes
- [ ] Dimensionless result test passes
- [ ] Prefix handling test passes
- [ ] Complex cancellation test passes
- [ ] Non-matching units test passes
- [ ] All tests pass in both JS and TS versions
- [ ] No regressions in full test suite

---

### Implementation Checklist

**Pre-Implementation**:
- [ ] Read and understand current Unit.js implementation
- [ ] Document internal unit structure
- [ ] Create design document (Task 1)
- [ ] Get approval on design approach

**Implementation** (Task 2):
- [ ] Implement simplify() method
- [ ] Implement _unitsEqual() helper
- [ ] Implement _normalizeUnitName() helper
- [ ] Implement _reconstructUnitString() helper (if needed)
- [ ] Add auto-simplification to multiply()
- [ ] Add auto-simplification to divide()
- [ ] Update both .js and .ts versions
- [ ] Manual testing confirms basic functionality

**Testing** (Task 3):
- [ ] Enable main cancellation test
- [ ] Add power reduction test
- [ ] Add dimensionless result test
- [ ] Add prefix handling test
- [ ] Add complex cancellation test
- [ ] Add non-matching units test
- [ ] Run Unit test suite (all pass)
- [ ] Run full test suite (no regressions)

**Documentation**:
- [ ] Update HISTORY.md with feature description
- [ ] Add JSDoc examples to simplify() method
- [ ] Document auto-simplification behavior
- [ ] Update relevant function documentation

**Completion**:
- [ ] All tests passing
- [ ] Dual codebase (.js/.ts) updated
- [ ] Documentation complete
- [ ] Commit with message: "feat: Add automatic unit cancellation in compound units"
- [ ] Push to GitHub

---

### Risk Assessment

**High Risk Areas**:
1. **Unit Internal Structure Mismatch**: Design assumes certain structure
   - **Mitigation**: Start with Task 1 (analysis) before implementation

2. **Alias Handling Complexity**: Many unit aliases exist
   - **Mitigation**: Start with basic implementation, extend as needed

3. **Performance Impact**: Simplification on every operation
   - **Mitigation**: Profile performance, add option to disable if needed

4. **Breaking Changes**: Auto-simplification may change existing behavior
   - **Mitigation**: Add tests to verify no regressions

**Low Risk Areas**:
- Core cancellation algorithm is straightforward
- Edge cases are well-defined
- Tests provide clear validation

---

### Success Metrics

**Tests**:
- 2 skipped tests enabled and passing
- 5+ edge case tests added and passing
- 0 regressions in existing test suite

**Code Quality**:
- Dual codebase maintained (.js and .ts)
- Clean implementation with helper methods
- Comprehensive JSDoc documentation

**User Experience**:
- Simplified unit output matches mathematical conventions
- Automatic simplification feels intuitive
- Complex calculations produce clean results

---

## Feature 2: Config Propagation

### Summary

**Goal**: Fix string and boolean inputs to respect `config.number` setting in prod, sum, and unaryMinus functions.

**Impact**: Fixes 8 skipped tests and significantly improves BigNumber/bigint config usability.

**Effort**: ~12-16 hours (3 sprints)

**Priority**: HIGH (affects user-configured number types)

### Current Behavior vs. Expected Behavior

**Current (Ignores Config)**:
```javascript
const math = create({ config: { number: 'BigNumber' } })

math.prod(['10', '3', '4', '2'])
// Returns: 240 (regular number) ← Ignores BigNumber config

math.sum(['10', '3'])
// Returns: 13 (regular number) ← Ignores BigNumber config

math.unaryMinus(true)
// Returns: -1 (regular number) ← Ignores BigNumber config
```

**Expected (Respects Config)**:
```javascript
const math = create({ config: { number: 'BigNumber' } })

math.prod(['10', '3', '4', '2'])
// Returns: BigNumber(240) ← Respects config

math.sum(['10', '3'])
// Returns: BigNumber(13) ← Respects config

math.unaryMinus(true)
// Returns: BigNumber(-1) ← Respects config
```

### Architecture Overview

The implementation follows a **pragmatic, localized approach** (Option C from design analysis):

1. **Create Utility**: `parseNumberWithConfig()` - centralized parsing logic
2. **Update prod/sum**: Pre-convert string inputs before calculation
3. **Update unaryMinus**: Convert boolean inputs respecting config
4. **Enable Tests**: Verify all 8 tests pass

This approach is chosen for:
- ✅ Minimal code changes (low risk)
- ✅ No breaking API changes
- ✅ Reusable utility function
- ✅ Clear, maintainable implementation

### Detailed Implementation Plan

---

#### Sprint 2.1: Design Config Propagation (4 hours)

**Objective**: Analyze type conversion architecture and design solution.

This sprint is primarily **analysis and documentation** - no code changes.

**Task 2.1.1: Analyze Current Type Conversion Architecture (2 hours)**

**Steps**:

1. **Trace String Conversion in prod()**
```bash
# Search for string conversion patterns
grep -r "typeof.*string" src/function/statistics/prod.js
grep -r "String" src/function/statistics/prod.js

# Examine prod implementation
Read src/function/statistics/prod.js
Read src/function/statistics/prod.ts
```

2. **Map typed-function Conversion Behavior**
```bash
# Understand how typed-function handles conversions
Read src/core/typed.js
Read node_modules/@danielsimonjr/typed-function/index.js

# Questions to answer:
# - Does typed-function do automatic string→number conversion?
# - Where are conversion signatures defined?
# - Can typed-function be configured to respect config.number?
```

3. **Identify Number Conversion Utilities**
```bash
# Find all number conversion functions
grep -r "function.*number\|bignumber\|bigint" src/utils/

# Document which have config awareness:
# - number() - No config awareness
# - bignumber() - Factory function, has config access
# - Fraction() - Factory function, has config access
```

4. **Create Conversion Path Diagram**
```
User Input → prod(['10', '3'])
           ↓
       typed-function dispatcher
           ↓
       'Array' signature handler
           ↓
       reduce(array, multiply)
           ↓
       multiply('10', '3')  ← String→number conversion happens here
           ↓
       Result

Question: Where should config be checked?
Answer: In prod's Array handler, before calling multiply
```

5. **Document Findings**

Create: `docs/architecture/TYPE_CONVERSION_ANALYSIS.md`

```markdown
# Type Conversion Architecture Analysis

## Current Conversion Points

### prod Function
- **Location**: src/function/statistics/prod.js
- **String Handling**: Arrays with strings passed to reduce+multiply
- **Issue**: Strings converted by multiply's typed-function signatures
- **Config Awareness**: No - multiply doesn't check config.number

### sum Function
- **Location**: src/function/statistics/sum.js
- **String Handling**: Similar to prod
- **Issue**: Same as prod
- **Config Awareness**: No

### unaryMinus Function
- **Location**: src/function/arithmetic/unaryMinus.js
- **Boolean Handling**: No boolean signature exists
- **Issue**: Boolean passed through, type-converted somewhere downstream
- **Config Awareness**: No

## typed-function Role

typed-function provides automatic type conversions via conversion signatures.
However, these conversions are hardcoded and don't check config.number.

## Gap Analysis

**Where config.number SHOULD be used but ISN'T:**
1. prod(['string']) - should convert based on config
2. sum(['string']) - should convert based on config
3. unaryMinus(boolean) - should convert based on config

**Root Cause:**
Functions don't pre-convert inputs based on config before processing.

## Recommended Utilities

1. **parseNumberWithConfig(str, config)** - string → configured number type
2. **convertArrayStrings(arr, config)** - array helper
3. **booleanToConfiguredNumber(bool, config)** - boolean → configured number type
```

**Deliverables**:
- Type conversion analysis document
- Conversion path diagrams for prod/sum/unaryMinus
- Gap analysis of config.number usage
- List of all number conversion utilities

**Acceptance Criteria**:
- [ ] Complete conversion path traced for prod/sum/unaryMinus
- [ ] typed-function's role documented
- [ ] All number conversion utilities cataloged
- [ ] Gap analysis complete
- [ ] Findings documented in markdown file

---

**Task 2.1.2: Design Config Propagation Solution (2 hours)**

**Objective**: Evaluate three approaches and select best one (recommended: Option C).

**Steps**:

1. **Evaluate Option A: Pass Config Through Chain**

**Pros**:
- Explicit config usage
- Clean separation of concerns

**Cons**:
- Requires changing 100+ function signatures
- Breaking API change
- Very high complexity: 40+ hours
- **VERDICT**: ❌ Too invasive

```javascript
// Example:
function prod(values, config) {
  return reduce(values, (a, b) => multiply(a, b, config), config)
}

// Analysis:
// - multiply, add, and all downstream functions need config param
// - Breaks: prod([1, 2, 3]) → prod([1, 2, 3], config)
// - Not backward compatible
```

2. **Evaluate Option B: Typed-Function Auto-Conversion**

**Pros**:
- Centralized logic
- Automatic conversion
- Maintainable

**Cons**:
- Requires typed-function fork modification
- Medium complexity: 20 hours
- **VERDICT**: ⚠️ Good but requires external dependency changes

```javascript
// Example:
typed.config = { number: 'BigNumber' }

typed('prod', {
  'string': (x) => typed.convertNumber(x), // Auto-converts
  'Array': (x) => reduce(x, multiply)
})

// Analysis:
// - Need to modify @danielsimonjr/typed-function
// - Add config awareness to conversion system
// - Requires coordination with typed-function maintenance
```

3. **Evaluate Option C: Pre-Convert in prod/sum (RECOMMENDED)**

**Pros**:
- Minimal changes
- Localized to affected functions
- Low risk
- Can reuse utility across functions
- Low effort: 12 hours
- **VERDICT**: ✅ RECOMMENDED

```javascript
// Example:
export const createProd = factory(
  'prod',
  ['typed', 'multiply', 'config'],
  ({ typed, multiply, config }) => {

    function parseNumberWithConfig(str) {
      switch (config.number) {
        case 'BigNumber': return bignumber(str)
        case 'bigint': return str.includes('.') ? Number(str) : BigInt(str)
        default: return Number(str)
      }
    }

    return typed('prod', {
      'string': (x) => parseNumberWithConfig(x),
      'Array': (x) => {
        const converted = x.map(val =>
          typeof val === 'string' ? parseNumberWithConfig(val) : val
        )
        return reduce(converted, multiply)
      }
    })
  }
)

// Analysis:
// - Minimal code changes (3 functions)
// - Reusable utility function
// - No breaking changes
// - Clear, maintainable
```

4. **Document Decision**

Create: `docs/architecture/CONFIG_PROPAGATION_DESIGN.md`

```markdown
# Config Propagation Design

## Problem Statement

String and boolean inputs to prod, sum, and unaryMinus functions don't respect the `config.number` setting, always converting to regular JavaScript numbers instead of the configured type (BigNumber, bigint, Fraction).

## Evaluated Approaches

### Option A: Pass Config Through Chain
- **Effort**: 40+ hours
- **Risk**: High (breaking changes)
- **Decision**: ❌ Rejected - too invasive

### Option B: Typed-Function Auto-Conversion
- **Effort**: 20 hours
- **Risk**: Medium (external dependency)
- **Decision**: ⚠️ Viable but deferred

### Option C: Pre-Convert in Functions (SELECTED)
- **Effort**: 12 hours
- **Risk**: Low (localized changes)
- **Decision**: ✅ Selected for implementation

## Implementation Plan

### Utility Function

Create `src/utils/parseNumber.js`:
```javascript
export const createParseNumberWithConfig = factory(
  'parseNumberWithConfig',
  ['config', '?bignumber'],
  ({ config, bignumber }) => {
    function parseNumberWithConfig(str) {
      // Convert string to configured number type
    }
    return parseNumberWithConfig
  }
)
```

### Affected Functions

1. **prod** - Add string signature, pre-convert arrays
2. **sum** - Add string signature, pre-convert arrays
3. **unaryMinus** - Add boolean signature with config awareness

### Files to Modify

**Created**:
- `src/utils/parseNumber.js`
- `src/utils/parseNumber.ts`
- `test/unit-tests/utils/parseNumber.test.js`

**Modified**:
- `src/function/statistics/prod.js` + `.ts`
- `src/function/statistics/sum.js` + `.ts`
- `src/function/arithmetic/unaryMinus.js` + `.ts`
- Test files for all three functions (6 files)

### Testing Strategy

- Create utility tests (parseNumber.test.js)
- Enable 8 skipped tests
- Verify no regressions
- Test all config.number types: number, BigNumber, bigint

### Rollout Plan

**Sprint 2.2** (8 hours):
- Create parseNumberWithConfig utility
- Update prod and sum functions
- Enable 4 tests (prod/sum × BigNumber/bigint)

**Sprint 2.3** (4 hours):
- Update unaryMinus function
- Enable 2 tests (unaryMinus × JS/TS)
- Documentation updates

## Decision Rationale

Option C selected because:
1. **Low risk** - changes isolated to 3 functions
2. **Pragmatic** - solves immediate problem
3. **Maintainable** - clear utility function
4. **Extensible** - easy to add more functions later
5. **Non-breaking** - no API changes

This is a **tactical solution** that can be migrated to Option B (typed-function integration) in the future if needed.
```

**Deliverables**:
- CONFIG_PROPAGATION_DESIGN.md with complete design
- Tradeoff analysis for all three options
- Recommended approach with rationale
- Implementation checklist

**Acceptance Criteria**:
- [ ] All three options evaluated with pros/cons
- [ ] Option C selected with clear rationale
- [ ] Design document created
- [ ] File modification list complete
- [ ] Implementation plan documented
- [ ] Effort estimates provided

---

**Sprint 2.1 Deliverables Summary**:
- TYPE_CONVERSION_ANALYSIS.md (analysis findings)
- CONFIG_PROPAGATION_DESIGN.md (design document)
- Complete implementation plan for Sprints 2.2 and 2.3
- **0 tests fixed** (design only)
- **0 code changes**

---

#### Sprint 2.2: Implement String Parsing for prod/sum (8 hours)

**Objective**: Create parseNumberWithConfig utility and update prod/sum functions.

**Task 2.2.1: Create parseNumberWithConfig Utility (3 hours)**

**File**: `src/utils/parseNumber.js`

**Implementation**:

```javascript
import { factory } from './factory.js'

const name = 'parseNumberWithConfig'
const dependencies = ['config', '?bignumber']

export const createParseNumberWithConfig = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ config, bignumber }) => {
    /**
     * Parse a string to a number type based on the config.number setting.
     *
     * Respects the configured number type and converts strings accordingly:
     * - config.number = 'number': Returns JavaScript number
     * - config.number = 'BigNumber': Returns BigNumber instance
     * - config.number = 'bigint': Returns bigint (fallback to number for decimals)
     * - config.number = 'Fraction': Returns Fraction instance
     *
     * @param {string} str - String representation of a number
     * @returns {number|BigNumber|bigint|Fraction} Parsed number in configured type
     *
     * @example
     * // With config.number = 'BigNumber'
     * parseNumberWithConfig('10')  // Returns: BigNumber(10)
     *
     * @example
     * // With config.number = 'bigint'
     * parseNumberWithConfig('5')    // Returns: 5n
     * parseNumberWithConfig('3.14') // Returns: 3.14 (number fallback)
     */
    function parseNumberWithConfig(str) {
      if (typeof str !== 'string') {
        throw new TypeError(
          `parseNumberWithConfig expects string, got ${typeof str}`
        )
      }

      const numberType = config.number || 'number'

      switch (numberType) {
        case 'BigNumber':
          if (!bignumber) {
            throw new Error(
              'BigNumber not available. Configure mathjs with BigNumber support.'
            )
          }
          return bignumber(str)

        case 'bigint':
          // bigint doesn't support decimals - fallback to number
          if (str.includes('.') || str.includes('e') || str.includes('E')) {
            return Number(str)
          }
          return BigInt(str)

        case 'Fraction':
          // Note: Fraction support would require fraction dependency
          // For now, fallback to number
          // TODO: Add fraction dependency and implement
          return Number(str)

        case 'number':
        default:
          return Number(str)
      }
    }

    return parseNumberWithConfig
  }
)
```

**TypeScript Version** (`src/utils/parseNumber.ts`):

```typescript
import { factory } from './factory.js'

const name = 'parseNumberWithConfig'
const dependencies = ['config', '?bignumber']

export const createParseNumberWithConfig = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ config, bignumber }) => {
    function parseNumberWithConfig(str: string): number | any {
      if (typeof str !== 'string') {
        throw new TypeError(
          `parseNumberWithConfig expects string, got ${typeof str}`
        )
      }

      const numberType = config.number || 'number'

      switch (numberType) {
        case 'BigNumber':
          if (!bignumber) {
            throw new Error(
              'BigNumber not available. Configure mathjs with BigNumber support.'
            )
          }
          return bignumber(str)

        case 'bigint':
          if (str.includes('.') || str.includes('e') || str.includes('E')) {
            return Number(str)
          }
          return BigInt(str)

        case 'Fraction':
          return Number(str)

        case 'number':
        default:
          return Number(str)
      }
    }

    return parseNumberWithConfig
  }
)
```

**Test File** (`test/unit-tests/utils/parseNumber.test.js`):

```javascript
import assert from 'assert'
import math from '../../../src/defaultInstance.js'

describe('parseNumberWithConfig', function () {
  it('should parse strings as regular numbers by default', function () {
    const result = math.parseNumberWithConfig('42')
    assert.strictEqual(result, 42)
    assert.strictEqual(typeof result, 'number')
  })

  it('should parse strings as BigNumber when configured', function () {
    const bigMath = math.create({ number: 'BigNumber' })
    const result = bigMath.parseNumberWithConfig('42')

    assert.strictEqual(result.constructor.name, 'BigNumber')
    assert.strictEqual(result.toString(), '42')
  })

  it('should parse strings as bigint when configured', function () {
    const bigintMath = math.create({ number: 'bigint' })
    const result = bigintMath.parseNumberWithConfig('42')

    assert.strictEqual(result, BigInt(42))
    assert.strictEqual(typeof result, 'bigint')
  })

  it('should fallback to number for decimal strings with bigint config', function () {
    const bigintMath = math.create({ number: 'bigint' })
    const result = bigintMath.parseNumberWithConfig('3.14')

    assert.strictEqual(result, 3.14)
    assert.strictEqual(typeof result, 'number')
  })

  it('should throw error for non-string input', function () {
    assert.throws(
      () => math.parseNumberWithConfig(42),
      /TypeError.*expects string/
    )
  })
})
```

**Register in Factories**:

Add to `src/factoriesAny.js`:
```javascript
export { createParseNumberWithConfig } from './utils/parseNumber.js'
```

**Deliverables**:
- parseNumber.js implemented
- parseNumber.ts implemented
- parseNumber.test.js with 5+ tests
- Registered in factoriesAny.js

**Acceptance Criteria**:
- [ ] parseNumberWithConfig function created
- [ ] Handles all config types: number, BigNumber, bigint
- [ ] Bigint gracefully falls back to number for decimals
- [ ] TypeScript version with proper types
- [ ] Unit tests pass
- [ ] Both .js and .ts implementations complete

---

**Task 2.2.2: Update prod Function (2 hours)**

**Files**:
- `src/function/statistics/prod.js`
- `src/function/statistics/prod.ts`

**Implementation**:

**Note**: `reduce` and `multiply` are already imported/available in the prod function.

```javascript
// In prod.js - add dependency
export const createProd = /* #__PURE__ */ factory(
  'prod',
  ['typed', 'add', 'multiply', 'parseNumberWithConfig'], // Add dependency
  ({ typed, add, multiply, parseNumberWithConfig }) => {

    return typed('prod', {
      // ... existing signatures ...

      // NEW: Handle single string input
      'string': function (x) {
        return parseNumberWithConfig(x)
      },

      // UPDATED: Handle array with potential string elements
      'Array': function (x) {
        if (x.length === 0) {
          return 1 // Product of empty array
        }

        // Pre-convert string elements
        const converted = x.map(element =>
          typeof element === 'string'
            ? parseNumberWithConfig(element)
            : element
        )

        return reduce(converted, multiply)
      },

      // ... existing matrix signatures ...
    })
  }
)
```

**TypeScript version** - same implementation with proper types.

**Deliverables**:
- prod.js updated with parseNumberWithConfig
- prod.ts updated with parseNumberWithConfig
- String signature added
- Array handler pre-converts strings

**Acceptance Criteria**:
- [ ] parseNumberWithConfig added to dependencies
- [ ] String signature implemented
- [ ] Array handler pre-converts string elements
- [ ] Both .js and .ts updated
- [ ] Existing tests still pass

---

**Task 2.2.3: Update sum Function (2 hours)**

**Files**:
- `src/function/statistics/sum.js`
- `src/function/statistics/sum.ts`

**Implementation** (same pattern as prod, but sum of empty = 0):

**Note**: `reduce` and `add` are already imported/available in the sum function.

```javascript
export const createSum = /* #__PURE__ */ factory(
  'sum',
  ['typed', 'add', 'parseNumberWithConfig'], // Add dependency
  ({ typed, add, parseNumberWithConfig }) => {

    return typed('sum', {
      // ... existing signatures ...

      // NEW: Handle single string input
      'string': function (x) {
        return parseNumberWithConfig(x)
      },

      // UPDATED: Handle array with potential string elements
      'Array': function (x) {
        if (x.length === 0) {
          return 0 // Sum of empty array (different from prod!)
        }

        // Pre-convert string elements
        const converted = x.map(element =>
          typeof element === 'string'
            ? parseNumberWithConfig(element)
            : element
        )

        return reduce(converted, add)
      },

      // ... existing matrix signatures ...
    })
  }
)
```

**Deliverables**:
- sum.js updated with parseNumberWithConfig
- sum.ts updated with parseNumberWithConfig
- Implementation mirrors prod pattern

**Acceptance Criteria**:
- [ ] parseNumberWithConfig added to dependencies
- [ ] String signature implemented
- [ ] Array handler pre-converts string elements
- [ ] Empty array sum = 0 (not 1)
- [ ] Both .js and .ts updated
- [ ] Existing tests still pass

---

**Task 2.2.4: Enable and Verify Tests (1 hour)**

**Files**:
- `test/unit-tests/function/statistics/prod.test.ts`
- `test/unit-tests/function/statistics/prod.test.js`
- `test/unit-tests/function/statistics/sum.test.ts`
- `test/unit-tests/function/statistics/sum.test.js`

**Changes**:

```javascript
// In prod.test.ts (line 43)
// BEFORE:
it.skip('should return the product of strings (with BigNumber config)', ...)

// AFTER:
it('should return the product of strings (with BigNumber config)', function () {
  const bigmath = math.create({ number: 'BigNumber' })
  assert.deepStrictEqual(
    bigmath.prod('10', '3', '4', '2'),
    bigmath.bignumber('240')
  )
  assert.deepStrictEqual(bigmath.prod('10'), bigmath.bignumber(10))
})

// Similar for:
// - prod bigint test (line 54)
// - sum BigNumber test (line 45)
// - sum bigint test (line 56)
```

**Test Commands**:
```bash
# Run specific tests
npm test -- --grep "strings with.*config"

# Run full test suite
npm run test:src
```

**Deliverables**:
- 4 it.skip changed to it (2 prod, 2 sum, each × JS/TS)
- All 4 tests passing
- No regressions

**Acceptance Criteria**:
- [ ] All 4 it.skip removed
- [ ] prod BigNumber test passes
- [ ] prod bigint test passes
- [ ] sum BigNumber test passes
- [ ] sum bigint test passes
- [ ] All tests in both JS and TS versions
- [ ] No regressions in full test suite

---

**Sprint 2.2 Summary**:
- **Tests Fixed**: 4 (prod/sum × BigNumber/bigint × JS/TS = 8 test files, but 4 unique tests)
- **Files Created**: 3 (parseNumber.js, .ts, test.js)
- **Files Modified**: 8 (prod.js, .ts, sum.js, .ts, 4 test files)
- **Effort**: 8 hours

---

#### Sprint 2.3: Extend to unaryMinus and Documentation (4 hours)

**Objective**: Complete config propagation by fixing unaryMinus and documenting the feature.

**Task 2.3.1: Update unaryMinus for Boolean Config Awareness (2 hours)**

**Files**:
- `src/function/arithmetic/unaryMinus.js`
- `src/function/arithmetic/unaryMinus.ts`

**Implementation**:

```javascript
export const createUnaryMinus = /* #__PURE__ */ factory(
  'unaryMinus',
  ['typed', 'config', '?bignumber'], // Add config and bignumber dependencies
  ({ typed, config, bignumber }) => {

    return typed('unaryMinus', {
      // ... existing signatures for number, BigNumber, Complex, etc. ...

      // NEW: Boolean signature with config awareness
      'boolean': function (x) {
        // Convert boolean to number: true→1, false→0
        const numValue = x ? 1 : 0
        const negValue = -numValue

        // Return in configured number type
        const numberType = config?.number || 'number'

        switch (numberType) {
          case 'BigNumber':
            if (!bignumber) {
              throw new Error('BigNumber not available')
            }
            return bignumber(negValue)

          case 'bigint':
            return BigInt(negValue)

          case 'Fraction':
            // TODO: Add Fraction support
            return negValue

          case 'number':
          default:
            return negValue
        }
      },

      // ... existing signatures ...
    })
  }
)
```

**TypeScript version** with proper types.

**Deliverables**:
- unaryMinus.js updated with boolean signature
- unaryMinus.ts updated with boolean signature
- Config and bignumber dependencies added

**Acceptance Criteria**:
- [ ] Config added to dependencies
- [ ] Boolean signature implemented
- [ ] unaryMinus(true) returns BigNumber(-1) with BigNumber config
- [ ] unaryMinus(false) returns BigNumber(0) with BigNumber config
- [ ] unaryMinus(true) returns bigint(-1) with bigint config
- [ ] Both .js and .ts updated
- [ ] Existing tests still pass

---

**Task 2.3.2: Enable and Verify unaryMinus Tests (1 hour)**

**Files**:
- `test/unit-tests/function/arithmetic/unaryMinus.test.ts`
- `test/unit-tests/function/arithmetic/unaryMinus.test.js`

**Find and enable the boolean tests** (search for it.skip with boolean/config):

```javascript
// Enable test
it('should calculate unary minus of a boolean with BigNumber config', function () {
  const bigmath = math.create({ number: 'BigNumber' })

  const result1 = bigmath.unaryMinus(true)
  assert.deepStrictEqual(result1, bigmath.bignumber(-1))
  assert.strictEqual(result1.constructor.name, 'BigNumber')

  const result2 = bigmath.unaryMinus(false)
  assert.deepStrictEqual(result2, bigmath.bignumber(0))
  assert.strictEqual(result2.constructor.name, 'BigNumber')
})
```

**Deliverables**:
- 2 it.skip changed to it (JS and TS)
- Tests passing
- Type preservation verified

**Acceptance Criteria**:
- [ ] Both it.skip removed (JS and TS)
- [ ] Test verifies unaryMinus(true) → BigNumber(-1)
- [ ] Test verifies unaryMinus(false) → BigNumber(0)
- [ ] Type checking confirms BigNumber preservation
- [ ] Both versions pass
- [ ] No regressions

---

**Task 2.3.3: Documentation (1 hour)**

**Files**:
- `HISTORY.md`
- `src/function/statistics/prod.js` (JSDoc)
- `src/function/statistics/sum.js` (JSDoc)
- `src/function/arithmetic/unaryMinus.js` (JSDoc)

**HISTORY.md Update**:

```markdown
## not yet published

### Fixed

- Fixed string and boolean inputs not respecting `config.number` setting in `prod`, `sum`, and `unaryMinus` functions. String inputs now convert to the configured number type (BigNumber, bigint, Fraction) instead of always defaulting to regular numbers. (#XXXX)
  - `prod(['10', '3'])` with `config.number='BigNumber'` now returns `BigNumber(30)`
  - `sum(['10', '3'])` with `config.number='BigNumber'` now returns `BigNumber(13)`
  - `unaryMinus(true)` with `config.number='BigNumber'` now returns `BigNumber(-1)`
  - Note: bigint config gracefully falls back to number for decimal strings (e.g., '3.14')
```

**JSDoc Updates**:

Add to prod.js:
```javascript
/**
 * Compute the product of a matrix or a list with values.
 * In case of a (multi-dimensional) array or matrix, the product of all
 * elements will be calculated.
 *
 * String inputs are converted according to the configured number type
 * (config.number). For example, with BigNumber configuration, string
 * inputs will be converted to BigNumber before calculation.
 *
 * @param {Array | Matrix} args  A single matrix or multiple scalar values
 * @return {*} The product of all values
 *
 * @example
 * math.prod(2, 3, 4)           // returns 24
 * math.prod([2, 3, 4])         // returns 24
 *
 * // With BigNumber config:
 * const mathBig = math.create({ config: { number: 'BigNumber' } })
 * mathBig.prod('10', '3')      // returns BigNumber(30)
 */
```

Similar for sum.js and unaryMinus.js.

**Deliverables**:
- HISTORY.md updated with bug fix entry
- JSDoc updated for all three functions
- Examples added showing config-aware behavior

**Acceptance Criteria**:
- [ ] HISTORY.md has bug fix entry
- [ ] prod JSDoc includes config behavior
- [ ] sum JSDoc includes config behavior
- [ ] unaryMinus JSDoc includes boolean conversion
- [ ] All examples accurate
- [ ] Documentation builds without errors

---

**Sprint 2.3 Summary**:
- **Tests Fixed**: 2 (unaryMinus × JS/TS)
- **Files Modified**: 7 (unaryMinus.js, .ts, tests, HISTORY, JSDoc updates)
- **Effort**: 4 hours

---

### Config Propagation - Complete Implementation Checklist

**Sprint 2.1: Design** (4 hours):
- [ ] Analyze type conversion architecture
- [ ] Map all conversion points
- [ ] Evaluate three approaches
- [ ] Select Option C (pre-convert)
- [ ] Create design documents

**Sprint 2.2: prod/sum Implementation** (8 hours):
- [ ] Create parseNumberWithConfig utility
- [ ] Write utility tests
- [ ] Update prod function
- [ ] Update sum function
- [ ] Enable 4 tests
- [ ] Verify no regressions

**Sprint 2.3: unaryMinus and Docs** (4 hours):
- [ ] Update unaryMinus function
- [ ] Enable 2 tests
- [ ] Update HISTORY.md
- [ ] Update JSDoc for all functions
- [ ] Final testing

**Total Completion**:
- [ ] All 8 tests passing
- [ ] Dual codebase (.js/.ts) maintained
- [ ] Documentation complete
- [ ] Commit: "fix: Make string/boolean inputs respect config.number in prod, sum, unaryMinus"
- [ ] Push to GitHub

---

### Risk Assessment - Config Propagation

**Low Risk Areas**:
- Utility function is isolated and well-tested
- Changes localized to 3 functions
- No breaking API changes
- Clear fallback behavior (bigint → number for decimals)

**Medium Risk Areas**:
- BigNumber dependency optional - need error handling
- Dual codebase synchronization

**Mitigation**:
- Comprehensive testing at each sprint
- Verify no regressions after each change
- Test with all config.number types

---

### Success Metrics - Config Propagation

**Tests**:
- 8 skipped tests enabled and passing
- 0 regressions in existing test suite
- Utility function has 5+ test cases

**Code Quality**:
- Dual codebase maintained (.js and .ts)
- Reusable utility function
- Clear, maintainable implementation
- Comprehensive documentation

**User Experience**:
- BigNumber config now works as expected
- bigint config works with graceful fallback
- Behavior matches user mental model

---

## Summary Comparison

| Feature | Effort | Priority | Tests Fixed | Complexity |
|---------|--------|----------|-------------|------------|
| Unit Cancellation | 8 hours | MEDIUM | 2 | HIGH (algebraic) |
| Config Propagation | 12-16 hours | HIGH | 8 | MEDIUM (architectural) |

**Recommended Order**:
1. **Config Propagation** first - higher priority, affects more tests, improves BigNumber usability
2. **Unit Cancellation** second - UX improvement, nice-to-have feature

Both features are valuable improvements to mathjs and worth implementing in dedicated sessions.

---

*Generated: 2026-01-17*
*Part of Skipped Tests Resolution Effort*
