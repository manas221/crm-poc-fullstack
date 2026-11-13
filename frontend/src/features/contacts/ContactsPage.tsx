import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Contact, Pagination } from '../../types/api.ts';
import { useContacts } from './useContacts.ts';

const DEFAULT_LIMIT = 25;

/** Reads a positive integer from the URL, falling back to the default for junk like ?page=abc. */
function positiveInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : fallback;
}

export function ContactsPage() {
  // Page state lives in the URL, so back/forward and shared links work.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = positiveInt(searchParams.get('page'), 1);
  const limit = Math.min(positiveInt(searchParams.get('limit'), DEFAULT_LIMIT), 100);

  const { data, error, isPending, isFetching, refetch } = useContacts({ page, limit });

  const goToPage = (next: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', String(next));
      return params;
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState page={page} onFirstPage={() => goToPage(1)} />
      ) : (
        <>
          <PaginationBar pagination={data.pagination} busy={isFetching} onPage={goToPage} />
          <ContactsTable contacts={data.data} dimmed={isFetching} />
        </>
      )}
    </div>
  );
}

function PaginationBar({
  pagination,
  busy,
  onPage,
}: {
  pagination: Pagination;
  busy: boolean;
  onPage: (page: number) => void;
}) {
  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const button =
    'rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
      <span>
        Showing <b>{from}</b>–<b>{to}</b> of <b>{total.toLocaleString()}</b>
      </span>
      <div className="flex items-center gap-2">
        <button className={button} disabled={page <= 1 || busy} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <span className="px-2">
          Page <b>{page}</b> of <b>{totalPages}</b>
        </span>
        <button className={button} disabled={page >= totalPages || busy} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

function ContactsTable({ contacts, dimmed }: { contacts: Contact[]; dimmed: boolean }) {
  return (
    <div className={`overflow-x-auto rounded border border-gray-200 transition-opacity ${dimmed ? 'opacity-60' : ''}`}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Company</th>
            <th className="px-3 py-2">Tags</th>
            <th className="px-3 py-2">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {contacts.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">
                {c.firstName} {c.lastName}
              </td>
              <td className="px-3 py-2 text-gray-700">{c.email ?? <Dash />}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700">{c.phone ?? <Dash />}</td>
              <td className="px-3 py-2 text-gray-700">{c.company ?? <Dash />}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <span key={t.id} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      {t.name}
                    </span>
                  ))}
                </div>
              </td>
              {/* The API sends UTC; the browser shows it in the user's local timezone. */}
              <td className="whitespace-nowrap px-3 py-2 text-gray-700">{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Dash = () => <span className="text-gray-400">—</span>;

function LoadingState() {
  // Render's free tier sleeps when idle; say so if the first load is slow.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <p className="py-10 text-center text-gray-500">
      {slow ? 'Waking up server… this can take up to a minute.' : 'Loading contacts…'}
    </p>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-medium">Couldn't load contacts.</p>
      <p className="mt-1">{message}</p>
      <button className="mt-3 rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

function EmptyState({ page, onFirstPage }: { page: number; onFirstPage: () => void }) {
  return (
    <div className="py-10 text-center text-gray-500">
      {page > 1 ? (
        <>
          <p>There are no contacts on page {page}.</p>
          <button className="mt-2 text-blue-600 hover:underline" onClick={onFirstPage}>
            Go to the first page
          </button>
        </>
      ) : (
        <p>No contacts yet.</p>
      )}
    </div>
  );
}
