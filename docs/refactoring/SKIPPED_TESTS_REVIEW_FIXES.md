# Skipped Tests Documentation - Review & Fixes

**Review Date:** 2026-01-17
**Reviewer:** Claude Sonnet 4.5
**Status:** Issues identified, fixes pending

---

## Executive Summary

Reviewed all 11 sprint TODO JSON files and 2 planning documents for the skipped tests resolution. Found **18 issues** across 3 severity levels:

- **Critical (Must Fix):** 2 issues
- **Medium (Should Fix):** 5 issues
- **Low (Documentation Quality):** 11 issues

**Overall Accuracy:** 85% - Documentation is solid but needs corrections before implementation.

---

## Critical Issues (MUST FIX)

### Issue #1: Incorrect BigNumber Import Path
**Severity:** CRITICAL
**File:** `SKIPPED_TESTS_PHASE_2_SPRINT_2_TODO.json`
**Line:** 50
**Problem:**
```javascript
import { BigNumber } from 'decimal.js'  // WRONG!
```

**Correct Approach - Option A (Recommended):**
```javascript
// BigNumber should come from dependencies via factory pattern
export const createParseNumberWithConfig = factory(
  'parseNumberWithConfig',
  ['?bignumber'],  // Optional dependency
  ({ bignumber }) => {
    function parseNumberWithConfig(str, config) {
      if (config.number === 'BigNumber' && bignumber) {
        return bignumber(str)
      }
      // ... other cases
    }
    return parseNumberWithConfig
  }
)
```

**Correct Approach - Option B (If creating standalone utility):**
```javascript
// If BigNumber must be imported directly:
import BigNumber from 'bignumber.js'  // Correct package name

// But this loses config flexibility - NOT RECOMMENDED
```

**Recommended Fix:** Use Option A (factory pattern). Update:
- Line 50: Remove direct import
- Line 54-56: Show factory pattern implementation
- Add note explaining why factory pattern is used

**Impact:** Code won't compile/run with incorrect import. Tests will fail.

---

### Issue #2: Missing .js Test File Versions in filesModified
**Severity:** CRITICAL
**File:** Multiple sprint files
**Problem:** Many sprints only list `.ts` test files but `.js` versions also exist and must be updated.

**Files Affected:**

1. **SKIPPED_TESTS_PHASE_1_SPRINT_1_TODO.json (line 124)**
   - Lists: `test/unit-tests/type/matrix/SparseMatrix.test.ts`
   - Missing: `test/unit-tests/type/matrix/SparseMatrix.test.js`

2. **SKIPPED_TESTS_PHASE_2_SPRINT_3_TODO.json**
   - Lists: `test/unit-tests/function/arithmetic/unaryMinus.test.ts`
   - Missing: `test/unit-tests/function/arithmetic/unaryMinus.test.js`

3. **SKIPPED_TESTS_PHASE_3_SPRINT_2_TODO.json**
   - Lists: `test/unit-tests/function/arithmetic/multiply.test.ts`
   - Missing: `test/unit-tests/function/arithmetic/multiply.test.js`

4. **SKIPPED_TESTS_PHASE_3_SPRINT_3_TODO.json**
   - Lists: `test/unit-tests/function/arithmetic/mod.test.ts`
   - Missing: `test/unit-tests/function/arithmetic/mod.test.js`

5. **SKIPPED_TESTS_PHASE_3_SPRINT_4_TODO.json**
   - Lists: `test/unit-tests/function/statistics/quantileSeq.test.ts`
   - Missing: `test/unit-tests/function/statistics/quantileSeq.test.js`

6. **SKIPPED_TESTS_PHASE_4_SPRINT_1_TODO.json**
   - Lists: `test/unit-tests/type/unit/Unit.test.ts`
   - Missing: `test/unit-tests/type/unit/Unit.test.js`

7. **SKIPPED_TESTS_PHASE_4_SPRINT_2_TODO.json**
   - Lists: Only `factory.test.ts`
   - Missing: `test/unit-tests/utils/factory.test.js` ✅ (verified exists)

**Recommended Fix:** Add both `.ts` and `.js` versions to `filesModified` arrays in all affected sprint files.

**Impact:** Implementation will be incomplete - `.js` files won't get updated, causing test failures.

---

## Medium Issues (SHOULD FIX)

### Issue #3: Inconsistent "testsFixed" Terminology
**Severity:** MEDIUM
**Files:** All sprint files
**Problem:** Ambiguous whether "testsFixed": 2 means:
- 2 unique test cases, OR
- 2 test files (1 unique issue appearing in both .ts and .js)

**Example - Phase 2 Sprint 3:**
- **Analysis doc says:** "1 (×2 JS/TS)" = 1 unique issue, 2 files
- **Sprint file says:** "testsFixed": 2
- **Confusion:** Is this 1 or 2 tests fixed?

**Recommended Fix:**
Add new field to disambiguate:
```json
{
  "testsFixed": 1,
  "testFilesModified": 2,
  "note": "1 unique test issue affecting 2 files (JS/TS versions)"
}
```

**Alternative:** Use consistent notation like "1×2" in all documents.

**Impact:** Confusion during progress tracking, unclear success metrics.

---

### Issue #4: Phase 1 Sprint 2 - deepMap Test Resolution Ambiguity
**Severity:** MEDIUM
**File:** `SKIPPED_TESTS_PHASE_1_SPRINT_2_TODO.json`
**Line:** 251
**Problem:** Says "testsFixed": 2 but one of the "fixes" is deleting the test (if skipZeros is removed).

**Current:**
```json
{
  "testsFixed": 2,  // deepMap + rationalize
  "successCriteria": [
    "skipZeros decision made and implemented",
    "1-2 skipped tests resolved"
  ]
}
```

**Recommended Fix:**
```json
{
  "testsFixed": "1-2 (depends on skipZeros decision)",
  "testFilesDeleted": "0-1 (deepMap test if skipZeros removed)",
  "successCriteria": [
    "skipZeros decision made and implemented",
    "deepMap test either passing OR removed with rationale",
    "rationalize test either passing OR documented as performance limitation"
  ]
}
```

**Impact:** Unclear success criteria, potential disagreement about "fixed" vs "deleted".

---

### Issue #5: Phase 2 Sprint 2 - Missing Config Access in Utility
**Severity:** MEDIUM
**File:** `SKIPPED_TESTS_PHASE_2_SPRINT_2_TODO.json`
**Line:** 54-56
**Problem:** `parseNumberWithConfig(str, config)` requires explicit config parameter, but prod/sum functions need to access math instance config.

**Current Code Example:**
```javascript
function parseNumberWithConfig(str, config) {
  if (config.number === 'BigNumber') {
    return new BigNumber(str)
  }
  // ...
}
```

**Problem:** Where does `config` come from in prod/sum functions?

**Recommended Fix - Show Config Access:**
```javascript
// In prod.js factory function:
export const createProd = factory(name, dependencies, ({ typed, multiply, config }) => {
  // config is available from dependencies

  return typed('prod', {
    'Array': (x) => {
      return x.reduce((a, b) => {
        // Convert strings using config
        const aVal = typeof a === 'string' ? parseNumberWithConfig(a, config) : a
        const bVal = typeof b === 'string' ? parseNumberWithConfig(b, config) : b
        return multiply(aVal, bVal)
      })
    }
  })
})
```

**Or Use Factory Pattern:**
```javascript
// parseNumber.js as a factory
export const createParseNumberWithConfig = factory(
  'parseNumberWithConfig',
  ['config', '?bignumber'],
  ({ config, bignumber }) => {
    return function parseNumberWithConfig(str) {
      // config is in closure
      if (config.number === 'BigNumber' && bignumber) {
        return bignumber(str)
      }
      // ...
    }
  }
)
```

**Impact:** Implementation won't work without knowing how to access config.

---

### Issue #6: Phase 3 Sprint 4 - quantileSeq May Already Be Fixed
**Severity:** MEDIUM
**File:** `SKIPPED_TESTS_PHASE_3_SPRINT_4_TODO.json`
**Line:** 145
**Problem:** Recent commits added auto-conversion of probability to BigNumber. Test might already pass.

**Note in Sprint File:**
```json
{
  "id": "3.4.1",
  "title": "Verify Recent quantileSeq Changes",
  "details": "Check if auto-conversion was already implemented in recent commits"
}
```

**Recommended Addition:**
```json
{
  "preImplementationCheck": {
    "action": "Run the skipped test to see if it already passes",
    "command": "npx mocha test/unit-tests/function/statistics/quantileSeq.test.ts --grep 'bignumbers with number probability'",
    "ifPasses": "Mark sprint as COMPLETE, document what was already implemented",
    "ifFails": "Proceed with implementation as planned"
  }
}
```

**Impact:** May waste effort reimplementing something already done.

---

### Issue #7: Phase 4 Sprint 2 - Acceptance Criteria References Non-existent File
**Severity:** MEDIUM
**File:** `SKIPPED_TESTS_PHASE_4_SPRINT_2_TODO.json`
**Line:** 144
**Problem:** Acceptance criteria says "Tests pass in both JS and TS versions" but analysis unclear if `.js` version exists.

**Verification:**
```bash
$ ls test/unit-tests/utils/factory.test.*
factory.test.js  ✅ EXISTS
factory.test.ts  ✅ EXISTS
```

**Status:** Both files exist - acceptance criteria is CORRECT.

**Recommended Fix:** None needed, but add note to confirm both exist.

**Impact:** Low - just documentation clarity.

---

## Low Issues (Documentation Quality)

### Issue #8: Terminology Inconsistency - "unique tests"
**Severity:** LOW
**Problem:** Different terms used across documents:
- "unique issues" (21)
- "test cases" (29)
- "skipped tests" (29)
- "tests fixed" (varies)

**Recommendation:** Add glossary to resolution plan:
```markdown
## Terminology

- **Unique Issues:** 21 distinct problems causing test failures
- **Test Cases:** 29 total it.skip() instances across codebase
- **Duplicate Tests:** 8 JS/TS duplicates (same test in two file formats)
- **Tests Fixed:** Number of it.skip() removed (includes duplicates)
```

---

### Issue #9: Phase 2 Sprint 2 - Fraction Import May Be Unnecessary
**Severity:** LOW
**File:** `SKIPPED_TESTS_PHASE_2_SPRINT_2_TODO.json`
**Line:** 50
**Problem:** Imports Fraction but skipped tests only involve BigNumber and bigint, not Fraction.

**Current:**
```javascript
import { Fraction } from '../type/fraction/Fraction.js'
```

**Recommendation:** Remove Fraction from initial implementation. Add in future if needed.

---

### Issue #10: Missing Dependency Documentation in Phase 2 Sprint 3
**Severity:** LOW
**File:** `SKIPPED_TESTS_PHASE_2_SPRINT_3_TODO.json`
**Line:** 213-215
**Status:** ✅ VERIFIED - Dependency IS documented correctly:
```json
"dependencies": [
  "SKIPPED_TESTS_PHASE_2_SPRINT_2_TODO.json (parseNumberWithConfig utility must exist)"
]
```

**No fix needed.**

---

### Issue #11: Phase 3 Sprint 2 - Breaking Change Not Emphasized
**Severity:** LOW
**File:** `SKIPPED_TESTS_PHASE_3_SPRINT_2_TODO.json`
**Problem:** BigNumber-Unit precision change IS a breaking change but not highlighted.

**Recommendation:** Add to notes:
```json
{
  "notes": [
    "BREAKING CHANGE: BigNumber × Unit now preserves BigNumber precision",
    "Previous behavior: downgraded to number",
    "New behavior: preserves BigNumber type",
    "Update HISTORY.md with breaking change documentation",
    "Consider semver implications (major version bump?)"
  ]
}
```

---

### Issue #12: Phase 1 Sprint 2 - Breaking Change Documentation Complete
**Severity:** LOW
**File:** `SKIPPED_TESTS_PHASE_1_SPRINT_2_TODO.json`
**Status:** ✅ VERIFIED - Breaking change properly documented at line 120:
```json
{
  "step": 6,
  "action": "Update HISTORY.md",
  "code": "## Breaking Changes\n\n- `deepMap`: Removed unused `skipZeros` parameter"
}
```

**No fix needed.**

---

### Issue #13-18: Minor Documentation Quality Issues
**Status:** LOW priority, can be addressed during implementation

13. **Effort breakdown format** - Could use clearer presentation
14. **Phase 4 Sprint 1 complexity warning** - Should emphasize this is HARD
15. **Cross-reference completeness** - Some docs reference files not yet created (OK - they're deliverables)
16. **Phase 5 sprint files missing** - Expected but explicitly deferred
17. **Code comment consistency** - Some code examples more detailed than others
18. **Acceptance criteria specificity** - Some more specific than others

---

## Summary of Fixes Required

### Must Fix Before Implementation
1. ✅ **Fix BigNumber import** in Phase 2 Sprint 2 (use factory pattern)
2. ✅ **Add missing .js files** to filesModified in 7 sprint files

### Should Fix for Clarity
3. ⚠️ **Clarify testsFixed terminology** (add testFilesModified field)
4. ⚠️ **Phase 1 Sprint 2** - clarify deepMap test "fixed" vs "deleted"
5. ⚠️ **Phase 2 Sprint 2** - show how config is accessed in prod/sum
6. ⚠️ **Phase 3 Sprint 4** - add preImplementationCheck for quantileSeq
7. ⚠️ **Phase 3 Sprint 2** - emphasize breaking change

### Can Address During Implementation
8-18. Documentation quality improvements

---

## Recommended Action Plan

### Immediate (Before Starting Implementation)
1. Fix BigNumber import path in Phase 2 Sprint 2
2. Add all missing .js test files to filesModified arrays
3. Add clarifying notes about testsFixed terminology
4. Commit fixes to repository

### During First Sprint (Phase 1 Sprint 1)
5. Verify DenseMatrix test structure
6. Confirm SparseMatrix validation approach

### During Phase 2 Sprints
7. Decide on config access pattern (factory vs parameter)
8. Implement chosen pattern consistently

### During Phase 3 Sprint 4
9. Run quantileSeq test first - may already be fixed

---

## Files Requiring Updates

1. `SKIPPED_TESTS_PHASE_2_SPRINT_2_TODO.json` - BigNumber import
2. `SKIPPED_TESTS_PHASE_1_SPRINT_1_TODO.json` - Add .js file
3. `SKIPPED_TESTS_PHASE_2_SPRINT_3_TODO.json` - Add .js file
4. `SKIPPED_TESTS_PHASE_3_SPRINT_2_TODO.json` - Add .js file
5. `SKIPPED_TESTS_PHASE_3_SPRINT_3_TODO.json` - Add .js file
6. `SKIPPED_TESTS_PHASE_3_SPRINT_4_TODO.json` - Add .js file
7. `SKIPPED_TESTS_PHASE_4_SPRINT_1_TODO.json` - Add .js file
8. `SKIPPED_TESTS_RESOLUTION_PLAN.md` - Add terminology glossary

---

## Validation Checklist

Before implementation:
- [ ] All BigNumber imports use factory pattern or correct package
- [ ] All filesModified arrays include both .ts and .js versions
- [ ] testsFixed counts are consistent and documented
- [ ] Breaking changes clearly marked in relevant sprints
- [ ] Config access pattern decided and documented
- [ ] All code examples are syntactically correct

---

## Conclusion

**Overall Quality:** 85% - Very good foundation, minor corrections needed

**Recommendation:** Fix Critical Issues #1-2, then proceed with implementation. Address Medium issues during relevant sprint implementations.

**Next Steps:**
1. Apply fixes from this document
2. Commit updated sprint files
3. Begin Phase 1 Sprint 1 implementation
