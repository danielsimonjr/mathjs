import { useStore } from '../store/useStore'

export function FunctionList() {
  const { plotTraces, removePlotTrace, togglePlotVisibility } = useStore()

  if (plotTraces.length === 0) return null

  return (
    <div className="absolute top-2 right-2 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg p-2 max-w-[200px] z-10">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Functions</div>
      {plotTraces.map((trace) => (
        <div key={trace.id} className="flex items-center gap-1.5 py-0.5">
          <button
            onClick={() => togglePlotVisibility(trace.id)}
            className="text-xs opacity-60 hover:opacity-100"
            title={trace.visible ? 'Hide' : 'Show'}
          >
            {trace.visible ? '\u{1F441}' : '\u25CB'}
          </button>
          <div
            className="w-3 h-0.5 rounded"
            style={{ backgroundColor: trace.color }}
          />
          <span className="text-xs font-mono text-gray-300 truncate flex-1">
            {trace.expression}
          </span>
          <button
            onClick={() => removePlotTrace(trace.id)}
            className="text-gray-600 hover:text-red-400 text-xs"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
