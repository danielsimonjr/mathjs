import { useMemo } from 'react'
import Plot from 'react-plotly.js'
import { useStore } from '../store/useStore'
import { GraphToolbar } from './GraphToolbar'
import { FunctionList } from './FunctionList'

export function GraphCanvas() {
  const { plotTraces, plotMode } = useStore()

  const visibleTraces = plotTraces.filter((t) => t.visible)

  const plotlyData = useMemo(() => {
    if (plotMode === '3d') {
      return visibleTraces
        .filter((t) => t.type === '3d')
        .map((trace) => {
          const n = Math.sqrt(trace.data.x.length) | 0
          const zGrid: number[][] = []
          for (let i = 0; i < n; i++) {
            zGrid.push(trace.data.z!.slice(i * n, (i + 1) * n))
          }
          return {
            type: 'surface' as const,
            z: zGrid,
            colorscale: 'Viridis',
            showscale: false,
            name: trace.expression,
          }
        })
    }

    return visibleTraces
      .filter((t) => t.type !== '3d')
      .map((trace) => ({
        type: 'scatter' as const,
        mode: 'lines' as const,
        x: trace.data.x,
        y: trace.data.y,
        name: trace.expression,
        line: { color: trace.color, width: 2 },
        connectgaps: false,
      }))
  }, [visibleTraces, plotMode])

  const layout = useMemo(() => {
    const base = {
      paper_bgcolor: '#030712',
      plot_bgcolor: '#0a0f1a',
      font: { color: '#9ca3af', size: 10 },
      margin: { l: 50, r: 20, t: 20, b: 40 },
      showlegend: false,
    }

    if (plotMode === '3d') {
      return {
        ...base,
        scene: {
          xaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151' },
          yaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151' },
          zaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151' },
          bgcolor: '#0a0f1a',
        },
      }
    }

    return {
      ...base,
      xaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151', zerolinewidth: 2 },
      yaxis: { gridcolor: '#1f2937', zerolinecolor: '#374151', zerolinewidth: 2 },
    }
  }, [plotMode])

  return (
    <div className="h-full flex flex-col bg-gray-950 relative">
      <GraphToolbar />
      <div className="flex-1 relative">
        <FunctionList />
        {plotlyData.length > 0 ? (
          <Plot
            data={plotlyData as any}
            layout={layout as any}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              displaylogo: false,
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">&#x1F4C8;</div>
              <div className="text-sm">Enter <code className="text-blue-400">plot(sin(x))</code> to graph</div>
              <div className="text-xs mt-1 text-gray-700">
                Also: plot3d(), plotParametric(), plotPolar()
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
