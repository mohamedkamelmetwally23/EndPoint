import { ActionLabel } from "../../components/action-label";
import { useState } from "react";
import { Dialog } from "../../components/dialog";
import { useAdminAcademics } from "../../hooks/use-admin-academics";
import { api } from "../../services/api";
import { Page, State, Badge } from "../../components/ui";
import { Form, type Field, type Values } from "../../components/form";
import { useI18n } from "../../i18n/context";
import type { Academics, Academic } from "../../types/domain";
import { academicYearLabel } from "../../i18n/academic-year";
export function AcademicStructure() {
  const resource = useAdminAcademics(),
    { t, language } = useI18n(),
    [college, setCollege] = useState(""),
    [year, setYear] = useState(""),
    [term, setTerm] = useState(""),
    [kind, setKind] = useState<keyof Academics>("colleges"),
    [editing, setEditing] = useState<Academic | null | undefined>();
  const data = resource.data;
  const selectCollege = (value: string) => {
    setCollege(value);
    setYear("");
    setTerm("");
    setEditing(undefined);
  };
  const rows =
    data?.[kind].filter((row) =>
      kind === "colleges" || kind === "academic_years"
        ? kind === "colleges" || row.collegeId === college
        : kind === "terms"
          ? row.academicYearId === year
          : !!term &&
            (row.termId === term ||
              (!row.termId &&
                row.collegeId === college &&
                (!row.academicYearId || row.academicYearId === year))),
    ) || [];
  const fields: Field[] = [
    ...(kind === "colleges" && !editing
      ? [{ key: "yearCount", type: "number", min: 1, step: 1 }]
      : []),
    ...(kind !== "academic_years" ? [{ key: "name" }] : []),
    ...(kind === "academic_years"
      ? [
          {
            key: "collegeId",
            type: "select",
            options:
              data?.colleges
                .filter((c) => c._id === (editing?.collegeId || college))
                .map((c) => ({ value: c._id, label: c.name })) || [],
          },
        ]
      : []),
    ...(kind === "academic_years"
      ? [
          {
            key: "yearCount",
            label: "yearCount",
            type: "number",
            min: 1,
            step: 1,
            dependsOn: "collegeId",
            placeholder: t("academicYearsCountPlaceholder"),
          },
        ]
      : []),
    ...(kind === "terms"
      ? [
          {
            key: "academicYearId",
            type: "select",
            required: kind === "terms",
            options:
              data?.academic_years
                .filter((y) => y._id === (editing?.academicYearId || year))
                .map((y) => ({
                  value: y._id,
                  label: academicYearLabel(y.name, language),
                })) || [],
          },
        ]
      : []),
    {
      key: "status",
      type: "select",
      options: (kind === "terms" || kind === "subjects"
        ? ["active", "inactive", "archived"]
        : ["active", "archived"]
      ).map((s) => ({ value: s, label: s })),
    },
  ];
  const initial: Values = editing
    ? ({
        ...(kind === "subjects"
          ? { collegeId: college, academicYearId: year, termId: term }
          : {}),
        ...Object.fromEntries(
          Object.entries(editing).filter(
            ([key, v]) =>
              fields.some((field) => field.key === key) &&
              (typeof v === "string" || typeof v === "number"),
          ),
        ),
        ...(kind === "academic_years"
          ? {
              yearCount: Math.max(
                1,
                ...(data?.academic_years
                  .filter((item) => item.collegeId === editing.collegeId)
                  .map((item) => Number(item.name) || item.order || 1) || []),
              ),
            }
          : {}),
      } as Values)
    : {
        ...(kind === "academic_years" || kind === "subjects"
          ? { collegeId: college }
          : {}),
        ...(kind === "terms" || kind === "subjects"
          ? { academicYearId: year }
          : {}),
        ...(kind === "subjects" ? { termId: term } : {}),
        status: kind === "terms" ? "inactive" : "active",
      };
  return (
    <Page
      title="academics"
      actions={
        <button
          className="primary"
          disabled={
            (kind === "academic_years" && !college) ||
            (kind === "terms" && !year) ||
            (kind === "subjects" && !term)
          }
          onClick={() => setEditing(null)}
        >
          <ActionLabel action="create" /> · {t(kind)}
        </button>
      }
    >
      <State
        loading={resource.loading}
        error={resource.error}
        reload={resource.reload}
      />
      <div className="hierarchy-filters">
        <label>
          {t("collegeId")}
          <select
            value={college}
            onChange={(e) => selectCollege(e.target.value)}
          >
            <option value="">{t("all")}</option>
            {data?.colleges.map((c) => (
              <option value={c._id} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <span>›</span>
        <label>
          {t("academicYearId")}
          <select
            value={year}
            disabled={!college}
            onChange={(e) => {
              setYear(e.target.value);
              setTerm("");
              setEditing(undefined);
            }}
          >
            <option value="">{t("choose")}</option>
            {data?.academic_years
              .filter((y) => !college || y.collegeId === college)
              .map((y) => (
                <option value={y._id} key={y._id}>
                  {academicYearLabel(y.name, language)}
                </option>
              ))}
          </select>
        </label>
        <span>›</span>
        <label>
          {t("termId")}
          <select
            value={term}
            disabled={!year}
            onChange={(e) => {
              setTerm(e.target.value);
              setEditing(undefined);
            }}
          >
            <option value="">{t("choose")}</option>
            {data?.terms
              .filter((item) => item.academicYearId === year)
              .map((item) => (
                <option value={item._id} key={item._id}>
                  {item.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="tabs">
        {(["colleges", "academic_years", "terms", "subjects"] as const).map(
          (k) => (
            <button
              className={kind === k ? "selected" : ""}
              key={k}
              onClick={() => {
                setKind(k);
                setEditing(undefined);
              }}
            >
              {t(k)}
            </button>
          ),
        )}
      </div>
      <div className="management-grid single">
        {((kind === "academic_years" && !college) ||
          (kind === "terms" && !year) ||
          (kind === "subjects" && !term)) && <p>{t("selectAcademicParent")}</p>}
        <section className="surface">
          <div className="record-list">
            {rows.map((row) => (
              <div key={row._id}>
                <div>
                  {kind === "subjects" ? (
                    <strong>{row.name}</strong>
                  ) : (
                    <button
                      className="quiet"
                      onClick={() => {
                        if (kind === "colleges") {
                          selectCollege(row._id);
                          setKind("academic_years");
                        } else if (kind === "academic_years") {
                          setYear(row._id);
                          setTerm("");
                          setKind("terms");
                        } else {
                          setTerm(row._id);
                          setKind("subjects");
                        }
                        setEditing(undefined);
                      }}
                    >
                      <strong>
                        {kind === "academic_years"
                          ? academicYearLabel(row.name, language)
                          : row.name}
                      </strong>
                    </button>
                  )}
                  {kind === "subjects" && !row.termId && (
                    <small>{t("subjectNeedsTerm")}</small>
                  )}
                </div>
                <Badge value={row.status} />
                <button onClick={() => setEditing(row)}>
                  <ActionLabel action="edit" />
                </button>
              </div>
            ))}
          </div>
          <State empty={!rows.length && !resource.loading} />
        </section>
        {editing !== undefined && (
          <Dialog
            title={`${t(editing ? "edit" : "create")} · ${t(kind)}`}
            onClose={() => setEditing(undefined)}
          >
            {kind !== "colleges" && (
              <p>
                {
                  data?.colleges.find(
                    (item) => item._id === (editing?.collegeId || college),
                  )?.name
                }
                {(kind === "terms" || kind === "subjects") && (
                  <>
                    {" "}
                    · {t("academicYearId")}:{" "}
                    {
                      data?.academic_years.find(
                        (item) =>
                          item._id === (editing?.academicYearId || year),
                      )?.name
                    }
                  </>
                )}
                {kind === "subjects" && (
                  <>
                    {" "}
                    · {t("termId")}:{" "}
                    {
                      data?.terms.find(
                        (item) => item._id === (editing?.termId || term),
                      )?.name
                    }
                  </>
                )}
              </p>
            )}
            <Form
              key={`${kind}-${editing?._id || "new"}`}
              fields={fields}
              initial={initial}
              submit={(values) =>
                api(
                  `/admin/academics/${kind}${editing && kind !== "academic_years" ? `/${editing._id}` : ""}`,
                  editing && kind !== "academic_years" ? "PUT" : "POST",
                  Object.fromEntries(
                    Object.entries(
                      kind === "academic_years"
                        ? {
                            collegeId: values.collegeId,
                            yearCount: Number(values.yearCount),
                            status: values.status,
                          }
                        : values,
                    ).filter(([, v]) => v !== ""),
                  ),
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
      </div>
    </Page>
  );
}
