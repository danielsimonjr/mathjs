import { useRef, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface ResultDisplayProps {
  result: string | null
  type: string | null
  error: string | null
  executionTime: number | null
  isSymbolic: boolean
  latex: string | null
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  number: 'bg-green-900/50 text-green-400',
  Matrix: 'bg-blue-900/50 text-blue-400',
  Complex: 'bg-purple-900/50 text-purple-400',
  string: 'bg-gray-800 text-gray-400',
  Unit: 'bg-orange-900/50 text-orange-400',
  Function: 'bg-yellow-900/50 text-yellow-400',
  symbolic: 'bg-pink-900/50 text-pink-400',
  plot: 'bg-orange-900/50 text-orange-400',
}

export function ResultDisplay({ result, type, error, executionTime, isSymbolic, latex }: ResultDisplayProps) {
  const katexRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (katexRef.current && latex && isSymbolic) {
      try {
        katex.render(latex, katexRef.current, { displayMode: false, throwOnError: false })
      } catch {
        if (katexRef.current) katexRef.current.textContent = result || ''
      }
    }
  }, [latex, isSymbolic, result])

  if (!result && !error) return null

  return (
    <div className="px-3 py-1 flex items-center gap-2">
      {error ? (
        <span className="text-red-400 font-mono text-sm">{error}</span>
      ) : (
        <>
          <span className="text-gray-500">=</span>
          {isSymbolic && latex ? (
            <div ref={katexRef} className="text-green-400" />
          ) : (
            <span className="text-green-400 font-mono text-sm">{result}</span>
          )}
          {type && (
            <span className={`text-[9px] px-1 py-0 rounded ${TYPE_BADGE_STYLES[type] || 'bg-gray-800 text-gray-400'}`}>
              {type}
            </span>
          )}
        </>
      )}
      {executionTime !== null && (
        <span className="text-gray-600 text-[10px] ml-auto">{executionTime.toFixed(1)}ms</span>
      )}
    </div>
  )
}
