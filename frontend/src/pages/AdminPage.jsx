import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, LogIn, ChevronDown, ChevronUp, X, Edit } from 'lucide-react';
import { IMAGE_PRESETS } from '../utils/imagePresets';

const TOUR_TYPES = [
  'Family Tours','Pilgrimage Tours','Honeymoon Tours','Hill Station Tours',
  'Resort Packages','Weekend Tours','Group Tours','School / College Tours',
  'Corporate Tours','Festival Tours','Cultural Tours','Medical Tours',
  'Event / Sports Tours','Cruise Packages','Luxury Tours','Budget Tours',
  'MICE Tours','Education Tours','Adventure Tours'
];

const emptyForm = {
  title: '', destination: '', packageCategory: 'National', tourType: 'Family Tours',
  startingCity: '', endingCity: '', durationDays: '', durationNights: '',
  overview: '', imageUrl: '',
  itinerary: [{ day: 1, title: '', activities: '', hotel: '', mealPlan: '', transport: '' }],
  inclusions: '', exclusions: '', optionalAddons: '',
  originalPrice: '', offerPrice: '', isSpecialOffer: false, offerValidity: '',
  termsAndConditions: '', cancellationPolicy: '',
  seoTitle: '', seoMetaDescription: '',
  isActive: true,
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSection, setOpenSection] = useState('basic');
  const [formData, setFormData] = useState(emptyForm);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // STEP-BY-STEP AI BUILDER STATES
  const [builderStep, setBuilderStep] = useState(1); // 1: Input preferences, 2: Compare & Select top 5
  const [builderParams, setBuilderParams] = useState({
    destination: '',
    startingCity: '',
    endingCity: '',
    durationDays: '5',
    durationNights: '4',
    hotelCategory: '4 Star',
    flightClass: 'Economy',
    flightCarrier: '',
    trainClass: 'AC 3 Tier (3A)',
    carType: 'SUV (Innova/Ertiga)',
    driverOption: 'Chauffeur-driven',
    customPrompt: '',
    includeFlight: true,
    includeTrain: true,
    includeCar: true
  });
  const [suggestedChoices, setSuggestedChoices] = useState(null);
  const [searchingChoices, setSearchingChoices] = useState(false);
  const [activeChoiceTab, setActiveChoiceTab] = useState('hotel'); // hotel, flight, train, car
  
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [importingPdf, setImportingPdf] = useState(false);
  const [parsedPackages, setParsedPackages] = useState([]);
  const [expandedPrefs, setExpandedPrefs] = useState({});

  const handleParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBuilderParams(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePdfUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPdf(e.target.files[0]);
      setParsedPackages([]);
    }
  };

  const loadParsedPackage = (data) => {
    setFormData({
      title: data.title || '',
      destination: data.destination || '',
      packageCategory: data.packageCategory || 'National',
      tourType: data.tourType || 'Family Tours',
      startingCity: data.startingCity || '',
      endingCity: data.endingCity || '',
      durationDays: data.durationDays || '',
      durationNights: data.durationNights || '',
      overview: data.overview || '',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      itinerary: Array.isArray(data.itinerary) ? data.itinerary.map(day => ({
        day: day.day || 1,
        title: day.title || '',
        activities: day.activities || '',
        hotel: day.hotel || '',
        mealPlan: day.mealPlan || '',
        transport: day.transport || ''
      })) : [{ day: 1, title: '', activities: '', hotel: '', mealPlan: '', transport: '' }],
      inclusions: Array.isArray(data.inclusions) ? data.inclusions.join('\n') : (data.inclusions || ''),
      exclusions: Array.isArray(data.exclusions) ? data.exclusions.join('\n') : (data.exclusions || ''),
      optionalAddons: Array.isArray(data.optionalAddons) ? data.optionalAddons.join('\n') : (data.optionalAddons || ''),
      originalPrice: data.originalPrice || 19999,
      offerPrice: data.offerPrice || 15999,
      isSpecialOffer: !!data.isSpecialOffer,
      offerValidity: data.offerValidity || '',
      termsAndConditions: data.termsAndConditions || '',
      cancellationPolicy: data.cancellationPolicy || '',
      seoTitle: data.seoTitle || '',
      seoMetaDescription: data.seoMetaDescription || '',
      isActive: true
    });
    setSuccess(`🎉 Loaded "${data.title}" details into the form successfully!`);
  };

  const importFromPdf = async () => {
    if (!selectedPdf) return;
    setImportingPdf(true);
    setError('');
    setSuccess('');
    setParsedPackages([]);
    
    const formDataObj = new FormData();
    formDataObj.append('brochure', selectedPdf);

    try {
      const res = await fetch('/api/ai/parse-brochure', {
        method: 'POST',
        body: formDataObj
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to parse PDF brochure');

      const packagesList = data.packages || [];
      if (packagesList.length === 0) {
        throw new Error('No packages could be extracted from this brochure.');
      }

      setParsedPackages(packagesList);

      if (packagesList.length === 1) {
        loadParsedPackage(packagesList[0]);
        setSuccess('🎉 Successfully parsed and imported package details!');
      } else {
        setSuccess(`🎉 Found ${packagesList.length} distinct tour packages in the brochure! Choose one from the list below to populate the form.`);
      }
      setSelectedPdf(null);
    } catch (err) {
      setError(`PDF parsing failed: ${err.message}`);
    } finally {
      setImportingPdf(false);
    }
  };

  const fetchSuggestedChoices = async () => {
    if (!builderParams.destination.trim()) {
      setError('Please specify a destination city/region first.');
      return;
    }
    setSearchingChoices(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/ai/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'all',
          destination: builderParams.destination,
          startingCity: builderParams.startingCity,
          endingCity: builderParams.endingCity,
          durationDays: Number(builderParams.durationDays),
          durationNights: Number(builderParams.durationNights),
          hotelCategory: builderParams.hotelCategory,
          flightClass: builderParams.flightClass,
          flightCarrier: builderParams.flightCarrier,
          trainClass: builderParams.trainClass,
          carType: builderParams.carType,
          driverOption: builderParams.driverOption,
          customPrompt: builderParams.customPrompt,
          includeFlight: builderParams.includeFlight,
          includeTrain: builderParams.includeTrain,
          includeCar: builderParams.includeCar
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to suggest choices');
      
      setSuggestedChoices(data);
      // Auto pre-select the 1st option of each category for convenience if enabled
      if (data.hotels && data.hotels.length > 0) setSelectedHotel(data.hotels[0]);
      else setSelectedHotel(null);

      if (builderParams.includeFlight && data.flights && data.flights.length > 0) setSelectedFlight(data.flights[0]);
      else setSelectedFlight(null);

      if (builderParams.includeTrain && data.trains && data.trains.length > 0) setSelectedTrain(data.trains[0]);
      else setSelectedTrain(null);

      if (builderParams.includeCar && data.cars && data.cars.length > 0) setSelectedCar(data.cars[0]);
      else setSelectedCar(null);

      setActiveChoiceTab('hotel');
      setBuilderStep(2);
    } catch (err) {
      setError(`AI Search Error: ${err.message}`);
    } finally {
      setSearchingChoices(false);
    }
  };

  const compileSelectedDraft = async () => {
    setAiGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/ai/compile-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: builderParams.destination,
          startingCity: builderParams.startingCity,
          endingCity: builderParams.endingCity,
          durationDays: Number(builderParams.durationDays),
          durationNights: Number(builderParams.durationNights),
          packageCategory: builderParams.destination.toLowerCase().includes('india') || builderParams.destination.toLowerCase().includes('kerala') || builderParams.destination.toLowerCase().includes('munnar') ? 'National' : 'International',
          tourType: 'Family Tours',
          selectedHotel,
          selectedFlight: builderParams.includeFlight ? selectedFlight : null,
          selectedTrain: builderParams.includeTrain ? selectedTrain : null,
          selectedCar: builderParams.includeCar ? selectedCar : null,
          customPrompt: builderParams.customPrompt,
          includeFlight: builderParams.includeFlight,
          includeTrain: builderParams.includeTrain,
          includeCar: builderParams.includeCar
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI compilation failed');
      
      setFormData({
        title: data.title || '',
        destination: data.destination || '',
        packageCategory: data.packageCategory || 'National',
        tourType: data.tourType || 'Family Tours',
        startingCity: data.startingCity || '',
        endingCity: data.endingCity || '',
        durationDays: data.durationDays || '',
        durationNights: data.durationNights || '',
        overview: data.overview || '',
        imageUrl: data.imageUrl || '',
        itinerary: Array.isArray(data.itinerary) ? data.itinerary.map(day => ({
          day: day.day || 1,
          title: day.title || '',
          activities: day.activities || '',
          hotel: day.hotel || '',
          mealPlan: day.mealPlan || '',
          transport: day.transport || ''
        })) : [{ day: 1, title: '', activities: '', hotel: '', mealPlan: '', transport: '' }],
        inclusions: data.inclusions || '',
        exclusions: data.exclusions || '',
        optionalAddons: data.optionalAddons || '',
        originalPrice: data.originalPrice || '',
        offerPrice: data.offerPrice || '',
        isSpecialOffer: !!data.isSpecialOffer,
        offerValidity: data.offerValidity || '',
        termsAndConditions: data.termsAndConditions || '',
        cancellationPolicy: data.cancellationPolicy || '',
        seoTitle: data.seoTitle || '',
        seoMetaDescription: data.seoMetaDescription || '',
        isActive: true
      });
      
      setSuccess('🪄 AI drafted package successfully! Form below is populated with your selected choices.');
      setOpenSection('basic');
      setBuilderStep(1); // Reset step back
      setSuggestedChoices(null);
    } catch (err) {
      setError(`AI Compilation Error: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/ai/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI generation failed');
      
      // Update form data state with the response
      setFormData({
        title: data.title || '',
        destination: data.destination || '',
        packageCategory: data.packageCategory || 'National',
        tourType: data.tourType || 'Family Tours',
        startingCity: data.startingCity || '',
        endingCity: data.endingCity || '',
        durationDays: data.durationDays || '',
        durationNights: data.durationNights || '',
        overview: data.overview || '',
        imageUrl: data.imageUrl || '',
        itinerary: Array.isArray(data.itinerary) ? data.itinerary.map(day => ({
          day: day.day || 1,
          title: day.title || '',
          activities: day.activities || '',
          hotel: day.hotel || '',
          mealPlan: day.mealPlan || '',
          transport: day.transport || ''
        })) : [{ day: 1, title: '', activities: '', hotel: '', mealPlan: '', transport: '' }],
        inclusions: data.inclusions || '',
        exclusions: data.exclusions || '',
        optionalAddons: data.optionalAddons || '',
        originalPrice: data.originalPrice || '',
        offerPrice: data.offerPrice || '',
        isSpecialOffer: !!data.isSpecialOffer,
        offerValidity: data.offerValidity || '',
        termsAndConditions: data.termsAndConditions || '',
        cancellationPolicy: data.cancellationPolicy || '',
        seoTitle: data.seoTitle || '',
        seoMetaDescription: data.seoMetaDescription || '',
        isActive: true
      });
      
      setSuccess('🪄 AI generated the package successfully! Review the sections below and click Create Package.');
      setOpenSection('basic');
      setAiPrompt('');
    } catch (err) {
      setError(`AI Error: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const [activeTab, setActiveTab] = useState('packages');
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [scoredLeads, setScoredLeads] = useState({});

  // Bookings CRM States
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [staffNoteText, setStaffNoteText] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingFilterPayment, setBookingFilterPayment] = useState('All');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPackages();
      fetchEnquiries();
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await fetch('/api/enquiries');
      const data = await res.json();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setEnquiriesLoading(false); }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchEnquiries();
      }
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      const bList = Array.isArray(data) ? data : [];
      setBookings(bList);
      
      // Update currently open side drawer file if it exists
      if (selectedBooking) {
        const fresh = bList.find(b => b._id === selectedBooking._id);
        if (fresh) setSelectedBooking(fresh);
      }
    } catch (err) { console.error(err); }
    finally { setBookingsLoading(false); }
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ bookingStatus: newStatus })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) { console.error(err); }
  };

  const handleVerifyPayment = async (bookingId, paymentId, action) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify-payment/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.message || 'Auditing verification failed.');
      }
    } catch (err) { console.error(err); }
  };

  const handleAppendStaffNote = async (bookingId) => {
    if (!staffNoteText.trim()) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ text: staffNoteText, addedBy: 'Staff Admin' })
      });
      if (res.ok) {
        setStaffNoteText('');
        fetchBookings();
      }
    } catch (err) { console.error(err); }
  };

  const handleScoreLead = async (enquiry) => {
    setScoredLeads(prev => ({
      ...prev,
      [enquiry._id]: { loading: true }
    }));
    try {
      const res = await fetch('/api/ai/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiry })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Scoring failed');

      setScoredLeads(prev => ({
        ...prev,
        [enquiry._id]: {
          score: data.score,
          urgency: data.urgency,
          reasoning: data.reasoning,
          suggestedAction: data.suggestedAction,
          followUpMessage: data.followUpMessage,
          loading: false
        }
      }));
    } catch (err) {
      setScoredLeads(prev => ({
        ...prev,
        [enquiry._id]: { error: err.message, loading: false }
      }));
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password) { setIsAuthenticated(true); setError(''); }
    else setError('Please enter the admin password');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => {
      let updated = { ...f, [name]: type === 'checkbox' ? checked : value };
      if (name === 'tourType') {
        const currentPresets = IMAGE_PRESETS[f.tourType] || [];
        const newPresets = IMAGE_PRESETS[value] || [];
        if (!f.imageUrl || currentPresets.includes(f.imageUrl)) {
          if (newPresets.length > 0) {
            updated.imageUrl = newPresets[0];
          }
        }
      }
      return updated;
    });
  };


  const updateItinerary = (index, field, value) => {
    setFormData(f => {
      const updated = [...f.itinerary];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, itinerary: updated };
    });
  };

  const addDay = () => {
    setFormData(f => ({
      ...f,
      itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: '', activities: '', hotel: '', mealPlan: '' }]
    }));
  };

  const removeDay = (index) => {
    setFormData(f => ({
      ...f,
      itinerary: f.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
    }));
  };

  const handleEditClick = (pkg) => {
    setEditingId(pkg._id);
    setFormData({
      title: pkg.title || '',
      destination: pkg.destination || '',
      packageCategory: pkg.packageCategory || 'National',
      tourType: pkg.tourType || 'Family Tours',
      startingCity: pkg.startingCity || '',
      endingCity: pkg.endingCity || '',
      durationDays: pkg.durationDays || '',
      durationNights: pkg.durationNights || '',
      overview: pkg.overview || '',
      imageUrl: pkg.imageUrl || '',
      itinerary: Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 
        ? pkg.itinerary.map(day => ({
            day: day.day || 1,
            title: day.title || '',
            activities: day.activities || '',
            hotel: day.hotel || '',
            mealPlan: day.mealPlan || '',
            transport: day.transport || ''
          })) 
        : [{ day: 1, title: '', activities: '', hotel: '', mealPlan: '', transport: '' }],
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join('\n') : (pkg.inclusions || ''),
      exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join('\n') : (pkg.exclusions || ''),
      optionalAddons: Array.isArray(pkg.optionalAddons) ? pkg.optionalAddons.join('\n') : (pkg.optionalAddons || ''),
      originalPrice: pkg.originalPrice || '',
      offerPrice: pkg.offerPrice || '',
      isSpecialOffer: !!pkg.isSpecialOffer,
      offerValidity: pkg.offerValidity ? new Date(pkg.offerValidity).toISOString().split('T')[0] : '',
      termsAndConditions: pkg.termsAndConditions || '',
      cancellationPolicy: pkg.cancellationPolicy || '',
      seoTitle: pkg.seoTitle || '',
      seoMetaDescription: pkg.seoMetaDescription || '',
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
    });
    setOpenSection('basic');
    setSuccess(`✍️ Editing package "${pkg.title}". Make changes and click 'Update Package'.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...formData,
        durationDays: Number(formData.durationDays),
        durationNights: Number(formData.durationNights),
        originalPrice: Number(formData.originalPrice),
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
        inclusions: formData.inclusions.split('\n').map(s => s.trim()).filter(Boolean),
        exclusions: formData.exclusions.split('\n').map(s => s.trim()).filter(Boolean),
        optionalAddons: formData.optionalAddons.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit package.');
      }
      setSuccess(editingId ? '✅ Package updated successfully!' : '✅ Package created successfully!');
      setFormData(emptyForm);
      setEditingId(null);
      setOpenSection('basic');
      fetchPackages();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE', headers: { 'x-admin-password': password }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchPackages();
    } catch (err) { alert(err.message); }
  };

  const Section = ({ id, title, children }) => (
    <div style={sty.section}>
      <button type="button" style={sty.sectionHead} onClick={() => setOpenSection(openSection === id ? null : id)}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>{title}</span>
        {openSection === id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {openSection === id && <div style={sty.sectionBody}>{children}</div>}
    </div>
  );

  const Field = ({ label, children }) => (
    <div style={sty.field}><label style={sty.label}>{label}</label>{children}</div>
  );

  const Row = ({ children }) => <div style={sty.row}>{children}</div>;

  if (!isAuthenticated) {
    return (
      <div style={sty.loginWrap}>
        <motion.div className="glass-card" style={sty.loginBox} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={sty.loginIcon}><LogIn size={32} color="var(--primary)" /></div>
          <h2 style={{ textAlign: 'center', marginBottom: 8, color: 'var(--dark)' }}>Admin Access</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>SreePayanam Tours &amp; Travels</p>
          {error && <div style={sty.errBox}>{error}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input type="password" className="input-field" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#f1f5f9' }}>
      <div className="container" style={{ maxWidth: 1400, padding: '30px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--dark)', fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>SreePayanam Tours &amp; Travels</p>
          </div>
          <button className="btn" style={{ border: '2px solid #ef4444', color: '#ef4444' }} onClick={() => setIsAuthenticated(false)}>Logout</button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className="btn"
            style={{
              background: activeTab === 'packages' ? 'var(--primary)' : 'white',
              color: activeTab === 'packages' ? 'white' : 'var(--text-main)',
              border: '1.5px solid ' + (activeTab === 'packages' ? 'var(--primary)' : '#e2e8f0'),
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 10,
              cursor: 'pointer'
            }}
          >
            📦 Tour Package Manager
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className="btn"
            style={{
              background: activeTab === 'enquiries' ? 'var(--primary)' : 'white',
              color: activeTab === 'enquiries' ? 'white' : 'var(--text-main)',
              border: '1.5px solid ' + (activeTab === 'enquiries' ? 'var(--primary)' : '#e2e8f0'),
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 10,
              cursor: 'pointer'
            }}
          >
            📞 CRM Lead &amp; Enquiry Manager
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className="btn"
            style={{
              background: activeTab === 'bookings' ? 'var(--primary)' : 'white',
              color: activeTab === 'bookings' ? 'white' : 'var(--text-main)',
              border: '1.5px solid ' + (activeTab === 'bookings' ? 'var(--primary)' : '#e2e8f0'),
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 10,
              cursor: 'pointer'
            }}
          >
            💼 Paid Booking CRM &amp; Auditing
          </button>
        </div>

        {activeTab === 'packages' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30, alignItems: 'start' }}>
            {/* Form */}
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: 'var(--dark)' }}>
                {editingId ? (
                  <>
                    <Edit size={22} color="var(--primary)" /> Edit Tour Package: {formData.title || 'Draft'}
                  </>
                ) : (
                  <>
                    <Plus size={22} color="var(--primary)" /> Add New Tour Package
                  </>
                )}
              </h2>

              {error && <div style={sty.errBox}>{error}</div>}
              {success && <div style={sty.succBox}>{success}</div>}

              {/* STEP-BY-STEP INTERACTIVE AI PACKAGE BUILDER */}
              <div style={{ background: '#f8fafc', border: '2px solid var(--primary)', padding: '24px', borderRadius: '16px', marginBottom: '28px', boxShadow: '0 4px 20px rgba(59,130,246,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: '1.6rem' }}>✨</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
                      Interactive AI Package Builder
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      Compare top 5 travel options, hand-select stays & transits, and auto-build day-wise itineraries.
                    </p>
                  </div>
                </div>

                <div style={{ height: '1.5px', background: '#e2e8f0', margin: '14px 0' }} />

                {/* PDF brochure importer */}
                <div style={{ marginBottom: 20, padding: 18, background: '#eff6ff', borderRadius: 12, border: '1px dashed var(--primary)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    📄 Quick Import from PDF Brochure
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Upload a PDF brochure of the tour package. SreePayanam AI will extract all details, inclusions, price, and the day-by-day itinerary to pre-fill the form.
                  </p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      accept="application/pdf"
                      id="pdf-brochure-upload"
                      style={{ display: 'none' }}
                      onChange={handlePdfUpload}
                    />
                    <label
                      htmlFor="pdf-brochure-upload"
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 4px rgba(59,130,246,0.2)'
                      }}
                    >
                      Select PDF File
                    </label>
                    {selectedPdf && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {selectedPdf.name}
                      </span>
                    )}
                    {selectedPdf && (
                      <button
                        type="button"
                        onClick={importFromPdf}
                        disabled={importingPdf}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800 }}
                      >
                        {importingPdf ? 'Processing with AI...' : '⚡ Parse & Import'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Multiple Packages Selector */}
                {parsedPackages.length > 1 && (
                  <div style={{
                    marginBottom: 20,
                    padding: 20,
                    background: '#f8fafc',
                    borderRadius: 16,
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}>
                    <h4 style={{
                      margin: '0 0 12px 0',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: 'var(--dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      📦 Select a Package to Import ({parsedPackages.length} found)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                      {parsedPackages.map((pkg, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 18px',
                          background: 'white',
                          borderRadius: 12,
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ flex: 1, marginRight: 16 }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>
                              {pkg.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              <span>📍 <strong>{pkg.destination}</strong></span>
                              <span>⏳ <strong>{pkg.durationDays} Days / {pkg.durationNights} Nights</strong></span>
                              <span>🏷️ <strong>{pkg.tourType}</strong></span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => loadParsedPackage(pkg)}
                            className="btn btn-primary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              borderRadius: 8,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Load Into Form
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ height: '1.5px', background: '#e2e8f0', margin: '18px 0', borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />

                {builderStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div style={fld}>
                        <label style={lbl}>📍 Destination *</label>
                        <input
                          type="text"
                          name="destination"
                          className="input-field"
                          placeholder="e.g. Munnar, Kerala or Maldives"
                          value={builderParams.destination}
                          onChange={handleParamChange}
                        />
                      </div>
                      <div style={fld}>
                        <label style={lbl}>🛫 Starting City</label>
                        <input
                          type="text"
                          name="startingCity"
                          className="input-field"
                          placeholder="e.g. Chennai"
                          value={builderParams.startingCity}
                          onChange={handleParamChange}
                        />
                      </div>
                      <div style={fld}>
                        <label style={lbl}>🛬 Ending City</label>
                        <input
                          type="text"
                          name="endingCity"
                          className="input-field"
                          placeholder="e.g. Kochi"
                          value={builderParams.endingCity}
                          onChange={handleParamChange}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '10px 12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                        🛠️ Include in Suggestions:
                      </span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" name="includeFlight" checked={builderParams.includeFlight} onChange={handleParamChange} style={{ width: 16, height: 16 }} />
                        ✈️ Flights
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" name="includeTrain" checked={builderParams.includeTrain} onChange={handleParamChange} style={{ width: 16, height: 16 }} />
                        🚆 Trains
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" name="includeCar" checked={builderParams.includeCar} onChange={handleParamChange} style={{ width: 16, height: 16 }} />
                        🚗 Cars/Transfers
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div style={fld}>
                        <label style={lbl}>📅 Duration (Days / Nights)</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="number"
                            name="durationDays"
                            className="input-field"
                            min="1"
                            value={builderParams.durationDays}
                            onChange={handleParamChange}
                            style={{ flex: 1 }}
                          />
                          <input
                            type="number"
                            name="durationNights"
                            className="input-field"
                            min="0"
                            value={builderParams.durationNights}
                            onChange={handleParamChange}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                      <div style={fld}>
                        <label style={lbl}>🏨 Hotel Star rating</label>
                        <select name="hotelCategory" className="input-field" value={builderParams.hotelCategory} onChange={handleParamChange}>
                          {['Budget', '3 Star', '4 Star', '5 Star / Luxury', 'Premium Resort'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={fld}>
                        <label style={lbl} className={!builderParams.includeFlight ? 'text-muted' : ''}>✈️ Flight Cabin Preference</label>
                        <select name="flightClass" className="input-field" disabled={!builderParams.includeFlight} value={builderParams.flightClass} onChange={handleParamChange} style={{ opacity: builderParams.includeFlight ? 1 : 0.5 }}>
                          {['Economy', 'Premium Economy', 'Business Class', 'First Class'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div style={fld}>
                        <label style={lbl} className={!builderParams.includeTrain ? 'text-muted' : ''}>🚆 Train Preferred standard</label>
                        <select name="trainClass" className="input-field" disabled={!builderParams.includeTrain} value={builderParams.trainClass} onChange={handleParamChange} style={{ opacity: builderParams.includeTrain ? 1 : 0.5 }}>
                          {['Sleeper (SL)', 'AC 3 Tier (3A)', 'AC 2 Tier (2A)', 'AC 1st Class (1A)'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={fld}>
                        <label style={lbl} className={!builderParams.includeCar ? 'text-muted' : ''}>🚗 Rental Car preference</label>
                        <select name="carType" className="input-field" disabled={!builderParams.includeCar} value={builderParams.carType} onChange={handleParamChange} style={{ opacity: builderParams.includeCar ? 1 : 0.5 }}>
                          {['Hatchback', 'Premium Sedan', 'SUV (Innova/Ertiga)', 'Luxury (Audi/BMW)', 'Traveller / Minibus'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={fld}>
                        <label style={lbl}>📝 Custom Prompts / Rules</label>
                        <input
                          type="text"
                          name="customPrompt"
                          className="input-field"
                          placeholder="e.g. Include backwater houseboat, private tour guide"
                          value={builderParams.customPrompt}
                          onChange={handleParamChange}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={fetchSuggestedChoices}
                        disabled={searchingChoices || !builderParams.destination.trim()}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        {searchingChoices ? (
                          <>
                            <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Searching Top 5 Options...
                          </>
                        ) : (
                          <>🔍 Step 1: Search &amp; Compare Choices</>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!builderParams.destination) {
                            setError('Please specify a destination.');
                            return;
                          }
                          setAiGenerating(true);
                          setError('');
                          try {
                            const res = await fetch('/api/ai/generate-package', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ prompt: `Build a package for ${builderParams.durationDays} Days to ${builderParams.destination}. ${builderParams.customPrompt}` })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || 'AI generation failed');
                            
                            setFormData({
                              title: data.title || '',
                              destination: data.destination || '',
                              packageCategory: data.packageCategory || 'National',
                              tourType: data.tourType || 'Family Tours',
                              startingCity: data.startingCity || '',
                              endingCity: data.endingCity || '',
                              durationDays: data.durationDays || '',
                              durationNights: data.durationNights || '',
                              overview: data.overview || '',
                              imageUrl: data.imageUrl || '',
                              itinerary: Array.isArray(data.itinerary) ? data.itinerary.map(day => ({
                                day: day.day || 1,
                                title: day.title || '',
                                activities: day.activities || '',
                                hotel: day.hotel || '',
                                mealPlan: day.mealPlan || '',
                                transport: day.transport || ''
                              })) : [{ day: 1, title: '', activities: '', hotel: '', mealPlan: '', transport: '' }],
                              inclusions: data.inclusions || '',
                              exclusions: data.exclusions || '',
                              optionalAddons: data.optionalAddons || '',
                              originalPrice: data.originalPrice || '',
                              offerPrice: data.offerPrice || '',
                              isSpecialOffer: !!data.isSpecialOffer,
                              offerValidity: data.offerValidity || '',
                              termsAndConditions: data.termsAndConditions || '',
                              cancellationPolicy: data.cancellationPolicy || '',
                              seoTitle: data.seoTitle || '',
                              seoMetaDescription: data.seoMetaDescription || '',
                              isActive: true
                            });

                            setSuccess('🪄 Direct draft completed successfully!');
                          } catch (err) {
                            setError(err.message);
                          } finally {
                            setAiGenerating(false);
                          }
                        }}
                        disabled={aiGenerating || !builderParams.destination.trim()}
                        className="btn"
                        style={{ border: '1.5px solid #cbd5e1', background: 'white' }}
                      >
                        One-click Fast Draft
                      </button>
                    </div>
                  </div>
                )}

                {builderStep === 2 && suggestedChoices && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Compare Tabs */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 10, gap: 4 }}>
                      {[
                        { id: 'hotel', label: '🏨 Hotels', color: '#db2777', show: true },
                        { id: 'flight', label: '✈️ Flights', color: '#2563eb', show: builderParams.includeFlight },
                        { id: 'train', label: '🚆 Trains', color: '#059669', show: builderParams.includeTrain },
                        { id: 'car', label: '🚗 Cars/Transfers', color: '#7c3aed', show: builderParams.includeCar }
                      ].filter(t => t.show).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveChoiceTab(t.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: activeChoiceTab === t.id ? 'white' : 'transparent',
                            color: activeChoiceTab === t.id ? t.color : '#475569',
                            boxShadow: activeChoiceTab === t.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Choices Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '350px', overflowY: 'auto', paddingRight: 4 }}>
                      
                      {activeChoiceTab === 'hotel' && suggestedChoices.hotels?.map(opt => {
                        const isSelected = selectedHotel?.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedHotel(opt)}
                            style={{
                              ...optionCardStyle,
                              cursor: 'pointer',
                              border: isSelected ? '2px solid #db2777' : '1px solid #e2e8f0',
                              background: isSelected ? '#fdf2f8' : 'white',
                            }}
                          >
                            <div style={optionHeaderStyle}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>
                                {isSelected ? '🟢 ' : ''}{opt.name}
                              </strong>
                              <span style={{ background: '#fdf2f8', color: '#db2777', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                {opt.rating}
                              </span>
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '6px 0' }}>
                              {opt.amenities?.map((am, i) => (
                                <span key={i} style={badgeStyle}>{am}</span>
                              ))}
                            </div>
                            <div style={matchReasonStyle}>💡 <em>{opt.matchReason}</em></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#db2777' }}>{opt.price}</span>
                              {isSelected && <span style={{ fontSize: '0.75rem', color: '#db2777', fontWeight: 700 }}>Selected Choice</span>}
                            </div>
                          </div>
                        );
                      })}

                      {activeChoiceTab === 'flight' && suggestedChoices.flights?.map(opt => {
                        const isSelected = selectedFlight?.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedFlight(opt)}
                            style={{
                              ...optionCardStyle,
                              cursor: 'pointer',
                              border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : 'white',
                            }}
                          >
                            <div style={optionHeaderStyle}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>
                                {isSelected ? '🟢 ' : ''}{opt.airline}
                              </strong>
                              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                {opt.class}
                              </span>
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              🛫 Route: {opt.route} <br />
                              🕒 {opt.schedule} ({opt.duration})
                            </p>
                            <div style={matchReasonStyle}>💡 <em>{opt.matchReason}</em></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>{opt.price}</span>
                              {isSelected && <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>Selected Choice</span>}
                            </div>
                          </div>
                        );
                      })}

                      {activeChoiceTab === 'train' && suggestedChoices.trains?.map(opt => {
                        const isSelected = selectedTrain?.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedTrain(opt)}
                            style={{
                              ...optionCardStyle,
                              cursor: 'pointer',
                              border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                              background: isSelected ? '#ecfdf5' : 'white',
                            }}
                          >
                            <div style={optionHeaderStyle}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>
                                {isSelected ? '🟢 ' : ''}{opt.name}
                              </strong>
                              <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                {opt.class}
                              </span>
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              🚉 Route: {opt.route} <br />
                              🕒 Schedule: {opt.schedule} ({opt.duration})
                            </p>
                            <div style={matchReasonStyle}>💡 <em>{opt.matchReason}</em></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{opt.price}</span>
                              {isSelected && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Selected Choice</span>}
                            </div>
                          </div>
                        );
                      })}

                      {activeChoiceTab === 'car' && suggestedChoices.cars?.map(opt => {
                        const isSelected = selectedCar?.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedCar(opt)}
                            style={{
                              ...optionCardStyle,
                              cursor: 'pointer',
                              border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                              background: isSelected ? '#f5f3ff' : 'white',
                            }}
                          >
                            <div style={optionHeaderStyle}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>
                                {isSelected ? '🟢 ' : ''}{opt.type}
                              </strong>
                              <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                {opt.driverOption}
                              </span>
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              🚙 Operator: {opt.operator} <br />
                              ⚙️ {opt.features}
                            </p>
                            <div style={matchReasonStyle}>💡 <em>{opt.matchReason}</em></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7c3aed' }}>{opt.rate}</span>
                              {isSelected && <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>Selected Choice</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Compilation Review Summary */}
                    <div style={{ background: '#f1f5f9', padding: 14, borderRadius: 12, fontSize: '0.85rem' }}>
                      <h4 style={{ margin: '0 0 8px', fontWeight: 800 }}>📋 Compile Summary Check:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>🏨 Hotel Selected: <strong style={{ color: '#db2777' }}>{selectedHotel?.name || 'None selected'}</strong></div>
                        {builderParams.includeFlight && <div>✈️ Flight Selected: <strong style={{ color: '#2563eb' }}>{selectedFlight?.airline || 'None selected'}</strong></div>}
                        {builderParams.includeTrain && <div>🚆 Train Selected: <strong style={{ color: '#059669' }}>{selectedTrain?.name || 'None selected (Optional)'}</strong></div>}
                        {builderParams.includeCar && <div>🚗 Car Selected: <strong style={{ color: '#7c3aed' }}>{selectedCar?.type || 'None selected'}</strong></div>}
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setBuilderStep(1)}
                        className="btn"
                        style={{ flex: 1, border: '1.5px solid #cbd5e1', background: 'white', fontWeight: 700 }}
                      >
                        ⬅️ Back &amp; Adjust Specs
                      </button>

                      <button
                        type="button"
                        onClick={compileSelectedDraft}
                        disabled={aiGenerating}
                        className="btn btn-primary"
                        style={{ flex: 2, padding: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        {aiGenerating ? (
                          <>
                            <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Compiling Full Tour Itinerary JSON...
                          </>
                        ) : (
                          <>🪄 Step 2: Compile Package Draft</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>

                {/* BASIC INFO */}
                <Section id="basic" title="📋 Basic Information">
                  <Field label="Package Title *">
                    <input required name="title" className="input-field" placeholder="e.g. Majestic Kerala 5 Days Tour" value={formData.title} onChange={handleChange} />
                  </Field>
                  <Row>
                    <Field label="Destination *">
                      <input required name="destination" className="input-field" placeholder="e.g. Kerala, India" value={formData.destination} onChange={handleChange} />
                    </Field>
                    <Field label="Package Category *">
                      <select name="packageCategory" className="input-field" value={formData.packageCategory} onChange={handleChange}>
                        <option value="National">National</option>
                        <option value="International">International</option>
                      </select>
                    </Field>
                  </Row>
                  <Field label="Tour Type *">
                    <select name="tourType" className="input-field" value={formData.tourType} onChange={handleChange}>
                      {TOUR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Row>
                    <Field label="Starting City">
                      <input name="startingCity" className="input-field" placeholder="e.g. Chennai" value={formData.startingCity} onChange={handleChange} />
                    </Field>
                    <Field label="Ending City">
                      <input name="endingCity" className="input-field" placeholder="e.g. Kochi" value={formData.endingCity} onChange={handleChange} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Duration (Days) *">
                      <input required type="number" name="durationDays" className="input-field" min="1" value={formData.durationDays} onChange={handleChange} />
                    </Field>
                    <Field label="Duration (Nights) *">
                      <input required type="number" name="durationNights" className="input-field" min="0" value={formData.durationNights} onChange={handleChange} />
                    </Field>
                  </Row>
                  <Field label="Package Image URL *">
                    <input required type="url" name="imageUrl" className="input-field" placeholder="https://images.unsplash.com/..." value={formData.imageUrl} onChange={handleChange} />
                  </Field>
                  {IMAGE_PRESETS[formData.tourType] && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8, display: 'block' }}>
                        💡 Curated Premium Presets for <strong>{formData.tourType}</strong> (Click to select):
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {IMAGE_PRESETS[formData.tourType].map((imgUrl, idx) => {
                          const isSelected = formData.imageUrl === imgUrl;
                          return (
                            <div 
                              key={idx} 
                              onClick={() => setFormData(prev => ({ ...prev, imageUrl: imgUrl }))}
                              style={{ 
                                position: 'relative', 
                                height: 75, 
                                borderRadius: 10, 
                                overflow: 'hidden', 
                                cursor: 'pointer',
                                border: isSelected ? '3px solid var(--primary)' : '2px solid transparent',
                                boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.35)' : 'none',
                                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.transform = 'scale(1.05)'; }}
                              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                              <img src={imgUrl} alt={`preset-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {isSelected && (
                                <div style={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  background: 'rgba(59,130,246,0.4)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '1.4rem',
                                  fontWeight: 'bold',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                  ✓
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {formData.imageUrl && (
                    <div style={{ marginTop: 12, marginBottom: 20 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Selected Image Preview:</label>
                      <img src={formData.imageUrl} alt="preview" onError={e => { e.target.style.display = 'none'; }}
                        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    </div>
                  )}

                </Section>

                {/* OVERVIEW */}
                <Section id="overview" title="📝 Overview & Description">
                  <Field label="Package Overview *">
                    <textarea required name="overview" className="input-field" rows="5"
                      placeholder="Describe the full package experience..." value={formData.overview} onChange={handleChange} />
                  </Field>
                </Section>

                {/* ITINERARY */}
                <Section id="itinerary" title="🗓️ Day-wise Itinerary">
                  {formData.itinerary.map((day, i) => (
                    <div key={i} style={sty.dayCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <strong style={{ color: 'var(--primary)' }}>Day {day.day}</strong>
                        {formData.itinerary.length > 1 && (
                          <button type="button" onClick={() => removeDay(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      <input className="input-field" placeholder="Day title (e.g. Arrival & Backwaters)" style={{ marginBottom: 10 }}
                        value={day.title} onChange={e => updateItinerary(i, 'title', e.target.value)} />
                      <textarea className="input-field" rows="3" placeholder="Activities for the day..."
                        value={day.activities} onChange={e => updateItinerary(i, 'activities', e.target.value)} style={{ marginBottom: 10 }} />
                      <Row>
                        <input className="input-field" placeholder="Hotel name" value={day.hotel}
                          onChange={e => updateItinerary(i, 'hotel', e.target.value)} />
                        <select className="input-field" value={day.mealPlan} onChange={e => updateItinerary(i, 'mealPlan', e.target.value)}>
                          <option value="">Meal Plan</option>
                          <option value="Breakfast">Breakfast Only</option>
                          <option value="Breakfast & Dinner">Breakfast &amp; Dinner</option>
                          <option value="All Meals">All Meals (MAP)</option>
                          <option value="No Meals">No Meals</option>
                        </select>
                      </Row>
                      <div style={{ marginTop: 10 }}>
                        <input className="input-field" placeholder="Suggested Travel (e.g. Flight COK-MAA, AC Sedan transfer, 4h)" value={day.transport || ''}
                          onChange={e => updateItinerary(i, 'transport', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn" onClick={addDay}
                    style={{ border: '2px dashed var(--primary)', color: 'var(--primary)', width: '100%', marginTop: 10 }}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Add Day
                  </button>
                </Section>

                {/* INCLUSIONS / EXCLUSIONS */}
                <Section id="inclEx" title="✅ Inclusions & Exclusions">
                  <Field label="Inclusions (one per line) *">
                    <textarea required name="inclusions" className="input-field" rows="5"
                      placeholder="Hotel accommodation&#10;Daily breakfast&#10;All transfers&#10;Tour guide" value={formData.inclusions} onChange={handleChange} />
                  </Field>
                  <Field label="Exclusions (one per line) *">
                    <textarea required name="exclusions" className="input-field" rows="5"
                      placeholder="Flight tickets&#10;Personal expenses&#10;Travel insurance" value={formData.exclusions} onChange={handleChange} />
                  </Field>
                  <Field label="Optional Add-ons (one per line)">
                    <textarea name="optionalAddons" className="input-field" rows="3"
                      placeholder="Houseboat upgrade&#10;Ayurvedic massage" value={formData.optionalAddons} onChange={handleChange} />
                  </Field>
                </Section>

                {/* PRICING */}
                <Section id="pricing" title="💰 Pricing & Offers">
                  <Row>
                    <Field label="Original Price (₹) *">
                      <input required type="number" name="originalPrice" className="input-field" placeholder="50000" value={formData.originalPrice} onChange={handleChange} />
                    </Field>
                    <Field label="Offer Price (₹)">
                      <input type="number" name="offerPrice" className="input-field" placeholder="45000" value={formData.offerPrice} onChange={handleChange} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Offer Valid Until">
                      <input type="date" name="offerValidity" className="input-field" value={formData.offerValidity} onChange={handleChange} />
                    </Field>
                    <Field label="Special Offer?">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        <input type="checkbox" name="isSpecialOffer" id="isSpecialOffer" checked={formData.isSpecialOffer} onChange={handleChange} style={{ width: 20, height: 20 }} />
                        <label htmlFor="isSpecialOffer">Mark as Special Offer</label>
                      </div>
                    </Field>
                  </Row>
                </Section>

                {/* TERMS */}
                <Section id="terms" title="📄 Terms, Conditions & Policies">
                  <Field label="Terms & Conditions">
                    <textarea name="termsAndConditions" className="input-field" rows="4"
                      placeholder="Payment terms, booking conditions..." value={formData.termsAndConditions} onChange={handleChange} />
                  </Field>
                  <Field label="Cancellation Policy">
                    <textarea name="cancellationPolicy" className="input-field" rows="4"
                      placeholder="30 days before: 100% refund&#10;15 days before: 50% refund..." value={formData.cancellationPolicy} onChange={handleChange} />
                  </Field>
                </Section>

                {/* SEO */}
                <Section id="seo" title="🔍 SEO Details">
                  <Field label="SEO Title">
                    <input name="seoTitle" className="input-field" placeholder="Kerala Tour Package - 5 Days | SreePayanam" value={formData.seoTitle} onChange={handleChange} />
                  </Field>
                  <Field label="SEO Meta Description">
                    <textarea name="seoMetaDescription" className="input-field" rows="3"
                      placeholder="Book the best Kerala tour package..." value={formData.seoMetaDescription} onChange={handleChange} />
                  </Field>
                </Section>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  {editingId && (
                    <button
                      type="button"
                      className="btn"
                      style={{ flex: 1, border: '1.5px solid #cbd5e1', background: 'white', padding: '14px', fontSize: '1.1rem', fontWeight: 700 }}
                      onClick={handleCancelEdit}
                    >
                      ❌ Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={loading}
                    style={{ flex: 2, padding: '14px', fontSize: '1.1rem' }}>
                    {loading ? (editingId ? 'Saving Changes...' : 'Creating Package...') : (editingId ? '💾 Update Package' : '🚀 Create Package')}
                  </button>
                </div>
              </form>
            </div>

            {/* Package List */}
            <div style={{ position: 'sticky', top: 90 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 20, color: 'var(--dark)', fontSize: '1.2rem', fontWeight: 700 }}>
                  📦 All Packages ({packages.length})
                </h3>
                {packages.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No packages yet. Add one!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
                    {packages.map(pkg => (
                      <div key={pkg._id} className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <img src={pkg.imageUrl} alt={pkg.title}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=80&q=60'; }}
                          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)', marginBottom: 4 }}>{pkg.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {pkg.packageCategory} • {pkg.tourType}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginTop: 2 }}>
                            ₹{(pkg.offerPrice || pkg.originalPrice || pkg.price || 0).toLocaleString()}
                            {' '}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• {pkg.durationDays}D/{pkg.durationNights}N</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleEditClick(pkg)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 6 }}
                            title="Edit package details"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6 }}
                            title="Delete package"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'enquiries' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30, alignItems: 'start' }}>
            {/* Enquiries List */}
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 24, color: 'var(--dark)' }}>📞 CRM Leads &amp; Enquiries</h2>
              
              {enquiriesLoading ? (
                <p style={{ textAlign: 'center', padding: '40px 0' }}>Loading enquiries...</p>
              ) : enquiries.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No customer enquiries received yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {enquiries.map(enq => {
                    const scoreInfo = scoredLeads[enq._id];
                    return (
                      <div key={enq._id} className="glass-card" style={{ padding: 24, border: '1px solid #e2e8f0', background: 'white' }}>
                        {/* Top Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                          <div>
                            <span style={{ 
                              background: enq.enquiryType?.includes('Hotel') ? '#fdf2f8' : enq.enquiryType?.includes('Flight') ? '#eff6ff' : enq.enquiryType?.includes('Train') ? '#ecfdf5' : enq.enquiryType?.includes('Car') ? '#f5f3ff' : '#f1f5f9',
                              color: enq.enquiryType?.includes('Hotel') ? '#db2777' : enq.enquiryType?.includes('Flight') ? '#2563eb' : enq.enquiryType?.includes('Train') ? '#059669' : enq.enquiryType?.includes('Car') ? '#7c3aed' : '#475569',
                              padding: '4px 10px', 
                              borderRadius: 20, 
                              fontSize: '0.78rem', 
                              fontWeight: 700, 
                              marginRight: 8 
                            }}>
                              {enq.enquiryType}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Submitted {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <select 
                              className="input-field" 
                              style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, borderRadius: 6 }}
                              value={enq.status}
                              onChange={e => handleStatusChange(enq._id, e.target.value)}
                            >
                              {['New', 'Contacted', 'Quotation Sent', 'Follow-up Required', 'Payment Pending', 'Confirmed', 'Cancelled', 'Closed'].map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>{enq.customerName}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: 14 }}>
                          <div>📞 {enq.mobileNumber}</div>
                          {enq.emailId && <div>✉️ {enq.emailId}</div>}
                          {enq.travelDate && !enq.enquiryType?.includes('Hotel') && <div>📅 Travel: {new Date(enq.travelDate).toLocaleDateString('en-IN')}</div>}
                          {enq.numberOfPassengers && !enq.enquiryType?.includes('Hotel') && <div>👥 {enq.numberOfPassengers} Passengers</div>}
                          {enq.budget && <div>💰 Budget: ₹{enq.budget.toLocaleString()}</div>}
                        </div>

                        {/* Specialized Service Metadata Grid */}
                        {(enq.enquiryType?.includes('Hotel') || enq.enquiryType?.includes('Flight') || enq.enquiryType?.includes('Train') || enq.enquiryType?.includes('Car')) && (
                          <div style={{ 
                            background: enq.enquiryType?.includes('Hotel') ? '#fff5f5' : enq.enquiryType?.includes('Flight') ? '#f0f7ff' : enq.enquiryType?.includes('Train') ? '#f0fdf4' : '#faf5ff', 
                            border: '1px solid ' + (enq.enquiryType?.includes('Hotel') ? '#fed7d7' : enq.enquiryType?.includes('Flight') ? '#bfe0ff' : enq.enquiryType?.includes('Train') ? '#bbf7d0' : '#e9d5ff'),
                            borderRadius: 12, 
                            padding: 16, 
                            marginBottom: 14, 
                            fontSize: '0.88rem' 
                          }}>
                            <div style={{ 
                              fontWeight: 800, 
                              color: enq.enquiryType?.includes('Hotel') ? '#c53030' : enq.enquiryType?.includes('Flight') ? '#1d4ed8' : enq.enquiryType?.includes('Train') ? '#15803d' : '#6b21a8', 
                              marginBottom: 8, 
                              fontSize: '0.82rem', 
                              letterSpacing: 0.5, 
                              textTransform: 'uppercase' 
                            }}>
                              🛠️ Booking Details ({enq.enquiryType})
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, color: 'var(--text-main)' }}>
                              {enq.enquiryType?.includes('Hotel') && (
                                <>
                                  {enq.toLocation && <div>📍 <strong>Destination:</strong> {enq.toLocation}</div>}
                                  {enq.hotelCheckIn && <div>📅 <strong>Check-in:</strong> {new Date(enq.hotelCheckIn).toLocaleDateString('en-IN')}</div>}
                                  {enq.hotelCheckOut && <div>📅 <strong>Check-out:</strong> {new Date(enq.hotelCheckOut).toLocaleDateString('en-IN')}</div>}
                                  {enq.hotelRooms && <div>🛏️ <strong>Rooms:</strong> {enq.hotelRooms} Room(s)</div>}
                                  {enq.hotelCategory && <div>🌟 <strong>Category:</strong> {enq.hotelCategory}</div>}
                                  <div>👥 <strong>Guests:</strong> {enq.adultCount || 0} Adult(s), {enq.childCount || 0} Child(ren)</div>
                                </>
                              )}
                              {enq.enquiryType?.includes('Flight') && (
                                <>
                                  {enq.fromLocation && <div>🛫 <strong>From:</strong> {enq.fromLocation}</div>}
                                  {enq.toLocation && <div>🛬 <strong>To:</strong> {enq.toLocation}</div>}
                                  {enq.flightType && <div>✈️ <strong>Trip Type:</strong> {enq.flightType}</div>}
                                  {enq.flightClass && <div>💺 <strong>Cabin Class:</strong> {enq.flightClass}</div>}
                                  {enq.returnDate && <div>📅 <strong>Return Date:</strong> {new Date(enq.returnDate).toLocaleDateString('en-IN')}</div>}
                                </>
                              )}
                              {enq.enquiryType?.includes('Train') && (
                                <>
                                  {enq.fromLocation && <div>🚉 <strong>From:</strong> {enq.fromLocation}</div>}
                                  {enq.toLocation && <div>🚉 <strong>To:</strong> {enq.toLocation}</div>}
                                  {enq.trainClass && <div>💺 <strong>Class:</strong> {enq.trainClass}</div>}
                                </>
                              )}
                              {enq.enquiryType?.includes('Car') && (
                                <>
                                  {enq.fromLocation && <div>📍 <strong>City:</strong> {enq.fromLocation}</div>}
                                  {enq.carType && <div>🚙 <strong>Car Type:</strong> {enq.carType}</div>}
                                  {enq.carDriverOption && <div>👤 <strong>Option:</strong> {enq.carDriverOption}</div>}
                                  {enq.returnDate && <div>📅 <strong>Return:</strong> {new Date(enq.returnDate).toLocaleDateString('en-IN')}</div>}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {enq.remarks && (
                          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                            <strong>Remarks:</strong> {enq.remarks}
                          </div>
                        )}

                        {enq.detailedPreferences && (
                          <div style={{ marginTop: 10, marginBottom: 14 }}>
                            <button
                              type="button"
                              onClick={() => setExpandedPrefs(prev => ({ ...prev, [enq._id]: !prev[enq._id] }))}
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.8rem',
                                padding: '6px 12px',
                                fontWeight: 700,
                                border: '1.5px solid #cbd5e1',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              📋 {expandedPrefs[enq._id] ? 'Hide' : 'Show'} 10-Section AI Preferences
                            </button>

                            {expandedPrefs[enq._id] && (
                              <div style={{
                                marginTop: 10,
                                padding: 18,
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: 12,
                                fontSize: '0.82rem',
                                color: 'var(--text-main)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 16
                              }}>
                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>👤 Customer Info</div>
                                  <div><strong>Preferred Contact:</strong> {enq.detailedPreferences.contact_method}</div>
                                  <div><strong>Location:</strong> {enq.detailedPreferences.location || 'N/A'}</div>
                                  {enq.detailedPreferences.whatsapp_number && <div><strong>WhatsApp:</strong> {enq.detailedPreferences.whatsapp_number}</div>}
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>🗺️ Trip & Vibe</div>
                                  <div><strong>Category:</strong> {enq.detailedPreferences.travel_category}</div>
                                  <div><strong>Type:</strong> {enq.detailedPreferences.tour_type}</div>
                                  <div><strong>Dates:</strong> {enq.detailedPreferences.travel_start_date || 'N/A'} to {enq.detailedPreferences.return_date || 'N/A'}</div>
                                  <div><strong>Duration:</strong> {enq.detailedPreferences.num_days}D / {enq.detailedPreferences.num_nights}N</div>
                                  <div><strong>Flexibility:</strong> {enq.detailedPreferences.date_flexibility}</div>
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>👥 Passengers</div>
                                  <div><strong>Total Pax:</strong> {enq.detailedPreferences.total_passengers}</div>
                                  <div><strong>Gender:</strong> {enq.detailedPreferences.num_male}M / {enq.detailedPreferences.num_female}F</div>
                                  {enq.detailedPreferences.num_seniors > 0 && <div><strong>Seniors:</strong> {enq.detailedPreferences.num_seniors}</div>}
                                  {enq.detailedPreferences.num_children > 0 && <div><strong>Children:</strong> {enq.detailedPreferences.num_children} ({enq.detailedPreferences.children_ages || 'N/A'})</div>}
                                  {enq.detailedPreferences.num_infants > 0 && <div><strong>Infants:</strong> {enq.detailedPreferences.num_infants} ({enq.detailedPreferences.infant_ages || 'N/A'})</div>}
                                  {enq.detailedPreferences.special_assistance && <div style={{ color: '#b45309' }}><strong>Assistance:</strong> {enq.detailedPreferences.special_assistance}</div>}
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>🏨 Accommodation</div>
                                  <div><strong>Required:</strong> {enq.detailedPreferences.hotel_required}</div>
                                  {enq.detailedPreferences.hotel_required === 'Yes' && (
                                    <>
                                      <div><strong>Category:</strong> {enq.detailedPreferences.hotel_category}</div>
                                      <div><strong>Rooms:</strong> {enq.detailedPreferences.num_rooms} ({enq.detailedPreferences.room_type})</div>
                                      <div><strong>Extra Bed:</strong> {enq.detailedPreferences.extra_bed}</div>
                                      <div><strong>Location Vibe:</strong> {enq.detailedPreferences.preferred_location || 'N/A'}</div>
                                      <div><strong>Access:</strong> {[enq.detailedPreferences.lift_required && 'Lift', enq.detailedPreferences.wheelchair_friendly && 'Wheelchair'].filter(Boolean).join(', ') || 'Standard'}</div>
                                    </>
                                  )}
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>🍽️ Meal Plan</div>
                                  <div><strong>Meals:</strong> {enq.detailedPreferences.meal_required}</div>
                                  {enq.detailedPreferences.meal_required === 'Yes' && (
                                    <>
                                      <div><strong>Plan:</strong> {enq.detailedPreferences.meal_plan}</div>
                                      <div><strong>Diet:</strong> {enq.detailedPreferences.food_preference}</div>
                                      {enq.detailedPreferences.special_meal && <div><strong>Special:</strong> {enq.detailedPreferences.special_meal}</div>}
                                    </>
                                  )}
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>🚗 Transit & Car</div>
                                  <div><strong>Tickets:</strong> {[enq.detailedPreferences.flight_ticket && 'Flight', enq.detailedPreferences.train_ticket && 'Train', enq.detailedPreferences.bus_ticket && 'Bus'].filter(Boolean).join(', ') || 'None'}</div>
                                  <div><strong>Local Car:</strong> {enq.detailedPreferences.local_transport} ({enq.detailedPreferences.vehicle_category}, {enq.detailedPreferences.ac_preference})</div>
                                  <div><strong>Transit Type:</strong> {enq.detailedPreferences.transport_type}</div>
                                  <div><strong>Pickup/Drop:</strong> {enq.detailedPreferences.pickup_location || 'N/A'} / {enq.detailedPreferences.drop_location || 'N/A'}</div>
                                  {enq.detailedPreferences.luggage_details && <div><strong>Luggage:</strong> {enq.detailedPreferences.luggage_details}</div>}
                                  <div><strong>Language:</strong> {enq.detailedPreferences.driver_language}</div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>🏛️ Sightseeing & Pace</div>
                                  <div><strong>Pace:</strong> {enq.detailedPreferences.travel_pace} | <strong>Interest:</strong> {enq.detailedPreferences.interest_type}</div>
                                  {enq.detailedPreferences.places_to_cover && <div><strong>Places to Cover:</strong> {enq.detailedPreferences.places_to_cover}</div>}
                                  <div><strong>Guide:</strong> {enq.detailedPreferences.guide_required}</div>
                                  <div><strong>Inclusions:</strong> {[enq.detailedPreferences.entry_tickets && 'Monument Tickets', enq.detailedPreferences.special_darshan && 'Temple Darshan', enq.detailedPreferences.ritual_pooja && 'Ritual Pooja'].filter(Boolean).join(', ') || 'None'}</div>
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>🛂 Passport & Visa</div>
                                  <div><strong>Passport:</strong> {enq.detailedPreferences.passport_available} (Expires: {enq.detailedPreferences.passport_validity || 'N/A'})</div>
                                  <div><strong>Visa Service:</strong> {enq.detailedPreferences.visa_assistance}</div>
                                  <div><strong>Insurance:</strong> {enq.detailedPreferences.travel_insurance} ({enq.detailedPreferences.insurance_type})</div>
                                  <div><strong>Nationality:</strong> {enq.detailedPreferences.nationality}</div>
                                </div>

                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>💰 Budget & Pricing</div>
                                  <div><strong>Level:</strong> {enq.detailedPreferences.budget_type}</div>
                                  <div><strong>Approx:</strong> {enq.detailedPreferences.approx_budget ? `${enq.detailedPreferences.currency} ${enq.detailedPreferences.approx_budget}` : 'N/A'}</div>
                                  <div><strong>Costing:</strong> {enq.detailedPreferences.price_preference}</div>
                                  {enq.detailedPreferences.inclusions_preference && <div><strong>Preferred Incls:</strong> {enq.detailedPreferences.inclusions_preference}</div>}
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>✨ Specials & Extras</div>
                                  {enq.detailedPreferences.emergency_contact && <div><strong>Emergency contact:</strong> {enq.detailedPreferences.emergency_contact}</div>}
                                  {enq.detailedPreferences.special_arrangement && <div><strong>Arrangements:</strong> {enq.detailedPreferences.special_arrangement}</div>}
                                  {enq.detailedPreferences.other_request && <div><strong>Other:</strong> {enq.detailedPreferences.other_request}</div>}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Lead Score Area */}
                        {scoreInfo ? (
                          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: 16, borderRadius: 12, marginTop: 14, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            {scoreInfo.loading ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 14, height: 14, border: '2px solid #d97706', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                Scoring lead with OpenAI...
                              </div>
                            ) : scoreInfo.error ? (
                              <div style={{ color: '#ef4444' }}>Error scoring lead: {scoreInfo.error}</div>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 800 }}>Lead Score:</span>
                                  <span style={{
                                    background: scoreInfo.score === 'Hot' ? '#ef4444' : scoreInfo.score === 'Warm' ? '#f59e0b' : '#3b82f6',
                                    color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem'
                                  }}>
                                    {scoreInfo.score} Lead
                                  </span>
                                  <span style={{ fontWeight: 800, marginLeft: 8 }}>Urgency:</span>
                                  <span>{scoreInfo.urgency}</span>
                                </div>
                                <p style={{ margin: '4px 0 8px' }}><strong>Reasoning:</strong> {scoreInfo.reasoning}</p>
                                <p style={{ margin: '4px 0 8px' }}><strong>Next Action:</strong> {scoreInfo.suggestedAction}</p>
                                
                                {/* Follow-up Message */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, marginTop: 8, position: 'relative' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>AI Draft Message:</div>
                                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{scoreInfo.followUpMessage}</p>
                                  <button 
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ marginTop: 8, padding: '4px 10px', fontSize: '0.75rem' }}
                                    onClick={() => {
                                      navigator.clipboard.writeText(scoreInfo.followUpMessage);
                                      alert('Copied follow-up draft message to clipboard!');
                                    }}
                                  >
                                    Copy Message
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn"
                            onClick={() => handleScoreLead(enq)}
                            style={{ border: '1.5px dashed var(--primary)', color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                          >
                            🪄 Run CRM AI Lead Score
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CRM Stats & Tools Panel */}
            <div>
              <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--dark)' }}>📊 CRM Stats Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{enquiries.length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Leads</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
                      {enquiries.filter(e => e.status === 'New').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>New Leads</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>
                      {enquiries.filter(e => e.status === 'Quotation Sent' || e.status === 'Follow-up Required').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Follow-up</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                      {enquiries.filter(e => e.status === 'Confirmed').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed</div>
                  </div>
                </div>
              </div>

              {/* Currency Converter */}
              <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--dark)' }}>💱 Currency Converter</h3>
                <CurrencyConverterTool />
              </div>

              {/* Weather Forecast */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--dark)' }}>🌦️ Local Weather Planner</h3>
                <WeatherPlannerTool />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30, alignItems: 'start' }}>
            {/* Bookings CRM List */}
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 24, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                💼 Paid Booking CRM &amp; Financial Audit
              </h2>
              
              {/* Stats Summary Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
                    ₹{bookings.reduce((sum, b) => sum + b.paidAmount, 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, marginTop: 2 }}>TOTAL REVENUE</div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>
                    ₹{bookings.reduce((sum, b) => sum + b.pendingAmount, 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700, marginTop: 2 }}>PENDING BALANCE</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb' }}>
                    {bookings.filter(b => b.payments.some(p => p.status === 'Pending Verification')).length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700, marginTop: 2 }}>UNVERIFIED CLAIMS</div>
                </div>
              </div>

              {/* Filters Panel */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, background: '#f8fafc', padding: 12, borderRadius: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Booking Status:</span>
                  <select className="input-field" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', border: '1px solid #cbd5e1', borderRadius: 6 }} value={bookingFilterStatus} onChange={e => setBookingFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Payment Status:</span>
                  <select className="input-field" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', border: '1px solid #cbd5e1', borderRadius: 6 }} value={bookingFilterPayment} onChange={e => setBookingFilterPayment(e.target.value)}>
                    <option value="All">All Payments</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                  </select>
                </div>
              </div>

              {/* Bookings List */}
              {bookingsLoading ? (
                <p style={{ textAlign: 'center', padding: '40px 0' }}>Loading bookings ledger...</p>
              ) : bookings.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No bookings found matching filters.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {bookings
                    .filter(b => bookingFilterStatus === 'All' || b.bookingStatus === bookingFilterStatus)
                    .filter(b => bookingFilterPayment === 'All' || b.paymentStatus === bookingFilterPayment)
                    .map(b => {
                      const hasPendingClaim = b.payments.some(p => p.status === 'Pending Verification');
                      return (
                        <div key={b._id} className="glass-card" style={{ padding: 20, border: '1px solid #e2e8f0', background: 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)', marginRight: 10 }}>
                                {b.bookingId}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {hasPendingClaim && (
                                <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>
                                  ⚠️ Audit Required
                                </span>
                              )}
                              <span style={{ 
                                background: b.bookingStatus === 'Confirmed' ? '#ecfdf5' : b.bookingStatus === 'Pending' ? '#fffbeb' : b.bookingStatus === 'Completed' ? '#eff6ff' : '#fef2f2',
                                color: b.bookingStatus === 'Confirmed' ? '#059669' : b.bookingStatus === 'Pending' ? '#d97706' : b.bookingStatus === 'Completed' ? '#2563eb' : '#dc2626',
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800
                              }}>
                                {b.bookingStatus}
                              </span>
                              <span style={{ 
                                background: b.paymentStatus === 'Fully Paid' ? '#ecfdf5' : b.paymentStatus === 'Partially Paid' ? '#fffbeb' : '#fef2f2',
                                color: b.paymentStatus === 'Fully Paid' ? '#059669' : b.paymentStatus === 'Partially Paid' ? '#d97706' : '#dc2626',
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800
                              }}>
                                {b.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <h3 style={{ fontWeight: 800, color: 'var(--dark)', fontSize: '0.98rem', marginBottom: 6 }}>{b.customerName}</h3>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                            {b.packageName} ({b.numberOfPassengers} pax) • Travel: {new Date(b.travelDate).toLocaleDateString('en-IN')}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: 12, marginTop: 8 }}>
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem' }}>
                              <div>Total: <strong>₹{b.totalAmount.toLocaleString()}</strong></div>
                              <div style={{ color: '#059669' }}>Paid: <strong>₹{b.paidAmount.toLocaleString()}</strong></div>
                              {b.pendingAmount > 0 && <div style={{ color: '#b91c1c' }}>Bal: <strong>₹{b.pendingAmount.toLocaleString()}</strong></div>}
                            </div>

                            <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: 6 }} onClick={() => setSelectedBooking(b)}>
                              🔍 Audit File
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div>
              {/* Auditing Center Summary */}
              <div className="glass-card" style={{ padding: 24, marginBottom: 20, background: 'white' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14, color: 'var(--dark)' }}>⚠️ Pending Verification Queue</h3>
                {bookings.filter(b => b.payments.some(p => p.status === 'Pending Verification')).length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: '10px 0' }}>No pending payments to audit.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bookings.filter(b => b.payments.some(p => p.status === 'Pending Verification')).slice(0, 3).map(b => (
                      <div key={b._id} style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: 10, borderRadius: 8, fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--dark)' }}>
                          <span>{b.bookingId}</span>
                          <span style={{ color: '#b45309' }}>₹{b.payments.find(p => p.status === 'Pending Verification')?.amount.toLocaleString()}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
                          {b.customerName} via {b.payments.find(p => p.status === 'Pending Verification')?.paymentMethod}
                        </div>
                        <button type="button" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem', width: '100%', marginTop: 6, borderRadius: 4 }} onClick={() => setSelectedBooking(b)}>
                          Open Verification File
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency Converter */}
              <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--dark)' }}>💱 Currency Converter</h3>
                <CurrencyConverterTool />
              </div>

              {/* Weather Forecast */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--dark)' }}>🌦️ Local Weather Planner</h3>
                <WeatherPlannerTool />
              </div>
            </div>
          </div>
        )}

        {/* BOOKING DETAILS SIDE DRAWER / MODAL */}
        <AnimatePresence>
          {selectedBooking && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
              display: 'flex', justifyContent: 'flex-end', zIndex: 9999, padding: 0
            }}>
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ background: 'white', width: '100%', maxWidth: 500, height: '100vh', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.8, letterSpacing: 0.5 }}>BOOKING CRM FILE</div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>{selectedBooking.bookingId}</h3>
                  </div>
                  <button type="button" onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Drawer Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* 1. File Metadata */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>👤 Customer &amp; Tour Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      <div><strong>Customer Name:</strong> {selectedBooking.customerName}</div>
                      <div><strong>Mobile Number:</strong> {selectedBooking.mobileNumber}</div>
                      <div><strong>Email Address:</strong> {selectedBooking.emailId}</div>
                      <div><strong>Package Booked:</strong> {selectedBooking.packageName}</div>
                      <div><strong>Date of Travel:</strong> {new Date(selectedBooking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div><strong>Group Size:</strong> {selectedBooking.numberOfPassengers} Person(s) ({selectedBooking.adultCount} Adults, {selectedBooking.childCount || 0} Children)</div>
                      {selectedBooking.remarks && <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, marginTop: 4 }}><strong>Special Requests:</strong> {selectedBooking.remarks}</div>}
                    </div>
                  </div>

                  <div style={{ height: 1, background: '#e2e8f0' }} />

                  {/* 2. Booking Action Center */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>⚙️ Booking Status Control</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Update Status:</span>
                      <select
                        className="input-field"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
                        value={selectedBooking.bookingStatus}
                        onChange={e => handleBookingStatusUpdate(selectedBooking._id, e.target.value)}
                      >
                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ height: 1, background: '#e2e8f0' }} />

                  {/* 3. Ledgers & Financials */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>💰 Financial Ledger</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.8rem', textAlign: 'center', marginBottom: 10 }}>
                      <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Total</span>
                        <strong>₹{selectedBooking.totalAmount.toLocaleString()}</strong>
                      </div>
                      <div style={{ background: '#ecfdf5', padding: 10, borderRadius: 8 }}>
                        <span style={{ color: '#047857', display: 'block', marginBottom: 2 }}>Collected</span>
                        <strong style={{ color: '#059669' }}>₹{selectedBooking.paidAmount.toLocaleString()}</strong>
                      </div>
                      <div style={{ background: '#fef2f2', padding: 10, borderRadius: 8 }}>
                        <span style={{ color: '#b91c1c', display: 'block', marginBottom: 2 }}>Pending</span>
                        <strong style={{ color: '#dc2626' }}>₹{selectedBooking.pendingAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: '#e2e8f0' }} />

                  {/* 4. Payment Claims verification Center */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>⚠️ Payment Verification claims</h4>
                    {selectedBooking.payments.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No payment references submitted for this file yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {selectedBooking.payments.map((p, idx) => (
                          <div key={p._id || idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: 12, borderRadius: 8, fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 4 }}>
                              <span>Method: {p.paymentMethod}</span>
                              <span>₹{p.amount.toLocaleString()}</span>
                            </div>
                            <div>Ref/UTR: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{p.transactionId}</strong></div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              Submitted: {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                            </div>
                            {p.notes && <div style={{ background: 'white', padding: 6, borderRadius: 4, marginTop: 6, fontStyle: 'italic', fontSize: '0.75rem' }}>"{p.notes}"</div>}
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                              <span>Status: 
                                <strong style={{ 
                                  marginLeft: 6,
                                  color: p.status === 'Success' ? '#059669' : p.status === 'Failed' ? '#dc2626' : '#d97706'
                                }}>
                                  {p.status}
                                </strong>
                              </span>
                              
                              {p.status === 'Pending Verification' && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', borderRadius: 4 }} onClick={() => handleVerifyPayment(selectedBooking._id, p._id, 'approve')}>
                                    Approve
                                  </button>
                                  <button type="button" className="btn" style={{ background: '#ef4444', color: 'white', padding: '4px 8px', fontSize: '0.72rem', borderRadius: 4 }} onClick={() => handleVerifyPayment(selectedBooking._id, p._id, 'reject')}>
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ height: 1, background: '#e2e8f0' }} />

                  {/* 5. Private CRM Staff Logs */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>📝 Private CRM Staff Logs</h4>
                    
                    {/* Append Note Form */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Add private staff note..."
                        style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#f8fafc' }}
                        value={staffNoteText}
                        onChange={e => setStaffNoteText(e.target.value)}
                      />
                      <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 6 }} onClick={() => handleAppendStaffNote(selectedBooking._id)}>
                        Append
                      </button>
                    </div>

                    {selectedBooking.notes.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No staff logs added to this file yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedBooking.notes.map((n, idx) => (
                          <div key={idx} style={{ background: '#fdf4ff', border: '1px solid #f3e8ff', padding: 8, borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-main)' }}>
                            <p style={{ margin: 0 }}>{n.text}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#7c3aed', marginTop: 4 }}>
                              <span>By: {n.addedBy}</span>
                              <span>{new Date(n.addedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CurrencyConverterTool = () => {
  const [inr, setInr] = useState(10000);
  const [currency, setCurrency] = useState('USD');
  const rates = { USD: 0.012, AED: 0.044, EUR: 0.011, SGD: 0.016, MYR: 0.056, THB: 0.44 };
  const converted = (inr * rates[currency]).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Amount in INR (₹)</label>
        <input 
          type="number" 
          className="input-field" 
          value={inr} 
          onChange={e => setInr(e.target.value)} 
          style={{ padding: '6px 12px', marginTop: 4 }} 
        />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Currency</label>
        <select 
          className="input-field" 
          value={currency} 
          onChange={e => setCurrency(e.target.value)}
          style={{ padding: '6px 12px', marginTop: 4 }}
        >
          <option value="USD">USD ($)</option>
          <option value="AED">AED (Dh)</option>
          <option value="EUR">Euro (€)</option>
          <option value="SGD">SGD ($)</option>
          <option value="MYR">MYR (RM)</option>
          <option value="THB">THB (฿)</option>
        </select>
      </div>
      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', color: 'var(--secondary)' }}>
        {currency} {Number(converted).toLocaleString()}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
        * Currency conversion is approximate and subject to live exchange rate variation.
      </div>
    </div>
  );
};

const WeatherPlannerTool = () => {
  const [city, setCity] = useState('Chennai');
  const [weather, setWeather] = useState({ temp: 32, condition: 'Sunny & Humid ☀️', tips: 'Best time is November to February.' });

  const weatherData = {
    Chennai: { temp: 32, condition: 'Sunny & Humid ☀️', tips: 'Best time is November to February.' },
    Kerala: { temp: 28, condition: 'Light Showers 🌧️', tips: 'Best time is September to March.' },
    Rajasthan: { temp: 35, condition: 'Hot & Dry 🏜️', tips: 'Best time is October to March.' },
    Goa: { temp: 30, condition: 'Pleasant Breeze 🏝️', tips: 'Best time is November to February.' },
    Dubai: { temp: 38, condition: 'Clear Sky ☀️', tips: 'Best time is November to April.' },
    Singapore: { temp: 29, condition: 'Humid Showers 🌦️', tips: 'Best time is December to June.' },
  };

  const handleSelect = (val) => {
    setCity(val);
    setWeather(weatherData[val] || { temp: 25, condition: 'Pleasant ⛅', tips: 'Best time is year-round.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <select 
        className="input-field" 
        value={city} 
        onChange={e => handleSelect(e.target.value)}
        style={{ padding: '6px 12px' }}
      >
        <option value="Chennai">Chennai</option>
        <option value="Kerala">Kerala</option>
        <option value="Rajasthan">Rajasthan</option>
        <option value="Goa">Goa</option>
        <option value="Dubai">Dubai</option>
        <option value="Singapore">Singapore</option>
      </select>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
        <span style={{ fontWeight: 700 }}>{weather.condition}</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)' }}>{weather.temp}°C</span>
      </div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <strong>Travel Tip:</strong> {weather.tips}
      </p>
    </div>
  );
};

const sty = {
  loginWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' },
  loginBox: { padding: 40, width: '100%', maxWidth: 400 },
  loginIcon: { width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  errBox: { background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.9rem' },
  succBox: { background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.9rem' },
  section: { border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  sectionHead: { width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: 'none', cursor: 'pointer' },
  sectionBody: { padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  dayCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 12 },
};

const fld = { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 };
const lbl = { fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center' };

const optionCardStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  textAlign: 'left'
};

const optionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '8px'
};

const badgeStyle = {
  background: '#f1f5f9',
  color: '#475569',
  fontSize: '0.68rem',
  padding: '2px 6px',
  borderRadius: '4px',
  fontWeight: 600
};

const matchReasonStyle = {
  background: '#fffbeb',
  color: '#b45309',
  fontSize: '0.75rem',
  padding: '6px 10px',
  borderRadius: '6px',
  marginTop: '2px',
  textAlign: 'left'
};

export default AdminPage;
