import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useBenchmark } from '../hooks/useBenchmark'

export default function PerformancePanel() {
  const { results, running, progress, runAll } = useBenchmark()

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>()
    for (const r of results) {
      const key = `${r.category}: ${r.operation}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    return map
  }, [results])

  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1

  return (
    <div className="space-y-4 p-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={runAll}
            disabled={running}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {running ? `Running... ${Math.round(progress * 100)}%` : 'Run All Benchmarks'}
          </button>
        </div>
        <div className="text-sm text-gray-400">
          System: {cores} logical cores
        </div>
      </div>

      {/* Progress bar */}
      {running && (
        <div className="w-full bg-gray-800 rounded h-3">
          <div
            className="bg-blue-600 h-3 rounded transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Result cards */}
      {grouped.size > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from(grouped.entries()).map(([key, data]) => (
            <div key={key} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">{key}</h3>

              {/* Chart */}
              <div className="h-48 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="size" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                      labelStyle={{ color: '#d1d5db' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="jsTime" stroke="#f59e0b" name="JS" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="wasmTime" stroke="#60a5fa" name="WASM" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Results table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-1">Size</th>
                    <th className="text-right py-1">JS (ms)</th>
                    <th className="text-right py-1">WASM (ms)</th>
                    <th className="text-right py-1">Speedup</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.size} className="text-gray-300 border-b border-gray-800">
                      <td className="py-1">{r.size.toLocaleString()}</td>
                      <td className="text-right py-1">{r.jsTime.toFixed(2)}</td>
                      <td className="text-right py-1">{r.wasmTime.toFixed(2)}</td>
                      <td className="text-right py-1">{r.speedup.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!running && grouped.size === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Click &quot;Run All Benchmarks&quot; to start
        </div>
      )}
    </div>
  )
}
