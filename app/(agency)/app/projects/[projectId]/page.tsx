import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDevBypass, getDevProject } from "@/lib/dev-bypass";
import { ProjectWorkspaceTabs } from "@/components/agency/project-workspace-tabs";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

const projectInclude = {
  client: {
    select: { id: true, companyName: true, logoUrl: true }
  },
  tasks: {
    orderBy: [{ priority: "asc" as const }, { position: "asc" as const }],
    include: {
      assignee: {
        select: { id: true, name: true, image: true }
      }
    }
  },
  brief: {
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      generatedByAi: true
    }
  },
  deliverables: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      title: true,
      description: true,
      fileName: true,
      fileSize: true,
      fileType: true,
      version: true,
      status: true,
      createdAt: true,
      uploadedBy: {
        select: { id: true, name: true }
      }
    }
  },
  comments: {
    orderBy: { createdAt: "desc" as const },
    take: 50,
    select: {
      id: true,
      body: true,
      isInternal: true,
      createdAt: true,
      authorUser: { select: { id: true, name: true, image: true } },
      authorClientUser: { select: { id: true, name: true } }
    }
  },
  createdBy: {
    select: { id: true, name: true, image: true }
  }
} satisfies Prisma.ProjectInclude;

type ProjectWithIncludes = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  if (isDevBypass()) {
    const devProject = getDevProject(projectId);
    return (
      <ProjectWorkspaceTabs
        project={{
          id: devProject.id,
          name: devProject.name,
          description: devProject.description,
          status: devProject.status,
          dueDate: devProject.dueDate.toISOString(),
          client: {
            id: devProject.client.id,
            companyName: devProject.client.companyName,
            logoUrl: devProject.client.logoUrl
          },
          deliverables: devProject.deliverables.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            fileName: d.fileName,
            fileSize: d.fileSize,
            fileType: d.fileType,
            version: d.version,
            status: d.status,
            uploadedBy: { id: d.uploadedBy.id, name: d.uploadedBy.name },
            createdAt: d.createdAt.toISOString()
          })),
          comments: devProject.comments.map((c) => ({
            id: c.id,
            body: c.body,
            isInternal: c.isInternal,
            createdAt: c.createdAt.toISOString(),
            authorUser: c.authorUser
              ? { id: c.authorUser.id, name: c.authorUser.name, image: c.authorUser.image }
              : null,
            authorClientUser: c.authorClientUser
              ? { id: c.authorClientUser.id, name: c.authorClientUser.name, image: null }
              : null
          })),
          tasks: devProject.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
            dueDate: t.dueDate?.toISOString() ?? null,
            assignee: t.assignee
              ? { id: t.assignee.id, name: t.assignee.name, image: t.assignee.image }
              : null,
            _count: { comments: 4 }
          })),
          brief: devProject.brief
            ? {
                id: devProject.brief.id,
                title: devProject.brief.title,
                content: devProject.brief.content as Record<string, unknown>,
                status: devProject.brief.status,
                generatedByAi: devProject.brief.generatedByAi
              }
            : null,
          createdBy: {
            id: devProject.createdBy.id,
            name: devProject.createdBy.name,
            image: devProject.createdBy.image
          }
        }}
      />
    );
  }

  const session = await auth();

  if (!session?.user?.id || !session.user.agencyId) {
    redirect("/login");
  }

  let project: ProjectWithIncludes | null = null;
  let totalComments = 0;

  try {
    project = (await prisma.project.findFirst({
      where: { id: projectId, agencyId: session.user.agencyId },
      include: projectInclude
    })) as ProjectWithIncludes | null;

    if (!project) {
      notFound();
    }

    const commentCounts = await prisma.comment.groupBy({
      by: ["projectId"],
      where: { projectId: project.id },
      _count: { id: true }
    });

    totalComments = commentCounts[0]?._count.id ?? 0;
  } catch {
    return (
      <ProjectWorkspaceTabs
        project={{
          id: projectId,
          name: "Project unavailable",
          description: "The database is currently unreachable. Please check your DATABASE_URL configuration.",
          status: "DRAFT",
          dueDate: null,
          client: { id: "", companyName: "Unavailable", logoUrl: null },
          deliverables: [],
          comments: [],
          tasks: [],
          brief: null,
          createdBy: { id: "", name: "", image: null }
        }}
      />
    );
  }

  return (
    <ProjectWorkspaceTabs
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        dueDate: project.dueDate?.toISOString() ?? null,
        client: {
          id: project.client.id,
          companyName: project.client.companyName,
          logoUrl: project.client.logoUrl
        },
        deliverables: project.deliverables.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          fileName: d.fileName,
          fileSize: d.fileSize,
          fileType: d.fileType,
          version: d.version,
          status: d.status,
          uploadedBy: { id: d.uploadedBy.id, name: d.uploadedBy.name },
          createdAt: d.createdAt.toISOString()
        })),
        comments: project.comments.map((c) => ({
          id: c.id,
          body: c.body,
          isInternal: c.isInternal,
          createdAt: c.createdAt.toISOString(),
          authorUser: c.authorUser
            ? { id: c.authorUser.id, name: c.authorUser.name, image: c.authorUser.image }
            : null,
          authorClientUser: c.authorClientUser
            ? { id: c.authorClientUser.id, name: c.authorClientUser.name, image: null }
            : null
        })),
        tasks: project.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          dueDate: t.dueDate?.toISOString() ?? null,
          assignee: t.assignee
            ? { id: t.assignee.id, name: t.assignee.name, image: t.assignee.image }
            : null,
          _count: { comments: totalComments }
        })),
        brief: project.brief
          ? {
              id: project.brief.id,
              title: project.brief.title,
              content: project.brief.content as Record<string, unknown>,
              status: project.brief.status,
              generatedByAi: project.brief.generatedByAi
            }
          : null,
        createdBy: {
          id: project.createdBy.id,
          name: project.createdBy.name,
          image: project.createdBy.image
        }
      }}
    />
  );
}
