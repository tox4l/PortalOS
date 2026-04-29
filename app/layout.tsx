import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/shared/app-providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display-family"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-family"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono-family"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portalos.app"),
  title: {
    default: "PortalOS - Client operations for refined agencies",
    template: "%s | PortalOS"
  },
  description:
    "A white-label client operations portal for creative agencies that need calm approvals, projects, briefs, files, and client collaboration in one place.",
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: "PortalOS - Client operations for refined agencies",
    description:
      "A white-label client operations portal for creative agencies that need calm approvals, projects, briefs, files, and client collaboration in one place.",
    url: "https://portalos.app",
    siteName: "PortalOS",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0B"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
