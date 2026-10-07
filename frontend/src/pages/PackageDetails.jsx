import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, CheckCircle, XCircle,
  Share2, Phone,
  Tag, Home, Utensils, ArrowLeft, MessageCircle,
  Plane
} from 'lucide-react';
import { renderRichText } from '../utils/textFormatter';
import {
  MANDATORY_GENERAL_TERMS,
  MANDATORY_PAYMENT_POLICY,
  MANDATORY_CANCELLATION_POLICY,
  MANDATORY_RESCHEDULING_POLICY
} from '../utils/policyConstants';

const WHATSAPP_NUMBERS = ['919280077182', '919280077183'];

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [enquiry, setEnquiry] = useState({
    name: '', phone: '', email: '', date: '', dateFlexible: false,
    adults: 1, children: 0, childAges: '', rooms: 1, origin: '',
    selectedDestinations: [], customDestination: '', preferredTier: '',
    mealPreference: '', notes: '', contactConsent: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [enquiryReference] = useState(() => `SP-PKG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  const [submitted, setSubmitted] = useState(false);
  const [submittedReference, setSubmittedReference] = useState('');
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    fetch(`/api/packages/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPkg(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (pkg && window.location.hash === '#package-enquiry') {
      window.requestAnimationFrame(() => document.getElementById('package-enquiry')?.scrollIntoView({ block: 'start' }));
    }
  }, [pkg]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    const children = Number(enquiry.children);
    const childAges = enquiry.childAges.split(',').map(age => age.trim()).filter(Boolean).map(Number);
    if (!enquiry.name.trim() || enquiry.phone.replace(/\D/g, '').length < 10 || !/^\S+@\S+\.\S+$/.test(enquiry.email.trim())) {
      setEnquiryError('Enter your name, mobile number and a valid email address.');
      return;
    }
    if (!enquiry.date && !enquiry.dateFlexible) {
      setEnquiryError('Choose a travel date or mark your dates as flexible.');
      return;
    }
    if (!Number.isInteger(children) || children < 0 || childAges.length !== children || childAges.some(age => !Number.isInteger(age) || age < 0 || age > 17)) {
      setEnquiryError('Enter one age (0–17) for each child, separated by commas.');
      return;
    }
    if (!enquiry.contactConsent) {
      setEnquiryError('Please agree to be contacted about this enquiry.');
      return;
    }
    setSubmitting(true);
    try {
      const selectedDestinations = [...new Set([...enquiry.selectedDestinations, enquiry.customDestination.trim()].filter(Boolean))];
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryType: 'Tour Package',
          customerName: enquiry.name.trim(), mobileNumber: enquiry.phone.trim(), emailId: enquiry.email.trim(),
          travelDate: enquiry.date || undefined, numberOfPassengers: Number(enquiry.adults) + children,
          adultCount: Number(enquiry.adults), childCount: children, hotelRooms: Number(enquiry.rooms),
          fromLocation: enquiry.origin.trim(), toLocation: pkg.destination,
          packageId: pkg.packageId || id, quoteReference: enquiryReference,
          selectedDestinations, leadSource: 'website', contactConsent: true,
          consentVersion: 'package-enquiry-v1.3-2026-10-03',
          remarks: `Package: ${pkg.title}. ${enquiry.notes.trim()}`,
          detailedPreferences: {
            packageName: pkg.title, dateFlexible: enquiry.dateFlexible, childAges,
            preferredTier: enquiry.preferredTier, mealPreference: enquiry.mealPreference,
            rooms: Number(enquiry.rooms), notes: enquiry.notes.trim()
          }
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'We could not submit your enquiry. Please try again.');
      setSubmittedReference(data.enquiry?.quoteReference || enquiryReference);
      setSubmitted(true);
    } catch (err) {
      setEnquiryError(err.message || 'We could not submit your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const waMessage = pkg ? encodeURIComponent(`Hello SreePayanam, please help with ${pkg.title}${submittedReference ? `, enquiry ${submittedReference}` : ''}.`) : '';

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

  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
  const exclusions = Array.isArray(pkg.exclusions) ? pkg.exclusions : [];
  const addons = Array.isArray(pkg.optionalAddons) ? pkg.optionalAddons : [];
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const tabs = ['overview', 'policy'];

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
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
              <span style={badge('#64748b')}>ID: {pkg.packageId}</span>
              <span style={badge('#3b82f6')}>{pkg.packageCategory}</span>
              <span style={badge('#10b981')}>{pkg.tourType}</span>
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
      <div className="package-details-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 30, alignItems: 'start' }}>

        {/* Left */}
        <div>
          {/* Inquiry invitation */}
          <div className="glass-card" style={{ padding: '20px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '1.2rem' }}>Request for price</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Our travel desk checks your dates, party and selected places before pricing.</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`https://wa.me/${WHATSAPP_NUMBERS[0]}?text=${waMessage}`} target="_blank" rel="noreferrer"
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
                {t === 'overview' ? '📋 Overview' : '📄 Policy'}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ marginBottom: 16, color: 'var(--dark)', fontSize: '1.3rem', fontWeight: 700 }}>Package Overview</h2>
                <div style={{ lineHeight: 1.9, color: 'var(--text-main)', fontSize: '1rem' }}>
                  {renderRichText(pkg.overview || pkg.description)}
                </div>
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
                    ...(pkg.mealPlan ? [{ icon: <Utensils size={20} color="var(--primary)" />, label: 'Meal Plan', val: pkg.mealPlan }] : []),
                    ...(pkg.templesList && pkg.templesList.length > 0 ? [{ icon: <MapPin size={20} color="var(--primary)" />, label: 'Temples Included', val: pkg.templesList.join(', ') }] : []),
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ marginTop: 2 }}>{f.icon}</div>
                      <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</div><div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '0.95rem' }}>{f.val}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              {Array.isArray(pkg.destinationReferences) && pkg.destinationReferences.length > 0 && <section className="glass-card package-detail-references" aria-labelledby="package-reference-heading">
                <h3 id="package-reference-heading">Explore the destinations</h3>
                <p>Open the source page for more details. Timings and availability should be checked again before travel.</p>
                <ul>{pkg.destinationReferences.map((reference, index) => <li key={`${reference.name}-${index}`}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.name} ↗</a><small>{reference.sourceType || 'Reference'}{reference.lastChecked ? ` · checked ${reference.lastChecked}` : ''}</small></li>)}</ul>
              </section>}
            </motion.div>
          )}

          <section className="package-plan" aria-labelledby="package-plan-heading">
            <h2 id="package-plan-heading">Day-by-day itinerary</h2>
            <p className="package-plan-note">These clock times show the planned route. The travel desk checks current opening hours, darshan slots, road conditions and reservations for your travel dates before the final quotation.</p>
            {itinerary.length === 0 ? <p>Our travel desk is preparing the day plan for this package.</p> : <ol>{itinerary.map((day, index) => <li key={`${day.day}-${index}`}>
              <div className="package-plan-day"><span>Day {day.day || index + 1}</span><h3>{day.title || `Day ${index + 1}`}</h3></div>
              {Array.isArray(day.schedule) && day.schedule.length > 0 ? <ol className="package-timeline">{day.schedule.map((stop, stopIndex) => <li key={`${stop.time}-${stop.place}-${stopIndex}`} className={stop.kind === 'visit' ? 'is-visit' : ''}>
                <time dateTime={stop.time}>{stop.time}</time>
                <div className="package-timeline-content">
                  <strong>{stop.title}</strong>
                  {stop.place && <span className="package-timeline-place"><MapPin size={13} aria-hidden="true" /> {stop.place}</span>}
                  {stop.description && <p>{stop.description}</p>}
                  {stop.kind === 'visit' && stop.visitingInfo && !/^check the venue|^recheck venue/i.test(stop.visitingInfo) && <p className="package-visit-note">Visit note: {stop.visitingInfo}</p>}
                  {stop.sourceUrl && <a href={stop.sourceUrl} target="_blank" rel="noopener noreferrer">{stop.kind === 'transfer' ? 'View mapped route ↗' : 'About this location ↗'}</a>}
                </div>
                {stop.kind === 'visit' && stop.imageUrl && <figure className="package-timeline-image"><img src={stop.imageUrl} alt={stop.place} loading="lazy" />{stop.imageCredit && <figcaption>{stop.imageCreditUrl ? <a href={stop.imageCreditUrl} target="_blank" rel="noopener noreferrer">Photo: {stop.imageCredit}</a> : `Photo: ${stop.imageCredit}`}</figcaption>}</figure>}
              </li>)}</ol> : <div>{renderRichText(day.activities)}</div>}
              <ul className="package-plan-facts">{day.hotel && <li><Home size={16} aria-hidden="true" /> Stay: {day.hotel}</li>}{day.mealPlan && <li><Utensils size={16} aria-hidden="true" /> Meals: {day.mealPlan}</li>}{day.transport && <li><Plane size={16} aria-hidden="true" /> Travel: {day.transport}</li>}</ul>
            </li>)}</ol>}
            <div className="package-terms-grid"><section aria-labelledby="package-inclusions-heading"><h3 id="package-inclusions-heading"><CheckCircle size={20} aria-hidden="true" /> Inclusions</h3>{inclusions.length ? <ul>{inclusions.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Ask the travel desk to confirm inclusions before booking.</p>}</section><section aria-labelledby="package-exclusions-heading"><h3 id="package-exclusions-heading"><XCircle size={20} aria-hidden="true" /> Exclusions</h3>{exclusions.length ? <ul>{exclusions.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Ask the travel desk to confirm exclusions before booking.</p>}</section></div>
            {addons.length > 0 && <div className="package-addons"><h3>Optional add-ons</h3><ul>{addons.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          </section>

          {/* Tab: Policy */}
          {activeTab === 'policy' && (() => {
            const getCleanPolicies = () => {
              let cleanTerms = pkg.termsAndConditions || '';
              if (cleanTerms.includes("General Terms & Conditions")) {
                cleanTerms = cleanTerms.split("General Terms & Conditions")[0].trim();
              }
              
              let cleanCancellation = pkg.cancellationPolicy || '';
              if (cleanCancellation.includes("Cancellation & Refund Policy")) {
                cleanCancellation = cleanCancellation.split("Cancellation & Refund Policy")[0].trim();
              }
              
              return { cleanTerms, cleanCancellation };
            };
            
            const { cleanTerms, cleanCancellation } = getCleanPolicies();
            const isNational = pkg.packageCategory === 'National';

            return (
              <motion.div key="pol" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* 1. Package Specific Terms & Conditions */}
                {cleanTerms && (
                  <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16, color: 'var(--dark)', fontWeight: 700 }}>📋 Package Specific Terms &amp; Conditions</h3>
                    <p style={{ lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{cleanTerms}</p>
                  </div>
                )}

                {/* 2. Package Specific Cancellation Policy */}
                {cleanCancellation && (
                  <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16, color: '#ef4444', fontWeight: 700 }}>🚫 Package Specific Cancellation Policy</h3>
                    <p style={{ lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{cleanCancellation}</p>
                  </div>
                )}

                {/* 3. Standard General Terms & Policies (for National Packages) */}
                {isNational && (
                  <div style={{ marginTop: 32 }}>
                    <h3 style={{ marginBottom: 20, color: 'var(--dark)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      🛡️ Standard General Terms &amp; Policies
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {/* General Terms */}
                      <div className="glass-card" style={{ padding: 24, backgroundColor: 'white' }}>
                        <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 14, fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                          General Terms &amp; Conditions
                        </h4>
                        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, listStyleType: 'disc' }}>
                          {MANDATORY_GENERAL_TERMS.map((item, idx) => (
                            <li key={idx} style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.9rem' }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Booking & Payment */}
                      <div className="glass-card" style={{ padding: 24, backgroundColor: 'white' }}>
                        <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 14, fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                          Booking &amp; Payment Policy
                        </h4>
                        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, listStyleType: 'disc' }}>
                          {MANDATORY_PAYMENT_POLICY.map((item, idx) => (
                            <li key={idx} style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.9rem' }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Cancellation & Refund */}
                      <div className="glass-card" style={{ padding: 24, backgroundColor: 'white' }}>
                        <h4 style={{ color: '#ef4444', fontWeight: 700, marginBottom: 14, fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                          Cancellation &amp; Refund Policy
                        </h4>
                        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, listStyleType: 'disc' }}>
                          {MANDATORY_CANCELLATION_POLICY.map((item, idx) => (
                            <li key={idx} style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.9rem' }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Date Change / Rescheduling */}
                      <div className="glass-card" style={{ padding: 24, backgroundColor: 'white' }}>
                        <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 14, fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                          Date Change / Rescheduling Policy
                        </h4>
                        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, listStyleType: 'disc' }}>
                          {MANDATORY_RESCHEDULING_POLICY.map((item, idx) => (
                            <li key={idx} style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.9rem' }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Final-Quotation Clause */}
                      <div style={{ 
                        padding: 24, 
                        borderRadius: 16, 
                        backgroundColor: '#fffbeb', 
                        border: '1.5px solid #fef3c7',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.05)'
                      }}>
                        <h4 style={{ color: '#d97706', fontWeight: 800, marginBottom: 10, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          ⚠️ Important Final-Quotation Clause
                        </h4>
                        <p style={{ lineHeight: 1.7, color: '#78350f', fontSize: '0.92rem', margin: '0 0 16px 0' }}>
                          These are SreePayanam's standard general terms and policies. Package-specific pricing, payment terms, cancellation/refund conditions, date-change rules, itinerary, hotels, vehicles, inclusions and exclusions may vary. In all cases, the terms and conditions specifically mentioned in the <strong>FINAL CONFIRMED QUOTATION / BOOKING CONFIRMATION</strong> shall prevail.
                        </p>
                        <div style={{ borderTop: '1px solid #fde68a', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309' }}>SreePayanam International Pvt. Ltd.</span>
                          <span style={{ fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 600, color: '#d97706' }}>Travel Smarter. Journey Better.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!cleanTerms && !cleanCancellation && !isNational && (
                  <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Policy details not added yet.</div>
                )}
              </motion.div>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div id="package-enquiry" style={{ position: 'sticky', top: 90, scrollMarginTop: 105 }}>
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <>
                <h3 style={{ marginBottom: 4, color: 'var(--dark)', fontWeight: 700, fontSize: '1.2rem' }}>Request for price</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Tell us your plans. Staff will confirm availability and send a personalized quotation.</p>

                {submitted ? (
                  <div role="status" style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircle size={42} color="#15803d" aria-hidden="true" />
                    <h4 style={{ color: '#15803d', marginBottom: 8 }}>Enquiry received</h4>
                    <p>Reference: <strong>{submittedReference}</strong></p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our travel desk will review your request. You can also contact us using the WhatsApp links below.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquiry} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="package-enquiry-summary"><strong>{pkg.title}</strong><span>{pkg.packageId} · {pkg.destination}</span></div>
                    {enquiryError && <div className="form-status is-error" role="alert">{enquiryError}</div>}
                    <label>Full name *<input required className="input-field" autoComplete="name" value={enquiry.name} onChange={e => setEnquiry(f => ({ ...f, name: e.target.value }))} /></label>
                    <label>Mobile / WhatsApp *<input required className="input-field" autoComplete="tel" type="tel" value={enquiry.phone} onChange={e => setEnquiry(f => ({ ...f, phone: e.target.value }))} /></label>
                    <label>Email *<input required className="input-field" autoComplete="email" type="email" value={enquiry.email} onChange={e => setEnquiry(f => ({ ...f, email: e.target.value }))} /></label>
                    <label>Travel date<input className="input-field" type="date" value={enquiry.date} onChange={e => setEnquiry(f => ({ ...f, date: e.target.value }))} /></label>
                    <label className="package-enquiry-check"><input type="checkbox" checked={enquiry.dateFlexible} onChange={e => setEnquiry(f => ({ ...f, dateFlexible: e.target.checked }))} /> My dates are flexible</label>
                    <div className="package-enquiry-split">
                      <label>Adults *<input required className="input-field" type="number" min="1" max="100" value={enquiry.adults} onChange={e => setEnquiry(f => ({ ...f, adults: e.target.value }))} /></label>
                      <label>Children<input className="input-field" type="number" min="0" max="30" value={enquiry.children} onChange={e => setEnquiry(f => ({ ...f, children: e.target.value }))} /></label>
                    </div>
                    {Number(enquiry.children) > 0 && <label>Child ages, comma separated *<input className="input-field" placeholder="6, 12" value={enquiry.childAges} onChange={e => setEnquiry(f => ({ ...f, childAges: e.target.value }))} /></label>}
                    <div className="package-enquiry-split">
                      <label>Rooms *<input required className="input-field" type="number" min="1" max="30" value={enquiry.rooms} onChange={e => setEnquiry(f => ({ ...f, rooms: e.target.value }))} /></label>
                      <label>Starting city *<input required className="input-field" value={enquiry.origin} onChange={e => setEnquiry(f => ({ ...f, origin: e.target.value }))} /></label>
                    </div>
                    {Array.isArray(pkg.destinationReferences) && pkg.destinationReferences.length > 0 && <fieldset className="package-enquiry-destinations">
                      <legend>Places you want to include</legend>
                      {pkg.destinationReferences.map(place => <label key={place.name} className="package-enquiry-check"><input type="checkbox" checked={enquiry.selectedDestinations.includes(place.name)} onChange={e => setEnquiry(f => ({ ...f, selectedDestinations: e.target.checked ? [...f.selectedDestinations, place.name] : f.selectedDestinations.filter(name => name !== place.name) }))} /> {place.name}</label>)}
                    </fieldset>}
                    <label>Another place to include<input className="input-field" value={enquiry.customDestination} onChange={e => setEnquiry(f => ({ ...f, customDestination: e.target.value }))} /></label>
                    <label>Preferred tier<select className="input-field" value={enquiry.preferredTier} onChange={e => setEnquiry(f => ({ ...f, preferredTier: e.target.value }))}><option value="">Please suggest</option><option>Economic</option><option>Deluxe</option><option>Premium</option></select></label>
                    <label>Meal preference<select className="input-field" value={enquiry.mealPreference} onChange={e => setEnquiry(f => ({ ...f, mealPreference: e.target.value }))}><option value="">Please suggest</option><option>Vegetarian</option><option>Non vegetarian</option><option>Jain</option><option>Other</option></select></label>
                    <label>Special requests<textarea className="input-field" rows="3" maxLength="1000" placeholder="Room, accessibility or visit preferences. Do not include medical records or payment details." value={enquiry.notes} onChange={e => setEnquiry(f => ({ ...f, notes: e.target.value }))} /></label>
                    <label className="package-enquiry-check"><input type="checkbox" required checked={enquiry.contactConsent} onChange={e => setEnquiry(f => ({ ...f, contactConsent: e.target.checked }))} /> I agree to be contacted by SreePayanam about this quotation request. *</label>
                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 4, padding: '12px' }}>
                      <Phone size={16} style={{ marginRight: 8 }} /> {submitting ? 'Sending request…' : 'Request for price'}
                    </button>
                  </form>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  {WHATSAPP_NUMBERS.map((number, index) => <a key={number} href={`https://wa.me/${number}?text=${waMessage}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25d366', color: 'white', padding: '12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>
                    <MessageCircle size={18} /> WhatsApp {index + 1}: +91 {number.slice(2, 7)} {number.slice(7)}
                  </a>)}
                  {submitted && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>WhatsApp opens a message draft. Tap Send in WhatsApp to contact us.</p>}
                </div>
              </>
          </div>

          {/* Offer badge */}
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
