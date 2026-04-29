import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PermissionAction =
  | "client:create"
  | "client:manage"
  | "project:write"
  | "team:manage";

const rolePermissions: Record<UserRole, PermissionAction[]> = {
  OWNER: ["client:create", "client:manage", "project:write", "team:manage"],
  ADMIN: ["client:create", "client:manage", "project:write", "team:manage"],
  MEMBER: ["project:write"]
};

export async function checkPermission(userId: string, action: PermissionAction): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) {
    return false;
  }

  return rolePermissions[user.role].includes(action);
}
