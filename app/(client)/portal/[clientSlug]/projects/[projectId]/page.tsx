import { notFound } from "next/navigation";
import { isDevBypass, getDevPortalClient, getDevProject } from "@/lib/dev-bypass";
import { getClientSession } from "@/lib/client-sessions";
import { prisma } from "@/lib/db";
import { ClientProjectView } from "@/components/client/project-view";

type ClientProjectPageProps = {
  params: Promise<{ clientSlug: string; projectId: string }>;
};

export default async function ClientProjectPage({ params }: ClientProjectPageProps) {
  const { clientSlug, projectId } = await params;

  if (isDevBypass()) {
    const client = getDevPortalClient(clientSlug);
    if (!client) notFound();

    const devProject = getDevProject(projectId);

    return (
      <ClientProjectView
        clientSlug={clientSlug}
        project={{
          id: devProject.id,
          name: devProject.name,
          description: devProject.description,
          status: devProject.status,
          dueDate: devProject.dueDate.toISOString(),
          brief: devProject.brief
            ? {
                id: devProject.brief.id,
                title: devProject.brief.title,
                content: devProject.brief.content as Record<string, unknown>,
                status: devProject.brief.status,
                generatedByAi: devProject.brief.generatedByAi,
              }
            : null,
          deliverables: devProject.deliverables.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            fileName: d.fileName,
            fileSize: d.fileSize,
            fileType: d.fileType,
            version: d.version,
            status: d.status,
            createdAt: d.createdAt.toISOString(),
            uploadedBy: { id: d.uploadedBy.id, name: d.uploadedBy.name },
          })),
          comments: devProject.comments
            .filter((c) => !c.isInternal)
            .map((c) => ({
              id: c.id,
              body: c.body,
              isInternal: false,
              createdAt: c.createdAt.toISOString(),
              authorUser: c.authorUser
                ? { id: c.authorUser.id, name: c.authorUser.name, image: c.authorUser.image }
                : null,
              authorClientUser: c.authorClientUser
                ? { id: c.authorClientUser.id, name: c.authorClientUser.name }
                : null,
            })),
        }}
      />
    );
  }

  const session = await getClientSession();
  if (!session || session.clientSlug !== clientSlug) {
    notFound();
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      client: { portalSlug: clientSlug, agencyId: session.agencyId },
    },
    include: {
      brief: true,
      deliverables: {
        include: { uploadedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        where: { isInternal: false },
        include: {
          authorUser: { select: { id: true, name: true, image: true } },
          authorClientUser: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  return (
    <ClientProjectView
      clientSlug={clientSlug}
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        dueDate: project.dueDate?.toISOString() ?? "",
        brief: project.brief
          ? {
              id: project.brief.id,
              title: project.brief.title,
              content: project.brief.content as Record<string, unknown>,
              status: project.brief.status,
              generatedByAi: project.brief.generatedByAi,
            }
          : null,
        deliverables: project.deliverables.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          fileName: d.fileName,
          fileSize: d.fileSize,
          fileType: d.fileType,
          version: d.version,
          status: d.status,
          createdAt: d.createdAt.toISOString(),
          uploadedBy: { id: d.uploadedBy.id, name: d.uploadedBy.name },
        })),
        comments: project.comments.map((c) => ({
          id: c.id,
          body: c.body,
          isInternal: false,
          createdAt: c.createdAt.toISOString(),
          authorUser: c.authorUser
            ? { id: c.authorUser.id, name: c.authorUser.name, image: c.authorUser.image }
            : null,
          authorClientUser: c.authorClientUser
            ? { id: c.authorClientUser.id, name: c.authorClientUser.name }
            : null,
        })),
      }}
    />
  );
}
