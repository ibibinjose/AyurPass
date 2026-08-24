/// <reference types="nativewind/types" />

/**
 * NativeWind delegates these declarations to react-native-css-interop. Keep a
 * local augmentation as a compatibility fallback for Expo's React Native type
 * resolution, which can otherwise omit the transitive augmentation in `tsc`.
 */
import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
    cssInterop?: boolean;
  }

  interface TextProps {
    className?: string;
    cssInterop?: boolean;
  }

  interface ImagePropsBase {
    className?: string;
    cssInterop?: boolean;
  }

  interface TextInputProps {
    placeholderClassName?: string;
  }

  interface ScrollViewProps {
    contentContainerClassName?: string;
    indicatorClassName?: string;
  }

  interface ImageBackgroundProps {
    imageClassName?: string;
  }

  interface SwitchProps {
    className?: string;
    cssInterop?: boolean;
  }

  interface TouchableWithoutFeedbackProps {
    className?: string;
    cssInterop?: boolean;
  }

  interface StatusBarProps {
    className?: string;
    cssInterop?: boolean;
  }

  interface KeyboardAvoidingViewProps {
    contentContainerClassName?: string;
  }

  interface ModalBaseProps {
    presentationClassName?: string;
  }
}
