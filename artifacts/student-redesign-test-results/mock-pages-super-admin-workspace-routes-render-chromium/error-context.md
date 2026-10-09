# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mock-pages.spec.ts >> super_admin workspace routes render
- Location: tests\ui\mock-pages.spec.ts:31:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: Test timeout of 60000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/admin", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | 
  3  | type Role = 'student' | 'lecturer' | 'content_manager' | 'super_admin';
  4  | 
  5  | const routes: Record<Role, string[]> = {
  6  |   student: ['/student', '/student/timeline', '/student/explore', '/student/profile'],
  7  |   lecturer: ['/lecturer', '/lecturer/subjects', '/lecturer/students', '/lecturer/analytics', '/lecturer/accounts'],
  8  |   content_manager: ['/content', '/content/packages', '/content/courses', '/content/accounts'],
  9  |   super_admin: ['/admin', '/admin/students', '/admin/access', '/admin/users', '/admin/settings'],
  10 | };
  11 | 
  12 | async function mockUser(page: Page, role: Role): Promise<void> {
  13 |   await page.addInitScript(() => {
  14 |     localStorage.setItem('endpoint.language', 'en');
  15 |     localStorage.setItem('endpoint.theme', 'light');
  16 |   });
  17 |   await page.route('http://localhost:4000/api/v1/**', async (route) => {
  18 |     const path = new URL(route.request().url()).pathname;
  19 |     if (path.endsWith('/auth/device')) return route.fulfill({ json: { success: true, data: { initialized: true } } });
  20 |     if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { success: true, data: { accessToken: 'mock-pages-token' } } });
  21 |     if (path.endsWith('/auth/me')) return route.fulfill({ json: { success: true, data: {
  22 |       id: `${role}-1`, name: 'Endpoint Demo', email: 'demo@endpoint.dev', roles: [role],
  23 |       permissions: { content_manager: ['content:update', 'expense:manage'], lecturer: ['student:read', 'analytics:read', 'expense:manage'], student: [], super_admin: [] }[role],
  24 |       preferences: { language: 'en', theme: 'light' },
  25 |     } } });
  26 |     return route.fulfill({ status: 404, json: { success: false } });
  27 |   });
  28 | }
  29 | 
  30 | for (const role of Object.keys(routes) as Role[]) {
  31 |   test(`${role} workspace routes render`, async ({ page }) => {
  32 |     test.setTimeout(60_000);
  33 |     await mockUser(page, role);
  34 |     for (const path of routes[role]) {
> 35 |       await page.goto(path);
     |                  ^ Error: page.goto: Test timeout of 60000ms exceeded.
  36 |       await expect(page.locator('main h1')).toBeVisible();
  37 |       await expect(page.locator('.center-message')).toHaveCount(0);
  38 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  39 |     }
  40 |   });
  41 | }
  42 | 
```