import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("fitness");
export default HandleProfilePage({ namespace: "fitness" });
