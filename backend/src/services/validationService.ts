import validator from 'validator';

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

const isValidEmail = (e?: string) => (e ? validator.isEmail(e) : false);

const isValidPhone = (p?: string) => {
  if (!p) return false;
  // simple digits only check
  const cleaned = p.replace(/[^0-9]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
};

const isValidDate = (d?: string) => {
  if (!d) return true; // optional
  const ts = Date.parse(d);
  return !Number.isNaN(ts);
};

const validateRecord = (r: any) => {
  const errors: string[] = [];

  if (r.crm_status && !allowedStatuses.has(r.crm_status)) {
    errors.push('Invalid crm_status');
  }

  if (r.data_source && !allowedDataSources.has(r.data_source)) {
    errors.push('Invalid data_source');
  }

  if (r.email && !isValidEmail(r.email)) {
    errors.push('Invalid email');
  }

  if (r.mobile_without_country_code && !isValidPhone(r.mobile_without_country_code)) {
    errors.push('Invalid phone');
  }

  if (r.created_at && !isValidDate(r.created_at)) {
    errors.push('Invalid created_at');
  }

  return { isValid: errors.length === 0, reason: errors.join('; ') };
};

export default { validateRecord };
