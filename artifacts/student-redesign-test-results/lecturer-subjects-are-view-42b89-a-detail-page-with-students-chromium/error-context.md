# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lecturer.spec.ts >> subjects are view-only and open a detail page with students
- Location: tests\ui\lecturer.spec.ts:34:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/lecturer/subjects", waiting until "load"

```

# Test source

```ts
  1   | import { expect, test, type Page, type Route } from '@playwright/test';
  2   | 
  3   | /** Returns the fulfilment promise when it handles the route, or undefined to fall through to 404. */
  4   | type Handler = (route: Route, path: string) => Promise<void> | undefined;
  5   | 
  6   | const ok = (route: Route, data: unknown, status = 200) => route.fulfill({ status, json: { success: true, data } });
  7   | const subject = { id: 'sub1', code: 'CS 203', name: { en: 'Data Structures', ar: 'هياكل البيانات' } };
  8   | const student = { id: 's1', name: 'Mariam Ali', email: 'mariam@example.com', avatarUrl: null };
  9   | const row = { student, subjects: [subject], progressPercent: 50, lastActivityAt: '2026-09-26T10:00:00Z', quiz: { attempted: 1, total: 2, passed: 1, averagePercent: 90 }, assignments: { submitted: 1, total: 1 } };
  10  | const activity = { kind: 'quiz_submitted', at: '2026-09-26T10:00:00Z', student: { id: 's1', name: 'Mariam Ali' }, subject, title: { en: 'Linked lists' }, percent: 90, passed: true };
  11  | 
  12  | async function mockLecturer(page: Page, extra: Handler = () => undefined, language: 'en' | 'ar' = 'en', permissions = ['student:read', 'analytics:read', 'expense:manage']): Promise<void> {
  13  |   await page.addInitScript((lang) => {
  14  |     localStorage.setItem('endpoint.language', lang);
  15  |     localStorage.setItem('endpoint.theme', 'light');
  16  |   }, language);
  17  |   await page.route('http://localhost:4000/api/v1/**', async (route) => {
  18  |     const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
  19  |     if (path === '/auth/device') return ok(route, { initialized: true });
  20  |     if (path === '/auth/refresh') return ok(route, { accessToken: 'token' });
  21  |     if (path === '/auth/me') return ok(route, { id: 'l1', name: 'Dr. Salma Nabil', email: 'salma@endpoint.dev', roles: ['lecturer'], permissions, preferences: { language, theme: 'light' } });
  22  |     return extra(route, path) ?? route.fulfill({ status: 404, json: { success: false } });
  23  |   });
  24  | }
  25  | 
  26  | test('lecturer navigation and home use real lecturer data', async ({ page }) => {
  27  |   await mockLecturer(page, (route, path) => (path === '/lecturer/overview' ? ok(route, { subjects: 2, students: 14, averageProgress: 63, activeStudents: 9, recentActivity: [activity] }) : undefined));
  28  |   await page.goto('/lecturer');
  29  |   await expect(page.locator('.sidebar-link span')).toHaveText(['Home', 'My Subjects', 'Students', 'Analytics', 'Accounts']);
  30  |   await expect(page.locator('.stat-card strong')).toHaveText(['2', '14', '63%', '9']);
  31  |   await expect(page.locator('.activity-feed li')).toContainText('Mariam Ali submitted the quiz in · Linked lists · 90%');
  32  | });
  33  | 
  34  | test('subjects are view-only and open a detail page with students', async ({ page }) => {
  35  |   await mockLecturer(page, (route, path) => {
  36  |     if (path === '/lecturer/subjects') return ok(route, [{ ...subject, description: null, packageCount: 1, lessonCount: 8, studentCount: 14, averageProgress: 63 }]);
  37  |     if (path === '/lecturer/subjects/sub1') return ok(route, {
  38  |       subject: { ...subject, description: null, packageCount: 1, lessonCount: 8, studentCount: 1, averageProgress: 50 },
  39  |       packages: [{ id: 'p1', title: { en: 'Midterm' }, status: 'published', released: true, lessonCount: 8, studentCount: 1, averageProgress: 50 }],
  40  |       students: [row],
  41  |     });
  42  |     return undefined;
  43  |   });
> 44  |   await page.goto('/lecturer/subjects');
      |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  45  |   await expect(page.locator('main').getByRole('button')).toHaveCount(0);
  46  |   await page.locator('.manage-card', { hasText: 'Data Structures' }).click();
  47  |   await expect(page).toHaveURL(/\/lecturer\/subjects\/sub1$/);
  48  |   await expect(page.locator('main h1')).toHaveText('Data Structures');
  49  |   await expect(page.locator('.student-cell')).toHaveText(/Mariam Ali/);
  50  | });
  51  | 
  52  | test('students list links to a read-only profile with quizzes and submitted files', async ({ page }) => {
  53  |   await mockLecturer(page, (route, path) => {
  54  |     if (path === '/lecturer/students') return ok(route, [row, { ...row, student: { ...student, id: 's2', name: 'Omar Adel', email: 'omar@example.com' }, progressPercent: 0, lastActivityAt: null }]);
  55  |     if (path === '/lecturer/students/s1') return ok(route, {
  56  |       student, overallProgress: 50, lastActivityAt: '2026-09-26T10:00:00Z', quiz: row.quiz, assignments: row.assignments,
  57  |       packages: [{ packageId: 'p1', title: { en: 'Midterm' }, subject, progress: { completed: 4, total: 8, percent: 50 }, lastActivityAt: '2026-09-26T10:00:00Z' }],
  58  |       materials: [{ materialId: 'm1', title: { en: 'Linked lists' }, subject, status: 'completed', lastAccessedAt: '2026-09-26T10:00:00Z', completedAt: '2026-09-26T10:00:00Z' }],
  59  |       quizAttempts: [{ attemptId: 'a1', quizId: 'q1', materialTitle: { en: 'Linked lists' }, subject, score: 9, maxScore: 10, percent: 90, passed: true, submittedAt: '2026-09-26T10:00:00Z' }],
  60  |       submissions: [{ id: 'x1', materialId: 'm1', materialTitle: { en: 'Linked lists' }, assignmentTitle: { en: 'Homework 1' }, subject, note: 'Done early', files: [{ id: 'f1', fileName: 'homework.pdf', contentType: 'application/pdf', size: 2048 }], submittedAt: '2026-09-25T10:00:00Z', dueAt: '2026-09-28T10:00:00Z', late: false }],
  61  |       recentActivity: [activity],
  62  |     });
  63  |     return undefined;
  64  |   });
  65  |   await page.goto('/lecturer/students');
  66  |   await expect(page.locator('.manage-table tbody tr')).toHaveCount(2);
  67  |   await page.getByPlaceholder('Search by name or email').fill('omar');
  68  |   await expect(page.locator('.manage-table tbody tr')).toHaveCount(1);
  69  |   await page.getByPlaceholder('Search by name or email').fill('');
  70  |   await page.getByRole('link', { name: /Mariam Ali/ }).click();
  71  |   await expect(page).toHaveURL(/\/lecturer\/students\/s1$/);
  72  |   await expect(page.locator('main h1')).toHaveText('Mariam Ali');
  73  |   await expect(page.locator('.submission-entry')).toContainText('Homework 1');
  74  |   await expect(page.locator('.submission-entry .file-link')).toContainText('homework.pdf');
  75  |   await expect(page.locator('main table tbody tr')).toContainText(['Linked lists']);
  76  |   await expect(page.locator('main').getByRole('button', { name: /grant|revoke|edit|delete/i })).toHaveCount(0);
  77  | });
  78  | 
  79  | test('analytics renders lecturer-scoped figures', async ({ page }) => {
  80  |   const days = Array.from({ length: 14 }, (_, index) => ({ date: `2026-09-${String(14 + index).padStart(2, '0')}`, count: index % 3 }));
  81  |   await mockLecturer(page, (route, path) => (path === '/lecturer/analytics' ? ok(route, {
  82  |     summary: { subjects: 1, students: 14, activeStudents: 9, averageProgress: 63, quizAttempts: 20, averageQuizScore: 71, passRate: 80, assignmentCompletion: 55 },
  83  |     progressDistribution: [{ bucket: '0-24', count: 2 }, { bucket: '25-49', count: 3 }, { bucket: '50-74', count: 5 }, { bucket: '75-100', count: 4 }],
  84  |     activityByDay: days,
  85  |     subjects: [{ subject, students: 14, activeStudents: 9, averageProgress: 63, quizAttempts: 20, averageQuizScore: 71, passRate: 80, assignmentCompletion: 55 }],
  86  |   }) : undefined));
  87  |   await page.goto('/lecturer/analytics');
  88  |   await expect(page.locator('.stat-card strong')).toHaveText(['63%', '9 / 14', '71%', '55%']);
  89  |   await expect(page.locator('.chart-bars > div')).toHaveCount(14);
  90  |   await expect(page.locator('.distribution-list li')).toHaveCount(4);
  91  | });
  92  | 
  93  | test('lecturer Accounts uses the shared expense system', async ({ page }) => {
  94  |   await mockLecturer(page, (route, path) => (path === '/manage/expenses'
  95  |     ? ok(route, { items: [{ id: 'e1', title: 'Camera', category: 'equipment', amount: 900, currency: 'EGP', date: '2026-09-01T00:00:00Z', description: null, notes: null, receipt: null, createdBy: { id: 'l1', name: 'Dr. Salma Nabil' }, canEdit: true, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' }], total: 1, page: 1, pageSize: 25, totals: [{ currency: 'EGP', amount: 900 }] })
  96  |     : undefined));
  97  |   await page.goto('/lecturer/accounts');
  98  |   await expect(page.locator('.manage-table tbody tr')).toHaveCount(1);
  99  |   await expect(page.getByRole('button', { name: 'Edit expense: Camera' })).toBeVisible();
  100 | });
  101 | 
  102 | test('without expense or analytics permission those areas are hidden and blocked', async ({ page }) => {
  103 |   await mockLecturer(page, () => undefined, 'en', ['student:read']);
  104 |   await page.goto('/lecturer/students');
  105 |   await expect(page.locator('.sidebar-link span')).toHaveText(['Home', 'My Subjects', 'Students']);
  106 |   await page.goto('/lecturer/accounts');
  107 |   await expect(page).toHaveURL(/\/forbidden$/);
  108 | });
  109 | 
  110 | test('students page works in Arabic without horizontal overflow', async ({ page }) => {
  111 |   await page.setViewportSize({ width: 390, height: 844 });
  112 |   await mockLecturer(page, (route, path) => (path === '/lecturer/students' ? ok(route, [row]) : undefined), 'ar');
  113 |   await page.goto('/lecturer/students');
  114 |   await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  115 |   await expect(page.locator('.manage-table tbody tr')).toHaveCount(1);
  116 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  117 | });
  118 | 
```