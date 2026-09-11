import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Settings, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import logoImg from '../assets/logo.png';

const packageLinks = [
  { label: 'National tours', path: '/packages?category=National' },
  { label: 'International tours', path: '/packages?category=International' },
  { label: 'Pilgrimage routes', path: '/packages?type=Pilgrimage%20Tours' },
  { label: 'Family holidays', path: '/packages?type=Family%20Tours' },
  { label: 'Honeymoon escapes', path: '/packages?type=Honeymoon%20Tours' },
  { label: 'Student & corporate', path: '/packages?type=Education%20Tours' }
];

const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const isPackageRoute = location.pathname === '/packages';

  return (
    <header className="site-nav">
      <nav className="container nav-shell" aria-label="Main navigation">
        <Link className="nav-brand" to="/" aria-label="SreePayanam home" onClick={() => setMobileOpen(false)}>
          <img src={logoImg} width="174" height="52" alt="SreePayanam Tours and Travels" />
        </Link>

        <button
          type="button"
          className="nav-mobile-toggle"
          aria-expanded={mobileOpen}
          aria-controls="site-nav-links"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileOpen(open => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div id="site-nav-links" className={`nav-links${mobileOpen ? ' open' : ''}`}>
          <NavLink to="/" className={linkClass} end onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/about" className={linkClass} onClick={() => setMobileOpen(false)}>About</NavLink>

          <details className="nav-menu">
            <summary className={`nav-summary${isPackageRoute ? ' active' : ''}`}>
              Packages <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="nav-popover">
              <Link to="/packages" onClick={() => setMobileOpen(false)}>All packages</Link>
              {packageLinks.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>{item.label}</Link>
              ))}
            </div>
          </details>

          <NavLink to="/bookings" className={linkClass} onClick={() => setMobileOpen(false)}>Book services</NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setMobileOpen(false)}>Contact</NavLink>
          <NavLink to="/ai-assistant" onClick={() => setMobileOpen(false)} className={({ isActive }) => `${linkClass({ isActive })} ai-link`}>
            <Sparkles size={15} aria-hidden="true" /> Planner
          </NavLink>

          {isLoggedIn ? (
            <details className="nav-menu nav-user">
              <summary className="nav-user-button" aria-label={`Open ${user?.fullName || 'account'} menu`}>
                <span className="nav-avatar" aria-hidden="true">{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
                <span className="nav-user-name">{user?.fullName?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={13} aria-hidden="true" />
              </summary>
              <div className="nav-popover">
                <div className="nav-account-copy">
                  <strong>{user?.fullName || 'Account'}</strong>
                  <span>{user?.role || 'Customer'}</span>
                </div>
                {user?.role === 'Admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}><Settings size={15} aria-hidden="true" /> Admin dashboard</Link>
                )}
                <Link to="/bookings" onClick={() => setMobileOpen(false)}><UserRound size={15} aria-hidden="true" /> My bookings</Link>
                <button type="button" onClick={handleLogout}><LogOut size={15} aria-hidden="true" /> Log out</button>
              </div>
            </details>
          ) : (
            <Link className="nav-link nav-login" to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
