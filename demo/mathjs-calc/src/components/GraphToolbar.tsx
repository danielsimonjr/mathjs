import { useStore } from '../store/useStore'

export function GraphToolbar() {
  const { plotMode, setPlotMode, clearPlots, toggleGraphCollapsed } = useStore()

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-800">
      <button
        onClick={() => setPlotMode('2d')}
        className={`px-2 py-0.5 text-xs rounded ${plotMode === '2d' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
      >
        2D
      </button>
      <button
        onClick={() => setPlotMode('3d')}
        className={`px-2 py-0.5 text-xs rounded ${plotMode === '3d' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
      >
        3D
      </button>
      <div className="w-px h-4 bg-gray-800 mx-1" />
      <button
        onClick={clearPlots}
        className="px-2 py-0.5 text-xs text-gray-400 hover:text-red-400 rounded"
        title="Clear all plots"
      >
        Clear
      </button>
      <div className="flex-1" />
      <button
        onClick={toggleGraphCollapsed}
        className="px-2 py-0.5 text-xs text-gray-400 hover:text-gray-200 rounded"
        title="Collapse graph"
      >
        &#9664;
      </button>
    </div>
  )
}
