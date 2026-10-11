import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

test("critical student navigation makes one request per resource", async ({ page, context }) => {
  await context.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.240" });
  const root = "http://127.0.0.1:4001/api/v1";
  const academics = await (await page.request.get(`${root}/public/academics`)).json();
  const email = `network-${Date.now()}@browser.test`;
  const password = "Browser-test-password!";
  expect((await page.request.post(`${root}/auth/register`, { data: {
    fullName: "Network Review", email, password, confirmPassword: password, phone: "+201234567890",
    collegeId: academics.data.colleges[0]._id, academicYearId: academics.data.academic_years[0]._id,
  } })).ok()).toBeTruthy();
  const requests: { method: string; path: string }[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/api/v1/")) requests.push({ method: request.method(), path: url.pathname + url.search });
  });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const initialTimeline = page.waitForResponse(response => response.url().includes("/student/timeline?"));
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await initialTimeline;
  await expect(page.locator(".calendar")).toBeVisible();
  for (const [route, api] of [["explore", "/student/packages?mode=explore"], ["learning", "/student/packages?mode=learning"], ["timeline", "/student/timeline?"]]) {
    const response = page.waitForResponse(response => response.url().includes(api));
    await page.locator(`.sidebar a[href="/${route}"]`).click();
    await response;
    await expect(page).toHaveURL(new RegExp(`/${route}$`));
  }
  await expect(page.locator(".calendar")).toBeVisible();
  const beforeSameRoute = requests.length;
  await page.locator('.sidebar a[href="/timeline"]').click();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(requests).toHaveLength(beforeSameRoute);
  const count = (path: string) => requests.filter(request => request.path.startsWith(path)).length;
  const counts = { login: count("/api/v1/auth/login"), me: count("/api/v1/auth/me"),
    timeline: count("/api/v1/student/timeline"), explore: count("/api/v1/student/packages?mode=explore"),
    learning: count("/api/v1/student/packages?mode=learning"),
    academics: count("/api/v1/public/academics"), sameRouteAdditionalRequests: requests.length - beforeSameRoute };
  expect(counts).toEqual({ login: 1, me: 1, timeline: 2, explore: 1, learning: 1, academics: 0, sameRouteAdditionalRequests: 0 });
  await mkdir("artifacts/performance-review", { recursive: true });
  await writeFile("artifacts/performance-review/network.json", JSON.stringify({ counts, requests }, null, 2));
});
