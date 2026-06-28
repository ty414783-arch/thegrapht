# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.js >> renders auth shell without client syntax errors
- Location: test/smoke.spec.js:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('#auth-view')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#auth-view')
    8 × locator resolved to <section id="auth-view" class="view hidden">…</section>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - article [ref=e5]:
        - generic [ref=e6]:
          - img "TheGraphT logo" [ref=e8]
          - paragraph [ref=e9]: Thegrapht Messenger
          - generic [ref=e10]: Thegrapht
          - heading "Your new smooth" [level=1] [ref=e11]:
            - text: Your new
            - generic [ref=e14]: smooth
      - article [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - paragraph [ref=e20]: Sign in
              - heading "Log in" [level=2] [ref=e21]
              - paragraph [ref=e22]: Enter your email and password to sign in to Thegrapht.
            - generic [ref=e23]:
              - generic [ref=e24]:
                - generic [ref=e25]: Name
                - textbox "Name" [ref=e26]:
                  - /placeholder: galyachupachups
              - generic [ref=e27]:
                - generic [ref=e28]: Email
                - textbox "Email" [ref=e29]:
                  - /placeholder: you@example.com
              - generic [ref=e30]:
                - generic [ref=e31]: Password
                - textbox "Password" [ref=e32]:
                  - /placeholder: ••••••••••••
              - button "Log in" [ref=e33] [cursor=pointer]
          - generic [ref=e35]:
            - text: No account?
            - button "Create account" [ref=e36] [cursor=pointer]
            - link "Messenger FAQ" [ref=e38] [cursor=pointer]:
              - /url: /product
  - generic:
    - generic:
      - generic:
        - heading [level=2]: 1 photo
        - button: ×
      - generic:
        - generic:
          - generic:
            - textbox:
              - /placeholder: Add a caption...
        - button:
          - generic: SEND
  - generic:
    - generic:
      - generic:
        - generic:
          - generic: "?"
          - generic:
            - generic: TheGraphT
            - generic: Today, 00:00
        - button: ×
      - generic:
        - button: −
        - generic: 100%
        - button: +
  - generic:
    - generic:
      - heading [level=2]: Delete message
      - paragraph: Are you sure you want to delete this message?
      - generic:
        - checkbox [checked]
        - generic: Also delete for everyone
      - generic:
        - button: Cancel
        - button: Delete
  - generic [ref=e40]:
    - heading "TheGraphT Messenger (Preact + TS Dev)" [level=2] [ref=e41]
    - paragraph [ref=e42]: Hello from the new compiled front-end!
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("renders auth shell without client syntax errors", async ({ page }) => {
  4  |   const pageErrors = [];
  5  |   page.on("pageerror", (error) => pageErrors.push(error));
  6  | 
  7  |   await page.goto("/");
  8  | 
  9  |   await expect(page).toHaveTitle(/TheGraphT Web/);
> 10 |   await expect(page.locator("#auth-view")).toBeVisible();
     |                                            ^ Error: expect(locator).toBeVisible() failed
  11 |   await expect(page.locator("#email")).toBeVisible();
  12 |   await expect(page.locator("#password")).toBeVisible();
  13 |   expect(pageErrors).toEqual([]);
  14 | });
  15 | 
  16 | test("keeps core auth controls usable on the configured viewport", async ({ page }) => {
  17 |   await page.goto("/");
  18 | 
  19 |   const email = page.locator("#email");
  20 |   const password = page.locator("#password");
  21 |   const submit = page.locator("#submit-button");
  22 | 
  23 |   await email.fill("smoke@example.com");
  24 |   await password.fill("password123");
  25 | 
  26 |   await expect(submit).toBeVisible();
  27 |   await expect(submit).toBeEnabled();
  28 | });
  29 | 
```