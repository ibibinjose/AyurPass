import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("pro");
export default HandleProfilePage({ namespace: "pro" });
