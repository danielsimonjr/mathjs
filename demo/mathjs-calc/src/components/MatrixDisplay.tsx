interface MatrixDisplayProps {
  data: number[][] | number[] | null
  label: string
  precision?: number
}

export default function MatrixDisplay({ data, label, precision = 4 }: MatrixDisplayProps) {
  if (data === null) return null

  const rows: number[][] = typeof data[0] === 'number'
    ? [(data as number[])]
    : (data as number[][])

  return (
    <div>
      <span className="text-xs text-gray-400 mb-1 block">{label}</span>
      <table className="border-collapse">
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) => (
                <td
                  key={c}
                  className="border border-gray-700 px-2 py-0.5 text-right font-mono text-xs text-gray-200"
                >
                  {typeof val === 'number' ? val.toPrecision(precision) : String(val)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
