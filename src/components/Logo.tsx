interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export default function Logo({ collapsed = false, className = '' }: LogoProps) {
  if (collapsed) {
    return (
      <svg viewBox="0 0 60 60" className={`w-8 h-8 ${className}`} fill="none">
        <path d="M8 42C12 22 28 10 44 10c8 0 14 5 14 5" stroke="#075985" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="8" cy="42" r="6" fill="#075985" opacity="0.9"/>
        <circle cx="50" cy="18" r="7" fill="#F97316"/>
        <circle cx="50" cy="18" r="4" fill="white"/>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 100 60" className="w-14 h-9" fill="none">
        <path d="M8 46C14 24 32 10 52 10c12 0 18 7 26 7s14-7 24-7" stroke="#075985" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 46h52" stroke="#F59E0B" strokeWidth="4" strokeDasharray="3 14" strokeLinecap="round"/>
        <circle cx="8" cy="46" r="7" fill="#075985" opacity="0.95"/>
        <circle cx="90" cy="10" r="9" fill="#F97316"/>
        <circle cx="90" cy="10" r="5" fill="white"/>
      </svg>
      <div>
        <div className="text-navy font-bold text-xl leading-none tracking-tight">Massar</div>
        <div className="text-navy/60 font-semibold text-[10px] tracking-[0.2em] uppercase mt-0.5">Fleet</div>
      </div>
    </div>
  );
}
