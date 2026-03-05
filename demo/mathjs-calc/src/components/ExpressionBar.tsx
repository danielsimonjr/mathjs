import { useState } from 'react'
import { useMathParser } from '../hooks/useMathParser'
import { useStore } from '../store/useStore'
import EngineToggle from './EngineToggle'

export default function ExpressionBar() {
  const { evaluate } = useMathParser()
  const addHistory = useStore((s) => s.addHistory)
  const [input, setInput] = useState('')
  const [current, setCurrent] = useState<{ result: string; error: string | null } | null>(null)

  const handleEvaluate = () => {
    const expr = input.trim()
    if (!expr) return
    const entry = evaluate(expr)
    setCurrent({ result: entry.result, error: entry.error })
    addHistory({
      id: crypto.randomUUID(),
      expression: entry.expression,
      result: entry.result,
      type: entry.type,
      error: entry.error,
      panel: 'calculator',
      engineUsed: 'js',
      executionTime: entry.executionTime,
      timestamp: entry.timestamp,
    })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEvaluate()
  }

  return (
    <header className="border-b border-gray-800 p-3 bg-gray-900">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter expression, e.g. sqrt(144) or x = 42"
          className="flex-1 bg-gray-950 border border-gray-700 rounded px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
        />
        <button
          onClick={handleEvaluate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
        >
          =
        </button>
        <EngineToggle />
      </div>
      {current && (
        <div className="mt-2 px-4 py-1 text-sm font-mono">
          {current.error ? (
            <span className="text-red-400">Error: {current.error}</span>
          ) : (
            <span className="text-green-400">{current.result}</span>
          )}
        </div>
      )}
    </header>
  )
}
