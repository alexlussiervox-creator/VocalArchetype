import React, { useMemo, useState } from "react";
import { useInstallPrompt } from "../pwa/useInstallPrompt";

export interface InstallAppButtonProps {
  className?: string;
  label?: string;
  installedLabel?: string;
  iosHint?: string;
}

export function InstallAppButton({
  className,
  label = "Install app",
  installedLabel = "App installed",
  iosHint = "On iPhone/iPad, use Share then Add to Home Screen.",
}: InstallAppButtonProps) {
  const { isInstallable, isInstalled, install } = useInstallPrompt();
  const [message, setMessage] = useState<string>("");

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  const handleClick = async () => {
    const accepted = await install();
    setMessage(accepted ? "Install prompt accepted." : "Install prompt dismissed.");
  };

  if (isInstalled) {
    return (
      <button type="button" className={className} disabled aria-disabled="true">
        {installedLabel}
      </button>
    );
  }

  if (isInstallable) {
    return (
      <div>
        <button type="button" className={className} onClick={handleClick}>
          {label}
        </button>
        {message ? <p>{message}</p> : null}
      </div>
    );
  }

  if (isIOS) {
    return <p>{iosHint}</p>;
  }

  return null;
}
