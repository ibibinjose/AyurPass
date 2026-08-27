import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose an account type",
  description:
    "Choose a Seeker, Professional, or Provider account to begin with AyurPass.",
  alternates: { canonical: "/account-type" },
  robots: { index: false, follow: false },
};

export default function AccountTypeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
