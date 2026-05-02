import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PermissionAction =
  | "client:create"
  | "client:manage"
  | "project:write"
  | "team:manage"
  | "team:invite"
  | "team:remove"
  | "team:change-role"
  | "client:invite-user"
  | "plan:view";

const rolePermissions: Record<UserRole, PermissionAction[]> = {
  OWNER: [
    "client:create",
    "client:manage",
    "project:write",
    "team:manage",
    "team:invite",
    "team:remove",
    "team:change-role",
    "client:invite-user",
    "plan:view",
  ],
  ADMIN: [
    "client:create",
    "client:manage",
    "project:write",
    "team:manage",
    "team:invite",
    "team:remove",
    "client:invite-user",
  ],
  MEMBER: ["project:write"],
};

export async function checkPermission(
  userId: string,
  action: PermissionAction
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return false;

  return rolePermissions[user.role].includes(action);
}
