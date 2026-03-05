import { useState, useCallback } from 'react'
import CalcButton from '../components/CalcButton'
import CalcHistory from '../components/CalcHistory'
import NumberTypeSelector from '../components/NumberTypeSelector'
import { useStore } from '../store/useStore'
import { useMathParser } from '../hooks/useMathParser'
import type { AngleMode } from '../types'

const angleModes: AngleMode[] = ['deg', 'rad', 'grad']

export default function CalculatorPanel() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const config = useStore((s) => s.config)
  const setConfig = useStore((s) => s.setConfig)
  const storeHistory = useStore((s) => s.history)
  const addHistory = useStore((s) => s.addHistory)

  const { evaluate } = useMathParser()

  const append = useCallback((text: string) => {
    setInput((prev) => prev + text)
    setError('')
  }, [])

  const handleEval = useCallback(() => {
    if (!input.trim()) return
    const res = evaluate(input)
    if (res.error) {
      setError(res.error)
      setResult('')
    } else {
      setResult(res.result)
      setError('')
    }
    addHistory({
      id: crypto.randomUUID(),
      expression: input,
      result: res.result,
      type: res.type,
      error: res.error,
      panel: 'calculator',
      engineUsed: config.engine,
      executionTime: res.executionTime,
      timestamp: res.timestamp,
    })
  }, [input, evaluate, addHistory, config.engine])

  const handleClear = useCallback(() => {
    setInput('')
    setResult('')
    setError('')
  }, [])

  const handleBackspace = useCallback(() => {
    setInput((prev) => prev.slice(0, -1))
  }, [])

  const handleHistorySelect = useCallback((expression: string) => {
    setInput(expression)
    setError('')
  }, [])

  return (
    <div className="flex gap-4 h-full p-4">
      {/* Calculator */}
      <div className="max-w-lg w-full space-y-3">
        {/* Display */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs font-mono min-h-[1.25rem] truncate">
            {input || 'Enter expression...'}
          </div>
          <div className={`text-lg font-mono min-h-[1.75rem] ${error ? 'text-red-400' : 'text-green-400'}`}>
            {error || result}
          </div>
        </div>

        {/* Angle mode toggle */}
        <div className="flex gap-1">
          {angleModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setConfig({ angleMode: mode })}
              className={`px-2 py-1 rounded text-xs font-mono uppercase transition-colors ${
                config.angleMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Number type selector */}
        <NumberTypeSelector />

        {/* Button grid */}
        <div className="grid grid-cols-5 gap-1">
          {/* Row 1: trig/log functions */}
          <CalcButton label="sin" variant="function" onClick={() => append('sin(')} />
          <CalcButton label="cos" variant="function" onClick={() => append('cos(')} />
          <CalcButton label="tan" variant="function" onClick={() => append('tan(')} />
          <CalcButton label="log" variant="function" onClick={() => append('log(')} />
          <CalcButton label="ln" variant="function" onClick={() => append('log(')} />

          {/* Row 2: inverse trig, sqrt, power */}
          <CalcButton label="asin" variant="function" onClick={() => append('asin(')} />
          <CalcButton label="acos" variant="function" onClick={() => append('acos(')} />
          <CalcButton label="atan" variant="function" onClick={() => append('atan(')} />
          <CalcButton label="sqrt" variant="function" onClick={() => append('sqrt(')} />
          <CalcButton label="x^y" variant="operator" onClick={() => append('^')} />

          {/* Row 3: constants, parens, percent */}
          <CalcButton label="π" variant="constant" onClick={() => append('pi')} />
          <CalcButton label="e" variant="constant" onClick={() => append('e')} />
          <CalcButton label="(" variant="default" onClick={() => append('(')} />
          <CalcButton label=")" variant="default" onClick={() => append(')')} />
          <CalcButton label="%" variant="operator" onClick={() => append('%')} />

          {/* Row 4: 7-9, DEL, AC */}
          <CalcButton label="7" onClick={() => append('7')} />
          <CalcButton label="8" onClick={() => append('8')} />
          <CalcButton label="9" onClick={() => append('9')} />
          <CalcButton label="DEL" variant="action" onClick={handleBackspace} />
          <CalcButton label="AC" variant="action" onClick={handleClear} />

          {/* Row 5: 4-6, *, / */}
          <CalcButton label="4" onClick={() => append('4')} />
          <CalcButton label="5" onClick={() => append('5')} />
          <CalcButton label="6" onClick={() => append('6')} />
          <CalcButton label="×" variant="operator" onClick={() => append('*')} />
          <CalcButton label="÷" variant="operator" onClick={() => append('/')} />

          {/* Row 6: 1-3, +, - */}
          <CalcButton label="1" onClick={() => append('1')} />
          <CalcButton label="2" onClick={() => append('2')} />
          <CalcButton label="3" onClick={() => append('3')} />
          <CalcButton label="+" variant="operator" onClick={() => append('+')} />
          <CalcButton label="-" variant="operator" onClick={() => append('-')} />

          {/* Row 7: 0, ., !, = (span 2) */}
          <CalcButton label="0" onClick={() => append('0')} />
          <CalcButton label="." onClick={() => append('.')} />
          <CalcButton label="!" variant="operator" onClick={() => append('!')} />
          <CalcButton label="=" variant="action" onClick={handleEval} span={2} />
        </div>
      </div>

      {/* History sidebar */}
      <div className="w-72 flex-shrink-0">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">History</h3>
        <CalcHistory history={storeHistory} onSelect={handleHistorySelect} />
      </div>
    </div>
  )
}
