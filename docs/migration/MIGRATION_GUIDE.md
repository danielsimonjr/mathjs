# Migration Guide: v15.6.0

> **v15.6.0 (2026-04-10)** — 444+ functions across 21 categories, 9,263 tests passing.
> See [Full Function Reference](https://danielsimonjr.github.io/mathjs/) for complete API documentation.

## What's New in v15.6.0

v15.6.0 is a **fully backward-compatible** release. No existing code needs to change.

### New Capabilities

- **444+ built-in functions** (up from ~228 in v15.0.0), spanning 21 categories
- **92 CAS / algebra functions** including: `integrate`, `solve`, `factor`, `fullSimplify`, `trigExpand`, `trigReduce`, `groebnerBasis`, `laplace`, `inverseLaplace`, `limit`, `series`, `taylor`, `discriminant`, `polynomialLCM`, `resultant`, `assume`, `element`, `piecewise`, `normalForm`, `eliminate`, `reduce`, `minimalPolynomial`, `toRadicals`, `rowReduce`, `asymptotic`, and more — see [docs/expressions/algebra.md](../expressions/algebra.md)
- **[Online function reference](https://danielsimonjr.github.io/mathjs/)** — 21 per-category pages with syntax, type signatures, parameter tables, and examples
- **Build fix**: all 444 functions are now included in the `dist/` bundle (previously only ~228 were bundled)
- **59 advanced functions** (Phase 3): optimization, ODE solvers, hypothesis testing, signal processing, advanced linear algebra
- **30 symbolic CAS functions** (Phase 4): Gröbner basis, Laplace transforms, trigonometric transformations, assumption system, multivariate Taylor series

### Using the New CAS Functions

All new functions are available without any configuration changes:

```javascript
import { create, all } from 'mathjs'
const math = create(all)

// Symbolic integration
math.integrate('x^2', 'x').toString()      // '1/3 * x^3'

// Symbolic equation solving
math.solve('x^2 - 4', 'x')                // [2, -2]

// Polynomial factoring
math.factor('x^2 - 4').toString()          // '(x - 2) * (x + 2)'

// Laplace transforms
math.laplace('t^2', 't', 's').toString()   // '2 / s^3'

// Gröbner basis
math.groebnerBasis(['x^2 + y^2 - 1', 'x - y'], ['x', 'y'])
```

See [Algebra (symbolic computation)](../expressions/algebra.md) for the full list of 92 CAS functions.

---

## For Existing Math.js Users

**No changes required.** All v15.6.0 additions are purely additive. Existing API, function names, and behavior are unchanged.

### Migrating from Upstream josdejong/mathjs

If you are migrating from the upstream library (v12.x or v13.x), note:

- All existing function names and signatures are preserved
- New functions (CAS, optimization, signal, geometry, etc.) are additional
- Import path is `@danielsimonjr/mathjs` or the fork URL
- For TypeScript and WASM-accelerated math, see [MathTS](https://github.com/danielsimonjr/MathTS)

### Build Changes

The `dist/` bundle now includes all 444 functions. If you were tree-shaking specific functions, the bundle size has grown. To restore a smaller bundle, import only the specific factories you need:

```javascript
import { create, createAdd, createMultiply, createSin } from '@danielsimonjr/mathjs'
const math = create({ createAdd, createMultiply, createSin })
```

## Getting Help

- **Function Reference**: https://danielsimonjr.github.io/mathjs/
- **Issues**: https://github.com/danielsimonjr/mathjs/issues
- **Upstream Docs**: https://mathjs.org/docs/
