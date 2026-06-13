import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Tag, Search, SlidersHorizontal, ArrowUpDown, RefreshCw, X, Sparkles } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

const TOUR_TYPE_INFO = {
  'Family Tours': { icon: '👨‍👩‍👧‍👦', color: '#3b82f6' },
  'Pilgrimage Tours': { icon: '🛕', color: '#f59e0b' },
  'Honeymoon Tours': { icon: '💑', color: '#ec4899' },
  'Hill Station Tours': { icon: '🏔️', color: '#10b981' },
  'Resort Packages': { icon: '🏖️', color: '#06b6d4' },
  'Weekend Tours': { icon: '🚗', color: '#8b5cf6' },
  'Group Tours': { icon: '🎒', color: '#f97316' },
  'School / College Tours': { icon: '🎓', color: '#ef4444' },
  'Corporate Tours': { icon: '🏢', color: '#64748b' },
  'Festival Tours': { icon: '🎆', color: '#d946ef' },
  'Cultural Tours': { icon: '🎭', color: '#84cc16' },
  'Medical Tours': { icon: '🏥', color: '#ef4444' },
  'Event / Sports Tours': { icon: '⚽', color: '#f59e0b' },
  'Cruise Packages': { icon: '🚢', color: '#06b6d4' },
  'Luxury Tours': { icon: '💎', color: '#a855f7' },
  'Budget Tours': { icon: '🏷️', color: '#10b981' },
  'MICE Tours': { icon: '💼', color: '#3b82f6' },
  'Education Tours': { icon: '📚', color: '#f97316' },
  'Adventure Tours': { icon: '🧗', color: '#f43f5e' }
};

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('dest') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All'); // 'All' | 'National' | 'International'
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'priceLow' | 'priceHigh' | 'durationShort' | 'durationLong'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load active packages
  useEffect(() => {
    setLoading(true);
    fetch('/api/packages')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tour packages.');
        return res.json();
      })
      .then(data => {
        setPackages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Sync state from query parameters on load/change
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const destParam = searchParams.get('dest');
    const catParam = searchParams.get('category');

    if (typeParam) {
      // Find matching type (robust matching e.g. "Pilgrimage" matches "Pilgrimage Tours")
      const matched = Object.keys(TOUR_TYPE_INFO).find(
        key => key.toLowerCase().includes(typeParam.toLowerCase()) || typeParam.toLowerCase().includes(key.toLowerCase())
      );
      setSelectedType(matched || typeParam);
    } else {
      setSelectedType('');
    }

    if (destParam) setSearchQuery(destParam);
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  // Update query params when filters change (for deep linking)
  const updateQueryParams = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  // Helper: Get price of package
  const getPackagePrice = (pkg) => {
    return pkg.offerPrice || pkg.originalPrice || pkg.price || 0;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('');
    setMaxPrice(150000);
    setSortBy('recommended');
    setSearchParams({});
  };

  // Calculate highest package price for dynamic slider limit
  const maxAvailablePrice = packages.length > 0 
    ? Math.max(...packages.map(p => getPackagePrice(p))) 
    : 150000;

  // Filter & Sort Logic
  const filteredPackages = packages.filter(pkg => {
    const price = getPackagePrice(pkg);
    const matchesSearch = 
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || 
      pkg.packageCategory === selectedCategory;

    const matchesType = 
      !selectedType || 
      pkg.tourType === selectedType ||
      (pkg.tourType && pkg.tourType.toLowerCase().includes(selectedType.toLowerCase()));

    const matchesPrice = price <= maxPrice;

    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  }).sort((a, b) => {
    const priceA = getPackagePrice(a);
    const priceB = getPackagePrice(b);

    if (sortBy === 'priceLow') return priceA - priceB;
    if (sortBy === 'priceHigh') return priceB - priceA;
    if (sortBy === 'durationShort') return a.durationDays - b.durationDays;
    if (sortBy === 'durationLong') return b.durationDays - a.durationDays;
    return 0; // Default recommended (as returned by DB)
  });

  // Unique list of types present in loaded packages with counts
  const typeCounts = packages.reduce((acc, pkg) => {
    if (pkg.tourType) {
      acc[pkg.tourType] = (acc[pkg.tourType] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="page-container" style={{ background: '#f8fafc', paddingBottom: 80 }}>
      {/* Top Banner / Hero */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', 
        padding: '60px 20px', 
        color: 'white', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 40
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: 'radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ 
              background: 'rgba(255,255,255,0.12)', 
              color: '#3b82f6', 
              padding: '6px 16px', 
              borderRadius: 20, 
              fontSize: '0.85rem', 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'inline-block',
              marginBottom: 16
            }}>
              🌴 Wanderlust Awaits
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 12 }}>Explore Tour Packages</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
              Discover handcrafted national and international getaways customized to perfection.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'start' }}>
          
          {/* 1. FILTER SIDEBAR (Desktop) */}
          <aside className="glass-card" style={{ 
            padding: 24, 
            display: 'block', 
            position: 'sticky', 
            top: 90, 
            backgroundColor: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h3 style={{ fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem' }}>
                <SlidersHorizontal size={18} color="var(--primary)" /> Filters
              </h3>
              <button 
                onClick={resetFilters}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <RefreshCw size={12} /> Clear All
              </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <label style={filterLabel}>Search Tour</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Destination or title..." 
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    updateQueryParams({ dest: e.target.value });
                  }}
                  style={{ paddingLeft: 40, height: 44, fontSize: '0.9rem' }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            {/* Category Segment Tabs */}
            <div style={{ marginBottom: 24 }}>
              <label style={filterLabel}>Package Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
                {['All', 'National', 'International'].map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button 
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        updateQueryParams({ category: cat === 'All' ? null : cat });
                      }}
                      style={{
                        padding: '8px 0',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: 8,
                        background: isActive ? 'white' : 'transparent',
                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                        boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...filterLabel, margin: 0 }}>Max Price</label>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--secondary)' }}>₹{maxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max={maxAvailablePrice > 5000 ? maxAvailablePrice : 150000} 
                step="2000"
                value={maxPrice} 
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                <span>₹5,000</span>
                <span>₹{(maxAvailablePrice > 5000 ? maxAvailablePrice : 150000).toLocaleString()}</span>
              </div>
            </div>

            {/* Tour Types */}
            <div>
              <label style={filterLabel}>Tour Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
                <button 
                  onClick={() => {
                    setSelectedType('');
                    updateQueryParams({ type: null });
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: !selectedType ? 'var(--primary)' : '#f8fafc',
                    color: !selectedType ? 'white' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>✨ All Tour Types</span>
                  <span style={{ fontSize: '0.75rem', background: !selectedType ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: !selectedType ? 'white' : 'var(--text-muted)', padding: '2px 6px', borderRadius: 10 }}>
                    {packages.length}
                  </span>
                </button>

                {Object.keys(TOUR_TYPE_INFO).map(type => {
                  const count = typeCounts[type] || 0;
                  // Skip listing types with 0 count to keep it clean, unless it's currently selected
                  if (count === 0 && selectedType !== type) return null;

                  const isSelected = selectedType === type;
                  const info = TOUR_TYPE_INFO[type] || { icon: '📍', color: 'var(--primary)' };

                  return (
                    <button 
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        updateQueryParams({ type });
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: isSelected ? 'var(--primary)' : '#f8fafc',
                        color: isSelected ? 'white' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{info.icon}</span>
                        <span>{type.replace(' Tours', '').replace(' Packages', '')}</span>
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        background: isSelected ? 'rgba(255,255,255,0.25)' : '#cbd5e1', 
                        color: isSelected ? 'white' : 'var(--dark)', 
                        padding: '2px 6px', 
                        borderRadius: 10 
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* 2. RESULTS CONTAINER */}
          <main>
            {/* Sorting & Stats Top Bar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 24, 
              flexWrap: 'wrap', 
              gap: 16,
              background: 'white',
              padding: '16px 20px',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: 600 }}>
                Showing <strong style={{ color: 'var(--dark)' }}>{filteredPackages.length}</strong> beautiful packages
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <ArrowUpDown size={14} /> Sort By:
                </span>
                <select 
                  className="input-field" 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ width: 180, height: 38, padding: '0 12px', fontSize: '0.88rem', borderRadius: 8, cursor: 'pointer' }}
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="durationShort">Duration: Shortest</option>
                  <option value="durationLong">Duration: Longest</option>
                </select>
              </div>
            </div>

            {/* Packages Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', height: 380, animation: 'pulse 1.5s infinite' }}>
                    <div style={{ height: 210, background: '#e2e8f0' }} />
                    <div style={{ padding: 20 }}>
                      <div style={{ height: 20, background: '#e2e8f0', borderRadius: 4, marginBottom: 12 }} />
                      <div style={{ height: 14, background: '#f1f5f9', borderRadius: 4, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPackages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px', 
                  color: 'var(--text-muted)', 
                  background: 'white', 
                  borderRadius: 20,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛸</div>
                <h3 style={{ color: 'var(--dark)', fontWeight: 800, marginBottom: 10, fontSize: '1.4rem' }}>No Matching Packages Found</h3>
                <p style={{ maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.6 }}>
                  We couldn't find any tour matching your current filters. Try expanding your search query or choosing another type.
                </p>
                <button onClick={resetFilters} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={16} /> Reset All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}
              >
                <AnimatePresence>
                  {filteredPackages.map((pkg, i) => (
                    <PackageCard key={pkg._id} pkg={pkg} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
};

// Internal Card Component
const PackageCard = ({ pkg, index }) => {
  const navigate = useNavigate();
  const price = pkg.offerPrice || pkg.originalPrice || pkg.price || 0;
  const discount = pkg.offerPrice && pkg.originalPrice ? Math.round((1 - pkg.offerPrice / pkg.originalPrice) * 100) : 0;
  
  const typeInfo = TOUR_TYPE_INFO[pkg.tourType] || { icon: '🏝️', color: 'var(--primary)' };

  return (
    <motion.div
      layout
      className="glass-card"
      style={{ overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s', backgroundColor: 'white' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      onClick={() => navigate(`/package/${pkg._id}`)}
    >
      {/* Image Block */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
        <img
          src={pkg.imageUrl || FALLBACK_IMG}
          alt={pkg.title}
          onError={e => { e.target.src = FALLBACK_IMG; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span style={{ 
            background: 'rgba(59,130,246,0.9)', 
            color: 'white', 
            padding: '3px 10px', 
            borderRadius: 20, 
            fontSize: '0.72rem', 
            fontWeight: 700, 
            backdropFilter: 'blur(4px)' 
          }}>
            {pkg.packageCategory || 'National'}
          </span>
          {discount > 0 && (
            <span style={{ 
              background: 'rgba(239,68,68,0.9)', 
              color: 'white', 
              padding: '3px 10px', 
              borderRadius: 20, 
              fontSize: '0.72rem', 
              fontWeight: 700 
            }}>
              {discount}% OFF
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span style={{ 
            background: 'rgba(0,0,0,0.6)', 
            color: 'white', 
            padding: '4px 10px', 
            borderRadius: 20, 
            fontSize: '0.72rem', 
            backdropFilter: 'blur(4px)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            fontWeight: 600
          }}>
            <Clock size={11} /> {pkg.durationDays}D/{pkg.durationNights || (pkg.durationDays - 1)}N
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div style={{ padding: '20px 20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: '1rem' }}>{typeInfo.icon}</span>
          <span style={{ fontSize: '0.78rem', color: typeInfo.color, fontWeight: 700 }}>
            {pkg.tourType || 'Tour'}
          </span>
        </div>
        
        <h3 style={{ 
          fontWeight: 800, 
          color: 'var(--dark)', 
          marginBottom: 8, 
          fontSize: '1.05rem', 
          lineHeight: 1.45,
          height: '2.9rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {pkg.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <MapPin size={13} color="var(--primary)" /> {pkg.destination}
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>₹{price.toLocaleString()}</span>
            </div>
            {pkg.offerPrice && pkg.originalPrice && (
              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginTop: -2 }}>
                ₹{pkg.originalPrice.toLocaleString()}
              </span>
            )}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>per person</div>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 8 }} 
            onClick={e => { e.stopPropagation(); navigate(`/package/${pkg._id}`); }}
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const filterLabel = { 
  display: 'block', 
  fontSize: '0.8rem', 
  fontWeight: 700, 
  textTransform: 'uppercase', 
  letterSpacing: '0.5px', 
  color: 'var(--text-muted)', 
  marginBottom: 8 
};

export default Packages;
