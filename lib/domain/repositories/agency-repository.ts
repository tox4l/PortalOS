/**
 * Agency Repository interface (Anti-Corruption Layer).
 *
 * Defines the contract that any context consuming Agency data must use.
 * The Agency context owns this interface and its implementation.
 * Other contexts depend on the interface, not on Prisma models directly.
 */

export interface AgencyPlanInfo {
  id: string;
  plan: string;
  slug: string;
  name: string;
  brandColor: string | null;
  teamMemberCount: number;
  activeClientCount: number;
}

export interface AgencyLookupResult {
  id: string;
  exists: boolean;
}

export interface SlugAvailability {
  available: boolean;
  conflictType: "self" | "other" | "none";
}

export interface IAgencyRepository {
  findById(agencyId: string): Promise<AgencyPlanInfo | null>;
  findPlanInfo(agencyId: string): Promise<AgencyPlanInfo | null>;
  checkSlugAvailability(slug: string, ownedByAgencyId?: string): Promise<SlugAvailability>;
  incrementClientCount(agencyId: string): Promise<void>;
}
