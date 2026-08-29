import type { Metadata } from "next";
import { CentraLinkClient } from "./CentraLinkClient";

export const metadata: Metadata = {
  title: "CentraLink OS — Practice Operating System | AyurPass",
  description:
    "CentraLink practice operating system cockpit. Unified front-desk telemetry, Panchakarma table occupancy, 7-layer clinical agent memory, and channel synchronization.",
};

export default function CentraLinkPage() {
  return <CentraLinkClient />;
}
