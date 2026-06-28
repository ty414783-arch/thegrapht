import { chromium } from "playwright";

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      Host: "dev.thegrapht.su"
    },
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

  console.log("Navigating to http://localhost:5185/ ...");
  try {
    await page.goto("http://localhost:5185/", { waitUntil: "networkidle", timeout: 10000 });
  } catch (e) {
    console.error("Navigation failed:", e.message);
  }

  // Inspect some icons in the DOM
  const iconsInfo = await page.evaluate(() => {
    const icons = Array.from(document.querySelectorAll(".lucide"));
    return icons.map(el => ({
      html: el.outerHTML,
      textContent: el.textContent,
      classList: Array.from(el.classList)
    }));
  });

  console.log("\nFOUND ICONS IN DOM:");
  console.log(JSON.stringify(iconsInfo.slice(0, 20), null, 2));

  await browser.close();
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
