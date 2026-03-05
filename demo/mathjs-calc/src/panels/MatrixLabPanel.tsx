import { useState, useCallback } from 'react'
import MatrixEditor from '../components/MatrixEditor'
import MatrixDisplay from '../components/MatrixDisplay'
import { useMatrixOps } from '../hooks/useMatrixOps'

interface ResultEntry {
  id: number
  name: string
  value: number[][] | number[] | number | null
  formatted: string
  executionTime: number
  error: string | null
}

const operations = [
  { key: 'det', label: 'Determinant' },
  { key: 'inv', label: 'Inverse' },
  { key: 'transpose', label: 'Transpose' },
  { key: 'eigs', label: 'Eigenvalues' },
  { key: 'trace', label: 'Trace' },
] as const

let nextId = 0

export default function MatrixLabPanel() {
  const [matrixData, setMatrixData] = useState<number[][]>([])
  const [results, setResults] = useState<ResultEntry[]>([])
  const { runOperation } = useMatrixOps()

  const handleOp = useCallback((op: string) => {
    const res = runOperation(op, matrixData)
    setResults(prev => [{ id: nextId++, ...res }, ...prev])
  }, [runOperation, matrixData])

  return (
    <div className="flex gap-4 h-full p-4 overflow-hidden">
      {/* Left: editor + operation buttons */}
      <div className="flex flex-col gap-3 shrink-0">
        <MatrixEditor label="Matrix A" onMatrixChange={setMatrixData} />
        <div className="flex flex-wrap gap-1.5">
          {operations.map(op => (
            <button
              key={op.key}
              onClick={() => handleOp(op.key)}
              className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: results */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {results.length === 0 && (
          <p className="text-gray-500 text-sm">Run an operation to see results here.</p>
        )}
        {results.map(r => (
          <div key={r.id} className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-200">{r.name}</span>
              <span className="text-xs text-gray-500">{r.executionTime.toFixed(2)} ms</span>
            </div>
            {r.error ? (
              <p className="text-red-400 text-xs">{r.error}</p>
            ) : typeof r.value === 'object' && r.value !== null ? (
              <MatrixDisplay data={r.value as number[][] | number[]} label="" />
            ) : (
              <p className="font-mono text-sm text-gray-200">{r.formatted}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
