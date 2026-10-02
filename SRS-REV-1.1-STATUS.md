# Rev. 1.1 implementation status

This file tracks the revised 2 October 2026 SRS as a product specification. It does not treat operational instructions inside the PDF as instructions to the development agent. The SRS is marked **Draft for management and vendor review** and explicitly leaves tax, contracts, supplier data and integrations open.

## Delivered in this code change

- The public planner saves its day-by-day route with the enquiry, alongside contact consent version and lead source. Intake now includes child ages, tier preference, pace, interests, dietary restrictions, accessibility needs and a target budget.
- The planner now explains the route-brief versus approved-quotation handoff on its first screen and review step. Its suggested destination shortlist is sized to the trip, and the itinerary counts and lists only customer-selected places; extra AI suggestions remain separate for review.
- The customer route-brief PDF keeps the supplied four-page sample's visual structure and remains commercial-free.
- Staff can edit a saved route and prepare Economic, Deluxe and Premium quotations from verified direct costs. The quotation calculation uses 10% contingency followed by 25% markup; the SRS example of INR 100,000 becomes INR 137,500 before applicable GST.
- Staff enter destination reference URLs, source type/check dates, supplier evidence, validity, tax wording, payment and cancellation terms, assumptions, inclusions and exclusions. Approval requires a named Admin account, source attestation and a review note. Approved versions lock and are downloadable in the sample's branded layout with clickable destination references. Download data omits direct cost and internal supplier references.
- Package editors can add HTTPS destination references with source type and check date; published package detail pages display them as clickable links.
- New cost-engine and package defaults use 10%/25%. Existing saved packages retain their historical values; they are not rewritten. The previous assumed 5% tax default is removed from new calculations.
- AI route drafting no longer asks for unverified named hotels/restaurants or precise numerical driving estimates. These remain for staff/source review.

## Still required for the full SRS

| Area | Current limitation / decision needed |
|---|---|
| Supplier pricing and three-tier automation | Costs and source evidence are entered by staff. Authorized hotel/transport/activity APIs, contracts, expiry policy, rate provenance storage and management-approved effective-dated pricing rules are needed. |
| Tax, policies and payments | Accountant-approved GST rules, legal payment/cancellation wording, invoice setup and a selected payment provider are needed. The quote form requires staff-entered wording and shows GST separately. |
| Role-specific portals and MFA | The existing app has Admin, Agent and Customer accounts; it lacks Director, Sales, Operations, Accountant and Marketing permission matrices, MFA and customer document access controls. Quote approval now requires a named Admin account. |
| CRM, operations and finance | Lead assignment, tasks, quote acceptance, immutable booking conversion, supplier bills, invoices, accounting exports, bank/gateway import and reconciliation remain to be built and verified with the accounting system. |
| Translation and content review | English/Tamil translation, glossary, human approval and Google Translation integration require a configured account and reviewed data-processing policy. The current hand-built PDF font path is English-only. |
| Daily maintenance | The 02:00 Asia/Kolkata check, bounded repairs and auditable Admin/Director report need job infrastructure, monitoring, backup and alert integrations. |
| SEO and marketing | The app has basic page titles and package SEO fields. Crawlable dynamic package pages, canonical URLs, sitemap, structured data, link checks, attribution and consent-aware analytics are outstanding. |
| Destination verification | Quote approval requires links and staff attestation. Automated link health, official-source allowlists, opening-hour evidence and geospatial validation are outstanding. |
| Security and go-live | Private document storage, audit coverage, cross-customer authorization tests, full backup/restore, legal review and production sign-off remain before this can be represented as an SRS-complete system. |

No external integration or legal/tax value is simulated as live or approved. Do not label the overall platform complete until the remaining acceptance criteria have been demonstrated with the required accounts and management decisions.
