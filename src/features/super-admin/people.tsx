import { ActionLabel } from "../../components/action-label";
import { useState } from "react";
import { Dialog } from "../../components/dialog";
import { useResource } from "../../hooks/use-resource";
import { useAdminAcademics } from "../../hooks/use-admin-academics";
import { api } from "../../services/api";
import { Page, State, Badge, Action } from "../../components/ui";
import { Form, type Values } from "../../components/form";
import { useI18n } from "../../i18n/context";
import type { User, Package, Ref } from "../../types/domain";
import { Assignments } from "./assignments";
type Inspection = {
  user: User;
  access: { _id: string; packageId: Ref; status: string }[];
};
function StudentAccess({ student }: { student: User }) {
  const resource = useResource<Inspection>(`/admin/students/${student._id}`),
    packages = useResource<Package[]>("/staff/packages"),
    { t } = useI18n();
  return (
    <section className="surface">
      <h2>{t("studentAccess")}</h2>
      <State
        loading={resource.loading}
        error={resource.error}
        reload={resource.reload}
      />
      {resource.data?.access.map((a) => (
        <div className="breakdown" key={a._id}>
          <strong>{a.packageId.name}</strong>
          <Badge value={a.status} />
          {a.status === "active" && (
            <Action
              path={`/admin/students/${student._id}/access`}
              body={{ packageId: a.packageId._id, revoke: true }}
              label="revokeAccess"
              confirm
              onDone={resource.reload}
            />
          )}
        </div>
      ))}
      <Form
        fields={[
          {
            key: "packageId",
            type: "select",
            options:
              packages.data?.map((p) => ({ value: p._id, label: p.name })) ||
              [],
          },
        ]}
        submit={(values) =>
          api(`/admin/students/${student._id}/access`, "POST", values)
        }
        onDone={resource.reload}
        label="grantAccess"
      />
      <Action
        path={`/admin/students/${student._id}/reset-device`}
        label="resetDevice"
        confirm
        onDone={resource.reload}
      />
    </section>
  );
}
export function People() {
  const [role, setRole] = useState("student"),
    [selected, setSelected] = useState<User>(),
    [create, setCreate] = useState(false),
    resource = useResource<User[]>(`/admin/users?role=${role}`),
    academics = useAdminAcademics(),
    { t } = useI18n();
  const initial: Values = selected
    ? {
        fullName: selected.fullName,
        phone: selected.phone,
        status: selected.status,
        ...(selected.role === "student"
          ? {
              collegeId:
                typeof selected.collegeId === "string"
                  ? selected.collegeId
                  : selected.collegeId?._id || "",
              academicYearId:
                typeof selected.academicYearId === "string"
                  ? selected.academicYearId
                  : selected.academicYearId?._id || "",
            }
          : {}),
      }
    : {};
  return (
    <Page
      title="people"
      actions={
        role !== "student" && (
          <button
            className="primary"
            onClick={() => {
              setCreate((v) => !v);
              setSelected(undefined);
            }}
          >
            <ActionLabel action="create" />
          </button>
        )
      }
    >
      <div className="tabs">
        {["student", "lecturer", "content_manager"].map((r) => (
          <button
            className={role === r ? "selected" : ""}
            key={r}
            onClick={() => {
              setRole(r);
              setSelected(undefined);
              setCreate(false);
            }}
          >
            {t(
              r === "student"
                ? "students"
                : r === "lecturer"
                  ? "lecturers"
                  : "contentManagers",
            )}
          </button>
        ))}
      </div>
      <State
        loading={resource.loading}
        error={resource.error}
        empty={resource.data?.length === 0}
        reload={resource.reload}
      />
      {create && (
        <Dialog
          title={`${t("create")}  · ${t(role)}`}
          onClose={() => setCreate(false)}
        >
          <Form
            fields={[
              { key: "fullName" },
              { key: "email", type: "email" },
              { key: "phone", type: "tel", required: false },
              {
                key: "password",
                type: "password",
                minLength: 12,
                maxLength: 128,
                hint: "passwordLengthHelp",
              },
            ]}
            submit={(values) =>
              api("/admin/users", "POST", { ...values, role })
            }
            onDone={() => {
              setCreate(false);
              resource.reload();
            }}
          />
        </Dialog>
      )}
      <div className="management-grid single">
        <section className="surface">
          <div className="record-list">
            {resource.data?.map((user) => (
              <div key={user._id}>
                <div>
                  <strong>{user.fullName}</strong>
                  <small>{user.email}</small>
                </div>
                <Badge value={user.status} />
                <button
                  onClick={() => {
                    setSelected(user);
                    setCreate(false);
                  }}
                >
                  <ActionLabel action="details" />
                </button>
              </div>
            ))}
          </div>
        </section>
        {selected && (
          <Dialog
            title={`${t("edit")}  · ${selected.fullName}`}
            onClose={() => setSelected(undefined)}
          >
            <section className="surface">
              <h2>{selected.fullName}</h2>
              <Form
                key={selected._id}
                initial={initial}
                fields={[
                  { key: "fullName" },
                  { key: "phone", type: "tel", required: false },
                  {
                    key: "status",
                    type: "select",
                    options: ["active", "disabled"].map((s) => ({
                      value: s,
                      label: s,
                    })),
                  },
                  ...(role === "student"
                    ? [
                        {
                          key: "collegeId",
                          type: "select",
                          options:
                            academics.data?.colleges.map((c) => ({
                              value: c._id,
                              label: c.name,
                            })) || [],
                        },
                        {
                          key: "academicYearId",
                          type: "select",
                          options:
                            academics.data?.academic_years.map((y) => ({
                              value: y._id,
                              label: y.name,
                            })) || [],
                        },
                      ]
                    : []),
                ]}
                submit={(values) =>
                  api(`/admin/users/${selected._id}`, "PATCH", {
                    fullName: values.fullName,
                    phone: values.phone,
                    status: values.status,
                    ...(selected.role === "student"
                      ? {
                          collegeId: values.collegeId,
                          academicYearId: values.academicYearId,
                        }
                      : {}),
                  })
                }
                onDone={resource.reload}
              />
            </section>
            {role === "student" ? (
              <StudentAccess key={selected._id} student={selected} />
            ) : (
              <Assignments key={selected._id} user={selected} />
            )}
          </Dialog>
        )}
      </div>
    </Page>
  );
}
