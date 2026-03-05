import { useEffect } from 'react'

interface ShortcutHandlers {
  onFocusExpression: () => void
  onToggleGraph: () => void
  onClearPlots: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        handlers.onFocusExpression()
      }
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        handlers.onToggleGraph()
      }
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        handlers.onClearPlots()
      }
      if (e.key === 'Escape') {
        handlers.onFocusExpression()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
