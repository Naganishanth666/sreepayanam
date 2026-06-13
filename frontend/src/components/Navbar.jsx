import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Sparkles, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const ROLE_COLOR = {
  Admin:    { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  Agent:    { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  Customer: { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [packagesHover, setPackagesHover] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const roleStyle = user ? (ROLE_COLOR[user.role] || ROLE_COLOR.Customer) : null;

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <img src={logoImg} alt="SreePayanam Tours & Travels" style={styles.logoImg} />
        </Link>

        {/* Nav Links */}
        <div style={styles.links}>
          <Link to="/"           style={isActive('/')           ? styles.activeLink : styles.link}>Home</Link>
          <Link to="/about"      style={isActive('/about')      ? styles.activeLink : styles.link}>About Us</Link>
          
          {/* Packages Hover Category Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setPackagesHover(true)}
            onMouseLeave={() => setPackagesHover(false)}
          >
            <Link 
              to="/packages" 
              style={{
                ...(isActive('/packages') ? styles.activeLink : styles.link),
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <span>Packages</span>
              <ChevronDown size={14} style={{
                transition: 'transform 0.2s',
                transform: packagesHover ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </Link>
            
            <AnimatePresence>
              {packagesHover && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '100%', left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white', borderRadius: 14, minWidth: 260,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9',
                    padding: '12px 8px', zIndex: 99999,
                    display: 'grid', gridTemplateColumns: '1fr', gap: 2,
                    marginTop: 8
                  }}
                >
                  {[
                    { label: '🌎 National Tours', path: '/packages?category=National' },
                    { label: '✈️ International Tours', path: '/packages?category=International' },
                    { label: '🛕 Pilgrimage Tours', path: '/packages?type=Pilgrimage' },
                    { label: '💑 Honeymoon Packages', path: '/packages?type=Honeymoon' },
                    { label: '👨‍👩‍👧‍👦 Family Tours', path: '/packages?type=Family' },
                    { label: '🎓 Educational Tours', path: '/packages?type=Education' },
                    { label: '🏥 Medical Tours', path: '/packages?type=Medical' },
                    { label: '💼 Corporate/MICE Tours', path: '/packages?type=MICE' },
                    { label: '🚢 Cruise & Rail Tours', path: '/packages?type=Cruise' },
                    { label: '📝 Visa & Core Services', path: '/bookings' }
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600,
                        color: 'var(--text-main)', textDecoration: 'none',
                        borderRadius: 8, transition: 'all 0.2s',
                      }}
                      onClick={() => setPackagesHover(false)}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#eff6ff';
                        e.target.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = 'var(--text-main)';
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/bookings"   style={isActive('/bookings')   ? styles.activeLink : styles.link}>Book Services</Link>
          <Link to="/contact"    style={isActive('/contact')    ? styles.activeLink : styles.link}>Contact</Link>
          <Link to="/ai-assistant" style={{
            ...(isActive('/ai-assistant') ? styles.activeLink : styles.link),
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <Sparkles size={15} /> AI Planner
          </Link>

          {/* Auth Section */}
          {isLoggedIn ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'white', border: '1.5px solid #e2e8f0',
                  borderRadius: 40, padding: '6px 14px 6px 10px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0
                }}>
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.2 }}>
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: roleStyle?.bg, color: roleStyle?.text,
                    borderRadius: 20, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: roleStyle?.dot }} />
                    {user?.role}
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" style={{
                  transition: 'transform 0.2s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'white', borderRadius: 14, minWidth: 200,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9',
                  overflow: 'hidden', zIndex: 9999
                }}>
                  {/* User info header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{user?.fullName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{user?.email}</div>
                  </div>

                  {/* Admin Dashboard link */}
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={styles.dropdownItem}
                    >
                      <Settings size={15} color="var(--primary)" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {/* My Bookings */}
                  <Link
                    to="/bookings"
                    onClick={() => setDropdownOpen(false)}
                    style={styles.dropdownItem}
                  >
                    <User size={15} color="#64748b" />
                    <span>My Bookings</span>
                  </Link>

                  {/* Logout */}
                  <button onClick={handleLogout} style={{
                    ...styles.dropdownItem,
                    width: '100%', textAlign: 'left',
                    borderTop: '1px solid #f1f5f9',
                    color: '#dc2626', background: 'none', cursor: 'pointer'
                  }}>
                    <LogOut size={15} color="#dc2626" />
                    <span style={{ fontWeight: 600 }}>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', color: 'white', fontWeight: 700 }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: '70px',
    backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--glass-border)', zIndex: 1000,
    display: 'flex', alignItems: 'center',
  },
  navContainer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
  },
  logo: {
    display: 'flex', alignItems: 'center',
    textDecoration: 'none',
  },
  logoImg: {
    height: '46px',
    maxWidth: '220px',
    objectFit: 'contain',
    display: 'block',
  },
  links: {
    display: 'flex', gap: 22, alignItems: 'center',
  },
  link: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)',
    transition: 'color 0.2s', textDecoration: 'none',
  },
  activeLink: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)',
    textDecoration: 'none',
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 16px', fontSize: '0.88rem', fontWeight: 500,
    color: '#1e293b', textDecoration: 'none', transition: 'background 0.15s',
    border: 'none', fontFamily: 'inherit',
  },
};

export default Navbar;
