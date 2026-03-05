import { useCallback } from 'react'
import { useMathParser } from './useMathParser'
import { useStore } from '../store/useStore'
import type { SymbolicResult } from '../types'

const SYMBOLIC_FUNCTIONS = ['simplify', 'derivative', 'expand', 'rationalize', 'solve']

export function useSymbolic() {
  const { math } = useMathParser()
  const addSymbolicResult = useStore((s) => s.addSymbolicResult)

  const isSymbolic = useCallback((expression: string): boolean => {
    return SYMBOLIC_FUNCTIONS.some((fn) => expression.trim().startsWith(fn + '('))
  }, [])

  const evaluateSymbolic = useCallback(
    (expression: string): SymbolicResult | null => {
      try {
        const result = math.evaluate(expression)

        let latexIn = ''
        try {
          const match = expression.match(/^(\w+)\("([^"]+)"/)
          if (match) {
            const fnName = match[1]
            const innerExpr = match[2]
            const parsed = math.parse(innerExpr)
            if (fnName === 'derivative') {
              latexIn = `\\frac{d}{dx}\\left[${parsed.toTex()}\\right]`
            } else if (fnName === 'simplify') {
              latexIn = `\\text{simplify}\\left(${parsed.toTex()}\\right)`
            } else {
              latexIn = `\\text{${fnName}}\\left(${parsed.toTex()}\\right)`
            }
          } else {
            latexIn = math.parse(expression).toTex()
          }
        } catch {
          latexIn = expression
        }

        let latexOut = ''
        let output = ''
        try {
          if (typeof result === 'object' && result !== null && 'toTex' in result) {
            latexOut = result.toTex()
            output = result.toString()
          } else if (typeof result === 'string') {
            latexOut = math.parse(result).toTex()
            output = result
          } else {
            output = math.format(result, { precision: 14 })
            latexOut = output
          }
        } catch {
          output = math.format(result, { precision: 14 })
          latexOut = output
        }

        const entry: SymbolicResult = {
          id: crypto.randomUUID(),
          input: expression,
          output,
          latexIn,
          latexOut,
          timestamp: Date.now(),
        }

        addSymbolicResult(entry)
        return entry
      } catch {
        return null
      }
    },
    [math, addSymbolicResult]
  )

  return { isSymbolic, evaluateSymbolic }
}
