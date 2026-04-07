import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  install: () => Promise<boolean>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(isStandalone());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    const accepted = choice.outcome === "accepted";

    if (accepted) {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    return accepted;
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    install,
  };
}
