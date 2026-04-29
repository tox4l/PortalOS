# DESIGN CONSTRAINTS ADDENDUM
## Visual Identity & Aesthetic Laws — PortalOS

> Paste this section into the master build prompt after §11 (UI / DESIGN SYSTEM).
> These rules override any conflicting guidance in §11.
> Label it: **§11B — AESTHETIC LAWS (NON-NEGOTIABLE)**

---

## THE REFERENCE POINT

The visual language of this app is: **Japanese editorial luxury**.
Think cherry blossom ink prints. Samurai sword steel. Washi paper texture.
Tea ceremony precision. Quiet confidence. Nothing loud. Nothing trying too hard.

The closest design references are:
- Bottega Veneta's website (restraint, negative space, editorial typography)
- Japanese architecture photography books (geometry, silence, shadow)
- A Hasselblad camera interface (precision, intentional, no decoration for its own sake)
- *Monocle* magazine layouts (serif editorial, clean grids, warm neutrals)

If a design choice would look at home on a Webflow template marketplace — **reject it.**

---

## WHAT TO DO

### Typography
- **Primary typeface: serif.** Use `Cormorant Garamond` (Google Fonts) for all display text,
  headings H1–H3, and hero copy. It has the ink-brush elegance of Japanese calligraphy
  translated into Latin letterforms.
- **Secondary typeface: geometric sans.** Use `DM Sans` for body text, labels, UI elements,
  table content, metadata, and any text under 15px.
- **Never mix more than these two fonts.** Monospace (`JetBrains Mono`) allowed for
  code blocks and invoice numbers only.
- Heading size hierarchy in Cormorant Garamond:
  ```
  Display:  56px / weight 300 (light) / line-height 1.1 / letter-spacing -0.02em
  H1:       40px / weight 400 / line-height 1.15 / letter-spacing -0.01em
  H2:       28px / weight 400 / line-height 1.25
  H3:       20px / weight 500 / line-height 1.3
  Body:     15px DM Sans / weight 400 / line-height 1.7
  Label:    12px DM Sans / weight 500 / letter-spacing 0.06em / UPPERCASE
  ```
- Paragraph text: always `color: var(--text-secondary)` — never pure black on white.
  Pure black (#000) is reserved for headings only.
- No font weight above 500 for DM Sans in UI elements.
  Hierarchy is created through size and color, not bold.
- Kerning on all display text: `font-kerning: normal; font-feature-settings: "kern" 1, "liga" 1;`

### Color Palette — "Cherry Blossom & Gold Steel"

```css
:root {
  /* Backgrounds — washi paper warmth, never pure white */
  --bg-base:        #FDFAF7;   /* warm off-white, like aged paper */
  --bg-surface:     #F7F3EE;   /* card surface — one shade darker */
  --bg-sunken:      #EDE8E1;   /* inputs, code blocks, inset areas */
  --bg-overlay:     rgba(20, 14, 8, 0.48); /* modal backdrops */

  /* Ink — primary text, never #000000 */
  --ink-primary:    #1A1410;   /* near-black with warm undertone */
  --ink-secondary:  #5C4F42;   /* muted warm brown */
  --ink-tertiary:   #9E8E7E;   /* labels, placeholders, captions */
  --ink-disabled:   #C8BDB0;

  /* Cherry Blossom — the accent, used sparingly */
  --blossom-100:    #FBF0F2;   /* tint backgrounds */
  --blossom-300:    #F2B8C3;   /* hover states, soft badges */
  --blossom-500:    #D4607A;   /* primary interactive accent — buttons, links, focus rings */
  --blossom-700:    #9C3350;   /* pressed state, dark badges */
  --blossom-900:    #5C1A2C;   /* text on blossom backgrounds */

  /* Gold Steel — secondary accent, used for premium moments */
  --gold-100:       #FBF5E6;
  --gold-300:       #E8C97A;
  --gold-500:       #C9981A;   /* "Paid" badges, plan badges, invoice totals */
  --gold-700:       #8C6510;
  --gold-900:       #4A3205;

  /* Borders — whisper thin */
  --border-default: rgba(90, 70, 50, 0.10);  /* barely-there dividers */
  --border-medium:  rgba(90, 70, 50, 0.18);  /* card edges */
  --border-strong:  rgba(90, 70, 50, 0.30);  /* focused inputs */

  /* Shadows — warm-toned, never cold grey */
  --shadow-xs:  0 1px 2px rgba(30, 18, 8, 0.04);
  --shadow-sm:  0 2px 6px rgba(30, 18, 8, 0.06),
                0 1px 2px rgba(30, 18, 8, 0.04);
  --shadow-md:  0 4px 16px rgba(30, 18, 8, 0.08),
                0 2px 4px  rgba(30, 18, 8, 0.04);
  --shadow-lg:  0 8px 32px rgba(30, 18, 8, 0.10),
                0 2px 8px  rgba(30, 18, 8, 0.06);
  --shadow-xl:  0 20px 60px rgba(30, 18, 8, 0.14),
                0 4px 16px rgba(30, 18, 8, 0.08);

  /* Gold glow — for premium elements only */
  --shadow-gold: 0 4px 20px rgba(201, 152, 26, 0.20),
                 0 1px 4px  rgba(201, 152, 26, 0.12);
}
```

### Dark Mode Palette — "Night Forge"
```css
[data-theme="dark"] {
  --bg-base:        #120E0B;   /* near-black with warm undertone, like soot */
  --bg-surface:     #1C1612;   /* card surface */
  --bg-sunken:      #0D0A07;   /* deepest inset */

  --ink-primary:    #F0E8DF;   /* warm cream, not pure white */
  --ink-secondary:  #B0A090;
  --ink-tertiary:   #6E5E50;

  --blossom-500:    #E8738A;   /* slightly lighter in dark mode */
  --gold-500:       #D4A82A;

  --border-default: rgba(240, 220, 190, 0.08);
  --border-medium:  rgba(240, 220, 190, 0.14);
  --border-strong:  rgba(240, 220, 190, 0.24);

  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.30),
               0 2px 4px  rgba(0, 0, 0, 0.20);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.40),
               0 2px 8px  rgba(0, 0, 0, 0.24);
}
```

### Spacing & Layout
- **Column grid:** 12-column, 24px gutters, 48px side margins on desktop.
- **Content max-width:** 1200px centered. Never let content run to the browser edge.
- **Vertical rhythm:** all vertical spacing in multiples of 8px.
  Preferred values: 8, 16, 24, 32, 48, 64, 80, 96, 128px.
- **Section breathing room:** sections on the landing page have a minimum of 120px
  vertical padding top and bottom. Content needs to breathe like a museum exhibit.
- **Cards:** `border-radius: 12px` default. No more than 16px anywhere.
  Pill shapes (`border-radius: 999px`) only for status badges and avatar initials.

### Shadows & Depth
- Every card on `--bg-base` gets `box-shadow: var(--shadow-sm)` at rest.
- On hover, cards transition to `var(--shadow-md)` + `translateY(-2px)` over `200ms ease`.
- Modals use `var(--shadow-xl)` — they must feel like they are floating above the page,
  not pasted on top of it.
- Sidebar: `box-shadow: var(--shadow-lg)` on the right edge only:
  `box-shadow: 4px 0 24px rgba(30, 18, 8, 0.08);`
- **Gold-accented elements** (plan badges, invoice total, "Approved" state) use `var(--shadow-gold)`.
- Never use `filter: drop-shadow()` — always `box-shadow` on the element.

### Borders
- **Card borders:** `1px solid var(--border-medium)` — not just shadow, both.
- **Dividers inside cards:** `1px solid var(--border-default)` — even thinner.
- **Inputs at rest:** `1px solid var(--border-medium)`
- **Inputs on focus:** `1px solid var(--blossom-500)` + `box-shadow: 0 0 0 3px rgba(212, 96, 122, 0.12)`
- **No outline on focused buttons** — replace with the ring shadow above.

### Iconography
- Use `Lucide React` exclusively. No mixing icon sets.
- Icon size in UI: 16px for inline, 20px for standalone actions, 24px for empty states.
- Icon color: always `var(--ink-tertiary)` at rest, `var(--ink-secondary)` on hover.
  Never use the brand accent color on icons unless they indicate a state (e.g. a filled star).
- **Line weight:** Lucide defaults are fine — do not override `stroke-width`.

### Motion
- All transitions: `cubic-bezier(0.16, 1, 0.3, 1)` — this is a deceleration curve
  that feels physical and deliberate, not bouncy or mechanical.
- Standard durations: 150ms (micro), 200ms (small), 250ms (medium), 350ms (page/large).
- Page transitions (Framer Motion): `y: 12` → `y: 0`, `opacity: 0` → `1`, 250ms.
- Modal enter: `scale: 0.97` → `scale: 1`, `opacity: 0` → `1`, 200ms.
- Hover lift: `translateY(-2px)`, 200ms. Never more than 3px lift.
- Number count-up on dashboard stats: 600ms duration, ease-out.
- No `ease-bounce`, no spring physics, no elastic — they feel playful, not refined.
- Respect `prefers-reduced-motion`: wrap all Framer Motion animations in a check.

### Interactive States
- **Primary button:** `background: var(--blossom-500)` + white text + `var(--shadow-sm)`.
  Hover: `background: var(--blossom-700)`. Pressed: `scale(0.98)`.
- **Secondary button:** `background: transparent`, `border: 1px solid var(--border-strong)`,
  `color: var(--ink-primary)`. Hover: `background: var(--bg-surface)`.
- **Ghost button:** no border, no background. Text color only. Hover: `background: var(--bg-sunken)`.
- **Destructive button:** `background: #C0392B`, white text. Hover: `background: #96281B`.
- **Disabled state:** `opacity: 0.38`. Never hide disabled elements — dim them.
- **Links:** `color: var(--blossom-500)`, no underline at rest, underline on hover.

### Status Badges
All badges use the pill shape (`border-radius: 999px`) and this sizing:
`font-size: 11px; font-weight: 500; letter-spacing: 0.04em; padding: 3px 10px;`

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Active / Approved | `#EAF5EE` | `#1E6B38` | `rgba(30,107,56,0.2)` |
| In Review | `#FBF0F2` | `--blossom-700` | `rgba(212,96,122,0.2)` |
| Draft | `--bg-sunken` | `--ink-secondary` | `var(--border-medium)` |
| Paid | `#FBF5E6` | `--gold-700` | `rgba(201,152,26,0.2)` |
| Overdue | `#FDF0EE` | `#A8341E` | `rgba(168,52,30,0.2)` |
| Archived | `--bg-sunken` | `--ink-tertiary` | `var(--border-default)` |

Never use raw green/red/yellow — always these warm-toned variants.

### Empty States
- Every empty state has: an inline SVG illustration (simple, linework only, blossom-colored strokes),
  a short headline in Cormorant Garamond H3, a one-line subtext in DM Sans,
  and a primary CTA button.
- Illustration style: sparse, elegant line art. Single continuous stroke aesthetic.
  Think: a single branch, a folded envelope, a blank canvas on an easel.
- No emojis in empty states. No "rocket ship" or "magnifying glass" clip art.

### Loading States
- Skeleton loaders use `background: var(--bg-sunken)` with a shimmer animation:
  ```css
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--bg-sunken) 25%,
      var(--bg-surface) 50%,
      var(--bg-sunken) 75%
    );
    background-size: 800px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: 6px;
  }
  ```
- **Never show a spinner** for page-level loading — only skeletons.
- Spinners allowed only for: button loading state (inline, 16px, replaces button text),
  and file upload progress.

### Landing Page Specific
- Hero section: min-height 100vh. Cormorant Garamond display headline, 56px,
  weight 300. One line. Maximum 8 words. No subheadline longer than 16 words.
- Use negative space aggressively — 60% of the hero should be empty.
- Hero background: `--bg-base` with a barely-visible texture (see §below on texture).
- Scroll-triggered animations: sections fade up (`y: 24 → 0`) as they enter viewport.
  Stagger children 80ms apart. Use Framer Motion `whileInView`.
- Section labels (above headings): `12px DM Sans / uppercase / letter-spacing: 0.1em / --ink-tertiary`
  with a 24px horizontal line on the left: `──── FEATURES`

### Texture (Use Subtly)
- Apply a washi paper texture SVG as a `background-image` on `--bg-base` at 3% opacity.
  Generate this as an inline SVG `<feTurbulence>` filter applied to a `<rect>`.
  It should be invisible unless you're looking for it — just enough to remove the "flat screen" feeling.
- Do NOT use stock texture images or external URLs.
- Only on the outermost background layer — never on cards or UI components.

---

## WHAT NOT TO DO — THE BANNED LIST

Every item below is a symptom of AI-generated "slop" design.
If you find yourself doing any of these, stop and redesign that element.

### Banned Colors
- ❌ `#6366F1` (Indigo) — the default Tailwind accent color used on 90% of AI-built SaaS
- ❌ `#8B5CF6` (Violet) — second most common AI-SaaS color
- ❌ `#3B82F6` (Blue 500) — every dashboard tutorial default
- ❌ Pure `#FFFFFF` backgrounds — clinical and flat
- ❌ Pure `#000000` text — too harsh, kills the warmth
- ❌ Any color with 100% saturation — they scream "Bootstrap default"
- ❌ Multi-color gradient backgrounds (`linear-gradient(purple, blue)`) — cheap, dated
- ❌ "Aurora" or "mesh gradient" backgrounds — peaked in 2022
- ❌ Glassmorphism (`backdrop-filter: blur` on colored panels) — overdone, illegible

### Banned Typography Decisions
- ❌ `font-family: Inter` for headings — Inter is a UI font, not an editorial font
- ❌ `font-weight: 700` or `800` (Extra Bold) in headings — looks aggressive, not refined
- ❌ All-caps headings larger than H3 — shouts, doesn't whisper
- ❌ `letter-spacing` on body text — only on small labels
- ❌ Mixing three or more font families — chaos
- ❌ Justified text alignment (`text-align: justify`) — creates rivers of whitespace

### Banned UI Patterns
- ❌ **Gradient buttons** — `background: linear-gradient(...)` on any button
- ❌ **Glowing buttons** — `box-shadow: 0 0 20px rgba(purple, 0.5)` on hover
- ❌ **Colorful sidebar** — no dark purple/blue sidebar with white icons
- ❌ **Notification dot that pulses** (the CSS `@keyframes pulse` ping animation) —
  every Tailwind dashboard template does this
- ❌ **Hero with a floating 3D illustration** or Spline embed — looks like a template
- ❌ **Excessive border-radius** — `border-radius: 24px` or higher on rectangular cards
- ❌ **Bento grid layouts** on the landing page — peaked in 2024, already cliché
- ❌ **"Built with AI" badge/chip** floating in the UI anywhere
- ❌ **Stats section with purple/blue gradient cards** showing MRR/ARR numbers
- ❌ **Star rating with yellow emoji stars** (⭐⭐⭐⭐⭐) in testimonials —
  use a minimal SVG star, monochrome
- ❌ **`bg-gradient-to-r from-purple-500 to-pink-500` on ANY text** (gradient text effect)
- ❌ **Floating action button (FAB)** in the bottom-right corner
- ❌ **Tooltip with an arrow bubble pointing up** — use a flat tooltip, no arrow
- ❌ **Skeleton loaders with blue or purple shimmer** — only warm neutral shimmer
- ❌ **"Powered by [model name]" badge** anywhere visible to end users
- ❌ **Progress bars with gradient fills** — solid color only
- ❌ **Dashboard with a dark sidebar + white main area** (the Vercel/Linear pattern) —
  this app uses a warm, light, unified surface instead
- ❌ **Avatar initials with solid bright-color backgrounds** (e.g., `bg-purple-500`) —
  use `var(--bg-sunken)` with `--ink-primary` text instead

### Banned Code Patterns (for visual output)
- ❌ `className="bg-gradient-to-r from-* to-*"` — anywhere
- ❌ `className="animate-pulse"` — for anything other than a loading skeleton shimmer
- ❌ `className="animate-bounce"` — never
- ❌ `className="shadow-2xl"` on cards (Tailwind's shadow-2xl is too heavy and cold-grey)
  — use the custom `--shadow-*` variables instead
- ❌ `className="rounded-3xl"` — too bubbly for this aesthetic
- ❌ `className="text-transparent bg-clip-text bg-gradient-to-r"` — gradient text
- ❌ Inline `style={{ color: '#8B5CF6' }}` or any hardcoded hex that isn't in the palette

---

## AESTHETIC SELF-AUDIT CHECKLIST

Before delivering any screen, run through this:

- [ ] Could this screenshot appear in a design system from a luxury brand? If no, redesign.
- [ ] Is every font on screen either Cormorant Garamond or DM Sans?
- [ ] Does the background have warmth (not clinical white or cold grey)?
- [ ] Is `--blossom-500` used in fewer than 3 places on this screen? (It should be rare.)
- [ ] Do the shadows have a warm undertone (`rgba(30, 18, 8, ...)`) not cold grey?
- [ ] Are there enough empty spaces that the content feels curated, not packed?
- [ ] If you blur your eyes, does the layout have a clear visual hierarchy?
- [ ] Is every interactive element's hover/focus state clearly visible but not gaudy?
- [ ] Would a designer at Bottega Veneta, Aesop, or Muji approve of this screen?

If any answer is "no" — fix it before moving on.

---

## THE SINGLE RULE ABOVE ALL OTHERS

**Restraint is sophistication.**

Every time you feel the urge to add another color, another animation,
another decorative element — remove something instead.

The white space, the quiet serif headline, the barely-there border,
the single cherry blossom accent on the active state —
*that* is what makes this feel like a $200/month tool instead of a $9/month one.

Less. Always less. Until it can't be less without losing meaning.
```
