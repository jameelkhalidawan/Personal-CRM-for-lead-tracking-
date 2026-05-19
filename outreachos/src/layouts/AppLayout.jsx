import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-content px-6 py-8 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
