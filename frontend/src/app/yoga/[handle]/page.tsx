import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("yoga");
export default HandleProfilePage({ namespace: "yoga" });
