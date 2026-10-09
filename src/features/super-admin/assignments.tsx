import { ActionLabel } from "../../components/action-label";
import { useState } from "react";
import { useResource } from "../../hooks/use-resource";
import { api } from "../../services/api";
import { Form, type Values } from "../../components/form";
import { State } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type {
  User,
  Package,
  PackageDetail,
  Assignment,
} from "../../types/domain";
const permissionLabels: Record<string, string> = {
  "content:view": "contentView",
  "content:create": "contentCreate",
  "content:edit": "contentEdit",
  "content:delete_draft": "contentDelete",
  "content:publish": "contentPublish",
  "content:archive": "contentArchive",
};
export function Assignments({ user }: { user: User }) {
  const packages = useResource<Package[]>("/staff/packages"),
    assignments = useResource<Assignment[]>("/admin/assignments"),
    { t } = useI18n(),
    [packageId, setPackageId] = useState(""),
    [editing, setEditing] = useState<Assignment>();
  const content = useResource<PackageDetail>(
    `/staff/packages/${packageId || "000000000000000000000000"}`,
  );
  const submit = async (values: Values) => {
    const subjectIds = Array.isArray(values.packageSubjectIds)
      ? values.packageSubjectIds
      : [];
    if (user.role === "lecturer" && subjectIds.length === 0)
      throw new Error(t("chooseSubjects"));
    const data = {
      userId: user._id,
      packageId,
      scopeType: user.role === "lecturer" ? "package_subject" : "package",
      permissions: values.permissions,
      active: values.active,
    };
    try {
      if (user.role === "lecturer") {
        // The existing API upserts one assignment per subject, so retries are safe.
        for (const packageSubjectId of subjectIds)
          await api("/admin/assignments", "POST", { ...data, packageSubjectId });
      } else {
        await api("/admin/assignments", "POST", data);
      }
    } finally {
      assignments.reload();
    }
    setEditing(undefined);
  };
  const initial: Values = {
    active: editing?.active ?? true,
    permissions: editing?.permissions || ["content:view"],
    packageSubjectIds: editing?.packageSubjectId ? [editing.packageSubjectId] : [],
  };
  return (
    <section className="surface assignment-panel">
      <h2>{t("assign")}</h2>
      <State error={assignments.error} reload={assignments.reload} />
      <div className="record-list">
        {assignments.data
          ?.filter((a) => a.userId === user._id)
          .map((a) => (
            <div key={a._id}>
              <span>
                {packages.data?.find((p) => p._id === a.packageId)?.name}
              </span>
              <span>{a.active ? t("active") : t("inactive")}</span>
              <button
                onClick={() => {
                  setPackageId(a.packageId);
                  setEditing(a);
                }}
              >
                <ActionLabel action="edit" />
              </button>
            </div>
          ))}
      </div>
      <label className="assignment-package">
        {t("package")}
        <select
          aria-label={t("package")}
          value={packageId}
          onChange={(e) => {
            setPackageId(e.target.value);
            setEditing(undefined);
          }}
        >
          <option value="">{t("choose")}</option>
          {packages.data?.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {packageId && (
        <>
          <State
            loading={content.loading}
            error={content.error}
            reload={content.reload}
          />
          <Form
            className="assignment-form"
            key={`${packageId}-${editing?._id || "new"}`}
            fields={[
              ...(user.role === "lecturer"
                ? [
                    {
                      key: "packageSubjectIds",
                      label: "packageSubjects",
                      type: "checkbox-group",
                      options:
                        content.data?.subjects
                          .filter((s) => s.status === "active")
                          .map((s) => ({
                            value: s._id,
                            label: s.subjectId.name,
                          })) || [],
                    },
                  ]
                : []),
              {
                key: "permissions",
                type: "checkbox-group",
                options: Object.entries(permissionLabels).map(
                  ([value, label]) => ({ value, label: t(label) }),
                ),
              },
              { key: "active", label: "enabled", type: "checkbox" },
            ]}
            initial={initial}
            submit={submit}
          />
        </>
      )}
    </section>
  );
}
