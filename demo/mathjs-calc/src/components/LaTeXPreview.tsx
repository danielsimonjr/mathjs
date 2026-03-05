import { useRef, useEffect, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useMathParser } from '../hooks/useMathParser'

interface LaTeXPreviewProps {
  expression: string
}

export function LaTeXPreview({ expression }: LaTeXPreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { math } = useMathParser()

  const latex = useMemo(() => {
    if (!expression.trim()) return ''
    try {
      const node = math.parse(expression)
      return node.toTex()
    } catch {
      return ''
    }
  }, [expression, math])

  useEffect(() => {
    if (ref.current) {
      if (latex) {
        try {
          katex.render(latex, ref.current, {
            displayMode: false,
            throwOnError: false,
          })
        } catch {
          ref.current.textContent = ''
        }
      } else {
        ref.current.textContent = ''
      }
    }
  }, [latex])

  if (!expression.trim()) return null

  return (
    <div className="px-3 py-1 bg-gray-900/50 border-b border-gray-800/50 min-h-[24px]">
      <div ref={ref} className="text-gray-300 text-sm" />
    </div>
  )
}
