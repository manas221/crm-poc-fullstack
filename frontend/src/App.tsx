import { Route, Routes } from 'react-router';
import { ContactsDetailView } from './pages/ContactsDetailView';
import { ContactsListView } from './pages/ContactsListView';
import { NotFoundView } from './pages/NotFoundView';

export function App() {
  return (
    <main className="mx-auto max-w-screen-2xl px-6 py-8">
      <Routes>
        <Route path="/" element={<ContactsListView />} />
        <Route path="/contacts/:id" element={<ContactsDetailView />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </main>
  );
}
