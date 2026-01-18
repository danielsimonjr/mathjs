# Skipped Tests Resolution Plan

**Created:** 2026-01-17
**Status:** Planning
**Total Skipped Tests:** 29 tests (21 unique issues + 8 duplicates across JS/TS)
**Estimated Total Effort:** 60-80 hours (8-10 days)

---

## Executive Summary

Analysis of all 29 skipped tests reveals **6 major underlying issues** affecting the codebase:

1. **Configuration/Type Conversion Architecture** (8 tests) - String parsing doesn't respect `config.number` setting
2. **Factory System Incompleteness** (7 tests) - Import system and dependency management incomplete
3. **BigNumber Type Precision** (6 tests) - Operations lose precision or don't handle mixed types
4. **Input Validation Missing** (4 tests) - Constructors lack proper validation
5. **Unimplemented Algebra** (2 tests) - Unit cancellation and circular dependency detection
6. **Performance/Deprecated Features** (2 tests) - Need optimization or removal decisions

---

## Phase 1: Quick Wins - Input Validation (Priority: HIGH, Risk: LOW)

**Goal:** Add missing validation to prevent invalid inputs
**Tests Fixed:** 4 tests (2 SparseMatrix + 1 deepMap decision + 1 rationalize performance)
**Estimated Effort:** 8-12 hours

### Sprint 1.1: SparseMatrix Input Validation
**Effort:** 4 hours
**Tests:** 2 (SparseMatrix dimension validation)

#### Tasks:
1. **Add dimension validation to SparseMatrix constructor** (2 hours)
   - File: `src/type/matrix/SparseMatrix.js`
   - Validation checks:
     - Reject 1D arrays: `if (!Array.isArray(data[0])) throw new DimensionError(...)`
     - Reject 3D+ arrays: `if (Array.isArray(data[0][0])) throw new DimensionError(...)`
     - Reject jagged arrays: Ensure all rows have same length
   - Error messages: Clear messages indicating expected vs actual dimensions

2. **Enable tests** (0.5 hours)
   - File: `test/unit-tests/type/matrix/SparseMatrix.test.ts`
   - Change `it.skip` to `it` for lines 184 and 195
   - Verify error messages match test expectations

3. **Add DenseMatrix validation for consistency** (1 hour)
   - File: `src/type/matrix/DenseMatrix.js`
   - Add same validations as SparseMatrix
   - Ensure consistent error messages

4. **Test and verify** (0.5 hours)
   - Run full matrix test suite
   - Verify no regressions

**Acceptance Criteria:**
- SparseMatrix rejects 1D, 3D, and jagged arrays with clear errors
- Both skipped tests pass
- No existing tests break

---

### Sprint 1.2: deepMap skipZeros Decision & rationalize Performance
**Effort:** 4-8 hours
**Tests:** 2 (deepMap + rationalize)

#### Option A: Remove skipZeros (Recommended - 4 hours)
1. **Remove skipZeros parameter** (2 hours)
   - File: `src/type/matrix/utils/deepMap.js`
   - Remove `skipZeros` parameter from function signature
   - Update all call sites (search codebase for `deepMap.*skipZeros`)
   - Update TypeScript definitions

2. **Remove test** (1 hour)
   - File: `test/unit-tests/type/matrix/utils/deepMap.test.ts`
   - Delete the skipped test (line 98) - feature not needed
   - Document decision in HISTORY.md

3. **Verify no usage** (1 hour)
   - Grep codebase for `skipZeros` usage
   - Ensure no external API contracts broken

#### Option B: Implement skipZeros (8 hours)
1. **Implement zero-skipping logic** (4 hours)
   - Add conditional check before callback
   - Handle sparse matrix optimization

2. **Add comprehensive tests** (2 hours)
   - Test with arrays, dense matrices, sparse matrices
   - Test callback not called on zeros

3. **Update documentation** (2 hours)

**Recommendation:** Option A (removal) - feature appears unused

#### Task: Rationalize Performance Fix
**Effort:** 4 hours (separate track)

1. **Add iteration limit to rationalize** (2 hours)
   - File: `src/function/algebra/rationalize.js`
   - Add `maxIterations` option (default 10000)
   - Throw error if limit exceeded: "Expression too complex for rationalize"
   - **Note:** Already implemented! Check if test can now be enabled.

2. **Enable test with timeout** (1 hour)
   - File: `test/unit-tests/function/algebra/rationalize.test.ts`
   - Remove `it.skip` from line 201
   - Add reasonable timeout (5 seconds)
   - If still too slow, add `this.timeout(10000)` or keep skipped with note

3. **Profile and optimize if needed** (1 hour)
   - Run performance profiling
   - Identify bottlenecks
   - Add memoization if beneficial

**Acceptance Criteria:**
- deepMap decision documented and implemented
- Rationalize either passes within timeout or has clear performance note

---

## Phase 2: Architecture - Config Number Propagation (Priority: HIGH, Risk: MEDIUM)

**Goal:** Fix string parsing to respect `config.number` setting
**Tests Fixed:** 8 tests (4 prod + 4 sum, both JS and TS)
**Estimated Effort:** 16-20 hours

### Sprint 2.1: Design Config Propagation
**Effort:** 4 hours

#### Tasks:
1. **Analyze current architecture** (2 hours)
   - Trace string-to-number conversion path
   - Identify all conversion functions: `number()`, `bignumber()`, parsing utilities
   - Map where config.number is currently used vs where it should be

2. **Design solution** (2 hours)
   - **Option A:** Pass config through function chain (complex, many changes)
   - **Option B:** Use typed-function to auto-convert based on config (recommended)
   - **Option C:** Pre-convert strings in prod/sum before delegation
   - Document chosen approach in architecture docs

**Deliverable:** Design document explaining the chosen approach

---

### Sprint 2.2: Implement String Parsing for BigNumber Config
**Effort:** 8 hours
**Tests:** 4 (prod BigNumber/bigint, sum BigNumber/bigint)

#### Tasks:
1. **Create parseNumberWithConfig utility** (3 hours)
   - File: `src/utils/number.js` (or new file `src/utils/parseNumber.js`)
   - Function signature: `parseNumberWithConfig(str, config)`
   - Logic:
     ```javascript
     function parseNumberWithConfig(str, config) {
       if (config.number === 'BigNumber') {
         return new BigNumber(str)
       } else if (config.number === 'bigint') {
         // Try bigint, fallback to number if decimal
         if (str.includes('.')) return Number(str)
         return BigInt(str)
       }
       return Number(str)
     }
     ```

2. **Update prod function** (2 hours)
   - File: `src/function/statistics/prod.js`
   - Add string signature that uses parseNumberWithConfig
   - Modify typed-function signatures:
     ```javascript
     'string': (x) => {
       const num = parseNumberWithConfig(x, config)
       return num
     },
     'Array': (x) => {
       // Convert string elements using config
       return x.map(val => typeof val === 'string' ? parseNumberWithConfig(val, config) : val)
     }
     ```

3. **Update sum function** (2 hours)
   - File: `src/function/statistics/sum.js`
   - Same changes as prod

4. **Enable tests and verify** (1 hour)
   - Enable 4 skipped tests in prod.test.ts and sum.test.ts
   - Run tests with different configs
   - Verify type preservation

**Acceptance Criteria:**
- `prod('10', '3')` returns BigNumber(30) when config.number = 'BigNumber'
- `sum('10', '3')` returns BigNumber(13) when config.number = 'BigNumber'
- Bigint config works with fallback to number for decimals
- All 4 tests pass

---

### Sprint 2.3: Extend to unaryMinus
**Effort:** 4 hours
**Tests:** 2 (unaryMinus with boolean)

#### Tasks:
1. **Update unaryMinus to respect config** (2 hours)
   - File: `src/function/arithmetic/unaryMinus.js`
   - Add boolean signature:
     ```javascript
     'boolean': (x) => {
       const num = x ? 1 : 0
       if (config.number === 'BigNumber') {
         return new BigNumber(-num)
       }
       return -num
     }
     ```

2. **Enable tests** (1 hour)
   - File: `test/unit-tests/function/arithmetic/unaryMinus.test.ts`
   - Remove `it.skip` from line 18
   - Verify with both JS and TS versions

3. **Add comprehensive config tests** (1 hour)
   - Test all configs: number, BigNumber, bigint, Fraction
   - Test true and false inputs

**Acceptance Criteria:**
- `unaryMinus(true)` returns `bignumber(-1)` when configured for BigNumber
- Tests pass in both JS and TS versions

---

## Phase 3: BigNumber Type Precision (Priority: MEDIUM, Risk: MEDIUM)

**Goal:** Preserve BigNumber precision in operations
**Tests Fixed:** 6 tests (2 multiply, 1 mod, 2 quantileSeq, 1 unit)
**Estimated Effort:** 16-20 hours

### Sprint 3.1: Design Decision - BigNumber Precision Policy
**Effort:** 2 hours

#### Tasks:
1. **Research and document tradeoffs** (1 hour)
   - **Keep BigNumber:** Preserves precision, may be unexpected for users
   - **Downgrade to number:** Current behavior, loses precision, simpler
   - **Make configurable:** Most flexible, adds complexity

2. **Make architectural decision** (1 hour)
   - Recommended: Keep BigNumber precision (matches user intent)
   - Document in `docs/architecture/BIGNUMBER_PRECISION_POLICY.md`
   - Update HISTORY.md if breaking change

**Deliverable:** Decision document with rationale

---

### Sprint 3.2: BigNumber-Unit Multiplication
**Effort:** 6 hours
**Tests:** 4 (2 multiply tests × 2 files JS/TS)

#### Tasks:
1. **Update multiply function** (3 hours)
   - File: `src/function/arithmetic/multiply.js`
   - Add BigNumber-Unit signatures:
     ```javascript
     'BigNumber, Unit': (x, y) => {
       if (y.value === null) {
         return new Unit(x.clone(), y.unit)
       }
       return new Unit(x.times(y.value), y.unit)
     },
     'Unit, BigNumber': (x, y) => {
       if (x.value === null) {
         return new Unit(y.clone(), x.unit)
       }
       return new Unit(x.value.times(y), x.unit)
     }
     ```

2. **Update Unit class to support BigNumber** (2 hours)
   - File: `src/type/unit/Unit.js`
   - Ensure Unit constructor accepts BigNumber values
   - Update `toString()` and `valueOf()` to preserve BigNumber

3. **Enable tests** (1 hour)
   - File: `test/unit-tests/function/arithmetic/multiply.test.ts`
   - Remove `it.skip` from lines 328 and 346
   - Remove TODO comments
   - Verify both tests pass

**Acceptance Criteria:**
- `multiply(bignumber(2), unit('5 mm'))` returns Unit with BigNumber value
- Precision preserved through operations
- Both JS and TS tests pass

---

### Sprint 3.3: BigNumber Modulo for Fractions
**Effort:** 4 hours
**Tests:** 2 (mod test × 2 files)

#### Tasks:
1. **Research BigNumber mod with fractions** (1 hour)
   - Check BigNumber.js documentation for fractional modulo
   - Understand mathematical definition of mod for non-integers
   - Determine if this should be supported or throw error

2. **Implement or document limitation** (2 hours)
   - If supported: Update `src/function/arithmetic/mod.js` with BigNumber fractional logic
   - If not supported: Change test to expect error, document limitation

3. **Enable test** (1 hour)
   - Remove `it.skip` from `test/unit-tests/function/arithmetic/mod.test.ts:95`
   - Update test assertion if needed

**Acceptance Criteria:**
- Clear behavior for fractional BigNumber mod (works or throws clear error)
- Test passes with expected behavior

---

### Sprint 3.4: quantileSeq Type Consistency
**Effort:** 6 hours
**Tests:** 2 (quantileSeq tests)

#### Tasks:
1. **Fix BigNumber array with number probability** (3 hours)
   - File: `src/function/statistics/quantileSeq.js`
   - Auto-convert number probability to BigNumber when array contains BigNumbers
   - Ensure return type matches input array type
   - **Note:** May already be fixed! Check current implementation.

2. **Fix matrix output preservation** (2 hours)
   - When probability input is matrix, return matrix output
   - Use `isMatrix()` check and wrap result accordingly

3. **Enable tests** (1 hour)
   - Remove `it.skip` from line 119
   - Verify both cases pass

**Acceptance Criteria:**
- BigNumber array with number probability returns BigNumber result
- Type consistency maintained
- Tests pass

---

## Phase 4: Unimplemented Features (Priority: MEDIUM, Risk: HIGH)

**Goal:** Implement unit cancellation and circular dependency detection
**Tests Fixed:** 3 tests
**Estimated Effort:** 12-16 hours

### Sprint 4.1: Unit Cancellation in Multiplication
**Effort:** 8 hours
**Tests:** 2 (Unit cancellation × 2 files)

#### Tasks:
1. **Design unit cancellation algorithm** (2 hours)
   - Identify matching units in numerator and denominator
   - Example: `J/K/g * g` → `J/K` (g cancels)
   - Handle unit powers: `m^2 / m` → `m`

2. **Implement in Unit.multiply()** (4 hours)
   - File: `src/type/unit/Unit.js`
   - Add `simplify()` method to Unit class
   - Call after multiplication operations
   - Logic:
     ```javascript
     simplify() {
       // Find common units in numerator and denominator
       // Reduce powers
       // Remove canceled units
     }
     ```

3. **Add comprehensive tests** (1 hour)
   - Test various cancellation scenarios
   - Test with powers and complex units

4. **Enable skipped test** (1 hour)
   - Remove `it.skip` from line 1440
   - Verify cancellation works correctly

**Acceptance Criteria:**
- `multiply(unit('2 J/K/g'), unit('2 g'))` returns `unit('4 J/K')`
- Unit simplification works for complex expressions
- Tests pass

**Note:** This is complex - may need to research existing unit cancellation libraries

---

### Sprint 4.2: Factory Circular Dependency Detection
**Effort:** 4-8 hours
**Tests:** 2 (factory dependency tests)

#### Tasks:
1. **Implement cycle detection in sortFactories** (3 hours)
   - File: `src/utils/factory.js`
   - Use depth-first search (DFS) to detect cycles
   - Algorithm:
     ```javascript
     function detectCycle(dependencies) {
       const visited = new Set()
       const stack = new Set()

       function dfs(node) {
         if (stack.has(node)) {
           throw new Error('Circular dependency detected: ' + Array.from(stack).join(' -> '))
         }
         if (visited.has(node)) return

         visited.add(node)
         stack.add(node)

         for (const dep of getDependencies(node)) {
           dfs(dep)
         }

         stack.delete(node)
       }

       // Run DFS on all nodes
     }
     ```

2. **Add clear error messages** (1 hour)
   - Show full cycle path: "A → B → C → A"
   - Suggest breaking the cycle

3. **Enable test** (0.5 hours)
   - Remove `it.skip` from line 96
   - Verify error is thrown for circular deps

4. **Fix or remove sortFactories test** (1-3 hours)
   - Line 40: "should order functions by their dependencies"
   - Either fix implementation or remove if truly redundant
   - Investigate IE compatibility issue mentioned

**Acceptance Criteria:**
- Circular dependencies detected and reported with clear error
- Test passes
- Decision made on sortFactories redundancy

---

## Phase 5: Factory Import System (Priority: LOW, Risk: HIGH)

**Goal:** Complete factory import system
**Tests Fixed:** 5 tests
**Estimated Effort:** 16-24 hours

**Recommendation:** DEFER - This is a major feature addition with unclear requirements

### Sprint 5.1: Factory Import Design
**Effort:** 4 hours

#### Tasks:
1. **Define requirements** (2 hours)
   - What should factory imports enable?
   - Use cases for importing factories
   - API design

2. **Design implementation** (2 hours)
   - How to handle named vs unnamed factories
   - Namespace passing mechanism
   - Array imports

**Deliverable:** Design document

---

### Sprint 5.2: Implement Factory Imports
**Effort:** 12-20 hours

#### Tasks:
1. **Implement named factory import** (4 hours)
2. **Implement path-based import** (4 hours)
3. **Implement unnamed factory import** (2 hours)
4. **Implement namespace passing** (4 hours)
5. **Implement array imports** (4 hours)
6. **Enable all 5 tests** (2 hours)

**Note:** This is a significant feature - should be planned as separate project

---

## Phase 6: Performance Optimization (Priority: LOW, Risk: LOW)

**Goal:** Optimize rationalize performance
**Tests Fixed:** Already handled in Phase 1.2
**Status:** May already be complete - iteration limit added

---

## Implementation Roadmap

### Immediate (Week 1-2): Phases 1-2
- **Phase 1:** Input validation (8-12 hours)
- **Phase 2:** Config number propagation (16-20 hours)
- **Total:** 24-32 hours
- **Tests Fixed:** 12 tests

### Near-term (Week 3-4): Phase 3
- **Phase 3:** BigNumber precision (16-20 hours)
- **Tests Fixed:** 6 tests

### Future (Month 2): Phase 4
- **Phase 4:** Unimplemented features (12-16 hours)
- **Tests Fixed:** 3 tests

### Deferred: Phase 5
- **Phase 5:** Factory imports (16-24 hours)
- Requires design approval and use case validation
- **Tests Fixed:** 5 tests (once implemented)

---

## Risk Assessment

### Low Risk (Safe to implement)
- ✅ Input validation (Phase 1.1)
- ✅ Config propagation (Phase 2)
- ✅ deepMap decision (Phase 1.2)

### Medium Risk (Requires testing)
- ⚠️ BigNumber precision (Phase 3) - May affect existing users
- ⚠️ Unit cancellation (Phase 4.1) - Complex algebra

### High Risk (Requires design review)
- 🔴 Factory imports (Phase 5) - Major feature addition
- 🔴 sortFactories (Phase 4.2) - IE compatibility issues

---

## Success Metrics

### After Phase 1-2 (Immediate)
- **Tests enabled:** 12 out of 29 (41%)
- **Effort:** 24-32 hours
- **Risk:** Low-Medium

### After Phase 3 (Near-term)
- **Tests enabled:** 18 out of 29 (62%)
- **Effort:** 40-52 hours
- **Risk:** Medium

### After Phase 4 (Future)
- **Tests enabled:** 21 out of 29 (72%)
- **Effort:** 52-68 hours
- **Risk:** Medium-High

### After Phase 5 (Deferred)
- **Tests enabled:** 26 out of 29 (90%)
- **Effort:** 68-92 hours
- **Requires:** Design approval

---

## Recommendations

### Priority 1: Start with Phase 1 & 2 (Immediate)
- Low risk, high value
- Fixes architectural issue (config propagation)
- Adds missing validation
- **12 tests fixed in 24-32 hours**

### Priority 2: Phase 3 (Near-term)
- Medium risk, good value
- Preserves user intent (BigNumber precision)
- Document any breaking changes
- **6 more tests fixed in 16-20 hours**

### Priority 3: Phase 4 (Future)
- Higher risk, moderate value
- Complex features requiring careful design
- **3 more tests fixed in 12-16 hours**

### Defer: Phase 5 (Factory Imports)
- Unclear requirements
- Large effort with uncertain value
- Recommend investigating actual use cases first
- **5 tests deferred pending design**

---

## Next Steps

1. **Review and approve this plan**
2. **Start with Phase 1, Sprint 1.1** (SparseMatrix validation - 4 hours)
3. **Create sprint TODO files** for each phase
4. **Track progress** in this document

---

## Notes

- Some tests may already be fixable (e.g., rationalize iteration limit already implemented)
- Check existing implementations before starting work
- Duplicate tests (JS/TS) will be fixed together
- Breaking changes require HISTORY.md updates and version bump consideration
