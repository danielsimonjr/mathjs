# Dual Codebase Sprint File Corrections

**Issue:** Sprint files only list .js source files, missing .ts source file versions
**Impact:** CRITICAL - Implementation will be incomplete if only .js files are updated
**Date:** 2026-01-17

---

## Problem Statement

The mathjs codebase is a **dual JavaScript/TypeScript project**:
- JavaScript version: `.js` files
- TypeScript version: `.ts` files
- Both versions maintained in parallel

**Critical Rule:**
- `.test.js` files test `.js` source files
- `.test.ts` files test `.ts` source files
- Changes must be made to BOTH `.js` AND `.ts` source files

**Current Issue:**
Sprint TODO files only list `.js` source files in `filesModified` arrays, missing corresponding `.ts` files.

---

## Files Requiring Both .js and .ts Updates

### Phase 1: Input Validation

**Sprint 1.1: SparseMatrix & DenseMatrix**
Current filesModified:
```json
[
  "src/type/matrix/SparseMatrix.js",
  "src/type/matrix/DenseMatrix.js",
  "test/unit-tests/type/matrix/SparseMatrix.test.ts",
  "test/unit-tests/type/matrix/SparseMatrix.test.js"
]
```

Should be:
```json
[
  "src/type/matrix/SparseMatrix.js",
  "src/type/matrix/SparseMatrix.ts",
  "src/type/matrix/DenseMatrix.js",
  "src/type/matrix/DenseMatrix.ts",
  "test/unit-tests/type/matrix/SparseMatrix.test.ts",
  "test/unit-tests/type/matrix/SparseMatrix.test.js"
]
```

---

### Phase 2: Config Propagation

**Sprint 2.2: prod & sum functions**
Current filesModified missing `.ts` versions:
- `src/function/statistics/prod.js` ✓
- `src/function/statistics/prod.ts` ❌ MISSING
- `src/function/statistics/sum.js` ✓
- `src/function/statistics/sum.ts` ❌ MISSING

**Sprint 2.3: unaryMinus**
Current filesModified missing `.ts` version:
- `src/function/arithmetic/unaryMinus.js` ✓
- `src/function/arithmetic/unaryMinus.ts` ❌ MISSING

---

### Phase 3: BigNumber Precision

**Sprint 3.2: multiply & Unit**
Current filesModified missing `.ts` versions:
- `src/function/arithmetic/multiply.js` ✓
- `src/function/arithmetic/multiply.ts` ❌ MISSING
- `src/type/unit/Unit.js` ✓
- `src/type/unit/Unit.ts` ❌ MISSING

**Sprint 3.3: mod**
Current filesModified missing `.ts` version:
- `src/function/arithmetic/mod.js` ✓
- `src/function/arithmetic/mod.ts` ❌ MISSING

**Sprint 3.4: quantileSeq**
Current filesModified missing `.ts` version:
- `src/function/statistics/quantileSeq.js` ✓
- `src/function/statistics/quantileSeq.ts` ❌ MISSING

---

### Phase 4: Advanced Features

**Sprint 4.1: Unit cancellation**
Current filesModified missing `.ts` version:
- `src/type/unit/Unit.js` ✓
- `src/type/unit/Unit.ts` ❌ MISSING

**Sprint 4.2: Factory circular dependencies**
Current filesModified missing `.ts` version:
- `src/utils/factory.js` ✓
- `src/utils/factory.ts` ❌ MISSING

---

## Special Case: parseNumber Utility (Phase 2 Sprint 2)

**Current:**
```json
{
  "filesCreated": ["src/utils/parseNumber.js"]
}
```

**Should be:**
```json
{
  "filesCreated": [
    "src/utils/parseNumber.js",
    "src/utils/parseNumber.ts"
  ]
}
```

**Note:** This utility will be used by both .js and .ts versions of prod/sum/unaryMinus.

---

## Implementation Requirements

### For Each Sprint:

1. **Identify all source files to modify**
   - List in sprint file under `filesModified`

2. **Add BOTH .js and .ts versions**
   - Example: If modifying `multiply.js`, also modify `multiply.ts`

3. **Make identical changes to both versions**
   - Same validation logic
   - Same error messages
   - Same behavior

4. **Test BOTH versions**
   - Run `.test.js` to verify `.js` source
   - Run `.test.ts` to verify `.ts` source

5. **Enable tests in BOTH files**
   - Change `it.skip` to `it` in `.test.js`
   - Change `it.skip` to `it` in `.test.ts`

---

## Files to Update

All sprint TODO JSON files need their `filesModified` arrays updated:

1. ✅ SKIPPED_TESTS_PHASE_1_SPRINT_1_TODO.json
2. ✅ SKIPPED_TESTS_PHASE_1_SPRINT_2_TODO.json (deepMap, rationalize)
3. ✅ SKIPPED_TESTS_PHASE_2_SPRINT_2_TODO.json (parseNumber, prod, sum)
4. ✅ SKIPPED_TESTS_PHASE_2_SPRINT_3_TODO.json (unaryMinus)
5. ✅ SKIPPED_TESTS_PHASE_3_SPRINT_2_TODO.json (multiply, Unit)
6. ✅ SKIPPED_TESTS_PHASE_3_SPRINT_3_TODO.json (mod)
7. ✅ SKIPPED_TESTS_PHASE_3_SPRINT_4_TODO.json (quantileSeq)
8. ✅ SKIPPED_TESTS_PHASE_4_SPRINT_1_TODO.json (Unit)
9. ✅ SKIPPED_TESTS_PHASE_4_SPRINT_2_TODO.json (factory)

---

## Example Fix Template

### Before:
```json
{
  "filesModified": [
    "src/function/arithmetic/multiply.js",
    "test/unit-tests/function/arithmetic/multiply.test.ts",
    "test/unit-tests/function/arithmetic/multiply.test.js"
  ]
}
```

### After:
```json
{
  "filesModified": [
    "src/function/arithmetic/multiply.js",
    "src/function/arithmetic/multiply.ts",
    "test/unit-tests/function/arithmetic/multiply.test.ts",
    "test/unit-tests/function/arithmetic/multiply.test.js"
  ],
  "implementationNote": "Changes must be applied to BOTH .js and .ts source files. JavaScript tests verify .js source, TypeScript tests verify .ts source."
}
```

---

## Verification Checklist

Before implementation of each sprint:
- [ ] Verify source file exists in both .js and .ts versions
- [ ] Confirm both versions listed in filesModified
- [ ] Understand that changes must be identical in both files
- [ ] Plan to test both versions after implementation

During implementation:
- [ ] Make changes to .js source file
- [ ] Make identical changes to .ts source file
- [ ] Enable test in .test.js file
- [ ] Enable test in .test.ts file
- [ ] Run .test.js to verify .js source
- [ ] Run .test.ts to verify .ts source

---

## Impact of Not Fixing

If we only update .js files:
- ❌ TypeScript tests will still skip
- ❌ TypeScript source won't have validation
- ❌ Inconsistency between .js and .ts versions
- ❌ Tests will report as "fixed" but still failing in .ts

**This would be a CRITICAL failure of the implementation.**

---

## Action Required

1. Update all 9 sprint TODO JSON files
2. Add .ts source files to all filesModified arrays
3. Add implementation notes about dual codebase
4. Commit updated sprint files
5. Ensure all implementers understand the dual codebase requirement

---

## Files Changed Count Impact

### Original Plan:
- Phase 1 Sprint 1: 2 source files + 2 test files = 4 files

### Corrected Plan:
- Phase 1 Sprint 1: 4 source files (.js + .ts × 2) + 2 test files = 6 files

**Effort estimate remains the same** - changes are duplicated, not complex.
