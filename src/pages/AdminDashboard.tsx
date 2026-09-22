import { useState } from 'react';
import { missions, vehicles, drivers, users } from '../data/mock';

interface Props {
  onNavigate: (page: string) => void;
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const COUNTS = [4, 7, 5, 9, 12, 8, 6, 11, 13, 0, 0, 0];

const SPARKLINE = [3, 5, 4, 7, 6, 8, 11, 13];

// SVG brand marks for each car manufacturer
function BrandMark({ brand, className = '' }: { brand: string; className?: string }) {
  const cls = `w-10 h-10 ${className}`;

  if (brand === 'Toyota') return (
    <svg viewBox="0 0 40 40" className={cls} fill="none">
      {/* Toyota three-oval logo */}
      <ellipse cx="20" cy="20" rx="19" ry="8" stroke="currentColor" strokeWidth="2.5"/>
      <ellipse cx="20" cy="20" rx="8" ry="16" stroke="currentColor" strokeWidth="2.5"/>
      <ellipse cx="20" cy="20" rx="13" ry="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  if (brand === 'Renault') return (
    <svg viewBox="0 0 40 40" className={cls} fill="none">
      {/* Renault diamond */}
      <polygon points="20,3 35,12 35,28 20,37 5,28 5,12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <polygon points="20,10 29,16 29,24 20,30 11,24 11,16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );

  if (brand === 'Hyundai') return (
    <svg viewBox="0 0 40 40" className={cls} fill="none">
      {/* Hyundai H in oval */}
      <ellipse cx="20" cy="20" rx="19" ry="13" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M11 14v12M29 14v12M11 20h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );

  if (brand === 'Peugeot') return (
    <svg viewBox="0 0 40 40" className={cls} fill="none">
      {/* Peugeot lion simplified — circle + P */}
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M14 28V12h7a5 5 0 010 10h-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (brand === 'Mercedes') return (
    <svg viewBox="0 0 40 40" className={cls} fill="none">
      {/* Mercedes three-pointed star */}
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="20" cy="20" r="2.5" fill="currentColor"/>
      {/* Three arms at 90°, 210°, 330° */}
      <line x1="20" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="20" x2="34.4" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="20" x2="5.6" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );

  // Generic fallback
  return (
    <svg viewBox="0 0 40 40" className={cls} fill="none">
      <rect x="3" y="11" width="34" height="18" rx="4" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="10" cy="29" r="4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="30" cy="29" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 18h34" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

// Proper bar chart with Y-axis, gridlines, and tooltips
function MissionChart({ hoveredMonth, setHoveredMonth }: {
  hoveredMonth: number | null;
  setHoveredMonth: (i: number | null) => void;
}) {
  const max = Math.max(...COUNTS);
  const yTicks = [0, 4, 8, 12, 16]; // nice round values above max (13)
  const chartH = 140;
  const chartW = 280;
  const padLeft = 28;
  const padBottom = 22;
  const padTop = 12;
  const innerH = chartH - padBottom - padTop;
  const barCount = COUNTS.length;
  const barAreaW = chartW - padLeft - 8;
  const barW = Math.floor(barAreaW / barCount) - 4;
  const barSlot = Math.floor(barAreaW / barCount);

  function barY(val: number) {
    return padTop + innerH - (val / 16) * innerH;
  }
  function barH(val: number) {
    return (val / 16) * innerH;
  }

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: chartH }}>
      {/* Y-axis gridlines and labels */}
      {yTicks.map(tick => {
        const y = barY(tick);
        return (
          <g key={tick}>
            <line x1={padLeft} y1={y} x2={chartW - 4} y2={y}
              stroke="#E2E8F0" strokeWidth="1" strokeDasharray={tick === 0 ? 'none' : '4 3'}/>
            <text x={padLeft - 4} y={y + 3.5} textAnchor="end"
              fontSize="8" fill="#94A3B8" fontFamily="Inter,sans-serif">{tick}</text>
          </g>
        );
      })}

      {/* Bars */}
      {COUNTS.map((count, idx) => {
        const x = padLeft + idx * barSlot + (barSlot - barW) / 2;
        const bh = barH(count);
        const by = barY(count);
        const hovered = hoveredMonth === idx;
        const isCurrent = idx === 8; // Sep = current month (0-indexed)
        const fill = hovered ? '#F97316' : isCurrent ? '#0EA5E9' : '#075985';

        return (
          <g key={idx}
            onMouseEnter={() => setHoveredMonth(idx)}
            onMouseLeave={() => setHoveredMonth(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Hover bg */}
            {hovered && (
              <rect x={padLeft + idx * barSlot} y={padTop}
                width={barSlot} height={innerH}
                fill="#F1F5F9" rx="3"/>
            )}
            {/* Bar */}
            <rect x={x} y={by} width={barW} height={bh}
              fill={fill} rx="3" opacity={hovered ? 1 : 0.85}/>
            {/* Tooltip */}
            {hovered && (
              <>
                <rect x={x - 4} y={by - 20} width={barW + 8} height={17} rx="4" fill="#0F172A"/>
                <text x={x + barW / 2} y={by - 8} textAnchor="middle"
                  fontSize="9" fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{count}</text>
              </>
            )}
            {/* Month label */}
            <text x={x + barW / 2} y={chartH - 5} textAnchor="middle"
              fontSize="8" fill={hovered ? '#0F172A' : '#94A3B8'}
              fontWeight={hovered || isCurrent ? '700' : '400'}
              fontFamily="Inter,sans-serif">
              {MONTHS[idx]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminDashboard({ onNavigate }: Props) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const totalMissions = missions.length;
  const activeMissions = missions.filter(m => ['en_cours', 'affectee', 'confirmee'].includes(m.status)).length;
  const pendingValidation = missions.filter(m => m.status === 'en_attente').length;
  const availableVehicles = vehicles.filter(v => v.status === 'disponible').length;
  const availableDrivers = drivers.filter(d => d.status === 'disponible').length;
  const activeUsers = users.filter(u => u.status === 'actif').length;

  const cards = [
    {
      label: 'Missions totales',
      value: totalMissions,
      sub: '+2 ce mois',
      bg: 'from-[#075985] to-[#0C4A6E]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
      ),
      page: 'fleet-missions',
    },
    {
      label: 'En cours / Affectées',
      value: activeMissions,
      sub: 'Déplacements actifs',
      bg: 'from-[#F97316] to-[#EA580C]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polygon fill="currentColor" stroke="none" points="10,8 16,12 10,16"/>
        </svg>
      ),
      page: 'fleet-missions',
    },
    {
      label: 'En attente validation',
      value: pendingValidation,
      sub: 'À traiter',
      bg: 'from-[#B45309] to-[#92400E]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      page: 'fleet-missions',
    },
    {
      label: 'Véhicules disponibles',
      value: `${availableVehicles}/${vehicles.length}`,
      sub: `${vehicles.filter(v => v.status === 'maintenance').length} en maintenance`,
      bg: 'from-[#15803D] to-[#166534]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zm0 0l3-4h2l2 4-1 2H13"/>
        </svg>
      ),
      page: 'admin-vehicles',
    },
    {
      label: 'Conducteurs disponibles',
      value: `${availableDrivers}/${drivers.length}`,
      sub: 'Permis à surveiller',
      bg: 'from-[#0369A1] to-[#075985]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
      page: 'admin-drivers',
    },
    {
      label: 'Utilisateurs actifs',
      value: activeUsers,
      sub: `${users.length} au total`,
      bg: 'from-[#6D28D9] to-[#5B21B6]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      ),
      page: 'admin-structures',
    },
  ];

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Bonjour' : today.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="max-w-7xl space-y-6">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #063F5E 0%, #075985 60%, #0C4A6E 100%)' }}>
        <div className="absolute right-0 top-0 bottom-0 w-96 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 200" className="absolute right-0 top-0 h-full opacity-10" fill="none">
            <circle cx="350" cy="50" r="120" stroke="white" strokeWidth="2"/>
            <circle cx="350" cy="50" r="80" stroke="white" strokeWidth="1.5"/>
            <circle cx="350" cy="50" r="40" stroke="white" strokeWidth="1"/>
            <path d="M80 160 C 140,100 220,140 300,80 S 380,60 400,40" stroke="white" strokeWidth="2" strokeDasharray="6 4"/>
            <circle cx="80" cy="160" r="6" fill="white"/>
            <circle cx="400" cy="40" r="6" fill="#F97316"/>
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-white/50 text-sm mb-1">
            {today.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h2 className="text-white text-2xl font-bold">{greeting}, Nadia 👋</h2>
          <p className="text-white/60 text-sm mt-1">
            {activeMissions > 0
              ? `${activeMissions} mission(s) active(s) en ce moment.`
              : 'Tout est à jour. Bonne journée !'}
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => onNavigate('fleet-missions')}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/20"
          >
            Voir les missions
          </button>
          <button
            onClick={() => onNavigate('new-mission')}
            className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle mission
          </button>
        </div>
      </div>

      {/* KPI cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.page)}
            className={`relative overflow-hidden rounded-2xl p-5 text-left bg-gradient-to-br ${card.bg} hover:scale-[1.02] transition-transform shadow-md`}
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/8" />
            <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute bottom-0 left-0 right-0 h-14 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 80 40" preserveAspectRatio="none">
                <polyline
                  points={SPARKLINE.map((v, i) => `${(i / (SPARKLINE.length - 1)) * 80},${40 - (v / Math.max(...SPARKLINE)) * 35}`).join(' ')}
                  fill="none" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-white text-3xl font-bold">{card.value}</p>
              <p className="text-white/50 text-xs mt-1">{card.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Improved bar chart */}
        <div className="col-span-1 bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-ink font-semibold">Missions par mois</h3>
              <p className="text-muted text-xs mt-0.5">Exercice 2026</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-muted">
                <span className="w-2.5 h-2.5 rounded-sm bg-navy inline-block"/>Missions
              </span>
              <span className="flex items-center gap-1 text-muted">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0EA5E9] inline-block"/>Mois actuel
              </span>
            </div>
          </div>
          <MissionChart hoveredMonth={hoveredMonth} setHoveredMonth={setHoveredMonth} />
        </div>

        {/* Fleet status with brand marks */}
        <div className="col-span-1 bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-ink font-semibold">État de la flotte</h3>
            <button onClick={() => onNavigate('admin-vehicles')} className="text-navy text-xs font-medium hover:underline">Gérer →</button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {vehicles.map(v => {
              const isAvail = v.status === 'disponible';
              const isMaint = v.status === 'maintenance';
              return (
                <div key={v.id} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 ${
                  isAvail ? 'border-green-200 bg-success-bg' :
                  isMaint ? 'border-orange-200 bg-warning-bg' :
                  'border-border bg-slate-50'
                }`}>
                  <BrandMark
                    brand={v.brand}
                    className={`w-9 h-9 ${
                      isAvail ? 'text-success' :
                      isMaint ? 'text-warning' :
                      'text-muted'
                    }`}
                  />
                  <p className="text-ink text-[11px] font-bold leading-tight text-center">{v.brand} {v.model}</p>
                  <p className="font-mono text-[9px] text-muted">{v.registration}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isAvail ? 'text-success bg-success/10' :
                    isMaint ? 'text-warning bg-warning/10' :
                    'text-muted bg-muted/10'
                  }`}>
                    {isAvail ? '● Disponible' : isMaint ? '● Maintenance' : '● Affecté'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="col-span-1 bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-ink font-semibold">Activité récente</h3>
            <button onClick={() => onNavigate('fleet-missions')} className="text-navy text-xs font-medium hover:underline">Voir tout →</button>
          </div>
          <div className="space-y-3">
            {missions.slice(0, 5).map(m => {
              const statusLabel =
                m.status === 'en_cours' ? 'En cours' :
                m.status === 'terminee' ? 'Terminée' :
                m.status === 'rejetee' ? 'Rejetée' :
                m.status === 'en_attente' ? 'En attente' :
                m.status === 'affectee' ? 'Affectée' :
                m.status === 'validee' ? 'Validée' : 'Brouillon';
              return (
                <div key={m.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    m.status === 'en_cours' ? 'bg-orange' :
                    m.status === 'terminee' ? 'bg-success' :
                    m.status === 'rejetee' ? 'bg-danger' :
                    m.status === 'en_attente' ? 'bg-[#F59E0B]' : 'bg-navy'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-xs font-semibold truncate">{m.object}</p>
                    <p className="text-muted text-[11px]">{m.departure} → {m.destination}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    m.status === 'en_cours' ? 'text-[#C2410C] bg-[#FFF7ED]' :
                    m.status === 'terminee' ? 'text-success bg-success-bg' :
                    m.status === 'rejetee' ? 'text-danger bg-danger-bg' :
                    m.status === 'en_attente' ? 'text-warning bg-warning-bg' :
                    'text-navy bg-navy-light'
                  }`}>{statusLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <h4 className="text-ink text-xs font-semibold uppercase tracking-wider mb-3">Conducteurs</h4>
            <div className="space-y-2">
              {drivers.map(d => (
                <div key={d.id} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-navy text-[10px] font-bold flex-shrink-0">
                    {d.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <p className="text-ink text-xs font-medium flex-1 truncate">{d.name}</p>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    d.status === 'disponible' ? 'bg-success' :
                    d.status === 'en_mission' ? 'bg-orange' : 'bg-muted'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
