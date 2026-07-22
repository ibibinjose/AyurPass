import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("coach");
export default HandleProfilePage({ namespace: "coach" });
