import type { Session } from "next-auth";

export function isDevBypass(): boolean {
  return process.env.DEV_BYPASS_AUTH === "true";
}

export function getDevSession(): Session {
  return {
    user: {
      id: "dev-user-001",
      name: "Sarah Kim",
      email: "sarah@portalos.app",
      image: null,
      role: "OWNER",
      agencyId: "dev-agency-001",
      agencySlug: "lumina-studio",
      agencyName: "Lumina Studio",
      agencyBrandColor: "#D4607A",
      demoLocked: false
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

export function getDevProject(projectId: string) {
  return {
    id: projectId,
    name: "Brand Identity Refresh",
    description: "Complete brand identity redesign including logo, typography system, color palette, and brand guidelines document for Northstar's upcoming Series B launch.",
    status: "ACTIVE",
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    client: {
      id: "dev-client-001",
      companyName: "Northstar Branding",
      logoUrl: null
    },
    tasks: [
      {
        id: "dev-task-001",
        title: "Moodboard exploration",
        description: "Gather visual references across editorial, architecture, and fashion for the brand direction.",
        status: "DONE" as const,
        priority: "HIGH" as const,
        dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        position: 0,
        projectId: projectId,
        assigneeId: "dev-user-001",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        assignee: { id: "dev-user-001", name: "Sarah Kim", image: null }
      },
      {
        id: "dev-task-002",
        title: "Logo concept sketches",
        description: "Develop 3–5 initial logo directions for internal review.",
        status: "IN_REVIEW" as const,
        priority: "URGENT" as const,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        position: 1,
        projectId: projectId,
        assigneeId: "dev-user-001",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        assignee: { id: "dev-user-001", name: "Sarah Kim", image: null }
      },
      {
        id: "dev-task-003",
        title: "Typography system",
        description: "Define heading and body type scales, pair display + UI fonts.",
        status: "IN_PROGRESS" as const,
        priority: "MEDIUM" as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        position: 2,
        projectId: projectId,
        assigneeId: "dev-user-001",
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignee: { id: "dev-user-001", name: "Sarah Kim", image: null }
      },
      {
        id: "dev-task-004",
        title: "Color palette finalization",
        description: "Lock primary, secondary, and accent colors with accessibility ratios.",
        status: "TODO" as const,
        priority: "HIGH" as const,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        position: 3,
        projectId: projectId,
        assigneeId: "dev-user-001",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        assignee: { id: "dev-user-001", name: "Sarah Kim", image: null }
      },
      {
        id: "dev-task-005",
        title: "Brand guidelines document",
        description: "Compile final PDF with usage rules, dos/donts, and asset inventory.",
        status: "TODO" as const,
        priority: "LOW" as const,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        position: 4,
        projectId: projectId,
        assigneeId: "dev-user-001",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        assignee: { id: "dev-user-001", name: "Sarah Kim", image: null }
      }
    ],
    brief: {
      id: "dev-brief-001",
      title: "Northstar Brand Identity Brief",
      content: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Project Overview" }] },
          { type: "paragraph", content: [{ type: "text", text: "Northstar Branding is preparing for their Series B and needs a complete brand identity refresh that signals maturity, ambition, and creative confidence to investors and enterprise clients alike." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Goals" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Modernize the visual identity while retaining equity in the existing wordmark recognition" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Establish a systematic design language that scales across web, print, and motion" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Deliver comprehensive brand guidelines for internal and partner use" }] }] }
          ]},
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Target Audience" }] },
          { type: "paragraph", content: [{ type: "text", text: "Enterprise technology buyers (VP Eng, CTO), venture capital partners, design-forward B2B clients, and internal Northstar team members." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Tone & Direction" }] },
          { type: "paragraph", content: [{ type: "text", text: "Editorial meets architectural. Warm precision. Confident but not loud. Think Monocle magazine meets Dieter Rams — systematic, humane, timeless." }] }
        ]
      },
      status: "DRAFT",
      generatedByAi: true
    },
    deliverables: [
      {
        id: "dev-del-001",
        title: "Identity Presentation v2",
        description: "Updated deck with refined logo directions and typography system proposal.",
        fileName: "identity-presentation-v2.pdf",
        fileSize: 4200000,
        fileType: "application/pdf",
        version: 2,
        status: "PENDING_REVIEW",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        uploadedBy: { id: "dev-user-001", name: "Sarah Kim" }
      },
      {
        id: "dev-del-002",
        title: "Moodboard Collection",
        description: "Curated visual references across 5 categories.",
        fileName: "northstar-moodboards.fig",
        fileSize: 8400000,
        fileType: "application/octet-stream",
        version: 1,
        status: "APPROVED",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        uploadedBy: { id: "dev-user-001", name: "Sarah Kim" }
      },
      {
        id: "dev-del-003",
        title: "Color Palette Exploration",
        description: "Three palette directions with accessibility annotations.",
        fileName: "color-palettes.pdf",
        fileSize: 2100000,
        fileType: "application/pdf",
        version: 1,
        status: "DRAFT",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        uploadedBy: { id: "dev-user-001", name: "Sarah Kim" }
      }
    ],
    comments: [
      {
        id: "dev-com-001",
        body: "Loving the editorial direction on these moodboards. Can we push the architectural references even more?",
        isInternal: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        authorUser: null,
        authorClientUser: { id: "dev-client-user-001", name: "Iris Calloway" }
      },
      {
        id: "dev-com-002",
        body: "Iris — great note. I'll pull more references from SANAA and Tadao Ando for the next round.",
        isInternal: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        authorUser: { id: "dev-user-001", name: "Sarah Kim", image: null },
        authorClientUser: null
      },
      {
        id: "dev-com-003",
        body: "Heads up — the logo sketches need another pass before client review. Let's huddle tomorrow AM.",
        isInternal: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        authorUser: { id: "dev-user-001", name: "Sarah Kim", image: null },
        authorClientUser: null
      },
      {
        id: "dev-com-004",
        body: "Is the presentation deck ready for the Thursday call? Want to make sure we're aligned on the typography system.",
        isInternal: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        authorUser: null,
        authorClientUser: { id: "dev-client-user-001", name: "Iris Calloway" }
      }
    ],
    createdBy: {
      id: "dev-user-001",
      name: "Sarah Kim",
      image: null
    }
  };
}

export function getDevPortalAgency() {
  return {
    id: "dev-agency-001",
    name: "Lumina Creative",
    slug: "northstar-brand",
    brandColor: "#D4AF37",
    logoUrl: null
  };
}

export function getDevPortalClient(clientSlug: string) {
  const clients: Record<string, { id: string; companyName: string; contactName: string; contactEmail: string; portalSlug: string; status: string; welcomeMessage: string }> = {
    "northstar-brand": {
      id: "dev-client-001",
      companyName: "Northstar Brand",
      contactName: "Iris Calloway",
      contactEmail: "iris@northstar-branding.com",
      portalSlug: "northstar-brand",
      status: "ACTIVE",
      welcomeMessage: "Welcome to your dedicated project hub. Here you'll find everything we're working on together — from early concepts to final deliverables."
    },
    "northstar-branding": {
      id: "dev-client-001",
      companyName: "Northstar Brand",
      contactName: "Iris Calloway",
      contactEmail: "iris@northstar-branding.com",
      portalSlug: "northstar-brand",
      status: "ACTIVE",
      welcomeMessage: "Welcome to your dedicated project hub. Here you'll find everything we're working on together — from early concepts to final deliverables."
    },
    "forge-studio": {
      id: "dev-client-002",
      companyName: "Forge Studio",
      contactName: "Theo Watanabe",
      contactEmail: "theo@forge-studio.com",
      portalSlug: "forge-studio",
      status: "ACTIVE",
      welcomeMessage: "Your creative command center. Track progress, review work, and stay aligned on every project."
    }
  };

  return clients[clientSlug] ?? null;
}

export function getDevPortalProjects() {
  return [
    {
      id: "dev-proj-001",
      name: "Brand Identity Refresh",
      description: "Complete brand identity redesign including logo, typography, color palette, and brand guidelines.",
      status: "ACTIVE",
      dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      progress: 58,
      pendingItems: 2,
      lastUpdate: "2 hours ago"
    },
    {
      id: "dev-proj-002",
      name: "Website Copy",
      description: "Full website copy refresh for the Series B launch.",
      status: "IN_REVIEW",
      dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      progress: 38,
      pendingItems: 1,
      lastUpdate: "1 day ago"
    }
  ];
}

export function getDevPortalActivity() {
  return [
    {
      actor: "Sarah Kim",
      action: "uploaded a new version of the identity presentation",
      time: "2 hours ago",
      initials: "SK"
    },
    {
      actor: "You",
      action: "approved the moodboard collection",
      time: "1 day ago",
      initials: "IC"
    },
    {
      actor: "Marcus Reed",
      action: "shared a new delivery note",
      time: "3 days ago",
      initials: "MR"
    },
    {
      actor: "Sarah Kim",
      action: "posted a new comment on brand identity",
      time: "4 days ago",
      initials: "SK"
    }
  ];
}

export type DevNotification = {
  id: string;
  type: "COMMENT" | "APPROVAL" | "MENTION" | "TASK_ASSIGNED" | "DELIVERABLE_UPLOADED";
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export function getDevAgencyNotifications(): DevNotification[] {
  return [
    {
      id: "dev-agency-notification-001",
      type: "APPROVAL",
      title: "Identity deck approved",
      body: "Iris approved the latest identity presentation.",
      link: "/app/projects/dev-proj-001",
      read: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
    },
    {
      id: "dev-agency-notification-002",
      type: "COMMENT",
      title: "New client comment",
      body: "Northstar asked about the typography system.",
      link: "/app/projects/dev-proj-001",
      read: false,
      createdAt: new Date(Date.now() - 64 * 60 * 1000).toISOString()
    }
  ];
}

export function getDevClientNotifications(): DevNotification[] {
  return [
    {
      id: "dev-client-notification-001",
      type: "DELIVERABLE_UPLOADED",
      title: "New file ready",
      body: "Identity Presentation v2 is waiting for review.",
      link: "/portal/northstar-brand/projects/dev-proj-001",
      read: false,
      createdAt: new Date(Date.now() - 26 * 60 * 1000).toISOString()
    }
  ];
}
