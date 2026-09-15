import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, CircleHelp, Compass,
  Download, FileText, Hotel, MapPin, MessageCircle, RefreshCw, Route, Send,
  ShieldCheck, Search, Sparkles, X
} from 'lucide-react';
import {
  DESTINATION_CATALOG,
  DESTINATION_KIND_LABELS,
  flattenDestinationGroups
} from '../data/destinationCatalog';
import { downloadQuotationPdf } from '../utils/quotationPdf';

const STEPS = [
  { id: 1, name: 'Route', detail: 'Destination & dates' },
  { id: 2, name: 'Explore', detail: 'Nearby places' },
  { id: 3, name: 'Comfort', detail: 'Stay & movement' },
  { id: 4, name: 'Contact', detail: 'Send enquiry' }
];

const DEFAULT_FORM = {
  packageId: 'custom-destination',
  destination: '',
  departureCity: '',
  travelStartDate: '',
  returnDate: '',
  durationDays: DESTINATION_CATALOG[0].durationDays,
  durationNights: DESTINATION_CATALOG[0].durationNights,
  adultCount: 2,
  childWithBedCount: 0,
  childNoBedCount: 0,
  infantCount: 0,
  hotelCategory: '3 Star',
  hotelRooms: '',
  mealPlan: 'MAP',
  vehicleType: 'Sedan',
  guideRequired: 'No',
  entryTickets: 'Yes',
  fullName: '',
  mobileNumber: '',
  email: '',
  city: '',
  contactMethod: 'WhatsApp',
  notes: '',
  consent: false
};

const PLANNING_FIELDS = new Set([
  'adultCount', 'childWithBedCount', 'childNoBedCount', 'infantCount',
  'hotelCategory', 'hotelRooms', 'mealPlan', 'vehicleType', 'guideRequired', 'entryTickets',
  'durationDays', 'durationNights'
]);

const safeJson = async response => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const buildItinerary = (destinations, days) => {
  const totalDays = Math.max(1, Number(days) || 1);
  const items = destinations.length ? destinations : ['Flexible local discovery'];
  return Array.from({ length: totalDays }, (_, index) => {
    const start = Math.floor(index * items.length / totalDays);
    const end = Math.max(start + 1, Math.floor((index + 1) * items.length / totalDays));
    const dayItems = items.slice(start, end);
    return {
      day: index + 1,
      title: index === 0 ? 'Arrival & settle in' : index === totalDays - 1 ? 'Last light & return' : 'Discover the route',
      base: '',
      places: dayItems,
      activities: dayItems.length ? `Keep this day centred around ${dayItems.join(', ')} with practical time for local travel, meals and rest.` : 'Leave this day open for flexible local discovery.',
      hotel: { name: '', rating: '', desc: '' },
      meal: '',
      transit: ''
    };
  });
};

const parseDateOnly = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
    ? timestamp
    : NaN;
};

const deriveTripTiming = (travelStartDate, returnDate) => {
  const start = parseDateOnly(travelStartDate);
  const end = parseDateOnly(returnDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  const days = Math.round((end - start) / 86400000) + 1;
  return { days, nights: Math.max(days - 1, 0) };
};

const createDraftReference = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() || Math.random().toString(36).slice(2, 10).toUpperCase();
  return `SP-DRAFT-${date}-${suffix}`;
};

const buildLocalPlanningReview = (selectedPlaces, durationDays) => {
  const capacity = Math.max(Number(durationDays) || 1, (Number(durationDays) || 1) * 4);
  const unplacedPlaces = selectedPlaces.slice(capacity);
  const status = unplacedPlaces.length ? 'tight' : 'workable';
  return {
    status,
    summary: status === 'workable'
      ? 'The selected places can be shaped into this time window; the travel desk will still review the final routing.'
      : `You selected ${selectedPlaces.length} places for ${durationDays} days. The draft will keep the most practical stops first and flag the rest for review.`,
    selectedPlaceCount: selectedPlaces.length,
    plannedPlaceCount: selectedPlaces.length - unplacedPlaces.length,
    unplacedPlaces,
    suggestedRemovals: unplacedPlaces.map(place => ({ place, reason: 'The time window may not support this stop alongside the other selected places.' })),
    suggestedReplacements: []
  };
};

const normalizePlannerDraft = (payload, preferences) => {
  const durationDays = Math.max(1, Number(payload?.durationDays || preferences.durationDays) || 1);
  const durationNights = Math.max(0, Number(payload?.durationNights ?? preferences.durationNights) || 0);
  const selectedPlaces = Array.isArray(preferences.selectedDestinations) ? preferences.selectedDestinations : [];
  const rawItinerary = Array.isArray(payload?.itinerary) ? payload.itinerary : [];
  const fallbackReview = buildLocalPlanningReview(selectedPlaces, durationDays);
  const rawReview = payload?.planningReview && typeof payload.planningReview === 'object' ? payload.planningReview : {};
  const itinerary = Array.from({ length: durationDays }, (_, index) => {
    const day = rawItinerary.find(item => Number(item?.day) === index + 1) || rawItinerary[index] || {};
    const places = Array.isArray(day.places) ? day.places.filter(place => typeof place === 'string' && place.trim()).map(place => place.trim()).slice(0, 10) : [];
    const hotel = day.hotel && typeof day.hotel === 'object' ? day.hotel : {};
    return {
      day: index + 1,
      title: typeof day.title === 'string' && day.title.trim() ? day.title.trim().slice(0, 140) : index === 0 ? 'Arrival & settle in' : index === durationDays - 1 ? 'Last light & return' : 'Discover the route',
      base: typeof day.base === 'string' ? day.base.trim().slice(0, 120) : '',
      places,
      activities: typeof day.activities === 'string' && day.activities.trim() ? day.activities.trim().slice(0, 1200) : places.length ? `A considered day around ${places.join(', ')} with time for local travel, meals and rest.` : 'Flexible time for local discovery.',
      hotel: {
        name: typeof hotel.name === 'string' ? hotel.name.trim().slice(0, 160) : '',
        rating: typeof hotel.rating === 'string' ? hotel.rating.trim().slice(0, 80) : '',
        desc: typeof (hotel.desc || hotel.description) === 'string' ? (hotel.desc || hotel.description).trim().slice(0, 360) : ''
      },
      meal: typeof day.meal === 'string' ? day.meal.trim().slice(0, 600) : '',
      transit: typeof day.transit === 'string' ? day.transit.trim().slice(0, 600) : ''
    };
  });
  const planned = new Set(itinerary.flatMap(day => day.places.map(place => place.toLowerCase())));
  const inferredUnplaced = selectedPlaces.filter(place => !planned.has(place.toLowerCase()));
  const reportedUnplaced = Array.isArray(rawReview.unplacedPlaces) ? rawReview.unplacedPlaces.filter(place => typeof place === 'string' && place.trim()).map(place => place.trim()).slice(0, 20) : [];
  const unplacedPlaces = [...new Map([...reportedUnplaced, ...inferredUnplaced].map(place => [place.toLowerCase(), place])).values()];
  const status = unplacedPlaces.length ? (planned.size >= Math.max(1, selectedPlaces.length - 2) ? 'tight' : 'not_feasible') : ['workable', 'tight', 'not_feasible'].includes(rawReview.status) ? rawReview.status : fallbackReview.status;
  const fallbackSummary = status === 'workable'
    ? 'The selected places can be shaped into this time window with practical daily clusters.'
    : status === 'tight'
      ? 'The selection is ambitious for this time window. Review the places marked for removal or replacement before confirming.'
      : 'The selected places do not all fit comfortably into this time window. Review the suggested removals and replacements before confirming.';
  const cleanSuggestions = value => Array.isArray(value) ? value.slice(0, 12).map(item => typeof item === 'string' ? { place: item.trim(), reason: '' } : ({ place: typeof item?.place === 'string' ? item.place.trim() : '', reason: typeof item?.reason === 'string' ? item.reason.trim() : '', replacement: typeof item?.replacement === 'string' ? item.replacement.trim() : '' })).filter(item => item.place) : [];

  return {
    planReference: typeof payload?.planReference === 'string' && payload.planReference.trim() ? payload.planReference.trim() : createDraftReference(),
    inputFingerprint: preferences.planningFingerprint || '',
    title: typeof payload?.title === 'string' && payload.title.trim() ? payload.title.trim().slice(0, 160) : `${preferences.destination || 'Custom'} route draft`,
    destination: preferences.destination || '',
    startingCity: preferences.startingCity || '',
    endingCity: preferences.endingCity || '',
    travelStartDate: preferences.travelStartDate || '',
    returnDate: preferences.returnDate || '',
    durationDays,
    durationNights,
    overview: typeof payload?.overview === 'string' && payload.overview.trim() ? payload.overview.trim().slice(0, 1200) : 'A time-aware route draft arranged around your chosen places.',
    planningReview: {
      status,
      summary: typeof rawReview.summary === 'string' && rawReview.summary.trim() ? rawReview.summary.trim().slice(0, 700) : fallbackSummary,
      selectedPlaceCount: selectedPlaces.length,
      plannedPlaceCount: planned.size,
      unplacedPlaces,
      suggestedRemovals: cleanSuggestions(rawReview.suggestedRemovals),
      suggestedReplacements: cleanSuggestions(rawReview.suggestedReplacements)
    },
    itinerary,
    inclusions: Array.isArray(payload?.inclusions) ? payload.inclusions.filter(item => typeof item === 'string').slice(0, 20) : [],
    exclusions: Array.isArray(payload?.exclusions) ? payload.exclusions.filter(item => typeof item === 'string').slice(0, 20) : []
  };
};

const createFallbackDraft = preferences => normalizePlannerDraft({
  title: `${preferences.destination || 'Custom'} route draft`,
  overview: 'The AI route review is temporarily unavailable, so this is a simple planning placeholder for the travel desk to refine.',
  planningReview: buildLocalPlanningReview(preferences.selectedDestinations || [], preferences.durationDays),
  itinerary: buildItinerary(preferences.selectedDestinations || [], preferences.durationDays)
}, preferences);

const Field = ({ id, label, required = false, error, help, children, className = '' }) => (
  <div className={`planner-field-wrap ${className}`}>
    <label className="field-label" htmlFor={id}>
      {label} {required && <span className="required" aria-hidden="true">*</span>}
    </label>
    {children}
    {help && !error && <span id={`${id}-help`} className="field-error" style={{ color: 'var(--color-muted)' }}>{help}</span>}
    {error && <span id={`${id}-error`} className="field-error" role="alert">{error}</span>}
  </div>
);

const getAria = (id, error, help) => ({
  'aria-invalid': error ? 'true' : undefined,
  'aria-describedby': error ? `${id}-error` : help ? `${id}-help` : undefined
});

const normalizeDestinationGuide = (payload, destination) => {
  const groups = Array.isArray(payload?.groups) ? payload.groups.slice(0, 4).map((group, index) => ({
    id: typeof group?.id === 'string' && group.id ? group.id : `ai-group-${index + 1}`,
    label: typeof group?.label === 'string' && group.label ? group.label : 'Places to consider',
    kind: ['recommended', 'nearby', 'optional'].includes(group?.kind) ? group.kind : index === 0 ? 'recommended' : index === 1 ? 'nearby' : 'optional',
    places: Array.isArray(group?.places)
      ? group.places.map(place => typeof place === 'string' ? place.trim() : '').filter(Boolean).slice(0, 40)
      : []
  })).filter(group => group.places.length) : [];

  return {
    destination: typeof payload?.destination === 'string' && payload.destination.trim() ? payload.destination.trim() : destination,
    groups
  };
};

const AiAssistant = () => {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('planner');
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [destinationGuide, setDestinationGuide] = useState(null);
  const [guideState, setGuideState] = useState('idle');
  const [guideError, setGuideError] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [customPlaces, setCustomPlaces] = useState([]);
  const [customPlace, setCustomPlace] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validationError, setValidationError] = useState('');
  const [planningDraft, setPlanningDraft] = useState(null);
  const [submittedDraft, setSubmittedDraft] = useState(null);
  const [planningState, setPlanningState] = useState('idle');
  const [planningError, setPlanningError] = useState('');
  const [pdfState, setPdfState] = useState('idle');
  const [requestState, setRequestState] = useState('idle');
  const [requestError, setRequestError] = useState('');
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Tell me the feeling you want from this trip — temple trail, cool hills, coast, or somewhere completely new.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatListRef = useRef(null);
  const mutationController = useRef(null);
  const guideController = useRef(null);
  const planningController = useRef(null);

  const dateDuration = useMemo(
    () => deriveTripTiming(form.travelStartDate, form.returnDate),
    [form.travelStartDate, form.returnDate]
  );

  const selectedPackage = useMemo(() => {
    const destination = form.destination.trim() || 'Custom route';
    const durationDays = Number(form.durationDays) || DESTINATION_CATALOG[0].durationDays;
    const durationNights = Number(form.durationNights);
    return {
      id: 'custom-destination',
      packageId: 'custom-destination',
      name: destination === 'Custom route' ? 'Your custom route' : destination,
      destination,
      tourType: 'Custom itinerary',
      durationDays,
      durationNights: Number.isFinite(durationNights) ? durationNights : Math.max(durationDays - 1, 0),
      description: destinationGuide?.destination
        ? `AI-discovered places for ${destinationGuide.destination}. Choose what matters and the travel desk will curate the route.`
        : 'Enter any destination and we will discover nearby places for you to choose.'
    };
  }, [destinationGuide, form.destination, form.durationDays, form.durationNights]);

  const destinationGroups = useMemo(() => destinationGuide?.groups || [], [destinationGuide]);

  const allDestinations = useMemo(() => [
    ...flattenDestinationGroups(destinationGroups),
    ...customPlaces
  ], [destinationGroups, customPlaces]);

  const visibleDestinationGroups = useMemo(() => {
    const query = destinationSearch.trim().toLowerCase();
    return destinationGroups
      .map(group => ({
        ...group,
        places: flattenDestinationGroups([group]).filter(place => !query || place.label.toLowerCase().includes(query))
      }))
      .filter(group => group.places.length > 0);
  }, [destinationGroups, destinationSearch]);

  const visibleCustomPlaces = useMemo(() => {
    const query = destinationSearch.trim().toLowerCase();
    return customPlaces.filter(place => !query || place.label.toLowerCase().includes(query));
  }, [customPlaces, destinationSearch]);

  const visiblePlaceCount = visibleDestinationGroups.reduce((total, group) => total + group.places.length, 0) + visibleCustomPlaces.length;
  const totalPlaceCount = allDestinations.length;

  const selectedLabels = useMemo(
    () => allDestinations.filter(place => selectedDestinations.includes(place.id)).map(place => place.label),
    [allDestinations, selectedDestinations]
  );

  const planningPayload = useMemo(() => ({
    destination: form.destination.trim(),
    startingCity: form.departureCity.trim() || form.destination.trim(),
    endingCity: form.destination.trim(),
    travelStartDate: form.travelStartDate,
    returnDate: form.returnDate,
    durationDays: Number(form.durationDays) || 1,
    durationNights: Number(form.durationNights) || 0,
    durationSource: dateDuration ? 'travel dates' : 'manual duration fallback',
    selectedDestinations: selectedLabels,
    availableDestinations: allDestinations.map(place => place.label),
    adultCount: Number(form.adultCount) || 1,
    childWithBedCount: Number(form.childWithBedCount) || 0,
    childNoBedCount: Number(form.childNoBedCount) || 0,
    infantCount: Number(form.infantCount) || 0,
    hotelCategory: form.hotelCategory,
    hotelRooms: form.hotelRooms,
    mealPlan: form.mealPlan,
    vehicleType: form.vehicleType,
    guideRequired: form.guideRequired,
    entryTickets: form.entryTickets,
    planningFingerprint: ''
  }), [allDestinations, dateDuration, form.adultCount, form.childNoBedCount, form.childWithBedCount, form.destination, form.departureCity, form.entryTickets, form.guideRequired, form.hotelCategory, form.hotelRooms, form.infantCount, form.mealPlan, form.returnDate, form.travelStartDate, form.vehicleType, form.durationDays, form.durationNights, selectedLabels]);

  const planningFingerprint = useMemo(
    () => JSON.stringify({ ...planningPayload, planningFingerprint: undefined }),
    [planningPayload]
  );
  const totalTravellers = Number(form.adultCount || 0) + Number(form.childWithBedCount || 0) + Number(form.childNoBedCount || 0) + Number(form.infantCount || 0);
  const activeItinerary = submittedDraft?.itinerary || planningDraft?.itinerary || [];
  const activeReview = submittedDraft?.planningReview || planningDraft?.planningReview || buildLocalPlanningReview(selectedLabels, form.durationDays);

  useEffect(() => () => {
    mutationController.current?.abort();
    guideController.current?.abort();
    planningController.current?.abort();
  }, []);

  useEffect(() => {
    if (chatListRef.current) chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  const invalidateQuote = () => {
    setSubmittedDraft(null);
    setEnquirySuccess(false);
    setRequestError('');
    if (requestState !== 'idle') setRequestState('idle');
  };

  const updateField = (name, value) => {
    setForm(previous => {
      const next = { ...previous, [name]: value };
      if (name === 'durationDays' && !previous.travelStartDate && !previous.returnDate) {
        next.durationNights = Math.max((Number(value) || 1) - 1, 0);
      }
      return next;
    });
    setFieldErrors(previous => ({ ...previous, [name]: '' }));
    setValidationError('');
    if (PLANNING_FIELDS.has(name)) {
      setPlanningDraft(null);
      setPlanningState('idle');
      setPlanningError('');
    }
    invalidateQuote();
  };

  const handleDateChange = event => {
    const { name, value } = event.target;
    setForm(previous => {
      const next = { ...previous, [name]: value };
      const derived = deriveTripTiming(next.travelStartDate, next.returnDate);
      if (derived) {
        next.durationDays = derived.days;
        next.durationNights = derived.nights;
      }
      return next;
    });
    setFieldErrors(previous => ({ ...previous, [name]: '', returnDate: '' }));
    setPlanningDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    setValidationError('');
    invalidateQuote();
  };

  const handleDestinationChange = event => {
    const value = event.target.value;
    setForm(previous => ({ ...previous, destination: value, packageId: 'custom-destination' }));
    setDestinationGuide(null);
    setGuideState('idle');
    setGuideError('');
    setSelectedDestinations([]);
    setCustomPlaces([]);
    setFieldErrors(previous => ({ ...previous, destination: '', destinationPicker: '' }));
    setDestinationSearch('');
    setPlanningDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    invalidateQuote();
  };

  const discoverDestinations = async () => {
    const destination = form.destination.trim();
    if (!destination || guideState === 'loading') return false;

    guideController.current?.abort();
    const controller = new AbortController();
    guideController.current = controller;
    setGuideState('loading');
    setGuideError('');
    setFieldErrors(previous => ({ ...previous, destination: '', destinationPicker: '' }));

    try {
      const response = await fetch('/api/ai/destination-guide', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination })
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'We could not discover places for that destination.');

      const guide = normalizeDestinationGuide(data, destination);
      if (!guide.groups.length) throw new Error('No nearby places were returned. Try a more specific destination.');
      const recommended = flattenDestinationGroups(guide.groups)
        .filter(place => place.kind === 'recommended')
        .map(place => place.id);
      setDestinationGuide(guide);
      setSelectedDestinations(recommended);
      setCustomPlaces([]);
      setCustomPlace('');
      setDestinationSearch('');
      setGuideState('ready');
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return true;
    } catch (error) {
      if (error.name === 'AbortError') return false;
      setGuideState('error');
      setGuideError(error.message || 'We could not discover places for that destination. Try again.');
      return false;
    }
  };

  const toggleDestination = id => {
    setSelectedDestinations(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
    setFieldErrors(previous => ({ ...previous, destinationPicker: '' }));
    setPlanningDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    invalidateQuote();
  };

  const selectRecommended = () => {
    const recommended = allDestinations.filter(place => place.kind === 'recommended').map(place => place.id);
    setSelectedDestinations(recommended);
    setPlanningDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    invalidateQuote();
  };

  const clearDestinations = () => {
    setSelectedDestinations([]);
    setPlanningDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    invalidateQuote();
  };

  const addCustomPlace = event => {
    event.preventDefault();
    const label = customPlace.trim().slice(0, 140);
    if (!label) return;

    const existingPlace = allDestinations.find(place => place.label.trim().toLowerCase() === label.toLowerCase());
    if (existingPlace) {
      setSelectedDestinations(previous => previous.includes(existingPlace.id) ? previous : [...previous, existingPlace.id]);
      setCustomPlace('');
      setDestinationSearch('');
      setFieldErrors(previous => ({ ...previous, destinationPicker: '' }));
      setPlanningDraft(null);
      setPlanningState('idle');
      setPlanningError('');
      invalidateQuote();
      return;
    }

    const item = { id: `custom-${Date.now()}`, label, groupId: 'custom', kind: 'optional' };
    setCustomPlaces(previous => [...previous, item]);
    setSelectedDestinations(previous => [...previous, item.id]);
    setCustomPlace('');
    setDestinationSearch('');
    setFieldErrors(previous => ({ ...previous, destinationPicker: '' }));
    setPlanningDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    invalidateQuote();
  };

  const validateStep = step => {
    const errors = {};
    if (step === 1) {
      if (!form.destination.trim()) errors.destination = 'Enter a city, region or country to continue.';
      if (!Number(form.durationDays) || Number(form.durationDays) < 1) errors.durationDays = 'Add at least one travel day.';
      if ((form.travelStartDate && !form.returnDate) || (!form.travelStartDate && form.returnDate)) errors.returnDate = 'Choose both travel dates to calculate the trip length automatically.';
      if (form.travelStartDate && form.returnDate && parseDateOnly(form.returnDate) < parseDateOnly(form.travelStartDate)) errors.returnDate = 'Return date must be on or after the start date.';
    }
    if (step === 2) {
      if (!selectedDestinations.length) errors.destinationPicker = 'Choose at least one place, or add a place of your own.';
      if (!Number(form.adultCount) || Number(form.adultCount) < 1) errors.adultCount = 'At least one adult is required.';
    }
    if (step === 3) {
      if (!Number(form.adultCount) || Number(form.adultCount) < 1) errors.adultCount = 'At least one adult is required.';
      if (Number(form.durationNights) < 0) errors.durationNights = 'Nights cannot be negative.';
    }
    if (step === 4) {
      if (!form.fullName.trim()) errors.fullName = 'Add your full name.';
      if (!/^\+?[0-9 ()-]{8,20}$/.test(form.mobileNumber.trim())) errors.mobileNumber = 'Enter a valid mobile number.';
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
      if (!form.consent) errors.consent = 'Please allow us to use these details to prepare your route enquiry.';
    }
    setFieldErrors(errors);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      setValidationError('Check the highlighted detail before continuing.');
      window.setTimeout(() => document.getElementById(firstError)?.focus(), 0);
      return false;
    }
    setValidationError('');
    return true;
  };

  const requestRouteDraft = async () => {
    planningController.current?.abort();
    const controller = new AbortController();
    planningController.current = controller;
    const requestPayload = { ...planningPayload, planningFingerprint };
    setPlanningState('loading');
    setPlanningError('');

    try {
      const response = await fetch('/api/ai/plan-structured', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'We could not prepare the route draft right now.');
      const draft = normalizePlannerDraft(data, requestPayload);
      setPlanningDraft(draft);
      setPlanningState('ready');
      return draft;
    } catch (error) {
      if (error.name === 'AbortError') return null;
      const fallback = createFallbackDraft(requestPayload);
      setPlanningDraft(fallback);
      setPlanningState('error');
      setPlanningError('The AI route review is temporarily unavailable. The travel desk can still refine this draft after you send the enquiry.');
      return fallback;
    }
  };

  const goToStep = async step => {
    if (step > currentStep && !validateStep(currentStep)) return;
    if (step === 2 && currentStep === 1) {
      const sameDestination = destinationGuide?.destination?.trim().toLowerCase() === form.destination.trim().toLowerCase();
      if (guideState !== 'ready' || !sameDestination) {
        await discoverDestinations();
        return;
      }
    }
    if (step === 4 && currentStep === 3) {
      if (!planningDraft || planningDraft.inputFingerprint !== planningFingerprint) await requestRouteDraft();
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const submitEnquiry = async nextDraft => {
    const controller = new AbortController();
    mutationController.current = controller;
    setRequestState('sending');
    setRequestError('');
    const draftReference = nextDraft?.planReference || createDraftReference();
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': draftReference },
        body: JSON.stringify({
          enquiryType: 'Tour Package Enquiry',
          customerName: form.fullName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          emailId: form.email.trim(),
          travelDate: form.travelStartDate || undefined,
          returnDate: form.returnDate || undefined,
          fromLocation: form.departureCity.trim(),
          toLocation: selectedPackage?.destination || selectedPackage?.name,
          numberOfPassengers: totalTravellers,
          adultCount: Number(form.adultCount),
          childCount: Number(form.childWithBedCount || 0) + Number(form.childNoBedCount || 0),
          preferredCategory: selectedPackage?.tourType,
          hotelCategory: form.hotelCategory,
          hotelRooms: Number(form.hotelRooms) || undefined,
          carType: form.vehicleType,
          quoteReference: draftReference,
          selectedDestinations: selectedLabels,
          remarks: form.notes.trim(),
          detailedPreferences: {
            plannerVersion: 3,
            planningMode: 'time-aware route draft',
            destination: form.destination.trim(),
            packageName: selectedPackage?.name,
            durationDays: Number(form.durationDays),
            durationNights: Number(form.durationNights),
            travelStartDate: form.travelStartDate,
            returnDate: form.returnDate,
            durationSource: dateDuration ? 'travel dates' : 'manual duration fallback',
            planningStatus: nextDraft?.planningReview?.status || 'workable',
            unplacedPlaces: nextDraft?.planningReview?.unplacedPlaces || [],
            suggestedRemovals: nextDraft?.planningReview?.suggestedRemovals || [],
            suggestedReplacements: nextDraft?.planningReview?.suggestedReplacements || [],
            contactMethod: form.contactMethod,
            guideRequired: form.guideRequired,
            mealPlan: form.mealPlan,
            entryTickets: form.entryTickets,
            city: form.city.trim()
          }
        })
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'The travel desk could not receive your enquiry.');
      setSubmittedDraft({ ...(nextDraft || {}), planReference: draftReference });
      setEnquirySuccess(true);
      setRequestState('success');
    } catch (error) {
      if (error.name === 'AbortError') return;
      setRequestState('ready');
      setRequestError(error.message || 'The route brief is ready, but the enquiry could not be sent. Try again.');
    }
  };

  const requestQuote = async event => {
    event.preventDefault();
    if (!validateStep(4)) return;
    if (submittedDraft) {
      await submitEnquiry(submittedDraft);
      return;
    }
    const draft = planningDraft?.inputFingerprint === planningFingerprint
      ? planningDraft
      : createFallbackDraft({ ...planningPayload, planningFingerprint });
    setEnquirySuccess(false);
    await submitEnquiry(draft);
  };

  const handleChatSend = async event => {
    event.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || chatLoading) return;
    setChatMessages(previous => [...previous, { role: 'user', content: prompt }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'The assistant is unavailable right now.');
      setChatMessages(previous => [...previous, { role: 'assistant', content: data.response || 'I could not find a useful answer. Try asking about a route, pace or travel style.' }]);
    } catch (error) {
      setChatMessages(previous => [...previous, { role: 'assistant', content: error.message || 'The assistant is unavailable right now. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!submittedDraft) return false;
    setPdfState('loading');
    setRequestError('');
    try {
      await downloadQuotationPdf({
        form,
        draft: submittedDraft,
        selectedPackage,
        selectedDestinations: selectedLabels
      });
      return true;
    } catch {
      setRequestError('We could not prepare the route brief PDF. Please try again.');
      return false;
    } finally {
      setPdfState('idle');
    }
  };

  const startOver = () => {
    guideController.current?.abort();
    planningController.current?.abort();
    setForm(DEFAULT_FORM);
    setDestinationGuide(null);
    setGuideState('idle');
    setGuideError('');
    setSelectedDestinations([]);
    setCustomPlaces([]);
    setCustomPlace('');
    setDestinationSearch('');
    setCurrentStep(1);
    setPlanningDraft(null);
    setSubmittedDraft(null);
    setPlanningState('idle');
    setPlanningError('');
    setPdfState('idle');
    setRequestState('idle');
    setRequestError('');
    setEnquirySuccess(false);
    setFieldErrors({});
    setValidationError('');
  };

  const summaryStops = [
    form.departureCity.trim() || 'Your departure',
    ...selectedLabels.slice(0, 2),
    selectedPackage?.destination || 'Curated route'
  ].filter((value, index, list) => list.indexOf(value) === index);
  const reviewStatus = ['workable', 'tight', 'not_feasible'].includes(activeReview.status) ? activeReview.status : 'workable';
  const reviewStatusCopy = {
    workable: 'Route fits the timing',
    tight: 'Route is ambitious',
    not_feasible: 'Some places need a rethink'
  };

  return (
    <div className="planner-page">
      <div className="container">
        <div className="planner-intro">
          <div>
            <span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>SreePayanam route desk</span>
            <h1>Make room for the <em>good parts.</em></h1>
          </div>
          <p>Choose a destination, mark the places that matter, and get a time-aware route brief you can save as a PDF.</p>
        </div>

        <div className="planner-tabs" role="tablist" aria-label="Planner modes">
          <button type="button" role="tab" aria-selected={activeTab === 'planner'} className={`planner-tab${activeTab === 'planner' ? ' active' : ''}`} onClick={() => setActiveTab('planner')}>
            <Sparkles size={15} aria-hidden="true" /> Build a route
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'chat'} className={`planner-tab${activeTab === 'chat' ? ' active' : ''}`} onClick={() => setActiveTab('chat')}>
            <MessageCircle size={15} aria-hidden="true" /> Ask the assistant
          </button>
        </div>

        {activeTab === 'chat' ? (
          <motion.section className="chat-panel" role="tabpanel" aria-label="Ask the travel assistant" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="chat-log" ref={chatListRef} aria-live="polite">
              {chatMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-message${message.role === 'user' ? ' user' : ''}`}>{message.content}</div>)}
              {chatLoading && <div className="chat-message" role="status">Thinking through the route...</div>}
            </div>
            <form className="chat-form" onSubmit={handleChatSend} noValidate>
              <label className="sr-only" htmlFor="chat-input">Ask the travel assistant</label>
              <input id="chat-input" className="planner-field" value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder="Ask about a route, pace or destination..." />
              <button type="submit" className="btn btn-primary" disabled={chatLoading || !chatInput.trim()} aria-busy={chatLoading} aria-label="Send message"><Send size={17} aria-hidden="true" /></button>
            </form>
          </motion.section>
        ) : (
          <>
            {submittedDraft && (
              <motion.section className="planner-card quote-result route-draft-result" aria-labelledby="route-draft-heading" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="quote-result-top">
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>Route brief ready</span>
                    <h2 id="route-draft-heading">A route shaped around your time.</h2>
                    <p className="quote-reference">Reference {submittedDraft.planReference}</p>
                  </div>
                  <div className={`draft-status-badge status-${reviewStatus}`}><Route size={17} aria-hidden="true" /><span>{reviewStatusCopy[reviewStatus]}</span></div>
                </div>
                {requestError && <div className="form-feedback error" role="alert" style={{ marginTop: '1rem' }}><CircleHelp size={17} aria-hidden="true" />{requestError}</div>}
                {enquirySuccess && <div className="form-feedback success" role="status" style={{ marginTop: '1rem' }}><CheckCircle2 size={17} aria-hidden="true" />Enquiry sent. Keep this reference when you speak with the travel desk.</div>}
                <div className="draft-overview-grid">
                  <div className="quote-panel">
                    <div className="draft-panel-heading"><Compass size={18} aria-hidden="true" /><h3>Route review</h3></div>
                    <p className="draft-overview">{submittedDraft.overview}</p>
                    <div className="draft-review-stats">
                      <div><span>Selected</span><strong>{submittedDraft.planningReview?.selectedPlaceCount || 0}</strong></div>
                      <div><span>Planned</span><strong>{submittedDraft.planningReview?.plannedPlaceCount || 0}</strong></div>
                      <div><span>Time</span><strong>{submittedDraft.durationDays}D / {submittedDraft.durationNights}N</strong></div>
                    </div>
                    {submittedDraft.planningReview?.summary && <p className="draft-review-summary">{submittedDraft.planningReview.summary}</p>}
                    {!!submittedDraft.planningReview?.unplacedPlaces?.length && <div className="draft-review-alert"><strong>Review these places</strong><ul>{submittedDraft.planningReview.unplacedPlaces.map(place => <li key={place}>{place}</li>)}</ul></div>}
                  </div>
                  <div className="quote-panel">
                    <div className="draft-panel-heading"><CalendarDays size={18} aria-hidden="true" /><h3>Day-by-day route</h3></div>
                    <div className="quote-itinerary route-draft-itinerary">
                      {submittedDraft.itinerary.map(day => <article className="quote-day route-draft-day" key={day.day}><span className="quote-day-number">D{day.day}</span><div><div className="route-draft-day-heading"><h4>{day.title}</h4>{day.base && <span>{day.base}</span>}</div><p><strong>Stops</strong> {day.places.length ? day.places.join(' · ') : 'Flexible local discovery'}</p>{day.activities && <p><strong>Plan</strong> {day.activities}</p>}{day.transit && <p><strong>Travel</strong> {day.transit}</p>}{day.meal && <p><strong>Meals</strong> {day.meal}</p>}</div></article>)}
                    </div>
                  </div>
                </div>
                <div className="draft-private-note"><ShieldCheck size={16} aria-hidden="true" /><span>Commercial details are shared separately after the travel desk reviews availability, timing and suppliers.</span></div>
                <div className="quote-result-actions">
                  {requestState === 'ready' && <button type="button" className="btn btn-primary" onClick={() => submitEnquiry(submittedDraft)} disabled={requestState === 'sending'} aria-busy={requestState === 'sending'}><RefreshCw size={16} aria-hidden="true" /> Send enquiry again</button>}
                  <button type="button" className="btn btn-secondary" onClick={downloadPdf} disabled={pdfState === 'loading'} aria-busy={pdfState === 'loading'}><Download size={16} aria-hidden="true" /> {pdfState === 'loading' ? 'Preparing route brief...' : 'Download route brief PDF'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setSubmittedDraft(null); setEnquirySuccess(false); setRequestError(''); setRequestState('idle'); }}>Edit route</button>
                  <button type="button" className="btn btn-ghost" onClick={startOver}>Start a new route</button>
                </div>
              </motion.section>
            )}

            <div className="planner-shell" style={{ marginTop: submittedDraft ? '1.15rem' : 0 }}>
              <section className="planner-card" aria-labelledby="planner-form-heading">
                <div className="planner-stepper" aria-label={`Planner step ${currentStep} of ${STEPS.length}`}>
                  {STEPS.map(step => (
                    <button type="button" key={step.id} className={`planner-step${currentStep === step.id ? ' current' : ''}${currentStep > step.id ? ' done' : ''}`} onClick={() => step.id < currentStep && goToStep(step.id)} disabled={step.id > currentStep} aria-current={currentStep === step.id ? 'step' : undefined}>
                      <span className="step-number">{currentStep > step.id ? <Check size={14} aria-hidden="true" /> : step.id}</span>
                      <span className="step-copy"><strong>{step.name}</strong><small>{step.detail}</small></span>
                    </button>
                  ))}
                </div>

                <form className="planner-body" onSubmit={requestQuote} noValidate>
                  <h2 id="planner-form-heading" className="sr-only">Build a SreePayanam travel route</h2>
                  {validationError && <div className="form-feedback error" role="alert" style={{ marginBottom: '1rem' }}><CircleHelp size={17} aria-hidden="true" />{validationError}</div>}
                  {requestError && !submittedDraft && <div className="form-feedback error" role="alert" style={{ marginBottom: '1rem' }}><CircleHelp size={17} aria-hidden="true" />{requestError}</div>}

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={currentStep} initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? false : { opacity: 0, x: -10 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
                      {currentStep === 1 && (
                        <div>
                          <div className="planner-section-title"><h2>Start with a route</h2><p>Enter any city, region or country. The AI planner will discover places nearby for you to choose.</p></div>
                          <Field id="destination" label="Where do you want to explore?" required error={fieldErrors.destination || guideError} help={guideState === 'loading' ? 'Finding real places in and around this destination…' : guideState === 'error' ? 'Try again, or enter a more specific city or region.' : 'You are not limited to our published packages.'}>
                            <input id="destination" className="planner-field" value={form.destination} onChange={handleDestinationChange} placeholder="e.g. Kyoto, Japan or Munnar, Kerala" autoComplete="address-level2" {...getAria('destination', fieldErrors.destination || guideError)} />
                          </Field>
                          <div className="package-select-card" style={{ marginTop: '1rem' }}>
                            <div><h3>{selectedPackage?.name}</h3><p>{selectedPackage?.description}</p></div>
                            <span className="summary-metric" style={{ color: 'var(--color-ink)', background: 'var(--color-turmeric)', border: 0 }}><span style={{ color: 'rgba(23,38,48,0.62)' }}>Planning timing</span><strong style={{ color: 'var(--color-ink)' }}>{selectedPackage?.durationDays}D / {selectedPackage?.durationNights}N</strong></span>
                          </div>
                          <div className="planner-field-grid" style={{ marginTop: '1.15rem' }}>
                            <Field id="departureCity" label="Where will you start?" help="Optional — we will use the destination if left blank.">
                              <input id="departureCity" className="planner-field" value={form.departureCity} onChange={event => updateField('departureCity', event.target.value)} placeholder="e.g. Chennai" autoComplete="address-level2" />
                            </Field>
                            <Field id="travelStartDate" label="Travel start date" help="Optional — choose both dates to calculate days and nights automatically.">
                              <input id="travelStartDate" name="travelStartDate" className="planner-field" type="date" value={form.travelStartDate} onChange={handleDateChange} {...getAria('travelStartDate', fieldErrors.travelStartDate, 'travelStartDate-help')} />
                            </Field>
                            <Field id="returnDate" label="Return date" error={fieldErrors.returnDate} help={dateDuration ? 'Travel days and hotel nights are calculated from these dates.' : 'Choose both dates to calculate days and nights automatically.'}>
                              <input id="returnDate" name="returnDate" className="planner-field" type="date" value={form.returnDate} onChange={handleDateChange} {...getAria('returnDate', fieldErrors.returnDate, 'returnDate-help')} />
                            </Field>
                            <Field id="durationDays" label="Travel days" required error={fieldErrors.durationDays} help={dateDuration ? 'Set by the travel dates.' : undefined}>
                              <input id="durationDays" className="planner-field" type="number" min="1" max="60" inputMode="numeric" value={form.durationDays} readOnly={Boolean(dateDuration)} aria-readonly={dateDuration ? 'true' : undefined} onChange={event => updateField('durationDays', event.target.value)} {...getAria('durationDays', fieldErrors.durationDays, dateDuration ? 'durationDays-help' : undefined)} />
                            </Field>
                            <Field id="durationNights" label="Hotel nights" error={fieldErrors.durationNights} help={dateDuration ? 'Set by the travel dates.' : 'Optional manual fallback if dates are not set.'}>
                              <input id="durationNights" className="planner-field" type="number" min="0" max="59" inputMode="numeric" value={form.durationNights} readOnly={Boolean(dateDuration)} aria-readonly={dateDuration ? 'true' : undefined} onChange={event => updateField('durationNights', event.target.value)} {...getAria('durationNights', fieldErrors.durationNights, 'durationNights-help')} />
                            </Field>
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div id="destinationPicker" tabIndex="-1" aria-invalid={fieldErrors.destinationPicker ? 'true' : undefined} aria-describedby={fieldErrors.destinationPicker ? 'destinationPicker-error' : undefined}>
                          <div className="planner-section-title"><h2>Discover nearby places</h2><p>Here are real attractions in and around {destinationGuide?.destination || form.destination}. Pick anything you want our travel desk to shape into a route.</p></div>
                          <div className="destination-search-wrap">
                            <Search className="destination-search-icon" size={18} aria-hidden="true" />
                            <label className="sr-only" htmlFor="destination-search">Search every place near this destination</label>
                            <input
                              id="destination-search"
                              className="destination-search-input"
                              type="search"
                              value={destinationSearch}
                              onChange={event => setDestinationSearch(event.target.value)}
                              placeholder="Search every place near this destination"
                              autoComplete="off"
                            />
                            {destinationSearch && <button type="button" className="destination-search-clear" onClick={() => setDestinationSearch('')} aria-label="Clear place search"><X size={16} aria-hidden="true" /></button>}
                          </div>
                          <p className="destination-guide-note" role="status">Showing {visiblePlaceCount} of {totalPlaceCount} available places near {destinationGuide?.destination || form.destination}{destinationSearch ? ` matching “${destinationSearch}”` : ''}. Not finding it? Add it below.</p>
                          <div className="destination-toolbar">
                            <div className="destination-count"><span>{selectedDestinations.length}</span> of {totalPlaceCount} places selected</div>
                            <div className="destination-actions"><button type="button" className="text-action" onClick={selectRecommended}>Select recommended</button><button type="button" className="text-action" onClick={clearDestinations}>Clear selection</button></div>
                          </div>
                          {fieldErrors.destinationPicker && <div id="destinationPicker-error" className="field-error" role="alert" style={{ marginBottom: '0.7rem' }}>{fieldErrors.destinationPicker}</div>}
                          <div className="destination-groups">
                            {visibleDestinationGroups.map(group => <section className="destination-group" key={group.id} aria-labelledby={`group-${group.id}`}><div className="destination-group-header"><h3 id={`group-${group.id}`}>{group.label}</h3><span>{DESTINATION_KIND_LABELS[group.kind] || 'Guide places'}</span></div><div className="destination-list">{group.places.map(place => <label className={`destination-option${selectedDestinations.includes(place.id) ? ' selected' : ''}`} key={place.id}><input type="checkbox" checked={selectedDestinations.includes(place.id)} onChange={() => toggleDestination(place.id)} /><span>{place.label}</span>{place.kind === 'recommended' && <small>route</small>}</label>)}</div></section>)}
                            {visibleCustomPlaces.length > 0 && <section className="destination-group" aria-labelledby="group-custom"><div className="destination-group-header"><h3 id="group-custom">Your additions</h3><span>Added by you</span></div><div className="destination-list">{visibleCustomPlaces.map(place => <label className={`destination-option${selectedDestinations.includes(place.id) ? ' selected' : ''}`} key={place.id}><input type="checkbox" checked={selectedDestinations.includes(place.id)} onChange={() => toggleDestination(place.id)} /><span>{place.label}</span><small>custom</small></label>)}</div></section>}
                            {!visiblePlaceCount && <p className="destination-empty" role="status">No guide places match “{destinationSearch}”. Clear the search or add this place below.</p>}
                          </div>
                          <div className="planner-field-grid" style={{ marginTop: '1rem' }}>
                            <Field id="customPlace" label="Add another place" help="Optional — include a landmark, beach, temple or local stop.">
                              <input id="customPlace" className="planner-field" value={customPlace} onChange={event => setCustomPlace(event.target.value)} placeholder="e.g. Pichavaram mangroves" />
                            </Field>
                            <div style={{ alignSelf: 'end' }}><button className="btn btn-outline" type="button" onClick={addCustomPlace}><MapPin size={16} aria-hidden="true" /> Add place</button></div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div>
                          <div className="planner-section-title"><h2>Set the comfort level</h2><p>These choices help the AI shape a realistic route draft around your pace, stay and movement preferences.</p></div>
                          <div className="planner-field-grid">
                            <Field id="adultCount" label="Adults" required error={fieldErrors.adultCount}><input id="adultCount" className="planner-field" type="number" min="1" max="50" inputMode="numeric" value={form.adultCount} onChange={event => updateField('adultCount', event.target.value)} {...getAria('adultCount', fieldErrors.adultCount)} /></Field>
                            <Field id="childWithBedCount" label="Children with bed"><input id="childWithBedCount" className="planner-field" type="number" min="0" max="30" inputMode="numeric" value={form.childWithBedCount} onChange={event => updateField('childWithBedCount', event.target.value)} /></Field>
                            <Field id="childNoBedCount" label="Children without bed"><input id="childNoBedCount" className="planner-field" type="number" min="0" max="30" inputMode="numeric" value={form.childNoBedCount} onChange={event => updateField('childNoBedCount', event.target.value)} /></Field>
                            <Field id="infantCount" label="Infants"><input id="infantCount" className="planner-field" type="number" min="0" max="20" inputMode="numeric" value={form.infantCount} onChange={event => updateField('infantCount', event.target.value)} /></Field>
                          </div>
                          <div className="planner-field-grid" style={{ marginTop: '1rem' }}>
                            <Field id="hotelCategory" label="Hotel comfort"><select id="hotelCategory" className="planner-select" value={form.hotelCategory} onChange={event => updateField('hotelCategory', event.target.value)}><option>Budget</option><option>3 Star</option><option>4 Star</option><option>5 Star</option></select></Field>
                            <Field id="hotelRooms" label="Rooms"><input id="hotelRooms" className="planner-field" type="number" min="0" max="30" inputMode="numeric" placeholder="Auto-size from adults" value={form.hotelRooms} onChange={event => updateField('hotelRooms', event.target.value)} /></Field>
                            <Field id="mealPlan" label="Meal preference"><select id="mealPlan" className="planner-select" value={form.mealPlan} onChange={event => updateField('mealPlan', event.target.value)}><option value="EP">EP — room only</option><option value="CP">CP — breakfast</option><option value="MAP">MAP — breakfast + dinner</option><option value="AP">AP — all meals</option></select></Field>
                            <Field id="vehicleType" label="Local transport"><select id="vehicleType" className="planner-select" value={form.vehicleType} onChange={event => updateField('vehicleType', event.target.value)}><option>Sedan</option><option>Ertiga</option><option>Innova</option><option>Tempo Traveller</option><option>Mini Coach</option><option>Coach</option></select></Field>
                          </div>
                          <div style={{ marginTop: '1rem' }}><span className="field-label">Add-ons for the route draft</span><div className="choice-row"><label className={`choice-card${form.guideRequired === 'Yes' ? ' selected' : ''}`}><input type="radio" name="guideRequired" checked={form.guideRequired === 'Yes'} onChange={() => updateField('guideRequired', 'Yes')} /><strong><Hotel size={16} aria-hidden="true" /> Local guide</strong><span>Include guide support in the route brief.</span></label><label className={`choice-card${form.guideRequired === 'No' ? ' selected' : ''}`}><input type="radio" name="guideRequired" checked={form.guideRequired === 'No'} onChange={() => updateField('guideRequired', 'No')} /><strong><MapPin size={16} aria-hidden="true" /> Self-guided</strong><span>Keep the route flexible.</span></label><label className={`choice-card${form.entryTickets === 'Yes' ? ' selected' : ''}`}><input type="checkbox" checked={form.entryTickets === 'Yes'} onChange={event => updateField('entryTickets', event.target.checked ? 'Yes' : 'No')} /><strong><FileText size={16} aria-hidden="true" /> Entry tickets</strong><span>Keep activity preferences visible to the travel desk.</span></label></div></div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div>
                          <div className="planner-section-title"><h2>Where should we send it?</h2><p>We use these details to prepare the enquiry and keep the route brief reference connected to your draft.</p></div>
                          <div className={`planning-review status-${reviewStatus}`} aria-live="polite">
                            <div className="planning-review-header"><span className="planning-review-icon"><Route size={18} aria-hidden="true" /></span><div><span className="planning-review-kicker">AI route review</span><h3>{reviewStatusCopy[reviewStatus]}</h3></div></div>
                            <p className="planning-review-summary">{activeReview.summary}</p>
                            <div className="planning-review-stats"><div><span>Selected places</span><strong>{activeReview.selectedPlaceCount}</strong></div><div><span>Planned stops</span><strong>{activeReview.plannedPlaceCount}</strong></div><div><span>Timing</span><strong>{form.durationDays}D / {form.durationNights}N</strong></div></div>
                            {planningError && <div className="planning-review-warning" role="status"><CircleHelp size={16} aria-hidden="true" />{planningError}</div>}
                            {!!activeReview.unplacedPlaces?.length && <div className="planning-review-items"><div className="planning-review-list"><strong>Consider removing</strong><ul>{(activeReview.suggestedRemovals?.length ? activeReview.suggestedRemovals : activeReview.unplacedPlaces.map(place => ({ place }))).map(item => <li key={`unplaced-${item.place}`}><span>{item.place}</span>{item.reason && <small>{item.reason}</small>}</li>)}</ul></div>{!!activeReview.suggestedReplacements?.length && <div className="planning-review-list"><strong>Possible alternatives</strong><ul>{activeReview.suggestedReplacements.map(item => <li key={`replacement-${item.place}-${item.replacement || ''}`}><span>{item.replacement ? `${item.place} → ${item.replacement}` : item.place}</span>{item.reason && <small>{item.reason}</small>}</li>)}</ul></div>}</div>}
                            {!!activeItinerary.length && <div className="planning-review-itinerary"><strong>Draft day order</strong><ol>{activeItinerary.map(day => <li key={`draft-day-${day.day}`}><span>D{day.day}</span><div><b>{day.title}</b><small>{day.places?.length ? day.places.join(' · ') : 'Flexible local discovery'}</small></div></li>)}</ol></div>}
                          </div>
                          <div className="planner-field-grid">
                            <Field id="fullName" label="Full name" required error={fieldErrors.fullName}><input id="fullName" className="planner-field" autoComplete="name" value={form.fullName} onChange={event => updateField('fullName', event.target.value)} {...getAria('fullName', fieldErrors.fullName)} /></Field>
                            <Field id="mobileNumber" label="Mobile number" required error={fieldErrors.mobileNumber}><input id="mobileNumber" className="planner-field" type="tel" inputMode="tel" autoComplete="tel" value={form.mobileNumber} onChange={event => updateField('mobileNumber', event.target.value)} {...getAria('mobileNumber', fieldErrors.mobileNumber)} /></Field>
                            <Field id="email" label="Email address" required error={fieldErrors.email}><input id="email" className="planner-field" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={event => updateField('email', event.target.value)} {...getAria('email', fieldErrors.email)} /></Field>
                            <Field id="city" label="Your city"><input id="city" className="planner-field" autoComplete="address-level2" value={form.city} onChange={event => updateField('city', event.target.value)} /></Field>
                            <Field id="contactMethod" label="Preferred reply"><select id="contactMethod" className="planner-select" value={form.contactMethod} onChange={event => updateField('contactMethod', event.target.value)}><option>WhatsApp</option><option>Phone call</option><option>Email</option></select></Field>
                          <Field id="notes" label="Anything we should know?" className="span-2" help="Optional — accessibility, food, timing or special arrangements."><textarea id="notes" className="planner-textarea resize-none" rows="4" value={form.notes} onChange={event => updateField('notes', event.target.value)} /></Field>
                          </div>
                          <label className="destination-option" style={{ marginTop: '1rem', alignItems: 'flex-start' }}><input id="consent" type="checkbox" checked={form.consent} onChange={event => updateField('consent', event.target.checked)} {...getAria('consent', fieldErrors.consent)} /><span><strong>Use my details to prepare this travel enquiry.</strong><br /><small>We will use your name, contact details and route choices only to respond about this request.</small>{fieldErrors.consent && <em id="consent-error" className="field-error" style={{ fontStyle: 'normal' }}>{fieldErrors.consent}</em>}</span></label>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="planner-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => currentStep === 1 ? window.history.back() : goToStep(currentStep - 1)} disabled={planningState === 'loading' || requestState === 'sending'}><ArrowLeft size={16} aria-hidden="true" /> {currentStep === 1 ? 'Leave planner' : 'Back'}</button>
                    {currentStep < 4 ? <button type="button" className="btn btn-primary" onClick={() => goToStep(currentStep + 1)} disabled={guideState === 'loading' || (currentStep === 3 && planningState === 'loading')} aria-busy={guideState === 'loading' || (currentStep === 3 && planningState === 'loading')}>{currentStep === 1 && guideState === 'loading' ? 'Finding nearby places...' : currentStep === 3 && planningState === 'loading' ? 'Mapping your days...' : 'Continue'} <ArrowRight size={16} aria-hidden="true" /></button> : <button type="submit" className="btn btn-primary" disabled={requestState === 'sending' || requestState === 'success'} aria-busy={requestState === 'sending'}>{requestState === 'sending' ? 'Sending enquiry...' : requestState === 'success' ? 'Enquiry sent' : submittedDraft ? 'Send enquiry again' : 'Send route enquiry'} <ArrowRight size={16} aria-hidden="true" /></button>}
                  </div>
                </form>
              </section>

              <aside className="planner-summary" aria-label="Live route summary">
                <div className="planner-summary-inner">
                  <span className="summary-kicker">Route note / live draft</span>
                  <h2>{selectedPackage?.name || 'Your SreePayanam route'}</h2>
                  <div className="summary-route">{summaryStops.slice(0, 4).map((stop, index) => <div className="summary-stop" key={`${stop}-${index}`}><strong>{stop}</strong>{index === 0 ? 'Departure' : index === summaryStops.length - 1 ? 'Destination' : 'Selected stop'}</div>)}</div>
                  <div className="summary-metrics"><div className="summary-metric"><span>Travellers</span><strong>{Math.max(1, totalTravellers)}</strong></div><div className="summary-metric"><span>Trip length</span><strong>{form.durationDays}D / {form.durationNights}N</strong></div><div className="summary-metric"><span>Places</span><strong>{selectedDestinations.length}</strong></div><div className="summary-metric"><span>Stay</span><strong>{form.hotelCategory}</strong></div></div>
                  <div className="route-draft-visual" aria-label="Route draft status">
                    <div className="route-draft-map" aria-hidden="true"><span className="route-draft-node one" /><span className="route-draft-node two" /><span className="route-draft-node three" /><span className="route-draft-route" /></div>
                    <div className="route-draft-copy"><span>Route draft</span><strong>{planningState === 'loading' ? 'Mapping your days...' : planningDraft ? 'Clustered by place' : 'Ready to map'}</strong><p>{planningDraft ? 'Nearby stops are being shaped into a calmer day-by-day brief.' : 'Your selected places will become a considered travel-desk brief.'}</p></div>
                    <div className="route-draft-signals"><span><Route size={13} aria-hidden="true" /> Time aware</span><span><Compass size={13} aria-hidden="true" /> Less backtracking</span><span><CalendarDays size={13} aria-hidden="true" /> {form.durationDays} days</span></div>
                  </div>
                  <p className="summary-note"><ShieldCheck size={14} aria-hidden="true" /> Commercial details are handled separately by the travel desk.</p>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
