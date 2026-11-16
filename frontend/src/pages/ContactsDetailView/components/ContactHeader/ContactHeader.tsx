import type { Contact } from '../../../../types/api.ts';

/** The contact's name and company. */
export function ContactHeader({ contact }: { contact: Contact }) {
  const { firstName, lastName, company } = contact;
  return (
    <header className="min-w-0">
      <h1 className="text-3xl font-semibold break-words text-gray-900">
        {firstName} {lastName}
      </h1>
      {company && <p className="mt-1 text-base break-words text-gray-500">{company}</p>}
    </header>
  );
}
