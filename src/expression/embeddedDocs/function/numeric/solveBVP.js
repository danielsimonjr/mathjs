export const solveBVPDocs = {
  name: 'solveBVP',
  category: 'Numeric',
  syntax: [
    'solveBVP(f, bc, tSpan, yGuess)',
    'solveBVP(f, bc, tSpan, yGuess, options)'
  ],
  description: 'Solve a boundary value problem for an ODE system using the shooting method.',
  examples: [],
  seealso: ['solveODE', 'solveODESystem', 'odeAdaptiveStep']
}
