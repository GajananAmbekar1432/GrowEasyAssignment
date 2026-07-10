import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_ENABLED = Boolean(GEMINI_API_KEY);

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
  const matches = value.match(/\+?\d(?:[\s().-]?\d){6,14}/g) ?? [];
  return unique(matches.map((item) => normalizePhone(item)));
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
  const phoneCandidates = unique([
    ...(normalized.mobile_without_country_code ? [normalizePhone(normalized.mobile_without_country_code)] : []),
    ...(normalized.phone ? [normalizePhone(normalized.phone)] : []),
  ]);

  const primaryEmail = firstValid(...emailCandidates);
  const primaryPhone = firstValid(...phoneCandidates);

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
    crm_note: noteParts.join(' | '),
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

const callGemini = async (input: any[], requestId: string, batchIndex: number) => {
  if (!GEMINI_ENABLED) {
    console.error(`[import:${requestId}] gemini config missing`, {
      batchIndex,
      model: GEMINI_MODEL,
    });
    throw new Error('GEMINI_API_KEY is not configured');
  }

  console.info(`[import:${requestId}] gemini request start`, {
    batchIndex,
    model: GEMINI_MODEL,
    inputRows: input.length,
  });

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${prompt}\n\nINPUT:\n${JSON.stringify(input)}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  try {
    const resp = await axios.post(GEMINI_URL, body, {
      params: { key: GEMINI_API_KEY },
      headers: { 'Content-Type': 'application/json' },
      timeout: 30_000,
    });

    console.info(`[import:${requestId}] gemini response received`, {
      batchIndex,
      hasCandidates: Boolean(resp.data?.candidates?.length),
      responseKeys: resp.data ? Object.keys(resp.data) : [],
    });

    return resp.data;
  } catch (err: any) {
    console.error(`[import:${requestId}] gemini request failed`, {
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
  if (!GEMINI_ENABLED) {
    console.warn(`[import:${requestId}] gemini unavailable; using deterministic fallback`, {
      batchIndex,
      rows: batch.length,
      model: GEMINI_MODEL,
    });
    return buildFallbackBatch(batch);
  }

  // Attempt up to 3 retries
  let attempts = 0;
  while (attempts < 3) {
    try {
      const aiRaw = await callGemini(batch, requestId, batchIndex);
      const text = extractText(aiRaw);
      console.info(`[import:${requestId}] gemini payload extracted`, {
        batchIndex,
        textLength: text.length,
        preview: text.slice(0, 300),
      });
      const arr = parseJsonArray(text);
      console.info(`[import:${requestId}] gemini output parsed`, {
        batchIndex,
        records: arr.length,
      });
      return arr;
    } catch (err: any) {
      attempts += 1;
      console.warn(`[import:${requestId}] gemini batch retry`, {
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

  const candidateText = aiRaw?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part?.text)
    .filter(Boolean)
    .join('');

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
    console.error('Invalid Gemini output', {
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
