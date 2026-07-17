import { HandleProfilePage, makeHandleMetadata } from "@/components/HandleProfilePage";

export const generateMetadata = makeHandleMetadata("spa");
export default HandleProfilePage({ namespace: "spa" });
