import { Check, GlobeSimple, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const presetColors = [
  "#D4607A",
  "#C9981A",
  "#1E1208",
  "#5C4F42",
  "#8C6510",
  "#9C3350",
  "#D4AF37",
  "#C9A84C"
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
            <div className="flex size-20 items-center justify-center rounded-[10px] border border-dashed border-[var(--border-default)] bg-[var(--bg-sunken)]">
              <UploadSimple aria-hidden="true" className="size-6 text-[var(--ink-tertiary)]" />
            </div>
            <div>
              <Button variant="secondary">Upload logo</Button>
              <p className="mt-2 text-[12px] text-[var(--ink-tertiary)]">
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
                className="size-10 rounded-[10px] border-2 border-transparent transition-[border-color,box-shadow,transform] duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--border-gold)]"
                key={color}
                style={{
                  backgroundColor: color,
                  borderColor: color === "#D4607A" ? "var(--ink-primary)" : "transparent",
                  outline: color === "#D4607A" ? "2px solid var(--ink-primary)" : "none",
                  outlineOffset: "2px"
                }}
                type="button"
              >
                {color === "#D4607A" && (
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
              defaultValue="#D4607A"
              id="brand-color-custom"
              maxLength={7}
              placeholder="#D4AF37"
            />
          </div>

          <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-5">
            <p className="lux-meta">Preview</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="rounded-[8px] px-4 py-2 text-[14px] font-medium text-[#0A0A0B]"
                style={{ backgroundColor: "#D4607A" }}
              >
                Branded button
              </div>
              <div
                className="rounded-[8px] px-4 py-2 text-[14px] font-medium"
                style={{ color: "#D4607A", backgroundColor: "rgba(212,96,122,0.08)" }}
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
            Your client portal will be accessible at your own domain instead of portalos.app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <GlobeSimple aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
            <Input className="max-w-sm" placeholder="portal.your-agency.com" />
            <Button variant="secondary">Verify</Button>
          </div>
          <p className="mt-3 text-[12px] text-[var(--ink-tertiary)]">
            You will need to add a CNAME record pointing to custom.portalos.app. Full instructions appear after verification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
