import type { Metadata } from "next";
import Image from "next/image";
import { LayoutWrapper } from "@/components/LayoutWrapper";
// Import the logo directly instead of using the dynamic path with query string
import logoImage from "../../../public/brand/ayurpass-logo.png";

export const metadata: Metadata = {
  title: "AyurPass Logo | AyurPass",
  description: "AyurPass logo page",
  alternates: { canonical: "https://www.ayurpass.com/logo" },
};

export default function LogoPage() {
  return (
    <LayoutWrapper>
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center p-8">
          <Image
            src={logoImage}
            alt="AyurPass Logo"
            width={600}
            height={300}
            className="max-w-full h-auto object-contain"
            priority
          />
          <p className="mt-8 text-center text-gray-600 text-lg">
            AyurPass - Connecting you with authentic Ayurveda, Yoga, Spa & Wellness experiences
          </p>
        </div>
      </div>
    </LayoutWrapper>
  );
}