export const CATALOG_CATEGORIES = [
  'Honeymoon & Romance', 'Family Holidays', 'Wildlife & Nature', 'Adventure & Trekking',
  'Hill Stations & Leisure', 'Beach & Coastal', 'Luxury & Wellness', 'Corporate & MICE',
  'Budget Weekend Getaways'
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
  'Budget Weekend Getaways': 'Budget Weekend Getaways'
};

export const categoriesForPackage = pkg => [...new Set([
  tourTypeCategories[pkg.tourType],
  ...(pkg.catalogCategories || []).filter(category => !/national|pilgrim|festival|cultur|irctc|temple|church|mosque|relig|hajj|umrah/i.test(category))
].filter(Boolean))];

export const categoryTranslations = {
  'Honeymoon & Romance': { ta: 'தேனிலவு மற்றும் காதல் பயணங்கள்', hi: 'हनीमून और रोमांटिक यात्राएँ' },
  'Family Holidays': { ta: 'குடும்பச் சுற்றுலா', hi: 'पारिवारिक छुट्टियाँ' },
  'Wildlife & Nature': { ta: 'வனவிலங்கு மற்றும் இயற்கை', hi: 'वन्यजीव और प्रकृति' },
  'Adventure & Trekking': { ta: 'சாகசம் மற்றும் மலையேற்றம்', hi: 'रोमांच और ट्रेकिंग' },
  'Hill Stations & Leisure': { ta: 'மலைவாசஸ்தலங்கள் மற்றும் ஓய்வு', hi: 'हिल स्टेशन और आरामदायक यात्राएँ' },
  'Beach & Coastal': { ta: 'கடற்கரை மற்றும் கடலோரப் பயணங்கள்', hi: 'समुद्र तट और तटीय यात्राएँ' },
  'Luxury & Wellness': { ta: 'ஆடம்பரம் மற்றும் நலவாழ்வு', hi: 'लक्ज़री और वेलनेस' },
  'Corporate & MICE': { ta: 'நிறுவன மற்றும் MICE பயணங்கள்', hi: 'कॉर्पोरेट और MICE यात्राएँ' },
  'Budget Weekend Getaways': { ta: 'குறைந்த செலவு வார இறுதிப் பயணங்கள்', hi: 'कम बजट सप्ताहांत यात्राएँ' }
};

export const localizeCategory = (category, language = 'en') =>
  language === 'en' ? category : categoryTranslations[category]?.[language] || category;

export const languageLabels = { en: 'English', ta: 'தமிழ்', hi: 'हिंदी' };
export const getPackageContent = (pkg, language = 'en') => ({
  ...pkg,
  ...(pkg?.translations?.[language] || pkg?.translations?.en || {})
});

export const packagePageCopy = {
  en: {
    overview: 'Package Overview', quickFacts: 'Quick Facts', duration: 'Duration', destination: 'Destination',
    category: 'Category', from: 'From', to: 'To', mealPlan: 'Meal Plan', bestTime: 'Best Time to Visit',
    weather: 'Expected Weather in Peak Season', vehicle: 'Vehicle Plan', booking: 'Important Booking Info',
    itinerary: 'Day-by-day itinerary', itineraryNote: 'Planned clock times and places are shown below. Venue tickets, access hours, permits and supplier availability are confirmed for your travel dates before booking.',
    inclusions: 'Inclusions', exclusions: 'Exclusions', references: 'Destination references',
    visitNote: 'Visit note', stay: 'Stay', meals: 'Meals', travel: 'Travel', back: 'Back',
    priceRequest: 'Request a quotation', breakfastOnly: 'Breakfast Only', aboutLocation: 'About this location ↗',
    policy: 'Booking policy', terms: 'Package booking information', cancellation: 'Cancellation information',
    policyNote: 'A booking is confirmed only after the supplier and travel dates are checked and written confirmation is issued.'
  },
  ta: {
    overview: 'தொகுப்பு விவரம்', quickFacts: 'முக்கிய தகவல்கள்', duration: 'பயண நாட்கள்', destination: 'இடம்',
    category: 'பிரிவு', from: 'தொடக்கம்', to: 'முடிவு', mealPlan: 'உணவுத் திட்டம்', bestTime: 'சிறந்த பயண காலம்',
    weather: 'உச்ச பருவ வானிலை', vehicle: 'வாகனத் திட்டம்', booking: 'முக்கிய முன்பதிவு தகவல்',
    itinerary: 'நாள் வாரியான பயணத் திட்டம்', itineraryNote: 'திட்டமிட்ட நேரங்களும் இடங்களும் கீழே உள்ளன. பயணத் தேதிக்கான நுழைவுச் சீட்டு, திறப்பு நேரம், அனுமதி மற்றும் வழங்குநர் கிடைப்பை முன்பதிவுக்கு முன் உறுதிப்படுத்துவோம்.',
    inclusions: 'சேர்க்கப்பட்டவை', exclusions: 'சேர்க்கப்படாதவை', references: 'இடம் குறித்த ஆதாரங்கள்',
    visitNote: 'வருகைக் குறிப்பு', stay: 'தங்குமிடம்', meals: 'உணவு', travel: 'பயணம்', back: 'பின்னால்',
    priceRequest: 'விலைப்பட்டியல் கோருங்கள்', breakfastOnly: 'காலை உணவு மட்டும்', aboutLocation: 'இந்த இடம் பற்றி ↗',
    policy: 'முன்பதிவு கொள்கை', terms: 'தொகுப்பு முன்பதிவு தகவல்', cancellation: 'ரத்து தகவல்',
    policyNote: 'வழங்குநரும் பயணத் தேதியும் சரிபார்க்கப்பட்டு எழுத்துப்பூர்வ உறுதிப்படுத்தல் வழங்கப்பட்ட பிறகே முன்பதிவு உறுதியாகும்.'
  },
  hi: {
    overview: 'पैकेज का विवरण', quickFacts: 'मुख्य जानकारी', duration: 'यात्रा अवधि', destination: 'गंतव्य',
    category: 'श्रेणी', from: 'शुरुआत', to: 'समापन', mealPlan: 'भोजन योजना', bestTime: 'यात्रा का सबसे अच्छा समय',
    weather: 'मुख्य मौसम की संभावित स्थिति', vehicle: 'वाहन योजना', booking: 'बुकिंग की ज़रूरी जानकारी',
    itinerary: 'दिनवार यात्रा कार्यक्रम', itineraryNote: 'नियोजित समय और स्थान नीचे दिए गए हैं। बुकिंग से पहले यात्रा की तारीख के टिकट, खुलने का समय, परमिट और सेवा उपलब्धता की पुष्टि की जाएगी।',
    inclusions: 'शामिल सेवाएँ', exclusions: 'शामिल नहीं', references: 'गंतव्य संबंधी स्रोत',
    visitNote: 'भ्रमण सूचना', stay: 'ठहराव', meals: 'भोजन', travel: 'यात्रा', back: 'वापस',
    priceRequest: 'कोटेशन माँगें', breakfastOnly: 'केवल नाश्ता', aboutLocation: 'इस स्थान के बारे में ↗',
    policy: 'बुकिंग नीति', terms: 'पैकेज बुकिंग जानकारी', cancellation: 'रद्दीकरण जानकारी',
    policyNote: 'आपूर्तिकर्ता और यात्रा तारीखों की जाँच तथा लिखित पुष्टि के बाद ही बुकिंग पक्की होगी।'
  }
};
