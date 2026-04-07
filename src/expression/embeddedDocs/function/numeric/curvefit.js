export const curvefitDocs = {
  name: 'curvefit',
  category: 'Numeric',
  syntax: [
    'curvefit(f, params0, xdata, ydata)',
    'curvefit(f, params0, xdata, ydata, options)'
  ],
  description: 'Fit a parametric model to data using the Levenberg-Marquardt algorithm. Returns an object with fitted params, residuals, and iteration count.',
  examples: [
    'linear(x, p) = p[1] * x + p[2]',
    'curvefit(linear, [1, 0], [0, 1, 2], [1, 3, 5])'
  ],
  seealso: ['nintegrate', 'linsolve', 'interpolate']
}
