export const CATALOG_CATEGORIES = [
  'National Tours', 'International Tours', 'Pilgrimage Tours', 'Honeymoon Packages',
  'Family Holidays', 'Hill Station Tours', 'Educational Tours', 'Medical Tourism',
  'Corporate & MICE', 'Festival & Cultural Tours', 'Cruise Holidays', 'IRCTC Rail Tours',
  'Tamil Nadu Pilgrimages', 'South India Pilgrimages', 'North India Pilgrimages', 'India-wide Pilgrimages'
];

const tourTypeCategories = {
  'Pilgrimage Tours': 'Pilgrimage Tours',
  'Honeymoon Tours': 'Honeymoon Packages',
  'Family Tours': 'Family Holidays',
  'Hill Station Tours': 'Hill Station Tours',
  'School / College Tours': 'Educational Tours',
  'Education Tours': 'Educational Tours',
  'Medical Tours': 'Medical Tourism',
  'Corporate Tours': 'Corporate & MICE',
  'MICE Tours': 'Corporate & MICE',
  'Festival Tours': 'Festival & Cultural Tours',
  'Cultural Tours': 'Festival & Cultural Tours',
  'Cruise Packages': 'Cruise Holidays',
  'IRCTC Rail Tours': 'IRCTC Rail Tours'
};

export const categoriesForPackage = pkg => [...new Set([
  pkg.packageCategory === 'International' ? 'International Tours' : 'National Tours',
  tourTypeCategories[pkg.tourType],
  ...(pkg.catalogCategories || [])
].filter(Boolean))];
