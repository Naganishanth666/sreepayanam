import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, Calendar, Users, ShieldCheck, Copy, Check, 
  Smartphone,
  ChevronRight, Download, MessageSquare, CheckCircle2,
  Lock, ArrowRight
} from 'lucide-react';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');
  // Booking details states
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(packageId));
  const [packageError, setPackageError] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1: Info, 2: Review, 3: Payment, 4: Receipt
  const [bookingRef, setBookingRef] = useState('');
  
  // Checkout form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    passengers: '1',
    adults: '1',
    children: '0',
    remarks: '',
  });

  // Payment states. Only methods backed by a real reconciliation workflow are exposed.
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [formError, setFormError] = useState('');

  // Bank Transfer Reference
  const [bankRefNumber, setBankRefNumber] = useState('');

  useEffect(() => {
    if (packageId) {
      fetch(`/api/packages/${packageId}`)
        .then(r => {
          if (!r.ok) throw new Error('Package could not be loaded.');
          return r.json();
        })
        .then(data => {
          setPkg(data);
          setLoading(false);
        })
        .catch(error => {
          setPackageError(error.message || 'Package could not be loaded.');
          setLoading(false);
        });
    }
  }, [packageId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormError('');
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'passengers') {
        updated.adults = value;
      }
      return updated;
    });
  };

  // Pricing calculations
  const basePrice = pkg ? (pkg.offerPrice || pkg.originalPrice || pkg.price || 0) : 10000; // default for custom
  const subtotal = basePrice * Number(formData.passengers);
  const gstTax = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = subtotal + gstTax;

  // Locks the official UPI details securely
  const upiId = '9443217654@upi'; 
  const upiUri = `upi://pay?pa=${upiId}&pn=SreePayanam%20Tours%20and%20Travels&tn=BookingRef&am=${totalAmount}&cu=INR`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiUri)}`;

  const copyToClipboard = async (text, type) => {
    if (!navigator.clipboard?.writeText) {
      setPaymentError('Copy is unavailable in this browser. Please select the value and copy it manually.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setPaymentError('Copy is unavailable in this browser. Please select the value and copy it manually.');
      return;
    }
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmt(true);
      setTimeout(() => setCopiedAmt(false), 2000);
    }
  };

  // 1. Submit Booking with Initial Checkout Data
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const emailOkay = /^\S+@\S+\.\S+$/.test(formData.email.trim());
    const phoneOkay = /^\+?[0-9 ()-]{8,20}$/.test(formData.phone.trim());
    if (!formData.name.trim() || !emailOkay || !phoneOkay || !formData.travelDate) {
      setFormError('Please enter a name, valid email, valid phone number and departure date.');
      return;
    }
    setFormError('');
    setActiveStep(2); // Proceed to review summary
  };

  // 2. Finalize payment and log it securely in backend
  const processFinalPayment = async (referenceNumber) => {
    setSubmittingPayment(true);
    setPaymentError('');

    try {
      const payload = {
        packageId: packageId || null,
        customerName: formData.name,
        emailId: formData.email,
        mobileNumber: formData.phone,
        travelDate: formData.travelDate,
        numberOfPassengers: Number(formData.passengers),
        adultCount: Number(formData.adults),
        childCount: Number(formData.children),
        remarks: formData.remarks + ` [Service Category: ${pkg?.tourType || 'Custom Tour'}]`,
        paymentMethod,
        transactionId: referenceNumber,
        paymentAmount: totalAmount,
        totalAmount
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment processing failed.');

      setBookingRef(data.booking.bookingId);
      setActiveStep(4); // Advance to e-receipt success screen
    } catch (err) {
      setPaymentError(err.message || 'Connection lost. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleUpiSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(utrNumber)) {
      setPaymentError('Please enter a valid 12-digit numeric UPI UTR Ref No.');
      return;
    }
    setPaymentError('');
    processFinalPayment(utrNumber);
  };

  const handleBankTransferSubmit = (e) => {
    e.preventDefault();
    if (!bankRefNumber.trim()) {
      setPaymentError('Bank NEFT/IMPS reference transaction ID is required.');
      return;
    }
    setPaymentError('');
    processFinalPayment(bankRefNumber);
  };

  const getWhatsAppReceiptLink = () => {
    const text = `Hello SreePayanam! ✈️\n\nI just submitted a payment claim for my booking.\n` +
      `👤 *Lead Traveler:* ${formData.name}\n` +
      `📞 *Phone:* ${formData.phone}\n` +
      `🎟️ *Booking ID:* ${bookingRef}\n` +
      `📦 *Package Selected:* ${pkg?.title || 'Custom package'}\n` +
      `📅 *Travel Date:* ${new Date(formData.travelDate).toLocaleDateString('en-IN')}\n` +
      `👥 *Passengers:* ${formData.passengers}\n` +
      `💰 *Amount Claimed:* ₹${totalAmount.toLocaleString()} via ${paymentMethod}\n` +
      `🔍 *Payment Claim Reference:* ${utrNumber || bankRefNumber || 'Pending verification'}\n\n` +
      `Please verify our receipt claim and issue tickets/vouchers as soon as possible. Thank you!`;
    return `https://wa.me/919443217654?text=${encodeURIComponent(text)}`;
  };

  if (packageId && loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Preparing secure checkout environment...</p>
      </div>
    </div>
  );

  if (!packageId || (packageId && !pkg)) return (
    <main className="page-container">
      <div className="container">
        <div className="glass-card access-card">
          <span className="eyebrow">Checkout needs a package</span>
          <h1>{packageError || 'Choose a published package before checkout.'}</h1>
          <p>For a custom route, use the trip planner to receive a server-calculated estimate and downloadable quotation.</p>
          <div className="access-card-actions">
            <Link className="btn btn-primary" to="/packages">Browse packages</Link>
            <Link className="btn btn-ghost" to="/ai-assistant">Open trip planner</Link>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="page-container" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', minHeight: '100vh', paddingBottom: 100 }}>
      
      {/* Dynamic Checkout Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        <div className="container" style={{ maxWidth: 800 }}>
          <span style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 30, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#93c5fd', letterSpacing: 0.5 }}>
            🛡️ Secure enquiry checkout
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, marginTop: 10, marginBottom: 8 }}>Secure Travel Checkout</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.98rem', maxWidth: 500, margin: '0 auto' }}>
            Review "{pkg?.title || 'Custom Tour Service'}" and submit a payment reference for our team to verify.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1050, marginTop: 30 }}>
        {/* Step Indicator Panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 30px', borderRadius: 12, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
          {[
            { step: 1, label: 'Traveler Details' },
            { step: 2, label: 'Review Booking' },
            { step: 3, label: 'Secure Payment' },
            { step: 4, label: 'Confirm Ticket' }
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', 
                  background: activeStep >= s.step ? 'var(--primary)' : '#e2e8f0',
                  color: activeStep >= s.step ? 'white' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 800, fontSize: '0.88rem',
                  boxShadow: activeStep === s.step ? '0 0 0 4px rgba(59,130,246,0.15)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {activeStep > s.step ? <Check size={16} strokeWidth={3} /> : s.step}
                </div>
                <span style={{ 
                  fontWeight: activeStep === s.step ? 800 : 600, 
                  fontSize: '0.88rem', 
                  color: activeStep === s.step ? 'var(--dark)' : '#64748b',
                  display: 'none', md: 'block' // responsive simulation
                }}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && <div style={{ flex: 1, height: 2, background: activeStep > s.step ? 'var(--primary)' : '#e2e8f0', margin: '0 15px' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: activeStep < 4 ? '1.4fr 1fr' : '1fr', gap: 30, alignItems: 'start' }}>
          
          {/* LEFT COMPONENT: Steps rendering */}
          <div>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: TRAVELER DETAILS FORM */}
              {activeStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card" style={{ padding: 32, backgroundColor: 'white' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    👤 Lead Traveler Information
                  </h2>
                  {formError && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: '0.84rem' }}>{formError}</div>}
                  <form onSubmit={handleCheckoutSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={fld}>
                        <label style={lbl}><User size={14} style={{ marginRight: 6 }} /> Full Name *</label>
                        <input type="text" required name="name" className="input-field" placeholder="e.g. Aditiya Nair" value={formData.name} onChange={handleInputChange} />
                      </div>
                      <div style={fld}>
                        <label style={lbl}><Phone size={14} style={{ marginRight: 6 }} /> Mobile Number *</label>
                        <input type="tel" required name="phone" className="input-field" placeholder="e.g. +91 9443217654" value={formData.phone} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={fld}>
                        <label style={lbl}><Mail size={14} style={{ marginRight: 6 }} /> Email Address *</label>
                        <input type="email" required name="email" className="input-field" placeholder="aditya@example.com" value={formData.email} onChange={handleInputChange} />
                      </div>
                      <div style={fld}>
                        <label style={lbl}><Calendar size={14} style={{ marginRight: 6 }} /> Date of Departure *</label>
                        <input type="date" required name="travelDate" className="input-field" min={new Date().toISOString().split('T')[0]} value={formData.travelDate} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      <div style={fld}>
                        <label style={lbl}><Users size={14} style={{ marginRight: 6 }} /> Total Passengers</label>
                        <select name="passengers" className="input-field" value={formData.passengers} onChange={handleInputChange}>
                          {['1','2','3','4','5','6','7','8+'].map(c => <option key={c} value={c}>{c} Pax</option>)}
                        </select>
                      </div>
                      <div style={fld}>
                        <label style={lbl}>Adults (12+ yrs)</label>
                        <select name="adults" className="input-field" value={formData.adults} onChange={handleInputChange}>
                          {Array.from({ length: Math.max(1, Number(formData.passengers)) }, (_, i) => String(i + 1)).map(c => <option key={c} value={c}>{c} Adult(s)</option>)}
                        </select>
                      </div>
                      <div style={fld}>
                        <label style={lbl}>Children (2-12 yrs)</label>
                        <select name="children" className="input-field" value={formData.children} onChange={handleInputChange}>
                          {['0','1','2','3','4'].map(c => <option key={c} value={c}>{c} Child(ren)</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={fld}>
                      <label style={lbl}>📝 Special Boarding / Dietary Requirements</label>
                      <textarea name="remarks" className="input-field resize-none" rows="3" placeholder="Preferred flight times, meal constraints, room type upgrade requests..." value={formData.remarks} onChange={handleInputChange} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                      Review Billing Details <ChevronRight size={18} />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: SUMMARY REVIEW SCREEN */}
              {activeStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card" style={{ padding: 32, backgroundColor: 'white' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--dark)', borderLeft: '4px solid var(--primary)', paddingLeft: 10 }}>
                    📋 Final Verification of Order details
                  </h2>

                  <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 14 }}>
                      👤 Primary Booking Contact details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '0.92rem' }}>
                      <div><strong>Passenger Name:</strong> {formData.name}</div>
                      <div><strong>Mobile Number:</strong> {formData.phone}</div>
                      <div><strong>Email ID:</strong> {formData.email}</div>
                      <div><strong>Travel Departure Date:</strong> {new Date(formData.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div><strong>Total Group Size:</strong> {formData.passengers} Pax ({formData.adults} Adults, {formData.children} Children)</div>
                      {formData.remarks && <div style={{ gridColumn: 'span 2' }}><strong>Custom Requests:</strong> {formData.remarks}</div>}
                    </div>
                  </div>

                  <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <ShieldCheck size={28} color="#10b981" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.84rem', color: '#047857', margin: 0, lineHeight: 1.5 }}>
                      <strong>Real-time Cancellation Policy:</strong> Full Refund is eligible if cancellation is triggered within 24 hours of booking. Direct WhatsApp helpline is activated for adjustments.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <button type="button" className="btn" style={{ background: '#f1f5f9', color: '#475569', flex: 1, fontWeight: 700 }} onClick={() => setActiveStep(1)}>
                      Modify Parameters
                    </button>
                    <button type="button" className="btn btn-primary" style={{ flex: 1.5, padding: '14px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setActiveStep(3)}>
                      Proceed to Pay ₹{totalAmount.toLocaleString()} <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SECURE PAYMENT TERMINALS */}
              {activeStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card" style={{ padding: 32, backgroundColor: 'white' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 6, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={18} color="var(--primary)" /> Secure payment handoff
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Use the verified UPI details or submit a bank-transfer reference. Card and net-banking gateway links will appear after provider setup.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 20, alignItems: 'stretch' }}>
                    
                    {/* Payment Mode Selector Tabs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { id: 'UPI', label: 'BHIM UPI', icon: Smartphone, color: '#ec4899' },
                        { id: 'BankTransfer', label: 'Bank NEFT/IMPS', icon: Copy, color: '#8b5cf6' }
                      ].map(t => {
                        const Icon = t.icon;
                        const isSel = paymentMethod === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { if (!t.disabled) { setPaymentMethod(t.id); setPaymentError(''); } }}
                            disabled={t.disabled}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '16px 12px',
                              borderRadius: 12,
                              border: isSel ? `2px solid ${t.color}` : '1.5px solid #e2e8f0',
                              background: isSel ? `${t.color}0a` : 'white',
                              color: isSel ? 'var(--dark)' : '#64748b',
                               cursor: t.disabled ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              transition: 'all 0.25s',
                               textAlign: 'left',
                               opacity: t.disabled ? 0.58 : 1
                            }}
                          >
                            <Icon size={18} color={isSel ? t.color : '#64748b'} />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Payment Mode Details Panel */}
                    <div style={{ border: '1.5px solid #cbd5e1', borderRadius: 16, padding: 24, background: '#f8fafc' }}>
                      
                      {/* 3A. UPI SCAN & CONFIRM (Locked to 9443217654) */}
                      {paymentMethod === 'UPI' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                          <div style={{ background: '#fdf2f8', border: '1.5px solid #db2777', padding: '10px 14px', borderRadius: 10, width: '100%', display: 'flex', gap: 10, alignItems: 'center' }}>
                            <ShieldCheck size={24} color="#db2777" style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: '0.78rem', color: '#9d174d', lineHeight: 1.4 }}>
                              <strong>Verify before paying:</strong> Confirm the recipient shown in your UPI app is SreePayanam and matches <strong>{upiId}</strong>. Do not proceed if the VPA differs.
                            </div>
                          </div>

                          <div style={{ background: 'white', padding: 12, borderRadius: 16, boxShadow: 'var(--shadow-sm)', display: 'inline-flex', justifyContent: 'center' }}>
                            <img src={upiQrUrl} alt="UPI QR Code" style={{ width: 180, height: 180 }} />
                          </div>

                          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            
                            {/* Copy UPI Address Details */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                              <span>UPI VPA: <strong>{upiId}</strong></span>
                              <button type="button" onClick={() => copyToClipboard(upiId, 'upi')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                                {copiedUpi ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy VPA</>}
                              </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                              <span>Amount: <strong>₹{totalAmount.toLocaleString()}</strong></span>
                              <button type="button" onClick={() => copyToClipboard(totalAmount, 'amt')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                                {copiedAmt ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Price</>}
                              </button>
                            </div>
                          </div>

                          <div style={{ width: '100%', height: '1.5px', background: '#cbd5e1' }} />

                          {/* Submit UPI Transaction Reference */}
                          <form onSubmit={handleUpiSubmit} noValidate style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={fld}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dark)' }}>
                                📋 Enter 12-digit UPI UTR / Reference No. *
                              </label>
                              <input 
                                type="text" 
                                required 
                                className="input-field" 
                                placeholder="Paste or type UTR No (e.g. 611204896231)" 
                                value={utrNumber}
                                onChange={e => setUtrNumber(e.target.value.replace(/\D/g, '').substring(0,12))}
                                style={{ background: 'white' }}
                              />
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Scan QR using GPay, PhonePe, or Paytm. Submit UTR once payment completes.
                              </span>
                            </div>

                            {paymentError && <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ {paymentError}</div>}

                            <button
                              type="submit"
                              disabled={submittingPayment || utrNumber.length < 12}
                              className="btn btn-secondary"
                              style={{ padding: '12px', width: '100%', fontWeight: 800, fontSize: '0.95rem', display: 'flex', justifyContent: 'center', gap: 8 }}
                            >
                              {submittingPayment ? (
                                <>
                                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                  Verifying UTR logs...
                                </>
                              ) : (
                                <>Confirm &amp; Log Payment Claim</>
                              )}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* 3D. BANK DIRECT TRANSFER (NEFT/IMPS) */}
                      {paymentMethod === 'BankTransfer' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ background: '#f5f3ff', border: '1px solid #c084fc', padding: 12, borderRadius: 10, fontSize: '0.8rem', color: '#6b21a8' }}>
                            Transfer the amount directly to SreePayanam bank account. Log transfer reference key below.
                          </div>

                          <div style={{ background: 'white', border: '1px solid #cbd5e1', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                            <div>🏢 <strong>Bank Name:</strong> Indian Bank</div>
                            <div>👤 <strong>Account Holder:</strong> SreePayanam Tours &amp; Travels</div>
                            <div>🔑 <strong>Account Number:</strong> 5002017654992</div>
                            <div>🚀 <strong>IFSC Code:</strong> IDIB000M088</div>
                            <div>📍 <strong>Branch:</strong> Chennai Main Head Office</div>
                          </div>

                          <form onSubmit={handleBankTransferSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={fld}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                NEFT / IMPS Reference Ref No. *
                              </label>
                              <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Enter Txn ID (e.g. INF20260524...)"
                                value={bankRefNumber}
                                onChange={e => setBankRefNumber(e.target.value.toUpperCase())}
                                style={{ background: 'white' }}
                              />
                            </div>

                            {paymentError && <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>⚠️ {paymentError}</div>}

                            <button
                              type="submit"
                              disabled={submittingPayment || !bankRefNumber.trim()}
                              className="btn btn-primary"
                              style={{ width: '100%', padding: '12px', fontWeight: 800 }}
                            >
                              {submittingPayment ? 'Logging Bank Transfer Reference...' : 'Log Transfer Reference'}
                            </button>
                          </form>
                        </div>
                      )}

                    </div>

                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS E-RECEIPT BOARDING PASS */}
              {activeStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="container" style={{ maxWidth: 650, margin: '0 auto' }}>
                  
                  {/* Confirmed Header */}
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle2 size={36} color="#16a34a" />
                    </div>
                    <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--dark)' }}>Booking Claim Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 450, margin: '6px auto 0' }}>
                      Your reservation claim is securely written to our ledger under reference <strong>{bookingRef}</strong>. Auditing will confirm within 15 mins.
                    </p>
                  </div>

                  {/* Boarding Pass Ticket Component */}
                  <div style={{
                    background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
                    border: '1.5px solid #cbd5e1', position: 'relative'
                  }}>
                    {/* Security Punch Holes simulation */}
                    <div style={{ position: 'absolute', top: '55%', left: -10, width: 20, height: 20, borderRadius: '50%', background: 'rgb(241, 245, 249)', borderRight: '1.5px solid #cbd5e1', zIndex: 10 }} />
                    <div style={{ position: 'absolute', top: '55%', right: -10, width: 20, height: 20, borderRadius: '50%', background: 'rgb(241, 245, 249)', borderLeft: '1.5px solid #cbd5e1', zIndex: 10 }} />

                    {/* Top Ticket Header */}
                    <div style={{ background: 'linear-gradient(135deg, #1e3b8a 0%, #0f172a 100%)', color: 'white', padding: 24, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.8, letterSpacing: 0.5 }}>OFFICIAL BOARDING PASS</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 2 }}>SreePayanam Tours</div>
                        </div>
                        <span style={{ background: '#fdf2f8', color: '#db2777', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800 }}>
                          PENDING AUDIT
                        </span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '20px 0 0' }}>
                        {pkg?.title || 'Custom Tour Package'}
                      </h3>
                      <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4 }}>
                        📍 {pkg?.destination || 'Custom itinerary'}
                      </div>
                    </div>

                    {/* Mid Ticket Details */}
                    <div style={{ padding: 24, textAlign: 'left' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '0.88rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LEAD PASSENGER</span>
                          <strong style={{ color: 'var(--dark)' }}>{formData.name}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>BOOKING REF ID</span>
                          <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{bookingRef}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DEPARTURE DATE</span>
                          <strong style={{ color: 'var(--dark)' }}>{new Date(formData.travelDate).toLocaleDateString('en-IN')}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL PASSENGERS</span>
                          <strong style={{ color: 'var(--dark)' }}>{formData.passengers} Passenger(s)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Dash Splitter line */}
                    <div style={{ borderTop: '2px dashed #cbd5e1', height: 1, width: '90%', margin: '0 auto' }} />

                    {/* Bottom Ticket Receipt */}
                    <div style={{ padding: 24, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PAYMENT CLAIM LOGGED</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--secondary)' }}>
                          ₹{totalAmount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          via {paymentMethod}
                        </div>
                      </div>

                      {/* Mock Barcode */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <div style={{
                          height: 35, width: 110,
                          backgroundImage: 'repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 6px, #0f172a 6px, #0f172a 7px, transparent 7px, transparent 10px)'
                        }} />
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{bookingRef}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acceleration Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                    <a
                      href={getWhatsAppReceiptLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{
                        background: '#25d366', color: 'white', padding: '14px', width: '100%', 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
                      }}
                    >
                      <MessageSquare size={18} /> Ping Operations desk on WhatsApp for Fast-Track
                    </a>

                    <button
                      type="button"
                      className="btn"
                      style={{ background: 'white', border: '1.5px solid #cbd5e1', color: 'var(--text-main)', width: '100%' }}
                      onClick={() => window.print()}
                    >
                      <Download size={16} style={{ marginRight: 6 }} /> Print / Save E-Ticket Receipt
                    </button>
                    
                    <Link to="/packages" className="btn" style={{ background: '#f1f5f9', color: '#475569', textAlign: 'center' }}>
                      Browse more Tour Packages
                    </Link>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* RIGHT COMPONENT: Summary Sidebar (Visible in steps 1, 2, 3) */}
          {activeStep < 4 && (
            <div style={{ position: 'sticky', top: 90 }}>
              <div className="glass-card" style={{ padding: 24, backgroundColor: 'white' }}>
                <h3 style={{ marginBottom: 16, color: 'var(--dark)', fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: 10 }}>
                  📋 Booking Summary details
                </h3>

                {pkg ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
                    <img 
                      src={pkg.imageUrl} 
                      alt={pkg.title} 
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100&q=80'; }}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--dark)', display: 'block', lineHeight: 1.3 }}>{pkg.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pkg.durationDays}D / {pkg.durationNights}N • {pkg.packageCategory}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>ID: {pkg.packageId}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 18 }}>Custom SreePayanam Booking service</div>
                )}

                {/* Bill Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Base Fare per Person</span>
                    <span>₹{basePrice.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Passengers Count</span>
                    <span>{formData.passengers} Pax</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 600 }}>
                    <span>GST Tax (5%)</span>
                    <span>₹{gstTax.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                  <span style={{ fontWeight: 800, color: 'var(--dark)' }}>Total Amount (INR)</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--secondary)' }}>
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Secure Badge */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid #cbd5e1' }}>
                  <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Manual verification:</strong> Your payment reference is sent over the site’s secure connection and remains pending until the SreePayanam operations desk verifies it.
                  </div>
                </div>

              </div>
            </div>
          )}

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

const fld = { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 };
const lbl = { fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', textAlign: 'left' };

export default Checkout;
