# ISE Guided Discovery & User Education — Design Document

**Date:** 2026-03-05
**Purpose:** Close the novice-to-expert gap by embedding learning directly inside the ISE workbench. Users shouldn't need external docs to exploit the full capabilities of the tool.

> **Note:** References to WASM stress-testing in this document are historical. TypeScript/WASM acceleration lives in [MathTS](https://github.com/danielsimonjr/MathTS). This document focuses on UX/education design for the math.js demo application.

---

## The Problem

Every powerful math tool suffers the same fate: users only discover a fraction of what it can do.

| Tool | Power | Discoverability | Actual Usage |
|------|-------|----------------|-------------|
| Desmos | Medium | Excellent | Students use ~80% of features |
| Mathematica | Extreme | Terrible | Most users use <5% of features |
| Mathcad | High | Moderate | Engineers learn what they need, ignore the rest |
| MATLAB | High | Moderate (toolbox-dependent) | Varies wildly by domain |
| **Our ISE** | Growing | Good (toolbar ribbon) | **Opportunity to lead here** |

The tools themselves are never the bottleneck — it's the **"now what do I do with it?"** problem. Desmos succeeds not because it's the most powerful, but because it makes power feel intuitive. Mathematica fails at adoption not because it lacks features, but because users can't find or understand them.

**Our advantage:** We're building from scratch with no legacy UX debt. We can design learning into the tool from day one rather than bolting on documentation after the fact.

---

## Strategy: Guided Discovery at the Point of Need

Instead of external docs users never read, we embed learning **inside the tool itself** at three progressive levels:

### Level 1: "Show Me" — Interactive Example Gallery

**What:** A built-in example library organized by domain, where each example is a one-click load that fills the expression bar, plots results, and annotates what happened.

**Why:** Users learn by seeing, not by reading API references.

**Domain Categories:**
- **Getting Started** — basic arithmetic, variables, functions, plotting
- **Algebra** — simplify, expand, factor, solve equations, systems
- **Calculus** — derivatives, integrals (when available), limits, series
- **Linear Algebra** — matrices, determinants, eigenvalues, decompositions, solving Ax=b
- **Trigonometry** — unit circle, identities, wave superposition
- **Statistics** — descriptive stats, distributions, regression, hypothesis testing
- **Signal Processing** — FFT, filtering, waveform generation, spectral analysis
- **Physics** — projectile motion, harmonic oscillators, orbital mechanics
- **Engineering** — circuit analysis, control systems, structural loads
- **Finance** — compound interest, amortization, portfolio optimization
- **Number Theory** — primes, GCD, modular arithmetic, combinatorics

**Example Progression (within each category):**
```
Beginner:    plot(sin(x))
Intermediate: plot(sin(x) + sin(3*x)/3 + sin(5*x)/5)
Advanced:    Fourier series approximation of square wave with N terms
Expert:      FFT of sampled signal → identify frequency components → filter → reconstruct
```

**UX:**
- Slide-out drawer from left edge (or toolbar button)
- Tree navigation: Category → Subcategory → Example
- Each example shows: title, one-line description, difficulty badge (beginner/intermediate/advanced/expert)
- Click "Load" → expression inserted, evaluated, and plotted
- Click "Load All Steps" → multi-step examples load sequentially
- Examples evaluate in the user's session — they can modify and experiment

### Level 2: "Teach Me" — Contextual Tooltips & Smart Help

**What:** Enhanced tooltips, intelligent error messages, and "what just happened?" explanations embedded at the point of interaction.

**Why:** Users don't leave the tool to learn. Help appears exactly when and where they need it.

**Components:**

#### Smart Tooltips (toolbar icons)
Current: `"Derivative"` (tooltip text)
Enhanced:
```
Derivative — finds the rate of change of an expression
Example: derivative("x^3", "x") → 3x²
[Try It]  [More Examples]
```
- "Try It" button inserts the example into the expression bar
- "More Examples" shows 3-4 progressively harder examples

#### Post-Evaluation Explanations
After evaluating `det([[1,2],[3,4]])`:
```
Result: -2
[What happened?]
  The determinant of a 2×2 matrix [[a,b],[c,d]] = ad - bc
  = (1)(4) - (2)(3) = 4 - 6 = -2
  A negative determinant means the matrix reverses orientation.
```
- Expandable "What happened?" section below the result
- Shows the mathematical reasoning, not just the answer
- Includes geometric/physical interpretation where relevant

#### Teaching Error Messages
Instead of:
```
Error: Unexpected token
```
Show:
```
Syntax Error: Unexpected token at position 4
Did you mean sin(x) instead of sin x?
math.js requires parentheses for function calls: sin(x), cos(x), log(x)
[Fix it]  [Learn about syntax]
```
- Detect common mistakes and suggest corrections
- "Fix it" button applies the correction automatically
- Link to relevant syntax examples

#### Function Signature Hints
When typing in the expression bar, show inline hints:
```
derivative( ← derivative(expression, variable)
            Example: derivative("x^3 + 2*x", "x")
```

### Level 3: "Challenge Me" — Application Notes & Guided Workflows

**What:** Step-by-step walkthroughs that solve real-world problems using the ISE. Each step evaluates live in the tool.

**Why:** Users don't just want to know syntax — they want to solve problems. Application notes bridge "I know how derivative() works" to "I can design a control system."

**Format (per application note):**
```
Title: Analyzing a Damped Harmonic Oscillator
Difficulty: Intermediate
Domain: Physics
Estimated time: 10 minutes
Prerequisites: Basic calculus, plotting

Step 1: Define the system parameters
  > m = 1        (mass in kg)
  > k = 10       (spring constant in N/m)
  > b = 0.5      (damping coefficient)
  [Evaluate All]

Step 2: Calculate natural frequency and damping ratio
  > omega_n = sqrt(k/m)
  > zeta = b / (2 * sqrt(k * m))
  [Evaluate All]

Step 3: Plot the response
  > plot(exp(-zeta * omega_n * x) * cos(omega_n * sqrt(1 - zeta^2) * x))
  [Evaluate All]

Step 4: Explore — what happens when you increase damping?
  Try changing b to 2, 5, and 10. What do you observe?
  [Load variation]

Key Takeaway: When zeta < 1, the system oscillates with decaying amplitude.
When zeta = 1, it's critically damped. When zeta > 1, it's overdamped.
```

**Application Note Library (initial set):**

| Title | Domain | Difficulty | WASM Stress-Test |
|-------|--------|-----------|-----------------|
| Plotting Your First Function | Getting Started | Beginner | No |
| Solving Quadratic Equations | Algebra | Beginner | No |
| Derivative Visualization | Calculus | Beginner | No |
| Matrix Operations & Linear Systems | Linear Algebra | Intermediate | Yes (large matrices) |
| Fourier Series Approximation | Signal Processing | Intermediate | Yes (FFT) |
| Damped Harmonic Oscillator | Physics | Intermediate | No |
| Curve Fitting Experimental Data | Statistics | Intermediate | Yes (regression) |
| Eigenvalue Analysis of Structures | Engineering | Advanced | Yes (eigs on large matrices) |
| Portfolio Optimization | Finance | Advanced | Yes (matrix operations) |
| Image Convolution Basics | Signal Processing | Advanced | Yes (large matrix multiply) |
| Numerical ODE Integration | Physics | Expert | Yes (WASM ODE solvers) |
| PCA and Dimensionality Reduction | Statistics | Expert | Yes (SVD on large datasets) |

---

## What Makes This Different From Traditional Documentation

| Traditional Docs | Our Guided Discovery |
|-----------------|---------------------|
| External website, separate from tool | Inside the tool, one click away |
| Read → switch to tool → try → switch back | Read and do simultaneously |
| Generic function reference | Domain-specific application notes |
| "Here's the syntax" | "Here's why you'd use this and what it means" |
| Static text | Live expressions that evaluate in your session |
| One difficulty level | Progressive: beginner → intermediate → advanced → expert |
| Assumes motivation | Builds curiosity through guided exploration |
| Organized by API surface | Organized by what users want to accomplish |

---

## Implementation Components

### Component 1: Example Drawer
- Slide-out panel (left edge or toolbar button)
- Tree navigation with search/filter
- Difficulty badges and domain tags
- One-click "Load" that inserts and evaluates
- Multi-step examples with "Load All Steps" and "Next Step"

### Component 2: Smart Tooltips
- Enhanced toolbar tooltips with live examples and "Try It" buttons
- Post-evaluation "What happened?" expandable explanations
- Teaching error messages with "Fix it" and suggestions
- Inline function signature hints in expression bar

### Component 3: Application Notes Viewer
- Full-width panel (replaces graph or opens as modal)
- Step-by-step narrative with embedded evaluate buttons
- Progress tracking (which steps completed)
- "Explore" prompts encouraging parameter modification
- Shareable (export as standalone HTML or link)

### Component 4: Onboarding Flow
- First-launch guided tour (5 steps, <2 minutes)
- Highlights: expression bar, toolbar, graph, symbolic output, variable explorer
- Ends with "Try your first plot: plot(sin(x))" prompt
- Dismissable, never shows again after completion

---

## Content Creation Strategy

Application notes and examples are the most labor-intensive part. Strategy:

1. **Start with 12 application notes** (the table above) covering beginner to expert
2. **Each toolbar icon gets 3 examples** (beginner, intermediate, advanced) — ~100 examples total
3. **Community contributions** — if we open-source the example format (JSON/Markdown), users can submit their own
4. **AI-assisted generation** — use Claude to draft application notes, then human-review for accuracy and pedagogy

---

## Success Metrics

| Metric | Target |
|--------|--------|
| % of toolbar icons used per session | >50% (vs current unknown baseline) |
| % of users who try a plot command | >80% within first session |
| % of users who use symbolic functions | >40% within first 3 sessions |
| Average unique functions used per session | >10 |
| Time from first launch to first plot | <60 seconds |
| Application note completion rate | >60% for beginner, >30% for advanced |

---

## Relationship to Gap Analysis

This design directly addresses the gap analysis finding that the ISE's strength is **discoverability via the toolbar ribbon**. Guided discovery doubles down on that strength while addressing the deeper gap of **"users can't fully exploit capabilities without detailed examples and application notes."**

The application notes also serve as **WASM stress-test scenarios** — each advanced/expert note exercises heavy computation paths (large matrices, FFT, ODE solvers, SVD) that validate the TS+AS+WASM refactor under realistic workloads.

**Reference:** `docs/plans/2026-03-05-ise-gap-analysis.md`
