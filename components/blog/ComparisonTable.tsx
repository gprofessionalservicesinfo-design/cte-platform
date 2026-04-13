interface ComparisonTableProps {
  headers: string[]
  rows: string[][]
}

export default function ComparisonTable({ headers, rows }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto my-6 rounded-2xl border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="text-white" style={{ background: '#2A3544' }}>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-3.5 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-5 py-3.5 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
