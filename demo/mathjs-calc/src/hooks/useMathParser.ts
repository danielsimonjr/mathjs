import { useState, useRef, useCallback } from 'react'
import math from 'mathjs'

interface EvalResult {
  expression: string
  result: string
  type: string
  error: string | null
  timestamp: number
  executionTime: number
}

export function useMathParser() {
  const mathRef = useRef(math)
  const parserRef = useRef(mathRef.current.parser())
  const [history, setHistory] = useState<EvalResult[]>([])

  const evaluate = useCallback((expression: string): EvalResult => {
    const start = performance.now()
    let entry: EvalResult
    try {
      const raw = parserRef.current.evaluate(expression)
      const result = mathRef.current.format(raw, { precision: 14 })
      const type = mathRef.current.typeOf(raw)
      entry = { expression, result, type, error: null, timestamp: Date.now(), executionTime: performance.now() - start }
    } catch (err) {
      entry = { expression, result: '', type: 'error', error: err instanceof Error ? err.message : String(err), timestamp: Date.now(), executionTime: performance.now() - start }
    }
    setHistory((prev) => [entry, ...prev])
    return entry
  }, [])

  const clearParser = useCallback(() => { parserRef.current.clear() }, [])
  const getVariables = useCallback((): Record<string, unknown> => { return parserRef.current.getAll() }, [])

  return { evaluate, history, clearParser, getVariables, math: mathRef.current }
}
