import { useCallback } from 'react'
import { useMathParser } from './useMathParser'
import { useStore } from '../store/useStore'
import type { PlotTrace } from '../types'

const COLORS = ['#60a5fa', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#22d3ee', '#fb923c', '#e879f9']
let colorIdx = 0

export function usePlot() {
  const { math } = useMathParser()
  const { addPlotTrace, clearPlots, setPlotMode } = useStore()

  const plot2d = useCallback(
    (expression: string, variable = 'x', xmin = -10, xmax = 10, points = 1000) => {
      const step = (xmax - xmin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        const xVal = xmin + i * step
        scope[variable] = xVal
        try {
          const yVal = math.evaluate(expression, scope)
          xValues.push(xVal)
          yValues.push(typeof yVal === 'number' && isFinite(yVal) ? yVal : NaN)
        } catch {
          xValues.push(xVal)
          yValues.push(NaN)
        }
      }

      const color = COLORS[colorIdx % COLORS.length]
      colorIdx++

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression,
        type: '2d',
        color,
        visible: true,
        data: { x: xValues, y: yValues },
      }

      addPlotTrace(trace)
      setPlotMode('2d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  const plot3d = useCallback(
    (expression: string, xmin = -5, xmax = 5, ymin = -5, ymax = 5, points = 50) => {
      const xStep = (xmax - xmin) / points
      const yStep = (ymax - ymin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const zValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        for (let j = 0; j <= points; j++) {
          const xVal = xmin + i * xStep
          const yVal = ymin + j * yStep
          scope.x = xVal
          scope.y = yVal
          try {
            const zVal = math.evaluate(expression, scope)
            xValues.push(xVal)
            yValues.push(yVal)
            zValues.push(typeof zVal === 'number' && isFinite(zVal) ? zVal : NaN)
          } catch {
            xValues.push(xVal)
            yValues.push(yVal)
            zValues.push(NaN)
          }
        }
      }

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression,
        type: '3d',
        color: COLORS[colorIdx % COLORS.length],
        visible: true,
        data: { x: xValues, y: yValues, z: zValues },
      }

      colorIdx++
      addPlotTrace(trace)
      setPlotMode('3d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  const plotParametric = useCallback(
    (xExpr: string, yExpr: string, variable = 't', tmin = 0, tmax = 2 * Math.PI, points = 500) => {
      const step = (tmax - tmin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        const tVal = tmin + i * step
        scope[variable] = tVal
        try {
          const xVal = math.evaluate(xExpr, scope)
          const yVal = math.evaluate(yExpr, scope)
          xValues.push(typeof xVal === 'number' ? xVal : NaN)
          yValues.push(typeof yVal === 'number' ? yVal : NaN)
        } catch {
          xValues.push(NaN)
          yValues.push(NaN)
        }
      }

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression: `(${xExpr}, ${yExpr})`,
        type: 'parametric',
        color: COLORS[colorIdx % COLORS.length],
        visible: true,
        data: { x: xValues, y: yValues },
      }

      colorIdx++
      addPlotTrace(trace)
      setPlotMode('2d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  const plotPolar = useCallback(
    (rExpr: string, variable = 'theta', thetaMin = 0, thetaMax = 2 * Math.PI, points = 500) => {
      const step = (thetaMax - thetaMin) / points
      const xValues: number[] = []
      const yValues: number[] = []
      const scope: Record<string, number> = {}

      for (let i = 0; i <= points; i++) {
        const theta = thetaMin + i * step
        scope[variable] = theta
        try {
          const r = math.evaluate(rExpr, scope)
          if (typeof r === 'number' && isFinite(r)) {
            xValues.push(r * Math.cos(theta))
            yValues.push(r * Math.sin(theta))
          } else {
            xValues.push(NaN)
            yValues.push(NaN)
          }
        } catch {
          xValues.push(NaN)
          yValues.push(NaN)
        }
      }

      const trace: PlotTrace = {
        id: crypto.randomUUID(),
        expression: `r = ${rExpr}`,
        type: 'polar',
        color: COLORS[colorIdx % COLORS.length],
        visible: true,
        data: { x: xValues, y: yValues },
      }

      colorIdx++
      addPlotTrace(trace)
      setPlotMode('2d')
      return trace
    },
    [math, addPlotTrace, setPlotMode]
  )

  return { plot2d, plot3d, plotParametric, plotPolar, clearPlots }
}
