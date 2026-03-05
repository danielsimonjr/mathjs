import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useSignal, type WaveformType } from '../hooks/useSignal'

const WAVEFORMS: WaveformType[] = ['sine', 'square', 'triangle', 'sawtooth']
const SAMPLE_COUNTS = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]

function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data
  const step = data.length / maxPoints
  const result: T[] = []
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.floor(i * step)])
  }
  return result
}

export default function SignalStudioPanel() {
  const [waveform, setWaveform] = useState<WaveformType>('sine')
  const [frequency, setFrequency] = useState(5)
  const [amplitude, setAmplitude] = useState(1.0)
  const [sampleCount, setSampleCount] = useState(1024)
  const { generate } = useSignal()

  const { timeDomain, freqDomain, executionTime } = useMemo(
    () => generate({ waveform, frequency, amplitude, sampleCount }),
    [waveform, frequency, amplitude, sampleCount, generate]
  )

  const displayTime = downsample(timeDomain, 500)

  return (
    <div className="flex flex-col gap-4 h-full p-4 overflow-auto">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Waveform selector */}
        <div className="flex gap-1">
          {WAVEFORMS.map((w) => (
            <button
              key={w}
              onClick={() => setWaveform(w)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                waveform === w
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Frequency slider */}
        <label className="flex items-center gap-2 text-sm text-gray-300">
          Freq: {frequency} Hz
          <input
            type="range"
            min={1}
            max={100}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-28"
          />
        </label>

        {/* Amplitude slider */}
        <label className="flex items-center gap-2 text-sm text-gray-300">
          Amp: {amplitude.toFixed(1)}
          <input
            type="range"
            min={0.1}
            max={5.0}
            step={0.1}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-28"
          />
        </label>

        {/* Sample count dropdown */}
        <label className="flex items-center gap-2 text-sm text-gray-300">
          Samples:
          <select
            value={sampleCount}
            onChange={(e) => setSampleCount(Number(e.target.value))}
            className="bg-gray-700 text-gray-200 rounded px-2 py-1 text-sm"
          >
            {SAMPLE_COUNTS.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString()}
              </option>
            ))}
          </select>
        </label>

        {/* Execution time */}
        <span className="text-xs text-gray-500 ml-auto">
          {executionTime.toFixed(1)} ms
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Time Domain */}
        <div className="flex flex-col min-h-[300px]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Time Domain</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTime}>
                <CartesianGrid stroke="#333" />
                <XAxis
                  dataKey="x"
                  tick={{ fill: '#666', fontSize: 11 }}
                  tickFormatter={(v: number) => v.toFixed(2)}
                />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="y" stroke="#60a5fa" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequency Spectrum */}
        <div className="flex flex-col min-h-[300px]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Frequency Spectrum (FFT)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={freqDomain}>
                <CartesianGrid stroke="#333" />
                <XAxis
                  dataKey="freq"
                  tick={{ fill: '#666', fontSize: 11 }}
                  tickFormatter={(v: number) => `${v.toFixed(0)} Hz`}
                />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="magnitude" stroke="#34d399" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
