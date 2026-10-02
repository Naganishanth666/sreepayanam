const template = require('../../shared/standardTravelPack.json');

const keyForCell = (blockId, row, column) => `${blockId}:${row}:${column}`;
const keyForParagraph = blockId => `p:${blockId}`;
const unfinished = value => !String(value || '').trim()
  || /\[[^\]]*\]|_{3,}|\bto be confirmed\b|\btbc\b/i.test(String(value))
  || (String(value).includes('☐') && !String(value).includes('☒') && !/^n\/?a$/i.test(String(value).trim()));

const requiredFields = quote => {
  const result = [];
  for (const block of template.blocks) {
    if (block.section < 2 || block.section > 12) continue;
    if (block.type === 'paragraph') {
      if (block.editable) result.push({ key: keyForParagraph(block.id), section: block.section, label: block.text.slice(0, 100) });
      continue;
    }
    if (block.id === 97) {
      const days = Math.max(3, quote?.route?.itinerary?.length || 0);
      for (let row = 1; row <= days; row += 1) {
        for (let column = 0; column < 5; column += 1) {
          result.push({ key: keyForCell(block.id, row, column), section: block.section, label: `Final itinerary day ${row}, column ${column + 1}` });
        }
      }
      continue;
    }
    block.editable.forEach((row, rowIndex) => row.forEach((editable, columnIndex) => {
      if (editable) result.push({
        key: keyForCell(block.id, rowIndex, columnIndex),
        section: block.section,
        label: `${block.rows[0]?.length === 2 && columnIndex === 1 ? block.rows[rowIndex]?.[0] : block.rows[0]?.[columnIndex] || 'Field'} (table ${block.id}, row ${rowIndex})`
      });
    }));
  }
  return result;
};

const sanitizeFields = (raw, quote) => {
  const allowed = new Set(requiredFields(quote).map(item => item.key));
  const fields = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fields;
  for (const [key, value] of Object.entries(raw)) {
    if (allowed.has(key) && typeof value === 'string') fields[key] = value.replace(/[<>]/g, '').trim().slice(0, 2000);
  }
  return fields;
};

const completionProblems = (quote, pack) => {
  const problems = [];
  if (quote?.status !== 'Approved') problems.push('The linked quotation must be approved first.');
  for (const section of Array.from({ length: 12 }, (_, index) => index + 1)) {
    if (!pack.completedSections?.includes(section)) problems.push(`Mark document ${String(section).padStart(2, '0')} complete after review.`);
  }
  for (const item of requiredFields(quote)) {
    if (unfinished(pack.fields?.[item.key])) problems.push(`Complete document ${String(item.section).padStart(2, '0')}: ${item.label}.`);
  }
  const checks = pack.checks || {};
  if (!checks.accountantReviewed) problems.push('An accountant must review the tax documents and tax treatment.');
  if (!checks.paymentVerified) problems.push('Verify receipt and payment records.');
  if (!checks.suppliersConfirmed) problems.push('Confirm supplier evidence and booking services.');
  if (!checks.reconciliationReviewed) problems.push('Review the reconciliation and internal accounts sections.');
  return problems;
};

module.exports = { template, keyForCell, keyForParagraph, requiredFields, sanitizeFields, completionProblems, unfinished };
