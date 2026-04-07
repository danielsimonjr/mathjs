export const fibonacciDocs = {
  name: 'fibonacci',
  category: 'Combinatorics',
  syntax: [
    'fibonacci(n)'
  ],
  description: 'Compute the nth Fibonacci number using the fast doubling algorithm. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). For n > 70 use BigInt input to avoid overflow.',
  examples: [
    'fibonacci(0)',
    'fibonacci(1)',
    'fibonacci(10)',
    'fibonacci(20)'
  ],
  seealso: ['factorial', 'combinations']
}
