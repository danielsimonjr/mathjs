import { useStore } from '../store/useStore'
import type { NumberType } from '../types'

const types: { label: string; value: NumberType }[] = [
  { label: 'Number', value: 'number' },
  { label: 'BigNum', value: 'BigNumber' },
  { label: 'Complex', value: 'Complex' },
  { label: 'Fraction', value: 'Fraction' },
]

export default function NumberTypeSelector() {
  const numberType = useStore((s) => s.config.numberType)
  const setConfig = useStore((s) => s.setConfig)

  return (
    <div className="flex gap-1">
      {types.map((t) => (
        <button
          key={t.value}
          onClick={() => setConfig({ numberType: t.value })}
          className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
            numberType === t.value
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
