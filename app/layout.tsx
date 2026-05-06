import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/shared/app-providers";
import { validateEnv } from "@/lib/env";
import { initDomainLayer } from "@/lib/domain/init";
import "./globals.css";

// Validate required environment variables at server startup.
// Throws on first request if a required var is missing in production.
// In dev with DEV_BYPASS_AUTH only minimal vars are checked.
validateEnv();

// Initialize the Domain-Driven Design layer: register cross-context
// event handlers (e.g., notification subscribers, activity feed writers).
// Safe to call multiple times -- runs only once.
initDomainLayer();

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-family",
  display: "swap",
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono-family",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portalos.tech"),
  title: {
    default: "PortalOS — Client operations for refined agencies",
    template: "%s | PortalOS"
  },
  description:
    "A white-label client operations portal for creative agencies that need calm approvals, projects, briefs, files, and client collaboration in one place.",
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: "PortalOS — Client operations for refined agencies",
    description:
      "A white-label client operations portal for creative agencies that need calm approvals, projects, briefs, files, and client collaboration in one place.",
    url: "https://portalos.tech",
    siteName: "PortalOS",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF6F0"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmsans.variable} ${jetbrains.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
