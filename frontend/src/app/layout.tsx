import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { JsonLd } from "@/components/JsonLd";
import { BRAND_ASSET_VERSION } from "@/lib/brand";
import {
  DEFAULT_KEYWORDS,
  organizationJsonLd,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const OG_IMAGE = `/brand/ayurpass-logo.png?v=${BRAND_ASSET_VERSION}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AyurPass — Ayurveda, Yoga, Spa, Meditation & Retreat Finder",
    template: "%s | AyurPass",
  },
  description: SITE_TAGLINE,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: `/icon.png?v=${BRAND_ASSET_VERSION}`, sizes: "512x512", type: "image/png" },
      { url: `/brand/icon-32.png?v=${BRAND_ASSET_VERSION}`, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: `/apple-icon.png?v=${BRAND_ASSET_VERSION}`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "AyurPass — Ayurveda, Yoga, Spa, Meditation & Retreat Finder",
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: "AyurPass — wellness directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AyurPass — Ayurveda, Yoga, Spa, Meditation & Retreat Finder",
    description: SITE_TAGLINE,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}