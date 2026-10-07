// Concise briefs checked against district/state tourism pages on 2026-10-07.
// These cover named stops without a usable encyclopaedia extract.
const kanchi = 'https://kancheepuram.nic.in/tourism/places-of-interest/';
const chitrakoot = 'https://chitrakoot.nic.in/places-of-interest/';
const shimla = 'https://himachaltourism.gov.in/destination/shimla/';
const salemTemples = 'https://salem.nic.in/ta/tourist-place/%E0%AE%95%E0%AF%8B%E0%AE%AF%E0%AE%BF%E0%AE%B2%E0%AF%8D%E0%AE%95%E0%AE%B3%E0%AF%8D-%E0%AE%AE%E0%AE%B1%E0%AF%8D%E0%AE%B1%E0%AF%81%E0%AE%AE%E0%AF%8D-%E0%AE%AE%E0%AE%9A%E0%AF%82%E0%AE%A4%E0%AE%BF%E0%AE%95/';

const overrides = {
  'Ekambareswarar Temple': {
    description: 'A Kanchipuram Shiva temple associated with the earth element of the Pancha Bhoota shrines; its tall entrance tower and thousand-pillared hall are the principal sights.',
    sourceUrl: kanchi, visitingInfo: 'The district lists morning and evening sessions; reconfirm the current darshan timetable.'
  },
  'Kailasanathar Temple': {
    description: 'An early Pallava sandstone temple in Kanchipuram, known for its sculpted shrines and temple tower.',
    sourceUrl: kanchi, visitingInfo: 'The district lists separate morning and evening sessions; check current entry hours.'
  },
  'Varadharaja Perumal Temple': {
    description: 'A large Vishnu temple complex in Kanchipuram with pillared halls and carved architecture.',
    sourceUrl: kanchi, visitingInfo: 'The district lists morning and evening sessions; reconfirm darshan hours.'
  },
  Kamadgiri: {
    description: 'The forested sacred hill at Chitrakoot, where pilgrims follow a circumambulation route past shrines associated with the Ramayana.',
    sourceUrl: chitrakoot
  },
  'Ramghat, Chitrakoot': {
    description: 'The Mandakini riverfront steps at Chitrakoot are a gathering place for pilgrims and evening aarti.',
    sourceUrl: chitrakoot
  },
  'Gupt Godavari': {
    description: 'A pair of water-lined caves near Chitrakoot, visited for their landscape and Ramayana associations.',
    sourceUrl: chitrakoot
  },
  Kufri: {
    description: 'A mountain resort near Shimla with forest views and outdoor activities that vary by weather and season.',
    sourceUrl: shimla
  },
  'Himalayan Nature Park': {
    description: 'A wildlife park at Kufri presenting bird and animal species of the Himalayan region.',
    sourceUrl: shimla
  },
  'Mahasu Peak': {
    description: 'A high ridge above Kufri visited for mountain views; access and activities depend on local weather.',
    sourceUrl: 'https://himachaltourism.gov.in/destination/skiing/'
  },
  'Sugavaneswarar Temple': {
    description: 'A historic Shiva temple in central Salem where visitors can see sculptures and memorial stones.',
    sourceUrl: salemTemples, visitingInfo: 'District-listed worship sessions run in the morning and from 15:30; reconfirm for the date.'
  },
  'Kottai Mariamman Temple, Salem': {
    description: 'A Mariamman shrine in central Salem, listed among the district’s local places of worship.',
    sourceUrl: salemTemples
  },
  'Kumaragiri Murugan Temple': {
    description: 'A Murugan hill temple near Udayapatti, about six kilometres from central Salem according to the district.',
    sourceUrl: salemTemples
  },
  'Godavari riverfront at Basara': {
    description: 'The riverbank beside Basara’s Saraswati temple is part of the town’s pilgrimage setting on the Godavari.',
    sourceUrl: 'https://nirmal.telangana.gov.in/tourist-place/sri-gnana-saraswathi-devasthanam-basara/'
  },
  'Chennakesava Temple, Belur': {
    description: 'A Hoysala-era Vishnu temple known for carved stone details; Belur is the main temple stop on this leg.',
    sourceUrl: 'https://karnatakatourism.org/en/destinations/beluru'
  },
  'Vittala Temple': {
    description: 'The Hampi monument group includes the Vitthala temple complex, known for ornate Vijayanagara architecture.',
    sourceUrl: 'https://whc.unesco.org/en/list/241'
  },
  'Om Beach': {
    description: 'A curved sandy cove at Gokarna; the district lists it among the town’s coastal sights.',
    sourceUrl: 'https://uttarakannada.nic.in/en/tourist-place/gokarna/'
  },
  'Kudle Beach': {
    description: 'A beach near Gokarna town suited to a shore walk and views of the Arabian Sea.',
    sourceUrl: 'https://uttarakannada.nic.in/en/tourist-place/gokarna/'
  },
  'Amar Mahal Palace Museum': {
    description: 'A former hilltop palace overlooking the Tawi River, now a museum with royal history and art galleries.',
    sourceUrl: 'https://jammu.nic.in/tourist-place/amar-mahal-jammu/'
  },
  'Yadadri Temple': {
    description: 'The hill shrine at Yadagirigutta is dedicated to Lakshmi Narasimha and is the main pilgrimage stop in Yadadri.',
    sourceUrl: 'https://yadadri.telangana.gov.in/tourist-place/yadagirigutta/',
    visitingInfo: 'Darshan and ritual timings vary with the day; confirm the official temple schedule.'
  },
  'Kumari Amman Temple': {
    description: 'A seaside shrine to the goddess Kumari near India’s southern tip and the meeting of the seas.',
    sourceUrl: 'https://kanniyakumari.nic.in/tspot_kat/',
    visitingInfo: 'District-listed visiting sessions: 04:30–12:30 and 16:00–20:30; reconfirm before travel.'
  },
  'Vivekananda Rock Memorial': {
    description: 'A memorial on a rock offshore from Kanyakumari, reached by ferry and dedicated to Swami Vivekananda.',
    sourceUrl: 'https://kanniyakumari.nic.in/tspot_vrm/',
    visitingInfo: 'District-listed visiting hours: 08:00–16:00; ferry service depends on sea conditions.'
  },
  'Venkateswara Temple, Tirumala': {
    description: 'The hilltop shrine at Tirumala is dedicated to Venkateswara; this programme reserves the main part of the day for the TTD-controlled darshan.',
    sourceUrl: 'https://tirumala.org/Darshan.aspx',
    visitingInfo: 'The actual reporting slot is issued with the TTD booking and can differ from the proposed clock time.'
  },
  'Vaishno Devi Temple': {
    description: 'The Bhawan shrine on the Trikuta hills is reached from Katra by an approximately 13–14 km uphill yatra; the full day is reserved for the pilgrimage.',
    sourceUrl: 'https://www.maavaishnodevi.org/causes/travel',
    visitingInfo: 'RFID yatra registration is mandatory. Trek, darshan and return times depend on weather, queues and selected transport.'
  },
  "Robber's Cave, Dehradun": {
    description: 'A natural cave and stream about eight kilometres from Dehradun, where water disappears and reappears along the rocky channel.',
    sourceUrl: 'https://dehradun.nic.in/tourist-place/rishikesh/'
  },
  'Kamalalayam tank': {
    description: 'The large temple tank beside Thiruvarur’s Thyagaraja shrine is one of the town’s characteristic sights.',
    sourceUrl: 'https://tiruvarur.nic.in/tourism/festivals-culture-heritage/'
  },
  'Mannargudi Rajagopalaswamy Temple': {
    description: 'A large temple complex in Mannargudi with a prominent entrance tower, halls and shrines.',
    sourceUrl: 'https://tiruvarur.nic.in/tourism/places-of-interest/'
  },
  'Sripuram Golden Temple': {
    description: 'A gold-clad temple at Sripuram near Vellore, with detailed decorative work around the shrine.',
    sourceUrl: 'https://vellore.nic.in/tourist-place/golden-temple-sripuram/'
  },
  'Jalakandeswarar Temple': {
    description: 'A Shiva temple within Vellore Fort, noted for its Vijayanagara-style stone architecture.',
    sourceUrl: 'https://vellore.nic.in/tourist-place/jalakandeshwarar-temple/'
  },
  'Bhakta Kannappa Temple': {
    description: 'A shrine east of Srikalahasti’s main temple honouring the devotee Kannappa.',
    sourceUrl: 'https://www.srikalahasthitemple.org/adopted-temples'
  },
  'Sri Chamundeswari Ammavari Temple': {
    description: 'A religious stop at Gangapatnam in Nellore district, listed among the district’s visitor places.',
    sourceUrl: 'https://spsnellore.ap.gov.in/tourist-places-in-district/'
  },
  'Gun Hill': {
    description: 'A viewpoint above Mussoorie reached by a hill ascent, with wide views across the surrounding valleys.',
    sourceUrl: 'https://uttarakhandtourism.gov.in/destination/mussoorie'
  },
  'Lal Tibba': {
    description: 'A high ridge and viewpoint in Mussoorie, listed by Uttarakhand Tourism among the town’s principal sights.',
    sourceUrl: 'https://uttarakhandtourism.gov.in/destination/mussoorie'
  },
  'Jambudweep Jain Tirth': {
    description: 'A Jain pilgrimage complex at Hastinapur with a Sumeru Parvat model and Kamal Temple.',
    sourceUrl: 'https://meerut.nic.in/tourist-place/hastinapur-jain-temple/'
  },
  'Ashtapad Jain Tirth': {
    description: 'One of Hastinapur’s Jain pilgrimage temples, listed by the Meerut district tourism office.',
    sourceUrl: 'https://meerut.nic.in/tourist-place/hastinapur-jain-temple/'
  },
  'Panipat Museum': {
    description: 'A museum explaining the battles of Panipat and displaying archaeological, art and craft material from Haryana.',
    sourceUrl: 'https://panipat.gov.in/tourist-place/panipat-museum/'
  }
};

module.exports = { overrides };
