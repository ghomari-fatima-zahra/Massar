import { useState } from 'react';
import Logo from '../components/Logo';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('n.ferdi@dot.dz');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez renseigner tous les champs.'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 800);
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8FAFC' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0" style={{ background: '#063F5E' }}>
        <div className="px-10 pt-12">
          <Logo />
        </div>
        <div className="flex-1 flex flex-col justify-center px-10 pb-16">
          <h2 className="text-white text-3xl font-bold leading-snug mb-3">
            Gestion des missions<br />et de la flotte
          </h2>
          <p className="text-white/50 text-base leading-relaxed">
            Plateforme interne de gestion des déplacements professionnels et des véhicules de service — DG Algérie Télécom.
          </p>
          <div className="mt-12 space-y-4">
            {[
              { label: 'Pilotage centralisé', desc: 'Toutes les missions et ressources en un seul endroit' },
              { label: 'Validation rapide', desc: 'Circuit d\'approbation structuré et traçable' },
              { label: 'Affectation intelligente', desc: 'Gestion optimisée des véhicules et conducteurs' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-white/45 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-10 pb-8">
          <p className="text-white/25 text-xs">DG · Algérie Télécom · Accès administrateur</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="px-6 py-4 rounded-2xl" style={{ background: '#063F5E' }}>
              <Logo />
            </div>
          </div>

          <h2 className="text-ink text-2xl font-bold mb-1">Connexion</h2>
          <p className="text-muted text-sm mb-8">Espace administrateur Massar Fleet</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="prenom.nom@dot.dz"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-ink">Mot de passe</label>
                <button type="button" className="text-xs text-navy hover:underline">Mot de passe oublié ?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-danger-bg rounded-lg">
                <svg className="w-4 h-4 text-danger flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy hover:bg-navy-dark text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion en cours…
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-muted text-xs mt-8">© 2026 Algérie Télécom · DG – Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
