import { Route, Routes } from 'react-router';
import { ContactsPage } from './features/contacts/ContactsPage.tsx';

export default function App() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
      <Routes>
        <Route path="/" element={<ContactsPage />} />
      </Routes>
    </main>
  );
}
