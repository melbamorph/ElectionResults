export type CsvObject = Record<string, string>;

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, '').trim().toLowerCase();
}

export function parseCsv(text: string, delimiter = ','): string[][] {
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

    if (!inQuotes && ch === delimiter) {
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

function findHeaderRowIndex(rows: string[][], requiredHeaders: string[]): number {
  return rows.findIndex((row) => {
    const headers = row.map((header) => normalizeHeader(header));
    return requiredHeaders.every((requiredHeader) => headers.includes(requiredHeader));
  });
}

export function parseCsvObjects(text: string, requiredHeaders: string[]): CsvObject[] {
  const normalizedRequiredHeaders = requiredHeaders.map((header) => normalizeHeader(header));
  const candidateDelimiters = [',', ';', '\t'];

  let selectedRows: string[][] = [];
  let headerIndex = -1;

  for (const delimiter of candidateDelimiters) {
    const rows = parseCsv(text, delimiter);
    if (rows.length === 0) {
      continue;
    }

    const currentHeaderIndex = findHeaderRowIndex(rows, normalizedRequiredHeaders);
    if (currentHeaderIndex >= 0) {
      selectedRows = rows;
      headerIndex = currentHeaderIndex;
      break;
    }

    if (selectedRows.length === 0) {
      selectedRows = rows;
    }
  }

  if (selectedRows.length === 0) {
    throw new Error('CSV file is empty.');
  }

  const headers = (headerIndex >= 0 ? selectedRows[headerIndex] : selectedRows[0]).map((header) =>
    normalizeHeader(header),
  );
  const missing = normalizedRequiredHeaders.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    throw new Error(`CSV missing required headers: ${missing.join(', ')}`);
  }

  return selectedRows.slice(headerIndex + 1).map((cells) => {
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
