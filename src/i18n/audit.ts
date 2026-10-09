import { en, ar } from "./messages";
const actions: Record<string, [string, string]> = {
  "auth.login": ["Signed in", "تسجيل دخول"],
  "auth.password_changed": ["Password changed", "تغيير كلمة المرور"],
  "user.created": ["User created", "إنشاء مستخدم"],
  "user.updated": ["User updated", "تعديل مستخدم"],
  "user.disabled": ["User disabled", "تعطيل مستخدم"],
  "academic.created": ["Academic record created", "إنشاء سجل أكاديمي"],
  "academic.updated": ["Academic record updated", "تعديل سجل أكاديمي"],
  "package.created": ["Package created", "إنشاء باقة"],
  "package.updated": ["Package updated", "تعديل باقة"],
  "package.subject_added": ["Package subject updated", "تحديث مادة الباقة"],
  "staff.permissions_changed": [
    "Staff permissions changed",
    "تغيير صلاحيات الفريق",
  ],
  "material.created": ["Material created", "إنشاء محتوى"],
  "material.updated": ["Material updated", "تعديل محتوى"],
  "content.draft_deleted": ["Unused draft deleted", "حذف مسودة غير مستخدمة"],
  "lecture.published": ["Lecture published", "نشر محاضرة"],
  "lecture.completed": ["Lecture completed", "إكمال محاضرة"],
  "access.granted": ["Package access granted", "منح الوصول إلى باقة"],
  "access.revoked": ["Package access revoked", "إلغاء الوصول إلى باقة"],
  "student.device_reset": ["Student device reset", "إعادة تعيين جهاز الطالب"],
  "order.created": ["Order created", "إنشاء طلب"],
  "order.completed": ["Order completed", "إكمال طلب"],
  "order.cancelled": ["Order cancelled", "إلغاء طلب"],
  "expense.created": ["Expense created", "إضافة مصروف"],
  "expense.updated": ["Expense updated", "تعديل مصروف"],
  "expense.deleted": ["Expense deleted", "حذف مصروف"],
  "profile.updated": ["Profile updated", "تعديل الملف الشخصي"],
};
for (const [key, [english, arabic]] of Object.entries(actions)) {
  en[key] = english;
  ar[key] = arabic;
}
for (const change of ["created", "updated"])
  for (const status of ["draft", "scheduled", "published", "archived"]) {
    const key = `lecture.${change}.${status}`;
    en[key] =
      `${en[change === "created" ? "lectureCreated" : "lectureUpdated"]} · ${en[status]}`;
    ar[key] =
      `${ar[change === "created" ? "lectureCreated" : "lectureUpdated"]} · ${ar[status]}`;
  }
const entities: Record<string, string> = {
  staff_assignments: "assignments",
  package_subjects: "subjects",
  package_access: "studentAccess",
  lecture_progress: "progress",
  expenses: "expenseTotal",
};
for (const [key, label] of Object.entries(entities)) {
  en[key] = en[label]!;
  ar[key] = ar[label]!;
}
