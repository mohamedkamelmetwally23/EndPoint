import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Dialog } from "../../components/dialog";
import { ImageUpload } from "../../components/image-upload";
import { BookOpen, ChevronLeft, Layers3 } from "lucide-react";
import { useResource } from "../../hooks/use-resource";
import { api } from "../../services/api";
import { Page, State, Money, Badge, Back, Action } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { Package, PackageDetail } from "../../types/domain";
export function StudentPackages({ explore = false }: { explore?: boolean }) {
  const { t } = useI18n(),
    resource = useResource<Package[]>(
      `/student/packages?mode=${explore ? "explore" : "learning"}`,
    );
  return (
    <Page title={explore ? "explore" : "learning"}>
      <State
        loading={resource.loading}
        error={resource.error}
        empty={resource.data?.length === 0}
        emptyLabel={explore ? "noExplorePackages" : "empty"}
        reload={resource.reload}
      />
      <div className="card-grid">
        {resource.data?.map((pkg) => (
          <article className="package-card" key={pkg._id}>
            <Link
              className="package-card-link"
              to={`/student/packages/${pkg._id}${explore ? "?preview=true" : ""}`}
            >
              {pkg.coverUrl && <img src={pkg.coverUrl} alt="" />}
              <div className="package-card-body">
                <div className="package-art">
                  <Layers3 aria-hidden="true" />
                  <span>
                    {pkg.subjects?.length || 0} {t("subjects")}
                  </span>
                </div>
                <div className="actions">
                  <Badge value={pkg.isFree ? "free" : pkg.status} />
                  {explore && !pkg.isFree && (
                    <strong>
                      <Money value={pkg.price} />
                    </strong>
                  )}
                </div>
                <h2>{pkg.name}</h2>
                <p>{pkg.description}</p>
                <div className="chips">
                  {pkg.subjects?.map((s) => (
                    <span key={s._id}>{s.subjectId.name}</span>
                  ))}
                </div>
                <span className="link-label">
                  {t(explore ? "viewPackage" : "view")} →
                </span>
              </div>
            </Link>
            {explore && pkg.isFree && (
              <div className="package-card-footer">
                <Action
                  path={`/student/packages/${pkg._id}/claim`}
                  label="getFree"
                  onDone={resource.reload}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </Page>
  );
}
export function StudentPackage() {
  const { id } = useParams(),
    preview =
      new URLSearchParams(useLocation().search).get("preview") === "true",
    resource = useResource<PackageDetail>(
      `/student/packages/${id}${preview ? "?preview=true" : ""}`,
    ),
    { t } = useI18n(),
    navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [checkoutOpen, setCheckoutOpen] = useState(false),
    [receiptImage, setReceiptImage] = useState(""),
    [uploading, setUploading] = useState(false),
    [orderSubmitted, setOrderSubmitted] = useState(false),
    [error, setError] = useState("");
  const buy = async () => {
    setBusy(true);
    setError("");
    try {
      if (resource.data?.package.isFree) {
        await api(`/student/packages/${id}/claim`, "POST");
        navigate(`/student/packages/${id}`);
      } else {
        if (!receiptImage || uploading) return;
        await api(`/student/packages/${id}/buy`, "POST", { receiptImage });
        setOrderSubmitted(true);
        setCheckoutOpen(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "INTERNAL_ERROR");
    } finally {
      setBusy(false);
    }
  };
  const detail = resource.data;
  return (
    <>
      <Back to={preview ? "/explore" : "/learning"} />
      <Page title={detail?.package.name || "package"}>
        <State
          loading={resource.loading}
          error={resource.error}
          reload={resource.reload}
        />
        {detail && (
          <>
            {preview && (
              <section className="surface package-intro">
                {detail.package.description && (
                  <p>{detail.package.description}</p>
                )}
                {preview ? (
                  <div>
                    <strong>
                      {detail.package.isFree ? (
                        t("free")
                      ) : (
                        <Money value={detail.package.price} />
                      )}
                    </strong>
                    <button
                      className="primary"
                      disabled={busy || orderSubmitted}
                      onClick={() => {
                        setError("");
                        if (detail.package.isFree) void buy();
                        else setCheckoutOpen(true);
                      }}
                    >
                      {t(
                        busy
                          ? "loading"
                          : detail.package.isFree
                            ? "getFree"
                            : "buy",
                      )}
                    </button>
                    {orderSubmitted && (
                      <p role="status">{t("purchaseSubmitted")}</p>
                    )}
                    {error && !checkoutOpen && (
                      <p role="alert" className="error">
                        {t(error)}
                      </p>
                    )}
                  </div>
                ) : null}
              </section>
            )}
            <h2 className="learning-section-title">{t("subjects")}</h2>
            <div className="learning-card-grid">
              {detail.subjects.map((subject) => {
                const lectures = detail.lectures.filter(
                  (lecture) => lecture.packageSubjectId === subject._id,
                );
                const content = (
                  <>
                    <span className="learning-card-icon">
                      <BookOpen size={26} />
                    </span>
                    <h2>{subject.subjectId.name}</h2>
                    {!preview && (
                      <>
                        <small>
                          {lectures.length} {t("lectures")}
                        </small>
                        <span className="learning-card-footer">
                          {t("viewLectures")}
                          <ChevronLeft size={18} />
                        </span>
                      </>
                    )}
                  </>
                );
                return preview ? (
                  <article key={subject._id} className="learning-card">
                    {content}
                  </article>
                ) : (
                  <Link
                    key={subject._id}
                    className="learning-card"
                    to={`/student/packages/${id}/subjects/${subject._id}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
            <State empty={detail.subjects.length === 0} />
          </>
        )}
      </Page>
      {checkoutOpen && detail && (
        <Dialog
          title={t("purchaseTitle")}
          onClose={() => {
            if (!busy && !uploading) setCheckoutOpen(false);
          }}
        >
          <p>{detail.package.name}</p>
          <p><Money value={detail.package.price} /></p>
          <p>{t("instapayInstructions")}</p>
          <p><strong dir="ltr">01200929641</strong></p>
          <label>
            <span>{t("receiptImage")}</span>
            <ImageUpload value={receiptImage} onChange={setReceiptImage} onBusyChange={setUploading} context={{ purpose: "receipt" }} />
          </label>
          {error && <p role="alert" className="error">{t(error)}</p>}
          <div className="actions">
            <button className="primary" disabled={busy || uploading || !receiptImage} onClick={() => void buy()}>
              {t(busy ? "loading" : "confirmTransfer")}
            </button>
            <button disabled={busy || uploading} onClick={() => setCheckoutOpen(false)}>{t("cancel")}</button>
          </div>
        </Dialog>
      )}
    </>
  );
}
