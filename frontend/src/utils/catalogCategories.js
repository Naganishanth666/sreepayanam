export const CATALOG_CATEGORIES = [
  'Honeymoon & Romance', 'Family Holidays', 'Wildlife & Nature', 'Adventure & Trekking',
  'Hill Stations & Leisure', 'Beach & Coastal', 'Luxury & Wellness', 'Corporate & MICE',
  'Budget Weekend Getaways', 'National', 'International'
];

const tourTypeCategories = {
  'Honeymoon Tours': 'Honeymoon & Romance',
  'Family Tours': 'Family Holidays',
  'Wildlife & Nature Tours': 'Wildlife & Nature',
  'Adventure & Trekking Tours': 'Adventure & Trekking',
  'Hill Station & Leisure Tours': 'Hill Stations & Leisure',
  'Beach & Coastal Tours': 'Beach & Coastal',
  'Luxury & Wellness Tours': 'Luxury & Wellness',
  'Corporate / MICE Tours': 'Corporate & MICE',
  'Budget Weekend Getaways': 'Budget Weekend Getaways',
  'National Tours': 'National',
  'International Tours': 'International'
};

export const categoriesForPackage = pkg => [...new Set([
  tourTypeCategories[pkg?.tourType],
  ...(pkg?.catalogCategories || []).filter(category => ['National', 'International'].includes(category)
    || !/national|pilgrim|festival|cultur|irctc|temple|church|mosque|relig|hajj|umrah/i.test(category))
].filter(Boolean))];

const regionTranslations = {
  'Tamil Nadu': { ta: 'தமிழ்நாடு', hi: 'तमिलनाडु' },
  'South India': { ta: 'தென்னிந்தியா', hi: 'दक्षिण भारत' },
  'North India': { ta: 'வடஇந்தியா', hi: 'उत्तर भारत' },
  'West India': { ta: 'மேற்கு இந்தியா', hi: 'पश्चिम भारत' },
  'Northeast India': { ta: 'வடகிழக்கு இந்தியா', hi: 'पूर्वोत्तर भारत' },
  Islands: { ta: 'தீவுகள்', hi: 'द्वीप समूह' },
  'India-wide': { ta: 'இந்தியா முழுவதும்', hi: 'पूरे भारत में' },
  Other: { ta: 'பிற பகுதிகள்', hi: 'अन्य क्षेत्र' }
};

export const categoryTranslations = {
  'Honeymoon & Romance': { ta: 'தேனிலவு மற்றும் காதல் பயணங்கள்', hi: 'हनीमून और रोमांटिक यात्राएँ' },
  'Family Holidays': { ta: 'குடும்பச் சுற்றுலா', hi: 'पारिवारिक छुट्टियाँ' },
  'Wildlife & Nature': { ta: 'வனவிலங்கு மற்றும் இயற்கை', hi: 'वन्यजीव और प्रकृति' },
  'Adventure & Trekking': { ta: 'சாகசம் மற்றும் மலையேற்றம்', hi: 'रोमांच और ट्रेकिंग' },
  'Hill Stations & Leisure': { ta: 'மலைவாசஸ்தலங்கள் மற்றும் ஓய்வு', hi: 'हिल स्टेशन और आरामदायक यात्राएँ' },
  'Beach & Coastal': { ta: 'கடற்கரை மற்றும் கடலோரப் பயணங்கள்', hi: 'समुद्र तट और तटीय यात्राएँ' },
  'Luxury & Wellness': { ta: 'ஆடம்பரம் மற்றும் நலவாழ்வு', hi: 'लक्ज़री और वेलनेस' },
  'Corporate & MICE': { ta: 'நிறுவன மற்றும் MICE பயணங்கள்', hi: 'कॉर्पोरेट और MICE यात्राएँ' },
  'Budget Weekend Getaways': { ta: 'குறைந்த செலவு வார இறுதிப் பயணங்கள்', hi: 'कम बजट सप्ताहांत यात्राएँ' },
  National: { ta: 'தேசிய', hi: 'राष्ट्रीय' },
  International: { ta: 'சர்வதேச', hi: 'अंतरराष्ट्रीय' }
};

export const localizeCategory = (category, language = 'en') =>
  language === 'en' ? category : categoryTranslations[category]?.[language] || category;

export const localizeTourType = (tourType, language = 'en') =>
  localizeCategory(tourTypeCategories[tourType] || String(tourType || '').replace(/ Tours?$/, ''), language);

export const localizeRegion = (region, language = 'en') =>
  language === 'en' ? region : regionTranslations[region]?.[language] || region;

export const localizePackageCategory = (category, language = 'en') => {
  if (language === 'en') return category;
  const labels = {
    ta: { All: 'அனைத்தும்', Domestic: 'உள்நாட்டு', International: 'சர்வதேச' },
    hi: { All: 'सभी', Domestic: 'घरेलू', International: 'अंतरराष्ट्रीय' }
  };
  return labels[language]?.[category] || category;
};

export const formatPackageDuration = (days, nights, language = 'en') => {
  const dayCount = Number(days) || 0;
  const nightCount = Number(nights) || 0;
  if (language === 'ta') return `${dayCount} நாள் / ${nightCount} இரவு`;
  if (language === 'hi') return `${dayCount} दिन / ${nightCount} रात`;
  return `${dayCount}D / ${nightCount}N`;
};

export const formatTourCount = (count, language = 'en') => {
  if (language === 'ta') return `${count} சுற்றுலாத் தொகுப்புகள்`;
  if (language === 'hi') return `${count} यात्रा पैकेज`;
  return `${count} tours`;
};

export const formatHotelCategory = (category, language = 'en') => {
  const stars = String(category || '').match(/\d+/)?.[0];
  if (!stars || language === 'en') return category;
  if (language === 'ta') return `${stars} நட்சத்திரம்`;
  return `${stars} सितारा`;
};

export const languageLabels = { en: 'English', ta: 'தமிழ்', hi: 'हिंदी' };

export const getPackageContent = (pkg, language = 'en') => ({
  ...pkg,
  ...(pkg?.translations?.en || {}),
  ...(pkg?.translations?.[language] || {})
});

export const packagesPageCopy = {
  en: {
    languageLabel: 'Package language', eyebrow: 'Wanderlust awaits', title: 'Explore tour packages',
    subtitle: 'Explore routes and request a current quotation tailored to your dates and travellers.',
    browseStyles: 'Browse by travel style', browseStylesNote: 'Choose a published route and ask our team for a quote tailored to your dates.',
    filters: 'Filters', clearAll: 'Clear all', searchTour: 'Search tour', searchPlaceholder: 'Destination or title...',
    travelDays: 'Travel days', anyLength: 'Any length', startingLocation: 'Starting location', startPlaceholder: 'e.g. Chennai',
    endingLocation: 'Ending location', endPlaceholder: 'e.g. Madurai', hotelCategory: 'Hotel category', anyCategory: 'Any category',
    routeRegion: 'Route region', anyRegion: 'Any region', packageCategory: 'Package category', all: 'All',
    domestic: 'Domestic', international: 'International', tourType: 'Tour type', allTourTypes: 'All tour types',
    showing: 'Showing {count} packages', sortBy: 'Sort by', recommended: 'Recommended', shortest: 'Duration: shortest',
    longest: 'Duration: longest', loadError: 'Tour packages could not be loaded. Please refresh and try again.',
    noMatches: 'No matching packages found', noMatchesNote: 'No package matches these filters. Try changing your search or clearing a filter.',
    resetFilters: 'Reset all filters', previous: 'Previous', next: 'Next', page: 'Page {page} of {total}',
    photo: 'Photo',
    requestPrice: 'Request for price', priceNote: 'Price confirmed after your enquiry', openPackage: 'Open package details for {title}',
    stars: { 3: '3-star', 4: '4-star', 5: '5-star' }
  },
  ta: {
    languageLabel: 'தொகுப்பு மொழி', eyebrow: 'பயண அனுபவங்கள் காத்திருக்கின்றன', title: 'சுற்றுலாத் தொகுப்புகளைப் பாருங்கள்',
    subtitle: 'உங்கள் பயணத் தேதிகளுக்கும் பயணிகளுக்கும் ஏற்ற விலைப்பட்டியலைக் கோருங்கள்.',
    browseStyles: 'பயண விருப்பப்படி பாருங்கள்', browseStylesNote: 'ஒரு பயணத் திட்டத்தைத் தேர்ந்தெடுத்து, உங்கள் தேதிகளுக்கான விலைப்பட்டியலைக் கேளுங்கள்.',
    filters: 'வடிகட்டிகள்', clearAll: 'அனைத்தையும் அழிக்கவும்', searchTour: 'சுற்றுலாவைத் தேடுங்கள்', searchPlaceholder: 'இடம் அல்லது தலைப்பு...',
    travelDays: 'பயண நாட்கள்', anyLength: 'எந்த கால அளவும்', startingLocation: 'தொடங்கும் இடம்', startPlaceholder: 'எ.கா., சென்னை',
    endingLocation: 'முடியும் இடம்', endPlaceholder: 'எ.கா., மதுரை', hotelCategory: 'ஹோட்டல் வகை', anyCategory: 'எந்த வகையும்',
    routeRegion: 'பயணப் பகுதி', anyRegion: 'எந்தப் பகுதியும்', packageCategory: 'தொகுப்பு வகை', all: 'அனைத்தும்',
    domestic: 'உள்நாட்டு', international: 'சர்வதேச', tourType: 'சுற்றுலா வகை', allTourTypes: 'அனைத்து சுற்றுலா வகைகளும்',
    showing: '{count} சுற்றுலாத் தொகுப்புகள் காட்டப்படுகின்றன', sortBy: 'வரிசைப்படுத்து', recommended: 'பரிந்துரைக்கப்பட்டவை',
    shortest: 'கால அளவு: குறைவானது முதலில்', longest: 'கால அளவு: அதிகமானது முதலில்',
    loadError: 'சுற்றுலாத் தொகுப்புகளை ஏற்ற முடியவில்லை. பக்கத்தைப் புதுப்பித்து மீண்டும் முயற்சிக்கவும்.',
    noMatches: 'பொருந்தும் தொகுப்புகள் எதுவும் இல்லை', noMatchesNote: 'இந்த வடிகட்டிகளுக்கு ஏற்ற தொகுப்பு இல்லை. தேடலை மாற்றவும் அல்லது வடிகட்டிகளை அழிக்கவும்.',
    resetFilters: 'அனைத்து வடிகட்டிகளையும் அழிக்கவும்', previous: 'முந்தையது', next: 'அடுத்து', page: 'பக்கம் {page} / {total}',
    photo: 'புகைப்படம்',
    requestPrice: 'விலைப்பட்டியல் கோருங்கள்', priceNote: 'விசாரித்த பிறகு விலை உறுதிப்படுத்தப்படும்', openPackage: '{title} தொகுப்பு விவரங்களைத் திறக்கவும்',
    stars: { 3: '3 நட்சத்திரம்', 4: '4 நட்சத்திரம்', 5: '5 நட்சத்திரம்' }
  },
  hi: {
    languageLabel: 'पैकेज की भाषा', eyebrow: 'यात्रा के नए अनुभव आपका इंतज़ार कर रहे हैं', title: 'यात्रा पैकेज देखें',
    subtitle: 'अपनी तारीखों और यात्रियों के अनुसार वर्तमान कोटेशन माँगें।',
    browseStyles: 'यात्रा की पसंद के अनुसार देखें', browseStylesNote: 'यात्रा योजना चुनें और अपनी तारीखों के लिए कोटेशन माँगें।',
    filters: 'फ़िल्टर', clearAll: 'सभी हटाएँ', searchTour: 'यात्रा खोजें', searchPlaceholder: 'गंतव्य या शीर्षक...',
    travelDays: 'यात्रा के दिन', anyLength: 'कोई भी अवधि', startingLocation: 'शुरुआती स्थान', startPlaceholder: 'जैसे, चेन्नई',
    endingLocation: 'अंतिम स्थान', endPlaceholder: 'जैसे, मदुरै', hotelCategory: 'होटल श्रेणी', anyCategory: 'कोई भी श्रेणी',
    routeRegion: 'यात्रा क्षेत्र', anyRegion: 'कोई भी क्षेत्र', packageCategory: 'पैकेज श्रेणी', all: 'सभी',
    domestic: 'घरेलू', international: 'अंतरराष्ट्रीय', tourType: 'यात्रा का प्रकार', allTourTypes: 'सभी प्रकार की यात्राएँ',
    showing: '{count} पैकेज दिखाए जा रहे हैं', sortBy: 'क्रम', recommended: 'अनुशंसित',
    shortest: 'अवधि: सबसे कम पहले', longest: 'अवधि: सबसे अधिक पहले',
    loadError: 'यात्रा पैकेज लोड नहीं हो सके। पेज रीफ़्रेश करके फिर कोशिश करें।',
    noMatches: 'कोई मेल खाता पैकेज नहीं मिला', noMatchesNote: 'इन फ़िल्टरों से कोई पैकेज नहीं मिला। खोज बदलें या फ़िल्टर हटाएँ।',
    resetFilters: 'सभी फ़िल्टर हटाएँ', previous: 'पिछला', next: 'अगला', page: 'पेज {page} / {total}',
    photo: 'फ़ोटो',
    requestPrice: 'कोटेशन माँगें', priceNote: 'पूछताछ के बाद कीमत की पुष्टि होगी', openPackage: '{title} पैकेज का विवरण खोलें',
    stars: { 3: '3 सितारा', 4: '4 सितारा', 5: '5 सितारा' }
  }
};

export const packagePageCopy = {
  en: {
    languageLabel: 'Package language', loading: 'Loading package details…', notFound: 'Package not found',
    loadError: 'Package details could not be loaded. Please refresh and try again.',
    browsePackages: 'Browse packages', overview: 'Package overview', quickFacts: 'Quick facts', duration: 'Duration',
    destination: 'Destination', category: 'Category', from: 'From', to: 'To', mealPlan: 'Meal plan',
    bestTime: 'Best time to visit', weather: 'Expected weather in peak season', vehicle: 'Vehicle plan',
    booking: 'Important booking information', itinerary: 'Day-by-day itinerary',
    itineraryNote: 'Planned times and places are shown below. Venue tickets, opening hours, permits and supplier availability must be confirmed for your travel dates before booking.',
    itineraryPreparing: 'The travel desk is preparing the day-by-day plan for this package.',
    inclusions: 'Inclusions', exclusions: 'Exclusions', inclusionPending: 'Ask the travel desk to confirm inclusions before booking.',
    exclusionPending: 'Ask the travel desk to confirm exclusions before booking.', optionalAddons: 'Optional add-ons',
    references: 'Destination references', visitNote: 'Visit note', stay: 'Stay', meals: 'Meals', travel: 'Travel',
    back: 'Back', priceRequest: 'Request for price', breakfastOnly: 'Breakfast only', aboutLocation: 'About this location ↗',
    policy: 'Booking policy', terms: 'Package booking information', cancellation: 'Cancellation information',
    policyNote: 'A booking is confirmed only after the supplier and travel dates are checked and written confirmation is issued.',
    policyMissing: 'Policy details have not been added yet.', share: 'Share package', photo: 'Photo', templesIncluded: 'Temples included',
    requestDescription: 'Tell us your plans. The travel desk will check availability and send a quotation for your dates.',
    enquiryReceived: 'Enquiry received', reference: 'Reference', enquiryReceivedNote: 'The travel desk will review your request. You can also contact us using the WhatsApp links below.',
    whatsappIntro: 'Hello SreePayanam, please help me with', whatsappNumber: 'WhatsApp {number}', whatsappDraftNote: 'WhatsApp opens a message draft. Tap Send in WhatsApp to contact us.',
    form: {
      fullName: 'Full name', mobile: 'Mobile / WhatsApp', email: 'Email', travelDate: 'Travel date', flexibleDates: 'My dates are flexible',
      adults: 'Adults', children: 'Children', childAges: 'Child ages, separated by commas', rooms: 'Rooms', startingCity: 'Starting city',
      placesToInclude: 'Places you want to include', anotherPlace: 'Another place to include', preferredTier: 'Preferred hotel tier',
      pleaseSuggest: 'Please suggest', economic: 'Economic', deluxe: 'Deluxe', premium: 'Premium', mealPreference: 'Meal preference',
      vegetarian: 'Vegetarian', nonVegetarian: 'Non-vegetarian', jain: 'Jain', other: 'Other', specialRequests: 'Special requests',
      notesPlaceholder: 'Room, accessibility or visit preferences. Do not include medical or payment details.',
      contactConsent: 'I agree to be contacted by SreePayanam about this quotation request.', submit: 'Request for price', sending: 'Sending request…'
    },
    errors: {
      identity: 'Enter your name, mobile number and a valid email address.', date: 'Choose a travel date or mark your dates as flexible.',
      childAges: 'Enter one age from 0 to 17 for each child, separated by commas.', consent: 'Please agree to be contacted about this enquiry.',
      submit: 'We could not submit your enquiry. Please check your connection and try again.'
    }
  },
  ta: {
    languageLabel: 'தொகுப்பு மொழி', loading: 'தொகுப்பு விவரங்கள் ஏற்றப்படுகின்றன…', notFound: 'தொகுப்பு கிடைக்கவில்லை',
    loadError: 'தொகுப்பு விவரங்களை ஏற்ற முடியவில்லை. பக்கத்தைப் புதுப்பித்து மீண்டும் முயற்சிக்கவும்.',
    browsePackages: 'தொகுப்புகளைப் பாருங்கள்', overview: 'தொகுப்பு விவரம்', quickFacts: 'முக்கிய தகவல்கள்', duration: 'பயண நாட்கள்',
    destination: 'இடம்', category: 'பிரிவு', from: 'தொடக்கம்', to: 'முடிவு', mealPlan: 'உணவுத் திட்டம்',
    bestTime: 'சிறந்த பயணக் காலம்', weather: 'உச்ச பருவ வானிலை', vehicle: 'வாகனத் திட்டம்',
    booking: 'முக்கிய முன்பதிவு தகவல்', itinerary: 'நாள் வாரியான பயணத் திட்டம்',
    itineraryNote: 'திட்டமிட்ட நேரங்களும் இடங்களும் கீழே உள்ளன. பயணத் தேதிக்கான நுழைவுச் சீட்டுகள், திறப்பு நேரம், அனுமதிகள் மற்றும் வழங்குநர் கிடைப்பை முன்பதிவுக்கு முன் உறுதிப்படுத்த வேண்டும்.',
    itineraryPreparing: 'இந்தத் தொகுப்புக்கான நாள் வாரியான திட்டத்தைப் பயணக் குழு தயாரித்து வருகிறது.',
    inclusions: 'சேர்க்கப்பட்டவை', exclusions: 'சேர்க்கப்படாதவை', inclusionPending: 'முன்பதிவுக்கு முன் சேர்க்கப்பட்டவற்றைப் பயணக் குழுவிடம் உறுதிப்படுத்தவும்.',
    exclusionPending: 'முன்பதிவுக்கு முன் சேர்க்கப்படாதவற்றைப் பயணக் குழுவிடம் உறுதிப்படுத்தவும்.', optionalAddons: 'விருப்பச் சேவைகள்',
    references: 'இடம் குறித்த ஆதாரங்கள்', visitNote: 'வருகைக் குறிப்பு', stay: 'தங்குமிடம்', meals: 'உணவு', travel: 'பயணம்',
    back: 'பின்னால்', priceRequest: 'விலைப்பட்டியல் கோருங்கள்', breakfastOnly: 'காலை உணவு மட்டும்', aboutLocation: 'இந்த இடம் பற்றி ↗',
    policy: 'முன்பதிவு கொள்கை', terms: 'தொகுப்பு முன்பதிவு தகவல்', cancellation: 'ரத்து தகவல்',
    policyNote: 'வழங்குநரும் பயணத் தேதியும் சரிபார்க்கப்பட்டு எழுத்துப்பூர்வ உறுதிப்படுத்தல் வழங்கப்பட்ட பிறகே முன்பதிவு உறுதியாகும்.',
    policyMissing: 'முன்பதிவு கொள்கை விவரங்கள் இன்னும் சேர்க்கப்படவில்லை.', share: 'தொகுப்பைப் பகிரவும்', photo: 'புகைப்படம்', templesIncluded: 'சேர்க்கப்பட்ட கோயில்கள்',
    requestDescription: 'உங்கள் பயணத் திட்டத்தைத் தெரிவிக்கவும். பயணக் குழு கிடைப்பைச் சரிபார்த்து உங்கள் தேதிகளுக்கான விலைப்பட்டியலை அனுப்பும்.',
    enquiryReceived: 'விசாரணை பெறப்பட்டது', reference: 'குறிப்பு எண்', enquiryReceivedNote: 'பயணக் குழு உங்கள் கோரிக்கையைப் பரிசீலிக்கும். கீழே உள்ள WhatsApp இணைப்புகள் மூலமும் தொடர்புகொள்ளலாம்.',
    whatsappIntro: 'வணக்கம் ஸ்ரீபயணம், இந்தப் பயணத் தொகுப்பு குறித்து உதவுங்கள்:', whatsappNumber: 'WhatsApp {number}', whatsappDraftNote: 'WhatsApp-ல் செய்தி வரைவு திறக்கும். எங்களைத் தொடர்புகொள்ள அங்கே அனுப்பு என்பதைத் தட்டவும்.',
    form: {
      fullName: 'முழுப் பெயர்', mobile: 'கைபேசி / WhatsApp', email: 'மின்னஞ்சல்', travelDate: 'பயணத் தேதி', flexibleDates: 'எனது தேதிகளில் மாற்றம் இருக்கலாம்',
      adults: 'பெரியவர்கள்', children: 'குழந்தைகள்', childAges: 'குழந்தைகளின் வயது (காற்புள்ளியால் பிரிக்கவும்)', rooms: 'அறைகள்', startingCity: 'தொடங்கும் நகரம்',
      placesToInclude: 'சேர்க்க விரும்பும் இடங்கள்', anotherPlace: 'வேறு சேர்க்க வேண்டிய இடம்', preferredTier: 'விரும்பும் ஹோட்டல் வகை',
      pleaseSuggest: 'பரிந்துரைக்கவும்', economic: 'சிக்கன வகை', deluxe: 'டீலக்ஸ்', premium: 'பிரீமியம்', mealPreference: 'உணவு விருப்பம்',
      vegetarian: 'சைவம்', nonVegetarian: 'அசைவம்', jain: 'ஜைன உணவு', other: 'பிற', specialRequests: 'சிறப்புக் கோரிக்கைகள்',
      notesPlaceholder: 'அறை, அணுகல் அல்லது வருகை விருப்பங்களை எழுதுங்கள். மருத்துவ அல்லது கட்டண விவரங்களைச் சேர்க்க வேண்டாம்.',
      contactConsent: 'இந்த விலைப்பட்டியல் கோரிக்கை குறித்து ஸ்ரீபயணம் என்னைத் தொடர்புகொள்ள ஒப்புக்கொள்கிறேன்.', submit: 'விலைப்பட்டியல் கோருங்கள்', sending: 'கோரிக்கை அனுப்பப்படுகிறது…'
    },
    errors: {
      identity: 'உங்கள் பெயர், கைபேசி எண் மற்றும் சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.', date: 'பயணத் தேதியைத் தேர்ந்தெடுக்கவும் அல்லது தேதிகளில் மாற்றம் இருக்கலாம் எனக் குறிக்கவும்.',
      childAges: 'ஒவ்வொரு குழந்தைக்கும் 0 முதல் 17 வரை வயதை காற்புள்ளியால் பிரித்து உள்ளிடவும்.', consent: 'இந்த விசாரணை குறித்து தொடர்புகொள்ள ஒப்புதல் அளிக்கவும்.',
      submit: 'விசாரணையை அனுப்ப முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
    }
  },
  hi: {
    languageLabel: 'पैकेज की भाषा', loading: 'पैकेज का विवरण लोड हो रहा है…', notFound: 'पैकेज नहीं मिला',
    loadError: 'पैकेज का विवरण लोड नहीं हो सका। पेज रीफ़्रेश करके फिर कोशिश करें.',
    browsePackages: 'पैकेज देखें', overview: 'पैकेज का विवरण', quickFacts: 'मुख्य जानकारी', duration: 'यात्रा अवधि',
    destination: 'गंतव्य', category: 'श्रेणी', from: 'शुरुआत', to: 'समापन', mealPlan: 'भोजन योजना',
    bestTime: 'यात्रा का सबसे अच्छा समय', weather: 'मुख्य मौसम की संभावित स्थिति', vehicle: 'वाहन योजना',
    booking: 'बुकिंग की ज़रूरी जानकारी', itinerary: 'दिनवार यात्रा कार्यक्रम',
    itineraryNote: 'नियोजित समय और स्थान नीचे दिए गए हैं। बुकिंग से पहले यात्रा की तारीख के टिकट, खुलने का समय, परमिट और सेवा उपलब्धता की पुष्टि करनी होगी।',
    itineraryPreparing: 'इस पैकेज का दिनवार कार्यक्रम यात्रा डेस्क तैयार कर रहा है।',
    inclusions: 'शामिल सेवाएँ', exclusions: 'शामिल नहीं', inclusionPending: 'बुकिंग से पहले शामिल सेवाओं की पुष्टि यात्रा डेस्क से करें.',
    exclusionPending: 'बुकिंग से पहले शामिल न की गई सेवाओं की पुष्टि यात्रा डेस्क से करें.', optionalAddons: 'वैकल्पिक सुविधाएँ',
    references: 'गंतव्य संबंधी स्रोत', visitNote: 'भ्रमण सूचना', stay: 'ठहराव', meals: 'भोजन', travel: 'यात्रा',
    back: 'वापस', priceRequest: 'कोटेशन माँगें', breakfastOnly: 'केवल नाश्ता', aboutLocation: 'इस स्थान के बारे में ↗',
    policy: 'बुकिंग नीति', terms: 'पैकेज बुकिंग जानकारी', cancellation: 'रद्दीकरण जानकारी',
    policyNote: 'आपूर्तिकर्ता और यात्रा तारीखों की जाँच तथा लिखित पुष्टि के बाद ही बुकिंग पक्की होगी।',
    policyMissing: 'बुकिंग नीति का विवरण अभी उपलब्ध नहीं है.', share: 'पैकेज साझा करें', photo: 'फ़ोटो', templesIncluded: 'शामिल मंदिर',
    requestDescription: 'अपनी यात्रा की जानकारी दें। यात्रा डेस्क उपलब्धता जाँचकर आपकी तारीखों के लिए कोटेशन भेजेगा।',
    enquiryReceived: 'पूछताछ प्राप्त हुई', reference: 'संदर्भ संख्या', enquiryReceivedNote: 'यात्रा डेस्क आपके अनुरोध की समीक्षा करेगा। नीचे दिए WhatsApp लिंक से भी संपर्क कर सकते हैं।',
    whatsappIntro: 'नमस्ते SreePayanam, कृपया इस यात्रा पैकेज में मेरी मदद करें:', whatsappNumber: 'WhatsApp {number}', whatsappDraftNote: 'WhatsApp में संदेश का ड्राफ़्ट खुलेगा। संपर्क करने के लिए वहाँ भेजें पर टैप करें।',
    form: {
      fullName: 'पूरा नाम', mobile: 'मोबाइल / WhatsApp', email: 'ईमेल', travelDate: 'यात्रा की तारीख', flexibleDates: 'मेरी तारीखों में बदलाव संभव है',
      adults: 'वयस्क', children: 'बच्चे', childAges: 'बच्चों की उम्र (कॉमा से अलग करें)', rooms: 'कमरे', startingCity: 'शुरुआती शहर',
      placesToInclude: 'वे स्थान जिन्हें आप शामिल करना चाहते हैं', anotherPlace: 'शामिल करने के लिए एक और स्थान', preferredTier: 'पसंदीदा होटल श्रेणी',
      pleaseSuggest: 'कृपया सुझाव दें', economic: 'किफ़ायती', deluxe: 'डीलक्स', premium: 'प्रीमियम', mealPreference: 'भोजन की पसंद',
      vegetarian: 'शाकाहारी', nonVegetarian: 'मांसाहारी', jain: 'जैन भोजन', other: 'अन्य', specialRequests: 'विशेष अनुरोध',
      notesPlaceholder: 'कमरे, सुलभता या भ्रमण संबंधी पसंद लिखें। चिकित्सा या भुगतान विवरण न दें।',
      contactConsent: 'मैं इस कोटेशन अनुरोध के बारे में SreePayanam से संपर्क पाने के लिए सहमत हूँ।', submit: 'कोटेशन माँगें', sending: 'अनुरोध भेजा जा रहा है…'
    },
    errors: {
      identity: 'अपना नाम, मोबाइल नंबर और मान्य ईमेल पता दर्ज करें.', date: 'यात्रा की तारीख चुनें या तारीखों में बदलाव संभव है, यह चुनें.',
      childAges: 'हर बच्चे की 0 से 17 वर्ष की उम्र कॉमा से अलग करके दर्ज करें.', consent: 'इस पूछताछ के बारे में संपर्क की सहमति दें.',
      submit: 'आपकी पूछताछ भेजी नहीं जा सकी। इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें.'
    }
  }
};
