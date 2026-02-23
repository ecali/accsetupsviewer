"use client";

import { useEffect, useMemo, useState } from "react";

type InstallOutcome = "accepted" | "dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
};

const DISMISS_KEY = "caliacc_install_prompt_dismissed";

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|opios/.test(ua);
  return isIos && isSafari;
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const mediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return iosStandalone || mediaStandalone;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [standalone, setStandalone] = useState(() => (typeof window === "undefined" ? true : isStandaloneMode()));
  const [showIosHint] = useState(() => (typeof window === "undefined" ? false : isIosSafari()));

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const showAndroidInstall = useMemo(() => Boolean(deferredPrompt) && !standalone && !dismissed, [deferredPrompt, standalone, dismissed]);
  const showIosInstall = useMemo(() => showIosHint && !standalone && !dismissed, [showIosHint, standalone, dismissed]);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!showAndroidInstall && !showIosInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[95] sm:left-auto sm:w-[420px]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Install CaliACCSetupsViewer</p>
            {showAndroidInstall ? (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Install the app for faster access from your home screen.
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                On iPhone: tap Share, then choose Add to Home Screen.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        {showAndroidInstall ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleInstallClick}
              className="cursor-pointer rounded-lg bg-[#23a936] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f962f]"
            >
              Install
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
