import logoSrc from '../assets/sreepayanam-official-logo.png';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 42;

const toAscii = value => String(value ?? '')
  .replace(/[–—]/g, '-')
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/•/g, '-')
  .replace(/→/g, '->')
  .replace(/×/g, 'x')
  .replace(/[^\x20-\x7E]/g, '')
  .trim();

const escapePdf = value => toAscii(value)
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const wrapText = (value, maxChars) => {
  const text = toAscii(value);
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach(word => {
    if (word.length > maxChars) {
      if (line) lines.push(line);
      for (let index = 0; index < word.length; index += maxChars) lines.push(word.slice(index, index + maxChars));
      line = '';
      return;
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

const addText = (commands, text, x, y, size = 10, font = 'F1', color = '0.16 0.19 0.22') => {
  commands.push(`${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
};

const addLine = (commands, x1, y1, x2, y2, color = '0.86 0.82 0.73', width = 0.8) => {
  commands.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
};

const addRect = (commands, x, y, width, height, fill, stroke = null) => {
  if (fill) commands.push(`${fill} rg ${x} ${y} ${width} ${height} re f`);
  if (stroke) commands.push(`${stroke} RG ${x} ${y} ${width} ${height} re S`);
};

const addImage = (commands, image, x, y, width, height) => {
  if (!image) return;
  commands.push(`q ${width} 0 0 ${height} ${x} ${y} cm /Im1 Do Q`);
};

const base64ToBytes = value => {
  const binary = window.atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
};

const loadLogoJpeg = () => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare the logo.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      resolve({ bytes: base64ToBytes(data), width: image.naturalWidth, height: image.naturalHeight });
    } catch (error) {
      reject(error);
    }
  };
  image.onerror = () => reject(new Error('Could not load the SreePayanam logo.'));
  image.src = logoSrc;
});

const bytesToAsciiHex = bytes => `${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}>`;

const buildPage = (pageLines, pageNumber, totalPages, logoImage) => {
  const commands = [];
  addRect(commands, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, '0.98 0.97 0.93');
  addRect(commands, 0, PAGE_HEIGHT - 116, PAGE_WIDTH, 116, '1 1 1');
  const logoWidth = 238;
  const logoHeight = logoImage ? logoWidth * (logoImage.height / logoImage.width) : 80;
  addImage(commands, logoImage, MARGIN, PAGE_HEIGHT - 98, logoWidth, logoHeight);
  addText(commands, 'CUSTOM ROUTE BRIEF', PAGE_WIDTH - 194, PAGE_HEIGHT - 39, 10, 'F2', '0.08 0.24 0.57');
  addText(commands, 'PREPARED FOR TRAVEL-DESK REVIEW', PAGE_WIDTH - 194, PAGE_HEIGHT - 57, 7, 'F2', '0.95 0.36 0.11');
  addLine(commands, MARGIN, PAGE_HEIGHT - 116, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 116, '0.95 0.36 0.11', 1.5);

  let y = PAGE_HEIGHT - 143;
  pageLines.forEach(line => {
    if (line.type === 'heading') {
      addText(commands, line.text, MARGIN, y, 13, 'F2', '0.08 0.15 0.20');
      y -= 20;
      addLine(commands, MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4, '0.95 0.36 0.11', 1.2);
      y -= 13;
      return;
    }
    if (line.type === 'meta') {
      addText(commands, line.text, MARGIN, y, 8.8, 'F1', '0.33 0.38 0.39');
      y -= 14;
      return;
    }
    addText(commands, line.text, MARGIN, y, line.size || 9.5, line.bold ? 'F2' : 'F1', line.color || '0.16 0.19 0.22');
    y -= line.leading || 14;
  });

  addLine(commands, MARGIN, 45, PAGE_WIDTH - MARGIN, 45, '0.86 0.82 0.73', 0.8);
  addText(commands, `Prepared by SreePayanam travel desk | Page ${pageNumber} of ${totalPages}`, MARGIN, 28, 8, 'F1', '0.42 0.45 0.44');
  addText(commands, 'Commercial details shared separately', PAGE_WIDTH - 190, 28, 8, 'F1', '0.42 0.45 0.44');
  return commands.join('\n');
};

const buildPdf = (pageStreams, logoImage) => {
  const objects = [];
  const addObject = body => {
    objects.push(body);
    return objects.length;
  };

  const pagesId = addObject('');
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const logoHex = bytesToAsciiHex(logoImage.bytes);
  const logoId = addObject(`<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoHex.length} >>\nstream\n${logoHex}\nendstream`);
  const pageIds = pageStreams.map(stream => {
    const streamLength = new TextEncoder().encode(stream).length;
    const contentId = addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);
    return addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /Im1 ${logoId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  });
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n%SreePayanam\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = new TextEncoder().encode(pdf).length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
};

const formatDate = value => {
  if (!value) return 'To be confirmed';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? toAscii(value) : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const createLines = ({ form, draft, selectedPackage, selectedDestinations }) => {
  const lines = [];
  const addParagraph = (value, options = {}) => {
    const { maxChars = 92, ...lineOptions } = options;
    wrapText(value, maxChars).forEach(text => lines.push({ text, ...lineOptions }));
    lines.push({ text: '', leading: 6 });
  };
  const durationDays = Number(draft?.durationDays || form.durationDays || 1);
  const durationNights = Number(draft?.durationNights ?? form.durationNights ?? Math.max(durationDays - 1, 0));
  const review = draft?.planningReview || {};
  const itinerary = Array.isArray(draft?.itinerary) ? draft.itinerary : [];
  const places = (selectedDestinations || []).filter(Boolean);
  const children = Number(form.childWithBedCount || 0) + Number(form.childNoBedCount || 0);
  const statusLabel = review.status === 'not_feasible' ? 'Needs route changes' : review.status === 'tight' ? 'Ambitious timing' : 'Fits the selected timing';
  const reference = draft?.planReference || 'SP-DRAFT';

  lines.push({ type: 'meta', text: `Route brief ${reference} | Issued ${formatDate(new Date().toISOString().slice(0, 10))}` });
  lines.push({ type: 'meta', text: `Prepared for ${form.fullName || 'Traveller'} | ${form.email || 'Email to be confirmed'} | ${form.mobileNumber || 'Mobile to be confirmed'}` });
  lines.push({ type: 'meta', text: `${selectedPackage?.name || draft?.destination || 'Custom route'} | ${durationDays} days / ${durationNights} nights | ${form.adultCount || 1} adults, ${children} children` });
  lines.push({ text: '', leading: 10 });

  lines.push({ type: 'heading', text: 'Route overview' });
  addParagraph(`${form.departureCity || draft?.startingCity || 'Flexible departure'} -> ${draft?.destination || selectedPackage?.destination || 'Curated SreePayanam route'}`);
  addParagraph(`Travel window: ${formatDate(draft?.travelStartDate || form.travelStartDate)} to ${formatDate(draft?.returnDate || form.returnDate)}`);
  addParagraph(`${places.length} selected places: ${places.length ? places.join(', ') : 'The travel desk will help refine the stop list.'}`);
  if (draft?.overview) addParagraph(draft.overview);

  lines.push({ type: 'heading', text: 'Planning review' });
  lines.push({ text: `Status: ${statusLabel}`, bold: true, leading: 15 });
  addParagraph(review.summary || 'The route has been arranged for travel-desk review with practical time for movement, meals and rest.', { maxChars: 92 });
  lines.push({ text: `Selected places: ${Number(review.selectedPlaceCount || places.length)} | Planned stops: ${Number(review.plannedPlaceCount || 0)} | ${durationDays} days / ${durationNights} nights`, leading: 14 });
  if (Array.isArray(review.unplacedPlaces) && review.unplacedPlaces.length) addParagraph(`Places needing review: ${review.unplacedPlaces.join(', ')}`, { maxChars: 92 });
  if (Array.isArray(review.suggestedRemovals) && review.suggestedRemovals.length) addParagraph(`Suggested removals: ${review.suggestedRemovals.map(item => typeof item === 'string' ? item : item.place).filter(Boolean).join(', ')}`, { maxChars: 92 });
  if (Array.isArray(review.suggestedReplacements) && review.suggestedReplacements.length) addParagraph(`Possible alternatives: ${review.suggestedReplacements.map(item => typeof item === 'string' ? item : item.replacement ? `${item.place} -> ${item.replacement}` : item.place).filter(Boolean).join(', ')}`, { maxChars: 92 });

  lines.push({ type: 'heading', text: 'Day-by-day route' });
  itinerary.forEach(day => {
    lines.push({ text: `Day ${day.day} - ${day.title || 'Discover the route'}`, bold: true, leading: 15 });
    if (day.base) lines.push({ text: `Area: ${day.base}`, leading: 13 });
    addParagraph(`Stops: ${Array.isArray(day.places) && day.places.length ? day.places.join(' | ') : 'Flexible local discovery'}`, { maxChars: 88 });
    if (day.activities) addParagraph(`Plan: ${day.activities}`, { maxChars: 88 });
    if (day.transit) addParagraph(`Travel: ${day.transit}`, { maxChars: 88 });
    if (day.meal) addParagraph(`Meals: ${day.meal}`, { maxChars: 88 });
    if (day.hotel?.name) addParagraph(`Stay planning: ${day.hotel.name}${day.hotel.rating ? ` | ${day.hotel.rating}` : ''}${day.hotel.desc ? ` - ${day.hotel.desc}` : ''}`, { maxChars: 88 });
  });

  lines.push({ type: 'heading', text: 'Route brief notes' });
  [
    'This document records a planning brief for SreePayanam travel-desk review.',
    'Availability, inclusions and commercial details are confirmed separately after supplier and timing checks.',
    'The route may be adjusted to protect practical travel time, opening hours, rest and local conditions.'
  ].forEach(item => lines.push({ text: `- ${item}`, leading: 14 }));

  const inclusions = Array.isArray(draft?.inclusions) && draft.inclusions.length ? draft.inclusions : [
    'Time-aware route planning for the selected places',
    `${form.hotelCategory || 'Preferred'} stay planning for ${durationNights} nights`,
    `${form.vehicleType || 'Local'} movement planning`,
    `${form.mealPlan || 'Preferred'} meal preference noted for review`
  ];
  const exclusions = Array.isArray(draft?.exclusions) && draft.exclusions.length ? draft.exclusions : [
    'Room, vehicle, ticket and attraction availability until confirmed by the travel desk',
    'Final booking terms and commercial confirmation'
  ];
  lines.push({ type: 'heading', text: 'Planning scope' });
  inclusions.forEach(item => lines.push({ text: `- ${item}`, leading: 14 }));
  lines.push({ text: 'Noted for separate confirmation:', bold: true, leading: 16 });
  exclusions.forEach(item => lines.push({ text: `- ${item}`, leading: 14 }));
  return lines;
};

export const downloadQuotationPdf = async ({ form, draft, selectedPackage, selectedDestinations }) => {
  if (!draft) return false;
  const logoImage = await loadLogoJpeg();
  const lines = createLines({ form, draft, selectedPackage, selectedDestinations });
  const pages = [];
  let page = [];
  let pageHeight = 0;
  const maxContentHeight = 610;
  lines.forEach(line => {
    const lineHeight = line.type === 'heading' ? 33 : line.type === 'meta' ? 14 : line.leading || 14;
    const needsNewPage = page.length && pageHeight + lineHeight > maxContentHeight && line.type !== 'heading';
    const headingNeedsNewPage = page.length && line.type === 'heading' && pageHeight > maxContentHeight - 60;
    if (needsNewPage || headingNeedsNewPage) {
      pages.push(page);
      page = [];
      pageHeight = 0;
    }
    page.push(line);
    pageHeight += lineHeight;
  });
  if (page.length) pages.push(page);
  const streams = pages.map((pageLines, index) => buildPage(pageLines, index + 1, pages.length, logoImage));
  const blob = buildPdf(streams, logoImage);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = toAscii(selectedPackage?.name || draft.destination || 'custom-route').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-route';
  link.href = url;
  link.download = `SreePayanam_Route_Brief_${safeName}_${draft.planReference || 'draft'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
