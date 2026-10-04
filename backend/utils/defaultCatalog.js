const variants = [
  { label: 'Essentials', days: 3, pace: 'A compact route outline with time for the main stops and a clear arrival and departure day.' },
  { label: 'Classic Journey', days: 4, pace: 'A balanced route outline with room for local discovery and comfortable breaks.' },
  { label: 'Unhurried Escape', days: 5, pace: 'A slower route outline with extra time at the main bases and fewer rushed transitions.' },
  { label: 'In-Depth Discovery', days: 6, pace: 'A longer route outline with additional flexible time for interests chosen by the traveller.' },
  { label: 'Extended Journey', days: 7, pace: 'An extended route outline with a relaxed pace and optional time for nearby experiences.' }
];

const categories = [
  {
    name: 'National Tours', code: 'NT', tourType: 'Weekend Tours', image: 'national.webp',
    routes: [
      ['Coromandel Coast', ['Chennai', 'Mahabalipuram', 'Pondicherry']],
      ['Pandya Coast & Cape', ['Madurai', 'Rameswaram', 'Kanyakumari']],
      ['Chola Heritage Loop', ['Tiruchirappalli', 'Thanjavur', 'Kumbakonam']],
      ['Nilgiri Rail Country', ['Coimbatore', 'Ooty', 'Coonoor']],
      ['Kerala Hills & Backwaters', ['Kochi', 'Munnar', 'Alappuzha']],
      ['Mysuru & Kodagu', ['Bengaluru', 'Mysuru', 'Coorg']],
      ['Deccan Forts & Ruins', ['Hyderabad', 'Hampi', 'Badami']],
      ['Konkan Shoreline', ['Goa', 'Gokarna', 'Karwar']],
      ['Western Ghats Getaway', ['Mumbai', 'Pune', 'Mahabaleshwar']],
      ['Golden Triangle', ['Delhi', 'Agra', 'Jaipur']],
      ['Rajasthan Cities', ['Jaipur', 'Jodhpur', 'Udaipur']],
      ['Awadh & Sacred Ganges', ['Lucknow', 'Ayodhya', 'Varanasi']]
    ]
  },
  {
    name: 'International Tours', code: 'IT', tourType: 'Group Tours', defaultInternational: true, image: 'international.webp',
    routes: [
      ['Lion City & Sentosa', ['Singapore', 'Sentosa', 'Singapore']],
      ['Malaysia Peninsula & Islands', ['Kuala Lumpur', 'Penang', 'Langkawi']],
      ['Central Thailand', ['Bangkok', 'Ayutthaya', 'Pattaya']],
      ['Sri Lanka Hill & Coast', ['Colombo', 'Kandy', 'Galle']],
      ['Nepal Valley & Lakes', ['Kathmandu', 'Pokhara', 'Kathmandu']],
      ['Bhutan Valley Circuit', ['Paro', 'Thimphu', 'Punakha']],
      ['Emirates City Pair', ['Dubai', 'Abu Dhabi', 'Dubai']],
      ['Bali Island Discovery', ['Denpasar', 'Ubud', 'Nusa Dua']],
      ['Northern Vietnam', ['Hanoi', 'Ninh Binh', 'Ha Long']],
      ['Japan City Rail Route', ['Tokyo', 'Kyoto', 'Osaka']],
      ['Italian Heritage Cities', ['Rome', 'Florence', 'Venice']],
      ['Paris & Alpine Lakes', ['Paris', 'Lucerne', 'Interlaken']]
    ]
  },
  {
    name: 'Pilgrimage Tours', code: 'PT', tourType: 'Pilgrimage Tours', image: 'pilgrimage.webp',
    routes: [
      ['Tamil Sacred Coast', ['Madurai', 'Rameswaram', 'Kanyakumari']],
      ['Tirupati & Kanchipuram', ['Tirupati', 'Kanchipuram', 'Vellore']],
      ['Arunachala & Chola Shrines', ['Chennai', 'Tiruvannamalai', 'Chidambaram']],
      ['Kashi & Ramayana Circuit', ['Varanasi', 'Prayagraj', 'Ayodhya']],
      ['Ganga Foothills', ['Haridwar', 'Rishikesh', 'Dehradun']],
      ['Jagannath Coast', ['Puri', 'Bhubaneswar', 'Konark']],
      ['Western India Sacred Cities', ['Dwarka', 'Somnath', 'Ahmedabad']],
      ['Nashik & Trimbakeshwar', ['Shirdi', 'Nashik', 'Trimbakeshwar']],
      ['Jyotirlinga & Narmada Route', ['Ujjain', 'Omkareshwar', 'Indore']],
      ['Buddhist Heritage Route', ['Bodh Gaya', 'Rajgir', 'Varanasi']],
      ['Kerala Temple Trail', ['Guruvayur', 'Thrissur', 'Kochi']],
      ['Sikh Heritage Cities', ['Amritsar', 'Anandpur Sahib', 'Chandigarh']]
    ]
  },
  {
    name: 'Honeymoon Packages', code: 'HM', tourType: 'Honeymoon Tours', image: 'honeymoon.webp',
    routes: [
      ['Munnar & Cardamom Hills', ['Kochi', 'Munnar', 'Thekkady']],
      ['Kerala Coast for Two', ['Kochi', 'Varkala', 'Kovalam']],
      ['Blue Mountains Retreat', ['Ooty', 'Coonoor', 'Kotagiri']],
      ['Kodagu & Mysuru', ['Mysuru', 'Coorg', 'Kabini']],
      ['French Quarter & Shore', ['Pondicherry', 'Mahabalipuram', 'Chennai']],
      ['Konkan Quiet Coast', ['Goa', 'Gokarna', 'Karwar']],
      ['Andaman Island Stay', ['Port Blair', 'Havelock Island', 'Neil Island']],
      ['Bali Garden & Beach', ['Denpasar', 'Ubud', 'Nusa Dua'], true],
      ['Maldives Island Stay', ['Malé', 'North Malé Atoll', 'South Malé Atoll'], true],
      ['Thailand Bay Escape', ['Phuket', 'Krabi', 'Phang Nga'], true],
      ['Sikkim Mountain Views', ['Gangtok', 'Pelling', 'Ravangla']],
      ['Kashmir Valley Retreat', ['Srinagar', 'Gulmarg', 'Pahalgam']]
    ]
  },
  {
    name: 'Family Holidays', code: 'FH', tourType: 'Family Tours', image: 'family.webp',
    routes: [
      ['Kerala Backwater Family Loop', ['Kochi', 'Munnar', 'Alappuzha']],
      ['Mysuru & Coorg Family Break', ['Bengaluru', 'Mysuru', 'Coorg']],
      ['Jaipur & Agra Family Trail', ['Delhi', 'Agra', 'Jaipur']],
      ['Goa Coast Family Stay', ['Panaji', 'Old Goa', 'South Goa']],
      ['Chennai Coast Discovery', ['Chennai', 'Mahabalipuram', 'Pondicherry']],
      ['Hyderabad Heritage Days', ['Hyderabad', 'Warangal', 'Hyderabad']],
      ['Pune & Hill Country', ['Mumbai', 'Pune', 'Lonavala']],
      ['Kashmir Valley Family Route', ['Srinagar', 'Gulmarg', 'Pahalgam']],
      ['Singapore Family City Break', ['Singapore', 'Sentosa', 'Singapore'], true],
      ['Dubai Family City Pair', ['Dubai', 'Abu Dhabi', 'Dubai'], true],
      ['Sri Lanka Family Coast', ['Colombo', 'Kandy', 'Bentota'], true],
      ['Nepal Lakes & Valley', ['Kathmandu', 'Pokhara', 'Kathmandu'], true]
    ]
  },
  {
    name: 'Hill Station Tours', code: 'HS', tourType: 'Hill Station Tours', image: 'hill-station.webp',
    routes: [
      ['Nilgiri Hills', ['Ooty', 'Coonoor', 'Kotagiri']],
      ['Kodaikanal & Palani Hills', ['Dindigul', 'Kodaikanal', 'Madurai']],
      ['Munnar & Western Ghats', ['Kochi', 'Munnar', 'Thekkady']],
      ['Wayanad Highlands', ['Kozhikode', 'Kalpetta', 'Sulthan Bathery']],
      ['Coorg & Chikkamagaluru', ['Mysuru', 'Coorg', 'Chikkamagaluru']],
      ['Yercaud & Salem Hills', ['Salem', 'Yercaud', 'Salem']],
      ['Kullu Valley', ['Shimla', 'Manali', 'Kullu']],
      ['Shimla & Kufri', ['Chandigarh', 'Shimla', 'Kufri']],
      ['Darjeeling & Kalimpong', ['Bagdogra', 'Darjeeling', 'Kalimpong']],
      ['Sikkim Mountain Towns', ['Gangtok', 'Pelling', 'Ravangla']],
      ['Meghalaya Plateau', ['Guwahati', 'Shillong', 'Cherrapunji']],
      ['Arunachal Foothills', ['Guwahati', 'Bomdila', 'Tawang']]
    ]
  },
  {
    name: 'Educational Tours', code: 'ET', tourType: 'School / College Tours', image: 'educational.webp',
    routes: [
      ['Chola Architecture Study Route', ['Chennai', 'Mahabalipuram', 'Thanjavur']],
      ['Tamil Nadu Heritage & Language', ['Chennai', 'Kanchipuram', 'Madurai']],
      ['Mysuru Science & Heritage', ['Bengaluru', 'Mysuru', 'Srirangapatna']],
      ['Deccan Forts & Engineering', ['Hyderabad', 'Hampi', 'Badami']],
      ['Delhi History & Agra', ['Delhi', 'Agra', 'Fatehpur Sikri']],
      ['Kolkata Arts & Literature', ['Kolkata', 'Shantiniketan', 'Kolkata']],
      ['Kerala Ecology & Waterways', ['Kochi', 'Kumarakom', 'Alappuzha']],
      ['Bengaluru Innovation Route', ['Bengaluru', 'Mysuru', 'Bengaluru']],
      ['Mumbai Maritime & City Study', ['Mumbai', 'Elephanta Island', 'Mumbai']],
      ['Buddhist Heritage & Learning', ['Bodh Gaya', 'Rajgir', 'Nalanda']],
      ['Odisha Sculpture & Coast', ['Bhubaneswar', 'Konark', 'Puri']],
      ['Assam Biodiversity Route', ['Guwahati', 'Kaziranga', 'Jorhat']]
    ]
  },
  {
    name: 'Medical Tourism', code: 'MT', tourType: 'Medical Tours', image: 'medical.webp',
    routes: [
      ['Chennai Care-Travel Support', ['Chennai', 'Mahabalipuram', 'Chennai']],
      ['Vellore Visit & Rest Plan', ['Vellore', 'Kanchipuram', 'Chennai']],
      ['Bengaluru Stay & Transfer Plan', ['Bengaluru', 'Mysuru', 'Bengaluru']],
      ['Hyderabad Care-Travel Support', ['Hyderabad', 'Warangal', 'Hyderabad']],
      ['Kochi Rest & Local Transfer Plan', ['Kochi', 'Alappuzha', 'Kochi']],
      ['Mumbai Appointment Travel Plan', ['Mumbai', 'Navi Mumbai', 'Mumbai']],
      ['Delhi Appointment Travel Plan', ['New Delhi', 'Agra', 'New Delhi']],
      ['Ahmedabad Stay & Transfer Plan', ['Ahmedabad', 'Gandhinagar', 'Ahmedabad']],
      ['Coimbatore Rest & Transfer Plan', ['Coimbatore', 'Ooty', 'Coimbatore']],
      ['Pune Care-Travel Support', ['Pune', 'Lonavala', 'Pune']],
      ['Kolkata Stay & Transfer Plan', ['Kolkata', 'Howrah', 'Kolkata']],
      ['Jaipur Appointment Travel Plan', ['Jaipur', 'Ajmer', 'Jaipur']]
    ]
  },
  {
    name: 'Corporate & MICE', code: 'CM', tourType: 'MICE Tours', image: 'corporate.webp',
    routes: [
      ['Bengaluru Team Offsite', ['Bengaluru', 'Mysuru', 'Coorg']],
      ['Chennai Coast Meeting Break', ['Chennai', 'Mahabalipuram', 'Pondicherry']],
      ['Kochi & Kumarakom Retreat', ['Kochi', 'Kumarakom', 'Alappuzha']],
      ['Goa Conference & Coast', ['Panaji', 'North Goa', 'South Goa']],
      ['Hyderabad Convention Route', ['Hyderabad', 'Ramoji Film City', 'Hyderabad']],
      ['Mumbai & Pune Business Loop', ['Mumbai', 'Pune', 'Lonavala']],
      ['Delhi & Jaipur Delegation', ['Delhi', 'Agra', 'Jaipur']],
      ['Udaipur Leadership Retreat', ['Udaipur', 'Kumbhalgarh', 'Udaipur']],
      ['Coimbatore & Nilgiri Offsite', ['Coimbatore', 'Ooty', 'Coonoor']],
      ['Ahmedabad & Statue Circuit', ['Ahmedabad', 'Vadodara', 'Kevadia']],
      ['Singapore Meeting & City Stay', ['Singapore', 'Sentosa', 'Singapore'], true],
      ['Kuala Lumpur Business & Culture', ['Kuala Lumpur', 'Putrajaya', 'Kuala Lumpur'], true]
    ]
  },
  {
    name: 'Festival & Cultural Tours', code: 'FC', tourType: 'Cultural Tours', image: 'cultural.webp',
    routes: [
      ['Madurai Chithirai & Heritage', ['Madurai', 'Thanjavur', 'Kumbakonam']],
      ['Mysuru Dasara & Palace Quarter', ['Mysuru', 'Srirangapatna', 'Bengaluru']],
      ['Thrissur Pooram & Temple Arts', ['Thrissur', 'Guruvayur', 'Kochi']],
      ['Puri Rath Yatra & Odisha Coast', ['Puri', 'Bhubaneswar', 'Konark']],
      ['Kutch Rann Utsav & Crafts', ['Bhuj', 'White Rann of Kutch', 'Mandvi']],
      ['Hornbill & Nagaland Culture', ['Kohima', 'Kisama', 'Dimapur']],
      ['Kolkata Puja & Arts', ['Kolkata', 'Shantiniketan', 'Kolkata']],
      ['Ahmedabad Navratri & Heritage', ['Ahmedabad', 'Vadodara', 'Ahmedabad']],
      ['Chennai Margazhi & Music', ['Chennai', 'Mahabalipuram', 'Kanchipuram']],
      ['Onam Season & Kerala Traditions', ['Kochi', 'Thrissur', 'Alappuzha']],
      ['Jaipur Literature & Heritage', ['Jaipur', 'Ajmer', 'Pushkar']],
      ['Varanasi Ganga & Living Culture', ['Varanasi', 'Sarnath', 'Prayagraj']]
    ]
  },
  {
    name: 'Cruise Holidays', code: 'CH', tourType: 'Cruise Packages', defaultInternational: true, image: 'cruise.webp',
    routes: [
      ['Chennai & Bay of Bengal Coast', ['Chennai', 'Pondicherry', 'Chennai']],
      ['Mumbai & Konkan Shore', ['Mumbai', 'Goa', 'Mumbai']],
      ['Kochi & Lakshadweep Islands', ['Kochi', 'Lakshadweep', 'Kochi']],
      ['Goa & Arabian Sea', ['Mormugao', 'Mumbai', 'Mormugao']],
      ['Visakhapatnam & East Coast', ['Visakhapatnam', 'Chennai', 'Visakhapatnam']],
      ['Singapore & Malaysia Strait', ['Singapore', 'Penang', 'Port Klang'], true],
      ['Singapore & Thailand Bay', ['Singapore', 'Phuket', 'Singapore'], true],
      ['Dubai & Gulf Coast', ['Dubai', 'Muscat', 'Abu Dhabi'], true],
      ['Colombo & Sri Lanka Coast', ['Colombo', 'Galle', 'Colombo'], true],
      ['Athens & Aegean Islands', ['Athens', 'Mykonos', 'Santorini'], true],
      ['Barcelona & Western Mediterranean', ['Barcelona', 'Marseille', 'Genoa'], true],
      ['Sydney & South Pacific', ['Sydney', 'Noumea', 'Sydney'], true]
    ]
  },
  {
    name: 'IRCTC Rail Tours', code: 'RT', tourType: 'IRCTC Rail Tours', image: 'rail.webp',
    routes: [
      ['Dakshin Bharat Temples', ['Chennai', 'Tirupati', 'Madurai', 'Rameswaram']],
      ['Tamil Heritage by Rail', ['Chennai', 'Tiruchirappalli', 'Thanjavur', 'Madurai']],
      ['Varanasi & Ayodhya Rail Route', ['Lucknow', 'Ayodhya', 'Varanasi']],
      ['Puri & Gaya Rail Circuit', ['Kolkata', 'Puri', 'Gaya', 'Varanasi']],
      ['Buddhist Sites by Rail', ['Varanasi', 'Bodh Gaya', 'Rajgir', 'Kushinagar']],
      ['Western Sacred Cities by Rail', ['Mumbai', 'Nashik', 'Shirdi', 'Pune']],
      ['Rajasthan Cities by Rail', ['Delhi', 'Jaipur', 'Jodhpur', 'Udaipur']],
      ['Deccan Heritage by Rail', ['Hyderabad', 'Hampi', 'Mysuru', 'Bengaluru']],
      ['Kerala Coast by Rail', ['Chennai', 'Kochi', 'Kozhikode', 'Thiruvananthapuram']],
      ['Kashmir Valley Rail Connections', ['Jammu', 'Srinagar', 'Gulmarg', 'Jammu']],
      ['Northeast Rail & Road Circuit', ['Guwahati', 'Shillong', 'Kaziranga', 'Guwahati']],
      ['Golden Triangle Rail Route', ['Delhi', 'Agra', 'Jaipur', 'Delhi']]
    ]
  }
];

const categoryCaveat = name => {
  if (name === 'Medical Tourism') return 'Travel coordination only; this listing offers no medical advice, clinical service, provider endorsement or treatment outcome. Travellers choose and confirm their own healthcare provider.';
  if (name === 'Cruise Holidays') return 'Cruise routes are illustrative concepts. A sailing, operator, port call, visa, cabin or shore excursion is not reserved or guaranteed.';
  if (name === 'IRCTC Rail Tours') return 'Rail route concepts only. No IRCTC affiliation, train service, timetable, seat, fare or ticket is promised; verify availability with the official railway/IRCTC service.';
  if (name === 'Festival & Cultural Tours') return 'Festival dates and access can change each year. Confirm current dates, tickets, local restrictions and transport before booking.';
  if (name === 'Educational Tours') return 'Institution visits, permissions, age suitability and group capacity are not confirmed by this route outline.';
  if (name === 'Corporate & MICE') return 'Meeting venues, capacity, equipment, accessibility and event dates require separate confirmation.';
  return 'Route order, travel time, opening hours, weather and supplier availability are date-dependent and must be confirmed before booking.';
};

const buildItinerary = (route, days, categoryName) => Array.from({ length: days }, (_, index) => {
  const last = index === days - 1;
  const denominator = Math.max(days - 1, 1);
  const placeIndex = Math.min(route.places.length - 1, Math.round((index / denominator) * (route.places.length - 1)));
  const place = route.places[placeIndex];
  const title = index === 0
    ? 'Arrival and settle in at ' + place
    : last
      ? 'Departure from ' + place
      : route.name + ' · ' + place + ' day ' + (index + 1);
  let activity = index === 0
    ? 'Begin in ' + place + ' and leave time for the arrival transfer and check-in. Add local visits only after the arrival time, venue hours and access are confirmed.'
    : last
      ? 'Keep the final morning flexible in ' + place + ' and match the transfer to the traveller’s confirmed onward service.'
      : 'Use ' + place + ' as the day base for the ' + route.name + ' route. Select specific visits with the traveller and verify opening hours, access and transfer sequence for the chosen dates.';
  if (categoryName === 'Medical Tourism') activity += ' This is non-clinical travel support only; appointments and care are arranged directly with the traveller’s chosen provider.';
  if (categoryName === 'Corporate & MICE') activity += ' Meeting sessions and group activities are options to scope after venue availability and capacity are checked.';
  if (categoryName === 'Cruise Holidays') activity += ' Port calls depend on an operating sailing and can change without notice.';
  if (categoryName === 'IRCTC Rail Tours') activity += ' Train legs and connections must be checked against the official timetable; no train is included or reserved.';
  if (categoryName === 'Festival & Cultural Tours') activity += ' Confirm the current festival calendar and any entry or crowd-control arrangements.';
  return {
    day: index + 1,
    title,
    activities: activity,
    hotel: 'Stay area in ' + place + ' to be selected for the travel dates; no property is reserved.',
    mealPlan: 'Meal preferences and any dietary needs to be confirmed in the tailored quotation.',
    transport: 'Transfer mode and timing to be confirmed for the route, dates and group size.'
  };
});

const buildDefaultCatalog = () => categories.flatMap(category => category.routes.flatMap((routeEntry, routeIndex) => {
  const [routeName, routePlaces, international] = routeEntry;
  const route = { name: routeName, places: routePlaces };
  const isInternational = international === true || category.defaultInternational === true;
  return variants.map((variant, variantIndex) => {
    const sequence = routeIndex * variants.length + variantIndex + 1;
    const seedKey = 'default-v15:' + category.code + ':' + String(sequence).padStart(3, '0');
    const packageId = 'SP-STD-' + category.code + '-' + String(sequence).padStart(3, '0');
    const cityLine = route.places.join(' → ');
    return {
      catalogSeedKey: seedKey,
      packageId,
      isDefaultCatalogPackage: true,
      title: routeName + ' — ' + variant.label,
      destination: cityLine,
      packageCategory: isInternational ? 'International' : 'National',
      catalogCategories: [category.name],
      tourType: category.tourType,
      durationDays: variant.days,
      durationNights: variant.days - 1,
      startingCity: route.places[0],
      endingCity: route.places[route.places.length - 1],
      overview: variant.pace + ' This ' + category.name.toLowerCase() + ' outline follows ' + cityLine + '. It is an indicative, price-free route proposal. Confirm the specific visits, transport, stay, meal plan, dates and current supplier availability before booking. ' + categoryCaveat(category.name),
      journeyTimeNotes: 'No road or rail journey times are verified in this default route outline. Confirm the exact legs and time windows for the travel dates before booking.',
      journeyDistanceNotes: 'No route distances are verified in this default route outline. Confirm the route in an approved mapping or railway source before quotation.',
      accessibilityNotes: 'Access varies by venue and transport. Share mobility, age and assistance needs so the travel desk can check the specific route before confirming.',
      seasonConstraints: category.name === 'Festival & Cultural Tours'
        ? 'Festival dates and event access vary by year; verify with the official organizer before selecting travel dates.'
        : category.name === 'Hill Station Tours'
          ? 'Weather, road access and seasonal closures may affect hill routes; confirm conditions for the selected dates.'
          : category.name === 'Cruise Holidays'
            ? 'Sailings, port calls, visa rules and cabin inventory are controlled by the operator and change by date.'
            : category.name === 'IRCTC Rail Tours'
              ? 'Rail schedules, fares and seat availability change; verify current service information with the official railway/IRCTC channel.'
              : 'Season, venue hours and supplier operations vary by date; confirm before booking.',
      imageRightsNote: 'Reuses existing SreePayanam category artwork as a representative image; it does not claim to depict this exact route. Confirm the original source and usage rights before replacing it with package-specific imagery.',
      itinerary: buildItinerary(route, variant.days, category.name),
      inclusions: ['Indicative route outline for the cities listed.', 'Travel-desk response to a request for current options and pricing.'],
      exclusions: ['No hotel, transport, meal, ticket, cruise, train or medical service is reserved by this listing.', 'No fixed price or supplier availability is included.'],
      optionalAddons: ['Ask the travel desk to check guide support, accessibility arrangements or route extensions for your dates.'],
      destinationReferences: category.name === 'IRCTC Rail Tours'
        ? [{ name: 'Official IRCTC Tourism package information', url: 'https://www.irctctourism.com/india-vacation-packages/', sourceType: 'Official', lastChecked: '2026-10-04' }]
        : [],
      mealPlan: 'Choose meal preferences when requesting a tailored quotation.',
      termsAndConditions: 'This is an indicative route outline, not a confirmed booking. Final services, price, availability, supplier terms and cancellation conditions will be set out in a separate quotation before any payment or booking.',
      cancellationPolicy: 'No booking has been made through this listing. Any applicable cancellation terms will be shown in the supplier-backed quotation before payment.',
      imageUrl: '/catalog-images/' + category.image,
      isSpecialOffer: false,
      isActive: true,
      status: 'Published'
    };
  });
}));

module.exports = { buildDefaultCatalog, DEFAULT_CATALOG_TOTAL: categories.length * 60, DEFAULT_CATALOG_CATEGORIES: categories.map(category => category.name) };
