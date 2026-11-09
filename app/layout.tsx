import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { getTheme } from "@/lib/theme";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dolfvisuals.com";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "DOLF VISUALS — Photography, Videography & Creative Agency | Dar es Salaam",
    template: "%s | DOLF VISUALS",
  },
  description:
    "DOLF VISUALS is a photography, videography and creative media brand in Dar es Salaam, Tanzania — weddings, graduations, events, corporate and commercial content.",
  keywords: [
    "photographer Dar es Salaam", "videographer Tanzania", "wedding photography Tanzania", "graduation photography",
    "corporate photography Dar es Salaam", "product photography", "DOLF VISUALS", "mpiga picha Dar es Salaam",
  ],
  openGraph: {
    type: "website", siteName: "DOLF VISUALS", locale: "en_TZ",
    images: [{ url: "/portfolio/studio-portrait-chair-1.webp", width: 1200, height: 1800 }],
  },
  icons: {
    icon: [{ url: "/brand/favicon-32.png", sizes: "32x32" }, { url: "/brand/icon-512.png", sizes: "512x512" }],
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#111111", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  return (
    <html lang={lang} data-theme={theme} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
