GOEXPLORE DESIGN SYSTEM - FLEXIBLE SPECIFICATION v2.0

Philosophy: "Emerald Forests & Sunset Energy".
UI Principles:

Mobile First but Adaptive: Mobile interfaces use icons + minimal text. Desktop interfaces use expanded layouts.

Thumb-Friendly: On mobile, primary actions are at the bottom.

No-Scroll Editors: Complex editors (maps, planners) should fit 100% of the viewport height on desktop without scrolling the window.

1. THE LAYOUT (WIRELEME IMPLEMENTATION)

You must implement the following structural layout based on the approved wireframes:

A. Mobile Layout (iPhone View)

Header: Minimal. Logo centered or left.

Content: Scrollable vertical list of cards.

Bottom Navigation Bar (Fixed):

Must be fixed bottom-0 z-50 w-full bg-white border-t border-slate-200.

5 Items Layout:

My Trips (Icon: Map/Route)

My Gear (Icon: Backpack/Package)

NEW TRIP (Center): Prominent "Plus" button. Larger than others, possibly floating or highlighted in Emerald.

Preferences (Icon: Sliders/Settings)

Account (Icon: User)

Use Icons with small labels (or icons only for secondary items).

B. Desktop Layout (MacBook View)

Header (Sticky Top):

Left: Logo.

Right: Horizontal Navigation Links corresponding to the mobile menu (My Trips, Gear, Preferences, Account).

CTA: "New Trip" button prominent in the header or sub-header.

Content: Grid layout for cards (e.g., grid-cols-3).

2. DESIGN TOKENS (THE "LEGO BLOCKS")

Use these tokens to build your UI. Do not deviate.

Color Palette (Tailwind)

Backgrounds: bg-slate-50 (App Global), bg-white (Cards/Nav).

Text: text-slate-900 (Headings), text-slate-600 (Body), text-slate-400 (Meta).

Primary (Brand): emerald-600 (Buttons, Active States, Icons).

Accent (Highlights): amber-500 (Stars, Tips, Warnings).

Error: rose-600.

Shapes & Depth

Container/Card: rounded-2xl, bg-white, border border-slate-200, shadow-sm.

Interactive: rounded-xl (Buttons, Inputs).

Hover Effects: Cards should lift (-translate-y-1) and gain shadow (shadow-md) on desktop hover.

3. COMPONENT GUIDELINES (USE YOUR JUDGEMENT)

1. Cards (Trips, Gear, Items):

Style: Use the Container tokens above.

Layout: You have freedom here. Typically an image/gradient area on top, info below.

Responsiveness:

Mobile: Compact. Maybe horizontal layout (Image left, text right) OR stacked. Hide less important meta-data.

Desktop: Spacious. Show full details, stats, and action buttons.

2. Buttons:

Primary: bg-emerald-600 text-white shadow-lg shadow-emerald-600/20.

Secondary: bg-white border border-slate-200 text-slate-700.

Placement: On mobile, if a page has a main action (e.g., "Save"), consider placing it in a "Sticky Footer" just above the bottom nav, so it's always accessible.

3. Typography:

Headings: font-bold tracking-tight text-slate-900.

Use lucide-react icons heavily to replace text labels on mobile.
