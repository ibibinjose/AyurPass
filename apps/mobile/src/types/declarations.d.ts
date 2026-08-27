declare module 'expo-router' {
  export const usePathname: () => string;
  export const useRouter: () => any;
  export const useLocalSearchParams: <T = any>() => T;
  export const useGlobalSearchParams: <T = any>() => T;
  export const useSearchParams: <T = any>() => T;
  export const useSegments: () => string[];
  export const useFocusEffect: (effect: () => void | (() => void)) => void;
  export const Link: any;
  export const Stack: any;
  export const Tabs: any;
  export const Slot: any;
  export const Redirect: any;
  export const ExpoRoot: any;
  export type Href<T = any> = any;
  const router: any;
  export default router;
}

declare module '@stripe/stripe-react-native';
