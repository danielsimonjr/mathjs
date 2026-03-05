import { useRef, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useStore } from '../store/useStore'

function KaTeXBlock({ latex, className }: { latex: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && latex) {
      try {
        katex.render(latex, ref.current, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        })
      } catch {
        if (ref.current) ref.current.textContent = latex
      }
    }
  }, [latex])

  return <div ref={ref} className={className} />
}

export function SymbolicOutput() {
  const symbolicHistory = useStore((s) => s.symbolicHistory)

  if (symbolicHistory.length === 0) {
    return (
      <div className="px-2 py-3 text-center text-gray-600 text-xs italic">
        Symbolic results appear here
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-48 space-y-2 p-2">
      {symbolicHistory.slice(0, 20).map((entry) => (
        <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded p-2">
          <KaTeXBlock latex={entry.latexIn} className="text-gray-300 text-sm" />
          <div className="text-center text-gray-600 text-xs my-1">=</div>
          <KaTeXBlock latex={entry.latexOut} className="text-green-400 text-sm" />
        </div>
      ))}
    </div>
  )
}
