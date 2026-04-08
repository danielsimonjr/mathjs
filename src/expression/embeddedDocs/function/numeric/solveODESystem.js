export const solveODESystemDocs = {
  name: 'solveODESystem',
  category: 'Numeric',
  syntax: [
    'solveODESystem(f, tSpan, y0)',
    'solveODESystem(f, tSpan, y0, options)'
  ],
  description: 'Solve a system of coupled ordinary differential equations using RK4 or adaptive RK45.',
  examples: [],
  seealso: ['solveODE', 'odeAdaptiveStep', 'solveBVP']
}
