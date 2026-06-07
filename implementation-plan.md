# BondVault Pakistan — Frontend-First MVP Implementation Plan

## Anti-Patterns to Avoid (from Research)

| Anti-Pattern | Our Counter |
|---|---|
| Default shadcn/ui | Custom `--radius`, custom variants, custom color tokens |
| Indigo/blue on slate | Pakistani emerald + gold palette (see Colors) |
| Inter font only | Playfair Display (headings) + Satoshi (body) |
| No motion | Framer Motion spring animations, staggered children everywhere |
| Hero→Logos→Features→Testimonials→CTA layout | Dashboard-first, no generic landing page |
| Identical cards | Cards have distinct personalities per denomination |
| Generic spinner + "Something went wrong" | Skeletons matching final layout + contextual error recovery |
| No empty states | Illustrative, context-aware, progressive empty states |
| 1px borders everywhere | Borders as communication, hairline separators, elevation-based depth |
| Static responsive | Creative layout per breakpoint, mobile bottom nav, tablet side rail |

---

## 1. Design System

### Color Tokens

```
Pakistani-inspired palette — warm, premium, distinctive:

Gold (primary/CTA):
  --gold-50:  #FFF9E6
  --gold-100: #FFEDB3
  --gold-200: #FFE180
  --gold-300: #FFD54D
  --gold-400: #FFC91A
  --gold-500: #E6A800  ← primary
  --gold-600: #B38600
  --gold-700: #806100
  --gold-800: #4D3A00
  --gold-900: #1A1300

Emerald (surfaces, depth):
  --emerald-50:  #F0FDF6
  --emerald-100: #DCFCE8
  --emerald-200: #BBF7D1
  --emerald-300: #86EFAD
  --emerald-400: #4ADE84
  --emerald-500: #22C55E  ← accent
  --emerald-600: #16A34A
  --emerald-700: #15803C
  --emerald-800: #14532D
  --emerald-900: #052E16  ← deepest surface

Warm neutral (replaces slate):
  --warm-50:  #FAFAF8
  --warm-100: #F5F2EE
  --warm-200: #EBE6DD
  --warm-300: #D7CEBF
  --warm-400: #B8A88E
  --warm-500: #9A8B78
  --warm-600: #7A6D5E
  --warm-700: #5C5247
  --warm-800: #3D3730
  --warm-900: #1E1C19  ← primary text
```

### Typography

```
Headings: Playfair Display (serif, premium, distinguished)
  — Weights: 400 (regular), 600 (semibold), 700 (bold)
  — Used for: page titles, hero text, denomination counters, brand name
  — Variable font axis: opsz (optical size) — larger at display sizes

Body: Satoshi (geometric sans-serif, warm, modern)
  — Weights: 400, 500, 700
  — Used for: body text, UI labels, buttons, forms, tables
  — Alternative: DM Sans if Satoshi unavailable

Monospace: JetBrains Mono (for bond numbers, data tables)
  — Features: tabular-nums enabled for alignment
```

### Spacing System

```
Base unit: 4px

  --space-xs:   4px
  --space-sm:   8px
  --space-md:   16px
  --space-lg:   24px
  --space-xl:   32px
  --space-2xl:  48px
  --space-3xl:  64px
  --space-4xl:  96px

Asymmetric breathing room:
  — Bottom padding always > top padding on sections (grounding effect)
  — Card internal padding: 20px all sides (not Tailwind's default p-6 = 24px)
  — Screen margins: 16px mobile, 24px tablet, 48px desktop
```

### Shadows & Elevation

```
  --elevation-0:  none
  --elevation-1:  0 1px 2px rgba(30,28,25,0.04), 0 1px 3px rgba(30,28,25,0.06)
  --elevation-2:  0 2px 4px rgba(30,28,25,0.04), 0 4px 8px rgba(30,28,25,0.06)
  --elevation-3:  0 4px 8px rgba(30,28,25,0.04), 0 8px 16px rgba(30,28,25,0.08)
  --elevation-4:  0 8px 16px rgba(30,28,25,0.06), 0 16px 32px rgba(30,28,25,0.10)
```

### Border Radius

```
  --radius-sm:   6px   (buttons, inputs, badges)
  --radius-md:   10px  (cards)
  --radius-lg:   16px  (modals, sheets)
  --radius-xl:   24px  (hero sections, featured cards)

NOT the default shadcn 0.5rem = 8px. Slightly softer.
```

---

## 2. Frontend Architecture

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC, file-conventions, streaming |
| Language | TypeScript strict mode | Type safety |
| Styling | Tailwind CSS v4 | Utility-first, custom theme |
| Components | shadcn/ui (customized) | unstyled base, heavily customized |
| Animation | Framer Motion | Spring physics, layout animations, stagger |
| Forms | React Hook Form + Zod | Validation, type-safe schemas |
| Data Fetching | TanStack Query v5 | Caching, optimistic updates, infinite scroll |
| Auth | Better Auth | Sessions, middleware |
| State | Zustand (minimal) | Client state only — most data via server |
| Icons | Phosphor Icons (primary) + custom SVG (brand) | NOT Lucide. Phosphor has more personality |
| Toast | Sonner (custom styled) | Interruptible, position-aware |

### Directory Structure

```
bondvault/
├── app/
│   ├── layout.tsx              # Root layout, fonts, providers
│   ├── page.tsx                # Redirect to /vault or /login
│   ├── loading.tsx             # Branded loading skeleton
│   ├── error.tsx               # Branded error with recovery
│   ├── not-found.tsx           # Branded 404 with illustration
│   │
│   ├── (auth)/
│   │   ├── layout.tsx          # Centered auth layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (app)/                  # Protected routes
│   │   ├── layout.tsx          # Sidebar + content layout
│   │   ├── vault/
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── loading.tsx     # Dashboard skeleton
│   │   │   ├── error.tsx       # Dashboard error
│   │   │   └── empty.tsx       # First-time empty state
│   │   │
│   │   ├── bonds/
│   │   │   ├── page.tsx        # Bond list with filters
│   │   │   ├── add/page.tsx    # Add bond form
│   │   │   └── [id]/page.tsx   # Single bond detail
│   │   │
│   │   ├── check/
│   │   │   ├── page.tsx        # Check bonds against draws
│   │   │   └── results/
│   │   │       └── page.tsx    # Match results display
│   │   │
│   │   └── settings/
│   │       └── page.tsx        # Account settings
│   │
│   └── api/
│       └── ...                 # API routes (auth, bonds, draws, matches)
│
├── components/
│   ├── ui/                     # Customized shadcn primitives
│   │   ├── button.tsx          # Custom variant system
│   │   ├── card.tsx            # Card with elevation variants
│   │   ├── input.tsx           # Custom input with validation states
│   │   ├── dialog.tsx          # Animated dialog with spring
│   │   ├── sheet.tsx           # Mobile drawer (bottom sheet, not left)
│   │   ├── skeleton.tsx        # Layout-matching skeletons
│   │   ├── badge.tsx           # Denomination badges
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx         # Desktop sidebar nav
│   │   ├── mobile-nav.tsx      # Bottom nav bar (mobile)
│   │   ├── header.tsx          # Top bar with breadcrumb
│   │   └── shell.tsx           # App shell (sidebar + content)
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── auth-card.tsx       # Branded auth card wrapper
│   │   └── auth-guard.tsx      # Auth boundary
│   │
│   ├── bonds/
│   │   ├── bond-card.tsx       # Individual bond display
│   │   ├── bond-list.tsx       # Bond list with sort/filter
│   │   ├── bond-form.tsx       # Add bond form
│   │   ├── bond-delete-dialog.tsx
│   │   ├── denomination-picker.tsx  # Visual denomination selector
│   │   └── bond-skeleton.tsx
│   │
│   ├── dashboard/
│   │   ├── portfolio-summary.tsx    # Total bonds counter (animated)
│   │   ├── denomination-breakdown.tsx  # By-denomination cards
│   │   ├── recent-winners.tsx       # Recent match list
│   │   ├── quick-actions.tsx        # Action buttons
│   │   └── dashboard-skeleton.tsx
│   │
│   ├── check/
│   │   ├── check-button.tsx         # "Check My Bonds" CTA
│   │   ├── results-panel.tsx        # Match results
│   │   ├── match-card.tsx           # Individual match
│   │   └── no-matches.tsx           # Empty results state
│   │
│   └── shared/
│       ├── empty-state.tsx          # Configurable empty state
│       ├── error-state.tsx          # Configurable error state
│       ├── page-transition.tsx      # Page transition wrapper
│       ├── animated-counter.tsx     # Animated number counter
│       └── logo.tsx                 # Brand logo (custom SVG)
│
├── hooks/
│   ├── use-bonds.ts                # Bond CRUD with TanStack Query
│   ├── use-matches.ts              # Match checking
│   ├── use-auth.ts                 # Auth hook
│   ├── use-animation-scope.ts      # Scroll-triggered animations
│   └── use-media-query.ts          # Responsive breakpoints
│
├── lib/
│   ├── db.ts                       # D1 client
│   ├── auth.ts                     # Better Auth config
│   ├── validations.ts              # Zod schemas (bond, auth)
│   ├── constants.ts                # Denominations, prize tiers
│   └── utils.ts                    # Formatting, bond number validation
│
├── styles/
│   └── globals.css                 # Tailwind directives + custom CSS vars
│
├── public/
│   ├── illustrations/
│   │   ├── empty-bonds.svg         # Custom illustration
│   │   ├── no-matches.svg
│   │   ├── error.svg
│   │   └── welcome.svg
│   └── sounds/                     # Subtle UI sounds (optional)
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Page-by-Page Design

### 3.1 Landing / Redirect

**Route:** `/`

**Behavior:** If logged in → redirect to `/vault`. If not → redirect to `/login`.

No landing page. This is a tool, not a marketing site. The dashboard IS the product.

---

### 3.2 Login Page

**Route:** `/login`

**Design:**
- Centered card, not full-width. Max width 440px.
- Card has `elevation-3` with warm-50 background.
- Above card: BondVault wordmark in Playfair Display, gold accent on "Vault."
- Subtle decorative element: geometric pattern inspired by Islamic geometry (hexagonal tile pattern), very low opacity (5%), behind the card.
- Form fields: Warm-toned inputs with gold focus ring. Floating labels that animate up on focus (not static placeholders).
- "Sign In" button: Gold gradient (`gold-400` to `gold-500`), 48px height, scales to 0.97 on press with spring.
- Divider: "or" text with hairline lines on either side.
- "Create account" link at bottom.
- "Forgot password?" as subtle text link.

**Animations:**
- Card fades in + slides up 24px on mount (spring, 400ms).
- Form fields stagger in with 50ms delay each.
- Error shake animation if login fails (horizontal spring wobble).
- Button loading state: text fades to spinner, width preserved.

**States:**
- Default: clean form
- Validating: real-time email format check
- Submitting: button shows spinner, all fields disabled
- Error: error banner slides in from top of card with gold-200 background, specific message
- Success: brief success flash, then redirect

---

### 3.3 Registration Page

**Route:** `/register`

**Design:**
- Same layout as login (visual consistency).
- Additional field: confirm password.
- Password strength meter: 4-segment bar below password field. Animated segments fill based on zxcvbn score. Each segment changes color (warm-300 → warm-400 → gold-300 → emerald-400).
- Real-time validation: email format, password length ≥ 8, passwords match.

**Animations:**
- Same card entrance as login.
- Strength meter segments animate with spring.
- Checkmark appears with spring scale when passwords match.

---

### 3.4 Dashboard (Vault)

**Route:** `/vault`

**Layout:**
- Desktop: Sidebar (left, 260px fixed) + content area.
- Tablet: Collapsible sidebar (icon-only, 64px) + content.
- Mobile: Bottom navigation bar (5 icons: Vault, Bonds, Check, Add, Settings) + content above.

**Sidebar Design:**
- dark emerald-900 background with gold text.
- Brand wordmark at top.
- Nav items with icon + label. Active item has gold-500 left border accent and gold-100/10 background.
- User avatar + email at bottom.

**Dashboard Content:**

```
┌──────────────────────────────────────────────────┐
│  Welcome back, Ahmad                              │
│  Your bond vault                                  │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │ Total Bonds  │  │  Checking    │  │  Matches ││
│  │              │  │  Available   │  │  Found   ││
│  │    247       │  │  Last draw   │  │    12    ││
│  │  bonds       │  │  Jun 15 '26  │  │  winners ││
│  └──────────────┘  └──────────────┘  └──────────┘│
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  By Denomination                             │ │
│  │                                               │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │ │
│  │  │ Rs 100 │ │ Rs 200 │ │ Rs 750 │ │Rs 1500 │ │ │
│  │  │   ···  │ │   ···  │ │   ···  │ │   ···  │ │ │
│  │  │ 24     │ │ 67     │ │ 13     │ │  5     │ │ │
│  │  │ bonds  │ │ bonds  │ │ bonds  │ │ bonds  │ │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Recent Winners              Check All Bonds →    │
│  ┌──────────────────────────────────────────────┐ │
│  │ 🏆 Rs 40,000 — Bond #447892 — Draw Jun 1    │ │
│  │ 🏆 Rs 15,000 — Bond #128367 — Draw May 15   │ │
│  │ 🏆 Rs 7,500  — Bond #882341 — Draw May 15   │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Dashboard Cards:**
- Not standard `rounded-xl border shadow-sm p-6` cards.
- Stat cards: subtle glass-morphism with `backdrop-blur`, elevation-2, warm-50/80 background.
- Denomination cards: Each denomination has a distinct accent color (100 = warm, 200 = amber, 750 = rose, 1500 = violet, 7500 = emerald, 25000 = gold, 40000 = premium gradient).
- Animated counters: Numbers count UP on mount with spring physics.

**Chart (Denomination Breakdown):**
- NOT a standard bar chart. Custom horizontal stacked bar — each segment is a denomination, proportional width, animated in sequence. Clicking a segment navigates to bonds filtered by that denomination.
- OR: circular donut with denomination segments, center shows total count.

**Empty State (first-time user):**
- Full-bleed illustration: open vault with a single bond floating into it.
- "Your vault is empty" heading in Playfair.
- "Add your first prize bond to get started" subtext.
- Large "Add Bond" CTA button (gold gradient).
- Quick tutorial: 3-step visual guide (Add → Organize → Check).

---

### 3.5 Bond List

**Route:** `/bonds`

**Design:**
- Filter bar at top: denomination chips (pill-shaped, single-select with "All" default).
- Search input for bond number lookup.
- Sort: "Newest first" / "Oldest first" / "Denomination" toggle.
- Bond items: NOT in a table. Cards in a responsive grid (1 col mobile, 2 tablet, 3 desktop).
- Each bond card:
  - Large bond number in JetBrains Mono, `tabular-nums`.
  - Denomination badge (color-coded, pill shape).
  - Added date (subtle).
  - Delete button (trash icon, destructive hover state with red tint).
- Pagination: "Load more" button (not numbered pages). Infinite scroll optional.

**States:**
- Loading: Grid of skeleton cards matching exact layout.
- Empty: "No bonds yet" illustration + "Add your first bond" CTA.
- Filtered empty: "No Rs. 1500 bonds found" + "Clear filter" link.
- Error: "Couldn't load bonds" + Retry button.

---

### 3.6 Add Bond

**Route:** `/bonds/add`

**Design:**
- Not a separate page — a sheet/drawer that slides up from bottom on mobile, or a modal on desktop.
- Denomination selector: Visual grid of denomination cards. Each card shows the denomination value (Rs. 100, Rs. 200, etc.) in large Playfair Display, with a distinct color tint. Selected card has gold border + subtle glow.
- Bond number input: Large text input, JetBrains Mono, centered. Shows character count. Auto-formats as user types (inserts spaces or groups digits for readability).
- Validation: real-time. Green checkmark if valid format + not duplicate. Red warning if duplicate exists.
- "Add Bond" button: Full-width, gold. Disabled until valid.

**Animation:**
- Sheet slides up with spring (300ms, damping 0.25).
- Denomination cards scale in with stagger (50ms delay each).
- Selected card pulses briefly (scale 1.02 → 1.0).
- Success: sheet dismisses with slide-down, new bond appears in list with scale-in animation.
- Error: input shakes horizontally if duplicate detected.

**States:**
- Default: denomination unselected, input empty.
- Selecting: denomination highlight animates.
- Typing: character count updates, validation feedback real-time.
- Valid: checkmark appears, button enables.
- Duplicate: shake + red warning text.
- Submitting: button loading.
- Success: toast "Bond added to vault" + sheet dismiss.
- Error: inline error message.

---

### 3.7 Check Bonds (Historical Draw Matching)

**Route:** `/check`

**Design:**
- Hero section: Large "Check Your Bonds" heading in Playfair.
- Subtext: "Match your entire portfolio against historical draw results in seconds."
- Primary CTA: "Check All Bonds" — large gold button, pulses subtly (ring animation on loop).
- Denomination filter chips (optional — check specific denominations).
- After checking:
  - Results panel slides in from right (desktop) or bottom (mobile).
  - Winners section: celebratory green gradient background, emerald-400 accent.
  - Non-winners: subtle gray-out (but still show they were checked).
  - Match cards: denomination badge + bond number + prize tier + amount + draw date.

**Results Display (hit):**
```
┌────────────────────────────────────────────┐
│  🎉  Congratulations!                       │
│                                              │
│  Bond #447892 (Rs. 200)                     │
│  Won 2nd Prize — Rs. 40,000                │
│  Draw #87 — June 1, 2026                   │
│                                              │
│  Bond #128367 (Rs. 200)                     │
│  Won 3rd Prize — Rs. 15,000                │
│  Draw #86 — May 15, 2026                    │
└────────────────────────────────────────────┘
```

**Results Display (no hits):**
```
┌────────────────────────────────────────────┐
│  Illustration: calm, reassuring             │
│                                              │
│  No winners this time                        │
│  247 bonds checked against the latest draws  │
│                                              │
│  "Keep your bonds in the vault —             │
│   we'll check every new draw automatically"  │
│                                              │
│  [Check Again]  [View Bonds]                │
└────────────────────────────────────────────┘
```

**States:**
- Idle: hero + CTA button.
- Checking: progress animation — bond cards flipping through rapidly (slot-machine effect for excitement).
- Results (winners found): celebratory animation — confetti burst (1 second), then results list.
- Results (no winners): gentle fade-in with reassuring illustration.
- Error: "Couldn't complete check" + retry.

---

### 3.8 Settings

**Route:** `/settings`

Minimal for MVP:
- Email display (read-only).
- Change password form.
- Delete account (with confirmation dialog).
- Logout button.

---

## 4. Animation & Motion System

### Framer Motion Variants (shared)

```typescript
// Staggered children
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

// Card hover
export const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: "0 1px 3px rgba(30,28,25,0.06)" },
  hover: {
    scale: 1.01,
    y: -2,
    boxShadow: "0 8px 16px rgba(30,28,25,0.08)",
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  press: {
    scale: 0.98,
    boxShadow: "0 1px 2px rgba(30,28,25,0.04)",
    transition: { type: "spring", stiffness: 600, damping: 30 },
  },
};
```

### Scroll-Triggered Animations
- Dashboard stat cards animate in as they scroll into view (Intersection Observer + framer-motion).
- Bond list items stagger in on scroll.

### Animated Number Counter
```typescript
// Counts from 0 to target with spring physics
// Used for: total bonds, per-denomination counts, match counts
<AnimatedCounter from={0} to={247} duration={1.5} />
```

---

## 5. Component Customizations (Overriding shadcn/ui Defaults)

### Button
- Gold gradient primary variant.
- 3 states: default (gold-500), hover (gold-400 + elevation bump), press (scale 0.97 + gold-600).
- Secondary: warm outline (warm-300 border, warm-50 bg).
- Destructive: rose/red subtle (not screaming red).
- Ghost: only shows background on hover (state layer pattern).
- Sizes: sm (36px), md (44px), lg (52px).
- Hit target minimum: 44px (Apple HIG compliant).

### Card
- No `border` class by default. Uses elevation instead.
- Variants: elevated, outlined, filled, glass.
- Padding: `p-5` (20px), not `p-6`.

### Input
- Gold focus ring (2px offset, 2px width).
- States: default, hover (warm-100 bg), focus (gold ring), error (rose ring), disabled (reduced opacity).
- Floating labels that animate up on focus/content.
- Help text and error text slots.

### Dialog/Modal
- Entrance: backdrop fade (150ms) → content scale-up (200ms, spring, staggered 50ms).
- Exit: content scale-down (150ms) → backdrop fade (100ms).
- Backdrop: warm-900/40 + blur, not black/50.

### Sheet (Mobile Drawer)
- Slides up from bottom (not from left — more thumb-friendly).
- Drag handle at top.
- Rubber-band overscroll at boundaries.

### Skeleton
- Exact layout match (not generic rectangles).
- Shimmer animation: left-to-right gradient sweep, 1.5s, ease-in-out.
- Color: warm-200 base, warm-100 highlight.

---

## 6. Responsive Strategy

### Breakpoints
```
  mobile:   < 640px   (single column, bottom nav)
  tablet:   640-1024px (2 columns, icon sidebar)
  desktop:  > 1024px   (full sidebar, multi-column)
```

### Mobile
- Bottom navigation bar: Vault (vault icon), Bonds (list icon), Add (+ button, larger, gold), Check (search icon), Settings (gear).
- Add button is prominent — 56px circle, gold, slightly elevated above nav bar.
- Sheets for forms (add bond, edit, confirm delete).
- Touch-friendly hit targets (min 44px).

### Tablet
- Icon-only sidebar (64px wide).
- 2-column grid for cards.
- Modals for forms.

### Desktop
- Full sidebar with labels (260px).
- 3-column grid for bond cards.
- Side panels for check results.

---

## 7. Progressive Web Patterns

### Loading Strategy
- `loading.tsx` at every route level — matches exact layout.
- Streaming: dashboard widgets load independently with Suspense boundaries.
- Optimistic updates: add bond → appears in list instantly → rollback on failure.
- Optimistic delete: bond fades out → toast with undo → rollback on failure.

### Error Boundaries
- `error.tsx` at every route level.
- Each error page: custom illustration + specific recovery action + "Go to vault" fallback.
- Inline errors for component-level failures (bond list fails → error card in grid, rest of dashboard still works).

---

## 8. Implementation Order

### Phase 1: Foundation (Week 1)
1. Scaffold Next.js 15 project with TypeScript strict mode.
2. Configure Tailwind with custom theme (colors, fonts, radius, shadows).
3. Set up font loading (Playfair Display + Satoshi + JetBrains Mono).
4. Customize shadcn/ui components (Button, Card, Input, Skeleton).
5. Create layout shell: Sidebar + Header + MobileNav.
6. Create shared components: Logo, EmptyState, ErrorState, PageTransition, AnimatedCounter.
7. Set up theme CSS variables in globals.css.

### Phase 2: Auth (Week 1-2)
8. Configure Better Auth.
9. Build login page with all states.
10. Build registration page with password strength.
11. Auth middleware + protected routes.
12. Auth guard component.

### Phase 3: Dashboard (Week 2)
13. Dashboard layout.
14. PortfolioSummary with animated counter.
15. DenominationBreakdown with animated chart.
16. RecentWinners widget.
17. QuickActions widget.
18. Dashboard empty state.
19. Dashboard skeleton.

### Phase 4: Bond Management (Week 2-3)
20. Bond list page with filters, search, sort.
21. Bond card component.
22. Add bond sheet/modal with denomination picker.
23. Bond form validation (Zod).
24. Delete bond with confirmation.
25. Bond skeleton states.

### Phase 5: Historical Check (Week 3)
26. Check page with CTA hero.
27. Check results panel.
28. Match card component.
29. Slot-machine checking animation.
30. Confetti celebration for winners.
31. No-winners state with illustration.

### Phase 6: Polish (Week 3-4)
32. Page transitions.
33. Scroll-triggered animations.
34. Toast system (Sonner, custom styled).
35. 404 page.
36. Accessibility audit (keyboard nav, focus rings, screen reader).
37. Dark mode (if time permits).
38. Performance optimization (image optimization, bundle analysis).

---

## 9. Verification

### Manual Testing Checklist
- [ ] Register with valid email/password → redirected to dashboard
- [ ] Register with duplicate email → inline error shown
- [ ] Register with weak password → strength meter shows "weak"
- [ ] Login with valid credentials → redirected to dashboard
- [ ] Login with wrong password → error banner with shake animation
- [ ] Logout → session cleared → redirected to login
- [ ] Add bond with valid denomination + number → bond appears in list with animation
- [ ] Add duplicate bond → shake animation + warning
- [ ] Delete bond → confirmation dialog → bond removed with fade
- [ ] Filter bonds by denomination → list updates
- [ ] Search bonds by number → filtered results
- [ ] Check bonds against draws → results panel appears
- [ ] Winners found → celebration animation + match cards
- [ ] No winners → reassuring empty state
- [ ] Dashboard loads with correct counts (animated)
- [ ] All loading states show correct skeleton layouts
- [ ] All error states show contextual recovery options
- [ ] Mobile: bottom nav works, sheets slide up
- [ ] Tablet: icon sidebar, grids adjust
- [ ] Desktop: full sidebar, multi-column layouts
- [ ] Keyboard navigation works throughout
- [ ] Focus rings visible on Tab, hidden on click
- [ ] Screen reader announces dynamic content changes

### Automated Testing
- Zod schema validation tests for bond numbers and auth.
- Component render tests for all states (loading, empty, error, default).
- Hook tests for useBonds, useAuth, useMatches.
- E2E: registration → add bond → check bonds → view results flow.

---

## 10. Key Design Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| No landing page | Redirect to login/vault | This is a tool, not a marketing site |
| Gold + Emerald palette | Pakistani-inspired, warm, premium | Avoids AI blue/indigo trap |
| Playfair Display headings | Serif for distinction | Most AI sites use Inter everywhere |
| Phosphor over Lucide | More personality, more styles | Lucide is the "AI default" |
| Bottom sheet on mobile | Slides up, not from left | Thumb-friendly, native feel |
| Custom shadcn variants | Every component customized | No "default shadcn" look |
| Framer Motion springs everywhere | Not CSS transitions | Interruptible, natural feel |
| Slot-machine check animation | Excitement + anticipation | Turns checking into a moment |
| Optimistic updates | Instant UI feedback | Feels fast, native-app-like |
| Context-aware empty states | Different art per context | Shows intentionality, not generic |
