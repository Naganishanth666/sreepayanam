import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, Compass, MapPin, Search } from 'lucide-react';
import { BUDGET_DISCLAIMER } from '../utils/indicativeBudget';
import { dayDirectionsUrl } from '../utils/mapDirections';

const formatRupees = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const SavedRoute = () => {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [lookup, setLookup] = useState(reference || '');
  const [route, setRoute] = useState(null);
  const [state, setState] = useState(reference ? 'loading' : 'idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) {
      const timer = window.setTimeout(() => { setRoute(null); setState('idle'); }, 0);
      return () => window.clearTimeout(timer);
    }
    const controller = new AbortController();
    fetch(`/api/enquiries/route/${encodeURIComponent(reference)}`, { signal: controller.signal }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not find this itinerary.');
      return data;
    }).then(data => { setRoute(data); setLookup(data.planReference); setError(''); setState('ready'); })
      .catch(fetchError => { if (fetchError.name !== 'AbortError') { setError(fetchError.message); setState('error'); } });
    return () => controller.abort();
  }, [reference]);

  const submitLookup = event => {
    event.preventDefault();
    const value = lookup.trim().toUpperCase();
    if (!/^SP-DRAFT-\d{8}-[A-F0-9]{32}$/.test(value)) { setError('Enter the complete reference shown with your route.'); return; }
    setState('loading'); setError(''); navigate(`/route/${value}`);
  };

  return <main className="saved-route container">
    <div className="saved-route-header"><span className="eyebrow">Your routebook</span><h1>Find your itinerary.</h1><p>Enter the reference number shown after your enquiry. Keep it private, as anyone with the full reference can view this route draft.</p>
      <form className="saved-route-search" noValidate onSubmit={submitLookup}><label htmlFor="route-reference">Reference number</label><div><input id="route-reference" className="input-field" value={lookup} onChange={event => setLookup(event.target.value)} placeholder="SP-DRAFT-YYYYMMDD-..." autoCapitalize="characters" /><button type="submit" className="btn btn-primary"><Search size={16} aria-hidden="true" /> Find route</button></div></form>
    </div>
    {state === 'loading' && <p role="status">Loading your route…</p>}
    {error && <p className="form-status is-error" role="alert">{error}</p>}
    {route && state === 'ready' && <div className="saved-route-result">
      <div className="saved-route-title"><Compass size={25} aria-hidden="true" /><div><h2>{route.title}</h2><p>Reference <strong>{route.planReference}</strong> · {route.durationDays} days / {route.durationNights} nights</p></div></div>
      <p>{route.overview}</p>
      {route.planningReview?.summary && <div className="saved-route-review" role="status"><strong>Route review</strong><p>{route.planningReview.summary}</p>{route.planningReview.unplacedPlaces?.length > 0 && <p>Still to arrange: {route.planningReview.unplacedPlaces.join(', ')}. {route.planningReview.customerDecision === 'remove' ? 'You approved leaving these out of this draft.' : 'These remain on your wish list for the travel desk.'}</p>}</div>}
      {route.indicativeBudget?.estimatedGroupBudget && <section className="saved-route-budget" aria-label="Indicative budget"><h3>Indicative core group budget</h3><strong>{formatRupees(route.indicativeBudget.estimatedGroupBudget)}</strong><p>{route.indicativeBudget.assumptions}</p><p>{BUDGET_DISCLAIMER}</p><details><summary>Rate sources</summary><ul>{(route.indicativeBudget.hotelSources || []).map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name} room listing</a></li>)}<li><a href={route.indicativeBudget.vehicleSource} target="_blank" rel="noopener noreferrer">Vehicle tariff benchmark</a></li><li><a href={route.indicativeBudget.mealSource} target="_blank" rel="noopener noreferrer">Food allowance reference</a></li></ul></details></section>}
      <section aria-labelledby="saved-days-heading"><h3 id="saved-days-heading"><CalendarDays size={20} aria-hidden="true" /> Day-by-day itinerary</h3>
        <ol className="saved-route-days">{(route.itinerary || []).map((day, index) => <li key={day.day}>
          <div className="saved-route-day-heading"><span>Day {day.day}</span><h4>{day.title}</h4>{day.date && <small>{day.date}</small>}</div>
          <p>{day.places?.length ? day.places.join(' · ') : 'Rest and flexible local time'}</p>
          {day.schedule?.length > 0 && <ol className="route-draft-timeline">{day.schedule.map((item, itemIndex) => <li key={`${item.start}-${itemIndex}`}><time>{item.start}–{item.end}</time><span><b>{item.label}</b>{item.detail && <small>{item.detail}</small>}</span></li>)}</ol>}
          {day.activities && <p>{day.activities}</p>}{day.entryWindow && <p><strong>Entry status:</strong> {day.entryWindow}</p>}
          {dayDirectionsUrl(route, day, index, route.itinerary.length) && <a href={dayDirectionsUrl(route, day, index, route.itinerary.length)} target="_blank" rel="noopener noreferrer">Open road order in Google Maps <ArrowRight size={14} aria-hidden="true" /></a>}
        </li>)}</ol>
      </section>
      {route.destinations?.length > 0 && <section aria-labelledby="saved-places-heading"><h3 id="saved-places-heading"><MapPin size={20} aria-hidden="true" /> Places on your route</h3><div className="saved-route-places">{route.destinations.map(place => <article key={place.name}>
        {place.imageUrl && <img src={place.imageUrl} alt={place.title || place.name} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}
        <div><h4>{place.name}</h4><p>{place.description}</p><p>{place.visitingInfo}</p>{place.visitingEvent && <p>Published event: {place.visitingEvent.description} ({place.visitingEvent.date}). <a href={place.visitingEvent.sourceUrl} target="_blank" rel="noopener noreferrer">Event source</a></p>}{place.sourceUrl && <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">Destination information</a>}{place.visitingHoursSourceUrl && <a href={place.visitingHoursSourceUrl} target="_blank" rel="noopener noreferrer">Visiting hours source</a>}{place.imageCreditUrl && <a href={place.imageCreditUrl} target="_blank" rel="noopener noreferrer">Image: {place.imageCredit}</a>}</div>
      </article>)}</div></section>}
      <Link className="btn btn-outline" to="/ai-assistant">Plan another route <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>}
  </main>;
};

export default SavedRoute;
