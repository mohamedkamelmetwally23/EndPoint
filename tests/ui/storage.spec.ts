import { test, expect, type Page } from "@playwright/test";

const pdf = Buffer.from("%PDF-1.7\nexample storage test\n%%EOF");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD1sAAAAASUVORK5CYII=","base64");
async function login(page: Page, email = "admin@browser.test") {
  await page.setExtraHTTPHeaders({ "X-Forwarded-For": `192.0.2.${Math.floor(Math.random()*250)+1}` });
  await page.goto("/login");
  await page.getByLabel("Email",{exact:true}).fill(email);
  await page.getByLabel("Password",{exact:true}).fill("Browser-test-password!");
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page.locator(".sidebar")).toBeVisible();
}
async function blobTransport(page: Page) {
  await page.route("https://browsertest.public.blob.vercel-storage.com/**",async route => {
    const pathname = new URL(route.request().url()).pathname.slice(1);
    const response = await page.request.get(`http://127.0.0.1:4001/__test/blob?pathname=${encodeURIComponent(pathname)}`);
    await route.fulfill({status:200,contentType:"image/png",body:await response.body()});
  });
  await page.route("https://vercel.com/api/blob**",async route => {
    const req = route.request();
    const pathname = new URL(req.url()).searchParams.get("pathname");
    const response = await page.request.post(`http://127.0.0.1:4001/__test/blob?pathname=${encodeURIComponent(pathname || "")}`, {
      data: req.postDataBuffer()!, headers: { "content-type": req.headers()["x-content-type"] || req.headers()["content-type"] || "application/pdf" },
    });
    await route.fulfill({status:200,contentType:"application/json",body:await response.text()});
  });
}
async function editLecture(page: Page) {
  const packages = await (await page.request.get("/api/v1/staff/packages")).json();
  const pkg = packages.data.find((p: {name:string}) => p.name === "Open Learning");
  const detail = await (await page.request.get(`/api/v1/staff/packages/${pkg._id}`)).json();
  const lecture = detail.data.lectures[0];
  await page.goto(`/content/packages/${pkg._id}`);
  await page.locator(".content-subject-heading").first().click();
  await page.locator(".content-lecture-card").filter({hasText:lecture.title}).getByRole("button",{name:"Edit",exact:true}).click();
  return lecture;
}
test("PDF uploads, saves, survives refresh and opens through protected API",async ({page}) => {
  await login(page); await blobTransport(page);
  const lecture = await editLecture(page);
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[type="file"]').setInputFiles({name:"summary.pdf",mimeType:"application/pdf",buffer:pdf});
  const link = dialog.getByRole("link",{name:"summary.pdf"});
  await expect(link).toHaveAttribute("href",/^\/api\/v1\/files\/[a-f\d]{24}\.pdf$/);
  const reference = await link.getAttribute("href");
  await dialog.getByRole("button",{name:"Save",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  const detail = await (await page.request.get(`/api/v1/staff/lectures/${lecture._id}`)).json();
  expect(detail.data.lecture.summaryUrl).toBe(reference);
  const download = await page.request.get(reference!);
  expect(download.status()).toBe(200); expect(await download.body()).toEqual(pdf);
  const anonymous = await page.context().browser()!.newContext();
  const denied = await anonymous.request.get(`http://127.0.0.1:4175${reference}`);
  expect(denied.status()).toBe(401); await anonymous.close();
});
test("image upload stores a public cover reference that renders after refresh",async ({page}) => {
  await login(page); await blobTransport(page);
  const packages = await (await page.request.get("/api/v1/staff/packages")).json();
  const pkg = packages.data.find((p: {name:string}) => p.name === "Open Learning");
  await page.goto(`/content/packages/${pkg._id}`);
  await page.getByRole("button",{name:"Edit",exact:true}).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[type="file"]').setInputFiles({name:"cover.png",mimeType:"image/png",buffer:png});
  await expect(dialog.locator(".receipt-preview")).toHaveAttribute("src",/^https:\/\/browsertest.public.blob.vercel-storage.com\//);
  await expect(dialog.locator(".receipt-preview")).toHaveJSProperty("naturalWidth",1);
  const src = await dialog.locator(".receipt-preview").getAttribute("src");
  expect(src).not.toMatch(/^blob:|^data:/);
  await dialog.getByRole("button",{name:"Save",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await page.goto("/packages"); await page.reload();
  await expect(page.locator(`img[src="${src}"]`)).toHaveJSProperty("naturalWidth",1);

});
test("staff expense receipts are saved as base64 and visible to the super admin", async ({ page }) => {
  test.setTimeout(90000);
  for (const email of ["manager@browser.test", "lecturer@browser.test"]) {
    await login(page, email);
    await page.goto("/finance");
    await page.getByRole("button", { name: "Add expense", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Category", { exact: true }).fill(email);
    await dialog.locator('input[name="amount"]').fill("15");
    await dialog.locator('input[type="file"]').setInputFiles({ name: "receipt.png", mimeType: "image/png", buffer: png });
    await expect(dialog.locator(".receipt-preview")).toHaveAttribute("src", /^data:image\/png;base64,/);
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
  }
  await login(page);
  await page.goto("/finance");
  for (const email of ["manager@browser.test", "lecturer@browser.test"]) {
    const row = page.getByRole("row").filter({ hasText: email });
    await row.getByRole("button", { name: "View receipt image" }).click();
    await expect(page.getByRole("dialog").getByRole("img")).toHaveAttribute("src", `data:image/png;base64,${png.toString("base64")}`);
    await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  }
});

test("upload completion failure shows an error without replacing the current file",async ({page}) => {
  await login(page); await blobTransport(page); await editLecture(page);
  await page.route("**/api/v1/files/*/complete",route => route.fulfill({status:503,json:{error:{code:"FILE_UPLOAD_FAILED"}}}));
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[type="file"]').setInputFiles({name:"failed.pdf",mimeType:"application/pdf",buffer:pdf});
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(dialog.getByRole("link",{name:"failed.pdf"})).toHaveCount(0);
  await expect(dialog.getByRole("button",{name:"Save",exact:true})).toBeEnabled();
});
