import React, { useState } from 'react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '120px 20px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--dark)' }}>Contact Us</h1>
          
          {success && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
              🎉 Enquiry submitted successfully! Our travel experts will contact you shortly.
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input 
              type="text" 
              name="name"
              placeholder="Your Name" 
              className="input-field" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              className="input-field" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <input 
              type="tel" 
              name="phone"
              placeholder="Mobile Number" 
              className="input-field" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
            
            <select 
              name="type"
              className="input-field" 
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Enquiry Type</option>
              <option value="Tour Package Enquiry">Tour Package</option>
              <option value="Visa Services">Visa Services</option>
              <option value="Hotel Booking">Hotel Booking</option>
              <option value="General Enquiry">General Enquiry</option>
            </select>
            
            <textarea 
              name="message"
              placeholder="Your Message or Requirements" 
              className="input-field" 
              rows="4" 
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
