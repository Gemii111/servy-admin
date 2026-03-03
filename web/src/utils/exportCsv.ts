/**
 * تصدير البيانات إلى CSV
 * Export data to CSV format
 */

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T | string; label: string }[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) {
    return;
  }

  const BOM = '\uFEFF'; // BOM for Excel UTF-8
  const header = columns.map((c) => c.label).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key as keyof T];
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );
  const csv = BOM + [header, ...rows].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
