import { useEffect } from "preact/hooks";
import { uiActions } from "../../store/index.ts";
import { useAppStore } from "../../shared/hooks/useStore.ts";

/** Hides SSR boot splash once Preact auth/workspace is ready. */
export function BootSplash() {
  const bootComplete = useAppStore((state) => state.ui.bootComplete);

  useEffect(() => {
    const splash = document.getElementById("boot-splash");
    const pageRoot = document.getElementById("page-root");
    if (bootComplete) {
      splash?.classList.add("hidden");
      pageRoot?.classList.remove("booting");
      return;
    }

    const timer = window.setTimeout(() => {
      splash?.classList.add("hidden");
      pageRoot?.classList.remove("booting");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [bootComplete]);

  return null;
}

export const markBootComplete = (showWorkspace: boolean) => {
  uiActions.setBootComplete(true);
  const authView = document.getElementById("auth-view");
  const workspaceView = document.getElementById("workspace-view");
  if (showWorkspace) {
    authView?.classList.add("hidden");
    workspaceView?.classList.remove("hidden");
  } else {
    authView?.classList.remove("hidden");
    workspaceView?.classList.add("hidden");
  }
  const splash = document.getElementById("boot-splash");
  splash?.classList.add("hidden");
  document.getElementById("page-root")?.classList.remove("booting");
};
