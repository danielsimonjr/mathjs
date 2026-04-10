# Deno Notebook — Development Option for Live Document Feature

**Date:** 2026-03-05
**Purpose:** Evaluate Deno's built-in Jupyter kernel as a development option for the ISE's live document/notebook model (Iteration 3 on the gap analysis roadmap).

> **Note:** TypeScript references in this document are about Deno's TypeScript runtime (not math.js's internals). References to WASM limitations are historical. Math.js is now a pure JavaScript library — see [MathTS](https://github.com/danielsimonjr/MathTS) for TypeScript/WASM.

---

## What Is Deno Jupyter?

Deno ships a built-in Jupyter kernel since v1.37. No plugins, no third-party kernels — just:

```bash
deno jupyter --install
```

Then open any Jupyter client (JupyterLab, VS Code Notebooks, nteract) and select the Deno kernel.

**Key capabilities:**
- **TypeScript-first** — no compilation step, no ts-node, no transpiler config
- **Top-level await** — `const result = await fetch(...)` works in any cell
- **npm imports** — `import { create, all } from "npm:mathjs"` just works
- **Rich output** — return objects with `Symbol.for("Jupyter.display")` to render HTML, SVG, LaTeX, images
- **Built-in helpers** — `Deno.jupyter.html()`, `Deno.jupyter.md()`, `Deno.jupyter.svg()`
- **Web-standard APIs** — fetch, WebSocket, crypto, streams all available
- **Permissions model** — `--allow-net`, `--allow-read` for sandboxed execution

---

## How Math.js Integrates with Deno Jupyter

### Basic Usage

```typescript
// Cell 1: Import math.js
import { create, all } from "npm:mathjs"
const math = create(all)

// Cell 2: Evaluate expressions
math.evaluate("derivative('x^3 + 2*x', 'x')")
// → "3 * x ^ 2 + 2"

// Cell 3: Rich LaTeX output
const expr = math.parse("x^3 + 2*x")
const deriv = math.derivative(expr, "x")
{
  [Symbol.for("Jupyter.display")]() {
    return {
      "text/latex": `$$\\frac{d}{dx}\\left(${expr.toTex()}\\right) = ${deriv.toTex()}$$`,
      "text/plain": deriv.toString()
    }
  }
}
```

### Rich Plotting

```typescript
// Using Observable Plot (best Deno Jupyter support)
import * as Plot from "npm:@observablehq/plot"

const xs = math.range(0, 2 * math.pi, 0.1).toArray()
const ys = xs.map(x => math.sin(x))

const svg = Plot.line(xs.map((x, i) => [x, ys[i]])).plot({ width: 600, height: 400 })
Deno.jupyter.html(svg.outerHTML)
```

### Matrix Display

```typescript
const A = math.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
const { values, vectors } = math.eigs(A)

{
  [Symbol.for("Jupyter.display")]() {
    return {
      "text/latex": `$$A = ${math.parse(math.format(A)).toTex()}$$\n$$\\lambda = ${math.format(values)}$$`,
      "text/plain": math.format(A)
    }
  }
}
```

---

## Three Approaches to the Live Document Feature

### Option A: Deno Notebook Integration (External)

Use Deno Jupyter as the notebook environment. The ISE becomes a companion tool, not the notebook itself.

**How it works:**
- Users write math.js notebooks in JupyterLab/VS Code with the Deno kernel
- We ship a `mathjs-jupyter` npm package with display helpers (auto-LaTeX, auto-plot)
- The ISE workbench remains a calculator/explorer; notebooks are separate

**Pros:**
- Zero notebook infrastructure to build — Jupyter ecosystem handles it
- Cell reordering, markdown, export to PDF/HTML all come free
- Collaboration via JupyterHub or VS Code Live Share
- `.ipynb` format is industry standard
- Deno's TypeScript support means our TS source works directly

**Cons:**
- Two separate tools — users switch between ISE and notebook
- No WASM acceleration (Deno runs V8, not our WASM modules)
- Dependency on Deno runtime (users must install it)
- Less control over UX — we're constrained by Jupyter client capabilities
- No stress-test value for our WASM pipeline

**Effort:** Low (2-3 weeks for display helpers package)

### Option B: Custom Built-In Notebook (Internal)

Build the notebook directly into the ISE workbench as a new view mode.

**How it works:**
- Cell-based editor in the ISE (Monaco or CodeMirror cells)
- Each cell evaluates via our math.js instance (JS or WASM)
- Dependency chain: changing cell 3 auto-updates cells 4, 5, 6...
- Markdown cells between code cells
- Export to JSON, PDF, standalone HTML

**Pros:**
- Unified experience — notebook IS the ISE
- Full WASM acceleration for every cell evaluation
- Direct stress-test of the TS+AS+WASM pipeline (100-cell dependency chains with matrix ops)
- Complete UX control — can match Mathcad's live document feel exactly
- No external dependencies

**Cons:**
- Significant engineering effort for cell management, dependency tracking, serialization
- Must build markdown rendering, cell reordering, export pipeline from scratch
- Risk of building a mediocre notebook when excellent ones exist
- No ecosystem compatibility (not `.ipynb`)

**Effort:** High (8-12 weeks for MVP)

### Option C: Hybrid — ISE Notebook + Deno Export (Recommended)

Build a lightweight notebook in the ISE, with Deno Jupyter as an export/interop target.

**How it works:**
- ISE gets a "Document Mode" — cells with dependency tracking, markdown annotations
- Evaluations run through our WASM-accelerated math.js
- "Export to Deno Notebook" converts the document to a `.ipynb` with Deno kernel metadata
- "Import from Notebook" loads `.ipynb` cells into ISE document mode
- Application notes (from guided discovery design) ARE notebook documents

**Pros:**
- Best of both worlds: custom UX + ecosystem compatibility
- WASM stress-test value (primary evaluation runs our pipeline)
- Application notes become importable notebooks
- Users can start in ISE, export to Jupyter for sharing/collaboration
- Incremental: ship ISE notebook first, add Deno export later

**Cons:**
- Still significant effort for the ISE notebook component
- Import/export translation layer adds complexity
- Two evaluation environments (ISE uses WASM, Deno uses V8) may produce different performance characteristics

**Effort:** Medium-High (6-8 weeks for ISE notebook, +2 weeks for Deno interop)

---

## Recommendation: Option C (Hybrid)

The hybrid approach maximizes WASM stress-test value while keeping a path to ecosystem compatibility. The implementation sequence:

1. **Phase 1 (Iteration 3):** Build ISE Document Mode — cell-based evaluation with dependency chain, markdown cells, auto-update. This directly stress-tests WASM with multi-cell dependency chains.

2. **Phase 2 (Iteration 3+):** Add export to `.ipynb` with Deno kernel metadata. Application notes from the guided discovery design become the first notebook documents.

3. **Phase 3 (Future):** Add import from `.ipynb`, enabling round-trip between ISE and Jupyter ecosystem.

---

## Deno Jupyter Limitations to Note

- **No WASM module loading** — Deno's Jupyter kernel runs V8; our AssemblyScript WASM modules would need a separate loading path
- **Observable Plot > Plotly** — Plotly has limited Deno support; Observable Plot is the established choice for Deno Jupyter visualization
- **Widget support** — Still maturing via the anywidget project; not as mature as ipywidgets in Python
- **Adoption** — Deno Jupyter is newer than Python/Julia kernels; smaller community, fewer examples
- **Permission model** — `--allow-all` is typically needed for math.js (file system access for some features)

---

## Reference

- **Gap Analysis:** `docs/plans/2026-03-05-ise-gap-analysis.md` — Section 2 (Live Document Model)
- **Guided Discovery:** `docs/plans/2026-03-05-ise-guided-discovery-design.md` — Application notes as notebook content
- **Deno Jupyter Docs:** https://docs.deno.com/runtime/reference/cli/jupyter/
