---
version: alpha
name: Oxford-Grammar-LMS-Design-System
description: |
  A human-crafted, academic-grade design system engineered for Oxford Grammar &
  Cambridge EdTech School. Grounded in British academic prestige, tactile software
  craft, and modern React Bits micro-interactions. Anchored by deep Oxford navy (#0a0f1d),
  regal Cambridge emerald (#0f5132), crisp slate canvases, and tactile hairline borders.
  Replaces generic AI tropes, blurry gradient blobs, and fake placeholder data with
  an authentic educational architecture featuring asymmetric Bento grids, cursor-aware
  spotlight cards, magnetic CTAs, rolling metric counters, and realistic operational data.

colors:
  # Brand Primary & Accent
  primary: "#0f5132"                  # Cambridge Emerald Green
  primary-hover: "#146c43"            # Elevated Emerald Hover
  primary-active: "#0b3d26"           # Pressed Emerald
  primary-muted: "#e8f5ee"            # Soft Emerald Tint for Badges
  primary-glow: "rgba(15, 81, 50, 0.18)"

  # Secondary Brand (Oxford Heritage)
  secondary: "#0a0f1d"                # Deep Oxford Navy
  secondary-surface: "#11182c"        # Lifted Oxford Slate
  secondary-subtle: "#1e293b"         # Midnight Charcoal

  # Light Theme Canvas & Surface Ladder
  canvas: "#f8fafc"                   # Crisp Off-White Academic Canvas
  surface-0: "#ffffff"                # Pure White Card Base
  surface-1: "#f1f5f9"                # Subtle Recessed Surface
  surface-2: "#e2e8f0"                # Secondary Border & Divider Fill
  surface-elevated: "#ffffff"         # Floating Modals & Tooltips

  # Dark Theme Canvas & Surface Ladder (Admin & Developer Modals)
  dark-canvas: "#090d16"              # Deep Midnight Black-Blue
  dark-surface-1: "#0e1524"           # Step 1 Panel
  dark-surface-2: "#141e33"           # Step 2 Card Surface
  dark-surface-3: "#1c2a47"           # Step 3 Elevated Dropdown
  dark-surface-4: "#24365c"           # Step 4 Focus Highlight

  # Hairline Borders & Dividers
  border-subtle: "#e2e8f0"            # Light Border (Hairline 1px)
  border-strong: "#cbd5e1"            # Focused Light Border
  border-dark-subtle: "rgba(255, 255, 255, 0.08)"
  border-dark-strong: "rgba(255, 255, 255, 0.16)"

  # Typography & Text Inks
  ink-primary: "#0f172a"              # Primary High-Contrast Charcoal Ink
  ink-secondary: "#334155"            # Secondary Paragraph Ink
  ink-muted: "#64748b"                # Metadata & Form Field Labels
  ink-subtle: "#94a3b8"               # Disabled & Timetable Slot Mappings
  ink-inverse: "#ffffff"              # On Dark Surfaces
  ink-inverse-muted: "#94a3b8"

  # Academic Status Tokens (Real Operations)
  status-paid: "#16a34a"              # Verified Fee Payment
  status-paid-bg: "#dcfce7"
  status-pending: "#d97706"           # Challan Issued / Unreconciled
  status-pending-bg: "#fef3c7"
  status-overdue: "#dc2626"           # Defaulter / Past Due Date
  status-overdue-bg: "#fee2e2"
  status-present: "#059669"           # Attendance Present
  status-present-bg: "#ecfdf5"
  status-late: "#d97706"              # Attendance Late Check-In
  status-late-bg: "#fffbeb"
  status-absent: "#e11d48"            # Attendance Absent
  status-absent-bg: "#fff1f2"
  status-substituted: "#6366f1"       # Teacher Substituted Slot
  status-substituted-bg: "#eef2ff"

typography:
  display-2xl:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 72px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -2.5px
  display-xl:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: -1.8px
  display-lg:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -1.0px
  display-md:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  heading-lg:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.4px
  heading-md:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.2px
  body-lead:
    fontFamily: "Inter, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.1px
  body-default:
    fontFamily: "Inter, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0.1px
  mono-code:
    fontFamily: "JetBrains Mono, Geist Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  3xl: 28px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.body-sm}"
    fontWeight: 600
    rounded: "{rounded.pill}"
    padding: "10px 22px"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    shadow: "0 2px 8px rgba(15, 81, 50, 0.25)"
  button-secondary:
    backgroundColor: "{colors.surface-0}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.body-sm}"
    fontWeight: 600
    rounded: "{rounded.pill}"
    padding: "10px 22px"
    border: "1px solid {colors.border-subtle}"
    shadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
  bento-card:
    backgroundColor: "{colors.surface-0}"
    borderColor: "{colors.border-subtle}"
    rounded: "{rounded.2xl}"
    padding: "24px"
    shadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
  spotlight-card:
    backgroundColor: "{colors.surface-0}"
    borderColor: "{colors.border-subtle}"
    spotlightColor: "rgba(15, 81, 50, 0.08)"
    rounded: "{rounded.2xl}"
    padding: "28px"
  data-table:
    backgroundColor: "{colors.surface-0}"
    headerBg: "{colors.surface-1}"
    borderColor: "{colors.border-subtle}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
  challan-card:
    backgroundColor: "#ffffff"
    borderColor: "#0f5132"
    borderWidth: "1.5px"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Oxford Grammar & Cambridge EdTech School — Design System (DESIGN.md)

## 1. Executive Summary & Design Vision

This document defines the complete visual, architectural, and interaction specifications for the **Oxford Grammar & Cambridge EdTech School LMS**.

The goal of this redesign is to eliminate every hallmark of generic, rushed AI-generated web templates and replace them with a **live, tactile, human-crafted academic operating system**. 

The design combines:
1. **Academic Heritage**: The solemnity, trust, and prestige of British-style Oxford & Cambridge academic governance (deep Oxford navy, Cambridge emerald green, sharp editorial typography, and authentic school insignia).
2. **Tactile Software Craft**: The micro-interaction polish inspired by [React Bits](https://reactbits.dev/), [Linear](https://linear.app), and [Cal.com](https://cal.com) — including physical cursor spotlighting, subtle magnetic springs, kinetic typography reveals, and smooth rolling counters.
3. **Operational Realism**: Strict adherence to real-world educational mechanics (authentic class hierarchies from Grade 1 to O-Levels, verifiable bank fee challans with QR codes, real daily timetable slots, and teacher substitution protocols).

---

## 2. Anti-AI Design Heuristics

To ensure the product feels created by an experienced senior product designer and software engineer rather than an AI agent, the following rules are non-negotiable:

| "AI Generated" Anti-Patterns (BANNED) | Human-Crafted Architecture (ENFORCED) |
| :--- | :--- |
| **Random AI Photos**: Hallucinated smiling students with unnatural lighting, plastic graduation caps, or warped hands. | **Authentic Document & UI Mockups**: Live SVG school crests, real interactive challan previews, real timetables, and vector course badges. |
| **Giant Blur Blobs**: Overused `filter blur-3xl opacity-40 animate-blob` cyan/purple blobs floating aimlessly. | **Engineered React Bits Backgrounds**: Subtle mathematical Dot Grids, geometric isometric grids, or delicate interactive Spotlight Card glows. |
| **Vague Cliché Copy**: "Unlock the power of your dreams with cutting-edge synergy." | **Precise Academic Terminology**: "Dual-Track Matric & Cambridge O-Level Curriculum", "Automated Bank Challan Reconciliation", "Faculty Substitution Matrix". |
| **Fake / Placeholder Data**: "John Doe, Grade 10, GPA 4.0, Fee $100". | **Authentic Operational Schemas**: Registration IDs (`OGS-2026-0814`), Sections (Rose, Tulip, Alpha), Term Fee Schedules, and actual period timetables (08:00 - 08:45 AM). |
| **Monotonous Card Grids**: Three identical centered boxes with Lucide icons on colored circles. | **Asymmetric Bento Grids**: Varied visual hierarchies displaying live schedules, attendance doughnuts, quick-actions, and verification cards. |
| **Default Web Shadows**: Muddy, pitch-black drop shadows (`shadow-2xl`). | **Layered Hairlines & Ambient Depth**: 1px crisp borders (`#E2E8F0` / `rgba(255,255,255,0.08)`) combined with soft diffused ambient shadows (`0 1px 3px rgba(0,0,0,0.04)`). |

---

## 3. Color Token System

The color system reflects academic authority, clarity, and rapid status recognition.

### 3.1 Primary Brand Palette
- **Cambridge Emerald Green (`#0F5132`)**: The hallmark institutional color representing academic growth, credibility, and primary interactive authority. Used on primary CTA buttons, verified payment badges, and active navigation indicators.
- **Deep Oxford Navy (`#0A0F1D`)**: Represents executive governance, security, and administrative gravity. Used for high-contrast headers, dark surface modals, and navigation chrome.
- **Academic Gold Accent (`#D97706`)**: Selective tertiary accent for honors, fee notifications, and pending approval states.

### 3.2 Light & Dark Surface Ladders

```text
Light Canvas (Default Educational Experience)
  └── #F8FAFC (Canvas: Crisp academic off-white)
      └── #FFFFFF (Surface-0: Primary cards, data tables, challans)
          └── #F1F5F9 (Surface-1: Table headers, form inputs, nested panels)
              └── #E2E8F0 (Hairline Border: 1px crisp separation)

Dark Surface (Admin Analytics & Focus Overlays)
  └── #090D16 (Canvas: Midnight Navy-Black)
      └── #0E1524 (Surface-1: Base dashboard container)
          └── #141E33 (Surface-2: Stat metric tiles & elevated charts)
              └── rgba(255, 255, 255, 0.08) (Hairline Border)
```

### 3.3 Semantic Status Colors (Real Educational States)
- **Fee Paid / Verified**: `#16A34A` text on `#DCFCE7` pill container.
- **Fee Pending / Unreconciled**: `#D97706` text on `#FEF3C7` pill container.
- **Fee Overdue / Defaulter**: `#DC2626` text on `#FEE2E2` pill container.
- **Student Present**: `#059669` badge with green pulse indicator.
- **Student Late**: `#D97706` badge with amber clock indicator.
- **Student Absent**: `#E11D48` badge with red alert indicator.
- **Timetable Substitution**: `#6366F1` (Indigo) with link to original absent faculty.

---

## 4. Typography System & Hierarchy

The typography marries modern sans-serif geometric construction with high data legibility.

- **Display & Headings**: `Plus Jakarta Sans` — refined letter-spacing, authoritative geometric cuts, and distinct weights (600, 700, 800).
- **Body & Data Tables**: `Inter` — engineered for high density UI, micro-labels, numerical scanning, and form inputs.
- **System Codes & Tokens**: `JetBrains Mono` or `Geist Mono` — for Student Roll Numbers, Challan IDs, and System Timestamps.

### Type Scale Specification

| Token | Size | Weight | Line Height | Tracking | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-2xl` | 72px | 800 | 1.05 | -2.5px | Hero Main Headline |
| `display-xl` | 56px | 700 | 1.10 | -1.8px | Major Section Openers |
| `display-lg` | 40px | 700 | 1.15 | -1.0px | Portal Welcome & Key Metrics |
| `display-md` | 32px | 600 | 1.20 | -0.6px | Bento Card Headers & Modal Titles |
| `heading-lg` | 24px | 600 | 1.25 | -0.4px | Subsection Titles & Table Groups |
| `heading-md` | 20px | 600 | 1.30 | -0.2px | Card Titles, Profile Headers |
| `body-lead` | 18px | 400 | 1.55 | -0.1px | Hero Subtitle, Lead Explanations |
| `body-default` | 15px | 400 | 1.50 | -0.05px | Standard Paragraphs, Table Content |
| `body-sm` | 13px | 500 | 1.45 | 0px | Form Labels, Table Headers |
| `caption` | 12px | 500 | 1.40 | +0.1px | Metadata, Status Badges, Timestamps |
| `mono-code` | 13px | 500 | 1.40 | 0px | Roll Numbers (`OGS-2026-041`), Challan Barcodes |

---

## 5. React Bits Component Integration

To inject genuine human-crafted delight without cluttering performance, the system incorporates dedicated micro-interactions from the [React Bits](https://reactbits.dev/) library:

### 5.1 Text Animations
1. **SplitText / BlurText (`reactbits.dev/text-animations/split-text`)**:
   - Used for the primary hero title: *"Academic Governance for the Modern Institution"*.
   - Words or characters reveal smoothly on initial load via subtle staggered spring physics (`y: [20, 0]`, `opacity: [0, 1]`, `blur: [8px, 0px]`).
2. **ShinyText (`reactbits.dev/text-animations/shiny-text`)**:
   - Applied to the top announcement pill badge: *"Cambridge International Examination Affiliated 2026-2027"*.
   - A soft light shimmer passes across the text every 4 seconds.

### 5.2 Interactive Micro-Components
1. **SpotlightCard (`reactbits.dev/components/spotlight-card`)**:
   - Applied to:
     - Dashboard metric tiles (Total Enrolled, Daily Attendance %, Collected Fees).
     - Landing page Bento feature cards.
     - Student profile preview modal.
   - Mechanism: Tracks mouse position (`clientX`, `clientY`) within the card boundary and renders a radial gradient spotlight (`rgba(15, 81, 50, 0.08)`) beneath the content, producing a physical sheen.
2. **Magnet / Magnetic Button (`reactbits.dev/animations/magnet`)**:
   - Applied to primary CTA buttons: *"Access Portal"*, *"Generate Challans"*, and *"Download Fee Slip"*.
   - The button subtly pulls towards the cursor within a 30px threshold, returning smoothly to center on mouse leave.
3. **CountUp / Rolling Number Ticker (`reactbits.dev/text-animations/count-up`)**:
   - Applied to all quantitative numbers:
     - Total Enrolled Students (e.g., `1,480`)
     - Monthly Fee Collection Percentage (e.g., `94.2%`)
     - Present Staff Today (e.g., `58 / 62`)
   - Animates smoothly using ease-out cubic interpolation upon scrolling into view or data refresh.
4. **AnimatedTabs (`reactbits.dev/components/animated-tabs`)**:
   - Replaces abrupt tab toggles in the Attendance and Fees consoles.
   - A rounded pill background slides fluidly (`layoutId="activeTabPill"`) beneath the active tab (e.g., `All Students | Class 9-A | Class 9-B | Class 10-A`).

### 5.3 Backgrounds
1. **DotGrid Background (`reactbits.dev/backgrounds/dot-grid`)**:
   - Engineered via high-performance CSS / canvas replacing memory-heavy blurred divs.
   - Grid spacing: `28px`, dot radius: `1px`, color: `rgba(15, 23, 42, 0.08)` on light canvas, `rgba(255, 255, 255, 0.06)` on dark sections.

---

## 6. Spatial Layout & Bento Grid Architecture

The user interface rejects generic 3-column grids in favor of **asymmetric Bento Grids** that represent natural academic hierarchies.

### 6.1 Landing Page Hero Bento Layout (12-Column Grid)
- **Top Row (Cols 1-12)**: Navigation Bar with Cambridge crest, direct portal deep-links, and high-contrast login CTA.
- **Main Hero (Cols 1-7)**: SplitText typography, institutional credentials, and dual magnetic action buttons.
- **Interactive Live Hub Card (Cols 8-12)**: An authentic, interactive widget simulating the real LMS:
  - Mini live roll-call counter (`96.4% Attendance Today`).
  - Next scheduled period notification (`Class 10-A Chemistry | 10:45 AM | Room 204`).
  - Challan status preview with real barcode & QR code.
- **Bottom Feature Strip (Cols 1-12)**: 4 spotlight cards showcasing actual modules:
  - 1. Academic Master Data & Section Routing.
  - 2. Instant Faculty Substitution Matrix.
  - 3. Automated Bank Fee Challans (PDF + QR).
  - 4. Immutable Attendance Freezing & Audit Logs.

### 6.2 Admin Central Dashboard Bento Architecture
```text
+-----------------------------------------------------------------------------------+
|  Stat 1: Active Enrollment   |  Stat 2: Fee Recovery %    |  Stat 3: Faculty On Duty  |
|  [CountUp: 1,482 Students]   |  [CountUp: PKR 4.2M / 94%] |  [CountUp: 56 / 58 Staff] |
+-----------------------------------------------------------+-----------------------+
|                                                           | Quick Actions:        |
|  Revenue & Fee Collection Graph (Recharts Area Graph)     | • New Student Intake  |
|  - Real monthly collection vs outstanding receivables      | • Generate Challans   |
|                                                           | • Freeze Attendance   |
+-----------------------------------------------------------+-----------------------+
|  Today's Faculty Substitution Engine                      | Attendance Distribution|
|  - 2 Absent Teachers Detected                             | (Recharts Donut)      |
|  - Period 3: 9-A Physics -> Mr. Tariq Assigned            | • 92% Present         |
|  - Period 5: 10-B Math   -> Needs Assignee [Assign Now]   | • 5% Late / 3% Absent |
+-----------------------------------------------------------------------------------+
```

---

## 7. Authentic Educational Content & Data Standards

**Crucial Directive**: No lorem ipsum. No generic "John Doe". No fictitious $10 fees. All visual previews and UI tables must reflect genuine Pakistani & British Cambridge academic operations.

### 7.1 Student Identity Specification
- **Registration Format**: `OGS-[YEAR]-[4 DIGIT SEQUENCE]` (e.g., `OGS-2026-0184`).
- **Academic Hierarchy**:
  - Primary: Class 1 through Class 5 (Sections: Amber, Emerald, Sapphire).
  - Middle School: Class 6 through Class 8 (Sections: Blue, Green, Red).
  - Matriculation: Class 9-Matric, Class 10-Matric (Science & Computer Groups).
  - Cambridge International: O-Level 1 (O-1), O-Level 2 (O-2).
- **Representative Student Record**:
  - Name: Muhammad Haris Khan
  - Father's Name: Tariq Mahmood Khan
  - Class: Class 10-Matric (Section Science-A)
  - Roll Number: `10A-14`
  - Emergency Contact: `+92 300 8472911`

### 7.2 Fee Challan Structure (Bank-Standard Model)
Every challan generated follows the standard **3-Part Bank Challan Format** (Bank Copy, School Copy, Student Copy) rendered through Puppeteer with embedded verification QR code:
- **School Details**: Oxford Grammar & Cambridge EdTech School, Main Campus.
- **Bank Partner**: Designated Bank Collection Account (e.g., Allied Bank / Meezan Bank).
- **Itemized Breakdown**:
  - Tuition Fee (Monthly): `PKR 8,500`
  - Computer / Science Laboratory Fund: `PKR 1,200`
  - Sports & Activity Charge: `PKR 600`
  - Examination Fee (Mid-Term): `PKR 1,500`
  - **Total Amount Payable by Due Date**: `PKR 11,800`
  - **Late Fee Surcharge (After Due Date)**: `PKR 500`
  - **Total Amount Payable After Due Date**: `PKR 12,300`

### 7.3 Timetable Slot Model
- Morning Assembly: `07:45 AM - 08:00 AM`
- Period 1: `08:00 AM - 08:45 AM`
- Period 2: `08:45 AM - 09:30 AM`
- Period 3: `09:30 AM - 10:15 AM`
- Recess / Break: `10:15 AM - 10:45 AM`
- Period 4: `10:45 AM - 11:30 AM`
- Period 5: `11:30 AM - 12:15 PM`
- Period 6: `12:15 PM - 01:00 PM`
- Period 7: `01:00 PM - 01:45 PM`

---

## 8. Screen-by-Screen UI Redesign Specifications

### 8.1 Public Landing Page (`app/page.tsx`)
- **Header**: Institutional logo with crest, navigation links with hover underbars, role-selection portal button (`Faculty & Admin Sign In`).
- **Hero**:
  - Announcement badge with `ShinyText` effect.
  - Headline with `SplitText` spring animation.
  - Left-hand copy detailing real institutional capabilities.
  - Right-hand dynamic interactive preview card showcasing real student admission, live fee challan verification, and schedule overview (replacing the AI graduation stock photo).
- **Academic Highlights Bento Grid**:
  - Card 1: *Automated Fee Challan Lifecycle* — Real interactive PDF preview with QR code and status badge.
  - Card 2: *Automated Teacher Substitution* — Interactive period slot selector matching absent teachers to free faculty.
  - Card 3: *Real-time Attendance Audit* — Daily student roll-call interface with one-click administrative freeze.
  - Card 4: *Examination & Student Progress* — Class-wise grade performance metrics.
- **Institutional Footer**: Oxford Grammar School official contact details, campus address, and Cambridge affiliation badges.

### 8.2 Authentication Portal (`app/login/page.tsx`)
- Split-screen layout:
  - Left side: Deep Oxford Navy panel with geometric grid texture, school crest, and daily academic quote.
  - Right side: Clean white card with segmented role switcher (`Administrator` | `Teacher`), animated input fields with focus borders, remember session toggle, and secure JWT authentication.

### 8.3 Admin Control Hub (`app/admin/*`)
- **Navigation Sidebar**: Fixed left sidebar in deep navy (`#0A0F1D`) with subtle hairline dividers, active indicator pills in emerald green, and current user status.
- **Dashboard (`app/admin/page.tsx`)**: Asymmetric Bento grid with `SpotlightCard` tiles, `CountUp` numbers, and interactive Recharts graphs for fee collection and daily attendance.
- **Fee Management Console (`app/admin/fees/page.tsx`)**:
  - Class fee structure builder with dynamic line item addition.
  - Batch challan generator modal with month selector and class checklist.
  - Challan table with instant search, status pills (Paid, Pending, Overdue), and one-click PDF download via Puppeteer.
- **Teacher Substitution Matrix (`app/admin/substitution/page.tsx`)**:
  - Live timeline showing all absent teachers for today.
  - Instant conflict detection engine highlighting available teachers for each affected period.
  - One-click assign button with real-time timetable updates.
- **Attendance Oversight (`app/admin/attendance/page.tsx`)**:
  - Date and class selector with live attendance percentage doughnut.
  - "Freeze Attendance" button with confirmation modal to prevent tampering once records are submitted.

### 8.4 Faculty Classroom Hub (`app/teacher/*`)
- **Daily Schedule Dashboard**: Clean card list showing today's assigned periods, classroom numbers, and any assigned substitution periods tagged with an indigo badge.
- **Interactive Roll-Call Interface (`app/teacher/attendance/page.tsx`)**:
  - Large, touch-friendly student attendance table.
  - Quick action buttons: "Mark All Present", toggle individual students between Present (`P`), Late (`L`), and Absent (`A`).
  - Status indicator showing whether today's attendance has been locked/frozen by the administration.

---

## 9. Implementation Architecture & Dependencies

### 9.1 Required Component Primitives (React Bits + Radix)
The frontend project in `lms-client` will implement the following component modules:
- `@/components/reactbits/SpotlightCard.tsx` — Reusable mouse-tracking spotlight container.
- `@/components/reactbits/SplitText.tsx` — Kinetic text reveal with Framer Motion.
- `@/components/reactbits/CountUp.tsx` — High-precision numeric ticker.
- `@/components/reactbits/Magnet.tsx` — Cursor pull interaction for key CTAs.
- `@/components/reactbits/ShinyText.tsx` — Shimmering announcement text.
- `@/components/reactbits/DotGrid.tsx` — High-performance background grid.
- `@/components/reactbits/AnimatedTabs.tsx` — Smooth sliding layout tabs.

### 9.2 Tailwind CSS v4 Theme Integration
All tokens from this design document map directly to CSS custom properties in `globals.css` and Tailwind utility classes (`bg-primary`, `text-ink-primary`, `border-border-subtle`, `rounded-2xl`).

---

## 10. Design Sign-Off & Verification Criteria

A page or component is considered complete only when:
1. It contains **zero AI-generated stock imagery** or distorted cartoon avatars.
2. It uses **real institutional data** matching the Oxford Grammar School curriculum and banking format.
3. It incorporates smooth, purposeful **React Bits micro-interactions** (spotlight, magnetic buttons, kinetic text reveals).
4. All typography conforms strictly to the `Plus Jakarta Sans` + `Inter` + `JetBrains Mono` hierarchy.
5. All interactive elements provide visible focus rings, keyboard accessibility, and 60fps animations.
