# Advanced Scientific Calculator — Design Document

**Date:** 2026-03-04
**App name:** mathjs-calc (working title)
**Purpose:** Demo/proof of concept to test the feasibility of the math.js TS+AS+WASM library in a production-quality Electron application. Showcases performance gains, feature completeness, and production readiness.

---

## 1. Architecture

### Stack
- **Electron 33+** (Chromium + Node.js)
- **React 19 + TypeScript** (renderer)
- **Vite** (bundler for renderer — fast HMR)
- **math.js TS+AS+WASM** library (linked locally)
- **Recharts or D3** for visualizations (FFT spectra, histograms, benchmark charts)
- **Tailwind CSS** for styling
- **Zustand** for state management

### Project Structure
```
mathjs-calc/
├── electron/
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # Context bridge for WASM APIs
│   └── wasm-worker.ts    # Worker for heavy computations
├── src/                  # React renderer
│   ├── App.tsx
│   ├── panels/
│   │   ├── CalculatorPanel.tsx
│   │   ├── MatrixLabPanel.tsx
│   │   ├── SignalStudioPanel.tsx
│   │   ├── StatisticsPanel.tsx
│   │   └── PerformancePanel.tsx
│   ├── components/       # Shared UI (buttons, inputs, charts)
│   ├── hooks/            # useMathParser, useWasmBenchmark, etc.
│   └── store/            # Zustand state management
├── package.json
├── vite.config.ts
└── electron-builder.yml
```

### Process Model
- **Main process**: Electron shell, WASM module initialization, file I/O
- **Renderer process**: React UI, expression input, visualization
- **Worker threads** (via workerpool): Heavy WASM computations run off-main-thread

The math.js `Parser` instance lives in the renderer (fast enough for expression eval). WASM-accelerated operations (matrix multiply, FFT, stats on large datasets) are dispatched to the main process via IPC, which runs them on worker threads. This keeps the UI thread responsive during heavy computation.

---

## 2. Panel Layout & Features

### Top Bar (always visible)
- Expression input field with syntax highlighting and autocomplete
- Result display (type-aware: numbers, matrices, complex, units, fractions)
- Variable indicator (shows defined variables like `x=7, A=[1,2;3,4]`)
- Engine toggle: `JS | WASM | Auto` — switches computation backend globally

### Panel 1: Scientific Calculator
- Button grid: digits, operators, trig, log/exp, constants (pi, e, phi)
- Angle mode toggle: DEG / RAD / GRAD
- Number type selector: Number / BigNumber / Complex / Fraction
- Calculation history (scrollable, clickable to re-insert)
- Unit conversion shortcut: `5 km in miles`

### Panel 2: Matrix Lab
- Visual matrix editor (click cells to edit, resize with +/- buttons)
- Quick operations: determinant, inverse, transpose, eigenvalues, SVD, LU, QR
- Result matrix rendered as a formatted grid
- "Benchmark this" button — runs same operation in JS vs WASM, shows timing comparison

### Panel 3: Signal Studio
- Waveform generator: sine, square, triangle, sawtooth (frequency, amplitude, sample count sliders)
- FFT button → spectral plot (magnitude vs frequency)
- Inverse FFT to reconstruct signal
- Visual comparison: input waveform + frequency spectrum side by side
- Sample count slider (128 → 65536) to show WASM scaling advantage

### Panel 4: Statistics Dashboard
- Data input: paste CSV, manual entry, or generate random datasets (normal, uniform, poisson)
- Descriptive stats: mean, median, std, variance, min, max, quartiles
- Histogram visualization with configurable bin count
- Distribution fitting overlay
- Dataset size slider (100 → 1M) to demonstrate WASM throughput

### Panel 5: Performance Dashboard
- Automated benchmark suite across all domains
- Bar charts: JS vs WASM vs WASM+SIMD execution time
- Scaling curves: operation time vs input size (log-log plot)
- System info: WASM capabilities detected, CPU cores, memory
- "Run all benchmarks" button with progress indicator

---

## 3. Data Flow & State Management

### Shared State (Zustand)
- `parser`: Single math.js `Parser` instance — variables defined in any panel are available everywhere
- `engine`: `'js' | 'wasm' | 'auto'` — global computation backend
- `history`: Array of `{ expression, result, panel, timestamp, engineUsed, executionTime }`
- `config`: Angle mode, number type, precision, WASM thresholds

### Expression Evaluation Flow (synchronous)
```
User types expression
  → Parser.evaluate(expr)           [renderer, synchronous]
  → Result rendered (type-aware formatting)
  → History entry pushed
```

### Heavy Computation Flow (asynchronous)
```
User clicks operation button
  → IPC message to main process     [async]
  → Main dispatches to worker thread
  → Worker loads WASM module, runs operation
  → IPC response with result + timing
  → Renderer updates UI + benchmark display
```

### Variable Sharing
Variables persist across panels. User defines `A = [[1,2],[3,4]]` in the expression bar → `A` is available in Matrix Lab for decomposition, in Statistics for element-wise stats, and in the expression bar for `det(A)`.

---

## 4. WASM Integration & Benchmarking

### WASM Initialization
- On app launch, main process calls `MatrixWasmBridge.init()` and caches the module
- Capability detection runs once: `{ wasmAvailable, simdAvailable, parallelAvailable, coreCount }`
- If WASM fails to load, app falls back to JS-only with a status indicator

### Engine Modes
- **JS**: Forces pure JavaScript — baseline for comparison
- **WASM**: Forces WASM path regardless of input size — shows overhead for small inputs too
- **Auto** (default): Uses `MatrixWasmBridge.configure()` thresholds — WASM for >100 elements, parallel for >10K

### Benchmarking Approach
Each benchmark runs the same operation through both engines and reports:
- Wall-clock time (ms) for each engine
- Speedup ratio (e.g., "WASM: 4.7x faster")
- Memory allocated (approximate)

### Benchmark Suite (Performance Dashboard)

| Category | Operation | Sizes |
|----------|-----------|-------|
| Matrix | Multiply (NxN) | 10, 50, 100, 500, 1000 |
| Matrix | LU Decomposition | 10, 50, 100, 500 |
| Matrix | Eigenvalues | 10, 50, 100, 200 |
| Signal | FFT | 256, 1024, 4096, 16384, 65536 |
| Statistics | Mean + Variance | 1K, 10K, 100K, 1M |
| Statistics | Median (requires sort) | 1K, 10K, 100K |
| Geometry | Distance (N-dim) | 32, 128, 512, 2048 |

### Inline Benchmarking
Each panel has a "Benchmark this" toggle. When enabled, every operation runs on both engines and shows a small timing comparison inline.

---

## 5. Error Handling & Edge Cases

### Expression Errors
Math.js parser throws descriptive errors (`Undefined symbol x`, `Unexpected end of expression`). Displayed inline below the expression input in red — no modal dialogs.

### WASM Failures
If a WASM operation crashes or returns NaN/error code, the app automatically retries with the JS engine and shows a warning: "WASM failed, fell back to JS". The result is still displayed.

### Large Input Protection
- Matrix editor caps at 100x100 for interactive editing (expression bar has no limit)
- Statistics dataset capped at 5M elements (prevents OOM)
- FFT sample count capped at 131072 (2^17)
- Benchmark operations have per-size timeouts (30s max)

### Type Display
Results are rendered type-aware:
- Numbers → formatted with configurable precision
- Matrices → grid table (collapsible if >10x10)
- Complex → `a + bi` notation
- Units → value + unit string
- Fractions → `a/b` notation

### State Persistence
Calculator state (variables, history, config) auto-saves to Electron `userData` directory. Restores on relaunch.
