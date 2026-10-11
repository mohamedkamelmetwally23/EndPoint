import { test, expect } from "@playwright/test";

test("student profile uses one focused request and handles an absent phone", async ({ page }, testInfo) => {
  const root = "http://127.0.0.1:4001/api/v1";
  const { data: academics } = await (await page.request.get(`${root}/public/academics`)).json();
  const email = `profile-${Date.now()}@browser.test`;
  const password = "Browser-test-password!";
  expect((await page.request.post(`${root}/auth/register`, { data: {
    fullName: "Profile Student", email, password, confirmPassword: password, phone: "+201234567890",
    collegeId: academics.colleges[0]._id, academicYearId: academics.academic_years[0]._id,
  } })).ok()).toBeTruthy();
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".calendar")).toBeVisible();
  const paths: string[] = [];
  page.on("request", req => paths.push(new URL(req.url()).pathname));
  const meResponse = page.waitForResponse(res => new URL(res.url()).pathname === "/api/v1/auth/me");
  const profileResponse = page.waitForResponse(res => new URL(res.url()).pathname === "/api/v1/profile");
  await page.goto("/profile");
  const [me, profile] = await Promise.all([meResponse, profileResponse]);
  expect([200, 304]).toContain(me.status());
  expect(profile.status()).toBe(200);
  const dto = (await profile.json()).data;
  expect(Object.keys((await me.json()).data.user).sort()).toEqual(["_id", "fullName", "role"]);
  await expect(page.getByRole("heading", { name: "Profile Student", exact: true })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.locator(".profile-grid dl")).toContainText(academics.colleges[0].name);
  await expect(page.getByLabel("Phone / WhatsApp", { exact: true })).toHaveValue("+201234567890");
  expect(dto.academicYear.name).toBe("Foundation Year");
  expect(dto.activeTerm.name).toBe("Autumn Term");
  await expect(page.locator(".profile-grid dl")).toContainText("Foundation Year");
  await expect(page.locator(".profile-grid dl")).toContainText("Autumn Term");
  expect(paths.filter(path => path === "/api/v1/profile")).toHaveLength(1);
  expect(paths.filter(path => path === "/api/v1/auth/me")).toHaveLength(1);
  expect(paths.filter(path => path === "/api/v1/public/academics")).toHaveLength(0);
  const apiPaths = paths.filter(path => path.startsWith("/api/"));
  expect(apiPaths.sort()).toEqual(["/api/v1/auth/me", "/api/v1/profile"]);
  await testInfo.attach("local-profile-network.json", { body: JSON.stringify({
    me: { url: me.url(), status: me.status() },
    profile: { url: profile.url(), status: profile.status(), dto }, apiPaths,
  }, null, 2), contentType: "application/json" });
  await testInfo.attach("local-profile.png", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  await page.route("**/api/v1/profile", async route => {
    const response = await route.fetch();
    const json = await response.json();
    delete json.data.user.phone;
    await route.fulfill({ response, json });
  });
  await page.reload();
  await expect(page.getByLabel("Phone / WhatsApp", { exact: true })).toHaveValue("");
  await page.unroute("**/api/v1/profile");
  await page.route("**/api/v1/profile", route => route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND" } } }));
  await page.reload();
  await expect(page.getByText("The profile API route is unavailable. Check the backend version and API routing.")).toBeVisible();
});
