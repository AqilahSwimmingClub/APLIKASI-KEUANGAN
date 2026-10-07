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
    <svg
      className="finance-illustration"
      viewBox="0 0 520 260"
      role="img"
      aria-label="Ilustrasi keuangan keluarga"
    >
      <defs>
        <linearGradient id="walletGradient" x2="1" y2="1">
          <stop stopColor="#4b83f5" />
          <stop offset="1" stopColor="#164580" />
        </linearGradient>
      </defs>
      <ellipse
        cx="270"
        cy="231"
        rx="204"
        ry="17"
        fill="#163b78"
        opacity=".08"
      />
      <circle cx="268" cy="133" r="109" fill="#e7f0ff" />
      <circle cx="434" cy="76" r="27" fill="#e2eeff" />
      <path
        d="M61 120L111 72l50 48v82H61Z"
        fill="#fff"
        stroke="#afc8ed"
        strokeWidth="3"
      />
      <path
        d="M49 123L111 64l62 59"
        fill="none"
        stroke="#234b84"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="83" y="149" width="29" height="53" rx="3" fill="#72a0df" />
      <rect x="123" y="138" width="20" height="24" rx="3" fill="#b6d5f8" />
      <rect
        x="340"
        y="48"
        width="115"
        height="135"
        rx="15"
        fill="#fff"
        stroke="#d1e0f4"
        strokeWidth="2"
      />
      <path
        d="M357 139V92M357 139h77"
        fill="none"
        stroke="#d7e2f1"
        strokeWidth="2"
      />
      <rect x="369" y="111" width="12" height="28" rx="3" fill="#a2c3f4" />
      <rect x="390" y="92" width="12" height="47" rx="3" fill="#719feb" />
      <rect x="411" y="74" width="12" height="65" rx="3" fill="#366be1" />
      <path
        d="M366 97l25-25 18 2 22-24"
        fill="none"
        stroke="#24a381"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M422 48h13v13" fill="none" stroke="#24a381" strokeWidth="4" />
      <rect
        x="194"
        y="56"
        width="64"
        height="120"
        rx="6"
        transform="rotate(-16 194 56)"
        fill="#8bd6b9"
      />
      <rect
        x="208"
        y="63"
        width="39"
        height="74"
        rx="5"
        transform="rotate(-16 208 63)"
        fill="none"
        stroke="#408970"
        strokeWidth="2"
      />
      <rect
        x="244"
        y="44"
        width="60"
        height="126"
        rx="6"
        transform="rotate(8 244 44)"
        fill="#b1e4cd"
      />
      <text x="258" y="86" fill="#408970" fontSize="18" fontWeight="700">
        Rp
      </text>
      <rect
        x="160"
        y="117"
        width="188"
        height="106"
        rx="21"
        fill="url(#walletGradient)"
      />
      <path
        d="M172 117v-10a10 10 0 0 1 10-10h130"
        fill="none"
        stroke="#1a4787"
        strokeWidth="8"
      />
      <rect x="295" y="145" width="66" height="41" rx="11" fill="#123564" />
      <circle cx="313" cy="166" r="5" fill="#9bc3ff" />
      <path
        d="M185 197h65"
        stroke="#99bdf7"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="396" cy="209" r="33" fill="#edba55" />
      <circle
        cx="396"
        cy="209"
        r="26"
        fill="#ffe09a"
        stroke="#c89232"
        strokeWidth="2"
      />
      <text x="379" y="216" fill="#9d691f" fontSize="19" fontWeight="750">
        Rp
      </text>
      <circle cx="113" cy="222" r="20" fill="#f6cc79" />
      <text x="102" y="227" fill="#9d691f" fontSize="12" fontWeight="700">
        Rp
      </text>
      <path
        d="M465 187l7-12m-1 22 14-2M43 168l-12 3M45 185l-9 10"
        stroke="#9dbbe4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
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
