import { notFound } from "next/navigation";
import { isDevBypass, getDevPortalClient, getDevProject } from "@/lib/dev-bypass";
import { ClientProjectView } from "@/components/client/project-view";

type ClientProjectPageProps = {
  params: Promise<{ clientSlug: string; projectId: string }>;
};

export default async function ClientProjectPage({ params }: ClientProjectPageProps) {
  const { clientSlug, projectId } = await params;

  if (isDevBypass()) {
    const client = getDevPortalClient(clientSlug);
    if (!client) {
      notFound();
    }

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
                generatedByAi: devProject.brief.generatedByAi
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
            uploadedBy: { id: d.uploadedBy.id, name: d.uploadedBy.name }
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
                : null
            })),
        }}
      />
    );
  }

  notFound();
}
