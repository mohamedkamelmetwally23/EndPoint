import { ActionLabel } from "../../components/action-label";
import { useState } from "react";
import { TrendingUp, Receipt, Wallet } from "lucide-react";
import { Dialog } from "../../components/dialog";
import { useResource } from "../../hooks/use-resource";
import { api } from "../../services/api";
import { fileUrl } from "../../services/storage";
import { Page, State, Money, DateText, Action } from "../../components/ui";
import { Form } from "../../components/form";
import { useI18n } from "../../i18n/context";
import type { Finance, Expense } from "../../types/domain";
export function FinanceChart({ data }: { data: Finance }) {
  const { t } = useI18n();
  const months = [
    ...new Set(
      [...(data.monthlyRevenue || []), ...(data.monthlyExpenses || [])].map(
        (v) => v._id,
      ),
    ),
  ].sort();
  if (!months.length) return null;
  const max = Math.max(
    1,
    ...[...(data.monthlyRevenue || []), ...(data.monthlyExpenses || [])].map(
      (v) => v.amount,
    ),
  );
  return (
    <section className="surface">
      <h2>{t("monthly")}</h2>
      <div className="chart-legend">
        <span className="revenue-dot" />
        {t("revenue")}
        <span className="expense-dot" />
        {t("expenseTotal")}
      </div>
      <div className="finance-chart">
        {months.map((month) => {
          const income =
              data.monthlyRevenue?.find((v) => v._id === month)?.amount || 0,
            expenses =
              data.monthlyExpenses?.find((v) => v._id === month)?.amount || 0;
          return (
            <div className="chart-month" key={month}>
              <span>{month}</span>
              <div>
                <span>
                  {t("revenue")}: <Money value={income} />
                </span>
                <div
                  className="bar revenue-bar"
                  style={{ width: `${(income / max) * 100}%` }}
                />
                <span>
                  {t("expenseTotal")}: <Money value={expenses} />
                </span>
                <div
                  className="bar expense-bar"
                  style={{ width: `${(expenses / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export function Accounts() {
  const resource = useResource<Finance>("/staff/finance"),
    { t } = useI18n(),
    [editing, setEditing] = useState<Expense | null | undefined>();
  const [receipt, setReceipt] = useState<string>();
  return (
    <Page
      title="finance"
      actions={
        <button className="primary" onClick={() => setEditing(null)}>
          <ActionLabel action="addExpense" />
        </button>
      }
    >
      <State
        loading={resource.loading}
        error={resource.error}
        reload={resource.reload}
      />
      {resource.data && (
        <>
          <div className="stat-grid finance-summary">
            {(["revenue", "expenseTotal", "netProfit"] as const)
              .filter((k) => resource.data?.[k] !== undefined)
              .map((key) => (
                <section className="stat" key={key}>
                  <span className="stat-icon">
                    {key === "revenue" ? (
                      <TrendingUp size={21} aria-hidden="true" />
                    ) : key === "expenseTotal" ? (
                      <Receipt size={21} aria-hidden="true" />
                    ) : (
                      <Wallet size={21} aria-hidden="true" />
                    )}
                  </span>
                  <span>{t(key)}</span>
                  <strong>
                    <Money value={resource.data![key] || 0} />
                  </strong>
                </section>
              ))}
          </div>
          <FinanceChart data={resource.data} />
          {editing !== undefined && (
            <Dialog
              title={t(editing ? "edit" : "addExpense")}
              onClose={() => setEditing(undefined)}
            >
              <Form
                key={editing?._id || "new"}
                fields={[
                  { key: "category" },
                  { key: "amount", type: "number", min: 0.01 },
                  { key: "date", type: "date" },
                  { key: "notes", type: "textarea", required: false },
                  {
                    key: "receiptImage",
                    type: "image-upload",
                    required: false,
                  },
                ]}
                initial={
                  editing
                    ? {
                        category: editing.category,
                        amount: editing.amount / 100,
                        date: editing.date.slice(0, 10),
                        notes: editing.notes,
                        receiptImage: editing.receiptImage || "",
                      }
                    : { date: new Date().toISOString().slice(0, 10) }
                }
                submit={(values) =>
                  api(
                    `/staff/expenses${editing ? `/${editing._id}` : ""}`,
                    editing ? "PUT" : "POST",
                    {
                      ...values,
                      amount: Math.round(Number(values.amount) * 100),
                      date: new Date(String(values.date)).toISOString(),
                      receiptImage: values.receiptImage || null,
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
          <section className="surface expense-section">
            <h2>{t("expenseTotal")}</h2>
            <div className="table-wrap">
              <table className="expense-table">
                <thead>
                  <tr>
                    {[
                      "date",
                      "category",
                      "amount",
                      "actor",
                      "notes",
                      "receiptImage",
                      "action",
                    ].map((h) => (
                      <th key={h}>{t(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resource.data.expenses.map((e) => (
                    <tr key={e._id}>
                      <td data-label={t("date")}>
                        <DateText value={e.date} />
                      </td>
                      <td data-label={t("category")}>{e.category}</td>
                      <td data-label={t("amount")} className="expense-amount">
                        <Money value={e.amount} />
                      </td>
                      <td data-label={t("actor")}>{e.createdBy.fullName}</td>
                      <td data-label={t("notes")} className="expense-notes">
                        {e.notes || "—"}
                      </td>
                      <td data-label={t("receiptImage")}>
                        {!e.receiptImage && !e.receiptUrl && "—"}
                        {e.receiptImage && (
                          <button
                            type="button"
                            className="receipt-thumbnail"
                            aria-label={t("viewReceipt")}
                            onClick={() => setReceipt(e.receiptImage)}
                          >
                            <img
                              src={fileUrl(e.receiptImage)}
                              alt={t("receiptImage")}
                              loading="lazy"
                            />
                          </button>
                        )}
                        {e.receiptUrl && (
                          <a
                            href={fileUrl(e.receiptUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {" "}
                            ↗
                          </a>
                        )}
                      </td>
                      <td data-label={t("action")}>
                        <div className="actions expense-actions">
                          <button onClick={() => setEditing(e)}>
                            <ActionLabel action="edit" />
                          </button>
                          <Action
                            path={`/staff/expenses/${e._id}`}
                            method="DELETE"
                            label="delete"
                            confirm
                            onDone={resource.reload}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <State empty={resource.data.expenses.length === 0} />
          </section>
          <div className="card-grid">
            {(["byCategory", "byPerson"] as const).map(
              (key) =>
                resource.data?.[key] && (
                  <section className="surface" key={key}>
                    <h2>{t(key)}</h2>
                    {resource.data[key]?.map((row) => (
                      <div className="breakdown" key={row._id}>
                        <span>{row.name || row._id}</span>
                        <strong>
                          <Money value={row.amount} />
                        </strong>
                      </div>
                    ))}
                  </section>
                ),
            )}
          </div>
        </>
      )}
      {receipt && (
        <Dialog title={t("receiptImage")} onClose={() => setReceipt(undefined)}>
          <img
            className="receipt-preview"
            src={fileUrl(receipt || "")}
            alt={t("receiptImage")}
          />
        </Dialog>
      )}
    </Page>
  );
}
