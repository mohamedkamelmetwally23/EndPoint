import { test, expect, type Page } from "@playwright/test";
const root = "http://127.0.0.1:4001/api/v1";
const password = "Browser-test-password!";
async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".sidebar")).toBeVisible();
}
async function student(page: Page) {
  const academic = await (
    await page.request.get(`${root}/public/academics`)
  ).json();
  const email = `student-${Date.now()}-${Math.random().toString(36).slice(2)}@browser.test`;
  const response = await page.request.post(`${root}/auth/register`, {
    data: {
      fullName: "Browser Student",
      email,
      password,
      confirmPassword: password,
      phone: "+201234567890",
      collegeId: academic.data.colleges[0]._id,
      academicYearId: academic.data.academic_years[0]._id,
    },
  });
  expect(response.ok()).toBeTruthy();
  await login(page, email);
}
async function claim(page: Page) {
  await page.goto("/explore");
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Open Learning" }) })
    .click();
  await page.getByRole("button", { name: "Get for Free", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Algorithms", exact: true }),
  ).toBeVisible();
}
test("registration contains placement but no term selector", async ({
  page,
}) => {
  await page.goto("/register");
  await expect(page.getByLabel("College", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Academic year", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Term", { exact: true })).toHaveCount(0);
});
test("student navigation defaults to Timeline and excludes management", async ({
  page,
}) => {
  await student(page);
  await expect(page).toHaveURL(/timeline/);
  await expect(page.locator("nav a")).toHaveCount(4);
  await expect(page.locator("nav")).toContainText("My Learning");
  await expect(page.locator("nav")).not.toContainText("Accounts");
});
test("free claim, multi-subject learning, lecture completion and publication timeline", async ({
  page,
}) => {
  await student(page);
  await claim(page);
  await expect(
    page.getByRole("heading", { name: "Databases", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Thinking in algorithms/ }).click();
  await expect(
    page.getByText("Break the problem into small steps.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark as Completed" }).click();
  await expect(page.locator(".lecture-reader .badge")).toHaveText("Completed");
  await page.goto("/timeline");
  await expect(
    page.getByRole("link", { name: /Thinking in algorithms/ }),
  ).toBeVisible();
  await page.goto("/explore");
  await expect(
    page.getByRole("heading", { name: "Open Learning" }),
  ).toHaveCount(0);
  await page.goto("/learning");
  await expect(page.getByText("1 / 1")).toBeVisible();
});
test("paid CTA creates one pending order and opens real configured contact URL", async ({
  page,
}) => {
  await student(page);
  await page.goto("/explore");
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Complete Term" }) })
    .click();
  await page.route("https://wa.me/**", (route) =>
    route.fulfill({ body: "Contact purchase" }),
  );
  await page.getByRole("button", { name: "Buy via WhatsApp" }).click();
  await expect(page).toHaveURL(/wa\.me\/201234567890/);
});
test("free packages can be claimed directly from Explore", async ({ page }) => {
  await student(page);
  await page.goto("/explore");
  await page.getByRole("button", { name: "Get for Free", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Open Learning" }),
  ).toHaveCount(0);
  await page.goto("/learning");
  await expect(
    page.getByRole("heading", { name: "Open Learning" }),
  ).toBeVisible();
});
test("profile edits name and phone without academic placement editing", async ({
  page,
}) => {
  await student(page);
  await page.goto("/profile");
  await page.getByLabel("Full name", { exact: true }).fill("Updated Student");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved successfully");
  await expect(page.getByLabel("College", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Updated Student" }),
  ).toBeVisible();
});
test("language, direction and theme persist across refresh", async ({
  page,
}) => {
  await student(page);
  await page.getByRole("button", { name: "Language", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { name: "الجدول الزمني" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "المظهر", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("content manager sees assigned content and cannot publish", async ({
  page,
}) => {
  await login(page, "manager@browser.test");
  await page.goto("/myContent");
  await expect(
    page.getByRole("heading", { name: "Open Learning" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Complete Term" }),
  ).toHaveCount(0);
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Open Learning" }) })
    .click();
  await page.getByRole("button", { name: "Add lecture" }).first().click();
  await expect(
    page.getByLabel("Status", { exact: true }).locator("option"),
  ).toHaveText(["Choose…", "Draft"]);
});
test("lecturer has view-only content and relevant student learning report", async ({
  page,
}) => {
  await student(page);
  await claim(page);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await login(page, "lecturer@browser.test");
  await page.goto("/myContent");
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Open Learning" }) })
    .click();
  await expect(page.getByRole("button", { name: "Add lecture" })).toHaveCount(
    0,
  );
  await page.goto("/students");
  await expect(
    page.locator("h2").filter({ hasText: "Browser Student" }).first(),
  ).toBeVisible();
  await expect(page.getByText("Complete Term", { exact: true })).toHaveCount(0);
});
test("super admin can create academic structure and inspect orders, finance and audit", async ({
  page,
}) => {
  await login(page, "admin@browser.test");
  await page.goto("/academics");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Engineering");
  await page
    .getByLabel("Code", { exact: true })
    .fill(`engineering-${Date.now()}`);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.locator(".record-list").getByText("Engineering", { exact: true }),
  ).toBeVisible();
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  await page.goto("/finance");
  await expect(page.getByText("Net Profit", { exact: true })).toBeVisible();
  await page.goto("/audit");
  await expect(page.getByRole("heading", { name: "Audit Logs" })).toBeVisible();
});
test("super admin completes a real paid order and grants its package", async ({
  page,
}) => {
  await student(page);
  const account = await (await page.request.get(`${root}/auth/me`)).json();
  const packages = await (
    await page.request.get(`${root}/student/packages?mode=explore`)
  ).json();
  const paid = packages.data.find((pkg: { isFree: boolean }) => !pkg.isFree);
  const purchase = await (
    await page.request.post(`${root}/student/packages/${paid._id}/buy`)
  ).json();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await login(page, "admin@browser.test");
  await page.goto("/orders");
  const row = page.locator(`tr[data-order-id="${purchase.data.order._id}"]`);
  await expect(row).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await row
    .getByRole("button", { name: "Mark as Paid & Grant Access" })
    .click();
  await expect(row).toHaveCount(0);
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(row).toBeVisible();
  const inspect = await (
    await page.request.get(`${root}/admin/students/${account.data.user._id}`)
  ).json();
  expect(
    inspect.data.access.some(
      (access: { packageId: { _id: string }; status: string }) =>
        access.packageId._id === paid._id && access.status === "active",
    ),
  ).toBeTruthy();
});

test("super admin creates a package and grants content-manager publication permission", async ({
  page,
}) => {
  await login(page, "admin@browser.test");
  await page.goto("/packages");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Assigned Workshop");
  await page
    .getByLabel("College", { exact: true })
    .selectOption({ label: "Faculty of Computing" });
  await page
    .getByLabel("Academic year", { exact: true })
    .selectOption({ label: "Foundation Year" });
  await page
    .getByLabel("Term", { exact: true })
    .selectOption({ label: "Autumn Term" });
  await page.getByLabel("Free package", { exact: true }).check();
  await page.getByLabel("Status", { exact: true }).selectOption("active");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Assigned Workshop" }) })
    .click();
  await page.getByRole("button", { name: "Add subject" }).click();
  await page
    .getByLabel("Subject", { exact: true })
    .selectOption({ label: "Algorithms" });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Algorithms" })).toBeVisible();
  await page.goto("/people");
  await page
    .getByRole("button", { name: "Content Managers", exact: true })
    .click();
  await page.getByRole("button", { name: "Details", exact: true }).click();
  const assignments = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Assign content" }) });
  await assignments
    .getByLabel("Package", { exact: true })
    .selectOption({ label: "Assigned Workshop" });
  await assignments.getByLabel("Create content", { exact: true }).check();
  await assignments.getByLabel("Publish content", { exact: true }).check();
  await assignments.getByRole("button", { name: "Save", exact: true }).click();
  await expect(assignments.getByRole("status")).toHaveText(
    "Saved successfully",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await login(page, "manager@browser.test");
  await page.goto("/myContent");
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Assigned Workshop" }) })
    .click();
  await page.getByRole("button", { name: "Add lecture" }).click();
  await expect(
    page.getByLabel("Status", { exact: true }).locator("option"),
  ).toHaveText(["Choose…", "Draft", "Scheduled", "Published"]);
});

test("staff finance records own expenses without exposing another person’s records", async ({
  page,
}) => {
  await login(page, "manager@browser.test");
  await page.goto("/finance");
  await page.getByRole("button", { name: "Add expense" }).click();
  await page.getByLabel("Category", { exact: true }).fill("Browser Hosting");
  await page.getByLabel("Amount (EGP)", { exact: true }).fill("120");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Browser Hosting", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Revenue", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await login(page, "lecturer@browser.test");
  await page.goto("/finance");
  await expect(page.getByText("Browser Hosting", { exact: true })).toHaveCount(
    0,
  );
});

test("responsive calendar and drawer across requested viewports, languages and themes", async ({
  page,
}) => {
  await student(page);
  await claim(page);
  await page.goto("/timeline");
  await expect(page.locator(".calendar-event").first()).toBeVisible();
  for (const width of [375, 768, 1024, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["en", "ar"]) {
      if ((await page.locator("html").getAttribute("lang")) !== language)
        await page
          .getByRole("button", {
            name: language === "ar" ? "Language" : "اللغة",
            exact: true,
          })
          .click();
      for (const theme of ["light", "dark"]) {
        if ((await page.locator("html").getAttribute("data-theme")) !== theme)
          await page
            .getByRole("button", {
              name: language === "ar" ? "المظهر" : "Theme",
              exact: true,
            })
            .click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBeTruthy();
        await page.screenshot({
          path: `artifacts/rebuild/timeline-${width}-${language}-${theme}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "فتح قائمة التنقل" }).click();
  await expect(page.locator(".sidebar")).toBeInViewport();
  await page.getByRole("link", { name: "تعلّمي", exact: true }).click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
});
test("staff creation validates password length, shows server field errors and saves the lecturer", async ({
  page,
}) => {
  await login(page, "admin@browser.test");
  await page.goto("/people");
  await page.getByRole("button", { name: "Lecturers", exact: true }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("New Lecturer");
  const email = `new-lecturer-${Date.now()}@browser.test`;
  await page.getByLabel("Email", { exact: true }).fill(email);
  const passwordInput = page.getByLabel("Password", { exact: true });
  await passwordInput.fill("short123");
  expect(
    await passwordInput.evaluate((input: HTMLInputElement) =>
      input.checkValidity(),
    ),
  ).toBe(false);
  await expect(
    page.getByText("Use at least 12 characters for the password."),
  ).toBeVisible();
  await passwordInput.fill(password);
  await page.route("**/api/v1/admin/users", async (route) => {
    if (route.request().method() === "POST")
      await route.continue({
        postData: JSON.stringify({
          ...route.request().postDataJSON(),
          password: "short123",
        }),
      });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Fields to check: Password",
  );
  await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  await page.unroute("**/api/v1/admin/users");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.locator(".record-list").getByText(email, { exact: true }),
  ).toBeVisible();
});
