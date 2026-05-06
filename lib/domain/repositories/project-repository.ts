/**
 * Project Repository interface (Anti-Corruption Layer).
 *
 * Defines the contract for Task, Deliverable, Comment, and Brief contexts
 * to access Project ownership data without direct Prisma access.
 */

export interface ProjectLookupResult {
  id: string;
  agencyId: string;
  clientId: string | null;
  name: string;
  clientPortalSlug: string | null;
}

export interface IProjectRepository {
  findById(projectId: string): Promise<ProjectLookupResult | null>;
  verifyProjectOwnership(projectId: string, agencyId: string): Promise<boolean>;
  findProjectWithClientSlug(projectId: string, agencyId: string): Promise<ProjectLookupResult | null>;
}
