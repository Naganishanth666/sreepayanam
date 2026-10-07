import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, FileText } from 'lucide-react';

const ARTICLES = [
  {
    id: 'temple-day',
    title: 'Planning a temple day with room to breathe',
    summary: 'A practical way to leave space for darshan, meals and the road between stops.',
    paragraphs: [
      'Start with the places that matter most to your group. Put them on the route before adding nearby attractions. Opening hours, special darshan arrangements and festival schedules can change, so check each temple’s official information before fixing a day plan.',
      'Allow time between visits for road travel, queues, a meal and a rest. An unhurried route is usually more useful than a long list of stops that cannot fit around entry windows.',
      'Share arrival and departure times with the travel desk. A late arrival or early departure can turn a nominal sightseeing day into a transfer day.'
    ]
  },
  {
    id: 'route-review',
    title: 'What to check before confirming a pilgrimage route',
    summary: 'A short checklist for comparing an itinerary with real travel conditions.',
    paragraphs: [
      'Look at each day in sequence: where you wake up, how long the drive is expected to take, the intended visit window, and where you stay that night. Ask for a revised plan when a day depends on a tight connection.',
      'Keep your chosen destinations visible during review. If one cannot fit, ask for a longer trip, a different order or an explicit replacement before agreeing to remove it.',
      'Treat early budgets as indicative. Hotel availability, supplier rates, entry arrangements and applicable costs are confirmed only when the travel desk prepares a final quotation.'
    ]
  }
];

export const Blogs = () => <main className="content-hub container">
  <div className="content-hub-intro"><span className="eyebrow">SreePayanam journal</span><h1>Travel notes for the road ahead.</h1><p>Useful guidance for shaping a comfortable journey and reviewing the details that matter.</p></div>
  <div className="content-hub-grid">{ARTICLES.map(article => <article className="content-hub-card" key={article.id} id={article.id}>
    <BookOpen size={24} aria-hidden="true" /><h2>{article.title}</h2><p className="content-hub-summary">{article.summary}</p>
    {article.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
  </article>)}</div>
  <Link className="btn btn-primary" to="/ai-assistant">Build my route <ArrowRight size={16} aria-hidden="true" /></Link>
</main>;

export const Brochures = () => {
  const [brochures, setBrochures] = useState([]);
  const [state, setState] = useState('loading');
  useEffect(() => {
    fetch('/api/packages/brochures').then(response => {
      if (!response.ok) throw new Error('Could not load brochures.');
      return response.json();
    }).then(data => { setBrochures(Array.isArray(data) ? data : []); setState('ready'); })
      .catch(() => setState('error'));
  }, []);
  return <main className="content-hub container">
    <div className="content-hub-intro"><span className="eyebrow">Marketing brochures</span><h1>Browse the journey collection.</h1><p>Open a published brochure to view it in your browser or save a copy for later.</p></div>
    {state === 'loading' && <p role="status">Loading brochures…</p>}
    {state === 'error' && <p role="alert">Brochures are unavailable right now. Please try again later.</p>}
    {state === 'ready' && !brochures.length && <div className="content-hub-empty"><FileText size={28} aria-hidden="true" /><h2>Brochures are being prepared</h2><p>Explore the published packages while our team prepares downloadable brochures.</p><Link to="/packages" className="btn btn-primary">Explore packages</Link></div>}
    {brochures.length > 0 && <div className="content-hub-grid">{brochures.map(item => <article className="content-hub-card" key={item.packageId}>
      <FileText size={24} aria-hidden="true" /><h2>{item.title}</h2><p>{item.destination} · {item.durationDays} days</p>
      <div className="content-hub-actions"><a className="btn btn-primary" href={item.url} target="_blank" rel="noopener noreferrer">View brochure <ArrowRight size={15} aria-hidden="true" /></a><a className="btn btn-outline" href={item.url} download target="_blank" rel="noopener noreferrer">Download <Download size={15} aria-hidden="true" /></a></div>
    </article>)}</div>}
  </main>;
};
