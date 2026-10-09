import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Preferences } from "../i18n/context";
import { Auth, useAuth } from "../features/auth/context";
import { AuthPage } from "../features/auth/page";
import { Workspace } from "../layouts/workspace";
import { Timeline } from "../features/student/timeline";
import { StudentPackages, StudentPackage } from "../features/student/packages";
import { StudentLecture } from "../features/student/lecture";
import { StudentSubject } from "../features/student/subject";
import { Profile } from "../features/student/profile";
import { AcademicStructure } from "../features/super-admin/academics";
import { People } from "../features/super-admin/people";
import { Orders } from "../features/super-admin/orders";
import { AuditLogs } from "../features/super-admin/audit";
import { Dashboard } from "../features/shared/dashboard";
import { StaffPackages } from "../features/shared/packages";
import { ContentPackage, ContentLecture } from "../features/shared/content";
import { Accounts } from "../features/shared/finance";
import { LecturerStudents } from "../features/lecturer/students";
import type { Role } from "../types/domain";
import type { ReactNode } from "react";
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
          <Routes>
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
          </Routes>
        </BrowserRouter>
      </Auth>
    </Preferences>
  );
}
