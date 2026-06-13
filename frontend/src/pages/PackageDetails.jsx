import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Users, Star, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Share2, Download, Phone,
  Calendar, Tag, Home, Utensils, ArrowLeft, MessageCircle,
  Plane, Car
} from 'lucide-react';

const WHATSAPP_NUMBER = '919443217654'; // Real contact number

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openDay, setOpenDay] = useState(0);
  const [enquiry, setEnquiry] = useState({ name: '', phone: '', email: '', date: '', passengers: 1 });
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
          travelDate: enquiry.date,
          numberOfPassengers: enquiry.passengers,
          packageId: id,
          remarks: `Enquiry for: ${pkg?.title}`,
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
              {itinerary.length === 0 ? (
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
                  <Users size={18} color="var(--text-muted)" />
                  <input className="input-field" type="number" min="1" placeholder="Passengers" value={enquiry.passengers} onChange={e => setEnquiry(f => ({ ...f, passengers: e.target.value }))} />
                </div>
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
