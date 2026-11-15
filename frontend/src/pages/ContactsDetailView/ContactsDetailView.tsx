import { Link, useParams } from 'react-router';

// Placeholder until Phase 2 (detail view). Already routed so a deep link like
// /contacts/42 can be checked against Render's SPA rewrite.
export function ContactsDetailView() {
  const { id } = useParams();

  return (
    <section className="space-y-4">
      <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
        ← Back to contacts
      </Link>
      <h1 className="text-3xl font-semibold text-gray-900">Contact #{id}</h1>
      <p className="text-gray-500">The detail view comes in Phase 2.</p>
    </section>
  );
}
