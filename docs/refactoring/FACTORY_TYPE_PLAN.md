# Factory Function Type Safety Plan

## Problem

The `factory()` function in `src/utils/factory.ts` creates math.js functions via dependency injection. TypeScript cannot infer the types of injected dependencies because they come from a runtime scope object (`Record<string, any>`), causing ~1500 cascading type errors:

- **TS2345** (231): Argument type mismatch — `unknown` passed where specific type expected
- **TS2322** (145): Type assignment mismatch — factory returns `unknown`
- **TS2349** (53): Not callable — factory-created functions typed as `unknown`
- **TS2739/2740** (91): Missing properties — objects typed as `unknown`
- **TS2339** (38): Property doesn't exist on `unknown`

### Root Cause

```typescript
// Current: TDeps defaults to `any`, so deps are untyped
export const createAnd = factory(
  'and',
  dependencies,
  ({ typed, matrix, equalScalar, zeros, not, concat }: AndDependencies) => {
    // The return value type is inferred but gets lost when
    // createAnd is called from other factories:
    const and = createAnd({ typed, matrix, ... })
    // `and` is typed as the full return of the factory callback,
    // but when called through the factory system, it becomes `any`
    and(x, y) // TS2349: not callable
  }
)
```

The type chain breaks at two points:
1. **Factory creation**: `factory()` returns `FactoryFunction<TDeps, TResult>` — the `TResult` IS correctly inferred from the create callback
2. **Factory invocation**: When another factory calls `createX({...deps})`, the result is `TResult`. But the deps interface declares dependencies as `MathFunction` or custom interfaces that don't match the actual factory-created typed-functions

## Strategy: Incremental Typing in 4 Phases

### Phase 1: Core Type Infrastructure (Low effort, high impact)

**Goal**: Create shared type definitions that all factories can reference.

1. Create `src/types/MathJsTypes.ts` with:
   ```typescript
   // Callable type for typed-function instances
   export interface TypedFunctionInstance {
     (...args: any[]): any
     signatures: Record<string, (...args: any[]) => any>
     name: string
   }

   // Matrix type (common dependency)
   export interface MatrixInstance {
     size(): number[]
     storage(): string
     valueOf(): unknown[][]
     _size: number[]
     subset(index: any, replacement?: any): MatrixInstance | any
     map(callback: Function): MatrixInstance
     forEach(callback: Function): void
     toArray(): any[]
     clone(): MatrixInstance
   }

   // Matrix constructor (injected as 'matrix' dependency)
   export interface MatrixConstructor {
     (data?: any, datatype?: string): MatrixInstance
   }

   // Scope for dependency injection
   export interface MathScope {
     typed: TypedFunctionInstance
     matrix: MatrixConstructor
     config: Record<string, any>
     [key: string]: any
   }
   ```

2. Update `FactoryFunction` to preserve return type:
   ```typescript
   export interface FactoryFunction<_TDeps = any, TResult = any> {
     (scope: Record<string, any>): TResult
     // ... existing properties
   }
   ```
   (Already correct — `TResult` is preserved)

**Impact**: Provides reusable types, ~0 errors fixed directly but unblocks Phase 2.

### Phase 2: Typed Factory Dependencies (Medium effort, high impact)

**Goal**: Type the 20 most-used factory dependencies so callbacks know what they receive.

Target the dependencies used by the most factories:
- `typed` (used by ~400 functions) → `TypedFunctionInstance`
- `matrix` → `MatrixConstructor`
- `DenseMatrix`, `SparseMatrix` → constructor types
- `equalScalar` → `(a: any, b: any) => boolean`
- `config` → `MathJsConfig`
- `addScalar`, `multiplyScalar`, etc. → `TypedFunctionInstance`

**Approach**: Create a `FactoryDeps` mapped type:
```typescript
// Map dependency names to their types
interface KnownDependencies {
  typed: TypedFunctionInstance
  matrix: MatrixConstructor
  DenseMatrix: DenseMatrixConstructor
  SparseMatrix: SparseMatrixConstructor
  equalScalar: (a: any, b: any) => boolean
  config: MathJsConfig
  // ... top 20 deps
}

// Auto-type dependencies from their string names
type ResolvedDeps<T extends readonly string[]> = {
  [K in T[number] as StripOptional<K>]: K extends keyof KnownDependencies
    ? KnownDependencies[K]
    : TypedFunctionInstance  // default: assume callable
}
```

Then update `factory()` to use `const` type parameter for dependency arrays:
```typescript
export function factory<
  const TNames extends readonly string[],
  TResult
>(
  name: string,
  dependencies: TNames,
  create: (deps: ResolvedDeps<TNames>) => TResult,
  meta?: FactoryMeta
): FactoryFunction<ResolvedDeps<TNames>, TResult>
```

**Impact**: ~400-600 errors fixed. All factories that declare standard dependencies get typed deps automatically.

### Phase 3: Transform & Expression Typing (Medium effort, medium impact)

**Goal**: Fix the 53 TS2349 errors in expression transforms.

The transforms call factory-created functions like `and(x, y)` where `and` is the result of `createAnd({...})`. With Phase 2, `createAnd` will return a properly typed `TypedFunctionInstance` which IS callable.

Additional work:
- Type the `rawArgs` transform pattern
- Type `compile().evaluate(scope)` return values
- Add return type annotations to the 25 transform factories

**Impact**: ~100-150 errors fixed.

### Phase 4: Per-Function Type Annotations (High effort, completeness)

**Goal**: Add specific return types and parameter types to individual factory functions.

This is the long tail — each of the ~400 factories gets explicit typing:
```typescript
export const createAdd = factory(
  'add',
  ['typed', 'matrix', 'addScalar', 'equalScalar', 'DenseMatrix', 'SparseMatrix', 'concat'],
  (deps): TypedFunctionInstance => {
    // explicit return type annotation
    return typed('add', { ... })
  }
)
```

**Approach**:
- Start with the 20 most-depended-on functions (they cause the most cascading errors)
- Use RLM to batch-analyze and auto-annotate return types
- Prioritize: arithmetic (45) → matrix (54) → algebra (15) → statistics (22)

**Impact**: Remaining ~200-400 errors.

## Priority Order

| Phase | Errors Fixed | Effort | Files Changed |
|-------|-------------|--------|---------------|
| 1. Core types | ~0 (enables others) | 1 day | 2-3 new files |
| 2. Typed deps | ~400-600 | 2-3 days | `factory.ts` + 1 types file |
| 3. Transforms | ~100-150 | 1-2 days | 25 transform files |
| 4. Per-function | ~200-400 | 3-5 days | ~100 function files |

**Total estimated reduction**: 1738 → ~200-400 remaining (mostly in test files)

## Constraints

- **Zero runtime changes** — all fixes are type-only (`type`, `interface`, type annotations)
- **Backward compatible** — no changes to factory() runtime behavior
- **Incremental** — each phase is independently committable and testable
- **TypeScript 5.x required** — `const` type parameters need TS 4.9+

## Test Strategy

After each phase:
1. `npx tsc --noEmit 2>&1 | grep -c "error TS"` — error count should decrease
2. `npm run validate:wasm` — WASM syntax unchanged
3. `npx vitest run --config vitest.config.ts test/wasm/unit-tests/wasm/` — 322/322 passing
4. `npm test` — existing test suite unaffected

## Files to Create/Modify

### New Files
- `src/types/MathJsTypes.ts` — shared type definitions
- `src/types/KnownDependencies.ts` — dependency name → type mapping

### Modified Files
- `src/utils/factory.ts` — enhanced `factory()` signature with const type params
- 25 `src/expression/transform/*.ts` — return type annotations
- ~100 `src/function/**/*.ts` — dependency interface updates (remove per-file interfaces, use shared types)

## Notes

- The `typed-function` library itself returns callable objects, but TypeScript sees them as opaque. The `TypedFunctionInstance` interface bridges this gap.
- Many factory files define local interfaces (`interface AndDependencies { ... }`) that duplicate each other. Phase 2 eliminates this duplication.
- The `const` type parameter trick (`const TNames extends readonly string[]`) preserves literal string types from the dependency array, enabling the mapped type to resolve each dep by name.
