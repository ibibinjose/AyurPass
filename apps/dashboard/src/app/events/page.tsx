import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Wellness Events | AyurPass",
  description:
    "Find and join wellness events — cooking classes, yoga workshops, sound baths, open days and more. Check in with your AyurPass.",
};

export default function EventsPage() {
  return <EventsClient />;
}
