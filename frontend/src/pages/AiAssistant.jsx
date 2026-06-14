import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Bot, User, MapPin, Clock, Plane, Train, Car,
  Home, Utensils, Download, Phone, ArrowRight, ChevronDown, ChevronUp,
  RefreshCw, FileText, CheckCircle, XCircle, Users, Calendar, AlertCircle
} from 'lucide-react';

const AiAssistant = () => {
  // Tab control: 'guided' or 'chat'
  const [activeTab, setActiveTab] = useState('guided');

  // Guided planner form state
  const [form, setForm] = useState({
    destination: '',
    startingCity: '',
    endingCity: '',
    durationDays: 5,
    durationNights: 4,
    transportType: 'Flight',
    hotelCategory: 'Premium',
    travelType: 'Family',
    customPrompt: ''
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

  // Quick Book Modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({ name: '', phone: '', email: '', date: '', passengers: 2 });
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);

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

  // Handle guided planner generation
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!form.destination.trim()) return;

    setPlannerLoading(true);
    setPlanResult(null);
    try {
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

  // Handle Quick Book Enquiry Submission
  const handleQuickBookSubmit = async (e) => {
    e.preventDefault();
    setBookSubmitting(true);
    try {
      const remarks = `AI-Generated Custom Plan Enquiry:
Title: ${planResult.title}
Destination: ${planResult.destination}
Duration: ${planResult.durationDays} Days / ${planResult.durationNights} Nights
Accommodation Level: ${form.hotelCategory}
Transport Preference: ${form.transportType}
Estimated Price Range: ${planResult.estimatedPrice}

Custom Client Notes: Interested in booking this AI-customized package.`;

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryType: 'Tour Package Enquiry',
          customerName: bookForm.name,
          mobileNumber: bookForm.phone,
          emailId: bookForm.email,
          travelDate: bookForm.date,
          numberOfPassengers: bookForm.passengers,
          remarks
        })
      });
      if (res.ok) {
        setBookSuccess(true);
      } else {
        alert('Could not submit enquiry. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting enquiry request.');
    } finally {
      setBookSubmitting(false);
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
    text += `Generated via SreePayanam AI Assistant. Book now!\n`;

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

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        
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
              📋 Guided Planner
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
                <form onSubmit={handleGeneratePlan} className="glass-card" style={{ padding: 32, background: 'white', border: '1px solid #cbd5e1' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                    Tell us about your dream trip
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Destination */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={styles.label}>Where do you want to go? *</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
                        <input
                          required
                          className="input-field"
                          placeholder="e.g. Kerala, Kashmir, Himachal, Maldives, Switzerland..."
                          style={{ paddingLeft: 42, width: '100%' }}
                          value={form.destination}
                          onChange={e => setForm(prev => ({ ...prev, destination: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Start City */}
                    <div>
                      <label style={styles.label}>Starting Point (Start City)</label>
                      <input
                        className="input-field"
                        placeholder="e.g. Chennai, Bangalore, Delhi"
                        style={{ width: '100%' }}
                        value={form.startingCity}
                        onChange={e => setForm(prev => ({ ...prev, startingCity: e.target.value }))}
                      />
                    </div>

                    {/* End City */}
                    <div>
                      <label style={styles.label}>Ending Point (End City)</label>
                      <input
                        className="input-field"
                        placeholder="e.g. Madurai, Bangalore, Delhi"
                        style={{ width: '100%' }}
                        value={form.endingCity}
                        onChange={e => setForm(prev => ({ ...prev, endingCity: e.target.value }))}
                      />
                    </div>

                    {/* Days */}
                    <div>
                      <label style={styles.label}>Duration Days</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={form.durationDays}
                        onChange={e => setForm(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 5 }))}
                      />
                    </div>

                    {/* Nights */}
                    <div>
                      <label style={styles.label}>Duration Nights</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={form.durationNights}
                        onChange={e => setForm(prev => ({ ...prev, durationNights: parseInt(e.target.value) || 4 }))}
                      />
                    </div>
                  </div>

                  {/* Transport & Accommodation selectors */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={styles.label}>Preferred Mode of Transport</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {[
                        { name: 'Flight', icon: <Plane size={18} /> },
                        { name: 'Train', icon: <Train size={18} /> },
                        { name: 'Car', icon: <Car size={18} /> },
                        { name: 'None', icon: <XCircle size={18} /> }
                      ].map(t => (
                        <button
                          type="button"
                          key={t.name}
                          onClick={() => setForm(prev => ({ ...prev, transportType: t.name }))}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 8px',
                            borderRadius: 10,
                            border: '1px solid',
                            borderColor: form.transportType === t.name ? 'var(--primary)' : '#e2e8f0',
                            background: form.transportType === t.name ? 'rgba(99, 102, 241, 0.06)' : 'white',
                            color: form.transportType === t.name ? 'var(--primary)' : 'var(--text-main)',
                            fontWeight: form.transportType === t.name ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.icon}
                          <span style={{ fontSize: '0.8rem' }}>{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={styles.label}>Accommodation Category Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {[
                        { name: 'Budget', desc: 'Standard Stays' },
                        { name: 'Premium', desc: '4 Star Hotels' },
                        { name: 'Luxury', desc: '5 Star Resorts' }
                      ].map(h => (
                        <button
                          type="button"
                          key={h.name}
                          onClick={() => setForm(prev => ({ ...prev, hotelCategory: h.name }))}
                          style={{
                            padding: '12px 8px',
                            borderRadius: 10,
                            border: '1px solid',
                            borderColor: form.hotelCategory === h.name ? 'var(--primary)' : '#e2e8f0',
                            background: form.hotelCategory === h.name ? 'rgba(99, 102, 241, 0.06)' : 'white',
                            color: form.hotelCategory === h.name ? 'var(--primary)' : 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{h.name}</div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{h.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vibe / Type & Wishes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 24 }}>
                    <div>
                      <label style={styles.label}>Tour Type / Vacation Vibe</label>
                      <select
                        className="input-field"
                        style={{ width: '100%', height: 45 }}
                        value={form.travelType}
                        onChange={e => setForm(prev => ({ ...prev, travelType: e.target.value }))}
                      >
                        <option value="Family">👨‍👩‍👧‍👦 Family Vacation</option>
                        <option value="Honeymoon">💖 Romantic Honeymoon</option>
                        <option value="Solo">🎒 Solo Explorer</option>
                        <option value="Group">👥 Friends Group Adventure</option>
                        <option value="Pilgrimage">🙏 Spiritual/Pilgrimage</option>
                        <option value="Adventure">🧗 Thrilling Adventure</option>
                        <option value="Cultural">🏛️ Historical & Cultural Heritage</option>
                      </select>
                    </div>

                    <div>
                      <label style={styles.label}>Special Requests / Custom wishes</label>
                      <textarea
                        className="input-field"
                        rows="3"
                        placeholder="e.g. Include candlelight dinner, private guide in Shimla, organic tea garden tours, etc."
                        style={{ width: '100%', borderRadius: 10, padding: 12 }}
                        value={form.customPrompt}
                        onChange={e => setForm(prev => ({ ...prev, customPrompt: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  >
                    <Sparkles size={18} /> Compile Customized Itinerary
                  </button>
                </form>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
                  
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
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 16 }}>Interactive Daily Stepper</h3>
                    
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
                                          <Home size={14} /> Recommended Stay
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
                                          <Utensils size={14} /> Gastronomy Plan
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
                          <CheckCircle size={18} /> Plan Inclusions
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
                          <XCircle size={18} /> Plan Exclusions
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
                    <div className="glass-card" style={{ padding: 28, background: 'white', border: '1px solid #cbd5e1', marginBottom: 20 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>ESTIMATED PRICE RANGE</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: 20 }}>{planResult.estimatedPrice}</div>

                      <button
                        onClick={() => setShowBookModal(true)}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}
                      >
                        ⚡ Quick Book Itinerary
                      </button>

                      <button
                        onClick={downloadItineraryText}
                        className="btn"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1', color: 'var(--text-main)', cursor: 'pointer', marginBottom: 12 }}
                      >
                        <Download size={16} /> Download Itinerary
                      </button>

                      <button
                        onClick={() => setPlanResult(null)}
                        className="btn"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, background: 'transparent', border: '1px dashed #ef4444', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <RefreshCw size={16} /> Reset & Plan New
                      </button>
                    </div>

                    {/* Quality statement */}
                    <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <AlertCircle size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', lineHeight: 1.45 }}>
                        This is an AI generated custom proposal. Once submitted, our expert booking coordinators will double check the live availability of flights, cars, and rooms to finalize a quote.
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

      {/* Quick Booking Modal */}
      {showBookModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: 460, background: 'white', padding: 32, position: 'relative', border: '1px solid #cbd5e1' }}
          >
            <button
              onClick={() => { setShowBookModal(false); setBookSuccess(false); }}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              ✕
            </button>

            {bookSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
                <h3 style={{ color: '#16a34a', fontWeight: 800, marginBottom: 8 }}>Booking Enquiry Submitted!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 24 }}>
                  Thank you! Our tour operator team has received your custom AI proposal. We will call you within the next 2 hours.
                </p>
                <button
                  onClick={() => { setShowBookModal(false); setBookSuccess(false); }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: 12 }}
                >
                  Great, Thank You!
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 6, fontSize: '1.25rem' }}>Book Custom Proposal</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Fill in your details below to submit this itinerary. Our team will verify and lock the reservation.</p>

                <form onSubmit={handleQuickBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Name *</label>
                    <input
                      required
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="Your Full Name"
                      value={bookForm.name}
                      onChange={e => setBookForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="10-digit mobile number"
                      value={bookForm.phone}
                      onChange={e => setBookForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="yourname@gmail.com"
                      value={bookForm.email}
                      onChange={e => setBookForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Travel Date</label>
                      <input
                        type="date"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={bookForm.date}
                        onChange={e => setBookForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Passengers</label>
                      <input
                        type="number"
                        min="1"
                        className="input-field"
                        style={{ width: '100%' }}
                        value={bookForm.passengers}
                        onChange={e => setBookForm(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '12px', marginTop: 8, fontWeight: 800, fontSize: '0.95rem' }}
                    disabled={bookSubmitting}
                  >
                    {bookSubmitting ? 'Submitting...' : '⚡ Confirm Enquiry & Request Callback'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  }
};

export default AiAssistant;
