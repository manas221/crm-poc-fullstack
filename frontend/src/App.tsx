import { Route, Routes } from 'react-router';

// Placeholder shell: the contacts list and detail routes are added in later checklist items.
export default function App() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
      <Routes>
        <Route path="/" element={<p className="mt-4 text-gray-600">Scaffold is running.</p>} />
      </Routes>
    </main>
  );
}
