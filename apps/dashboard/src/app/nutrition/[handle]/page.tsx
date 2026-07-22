import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("nutrition");
export default HandleProfilePage({ namespace: "nutrition" });
