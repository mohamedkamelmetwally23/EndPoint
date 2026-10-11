import { test, expect } from "@playwright/test";

test("student profile uses one focused request and handles an absent phone", async ({ page }) => {
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
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Profile Student", exact: true })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.locator(".profile-grid dl")).toContainText(academics.colleges[0].name);
  expect(paths.filter(path => path === "/api/v1/profile")).toHaveLength(1);
  expect(paths.filter(path => path === "/api/v1/auth/me")).toHaveLength(1);
  expect(paths.filter(path => path === "/api/v1/public/academics")).toHaveLength(0);
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
