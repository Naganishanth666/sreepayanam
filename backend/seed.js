const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Package = require('./models/Package');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sreepayanam';

const packages = [
  // 1. National - South India
  {
    title: "Divine South India Temple & Heritage Circuit",
    destination: "Tamil Nadu & Kerala",
    packageCategory: "National",
    tourType: "Pilgrimage Tours",
    durationDays: 6,
    durationNights: 5,
    startingCity: "Chennai",
    endingCity: "Madurai",
    overview: "Embark on a sacred journey through the historic temples of Tamil Nadu and the serene landscapes of Kerala. Experience the spiritual grandeur of Madurai Meenakshi, Rameswaram Jyotirlinga, and the peaceful coastal temple of Kanyakumari. Handcrafted for families and pilgrims seeking comfort, safety, and deep cultural immersion.",
    itinerary: [
      { day: 1, title: "Arrival in Chennai & Drive to Pondicherry", activities: "Upon arrival in Chennai, meet our tour representative and drive to Pondicherry. Check into your hotel. In the evening, visit Sri Aurobindo Ashram, Promenade Beach, and the beautiful French Quarter.", hotel: "Premium French Villa Hotel", mealPlan: "Lunch & Dinner Included", transport: "AC Sedan/SUV" },
      { day: 2, title: "Drive to Trichy & Tanjore Temple Visit", activities: "Drive to Trichy. Visit the famous Sri Ranganathaswamy Temple in Srirangam (the largest active Hindu temple complex). Later, travel to Tanjore and marvel at the magnificent Brihadeeswarar Temple (UNESCO World Heritage Site).", hotel: "Svatma Tanjore Heritage Resort", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan/SUV" },
      { day: 3, title: "Drive to Rameswaram Spiritual Sightseeing", activities: "Proceed to Rameswaram, crossing the iconic Pamban Bridge. Visit the Ramanathaswamy Temple, perform the sacred 22-wells bath (Teertham), and explore Dhanushkodi, the mystical ghost town at the edge of the ocean.", hotel: "Daiwik Rameswaram (Pilgrim Hotel)", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan/SUV" },
      { day: 4, title: "Rameswaram to Kanyakumari Transit & Sunset", activities: "Travel to Kanyakumari, the southernmost tip of India where the three oceans merge. Witness the spectacular sunset over the ocean. Visit the Kumari Amman Temple and enjoy a relaxed evening by the shore.", hotel: "Sparsa Resort Kanyakumari", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan/SUV" },
      { day: 5, title: "Vivekananda Rock Memorial & Drive to Madurai", activities: "Take a ferry to the Vivekananda Rock Memorial and Thiruvalluvar Statue. Later, drive to Madurai. Check in and visit the legendary Meenakshi Amman Temple in the evening to witness the night ceremony.", hotel: "Heritage Madurai Luxury Hotel", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan/SUV" },
      { day: 6, title: "Madurai Departure", activities: "After breakfast, check out of your hotel. Explore Thirumalai Nayakkar Palace and Alagar Kovil before transferring to Madurai Airport or Railway Station for your onward journey.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Sedan/SUV" }
    ],
    inclusions: [
      "AC Accommodation in premium hotels/resorts",
      "Daily breakfast and dinner (Vegetarian focus)",
      "Private AC Sedan/SUV for entire transit and sightseeing",
      "Pamban bridge crossing and ferry tickets in Kanyakumari",
      "Dedicated local tour coordinator support",
      "All toll taxes, parking fees, and driver allowances"
    ],
    exclusions: [
      "Flight or Train tickets to Chennai/from Madurai",
      "Temple entry fees, special darshan tickets, and guide fees",
      "Personal laundry, phone calls, and tips",
      "Any meals not specified in the meal plan"
    ],
    optionalAddons: [
      "Special VIP Darshan Passes in Madurai Meenakshi Temple (+₹1,000/Pax)",
      "Traditional South Indian Classical Music/Dance Evening in Madurai (+₹2,500/Group)"
    ],
    termsAndConditions: "Rates are based on double occupancy. Booking requires 50% advance deposit. Dynamic price scaling applies during festival seasons.",
    cancellationPolicy: "Full refund if cancelled 15 days before travel date. 50% refund between 7 to 14 days. No refund within 7 days of travel.",
    originalPrice: 28000,
    offerPrice: 24500,
    isSpecialOffer: true,
    offerValidity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days valid
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    brochureUrl: "/brochures/south_india_heritage.pdf",
    isActive: true
  },
  // 2. National - North India
  {
    title: "Golden Triangle Majestic Rajasthan Tour",
    destination: "Delhi, Agra & Jaipur",
    packageCategory: "National",
    tourType: "Family Tours",
    durationDays: 5,
    durationNights: 4,
    startingCity: "Delhi",
    endingCity: "Jaipur",
    overview: "Discover the glorious heritage of India on this timeless Golden Triangle tour. Explore historical monuments in Delhi, stand in awe of the beautiful Taj Mahal in Agra, and witness the royal fortresses and palaces of Jaipur. Ideal for families and first-time travelers seeking a luxurious and comfortable holiday.",
    itinerary: [
      { day: 1, title: "Delhi Arrival & Capital Sightseeing", activities: "Arrive in Delhi. Check into your hotel. Explore historic Old Delhi, visit Jama Masjid, Red Fort, Raj Ghat, and drive past India Gate, Rashtrapati Bhavan, and Qutub Minar.", hotel: "The Lalit New Delhi", mealPlan: "Dinner Included", transport: "AC Innova" },
      { day: 2, title: "Delhi to Agra Drive & Taj Mahal Sunset", activities: "Drive to Agra via the Yamuna Expressway. Check into your hotel. Visit the majestic Agra Fort in the afternoon, followed by a romantic sunset visit to the timeless Taj Mahal.", hotel: "DoubleTree by Hilton Agra", mealPlan: "Breakfast & Dinner Included", transport: "AC Innova" },
      { day: 3, title: "Agra to Jaipur via Fatehpur Sikri", activities: "Drive to Jaipur (the Pink City). Enroute, visit Fatehpur Sikri, the magnificent red sandstone capital of Emperor Akbar. Check into your heritage hotel in Jaipur and relax.", hotel: "Shahpura House Heritage Hotel", mealPlan: "Breakfast & Dinner Included", transport: "AC Innova" },
      { day: 4, title: "Jaipur Full-Day Royal Forts & Palaces", activities: "Enjoy a royal day. Take an elephant ride or jeep up to Amber Fort. In the afternoon, visit the City Palace, Jantar Mantar Observatory, Hawa Mahal (Palace of Winds), and shop for local gems and textiles.", hotel: "Shahpura House Heritage Hotel", mealPlan: "Breakfast & Dinner Included", transport: "AC Innova" },
      { day: 5, title: "Jaipur Departure", activities: "After breakfast, check out. Transfer to Jaipur Airport or return drive to Delhi Airport for your departure.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Innova" }
    ],
    inclusions: [
      "Luxury 4-star and heritage hotel stays",
      "Daily breakfast and dinner buffet at hotels",
      "Private AC SUV (Innova) for all transfers and tours",
      "English-speaking local guides in Delhi, Agra, and Jaipur",
      "Mineral water bottles during transit",
      "All parking, fuel, tolls, and driver allowances"
    ],
    exclusions: [
      "Monuments entry fees (approx ₹1,500 total per person)",
      "Flights or Train tickets to Delhi/from Jaipur",
      "Camera and video fees at sightseeing spots"
    ],
    optionalAddons: [
      "Taj Mahal Sunrise View Upgrade (+₹800/Pax)",
      "Traditional Rajasthani Dinner at Chokhi Dhani (+₹1,500/Pax)"
    ],
    termsAndConditions: "Valid for family groups of minimum 2 adults. Rates subject to change during October to March peak tourist window.",
    cancellationPolicy: "Free cancellation up to 10 days before departure. 50% cancellation fee within 10 days.",
    originalPrice: 32000,
    offerPrice: 27999,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    brochureUrl: "/brochures/golden_triangle.pdf",
    isActive: true
  },
  // 3. National - East & North East
  {
    title: "Mystical Darjeeling & Gangtok Mountain Escape",
    destination: "West Bengal & Sikkim",
    packageCategory: "National",
    tourType: "Hill Station Tours",
    durationDays: 6,
    durationNights: 5,
    startingCity: "Siliguri / Bagdogra",
    endingCity: "Siliguri / Bagdogra",
    overview: "Indulge in the breathtaking landscapes, lush tea gardens, and ancient monasteries of Darjeeling and Gangtok. Witness the sunrise over Mount Kanchenjunga, explore serene lakes, and enjoy pure mountain fresh air. Custom-tailored for couples and families.",
    itinerary: [
      { day: 1, title: "Bagdogra Arrival & Drive to Darjeeling", activities: "Arrive at Bagdogra Airport or NJP Railway Station. Enjoy a beautiful, winding uphill drive through tea estates to Darjeeling (6,700 ft). Check in and spend a relaxed evening exploring Mall Road.", hotel: "Windamere Heritage Hotel Darjeeling", mealPlan: "Dinner Included", transport: "AC Scorpio/Xylo" },
      { day: 2, title: "Darjeeling Tiger Hill Sunrise & Sightseeing", activities: "Wake up early (4:00 AM) to see the spectacular sunrise over Kanchenjunga from Tiger Hill. Visit Ghoom Monastery, Batasia Loop, Himalayan Mountaineering Institute, and Padmaja Naidu Himalayan Zoo.", hotel: "Windamere Heritage Hotel Darjeeling", mealPlan: "Breakfast & Dinner Included", transport: "AC Scorpio/Xylo" },
      { day: 3, title: "Darjeeling to Gangtok Transit", activities: "After breakfast, check out and drive to Gangtok (Sikkim capital - 5,500 ft) along the beautiful Teesta River. Check into your hotel. Walk around MG Marg in the evening.", hotel: "Mayfair Spa Resort & Casino Gangtok", mealPlan: "Breakfast & Dinner Included", transport: "AC Scorpio/Xylo" },
      { day: 4, title: "Tsomgo Lake & Baba Mandir Excursion", activities: "Take a full-day excursion to the high-altitude Tsomgo Lake (12,400 ft) and the sacred Baba Harbhajan Singh Mandir. Enjoy snowy heights and stunning mountain backdrops.", hotel: "Mayfair Spa Resort & Casino Gangtok", mealPlan: "Breakfast & Dinner Included", transport: "AC Scorpio/Xylo" },
      { day: 5, title: "Gangtok Local Monastery & City Tour", activities: "Visit Rumtek Monastery, Do Drul Chorten Stupa, Namgyal Institute of Tibetology, Ropeway Cable Car Ride, and the Flower Exhibition Centre.", hotel: "Mayfair Spa Resort & Casino Gangtok", mealPlan: "Breakfast & Dinner Included", transport: "AC Scorpio/Xylo" },
      { day: 6, title: "Gangtok to Bagdogra Departure Transit", activities: "After breakfast, check out and drive back down to Bagdogra Airport/NJP station for your departure flight/train.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Scorpio/Xylo" }
    ],
    inclusions: [
      "AC Accommodation in premium hill resorts",
      "Daily breakfast and dinner (buffet Style)",
      "Dedicated AC SUV (Scorpio/Xylo) for all transits",
      "Tsomgo Lake special permits and document processing",
      "Local sightseeing as detailed in the itinerary"
    ],
    exclusions: [
      "Airfare or Train tickets",
      "Nathula Pass permit upgrade (subject to availability)",
      "Personal porterage, shopping, laundry, or tips"
    ],
    optionalAddons: [
      "Nathula Pass Border Permit Upgrade (+₹3,500/Vehicle)",
      "Premium Tea Tasting Masterclass at Darjeeling Tea Estate (+₹1,200/Pax)"
    ],
    termsAndConditions: "Tsomgo Lake visits require physical voter ID/Passport and passport size photographs for Sikkim inner-line permits.",
    cancellationPolicy: "Full refund if cancelled 20 days prior. 30% refund within 20 days.",
    originalPrice: 38000,
    offerPrice: 33500,
    isSpecialOffer: false,
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    brochureUrl: "/brochures/darjeeling_gangtok.pdf",
    isActive: true
  },
  // 4. National - West India
  {
    title: "Royal Rajasthan Udaipur & Jodhpur Heritage",
    destination: "Rajasthan (Udaipur & Jodhpur)",
    packageCategory: "National",
    tourType: "Honeymoon Tours",
    durationDays: 5,
    durationNights: 4,
    startingCity: "Udaipur",
    endingCity: "Jodhpur",
    overview: "Walk through the romantic palaces and beautiful lakes of Udaipur (the Venice of the East) and the blue streets and mighty fortress of Jodhpur. Perfectly designed for newlywed couples looking for luxury, heritage, and romantic settings.",
    itinerary: [
      { day: 1, title: "Udaiveda Lake City Welcome & Sunset Boat Cruise", activities: "Arrive in Udaipur. Meet our agent and transfer to your luxury lake-view hotel. In the evening, enjoy a private romantic boat cruise on the peaceful Lake Pichola, viewing the Jag Mandir Palace.", hotel: "The Leela Palace Udaipur", mealPlan: "Dinner Included", transport: "AC Sedan" },
      { day: 2, title: "Udaipur Royal Palaces & Gardens Tour", activities: "Visit the magnificent Udaipur City Palace, Jagdish Temple, Saheliyon-ki-Bari (Garden of Maidens), and enjoy the beautiful panoramic views from Sajjangarh Monsoon Palace.", hotel: "The Leela Palace Udaipur", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan" },
      { day: 3, title: "Udaipur to Jodhpur via Ranakpur Temple", activities: "Drive to Jodhpur. Enroute, stop to admire the incredible marble carvings of the Ranakpur Jain Temple (1,444 uniquely carved pillars). Check in at Jodhpur in the evening.", hotel: "Umaid Bhawan Palace Jodhpur", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan" },
      { day: 4, title: "Jodhpur Mighty Fort & Blue City Walk", activities: "Explore the majestic Mehrangarh Fort (towering 400 ft above the city). Visit Jaswant Thada Royal Cenotaph, Umaid Bhawan Museum, and walk through the bustling clock tower spice market.", hotel: "Umaid Bhawan Palace Jodhpur", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan" },
      { day: 5, title: "Jodhpur Departure", activities: "After breakfast, check out of your hotel. Transfer to Jodhpur Airport or Railway Station for your departure.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Sedan" }
    ],
    inclusions: [
      "Ultra-luxury 5-star palace and resort stays",
      "Daily gourmet breakfast and candle-light dinner packages",
      "Private AC Sedan (Ciaz/City) for all transfers",
      "Lake Pichola private boat cruise tickets",
      "Local heritage guide fees"
    ],
    exclusions: [
      "Air or Train tickets",
      "Camera and monument entrance fees",
      "Personal items"
    ],
    optionalAddons: [
      "Private Folk Musician performance during Udaipur dinner (+₹3,000/Group)",
      "Zip-line adventure at Mehrangarh Fort Jodhpur (+₹2,000/Pax)"
    ],
    termsAndConditions: "Twin share pricing. Subject to luxury tax parameters.",
    cancellationPolicy: "Strict non-refundable bookings during peak winter holidays (Dec 15 - Jan 5). Otherwise, 50% refund up to 14 days.",
    originalPrice: 65000,
    offerPrice: 58000,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
    brochureUrl: "/brochures/rajasthan_heritage.pdf",
    isActive: true
  },
  // 5. International - Asia - Dubai & Abu Dhabi
  {
    title: "Glitz & Glamour Dubai & Abu Dhabi Holiday",
    destination: "Dubai & Abu Dhabi (UAE)",
    packageCategory: "International",
    tourType: "Family Tours",
    durationDays: 6,
    durationNights: 5,
    startingCity: "Chennai / Mumbai",
    endingCity: "Dubai",
    overview: "Experience the ultimate modern wonders, giant shopping malls, thrill-filled desert safaris, and high-tech theme parks of Dubai and Abu Dhabi. We cover flight booking, premium hotel stay, tourist visa, transfers, and travel insurance support. Perfect for family leisure.",
    itinerary: [
      { day: 1, title: "Dubai Arrival & Marina Dhow Cruise Dinner", activities: "Arrive at Dubai International Airport. Complete visa formalities, meet our coordinator, and transfer to your premium hotel. In the evening, enjoy a luxury glass Dhow Cruise in Dubai Marina with international buffet dinner.", hotel: "JW Marriott Marquis Dubai", mealPlan: "Dinner Included", transport: "AC Coach Transfer" },
      { day: 2, title: "Dubai Half-Day City Tour & Burj Khalifa 124th Floor", activities: "Explore Dubai. Visit Jumeirah Mosque, Burj Al Arab (photo stop), Palm Jumeirah, and Dubai Frame. In the afternoon, visit Dubai Mall and ascend to the 124th Floor Observation Deck of the iconic Burj Khalifa. Watch the musical Fountain Show.", hotel: "JW Marriott Marquis Dubai", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 3, title: "Desert Safari with BBQ Dinner & Belly Dancing", activities: "Enjoy a relaxed morning for shopping. In the afternoon, embark on an exciting 4x4 Desert Safari. Experience dune bashing, camel riding, sandboarding, henna painting, and a delicious Arabic BBQ Buffet with belly dancing and Tanoura shows.", hotel: "JW Marriott Marquis Dubai", mealPlan: "Breakfast & BBQ Dinner Included", transport: "4x4 Land Cruiser" },
      { day: 4, title: "Abu Dhabi City Tour & Grand Mosque Visit", activities: "Take a full-day tour of Abu Dhabi. Stand in awe of the magnificent Sheikh Zayed Grand Mosque (one of the largest in the world). Drive along the Corniche, visit Heritage Village, and stop at Yas Island (Ferrari World photo stop).", hotel: "JW Marriott Marquis Dubai", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 5, title: "Museum of the Future & Shopping", activities: "Visit the highly acclaimed Museum of the Future. Spend the afternoon shopping at the famous Gold and Spice Souks or Mall of the Emirates.", hotel: "JW Marriott Marquis Dubai", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 6, title: "Dubai Airport Departure", activities: "After breakfast, check out. Enjoy last-minute souvenir shopping before transferring to Dubai International Airport for your departure flight back home.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Coach Transfer" }
    ],
    inclusions: [
      "5 Nights accommodation in luxury 5-star hotel in Dubai",
      "Daily breakfast at the hotel, Dhow Cruise dinner, and Desert BBQ",
      "Burj Khalifa 124th Floor non-prime tickets and Museum of the Future tickets",
      "Full-day Abu Dhabi city tour with Grand Mosque entry",
      "UAE Tourist Visa and comprehensive travel insurance support",
      "Private/Coordinated airport and sightseeing transfers"
    ],
    exclusions: [
      "International flights (Can be booked separately upon request)",
      "Tourism Dirham Fee (approx AED 20 per room per night paid directly to hotel)",
      "Personal shopping and tips"
    ],
    optionalAddons: [
      "Ferrari World Abu Dhabi Theme Park ticket upgrade (+₹6,500/Pax)",
      "Burj Khalifa 148th Floor VIP Sky Lounge upgrade (+₹8,200/Pax)"
    ],
    termsAndConditions: "Passport must be valid for at least 6 months from the date of travel. Visa approval is subject to UAE immigration department.",
    cancellationPolicy: "Strict cancellation rules apply. 50% non-refundable within 30 days of travel.",
    originalPrice: 85000,
    offerPrice: 79000,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    brochureUrl: "/brochures/dubai_abu_dhabi.pdf",
    isActive: true
  },
  // 6. International - Asia - Singapore & Malaysia
  {
    title: "Singapore & Malaysia Highlights Family Holiday",
    destination: "Singapore & Kuala Lumpur",
    packageCategory: "International",
    tourType: "Group Tours",
    durationDays: 7,
    durationNights: 6,
    startingCity: "Chennai",
    endingCity: "Singapore",
    overview: "Explore two of Southeast Asia's most popular family destinations in a single, perfectly coordinated itinerary. Take in the futuristic gardens and Universal Studios in Singapore, and the historic Batu Caves and Petronas Twin Towers in Kuala Lumpur. Complete visa and flight booking assistance included.",
    itinerary: [
      { day: 1, title: "Kuala Lumpur Arrival & City Tour", activities: "Arrive in Kuala Lumpur (KLIA). Check into your hotel. In the afternoon, enjoy a city tour visiting the Petronas Twin Towers, King's Palace, National Monument, and Independence Square.", hotel: "Grand Hyatt Kuala Lumpur", mealPlan: "Dinner Included", transport: "AC Coach" },
      { day: 2, title: "Batu Caves & Genting Highlands Day Trip", activities: "Visit the famous Batu Caves with its massive gold statue. Take a scenic cable car ride up to Genting Highlands Hill Resort. Explore indoor theme parks and return to KL in the evening.", hotel: "Grand Hyatt Kuala Lumpur", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 3, title: "KL to Singapore Transit via Coach & Night Safari", activities: "Travel from KL to Singapore via luxury cross-border AC Coach. Check into your Singapore hotel. In the evening, visit the world-famous Singapore Night Safari to see nocturnal animals.", hotel: "Marina Bay Sands (1 Night Peak) / Orchard Hotel", mealPlan: "Breakfast & Dinner Included", transport: "Cross-border Coach" },
      { day: 4, title: "Singapore City Tour & Sentosa Island Fun", activities: "Explore Singapore city, Merlion Park, Chinatown, and Little India. In the afternoon, visit Sentosa Island, ride the cable car, visit Madame Tussauds, and watch the Wings of Time light show.", hotel: "Orchard Hotel Singapore", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 5, title: "Universal Studios Full-Day Thrills", activities: "Enjoy a full day of fun and excitement at Universal Studios Singapore on Sentosa Island. Ride the Battlestar Galactica, Transformers 3D, and explore movie-themed zones.", hotel: "Orchard Hotel Singapore", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 6, title: "Gardens by the Bay Flower Dome & Cloud Forest", activities: "Visit the futuristic Gardens by the Bay. Walk through the giant glass greenhouses (Flower Dome & Cloud Forest) and admire the spectacular Supertree Grove light show in the evening.", hotel: "Orchard Hotel Singapore", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 7, title: "Changi Airport Jewel & Departure", activities: "After breakfast, check out. Transfer to Changi Airport. Explore Jewel Changi (world's tallest indoor waterfall) before checking in for your flight back to India.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Coach" }
    ],
    inclusions: [
      "3 Nights stay in KL, 3 Nights stay in Singapore in premium hotels",
      "Daily breakfast at the hotel, dinner at local Indian restaurants",
      "Universal Studios, Gardens by the Bay, Night Safari, and Sentosa tickets",
      "Cross-border luxury coach ticket from KL to Singapore",
      "Singapore and Malaysia tourist visas and travel insurance",
      "Guided transfers as per itinerary"
    ],
    exclusions: [
      "International flights (Can be booked separately)",
      "Personal items, shopping, and tips"
    ],
    optionalAddons: [
      "S.E.A. Aquarium Singapore ticket upgrade (+₹2,800/Pax)",
      "Bungee jump / Giant Swing at Sentosa (+₹5,500/Pax)"
    ],
    termsAndConditions: "Requires passports to be submitted 15 days in advance for Singapore paper visa processing. Standard visa approval rules apply.",
    cancellationPolicy: "Non-refundable visa fee. 75% refund if cancelled 25 days before departure.",
    originalPrice: 95000,
    offerPrice: 88000,
    isSpecialOffer: false,
    imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    brochureUrl: "/brochures/singapore_malaysia.pdf",
    isActive: true
  },
  // 7. International - Europe - Western Europe
  {
    title: "Best of Western Europe Panoramic Tour",
    destination: "France, Switzerland & Italy",
    packageCategory: "International",
    tourType: "Luxury Tours",
    durationDays: 9,
    durationNights: 8,
    startingCity: "Paris",
    endingCity: "Rome",
    overview: "Walk through the romantic avenues of Paris, witness the snow-capped peak of Mt. Titlis in Switzerland, and marvel at the historic monuments of Rome and Venice. Includes complete Schengen visa support, luxury stays, Indian meals, and highly experienced tour coordinators.",
    itinerary: [
      { day: 1, title: "Paris Arrival & Seine River Cruise", activities: "Arrive in Paris. Transfer to your luxury hotel. In the evening, enjoy a scenic cruise down the Seine River to see the glittering Eiffel Tower.", hotel: "Pullman Paris Tour Eiffel", mealPlan: "Dinner Included", transport: "AC Private Coach" },
      { day: 2, title: "Paris City Tour & Eiffel Tower 3rd Level", activities: "Enjoy a guided tour of Paris, visiting Louvre (outside), Notre Dame, Arc de Triomphe, and Champs-Élysées. Ascend to the 3rd Level of the Eiffel Tower for panoramic city views.", hotel: "Pullman Paris Tour Eiffel", mealPlan: "Breakfast & Dinner Included", transport: "AC Private Coach" },
      { day: 3, title: "High-speed Train to Switzerland & Lake Lucerne", activities: "Board the high-speed TGV train from Paris to Geneva/Lucerne. Check into your alpine resort. Enjoy a peaceful evening boat cruise on Lake Lucerne.", hotel: "Hotel Schweizerhof Lucerne", mealPlan: "Breakfast & Dinner Included", transport: "TGV Train & Coach" },
      { day: 4, title: "Mount Titlis Rotair Cable Car & Snow Play", activities: "Take the world's first rotating cable car (Titlis Rotair) up to the snow-covered peak of Mount Titlis (10,000 ft). Walk through the glacier cave and enjoy snow tubing.", hotel: "Hotel Schweizerhof Lucerne", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 5, title: "Lucerne to Venice Scenic Drive", activities: "Enjoy a gorgeous drive through Swiss Alps and northern Italy to Venice. Check in and enjoy a quiet evening along the canals.", hotel: "Hilton Molino Stucky Venice", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 6, title: "Venice Gondola Ride & St. Mark's Square", activities: "Take a private water taxi to St. Mark's Square. Explore the historic island, visit Murano glass showrooms, and enjoy a classic romantic Venetian Gondola ride.", hotel: "Hilton Molino Stucky Venice", mealPlan: "Breakfast & Dinner Included", transport: "Water Taxi & Gondola" },
      { day: 7, title: "Venice to Rome via Florence Leaning Tower", activities: "Drive south to Florence. Visit the famous Square of Miracles in Pisa to see the Leaning Tower. Continue drive to Rome and check into your hotel.", hotel: "Rome Marriott Grand Hotel", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 8, title: "Rome & Vatican City Historic Wonders", activities: "Explore Rome. Visit the Colosseum (inside), Roman Forum, Trevi Fountain, Pantheon, and Vatican City, including St. Peter's Basilica.", hotel: "Rome Marriott Grand Hotel", mealPlan: "Breakfast & Dinner Included", transport: "AC Coach" },
      { day: 9, title: "Rome Airport Departure", activities: "After breakfast, transfer to Rome Fiumicino Airport for your flight back to India, carrying beautiful European memories.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Coach Transfer" }
    ],
    inclusions: [
      "8 Nights accommodation in premium 5-star international hotels",
      "Daily breakfast at hotels, and specially arranged Indian dinners",
      "TGV High-speed train tickets and private AC touring coach",
      "Mount Titlis, Eiffel Tower, Colosseum, and Gondola ride tickets",
      "Schengen Visa appointment and documentation support",
      "English-speaking professional tour director throughout Europe"
    ],
    exclusions: [
      "International flights from India to Paris / Rome to India",
      "Schengen Visa fee paid directly at VFS center",
      "Tips for coach driver and guides (mandatory €5 per day per person)"
    ],
    optionalAddons: [
      "Louvre Museum guided tour ticket (+₹5,200/Pax)",
      "Jungfraujoch Top of Europe Train Excursion upgrade (+₹12,500/Pax)"
    ],
    termsAndConditions: "Schengen visa requires biometric verification at VFS center. SreePayanam is not responsible for visa rejection.",
    cancellationPolicy: "Strict European hotel parameters. 50% non-refundable if cancelled within 45 days of departure.",
    originalPrice: 245000,
    offerPrice: 220000,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    brochureUrl: "/brochures/western_europe.pdf",
    isActive: true
  },
  // 8. International - Island & Honeymoon - Maldives
  {
    title: "Luxury Overwater Villa Maldives Honeymoon Escape",
    destination: "Maldives (Private Resort Island)",
    packageCategory: "International",
    tourType: "Honeymoon Tours",
    durationDays: 5,
    durationNights: 4,
    startingCity: "Male Airport",
    endingCity: "Male Airport",
    overview: "Escape with your special someone to the absolute paradise of private Maldives overwater villas. Experience endless turquoise horizons, personal decks with slide access to the lagoon, premium all-inclusive dining, and relaxing spa sessions. Curated exclusively for honeymoons.",
    itinerary: [
      { day: 1, title: "Male Arrival & Speedboat Transfer to Private Resort", activities: "Arrive at Velana International Airport in Male. Meet our resort representative and board a luxury speedboat to your private island resort. Check into your Beach Villa and enjoy a romantic sunset beach walk.", hotel: "Soneva Jani / Sun Siyam Olhuveli Maldives", mealPlan: "All-Inclusive (All Meals & Drinks)", transport: "Speedboat" },
      { day: 2, title: "Villa Upgrade & Relaxing Couple's Spa", activities: "Upgrade and check into your legendary Overwater Lagoon Villa with private pool. In the afternoon, enjoy a complimentary 60-minute relaxing Balinese couple's massage at the resort spa.", hotel: "Sun Siyam Olhuveli (Lagoon Overwater Villa)", mealPlan: "All-Inclusive (All Meals & Drinks)", transport: "Resort Buggy" },
      { day: 3, title: "Snorkeling Safari & Dolphin Cruise", activities: "Embark on a guided coral reef snorkeling safari to swim with sea turtles and colorful exotic fish. In the evening, enjoy a private sunset catamaran cruise with champagne to watch wild dolphins.", hotel: "Sun Siyam Olhuveli (Lagoon Overwater Villa)", mealPlan: "All-Inclusive (All Meals & Drinks)", transport: "Catamaran / Speedboat" },
      { day: 4, title: "Private Candle-lit Sandbank Dinner", activities: "Enjoy a relaxed day of sunbathing and swimming. In the evening, SreePayanam arranges a private, romantic candle-lit dinner for the couple on a secluded sandbank under the stars.", hotel: "Sun Siyam Olhuveli (Lagoon Overwater Villa)", mealPlan: "All-Inclusive & Sandbank Dinner", transport: "Private Boat" },
      { day: 5, title: "Resort check-out & Male Speedboat Departure", activities: "Enjoy a beautiful sunrise breakfast. Check out of your villa. Take a scenic speedboat ride back to Male Airport for your flight home.", hotel: "None", mealPlan: "Breakfast Included", transport: "Speedboat" }
    ],
    inclusions: [
      "1 Night in Luxury Beach Villa, 3 Nights in Lagoon Overwater Villa",
      "Full All-Inclusive Board (All buffet meals, selected beverages, and minibar)",
      "Roundtrip luxury speedboat transfers from Male Airport",
      "60-minute couple's spa treatment and snorkeling gear rental",
      "Secluded romantic Sandbank Candle-lit BBQ Dinner",
      "Dolphin watch catamaran cruise with champagne"
    ],
    exclusions: [
      "Flights to Male (Can be added upon request)",
      "Green Tax ($6 per person per night paid directly to resort)",
      "Scuba diving certification courses"
    ],
    optionalAddons: [
      "Scenic Floatplane/Seaplane transfer upgrade (+₹22,000/Pax)",
      "Underwater Restaurant dining experience booking (+₹18,000/Couple)"
    ],
    termsAndConditions: "Maldives offers free visa on arrival for Indian passport holders. Copy of marriage certificate within 6 months is required to claim resort honeymoon benefits.",
    cancellationPolicy: "Free cancellation up to 30 days prior. Non-refundable within 30 days during peak season.",
    originalPrice: 155000,
    offerPrice: 139999,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
    brochureUrl: "/brochures/maldives_honeymoon.pdf",
    isActive: true
  },
  // 9. Special - Pilgrimage - Kashi Ayodhya
  {
    title: "Sacred Spiritual Kashi, Prayagraj & Ayodhya Yatra",
    destination: "Varanasi, Prayagraj & Ayodhya",
    packageCategory: "National",
    tourType: "Pilgrimage Tours",
    durationDays: 5,
    durationNights: 4,
    startingCity: "Varanasi",
    endingCity: "Varanasi / Lucknow",
    overview: "A highly spiritual pilgrim yatra covering the oldest living city of Varanasi (Kashi), the holy Triveni Sangam confluence in Prayagraj, and the divine birthplace of Sri Rama in Ayodhya. Planned carefully with comfortable hotel stays, senior-citizen friendly transport, and coordinated temple darshans.",
    itinerary: [
      { day: 1, title: "Varanasi Arrival & Ganga Aarti", activities: "Arrive in Varanasi. Transfer to your hotel. In the evening, take a private boat ride on the Ganga River to witness the iconic, spectacular Ganga Aarti at Dashashwamedh Ghat.", hotel: "Taj Ganges Varanasi", mealPlan: "Dinner Included", transport: "AC Sedan" },
      { day: 2, title: "Kashi Vishwanath Darshan & Sarnath Visit", activities: "Wake up early for Kashi Vishwanath Darshan, Annapurna Temple, and Vishalakshi Temple. After breakfast, visit Sarnath, where Lord Buddha gave his first sermon. Explore Dhamek Stupa and Sarnath Museum.", hotel: "Taj Ganges Varanasi", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan" },
      { day: 3, title: "Drive to Prayagraj Triveni Sangam & Ayodhya", activities: "Drive to Prayagraj. Enjoy a private boat ride to the holy Triveni Sangam (confluence of Ganga, Yamuna, and mythical Saraswati). Visit Anand Bhavan and Hanuman Temple, then drive to Ayodhya.", hotel: "Ramayana Hotel Ayodhya", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan" },
      { day: 4, title: "Ayodhya Ram Janmabhoomi Darshan", activities: "Enjoy a spiritual day in Ayodhya. Visit the beautiful Ram Janmabhoomi Temple, Hanuman Garhi, Kanak Bhavan Palace, and perform a scenic evening Saryu River Aarti.", hotel: "Ramayana Hotel Ayodhya", mealPlan: "Breakfast & Dinner Included", transport: "AC Sedan" },
      { day: 5, title: "Lucnkow / Varanasi Departure", activities: "After breakfast, check out. Drive to Varanasi Airport or Lucknow Airport for your departure flight back home.", hotel: "None", mealPlan: "Breakfast Included", transport: "AC Sedan" }
    ],
    inclusions: [
      "Comfortable premium stays at high-quality hotels",
      "Daily vegetarian breakfast and dinner buffet",
      "Private AC Sedan for all transits",
      "Ganga river and Triveni Sangam private boat rides",
      "Coordinated temple priest assistance for rituals"
    ],
    exclusions: [
      "Air or Train tickets to Varanasi",
      "Personal offering/pooja materials cost",
      "Tipping and portage"
    ],
    optionalAddons: [
      "Special VIP Darshan booking in Kashi Vishwanath (+₹600/Pax)",
      "Pinda Daan rituals setup in Varanasi with certified priests (+₹2,500/Ritual)"
    ],
    termsAndConditions: "Ideal for senior citizens. Temple dress codes apply (Traditional Indian attire).",
    cancellationPolicy: "Full refund up to 15 days before travel. 50% refund between 7 to 14 days.",
    originalPrice: 29000,
    offerPrice: 26000,
    isSpecialOffer: false,
    imageUrl: "https://images.unsplash.com/photo-1561361041-c96924909fdf?w=800&q=80",
    brochureUrl: "/brochures/kashi_ayodhya.pdf",
    isActive: true
  },
  // 10. Special - Educational - South India
  {
    title: "South India Heritage & ISRO Educational Student Tour",
    destination: "Chennai, Bangalore & Trivandrum",
    packageCategory: "National",
    tourType: "School / College Tours",
    durationDays: 5,
    durationNights: 4,
    startingCity: "Chennai",
    endingCity: "Trivandrum",
    overview: "A student-friendly educational tour focusing on scientific learning, history, and heritage. Includes industrial museum visits, a tour of Vikram Sarabhai Space Centre (ISRO) in Trivandrum, historical structures, and top-tier student housing and security arrangements.",
    itinerary: [
      { day: 1, title: "Chennai Science Museums & Planetarium", activities: "Arrive in Chennai. Check into student-friendly housing. Visit the Birla Planetarium, Government Museum Egmore, and take a heritage walk around Mahabalipuram shore temples.", hotel: "Premium Student Guest House Chennai", mealPlan: "All Meals Included", transport: "AC Tourist Bus" },
      { day: 2, title: "Chennai to Bangalore Train & HAL Aerospace Museum", activities: "Take the morning Shatabdi Express to Bangalore. Check in. In the afternoon, visit the fascinating HAL Aerospace Museum and Vishvesvaraya Industrial & Technological Museum.", hotel: "Bangalore Student Guest House", mealPlan: "All Meals Included", transport: "Train & Bus" },
      { day: 3, title: "Bangalore Science Institute & Drive to Mysore", activities: "Visit Jawaharlal Nehru Planetarium and Visvesvaraya Museum labs. In the afternoon, drive to Mysore. Witness the lighting of Mysore Palace in the evening.", hotel: "Mysore Student Residency", mealPlan: "All Meals Included", transport: "AC Tourist Bus" },
      { day: 4, title: "Mysore Palace & Drive to Trivandrum", activities: "Explore Mysore Palace museum and Chamundi Hills. Take an overnight sleeper train or flight to Trivandrum.", hotel: "Overnight Train / Trivandrum Hotel", mealPlan: "All Meals Included", transport: "Train/Bus" },
      { day: 5, title: "Trivandrum ISRO VSSC Museum & Departure", activities: "Visit the premium Space Museum at Vikram Sarabhai Space Centre (VSSC/ISRO). Learn about rocket launches. Proceed to Trivandrum Station/Airport for departure.", hotel: "None", mealPlan: "Breakfast & Lunch Included", transport: "AC Tourist Bus" }
    ],
    inclusions: [
      "Accommodation in safe, vetted student sharing hostels/resorts",
      "All daily meals (Breakfast, Lunch, Dinner - hygienic veg focus)",
      "AC 40-seater coach for all transits",
      "VSSC ISRO Museum and Science center entry permits",
      "Complimentary teacher slots (1 per 15 students)",
      "24/7 First Aid and security guard coordination"
    ],
    exclusions: [
      "Personal expenses",
      "Train/Flight tickets to Chennai or from Trivandrum"
    ],
    optionalAddons: [
      "Special science kit/workbook for all students (+₹300/Student)",
      "Astronomy sky watching telescope night camp in Mysore (+₹800/Student)"
    ],
    termsAndConditions: "Requires official school/college letterhead approval. Minimum group size of 30 students required.",
    cancellationPolicy: "Highly flexible group cancellation rules. 80% refund up to 20 days prior.",
    originalPrice: 12000,
    offerPrice: 9999,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    brochureUrl: "/brochures/student_isro_tour.pdf",
    isActive: true
  },
  // 11. Special - Medical Tours
  {
    title: "Chennai Premier Medical Wellness & Health Transit",
    destination: "Chennai Hospital Districts",
    packageCategory: "National",
    tourType: "Medical Tours",
    durationDays: 4,
    durationNights: 3,
    startingCity: "Chennai Airport",
    endingCity: "Chennai Airport",
    overview: "Designed for patients and their families seeking medical treatment in Chennai's world-class healthcare facilities (Apollo, Fortis, Global). Includes airport pick-up, wheelchair-accessible transits, comfortable service apartments near hospitals, patient-friendly healthy food, and coordinate checkups.",
    itinerary: [
      { day: 1, title: "Airport Pickup & Hospital Check-in Guidance", activities: "Wheelchair-accessible luxury pickup from Chennai Airport. Check into your premium service apartment located within 2km of the hospital district. Representative guides you through pre-registration.", hotel: "Premium Service Apartment (Greams Road)", mealPlan: "Healthy Vegetarian Meals", transport: "Special AC Taxi" },
      { day: 2, title: "Coordinated Medical Checkup / Consultation", activities: "Private transfer to the hospital. SreePayanam representative assists with files and appointments. Rest and recover in the afternoon with custom dietary menu.", hotel: "Premium Service Apartment (Greams Road)", mealPlan: "Healthy Vegetarian Meals", transport: "Special AC Taxi" },
      { day: 3, title: "Doctor Review & Post-op Recovery / Wellness Spa", activities: "Follow-up consultation. In the afternoon, enjoy a peaceful post-op recovery assistance or alternative light ayurvedic wellness massage for the healthy attendant.", hotel: "Premium Service Apartment (Greams Road)", mealPlan: "Healthy Vegetarian Meals", transport: "Special AC Taxi" },
      { day: 4, title: "Prescription Collection & Airport Drop-off", activities: "Assist with collecting discharge/prescription medicines. Accessible transfer back to Chennai Airport for your flight back home.", hotel: "None", mealPlan: "Breakfast Included", transport: "Special AC Taxi" }
    ],
    inclusions: [
      "Wheelchair-accessible premium service apartments close to top hospitals",
      "Customized patient-friendly diet (Unsalted, diabetic, or pureed options)",
      "AC Sedan on-call for hospital transits and emergencies",
      "Dedicated wellness coordinator to manage appointments",
      "Basic travel insurance coverage"
    ],
    exclusions: [
      "Direct hospital medical billing, surgery, and medicine costs",
      "Flights or Train tickets to Chennai"
    ],
    optionalAddons: [
      "Extra room for additional family attendants (+₹3,000/Night)",
      "Ayurvedic rejuvenation body massage for attendant (+₹2,200/Session)"
    ],
    termsAndConditions: "Medical records must be shared 7 days in advance to coordinate appointments. We provide logistical support, not clinical advice.",
    cancellationPolicy: "Fully flexible. 100% refund or free date changes due to medical emergencies.",
    originalPrice: 18000,
    offerPrice: 15500,
    isSpecialOffer: false,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    brochureUrl: "/brochures/medical_wellness.pdf",
    isActive: true
  },
  // 12. Special - MICE / Corporate
  {
    title: "Goa Premium Corporate MICE & Leadership Retreat",
    destination: "South Goa Private Beach Resort",
    packageCategory: "National",
    tourType: "MICE Tours",
    durationDays: 4,
    durationNights: 3,
    startingCity: "Goa Airport",
    endingCity: "Goa Airport",
    overview: "Elevate your team's synergy with a highly professional MICE & corporate retreat in South Goa. Includes premium conference hall setups, outdoor team-building workshops on private beach, luxury stays, themed gala dinner evenings, and complete logistics support.",
    itinerary: [
      { day: 1, title: "Goa Arrival & Themed Ice-breaker Evening", activities: "Arrive at Mopa/Dabolim Goa Airport. Coordinated luxury coach pickup. Check into beachside resort. In the evening, enjoy a themed sunset beach cocktail and ice-breaker session.", hotel: "Taj Exotica Resort & Spa Goa", mealPlan: "Gala Dinner Included", transport: "Luxury AC Coach" },
      { day: 2, title: "Corporate Conference & Team Building Seminars", activities: "Full day conference in the resort ballroom. Equipped with high-tech AV, screens, and writing boards. Buffet lunch and mid-day coffee breaks. Evening team brainstorming session.", hotel: "Taj Exotica Resort & Spa Goa", mealPlan: "All Meals & Breaks Included", transport: "None (Resort)" },
      { day: 3, title: "Beach Olympics Team Games & Dinner Cruise", activities: "Morning beach dynamic games managed by corporate trainers. Afternoon at leisure. Evening luxury private catamaran charter cruise on Mandovi River with live DJ and BBQ.", hotel: "Taj Exotica Resort & Spa Goa", mealPlan: "All Meals & BBQ Cruise", transport: "Luxury AC Coach" },
      { day: 4, title: "Team Debrief & Departure", activities: "Morning final team debrief. Check out of resort. Transited back to Goa Airport for flights.", hotel: "None", mealPlan: "Breakfast & Lunch", transport: "Luxury AC Coach" }
    ],
    inclusions: [
      "3 Nights stay in luxury 5-star beachfront rooms",
      "Full board buffet meals, gala dinners, and private catamaran BBQ",
      "Conference hall booking with projector, high-speed Wi-Fi, and stationery",
      "Dedicated corporate team-building trainers and event coordinators",
      "Luxury coach transfers for entire group"
    ],
    exclusions: [
      "Flights to Goa",
      "Alcoholic beverages beyond gala dinner specifications",
      "Personal resort spa billing"
    ],
    optionalAddons: [
      "Custom branded corporate merchandise kit (+₹1,500/Student/Staff)",
      "Scuba Diving team experience at Grande Island (+₹4,500/Pax)"
    ],
    termsAndConditions: "Minimum group booking size is 20 rooms (40 Pax). Dynamic resort rates apply during summer peak.",
    cancellationPolicy: "25% cancellation fee if cancelled 30 days before, 100% cancellation within 15 days.",
    originalPrice: 45000,
    offerPrice: 39500,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    brochureUrl: "/brochures/corporate_goa_retreat.pdf",
    isActive: true
  },
  // 13. Special - Cruise Packages - Cordelia
  {
    title: "Luxury Cordelia Cruise Chennai-Sri Lanka Panoramic",
    destination: "International Waters (Chennai-Hambantota-Trincomalee)",
    packageCategory: "International",
    tourType: "Cruise Packages",
    durationDays: 5,
    durationNights: 4,
    startingCity: "Chennai Port",
    endingCity: "Chennai Port",
    overview: "Set sail on the majestic Cordelia Cruise liner from Chennai. Experience absolute luxury on the high seas, world-class dining, theatre shows, casinos, and beautiful shore excursions in Sri Lanka's Hambantota and Trincomalee ports.",
    itinerary: [
      { day: 1, title: "Embarkation at Chennai Port", activities: "Board the luxury Cordelia Cruise at Chennai Port. Check into your Ocean-view cabin. Explore the massive ship decks. Enjoy a grand sail-away party and delicious buffet dinner.", hotel: "Cordelia Cruise Liner (Oceanview Stateroom)", mealPlan: "All Shipboard Meals Included", transport: "Cruise Ship" },
      { day: 2, title: "Sea Day - Ship Entertainment & Casino", activities: "Spend a thrilling day at sea. Visit the top-deck swimming pool, gym, movie theatre, live Broadway-style shows, and try your luck at the premium casino.", hotel: "Cordelia Cruise Liner (Oceanview Stateroom)", mealPlan: "All Shipboard Meals Included", transport: "Cruise Ship" },
      { day: 3, title: "Hambantota (Sri Lanka) Shore Excursion", activities: "Dock at Hambantota Port. Take a shore excursion to explore Yala National Park safari or the beautiful pristine Sri Lankan beaches. Return to ship in the evening.", hotel: "Cordelia Cruise Liner (Oceanview Stateroom)", mealPlan: "All Shipboard Meals Included", transport: "Cruise Ship & Shore Bus" },
      { day: 4, title: "Trincomalee (Sri Lanka) Port Sightseeing", activities: "Arrive at Trincomalee. Visit the historic Koneswaram Temple perched on a cliff and relax on Nilaveli Beach. Re-embark for return sail to India.", hotel: "Cordelia Cruise Liner (Oceanview Stateroom)", mealPlan: "All Shipboard Meals Included", transport: "Cruise Ship & Shore Bus" },
      { day: 5, title: "Disembarkation at Chennai Port", activities: "Ship arrives back at Chennai Port in the morning. Complete customs clearance, collect bags, and disembark with luxurious oceanic memories.", hotel: "None", mealPlan: "Breakfast Included", transport: "Cruise Ship" }
    ],
    inclusions: [
      "4 Nights stay in premium Ocean-view stateroom cabin",
      "All meals onboard (Breakfast, Lunch, High Tea, Dinner, Midnight Buffet)",
      "Access to swimming pool, hot tub, theatre shows, live bands, and nightclub",
      "Sri Lanka visa processing assistance and travel insurance",
      "Port taxes and gratuities fees"
    ],
    exclusions: [
      "Shore excursion tours in Hambantota and Trincomalee (can be booked onboard)",
      "WiFi package, casino tokens, and premium alcoholic drinks"
    ],
    optionalAddons: [
      "Luxury Mini Suite room upgrade (+₹24,000/Cabin)",
      "Premium Indian beverage package (+₹8,500/Pax)"
    ],
    termsAndConditions: "Original Indian Passport with 6 months validity is mandatory. Boarding closes 3 hours before sail time.",
    cancellationPolicy: "Cordelia Cruise line rules apply. 100% non-refundable within 30 days of sail date.",
    originalPrice: 52000,
    offerPrice: 48000,
    isSpecialOffer: true,
    imageUrl: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80",
    brochureUrl: "/brochures/cordelia_cruise.pdf",
    isActive: true
  },
  // 14. Special - IRCTC Rail Tours
  {
    title: "Bharat Gaurav Tourist Train Pilgrim Yatra",
    destination: "North India Sacred Cities (Varanasi-Ayodhya-Haridwar)",
    packageCategory: "National",
    tourType: "Pilgrimage Tours",
    durationDays: 8,
    durationNights: 7,
    startingCity: "Chennai Central",
    endingCity: "Chennai Central",
    overview: "We assist with booking and managing custom IRCTC Bharat Gaurav Tourist Train packages. Experience a unique, hassle-free rail tour spanning India's legendary holy cities: Varanasi, Ayodhya, Haridwar, and Rishikesh. Travel comfortably in AC 3-Tier/2-Tier trains with planned hotel stays at intermediate stops.",
    itinerary: [
      { day: 1, title: "Boarding the Bharat Gaurav Train", activities: "Board the specially decorated Bharat Gaurav Tourist Train at Chennai Central. Enjoy comfortable AC train coaches, standard vegetarian meals served in pantry cars, and interactive onboard bhajans.", hotel: "Sleeper/AC Train Berth", mealPlan: "Dinner Included", transport: "Bharat Gaurav Train" },
      { day: 2, title: "Transit & Scenic Rail Travel", activities: "Scenic train travel through central India. Meet fellow pilgrims. Educational lectures on historical temples by spiritual guides.", hotel: "Sleeper/AC Train Berth", mealPlan: "All Meals Included", transport: "Bharat Gaurav Train" },
      { day: 3, title: "Arrival in Varanasi & Ganga Darshan", activities: "Train arrives in Varanasi. Transfer to hotel. Visit Kashi Vishwanath temple and perform evening prayers along the ghats.", hotel: "Varanasi Standard Pilgrim Hotel", mealPlan: "All Meals Included", transport: "Train & Local Coach" },
      { day: 4, title: "Varanasi to Ayodhya & Ram Temple", activities: "Board train to Ayodhya. Check in. Explore the glorious newly constructed Sri Ram Janmabhoomi temple and Sarayu Ghats.", hotel: "Ayodhya Pilgrim Guesthouse", mealPlan: "All Meals Included", transport: "Train & Local Coach" },
      { day: 5, title: "Ayodhya to Haridwar Rail Transit", activities: "Board train for an overnight journey to the foothills of Himalayas - Haridwar.", hotel: "Sleeper/AC Train Berth", mealPlan: "All Meals Included", transport: "Bharat Gaurav Train" },
      { day: 6, title: "Haridwar Har Ki Pauri Holy Bath", activities: "Arrive in Haridwar. Take a holy bath in the Ganga at Har Ki Pauri. Attend the majestic evening Ganga Aarti.", hotel: "Haridwar Tourist Hotel", mealPlan: "All Meals Included", transport: "Train & Local Coach" },
      { day: 7, title: "Rishikesh Ram Jhula & Board Return Train", activities: "Explore Rishikesh. Visit Lakshman Jhula, Ram Jhula, and Swarg Ashram. In the evening, board the return train to Chennai.", hotel: "Sleeper/AC Train Berth", mealPlan: "All Meals Included", transport: "Train & Local Coach" },
      { day: 8, title: "Return Arrival in Chennai", activities: "Arrive back at Chennai Central in the evening, with a pure heart and spiritual fulfillment.", hotel: "None", mealPlan: "Breakfast & Lunch", transport: "Bharat Gaurav Train" }
    ],
    inclusions: [
      "Bharat Gaurav Train booking (AC 3-Tier/2-Tier tickets)",
      "Daily pure vegetarian meals (Pantry train/Local restaurants)",
      "Comfortable hotel stays during night halts",
      "AC busses for local railway station to hotel transits",
      "Onboard security guards, insurance, and medical first-aid"
    ],
    exclusions: [
      "Ritual pooja fees and tip/dakshina",
      "Personal laundry and snacks"
    ],
    optionalAddons: [
      "Upgrade to AC 2-Tier Train Berth (+₹8,500/Berth)",
      "Private room option during intermediate hotel halts (+₹4,000/Room)"
    ],
    termsAndConditions: "Train schedules are strictly subject to IRCTC railway priority guidelines. Standard baggage limits apply.",
    cancellationPolicy: "IRCTC standard rail cancellation matrix applies. 25% non-refundable after booking confirmation.",
    originalPrice: 22000,
    offerPrice: 19500,
    isSpecialOffer: false,
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
    brochureUrl: "/brochures/irctc_rail_tour.pdf",
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    
    const count = await Package.countDocuments();
    if (count === 0 || process.env.FORCE_SEED === 'true') {
      console.log('Clearing existing packages...');
      await Package.deleteMany({});
      console.log('Inserting 14 premium packages...');
      await Package.insertMany(packages);
      console.log('Database successfully seeded with full SreePayanam package catalog!');
    } else {
      console.log(`Database already contains ${count} packages. Skipping seeding to prevent data loss. (Set FORCE_SEED=true to override).`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
