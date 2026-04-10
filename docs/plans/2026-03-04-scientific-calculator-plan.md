# Scientific Calculator (mathjs-calc) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> **Historical Note:** References to TypeScript and WASM in this plan are historical. The demo (`demo/mathjs-calc/`) is built as a pure JavaScript/React application. TypeScript/WASM acceleration lives in [MathTS](https://github.com/danielsimonjr/MathTS).

**Goal:** Build a production-quality Electron desktop app demonstrating the math.js library across five panels: Scientific Calculator, Matrix Lab, Signal Studio, Statistics Dashboard, and Performance Dashboard.

**Architecture:** Electron 33+ with React 19 renderer bundled by Vite. The math.js `Parser` lives in the renderer for synchronous expression evaluation. Zustand manages shared state (parser, history, config). See `docs/plans/2026-03-04-scientific-calculator-design.md` for the full design.

**Tech Stack:** Electron 33, React 19, TypeScript, Vite, Zustand, Recharts, Tailwind CSS, math.js (local link)

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Electron + React + Vite project

**Files:**
- Create: `demo/mathjs-calc/package.json`
- Create: `demo/mathjs-calc/tsconfig.json`
- Create: `demo/mathjs-calc/vite.config.ts`
- Create: `demo/mathjs-calc/electron/main.ts`
- Create: `demo/mathjs-calc/electron/preload.ts`
- Create: `demo/mathjs-calc/index.html`
- Create: `demo/mathjs-calc/src/main.tsx`
- Create: `demo/mathjs-calc/src/App.tsx`

**Step 1: Create project directory and package.json**

```bash
mkdir -p demo/mathjs-calc
cd demo/mathjs-calc
```

Create `package.json`:

```json
{
  "name": "mathjs-calc",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && tsc -p tsconfig.electron.json",
    "preview": "vite preview",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "dependencies": {
    "mathjs": "file:../../",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^9.1.0",
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "wait-on": "^8.0.0"
  }
}
```

**Step 2: Create tsconfig.json for renderer**

Create `demo/mathjs-calc/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

Create `demo/mathjs-calc/tsconfig.electron.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "dist-electron",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["electron"]
}
```

**Step 3: Create Vite config**

Create `demo/mathjs-calc/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
})
```

**Step 4: Create Electron main process**

Create `demo/mathjs-calc/electron/main.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'mathjs-calc',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
```

**Step 5: Create preload script**

Create `demo/mathjs-calc/electron/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  runWasmOperation: (operation: string, data: unknown) =>
    ipcRenderer.invoke('wasm:run', operation, data),
  getSystemInfo: () => ipcRenderer.invoke('system:info'),
})
```

**Step 6: Create index.html**

Create `demo/mathjs-calc/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mathjs-calc</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 7: Create React entry point**

Create `demo/mathjs-calc/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

Create `demo/mathjs-calc/src/App.tsx`:

```tsx
import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      <h1 className="text-2xl font-bold">mathjs-calc</h1>
      <p className="text-gray-400 mt-2">Scientific Calculator — powered by math.js TS+AS+WASM</p>
    </div>
  )
}
```

Create `demo/mathjs-calc/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 8: Create Tailwind config**

Create `demo/mathjs-calc/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `demo/mathjs-calc/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 9: Install dependencies and verify app launches**

```bash
cd demo/mathjs-calc
npm install
npm run dev
```

Expected: Vite dev server starts at http://localhost:5173, shows "mathjs-calc" heading.

**Step 10: Commit**

```bash
git add demo/mathjs-calc/
git commit -m "feat(demo): scaffold mathjs-calc Electron + React + Vite project"
```

---

### Task 2: Integrate math.js and verify expression evaluation

**Files:**
- Create: `demo/mathjs-calc/src/hooks/useMathParser.ts`
- Modify: `demo/mathjs-calc/src/App.tsx`

**Step 1: Create the math parser hook**

Create `demo/mathjs-calc/src/hooks/useMathParser.ts`:

```typescript
import { useState, useRef, useCallback } from 'react'
import { create, all, type MathJsInstance } from 'mathjs'

interface EvalResult {
  expression: string
  result: string
  type: string
  error: string | null
  timestamp: number
  executionTime: number
}

export function useMathParser() {
  const mathRef = useRef<MathJsInstance>(create(all))
  const parserRef = useRef(mathRef.current.parser())
  const [history, setHistory] = useState<EvalResult[]>([])

  const evaluate = useCallback((expression: string): EvalResult => {
    const start = performance.now()
    let entry: EvalResult

    try {
      const raw = parserRef.current.evaluate(expression)
      const result = mathRef.current.format(raw, { precision: 14 })
      const type = mathRef.current.typeOf(raw)
      entry = {
        expression,
        result,
        type,
        error: null,
        timestamp: Date.now(),
        executionTime: performance.now() - start,
      }
    } catch (err) {
      entry = {
        expression,
        result: '',
        type: 'error',
        error: err instanceof Error ? err.message : String(err),
        timestamp: Date.now(),
        executionTime: performance.now() - start,
      }
    }

    setHistory((prev) => [entry, ...prev])
    return entry
  }, [])

  const clearParser = useCallback(() => {
    parserRef.current.clear()
  }, [])

  const getVariables = useCallback((): Record<string, unknown> => {
    return parserRef.current.getAll()
  }, [])

  return { evaluate, history, clearParser, getVariables, math: mathRef.current }
}
```

**Step 2: Update App.tsx with a basic expression input**

Replace `demo/mathjs-calc/src/App.tsx`:

```tsx
import React, { useState, useCallback } from 'react'
import { useMathParser } from './hooks/useMathParser'

export default function App() {
  const { evaluate, history } = useMathParser()
  const [input, setInput] = useState('')
  const [currentResult, setCurrentResult] = useState<string | null>(null)
  const [currentError, setCurrentError] = useState<string | null>(null)

  const handleEvaluate = useCallback(() => {
    if (!input.trim()) return
    const result = evaluate(input.trim())
    if (result.error) {
      setCurrentError(result.error)
      setCurrentResult(null)
    } else {
      setCurrentResult(result.result)
      setCurrentError(null)
    }
    setInput('')
  }, [input, evaluate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleEvaluate()
    },
    [handleEvaluate]
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-800 p-4">
        <h1 className="text-xl font-bold mb-3">mathjs-calc</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter expression... (e.g., sqrt(3^2 + 4^2))"
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleEvaluate}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
          >
            Evaluate
          </button>
        </div>
        {currentResult && (
          <div className="mt-2 text-green-400 font-mono text-lg">= {currentResult}</div>
        )}
        {currentError && (
          <div className="mt-2 text-red-400 font-mono text-sm">{currentError}</div>
        )}
      </header>

      {/* History */}
      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">History</h2>
        {history.map((entry, i) => (
          <div key={i} className="font-mono text-sm mb-1">
            <span className="text-gray-400">{entry.expression}</span>
            {entry.error ? (
              <span className="text-red-400 ml-2">Error: {entry.error}</span>
            ) : (
              <span className="text-green-400 ml-2">= {entry.result}</span>
            )}
            <span className="text-gray-600 ml-2">({entry.executionTime.toFixed(1)}ms)</span>
          </div>
        ))}
      </main>
    </div>
  )
}
```

**Step 3: Verify math.js integration works**

```bash
cd demo/mathjs-calc
npm run dev
```

In browser at http://localhost:5173, type `sqrt(3^2 + 4^2)` and press Enter.
Expected: Result shows `= 5`.

Try: `x = 42`, then `x * 2` → should show `= 84`.

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): integrate math.js parser with expression input and history"
```

---

## Phase 2: State Management & Layout

### Task 3: Create Zustand store for shared state

**Files:**
- Create: `demo/mathjs-calc/src/store/useStore.ts`
- Create: `demo/mathjs-calc/src/types.ts`

**Step 1: Create shared types**

Create `demo/mathjs-calc/src/types.ts`:

```typescript
export type EngineMode = 'js' | 'wasm' | 'auto'
export type AngleMode = 'deg' | 'rad' | 'grad'
export type NumberType = 'number' | 'BigNumber' | 'Complex' | 'Fraction'
export type PanelId = 'calculator' | 'matrix' | 'signal' | 'statistics' | 'performance'

export interface HistoryEntry {
  id: string
  expression: string
  result: string
  type: string
  error: string | null
  panel: PanelId
  engineUsed: EngineMode
  executionTime: number
  timestamp: number
}

export interface BenchmarkResult {
  operation: string
  category: string
  size: number
  jsTime: number
  wasmTime: number
  speedup: number
}

export interface WasmCapabilities {
  wasmAvailable: boolean
  simdAvailable: boolean
  parallelAvailable: boolean
  coreCount: number
}

export interface AppConfig {
  angleMode: AngleMode
  numberType: NumberType
  precision: number
  engine: EngineMode
}
```

**Step 2: Create Zustand store**

Create `demo/mathjs-calc/src/store/useStore.ts`:

```typescript
import { create } from 'zustand'
import type { AppConfig, HistoryEntry, PanelId, WasmCapabilities, EngineMode } from '../types'

interface AppState {
  // Navigation
  activePanel: PanelId
  setActivePanel: (panel: PanelId) => void

  // Config
  config: AppConfig
  setEngine: (engine: EngineMode) => void
  setConfig: (partial: Partial<AppConfig>) => void

  // History
  history: HistoryEntry[]
  addHistory: (entry: HistoryEntry) => void
  clearHistory: () => void

  // WASM
  wasmCapabilities: WasmCapabilities | null
  setWasmCapabilities: (caps: WasmCapabilities) => void

  // Benchmarks
  benchmarkInline: boolean
  toggleBenchmarkInline: () => void
}

export const useStore = create<AppState>((set) => ({
  activePanel: 'calculator',
  setActivePanel: (panel) => set({ activePanel: panel }),

  config: {
    angleMode: 'rad',
    numberType: 'number',
    precision: 14,
    engine: 'auto',
  },
  setEngine: (engine) =>
    set((state) => ({ config: { ...state.config, engine } })),
  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  history: [],
  addHistory: (entry) =>
    set((state) => ({ history: [entry, ...state.history].slice(0, 500) })),
  clearHistory: () => set({ history: [] }),

  wasmCapabilities: null,
  setWasmCapabilities: (caps) => set({ wasmCapabilities: caps }),

  benchmarkInline: false,
  toggleBenchmarkInline: () =>
    set((state) => ({ benchmarkInline: !state.benchmarkInline })),
}))
```

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/types.ts demo/mathjs-calc/src/store/
git commit -m "feat(demo): add Zustand store and shared type definitions"
```

---

### Task 4: Build tabbed panel layout

**Files:**
- Create: `demo/mathjs-calc/src/components/TabBar.tsx`
- Create: `demo/mathjs-calc/src/components/EngineToggle.tsx`
- Create: `demo/mathjs-calc/src/components/ExpressionBar.tsx`
- Create: `demo/mathjs-calc/src/panels/CalculatorPanel.tsx`
- Create: `demo/mathjs-calc/src/panels/MatrixLabPanel.tsx`
- Create: `demo/mathjs-calc/src/panels/SignalStudioPanel.tsx`
- Create: `demo/mathjs-calc/src/panels/StatisticsPanel.tsx`
- Create: `demo/mathjs-calc/src/panels/PerformancePanel.tsx`
- Modify: `demo/mathjs-calc/src/App.tsx`

**Step 1: Create TabBar component**

Create `demo/mathjs-calc/src/components/TabBar.tsx`:

```tsx
import React from 'react'
import { useStore } from '../store/useStore'
import type { PanelId } from '../types'

const tabs: { id: PanelId; label: string; icon: string }[] = [
  { id: 'calculator', label: 'Calculator', icon: '🔢' },
  { id: 'matrix', label: 'Matrix Lab', icon: '▦' },
  { id: 'signal', label: 'Signal Studio', icon: '〰' },
  { id: 'statistics', label: 'Statistics', icon: '📊' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
]

export function TabBar() {
  const { activePanel, setActivePanel } = useStore()

  return (
    <nav className="flex border-b border-gray-800 bg-gray-900">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActivePanel(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activePanel === tab.id
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-950'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <span className="mr-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
```

**Step 2: Create EngineToggle component**

Create `demo/mathjs-calc/src/components/EngineToggle.tsx`:

```tsx
import React from 'react'
import { useStore } from '../store/useStore'
import type { EngineMode } from '../types'

const engines: { id: EngineMode; label: string }[] = [
  { id: 'js', label: 'JS' },
  { id: 'wasm', label: 'WASM' },
  { id: 'auto', label: 'Auto' },
]

export function EngineToggle() {
  const { config, setEngine, wasmCapabilities } = useStore()

  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded p-0.5">
      {engines.map((eng) => (
        <button
          key={eng.id}
          onClick={() => setEngine(eng.id)}
          disabled={eng.id === 'wasm' && !wasmCapabilities?.wasmAvailable}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            config.engine === eng.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {eng.label}
        </button>
      ))}
    </div>
  )
}
```

**Step 3: Create ExpressionBar component**

Create `demo/mathjs-calc/src/components/ExpressionBar.tsx`:

```tsx
import React, { useState, useCallback } from 'react'
import { useMathParser } from '../hooks/useMathParser'
import { EngineToggle } from './EngineToggle'

export function ExpressionBar() {
  const { evaluate } = useMathParser()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEvaluate = useCallback(() => {
    if (!input.trim()) return
    const entry = evaluate(input.trim())
    if (entry.error) {
      setError(entry.error)
      setResult(null)
    } else {
      setResult(entry.result)
      setError(null)
    }
    setInput('')
  }, [input, evaluate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleEvaluate()
    },
    [handleEvaluate]
  )

  return (
    <header className="border-b border-gray-800 p-3 bg-gray-900">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter expression... (e.g., sin(pi/4), det([[1,2],[3,4]]))"
          className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleEvaluate}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
        >
          =
        </button>
        <EngineToggle />
      </div>
      {result && <div className="mt-1 text-green-400 font-mono text-lg">= {result}</div>}
      {error && <div className="mt-1 text-red-400 font-mono text-sm">{error}</div>}
    </header>
  )
}
```

**Step 4: Create placeholder panels**

Create `demo/mathjs-calc/src/panels/CalculatorPanel.tsx`:

```tsx
import React from 'react'

export function CalculatorPanel() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Scientific Calculator</h2>
      <p className="text-gray-400">Calculator button grid — coming in Task 5</p>
    </div>
  )
}
```

Create `demo/mathjs-calc/src/panels/MatrixLabPanel.tsx`:

```tsx
import React from 'react'

export function MatrixLabPanel() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Matrix Lab</h2>
      <p className="text-gray-400">Matrix editor and operations — coming in Task 7</p>
    </div>
  )
}
```

Create `demo/mathjs-calc/src/panels/SignalStudioPanel.tsx`:

```tsx
import React from 'react'

export function SignalStudioPanel() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Signal Studio</h2>
      <p className="text-gray-400">FFT and signal processing — coming in Task 8</p>
    </div>
  )
}
```

Create `demo/mathjs-calc/src/panels/StatisticsPanel.tsx`:

```tsx
import React from 'react'

export function StatisticsPanel() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Statistics Dashboard</h2>
      <p className="text-gray-400">Descriptive statistics and histograms — coming in Task 9</p>
    </div>
  )
}
```

Create `demo/mathjs-calc/src/panels/PerformancePanel.tsx`:

```tsx
import React from 'react'

export function PerformancePanel() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Performance Dashboard</h2>
      <p className="text-gray-400">JS vs WASM benchmarks — coming in Task 10</p>
    </div>
  )
}
```

**Step 5: Wire up App.tsx with layout**

Replace `demo/mathjs-calc/src/App.tsx`:

```tsx
import React from 'react'
import { useStore } from './store/useStore'
import { ExpressionBar } from './components/ExpressionBar'
import { TabBar } from './components/TabBar'
import { CalculatorPanel } from './panels/CalculatorPanel'
import { MatrixLabPanel } from './panels/MatrixLabPanel'
import { SignalStudioPanel } from './panels/SignalStudioPanel'
import { StatisticsPanel } from './panels/StatisticsPanel'
import { PerformancePanel } from './panels/PerformancePanel'

const panels = {
  calculator: CalculatorPanel,
  matrix: MatrixLabPanel,
  signal: SignalStudioPanel,
  statistics: StatisticsPanel,
  performance: PerformancePanel,
} as const

export default function App() {
  const activePanel = useStore((s) => s.activePanel)
  const ActivePanel = panels[activePanel]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <ExpressionBar />
      <TabBar />
      <main className="flex-1 overflow-y-auto">
        <ActivePanel />
      </main>
    </div>
  )
}
```

**Step 6: Verify layout renders with tab switching**

```bash
cd demo/mathjs-calc && npm run dev
```

Expected: Expression bar at top, 5 tabs below, clicking tabs switches panel content.

**Step 7: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): add tabbed panel layout with expression bar and engine toggle"
```

---

## Phase 3: Calculator Panel

### Task 5: Build scientific calculator button grid

**Files:**
- Create: `demo/mathjs-calc/src/components/CalcButton.tsx`
- Create: `demo/mathjs-calc/src/components/CalcHistory.tsx`
- Modify: `demo/mathjs-calc/src/panels/CalculatorPanel.tsx`

**Step 1: Create CalcButton component**

Create `demo/mathjs-calc/src/components/CalcButton.tsx`:

```tsx
import React from 'react'

interface CalcButtonProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'operator' | 'function' | 'constant' | 'action'
  span?: number
}

const variantStyles = {
  default: 'bg-gray-800 hover:bg-gray-700 text-gray-100',
  operator: 'bg-gray-700 hover:bg-gray-600 text-blue-300',
  function: 'bg-gray-800 hover:bg-gray-700 text-yellow-300',
  constant: 'bg-gray-800 hover:bg-gray-700 text-purple-300',
  action: 'bg-blue-600 hover:bg-blue-700 text-white',
}

export function CalcButton({ label, onClick, variant = 'default', span = 1 }: CalcButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${variantStyles[variant]} rounded p-2 text-sm font-mono font-medium transition-colors active:scale-95`}
      style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}
    >
      {label}
    </button>
  )
}
```

**Step 2: Create CalcHistory component**

Create `demo/mathjs-calc/src/components/CalcHistory.tsx`:

```tsx
import React from 'react'
import type { HistoryEntry } from '../types'

interface CalcHistoryProps {
  history: HistoryEntry[]
  onSelect: (expression: string) => void
}

export function CalcHistory({ history, onSelect }: CalcHistoryProps) {
  const calcHistory = history.filter((h) => h.panel === 'calculator')

  if (calcHistory.length === 0) {
    return <p className="text-gray-600 text-sm italic">No history yet</p>
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {calcHistory.map((entry) => (
        <button
          key={entry.id}
          onClick={() => onSelect(entry.expression)}
          className="block w-full text-left font-mono text-sm hover:bg-gray-800 rounded px-2 py-1"
        >
          <span className="text-gray-400">{entry.expression}</span>
          {entry.error ? (
            <span className="text-red-400 ml-2">Error</span>
          ) : (
            <span className="text-green-400 ml-2">= {entry.result}</span>
          )}
        </button>
      ))}
    </div>
  )
}
```

**Step 3: Build the full CalculatorPanel**

Replace `demo/mathjs-calc/src/panels/CalculatorPanel.tsx`:

```tsx
import React, { useState, useCallback } from 'react'
import { CalcButton } from '../components/CalcButton'
import { CalcHistory } from '../components/CalcHistory'
import { useStore } from '../store/useStore'
import { useMathParser } from '../hooks/useMathParser'

export function CalculatorPanel() {
  const { evaluate } = useMathParser()
  const { history, config, setConfig } = useStore()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const append = useCallback((text: string) => {
    setInput((prev) => prev + text)
  }, [])

  const handleEvaluate = useCallback(() => {
    if (!input.trim()) return
    const entry = evaluate(input.trim())
    if (entry.error) {
      setError(entry.error)
      setResult(null)
    } else {
      setResult(entry.result)
      setError(null)
    }
  }, [input, evaluate])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setError(null)
  }, [])

  const handleBackspace = useCallback(() => {
    setInput((prev) => prev.slice(0, -1))
  }, [])

  return (
    <div className="p-4 flex gap-4">
      {/* Left: calculator */}
      <div className="flex-1 max-w-lg">
        {/* Display */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3">
          <div className="font-mono text-sm text-gray-400 min-h-[1.5rem]">{input || ' '}</div>
          {result && <div className="font-mono text-xl text-green-400">= {result}</div>}
          {error && <div className="font-mono text-sm text-red-400">{error}</div>}
        </div>

        {/* Angle mode toggle */}
        <div className="flex gap-1 mb-3">
          {(['deg', 'rad', 'grad'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setConfig({ angleMode: mode })}
              className={`px-3 py-1 text-xs rounded ${
                config.angleMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Button grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {/* Row 1: Functions */}
          <CalcButton label="sin" onClick={() => append('sin(')} variant="function" />
          <CalcButton label="cos" onClick={() => append('cos(')} variant="function" />
          <CalcButton label="tan" onClick={() => append('tan(')} variant="function" />
          <CalcButton label="log" onClick={() => append('log(')} variant="function" />
          <CalcButton label="ln" onClick={() => append('log(')} variant="function" />

          {/* Row 2: Inverse trig + powers */}
          <CalcButton label="asin" onClick={() => append('asin(')} variant="function" />
          <CalcButton label="acos" onClick={() => append('acos(')} variant="function" />
          <CalcButton label="atan" onClick={() => append('atan(')} variant="function" />
          <CalcButton label="sqrt" onClick={() => append('sqrt(')} variant="function" />
          <CalcButton label="x^y" onClick={() => append('^')} variant="operator" />

          {/* Row 3: Constants + parens */}
          <CalcButton label="pi" onClick={() => append('pi')} variant="constant" />
          <CalcButton label="e" onClick={() => append('e')} variant="constant" />
          <CalcButton label="(" onClick={() => append('(')} variant="operator" />
          <CalcButton label=")" onClick={() => append(')')} variant="operator" />
          <CalcButton label="%" onClick={() => append('%')} variant="operator" />

          {/* Row 4: 7-9, del, clear */}
          <CalcButton label="7" onClick={() => append('7')} />
          <CalcButton label="8" onClick={() => append('8')} />
          <CalcButton label="9" onClick={() => append('9')} />
          <CalcButton label="DEL" onClick={handleBackspace} variant="action" />
          <CalcButton label="AC" onClick={handleClear} variant="action" />

          {/* Row 5: 4-6, *, / */}
          <CalcButton label="4" onClick={() => append('4')} />
          <CalcButton label="5" onClick={() => append('5')} />
          <CalcButton label="6" onClick={() => append('6')} />
          <CalcButton label="*" onClick={() => append(' * ')} variant="operator" />
          <CalcButton label="/" onClick={() => append(' / ')} variant="operator" />

          {/* Row 6: 1-3, +, - */}
          <CalcButton label="1" onClick={() => append('1')} />
          <CalcButton label="2" onClick={() => append('2')} />
          <CalcButton label="3" onClick={() => append('3')} />
          <CalcButton label="+" onClick={() => append(' + ')} variant="operator" />
          <CalcButton label="-" onClick={() => append(' - ')} variant="operator" />

          {/* Row 7: 0, ., !, =, ans */}
          <CalcButton label="0" onClick={() => append('0')} />
          <CalcButton label="." onClick={() => append('.')} />
          <CalcButton label="!" onClick={() => append('!')} variant="operator" />
          <CalcButton label="=" onClick={handleEvaluate} variant="action" span={2} />
        </div>
      </div>

      {/* Right: history */}
      <div className="w-72">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">History</h3>
        <CalcHistory
          history={history}
          onSelect={(expr) => {
            setInput(expr)
            setResult(null)
            setError(null)
          }}
        />
      </div>
    </div>
  )
}
```

**Step 4: Verify calculator works**

```bash
cd demo/mathjs-calc && npm run dev
```

Expected: Calculator tab shows button grid. Click `sin` `pi` `/` `4` `)` `=` → result shows `= 0.7071067811865476`.

**Step 5: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): build scientific calculator panel with button grid and history"
```

---

### Task 6: Add number type selector and unit conversion

**Files:**
- Create: `demo/mathjs-calc/src/components/NumberTypeSelector.tsx`
- Modify: `demo/mathjs-calc/src/panels/CalculatorPanel.tsx`

**Step 1: Create NumberTypeSelector**

Create `demo/mathjs-calc/src/components/NumberTypeSelector.tsx`:

```tsx
import React from 'react'
import { useStore } from '../store/useStore'
import type { NumberType } from '../types'

const types: { id: NumberType; label: string; description: string }[] = [
  { id: 'number', label: 'Number', description: 'Standard IEEE 754' },
  { id: 'BigNumber', label: 'BigNum', description: 'Arbitrary precision' },
  { id: 'Complex', label: 'Complex', description: 'a + bi' },
  { id: 'Fraction', label: 'Fraction', description: 'Exact rationals' },
]

export function NumberTypeSelector() {
  const { config, setConfig } = useStore()

  return (
    <div className="flex gap-1">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => setConfig({ numberType: t.id })}
          title={t.description}
          className={`px-2 py-1 text-xs rounded ${
            config.numberType === t.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Add to CalculatorPanel (below angle mode toggle)**

In `demo/mathjs-calc/src/panels/CalculatorPanel.tsx`, add the import and insert `<NumberTypeSelector />` after the angle mode toggle div.

**Step 3: Verify unit conversion works via expression bar**

Type `5 km in miles` → should show `= 3.106855...`
Type `32 degF in degC` → should show `= 0 degC`

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): add number type selector and verify unit conversion"
```

---

## Phase 4: Matrix Lab Panel

### Task 7: Build Matrix Lab with editor and operations

**Files:**
- Create: `demo/mathjs-calc/src/components/MatrixEditor.tsx`
- Create: `demo/mathjs-calc/src/components/MatrixDisplay.tsx`
- Create: `demo/mathjs-calc/src/hooks/useMatrixOps.ts`
- Modify: `demo/mathjs-calc/src/panels/MatrixLabPanel.tsx`

**Step 1: Create MatrixEditor**

Create `demo/mathjs-calc/src/components/MatrixEditor.tsx`:

```tsx
import React, { useState, useCallback } from 'react'

interface MatrixEditorProps {
  label: string
  onMatrixChange: (data: number[][]) => void
}

export function MatrixEditor({ label, onMatrixChange }: MatrixEditorProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [cells, setCells] = useState<number[][]>(
    Array.from({ length: 3 }, () => Array(3).fill(0))
  )

  const updateCell = useCallback(
    (r: number, c: number, value: string) => {
      const newCells = cells.map((row) => [...row])
      newCells[r][c] = parseFloat(value) || 0
      setCells(newCells)
      onMatrixChange(newCells)
    },
    [cells, onMatrixChange]
  )

  const resize = useCallback(
    (newRows: number, newCols: number) => {
      newRows = Math.max(1, Math.min(newRows, 100))
      newCols = Math.max(1, Math.min(newCols, 100))
      const newCells = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) => (cells[r]?.[c] ?? 0))
      )
      setRows(newRows)
      setCols(newCols)
      setCells(newCells)
      onMatrixChange(newCells)
    },
    [cells, onMatrixChange]
  )

  const randomize = useCallback(() => {
    const newCells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.round(Math.random() * 20 - 10))
    )
    setCells(newCells)
    onMatrixChange(newCells)
  }, [rows, cols, onMatrixChange])

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-400">{label}</span>
        <input
          type="number"
          value={rows}
          onChange={(e) => resize(parseInt(e.target.value) || 1, cols)}
          className="w-12 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-center"
          min={1}
          max={100}
        />
        <span className="text-gray-500">x</span>
        <input
          type="number"
          value={cols}
          onChange={(e) => resize(rows, parseInt(e.target.value) || 1)}
          className="w-12 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-center"
          min={1}
          max={100}
        />
        <button
          onClick={randomize}
          className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-gray-400"
        >
          Random
        </button>
      </div>
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 3.5rem)` }}>
        {cells.map((row, r) =>
          row.map((val, c) => (
            <input
              key={`${r}-${c}`}
              type="number"
              value={val}
              onChange={(e) => updateCell(r, c, e.target.value)}
              className="w-14 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-xs text-center font-mono focus:border-blue-500 focus:outline-none"
            />
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create MatrixDisplay**

Create `demo/mathjs-calc/src/components/MatrixDisplay.tsx`:

```tsx
import React from 'react'

interface MatrixDisplayProps {
  data: number[][] | number[] | null
  label: string
  precision?: number
}

export function MatrixDisplay({ data, label, precision = 4 }: MatrixDisplayProps) {
  if (!data) return null

  const is2d = Array.isArray(data[0])
  const rows = is2d ? (data as number[][]) : [data as number[]]

  return (
    <div>
      <span className="text-sm font-semibold text-gray-400">{label}</span>
      <div className="mt-1 inline-block border border-gray-700 rounded overflow-hidden">
        <table className="border-collapse">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((val, c) => (
                  <td
                    key={c}
                    className="px-2 py-1 text-xs font-mono text-right border border-gray-800 bg-gray-900"
                  >
                    {typeof val === 'number' ? val.toFixed(precision) : String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 3: Create matrix operations hook**

Create `demo/mathjs-calc/src/hooks/useMatrixOps.ts`:

```typescript
import { useCallback } from 'react'
import { useMathParser } from './useMathParser'

interface MatrixResult {
  name: string
  value: unknown
  formatted: string
  executionTime: number
  error: string | null
}

export function useMatrixOps() {
  const { math } = useMathParser()

  const runOperation = useCallback(
    (operation: string, matrixData: number[][]): MatrixResult => {
      const start = performance.now()
      try {
        const M = math.matrix(matrixData)
        let result: unknown
        let name = operation

        switch (operation) {
          case 'det':
            result = math.det(M)
            break
          case 'inv':
            result = math.inv(M)
            break
          case 'transpose':
            result = math.transpose(M)
            break
          case 'eigs': {
            const e = math.eigs(M)
            result = e.values
            name = 'eigenvalues'
            break
          }
          case 'trace':
            result = math.trace(M)
            break
          default:
            throw new Error(`Unknown operation: ${operation}`)
        }

        return {
          name,
          value: result,
          formatted: math.format(result, { precision: 6 }),
          executionTime: performance.now() - start,
          error: null,
        }
      } catch (err) {
        return {
          name: operation,
          value: null,
          formatted: '',
          executionTime: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        }
      }
    },
    [math]
  )

  return { runOperation }
}
```

**Step 4: Build MatrixLabPanel**

Replace `demo/mathjs-calc/src/panels/MatrixLabPanel.tsx`:

```tsx
import React, { useState, useCallback } from 'react'
import { MatrixEditor } from '../components/MatrixEditor'
import { useMatrixOps } from '../hooks/useMatrixOps'

const operations = [
  { id: 'det', label: 'Determinant' },
  { id: 'inv', label: 'Inverse' },
  { id: 'transpose', label: 'Transpose' },
  { id: 'eigs', label: 'Eigenvalues' },
  { id: 'trace', label: 'Trace' },
]

export function MatrixLabPanel() {
  const { runOperation } = useMatrixOps()
  const [matrixData, setMatrixData] = useState<number[][]>([
    [1, 2],
    [3, 4],
  ])
  const [results, setResults] = useState<
    { name: string; formatted: string; executionTime: number; error: string | null }[]
  >([])

  const handleRun = useCallback(
    (op: string) => {
      const result = runOperation(op, matrixData)
      setResults((prev) => [result, ...prev])
    },
    [matrixData, runOperation]
  )

  return (
    <div className="p-4 flex gap-6">
      {/* Left: editor + operations */}
      <div>
        <MatrixEditor label="Matrix A" onMatrixChange={setMatrixData} />

        <div className="mt-4 flex flex-wrap gap-2">
          {operations.map((op) => (
            <button
              key={op.id}
              onClick={() => handleRun(op.id)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm text-gray-200"
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: results */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Results</h3>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-400">{r.name}</span>
                <span className="text-xs text-gray-500">{r.executionTime.toFixed(2)}ms</span>
              </div>
              {r.error ? (
                <div className="text-sm text-red-400 mt-1">{r.error}</div>
              ) : (
                <pre className="text-sm font-mono text-green-400 mt-1 whitespace-pre-wrap">
                  {r.formatted}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Verify matrix operations work**

Click Matrix Lab tab. Enter a 2x2 matrix. Click "Determinant" → should show `-2`.
Click "Eigenvalues" → should show eigenvalues of [[1,2],[3,4]].

**Step 6: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): build Matrix Lab panel with editor and linear algebra operations"
```

---

## Phase 5: Signal Studio Panel

### Task 8: Build Signal Studio with FFT visualization

**Files:**
- Create: `demo/mathjs-calc/src/hooks/useSignal.ts`
- Modify: `demo/mathjs-calc/src/panels/SignalStudioPanel.tsx`

**Step 1: Create signal generation hook**

Create `demo/mathjs-calc/src/hooks/useSignal.ts`:

```typescript
import { useCallback } from 'react'
import { useMathParser } from './useMathParser'

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth'

interface SignalParams {
  waveform: WaveformType
  frequency: number
  amplitude: number
  sampleCount: number
}

interface SignalResult {
  timeDomain: { x: number; y: number }[]
  freqDomain: { freq: number; magnitude: number }[]
  executionTime: number
}

export function useSignal() {
  const { math } = useMathParser()

  const generate = useCallback(
    (params: SignalParams): SignalResult => {
      const { waveform, frequency, amplitude, sampleCount } = params
      const start = performance.now()

      // Generate time-domain signal
      const signal: number[] = []
      const sampleRate = sampleCount
      for (let i = 0; i < sampleCount; i++) {
        const t = i / sampleRate
        let y: number
        const phase = 2 * Math.PI * frequency * t

        switch (waveform) {
          case 'sine':
            y = amplitude * Math.sin(phase)
            break
          case 'square':
            y = amplitude * Math.sign(Math.sin(phase))
            break
          case 'triangle':
            y = amplitude * (2 / Math.PI) * Math.asin(Math.sin(phase))
            break
          case 'sawtooth':
            y = amplitude * (2 * (frequency * t - Math.floor(0.5 + frequency * t)))
            break
          default:
            y = 0
        }
        signal.push(y)
      }

      // Run FFT using math.js
      const complexSignal = signal.map((v) => math.complex(v, 0))
      const fftResult = math.fft(complexSignal) as any[]

      // Convert to magnitude spectrum
      const timeDomain = signal.map((y, i) => ({ x: i / sampleRate, y }))
      const freqDomain = fftResult
        .slice(0, Math.floor(sampleCount / 2))
        .map((c: any, i: number) => ({
          freq: (i * sampleRate) / sampleCount,
          magnitude: math.abs(c) as number,
        }))

      return {
        timeDomain,
        freqDomain,
        executionTime: performance.now() - start,
      }
    },
    [math]
  )

  return { generate }
}
```

**Step 2: Build SignalStudioPanel with charts**

Replace `demo/mathjs-calc/src/panels/SignalStudioPanel.tsx`:

```tsx
import React, { useState, useCallback, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { useSignal, type WaveformType } from '../hooks/useSignal'

const waveforms: { id: WaveformType; label: string }[] = [
  { id: 'sine', label: 'Sine' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'sawtooth', label: 'Sawtooth' },
]

const sampleCounts = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]

export function SignalStudioPanel() {
  const { generate } = useSignal()
  const [waveform, setWaveform] = useState<WaveformType>('sine')
  const [frequency, setFrequency] = useState(5)
  const [amplitude, setAmplitude] = useState(1)
  const [sampleCount, setSampleCount] = useState(1024)
  const [execTime, setExecTime] = useState<number | null>(null)

  const result = useMemo(() => {
    const r = generate({ waveform, frequency, amplitude, sampleCount })
    setExecTime(r.executionTime)
    return r
  }, [waveform, frequency, amplitude, sampleCount, generate])

  // Downsample time domain for rendering (max 500 points)
  const displayTimeDomain = useMemo(() => {
    if (result.timeDomain.length <= 500) return result.timeDomain
    const step = Math.ceil(result.timeDomain.length / 500)
    return result.timeDomain.filter((_, i) => i % step === 0)
  }, [result.timeDomain])

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Waveform</label>
          <div className="flex gap-1">
            {waveforms.map((w) => (
              <button
                key={w.id}
                onClick={() => setWaveform(w.id)}
                className={`px-3 py-1 text-xs rounded ${
                  waveform === w.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Frequency: {frequency} Hz
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            className="w-32"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Amplitude: {amplitude.toFixed(1)}
          </label>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Samples</label>
          <select
            value={sampleCount}
            onChange={(e) => setSampleCount(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
          >
            {sampleCounts.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {execTime !== null && (
          <span className="text-xs text-gray-500">FFT: {execTime.toFixed(1)}ms</span>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time domain */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Time Domain</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={displayTimeDomain}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#666' }} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
              />
              <Line type="monotone" dataKey="y" stroke="#60a5fa" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Frequency domain */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Frequency Spectrum (FFT)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={result.freqDomain.slice(0, 200)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="freq" tick={{ fontSize: 10, fill: '#666' }} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
              />
              <Line
                type="monotone"
                dataKey="magnitude"
                stroke="#34d399"
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Verify FFT visualization**

Switch to Signal Studio tab. Should see sine wave on left, frequency spike at 5 Hz on right.
Change to "Square" waveform → spectrum shows odd harmonics.
Increase sample count to 16384 → note execution time increase.

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): build Signal Studio panel with waveform generator and FFT visualization"
```

---

## Phase 6: Statistics Dashboard Panel

### Task 9: Build Statistics Dashboard with histogram

**Files:**
- Create: `demo/mathjs-calc/src/hooks/useStatistics.ts`
- Modify: `demo/mathjs-calc/src/panels/StatisticsPanel.tsx`

**Step 1: Create statistics hook**

Create `demo/mathjs-calc/src/hooks/useStatistics.ts`:

```typescript
import { useCallback } from 'react'
import { useMathParser } from './useMathParser'

export type Distribution = 'normal' | 'uniform' | 'poisson'

interface DescriptiveStats {
  count: number
  mean: number
  median: number
  std: number
  variance: number
  min: number
  max: number
  q1: number
  q3: number
  executionTime: number
}

interface HistogramBin {
  binStart: number
  binEnd: number
  count: number
  label: string
}

export function useStatistics() {
  const { math } = useMathParser()

  const generateData = useCallback(
    (distribution: Distribution, size: number): number[] => {
      const data: number[] = []
      for (let i = 0; i < size; i++) {
        switch (distribution) {
          case 'normal': {
            // Box-Muller transform
            const u1 = Math.random()
            const u2 = Math.random()
            data.push(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2))
            break
          }
          case 'uniform':
            data.push(Math.random() * 10 - 5)
            break
          case 'poisson': {
            const lambda = 5
            let L = Math.exp(-lambda)
            let k = 0
            let p = 1
            do {
              k++
              p *= Math.random()
            } while (p > L)
            data.push(k - 1)
            break
          }
        }
      }
      return data
    },
    []
  )

  const computeStats = useCallback(
    (data: number[]): DescriptiveStats => {
      const start = performance.now()
      const sorted = [...data].sort((a, b) => a - b)
      const n = data.length
      const q1Idx = Math.floor(n * 0.25)
      const q3Idx = Math.floor(n * 0.75)

      return {
        count: n,
        mean: math.mean(data) as number,
        median: math.median(data) as number,
        std: math.std(data) as number,
        variance: math.variance(data) as number,
        min: math.min(data) as number,
        max: math.max(data) as number,
        q1: sorted[q1Idx],
        q3: sorted[q3Idx],
        executionTime: performance.now() - start,
      }
    },
    [math]
  )

  const computeHistogram = useCallback(
    (data: number[], binCount: number): HistogramBin[] => {
      const min = math.min(data) as number
      const max = math.max(data) as number
      const binWidth = (max - min) / binCount
      const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
        binStart: min + i * binWidth,
        binEnd: min + (i + 1) * binWidth,
        count: 0,
        label: (min + (i + 0.5) * binWidth).toFixed(1),
      }))

      for (const val of data) {
        let idx = Math.floor((val - min) / binWidth)
        if (idx >= binCount) idx = binCount - 1
        if (idx < 0) idx = 0
        bins[idx].count++
      }

      return bins
    },
    [math]
  )

  return { generateData, computeStats, computeHistogram }
}
```

**Step 2: Build StatisticsPanel**

Replace `demo/mathjs-calc/src/panels/StatisticsPanel.tsx`:

```tsx
import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useStatistics, type Distribution } from '../hooks/useStatistics'

const distributions: { id: Distribution; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'uniform', label: 'Uniform' },
  { id: 'poisson', label: 'Poisson' },
]

const dataSizes = [100, 1000, 10000, 100000, 1000000]

export function StatisticsPanel() {
  const { generateData, computeStats, computeHistogram } = useStatistics()
  const [distribution, setDistribution] = useState<Distribution>('normal')
  const [dataSize, setDataSize] = useState(10000)
  const [binCount, setBinCount] = useState(30)
  const [seed, setSeed] = useState(0) // force regeneration

  const data = useMemo(
    () => generateData(distribution, dataSize),
    [distribution, dataSize, seed, generateData]
  )

  const stats = useMemo(() => computeStats(data), [data, computeStats])
  const histogram = useMemo(
    () => computeHistogram(data, binCount),
    [data, binCount, computeHistogram]
  )

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Distribution</label>
          <div className="flex gap-1">
            {distributions.map((d) => (
              <button
                key={d.id}
                onClick={() => setDistribution(d.id)}
                className={`px-3 py-1 text-xs rounded ${
                  distribution === d.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Dataset Size</label>
          <select
            value={dataSize}
            onChange={(e) => setDataSize(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
          >
            {dataSizes.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Bins: {binCount}</label>
          <input
            type="range"
            min={5}
            max={100}
            value={binCount}
            onChange={(e) => setBinCount(parseInt(e.target.value))}
            className="w-32"
          />
        </div>

        <button
          onClick={() => setSeed((s) => s + 1)}
          className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-xs text-gray-400"
        >
          Regenerate
        </button>

        <span className="text-xs text-gray-500">Computed in {stats.executionTime.toFixed(1)}ms</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Descriptive Statistics</h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(stats)
                .filter(([k]) => k !== 'executionTime')
                .map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-800">
                    <td className="py-1 text-gray-400 capitalize">{key}</td>
                    <td className="py-1 text-right font-mono text-green-400">
                      {typeof val === 'number' ? val.toFixed(4) : String(val)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Histogram */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Histogram</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#666' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
              />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Verify statistics panel**

Switch to Statistics tab. Should show normal distribution histogram with stats table.
Change to Uniform → histogram should flatten.
Set dataset to 1M → note computation time increase.

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): build Statistics Dashboard with histogram and descriptive stats"
```

---

## Phase 7: Performance Dashboard

### Task 10: Build Performance Dashboard with benchmark suite

**Files:**
- Create: `demo/mathjs-calc/src/hooks/useBenchmark.ts`
- Modify: `demo/mathjs-calc/src/panels/PerformancePanel.tsx`

**Step 1: Create benchmark hook**

Create `demo/mathjs-calc/src/hooks/useBenchmark.ts`:

```typescript
import { useState, useCallback } from 'react'
import { useMathParser } from './useMathParser'
import type { BenchmarkResult } from '../types'

interface BenchmarkConfig {
  category: string
  operation: string
  sizes: number[]
  runner: (math: any, size: number) => void
}

const benchmarks: BenchmarkConfig[] = [
  {
    category: 'Matrix',
    operation: 'Multiply (NxN)',
    sizes: [10, 50, 100, 200, 500],
    runner: (math, n) => {
      const A = math.random([n, n])
      const B = math.random([n, n])
      math.multiply(A, B)
    },
  },
  {
    category: 'Matrix',
    operation: 'Determinant (NxN)',
    sizes: [10, 50, 100, 200],
    runner: (math, n) => {
      const A = math.random([n, n])
      math.det(A)
    },
  },
  {
    category: 'Matrix',
    operation: 'Inverse (NxN)',
    sizes: [10, 50, 100, 200],
    runner: (math, n) => {
      const A = math.random([n, n])
      math.inv(A)
    },
  },
  {
    category: 'Signal',
    operation: 'FFT',
    sizes: [256, 1024, 4096, 16384],
    runner: (math, n) => {
      const signal = Array.from({ length: n }, (_, i) =>
        math.complex(Math.sin(2 * Math.PI * 5 * i / n), 0)
      )
      math.fft(signal)
    },
  },
  {
    category: 'Statistics',
    operation: 'Mean + Variance',
    sizes: [1000, 10000, 100000, 1000000],
    runner: (math, n) => {
      const data = Array.from({ length: n }, () => Math.random())
      math.mean(data)
      math.variance(data)
    },
  },
]

export function useBenchmark() {
  const { math } = useMathParser()
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const runAll = useCallback(async () => {
    setRunning(true)
    setResults([])
    const allResults: BenchmarkResult[] = []

    let total = benchmarks.reduce((sum, b) => sum + b.sizes.length, 0)
    let done = 0

    for (const bench of benchmarks) {
      for (const size of bench.sizes) {
        // Run with JS engine timing
        const start = performance.now()
        try {
          bench.runner(math, size)
        } catch {
          // skip if operation fails at this size
          done++
          setProgress(done / total)
          continue
        }
        const jsTime = performance.now() - start

        // For now, WASM time is estimated (actual WASM integration in Task 11)
        const wasmTime = jsTime // placeholder — same as JS until WASM is wired
        const speedup = jsTime / wasmTime

        const result: BenchmarkResult = {
          operation: bench.operation,
          category: bench.category,
          size,
          jsTime,
          wasmTime,
          speedup,
        }

        allResults.push(result)
        setResults([...allResults])
        done++
        setProgress(done / total)

        // Yield to UI between benchmarks
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    setRunning(false)
    setProgress(1)
  }, [math])

  return { results, running, progress, runAll }
}
```

**Step 2: Build PerformancePanel**

Replace `demo/mathjs-calc/src/panels/PerformancePanel.tsx`:

```tsx
import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useBenchmark } from '../hooks/useBenchmark'
import { useStore } from '../store/useStore'

export function PerformancePanel() {
  const { results, running, progress, runAll } = useBenchmark()
  const wasmCaps = useStore((s) => s.wasmCapabilities)

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>()
    for (const r of results) {
      const key = `${r.category}: ${r.operation}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    return map
  }, [results])

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={runAll}
          disabled={running}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
        >
          {running ? `Running... ${Math.round(progress * 100)}%` : 'Run All Benchmarks'}
        </button>

        {/* System info */}
        <div className="text-xs text-gray-500">
          WASM: {wasmCaps?.wasmAvailable ? 'Available' : 'Checking...'} |
          SIMD: {wasmCaps?.simdAvailable ? 'Yes' : 'No'} |
          Cores: {navigator.hardwareConcurrency || 'unknown'}
        </div>
      </div>

      {/* Progress bar */}
      {running && (
        <div className="w-full bg-gray-800 rounded h-2 mb-4">
          <div
            className="bg-blue-600 rounded h-2 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Benchmark results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from(grouped.entries()).map(([key, data]) => (
          <div key={key} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{key}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="size"
                  tick={{ fontSize: 10, fill: '#666' }}
                  label={{ value: 'Size (N)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#666' }}
                  label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  formatter={(value: number) => `${value.toFixed(2)} ms`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="jsTime"
                  name="JavaScript"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="wasmTime"
                  name="WASM"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Results table */}
            <table className="w-full text-xs mt-2">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-1">Size</th>
                  <th className="text-right py-1">JS (ms)</th>
                  <th className="text-right py-1">WASM (ms)</th>
                  <th className="text-right py-1">Speedup</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.size} className="border-b border-gray-800">
                    <td className="py-1 font-mono">{r.size.toLocaleString()}</td>
                    <td className="py-1 text-right font-mono text-yellow-400">
                      {r.jsTime.toFixed(2)}
                    </td>
                    <td className="py-1 text-right font-mono text-blue-400">
                      {r.wasmTime.toFixed(2)}
                    </td>
                    <td className="py-1 text-right font-mono text-green-400">
                      {r.speedup.toFixed(1)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Verify benchmark suite runs**

Switch to Performance tab. Click "Run All Benchmarks". Should see progress bar, then charts and tables for each benchmark category with execution times.

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): build Performance Dashboard with benchmark suite and scaling charts"
```

---

## Phase 8: WASM Integration

### Task 11: Wire up WASM engine via Electron IPC

**Files:**
- Modify: `demo/mathjs-calc/electron/main.ts` (add IPC handlers for WASM)
- Create: `demo/mathjs-calc/electron/wasm-worker.ts`
- Modify: `demo/mathjs-calc/electron/preload.ts` (expose WASM APIs)
- Modify: `demo/mathjs-calc/src/hooks/useBenchmark.ts` (dual-engine timing)

**Step 1: Add WASM IPC handlers to main process**

In `demo/mathjs-calc/electron/main.ts`, add after `app.whenReady()`:

```typescript
import { Worker } from 'worker_threads'

// WASM initialization
let wasmReady = false

ipcMain.handle('wasm:init', async () => {
  try {
    // Dynamic import to avoid bundling issues
    const { MatrixWasmBridge } = await import('mathjs/src/wasm/MatrixWasmBridge.ts')
    await MatrixWasmBridge.init()
    const caps = MatrixWasmBridge.getCapabilities()
    wasmReady = true
    return { success: true, capabilities: caps }
  } catch (err) {
    return {
      success: false,
      capabilities: {
        wasmAvailable: false,
        simdAvailable: false,
        parallelAvailable: false,
        coreCount: 1,
      },
    }
  }
})

ipcMain.handle('wasm:run', async (_event, operation: string, data: unknown) => {
  const start = performance.now()
  try {
    const math = (await import('mathjs')).default
    // Run operation with math.js (which auto-dispatches to WASM if available)
    let result: unknown
    switch (operation) {
      case 'multiply': {
        const { a, b } = data as { a: number[][]; b: number[][] }
        result = math.multiply(a, b)
        break
      }
      case 'det': {
        const { matrix } = data as { matrix: number[][] }
        result = math.det(matrix)
        break
      }
      case 'fft': {
        const { signal } = data as { signal: number[] }
        const complex = signal.map((v) => math.complex(v, 0))
        result = math.fft(complex)
        break
      }
      default:
        throw new Error(`Unknown WASM operation: ${operation}`)
    }
    return {
      success: true,
      result: JSON.parse(JSON.stringify(result)),
      executionTime: performance.now() - start,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      executionTime: performance.now() - start,
    }
  }
})

ipcMain.handle('system:info', () => ({
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  cpuCount: require('os').cpus().length,
  totalMemory: require('os').totalmem(),
}))
```

**Step 2: Update preload to expose WASM init**

In `demo/mathjs-calc/electron/preload.ts`, add:

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  initWasm: () => ipcRenderer.invoke('wasm:init'),
  runWasmOperation: (operation: string, data: unknown) =>
    ipcRenderer.invoke('wasm:run', operation, data),
  getSystemInfo: () => ipcRenderer.invoke('system:info'),
})
```

**Step 3: Add WASM initialization to App.tsx**

Add a `useEffect` at the top of `App`:

```typescript
import { useEffect } from 'react'

// Inside App component:
const setWasmCapabilities = useStore((s) => s.setWasmCapabilities)

useEffect(() => {
  if (window.electronAPI) {
    window.electronAPI.initWasm().then((result: any) => {
      setWasmCapabilities(result.capabilities)
    })
  }
}, [setWasmCapabilities])
```

**Step 4: Add TypeScript declarations for electronAPI**

Create `demo/mathjs-calc/src/electron.d.ts`:

```typescript
interface ElectronAPI {
  initWasm: () => Promise<{
    success: boolean
    capabilities: {
      wasmAvailable: boolean
      simdAvailable: boolean
      parallelAvailable: boolean
      coreCount: number
    }
  }>
  runWasmOperation: (operation: string, data: unknown) => Promise<{
    success: boolean
    result?: unknown
    error?: string
    executionTime: number
  }>
  getSystemInfo: () => Promise<{
    platform: string
    arch: string
    nodeVersion: string
    cpuCount: number
    totalMemory: number
  }>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
```

**Step 5: Update useBenchmark to use dual-engine timing**

In `demo/mathjs-calc/src/hooks/useBenchmark.ts`, update the benchmark runner to time both JS and WASM paths when `window.electronAPI` is available, comparing the times.

**Step 6: Verify Electron + WASM**

```bash
cd demo/mathjs-calc
npm run electron:dev
```

Expected: App launches in Electron window. Engine toggle shows WASM as available (if WASM modules are built). Performance dashboard shows JS vs WASM timing differences.

**Step 7: Commit**

```bash
git add demo/mathjs-calc/
git commit -m "feat(demo): wire up WASM engine via Electron IPC with dual-engine benchmarking"
```

---

## Phase 9: Polish & Packaging

### Task 12: Add auto-save state persistence

**Files:**
- Create: `demo/mathjs-calc/src/hooks/usePersistence.ts`
- Modify: `demo/mathjs-calc/src/App.tsx`

**Step 1: Create persistence hook**

Create `demo/mathjs-calc/src/hooks/usePersistence.ts`:

```typescript
import { useEffect } from 'react'
import { useStore } from '../store/useStore'

const STORAGE_KEY = 'mathjs-calc-state'

export function usePersistence() {
  const config = useStore((s) => s.config)
  const history = useStore((s) => s.history)

  // Save on change
  useEffect(() => {
    const state = { config, history: history.slice(0, 100) }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage might be full
    }
  }, [config, history])
}

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted state
  }
  return null
}
```

**Step 2: Wire into App.tsx**

Add `usePersistence()` call in `App` component and load saved state into Zustand on mount.

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(demo): add auto-save state persistence via localStorage"
```

---

### Task 13: Configure Electron Builder for distribution

**Files:**
- Create: `demo/mathjs-calc/electron-builder.yml`
- Modify: `demo/mathjs-calc/package.json` (add build config)

**Step 1: Create electron-builder config**

Create `demo/mathjs-calc/electron-builder.yml`:

```yaml
appId: com.mathjs.calc
productName: mathjs-calc
directories:
  buildResources: build
  output: release
files:
  - dist/**/*
  - dist-electron/**/*
  - package.json
win:
  target: nsis
  icon: build/icon.png
mac:
  target: dmg
  icon: build/icon.icns
linux:
  target: AppImage
  icon: build/icon.png
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

**Step 2: Verify build works**

```bash
cd demo/mathjs-calc
npm run build
npm run electron:build -- --dir  # build without packaging
```

Expected: `release/` directory created with app binary.

**Step 3: Commit**

```bash
git add demo/mathjs-calc/
git commit -m "feat(demo): configure Electron Builder for distribution packaging"
```

---

### Task 14: Final verification and README

**Files:**
- Create: `demo/mathjs-calc/README.md`

**Step 1: Run full app smoke test**

```bash
cd demo/mathjs-calc
npm run electron:dev
```

Verify all 5 panels work:
- [ ] Calculator: expression evaluation, button grid, angle modes, number types
- [ ] Matrix Lab: matrix editing, determinant, inverse, eigenvalues
- [ ] Signal Studio: waveform generation, FFT visualization, sample count scaling
- [ ] Statistics: data generation, descriptive stats, histogram
- [ ] Performance: benchmark suite runs, charts render, timing data

**Step 2: Create README**

Create `demo/mathjs-calc/README.md`:

```markdown
# mathjs-calc

Advanced scientific calculator demo — proof of concept for the math.js TS+AS+WASM library.

## Quick Start

```bash
npm install
npm run electron:dev
```

## Features

- **Scientific Calculator** — Expression parser, 396 functions, angle modes, number types
- **Matrix Lab** — Visual matrix editor, determinant, inverse, eigenvalues, SVD
- **Signal Studio** — Waveform generator, FFT visualization, spectral analysis
- **Statistics Dashboard** — Data generation, descriptive stats, histograms
- **Performance Dashboard** — JS vs WASM benchmark suite with scaling charts

## Engine Modes

- **JS** — Pure JavaScript (baseline)
- **WASM** — WebAssembly acceleration (2-25x faster for large operations)
- **Auto** — Automatically selects best engine based on input size

## Build

```bash
npm run build
npm run electron:build
```

## Tech Stack

Electron 33, React 19, TypeScript, Vite, Zustand, Recharts, Tailwind CSS, math.js
```

**Step 3: Final commit**

```bash
git add demo/mathjs-calc/
git commit -m "docs(demo): add README and complete smoke test verification"
```

---

## Summary

| Phase | Tasks | What It Delivers |
|-------|-------|-----------------|
| 1: Scaffolding | 1-2 | Electron+React+Vite project with math.js integration |
| 2: Layout | 3-4 | Zustand store, tabbed panels, expression bar, engine toggle |
| 3: Calculator | 5-6 | Scientific button grid, angle modes, number types, unit conversion |
| 4: Matrix Lab | 7 | Matrix editor, linear algebra operations |
| 5: Signal Studio | 8 | Waveform generator, FFT visualization |
| 6: Statistics | 9 | Data generation, descriptive stats, histograms |
| 7: Performance | 10 | Benchmark suite with scaling charts |
| 8: WASM | 11 | Dual-engine IPC, WASM initialization |
| 9: Polish | 12-14 | Persistence, packaging, README |

**Total: 14 tasks across 9 phases. Each task produces a working commit.**
