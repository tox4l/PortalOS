import Link from "next/link";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientLoginPage() {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="text-center">
          <Link
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center font-display text-2xl">
              Client sign-in
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and we will send you a magic link to access your portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-email">Email address</Label>
                <Input
                  id="client-email"
                  placeholder="iris@northstar-branding.com"
                  type="email"
                />
              </div>
              <Button className="w-full">
                <EnvelopeSimple aria-hidden="true" className="size-4" />
                Send magic link
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[12px] text-[var(--ink-tertiary)]">
          Powered by PortalOS / A secure client portal for your agency projects
        </p>
      </div>
    </div>
  );
}
