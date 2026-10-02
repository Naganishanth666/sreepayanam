// The combined pack follows all sections of the Standard Travel Documents Pack.
// The route brief remains a separate, unpriced planning document.
import travelPackTemplate from '../../../shared/standardTravelPack.json';
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const SCALE = 2.5;
const LEFT = 44;
const RIGHT = PAGE_WIDTH - LEFT;
const CONTENT_WIDTH = RIGHT - LEFT;
const BODY_TOP = 112;
const BODY_BOTTOM = 781;
const BLUE = '#0B3D91';
const INK = '#27364B';
const GRID = '#D9D9D9';
const PALE = '#F3F6FA';
const FONT = '"Century Gothic", Arial, sans-serif';

const font = (size, bold = false) => `${bold ? '700' : '400'} ${size}px ${FONT}`;
const clean = value => String(value ?? '').trim();
const short = (value, fallback = 'To be confirmed') => clean(value) || fallback;
const formatDate = value => {
  if (!value) return 'To be confirmed';
  const text = String(value);
  const parsed = new Date(text);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? text
    : Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : text;
};
const money = value => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;
const safeUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
};

const textLines = (ctx, value, width, size, bold = false) => {
  ctx.font = font(size, bold);
  const output = [];
  for (const paragraph of String(value ?? '').split('\n')) {
    if (!paragraph.trim()) {
      output.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= width) {
        line = candidate;
        continue;
      }
      if (line) output.push(line);
      line = word;
      while (ctx.measureText(line).width > width && line.length > 1) {
        let cut = 1;
        while (cut < line.length && ctx.measureText(line.slice(0, cut + 1)).width <= width) cut += 1;
        output.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    output.push(line);
  }
  return output.length ? output : [''];
};

const createPage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(PAGE_WIDTH * SCALE);
  canvas.height = Math.round(PAGE_HEIGHT * SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the quotation page.');
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  ctx.textBaseline = 'top';
  ctx.fillStyle = BLUE;
  ctx.font = font(10, true);
  ctx.fillText('SreePayanam InterNational Pvt. Ltd.  |  Tours & Travels', LEFT, 24);
  ctx.fillStyle = INK;
  ctx.font = font(7.3);
  ctx.fillText('No. 6, NMR Complex, Bharathipuram, Thiruverumbur, Trichy – 13  |  GSTIN: 33AAZCS3009H1Z5', LEFT, 43);
  ctx.fillText('Office: 0431-2905117  |  Mobile: +91 92800 77182  |  info@sreepayanamtours.com  |  www.sreepayanamtours.com', LEFT, 58);
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(LEFT, 82);
  ctx.lineTo(RIGHT, 82);
  ctx.stroke();
  return { canvas, ctx, links: [], y: BODY_TOP };
};

const drawFooter = (page, number, count) => {
  const { ctx } = page;
  ctx.strokeStyle = GRID;
  ctx.beginPath();
  ctx.moveTo(LEFT, 795);
  ctx.lineTo(RIGHT, 795);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = font(7.3);
  ctx.fillText('Travel Smarter. Journey Better.', LEFT, 806);
  const label = `Page ${number} of ${count}`;
  ctx.fillText(label, RIGHT - ctx.measureText(label).width, 806);
};

const renderQuotationPages = (quote, pack = null) => {
  const pages = [createPage()];
  const current = () => pages[pages.length - 1];
  const nextPage = () => pages.push(createPage());
  const ensure = height => { if (current().y + height > BODY_BOTTOM) nextPage(); };
  const heading = (label, main = false, reserve = 0) => {
    const size = main ? 15 : 10;
    ensure((main ? 38 : 30) + reserve);
    const page = current();
    page.ctx.fillStyle = main ? BLUE : '#18314F';
    page.ctx.font = font(size, true);
    page.ctx.fillText(label, LEFT, page.y);
    page.y += main ? 24 : 20;
  };
  const paragraph = (value, options = {}) => {
    const size = options.size || 8.5;
    const lineHeight = size + 3.5;
    const lines = textLines(current().ctx, value, CONTENT_WIDTH, size, options.bold);
    ensure(lines.length * lineHeight + (options.after ?? 8));
    const page = current();
    page.ctx.fillStyle = options.color || INK;
    page.ctx.font = font(size, options.bold);
    lines.forEach(line => { page.ctx.fillText(line, LEFT, page.y); page.y += lineHeight; });
    page.y += options.after ?? 8;
  };
  const table = (headers, bodyRows, widths, options = {}) => {
    const lineHeight = options.lineHeight || 10.5;
    const size = options.fontSize || 7.5;
    const padding = options.padding || 6;
    const header = headers.map(value => ({ text: value }));
    const drawRow = (cells, style = 'body', offset = 0, take = null) => {
      const page = current();
      const ctx = page.ctx;
      const bold = style === 'header';
      const wrapped = cells.map((raw, index) => {
        const cell = typeof raw === 'object' && raw !== null ? raw : { text: raw };
        return { ...cell, lines: textLines(ctx, cell.text, widths[index] - 2 * padding, size, bold) };
      });
      const maxLines = Math.max(...wrapped.map(cell => cell.lines.length));
      const remaining = maxLines - offset;
      const linesToDraw = take ?? remaining;
      const height = linesToDraw * lineHeight + 2 * padding;
      let x = LEFT;
      wrapped.forEach((cell, index) => {
        ctx.fillStyle = style === 'header' ? BLUE : style === 'subheader' ? PALE : '#FFFFFF';
        ctx.fillRect(x, page.y, widths[index], height);
        ctx.strokeStyle = GRID;
        ctx.lineWidth = 0.65;
        ctx.strokeRect(x, page.y, widths[index], height);
        ctx.fillStyle = style === 'header' ? '#FFFFFF' : cell.link ? BLUE : INK;
        ctx.font = font(size, bold);
        const visibleLines = cell.lines.slice(offset, offset + linesToDraw);
        if (offset > 0 && index === 0 && visibleLines.length === 0) visibleLines.push(`${cell.lines[0]} (continued)`);
        visibleLines.forEach((line, lineIndex) => {
          const lineLink = cell.lineLinks?.find(item => item.url && line.trim().length > 3 && (item.label === line || item.label.includes(line.trim())));
          if (lineLink) ctx.fillStyle = BLUE;
          ctx.fillText(line, x + padding, page.y + padding + lineIndex * lineHeight);
          if (lineLink) page.links.push({ url: lineLink.url, x: x + padding, y: page.y + padding + lineIndex * lineHeight, width: Math.min(ctx.measureText(line).width, widths[index] - 2 * padding), height: lineHeight });
          ctx.fillStyle = style === 'header' ? '#FFFFFF' : cell.link ? BLUE : INK;
        });
        const link = safeUrl(cell.link);
        if (link && cell.lines.length > offset) page.links.push({ url: link, x, y: page.y, width: widths[index], height });
        x += widths[index];
      });
      page.y += height;
      return { maxLines, height };
    };
    const headerLines = Math.max(...header.map((cell, index) => textLines(current().ctx, cell.text, widths[index] - 2 * padding, size, true).length));
    const headerHeight = headerLines * lineHeight + 2 * padding;
    const drawHeader = () => {
      ensure(headerHeight + lineHeight + 2 * padding);
      drawRow(header, 'header');
    };
    if (!options.noHeader) drawHeader();
    for (const item of options.noHeader ? [headers, ...bodyRows] : bodyRows) {
      const row = Array.isArray(item) ? { cells: item } : item;
      const cells = row.cells;
      const maxLines = Math.max(...cells.map((raw, index) => {
        const cell = typeof raw === 'object' && raw !== null ? raw : { text: raw };
        return textLines(current().ctx, cell.text, widths[index] - 2 * padding, size).length;
      }));
      const fullRowHeight = maxLines * lineHeight + 2 * padding;
      if (fullRowHeight <= BODY_BOTTOM - BODY_TOP - (options.noHeader ? 0 : headerHeight) && current().y + fullRowHeight > BODY_BOTTOM) {
        nextPage();
        if (!options.noHeader) drawHeader();
      }
      let offset = 0;
      while (offset < maxLines) {
        const capacity = Math.floor((BODY_BOTTOM - current().y - 2 * padding) / lineHeight);
        if (capacity < Math.min(maxLines - offset, 2)) {
          nextPage();
          if (!options.noHeader) drawHeader();
          continue;
        }
        const take = Math.min(maxLines - offset, capacity);
        drawRow(cells, row.style || 'body', offset, take);
        offset += take;
        if (offset < maxLines) {
          nextPage();
          if (!options.noHeader) drawHeader();
        }
      }
    }
    current().y += options.after ?? 11;
  };

  const packTableRows = block => {
    if (block.id !== 97) return block.rows;
    const count = Math.max(3, quote.route?.itinerary?.length || 0);
    return [block.rows[0], ...Array.from({ length: count }, (_, index) => [
      `Day ${index + 1} / [date]`, '[Stop + official detail link]', '[Travel time / visit window; status]',
      '[Meal and restaurant details]', '[Hotel / category]'
    ])];
  };
  const templateBlocks = section => {
    for (const block of travelPackTemplate.blocks.filter(item => item.section === section)) {
      if (block.type === 'paragraph') {
        if (block.id === 0) heading(block.text, true);
        else if (block.style === 'Heading 1') {
          if (current().y > BODY_TOP + 8) nextPage();
          heading(block.text, true);
        } else if (block.style === 'Heading 2') heading(block.text, false, 30);
        else paragraph(pack?.fields?.[`p:${block.id}`] || block.text, { size: section === 0 ? 8.2 : 8.5, after: section === 0 ? 9 : section === 3 ? 5 : 8 });
        continue;
      }
      const rows = packTableRows(block).map((row, rowIndex) => row.map((cell, column) => {
        const content = pack?.fields?.[`${block.id}:${rowIndex}:${column}`] || cell;
        const urls = [...String(content).matchAll(/https:\/\/[^\s|,;]+/g)].map(match => safeUrl(match[0])).filter(Boolean);
        return urls.length ? { text: content, lineLinks: urls.map(url => ({ label: url, url })), link: urls.length === 1 ? urls[0] : '' } : content;
      }));
      const sourceWidths = block.widths.map(value => Number(value) || 1);
      const total = sourceWidths.reduce((sum, value) => sum + value, 0);
      const widths = sourceWidths.map(value => CONTENT_WIDTH * value / total);
      const columnCount = rows[0].length;
      table(rows[0], rows.slice(1), widths, {
        noHeader: rows.length === 1,
        fontSize: columnCount >= 7 ? 6.4 : columnCount >= 5 ? 6.8 : columnCount >= 4 ? 7.1 : 7.5,
        lineHeight: columnCount >= 5 ? 9.5 : 10.5,
        padding: columnCount >= 5 ? 4 : 6,
        after: section === 3 ? 4 : 10
      });
    }
  };

  const route = quote.route || {};
  const customer = quote.customer || {};
  const terms = quote.terms || {};
  const days = Array.isArray(route.itinerary) ? route.itinerary : [];
  const places = Array.isArray(quote.selectedPlaces) ? quote.selectedPlaces : [];
  const references = new Map((quote.destinationReferences || []).map(ref => [clean(ref.name).toLowerCase(), ref]));
  const dayForPlace = name => days.find(day => (day.places || []).some(place => clean(place).toLowerCase() === clean(name).toLowerCase()));
  const needsTimingConfirmation = day => !day?.entryWindow
    || /pending|to (?:be )?confirm|needs? .*confirm|requires? .*confirm|unverified/i.test(day.entryWindow);
  const plannedCount = places.filter(name => dayForPlace(name)).length;
  const needsReview = places.filter(name => {
    const day = dayForPlace(name);
    return !day || needsTimingConfirmation(day);
  }).length;
  const ageText = customer.childAges?.length ? ` (${customer.childAges.join(', ')} years)` : '';
  const notes = [terms.specialNotes, customer.accessibilityNeeds, customer.foodRestrictions, customer.visitTimingPreferences,
    terms.assumptions ? `Assumptions: ${terms.assumptions}` : '']
    .map(clean).filter(Boolean).join(' | ');

  if (pack) {
    templateBlocks(0);
    nextPage();
  }
  heading('01  Tour Package Quotation', true);
  paragraph('Customer-facing estimate and quotation template. Use one enquiry reference across CRM, quotation, booking and accounting records.', { after: 12 });
  table(
    ['CUSTOMER INQUIRY REFERENCE', 'QUOTATION NUMBER', 'ISSUE DATE', 'VALID UNTIL'],
    [[short(quote.enquiryReference), short(quote.reference), formatDate(quote.approvedAt), formatDate(terms.validUntil)]],
    [130, 133, 108, 136], { fontSize: 7.1, after: 13 }
  );
  table(['Field', 'Details'], [
    ['Prepared for', `${short(customer.name)}  |  Mobile: ${short(customer.mobile)}  |  Email: ${short(customer.email)}`],
    ['Trip / package', [route.packageCategory, route.packageName || route.title || route.destination].map(clean).filter(Boolean).join('  |  ')],
    ['Route overview', `${short(route.startingCity)} → ${short(route.destination)} → ${short(route.endingCity)}`],
    ['Travel window', `${formatDate(route.travelStartDate)} to ${formatDate(route.returnDate)}  |  ${route.durationDays || days.length} days / ${route.durationNights ?? Math.max(days.length - 1, 0)} nights`],
    ['Travellers', `${customer.adults || 0} adults  |  ${customer.children || 0} children${ageText}${customer.infants ? `  |  ${customer.infants} infants` : ''}  |  ${customer.rooms ? `${customer.rooms} rooms` : 'Rooms to confirm'}`],
    ['Travel preferences', `${short(customer.preferredTier, 'Compare all options')}  |  Meals: ${short(customer.mealPreference)}  |  Vehicle: ${short(customer.vehicleType)}`]
  ], [119, 388]);

  heading('Planning review');
  table(['Selected places', `Total selected: ${places.length}  |  Included in plan: ${plannedCount}  |  Needs timing / route confirmation: ${needsReview}`], [
    { cells: ['Place and detail link', 'Planning status / notes'], style: 'subheader' },
    ...places.map(name => {
      const ref = references.get(clean(name).toLowerCase());
      const day = dayForPlace(name);
      return [
        { text: `${name}\n${ref?.url || 'Reference pending'}`, link: ref?.url },
        `${day ? `Included on Day ${day.day}` : 'Needs route confirmation'}  |  ${day && needsTimingConfirmation(day) ? 'Entry timing to confirm; ' : ''}${ref?.sourceType || 'Source pending'}; checked ${formatDate(ref?.lastChecked)}`
      ];
    }),
    ...(terms.routeReviewNote ? [['Travel-desk review', terms.routeReviewNote]] : [])
  ], [228, 279]);

  heading('Day-by-day plan', false, 170);
  table(['Day / area / stops', 'Plan, travel, darshan and meal details'], days.map(day => {
    const stops = day.places || [];
    const stopText = stops.join('\n') || 'Flexible local discovery';
    const stay = day.hotel?.name
      ? `${day.hotel.name}${day.hotel.desc ? `; ${day.hotel.desc}` : ''}`
      : day.hotel?.desc || 'No overnight stay planned';
    const status = short(day.entryWindow, 'Entry / darshan timing requires source confirmation');
    return [
      {
        text: `Day ${day.day} — ${short(day.base, 'Area to confirm')}\nStops:\n${stopText}`,
        lineLinks: stops.map(name => ({ label: name, url: references.get(clean(name).toLowerCase())?.url }))
      },
      `Visit plan: ${short(day.activities)}\nTravel: ${short(day.transit)}\nDarshan/entry window: ${status}\nMeals: ${short(day.meal)}\nStay: ${stay}`
    ];
  }), [157, 350]);

  heading('Stay, meals and price options');
  table(['Option', 'Stay / transport / meal plan', 'Total for group', 'Per person', 'Tax'],
    (quote.tiers || []).map(tier => [
      tier.name,
      `${short(tier.accommodation)}\n${short(tier.transport)}\n${short(tier.meals)}`,
      money(tier.price?.total),
      money(tier.price?.perPerson),
      short(terms.taxNote)
    ]), [58, 182, 88, 84, 95], { fontSize: 7.1, lineHeight: 10.2, after: 10 });
  paragraph('Quote statement: Prices are subject to supplier availability and final confirmation. Confirmed properties, meal services, tickets, darshan slots and transport will be stated in the approved booking confirmation.', { size: 8, after: 11 });

  heading('Inclusions, exclusions and payment', false, 245);
  table(['Included', 'Not included / payable directly'], [[
    (terms.inclusions || []).join('\n') || 'To be confirmed',
    (terms.exclusions || []).join('\n') || 'To be confirmed'
  ]], [252, 255]);
  table(['Field', 'Details'], [
    ['Payment schedule', short(terms.paymentSchedule)],
    ['Cancellation / change', short(terms.cancellationTerms)],
    ['Special notes', short(notes, 'None recorded')]
  ], [119, 388], { after: 12 });
  paragraph('For SreePayanam InterNational Pvt. Ltd.   |   Authorized signatory: ____________________   |   Customer acceptance: ____________________', { size: 7.7, after: 0 });

  if (pack) {
    for (let section = 2; section <= 13; section += 1) templateBlocks(section);
  }

  pages.forEach((page, index) => drawFooter(page, index + 1, pages.length));
  return pages;
};

const ascii = value => new TextEncoder().encode(value);
const escapePdf = value => String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const jpegBytes = canvas => {
  const base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
  const binary = atob(base64);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
};

const buildPdf = pages => {
  const objects = [];
  const add = parts => { objects.push(parts); return objects.length; };
  const pagesId = add([]);
  const pageIds = pages.map(page => {
    const image = jpegBytes(page.canvas);
    const imageId = add([ascii(`<< /Type /XObject /Subtype /Image /Width ${page.canvas.width} /Height ${page.canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`), image, ascii('\nendstream')]);
    const content = `q ${PAGE_WIDTH} 0 0 ${PAGE_HEIGHT} 0 0 cm /Im0 Do Q`;
    const contentId = add([ascii(`<< /Length ${ascii(content).length} >>\nstream\n${content}\nendstream`)]);
    const annotationIds = page.links.map(link => {
      const bottom = PAGE_HEIGHT - link.y - link.height;
      const top = PAGE_HEIGHT - link.y;
      return add([ascii(`<< /Type /Annot /Subtype /Link /Rect [${link.x} ${bottom} ${link.x + link.width} ${top}] /Border [0 0 0] /A << /S /URI /URI (${escapePdf(link.url)}) >> >>`)]);
    });
    const annotations = annotationIds.length ? ` /Annots [${annotationIds.map(id => `${id} 0 R`).join(' ')}]` : '';
    return add([ascii(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R${annotations} >>`)]);
  });
  objects[pagesId - 1] = [ascii(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)];
  const catalogId = add([ascii(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)]);
  const chunks = [ascii('%PDF-1.4\n%SreePayanam\n')];
  const offsets = [0];
  let position = chunks[0].length;
  const push = chunk => { chunks.push(chunk); position += chunk.length; };
  objects.forEach((parts, index) => {
    offsets.push(position);
    push(ascii(`${index + 1} 0 obj\n`));
    parts.forEach(push);
    push(ascii('\nendobj\n'));
  });
  const xrefOffset = position;
  push(ascii(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`));
  offsets.slice(1).forEach(offset => push(ascii(`${String(offset).padStart(10, '0')} 00000 n \n`)));
  push(ascii(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
  return new Blob(chunks, { type: 'application/pdf' });
};

export const buildStandardQuotationPdfBlob = quote => {
  if (!quote || quote.status !== 'Approved') throw new Error('The quotation has not been approved.');
  return buildPdf(renderQuotationPages(quote));
};

export const buildStandardTravelPackPdfBlob = (quote, pack) => {
  if (!quote || quote.status !== 'Approved' || pack?.status !== 'Finalized') throw new Error('The complete document pack is not finalized.');
  return buildPdf(renderQuotationPages(quote, pack));
};

export const downloadStandardTravelPackPdf = async (quote, pack) => {
  await document.fonts?.ready;
  const blob = buildStandardTravelPackPdfBlob(quote, pack);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SreePayanam_Standard_Travel_Documents_Pack_${String(quote.reference).replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
