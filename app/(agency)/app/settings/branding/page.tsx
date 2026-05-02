import { Check, GlobeSimple, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const presetColors = [
  "#B48232",
  "#C9963C",
  "#E0A842",
  "#1E1B15",
  "#5C5544",
  "#7A5520",
  "#F0C870",
  "#8A826E"
];

export default function BrandingSettingsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Agency logo</CardTitle>
          <CardDescription>
            Your logo appears in the client portal header and emails. Use a PNG or SVG with a transparent background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex size-20 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-sunken)]">
              <UploadSimple aria-hidden="true" className="size-6 text-[var(--ink-tertiary)]" />
            </div>
            <div>
              <Button variant="secondary">Upload logo</Button>
              <p className="mt-2 text-[0.75rem] text-[var(--ink-tertiary)]">
                Recommended: 200x60px SVG or PNG with transparent background.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand color</CardTitle>
          <CardDescription>
            Applied across the client portal, buttons, links, and email accents. Pick a color that matches your agency identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {presetColors.map((color) => (
              <button
                className="size-10 rounded-[var(--radius-lg)] border-2 border-transparent transition-[border-color,box-shadow,transform] duration-[var(--t-base)] ease-[var(--ease-out)] hover:scale-105 focus:outline-none"
                key={color}
                style={{
                  backgroundColor: color,
                  borderColor: color === "#B48232" ? "var(--ink-primary)" : "transparent",
                  outline: color === "#B48232" ? "2px solid var(--ink-primary)" : "none",
                  outlineOffset: "2px"
                }}
                type="button"
              >
                {color === "#B48232" && (
                  <Check aria-hidden="true" className="mx-auto size-4 text-[var(--ink-primary)] drop-shadow-sm" weight="bold" />
                )}
                <span className="sr-only">{color}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Label htmlFor="brand-color-custom">Custom hex</Label>
            <Input
              className="w-32"
              defaultValue="#B48232"
              id="brand-color-custom"
              maxLength={7}
              placeholder="#D4AF37"
            />
          </div>

          <div className="surface-panel bg-[var(--bg-sunken)] border-[var(--border-subtle)] p-5">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Preview</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="rounded-[var(--radius-md)] px-4 py-2 text-[0.875rem] font-sans font-medium text-[var(--bg-void)]"
                style={{ backgroundColor: "#B48232" }}
              >
                Branded button
              </div>
              <div
                className="rounded-[var(--radius-md)] px-4 py-2 text-[0.875rem] font-sans font-medium"
                style={{ color: "var(--gold-core)", backgroundColor: "var(--gold-dim)" }}
              >
                Branded link
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom domain</CardTitle>
          <CardDescription>
            Your client portal will be accessible at your own domain instead of portalos.tech.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <GlobeSimple aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
            <Input className="max-w-sm" placeholder="portal.your-agency.com" />
            <Button variant="secondary">Verify</Button>
          </div>
          <p className="mt-3 text-[0.75rem] text-[var(--ink-tertiary)]">
            You will need to add a CNAME record pointing to custom.portalos.tech. Full instructions appear after verification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
