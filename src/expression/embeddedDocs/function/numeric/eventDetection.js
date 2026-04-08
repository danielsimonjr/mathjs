export const eventDetectionDocs = {
  name: 'eventDetection',
  category: 'Numeric',
  syntax: [
    'eventDetection(f, tSpan, y0, events)',
    'eventDetection(f, tSpan, y0, events, options)'
  ],
  description: 'Solve an ODE system and detect events (zero crossings of event functions) using bisection.',
  examples: [],
  seealso: ['solveODE', 'solveODESystem', 'odeAdaptiveStep']
}
