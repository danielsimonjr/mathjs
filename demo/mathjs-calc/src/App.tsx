import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { ISELayout } from './layouts/ISELayout'
import StatisticsPanel from './panels/StatisticsPanel'
import PerformancePanel from './panels/PerformancePanel'
import { usePersistence } from './hooks/usePersistence'

export default function App() {
  const viewMode = useStore((s) => s.viewMode)
  const setWasmCapabilities = useStore((s) => s.setWasmCapabilities)
  usePersistence()

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.initWasm().then((result) => {
        setWasmCapabilities(result.capabilities)
      })
    }
  }, [setWasmCapabilities])

  if (viewMode === 'statistics') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <SecondaryHeader />
        <StatisticsPanel />
      </div>
    )
  }

  if (viewMode === 'performance') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <SecondaryHeader />
        <PerformancePanel />
      </div>
    )
  }

  return <ISELayout />
}

function SecondaryHeader() {
  const setViewMode = useStore((s) => s.setViewMode)
  return (
    <header className="border-b border-gray-800 p-2 bg-gray-900 flex items-center gap-2">
      <button
        onClick={() => setViewMode('ise')}
        className="text-sm text-blue-400 hover:text-blue-300"
      >
        &larr; Back to ISE
      </button>
    </header>
  )
}
