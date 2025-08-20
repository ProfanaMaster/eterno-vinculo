import { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

interface TableHeaderProps {
  children: ReactNode
}

interface TableBodyProps {
  children: ReactNode
}

interface TableRowProps {
  children: ReactNode
  className?: string
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export const Table = ({ children, className = '' }: TableProps) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      {children}
    </table>
  </div>
)

export const TableHeader = ({ children }: TableHeaderProps) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
)

export const TableBody = ({ children }: TableBodyProps) => (
  <tbody className="divide-y divide-gray-200">
    {children}
  </tbody>
)

export const TableRow = ({ children, className = '' }: TableRowProps) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
    {children}
  </tr>
)

export const TableCell = ({ children, className = '' }: TableCellProps) => (
  <td className={`px-6 py-4 text-sm ${className}`}>
    {children}
  </td>
)

export const TableHeaderCell = ({ children, className = '' }: TableCellProps) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
)