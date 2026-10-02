import { useEffect, useMemo, useState } from 'react';
import { Download, FileCheck2, FilePenLine } from 'lucide-react';
import template from '../../../shared/standardTravelPack.json';
import { downloadStandardTravelPackPdf } from '../utils/standardQuotationPdf';
import ConfirmDialog from './ConfirmDialog';
import './TravelDocumentPackDesk.css';

const sectionTitles = template.blocks.filter(block => block.type === 'paragraph' && block.style === 'Heading 1' && block.section <= 12)
  .map(block => ({ number: block.section, title: block.text }));
const sourceText = (block, row, column) => block.rows?.[row]?.[column] || '';
const unresolved = value => !String(value || '').trim() || /\[[^\]]*\]|_{3,}|\bto be confirmed\b|\btbc\b/i.test(String(value))
  || (String(value).includes('☐') && !String(value).includes('☒') && !/^n\/?a$/i.test(String(value).trim()));
const dateForDay = (start, offset) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '')) return '';
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const suggestedFields = quote => {
  const route = quote.route || {};
  const customer = quote.customer || {};
  const days = route.itinerary || [];
  const refs = new Map((quote.destinationReferences || []).map(item => [item.name?.toLowerCase(), item.url]));
  const party = `${customer.adults || 0} adults; ${customer.children || 0} children${customer.childAges?.length ? ` (${customer.childAges.join(', ')} years)` : ''}; ${customer.rooms || 'unspecified'} rooms`;
  const trip = `${route.packageName || route.title || route.destination || 'Custom route'}; ${route.startingCity || 'Origin pending'} → ${route.destination || 'Destination pending'} → ${route.endingCity || 'Return pending'}; ${route.travelStartDate || 'date pending'} to ${route.returnDate || 'date pending'}`;
  const lead = `${customer.name || 'Traveller'} | Mobile: ${customer.mobile || 'pending'} | Email: ${customer.email || 'pending'}`;
  const fields = {
    '38:1:0': quote.enquiryReference || '', '38:1:1': quote.reference || '',
    '40:2:1': `${trip}; ${party}`, '56:7:1': `${quote.enquiryReference} | ${quote.reference} | Booking reference: pending`,
    '69:1:2': quote.enquiryReference || '',
    '79:1:1': quote.enquiryReference || '', '79:1:2': quote.reference || '',
    '81:1:1': lead, '81:2:1': trip, '81:3:1': party,
    '95:1:1': `${route.startingCity || ''} → ${route.destination || ''} → ${route.endingCity || ''}`,
    '95:1:2': `${route.travelStartDate || ''} to ${route.returnDate || ''}`,
    '95:1:3': party,
    '106:1:0': quote.enquiryReference || '',
    '108:1:1': lead, '108:3:1': trip, '108:4:1': party,
    '108:5:1': `${customer.mealPreference || 'Meal preference pending'}; tier ${customer.preferredTier || 'pending'}; accessibility ${customer.accessibilityNeeds || 'none reported'}`,
    '121:3:1': `${customer.name || 'Traveller'}; ${customer.passengers || (customer.adults || 0) + (customer.children || 0)} travellers`
  };
  for (let index = 0; index < Math.max(3, days.length); index += 1) {
    const day = days[index];
    if (!day) continue;
    const row = index + 1;
    fields[`97:${row}:0`] = `Day ${row} / ${dateForDay(route.travelStartDate, index)} / ${day.base || day.title || 'Area'}`;
    fields[`97:${row}:1`] = (day.places || []).map(name => `${name}${refs.get(name.toLowerCase()) ? ` — ${refs.get(name.toLowerCase())}` : ''}`).join('\n');
    fields[`97:${row}:2`] = `Travel: ${day.transit || 'pending'}; visit: ${day.activities || 'pending'}; entry: ${day.entryWindow || 'pending'}`;
    fields[`97:${row}:3`] = day.meal || '';
    fields[`97:${row}:4`] = [day.hotel?.name, day.hotel?.desc].filter(Boolean).join(' — ');
  }
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value && !unresolved(value) && !/\bpending\b/i.test(value)));
};

const getRows = (block, quote) => {
  if (block.id !== 97) return block.rows;
  const count = Math.max(3, quote.route?.itinerary?.length || 0);
  return [block.rows[0], ...Array.from({ length: count }, (_, index) => [
    `Day ${index + 1} / [date]`, '[Stop + official detail link]', '[Travel time / visit window; status]',
    '[Meal and restaurant details]', '[Hotel / category]'
  ])];
};

const TravelDocumentPackDesk = ({ quoteId, token }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [problems, setProblems] = useState([]);
  const [quote, setQuote] = useState(null);
  const [pack, setPack] = useState(null);
  const [fields, setFields] = useState({});
  const [required, setRequired] = useState([]);
  const [completedSections, setCompletedSections] = useState([]);
  const [checks, setChecks] = useState({});
  const [dirty, setDirty] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);

  useEffect(() => {
    if (!open || !token) return undefined;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError('');
      try {
        const response = await fetch(`/api/quotations/${quoteId}/pack`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load the pack.');
        setQuote(data.quote); setPack(data.pack); setRequired(data.requiredFields || []);
        setFields({ ...suggestedFields(data.quote), ...(data.pack.fields || {}) });
        setCompletedSections(data.pack.completedSections || []);
        setChecks(data.pack.checks || {});
        setDirty(false);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message || 'Could not load the pack.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [open, quoteId, token]);

  const bySection = useMemo(() => required.reduce((groups, item) => {
    (groups[item.section] ||= []).push(item);
    return groups;
  }, {}), [required]);
  const completedFieldCount = required.filter(item => !unresolved(fields[item.key])).length;
  const readyToFinalize = completedFieldCount === required.length
    && Array.from({ length: 12 }, (_, index) => index + 1).every(section => completedSections.includes(section))
    && ['accountantReviewed', 'paymentVerified', 'suppliersConfirmed', 'reconciliationReviewed'].every(key => checks[key]);
  const setField = (key, value) => { setFields(current => ({ ...current, [key]: value })); setDirty(true); };
  const save = async () => {
    setBusy('save'); setError(''); setProblems([]);
    try {
      const response = await fetch(`/api/quotations/${quoteId}/pack`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fields, completedSections, checks })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save the pack.');
      setPack(data.pack); setProblems(data.problems || []); setDirty(false);
    } catch (saveError) { setError(saveError.message || 'Could not save the pack.'); }
    finally { setBusy(''); }
  };
  const finalize = async () => {
    setBusy('finalize'); setError(''); setProblems([]);
    try {
      const response = await fetch(`/api/quotations/${quoteId}/pack/finalize`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) { setProblems(data.problems || []); throw new Error(data.message || 'Could not finalize the pack.'); }
      setPack(data.pack);
    } catch (finalError) { setError(finalError.message || 'Could not finalize the pack.'); }
    finally { setBusy(''); setConfirmFinal(false); }
  };
  const download = async () => {
    setBusy('download'); setError('');
    try {
      const response = await fetch(`/api/quotations/${quoteId}/pack/download-data`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not prepare the completed pack.');
      await downloadStandardTravelPackPdf(data.quote, data.pack);
    } catch (downloadError) { setError(downloadError.message || 'Could not download the pack.'); }
    finally { setBusy(''); }
  };

  return <div className="travel-pack-desk">
    <button type="button" className="btn btn-outline" onClick={() => setOpen(value => !value)} aria-expanded={open}><FilePenLine size={16} aria-hidden="true" /> {open ? 'Close document pack' : 'Complete combined document pack'}</button>
    {open && <div className="travel-pack-panel">
      <div className="travel-pack-intro"><h5>Standard travel documents pack</h5><p>All twelve DOCX sections appear in one final PDF. Quotation details come from the approved version. Complete the other forms with verified records; enter N/A for a field that does not apply.</p></div>
      {loading && <p role="status">Loading document pack…</p>}
      {error && <p role="alert" className="travel-pack-error">{error}</p>}
      {quote && pack && <>
        <div className="travel-pack-summary"><FileCheck2 size={18} aria-hidden="true" /><span>01 · Tour Package Quotation</span><strong>Approved</strong></div>
        {pack.status === 'Draft' && <label className="travel-pack-check"><input type="checkbox" checked={completedSections.includes(1)} onChange={event => { setCompletedSections(current => event.target.checked ? [...new Set([...current, 1])] : current.filter(value => value !== 1)); setDirty(true); }} /> I reviewed the approved quotation for this pack.</label>}
        {sectionTitles.filter(section => section.number >= 2).map(section => {
          const items = bySection[section.number] || [];
          const done = items.filter(item => !unresolved(fields[item.key])).length;
          const marked = completedSections.includes(section.number);
          return <details className="travel-pack-section" key={section.number}>
            <summary><span>{section.title}</span><small>{done}/{items.length} fields · {marked ? 'Marked complete' : 'Needs review'}</small></summary>
            <div className="travel-pack-section-body">
              {template.blocks.filter(block => block.section === section.number && (block.type !== 'paragraph' || block.style !== 'Heading 1')).map(block => {
                if (block.type === 'paragraph') {
                  if (!block.editable) return <p className="travel-pack-source-note" key={block.id}>{block.text}</p>;
                  const key = `p:${block.id}`;
                  return <label className="travel-pack-field" key={block.id}><span>{block.text}</span><textarea className="resize-none" rows={2} disabled={pack.status === 'Finalized'} value={fields[key] || ''} placeholder={block.text} onChange={event => setField(key, event.target.value)} /><small>{unresolved(fields[key]) ? 'Complete this wording' : 'Complete'}</small></label>;
                }
                const rows = getRows(block, quote);
                return <div className="travel-pack-table" key={block.id} role="group" aria-label={`Document ${section.number} table`}>
                  {rows.slice(1).map((row, rowIndex) => row.map((cell, column) => {
                    const actualRow = rowIndex + 1;
                    const editable = block.id === 97 || block.editable?.[actualRow]?.[column];
                    if (!editable) return null;
                    const key = `${block.id}:${actualRow}:${column}`;
                    const columnLabel = block.rows[0]?.[column] || 'Detail';
                    const rowLabel = sourceText(block, actualRow, 0);
                    const label = block.rows[0].length === 2 && column === 1
                      ? `${rowLabel} — ${columnLabel}`
                      : `${columnLabel} — row ${actualRow}`;
                    return <label className="travel-pack-field" key={key}><span>{label}</span><textarea className="resize-none" rows={Math.min(4, Math.max(2, Math.ceil(cell.length / 54)))} disabled={pack.status === 'Finalized'} value={fields[key] || ''} placeholder={cell} onChange={event => setField(key, event.target.value)} /><small>{unresolved(fields[key]) ? 'Complete this field' : 'Complete'}{cell.includes('☐') ? ' · use ☒ for a selected box' : ''}</small></label>;
                  }))}
                  {block.rows.length === 1 && block.rows[0].map((cell, column) => {
                    if (!block.editable?.[0]?.[column]) return null;
                    const key = `${block.id}:0:${column}`;
                    return <label className="travel-pack-field" key={key}><span>{cell.split(':')[0]}</span><textarea className="resize-none" rows={2} disabled={pack.status === 'Finalized'} value={fields[key] || ''} placeholder={cell} onChange={event => setField(key, event.target.value)} /><small>{unresolved(fields[key]) ? 'Complete this field' : 'Complete'}</small></label>;
                  })}
                </div>;
              })}
              {pack.status === 'Draft' && <label className="travel-pack-check"><input type="checkbox" checked={marked} onChange={event => { setCompletedSections(current => event.target.checked ? [...new Set([...current, section.number])] : current.filter(value => value !== section.number)); setDirty(true); }} /> I reviewed and completed document {String(section.number).padStart(2, '0')}.</label>}
            </div>
          </details>;
        })}
        <div className="travel-pack-approval"><h6>Final verification</h6>
          {[
            ['accountantReviewed', 'Accountant reviewed invoice, receipt and tax treatment.'],
            ['paymentVerified', 'Payment and receipt records were verified.'],
            ['suppliersConfirmed', 'Supplier and booking confirmations were checked.'],
            ['reconciliationReviewed', 'Internal accounts and reconciliation were reviewed.']
          ].map(([key, label]) => <label className="travel-pack-check" key={key}><input type="checkbox" disabled={pack.status === 'Finalized'} checked={checks[key] || false} onChange={event => { setChecks(current => ({ ...current, [key]: event.target.checked })); setDirty(true); }} /> {label}</label>)}
        </div>
        {problems.length > 0 && <div className="travel-pack-problems" role="status"><strong>{problems.length} items still need attention</strong><ul>{problems.slice(0, 12).map((problem, index) => <li key={`${index}-${problem}`}>{problem}</li>)}</ul></div>}
        <div className="travel-pack-actions">
          {pack.status === 'Draft' && <><button type="button" className="btn btn-outline" onClick={save} disabled={Boolean(busy)}>{busy === 'save' ? 'Saving…' : 'Save document pack'}</button><button type="button" className="btn btn-primary" onClick={() => setConfirmFinal(true)} disabled={Boolean(busy) || dirty || !readyToFinalize}>Finalize all twelve documents</button><span>{completedFieldCount}/{required.length} fields complete</span></>}
          {pack.status === 'Finalized' && <button type="button" className="btn btn-primary" onClick={download} disabled={Boolean(busy)}><Download size={16} aria-hidden="true" /> {busy === 'download' ? 'Preparing PDF…' : 'Download combined PDF'}</button>}
          {dirty && <span>Save your changes before finalizing.</span>}
        </div>
      </>}
    </div>}
    <ConfirmDialog open={confirmFinal} title="Finalize all twelve documents?" message="The completed pack will be locked and available as one PDF. Check financial details, document numbers, supplier evidence and approvals before proceeding." confirmLabel="Finalize document pack" cancelLabel="Keep editing" onConfirm={finalize} onCancel={() => setConfirmFinal(false)} busy={busy === 'finalize'} />
  </div>;
};

export default TravelDocumentPackDesk;
