import { Link, useParams } from "react-router-dom";
import { PlayCircle, ChevronLeft } from "lucide-react";
import { useResource } from "../../hooks/use-resource";
import { Page, State, Back, Badge, DateText } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { PackageDetail } from "../../types/domain";
export function StudentSubject() {
  const { id, subjectId } = useParams();
  const resource = useResource<PackageDetail>(`/student/packages/${id}`);
  const { t } = useI18n();
  const subject = resource.data?.subjects.find(
    (value) => value._id === subjectId,
  );
  const lectures =
    resource.data?.lectures.filter(
      (value) => value.packageSubjectId === subjectId,
    ) || [];
  return (
    <>
      <Back to={`/student/packages/${id}`} />
      <Page title={subject?.subjectId.name || "subject"}>
        <State
          loading={resource.loading}
          error={
            resource.error ||
            (resource.data && !subject ? "NOT_FOUND" : undefined)
          }
          reload={resource.reload}
        />
        {subject && (
          <>
            <h2 className="learning-section-title">{t("lectures")}</h2>
            <div className="learning-card-grid">
              {lectures.map((lecture, index) => (
                <Link
                  className="learning-card"
                  key={lecture._id}
                  to={`/student/lectures/${lecture._id}`}
                >
                  <div className="learning-card-top">
                    <span className="learning-card-icon">
                      <PlayCircle size={28} />
                    </span>
                    <span className="lecture-number">{index + 1}</span>
                  </div>
                  <div>
                    <h2>{lecture.title}</h2>
                    <small>
                      <DateText value={lecture.publishedAt} />
                    </small>
                  </div>
                  {lecture.completed && <Badge value="completed" />}
                  <span className="learning-card-footer">
                    {t("openLecture")}
                    <ChevronLeft size={18} />
                  </span>
                </Link>
              ))}
            </div>
            <State empty={!lectures.length} />
          </>
        )}
      </Page>
    </>
  );
}
