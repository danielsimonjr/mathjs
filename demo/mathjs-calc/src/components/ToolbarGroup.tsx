interface ToolbarGroupProps {
  title: string
  children: React.ReactNode
}

export function ToolbarGroup({ title, children }: ToolbarGroupProps) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-0.5 px-1">
        {children}
      </div>
      <div className="text-[8px] text-gray-600 text-center mt-0.5 uppercase tracking-wider">
        {title}
      </div>
    </div>
  )
}
