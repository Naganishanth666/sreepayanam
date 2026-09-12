import { IMAGE_PRESETS } from '../utils/imagePresets';

const HERO_SLIDE_SPECS = [
  {
    type: 'Family Tours',
    place: 'Kerala backwaters & Munnar',
    routeNote: 'Soft mornings, easy transfers and enough room for every generation to enjoy the journey.',
    stops: ['Kochi', 'Munnar', 'Alleppey']
  },
  {
    type: 'Pilgrimage Tours',
    place: 'Madurai, Rameswaram & Kanyakumari',
    routeNote: 'Temple towns, coastal shrines and a thoughtful pace for meaningful darshan.',
    stops: ['Madurai', 'Rameswaram', 'Kanyakumari']
  },
  {
    type: 'Honeymoon Tours',
    place: 'Bali, Goa & Kerala escapes',
    routeNote: 'Slow stays, beautiful light and the kind of days that do not need a schedule.',
    stops: ['Ubud', 'Seminyak', 'Nusa Dua']
  },
  {
    type: 'Hill Station Tours',
    place: 'Ooty & Coonoor tea country',
    routeNote: 'Cool air, green bends and unhurried viewpoints above the everyday.',
    stops: ['Ooty', 'Coonoor', 'Nilgiris']
  },
  {
    type: 'Resort Packages',
    place: 'Maldives, Goa & the coast',
    routeNote: 'A softer itinerary with sunlit water, comfortable stays and time to do less.',
    stops: ['Check-in', 'Unwind', 'Stay longer']
  },
  {
    type: 'Weekend Tours',
    place: 'Pondicherry & the Coromandel coast',
    routeNote: 'A quick reset built around good food, old streets and one more sunset by the sea.',
    stops: ['Chennai', 'Mahabalipuram', 'Pondicherry']
  },
  {
    type: 'Group Tours',
    place: 'South India, together',
    routeNote: 'One well-held route for friends, clubs and large groups who want to travel easily.',
    stops: ['Meet', 'Move', 'Remember']
  },
  {
    type: 'School / College Tours',
    place: 'Heritage, science & discovery trails',
    routeNote: 'Learning outside the classroom, with clear movement plans for every student group.',
    stops: ['Discover', 'Explore', 'Share']
  },
  {
    type: 'Corporate Tours',
    place: 'Bengaluru, Kochi & offsite country',
    routeNote: 'Well-timed offsites that leave space for the work, the team and the place itself.',
    stops: ['Arrive', 'Connect', 'Return']
  },
  {
    type: 'Festival Tours',
    place: 'Living festivals of South India',
    routeNote: 'Plan around the colour, music and local rhythm that make a festival worth travelling for.',
    stops: ['Gather', 'Celebrate', 'Carry home']
  },
  {
    type: 'Cultural Tours',
    place: 'Chola country & living heritage',
    routeNote: 'Architecture, kitchens, craft and stories that reward a slower look.',
    stops: ['Thanjavur', 'Kumbakonam', 'Chidambaram']
  },
  {
    type: 'Medical Tours',
    place: 'Chennai care & a calmer stay',
    routeNote: 'Practical travel support around appointments, accommodation and the people beside you.',
    stops: ['Plan care', 'Stay close', 'Travel home']
  }
];

const toHeroImage = type => (IMAGE_PRESETS[type]?.[0] || '').replace('w=800', 'w=1600');

export const HERO_PACKAGE_TYPES = HERO_SLIDE_SPECS.map(slide => slide.type);

export const HERO_SLIDES = HERO_SLIDE_SPECS.map((slide, index) => ({
  ...slide,
  index,
  image: toHeroImage(slide.type)
}));
