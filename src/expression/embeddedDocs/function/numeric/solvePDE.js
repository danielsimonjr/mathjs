export const solvePDEDocs = {
  name: 'solvePDE',
  category: 'Numeric',
  syntax: [
    'solvePDE(f, xSpan, tSpan, u0)',
    'solvePDE(f, xSpan, tSpan, u0, options)'
  ],
  description: 'Solve a 1D PDE using the method of lines: discretize in space, then integrate in time with RK4.',
  examples: [],
  seealso: ['solveODE', 'solveODESystem', 'odeAdaptiveStep']
}
