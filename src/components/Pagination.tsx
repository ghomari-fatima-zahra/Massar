import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface Props {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, pageSize, itemLabel, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3.5">
      <p className="text-sm text-muted">
        {totalItems} {itemLabel}
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          aria-label="Page précédente"
          title="Page précédente"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        {pages.map(pageNumber => (
          <button
            key={pageNumber}
            type="button"
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}
            className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold transition-colors ${
              pageNumber === page
                ? 'border-navy bg-navy text-white'
                : 'border-border text-muted hover:bg-slate-50 hover:text-ink'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          aria-label="Page suivante"
          title="Page suivante"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </nav>
    </div>
  );
}
