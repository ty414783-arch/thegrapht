/** Minimal boot gate — expands in later phases (auth check, feature flags). */
export async function runBoot(): Promise<void> {
  if (typeof document === "undefined") {
    return;
  }
}
