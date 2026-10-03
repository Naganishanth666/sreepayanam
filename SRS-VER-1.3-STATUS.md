# SRS v1.3 implementation status

Source: `SreePayanam_Tours_Travels_SRS Ver1.3 031026.pdf`, dated 3 October 2026. This document is an implementation audit, not a claim that the draft SRS has been fully delivered. `Done` means the stated slice can be exercised in this repository; `Partial` means the remaining acceptance points are listed; `Open` means a required subsystem is absent.

## Shipped in this update

- Replaced the grey-backed header/footer image with the exact transparent supplied SreePayanam logo and enlarged its responsive display. The existing route brief, approved quotation and combined document PDF already use this transparent logo on each page.
- Removed package amounts, discounts and old priced brochure links from public package API responses, cards and detail pages. Visitors request a tailored quotation without logging in.
- Added all twelve public catalogue categories, admin category assignment, paging, seasonal visibility and reversible archive/restore. Existing package types map into the new categories.
- Added nine public service detail/request pages and CRM lead creation. Requests say when provider/authority decisions and inventory require confirmation.
- Added the SRS package enquiry fields, consent, selected destinations, a CRM reference and minimal WhatsApp buttons for both specified numbers. Package enquiries now carry a staff-review route snapshot into the existing admin quotation desk.
- Changed new staff quote drafts to 10% contingency, 40% markup and 5% discount. Approval checks the offer window, approved minimum selling price, supplier evidence and market-comparable evidence or a provisional explanation. Approved PDFs disclose the offer dates; internal costs stay out of download data.
- Retired the legacy direct package checkout, which used package prices and a hardcoded tax amount. Existing booking records and admin controls remain available.

## Requirement-by-requirement audit

| ID | State | Remaining acceptance points |
| --- | --- | --- |
| FR-WEB-01 | Partial | Responsive core pages exist; FAQ, blog/travel guides and full policy publishing are incomplete. |
| FR-WEB-02 | Partial | Category, destination, style, duration sort and paging exist; season/budget/availability filters and curated controls need work. |
| FR-WEB-03 | Partial | Price-free detail, itinerary, images and references exist; tier scope, reviews, rights metadata and season/confirmation notes are incomplete. |
| FR-WEB-04 | Open | Tamil fields, translations and a persistent language switch are absent. |
| FR-CAT-01 | Done | Twelve browseable category choices are present; categories with no package explain that customers can enquire. |
| FR-CAT-02 | Partial | Admin packages, assignment, search, paging, season and archive/restore exist; a full approval/published/expired workflow and server-side scale controls remain. |
| FR-CAT-03 | Partial | Staff can enter three comparisons and see a median; automatic source research, comparability checks and freshness rules remain. |
| FR-CAT-04 | Partial | Package references drive place checkboxes and custom place entry; category-wide destination CMS and richer activity grouping remain. |
| FR-CAT-05 | Partial | Detail references and day plans exist; each stop's included/optional and confirmed/indicative status is incomplete. |
| FR-PLN-01 | Partial | Core dates, group, room, meal, budget and accessibility intake exists; complete flexibility and validated travel needs require review. |
| FR-PLN-02 | Partial | Planner place choice exists; package/area/priority grouping and search need completion. |
| FR-PLN-03 | Partial | Day plans and staff edits exist; reliable distance, visit-duration and opening-window verification need live sources. |
| FR-PLN-04 | Partial | Meal requests exist; approved restaurant sources and checked timestamps are absent. |
| FR-PLN-05 | Partial | Three staff quotation tiers exist; AI-generated, line-item tier differences need verified inputs. |
| FR-PRC-01 | Partial | Internal cost components and per-person totals exist; line-item owner, currency conversion timestamp and full air/visa/service-charge accounting remain. |
| FR-PRC-02 | Partial | Default arithmetic and offer dates are enforced for new staff quotes; configurable product/season rules and audited rule changes remain. |
| FR-PRC-03 | Partial | Public package screens/API are price-free; every marketing asset and brochure still needs a content audit. |
| FR-PRC-04 | Partial | Supplier reference and check date are saved; full source type, taxes, occupancy, confidence and expiry metadata remain. |
| FR-PRC-05 | Partial | Named Admin quote approval and immutable approved versions exist; supplier availability and tax verification require staff process. |
| FR-PRC-06 | Partial | Fixed discount, date and floor guards exist; scoped offers, override approval and full rule audit trail remain. |
| FR-CRM-01 | Partial | Website, planner and service requests create CRM leads with reference/source/consent; normalized contact deduplication and channel/API integrations remain. |
| FR-CRM-03 | Done | Package request captures the stated customer, trip, tier, meal, destination and consent fields without passport, card or medical uploads. |
| FR-CRM-02 | Partial | CRM status, notes and assignment exist; configurable stages, reminders, lost reason and SLA alerts remain. |
| FR-CRM-04 | Open | No unified customer record links all communications, finance, documents and support cases. |
| FR-AI-01 | Partial | Planner/chat exist; approved-source-only grounding and internal citations need a controlled knowledge base. |
| FR-AI-02 | Partial | Prompts and route draft label uncertainty; end-to-end verification of all generated claims remains. |
| FR-OPS-01 | Open | Supplier contracts, rate agreements, service areas and reliability records are absent. |
| FR-OPS-02 | Partial | Basic booking records exist; supplier confirmations, manifest, rooming, tickets and vouchers are not integrated. |
| FR-OPS-03 | Open | End-to-end change and cancellation case workflow is absent. |
| FR-ACC-01 | Partial | Quote/document pack fields exist; accountant-controlled invoice, receipt, credit and refund ledgers are absent. |
| FR-ACC-02 | Open | Supplier bills, advances, payables and allocation are absent. |
| FR-ACC-03 | Open | Gateway/bank matching, partial payments and unmatched queues are absent. |
| FR-ACC-04 | Open | Approved profitability/export accounting workflow is absent. |
| FR-PORT-01 | Partial | Login and booking views exist; own enquiries, quotes, documents, payments and support are incomplete. |
| FR-DOC-01 | Partial | Branded route brief, approved quote and combined pack PDFs exist; standalone voucher, cancellation and role-based document access remain. |
| FR-DOC-02 | Partial | Route structure, review flags, day plan and destination links exist; every timing source needs staff verification. |
| FR-DOC-03 | Partial | Three priced tiers and approval exist; accountant-approved GST/tax policy and commercial acceptance flow remain. |
| FR-NTF-01 | Partial | CRM record and two WhatsApp click-to-chat links exist. Email requires production SMTP credentials; automated WhatsApp requires an approved provider and consent/delivery integration. |
| FR-ADM-01 | Partial | Package/day plan/price and reference editing exists; localized content, offer rules, service-form and brochure CMS are absent. |
| FR-ADM-03 | Partial | Staff sees comparables, median, formula, period and named approval; full source freshness and authorized pricing-rule governance remain. |
| FR-SVC-01 | Partial | Nine discoverable pages with scoped enquiry fields and caveats exist; document guidance, full terms and automatic service/region assignment remain. |
| FR-BRO-01 | Open | Nine editable bilingual masters, print PDFs, digital brochures and versioned approval CMS are not built. |
| FR-ADM-02 | Partial | Quote version/approver exists; complete immutable audit queue for refunds, roles, finance and document access is absent. |
| FR-DST-01 | Partial | Public package and PDF references exist; a full governed destination record for every stop is absent. |
| FR-DST-02 | Partial | Planner flags unplaced stops; geography, duplicate alias, backtracking and opening-window checks need verified routing data. |
| FR-TRN-01 | Open | Google Translation, Tamil glossary and human approval are absent. |
| FR-MKT-01 | Partial | Basic title/meta fields exist; localized URLs, canonical, sitemap, redirects, structured data and previews need work. |
| FR-MKT-02 | Open | UTM attribution, consent segments, templates, calendar, analytics and Google Business Profile integration are absent. |
| FR-MKT-03 | Open | Indexing, link, metadata, speed and conversion monitoring/reporting are absent. |
| FR-SEC-01 | Partial | Some route guards and data limits exist; MFA, least-privilege roles, rate limits, audit, backups and recovery need a security program. |
| FR-MNT-01 | Open | No daily 02:00 Asia/Kolkata health-check job with run records. |
| FR-MNT-02 | Open | No approved reversible-repair catalogue/worker. |
| FR-MNT-03 | Open | No daily maintenance report for Admin/Directors. |
| FR-MNT-04 | Open | No staged update/ticket/rollback approval workflow. |
| FR-REC-01 | Open | No bank/gateway import and account reconciliation. |
| FR-REC-02 | Open | No unmatched transaction review queue and approved adjustments. |
| FR-REC-03 | Open | No close-period balances, dual sign-off and locked ledger. |
| FR-ROLE-01 | Partial | Admin and customer account shell exist; role-specific Director, Agent, Operations, Accountant and Marketing portals are incomplete. |
| FR-ROLE-02 | Open | Director approval/dashboard role is absent. |
| FR-ROLE-03 | Partial | Agent account approval exists; strict assigned-only views and commission statements are incomplete. |
| FR-ROLE-04 | Partial | Customer account exists; own full records and support cases are incomplete. |
| FR-RPT-01 | Partial | Basic admin summaries exist; complete source, SLA, quote, revenue, payable, cancellation and profitability reports are absent. |

## Production inputs and specification conflicts

- **Offer:** The user requested the v1.3 defaults for all new quote drafts. The SRS does not give calendar dates or an authorized minimum selling price. Staff must enter these before approving each quote; the system does not invent them.
- **Email:** Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and optionally `EMAIL_FROM` on the backend host. Without these, the lead saves in CRM, and the server explicitly logs that the email alert was not sent. No test mailbox is used for real enquiries.
- **Tax and payments:** An accountant must approve tax wording/rates and the booking/payment conversion. Legacy direct checkout is disabled to avoid quoting a stale package price or applying an invented GST rate.
- **External integrations:** Supplier/API agreements, authorized IRCTC access, WhatsApp Business provider, translation credentials, accounting/bank connections and analytics properties are not supplied by the SRS itself.
- **Source text inconsistency:** The SRS lists nine Book Services entries but calls them “eight” in one sentence. The nine named entries are the implemented navigation target. Its older open decision about public “starting prices” conflicts with v1.3 FR-WEB-03/FR-PRC-03; the explicit v1.3 price-free requirement takes precedence.
