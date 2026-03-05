interface CalcButtonProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'operator' | 'function' | 'constant' | 'action'
  span?: number
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-800 text-gray-100',
  operator: 'bg-gray-700 text-blue-300',
  function: 'bg-gray-800 text-yellow-300',
  constant: 'bg-gray-800 text-purple-300',
  action: 'bg-blue-600 text-white',
}

export default function CalcButton({ label, onClick, variant = 'default', span = 1 }: CalcButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${variantStyles[variant]} active:scale-95 rounded p-2 text-sm font-mono transition-transform ${span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : ''}`}
    >
      {label}
    </button>
  )
}
