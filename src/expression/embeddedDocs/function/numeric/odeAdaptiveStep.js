export const odeAdaptiveStepDocs = {
  name: 'odeAdaptiveStep',
  category: 'Numeric',
  syntax: [
    'odeAdaptiveStep(f, tSpan, y0)',
    'odeAdaptiveStep(f, tSpan, y0, options)'
  ],
  description: 'Solve an ODE system using Dormand-Prince RK45 with automatic adaptive step size control.',
  examples: [],
  seealso: ['solveODE', 'solveODESystem', 'solveBVP']
}
