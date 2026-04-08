export const matrixPowerDocs = {
  name: 'matrixPower',
  category: 'Matrix',
  syntax: [
    'matrixPower(A, n)'
  ],
  description: 'Raise a square matrix A to an integer power n. For n > 0 uses binary exponentiation (repeated squaring). For n = 0 returns the identity matrix. For n < 0 returns inv(A)^|n|.',
  examples: [
    'matrixPower([[1, 1], [0, 1]], 3)',
    'matrixPower([[2, 0], [0, 3]], 2)',
    'matrixPower([[1, 0], [0, 1]], 0)'
  ],
  seealso: [
    'multiply', 'inv', 'det', 'eigs'
  ]
}
