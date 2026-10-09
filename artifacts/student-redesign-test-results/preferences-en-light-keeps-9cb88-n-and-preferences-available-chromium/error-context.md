# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preferences.spec.ts >> en + light keeps student navigation and preferences available
- Location: tests\ui\preferences.spec.ts:27:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/student", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | 
  3  | type Language = 'ar' | 'en';
  4  | type Theme = 'dark' | 'light';
  5  | 
  6  | async function mockAuthenticatedStudent(page: Page, language: Language, theme: Theme): Promise<void> {
  7  |   await page.addInitScript(({ language: savedLanguage, theme: savedTheme }) => {
  8  |     localStorage.setItem('endpoint.language', savedLanguage);
  9  |     localStorage.setItem('endpoint.theme', savedTheme);
  10 |   }, { language, theme });
  11 | 
  12 |   await page.route('http://localhost:4000/api/v1/**', async (route) => {
  13 |     const path = new URL(route.request().url()).pathname;
  14 |     if (path.endsWith('/auth/device')) return route.fulfill({ json: { success: true, data: { initialized: true } } });
  15 |     if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { success: true, data: { accessToken: 'browser-test-token' } } });
  16 |     if (path.endsWith('/auth/me')) return route.fulfill({ json: { success: true, data: {
  17 |       id: 'student-1', name: 'Ahmed Mohamed', email: 'ahmed@example.com', roles: ['student'], permissions: [], preferences: { language, theme },
  18 |     } } });
  19 |     if (path.endsWith('/users/me/preferences')) return route.fulfill({ json: { success: true, data: { language, theme } } });
  20 |     if (path.endsWith('/students/me/timeline')) return route.fulfill({ json: { success: true, data: [] } });
  21 |     return route.fulfill({ status: 404, json: { success: false } });
  22 |   });
  23 | }
  24 | 
  25 | for (const language of ['en', 'ar'] as const) {
  26 |   for (const theme of ['light', 'dark'] as const) {
  27 |     test(`${language} + ${theme} keeps student navigation and preferences available`, async ({ page }) => {
  28 |       await mockAuthenticatedStudent(page, language, theme);
> 29 |       await page.goto('/student');
     |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  30 |       await expect(page).toHaveURL(/\/student\/timeline$/);
  31 |       await expect(page.locator('main h1')).toBeVisible();
  32 |       await expect(page.locator('html')).toHaveAttribute('lang', language);
  33 |       await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  34 |       await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  35 |       await expect(page.locator('.sidebar-menu a')).toHaveText(language === 'ar' ? ['الجدول الزمني', 'حسابي', 'استكشف'] : ['Timeline', 'Profile', 'Explore']);
  36 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  37 |       await page.locator('.preferences .preference-toggle').first().click();
  38 |       await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'ltr' : 'rtl');
  39 |       await page.locator('.preferences .preference-toggle').nth(1).click();
  40 |       await expect(page.locator('html')).toHaveAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  41 |     });
  42 |   }
  43 | }
  44 | 
  45 | test('Arabic dark mode remains responsive on a mobile viewport', async ({ page }) => {
  46 |   await page.setViewportSize({ width: 390, height: 844 });
  47 |   await mockAuthenticatedStudent(page, 'ar', 'dark');
  48 |   await page.goto('/student');
  49 |   await expect(page.locator('main h1')).toBeVisible();
  50 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  51 |   await expect(page.locator('.mobile-nav a')).toHaveCount(3);
  52 |   await expect(page.getByRole('button', { name: /Sign out|تسجيل الخروج/ })).toBeVisible();
  53 | });
  54 | 
```