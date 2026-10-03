import './HotelSuggestions.css';

const safeSource = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
};

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;

const HotelSuggestions = ({ hotels = [], selectedName = '', title = 'Hotel ideas for your route', actions, compact = false }) => {
  if (!hotels.length) return null;
  return <section className={`hotel-suggestions${compact ? ' hotel-suggestions-compact' : ''}`} aria-label={title}>
    <div className="hotel-suggestions-heading"><div><span className="hotel-suggestions-kicker">Stay shortlist</span><h3>{title}</h3></div><span className="hotel-suggestions-count">{hotels.length} researched options</span></div>
    <p className="hotel-suggestions-disclosure">Public room/night estimates are indicative only. Travel dates, room type, taxes, occupancy, availability and the final price need staff confirmation.</p>
    <div className="hotel-suggestions-grid">{hotels.map((hotel, index) => {
      const source = safeSource(hotel.sourceUrl);
      const selected = selectedName.trim().toLowerCase() === hotel.name?.trim().toLowerCase();
      return <article className={`hotel-suggestion${selected ? ' is-selected' : ''}`} key={`${hotel.name}-${index}`}>
        <div className="hotel-suggestion-top"><div><span className="hotel-suggestion-index">0{index + 1} / {hotel.category || 'Hotel'}</span><h4>{hotel.name}</h4><p>{hotel.area || 'Area to confirm'}</p></div>{selected && <span className="hotel-suggestion-selected">Requested</span>}</div>
        {hotel.fitReason && <p className="hotel-suggestion-fit">{hotel.fitReason}</p>}
        <div className="hotel-suggestion-rate"><strong>{Number(hotel.nightlyEstimate) > 0 ? money(hotel.nightlyEstimate) : 'Rate unavailable'}</strong><span>{Number(hotel.nightlyEstimate) > 0 ? 'indicative / room / night' : 'staff will check a rate'}</span></div>
        <div className="hotel-suggestion-foot">{source && <a href={source} target="_blank" rel="noopener noreferrer">View public source ↗</a>}{hotel.checkedAt && <small>Checked {new Date(hotel.checkedAt).toLocaleDateString('en-IN')}</small>}</div>
        {actions?.(hotel)}
      </article>;
    })}</div>
  </section>;
};

export default HotelSuggestions;
