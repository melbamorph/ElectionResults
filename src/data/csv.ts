export type CsvObject = Record<string, string>;

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, '').trim().toLowerCase();
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ',') {
      row.push(value.trim());
      value = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') {
        i += 1;
      }
      row.push(value.trim());
      value = '';
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    value += ch;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export function parseCsvObjects(text: string, requiredHeaders: string[]): CsvObject[] {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    throw new Error('CSV file is empty.');
  }

  const normalizedRequiredHeaders = requiredHeaders.map((header) => normalizeHeader(header));
  const headerIndex = rows.findIndex((row) => {
    const headers = row.map((header) => normalizeHeader(header));
    return normalizedRequiredHeaders.every((requiredHeader) => headers.includes(requiredHeader));
  });

  const headers = (headerIndex >= 0 ? rows[headerIndex] : rows[0]).map((header) => normalizeHeader(header));
  const missing = normalizedRequiredHeaders.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    throw new Error(`CSV missing required headers: ${missing.join(', ')}`);
  }

  return rows.slice(headerIndex + 1).map((cells) => {
    const record: CsvObject = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] || '').trim();
    });
    return record;
  });
}

export function parseIntSafe(value: string, fieldName: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for ${fieldName}: ${value}`);
  }
  return parsed;
}

export function parseBoolSafe(value: string, fieldName: string): boolean {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'TRUE') {
    return true;
  }
  if (normalized === 'FALSE') {
    return false;
  }
  throw new Error(`Invalid boolean for ${fieldName}: ${value}`);
}
