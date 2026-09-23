import { useState } from 'react';
import { users, vehicles, drivers } from '../data/mock';
import type { Vehicle, Driver } from '../data/mock';

interface Props {
  onNavigate: (page: string) => void;
  onBack: () => void;
  onSubmitMission?: (data: {
    requestKind: RequestKind;
    type: string;
    object: string;
    departure: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    passengers: number;
    vehicleNeeded: boolean;
    vehicleCategory: string;
    vehicleSubtype: string;
    assignedDriverId: string;
    assignedVehicleId: string;
    beneficiaire: string;
    startDate: string;
    notes: string;
  }) => void;
}

type VehicleCategory = 'bus' | 'vehicule' | '';
// service = ponctual mission trip · fonctionnel = durable vehicle assignment to an employee
type RequestKind = 'service' | 'fonctionnel';

const BUS_TYPES = ['Minibus (9 places)', 'Bus standard (30 places)', 'Grand bus (50 places)'];
const CAR_TYPES = ['Berline', 'SUV', 'Monospace', 'Minivan', 'Utilitaire'];

export default function NewMissionForm({ onNavigate, onBack, onSubmitMission }: Props) {
  interface FormState {
    requestKind: RequestKind;
    type: string;
    object: string;
    departure: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    passengers: number;
    vehicleNeeded: boolean;
    vehicleCategory: VehicleCategory;
    vehicleSubtype: string;
    beneficiaire: string;
    startDate: string;
    notes: string;
    assignedDriverId: string;
    assignedVehicleId: string;
  }

  const [form, setForm] = useState<FormState>({
    requestKind: 'service' as RequestKind,
    type: 'externe',
    object: '',
    departure: '',
    destination: '',
    departureDate: '',
    departureTime: '08:00',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    vehicleNeeded: true,
    vehicleCategory: '' as VehicleCategory,
    vehicleSubtype: '',
    // Affectation (fonctionnel) fields — no mission object, no return date
    beneficiaire: '',
    startDate: '',
    notes: '',
    // Assignment fields for service missions
    assignedDriverId: '',
    assignedVehicleId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState(false);
  // Beneficiary autocomplete state
  const [empQuery, setEmpQuery] = useState('');
  const [empOpen, setEmpOpen] = useState(false);

  const empMatches = users.filter(u => {
    const q = empQuery.trim().toLowerCase();
    if (!q) return true;
    return `${u.name} ${u.matricule} ${u.structure}`.toLowerCase().includes(q);
  });

  function pickEmployee(name: string) {
    set('beneficiaire', name);
    setEmpQuery(name);
    setEmpOpen(false);
  }

  function set(field: string, val: unknown) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate(beneficiaryOverride?: string) {
    const e: Record<string, string> = {};
    // Fonctionnel = affectation, not a mission: beneficiary + vehicle + start date only
    if (form.requestKind === 'fonctionnel') {
      const beneficiary = beneficiaryOverride ?? form.beneficiaire;
      if (!beneficiary) e.beneficiaire = 'Tapez un nom puis sélectionnez un employé de la liste.';
      if (!form.vehicleSubtype) e.vehicleSubtype = 'Précisez le type de véhicule souhaité.';
      if (!form.startDate) e.startDate = "La date d'attribution est requise.";
      return e;
    }
    if (!form.object.trim()) e.object = "L'objet est requis.";
    if (!form.departure.trim()) e.departure = 'Le lieu de départ est requis.';
    if (!form.destination.trim()) e.destination = 'La destination est requise.';
    if (!form.departureDate) e.departureDate = 'La date de départ est requise.';
    // La date de retour est facultative : le conducteur déclarera son arrivée.
    if (form.requestKind === 'service' && form.vehicleNeeded) {
      if (!form.assignedDriverId) e.assignedDriverId = 'Choisissez un conducteur disponible.';
      if (!form.assignedVehicleId) e.assignedVehicleId = 'Choisissez un véhicule disponible.';
    } else if (form.vehicleNeeded) {
      if (!form.vehicleCategory) e.vehicleCategory = 'Choisissez un type de véhicule.';
      if (form.vehicleCategory && !form.vehicleSubtype) e.vehicleSubtype = 'Précisez le modèle souhaité.';
    }
    return e;
  }

  function handleSubmit(isDraft: boolean) {
    // Accept an exactly-typed employee name as a selection
    const exactMatch =
      form.requestKind === 'fonctionnel' && !form.beneficiaire
        ? users.find(u => u.name.toLowerCase() === empQuery.trim().toLowerCase())
        : undefined;
    if (exactMatch) {
      setForm(f => ({ ...f, beneficiaire: exactMatch.name }));
      setEmpQuery(exactMatch.name);
    }
    if (!isDraft) {
      const e = validate(exactMatch?.name);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setDraft(isDraft);
    setSubmitted(true);
    if (!isDraft && onSubmitMission) {
      const { requestKind, type, object, departure, destination, departureDate, departureTime, returnDate, returnTime, passengers, vehicleNeeded, vehicleCategory, vehicleSubtype, assignedDriverId, assignedVehicleId, beneficiaire, startDate, notes } = form;
      onSubmitMission({ requestKind, type, object, departure, destination, departureDate, departureTime, returnDate, returnTime, passengers, vehicleNeeded, vehicleCategory, vehicleSubtype, assignedDriverId, assignedVehicleId, beneficiaire, startDate, notes });
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${draft ? 'bg-slate-100' : 'bg-success-bg'}`}>
          {draft ? (
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )}
        </div>
        <h3 className="text-ink text-xl font-bold mb-2">
          {draft ? 'Brouillon enregistré' : form.requestKind === 'fonctionnel' ? "Demande d'affectation transmise" : 'Mission soumise avec succès'}
        </h3>
        <p className="text-muted text-sm mb-8">
          {draft
            ? 'Votre mission a été sauvegardée en brouillon. Vous pouvez la soumettre ultérieurement.'
            : form.requestKind === 'fonctionnel'
              ? "Votre demande d'affectation d'un véhicule fonctionnel a été transmise au responsable de flotte."
              : 'Votre demande de mission a été transmise au responsable de flotte pour validation.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => onNavigate('my-missions')} className="px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-dark transition-colors">
            Voir mes missions
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setEmpQuery('');
              setEmpOpen(false);
              setForm({ requestKind: 'service', type: 'externe', object: '', departure: '', destination: '', departureDate: '', departureTime: '08:00', returnDate: '', returnTime: '', passengers: 1, vehicleNeeded: true, vehicleCategory: '', vehicleSubtype: '', beneficiaire: '', startDate: '', notes: '', assignedDriverId: '', assignedVehicleId: '' });
            }}
            className="px-5 py-2.5 border border-border text-ink rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Nouvelle mission
          </button>
        </div>
      </div>
    );
  }

  const Field = ({ label, error, children, required, optional }: { label: string; error?: string; children: React.ReactNode; required?: boolean; optional?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-2">
        {label}
        {required && <span className="text-danger">*</span>}
        {optional && <span className="text-muted text-xs font-normal">(facultatif)</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-danger focus:ring-danger/20 bg-danger-bg/30' : 'border-border focus:border-navy focus:ring-navy/15 bg-white'
    }`;

  const subtypes = form.vehicleCategory === 'bus' ? BUS_TYPES : form.vehicleCategory === 'vehicule' ? CAR_TYPES : [];

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-ink text-lg font-semibold">Nouvelle demande</h2>
          <p className="text-muted text-sm mt-0.5">Mission de service ou affectation d'un véhicule fonctionnel</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Kind of request — asked first: mission trip or durable assignment */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">1. Type de demande</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set('requestKind', 'service')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  form.requestKind === 'service'
                    ? 'border-navy bg-navy-light/60 text-navy'
                    : 'border-border bg-white text-ink hover:border-navy/30'
                }`}
              >
                <span className={`flex-shrink-0 ${form.requestKind === 'service' ? 'text-navy' : 'text-muted'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v9a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM8 7V5a1 1 0 011-1h6a1 1 0 011 1v2M3 13h18"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold">Mission — De service</p>
                  <p className={`text-xs ${form.requestKind === 'service' ? 'text-navy/70' : 'text-muted'}`}>Déplacement ponctuel avec véhicule et conducteur</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => set('requestKind', 'fonctionnel')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  form.requestKind === 'fonctionnel'
                    ? 'border-navy bg-navy-light/60 text-navy'
                    : 'border-border bg-white text-ink hover:border-navy/30'
                }`}
              >
                <span className={`flex-shrink-0 ${form.requestKind === 'fonctionnel' ? 'text-navy' : 'text-muted'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold">Affectation — Fonctionnel</p>
                  <p className={`text-xs ${form.requestKind === 'fonctionnel' ? 'text-navy/70' : 'text-muted'}`}>Véhicule attribué durablement à un employé précis</p>
                </div>
              </button>
            </div>
          </div>

          {form.requestKind === 'fonctionnel' ? (
            <>
              {/* Affectation: beneficiary, vehicle type, start date — no object, no return */}
              <Field label="Employé bénéficiaire" error={errors.beneficiaire} required>
                <div
                  className="relative"
                  onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setEmpOpen(false); }}
                >
                  <input
                    type="text"
                    placeholder="Tapez un nom, un matricule ou une structure…"
                    className={`${inputClass('beneficiaire')} ${form.beneficiaire ? 'pr-9' : ''}`}
                    value={empQuery}
                    onChange={e => { setEmpQuery(e.target.value); set('beneficiaire', ''); setEmpOpen(true); }}
                    onFocus={() => setEmpOpen(true)}
                  />
                  {form.beneficiaire && (
                    <button
                      type="button"
                      title="Effacer la sélection"
                      onClick={() => { set('beneficiaire', ''); setEmpQuery(''); setEmpOpen(true); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted hover:text-ink hover:bg-slate-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                  {empOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-border shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                      {empMatches.length === 0 ? (
                        <p className="px-4 py-3.5 text-sm text-muted">Aucun employé trouvé pour « {empQuery.trim()} »</p>
                      ) : (
                        empMatches.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onMouseDown={e => { e.preventDefault(); pickEmployee(u.name); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-navy-light/60 transition-colors"
                          >
                            <span className="w-7 h-7 rounded-full bg-navy/10 text-navy text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {u.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-ink truncate">{u.name}</span>
                              <span className="block text-[11px] text-muted truncate">{u.matricule} · {u.structure}</span>
                            </span>
                            {form.beneficiaire === u.name && (
                              <svg className="w-4 h-4 text-navy ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted">Attribution durable : pas d'objet de mission, pas de date de retour.</p>
              </Field>
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Type de véhicule souhaité</p>
                <div className="flex flex-wrap gap-2">
                  {CAR_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('vehicleSubtype', t)}
                      className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        form.vehicleSubtype === t
                          ? 'border-navy bg-navy text-white'
                          : 'border-border bg-white text-ink hover:border-navy/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.vehicleSubtype && <p className="mt-1.5 text-xs text-danger flex items-center gap-1">⚠ {errors.vehicleSubtype}</p>}
              </div>
              <Field label="Date d'attribution" error={errors.startDate} required>
                <input type="date" className={inputClass('startDate')} value={form.startDate} onChange={e => set('startDate', e.target.value)}/>
              </Field>
            </>
          ) : (
            <>
          {/* Type */}
          <Field label="Type de mission" required>
            <div className="flex gap-3">
              {(['interne', 'externe'] as const).map(t => (
                <label key={t} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${form.type === t ? 'border-navy bg-navy-light text-navy' : 'border-border text-ink hover:border-navy/40'}`}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} className="sr-only"/>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.type === t ? 'border-navy' : 'border-muted/50'}`}>
                    {form.type === t && <span className="w-2 h-2 rounded-full bg-navy"/>}
                  </span>
                  <span className="text-sm font-medium capitalize">{t}</span>
                </label>
              ))}
            </div>
          </Field>

          {/* Object */}
          <Field label="Objet de la mission" error={errors.object} required>
            <input type="text" placeholder="ex. Réunion technique – Installation fibre optique" className={inputClass('object')} value={form.object} onChange={e => set('object', e.target.value)}/>
          </Field>

          {/* Departure / Destination */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Lieu de départ" error={errors.departure} required>
              <input type="text" placeholder="ex. Alger" className={inputClass('departure')} value={form.departure} onChange={e => set('departure', e.target.value)}/>
            </Field>
            <Field label="Destination" error={errors.destination} required>
              <input type="text" placeholder="ex. Oran" className={inputClass('destination')} value={form.destination} onChange={e => set('destination', e.target.value)}/>
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de départ" error={errors.departureDate} required>
              <div className="flex gap-2">
                <input type="date" className={`flex-1 ${inputClass('departureDate')}`} value={form.departureDate} onChange={e => set('departureDate', e.target.value)}/>
                <input type="time" className="w-24 px-3 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 transition-all" value={form.departureTime} onChange={e => set('departureTime', e.target.value)}/>
              </div>
            </Field>
            <Field label="Date de retour prévue" error={errors.returnDate} optional>
              <div className="flex gap-2">
                <input type="date" className={`flex-1 ${inputClass('returnDate')}`} value={form.returnDate} onChange={e => set('returnDate', e.target.value)}/>
                <input
                  type="time"
                  className="w-24 px-3 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 transition-all bg-white placeholder:text-muted/50"
                  value={form.returnTime}
                  onChange={e => set('returnTime', e.target.value)}
                  placeholder="--:--"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">Facultatif — le conducteur déclarera son arrivée</p>
            </Field>
          </div>

          {/* Passengers */}
          <Field label="Nombre de passagers (vous inclus)" required>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set('passengers', Math.max(1, form.passengers - 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-ink hover:bg-slate-50 transition-colors text-lg font-medium">−</button>
              <span className="w-12 text-center text-ink font-semibold text-lg">{form.passengers}</span>
              <button type="button" onClick={() => set('passengers', Math.min(50, form.passengers + 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-ink hover:bg-slate-50 transition-colors text-lg font-medium">+</button>
            </div>
          </Field>

          {/* Vehicle section */}
          <div className="rounded-xl border border-border bg-slate-50/50 overflow-hidden">
            {/* Checkbox header */}
            <div className="px-4 py-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.vehicleNeeded}
                  onChange={e => set('vehicleNeeded', e.target.checked)}
                  className="w-4 h-4 accent-navy rounded"
                />
                <div>
                  <p className="text-ink text-sm font-medium">Réserver un véhicule de service</p>
                  <p className="text-muted text-xs">Un véhicule sera affecté à votre mission selon disponibilité</p>
                </div>
              </label>
            </div>

            {form.vehicleNeeded && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">

                {/* Step 1: Bus ou Véhicule */}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">1. Catégorie</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { val: 'bus', label: 'Bus', desc: 'Transport collectif', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="4" y="3" width="16" height="14" rx="2.5"/>
                          <path strokeLinecap="round" d="M4 10.5h16M8 3v3.5M16 3v3.5"/>
                          <circle cx="8" cy="19.5" r="1.6"/><circle cx="16" cy="19.5" r="1.6"/>
                        </svg>
                      )},
                      { val: 'vehicule', label: 'Véhicule', desc: 'Voiture de service', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v-3.2l1.9-4.4A2 2 0 016.7 7.5h8.5l3.3 3.9h1.7a1.3 1.3 0 011.3 1.3v3.8"/>
                          <circle cx="7.5" cy="17" r="1.8"/><circle cx="16.8" cy="17" r="1.8"/>
                          <path strokeLinecap="round" d="M11.5 7.5v4"/>
                        </svg>
                      )},
                    ] as const).map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => { set('vehicleCategory', opt.val); set('vehicleSubtype', ''); set('vehicleUsage', ''); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          form.vehicleCategory === opt.val
                            ? 'border-navy bg-navy-light/60 text-navy'
                            : 'border-border bg-white text-ink hover:border-navy/30'
                        }`}
                      >
                        <span className={form.vehicleCategory === opt.val ? 'text-navy' : 'text-muted'}>{opt.icon}</span>
                        <div>
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className={`text-xs ${form.vehicleCategory === opt.val ? 'text-navy/70' : 'text-muted'}`}>{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.vehicleCategory && <p className="mt-1.5 text-xs text-danger flex items-center gap-1">⚠ {errors.vehicleCategory}</p>}
                </div>

                {/* Step 2: Subtype */}
                {form.vehicleCategory && (
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">2. Type souhaité</p>
                    <div className="flex flex-wrap gap-2">
                      {subtypes.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set('vehicleSubtype', t)}
                          className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                            form.vehicleSubtype === t
                              ? 'border-navy bg-navy text-white'
                              : 'border-border bg-white text-ink hover:border-navy/40'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.vehicleSubtype && <p className="mt-1.5 text-xs text-danger flex items-center gap-1">⚠ {errors.vehicleSubtype}</p>}
                  </div>
                )}

                {/* Usage is now chosen at the top ("Type de demande") */}
              </div>
            )}
          </div>
            </>
          )}

          {/* Driver & Vehicle Assignment (for service missions with vehicle) */}
          {form.requestKind === 'service' && form.vehicleNeeded && (
            <>
              <div className="rounded-xl border border-border bg-slate-50/50 overflow-hidden">
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">3. Affectation</p>
                  <p className="text-muted text-xs">Choisissez le conducteur et le véhicule pour cette mission</p>
                </div>
                <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
                  {/* Driver selection */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Conducteur</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {drivers
                        .filter(d => d.status === 'disponible')
                        .map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => set('assignedDriverId', d.id)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                              form.assignedDriverId === d.id
                                ? 'border-navy bg-navy-light'
                                : 'border-border hover:border-navy/40'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-full bg-navy/10 text-navy text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {d.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-ink text-sm font-semibold truncate">{d.name}</span>
                              <span className="block text-[11px] text-muted truncate">{d.matricule} · Permis {d.licenceCategories.join('+')}</span>
                            </span>
                            {form.assignedDriverId === d.id && (
                              <svg className="w-4 h-4 text-navy ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      {drivers.filter(d => d.status === 'disponible').length === 0 && (
                        <p className="text-muted text-sm">Aucun conducteur disponible</p>
                      )}
                    </div>
                    {errors.assignedDriverId && <p className="mt-1.5 text-xs text-danger flex items-center gap-1">⚠ {errors.assignedDriverId}</p>}
                  </div>

                  {/* Vehicle selection */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Véhicule</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {vehicles
                        .filter(v => v.status === 'disponible')
                        .map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => set('assignedVehicleId', v.id)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                              form.assignedVehicleId === v.id
                                ? 'border-navy bg-navy-light'
                                : 'border-border hover:border-navy/40'
                            }`}
                          >
                            <p className="text-ink text-sm font-semibold">{v.brand} {v.model}</p>
                            <p className="font-mono text-[11px] text-muted mt-0.5">{v.registration} · {v.capacity} places · {v.type}</p>
                            {form.assignedVehicleId === v.id && (
                              <svg className="w-4 h-4 text-navy ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      {vehicles.filter(v => v.status === 'disponible').length === 0 && (
                        <p className="text-muted text-sm">Aucun véhicule disponible</p>
                      )}
                    </div>
                    {errors.assignedVehicleId && <p className="mt-1.5 text-xs text-danger flex items-center gap-1">⚠ {errors.assignedVehicleId}</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes / motif */}
          <Field label={form.requestKind === 'fonctionnel' ? 'Motif de la demande' : 'Observations / Remarques'} optional>
            <textarea
              rows={3}
              placeholder="Informations complémentaires, contraintes particulières…"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 bg-white resize-none transition-all"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </Field>
        </div>

        <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex items-center justify-between rounded-b-xl">
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors">
            Annuler
          </button>
          <div className="flex gap-3">
            <button onClick={() => handleSubmit(true)} className="px-4 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
              Enregistrer brouillon
            </button>
            <button onClick={() => handleSubmit(false)} className="px-5 py-2.5 bg-navy hover:bg-navy-dark text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              Soumettre la demande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
