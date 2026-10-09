# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: content-manager.spec.ts >> a material can be saved as a draft before adding blocks
- Location: tests\ui\content-manager.spec.ts:262:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Material title (English)')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Endpoint home" [ref=e6] [cursor=pointer]:
      - /url: /
      - img "End Point." [ref=e7]
    - generic [ref=e8]: Content studio
    - navigation "Menu" [ref=e9]:
      - link "Home" [ref=e10] [cursor=pointer]:
        - /url: /content
      - link "Content" [ref=e15] [cursor=pointer]:
        - /url: /content/courses
      - link "Packages" [ref=e20] [cursor=pointer]:
        - /url: /content/packages
      - link "Accounts" [ref=e32] [cursor=pointer]:
        - /url: /content/accounts
    - generic [ref=e36]:
      - generic [aria-hidden] [ref=e37]: "N"
      - generic [ref=e38]:
        - strong [ref=e39]: Nour Hassan
        - generic [ref=e40]: nour@endpoint.dev
      - button "Sign out" [ref=e41] [cursor=pointer]
  - generic [ref=e45]:
    - banner [ref=e46]:
      - searchbox [ref=e51]
      - generic [ref=e52]:
        - group "Display preferences" [ref=e53]:
          - 'button "Language: العربية" [ref=e54] [cursor=pointer]':
            - generic [ref=e55]: ع
          - 'button "Theme: Light" [ref=e56] [cursor=pointer]'
        - button "Notifications" [ref=e63] [cursor=pointer]
    - main [ref=e68]:
      - generic [ref=e69]:
        - link "Cancel" [ref=e70] [cursor=pointer]:
          - /url: /content/courses/p1/subjects/s1/weeks/w1
        - generic [ref=e74]:
          - text: hierarchy.material
          - heading "Add New Content" [level=1] [ref=e75]
          - paragraph [ref=e76]: Midterm Package · Subject · Linked lists
        - generic [ref=e78]:
          - generic [ref=e79]:
            - heading "Add a block" [level=3] [ref=e81]
            - generic [ref=e82]:
              - generic [ref=e83]: Add a block
              - generic [ref=e84]:
                - button "Video" [ref=e85]
                - button "Audio" [ref=e89]
                - button "PDF / file" [ref=e94]
                - button "Summary" [ref=e99]
                - button "Quiz" [ref=e103]
                - button "Homework" [ref=e108]
                - button "External link" [ref=e113]
                - button "Text" [ref=e118]
            - paragraph [ref=e121]: No content added yet.
          - generic [ref=e126]:
            - generic [ref=e127]: Status
            - combobox "Status" [ref=e128]:
              - option "Draft" [selected]
              - option "Published"
              - option "Scheduled"
              - option "Archived"
          - generic [ref=e130]:
            - button "Cancel" [ref=e131] [cursor=pointer]
            - button "Save Draft" [ref=e132] [cursor=pointer]
            - button "Publish" [disabled]
```

# Test source

```ts
  174 | });
  175 | 
  176 | test('material editor saves any combination of optional blocks to an existing week', async ({ page }) => {
  177 |   let saved: Record<string, unknown> | null = null;
  178 |   await mockStaff(page, all, (route, path) => {
  179 |     if (path === '/manage/packages/p1/subjects/s1/outline') return ok(route, outline);
  180 |     if (path === '/manage/materials' && route.request().method() === 'POST') {
  181 |       saved = route.request().postDataJSON() as Record<string, unknown>;
  182 |       return ok(route, { id: 'm1', title: { en: 'Session 1' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [] }, 201);
  183 |     }
  184 |     if (path === '/manage/materials/m1') return ok(route, { id: 'm1', title: { en: 'Session 1' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [] });
  185 |     return undefined;
  186 |   });
  187 |   await page.goto('/content/courses/p1/subjects/s1/weeks/w1/materials/new');
  188 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  189 |   await expect(page.locator('.cm-editor-step')).toHaveCount(0);
  190 |   await expect(page.locator('.cm-material-section')).toHaveCount(2);
  191 |   await page.getByLabel('Material title (English)').fill('Session 1');
  192 |   await expect(page.locator('.add-block__item')).toHaveCount(8);
  193 |   await expect(page.locator('.block-card')).toHaveCount(0);
  194 |   await expect(page.getByLabel('Week')).toHaveCount(0);
  195 |   await expect(page.getByRole('button', { name: 'Publish' })).toBeDisabled();
  196 | 
  197 |   await page.locator('.add-block__item', { hasText: 'Text' }).click();
  198 |   await page.getByLabel('Text (English)').fill('Read chapter 3.');
  199 |   await page.locator('.add-block__item', { hasText: 'External link' }).click();
  200 |   await page.locator('input[type="url"]').fill('https://example.com/reading');
  201 |   await page.locator('.add-block__item', { hasText: 'Quiz' }).click();
  202 |   await page.locator('.cm-quiz-question__toggle').click();
  203 |   await page.getByLabel('Question (English)').fill('2 + 2?');
  204 |   await page.getByLabel('Answer 1 (English)').fill('4');
  205 |   await page.getByLabel('Answer 2 (English)').fill('5');
  206 |   await page.locator('.block-card').last().locator('.block-card__actions').getByRole('button', { name: 'Move up' }).click();
  207 |   await page.getByRole('button', { name: 'Publish' }).click();
  208 |   await expect(page).toHaveURL(/\/content\/courses\/p1\/subjects\/s1\/weeks\/w1$/);
  209 | 
  210 |   expect(saved).toMatchObject({ title: { en: 'Session 1' }, weekId: 'w1', status: 'published' });
  211 |   const blocks = (saved as unknown as { blocks: { kind: string }[] }).blocks;
  212 |   expect(blocks.map((block) => block.kind)).toEqual(['text', 'quiz', 'link']);
  213 |   expect(blocks[1]).toMatchObject({ quiz: { questions: [{ type: 'mcq', options: [{ text: { en: '4' }, isCorrect: true }, { text: { en: '5' }, isCorrect: false }] }] } });
  214 | });
  215 | 
  216 | test('video block accepts a Bunny URL without upload controls when uploads are unavailable', async ({ page }) => {
  217 |   let saved: { blocks?: { kind: string; videoId?: string }[] } | null = null;
  218 |   await mockStaff(page, all, (route, path) => {
  219 |     if (path === '/manage/packages/p1/subjects/s1/outline') return ok(route, outline);
  220 |     if (path === '/manage/videos/config') return ok(route, { enabled: false });
  221 |     if (path === '/manage/materials' && route.request().method() === 'POST') {
  222 |       saved = route.request().postDataJSON() as typeof saved;
  223 |       return ok(route, { id: 'm3', title: { en: 'Video lesson' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [] }, 201);
  224 |     }
  225 |     return undefined;
  226 |   });
  227 |   await page.goto('/content/courses/p1/subjects/s1/weeks/w1/materials/new');
  228 |   await page.getByLabel('Material title (English)').fill('Video lesson');
  229 |   await page.locator('.add-block__item', { hasText: 'Video' }).click();
  230 |   await page.getByLabel('Video URL or ID').fill('https://iframe.mediadelivery.net/embed/1234/abc-123');
  231 |   await expect(page.getByRole('button', { name: 'Upload video' })).toHaveCount(0);
  232 |   await page.getByRole('button', { name: 'Save Draft' }).click();
  233 |   await expect(page).toHaveURL(/\/content\/courses\/p1\/subjects\/s1\/weeks\/w1$/);
  234 |   expect(saved?.blocks?.[0]).toMatchObject({ kind: 'video', videoId: 'abc-123' });
  235 | });
  236 | 
  237 | test('quiz keeps a long question list compact and edits one question at a time', async ({ page }) => {
  238 |   await mockStaff(page, all, (route, path) => path === '/manage/packages/p1/subjects/s1/outline' ? ok(route, outline) : undefined);
  239 |   await page.goto('/content/courses/p1/subjects/s1/weeks/w1/materials/new');
  240 |   await page.locator('.add-block__item', { hasText: 'Quiz' }).click();
  241 |   await expect(page.locator('.cm-quiz-question')).toHaveCount(1);
  242 |   await expect(page.locator('.question-card')).toHaveCount(0);
  243 |   for (let index = 0; index < 19; index++) {
  244 |     await page.getByRole('button', { name: 'Add Question' }).click();
  245 |     await page.locator('.quiz-builder__type-menu').getByRole('button', { name: 'Multiple choice' }).click();
  246 |   }
  247 |   await expect(page.locator('.cm-quiz-question')).toHaveCount(20);
  248 |   await expect(page.locator('.question-card')).toHaveCount(1);
  249 |   await page.locator('.cm-quiz-question').last().getByRole('button', { name: 'More actions' }).click();
  250 |   await page.getByRole('button', { name: 'Change to True / False' }).click();
  251 |   await expect(page.getByLabel('Answer 1 (English)')).toHaveCount(0);
  252 |   await page.getByRole('button', { name: 'Done' }).click();
  253 |   await expect(page.locator('.question-card')).toHaveCount(0);
  254 |   await expect(page.locator('.option-row')).toHaveCount(0);
  255 |   await expect(page.getByText('Advanced settings')).toBeVisible();
  256 |   await page.locator('.cm-quiz-question__toggle').first().click();
  257 |   await expect(page.locator('.question-card')).toHaveCount(1);
  258 |   await page.setViewportSize({ width: 390, height: 780 });
  259 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  260 | });
  261 | 
  262 | test('a material can be saved as a draft before adding blocks', async ({ page }) => {
  263 |   let saved: Record<string, unknown> | null = null;
  264 |   await mockStaff(page, all, (route, path) => {
  265 |     if (path === '/manage/packages/p1/subjects/s1/outline') return ok(route, outline);
  266 |     if (path === '/manage/materials' && route.request().method() === 'POST') {
  267 |       saved = route.request().postDataJSON() as Record<string, unknown>;
  268 |       return ok(route, { id: 'm2', title: { en: 'Outline' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [] }, 201);
  269 |     }
  270 |     if (path === '/manage/materials/m2') return ok(route, { id: 'm2', title: { en: 'Outline' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [] });
  271 |     return undefined;
  272 |   });
  273 |   await page.goto('/content/courses/p1/subjects/s1/weeks/w1/materials/new');
> 274 |   await page.getByLabel('Material title (English)').fill('Outline');
      |                                                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  275 |   await page.getByRole('button', { name: 'Save Draft' }).click();
  276 |   await expect(page).toHaveURL(/\/content\/courses\/p1\/subjects\/s1\/weeks\/w1$/);
  277 |   expect(saved).toMatchObject({ title: { en: 'Outline' }, weekId: 'w1', status: 'draft', blocks: [] });
  278 | });
  279 | 
  280 | test('accounts shows every expense but only the author gets edit controls', async ({ page }) => {
  281 |   const expense = (id: string, title: string, canEdit: boolean) => ({ id, title, category: 'software', amount: 100, currency: 'EGP', date: '2026-09-01T00:00:00Z', description: null, notes: null, receipt: null, createdBy: { id: canEdit ? 'u1' : 'u2', name: canEdit ? 'Nour Hassan' : 'Omar Adel' }, canEdit, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' });
  282 |   await mockStaff(page, all, (route, path) => (path === '/manage/expenses'
  283 |     ? ok(route, { items: [expense('e1', 'Figma', true), expense('e2', 'Hosting', false)], total: 2, page: 1, pageSize: 25, totals: [{ currency: 'EGP', amount: 200 }] })
  284 |     : undefined));
  285 |   await page.goto('/content/accounts');
  286 |   await expect(page.locator('.manage-table tbody tr')).toHaveCount(2);
  287 |   await expect(page.getByRole('button', { name: 'Edit expense: Figma' })).toBeVisible();
  288 |   await expect(page.getByRole('button', { name: 'Edit expense: Hosting' })).toHaveCount(0);
  289 |   await expect(page.locator('.cm-account-summary strong').nth(1)).toContainText('200');
  290 | });
  291 | 
  292 | test('course page lays out correctly in Arabic', async ({ page }) => {
  293 |   await mockStaff(page, all, (route, path) => {
  294 |     if (path === '/manage/packages/p1') return ok(route, pkg);
  295 |     if (path === '/manage/packages/p1/subjects') return ok(route, subjects);
  296 |     if (path === '/manage/courses') return ok(route, []);
  297 |     return undefined;
  298 |   }, 'ar');
  299 |   await page.goto('/content/courses/p1');
  300 |   await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  301 |   await expect(page.getByRole('link', { name: /Programming/ })).toBeVisible();
  302 |   await expect(page.getByText('Linked lists')).toHaveCount(0);
  303 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  304 | });
  305 | 
  306 | test('content manager content creation page adapts to dark mobile layout', async ({ page }) => {
  307 |   await mockStaff(page, all, (route, path) => {
  308 |     if (path === '/manage/packages/p1/subjects/s1/outline') return ok(route, outline);
  309 |     return undefined;
  310 |   }, 'en', 'dark');
  311 |   await page.setViewportSize({ width: 390, height: 780 });
  312 |   await page.goto('/content/courses/p1/subjects/s1/weeks/w1/materials/new');
  313 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  314 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  315 |   await expect(page.locator('.add-block__item')).toHaveCount(8);
  316 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  317 |   await page.getByRole('button', { name: 'Cancel' }).click();
  318 |   await expect(page).toHaveURL(/\/content\/courses\/p1\/subjects\/s1\/weeks\/w1$/);
  319 | });
  320 | 
  321 | test('package form stays compact in a modal on desktop and mobile', async ({ page }) => {
  322 |   await mockStaff(page, all, (route, path) => path === '/manage/packages' ? ok(route, [pkg]) : undefined);
  323 |   await page.setViewportSize({ width: 1280, height: 720 });
  324 |   await page.goto('/content/packages');
  325 |   await page.getByRole('button', { name: 'Edit package' }).click();
  326 |   const modal = page.getByRole('dialog');
  327 |   await expect(modal).toBeVisible();
  328 |   await expect(modal.locator('.form-section')).toHaveCount(2);
  329 |   await expect(modal.getByLabel('Price')).toBeVisible();
  330 |   expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
  331 |   await page.setViewportSize({ width: 390, height: 780 });
  332 |   await expect(modal).toBeVisible();
  333 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  334 |   const priceWidth = await modal.getByLabel('Price').evaluate((input) => input.getBoundingClientRect().width);
  335 |   expect(priceWidth).toBeGreaterThan(250);
  336 | });
  337 | 
```