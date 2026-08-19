import type { Metadata, Viewport } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  getSiteUrl,
} from "@/lib/seo";
import { getCompanyName } from "@/lib/brand";
import { DEFAULT_COMPANY_NAME } from "@/lib/brand-defaults";
import { getAppearance } from "@/lib/appearance";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getCompanyName();
  const description =
    SITE_DESCRIPTION.replace(DEFAULT_COMPANY_NAME, siteName) || SITE_DESCRIPTION;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} — Experience Bhutan like never before`,
      template: `%s | ${siteName}`,
    },
    description,
    applicationName: siteName,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: 'black-translucent',
    },
    icons: {
      icon: [
        { url: '/favicon.png?v=4', sizes: '48x48', type: 'image/png' },
        { url: '/icons/icon-192.png?v=4', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png?v=4', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png?v=4', sizes: '180x180', type: 'image/png' }],
      shortcut: ['/icons/icon-192.png?v=4'],
    },
    keywords: [
      "Bhutan tour",
      "Bhutan travel",
      "Bhutan trekking",
      "Bhutan festival",
      siteName,
      "Bhutan adventures",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName,
      title: `${siteName} — Experience Bhutan like never before`,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${siteName} — Bhutan tours`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} — Experience Bhutan like never before`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A2744",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearance = await getAppearance();
  return (
    <html
      lang="en"
      data-palette={appearance.palette}
      data-layout={appearance.layout}
      className={cn(
        "h-full antialiased font-sans",
        outfit.variable,
        cormorant.variable
      )}
    >
      <body className="wash-paper flex min-h-full flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
