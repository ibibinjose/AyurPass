import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AyurPass Logo",
  description: "AyurPass logo display page",
};

export default function LogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}