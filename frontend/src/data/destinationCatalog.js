// The curated catalog is the no-backend fallback for the planner. Published
// packages from MongoDB are merged into this list at runtime, so staff can
// extend the visible package set without a frontend release.

export const DESTINATION_CATALOG = [
  {
    id: 'tamil-nadu-temple-trail',
    name: 'Tamil Nadu Temple Trail',
    destination: 'Chennai to Kanyakumari',
    category: 'National',
    tourType: 'Pilgrimage Tours',
    durationDays: 7,
    durationNights: 6,
    description: 'A southbound route through living temples, coastal shrines and heritage cities.',
    groups: [
      {
        id: 'must-see',
        label: 'Must-see shrines & heritage',
        kind: 'recommended',
        places: [
          'Kapaleeshwarar Temple, Chennai',
          'Shore Temple, Mahabalipuram',
          'Kamakshi Amman Temple, Kanchipuram',
          'Brihadeeswarar Temple, Thanjavur',
          'Sri Ranganathaswamy Temple, Srirangam',
          'Rockfort Temple, Trichy',
          'Meenakshi Amman Temple, Madurai',
          'Ramanathaswamy Temple, Rameswaram',
          'Pamban Bridge',
          'Vivekananda Rock Memorial, Kanyakumari'
        ]
      },
      {
        id: 'nearby',
        label: 'Nearby additions',
        kind: 'nearby',
        places: [
          'San Thome Basilica, Chennai',
          'Ekambareswarar Temple, Kanchipuram',
          'Jambukeswarar Temple, Tiruvanaikaval',
          'Samayapuram Mariamman Temple',
          'Thirumalai Nayakkar Palace, Madurai',
          'Dhanushkodi',
          'Thiruvalluvar Statue, Kanyakumari'
        ]
      },
      {
        id: 'slow-travel',
        label: 'Slow-travel stops',
        kind: 'optional',
        places: [
          'Chettinad heritage villages',
          'Kallanai Grand Anicut',
          'Darasuram Airavatesvara Temple',
          'Alagar Koyil, Madurai',
          'Kothandaramaswamy Temple, Dhanushkodi'
        ]
      }
    ]
  },
  {
    id: 'navagraha-circuit',
    name: 'Navagraha & Chola Country',
    destination: 'Kumbakonam and the Cauvery Delta',
    category: 'National',
    tourType: 'Pilgrimage Tours',
    durationDays: 5,
    durationNights: 4,
    description: 'A considered circuit of the nine Navagraha temples with room for Chola-era detours.',
    groups: [
      {
        id: 'navagraha',
        label: 'The nine Navagraha temples',
        kind: 'recommended',
        places: [
          'Suryanar Kovil',
          'Thingalur Kailasanathar Temple',
          'Vaitheeswaran Koil',
          'Thiruvenkadu Swetharanyeswarar Temple',
          'Alangudi Abathsahayeswarar Temple',
          'Kanjanur Agneeswarar Temple',
          'Tirunallar Saneeswaran Temple',
          'Thirunageswaram Naganathaswamy Temple',
          'Keezhperumpallam Kailasanathar Temple'
        ]
      },
      {
        id: 'heritage',
        label: 'Heritage detours',
        kind: 'nearby',
        places: [
          'Brihadeeswarar Temple, Thanjavur',
          'Airavatesvara Temple, Darasuram',
          'Sarangapani Temple, Kumbakonam',
          'Swamimalai Murugan Temple',
          'Chidambaram Nataraja Temple',
          'Poompuhar coast'
        ]
      }
    ]
  },
  {
    id: 'chennai-mahabalipuram-pondicherry',
    name: 'Chennai, Mahabalipuram & Pondicherry',
    destination: 'Tamil Nadu and Puducherry coast',
    category: 'National',
    tourType: 'Weekend Tours',
    durationDays: 4,
    durationNights: 3,
    description: 'City energy, UNESCO stonework and a relaxed French-quarter finish.',
    groups: [
      {
        id: 'coastline',
        label: 'Signature coastline',
        kind: 'recommended',
        places: [
          'Marina Beach, Chennai',
          'Fort St. George',
          'Kapaleeshwarar Temple',
          'Shore Temple, Mahabalipuram',
          'Pancha Rathas, Mahabalipuram',
          'Pondicherry Promenade',
          'French Quarter, Pondicherry',
          'Auroville'
        ]
      },
      {
        id: 'add-ons',
        label: 'Easy add-ons',
        kind: 'nearby',
        places: [
          'San Thome Basilica',
          'DakshinaChitra heritage museum',
          'Crocodile Bank',
          'Paradise Beach, Chunnambar',
          'Pichavaram mangroves',
          'Gingee Fort'
        ]
      }
    ]
  },
  {
    id: 'madurai-rameswaram',
    name: 'Madurai & Rameswaram',
    destination: 'Madurai, Ramanathapuram and the Gulf of Mannar',
    category: 'National',
    tourType: 'Pilgrimage Tours',
    durationDays: 4,
    durationNights: 3,
    description: 'A compact spiritual route for first-time visitors and family groups.',
    groups: [
      {
        id: 'core',
        label: 'Core route',
        kind: 'recommended',
        places: [
          'Meenakshi Amman Temple, Madurai',
          'Thirumalai Nayakkar Palace',
          'Gandhi Memorial Museum, Madurai',
          'Ramanathaswamy Temple, Rameswaram',
          'Pamban Bridge',
          'Dhanushkodi'
        ]
      },
      {
        id: 'nearby',
        label: 'Nearby additions',
        kind: 'nearby',
        places: [
          'Alagar Koyil',
          'Thirupparankundram Murugan Temple',
          'Dr. A.P.J. Abdul Kalam Memorial',
          'Kothandaramaswamy Temple',
          'Thiruppullani Adi Jagannatha Perumal Temple',
          'Ariyaman Beach'
        ]
      }
    ]
  },
  {
    id: 'ooty-coonoor',
    name: 'Ooty & Coonoor Tea Country',
    destination: 'Nilgiris, Tamil Nadu',
    category: 'National',
    tourType: 'Hill Station Tours',
    durationDays: 4,
    durationNights: 3,
    description: 'Cool air, tea trails and unhurried mountain viewpoints.',
    groups: [
      {
        id: 'highlights',
        label: 'Mountain highlights',
        kind: 'recommended',
        places: [
          'Ooty Lake',
          'Government Botanical Garden, Ooty',
          'Doddabetta Peak',
          'Ooty Rose Garden',
          'Tea Factory and Tea Museum',
          "Sim's Park, Coonoor",
          "Dolphin's Nose, Coonoor"
        ]
      },
      {
        id: 'nature',
        label: 'Nature detours',
        kind: 'nearby',
        places: [
          "Lamb's Rock",
          'Coonoor tea estates',
          'Avalanche Lake',
          'Emerald Lake',
          'Pykara Lake and Waterfalls',
          'Nilgiri Mountain Railway'
        ]
      }
    ]
  },
  {
    id: 'kerala-backwaters-hills',
    name: 'Kerala Backwaters & Hills',
    destination: 'Kochi, Munnar, Thekkady and Alleppey',
    category: 'National',
    tourType: 'Family Tours',
    durationDays: 6,
    durationNights: 5,
    description: 'A soft-edged Kerala route linking spice hills with a backwater night.',
    groups: [
      {
        id: 'classic',
        label: 'Classic Kerala',
        kind: 'recommended',
        places: [
          'Fort Kochi',
          'Mattancherry Palace',
          'Munnar tea gardens',
          'Eravikulam National Park',
          'Thekkady and Periyar Lake',
          'Alleppey houseboat cruise'
        ]
      },
      {
        id: 'coast',
        label: 'Coastal extensions',
        kind: 'nearby',
        places: [
          'Kumarakom',
          'Varkala Cliff',
          'Kovalam Beach',
          'Athirappilly Waterfalls',
          'Marari Beach',
          'Cherai Beach'
        ]
      }
    ]
  },
  {
    id: 'south-india-heritage',
    name: 'South India Heritage Loop',
    destination: 'Karnataka, Tamil Nadu and Kerala',
    category: 'National',
    tourType: 'Cultural Tours',
    durationDays: 9,
    durationNights: 8,
    description: 'A layered route for travellers who like temples, architecture and local food.',
    groups: [
      {
        id: 'heritage',
        label: 'Heritage anchors',
        kind: 'recommended',
        places: [
          'Mysore Palace',
          'Coorg coffee country',
          'Hampi monuments',
          'Belur and Halebidu temples',
          'Mahabalipuram monuments',
          'Thanjavur Brihadeeswarar Temple',
          'Madurai Meenakshi Temple',
          'Fort Kochi'
        ]
      },
      {
        id: 'slow',
        label: 'Slow-travel additions',
        kind: 'optional',
        places: [
          'Chikmagalur coffee estates',
          'Kabini wildlife safari',
          'Kumbakonam temple quarter',
          'Pondicherry French Quarter',
          'Alleppey backwaters'
        ]
      }
    ]
  },
  {
    id: 'north-india-golden-triangle',
    name: 'Golden Triangle & Taj Country',
    destination: 'Delhi, Agra and Jaipur',
    category: 'National',
    tourType: 'Cultural Tours',
    durationDays: 6,
    durationNights: 5,
    description: 'The essential north Indian arc, with optional heritage and spiritual detours.',
    groups: [
      {
        id: 'essentials',
        label: 'Essential landmarks',
        kind: 'recommended',
        places: [
          'India Gate, Delhi',
          'Qutub Minar, Delhi',
          'Taj Mahal, Agra',
          'Agra Fort',
          'Amber Fort, Jaipur',
          'City Palace, Jaipur',
          'Hawa Mahal, Jaipur'
        ]
      },
      {
        id: 'detours',
        label: 'Easy detours',
        kind: 'nearby',
        places: [
          'Fatehpur Sikri',
          'Mathura and Vrindavan',
          'Gurudwara Bangla Sahib, Delhi',
          'Jantar Mantar, Jaipur',
          'Nahargarh Fort',
          'Chandni Chowk food walk'
        ]
      }
    ]
  },
  {
    id: 'asia-highlights',
    name: 'Asia Highlights',
    destination: 'Singapore, Malaysia, Thailand, Bali and Vietnam',
    category: 'International',
    tourType: 'International Tours',
    durationDays: 7,
    durationNights: 6,
    description: 'Popular first international routes, arranged around pace, paperwork and comfort.',
    groups: [
      {
        id: 'signature',
        label: 'Signature city breaks',
        kind: 'recommended',
        places: [
          'Singapore city highlights',
          'Universal Studios Singapore',
          'Kuala Lumpur and Petronas Towers',
          'Batu Caves',
          'Bangkok temples and riverfront',
          'Bali Ubud and south coast',
          'Ho Chi Minh City'
        ]
      },
      {
        id: 'island',
        label: 'Island & beach extensions',
        kind: 'nearby',
        places: [
          'Langkawi',
          'Phuket',
          'Krabi',
          'Maldives',
          'Colombo and Bentota',
          'Da Nang and Hoi An'
        ]
      }
    ]
  }
];

// A package is a routebook starting point, not a restriction on what a
// customer can request. These broader guide groups give the planner a useful
// regional inventory even when a published package contains fewer highlights.
const createDestinationGuide = (id, matches, groups) => ({
  id,
  matches,
  groups: groups.map(([groupId, label, kind, places]) => ({ id: groupId, label, kind, places }))
});

export const DESTINATION_GUIDES = [
  createDestinationGuide('tamil-nadu-grand', ['chennai to kanyakumari', 'tamil nadu temple', 'tamil nadu grand', 'tamil nadu'], [
    ['anchors', 'Landmarks & temple anchors', 'recommended', [
      'Marina Beach, Chennai', 'Fort St. George, Chennai', 'Kapaleeshwarar Temple, Chennai', 'San Thome Basilica, Chennai',
      'Government Museum, Chennai', 'Shore Temple, Mahabalipuram', 'Pancha Rathas, Mahabalipuram', "Arjuna's Penance, Mahabalipuram",
      'Kamakshi Amman Temple, Kanchipuram', 'Ekambareswarar Temple, Kanchipuram', 'Kailasanathar Temple, Kanchipuram', 'Gingee Fort',
      'Brihadeeswarar Temple, Thanjavur', 'Airavatesvara Temple, Darasuram', 'Sri Ranganathaswamy Temple, Srirangam',
      'Rockfort Temple, Trichy', 'Meenakshi Amman Temple, Madurai', 'Thirumalai Nayakkar Palace, Madurai',
      'Ramanathaswamy Temple, Rameswaram', 'Pamban Bridge', 'Dhanushkodi', 'Vivekananda Rock Memorial, Kanyakumari',
      'Thiruvalluvar Statue, Kanyakumari', 'Padmanabhapuram Palace'
    ]],
    ['coast-culture', 'Coast, culture & family stops', 'nearby', [
      'Valluvar Kottam, Chennai', 'DakshinaChitra Heritage Museum', 'Muttukadu Boating', 'Covelong Beach',
      'Mahabalipuram Lighthouse', 'Madras Crocodile Bank', 'Alamparai Fort', 'Kallanai Grand Anicut',
      'Jambukeswarar Temple, Tiruvanaikaval', 'Samayapuram Mariamman Temple', 'Thiruvaiyaru', 'Chettinad heritage villages',
      'Gandhi Memorial Museum, Madurai', 'Thirupparankundram Murugan Temple', 'Alagar Koyil, Madurai',
      'Dr. A.P.J. Abdul Kalam Memorial', 'Kothandaramaswamy Temple, Dhanushkodi', 'Ariyaman Beach',
      'Suchindram Thanumalayan Temple', 'Vattakottai Fort'
    ]],
    ['slow-detours', 'Optional detours', 'optional', [
      'Pondicherry Promenade', 'French Quarter, Pondicherry', 'Auroville', 'Paradise Beach, Chunnambar',
      'Pichavaram Mangrove Forest', 'Velankanni Basilica', 'Nagore Dargah', 'Tharangambadi Danish Fort',
      'Thiruppullani Adi Jagannatha Perumal Temple', 'Gulf of Mannar Marine National Park', 'Courtallam Waterfalls',
      'Kolli Hills', 'Vedanthangal Bird Sanctuary'
    ]]
  ]),
  createDestinationGuide('chennai-east-coast', ['chennai mahabalipuram', 'puducherry coast', 'pondicherry', 'puducherry', 'east coast', 'coromandel'], [
    ['coastline', 'City, shore & stonework', 'recommended', [
      'Marina Beach, Chennai', 'Fort St. George, Chennai', 'Kapaleeshwarar Temple, Chennai', 'San Thome Basilica, Chennai',
      'Government Museum, Chennai', 'Valluvar Kottam, Chennai', 'Shore Temple, Mahabalipuram', 'Pancha Rathas, Mahabalipuram',
      "Arjuna's Penance, Mahabalipuram", 'Mahabalipuram Lighthouse', 'Pondicherry Promenade', 'French Quarter, Pondicherry',
      'Auroville', 'Paradise Beach, Chunnambar'
    ]],
    ['coastal-additions', 'Nearby coastal additions', 'nearby', [
      'DakshinaChitra Heritage Museum', 'Muttukadu Boating', 'Covelong Beach', 'Madras Crocodile Bank', 'Sadras Fort',
      'Alamparai Fort', 'Pichavaram Mangrove Forest', 'Gingee Fort', 'Pondicherry Museum',
      'Basilica of the Sacred Heart of Jesus, Pondicherry', 'Botanical Garden, Pondicherry', 'Serenity Beach, Pondicherry',
      'Chunnambar Boat House', 'Pulicat Lake', 'Vedanthangal Bird Sanctuary'
    ]],
    ['coastal-slow-travel', 'Slow-travel ideas', 'optional', [
      'Thirukalukundram Vedagiriswarar Temple', 'Kanchipuram temple town', 'Karaikal beach', 'Tharangambadi Danish Fort',
      'Velankanni Basilica', 'Kallanai Grand Anicut'
    ]]
  ]),
  createDestinationGuide('madurai-rameswaram-kanyakumari', ['madurai rameswaram', 'ramanathapuram', 'rameswaram', 'kanyakumari', 'gulf of mannar'], [
    ['southern-anchors', 'Spiritual & southern anchors', 'recommended', [
      'Meenakshi Amman Temple, Madurai', 'Thirumalai Nayakkar Palace, Madurai', 'Gandhi Memorial Museum, Madurai',
      'Thirupparankundram Murugan Temple', 'Alagar Koyil, Madurai', 'Ramanathaswamy Temple, Rameswaram', 'Pamban Bridge',
      'Dhanushkodi', 'Dr. A.P.J. Abdul Kalam Memorial', 'Vivekananda Rock Memorial, Kanyakumari', 'Thiruvalluvar Statue, Kanyakumari',
      'Bhagavathi Amman Temple, Kanyakumari', 'Suchindram Thanumalayan Temple'
    ]],
    ['southern-additions', 'Nearby additions', 'nearby', [
      'Kothandaramaswamy Temple, Dhanushkodi', 'Thiruppullani Adi Jagannatha Perumal Temple', 'Ariyaman Beach',
      'Gulf of Mannar Marine National Park', 'Uthirakosamangai Temple', 'Vattakottai Fort', 'Padmanabhapuram Palace',
      'Kanyakumari Sunset Point', 'Kanyakumari Wax Museum', 'Kalakkad Mundanthurai Tiger Reserve'
    ]],
    ['southern-detours', 'Optional detours', 'optional', [
      'Chettinad heritage villages', 'Karaikudi Athangudi Palace', 'Courtallam Waterfalls', 'Manimuthar Waterfalls',
      'Tirunelveli Nellaiappar Temple', 'Kutralam Five Falls', 'Thoothukudi beach and harbour'
    ]]
  ]),
  createDestinationGuide('chola-navagraha', ['navagraha', 'kumbakonam', 'cauvery delta', 'chola', 'thanjavur', 'chidambaram'], [
    ['nine-planets', 'The nine Navagraha temples', 'recommended', [
      'Suryanar Kovil', 'Thingalur Kailasanathar Temple', 'Vaitheeswaran Koil', 'Thiruvenkadu Swetharanyeswarar Temple',
      'Alangudi Abathsahayeswarar Temple', 'Kanjanur Agneeswarar Temple', 'Tirunallar Saneeswaran Temple',
      'Thirunageswaram Naganathaswamy Temple', 'Keezhperumpallam Kailasanathar Temple', 'Brihadeeswarar Temple, Thanjavur',
      'Airavatesvara Temple, Darasuram', 'Gangaikonda Cholapuram Temple', 'Chidambaram Nataraja Temple', 'Sarangapani Temple, Kumbakonam'
    ]],
    ['delta-additions', 'Cauvery Delta additions', 'nearby', [
      'Swamimalai Murugan Temple', 'Kumbakonam Mahamaham Tank', 'Kumbakonam temple quarter', 'Thiruvaiyaru',
      'Kallanai Grand Anicut', 'Poompuhar coast', 'Mayavaram temples', 'Thirukkadaiyur Abirami Temple',
      'Uppiliappan Temple', 'Nagore Dargah'
    ]],
    ['delta-detours', 'Optional heritage detours', 'optional', [
      'Velankanni Basilica', 'Tharangambadi Danish Fort', 'Karaikal beach', 'Sirkazhi Sattainathar Temple',
      'Narthamalai cave temples', 'Chettinad heritage villages'
    ]]
  ]),
  createDestinationGuide('ooty-nilgiris', ['ooty', 'coonoor', 'nilgiris', 'hill station', 'kotagiri'], [
    ['mountain-highlights', 'Mountain highlights', 'recommended', [
      'Ooty Lake', 'Government Botanical Garden, Ooty', 'Doddabetta Peak', 'Ooty Rose Garden', 'Tea Factory and Tea Museum',
      "Sim's Park, Coonoor", "Dolphin's Nose, Coonoor", "Lamb's Rock, Coonoor", 'Nilgiri Mountain Railway', 'Pykara Lake and Waterfalls'
    ]],
    ['nilgiri-nature', 'Lakes, tea & nature', 'nearby', [
      'Coonoor tea estates', 'Avalanche Lake', 'Emerald Lake', 'Pykara Boathouse', 'Pykara Pine Forest',
      'Kodanadu View Point', 'Kotagiri tea country', 'Catherine Falls', 'Mukurthi National Park', 'Wenlock Downs', 'Tea Park, Kotagiri'
    ]],
    ['nilgiri-detours', 'Optional quiet escapes', 'optional', [
      'Glenmorgan', 'Upper Bhavani Lake', 'Ketti Valley View', 'Needle Rock View Point', 'Mudumalai Tiger Reserve', 'Bandipur National Park'
    ]]
  ]),
  createDestinationGuide('kerala-guide', ['kerala', 'munnar', 'alleppey', 'alappuzha', 'thekkady', 'kochi', 'backwaters', 'kumarakom'], [
    ['kerala-classics', 'Kerala classics', 'recommended', [
      'Fort Kochi', 'Mattancherry Palace', 'Jew Town and Paradesi Synagogue', 'Marine Drive, Kochi', 'Munnar tea gardens',
      'Mattupetty Dam', 'Echo Point, Munnar', 'Top Station, Munnar', 'Eravikulam National Park', 'Thekkady and Periyar Lake',
      'Alleppey houseboat cruise', 'Kumarakom backwaters'
    ]],
    ['kerala-coast-nature', 'Coast, waterfalls & wildlife', 'nearby', [
      'Varkala Cliff', 'Kovalam Beach', 'Marari Beach', 'Cherai Beach', 'Athirappilly Waterfalls', 'Vagamon meadows',
      'Poovar backwaters', 'Kollam Ashtamudi Lake', 'Thattekad Bird Sanctuary', 'Thommankuthu Waterfalls', 'Kumbalangi village'
    ]],
    ['kerala-slow-travel', 'Optional slow-travel ideas', 'optional', [
      'Wayanad Edakkal Caves', 'Banasura Sagar Dam', 'Bekal Fort', 'Kannur Theyyam experience', 'Kozhikode beach',
      'Kasaragod backwaters', 'Kuttanad village canoe ride'
    ]]
  ]),
  createDestinationGuide('south-india-guide', ['south india', 'mysore', 'mysuru', 'hampi', 'coorg', 'karnataka', 'bengaluru', 'chikmagalur'], [
    ['heritage-anchors', 'Heritage anchors', 'recommended', [
      'Mysore Palace', 'Chamundi Hill, Mysuru', 'Srirangapatna', 'Coorg coffee country', 'Abbey Falls, Coorg',
      'Hampi monuments', 'Virupaksha Temple, Hampi', 'Belur and Halebidu temples', 'Mahabalipuram monuments',
      'Thanjavur Brihadeeswarar Temple', 'Madurai Meenakshi Temple', 'Fort Kochi'
    ]],
    ['karnataka-additions', 'Nature & culture additions', 'nearby', [
      'Bengaluru Palace', 'Lalbagh Botanical Garden', 'Nandi Hills', 'Chikmagalur coffee estates', 'Mullayanagiri Peak',
      'Kabini wildlife safari', 'Bandipur National Park', 'Dandeli wildlife and rafting', 'Gokarna beaches',
      'Udupi Sri Krishna Temple', 'Badami cave temples', 'Pattadakal monuments', 'Aihole temples'
    ]],
    ['south-loop-detours', 'Optional route extensions', 'optional', [
      'Alleppey backwaters', 'Pondicherry French Quarter', 'Rameswaram temple town', 'Kodaikanal Lake', 'Yercaud hills',
      'Wayanad Edakkal Caves'
    ]]
  ]),
  createDestinationGuide('golden-triangle-guide', ['golden triangle', 'delhi agra jaipur', 'delhi', 'agra', 'jaipur'], [
    ['golden-anchors', 'Golden Triangle landmarks', 'recommended', [
      'India Gate, Delhi', 'Qutub Minar, Delhi', 'Red Fort, Delhi', 'Lotus Temple, Delhi', "Humayun's Tomb, Delhi",
      'Taj Mahal, Agra', 'Agra Fort', 'Mehtab Bagh, Agra', 'Amber Fort, Jaipur', 'City Palace, Jaipur',
      'Hawa Mahal, Jaipur', 'Jantar Mantar, Jaipur', 'Nahargarh Fort'
    ]],
    ['golden-additions', 'Easy additions', 'nearby', [
      'Fatehpur Sikri', 'Mathura and Vrindavan', 'Gurudwara Bangla Sahib, Delhi', 'Akshardham Temple, Delhi',
      'Chandni Chowk food walk', 'Jal Mahal, Jaipur', 'Albert Hall Museum, Jaipur', 'Bharatpur Bird Sanctuary'
    ]],
    ['golden-detours', 'Optional heritage detours', 'optional', [
      'Neemrana Fort Palace', 'Ranthambore National Park', 'Gwalior Fort', 'Haridwar and Rishikesh', 'Sarnath'
    ]]
  ]),
  createDestinationGuide('rajasthan-guide', ['rajasthan', 'udaipur', 'jodhpur', 'jaisalmer', 'desert safari'], [
    ['rajasthan-anchors', 'Palaces, forts & desert', 'recommended', [
      'City Palace, Udaipur', 'Lake Pichola boat ride', 'Jag Mandir, Udaipur', 'Sajjangarh Monsoon Palace',
      'Mehrangarh Fort, Jodhpur', 'Jaswant Thada, Jodhpur', 'Umaid Bhawan Palace', 'Jaisalmer Fort',
      'Sam Sand Dunes', 'Patwon Ki Haveli, Jaisalmer', 'Amber Fort, Jaipur', 'Ranthambore National Park'
    ]],
    ['rajasthan-additions', 'Nearby additions', 'nearby', [
      'Jodhpur blue city walk', 'Mandore Gardens', 'Kumbhalgarh Fort', 'Ranakpur Jain Temple', 'Chittorgarh Fort',
      'Pushkar Lake and Brahma Temple', 'Ajmer Sharif Dargah', 'Bikaner Junagarh Fort', 'Camel safari, Jaisalmer'
    ]],
    ['rajasthan-detours', 'Optional slower escapes', 'optional', [
      'Mount Abu and Nakki Lake', 'Bundi Palace', 'Shekhawati havelis', 'Osian temples', 'Keoladeo National Park'
    ]]
  ]),
  createDestinationGuide('himalayan-east-guide', ['sikkim', 'gangtok', 'darjeeling', 'west bengal', 'northeast'], [
    ['himalayan-anchors', 'Mountain anchors', 'recommended', [
      'MG Marg, Gangtok', 'Rumtek Monastery', 'Tsomgo Lake', 'Nathula Pass', 'Pelling monastery circuit',
      'Darjeeling Mall Road', 'Tiger Hill sunrise', 'Batasia Loop', 'Darjeeling Himalayan Railway', 'Tea estates, Darjeeling'
    ]],
    ['himalayan-additions', 'Valleys, lakes & viewpoints', 'nearby', [
      'Hanuman Tok, Gangtok', 'Enchey Monastery', 'Banjhakri Falls', 'Namchi Char Dham', 'Ravangla Buddha Park',
      'Yumthang Valley', 'Lachung', 'Khecheopalri Lake', 'Kurseong tea country', 'Sandakphu viewpoint'
    ]],
    ['himalayan-detours', 'Optional extensions', 'optional', [
      'Kalimpong', 'Mirik Lake', 'Jaldapara National Park', 'Pelling skywalk', 'Namchi tea gardens'
    ]]
  ]),
  createDestinationGuide('sacred-north-guide', ['varanasi', 'prayagraj', 'ayodhya', 'haridwar', 'rishikesh', 'sacred north'], [
    ['sacred-anchors', 'Sacred city anchors', 'recommended', [
      'Kashi Vishwanath Temple, Varanasi', 'Dashashwamedh Ghat, Varanasi', 'Ganga Aarti, Varanasi', 'Sarnath',
      'Ram Janmabhoomi, Ayodhya', 'Hanuman Garhi, Ayodhya', 'Triveni Sangam, Prayagraj', 'Anand Bhavan, Prayagraj',
      'Har Ki Pauri, Haridwar', 'Mansa Devi Temple, Haridwar', 'Rishikesh Laxman Jhula area', 'Neelkanth Mahadev Temple'
    ]],
    ['sacred-additions', 'Nearby spiritual & cultural places', 'nearby', [
      'Manikarnika Ghat', 'Assi Ghat', 'Banaras Hindu University', 'Ramnagar Fort', 'Kaal Bhairav Temple, Varanasi',
      'Chitrakoot', 'Vindhyachal Dham', 'Bharat Mata Temple, Varanasi', 'Beatles Ashram, Rishikesh', 'Ganga beach camping, Rishikesh'
    ]],
    ['sacred-detours', 'Optional longer detours', 'optional', [
      'Mathura and Vrindavan', 'Chitrakoot waterfalls', 'Naimisharanya', 'Mussoorie', 'Devprayag'
    ]]
  ]),
  createDestinationGuide('asia-guide', ['singapore', 'malaysia', 'thailand', 'bali', 'vietnam', 'asia highlights', 'kuala lumpur'], [
    ['asia-city-anchors', 'City & culture anchors', 'recommended', [
      'Singapore city highlights', 'Gardens by the Bay', 'Marina Bay Sands observation deck', 'Sentosa Island',
      'Universal Studios Singapore', 'Kuala Lumpur and Petronas Towers', 'Batu Caves', 'Bangkok Grand Palace',
      'Wat Arun', 'Bali Ubud', 'Tanah Lot Temple, Bali', 'Ho Chi Minh City', 'Hoi An Ancient Town', 'Da Nang'
    ]],
    ['asia-islands', 'Island & beach choices', 'nearby', [
      'Langkawi', 'Penang George Town', 'Phuket', 'Krabi', 'Pattaya', 'Chiang Mai', 'Bali south coast', 'Nusa Dua',
      'Gili Islands', 'Ha Long Bay', 'Maldives resort island', 'Colombo and Bentota'
    ]],
    ['asia-slow-travel', 'Optional experiences', 'optional', [
      'Singapore Night Safari', 'Kuala Lumpur food walk', 'Ayutthaya day trip', 'Phi Phi Island', 'Ubud rice terraces',
      'Bali water temples', 'Mekong Delta', 'Hoi An lantern evening'
    ]]
  ]),
  createDestinationGuide('dubai-uae-guide', ['dubai', 'abu dhabi', 'uae', 'emirates'], [
    ['uae-anchors', 'City icons & desert', 'recommended', [
      'Burj Khalifa', 'Dubai Mall', 'Dubai Marina', 'Palm Jumeirah', 'Dubai Desert Safari', 'Museum of the Future',
      'Dubai Frame', 'Sheikh Zayed Grand Mosque, Abu Dhabi', 'Louvre Abu Dhabi', 'Yas Island'
    ]],
    ['uae-additions', 'Family & culture additions', 'nearby', [
      'Jumeirah Mosque', 'Al Fahidi Historical Neighbourhood', 'Dubai Creek abra ride', 'Gold Souk and Spice Souk',
      'Global Village', 'Miracle Garden', 'Sharjah Museum of Islamic Civilization', 'Ferrari World Abu Dhabi',
      'Qasr Al Watan', 'Abu Dhabi Corniche'
    ]],
    ['uae-detours', 'Optional escapes', 'optional', [
      'Hatta Mountains', 'Fujairah coast', 'Ras Al Khaimah desert', 'Al Ain Oasis', 'Dubai Aquarium and Underwater Zoo'
    ]]
  ]),
  createDestinationGuide('europe-guide', ['europe', 'france', 'switzerland', 'italy', 'paris', 'swiss'], [
    ['europe-anchors', 'Classic Europe anchors', 'recommended', [
      'Eiffel Tower, Paris', 'Louvre Museum, Paris', 'Versailles Palace', 'Swiss Alps', 'Interlaken', 'Jungfraujoch',
      'Lake Lucerne', 'Zurich Old Town', 'Colosseum, Rome', 'Vatican Museums', 'Venice Grand Canal', 'Florence Duomo', 'Milan Cathedral'
    ]],
    ['europe-additions', 'Nearby city & scenic choices', 'nearby', [
      'Montmartre, Paris', 'Seine River cruise', 'Nice and the French Riviera', 'Chamonix', 'Mount Titlis', 'Rhine Falls',
      'Lake Como', 'Pisa Leaning Tower', 'Amalfi Coast', 'Pompeii'
    ]],
    ['europe-detours', 'Optional extensions', 'optional', [
      'Barcelona Sagrada Familia', 'Amsterdam canal belt', 'Prague Old Town', 'Vienna Schonbrunn Palace', 'Santorini', 'London city highlights'
    ]]
  ]),
  createDestinationGuide('goa-coast-guide', ['goa', 'beach resort', 'coastal escape', 'maldives'], [
    ['goa-anchors', 'Coast & heritage anchors', 'recommended', [
      'Baga Beach, North Goa', 'Calangute Beach', 'Anjuna Beach', 'Vagator Beach', 'Candolim Beach', 'Palolem Beach, South Goa',
      'Colva Beach', 'Fort Aguada', 'Basilica of Bom Jesus, Old Goa', 'Panjim Latin Quarter', 'Dudhsagar Waterfalls'
    ]],
    ['goa-additions', 'Beach, food & nature choices', 'nearby', [
      'Morjim Beach', 'Ashwem Beach', 'Butterfly Beach', 'Chapora Fort', 'Reis Magos Fort', 'Spice plantation tour',
      'Salim Ali Bird Sanctuary', 'Fontainhas heritage walk', 'Mandovi River cruise', 'Grande Island snorkelling'
    ]],
    ['goa-detours', 'Optional island-style requests', 'optional', [
      'Maldives resort island', 'Male city', 'Maldives snorkelling excursion', 'Island-hopping cruise', 'Havelock Island, Andaman'
    ]]
  ])
];

export const DESTINATION_KIND_LABELS = {
  recommended: 'Recommended',
  nearby: 'Nearby attractions',
  optional: 'Optional detours'
};

export const flattenDestinationGroups = (groups = []) => groups.flatMap(group => (
  (group.places || []).map((label, index) => ({
    id: `${group.id}-${index}`,
    label,
    groupId: group.id,
    kind: group.kind || 'nearby'
  }))
));

const normalizeDestinationLabel = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const findDestinationGuide = pkg => {
  const searchable = normalizeDestinationLabel([
    pkg?.name,
    pkg?.destination,
    pkg?.tourType
  ].filter(Boolean).join(' '));
  const winner = DESTINATION_GUIDES
    .map(guide => ({
      guide,
      score: guide.matches.reduce((total, phrase) => searchable.includes(phrase) ? total + phrase.length : total, 0)
    }))
    .sort((a, b) => b.score - a.score)[0];

  return winner?.score ? winner.guide : null;
};

export const getDestinationGroups = pkg => {
  const packageGroups = Array.isArray(pkg?.groups) ? pkg.groups : [];
  const guide = findDestinationGuide(pkg);
  if (!guide) return packageGroups;

  const guideGroups = guide.groups.map(group => ({
    ...group,
    id: `guide-${guide.id}-${group.id}`
  }));
  const guideLabels = new Set(
    flattenDestinationGroups(guideGroups).map(place => normalizeDestinationLabel(place.label))
  );
  const routebookExtras = flattenDestinationGroups(packageGroups)
    .filter(place => !guideLabels.has(normalizeDestinationLabel(place.label)))
    .map(place => place.label);

  if (routebookExtras.length) {
    guideGroups.push({
      id: `guide-${guide.id}-routebook`,
      label: 'Published routebook highlights',
      kind: 'recommended',
      places: [...new Set(routebookExtras)]
    });
  }

  return guideGroups;
};

export const getStartingDestinationIds = pkg => {
  const routebookLabels = new Set(
    flattenDestinationGroups(pkg?.groups || [])
      .filter(place => place.kind === 'recommended')
      .map(place => normalizeDestinationLabel(place.label))
  );

  return flattenDestinationGroups(getDestinationGroups(pkg))
    .filter(place => routebookLabels.has(normalizeDestinationLabel(place.label)))
    .map(place => place.id);
};

export const toCatalogPackage = (pkg) => {
  const id = pkg.packageId || `remote-${pkg._id}`;
  const remotePlaces = Array.isArray(pkg.templesList) ? pkg.templesList.filter(Boolean) : [];
  const remoteDestination = pkg.destination || 'Custom route';
  const groups = remotePlaces.length > 0
    ? [{ id: 'package-highlights', label: 'Package highlights', kind: 'recommended', places: remotePlaces }]
    : [{ id: 'package-route', label: 'Package route', kind: 'recommended', places: [remoteDestination] }];

  return {
    id,
    name: pkg.title || remoteDestination,
    destination: remoteDestination,
    category: pkg.packageCategory || 'National',
    tourType: pkg.tourType || 'Family Tours',
    durationDays: Number(pkg.durationDays) || 1,
    durationNights: Number(pkg.durationNights) || Math.max(Number(pkg.durationDays || 1) - 1, 0),
    description: pkg.overview || 'A published SreePayanam package.',
    imageUrl: typeof pkg.imageUrl === 'string' ? pkg.imageUrl : '',
    groups,
    remote: true,
    packageId: pkg.packageId
  };
};

export const flattenCatalog = (packages = []) => packages.flatMap(item => item.groups || []);
