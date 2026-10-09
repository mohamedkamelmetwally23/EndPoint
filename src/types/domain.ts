export type Role = "super_admin" | "content_manager" | "lecturer" | "student";
export type Ref = { _id: string; name: string };
export type User = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: string;
  collegeId?: string | Ref;
  academicYearId?: string | Ref;
};
export type Academic = Ref & {
  termId?: string;
  collegeId?: string;
  academicYearId?: string;
  status: string;
  order?: number;
  localOrder?: number;
  description?: string;
};
export type Academics = {
  colleges: Academic[];
  academic_years: Academic[];
  terms: Academic[];
  subjects: Academic[];
};
export type Subject = {
  _id: string;
  packageId: string;
  subjectId: Ref & { description?: string };
  order: number;
  status: string;
  lecturers?: User[];
};
export type Package = Ref & {
  description: string;
  collegeId: string;
  academicYearId: string;
  termId: string;
  price: number;
  isFree: boolean;
  coverUrl?: string;
  status: string;
  subjects?: Subject[];
  progress?: { completed: number; total: number };
};
export type Lecture = {
  _id: string;
  packageSubjectId: string;
  title: string;
  description: string;
  order: number;
  duration?: number;
  youtubeUrl?: string;
  summaryUrl?: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  completed?: boolean;
  context?: Subject & { packageId: Ref };
};
export type Material = {
  _id: string;
  lectureId: string;
  type: "youtube" | "pdf" | "image" | "text";
  title: string;
  url?: string;
  body?: string;
  order: number;
};
export type Assignment = {
  _id: string;
  userId: string;
  scopeType: string;
  packageId: string;
  packageSubjectId?: string;
  permissions: string[];
  active: boolean;
};
export type PackageDetail = {
  orderStatus?: "pending" | "completed" | "cancelled" | null;
  package: Package;
  subjects: Subject[];
  lectures: Lecture[];
  permissions:
    | string[]
    | { scopeType: string; packageSubjectId?: string; permissions: string[] }[];
};
export type LectureDetail = {
  lecture: Lecture;
  subject: Subject;
  package: Ref;
  materials: Material[];
  completed: boolean;
};
export type Expense = {
  _id: string;
  createdBy: User;
  category: string;
  amount: number;
  currency: string;
  date: string;
  notes: string;
  receiptUrl?: string;
  receiptImage?: string;
};
export type Breakdown = { _id: string; amount: number; name?: string };
export type Finance = {
  expenses: Expense[];
  expenseTotal: number;
  revenue?: number;
  netProfit?: number;
  byCategory?: Breakdown[];
  byPerson?: Breakdown[];
  monthlyExpenses?: Breakdown[];
  monthlyRevenue?: Breakdown[];
};
export type Audit = {
  _id: string;
  actor?: User;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
};
export type Order = {
  receiptImage?: string;
  _id: string;
  studentId: User;
  packageId: Ref;
  priceSnapshot: number;
  status: string;
  createdAt: string;
};
export type StudentReport = {
  student: User;
  package: Ref;
  packageSubjectId: string;
  completed: number;
  total: number;
  lastActivity?: string;
  lectures: { _id: string; title: string; completed: boolean }[];
};
