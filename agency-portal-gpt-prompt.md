# MASTER BUILD PROMPT — Agency Client Ops Portal (Full Stack)
## For GPT-5.5 | Stateful Agentic Build Session

---

## ⚠️ CRITICAL RULE — READ BEFORE ANYTHING ELSE

Before you write a single line of code, create a file called `BUILD_LOG.md` in the root of the project.
Every time you complete a step, start a step, hit a decision point, or encounter an issue —
**update `BUILD_LOG.md` immediately.** Use the format below.

This file is your external memory. When another model or session picks up this project,
`BUILD_LOG.md` is the first file it reads. It must always reflect the true current state.

### BUILD_LOG.md format:

```
# Build Log — Agency Client Ops Portal

## Last updated: [TIMESTAMP]
## Current status: [IN PROGRESS | BLOCKED | COMPLETE]
## Active task: [exactly what you are doing RIGHT NOW]

---

## Completed
- [x] [Task name] — [brief note on what was done and any key decisions]
- [x] ...

## In Progress
- [ ] [Task name] — [what's left, any blockers]

## Pending (not started)
- [ ] [Task name]
- [ ] ...

## Key Decisions Log
| Decision | Choice Made | Reason |
|----------|-------------|--------|
| ORM | Prisma | Type-safe, good DX with Next.js |
| ... | ... | ... |

## File Map (update as files are created)
/
├── app/
│   ├── (auth)/
│   ├── (agency)/
│   ├── (client)/
│   └── api/
├── components/
├── lib/
├── prisma/
└── ...

## Blockers & Notes
- [Any issues, environment assumptions, TODOs for the human]
```

**Update BUILD_LOG.md after every single task. No exceptions.**

---

## 0. YOUR MANDATE

You are a senior full-stack engineer, UI/UX designer, and product architect.
Your job is to build a **production-ready, visually stunning SaaS platform** called **PortalOS** —
a white-label client operations portal for creative agencies.

You have full creative authority over implementation details, but you must follow the
architecture, feature set, and design philosophy described in this document precisely.

**Use every skill you have.** That means:
- Optimal data modeling and relational schema design
- Pixel-perfect, opinionated UI with motion and micro-interactions
- Real-time features via WebSockets/SSE where appropriate
- AI integration that feels useful, not gimmicky
- Security-first thinking on every route and mutation
- Performance: code splitting, image optimization, lazy loading, caching
- Accessibility: ARIA labels, keyboard navigation, focus rings, contrast ratios
- Developer experience: typed everything, clean abstractions, zero magic strings

You are not building an MVP prototype. You are building a product people will pay for.

---

## 1. PRODUCT OVERVIEW

**PortalOS** is a white-label SaaS platform that gives creative agencies a single hub to:
- Onboard new clients with a branded intake experience
- Manage projects with visual Kanban boards
- Collaborate on briefs and deliverables with real-time comments
- Get client approvals on work without email chains
- Invoice clients and collect payment — all in the same tool
- Give each client a beautiful, agency-branded portal with a custom subdomain

### Two distinct user types:
1. **Agency users** — the internal team. Full access to all clients and projects.
2. **Client users** — external guests. See only their own portal. No agency internals.

---

## 2. TECH STACK — USE EXACTLY THIS

```
Frontend / Framework:  Next.js 15 (App Router, React Server Components)
Language:              TypeScript (strict mode — no `any`, no `@ts-ignore`)
Styling:               Tailwind CSS v4 + CSS variables for theming
UI Components:         shadcn/ui (customized, not default) + Radix UI primitives
Animations:            Framer Motion (page transitions, micro-interactions, drag)
Icons:                 Lucide React
Database:              PostgreSQL (via Supabase or Railway)
ORM:                   Prisma (with full type generation)
Auth:                  NextAuth.js v5 (Google OAuth + Magic Link email)
Real-time:             Ably (presence, live comments, kanban updates)
AI:                    OpenAI API — GPT-4o (brief generation, smart summaries)
Payments/Billing:      Stripe (subscriptions for agency plans + invoicing for clients)
Email:                 Resend + React Email templates
File Storage:          Supabase Storage (deliverable uploads, assets)
Background Jobs:       Inngest (invoice reminders, onboarding drip)
Analytics:             PostHog (self-hosted events)
Deployment:            Vercel (with edge middleware for subdomain routing)
```

Do not substitute any of these without documenting the reason in `BUILD_LOG.md`
under "Key Decisions Log."

---

## 3. DATABASE SCHEMA

Design and implement the full Prisma schema. Every model must include:
- `id` as `cuid()` default
- `createdAt` and `updatedAt` timestamps
- Explicit foreign key relations with `onDelete` behavior defined

### Required models (expand with any junction tables you need):

```
Agency
  - id, name, slug (unique, used for subdomain), logo_url, brand_color (hex),
    brand_font, custom_domain (nullable), plan (enum: STARTER | PRO | AGENCY),
    stripe_customer_id, stripe_subscription_id, subscription_status

User
  - id, email (unique), name, avatar_url, role (enum: OWNER | ADMIN | MEMBER),
    agency_id (FK → Agency), email_verified, last_seen_at

Client
  - id, company_name, contact_name, contact_email, logo_url,
    portal_slug (unique), welcome_message, status (enum: ACTIVE | ARCHIVED),
    agency_id (FK → Agency)

ClientUser
  - id, email, name, client_id (FK → Client), last_login_at
  (Client-side users — NO access to agency internals)

Project
  - id, name, description, status (enum: DRAFT | ACTIVE | IN_REVIEW | COMPLETE | ARCHIVED),
    due_date, cover_image_url, agency_id (FK → Agency), client_id (FK → Client),
    created_by (FK → User)

Task
  - id, title, description, status (enum: TODO | IN_PROGRESS | IN_REVIEW | DONE),
    priority (enum: LOW | MEDIUM | HIGH | URGENT), due_date, position (float, for ordering),
    project_id (FK → Project), assignee_id (FK → User, nullable)

Deliverable
  - id, title, description, file_url, file_name, file_size, file_type,
    version (int, default 1), status (enum: DRAFT | PENDING_REVIEW | APPROVED | REJECTED),
    project_id (FK → Project), uploaded_by (FK → User), approved_by (FK → ClientUser, nullable),
    approved_at (nullable)

Comment
  - id, body, project_id (FK → Project), deliverable_id (FK → Deliverable, nullable),
    author_user_id (FK → User, nullable), author_client_user_id (FK → ClientUser, nullable),
    parent_id (FK → Comment, nullable, for threading), is_internal (bool, default false)

Brief
  - id, title, content (rich text JSON — use TipTap format), status (enum: DRAFT | SENT | APPROVED),
    project_id (FK → Project, unique), generated_by_ai (bool)

Invoice
  - id, invoice_number (auto-increment per agency), status (enum: DRAFT | SENT | PAID | OVERDUE | VOID),
    due_date, subtotal, tax_rate, total, currency (default 'USD'),
    stripe_invoice_id (nullable), paid_at (nullable),
    agency_id (FK → Agency), client_id (FK → Client), project_id (FK → Project, nullable)

InvoiceLineItem
  - id, description, quantity, unit_price, amount, invoice_id (FK → Invoice)

Notification
  - id, type (enum: COMMENT | APPROVAL | INVOICE | MENTION | TASK_ASSIGNED | DELIVERABLE_UPLOADED),
    title, body, read (bool), link (url string), user_id (FK → User, nullable),
    client_user_id (FK → ClientUser, nullable)
```

After writing the schema, generate a Prisma migration and seed file.
The seed file must create:
- 1 demo agency ("Apex Creative") with branding
- 2 agency users (owner + member)
- 2 clients with full project data
- Sample tasks, deliverables, comments, 1 sent invoice, 1 draft brief

---

## 4. AUTHENTICATION & ACCESS CONTROL

### Agency Auth (NextAuth v5)
- Google OAuth provider
- Magic link email (via Resend) — primary for inviting new members
- Sessions stored in the database (Prisma adapter)
- On first login: if no agency exists for this user → redirect to `/onboarding`
- Middleware protects all `/app/*` routes — unauthenticated → `/login`

### Client Auth (separate, simple)
- Magic link ONLY — clients never set a password
- Client users are scoped to one `Client` record
- They access their portal via `[agency-slug].portalos.app/portal/[client-slug]`
  OR via custom domain if configured
- Their session JWT contains: `clientUserId`, `clientId`, `agencyId`
- They CANNOT access any `/app/*` agency routes — enforce in middleware

### Role-based permissions (agency side)
```
OWNER  → everything, including billing, deleting agency, inviting members
ADMIN  → everything except billing and deleting agency
MEMBER → read/write on projects, cannot manage clients or billing
```

Implement a `checkPermission(userId, action)` utility used in every server action.

---

## 5. ROUTING STRUCTURE

```
/                          → Marketing landing page (build this too — see §9)
/login                     → Agency login
/onboarding                → New agency setup wizard (name, slug, branding)

/app                       → Agency dashboard (protected)
/app/dashboard             → Overview: stats, recent activity, quick actions
/app/clients               → All clients list
/app/clients/new           → Create new client
/app/clients/[clientId]    → Client detail: projects, invoices, portal settings
/app/projects              → All projects (filterable by client, status)
/app/projects/new          → Create project
/app/projects/[projectId]  → Project workspace (see §7)
/app/invoices              → All invoices
/app/invoices/new          → Invoice builder
/app/invoices/[invoiceId]  → Invoice detail / edit
/app/settings              → Agency settings (branding, team, billing)
/app/settings/team         → Invite members, manage roles
/app/settings/billing      → Stripe billing portal embed
/app/settings/branding     → Logo, colors, custom domain

/portal/[clientSlug]           → Client portal home (their projects)
/portal/[clientSlug]/projects/[projectId]  → Client project view
/portal/[clientSlug]/invoices  → Client invoices
/portal/[clientSlug]/login     → Client magic link request

/api/webhooks/stripe       → Stripe webhook handler
/api/webhooks/ably         → Ably webhook handler (if needed)
```

Subdomain routing: `[agency-slug].portalos.app` should route to the correct agency's
client portal via Vercel edge middleware. Implement this in `middleware.ts`.

---

## 6. AGENCY DASHBOARD — `/app/dashboard`

Build a rich, data-dense dashboard with the following sections:

### Header
- "Good morning, [name]" with dynamic time-based greeting
- Quick action buttons: `+ New Project`, `+ New Client`, `+ Invoice`

### Stats row (4 metric cards with animated count-up on mount)
- Active projects (with % change vs last 30 days)
- Outstanding invoice total (formatted currency)
- Pending client approvals
- Tasks due this week

### Recent activity feed
- Real-time feed of: comments posted, approvals given, deliverables uploaded,
  invoices paid — across all clients
- Each item has avatar, action text, timestamp (relative), and deep-link
- Updates live via Ably subscription

### Projects overview
- Horizontal scroll row of project cards, sorted by due date
- Each card: project name, client logo, status badge, progress bar (% tasks done),
  due date with urgency color coding

### Pending approvals widget
- List of deliverables awaiting client approval with days waiting
- One-click "Send reminder" button per item (triggers Resend email)

---

## 7. PROJECT WORKSPACE — `/app/projects/[projectId]`

This is the most complex screen. Build it with tabs:

### Tab 1: Board (Kanban)
- Drag-and-drop columns: `To Do`, `In Progress`, `In Review`, `Done`
- Use `@dnd-kit/core` for drag interactions
- Cards show: title, assignee avatar, priority dot, due date, comment count badge
- Real-time: when another user moves a card, it animates to new position live
- Add task inline (click `+` in column footer) or via modal for full detail
- Filter bar: by assignee, priority, due date range

### Tab 2: Brief
- Full rich text editor (TipTap) with: headings, bullets, bold/italic, tables,
  callout blocks, dividers
- AI generation button: opens a modal asking for context inputs (project goals,
  target audience, tone, key messages) → streams GPT-4o response into the editor
- Status indicator: Draft → Sent to Client → Approved
- "Send to Client" action: creates a notification + emails the client a portal link

### Tab 3: Deliverables
- Upload zone (drag-and-drop, multi-file, Supabase Storage)
- File type icons (PDF, MP4, PNG, AI, PSD, ZIP, etc.)
- Version history: clicking a deliverable shows all previous versions
- Status badges: `Pending Review`, `Approved ✓`, `Rejected — changes requested`
- Client comment thread per deliverable (internal vs external toggle)
- "Request Approval" button: notifies client user via email + in-portal notification

### Tab 4: Comments
- Threaded comment feed for the full project
- Toggle: "All comments" vs "Internal only" (client users never see internal)
- Rich text input: @mentions of team members or client contacts
- Real-time via Ably: new comments appear without page refresh
- Emoji reactions on comments

### Tab 5: Invoice
- Inline invoice builder for this project
- Line items (description, qty, unit price → auto-calculates subtotal)
- Tax rate input
- Currency selector
- "Save as Draft" / "Send to Client" / "Mark as Paid" state machine
- Stripe integration: "Collect via Stripe" creates a Stripe invoice and sends payment link

### Project header (always visible)
- Project name (inline editable)
- Client badge with logo
- Status dropdown (changes project status)
- Due date picker
- Team member avatars (click to assign/unassign)
- `⋮` menu: Archive project, duplicate, export

---

## 8. CLIENT PORTAL — `/portal/[clientSlug]`

The client portal is a completely separate, beautifully branded experience.
It must feel custom-built for the agency — NOT like a generic SaaS tool.

### Branding system
- Agency `brand_color` applied as CSS custom property across the entire portal
- Agency logo in the portal header
- Agency `welcome_message` shown on the client's home screen
- If `custom_domain` is set, the portal loads at that domain

### Client portal home
- Hero greeting: "Welcome back, [client company name]"
- Active projects grid — each card shows status, last update, pending items count
- Outstanding invoices banner (if any unpaid)
- Recent activity (approvals given, files uploaded, comments) — their perspective only

### Client project view
- Simplified view (no internal tasks, no internal comments)
- Visible tabs: Brief (read-only, after sent), Deliverables, Comments, Invoice
- Deliverable approval flow:
  - Client sees file preview (PDF viewer, image lightbox, video player)
  - "Approve" button → confirmation modal → logs approval with timestamp + name
  - "Request Changes" → opens comment box (required) → notifies agency
- Comment box: clean, minimal — no PM jargon

### Client invoice view
- Beautifully formatted invoice with agency branding
- Line items, totals, due date
- "Pay Now" button → Stripe Checkout (hosted or embedded)
- "Download PDF" → server-generated invoice PDF

---

## 9. LANDING PAGE — `/`

Build a high-converting, beautiful marketing landing page. Use Framer Motion throughout.

Sections (in order):
1. **Hero** — bold headline, 1-line subheadline, primary CTA ("Start free trial"), secondary CTA ("See a demo"), animated dashboard mockup screenshot below the fold
2. **Social proof bar** — logos of fictional agencies (generate SVG wordmarks), "Trusted by 1,200+ agencies"
3. **Problem section** — "Your clients deserve better than email chains and Google Drive folders." Three pain points with icons.
4. **Features section** — alternating image/text layout for: Kanban, Client Portal, AI Briefs, Invoicing
5. **Testimonials** — 3 quote cards with avatar, name, agency name, 5-star rating
6. **Pricing** — 3 tiers (Starter $49, Pro $99, Agency $199/mo), feature comparison, monthly/annual toggle with savings badge
7. **FAQ** — accordion, 6 questions
8. **CTA footer banner** — dark background, headline, email capture field, "Get started" button
9. **Footer** — logo, nav links, social links, legal

---

## 10. ONBOARDING WIZARD — `/onboarding`

Multi-step wizard for new agencies. Show a progress bar at the top.

Step 1: Agency basics
- Agency name, website URL
- Auto-generate slug from name (editable)

Step 2: Branding
- Upload logo (Supabase storage)
- Brand color picker (with preview)
- Preview card updates live as they type/pick

Step 3: Invite your team
- Email field + role dropdown, add multiple rows
- "Skip for now" option

Step 4: Create your first client
- Client name, contact email
- Optional: send portal invite immediately

Step 5: Done!
- Animated success state
- "Go to dashboard" CTA
- Confetti animation (use `canvas-confetti`)

---

## 11. UI / DESIGN SYSTEM — NON-NEGOTIABLE

This is where most SaaS apps fail. PortalOS must look exceptional.

### Palette
```
--color-brand: [pulled from agency settings, default #6C47FF]
--color-brand-light: lighter tint of brand
--color-brand-dark: darker shade of brand

Neutrals (use for layout):
--gray-50: #FAFAFA
--gray-100: #F5F5F5
--gray-200: #E5E5E5
--gray-300: #D4D4D4
--gray-400: #A3A3A3
--gray-500: #737373
--gray-600: #525252
--gray-700: #404040
--gray-800: #262626
--gray-900: #171717
```

### Typography
- Font: Inter (Google Fonts) for UI, `font-feature-settings: "cv11", "ss01"` for numerics
- Scale: 12 / 13 / 14 / 16 / 18 / 24 / 30 / 36 / 48px
- Weight: 400 regular, 500 medium, 600 semibold (never 700+ except display headings)

### Spacing
- Use 4px base grid. All margins/paddings are multiples of 4.

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.12);
```

### Motion philosophy
- All interactive elements: `transition: all 150ms ease` minimum
- Page transitions: slide-in from right (forward), slide-out to right (back), 250ms
- Modals: fade + scale from 0.96 to 1.0, 200ms
- Skeleton loading states on every data-fetching screen (never show blank white)
- Kanban drag: card lifts with shadow + slight scale (1.02) while dragging
- Number count-up animation on dashboard stats (use `useMotionValue`)
- Hover states: all cards lift 2px (`translateY(-2px)`) with shadow intensifying

### Component rules
- Buttons: 3 sizes (sm/md/lg), 3 variants (primary/secondary/ghost/destructive)
- All buttons have 150ms press animation (`scale(0.98)`)
- Inputs: always show label above, helper text below, error state in red
- Empty states: always show an illustration (use inline SVG), never a blank area
- Loading: skeleton shimmer (CSS `@keyframes shimmer`), never a spinner except for async actions
- Tooltips on all icon-only buttons
- Confirm dialogs for all destructive actions

### Responsiveness
- Mobile-first
- Breakpoints: sm (640), md (768), lg (1024), xl (1280)
- Sidebar collapses to bottom nav on mobile
- Kanban columns stack vertically on mobile (horizontal scroll on tablet)

### Dark mode
- Full dark mode support via `next-themes`
- All colors use CSS variables that remap in dark mode
- Images and logos have appropriate dark mode treatment

---

## 12. REAL-TIME FEATURES (ABLY)

Set up one Ably channel per project: `project:[projectId]`

Publish events:
- `task.moved` → { taskId, fromStatus, toStatus, movedBy }
- `comment.created` → { commentId, body, author }
- `deliverable.uploaded` → { deliverableId, title, uploadedBy }
- `presence` → who is currently viewing this project

On the client:
- Subscribe in a `useEffect` with cleanup
- Animate incoming changes (task card slides to new column, comment fades in)
- Show "3 people viewing" presence indicator in project header

---

## 13. AI FEATURES (OPENAI)

### Brief generation
Route: `POST /api/ai/generate-brief`
- Input: `{ projectName, clientName, goals, audience, tone, keyMessages }`
- System prompt: You are a senior creative strategist at a top agency. Write a detailed, professional creative brief...
- Stream the response using `ReadableStream` → display token-by-token in TipTap editor
- After completion, auto-save the brief as a draft

### Smart project summary
Route: `POST /api/ai/summarize-project`
- Input: project data including tasks, comments, deliverable statuses
- Output: a 3-sentence human-readable status summary
- Shown in client portal project view: "Here's where things stand..."

### Comment tone checker (bonus)
Before posting a client-facing comment, run it through:
- Check: is this professional? Could it be misread?
- If flagged: show a subtle warning badge "This might read as [negative] — consider revising"
- Never block — just advise

---

## 14. BILLING & SUBSCRIPTIONS (STRIPE)

### Agency subscriptions
Plans: Starter ($49/mo, 3 clients, 10 projects), Pro ($99/mo, 20 clients, unlimited), Agency ($199/mo, unlimited)

Implementation:
- On signup completion → create Stripe customer
- Plan selection on onboarding step OR from `/app/settings/billing`
- Use Stripe Checkout (hosted) for subscription creation
- Embed Stripe Customer Portal for plan management / cancellation
- Webhook handler: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- On `payment_failed`: email agency owner via Resend, show banner in dashboard

### Client invoicing
- Invoice builder stores data in DB
- "Send via Stripe" → create Stripe Invoice, send to client email
- Stripe sends payment confirmation webhook → update invoice status to PAID → notify agency
- PDF generation: use `@react-pdf/renderer` server-side to generate invoice PDFs on demand

---

## 15. NOTIFICATIONS SYSTEM

### In-app notifications
- Bell icon in header with unread count badge
- Dropdown: last 10 notifications with mark-all-read
- Clicking a notification deep-links to the relevant resource

### Email notifications (Resend + React Email)
Build beautiful HTML email templates for:
- New comment on your project
- Client approved a deliverable ✓
- Invoice paid 💰
- Invoice overdue reminder (7, 3, 1 days before)
- Magic link login
- Team member invitation
- Brief sent for review

All templates: agency logo at top, branded accent color, clean minimal layout, unsubscribe link.

### Inngest background jobs
- `invoice.reminder` — check daily for overdue invoices, send email if 7/3/1 days out
- `client.onboarding.drip` — send 3 emails over 5 days after a new client portal is created

---

## 16. FILE & ASSET MANAGEMENT

Upload flow:
1. Client-side: validate file type and size (max 500MB)
2. Get a signed upload URL from Supabase Storage via server action
3. Upload directly from browser to Supabase (no data through your server)
4. On success: create `Deliverable` record in DB via server action
5. Trigger Ably `deliverable.uploaded` event

File previews:
- Images: `<Image>` with blur placeholder
- PDFs: embed `react-pdf` viewer with page navigation
- Video: `<video>` element with controls and poster
- Other: icon + filename + download button

Supabase Storage buckets:
- `deliverables` (private — signed URLs, 1 hour expiry)
- `logos` (public — agency and client logos)
- `avatars` (public)

---

## 17. SERVER ACTIONS & API ROUTES

Use **Next.js Server Actions** for all mutations.
Use **Route Handlers** only for webhooks and streaming AI responses.

Every server action must:
1. Verify the session (`auth()`)
2. Check permissions via `checkPermission()`
3. Validate input with Zod
4. Execute the DB mutation
5. Revalidate the relevant path(s) via `revalidatePath()`
6. Return a typed result object `{ success: boolean, data?: T, error?: string }`

Create a `createSafeAction` wrapper that handles the try/catch boilerplate.

---

## 18. ERROR HANDLING & EDGE CASES

- All API routes return consistent `{ success, data, error }` shape
- Stripe webhooks: verify signature, idempotency keys to prevent double-processing
- Ably: handle reconnection gracefully, queue messages during reconnect
- File uploads: show retry UI on failure, don't lose form state
- Form validation: inline errors with `react-hook-form` + Zod schemas
- 404 pages: beautiful custom page with illustration + back button
- Error boundary: catch unhandled React errors, show recovery UI
- Rate limiting: apply to AI generation routes (`/api/ai/*`) — 10 req/min per user

---

## 19. PERFORMANCE REQUIREMENTS

- Lighthouse score ≥ 90 on all pages
- First Contentful Paint < 1.2s
- All server components fetch data in parallel (no waterfall)
- Use `React.cache()` for repeated DB calls in one render pass
- Implement proper `loading.tsx` and `error.tsx` at every route segment
- All images: WebP format, correct `sizes` attribute, lazy loading below fold
- Bundle analysis: run `@next/bundle-analyzer` and eliminate unused deps
- Database: add indexes on all foreign keys and common query columns

---

## 20. SECURITY CHECKLIST

Implement all of the following:
- [ ] All mutations require authenticated session
- [ ] Tenant isolation: every DB query filters by `agencyId` from session (never trust client-sent agencyId)
- [ ] Client users can ONLY access their own clientId's data
- [ ] File access: deliverables served via signed Supabase URLs (not public)
- [ ] Stripe webhook: verify `stripe-signature` header with `stripe.webhooks.constructEvent`
- [ ] Input sanitization: all rich text content sanitized with DOMPurify before storage
- [ ] CSRF: Next.js Server Actions handle this natively — document this
- [ ] Environment variables: audit — no secrets in client bundle
- [ ] Content Security Policy headers via `next.config.js` headers()
- [ ] SQL injection: impossible via Prisma — document this in BUILD_LOG.md

---

## 21. FOLDER STRUCTURE

Organize the project exactly like this:

```
/
├── app/
│   ├── (marketing)/          # Landing page, public routes
│   ├── (auth)/               # Login, magic link
│   ├── (agency)/app/         # All /app/* routes
│   ├── (client)/portal/      # All /portal/* routes
│   └── api/                  # Route handlers (webhooks, AI streams)
├── components/
│   ├── ui/                   # shadcn base components (customized)
│   ├── agency/               # Agency-specific composite components
│   ├── client/               # Client portal components
│   ├── shared/               # Used in both contexts
│   └── marketing/            # Landing page sections
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── db.ts                 # Prisma client singleton
│   ├── ably.ts               # Ably client factory
│   ├── stripe.ts             # Stripe client
│   ├── openai.ts             # OpenAI client
│   ├── resend.ts             # Resend client
│   ├── supabase.ts           # Supabase client
│   ├── permissions.ts        # Role-based access control
│   └── utils.ts              # cn(), formatCurrency(), etc.
├── actions/                  # Server actions (one file per domain)
│   ├── projects.ts
│   ├── tasks.ts
│   ├── clients.ts
│   ├── deliverables.ts
│   ├── comments.ts
│   ├── invoices.ts
│   └── briefs.ts
├── hooks/                    # Custom React hooks
│   ├── use-ably.ts
│   ├── use-project.ts
│   └── use-debounce.ts
├── types/                    # Global TypeScript types
│   └── index.ts
├── emails/                   # React Email templates
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── middleware.ts             # Edge middleware (auth + subdomain routing)
├── next.config.js
├── tailwind.config.ts
├── BUILD_LOG.md              # ← ALWAYS UP TO DATE
└── .env.example              # Document all required env vars
```

---

## 22. BUILD ORDER

Follow this sequence. Update BUILD_LOG.md at the start and end of each step.

```
Phase 1 — Foundation
  1.1  Initialize Next.js 15 project, TypeScript strict, Tailwind v4
  1.2  Set up Prisma schema + first migration
  1.3  Configure NextAuth (Google + Magic Link)
  1.4  Set up Supabase, Ably, Stripe, Resend, OpenAI clients in /lib
  1.5  Build middleware (auth guard + subdomain routing)
  1.6  Create design system (CSS variables, Tailwind config, shadcn setup)

Phase 2 — Agency core
  2.1  Layout: sidebar nav, header, notification bell
  2.2  Dashboard page (static first, wire data after)
  2.3  Clients list + create client flow
  2.4  Projects list + create project flow
  2.5  Project workspace: Board tab (Kanban + dnd-kit)
  2.6  Project workspace: Brief tab (TipTap editor)
  2.7  Project workspace: Deliverables tab (upload + preview)
  2.8  Project workspace: Comments tab (real-time via Ably)
  2.9  Project workspace: Invoice tab (builder + Stripe send)

Phase 3 — Client portal
  3.1  Portal layout (branded, no agency UI)
  3.2  Portal home (projects overview)
  3.3  Portal project view (brief, deliverables, comments, invoice)
  3.4  Client login (magic link)
  3.5  Approval flow (approve/reject with comment)
  3.6  Stripe payment for invoices

Phase 4 — AI + Automation
  4.1  Brief generation (streaming GPT-4o)
  4.2  Project summary AI
  4.3  Inngest background jobs (invoice reminders)
  4.4  React Email templates

Phase 5 — Settings + Billing
  5.1  Team management (invite, roles)
  5.2  Branding settings (logo, color, domain)
  5.3  Stripe subscription billing portal
  5.4  Onboarding wizard

Phase 6 — Polish
  6.1  Landing page (full, animated)
  6.2  Empty states, loading skeletons, error pages
  6.3  Dark mode
  6.4  Responsive / mobile
  6.5  Accessibility audit
  6.6  Performance audit + Lighthouse
  6.7  Security audit (checklist from §20)

Phase 7 — Deploy
  7.1  Environment variable audit
  7.2  Vercel deployment + custom domain setup
  7.3  Stripe webhook endpoint registration
  7.4  Final BUILD_LOG.md update marking COMPLETE
```

---

## 23. HANDOFF PROTOCOL (CRITICAL)

If you reach your context limit before completing the build, do the following **before stopping**:

1. Update `BUILD_LOG.md` with:
   - Exact current task and where you stopped
   - What files were last modified
   - What the next model should do first

2. Write a `HANDOFF_NOTE.md` at the project root with:
   ```
   ## Handoff Note — [Timestamp]
   
   ### Completed in this session
   [List]
   
   ### Exactly where I stopped
   [File name, function name, line number if possible]
   
   ### What to do next
   [Step-by-step instructions for the next session]
   
   ### Watch out for
   [Any gotchas, half-finished logic, or temporary hacks]
   ```

3. Run `git add . && git commit -m "WIP: [current phase] — handoff"` before stopping.

---

## 24. DEMO MODE — PORTFOLIO & SALES TOOL

This is not an afterthought. Demo mode is a first-class feature because this product
is also a live case study for Velocity AI. Every prospect who visits the site must be
able to experience the full product in under 10 seconds, with zero friction.

### The goal
A prospect lands on the landing page, clicks "Try the demo," and is instantly inside
a fully populated, beautiful, working version of the product — no signup, no email,
no loading screen. They experience it as a real user. At any point they can click
"Get this for your agency" and it opens a sales conversation.

---

### §24A — Demo Accounts

Create two permanent demo credentials, hardcoded in the seed file and never deletable:

```
Agency (internal view):
  Email:    demo@velocityai.com
  Password: [not needed — auto-login via magic token in URL]
  Role:     OWNER
  Agency:   "Lumina Creative" (fictional agency used for the demo)

Client (portal view):
  Email:    client@lumina-demo.com
  Password: [not needed — auto-login via magic token in URL]
  Portal:   lumina.portalos.app/portal/northstar-brand
```

### §24B — Demo Entry Points

Add two buttons to the landing page hero, side by side:

```
[ Try Agency View →  ]    [ Try Client View → ]
```

Each button hits a route that:
1. Creates a short-lived JWT (24hr expiry) scoped to the demo account
2. Sets it as the session cookie
3. Redirects instantly to the dashboard or portal — no login page shown

Routes:
- `GET /demo/agency` → logs in as demo@velocityai.com → `/app/dashboard`
- `GET /demo/client` → logs in as client@lumina-demo.com → `/portal/northstar-brand`

These routes are public. No auth required to hit them. Rate-limit to 60 req/min per IP.

### §24C — Demo Data (Make it Vivid)

The seed file must populate the demo agency "Lumina Creative" with data rich enough
that every feature of the product is immediately visible and impressive.
This is a showroom, not a test environment.

**Agency:** Lumina Creative
- Brand color: `#C9981A` (gold)
- Logo: a simple SVG wordmark generated inline
- 3 agency users: Sarah (Owner), Marcus (Admin), Priya (Member)

**Clients:** (3 total)

*Client 1: Northstar Branding*
- 2 active projects
- Project "Brand Identity Refresh":
  - 12 tasks across all kanban columns
  - A fully written AI brief (use a real, well-written creative brief in the seed)
  - 3 deliverables: one Approved, one Pending Review, one Rejected with a comment
  - 8 comments (mix of internal and client-facing, some threaded replies)
  - 1 sent invoice: $8,400 — unpaid, due in 6 days (triggers the overdue urgency UI)
- Project "Website Copy":
  - 6 tasks, brief in Draft state, 1 deliverable uploaded

*Client 2: Forge Studio*
- 1 active project: "Q4 Campaign"
  - Mix of tasks, 1 deliverable pending approval
  - 1 paid invoice: $3,200 — shows the "Paid ✓" gold badge state

*Client 3: Vessel Co.*
- Status: ARCHIVED (shows the archived state in the clients list)
- 1 completed project with all deliverables approved

**Notifications:** pre-seed 5 unread notifications in the demo account so the bell
icon shows a badge immediately on login.

**Activity feed:** pre-seed 10 activity events so the dashboard feed is populated.

### §24D — Demo Banner

When a user is in demo mode, show a persistent banner at the very top of every page
(above the main nav, full width, 40px tall):

```
Design:
  Background: var(--ink-primary) — near-black
  Text: var(--bg-base) — warm off-white
  Font: 13px DM Sans

Content (left-aligned, with right-side CTA):
  "You're viewing a live demo  ·  All data resets every 24 hours"
                                    [ Get this for your agency ↗ ]
```

The "Get this for your agency" button:
- Opens a modal (not a new tab) with:
  - Headline: "Let's build this for [your agency name]"
  - Subtext: "We customize and deploy PortalOS for agencies in 3–5 weeks. Monthly hosting and support included."
  - A simple form: Name, Agency name, Email, "What would you change about this?" (textarea)
  - Submit → sends to a Resend endpoint → emails Velocity AI's inbox
  - On success: "We'll be in touch within 24 hours." + calendly link (placeholder URL in env var)

### §24E — Demo Write Permissions

Demo users CAN interact with the product — they can move kanban cards, post comments,
upload files, edit briefs. This is intentional. Letting them touch it is more
convincing than a read-only tour.

However:
- They cannot send real emails (suppress all Resend calls when `DEMO_MODE=true`)
- They cannot trigger real Stripe charges (Stripe is in test mode for demo)
- They cannot change the demo account's email or password
- They cannot delete projects, clients, or invoices (show a toast: "Disabled in demo")

### §24F — Demo Data Reset

Add an Inngest cron job that runs every 24 hours:
- Drops all data created by demo users since the last reset
- Re-runs the demo seed to restore the original state
- Logs the reset in a `DemoResetLog` table (id, reset_at, records_deleted)

This keeps the demo clean without manual maintenance.

### §24G — Case Study Page — `/case-study`

Build a dedicated page at `/case-study` (linked from the landing page footer and the demo banner).

This page is the Velocity AI portfolio piece. Model it exactly on the NeuralStack and
Luminary case studies provided in the brief — same structure, same stat cards.

Sections:
1. **Hero** — "We built PortalOS in 5 weeks. Here's everything we learned."
2. **The problem** — the agency ops problem, written as a compelling narrative
3. **Stats row** (4 cards, animated count-up):
   - "5 weeks" — build time
   - "24 features" — shipped at launch
   - "2 user types" — agency + client, fully isolated
   - "1 codebase" — white-labelable for any agency
4. **Tech stack** — logo grid (Next.js, Prisma, Ably, OpenAI, Stripe, Supabase, Vercel)
5. **Feature walkthrough** — alternating image/text, one section per major feature,
   with a real screenshot or animated mockup of that feature
6. **The build process** — a brief timeline showing the 7 phases
7. **CTA** — "Want this for your agency?" → same modal as the demo banner

This page should be stunning. It is a sales document as much as a case study.
Apply the full aesthetic system from the design constraints addendum.

---

## 25. FINAL QUALITY GATE

Before marking the build complete, verify:
- [ ] `BUILD_LOG.md` reflects 100% completion
- [ ] All TypeScript errors resolved (`npx tsc --noEmit` passes)
- [ ] ESLint passes with no warnings
- [ ] Prisma seed runs cleanly (`npx prisma db seed`)
- [ ] Demo seed populates all data described in §24C
- [ ] `/demo/agency` and `/demo/client` routes work and log in instantly
- [ ] Demo banner visible on every page in demo mode
- [ ] "Get this for your agency" modal submits and emails correctly
- [ ] Demo reset Inngest job registered and testable
- [ ] `/case-study` page complete and matches aesthetic standard
- [ ] All `.env.example` variables documented (including `DEMO_MODE`, `CALENDLY_URL`, `VELOCITY_AI_INBOX`)
- [ ] Lighthouse score ≥ 90 on all pages including `/case-study`
- [ ] Mobile layout tested at 375px width
- [ ] Dark mode tested
- [ ] Stripe in test mode for demo, live mode for real agency signups
- [ ] At least one end-to-end flow works: create client → create project → upload deliverable → client approves → send invoice → client pays

---

## You are now cleared to begin.

Create `BUILD_LOG.md` first. Then start Phase 1.1.
Show your work. Think out loud in comments. Make it beautiful.
