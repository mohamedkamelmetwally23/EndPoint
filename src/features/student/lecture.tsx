import { useParams } from "react-router-dom";
import { BookOpen, Layers3, CalendarDays, CheckCircle2 } from "lucide-react";
import { useResource } from "../../hooks/use-resource";
import {
  Page,
  State,
  Back,
  Action,
  DateText,
  Badge,
} from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { LectureDetail, Material } from "../../types/domain";
import { PdfLink } from "../../components/pdf-link";
import { fileUrl } from "../../services/storage";
export function MaterialView({ material, hideTitle = false }: { material: Material; hideTitle?: boolean }) {
  let video = "";
  if (material.type === "youtube" && material.url) {
    const url = new URL(material.url);
    video =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") || url.pathname.split("/").at(-1) || "";
  }
  return (
    <section className="material">
      {!hideTitle && <h2>{material.title}</h2>}
      {material.type === "youtube" ? (
        <iframe
          className="video"
          src={`https://www.youtube-nocookie.com/embed/${video}`}
          title={material.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : material.type === "image" ? (
        <img
          className="material-image"
          src={fileUrl(material.url || "")}
          alt={material.title}
        />
      ) : material.type === "pdf" ? (
        <a
          className="file-link"
          href={fileUrl(material.url || "")}
          target="_blank"
          rel="noopener noreferrer"
        >
          PDF · {material.title} ↗
        </a>
      ) : (
        <p className="text-body">{material.body}</p>
      )}
    </section>
  );
}
export function LectureVideo({
  lecture,
  hideTitle = false,
}: {
  lecture: LectureDetail["lecture"];
  hideTitle?: boolean;
}) {
  const { t } = useI18n();
  return (
    <>
      {lecture.youtubeUrl && (
        <MaterialView
          hideTitle={hideTitle}
          material={{
            _id: lecture._id,
            lectureId: lecture._id,
            title: lecture.title,
            type: "youtube",
            url: lecture.youtubeUrl,
            order: 0,
          }}
        />
      )}
      {lecture.summaryUrl && (
        <PdfLink value={lecture.summaryUrl} label={t("summaryPdf")} />
      )}
    </>
  );
}
export function StudentLecture() {
  const { id } = useParams(),
    resource = useResource<LectureDetail>(`/student/lectures/${id}`),
    { t } = useI18n(),
    detail = resource.data;
  return (
    <>
      <Back
        to={
          detail
            ? `/student/packages/${detail.subject.packageId}/subjects/${detail.subject._id}`
            : "/learning"
        }
      />
      <Page title={detail?.lecture.title || "lectures"}>
        <State
          loading={resource.loading}
          error={resource.error}
          reload={resource.reload}
        />
        {detail && (
          <article className="surface lecture-reader student-lecture-reader">
            <header className="lecture-context">
              <div className="lecture-context-tags">
                <span><Layers3 size={17} aria-hidden="true" />{detail.package.name}</span>
                <span><BookOpen size={17} aria-hidden="true" />{detail.subject.subjectId.name}</span>
              </div>
              {detail.completed && <Badge value="completed" />}
            </header>
            <div className="lecture-watch"><LectureVideo lecture={detail.lecture} hideTitle /></div>
            <div className="lecture-information">
              {detail.lecture.description && <p className="text-body">{detail.lecture.description}</p>}
              {detail.lecture.publishedAt && <small className="lecture-date"><CalendarDays size={16} aria-hidden="true" />{t("publishedAt")}: <DateText value={detail.lecture.publishedAt} /></small>}
            </div>
            {detail.materials.map((m) => (
              <MaterialView key={m._id} material={m} />
            ))}
            <footer className="lecture-completion">
              <span className="lecture-completion-icon"><CheckCircle2 size={24} aria-hidden="true" /></span>
              {detail.completed ? (
                <Badge value="completed" />
              ) : (
                <Action
                  path={`/student/lectures/${id}/complete`}
                  label="markCompleted"
                  onDone={resource.reload}
                />
              )}
            </footer>
          </article>
        )}
      </Page>
    </>
  );
}
