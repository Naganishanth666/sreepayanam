---
version: alpha
name: "SreePayanam Tours & Travels"
description: "A warm, route-led travel brand with a practical planning desk underneath."
colors:
  ink: "#172630"
  peacock: "#0D7C78"
  coral: "#EF7654"
  turmeric: "#E6B447"
  plum: "#5A477C"
  paper: "#F7F2E9"
  surface: "#FFFDF8"
  muted: "#66716F"
  border: "#E5DED1"
  danger: "#B9473B"
  success: "#216E5A"
  focus: "#C45A37"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.6rem, 7vw, 6.7rem)"
    lineHeight: "0.95"
  sans:
    fontFamily: "'Avenir Next', 'Segoe UI', sans-serif"
    fontSize: "1rem"
    lineHeight: "1.55"
  utility:
    fontFamily: "'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    lineHeight: "1.2"
rounded:
  DEFAULT: "1.1rem"
  sm: "0.65rem"
  md: "0.9rem"
  lg: "1.6rem"
spacing:
  section-gap: "clamp(4.5rem, 9vw, 8rem)"
  page-max: "78rem"
  control: "0.85rem"
components:
  button: { height: "3rem", radius: "0.65rem" }
  input: { height: "3.15rem", radius: "0.65rem" }
  card: { radius: "1.1rem", border: "#E5DED1" }
  dialog: { radius: "1.1rem", maxWidth: "32rem" }
---

# SreePayanam Design System

## Overview

### Creative North Star

SreePayanam is designed like a well-kept South Indian travel field journal: route lines, temple bells, departure boards, coastal light, and notes made by a human who knows the road. The interface feels collected and intentional rather than glossy or generic. The public shell can be expressive; the planner stays quiet, legible and task-first.

### Product context and register

- **Audience and primary job:** Families, pilgrims, couples, student groups and corporate travellers need to turn a rough travel idea into a route, destination shortlist, planning estimate and enquiry.
- **Target market(s) and evidence:** India-first travel planning, with domestic and international packages. Evidence is the existing National/International package model, the current planner fields, and the requested destination catalogue.
- **Locale(s) and language policy:** English UI and copy; INR is the default customer-facing currency. Use clear, non-legalistic English and avoid inventing package policies.
- **Usage scene:** Primarily mobile and small laptop use, often while comparing routes or messaging a travel desk. Touch targets must be generous and progress must remain obvious.
- **Register:** Hybrid. `/`, `/about`, `/packages`, `/contact` are brand surfaces; `/ai-assistant`, `/checkout`, `/bookings` and `/admin` are product surfaces with stronger state and recovery rules.
- **Memorable signature:** A coral route ribbon with stops that changes as the traveller chooses a package and destinations.
- **Restraint:** Form labels, prices, errors, dates and customer data remain calm, high-contrast and unsurprising.
- **Anti-references:** Generic blue SaaS dashboards, neon “AI” gradients, and anonymous hotel-booking grids. The brand should feel grounded in the journeys it coordinates.
- **Token ownership/runtime mapping:** Existing runtime CSS is the canonical source for this repository. `DESIGN.md` mirrors the accepted values; `frontend/src/index.css` maps the semantic variables and `frontend/src/App.css` consumes them. If tokens move to a generator later, update both the owner and this mapping in the same changeset.

## Colors

Ink navy is the structural color for text, the navigation shell and the planner's route canvas. Peacock teal carries primary actions and success states. Coral is reserved for the route ribbon, important accents and focus. Turmeric marks attention and optionality. Plum is a secondary editorial accent. Paper and surface separate the page canvas from working cards without a heavy shadow system. Danger and success always include text/icon cues, never color alone.

## Typography

Georgia is used sparingly as a display face because its high-contrast strokes echo a printed itinerary and differentiate the brand from standard SaaS screens. Avenir Next/Segoe UI carries controls, labels, numbers and longer copy. Utility labels use a compact sans treatment with deliberate tracking. Sentence case is the default; all-caps is limited to short eyebrows and document metadata. Prices and references use tabular-looking system numerals where available.

## Layout

The public site uses a wide editorial grid with generous paper margins, occasional offset cards and a dark route canvas as the main visual anchor. Product workflows use a two-column planner frame: a natural-height form on the left and a sticky summary on the right, collapsing into a single column on narrow screens. Controls use a consistent 3rem-ish hit area, 0.85rem internal rhythm and 1px borders. No shared shell owns a forced viewport height; long forms remain document-scrollable.

## Elevation & Depth

Hierarchy comes from tonal layers, hairline borders and one restrained shadow for floating summaries. Static content is mostly flat. The hero route canvas uses layered gradients and a subtle grid, not an image carousel, so the primary message is stable and does not depend on a remote asset. Modals and sticky summaries may float above the paper surface, but content cards should not look like separate plastic tiles.

## Shapes

Cards use a medium-soft 1.1rem radius; fields and buttons use a smaller 0.65rem radius so the action language is tighter than the content language. Route stops are circular; status chips are compact pills. Dividers are thin and warm. No shape communicates meaning alone: selected states add text, icon or border changes.

## Components

### Foundational visual states

Interactive elements receive a coral focus ring, a clear hover tint, a pressed state and a stable disabled/busy footprint. Errors live beside the field and in a summary when the form is long. Loading indicators reserve their own space. Reduced-motion users receive an immediate opacity-only transition.

### Buttons and actions

Solid teal is the primary safe action. Outline ink is neutral. Coral is a focused route accent, not a destructive color. Destructive actions are separated and use the danger role. Busy buttons keep their size and expose `aria-busy`.

### Navigation and data display

The navigation is a sticky ink bar with a visible mobile menu button. Package cards use real links for navigation. The planner's route ribbon and estimate panel are the primary data display; customer-facing quotes never expose supplier cost or internal profit.

### Forms and overlays

Product forms use `noValidate`, real labels, app-owned errors and first-error focus. Native select/date controls are intentional where platform-owned popups are acceptable; the destination picker is a grouped checkbox primitive because its scope, selection count and “select recommended” action are part of the product contract. The quote PDF is generated from a server-authoritative calculation and is explicitly an estimate until confirmed.

### Iconography

Lucide icons, 1.7px stroke, 16–22px in controls and 24–30px in feature marks. Icon-only controls retain an accessible name and are not used where a short text label is clearer.

### Motion

Motion has one job: make the route reveal feel like a journey. The planner uses a restrained 220ms cross-fade/slide when moving steps and a small stop activation when destinations change. No auto-rotating hero carousel remains. `prefers-reduced-motion: reduce` disables transforms and staggered delays.

### Content and data visualization

Use plain travel language: “Choose a package”, “Add places”, “Review your estimate”, “Download quotation”. INR uses `en-IN` grouping. Dates are stored as date-only input values and displayed as local calendar dates; the backend validates money inputs and owns the final calculation.

## Do's and Don'ts

- **Do:** Let the route and destination choices carry the personality of the experience.
- **Do:** Keep prices, privacy notes, error recovery and confirmation language unambiguous.
- **Don't:** Use a decorative animation to hide a slow or uncertain request.
- **Don't:** Put raw backend errors, supplier cost, secrets or internal profit into customer-facing UI or PDFs.
