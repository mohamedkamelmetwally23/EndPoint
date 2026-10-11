import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Preferences } from "../i18n/context";
import { Auth, useAuth } from "../features/auth/context";
import { Workspace } from "../layouts/workspace";
import type { Role } from "../types/domain";
import type { ReactNode } from "react";
const AuthPage = lazy(() => import("../features/auth/page").then(module => ({ default: module.AuthPage })));
const Timeline = lazy(() => import("../features/student/timeline").then(module => ({ default: module.Timeline })));
const StudentPackages = lazy(() => import("../features/student/packages").then(module => ({ default: module.StudentPackages })));
const StudentPackage = lazy(() => import("../features/student/packages").then(module => ({ default: module.StudentPackage })));
const StudentLecture = lazy(() => import("../features/student/lecture").then(module => ({ default: module.StudentLecture })));
const StudentSubject = lazy(() => import("../features/student/subject").then(module => ({ default: module.StudentSubject })));
const Profile = lazy(() => import("../features/student/profile").then(module => ({ default: module.Profile })));
const AcademicStructure = lazy(() => import("../features/super-admin/academics").then(module => ({ default: module.AcademicStructure })));
const People = lazy(() => import("../features/super-admin/people").then(module => ({ default: module.People })));
const Orders = lazy(() => import("../features/super-admin/orders").then(module => ({ default: module.Orders })));
const AuditLogs = lazy(() => import("../features/super-admin/audit").then(module => ({ default: module.AuditLogs })));
const Dashboard = lazy(() => import("../features/shared/dashboard").then(module => ({ default: module.Dashboard })));
const StaffPackages = lazy(() => import("../features/shared/packages").then(module => ({ default: module.StaffPackages })));
const ContentPackage = lazy(() => import("../features/shared/content").then(module => ({ default: module.ContentPackage })));
const ContentLecture = lazy(() => import("../features/shared/content").then(module => ({ default: module.ContentLecture })));
const Accounts = lazy(() => import("../features/shared/finance").then(module => ({ default: module.Accounts })));
const LecturerStudents = lazy(() => import("../features/lecturer/students").then(module => ({ default: module.LecturerStudents })));
function Landing() {
  const { account } = useAuth();
  return (
    <Navigate
      to={
        account?.user.role === "student"
          ? "/timeline"
          : account?.user.role === "super_admin"
            ? "/dashboard"
            : "/home"
      }
      replace
    />
  );
}
function Guard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { account } = useAuth();
  return account && roles.includes(account.user.role) ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}
const staff: Role[] = ["super_admin", "content_manager", "lecturer"];
export function App() {
  return (
    <Preferences>
      <Auth>
        <BrowserRouter>
          <Suspense fallback={<div role="status" aria-label="Loading" />}><Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage register />} />
            <Route element={<Workspace />}>
              <Route index element={<Landing />} />
              <Route
                path="timeline"
                element={
                  <Guard roles={["student"]}>
                    <Timeline />
                  </Guard>
                }
              />
              <Route
                path="learning"
                element={
                  <Guard roles={["student"]}>
                    <StudentPackages />
                  </Guard>
                }
              />
              <Route
                path="explore"
                element={
                  <Guard roles={["student"]}>
                    <StudentPackages explore />
                  </Guard>
                }
              />
              <Route
                path="student/packages/:id"
                element={
                  <Guard roles={["student"]}>
                    <StudentPackage />
                  </Guard>
                }
              />
              <Route
                path="student/lectures/:id"
                element={
                  <Guard roles={["student"]}>
                    <StudentLecture />
                  </Guard>
                }
              />
              <Route
                path="student/packages/:id/subjects/:subjectId"
                element={
                  <Guard roles={["student"]}>
                    <StudentSubject />
                  </Guard>
                }
              />
              <Route path="profile" element={<Profile />} />
              <Route
                path="dashboard"
                element={
                  <Guard roles={["super_admin"]}>
                    <Dashboard />
                  </Guard>
                }
              />
              <Route
                path="home"
                element={
                  <Guard roles={staff}>
                    <Dashboard />
                  </Guard>
                }
              />
              <Route
                path="academics"
                element={
                  <Guard roles={["super_admin"]}>
                    <AcademicStructure />
                  </Guard>
                }
              />
              <Route
                path="packages"
                element={
                  <Guard roles={["super_admin"]}>
                    <StaffPackages />
                  </Guard>
                }
              />
              <Route
                path="myContent"
                element={
                  <Guard roles={staff}>
                    <StaffPackages />
                  </Guard>
                }
              />
              <Route
                path="content/packages/:id"
                element={
                  <Guard roles={staff}>
                    <ContentPackage />
                  </Guard>
                }
              />
              <Route
                path="content/lectures/:id"
                element={
                  <Guard roles={staff}>
                    <ContentLecture />
                  </Guard>
                }
              />
              <Route
                path="people"
                element={
                  <Guard roles={["super_admin"]}>
                    <People />
                  </Guard>
                }
              />
              <Route
                path="orders"
                element={
                  <Guard roles={["super_admin"]}>
                    <Orders />
                  </Guard>
                }
              />
              <Route
                path="audit"
                element={
                  <Guard roles={["super_admin"]}>
                    <AuditLogs />
                  </Guard>
                }
              />
              <Route
                path="finance"
                element={
                  <Guard roles={staff}>
                    <Accounts />
                  </Guard>
                }
              />
              <Route
                path="students"
                element={
                  <Guard roles={["lecturer"]}>
                    <LecturerStudents />
                  </Guard>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes></Suspense>
        </BrowserRouter>
      </Auth>
    </Preferences>
  );
}
