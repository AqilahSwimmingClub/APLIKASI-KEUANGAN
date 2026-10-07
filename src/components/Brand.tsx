import type { SVGProps } from "react";
export function SavingsIcon(
  props: SVGProps<SVGSVGElement> & { size?: number },
) {
  const { size = 24, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d="M3 9h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
      <path d="M15 13h5v4h-5z" />
      <circle cx="17" cy="5" r="3.5" />
      <path d="M17 3.5v3M15.8 4.2h1.4a.7.7 0 0 1 0 1.4h-1.4" />
    </svg>
  );
}
export function FinanceIllustration() {
  return (
    <img
      className="finance-illustration"
      src="/finance-illustration.png"
      alt="Ilustrasi keuangan keluarga"
      fetchPriority="high"
    />
  );
}
export function StartupBrand() {
  return (
    <div className="startup-brand">
      <img src="/icon-192.png" alt="Dompet dan koin Rupiah" />
      <h1>
        KEUANGAN
        <br />
        RUMAH TANGGA
      </h1>
      <p>Kelola • Rencanakan • Evaluasi</p>
      <small>Membuka penyimpanan aman…</small>
    </div>
  );
}
