import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Check, Compass, FileText, Heart, Hotel, MessageCircle,
  ShieldCheck, Sparkles, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DESTINATION_CATALOG, toCatalogPackage } from '../data/destinationCatalog';
import logoImg from '../assets/logo.png';

const initialQuoteForm = {
  destination: '',
  travelDate: '',
  passengers: '2',
  preference: 'Family Tours',
  name: '',
  phone: ''
};

const LandingPage = () => {
  const reduceMotion = useReducedMotion();
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState('');
  const [quoteForm, setQuoteForm] = useState(initialQuoteForm);
  const [quoteError, setQuoteError] = useState('');
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/packages', { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Package catalogue unavailable.');
        return data;
      })
      .then(data => setPackages(Array.isArray(data) ? data : []))
      .catch(error => {
        if (error.name !== 'AbortError') setPackagesError('Showing our routebook while the live catalogue reconnects.');
      })
      .finally(() => setPackagesLoading(false));
    return () => controller.abort();
  }, []);

  const featuredPackages = useMemo(() => {
    if (packages.length > 0) return packages.slice(0, 3).map(toCatalogPackage);
    return DESTINATION_CATALOG.slice(0, 3);
  }, [packages]);

  const handleQuoteChange = event => {
    const { name, value } = event.target;
    setQuoteForm(previous => ({ ...previous, [name]: value }));
    setQuoteError('');
    setQuoteSuccess(false);
  };

  const handleQuoteSubmit = async event => {
    event.preventDefault();
    setQuoteError('');
    setQuoteSuccess(false);

    if (!quoteForm.name.trim()) {
      setQuoteError('Add your name so the travel desk knows who to reply to.');
      nameRef.current?.focus();
      return;
    }
    if (!/^\+?[0-9 ()-]{8,20}$/.test(quoteForm.phone.trim())) {
      setQuoteError('Enter a valid mobile number, including country code if needed.');
      document.getElementById('quick-quote-phone')?.focus();
      return;
    }

    setQuoteLoading(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryType: 'Tour Package Enquiry',
          customerName: quoteForm.name.trim(),
          mobileNumber: quoteForm.phone.trim(),
          travelDate: quoteForm.travelDate || undefined,
          toLocation: quoteForm.destination || 'Not decided',
          numberOfPassengers: Math.max(1, Math.min(Number(quoteForm.passengers) || 2, 50)),
          preferredCategory: quoteForm.preference,
          remarks: 'Lead captured via SreePayanam home page quick planner.'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The travel desk could not receive this request.');
      setQuoteSuccess(true);
      setQuoteForm(initialQuoteForm);
    } catch (error) {
      setQuoteError(error.message || 'We could not send the request. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <main>
        <section className="landing-hero" aria-labelledby="home-heading">
          <div className="container hero-layout">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              <span className="eyebrow">Travel notes / South India</span>
              <h1 id="home-heading" className="hero-title">Go where the <em>story</em> starts.</h1>
              <p className="hero-copy">SreePayanam turns your next trip into a route worth remembering — thoughtful places, comfortable movement, and a travel desk that stays with you.</p>
              <div className="hero-actions">
                <Link className="btn btn-secondary" to="/ai-assistant">Build my route <ArrowRight size={17} aria-hidden="true" /></Link>
                <Link className="btn btn-outline" to="/packages">Browse packages</Link>
              </div>
            </motion.div>

            <motion.aside
              className="route-preview"
              aria-label="Sample SreePayanam route"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.1 }}
            >
              <span className="eyebrow">A route in progress</span>
              <h2>From first thought to the last sunset.</h2>
              <div className="route-line" aria-hidden="true" />
              {[
                ['Start', 'Chennai'],
                ['Pause', 'Madurai'],
                ['Return', 'Kanyakumari']
              ].map(([label, place]) => (
                <div className="route-stop" key={label}>
                  <span className="route-stop-dot" aria-hidden="true" />
                  <div><p>{label}</p><strong>{place}</strong></div>
                </div>
              ))}
              <div className="route-preview-note"><span>One desk. Every detail.</span><strong>2026</strong></div>
            </motion.aside>
          </div>
        </section>

        <section className="landing-section paper" aria-labelledby="routebook-heading">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>Pick a direction</span><h2 id="routebook-heading">The routebook is open.</h2></div>
              <p>Short escapes, spiritual circuits and longer loops — made specific to the people going.</p>
            </div>
            <div className="route-strip">
              {[
                ['01 / coast', 'Chennai to Pondicherry', '4 days · easy pace'],
                ['02 / shrine', 'Madurai to Rameswaram', '4 days · temple trail'],
                ['03 / highland', 'Ooty to Coonoor', '4 days · cool air']
              ].map(([code, title, meta]) => (
                <article key={code}>
                  <span className="route-code">{code}</span>
                  <h3>{title}</h3>
                  <footer><span>{meta}</span><ArrowRight size={16} aria-hidden="true" /></footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section surface" aria-labelledby="planning-heading">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>The SreePayanam way</span><h2 id="planning-heading">Planning should feel like moving forward.</h2></div>
              <p>No blank canvas, no mystery pricing. Choose what matters and leave the coordination to us.</p>
            </div>
            <div className="feature-grid">
              {[
                ['01', 'Choose your anchor', 'Start from a package, a city, or a temple you have been meaning to see.'],
                ['02', 'Shape the days', 'Select the places, pace, hotel comfort and transport that fit your group.'],
                ['03', 'Take the plan with you', 'Get a customer-facing estimate and a PDF quotation you can share.']
              ].map(([index, title, description]) => (
                <motion.article className="feature-card" key={index} whileHover={reduceMotion ? undefined : { y: -4 }}>
                  <span className="feature-index">{index}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section paper" aria-labelledby="featured-heading">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>From the routebook</span><h2 id="featured-heading">Routes people return to.</h2></div>
              <Link className="btn btn-outline" to="/packages">See every package <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            {packagesError && <p className="catalog-status" role="status">{packagesError}</p>}
            <div className="package-grid" aria-live="polite">
              {packagesLoading && featuredPackages.length === 0 ? (
                [1, 2, 3].map(index => <div className="package-card" key={index}><div className="package-art skeleton-pulse" style={{ minHeight: 170 }} /><div className="package-content"><div className="skeleton-line" /><div className="skeleton-line short" /></div></div>)
              ) : featuredPackages.map((pkg, index) => {
                const isRemote = Boolean(pkg.remote && pkg.packageId);
                const link = isRemote ? `/package/${pkg.packageId}` : '/ai-assistant';
                return (
                  <motion.article className="package-card" key={pkg.id} whileHover={reduceMotion ? undefined : { y: -4 }}>
                    <Link to={link} aria-label={`Plan ${pkg.name}`}>
                      <div className="package-art" data-tone={index === 1 ? 'coral' : index === 2 ? 'gold' : 'teal'}>
                        <small>{pkg.tourType || 'Curated route'}</small>
                        <h3>{pkg.name}</h3>
                      </div>
                      <div className="package-content">
                        <p>{pkg.description}</p>
                        <footer><strong>{pkg.durationDays}D / {pkg.durationNights}N</strong><span>Plan this route <ArrowRight size={14} aria-hidden="true" /></span></footer>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-section surface" aria-labelledby="services-heading">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow" style={{ color: 'var(--color-coral-dark)' }}>One travel desk</span><h2 id="services-heading">The details behind the memories.</h2></div>
              <p>From the first ticket to the return transfer, we coordinate the practical parts with a human eye.</p>
            </div>
            <div className="service-grid">
              {[
                [Compass, 'Custom routes', 'A route that follows your group, not a template.'],
                [Hotel, 'Stay & movement', 'Hotels, vehicles, local transfers and comfortable timing.'],
                [FileText, 'Documents & tickets', 'Flights, trains, visas and the paperwork in between.'],
                [ShieldCheck, 'Travel support', 'A dependable point of contact before and during the trip.'],
                [Users, 'Group journeys', 'Family, student, pilgrimage and corporate movement at any scale.'],
                [Heart, 'Small moments', 'Special arrangements that make the route feel like yours.']
              ].map(([Icon, title, description]) => (
                <article className="feature-card" key={title}>
                  <span className="feature-index"><Icon size={17} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-cta" aria-labelledby="cta-heading">
          <div className="container">
            <span className="eyebrow">Your turn</span>
            <h2 id="cta-heading">Bring the idea. We will draw the route.</h2>
            <p>Tell us the one place you want to see, and we will help you build the days around it.</p>
            <Link className="btn btn-secondary" to="/ai-assistant">Open the trip planner <Sparkles size={17} aria-hidden="true" /></Link>

            <form className="quick-quote" onSubmit={handleQuoteSubmit} noValidate>
              <h3>Need a quick callback?</h3>
              <div className="quick-quote-grid">
                <div>
                  <label className="field-label" htmlFor="quick-quote-name">Your name <span className="required">*</span></label>
                  <input ref={nameRef} id="quick-quote-name" name="name" className="planner-field" autoComplete="name" value={quoteForm.name} onChange={handleQuoteChange} />
                </div>
                <div>
                  <label className="field-label" htmlFor="quick-quote-phone">Mobile number <span className="required">*</span></label>
                  <input id="quick-quote-phone" name="phone" className="planner-field" inputMode="tel" autoComplete="tel" value={quoteForm.phone} onChange={handleQuoteChange} />
                </div>
                <div>
                  <label className="field-label" htmlFor="quick-quote-destination">Where are you thinking?</label>
                  <input id="quick-quote-destination" name="destination" className="planner-field" placeholder="e.g. Rameswaram, Ooty" value={quoteForm.destination} onChange={handleQuoteChange} />
                </div>
                <div>
                  <label className="field-label" htmlFor="quick-quote-date">Preferred date</label>
                  <input id="quick-quote-date" name="travelDate" className="planner-field" type="date" value={quoteForm.travelDate} onChange={handleQuoteChange} />
                </div>
                <div className="span-2">
                  <label className="field-label" htmlFor="quick-quote-preference">Travel style</label>
                  <select id="quick-quote-preference" name="preference" className="planner-select" value={quoteForm.preference} onChange={handleQuoteChange}>
                    <option>Family Tours</option>
                    <option>Pilgrimage Tours</option>
                    <option>Honeymoon Tours</option>
                    <option>Group Tours</option>
                    <option>Corporate Tours</option>
                  </select>
                </div>
              </div>
              {quoteError && <div className="form-feedback error" role="alert" style={{ marginTop: '0.9rem' }}><span aria-hidden="true">!</span>{quoteError}</div>}
              {quoteSuccess && <div className="form-feedback success" role="status" style={{ marginTop: '0.9rem' }}><Check size={17} aria-hidden="true" />Thanks — the SreePayanam travel desk will call you shortly.</div>}
              <button className="btn btn-primary" type="submit" disabled={quoteLoading} aria-busy={quoteLoading} style={{ width: '100%', marginTop: '0.9rem' }}>
                {quoteLoading ? 'Sending request...' : 'Request a callback'} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </main>

      <a className="float-contact" href="https://wa.me/919443217654" target="_blank" rel="noreferrer" aria-label="Chat with SreePayanam on WhatsApp">
        <MessageCircle size={23} aria-hidden="true" />
      </a>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logoImg} alt="SreePayanam Tours and Travels" width="165" height="50" />
            <p>Plan smart. Travel better. Create memories.</p>
          </div>
          <div>
            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/packages">Packages</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/ai-assistant">Planner</Link>
            </div>
            <p className="footer-note" style={{ marginTop: '1.1rem', textAlign: 'right' }}>© {new Date().getFullYear()} SreePayanam Tours &amp; Travels</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
