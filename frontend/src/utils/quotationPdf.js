const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 42;

const toAscii = (value) => String(value ?? '')
  .replace(/[₹]/g, 'INR ')
  .replace(/[–—]/g, '-')
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/•/g, '-')
  .replace(/[^\x20-\x7E]/g, '')
  .trim();

const escapePdf = (value) => toAscii(value)
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
      for (let index = 0; index < word.length; index += maxChars) {
        lines.push(word.slice(index, index + maxChars));
      }
      line = '';
      return;
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      lines.push(line);
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

const buildPage = (pageLines, pageNumber, totalPages) => {
  const commands = [];
  addRect(commands, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, '0.98 0.97 0.93');
  addRect(commands, 0, PAGE_HEIGHT - 90, PAGE_WIDTH, 90, '0.08 0.15 0.20');
  addText(commands, 'SREEPAYANAM', MARGIN, PAGE_HEIGHT - 39, 18, 'F2', '1 1 1');
  addText(commands, 'TOURS & TRAVELS', MARGIN, PAGE_HEIGHT - 57, 8, 'F1', '0.67 0.82 0.75');
  addText(commands, 'CUSTOM TRAVEL QUOTATION', PAGE_WIDTH - 210, PAGE_HEIGHT - 45, 10, 'F2', '0.96 0.73 0.30');

  let y = PAGE_HEIGHT - 125;
  pageLines.forEach(line => {
    if (line.type === 'heading') {
      addText(commands, line.text, MARGIN, y, 13, 'F2', '0.08 0.15 0.20');
      y -= 20;
      addLine(commands, MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4, '0.93 0.45 0.32', 1.4);
      y -= 13;
      return;
    }
    if (line.type === 'meta') {
      addText(commands, line.text, MARGIN, y, 9, 'F1', '0.33 0.38 0.39');
      y -= 14;
      return;
    }
    if (line.type === 'total') {
      addRect(commands, MARGIN - 8, y - 12, PAGE_WIDTH - (MARGIN * 2) + 16, 34, '0.07 0.48 0.46');
      addText(commands, line.label, MARGIN, y, 11, 'F2', '1 1 1');
      addText(commands, line.value, PAGE_WIDTH - MARGIN - 150, y, 14, 'F2', '1 0.86 0.47');
      y -= 51;
      return;
    }
    addText(commands, line.text, MARGIN, y, line.size || 9.5, line.bold ? 'F2' : 'F1', line.color || '0.16 0.19 0.22');
    y -= line.leading || 14;
  });

  addLine(commands, MARGIN, 45, PAGE_WIDTH - MARGIN, 45, '0.86 0.82 0.73', 0.8);
  addText(commands, `Prepared by SreePayanam travel desk | Page ${pageNumber} of ${totalPages}`, MARGIN, 28, 8, 'F1', '0.42 0.45 0.44');
  addText(commands, 'Estimate - subject to availability and final confirmation', PAGE_WIDTH - 285, 28, 8, 'F1', '0.42 0.45 0.44');
  return commands.join('\n');
};

const buildPdf = (pageStreams) => {
  const objects = [];
  const addObject = body => {
    objects.push(body);
    return objects.length;
  };

  const pagesId = addObject('');
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds = pageStreams.map(stream => {
    const streamLength = new TextEncoder().encode(stream).length;
    const contentId = addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);
    return addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  });
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
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

const createLines = ({ form, quote, selectedPackage, selectedDestinations, itinerary }) => {
  const lines = [];
  const addParagraph = (value, options = {}) => {
    wrapText(value, options.maxChars || 92).forEach(text => lines.push({ text, ...options }));
    lines.push({ text: '', leading: 6 });
  };
  const money = value => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

  lines.push({ type: 'meta', text: `Quotation ${quote.quoteReference || 'SP-ESTIMATE'} | Issued ${new Date(quote.issuedAt || Date.now()).toLocaleDateString('en-IN')}` });
  lines.push({ type: 'meta', text: `Prepared for ${form.fullName} | ${form.email} | ${form.mobile}` });
  lines.push({ type: 'meta', text: `${selectedPackage?.name || 'Custom route'} | ${form.durationDays} days / ${form.durationNights} nights | ${form.adultCount} adults, ${form.childCount} children` });
  lines.push({ text: '', leading: 10 });
  lines.push({ type: 'heading', text: 'Your route' });
  addParagraph(`${form.departureCity || 'Flexible departure'} -> ${selectedPackage?.destination || 'Curated SreePayanam route'}`);
  addParagraph(`${selectedDestinations.length} places selected: ${selectedDestinations.join(', ')}`);

  lines.push({ type: 'heading', text: 'Estimated package total' });
  lines.push({ type: 'total', label: 'Customer estimate', value: money(quote.customerPrice) });
  lines.push({ text: `Package estimate before tax: ${money(quote.subtotal)}`, meta: true });
  lines.push({ text: `${quote.tax?.label || 'Estimated taxes'}: ${money(quote.tax?.amount)}`, meta: true });
  lines.push({ text: '', leading: 6 });
  (quote.breakdown || []).forEach(item => lines.push({ text: `${item.label}: ${money(item.amount)}`, leading: 14 }));
  lines.push({ text: '', leading: 8 });

  lines.push({ type: 'heading', text: 'Proposed day plan' });
  (itinerary || []).forEach(day => {
    lines.push({ text: `Day ${day.day} - ${day.title}`, bold: true, leading: 15 });
    addParagraph(day.places || day.activities || 'Flexible time for local discovery', { maxChars: 88 });
  });

  lines.push({ type: 'heading', text: 'Included in this estimate' });
  [
    'Route planning for the selected places',
    `${form.hotelCategory} stay planning for ${form.durationNights} nights`,
    `${form.vehicleType} local transport planning`,
    `${form.mealPlan} meal preference`,
    'Customer-facing estimate with taxes shown separately'
  ].forEach(item => lines.push({ text: `- ${item}`, leading: 14 }));
  lines.push({ text: '', leading: 8 });
  lines.push({ type: 'heading', text: 'Payment & confirmation' });
  addParagraph('Advance and balance-payment timing will be confirmed by the SreePayanam travel desk in the final booking confirmation. This estimate does not reserve rooms, vehicles, tickets or attractions.');
  addParagraph('Prices can change with travel dates, supplier availability, seasonality, taxes or requested upgrades. The final quotation issued by SreePayanam is the commercial source of truth.');
  return lines;
};

export const downloadQuotationPdf = ({ form, quote, selectedPackage, selectedDestinations, itinerary }) => {
  if (!quote) return false;
  const lines = createLines({ form, quote, selectedPackage, selectedDestinations, itinerary });
  const pageCapacity = 43;
  const pages = [];
  let page = [];
  lines.forEach(line => {
    if (page.length >= pageCapacity && line.type !== 'heading') {
      pages.push(page);
      page = [];
    }
    page.push(line);
  });
  if (page.length) pages.push(page);
  const streams = pages.map((pageLines, index) => buildPage(pageLines, index + 1, pages.length));
  const blob = buildPdf(streams);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = toAscii(selectedPackage?.name || 'custom-route').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-route';
  link.href = url;
  link.download = `SreePayanam_Quotation_${safeName}_${quote.quoteReference || 'estimate'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
