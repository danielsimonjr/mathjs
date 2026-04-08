export const quadprogDocs = {
  name: 'quadprog',
  category: 'Numeric',
  syntax: [
    'quadprog(H, f, A, b)',
    'quadprog(H, f, A, b, Aeq, beq)'
  ],
  description: 'Solve a quadratic programming problem: minimize (1/2)x\'Hx + f\'x subject to A*x <= b (and optionally Aeq*x = beq). H must be symmetric positive definite. Uses an active-set method. Returns an object with x, fval, status, and iterations.',
  examples: [
    'quadprog([[2, 0], [0, 2]], [-2, -5], [[1, -2], [-1, -2], [-1, 2], [1, 0], [0, 1]], [2, 6, 2, 20, 20])',
    'quadprog([[4, 1], [1, 2]], [1, 1], [[-1, 0], [0, -1]], [0, 0])'
  ],
  seealso: ['linprog', 'minimize']
}
