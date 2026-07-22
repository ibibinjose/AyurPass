import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("meditation");
export default HandleProfilePage({ namespace: "meditation" });
