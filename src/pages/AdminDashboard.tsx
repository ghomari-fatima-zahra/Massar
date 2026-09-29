import { useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bus,
  Car,
  ChartBar,
  Check,
  Clock,
  FileArrowDown,
  ListChecks,
  MapPin,
  Plus,
  SquaresFour,
  Truck,
  UsersThree,
  Wrench,
  X,
} from '@phosphor-icons/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { currentUsers, drivers, missions, vehicles } from '../data/mock';
import type { Status } from '../data/mock';

interface Props {
  onNavigate: (page: string, id?: string) => void;
  statusOverrides: Record<string, Status>;
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const STATUS_TONE: Record<Status, string> = {
  brouillon: 'neutral',
  en_attente: 'warning',
  validee: 'success',
  affectee: 'info',
  confirmee: 'info',
  en_cours: 'accent',
  terminee: 'success',
  annulee: 'neutral',
};

const STATUS_LABELS: Record<Status, string> = {
  brouillon: 'Brouillon',
  en_attente: 'Programmée',
  validee: 'Validée',
  affectee: 'Affectée',
  confirmee: 'Confirmée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

const statusStyles: Record<string, string> = {
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  info: 'bg-[var(--info-soft)] text-[var(--info)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
  neutral: 'bg-[var(--surface-muted)] text-[var(--ink-muted)]',
};

function StatusPill({ tone, children }: { tone: string; children: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[tone] ?? statusStyles.neutral}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function Sparkline({ tone = 'accent' }: { tone?: 'accent' | 'success' | 'info' | 'neutral' }) {
  const stroke = {
    accent: 'var(--accent)',
    success: 'var(--success)',
    info: 'var(--info)',
    neutral: 'var(--line-strong)',
  }[tone];
  return (
    <svg
      className="mt-4 h-8 w-full overflow-visible"
      viewBox="0 0 100 32"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points="0,25 14,22 28,24 42,14 56,17 70,10 84,13 100,5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'neutral',
  onClick,
}: {
  label: string;
  value: string;
  helper: string;
  icon: any;
  tone?: 'accent' | 'success' | 'info' | 'neutral';
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      title={onClick ? `Filtrer : ${label}` : undefined}
      className={`rounded-2xl border bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${
        onClick ? 'cursor-pointer' : ''
      } border-[var(--line)]`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-lg ${
            tone === 'accent'
              ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
              : tone === 'success'
                ? 'bg-[var(--success-soft)] text-[var(--success)]'
                : tone === 'info'
                  ? 'bg-[var(--info-soft)] text-[var(--info)]'
                  : 'bg-[var(--surface-muted)] text-[var(--ink-soft)]'
          }`}
        >
          <Icon size={18} weight="regular" />
        </div>
        <p className="text-xl font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]">
          {label}
        </p>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="tabular-nums text-[28px] font-semibold leading-none tracking-[-0.03em] text-[var(--ink)]">
          {value}
        </p>
        <p className="text-xs text-[var(--ink-muted)]">{helper}</p>
      </div>
      <Sparkline tone={tone} />
    </article>
  );
}

function DonutRing({
  value,
  total,
  color,
  label,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
}) {
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  const filled = total > 0 ? (value / total) * circumference : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[58px] w-[58px] shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 58 58" aria-hidden="true">
          <circle cx="29" cy="29" r={radius} fill="none" stroke="var(--line)" strokeWidth="5" />
          <circle
            cx="29"
            cy="29"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums text-[var(--ink)]">
          {value}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--ink-soft)]">{label}</p>
        <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">sur {total}</p>
      </div>
    </div>
  );
}

function VehicleTypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  const Icon = t.includes('bus') || t.includes('minivan') ? Bus : Car;
  return <Icon size={16} />;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-xs text-white shadow-[var(--shadow-lg)]">
      <p className="font-semibold">{label}</p>
      <p className="mt-0.5 text-white/70">{payload[0].value} missions</p>
    </div>
  );
}

export default function AdminDashboard({ onNavigate, statusOverrides }: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const effMissions = missions.map((m) => (statusOverrides[m.id] ? { ...m, status: statusOverrides[m.id] } : m));
  const filteredMissions = effMissions;
  const totalMissions = filteredMissions.length;
  const activeMissions = filteredMissions.filter((m) => m.status === 'en_cours');
  const availableVehicles = vehicles.filter((v) => v.status === 'disponible');
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance');
  const assignedVehicles = vehicles.filter(
    (v) => v.status === 'affecte' || v.status === 'indisponible',
  );
  const availableDrivers = drivers.filter((d) => d.status === 'disponible');
  const fleetPct =
    vehicles.length > 0 ? Math.round((availableVehicles.length / vehicles.length) * 100) : 0;

  const currentMonth = new Date().getMonth();
  const missionData = MONTH_LABELS.map((month, idx) => ({
    month,
    missions: filteredMissions.filter((m) => {
      const d = new Date(m.departureDate);
      return !Number.isNaN(d.getTime()) && d.getMonth() === idx;
    }).length,
    current: idx === currentMonth,
  }));

  const recentMissions = [...filteredMissions]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  const recentActivity = [...filteredMissions].slice(0, 4).map((m) => ({
    title: `${m.object} — ${STATUS_LABELS[m.status]}`,
    meta: `${m.departure} → ${m.destination} · ${new Date(m.departureDate).toLocaleDateString('fr-DZ')}`,
    icon: m.status === 'terminee' ? Check : m.status === 'en_attente' ? Clock : ListChecks,
    tone: STATUS_TONE[m.status],
  }));

  const today = new Date();
  const greeting =
    today.getHours() < 12 ? 'Bonjour' : today.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';
  const admin = currentUsers.admin;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  }

  function exportCsv() {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filteredMissions.map(mission => [mission.id, mission.object, mission.employee, mission.departure, mission.destination, mission.departureDate, STATUS_LABELS[mission.status]]);
    const content = [['ID', 'Objet', 'Demandeur', 'Départ', 'Destination', 'Date', 'Statut'], ...rows].map(row => row.map(escape).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'rapport-missions-massar.csv';
    link.click();
    setExportOpen(false);
    showToast('Le rapport CSV a été téléchargé.');
  }

  function exportChartPng() {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    const svgText = new XMLSerializer()
      .serializeToString(svg)
      .split('var(--navy)').join('#075985')
      .split('var(--accent)').join('#f97316')
      .split('var(--line)').join('#e2e8f0')
      .split('var(--ink-muted)').join('#64748b');
    const canvas = document.createElement('canvas');
    const width = svg.clientWidth || 900;
    const height = svg.clientHeight || 300;
    canvas.width = width * 2;
    canvas.height = height * 2;
    const image = new Image();
    image.onload = () => {
      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = 'missions-par-mois.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Le graphique PNG a été téléchargé.');
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
    setExportOpen(false);
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-0 text-[2rem] font-semibold leading-tight tracking-[-0.035em] text-[var(--ink)]">
            {greeting}, {admin.name}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            {today.toLocaleDateString('fr-DZ', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="relative">
            <button type="button" onClick={() => setExportOpen(open => !open)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              <FileArrowDown size={16} /> Exporter
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-12 z-20 w-60 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lg)]">
                <button type="button" onClick={exportCsv} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-muted)]"><FileArrowDown size={16} /> Exporter les missions CSV</button>
                <button type="button" onClick={exportChartPng} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-muted)]"><ChartBar size={16} /> Exporter le graphique PNG</button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('new-mission')}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-xs font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <Plus size={16} weight="bold" />
            Nouvelle mission
          </button>
          </div>
        </div>
      </section>

      <section aria-label="Indicateurs clés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Missions totales"
          value={String(totalMissions)}
          helper="enregistrées"
          icon={ListChecks}
          tone="accent"
          onClick={() => onNavigate('fleet-missions', 'all')}
        />
        <MetricCard
          label="Missions actives"
          value={String(activeMissions.length)}
          helper="en déplacement"
          icon={MapPin}
          tone="info"
          onClick={() => onNavigate('fleet-missions', 'en_cours')}
        />
        <MetricCard
          label="Conducteurs disponibles"
          value={String(availableDrivers.length)}
          helper="en ligne"
          icon={UsersThree}
          tone="neutral"
          onClick={() => onNavigate('admin-drivers')}
        />
        <MetricCard
          label="Disponibilité flotte"
          value={`${fleetPct} %`}
          helper={`${availableVehicles.length} véhicules libres`}
          icon={Car}
          tone="success"
          onClick={() => onNavigate('admin-vehicles')}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.65fr)]">
        <article className="order-2 min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <ChartBar size={15} />
                </span>
                <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]">Missions par mois</h2>
              </div>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">Volume de missions enregistrées.</p>
            </div>
          </div>
          <div ref={chartRef} className="mt-6 h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missionData} barSize={22} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 14, fill: 'var(--ink-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 14, fill: 'var(--ink-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-muted)' }} />
                <Bar dataKey="missions" radius={[5, 5, 0, 0]}>
                  {missionData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.current ? 'var(--accent)' : 'var(--navy)'}
                      fillOpacity={entry.missions === 0 ? 0.15 : entry.current ? 1 : 0.72}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-5 text-[11px] text-[var(--ink-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[var(--navy)]" />
              Missions enregistrées
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[var(--accent)]" />
              Mois en cours
            </span>
          </div>
        </article>

        <article className="order-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Missions récentes</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">Tous statuts confondus.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('fleet-missions')}
              className="shrink-0 text-sm font-semibold text-[var(--accent-strong)] hover:underline"
            >
              Voir tout
            </button>
          </div>
          <div className="mt-2 space-y-3">
            {recentMissions.map((mission) => (
              <div key={mission.id} className="flex items-start gap-3 border-t border-[var(--line)] pt-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-[var(--ink)]">{mission.object}</p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {new Date(mission.departureDate).toLocaleDateString('fr-DZ')} · {mission.departureTime}
                  </p>
                </div>
                <StatusPill tone={STATUS_TONE[mission.status]}>{STATUS_LABELS[mission.status]}</StatusPill>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--ink-muted)]">
                  <Truck size={15} />
                </span>
                <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]">État de la flotte</h2>
              </div>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">
                Disponibilité et affectation des véhicules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin-vehicles')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-strong)] hover:underline"
            >
              Gérer le parc <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="mt-6 grid gap-4 border-b border-[var(--line)] pb-5 sm:grid-cols-3">
            <DonutRing
              value={availableVehicles.length}
              total={vehicles.length}
              color="var(--success)"
              label="Disponibles"
            />
            <DonutRing
              value={maintenanceVehicles.length}
              total={vehicles.length}
              color="var(--warning)"
              label="Maintenance"
            />
            <DonutRing
              value={assignedVehicles.length}
              total={vehicles.length}
              color="var(--info)"
              label="Affectés"
            />
          </div>
          <div className="mt-3 divide-y divide-[var(--line)]">
            {vehicles.map((vehicle) => {
              const tone =
                vehicle.status === 'disponible'
                  ? 'success'
                  : vehicle.status === 'maintenance'
                    ? 'warning'
                    : 'info';
              const label =
                vehicle.status === 'disponible'
                  ? 'Disponible'
                  : vehicle.status === 'maintenance'
                    ? 'Maintenance'
                    : vehicle.status === 'affecte'
                      ? 'Affecté'
                      : 'Indisponible';
              return (
                <div key={vehicle.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--ink-soft)]">
                    <VehicleTypeIcon type={vehicle.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--ink)]">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{vehicle.registration}</p>
                  </div>
                  <StatusPill tone={tone}>{label}</StatusPill>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--ink-soft)]">
                  <SquaresFour size={15} />
                </span>
                <h2 className="text-lg font-semibold text-[var(--ink)]">Activité récente</h2>
              </div>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Les dernières mises à jour de votre espace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('fleet-missions')}
              className="text-sm font-semibold text-[var(--accent-strong)] hover:underline"
            >
              Voir tout
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3">
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${statusStyles[item.tone]}`}>
                    <Icon size={16} weight="regular" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-[var(--ink)]">{item.title}</p>
                    <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{item.meta}</p>
                  </div>
                </div>
              );
            })}
            {maintenanceVehicles.length > 0 && (
              <div className="flex gap-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${statusStyles.warning}`}>
                  <Wrench size={16} weight="regular" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-5 text-[var(--ink)]">
                    Maintenance planifiée pour {maintenanceVehicles[0].brand} {maintenanceVehicles[0].model}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                    {maintenanceVehicles[0].registration}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-[var(--line)] pt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                Conducteurs disponibles
              </p>
              <button
                type="button"
                onClick={() => onNavigate('admin-drivers')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-strong)] hover:underline"
              >
                {availableDrivers.length} en ligne
              </button>
            </div>
            <div className="mt-3 flex -space-x-2">
              {availableDrivers.map((driver) => {
                const initials = driver.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('');
                return (
                  <div
                    key={driver.id}
                    title={driver.name}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--surface)] bg-[var(--navy)] text-[10px] font-bold text-white"
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>

      {toast && (
        <div
          className="fixed bottom-5 right-5 z-40 flex max-w-sm items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-lg)]"
          role="status"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
            <Check size={15} weight="bold" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--ink)]">Action confirmée</p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--ink-muted)]">{toast}</p>
          </div>
          <button
            type="button"
            aria-label="Fermer la notification"
            onClick={() => setToast(null)}
            className="rounded p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
