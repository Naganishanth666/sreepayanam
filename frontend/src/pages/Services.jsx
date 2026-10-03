import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SERVICES } from '../utils/servicesCatalog';

const ServiceRequest = ({ service }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', consent: false, notes: '' });
  const [reference] = useState(() => `SP-SVC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [received, setReceived] = useState(false);
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault();
    setError('');
    if (!form.name?.trim() || !/^\+?[0-9 ()-]{8,20}$/.test(form.phone || '') || !/^\S+@\S+\.\S+$/.test(form.email || '')) {
      setError('Enter your name, a valid mobile number and email address.'); return;
    }
    if (service.fields.some(([key, , type]) => !String(form[key] || '').trim() || (type === 'number' && Number(form[key]) < 1))) {
      setError('Complete the service details before sending your request.'); return;
    }
    if (!form.consent) { setError('Please agree to be contacted about this request.'); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryType: service.title, customerName: form.name, mobileNumber: form.phone,
          emailId: form.email, quoteReference: reference, leadSource: 'website',
          contactConsent: true, consentVersion: 'service-request-v1.3-2026-10-03',
          travelDate: form.travelDate || undefined, numberOfPassengers: Number(form.passengers || form.travellers || form.capacity) || undefined,
          toLocation: form.destination || undefined, remarks: form.notes,
          detailedPreferences: { service: service.title, ...Object.fromEntries(service.fields.map(([key]) => [key, form[key] || ''])) }
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not send your request.');
      setReceived(true);
    } catch (submitError) { setError(submitError.message); }
    finally { setBusy(false); }
  };
  if (received) return <section className="service-request service-received" role="status"><CheckCircle2 size={34} /><h2>Request received</h2><p>Reference <strong>{reference}</strong>. Our team will review your request and contact you.</p><p>For a faster conversation, contact us on <a href={`https://wa.me/919280077182?text=${encodeURIComponent(`Hello SreePayanam, I have a ${service.title} request, ${reference}.`)}`} target="_blank" rel="noreferrer">WhatsApp</a> and tap Send.</p></section>;
  return <form className="service-request" onSubmit={submit} noValidate>
    <h2>Request assistance</h2><p>Share only the details needed to plan this service. No payment or identity document is required here.</p>
    {error && <p className="form-status is-error" role="alert">{error}</p>}
    <div className="service-field-grid">
      <label>Full name *<input required autoComplete="name" value={form.name} onChange={event => change('name', event.target.value)} /></label>
      <label>Mobile / WhatsApp *<input required type="tel" autoComplete="tel" value={form.phone} onChange={event => change('phone', event.target.value)} /></label>
      <label>Email *<input required type="email" autoComplete="email" value={form.email} onChange={event => change('email', event.target.value)} /></label>
      {service.fields.map(([key, label, type]) => <label key={key}>{label} *<input required type={type} min={type === 'number' ? '1' : undefined} value={form[key] || ''} onChange={event => change(key, event.target.value)} /></label>)}
    </div>
    <label>Additional notes<textarea className="resize-none" rows="3" maxLength="1000" value={form.notes} onChange={event => change('notes', event.target.value)} /></label>
    <label className="service-consent"><input required type="checkbox" checked={form.consent} onChange={event => change('consent', event.target.checked)} /> I agree to be contacted by SreePayanam about this service request. *</label>
    <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send service request'}</button>
  </form>;
};

const Services = () => {
  const { slug } = useParams();
  const service = SERVICES.find(item => item.slug === slug);
  if (slug && !service) return <main className="page-container services-page"><div className="container"><h1>Service not found</h1><Link to="/services">Browse services</Link></div></main>;
  return <main className="page-container services-page"><div className="container">
    {service ? <>
      <Link className="services-back" to="/services"><ArrowLeft size={17} /> All services</Link>
      <div className="service-detail-grid"><div><span className="eyebrow">Book services</span><h1>{service.title}</h1><p className="service-lead">{service.summary}</p><p className="service-caveat">{service.caveat}</p></div><ServiceRequest key={service.slug} service={service} /></div>
    </> : <>
      <span className="eyebrow">SreePayanam services</span><h1>Travel services, arranged around your plans.</h1><p className="service-lead">Choose a service and share the details our team needs to prepare current options.</p>
      <div className="service-card-grid">{SERVICES.map(item => <Link className="service-card" to={`/services/${item.slug}`} key={item.slug}><h2>{item.title}</h2><p>{item.summary}</p><span>Request assistance <ArrowRight size={17} /></span></Link>)}</div>
    </>}
  </div></main>;
};

export default Services;
