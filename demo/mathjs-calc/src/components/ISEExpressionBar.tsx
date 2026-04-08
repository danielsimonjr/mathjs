import { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import { LaTeXPreview } from './LaTeXPreview'
import { ResultDisplay } from './ResultDisplay'
import { Autocomplete } from './Autocomplete'
import { useMathParser } from '../hooks/useMathParser'
import { useSymbolic } from '../hooks/useSymbolic'
import { useStore } from '../store/useStore'

export interface ExpressionBarHandle {
  insert: (text: string, cursorOffset?: number) => void
  deleteChar: () => void
  clear: () => void
  evaluate: () => void
  focus: () => void
}

export const ISEExpressionBar = forwardRef<ExpressionBarHandle, { onPlotCommand?: (command: string, args: string[]) => void }>(function ISEExpressionBar({ onPlotCommand }, ref) {
  const { evaluate: mathEval, getVariables, math } = useMathParser()
  const { isSymbolic, evaluateSymbolic } = useSymbolic()
  const { updateVariables } = useStore()

  interface HistoryEntry {
    id: string
    expression: string
    result: string | null
    type: string | null
    error: string | null
    execTime: number | null
  }

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const historyEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [resultType, setResultType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [execTime, setExecTime] = useState<number | null>(null)
  const [isSymbolicResult, setIsSymbolicResult] = useState(false)
  const [resultLatex, setResultLatex] = useState<string | null>(null)
  const [historyStack, setHistoryStack] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [evalHistory, setEvalHistory] = useState<HistoryEntry[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [cursorPos, setCursorPos] = useState(0)
  const autocompleteRef = useRef<{ handleKey: (e: React.KeyboardEvent) => boolean } | null>(null)

  const addToEvalHistory = useCallback((expression: string, res: string | null, type: string | null, err: string | null, time: number | null) => {
    setEvalHistory((prev) => [...prev, {
      id: crypto.randomUUID(),
      expression,
      result: res,
      type,
      error: err,
      execTime: time,
    }])
  }, [])

  const syncVariables = useCallback(() => {
    try {
      const vars = getVariables()
      const formatted: Record<string, { value: string; type: string }> = {}
      for (const [key, val] of Object.entries(vars)) {
        if (typeof val === 'function') continue
        try {
          formatted[key] = {
            value: math.format(val, { precision: 6 }),
            type: math.typeOf(val),
          }
        } catch {
          formatted[key] = { value: String(val), type: typeof val }
        }
      }
      updateVariables(formatted)
    } catch {}
  }, [getVariables, math, updateVariables])

  const handleEvaluate = useCallback(() => {
    const expr = input.trim()
    if (!expr) return

    setHistoryStack((prev) => [expr, ...prev.slice(0, 99)])
    setHistoryIdx(-1)

    const setPlotResult = (msg: string) => {
      setResult(msg)
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      setInput('')
      addToEvalHistory(expr, msg, 'plot', null, 0)
    }

    // Check for plot commands
    if (expr.startsWith('clearPlot()')) {
      onPlotCommand?.('clearPlot', [])
      setPlotResult('Plots cleared')
      return
    }
    if (expr.startsWith('plot3d(')) {
      const inner = expr.slice(7, -1)
      onPlotCommand?.('plot3d', [inner])
      setPlotResult(`Plotted 3D: ${inner}`)
      return
    }
    if (expr.startsWith('plotParametric(')) {
      const inner = expr.slice(15, -1)
      onPlotCommand?.('plotParametric', inner.split(',').map(s => s.trim()))
      setPlotResult('Plotted parametric')
      return
    }
    if (expr.startsWith('plotPolar(')) {
      const inner = expr.slice(9, -1)
      onPlotCommand?.('plotPolar', inner.split(',').map(s => s.trim()))
      setPlotResult('Plotted polar')
      return
    }
    if (expr.startsWith('plot(')) {
      const inner = expr.slice(5, -1)
      onPlotCommand?.('plot', [inner])
      setPlotResult(`Plotted: ${inner}`)
      return
    }

    // Check for symbolic
    if (isSymbolic(expr)) {
      const symResult = evaluateSymbolic(expr)
      if (symResult) {
        setResult(symResult.output)
        setResultType('symbolic')
        setError(null)
        setExecTime(0)
        setIsSymbolicResult(true)
        setResultLatex(symResult.latexOut)
        setInput('')
        syncVariables()
        addToEvalHistory(expr, symResult.output, 'symbolic', null, 0)
        return
      }
    }

    // Numeric evaluation
    const entry = mathEval(expr)
    if (entry.error) {
      setError(entry.error)
      setResult(null)
      setResultType(null)
      addToEvalHistory(expr, null, null, entry.error, entry.executionTime)
    } else {
      setResult(entry.result)
      setResultType(entry.type)
      setError(null)
      addToEvalHistory(expr, entry.result, entry.type, null, entry.executionTime)
    }
    setIsSymbolicResult(false)
    setResultLatex(null)
    setExecTime(entry.executionTime)
    setInput('')
    syncVariables()
  }, [input, mathEval, isSymbolic, evaluateSymbolic, syncVariables, onPlotCommand, addToEvalHistory])

  const handleAutocompleteComplete = useCallback((completed: string, newCursorPos: number) => {
    setInput(completed)
    setCursorPos(newCursorPos)
    setShowAutocomplete(false)
    requestAnimationFrame(() => {
      const textarea = inputRef.current
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }
    })
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Tab triggers autocomplete
      if (e.key === 'Tab') {
        e.preventDefault()
        if (showAutocomplete && autocompleteRef.current) {
          autocompleteRef.current.handleKey(e)
        } else {
          // Open autocomplete
          const textarea = inputRef.current
          if (textarea) {
            setCursorPos(textarea.selectionStart)
          }
          setShowAutocomplete(true)
        }
        return
      }

      // Let autocomplete handle keys when visible
      if (showAutocomplete && autocompleteRef.current) {
        if (autocompleteRef.current.handleKey(e)) return
      }

      // Auto-close brackets
      if (e.key === '(' ) {
        const textarea = inputRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const before = input.slice(0, start)
          const selected = input.slice(start, end)
          const after = input.slice(end)
          e.preventDefault()
          const newValue = before + '(' + selected + ')' + after
          setInput(newValue)
          requestAnimationFrame(() => {
            const pos = start + 1 + selected.length
            textarea.setSelectionRange(pos, pos)
          })
          return
        }
      }

      // Skip closing ) if already there
      if (e.key === ')') {
        const textarea = inputRef.current
        if (textarea && input[textarea.selectionStart] === ')') {
          e.preventDefault()
          const pos = textarea.selectionStart + 1
          textarea.setSelectionRange(pos, pos)
          return
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        setShowAutocomplete(false)
        handleEvaluate()
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false)
      }
      if (e.key === 'ArrowUp' && !showAutocomplete && historyStack.length > 0) {
        const newIdx = Math.min(historyIdx + 1, historyStack.length - 1)
        setHistoryIdx(newIdx)
        setInput(historyStack[newIdx])
      }
      if (e.key === 'ArrowDown' && !showAutocomplete) {
        if (historyIdx > 0) {
          setHistoryIdx(historyIdx - 1)
          setInput(historyStack[historyIdx - 1])
        } else {
          setHistoryIdx(-1)
          setInput('')
        }
      }
    },
    [handleEvaluate, historyStack, historyIdx, showAutocomplete, input]
  )

  useImperativeHandle(ref, () => ({
    insert: (text: string, cursorOffset?: number) => {
      const textarea = inputRef.current
      if (!textarea) { setInput((prev) => prev + text); return }
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = input.slice(0, start)
      const after = input.slice(end)
      const newValue = before + text + after
      setInput(newValue)
      requestAnimationFrame(() => {
        const pos = cursorOffset !== undefined ? start + text.length + cursorOffset : start + text.length
        textarea.setSelectionRange(pos, pos)
        textarea.focus()
      })
    },
    deleteChar: () => {
      const textarea = inputRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      if (start > 0) {
        setInput((prev) => prev.slice(0, start - 1) + prev.slice(start))
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start - 1, start - 1)
          textarea.focus()
        })
      }
    },
    clear: () => {
      setInput('')
      setResult(null)
      setError(null)
      inputRef.current?.focus()
    },
    evaluate: handleEvaluate,
    focus: () => inputRef.current?.focus(),
  }), [input, handleEvaluate])

  // Auto-scroll history to bottom when new entries added
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [evalHistory.length])

  const TYPE_COLORS: Record<string, string> = {
    number: 'text-green-400',
    symbolic: 'text-pink-400',
    plot: 'text-orange-400',
    Matrix: 'text-blue-400',
    Complex: 'text-purple-400',
    string: 'text-gray-400',
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Scrollable evaluation history */}
      {evalHistory.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto border-b border-gray-800/50 px-3 py-1">
          {evalHistory.map((h) => (
            <div
              key={h.id}
              className="flex items-baseline gap-2 py-0.5 text-xs cursor-pointer hover:bg-gray-800/30 rounded px-1 -mx-1"
              onClick={() => setInput(h.expression)}
              title="Click to reuse expression"
            >
              <span className="text-gray-500 font-mono shrink-0">&gt;</span>
              <span className="text-gray-300 font-mono truncate">{h.expression}</span>
              {h.error ? (
                <span className="text-red-400 font-mono truncate ml-auto">{h.error}</span>
              ) : (
                <>
                  <span className="text-gray-600 shrink-0">=</span>
                  <span className={`font-mono truncate ${TYPE_COLORS[h.type || ''] || 'text-green-400'}`}>
                    {h.result}
                  </span>
                </>
              )}
              {h.execTime !== null && h.execTime > 0 && (
                <span className="text-gray-700 text-[10px] shrink-0">{h.execTime.toFixed(1)}ms</span>
              )}
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>
      )}

      {/* LaTeX preview */}
      <LaTeXPreview expression={input} />

      {/* Input row */}
      <div className="relative flex shrink-0" style={{ minHeight: 40 }}>
        <Autocomplete
          input={input}
          cursorPosition={cursorPos}
          mathInstance={math}
          onComplete={handleAutocompleteComplete}
          visible={showAutocomplete}
          onDismiss={() => setShowAutocomplete(false)}
          anchorRef={inputRef}
          ref={autocompleteRef}
        />
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            const val = e.target.value
            setInput(val)
            setCursorPos(e.target.selectionStart || val.length)
            // Show autocomplete when input ends with 2+ letters
            if (/[a-zA-Z]{2,}$/.test(val)) {
              setShowAutocomplete(true)
            } else {
              setShowAutocomplete(false)
            }
          }}
          onKeyDown={handleKeyDown}
          onClick={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart)}
          placeholder="Enter expression... (Tab for autocomplete, Enter to evaluate)"
          className="flex-1 bg-transparent px-3 py-2 font-mono text-sm text-gray-100 resize-none focus:outline-none placeholder-gray-600"
          rows={1}
        />
        <button
          onClick={handleEvaluate}
          className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium self-stretch"
        >
          =
        </button>
      </div>

      {/* Current result */}
      <ResultDisplay
        result={result}
        type={resultType}
        error={error}
        executionTime={execTime}
        isSymbolic={isSymbolicResult}
        latex={resultLatex}
      />
    </div>
  )
})
