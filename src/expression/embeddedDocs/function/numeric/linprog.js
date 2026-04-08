export const linprogDocs = {
  name: 'linprog',
  category: 'Numeric',
  syntax: [
    'linprog(c, A, b)',
    'linprog(c, A, b, Aeq, beq)'
  ],
  description: 'Solve a linear programming problem: minimize c\'x subject to A*x <= b (and optionally Aeq*x = beq), with x >= 0. Uses a two-phase revised simplex method. Returns an object with x, fval, and status.',
  examples: [
    'linprog([-1, -2], [[1, 1], [1, 0], [0, 1]], [4, 3, 2])',
    'linprog([1, 2], [[1, 0], [0, 1]], [5, 5])'
  ],
  seealso: ['quadprog', 'minimize']
}
