import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'

interface AutocompleteProps {
  input: string
  cursorPosition: number
  mathInstance: any
  onComplete: (completed: string, cursorPos: number) => void
  visible: boolean
  onDismiss: () => void
  anchorRef: React.RefObject<HTMLTextAreaElement | null>
}

interface FunctionInfo {
  name: string
  isFunction: boolean
}

export interface AutocompleteHandle {
  handleKey: (e: React.KeyboardEvent) => boolean
}

export const Autocomplete = forwardRef<AutocompleteHandle, AutocompleteProps>(function Autocomplete({
  input,
  cursorPosition,
  mathInstance,
  onComplete,
  visible,
  onDismiss,
  anchorRef,
}, ref) {
  const [matches, setMatches] = useState<FunctionInfo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Extract the partial word before the cursor
  // Extract partial word — always use end of input for matching since typing appends
  const getPartialWord = useCallback(() => {
    const match = input.match(/[a-zA-Z_][a-zA-Z0-9_]*$/)
    return match ? match[0] : ''
  }, [input])

  // Build matches when visible
  useEffect(() => {
    if (!visible || !mathInstance) {
      setMatches([])
      return
    }

    const partial = getPartialWord()
    if (partial.length < 1) {
      setMatches([])
      return
    }

    const lowerPartial = partial.toLowerCase()
    const allNames = Object.keys(mathInstance).filter(
      (name) => !name.startsWith('_') && typeof name === 'string'
    )

    const filtered = allNames
      .filter((name) => name.toLowerCase().startsWith(lowerPartial))
      .sort((a, b) => a.length - b.length)
      .slice(0, 15)
      .map((name) => ({
        name,
        isFunction: typeof mathInstance[name] === 'function',
      }))

    setMatches(filtered)
    setSelectedIndex(0)
  }, [visible, input, cursorPosition, mathInstance, getPartialWord])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const applyCompletion = useCallback(
    (item: FunctionInfo) => {
      const partial = getPartialWord()
      const beforePartial = input.slice(0, cursorPosition - partial.length)
      const afterCursor = input.slice(cursorPosition)

      let completed: string
      let newCursorPos: number

      if (item.isFunction) {
        // Auto-insert () and place cursor between them
        completed = beforePartial + item.name + '()' + afterCursor
        newCursorPos = beforePartial.length + item.name.length + 1 // between ( and )
      } else {
        completed = beforePartial + item.name + afterCursor
        newCursorPos = beforePartial.length + item.name.length
      }

      onComplete(completed, newCursorPos)
    },
    [input, cursorPosition, getPartialWord, onComplete]
  )

  // Handle keyboard navigation (called from parent)
  const handleKey = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!visible || matches.length === 0) return false

      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        applyCompletion(matches[selectedIndex])
        return true
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, matches.length - 1))
        return true
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return true
      }

      if (e.key === 'Escape') {
        onDismiss()
        return true
      }

      return false
    },
    [visible, matches, selectedIndex, applyCompletion, onDismiss]
  )

  // Expose handleKey to parent via ref
  useImperativeHandle(ref, () => ({ handleKey }), [handleKey])

  if (!visible || matches.length === 0) return null

  // Category colors
  const getCategoryColor = (name: string, isFunc: boolean) => {
    if (!isFunc) return 'text-yellow-400'
    if (/Dist$/.test(name)) return 'text-purple-400'
    if (/Test$/.test(name)) return 'text-pink-400'
    return 'text-blue-400'
  }

  const getCategoryLabel = (name: string, isFunc: boolean) => {
    if (!isFunc) return 'const'
    if (/Dist$/.test(name)) return 'dist'
    if (/Test$/.test(name)) return 'test'
    return 'fn'
  }

  return (
    <div
      ref={listRef}
      className="absolute bottom-full mb-1 left-0 right-0 mx-3 bg-gray-800 border border-gray-700 rounded-md shadow-xl max-h-48 overflow-y-auto z-50"
      style={{ minWidth: 200 }}
    >
      {matches.map((item, idx) => {
        const partial = getPartialWord()
        const matchedPart = item.name.slice(0, partial.length)
        const restPart = item.name.slice(partial.length)

        return (
          <div
            key={item.name}
            className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-sm font-mono ${
              idx === selectedIndex
                ? 'bg-blue-600/40 text-white'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
            onMouseDown={(e) => {
              e.preventDefault()
              applyCompletion(item)
            }}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <span
              className={`text-[10px] px-1 rounded ${getCategoryColor(
                item.name,
                item.isFunction
              )} bg-gray-900/50`}
            >
              {getCategoryLabel(item.name, item.isFunction)}
            </span>
            <span>
              <span className="text-blue-300 font-bold">{matchedPart}</span>
              <span>{restPart}</span>
            </span>
            {item.isFunction && (
              <span className="text-gray-500 ml-auto">()</span>
            )}
          </div>
        )
      })}
      <div className="px-3 py-0.5 text-[10px] text-gray-600 border-t border-gray-700/50">
        Tab to complete · ↑↓ to navigate · Esc to dismiss
      </div>
    </div>
  )
})
