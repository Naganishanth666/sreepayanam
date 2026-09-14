import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CircleHelp, Download,
  FileText, Hotel, MapPin, MessageCircle, RefreshCw, Send, ShieldCheck,
  Search, Sparkles, X
} from 'lucide-react';
import {
  DESTINATION_CATALOG,
  DESTINATION_KIND_LABELS,
  flattenDestinationGroups
} from '../data/destinationCatalog';
import { calculateCosting } from '../utils/costingEngine';
import { downloadQuotationPdf } from '../utils/quotationPdf';

const STEPS = [
  { id: 1, name: 'Route', detail: 'Destination & dates' },
  { id: 2, name: 'Explore', detail: 'Nearby places' },
  { id: 3, name: 'Comfort', detail: 'Stay & movement' },
  { id: 4, name: 'Contact', detail: 'Get the quote' }
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

const formatINR = value => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

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
      places: dayItems.join(' · ')
    };
  });
};

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
      ? group.places.map(place => typeof place === 'string' ? place.trim() : '').filter(Boolean).slice(0, 24)
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
  const [quote, setQuote] = useState(null);
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

  const pricingParams = useMemo(() => ({
    adultCount: form.adultCount,
    childWithBedCount: form.childWithBedCount,
    childNoBedCount: form.childNoBedCount,
    infantCount: form.infantCount,
    durationDays: form.durationDays,
    durationNights: form.durationNights,
    hotelCategory: form.hotelCategory,
    hotelRooms: form.hotelRooms,
    vehicleType: form.vehicleType,
    vehicleDays: form.durationDays,
    mealPlan: form.mealPlan,
    mealNights: form.durationNights,
    guideCostPerDay: form.guideRequired === 'Yes' ? 1000 : 0,
    sightseeingCostPerPax: selectedLabels.length ? 600 : 500,
    activityCostPerPax: form.entryTickets === 'Yes' ? 500 : 150,
    bufferPercent: 3,
    markupPercent: 30,
    taxPercent: 5
  }), [form, selectedLabels.length]);

  const liveEstimate = useMemo(() => calculateCosting(pricingParams), [pricingParams]);
  const itinerary = useMemo(() => buildItinerary(selectedLabels, form.durationDays), [selectedLabels, form.durationDays]);
  const totalTravellers = Number(form.adultCount || 0) + Number(form.childWithBedCount || 0) + Number(form.childNoBedCount || 0) + Number(form.infantCount || 0);
  const visibleTotal = quote?.customerPrice || liveEstimate.customerPrice;

  useEffect(() => () => {
    mutationController.current?.abort();
    guideController.current?.abort();
  }, []);

  useEffect(() => {
    if (chatListRef.current) chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  const invalidateQuote = () => {
    setQuote(null);
    setEnquirySuccess(false);
    setRequestError('');
    if (requestState !== 'idle') setRequestState('idle');
  };

  const updateField = (name, value) => {
    setForm(previous => ({ ...previous, [name]: value }));
    setFieldErrors(previous => ({ ...previous, [name]: '' }));
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
    invalidateQuote();
  };

  const selectRecommended = () => {
    const recommended = allDestinations.filter(place => place.kind === 'recommended').map(place => place.id);
    setSelectedDestinations(recommended);
    invalidateQuote();
  };

  const clearDestinations = () => {
    setSelectedDestinations([]);
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
      invalidateQuote();
      return;
    }

    const item = { id: `custom-${Date.now()}`, label, groupId: 'custom', kind: 'optional' };
    setCustomPlaces(previous => [...previous, item]);
    setSelectedDestinations(previous => [...previous, item.id]);
    setCustomPlace('');
    setDestinationSearch('');
    setFieldErrors(previous => ({ ...previous, destinationPicker: '' }));
    invalidateQuote();
  };

  const validateStep = step => {
    const errors = {};
    if (step === 1) {
      if (!form.destination.trim()) errors.destination = 'Enter a city, region or country to continue.';
      if (!Number(form.durationDays) || Number(form.durationDays) < 1) errors.durationDays = 'Add at least one travel day.';
      if (form.travelStartDate && form.returnDate && new Date(form.returnDate).getTime() < new Date(form.travelStartDate).getTime()) errors.returnDate = 'Return date must be on or after the start date.';
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
      if (!form.consent) errors.consent = 'Please allow us to use these details to prepare your quote.';
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

  const goToStep = async step => {
    if (step > currentStep && !validateStep(currentStep)) return;
    if (step === 2 && currentStep === 1) {
      const sameDestination = destinationGuide?.destination?.trim().toLowerCase() === form.destination.trim().toLowerCase();
      if (guideState !== 'ready' || !sameDestination) {
        await discoverDestinations();
        return;
      }
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const buildQuotePayload = () => ({
    packageId: selectedPackage?.packageId || selectedPackage?.id,
    packageName: selectedPackage?.name,
    selectedDestinations: selectedLabels,
    ...pricingParams
  });

  const submitEnquiry = async nextQuote => {
    const controller = new AbortController();
    mutationController.current = controller;
    setRequestState('sending');
    setRequestError('');
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': nextQuote.quoteReference },
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
          quoteReference: nextQuote.quoteReference,
          quotedAmount: nextQuote.customerPrice,
          quoteIssuedAt: nextQuote.issuedAt,
          selectedDestinations: selectedLabels,
          remarks: form.notes.trim(),
          detailedPreferences: {
            plannerVersion: 2,
            destination: form.destination.trim(),
            packageName: selectedPackage?.name,
            durationDays: Number(form.durationDays),
            durationNights: Number(form.durationNights),
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
      setEnquirySuccess(true);
      setRequestState('success');
    } catch (error) {
      if (error.name === 'AbortError') return;
      setRequestState('ready');
      setRequestError(error.message || 'The quote is ready, but the enquiry could not be sent. Try again.');
    }
  };

  const requestQuote = async event => {
    event.preventDefault();
    if (!validateStep(4)) return;
    if (quote) {
      await submitEnquiry(quote);
      return;
    }

    const controller = new AbortController();
    mutationController.current = controller;
    setRequestState('quoting');
    setRequestError('');
    setEnquirySuccess(false);
    try {
      const response = await fetch('/api/quotations/preview', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildQuotePayload())
      });
      const data = await safeJson(response);
      if (!response.ok || !data.quote) throw new Error(data.message || 'We could not calculate this estimate.');
      setQuote(data.quote);
      await submitEnquiry(data.quote);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setRequestState('idle');
      setRequestError(error.message || 'We could not calculate this estimate. Check the details and try again.');
    }
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

  const downloadPdf = () => downloadQuotationPdf({
    form,
    quote,
    selectedPackage,
    selectedDestinations: selectedLabels,
    itinerary
  });

  const startOver = () => {
    guideController.current?.abort();
    setForm(DEFAULT_FORM);
    setDestinationGuide(null);
    setGuideState('idle');
    setGuideError('');
    setSelectedDestinations([]);
    setCustomPlaces([]);
    setCustomPlace('');
    setDestinationSearch('');
    setCurrentStep(1);
    setQuote(null);
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

  return (
    <div className="planner-page">
      <div className="container">
        <div className="planner-intro">
          <div>
            <span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>SreePayanam route desk</span>
            <h1>Make room for the <em>good parts.</em></h1>
          </div>
          <p>Choose a route, mark the places that matter, and get a customer-facing estimate you can save as a PDF.</p>
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
            {quote && (
              <motion.section className="planner-card quote-result" aria-labelledby="quote-heading" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="quote-result-top">
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>Your route note</span>
                    <h2 id="quote-heading">The plan is taking shape.</h2>
                    <p className="quote-reference">Reference {quote.quoteReference}</p>
                  </div>
                  <div className="quote-price">{formatINR(quote.customerPrice)}<small>customer estimate</small></div>
                </div>
                {requestError && <div className="form-feedback error" role="alert" style={{ marginTop: '1rem' }}><CircleHelp size={17} aria-hidden="true" />{requestError}</div>}
                {enquirySuccess && <div className="form-feedback success" role="status" style={{ marginTop: '1rem' }}><CheckCircle2 size={17} aria-hidden="true" />Enquiry sent. Keep this reference when you speak with the travel desk.</div>}
                <div className="quote-grid">
                  <div className="quote-panel">
                    <h3>Customer-facing estimate</h3>
                    <ul className="quote-breakdown">
                      {(quote.breakdown || []).map(item => <li key={item.label}><span>{item.label}</span><strong>{formatINR(item.amount)}</strong></li>)}
                      <li><span>{quote.tax?.label || 'Estimated taxes'}</span><strong>{formatINR(quote.tax?.amount)}</strong></li>
                    </ul>
                    <p style={{ marginTop: '0.8rem', color: 'var(--color-muted)', fontSize: '0.75rem' }}>{quote.disclaimer}</p>
                  </div>
                  <div className="quote-panel">
                    <h3>Proposed day plan</h3>
                    <div className="quote-itinerary">
                      {itinerary.slice(0, 6).map(day => <div className="quote-day" key={day.day}><span className="quote-day-number">D{day.day}</span><div><h4>{day.title}</h4><p>{day.places}</p></div></div>)}
                    </div>
                  </div>
                </div>
                <div className="quote-result-actions">
                  {requestState === 'ready' && <button type="button" className="btn btn-primary" onClick={() => submitEnquiry(quote)} disabled={requestState === 'sending'} aria-busy={requestState === 'sending'}><RefreshCw size={16} aria-hidden="true" /> Send enquiry again</button>}
                  <button type="button" className="btn btn-secondary" onClick={downloadPdf}><Download size={16} aria-hidden="true" /> Download quotation PDF</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setQuote(null); setEnquirySuccess(false); setRequestError(''); setRequestState('idle'); }}>Edit route</button>
                  <button type="button" className="btn btn-ghost" onClick={startOver}>Start a new route</button>
                </div>
              </motion.section>
            )}

            <div className="planner-shell" style={{ marginTop: quote ? '1.15rem' : 0 }}>
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
                  {requestError && !quote && <div className="form-feedback error" role="alert" style={{ marginBottom: '1rem' }}><CircleHelp size={17} aria-hidden="true" />{requestError}</div>}

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
                            <Field id="travelStartDate" label="Travel start date">
                              <input id="travelStartDate" className="planner-field" type="date" value={form.travelStartDate} onChange={event => updateField('travelStartDate', event.target.value)} {...getAria('travelStartDate', fieldErrors.travelStartDate)} />
                            </Field>
                            <Field id="returnDate" label="Return date" error={fieldErrors.returnDate}>
                              <input id="returnDate" className="planner-field" type="date" value={form.returnDate} onChange={event => updateField('returnDate', event.target.value)} {...getAria('returnDate', fieldErrors.returnDate)} />
                            </Field>
                            <Field id="durationDays" label="Travel days" required error={fieldErrors.durationDays}>
                              <input id="durationDays" className="planner-field" type="number" min="1" max="60" inputMode="numeric" value={form.durationDays} onChange={event => updateField('durationDays', event.target.value)} {...getAria('durationDays', fieldErrors.durationDays)} />
                            </Field>
                            <Field id="durationNights" label="Hotel nights" error={fieldErrors.durationNights}>
                              <input id="durationNights" className="planner-field" type="number" min="0" max="59" inputMode="numeric" value={form.durationNights} onChange={event => updateField('durationNights', event.target.value)} {...getAria('durationNights', fieldErrors.durationNights)} />
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
                          <div className="planner-section-title"><h2>Set the comfort level</h2><p>These choices power the live planning estimate. The final commercial quote is calculated on the server.</p></div>
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
                          <div style={{ marginTop: '1rem' }}><span className="field-label">Add-ons for the estimate</span><div className="choice-row"><label className={`choice-card${form.guideRequired === 'Yes' ? ' selected' : ''}`}><input type="radio" name="guideRequired" checked={form.guideRequired === 'Yes'} onChange={() => updateField('guideRequired', 'Yes')} /><strong><Hotel size={16} aria-hidden="true" /> Local guide</strong><span>Include guide support in the estimate.</span></label><label className={`choice-card${form.guideRequired === 'No' ? ' selected' : ''}`}><input type="radio" name="guideRequired" checked={form.guideRequired === 'No'} onChange={() => updateField('guideRequired', 'No')} /><strong><MapPin size={16} aria-hidden="true" /> Self-guided</strong><span>Keep the route flexible.</span></label><label className={`choice-card${form.entryTickets === 'Yes' ? ' selected' : ''}`}><input type="checkbox" checked={form.entryTickets === 'Yes'} onChange={event => updateField('entryTickets', event.target.checked ? 'Yes' : 'No')} /><strong><FileText size={16} aria-hidden="true" /> Entry tickets</strong><span>Include a standard activity allowance.</span></label></div></div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div>
                          <div className="planner-section-title"><h2>Where should we send it?</h2><p>We use these details to prepare the enquiry and keep the quote reference connected to your route.</p></div>
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
                    <button type="button" className="btn btn-ghost" onClick={() => currentStep === 1 ? window.history.back() : goToStep(currentStep - 1)} disabled={requestState === 'quoting' || requestState === 'sending'}><ArrowLeft size={16} aria-hidden="true" /> {currentStep === 1 ? 'Leave planner' : 'Back'}</button>
                    {currentStep < 4 ? <button type="button" className="btn btn-primary" onClick={() => goToStep(currentStep + 1)} disabled={guideState === 'loading'} aria-busy={guideState === 'loading'}>{currentStep === 1 && guideState === 'loading' ? 'Finding nearby places...' : 'Continue'} <ArrowRight size={16} aria-hidden="true" /></button> : <button type="submit" className="btn btn-primary" disabled={requestState === 'quoting' || requestState === 'sending' || requestState === 'success'} aria-busy={requestState === 'quoting' || requestState === 'sending'}>{requestState === 'quoting' ? 'Calculating estimate...' : requestState === 'sending' ? 'Sending enquiry...' : requestState === 'success' ? 'Enquiry sent' : quote ? 'Send enquiry again' : 'Generate quotation'} <ArrowRight size={16} aria-hidden="true" /></button>}
                  </div>
                </form>
              </section>

              <aside className="planner-summary" aria-label="Live route summary">
                <div className="planner-summary-inner">
                  <span className="summary-kicker">Route note / live draft</span>
                  <h2>{selectedPackage?.name || 'Your SreePayanam route'}</h2>
                  <div className="summary-route">{summaryStops.slice(0, 4).map((stop, index) => <div className="summary-stop" key={`${stop}-${index}`}><strong>{stop}</strong>{index === 0 ? 'Departure' : index === summaryStops.length - 1 ? 'Destination' : 'Selected stop'}</div>)}</div>
                  <div className="summary-metrics"><div className="summary-metric"><span>Travellers</span><strong>{Math.max(1, totalTravellers)}</strong></div><div className="summary-metric"><span>Trip length</span><strong>{form.durationDays}D / {form.durationNights}N</strong></div><div className="summary-metric"><span>Places</span><strong>{selectedDestinations.length}</strong></div><div className="summary-metric"><span>Stay</span><strong>{form.hotelCategory}</strong></div></div>
                  <div className="estimate-box"><p>{quote ? 'Server-confirmed customer estimate' : 'Live planning estimate'}</p><strong>{formatINR(visibleTotal)}</strong><small>Includes a 3% planning buffer and 5% estimated tax. Final availability and commercial confirmation come from the travel desk.</small></div>
                  <p className="summary-note"><ShieldCheck size={14} aria-hidden="true" /> Your PDF keeps supplier cost and internal pricing out of the customer view.</p>
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
