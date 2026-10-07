import { useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X, WalletCards } from "lucide-react";
import { saveFile } from "../core/files";
import { monthLabel, rupiah, shiftMonth, change } from "../core/ledger";
export function Logo() {
  return (
    <div className="logo">
      <img src="/icon-192.png" alt="Dompet dan koin Rupiah" />
    </div>
  );
}
export function Credit() {
  return (
    <footer className="credit">
      Dirancang &amp; Dikembangkan oleh
      <br />
      <strong>FAHMI DJAWAS, S.Pd.</strong>
      <br />
      <span>© 2026 Semua Hak Dilindungi</span>
    </footer>
  );
}
export function Modal({
  title,
  children,
  onClose,
  dismissible = true,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const dismissRef = useRef(dismissible);
  const marker = useRef(crypto.randomUUID());
  const mounted = useRef(false);
  closeRef.current = onClose;
  dismissRef.current = dismissible;
  useEffect(() => {
    mounted.current = true;
    const id = marker.current;
    if (history.state?.krtModal !== id)
      history.pushState({ ...history.state, krtModal: id }, "");
    const pop = (event: PopStateEvent) => {
      if (event.state?.krtModal !== id) {
        if (dismissRef.current) closeRef.current();
        else history.pushState({ ...event.state, krtModal: id }, "");
      }
    };
    window.addEventListener("popstate", pop);
    ref.current?.showModal();
    return () => {
      mounted.current = false;
      window.removeEventListener("popstate", pop);
      queueMicrotask(() => {
        if (!mounted.current && history.state?.krtModal === id) history.back();
      });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
    >
      <header className="modal-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Tutup"
          disabled={!dismissible}
          onClick={onClose}
        >
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function MonthPicker({
  month,
  setMonth,
}: {
  month: string;
  setMonth: (m: string) => void;
}) {
  const [year, m] = month.split("-");
  const y = Number(year);
  return (
    <div className="month-picker">
      <button
        className="icon-button"
        aria-label="Bulan sebelumnya"
        onClick={() => setMonth(shiftMonth(month, -1))}
      >
        <ChevronLeft size={18} />
      </button>
      <select
        aria-label="Bulan"
        value={m}
        onChange={(e) => setMonth(`${year}-${e.target.value}`)}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>
            {monthLabel(`2026-${String(i + 1).padStart(2, "0")}`).split(" ")[0]}
          </option>
        ))}
      </select>
      <select
        aria-label="Tahun"
        value={year}
        onChange={(e) => setMonth(`${e.target.value}-${m}`)}
      >
        {Array.from(
          { length: Math.max(21, y - 2016 + 11) },
          (_, i) => 2016 + i,
        ).map((y) => (
          <option key={y}>{y}</option>
        ))}
      </select>
      <button
        className="icon-button"
        aria-label="Bulan berikutnya"
        onClick={() => setMonth(shiftMonth(month, 1))}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty">
      <WalletCards />
      <p>{children}</p>
    </div>
  );
}
export function Panel({
  title,
  children,
  action,
  hidden = false,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  hidden?: boolean;
}) {
  return (
    <section className="panel" hidden={hidden}>
      <div className="panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Delta({ now, prev }: { now: number; prev: number }) {
  const p = change(now, prev);
  return (
    <span className={`delta ${p !== null && p < 0 ? "down" : "up"}`}>
      {p === null
        ? "Baru"
        : `${p === 0 ? "→" : p > 0 ? "↗" : "↘"} ${Math.abs(p).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`}
      <small> vs bulan lalu</small>
    </span>
  );
}
export function MoneyInput({
  label,
  name,
  defaultValue = 0,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: number;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <div className="money-input">
        <span>Rp</span>
        <input
          name={name}
          aria-label={label}
          inputMode="numeric"
          type="text"
          pattern="[0-9.]+"
          defaultValue={defaultValue || ""}
          required={required}
          onInput={(e) => {
            const el = e.currentTarget;
            const n = el.value.replace(/\D/g, "");
            el.value = n ? Number(n).toLocaleString("id-ID") : "";
          }}
          placeholder="0"
        />
      </div>
    </label>
  );
}
export const amountOf = (f: FormData, n = "amount") =>
  Number(String(f.get(n) ?? "").replaceAll(".", ""));
export function download(content: BlobPart, name: string, type: string) {
  void saveFile(content, name, type).catch((e) =>
    window.dispatchEvent(
      new CustomEvent("krt-error", {
        detail: e instanceof Error ? e.message : "Ekspor gagal.",
      }),
    ),
  );
}
export function Metric({
  label,
  value,
  previous,
  color,
}: {
  label: string;
  value: number;
  previous: number;
  color: string;
}) {
  return (
    <div className={`metric ${color}`}>
      <span>{label}</span>
      <strong>{rupiah(value)}</strong>
      <div>
        <Delta now={value} prev={previous} />
      </div>
      <small>Bulan lalu {rupiah(previous)}</small>
    </div>
  );
}
