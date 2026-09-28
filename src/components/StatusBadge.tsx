import type { Status } from '../data/mock';
import { STATUS_LABELS } from '../data/mock';

const styles: Record<Status, string> = {
  brouillon: 'bg-slate-100 text-slate-600',
  en_attente: 'bg-[#FEF3C7] text-[#B45309]',
  validee: 'bg-[#DCFCE7] text-[#15803D]',
  affectee: 'bg-[#E0F2FE] text-[#0369A1]',
  confirmee: 'bg-[#EDE9FE] text-[#6D28D9]',
  en_cours: 'bg-[#FFF7ED] text-[#C2410C]',
  terminee: 'bg-[#DCFCE7] text-[#166534]',
  annulee: 'bg-slate-100 text-slate-500',
};

const dots: Record<Status, string> = {
  brouillon: 'bg-slate-400',
  en_attente: 'bg-[#F59E0B]',
  validee: 'bg-[#16A34A]',
  affectee: 'bg-[#0284C7]',
  confirmee: 'bg-[#7C3AED]',
  en_cours: 'bg-[#EA580C]',
  terminee: 'bg-[#15803D]',
  annulee: 'bg-slate-400',
};

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const base = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${base} ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
