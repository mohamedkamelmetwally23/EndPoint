import {
  Plus,
  Pencil,
  Trash2,
  Info,
  Save,
  X,
  Archive,
  LogIn,
  LogOut,
  UserPlus,
  Check,
  ShieldCheck,
  RotateCcw,
  Download,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../i18n/context";
const icons: Record<string, LucideIcon> = {
  create: Plus,
  addExpense: Plus,
  addSubject: Plus,
  addLecture: Plus,
  addMaterial: Plus,
  edit: Pencil,
  delete: Trash2,
  details: Info,
  save: Save,
  cancel: X,
  archive: Archive,
  login: LogIn,
  logout: LogOut,
  register: UserPlus,
  assign: ShieldCheck,
  markCompleted: Check,
  resetDevice: RotateCcw,
  getFree: Download,
  loading: LoaderCircle,
};
export function ActionLabel({
  action,
  compact,
}: {
  action: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const Icon = icons[action];
  const iconOnly = compact ?? ["edit", "delete", "details"].includes(action);
  return (
    <span
      className={`action-label${iconOnly ? " action-label--icon" : ""}`}
      title={t(action)}
    >
      {Icon && (
        <Icon
          size={18}
          aria-hidden="true"
          className={action === "loading" ? "spin" : undefined}
        />
      )}
      <span className={iconOnly ? "sr-only" : undefined}>{t(action)}</span>
    </span>
  );
}
