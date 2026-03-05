import { useState } from 'react'
import { useMathParser } from './hooks/useMathParser'

export default function App() {
  const { evaluate, history, clearParser } = useMathParser()
  const [input, setInput] = useState('')
  const [current, setCurrent] = useState<{ result: string; error: string | null } | null>(null)

  const handleEvaluate = () => {
    const expr = input.trim()
    if (!expr) return
    const entry = evaluate(expr)
    setCurrent({ result: entry.result, error: entry.error })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEvaluate()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-2">mathjs-calc</h1>
      <p className="text-gray-400 mb-8">Scientific Calculator & Math Workbench</p>

      <div className="w-full max-w-2xl space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter expression, e.g. sqrt(144) or x = 42"
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleEvaluate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
          >
            Evaluate
          </button>
          <button
            onClick={() => { clearParser(); setCurrent(null) }}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>

        {/* Current result */}
        {current && (
          <div className={`p-4 rounded border ${current.error ? 'border-red-700 bg-red-950' : 'border-green-700 bg-green-950'}`}>
            {current.error ? (
              <span className="text-red-400">Error: {current.error}</span>
            ) : (
              <span className="text-green-400 text-xl font-mono">{current.result}</span>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-sm text-gray-500 uppercase tracking-wide">History</h2>
            {history.map((entry) => (
              <div key={entry.timestamp} className="flex justify-between items-baseline bg-gray-900 rounded px-4 py-2 text-sm font-mono">
                <span className="text-gray-300">{entry.expression}</span>
                <span className="flex items-center gap-3">
                  {entry.error ? (
                    <span className="text-red-400">{entry.error}</span>
                  ) : (
                    <span className="text-green-400">= {entry.result}</span>
                  )}
                  <span className="text-gray-600 text-xs">{entry.executionTime.toFixed(1)}ms</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
