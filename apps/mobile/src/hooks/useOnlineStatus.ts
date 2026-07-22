import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/** Live online/offline flag for retry banners. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(isOnline);
    });
    void NetInfo.fetch().then((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  return online;
}
