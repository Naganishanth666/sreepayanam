# SreePayanam SRS v1.5 implementation status

Source: `SreePayanam_Tours_Travels_SRS_v1.5 041026.pdf` (base v1.4, pages 1–20, plus superseding v1.5 addendum, pages 21–24). Reviewed 4 October 2026.

## Delivered in this change

| Requirement | Implementation |
|---|---|
| More usable day plans (FR-PLN-03 / §14.3) | Planner accepts optional day-one arrival and final departure times. The server creates dated, ordered clock blocks for hotel arrival/departure, transfers, each selected visit, lunch/rest and return. It removes stops that cannot fit the proposed day and flags them in route review. Client review, saved enquiry, admin editor, branded draft PDF and approved quote PDF carry the sequence. If AI grouping fails, the server still returns a clearly labelled provisional timed sequence. Every window and transfer allowance is provisional until staff verifies routing and official entry hours. |
| Customer choice for nearby stops (§14.3) | Discovered places start unselected. Travellers opt in by checkbox or by explicitly selecting the suggested shortlist. AI alternatives are not silently added. |
| Shareable road-route fallback (§14.3) | Each planned day opens an ordered Google Maps driving-directions URL, and the PDF carries that link. This does **not** claim in-app routing distances, a verified map, or live traffic. |
| Internal formula (FR-PRC-02) | New tier quotations and package costing use 10% contingency, then `ceil(buffered cost / 0.65)` for the 35% pre-tax gross-margin target. Automatic 5% discounts were removed. Taxes remain separate. Server approval checks a tier against its cost-supported margin floor and management-entered minimum price. Historical approved quote snapshots are unchanged. |
| Price-free package inquiry (§14.2) | Public package pages already omit stored commercial amounts. The catalogue CTA now says **Request for price** and opens the selected package's prefilled enquiry form. New catalogue drafts no longer require a numeric price; the AI catalogue generator cannot create a special offer automatically. |
| Catalogue review workflow (§14.2) | New packages save as Draft. The admin editor records journey time/distance notes, accessibility, season constraints, image rights and content reviewer/date. A Draft cannot become Approved/Published until the existing day plans, references, meals, terms and those review fields are complete. Admin shows each category's listed count against the 50 minimum. Existing published packages remain visible pending a separate content audit. |

## Still required for full v1.5 acceptance

| Requirement | Current gap / dependency |
|---|---|
| 50–70 distinct, reviewed packages in **each** of 12 categories | The site can hold and count them, but the 600–840 original package briefs, checked routes, licensed images and operational reviews have not been supplied. Existing packages need the new metadata audited. No synthetic or duplicated packages were created to inflate counts. |
| English and Tamil end to end | No approved Tamil translations, glossary, policy/document wording or translation provider configuration is present. Existing navigation, forms, notifications, quotation and combined PDF remain English. A locale selector alone would imply support that the full customer journey cannot yet deliver. |
| Licensed road map, leg/total distances, drive times and detour data | No approved Maps/Routes API credential or map licence is configured. The clock blocks use clearly labelled planning allowances; the Google Maps URL lets travellers check a live route separately. The site does not yet ingest or display verified road legs or an in-app map. Official attraction hours and season/darshan windows also need verified source records. |
| Material route changes and customer acceptance | The enquiry and quotation preserve drafts and approved quote versions, but there is no customer acceptance record for subsequent route changes. |
| Booking document workflow (§14.4) | Existing named-Admin quotation approval and combined-pack finalization gate admin downloads. There is no fully confirmed-booking service ledger, applicable-document generation by booked service, per-document approver assignment/delegation/rejection, customer portal release, expiring document links or send-channel audit. |
| Broader base SRS v1.4 | Supplier integrations, accounting/tax configuration, confirmed-booking operations, payments, MFA and other phase 2–4 requirements remain outside this change; see earlier status files and the base SRS for the full programme. |

## Verification

Backend unit/integration suite, frontend production build and frontend lint passed locally during this implementation. Live map routing and Tamil-language acceptance cannot be verified until the approved provider setup and reviewed content are supplied.
