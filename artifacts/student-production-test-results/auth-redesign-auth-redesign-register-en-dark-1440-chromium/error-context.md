# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-redesign.spec.ts >> auth redesign /register en dark 1440
- Location: tests\ui\auth-redesign.spec.ts:4:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e4]:
  - complementary [ref=e5]:
    - link "Endpoint home" [ref=e6] [cursor=pointer]:
      - /url: /
      - img "End Point." [ref=e7]
    - generic [ref=e8]:
      - generic [ref=e9]:
        - heading [level=2] [ref=e10]:
          - text: Learn smarter.
          - strong [ref=e11]: Reach your goals.
        - paragraph [ref=e12]: Lectures, interactive quizzes and organized study resources. Everything you need to move forward.
      - img "Student in a blue hoodie using a laptop" [ref=e14]
    - generic [ref=e15]:
      - generic [ref=e16]: Quality lectures
      - generic [ref=e20]: Interactive quizzes
      - generic [ref=e25]: Organized content
  - generic [ref=e30]:
    - generic [ref=e31]:
      - button "Language" [ref=e32] [cursor=pointer]:
        - generic [ref=e38]: EN
      - button "Theme" [ref=e39] [cursor=pointer]
    - generic [ref=e46]:
      - heading "Create your account" [level=1] [ref=e47]
      - paragraph [ref=e48]: Start learning with Endpoint
    - generic [ref=e49]:
      - generic [ref=e50]:
        - generic [ref=e51]: Full name
        - textbox "Full name" [ref=e53]:
          - /placeholder: Enter your full name
      - generic [ref=e54]:
        - generic [ref=e55]: Email
        - textbox "Email" [ref=e57]:
          - /placeholder: example@email.com
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]: Password
          - generic [ref=e61]:
            - textbox "Password Show password" [ref=e62]:
              - /placeholder: Enter your password
            - button "Show password" [ref=e63] [cursor=pointer]
        - generic [ref=e67]:
          - generic [ref=e68]: Confirm password
          - generic [ref=e69]:
            - textbox "Confirm password Show password" [ref=e70]:
              - /placeholder: Repeat your password
            - button "Show password" [ref=e71] [cursor=pointer]
      - generic [ref=e75]:
        - generic [ref=e76]: Year
        - combobox "Year Current registration does not support saving your year yet." [disabled] [ref=e77]:
          - option "Year selection is not available yet" [selected]
          - option "First Year"
          - option "Second Year"
          - option "Third Year"
          - option "Fourth Year"
        - generic [ref=e78]: Current registration does not support saving your year yet.
      - button "Create account" [ref=e79] [cursor=pointer]
    - generic [ref=e80]: or
    - button "Sign up with Google" [ref=e81] [cursor=pointer]
    - paragraph [ref=e87]:
      - text: Already have an account?
      - link "Sign in" [ref=e88] [cursor=pointer]:
        - /url: /login
    - generic [ref=e89]: By continuing, you agree to Endpoint's terms and privacy policy.
```

# Test source

```ts
  1  | ﻿import { expect, test } from '@playwright/test';
  2  | 
  3  | for (const language of ['ar', 'en']) for (const theme of ['dark', 'light']) for (const width of [390, 1440]) for (const path of ['/login', '/register']) {
  4  |   test(`auth redesign ${path} ${language} ${theme} ${width}`, async ({ page }) => {
  5  |     await page.setViewportSize({ width, height: 900 });
  6  |     await page.addInitScript(({ language, theme }) => {
  7  |       localStorage.setItem('endpoint.language', language);
  8  |       localStorage.setItem('endpoint.theme', theme);
  9  |     }, { language, theme });
  10 |     await page.route('http://localhost:4000/api/v1/**', route => route.fulfill({ status: 401, json: { success: false, error: { code: 'AUTH_REQUIRED' } } }));
  11 |     await page.goto(path);
  12 |     await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  13 |     await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  14 |     await expect(page.locator('.auth-hero__visual img')).toBeVisible();
> 15 |     expect(await page.locator('.auth-hero__visual img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
     |                                                                                                                                          ^ Error: expect(received).toBe(expected) // Object.is equality
  16 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  17 |     const input = page.locator('input[name="email"]');
  18 |     await expect(input).toBeVisible();
  19 |     expect(await input.evaluate(element => element.getBoundingClientRect().height)).toBe(width >= 768 ? 46 : 50);
  20 |     if (width === 1440) {
  21 |       const usableWidth = await input.evaluate(element => element.getBoundingClientRect().width);
  22 |       expect(usableWidth).toBeGreaterThanOrEqual(430);
  23 |       expect(usableWidth).toBeLessThanOrEqual(470);
  24 |     }
  25 |     const background = await input.evaluate(element => getComputedStyle(element).backgroundColor);
  26 |     expect(background).toBe(theme === 'dark' ? 'rgb(16, 38, 59)' : 'rgb(255, 255, 255)');
  27 |     await page.locator('.auth-submit').click();
  28 |     await expect(input).toHaveAttribute('aria-invalid', 'true');
  29 |     await expect(page.locator('#email-error')).toBeVisible();
  30 |     await page.locator('.auth-eye').first().click();
  31 |     await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');
  32 |     if (path === '/register' && width === 390) {
  33 |       const password = await page.locator('input[name="password"]').boundingBox();
  34 |       const confirm = await page.locator('input[name="confirmPassword"]').boundingBox();
  35 |       expect(confirm!.y).toBeGreaterThan(password!.y + password!.height);
  36 |     }
  37 |   });
  38 | }
  39 | 
  40 | test('wrong credentials, recovery help, and loading stay inside the form', async ({ page }) => {
  41 |   await page.route('http://localhost:4000/api/v1/**', async route => {
  42 |     const path = new URL(route.request().url()).pathname;
  43 |     if (path.endsWith('/auth/device')) return route.fulfill({ json: { success: true, data: { initialized: true } } });
  44 |     if (path.endsWith('/auth/login')) {
  45 |       await new Promise(resolve => setTimeout(resolve, 500));
  46 |       return route.fulfill({ status: 401, json: { success: false, error: { code: 'INVALID_CREDENTIALS' } } });
  47 |     }
  48 |     if (path.endsWith('/auth/google/status')) {
  49 |       await new Promise(resolve => setTimeout(resolve, 500));
  50 |       return route.fulfill({ json: { success: true, data: { configured: false } } });
  51 |     }
  52 |     return route.fulfill({ status: 401, json: { success: false, error: { code: 'AUTH_REQUIRED' } } });
  53 |   });
  54 |   await page.goto('/login');
  55 |   await page.locator('.auth-text-button').click();
  56 |   await expect(page.locator('#recovery-help')).toBeVisible();
  57 |   await page.locator('[name="email"]').fill('student@example.com');
  58 |   await page.locator('[name="password"]').fill('wrong-password');
  59 |   await page.locator('.auth-submit').click();
  60 |   await expect(page.locator('.auth-submit')).toBeDisabled();
  61 |   await expect(page.getByRole('alert')).toContainText('incorrect');
  62 |   await page.locator('.auth-google').click();
  63 |   await expect(page.locator('.auth-google')).toBeDisabled();
  64 |   await expect(page.getByRole('alert')).toContainText('not configured');
  65 | });
  66 | 
  67 | test('language and theme controls update both auth pages', async ({ page }) => {
  68 |   await page.addInitScript(() => {
  69 |     localStorage.setItem('endpoint.language', 'en');
  70 |     localStorage.setItem('endpoint.theme', 'light');
  71 |   });
  72 |   await page.route('http://localhost:4000/api/v1/**', route => route.fulfill({ status: 401, json: { success: false } }));
  73 |   await page.goto('/login');
  74 |   await page.locator('.auth-toolbar button').first().click();
  75 |   await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  76 |   await page.locator('.auth-toolbar button').last().click();
  77 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  78 |   await page.locator('.auth-switch a').click();
  79 |   await expect(page).toHaveURL(/register$/);
  80 |   await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  81 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  82 | });
  83 | 
```