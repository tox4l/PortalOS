import { DotsThree, EnvelopeSimple, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const teamMembers = [
  {
    name: "Sarah Kim",
    email: "sarah@lumina-creative.com",
    role: "Owner",
    initials: "SK",
    avatar: null,
  },
  {
    name: "Marcus Reed",
    email: "marcus@lumina-creative.com",
    role: "Admin",
    initials: "MR",
    avatar: null,
  },
  {
    name: "Priya Nair",
    email: "priya@lumina-creative.com",
    role: "Member",
    initials: "PN",
    avatar: null,
  },
];

const roleBadgeVariant: Record<string, "active" | "review" | "draft" | undefined> = {
  Owner: "active",
  Admin: "review",
  Member: "draft",
};

export default function TeamSettingsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Invite a team member</CardTitle>
          <CardDescription>
            Send an invitation via email. They&apos;ll receive a magic link to set up their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input id="invite-email" placeholder="colleague@agency.com" type="email" />
            </div>
            <div className="w-40 space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                defaultValue="MEMBER"
                id="invite-role"
                options={[
                  { value: "MEMBER", label: "Member" },
                  { value: "ADMIN", label: "Admin" }
                ]}
              />
            </div>
            <Button>
              <EnvelopeSimple aria-hidden="true" className="size-4" />
              Send invitation
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current team</CardTitle>
          <CardDescription>
            {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} in your agency.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-[var(--border-default)] p-0">
          {teamMembers.map((member) => (
            <div
              className="flex items-center justify-between gap-4 px-6 py-4"
              key={member.email}
            >
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-elevated)] text-[13px] font-medium">
                  {member.initials}
                </div>
                <div>
                  <p className="font-medium text-[var(--ink-primary)]">{member.name}</p>
                  <p className="text-[13px] text-[var(--ink-secondary)]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  <Badge variant={roleBadgeVariant[member.role] ?? "draft"}>
                    {member.role}
                  </Badge>
                </div>
                <Button aria-label={`More actions for ${member.name}`} size="icon" variant="ghost">
                  <DotsThree aria-hidden="true" className="size-4" weight="bold" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
