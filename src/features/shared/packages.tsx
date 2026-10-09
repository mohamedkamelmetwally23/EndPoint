import { useState } from "react";
import { ActionLabel } from "../../components/action-label";
import { Layers3 } from "lucide-react";
import { Dialog } from "../../components/dialog";
import { Link } from "react-router-dom";
import { useResource } from "../../hooks/use-resource";
import { api } from "../../services/api";
import { useAuth } from "../auth/context";
import { useI18n } from "../../i18n/context";
import { Page, State, Badge, Money } from "../../components/ui";
import { Form, type Values } from "../../components/form";
import type { Package, Academics } from "../../types/domain";
import { academicYearLabel } from "../../i18n/academic-year";
export function PackageForm({
  pkg,
  onDone,
  onClose,
}: {
  pkg?: Package;
  onDone: () => void;
  onClose: () => void;
}) {
  const resource = useResource<Academics>("/admin/academics"),
    { t, language } = useI18n();
  const initial: Values = pkg
    ? {
        name: pkg.name,
        coverUrl: pkg.coverUrl || "",
        collegeId: pkg.collegeId,
        academicYearId: pkg.academicYearId,
        termId: pkg.termId,
        price: pkg.price / 100,
        isFree: pkg.isFree,
        status: pkg.status,
        subjectIds:
          pkg.subjects
            ?.filter((subject) => subject.status === "active")
            .map((subject) => subject.subjectId._id) || [],
      }
    : { status: "draft", isFree: false, price: "", subjectIds: [] };
  return (
    <Dialog
      title={`${t(pkg ? "edit" : "create")} · ${t("package")}`}
      onClose={onClose}
    >
      <State
        loading={resource.loading}
        error={resource.error}
        reload={resource.reload}
      />
      <Form
        fields={(values) => [
          { key: "name", label: "packageName" },
          { key: "coverUrl", type: "image-upload", required: false, uploadContext: { purpose: "cover" } },
          {
            key: "collegeId",
            disabled: !!pkg,
            resets: ["academicYearId", "termId", "subjectIds"],
            type: "select",
            options:
              resource.data?.colleges
                .filter(
                  (c) => c.status === "active" || c._id === pkg?.collegeId,
                )
                .map((c) => ({
                  value: c._id,
                  label: c.name,
                })) || [],
          },
          {
            key: "academicYearId",
            disabled: !!pkg,
            dependsOn: "collegeId",
            resets: ["termId", "subjectIds"],
            type: "select",
            options:
              resource.data?.academic_years
                .filter(
                  (c) =>
                    c.collegeId === values.collegeId &&
                    (c.status === "active" || c._id === pkg?.academicYearId),
                )
                .map((c) => ({
                  value: c._id,
                  label: academicYearLabel(c.name, language),
                })) || [],
          },
          {
            key: "termId",
            disabled: !!pkg,
            dependsOn: "academicYearId",
            resets: ["subjectIds"],
            type: "select",
            options:
              resource.data?.terms
                .filter(
                  (c) =>
                    c.academicYearId === values.academicYearId &&
                    (c.status !== "archived" || c._id === pkg?.termId),
                )
                .map((c) => ({
                  value: c._id,
                  label: c.name,
                })) || [],
          },
          {
            key: "subjectIds",
            label: "subjects",
            type: "checkbox-group",
            dependsOn: "termId",
            options:
              resource.data?.subjects
                .filter(
                  (subject) =>
                    subject.collegeId === values.collegeId &&
                    subject.academicYearId === values.academicYearId &&
                    subject.termId === values.termId &&
                    subject.status === "active",
                )
                .map((subject) => ({
                  value: subject._id,
                  label: subject.name,
                })) || [],
          },
          { key: "isFree", type: "checkbox" },
          {
            key: "price",
            type: "number",
            min: 0.01,
            disabled: !!values.isFree,
            required: !values.isFree,
          },
          {
            key: "status",
            type: "select",
            options: ["draft", "active", "archived"].map((s) => ({
              value: s,
              label: s,
            })),
          },
        ]}
        initial={initial}
        submit={(values) =>
          api(
            `/admin/packages${pkg ? `/${pkg._id}` : ""}`,
            pkg ? "PUT" : "POST",
            {
              ...values,
              coverUrl: values.coverUrl || null,
              price: values.isFree ? 0 : Math.round(Number(values.price) * 100),
            },
          )
        }
        onDone={onDone}
      />
    </Dialog>
  );
}
export function StaffPackages() {
  const resource = useResource<Package[]>("/staff/packages"),
    { t } = useI18n(),
    { account } = useAuth(),
    [create, setCreate] = useState(false);
  const admin = account?.user.role === "super_admin";
  return (
    <Page
      title={admin ? "packages" : "myContent"}
      actions={
        admin && (
          <button className="primary" onClick={() => setCreate((v) => !v)}>
            <ActionLabel action={create ? "cancel" : "create"} />
          </button>
        )
      }
    >
      <State
        loading={resource.loading}
        error={resource.error}
        empty={resource.data?.length === 0}
        reload={resource.reload}
      />
      {create && (
        <PackageForm
          onClose={() => setCreate(false)}
          onDone={() => {
            setCreate(false);
            resource.reload();
          }}
        />
      )}
      <div className="card-grid">
        {resource.data?.map((pkg) => (
          <Link
            className="package-card"
            to={`/content/packages/${pkg._id}`}
            key={pkg._id}
          >
            {pkg.coverUrl && <img src={pkg.coverUrl} alt="" />}
            <div className="package-card-body">
              <div className="package-art">
                <Layers3 aria-hidden="true" />
                <span>
                  {pkg.subjects?.length || 0} {t("subjects")}
                </span>
              </div>
              <Badge value={pkg.status} />
              <h2>{pkg.name}</h2>
              <p>{pkg.description}</p>
              <div className="chips">
                {pkg.subjects?.map((s) => (
                  <span key={s._id}>{s.subjectId.name}</span>
                ))}
              </div>
              {admin && (
                <strong>
                  {pkg.isFree ? t("free") : <Money value={pkg.price} />}
                </strong>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}
