import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, Phone, MapPin, Briefcase, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TOUR_CATEGORIES = [
  'Family Tours', 'Honeymoon Tours', 'Pilgrimage Tours', 'Adventure Tours',
  'Hill Station Tours', 'MICE Tours', 'Education Tours', 'Medical Tours'
];

const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, required, name, showToggle, onToggle, showPassword }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
      color: 'var(--primary)', pointerEvents: 'none', zIndex: 1
    }}>
      <Icon size={16} />
    </div>
    <input
      name={name}
      type={showToggle ? (showPassword ? 'text' : 'password') : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="input-field"
      style={{ paddingLeft: 40, paddingRight: showToggle ? 40 : 14 }}
    />
    {showToggle && (
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0
        }}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    )}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin]         = useState(true);
  const [role, setRole]               = useState('Customer');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: '', mobile: '', email: '', password: '',
    city: '', state: '', country: 'India',
    whatsappNumber: '',
    // Agent fields
    agencyName: '', officeAddress: '', businessCategory: '',
    // Customer fields
    preferredTravelCategory: ''
  });

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        // Redirect Admin to /admin, others to where they came from
        if (data.role === 'Admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const payload = {
          ...form,
          role,
          ...(role === 'Agent' && {
            agencyName: form.agencyName,
            officeAddress: form.officeAddress,
            businessCategory: form.businessCategory
          }),
          ...(role === 'Customer' && {
            preferredTravelCategory: form.preferredTravelCategory
          })
        };
        const data = await register(payload);
        if (role === 'Agent') {
          setSuccess('✅ Agent account created! Awaiting admin approval before you can log in.');
          setIsLogin(true);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '90px 20px 40px'
    }}>
      {/* Decorative background orbs */}
      <div style={{ position: 'fixed', top: '15%', left: '8%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: isLogin ? 440 : 560, zIndex: 1 }}
      >
        {/* Header Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px 24px 0 0',
          padding: '32px 32px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            {isLogin ? <LogIn size={28} color="white" /> : <UserPlus size={28} color="white" />}
          </div>
          <h1 style={{ color: 'white', fontSize: '1.7rem', fontWeight: 800, marginBottom: 6 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            {isLogin
              ? 'Sign in to manage your bookings and trips'
              : 'Join SreePayanam for personalised travel experiences'}
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)', borderTop: 'none',
          borderRadius: '0 0 24px 24px', padding: '32px'
        }}>
          {/* Role selector (register only) */}
          {!isLogin && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {['Customer', 'Agent'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 700,
                    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                    border: role === r ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                    background: role === r ? 'var(--primary)' : 'white',
                    color: role === r ? 'white' : '#64748b'
                  }}
                >
                  {r === 'Customer' ? '🧳 Customer' : '🏢 Travel Agent'}
                </button>
              ))}
            </div>
          )}

          {/* Agent notice */}
          {!isLogin && role === 'Agent' && (
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
              padding: '10px 14px', marginBottom: 18, fontSize: '0.82rem', color: '#1d4ed8'
            }}>
              ℹ️ Agent accounts require <strong>admin approval</strong> before you can log in.
            </div>
          )}

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
                padding: '10px 14px', marginBottom: 18, color: '#dc2626', fontSize: '0.88rem'
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
                padding: '10px 14px', marginBottom: 18, color: '#16a34a', fontSize: '0.88rem'
              }}
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Register-only: Full Name */}
            {!isLogin && (
              <InputField icon={User} name="fullName" placeholder="Full Name *"
                value={form.fullName} onChange={handleChange} required />
            )}

            {/* Register-only: Mobile */}
            {!isLogin && (
              <InputField icon={Phone} name="mobile" placeholder="Mobile Number *"
                value={form.mobile} onChange={handleChange} required />
            )}

            {/* Email — always shown */}
            <InputField icon={Mail} type="email" name="email" placeholder="Email Address *"
              value={form.email} onChange={handleChange} required />

            {/* Password — always shown */}
            <InputField
              icon={Lock} name="password" placeholder={isLogin ? "Password *" : "Password (min 6 chars) *"}
              value={form.password} onChange={handleChange} required
              showToggle onToggle={() => setShowPassword(p => !p)} showPassword={showPassword}
            />

            {/* Register-only: Location */}
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <InputField icon={MapPin} name="city" placeholder="City"
                  value={form.city} onChange={handleChange} />
                <InputField icon={MapPin} name="state" placeholder="State"
                  value={form.state} onChange={handleChange} />
              </div>
            )}

            {/* Agent-specific fields */}
            {!isLogin && role === 'Agent' && (
              <>
                <InputField icon={Briefcase} name="agencyName" placeholder="Agency / Company Name *"
                  value={form.agencyName} onChange={handleChange} required />
                <InputField icon={MapPin} name="officeAddress" placeholder="Office Address"
                  value={form.officeAddress} onChange={handleChange} />
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1 }}>
                    <Briefcase size={16} />
                  </div>
                  <select name="businessCategory" value={form.businessCategory} onChange={handleChange}
                    className="input-field" style={{ paddingLeft: 40 }}>
                    <option value="">Business Category</option>
                    {['Inbound Tourism', 'Outbound Tourism', 'Domestic Tourism', 'Corporate MICE', 'Education Tours', 'Pilgrimage Tours'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Customer-specific fields */}
            {!isLogin && role === 'Customer' && (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1 }}>
                  <Sparkles size={16} />
                </div>
                <select name="preferredTravelCategory" value={form.preferredTravelCategory} onChange={handleChange}
                  className="input-field" style={{ paddingLeft: 40 }}>
                  <option value="">Preferred Tour Type (Optional)</option>
                  {TOUR_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                marginTop: 6, padding: '13px', fontSize: '1rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2.5px solid white',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block'
                  }} />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                isLogin ? '🔐 Sign In' : '🚀 Create Account'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p style={{ textAlign: 'center', marginTop: 22, fontSize: '0.9rem', color: '#64748b' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={toggleMode}
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
            >
              {isLogin ? 'Register' : 'Sign In'}
            </span>
          </p>

          {/* Admin hint */}
          {isLogin && (
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.8rem', color: '#94a3b8' }}>
              Staff / Admin?{' '}
              <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Go to Admin Panel →
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
