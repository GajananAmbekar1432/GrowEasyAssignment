import { camelCase } from '../utils/stringUtils';

const normalizeKey = (key: string) => {
  if (!key) return '';
  // Remove non-alphanumeric, convert to snake_case then to simplified names
  const cleaned = key.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
  const parts = cleaned.split(/\s+/).map((p) => p.toLowerCase());
  // prefer short forms
  const snake = parts.join('_');
  // convert known mappings
  const mappings: Record<string, string> = {
    phone_number: 'phone',
    phone: 'phone',
    mobile: 'phone',
    email_address: 'email',
    email: 'email',
  };

  return mappings[snake] ?? snake;
};

const normalizeRecords = (records: any[]) => {
  return records.map((r) => {
    const out: any = {};
    Object.keys(r).forEach((k) => {
      const newKey = normalizeKey(k);
      const val = r[k];
      if (val === null || val === undefined) return;
      const trimmed = typeof val === 'string' ? val.trim() : val;
      if (trimmed === '') return;
      out[newKey] = trimmed;
    });
    return out;
  });
};

export default { normalizeRecords };
