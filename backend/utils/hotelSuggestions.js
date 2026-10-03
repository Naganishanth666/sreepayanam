const clean = (value, length = 160) => typeof value === 'string'
  ? value.replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, length)
  : '';

const sourceKey = value => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/$/, '').toLowerCase()}`;
  } catch { return ''; }
};

const publicSource = value => {
  try {
    const url = new URL(value);
    if (!sourceKey(url.href)) return '';
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_|^gclid$|^fbclid$/i.test(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch { return ''; }
};

const sanitizeHotelSuggestions = (payload, sources, checkedAt) => {
  const verifiedSources = new Map((Array.isArray(sources) ? sources : [])
    .map(source => [sourceKey(source?.url), publicSource(source?.url)])
    .filter(([key, url]) => key && url));
  const seen = new Set();
  return (Array.isArray(payload?.hotels) ? payload.hotels : []).slice(0, 8).flatMap(item => {
    const name = clean(item?.name, 110);
    const key = name.toLowerCase();
    const url = verifiedSources.get(sourceKey(item?.sourceUrl));
    if (!name || !url || seen.has(key)) return [];
    seen.add(key);
    const amount = Number(item?.nightlyEstimate);
    const validAmount = Number.isFinite(amount) && amount >= 300 && amount <= 250000;
    return [{
      name,
      area: clean(item?.area, 90),
      fitReason: clean(item?.fitReason, 240),
      category: clean(item?.category, 45),
      nightlyEstimate: validAmount ? Math.round(amount) : null,
      currency: 'INR',
      rateBasis: validAmount ? clean(item?.rateBasis, 160) || 'Publicly listed room/night estimate' : '',
      sourceUrl: url,
      checkedAt
    }];
  }).slice(0, 4);
};

module.exports = { sanitizeHotelSuggestions, publicSource, sourceKey };
