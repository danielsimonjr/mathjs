# ISE Workbench Gap Analysis — v1.0

**Date:** 2026-03-05
**Purpose:** Benchmark our ISE workbench against industry tools (Mathcad, Mathematica, Desmos, MATLAB) to guide future iterations that stress-test the math.js TS+AS+WASM refactor.

---

## Current Position

The ISE workbench is closer to **Desmos + a souped-up TI-Nspire** than to Mathcad or Mathematica. As a proof of concept for the math.js TS+AS+WASM library, it successfully demonstrates:
- The library can power a real interactive computing environment
- WASM acceleration is viable for heavy numerics
- The expression parser + symbolic engine is usable in production UI

---

## What We Nail

| Aspect | ISE Workbench | Verdict |
|--------|--------------|---------|
| Dark dashboard aesthetic | Modern, clean, Mathcad-inspired | Looks professional — not a toy |
| Interactive graphing | Plotly 2D/3D with zoom/pan/trace | On par with Desmos, close to Mathematica's basic plots |
| Symbolic rendering | KaTeX LaTeX output | Beautiful — matches Mathcad's rendered math feel |
| Calculator UX | TI-style button grid + ribbon toolbar | Better than Mathematica's blank notebook for discoverability |
| Resizable layout | Three-zone allotment splits | More flexible than Mathcad's fixed document flow |
| Variable explorer | Live type-badged list with click-to-insert | Comparable to MATLAB's workspace panel |
| Expression history | Scrollable log with click-to-reuse | Practical; similar to MATLAB's command history |

---

## Gaps vs Industry Tools

### 1. Symbolic Engine Depth (Critical)

| Capability | Mathcad/Mathematica | Our ISE (math.js) |
|-----------|-------------------|-------------------|
| Simplify, expand, factor | Full | Yes |
| Derivative | Full (partial, higher-order) | Yes (basic) |
| Symbolic integration | Full | No |
| Limits | Full | No |
| Series expansion | Full (Taylor, Laurent, Fourier) | No |
| Equation solving | Systems, ODEs, PDEs | Basic single-variable |
| Assumptions system | Full (real, positive, integer...) | No |
| Pattern matching / rewrite rules | Full | Limited (simplify rules) |

**WASM stress-test opportunity:** Implementing symbolic integration and series expansion in AS+WASM would be a major performance benchmark.

### 2. Live Document / Notebook Model (Major)

| Feature | Mathcad/Mathematica | Our ISE |
|---------|-------------------|---------|
| Persistent cell model | Equations are the document | Calculator with history log |
| Reorder / insert cells | Yes | No |
| Markdown / text annotations | Yes | No |
| Re-evaluate dependency chain | Yes (Mathcad auto-updates downstream) | No |
| Export to PDF / LaTeX | Yes | No |
| Share / collaborate | Yes | No |

**WASM stress-test opportunity:** Auto-updating a dependency chain of 100+ cells with matrix operations would stress both the parser and WASM compute.

### 3. Plot Sophistication (Moderate)

| Plot Type | Mathcad/Mathematica | Our ISE |
|-----------|-------------------|---------|
| 2D function plots | Yes | Yes |
| 3D surface plots | Yes | Yes |
| Parametric curves | Yes | Yes |
| Polar plots | Yes | Yes |
| Contour plots | Yes | No |
| Vector fields | Yes | No |
| Implicit curves/surfaces | Yes | No |
| Animations | Yes | No |
| Multiple y-axes | Yes | No |
| Log/semilog scales | Yes | No (Plotly supports it, not wired) |
| Histogram / statistical plots | Yes | No (exists in Stats panel, not in graph canvas) |

**WASM stress-test opportunity:** Real-time animation of parametric surfaces with 100K+ vertices would stress WASM matrix/trig throughput.

### 4. Units & Dimensional Analysis (Moderate)

| Feature | Mathcad | Our ISE |
|---------|---------|---------|
| Inline unit expressions | `5 kg * 9.8 m/s^2` | math.js supports it, not surfaced in UI |
| Dimensional consistency checking | Automatic | Not shown |
| Unit conversion | Automatic | Available but no UI affordance |
| Custom units | Yes | math.js supports it |

**WASM stress-test opportunity:** Unit conversion across large datasets (e.g., converting 1M measurements) would benchmark unit system performance.

### 5. Matrix & Linear Algebra UI (Moderate)

| Feature | Mathcad/MATLAB | Our ISE |
|---------|---------------|---------|
| Visual matrix editor | Inline grid editor | Lost when Matrix Lab panel was replaced |
| Matrix display as grid | Formatted table | Shows as text `[[1,2],[3,4]]` |
| Sparse matrix visualization | Yes | No |
| Step-by-step decomposition | Mathcad shows LU/QR steps | No |

**WASM stress-test opportunity:** Interactive LU/QR/SVD on 1000x1000 matrices would directly benchmark WASM linear algebra modules.

### 6. Function Library Coverage

| Category | Mathematica (~6000) | Mathcad (~3000) | math.js (~400) |
|----------|-------------------|----------------|----------------|
| Core arithmetic | Full | Full | Full |
| Linear algebra | Full | Full | Good (det, inv, eigs, SVD, QR, LU) |
| Statistics | Full | Full | Good (mean, std, median, distributions) |
| Signal processing | Full | Full | Basic (FFT/IFFT) |
| Optimization | Full | Good | No |
| ODE/PDE solvers | Full | Good | Basic (in WASM modules) |
| Special functions | Full | Good | Partial (erf, gamma, zeta, Bessel) |
| Number theory | Full | Limited | Limited |
| Graph theory | Full | No | No |

### 7. Performance & Scalability

| Scenario | MATLAB/Mathematica | Our ISE |
|----------|-------------------|---------|
| 10x10 matrix ops | <1ms | <1ms (JS) |
| 1000x1000 matrix multiply | ~50ms (optimized BLAS) | ~200ms JS, ~20ms WASM (target) |
| 10000x10000 | ~5s (parallel BLAS) | Not tested — WASM+parallel target |
| Symbolic: 100-term polynomial | <10ms | Untested |
| Plot: 1M data points | Smooth | Plotly handles ~100K well |

**This is the primary stress-test dimension for the TS+AS+WASM refactor.**

---

## Iteration Roadmap (Prioritized by WASM Stress-Test Value)

### Iteration 2: Heavy Numerics Showcase
- Bring back Matrix Lab as a modal/panel with visual grid editor
- Add contour plots and vector fields
- Wire up WASM engine toggle to graph computation (plot with WASM vs JS comparison)
- Add benchmark overlay: show JS vs WASM timing for each operation
- Surface unit expressions in the UI

### Iteration 3: Live Document Model
- Cell-based evaluation (each expression becomes a persistent, reorderable cell)
- Dependency chain with auto-update
- Markdown annotations between cells
- Export to PDF/JSON

### Iteration 4: Advanced Symbolic
- Symbolic integration (if math.js adds it, or via WASM CAS module)
- Limits, series expansion
- Step-by-step solve display
- Assumption system

### Iteration 5: Real-Time & Scale
- Animated plots (parameter sliders driving real-time re-render)
- Large-scale matrix operations with progress indicators
- Parallel computation visualization (show core utilization)
- WebGPU acceleration exploration

---

## Key Metrics for Each Iteration

| Metric | How to Measure |
|--------|---------------|
| WASM speedup ratio | Benchmark panel: JS time / WASM time per operation |
| Max matrix size before UI lag | Largest NxN where interaction stays <100ms |
| Plot render time | Time from `plot()` to pixels on screen |
| Symbolic eval time | Time for derivative/simplify on increasing expression complexity |
| Memory usage | Chrome DevTools heap snapshot during heavy operations |
| Startup time | Time from app launch to first interaction |

---

## Reference Comparisons

- **Desmos** — Best-in-class for 2D graphing UX. Our graph canvas is comparable for basic use.
- **TI-Nspire** — Our button grid + toolbar ribbon matches its interaction model well.
- **Mathcad** — Our symbolic rendering (KaTeX) matches its visual quality. We lack the document model.
- **Mathematica** — Incomparable symbolic depth, but our UI is more approachable for calculator-style use.
- **MATLAB** — Our variable explorer is similar to its workspace. We lack its toolbox ecosystem.
