# SreePayanam Planner UX Contract

## Scope and sources

This contract covers the public planner/route-brief workflow, the shared public shell, and the admin account directory. It records observable UI behavior; business policy remains in the API and package records.

| Concern | Source | Consequence in the UI |
|---|---|---|
| Destination guide and customer-selected places | Current task and public AI destination guide route (`backend/routes/aiRoutes.js`, `frontend/src/pages/AiAssistant.jsx`) | The customer enters any city, region or country; the planner requests a concise, searchable grouped set of suggested places. Published packages do not constrain discovery: customers can select any listed place or add their own before the travel desk verifies and curates the final route. A practical suggested shortlist is selected initially, based on trip length. |
| Time-aware route draft and route brief | Revised SRS 1.1, structured planner route, and the customer's approved hotel-estimate request (`backend/routes/aiRoutes.js`, `frontend/src/pages/AiAssistant.jsx`, `frontend/src/utils/quotationPdf.js`) | The browser shows a geographic/time review with day/night totals, selected stops placed and suggestions; the public PDF records the route brief without package totals. Publicly sourced hotel room/night estimates may appear with an indicative label, date and link. AI alternatives remain suggestions and are not silently inserted as customer-selected stops. |
| Approved tour quotation and combined document pack | Revised SRS 1.1, all twelve sections of the supplied Standard Travel Documents Pack, and quotation route (`backend/routes/quotationRoutes.js`) | Admin staff copy the saved enquiry route, edit the day plan and entry-window status, record destination links and verified tier costs, and enter approved commercial wording. A named Admin account approves and locks the quotation, which can then be downloaded separately from its approved card. Staff then complete the eleven remaining templates in the same admin enquiry, including financial and supplier records. A named Admin finalizes the completed pack before its single PDF download unlocks. |
| Internal commercial costing | Admin-only quotation route and costing engine (`backend/routes/quotationRoutes.js`, `backend/utils/costingEngine.js`) | Commercial previews are protected by admin authorization and are not requested by the public planner. |
| Customer enquiries | `backend/routes/enquiryRoutes.js`, `backend/models/Enquiry.js` | Public POST is rate-limited, validated and idempotent by route reference; reads and updates require admin authorization. |
| Admin/package changes | `backend/middleware/auth.js`, package routes | Admin-only mutations require `ADMIN_PASSWORD` or a valid admin JWT; no hard-coded fallback credential is accepted. |
| Admin account directory | `backend/routes/adminRoutes.js`, `backend/models/User.js` | The admin can search and page through registered accounts and approve or revoke Agent access. Password hashes are never returned; role changes and account deletion are outside this workflow. |

## Canonical owners

- Navigation: `frontend/src/components/Navbar.jsx` and `.site-nav` styles.
- Package destination references: `backend/models/Package.js` stores staff-entered HTTPS source links, and `frontend/src/pages/PackageDetails.jsx` presents their type and last-check date.
- Home hero: `frontend/src/pages/LandingPage.jsx`, `frontend/src/data/heroSlides.js` and `.hero-carousel` styles. It is a twelve-slide package-style carousel with pause-on-hover/focus and manual controls.
- Form fields and validation: each product form owns the same `noValidate` + inline error + summary pattern; the new planner is the canonical customer route-brief flow.
- Select/date controls: native controls are intentional for standard browser-owned popup behavior. The destination list is a checkbox group, not a native multi-select.
- Toasts/status: persistent inline `role="status"`/`role="alert"` regions are used for the current app; no browser dialogs are allowed.
- Route brief mutation: pessimistic route-draft confirmation, then enquiry submission, then PDF download.
- Hotel research: the public planner and staff quotation desk share a short property shortlist. Public room/night figures are indicative and linked to public listings; staff must independently verify availability, dates, taxes, occupancy and supplier costs. Selecting a hotel updates the request, not the internal cost fields.
- Quotation mutation: an Admin console may save a draft from the enquiry snapshot. Approval requires a named Admin JWT, complete reference and supplier evidence, explicit source verification, and a review note. The approved version is immutable; a later revision receives a new version number. Each approved card has a PDF download action. Only approved quotation data can reach that PDF generator, and it excludes direct supplier costs.
- Document pack mutation: only a named Admin account can load, edit, finalize or download the combined pack. The UI stores staff-entered values for every editable DOCX field, requires explicit review of all twelve sections plus tax, payment, supplier and reconciliation checks, and locks the pack on finalization. The one PDF follows the original section order. The public planner cannot access it.
- Admin account directory: server-paginated account list with committed search and role/approval filters. Agent approval is a server-confirmed, pessimistic mutation; Customer/Admin roles are displayed read-only until a separate role-management policy exists.

## Planner flow ledger

| Operation | Trigger | Pending | Success | Failure recovery | Focus |
|---|---|---|---|---|---|
| Advance step | Continue | Stable button with busy-free local transition | Next named step | Inline step error and first-invalid focus | First field in next step |
| Prepare route draft | Continue from comfort | Stable busy button, preserve form | Time-aware route review with day/night totals and suggested changes | Degraded local draft remains visible; keep fields and retry | Route review |
| Send enquiry | Send route enquiry / retry | Stable busy button | Confirmation copy and route-brief download | Draft remains available; retry send without rebuilding | Success heading |
| Download PDF | Download standard-format route draft | Font and logo preparation, then file generation | Branded `.pdf` in the DOCX quotation table layout, with day-by-day hotel planning and indicative public nightly estimates where sourced; no package total | Keep draft visible; offer download again | Download button |
| Back step | Back | None | Prior step with selections retained | N/A | Prior step heading |

## Required states

- Empty: no package/destination selected; explain the next action.
- Loading: package catalogue fetch retains the curated local catalog and shows a stable status line.
- Error: API failures are described without raw stack traces and provide Retry where safe.
- Offline/degraded: form input remains available; the app does not claim the enquiry was sent or the route draft is final until the server confirms.
- Success: route reference, timing status, selected/planned places and the day-by-day route remain visible; commercial details stay separate.
- Admin accounts: loading retains the directory frame, empty and no-results states explain the next action, server failures keep filters and provide retry, and approval actions show a busy state until the server confirms the change.
- Admin enquiries: entering the CRM tab fetches the current lead list, and a visible Refresh enquiries control fetches it again without requiring a page reload or another password sign-in.
- Reduced motion: step transitions and route-stop movement become immediate/opacity-only.

## Data and safety behavior

- Date-derived days and nights are calculated from date-only values, stored in the planner payload and sent in `detailedPreferences` with the route review status. The public planner does not display or request commercial totals.
- `quoteReference` makes a repeated enquiry submission idempotent; it prevents accidental duplicate leads after an uncertain response.
- Supplier cost, markup amount, customer price, tax, internal notes, raw backend errors, authentication tokens and payment secrets are never placed in the customer UI or route-brief PDF. Internal quotation previews require admin authorization.
- Planner enquiries record the consent version and source; their saved route draft provides the day plan for staff review. The route draft is unverified AI/customer input. A quote approval requires staff to review timing and any unplaced stops.
- The planner captures a return point and requested darshan or entry windows. AI labels opening hours and slots as needing official-source confirmation; staff can edit each day's entry-window status before approval. The approved PDF carries traveller ages, rooms, meal and vehicle preferences from the enquiry snapshot.
- The supplied DOCX is the visual and wording source for the public draft, approved quotation and combined pack. Its embedded SreePayanam logo appears on every PDF page. The public draft uses the quotation layout with explicit pending commercial fields; its map-search links are marked unverified. Staff must replace bracketed fields with verified values in the pack; the app does not infer GST treatment, received funds, supplier confirmation or bank matches from AI output. The combined PDF remains unavailable while required fields or section checks are unfinished.
- Default new-quote pricing is direct verified cost plus 10% contingency, then 40% markup and an approved 5% promotional discount. Approval requires active offer dates and a management-approved minimum selling price for each tier. GST remains separate and requires accountant-approved wording. Existing historical quotation snapshots are not silently repriced; public package pages expose no prices.
- Date-only values remain date-only; no timezone conversion is applied to travel dates.
- Package cancellation/terms copy remains package-controlled. The planner does not invent legal wording.
