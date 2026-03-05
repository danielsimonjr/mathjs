import { useCallback } from 'react'
import { useMathParser } from './useMathParser'

interface MatrixOpResult {
  name: string
  value: number[][] | number[] | number | null
  formatted: string
  executionTime: number
  error: string | null
}

export function useMatrixOps() {
  const { math } = useMathParser()

  const runOperation = useCallback((operation: string, matrixData: number[][]): MatrixOpResult => {
    const start = performance.now()
    try {
      const m = math.matrix(matrixData)
      let raw: unknown
      let name = operation

      switch (operation) {
        case 'det':
          name = 'Determinant'
          raw = math.det(m)
          break
        case 'inv':
          name = 'Inverse'
          raw = math.inv(m)
          break
        case 'transpose':
          name = 'Transpose'
          raw = math.transpose(m)
          break
        case 'eigs':
          name = 'Eigenvalues'
          raw = (math.eigs(m) as { values: unknown }).values
          break
        case 'trace':
          name = 'Trace'
          raw = math.trace(m)
          break
        default:
          throw new Error(`Unknown operation: ${operation}`)
      }

      const elapsed = performance.now() - start
      const value = typeof raw === 'object' && raw !== null && 'toArray' in raw
        ? (raw as { toArray(): number[][] | number[] }).toArray()
        : raw as number[][] | number[] | number | null
      const formatted = math.format(raw, { precision: 6 })

      return { name, value, formatted, executionTime: elapsed, error: null }
    } catch (err) {
      return {
        name: operation,
        value: null,
        formatted: '',
        executionTime: performance.now() - start,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }, [math])

  return { runOperation }
}
