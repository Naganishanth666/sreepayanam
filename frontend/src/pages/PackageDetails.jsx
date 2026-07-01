import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Users, Star, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Share2, Download, Phone,
  Calendar, Tag, Home, Utensils, ArrowLeft, MessageCircle,
  Plane, Car, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WHATSAPP_NUMBER = '919443217654'; // Real contact number

const PackageDetails = () => {
  const { isLoggedIn } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openDay, setOpenDay] = useState(0);
  const [enquiry, setEnquiry] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    passengers: 1,
    companyName: '',
    eventType: '',
    eventDurationDays: '',
    venuePreference: '',
    roomOccupancy: '',
    meetingRoomRequired: 'No',
    audioVisualRequired: 'No',
    teamBuildingActivities: 'No',
    galaDinnerRequired: 'No',
    approximatePax: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    medicalCondition: '',
    preferredTreatmentCountry: '',
    treatmentCategory: '',
    hospitalPreference: '',
    medicalHistoryDetails: '',
    visaAssistanceRequired: 'No',
    translatorRequired: 'No',
    accommodationForAttendants: 'No',
    wheelchairAssistance: 'No',
    cruiseLinePreference: '',
    cabinCategory: '',
    destinationCruise: '',
    durationNights: '',
    shoreExcursions: 'No',
    diningPreference: '',
    onboardGratuitiesPrepaid: 'No',
    institutionName: '',
    departmentGrade: '',
    contactPersonDesignation: '',
    numberOfStudents: '',
    numberOfTeachers: '',
    studySubjectFocus: '',
    industrialVisitRequired: 'No',
    guideLectureRequired: 'No',
    certificateOfParticipation: 'No',
    supervisorAccommodationSharing: 'Twin Sharing',
    coupleNames: '',
    marriageDate: '',
    honeymoonTheme: '',
    complimentaryBenefits: [],
    roomViewPreference: '',
    privatePoolVilla: 'No',
    photographyService: 'No',
    deityTempleName: '',
    primaryDestination: '',
    specialDarshanPasses: 'No',
    ritualPoojaArrangements: 'No',
    seniorCitizenAssistance: 'No',
    vegetarianJainFood: 'Standard',
    physicalDisabilityAssistance: 'None',
    dressCodeGuidelinesAccepted: 'No',
  });
  
  const handleBenefitChange = (benefit) => {
    setEnquiry(prev => {
      const current = prev.complimentaryBenefits || [];
      if (current.includes(benefit)) {
        return { ...prev, complimentaryBenefits: current.filter(b => b !== benefit) };
      } else {
        return { ...prev, complimentaryBenefits: [...current, benefit] };
      }
    });
  };
  
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/packages/${id}`)
      .then(r => r.json())
      .then(data => { setPkg(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryType: 'Tour Package',
          customerName: enquiry.name,
          mobileNumber: enquiry.phone,
          emailId: enquiry.email,
          travelDate: enquiry.date ? new Date(enquiry.date) : undefined,
          numberOfPassengers: enquiry.passengers ? Number(enquiry.passengers) : undefined,
          packageId: id,
          remarks: `Enquiry for: ${pkg?.title}`,
          detailedPreferences: enquiry,

          // MICE / Corporate
          companyName: enquiry.companyName,
          eventType: enquiry.eventType,
          eventDurationDays: enquiry.eventDurationDays ? Number(enquiry.eventDurationDays) : undefined,
          venuePreference: enquiry.venuePreference,
          roomOccupancy: enquiry.roomOccupancy,
          meetingRoomRequired: enquiry.meetingRoomRequired,
          audioVisualRequired: enquiry.audioVisualRequired,
          teamBuildingActivities: enquiry.teamBuildingActivities,
          galaDinnerRequired: enquiry.galaDinnerRequired,
          approximatePax: enquiry.approximatePax ? Number(enquiry.approximatePax) : undefined,

          // Medical
          patientName: enquiry.patientName,
          patientAge: enquiry.patientAge ? Number(enquiry.patientAge) : undefined,
          patientGender: enquiry.patientGender,
          medicalCondition: enquiry.medicalCondition,
          preferredTreatmentCountry: enquiry.preferredTreatmentCountry,
          treatmentCategory: enquiry.treatmentCategory,
          hospitalPreference: enquiry.hospitalPreference,
          medicalHistoryDetails: enquiry.medicalHistoryDetails,
          visaAssistanceRequired: enquiry.visaAssistanceRequired,
          translatorRequired: enquiry.translatorRequired,
          accommodationForAttendants: enquiry.accommodationForAttendants,
          wheelchairAssistance: enquiry.wheelchairAssistance,

          // Cruise
          cruiseLinePreference: enquiry.cruiseLinePreference,
          cabinCategory: enquiry.cabinCategory,
          destinationCruise: enquiry.destinationCruise,
          durationNights: enquiry.durationNights ? Number(enquiry.durationNights) : undefined,
          shoreExcursions: enquiry.shoreExcursions,
          diningPreference: enquiry.diningPreference,
          onboardGratuitiesPrepaid: enquiry.onboardGratuitiesPrepaid,

          // Educational
          institutionName: enquiry.institutionName,
          departmentGrade: enquiry.departmentGrade,
          contactPersonDesignation: enquiry.contactPersonDesignation,
          numberOfStudents: enquiry.numberOfStudents ? Number(enquiry.numberOfStudents) : undefined,
          numberOfTeachers: enquiry.numberOfTeachers ? Number(enquiry.numberOfTeachers) : undefined,
          studySubjectFocus: enquiry.studySubjectFocus,
          industrialVisitRequired: enquiry.industrialVisitRequired,
          guideLectureRequired: enquiry.guideLectureRequired,
          certificateOfParticipation: enquiry.certificateOfParticipation,
          supervisorAccommodationSharing: enquiry.supervisorAccommodationSharing,

          // Honeymoon
          coupleNames: enquiry.coupleNames,
          marriageDate: enquiry.marriageDate ? new Date(enquiry.marriageDate) : undefined,
          honeymoonTheme: enquiry.honeymoonTheme,
          complimentaryBenefits: enquiry.complimentaryBenefits,
          roomViewPreference: enquiry.roomViewPreference,
          privatePoolVilla: enquiry.privatePoolVilla,
          photographyService: enquiry.photographyService,

          // Pilgrimage
          deityTempleName: enquiry.deityTempleName,
          primaryDestination: enquiry.primaryDestination,
          specialDarshanPasses: enquiry.specialDarshanPasses,
          ritualPoojaArrangements: enquiry.ritualPoojaArrangements,
          seniorCitizenAssistance: enquiry.seniorCitizenAssistance,
          vegetarianJainFood: enquiry.vegetarianJainFood,
          physicalDisabilityAssistance: enquiry.physicalDisabilityAssistance,
          dressCodeGuidelinesAccepted: enquiry.dressCodeGuidelinesAccepted
        }),
      });
      setSubmitted(true);
    } catch (err) { console.error(err); }
  };

  const waMessage = pkg ? encodeURIComponent(`Hi! I'm interested in "${pkg.title}" package. Please share details.`) : '';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading package details...</p>
      </div>
    </div>
  );

  if (!pkg) return (
    <div style={{ textAlign: 'center', paddingTop: 140 }}>
      <h2>Package not found</h2>
      <Link to="/packages" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Browse Packages</Link>
    </div>
  );

  const price = pkg.offerPrice || pkg.originalPrice || pkg.price || 0;
  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
  const exclusions = Array.isArray(pkg.exclusions) ? pkg.exclusions : [];
  const addons = Array.isArray(pkg.optionalAddons) ? pkg.optionalAddons : [];
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const tabs = ['overview', 'itinerary', 'inclusions', 'policy'];

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingTop: 72 }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img
          src={pkg.imageUrl}
          alt={pkg.title}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

        {/* Back Button */}
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* Hero Info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 40px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={badge('#3b82f6')}>{pkg.packageCategory}</span>
              <span style={badge('#10b981')}>{pkg.tourType}</span>
              {pkg.isSpecialOffer && <span style={badge('#f59e0b')}>🔥 Special Offer</span>}
            </div>
            <h1 style={{ color: 'white', fontSize: '2.4rem', fontWeight: 800, marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{pkg.title}</h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {pkg.destination}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {pkg.durationDays}D / {pkg.durationNights}N</span>
              {pkg.startingCity && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /> {pkg.startingCity} → {pkg.endingCity}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 30, alignItems: 'start' }}>

        {/* Left */}
        <div>
          {/* Price Bar */}
          <div className="glass-card" style={{ padding: '20px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{price.toLocaleString()}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>per person</span>
              </div>
              {pkg.offerPrice && pkg.originalPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.1rem' }}>₹{pkg.originalPrice.toLocaleString()}</span>
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700 }}>
                    {Math.round((1 - pkg.offerPrice / pkg.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`} target="_blank" rel="noreferrer"
                style={{ background: '#25d366', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, textDecoration: 'none' }}>
                <MessageCircle size={18} /> WhatsApp
              </a>
              <button onClick={() => navigator.share?.({ title: pkg.title, url: window.location.href })}
                style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 12, padding: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ flex: 1, padding: '10px 8px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: activeTab === t ? 'var(--primary)' : 'transparent',
                  color: activeTab === t ? 'white' : 'var(--text-muted)' }}>
                {t === 'overview' ? '📋 Overview' : t === 'itinerary' ? '🗓️ Itinerary' : t === 'inclusions' ? '✅ Inclusions' : '📄 Policy'}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ marginBottom: 16, color: 'var(--dark)', fontSize: '1.3rem', fontWeight: 700 }}>Package Overview</h2>
                <p style={{ lineHeight: 1.9, color: 'var(--text-main)', fontSize: '1rem' }}>{pkg.overview || pkg.description}</p>
              </div>

              {/* Quick Facts */}
              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 18, color: 'var(--dark)', fontWeight: 700 }}>Quick Facts</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                  {[
                    { icon: <Clock size={20} color="var(--primary)" />, label: 'Duration', val: `${pkg.durationDays}D / ${pkg.durationNights}N` },
                    { icon: <MapPin size={20} color="var(--primary)" />, label: 'Destination', val: pkg.destination },
                    { icon: <Tag size={20} color="var(--primary)" />, label: 'Tour Type', val: pkg.tourType },
                    { icon: <Home size={20} color="var(--primary)" />, label: 'Category', val: pkg.packageCategory },
                    ...(pkg.startingCity ? [{ icon: <ArrowLeft size={20} color="var(--primary)" />, label: 'From', val: pkg.startingCity }] : []),
                    ...(pkg.endingCity ? [{ icon: <ArrowLeft size={20} color="var(--primary)" style={{ transform: 'rotate(180deg)' }} />, label: 'To', val: pkg.endingCity }] : []),
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ marginTop: 2 }}>{f.icon}</div>
                      <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</div><div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '0.95rem' }}>{f.val}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Itinerary */}
          {activeTab === 'itinerary' && (
            <motion.div key="it" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!isLoggedIn ? (
                <div style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #cbd5e1'
                }}>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    padding: 16,
                    borderRadius: '50%',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Lock size={32} />
                  </div>
                  <h3 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 8, fontSize: '1.25rem' }}>Itinerary Locked</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: 440, lineHeight: 1.6, marginBottom: 24 }}>
                    Log in or sign up for a free SreePayanam account to view the full, day-by-day travel plan and custom destinations!
                  </p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    Log In / Sign Up
                  </button>
                </div>
              ) : itinerary.length === 0 ? (
                <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No itinerary added yet.</div>
              ) : itinerary.map((day, i) => (
                <div key={i} className="glass-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
                  <button onClick={() => setOpenDay(openDay === i ? -1 : i)}
                    style={{ width: '100%', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: openDay === i ? 'var(--primary)' : 'white', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ background: openDay === i ? 'rgba(255,255,255,0.25)' : '#eff6ff', color: openDay === i ? 'white' : 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: '0.9rem' }}>Day {day.day}</span>
                      <span style={{ fontWeight: 700, color: openDay === i ? 'white' : 'var(--dark)' }}>{day.title || `Day ${day.day}`}</span>
                    </div>
                    {openDay === i ? <ChevronUp size={18} color={openDay === i ? 'white' : 'var(--text-muted)'} /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </button>
                  {openDay === i && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0' }}>
                      <p style={{ color: 'var(--text-main)', lineHeight: 1.8, marginBottom: day.hotel || day.transport ? 16 : 0 }}>{day.activities}</p>
                      {(day.hotel || day.mealPlan || day.transport) && (
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e2e8f0' }}>
                          {day.hotel && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}><Home size={16} color="var(--primary)" /> <strong>Hotel:</strong> {day.hotel}</span>}
                          {day.mealPlan && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}><Utensils size={16} color="var(--primary)" /> <strong>Meals:</strong> {day.mealPlan}</span>}
                          {day.transport && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}><Plane size={16} color="var(--primary)" /> <strong>Suggested Travel:</strong> {day.transport}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab: Inclusions */}
          {activeTab === 'inclusions' && (
            <motion.div key="inc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ color: '#16a34a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} /> Inclusions</h3>
                  {inclusions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Not specified.</p> :
                    inclusions.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                        <CheckCircle size={16} color="#16a34a" style={{ marginTop: 3, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{item}</span>
                      </div>
                    ))}
                </div>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ color: '#ef4444', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><XCircle size={20} /> Exclusions</h3>
                  {exclusions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Not specified.</p> :
                    exclusions.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                        <XCircle size={16} color="#ef4444" style={{ marginTop: 3, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{item}</span>
                      </div>
                    ))}
                </div>
              </div>
              {addons.length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: 16 }}>⭐ Optional Add-ons</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {addons.map((a, i) => (
                      <span key={i} style={{ background: '#eff6ff', color: 'var(--primary)', padding: '6px 14px', borderRadius: 20, fontSize: '0.9rem', fontWeight: 500 }}>+ {a}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Policy */}
          {activeTab === 'policy' && (
            <motion.div key="pol" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {pkg.termsAndConditions && (
                <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 16, color: 'var(--dark)', fontWeight: 700 }}>📋 Terms & Conditions</h3>
                  <p style={{ lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{pkg.termsAndConditions}</p>
                </div>
              )}
              {pkg.cancellationPolicy && (
                <div className="glass-card" style={{ padding: 28 }}>
                  <h3 style={{ marginBottom: 16, color: '#ef4444', fontWeight: 700 }}>🚫 Cancellation Policy</h3>
                  <p style={{ lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{pkg.cancellationPolicy}</p>
                </div>
              )}
              {!pkg.termsAndConditions && !pkg.cancellationPolicy && (
                <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Policy details not added yet.</div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 90 }}>
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            {!isLoggedIn ? (
              <div style={{
                textAlign: 'center',
                padding: '12px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  color: 'var(--primary)',
                  padding: 12,
                  borderRadius: '50%',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={20} />
                </div>
                <h3 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 8, fontSize: '1.1rem' }}>Booking & Enquiry Locked</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.45, marginBottom: 16 }}>
                  Please log in or sign up first to book online, request callbacks, or send custom WhatsApp enquiries.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px 16px', fontSize: '0.88rem', fontWeight: 700 }}
                >
                  Log In / Sign Up
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: 4, color: 'var(--dark)', fontWeight: 700, fontSize: '1.2rem' }}>Book / Enquire</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Secure your spot instantly or ask for callback details.</p>

                <Link 
                  to={`/checkout?packageId=${pkg._id}`} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: '1.02rem', textShadow: '0 1px 2px rgba(0,0,0,0.1)', marginBottom: 16 }}
                >
                  ⚡ Book &amp; Pay Online
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
                  <span>Or Ask callback</span>
                  <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
                </div>

                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                    <h4 style={{ color: '#16a34a', marginBottom: 8 }}>Enquiry Submitted!</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our team will call you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquiry} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input required className="input-field" placeholder="Your Name *" value={enquiry.name} onChange={e => setEnquiry(f => ({ ...f, name: e.target.value }))} />
                    <input required className="input-field" placeholder="Phone Number *" type="tel" value={enquiry.phone} onChange={e => setEnquiry(f => ({ ...f, phone: e.target.value }))} />
                    <input className="input-field" placeholder="Email Address" type="email" value={enquiry.email} onChange={e => setEnquiry(f => ({ ...f, email: e.target.value }))} />
                    <input className="input-field" type="date" value={enquiry.date} onChange={e => setEnquiry(f => ({ ...f, date: e.target.value }))} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Users size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <input className="input-field" type="number" min="1" placeholder="Passengers" value={enquiry.passengers} onChange={e => setEnquiry(f => ({ ...f, passengers: e.target.value }))} />
                    </div>

                    {/* Specialized Category Fields */}
                    {['MICE Tours', 'Corporate Tours', 'Medical Tours', 'Cruise Packages', 'School / College Tours', 'Education Tours', 'Honeymoon Tours', 'Pilgrimage Tours'].includes(pkg.tourType) && (
                      <div style={{
                        background: '#f8fafc',
                        border: '1.5px solid var(--primary)',
                        borderRadius: 8,
                        padding: 14,
                        marginTop: 4,
                        marginBottom: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          ✨ {pkg.tourType} Details
                        </h4>
                        
                        {(pkg.tourType === 'MICE Tours' || pkg.tourType === 'Corporate Tours') && (
                          <>
                            <input required className="input-field" placeholder="Company / Org Name *" value={enquiry.companyName} onChange={e => setEnquiry(f => ({ ...f, companyName: e.target.value }))} />
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.eventType} onChange={e => setEnquiry(f => ({ ...f, eventType: e.target.value }))}>
                              <option value="">Select Event Type *</option>
                              <option value="Meeting">Meeting</option>
                              <option value="Incentive Tour">Incentive Tour</option>
                              <option value="Conference">Conference</option>
                              <option value="Exhibition">Exhibition</option>
                              <option value="Team Building">Team Building</option>
                              <option value="Annual Meet">Annual Meet</option>
                              <option value="Product Launch">Product Launch</option>
                              <option value="Others">Others</option>
                            </select>
                            <input required type="number" min="1" className="input-field" placeholder="Event Duration (Days) *" value={enquiry.eventDurationDays} onChange={e => setEnquiry(f => ({ ...f, eventDurationDays: e.target.value }))} />
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.venuePreference} onChange={e => setEnquiry(f => ({ ...f, venuePreference: e.target.value }))}>
                              <option value="">Venue Preference</option>
                              <option value="Hotel Conference Hall">Hotel Conference Hall</option>
                              <option value="Convention Center">Convention Center</option>
                              <option value="Resort">Resort</option>
                              <option value="Outdoor">Outdoor</option>
                              <option value="Cruise">Cruise</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.roomOccupancy} onChange={e => setEnquiry(f => ({ ...f, roomOccupancy: e.target.value }))}>
                              <option value="">Room Occupancy</option>
                              <option value="Single">Single</option>
                              <option value="Double">Double</option>
                              <option value="Triple">Triple</option>
                              <option value="Twin Sharing">Twin Sharing</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.meetingRoomRequired} onChange={e => setEnquiry(f => ({ ...f, meetingRoomRequired: e.target.value }))}>
                              <option value="No">Meeting Room Required? No</option>
                              <option value="Yes">Meeting Room Required? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.audioVisualRequired} onChange={e => setEnquiry(f => ({ ...f, audioVisualRequired: e.target.value }))}>
                              <option value="No">Audio Visual Required? No</option>
                              <option value="Yes">Audio Visual Required? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.teamBuildingActivities} onChange={e => setEnquiry(f => ({ ...f, teamBuildingActivities: e.target.value }))}>
                              <option value="No">Team Building? No</option>
                              <option value="Yes">Team Building? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.galaDinnerRequired} onChange={e => setEnquiry(f => ({ ...f, galaDinnerRequired: e.target.value }))}>
                              <option value="No">Gala Dinner? No</option>
                              <option value="Yes">Gala Dinner? Yes</option>
                            </select>
                            <input required type="number" min="1" className="input-field" placeholder="Approximate Pax *" value={enquiry.approximatePax} onChange={e => setEnquiry(f => ({ ...f, approximatePax: e.target.value }))} />
                          </>
                        )}

                        {pkg.tourType === 'Medical Tours' && (
                          <>
                            <input required className="input-field" placeholder="Patient Name *" value={enquiry.patientName} onChange={e => setEnquiry(f => ({ ...f, patientName: e.target.value }))} />
                            <input required type="number" min="1" className="input-field" placeholder="Patient Age *" value={enquiry.patientAge} onChange={e => setEnquiry(f => ({ ...f, patientAge: e.target.value }))} />
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.patientGender} onChange={e => setEnquiry(f => ({ ...f, patientGender: e.target.value }))}>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <input required className="input-field" placeholder="Medical Condition *" value={enquiry.medicalCondition} onChange={e => setEnquiry(f => ({ ...f, medicalCondition: e.target.value }))} />
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.preferredTreatmentCountry} onChange={e => setEnquiry(f => ({ ...f, preferredTreatmentCountry: e.target.value }))}>
                              <option value="">Preferred Country *</option>
                              <option value="India">India</option>
                              <option value="Thailand">Thailand</option>
                              <option value="Singapore">Singapore</option>
                              <option value="Malaysia">Malaysia</option>
                              <option value="Germany">Germany</option>
                              <option value="Turkey">Turkey</option>
                              <option value="UAE">UAE</option>
                              <option value="Others">Others</option>
                            </select>
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.treatmentCategory} onChange={e => setEnquiry(f => ({ ...f, treatmentCategory: e.target.value }))}>
                              <option value="">Treatment Category *</option>
                              <option value="Cardiology">Cardiology</option>
                              <option value="Oncology">Oncology</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Dental">Dental</option>
                              <option value="Cosmetic">Cosmetic</option>
                              <option value="Health Checkup">Health Checkup</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.hospitalPreference} onChange={e => setEnquiry(f => ({ ...f, hospitalPreference: e.target.value }))}>
                              <option value="">Hospital Preference</option>
                              <option value="Apollo">Apollo</option>
                              <option value="Fortis">Fortis</option>
                              <option value="Max">Max</option>
                              <option value="Gleneagles">Gleneagles</option>
                              <option value="Bumrungrad">Bumrungrad</option>
                              <option value="Mount Elizabeth">Mount Elizabeth</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.visaAssistanceRequired} onChange={e => setEnquiry(f => ({ ...f, visaAssistanceRequired: e.target.value }))}>
                              <option value="No">Visa Assistance? No</option>
                              <option value="Yes">Visa Assistance? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.translatorRequired} onChange={e => setEnquiry(f => ({ ...f, translatorRequired: e.target.value }))}>
                              <option value="No">Translator? No</option>
                              <option value="Yes">Translator? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.accommodationForAttendants} onChange={e => setEnquiry(f => ({ ...f, accommodationForAttendants: e.target.value }))}>
                              <option value="No">Attendant Accommodation? No</option>
                              <option value="Yes">Attendant Accommodation? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.wheelchairAssistance} onChange={e => setEnquiry(f => ({ ...f, wheelchairAssistance: e.target.value }))}>
                              <option value="No">Wheelchair/Stretcher? No</option>
                              <option value="Yes">Wheelchair/Stretcher? Yes</option>
                            </select>
                            <textarea className="input-field" style={{ padding: '8px', width: '100%' }} rows="2" placeholder="Brief Medical History Details" value={enquiry.medicalHistoryDetails} onChange={e => setEnquiry(f => ({ ...f, medicalHistoryDetails: e.target.value }))}></textarea>
                          </>
                        )}

                        {pkg.tourType === 'Cruise Packages' && (
                          <>
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.cruiseLinePreference} onChange={e => setEnquiry(f => ({ ...f, cruiseLinePreference: e.target.value }))}>
                              <option value="">Cruise Line *</option>
                              <option value="Royal Caribbean">Royal Caribbean</option>
                              <option value="Costa Cruises">Costa Cruises</option>
                              <option value="Cordelia Cruises">Cordelia Cruises</option>
                              <option value="MSC Cruises">MSC Cruises</option>
                              <option value="Norwegian Cruise Line">Norwegian Cruise Line</option>
                              <option value="Princess Cruises">Princess Cruises</option>
                              <option value="Genting Dream">Genting Dream</option>
                              <option value="Singapore Cruises">Singapore Cruises</option>
                              <option value="Others">Others</option>
                            </select>
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.cabinCategory} onChange={e => setEnquiry(f => ({ ...f, cabinCategory: e.target.value }))}>
                              <option value="">Cabin Category *</option>
                              <option value="Interior Cabin">Interior Cabin</option>
                              <option value="Oceanview Cabin">Oceanview Cabin</option>
                              <option value="Balcony Cabin">Balcony Cabin</option>
                              <option value="Suite">Suite</option>
                              <option value="Luxury Suite">Luxury Suite</option>
                            </select>
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.destinationCruise} onChange={e => setEnquiry(f => ({ ...f, destinationCruise: e.target.value }))}>
                              <option value="">Destination Cruise *</option>
                              <option value="Singapore-Malaysia">Singapore-Malaysia</option>
                              <option value="Europe-Mediterranean">Europe-Mediterranean</option>
                              <option value="Caribbean">Caribbean</option>
                              <option value="Alaska">Alaska</option>
                              <option value="India Domestic">India Domestic</option>
                              <option value="Dubai-Gulf">Dubai-Gulf</option>
                              <option value="Others">Others</option>
                            </select>
                            <input required type="number" min="1" className="input-field" placeholder="Duration Nights *" value={enquiry.durationNights} onChange={e => setEnquiry(f => ({ ...f, durationNights: e.target.value }))} />
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.shoreExcursions} onChange={e => setEnquiry(f => ({ ...f, shoreExcursions: e.target.value }))}>
                              <option value="No">Shore Excursions? No</option>
                              <option value="Yes">Shore Excursions? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.diningPreference} onChange={e => setEnquiry(f => ({ ...f, diningPreference: e.target.value }))}>
                              <option value="">Dining Preference</option>
                              <option value="Main Dining Room">Main Dining Room</option>
                              <option value="Buffet">Buffet</option>
                              <option value="Specialty Dining">Specialty Dining</option>
                              <option value="Halal">Halal</option>
                              <option value="Vegetarian">Vegetarian</option>
                              <option value="Jain">Jain</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.onboardGratuitiesPrepaid} onChange={e => setEnquiry(f => ({ ...f, onboardGratuitiesPrepaid: e.target.value }))}>
                              <option value="No">Onboard Gratuities Prepaid? No</option>
                              <option value="Yes">Onboard Gratuities Prepaid? Yes</option>
                            </select>
                          </>
                        )}

                        {(pkg.tourType === 'School / College Tours' || pkg.tourType === 'Education Tours') && (
                          <>
                            <input required className="input-field" placeholder="Institution Name *" value={enquiry.institutionName} onChange={e => setEnquiry(f => ({ ...f, institutionName: e.target.value }))} />
                            <input required className="input-field" placeholder="Department / Grade *" value={enquiry.departmentGrade} onChange={e => setEnquiry(f => ({ ...f, departmentGrade: e.target.value }))} />
                            <input className="input-field" placeholder="Contact Designation" value={enquiry.contactPersonDesignation} onChange={e => setEnquiry(f => ({ ...f, contactPersonDesignation: e.target.value }))} />
                            <input required type="number" min="1" className="input-field" placeholder="Number of Students *" value={enquiry.numberOfStudents} onChange={e => setEnquiry(f => ({ ...f, numberOfStudents: e.target.value }))} />
                            <input required type="number" min="1" className="input-field" placeholder="Number of Teachers *" value={enquiry.numberOfTeachers} onChange={e => setEnquiry(f => ({ ...f, numberOfTeachers: e.target.value }))} />
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.studySubjectFocus} onChange={e => setEnquiry(f => ({ ...f, studySubjectFocus: e.target.value }))}>
                              <option value="">Study Focus Area</option>
                              <option value="Science">Science</option>
                              <option value="History">History</option>
                              <option value="Geography">Geography</option>
                              <option value="Business">Business</option>
                              <option value="Culture">Culture</option>
                              <option value="Industrial Visit">Industrial Visit</option>
                              <option value="Adventure">Adventure</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.industrialVisitRequired} onChange={e => setEnquiry(f => ({ ...f, industrialVisitRequired: e.target.value }))}>
                              <option value="No">Industrial Visit? No</option>
                              <option value="Yes">Industrial Visit? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.guideLectureRequired} onChange={e => setEnquiry(f => ({ ...f, guideLectureRequired: e.target.value }))}>
                              <option value="No">Guide/Lecture? No</option>
                              <option value="Yes">Guide/Lecture? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.certificateOfParticipation} onChange={e => setEnquiry(f => ({ ...f, certificateOfParticipation: e.target.value }))}>
                              <option value="No">Certificate? No</option>
                              <option value="Yes">Certificate? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.supervisorAccommodationSharing} onChange={e => setEnquiry(f => ({ ...f, supervisorAccommodationSharing: e.target.value }))}>
                              <option value="Twin Sharing">Supervisor Room: Twin</option>
                              <option value="Single">Supervisor Room: Single</option>
                            </select>
                          </>
                        )}

                        {pkg.tourType === 'Honeymoon Tours' && (
                          <>
                            <input required className="input-field" placeholder="Couple Names *" value={enquiry.coupleNames} onChange={e => setEnquiry(f => ({ ...f, coupleNames: e.target.value }))} />
                            <input required type="date" className="input-field" placeholder="Marriage Date *" value={enquiry.marriageDate} onChange={e => setEnquiry(f => ({ ...f, marriageDate: e.target.value }))} />
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.honeymoonTheme} onChange={e => setEnquiry(f => ({ ...f, honeymoonTheme: e.target.value }))}>
                              <option value="">Honeymoon Theme *</option>
                              <option value="Beach">Beach</option>
                              <option value="Hill Station">Hill Station</option>
                              <option value="Adventure">Adventure</option>
                              <option value="Luxury">Luxury</option>
                              <option value="Wildlife">Wildlife</option>
                              <option value="Heritage">Heritage</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.roomViewPreference} onChange={e => setEnquiry(f => ({ ...f, roomViewPreference: e.target.value }))}>
                              <option value="">Room View Preference</option>
                              <option value="Sea View">Sea View</option>
                              <option value="Mountain View">Mountain View</option>
                              <option value="Pool View">Pool View</option>
                              <option value="Garden View">Garden View</option>
                              <option value="Valley View">Valley View</option>
                              <option value="No Preference">No Preference</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.privatePoolVilla} onChange={e => setEnquiry(f => ({ ...f, privatePoolVilla: e.target.value }))}>
                              <option value="No">Private Pool Villa? No</option>
                              <option value="Yes">Private Pool Villa? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.photographyService} onChange={e => setEnquiry(f => ({ ...f, photographyService: e.target.value }))}>
                              <option value="No">Photography? No</option>
                              <option value="Yes">Photography? Yes</option>
                            </select>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Honeymoon Benefits:</span>
                              {["Bed Decoration", "Candle Light Dinner", "Honeymoon Cake"].map(benefit => {
                                const checked = (enquiry.complimentaryBenefits || []).includes(benefit);
                                return (
                                  <label key={benefit} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                    <input type="checkbox" checked={checked} onChange={() => handleBenefitChange(benefit)} />
                                    {benefit}
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {pkg.tourType === 'Pilgrimage Tours' && (
                          <>
                            <input required className="input-field" placeholder="Deity / Temple Name *" value={enquiry.deityTempleName} onChange={e => setEnquiry(f => ({ ...f, deityTempleName: e.target.value }))} />
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.primaryDestination} onChange={e => setEnquiry(f => ({ ...f, primaryDestination: e.target.value }))}>
                              <option value="">Primary Destination *</option>
                              <option value="Chardham">Chardham</option>
                              <option value="Varanasi">Varanasi</option>
                              <option value="Tirupati">Tirupati</option>
                              <option value="Sabarimala">Sabarimala</option>
                              <option value="Vaishno Devi">Vaishno Devi</option>
                              <option value="Hajj/Umrah">Hajj/Umrah</option>
                              <option value="Vatican">Vatican</option>
                              <option value="Buddhist Circuit">Buddhist Circuit</option>
                              <option value="Others">Others</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.specialDarshanPasses} onChange={e => setEnquiry(f => ({ ...f, specialDarshanPasses: e.target.value }))}>
                              <option value="No">Special Darshan? No</option>
                              <option value="Yes">Special Darshan? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.ritualPoojaArrangements} onChange={e => setEnquiry(f => ({ ...f, ritualPoojaArrangements: e.target.value }))}>
                              <option value="No">Pooja Arrangements? No</option>
                              <option value="Yes">Pooja Arrangements? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.seniorCitizenAssistance} onChange={e => setEnquiry(f => ({ ...f, seniorCitizenAssistance: e.target.value }))}>
                              <option value="No">Senior Assistance? No</option>
                              <option value="Yes">Senior Assistance? Yes</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.vegetarianJainFood} onChange={e => setEnquiry(f => ({ ...f, vegetarianJainFood: e.target.value }))}>
                              <option value="Standard">Food: Standard</option>
                              <option value="Pure Vegetarian">Food: Pure Vegetarian</option>
                              <option value="Jain Food">Food: Jain Food</option>
                            </select>
                            <select className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.physicalDisabilityAssistance} onChange={e => setEnquiry(f => ({ ...f, physicalDisabilityAssistance: e.target.value }))}>
                              <option value="None">Disability Assistance: None</option>
                              <option value="Wheelchair">Wheelchair</option>
                              <option value="Doli/Palanquin">Doli/Palanquin</option>
                              <option value="Helicopter">Helicopter</option>
                            </select>
                            <select required className="input-field" style={{ height: 40, width: '100%' }} value={enquiry.dressCodeGuidelinesAccepted} onChange={e => setEnquiry(f => ({ ...f, dressCodeGuidelinesAccepted: e.target.value }))}>
                              <option value="No">Accept Dress Code? No</option>
                              <option value="Yes">Accept Dress Code? Yes</option>
                            </select>
                          </>
                        )}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: 4, padding: '12px' }}>
                      <Phone size={16} style={{ marginRight: 8 }} /> Request Callback
                    </button>
                  </form>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25d366', color: 'white', padding: '12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>
                    <MessageCircle size={18} /> Chat on WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Offer badge */}
          {pkg.isSpecialOffer && pkg.offerValidity && (
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', marginBottom: 4, opacity: 0.9 }}>🔥 LIMITED TIME OFFER</div>
              <div style={{ fontWeight: 700 }}>Valid until {new Date(pkg.offerValidity).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const badge = (color) => ({
  background: color, color: 'white', padding: '4px 12px',
  borderRadius: 20, fontSize: '0.8rem', fontWeight: 700
});

export default PackageDetails;
