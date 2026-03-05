import { useEffect } from 'react'
import { useStore } from '../store/useStore'

const STORAGE_KEY = 'mathjs-calc-state'

export function usePersistence() {
  const config = useStore((s) => s.config)
  const history = useStore((s) => s.history)
  const graphCollapsed = useStore((s) => s.graphCollapsed)
  const viewMode = useStore((s) => s.viewMode)
  const symbolicHistory = useStore((s) => s.symbolicHistory)
  const plotTraces = useStore((s) => s.plotTraces)

  useEffect(() => {
    try {
      // Save plot expressions only (not data arrays — too large)
      const plotExprs = plotTraces.map((t) => ({
        expression: t.expression,
        type: t.type,
      }))

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          config,
          history: history.slice(0, 100),
          graphCollapsed,
          viewMode,
          symbolicHistory: symbolicHistory.slice(0, 20),
          plotExpressions: plotExprs,
        })
      )
    } catch {
      // Silently ignore storage errors
    }
  }, [config, history, graphCollapsed, viewMode, symbolicHistory, plotTraces])
}

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Silently ignore parse errors
  }
  return null
}
