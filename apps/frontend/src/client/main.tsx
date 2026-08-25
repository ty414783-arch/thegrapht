import { runBoot } from "./boot.ts";

void runBoot().then(() => import("./workspace.tsx"));
