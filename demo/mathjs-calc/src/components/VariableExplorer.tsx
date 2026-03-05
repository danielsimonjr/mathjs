import { useStore } from '../store/useStore'

const TYPE_COLORS: Record<string, string> = {
  number: 'text-green-400',
  Matrix: 'text-blue-400',
  Complex: 'text-purple-400',
  string: 'text-gray-400',
  Function: 'text-yellow-400',
  Unit: 'text-orange-400',
  BigNumber: 'text-teal-400',
  Fraction: 'text-pink-400',
  boolean: 'text-cyan-400',
}

const TYPE_BADGES: Record<string, string> = {
  number: 'bg-green-900/50 text-green-400',
  Matrix: 'bg-blue-900/50 text-blue-400',
  Complex: 'bg-purple-900/50 text-purple-400',
  string: 'bg-gray-800 text-gray-400',
  Function: 'bg-yellow-900/50 text-yellow-400',
  Unit: 'bg-orange-900/50 text-orange-400',
  BigNumber: 'bg-teal-900/50 text-teal-400',
  Fraction: 'bg-pink-900/50 text-pink-400',
}

interface VariableExplorerProps {
  onInsert: (text: string) => void
}

export function VariableExplorer({ onInsert }: VariableExplorerProps) {
  const variables = useStore((s) => s.variables)
  const entries = Object.entries(variables)

  if (entries.length === 0) {
    return (
      <div className="px-2 py-2 text-center text-gray-600 text-xs italic">
        No variables defined
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-32">
      <table className="w-full text-xs">
        <tbody>
          {entries.map(([name, { value, type }]) => (
            <tr
              key={name}
              className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer"
              onClick={() => onInsert(name)}
              title={`Click to insert "${name}" into expression`}
            >
              <td className="py-0.5 px-2 font-mono font-bold text-gray-200">{name}</td>
              <td className="py-0.5 px-1">
                <span className={`px-1 py-0 rounded text-[9px] ${TYPE_BADGES[type] || 'bg-gray-800 text-gray-400'}`}>
                  {type}
                </span>
              </td>
              <td className={`py-0.5 px-2 font-mono truncate max-w-[150px] ${TYPE_COLORS[type] || 'text-gray-400'}`}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
