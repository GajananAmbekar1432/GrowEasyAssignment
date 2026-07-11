import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'gemma-7b-it';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_ENABLED = Boolean(GROQ_API_KEY);

const CRM_FIELDS = new Set([
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
]);

const allowedStatuses = new Set([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

const allowedDataSources = new Set([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]);

const CONTACT_KEY_PATTERN = /^(email\d*|emails?|mobile\d*|mob\d*|phone\d*)$/i;

const toText = (value: any) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return '';
};

const normalizePhone = (value: string) => value.replace(/[^0-9]/g, '');

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const collectMatches = (value: string, pattern: RegExp) => {
  const matches = value.match(pattern) ?? [];
  return unique(matches.map((item) => item.trim()).filter(Boolean));
};

const extractEmails = (value: string) => {
  return collectMatches(value, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g);
};

const extractPhones = (value: string) => {
  if (!value) return [];
  const rawMatches = value.match(/[+\d][\d\s().-]{6,}/g) ?? [];

  const results: string[] = [];

  const splitLongNumber = (digits: string) => {
    const out: string[] = [];
    let s = digits;
    // greedy split from the end into common phone lengths
    const prefs = [10, 9, 8, 7];
    while (s.length >= 7) {
      let taken: string | null = null;
      for (const len of prefs) {
        if (s.length - len >= 0) {
          taken = s.slice(-len);
          s = s.slice(0, -len);
          out.push(taken);
          break;
        }
      }
      if (!taken) break;
    }
    // if some leftover digits <7, discard them
    return out.reverse();
  };

  rawMatches.forEach((m) => {
    const digits = (m.match(/\d+/g) ?? []).join('');
    if (!digits) return;
    if (digits.length <= 15) {
      results.push(digits);
    } else {
      // likely concatenated numbers, attempt to split
      const parts = splitLongNumber(digits);
      results.push(...parts);
    }
  });

  return unique(results.map((item) => normalizePhone(item)));
};

const firstValid = (...values: string[]) => values.find((value) => Boolean(value)) ?? '';

const sanitizeAllowedValue = (value: string, allowed: Set<string>) =>
  allowed.has(value) ? value : '';

const buildFallbackRecord = (record: Record<string, any>) => {
  const normalized: Record<string, string> = {};

  Object.entries(record).forEach(([key, value]) => {
    const text = toText(value);
    if (text) {
      normalized[key] = text;
    }
  });

  const emailCandidates = unique([
    ...extractEmails(normalized.email ?? ''),
  ]);
  // Collect phone candidates from common fields and by scanning all fields for phone-like patterns.
  const phoneSet = new Set<string>();

  const tryAddPhones = (val: string | undefined) => {
    if (!val) return;
    // extractPhones returns normalized numbers (digits only)
    const found = extractPhones(val).map((p) => normalizePhone(p));
    found.forEach((p) => {
      if (p) phoneSet.add(p);
    });
  };

  // Check common fields
  tryAddPhones(normalized.mobile_without_country_code);
  tryAddPhones(normalized.phone);
  tryAddPhones(normalized.mobile);

  // Also scan any other fields that might contain contact numbers
  Object.entries(normalized).forEach(([k, v]) => {
    if (!v) return;
    if (CONTACT_KEY_PATTERN.test(k) || /phone|mobile|mob|tel/i.test(k)) {
      tryAddPhones(v);
    }
  });

  const phoneCandidates = Array.from(phoneSet);

  const isValidPhone = (p: string) => p.length >= 7 && p.length <= 15;

  // Prefer first valid-length phone, otherwise the first candidate
  const primaryPhone = phoneCandidates.find(isValidPhone) ?? phoneCandidates[0] ?? '';

  const primaryEmail = firstValid(...emailCandidates);
  // primaryPhone already computed above

  if (!primaryEmail && !primaryPhone) {
    return null;
  }

  const noteParts: string[] = [];
  if (emailCandidates.length > 1) {
    noteParts.push(`Additional emails: ${emailCandidates.slice(1).join(', ')}`);
  }
  if (phoneCandidates.length > 1) {
    noteParts.push(`Additional mobiles: ${phoneCandidates.slice(1).join(', ')}`);
  }

  const extraFields = Object.entries(normalized)
    .filter(
      ([key]) =>
        !CRM_FIELDS.has(key) &&
        key !== 'phone' &&
        key !== 'emails' &&
        key !== 'mobile' &&
        !CONTACT_KEY_PATTERN.test(key),
    )
    .map(([key, value]) => `${key}: ${value}`);

  if (extraFields.length > 0) {
    noteParts.push(...extraFields);
  }

  // Preserve the original crm_note from CSV as-is, and append detected extras.
  const originalNote = normalized.crm_note ?? '';
  const crmNoteFinal = originalNote
    ? [originalNote, ...noteParts].join(' | ')
    : noteParts.join(' | ');

  return {
    created_at: normalized.created_at ?? '',
    name: normalized.name ?? '',
    email: primaryEmail,
    country_code: normalized.country_code ?? '',
    mobile_without_country_code: primaryPhone,
    company: normalized.company ?? '',
    city: normalized.city ?? '',
    state: normalized.state ?? '',
    country: normalized.country ?? '',
    lead_owner: normalized.lead_owner ?? '',
    crm_status: sanitizeAllowedValue(normalized.crm_status ?? '', allowedStatuses),
    crm_note: crmNoteFinal,
    data_source: sanitizeAllowedValue(normalized.data_source ?? '', allowedDataSources),
    possession_time: normalized.possession_time ?? '',
    description: normalized.description ?? '',
  };
};

const buildFallbackBatch = (batch: any[]) => {
  return batch.map((record) => buildFallbackRecord(record)).filter(Boolean);
};

const prompt = `You are a CRM extraction engine.

Convert arbitrary CSV rows into GrowEasy CRM format.

Return ONLY valid JSON.

Never return markdown.

Skip records missing both email and mobile.

CRM Schema:

created_at

name

email

country_code

mobile_without_country_code

company

city

state

country

lead_owner

crm_status

crm_note

data_source

possession_time

description

Allowed crm_status

GOOD_LEAD_FOLLOW_UP

DID_NOT_CONNECT

BAD_LEAD

SALE_DONE

Allowed data_source

leads_on_demand

meridian_tower

eden_park

varah_swamy

sarjapur_plots

If uncertain leave blank.

If multiple emails exist in the primary email field

Use first.

Append others to crm_note.

Do not copy the primary email or primary mobile into crm_note.

If multiple mobiles exist in the primary mobile field

Use first.

Append remaining to crm_note.

If extra information exists

Put inside crm_note.

Return ONLY JSON array.`;

const callGroq = async (input: any[], requestId: string, batchIndex: number) => {
  if (!GROQ_ENABLED) {
    console.error(`[import:${requestId}] groq config missing`, {
      batchIndex,
      model: GROQ_MODEL,
    });
    throw new Error('GROQ_API_KEY is not configured');
  }

  console.info(`[import:${requestId}] groq request start`, {
    batchIndex,
    model: GROQ_MODEL,
    inputRows: input.length,
  });

  const body = {
    model: GROQ_MODEL,
    temperature: 0.1,
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
  };

  try {
    const resp = await axios.post(GROQ_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      timeout: 30_000,
    });

    console.info(`[import:${requestId}] groq response received`, {
      batchIndex,
      hasChoices: Boolean(resp.data?.choices?.length),
      responseKeys: resp.data ? Object.keys(resp.data) : [],
    });

    return resp.data;
  } catch (err: any) {
    console.error(`[import:${requestId}] groq request failed`, {
      batchIndex,
      message: err?.message,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      responseData: summarizeResponse(err?.response?.data),
    });
    throw err;
  }
};

const processBatch = async (batch: any[], requestId = 'unknown', batchIndex = 0) => {
  if (!GROQ_ENABLED) {
    console.warn(`[import:${requestId}] groq unavailable; using deterministic fallback`, {
      batchIndex,
      rows: batch.length,
      model: GROQ_MODEL,
    });
    return buildFallbackBatch(batch);
  }

  // Attempt up to 3 retries
  let attempts = 0;
  while (attempts < 3) {
    try {
      const aiRaw = await callGroq(batch, requestId, batchIndex);
      const text = extractText(aiRaw);
      console.info(`[import:${requestId}] groq payload extracted`, {
        batchIndex,
        textLength: text.length,
        preview: text.slice(0, 300),
      });
      const arr = parseJsonArray(text);
      console.info(`[import:${requestId}] groq output parsed`, {
        batchIndex,
        records: arr.length,
      });
      return arr;
    } catch (err: any) {
      attempts += 1;
      console.warn(`[import:${requestId}] groq batch retry`, {
        batchIndex,
        attempt: attempts,
        message: err?.message,
      });
      if (attempts >= 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempts));
    }
  }
  return [];
};

const extractText = (aiRaw: any) => {
  if (typeof aiRaw === 'string') {
    return aiRaw;
  }

  const candidateText = aiRaw?.choices?.[0]?.message?.content;

  if (candidateText) {
    return candidateText;
  }

  if (aiRaw?.text && typeof aiRaw.text === 'string') {
    return aiRaw.text;
  }

  return JSON.stringify(aiRaw);
};

const parseJsonArray = (text: string) => {
  const trimmed = text.trim();

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_err) {
    // Fall through to bracket extraction.
  }

  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    console.error('Invalid Groq output', {
      textPreview: trimmed.slice(0, 500),
      textLength: trimmed.length,
    });
    throw new Error('Invalid AI output');
  }

  return JSON.parse(trimmed.slice(start, end + 1));
};

const summarizeResponse = (data: any) => {
  if (!data) return null;

  if (typeof data === 'string') {
    return data.slice(0, 500);
  }

  if (Array.isArray(data)) {
    return data.slice(0, 3);
  }

  return {
    keys: Object.keys(data),
    preview: JSON.stringify(data).slice(0, 500),
  };
};

export default { processBatch };
