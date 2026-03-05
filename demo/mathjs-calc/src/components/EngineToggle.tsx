import { useStore } from '../store/useStore'
import type { EngineMode } from '../types'

const engines: { id: EngineMode; label: string }[] = [
  { id: 'js', label: 'JS' },
  { id: 'wasm', label: 'WASM' },
  { id: 'auto', label: 'Auto' },
]

export default function EngineToggle() {
  const engine = useStore((s) => s.config.engine)
  const setEngine = useStore((s) => s.setEngine)
  const wasmCapabilities = useStore((s) => s.wasmCapabilities)

  return (
    <div className="flex rounded overflow-hidden border border-gray-700">
      {engines.map((e) => {
        const disabled = e.id === 'wasm' && !wasmCapabilities?.wasmAvailable
        return (
          <button
            key={e.id}
            onClick={() => setEngine(e.id)}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              engine === e.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {e.label}
          </button>
        )
      })}
    </div>
  )
}
