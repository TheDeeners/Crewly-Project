import React from 'react'

interface Column<T> {
  header: string
  render: (item: T) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'ไม่พบข้อมูลที่ต้องการ',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-12 text-center shadow-subtle">
        <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center mx-auto mb-3 text-txt-light">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-txt-muted text-sm font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-surface rounded-2xl border border-border shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-txt">
          <thead className="bg-[#FAF7F5] border-b border-border text-xs font-semibold uppercase tracking-wider text-txt-muted">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-bg/60 transition-colors duration-150"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-5 py-3.5 align-middle ${col.className || ''}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
