import { useState } from "react";
import { Link } from "react-router-dom";
import { useResource } from "../../hooks/use-resource";
import { useI18n } from "../../i18n/context";
import { Page, State } from "../../components/ui";
import type { Lecture } from "../../types/domain";
export function Timeline() {
  const { t, language } = useI18n(),
    [cursor, setCursor] = useState(new Date()),
    [view, setView] = useState("month"),
    [filter, setFilter] = useState("");
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    start = new Date(first);
  if (view === "month") start.setDate(1 - ((first.getDay() + 1) % 7));
  else {
    start.setTime(cursor.getTime());
    start.setDate(cursor.getDate() - ((cursor.getDay() + 1) % 7));
    start.setHours(0, 0, 0, 0);
  }
  const end = new Date(start);
  end.setDate(start.getDate() + (view === "month" ? 42 : 7));
  const resource = useResource<Lecture[]>(
    `/student/timeline?from=${start.toISOString()}&to=${end.toISOString()}`,
  );
  const move = (amount: number) => {
    const next = new Date(cursor);
    if (view === "month") next.setMonth(cursor.getMonth() + amount, 1);
    else next.setDate(cursor.getDate() + amount * 7);
    setCursor(next);
  };
  const events = resource.data || [],
    options = [
      ...new Map(
        events.map((e) => [
          e.packageSubjectId,
          `${e.context?.packageId.name} / ${e.context?.subjectId.name}`,
        ]),
      ).entries(),
    ];
  const days = Array.from({ length: view === "month" ? 42 : 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  return (
    <Page title="timeline">
      <section className="surface calendar">
        <div className="calendar-toolbar">
          <div className="actions">
            <button aria-label={t("previous")} onClick={() => move(-1)}>
              ‹
            </button>
            <button onClick={() => setCursor(new Date())}>{t("today")}</button>
            <button aria-label={t("next")} onClick={() => move(1)}>
              ›
            </button>
          </div>
          <h2>
            {new Intl.DateTimeFormat(language, {
              month: "long",
              year: "numeric",
            }).format(cursor)}
          </h2>
          <div className="actions">
            <select
              aria-label={t("view")}
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value="month">{t("month")}</option>
              <option value="week">{t("week")}</option>
            </select>
            <select
              aria-label={t("subject")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">{t("all")}</option>
              {options.map(([id, label]) => (
                <option value={id} key={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <State
          loading={resource.loading}
          error={resource.error}
          reload={resource.reload}
        />
        <div className="calendar-weekdays">
          {days.slice(0, 7).map((day) => (
            <span key={day.toISOString()}>
              {new Intl.DateTimeFormat(language, { weekday: "short" }).format(
                day,
              )}
            </span>
          ))}
        </div>
        <div className={`calendar-grid ${view}`}>
          {days.map((date) => {
            const current = events.filter(
              (e) =>
                e.publishedAt &&
                same(new Date(e.publishedAt), date) &&
                (!filter || e.packageSubjectId === filter),
            );
            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${date.getMonth() !== cursor.getMonth() ? "outside" : ""} ${same(date, new Date()) ? "today" : ""} ${current.length === 0 ? "empty-day" : ""}`}
              >
                <time dateTime={date.toISOString()}>
                  {new Intl.DateTimeFormat(language, { day: "numeric" }).format(
                    date,
                  )}
                  <span className="mobile-date">
                    {" "}
                    ·{" "}
                    {new Intl.DateTimeFormat(language, {
                      weekday: "short",
                      month: "short",
                    }).format(date)}
                  </span>
                </time>
                {current.map((e) => (
                  <Link
                    className="calendar-event"
                    key={e._id}
                    to={`/student/lectures/${e._id}`}
                  >
                    <strong>{e.title}</strong>
                    <small>{e.context?.subjectId.name}</small>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
        {events.length === 0 && !resource.loading && (
          <p className="muted calendar-empty">{t("noLectures")}</p>
        )}
      </section>
    </Page>
  );
}
