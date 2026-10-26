export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (row: T) => string;
}

function escapeCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  // Prevent spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCell(column.header)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const value = column.format ? column.format(row) : row[column.key as keyof T];
        return escapeCell(value);
      })
      .join(',')
  );
  return `\uFEFF${[header, ...lines].join('\r\n')}\r\n`;
}

/** Strip characters that have meaning in a PostgREST `or` filter expression. */
export function sanitizeSearchTerm(input: string | undefined): string {
  if (!input) return '';
  return input
    .slice(0, 100)
    .replace(/[,()%\\"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildIlikeOrFilter(columns: string[], search: string): string {
  const term = sanitizeSearchTerm(search);
  if (!term) return '';
  return columns.map((column) => `${column}.ilike.%${term}%`).join(',');
}
