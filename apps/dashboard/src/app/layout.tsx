import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JsonLd } from "@/components/JsonLd";
import { LocationModal } from "@/components/LocationModal";
import { BRAND_ASSET_VERSION } from "@/lib/brand";
import { QueryProvider } from "@/providers/QueryProvider";
import { DevEnvBanner } from "@/components/DevEnvBanner";
import { InstallPrompt } from "@/components/InstallPrompt";
import {
  DEFAULT_KEYWORDS,
  organizationJsonLd,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE_DEFAULT,
  SITE_URL,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

/** Mobile-first viewport — iOS notch, Android system bars, no unwanted zoom. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3228" },
  ],
  colorScheme: "light",
};

/** Landscape social card (1200×630) — better than square logo for large-image previews. */
const OG_IMAGE = `/og-wellness.jpg?v=${BRAND_ASSET_VERSION}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_TITLE_DEFAULT,
  },
  description: SITE_TAGLINE,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AyurPass",
  },
  icons: {
    icon: [
      { url: `/icon.png?v=${BRAND_ASSET_VERSION}`, sizes: "512x512", type: "image/png" },
      { url: `/brand/icon-32.png?v=${BRAND_ASSET_VERSION}`, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: `/apple-icon.png?v=${BRAND_ASSET_VERSION}`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_AU",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_TITLE_DEFAULT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
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
      <body className="flex min-h-[100dvh] min-h-screen flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <LocationProvider>
                <DevEnvBanner />
                <InstallPrompt />
                {children}
                <LocationModal />
              </LocationProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}