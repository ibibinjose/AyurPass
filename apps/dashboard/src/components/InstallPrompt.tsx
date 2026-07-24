"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "@/components/icons";
import { Button } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return; // Already installed, do nothing
    }

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIos(true);
      // Wait a few seconds before showing iOS prompt so it isn't too aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    
    // We can no longer use the prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-md"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-forest p-4 text-white shadow-xl">
            <div className="flex-1">
              <h3 className="text-sm font-bold">Install AyurPass</h3>
              {isIos ? (
                <p className="mt-1 text-xs text-white/80 leading-tight">
                  Tap the Share icon <span className="inline-block translate-y-0.5">📤</span> below, then select <strong>Add to Home Screen</strong>.
                </p>
              ) : (
                <p className="mt-1 text-xs text-white/80 leading-tight">
                  Add AyurPass to your home screen for the full app experience.
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isIos && (
                <Button
                  variant="primary"
                  className="min-h-8 bg-white px-3 py-1.5 text-xs text-forest hover:bg-white/90 whitespace-nowrap"
                  onClick={handleInstallClick}
                >
                  Install
                </Button>
              )}
              <button
                onClick={handleDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <XIcon className="h-5 w-5 opacity-70 hover:opacity-100" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
