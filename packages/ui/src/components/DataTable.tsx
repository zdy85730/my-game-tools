import type { ReactNode } from 'react';

export interface DataColumn<Row> {
  key: string;
  header: string;
  align?: 'start' | 'center' | 'end';
  render?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: Array<DataColumn<Row>>;
  rows: Row[];
  getRowKey: (row: Row) => string;
  emptyState?: string;
}

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  emptyState = '暂无数据',
}: DataTableProps<Row>) {
  return (
    <div className="mgt-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="mgt-table__empty" colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
