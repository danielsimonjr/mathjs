import { useState, useCallback, useEffect } from 'react'

interface MatrixEditorProps {
  label: string
  onMatrixChange: (data: number[][]) => void
}

function createGrid(rows: number, cols: number, old?: number[][]): number[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => old && r < old.length && c < old[r].length ? old[r][c] : 0)
  )
}

export default function MatrixEditor({ label, onMatrixChange }: MatrixEditorProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [cells, setCells] = useState<number[][]>(() => createGrid(3, 3))

  useEffect(() => { onMatrixChange(cells) }, [cells, onMatrixChange])

  const resize = useCallback((newRows: number, newCols: number) => {
    const r = Math.max(1, Math.min(100, newRows))
    const c = Math.max(1, Math.min(100, newCols))
    setRows(r)
    setCols(c)
    setCells(prev => createGrid(r, c, prev))
  }, [])

  const fillRandom = useCallback(() => {
    setCells(Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.floor(Math.random() * 21) - 10)
    ))
  }, [rows, cols])

  const updateCell = useCallback((r: number, c: number, val: string) => {
    setCells(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = val === '' || val === '-' ? 0 : Number(val) || 0
      return next
    })
  }, [])

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-semibold text-gray-300">{label}</span>
        <label className="text-xs text-gray-500">
          Rows
          <input
            type="number" min={1} max={100} value={rows}
            onChange={e => resize(Number(e.target.value), cols)}
            className="ml-1 w-14 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-200"
          />
        </label>
        <label className="text-xs text-gray-500">
          Cols
          <input
            type="number" min={1} max={100} value={cols}
            onChange={e => resize(rows, Number(e.target.value))}
            className="ml-1 w-14 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-200"
          />
        </label>
        <button
          onClick={fillRandom}
          className="px-2 py-0.5 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Random
        </button>
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 3.5rem)` }}>
        {cells.map((row, r) =>
          row.map((val, c) => (
            <input
              key={`${r}-${c}`}
              type="number"
              value={val}
              onChange={e => updateCell(r, c, e.target.value)}
              className="w-14 text-xs font-mono bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-right text-gray-200"
            />
          ))
        )}
      </div>
    </div>
  )
}
