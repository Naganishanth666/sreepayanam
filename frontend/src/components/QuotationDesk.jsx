import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileCheck2, FilePenLine } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../context/useAuth';
import TravelDocumentPackDesk from './TravelDocumentPackDesk';
import { downloadApprovedQuotationPdf } from '../utils/quotationPdf';
import './QuotationDesk.css';

const TIER_NAMES = ['Economic', 'Deluxe', 'Premium'];
const SOURCE_TYPES = ['Official', 'Tourism board', 'Government', 'Maps', 'Third party'];

const blankForm = enquiry => ({
  customer: { rooms: enquiry.hotelRooms || '' },
  route: { endingCity: enquiry.detailedPreferences?.routeDraft?.endingCity || '', itinerary: (enquiry.detailedPreferences?.routeDraft?.itinerary || []).map(day => ({
    ...day,
    entryWindow: day.entryWindow || 'Entry and darshan timing to be confirmed from an official source.',
    hotel: { ...day.hotel }
  })) },
  destinationReferences: (enquiry.selectedDestinations || []).map(name => ({ name, url: '', sourceType: '', lastChecked: '' })),
  tiers: TIER_NAMES.map(name => ({ name, directCost: '', sourceReference: '', sourceCheckedAt: '', accommodation: '', transport: '', meals: '', activities: '' })),
  terms: {
    validUntil: '', taxNote: '', paymentSchedule: '', cancellationTerms: '', assumptions: '',
    specialNotes: enquiry.remarks || '',
    inclusions: (enquiry.detailedPreferences?.routeDraft?.inclusions || []).join('\n'),
    exclusions: (enquiry.detailedPreferences?.routeDraft?.exclusions || []).join('\n'),
    routeReviewNote: ''
  }
});

const formFromQuote = quote => ({
  customer: { rooms: quote.customer?.rooms || '' },
  route: { endingCity: quote.route?.endingCity || '', itinerary: (quote.route?.itinerary || []).map(day => ({
    ...day,
    entryWindow: day.entryWindow || 'Entry and darshan timing to be confirmed from an official source.',
    hotel: { ...day.hotel }
  })) },
  destinationReferences: (quote.destinationReferences || []).map(item => ({ ...item })),
  tiers: TIER_NAMES.map(name => {
    const tier = quote.tiers?.find(item => item.name === name) || {};
    return { name, directCost: tier.directCost || '', sourceReference: tier.sourceReference || '', sourceCheckedAt: tier.sourceCheckedAt || '', accommodation: tier.accommodation || '', transport: tier.transport || '', meals: tier.meals || '', activities: tier.activities || '' };
  }),
  terms: {
    validUntil: quote.terms?.validUntil || '',
    taxNote: quote.terms?.taxNote || '',
    paymentSchedule: quote.terms?.paymentSchedule || '',
    cancellationTerms: quote.terms?.cancellationTerms || '',
    assumptions: quote.terms?.assumptions || '',
    specialNotes: quote.terms?.specialNotes || '',
    inclusions: (quote.terms?.inclusions || []).join('\n'),
    exclusions: (quote.terms?.exclusions || []).join('\n'),
    routeReviewNote: quote.terms?.routeReviewNote || ''
  }
});

const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const today = () => new Date().toISOString().slice(0, 10);

const QuotationDesk = ({ enquiry, adminPassword }) => {
  const { token, user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [problems, setProblems] = useState([]);
  const [notice, setNotice] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(() => blankForm(enquiry));
  const [dirty, setDirty] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [verifiedSources, setVerifiedSources] = useState(false);
  const [confirmApproval, setConfirmApproval] = useState(false);
  const hasRoute = Boolean(enquiry.detailedPreferences?.routeDraft?.itinerary?.length);

  useEffect(() => {
    if (!open || !hasRoute) return undefined;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/quotations/enquiry/${enquiry._id}`, {
          headers: { 'x-admin-password': adminPassword }, signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load quotations.');
        const items = data.quotes || [];
        setQuotes(items);
        const active = items.find(item => item.status === 'Draft') || null;
        setDraft(active);
        setForm(active ? formFromQuote(active) : blankForm(enquiry));
        setDirty(false);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message || 'Could not load quotations.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [open, hasRoute, enquiry, adminPassword]);

  const changeReference = (index, field, value) => {
    setForm(current => ({ ...current, destinationReferences: current.destinationReferences.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
    setDirty(true);
  };
  const changeTier = (index, field, value) => {
    setForm(current => ({ ...current, tiers: current.tiers.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
    setDirty(true);
  };
  const changeTerm = (field, value) => {
    setForm(current => ({ ...current, terms: { ...current.terms, [field]: value } }));
    setDirty(true);
  };
  const changeTripDetail = (scope, field, value) => {
    setForm(current => ({ ...current, [scope]: { ...current[scope], [field]: value } }));
    setDirty(true);
  };
  const changeDay = (index, field, value) => {
    setForm(current => ({
      ...current,
      route: {
        itinerary: current.route.itinerary.map((day, itemIndex) => {
          if (itemIndex !== index) return day;
          if (field === 'places') return { ...day, places: value.split('\n').map(place => place.trim()).filter(Boolean) };
          if (field.startsWith('hotel.')) return { ...day, hotel: { ...day.hotel, [field.slice(6)]: value } };
          return { ...day, [field]: value };
        })
      }
    }));
    setDirty(true);
  };

  const save = async () => {
    setBusy('save'); setError(''); setProblems([]); setNotice('');
    try {
      const response = await fetch(`/api/quotations/enquiry/${enquiry._id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save the draft.');
      setDraft(data.quote);
      setQuotes(current => [data.quote, ...current.filter(item => item._id !== data.quote._id)]);
      setDirty(false);
      setNotice(`Draft ${data.quote.reference} saved. Review every source and term before approval.`);
    } catch (saveError) {
      setError(saveError.message || 'Could not save the draft.');
    } finally { setBusy(''); }
  };

  const approve = async () => {
    if (!draft || dirty) return;
    setBusy('approve'); setError(''); setProblems([]); setNotice('');
    try {
      const response = await fetch(`/api/quotations/${draft._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: approvalNote, verifiedSources })
      });
      const data = await response.json();
      if (!response.ok) {
        setProblems(data.problems || []);
        throw new Error(data.message || 'Could not approve the quotation.');
      }
      setQuotes(current => [data.quote, ...current.filter(item => item._id !== data.quote._id)]);
      setDraft(null);
      setForm(blankForm(enquiry));
      setApprovalNote(''); setVerifiedSources(false);
      setNotice(`Quotation ${data.quote.reference} approved and locked. Its quotation PDF is ready below. Complete the document pack to unlock the combined PDF.`);
    } catch (approvalError) {
      setError(approvalError.message || 'Could not approve the quotation.');
    } finally { setBusy(''); setConfirmApproval(false); }
  };

  const downloadQuotation = async quote => {
    setBusy(`download-${quote._id}`); setError(''); setProblems([]); setNotice('');
    try {
      const headers = isAdmin && token
        ? { Authorization: `Bearer ${token}` }
        : { 'x-admin-password': adminPassword };
      const response = await fetch(`/api/quotations/${quote._id}/download-data`, { headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not prepare the approved quotation.');
      await downloadApprovedQuotationPdf(data.quote);
      setNotice(`Approved quotation ${data.quote.reference} downloaded.`);
    } catch (downloadError) {
      setError(downloadError.message || 'Could not download the quotation PDF.');
    } finally { setBusy(''); }
  };

  return (
    <div className="quotation-desk">
      <button type="button" className="btn btn-outline quotation-desk-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <FilePenLine size={16} aria-hidden="true" /> {open ? 'Close quotation desk' : 'Prepare quotation'}
      </button>
      {open && <div className="quotation-desk-panel">
        <div className="quotation-desk-intro">
          <div><span className="eyebrow">Staff review</span><h4>Quotation from route brief</h4></div>
          <p>Costs and source evidence stay internal. Download the approved quotation here, then complete all twelve standard travel documents for the combined PDF.</p>
        </div>
        {!hasRoute ? <p role="status" className="quotation-desk-note">This enquiry predates saved route drafts. Ask the customer to submit the route again before creating a quotation.</p> : <>
          {loading && <p role="status" className="quotation-desk-note">Loading quotation versions…</p>}
          {error && <div role="alert" className="quotation-desk-error"><strong>{error}</strong>{problems.length > 0 && <ul>{problems.map(problem => <li key={problem}>{problem}</li>)}</ul>}</div>}
          {notice && <p role="status" className="quotation-desk-success">{notice}</p>}
          {quotes.filter(item => item.status === 'Approved').map(item => <div className="quotation-desk-approved" key={item._id}>
            <div><FileCheck2 size={18} aria-hidden="true" /><span><strong>{item.reference}</strong> · Version {item.version} · Approved {new Date(item.approval?.at).toLocaleDateString('en-IN')}</span></div>
            <button type="button" className="btn btn-primary quotation-desk-download" onClick={() => downloadQuotation(item)} disabled={Boolean(busy)} aria-busy={busy === `download-${item._id}`}>
              <Download size={16} aria-hidden="true" /> {busy === `download-${item._id}` ? 'Preparing quotation PDF…' : 'Download approved quotation PDF'}
            </button>
            {isAdmin && <TravelDocumentPackDesk quoteId={item._id} token={token} />}
            {!isAdmin && <p className="quotation-desk-note">The combined final document pack requires a named Admin account. <Link to="/login">Sign in as Admin</Link> to complete and download it.</p>}
          </div>)}
          {!loading && <div className="quotation-desk-form">
            <div className="quotation-desk-section-head"><h5>{draft ? `Draft ${draft.reference} · Version ${draft.version}` : 'New quotation draft'}</h5><span>10% contingency, then 25% markup</span></div>
            <p className="quotation-desk-note">The route and customer details are copied from the enquiry. Check the day plan, supplier evidence, destination links and legal terms before approval.</p>

            <div className="quotation-desk-fields">
              <label>Trip return point <input value={form.route.endingCity || ''} onChange={event => changeTripDetail('route', 'endingCity', event.target.value)} /></label>
              <label>Rooms for overnight stays <input type="number" min="0" max="30" value={form.customer.rooms} onChange={event => changeTripDetail('customer', 'rooms', event.target.value)} /></label>
            </div>

            <h6>Destination detail references</h6>
            <div className="quotation-desk-reference-list">{form.destinationReferences.map((item, index) => <div className="quotation-desk-reference" key={`${item.name}-${index}`}>
              <strong>{item.name}</strong>
              <label>Detail URL <input type="url" inputMode="url" placeholder="https://…" value={item.url} onChange={event => changeReference(index, 'url', event.target.value)} /></label>
              <label>Source type <select value={item.sourceType} onChange={event => changeReference(index, 'sourceType', event.target.value)}><option value="">Choose source</option>{SOURCE_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
              <label>Last checked <input type="date" max={today()} value={item.lastChecked} onChange={event => changeReference(index, 'lastChecked', event.target.value)} /></label>
            </div>)}</div>

            <h6>Review and edit the day plan</h6>
            <p className="quotation-desk-note">Keep the customer's selected stops where practical. Any unplaced place stays flagged for review.</p>
            <div className="quotation-desk-day-list">{form.route.itinerary.map((day, index) => <details className="quotation-desk-day" key={`${day.day}-${index}`}>
              <summary><span>Day {day.day}: {day.title || 'Untitled day'}</span><small>{day.places?.length || 0} stops</small></summary>
              <div className="quotation-desk-fields">
                <label>Day title <input value={day.title || ''} onChange={event => changeDay(index, 'title', event.target.value)} /></label>
                <label>Area <input value={day.base || ''} onChange={event => changeDay(index, 'base', event.target.value)} /></label>
                <label className="quotation-desk-wide">Stops · one per line <textarea rows="3" value={(day.places || []).join('\n')} onChange={event => changeDay(index, 'places', event.target.value)} /></label>
                <label className="quotation-desk-wide">Plan <textarea rows="4" value={day.activities || ''} onChange={event => changeDay(index, 'activities', event.target.value)} /></label>
                <label className="quotation-desk-wide">Travel and timing <textarea rows="2" value={day.transit || ''} onChange={event => changeDay(index, 'transit', event.target.value)} /></label>
                <label className="quotation-desk-wide">Darshan / entry window and source status <textarea rows="2" value={day.entryWindow || ''} onChange={event => changeDay(index, 'entryWindow', event.target.value)} placeholder="Requested morning darshan; official hours and availability need confirmation" /></label>
                <label className="quotation-desk-wide">Meals and rest <textarea rows="2" value={day.meal || ''} onChange={event => changeDay(index, 'meal', event.target.value)} /></label>
                <label>Stay name/category <input value={day.hotel?.name || ''} onChange={event => changeDay(index, 'hotel.name', event.target.value)} /></label>
                <label>Stay rating <input value={day.hotel?.rating || ''} onChange={event => changeDay(index, 'hotel.rating', event.target.value)} /></label>
                <label className="quotation-desk-wide">Stay note <input value={day.hotel?.desc || ''} onChange={event => changeDay(index, 'hotel.desc', event.target.value)} /></label>
              </div>
            </details>)}</div>

            <h6>Three tier cost and scope</h6>
            <div className="quotation-desk-tier-list">{form.tiers.map((tier, index) => <section className="quotation-desk-tier" key={tier.name} aria-label={`${tier.name} tier`}>
              <div className="quotation-desk-tier-title"><strong>{tier.name}</strong><span>{Number(tier.directCost) > 0 ? `Indicative sell price ${money(Math.round(Math.round(Number(tier.directCost) * 1.1) * 1.25))} + GST as applicable` : 'Enter verified direct cost'}</span></div>
              <div className="quotation-desk-fields">
                <label>Direct supplier cost (internal) <input type="number" min="0" step="1" value={tier.directCost} onChange={event => changeTier(index, 'directCost', event.target.value)} /></label>
                <label>Supplier quote or contracted rate reference <input value={tier.sourceReference} onChange={event => changeTier(index, 'sourceReference', event.target.value)} placeholder="Supplier quote ID or contract reference" /></label>
                <label>Source checked <input type="date" max={today()} value={tier.sourceCheckedAt} onChange={event => changeTier(index, 'sourceCheckedAt', event.target.value)} /></label>
                <label>Stay property/category and room type <input value={tier.accommodation} onChange={event => changeTier(index, 'accommodation', event.target.value)} placeholder="e.g. 3 Star equivalent, double room" /></label>
                <label>Transport class <input value={tier.transport} onChange={event => changeTier(index, 'transport', event.target.value)} /></label>
                <label>Meal plan <input value={tier.meals} onChange={event => changeTier(index, 'meals', event.target.value)} /></label>
                <label className="quotation-desk-wide">Activity differences <input value={tier.activities} onChange={event => changeTier(index, 'activities', event.target.value)} /></label>
              </div>
            </section>)}</div>

            <h6>Approved wording and travel scope</h6>
            <div className="quotation-desk-fields">
              <label>Price valid until <input type="date" min={today()} value={form.terms.validUntil} onChange={event => changeTerm('validUntil', event.target.value)} /></label>
              <label>Accountant-approved GST wording <input value={form.terms.taxNote} onChange={event => changeTerm('taxNote', event.target.value)} placeholder="Price + GST as applicable" /></label>
              <label className="quotation-desk-wide">Payment schedule <textarea rows="2" value={form.terms.paymentSchedule} onChange={event => changeTerm('paymentSchedule', event.target.value)} /></label>
              <label className="quotation-desk-wide">Cancellation terms <textarea rows="3" value={form.terms.cancellationTerms} onChange={event => changeTerm('cancellationTerms', event.target.value)} /></label>
              <label className="quotation-desk-wide">Assumptions and availability <textarea rows="3" value={form.terms.assumptions} onChange={event => changeTerm('assumptions', event.target.value)} /></label>
              <label className="quotation-desk-wide">Special notes for customer <textarea rows="2" value={form.terms.specialNotes} onChange={event => changeTerm('specialNotes', event.target.value)} placeholder="Accessibility, dietary, medical, festival or timing notes" /></label>
              <label className="quotation-desk-wide">Inclusions · one per line <textarea rows="4" value={form.terms.inclusions} onChange={event => changeTerm('inclusions', event.target.value)} /></label>
              <label className="quotation-desk-wide">Exclusions · one per line <textarea rows="4" value={form.terms.exclusions} onChange={event => changeTerm('exclusions', event.target.value)} /></label>
              <label className="quotation-desk-wide">Route and timing review (required)<textarea rows="2" value={form.terms.routeReviewNote} onChange={event => changeTerm('routeReviewNote', event.target.value)} /></label>
            </div>
            <div className="quotation-desk-actions"><button type="button" className="btn btn-primary" onClick={save} disabled={Boolean(busy)} aria-busy={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>{dirty && <span>Save changes before approval.</span>}</div>

            {draft && <div className="quotation-desk-approval">
              <h6>Approval</h6>
              <p>This locks the version. Confirm supplier rates, route timing, tax wording and terms before approving.</p>
              <p>{isAdmin ? `Approving as ${user?.fullName || 'Admin'}.` : 'Sign in with a named Admin account to approve this quotation.'}</p>
              <div className="quotation-desk-fields"><label className="quotation-desk-wide">Review note <textarea rows="2" value={approvalNote} onChange={event => setApprovalNote(event.target.value)} /></label></div>
              <label className="quotation-desk-checkbox"><input type="checkbox" checked={verifiedSources} onChange={event => setVerifiedSources(event.target.checked)} /> I verified the supplier evidence and destination references for this version.</label>
              <button type="button" className="btn btn-outline" onClick={() => setConfirmApproval(true)} disabled={Boolean(busy) || dirty || !isAdmin || !approvalNote.trim() || !verifiedSources}>Review and approve quotation</button>
            </div>}
          </div>}
        </>}
      </div>}
      <ConfirmDialog open={confirmApproval} title="Approve this quotation?" message="This version will be locked and its customer-facing PDF will become available to the travel desk." confirmLabel="Approve quotation" cancelLabel="Keep editing" onConfirm={approve} onCancel={() => setConfirmApproval(false)} busy={busy === 'approve'} />
    </div>
  );
};

export default QuotationDesk;
