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
import PackageLanguagePicker from '../components/PackageLanguagePicker';
import { formatPackageDuration, getPackageContent, localizeCategory, localizeTourType, packagePageCopy } from '../utils/catalogCategories';
import usePackageLanguage from '../hooks/usePackageLanguage';
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
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, selectLanguage] = usePackageLanguage();
  const copy = packagePageCopy[language] || packagePageCopy.en;
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
      .then(r => {
        if (!r.ok) throw new Error('package-unavailable');
        return r.json();
      })
      .then(data => { setPkg(data); setLoading(false); })
      .catch(() => { setLoadFailed(true); setLoading(false); });
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
      setEnquiryError('identity');
      return;
    }
    if (!enquiry.date && !enquiry.dateFlexible) {
      setEnquiryError('date');
      return;
    }
    if (!Number.isInteger(children) || children < 0 || childAges.length !== children || childAges.some(age => !Number.isInteger(age) || age < 0 || age > 17)) {
      setEnquiryError('childAges');
      return;
    }
    if (!enquiry.contactConsent) {
      setEnquiryError('consent');
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
      if (!res.ok) throw new Error('submit');
      setSubmittedReference(data.enquiry?.quoteReference || enquiryReference);
      setSubmitted(true);
    } catch {
      setEnquiryError('submit');
    } finally {
      setSubmitting(false);
    }
  };

  const content = pkg ? getPackageContent(pkg, language) : null;
  const waMessage = pkg ? encodeURIComponent(`${copy.whatsappIntro} ${content.title || pkg.title}${submittedReference ? `, ${copy.reference} ${submittedReference}` : ''}.`) : '';
  const durationText = pkg ? formatPackageDuration(pkg.durationDays, pkg.durationNights, language) : '';

  if (loading) return (
    <div lang={language} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>{copy.loading}</p>
      </div>
    </div>
  );

  if (!pkg) return (
    <div lang={language} style={{ textAlign: 'center', paddingTop: 140 }}>
      <h2>{loadFailed ? copy.loadError : copy.notFound}</h2>
      <Link to="/packages" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>{copy.browsePackages}</Link>
    </div>
  );

  const inclusions = Array.isArray(content.inclusions) ? content.inclusions : [];
  const exclusions = Array.isArray(content.exclusions) ? content.exclusions : [];
  const addons = Array.isArray(pkg.optionalAddons) ? pkg.optionalAddons : [];
  const itinerary = Array.isArray(content.itinerary) ? content.itinerary : [];
  const tabs = ['overview', 'policy'];

  return (
    <div lang={language} style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img
          src={pkg.imageUrl}
          alt={content.title || pkg.title}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

        {/* Back Button */}
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <ArrowLeft size={18} /> {copy.back}
        </button>
        <div style={{ position: 'absolute', top: 24, right: 24 }}><PackageLanguagePicker value={language} onChange={selectLanguage} label={copy.languageLabel} /></div>
        {pkg.imageCreditUrl && pkg.imageRightsNote && <a
          href={pkg.imageCreditUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${copy.photo}: ${pkg.imageRightsNote}`}
          title={`${copy.photo}: ${pkg.imageRightsNote}`}
          style={{ position: 'absolute', right: 24, bottom: 8, zIndex: 2, maxWidth: 'min(42rem, calc(100% - 48px))', padding: '5px 8px', color: 'white', background: 'rgba(8, 24, 48, 0.78)', borderRadius: 5, fontSize: '0.7rem', lineHeight: 1.35, textDecoration: 'none' }}
        >{copy.photo}: {pkg.imageRightsNote}</a>}

        {/* Hero Info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 40px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={badge('#64748b')}>ID: {pkg.packageId}</span>
              <span style={badge('#3b82f6')}>{content.catalogCategory || localizeCategory(pkg.catalogCategories?.[0] || pkg.regionScope || pkg.packageCategory, language)}</span>
              <span style={badge('#10b981')}>{content.tourType || localizeTourType(pkg.tourType, language)}</span>
            </div>
            <h1 style={{ color: 'white', fontSize: '2.4rem', fontWeight: 800, marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{content.title || pkg.title}</h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {content.destination || pkg.destination}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {durationText}</span>
              {pkg.startingCity && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /> {content.startingCity || pkg.startingCity} → {content.endingCity || pkg.endingCity}</span>}
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
              <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '1.2rem' }}>{copy.priceRequest}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{copy.policyNote}</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`https://wa.me/${WHATSAPP_NUMBERS[0]}?text=${waMessage}`} target="_blank" rel="noreferrer"
                style={{ background: '#25d366', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, textDecoration: 'none' }}>
                <MessageCircle size={18} /> WhatsApp
              </a>
              <button aria-label={copy.share} title={copy.share} onClick={() => navigator.share?.({ title: content.title || pkg.title, url: window.location.href })}
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
                {t === 'overview' ? `📋 ${copy.overview}` : `📄 ${copy.policy}`}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ marginBottom: 16, color: 'var(--dark)', fontSize: '1.3rem', fontWeight: 700 }}>{copy.overview}</h2>
                <div style={{ lineHeight: 1.9, color: 'var(--text-main)', fontSize: '1rem' }}>
                  {renderRichText(content.overview || pkg.description)}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 18, color: 'var(--dark)', fontWeight: 700 }}>{copy.quickFacts}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                  {[
                    { icon: <Clock size={20} color="var(--primary)" />, label: copy.duration, val: durationText },
                    { icon: <MapPin size={20} color="var(--primary)" />, label: copy.destination, val: content.destination || pkg.destination },
                    { icon: <Tag size={20} color="var(--primary)" />, label: copy.category, val: content.catalogCategory || localizeTourType(pkg.tourType, language) },
                    ...(pkg.startingCity ? [{ icon: <ArrowLeft size={20} color="var(--primary)" />, label: copy.from, val: content.startingCity || pkg.startingCity }] : []),
                    ...(pkg.endingCity ? [{ icon: <ArrowLeft size={20} color="var(--primary)" style={{ transform: 'rotate(180deg)' }} />, label: copy.to, val: content.endingCity || pkg.endingCity }] : []),
                    ...(content.mealPlan ? [{ icon: <Utensils size={20} color="var(--primary)" />, label: copy.mealPlan, val: content.mealPlan }] : []),
                    ...(pkg.templesList && pkg.templesList.length > 0 ? [{ icon: <MapPin size={20} color="var(--primary)" />, label: copy.templesIncluded, val: pkg.templesList.join(', ') }] : []),
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ marginTop: 2 }}>{f.icon}</div>
                      <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</div><div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '0.95rem' }}>{f.val}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <section className="glass-card" style={{ padding: 28, marginTop: 20 }}>
                <h3 style={{ margin: '0 0 16px', color: 'var(--dark)', fontWeight: 800 }}>{copy.bestTime} &amp; {copy.weather}</h3>
                <p style={{ margin: '0 0 10px', lineHeight: 1.7 }}><strong>{copy.bestTime}:</strong> {content.bestTimeToVisit}</p>
                <p style={{ margin: 0, lineHeight: 1.7 }}><strong>{copy.weather}:</strong> {content.expectedWeather}</p>
              </section>
              <section className="glass-card" style={{ padding: 28, marginTop: 20 }}>
                <h3 style={{ margin: '0 0 12px', color: 'var(--dark)', fontWeight: 800 }}>{copy.vehicle}</h3>
                <p style={{ lineHeight: 1.75 }}>{content.vehiclePlan}</p>
                <h3 style={{ margin: '20px 0 10px', color: 'var(--dark)', fontWeight: 800 }}>{copy.booking}</h3>
                <ul style={{ paddingLeft: 22, margin: 0, display: 'grid', gap: 10 }}>
                  {(content.importantBookingInfo || []).map((item, index) => <li key={index} style={{ lineHeight: 1.7 }}>{item}</li>)}
                </ul>
              </section>
              {Array.isArray(pkg.destinationReferences) && pkg.destinationReferences.length > 0 && <section className="glass-card package-detail-references" aria-labelledby="package-reference-heading">
                <h3 id="package-reference-heading">{copy.references}</h3>
                <p>{copy.itineraryNote}</p>
                <ul>{pkg.destinationReferences.map((reference, index) => {
                  const visits = itinerary.flatMap(day => day.schedule || []).filter(stop => stop.kind === 'visit');
                  return <li key={`${reference.name}-${index}`}><a href={reference.url} target="_blank" rel="noopener noreferrer">{visits[index]?.place || reference.name} ↗</a><small>{reference.sourceType || 'Reference'}{reference.lastChecked ? ` · ${reference.lastChecked}` : ''}</small></li>;
                })}</ul>
              </section>}
            </motion.div>
          )}

          <section className="package-plan" aria-labelledby="package-plan-heading">
            <h2 id="package-plan-heading">{copy.itinerary}</h2>
            <p className="package-plan-note">{copy.itineraryNote}</p>
            {itinerary.length === 0 ? <p>{copy.itineraryPreparing}</p> : <ol>{itinerary.map((day, index) => <li key={`${day.day}-${index}`}>
              <div className="package-plan-day"><span>{language === 'ta' ? 'நாள்' : language === 'hi' ? 'दिन' : 'Day'} {day.day || index + 1}</span><h3>{day.title || `${language === 'ta' ? 'நாள்' : language === 'hi' ? 'दिन' : 'Day'} ${index + 1}`}</h3></div>
              {Array.isArray(day.schedule) && day.schedule.length > 0 ? <ol className="package-timeline">{day.schedule.map((stop, stopIndex) => <li key={`${stop.time}-${stop.place}-${stopIndex}`} className={stop.kind === 'visit' ? 'is-visit' : ''}>
                <time dateTime={stop.time}>{stop.time}</time>
                <div className="package-timeline-content">
                  <strong>{stop.title}</strong>
                  {stop.place && <span className="package-timeline-place"><MapPin size={13} aria-hidden="true" /> {stop.place}</span>}
                  {stop.description && <p>{stop.description}</p>}
                  {stop.kind === 'visit' && stop.visitingInfo && <p className="package-visit-note">{copy.visitNote}: {stop.visitingInfo}</p>}
                  {stop.sourceUrl && <a href={stop.sourceUrl} target="_blank" rel="noopener noreferrer">{copy.aboutLocation}</a>}
                </div>
                {stop.kind === 'visit' && stop.imageUrl && <figure className="package-timeline-image"><img src={stop.imageUrl} alt={stop.place} loading="lazy" />{stop.imageCredit && <figcaption>{stop.imageCreditUrl ? <a href={stop.imageCreditUrl} target="_blank" rel="noopener noreferrer">{copy.photo}: {stop.imageCredit}</a> : `${copy.photo}: ${stop.imageCredit}`}</figcaption>}</figure>}
              </li>)}</ol> : <div>{renderRichText(day.activities)}</div>}
              <ul className="package-plan-facts">{day.hotel && <li><Home size={16} aria-hidden="true" /> {copy.stay}: {day.hotel}</li>}{day.mealPlan && <li><Utensils size={16} aria-hidden="true" /> {copy.meals}: {day.mealPlan}</li>}{day.transport && <li><Plane size={16} aria-hidden="true" /> {copy.travel}: {day.transport}</li>}</ul>
            </li>)}</ol>}
            <div className="package-terms-grid"><section aria-labelledby="package-inclusions-heading"><h3 id="package-inclusions-heading"><CheckCircle size={20} aria-hidden="true" /> {copy.inclusions}</h3>{inclusions.length ? <ul>{inclusions.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>{copy.inclusionPending}</p>}</section><section aria-labelledby="package-exclusions-heading"><h3 id="package-exclusions-heading"><XCircle size={20} aria-hidden="true" /> {copy.exclusions}</h3>{exclusions.length ? <ul>{exclusions.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>{copy.exclusionPending}</p>}</section></div>
            {addons.length > 0 && <div className="package-addons"><h3>{copy.optionalAddons}</h3><ul>{addons.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          </section>

          {/* Tab: Policy */}
          {activeTab === 'policy' && (() => {
            const getCleanPolicies = () => {
              let cleanTerms = content.termsAndConditions || pkg.termsAndConditions || '';
              if (cleanTerms.includes("General Terms & Conditions")) {
                cleanTerms = cleanTerms.split("General Terms & Conditions")[0].trim();
              }
              
              let cleanCancellation = content.cancellationPolicy || pkg.cancellationPolicy || '';
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
                    <h3 style={{ marginBottom: 16, color: 'var(--dark)', fontWeight: 700 }}>📋 {copy.terms}</h3>
                    <p style={{ lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{cleanTerms}</p>
                  </div>
                )}

                {/* 2. Package Specific Cancellation Policy */}
                {cleanCancellation && (
                  <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16, color: '#ef4444', fontWeight: 700 }}>🚫 {copy.cancellation}</h3>
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
                  <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>{copy.policyMissing}</div>
                )}
              </motion.div>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div id="package-enquiry" style={{ position: 'sticky', top: 90, scrollMarginTop: 105 }}>
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <>
                <h3 style={{ marginBottom: 4, color: 'var(--dark)', fontWeight: 700, fontSize: '1.2rem' }}>{copy.priceRequest}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>{copy.requestDescription}</p>

                {submitted ? (
                  <div role="status" style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircle size={42} color="#15803d" aria-hidden="true" />
                    <h4 style={{ color: '#15803d', marginBottom: 8 }}>{copy.enquiryReceived}</h4>
                    <p>{copy.reference}: <strong>{submittedReference}</strong></p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{copy.enquiryReceivedNote}</p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquiry} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="package-enquiry-summary"><strong>{content.title || pkg.title}</strong><span>{pkg.packageId} · {content.destination || pkg.destination}</span></div>
                    {enquiryError && <div className="form-status is-error" role="alert">{copy.errors[enquiryError] || copy.errors.submit}</div>}
                    <label>{copy.form.fullName} *<input required className="input-field" autoComplete="name" value={enquiry.name} onChange={e => setEnquiry(f => ({ ...f, name: e.target.value }))} /></label>
                    <label>{copy.form.mobile} *<input required className="input-field" autoComplete="tel" type="tel" value={enquiry.phone} onChange={e => setEnquiry(f => ({ ...f, phone: e.target.value }))} /></label>
                    <label>{copy.form.email} *<input required className="input-field" autoComplete="email" type="email" value={enquiry.email} onChange={e => setEnquiry(f => ({ ...f, email: e.target.value }))} /></label>
                    <label>{copy.form.travelDate}<input className="input-field" lang={language} type="date" value={enquiry.date} onChange={e => setEnquiry(f => ({ ...f, date: e.target.value }))} /></label>
                    <label className="package-enquiry-check"><input type="checkbox" checked={enquiry.dateFlexible} onChange={e => setEnquiry(f => ({ ...f, dateFlexible: e.target.checked }))} /> {copy.form.flexibleDates}</label>
                    <div className="package-enquiry-split">
                      <label>{copy.form.adults} *<input required className="input-field" type="number" min="1" max="100" value={enquiry.adults} onChange={e => setEnquiry(f => ({ ...f, adults: e.target.value }))} /></label>
                      <label>{copy.form.children}<input className="input-field" type="number" min="0" max="30" value={enquiry.children} onChange={e => setEnquiry(f => ({ ...f, children: e.target.value }))} /></label>
                    </div>
                    {Number(enquiry.children) > 0 && <label>{copy.form.childAges} *<input className="input-field" placeholder="6, 12" value={enquiry.childAges} onChange={e => setEnquiry(f => ({ ...f, childAges: e.target.value }))} /></label>}
                    <div className="package-enquiry-split">
                      <label>{copy.form.rooms} *<input required className="input-field" type="number" min="1" max="30" value={enquiry.rooms} onChange={e => setEnquiry(f => ({ ...f, rooms: e.target.value }))} /></label>
                      <label>{copy.form.startingCity} *<input required className="input-field" value={enquiry.origin} onChange={e => setEnquiry(f => ({ ...f, origin: e.target.value }))} /></label>
                    </div>
                    {Array.isArray(pkg.destinationReferences) && pkg.destinationReferences.length > 0 && <fieldset className="package-enquiry-destinations">
                      <legend>{copy.form.placesToInclude}</legend>
                      {pkg.destinationReferences.map((place, index) => {
                        const visits = itinerary.flatMap(day => day.schedule || []).filter(stop => stop.kind === 'visit');
                        const translatedPlace = visits[index]?.place || place.name;
                        return <label key={place.name} className="package-enquiry-check"><input type="checkbox" checked={enquiry.selectedDestinations.includes(place.name)} onChange={e => setEnquiry(f => ({ ...f, selectedDestinations: e.target.checked ? [...f.selectedDestinations, place.name] : f.selectedDestinations.filter(name => name !== place.name) }))} /> {translatedPlace}</label>;
                      })}
                    </fieldset>}
                    <label>{copy.form.anotherPlace}<input className="input-field" value={enquiry.customDestination} onChange={e => setEnquiry(f => ({ ...f, customDestination: e.target.value }))} /></label>
                    <label>{copy.form.preferredTier}<select className="input-field" value={enquiry.preferredTier} onChange={e => setEnquiry(f => ({ ...f, preferredTier: e.target.value }))}><option value="">{copy.form.pleaseSuggest}</option><option value="Economic">{copy.form.economic}</option><option value="Deluxe">{copy.form.deluxe}</option><option value="Premium">{copy.form.premium}</option></select></label>
                    <label>{copy.form.mealPreference}<select className="input-field" value={enquiry.mealPreference} onChange={e => setEnquiry(f => ({ ...f, mealPreference: e.target.value }))}><option value="">{copy.form.pleaseSuggest}</option><option value="Vegetarian">{copy.form.vegetarian}</option><option value="Non vegetarian">{copy.form.nonVegetarian}</option><option value="Jain">{copy.form.jain}</option><option value="Other">{copy.form.other}</option></select></label>
                    <label>{copy.form.specialRequests}<textarea className="input-field" rows="3" maxLength="1000" placeholder={copy.form.notesPlaceholder} value={enquiry.notes} onChange={e => setEnquiry(f => ({ ...f, notes: e.target.value }))} /></label>
                    <label className="package-enquiry-check"><input type="checkbox" required checked={enquiry.contactConsent} onChange={e => setEnquiry(f => ({ ...f, contactConsent: e.target.checked }))} /> {copy.form.contactConsent} *</label>
                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 4, padding: '12px' }}>
                      <Phone size={16} style={{ marginRight: 8 }} /> {submitting ? copy.form.sending : copy.form.submit}
                    </button>
                  </form>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  {WHATSAPP_NUMBERS.map((number, index) => <a key={number} href={`https://wa.me/${number}?text=${waMessage}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25d366', color: 'white', padding: '12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>
                    <MessageCircle size={18} /> {copy.whatsappNumber.replace('{number}', index + 1)}: +91 {number.slice(2, 7)} {number.slice(7)}
                  </a>)}
                  {submitted && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{copy.whatsappDraftNote}</p>}
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
