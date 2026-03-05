# ISE Workbench Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the mathjs-calc calculator demo into a full Integrated Scientific Environment (ISE) workbench with a three-zone split layout (calculator + graph canvas + expression bar), icon toolbar ribbon, symbolic computing with LaTeX rendering, 2D/3D interactive graphing, and variable explorer.

**Architecture:** Replace the current tabbed panel layout with a resizable three-zone split: calculator panel (left ~40%), graph canvas (right ~60%), expression bar (bottom full-width). The calculator panel gets an icon toolbar ribbon, symbolic output area, variable explorer, and enhanced button grid. The graph canvas uses Plotly.js for 2D/3D interactive plotting. KaTeX renders all symbolic output. The existing Zustand store is expanded with plot traces, symbolic history, and layout state. Performance/Statistics dashboards move to a secondary menu accessible from the toolbar.

**Tech Stack:** React 19, TypeScript, Vite, Electron, Plotly.js (graphing), KaTeX (LaTeX rendering), allotment (split panes), Zustand (state), Tailwind CSS, math.js TS+AS+WASM

**Design doc:** `docs/plans/2026-03-05-ise-workbench-design.md`

---

## Phase 1: Dependencies & Layout Shell

### Task 1: Install new dependencies

**Files:**
- Modify: `demo/mathjs-calc/package.json`

**Step 1: Install plotly, katex, allotment**

```bash
cd demo/mathjs-calc
npm install plotly.js-dist-min react-plotly.js katex allotment
npm install --save-dev @types/katex
```

**Step 2: Verify installation**

```bash
cd demo/mathjs-calc
node -e "require('plotly.js-dist-min'); console.log('plotly ok')"
node -e "require('katex'); console.log('katex ok')"
node -e "require('allotment'); console.log('allotment ok')"
```

Expected: All three print "ok".

**Step 3: Add allotment CSS import**

In `demo/mathjs-calc/src/main.tsx`, add at the top:

```typescript
import 'allotment/dist/style.css'
```

**Step 4: Commit**

```bash
git add demo/mathjs-calc/package.json demo/mathjs-calc/package-lock.json demo/mathjs-calc/src/main.tsx
git commit -m "feat(ise): install plotly.js, katex, and allotment dependencies"
```

---

### Task 2: Build three-zone split layout shell

**Files:**
- Create: `demo/mathjs-calc/src/layouts/ISELayout.tsx`
- Create: `demo/mathjs-calc/src/layouts/SplitDivider.tsx`
- Modify: `demo/mathjs-calc/src/App.tsx`
- Modify: `demo/mathjs-calc/src/store/useStore.ts`
- Modify: `demo/mathjs-calc/src/types.ts`

**Step 1: Add layout state to types and store**

In `demo/mathjs-calc/src/types.ts`, add:

```typescript
export type ViewMode = 'ise' | 'performance' | 'statistics'

export interface PlotTrace {
  id: string
  expression: string
  type: '2d' | '3d' | 'parametric' | 'polar'
  color: string
  visible: boolean
  data: { x: number[]; y: number[]; z?: number[] }
}

export interface SymbolicResult {
  id: string
  input: string
  output: string
  latexIn: string
  latexOut: string
  timestamp: number
}
```

In `demo/mathjs-calc/src/store/useStore.ts`, add to the state interface and implementation:

```typescript
// Layout
viewMode: ViewMode
setViewMode: (mode: ViewMode) => void
graphCollapsed: boolean
toggleGraphCollapsed: () => void

// Plots
plotTraces: PlotTrace[]
addPlotTrace: (trace: PlotTrace) => void
removePlotTrace: (id: string) => void
togglePlotVisibility: (id: string) => void
clearPlots: () => void
plotMode: '2d' | '3d'
setPlotMode: (mode: '2d' | '3d') => void

// Symbolic
symbolicHistory: SymbolicResult[]
addSymbolicResult: (result: SymbolicResult) => void
clearSymbolicHistory: () => void

// Variables
variables: Record<string, { value: string; type: string }>
updateVariables: (vars: Record<string, { value: string; type: string }>) => void
```

**Step 2: Create ISELayout component**

Create `demo/mathjs-calc/src/layouts/ISELayout.tsx`:

```tsx
import React from 'react'
import { Allotment } from 'allotment'
import { useStore } from '../store/useStore'

// Placeholder components — will be replaced in later tasks
function CalculatorPanel() {
  return <div className="h-full bg-gray-950 p-2 text-gray-400">Calculator Panel (Task 4-7)</div>
}
function GraphCanvas() {
  return <div className="h-full bg-gray-950 p-2 text-gray-400 flex items-center justify-center">Graph Canvas (Task 10-13)</div>
}
function ExpressionBarNew() {
  return <div className="h-full bg-gray-900 p-2 text-gray-400">Expression Bar (Task 8-9)</div>
}

export function ISELayout() {
  const graphCollapsed = useStore((s) => s.graphCollapsed)

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Main area: calculator + graph */}
      <Allotment className="flex-1">
        <Allotment.Pane minSize={300} preferredSize="40%">
          <CalculatorPanel />
        </Allotment.Pane>
        {!graphCollapsed && (
          <Allotment.Pane minSize={300} preferredSize="60%">
            <GraphCanvas />
          </Allotment.Pane>
        )}
      </Allotment>

      {/* Expression bar at bottom */}
      <div className="border-t border-gray-800" style={{ height: 140 }}>
        <ExpressionBarNew />
      </div>
    </div>
  )
}
```

**Step 3: Update App.tsx to use ISELayout**

Replace `demo/mathjs-calc/src/App.tsx`:

```tsx
import React from 'react'
import { useStore } from './store/useStore'
import { ISELayout } from './layouts/ISELayout'
import { StatisticsPanel } from './panels/StatisticsPanel'
import { PerformancePanel } from './panels/PerformancePanel'
import { usePersistence } from './hooks/usePersistence'

export default function App() {
  const viewMode = useStore((s) => s.viewMode)
  usePersistence()

  if (viewMode === 'statistics') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <SecondaryHeader />
        <StatisticsPanel />
      </div>
    )
  }

  if (viewMode === 'performance') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <SecondaryHeader />
        <PerformancePanel />
      </div>
    )
  }

  return <ISELayout />
}

function SecondaryHeader() {
  const setViewMode = useStore((s) => s.setViewMode)
  return (
    <header className="border-b border-gray-800 p-2 bg-gray-900 flex items-center gap-2">
      <button
        onClick={() => setViewMode('ise')}
        className="text-sm text-blue-400 hover:text-blue-300"
      >
        ← Back to ISE
      </button>
    </header>
  )
}
```

**Step 4: Verify three-zone layout renders**

```bash
cd demo/mathjs-calc && npm run dev
```

Expected: Three zones visible — calculator placeholder left, graph placeholder right, expression bar bottom. Resizable divider between calculator and graph.

**Step 5: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): build three-zone split layout with allotment"
```

---

## Phase 2: Icon Toolbar Ribbon

### Task 3: Create icon system

**Files:**
- Create: `demo/mathjs-calc/src/components/icons/MathIcons.tsx`

**Step 1: Create SVG icon components for all toolbar icons**

Create `demo/mathjs-calc/src/components/icons/MathIcons.tsx`:

This file exports 35+ small SVG icon components (20x20) for each toolbar action. Use simple geometric shapes and math symbols. Each icon is a React component accepting `className` prop.

Icons needed:
- Algebra: Simplify (= with sparkle), Expand (brackets opening), Factor (brackets closing), Solve (x with checkmark), Rationalize (fraction bar)
- Calculus: Derivative (d/dx text), Integral (∫ symbol), Limit (lim text), Summation (Σ), Taylor (T∞)
- Matrix: Determinant (|A| text), Inverse (A⁻¹), Transpose (Aᵀ), Eigenvalues (λ), MatrixGrid (grid dots)
- Trig: Sin/Cos/Tan/ASin/ACos/ATan (text labels), Hyp toggle (hyp text)
- Stats: Mean (x̄), StdDev (σ), Median (M̃), Histogram (bar chart), Regression (trend line)
- Plot: Line2D (📈), Parametric (spiral), Polar (circle with ray), Surface3D (mesh), ClearPlot (x)
- Settings: AngleMode (°/rad), NumberType (#), Precision (0.00), Engine (⚡)

Each icon should be simple text-based or minimal SVG to avoid complexity:

```tsx
import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export function DerivativeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="11" fontFamily="serif" fontStyle="italic">d/dx</text>
    </svg>
  )
}

export function IntegralIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="3" y="15" fontSize="16" fontFamily="serif">∫</text>
    </svg>
  )
}

// ... (all 35+ icons following same pattern)
// Use Unicode math symbols where possible: ∫, Σ, ∏, λ, σ, π
// Use text labels for functions: sin, cos, det, inv
```

**Step 2: Commit**

```bash
git add demo/mathjs-calc/src/components/icons/
git commit -m "feat(ise): create math icon components for toolbar ribbon"
```

---

### Task 4: Build toolbar ribbon component

**Files:**
- Create: `demo/mathjs-calc/src/components/ToolbarRibbon.tsx`
- Create: `demo/mathjs-calc/src/components/ToolbarGroup.tsx`
- Create: `demo/mathjs-calc/src/components/ToolbarButton.tsx`

**Step 1: Create ToolbarButton**

Create `demo/mathjs-calc/src/components/ToolbarButton.tsx`:

```tsx
import React from 'react'

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  tooltip: string
  onClick: () => void
  active?: boolean
}

export function ToolbarButton({ icon, label, tooltip, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded text-xs transition-colors
        ${active
          ? 'bg-blue-600/20 text-blue-400'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[9px] leading-none font-medium">{label}</span>
    </button>
  )
}
```

**Step 2: Create ToolbarGroup**

Create `demo/mathjs-calc/src/components/ToolbarGroup.tsx`:

```tsx
import React from 'react'

interface ToolbarGroupProps {
  title: string
  children: React.ReactNode
}

export function ToolbarGroup({ title, children }: ToolbarGroupProps) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-0.5 px-1">
        {children}
      </div>
      <div className="text-[8px] text-gray-600 text-center mt-0.5 uppercase tracking-wider">
        {title}
      </div>
    </div>
  )
}
```

**Step 3: Create ToolbarRibbon**

Create `demo/mathjs-calc/src/components/ToolbarRibbon.tsx`:

```tsx
import React from 'react'
import { ToolbarGroup } from './ToolbarGroup'
import { ToolbarButton } from './ToolbarButton'
import { useStore } from '../store/useStore'

interface ToolbarRibbonProps {
  onInsert: (template: string, cursorOffset?: number) => void
}

export function ToolbarRibbon({ onInsert }: ToolbarRibbonProps) {
  const { config, setConfig, setViewMode } = useStore()

  return (
    <div className="flex items-start gap-0 px-1 py-1 bg-gray-900 border-b border-gray-800 overflow-x-auto">
      {/* Algebra */}
      <ToolbarGroup title="Algebra">
        <ToolbarButton icon="≡" label="simplify" tooltip="Simplify expression"
          onClick={() => onInsert('simplify("")', -2)} />
        <ToolbarButton icon="⟨⟩" label="expand" tooltip="Expand expression"
          onClick={() => onInsert('expand("")', -2)} />
        <ToolbarButton icon="[ ]" label="factor" tooltip="Factor expression"
          onClick={() => onInsert('factor("")', -2)} />
        <ToolbarButton icon="✓" label="solve" tooltip="Solve equation"
          onClick={() => onInsert('solve("", "x")', -6)} />
        <ToolbarButton icon="⁄" label="rational" tooltip="Rationalize"
          onClick={() => onInsert('rationalize("")', -2)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Calculus */}
      <ToolbarGroup title="Calculus">
        <ToolbarButton icon="d/dx" label="deriv" tooltip="Derivative"
          onClick={() => onInsert('derivative("", "x")', -6)} />
        <ToolbarButton icon="∫" label="integ" tooltip="Integral (symbolic)"
          onClick={() => onInsert('integrate("", "x")', -6)} />
        <ToolbarButton icon="lim" label="limit" tooltip="Limit"
          onClick={() => onInsert('limit("", "x", 0)', -7)} />
        <ToolbarButton icon="Σ" label="sum" tooltip="Summation"
          onClick={() => onInsert('sum([])', -2)} />
        <ToolbarButton icon="Tₙ" label="taylor" tooltip="Taylor series"
          onClick={() => onInsert('taylor("", "x", 0, 5)', -8)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Matrix */}
      <ToolbarGroup title="Matrix">
        <ToolbarButton icon="|A|" label="det" tooltip="Determinant"
          onClick={() => onInsert('det()', -1)} />
        <ToolbarButton icon="A⁻¹" label="inv" tooltip="Inverse"
          onClick={() => onInsert('inv()', -1)} />
        <ToolbarButton icon="Aᵀ" label="trans" tooltip="Transpose"
          onClick={() => onInsert('transpose()', -1)} />
        <ToolbarButton icon="λ" label="eigs" tooltip="Eigenvalues"
          onClick={() => onInsert('eigs()', -1)} />
        <ToolbarButton icon="⊞" label="matrix" tooltip="Create matrix"
          onClick={() => onInsert('matrix([[]])', -3)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Trig */}
      <ToolbarGroup title="Trig">
        <ToolbarButton icon="sin" label="sin" tooltip="Sine"
          onClick={() => onInsert('sin()', -1)} />
        <ToolbarButton icon="cos" label="cos" tooltip="Cosine"
          onClick={() => onInsert('cos()', -1)} />
        <ToolbarButton icon="tan" label="tan" tooltip="Tangent"
          onClick={() => onInsert('tan()', -1)} />
        <ToolbarButton icon="sin⁻¹" label="asin" tooltip="Arcsine"
          onClick={() => onInsert('asin()', -1)} />
        <ToolbarButton icon="cos⁻¹" label="acos" tooltip="Arccosine"
          onClick={() => onInsert('acos()', -1)} />
        <ToolbarButton icon="tan⁻¹" label="atan" tooltip="Arctangent"
          onClick={() => onInsert('atan()', -1)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Stats */}
      <ToolbarGroup title="Stats">
        <ToolbarButton icon="x̄" label="mean" tooltip="Mean"
          onClick={() => onInsert('mean([])', -2)} />
        <ToolbarButton icon="σ" label="std" tooltip="Standard deviation"
          onClick={() => onInsert('std([])', -2)} />
        <ToolbarButton icon="M̃" label="median" tooltip="Median"
          onClick={() => onInsert('median([])', -2)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Plot */}
      <ToolbarGroup title="Plot">
        <ToolbarButton icon="📈" label="y=f(x)" tooltip="Plot 2D function"
          onClick={() => onInsert('plot()', -1)} />
        <ToolbarButton icon="⟳" label="param" tooltip="Parametric plot"
          onClick={() => onInsert('plotParametric(cos(t), sin(t), t, 0, 2*pi)', 0)} />
        <ToolbarButton icon="◎" label="polar" tooltip="Polar plot"
          onClick={() => onInsert('plotPolar(, theta, 0, 2*pi)', -19)} />
        <ToolbarButton icon="🏔" label="3D" tooltip="3D surface plot"
          onClick={() => onInsert('plot3d()', -1)} />
        <ToolbarButton icon="🗑" label="clear" tooltip="Clear all plots"
          onClick={() => onInsert('clearPlot()', 0)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Settings */}
      <ToolbarGroup title="Settings">
        <ToolbarButton
          icon={config.angleMode === 'deg' ? '°' : 'rad'}
          label="angle"
          tooltip="Toggle angle mode"
          onClick={() => setConfig({ angleMode: config.angleMode === 'deg' ? 'rad' : 'deg' })}
          active={config.angleMode === 'deg'}
        />
        <ToolbarButton icon="⚡" label="engine" tooltip="Toggle engine (JS/WASM)"
          onClick={() => {
            const modes = ['auto', 'js', 'wasm'] as const
            const idx = modes.indexOf(config.engine)
            setConfig({ engine: modes[(idx + 1) % 3] })
          }}
        />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Views */}
      <ToolbarGroup title="Views">
        <ToolbarButton icon="📊" label="stats" tooltip="Statistics Dashboard"
          onClick={() => setViewMode('statistics')} />
        <ToolbarButton icon="⚡" label="perf" tooltip="Performance Dashboard"
          onClick={() => setViewMode('performance')} />
      </ToolbarGroup>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/components/
git commit -m "feat(ise): build icon toolbar ribbon with 7 groups and template insertion"
```

---

## Phase 3: Enhanced Calculator Panel

### Task 5: Build symbolic output area with KaTeX

**Files:**
- Create: `demo/mathjs-calc/src/components/SymbolicOutput.tsx`
- Create: `demo/mathjs-calc/src/hooks/useSymbolic.ts`

**Step 1: Create useSymbolic hook**

Create `demo/mathjs-calc/src/hooks/useSymbolic.ts`:

```typescript
import { useCallback } from 'react'
import { useMathParser } from './useMathParser'
import { useStore } from '../store/useStore'
import type { SymbolicResult } from '../types'

const SYMBOLIC_FUNCTIONS = ['simplify', 'derivative', 'expand', 'rationalize', 'solve']

export function useSymbolic() {
  const { math } = useMathParser()
  const addSymbolicResult = useStore((s) => s.addSymbolicResult)

  const isSymbolic = useCallback((expression: string): boolean => {
    return SYMBOLIC_FUNCTIONS.some((fn) => expression.trim().startsWith(fn + '('))
  }, [])

  const evaluateSymbolic = useCallback(
    (expression: string): SymbolicResult | null => {
      try {
        const result = math.evaluate(expression)

        // Convert input to LaTeX
        let latexIn = ''
        try {
          // Extract the inner expression for LaTeX rendering
          const match = expression.match(/^(\w+)\("([^"]+)"/)
          if (match) {
            const fnName = match[1]
            const innerExpr = match[2]
            const parsed = math.parse(innerExpr)
            if (fnName === 'derivative') {
              latexIn = `\\frac{d}{dx}\\left[${parsed.toTex()}\\right]`
            } else if (fnName === 'simplify') {
              latexIn = `\\text{simplify}\\left(${parsed.toTex()}\\right)`
            } else {
              latexIn = `\\text{${fnName}}\\left(${parsed.toTex()}\\right)`
            }
          } else {
            latexIn = math.parse(expression).toTex()
          }
        } catch {
          latexIn = expression
        }

        // Convert result to LaTeX
        let latexOut = ''
        let output = ''
        try {
          if (typeof result === 'object' && result !== null && 'toTex' in result) {
            latexOut = result.toTex()
            output = result.toString()
          } else if (typeof result === 'string') {
            latexOut = math.parse(result).toTex()
            output = result
          } else {
            output = math.format(result, { precision: 14 })
            latexOut = output
          }
        } catch {
          output = math.format(result, { precision: 14 })
          latexOut = output
        }

        const entry: SymbolicResult = {
          id: crypto.randomUUID(),
          input: expression,
          output,
          latexIn,
          latexOut,
          timestamp: Date.now(),
        }

        addSymbolicResult(entry)
        return entry
      } catch {
        return null
      }
    },
    [math, addSymbolicResult]
  )

  return { isSymbolic, evaluateSymbolic }
}
```

**Step 2: Create SymbolicOutput component**

Create `demo/mathjs-calc/src/components/SymbolicOutput.tsx`:

```tsx
import React, { useRef, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useStore } from '../store/useStore'

function KaTeXBlock({ latex, className }: { latex: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && latex) {
      try {
        katex.render(latex, ref.current, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        })
      } catch {
        if (ref.current) ref.current.textContent = latex
      }
    }
  }, [latex])

  return <div ref={ref} className={className} />
}

export function SymbolicOutput() {
  const symbolicHistory = useStore((s) => s.symbolicHistory)

  if (symbolicHistory.length === 0) {
    return (
      <div className="px-2 py-3 text-center text-gray-600 text-xs italic">
        Symbolic results appear here
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-48 space-y-2 p-2">
      {symbolicHistory.slice(0, 20).map((entry) => (
        <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded p-2">
          <KaTeXBlock latex={entry.latexIn} className="text-gray-300 text-sm" />
          <div className="text-center text-gray-600 text-xs my-1">=</div>
          <KaTeXBlock latex={entry.latexOut} className="text-green-400 text-sm" />
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): add symbolic output area with KaTeX LaTeX rendering"
```

---

### Task 6: Build variable explorer

**Files:**
- Create: `demo/mathjs-calc/src/components/VariableExplorer.tsx`

**Step 1: Create VariableExplorer component**

Create `demo/mathjs-calc/src/components/VariableExplorer.tsx`:

```tsx
import React from 'react'
import { useStore } from '../store/useStore'

const TYPE_COLORS: Record<string, string> = {
  number: 'text-green-400',
  Matrix: 'text-blue-400',
  Complex: 'text-purple-400',
  string: 'text-gray-400',
  Function: 'text-yellow-400',
  Unit: 'text-orange-400',
  BigNumber: 'text-teal-400',
  Fraction: 'text-pink-400',
  boolean: 'text-cyan-400',
  ResultSet: 'text-gray-400',
}

const TYPE_BADGES: Record<string, string> = {
  number: 'bg-green-900/50 text-green-400',
  Matrix: 'bg-blue-900/50 text-blue-400',
  Complex: 'bg-purple-900/50 text-purple-400',
  string: 'bg-gray-800 text-gray-400',
  Function: 'bg-yellow-900/50 text-yellow-400',
  Unit: 'bg-orange-900/50 text-orange-400',
  BigNumber: 'bg-teal-900/50 text-teal-400',
  Fraction: 'bg-pink-900/50 text-pink-400',
}

interface VariableExplorerProps {
  onInsert: (text: string) => void
}

export function VariableExplorer({ onInsert }: VariableExplorerProps) {
  const variables = useStore((s) => s.variables)
  const entries = Object.entries(variables)

  if (entries.length === 0) {
    return (
      <div className="px-2 py-2 text-center text-gray-600 text-xs italic">
        No variables defined
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-32">
      <table className="w-full text-xs">
        <tbody>
          {entries.map(([name, { value, type }]) => (
            <tr
              key={name}
              className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer"
              onClick={() => onInsert(name)}
              title={`Click to insert "${name}" into expression`}
            >
              <td className="py-0.5 px-2 font-mono font-bold text-gray-200">{name}</td>
              <td className="py-0.5 px-1">
                <span className={`px-1 py-0 rounded text-[9px] ${TYPE_BADGES[type] || 'bg-gray-800 text-gray-400'}`}>
                  {type}
                </span>
              </td>
              <td className={`py-0.5 px-2 font-mono truncate max-w-[150px] ${TYPE_COLORS[type] || 'text-gray-400'}`}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add demo/mathjs-calc/src/components/VariableExplorer.tsx
git commit -m "feat(ise): add variable explorer with type badges and click-to-insert"
```

---

### Task 7: Build enhanced button grid and assemble calculator panel

**Files:**
- Create: `demo/mathjs-calc/src/components/EnhancedButtonGrid.tsx`
- Create: `demo/mathjs-calc/src/panels/ISECalculatorPanel.tsx`

**Step 1: Create EnhancedButtonGrid**

Create `demo/mathjs-calc/src/components/EnhancedButtonGrid.tsx`:

```tsx
import React from 'react'

interface ButtonDef {
  label: string
  insert: string
  variant: 'default' | 'operator' | 'function' | 'constant' | 'action' | 'symbolic'
}

const GRID: ButtonDef[][] = [
  // Row 1: Symbolic
  [
    { label: 'd/dx', insert: 'derivative("","x")', variant: 'symbolic' },
    { label: '∫', insert: 'integrate("","x")', variant: 'symbolic' },
    { label: 'Σ', insert: 'sum()', variant: 'symbolic' },
    { label: '∏', insert: 'prod()', variant: 'symbolic' },
    { label: 'lim', insert: 'limit("","x",0)', variant: 'symbolic' },
    { label: '∞', insert: 'Infinity', variant: 'constant' },
  ],
  // Row 2: Trig
  [
    { label: 'sin', insert: 'sin(', variant: 'function' },
    { label: 'cos', insert: 'cos(', variant: 'function' },
    { label: 'tan', insert: 'tan(', variant: 'function' },
    { label: 'asin', insert: 'asin(', variant: 'function' },
    { label: 'acos', insert: 'acos(', variant: 'function' },
    { label: 'atan', insert: 'atan(', variant: 'function' },
  ],
  // Row 3: Functions
  [
    { label: 'log', insert: 'log(', variant: 'function' },
    { label: 'ln', insert: 'log(', variant: 'function' },
    { label: 'eˣ', insert: 'exp(', variant: 'function' },
    { label: '10ˣ', insert: '10^', variant: 'function' },
    { label: '√', insert: 'sqrt(', variant: 'function' },
    { label: 'xʸ', insert: '^', variant: 'operator' },
  ],
  // Row 4: Brackets & specials
  [
    { label: '(', insert: '(', variant: 'operator' },
    { label: ')', insert: ')', variant: 'operator' },
    { label: '[', insert: '[', variant: 'operator' },
    { label: ']', insert: ']', variant: 'operator' },
    { label: '|x|', insert: 'abs(', variant: 'function' },
    { label: 'n!', insert: '!', variant: 'operator' },
  ],
  // Row 5: 7-9 + actions
  [
    { label: '7', insert: '7', variant: 'default' },
    { label: '8', insert: '8', variant: 'default' },
    { label: '9', insert: '9', variant: 'default' },
    { label: 'DEL', insert: '__DEL__', variant: 'action' },
    { label: 'AC', insert: '__AC__', variant: 'action' },
    { label: 'ANS', insert: 'ans', variant: 'constant' },
  ],
  // Row 6: 4-6 + operators
  [
    { label: '4', insert: '4', variant: 'default' },
    { label: '5', insert: '5', variant: 'default' },
    { label: '6', insert: '6', variant: 'default' },
    { label: '×', insert: ' * ', variant: 'operator' },
    { label: '÷', insert: ' / ', variant: 'operator' },
    { label: 'mod', insert: ' mod ', variant: 'operator' },
  ],
  // Row 7: 1-3 + operators
  [
    { label: '1', insert: '1', variant: 'default' },
    { label: '2', insert: '2', variant: 'default' },
    { label: '3', insert: '3', variant: 'default' },
    { label: '+', insert: ' + ', variant: 'operator' },
    { label: '−', insert: ' - ', variant: 'operator' },
    { label: '=', insert: '__EVAL__', variant: 'action' },
  ],
  // Row 8: 0, constants, EXP
  [
    { label: '0', insert: '0', variant: 'default' },
    { label: '.', insert: '.', variant: 'default' },
    { label: 'π', insert: 'pi', variant: 'constant' },
    { label: 'e', insert: 'e', variant: 'constant' },
    { label: 'i', insert: 'i', variant: 'constant' },
    { label: 'EXP', insert: 'e', variant: 'function' },
  ],
]

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-gray-800 hover:bg-gray-700 text-gray-100',
  operator: 'bg-gray-700 hover:bg-gray-600 text-blue-300',
  function: 'bg-gray-800 hover:bg-gray-700 text-yellow-300',
  constant: 'bg-gray-800 hover:bg-gray-700 text-purple-300',
  action: 'bg-blue-700 hover:bg-blue-600 text-white',
  symbolic: 'bg-gray-800 hover:bg-gray-700 text-pink-300',
}

interface EnhancedButtonGridProps {
  onInsert: (text: string) => void
  onDelete: () => void
  onClear: () => void
  onEvaluate: () => void
}

export function EnhancedButtonGrid({ onInsert, onDelete, onClear, onEvaluate }: EnhancedButtonGridProps) {
  const handleClick = (btn: ButtonDef) => {
    if (btn.insert === '__DEL__') return onDelete()
    if (btn.insert === '__AC__') return onClear()
    if (btn.insert === '__EVAL__') return onEvaluate()
    onInsert(btn.insert)
  }

  return (
    <div className="grid grid-cols-6 gap-1 p-1">
      {GRID.flat().map((btn, i) => (
        <button
          key={i}
          onClick={() => handleClick(btn)}
          className={`${VARIANT_STYLES[btn.variant]} rounded py-1.5 text-xs font-mono font-medium transition-colors active:scale-95`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Assemble ISECalculatorPanel**

Create `demo/mathjs-calc/src/panels/ISECalculatorPanel.tsx`:

```tsx
import React, { useCallback, useRef } from 'react'
import { ToolbarRibbon } from '../components/ToolbarRibbon'
import { SymbolicOutput } from '../components/SymbolicOutput'
import { VariableExplorer } from '../components/VariableExplorer'
import { EnhancedButtonGrid } from '../components/EnhancedButtonGrid'

interface ISECalculatorPanelProps {
  onInsertToExpression: (text: string, cursorOffset?: number) => void
  onDeleteFromExpression: () => void
  onClearExpression: () => void
  onEvaluateExpression: () => void
}

export function ISECalculatorPanel({
  onInsertToExpression,
  onDeleteFromExpression,
  onClearExpression,
  onEvaluateExpression,
}: ISECalculatorPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gray-950 overflow-hidden">
      {/* Toolbar Ribbon */}
      <ToolbarRibbon onInsert={onInsertToExpression} />

      {/* Symbolic Output */}
      <div className="border-b border-gray-800">
        <div className="px-2 py-1 text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
          Symbolic
        </div>
        <SymbolicOutput />
      </div>

      {/* Variable Explorer */}
      <div className="border-b border-gray-800">
        <div className="px-2 py-1 text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
          Variables
        </div>
        <VariableExplorer onInsert={onInsertToExpression} />
      </div>

      {/* Button Grid (fills remaining space) */}
      <div className="flex-1 overflow-y-auto">
        <EnhancedButtonGrid
          onInsert={onInsertToExpression}
          onDelete={onDeleteFromExpression}
          onClear={onClearExpression}
          onEvaluate={onEvaluateExpression}
        />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): build enhanced button grid and assemble calculator panel"
```

---

## Phase 4: Expression Bar

### Task 8: Build expression bar with LaTeX preview

**Files:**
- Create: `demo/mathjs-calc/src/components/ExpressionInput.tsx`
- Create: `demo/mathjs-calc/src/components/LaTeXPreview.tsx`
- Create: `demo/mathjs-calc/src/components/ResultDisplay.tsx`
- Create: `demo/mathjs-calc/src/components/ISEExpressionBar.tsx`

**Step 1: Create LaTeXPreview**

Create `demo/mathjs-calc/src/components/LaTeXPreview.tsx`:

```tsx
import React, { useRef, useEffect, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useMathParser } from '../hooks/useMathParser'

interface LaTeXPreviewProps {
  expression: string
}

export function LaTeXPreview({ expression }: LaTeXPreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { math } = useMathParser()

  const latex = useMemo(() => {
    if (!expression.trim()) return ''
    try {
      const node = math.parse(expression)
      return node.toTex()
    } catch {
      return ''
    }
  }, [expression, math])

  useEffect(() => {
    if (ref.current) {
      if (latex) {
        try {
          katex.render(latex, ref.current, {
            displayMode: false,
            throwOnError: false,
          })
        } catch {
          ref.current.textContent = ''
        }
      } else {
        ref.current.textContent = ''
      }
    }
  }, [latex])

  if (!expression.trim()) return null

  return (
    <div className="px-3 py-1 bg-gray-900/50 border-b border-gray-800/50 min-h-[24px]">
      <div ref={ref} className="text-gray-300 text-sm" />
    </div>
  )
}
```

**Step 2: Create ResultDisplay**

Create `demo/mathjs-calc/src/components/ResultDisplay.tsx`:

```tsx
import React, { useRef, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface ResultDisplayProps {
  result: string | null
  type: string | null
  error: string | null
  executionTime: number | null
  isSymbolic: boolean
  latex: string | null
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  number: 'bg-green-900/50 text-green-400',
  Matrix: 'bg-blue-900/50 text-blue-400',
  Complex: 'bg-purple-900/50 text-purple-400',
  string: 'bg-gray-800 text-gray-400',
  Unit: 'bg-orange-900/50 text-orange-400',
  Function: 'bg-yellow-900/50 text-yellow-400',
  symbolic: 'bg-pink-900/50 text-pink-400',
  plot: 'bg-orange-900/50 text-orange-400',
}

export function ResultDisplay({ result, type, error, executionTime, isSymbolic, latex }: ResultDisplayProps) {
  const katexRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (katexRef.current && latex && isSymbolic) {
      try {
        katex.render(latex, katexRef.current, { displayMode: false, throwOnError: false })
      } catch {
        if (katexRef.current) katexRef.current.textContent = result || ''
      }
    }
  }, [latex, isSymbolic, result])

  if (!result && !error) return null

  return (
    <div className="px-3 py-1 flex items-center gap-2">
      {error ? (
        <span className="text-red-400 font-mono text-sm">{error}</span>
      ) : (
        <>
          <span className="text-gray-500">=</span>
          {isSymbolic && latex ? (
            <div ref={katexRef} className="text-green-400" />
          ) : (
            <span className="text-green-400 font-mono text-sm">{result}</span>
          )}
          {type && (
            <span className={`text-[9px] px-1 py-0 rounded ${TYPE_BADGE_STYLES[type] || 'bg-gray-800 text-gray-400'}`}>
              {type}
            </span>
          )}
        </>
      )}
      {executionTime !== null && (
        <span className="text-gray-600 text-[10px] ml-auto">{executionTime.toFixed(1)}ms</span>
      )}
    </div>
  )
}
```

**Step 3: Create ISEExpressionBar**

Create `demo/mathjs-calc/src/components/ISEExpressionBar.tsx`:

```tsx
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react'
import { LaTeXPreview } from './LaTeXPreview'
import { ResultDisplay } from './ResultDisplay'
import { useMathParser } from '../hooks/useMathParser'
import { useSymbolic } from '../hooks/useSymbolic'
import { useStore } from '../store/useStore'

export interface ExpressionBarHandle {
  insert: (text: string, cursorOffset?: number) => void
  deleteChar: () => void
  clear: () => void
  evaluate: () => void
  focus: () => void
}

export const ISEExpressionBar = forwardRef<ExpressionBarHandle>(function ISEExpressionBar(_, ref) {
  const { evaluate: mathEval, math } = useMathParser()
  const { isSymbolic, evaluateSymbolic } = useSymbolic()
  const { updateVariables, addPlotTrace } = useStore()

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [resultType, setResultType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [execTime, setExecTime] = useState<number | null>(null)
  const [isSymbolicResult, setIsSymbolicResult] = useState(false)
  const [resultLatex, setResultLatex] = useState<string | null>(null)
  const [historyStack, setHistoryStack] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  const handleEvaluate = useCallback(() => {
    const expr = input.trim()
    if (!expr) return

    setHistoryStack((prev) => [expr, ...prev.slice(0, 99)])
    setHistoryIdx(-1)

    // Check for plot commands
    if (expr.startsWith('plot(') || expr.startsWith('plot3d(') ||
        expr.startsWith('plotParametric(') || expr.startsWith('plotPolar(')) {
      // Plot handling will be implemented in Task 11
      setResult('Plot command recognized — graph integration pending')
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      return
    }

    // Check for symbolic
    if (isSymbolic(expr)) {
      const symResult = evaluateSymbolic(expr)
      if (symResult) {
        setResult(symResult.output)
        setResultType('symbolic')
        setError(null)
        setExecTime(0)
        setIsSymbolicResult(true)
        setResultLatex(symResult.latexOut)
      } else {
        // Fall through to numeric evaluation
      }
    }

    // Numeric evaluation
    const entry = mathEval(expr)
    if (entry.error) {
      setError(entry.error)
      setResult(null)
      setResultType(null)
      setIsSymbolicResult(false)
      setResultLatex(null)
    } else {
      setResult(entry.result)
      setResultType(entry.type)
      setError(null)
      setIsSymbolicResult(false)
      setResultLatex(null)
    }
    setExecTime(entry.executionTime)

    // Update variable explorer
    try {
      const parser = math.parser()
      // Re-evaluate to get parser state... actually we use the shared parser
      // This will be refined when we connect useMathParser properly
    } catch {}

    setInput('')
  }, [input, mathEval, isSymbolic, evaluateSymbolic, math, updateVariables])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleEvaluate()
      }
      if (e.key === 'ArrowUp' && historyStack.length > 0) {
        const newIdx = Math.min(historyIdx + 1, historyStack.length - 1)
        setHistoryIdx(newIdx)
        setInput(historyStack[newIdx])
      }
      if (e.key === 'ArrowDown') {
        if (historyIdx > 0) {
          setHistoryIdx(historyIdx - 1)
          setInput(historyStack[historyIdx - 1])
        } else {
          setHistoryIdx(-1)
          setInput('')
        }
      }
    },
    [handleEvaluate, historyStack, historyIdx]
  )

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    insert: (text: string, cursorOffset?: number) => {
      const textarea = inputRef.current
      if (!textarea) { setInput((prev) => prev + text); return }
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = input.slice(0, start)
      const after = input.slice(end)
      const newValue = before + text + after
      setInput(newValue)
      // Position cursor
      requestAnimationFrame(() => {
        const pos = cursorOffset !== undefined ? start + text.length + cursorOffset : start + text.length
        textarea.setSelectionRange(pos, pos)
        textarea.focus()
      })
    },
    deleteChar: () => {
      const textarea = inputRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      if (start > 0) {
        setInput((prev) => prev.slice(0, start - 1) + prev.slice(start))
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start - 1, start - 1)
          textarea.focus()
        })
      }
    },
    clear: () => {
      setInput('')
      setResult(null)
      setError(null)
      inputRef.current?.focus()
    },
    evaluate: handleEvaluate,
    focus: () => inputRef.current?.focus(),
  }), [input, handleEvaluate])

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* LaTeX preview */}
      <LaTeXPreview expression={input} />

      {/* Input */}
      <div className="flex-1 flex">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter expression... (Enter to evaluate, Shift+Enter for new line)"
          className="flex-1 bg-transparent px-3 py-2 font-mono text-sm text-gray-100 resize-none focus:outline-none placeholder-gray-600"
          rows={2}
        />
        <button
          onClick={handleEvaluate}
          className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium self-stretch"
        >
          =
        </button>
      </div>

      {/* Result */}
      <ResultDisplay
        result={result}
        type={resultType}
        error={error}
        executionTime={execTime}
        isSymbolic={isSymbolicResult}
        latex={resultLatex}
      />
    </div>
  )
})
```

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): build expression bar with LaTeX preview, result display, and history navigation"
```

---

### Task 9: Wire calculator panel + expression bar into ISELayout

**Files:**
- Modify: `demo/mathjs-calc/src/layouts/ISELayout.tsx`

**Step 1: Replace placeholders with real components**

Update `demo/mathjs-calc/src/layouts/ISELayout.tsx`:

```tsx
import React, { useRef } from 'react'
import { Allotment } from 'allotment'
import { useStore } from '../store/useStore'
import { ISECalculatorPanel } from '../panels/ISECalculatorPanel'
import { ISEExpressionBar, type ExpressionBarHandle } from '../components/ISEExpressionBar'

// Graph placeholder — will be replaced in Task 10
function GraphCanvasPlaceholder() {
  return (
    <div className="h-full bg-gray-950 flex items-center justify-center text-gray-600">
      <div className="text-center">
        <div className="text-4xl mb-2">📈</div>
        <div className="text-sm">Graph Canvas</div>
        <div className="text-xs mt-1">Use plot(expr) to graph functions</div>
      </div>
    </div>
  )
}

export function ISELayout() {
  const graphCollapsed = useStore((s) => s.graphCollapsed)
  const expressionBarRef = useRef<ExpressionBarHandle>(null)

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Main area: calculator + graph */}
      <div className="flex-1 min-h-0">
        <Allotment>
          <Allotment.Pane minSize={320} preferredSize="40%">
            <ISECalculatorPanel
              onInsertToExpression={(text, offset) => expressionBarRef.current?.insert(text, offset)}
              onDeleteFromExpression={() => expressionBarRef.current?.deleteChar()}
              onClearExpression={() => expressionBarRef.current?.clear()}
              onEvaluateExpression={() => expressionBarRef.current?.evaluate()}
            />
          </Allotment.Pane>
          {!graphCollapsed && (
            <Allotment.Pane minSize={300} preferredSize="60%">
              <GraphCanvasPlaceholder />
            </Allotment.Pane>
          )}
        </Allotment>
      </div>

      {/* Expression bar at bottom */}
      <div className="border-t border-gray-800" style={{ minHeight: 100, height: 140 }}>
        <ISEExpressionBar ref={expressionBarRef} />
      </div>
    </div>
  )
}
```

**Step 2: Verify full layout works**

```bash
cd demo/mathjs-calc && npm run dev
```

Expected: Calculator panel on left with toolbar, symbolic area, variable explorer, button grid. Graph placeholder on right. Expression bar at bottom with LaTeX preview. Clicking toolbar icons inserts templates into expression bar. Typing expressions and pressing Enter evaluates them.

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): wire calculator panel and expression bar into three-zone ISE layout"
```

---

## Phase 5: Graph Canvas

### Task 10: Build 2D graph canvas with Plotly

**Files:**
- Create: `demo/mathjs-calc/src/components/GraphCanvas.tsx`
- Create: `demo/mathjs-calc/src/components/GraphToolbar.tsx`
- Create: `demo/mathjs-calc/src/components/FunctionList.tsx`
- Create: `demo/mathjs-calc/src/hooks/usePlot.ts`

**Step 1: Create usePlot hook**

Create `demo/mathjs-calc/src/hooks/usePlot.ts`:

```typescript
import { useCallback } from 'react'
import { useMathParser } from './useMathParser'
import { useStore } from '../store/useStore'
import type { PlotTrace } from '../types'

const COLORS = ['#60a5fa', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#22d3ee', '#fb923c', '#e879f9']
let colorIdx = 0

export function usePlot() {
  const { math } = useMathParser()
  const { addPlotTrace, plotTraces, clearPlots, setPlotMode } = useStore()

  const plot2d = useCallback(
    (expression: string, variable = 'x', xmin = -10, xmax = 10, points = 1000) => {
      const step = (xmax - xmin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        const xVal = xmin + i * step
        scope[variable] = xVal
        try {
          const yVal = math.evaluate(expression, scope)
          if (typeof yVal === 'number' && isFinite(yVal)) {
            xValues.push(xVal)
            yValues.push(yVal)
          } else {
            xValues.push(xVal)
            yValues.push(NaN)
          }
        } catch {
          xValues.push(xVal)
          yValues.push(NaN)
        }
      }

      const color = COLORS[colorIdx % COLORS.length]
      colorIdx++

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression,
        type: '2d',
        color,
        visible: true,
        data: { x: xValues, y: yValues },
      }

      addPlotTrace(trace)
      setPlotMode('2d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  const plot3d = useCallback(
    (expression: string, xmin = -5, xmax = 5, ymin = -5, ymax = 5, points = 50) => {
      const xStep = (xmax - xmin) / points
      const yStep = (ymax - ymin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const zValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        for (let j = 0; j <= points; j++) {
          const xVal = xmin + i * xStep
          const yVal = ymin + j * yStep
          scope.x = xVal
          scope.y = yVal
          try {
            const zVal = math.evaluate(expression, scope)
            xValues.push(xVal)
            yValues.push(yVal)
            zValues.push(typeof zVal === 'number' && isFinite(zVal) ? zVal : NaN)
          } catch {
            xValues.push(xVal)
            yValues.push(yVal)
            zValues.push(NaN)
          }
        }
      }

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression,
        type: '3d',
        color: COLORS[colorIdx % COLORS.length],
        visible: true,
        data: { x: xValues, y: yValues, z: zValues },
      }

      colorIdx++
      addPlotTrace(trace)
      setPlotMode('3d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  const plotParametric = useCallback(
    (xExpr: string, yExpr: string, variable = 't', tmin = 0, tmax = 2 * Math.PI, points = 500) => {
      const step = (tmax - tmin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        const tVal = tmin + i * step
        scope[variable] = tVal
        try {
          const xVal = math.evaluate(xExpr, scope)
          const yVal = math.evaluate(yExpr, scope)
          xValues.push(typeof xVal === 'number' ? xVal : NaN)
          yValues.push(typeof yVal === 'number' ? yVal : NaN)
        } catch {
          xValues.push(NaN)
          yValues.push(NaN)
        }
      }

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression: `(${xExpr}, ${yExpr})`,
        type: 'parametric',
        color: COLORS[colorIdx % COLORS.length],
        visible: true,
        data: { x: xValues, y: yValues },
      }

      colorIdx++
      addPlotTrace(trace)
      setPlotMode('2d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  const plotPolar = useCallback(
    (rExpr: string, variable = 'theta', thetaMin = 0, thetaMax = 2 * Math.PI, points = 500) => {
      const step = (thetaMax - thetaMin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        const theta = thetaMin + i * step
        scope[variable] = theta
        try {
          const r = math.evaluate(rExpr, scope)
          if (typeof r === 'number' && isFinite(r)) {
            xValues.push(r * Math.cos(theta))
            yValues.push(r * Math.sin(theta))
          } else {
            xValues.push(NaN)
            yValues.push(NaN)
          }
        } catch {
          xValues.push(NaN)
          yValues.push(NaN)
        }
      }

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression: `r = ${rExpr}`,
        type: 'polar',
        color: COLORS[colorIdx % COLORS.length],
        visible: true,
        data: { x: xValues, y: yValues },
      }

      colorIdx++
      addPlotTrace(trace)
      setPlotMode('2d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  return { plot2d, plot3d, plotParametric, plotPolar, clearPlots }
}
```

**Step 2: Create FunctionList overlay**

Create `demo/mathjs-calc/src/components/FunctionList.tsx`:

```tsx
import React from 'react'
import { useStore } from '../store/useStore'

export function FunctionList() {
  const { plotTraces, removePlotTrace, togglePlotVisibility } = useStore()

  if (plotTraces.length === 0) return null

  return (
    <div className="absolute top-2 right-2 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg p-2 max-w-[200px] z-10">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Functions</div>
      {plotTraces.map((trace) => (
        <div key={trace.id} className="flex items-center gap-1.5 py-0.5">
          <button
            onClick={() => togglePlotVisibility(trace.id)}
            className="text-xs"
            title={trace.visible ? 'Hide' : 'Show'}
          >
            {trace.visible ? '👁' : '👁‍🗨'}
          </button>
          <div
            className="w-3 h-0.5 rounded"
            style={{ backgroundColor: trace.color }}
          />
          <span className="text-xs font-mono text-gray-300 truncate flex-1">
            {trace.expression}
          </span>
          <button
            onClick={() => removePlotTrace(trace.id)}
            className="text-gray-600 hover:text-red-400 text-xs"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Create GraphToolbar**

Create `demo/mathjs-calc/src/components/GraphToolbar.tsx`:

```tsx
import React from 'react'
import { useStore } from '../store/useStore'

export function GraphToolbar() {
  const { plotMode, setPlotMode, clearPlots, toggleGraphCollapsed } = useStore()

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-800">
      <button
        onClick={() => setPlotMode('2d')}
        className={`px-2 py-0.5 text-xs rounded ${plotMode === '2d' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
      >
        2D
      </button>
      <button
        onClick={() => setPlotMode('3d')}
        className={`px-2 py-0.5 text-xs rounded ${plotMode === '3d' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
      >
        3D
      </button>
      <div className="w-px h-4 bg-gray-800 mx-1" />
      <button
        onClick={clearPlots}
        className="px-2 py-0.5 text-xs text-gray-400 hover:text-red-400 rounded"
        title="Clear all plots"
      >
        Clear
      </button>
      <div className="flex-1" />
      <button
        onClick={toggleGraphCollapsed}
        className="px-2 py-0.5 text-xs text-gray-400 hover:text-gray-200 rounded"
        title="Collapse graph"
      >
        ◀
      </button>
    </div>
  )
}
```

**Step 4: Create GraphCanvas**

Create `demo/mathjs-calc/src/components/GraphCanvas.tsx`:

```tsx
import React, { useMemo } from 'react'
import Plot from 'react-plotly.js'
import { useStore } from '../store/useStore'
import { GraphToolbar } from './GraphToolbar'
import { FunctionList } from './FunctionList'

export function GraphCanvas() {
  const { plotTraces, plotMode } = useStore()

  const visibleTraces = plotTraces.filter((t) => t.visible)

  const plotlyData = useMemo(() => {
    if (plotMode === '3d') {
      return visibleTraces
        .filter((t) => t.type === '3d')
        .map((trace) => {
          // Reshape flat arrays into 2D grid for surface plot
          const n = Math.sqrt(trace.data.x.length) | 0
          const zGrid: number[][] = []
          for (let i = 0; i < n; i++) {
            zGrid.push(trace.data.z!.slice(i * (n), (i + 1) * (n)))
          }
          return {
            type: 'surface' as const,
            z: zGrid,
            colorscale: 'Viridis',
            showscale: false,
            name: trace.expression,
          }
        })
    }

    return visibleTraces
      .filter((t) => t.type !== '3d')
      .map((trace) => ({
        type: 'scatter' as const,
        mode: 'lines' as const,
        x: trace.data.x,
        y: trace.data.y,
        name: trace.expression,
        line: { color: trace.color, width: 2 },
        connectgaps: false,
      }))
  }, [visibleTraces, plotMode])

  const layout = useMemo(() => {
    const base = {
      paper_bgcolor: '#030712',
      plot_bgcolor: '#0a0f1a',
      font: { color: '#9ca3af', size: 10 },
      margin: { l: 50, r: 20, t: 20, b: 40 },
      showlegend: false,
    }

    if (plotMode === '3d') {
      return {
        ...base,
        scene: {
          xaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151' },
          yaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151' },
          zaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151' },
          bgcolor: '#0a0f1a',
        },
      }
    }

    return {
      ...base,
      xaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151', zerolinewidth: 2 },
      yaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151', zerolinewidth: 2 },
    }
  }, [plotMode])

  return (
    <div className="h-full flex flex-col bg-gray-950 relative">
      <GraphToolbar />
      <div className="flex-1 relative">
        <FunctionList />
        {plotlyData.length > 0 ? (
          <Plot
            data={plotlyData as any}
            layout={layout as any}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              displaylogo: false,
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-sm">Enter <code className="text-blue-400">plot(sin(x))</code> to graph</div>
              <div className="text-xs mt-1 text-gray-700">
                Also: plot3d(), plotParametric(), plotPolar()
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): build 2D/3D graph canvas with Plotly, function list, and graph toolbar"
```

---

### Task 11: Connect plot commands to graph canvas

**Files:**
- Modify: `demo/mathjs-calc/src/components/ISEExpressionBar.tsx`
- Modify: `demo/mathjs-calc/src/layouts/ISELayout.tsx`

**Step 1: Update ISEExpressionBar to handle plot commands**

In the `handleEvaluate` function of `ISEExpressionBar.tsx`, replace the plot command placeholder with actual plot dispatch. The ISEExpressionBar needs to accept a `usePlot` instance or we add plot commands to the evaluation pipeline.

Add a prop `onPlotCommand` to ISEExpressionBar that the parent (ISELayout) provides. When a plot command is detected, parse the arguments and call the appropriate plot function.

```typescript
// Add to ISEExpressionBar props:
interface ISEExpressionBarProps {
  onPlotCommand?: (command: string, args: string[]) => void
}

// In handleEvaluate, replace the plot placeholder:
if (expr.startsWith('plot(')) {
  const inner = expr.slice(5, -1) // extract between plot( and )
  onPlotCommand?.('plot', [inner])
  setResult(`Plotted: ${inner}`)
  setResultType('plot')
  setError(null)
  setExecTime(0)
  setIsSymbolicResult(false)
  setResultLatex(null)
  setInput('')
  return
}
// Similar for plot3d, plotParametric, plotPolar, clearPlot
```

**Step 2: Update ISELayout to wire plot commands**

In ISELayout, create usePlot() instance and pass handlers to ISEExpressionBar:

```typescript
const { plot2d, plot3d, plotParametric, plotPolar, clearPlots } = usePlot()

const handlePlotCommand = useCallback((command: string, args: string[]) => {
  switch (command) {
    case 'plot': plot2d(args[0]); break
    case 'plot3d': plot3d(args[0]); break
    case 'clearPlot': clearPlots(); break
    // parametric and polar need more arg parsing
  }
}, [plot2d, plot3d, clearPlots])
```

**Step 3: Replace GraphCanvasPlaceholder with real GraphCanvas**

In ISELayout, import and use the real `GraphCanvas` component.

**Step 4: Verify plotting works end-to-end**

```bash
cd demo/mathjs-calc && npm run dev
```

Type `plot(sin(x))` in expression bar, press Enter.
Expected: Sine wave appears in graph canvas. Function list overlay shows "sin(x)".

Type `plot(x^2)`.
Expected: Parabola overlaid on sine wave with different color.

Type `clearPlot()`.
Expected: Graph cleared.

**Step 5: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): connect plot commands to graph canvas for end-to-end 2D/3D plotting"
```

---

## Phase 6: Variable Explorer Integration

### Task 12: Connect variable explorer to parser state

**Files:**
- Modify: `demo/mathjs-calc/src/hooks/useMathParser.ts`
- Modify: `demo/mathjs-calc/src/components/ISEExpressionBar.tsx`

**Step 1: Add variable extraction to useMathParser**

In `useMathParser.ts`, add a function that extracts all user-defined variables from the parser and returns them as `Record<string, { value: string; type: string }>`:

```typescript
const syncVariables = useCallback(() => {
  const all = parserRef.current.getAll()
  const vars: Record<string, { value: string; type: string }> = {}
  for (const [name, value] of Object.entries(all)) {
    if (typeof value === 'function') continue // skip built-in functions
    vars[name] = {
      value: mathRef.current.format(value, { precision: 6 }),
      type: mathRef.current.typeOf(value),
    }
  }
  return vars
}, [])

// Return syncVariables from the hook
return { evaluate, history, clearParser, getVariables, syncVariables, math: mathRef.current }
```

**Step 2: Call syncVariables after every evaluation**

In ISEExpressionBar, after evaluating an expression (both symbolic and numeric), call:

```typescript
const vars = syncVariables()
updateVariables(vars)
```

This keeps the variable explorer in sync with parser state.

**Step 3: Verify variable explorer updates**

Type `x = 42` → variable explorer shows `x | number | 42`
Type `A = [[1,2],[3,4]]` → shows `A | Matrix | [[1,2],[3,4]]`
Type `x * 2` → result shows `84`, variables unchanged
Click `x` in explorer → `x` inserted into expression bar

**Step 4: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): connect variable explorer to parser state with live sync"
```

---

## Phase 7: Polish & Integration

### Task 13: Add KaTeX CSS and fix styling

**Files:**
- Modify: `demo/mathjs-calc/src/main.tsx`
- Modify: `demo/mathjs-calc/src/index.css`

**Step 1: Import KaTeX CSS globally**

In `demo/mathjs-calc/src/main.tsx`:

```typescript
import 'katex/dist/katex.min.css'
import 'allotment/dist/style.css'
```

**Step 2: Add ISE-specific Tailwind utilities**

In `demo/mathjs-calc/src/index.css`, add after the tailwind directives:

```css
/* Allotment sash styling */
.sash-container .sash {
  background-color: #1f2937 !important;
}
.sash-container .sash:hover {
  background-color: #3b82f6 !important;
}

/* KaTeX overrides for dark theme */
.katex { color: inherit; }
.katex .mord { color: inherit; }

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #030712;
}
::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #374151;
}

/* Plotly dark theme overrides */
.js-plotly-plot .plotly .modebar {
  background: transparent !important;
}
.js-plotly-plot .plotly .modebar-btn path {
  fill: #6b7280 !important;
}
.js-plotly-plot .plotly .modebar-btn:hover path {
  fill: #d1d5db !important;
}
```

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): add KaTeX/Plotly dark theme styling and scrollbar customization"
```

---

### Task 14: Add keyboard shortcuts

**Files:**
- Create: `demo/mathjs-calc/src/hooks/useKeyboardShortcuts.ts`
- Modify: `demo/mathjs-calc/src/layouts/ISELayout.tsx`

**Step 1: Create keyboard shortcuts hook**

Create `demo/mathjs-calc/src/hooks/useKeyboardShortcuts.ts`:

```typescript
import { useEffect } from 'react'
import { useStore } from '../store/useStore'

interface ShortcutHandlers {
  onFocusExpression: () => void
  onToggleGraph: () => void
  onClearPlots: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+E: focus expression bar
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        handlers.onFocusExpression()
      }
      // Ctrl+G: toggle graph panel
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        handlers.onToggleGraph()
      }
      // Ctrl+L: clear plots
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        handlers.onClearPlots()
      }
      // Escape: focus expression bar
      if (e.key === 'Escape') {
        handlers.onFocusExpression()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
```

**Step 2: Wire into ISELayout**

Add keyboard shortcuts to ISELayout, connecting to expression bar focus, graph toggle, and clear plots.

**Step 3: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): add keyboard shortcuts (Ctrl+E focus, Ctrl+G toggle graph, Ctrl+L clear)"
```

---

### Task 15: Update persistence for ISE state

**Files:**
- Modify: `demo/mathjs-calc/src/hooks/usePersistence.ts`

**Step 1: Extend persistence to save ISE-specific state**

Update to also save/restore: `plotTraces` (without data — just expressions), `symbolicHistory` (last 20), `graphCollapsed`, `viewMode`, `config`.

On load, re-evaluate plot expressions to regenerate data (since we don't persist the full data arrays).

**Step 2: Commit**

```bash
git add demo/mathjs-calc/src/
git commit -m "feat(ise): extend persistence to save ISE layout, plot expressions, and symbolic history"
```

---

### Task 16: Final integration test and README update

**Files:**
- Modify: `demo/mathjs-calc/README.md`

**Step 1: Smoke test all features**

```bash
cd demo/mathjs-calc && npm run dev
```

Verify:
- [ ] Three-zone layout renders (calculator, graph, expression bar)
- [ ] Toolbar ribbon icons insert templates into expression bar
- [ ] Expression evaluation works (numeric, symbolic)
- [ ] LaTeX preview renders as you type
- [ ] Symbolic output shows KaTeX-rendered input/output
- [ ] Variable explorer updates after defining variables
- [ ] `plot(sin(x))` renders sine wave in graph canvas
- [ ] `plot(x^2)` overlays parabola
- [ ] `plot3d(sin(x)*cos(y))` renders 3D surface
- [ ] Function list overlay shows/hides/deletes traces
- [ ] Graph zoom/pan/trace works
- [ ] Keyboard shortcuts work (Ctrl+E, Ctrl+G, Ctrl+L)
- [ ] Statistics and Performance dashboards accessible via toolbar
- [ ] State persists across page refresh
- [ ] Resizable split panes work

**Step 2: Update README**

Update `demo/mathjs-calc/README.md` to document ISE features, keyboard shortcuts, plot commands, and architecture.

**Step 3: Commit**

```bash
git add demo/mathjs-calc/
git commit -m "docs(ise): update README with ISE workbench features and keyboard shortcuts"
```

---

## Summary

| Phase | Tasks | What It Delivers |
|-------|-------|-----------------|
| 1: Dependencies & Layout | 1-2 | Plotly, KaTeX, allotment installed; three-zone split layout |
| 2: Toolbar Ribbon | 3-4 | 35+ math icons, 7-group toolbar with template insertion |
| 3: Calculator Panel | 5-7 | Symbolic output (KaTeX), variable explorer, enhanced 6x8 button grid |
| 4: Expression Bar | 8-9 | Multi-line input, LaTeX preview, result display, history nav, wired to layout |
| 5: Graph Canvas | 10-11 | Plotly 2D/3D, function list, plot commands connected end-to-end |
| 6: Variable Explorer | 12 | Live sync with parser, click-to-insert |
| 7: Polish | 13-16 | Dark theme styling, keyboard shortcuts, persistence, README |

**Total: 16 tasks across 7 phases. Each task produces a working commit.**
