import { ActionLabel } from "../../components/action-label";
import { useState } from "react";
import { PlayCircle, ArrowUpRight, ChevronDown } from "lucide-react";
import { Dialog } from "../../components/dialog";
import { Link, useParams } from "react-router-dom";
import { useResource } from "../../hooks/use-resource";
import { api } from "../../services/api";
import { useAuth } from "../auth/context";
import { useI18n } from "../../i18n/context";
import { Page, State, Badge, Back, Action } from "../../components/ui";
import { Form, type Values } from "../../components/form";
import type {
  PackageDetail,
  Lecture,
  LectureDetail,
  Material,
  Academics,
} from "../../types/domain";
import { PackageForm } from "./packages";
import { MaterialView, LectureVideo } from "../student/lecture";
export function can(
  detail: PackageDetail,
  subjectId: string,
  permission: string,
) {
  return detail.permissions.some((p) =>
    typeof p === "string"
      ? p === permission
      : (p.scopeType === "package" || p.packageSubjectId === subjectId) &&
        p.permissions.includes(permission),
  );
}
export function LectureForm({
  subjectId,
  lecture,
  allowed,
  onDone,
}: {
  subjectId: string;
  lecture?: Lecture;
  allowed: string[];
  onDone: () => void;
}) {
  const initial: Values = lecture
    ? {
        title: lecture.title,
        description: lecture.description,
        order: lecture.order,
        youtubeUrl: lecture.youtubeUrl || "",
        summaryUrl: lecture.summaryUrl || "",
        status: lecture.status,
        scheduledAt: lecture.scheduledAt?.slice(0, 16) || "",
      }
    : { status: "draft", order: 0 };
  const statuses = [
    "draft",
    ...(allowed.includes("content:publish") ? ["scheduled", "published"] : []),
    ...(allowed.includes("content:archive") ? ["archived"] : []),
  ];
  if (lecture && !statuses.includes(lecture.status))
    statuses.push(lecture.status);
  return (
    <Form
      fields={[
        { key: "title" },
        { key: "description", type: "textarea", required: false },
        { key: "youtubeUrl", type: "url", required: false },
        {
          key: "summaryUrl",
          type: "pdf-upload",
          uploadContext: { purpose: "summary", scopeId: subjectId, editing: !!lecture },
          required: false,
        },
        {
          key: "status",
          type: "select",
          options: statuses.map((s) => ({ value: s, label: s })),
        },
        { key: "scheduledAt", type: "datetime-local", required: false },
      ]}
      initial={initial}
      submit={(values) =>
        api(
          `/staff/lectures${lecture ? `/${lecture._id}` : ""}`,
          lecture ? "PUT" : "POST",
          {
            ...values,
            packageSubjectId: subjectId,
            youtubeUrl: values.youtubeUrl || null,
            summaryUrl: values.summaryUrl || null,
            order: Number(values.order || 0),
            scheduledAt: values.scheduledAt
              ? new Date(String(values.scheduledAt)).toISOString()
              : undefined,
          },
        )
      }
      onDone={onDone}
    />
  );
}
export function ContentPackage() {
  const { id } = useParams(),
    resource = useResource<PackageDetail>(`/staff/packages/${id}`),
    academic = useResource<Academics>("/public/academics"),
    { account } = useAuth(),
    { t } = useI18n();
  const [editing, setEditing] = useState(false),
    [add, setAdd] = useState(false),
    [lectureSubject, setLectureSubject] = useState(""),
    [editLecture, setEditLecture] = useState<Lecture>();
  const detail = resource.data,
    admin = account?.user.role === "super_admin";
  return (
    <>
      <Back to={admin ? "/packages" : "/myContent"} />
      <Page
        title={detail?.package.name || "package"}
        actions={
          admin && (
            <>
              <button onClick={() => setEditing((v) => !v)}>
                <ActionLabel action="edit" />
              </button>
              <button onClick={() => setAdd((v) => !v)}>
                <ActionLabel action="addSubject" />
              </button>
            </>
          )
        }
      >
        <State
          loading={resource.loading}
          error={resource.error}
          reload={resource.reload}
        />
        {detail && (
          <>
            {editing && (
              <PackageForm
                onClose={() => setEditing(false)}
                pkg={{ ...detail.package, subjects: detail.subjects }}
                onDone={() => {
                  setEditing(false);
                  resource.reload();
                }}
              />
            )}
            {add && (
              <Dialog title={t("addSubject")} onClose={() => setAdd(false)}>
                <Form
                  fields={[
                    {
                      key: "subjectId",
                      label: "subject",
                      type: "select",
                      options:
                        academic.data?.subjects
                          .filter(
                            (s) =>
                              s.collegeId === detail.package.collegeId &&
                              (!s.academicYearId ||
                                s.academicYearId ===
                                  detail.package.academicYearId) &&
                              (!s.termId || s.termId === detail.package.termId),
                          )
                          .map((s) => ({ value: s._id, label: s.name })) || [],
                    },
                    { key: "order", type: "number", min: 0 },
                  ]}
                  initial={{ order: 0 }}
                  submit={(values) =>
                    api(`/admin/packages/${id}/subjects`, "POST", values)
                  }
                  onDone={() => {
                    setAdd(false);
                    resource.reload();
                  }}
                />
              </Dialog>
            )}
            {detail.subjects.map((subject) => {
              const lectures = detail.lectures.filter(
                (lecture) => lecture.packageSubjectId === subject._id,
              );
              const allowed = [
                "content:view",
                "content:create",
                "content:edit",
                "content:publish",
                "content:archive",
                "content:delete_draft",
              ].filter((p) => can(detail, subject._id, p));
              return (
                <details className="surface content-subject" key={subject._id}>
                  <summary className="content-subject-heading">
                    <span className="content-subject-name">{subject.subjectId.name}</span>
                    <span className="content-subject-count">{t("lectures")}: {lectures.length}</span>
                    {subject.status === "archived" && <Badge value="archived" />}
                    <ChevronDown className="content-subject-chevron" size={22} aria-hidden="true" />
                  </summary>
                  <div className="content-subject-body">
                  <div className="section-heading">
                    <div className="actions">
                      {admin && (
                        <Action
                          path={`/admin/packages/${id}/subjects`}
                          body={{
                            subjectId: subject.subjectId._id,
                            order: subject.order,
                            status:
                              subject.status === "active"
                                ? "archived"
                                : "active",
                          }}
                          label={
                            subject.status === "active" ? "archive" : "active"
                          }
                          confirm
                          onDone={resource.reload}
                        />
                      )}{" "}
                      {allowed.includes("content:create") && (
                        <button
                          onClick={() => {
                            setLectureSubject(subject._id);
                            setEditLecture(undefined);
                          }}
                        >
                          <ActionLabel action="addLecture" />
                        </button>
                      )}
                    </div>
                  </div>
                  {lectureSubject === subject._id && (
                    <Dialog
                      title={`${t(editLecture ? "edit" : "addLecture")} · ${subject.subjectId.name}`}
                      onClose={() => setLectureSubject("")}
                    >
                      <LectureForm
                        key={editLecture?._id || "new"}
                        subjectId={subject._id}
                        lecture={editLecture}
                        allowed={allowed}
                        onDone={() => {
                          setLectureSubject("");
                          resource.reload();
                        }}
                      />
                      <button onClick={() => setLectureSubject("")}>
                        <ActionLabel action="cancel" />
                      </button>
                    </Dialog>
                  )}
                  <div className="learning-card-grid content-lecture-grid">
                    {lectures.map((l) => (
                        <article className="learning-card content-lecture-card" key={l._id}>
                          <div className="learning-card-top">
                            <span className="learning-card-icon"><PlayCircle size={26} aria-hidden="true" /></span>
                            <Badge value={l.status} />
                          </div>
                          <Link className="content-lecture-title" to={`/content/lectures/${l._id}`}>
                            <h3>{l.title}</h3>
                            <ArrowUpRight size={20} aria-hidden="true" />
                          </Link>
                          <div className="actions content-lecture-actions">
                            {allowed.includes("content:edit") &&
                              (!["published", "scheduled"].includes(l.status) ||
                                allowed.includes("content:publish")) && (
                                <button
                                  onClick={() => {
                                    setLectureSubject(subject._id);
                                    setEditLecture(l);
                                  }}
                                >
                                  <ActionLabel action="edit" />
                                </button>
                              )}
                            {l.status === "draft" &&
                              allowed.includes("content:delete_draft") && (
                                <Action
                                  path={`/staff/lectures/${l._id}`}
                                  method="DELETE"
                                  label="delete"
                                  confirm
                                  onDone={resource.reload}
                                />
                              )}
                          </div>
                        </article>
                      ))}
                  </div>
                  <State empty={lectures.length === 0} />
                  </div>
                </details>
              );
            })}
            <State empty={detail.subjects.length === 0} />
          </>
        )}
      </Page>
    </>
  );
}
export function ContentLecture() {
  const { id } = useParams(),
    resource = useResource<LectureDetail>(`/staff/lectures/${id}`),
    detail = resource.data,
    packageResource = useResource<PackageDetail>(
      `/staff/packages/${detail?.subject.packageId || "000000000000000000000000"}`,
    ),
    { t } = useI18n();
  const [editing, setEditing] = useState<Material | null | undefined>();
  const allowed =
    packageResource.data && detail
      ? [
          "content:create",
          "content:edit",
          "content:publish",
          "content:delete_draft",
        ].filter((p) => can(packageResource.data!, detail.subject._id, p))
      : [];
  const mutable =
    detail?.lecture.status === "draft" || allowed.includes("content:publish");
  const initial: Values = editing
    ? {
        title: editing.title,
        type: editing.type,
        url: editing.url || "",
        body: editing.body || "",
        order: editing.order,
      }
    : { type: "text", order: 0 };
  return (
    <>
      <Back
        to={
          detail
            ? `/content/packages/${detail.subject.packageId}`
            : "/myContent"
        }
      />
      <Page
        title={detail?.lecture.title || "lectures"}
      >
        <State
          loading={resource.loading}
          error={resource.error}
          reload={resource.reload}
        />
        {detail && (
          <section className="surface">
            <Badge value={detail.lecture.status} />
            <p>{detail.lecture.description}</p>
            <LectureVideo lecture={detail.lecture} />
            {editing !== undefined && (
              <Dialog
                title={t(editing ? "edit" : "addMaterial")}
                onClose={() => setEditing(undefined)}
              >
                <Form
                  key={editing?._id || "new"}
                  fields={(values) => [
                    { key: "title" },
                    {
                      key: "type",
                      type: "select",
                      options: ["youtube", "pdf", "image", "text"].map((s) => ({
                        value: s,
                        label: s,
                      })),
                    },
                    { key: "url", type: values.type === "pdf" ? "pdf-upload" : values.type === "image" ? "image-upload" : "url", required: false,
                      uploadContext: { purpose: "material", scopeId: id!, editing: !!editing } },
                    { key: "body", type: "textarea", required: false },
                    { key: "order", type: "number", min: 0 },
                  ]}
                  initial={initial}
                  submit={(values) =>
                    api(
                      `/staff/materials${editing ? `/${editing._id}` : ""}`,
                      editing ? "PUT" : "POST",
                      {
                        ...values,
                        lectureId: id,
                        url: values.url || undefined,
                        body: values.body || undefined,
                      },
                    )
                  }
                  onDone={() => {
                    setEditing(undefined);
                    resource.reload();
                  }}
                />
                <button onClick={() => setEditing(undefined)}>
                  <ActionLabel action="cancel" />
                </button>
              </Dialog>
            )}
            {detail.materials.map((m) => (
              <div key={m._id}>
                <MaterialView material={m} />
                <div className="actions">
                  {allowed.includes("content:edit") && mutable && (
                    <button onClick={() => setEditing(m)}>
                      <ActionLabel action="edit" />
                    </button>
                  )}
                  {allowed.includes("content:delete_draft") &&
                    detail.lecture.status === "draft" && (
                      <Action
                        path={`/staff/materials/${m._id}`}
                        method="DELETE"
                        label="delete"
                        confirm
                        onDone={resource.reload}
                      />
                    )}
                </div>
              </div>
            ))}
          </section>
        )}
      </Page>
    </>
  );
}
