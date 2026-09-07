import type { Metadata } from "next";
import { CentraLinkClient } from "./CentraLinkClient";

export const metadata: Metadata = {
  title: "CentraLink OS — Practice Operating System",
  description:
    "CentraLink practice operating system cockpit. Front-desk bookings, room occupancy, care memory, and channel links for your practice.",
};

export default function CentraLinkPage() {
  return <CentraLinkClient />;
}
