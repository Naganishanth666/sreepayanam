import { useRef, useState } from 'react';
import { Clock3, Phone } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const firstErrorRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!/^[+\d][\d\s-]{7,19}$/.test(formData.phone.trim())) nextErrors.phone = 'Enter a valid phone number.';
    if (!formData.type) nextErrors.type = 'Choose what you need help with.';
    if (formData.message.trim().length < 10) nextErrors.message = 'Add a few details so we can plan a useful reply.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      firstErrorRef.current = document.getElementById(Object.keys(nextErrors)[0]);
      firstErrorRef.current?.focus();
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryType: formData.type,
          customerName: formData.name,
          mobileNumber: formData.phone,
          emailId: formData.email,
          remarks: formData.message
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Submission failed');

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', type: '', message: '' });
      setFieldErrors({});
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container contact-page">
      <div className="container contact-layout">
        <section className="contact-copy">
          <span className="eyebrow">Talk to the travel desk</span>
          <h1>Tell us where the route should lead.</h1>
          <p>Share a destination, a date, or simply the kind of trip you have in mind. A SreePayanam planner will shape the next step with you.</p>
          <div className="contact-methods">
            <div className="contact-method"><span className="contact-method-icon">01</span><div><strong>Quick planning</strong><span>Package ideas, stays, vehicles, and sightseeing in one conversation.</span></div></div>
            <div className="contact-method"><span className="contact-method-icon">02</span><div><strong>Human follow-up</strong><span>We use your details only to respond to this enquiry.</span></div></div>
            <div className="contact-method"><span className="contact-method-icon">03</span><div><strong>Quote-ready details</strong><span>Include dates and preferences for a more useful first reply.</span></div></div>
            <a className="contact-method contact-method-direct" href="tel:+919280077182">
              <span className="contact-method-icon" aria-hidden="true"><Phone size={16} /></span>
              <div><strong>Office phone</strong><span>+91 92800 77182</span></div>
            </a>
            <div className="contact-method">
              <span className="contact-method-icon" aria-hidden="true"><Clock3 size={16} /></span>
              <div><strong>Office hours</strong><span>10:00 am–6:00 pm · Monday to Saturday</span></div>
            </div>
          </div>
        </section>

        <section className="glass-card contact-card">
          <div className="section-kicker">Start a conversation</div>
          <h2>Send an enquiry</h2>
          <p className="contact-card-intro">Most replies arrive during the working day.</p>
          
          {success && (
            <div className="status-message status-success" role="status">
              Enquiry received. Our travel desk will contact you shortly.
            </div>
          )}

          {error && (
            <div className="status-message status-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="contact-form">
            <div className="contact-form-grid">
              <div className="field-wrap">
                <label htmlFor="name">Your name</label>
                <input id="name" type="text" name="name" autoComplete="name" placeholder="e.g. Priya Nair" className="input-field" value={formData.name} onChange={handleChange} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'name-error' : undefined} />
                {fieldErrors.name && <span id="name-error" className="field-error">{fieldErrors.name}</span>}
              </div>
              <div className="field-wrap">
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" name="email" autoComplete="email" placeholder="you@example.com" className="input-field" value={formData.email} onChange={handleChange} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
                {fieldErrors.email && <span id="email-error" className="field-error">{fieldErrors.email}</span>}
              </div>
              <div className="field-wrap">
                <label htmlFor="phone">Mobile number</label>
                <input id="phone" type="tel" name="phone" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" className="input-field" value={formData.phone} onChange={handleChange} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} />
                {fieldErrors.phone && <span id="phone-error" className="field-error">{fieldErrors.phone}</span>}
              </div>
              <div className="field-wrap">
                <label htmlFor="type">What can we plan?</label>
                <select id="type" name="type" className="input-field" value={formData.type} onChange={handleChange} aria-invalid={Boolean(fieldErrors.type)} aria-describedby={fieldErrors.type ? 'type-error' : undefined}>
                  <option value="">Choose one</option>
                  <option value="Tour Package Enquiry">Tour package</option>
                  <option value="Visa Services">Visa services</option>
                  <option value="Hotel Booking">Hotel booking</option>
                  <option value="General Enquiry">Something else</option>
                </select>
                {fieldErrors.type && <span id="type-error" className="field-error">{fieldErrors.type}</span>}
              </div>
            </div>
            <div className="field-wrap">
              <label htmlFor="message">Your requirements</label>
              <textarea id="message" name="message" placeholder="Tell us about destinations, dates, group size, or anything important to you." className="input-field contact-textarea resize-none" rows="5" value={formData.message} onChange={handleChange} aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? 'message-error' : undefined} />
              {fieldErrors.message && <span id="message-error" className="field-error">{fieldErrors.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending enquiry…' : 'Send enquiry'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default ContactUs;
