// Short-lived, source-checked venue records for major Madurai stops. General
// destinations continue through live web research; these records expire so a
// changed venue schedule cannot silently persist forever.
const verifiedAt = '2026-10-07T00:00:00Z';
const VALID_FOR_MS = 30 * 86400000;
const records = [
  {
    matches: /^(?:madurai )?meenakshi(?: amman| sundareswarar)? temple(?:,? madurai)?$/i,
    windows: [{ start: '05:00', end: '12:30' }, { start: '16:00', end: '22:00' }],
    closedWeekdays: [],
    sourceUrl: 'https://maduraimeenakshi.hrce.tn.gov.in/hrcehome/index_temple.php?tid=031962'
  },
  {
    matches: /^(?:thirumalai|tirumalai) nayakk?ar (?:palace|mahal)(?:,? madurai)?$/i,
    windows: [{ start: '10:00', end: '17:00' }],
    closedWeekdays: [5],
    sourceUrl: 'https://www.tnarch.gov.in/tirumalai-nayak-mahal-site-museum-madurai'
  }
];

const officialVisitWindows = (places, now = Date.now()) => {
  if (now - Date.parse(verifiedAt) > VALID_FOR_MS) return [];
  return (places || []).flatMap(name => {
    const match = records.find(record => record.matches.test(String(name).trim()));
    return match ? [{ name, windows: match.windows, closedWeekdays: match.closedWeekdays,
      sourceUrl: match.sourceUrl, checkedAt: verifiedAt, event: null }] : [];
  });
};

module.exports = { officialVisitWindows };
