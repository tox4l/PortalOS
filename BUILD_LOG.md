# Build Log - Agency Client Ops Portal

## Last updated: 2026-04-29 17:30 +03:00
## Current status: OVERHAUL PHASE E COMPLETE - marketing sections E.4-E.7 verified
## Active task: Ready for next frontend pass - preview running at http://127.0.0.1:3001
## Current model: Codex (GPT-5, 2026-04-29 session)

---

## Completed
- [x] Read project build spec - Loaded `agency-portal-gpt-prompt.md` and noted required build order, stack, folder structure, demo mode, and logging protocol.
- [x] Read design constraints addendum - Applied Japanese editorial luxury aesthetic as the override for UI section conflicts.
- [x] Create BUILD_LOG.md - Created this external memory file before project code or markup changes.
- [x] Create initial app directories - Added `app/`, `app/(marketing)/`, and `public/` for the App Router foundation.
- [x] Add Next.js foundation files - Added `package.json`, strict `tsconfig.json`, Next config, PostCSS config, ESLint config, root layout, starter marketing page, global CSS variables, favicon, and `.gitignore`.
- [x] Install dependencies - Ran `npm install`; dependencies installed and `package-lock.json` was generated.
- [x] Resolve npm audit warning - Added a PostCSS `8.5.12` override and re-ran `npm install`; audit now reports 0 vulnerabilities.
- [x] Fix starter page lint issue - Replaced the home anchor with `next/link`.
- [x] Verify TypeScript and lint - `npm run typecheck` and `npm run lint` both pass.
- [x] Verify production build - `npm run build` passes on Next.js 15.5.15 with no warnings after setting `outputFileTracingRoot`.
- [x] Complete Phase 1.1 - Initialized Next.js 15 App Router project with strict TypeScript, Tailwind CSS v4, editorial starter UI, clean audit, clean lint, clean typecheck, clean build, and a running local preview server.
- [x] Install Prisma tooling - Added `@prisma/client@7.8.0`, `prisma@7.8.0`, and `tsx@4.21.0`.
- [x] Resolve Prisma install audit warning - Added `@hono/node-server@1.19.13` override for Prisma CLI transitive advisory; npm audit reports 0 vulnerabilities.
- [x] Add Prisma schema foundation - Added `prisma/schema.prisma` with PostgreSQL datasource, required PortalOS models, NextAuth persistence models, activity events, demo reset logging, enums, indexes, and explicit relation `onDelete` behavior.
- [x] Add Prisma config and env templates - Added `prisma.config.ts`, `.env.example`, and local placeholder `.env` for Prisma CLI commands.
- [x] Generate first migration SQL - Created `prisma/migrations/20260428175500_init/migration.sql` using `prisma migrate diff --from-empty --to-schema`.
- [x] Add Prisma seed script - Added `prisma/seed.ts` with Apex Creative sample data and Lumina Creative demo showroom data, including demo credentials, clients, projects, tasks, briefs, deliverables, comments, invoices, notifications, activity events, and demo reset log.
- [x] Generate Prisma Client - Ran `npx prisma generate` successfully.
- [x] Verify Phase 1.2 - `npx prisma validate`, `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` all pass.
- [x] Complete Phase 1.2 - Prisma schema, first migration artifact, generated client, and seed script are in place.
- [x] Install Auth.js dependencies - Added `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter@2.11.2`, and `resend@6.1.3`.
- [x] Resolve Auth.js install audit warning - Pinned Resend to `6.1.3` to avoid the vulnerable `svix`/`uuid` transitive path; npm audit reports 0 vulnerabilities.
- [x] Adjust schema for Auth.js adapter - Made agency assignment nullable for pre-onboarding users, mapped Auth.js `image` to database `avatar_url`, and changed OAuth token fields to the adapter's expected Prisma field names.
- [x] Regenerate migration and Prisma Client - Rebuilt the initial SQL migration from the updated schema and ran `npx prisma generate`.
- [x] Add Prisma database singleton - Added `lib/db.ts` using Prisma 7's official Postgres driver adapter.
- [x] Configure NextAuth v5 - Added `lib/auth.ts` with Prisma adapter, database sessions, Google OAuth, Resend magic links, sign-in validation, session enrichment, and safe redirects.
- [x] Add Auth.js route handler - Added `app/api/auth/[...nextauth]/route.ts` exporting `GET` and `POST`.
- [x] Add agency login page - Added `/login` with Google and email magic-link forms styled in the PortalOS editorial design system.
- [x] Add auth session types - Added `types/next-auth.d.ts` so sessions include user id, role, agency id/slug/name/color, and demo lock state.
- [x] Verify Phase 1.3 - `npx prisma validate`, `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` all pass. Local `/login` and `/api/auth/providers` return HTTP 200.
- [x] Complete Phase 1.3 - NextAuth v5 is configured with Google OAuth, Resend magic links, Prisma adapter, database sessions, route handlers, and a login page.
- [x] Install service SDKs - Added Supabase, Ably, Stripe, OpenAI, Inngest, PostHog, Lucide React, and Zod packages with a clean npm audit.
- [x] Add service client factories - Added `/lib` helpers for env access, Supabase, Ably, Stripe, Resend, OpenAI, Inngest, and PostHog.
- [x] Verify Phase 1.4 - `npm run typecheck`, `npm run lint`, and `npm audit --audit-level=moderate` pass after aligning Stripe API version to the installed SDK.
- [x] Complete Phase 1.4 - Service clients are installed and available through `/lib` factories.
- [x] Add middleware - Added edge-safe `middleware.ts` for static/API exclusions, `/app` session-cookie guard, `/login` signed-in redirect, and agency subdomain portal rewrites.
- [x] Verify Phase 1.5 - `npm run typecheck`, `npm run lint`, and `npm run build` pass with middleware included and no Prisma Edge runtime warnings.
- [x] Complete Phase 1.5 - Middleware foundation is in place.
- [x] Install shadcn support packages - Added class variance, Radix Slot/Dialog/Label/Tooltip, clsx, and tailwind-merge with a clean audit.
- [x] Add design system config - Added `components.json`, `tailwind.config.ts`, and shared utilities in `lib/utils.ts`.
- [x] Add customized UI primitives - Added PortalOS-styled Button, Input, Label, Badge, Card, Skeleton, Dialog, and Tooltip components.
- [x] Verify Phase 1.6 - `npm run typecheck`, `npm run lint`, and `npm audit --audit-level=moderate` pass.
- [x] Complete Phase 1.6 - Design system and shadcn-compatible primitives are in place.
- [x] Add agency shell - Added protected app layout with sidebar navigation, agency identity panel, header, quick action, and icon tooltips/notification badge.
- [x] Verify Phase 2.1 - `npm run typecheck` and `npm run lint` pass.
- [x] Complete Phase 2.1 - Agency layout foundation is in place.
- [x] Add dashboard page - Added static-first `/app/dashboard` with metric cards, projects overview, pending approvals, recent activity, and invoice attention surfaces.
- [x] Verify Phase 2.2 - `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` pass. Preview server confirms `/app/dashboard` redirects unauthenticated users and `/login` returns 200.
- [x] Complete Phase 2.2 - Dashboard static implementation is in place and ready for Prisma/Ably data wiring.
- [x] Add safe action and permission helpers - Added `actions/safe-action.ts` and `lib/permissions.ts` for typed server action results and role-based checks.
- [x] Add client creation server action - Added `actions/clients.ts` with auth verification, `checkPermission`, Zod validation, Prisma create, and path revalidation.
- [x] Add clients list page - Added static-first `/app/clients` with summary metrics, client rows, balances, project counts, and status badges.
- [x] Add new client flow - Added `/app/clients/new` and `components/agency/client-create-form.tsx` using React action state with the server action.
- [x] Verify Phase 2.3 - `npx prisma validate`, `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` pass. Preview server confirms `/app/clients` redirects unauthenticated users and `/login` returns 200.
- [x] Complete Phase 2.3 - Clients list and create-client flow are in place, with static list data and real mutation plumbing ready for a live database.
- [x] Add project creation server action - Added `actions/projects.ts` with auth verification, `checkPermission`, Zod validation, client ownership check, Prisma create, and path revalidation.
- [x] Add projects list page - Added static-first `/app/projects` with project summary metrics, progress bars, owners, due dates, status badges, and workspace links.
- [x] Add new project flow - Added `/app/projects/new` and `components/agency/project-create-form.tsx` using React action state with the server action.
- [x] Verify Phase 2.4 - `npx prisma validate`, `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` pass. Preview server confirms `/app/projects` redirects unauthenticated users and `/login` returns 200.
- [x] Complete Phase 2.4 - Projects list and create-project flow are in place, with static list data and real mutation plumbing ready for live client IDs.
- [x] Install dnd-kit packages - Added `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` at latest; npm audit clean.
- [x] Add task server actions - Created `actions/tasks.ts` with create, update, updateStatus, and delete actions; all follow the safe-action pattern with auth, permissions, Zod validation, and path revalidation.
- [x] Build task card component - Added `components/agency/task-card.tsx` with priority dot, due date, comment count, assignee initials, drag handle, hover lift, and drag overlay styling per the editorial luxury aesthetic.
- [x] Build kanban column component - Added `components/agency/kanban-column.tsx` with status dot, task count badge, droppable area with blossom-tinted drop highlight, and inline add-task button.
- [x] Build task dialog component - Added `components/agency/task-dialog.tsx` with create/edit modes, priority/due-date/assignee fields, and the PortalOS dialog shell.
- [x] Build kanban board component - Added `components/agency/kanban-board.tsx` with DndContext, closestCorners collision detection, DragOverlay, filter bar (priority + assignee), column-to-column drag-and-drop via server action, and task dialog integration.
- [x] Build project workspace shell - Added `components/agency/project-workspace-tabs.tsx` with project header (name, client badge, status, due date), tab navigation (Board/Brief/Deliverables/Comments/Invoice), kanban board render, and placeholder tabs for future phases.
- [x] Add project workspace page - Added `app/(agency)/app/projects/[projectId]/page.tsx` as a server component with auth guard, Prisma `include` fetch, comment count groupBy, and data transformation for the client-side kanban.
- [x] Install framer-motion - Added `framer-motion` for future animation work; no audit issues.
- [x] Fix pre-existing lint error - Replaced `<a>` with `<Link>` in `project-create-form.tsx`.
- [x] Verify Phase 2.5 - `npm run typecheck`, `npm run lint`, and `npm run build` pass. Build output: `/app/projects/[projectId]` at 30.3 kB / 149 kB first-load JS.
- [x] Install TipTap packages - Added `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, table extensions, highlight, text-align, underline, and `@tiptap/pm`; npm audit clean.
- [x] Add brief server actions - Created `actions/briefs.ts` with save (upsert) and send-to-client actions; follow safe-action pattern with auth, permissions, Zod, and path revalidation.
- [x] Add AI brief generation route - Created `app/api/ai/generate-brief/route.ts` streaming GPT-4o via OpenAI SDK; structured system prompt for creative strategist tone; streams token-by-token.
- [x] Build AI brief modal - Added `components/agency/ai-brief-modal.tsx` with context input fields (goals, audience, tone, key messages), fetch-based streaming reader, abort controller, and live rendering of GPT-4o output.
- [x] Build brief editor component - Added `components/agency/brief-editor.tsx` with full TipTap toolbar (headings H1-H3, bold, italic, underline, strikethrough, highlight, bullet/ordered lists, blockquote, tables), inline-editable title, save draft button, AI generation trigger, send-to-client action, status badge, and placeholder text.
- [x] Wire brief into workspace - Updated project page to `include` brief data via Prisma; updated `ProjectWorkspaceTabs` to accept `brief` prop and render `BriefEditor` instead of placeholder.
- [x] Verify Phase 2.6 - `npm run typecheck`, `npm run lint`, and `npm run build` pass. Build: `/app/projects/[projectId]` at 166 kB / 285 kB first-load JS (TipTap adds ~136 kB).
- [x] Add deliverable server actions - Created `actions/deliverables.ts` with create, requestApproval, and delete actions.
- [x] Build deliverables view - Added `components/agency/deliverables-view.tsx` with drag-and-drop upload zone, file type icons, status badges, request-approval/delete actions, and empty state.
- [x] Wire deliverables into workspace - Updated page and tabs to include deliverable data and render `DeliverablesView`.
- [x] Verify Phase 2.7 - `npm run typecheck`, `npm run lint`, `npm run build` pass. Build: `/app/projects/[projectId]` at 169 kB / 287 kB.
- [x] Add comment server action - Created `actions/comments.ts` with create action, internal/external toggle, auth, permissions, and path revalidation.
- [x] Build Ably real-time hook - Added `hooks/use-ably.ts` with channel subscription, auto-reconnect, and message handler pattern.
- [x] Build comments view - Added `components/agency/comments-view.tsx` with threaded comment feed, internal-only toggle, comment input with Enter-to-send, avatar initials, relative timestamps, Ably real-time subscription for live updates, and empty state.
- [x] Wire comments into workspace - Updated page to include comment data and tabs to render `CommentsView`.
- [x] Refactor page data fetching - Used `Prisma.ProjectGetPayload` with `satisfies Prisma.ProjectInclude` for proper type inference across all relations.
- [x] Verify Phase 2.8 - `npm run typecheck`, `npm run lint`, `npm run build` pass. Build: `/app/projects/[projectId]` at 218 kB / 337 kB.
- [x] Add invoice server actions - Created `actions/invoices.ts` with create (transactional: invoice + line items + sequence increment) and updateStatus actions.
- [x] Build invoice builder - Added `components/agency/invoice-builder.tsx` with line-item CRUD, auto-calculating subtotal/tax/total, currency selector, save draft / send / mark paid / void workflow, and formatted totals display.
- [x] Wire invoice into workspace - Updated page to include invoice+lineItems data and tabs to render `InvoiceBuilder`; all PlaceholderTab instances replaced with real components.
- [x] Remove PlaceholderTab - All 5 tabs now render real components; placeholder function removed.
- [x] Verify Phase 2.9 complete - `npm run typecheck`, `npm run lint`, `npm run build` all clean. Build: `/app/projects/[projectId]` at 220 kB / 338 kB.
- [x] **PHASE 2 COMPLETE** — All 5 project workspace tabs built: Board (Kanban + dnd-kit), Brief (TipTap + AI streaming), Deliverables (upload zone + status workflow), Comments (threaded + Ably real-time), Invoice (line-item builder + status state machine).
- [x] Add DEV_BYPASS_AUTH middleware bypass — Middleware skips auth redirects when `DEV_BYPASS_AUTH=true`; `/login` redirects to `/app/dashboard` in bypass mode.
- [x] Create dev bypass mock layer — Added `lib/dev-bypass.ts` with `getDevSession()`, `getDevProject()`, and `isDevBypass()` helpers; mock project includes all 5 tabs' worth of data (Kanban tasks, TipTap brief, deliverables, threaded comments, invoice with line items).
- [x] Fix project workspace page for dev mode — `[projectId]/page.tsx` returns full mock project data when `DEV_BYPASS_AUTH=true` so the workspace UI is fully visible without a database.
- [x] Verify dev bypass — All routes return correct HTTP status codes; workspace page renders all 5 tabs with mock data. Typecheck and lint pass clean.

- [x] Phase 3.1 — Portal layout with agency-branded shell, sticky header, client-safe nav (Projects, Invoices, Sign out), footer.
- [x] Phase 3.2 — Portal home page with hero greeting, outstanding invoice banner, active projects grid with progress bars, recent activity feed.
- [x] Phase 3.3 — Client project view with 4 tabs: Brief (read-only with structured content rendering), Deliverables (file icons, status badges, approve/reject actions), Comments (client-facing only, no internal), Invoice (line items, totals, Pay button).
- [x] Phase 3.4-3.5 — Client magic link login page and approval flow modal (approve with confirmation, reject with required comment feedback).
- [x] **PHASE 3 COMPLETE** — Client portal built with branded layout, project view, invoices, login, and approval flow. All routes return HTTP 200 in dev bypass mode.

- [x] Phase 4.1 — Brief generation (streaming GPT-4o) — Already built in Phase 2.6 via `app/api/ai/generate-brief/route.ts`.
- [x] Phase 4.2 — Project summary AI endpoint — `app/api/ai/summarize-project/route.ts` returns a 3-sentence client-friendly summary from project data; graceful fallback when OpenAI key is missing.
- [x] Phase 4.3 — Inngest background jobs — `inngest/jobs.ts` with invoice-reminder cron job (daily 9am); `app/api/inngest/route.ts` handler. Uses Inngest v4 `createFunction` with `triggers` API.
- [x] Phase 4.4 — React Email templates — `emails/invoice-overdue.tsx`, `emails/comment-notification.tsx`, `emails/deliverable-approved.tsx`, `emails/team-invitation.tsx` with PortalOS editorial design (Cormorant Garamond + DM Sans, washi palette, blossom accent).
- [x] **PHASE 4 COMPLETE** — AI endpoints, background jobs, and email templates in place.
- [x] Phase 5.1 — Team management page with invite form, role selector, and current team list.
- [x] Phase 5.2 — Branding settings page with logo upload, brand color picker (presets + custom hex), live preview, and custom domain input.
- [x] Phase 5.3 — Billing settings page with current plan display, 3-tier plan comparison cards (Starter $49/Pro $99/Agency $199), and Stripe Customer Portal integration.
- [x] Phase 5.4 — Onboarding wizard with 5 steps (Agency basics, Branding, Team invite, First client, Done), progress bar, animated success state with badges.
- [x] **PHASE 5 COMPLETE** — Settings (team, branding, billing) and onboarding wizard built.
- [x] Phase 6.1 — Marketing landing page with 9 sections (hero, social proof, problem, features, testimonials, pricing, FAQ, CTA, footer) in full editorial luxury design.
- [x] Phase 6.2-6.5 — Custom 404 page, error boundary with retry, root loading skeleton, loading.tsx for suspense boundaries.
- [x] **PHASE 6 COMPLETE** — Landing page, error/loading/not-found pages, empty states throughout.
- [x] **DESIGN MIGRATION: Obsidian & Gold** — Complete visual system switch from Japanese editorial washi/blossom to dark luxury per DESIGNS.md. Rewrote `globals.css` with full Obsidian & Gold CSS variable system (void/base/surface/elevated/sunken backgrounds, ink-primary/secondary/tertiary/ghost text, gold-100 through gold-700 scale, semantic status colors, border tiers, shadow tiers, gold glow utilities, noise texture via body::after with SVG feTurbulence, skeleton shimmer, scroll-driven reveal animations). Switched fonts to Playfair Display (400/500) + JetBrains Mono (400). Dark mode is default; light "Platinum" mode available via `[data-theme="light"]`.
- [x] **DESIGN MIGRATION: UI Primitives** — Rewrote all 7 shadcn/ui components: Button (gold primary with dark text #0A0A0B on #D4AF37, secondary with border-medium, ghost with rgba hover, destructive with dark danger tokens, 8px radius, disabled opacity 0.35), Badge (uppercase 11px/0.05em, status variants using semantic CSS vars, gold review/paid states), Card (10px radius, border-t top-edge highlight, Playfair H2 title, 15px body description, hover lift), Dialog (10px radius, bg-elevated, overlay with backdrop-blur 8px, scale-0.96 enter), Input (8px radius, bg-sunken, border-gold focus with gold glow), Tooltip (6px radius, Layer 4 bg #252529, no arrow), Skeleton (references .skeleton class), Label (11px uppercase, 0.08em tracking).
- [x] **DESIGN MIGRATION: Layout Shells** — AgencyShell: 240px sidebar (bg-surface), gold logo, 10px agency card with top-edge highlight, gold-500 left-border active nav, bg-elevated avatar, 1280px content max-width. PortalShell: bg-void, 1280px max-width, ink-tertiary nav with rgba hover.
- [x] **DESIGN MIGRATION: Agency Components** — project-workspace-tabs (gold active tab, 40px/1.12 H1), settings-shell (gold active tab), kanban-board (gold filter states, gold drag overlay), kanban-column (dark status dots, gold drop highlight, top-edge border), task-card (gold priority colors, gold focus ring, bg-elevated avatars, gold drag state), task-dialog (gold focus rings), brief-editor (gold toolbar active, gold blockquote, gold focus), deliverables-view (gold drag zone, bg-elevated icons), comments-view (gold internal states), invoice-builder (gold add-link, font-mono totals), client-create-form (gold focus, dark status), project-create-form (gold focus, dark status), ai-brief-modal (10px radius).
- [x] **DESIGN MIGRATION: Client Components** — approval-modal (dark overlay + backdrop-blur, gold success, dark danger), comment-input (gold focus, gold send hover, bg-elevated avatar), project-view (gold tabs, gold/font-mono totals, bg-elevated avatars).
- [x] **DESIGN MIGRATION: Pages** — login (gold focus, gold success banner, dark error, gold primary button with dark text), onboarding (gold progress steps, gold preview swatch, dark selects), portal home (gold invoice banner with font-mono amount, gold progress bars, gold pending items), portal invoices (font-mono gold total), clients list (40px stats), clients/new (40px heading, 10px preview), projects list (gold progress, 40px stats, top-edge highlights), projects/new (40px heading, 10px preview), settings/branding (removed banned colors #3B82F6/#6C47FF/#10B981/#EF4444, dark preview), settings/billing (gold highlighted plan border+glow, gold checkmarks), settings/team (bg-elevated avatars), marketing landing (completely rewritten for dark luxury — server component, CSS scroll-driven animations, 56px Playfair hero, gold line separator, gold quote marks, dark pricing cards), error/not-found/loading (bg-void, removed washi-texture).
- [x] **DESIGN MIGRATION: Verify** — `npx tsc --noEmit` passes clean (zero errors). `npx next lint` passes clean (zero warnings, zero errors). `npx next build` passes clean (all 19 routes compiled successfully).
- [x] **PHASE 7: Deploy readiness** — Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) added to next.config.ts. Comprehensive .env.example with all 25+ env vars documented (required/optional/dev-only annotations). robots.txt and sitemap.xml for SEO. Health check endpoint at /api/health returning JSON status+timestamp+uptime. Production build verified: 24 routes, zero warnings, zero errors.

## In Progress
- [x] C.1 Build notification server actions and DB integration.
- [x] C.2 Wire `createNotification` into relevant actions.
- [x] C.3 Build agency notification panel.
- [x] C.4 Build client notification panel.
- [x] C.5 Wire Ably real-time to both notification panels.
- [x] D.1 Portal home - branded header, greeting card, projects grid.
- [x] D.2 Client project view - all 4 tabs rebuilt per Section 5.
- [x] D.3 Approval flow - both approve and request-changes fully working.
- [x] D.4 Invoice view - formatted document, Pay Now button, paid stamp.
- [x] E.1 Lenis smooth scroll provider - root layout.
- [x] E.2 Scroll reveal system - IntersectionObserver hook.
- [x] E.3 Hero section - headline animation, gold rule, CTA buttons.
- [x] E.4 Three.js floating panels scene - dynamic import, SSR disabled.
- [x] E.5 Social proof marquee, problem section, features alternating.
- [x] E.6 Demo CTA section - floating cards, agency/client view buttons.
- [x] E.7 Testimonials, pricing, FAQ, final CTA, footer.

## Overhaul Completed
- [x] A.1 Replaced `app/globals.css` with the Jet Black & Gold v3 foundation: true black layers, surgical gold tokens, status aliases, noise texture, reveal classes, float animations, and compatibility aliases for existing components.
- [x] A.2 Installed overhaul packages: `@phosphor-icons/react`, `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `gsap`, `@gsap/react`, `lenis`, `sonner`, and `cmdk`.
- [x] A.3 Fixed client portal brand color injection so portal pages override gold tokens from the agency brand color instead of only setting an unused `--brand` variable.
- [x] A.4 Fixed portal routing: `/portal` redirects to `/demo/client` in dev bypass, `/demo/client` redirects to `/portal/northstar-brand`, `/demo/agency` redirects to `/app/dashboard`, and `[agency-slug].localhost:3000` rewrites to `/portal/[agency-slug]`.
- [x] A.5 Fixed client approval flow end-to-end with server actions for approve/request changes, dev bypass support, revalidation, Sonner toasts, and immediate local status updates.
- [x] Verification: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --audit-level=moderate` all pass. Smoke tested `/app/dashboard`, `/portal`, `/demo/client`, `/demo/agency`, `/portal/northstar-brand`, `/portal/northstar-brand/projects/dev-proj-001`, `/login`, and `Host: northstar-brand.localhost:3000`.
- [x] B.1 Rebuilt agency shell navigation with Phosphor icons, active-route detection, gold active state, mobile nav, and added the missing `/app/invoices` route.
- [x] B.2 Reworked dashboard metrics with animated count-up numbers, sharper project priority list, pending approval cards, and timeline-style activity feed.
- [x] B.3 Reworked project workspace header and tabs into a premium surface with project metadata, task count, gold active tabs, and tighter hierarchy.
- [x] B.4 Upgraded Kanban with priority edge treatment, stronger drop state, inline add controls, and CSS 3D drag lift.
- [x] B.5 Upgraded deliverables with approval-request toast feedback, optimistic status updates, delete feedback, and visible version history.
- [x] B.6 Upgraded comments with internal filtering, thread-ready rendering, and local reaction controls.
- [x] B.7 Upgraded invoice builder with formatted line-item table, large total summary, status feedback, and clearer Stripe collection affordance.
- [x] B.8 Installed `@radix-ui/react-select`, added `components/ui/select.tsx`, and replaced all native `<select>` elements in app/components surfaces. `rg "<select|</select>" app components` returns no matches.
- [x] Phase B verification: `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` all pass. Preview server restarted at `http://127.0.0.1:3000`; smoke tested `/app/dashboard`, `/app/invoices`, `/app/projects/dev-proj-001`, `/app/projects/new`, and `/onboarding` with HTTP 200.
- [x] C.1 Added notification action/helper layer backed by Prisma notifications with dev-bypass mock notifications.
- [x] C.2 Wired notifications into agency comments, client comments, deliverable approval requests, client approvals/change requests, and invoice sent/paid transitions.
- [x] C.3 Added agency slide-in notification drawer with unread count, mark-read actions, and Ably subscription.
- [x] C.4 Added client portal notification drawer using the same shared inbox component.
- [x] C.5 Wired both drawers to Ably notification channels. Realtime publishing is optional-safe when local Ably credentials are absent.
- [x] D.1 Rebuilt portal home with branded greeting card, outstanding invoice alert, active project cards, review counters, and recent activity feed.
- [x] D.2 Rebuilt client project view with a premium project header, four polished tabs, read-only brief rendering, deliverable cards, client-only comment thread, and invoice tab.
- [x] D.3 Rebuilt the approval modal and verified approve/request-changes server action wiring, Sonner success/error feedback, and immediate local deliverable status updates.
- [x] D.4 Added `components/client/invoice-document.tsx` and reused it in both the project invoice tab and `/portal/[clientSlug]/invoices`; includes formatted line-item document, Pay Now action, PDF export action, and paid stamp state.
- [x] Phase D verification: `npm run typecheck`, `npm run lint`, `npm audit --audit-level=moderate`, and `npm run build` all pass. Preview server restarted at `http://127.0.0.1:3000`; smoke tested `/portal/northstar-brand`, `/portal/northstar-brand/projects/dev-proj-001`, `/portal/northstar-brand/invoices`, `/app/dashboard`, `/demo/client`, `/demo/agency`, and `/portal`.
- [x] E.1 Verified existing `components/shared/smooth-scroll-provider.tsx` initializes Lenis and `AppProviders` wraps the root layout with it.
- [x] E.2 Verified existing `hooks/use-reveal.ts` observes `[data-reveal]` / `.reveal`, applies `in-view`, and honors stagger delays through `data-delay`.
- [x] E.3 Rebuilt the landing hero with a new GSAP-driven `components/marketing/landing-hero.tsx`: cinematic centered composition, two-line Playfair headline, staged word reveal, gold rule, stronger demo CTA copy, atmospheric background treatment, and a scroll indicator. `app/(marketing)/page.tsx` now delegates the hero to this component and uses `overflow-x-hidden` on `<main>`.
- [x] E.3 verification: `npm run typecheck`, `npm run lint`, and `npm run build` pass. Preview server restarted at `http://127.0.0.1:3000`; `/` returns HTTP 200 and serves the new hero copy (`The Agency Platform`, `Your Clients Will Brag About.`, `Try Agency View`, `Try Client View`).
- [x] E.4 built `components/marketing/floating-panels-scene.tsx` and `components/marketing/floating-panels-scene-loader.tsx`: React Three Fiber floating panels, WebGL static fallback, mobile DPR cap, offscreen frameloop pause, and dynamic import with SSR disabled.
- [x] E.5-E.7 rebuilt `app/(marketing)/page.tsx` after the hero: social proof marquee, problem section, alternating feature chapters, demo CTA cards, testimonials, pricing, FAQ, final CTA, and footer. Added marquee keyframes/utilities in `app/globals.css`.
- [x] E.8 verification: `npm run typecheck`, `npm run lint`, and `npm run build` pass. Production preview restarted at `http://127.0.0.1:3001` because port 3000 is occupied by another local app. Smoke-tested `/` with HTTP 200. Playwright desktop/mobile checks passed with screenshots in `.next/phase-e-shots`; WebGL canvas was found and nonblank on both viewports, with zero horizontal overflow.
- [x] F.1 kickoff: Read `build_log.md`, loaded requested visual/design/motion skills from local skill roots, and audited the main agency/client shells plus dashboard, client/project/invoice surfaces.
- [x] F.1 diagnosis: Global CSS drifted harsher than `DESIGNS.md` (`#000000`, `#FFFFFF`, stronger gold glow); app surfaces are functional but still too card-stacked and need a calmer executive-command visual rhythm.
- [x] F.2 foundation + agency cockpit: Tuned `app/globals.css` back toward warm Obsidian & Gold tokens, added `lux-*` utility classes, updated `app/layout.tsx` theme color, calmed default `Card` hover behavior, redesigned `AgencyShell`, and rebuilt `/app/dashboard` into an executive command surface.
- [x] F.3 app surface pass: Reworked `/app/clients`, `/app/projects`, `/app/invoices`, settings shell, branding/billing/team settings polish, project workspace shell, notification overlay, and client portal shell/home/project/invoice/login surfaces toward the shared luxury command-room system.
- [x] F.4 verification: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --audit-level=moderate` pass. Production preview is running at `http://127.0.0.1:3001` because port 3000 is occupied by another local app. Smoke-tested `/`, `/app/dashboard`, `/app/clients`, `/app/projects`, `/app/invoices`, `/app/settings/team`, `/portal/northstar-brand`, `/portal/northstar-brand/projects/dev-proj-001`, `/portal/northstar-brand/invoices`, and `/portal/northstar-brand/login` with HTTP 200 responses.

## Pending (future)
- [ ] Git repository initialization
- [ ] Database provisioning + first migration
- [ ] Stripe product/price setup
- [ ] Google OAuth console setup
- [ ] Resend domain verification
- [ ] Deploy to Vercel (or preferred host)
- [ ] Post-deploy smoke test

## Key Decisions Log
| Decision | Choice Made | Reason |
|----------|-------------|--------|
| Product name | PortalOS | Required by the master build spec. |
| Framework | Next.js 15 App Router | Required by the master build spec. |
| Language | TypeScript strict mode | Required by the master build spec. |
| Styling | Tailwind CSS v4 with CSS variables | Required by the master build spec. |
| Visual direction | Japanese editorial luxury | `design-constraints-addendum.md` overrides conflicting UI guidance in the master spec. |
| Display font | Cormorant Garamond | Required by the design addendum for display, headings, and hero copy. |
| UI/body font | DM Sans | Required by the design addendum for body, labels, metadata, and UI text. |
| Icon system | Lucide React | Required by the build spec and reaffirmed by the design addendum. |
| Project root | `c:\Users\musal\OneDrive\Desktop\SaaS` | Existing sibling folders are empty; the master prompt requires `BUILD_LOG.md` and app folders at the project root. |
| Next.js version | `15.5.15` | Latest available package in the Next.js 15 line; avoids drifting to a later major version. |
| Tailwind version | `4.2.4` | Latest available Tailwind CSS 4 package at scaffold time. |
| PostCSS override | `8.5.12` | Keeps the required Next.js 15 line while resolving npm audit advisory GHSA-qx2v-qp2m-jg93. |
| Prisma version | `7.8.0` | Latest available Prisma package at setup time. |
| Prisma CLI transitive override | `@hono/node-server@1.19.13` | Keeps Prisma 7 while resolving npm audit advisory GHSA-92pp-h63x-v22m. |
| NextAuth version | `5.0.0-beta.31` | Current `next-auth@beta`, required for Auth.js v5 App Router support. |
| Auth adapter | `@auth/prisma-adapter@2.11.2` | Official Auth.js Prisma adapter for NextAuth v5. |
| Resend version | `6.1.3` | Newer Resend versions pulled vulnerable `svix`/`uuid`; `6.1.3` keeps audit clean. |
| Prisma runtime adapter | `@prisma/adapter-pg@7.8.0` with `pg@8.20.0` | Prisma 7 requires a driver adapter or Accelerate URL for runtime client construction. |
| Service client pattern | Lazy singleton factories | Avoids eager network setup and throws clear missing-env errors only when a service is used. |
| Session strategy | Database sessions | Required by the master spec; agency user sessions are stored in the `sessions` table. |
| Output tracing root | `process.cwd()` | Prevents Next.js from selecting a parent workspace because `C:\Users\musal\package-lock.json` also exists. |
| Design addendum switch | `design-constraints-addendum 2 .md` is now canonical | User directive; content is identical to original addendum. Japanese editorial luxury aesthetic unchanged. |
| Current model | DeepSeek v4 Pro (2026-04-28) | Picking up at Phase 2.5; continuing the build per the master prompt and design constraints. |
| dnd-kit approach | `@dnd-kit/core` with `closestCorners` and manual column detection | Simpler than multi-container sortable; drop target determined from `over.id` (column or sibling task). Status updates via server action. |
| Prisma query pattern | Top-level `include` instead of deeply nested `select` | Prisma 7 type inference was rejecting `_count` inside relation `select`; using `include` + separate `groupBy` for comment counts resolved it. |
| Design system | Dark luxury "Obsidian & Gold" | DESIGNS.md overrides both earlier design addenda; dark mode is default, gold is the only accent color, blossom/pink/washi/glassmorphism are all banned. |
| Display font | Playfair Display (400, 500) | DESIGNS.md replaces Cormorant Garamond; old-style numerals via font-feature-settings "onum". |
| Mono font | JetBrains Mono (400) | New addition per DESIGNS.md; used for invoice totals, amounts, monospace data with tabular-nums. |
| Gold button text | Dark (#0A0A0B) on gold (#D4AF37), never white | DESIGNS.md rule; gold primary buttons use dark text for contrast on the metallic gold background. |
| Card top edge | `border-top-color: rgba(255,255,255,0.10)` | Creates a physical edge illusion on cards per DESIGNS.md depth system. |
| Scroll animations | CSS `animation-timeline: view()` in @supports | Zero-JS progressive enhancement; replaces Framer Motion which caused lag on the landing page. |
| Noise texture | `body::after` pseudo-element with SVG feTurbulence at 2.5% opacity, z-index 9999 | Per DESIGNS.md; applies globally behind all content. |
| Gold rationing | Max 2-3 gold elements per screen | DESIGNS.md constraint; gold is the only accent — use sparingly. |
| Sidebar width | 240px fixed (was 280px in addendum 2) | Per DESIGNS.md spec. |
| Content max-width | 1280px (was 1200px in addendum 2) | Per DESIGNS.md spec. |
| Security headers | HSTS + X-Content-Type-Options + X-Frame-Options + Referrer-Policy + Permissions-Policy | Standard production security hardening for Next.js. |
| Health check | /api/health returns JSON with status, timestamp, uptime | Simple uptime monitoring endpoint; no database dependency so it works even during DB outages. |
| SEO | Next.js Metadata API + sitemap.ts + robots.txt | Dynamic sitemap generation via Next.js MetadataRoute; static robots.txt in public/. |

## Newly Added Files (Phase 7 — Deploy readiness)
- `app/api/health/route.ts`
- `app/sitemap.ts`
- `public/robots.txt`

## File Map (current as of 2026-04-29)
/
├── app/
│   ├── (agency)/
│   │   └── app/
│   │       ├── page.tsx                  (→ redirects to /app/dashboard)
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── clients/
│   │       │   ├── page.tsx
│   │       │   └── new/
│   │       │       └── page.tsx
│   │       ├── projects/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [projectId]/
│   │       │       └── page.tsx
│   │       └── settings/
│   │           ├── page.tsx              (→ redirects to /app/settings/team)
│   │           ├── team/
│   │           │   └── page.tsx
│   │           ├── branding/
│   │           │   └── page.tsx
│   │           └── billing/
│   │               └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── onboarding/
│   │       └── page.tsx
│   ├── (client)/
│   │   └── portal/
│   │       └── [clientSlug]/
│   │           ├── layout.tsx
│   │           ├── page.tsx              (portal home)
│   │           ├── login/
│   │           │   └── page.tsx
│   │           ├── invoices/
│   │           │   └── page.tsx
│   │           └── projects/
│   │               └── [projectId]/
│   │                   └── page.tsx
│   ├── (marketing)/
│   │   └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   ├── generate-brief/
│   │   │   │   └── route.ts
│   │   │   └── summarize-project/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── health/
│   │   │   └── route.ts
│   │   └── inngest/
│   │       └── route.ts
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── sitemap.ts
├── actions/
│   ├── briefs.ts
│   ├── clients.ts
│   ├── comments.ts
│   ├── deliverables.ts
│   ├── invoices.ts
│   ├── projects.ts
│   ├── safe-action.ts
│   └── tasks.ts
├── components/
│   ├── agency/
│   │   ├── agency-shell.tsx
│   │   ├── ai-brief-modal.tsx
│   │   ├── brief-editor.tsx
│   │   ├── client-create-form.tsx
│   │   ├── comments-view.tsx
│   │   ├── deliverables-view.tsx
│   │   ├── invoice-builder.tsx
│   │   ├── kanban-board.tsx
│   │   ├── kanban-column.tsx
│   │   ├── project-create-form.tsx
│   │   ├── project-workspace-tabs.tsx
│   │   ├── settings-shell.tsx
│   │   ├── task-card.tsx
│   │   └── task-dialog.tsx
│   ├── client/
│   │   ├── approval-modal.tsx
│   │   ├── comment-input.tsx
│   │   ├── portal-shell.tsx
│   │   └── project-view.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── skeleton.tsx
│       └── tooltip.tsx
├── emails/
│   ├── comment-notification.tsx
│   ├── deliverable-approved.tsx
│   ├── invoice-overdue.tsx
│   └── team-invitation.tsx
├── hooks/
│   └── use-ably.ts
├── inngest/
│   └── jobs.ts
├── lib/
│   ├── ably.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── dev-bypass.ts
│   ├── env.ts
│   ├── inngest.ts
│   ├── openai.ts
│   ├── permissions.ts
│   ├── posthog.ts
│   ├── resend.ts
│   ├── stripe.ts
│   ├── supabase.ts
│   └── utils.ts
├── prisma/
│   ├── migrations/
│   │   └── 20260428175500_init/
│   │       └── migration.sql
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── next-auth.d.ts
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── middleware.ts
├── BUILD_LOG.md
├── DESIGNS.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts
├── tailwind.config.ts
└── tsconfig.json

## Newly Added Files (Phase 2.1-2.2)
- `app/(agency)/app/layout.tsx`
- `app/(agency)/app/page.tsx`
- `app/(agency)/app/dashboard/page.tsx`
- `components/agency/agency-shell.tsx`

## Newly Added Files (Phase 2.3)
- `actions/clients.ts`
- `actions/safe-action.ts`
- `app/(agency)/app/clients/page.tsx`
- `app/(agency)/app/clients/new/page.tsx`
- `components/agency/client-create-form.tsx`
- `lib/permissions.ts`

## Newly Added Files (Phase 2.4)
- `actions/projects.ts`
- `app/(agency)/app/projects/page.tsx`
- `app/(agency)/app/projects/new/page.tsx`
- `components/agency/project-create-form.tsx`

## Newly Added Files (Phase 2.5)
- `actions/tasks.ts`
- `app/(agency)/app/projects/[projectId]/page.tsx`
- `components/agency/kanban-board.tsx`
- `components/agency/kanban-column.tsx`
- `components/agency/task-card.tsx`
- `components/agency/task-dialog.tsx`
- `components/agency/project-workspace-tabs.tsx`

## Newly Added Files (Phase 3 — Client Portal)
- `app/(client)/portal/[clientSlug]/layout.tsx`
- `app/(client)/portal/[clientSlug]/page.tsx`
- `app/(client)/portal/[clientSlug]/projects/[projectId]/page.tsx`
- `app/(client)/portal/[clientSlug]/invoices/page.tsx`
- `app/(client)/portal/[clientSlug]/login/page.tsx`
- `components/client/portal-shell.tsx`
- `components/client/project-view.tsx`
- `components/client/comment-input.tsx`
- `components/client/approval-modal.tsx`

## Newly Added Files (Dev Bypass Fix)
- `lib/dev-bypass.ts`

## Newly Added Files (Phase 2.6)
- `actions/briefs.ts`
- `app/api/ai/generate-brief/route.ts`
- `components/agency/brief-editor.tsx`
- `components/agency/ai-brief-modal.tsx`

## Blockers & Notes
- Phase F build note: first `npm run build` attempt timed out while old SaaS preview/build Node processes were still running. Stopped only the SaaS workspace Node processes, left unrelated `velocity-ai` processes untouched, reran build successfully, and restarted PortalOS preview on `http://127.0.0.1:3001` because port 3000 is currently occupied by another local app.
- `image-to-code` was requested but was not installed at `C:\Users\musal\.codex\skills\image-to-code\SKILL.md`; proceeding with the loaded visual design skills and addendum.
- The addendum overrides the spec's original Inter/default purple design system. Use Cormorant Garamond, DM Sans, and the warm washi/blossom/gold palette instead.
- Workspace is not currently a git repository.
- Npm audit is clean after the PostCSS override.
- Lint issue resolved: home navigation now uses `next/link`.
- Build warning resolved: `outputFileTracingRoot` is set in `next.config.ts`.
- Local preview server is running at `http://127.0.0.1:3000` using `npm run start`; HTTP check returned 200.
- `npm run dev` opened port 3000 but did not become responsive during verification, so the usable local server is the production preview server after `npm run build`.
- Prisma install is clean after the `@hono/node-server` override.
- Local `.env` contains only a non-secret placeholder `DATABASE_URL` for CLI compatibility and is ignored by git.
- `npm run build` initially timed out while the Phase 1.1 preview server was still running. After stopping the server, the same build passed in 11.1s.
- `npm run start` preview server is running again at `http://127.0.0.1:3000`; HTTP check returned 200.
- `prisma db seed` was not run because no live PostgreSQL database is configured at the placeholder local `DATABASE_URL`.
- Auth.js implementation follows the official App Router pattern: `NextAuth()` exports `handlers`, `auth`, `signIn`, and `signOut`; the catch-all route re-exports `GET` and `POST`.
- Build initially failed after adding Auth.js because Prisma 7 requires a runtime driver adapter. Installed `@prisma/adapter-pg` and `pg`, then wired `lib/db.ts`; build now passes.
- Local preview server is running at `http://127.0.0.1:3000`; `/login` and `/api/auth/providers` both return HTTP 200.
- Middleware intentionally uses cookie-level route gating instead of importing Auth.js/Prisma directly, because Prisma's Postgres adapter is Node-only and middleware runs in the Edge runtime.
- Completed five build-order steps in this push: Phase 1.4, 1.5, 1.6, 2.1, and 2.2.
- Client creation action is not runtime-tested against PostgreSQL because no live database/session is configured yet; compile, lint, Prisma validation, and build all pass.
- Project creation action is not runtime-tested against PostgreSQL because no live database/session is configured yet; compile, lint, Prisma validation, and build all pass.
- A build attempt timed out while stale local Next/npm processes were still running. Stopping workspace-local Node processes and rerunning `npm run build` succeeded in 16.1s.
- DEV_BYPASS_AUTH workaround: without a live PostgreSQL database, `auth()` in server components fails and all `/app/*` routes redirect to `/login`. Added `DEV_BYPASS_AUTH=true` in `.env` with middleware bypass logic and mock data layer (`lib/dev-bypass.ts`) so the full app UI is visible without auth or a database. Dynamic pages (like `[projectId]`) return mock showroom data when bypass is active.
- Dev server running at `http://localhost:3000` — all routes verified with HTTP 200 (dashboard, projects, clients, new project, new client, project workspace). `/login` returns 307 redirect to `/app/dashboard`.
