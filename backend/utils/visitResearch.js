const { publicSource } = require('./hotelSuggestions');

const clean = (value, limit = 180) => typeof value === 'string'
  ? value.replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, limit) : '';
const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const weekdays = new Map(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day, index) => [day, index]));
const sourceKey = value => {
  const safe = publicSource(value);
  if (!safe) return '';
  const url = new URL(safe);
  url.searchParams.sort();
  return `${url.origin.toLowerCase()}${url.pathname.replace(/\/$/, '').toLowerCase()}${url.search}`;
};

// Web-search output is untrusted. Only keep hours tied to a returned HTTPS
// source and a name the traveller actually selected.
const sanitizeVisitResearch = (payload, sources, selectedPlaces, startDate, returnDate, checkedAt) => {
  const allowedNames = new Map((selectedPlaces || []).map(name => [String(name).trim().toLowerCase(), name]));
  const allowedSources = new Map((sources || []).map(source => [sourceKey(source?.url), publicSource(source?.url)])
    .filter(([key, url]) => key && url));
  const seen = new Set();
  return (Array.isArray(payload?.places) ? payload.places : []).slice(0, 15).flatMap(item => {
    const name = allowedNames.get(clean(item?.name, 160).toLowerCase());
    const sourceUrl = allowedSources.get(sourceKey(item?.sourceUrl));
    if (!name || !sourceUrl || seen.has(name.toLowerCase())) return [];
    const windows = (Array.isArray(item?.windows) ? item.windows : []).slice(0, 4)
      .filter(window => validTime(window?.start) && validTime(window?.end) && window.end > window.start)
      .map(window => ({ start: window.start, end: window.end }))
      .sort((a, b) => a.start.localeCompare(b.start));
    if (!windows.length) return [];
    seen.add(name.toLowerCase());
    const closedWeekdays = [...new Set((Array.isArray(item?.closedWeekdays) ? item.closedWeekdays : [])
      .map(day => weekdays.get(clean(day, 3).toLowerCase())).filter(day => day !== undefined))];
    const event = item?.event;
    const eventDate = clean(event?.date, 10);
    const eventSourceUrl = allowedSources.get(sourceKey(event?.sourceUrl));
    const validEvent = validDate(eventDate) && validDate(startDate) && validDate(returnDate)
      && eventDate >= startDate && eventDate <= returnDate && eventSourceUrl && clean(event?.description, 180);
    return [{ name, windows, closedWeekdays, sourceUrl, checkedAt,
      event: validEvent ? { date: eventDate, description: clean(event.description, 180), sourceUrl: eventSourceUrl } : null }];
  });
};

module.exports = { sanitizeVisitResearch };
