import { Link } from 'react-router';

export function NotFoundView() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-gray-900">Page not found</h1>
      <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
        ← Back to contacts
      </Link>
    </section>
  );
}
