export const stiffODESolverDocs = {
  name: 'stiffODESolver',
  category: 'Numeric',
  syntax: [
    'stiffODESolver(f, tSpan, y0)',
    'stiffODESolver(f, tSpan, y0, options)'
  ],
  description: 'Solve a stiff ODE system using Backward Differentiation Formula (BDF) order 1 or 2 with Newton iteration.',
  examples: [],
  seealso: ['solveODE', 'solveODESystem', 'odeAdaptiveStep']
}
