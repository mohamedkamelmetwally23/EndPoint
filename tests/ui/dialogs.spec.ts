import { test, expect } from "@playwright/test";
test("create and edit dialogs trap focus, close with Escape and fit mobile RTL dark mode", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin@browser.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Browser-test-password!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".sidebar")).toBeVisible();
  await page.goto("/people");
  await page.getByRole("button", { name: "Lecturers", exact: true }).click();
  const create = page.getByRole("button", { name: "Create", exact: true });
  await create.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Full name", { exact: true })).toBeFocused();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBeTruthy();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(create).toBeFocused();
  await page
    .getByRole("button", { name: "Details", exact: true })
    .first()
    .click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Full name", { exact: true })).toHaveValue(
    "Lecturer",
  );
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "Language", exact: true }).click();
  await page.getByRole("button", { name: "المظهر", exact: true }).click();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "إنشاء", exact: true }).click();
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  expect(bounds!.height).toBeLessThanOrEqual(812);
  await page.screenshot({
    path: "artifacts/rebuild/create-dialog-375-ar-dark.png",
    fullPage: true,
  });
  await dialog.getByRole("button", { name: "إغلاق", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});
