import {
  Wallet,
  ShoppingCart,
  Car,
  Utensils,
  GraduationCap,
  ShieldPlus,
  House,
  Gift,
  Briefcase,
  Zap,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";
import { SavingsIcon } from "./Brand";
export function FinanceIcon({
  name = "",
  type = "expense",
  kind,
}: {
  name?: string;
  type?: string;
  kind?: string;
}) {
  const lower = name.toLocaleLowerCase("id");
  const Icon =
    kind === "savings"
      ? SavingsIcon
      : kind === "investment"
        ? TrendingUp
        : /gaji/.test(lower)
          ? Wallet
          : /belanja/.test(lower)
            ? ShoppingCart
            : /makan/.test(lower)
              ? Utensils
              : /transport|bensin|parkir/.test(lower)
                ? Car
                : /pendidikan/.test(lower)
                  ? GraduationCap
                  : /kesehatan/.test(lower)
                    ? ShieldPlus
                    : /rumah/.test(lower)
                      ? House
                      : /honor|usaha/.test(lower)
                        ? Briefcase
                        : /bonus|hiburan/.test(lower)
                          ? Gift
                          : /tagihan|listrik/.test(lower)
                            ? Zap
                            : CircleDollarSign;
  const color =
    kind === "savings"
      ? "blue"
      : kind === "investment"
        ? "purple"
        : type === "income"
          ? "green"
          : /makan|tagihan|listrik/.test(lower)
            ? "gold"
            : /pendidikan/.test(lower)
              ? "purple"
              : /transport/.test(lower)
                ? "blue"
                : "red";
  return (
    <span className={`finance-icon ${color}`} aria-hidden="true">
      <Icon size={23} />
    </span>
  );
}
