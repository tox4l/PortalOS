import { prisma } from "@/lib/db";

const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024 * 1024; // 50 GB

export async function getAgencyStorageUsage(agencyId: string): Promise<number> {
  const result = await prisma.deliverable.aggregate({
    where: { project: { agencyId } },
    _sum: { fileSize: true },
  });
  return result._sum.fileSize ?? 0;
}

export function getStorageLimitBytes(): number {
  return STORAGE_LIMIT_BYTES;
}

export async function checkStorageQuota(
  agencyId: string,
  incomingFileSize: number
): Promise<{ allowed: boolean; usedBytes: number; limitBytes: number; reason?: string }> {
  const used = await getAgencyStorageUsage(agencyId);
  const limit = getStorageLimitBytes();

  if (used + incomingFileSize > limit) {
    return {
      allowed: false,
      usedBytes: used,
      limitBytes: limit,
      reason: `Storage limit exceeded. You've used ${formatBytes(used)} of ${formatBytes(limit)}. This file (${formatBytes(incomingFileSize)}) would put you over the limit.`,
    };
  }

  return { allowed: true, usedBytes: used, limitBytes: limit };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
