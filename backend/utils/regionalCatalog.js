const { packages, byId } = require('../data/curatedRegionalCatalog');

const hasTimedVisitEachDay = pkg => Number.isInteger(Number(pkg?.durationDays))
  && Array.isArray(pkg?.itinerary) && pkg.itinerary.length === Number(pkg.durationDays)
  && pkg.itinerary.every(day => Array.isArray(day.schedule) && day.schedule.length
    && day.schedule.every((item, index) => /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '')
      && String(item.title || '').trim() && String(item.description || '').trim()
      && (!index || item.time >= day.schedule[index - 1].time))
    && day.schedule.some(item => item.kind === 'visit' && String(item.place || '').trim()
      && /^https:\/\//.test(item.sourceUrl || '')));

const isPublicPackage = (pkg, now = new Date()) => Boolean(pkg && pkg.isActive
  && ['Approved', 'Published'].includes(pkg.status)
  && (!pkg.seasonStart || new Date(pkg.seasonStart) <= now)
  && (!pkg.seasonEnd || new Date(pkg.seasonEnd) >= now)
  && hasTimedVisitEachDay(pkg));

const withOverrides = databasePackages => {
  const overridden = new Set(databasePackages.map(pkg => pkg.packageId));
  return [...packages.filter(pkg => !overridden.has(pkg.packageId)), ...databasePackages];
};

module.exports = { packages, byId, hasTimedVisitEachDay, isPublicPackage, withOverrides };
