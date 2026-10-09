import { useState } from "react";
import { useResource } from "../../hooks/use-resource";
import {
  Page,
  State,
  Money,
  DateText,
  Badge,
  Action,
} from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { Order } from "../../types/domain";
import { fileUrl } from "../../services/storage";
import { Dialog } from "../../components/dialog";
export function Orders() {
  const [status, setStatus] = useState("pending"),
    [receipt, setReceipt] = useState<string | null>(null),
    { t } = useI18n(),
    resource = useResource<Order[]>(`/admin/orders?status=${status}`);
  return (
    <Page title="orders">
      {receipt && (
        <Dialog title={t("receiptImage")} onClose={() => setReceipt(null)}>
          <img src={fileUrl(receipt)} alt={t("receiptImage")} style={{ display: "block", maxWidth: "100%", maxHeight: "70vh", margin: "auto", objectFit: "contain" }} />
        </Dialog>
      )}
      <div className="tabs">
        {["pending", "completed", "cancelled"].map((s) => (
          <button
            className={s === status ? "selected" : ""}
            key={s}
            onClick={() => setStatus(s)}
          >
            {t(s)}
          </button>
        ))}
      </div>
      <State
        loading={resource.loading}
        error={resource.error}
        empty={resource.data?.length === 0}
        reload={resource.reload}
      />
      <section className="surface">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "student",
                  "package",
                  "price",
                  "receiptImage",
                  "contact",
                  "createdAt",
                  "status",
                  "action",
                ].map((h) => (
                  <th key={h}>{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resource.data?.map((order) => (
                <tr key={order._id} data-order-id={order._id}>
                  <td data-label={t("student")}>{order.studentId.fullName}</td>
                  <td data-label={t("package")}>{order.packageId.name}</td>
                  <td data-label={t("price")}>
                    <Money value={order.priceSnapshot} />
                  </td>
                  <td data-label={t("receiptImage")}>
                    {order.receiptImage ? (
                      <button type="button" className="quiet" onClick={() => setReceipt(order.receiptImage!)}>
                        <img className="order-receipt-thumbnail" src={fileUrl(order.receiptImage)} alt={t("receiptImage")} />
                        {t("viewReceipt")}
                      </button>
                    ) : "—"}
                  </td>
                  <td data-label={t("contact")}>
                    <a
                      href={`https://wa.me/${order.studentId.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {order.studentId.phone}
                    </a>
                  </td>
                  <td data-label={t("createdAt")}>
                    <DateText value={order.createdAt} />
                  </td>
                  <td data-label={t("status")}>
                    <Badge value={order.status} />
                  </td>
                  <td className="actions">
                    {order.status === "pending" && (
                      <>
                        <Action
                          path={`/admin/orders/${order._id}/complete`}
                          label="completeOrder"
                          confirm
                          onDone={resource.reload}
                        />
                        <Action
                          path={`/admin/orders/${order._id}/cancel`}
                          label="cancel"
                          confirm
                          onDone={resource.reload}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Page>
  );
}
