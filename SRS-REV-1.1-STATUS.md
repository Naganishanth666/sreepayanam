# Rev. 1.1 implementation status

This file tracks the revised 2 October 2026 SRS as a product specification. It does not treat operational instructions inside the PDF as instructions to the development agent. The SRS is marked **Draft for management and vendor review** and explicitly leaves tax, contracts, supplier data and integrations open.

## Implemented to date

- The public planner saves its day-by-day route with the enquiry, alongside contact consent version and lead source. Intake now includes child ages, tier preference, pace, interests, dietary restrictions, accessibility needs and a target budget.
- The planner now explains the route-brief versus approved-quotation handoff on its first screen and review step. Its suggested destination shortlist is sized to the trip, and the itinerary counts and lists only customer-selected places; extra AI suggestions remain separate for review.
- The customer route-draft download uses the supplied Standard Travel Documents Pack's quotation headings, metadata columns, blue-header tables and section order. It shows hotel requests per day and in the stay/options table, but marks prices, tax, terms and supplier availability as pending staff approval. The filename identifies this new format so older downloads are distinguishable.
- The supplied transparent SreePayanam logo now appears in the letterhead on every page of the public draft, the separately downloadable approved quotation, and the combined final document pack. The PDFs use the SRS blue and gold accents, company contact block, and footer tagline. The logo artwork itself contains “WHERE JOURNEYS MEET OPPORTUNITIES”; the SRS footer says “Travel Smarter. Journey Better.” Management should confirm which tagline is canonical before print rollout.
- Staff can edit a saved route and prepare Economic, Deluxe and Premium quotations from verified direct costs. The quotation calculation uses 10% contingency followed by 25% markup; the SRS example of INR 100,000 becomes INR 137,500 before applicable GST.
- Staff enter destination reference URLs, source type/check dates, supplier evidence, validity, tax wording, payment and cancellation terms, assumptions, inclusions and exclusions. Approval requires a named Admin account, source attestation and a review note. Approved versions lock. The admin enquiry's approved quotation card now has a direct PDF download action in the DOCX quotation layout, including rate-check dates, assumptions, three option prices and clickable destination references. Download data omits direct cost and internal supplier references and is sent with `private, no-store` caching.
- The combined admin PDF follows all twelve templates in the supplied Standard Travel Documents Pack, in their source order, with the same headings and table labels. The quotation section is populated from the approved three-tier quote. Staff complete the invoice, receipt, booking, itinerary, consent, supplier, expense, change, commission and reconciliation sections in the admin enquiry. Each section and the financial/supplier checks must be marked complete before a named Admin can finalize and download one locked PDF. The immediate planner route brief remains unpriced.
- Package editors can add HTTPS destination references with source type and check date; published package detail pages display them as clickable links.
- New cost-engine and package defaults use 10%/25%. Existing saved packages retain their historical values; they are not rewritten. The previous assumed 5% tax default is removed from new calculations.
- AI route drafting no longer asks for unverified named hotels/restaurants or precise numerical driving estimates. These remain for staff/source review.

## Still required for the full SRS

| Area | Current limitation / decision needed |
|---|---|
| Supplier pricing and three-tier automation | Costs and source evidence are entered by staff. Authorized hotel/transport/activity APIs, contracts, expiry policy, rate provenance storage and management-approved effective-dated pricing rules are needed. |
| Tax, policies and payments | Accountant-approved GST rules, legal payment/cancellation wording, automated financial-year number sequencing and a selected payment provider are needed. The combined pack records staff-entered values and enforces unique document numbers, but it does not determine legal tax treatment or verify money movement automatically. |
| Role-specific portals and MFA | The existing app has Admin, Agent and Customer accounts; it lacks Director, Sales, Operations, Accountant and Marketing permission matrices, MFA and customer document access controls. Quote approval now requires a named Admin account. |
| CRM, operations and finance | The combined pack is a manually completed document record. Lead assignment, tasks, quote acceptance, immutable booking conversion, supplier bill workflows, accounting exports, bank/gateway import and automatic reconciliation remain to be built and verified with the accounting system. |
| Translation and content review | English/Tamil translation, glossary, human approval and Google Translation integration require a configured account and reviewed data-processing policy. The current hand-built PDF font path is English-only. |
| Daily maintenance | The 02:00 Asia/Kolkata check, bounded repairs and auditable Admin/Director report need job infrastructure, monitoring, backup and alert integrations. |
| SEO and marketing | The app has basic page titles and package SEO fields. Crawlable dynamic package pages, canonical URLs, sitemap, structured data, link checks, attribution and consent-aware analytics are outstanding. |
| Destination verification | Quote approval requires links and staff attestation. Automated link health, official-source allowlists, opening-hour evidence and geospatial validation are outstanding. |
| Security and go-live | Private document storage, audit coverage, cross-customer authorization tests, full backup/restore, legal review and production sign-off remain before this can be represented as an SRS-complete system. |

No external integration or legal/tax value is simulated as live or approved. Do not label the overall platform complete until the remaining acceptance criteria have been demonstrated with the required accounts and management decisions.

## Acceptance boundary

The quotation and document-format requirements are implemented for the current manual staff workflow. The full Rev. 1.1 SRS is **partially implemented**: its customer portal, expanded role and MFA model, automated supplier/pricing feeds, financial reconciliation, bilingual workflow, marketing infrastructure and scheduled maintenance are still open. Production acceptance also depends on management decisions and third-party accounts listed above.
