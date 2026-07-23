import { Redirect } from "expo-router";

/** Legacy route → Offers tab */
export default function OffersRedirect() {
  return <Redirect href="/(tabs)/offers" />;
}
