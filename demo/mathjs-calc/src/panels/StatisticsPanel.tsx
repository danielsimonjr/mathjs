import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { useStatistics, type Distribution } from '../hooks/useStatistics'

const distributions: Distribution[] = ['normal', 'uniform', 'poisson']
const sizes = [100, 1_000, 10_000, 100_000, 1_000_000]
const sizeLabels: Record<number, string> = { 100: '100', 1000: '1K', 10000: '10K', 100000: '100K', 1000000: '1M' }

export default function StatisticsPanel() {
  const [distribution, setDistribution] = useState<Distribution>('normal')
  const [size, setSize] = useState(1000)
  const [binCount, setBinCount] = useState(30)
  const [seed, setSeed] = useState(0)

  const { stats, histogram } = useStatistics(distribution, size, binCount, seed)

  const statRows = useMemo(() => [
    ['Count', stats.count.toLocaleString()],
    ['Mean', stats.mean.toFixed(4)],
    ['Median', stats.median.toFixed(4)],
    ['Std Dev', stats.std.toFixed(4)],
    ['Variance', stats.variance.toFixed(4)],
    ['Min', stats.min.toFixed(4)],
    ['Max', stats.max.toFixed(4)],
    ['Q1 (25%)', stats.q1.toFixed(4)],
    ['Q3 (75%)', stats.q3.toFixed(4)],
  ], [stats])

  return (
    <div className="flex flex-col gap-4 h-full p-4 overflow-auto">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {distributions.map((d) => (
            <button
              key={d}
              onClick={() => setDistribution(d)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                distribution === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="bg-gray-700 text-gray-200 rounded px-2 py-1.5 text-sm"
        >
          {sizes.map((s) => (
            <option key={s} value={s}>{sizeLabels[s]}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-400">
          Bins: {binCount}
          <input
            type="range"
            min={5}
            max={100}
            value={binCount}
            onChange={(e) => setBinCount(Number(e.target.value))}
            className="w-24"
          />
        </label>

        <button
          onClick={() => setSeed((s) => s + 1)}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Regenerate
        </button>

        <span className="text-xs text-gray-500 ml-auto">
          Computed in {stats.executionTime.toFixed(1)} ms
        </span>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Stats table */}
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Descriptive Statistics</h3>
          <table className="w-full text-sm">
            <tbody>
              {statRows.map(([label, value]) => (
                <tr key={label} className="border-b border-gray-800">
                  <td className="py-1.5 text-gray-400">{label}</td>
                  <td className="py-1.5 text-right text-gray-200 font-mono">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Histogram */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 flex flex-col min-h-[300px]">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Histogram</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogram} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#d1d5db' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Count']}
                  labelFormatter={(label: string) => `Bin: ${label}`}
                />
                <Bar dataKey="count" fill="#60a5fa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
