import { useState } from 'react';

interface Props {
  onLogin: () => void;
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19c.7-3.1 3.1-4.8 6.5-4.8s5.8 1.7 6.5 4.8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.5" y="10.2" width="13" height="9.5" rx="2" />
      <path d="M8.2 10.2V7.8a3.8 3.8 0 0 1 7.6 0v2.4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 12h14" />
      <path d="m13 6.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6.5 12.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5M12 16h.01" />
    </svg>
  );
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('n.ferdi@dot.dz');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setError('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  }

  function handleForgotPassword() {
    setForgotSent(true);
    setError('');
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-mobile-brand">
            <div className="login-brand-heading">
              <div className="login-supplied-logo" aria-hidden="true">
                <img src="/logo-size-variations.png" alt="" />
              </div>
              <p className="login-brand-name">Massar</p>
            </div>
            <p className="login-tagline">Planifiez vos missions, affectez véhicules et conducteurs, suivez chaque déplacement en temps réel.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Identifiant professionnel</label>
              <div className="login-input-wrap">
                <UserIcon />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="prenom.nom@dot.dz"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="login-input-wrap">
                <LockIcon />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                />
              </div>
              <button className="login-forgot" type="button" onClick={handleForgotPassword}>
                Mot de passe oublié ?
              </button>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="login-checkbox"><CheckIcon /></span>
                <span>Se souvenir de moi</span>
              </label>
            </div>

            {forgotSent && (
              <p className="login-notice" role="status">
                Un lien de réinitialisation sera envoyé à votre adresse professionnelle.
              </p>
            )}

            {error && (
              <div className="login-error" role="alert">
                <AlertIcon />
                <p>{error}</p>
              </div>
            )}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? (
                <span className="login-loading"><span /> Connexion en cours…</span>
              ) : (
                <span>Se connecter <ArrowIcon /></span>
              )}
            </button>
          </form>

          <div className="login-divider"><span>ACCÈS RÉSERVÉ AU PERSONNEL</span></div>

        </div>
      </section>
      <footer className="login-panel-footer">
        <span>© 2026 Massar Fleet. Tous droits réservés.</span>
        <span>Version 1.0.0</span>
      </footer>
    </main>
  );
}
