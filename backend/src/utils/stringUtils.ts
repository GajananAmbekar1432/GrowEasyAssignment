export const camelCase = (s: string) => {
  return s
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
};
