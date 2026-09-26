import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: string; up?: boolean };
  onClick?: () => void;
}

export default function KPICard({ label, value, icon, iconBg = 'bg-navy-light', trend, onClick }: Props) {
  return (
    <div
      className={`bg-white rounded-xl border border-border p-5 flex items-start gap-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className={`${iconBg} rounded-xl p-3 flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-muted text-sm font-medium truncate">{label}</p>
        <p className="text-ink text-2xl font-bold mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.up ? 'text-success' : 'text-muted'}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
