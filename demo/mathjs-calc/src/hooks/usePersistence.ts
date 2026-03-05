import { useEffect } from 'react'
import { useStore } from '../store/useStore'

const STORAGE_KEY = 'mathjs-calc-state'

export function usePersistence() {
  const config = useStore((s) => s.config)
  const history = useStore((s) => s.history)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ config, history: history.slice(0, 100) })
      )
    } catch {
      // Silently ignore storage errors
    }
  }, [config, history])
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
