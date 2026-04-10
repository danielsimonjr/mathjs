# Integrated Scientific Environment (ISE) Workbench — Design Document

**Date:** 2026-03-05
**App name:** mathjs-calc (evolution from calculator demo to ISE)
**Purpose:** Transform the calculator demo into a full advanced integrated scientific environment/workbench in the style of a highly advanced virtual TI graphing scientific calculator with Mathcad-inspired modern dashboard aesthetics. Demo application for the math.js library. Note: TypeScript/WASM references are historical — see [MathTS](https://github.com/danielsimonjr/MathTS).

**Key references:** TI-89/Nspire (interaction model), Mathcad (symbolic rendering), Desmos (graphing UX), MATLAB (power features)

---

## 1. Layout Architecture

### Three-Zone Split Layout

```
┌─────────────────────────┬──────────────────────────────┐
│                         │                              │
│   CALCULATOR PANEL      │      GRAPH CANVAS            │
│   (left, ~40% width)    │      (right, ~60% width)     │
│                         │                              │
│   ┌───────────────────┐ │      • 2D function plots     │
│   │ Icon Toolbar      │ │      • 3D surface plots      │
│   │ Ribbon (7 groups) │ │      • Zoom/pan/trace        │
│   └───────────────────┘ │      • Function list overlay  │
│   ┌───────────────────┐ │      • Axis labels/grid      │
│   │ Symbolic Output   │ │                              │
│   │ (KaTeX rendered)  │ │                              │
│   └───────────────────┘ │                              │
│   ┌───────────────────┐ │                              │
│   │ Variable Explorer │ │                              │
│   └───────────────────┘ │                              │
│   ┌───────────────────┐ │                              │
│   │ Button Grid       │ │                              │
│   │ (scientific keys) │ │                              │
│   └───────────────────┘ │                              │
│                         │                              │
├─────────────────────────┴──────────────────────────────┤
│  EXPRESSION BAR (bottom, full width, expandable)        │
│  ┌─────────────────────────────────────────────────────┐│
│  │ LaTeX preview of current expression                 ││
│  ├─────────────────────────────────────────────────────┤│
│  │ Input: multi-line, syntax highlighting, autocomplete││
│  ├─────────────────────────────────────────────────────┤│
│  │ Result: value + type badge [number][matrix][plot]   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Resizing Behavior
- **Vertical divider** (calculator | graph): draggable, min 300px each side
- **Horizontal divider** (panels | expression bar): draggable, expression bar min 80px, max 40% height
- **Graph collapse**: double-click divider or button to collapse graph, giving calculator full width
- **Graph expand**: same gesture to restore

### Visual Style
- Modern dashboard: dark theme (gray-950 base), glassmorphism subtle borders
- Icon-heavy toolbar with grouped sections and visual separators
- Clean typography: monospace for expressions, sans-serif for labels
- Accent colors: blue (primary actions), green (results), purple (symbolic), orange (plots)

---

## 2. Calculator Panel

### 2.1 Icon Toolbar Ribbon

Horizontal toolbar at top of calculator panel. Icons grouped with vertical separators between groups. Each icon has a tooltip. Icons use a consistent 20x20 size with 4px padding.

| Group | Icons | Action on Click |
|-------|-------|-----------------|
| **Algebra** | simplify, expand, factor, solve, rationalize | Inserts template: `simplify("")`, `expand("")`, etc. |
| **Calculus** | d/dx (derivative), ∫ (integral), lim (limit), Σ (sum), taylor | Inserts: `derivative("","x")`, `integrate("","x")`, etc. |
| **Matrix** | det, inv, A^T, λ (eigenvalues), [grid] (matrix editor) | Inserts: `det()`, `inv()`, `transpose()`, `eigs()`, opens matrix editor |
| **Trig** | sin, cos, tan, sin⁻¹, cos⁻¹, tan⁻¹, hyp toggle | Inserts: `sin()`, etc. Hyp toggle switches to sinh/cosh/tanh |
| **Stats** | x̄ (mean), σ (std), med, hist, reg (regression) | Inserts: `mean()`, `std()`, `median()`, opens histogram, `polyfit()` |
| **Plot** | 📈 y=f(x), ⟳ parametric, ◎ polar, 🏔 3D, 🗑 clear | Inserts: `plot()`, `plotParametric()`, `plotPolar()`, `plot3d()`, clears graph |
| **Settings** | DEG/RAD, number type, precision, JS/WASM engine | Opens dropdown menus for each setting |

**Template insertion behavior**: Clicking an icon inserts the function template into the expression bar with the cursor positioned at the first argument. If text is selected in the expression bar, it wraps the selection. Example: select `x^3`, click d/dx → `derivative("x^3", "x")`.

### 2.2 Symbolic Output Area

- Displays the last symbolic computation result
- **Input**: rendered as formatted LaTeX (e.g., `d/dx(x³ + 2x)` renders as the proper calculus notation)
- **Output**: rendered as formatted LaTeX (e.g., `3x² + 2`)
- **Arrow**: visual arrow or separator between input and output
- Scrollable history of symbolic results (max 50)
- Click any previous result to copy its expression to the expression bar
- Rendered using **KaTeX** (fast, no server, full LaTeX math support)

### 2.3 Variable Explorer

- Compact scrollable list showing all defined variables
- Each row: name (monospace), type badge, value preview
- Types color-coded: number (green), matrix (blue), string (gray), function (yellow), complex (purple)
- Click to inspect full value (matrices expand to grid view)
- Double-click to edit value inline
- Right-click context menu: rename, delete, plot (if numeric/array)
- Auto-updates after every expression evaluation
- Shows special constants: `pi`, `e`, `phi`, `i` (dimmed, non-editable)

### 2.4 Button Grid (Enhanced)

Reorganized 6-column grid with additional symbolic keys:

```
Row 1: d/dx   ∫     Σ     ∏     lim   ∞
Row 2: sin    cos   tan   asin  acos  atan
Row 3: log    ln    e^x   10^x  sqrt  x^y
Row 4: (      )     [     ]     |x|   n!
Row 5: 7      8     9     DEL   AC    ANS
Row 6: 4      5     6     ×     ÷     mod
Row 7: 1      2     3     +     −     =
Row 8: 0      .     π     e     i     EXP
```

- Row 1 is symbolic operations (new)
- Row 8 includes constants and scientific notation (EXP = ×10^)
- Button appearance matches toolbar style (dark, subtle borders, color-coded by type)

---

## 3. Graph Canvas

### 3.1 Rendering Engine

**Plotly.js** for all graphing:
- WebGL-accelerated 2D and 3D rendering
- Built-in zoom, pan, trace, hover tooltips
- Export to PNG/SVG
- Responsive resizing
- Extensive customization (colors, axes, gridlines)

### 3.2 2D Graphing

**Entry methods** (both work):
1. Expression bar: `plot(sin(x))` or `plot(x^2, x, -10, 10)`
2. Calculator toolbar: click 📈 icon → inserts `plot("")` template

**Supported plot types**:
- `plot(expr)` — y=f(x) with auto-detected range
- `plot(expr, x, xmin, xmax)` — explicit x range
- `plot(expr, x, xmin, xmax, options)` — with styling: `{color: "red", style: "dashed"}`
- `plotParametric(x_expr, y_expr, t, tmin, tmax)` — parametric curves
- `plotPolar(r_expr, theta, thetamin, thetamax)` — polar plots
- `plotImplicit(expr, x, y, range)` — implicit curves (x² + y² = 1)

**Multi-function overlay**:
- Each `plot()` call adds a trace (doesn't replace)
- Auto-assigned colors from a palette (blue, orange, green, red, purple, cyan...)
- `clearPlot()` or toolbar 🗑 icon removes all traces

**Interactive features**:
- Scroll wheel: zoom in/out centered on cursor
- Click+drag: pan
- Hover: shows (x, y) coordinates on nearest point
- Double-click: reset to auto-fit view
- Shift+click: place a marker/annotation

**Function list overlay** (top-right of graph):
- Shows each plotted function with color swatch
- Toggle visibility (eye icon)
- Delete individual functions (x icon)
- Click to highlight that trace

### 3.3 3D Surface Plots

- `plot3d(expr)` — z=f(x,y) surface plot
- `plot3d(expr, x, xmin, xmax, y, ymin, ymax)` — explicit ranges
- Mouse drag to rotate, scroll to zoom
- Color mapping: height-based gradient (viridis, plasma, etc.)
- Wireframe toggle
- Switching between 2D and 3D modes (graph canvas adapts)

### 3.4 Graph Toolbar

Small toolbar at top of graph canvas:
- Zoom in / Zoom out / Reset view
- Toggle grid / Toggle axes
- 2D / 3D mode switch
- Screenshot (export to clipboard/file)
- Fullscreen (graph takes entire window, press Esc to exit)

---

## 4. Expression Bar

### 4.1 Input

- **Multi-line**: Enter evaluates, Shift+Enter adds new line
- **Syntax highlighting**: function names (yellow), numbers (green), operators (gray), strings (orange), variables (white)
- **Autocomplete**: triggered by typing, shows matching function names with signature hints
- **History**: Up/Down arrow navigates previous expressions
- **Wrap selection**: toolbar icon clicks wrap selected text (select `x^2`, click ∫ → `integrate("x^2", "x")`)

### 4.2 LaTeX Preview

- Live-rendered KaTeX above the input as you type
- Parses math.js syntax and renders as proper mathematical notation
- Example: typing `derivative("sin(x^2)", "x")` shows: d/dx[sin(x²)]
- Updates on every keystroke (debounced 100ms)
- Toggleable (some users may find it distracting)

### 4.3 Result Display

- Shows below input after evaluation
- Type badge: `[number]` `[matrix]` `[complex]` `[unit]` `[symbolic]` `[plot]` `[function]`
- Numeric results: formatted with configured precision
- Matrix results: rendered as grid (collapsible if large)
- Symbolic results: rendered in KaTeX
- Plot results: shows "Plotted: f(x) = sin(x)" with color swatch
- Error results: red text with descriptive message

### 4.4 Special Commands

| Command | Action |
|---------|--------|
| `plot(expr)` | Plot 2D function |
| `plot3d(expr)` | Plot 3D surface |
| `plotParametric(...)` | Parametric curve |
| `plotPolar(...)` | Polar plot |
| `clearPlot()` | Clear all plots |
| `vars` | List all variables |
| `clear` | Clear all variables |
| `help(fn)` | Show function documentation |
| `table(expr, x, start, end, step)` | Generate value table |

---

## 5. Symbolic Computing Integration

### math.js Symbolic Functions (already available)

| Function | Example | Output |
|----------|---------|--------|
| `simplify(expr)` | `simplify("2x + 3x")` | `5 x` |
| `derivative(expr, var)` | `derivative("x^3", "x")` | `3 x^2` |
| `rationalize(expr)` | `rationalize("x/y + y/x")` | `(x^2 + y^2) / (x y)` |
| `solve(expr, var)` | `solve("x^2 - 4", "x")` | `[2, -2]` |
| `expand(expr)` | `expand("(x+1)^3")` | `x^3 + 3x^2 + 3x + 1` |

### LaTeX Conversion Pipeline

```
User input (math.js syntax)
  → math.parse(expr)           → AST
  → evaluate or transform      → result AST or value
  → math.parse(result).toTex() → LaTeX string
  → KaTeX.render(latex)        → rendered HTML
```

math.js nodes already have `.toTex()` methods, so the conversion is built-in.

### Symbolic Output Formatting

All symbolic results display as:
1. **Input** rendered in LaTeX notation (top)
2. **Equals sign** or arrow separator
3. **Output** rendered in LaTeX notation (bottom)

Example for `derivative("sin(x^2)", "x")`:
```
  d
 ── [sin(x²)]
 dx
      =
 2x · cos(x²)
```

---

## 6. Data Flow

### State Architecture (Zustand)

```typescript
interface ISEState {
  // Layout
  calcWidth: number          // percentage, default 40
  expressionHeight: number   // pixels, default 120
  graphCollapsed: boolean

  // Parser
  // (math instance and parser live as refs, not in store)

  // Variables
  variables: Map<string, { value: unknown, type: string }>

  // Plots
  plotTraces: PlotTrace[]    // { id, expression, type, color, visible, data }
  plotMode: '2d' | '3d'
  plotConfig: { showGrid, showAxes, xRange, yRange }

  // Symbolic
  symbolicHistory: SymbolicResult[]  // { input, output, latexIn, latexOut }

  // Expression bar
  expressionHistory: string[]
  historyIndex: number

  // Config (from existing)
  config: AppConfig
  wasmCapabilities: WasmCapabilities | null
}
```

### Evaluation Flow

```
User types expression in expression bar or clicks calculator button
  → Expression string sent to evaluate()
  → Check if it's a plot command → dispatch to graph
  → Check if it's symbolic (derivative, simplify, etc.) → render LaTeX
  → Otherwise evaluate numerically
  → Update variables in store
  → Update symbolic history
  → Update result display
```

### Plot Flow

```
plot(expr) called
  → Parse expression, extract variable (default: x)
  → Generate x values across range (default -10 to 10, 1000 points)
  → Evaluate expr for each x value using math.evaluate()
  → Create Plotly trace { x: [...], y: [...], name: expr }
  → Add to plotTraces in store
  → Plotly re-renders
```

---

## 7. New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `plotly.js-dist-min` | 2D/3D graphing | ~1 MB |
| `katex` | LaTeX rendering | ~300 KB |
| `react-plotly.js` | React wrapper for Plotly | ~5 KB |
| `allotment` | Resizable split panes | ~50 KB |

All existing dependencies (React 19, Zustand, Tailwind, Recharts) remain. Recharts is still used for the Performance Dashboard and Statistics panels. Plotly is used for the main graph canvas.

---

## 8. Migration from Current Calculator

### What stays
- Performance Dashboard panel (Task 10)
- Statistics Dashboard panel (Task 9)
- Zustand store pattern (expanded)
- useMathParser hook (core of everything)
- Electron shell + IPC + WASM integration
- Dark theme base

### What changes
- **App.tsx**: Completely new layout (three-zone split replaces tabbed panels)
- **Calculator panel**: Rebuilt with toolbar ribbon, symbolic output, variable explorer, enhanced button grid
- **Graph canvas**: New (replaces Signal Studio's simple charts)
- **Expression bar**: Rebuilt from ExpressionBar component (adds LaTeX preview, autocomplete, multi-line)
- **Tab navigation**: Removed as primary navigation. Performance and Statistics become accessible via a secondary menu or toolbar dropdown.

### What's new
- Graph canvas with Plotly.js
- KaTeX symbolic rendering
- Resizable split panes
- Icon toolbar ribbon
- Variable explorer
- Plot command system
- LaTeX preview pipeline
- Enhanced button grid with symbolic keys

---

## 9. Summary

| Component | Technology | Key Feature |
|-----------|-----------|-------------|
| Layout | allotment (split panes) | Three-zone resizable layout |
| Calculator | React + Tailwind | Icon toolbar, enhanced button grid |
| Symbolic | math.js + KaTeX | LaTeX-rendered input/output |
| Graphing | Plotly.js | 2D/3D interactive plots |
| Expression | Custom input | Syntax highlighting, autocomplete, LaTeX preview |
| State | Zustand | Shared variables, plot traces, config |
| Performance | WASM bridge | Engine toggle (JS/WASM/Auto) |
