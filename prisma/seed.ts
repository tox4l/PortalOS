import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const baseDate = new Date("2026-04-28T12:00:00.000Z");

function daysFromBase(days: number): Date {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function svgWordmark(name: string, accent: string): string {
  const escapedName = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="72" viewBox="0 0 240 72"><rect width="240" height="72" rx="14" fill="%23FDFAF7"/><circle cx="36" cy="36" r="14" fill="${accent.replace("#", "%23")}"/><text x="60" y="43" font-family="DM Sans, Arial, sans-serif" font-size="22" fill="%231A1410">${escapedName}</text></svg>`;
}

function briefContent(title: string, paragraphs: string[]): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: title }]
      },
      ...paragraphs.map((paragraph) => ({
        type: "paragraph",
        content: [{ type: "text", text: paragraph }]
      }))
    ]
  };
}

async function resetDatabase() {
  await prisma.activityEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.brief.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientUser.deleteMany();
  await prisma.client.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.demoResetLog.deleteMany();
}

async function seedApexCreative() {
  const agency = await prisma.agency.create({
    data: {
      name: "Apex Creative",
      slug: "apex-creative",
      logoUrl: svgWordmark("Apex Creative", "#D4607A"),
      brandColor: "#D4607A",
      brandFont: "Cormorant Garamond",
      demoMode: true
    }
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@apexcreative.example",
      name: "Mina Takahashi",
      role: "OWNER",
      agencyId: agency.id,
      emailVerified: daysFromBase(-30),
      lastSeenAt: daysFromBase(0)
    }
  });

  const member = await prisma.user.create({
    data: {
      email: "studio@apexcreative.example",
      name: "Elliot Vale",
      role: "MEMBER",
      agencyId: agency.id,
      emailVerified: daysFromBase(-28),
      lastSeenAt: daysFromBase(-1)
    }
  });

  const koiClient = await prisma.client.create({
    data: {
      companyName: "Koi House",
      contactName: "Ren Mori",
      contactEmail: "ren@koihouse.example",
      logoUrl: svgWordmark("Koi House", "#C9981A"),
      portalSlug: "koi-house",
      welcomeMessage: "A quiet home for every launch detail, approval, and file.",
      status: "ACTIVE",
      agencyId: agency.id
    }
  });

  const atlasClient = await prisma.client.create({
    data: {
      companyName: "Atlas Atelier",
      contactName: "Camille Laurent",
      contactEmail: "camille@atlasatelier.example",
      logoUrl: svgWordmark("Atlas Atelier", "#D4607A"),
      portalSlug: "atlas-atelier",
      welcomeMessage: "Your campaign work is organized here with every note in context.",
      status: "ACTIVE",
      agencyId: agency.id
    }
  });

  const koiContact = await prisma.clientUser.create({
    data: {
      email: "ren@koihouse.example",
      name: "Ren Mori",
      agencyId: agency.id,
      clientId: koiClient.id,
      lastLoginAt: daysFromBase(-2)
    }
  });

  const atlasContact = await prisma.clientUser.create({
    data: {
      email: "camille@atlasatelier.example",
      name: "Camille Laurent",
      agencyId: agency.id,
      clientId: atlasClient.id,
      lastLoginAt: daysFromBase(-4)
    }
  });

  const launchProject = await prisma.project.create({
    data: {
      name: "Tea Ceremony Launch",
      description: "A product launch system for Koi House's spring tea collection.",
      status: "ACTIVE",
      dueDate: daysFromBase(18),
      coverImageUrl: "https://picsum.photos/seed/koi-tea/1200/800",
      agencyId: agency.id,
      clientId: koiClient.id,
      createdById: owner.id
    }
  });

  const atelierProject = await prisma.project.create({
    data: {
      name: "Editorial Lookbook",
      description: "Seasonal lookbook, landing assets, and approval workflow.",
      status: "IN_REVIEW",
      dueDate: daysFromBase(9),
      coverImageUrl: "https://picsum.photos/seed/atlas-lookbook/1200/800",
      agencyId: agency.id,
      clientId: atlasClient.id,
      createdById: owner.id
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Finalize launch narrative",
        description: "Tighten the story around origin, craft, and service ritual.",
        status: "DONE",
        priority: "HIGH",
        dueDate: daysFromBase(-2),
        position: 1,
        projectId: launchProject.id,
        assigneeId: owner.id
      },
      {
        title: "Prepare tasting notes page",
        description: "Convert approved copy into the web page wireframe.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: daysFromBase(4),
        position: 2,
        projectId: launchProject.id,
        assigneeId: member.id
      },
      {
        title: "Upload packaging renders",
        description: "Add final carton and tea tin renders for review.",
        status: "IN_REVIEW",
        priority: "URGENT",
        dueDate: daysFromBase(1),
        position: 3,
        projectId: launchProject.id,
        assigneeId: member.id
      },
      {
        title: "Retouch cover spread",
        description: "Adjust contrast and crop for the main lookbook spread.",
        status: "IN_REVIEW",
        priority: "HIGH",
        dueDate: daysFromBase(3),
        position: 1,
        projectId: atelierProject.id,
        assigneeId: owner.id
      },
      {
        title: "Prepare print production handoff",
        description: "Gather final production notes and hold before client confirmation.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: daysFromBase(7),
        position: 2,
        projectId: atelierProject.id,
        assigneeId: null
      }
    ]
  });

  const launchDeliverable = await prisma.deliverable.create({
    data: {
      title: "Packaging Render Set",
      description: "Final render set for the spring tea tins and carton sleeves.",
      fileUrl: "supabase://deliverables/apex/koi/packaging-renders.zip",
      fileName: "packaging-renders-v2.zip",
      fileSize: 48_120_000,
      fileType: "application/zip",
      version: 2,
      status: "PENDING_REVIEW",
      projectId: launchProject.id,
      uploadedById: member.id
    }
  });

  const lookbookDeliverable = await prisma.deliverable.create({
    data: {
      title: "Lookbook Cover Spread",
      description: "Cover and opening spread in PDF review format.",
      fileUrl: "supabase://deliverables/apex/atlas/lookbook-cover.pdf",
      fileName: "lookbook-cover-spread.pdf",
      fileSize: 12_450_000,
      fileType: "application/pdf",
      version: 1,
      status: "APPROVED",
      projectId: atelierProject.id,
      uploadedById: owner.id,
      approvedById: atlasContact.id,
      approvedAt: daysFromBase(-1)
    }
  });

  await prisma.brief.create({
    data: {
      title: "Spring tea launch brief",
      content: briefContent("Spring tea launch brief", [
        "Koi House needs a launch system that feels quiet, precise, and ceremonial without becoming inaccessible.",
        "The work should make the collection feel collected and giftable: calm page structure, tactile packaging renders, and copy that explains flavor without over-describing it."
      ]),
      status: "DRAFT",
      generatedByAi: false,
      projectId: launchProject.id
    }
  });

  await prisma.comment.create({
    data: {
      body: "The carton angle is approved. Please keep the sleeve shadow soft; the current version feels closest to the physical sample.",
      projectId: launchProject.id,
      deliverableId: launchDeliverable.id,
      authorClientUserId: koiContact.id,
      isInternal: false
    }
  });

  await prisma.comment.create({
    data: {
      body: "Cover spread approved for production. The quieter crop solved the page tension.",
      projectId: atelierProject.id,
      deliverableId: lookbookDeliverable.id,
      authorClientUserId: atlasContact.id,
      isInternal: false
    }
  });

  await prisma.activityEvent.createMany({
    data: [
      {
        type: "DELIVERABLE_UPLOADED",
        title: "Packaging renders uploaded",
        body: "Elliot uploaded packaging-renders-v2.zip for Koi House.",
        link: `/app/projects/${launchProject.id}`,
        agencyId: agency.id,
        clientId: koiClient.id,
        projectId: launchProject.id,
        actorUserId: member.id,
        createdAt: daysFromBase(-1)
      },
      {
        type: "APPROVAL_GIVEN",
        title: "Lookbook cover approved",
        body: "Camille approved the opening spread.",
        link: `/app/projects/${atelierProject.id}`,
        agencyId: agency.id,
        clientId: atlasClient.id,
        projectId: atelierProject.id,
        actorClientUserId: atlasContact.id,
        createdAt: daysFromBase(-1)
      }
    ]
  });
}

async function seedLuminaDemo() {
  const agency = await prisma.agency.create({
    data: {
      name: "Lumina Creative",
      slug: "lumina",
      logoUrl: svgWordmark("Lumina Creative", "#C9981A"),
      brandColor: "#C9981A",
      brandFont: "Cormorant Garamond",
      demoMode: true
    }
  });

  const sarah = await prisma.user.create({
    data: {
      email: "demo@velocityai.com",
      name: "Sarah Kim",
      role: "OWNER",
      agencyId: agency.id,
      emailVerified: daysFromBase(-60),
      lastSeenAt: daysFromBase(0),
      demoLocked: true
    }
  });

  const marcus = await prisma.user.create({
    data: {
      email: "marcus@lumina-demo.com",
      name: "Marcus Reed",
      role: "ADMIN",
      agencyId: agency.id,
      emailVerified: daysFromBase(-54),
      lastSeenAt: daysFromBase(-1),
      demoLocked: true
    }
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya@lumina-demo.com",
      name: "Priya Nair",
      role: "MEMBER",
      agencyId: agency.id,
      emailVerified: daysFromBase(-51),
      lastSeenAt: daysFromBase(0),
      demoLocked: true
    }
  });

  const northstar = await prisma.client.create({
    data: {
      companyName: "Northstar Branding",
      contactName: "Iris Calloway",
      contactEmail: "client@lumina-demo.com",
      logoUrl: svgWordmark("Northstar Branding", "#C9981A"),
      portalSlug: "northstar-brand",
      welcomeMessage: "Welcome back. Your brand refresh work is gathered here with every decision, file, and comment in context.",
      status: "ACTIVE",
      agencyId: agency.id
    }
  });

  const forge = await prisma.client.create({
    data: {
      companyName: "Forge Studio",
      contactName: "Theo Watanabe",
      contactEmail: "theo@forge-demo.com",
      logoUrl: svgWordmark("Forge Studio", "#D4607A"),
      portalSlug: "forge-studio",
      welcomeMessage: "Campaign work, approvals, and delivery notes live here for the Q4 rollout.",
      status: "ACTIVE",
      agencyId: agency.id
    }
  });

  const vessel = await prisma.client.create({
    data: {
      companyName: "Vessel Co.",
      contactName: "Marin Sol",
      contactEmail: "marin@vessel-demo.com",
      logoUrl: svgWordmark("Vessel Co.", "#9C3350"),
      portalSlug: "vessel-co",
      welcomeMessage: "An archived room for completed packaging and launch assets.",
      status: "ARCHIVED",
      agencyId: agency.id
    }
  });

  const northstarUser = await prisma.clientUser.create({
    data: {
      email: "client@lumina-demo.com",
      name: "Iris Calloway",
      clientId: northstar.id,
      agencyId: agency.id,
      lastLoginAt: daysFromBase(0),
      demoLocked: true
    }
  });

  await prisma.clientUser.create({
    data: {
      email: "theo@forge-demo.com",
      name: "Theo Watanabe",
      clientId: forge.id,
      agencyId: agency.id,
      lastLoginAt: daysFromBase(-2),
      demoLocked: true
    }
  });

  const vesselUser = await prisma.clientUser.create({
    data: {
      email: "marin@vessel-demo.com",
      name: "Marin Sol",
      clientId: vessel.id,
      agencyId: agency.id,
      lastLoginAt: daysFromBase(-24),
      demoLocked: true
    }
  });

  const brandRefresh = await prisma.project.create({
    data: {
      name: "Brand Identity Refresh",
      description: "A full identity system for Northstar's move from local consultancy to national brand advisory.",
      status: "IN_REVIEW",
      dueDate: daysFromBase(11),
      coverImageUrl: "https://picsum.photos/seed/northstar-identity/1200/800",
      agencyId: agency.id,
      clientId: northstar.id,
      createdById: sarah.id
    }
  });

  const websiteCopy = await prisma.project.create({
    data: {
      name: "Website Copy",
      description: "Positioning, homepage copy, service pages, and launch-ready microcopy.",
      status: "ACTIVE",
      dueDate: daysFromBase(22),
      coverImageUrl: "https://picsum.photos/seed/northstar-copy/1200/800",
      agencyId: agency.id,
      clientId: northstar.id,
      createdById: marcus.id
    }
  });

  const q4Campaign = await prisma.project.create({
    data: {
      name: "Q4 Campaign",
      description: "A measured campaign system for Forge Studio's end-of-year product push.",
      status: "ACTIVE",
      dueDate: daysFromBase(16),
      coverImageUrl: "https://picsum.photos/seed/forge-q4/1200/800",
      agencyId: agency.id,
      clientId: forge.id,
      createdById: sarah.id
    }
  });

  const vesselLaunch = await prisma.project.create({
    data: {
      name: "Retail Packaging Launch",
      description: "Completed packaging and approval history for Vessel Co.",
      status: "COMPLETE",
      dueDate: daysFromBase(-18),
      coverImageUrl: "https://picsum.photos/seed/vessel-packaging/1200/800",
      agencyId: agency.id,
      clientId: vessel.id,
      createdById: priya.id
    }
  });

  await prisma.task.createMany({
    data: [
      { title: "Audit current brand assets", description: "Collect marks, typography, and sales materials.", status: "DONE", priority: "MEDIUM", dueDate: daysFromBase(-10), position: 1, projectId: brandRefresh.id, assigneeId: priya.id },
      { title: "Present strategy directions", description: "Share two strategic routes with client notes.", status: "DONE", priority: "HIGH", dueDate: daysFromBase(-7), position: 2, projectId: brandRefresh.id, assigneeId: sarah.id },
      { title: "Refine wordmark spacing", description: "Adjust optical spacing on N and r pairings.", status: "IN_REVIEW", priority: "HIGH", dueDate: daysFromBase(1), position: 3, projectId: brandRefresh.id, assigneeId: priya.id },
      { title: "Prepare color usage guide", description: "Define accessible combinations and print notes.", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: daysFromBase(3), position: 4, projectId: brandRefresh.id, assigneeId: marcus.id },
      { title: "Export social avatar set", description: "Generate approved square and round-safe crops.", status: "TODO", priority: "LOW", dueDate: daysFromBase(5), position: 5, projectId: brandRefresh.id, assigneeId: priya.id },
      { title: "Client review of logo suite", description: "Gather notes on the primary and compact marks.", status: "IN_REVIEW", priority: "URGENT", dueDate: daysFromBase(2), position: 6, projectId: brandRefresh.id, assigneeId: sarah.id },
      { title: "Finalize typography pairing", description: "Lock display and UI type recommendations.", status: "DONE", priority: "MEDIUM", dueDate: daysFromBase(-3), position: 7, projectId: brandRefresh.id, assigneeId: marcus.id },
      { title: "Build presentation PDF", description: "Assemble the client-facing identity deck.", status: "IN_PROGRESS", priority: "HIGH", dueDate: daysFromBase(4), position: 8, projectId: brandRefresh.id, assigneeId: priya.id },
      { title: "Internal QA on brand rules", description: "Check edge cases before handoff.", status: "TODO", priority: "MEDIUM", dueDate: daysFromBase(7), position: 9, projectId: brandRefresh.id, assigneeId: marcus.id },
      { title: "Package source files", description: "Prepare editable files and exports.", status: "TODO", priority: "MEDIUM", dueDate: daysFromBase(9), position: 10, projectId: brandRefresh.id, assigneeId: priya.id },
      { title: "Send approval reminder", description: "Send a gentle reminder for the identity deck.", status: "TODO", priority: "LOW", dueDate: daysFromBase(6), position: 11, projectId: brandRefresh.id, assigneeId: sarah.id },
      { title: "Schedule final handoff", description: "Book the final handoff call with Northstar.", status: "TODO", priority: "LOW", dueDate: daysFromBase(10), position: 12, projectId: brandRefresh.id, assigneeId: marcus.id },
      { title: "Draft homepage thesis", description: "Write the opening point of view and proof points.", status: "IN_PROGRESS", priority: "HIGH", dueDate: daysFromBase(3), position: 1, projectId: websiteCopy.id, assigneeId: marcus.id },
      { title: "Interview client services team", description: "Collect language used on sales calls.", status: "DONE", priority: "MEDIUM", dueDate: daysFromBase(-2), position: 2, projectId: websiteCopy.id, assigneeId: sarah.id },
      { title: "Outline services pages", description: "Map the advisory, research, and enablement pages.", status: "TODO", priority: "MEDIUM", dueDate: daysFromBase(8), position: 3, projectId: websiteCopy.id, assigneeId: marcus.id },
      { title: "Upload first copy deck", description: "Add deck for client review.", status: "IN_REVIEW", priority: "HIGH", dueDate: daysFromBase(6), position: 4, projectId: websiteCopy.id, assigneeId: marcus.id },
      { title: "Write CTA microcopy", description: "Draft forms, scheduling labels, and thank-you states.", status: "TODO", priority: "LOW", dueDate: daysFromBase(12), position: 5, projectId: websiteCopy.id, assigneeId: priya.id },
      { title: "Prepare SEO title set", description: "Create metadata for all launch pages.", status: "TODO", priority: "LOW", dueDate: daysFromBase(14), position: 6, projectId: websiteCopy.id, assigneeId: null },
      { title: "Define Q4 campaign offer", description: "Narrow the offer and proof hierarchy.", status: "DONE", priority: "HIGH", dueDate: daysFromBase(-5), position: 1, projectId: q4Campaign.id, assigneeId: sarah.id },
      { title: "Build media matrix", description: "Map campaign assets by channel and date.", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: daysFromBase(4), position: 2, projectId: q4Campaign.id, assigneeId: marcus.id },
      { title: "Upload ad concept board", description: "Share the first campaign board for approval.", status: "IN_REVIEW", priority: "HIGH", dueDate: daysFromBase(2), position: 3, projectId: q4Campaign.id, assigneeId: priya.id },
      { title: "Close Vessel archive", description: "Confirm final file pack remains accessible.", status: "DONE", priority: "LOW", dueDate: daysFromBase(-18), position: 1, projectId: vesselLaunch.id, assigneeId: priya.id }
    ]
  });

  await prisma.brief.create({
    data: {
      title: "Northstar brand identity refresh brief",
      content: briefContent("Northstar brand identity refresh brief", [
        "Northstar is moving from founder-led consultancy into a sharper advisory brand. The identity must retain trust and maturity while creating a more memorable presence in competitive RFPs.",
        "The refreshed system should feel precise, editorial, and commercially confident. It should avoid startup gloss and instead lean into disciplined typography, clear composition, and restrained color.",
        "Primary audiences are executive buyers, internal champions, and partner firms who need to understand Northstar's value within a few seconds and still find nuance in the deeper materials.",
        "Deliverables include a revised wordmark, compact mark, color system, typography guidance, social avatar set, and a presentation deck that explains usage without overwhelming the client team."
      ]),
      status: "SENT",
      generatedByAi: true,
      projectId: brandRefresh.id
    }
  });

  await prisma.brief.create({
    data: {
      title: "Website copy working brief",
      content: briefContent("Website copy working brief", [
        "The website copy should clarify Northstar's advisory model and give the sales team cleaner language for first calls.",
        "Keep the tone intelligent, direct, and slightly understated. Avoid broad claims and make the proof feel earned."
      ]),
      status: "DRAFT",
      generatedByAi: false,
      projectId: websiteCopy.id
    }
  });

  const approvedLogo = await prisma.deliverable.create({
    data: {
      title: "Primary Logo Suite",
      description: "Approved primary, compact, and monochrome marks.",
      fileUrl: "supabase://deliverables/lumina/northstar/logo-suite-v3.zip",
      fileName: "northstar-logo-suite-v3.zip",
      fileSize: 36_400_000,
      fileType: "application/zip",
      version: 3,
      status: "APPROVED",
      projectId: brandRefresh.id,
      uploadedById: priya.id,
      approvedById: northstarUser.id,
      approvedAt: daysFromBase(-2)
    }
  });

  const identityDeck = await prisma.deliverable.create({
    data: {
      title: "Identity Presentation Deck",
      description: "Client-facing system presentation for review.",
      fileUrl: "supabase://deliverables/lumina/northstar/identity-deck-v2.pdf",
      fileName: "identity-presentation-v2.pdf",
      fileSize: 18_800_000,
      fileType: "application/pdf",
      version: 2,
      status: "PENDING_REVIEW",
      projectId: brandRefresh.id,
      uploadedById: sarah.id
    }
  });

  const rejectedGuidelines = await prisma.deliverable.create({
    data: {
      title: "Usage Guidelines Draft",
      description: "First pass at the implementation guide.",
      fileUrl: "supabase://deliverables/lumina/northstar/guidelines-v1.pdf",
      fileName: "usage-guidelines-v1.pdf",
      fileSize: 9_720_000,
      fileType: "application/pdf",
      version: 1,
      status: "REJECTED",
      projectId: brandRefresh.id,
      uploadedById: marcus.id
    }
  });

  await prisma.deliverable.create({
    data: {
      title: "Website Copy Deck",
      description: "First review pass for homepage and service pages.",
      fileUrl: "supabase://deliverables/lumina/northstar/website-copy-v1.pdf",
      fileName: "website-copy-v1.pdf",
      fileSize: 4_630_000,
      fileType: "application/pdf",
      version: 1,
      status: "PENDING_REVIEW",
      projectId: websiteCopy.id,
      uploadedById: marcus.id
    }
  });

  const forgeBoard = await prisma.deliverable.create({
    data: {
      title: "Q4 Concept Board",
      description: "Campaign direction and sample ad frames.",
      fileUrl: "supabase://deliverables/lumina/forge/q4-concept-board.pdf",
      fileName: "q4-concept-board.pdf",
      fileSize: 14_280_000,
      fileType: "application/pdf",
      version: 1,
      status: "PENDING_REVIEW",
      projectId: q4Campaign.id,
      uploadedById: priya.id
    }
  });

  await prisma.deliverable.create({
    data: {
      title: "Vessel Final Packaging Files",
      description: "Approved and archived source package.",
      fileUrl: "supabase://deliverables/lumina/vessel/final-packaging.zip",
      fileName: "vessel-final-packaging.zip",
      fileSize: 82_900_000,
      fileType: "application/zip",
      version: 4,
      status: "APPROVED",
      projectId: vesselLaunch.id,
      uploadedById: priya.id,
      approvedById: vesselUser.id,
      approvedAt: daysFromBase(-22)
    }
  });

  const parentComment = await prisma.comment.create({
    data: {
      body: "The deck is strong. Could we make the color rationale less technical on slide 9?",
      projectId: brandRefresh.id,
      deliverableId: identityDeck.id,
      authorClientUserId: northstarUser.id,
      isInternal: false
    }
  });

  await prisma.comment.createMany({
    data: [
      { body: "Agreed. I will rewrite that section around use cases instead of color theory.", projectId: brandRefresh.id, deliverableId: identityDeck.id, authorUserId: sarah.id, parentId: parentComment.id, isInternal: false },
      { body: "The compact mark feels ready. Please keep the wider tracking in the primary wordmark.", projectId: brandRefresh.id, deliverableId: approvedLogo.id, authorClientUserId: northstarUser.id, isInternal: false },
      { body: "Internal note: keep the sales deck examples out of the public guideline PDF.", projectId: brandRefresh.id, authorUserId: marcus.id, isInternal: true },
      { body: "The usage guide needs clearer examples for partner co-branding. Requesting changes before approval.", projectId: brandRefresh.id, deliverableId: rejectedGuidelines.id, authorClientUserId: northstarUser.id, isInternal: false },
      { body: "I added a revised partner lockup section to the next pass.", projectId: brandRefresh.id, deliverableId: rejectedGuidelines.id, authorUserId: priya.id, isInternal: false },
      { body: "Homepage thesis is reading well. The advisory language is much clearer than our current site.", projectId: websiteCopy.id, authorClientUserId: northstarUser.id, isInternal: false },
      { body: "Forge likes the restraint in the first board. They asked for one bolder retail example.", projectId: q4Campaign.id, deliverableId: forgeBoard.id, authorUserId: marcus.id, isInternal: false },
      { body: "Archive confirmed. Vessel has the full final package.", projectId: vesselLaunch.id, authorClientUserId: vesselUser.id, isInternal: false }
    ]
  });

  await prisma.notification.createMany({
    data: [
      { type: "APPROVAL", title: "Identity deck awaiting review", body: "Northstar has one pending approval on the identity deck.", read: false, link: `/app/projects/${brandRefresh.id}`, userId: sarah.id, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id },
      { type: "COMMENT", title: "New client note", body: "Iris commented on slide 9 of the identity presentation.", read: false, link: `/app/projects/${brandRefresh.id}`, userId: sarah.id, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id },
      { type: "TASK_ASSIGNED", title: "Task assigned", body: "You were assigned to package source files.", read: false, link: `/app/projects/${brandRefresh.id}`, userId: priya.id, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id },
      { type: "DELIVERABLE_UPLOADED", title: "Forge board uploaded", body: "The Q4 concept board is ready for review.", read: false, link: `/app/projects/${q4Campaign.id}`, userId: sarah.id, agencyId: agency.id, clientId: forge.id, projectId: q4Campaign.id }
    ]
  });

  await prisma.activityEvent.createMany({
    data: [
      { type: "COMMENT_POSTED", title: "Iris commented on identity deck", body: "The client asked for less technical color rationale.", link: `/app/projects/${brandRefresh.id}`, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id, actorClientUserId: northstarUser.id, createdAt: daysFromBase(0) },
      { type: "DELIVERABLE_UPLOADED", title: "Identity deck uploaded", body: "Sarah uploaded identity-presentation-v2.pdf.", link: `/app/projects/${brandRefresh.id}`, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id, actorUserId: sarah.id, createdAt: daysFromBase(-1) },
      { type: "APPROVAL_GIVEN", title: "Logo suite approved", body: "Iris approved the primary logo suite.", link: `/app/projects/${brandRefresh.id}`, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id, actorClientUserId: northstarUser.id, createdAt: daysFromBase(-2) },
      { type: "TASK_MOVED", title: "Color guide moved to in progress", body: "Marcus moved the color usage guide forward.", link: `/app/projects/${brandRefresh.id}`, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id, actorUserId: marcus.id, createdAt: daysFromBase(-2) },
      { type: "COMMENT_POSTED", title: "Website copy note added", body: "Iris left feedback on the homepage thesis.", link: `/app/projects/${websiteCopy.id}`, agencyId: agency.id, clientId: northstar.id, projectId: websiteCopy.id, actorClientUserId: northstarUser.id, createdAt: daysFromBase(-3) },
      { type: "BRIEF_SENT", title: "AI brief sent", body: "The Northstar identity brief was sent for review.", link: `/app/projects/${brandRefresh.id}`, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id, actorUserId: sarah.id, createdAt: daysFromBase(-4) },
      { type: "DELIVERABLE_UPLOADED", title: "Q4 concept board uploaded", body: "Priya uploaded the first Forge campaign board.", link: `/app/projects/${q4Campaign.id}`, agencyId: agency.id, clientId: forge.id, projectId: q4Campaign.id, actorUserId: priya.id, createdAt: daysFromBase(-5) },
      { type: "COMMENT_POSTED", title: "Internal note added", body: "Marcus added a private note on sales deck examples.", link: `/app/projects/${brandRefresh.id}`, agencyId: agency.id, clientId: northstar.id, projectId: brandRefresh.id, actorUserId: marcus.id, createdAt: daysFromBase(-1) },
      { type: "APPROVAL_GIVEN", title: "Vessel archive approved", body: "Marin confirmed the final packaging archive.", link: `/app/projects/${vesselLaunch.id}`, agencyId: agency.id, clientId: vessel.id, projectId: vesselLaunch.id, actorClientUserId: vesselUser.id, createdAt: daysFromBase(-22) }
    ]
  });

  await prisma.demoResetLog.create({
    data: {
      resetAt: baseDate,
      recordsDeleted: 0
    }
  });
}

async function main() {
  await resetDatabase();
  await seedApexCreative();
  await seedLuminaDemo();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
