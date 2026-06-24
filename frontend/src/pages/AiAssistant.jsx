import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Bot, User, MapPin, Clock, Plane, Train, Car,
  Home, Utensils, Download, Phone, ArrowRight, ChevronDown, ChevronUp,
  RefreshCw, FileText, CheckCircle, XCircle, Users, Calendar, AlertCircle,
  Briefcase, Shield, Globe, Check, ChevronLeft, MessageSquare, Info
} from 'lucide-react';

const AiAssistant = () => {
  // Tab control: 'guided' or 'chat'
  const [activeTab, setActiveTab] = useState('guided');
  
  // Wizard current step: 1 to 5
  const [currentStep, setCurrentStep] = useState(1);

  // Guided planner 10-section form state
  const [form, setForm] = useState({
    // Section 1: Customer Details
    full_name: '',
    mobile_number: '',
    whatsapp_number: '',
    email: '',
    location: '',
    contact_method: 'WhatsApp',

    // Section 2: Trip Details
    travel_category: 'National',
    tour_type: 'Family Tours',
    departure_city: '',
    destination_places: '',
    suggest_destination: false,
    travel_start_date: '',
    return_date: '',
    num_days: 5,
    num_nights: 4,
    date_flexibility: 'Exact Dates',

    // Section 3: Passenger Details
    total_passengers: 2,
    num_male: 1,
    num_female: 1,
    num_children: 0,
    children_ages: '',
    num_infants: 0,
    infant_ages: '',
    num_seniors: 0,
    special_assistance: '',

    // Section 4: Hotel Requirement
    hotel_required: 'Yes',
    hotel_category: '3-Star',
    room_type: 'Double',
    num_rooms: 1,
    extra_bed: 'No',
    child_with_bed: 0,
    child_without_bed: 0,
    preferred_location: '',
    lift_required: false,
    wheelchair_friendly: false,

    // Section 5: Meal Plan
    meal_required: 'Yes',
    meal_plan: 'MAP (Breakfast + Dinner)',
    food_preference: 'Veg',
    special_meal: '',

    // Section 6: Transport Requirement
    flight_ticket: false,
    train_ticket: false,
    bus_ticket: false,
    local_transport: 'Sedan',
    airport_pickup_drop: true,
    vehicle_category: 'Budget',
    ac_preference: 'AC',
    transport_type: 'Private',
    pickup_location: '',
    drop_location: '',
    luggage_details: '',
    driver_language: 'English',

    // Section 7: Sightseeing & Activities
    places_to_cover: '',
    travel_pace: 'Moderate',
    interest_type: 'Nature',
    guide_required: 'No',
    entry_tickets: true,
    special_darshan: false,
    ritual_pooja: false,

    // Section 8: Visa, Passport & Insurance
    passport_available: 'No',
    passport_validity: '',
    visa_assistance: 'No',
    travel_insurance: 'No',
    insurance_type: 'Standard',
    nationality: 'Indian',
    residence_country: 'India',

    // Section 9: Budget & Pricing Preference
    budget_type: 'Standard',
    approx_budget: '',
    currency: 'INR',
    price_preference: 'Per Person',
    inclusions_preference: '',

    // Section 10: Special Requirements
    special_arrangement: '',
    language_preference: 'English',
    emergency_contact: '',
    other_request: ''
  });

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am the Sreepayanam AI Travel Assistant. Tell me what kind of trip you are looking for, and I will find the perfect package for you!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatListRef = useRef(null);

  // Guided planner result / status
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [planResult, setPlanResult] = useState(null);
  const [openDay, setOpenDay] = useState(0);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Auto-scroll chat list
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  // Loading animation phrases
  const loadingPhrases = [
    'Scanning premium destination maps...',
    'Matching best flights and connection routing...',
    'Curating handpicked hotels & local homestays...',
    'Sourcing authentic local dining recommendations...',
    'Assembling a custom day-by-day travel timeline...',
    'Submitting your detailed inquiry to our booking desk...',
    'Finalizing details for your perfect getaway...'
  ];

  useEffect(() => {
    let interval;
    if (plannerLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingPhrases.length - 1 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [plannerLoading]);

  // Validate fields for a specific wizard step
  const validateStep = (step) => {
    setValidationError('');
    if (step === 1) {
      if (!form.full_name.trim()) return 'Please enter your Full Name.';
      if (!form.mobile_number.trim()) return 'Please enter your Mobile Number.';
      if (!form.email.trim()) return 'Please enter your Email Address.';
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid Email Address.';
    } else if (step === 2) {
      if (!form.destination_places.trim()) return 'Please specify your target Destination(s).';
      if (!form.total_passengers || form.total_passengers < 1) return 'Passenger count must be at least 1.';
    }
    return '';
  };

  const handleNextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setValidationError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle guided planner generation & auto-submits lead
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      return;
    }

    setPlannerLoading(true);
    setPlanResult(null);
    setEnquirySuccess(false);

    try {
      // 1. Submit lead to CRM database first
      const remarks = `AI-Generated Tour Planner Lead:
- Category: ${form.travel_category} (${form.tour_type})
- Route: ${form.departure_city || 'Anywhere'} → ${form.destination_places}
- Budget Category: ${form.budget_type} (${form.approx_budget ? `${form.currency} ${form.approx_budget}` : 'Not Specified'})
- Transport Requested: ${form.local_transport} (AC: ${form.ac_preference}, Type: ${form.transport_type})
- Sightseeing Pace: ${form.travel_pace}
- Meals: ${form.meal_required === 'Yes' ? `${form.meal_plan} (${form.food_preference})` : 'None'}
- Special Wishes: ${form.special_arrangement || 'None'}
- Client Notes: ${form.other_request || 'None'}`;

      const enquiryPayload = {
        enquiryType: 'Tour Package Enquiry',
        customerName: form.full_name,
        mobileNumber: form.mobile_number,
        emailId: form.email,
        travelDate: form.travel_start_date ? new Date(form.travel_start_date) : undefined,
        returnDate: form.return_date ? new Date(form.return_date) : undefined,
        fromLocation: form.departure_city,
        toLocation: form.destination_places,
        numberOfPassengers: form.total_passengers,
        adultCount: form.num_male + form.num_female + form.num_seniors,
        childCount: form.num_children,
        budget: form.approx_budget ? Number(form.approx_budget) : undefined,
        preferredCategory: form.budget_type,
        hotelCategory: form.hotel_category,
        hotelRooms: form.num_rooms,
        carType: form.local_transport,
        remarks: remarks,
        detailedPreferences: form
      };

      const enquiryRes = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryPayload)
      });

      if (enquiryRes.ok) {
        setEnquirySuccess(true);
      } else {
        console.warn('Could not register CRM lead. Proceeding to compile itinerary anyway...');
      }

      // 2. Fetch AI Custom Itinerary
      const res = await fetch('/api/ai/plan-structured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to compile itinerary');
      setPlanResult(data);
      setOpenDay(0);
    } catch (err) {
      alert(`Error generating plan: ${err.message}`);
    } finally {
      setPlannerLoading(false);
    }
  };

  // Handle chat submission
  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error communicating with assistant');
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}. Please try again.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper to trigger Itinerary download as structured text file
  const downloadItineraryText = () => {
    if (!planResult) return;

    let text = `==================================================\n`;
    text += `   SreePayanam Tours & Travels AI Custom Itinerary\n`;
    text += `==================================================\n\n`;
    text += `Title: ${planResult.title}\n`;
    text += `Destination: ${planResult.destination}\n`;
    text += `Start Point: ${planResult.startingCity || 'Not Specified'} -> End Point: ${planResult.endingCity || 'Not Specified'}\n`;
    text += `Duration: ${planResult.durationDays} Days / ${planResult.durationNights} Nights\n`;
    text += `Price Estimate: ${planResult.estimatedPrice}\n\n`;
    text += `--------------------------------------------------\n`;
    text += `Overview:\n${planResult.overview}\n`;
    text += `--------------------------------------------------\n\n`;
    text += `DAILY TIMELINE:\n`;

    planResult.itinerary.forEach(day => {
      text += `Day ${day.day}: ${day.title}\n`;
      text += `Activities: ${day.activities}\n`;
      if (day.hotel?.name) {
        text += `Stay: ${day.hotel.name} (${day.hotel.rating}) - ${day.hotel.desc}\n`;
      }
      if (day.meal) {
        text += `Dining recommendation: ${day.meal}\n`;
      }
      if (day.transit) {
        text += `Transit: ${day.transit}\n`;
      }
      text += `\n`;
    });

    text += `--------------------------------------------------\n`;
    text += `INCLUSIONS:\n`;
    planResult.inclusions.forEach(item => text += `- ${item}\n`);
    text += `\nEXCLUSIONS:\n`;
    planResult.exclusions.forEach(item => text += `- ${item}\n`);
    text += `\n==================================================\n`;
    text += `Generated via SreePayanam AI Assistant. Booked!\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SreePayanam_Itinerary_${planResult.destination.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatChatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        <br/>
      </span>
    ));
  };

  const steps = [
    { id: 1, name: 'Customer Info', icon: <User size={16} /> },
    { id: 2, name: 'Trip & Passengers', icon: <MapPin size={16} /> },
    { id: 3, name: 'Hotel & Meals', icon: <Home size={16} /> },
    { id: 4, name: 'Transit & Activities', icon: <Plane size={16} /> },
    { id: 5, name: 'Visa & Budget', icon: <Briefcase size={16} /> }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 100, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 1050, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Top Header Card */}
        <div className="glass-card" style={{ padding: '24px 32px', marginBottom: 28, background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, border: '1px solid #cbd5e1' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: 8, borderRadius: 10, display: 'flex' }}>
                <Sparkles size={20} />
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>AI Travel Planner</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>Create a fully custom, interactive trip itinerary instantly or chat with our travel expert bot.</p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', background: '#eff6ff', borderRadius: 24, padding: 4 }}>
            <button
              onClick={() => setActiveTab('guided')}
              style={{
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === 'guided' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'guided' ? 'white' : 'var(--primary)'
              }}
            >
              📋 Guided Planner Form
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === 'chat' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'chat' ? 'white' : 'var(--primary)'
              }}
            >
              💬 Conversational Bot
            </button>
          </div>
        </div>

        {/* Tab View Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'guided' ? (
            <motion.div
              key="guided"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {!planResult && !plannerLoading && (
                <div className="glass-card" style={{ padding: 0, background: 'white', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                  {/* Step Progress Tracker */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', background: '#f8fafc', padding: '16px 24px', justifyContent: 'space-between', overflowX: 'auto', gap: 16 }}>
                    {steps.map(s => {
                      const isActive = s.id === currentStep;
                      const isCompleted = s.id < currentStep;
                      return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: isActive || isCompleted ? 1 : 0.45, flexShrink: 0 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            background: isCompleted ? '#22c55e' : isActive ? 'var(--primary)' : '#e2e8f0',
                            color: isCompleted || isActive ? 'white' : '#64748b',
                            transition: 'all 0.3s'
                          }}>
                            {isCompleted ? <Check size={16} /> : s.id}
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--primary)' : 'var(--text-main)' }}>
                            {s.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Wizard Form Sections */}
                  <form onSubmit={handleGeneratePlan} style={{ padding: 32 }}>
                    
                    {/* Error Alerts */}
                    {validationError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <XCircle size={16} />
                        <strong>Error:</strong> {validationError}
                      </div>
                    )}

                    {/* STEP 1: Customer Details */}
                    {currentStep === 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <User size={20} color="var(--primary)" /> 1. Customer Details
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <label style={styles.label}>Full Name *</label>
                            <input
                              required
                              type="text"
                              className="input-field"
                              placeholder="Enter your full name"
                              style={{ width: '100%' }}
                              value={form.full_name}
                              onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Mobile Number *</label>
                            <input
                              required
                              type="tel"
                              className="input-field"
                              placeholder="Enter mobile number"
                              style={{ width: '100%' }}
                              value={form.mobile_number}
                              onChange={e => setForm(prev => ({ ...prev, mobile_number: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>WhatsApp Number *</label>
                            <input
                              required
                              type="tel"
                              className="input-field"
                              placeholder="Enter WhatsApp number"
                              style={{ width: '100%' }}
                              value={form.whatsapp_number}
                              onChange={e => setForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Email Address *</label>
                            <input
                              required
                              type="email"
                              className="input-field"
                              placeholder="Enter your email address"
                              style={{ width: '100%' }}
                              value={form.email}
                              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Location / City</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Your current city"
                              style={{ width: '100%' }}
                              value={form.location}
                              onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Preferred Contact Method</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.contact_method}
                              onChange={e => setForm(prev => ({ ...prev, contact_method: e.target.value }))}
                            >
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Mobile Call">Mobile Call</option>
                              <option value="Email">Email</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Trip & Passenger Details */}
                    {currentStep === 2 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={20} color="var(--primary)" /> 2. Trip Details & Passengers
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                          <div>
                            <label style={styles.label}>Travel Category</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.travel_category}
                              onChange={e => setForm(prev => ({ ...prev, travel_category: e.target.value }))}
                            >
                              <option value="National">National (Within India)</option>
                              <option value="International">International (Outside India)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Tour Type / Vacation Vibe</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.tour_type}
                              onChange={e => setForm(prev => ({ ...prev, tour_type: e.target.value }))}
                            >
                              <option value="Family Tours">👨‍👩‍👧‍👦 Family Tours</option>
                              <option value="Honeymoon Tours">💖 Honeymoon Tours</option>
                              <option value="Hill Station Tours">🏔️ Hill Station Tours</option>
                              <option value="Pilgrimage Tours">🙏 Pilgrimage Tours</option>
                              <option value="Resort Packages">🏨 Resort Packages</option>
                              <option value="Weekend Tours">🎒 Weekend Tours</option>
                              <option value="Group Tours">👥 Group Tours</option>
                              <option value="School / College Tours">🎓 School / College Tours</option>
                              <option value="Corporate Tours">💼 Corporate Tours</option>
                              <option value="Cultural Tours">🏛️ Cultural Tours</option>
                              <option value="Luxury Tours">💎 Luxury Tours</option>
                              <option value="Cruise Packages">🚢 Cruise Packages</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Departure City</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Chennai, Bangalore, Delhi"
                              style={{ width: '100%' }}
                              value={form.departure_city}
                              onChange={e => setForm(prev => ({ ...prev, departure_city: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Destination Places *</label>
                            <input
                              required
                              type="text"
                              className="input-field"
                              placeholder="e.g. Kerala, Munnar, Dubai, Kashmir"
                              style={{ width: '100%' }}
                              value={form.destination_places}
                              onChange={e => setForm(prev => ({ ...prev, destination_places: e.target.value }))}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="checkbox"
                              id="suggest_destination"
                              checked={form.suggest_destination}
                              onChange={e => setForm(prev => ({ ...prev, suggest_destination: e.target.checked }))}
                            />
                            <label htmlFor="suggest_destination" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                              I am flexible. Suggest travel destination places based on my preferences.
                            </label>
                          </div>

                          <div>
                            <label style={styles.label}>Start Date</label>
                            <input
                              type="date"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.travel_start_date}
                              onChange={e => setForm(prev => ({ ...prev, travel_start_date: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Return Date</label>
                            <input
                              type="date"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.return_date}
                              onChange={e => setForm(prev => ({ ...prev, return_date: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Duration Days</label>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_days}
                              onChange={e => setForm(prev => ({ ...prev, num_days: parseInt(e.target.value) || 5 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Duration Nights</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_nights}
                              onChange={e => setForm(prev => ({ ...prev, num_nights: parseInt(e.target.value) || 4 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Date Flexibility</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.date_flexibility}
                              onChange={e => setForm(prev => ({ ...prev, date_flexibility: e.target.value }))}
                            >
                              <option value="Exact Dates">Exact Dates</option>
                              <option value="Flexible (+/- 3 Days)">Flexible (+/- 3 Days)</option>
                              <option value="Flexible (+/- 7 Days)">Flexible (+/- 7 Days)</option>
                              <option value="Month / Season Flexible">Month / Season Flexible</option>
                            </select>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 16, borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                          3. Passenger Breakdown
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                          <div>
                            <label style={styles.label}>Total Passengers *</label>
                            <input
                              required
                              type="number"
                              min="1"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.total_passengers}
                              onChange={e => setForm(prev => ({ ...prev, total_passengers: parseInt(e.target.value) || 2 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Male Count</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_male}
                              onChange={e => setForm(prev => ({ ...prev, num_male: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Female Count</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_female}
                              onChange={e => setForm(prev => ({ ...prev, num_female: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Senior Citizens (60+)</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_seniors}
                              onChange={e => setForm(prev => ({ ...prev, num_seniors: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Children (2-12 Years)</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_children}
                              onChange={e => setForm(prev => ({ ...prev, num_children: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Children Ages</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. 5, 8"
                              style={{ width: '100%' }}
                              value={form.children_ages}
                              onChange={e => setForm(prev => ({ ...prev, children_ages: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Infants (0-2 Years)</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_infants}
                              onChange={e => setForm(prev => ({ ...prev, num_infants: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Infant Ages</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. 1"
                              style={{ width: '100%' }}
                              value={form.infant_ages}
                              onChange={e => setForm(prev => ({ ...prev, infant_ages: e.target.value }))}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 4' }}>
                            <label style={styles.label}>Special Assistance Requirements</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Wheelchair assistance, ground floor rooms, medical support info"
                              style={{ width: '100%' }}
                              value={form.special_assistance}
                              onChange={e => setForm(prev => ({ ...prev, special_assistance: e.target.value }))}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Hotel & Meals */}
                    {currentStep === 3 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Home size={20} color="var(--primary)" /> 4. Hotel Requirement
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                          <div>
                            <label style={styles.label}>Accommodation Required?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.hotel_required}
                              onChange={e => setForm(prev => ({ ...prev, hotel_required: e.target.value }))}
                            >
                              <option value="Yes">Yes, include stays</option>
                              <option value="No">No, I will book my own stays</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Hotel Category Level</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.hotel_category}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, hotel_category: e.target.value }))}
                            >
                              <option value="Budget">Budget Homestays / 2-Star Hotels</option>
                              <option value="Standard">Standard / 3-Star Hotels</option>
                              <option value="Premium">Premium / 4-Star Hotels</option>
                              <option value="Luxury">Luxury / 5-Star Resorts</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Room Type</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.room_type}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, room_type: e.target.value }))}
                            >
                              <option value="Single Room">Single Room</option>
                              <option value="Double">Double / Twin Room</option>
                              <option value="Triple sharing">Triple sharing Room</option>
                              <option value="Family Suite">Family Suite</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Number of Rooms</label>
                            <input
                              type="number"
                              min="1"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.num_rooms}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, num_rooms: parseInt(e.target.value) || 1 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Extra Bed / Mattress Needed?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.extra_bed}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, extra_bed: e.target.value }))}
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Child With Extra Bed Count</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.child_with_bed}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, child_with_bed: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Child Without Bed Count</label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.child_without_bed}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, child_without_bed: parseInt(e.target.value) || 0 }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Preferred Location Vibe</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Near beach, city center, forest view"
                              style={{ width: '100%' }}
                              value={form.preferred_location}
                              disabled={form.hotel_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, preferred_location: e.target.value }))}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: 20, gridColumn: 'span 2' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={form.lift_required}
                                disabled={form.hotel_required === 'No'}
                                onChange={e => setForm(prev => ({ ...prev, lift_required: e.target.checked }))}
                              />
                              Lift access required in hotels
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={form.wheelchair_friendly}
                                disabled={form.hotel_required === 'No'}
                                onChange={e => setForm(prev => ({ ...prev, wheelchair_friendly: e.target.checked }))}
                              />
                              Wheelchair friendly rooms
                            </label>
                          </div>
                        </div>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Utensils size={20} color="var(--primary)" /> 5. Meal Plan
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <label style={styles.label}>Meals Required?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.meal_required}
                              onChange={e => setForm(prev => ({ ...prev, meal_required: e.target.value }))}
                            >
                              <option value="Yes">Yes, include meal plan</option>
                              <option value="No">No, I will dine independently</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Meal Plan Option</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.meal_plan}
                              disabled={form.meal_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, meal_plan: e.target.value }))}
                            >
                              <option value="EP (Room Only)">EP (Room Only)</option>
                              <option value="CP (Breakfast Only)">CP (Breakfast Only)</option>
                              <option value="MAP (Breakfast + Lunch/Dinner)">MAP (Breakfast + Lunch/Dinner)</option>
                              <option value="AP (Breakfast + Lunch + Dinner)">AP (Breakfast + Lunch + Dinner)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Food Preference</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.food_preference}
                              disabled={form.meal_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, food_preference: e.target.value }))}
                            >
                              <option value="Veg">Vegetarian Only</option>
                              <option value="Non-Veg">Non-Vegetarian</option>
                              <option value="Jain Food">Jain Food</option>
                              <option value="Halal Food">Halal Food</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Dietary restrictions / Special meals</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Gluten-free, diabetic meals, allergies"
                              style={{ width: '100%' }}
                              value={form.special_meal}
                              disabled={form.meal_required === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, special_meal: e.target.value }))}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: Transit & Sightseeing */}
                    {currentStep === 4 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Plane size={20} color="var(--primary)" /> 6. Transport & Ticket Requirements
                        </h2>

                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={form.flight_ticket}
                              onChange={e => setForm(prev => ({ ...prev, flight_ticket: e.target.checked }))}
                            />
                            ✈️ Flight Tickets Needed
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={form.train_ticket}
                              onChange={e => setForm(prev => ({ ...prev, train_ticket: e.target.checked }))}
                            />
                            🚂 Train Tickets Needed
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={form.bus_ticket}
                              onChange={e => setForm(prev => ({ ...prev, bus_ticket: e.target.checked }))}
                            />
                            🚌 Bus Tickets Needed
                          </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                          <div>
                            <label style={styles.label}>Local Transport vehicle</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.local_transport}
                              onChange={e => setForm(prev => ({ ...prev, local_transport: e.target.value }))}
                            >
                              <option value="Sedan">Sedan Car (4 Seater)</option>
                              <option value="SUV">SUV Car (Innova / Ertiga)</option>
                              <option value="Tempo Traveller">Tempo Traveller (12-17 Seater)</option>
                              <option value="Mini Coach">Mini Coach (20+ Seater)</option>
                              <option value="None">None (No local car needed)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Vehicle Preference Class</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.vehicle_category}
                              disabled={form.local_transport === 'None'}
                              onChange={e => setForm(prev => ({ ...prev, vehicle_category: e.target.value }))}
                            >
                              <option value="Budget">Budget / Standard vehicle</option>
                              <option value="Luxury">Premium / Luxury vehicle</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>AC Preference</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.ac_preference}
                              disabled={form.local_transport === 'None'}
                              onChange={e => setForm(prev => ({ ...prev, ac_preference: e.target.value }))}
                            >
                              <option value="AC">Air Conditioned (AC)</option>
                              <option value="Non-AC">Non Air Conditioned (Non-AC)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Transport Option Type</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.transport_type}
                              disabled={form.local_transport === 'None'}
                              onChange={e => setForm(prev => ({ ...prev, transport_type: e.target.value }))}
                            >
                              <option value="Private">Private Dedicated Cab</option>
                              <option value="Sharing">Shared coach tour</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Pickup Location</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Airport, station or hotel name"
                              style={{ width: '100%' }}
                              value={form.pickup_location}
                              onChange={e => setForm(prev => ({ ...prev, pickup_location: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Drop Location</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Airport, station or hotel name"
                              style={{ width: '100%' }}
                              value={form.drop_location}
                              onChange={e => setForm(prev => ({ ...prev, drop_location: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Luggage Details</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. 3 large bags, 2 cabin bags"
                              style={{ width: '100%' }}
                              value={form.luggage_details}
                              onChange={e => setForm(prev => ({ ...prev, luggage_details: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Driver Language Preference</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.driver_language}
                              onChange={e => setForm(prev => ({ ...prev, driver_language: e.target.value }))}
                            >
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Malayalam">Malayalam</option>
                              <option value="Tamil">Tamil</option>
                              <option value="Kannada">Kannada</option>
                            </select>
                          </div>
                        </div>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Bot size={20} color="var(--primary)" /> 7. Sightseeing & Activities
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={styles.label}>Specific Sightseeing Places to Cover</label>
                            <textarea
                              className="input-field"
                              rows="3"
                              placeholder="e.g. Burj Khalifa in Dubai, houseboat ride in Alleppey, Taj Mahal in Agra..."
                              style={{ width: '100%', padding: 12, borderRadius: 10 }}
                              value={form.places_to_cover}
                              onChange={e => setForm(prev => ({ ...prev, places_to_cover: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Travel Pace</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.travel_pace}
                              onChange={e => setForm(prev => ({ ...prev, travel_pace: e.target.value }))}
                            >
                              <option value="Slow & Relaxed">Slow & Relaxed (Plenty of leisure time)</option>
                              <option value="Moderate">Moderate (Standard sightseeing pace)</option>
                              <option value="Fast & Active">Fast & Active (Cover maximum places)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Interest Type</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.interest_type}
                              onChange={e => setForm(prev => ({ ...prev, interest_type: e.target.value }))}
                            >
                              <option value="Nature">🌿 Nature & Scenic Scenery</option>
                              <option value="Adventure">🧗 Thrill & Adventure Sports</option>
                              <option value="Heritage">🏛️ Heritage & Cultural Sites</option>
                              <option value="Religious">🙏 Temple & Religious Pilgrimage</option>
                              <option value="Leisure">🏖️ Beach & Resort Leisure</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Local Guide Required?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.guide_required}
                              onChange={e => setForm(prev => ({ ...prev, guide_required: e.target.value }))}
                            >
                              <option value="No">No guide needed</option>
                              <option value="Yes">Yes, require local guide at monuments</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={form.entry_tickets}
                                onChange={e => setForm(prev => ({ ...prev, entry_tickets: e.target.checked }))}
                              />
                              Include Monument Entrance Tickets
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={form.special_darshan}
                                onChange={e => setForm(prev => ({ ...prev, special_darshan: e.target.checked }))}
                              />
                              Include Special Temple Darshan
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={form.ritual_pooja}
                                onChange={e => setForm(prev => ({ ...prev, ritual_pooja: e.target.checked }))}
                              />
                              Include Ritual Pooja / Archana bookings
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 5: Passport, Budget & Specials */}
                    {currentStep === 5 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={20} color="var(--primary)" /> 8. Passport, Visa & Insurance
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                          <div>
                            <label style={styles.label}>Do you have a valid Passport?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.passport_available}
                              onChange={e => setForm(prev => ({ ...prev, passport_available: e.target.value }))}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Passport Validity Expiry Date</label>
                            <input
                              type="date"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.passport_validity}
                              disabled={form.passport_available === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, passport_validity: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Visa Assistance Required?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.visa_assistance}
                              onChange={e => setForm(prev => ({ ...prev, visa_assistance: e.target.value }))}
                            >
                              <option value="No">No, I have my visa</option>
                              <option value="Yes">Yes, require visa services</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Travel Insurance Required?</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.travel_insurance}
                              onChange={e => setForm(prev => ({ ...prev, travel_insurance: e.target.value }))}
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Insurance Type Preference</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.insurance_type}
                              disabled={form.travel_insurance === 'No'}
                              onChange={e => setForm(prev => ({ ...prev, insurance_type: e.target.value }))}
                            >
                              <option value="Standard">Standard Coverage</option>
                              <option value="Premium">Premium Coverage (High Claim Limits)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Nationality</label>
                            <input
                              type="text"
                              className="input-field"
                              style={{ width: '100%' }}
                              value={form.nationality}
                              onChange={e => setForm(prev => ({ ...prev, nationality: e.target.value }))}
                            />
                          </div>
                        </div>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Briefcase size={20} color="var(--primary)" /> 9. Budget & Pricing Preference
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                          <div>
                            <label style={styles.label}>Budget Level Preference</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.budget_type}
                              onChange={e => setForm(prev => ({ ...prev, budget_type: e.target.value }))}
                            >
                              <option value="Budget">Budget Friendly (Maximum savings)</option>
                              <option value="Standard">Standard / Comfortable</option>
                              <option value="Premium">Premium / Elite comfort</option>
                              <option value="Luxury">Ultra Luxury (5-star Resorts / Private Pool villas)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Approximate Budget Value</label>
                            <input
                              type="number"
                              className="input-field"
                              placeholder="e.g. 50000"
                              style={{ width: '100%' }}
                              value={form.approx_budget}
                              onChange={e => setForm(prev => ({ ...prev, approx_budget: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Currency</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.currency}
                              onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                            >
                              <option value="INR">INR (Indian Rupee)</option>
                              <option value="USD">USD (US Dollar)</option>
                              <option value="AED">AED (UAE Dirham)</option>
                              <option value="EUR">EUR (Euro)</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Budget Costing Type</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.price_preference}
                              onChange={e => setForm(prev => ({ ...prev, price_preference: e.target.value }))}
                            >
                              <option value="Per Person">Per Person costing</option>
                              <option value="Total Group">Total Group costing</option>
                            </select>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={styles.label}>Specific Pricing Inclusions Preference</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Budget must include dinner but exclude flights"
                              style={{ width: '100%' }}
                              value={form.inclusions_preference}
                              onChange={e => setForm(prev => ({ ...prev, inclusions_preference: e.target.value }))}
                            />
                          </div>
                        </div>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Sparkles size={20} color="var(--primary)" /> 10. Special Arrangements & Requests
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <label style={styles.label}>Special Celebration Arrangements</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Candlelight dinner, Honeymoon cake, Bed decoration"
                              style={{ width: '100%' }}
                              value={form.special_arrangement}
                              onChange={e => setForm(prev => ({ ...prev, special_arrangement: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Communication Language</label>
                            <select
                              className="input-field"
                              style={{ width: '100%', height: 45 }}
                              value={form.language_preference}
                              onChange={e => setForm(prev => ({ ...prev, language_preference: e.target.value }))}
                            >
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Malayalam">Malayalam</option>
                              <option value="Tamil">Tamil</option>
                            </select>
                          </div>

                          <div>
                            <label style={styles.label}>Emergency Mobile / Contact Name</label>
                            <input
                              type="tel"
                              className="input-field"
                              placeholder="Emergency contact details"
                              style={{ width: '100%' }}
                              value={form.emergency_contact}
                              onChange={e => setForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Any Other Specific Requests</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. late checkouts, specific room numbers"
                              style={{ width: '100%' }}
                              value={form.other_request}
                              onChange={e => setForm(prev => ({ ...prev, other_request: e.target.value }))}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step Action Buttons */}
                    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          style={{
                            padding: '10px 24px',
                            fontWeight: 700,
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            background: 'white',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <ChevronLeft size={16} /> Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {currentStep < 5 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="btn btn-primary"
                          style={{ padding: '10px 28px', fontWeight: 800, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          Continue <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{ padding: '12px 36px', fontWeight: 800, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}
                        >
                          <Sparkles size={18} /> Compile Customized Itinerary & Submit Enquiry
                        </button>
                      )}
                    </div>

                  </form>
                </div>
              )}

              {/* Loader */}
              {plannerLoading && (
                <div className="glass-card" style={{ padding: 48, background: 'white', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', position: 'relative', width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                    <motion.div
                      style={{
                        position: 'absolute',
                        border: '4px solid var(--primary)',
                        borderRadius: '50%',
                        width: '100%',
                        height: '100%',
                        borderTopColor: 'transparent'
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                    <Sparkles size={32} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>
                    SreePayanam AI Planner is working...
                  </h3>
                  <motion.div
                    key={loadingStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}
                  >
                    {loadingPhrases[loadingStep]}
                  </motion.div>
                </div>
              )}

              {/* Custom Itinerary Result Dashboard */}
              {planResult && !plannerLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 28, alignItems: 'start' }}>
                  
                  {/* Left Column: Itinerary Overview & Timeline */}
                  <div>
                    {/* Overview summary */}
                    <div className="glass-card" style={{ padding: 28, background: 'white', border: '1px solid #cbd5e1', marginBottom: 24 }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>{planResult.title}</h2>
                      <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {planResult.destination}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {planResult.durationDays}D / {planResult.durationNights}N</span>
                        {planResult.startingCity && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>✈️ {planResult.startingCity} → {planResult.endingCity}</span>}
                      </p>
                      <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: 1.8, margin: 0 }}>{planResult.overview}</p>
                    </div>

                    {/* Timeline stepper */}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 16 }}>Interactive Daily Itinerary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                      {planResult.itinerary.map((day, i) => (
                        <div key={i} className="glass-card" style={{ background: 'white', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                          <button
                            onClick={() => setOpenDay(openDay === i ? -1 : i)}
                            style={{
                              width: '100%',
                              padding: '20px 24px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: openDay === i ? 'var(--primary)' : 'white',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{
                                background: openDay === i ? 'rgba(255,255,255,0.25)' : '#eff6ff',
                                color: openDay === i ? 'white' : 'var(--primary)',
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontWeight: 800,
                                fontSize: '0.88rem'
                              }}>
                                Day {day.day}
                              </span>
                              <span style={{ fontWeight: 800, color: openDay === i ? 'white' : 'var(--dark)', fontSize: '1rem' }}>
                                {day.title}
                              </span>
                            </div>
                            {openDay === i ? (
                              <ChevronUp size={20} color="white" />
                            ) : (
                              <ChevronDown size={20} color="var(--text-muted)" />
                            )}
                          </button>

                          <AnimatePresence>
                            {openDay === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ padding: '24px 28px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                  <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: 1.8, margin: 0 }}>
                                    {day.activities}
                                  </p>

                                  {/* Subcards Grid */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 10 }}>
                                    {/* Accommodation */}
                                    {day.hotel && (
                                      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 6 }}>
                                          <Home size={14} /> Accommodation stay
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark)' }}>{day.hotel.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700, margin: '2px 0 6px' }}>⭐ {day.hotel.rating}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{day.hotel.desc}</div>
                                      </div>
                                    )}

                                    {/* Dining */}
                                    {day.meal && (
                                      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 6 }}>
                                          <Utensils size={14} /> Dining Option
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{day.meal}</div>
                                      </div>
                                    )}

                                    {/* Transit */}
                                    {day.transit && (
                                      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 6 }}>
                                          <Plane size={14} /> Transit Log
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{day.transit}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                    {/* Inclusions and Exclusions side-by-side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="glass-card" style={{ padding: 24, background: 'white', border: '1px solid #cbd5e1' }}>
                        <h4 style={{ color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <CheckCircle size={18} /> Inclusions
                        </h4>
                        {planResult.inclusions.map((inc, index) => (
                          <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            <CheckCircle size={14} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="glass-card" style={{ padding: 24, background: 'white', border: '1px solid #cbd5e1' }}>
                        <h4 style={{ color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <XCircle size={18} /> Exclusions
                        </h4>
                        {planResult.exclusions.map((exc, index) => (
                          <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            <XCircle size={14} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>{exc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Price summary */}
                  <div style={{ position: 'sticky', top: 110 }}>
                    
                    {/* Status Alert: Enquiry Submitted */}
                    {enquirySuccess && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 20, borderRadius: 12, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <CheckCircle size={22} color="#16a34a" style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#14532d', fontSize: '0.92rem', marginBottom: 2 }}>Inquiry Submitted!</div>
                          <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.4 }}>
                            Our experts have received these details. We will contact you at <strong>{form.mobile_number}</strong> shortly.
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="glass-card" style={{ padding: 28, background: 'white', border: '1px solid #cbd5e1', marginBottom: 20 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>ESTIMATED PRICE RANGE</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: 20 }}>{planResult.estimatedPrice}</div>

                      {/* Direct WhatsApp Call to Action */}
                      <a
                        href={`https://wa.me/919443217654?text=${encodeURIComponent(`Hi SreePayanam! I just compiled a custom AI Travel Itinerary to ${form.destination_places} for ${form.total_passengers} travelers. I'd like to book/discuss details. Details: Name - ${form.full_name}, Phone - ${form.mobile_number}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', marginBottom: 12 }}
                      >
                        <MessageSquare size={18} /> Discuss on WhatsApp
                      </a>

                      <button
                        onClick={downloadItineraryText}
                        className="btn"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1', color: 'var(--text-main)', cursor: 'pointer', marginBottom: 12 }}
                      >
                        <Download size={16} /> Download Itinerary
                      </button>

                      <button
                        onClick={() => {
                          setPlanResult(null);
                          setCurrentStep(1);
                        }}
                        className="btn"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, background: 'transparent', border: '1px dashed #ef4444', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <RefreshCw size={16} /> Plan Another Trip
                      </button>
                    </div>

                    {/* Quality statement */}
                    <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <Info size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', lineHeight: 1.45 }}>
                        This is an AI custom proposal. Our travel booking coordinators will review these details and verify live flight seats/hotel rooms to provide an official quote.
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Chat View */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '65vh', overflow: 'hidden', background: 'white', border: '1px solid #cbd5e1' }}>
                <div ref={chatListRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-end',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {msg.role !== 'user' && (
                        <div style={{ background: 'var(--secondary)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bot size={18} color="white" />
                        </div>
                      )}
                      
                      <div style={{
                        padding: '12px 18px',
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        background: msg.role === 'user' ? 'var(--primary)' : 'white',
                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
                      }}>
                        {formatChatMessage(msg.content)}
                      </div>

                      {msg.role === 'user' && (
                        <div style={{ background: 'var(--dark)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={18} color="white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {chatLoading && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: '85%' }}>
                      <div style={{ background: 'var(--secondary)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bot size={18} color="white" />
                      </div>
                      <div style={{ padding: '12px 18px', borderRadius: '16px 16px 16px 0', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          Thinking & searching...
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSend} style={{ display: 'flex', padding: 20, gap: 12, borderTop: '1px solid #e2e8f0' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1, borderRadius: 24, padding: '12px 20px' }}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about tour routes, package options, sightseeing customisations..."
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 800,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '6px'
  }
};

export default AiAssistant;
