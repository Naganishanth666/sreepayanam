# SreePayanam Planner UX Contract

## Scope and sources

This contract covers the public planner/route-brief workflow and the shared public shell. It records observable UI behavior; business policy remains in the API and package records.

| Concern | Source | Consequence in the UI |
|---|---|---|
| Destination guide and customer-selected places | Current task and public AI destination guide route (`backend/routes/aiRoutes.js`, `frontend/src/pages/AiAssistant.jsx`) | The customer enters any city, region or country; the planner requests a broad, searchable grouped guide for that destination and nearby vicinity. Published packages do not constrain discovery: customers can select any listed place or add their own before the travel desk curates the final route. |
| Time-aware route draft and route brief | Current task and structured planner route (`backend/routes/aiRoutes.js`, `frontend/src/pages/AiAssistant.jsx`, `frontend/src/utils/quotationPdf.js`) | The browser shows a geographic/time review with day/night totals, unplaced stops and suggestions; the PDF records the route brief and never includes commercial totals. |
| Internal commercial costing | Admin-only quotation route and costing engine (`backend/routes/quotationRoutes.js`, `backend/utils/costingEngine.js`) | Commercial previews are protected by admin authorization and are not requested by the public planner. |
| Customer enquiries | `backend/routes/enquiryRoutes.js`, `backend/models/Enquiry.js` | Public POST is rate-limited, validated and idempotent by route reference; reads and updates require admin authorization. |
| Admin/package changes | `backend/middleware/auth.js`, package routes | Admin-only mutations require `ADMIN_PASSWORD` or a valid admin JWT; no hard-coded fallback credential is accepted. |

## Canonical owners

- Navigation: `frontend/src/components/Navbar.jsx` and `.site-nav` styles.
- Home hero: `frontend/src/pages/LandingPage.jsx`, `frontend/src/data/heroSlides.js` and `.hero-carousel` styles. It is a twelve-slide package-style carousel with pause-on-hover/focus and manual controls.
- Form fields and validation: each product form owns the same `noValidate` + inline error + summary pattern; the new planner is the canonical customer route-brief flow.
- Select/date controls: native controls are intentional for standard browser-owned popup behavior. The destination list is a checkbox group, not a native multi-select.
- Toasts/status: persistent inline `role="status"`/`role="alert"` regions are used for the current app; no browser dialogs are allowed.
- Route brief mutation: pessimistic route-draft confirmation, then enquiry submission, then PDF download.

## Planner flow ledger

| Operation | Trigger | Pending | Success | Failure recovery | Focus |
|---|---|---|---|---|---|
| Advance step | Continue | Stable button with busy-free local transition | Next named step | Inline step error and first-invalid focus | First field in next step |
| Prepare route draft | Continue from comfort | Stable busy button, preserve form | Time-aware route review with day/night totals and suggested changes | Degraded local draft remains visible; keep fields and retry | Route review |
| Send enquiry | Send route enquiry / retry | Stable busy button | Confirmation copy and route-brief download | Draft remains available; retry send without rebuilding | Success heading |
| Download PDF | Download route brief | Logo preparation and file generation | Structured `.pdf` route brief with no commercial totals | Keep draft visible; offer download again | Download button |
| Back step | Back | None | Prior step with selections retained | N/A | Prior step heading |

## Required states

- Empty: no package/destination selected; explain the next action.
- Loading: package catalogue fetch retains the curated local catalog and shows a stable status line.
- Error: API failures are described without raw stack traces and provide Retry where safe.
- Offline/degraded: form input remains available; the app does not claim the enquiry was sent or the route draft is final until the server confirms.
- Success: route reference, timing status, selected/planned places and the day-by-day route remain visible; commercial details stay separate.
- Reduced motion: step transitions and route-stop movement become immediate/opacity-only.

## Data and safety behavior

- Date-derived days and nights are calculated from date-only values, stored in the planner payload and sent in `detailedPreferences` with the route review status. The public planner does not display or request commercial totals.
- `quoteReference` makes a repeated enquiry submission idempotent; it prevents accidental duplicate leads after an uncertain response.
- Supplier cost, markup amount, customer price, tax, internal notes, raw backend errors, authentication tokens and payment secrets are never placed in the customer UI or route-brief PDF. Internal quotation previews require admin authorization.
- Date-only values remain date-only; no timezone conversion is applied to travel dates.
- Package cancellation/terms copy remains package-controlled. The planner does not invent legal wording.
