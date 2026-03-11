# AssemblyScript to Rust WASM Migration — Design Spec

**Date:** 2026-03-11
**Status:** Approved
**Purpose:** Migrate the math.js WASM modules from AssemblyScript to Rust for better performance (LLVM backend), long-term maintainability, and Rust crate ecosystem leverage.

---

## Decision Summary

| Aspect | Decision |
|--------|----------|
| **Approach** | Module-by-module port, crates for LA/FFT/stats, pure Rust for simple modules |
| **ABI** | Same raw pointer `extern "C"` — JS bridge (`WasmLoader.ts`, `MatrixWasmBridge.ts`) unchanged |
| **Structure** | Single Cargo workspace at `src/wasm-rust/`, one `.wasm` output |
| **Crates** | `faer` (LA), `rustfft` (signal), `statrs` (special/stats), fallbacks identified |
| **Migration order** | matrix -> algebra -> signal/SIMD -> stats/numeric/special -> simple modules -> cutover |
| **SIMD** | `core::arch::wasm32` with `simd128` target feature |
| **AS preservation** | Kept in `src/wasm/` for benchmarking (same pattern as JS legacy files) |
| **Build** | `npm run build:wasm:rust` alongside existing `npm run build:wasm` |
| **Testing** | Existing vitest unmodified + Rust native `cargo test` + parity benchmarks |
| **Phases** | 0 (scaffold) -> 1-5 (modules) -> 6 (cutover), each with exit gate |

---

## Motivations

1. **Performance** — Rust's LLVM backend produces faster WASM than AssemblyScript's Binaryen compiler (especially for SIMD, loop optimization, autovectorization)
2. **Long-term maintainability** — AssemblyScript's development has slowed; Rust/WASM is the industry standard
3. **Library reuse** — Leverage existing Rust math crates (`nalgebra`, `faer`, `rustfft`, `statrs`) rather than reimplementing everything

---

## Current State

- **58 AssemblyScript `.ts` files** in `src/wasm/` (~33,600 lines)
- **17 subdirectories**: algebra, arithmetic, bitwise, combinatorics, complex, geometry, logical, matrix, numeric, plain, probability, relational, set, signal, simd, statistics, string, unit, utils
- **Raw pointer API** throughout (`usize`, `load<f64>`, `store<f64>`)
- **SIMD** via AssemblyScript's `v128` intrinsics (868 lines in `simd/operations.ts`)
- **JS bridge layer**: `WasmLoader.ts` (singleton loader) + `MatrixWasmBridge.ts` (auto JS/WASM selection with thresholds)

---

## Project Structure

```
src/wasm-rust/                          # New Rust workspace (lives alongside src/wasm/)
+-- Cargo.toml                          # Workspace root
+-- Cargo.lock
+-- rust-toolchain.toml                 # Pin stable + wasm32 target
+-- crates/
|   +-- mathjs-wasm/                    # Main crate -- single .wasm output
|   |   +-- Cargo.toml                  # Dependencies: faer, rustfft, statrs, etc.
|   |   +-- src/
|   |   |   +-- lib.rs                  # Top-level exports (mirrors src/wasm/index.ts)
|   |   |   +-- matrix/                 # mod.rs + multiply.rs, eigs.rs, expm.rs, sqrtm.rs, ...
|   |   |   +-- algebra/               # decomposition.rs, solver.rs, sparse/
|   |   |   +-- signal/                # fft.rs, processing.rs
|   |   |   +-- simd/                  # operations.rs (core::arch::wasm32)
|   |   |   +-- statistics/            # basic.rs, select.rs
|   |   |   +-- numeric/              # ode.rs, calculus.rs, interpolation.rs, ...
|   |   |   +-- special/              # functions.rs (erf, gamma, zeta)
|   |   |   +-- plain/                # arithmetic.rs, trigonometry.rs, probability.rs
|   |   |   +-- arithmetic/           # basic.rs, advanced.rs, logarithmic.rs
|   |   |   +-- bitwise/              # operations.rs
|   |   |   +-- logical/              # operations.rs
|   |   |   +-- relational/           # operations.rs
|   |   |   +-- complex/              # operations.rs
|   |   |   +-- geometry/             # operations.rs
|   |   |   +-- combinatorics/        # basic.rs
|   |   |   +-- unit/                 # conversion.rs
|   |   |   +-- string/               # operations.rs
|   |   |   +-- set/                  # operations.rs
|   |   |   +-- utils/                # checks.rs, work_ptr.rs
|   +-- mathjs-wasm-test/             # Native test crate (runs on host, not wasm)
|       +-- Cargo.toml
|       +-- src/                       # Integration tests against the Rust logic
+-- scripts/
    +-- build.sh                       # cargo build + wasm-opt + copy to lib/wasm/
    +-- verify-exports.js             # Compares Rust .wasm exports against WasmLoader interface
```

---

## Crate Strategy

### Crate-backed modules (the hard stuff)

| Module | Crate | Why |
|--------|-------|-----|
| `matrix/multiply`, `matrix/linalg` | `faer` (fallback: `nalgebra`) | Dense LA with SIMD-aware kernels |
| `matrix/eigs`, `matrix/complexEigs` | `faer` eigendecomposition | Jacobi, QR algorithm, Schur |
| `matrix/expm`, `matrix/sqrtm` | `faer` + custom algorithms | faer gives matrix ops, we implement Pade/Denman-Beavers on top |
| `algebra/decomposition` | `faer` (LU, QR, Cholesky) | Direct replacement |
| `algebra/sparse*` | `faer` sparse or `sprs` | CSC format sparse operations |
| `signal/fft`, `signal/processing` | `rustfft` | Production FFT with planner |
| `statistics/basic` | `statrs` (distributions) | Distribution functions |
| `special/functions` | `statrs` (erf, gamma, beta) | Numerically tricky functions |

### Pure Rust ports (the simple stuff)

| Module | Lines (AS) | Approach |
|--------|-----------|----------|
| `plain/` (arithmetic, trig, probability) | ~594 | Direct translation |
| `arithmetic/` (basic, advanced, logarithmic) | ~820 | Scalar ops |
| `bitwise/operations` | ~221 | Trivial port |
| `logical/operations` | ~283 | Trivial port |
| `relational/operations` | ~454 | Trivial port |
| `complex/operations` | ~324 | Complex number math |
| `geometry/operations` | ~779 | Distance, intersection |
| `combinatorics/basic` | ~369 | Stirling, Bell numbers |
| `unit/conversion` | ~801 | Unit factor tables |
| `string/operations` | ~535 | Char code operations |
| `set/operations` | ~594 | Sorted array set ops |
| `utils/` | ~780 | Validation helpers |

### Crate verification gate (Phase 0)

Before committing to any crate, compile a minimal Rust crate that depends on it and builds to `wasm32-unknown-unknown`.

| Primary | Fallback |
|---------|----------|
| `faer` | `nalgebra` (confirmed wasm32 support) |
| `rustfft` | Port AS FFT (~487 lines) |
| `statrs` | Port from AS (~572 lines) |

---

## Export ABI Contract

Every Rust function matches the exact C ABI signature `WasmLoader.ts` expects:

```rust
#[no_mangle]
pub unsafe extern "C" fn multiplyDense(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    b_ptr: *const f64,
    b_rows: i32,
    b_cols: i32,
    result_ptr: *mut f64,
) {
    // Read from raw pointers, compute via faer, write back
}
```

**ABI rules:**
- All array parameters are raw pointers (`*const f64`, `*mut f64`, `*const i32`, `*mut i32`)
- No Rust `String`, `Vec`, `Box` — everything is caller-allocated via WASM linear memory
- Return `i32` for success/failure (1/0), `f64` for scalar results, `f64::NAN` for errors
- `workPtr` convention preserved — caller carves temp space from linear memory
- Function names stay camelCase via `#[no_mangle]`
- `verify-exports.js` script validates all `WasmModule` interface functions exist in the `.wasm` binary

---

## Migration Phases

### Phase 0: Scaffold & Spike

- Set up `src/wasm-rust/` workspace, toolchain, build pipeline
- Spike: compile `faer`, `rustfft`, `statrs` to `wasm32-unknown-unknown`
- Create `npm run build:wasm:rust`, `verify-exports.js`
- **Exit gate:** `cargo build --target wasm32-unknown-unknown` succeeds

### Phase 1: Matrix Module (~5,500 lines AS)

Migrate `matrix/multiply`, `matrix/linalg`, `matrix/eigs`, `matrix/complexEigs`, `matrix/expm`, `matrix/sqrtm`, `matrix/functions`, `matrix/basic`, `matrix/sparse`, `matrix/broadcast`, `matrix/algorithms`, `matrix/rotation`.

- **Exit gate:** All `test/wasm/**/matrix/**` tests pass against Rust binary

### Phase 2: Algebra Module (~4,200 lines AS)

Migrate `algebra/decomposition`, `algebra/solver`, `algebra/equations`, `algebra/polynomial`, `algebra/schur`, `algebra/sparseLu`, `algebra/sparseChol`, `algebra/sparse/amd`, `algebra/sparse/operations`.

- **Exit gate:** All `test/wasm/**/algebra/**` tests pass

### Phase 3: Signal + SIMD (~2,200 lines AS)

Migrate `signal/fft`, `signal/processing`, `simd/operations`.

- **Exit gate:** FFT and SIMD tests pass. Benchmark: LLVM SIMD >= AS Binaryen SIMD

### Phase 4: Statistics + Numeric + Special (~3,800 lines AS)

Migrate `statistics/`, `special/`, `numeric/`, `probability/`.

- **Exit gate:** All statistics, numeric, special, probability tests pass

### Phase 5: Simple Modules (~4,600 lines AS)

Bulk port: `plain/`, `arithmetic/`, `bitwise/`, `logical/`, `relational/`, `complex/`, `geometry/`, `combinatorics/`, `unit/`, `string/`, `set/`.

- **Exit gate:** All remaining WASM tests pass

### Phase 6: Cutover & Benchmark

- Update `npm run build:wasm` to point to Rust pipeline
- AS source preserved in `src/wasm/` for benchmarking
- Remove AssemblyScript from required build dependencies (keep as optional)
- Update docs, `CLAUDE.md`, `WASM_TODO.md`
- Produce benchmark report: Rust WASM vs AS WASM vs JS per module
- **Exit gate:** `npm run build:wasm && npm run test:wasm` passes with Rust binary only

---

## Build Pipeline

```
npm run build:wasm:rust
  +-- cargo build --target wasm32-unknown-unknown --release
  |     +-- outputs: target/wasm32-unknown-unknown/release/mathjs_wasm.wasm
  +-- wasm-opt -O3 --enable-simd mathjs_wasm.wasm -o mathjs_wasm.opt.wasm
  +-- cp mathjs_wasm.opt.wasm lib/wasm/mathjs.wasm
  +-- node scripts/verify-exports.js

npm run build:wasm        <-- AS pipeline (kept for benchmarking)
npm run build:wasm:rust   <-- Rust pipeline
npm run build:wasm:all    <-- builds both (for benchmark comparisons)
```

**rust-toolchain.toml:**
```toml
[toolchain]
channel = "stable"
targets = ["wasm32-unknown-unknown"]
```

**WasmLoader.ts backend selection:**
```typescript
const WASM_BINARY = process.env.MATHJS_WASM_BACKEND === 'assemblyscript'
  ? 'mathjs-as.wasm'
  : 'mathjs.wasm'   // Rust (default after cutover)
```

---

## Testing Strategy

### Layer 1: Existing WASM Tests (vitest) — No Changes

~6800 vitest tests run unmodified against the Rust `.wasm` binary (same ABI).

### Layer 2: Rust Native Tests — New

`cargo test` runs unit tests on host for fast feedback without WASM boundary.

### Layer 3: Parity Benchmark — New

Runs same operations against both AS and Rust binaries, asserts numerical parity within `f64` epsilon, and produces performance comparison.

```bash
npm run bench:wasm:compare    # AS vs Rust vs JS timing per operation
```

### Phase gate testing

Each phase must pass its exit gate before the next begins.

---

## Reference

- **Current WASM docs:** `docs/refactoring/WASM_TODO.md`
- **AS style guide:** `docs/ASSEMBLYSCRIPT_STYLE_GUIDE.md`
- **Gap analysis:** `docs/plans/2026-03-05-ise-gap-analysis.md`
- **Rust WASM SIMD:** `core::arch::wasm32` with `#[target_feature(enable = "simd128")]`
- **nalgebra WASM support:** https://www.nalgebra.rs/docs/user_guide/wasm_and_embedded_targets/
