interface ButtonDef {
  label: string
  insert: string
  variant: 'default' | 'operator' | 'function' | 'constant' | 'action' | 'symbolic'
}

const GRID: ButtonDef[][] = [
  [
    { label: 'd/dx', insert: 'derivative("","x")', variant: 'symbolic' },
    { label: '∫', insert: 'integrate("","x")', variant: 'symbolic' },
    { label: 'Σ', insert: 'sum()', variant: 'symbolic' },
    { label: '∏', insert: 'prod()', variant: 'symbolic' },
    { label: 'lim', insert: 'limit("","x",0)', variant: 'symbolic' },
    { label: '∞', insert: 'Infinity', variant: 'constant' },
  ],
  [
    { label: 'sin', insert: 'sin(', variant: 'function' },
    { label: 'cos', insert: 'cos(', variant: 'function' },
    { label: 'tan', insert: 'tan(', variant: 'function' },
    { label: 'asin', insert: 'asin(', variant: 'function' },
    { label: 'acos', insert: 'acos(', variant: 'function' },
    { label: 'atan', insert: 'atan(', variant: 'function' },
  ],
  [
    { label: 'log', insert: 'log(', variant: 'function' },
    { label: 'ln', insert: 'log(', variant: 'function' },
    { label: 'eˣ', insert: 'exp(', variant: 'function' },
    { label: '10ˣ', insert: '10^', variant: 'function' },
    { label: '√', insert: 'sqrt(', variant: 'function' },
    { label: 'xʸ', insert: '^', variant: 'operator' },
  ],
  [
    { label: '(', insert: '(', variant: 'operator' },
    { label: ')', insert: ')', variant: 'operator' },
    { label: '[', insert: '[', variant: 'operator' },
    { label: ']', insert: ']', variant: 'operator' },
    { label: '|x|', insert: 'abs(', variant: 'function' },
    { label: 'n!', insert: '!', variant: 'operator' },
  ],
  [
    { label: '7', insert: '7', variant: 'default' },
    { label: '8', insert: '8', variant: 'default' },
    { label: '9', insert: '9', variant: 'default' },
    { label: 'DEL', insert: '__DEL__', variant: 'action' },
    { label: 'AC', insert: '__AC__', variant: 'action' },
    { label: 'ANS', insert: 'ans', variant: 'constant' },
  ],
  [
    { label: '4', insert: '4', variant: 'default' },
    { label: '5', insert: '5', variant: 'default' },
    { label: '6', insert: '6', variant: 'default' },
    { label: '×', insert: ' * ', variant: 'operator' },
    { label: '÷', insert: ' / ', variant: 'operator' },
    { label: 'mod', insert: ' mod ', variant: 'operator' },
  ],
  [
    { label: '1', insert: '1', variant: 'default' },
    { label: '2', insert: '2', variant: 'default' },
    { label: '3', insert: '3', variant: 'default' },
    { label: '+', insert: ' + ', variant: 'operator' },
    { label: '−', insert: ' - ', variant: 'operator' },
    { label: '=', insert: '__EVAL__', variant: 'action' },
  ],
  [
    { label: '0', insert: '0', variant: 'default' },
    { label: '.', insert: '.', variant: 'default' },
    { label: 'π', insert: 'pi', variant: 'constant' },
    { label: 'e', insert: 'e', variant: 'constant' },
    { label: 'i', insert: 'i', variant: 'constant' },
    { label: 'EXP', insert: 'e', variant: 'function' },
  ],
]

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-gray-800 hover:bg-gray-700 text-gray-100',
  operator: 'bg-gray-700 hover:bg-gray-600 text-blue-300',
  function: 'bg-gray-800 hover:bg-gray-700 text-yellow-300',
  constant: 'bg-gray-800 hover:bg-gray-700 text-purple-300',
  action: 'bg-blue-700 hover:bg-blue-600 text-white',
  symbolic: 'bg-gray-800 hover:bg-gray-700 text-pink-300',
}

interface EnhancedButtonGridProps {
  onInsert: (text: string) => void
  onDelete: () => void
  onClear: () => void
  onEvaluate: () => void
}

export function EnhancedButtonGrid({ onInsert, onDelete, onClear, onEvaluate }: EnhancedButtonGridProps) {
  const handleClick = (btn: ButtonDef) => {
    if (btn.insert === '__DEL__') return onDelete()
    if (btn.insert === '__AC__') return onClear()
    if (btn.insert === '__EVAL__') return onEvaluate()
    onInsert(btn.insert)
  }

  return (
    <div className="grid grid-cols-6 gap-1 p-1">
      {GRID.flat().map((btn, i) => (
        <button
          key={i}
          onClick={() => handleClick(btn)}
          className={`${VARIANT_STYLES[btn.variant]} rounded py-1.5 text-xs font-mono font-medium transition-colors active:scale-95`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
