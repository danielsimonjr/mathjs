# mathjs-calc — Integrated Scientific Environment (ISE)

Advanced scientific workbench — proof of concept for the math.js TS+AS+WASM library. A virtual graphing calculator in the style of TI-89/Nspire with Mathcad-inspired modern dashboard aesthetics.

## Quick Start

```bash
npm install
npm run dev          # Web-only dev server
npm run electron:dev # Full Electron app
```

## Layout

Three-zone resizable split layout:
- **Calculator Panel** (left ~40%) — Toolbar ribbon, symbolic output, variable explorer, button grid
- **Graph Canvas** (right ~60%) — Interactive 2D/3D plots with Plotly.js
- **Expression Bar** (bottom) — Multi-line input with live LaTeX preview

## Features

### Calculator Panel
- **Toolbar Ribbon** — 7 icon groups (Algebra, Calculus, Matrix, Trig, Stats, Plot, Settings) with template insertion
- **Symbolic Computing** — simplify, derivative, expand, rationalize, solve with KaTeX-rendered LaTeX output
- **Variable Explorer** — Live variable list with type badges, click-to-insert
- **Enhanced Button Grid** — 8x6 grid with symbolic, trig, function, and numeric keys

### Graph Canvas
- **2D Plotting** — `plot(sin(x))`, `plot(x^2, x, -5, 5)`
- **3D Surfaces** — `plot3d(sin(x)*cos(y))`
- **Parametric** — `plotParametric(cos(t), sin(t), t, 0, 2*pi)`
- **Polar** — `plotPolar(1+cos(theta), theta, 0, 2*pi)`
- **Multi-function overlay** with function list, visibility toggle, auto-colors
- **Interactive** — Zoom, pan, trace, hover tooltips

### Expression Bar
- Live LaTeX preview as you type (KaTeX)
- History navigation (Up/Down arrows)
- Type badges on results (number, Matrix, Complex, symbolic, plot)
- Shift+Enter for multi-line expressions

### Secondary Panels
- **Statistics Dashboard** — Data generation, descriptive stats, histograms
- **Performance Dashboard** — JS vs WASM benchmark suite with scaling charts

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Evaluate expression |
| `Shift+Enter` | New line in expression |
| `Up/Down` | Navigate expression history |
| `Ctrl+E` | Focus expression bar |
| `Ctrl+G` | Toggle graph panel |
| `Ctrl+L` | Clear all plots |
| `Escape` | Focus expression bar |

## Engine Modes

- **JS** — Pure JavaScript (baseline)
- **WASM** — WebAssembly acceleration (2-25x faster for large operations)
- **Auto** — Automatically selects best engine based on input size

## Tech Stack

Electron 33, React 19, TypeScript, Vite, Plotly.js, KaTeX, allotment, Zustand, Tailwind CSS, math.js TS+AS+WASM
