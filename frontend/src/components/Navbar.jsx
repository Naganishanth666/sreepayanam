import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Settings, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import logoImg from '../assets/sreepayanam-letterhead-logo.png';
import { CATALOG_CATEGORIES } from '../utils/catalogCategories';

const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState('');
  const [categories, setCategories] = useState(CATALOG_CATEGORIES.map(name => ({ name })));
  const [menuPackages, setMenuPackages] = useState([]);
  const navRef = useRef(null);

  useEffect(() => {
    let active = true;
    const load = () => fetch('/api/catalog-categories').then(response => {
      if (!response.ok) throw new Error('Categories unavailable');
      return response.json();
    }).then(data => {
      if (active && Array.isArray(data)) setCategories(data);
    }).catch(() => {});
    load();
    window.addEventListener('sreepayanam:catalog-updated', load);
    return () => { active = false; window.removeEventListener('sreepayanam:catalog-updated', load); };
  }, []);

  useEffect(() => {
    let active = true;
    const load = () => fetch('/api/packages/menu').then(response => response.ok ? response.json() : [])
      .then(data => { if (active && Array.isArray(data)) setMenuPackages(data); }).catch(() => {});
    load();
    window.addEventListener('sreepayanam:catalog-updated', load);
    return () => { active = false; window.removeEventListener('sreepayanam:catalog-updated', load); };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { setOpenMenu(''); setMobileOpen(false); }, 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const closeOutside = event => { if (!navRef.current?.contains(event.target)) setOpenMenu(''); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  const closeMenus = () => { setOpenMenu(''); setMobileOpen(false); };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  const isPackageRoute = location.pathname === '/packages';

  return (
    <header className="site-nav">
      <nav ref={navRef} className="container nav-shell" aria-label="Main navigation" onKeyDown={event => { if (event.key === 'Escape') setOpenMenu(''); }}>
        <Link className="nav-brand" to="/" aria-label="SreePayanam AI Travel Ecosystem home" onClick={() => setMobileOpen(false)}>
          <img src={logoImg} width="430" height="143" alt="SreePayanam Tours and Travels" />
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

          <details className="nav-menu" open={openMenu === 'packages'} onMouseLeave={() => setOpenMenu('')}>
            <summary className={`nav-summary${isPackageRoute ? ' active' : ''}`} aria-expanded={openMenu === 'packages'} onClick={event => { event.preventDefault(); setOpenMenu(current => current === 'packages' ? '' : 'packages'); }}>
              Packages <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="nav-popover">
              <Link to="/packages" onClick={closeMenus}>All packages</Link>
              {categories.map(item => (
                <Link key={item.name} to={`/packages?catalog=${encodeURIComponent(item.name)}`} onClick={closeMenus}>{item.name}</Link>
              ))}
              {menuPackages.length > 0 && <><div className="nav-popover-heading">Featured packages</div>{menuPackages.map(pkg => <Link key={pkg.packageId} to={`/package/${pkg.packageId}`} onClick={closeMenus}>{pkg.title}</Link>)}</>}
            </div>
          </details>

          <details className="nav-menu" open={openMenu === 'content'} onMouseLeave={() => setOpenMenu('')}>
            <summary className={`nav-summary${['/blogs', '/brochures'].includes(location.pathname) ? ' active' : ''}`} aria-expanded={openMenu === 'content'} onClick={event => { event.preventDefault(); setOpenMenu(current => current === 'content' ? '' : 'content'); }}>
              Blogs &amp; Brochures <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="nav-popover">
              <div className="nav-popover-heading">Blog articles</div>
              <Link to="/blogs" onClick={closeMenus}>Read travel articles</Link>
              <div className="nav-popover-heading">Marketing brochures</div>
              <Link to="/brochures" onClick={closeMenus}>View or download brochures</Link>
            </div>
          </details>

          <NavLink to="/services" className={linkClass} onClick={() => setMobileOpen(false)}>Book services</NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setMobileOpen(false)}>Contact</NavLink>
          <NavLink to="/ai-assistant" onClick={() => setMobileOpen(false)} className={({ isActive }) => `${linkClass({ isActive })} ai-link`}>
            <Sparkles size={15} aria-hidden="true" /> Planner
          </NavLink>

          {isLoggedIn ? (
            <details className="nav-menu nav-user" open={openMenu === 'account'} onMouseLeave={() => setOpenMenu('')}>
              <summary className="nav-user-button" aria-label={`Open ${user?.fullName || 'account'} menu`} aria-expanded={openMenu === 'account'} onClick={event => { event.preventDefault(); setOpenMenu(current => current === 'account' ? '' : 'account'); }}>
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
                  <Link to="/admin" onClick={closeMenus}><Settings size={15} aria-hidden="true" /> Admin dashboard</Link>
                )}
                <Link to="/bookings" onClick={closeMenus}><UserRound size={15} aria-hidden="true" /> My bookings</Link>
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
