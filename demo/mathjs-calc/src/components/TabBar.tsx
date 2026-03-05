import { useStore } from '../store/useStore'
import type { PanelId } from '../types'

const tabs: { id: PanelId; label: string }[] = [
  { id: 'calculator', label: '\u{1F5A9} Calculator' },
  { id: 'matrix', label: 'Matrix Lab' },
  { id: 'signal', label: 'Signal Studio' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'performance', label: 'Performance' },
]

export default function TabBar() {
  const activePanel = useStore((s) => s.activePanel)
  const setActivePanel = useStore((s) => s.setActivePanel)

  return (
    <nav className="flex border-b border-gray-800 bg-gray-900">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActivePanel(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activePanel === tab.id
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-950'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
