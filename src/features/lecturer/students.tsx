import { useResource } from "../../hooks/use-resource";
import { UserRound } from "lucide-react";
import { Page, State, Progress, DateText, Badge } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { StudentReport } from "../../types/domain";
export function LecturerStudents() {
  const resource = useResource<StudentReport[]>("/staff/students"),
    { t } = useI18n();
  return (
    <Page title="students">
      <State
        loading={resource.loading}
        error={resource.error}
        empty={resource.data?.length === 0}
        reload={resource.reload}
      />
      {!!resource.data?.length && <section className="surface table-wrap student-report-table-wrap">
        <table className="student-report-table">
          <thead><tr>
            {["fullName", "email", "package", "progress", "lastActivity", "lectureCompletion"].map((key) => <th key={key} scope="col">{t(key)}</th>)}
          </tr></thead>
          <tbody>
        {resource.data?.map((row) => (
          <tr
            key={`${row.student._id}-${row.packageSubjectId}`}
          >
            <td><div className="student-table-name"><UserRound size={20} aria-hidden="true" /><strong>{row.student.fullName}</strong></div></td>
            <td><bdi dir="ltr">{row.student.email}</bdi></td>
            <td>{row.package.name}</td>
            <td><Progress completed={row.completed} total={row.total} /></td>
            <td><DateText value={row.lastActivity} /></td>
            <td><details>
              <summary>{t("lectureCompletion")}</summary>
              {row.lectures.map((l) => (
                <div className="breakdown" key={l._id}>
                  <span>{l.title}</span>
                  {l.completed && <Badge value="completed" />}
                </div>
              ))}
            </details></td>
          </tr>
        ))}
          </tbody>
        </table>
      </section>}
    </Page>
  );
}
