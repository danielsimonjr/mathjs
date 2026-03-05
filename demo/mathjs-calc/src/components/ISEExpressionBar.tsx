import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react'
import { LaTeXPreview } from './LaTeXPreview'
import { ResultDisplay } from './ResultDisplay'
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

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [resultType, setResultType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [execTime, setExecTime] = useState<number | null>(null)
  const [isSymbolicResult, setIsSymbolicResult] = useState(false)
  const [resultLatex, setResultLatex] = useState<string | null>(null)
  const [historyStack, setHistoryStack] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

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

    // Check for plot commands
    if (expr.startsWith('clearPlot()')) {
      onPlotCommand?.('clearPlot', [])
      setResult('Plots cleared')
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      setInput('')
      return
    }
    if (expr.startsWith('plot3d(')) {
      const inner = expr.slice(7, -1)
      onPlotCommand?.('plot3d', [inner])
      setResult(`Plotted 3D: ${inner}`)
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      setInput('')
      return
    }
    if (expr.startsWith('plotParametric(')) {
      const inner = expr.slice(15, -1)
      onPlotCommand?.('plotParametric', inner.split(',').map(s => s.trim()))
      setResult(`Plotted parametric`)
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      setInput('')
      return
    }
    if (expr.startsWith('plotPolar(')) {
      const inner = expr.slice(9, -1)
      onPlotCommand?.('plotPolar', inner.split(',').map(s => s.trim()))
      setResult(`Plotted polar`)
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      setInput('')
      return
    }
    if (expr.startsWith('plot(')) {
      const inner = expr.slice(5, -1)
      onPlotCommand?.('plot', [inner])
      setResult(`Plotted: ${inner}`)
      setResultType('plot')
      setError(null)
      setExecTime(0)
      setIsSymbolicResult(false)
      setResultLatex(null)
      setInput('')
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
        return
      }
    }

    // Numeric evaluation
    const entry = mathEval(expr)
    if (entry.error) {
      setError(entry.error)
      setResult(null)
      setResultType(null)
    } else {
      setResult(entry.result)
      setResultType(entry.type)
      setError(null)
    }
    setIsSymbolicResult(false)
    setResultLatex(null)
    setExecTime(entry.executionTime)
    setInput('')
    syncVariables()
  }, [input, mathEval, isSymbolic, evaluateSymbolic, syncVariables, onPlotCommand])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleEvaluate()
      }
      if (e.key === 'ArrowUp' && historyStack.length > 0) {
        const newIdx = Math.min(historyIdx + 1, historyStack.length - 1)
        setHistoryIdx(newIdx)
        setInput(historyStack[newIdx])
      }
      if (e.key === 'ArrowDown') {
        if (historyIdx > 0) {
          setHistoryIdx(historyIdx - 1)
          setInput(historyStack[historyIdx - 1])
        } else {
          setHistoryIdx(-1)
          setInput('')
        }
      }
    },
    [handleEvaluate, historyStack, historyIdx]
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

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <LaTeXPreview expression={input} />
      <div className="flex-1 flex">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter expression... (Enter to evaluate, Shift+Enter for new line)"
          className="flex-1 bg-transparent px-3 py-2 font-mono text-sm text-gray-100 resize-none focus:outline-none placeholder-gray-600"
          rows={2}
        />
        <button
          onClick={handleEvaluate}
          className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium self-stretch"
        >
          =
        </button>
      </div>
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
