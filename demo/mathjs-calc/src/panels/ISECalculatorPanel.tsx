import { Allotment } from 'allotment'
import { ToolbarRibbon } from '../components/ToolbarRibbon'
import { SymbolicOutput } from '../components/SymbolicOutput'
import { VariableExplorer } from '../components/VariableExplorer'
import { EnhancedButtonGrid } from '../components/EnhancedButtonGrid'

interface ISECalculatorPanelProps {
  onInsertToExpression: (text: string, cursorOffset?: number) => void
  onDeleteFromExpression: () => void
  onClearExpression: () => void
  onEvaluateExpression: () => void
}

export function ISECalculatorPanel({
  onInsertToExpression,
  onDeleteFromExpression,
  onClearExpression,
  onEvaluateExpression,
}: ISECalculatorPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gray-950 overflow-hidden">
      <ToolbarRibbon onInsert={onInsertToExpression} />

      <div className="flex-1 min-h-0">
        <Allotment vertical>
          {/* Symbolic output — resizable */}
          <Allotment.Pane minSize={60} preferredSize={180} maxSize={500}>
            <div className="h-full flex flex-col border-b border-gray-800">
              <div className="px-2 py-1 text-[10px] text-gray-600 uppercase tracking-wider font-semibold shrink-0">
                Symbolic
              </div>
              <div className="flex-1 min-h-0">
                <SymbolicOutput />
              </div>
            </div>
          </Allotment.Pane>

          {/* Variables + Button Grid */}
          <Allotment.Pane minSize={150}>
            <div className="h-full flex flex-col overflow-hidden">
              <div className="border-b border-gray-800 shrink-0">
                <div className="px-2 py-1 text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
                  Variables
                </div>
                <VariableExplorer onInsert={onInsertToExpression} />
              </div>
              <div className="flex-1 overflow-y-auto">
                <EnhancedButtonGrid
                  onInsert={onInsertToExpression}
                  onDelete={onDeleteFromExpression}
                  onClear={onClearExpression}
                  onEvaluate={onEvaluateExpression}
                />
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  )
}
