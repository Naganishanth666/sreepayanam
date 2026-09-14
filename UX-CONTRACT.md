# SreePayanam Planner UX Contract

## Scope and sources

This contract covers the public planner/quotation workflow and the shared public shell. It records observable UI behavior; business policy remains in the API and package records.

| Concern | Source | Consequence in the UI |
|---|---|---|
| Destination guide and customer-selected places | Current task and public AI destination guide route (`backend/routes/aiRoutes.js`, `frontend/src/pages/AiAssistant.jsx`) | The customer enters any city, region or country; the planner requests a broad, searchable grouped guide for that destination and nearby vicinity. Published packages do not constrain discovery: customers can select any listed place or add their own before the travel desk curates the final route. |
| Customer estimate and PDF quotation | Current task and costing engine (`backend/utils/costingEngine.js`) | The browser shows a planning estimate; `/api/quotations/preview` is authoritative before a PDF is offered. |
| 30% pricing instruction | Current task / prior conversation reference | Server calculation uses a fixed 30% markup on landed cost and 5% estimated tax. The PDF calls it an estimate and does not expose supplier cost or profit. Confirm true margin policy before commercial launch. |
| Customer enquiries | `backend/routes/enquiryRoutes.js`, `backend/models/Enquiry.js` | Public POST is rate-limited, validated and idempotent by quote reference; reads and updates require admin authorization. |
| Admin/package changes | `backend/middleware/auth.js`, package routes | Admin-only mutations require `ADMIN_PASSWORD` or a valid admin JWT; no hard-coded fallback credential is accepted. |

## Canonical owners

- Navigation: `frontend/src/components/Navbar.jsx` and `.site-nav` styles.
- Home hero: `frontend/src/pages/LandingPage.jsx`, `frontend/src/data/heroSlides.js` and `.hero-carousel` styles. It is a twelve-slide package-style carousel with pause-on-hover/focus and manual controls.
- Form fields and validation: each product form owns the same `noValidate` + inline error + summary pattern; the new planner is the canonical customer quote flow.
- Select/date controls: native controls are intentional for standard browser-owned popup behavior. The destination list is a checkbox group, not a native multi-select.
- Toasts/status: persistent inline `role="status"`/`role="alert"` regions are used for the current app; no browser dialogs are allowed.
- Quote mutation: pessimistic server confirmation, then enquiry submission, then PDF download.

## Planner flow ledger

| Operation | Trigger | Pending | Success | Failure recovery | Focus |
|---|---|---|---|---|---|
| Advance step | Continue | Stable button with busy-free local transition | Next named step | Inline step error and first-invalid focus | First field in next step |
| Preview quote | Generate quotation | Stable busy button, preserve form | Server quote + estimate panel | Persistent form alert; retain all fields and retry | Quote heading |
| Send enquiry | Generate quotation / retry | Stable busy button | Confirmation copy and quote download | Quote remains available; retry send without recalculating | Success heading |
| Download PDF | Download quotation | Synchronous client action | `.pdf` file | Keep quote visible; offer download again | Download button |
| Back step | Back | None | Prior step with selections retained | N/A | Prior step heading |

## Required states

- Empty: no package/destination selected; explain the next action.
- Loading: package catalogue fetch retains the curated local catalog and shows a stable status line.
- Error: API failures are described without raw stack traces and provide Retry where safe.
- Offline/degraded: form input remains available; the app does not claim the enquiry was sent or the quote is final until the server confirms.
- Success: quote reference, customer price, tax, selected places and the final estimate caveat remain visible.
- Reduced motion: step transitions and route-stop movement become immediate/opacity-only.

## Data and safety behavior

- Customer price is calculated server-side with bounded numeric inputs. Client-only values are display hints, not financial authority.
- `quoteReference` makes a repeated enquiry submission idempotent; it prevents accidental duplicate leads after an uncertain response.
- Supplier cost, markup amount, internal notes, raw backend errors, authentication tokens and payment secrets are never placed in the customer PDF.
- Date-only values remain date-only; no timezone conversion is applied to travel dates.
- Package cancellation/terms copy remains package-controlled. The planner does not invent legal wording.
