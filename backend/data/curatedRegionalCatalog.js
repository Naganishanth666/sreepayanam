// Source-backed, editorial route plans. Times describe the proposed daily
// programme; supplier reservations and current venue hours still require a
// travel-date check. A DB record with the same packageId overrides a plan.
const crypto = require('crypto');
const { hubs, circuits } = require('./regionalRoutes');
const placeContext = require('./regionalPlaceContext.json');
const cityContext = require('./regionalCityContext.json');
const roadLegs = require('./regionalRoadLegs.json');
const { overrides } = require('./regionalEditorialOverrides');

const checkedAt = '2026-10-07';
const regionCode = { 'Tamil Nadu': 'TN', 'South India': 'SI', 'North India': 'NI' };
const regionCategory = { 'Tamil Nadu': 'Tamil Nadu Pilgrimages', 'South India': 'South India Pilgrimages', 'North India': 'North India Pilgrimages' };
const dayPatterns = [
  [0, 1, 1],
  [0, 1, 2, 2],
  [0, 1, 2, 3, 3],
  [0, 0, 1, 2, 3, 3]
];
const vaishnoPatterns = [
  [0, 1, 1, 2],
  [0, 1, 1, 2, 3],
  [0, 1, 1, 2, 2, 3],
  [0, 1, 1, 2, 2, 3, 3]
];
const fullDayPilgrimages = new Set(['Venkateswara Temple, Tirumala', 'Vaishno Devi Temple']);
// These pages resolved to a different destination or to a site far from the
// route hub. Do not publish their briefs or photographs in an itinerary.
const mismatchedPages = new Set([
  "Tipu Sultan's Summer Palace", 'Yoga Narasimha Temple, Melukote',
  'Periyar Lake', 'Mindrolling Monastery', 'Raghunath Temple, Kullu',
  'Kala Amb', 'Virupaksha Temple, Pattadakal', "St. Mary's Church, Gulmarg",
  'Godavari River', 'Triveni Ghat, Rishikesh'
]);

const distanceKm = (from, to) => {
  if (!from || !to) return null;
  const radians = Math.PI / 180;
  const latitude = (to.lat - from.lat) * radians;
  const longitude = (to.lon - from.lon) * radians;
  const part = Math.sin(latitude / 2) ** 2 + Math.cos(from.lat * radians) * Math.cos(to.lat * radians) * Math.sin(longitude / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(part)));
};

const cleanBrief = value => {
  const plain = String(value || '').replace(/\([^)]*(?:IPA|pronounced|listen|IAST|\[)[^)]*\)/gi, '')
    .replace(/\s+/g, ' ').trim();
  const protectedText = plain.replace(/\b(St|Dr|Mr|Mrs|Prof)\./g, '$1~');
  const sentence = protectedText.match(/^.{65,260}?[.!?](?=\s|$)/)?.[0];
  const clipped = sentence || (protectedText.length > 260
    ? `${protectedText.slice(0, 257).replace(/\s+\S*$/, '')}…` : protectedText);
  return clipped.replace(/~/g, '.').trim();
};

const localStops = code => {
  const [city, ...names] = hubs[code];
  const cityCoordinates = cityContext[city]?.coordinates;
  const stops = names.filter(name => !mismatchedPages.has(name)).map(name => {
    const context = { ...(placeContext[name] || {}), ...(overrides[name] || {}) };
    if (!context?.sourceUrl || !context?.description) return null;
    if (cityCoordinates && context.coordinates && distanceKm(cityCoordinates, context.coordinates) > 80) return null;
    return { name, city, brief: cleanBrief(context.description), sourceUrl: context.sourceUrl,
      visitingInfo: context.visitingInfo || 'Recheck venue hours for your travel date.',
      imageUrl: context.imageUrl || '', imageCredit: context.imageCredit || '', imageCreditUrl: context.imageCreditUrl || '' };
  }).filter(Boolean);
  const cityData = cityContext[city];
  if (stops.length < 2 && cityData?.sourceUrl && cityData?.description) {
    stops.push({ name: `${city} heritage orientation`, city,
      brief: cleanBrief(cityData.description), sourceUrl: cityData.sourceUrl,
      visitingInfo: 'The local orientation walk is planned with the travel desk.',
      imageUrl: cityData.imageUrl || '', imageCredit: cityData.imageCredit || '', imageCreditUrl: cityData.imageCreditUrl || '' });
  }
  return stops;
};

const haversineKm = (fromCode, toCode) => {
  const from = cityContext[hubs[fromCode][0]]?.coordinates;
  const to = cityContext[hubs[toCode][0]]?.coordinates;
  return distanceKm(from, to);
};
const hillCodes = new Set(['OO', 'CUN', 'MUN', 'THE', 'MUS', 'SHI', 'KUF', 'MLI', 'KUL', 'KAT', 'PTP', 'SRI', 'GUL', 'PAH', 'DHA', 'PAM', 'DEV']);
const roadPlan = (fromCode, toCode) => {
  const road = roadLegs[`${fromCode}-${toCode}`];
  if (!road) return null;
  const hill = hillCodes.has(fromCode) || hillCodes.has(toCode);
  const allowanceMinutes = Math.ceil((road.baseDriveMinutes * (hill ? 1.55 : 1.3) + 30) / 30) * 30;
  return { ...road, allowanceMinutes };
};
const durationLabel = minutes => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours} hr` : ''}${hours && remainder ? ' ' : ''}${remainder ? `${remainder} min` : ''}`;
};

const visit = (time, stop, prefix = 'Visit') => ({ time, kind: 'visit', title: `${prefix} ${stop.name}`,
  place: stop.name, description: stop.brief, sourceUrl: stop.sourceUrl,
  imageUrl: stop.imageUrl, imageCredit: stop.imageCredit, imageCreditUrl: stop.imageCreditUrl,
  visitingInfo: stop.visitingInfo });

const entry = (time, kind, title, description, place = '') => ({ time, kind, title, description, place });

const dayFor = (pattern, index) => {
  const hubIndex = pattern[index];
  const code = dayFor.codes[hubIndex];
  const [city] = hubs[code];
  const previousCode = index ? dayFor.codes[pattern[index - 1]] : null;
  const transfer = previousCode && previousCode !== code;
  const codeOccurrence = pattern.slice(0, index + 1).filter(value => dayFor.codes[value] === code).length - 1;
  const totalAtCity = pattern.filter(value => dayFor.codes[value] === code).length;
  const isLast = index === pattern.length - 1;
  const stops = localStops(code);
  const road = transfer ? roadPlan(previousCode, code) : null;
  const previousLegKm = transfer ? haversineKm(previousCode, code) : null;
  const priorLongLeg = codeOccurrence > 0 && index > 0 && dayFor.codes[pattern[index - 1]] === code
    && index > 1 && (roadPlan(dayFor.codes[pattern[index - 2]], code)?.allowanceMinutes || 0) > 330;
  const selected = totalAtCity === 1 ? stops.slice(0, transfer ? 1 : 2)
    : [stops[(codeOccurrence - (priorLongLeg ? 1 : 0)) % stops.length]];
  // On sparse stops, a second visit to the actual named location is still a
  // concrete programme. It is described as a return, never a new attraction.
  if (!selected.length && stops.length) selected.push(stops[0]);
  if (code === 'KAT' && transfer) {
    selected[0] = { name: 'Yatra Registration Centre, Katra', city,
      brief: 'Complete or collect the Shrine Board RFID yatra access card and review the track arrangements before the dedicated shrine day.',
      sourceUrl: 'https://www.maavaishnodevi.org/causes/yatra-registration',
      visitingInfo: 'Registration details must be checked with the Shrine Board for your travel date.' };
  }
  if (code === 'TUP' && index === 0) {
    const temple = stops.find(stop => stop.name === 'Venkateswara Temple, Tirumala');
    const schedule = [
      entry('08:00', 'start', 'Meet in Tirupati', 'Begin in Tirupati after arrival; allow the whole day for Tirumala darshan.', city),
      entry('08:30', 'transfer', 'Travel uphill to Tirumala', 'Leave time for the hill road, security and the TTD reporting point.', 'Tirupati → Tirumala'),
      visit('10:00', temple, 'Report for'),
      entry('13:00', 'meal', 'Meal and queue buffer', 'Use the available meal break around the assigned TTD slot; queues can extend the visit.', 'Tirumala'),
      entry('16:30', 'transfer', 'Return to Tirupati', 'Return once darshan is complete; actual timing follows the TTD-issued slot.', 'Tirumala → Tirupati'),
      entry('19:00', 'meal', 'Dinner and overnight in Tirupati', 'Rest after the pilgrimage day.', city)
    ];
    return { day: index + 1, title: 'Tirupati: dedicated Tirumala darshan day',
      activities: schedule.map(item => `${item.time} — ${item.title}. ${item.description}`).join('\n'), schedule,
      hotel: 'Overnight base in Tirupati; hotel selected for the chosen category and date.',
      mealPlan: 'Breakfast, lunch and dinner breaks are planned; hotel breakfast is included.',
      transport: 'Private road transfer Tirupati–Tirumala–Tirupati; TTD darshan slot must be secured separately.' };
  }
  if (code === 'KAT' && !transfer && codeOccurrence > 0) {
    const shrine = stops.find(stop => stop.name === 'Vaishno Devi Temple');
    const schedule = [
      entry('05:30', 'meal', 'Early breakfast in Katra', 'Start with the required RFID yatra access card and suitable walking gear.', city),
      { ...entry('06:00', 'transfer', 'Begin the uphill yatra', 'The Shrine Board describes an approximately 13–14 km track from Katra to Bhawan. Pace, weather and permitted assistance affect the time.', 'Katra → Bhawan'), sourceUrl: 'https://www.maavaishnodevi.org/causes/travel' },
      { ...entry('10:30', 'rest', 'Rest at Ardhkuwari', 'Pause at the Shrine Board rest point and continue according to crowd and fitness conditions.', 'Ardhkuwari'), sourceUrl: 'https://www.maavaishnodevi.org/faq' },
      entry('12:30', 'meal', 'Meal break on the yatra', 'Take a flexible meal break at an available facility en route.', 'Trikuta route'),
      visit('13:30', shrine, 'Seek darshan at'),
      { ...entry('16:30', 'transfer', 'Return towards Katra', 'Begin the return when darshan is complete. Walking, board-authorized services and queue time can carry the return later into the evening.', 'Bhawan → Katra'), sourceUrl: 'https://www.maavaishnodevi.org/causes/travel' },
      entry('20:30', 'meal', 'Dinner and overnight in Katra', 'Evening timing remains flexible after the yatra.', city)
    ];
    return { day: index + 1, title: 'Katra: full-day Vaishno Devi yatra',
      activities: schedule.map(item => `${item.time} — ${item.title}. ${item.description}`).join('\n'), schedule,
      hotel: 'Overnight base in Katra; hotel selected for the chosen category and date.',
      mealPlan: 'Early breakfast and flexible lunch/dinner breaks planned; hotel breakfast is included.',
      transport: 'Pilgrimage on foot or Shrine Board-authorized assistance booked separately; no helicopter, pony or battery-car ticket is included.' };
  }
  const schedule = [];
  if (index === 0) {
    schedule.push(entry('08:00', 'start', `Meet in ${city}`, `Meet the local driver in ${city}; the first visit starts after a short orientation.`, city));
    schedule.push(visit('09:00', selected[0], 'Explore'));
    const localDistance = distanceKm(placeContext[selected[0]?.name]?.coordinates, placeContext[selected[1]?.name]?.coordinates);
    if (selected[1] && !fullDayPilgrimages.has(selected[0].name) && (!localDistance || localDistance <= 25)) schedule.push(visit('11:00', selected[1]));
    schedule.push(entry('12:30', 'meal', 'Lunch break', `Lunch in ${city}; allow time for rest before the afternoon programme.`, city));
    if (selected[1] && !fullDayPilgrimages.has(selected[0].name) && localDistance > 25) schedule.push(visit('15:30', selected[1]));
    else schedule.push(entry('16:00', 'rest', 'Unhurried local time', `Time in ${city} for a short rest or local streets near the planned stay.`, city));
  } else if (transfer) {
    const fromCity = hubs[previousCode][0];
    const directKm = previousLegKm;
    const longLeg = (road?.allowanceMinutes || 0) > 330;
    schedule.push(entry('07:00', 'meal', `Breakfast and check out in ${fromCity}`, 'Set off after breakfast with luggage.', fromCity));
    if (longLeg) {
      const departureStop = localStops(previousCode).at(-1);
      if (departureStop) schedule.push(visit('08:00', departureStop, 'Explore'));
    }
    schedule.push({ ...entry(longLeg ? '09:30' : '08:30', 'transfer', `Drive to ${city}`, road
      ? `Follow the mapped road route from ${fromCity} to ${city} (${road.roadKm} km). Allow about ${durationLabel(road.allowanceMinutes)} of driving with a planning buffer, plus the lunch stop. Live traffic can change this.`
      : `Road transfer from ${fromCity} to ${city}; ${directKm ? `straight-line separation is ${directKm} km, but ` : ''}the travel desk will verify driving time and road distance.`, `${fromCity} → ${city}`),
      ...(road?.sourceUrl ? { sourceUrl: road.sourceUrl } : {}) });
    schedule.push(entry('13:00', 'meal', 'Lunch and arrival buffer', `Lunch in or en route to ${city}. Allow a flexible arrival buffer for road conditions.`, city));
    if (!longLeg) schedule.push(visit('16:30', selected[0], 'Explore'));
    else schedule.push(entry('18:00', 'rest', `Arrive and rest in ${city}`, 'Keep the evening light after the longer road journey; the exact arrival time follows the road conditions.', city));
  } else {
    schedule.push(entry('07:30', 'meal', `Breakfast in ${city}`, `A relaxed start before sightseeing in ${city}.`, city));
    schedule.push(visit('09:00', selected[0], codeOccurrence >= stops.length ? 'Return to' : codeOccurrence ? 'Explore' : 'Visit'));
    const localDistance = distanceKm(placeContext[selected[0]?.name]?.coordinates, placeContext[selected[1]?.name]?.coordinates);
    if (selected[1] && !fullDayPilgrimages.has(selected[0].name) && (!localDistance || localDistance <= 25)) schedule.push(visit('11:00', selected[1]));
    schedule.push(entry('12:30', 'meal', 'Lunch break', `Lunch and rest in ${city}.`, city));
    if (selected[1] && !fullDayPilgrimages.has(selected[0].name) && localDistance > 25 && !isLast) schedule.push(visit('15:30', selected[1]));
    else if (!isLast) schedule.push(entry('16:00', 'rest', 'Free time near the hotel', `Take a break in ${city}; the evening remains flexible.`, city));
  }
  if (isLast) {
    schedule.push(entry(transfer ? '18:30' : '14:00', 'end', `Finish in ${city}`,
      `The route ends in ${city}. Departure connections and transfer point are arranged after enquiry.`, city));
  } else {
    schedule.push(entry(transfer && (road?.allowanceMinutes || 0) > 330 ? '20:00' : '19:00', 'meal', `Dinner and overnight in ${city}`, `Dinner break and overnight base in ${city}.`, city));
  }
  const visitNames = schedule.filter(item => item.kind === 'visit').map(item => item.place);
  return { day: index + 1, title: `${transfer ? `${hubs[previousCode][0]} to ` : ''}${city}: ${visitNames.join(' and ')}`,
    activities: schedule.map(item => `${item.time} — ${item.title}. ${item.description}`).join('\n'),
    schedule,
    hotel: isLast ? `Departure from ${city}; no final-night hotel included.` : `Overnight base in ${city}; hotel selected for the chosen category and date.`,
    mealPlan: 'Breakfast, lunch and dinner breaks are planned; included meals are listed below.',
    transport: transfer ? `Private road transfer ${hubs[previousCode][0]} to ${city}${road ? `; mapped ${road.roadKm} km, allow around ${durationLabel(road.allowanceMinutes)} driving plus stops` : ''}.`
      : `Local sightseeing in ${city} by private vehicle where needed.` };
};

const buildPackage = (region, circuit, circuitIndex, pattern, variantIndex) => {
  const [routeName, ...codes] = circuit;
  dayFor.codes = codes;
  const days = pattern.map((_, index) => dayFor(pattern, index));
  const locations = [...new Set(pattern.map(index => hubs[codes[index]][0]))];
  const references = [...new Map(days.flatMap(day => day.schedule.filter(item => item.kind === 'visit' && item.sourceUrl)
    .map(item => [item.place, { name: item.place, url: item.sourceUrl, sourceType: item.sourceUrl.includes('.gov.in') ? 'Government' : 'Third party', lastChecked: checkedAt }]))).values()];
  const firstImage = days.flatMap(day => day.schedule).find(item => item.kind === 'visit' && item.imageUrl);
  const cityImage = cityContext[locations[0]];
  const imageUrl = firstImage?.imageUrl || cityImage?.imageUrl || '';
  const credit = firstImage?.imageCredit || cityImage?.imageCredit || '';
  const creditUrl = firstImage?.imageCreditUrl || cityImage?.imageCreditUrl || '';
  const number = String(circuitIndex * 4 + variantIndex + 1).padStart(3, '0');
  const signature = crypto.createHash('sha256').update(JSON.stringify([region, routeName, pattern, locations])).digest('hex');
  const scenic = /garden|mountain|landscape|backwater|heritage and foothill|valley|Nilgiri|desert architecture|fort and lake/i.test(routeName);
  return {
    packageId: `SP-REG-${regionCode[region]}-${number}`,
    title: `${routeName} · ${pattern.length} days`, destination: locations.join(' • '),
    packageCategory: 'National', tourType: scenic ? 'Cultural Tours' : 'Pilgrimage Tours',
    catalogCategories: ['National Tours', scenic ? 'Festival & Cultural Tours' : 'Pilgrimage Tours', regionCategory[region]],
    regionScope: region, hotelCategories: ['3 Star', '4 Star', '5 Star'], routeSignature: signature,
    startingCity: locations[0], endingCity: locations.at(-1), durationDays: pattern.length,
    durationNights: pattern.length - 1, isActive: true, status: 'Published',
    overview: `A planned ${pattern.length}-day route through ${locations.join(', ')}. Every day names the visits, explains what you will see and leaves time for meals and transfers. The printed clock times are the proposed programme; venue admission and services are reconfirmed for your chosen date.`,
    itinerary: days,
    inclusions: [
      `${pattern.length - 1} hotel nights in the confirmed category and cities shown in this plan (property confirmed in the final quotation)`,
      'Private road transfers and local sightseeing shown in the day plan',
      'Daily breakfast at the hotel',
      'Route planning and travel-desk support before departure'
    ],
    exclusions: [
      'Flights, trains and transfers to the first or from the final city',
      'Lunch, dinner, drinks and personal purchases',
      'Temple special-entry tickets, monument fees, boats, guides and optional activities',
      'Travel insurance, tips and anything not listed under Inclusions'
    ],
    optionalAddons: ['Local guide and paid entry tickets', 'Lunch and dinner package'],
    destinationReferences: references,
    journeyTimeNotes: 'Clock times are an editorial programme. Mapped drive times include a planning buffer; final timings depend on live traffic, opening hours, darshan slots and the travel date.',
    journeyDistanceNotes: 'Intercity kilometre figures are OpenStreetMap/OSRM mapped road routes checked 7 October 2026. Local pickup and hotel detours are not included.',
    accessibilityNotes: 'Temple steps, uneven surfaces and hill walks vary by stop. Tell the travel desk about mobility needs before confirming.',
    seasonConstraints: 'Monsoon, heat, hill weather and festival crowds can alter access and travel time. Recheck for the selected dates.',
    mealPlan: 'Hotel breakfast included; lunch and dinner breaks planned but excluded.',
    imageUrl, imageRightsNote: credit ? `${credit}${creditUrl ? ` · ${creditUrl}` : ''}` : 'Destination image from a source-linked Wikimedia page.',
    termsAndConditions: 'This published route is a proposed daily programme, not a booking confirmation. Hotels, vehicles, admission and timing are confirmed in the final quotation after dates and group size are provided.',
    cancellationPolicy: 'The final quotation states supplier-specific cancellation and refund terms before payment.',
    contentReviewedBy: 'Editorial source audit', contentReviewedAt: checkedAt,
    uniquenessReviewedBy: 'Route signature audit', uniquenessReviewedAt: checkedAt,
    showInMenu: variantIndex === 1 && circuitIndex < 3, menuOrder: circuitIndex * 10 + variantIndex,
    createdAt: new Date(`${checkedAt}T00:00:00Z`), updatedAt: new Date(`${checkedAt}T00:00:00Z`),
    curatedRegional: true
  };
};

const packages = Object.entries(circuits).flatMap(([region, routes]) => routes.flatMap((route, circuitIndex) =>
  (route[0] === 'Jammu and Trikuta pilgrimage' ? vaishnoPatterns : dayPatterns)
    .map((pattern, variantIndex) => buildPackage(region, route, circuitIndex, pattern, variantIndex))));
const byId = new Map(packages.map(pkg => [pkg.packageId, pkg]));

module.exports = { packages, byId, regionCategory };
