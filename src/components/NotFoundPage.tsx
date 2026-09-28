import { ArrowLeft, House, WarningCircle } from '@phosphor-icons/react';

interface Props {
  onBack: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  eyebrow?: string;
  error?: boolean;
}

export default function NotFoundPage({
  onBack,
  title = 'Page introuvable',
  description = 'La page demandée n’existe pas ou a été déplacée.',
  actionLabel = 'Retour au tableau de bord',
  eyebrow = 'Erreur 404',
  error = false,
}: Props) {
  const Icon = error ? WarningCircle : House;

  return (
    <section className="grid min-h-[min(560px,calc(100vh-190px))] place-items-center">
      <div className="max-w-xl text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--ink-soft)]">
          <Icon size={28} weight="regular" />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[var(--ink-muted)]">{description}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--navy)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        >
          {error ? <ArrowLeft size={18} /> : <House size={18} />}
          {actionLabel}
        </button>
      </div>
    </section>
  );
}
