---
version: alpha
name: "Sreepayanam InterNational Pvt. Ltd."
description: "A polished travel and opportunity ecosystem with a practical planning desk underneath."
colors:
  ink: "#0B3D91"
  peacock: "#0B3D91"
  coral: "#F36F21"
  turmeric: "#D4AF37"
  plum: "#11854D"
  paper: "#F5F5F5"
  surface: "#FFFFFF"
  muted: "#65748B"
  border: "#DCE2EC"
  danger: "#B9473B"
  success: "#216E5A"
  focus: "#D4AF37"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "6.9rem"
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

SreePayanam is designed as a confident travel and opportunity desk: route lines, departure boards, coastal light, and notes made by a human who knows the road. The interface feels collected and intentional rather than glossy or generic. The public shell can be expressive; the planner stays quiet, legible and task-first.

The supplied logo is the brand anchor: a deep-blue SreePayanam wordmark with a circular route mark and orange, green and blue journey shapes. The same primary blue (`#0B3D91`) and gold (`#D4AF37`) lead navigation, calls to action and brand surfaces; orange (`#F36F21`) and green (`#11854D`) are supporting accents that echo the logo without competing with it.

### Product context and register

- **Audience and primary job:** Families, pilgrims, couples, student groups and corporate travellers need to turn a rough travel idea into a route, destination shortlist, planning estimate and enquiry.
- **Target market(s) and evidence:** India-first travel planning, with domestic and international packages. Evidence is the existing National/International package model, the current planner fields, and the requested destination catalogue.
- **Locale(s) and language policy:** English UI and copy; INR is the default customer-facing currency. Use clear, non-legalistic English and avoid inventing package policies.
- **Usage scene:** Primarily mobile and small laptop use, often while comparing routes or messaging a travel desk. Touch targets must be generous and progress must remain obvious.
- **Register:** Hybrid. `/`, `/about`, `/packages`, `/contact` are brand surfaces; `/ai-assistant`, `/checkout`, `/bookings` and `/admin` are product surfaces with stronger state and recovery rules.
- **Memorable signature:** A twelve-frame route reel on the home hero, pairing each package type with a destination image and a practical route note.
- **Restraint:** Form labels, prices, errors, dates and customer data remain calm, high-contrast and unsurprising.
- **Anti-references:** Neon “AI” gradients, anonymous hotel-booking grids, and generic dashboard chrome. The brand should feel grounded in the journeys it coordinates.
- **Token ownership/runtime mapping:** Existing runtime CSS is the canonical source for this repository. `DESIGN.md` mirrors the accepted values; `frontend/src/index.css` maps the semantic variables and `frontend/src/App.css` consumes them. If tokens move to a generator later, update both the owner and this mapping in the same changeset.

## Colors

Primary blue is the structural color for headings, navigation, primary actions and the planner's route canvas. Gold marks attention and optionality. Orange is reserved for route ribbons, important accents and focus-adjacent moments; green carries supporting journey and success states. Paper and surface separate the page canvas from working cards without a heavy shadow system. Danger and success always include text/icon cues, never color alone.

## Typography

Georgia is used sparingly as a display face because its high-contrast strokes echo a printed itinerary and differentiate the brand from standard SaaS screens. Avenir Next/Segoe UI carries controls, labels, numbers and longer copy. Utility labels use a compact sans treatment with deliberate tracking. Sentence case is the default; all-caps is limited to short eyebrows and document metadata. Prices and references use tabular-looking system numerals where available. Runtime hero headings use the responsive range `clamp(3.1rem, 7vw, 6.9rem)`; the frontmatter value records the maximum scale in the design token format.

## Layout

The public site uses a wide editorial grid with generous light-grey margins, occasional offset cards and a blue route canvas as the main visual anchor. Product workflows use a two-column planner frame: a natural-height form on the left and a sticky summary on the right, collapsing into a single column on narrow screens. Controls use a consistent 3rem-ish hit area, 0.85rem internal rhythm and 1px borders. No shared shell owns a forced viewport height; long forms remain document-scrollable.

## Elevation & Depth

Hierarchy comes from tonal layers, hairline borders and one restrained shadow for floating summaries. Static content is mostly flat. The home hero uses a twelve-image route reel: a dark reading overlay keeps the message legible while the active place image supplies the emotional anchor. Hero artwork lives in `frontend/src/assets/hero/` and ships with the Vite bundle; remote package imagery is treated as an optional enhancement with a local fallback. Modals and sticky summaries may float above the paper surface, but content cards should not look like separate plastic tiles.

## Shapes

Cards use a medium-soft 1.1rem radius; fields and buttons use a smaller 0.65rem radius so the action language is tighter than the content language. Route stops are circular; status chips are compact pills. Dividers are thin and warm. No shape communicates meaning alone: selected states add text, icon or border changes.

## Components

### Foundational visual states

Interactive elements receive a gold focus ring, a clear hover tint, a pressed state and a stable disabled/busy footprint. Errors live beside the field and in a summary when the form is long. Loading indicators reserve their own space. Reduced-motion users receive an immediate opacity-only transition.

### Buttons and actions

Solid blue is the primary safe action. Outline ink is neutral. Orange is a focused route accent, not a destructive color. Destructive actions are separated and use the danger role. Busy buttons keep their size and expose `aria-busy`.

### Navigation and data display

The navigation is a sticky white bar with a visible mobile menu button and blue link states. Package cards use real links for navigation. The planner's route ribbon and estimate panel are the primary data display; customer-facing quotes never expose supplier cost or internal profit.

### Forms and overlays

Product forms use `noValidate`, real labels, app-owned errors and first-error focus. Native select/date controls are intentional where platform-owned popups are acceptable; the destination picker is a grouped checkbox primitive because its scope, selection count and “select recommended” action are part of the product contract. The quote PDF is generated from a server-authoritative calculation and is explicitly an estimate until confirmed.

### Iconography

Lucide icons, 1.7px stroke, 16–22px in controls and 24–30px in feature marks. Icon-only controls retain an accessible name and are not used where a short text label is clearer.

### Motion

Motion has one job: make the route reveal feel like a journey. The home hero advances through package styles with a slow image cross-fade, pauses on hover or keyboard focus, and exposes previous/next, play/pause and direct slide controls. The planner uses a restrained 220ms cross-fade/slide when moving steps and a small stop activation when destinations change. `prefers-reduced-motion: reduce` disables automatic advancement and transforms while leaving manual controls available.

### Content and data visualization

Use plain travel language: “Choose a package”, “Add places”, “Review your estimate”, “Download quotation”. INR uses `en-IN` grouping. Dates are stored as date-only input values and displayed as local calendar dates; the backend validates money inputs and owns the final calculation.

## Do's and Don'ts

- **Do:** Let the route and destination choices carry the personality of the experience.
- **Do:** Keep prices, privacy notes, error recovery and confirmation language unambiguous.
- **Don't:** Use a decorative animation to hide a slow or uncertain request.
- **Don't:** Put raw backend errors, supplier cost, secrets or internal profit into customer-facing UI or PDFs.
