# DESIGN CONSTRAINTS ADDENDUM
## Visual Identity & Aesthetic Laws — PortalOS

> Paste this section into the master build prompt after §11 (UI / DESIGN SYSTEM).
> These rules override any conflicting guidance in §11.
> Label it: **§11B — AESTHETIC LAWS (NON-NEGOTIABLE)**

---

## THE REFERENCE POINT

The visual language of this app is: **dark luxury precision.**
Think the interior of a Rolls-Royce Phantom. A Michelin-star restaurant menu.
A Bloomberg Terminal rebuilt by a luxury watchmaker. The Bugatti Tourbillon dashboard.
A private members club in Dubai where the lighting is always low and the surfaces are always matte.

Darkness is not a mode here — it is the identity.
Gold is not decoration — it is the signal of something mattering.
Every screen should feel like it costs something to look at.

The closest design references are:
- **Rolls-Royce configurator** — dark surfaces, gold interaction states, zero clutter
- **A. Lange & Söhne watch dials** — extreme precision, warm gold against near-black
- **Centurion (Amex Black) card portal** — dark UI that communicates exclusivity without saying so
- **Aston Martin website** — dark backgrounds, surgical typography, gold/bronze accents
- **Dieter Rams's product philosophy** — "Good design is as little design as possible"
  but applied to a dark, luxurious surface instead of a white one

If a design choice would look at home on a free Figma community template — **reject it immediately.**

---

## WHAT TO DO

### Typography

- **Primary typeface: serif.** Use `Playfair Display` (Google Fonts) for all display text,
  headings H1–H3, and hero copy. Playfair has the contrast between thick and thin strokes
  that makes gold-on-dark typography feel engraved, not printed.
- **Secondary typeface: refined sans.** Use `DM Sans` for body text, labels, UI elements,
  table content, metadata, and any text under 15px.
- **Never mix more than these two fonts.** Monospace (`JetBrains Mono`) for invoice numbers,
  amounts, and code only — it reads like a bank statement in the best possible way.
- Heading size hierarchy in Playfair Display:
  ```
  Display:  56px / weight 400 / line-height 1.05 / letter-spacing -0.02em
  H1:       40px / weight 400 / line-height 1.12 / letter-spacing -0.015em
  H2:       28px / weight 400 / line-height 1.22 / letter-spacing -0.01em
  H3:       20px / weight 500 / line-height 1.3
  Body:     15px DM Sans / weight 400 / line-height 1.7
  Label:    11px DM Sans / weight 500 / letter-spacing 0.08em / UPPERCASE
  Mono:     14px JetBrains Mono / weight 400 (amounts, IDs only)
  ```
- **Text on dark backgrounds:**
  - Headings: `var(--ink-primary)` — warm off-white, never pure `#FFFFFF`
  - Body: `var(--ink-secondary)` — slightly dimmed, creates natural hierarchy
  - Labels: `var(--ink-tertiary)` — barely visible, ghostlike
  - Gold-highlighted text (invoice totals, plan tier, key figures): `var(--gold-400)`
- Kerning on all display text: `font-kerning: normal; font-feature-settings: "kern" 1, "liga" 1, "onum" 1;`
  The `onum` feature activates old-style numerals in Playfair — they sit better with mixed text.
- **Numbers in data tables and invoices:** always `JetBrains Mono`, right-aligned,
  `var(--gold-400)` color for totals and key figures.

---

### Color Palette — "Obsidian & Gold"

This is a dark-first design system. There is no "light mode default."
The dark palette IS the default. Light mode is the secondary variant.

```css
:root {
  /* ── BACKGROUNDS — layered depth, never flat black ── */
  --bg-void:        #0A0A0B;   /* deepest layer — page background, behind everything */
  --bg-base:        #111113;   /* main app surface */
  --bg-surface:     #18181B;   /* cards, panels, sidebar */
  --bg-elevated:    #1F1F23;   /* modals, dropdowns, popovers */
  --bg-sunken:      #0D0D0F;   /* inputs, code blocks, inset wells */
  --bg-overlay:     rgba(0, 0, 0, 0.72);  /* modal backdrop */

  /* ── INK — text on dark surfaces ── */
  --ink-primary:    #F2F0EB;   /* warm off-white — headlines, primary labels */
  --ink-secondary:  #A09E99;   /* body text, descriptions */
  --ink-tertiary:   #5C5A56;   /* captions, placeholders, disabled labels */
  --ink-ghost:      #2E2D2A;   /* barely visible — decorative text elements */

  /* ── GOLD — the signature accent ── */
  --gold-100:       rgba(212, 175, 55, 0.08);   /* gold tint backgrounds */
  --gold-200:       rgba(212, 175, 55, 0.15);   /* gold hover backgrounds */
  --gold-300:       #8A6F2E;   /* muted gold — inactive states */
  --gold-400:       #C9A84C;   /* primary gold — numbers, amounts, key labels */
  --gold-500:       #D4AF37;   /* pure gold — CTA buttons, active states, focus rings */
  --gold-600:       #E8C76A;   /* bright gold — hover on gold elements */
  --gold-700:       #F5DFA0;   /* near-white gold — hero display moments */

  /* ── SEMANTIC COLORS — dark-tuned ── */
  --status-success-bg:     rgba(34, 85, 50, 0.25);
  --status-success-text:   #6FCF97;
  --status-success-border: rgba(111, 207, 151, 0.20);

  --status-warning-bg:     rgba(180, 120, 20, 0.20);
  --status-warning-text:   #F2C94C;
  --status-warning-border: rgba(242, 201, 76, 0.20);

  --status-danger-bg:      rgba(140, 30, 30, 0.25);
  --status-danger-text:    #EB5757;
  --status-danger-border:  rgba(235, 87, 87, 0.20);

  --status-neutral-bg:     rgba(255, 255, 255, 0.04);
  --status-neutral-text:   var(--ink-secondary);
  --status-neutral-border: var(--border-default);

  /* ── BORDERS — almost invisible on dark surfaces ── */
  --border-default: rgba(255, 255, 255, 0.06);
  --border-medium:  rgba(255, 255, 255, 0.10);
  --border-strong:  rgba(255, 255, 255, 0.18);
  --border-gold:    rgba(212, 175, 55, 0.35);

  /* ── SHADOWS ── */
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.30);
  --shadow-sm:  0 2px 8px  rgba(0, 0, 0, 0.40),
                0 1px 2px  rgba(0, 0, 0, 0.30);
  --shadow-md:  0 4px 20px rgba(0, 0, 0, 0.50),
                0 2px 6px  rgba(0, 0, 0, 0.40);
  --shadow-lg:  0 8px 40px rgba(0, 0, 0, 0.60),
                0 4px 12px rgba(0, 0, 0, 0.40);
  --shadow-xl:  0 20px 80px rgba(0, 0, 0, 0.70),
                0 8px 24px  rgba(0, 0, 0, 0.50);

  /* Gold glow — ONLY on primary CTA and approved/paid states */
  --shadow-gold-sm: 0 2px 12px rgba(212, 175, 55, 0.25),
                    0 0px 4px  rgba(212, 175, 55, 0.15);
  --shadow-gold-md: 0 4px 24px rgba(212, 175, 55, 0.30),
                    0 0px 8px  rgba(212, 175, 55, 0.20);

  /* Inner glow — active/selected card states */
  --glow-gold-inset: inset 0 0 0 1px rgba(212, 175, 55, 0.25),
                     inset 0 1px 0   rgba(212, 175, 55, 0.08);
}
```

---

### Light Mode Palette — "Platinum"
Light mode is secondary but must still feel premium — not like a different product.

```css
[data-theme="light"] {
  --bg-void:        #F0EEE9;
  --bg-base:        #F7F5F0;   /* warm platinum, not clinical white */
  --bg-surface:     #FFFFFF;
  --bg-elevated:    #FFFFFF;
  --bg-sunken:      #ECEAE4;

  --ink-primary:    #1A1814;
  --ink-secondary:  #5A5650;
  --ink-tertiary:   #9A9590;

  --gold-400:       #A07820;
  --gold-500:       #B8881A;
  --gold-600:       #C99820;

  --border-default: rgba(0, 0, 0, 0.07);
  --border-medium:  rgba(0, 0, 0, 0.12);
  --border-strong:  rgba(0, 0, 0, 0.22);
  --border-gold:    rgba(180, 140, 30, 0.35);

  --shadow-sm: 0 2px 8px  rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05);
}
```

---

### Depth System — How Dark Layers Work

On dark surfaces, depth is created by **layered backgrounds getting slightly lighter
as they come forward.** Shadows reinforce this — they do not create it alone.

```
Layer 0 — void:     #0A0A0B  ← page background, outermost shell
Layer 1 — base:     #111113  ← main content area
Layer 2 — surface:  #18181B  ← cards, kanban columns, sidebar panel
Layer 3 — elevated: #1F1F23  ← modals, dropdowns, tooltips
Layer 4 — floating: #252529  ← context menus, command palette
```

Each layer is roughly 6–8 lightness points above the last.
The sidebar sits at Layer 2. The main content area at Layer 1.
The sidebar appears to float in front of the page naturally — no heavy border needed.

---

### Gold Usage Rules — Strict Rationing

Gold must be rationed like a spice. Enough to notice. Never enough to overwhelm.

**Gold IS used for:**
- Primary CTA buttons (the single most important action per screen)
- Active nav item — a `2px solid var(--gold-500)` left border, nothing more
- Invoice totals, payment amounts, "Paid" status
- Plan/tier badges ("Agency Plan", "Pro")
- Input focus ring: `box-shadow: 0 0 0 3px rgba(212,175,55,0.20)`
- Approved deliverable state icon
- Key money/achievement metrics on the dashboard
- Hover on list items — a barely-there `2px solid var(--gold-300)` left edge
- The PortalOS logo/wordmark

**Gold is NOT used for:**
- Body text or paragraph copy
- Large background fills
- Decorative borders on every card
- Generic icon colors
- More than 2–3 elements per screen

**The test:** Cover all gold elements with your hand. If the screen still reads clearly,
the gold is placed correctly — it is accenting, not holding the design together.

---

### Surface Texture & Card Treatment

**Noise layer** — removes "screen glow" flatness, adds tactile matte quality:
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>");
  z-index: 9999;
}
```

**Card top-edge highlight** — creates the illusion of light catching the card's physical edge:
```css
.card {
  border: 1px solid var(--border-default);
  border-top-color: rgba(255, 255, 255, 0.10);
  background: var(--bg-surface);
  border-radius: 10px;
}
```

**Gold card variant** — for selected, premium, or active states:
```css
.card--gold {
  border: 1px solid var(--border-gold);
  box-shadow: var(--glow-gold-inset), var(--shadow-md);
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.04) 0%,
    transparent 60%
  );
}
```
Used on: currently selected project, active invoice, featured pricing tier.

---

### Spacing & Layout

- 12-column grid, 24px gutters, 48px side margins desktop.
- Content max-width: 1280px. Never wider.
- All vertical spacing: multiples of 8px. Preferred: 8, 16, 24, 32, 48, 64, 80, 96, 128.
- Cards: `border-radius: 10px`. Never exceed 14px on rectangular containers.
- Pill shape (`border-radius: 999px`): status badges and avatar initials only.
- Sidebar: 240px fixed. Collapses off-screen on mobile — does not shrink to icons.
- Landing page section padding: 128px minimum top and bottom.

---

### Shadows (Dark Mode Specific)

Dark shadows must be deeper and more opaque than light-mode equivalents to read.

- Cards at rest: `border: 1px solid var(--border-default)` + `var(--shadow-sm)`
- Cards on hover: `border-color → var(--border-medium)` + `var(--shadow-md)` + `translateY(-2px)`
- Modals: `var(--shadow-xl)` + backdrop blur(8px) on the **backdrop only**, not the modal panel
- CTA buttons: `var(--shadow-gold-sm)` rest, `var(--shadow-gold-md)` hover
- Dragging Kanban card: `var(--shadow-xl)` + `scale(1.02)` + `border: 1px solid var(--border-gold)`

---

### Interactive States

**Primary button (gold):**
```css
background: var(--gold-500);
color: #0A0A0B;        /* dark text ON the gold — not white */
font-weight: 500;
font-size: 14px;
letter-spacing: 0.02em;
box-shadow: var(--shadow-gold-sm);
border-radius: 8px;
```
Hover: `background: var(--gold-600)`, `box-shadow: var(--shadow-gold-md)`
Pressed: `scale(0.98)`, `background: var(--gold-400)`

**Secondary button:**
```css
background: transparent;
border: 1px solid var(--border-medium);
color: var(--ink-primary);
```
Hover: `border-color: var(--border-strong)`, `background: rgba(255,255,255,0.04)`

**Ghost button:** no border, no background. `color: var(--ink-secondary)`.
Hover: `color: var(--ink-primary)`, `background: rgba(255,255,255,0.04)`

**Destructive button:**
```css
background: transparent;
border: 1px solid rgba(235, 87, 87, 0.30);
color: var(--status-danger-text);
```
Hover: `background: var(--status-danger-bg)`

**Input:**
```css
background: var(--bg-sunken);
border: 1px solid var(--border-default);
color: var(--ink-primary);
border-radius: 8px;
```
Focus: `border-color: var(--border-gold)`,
`box-shadow: 0 0 0 3px rgba(212,175,55,0.12)`

**Links:** `color: var(--gold-400)`, no underline at rest, `text-decoration: underline` on hover.

**Disabled:** `opacity: 0.35`. Never hide — only dim.

---

### Status Badges

All badges: `border-radius: 999px`, `font-size: 11px`, `font-weight: 500`,
`letter-spacing: 0.05em`, `padding: 3px 10px`, text UPPERCASE.

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Active / Approved | `--status-success-bg` | `--status-success-text` | `--status-success-border` |
| In Review | `rgba(212,175,55,0.12)` | `var(--gold-600)` | `rgba(212,175,55,0.25)` |
| Draft | `rgba(255,255,255,0.04)` | `var(--ink-tertiary)` | `var(--border-default)` |
| Paid | `rgba(212,175,55,0.10)` | `var(--gold-500)` | `var(--border-gold)` |
| Overdue | `--status-danger-bg` | `--status-danger-text` | `--status-danger-border` |
| Archived | `transparent` | `var(--ink-ghost)` | `var(--border-default)` |

---

### Iconography

- `Lucide React` only. No mixing.
- 16px inline, 20px standalone actions, 24px empty states.
- Default: `var(--ink-tertiary)`. Hover: `var(--ink-secondary)`.
- Gold icons ONLY for: paid invoice checkmark, approved deliverable, active plan badge.
- Never wrap an icon in a colored circle/square unless it is an avatar.

---

### Motion

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — deceleration. Physical. Precise.
- Durations: 150ms micro, 200ms small, 250ms medium, 350ms page.
- Page transitions: `opacity: 0→1` + `y: 8→0`, 250ms.
- Modal: `scale: 0.96→1` + `opacity: 0→1`, 200ms.
- Gold elements transition 20ms slower than neutral ones — gives gold a sense of weight.
- Kanban drag: `scale(1.02)` + gold border appears + `var(--shadow-xl)`.
- Dashboard stat count-up: 800ms ease-out, `JetBrains Mono`, gold color.
- Respect `prefers-reduced-motion` — all animations disable gracefully.
- **No bounce. No spring physics. No elastic easing. Ever.**
  This is precision engineering. Not a toy.

---

### Landing Page Specific

- **Hero:** 100vh, `--bg-void` background + noise texture. Nothing else — no gradient, no particles.
- **Headline:** Playfair Display, 56px, weight 400, `--ink-primary`. Maximum 8 words.
- **Gold rule:** a single `1px` horizontal line in `var(--gold-500)`, 48px wide, centered
  between headline and subheadline. The only decoration in the hero.
- **Subheadline:** DM Sans, 18px, `--ink-secondary`, max 16 words.
- **CTA:** gold primary button. Below it: `"No credit card required"` in
  11px DM Sans, `--ink-tertiary`, `letter-spacing: 0.06em`.
- **Section labels:** `──── FEATURES` — 11px DM Sans uppercase, `--gold-400`,
  with `32px / 1px solid var(--gold-300)` line to the left.
- **Scroll animations:** `opacity: 0→1` + `y: 16→0`, staggered 60ms. Barely perceptible.
- **Testimonial cards:** `--bg-surface`. Behind the quote text, a Playfair Display `"` at 80px,
  `var(--gold-100)` — enormous, decorative, almost invisible.
- **Pricing:** recommended tier gets `var(--glow-gold-inset)` + `var(--border-gold)`.
  Others: flat `--bg-surface`.
- **Footer:** `--bg-void`. Separated by `1px solid var(--border-default)` only.

---

### Empty States

- SVG illustration: sparse geometric linework, `var(--gold-300)` stroke on dark field.
  A diamond outline. A minimal grid. An abstract unfurling form.
  NOT: cute characters, isometric 3D, colorful mascots.
- Headline: Playfair Display H3, `--ink-primary`.
- Subtext: DM Sans 14px, `--ink-tertiary`.
- CTA: gold primary button.

---

### Loading Skeletons

```css
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface)  25%,
    var(--bg-elevated) 50%,
    var(--bg-surface)  75%
  );
  background-size: 1200px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  border-radius: 6px;
}
```

The shimmer moves from dark to slightly lighter dark — a scan of light across a matte surface.
Never a bright flash. Never a blue or purple tint.

---

## WHAT NOT TO DO — THE BANNED LIST

### Banned Colors
- ❌ `#6366F1` Indigo, `#8B5CF6` Violet, `#3B82F6` Blue — the AI-SaaS trinity
- ❌ Pure `#FFFFFF` text on dark — too harsh. Use `--ink-primary` (`#F2F0EB`)
- ❌ Pure `#000000` backgrounds — flat and depthless. Use `--bg-void` (`#0A0A0B`)
- ❌ `#FFD700` bright yellow-gold — cheap. Use `--gold-500` (`#D4AF37`) only
- ❌ Any neon: `#00FF88`, `#FF00FF`, `#00FFFF` — nightclub, not luxury
- ❌ Multi-color gradients (`linear-gradient(purple, blue)`) — immediately dated
- ❌ "Aurora" or "mesh gradient" hero backgrounds
- ❌ Glassmorphism with colored backgrounds behind the blur
- ❌ Red as a brand or accent color — reads as error state only

### Banned Typography
- ❌ `Inter` or `Geist` for headings — system UI fonts, not editorial
- ❌ `font-weight: 700 / 800 / 900` in any heading
- ❌ Glow effects on text (`text-shadow: 0 0 20px gold`)
- ❌ Gradient text (`bg-clip-text bg-gradient-to-r`)
- ❌ Three or more font families
- ❌ Justified body text
- ❌ All-caps headings above H3 level

### Banned UI Patterns
- ❌ Gradient buttons — gold button is always solid
- ❌ Animated gradient borders on cards or inputs
- ❌ Pulsing notification dots (`animate-ping`)
- ❌ Particle or star-field background animations
- ❌ Floating 3D hero illustrations or Spline embeds
- ❌ Bento grid landing page layouts
- ❌ "Built with AI" badge anywhere user-visible
- ❌ Progress bars with gradient fills — solid gold only
- ❌ Colorful avatar backgrounds — `--bg-elevated` with `--ink-primary` initials
- ❌ Colored sidebar icons (red, green, blue per section) — all `--ink-tertiary`, active gets gold
- ❌ Red notification badge on the bell — use gold
- ❌ Arrow-tip tooltip bubbles — flat dark tooltip, `border-radius: 6px`, no arrow
- ❌ Stats cards with colored gradient backgrounds
- ❌ `rounded-3xl` or `rounded-2xl` on rectangular containers
- ❌ Yellow emoji star ratings — SVG stars in `--gold-400` only
- ❌ Floating action button (FAB) in any corner

### Banned Code Patterns
- ❌ `className="bg-gradient-to-r from-* to-*"` anywhere
- ❌ `className="animate-pulse"` except skeleton shimmer
- ❌ `className="animate-bounce"` or `animate-ping"` — never
- ❌ `className="shadow-2xl"` — use `--shadow-*` CSS variables
- ❌ `className="rounded-3xl"` — max `border-radius: 10px`
- ❌ `className="text-transparent bg-clip-text"` — gradient text banned
- ❌ Any hardcoded hex not in the defined palette
- ❌ `color: white` or `color: black` — always use CSS variables

---

## AESTHETIC SELF-AUDIT CHECKLIST

Before delivering any screen, run through this:

- [ ] Could this screenshot appear on the Rolls-Royce or Aston Martin website? If no, redesign.
- [ ] Is every font Playfair Display, DM Sans, or JetBrains Mono?
- [ ] Is the background a dark layer from the depth system — not flat black or grey?
- [ ] Is gold used in 3 or fewer places? It should feel rare.
- [ ] Are shadows deep and dark, not cold grey or blue-tinted?
- [ ] Does the layout breathe — each element placed, not packed?
- [ ] Does visual hierarchy read instantly when you blur your eyes?
- [ ] Are hover/focus states visible but not theatrical?
- [ ] Does this screen feel like it belongs to a QAR 2,500/month product?
- [ ] Would a creative director at a Doha agency be proud to be seen using this?

If any answer is "no" — fix it before moving on.

---

## THE SINGLE RULE ABOVE ALL OTHERS

**Darkness is not absence. It is presence.**

A poorly designed dark UI looks like someone turned the lights off.
A beautifully designed dark UI feels like you are in a room where
someone made a deliberate decision about where every single light points.

The gold catches the eye exactly where you want it.
The layered darks create space that feels deep, not flat.
The serif headline feels engraved, not printed.

Every screen should make the person using it feel like
they are handling something rare. Something that cost something.
Something built for them specifically, and for no one else.

That is the standard. Build to it.
