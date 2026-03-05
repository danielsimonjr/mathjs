# mathjs-calc

Advanced scientific calculator demo — proof of concept for the math.js TS+AS+WASM library.

## Quick Start

```bash
npm install
npm run electron:dev
```

## Features

- **Scientific Calculator** — Expression parser, 396 functions, angle modes, number types (Number, BigNumber, Complex, Fraction)
- **Matrix Lab** — Visual matrix editor, determinant, inverse, transpose, eigenvalues, trace
- **Signal Studio** — Waveform generator (sine/square/triangle/sawtooth), FFT visualization, spectral analysis
- **Statistics Dashboard** — Data generation (normal/uniform/poisson), descriptive stats, histograms
- **Performance Dashboard** — JS vs WASM benchmark suite with scaling charts

## Engine Modes

- **JS** — Pure JavaScript (baseline)
- **WASM** — WebAssembly acceleration (2-25x faster for large operations)
- **Auto** — Automatically selects best engine based on input size

## Development

```bash
npm run dev          # Vite dev server (web only)
npm run electron:dev # Full Electron app with hot reload
npm run build        # Production build
npm run electron:build # Package for distribution
```

## Tech Stack

Electron 33, React 19, TypeScript, Vite, Zustand, Recharts, Tailwind CSS, math.js TS+AS+WASM
