import { useStore } from './store/useStore'
import ExpressionBar from './components/ExpressionBar'
import TabBar from './components/TabBar'
import CalculatorPanel from './panels/CalculatorPanel'
import MatrixLabPanel from './panels/MatrixLabPanel'
import SignalStudioPanel from './panels/SignalStudioPanel'
import StatisticsPanel from './panels/StatisticsPanel'
import PerformancePanel from './panels/PerformancePanel'

const panels = {
  calculator: CalculatorPanel,
  matrix: MatrixLabPanel,
  signal: SignalStudioPanel,
  statistics: StatisticsPanel,
  performance: PerformancePanel,
} as const

export default function App() {
  const activePanel = useStore((s) => s.activePanel)
  const ActivePanel = panels[activePanel]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <ExpressionBar />
      <TabBar />
      <main className="flex-1">
        <ActivePanel />
      </main>
    </div>
  )
}
