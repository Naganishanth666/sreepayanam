const crypto = require('node:crypto');
const { packages: seeds } = require('./curatedLeisureCatalog');

const PACKAGES_PER_SEED = 20;
const REQUIRED_CATEGORIES = [
  'Honeymoon & Romance', 'Wildlife & Nature', 'Adventure & Trekking', 'Family Holidays',
  'Hill Stations & Leisure', 'Beach & Coastal', 'Luxury & Wellness', 'Corporate & MICE',
  'Budget Weekend Getaways', 'National', 'International'
];
const copy = value => JSON.parse(JSON.stringify(value));
const normalized = value => String(value || '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const visitStops = pkg => (pkg.itinerary || []).flatMap(day => (day.schedule || [])
  .filter(item => item.kind === 'visit').map(item => ({ day: day.day, time: item.time, place: item.place })));
const routeSignature = pkg => crypto.createHash('sha256').update(JSON.stringify([
  normalized(pkg.startingCity), normalized(pkg.endingCity), Number(pkg.durationDays),
  pkg.catalogCategories?.[0], visitStops(pkg).map(stop => [stop.day, stop.time, normalized(stop.place)])
])).digest('hex');

const permutations = values => {
  if (values.length < 2) return [values];
  return values.flatMap((value, index) => permutations(values.filter((_, itemIndex) => itemIndex !== index)
    ).map(rest => [value, ...rest]));
};

const sequencePlans = stops => {
  const sourceOrder = stops.map((_, index) => index);
  return [sourceOrder, ...permutations(sourceOrder).filter(order => order.some((value, index) => value !== sourceOrder[index]))]
    .slice(0, PACKAGES_PER_SEED);
};

const editionCopy = {
  en: index => `Alternative visit sequence ${String(index).padStart(2, '0')}. Visit times are suggested local windows; venue access, road order and operator availability are reconfirmed for the requested dates.`,
  ta: index => `மாற்று வருகை வரிசை ${String(index).padStart(2, '0')}. நேரங்கள் உள்ளூர் திட்ட நேரங்கள்; இட அணுகல், சாலை வரிசை மற்றும் இயக்குநர் கிடைப்பை பயணத் தேதிக்காக மீண்டும் உறுதிப்படுத்தவும்.`,
  hi: index => `वैकल्पिक भ्रमण क्रम ${String(index).padStart(2, '0')}। समय स्थानीय योजनाबद्ध समय है; स्थल पहुँच, सड़क क्रम और संचालक उपलब्धता यात्रा तारीख़ के लिए दोबारा पक्की करें।`
};
const routePlanLabel = {
  en: index => ` · Route ${String(index).padStart(2, '0')}`,
  ta: index => ` · பயண வழி ${String(index).padStart(2, '0')}`,
  hi: index => ` · मार्ग ${String(index).padStart(2, '0')}`
};

const createEdition = (seed, index, stopOrder) => {
  const pkg = copy(seed);
  if (index > 1) {
    pkg.packageId = `${seed.packageId}-R${String(index).padStart(2, '0')}`;
    for (const language of ['en', 'ta', 'hi']) {
      const translation = pkg.translations[language];
      translation.title = `${translation.title}${routePlanLabel[language](index)}`;
      translation.overview = `${translation.overview} ${editionCopy[language](index)}`;
      const itinerary = translation.itinerary;
      const visits = itinerary.flatMap(day => day.schedule.filter(item => item.kind === 'visit'));
      const slots = visits.map(item => item.time);
      const ordered = stopOrder.map(position => ({ ...visits[position] }));
      ordered.forEach((item, position) => { item.time = slots[position]; });
      let visitIndex = 0;
      for (const day of itinerary) {
        day.schedule = day.schedule.map(item => item.kind === 'visit' ? ordered[visitIndex++] : item);
      }
      dayTitles(translation.itinerary, language, index);
    }
    pkg.title = pkg.translations.en.title;
    pkg.overview = pkg.translations.en.overview;
  }
  pkg.itinerary = pkg.translations.en.itinerary;
  pkg.routeSignature = routeSignature(pkg);
  return pkg;
};

function dayTitles(itinerary, language, index) {
  const suffix = language === 'ta' ? ` · வழி ${String(index).padStart(2, '0')}`
    : language === 'hi' ? ` · मार्ग ${String(index).padStart(2, '0')}`
      : ` · Route ${String(index).padStart(2, '0')}`;
  itinerary.forEach(day => { day.title = `${day.title}${suffix}`; });
}

const packages = seeds.flatMap(seed => sequencePlans(visitStops(seed)).map((order, index) => createEdition(seed, index + 1, order)));
const byId = new Map(packages.map(pkg => [pkg.packageId, pkg]));
const counts = Object.fromEntries(REQUIRED_CATEGORIES.map(category => [category,
  packages.filter(pkg => pkg.catalogCategories?.length === 1 && pkg.catalogCategories[0] === category).length]));

if (packages.length !== 660 || Object.values(counts).some(count => count !== 60)) {
  throw new Error(`Catalog expansion must contain 60 routes in each of 11 categories; got ${JSON.stringify(counts)}.`);
}
if (byId.size !== packages.length || new Set(packages.map(pkg => pkg.routeSignature)).size !== packages.length) {
  throw new Error('Expanded packages must have unique package IDs and route signatures.');
}
const categoryByLocation = new Map();
for (const pkg of packages) {
  for (const location of pkg.locationTags || []) {
    const category = pkg.catalogCategories[0];
    const previous = categoryByLocation.get(location);
    if (previous && previous !== category) throw new Error(`Location ${location} appears in ${previous} and ${category}.`);
    categoryByLocation.set(location, category);
  }
}

module.exports = { packages, byId, seeds, counts, routeSignature, REQUIRED_CATEGORIES };
