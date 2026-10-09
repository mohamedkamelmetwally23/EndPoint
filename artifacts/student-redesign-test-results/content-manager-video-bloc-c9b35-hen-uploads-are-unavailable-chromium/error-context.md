# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: content-manager.spec.ts >> video block accepts a Bunny URL without upload controls when uploads are unavailable
- Location: tests\ui\content-manager.spec.ts:216:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Material title (English)')
    2 × waiting for "http://127.0.0.1:4173/content/courses/p1/subjects/s1/weeks/w1/materials/new" navigation to finish...
      - navigated to "http://127.0.0.1:4173/content/courses/p1/subjects/s1/weeks/w1/materials/new"

```

# Test source

```ts
  128 | });
  129 | 
  130 | test('Open previews blocks while Edit starts with block forms collapsed', async ({ page }) => {
  131 |   const material = { id: 'm1', title: { en: 'Lecture 1' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [{ id: 'b1', kind: 'text', title: null, body: { en: 'Read chapter 3.' } }] };
  132 |   await mockStaff(page, all, (route, path) => {
  133 |     if (path === '/manage/materials/m1') return ok(route, material);
  134 |     if (path === '/manage/packages/p1/subjects/s1/outline') return ok(route, outline);
  135 |     return undefined;
  136 |   });
  137 |   await page.goto('/content/materials/m1/view');
  138 |   await expect(page.getByText('Read chapter 3.')).toBeVisible();
  139 |   await page.getByRole('link', { name: 'Edit' }).click();
  140 |   await expect(page.locator('.block-card')).toHaveCount(1);
  141 |   await expect(page.locator('.block-card__toggle')).toHaveAttribute('aria-expanded', 'false');
  142 |   await expect(page.getByLabel('Text (English)')).toHaveCount(0);
  143 |   await page.locator('.block-card__toggle').click();
  144 |   await expect(page.getByLabel('Text (English)')).toBeVisible();
  145 | });
  146 | 
  147 | test('Add New Content from an existing material uses a page and preserves its blocks', async ({ page }) => {
  148 |   const material = { id: 'm1', title: { en: 'Lecture 1' }, status: 'draft', scheduledAt: null, publishedAt: null, updatedAt: '2026-09-01T00:00:00Z', weekId: 'w1', packageId: 'p1', subjectId: 's1', blocks: [{ id: 'b1', kind: 'text', title: null, body: { en: 'Read chapter 3.' } }] };
  149 |   let saved: { blocks?: { kind: string }[] } | null = null;
  150 |   await mockStaff(page, all, (route, path) => {
  151 |     if (path === '/manage/materials/m1' && route.request().method() === 'PUT') { saved = route.request().postDataJSON() as typeof saved; return ok(route, material); }
  152 |     if (path === '/manage/materials/m1') return ok(route, material);
  153 |     if (path === '/manage/packages/p1/subjects/s1/outline') return ok(route, outline);
  154 |     return undefined;
  155 |   });
  156 |   await page.goto('/content/materials/m1/view');
  157 |   await page.getByRole('link', { name: 'Add New Content' }).click();
  158 |   await expect(page).toHaveURL(/\/content\/materials\/m1\/content\/new$/);
  159 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  160 |   await expect(page.locator('.block-card')).toHaveCount(0);
  161 |   await page.locator('.add-block__item', { hasText: 'External link' }).click();
  162 |   await page.locator('input[type="url"]').fill('https://example.com/reading');
  163 |   await page.getByRole('button', { name: 'Save Draft' }).click();
  164 |   await expect(page).toHaveURL(/\/content\/materials\/m1\/view$/);
  165 |   expect(saved?.blocks?.map((block) => block.kind)).toEqual(['text', 'link']);
  166 | });
  167 | 
  168 | test('Accounts is hidden and blocked without expense permission', async ({ page }) => {
  169 |   await mockStaff(page, ['content:update']);
  170 |   await page.goto('/content');
  171 |   await expect(page.locator('.sidebar-link span')).toHaveText(['Home', 'Content', 'Packages']);
  172 |   await page.goto('/content/accounts');
  173 |   await expect(page).toHaveURL(/\/forbidden$/);
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
> 228 |   await page.getByLabel('Material title (English)').fill('Video lesson');
      |                                                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  274 |   await page.getByLabel('Material title (English)').fill('Outline');
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
```