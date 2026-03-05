import type { HistoryEntry } from '../types'

interface CalcHistoryProps {
  history: HistoryEntry[]
  onSelect: (expression: string) => void
}

export default function CalcHistory({ history, onSelect }: CalcHistoryProps) {
  const filtered = history.filter((h) => h.panel === 'calculator')

  if (filtered.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center p-4">
        No history yet
      </div>
    )
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-1">
      {filtered.map((entry) => (
        <button
          key={entry.id}
          onClick={() => onSelect(entry.expression)}
          className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono transition-colors"
        >
          <div className="text-gray-300 truncate">{entry.expression}</div>
          <div className={entry.error ? 'text-red-400' : 'text-green-400'}>
            {entry.error ? entry.error : `= ${entry.result}`}
          </div>
        </button>
      ))}
    </div>
  )
}
