import { test, expect } from "@playwright/test";

test("loads manifest entry without module errors", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/");

  await expect(page).toHaveTitle(/TheGraphT Web/);
  await expect(page.locator('meta[name="tg-build"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator("#app-root")).toBeAttached();

  const usesNewAuth = await page.evaluate(() => Boolean(window.__THEGRAPHT_CONFIG__?.uiFlags?.newAuthUi));
  const authSurface = usesNewAuth
    ? page.getByLabel("Authentication")
    : page.locator("#auth-view");

  await expect(authSurface.or(page.locator("#workspace-view:not(.hidden)"))).toBeVisible({ timeout: 15000 });
  expect(pageErrors).toEqual([]);
});

test("keeps core auth controls usable on the configured viewport", async ({ page }) => {
  await page.goto("/");

  const usesNewAuth = await page.evaluate(() => Boolean(window.__THEGRAPHT_CONFIG__?.uiFlags?.newAuthUi));
  const authSurface = usesNewAuth
    ? page.getByLabel("Authentication")
    : page.locator("#auth-view");

  if (await authSurface.isVisible().catch(() => false)) {
    const email = usesNewAuth ? page.getByLabel("Authentication").locator('input[type="email"]') : page.locator("#email");
    const password = usesNewAuth ? page.getByLabel("Authentication").locator('input[type="password"]') : page.locator("#password");
    const submit = usesNewAuth
      ? page.getByRole("button", { name: /sign in|log in/i })
      : page.locator("#submit-button");

    await email.fill("smoke@example.com");
    await password.fill("password123");
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
    return;
  }

  await expect(page.locator("#workspace-view:not(.hidden), .tg-app-shell")).toBeVisible({ timeout: 15000 });
});

test("legacy shell keeps composer, chat island, and viewer modal in DOM", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/");

  const flags = await page.evaluate(() => window.__THEGRAPHT_CONFIG__?.uiFlags || {});
  test.skip(Boolean(flags.newChatUi), "legacy shell test applies only when UI_NEW_CHAT_UI is off");

  await expect(page.locator("#composer-input")).toBeAttached();
  await expect(page.locator(".composer-shell")).toBeAttached();
  await expect(page.locator("#chat-island.chat-island")).toBeAttached();
  await expect(page.locator("#viewer-modal")).toBeAttached();
  await expect(page.locator("#chat-profile-panel.chat-profile-panel")).toBeAttached();
  expect(pageErrors).toEqual([]);
});
