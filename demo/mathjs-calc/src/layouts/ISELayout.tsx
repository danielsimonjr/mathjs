import { useRef, useCallback, useMemo } from 'react'
import { Allotment } from 'allotment'
import { useStore } from '../store/useStore'
import { ISECalculatorPanel } from '../panels/ISECalculatorPanel'
import { ISEExpressionBar, type ExpressionBarHandle } from '../components/ISEExpressionBar'
import { GraphCanvas } from '../components/GraphCanvas'
import { usePlot } from '../hooks/usePlot'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function ISELayout() {
  const graphCollapsed = useStore((s) => s.graphCollapsed)
  const toggleGraphCollapsed = useStore((s) => s.toggleGraphCollapsed)
  const expressionBarRef = useRef<ExpressionBarHandle>(null)
  const { plot2d, plot3d, plotParametric, plotPolar, clearPlots } = usePlot()

  const handlePlotCommand = useCallback((command: string, args: string[]) => {
    switch (command) {
      case 'plot': plot2d(args[0]); break
      case 'plot3d': plot3d(args[0]); break
      case 'plotParametric': {
        if (args.length >= 2) plotParametric(args[0], args[1])
        break
      }
      case 'plotPolar': {
        if (args.length >= 1) plotPolar(args[0])
        break
      }
      case 'clearPlot': clearPlots(); break
    }
  }, [plot2d, plot3d, plotParametric, plotPolar, clearPlots])

  const shortcutHandlers = useMemo(() => ({
    onFocusExpression: () => expressionBarRef.current?.focus(),
    onToggleGraph: toggleGraphCollapsed,
    onClearPlots: clearPlots,
  }), [toggleGraphCollapsed, clearPlots])

  useKeyboardShortcuts(shortcutHandlers)

  return (
    <div className="h-screen bg-gray-950">
      <Allotment vertical>
        {/* Top: calculator + graph (horizontal split) */}
        <Allotment.Pane minSize={200}>
          <Allotment>
            <Allotment.Pane minSize={320} preferredSize="40%">
              <ISECalculatorPanel
                onInsertToExpression={(text, offset) => expressionBarRef.current?.insert(text, offset)}
                onDeleteFromExpression={() => expressionBarRef.current?.deleteChar()}
                onClearExpression={() => expressionBarRef.current?.clear()}
                onEvaluateExpression={() => expressionBarRef.current?.evaluate()}
              />
            </Allotment.Pane>
            {!graphCollapsed && (
              <Allotment.Pane minSize={300} preferredSize="60%">
                <GraphCanvas />
              </Allotment.Pane>
            )}
          </Allotment>
        </Allotment.Pane>

        {/* Bottom: expression bar (resizable) */}
        <Allotment.Pane minSize={80} preferredSize={140} maxSize={400}>
          <ISEExpressionBar ref={expressionBarRef} onPlotCommand={handlePlotCommand} />
        </Allotment.Pane>
      </Allotment>
    </div>
  )
}
