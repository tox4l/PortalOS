# PortalOS — Full System Architecture Audit

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Database Schema — Complete Model Map](#3-database-schema--complete-model-map)
4. [Authentication & Authorization Chain](#4-authentication--authorization-chain)
5. [Multi-Tenant Routing Architecture](#5-multi-tenant-routing-architecture)
6. [Tier 2 (Agency) to Tier 3 (Client) Communication](#6-tier-2-agency-to-tier-3-client-communication)
7. [Server Actions Layer (RPC)](#7-server-actions-layer-rpc)
8. [API Routes](#8-api-routes)
9. [Real-Time Infrastructure (Ably)](#9-real-time-infrastructure-ably)
10. [Email Infrastructure (Resend)](#10-email-infrastructure-resend)
11. [Rate Limiting & Security](#11-rate-limiting--security)
12. [Dev Bypass Mode](#12-dev-bypass-mode)
13. [Complete Route Map](#13-complete-route-map)
14. [Component Architecture](#14-component-architecture)
15. [Design System Token Reference](#15-design-system-token-reference)
16. [Infrastructure Dependencies](#16-infrastructure-dependencies)
17. [Deployment & Environment Variables](#17-deployment--environment-variables)

---

## 1. Executive Summary

PortalOS is a **white-label client operations portal** for creative agencies. It provides a private, branded workspace where agencies (Tier 2) manage projects, briefs, deliverables, tasks, and comments, while their clients (Tier 3) access a scoped, branded portal to review work, approve deliverables, and communicate.

**Tech Stack:**
- **Framework:** Next.js 15.5.15 (App Router, React 19)
- **Database:** PostgreSQL via Prisma 7.8.0 with `@prisma/adapter-pg` connection pooling
- **Auth:** Auth.js v5 (next-auth@beta) — Google OAuth + Resend magic link
- **Real-time:** Ably (SSE/WebSocket pub/sub)
- **Email:** Resend with React Email templates
- **Storage:** Supabase (S3-compatible)
- **AI:** OpenAI GPT-4o (brief generation, project summaries)
- **Payments:** Stripe (integrated, checkout flow)
- **Analytics:** PostHog
- **Styling:** Tailwind CSS v4.2.4 with CSS-based config, "Obsidian & Gold" design system
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)

**Architecture Pattern:** Server Components as default, Client Components (`"use client"`) only where interactivity is needed. Server Actions serve as the RPC layer (tRPC-style pattern with `ActionResult<T>` wrappers). No REST API for internal operations — all mutations go through Server Actions.

---

## 2. System Architecture Overview

```
                          ┌─────────────────────────────────────┐
                          │           Cloudflare / Vercel       │
                          │   (Edge middleware runs first)       │
                          └──────────────┬──────────────────────┘
                                         │
                          ┌──────────────▼──────────────────────┐
                          │         Next.js Middleware           │
                          │  - Host-based agency slug extraction │
                          │  - Session cookie check for /app/*    │
                          │  - Dev bypass redirects              │
                          │  - Subdomain → /portal/[slug] rewrite│
                          └──────────────┬──────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
    ┌─────────▼─────────┐    ┌──────────▼──────────┐    ┌─────────▼─────────┐
    │  Marketing Routes  │    │   Agency Routes     │    │  Client Routes    │
    │  (public)          │    │   (Tier 2, auth)    │    │  (Tier 3, portal) │
    │  /                 │    │   /app/*            │    │  /portal/[slug]/* │
    │  /demo/agency      │    │   /login            │    │                    │
    │  /demo/client      │    │   /onboarding       │    │                    │
    │  /legal/*          │    │                     │    │                    │
    └─────────┬─────────┘    └──────────┬──────────┘    └─────────┬─────────┘
              │                          │                          │
              │              ┌───────────▼───────────┐              │
              │              │    Server Actions      │              │
              │              │  (RPC / mutations)     │              │
              │              │  - clients.ts          │              │
              │              │  - projects.ts         │              │
              │              │  - tasks.ts            │              │
              │              │  - briefs.ts           │              │
              │              │  - deliverables.ts     │              │
              │              │  - comments.ts         │              │
              │              │  - notifications.ts    │              │
              │              └───────────┬───────────┘              │
              │                          │                          │
              └──────────────────────────┼──────────────────────────┘
                                         │
                          ┌──────────────▼──────────────────────┐
                          │           Data Layer                 │
                          │  ┌──────────┐  ┌──────────────────┐ │
                          │  │  Prisma  │  │  Dev Bypass      │ │
                          │  │  (PG)    │  │  (in-memory mock)│ │
                          │  └──────────┘  └──────────────────┘ │
                          └──────────────┬──────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
    ┌─────────▼─────────┐    ┌──────────▼──────────┐    ┌─────────▼─────────┐
    │       Ably         │    │      Resend          │    │     Supabase       │
    │  (real-time)       │    │  (transactional)     │    │  (file storage)    │
    │  - notifications   │    │  - magic links       │    │  - deliverables    │
    │  - comments        │    │  - comment emails    │    │  - brand assets    │
    │  - activity        │    │  - team invites      │    │                    │
    └────────────────────┘    └─────────────────────┘    └────────────────────┘
```

### Data Flow Summary

1. **Request** hits Vercel edge → Next.js middleware inspects host header, extracts agency slug, checks session cookies
2. **Server Components** fetch data directly via Prisma (or dev bypass mocks), render HTML
3. **Client Components** hydrate with initial server data, subscribe to Ably channels for real-time updates
4. **Mutations** go through Server Actions → Prisma writes to PostgreSQL → revalidatePath triggers re-render
5. **Notifications** are created server-side after mutations, published to Ably channels, and optionally emailed via Resend
6. **Files** are uploaded to Supabase Storage, URLs stored in the Deliverable model

---

## 3. Database Schema — Complete Model Map

### 3.1 Models (18 total)

#### Agency
The top-level tenant. One agency has many users, clients, projects.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | Display name |
| slug | String | Unique, used for subdomain routing |
| logoUrl | String? | Supabase URL |
| brandColor | String | Default "#D4607A", used in client portal theming |
| brandFont | String | Default "Cormorant Garamond" |
| customDomain | String? | Unique, for white-label custom domains |
| demoMode | Boolean | Default false |

**Relations:** users[], clients[], clientUsers[], projects[], notifications[], activityEvents[]

#### User (Agency Team Member — Tier 2)
Authenticated via Auth.js. Belongs to one agency.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| email | String? | Unique |
| name | String? | Display name |
| image | String? | Avatar URL |
| role | UserRole | OWNER, ADMIN, or MEMBER |
| agencyId | String? | FK to Agency |
| emailVerified | DateTime? | Auth.js |
| lastSeenAt | DateTime? | Activity tracking |
| demoLocked | Boolean | Prevents demo data modification |

**Relations:** agency, accounts[], sessions[], createdProjects[], assignedTasks[], uploadedFiles[], comments[], notifications[], activityEvents[]

#### Account, Session, VerificationToken
Standard Auth.js models for OAuth provider accounts, database sessions, and magic link verification tokens. Managed entirely by Auth.js PrismaAdapter.

#### Client (Tier 3 Organization)
Represents a client company. Belongs to one agency.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| companyName | String | Display name |
| contactName | String | Primary contact |
| contactEmail | String | Primary contact email |
| logoUrl | String? | Client logo |
| portalSlug | String | Unique, URL segment for client portal |
| welcomeMessage | String | Shown on portal home |
| status | ClientStatus | ACTIVE or ARCHIVED |
| agencyId | String | FK to Agency |

**Relations:** agency, clientUsers[], projects[], notifications[], activityEvents[]

#### ClientUser (Tier 3 Person)
A person who can log into a client portal. Separate from User model — clients do NOT use Auth.js.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| email | String | Login identifier |
| name | String | Display name |
| clientId | String | FK to Client |
| agencyId | String | FK to Agency |
| lastLoginAt | DateTime? | Activity tracking |
| demoLocked | Boolean | Prevents demo data modification |

**Unique constraint:** [clientId, email] — one person per email per client

**Relations:** client, agency, approvals[], comments[], notifications[], activityEvents[]

#### Project
The core work unit. Belongs to one agency and one client.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | Project name |
| description | String? | Long text |
| status | ProjectStatus | DRAFT→ACTIVE→IN_REVIEW→COMPLETE→ARCHIVED |
| dueDate | DateTime? | Deadline |
| coverImageUrl | String? | Cover image |
| agencyId | String | FK to Agency |
| clientId | String | FK to Client |
| createdById | String | FK to User (creator) |

**Relations:** agency, client, createdBy, tasks[], deliverables[], comments[], brief?, notifications[], activityEvents[]

#### Task
Kanban board item within a project.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | Task title |
| description | String? | Long text |
| status | TaskStatus | TODO→IN_PROGRESS→IN_REVIEW→DONE |
| priority | TaskPriority | LOW, MEDIUM, HIGH, URGENT |
| dueDate | DateTime? | Deadline |
| position | Float | Order within column (for drag-and-drop) |
| projectId | String | FK to Project |
| assigneeId | String? | FK to User |

**Relations:** project, assignee

#### Deliverable
A file uploaded for client review. Versioned.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | Display title |
| description | String? | Notes about the file |
| fileUrl | String | Supabase storage URL |
| fileName | String | Original filename |
| fileSize | Int | Bytes |
| fileType | String | MIME type |
| version | Int | Starts at 1, increments on re-upload |
| status | DeliverableStatus | DRAFT→PENDING_REVIEW→APPROVED/REJECTED |
| projectId | String | FK to Project |
| uploadedById | String | FK to User (agency uploader) |
| approvedById | String? | FK to ClientUser (who approved) |
| approvedAt | DateTime? | When approved |

**Relations:** project, uploadedBy, approvedBy, comments[]

#### Comment
Threaded comments on projects and deliverables. Dual authorship (User or ClientUser).

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| body | String | Comment text |
| projectId | String | FK to Project |
| deliverableId | String? | Optional FK to Deliverable |
| authorUserId | String? | FK to User (agency author) |
| authorClientUserId | String? | FK to ClientUser (client author) |
| parentId | String? | FK to Comment (threading) |
| isInternal | Boolean | True = agency-only, hidden from clients |

**Relations:** project, deliverable, authorUser, authorClientUser, parent, replies[]

#### Brief
One brief per project (1:1 via unique projectId). Stores TipTap editor JSON.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | Brief title |
| content | Json | TipTap ProseMirror JSON |
| status | BriefStatus | DRAFT→SENT→APPROVED |
| projectId | String | Unique FK to Project |
| generatedByAi | Boolean | True if AI-generated |

**Relations:** project

#### Notification
Real-time notification for both User (agency) and ClientUser (client).

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| type | NotificationType | COMMENT, APPROVAL, MENTION, TASK_ASSIGNED, DELIVERABLE_UPLOADED |
| title | String | Short title |
| body | String | Detail text |
| read | Boolean | Default false |
| link | String | Deep link to relevant page |
| userId | String? | FK to User (agency recipient) |
| clientUserId | String? | FK to ClientUser (client recipient) |
| agencyId | String? | FK to Agency |
| clientId | String? | FK to Client |
| projectId | String? | FK to Project |

**Relations:** user, clientUser, agency, client, project

#### ActivityEvent
Persistent activity log for the workspace. Records all significant actions.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| type | ActivityEventType | COMMENT_POSTED, APPROVAL_GIVEN, DELIVERABLE_UPLOADED, TASK_MOVED, BRIEF_SENT |
| title | String | Event title |
| body | String | Event detail |
| link | String | Deep link |
| agencyId | String | FK to Agency |
| clientId | String? | FK to Client |
| projectId | String? | FK to Project |
| actorUserId | String? | FK to User (who did it) |
| actorClientUserId | String? | FK to ClientUser (who did it) |

**Relations:** agency, client, project, actorUser, actorClientUser

#### DemoResetLog
Tracks periodic demo data cleanup operations.

| Field | Type | Notes |
|-------|------|-------|
| resetAt | DateTime | When reset occurred |
| recordsDeleted | Int | How many records cleaned |

### 3.2 Enums (10 total)

| Enum | Values | Used By |
|------|--------|---------|
| UserRole | OWNER, ADMIN, MEMBER | User.role |
| ClientStatus | ACTIVE, ARCHIVED | Client.status |
| ProjectStatus | DRAFT, ACTIVE, IN_REVIEW, COMPLETE, ARCHIVED | Project.status |
| TaskStatus | TODO, IN_PROGRESS, IN_REVIEW, DONE | Task.status |
| TaskPriority | LOW, MEDIUM, HIGH, URGENT | Task.priority |
| DeliverableStatus | DRAFT, PENDING_REVIEW, APPROVED, REJECTED | Deliverable.status |
| BriefStatus | DRAFT, SENT, APPROVED | Brief.status |
| NotificationType | COMMENT, APPROVAL, MENTION, TASK_ASSIGNED, DELIVERABLE_UPLOADED | Notification.type |
| ActivityEventType | COMMENT_POSTED, APPROVAL_GIVEN, DELIVERABLE_UPLOADED, TASK_MOVED, BRIEF_SENT | ActivityEvent.type |

### 3.3 Key Relationship Diagram

```
Agency (1) ───────────< (many) User
Agency (1) ───────────< (many) Client
Agency (1) ───────────< (many) ClientUser
Agency (1) ───────────< (many) Project
Agency (1) ───────────< (many) Notification
Agency (1) ───────────< (many) ActivityEvent

Client (1) ───────────< (many) ClientUser
Client (1) ───────────< (many) Project
Client (1) ───────────< (many) Notification
Client (1) ───────────< (many) ActivityEvent

Project (1) ───────────< (many) Task
Project (1) ───────────< (many) Deliverable
Project (1) ───────────< (many) Comment
Project (1) ──────────── (0..1) Brief
Project (1) ───────────< (many) Notification
Project (1) ───────────< (many) ActivityEvent

User (1) ──────────────< (many) Comment (as authorUser)
User (1) ──────────────< (many) Task (as assignee)
User (1) ──────────────< (many) Deliverable (as uploader)
User (1) ──────────────< (many) Notification
User (1) ──────────────< (many) ActivityEvent (as actor)

ClientUser (1) ────────< (many) Comment (as authorClientUser)
ClientUser (1) ────────< (many) Deliverable (as approver)
ClientUser (1) ────────< (many) Notification
ClientUser (1) ────────< (many) ActivityEvent (as actor)

Comment (1) ───────────< (many) Comment (self-referential threading via parentId)
```

### 3.4 Data Isolation Strategy

Every query is scoped to the authenticated user's agency or client:
- Agency queries: `WHERE agencyId = session.user.agencyId`
- Client queries: `WHERE client.portalSlug = params.clientSlug` (via URL param, not session)
- Internal comments filtered: `WHERE isInternal = false` for client-facing views
- Notifications filtered by `userId` (agency) or `clientUserId` (client)

---

## 4. Authentication & Authorization Chain

### 4.1 Auth.js Configuration (`lib/auth.ts`)

**Providers:**
1. **Google OAuth** — for agency team members. Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars. Disables dangerous email account linking.
2. **Resend Magic Link** — passwordless email sign-in. Uses Resend API key. Sends a one-time link to the user's email.

**Session Strategy:** Database sessions (not JWT). 30-day max age, 24-hour update window.

**Session Callback** enriches the session with agency context:
```typescript
session.user.id = user.id;
session.user.role = user.role;           // OWNER | ADMIN | MEMBER
session.user.agencyId = user.agencyId;
session.user.agencySlug = agency?.slug;
session.user.agencyName = agency?.name;
session.user.agencyBrandColor = agency?.brandColor;
session.user.demoLocked = user.demoLocked;
```

**Redirect Callback** ensures same-origin redirects only. Falls back to `/app/dashboard`.

**Pages:** Sign-in at `/login`, verification at `/login?check=email`, errors at `/login`.

**Auth.js API Route:** `app/api/auth/[...nextauth]/route.ts` simply re-exports the handlers.

### 4.2 Authorization Guards (`lib/authz.ts`)

| Function | Purpose | Redirect on Failure |
|----------|---------|---------------------|
| `requireSession()` | Any authenticated user | `/login` |
| `requireAgencyMember()` | Must have agencyId (Tier 2) | `/login` |
| `requireAgencyAdmin(agencyId)` | Must be OWNER or ADMIN of specified agency | `/login` or `/app/dashboard` |
| `getViewScope()` | Returns `{ tier, agencyId }` or `{ tier, clientId }` for query filtering | null (no redirect) |

### 4.3 Role-Based Access Control (`lib/permissions.ts`)

| Role | Permissions |
|------|-------------|
| OWNER | client:create, client:manage, project:write, team:manage |
| ADMIN | client:create, client:manage, project:write, team:manage |
| MEMBER | project:write only |

`checkPermission(userId, action)` queries the user's role and checks against the rolePermissions map.

### 4.4 Client Authentication (Tier 3)

Clients do NOT use Auth.js. They authenticate via:
1. **Magic link** sent to their email (Resend)
2. The link contains a token that identifies the ClientUser
3. Client portal routes (`/portal/[clientSlug]/*`) are protected by the ClientUser session stored in... (currently, client auth is handled via dev bypass or through the magic link flow)

The `ClientUser` model stores email and name separately from the `User` model, allowing clients to have portal access without full Auth.js accounts.

---

## 5. Multi-Tenant Routing Architecture

### 5.1 Middleware (`middleware.ts`)

The middleware runs on every request that matches the matcher pattern (all routes except `_next/static`, `_next/image`, `favicon.ico`).

**Host-Based Agency Slug Extraction:**
```
agency.lumina-studio.localhost → slug = "lumina-studio"
lumina-studio.portalos.app    → slug = "lumina-studio"
portalos.app                  → slug = null (main marketing site)
localhost:3000                → slug = null
```

**Subdomain Rewrite:** When an agency slug is detected and the path is not already under `/portal` or `/api`, the request is rewritten:
```
lumina-studio.portalos.app/projects/123
→ /portal/lumina-studio/projects/123?agency=lumina-studio
```

**Session Protection:** Routes under `/app/*` require a session cookie. Missing cookie → redirect to `/login` with callbackUrl.

**Dev Bypass Behavior:**
- `/portal` → redirects to `/demo/client`
- `/login` → redirects to `/app/dashboard` (auto-authenticated)

**Already-Authenticated Redirect:** If user has a session cookie and visits `/login`, redirect to `/app/dashboard`.

### 5.2 Route Groups

| Group | Purpose | URL Prefix | Auth Required |
|-------|---------|------------|---------------|
| `(marketing)` | Public landing, demo, legal | `/`, `/demo/*`, `/legal/*` | No |
| `(auth)` | Authentication pages | `/login`, `/onboarding` | No (but login redirects if authed) |
| `(agency)` | Tier 2 agency dashboard | `/app/*` | Yes (agency User) |
| `(client)` | Tier 3 client portal | `/portal/[clientSlug]/*` | Yes (client magic link) |

### 5.3 Agency Shell (`components/agency/agency-shell.tsx`)

The persistent layout for all `/app/*` routes. Features:
- 240px fixed left sidebar with agency branding
- Sticky top header with page title and breadcrumb eyebrow
- Navigation: Dashboard, Clients, Projects, Invoices, Settings
- NotificationPanel in the header
- Mobile-responsive: sidebar collapses to horizontal scroll nav
- "Showroom data live" indicator for demo mode
- User avatar + role in sidebar footer

### 5.4 Client Portal Shell (`components/client/portal-shell.tsx`)

The persistent layout for all `/portal/[clientSlug]/*` routes. Features:
- Dynamic brand theming via CSS custom properties injected as inline styles
- Agency brand color overrides gold tokens (`--gold-core`, `--gold-dim`, `--border-gold`, etc.)
- Agency name + client name in header
- Projects navigation
- NotificationPanel for client notifications
- Sign out button
- Footer with "Powered by PortalOS / {agencyName}"

**Brand Color Injection:**
```typescript
const brandVars = {
  "--brand": brandColor,
  "--gold-core": brandColor,
  "--gold-mid": brandColor,
  "--gold-dim": rgbaFromHex(brandColor, 0.06),
  "--border-gold": rgbaFromHex(brandColor, 0.45),
  "--border-gold-dim": rgbaFromHex(brandColor, 0.20),
  "--gold-100": rgbaFromHex(brandColor, 0.06),
  "--gold-200": rgbaFromHex(brandColor, 0.12),
  // ... etc
};
```

This is the white-label mechanism — the agency's brand color replaces the default gold throughout the client portal.

---

## 6. Tier 2 (Agency) to Tier 3 (Client) Communication

### 6.1 Communication Channels

PortalOS has **4 distinct communication channels** between Tier 2 (agency) and Tier 3 (client):

#### Channel 1: Shared Project Workspace
The project page (`/app/projects/[projectId]`) and client project page (`/portal/[slug]/projects/[projectId]`) share the same underlying data but with different visibility:
- **Agency sees:** All tasks (kanban), all comments (internal + client), all deliverables, full brief editor
- **Client sees:** Non-internal comments, deliverables (for review/approval), brief (read-only if sent)

#### Channel 2: Comments with Internal Flag
Comments are the primary async communication mechanism:
- `isInternal: true` → agency-only, never shown to clients
- `isInternal: false` → visible to both agency and client
- When an agency user posts a non-internal comment, a notification is created for the client (`audience: "client"`)
- When a client posts a comment, a notification is created for the agency (`audience: "agency"`)

#### Channel 3: Deliverable Review Cycle
The approval workflow is a structured communication protocol:
1. Agency uploads deliverable → status: DRAFT
2. Agency clicks "Request Approval" → status: PENDING_REVIEW
3. Client receives notification + email → reviews in portal
4. Client approves → status: APPROVED, agency notified
5. Client requests changes → status: REJECTED, comment created, agency notified

#### Channel 4: Notifications (Real-Time + Persistent)
Notifications are created server-side after every significant action and delivered via:
- **Ably real-time channel** (instant in-app)
- **Database record** (persistent, shown in notification panel)

Each notification has an `audience` field:
- `"agency"` → creates one notification per agency User
- `"client"` → creates one notification per ClientUser of the relevant client
- `"direct"` → creates a single notification for a specific user

### 6.2 Notification Creation Flow

```
Action occurs (e.g., comment posted)
  └─> createNotification() called
       ├─> Determine audience (agency / client / direct)
       ├─> Create Notification records in DB (one per recipient)
       ├─> Publish to Ably channel
       │    ├─> Agency: "agency:{agencyId}:notifications"
       │    └─> Client: "client:{clientIdOrSlug}:notifications"
       └─> (Email sent separately via Resend if configured)
```

### 6.3 End-to-End Example: Client Comments on a Deliverable

1. **Client** opens `/portal/northstar-brand/projects/proj-001`
2. Client writes comment in `CommentInput` component
3. `createClientCommentAction()` is called (Server Action)
4. Server validates: clientSlug matches, project exists under that client
5. Comment is created with `authorClientUserId`, `isInternal: false`
6. `createNotification()` is called with `audience: "agency"`
7. Notification records created for all agency Users
8. Notification published to Ably channel `agency:dev-agency-001:notifications`
9. Agency users see real-time notification badge update
10. Agency user clicks notification → navigates to project → sees client comment

### 6.4 End-to-End Example: Agency Requests Approval

1. **Agency user** uploads a deliverable, clicks "Request Approval"
2. `requestApprovalAction()` called
3. Deliverable status updated to PENDING_REVIEW
4. `createNotification()` called with `audience: "client"`, `clientSlug`
5. Notification records created for all ClientUsers of that client
6. Notification published to Ably channel `client:northstar-brand:notifications`
7. Client sees notification, clicks → navigates to deliverable
8. Client approves or requests changes via `approveClientDeliverableAction()` / `requestClientChangesAction()`
9. Agency notified of the decision

---

## 7. Server Actions Layer (RPC)

All mutations go through Server Actions, not REST endpoints. Each action file follows a consistent pattern:

### 7.1 Action Wrapper (`actions/safe-action.ts`)

```typescript
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function createSafeAction<T>(handler: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await handler();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return { success: false, error: message };
  }
}
```

Every action returns `ActionResult<T>` — a discriminated union that the client can check with `if (result.success)`.

### 7.2 Action Inventory

#### Clients (`actions/clients.ts`)
- **`createClientAction(prevState, formData)`** — Creates a Client + initial ClientUser. Validates: agency session, `client:create` permission, Zod schema. Returns `{ clientId, portalSlug }`.

#### Projects (`actions/projects.ts`)
- **`createProjectAction(prevState, formData)`** — Creates a Project. Validates: agency session, `project:write` permission, client belongs to agency. Returns `{ projectId, name }`.

#### Tasks (`actions/tasks.ts`)
- **`createTaskAction(prevState, formData)`** — Creates a Task with automatic position calculation (max position in column + 1).
- **`updateTaskStatusAction(taskId, status, position)`** — For drag-and-drop kanban. Updates status and position.
- **`updateTaskAction(prevState, formData)`** — Edit task details (title, description, priority, dueDate, assignee).
- **`deleteTaskAction(taskId)`** — Delete a task.

#### Briefs (`actions/briefs.ts`)
- **`saveBriefAction(prevState, formData)`** — Creates or updates a brief (upsert pattern). Content is TipTap JSON. Accepts `generatedByAi` flag.
- **`sendBriefAction(briefId)`** — Marks brief status as SENT (client-visible).

#### Deliverables (`actions/deliverables.ts`)
- **`createDeliverableAction(prevState, formData)`** — Creates a deliverable record (fileUrl initially empty, filled after Supabase upload).
- **`requestApprovalAction(deliverableId)`** — Sets status to PENDING_REVIEW, notifies client.
- **`approveClientDeliverableAction(input)`** — Called from client portal. Sets status to APPROVED, records approver, notifies agency.
- **`requestClientChangesAction(input)`** — Called from client portal. Sets status to REJECTED, creates a comment with the reason, notifies agency.
- **`deleteDeliverableAction(deliverableId)`** — Delete a deliverable.

#### Comments (`actions/comments.ts`)
- **`createCommentAction(prevState, formData)`** — Agency posts a comment. If not internal, notifies client.
- **`createClientCommentAction(input)`** — Client posts a comment. Notifies agency.

#### Notifications (`actions/notifications.ts`)
- **`createNotification(input)`** — Core function called by all other actions. Creates DB records + publishes to Ably.
- **`getAgencyNotificationsForShell()`** — Fetches latest 20 notifications for the current agency user.
- **`getClientNotificationsForShell(clientSlug)`** — Fetches latest 20 notifications for a client user.
- **`getAgencyNotificationChannelForShell()`** — Returns the Ably channel name for the agency.
- **`getClientNotificationChannelForShell(clientSlug)`** — Returns the Ably channel name for the client.
- **`markNotificationReadAction(input)`** — Marks a single notification as read.
- **`markAllNotificationsReadAction(target, clientSlug?)`** — Marks all notifications read for agency or client.

### 7.3 Authorization Pattern in Actions

Every action follows this pattern:
```
1. auth() → check session
2. Check agencyId exists on session
3. checkPermission(userId, requiredPermission)
4. Zod parse formData
5. Verify ownership (e.g., project belongs to agency, client belongs to agency)
6. Execute Prisma operation
7. revalidatePath() for affected routes
8. Optionally createNotification() for downstream effects
```

---

## 8. API Routes

### 8.1 Auth (`app/api/auth/[...nextauth]/route.ts`)
Re-exports Auth.js handlers. Handles all OAuth callbacks, magic link verification, session management.

### 8.2 AI Brief Generation (`app/api/ai/generate-brief/route.ts`)
- **Method:** POST
- **Rate Limit:** 5 requests per minute
- **Input:** `{ projectName, clientName, goals, audience, tone, keyMessages }`
- **Output:** Server-Sent Events (SSE) stream of GPT-4o generated markdown
- **System Prompt:** Positions AI as a senior creative strategist. Sections: Background, Objectives, Target Audience, Key Messages, Tone & Voice, Deliverables, Timeline.

### 8.3 AI Project Summary (`app/api/ai/summarize-project/route.ts`)
- **Method:** POST
- **Rate Limit:** 10 requests per minute
- **Input:** `{ projectName, clientName, status, tasksCompleted, tasksTotal, pendingApprovals, lastActivity }`
- **Output:** JSON `{ summary: string }`
- **Fallback:** Returns a generic summary on OpenAI failure (never errors to client)

### 8.4 Health Check (`app/api/health/route.ts`)
- **Method:** GET
- **Output:** `{ status: "ok", timestamp, uptime }`
- **Dynamic:** Force-dynamic (never cached)

---

## 9. Real-Time Infrastructure (Ably)

### 9.1 Server-Side (`lib/ably.ts`)

Uses Ably REST client (not Realtime) for publishing from server actions:
```typescript
const restClient = new Ably.Rest({
  key: ABLY_API_KEY,
  clientId: "portalos-server"
});
```

**Channel naming convention:**
- `project:{projectId}` — project-level events (comments)
- `agency:{agencyId}:activity` — agency activity feed
- `agency:{agencyId}:notifications` — agency notification feed
- `client:{clientIdOrSlug}:notifications` — client notification feed

### 9.2 Client-Side (`hooks/use-ably.ts`)

Uses Ably Realtime client for subscribing from browser:
```typescript
const ably = new Ably.Realtime({
  key: NEXT_PUBLIC_ABLY_KEY,
  clientId: `portalos-${randomId}`
});
```

The hook:
1. Connects to Ably on mount
2. Subscribes to the specified channel + event
3. Uses a ref for the handler to avoid re-subscription on handler changes
4. Cleans up (unsubscribe, close connection) on unmount

**Usage in components:**
```typescript
// In NotificationPanel
useAblyChannel(channelName, "notification.created", (message) => {
  const notification = message.data;
  setNotifications((current) => [notification, ...current].slice(0, 30));
});

// In CommentsView
useAblyChannel(channelName, "comment.created", (message) => {
  setComments((prev) => [message.data, ...prev]);
});
```

### 9.3 Graceful Degradation
If Ably credentials are missing (local dev without Ably key), the publish function silently catches errors. Real-time is treated as an enhancement, not a requirement. The database is always the source of truth.

---

## 10. Email Infrastructure (Resend)

### 10.1 Client (`lib/resend.ts`)
Singleton Resend client initialized with `RESEND_API_KEY`. Default from address: `PortalOS <hello@portalos.app>`.

### 10.2 Email Templates (`emails/`)

All templates use `@react-email/components` for consistent rendering across email clients.

#### Comment Notification (`emails/comment-notification.tsx`)
- **Trigger:** When a comment is posted
- **Recipient:** Project stakeholders
- **Content:** Commenter name, project name, comment body (in quote box), CTA button to view project
- **Design:** Off-white background (#FDFAF7), serif headings, styled quote box

#### Deliverable Approved (`emails/deliverable-approved.tsx`)
- **Trigger:** When a client approves a deliverable
- **Recipient:** Agency team
- **Content:** Client name, deliverable title, project name, confirmation message, CTA button

#### Team Invitation (`emails/team-invitation.tsx`)
- **Trigger:** When an agency admin invites a team member
- **Recipient:** New team member
- **Content:** Inviter name, agency name, role, CTA button to accept invitation

### 10.3 Magic Link (Auth.js Resend Provider)
Auth.js handles magic link emails internally via the Resend provider. The from address is configured in `lib/auth.ts`.

---

## 11. Rate Limiting & Security

### 11.1 In-Memory Rate Limiter (`lib/rate-limit.ts`)

Map-based rate limiter. Per-IP per-route counters with configurable windows.

**Pre-configured limits:**
| Route | Window | Max Requests |
|-------|--------|-------------|
| MAGIC_LINK | 15 min | 3 |
| SIGNIN | 15 min | 10 |
| REGISTER | 15 min | 5 |
| CONTACT | 1 hour | 3 |
| CLIENT_INVITE | 1 hour | 10 |

**Maintenance:** Expired entries are pruned every 60 seconds via `setInterval`.

**Production Note:** In-memory rate limiting only works for single-instance deployments. The code has a comment directing to replace with Upstash Redis for multi-instance.

### 11.2 API Rate Limiter (`lib/api-rate-limit.ts`)

Higher-level wrapper that extracts client IP and returns `NextResponse` 429 on limit exceeded. Includes `Retry-After` and `X-RateLimit-Remaining` headers.

**API-specific limits:**
| Route | Window | Max Requests |
|-------|--------|-------------|
| AI_GENERATE | 1 min | 5 |
| AI_SUMMARIZE | 1 min | 10 |
| CONTACT | 1 hour | 3 |

### 11.3 Input Sanitization (`lib/sanitize.ts`)

Five sanitization functions for defense-in-depth (Prisma parameterizes all queries, so SQL injection is not a concern, but XSS and input normalization are):

| Function | Purpose |
|----------|---------|
| `sanitizeHtml(value)` | Strip HTML tags, encode `<>&"'/` as entities |
| `sanitizeText(value, maxLength?)` | Trim, normalize whitespace, strip control chars |
| `sanitizeEmail(email)` | RFC 5322 simplified validation, lowercase, 254 char max |
| `sanitizeSlug(value, maxLength?)` | Alphanumeric + hyphens/underscores/dots only |
| `sanitizeInt(value, fallback?)` | Safe non-negative integer with fallback |

### 11.4 CSP Headers (`next.config.ts`)

Content Security Policy is configured in `next.config.ts`:
- **default-src:** `'self'`
- **script-src:** `'self'`, `'unsafe-eval'` (needed for Next.js dev), `'unsafe-inline'`
- **style-src:** `'self'`, `'unsafe-inline'`
- **font-src:** `'self'`, `fonts.gstatic.com`
- **connect-src:** `'self'`, Resend API, Stripe, Supabase, Ably
- **frame-ancestors:** `'none'` (prevents clickjacking)
- **HSTS:** max-age=63072000; includeSubDomains; preload
- **X-Frame-Options:** DENY
- **X-Content-Type-Options:** nosniff

### 11.5 Environment Validation (`lib/env.ts`)

Zod v4 schema validates all required environment variables at startup:
- **Required:** DATABASE_URL, RESEND_API_KEY, RESEND_FROM_EMAIL, AUTH_SECRET (min 32 chars), STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL/ANON_KEY
- **Optional validated:** OPENAI_API_KEY, ABLY_API_KEY, POSTHOG_HOST/KEY, CALENDLY_URL
- **Dev bypass:** Relaxed validation (all fields optional) when `NODE_ENV=development` and `DEV_BYPASS_AUTH=true`

### 11.6 Production Auth Guard (`middleware.ts`)

Critical security measure: `isDevBypass()` returns `false` in production, regardless of `DEV_BYPASS_AUTH` env var:
```typescript
function isDevBypass(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.DEV_BYPASS_AUTH === "true";
}
```

This is duplicated in `lib/dev-bypass.ts` to prevent any possible bypass of authentication in production.

---

## 12. Dev Bypass Mode

### 12.1 Purpose
Allows development without a PostgreSQL database, Auth.js configuration, or any external service. Activated by setting `DEV_BYPASS_AUTH=true` in `.env.local` (development only).

### 12.2 Mock Data (`lib/dev-bypass.ts`)

The file provides complete mock data for every entity:

| Function | Returns |
|----------|---------|
| `getDevSession()` | Fake session for "Sarah Kim" (OWNER of Lumina Studio) |
| `getDevProject(id)` | Full project with 5 tasks, 1 brief, 3 deliverables, 4 comments |
| `getDevPortalAgency()` | Lumina Creative agency info |
| `getDevPortalClient(slug)` | Client by slug (northstar-brand, forge-studio) |
| `getDevPortalProjects()` | 2 projects with progress percentages |
| `getDevPortalActivity()` | 4 activity events |
| `getDevAgencyNotifications()` | 2 agency notifications |
| `getDevClientNotifications()` | 1 client notification |

### 12.3 Bypass Behavior
- Middleware: `/login` → redirects to `/app/dashboard`, `/portal` → redirects to `/demo/client`
- Server Components: Use mock data instead of Prisma queries
- Server Actions: Skip database writes, return mock success responses, still publish Ably notifications if configured
- Auth: Session is faked — no actual Auth.js flow needed

### 12.4 How Pages Use Bypass

Every data-fetching page follows this pattern:
```typescript
if (isDevBypass()) {
  // Return mock data directly
  return <Component data={getDevMockData()} />;
}

// Real auth + database logic
const session = await auth();
// ... Prisma queries ...
```

This means the entire application is functional in dev mode without any infrastructure.

---

## 13. Complete Route Map

### 13.1 Marketing Routes `(marketing)` — Public

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/(marketing)/page.tsx` | Landing page — hero, features, testimonials, pricing, FAQ, CTA |
| `/demo/agency` | `app/(marketing)/demo/agency/page.tsx` | Agency showroom — dashboard mockup with stats, projects, approvals, team |
| `/demo/client` | `app/(marketing)/demo/client/page.tsx` | Client portal showroom — branded portal mockup with projects, approvals, activity |
| `/legal/privacy` | `app/(marketing)/legal/privacy/page.tsx` | Privacy policy |
| `/legal/terms` | `app/(marketing)/legal/terms/page.tsx` | Terms of service |

### 13.2 Auth Routes `(auth)` — Semi-Public

| Route | File | Purpose |
|-------|------|---------|
| `/login` | `app/(auth)/login/page.tsx` | Sign-in page — magic link email form, Google OAuth button, hairline input design |
| `/onboarding` | `app/(auth)/onboarding/page.tsx` | 5-step wizard: Agency info → Branding (logo + color picker) → Team invite → Client setup → Done |

### 13.3 Agency Routes `(agency)` — Tier 2 (Authenticated)

All under `/app/*`. Protected by middleware session check.

| Route | File | Purpose |
|-------|------|---------|
| `/app/dashboard` | `app/(agency)/app/dashboard/page.tsx` | Agency command center — stats, delivery runway, approval queue, activity feed |
| `/app/clients` | `app/(agency)/app/clients/page.tsx` | Client list |
| `/app/clients/new` | `app/(agency)/app/clients/new/page.tsx` | Create client form |
| `/app/projects` | `app/(agency)/app/projects/page.tsx` | Project list |
| `/app/projects/new` | `app/(agency)/app/projects/new/page.tsx` | Create project form |
| `/app/projects/[projectId]` | `app/(agency)/app/projects/[projectId]/page.tsx` | Project workspace — kanban board, brief editor, deliverables, comments (4 tabs) |
| `/app/invoices` | `app/(agency)/app/invoices/page.tsx` | Invoices list (Stripe integration) |
| `/app/settings` | `app/(agency)/app/settings/page.tsx` | Agency settings |
| `/app/settings/team` | `app/(agency)/app/settings/team/page.tsx` | Team management |
| `/app/settings/branding` | `app/(agency)/app/settings/branding/page.tsx` | Branding settings (logo, color, font) |

### 13.4 Client Routes `(client)` — Tier 3 (Magic Link)

All under `/portal/[clientSlug]/*`.

| Route | File | Purpose |
|-------|------|---------|
| `/portal/[clientSlug]/login` | `app/(client)/portal/[clientSlug]/login/page.tsx` | Client magic link login |
| `/portal/[clientSlug]` | `app/(client)/portal/[clientSlug]/page.tsx` | Client portal home — welcome, project list with progress, activity feed |
| `/portal/[clientSlug]/projects/[projectId]` | `app/(client)/portal/[clientSlug]/projects/[projectId]/page.tsx` | Client project view — brief (if sent), deliverables for review, non-internal comments |

### 13.5 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | Auth.js handler |
| `/api/ai/generate-brief` | POST | AI brief generation (streaming) |
| `/api/ai/summarize-project` | POST | AI project summary |
| `/api/health` | GET | Health check |

---

## 14. Component Architecture

### 14.1 Component Inventory

#### Agency Components (`components/agency/`)
| Component | Type | Purpose |
|-----------|------|---------|
| `agency-shell.tsx` | Client | Persistent layout for all `/app/*` — sidebar, header, nav |
| `kanban-board.tsx` | Client | Drag-and-drop kanban via `@dnd-kit/core` |
| `kanban-column.tsx` | Client | Single kanban column (TODO, IN_PROGRESS, IN_REVIEW, DONE) |
| `task-card.tsx` | Client | Draggable task card with priority colors, due date, assignee |
| `task-dialog.tsx` | Client | Create/edit task modal dialog |
| `brief-editor.tsx` | Client | TipTap rich text editor for creative briefs |
| `ai-brief-modal.tsx` | Client | Modal for AI brief generation (goals, audience, tone inputs) |
| `deliverables-view.tsx` | Client | File list with upload, approval request, status badges |
| `comments-view.tsx` | Client | Threaded comments with internal toggle, reactions |
| `project-workspace-tabs.tsx` | Client | 4-tab project workspace (Board, Brief, Deliverables, Comments) |
| `project-create-form.tsx` | Client | New project form with client selector, status, due date |
| `client-create-form.tsx` | Client | New client form with company, contact, portal slug |
| `count-up-number.tsx` | Client | Animated number counter for dashboard stats |
| `settings-shell.tsx` | Client | Layout for settings sub-pages |

#### Client Components (`components/client/`)
| Component | Type | Purpose |
|-----------|------|---------|
| `portal-shell.tsx` | Client | Persistent layout for `/portal/[slug]/*` — white-label header, nav, footer |
| `project-view.tsx` | Client | Client-facing project page — brief, deliverables, comments |
| `approval-modal.tsx` | Client | Client approval/rejection modal for deliverables |
| `comment-input.tsx` | Client | Comment input for client portal |

#### Shared Components (`components/shared/`)
| Component | Type | Purpose |
|-----------|------|---------|
| `notification-panel.tsx` | Client | Slide-out notification panel with Ably real-time subscription |
| `app-providers.tsx` | Client | Root providers wrapper — SmoothScroll, Reveal, Toaster (sonner) |
| `smooth-scroll-provider.tsx` | Client | Lenis smooth scroll wrapper |

#### Marketing Components (`components/marketing/`)
| Component | Type | Purpose |
|-----------|------|---------|
| `landing-hero.tsx` | Client | Hero section with headline, description, CTAs, scroll indicator |
| `floating-panels-scene.tsx` | Client | 3D floating panels scene (Three.js) |
| `floating-panels-scene-loader.tsx` | Client | Dynamic import loader for the 3D scene |

#### UI Primitives (`components/ui/`)
Standard shadcn/ui primitives customized for the Obsidian design system: `button.tsx`, `badge.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `tooltip.tsx`.

### 14.2 Client/Server Component Split

**Server Components (default):**
- All page files (`page.tsx`) — data fetching, rendering
- Layout files — structural wrapping

**Client Components (`"use client"`):**
- All interactive UI (modals, forms, drag-and-drop)
- Real-time subscriptions (Ably hooks)
- Shell components (navigation, routing awareness via `usePathname`)
- Notification panel
- Animation components (count-up, reveal, floating panels)

### 14.3 Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAblyChannel` | `hooks/use-ably.ts` | Subscribe to Ably real-time channel |
| `useReveal` | `hooks/use-reveal.ts` | Intersection Observer for scroll-triggered CSS animations |

---

## 15. Design System Token Reference

### 15.1 Color Tokens (`app/globals.css`)

**Foundation (Obsidian Blacks):**
```
--bg-void: #000000          (page background)
--bg-base: #0A0A0A          (cards, surfaces)
--bg-surface: #0F0F0E       (slightly elevated)
--bg-elevated: #131312      (modals, dropdowns)
--bg-sunken: #080808        (inputs, inset areas)
```

**Gold (Aged Brass — NOT bright yellow):**
```
--gold-core: #8C7340        (primary accent)
--gold-mid: #A6884A         (hover state)
--gold-bright: #B89B5C      (emphasis)
--gold-muted: #6B5530       (subtle/de-emphasized)
--gold-dim: rgba(140,115,64,0.08)  (tinted backgrounds)
```

**Ink (Warm Cream Whites):**
```
--ink-primary: #FAF8F2      (headlines, primary text)
--ink-secondary: #E8E4D8    (body text)
--ink-tertiary: #888272     (captions, secondary info)
```

**Borders (Hairlines):**
```
--border-hairline: #1A1A19  (subtle dividers)
--border-subtle: #242422    (card borders)
--border-default: #2A2A28   (standard borders)
--border-visible: #3D3D39   (active/focus borders)
--border-gold: rgba(140,115,64,0.45)
--border-gold-dim: rgba(140,115,64,0.20)
```

**Functional:**
```
--sig-red: #B85A3C          (errors — burnt sienna, not bright red)
--sig-green: #4A8A6F        (success — forest green)
--forest-active: #2A5A45    (active states)
```

### 15.2 Typography Tokens

```css
--font-display-family: 'Italiana', serif;
--font-body-family: 'Cormorant Garamond', serif;
--font-mono-family: 'JetBrains Mono', monospace;
--font-eyebrow-family: 'Inter', sans-serif;
```

**Type Scale:**
- Display: `clamp(4.5rem, 12vw, 11rem)` (hero), `clamp(3rem, 8vw, 7rem)` (section openers)
- Headings: `clamp(2.25rem, 5vw, 4rem)` to `1.5rem`
- Body: `1.25rem` (lead), `1.0625rem` (base), `0.9375rem` (sm), `0.8125rem` (xs)
- Eyebrow: `0.6875rem`, uppercase, `letter-spacing: 0.18em`

### 15.3 Key Utility Classes
- `.lux-panel` — Card surface with hairline borders, subtle shadow, background
- `.lux-meta` — Eyebrow label style (font-eyebrow, gold-muted, uppercase tracked)
- `.lux-amount` — Large stat number (font-mono, gold, tight tracking)
- `.lux-grid` — Subtle background grid pattern
- `.lux-divider` — Hairline divider
- `.section-label` — Section eyebrow with gold accent line
- `.font-eyebrow` — Inter 500, 0.6875rem, 0.18em tracking, uppercase

### 15.4 Design Principles
1. **Gold restraint:** Gold must never cover more than 5% of any viewport. Prefer outlines over filled gold buttons.
2. **Serif body:** Cormorant Garamond for all body text — this is the single biggest departure from generic SaaS templates.
3. **Hairlines, not borders:** All dividers are 1px `--border-hairline`. Never thicker.
4. **No text-shadows, no drop-shadows on text.**
5. **Background:** True black (#000000) with subtle film grain via `body::after` pseudo-element with SVG `feTurbulence`.
6. **Motion:** Staggered word reveals (CSS animation-delay cascade), subtle parallax, 1px gold underline on button hover.

---

## 16. Infrastructure Dependencies

| Service | Purpose | Client Library | Config |
|---------|---------|---------------|--------|
| **Vercel** | Hosting, edge middleware | — | `next.config.ts` |
| **PostgreSQL** | Primary database | `@prisma/adapter-pg` | `DATABASE_URL` |
| **Auth.js v5** | Authentication | `next-auth@beta` | Google OAuth, Resend provider |
| **Ably** | Real-time pub/sub | `ably` (REST + Realtime) | `ABLY_API_KEY`, `NEXT_PUBLIC_ABLY_KEY` |
| **Resend** | Transactional email | `resend` | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| **Supabase** | File storage (S3) | `@supabase/supabase-js` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **OpenAI** | AI brief generation | `openai` | `OPENAI_API_KEY` |
| **Stripe** | Payments | (integrated, config read) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **PostHog** | Product analytics | `posthog-js` | `POSTHOG_KEY`, `POSTHOG_HOST` |
| **Google Fonts** | Typography | `next/font/google` | Italiana, Cormorant Garamond, Inter, JetBrains Mono |

### 16.1 Singleton Client Pattern

All infrastructure clients follow a lazy-initialization singleton pattern:
```typescript
let client: ServiceClient | null = null;

export function getServiceClient(): ServiceClient {
  if (!client) {
    client = new ServiceClient(requireEnv("SERVICE_API_KEY"));
  }
  return client;
}
```

This pattern is used for: Ably REST, Resend, OpenAI, Supabase. It ensures:
- One connection per server instance (no connection leaks)
- Lazy initialization (only created when needed)
- Environment validation at initialization time

---

## 17. Deployment & Environment Variables

### 17.1 Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=<at-least-32-characters>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=PortalOS <hello@portalos.app>

# Storage
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Real-time
ABLY_API_KEY=...
NEXT_PUBLIC_ABLY_KEY=...
```

### 17.2 Optional Environment Variables

```bash
OPENAI_API_KEY=sk-...
POSTHOG_KEY=phc_...
POSTHOG_HOST=https://app.posthog.com
CALENDLY_URL=https://calendly.com/...
SUPABASE_STORAGE_URL=https://...  # Custom CDN URL
VELOCITY_AI_INBOX=...             # Partner integration
DEMO_MODE=true                    # Enable demo mode
DEV_BYPASS_AUTH=true              # ONLY in development
```

### 17.3 Build & Startup

- **Build:** `npm run build` (Next.js build, ~16.7s on this codebase)
- **Start:** `npm start` (Next.js production server)
- **Dev:** `npm run dev` (Next.js dev server with turbopack)
- **Prisma:** `npx prisma generate`, `npx prisma db push`, `npx prisma studio`

### 17.4 Known Considerations for Production Launch

1. **Rate Limiting:** In-memory only — must migrate to Upstash Redis for multi-instance deployments.
2. **Client Authentication:** The magic link flow for ClientUser is partially implemented. `app/(client)/portal/[clientSlug]/login/page.tsx` and the Resend magic link for clients need to be wired together.
3. **File Uploads:** Deliverable creation creates the DB record first, then Supabase upload happens client-side. The `fileUrl` field is initially empty. A webhook or callback pattern is needed to update the URL after upload.
4. **Stripe Integration:** The Stripe SDK is initialized but the checkout flow and webhook handling are not yet implemented in the current codebase.
5. **Onboarding:** The 5-step onboarding wizard is a UI prototype. It uses client-side state only — no server actions are called. On step 5, it does `router.push("/app/dashboard")` with a simulated 900ms delay.
6. **Demo Reset:** The `DemoResetLog` model exists for periodic demo data cleanup, but the actual cron job/endpoint to perform resets is not implemented.
7. **CSP:** `'unsafe-eval'` and `'unsafe-inline'` are currently allowed in script-src. For production hardening, these should be removed and a nonce-based approach implemented.

---

## Appendix A: File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `actions/` | 8 | Server Actions (RPC layer) |
| `app/` | 30+ | Route pages across 4 route groups |
| `components/agency/` | 14 | Agency dashboard components |
| `components/client/` | 4 | Client portal components |
| `components/marketing/` | 3 | Marketing page components |
| `components/shared/` | 3 | Cross-cutting components |
| `components/ui/` | 7+ | shadcn/ui primitives |
| `emails/` | 3 | React Email templates |
| `hooks/` | 2 | Custom React hooks |
| `lib/` | 15 | Infrastructure, auth, utilities |
| `prisma/` | 1 | Database schema (18 models, 10 enums) |

**Total: ~90 source files**

## Appendix B: Key Architectural Decisions

1. **Server Components as default, Client Components only for interactivity.** This keeps the bundle small and data fetching close to the data source.
2. **Server Actions instead of REST endpoints.** This eliminates the need for a separate API layer. The `ActionResult<T>` wrapper provides a consistent error-handling contract.
3. **Dev bypass as a first-class feature.** Every data-fetching component has an `isDevBypass()` branch. This means the entire application is functional without any infrastructure — critical for rapid prototyping and demo purposes.
4. **Dual user models (User + ClientUser).** Agency team members use Auth.js accounts. Client portal users are a separate model with magic-link auth. This cleanly separates the two authentication domains.
5. **Internal vs. client-facing content.** The `isInternal` flag on comments and the `audience` field on notifications provide a single codebase serving both tiers with appropriate visibility controls.
6. **White-label via CSS custom properties.** The client portal is themed by injecting the agency's brand color as CSS variables at runtime. No build-time theming needed.
7. **Real-time as enhancement, not requirement.** Ably publishing fails silently if credentials are missing. The database is always the source of truth.
