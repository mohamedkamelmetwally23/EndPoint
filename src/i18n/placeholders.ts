type Translate = (key: string) => string;

const examples: Record<string, [string, string]> = {
  summaryUrl: ["https://example.com/summary.pdf", "https://example.com/summary.pdf"],
  youtubeUrl: ["https://www.youtube.com/watch?v=...", "https://www.youtube.com/watch?v=..."],
  yearCount: ["e.g. 4 or 5", "مثال: 4 أو 5"],
  email: ["e.g. name@example.com", "مثال: name@example.com"],
  fullName: ["Enter your full name", "اكتب اسمك بالكامل"],
  phone: ["e.g. 01012345678", "مثال: 01012345678"],
  password: ["Enter your password", "اكتب كلمة المرور"],
  currentPassword: ["Enter your current password", "اكتب كلمة المرور الحالية"],
  confirmPassword: ["Re-enter your password", "اكتب كلمة المرور مرة أخرى"],
  newPassword: ["Enter a new password (at least 12 characters)", "اكتب كلمة مرور جديدة (12 حرفًا على الأقل)"],
  name: ["Enter a name", "اكتب الاسم"],
  title: ["Enter a title", "اكتب العنوان"],
  description: ["Write a brief description", "اكتب وصفًا مختصرًا"],
  body: ["Write the content here", "اكتب المحتوى هنا"],
  notes: ["Write any additional notes", "اكتب أي ملاحظات إضافية"],
  price: ["e.g. 250", "مثال: 250"],
  amount: ["e.g. 100", "مثال: 100"],
  order: ["e.g. 1", "مثال: 1"],
  duration: ["e.g. 45 minutes", "مثال: 45 دقيقة"],
  url: ["https://example.com/content", "https://example.com/content"],
  coverUrl: ["https://example.com/cover.jpg", "https://example.com/cover.jpg"],
  receiptUrl: ["https://example.com/receipt.pdf", "https://example.com/receipt.pdf"],
};

export function fieldPlaceholder(key: string, language: string, t: Translate) {
  const example = examples[key];
  return example
    ? example[language === "ar" ? 1 : 0]
    : `${language === "ar" ? "أدخل" : "Enter"} ${t(key)}`;
}
