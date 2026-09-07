import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ConciergeClient } from "./ConciergeClient";

export const metadata = {
  title: "AI Care Concierge",
  description:
    "Personalized Ayurvedic care guidance and scheduling help using your profile and booking history when signed in.",
};

export default function ConciergePage() {
  return (
    <LayoutWrapper>
      <ConciergeClient />
    </LayoutWrapper>
  );
}
