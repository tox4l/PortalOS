/**
 * Client Repository interface (Anti-Corruption Layer).
 *
 * Defines the contract for Project and other contexts to query Client data
 * without direct Prisma access.
 */

export interface ClientLookupResult {
  id: string;
  agencyId: string;
  companyName: string;
  portalSlug: string;
}

export interface IClientRepository {
  findById(clientId: string): Promise<ClientLookupResult | null>;
  findBySlug(portalSlug: string): Promise<ClientLookupResult | null>;
  verifyClientOwnership(clientId: string, agencyId: string): Promise<boolean>;
}
