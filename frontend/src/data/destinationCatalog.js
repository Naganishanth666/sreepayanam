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
