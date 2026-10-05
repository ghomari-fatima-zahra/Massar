import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Check,
  Clock,
  Drop,
  GasPump,
  Gauge,
  Heartbeat,
  Lifebuoy,
  MapPin,
  Plus,
  Receipt,
  Toolbox,
  TrendUp,
  User,
  WarningCircle,
  Wrench,
  X,
} from '@phosphor-icons/react';
import type { Driver, Mission, Vehicle } from '../data/mock';
import { STATUS_LABELS, drivers } from '../data/mock';
import { FUEL_PRICE_DA, SERVICE_INTERVAL_KM, getTelemetry, missionsOfVehicle } from '../data/telemetry';
import type { ServiceEntry } from '../data/telemetry';
import { api, type VehicleTelemetry } from '../api/client';

interface Props {
  vehicle: Vehicle;
  assignment: { mission: Mission; driver: Driver | null } | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Vehicle['status']) => void;
  onDelete: (id: string) => void;
}

type Tab = 'apercu' | 'entretien' | 'carburant' | 'missions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'entretien', label: 'Entretien' },
  { id: 'carburant', label: 'Carburant' },
  { id: 'missions', label: 'Missions' },
];

const STATUS_PILL: Record<Vehicle['status'], string> = {
  disponible: 'bg-success-bg text-success',
  affecte: 'bg-navy-light text-navy',
  maintenance: 'bg-warning-bg text-warning',
  indisponible: 'bg-slate-100 text-muted',
};

const STATUS_LABEL_FR: Record<Vehicle['status'], string> = {
  disponible: 'Disponible',
  affecte: 'Affecté',
  maintenance: 'En maintenance',
  indisponible: 'Hors service',
};

const fmtNb = (n: number) => n.toLocaleString('fr-DZ');
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });

function HealthRing({ value }: { value: number }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const color = value >= 85 ? 'var(--success)' : value >= 70 ? 'var(--warning)' : 'var(--danger, #DC2626)';
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${(value / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[var(--ink)]">
        <span className="relative text-lg font-bold tabular-nums leading-none">
          {value}
          <span className="absolute left-full top-0 ml-0.5 text-[10px] font-semibold">%</span>
        </span>
      </span>
    </div>
  );
}

function GaugeBar({ value, tone }: { value: number; tone: 'success' | 'warning' | 'danger' | 'info' }) {
  const color =
    tone === 'success' ? 'bg-[var(--success)]' : tone === 'warning' ? 'bg-[var(--warning)]' : tone === 'danger' ? 'bg-red-500' : 'bg-[var(--info)]';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function WearRow({ label, value, invert, onChange }: { label: string; value: number; invert?: boolean; onChange?: (v: number) => void }) {
  const tone = invert
    ? value >= 60 ? 'success' : value >= 30 ? 'warning' : 'danger'
    : value >= 60 ? 'danger' : value >= 30 ? 'warning' : 'success';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--ink-soft)]">{label}</p>
        <p className="text-xs font-bold tabular-nums text-[var(--ink)]">{value} %</p>
      </div>
      <GaugeBar value={value} tone={tone} />
      {onChange && (
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="mt-2 w-full accent-[#075985]"
        />
      )}
    </div>
  );
}

function MiniTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[var(--ink)] px-2.5 py-1.5 text-[11px] text-white shadow-lg">
      <span className="font-semibold">{label}</span>
      <span className="ml-1.5 text-white/70">
        {fmtNb(payload[0].value)} {suffix}
      </span>
    </div>
  );
}

export default function VehicleTelemetryModal({ vehicle, assignment, onClose, onStatusChange, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>('apercu');
  const [remoteTelemetry, setRemoteTelemetry] = useState<VehicleTelemetry | null>(null);
  const [services, setServices] = useState<ServiceEntry[]>(() => getTelemetry(vehicle).services);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Vehicle['status'] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [svc, setSvc] = useState({ date: new Date().toISOString().slice(0, 10), km: '', type: 'Vidange + filtres', center: '', cost: '' });

  useEffect(() => {
    let active = true;
    void api.vehicleTelemetry(vehicle.id).then((telemetry) => {
      if (!active) return;
      setRemoteTelemetry(telemetry);
      setServices(telemetry.services);
    }).catch(() => {
      // The deterministic local telemetry remains a useful fallback while the API is unavailable.
    });
    return () => { active = false; };
  }, [vehicle.id]);

  const base = useMemo(() => remoteTelemetry ?? getTelemetry(vehicle), [remoteTelemetry, vehicle]);
  // Wear variables are editable: the health index is recomputed live from them.
  const [tweak, setTweak] = useState({
    brake: base.brakeWearPct,
    tire: base.tireWearPct,
    oil: base.oilLifePct,
  });
  const [savedTweak, setSavedTweak] = useState(tweak);
  const dirty =
    tweak.brake !== savedTweak.brake || tweak.tire !== savedTweak.tire || tweak.oil !== savedTweak.oil;
  const healthScore = Math.max(
    5,
    Math.min(99, Math.round(100 - 0.35 * tweak.brake - 0.3 * tweak.tire - 0.35 * (100 - tweak.oil))),
  );
  const t = {
    ...base,
    brakeWearPct: tweak.brake,
    tireWearPct: tweak.tire,
    oilLifePct: tweak.oil,
    healthScore,
  };
  const history = useMemo(() => missionsOfVehicle(vehicle.id), [vehicle.id]);

  const inspDate = new Date(vehicle.nextInspection);
  const inspDays = Math.ceil((inspDate.getTime() - Date.now()) / 86400000);
  const overdue = inspDays < 0;
  const upcoming = !overdue && (inspDays <= 45 || t.nextServiceKm <= 1500 || t.healthScore < 75);

  const kmProgress = Math.min(1, Math.max(0, 1 - t.nextServiceKm / SERVICE_INTERVAL_KM));
  const fuelTone = t.fuelLevelPct >= 50 ? 'success' : t.fuelLevelPct >= 25 ? 'warning' : 'danger';
  const monthDelta = t.monthlyKm[11] - t.monthlyKm[10];

  const kmCurve = t.monthlyLabels.map((m, i) => ({ m, km: t.monthlyKm[i] }));
  const fuelCurve = t.monthlyLabels.slice(-6).map((m, i) => ({
    m,
    da: Math.round((t.monthlyKm[6 + i] / 100) * t.avgConsumption * FUEL_PRICE_DA),
  }));

  function driverName(id?: string): string {
    if (!id) return '—';
    return drivers.find((d) => d.id === id)?.name ?? '—';
  }

  async function addService() {
    if (!svc.date || !svc.km || !svc.center || !svc.cost) return;
    try {
      const saved = await api.createVehicleService(vehicle.id, { date: svc.date, km: Number(svc.km), type: svc.type, center: svc.center, costDA: Number(svc.cost) });
      setServices((s) => [saved, ...s]);
    } catch {
      setServices((s) => [{ id: `S-${Date.now()}`, date: svc.date, km: Number(svc.km), type: svc.type, center: svc.center, costDA: Number(svc.cost) }, ...s]);
    }
    setShowServiceForm(false);
    setSvc({ date: new Date().toISOString().slice(0, 10), km: '', type: 'Vidange + filtres', center: '', cost: '' });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--page)] p-5 shadow-[var(--shadow-lg)] sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--navy)] text-white">
              <Wrench size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--ink)]">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-[var(--ink-muted)]">
                {vehicle.registration} · {vehicle.id} · {vehicle.type} · {vehicle.capacity} places
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_PILL[vehicle.status]}`}>
              {STATUS_LABEL_FR[vehicle.status]}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Alert banner */}
        <div
          className={`mt-4 flex items-start gap-3 rounded-xl border p-3.5 ${
            overdue
              ? 'border-red-200 bg-red-50'
              : upcoming
                ? 'border-[var(--warning)]/25 bg-[var(--warning-soft)]'
                : 'border-[var(--success)]/25 bg-[var(--success-soft)]'
          }`}
        >
          <WarningCircle
            size={18}
            className={`mt-0.5 shrink-0 ${overdue ? 'text-red-500' : upcoming ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}
          />
          <div>
            <p className="text-xs font-semibold text-[var(--ink)]">
              {overdue ? 'Maintenance en retard' : upcoming ? 'Entretien à prévoir' : 'Véhicule sain'}
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-[var(--ink-soft)]">
              {overdue
                ? `Contrôle technique dépassé depuis ${Math.abs(inspDays)} jour(s) — planifiez une intervention.`
                : `Prochaine vidange dans ${fmtNb(t.nextServiceKm)} km (≈ ${t.nextServiceDays} jours). Contrôle technique : ${fmtDate(vehicle.nextInspection)}.`}
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 text-[var(--ink-muted)]">
              <Gauge size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Odomètre</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-[var(--ink)]">
              {fmtNb(t.odometerKm)} <span className="text-xs font-semibold">km</span>
            </p>
            <p className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${monthDelta >= 0 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
              <TrendUp size={13} weight="bold" />
              {monthDelta >= 0 ? '+' : ''}{fmtNb(monthDelta)} km ce mois
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 text-[var(--ink-muted)]">
              <GasPump size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Carburant estimé</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-[var(--ink)]">
              {t.fuelLevelPct} <span className="text-xs font-semibold">%</span>
            </p>
            <div className="mt-2"><GaugeBar value={t.fuelLevelPct} tone={fuelTone} /></div>
            <p className="mt-1.5 text-[11px] text-[var(--ink-muted)]">{t.avgConsumption} L/100 km · {fmtNb(t.monthlyFuelDA)} DA/mois</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 text-[var(--ink-muted)]">
              <Heartbeat size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Indice santé</p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <HealthRing value={t.healthScore} />
              <p className="text-xs font-semibold text-[var(--ink-soft)]">
                {t.healthScore >= 85 ? 'Bon état' : t.healthScore >= 70 ? 'État correct' : 'À surveiller'}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 text-[var(--ink-muted)]">
              <Toolbox size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Prochain entretien</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-[var(--ink)]">
              {fmtNb(t.nextServiceKm)} <span className="text-xs font-semibold">km</span>
            </p>
            <div className="mt-2"><GaugeBar value={kmProgress * 100} tone={t.nextServiceKm <= 1500 ? 'warning' : 'info'} /></div>
            <p className="mt-1.5 text-[11px] text-[var(--ink-muted)]">Intervalle vidange : {fmtNb(SERVICE_INTERVAL_KM)} km</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                tab === tb.id
                  ? 'bg-[var(--navy)] text-white shadow-sm'
                  : 'text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* TAB: Aperçu */}
        {tab === 'apercu' && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Fiche technique</h4>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Marque', value: vehicle.brand },
                  { label: 'Modèle', value: vehicle.model },
                  { label: 'Immatriculation', value: vehicle.registration },
                  { label: 'GPS / Traceur', value: vehicle.gps },
                  { label: 'Type', value: vehicle.type },
                  { label: 'Capacité', value: `${vehicle.capacity} places` },
                  { label: 'Identifiant', value: vehicle.id },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-[var(--surface-muted)] p-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">{s.label}</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-[var(--ink)]">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
                <h4 className="text-sm font-semibold text-[var(--ink)]">Usure & fluides</h4>
                <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                  Ajustez les curseurs pour suivre l'usure — l'indice santé se recalcule.
                </p>
                <div className="mt-4 space-y-4">
                  <WearRow label="Plaquettes de frein (usure)" value={t.brakeWearPct} onChange={(v) => setTweak((s) => ({ ...s, brake: v }))} />
                  <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                    <Lifebuoy size={14} />
                    <div className="flex-1"><WearRow label="Pneus (usure bande de roulement)" value={t.tireWearPct} onChange={(v) => setTweak((s) => ({ ...s, tire: v }))} /></div>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                    <Drop size={14} />
                    <div className="flex-1"><WearRow label="Huile moteur (vie restante)" value={t.oilLifePct} invert onChange={(v) => setTweak((s) => ({ ...s, oil: v }))} /></div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
                <h4 className="text-sm font-semibold text-[var(--ink)]">Mission actuelle</h4>
                {assignment ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      {assignment.mission.id} — {assignment.mission.object}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                      <MapPin size={13} /> {assignment.mission.departure} → {assignment.mission.destination}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                      <User size={13} /> {assignment.driver ? assignment.driver.name : driverName(assignment.mission.driverId)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-[var(--ink-muted)]">Aucune mission en cours pour ce véhicule.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Entretien */}
        {tab === 'entretien' && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--ink)]">Prochaine vidange</h4>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    Dans <span className="font-bold text-[var(--ink)]">{fmtNb(t.nextServiceKm)} km</span> ou ≈ {t.nextServiceDays} jours
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowServiceForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)]"
                >
                  <Plus size={15} weight="bold" /> Ajouter un entretien
                </button>
              </div>
              <div className="mt-3"><GaugeBar value={kmProgress * 100} tone={t.nextServiceKm <= 1500 ? 'warning' : 'info'} /></div>
              {showServiceForm && (
                <div className="mt-4 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--page)] p-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[var(--ink-soft)]">Date</label>
                    <input type="date" value={svc.date} onChange={(e) => setSvc({ ...svc, date: e.target.value })} className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[var(--ink-soft)]">Kilométrage</label>
                    <input type="number" placeholder={String(t.odometerKm)} value={svc.km} onChange={(e) => setSvc({ ...svc, km: e.target.value })} className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[var(--ink-soft)]">Type d'intervention</label>
                    <select value={svc.type} onChange={(e) => setSvc({ ...svc, type: e.target.value })} className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)]">
                      {['Vidange + filtres', 'Inspection technique', 'Plaquettes de frein', 'Remplacement pneus', 'Révision complète', 'Parallélisme / géométrie', 'Autre'].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[var(--ink-soft)]">Centre</label>
                    <input type="text" placeholder="Atelier…" value={svc.center} onChange={(e) => setSvc({ ...svc, center: e.target.value })} className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[var(--ink-soft)]">Coût (DA)</label>
                    <input type="number" placeholder="0" value={svc.cost} onChange={(e) => setSvc({ ...svc, cost: e.target.value })} className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)]" />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addService}
                      disabled={!svc.date || !svc.km || !svc.center || !svc.cost}
                      className="h-9 rounded-lg bg-[var(--navy)] px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Historique des interventions</h4>
              <div className="relative mt-4">
                <div className="absolute bottom-0 left-3.5 top-0 w-px bg-[var(--line)]" />
                <div className="space-y-4">
                  {services.map((s) => (
                    <div key={s.id} className="relative flex gap-3">
                      <div className="z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--ink-soft)]">
                        <Wrench size={13} />
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl border border-[var(--line)] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[var(--ink)]">{s.type}</p>
                          <p className="text-xs font-bold tabular-nums text-[var(--ink)]">{fmtNb(s.costDA)} DA</p>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                          {fmtDate(s.date)} · {fmtNb(s.km)} km · {s.center}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Carburant */}
        {tab === 'carburant' && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Conso. moyenne</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">{t.avgConsumption} <span className="text-xs font-semibold">L/100 km</span></p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Dépense du mois</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">{fmtNb(t.monthlyFuelDA)} <span className="text-xs font-semibold">DA</span></p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Prix référence</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">{FUEL_PRICE_DA} <span className="text-xs font-semibold">DA/L</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Dépenses carburant — 6 derniers mois (DA)</h4>
              <div className="mt-3 h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fuelCurve} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 14, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 14, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<MiniTooltip suffix="DA" />} cursor={{ fill: 'var(--surface-muted)' }} />
                    <Bar dataKey="da" fill="var(--accent)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                <Receipt size={15} /> Journal des pleins
              </h4>
              <div className="mt-3 divide-y divide-[var(--line)]">
                {t.fuelLogs.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-[var(--ink)]">{fmtDate(f.date)} · {fmtNb(f.km)} km</p>
                      <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{f.liters} L</p>
                    </div>
                    <p className="text-xs font-bold tabular-nums text-[var(--ink)]">{fmtNb(f.costDA)} DA</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Missions */}
        {tab === 'missions' && (
          <div className="mt-4 space-y-4">
            {assignment && (
              <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-strong)]">Mission en cours</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  {assignment.mission.id} — {assignment.mission.object}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-soft)]">
                  <MapPin size={13} /> {assignment.mission.departure} → {assignment.mission.destination}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-soft)]">
                  <User size={13} /> {assignment.driver ? assignment.driver.name : driverName(assignment.mission.driverId)}
                </p>
              </div>
            )}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Historique des missions du véhicule</h4>
              <div className="mt-3 space-y-2.5">
                {history.length === 0 && (
                  <p className="text-xs text-[var(--ink-muted)]">Aucune mission enregistrée pour ce véhicule.</p>
                )}
                {history.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--ink-soft)]">
                      <Clock size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[var(--ink)]">{m.object}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                        {m.id} · {m.departure} → {m.destination} · {driverName(m.driverId)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                      {STATUS_LABELS[m.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Kilométrage mensuel (km)</h4>
              <div className="mt-3 h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kmCurve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 14, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 14, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<MiniTooltip suffix="km" />} cursor={{ stroke: 'var(--line-strong)' }} />
                    <Area type="monotone" dataKey="km" stroke="var(--navy)" strokeWidth={2} fill="var(--info-soft)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Status switch with confirmation */}
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Changer le statut</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['disponible', 'maintenance', 'indisponible'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPendingStatus(s)}
                className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  vehicle.status === s && !pendingStatus
                    ? 'border-[var(--navy)] bg-[var(--navy)] text-white'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--navy)]'
                }`}
              >
                {STATUS_LABEL_FR[s]}
              </button>
            ))}
          </div>
          {pendingStatus && pendingStatus !== vehicle.status && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[var(--warning-soft)] p-3">
              <p className="flex-1 text-xs font-medium text-[var(--ink)]">
                Confirmer le passage en « {STATUS_LABEL_FR[pendingStatus]} » ?
              </p>
              <button
                type="button"
                onClick={() => { onStatusChange(vehicle.id, pendingStatus); setPendingStatus(null); }}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--navy)] px-3 py-1.5 text-xs font-semibold text-white"
              >
                <Check size={14} weight="bold" /> Confirmer
              </button>
              <button
                type="button"
                onClick={() => setPendingStatus(null)}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {confirmDelete ? (
            <div className="mr-auto flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5">
              <p className="text-xs font-semibold text-red-700">Supprimer définitivement ce véhicule ?</p>
              <button
                type="button"
                onClick={() => onDelete(vehicle.id)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]"
              >
                Annuler
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mr-auto rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Supprimer
              </button>
              {dirty && (
                <p className="text-[11px] font-semibold text-[var(--warning)]">
                  Usure modifiée — enregistrez pour mettre à jour l'indice santé
                </p>
              )}
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            Fermer
          </button>
          {dirty && (
            <button
              type="button"
              onClick={() => setSavedTweak(tweak)}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)]"
            >
              <Check size={14} weight="bold" /> Enregistrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
