import { chromium } from "playwright";

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    bypassCSP: true,
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  page.on("console", msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });

  page.on("pageerror", err => {
    console.error("PAGE ERROR:", err.message);
  });

  console.log("Navigating to https://dev.thegrapht.su/ ...");
  try {
    await page.goto("https://dev.thegrapht.su/", { waitUntil: "domcontentloaded" });
    console.log("Waiting for boot to finish...");
    await page.waitForFunction(() => {
      const pageRoot = document.getElementById("page-root");
      return pageRoot && !pageRoot.classList.contains("booting");
    }, { timeout: 10000 });
    console.log("Boot finished!");
  } catch (e) {
    console.error("Boot/Navigation failed:", e.message);
  }

  // Inspect the DOM states
  const states = await page.evaluate(() => {
    const pageRoot = document.getElementById("page-root");
    const authView = document.getElementById("auth-view");
    const workspaceView = document.getElementById("workspace-view");
    const bootSplash = document.getElementById("boot-splash");
    
    return {
      pageRootClass: pageRoot ? pageRoot.className : "null",
      authViewClass: authView ? authView.className : "null",
      workspaceViewClass: workspaceView ? workspaceView.className : "null",
      bootSplashClass: bootSplash ? bootSplash.className : "null"
    };
  });

  console.log("\nDOM STATES:");
  console.log(JSON.stringify(states, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});



