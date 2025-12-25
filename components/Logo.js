// components/Logo.js
// Ontographia logo component

export default function Logo({ size = 24, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
    >
      <rect width="512" height="512" rx="100" fill="#1f2937" />
      <g transform="translate(256,256) scale(4.5)">
        <g stroke="#e5e7eb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="0" y1="-38" x2="30" y2="-8" />
          <line x1="30" y1="-8" x2="24" y2="24" />
          <line x1="24" y1="24" x2="-26" y2="26" />
          <line x1="0" y1="-38" x2="10" y2="4" />
          <line x1="0" y1="-38" x2="-14" y2="0" />
          <line x1="30" y1="-8" x2="10" y2="4" />
          <line x1="-26" y1="26" x2="-14" y2="0" />
          <line x1="24" y1="24" x2="10" y2="4" />
          <line x1="-14" y1="0" x2="10" y2="4" />
        </g>
        <g fill="#e5e7eb">
          <circle cx="0" cy="-38" r="4.8" />
          <circle cx="30" cy="-8" r="4.8" />
          <circle cx="24" cy="24" r="4.8" />
          <circle cx="-26" cy="26" r="4.8" />
          <circle cx="10" cy="4" r="4" />
          <circle cx="-14" cy="0" r="4" />
        </g>
      </g>
    </svg>
  );
}

// Inline version for use in styled-jsx contexts
export function LogoInline({ size = 24 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Logo size={size} />
    </span>
  );
}
