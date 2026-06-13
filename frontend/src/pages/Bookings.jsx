import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Hotel, Train, Car, User, Phone, Mail, Calendar, MapPin, 
  Users, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Award 
} from 'lucide-react';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('hotel'); // hotel, flight, train, car
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Common Customer Details
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    remarks: ''
  });

  // Hotel Booking Fields
  const [hotelFields, setHotelFields] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    rooms: '1',
    adults: '2',
    children: '0',
    category: '3 Star'
  });

  // Flight Booking Fields
  const [flightFields, setFlightFields] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: '1',
    flightClass: 'Economy',
    flightType: 'One-way'
  });

  // Train Booking Fields
  const [trainFields, setTrainFields] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    trainClass: 'AC 3 Tier'
  });

  // Car Rental Fields
  const [carFields, setCarFields] = useState({
    city: '',
    startDate: '',
    endDate: '',
    carType: 'Sedan',
    driverOption: 'Chauffeur-driven'
  });

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleHotelChange = (e) => {
    const { name, value } = e.target;
    setHotelFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFlightChange = (e) => {
    const { name, value } = e.target;
    setFlightFields(prev => ({ ...prev, [name]: value }));
  };

  const handleTrainChange = (e) => {
    const { name, value } = e.target;
    setTrainFields(prev => ({ ...prev, [name]: value }));
  };

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setCarFields(prev => ({ ...prev, [name]: value }));
  };

  // AI Recommendation States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiError, setAiError] = useState('');
  const [prefilledMessage, setPrefilledMessage] = useState('');

  const fetchAiSuggestions = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSuggestions(null);
    setPrefilledMessage('');

    let payload = {
      category: activeTab,
      customPrompt: customer.remarks
    };

    if (activeTab === 'hotel') {
      payload.destination = hotelFields.destination;
      payload.hotelCategory = hotelFields.category;
    } else if (activeTab === 'flight') {
      payload.startingCity = flightFields.from;
      payload.destination = flightFields.to;
      payload.flightClass = flightFields.flightClass;
    } else if (activeTab === 'train') {
      payload.startingCity = trainFields.from;
      payload.destination = trainFields.to;
      payload.trainClass = trainFields.trainClass;
    } else if (activeTab === 'car') {
      payload.startingCity = carFields.city;
      payload.carType = carFields.carType;
      payload.driverOption = carFields.driverOption;
    }

    try {
      const res = await fetch('/api/ai/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch suggestions');
      
      setAiSuggestions(data);
    } catch (err) {
      setAiError(err.message || 'AI engine is currently busy. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePreFill = (option) => {
    if (activeTab === 'hotel') {
      setHotelFields(prev => ({
        ...prev,
        destination: option.name,
        category: option.rating.includes('5') ? '5 Star / Luxury' : option.rating.includes('4') ? '4 Star' : option.rating.includes('3') ? '3 Star' : 'Budget'
      }));
      setCustomer(prev => ({
        ...prev,
        remarks: `Selected Stay: ${option.name} (${option.rating} - ${option.price}). Match reason: ${option.matchReason}. Features: ${option.amenities.join(', ')}`
      }));
      setPrefilledMessage(`🏨 Form pre-filled with ${option.name}!`);
    } else if (activeTab === 'flight') {
      setFlightFields(prev => ({
        ...prev,
        flightClass: option.class
      }));
      setCustomer(prev => ({
        ...prev,
        remarks: `Selected Flight: ${option.airline} (${option.route}, ${option.schedule}, Price: ${option.price}). Match reason: ${option.matchReason}`
      }));
      setPrefilledMessage(`✈️ Form pre-filled with ${option.airline}!`);
    } else if (activeTab === 'train') {
      setTrainFields(prev => ({
        ...prev,
        trainClass: option.class
      }));
      setCustomer(prev => ({
        ...prev,
        remarks: `Selected Train: ${option.name} (${option.route}, ${option.schedule}, Price: ${option.price}). Match reason: ${option.matchReason}`
      }));
      setPrefilledMessage(`🚆 Form pre-filled with ${option.name}!`);
    } else if (activeTab === 'car') {
      setCarFields(prev => ({
        ...prev,
        carType: option.type.includes('SUV') ? 'SUV (Innova/Ertiga)' : option.type.includes('Sedan') ? 'Premium Sedan' : option.type.includes('Hatchback') ? 'Hatchback' : option.type.includes('Luxury') ? 'Luxury (Audi/BMW)' : 'Traveller / Minibus',
        driverOption: option.driverOption
      }));
      setCustomer(prev => ({
        ...prev,
        remarks: `Selected Car: ${option.type} by ${option.operator} (${option.rate}). Features: ${option.features}. Match reason: ${option.matchReason}`
      }));
      setPrefilledMessage(`🚗 Form pre-filled with ${option.type}!`);
    }
    
    // Auto-clear prefill message after 4 seconds
    setTimeout(() => setPrefilledMessage(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    let payload = {
      customerName: customer.name,
      mobileNumber: customer.phone,
      emailId: customer.email,
      remarks: customer.remarks
    };

    if (activeTab === 'hotel') {
      payload.enquiryType = 'Hotel Booking';
      payload.toLocation = hotelFields.destination;
      payload.travelDate = hotelFields.checkIn ? new Date(hotelFields.checkIn) : undefined;
      payload.hotelCheckIn = hotelFields.checkIn ? new Date(hotelFields.checkIn) : undefined;
      payload.hotelCheckOut = hotelFields.checkOut ? new Date(hotelFields.checkOut) : undefined;
      payload.hotelRooms = Number(hotelFields.rooms);
      payload.adultCount = Number(hotelFields.adults);
      payload.childCount = Number(hotelFields.children);
      payload.numberOfPassengers = Number(hotelFields.adults) + Number(hotelFields.children);
      payload.hotelCategory = hotelFields.category;
    } else if (activeTab === 'flight') {
      payload.enquiryType = 'Flight Booking';
      payload.fromLocation = flightFields.from;
      payload.toLocation = flightFields.to;
      payload.travelDate = flightFields.departDate ? new Date(flightFields.departDate) : undefined;
      payload.returnDate = flightFields.returnDate && flightFields.flightType === 'Round-trip' ? new Date(flightFields.returnDate) : undefined;
      payload.numberOfPassengers = Number(flightFields.passengers);
      payload.flightClass = flightFields.flightClass;
      payload.flightType = flightFields.flightType;
    } else if (activeTab === 'train') {
      payload.enquiryType = 'Train Booking';
      payload.fromLocation = trainFields.from;
      payload.toLocation = trainFields.to;
      payload.travelDate = trainFields.date ? new Date(trainFields.date) : undefined;
      payload.numberOfPassengers = Number(trainFields.passengers);
      payload.trainClass = trainFields.trainClass;
    } else if (activeTab === 'car') {
      payload.enquiryType = 'Car Rental';
      payload.fromLocation = carFields.city;
      payload.travelDate = carFields.startDate ? new Date(carFields.startDate) : undefined;
      payload.returnDate = carFields.endDate ? new Date(carFields.endDate) : undefined;
      payload.carType = carFields.carType;
      payload.carDriverOption = carFields.driverOption;
    }

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      setSubmittedData(payload);
      setSuccess(true);
      // Reset only forms, keep customer contact filled for convenience
      setCustomer(prev => ({ ...prev, remarks: '' }));
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!submittedData) return '';
    const number = '919443217654'; // SreePayanam WhatsApp
    let text = `Hello SreePayanam! ✈️\n\nI just submitted a booking request on your website:\n`;
    text += `👤 *Name:* ${submittedData.customerName}\n`;
    text += `📞 *Phone:* ${submittedData.mobileNumber}\n`;
    text += `💼 *Service:* ${submittedData.enquiryType}\n`;

    if (submittedData.enquiryType === 'Hotel Booking') {
      text += `🏨 *Destination:* ${submittedData.toLocation}\n`;
      text += `📅 *Stay:* ${new Date(submittedData.hotelCheckIn).toLocaleDateString('en-IN')} to ${new Date(submittedData.hotelCheckOut).toLocaleDateString('en-IN')}\n`;
      text += `🛏️ *Rooms:* ${submittedData.hotelRooms} Room(s) (${submittedData.hotelCategory})\n`;
      text += `👥 *Guests:* ${submittedData.adultCount} Adult(s), ${submittedData.childCount} Child(ren)\n`;
    } else if (submittedData.enquiryType === 'Flight Booking') {
      text += `🛫 *Route:* ${submittedData.fromLocation} ➔ ${submittedData.toLocation}\n`;
      text += `📅 *Depart:* ${new Date(submittedData.travelDate).toLocaleDateString('en-IN')}\n`;
      if (submittedData.flightType === 'Round-trip' && submittedData.returnDate) {
        text += `📅 *Return:* ${new Date(submittedData.returnDate).toLocaleDateString('en-IN')}\n`;
      }
      text += `💺 *Class:* ${submittedData.flightClass} (${submittedData.flightType})\n`;
      text += `👥 *Passengers:* ${submittedData.numberOfPassengers}\n`;
    } else if (submittedData.enquiryType === 'Train Booking') {
      text += `🚆 *Route:* ${submittedData.fromLocation} ➔ ${submittedData.toLocation}\n`;
      text += `📅 *Journey:* ${new Date(submittedData.travelDate).toLocaleDateString('en-IN')}\n`;
      text += `💺 *Class:* ${submittedData.trainClass}\n`;
      text += `👥 *Passengers:* ${submittedData.numberOfPassengers}\n`;
    } else if (submittedData.enquiryType === 'Car Rental') {
      text += `🚗 *City:* ${submittedData.fromLocation}\n`;
      text += `📅 *Period:* ${new Date(submittedData.travelDate).toLocaleDateString('en-IN')} to ${new Date(submittedData.returnDate).toLocaleDateString('en-IN')}\n`;
      text += `🚙 *Car Type:* ${submittedData.carType}\n`;
      text += `👤 *Option:* ${submittedData.carDriverOption}\n`;
    }

    if (submittedData.remarks) {
      text += `📝 *Notes:* ${submittedData.remarks}\n`;
    }

    text += `\nPlease confirm and send me quotes as soon as possible. Thank you!`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  const tabs = [
    { id: 'hotel', label: 'Hotels', icon: Hotel, color: '#ec4899', desc: 'Premium & Budget Stays' },
    { id: 'flight', label: 'Flights', icon: Plane, color: '#3b82f6', desc: 'Domestic & International' },
    { id: 'train', label: 'Trains', icon: Train, color: '#10b981', desc: 'Seamless Rail Journey' },
    { id: 'car', label: 'Car Rental', icon: Car, color: '#8b5cf6', desc: 'Local & Outstation Rides' }
  ];

  return (
    <div className="page-container" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '60px 20px 140px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="container" style={{ maxWidth: 800 }}>
          <span style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 30, fontSize: '0.82rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#93c5fd' }}>
            Multi-Service Bookings
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginTop: 12, marginBottom: 12 }}>Book Custom Travel Services</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
            Reserve high-quality hotels, flight itineraries, train tickets, and professional car rentals curated by SreePayanam expert team.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, marginTop: -90, position: 'relative', zIndex: 10 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSuccess(false); setError(''); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '20px 10px',
                  borderRadius: 16,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isSel ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: isSel ? '0 10px 25px -5px rgba(30,58,138,0.1)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                  borderBottom: isSel ? `4px solid ${tab.color}` : '4px solid transparent'
                }}
              >
                <div style={{
                  background: isSel ? tab.color : '#f1f5f9',
                  color: isSel ? 'white' : '#64748b',
                  padding: 10,
                  borderRadius: '50%',
                  display: 'flex',
                  transition: 'all 0.3s'
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSel ? 'var(--dark)' : '#475569' }}>{tab.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>{tab.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Form Wrap */}
        <div className="glass-card" style={{ padding: '36px', overflow: 'hidden', backgroundColor: 'white', borderRadius: 20 }}>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '20px 0' }}
              >
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={44} color="#16a34a" />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Booking Submitted Successfully!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 24px' }}>
                  Our professional travel operations desk has received your request. We are already looking up quotes to give you the best deals.
                </p>

                {/* WhatsApp Accelerator Card */}
                <div style={{ background: '#ecfdf5', border: '1.5px dashed #10b981', padding: 24, borderRadius: 16, maxWidth: 550, margin: '0 auto 30px', textAlign: 'left' }}>
                  <h4 style={{ color: '#065f46', fontWeight: 800, fontSize: '1.05rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    💬 Instant Quote Accelerator
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#047857', marginBottom: 16, lineHeight: 1.5 }}>
                    Click below to open WhatsApp and instantly ping our travel agent with your submission details. This cuts response time to under 10 minutes!
                  </p>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{
                      background: '#10b981',
                      color: 'white',
                      width: '100%',
                      padding: '12px 20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}
                  >
                    <MessageSquare size={18} /> Ping Agent on WhatsApp Now
                  </a>
                </div>

                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #cbd5e1' }}
                  onClick={() => setSuccess(false)}
                >
                  Submit Another Booking
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', gap: 30, flexWrap: 'wrap', alignItems: 'stretch' }}>
                  
                  {/* Left Column: Booking Form */}
                  <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column', gap: 24, minWidth: 320 }}>
                    {/* 1. Customer Contact Details */}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: 10, marginBottom: 16 }}>
                        👤 Customer Contact Details
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                        <div style={fld}>
                          <label style={lbl}><User size={14} style={{ marginRight: 6 }} /> Full Name *</label>
                          <input 
                            type="text" 
                            required 
                            name="name" 
                            className="input-field" 
                            placeholder="e.g. Rahul Sharma" 
                            value={customer.name}
                            onChange={handleCustomerChange}
                          />
                        </div>
                        <div style={fld}>
                          <label style={lbl}><Phone size={14} style={{ marginRight: 6 }} /> Mobile Number *</label>
                          <input 
                            type="text" 
                            required 
                            name="phone" 
                            className="input-field" 
                            placeholder="e.g. +91 98765 43210" 
                            value={customer.phone}
                            onChange={handleCustomerChange}
                          />
                        </div>
                        <div style={fld}>
                          <label style={lbl}><Mail size={14} style={{ marginRight: 6 }} /> Email Address *</label>
                          <input 
                            type="email" 
                            required 
                            name="email" 
                            className="input-field" 
                            placeholder="e.g. rahul@example.com" 
                            value={customer.email}
                            onChange={handleCustomerChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Service Specific Fields */}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark)', borderLeft: `4px solid ${tabs.find(t => t.id === activeTab).color}`, paddingLeft: 10, marginBottom: 16 }}>
                        ✨ Service Specific Parameters
                      </h3>

                      {activeTab === 'hotel' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={fld}>
                            <label style={lbl}><MapPin size={14} style={{ marginRight: 6 }} /> Destination City / Hotel Name *</label>
                            <input 
                              type="text" 
                              required 
                              name="destination" 
                              className="input-field" 
                              placeholder="e.g. Munnar, Kerala or Taj Mahal Palace Mumbai" 
                              value={hotelFields.destination}
                              onChange={handleHotelChange}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Check-in Date *</label>
                              <input 
                                type="date" 
                                required 
                                name="checkIn" 
                                className="input-field" 
                                value={hotelFields.checkIn}
                                onChange={handleHotelChange}
                              />
                            </div>
                            <div style={fld}>
                              <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Check-out Date *</label>
                              <input 
                                type="date" 
                                required 
                                name="checkOut" 
                                className="input-field" 
                                value={hotelFields.checkOut}
                                onChange={handleHotelChange}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                            <div style={fld}>
                              <label style={lbl}>Rooms *</label>
                              <select name="rooms" className="input-field" value={hotelFields.rooms} onChange={handleHotelChange}>
                                {['1','2','3','4','5+'].map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}>Adults *</label>
                              <select name="adults" className="input-field" value={hotelFields.adults} onChange={handleHotelChange}>
                                {['1','2','3','4','5','6+'].map(a => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}>Children</label>
                              <select name="children" className="input-field" value={hotelFields.children} onChange={handleHotelChange}>
                                {['0','1','2','3+'].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}>Category *</label>
                              <select name="category" className="input-field" value={hotelFields.category} onChange={handleHotelChange}>
                                {['Budget', '3 Star', '4 Star', '5 Star / Luxury', 'Premium Resort'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'flight' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}><MapPin size={14} style={{ marginRight: 6 }} /> From City / Airport *</label>
                              <input 
                                type="text" 
                                required 
                                name="from" 
                                className="input-field" 
                                placeholder="e.g. Chennai (MAA)" 
                                value={flightFields.from}
                                onChange={handleFlightChange}
                              />
                            </div>
                            <div style={fld}>
                              <label style={lbl}><MapPin size={14} style={{ marginRight: 6 }} /> To City / Airport *</label>
                              <input 
                                type="text" 
                                required 
                                name="to" 
                                className="input-field" 
                                placeholder="e.g. Dubai (DXB) or Mumbai (BOM)" 
                                value={flightFields.to}
                                onChange={handleFlightChange}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}>Trip Type *</label>
                              <select name="flightType" className="input-field" value={flightFields.flightType} onChange={handleFlightChange}>
                                <option value="One-way">One-Way</option>
                                <option value="Round-trip">Round-Trip</option>
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Departure Date *</label>
                              <input 
                                type="date" 
                                required 
                                name="departDate" 
                                className="input-field" 
                                value={flightFields.departDate}
                                onChange={handleFlightChange}
                              />
                            </div>
                            {flightFields.flightType === 'Round-trip' && (
                              <div style={fld}>
                                <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Return Date *</label>
                                <input 
                                  type="date" 
                                  required={flightFields.flightType === 'Round-trip'} 
                                  name="returnDate" 
                                  className="input-field" 
                                  value={flightFields.returnDate}
                                  onChange={handleFlightChange}
                                />
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}><Users size={14} style={{ marginRight: 6 }} /> Passengers Count *</label>
                              <select name="passengers" className="input-field" value={flightFields.passengers} onChange={handleFlightChange}>
                                {['1','2','3','4','5','6','7+'].map(p => <option key={p} value={p}>{p} Passenger(s)</option>)}
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}>Cabin Class *</label>
                              <select name="flightClass" className="input-field" value={flightFields.flightClass} onChange={handleFlightChange}>
                                {['Economy', 'Premium Economy', 'Business Class', 'First Class'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'train' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}><MapPin size={14} style={{ marginRight: 6 }} /> Departure Station *</label>
                              <input 
                                type="text" 
                                required 
                                name="from" 
                                className="input-field" 
                                placeholder="e.g. Chennai Central (MAS)" 
                                value={trainFields.from}
                                onChange={handleTrainChange}
                              />
                            </div>
                            <div style={fld}>
                              <label style={lbl}><MapPin size={14} style={{ marginRight: 6 }} /> Arrival Station *</label>
                              <input 
                                type="text" 
                                required 
                                name="to" 
                                className="input-field" 
                                placeholder="e.g. New Delhi (NDLS)" 
                                value={trainFields.to}
                                onChange={handleTrainChange}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Journey Date *</label>
                              <input 
                                type="date" 
                                required 
                                name="date" 
                                className="input-field" 
                                value={trainFields.date}
                                onChange={handleTrainChange}
                              />
                            </div>
                            <div style={fld}>
                              <label style={lbl}><Users size={14} style={{ marginRight: 6 }} /> Passenger Count *</label>
                              <select name="passengers" className="input-field" value={trainFields.passengers} onChange={handleTrainChange}>
                                {['1','2','3','4','5','6+'].map(p => <option key={p} value={p}>{p} Passenger(s)</option>)}
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}>Preferred Class *</label>
                              <select name="trainClass" className="input-field" value={trainFields.trainClass} onChange={handleTrainChange}>
                                {['Sleeper (SL)', 'AC 3 Tier (3A)', 'AC 2 Tier (2A)', 'AC 1st Class (1A)', 'AC Chair Car (CC)'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'car' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={fld}>
                            <label style={lbl}><MapPin size={14} style={{ marginRight: 6 }} /> Pick-up City *</label>
                            <input 
                              type="text" 
                              required 
                              name="city" 
                              className="input-field" 
                              placeholder="e.g. Chennai or Ooty" 
                              value={carFields.city}
                              onChange={handleCarChange}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Rental Pick-up Date *</label>
                              <input 
                                type="date" 
                                required 
                                name="startDate" 
                                className="input-field" 
                                value={carFields.startDate}
                                onChange={handleCarChange}
                              />
                            </div>
                            <div style={fld}>
                              <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Rental Return Date *</label>
                              <input 
                                type="date" 
                                required 
                                name="endDate" 
                                className="input-field" 
                                value={carFields.endDate}
                                onChange={handleCarChange}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={fld}>
                              <label style={lbl}>Vehicle Preference *</label>
                              <select name="carType" className="input-field" value={carFields.carType} onChange={handleCarChange}>
                                {['Hatchback', 'Premium Sedan', 'SUV (Innova/Ertiga)', 'Luxury (Audi/BMW)', 'Traveller / Minibus'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div style={fld}>
                              <label style={lbl}>Driver Option *</label>
                              <select name="driverOption" className="input-field" value={carFields.driverOption} onChange={handleCarChange}>
                                <option value="Chauffeur-driven">Chauffeur-Driven (With professional driver)</option>
                                <option value="Self-drive">Self-Drive (Outstation/Local)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Remarks */}
                    <div style={fld}>
                      <label style={lbl}>📝 Special Requirements / Instructions</label>
                      <textarea 
                        name="remarks" 
                        className="input-field" 
                        rows="3" 
                        placeholder="Enter details like budget limit, multi-city flights, preferred hotels, specific train times, etc..."
                        value={customer.remarks}
                        onChange={handleCustomerChange}
                      />
                    </div>

                    {/* Errors */}
                    {error && (
                      <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                        ⚠️ {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{
                        padding: '14px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderRadius: 10,
                        boxShadow: '0 8px 20px -6px rgba(59,130,246,0.5)'
                      }}
                    >
                      {loading ? (
                        <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>Submit Booking Enquiry <ChevronRight size={18} /></>
                      )}
                    </button>
                  </div>

                  {/* Right Column: AI Suggestions Panel */}
                  <div style={{ flex: '1', minWidth: 320, background: '#f8fafc', border: '1.5px dashed var(--primary)', padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.8rem' }}>🤖</span>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                          SreePayanam AI Assistant
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                          Instant live travel suggestions & price optimization
                        </p>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#cbd5e1', margin: '4px 0' }} />

                    {prefilledMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}
                      >
                        {prefilledMessage}
                      </motion.div>
                    )}

                    {aiSuggestions ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            TOP 5 MATCHING OPTIONS:
                          </span>
                          <button 
                            type="button" 
                            onClick={fetchAiSuggestions} 
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            🔄 Refresh
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '420px', overflowY: 'auto', paddingRight: 4 }}>
                          {activeTab === 'hotel' && aiSuggestions.hotels?.map(opt => (
                            <div key={opt.id} style={optionCardStyle}>
                              <div style={optionHeaderStyle}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{opt.name}</strong>
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
                              <div style={matchReasonStyle}>
                                💡 <em>{opt.matchReason}</em>
                              </div>
                              <div style={optionFooterStyle}>
                                <span style={priceStyle}>{opt.price}</span>
                                <button type="button" onClick={() => handlePreFill(opt)} className="btn btn-primary" style={prefillBtnStyle}>
                                  Select &amp; Pre-fill
                                </button>
                              </div>
                            </div>
                          ))}

                          {activeTab === 'flight' && aiSuggestions.flights?.map(opt => (
                            <div key={opt.id} style={optionCardStyle}>
                              <div style={optionHeaderStyle}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{opt.airline}</strong>
                                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                  {opt.class}
                                </span>
                              </div>
                              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                🛫 Route: {opt.route} <br />
                                🕒 {opt.schedule} ({opt.duration})
                              </p>
                              <div style={matchReasonStyle}>
                                💡 <em>{opt.matchReason}</em>
                              </div>
                              <div style={optionFooterStyle}>
                                <span style={priceStyle}>{opt.price}</span>
                                <button type="button" onClick={() => handlePreFill(opt)} className="btn btn-primary" style={prefillBtnStyle}>
                                  Select &amp; Pre-fill
                                </button>
                              </div>
                            </div>
                          ))}

                          {activeTab === 'train' && aiSuggestions.trains?.map(opt => (
                            <div key={opt.id} style={optionCardStyle}>
                              <div style={optionHeaderStyle}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{opt.name}</strong>
                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                  {opt.class}
                                </span>
                              </div>
                              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                🚉 Route: {opt.route} <br />
                                🕒 Schedule: {opt.schedule} ({opt.duration})
                              </p>
                              <div style={matchReasonStyle}>
                                💡 <em>{opt.matchReason}</em>
                              </div>
                              <div style={optionFooterStyle}>
                                <span style={priceStyle}>{opt.price}</span>
                                <button type="button" onClick={() => handlePreFill(opt)} className="btn btn-primary" style={prefillBtnStyle}>
                                  Select &amp; Pre-fill
                                </button>
                              </div>
                            </div>
                          ))}

                          {activeTab === 'car' && aiSuggestions.cars?.map(opt => (
                            <div key={opt.id} style={optionCardStyle}>
                              <div style={optionHeaderStyle}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{opt.type}</strong>
                                <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                  {opt.driverOption}
                                </span>
                              </div>
                              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                🚙 Operators: {opt.operator} <br />
                                ⚙️ {opt.features}
                              </p>
                              <div style={matchReasonStyle}>
                                💡 <em>{opt.matchReason}</em>
                              </div>
                              <div style={optionFooterStyle}>
                                <span style={priceStyle}>{opt.rate}</span>
                                <button type="button" onClick={() => handlePreFill(opt)} className="btn btn-primary" style={prefillBtnStyle}>
                                  Select &amp; Pre-fill
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                          Provide destination/dates on the left, then click below to explore top-rated flight options, handpicked boutique hotels, train routes, or customized transfers!
                        </p>

                        {aiError && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: 10, borderRadius: 8, fontSize: '0.8rem' }}>
                            {aiError}
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={aiLoading}
                          onClick={fetchAiSuggestions}
                          className="btn btn-primary"
                          style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
                            color: 'white',
                            padding: '12px 18px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            borderRadius: 10,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
                          }}
                        >
                          {aiLoading ? (
                            <>
                              <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              Analyzing Options...
                            </>
                          ) : (
                            <>🔮 Suggest Best Options via AI</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Brand Promises */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 40 }}>
          {[
            { icon: Briefcase, title: 'Professional Desk', desc: 'Managed by highly certified travel operations staff with over 15 years experience.' },
            { icon: Award, title: 'Best Tariff Guarantee', desc: 'Direct agent contracts with major airlines, consolidated hotel platforms, and car operators.' },
            { icon: MessageSquare, title: '24/7 Priority Support', desc: 'Full active support throughout your journey, for quick flight re-bookings, check-in, or road assistance.' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card" style={{ padding: 24, backgroundColor: 'white', border: '1px solid rgba(226,232,240,0.6)' }}>
                <div style={{ background: '#eff6ff', color: 'var(--primary)', padding: 12, borderRadius: 12, width: 'fit-content', marginBottom: 14 }}>
                  <Icon size={22} />
                </div>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const fld = { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 };
const lbl = { fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center' };

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

const optionFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '8px',
  gap: '8px'
};

const priceStyle = {
  fontSize: '0.98rem',
  fontWeight: 800,
  color: 'var(--secondary)'
};

const prefillBtnStyle = {
  padding: '4px 10px',
  fontSize: '0.72rem',
  fontWeight: 700,
  borderRadius: '6px',
  background: 'var(--primary)',
  border: 'none',
  color: 'white',
  cursor: 'pointer'
};

export default Bookings;
