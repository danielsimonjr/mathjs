interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  tooltip: string
  onClick: () => void
  active?: boolean
}

export function ToolbarButton({ icon, label, tooltip, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded text-xs transition-colors
        ${active
          ? 'bg-blue-600/20 text-blue-400'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[9px] leading-none font-medium">{label}</span>
    </button>
  )
}
