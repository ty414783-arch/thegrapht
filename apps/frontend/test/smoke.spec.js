import { test, expect } from "@playwright/test";

test("renders auth shell without client syntax errors", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/");

  await expect(page).toHaveTitle(/TheGraphT Web/);
  await expect(page.locator("#auth-view")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("keeps core auth controls usable on the configured viewport", async ({ page }) => {
  await page.goto("/");

  const email = page.locator("#email");
  const password = page.locator("#password");
  const submit = page.locator("#submit-button");

  await email.fill("smoke@example.com");
  await password.fill("password123");

  await expect(submit).toBeVisible();
  await expect(submit).toBeEnabled();
});
