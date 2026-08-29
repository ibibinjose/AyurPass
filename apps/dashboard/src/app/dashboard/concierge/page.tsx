import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ConciergeClient } from "./ConciergeClient";

export const metadata = {
  title: "AI Care Concierge | AyurPass",
  description: "Personalized Ayurvedic care, treatment recommendations, and scheduling with structured cognitive agent memory.",
};

export default function ConciergePage() {
  return (
    <LayoutWrapper>
      <ConciergeClient />
    </LayoutWrapper>
  );
}
