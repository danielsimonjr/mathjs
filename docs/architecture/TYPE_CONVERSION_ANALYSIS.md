# Type Conversion Architecture Analysis

**Date**: 2026-01-17
**Purpose**: Understand current string-to-number conversion for config propagation implementation

## Executive Summary

The current implementation **partially** supports config-aware conversion, but has a critical timing issue:
- Strings are converted to numbers **during** operations (via typed-function)
- Config-aware conversion happens **after** operations complete
- Result: typed-function's hardcoded conversions override config.number setting

**Solution**: Pre-convert string inputs **before** passing to operations.

---

## Current Conversion Points

### prod Function (`src/function/statistics/prod.js`)

**Location**: Lines 58-79
**Current Behavior**:
```javascript
function _prod (array) {
  let prod

  deepForEach(array, function (value) {
    // PROBLEM: If value is '10', multiplyScalar converts it to number(10)
    // This happens BEFORE we can apply config-aware conversion
    prod = (prod === undefined) ? value : multiplyScalar(prod, value)
  })

  // TOO LATE: By now, prod is already a number, not BigNumber
  if (typeof prod === 'string') {
    prod = numeric(prod, safeNumberType(prod, config))
  }

  return prod
}
```

**Issue**: Config-aware conversion (line 71) only applies if final result is still a string. But `multiplyScalar('10', '3')` returns `number(30)`, not `string('30')`.

**Root Cause**: typed-function auto-converts strings during `multiplyScalar` call.

---

### sum Function (`src/function/statistics/sum.js`)

**Similar Pattern**: Has same timing issue as prod

**Current Implementation**: Also converts strings after aggregation, not before

---

### unaryMinus Function (`src/function/arithmetic/unaryMinus.js`)

**Current Signatures**: No boolean signature exists

**Issue**: Booleans not handled, and if they were, would not respect config

**Location**: `src/function/arithmetic/unaryMinus.js` (needs boolean signature)

---

## typed-function Role

**Location**: `node_modules/@danielsimonjr/typed-function/`

**Behavior**:
- Provides automatic type conversions
- Conversion rules are hardcoded in typed-function library
- No mechanism to check config.number before converting

**Current String Conversion**:
```javascript
// Inside typed-function (simplified):
if (typeof value === 'string') {
  return Number(value)  // Hardcoded - no config check!
}
```

**Extensibility**: Could be modified to check config, but would require:
1. Fork maintenance
2. Passing config to typed-function
3. Medium complexity (~20 hours)

**Decision**: NOT modifying typed-function for this sprint (use pre-convert approach instead)

---

## Number Conversion Utilities

### `numeric(value, type)`
**Location**: `src/function/utils/numeric.js`
**Config Aware**: YES (takes type as parameter)
**Usage**: Converts value to specified number type

### `safeNumberType(str, config)`
**Location**: `src/utils/number.js` (lines 40-50)
**Config Aware**: YES
**Purpose**: Returns safe number type for string (fallback for bigint decimals)
**Example**:
```javascript
safeNumberType('3.14', { number: 'bigint', numberFallback: 'number' })
// Returns: 'number' (bigint can't handle decimals)
```

### `number()`, `bignumber()`, `fraction()`
**Location**: Various factory functions
**Config Aware**: Indirectly (via factory dependencies)
**Usage**: Type-specific constructors

---

## Conversion Flow Diagram

### Current Flow (BROKEN):
```
User: prod(['10', '3']) with config.number='BigNumber'
  ↓
prod(['10', '3'])
  ↓
_prod(['10', '3'])
  ↓
deepForEach: multiplyScalar('10', '3')
  ↓
typed-function: convert '10' → number(10) ❌ WRONG!
typed-function: convert '3' → number(3) ❌ WRONG!
  ↓
multiplyScalar(10, 3) = 30
  ↓
typeof prod === 'string' ? NO (it's number)
  ↓
return 30 (number) ❌ Expected: BigNumber(30)
```

### Desired Flow (FIXED):
```
User: prod(['10', '3']) with config.number='BigNumber'
  ↓
Pre-convert: ['10', '3'] → [BigNumber(10), BigNumber(3)] ✅
  ↓
_prod([BigNumber(10), BigNumber(3)])
  ↓
deepForEach: multiplyScalar(BigNumber(10), BigNumber(3))
  ↓
typed-function: BigNumber signature matches
  ↓
multiplyScalar: BigNumber(10).times(BigNumber(3))
  ↓
return BigNumber(30) ✅ CORRECT!
```

---

## Gap Analysis

### Where config.number SHOULD be used but ISN'T:

1. **prod with string inputs**
   - Current: Strings convert to number during multiplication
   - Needed: Pre-convert based on config before multiplication

2. **sum with string inputs**
   - Current: Same issue as prod
   - Needed: Pre-convert based on config before addition

3. **unaryMinus with boolean inputs**
   - Current: No boolean signature at all
   - Needed: Boolean signature that respects config

### Root Cause:
Functions don't pre-convert inputs based on config before processing. They rely on typed-function's hardcoded conversions.

---

## Recommended Utilities

Based on analysis, we need ONE utility function:

### `parseNumberWithConfig(str)`
**Purpose**: Convert string to configured number type
**Location**: `src/utils/parseNumber.js` (NEW FILE)
**Dependencies**: config, ?bignumber
**Signature**:
```javascript
function parseNumberWithConfig(str) {
  switch (config.number) {
    case 'BigNumber': return bignumber(str)
    case 'bigint': return str.includes('.') ? Number(str) : BigInt(str)
    case 'number': return Number(str)
    default: return Number(str)
  }
}
```

**Reusability**: Can be used by prod, sum, and potentially other functions

---

## Implementation Approach

### Selected: **Option C - Pre-convert in Functions**

**Rationale**:
- ✅ Minimal changes (only 3 functions)
- ✅ Low risk (no breaking changes)
- ✅ Reusable utility function
- ✅ Clear and maintainable
- ✅ No external dependencies

**Rejected Alternatives**:
- Option A: Pass config through chain (40+ hours, breaking changes)
- Option B: Modify typed-function (20 hours, fork maintenance)

---

## Files Requiring Changes

### Created:
- `src/utils/parseNumber.js` (utility)
- `src/utils/parseNumber.ts` (TypeScript version)
- `test/unit-tests/utils/parseNumber.test.js` (tests)

### Modified:
- `src/function/statistics/prod.js` (add pre-conversion)
- `src/function/statistics/prod.ts` (add pre-conversion)
- `src/function/statistics/sum.js` (add pre-conversion)
- `src/function/statistics/sum.ts` (add pre-conversion)
- `src/function/arithmetic/unaryMinus.js` (add boolean signature)
- `src/function/arithmetic/unaryMinus.ts` (add boolean signature)
- `src/factoriesAny.js` (register parseNumberWithConfig)
- Test files for prod, sum, unaryMinus (6 files total)

---

## Conclusion

The current implementation has config-aware conversion logic, but it's applied at the wrong time. String conversions happen during typed-function dispatch, before config can be checked.

**Solution**: Pre-convert string inputs based on config.number before passing to operations. This is simple, maintainable, and solves the problem without architectural changes.

**Next Steps**: Implement Sprint 2.2 (parseNumberWithConfig utility and prod/sum updates).

---

*Analysis by: Claude Sonnet 4.5*
*Status: Complete - Ready for Implementation*
